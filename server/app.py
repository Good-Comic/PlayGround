from __future__ import annotations

import json
import difflib
import ipaddress
import mimetypes
import os
import re
import shutil
import sqlite3
import subprocess
import threading
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any
from urllib.parse import parse_qs, unquote, urlparse

try:
    from server.providers import AgentRequest, PROVIDER_CATALOG, ProviderCancelled, ProviderError, build_provider
    from server.github_integration import (
        GitHubIntegrationError, MockGitHubApp, RealGitHubApp, WebhookAuthenticationError,
        WebhookReplayError, approve_commit, create_pull_request, get_change, get_repository,
        github_config_status, ingest_webhook, init_github_db, list_changes, list_deliveries,
        list_repositories, prepare_change, process_delivery, push_change, reconcile_repository,
        register_repository,
    )
except ModuleNotFoundError:  # Container executes this file directly.
    from providers import AgentRequest, PROVIDER_CATALOG, ProviderCancelled, ProviderError, build_provider
    from github_integration import (
        GitHubIntegrationError, MockGitHubApp, RealGitHubApp, WebhookAuthenticationError,
        WebhookReplayError, approve_commit, create_pull_request, get_change, get_repository,
        github_config_status, ingest_webhook, init_github_db, list_changes, list_deliveries,
        list_repositories, prepare_change, process_delivery, push_change, reconcile_repository,
        register_repository,
    )


DB_PATH = Path(os.environ.get("FORGE_DB_PATH", "/data/forge.db"))
WORKSPACE_ROOT = Path(os.environ.get("FORGE_WORKSPACE_ROOT", "/workspace"))
STATIC_ROOT = Path(__file__).with_name("static")
MAX_TEXT_FILE = 512 * 1024
MAX_PREVIEW_FILE = 20 * 1024 * 1024
MAX_RUN_OUTPUT = 64 * 1024
TASK_ROOT = Path(os.environ.get("FORGE_TASK_ROOT", "/data/agent-tasks"))
MAX_AGENT_FILE = 512 * 1024
TASK_THREADS: dict[int, threading.Thread] = {}
TASK_THREADS_LOCK = threading.Lock()
GIT_SOURCE_ROOT = Path(os.environ.get("FORGE_GIT_SOURCE_ROOT", "/source-repository"))
GIT_TASK_ROOT = Path(os.environ.get("FORGE_GIT_TASK_ROOT", "/data/git-tasks"))
REAL_GITHUB_APP = RealGitHubApp()


def init_db(db_path: Path) -> None:
    db_path.parent.mkdir(parents=True, exist_ok=True)
    with sqlite3.connect(db_path) as connection:
        connection.executescript(
            """
            CREATE TABLE IF NOT EXISTS projects (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                relative_path TEXT NOT NULL UNIQUE,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                project_id INTEGER,
                kind TEXT NOT NULL,
                message TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(project_id) REFERENCES projects(id)
            );
            CREATE TABLE IF NOT EXISTS runs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                project_id INTEGER NOT NULL,
                action TEXT NOT NULL,
                status TEXT NOT NULL,
                command TEXT NOT NULL,
                exit_code INTEGER,
                output TEXT NOT NULL DEFAULT '',
                started_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                finished_at TEXT,
                FOREIGN KEY(project_id) REFERENCES projects(id)
            );
            CREATE TABLE IF NOT EXISTS providers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                kind TEXT NOT NULL,
                base_url TEXT NOT NULL,
                model_id TEXT NOT NULL,
                timeout_seconds REAL NOT NULL,
                retries INTEGER NOT NULL,
                max_input_tokens INTEGER NOT NULL,
                max_output_tokens INTEGER NOT NULL,
                max_cost_usd REAL NOT NULL,
                input_cost_per_million REAL NOT NULL,
                output_cost_per_million REAL NOT NULL,
                supports_tool_calls INTEGER,
                supports_json INTEGER,
                context_window INTEGER,
                fallback_provider_id INTEGER,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS agent_tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                project_id INTEGER NOT NULL,
                provider_id INTEGER NOT NULL,
                used_provider_id INTEGER,
                instruction TEXT NOT NULL,
                requested_mode TEXT NOT NULL,
                effective_mode TEXT NOT NULL,
                target_path TEXT NOT NULL DEFAULT '',
                status TEXT NOT NULL,
                attempt INTEGER NOT NULL DEFAULT 1,
                cancel_requested INTEGER NOT NULL DEFAULT 0,
                summary TEXT NOT NULL DEFAULT '',
                proposal_json TEXT NOT NULL DEFAULT '[]',
                diff TEXT NOT NULL DEFAULT '',
                usage_input_tokens INTEGER NOT NULL DEFAULT 0,
                usage_output_tokens INTEGER NOT NULL DEFAULT 0,
                cost_usd REAL NOT NULL DEFAULT 0,
                error TEXT NOT NULL DEFAULT '',
                workspace_path TEXT NOT NULL DEFAULT '',
                validation_output TEXT NOT NULL DEFAULT '',
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(project_id) REFERENCES projects(id),
                FOREIGN KEY(provider_id) REFERENCES providers(id)
            );
            CREATE TABLE IF NOT EXISTS agent_task_events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                task_id INTEGER NOT NULL,
                from_status TEXT,
                to_status TEXT NOT NULL,
                message TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(task_id) REFERENCES agent_tasks(id)
            );
            """
        )
        provider_columns = {row[1] for row in connection.execute("PRAGMA table_info(providers)")}
        if "fallback_provider_id" not in provider_columns:
            connection.execute("ALTER TABLE providers ADD COLUMN fallback_provider_id INTEGER")
        task_columns = {row[1] for row in connection.execute("PRAGMA table_info(agent_tasks)")}
        if "used_provider_id" not in task_columns:
            connection.execute("ALTER TABLE agent_tasks ADD COLUMN used_provider_id INTEGER")
        connection.execute(
            """
            INSERT OR IGNORE INTO providers(
                name, kind, base_url, model_id, timeout_seconds, retries,
                max_input_tokens, max_output_tokens, max_cost_usd,
                input_cost_per_million, output_cost_per_million,
                supports_tool_calls, supports_json, context_window
            ) VALUES ('Built-in Mock', 'mock', 'mock://internal', 'forge-mock-v1', 5, 0,
                      8192, 2048, 0, 0, 0, 1, 1, 8192)
            """
        )
        interrupted = connection.execute(
            "SELECT id, status FROM agent_tasks WHERE status IN ('queued', 'running', 'approved', 'validating')"
        ).fetchall()
        for task_id, old_status in interrupted:
            connection.execute(
                """
                UPDATE agent_tasks SET status = 'failed', error = 'Studio restarted before task completion',
                    updated_at = CURRENT_TIMESTAMP WHERE id = ?
                """,
                (task_id,),
            )
            connection.execute(
                """
                INSERT INTO agent_task_events(task_id, from_status, to_status, message)
                VALUES (?, ?, 'failed', 'Studio restart interrupted the task; retry is available.')
                """,
                (task_id, old_status),
            )
    init_github_db(db_path)


