from __future__ import annotations

import hashlib
import json
import os
import shutil
import sqlite3
import tarfile
import time
import uuid
from pathlib import Path
from typing import Any


class OperationsError(RuntimeError):
    pass


def init_operations_db(db_path: Path) -> None:
    with sqlite3.connect(db_path) as connection:
        connection.executescript(
            """
            CREATE TABLE IF NOT EXISTS worker_jobs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                idempotency_key TEXT NOT NULL UNIQUE,
                kind TEXT NOT NULL,
                payload_json TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'queued',
                attempts INTEGER NOT NULL DEFAULT 0,
                max_attempts INTEGER NOT NULL DEFAULT 3,
                lease_token TEXT NOT NULL DEFAULT '',
                lease_expires_at REAL NOT NULL DEFAULT 0,
                heartbeat_at REAL,
                cancel_requested INTEGER NOT NULL DEFAULT 0,
                result_json TEXT NOT NULL DEFAULT '{}',
                error TEXT NOT NULL DEFAULT '',
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS worker_dead_letters (
                job_id INTEGER PRIMARY KEY,
                kind TEXT NOT NULL,
                payload_digest TEXT NOT NULL,
                attempts INTEGER NOT NULL,
                error TEXT NOT NULL,
                failed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS backup_runs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                destination TEXT NOT NULL,
                manifest_json TEXT NOT NULL,
                status TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                verified_at TEXT
            );
            """
        )
    recover_expired_jobs(db_path)


def enqueue(kind: str, payload: dict[str, Any], idempotency_key: str, db_path: Path, max_attempts: int = 3) -> dict[str, Any]:
    if not idempotency_key or len(idempotency_key) > 200 or not 1 <= max_attempts <= 5:
        raise OperationsError("invalid queue limits")
    with sqlite3.connect(db_path) as connection:
        connection.row_factory = sqlite3.Row
        connection.execute(
            "INSERT OR IGNORE INTO worker_jobs(idempotency_key,kind,payload_json,max_attempts) VALUES (?,?,?,?)",
            (idempotency_key, kind, json.dumps(payload, sort_keys=True), max_attempts),
        )
        row = connection.execute("SELECT * FROM worker_jobs WHERE idempotency_key=?", (idempotency_key,)).fetchone()
    return _job(row)


def claim(db_path: Path, lease_seconds: int = 60) -> dict[str, Any] | None:
    now, token = time.time(), uuid.uuid4().hex
    with sqlite3.connect(db_path, isolation_level=None) as connection:
        connection.row_factory = sqlite3.Row
        connection.execute("BEGIN IMMEDIATE")
        row = connection.execute(
            "SELECT * FROM worker_jobs WHERE status='queued' AND cancel_requested=0 ORDER BY id LIMIT 1"
        ).fetchone()
        if not row:
            connection.execute("COMMIT")
            return None
        connection.execute(
            "UPDATE worker_jobs SET status='running',attempts=attempts+1,lease_token=?,lease_expires_at=?,heartbeat_at=?,updated_at=CURRENT_TIMESTAMP WHERE id=?",
            (token, now + lease_seconds, now, row["id"]),
        )
        connection.execute("COMMIT")
    return get_job(row["id"], db_path)


def heartbeat(job_id: int, token: str, db_path: Path, lease_seconds: int = 60) -> None:
    with sqlite3.connect(db_path) as connection:
        updated = connection.execute(
            "UPDATE worker_jobs SET heartbeat_at=?,lease_expires_at=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND status='running' AND lease_token=?",
            (time.time(), time.time() + lease_seconds, job_id, token),
        ).rowcount
    if updated != 1:
        raise OperationsError("worker lease lost")


def finish(job_id: int, token: str, result: dict[str, Any], db_path: Path) -> dict[str, Any]:
    with sqlite3.connect(db_path) as connection:
        updated = connection.execute(
            "UPDATE worker_jobs SET status='completed',result_json=?,lease_token='',lease_expires_at=0,updated_at=CURRENT_TIMESTAMP WHERE id=? AND status='running' AND lease_token=? AND cancel_requested=0",
            (json.dumps(result, sort_keys=True), job_id, token),
        ).rowcount
    if updated != 1:
        raise OperationsError("job cannot be completed")
    return get_job(job_id, db_path)


