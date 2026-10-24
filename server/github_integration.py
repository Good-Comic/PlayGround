from __future__ import annotations

import base64
import hashlib
import hmac
import json
import os
import re
import shutil
import sqlite3
import subprocess
import time
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Callable
from urllib.error import HTTPError, URLError
from urllib.request import HTTPRedirectHandler, Request, build_opener

try:
    from server.secrets_store import read_secret
except ModuleNotFoundError:
    from secrets_store import read_secret


MAX_WEBHOOK_BODY = 1024 * 1024
MAX_GIT_OUTPUT = 64 * 1024
MINIMUM_PERMISSIONS = {"metadata": "read", "contents": "write", "pull_requests": "write"}
PROTECTED_BRANCHES = {"main", "master"}
PROTECTED_PREFIXES = ("opencode-resume/", "opencode-checkpoints/")
SECRET_PATTERNS = [
    ("private key", re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----")),
    ("GitHub token", re.compile(r"\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{20,}\b")),
    ("generic secret assignment", re.compile(r"(?i)\b(?:api[_-]?key|secret|token|password)\s*[:=]\s*['\"]?[A-Za-z0-9_./+=-]{16,}")),
]


class GitHubIntegrationError(RuntimeError):
    pass


class WebhookAuthenticationError(GitHubIntegrationError):
    pass


class WebhookReplayError(GitHubIntegrationError):
    pass


class _NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def init_github_db(db_path: Path) -> None:
    with sqlite3.connect(db_path) as connection:
        connection.executescript(
            """
            CREATE TABLE IF NOT EXISTS github_repositories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                project_id INTEGER NOT NULL,
                owner TEXT NOT NULL,
                name TEXT NOT NULL,
                installation_id INTEGER,
                default_branch TEXT NOT NULL,
                base_ref TEXT NOT NULL,
                base_sha TEXT NOT NULL,
                mode TEXT NOT NULL,
                permissions_json TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'configured',
                latest_remote_sha TEXT NOT NULL DEFAULT '',
                local_sha TEXT NOT NULL DEFAULT '',
                ahead INTEGER NOT NULL DEFAULT 0,
                behind INTEGER NOT NULL DEFAULT 0,
                conflict INTEGER NOT NULL DEFAULT 0,
                local_dirty INTEGER NOT NULL DEFAULT 0,
                pending_prs INTEGER NOT NULL DEFAULT 0,
                sync_cursor TEXT NOT NULL DEFAULT '',
                last_webhook_at TEXT,
                last_sync_at TEXT,
                sync_error TEXT NOT NULL DEFAULT '',
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(owner, name),
                FOREIGN KEY(project_id) REFERENCES projects(id)
            );
            CREATE TABLE IF NOT EXISTS github_deliveries (
                delivery_id TEXT PRIMARY KEY,
                event TEXT NOT NULL,
                repo_id INTEGER NOT NULL,
                payload_sha256 TEXT NOT NULL,
                normalized_json TEXT NOT NULL,
                status TEXT NOT NULL,
                attempts INTEGER NOT NULL DEFAULT 0,
                error TEXT NOT NULL DEFAULT '',
                next_retry_at TEXT,
                received_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                processed_at TEXT,
                FOREIGN KEY(repo_id) REFERENCES github_repositories(id)
            );
            CREATE TABLE IF NOT EXISTS github_changes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                task_id INTEGER NOT NULL UNIQUE,
                repo_id INTEGER NOT NULL,
                branch TEXT NOT NULL UNIQUE,
                workspace_path TEXT NOT NULL,
                target_path TEXT NOT NULL,
                base_sha TEXT NOT NULL,
                status TEXT NOT NULL,
                diff TEXT NOT NULL,
                validation_output TEXT NOT NULL,
                scan_output TEXT NOT NULL,
                commit_sha TEXT NOT NULL DEFAULT '',
                push_status TEXT NOT NULL DEFAULT '',
                pr_number INTEGER,
                pr_url TEXT NOT NULL DEFAULT '',
                error TEXT NOT NULL DEFAULT '',
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(repo_id) REFERENCES github_repositories(id),
                FOREIGN KEY(task_id) REFERENCES agent_tasks(id)
            );
            CREATE TABLE IF NOT EXISTS github_audit (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                repo_id INTEGER,
                change_id INTEGER,
                action TEXT NOT NULL,
                status TEXT NOT NULL,
                message TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS github_mock_events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                repo_id INTEGER NOT NULL,
                kind TEXT NOT NULL,
                event_json TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS github_mock_prs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                repo_id INTEGER NOT NULL,
                branch TEXT NOT NULL,
                base_branch TEXT NOT NULL,
                title TEXT NOT NULL,
                body TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            """
        )


def _row(row: sqlite3.Row | None, message: str) -> dict[str, Any]:
    if row is None:
        raise GitHubIntegrationError(message)
    return dict(row)


def github_config_status() -> dict[str, bool]:
    private_key_path = os.environ.get("FORGE_GITHUB_APP_PRIVATE_KEY_FILE", "")
    return {
        "app_id_configured": bool(os.environ.get("FORGE_GITHUB_APP_ID")),
        "private_key_configured": bool(private_key_path and Path(private_key_path).is_file()),
        "webhook_secret_configured": bool(read_secret("FORGE_GITHUB_WEBHOOK_SECRET")),
        "external_writes_enabled": os.environ.get("FORGE_GITHUB_EXTERNAL_WRITES") == "1",
    }


def _validate_repo_name(value: Any, field: str) -> str:
    text = str(value or "").strip()
    if not re.fullmatch(r"[A-Za-z0-9_.-]{1,100}", text):
        raise GitHubIntegrationError(f"invalid repository {field}")
    return text


def _validate_ref(value: Any, field: str = "branch") -> str:
    text = str(value or "").strip()
    if not text or len(text) > 240 or text.startswith(("-", "/")) or ".." in text or "//" in text:
        raise GitHubIntegrationError(f"invalid {field}")
    if not re.fullmatch(r"[A-Za-z0-9._/-]+", text):
        raise GitHubIntegrationError(f"invalid {field}")
    return text


def _protected_branch(branch: str) -> bool:
    return branch in PROTECTED_BRANCHES or branch.startswith(PROTECTED_PREFIXES)


def register_repository(payload: dict[str, Any], db_path: Path) -> dict[str, Any]:
    owner = _validate_repo_name(payload.get("owner"), "owner")
    name = _validate_repo_name(payload.get("name"), "name")
    mode = str(payload.get("mode", "mock"))
    if mode not in {"mock", "real"}:
        raise GitHubIntegrationError("mode must be mock or real")
    try:
        project_id = int(payload.get("project_id"))
        installation_id = payload.get("installation_id")
        installation_id = None if installation_id in {None, ""} else int(installation_id)
    except (TypeError, ValueError) as exc:
        raise GitHubIntegrationError("project_id and installation_id must be integers") from exc
    base_ref = _validate_ref(payload.get("base_ref"), "base_ref")
    default_branch = _validate_ref(payload.get("default_branch", "main"), "default_branch")
    base_sha = str(payload.get("base_sha", "")).lower()
    if not re.fullmatch(r"[0-9a-f]{40}", base_sha):
        raise GitHubIntegrationError("base_sha must be a full commit SHA")
    requested_permissions = payload.get("permissions", MINIMUM_PERMISSIONS)
    if requested_permissions != MINIMUM_PERMISSIONS:
        raise GitHubIntegrationError("only the minimum GitHub App permission set is accepted")
    if mode == "real" and installation_id is None:
        raise GitHubIntegrationError("real mode requires a GitHub App installation_id")
    with sqlite3.connect(db_path) as connection:
        project = connection.execute("SELECT id FROM projects WHERE id = ?", (project_id,)).fetchone()
        if project is None:
            raise GitHubIntegrationError("project not found")
        duplicate = connection.execute(
            "SELECT id FROM github_repositories WHERE lower(owner) = lower(?) AND lower(name) = lower(?)",
            (owner, name),
        ).fetchone()
        if duplicate is not None:
            raise GitHubIntegrationError("repository is already registered")
        cursor = connection.execute(
            """
            INSERT INTO github_repositories(
                project_id, owner, name, installation_id, default_branch, base_ref, base_sha,
                mode, permissions_json, local_sha
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                project_id, owner, name, installation_id, default_branch, base_ref, base_sha,
                mode, json.dumps(MINIMUM_PERMISSIONS, sort_keys=True), base_sha,
            ),
        )
        repo_id = cursor.lastrowid
        connection.execute(
            "INSERT INTO github_audit(repo_id, action, status, message) VALUES (?, 'repository.register', 'ok', ?)",
            (repo_id, f"Registered {owner}/{name} in {mode} mode with minimum permissions."),
        )
    return get_repository(repo_id, db_path)


def get_repository(repo_id: int, db_path: Path) -> dict[str, Any]:
    with sqlite3.connect(db_path) as connection:
        connection.row_factory = sqlite3.Row
        repo = _row(connection.execute("SELECT * FROM github_repositories WHERE id = ?", (repo_id,)).fetchone(), "repository not found")
    repo["permissions"] = json.loads(repo.pop("permissions_json"))
    repo["conflict"] = bool(repo["conflict"])
    repo["local_dirty"] = bool(repo["local_dirty"])
    return repo


def list_repositories(db_path: Path) -> list[dict[str, Any]]:
    with sqlite3.connect(db_path) as connection:
        ids = [row[0] for row in connection.execute("SELECT id FROM github_repositories ORDER BY id")]
    return [get_repository(repo_id, db_path) for repo_id in ids]


def _authorized_repository(full_name: str, db_path: Path) -> dict[str, Any]:
    if not isinstance(full_name, str) or "/" not in full_name:
        raise GitHubIntegrationError("webhook repository identity is missing")
    owner, name = full_name.split("/", 1)
    with sqlite3.connect(db_path) as connection:
        connection.row_factory = sqlite3.Row
        row = connection.execute(
            "SELECT * FROM github_repositories WHERE lower(owner) = lower(?) AND lower(name) = lower(?)",
            (owner, name),
        ).fetchone()
    return _row(row, "repository is not authorized")


def verify_webhook_signature(body: bytes, signature: str, secret: str) -> None:
    if not secret:
        raise WebhookAuthenticationError("webhook secret is not configured")
    if not isinstance(signature, str) or not signature.startswith("sha256="):
        raise WebhookAuthenticationError("missing SHA-256 webhook signature")
    expected = "sha256=" + hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(signature, expected):
        raise WebhookAuthenticationError("invalid webhook signature")


def _normalize_event(event: str, payload: dict[str, Any]) -> dict[str, Any]:
    repository = payload.get("repository") or {}
    normalized: dict[str, Any] = {"repository": repository.get("full_name", "")}
    if event == "push":
        normalized.update({
            "ref": payload.get("ref", ""), "before": payload.get("before", ""),
            "after": payload.get("after", ""), "forced": bool(payload.get("forced")),
        })
    elif event == "pull_request":
        pr = payload.get("pull_request") or {}
        normalized.update({
            "action": payload.get("action", ""), "number": payload.get("number"),
            "base_ref": (pr.get("base") or {}).get("ref", ""),
            "head_ref": (pr.get("head") or {}).get("ref", ""),
            "merged": bool(pr.get("merged")),
        })
    elif event == "ping":
        normalized["zen"] = str(payload.get("zen", ""))[:200]
    else:
        raise GitHubIntegrationError("webhook event is not allowlisted")
    return normalized


def ingest_webhook(
    body: bytes, signature: str, delivery_id: str, event: str, db_path: Path,
    secret: str | None = None,
) -> dict[str, Any]:
    if len(body) > MAX_WEBHOOK_BODY:
        raise GitHubIntegrationError("webhook body exceeds 1 MiB")
    if not re.fullmatch(r"[A-Za-z0-9-]{8,100}", delivery_id or ""):
        raise GitHubIntegrationError("invalid delivery id")
    verify_webhook_signature(body, signature, secret if secret is not None else read_secret("FORGE_GITHUB_WEBHOOK_SECRET"))
    try:
        payload = json.loads(body)
    except json.JSONDecodeError as exc:
        raise GitHubIntegrationError("invalid webhook JSON") from exc
    if not isinstance(payload, dict):
        raise GitHubIntegrationError("webhook JSON must be an object")
    normalized = _normalize_event(event, payload)
    repo = _authorized_repository(normalized["repository"], db_path)
    digest = hashlib.sha256(body).hexdigest()
    with sqlite3.connect(db_path) as connection:
        existing = connection.execute(
            "SELECT payload_sha256 FROM github_deliveries WHERE delivery_id = ?", (delivery_id,)
        ).fetchone()
        if existing:
            if existing[0] != digest:
                raise WebhookReplayError("delivery id replayed with a different payload")
            return {"delivery_id": delivery_id, "status": "duplicate", "duplicate": True}
        connection.execute(
            """
            INSERT INTO github_deliveries(delivery_id, event, repo_id, payload_sha256, normalized_json, status)
            VALUES (?, ?, ?, ?, ?, 'pending')
            """,
            (delivery_id, event, repo["id"], digest, json.dumps(normalized, sort_keys=True)),
        )
    return {"delivery_id": delivery_id, "status": "pending", "duplicate": False}


def process_delivery(
    delivery_id: str, db_path: Path,
    remote_state: Callable[[dict[str, Any], dict[str, Any]], dict[str, Any]] | None = None,
) -> dict[str, Any]:
    with sqlite3.connect(db_path) as connection:
        connection.row_factory = sqlite3.Row
        delivery = _row(connection.execute(
            "SELECT * FROM github_deliveries WHERE delivery_id = ?", (delivery_id,)
        ).fetchone(), "delivery not found")
    if delivery["status"] == "processed":
        return delivery
    repo = get_repository(delivery["repo_id"], db_path)
    event = json.loads(delivery["normalized_json"])
    try:
        if repo["local_dirty"]:
            raise GitHubIntegrationError("local checkout is dirty; synchronization stopped for review")
        state = remote_state(repo, event) if remote_state else {}
        latest_sha = str(state.get("latest_sha", event.get("after", repo["latest_remote_sha"])))
        pending_prs = repo["pending_prs"]
        if delivery["event"] == "pull_request":
            if event.get("action") in {"opened", "reopened"}:
                pending_prs += 1
            elif event.get("action") == "closed":
                pending_prs = max(0, pending_prs - 1)
        pending_prs = int(state.get("pending_prs", pending_prs))
        if event.get("forced"):
            raise GitHubIntegrationError("forced remote update requires manual conflict review")
        with sqlite3.connect(db_path) as connection:
            connection.execute(
                """
                UPDATE github_repositories SET latest_remote_sha = ?, pending_prs = ?,
                    last_webhook_at = CURRENT_TIMESTAMP, last_sync_at = CURRENT_TIMESTAMP,
                    status = 'synced', conflict = 0, sync_error = '' WHERE id = ?
                """,
                (latest_sha, pending_prs, repo["id"]),
            )
            connection.execute(
                """
                UPDATE github_deliveries SET status = 'processed', attempts = attempts + 1,
                    error = '', next_retry_at = NULL, processed_at = CURRENT_TIMESTAMP WHERE delivery_id = ?
                """,
                (delivery_id,),
            )
        return {"delivery_id": delivery_id, "status": "processed"}
    except Exception as exc:
        message = str(exc)[:1000]
        with sqlite3.connect(db_path) as connection:
            connection.execute(
                """
                UPDATE github_deliveries SET status = 'retry', attempts = attempts + 1,
                    error = ?, next_retry_at = datetime('now', '+' || min(attempts + 1, 5) || ' minutes')
                WHERE delivery_id = ?
                """,
                (message, delivery_id),
            )
            connection.execute(
                "UPDATE github_repositories SET status = 'sync_error', conflict = 1, sync_error = ? WHERE id = ?",
                (message, repo["id"]),
            )
        return {"delivery_id": delivery_id, "status": "retry", "error": message}


def list_deliveries(repo_id: int, db_path: Path) -> list[dict[str, Any]]:
    get_repository(repo_id, db_path)
    with sqlite3.connect(db_path) as connection:
        connection.row_factory = sqlite3.Row
        return [dict(row) for row in connection.execute(
            """
            SELECT delivery_id, event, status, attempts, error, next_retry_at, received_at, processed_at
            FROM github_deliveries WHERE repo_id = ? ORDER BY received_at DESC, delivery_id DESC LIMIT 100
            """,
            (repo_id,),
        )]


class MockGitHubApp:
    def __init__(self, db_path: Path):
        self.db_path = db_path

    def push(self, repo: dict[str, Any], branch: str, commit_sha: str) -> dict[str, Any]:
        with sqlite3.connect(self.db_path) as connection:
            cursor = connection.execute(
                "INSERT INTO github_mock_events(repo_id, kind, event_json) VALUES (?, 'push', ?)",
                (repo["id"], json.dumps({"branch": branch, "sha": commit_sha})),
            )
        return {"status": "mock_pushed", "event_id": cursor.lastrowid}

    def create_pr(self, repo: dict[str, Any], branch: str, title: str, body: str) -> dict[str, Any]:
        with sqlite3.connect(self.db_path) as connection:
            cursor = connection.execute(
                """
                INSERT INTO github_mock_prs(repo_id, branch, base_branch, title, body)
                VALUES (?, ?, ?, ?, ?)
                """,
                (repo["id"], branch, repo["default_branch"], title, body),
            )
        return {"number": cursor.lastrowid, "url": f"mock://github/{repo['owner']}/{repo['name']}/pull/{cursor.lastrowid}"}

    def events_since(self, repo_id: int, cursor: str) -> list[dict[str, Any]]:
        try:
            after = int(cursor or 0)
        except ValueError:
            after = 0
        with sqlite3.connect(self.db_path) as connection:
            rows = connection.execute(
                "SELECT id, kind, event_json FROM github_mock_events WHERE repo_id = ? AND id > ? ORDER BY id",
                (repo_id, after),
            ).fetchall()
        return [{"id": row[0], "kind": row[1], **json.loads(row[2])} for row in rows]


def reconcile_repository(repo_id: int, db_path: Path, client: MockGitHubApp) -> dict[str, Any]:
    repo = get_repository(repo_id, db_path)
    events = client.events_since(repo_id, repo["sync_cursor"])
    processed = 0
    cursor = repo["sync_cursor"]
    for event in events:
        if event["kind"] != "push":
            cursor = str(event["id"])
            continue
        delivery_id = f"reconcile-{repo_id}-{event['id']}"
        normalized = {"repository": f"{repo['owner']}/{repo['name']}", "ref": f"refs/heads/{event['branch']}", "after": event["sha"], "forced": False}
        with sqlite3.connect(db_path) as connection:
            connection.execute(
                """
                INSERT OR IGNORE INTO github_deliveries(
                    delivery_id, event, repo_id, payload_sha256, normalized_json, status
                ) VALUES (?, 'push', ?, ?, ?, 'pending')
                """,
                (delivery_id, repo_id, hashlib.sha256(json.dumps(event, sort_keys=True).encode()).hexdigest(), json.dumps(normalized, sort_keys=True)),
            )
        result = process_delivery(delivery_id, db_path)
        if result["status"] != "processed":
            break
        cursor = str(event["id"])
        processed += 1
    with sqlite3.connect(db_path) as connection:
        connection.execute(
            "UPDATE github_repositories SET sync_cursor = ?, last_sync_at = CURRENT_TIMESTAMP WHERE id = ?",
            (cursor, repo_id),
        )
    return {"events_found": len(events), "processed": processed, "cursor": cursor}


def _git(args: list[str], cwd: Path, extra_env: dict[str, str] | None = None) -> str:
    environment = {
        "PATH": os.environ.get("PATH", "/usr/local/bin:/usr/bin:/bin"),
        "HOME": "/tmp", "GIT_TERMINAL_PROMPT": "0", "LC_ALL": "C.UTF-8",
    }
    if extra_env:
        environment.update(extra_env)
    completed = subprocess.run(
        ["git", *args], cwd=cwd, env=environment, capture_output=True, text=True,
        timeout=120, check=False,
    )
    output = (completed.stdout + completed.stderr)[-MAX_GIT_OUTPUT:]
    if completed.returncode:
        raise GitHubIntegrationError(f"git command failed ({args[0]}): {output.strip()[:1000]}")
    return output


def scan_secrets(diff: str) -> str:
    findings = []
    added = "\n".join(line[1:] for line in diff.splitlines() if line.startswith("+") and not line.startswith("+++"))
    for name, pattern in SECRET_PATTERNS:
        if pattern.search(added):
            findings.append(name)
    if findings:
        raise GitHubIntegrationError("secrets scan rejected: " + ", ".join(findings))
    return "Secrets scan passed: no allowlisted high-confidence patterns found."


def _validate_workspace(root: Path) -> str:
    scripts = [item.relative_to(root).as_posix() for item in sorted(root.rglob("*.js")) if ".git" not in item.relative_to(root).parts]
    commands = [["node", "--check", script] for script in scripts]
    if (root / "scripts" / "validate-locales.mjs").is_file():
        commands.append(["node", "scripts/validate-locales.mjs"])
    if not commands:
        raise GitHubIntegrationError("no allowlisted validation command is available")
    outputs = []
    for command in commands:
        completed = subprocess.run(
            command, cwd=root, env={"PATH": os.environ.get("PATH", "/usr/local/bin:/usr/bin:/bin"), "HOME": "/tmp", "CI": "1"},
            capture_output=True, text=True, timeout=60, check=False,
        )
        outputs.append(f"$ {' '.join(command)}\n{completed.stdout}{completed.stderr}".rstrip())
        if completed.returncode:
            raise GitHubIntegrationError("validation failed: " + outputs[-1][-1000:])
    return "\n\n".join(outputs)[-MAX_GIT_OUTPUT:]


def prepare_change(
    task_id: int, repo_id: int, db_path: Path, source_repository: Path, worktree_root: Path,
) -> dict[str, Any]:
    repo = get_repository(repo_id, db_path)
    with sqlite3.connect(db_path) as connection:
        connection.row_factory = sqlite3.Row
        task = _row(connection.execute("SELECT * FROM agent_tasks WHERE id = ?", (task_id,)).fetchone(), "agent task not found")
    if task["project_id"] != repo["project_id"]:
        raise GitHubIntegrationError("agent task does not belong to the authorized repository project")
    if task["status"] != "completed" or task["effective_mode"] not in {"edit", "test"}:
        raise GitHubIntegrationError("agent task must be an approved and validated edit")
    proposal = json.loads(task["proposal_json"])
    if len(proposal) != 1 or proposal[0].get("path") != task["target_path"]:
        raise GitHubIntegrationError("agent proposal is not a single approved target")
    branch = f"forge/task-{task_id}-{uuid.uuid4().hex[:8]}"
    if _protected_branch(branch):
        raise GitHubIntegrationError("protected branch rejected")
    destination = worktree_root / f"task-{task_id}-{uuid.uuid4().hex[:8]}"
    destination.parent.mkdir(parents=True, exist_ok=True)
    _git(["clone", "--no-local", "--branch", repo["base_ref"], str(source_repository), str(destination)], source_repository.parent)
    head = _git(["rev-parse", "HEAD"], destination).strip()
    if head != repo["base_sha"]:
        raise GitHubIntegrationError("base commit changed; refresh and review before preparing a change")
    _git(["switch", "-c", branch], destination)
    target = (destination / task["target_path"]).resolve(strict=True)
    if destination.resolve(strict=True) not in target.parents or ".git" in target.relative_to(destination).parts:
        raise GitHubIntegrationError("proposal path is outside the isolated worktree")
    target.write_text(str(proposal[0]["content"]), encoding="utf-8")
    _git(["diff", "--check"], destination)
    diff = _git(["diff", "--no-ext-diff", "--", task["target_path"]], destination)
    if not diff:
        raise GitHubIntegrationError("proposal produced no Git diff")
    scan_output = scan_secrets(diff)
    validation_output = _validate_workspace(destination)
    with sqlite3.connect(db_path) as connection:
        cursor = connection.execute(
            """
            INSERT INTO github_changes(
                task_id, repo_id, branch, workspace_path, target_path, base_sha, status,
                diff, validation_output, scan_output
            ) VALUES (?, ?, ?, ?, ?, ?, 'ready_for_commit_approval', ?, ?, ?)
            """,
            (task_id, repo_id, branch, str(destination), task["target_path"], head, diff, validation_output, scan_output),
        )
        change_id = cursor.lastrowid
        connection.execute(
            "INSERT INTO github_audit(repo_id, change_id, action, status, message) VALUES (?, ?, 'change.prepare', 'ok', ?)",
            (repo_id, change_id, f"Prepared isolated branch {branch}; source checkout unchanged."),
        )
    return get_change(change_id, db_path)


def get_change(change_id: int, db_path: Path) -> dict[str, Any]:
    with sqlite3.connect(db_path) as connection:
        connection.row_factory = sqlite3.Row
        change = _row(connection.execute("SELECT * FROM github_changes WHERE id = ?", (change_id,)).fetchone(), "change not found")
        change["audit"] = [dict(row) for row in connection.execute(
            "SELECT action, status, message, created_at FROM github_audit WHERE change_id = ? ORDER BY id", (change_id,)
        )]
    return change


def list_changes(repo_id: int, db_path: Path) -> list[dict[str, Any]]:
    get_repository(repo_id, db_path)
    with sqlite3.connect(db_path) as connection:
        ids = [row[0] for row in connection.execute("SELECT id FROM github_changes WHERE repo_id = ? ORDER BY id DESC", (repo_id,))]
    return [get_change(change_id, db_path) for change_id in ids]


def approve_commit(change_id: int, message: str, db_path: Path) -> dict[str, Any]:
    change = get_change(change_id, db_path)
    if change["status"] != "ready_for_commit_approval":
        raise GitHubIntegrationError("change is not ready for commit approval")
    if not isinstance(message, str) or not re.fullmatch(r"[A-Za-z0-9][^\r\n]{4,119}", message):
        raise GitHubIntegrationError("commit message must be a single line between 5 and 120 characters")
    root = Path(change["workspace_path"])
    branch = _git(["branch", "--show-current"], root).strip()
    if branch != change["branch"] or _protected_branch(branch):
        raise GitHubIntegrationError("isolated feature branch validation failed")
    if _git(["rev-parse", f"{change['base_sha']}^{{commit}}"], root).strip() != change["base_sha"]:
        raise GitHubIntegrationError("base commit is unavailable")
    _git(["diff", "--check"], root)
    diff = _git(["diff", "--no-ext-diff", "--", change["target_path"]], root)
    scan_output = scan_secrets(diff)
    validation_output = _validate_workspace(root)
    _git(["add", "--", change["target_path"]], root)
    staged = [line for line in _git(["diff", "--cached", "--name-only"], root).splitlines() if line]
    if staged != [change["target_path"]]:
        raise GitHubIntegrationError("staged files do not match the reviewed target")
    _git(
        ["commit", "-m", message], root,
        {"GIT_AUTHOR_NAME": "Project Forge", "GIT_AUTHOR_EMAIL": "forge@localhost", "GIT_COMMITTER_NAME": "Project Forge", "GIT_COMMITTER_EMAIL": "forge@localhost"},
    )
    commit_sha = _git(["rev-parse", "HEAD"], root).strip()
    with sqlite3.connect(db_path) as connection:
        connection.execute(
            """
            UPDATE github_changes SET status = 'committed', commit_sha = ?, validation_output = ?,
                scan_output = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
            """,
            (commit_sha, validation_output, scan_output, change_id),
        )
        connection.execute(
            "INSERT INTO github_audit(repo_id, change_id, action, status, message) VALUES (?, ?, 'commit.approve', 'ok', ?)",
            (change["repo_id"], change_id, f"Explicit approval created commit {commit_sha}."),
        )
    return get_change(change_id, db_path)


def push_change(change_id: int, db_path: Path, client: Any, allow_external: bool = False) -> dict[str, Any]:
    change = get_change(change_id, db_path)
    repo = get_repository(change["repo_id"], db_path)
    if change["status"] != "committed":
        raise GitHubIntegrationError("change must be committed before push approval")
    if _protected_branch(change["branch"]):
        raise GitHubIntegrationError("protected branch push rejected")
    if repo["mode"] == "real" and not allow_external:
        raise GitHubIntegrationError("external GitHub writes are disabled pending explicit authorization")
    result = client.push(repo, change["branch"], change["commit_sha"], Path(change["workspace_path"])) if repo["mode"] == "real" else client.push(repo, change["branch"], change["commit_sha"])
    status = "pushed" if repo["mode"] == "real" else "mock_pushed"
    with sqlite3.connect(db_path) as connection:
        connection.execute(
            "UPDATE github_changes SET status = ?, push_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            (status, result["status"], change_id),
        )
        connection.execute(
            "INSERT INTO github_audit(repo_id, change_id, action, status, message) VALUES (?, ?, 'push.approve', 'ok', ?)",
            (repo["id"], change_id, f"Approved non-force push to {change['branch']} ({repo['mode']})."),
        )
    return get_change(change_id, db_path)


def create_pull_request(
    change_id: int, title: str, body: str, db_path: Path, client: Any,
    dry_run: bool = True, allow_external: bool = False,
) -> dict[str, Any]:
    change = get_change(change_id, db_path)
    repo = get_repository(change["repo_id"], db_path)
    if change["status"] not in {"mock_pushed", "pushed", "pr_dry_run"}:
        raise GitHubIntegrationError("change must be pushed before PR preparation")
    if not title.strip() or len(title) > 200 or len(body) > 20_000:
        raise GitHubIntegrationError("invalid pull request title or body")
    if dry_run:
        with sqlite3.connect(db_path) as connection:
            connection.execute(
                "UPDATE github_changes SET status = 'pr_dry_run', updated_at = CURRENT_TIMESTAMP WHERE id = ?", (change_id,)
            )
            connection.execute(
                "INSERT INTO github_audit(repo_id, change_id, action, status, message) VALUES (?, ?, 'pr.dry_run', 'ok', ?)",
                (repo["id"], change_id, f"PR dry-run prepared: {change['branch']} -> {repo['default_branch']}"),
            )
        return get_change(change_id, db_path)
    if repo["mode"] == "real" and not allow_external:
        raise GitHubIntegrationError("real PR creation requires explicit current authorization")
    result = client.create_pr(repo, change["branch"], title.strip(), body)
    status = "pr_created" if repo["mode"] == "real" else "mock_pr_created"
    with sqlite3.connect(db_path) as connection:
        connection.execute(
            """
            UPDATE github_changes SET status = ?, pr_number = ?, pr_url = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
            """,
            (status, result["number"], result["url"], change_id),
        )
        connection.execute(
            "INSERT INTO github_audit(repo_id, change_id, action, status, message) VALUES (?, ?, 'pr.create', 'ok', ?)",
            (repo["id"], change_id, f"Created {repo['mode']} PR #{result['number']}; merge is not implemented."),
        )
    return get_change(change_id, db_path)


def _b64url(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()


class RealGitHubApp:
    def __init__(self):
        self._tokens: dict[int, tuple[str, float]] = {}

    def _app_jwt(self) -> str:
        app_id = os.environ.get("FORGE_GITHUB_APP_ID", "")
        key_path = Path(os.environ.get("FORGE_GITHUB_APP_PRIVATE_KEY_FILE", ""))
        if not app_id or not key_path.is_file():
            raise GitHubIntegrationError("GitHub App ID/private key file is not configured")
        now = int(time.time())
        header = _b64url(json.dumps({"alg": "RS256", "typ": "JWT"}, separators=(",", ":")).encode())
        payload = _b64url(json.dumps({"iat": now - 60, "exp": now + 540, "iss": app_id}, separators=(",", ":")).encode())
        unsigned = f"{header}.{payload}".encode()
        signed = subprocess.run(
            ["openssl", "dgst", "-sha256", "-sign", str(key_path)], input=unsigned,
            capture_output=True, timeout=10, check=False,
        )
        if signed.returncode:
            raise GitHubIntegrationError("GitHub App JWT signing failed")
        return f"{unsigned.decode()}.{_b64url(signed.stdout)}"

    def _api(self, path: str, method: str = "GET", payload: dict[str, Any] | None = None, token: str | None = None) -> dict[str, Any]:
        headers = {"Accept": "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", "User-Agent": "Project-Forge-AI"}
        headers["Authorization"] = f"Bearer {token or self._app_jwt()}"
        data = None if payload is None else json.dumps(payload).encode()
        request = Request(f"https://api.github.com{path}", data=data, headers=headers, method=method)
        try:
            with build_opener(_NoRedirect).open(request, timeout=30) as response:
                return json.loads(response.read(2 * 1024 * 1024))
        except HTTPError as exc:
            raise GitHubIntegrationError(f"GitHub API returned HTTP {exc.code}") from exc
        except (URLError, TimeoutError, json.JSONDecodeError) as exc:
            raise GitHubIntegrationError(f"GitHub API request failed: {type(exc).__name__}") from exc

    def installation_token(self, installation_id: int) -> str:
        cached = self._tokens.get(installation_id)
        if cached and cached[1] > time.time() + 60:
            return cached[0]
        data = self._api(f"/app/installations/{installation_id}/access_tokens", "POST", {"permissions": MINIMUM_PERMISSIONS})
        token = str(data.get("token", ""))
        expires = datetime.fromisoformat(str(data["expires_at"]).replace("Z", "+00:00")).timestamp()
        if not token:
            raise GitHubIntegrationError("GitHub did not return an installation token")
        self._tokens[installation_id] = (token, expires)
        return token

    def push(self, repo: dict[str, Any], branch: str, commit_sha: str, workspace: Path) -> dict[str, Any]:
        token = self.installation_token(int(repo["installation_id"]))
        askpass = workspace / ".git" / "forge-askpass.sh"
        askpass.write_text("#!/bin/sh\ncase \"$1\" in *Username*) echo x-access-token;; *) echo \"$FORGE_INSTALLATION_TOKEN\";; esac\n", encoding="utf-8")
        askpass.chmod(0o700)
        try:
            _git(["remote", "set-url", "origin", f"https://x-access-token@github.com/{repo['owner']}/{repo['name']}.git"], workspace)
            _git(
                ["push", "--porcelain", "origin", f"HEAD:refs/heads/{branch}"], workspace,
                {"GIT_ASKPASS": str(askpass), "FORGE_INSTALLATION_TOKEN": token},
            )
        finally:
            askpass.unlink(missing_ok=True)
        return {"status": "pushed", "sha": commit_sha}

    def create_pr(self, repo: dict[str, Any], branch: str, title: str, body: str) -> dict[str, Any]:
        token = self.installation_token(int(repo["installation_id"]))
        data = self._api(
            f"/repos/{repo['owner']}/{repo['name']}/pulls", "POST",
            {"title": title, "body": body, "head": branch, "base": repo["default_branch"]}, token,
        )
        return {"number": int(data["number"]), "url": str(data["html_url"])}