def resolve_project_path(raw_path: str, workspace_root: Path = WORKSPACE_ROOT) -> tuple[Path, str]:
    if not isinstance(raw_path, str) or not raw_path.strip():
        raise ValueError("path is required")
    candidate_text = raw_path.strip()
    if Path(candidate_text).is_absolute():
        raise ValueError("absolute paths are not allowed")
    root = workspace_root.resolve(strict=True)
    candidate = (root / candidate_text).resolve(strict=True)
    if candidate == root or root not in candidate.parents:
        raise ValueError("path must be a directory inside the workspace")
    if not candidate.is_dir():
        raise ValueError("project path must be a directory")
    return candidate, candidate.relative_to(root).as_posix()


def list_projects(db_path: Path = DB_PATH) -> list[dict[str, Any]]:
    with sqlite3.connect(db_path) as connection:
        connection.row_factory = sqlite3.Row
        return [dict(row) for row in connection.execute(
            "SELECT id, name, relative_path, created_at FROM projects ORDER BY id"
        )]


def get_project(project_id: int, db_path: Path = DB_PATH) -> dict[str, Any]:
    with sqlite3.connect(db_path) as connection:
        connection.row_factory = sqlite3.Row
        row = connection.execute(
            "SELECT id, name, relative_path, created_at FROM projects WHERE id = ?", (project_id,)
        ).fetchone()
    if row is None:
        raise LookupError("project not found")
    return dict(row)


def import_project(raw_path: str, db_path: Path = DB_PATH, workspace_root: Path = WORKSPACE_ROOT) -> dict[str, Any]:
    project_path, relative_path = resolve_project_path(raw_path, workspace_root)
    with sqlite3.connect(db_path) as connection:
        connection.row_factory = sqlite3.Row
        connection.execute(
            "INSERT OR IGNORE INTO projects(name, relative_path) VALUES (?, ?)",
            (project_path.name, relative_path),
        )
        row = connection.execute(
            "SELECT id, name, relative_path, created_at FROM projects WHERE relative_path = ?",
            (relative_path,),
        ).fetchone()
        connection.execute(
            "INSERT INTO events(project_id, kind, message) VALUES (?, 'project.imported', ?)",
            (row["id"], f"Imported {relative_path}"),
        )
        return dict(row)


def project_root(project_id: int, db_path: Path = DB_PATH, workspace_root: Path = WORKSPACE_ROOT) -> Path:
    project = get_project(project_id, db_path)
    root, _ = resolve_project_path(project["relative_path"], workspace_root)
    return root


def resolve_project_file(
    project_id: int,
    raw_path: str,
    db_path: Path = DB_PATH,
    workspace_root: Path = WORKSPACE_ROOT,
) -> Path:
    if not isinstance(raw_path, str) or not raw_path.strip():
        raise ValueError("file path is required")
    relative = Path(unquote(raw_path.strip()))
    if relative.is_absolute() or ".." in relative.parts or ".git" in relative.parts:
        raise ValueError("file path is not allowed")
    root = project_root(project_id, db_path, workspace_root)
    candidate = (root / relative).resolve(strict=True)
    if root not in candidate.parents or not candidate.is_file():
        raise ValueError("file must be inside the selected project")
    return candidate


def list_project_files(
    project_id: int,
    db_path: Path = DB_PATH,
    workspace_root: Path = WORKSPACE_ROOT,
    limit: int = 1000,
) -> list[dict[str, Any]]:
    root = project_root(project_id, db_path, workspace_root)
    files: list[dict[str, Any]] = []
    for item in sorted(root.rglob("*")):
        relative = item.relative_to(root)
        if ".git" in relative.parts or not item.is_file():
            continue
        files.append({"path": relative.as_posix(), "size": item.stat().st_size})
        if len(files) >= limit:
            break
    return files


def read_project_text(
    project_id: int,
    raw_path: str,
    db_path: Path = DB_PATH,
    workspace_root: Path = WORKSPACE_ROOT,
) -> dict[str, Any]:
    item = resolve_project_file(project_id, raw_path, db_path, workspace_root)
    if item.stat().st_size > MAX_TEXT_FILE:
        raise ValueError("file is too large to view")
    try:
        content = item.read_text(encoding="utf-8")
    except UnicodeDecodeError as exc:
        raise ValueError("binary files cannot be viewed as text") from exc
    return {"path": raw_path, "content": content}


def project_changes(project_id: int, db_path: Path = DB_PATH, workspace_root: Path = WORKSPACE_ROOT) -> dict[str, Any]:
    return {
        "project_id": project_id,
        "source": "filesystem-inventory",
        "note": "Git diff classification is not enabled; files are read-only inventory.",
        "files": list_project_files(project_id, db_path, workspace_root, limit=200),
    }


def _run_command(command: list[str], cwd: Path) -> tuple[int, str]:
    environment = {
        "PATH": os.environ.get("PATH", "/usr/local/bin:/usr/bin:/bin"),
        "HOME": "/tmp",
        "CI": "1",
        "NO_COLOR": "1",
    }
    try:
        completed = subprocess.run(
            command,
            cwd=cwd,
            env=environment,
            capture_output=True,
            text=True,
            timeout=60,
            check=False,
        )
        output = (completed.stdout + completed.stderr)[-MAX_RUN_OUTPUT:]
        return completed.returncode, output
    except subprocess.TimeoutExpired as exc:
        output = ((exc.stdout or "") + (exc.stderr or ""))[-MAX_RUN_OUTPUT:]
        return 124, output + "\nCommand timed out after 60 seconds."