def fail(job_id: int, token: str, error: str, db_path: Path) -> dict[str, Any]:
    with sqlite3.connect(db_path) as connection:
        row = connection.execute("SELECT kind,payload_json,attempts,max_attempts FROM worker_jobs WHERE id=? AND lease_token=?", (job_id, token)).fetchone()
        if not row:
            raise OperationsError("worker lease lost")
        status = "dead_letter" if row[2] >= row[3] else "queued"
        connection.execute("UPDATE worker_jobs SET status=?,error=?,lease_token='',lease_expires_at=0,updated_at=CURRENT_TIMESTAMP WHERE id=?", (status, error[:2000], job_id))
        if status == "dead_letter":
            connection.execute(
                "INSERT OR REPLACE INTO worker_dead_letters(job_id,kind,payload_digest,attempts,error) VALUES (?,?,?,?,?)",
                (job_id, row[0], hashlib.sha256(row[1].encode()).hexdigest(), row[2], error[:2000]),
            )
    return get_job(job_id, db_path)


def cancel(job_id: int, db_path: Path) -> dict[str, Any]:
    with sqlite3.connect(db_path) as connection:
        connection.execute(
            "UPDATE worker_jobs SET cancel_requested=1,status=CASE WHEN status='queued' THEN 'cancelled' ELSE status END,updated_at=CURRENT_TIMESTAMP WHERE id=? AND status IN ('queued','running')",
            (job_id,),
        )
    return get_job(job_id, db_path)


def recover_expired_jobs(db_path: Path) -> int:
    with sqlite3.connect(db_path) as connection:
        rows = connection.execute("SELECT id,attempts,max_attempts FROM worker_jobs WHERE status='running' AND lease_expires_at<=?", (time.time(),)).fetchall()
        for job_id, attempts, maximum in rows:
            status = "dead_letter" if attempts >= maximum else "queued"
            connection.execute("UPDATE worker_jobs SET status=?,lease_token='',lease_expires_at=0,error='worker lease expired; recovered after crash',updated_at=CURRENT_TIMESTAMP WHERE id=?", (status, job_id))
    return len(rows)


def _job(row: sqlite3.Row | None) -> dict[str, Any]:
    if row is None:
        raise OperationsError("job not found")
    value = dict(row)
    value["payload"] = json.loads(value.pop("payload_json"))
    value["result"] = json.loads(value.pop("result_json"))
    value["cancel_requested"] = bool(value["cancel_requested"])
    return value


def get_job(job_id: int, db_path: Path) -> dict[str, Any]:
    with sqlite3.connect(db_path) as connection:
        connection.row_factory = sqlite3.Row
        return _job(connection.execute("SELECT * FROM worker_jobs WHERE id=?", (job_id,)).fetchone())


