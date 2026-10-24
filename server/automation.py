from __future__ import annotations

import difflib
import json
import os
import re
import shutil
import sqlite3
import subprocess
import time
import uuid
from pathlib import Path
from typing import Any, Callable

try:
    from server.github_integration import get_repository, scan_secrets
    from server.preview_runtime import run_quality_gate, start_trusted_workspace_preview, stop_preview
except ModuleNotFoundError:
    from github_integration import get_repository, scan_secrets
    from preview_runtime import run_quality_gate, start_trusted_workspace_preview, stop_preview


ROLES = ("planner", "engineer", "qa", "reviewer")
ALLOWED_SUFFIXES = {".md", ".html", ".css", ".js", ".mjs"}
PROTECTED_BRANCHES = {"main", "master"}
MAX_REQUEST_CHARS = 6000
MAX_TARGETS = 10
MAX_FILE_BYTES = 512 * 1024
MAX_OUTPUT = 64 * 1024


class AutomationError(RuntimeError):
    pass


class WorkspaceLocked(AutomationError):
    pass


class AutomationPhaseError(AutomationError):
    pass


def init_automation_db(db_path: Path) -> None:
    with sqlite3.connect(db_path) as connection:
        connection.executescript(
            """
            CREATE TABLE IF NOT EXISTS automation_jobs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                project_id INTEGER NOT NULL,
                repo_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                request TEXT NOT NULL,
                requirement_ids_json TEXT NOT NULL,
                target_paths_json TEXT NOT NULL,
                role_providers_json TEXT NOT NULL,
                status TEXT NOT NULL,
                attempt INTEGER NOT NULL DEFAULT 0,
                max_retries INTEGER NOT NULL,
                timeout_seconds INTEGER NOT NULL,
                token_limit INTEGER NOT NULL,
                cost_limit_usd REAL NOT NULL,
                execution_limit INTEGER NOT NULL,
                used_input_tokens INTEGER NOT NULL DEFAULT 0,
                used_output_tokens INTEGER NOT NULL DEFAULT 0,
                used_cost_usd REAL NOT NULL DEFAULT 0,
                execution_count INTEGER NOT NULL DEFAULT 0,
                workspace_path TEXT NOT NULL DEFAULT '',
                branch TEXT NOT NULL DEFAULT '',
                diff TEXT NOT NULL DEFAULT '',
                quality_run_id INTEGER,
                safe_stop_reason TEXT NOT NULL DEFAULT '',
                pr_draft_json TEXT NOT NULL DEFAULT '{}',
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(project_id) REFERENCES projects(id),
                FOREIGN KEY(repo_id) REFERENCES github_repositories(id)
            );
            CREATE TABLE IF NOT EXISTS automation_role_runs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                job_id INTEGER NOT NULL,
                attempt INTEGER NOT NULL,
                role TEXT NOT NULL,
                status TEXT NOT NULL,
                provider_id INTEGER NOT NULL,
                model_id TEXT NOT NULL,
                execution_kind TEXT NOT NULL,
                independent_agent INTEGER NOT NULL DEFAULT 0,
                input_tokens INTEGER NOT NULL DEFAULT 0,
                output_tokens INTEGER NOT NULL DEFAULT 0,
                cost_usd REAL NOT NULL DEFAULT 0,
                decision_json TEXT NOT NULL DEFAULT '{}',
                error TEXT NOT NULL DEFAULT '',
                started_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                finished_at TEXT,
                FOREIGN KEY(job_id) REFERENCES automation_jobs(id)
            );
            CREATE TABLE IF NOT EXISTS automation_audit (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                job_id INTEGER,
                actor TEXT NOT NULL,
                action TEXT NOT NULL,
                status TEXT NOT NULL,
                message TEXT NOT NULL,
                details_json TEXT NOT NULL DEFAULT '{}',
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS automation_locks (
                workspace_key TEXT PRIMARY KEY,
                owner_job_id INTEGER NOT NULL,
                lease_token TEXT NOT NULL,
                expires_at REAL NOT NULL,
                acquired_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS automation_requirement_status (
                job_id INTEGER NOT NULL,
                requirement_id TEXT NOT NULL,
                source_location TEXT NOT NULL,
                status TEXT NOT NULL,
                code_refs_json TEXT NOT NULL DEFAULT '[]',
                test_refs_json TEXT NOT NULL DEFAULT '[]',
                PRIMARY KEY(job_id, requirement_id),
                FOREIGN KEY(job_id) REFERENCES automation_jobs(id)
            );
            """
        )
        interrupted = connection.execute(
            "SELECT id FROM automation_jobs WHERE status IN ('planning','engineering','qa','reviewing','quality_gate')"
        ).fetchall()
        for (job_id,) in interrupted:
            connection.execute(
                """
                UPDATE automation_jobs SET status = 'safe_stopped',
                    safe_stop_reason = 'Studio restarted during automation; isolated workspace is preserved.',
                    updated_at = CURRENT_TIMESTAMP WHERE id = ?
                """,
                (job_id,),
            )
            _audit(connection, job_id, "system", "restart.recovery", "safe_stopped", "Interrupted job stopped safely.")
        connection.execute("DELETE FROM automation_locks WHERE expires_at <= ?", (time.time(),))