def run_project_action(
    project_id: int,
    action: str,
    db_path: Path = DB_PATH,
    workspace_root: Path = WORKSPACE_ROOT,
) -> dict[str, Any]:
    root = project_root(project_id, db_path, workspace_root)
    if action == "test":
        script = root / "scripts" / "validate-locales.mjs"
        if not script.is_file():
            raise ValueError("no allowlisted test command is available for this project")
        commands = [["node", "scripts/validate-locales.mjs"]]
        label = "node scripts/validate-locales.mjs"
    elif action == "build":
        scripts = [
            item.relative_to(root).as_posix()
            for item in sorted(root.rglob("*.js"))
            if ".git" not in item.relative_to(root).parts
        ]
        if not scripts or not (root / "index.html").is_file():
            raise ValueError("static game build inputs are incomplete")
        commands = [["node", "--check", script] for script in scripts]
        label = f"static build validation: index.html + {len(scripts)} JavaScript files"
    else:
        raise ValueError("action must be build or test")

    with sqlite3.connect(db_path) as connection:
        cursor = connection.execute(
            "INSERT INTO runs(project_id, action, status, command) VALUES (?, ?, 'running', ?)",
            (project_id, action, label),
        )
        run_id = cursor.lastrowid

    output_parts = []
    exit_code = 0
    for command in commands:
        code, output = _run_command(command, root)
        output_parts.append(f"$ {' '.join(command)}\n{output}".rstrip())
        if code != 0:
            exit_code = code
            break
    combined = "\n\n".join(output_parts)[-MAX_RUN_OUTPUT:]
    status = "passed" if exit_code == 0 else "failed"
    with sqlite3.connect(db_path) as connection:
        connection.execute(
            "UPDATE runs SET status = ?, exit_code = ?, output = ?, finished_at = CURRENT_TIMESTAMP WHERE id = ?",
            (status, exit_code, combined, run_id),
        )
        connection.execute(
            "INSERT INTO events(project_id, kind, message) VALUES (?, ?, ?)",
            (project_id, f"run.{status}", f"{action} run #{run_id}: {status}"),
        )
    return get_run(run_id, db_path)


def get_run(run_id: int, db_path: Path = DB_PATH) -> dict[str, Any]:
    with sqlite3.connect(db_path) as connection:
        connection.row_factory = sqlite3.Row
        row = connection.execute("SELECT * FROM runs WHERE id = ?", (run_id,)).fetchone()
    if row is None:
        raise LookupError("run not found")
    return dict(row)


def list_runs(project_id: int, db_path: Path = DB_PATH) -> list[dict[str, Any]]:
    get_project(project_id, db_path)
    with sqlite3.connect(db_path) as connection:
        connection.row_factory = sqlite3.Row
        return [dict(row) for row in connection.execute(
            "SELECT * FROM runs WHERE project_id = ? ORDER BY id DESC LIMIT 50", (project_id,)
        )]


def _provider_public(row: dict[str, Any]) -> dict[str, Any]:
    public = dict(row)
    public["supports_tool_calls"] = None if row["supports_tool_calls"] is None else bool(row["supports_tool_calls"])
    public["supports_json"] = None if row["supports_json"] is None else bool(row["supports_json"])
    public["location"] = "internal" if row["kind"] == "mock" else ("local" if row["kind"] == "ollama" else "cloud")
    public["api_key_configured"] = row["kind"] != "openai-compatible" or bool(os.environ.get("FORGE_OPENAI_API_KEY"))
    return public


def list_providers(db_path: Path = DB_PATH) -> list[dict[str, Any]]:
    with sqlite3.connect(db_path) as connection:
        connection.row_factory = sqlite3.Row
        return [_provider_public(dict(row)) for row in connection.execute("SELECT * FROM providers ORDER BY id")]


def get_provider(provider_id: int, db_path: Path = DB_PATH, public: bool = False) -> dict[str, Any]:
    with sqlite3.connect(db_path) as connection:
        connection.row_factory = sqlite3.Row
        row = connection.execute("SELECT * FROM providers WHERE id = ?", (provider_id,)).fetchone()
    if row is None:
        raise LookupError("provider not found")
    provider = dict(row)
    return _provider_public(provider) if public else provider


def _number(payload: dict[str, Any], name: str, default: float, minimum: float, maximum: float) -> float:
    try:
        value = float(payload.get(name, default))
    except (TypeError, ValueError) as exc:
        raise ValueError(f"{name} must be numeric") from exc
    if value < minimum or value > maximum:
        raise ValueError(f"{name} must be between {minimum} and {maximum}")
    return value


def _capability(payload: dict[str, Any], name: str) -> int | None:
    value = payload.get(name)
    if value is None:
        return None
    if not isinstance(value, bool):
        raise ValueError(f"{name} must be true, false, or null")
    return int(value)


def _validate_base_url(kind: str, raw_url: Any) -> str:
    if kind == "mock":
        return "mock://internal"
    if not isinstance(raw_url, str) or not raw_url.strip():
        raise ValueError("base_url is required")
    parsed = urlparse(raw_url.strip())
    if parsed.username or parsed.password or parsed.query or parsed.fragment or not parsed.hostname:
        raise ValueError("base_url cannot contain credentials, query, or fragment")
    if kind == "openai-compatible" and parsed.scheme != "https":
        raise ValueError("cloud provider base_url must use HTTPS")
    if kind == "openai-compatible":
        if parsed.hostname in {"localhost", "host.docker.internal"}:
            raise ValueError("cloud provider base_url cannot target a local endpoint")
        try:
            cloud_address = ipaddress.ip_address(parsed.hostname)
        except ValueError:
            cloud_address = None
        if cloud_address and (cloud_address.is_private or cloud_address.is_loopback or cloud_address.is_link_local):
            raise ValueError("cloud provider base_url cannot target a private IP")
    if kind == "ollama":
        if parsed.scheme not in {"http", "https"}:
            raise ValueError("Ollama base_url must use HTTP or HTTPS")
        allowed_names = {"localhost", "host.docker.internal"}
        if parsed.hostname not in allowed_names:
            try:
                address = ipaddress.ip_address(parsed.hostname)
            except ValueError as exc:
                raise ValueError("Ollama endpoint must use localhost, host.docker.internal, or a private IP") from exc
            if address.is_link_local or not (address.is_loopback or address.is_private):
                raise ValueError("Ollama endpoint must use a loopback or private IP")
    return raw_url.strip().rstrip("/") + "/"