def metrics(db_path: Path) -> dict[str, Any]:
    with sqlite3.connect(db_path) as connection:
        connection.row_factory = sqlite3.Row
        scalar = lambda sql: connection.execute(sql).fetchone()[0]
        automation_total = scalar("SELECT COUNT(*) FROM automation_jobs")
        automation_passed = scalar("SELECT COUNT(*) FROM automation_jobs WHERE status='awaiting_pr_approval'")
        quality_total = scalar("SELECT COUNT(*) FROM preview_quality_runs")
        quality_passed = scalar("SELECT COUNT(*) FROM preview_quality_runs WHERE gate_passed=1")
        agent_total = scalar("SELECT COUNT(*) FROM agent_tasks")
        agent_completed = scalar("SELECT COUNT(*) FROM agent_tasks WHERE status='completed'")
        average_run_seconds = scalar("SELECT COALESCE(AVG((julianday(finished_at)-julianday(started_at))*86400),0) FROM runs WHERE finished_at IS NOT NULL")
        queue = {row[0]: row[1] for row in connection.execute("SELECT status,COUNT(*) FROM worker_jobs GROUP BY status")}
        errors = [dict(row) for row in connection.execute(
            "SELECT action,status,message,created_at FROM automation_audit WHERE status IN ('failed','denied','safe_stopped','error') ORDER BY id DESC LIMIT 20"
        )]
        github = [dict(row) for row in connection.execute("SELECT owner,name,status,conflict,sync_error,last_sync_at FROM github_repositories ORDER BY id")]
        tokens, cost = connection.execute("SELECT COALESCE(SUM(used_input_tokens+used_output_tokens),0),COALESCE(SUM(used_cost_usd),0) FROM automation_jobs").fetchone()
    memory = None
    try:
        memory = int(Path("/sys/fs/cgroup/memory.current").read_text().strip())
    except (OSError, ValueError):
        pass
    return {
        "agents": {"total": agent_total, "completed": agent_completed, "success_rate": agent_completed / agent_total if agent_total else None},
        "automation": {"total": automation_total, "passed": automation_passed, "success_rate": automation_passed / automation_total if automation_total else None, "tokens": tokens, "cost_usd": cost},
        "quality": {"total": quality_total, "passed": quality_passed, "pass_rate": quality_passed / quality_total if quality_total else None},
        "execution": {"average_recorded_run_seconds": average_run_seconds},
        "queue": queue, "github": github, "recent_errors": errors,
        "resources": {"memory_current_bytes": memory, "cpu_count": os.cpu_count()},
        "source": "persisted SQLite records and current cgroup",
    }


def _sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def create_backup(db_path: Path, source_repo: Path, data_root: Path, destination: Path) -> dict[str, Any]:
    destination.mkdir(parents=True, exist_ok=False)
    database_copy = destination / "forge.db"
    with sqlite3.connect(db_path) as source, sqlite3.connect(database_copy) as target:
        source.backup(target)
    refs = destination / "git-refs.txt"
    completed = __import__("subprocess").run(["git", "show-ref", "--head"], cwd=source_repo, capture_output=True, text=True, check=True)
    refs.write_text(completed.stdout, encoding="utf-8")
    snapshot = destination / "workspaces.tar.gz"
    with tarfile.open(snapshot, "w:gz") as archive:
        for name in ("agent-tasks", "git-tasks", "automation-jobs", "preview-artifacts"):
            item = data_root / name
            if item.exists():
                archive.add(item, arcname=name, recursive=True)
    manifest = {item.name: {"sha256": _sha256(item), "bytes": item.stat().st_size} for item in (database_copy, refs, snapshot)}
    (destination / "manifest.json").write_text(json.dumps(manifest, indent=2, sort_keys=True), encoding="utf-8")
    with sqlite3.connect(db_path) as connection:
        connection.execute("INSERT INTO backup_runs(destination,manifest_json,status,verified_at) VALUES (?,?,'verified',CURRENT_TIMESTAMP)", (str(destination), json.dumps(manifest, sort_keys=True)))
    return {"destination": str(destination), "manifest": manifest, "status": "verified"}


def restore_drill(backup: Path, target: Path) -> dict[str, Any]:
    manifest = json.loads((backup / "manifest.json").read_text(encoding="utf-8"))
    for name, expected in manifest.items():
        item = backup / name
        if not item.is_file() or _sha256(item) != expected["sha256"]:
            raise OperationsError(f"backup integrity failed: {name}")
    target.mkdir(parents=True, exist_ok=False)
    shutil.copy2(backup / "forge.db", target / "forge.db")
    with sqlite3.connect(target / "forge.db") as connection:
        integrity = connection.execute("PRAGMA integrity_check").fetchone()[0]
        tables = connection.execute("SELECT COUNT(*) FROM sqlite_master WHERE type='table'").fetchone()[0]
    with tarfile.open(backup / "workspaces.tar.gz", "r:gz") as archive:
        members = archive.getmembers()
        if any(Path(member.name).is_absolute() or ".." in Path(member.name).parts or member.issym() or member.islnk() for member in members):
            raise OperationsError("unsafe backup archive member")
        archive.extractall(target / "workspaces", filter="data")
    if integrity != "ok":
        raise OperationsError("restored SQLite integrity check failed")
    return {"status": "restored_and_verified", "sqlite_integrity": integrity, "table_count": tables, "workspace_entries": len(members)}