def _audit(
    connection: sqlite3.Connection, job_id: int | None, actor: str, action: str,
    status: str, message: str, details: dict[str, Any] | None = None,
) -> None:
    connection.execute(
        """
        INSERT INTO automation_audit(job_id, actor, action, status, message, details_json)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (job_id, actor, action, status, message[:1000], json.dumps(details or {}, ensure_ascii=False, sort_keys=True)),
    )


def load_spec_manifest(spec_root: Path) -> dict[str, Any]:
    manifest = json.loads((spec_root / "MANIFEST.json").read_text(encoding="utf-8"))
    requirements = json.loads((spec_root / "requirements.json").read_text(encoding="utf-8"))
    chunks = []
    repository_root = spec_root.parents[1]
    for chunk in manifest["chunks"]:
        path = (repository_root / chunk["path"]).resolve(strict=True)
        if repository_root.resolve(strict=True) not in path.parents:
            raise AutomationError("spec chunk escaped the repository")
        text = path.read_text(encoding="utf-8")
        chunks.append({**chunk, "characters": len(text)})
    return {**manifest, "chunks": chunks, "requirements": requirements["requirements"]}


def _requirements_by_id(spec_root: Path) -> dict[str, dict[str, str]]:
    return {item["id"]: item for item in load_spec_manifest(spec_root)["requirements"]}


def _provider(provider_id: int, db_path: Path) -> dict[str, Any]:
    with sqlite3.connect(db_path) as connection:
        connection.row_factory = sqlite3.Row
        row = connection.execute("SELECT * FROM providers WHERE id = ?", (provider_id,)).fetchone()
    if row is None:
        raise AutomationError("provider not found")
    return dict(row)


def _validate_target(path: str) -> str:
    value = str(path).strip()
    candidate = Path(value)
    if not value or candidate.is_absolute() or ".." in candidate.parts or ".git" in candidate.parts:
        raise AutomationError("target path is outside the allowlist boundary")
    if candidate.suffix.lower() not in ALLOWED_SUFFIXES:
        raise AutomationError("target extension is not allowlisted")
    return candidate.as_posix()


def create_automation_job(payload: dict[str, Any], db_path: Path, spec_root: Path) -> dict[str, Any]:
    try:
        project_id = int(payload.get("project_id"))
        repo_id = int(payload.get("repo_id"))
    except (TypeError, ValueError) as exc:
        raise AutomationError("project_id and repo_id are required") from exc
    request = str(payload.get("request", "")).strip()
    title = str(payload.get("title", "")).strip()
    if not request or len(request) > MAX_REQUEST_CHARS:
        raise AutomationError("request must be between 1 and 6000 characters")
    if not title or len(title) > 160:
        raise AutomationError("title must be between 1 and 160 characters")
    targets = payload.get("target_paths")
    if not isinstance(targets, list) or not 1 <= len(targets) <= MAX_TARGETS:
        raise AutomationError("target_paths must contain 1 to 10 files")
    targets = list(dict.fromkeys(_validate_target(item) for item in targets))
    requirement_ids = payload.get("requirement_ids")
    known = _requirements_by_id(spec_root)
    if not isinstance(requirement_ids, list) or not requirement_ids:
        raise AutomationError("at least one requirement_id is required")
    requirement_ids = list(dict.fromkeys(str(item) for item in requirement_ids))
    unknown = [item for item in requirement_ids if item not in known]
    if unknown:
        raise AutomationError("unknown requirement IDs: " + ", ".join(unknown))
    raw_roles = payload.get("role_providers") or {}
    if not isinstance(raw_roles, dict):
        raise AutomationError("role_providers must be an object")
    try:
        role_providers = {role: int(raw_roles.get(role, 1)) for role in ROLES}
        max_retries = int(payload.get("max_retries", 2))
        timeout_seconds = int(payload.get("timeout_seconds", 300))
        token_limit = int(payload.get("token_limit", 20_000))
        cost_limit = float(payload.get("cost_limit_usd", 0))
        execution_limit = int(payload.get("execution_limit", 12))
    except (TypeError, ValueError) as exc:
        raise AutomationError("automation limits must be numeric") from exc
    if not 0 <= max_retries <= 2 or not 30 <= timeout_seconds <= 1800:
        raise AutomationError("max_retries must be 0..2 and timeout_seconds 30..1800")
    if not 100 <= token_limit <= 200_000 or not 4 <= execution_limit <= 20 or not 0 <= cost_limit <= 100:
        raise AutomationError("token, cost, or execution limit is outside the safe range")
    repo = get_repository(repo_id, db_path)
    if repo["project_id"] != project_id:
        raise AutomationError("repository does not belong to the project")
    providers = {role: _provider(provider_id, db_path) for role, provider_id in role_providers.items()}
    if any(item["kind"] != "mock" for item in providers.values()) and os.environ.get("FORGE_AUTOMATION_REAL_PROVIDERS") != "1":
        raise AutomationError("real-provider automation is disabled pending explicit verified acceptance")
    with sqlite3.connect(db_path) as connection:
        cursor = connection.execute(
            """
            INSERT INTO automation_jobs(
                project_id, repo_id, title, request, requirement_ids_json, target_paths_json,
                role_providers_json, status, max_retries, timeout_seconds, token_limit,
                cost_limit_usd, execution_limit
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 'queued', ?, ?, ?, ?, ?)
            """,
            (
                project_id, repo_id, title, request, json.dumps(requirement_ids), json.dumps(targets),
                json.dumps(role_providers, sort_keys=True), max_retries, timeout_seconds,
                token_limit, cost_limit, execution_limit,
            ),
        )
        job_id = cursor.lastrowid
        for requirement_id in requirement_ids:
            connection.execute(
                """
                INSERT INTO automation_requirement_status(job_id, requirement_id, source_location, status)
                VALUES (?, ?, ?, 'planned')
                """,
                (job_id, requirement_id, known[requirement_id]["source"]),
            )
        _audit(connection, job_id, "user", "job.create", "queued", "Natural-language automation job queued.")
    return get_automation_job(job_id, db_path)


def acquire_workspace_lock(
    workspace_key: str, job_id: int, db_path: Path, lease_seconds: int = 120,
) -> str:
    token = uuid.uuid4().hex
    now = time.time()
    with sqlite3.connect(db_path, isolation_level=None) as connection:
        connection.execute("BEGIN IMMEDIATE")
        row = connection.execute(
            "SELECT owner_job_id, lease_token, expires_at FROM automation_locks WHERE workspace_key = ?",
            (workspace_key,),
        ).fetchone()
        if row and row[2] > now and row[0] != job_id:
            connection.execute("ROLLBACK")
            raise WorkspaceLocked(f"workspace is leased by job {row[0]}")
        recovered = bool(row and row[2] <= now and row[0] != job_id)
        connection.execute(
            """
            INSERT INTO automation_locks(workspace_key, owner_job_id, lease_token, expires_at)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(workspace_key) DO UPDATE SET owner_job_id=excluded.owner_job_id,
                lease_token=excluded.lease_token, expires_at=excluded.expires_at,
                acquired_at=CURRENT_TIMESTAMP
            """,
            (workspace_key, job_id, token, now + lease_seconds),
        )
        _audit(
            connection, job_id, "system", "lock.recover" if recovered else "lock.acquire", "ok",
            "Expired workspace lease recovered." if recovered else "Exclusive workspace lease acquired.",
            {"workspace_key": workspace_key, "lease_seconds": lease_seconds},
        )
        connection.execute("COMMIT")
    return token


def renew_workspace_lock(workspace_key: str, job_id: int, token: str, db_path: Path, lease_seconds: int = 120) -> None:
    with sqlite3.connect(db_path) as connection:
        cursor = connection.execute(
            """
            UPDATE automation_locks SET expires_at = ?
            WHERE workspace_key = ? AND owner_job_id = ? AND lease_token = ?
            """,
            (time.time() + lease_seconds, workspace_key, job_id, token),
        )
        if cursor.rowcount != 1:
            raise WorkspaceLocked("workspace lease was lost")


def release_workspace_lock(workspace_key: str, job_id: int, token: str, db_path: Path) -> None:
    with sqlite3.connect(db_path) as connection:
        connection.execute(
            "DELETE FROM automation_locks WHERE workspace_key = ? AND owner_job_id = ? AND lease_token = ?",
            (workspace_key, job_id, token),
        )
        _audit(connection, job_id, "system", "lock.release", "ok", "Exclusive workspace lease released.")


def _git(args: list[str], cwd: Path) -> str:
    completed = subprocess.run(
        ["git", *args], cwd=cwd,
        env={"PATH": os.environ.get("PATH", "/usr/local/bin:/usr/bin:/bin"), "HOME": "/tmp", "GIT_TERMINAL_PROMPT": "0"},
        capture_output=True, text=True, timeout=120, check=False,
    )
    output = (completed.stdout + completed.stderr)[-MAX_OUTPUT:]
    if completed.returncode:
        raise AutomationPhaseError(f"git {args[0]} failed: {output[-1000:]}")
    return output


def _transition(job_id: int, status: str, db_path: Path, reason: str = "") -> None:
    with sqlite3.connect(db_path) as connection:
        connection.execute(
            "UPDATE automation_jobs SET status = ?, safe_stop_reason = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            (status, reason, job_id),
        )
        _audit(connection, job_id, "system", "state.transition", status, reason or f"Job entered {status}.")


def _role_start(job: dict[str, Any], role: str, db_path: Path) -> tuple[int, dict[str, Any]]:
    provider_id = job["role_providers"][role]
    provider = _provider(provider_id, db_path)
    kind = "sequential_mock_role" if provider["kind"] == "mock" else "provider_call"
    with sqlite3.connect(db_path) as connection:
        cursor = connection.execute(
            """
            INSERT INTO automation_role_runs(
                job_id, attempt, role, status, provider_id, model_id, execution_kind, independent_agent
            ) VALUES (?, ?, ?, 'running', ?, ?, ?, 0)
            """,
            (job["id"], job["attempt"], role, provider_id, provider["model_id"], kind),
        )
        connection.execute(
            "UPDATE automation_jobs SET execution_count = execution_count + 1 WHERE id = ?", (job["id"],)
        )
        _audit(
            connection, job["id"], role, "role.start", "running",
            f"{role} started as {kind}; this record does not claim an independent Agent process.",
            {"provider_id": provider_id, "model_id": provider["model_id"]},
        )
    return cursor.lastrowid, provider


def _role_finish(
    run_id: int, job_id: int, role: str, decision: dict[str, Any], db_path: Path,
    input_tokens: int, output_tokens: int, cost: float = 0,
) -> None:
    with sqlite3.connect(db_path) as connection:
        connection.execute(
            """
            UPDATE automation_role_runs SET status='completed', input_tokens=?, output_tokens=?,
                cost_usd=?, decision_json=?, finished_at=CURRENT_TIMESTAMP WHERE id=?
            """,
            (input_tokens, output_tokens, cost, json.dumps(decision, ensure_ascii=False, sort_keys=True), run_id),
        )
        connection.execute(
            """
            UPDATE automation_jobs SET used_input_tokens=used_input_tokens+?,
                used_output_tokens=used_output_tokens+?, used_cost_usd=used_cost_usd+?,
                updated_at=CURRENT_TIMESTAMP WHERE id=?
            """,
            (input_tokens, output_tokens, cost, job_id),
        )
        _audit(connection, job_id, role, "role.complete", "ok", f"{role} decision recorded.", decision)


def _role_fail(run_id: int, job_id: int, role: str, error: str, db_path: Path) -> None:
    with sqlite3.connect(db_path) as connection:
        connection.execute(
            "UPDATE automation_role_runs SET status='failed', error=?, finished_at=CURRENT_TIMESTAMP WHERE id=?",
            (error[:2000], run_id),
        )
        _audit(connection, job_id, role, "role.fail", "failed", error)


def _check_budget(job_id: int, started: float, db_path: Path) -> dict[str, Any]:
    job = get_automation_job(job_id, db_path)
    if time.monotonic() - started > job["timeout_seconds"]:
        raise AutomationPhaseError("whole-job timeout exceeded")
    if job["execution_count"] >= job["execution_limit"]:
        raise AutomationPhaseError("role execution limit exceeded")
    if job["used_input_tokens"] + job["used_output_tokens"] >= job["token_limit"]:
        raise AutomationPhaseError("whole-job token limit exceeded")
    if job["used_cost_usd"] > job["cost_limit_usd"]:
        raise AutomationPhaseError("whole-job cost limit exceeded")
    return job


def _validate_file(root: Path, relative: str) -> Path:
    candidate = (root / relative).resolve(strict=True)
    resolved = root.resolve(strict=True)
    if resolved not in candidate.parents or candidate.is_symlink() or not candidate.is_file():
        raise AutomationPhaseError(f"target rejected: {relative}")
    if candidate.stat().st_size > MAX_FILE_BYTES:
        raise AutomationPhaseError(f"target exceeds file limit: {relative}")
    return candidate


def _mock_edit(relative: str, content: str, job_id: int) -> str:
    suffix = Path(relative).suffix.lower()
    marker = f"Project Forge automation mock job {job_id}; isolated workspace only."
    if suffix in {".md", ".html"}:
        addition = f"\n<!-- {marker} -->\n"
    elif suffix == ".css":
        addition = f"\n/* {marker} */\n"
    else:
        addition = f"\n// {marker}\n"
    return content.rstrip() + addition


def _validate_workspace(root: Path) -> str:
    scripts = [
        item.relative_to(root).as_posix() for item in sorted(root.rglob("*.js"))
        if ".git" not in item.relative_to(root).parts and not item.is_symlink()
    ]
    commands = [["node", "--check", item] for item in scripts]
    if (root / "scripts" / "validate-locales.mjs").is_file():
        commands.append(["node", "scripts/validate-locales.mjs"])
    if not commands:
        raise AutomationPhaseError("no allowlisted validation command is available")
    output = []
    for command in commands:
        completed = subprocess.run(
            command, cwd=root,
            env={"PATH": os.environ.get("PATH", "/usr/local/bin:/usr/bin:/bin"), "HOME": "/tmp", "CI": "1"},
            capture_output=True, text=True, timeout=60, check=False,
        )
        output.append(f"$ {' '.join(command)}\n{completed.stdout}{completed.stderr}".rstrip())
        if completed.returncode:
            raise AutomationPhaseError("allowlisted validation failed: " + output[-1][-1000:])
    return "\n\n".join(output)[-MAX_OUTPUT:]


def _prepare_workspace(job: dict[str, Any], repo: dict[str, Any], source_repo: Path, root: Path) -> tuple[Path, str, str]:
    workspace = root / f"job-{job['id']}" / f"attempt-{job['attempt']}" / "project"
    if workspace.exists():
        shutil.rmtree(workspace)
    workspace.parent.mkdir(parents=True, exist_ok=True)
    _git(["clone", "--no-local", "--branch", repo["base_ref"], str(source_repo), str(workspace)], source_repo.parent)
    if _git(["rev-parse", "HEAD"], workspace).strip() != repo["base_sha"]:
        raise AutomationPhaseError("registered base SHA changed")
    branch = f"forge/automation-{job['id']}-attempt-{job['attempt']}"
    if branch in PROTECTED_BRANCHES or branch.startswith(("opencode-resume/", "opencode-checkpoints/")):
        raise AutomationPhaseError("protected branch rejected")
    _git(["switch", "-c", branch], workspace)
    before = {}
    for relative in job["target_paths"]:
        target = _validate_file(workspace, relative)
        before[relative] = target.read_text(encoding="utf-8")
        target.write_text(_mock_edit(relative, before[relative], job["id"]), encoding="utf-8")
    _git(["diff", "--check"], workspace)
    diff = _git(["diff", "--no-ext-diff", "--", *job["target_paths"]], workspace)
    if not diff:
        raise AutomationPhaseError("Engineer produced no diff")
    changed = [item for item in _git(["diff", "--name-only"], workspace).splitlines() if item]
    if sorted(changed) != sorted(job["target_paths"]):
        raise AutomationPhaseError("changed files do not match the reviewed allowlist")
    scan_secrets(diff)
    return workspace, branch, diff


def run_automation_job(
    job_id: int, db_path: Path, spec_root: Path, source_repo: Path, automation_root: Path,
    preview_root: Path, artifact_root: Path, vite_entry: Path, quality_script: Path,
    browser_endpoint: str, failure_mode: str = "",
    quality_callback: Callable[[dict[str, Any]], dict[str, Any]] | None = None,
) -> dict[str, Any]:
    initial = get_automation_job(job_id, db_path)
    repo = get_repository(initial["repo_id"], db_path)
    lock_key = f"repo:{repo['id']}:base:{repo['base_sha']}"
    token = acquire_workspace_lock(lock_key, job_id, db_path, max(initial["timeout_seconds"] + 30, 120))
    started = time.monotonic()
    try:
        for attempt in range(1, initial["max_retries"] + 2):
            with sqlite3.connect(db_path) as connection:
                connection.execute("UPDATE automation_jobs SET attempt=?, updated_at=CURRENT_TIMESTAMP WHERE id=?", (attempt, job_id))
                _audit(connection, job_id, "system", "attempt.start", "running", f"Attempt {attempt} started.")
            try:
                job = _check_budget(job_id, started, db_path)
                renew_workspace_lock(lock_key, job_id, token, db_path, max(job["timeout_seconds"] + 30, 120))

                _transition(job_id, "planning", db_path)
                run_id, _ = _role_start(job, "planner", db_path)
                plan = {
                    "ticket": job["title"], "acceptance": job["requirement_ids"],
                    "write_allowlist": job["target_paths"],
                    "context": [item["source_location"] for item in job["requirements"]],
                    "request_characters": len(job["request"]),
                }
                _role_finish(run_id, job_id, "planner", plan, db_path, max(1, len(job["request"]) // 4), 80)

                job = _check_budget(job_id, started, db_path)
                _transition(job_id, "engineering", db_path)
                run_id, _ = _role_start(job, "engineer", db_path)
                try:
                    workspace, branch, diff = _prepare_workspace(job, repo, source_repo, automation_root)
                    if failure_mode == "engineer_always":
                        raise AutomationPhaseError("injected recoverable Engineer failure")
                    decision = {"workspace": str(workspace), "branch": branch, "files": job["target_paths"], "diff_checked": True}
                    _role_finish(run_id, job_id, "engineer", decision, db_path, 120, max(1, len(diff) // 4))
                except Exception as exc:
                    _role_fail(run_id, job_id, "engineer", str(exc), db_path)
                    raise
                with sqlite3.connect(db_path) as connection:
                    connection.execute(
                        "UPDATE automation_jobs SET workspace_path=?, branch=?, diff=?, updated_at=CURRENT_TIMESTAMP WHERE id=?",
                        (str(workspace), branch, diff, job_id),
                    )

                job = _check_budget(job_id, started, db_path)
                _transition(job_id, "qa", db_path)
                run_id, _ = _role_start(job, "qa", db_path)
                try:
                    validation = _validate_workspace(workspace)
                    _role_finish(
                        run_id, job_id, "qa", {"build_test": "passed", "commands": "forge-owned allowlist", "output": validation[-2000:]},
                        db_path, 100, 100,
                    )
                except Exception as exc:
                    _role_fail(run_id, job_id, "qa", str(exc), db_path)
                    raise

                job = _check_budget(job_id, started, db_path)
                _transition(job_id, "reviewing", db_path)
                run_id, _ = _role_start(job, "reviewer", db_path)
                changed = [item for item in _git(["diff", "--name-only"], workspace).splitlines() if item]
                review = {
                    "red_team": {"secrets": "passed", "protected_branch": False, "unexpected_files": sorted(changed) != sorted(job["target_paths"])},
                    "blue_team": {"requirements": job["requirement_ids"], "build_test": "passed", "regression_pending_quality_gate": True},
                    "approved_for_quality_gate": sorted(changed) == sorted(job["target_paths"]),
                }
                if not review["approved_for_quality_gate"]:
                    _role_fail(run_id, job_id, "reviewer", "review rejected unexpected files", db_path)
                    raise AutomationPhaseError("Reviewer rejected the change")
                _role_finish(run_id, job_id, "reviewer", review, db_path, 100, 120)

                _check_budget(job_id, started, db_path)
                _transition(job_id, "quality_gate", db_path)
                if quality_callback:
                    quality = quality_callback({"workspace": workspace, "job": job})
                else:
                    preview = start_trusted_workspace_preview(
                        job["project_id"], workspace, automation_root, db_path, preview_root, vite_entry,
                    )
                    try:
                        quality = run_quality_gate(
                            preview["id"], db_path, artifact_root, quality_script, browser_endpoint,
                        )
                    finally:
                        stop_preview(preview["id"], db_path)
                if not quality.get("gate_passed"):
                    raise AutomationPhaseError("Task 04 Quality Gate rejected the change")
                with sqlite3.connect(db_path) as connection:
                    pr_draft = {
                        "title": job["title"], "body": "Controlled Forge automation draft; human authorization required.",
                        "head": branch, "base": repo["default_branch"], "external_action": "not_performed",
                    }
                    connection.execute(
                        """
                        UPDATE automation_jobs SET status='awaiting_pr_approval', quality_run_id=?,
                            pr_draft_json=?, safe_stop_reason='', updated_at=CURRENT_TIMESTAMP WHERE id=?
                        """,
                        (quality.get("id"), json.dumps(pr_draft), job_id),
                    )
                    for requirement_id in job["requirement_ids"]:
                        connection.execute(
                            """
                            UPDATE automation_requirement_status SET status='verified',
                                code_refs_json=?, test_refs_json=? WHERE job_id=? AND requirement_id=?
                            """,
                            (json.dumps(changed), json.dumps(["Build", "Locale", "Playwright Quality Gate"]), job_id, requirement_id),
                        )
                    _audit(connection, job_id, "quality_gate", "gate.pass", "ok", "Quality Gate passed; PR draft prepared without external write.")
                return get_automation_job(job_id, db_path)
            except (AutomationError, OSError, subprocess.TimeoutExpired) as exc:
                with sqlite3.connect(db_path) as connection:
                    _audit(connection, job_id, "system", "attempt.fail", "failed", str(exc), {"attempt": attempt})
                if attempt <= initial["max_retries"]:
                    _transition(job_id, "retrying", db_path, f"Attempt {attempt} failed; bounded retry scheduled.")
                    continue
                reason = f"Safe stop after {attempt} attempts: {exc}"
                _transition(job_id, "safe_stopped", db_path, reason)
                return get_automation_job(job_id, db_path)
        raise AutomationError("unreachable automation state")
    finally:
        release_workspace_lock(lock_key, job_id, token, db_path)


def get_automation_job(job_id: int, db_path: Path) -> dict[str, Any]:
    with sqlite3.connect(db_path) as connection:
        connection.row_factory = sqlite3.Row
        row = connection.execute("SELECT * FROM automation_jobs WHERE id=?", (job_id,)).fetchone()
        if row is None:
            raise AutomationError("automation job not found")
        job = dict(row)
        roles = [dict(item) for item in connection.execute(
            "SELECT * FROM automation_role_runs WHERE job_id=? ORDER BY id", (job_id,)
        )]
        audit = [dict(item) for item in connection.execute(
            "SELECT actor, action, status, message, details_json, created_at FROM automation_audit WHERE job_id=? ORDER BY id",
            (job_id,),
        )]
        requirements = [dict(item) for item in connection.execute(
            "SELECT * FROM automation_requirement_status WHERE job_id=? ORDER BY requirement_id", (job_id,)
        )]
    for field in ("requirement_ids", "target_paths", "role_providers", "pr_draft"):
        job[field] = json.loads(job.pop(f"{field}_json"))
    for role in roles:
        role["decision"] = json.loads(role.pop("decision_json"))
        role["independent_agent"] = bool(role["independent_agent"])
    for item in audit:
        item["details"] = json.loads(item.pop("details_json"))
    for item in requirements:
        item["code_refs"] = json.loads(item.pop("code_refs_json"))
        item["test_refs"] = json.loads(item.pop("test_refs_json"))
    job["roles"] = roles
    job["audit"] = audit
    job["requirements"] = requirements
    return job


def list_automation_jobs(db_path: Path) -> list[dict[str, Any]]:
    with sqlite3.connect(db_path) as connection:
        ids = [row[0] for row in connection.execute("SELECT id FROM automation_jobs ORDER BY id DESC")]
    return [get_automation_job(item, db_path) for item in ids]


def provider_acceptance_status(db_path: Path) -> dict[str, Any]:
    with sqlite3.connect(db_path) as connection:
        connection.row_factory = sqlite3.Row
        providers = [dict(row) for row in connection.execute(
            "SELECT id, name, kind, model_id FROM providers ORDER BY id"
        )]
    return {
        "real_automation_enabled": os.environ.get("FORGE_AUTOMATION_REAL_PROVIDERS") == "1",
        "real_inference_verified": False,
        "providers": providers,
        "acceptance_steps": [
            "Configure credentials only in the server environment or local Ollama endpoint.",
            "Run provider diagnosis without a paid generation request.",
            "Set explicit per-task token, cost, timeout, retry, and execution limits.",
            "Run a user-authorized non-production canary and compare its structured output to Mock expectations.",
            "Keep external GitHub writes disabled until a separate explicit authorization.",
        ],
    }