def create_provider(payload: dict[str, Any], db_path: Path = DB_PATH) -> dict[str, Any]:
    forbidden = {"api_key", "token", "authorization", "secret"}.intersection(key.lower() for key in payload)
    if forbidden:
        raise ValueError("API credentials must be configured on the server, not submitted to this endpoint")
    kind = str(payload.get("kind", ""))
    if kind not in {"ollama", "openai-compatible"}:
        raise ValueError("kind must be ollama or openai-compatible")
    name = str(payload.get("name", "")).strip()
    model_id = str(payload.get("model_id", "")).strip()
    if not name or len(name) > 80:
        raise ValueError("name must be between 1 and 80 characters")
    if not model_id or len(model_id) > 200 or not re.fullmatch(r"[A-Za-z0-9._:/-]+", model_id):
        raise ValueError("model_id is invalid")
    base_url = _validate_base_url(kind, payload.get("base_url"))
    timeout = _number(payload, "timeout_seconds", 30, 1, 120)
    retries = int(_number(payload, "retries", 1, 0, 3))
    max_input = int(_number(payload, "max_input_tokens", 8192, 256, 1_000_000))
    max_output = int(_number(payload, "max_output_tokens", 2048, 64, 100_000))
    max_cost = _number(payload, "max_cost_usd", 0 if kind == "ollama" else 1, 0, 1000)
    input_cost = _number(payload, "input_cost_per_million", 0, 0, 10_000)
    output_cost = _number(payload, "output_cost_per_million", 0, 0, 10_000)
    context_window = payload.get("context_window")
    if context_window is not None:
        context_window = int(_number(payload, "context_window", 0, 256, 10_000_000))
    fallback_provider_id = payload.get("fallback_provider_id")
    if fallback_provider_id in {None, ""}:
        fallback_provider_id = None
    else:
        try:
            fallback_provider_id = int(fallback_provider_id)
        except (TypeError, ValueError) as exc:
            raise ValueError("fallback_provider_id must be an existing provider") from exc
        get_provider(fallback_provider_id, db_path)
    with sqlite3.connect(db_path) as connection:
        cursor = connection.execute(
            """
            INSERT INTO providers(
                name, kind, base_url, model_id, timeout_seconds, retries, max_input_tokens,
                max_output_tokens, max_cost_usd, input_cost_per_million, output_cost_per_million,
                supports_tool_calls, supports_json, context_window, fallback_provider_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                name, kind, base_url, model_id, timeout, retries, max_input, max_output, max_cost,
                input_cost, output_cost, _capability(payload, "supports_tool_calls"),
                _capability(payload, "supports_json"), context_window, fallback_provider_id,
            ),
        )
        provider_id = cursor.lastrowid
    return get_provider(provider_id, db_path, public=True)


def diagnose_provider(provider_id: int, db_path: Path = DB_PATH) -> dict[str, Any]:
    config = get_provider(provider_id, db_path)
    started = __import__("time").monotonic()
    try:
        result = build_provider(config).diagnose()
        result["latency_ms"] = round((__import__("time").monotonic() - started) * 1000)
        return result
    except ProviderError as exc:
        return {"status": "error", "message": str(exc), "models": [], "latency_ms": round((__import__("time").monotonic() - started) * 1000)}


def _task_row(row: sqlite3.Row | None) -> dict[str, Any]:
    if row is None:
        raise LookupError("agent task not found")
    task = dict(row)
    task["cancel_requested"] = bool(task["cancel_requested"])
    task["proposal"] = json.loads(task.pop("proposal_json"))
    return task


def get_agent_task(task_id: int, db_path: Path = DB_PATH) -> dict[str, Any]:
    with sqlite3.connect(db_path) as connection:
        connection.row_factory = sqlite3.Row
        row = connection.execute("SELECT * FROM agent_tasks WHERE id = ?", (task_id,)).fetchone()
        task = _task_row(row)
        task["events"] = [dict(item) for item in connection.execute(
            "SELECT id, from_status, to_status, message, created_at FROM agent_task_events WHERE task_id = ? ORDER BY id",
            (task_id,),
        )]
    return task


def list_agent_tasks(project_id: int | None = None, db_path: Path = DB_PATH) -> list[dict[str, Any]]:
    with sqlite3.connect(db_path) as connection:
        connection.row_factory = sqlite3.Row
        if project_id is None:
            rows = connection.execute("SELECT * FROM agent_tasks ORDER BY id DESC LIMIT 100").fetchall()
        else:
            get_project(project_id, db_path)
            rows = connection.execute(
                "SELECT * FROM agent_tasks WHERE project_id = ? ORDER BY id DESC LIMIT 100", (project_id,)
            ).fetchall()
    return [_task_row(row) for row in rows]


def _transition(task_id: int, new_status: str, message: str, db_path: Path = DB_PATH, **fields: Any) -> None:
    with sqlite3.connect(db_path) as connection:
        current = connection.execute("SELECT status FROM agent_tasks WHERE id = ?", (task_id,)).fetchone()
        if current is None:
            raise LookupError("agent task not found")
        assignments = ["status = ?", "updated_at = CURRENT_TIMESTAMP"]
        values: list[Any] = [new_status]
        allowed = {
            "summary", "proposal_json", "diff", "usage_input_tokens", "usage_output_tokens",
            "cost_usd", "error", "workspace_path", "validation_output", "cancel_requested",
            "used_provider_id", "effective_mode",
        }
        for key, value in fields.items():
            if key not in allowed:
                raise ValueError("invalid task update")
            assignments.append(f"{key} = ?")
            values.append(value)
        values.append(task_id)
        connection.execute(f"UPDATE agent_tasks SET {', '.join(assignments)} WHERE id = ?", values)
        connection.execute(
            "INSERT INTO agent_task_events(task_id, from_status, to_status, message) VALUES (?, ?, ?, ?)",
            (task_id, current[0], new_status, message[:1000]),
        )


def _task_cancelled(task_id: int, db_path: Path) -> bool:
    with sqlite3.connect(db_path) as connection:
        row = connection.execute("SELECT cancel_requested, status FROM agent_tasks WHERE id = ?", (task_id,)).fetchone()
    return row is None or bool(row[0]) or row[1] == "cancelled"


def _copy_project(source: Path, destination: Path) -> None:
    destination.mkdir(parents=True, exist_ok=False)
    total = 0
    for item in sorted(source.rglob("*")):
        relative = item.relative_to(source)
        if ".git" in relative.parts:
            continue
        if item.is_symlink():
            raise ValueError("project symlinks are not allowed in agent workspaces")
        target = destination / relative
        if item.is_dir():
            target.mkdir(parents=True, exist_ok=True)
        elif item.is_file():
            total += item.stat().st_size
            if total > 100 * 1024 * 1024:
                raise ValueError("project exceeds the 100 MiB agent workspace limit")
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(item, target)


def _proposal_diff(path: str, before: str, after: str) -> str:
    return "".join(difflib.unified_diff(
        before.splitlines(keepends=True), after.splitlines(keepends=True),
        fromfile=f"a/{path}", tofile=f"b/{path}",
    ))


def _run_agent_task(task_id: int, db_path: Path, workspace_root: Path, task_root: Path) -> None:
    try:
        task = get_agent_task(task_id, db_path)
        if task["status"] != "queued" or task["cancel_requested"]:
            return
        _transition(task_id, "running", "Provider execution started.", db_path)
        provider_config = get_provider(task["provider_id"], db_path)
        source = project_root(task["project_id"], db_path, workspace_root)
        files = list_project_files(task["project_id"], db_path, workspace_root, limit=200)
        file_summary = [f"{item['path']} ({item['size']} bytes)" for item in files]
        current_content = ""
        if task["target_path"]:
            target = resolve_project_file(task["project_id"], task["target_path"], db_path, workspace_root)
            if target.stat().st_size > MAX_AGENT_FILE:
                raise ValueError("target file exceeds the agent file limit")
            current_content = target.read_text(encoding="utf-8")
        request = AgentRequest(
            instruction=task["instruction"], mode=task["effective_mode"], target_path=task["target_path"],
            current_content=current_content, file_summary=file_summary,
        )
        used_provider_id = provider_config["id"]
        try:
            result = build_provider(provider_config).generate(request, lambda: _task_cancelled(task_id, db_path))
        except ProviderError as primary_error:
            fallback_id = provider_config.get("fallback_provider_id")
            if not fallback_id:
                raise
            fallback = get_provider(int(fallback_id), db_path)
            fallback_mode = task["effective_mode"]
            if fallback_mode != "plan" and fallback["supports_tool_calls"] != 1:
                fallback_mode = "plan"
            request = AgentRequest(
                instruction=task["instruction"], mode=fallback_mode, target_path=task["target_path"],
                current_content=current_content, file_summary=file_summary,
            )
            with sqlite3.connect(db_path) as connection:
                connection.execute(
                    "UPDATE agent_tasks SET effective_mode = ?, used_provider_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                    (fallback_mode, fallback["id"], task_id),
                )
                connection.execute(
                    """
                    INSERT INTO agent_task_events(task_id, from_status, to_status, message)
                    VALUES (?, 'running', 'running', ?)
                    """,
                    (task_id, f"Primary provider failed ({primary_error}); fallback provider #{fallback['id']} selected."),
                )
            task["effective_mode"] = fallback_mode
            used_provider_id = fallback["id"]
            result = build_provider(fallback).generate(request, lambda: _task_cancelled(task_id, db_path))
        if _task_cancelled(task_id, db_path):
            raise ProviderCancelled("task cancellation requested")
        if task["effective_mode"] == "plan":
            _transition(
                task_id, "completed", "Plan completed without modifying files.", db_path,
                summary=result.summary, usage_input_tokens=result.input_tokens,
                usage_output_tokens=result.output_tokens, cost_usd=result.cost_usd, used_provider_id=used_provider_id,
            )
            return
        if len(result.edits) != 1 or result.edits[0]["path"] != task["target_path"]:
            raise ValueError("provider proposal must edit exactly the approved target path")
        proposed_content = result.edits[0]["content"]
        if len(proposed_content.encode()) > MAX_AGENT_FILE:
            raise ValueError("proposed file exceeds the agent file limit")
        diff = _proposal_diff(task["target_path"], current_content, proposed_content)
        if not diff:
            raise ValueError("provider proposal contains no changes")
        sandbox = task_root / str(task_id) / f"attempt-{task['attempt']}" / "project"
        _copy_project(source, sandbox)
        _transition(
            task_id, "awaiting_approval", "Proposal is ready for explicit approval.", db_path,
            summary=result.summary, proposal_json=json.dumps(result.edits, ensure_ascii=False), diff=diff,
            usage_input_tokens=result.input_tokens, usage_output_tokens=result.output_tokens,
            cost_usd=result.cost_usd, workspace_path=str(sandbox), used_provider_id=used_provider_id,
        )
    except ProviderCancelled as exc:
        _transition(task_id, "cancelled", str(exc), db_path, error=str(exc))
    except (ProviderError, ValueError, LookupError, OSError, UnicodeDecodeError, sqlite3.Error) as exc:
        _transition(task_id, "failed", "Task failed without changing the source project.", db_path, error=str(exc))
    finally:
        with TASK_THREADS_LOCK:
            TASK_THREADS.pop(task_id, None)


def _start_task_thread(task_id: int, db_path: Path, workspace_root: Path, task_root: Path) -> None:
    thread = threading.Thread(
        target=_run_agent_task, args=(task_id, db_path, workspace_root, task_root),
        name=f"forge-agent-{task_id}", daemon=True,
    )
    with TASK_THREADS_LOCK:
        TASK_THREADS[task_id] = thread
    thread.start()


def create_agent_task(
    payload: dict[str, Any], db_path: Path = DB_PATH, workspace_root: Path = WORKSPACE_ROOT,
    task_root: Path = TASK_ROOT, start: bool = True,
) -> dict[str, Any]:
    try:
        project_id = int(payload.get("project_id"))
        provider_id = int(payload.get("provider_id"))
    except (TypeError, ValueError) as exc:
        raise ValueError("project_id and provider_id are required") from exc
    get_project(project_id, db_path)
    provider = get_provider(provider_id, db_path)
    instruction = str(payload.get("instruction", "")).strip()
    requested_mode = str(payload.get("mode", "plan"))
    target_path = str(payload.get("target_path", "")).strip()
    if not instruction or len(instruction) > 4000:
        raise ValueError("instruction must be between 1 and 4000 characters")
    if requested_mode not in {"plan", "edit", "test"}:
        raise ValueError("mode must be plan, edit, or test")
    if requested_mode in {"edit", "test"}:
        if not target_path:
            raise ValueError("edit and test modes require target_path")
        resolve_project_file(project_id, target_path, db_path, workspace_root)
    effective_mode = requested_mode
    if requested_mode != "plan" and provider["supports_tool_calls"] != 1:
        effective_mode = "plan"
    with sqlite3.connect(db_path) as connection:
        cursor = connection.execute(
            """
            INSERT INTO agent_tasks(
                project_id, provider_id, instruction, requested_mode, effective_mode, target_path, status
            ) VALUES (?, ?, ?, ?, ?, ?, 'queued')
            """,
            (project_id, provider_id, instruction, requested_mode, effective_mode, target_path),
        )
        task_id = cursor.lastrowid
        message = "Task queued."
        if effective_mode != requested_mode:
            message = "Task queued in plan mode because tool-call capability is not confirmed."
        connection.execute(
            "INSERT INTO agent_task_events(task_id, from_status, to_status, message) VALUES (?, NULL, 'queued', ?)",
            (task_id, message),
        )
    if start:
        _start_task_thread(task_id, db_path, workspace_root, task_root)
    return get_agent_task(task_id, db_path)


def cancel_agent_task(task_id: int, db_path: Path = DB_PATH) -> dict[str, Any]:
    task = get_agent_task(task_id, db_path)
    if task["status"] not in {"queued", "running"}:
        raise ValueError("only queued or running tasks can be cancelled")
    if task["status"] == "queued":
        _transition(task_id, "cancelled", "Task cancelled before provider execution.", db_path, cancel_requested=1)
    else:
        with sqlite3.connect(db_path) as connection:
            connection.execute(
                "UPDATE agent_tasks SET cancel_requested = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?", (task_id,)
            )
            connection.execute(
                "INSERT INTO agent_task_events(task_id, from_status, to_status, message) VALUES (?, 'running', 'running', ?)",
                (task_id, "Cancellation requested; the provider timeout remains the hard stop."),
            )
    return get_agent_task(task_id, db_path)


def retry_agent_task(
    task_id: int, db_path: Path = DB_PATH, workspace_root: Path = WORKSPACE_ROOT, task_root: Path = TASK_ROOT,
) -> dict[str, Any]:
    task = get_agent_task(task_id, db_path)
    if task["status"] not in {"failed", "cancelled"}:
        raise ValueError("only failed or cancelled tasks can be retried")
    with sqlite3.connect(db_path) as connection:
        connection.execute(
            """
            UPDATE agent_tasks SET status = 'queued', attempt = attempt + 1, cancel_requested = 0,
                summary = '', proposal_json = '[]', diff = '', error = '', workspace_path = '',
                validation_output = '', updated_at = CURRENT_TIMESTAMP WHERE id = ?
            """,
            (task_id,),
        )
        connection.execute(
            "INSERT INTO agent_task_events(task_id, from_status, to_status, message) VALUES (?, ?, 'queued', ?)",
            (task_id, task["status"], "Task queued for retry."),
        )
    _start_task_thread(task_id, db_path, workspace_root, task_root)
    return get_agent_task(task_id, db_path)


def _validate_agent_workspace(root: Path) -> tuple[int, str]:
    scripts = [
        item.relative_to(root).as_posix() for item in sorted(root.rglob("*.js"))
        if ".git" not in item.relative_to(root).parts and not item.is_symlink()
    ]
    commands = [["node", "--check", script] for script in scripts]
    if (root / "scripts" / "validate-locales.mjs").is_file():
        commands.append(["node", "scripts/validate-locales.mjs"])
    if not commands:
        return 1, "No allowlisted validation command is available."
    outputs = []
    for command in commands:
        code, output = _run_command(command, root)
        outputs.append(f"$ {' '.join(command)}\n{output}".rstrip())
        if code:
            return code, "\n\n".join(outputs)[-MAX_RUN_OUTPUT:]
    return 0, "\n\n".join(outputs)[-MAX_RUN_OUTPUT:]


def approve_agent_task(task_id: int, db_path: Path = DB_PATH, workspace_root: Path = WORKSPACE_ROOT) -> dict[str, Any]:
    task = get_agent_task(task_id, db_path)
    if task["status"] != "awaiting_approval":
        raise ValueError("task is not awaiting approval")
    sandbox = Path(task["workspace_path"])
    if not sandbox.is_dir():
        raise ValueError("task workspace is unavailable")
    _transition(task_id, "approved", "Proposal explicitly approved for the isolated workspace.", db_path)
    proposal = task["proposal"]
    target = sandbox / task["target_path"]
    sandbox_resolved = sandbox.resolve(strict=True)
    target_resolved = target.resolve(strict=True)
    if sandbox_resolved not in target_resolved.parents or len(proposal) != 1:
        _transition(task_id, "failed", "Proposal path validation failed.", db_path, error="invalid proposal path")
        return get_agent_task(task_id, db_path)
    target.write_text(proposal[0]["content"], encoding="utf-8")
    _transition(task_id, "validating", "Running fixed build and test commands in the isolated workspace.", db_path)
    code, output = _validate_agent_workspace(sandbox)
    if code:
        _transition(task_id, "failed", "Sandbox validation failed; source project remains unchanged.", db_path, validation_output=output, error="validation failed")
    else:
        _transition(task_id, "completed", "Sandbox validation passed; source project remains unchanged.", db_path, validation_output=output)
    return get_agent_task(task_id, db_path)


def rollback_agent_task(task_id: int, db_path: Path = DB_PATH, workspace_root: Path = WORKSPACE_ROOT) -> dict[str, Any]:
    task = get_agent_task(task_id, db_path)
    if task["status"] not in {"awaiting_approval", "completed", "failed"} or not task["workspace_path"]:
        raise ValueError("task has no sandbox proposal to roll back")
    source = resolve_project_file(task["project_id"], task["target_path"], db_path, workspace_root)
    sandbox = Path(task["workspace_path"]).resolve(strict=True)
    target = (sandbox / task["target_path"]).resolve(strict=True)
    if sandbox not in target.parents:
        raise ValueError("task workspace path is invalid")
    shutil.copyfile(source, target)
    _transition(task_id, "rolled_back", "Sandbox restored from the read-only source project.", db_path)
    return get_agent_task(task_id, db_path)


class ForgeHandler(SimpleHTTPRequestHandler):
    server_version = "ProjectForge/0.3"

    def __init__(self, *args: Any, **kwargs: Any) -> None:
        super().__init__(*args, directory=str(STATIC_ROOT), **kwargs)

    def end_headers(self) -> None:
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("X-Frame-Options", "SAMEORIGIN")
        self.send_header("Referrer-Policy", "no-referrer")
        self.send_header(
            "Content-Security-Policy",
            "default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'; "
            "connect-src 'self'; img-src 'self' data:; font-src 'self'; frame-src 'self'",
        )
        super().end_headers()

    def json_response(self, status: HTTPStatus, payload: Any) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def read_json(self) -> dict[str, Any]:
        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError as exc:
            raise ValueError("invalid content length") from exc
        if length < 1 or length > 16_384:
            raise ValueError("request body must be between 1 and 16384 bytes")
        try:
            payload = json.loads(self.rfile.read(length))
        except json.JSONDecodeError as exc:
            raise ValueError("invalid JSON") from exc
        if not isinstance(payload, dict):
            raise ValueError("JSON body must be an object")
        return payload

    def read_body(self, maximum: int = 1024 * 1024) -> bytes:
        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError as exc:
            raise ValueError("invalid content length") from exc
        if length < 1 or length > maximum:
            raise ValueError(f"request body must be between 1 and {maximum} bytes")
        return self.rfile.read(length)

    def serve_preview(self, project_id: int, raw_path: str) -> None:
        try:
            item = resolve_project_file(project_id, raw_path or "index.html")
            size = item.stat().st_size
            if size > MAX_PREVIEW_FILE:
                raise ValueError("preview file is too large")
            content = item.read_bytes()
        except (ValueError, LookupError, OSError) as exc:
            self.json_response(HTTPStatus.NOT_FOUND, {"error": str(exc)})
            return
        mime, _ = mimetypes.guess_type(item.name)
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", mime or "application/octet-stream")
        self.send_header("Content-Length", str(len(content)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(content)

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path == "/health":
            self.json_response(HTTPStatus.OK, {"status": "ok", "database": "ready", "workspace": "mounted"})
            return
        if parsed.path == "/api/projects":
            self.json_response(HTTPStatus.OK, {"projects": list_projects()})
            return
        if parsed.path == "/api/providers/catalog":
            self.json_response(HTTPStatus.OK, {"providers": PROVIDER_CATALOG})
            return
        if parsed.path == "/api/providers":
            self.json_response(HTTPStatus.OK, {"providers": list_providers()})
            return
        if parsed.path == "/api/github/status":
            self.json_response(HTTPStatus.OK, {
                "configuration": github_config_status(),
                "webhook_reachable": False,
                "message": "Studio is loopback-only; public GitHub webhooks require a separately authorized HTTPS relay.",
            })
            return
        if parsed.path == "/api/github/repositories":
            self.json_response(HTTPStatus.OK, {"repositories": list_repositories(DB_PATH)})
            return
        if parsed.path == "/api/agent/tasks":
            try:
                query = parse_qs(parsed.query)
                raw_project_id = query.get("project_id", [None])[0]
                project_id = None if raw_project_id is None else int(raw_project_id)
                self.json_response(HTTPStatus.OK, {"tasks": list_agent_tasks(project_id)})
            except (ValueError, LookupError) as exc:
                self.json_response(HTTPStatus.BAD_REQUEST, {"error": str(exc)})
            return
        if parsed.path == "/api/changes":
            try:
                query = parse_qs(parsed.query)
                self.json_response(HTTPStatus.OK, project_changes(int(query.get("project_id", ["0"])[0])))
            except (ValueError, LookupError) as exc:
                self.json_response(HTTPStatus.BAD_REQUEST, {"error": str(exc)})
            return

        files_match = re.fullmatch(r"/api/projects/(\d+)/files", parsed.path)
        file_match = re.fullmatch(r"/api/projects/(\d+)/file", parsed.path)
        runs_match = re.fullmatch(r"/api/projects/(\d+)/runs", parsed.path)
        preview_match = re.fullmatch(r"/preview/(\d+)(?:/(.*))?", parsed.path)
        task_match = re.fullmatch(r"/api/agent/tasks/(\d+)", parsed.path)
        github_repo_match = re.fullmatch(r"/api/github/repositories/(\d+)", parsed.path)
        github_deliveries_match = re.fullmatch(r"/api/github/repositories/(\d+)/deliveries", parsed.path)
        github_changes_match = re.fullmatch(r"/api/github/repositories/(\d+)/changes", parsed.path)
        github_change_match = re.fullmatch(r"/api/github/changes/(\d+)", parsed.path)
        try:
            if files_match:
                project_id = int(files_match.group(1))
                self.json_response(HTTPStatus.OK, {"files": list_project_files(project_id)})
                return
            if file_match:
                project_id = int(file_match.group(1))
                query = parse_qs(parsed.query)
                self.json_response(HTTPStatus.OK, read_project_text(project_id, query.get("path", [""])[0]))
                return
            if runs_match:
                project_id = int(runs_match.group(1))
                self.json_response(HTTPStatus.OK, {"runs": list_runs(project_id)})
                return
            if preview_match:
                self.serve_preview(int(preview_match.group(1)), preview_match.group(2) or "index.html")
                return
            if task_match:
                self.json_response(HTTPStatus.OK, {"task": get_agent_task(int(task_match.group(1)))})
                return
            if github_repo_match:
                self.json_response(HTTPStatus.OK, {"repository": get_repository(int(github_repo_match.group(1)), DB_PATH)})
                return
            if github_deliveries_match:
                self.json_response(HTTPStatus.OK, {"deliveries": list_deliveries(int(github_deliveries_match.group(1)), DB_PATH)})
                return
            if github_changes_match:
                self.json_response(HTTPStatus.OK, {"changes": list_changes(int(github_changes_match.group(1)), DB_PATH)})
                return
            if github_change_match:
                self.json_response(HTTPStatus.OK, {"change": get_change(int(github_change_match.group(1)), DB_PATH)})
                return
        except (ValueError, LookupError, OSError, GitHubIntegrationError) as exc:
            self.json_response(HTTPStatus.BAD_REQUEST, {"error": str(exc)})
            return
        super().do_GET()

    def do_POST(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path == "/api/github/webhook":
            try:
                body = self.read_body()
                received = ingest_webhook(
                    body, self.headers.get("X-Hub-Signature-256", ""),
                    self.headers.get("X-GitHub-Delivery", ""), self.headers.get("X-GitHub-Event", ""), DB_PATH,
                )
                result = received if received["duplicate"] else process_delivery(received["delivery_id"], DB_PATH)
            except WebhookAuthenticationError as exc:
                self.json_response(HTTPStatus.UNAUTHORIZED, {"error": str(exc)})
                return
            except WebhookReplayError as exc:
                self.json_response(HTTPStatus.CONFLICT, {"error": str(exc)})
                return
            except (ValueError, GitHubIntegrationError, sqlite3.Error) as exc:
                self.json_response(HTTPStatus.FORBIDDEN, {"error": str(exc)})
                return
            self.json_response(HTTPStatus.ACCEPTED, {"delivery": result})
            return
        if parsed.path == "/api/projects/import-local":
            try:
                payload = self.read_json()
                project = import_project(payload.get("path", ""))
            except (ValueError, OSError, sqlite3.Error) as exc:
                self.json_response(HTTPStatus.BAD_REQUEST, {"error": str(exc)})
                return
            self.json_response(HTTPStatus.CREATED, {"project": project})
            return

        if parsed.path == "/api/providers":
            try:
                provider = create_provider(self.read_json())
            except (ValueError, sqlite3.Error) as exc:
                self.json_response(HTTPStatus.BAD_REQUEST, {"error": str(exc)})
                return
            self.json_response(HTTPStatus.CREATED, {"provider": provider})
            return

        if parsed.path == "/api/github/repositories":
            try:
                repository = register_repository(self.read_json(), DB_PATH)
            except (ValueError, GitHubIntegrationError, sqlite3.Error) as exc:
                self.json_response(HTTPStatus.BAD_REQUEST, {"error": str(exc)})
                return
            self.json_response(HTTPStatus.CREATED, {"repository": repository})
            return

        github_reconcile_match = re.fullmatch(r"/api/github/repositories/(\d+)/reconcile", parsed.path)
        if github_reconcile_match:
            try:
                repo_id = int(github_reconcile_match.group(1))
                repository = get_repository(repo_id, DB_PATH)
                if repository["mode"] != "mock":
                    raise GitHubIntegrationError("real reconciliation requires configured GitHub App credentials")
                result = reconcile_repository(repo_id, DB_PATH, MockGitHubApp(DB_PATH))
            except (ValueError, GitHubIntegrationError, sqlite3.Error) as exc:
                self.json_response(HTTPStatus.BAD_REQUEST, {"error": str(exc)})
                return
            self.json_response(HTTPStatus.OK, {"reconciliation": result})
            return

        if parsed.path == "/api/github/changes/prepare":
            try:
                payload = self.read_json()
                change = prepare_change(
                    int(payload.get("task_id")), int(payload.get("repo_id")), DB_PATH,
                    GIT_SOURCE_ROOT, GIT_TASK_ROOT,
                )
            except (TypeError, ValueError, GitHubIntegrationError, OSError, sqlite3.Error) as exc:
                self.json_response(HTTPStatus.BAD_REQUEST, {"error": str(exc)})
                return
            self.json_response(HTTPStatus.CREATED, {"change": change})
            return

        github_change_action = re.fullmatch(r"/api/github/changes/(\d+)/(commit|push|pull-request)", parsed.path)
        if github_change_action:
            try:
                change_id = int(github_change_action.group(1))
                action = github_change_action.group(2)
                payload = self.read_json()
                if action == "commit":
                    if payload.get("confirm") is not True:
                        raise GitHubIntegrationError("explicit commit approval is required")
                    change = approve_commit(change_id, payload.get("message", ""), DB_PATH)
                elif action == "push":
                    if payload.get("confirm") is not True:
                        raise GitHubIntegrationError("explicit push approval is required")
                    current = get_change(change_id, DB_PATH)
                    repository = get_repository(current["repo_id"], DB_PATH)
                    client = REAL_GITHUB_APP if repository["mode"] == "real" else MockGitHubApp(DB_PATH)
                    change = push_change(
                        change_id, DB_PATH, client,
                        allow_external=github_config_status()["external_writes_enabled"],
                    )
                else:
                    if payload.get("confirm") is not True:
                        raise GitHubIntegrationError("explicit PR approval is required")
                    current = get_change(change_id, DB_PATH)
                    repository = get_repository(current["repo_id"], DB_PATH)
                    client = REAL_GITHUB_APP if repository["mode"] == "real" else MockGitHubApp(DB_PATH)
                    change = create_pull_request(
                        change_id, str(payload.get("title", "")), str(payload.get("body", "")), DB_PATH, client,
                        dry_run=payload.get("dry_run", True) is not False,
                        allow_external=github_config_status()["external_writes_enabled"],
                    )
            except (ValueError, GitHubIntegrationError, OSError, sqlite3.Error) as exc:
                self.json_response(HTTPStatus.BAD_REQUEST, {"error": str(exc)})
                return
            self.json_response(HTTPStatus.OK, {"change": change})
            return

        diagnose_match = re.fullmatch(r"/api/providers/(\d+)/diagnose", parsed.path)
        if diagnose_match:
            try:
                diagnosis = diagnose_provider(int(diagnose_match.group(1)))
            except (ValueError, LookupError) as exc:
                self.json_response(HTTPStatus.BAD_REQUEST, {"error": str(exc)})
                return
            status = HTTPStatus.OK if diagnosis["status"] == "ok" else HTTPStatus.BAD_GATEWAY
            self.json_response(status, {"diagnosis": diagnosis})
            return

        if parsed.path == "/api/agent/tasks":
            try:
                task = create_agent_task(self.read_json())
            except (ValueError, LookupError, OSError, sqlite3.Error) as exc:
                self.json_response(HTTPStatus.BAD_REQUEST, {"error": str(exc)})
                return
            self.json_response(HTTPStatus.ACCEPTED, {"task": task})
            return

        task_action_match = re.fullmatch(r"/api/agent/tasks/(\d+)/(approve|cancel|retry|rollback)", parsed.path)
        if task_action_match:
            task_id = int(task_action_match.group(1))
            action = task_action_match.group(2)
            try:
                if action == "approve":
                    task = approve_agent_task(task_id)
                elif action == "cancel":
                    task = cancel_agent_task(task_id)
                elif action == "retry":
                    task = retry_agent_task(task_id)
                else:
                    task = rollback_agent_task(task_id)
            except (ValueError, LookupError, OSError, sqlite3.Error) as exc:
                self.json_response(HTTPStatus.BAD_REQUEST, {"error": str(exc)})
                return
            self.json_response(HTTPStatus.OK, {"task": task})
            return

        runs_match = re.fullmatch(r"/api/projects/(\d+)/runs", parsed.path)
        if runs_match:
            try:
                payload = self.read_json()
                run = run_project_action(int(runs_match.group(1)), payload.get("action", ""))
            except (ValueError, LookupError, OSError, sqlite3.Error) as exc:
                self.json_response(HTTPStatus.BAD_REQUEST, {"error": str(exc)})
                return
            self.json_response(HTTPStatus.CREATED, {"run": run})
            return
        self.json_response(HTTPStatus.NOT_FOUND, {"error": "not found"})


def main() -> None:
    init_db(DB_PATH)
    server = ThreadingHTTPServer(("0.0.0.0", 8080), ForgeHandler)
    server.serve_forever()


if __name__ == "__main__":
    main()
