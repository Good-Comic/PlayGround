from __future__ import annotations

import hashlib
import json
import os
import shutil
import socket
import sqlite3
import subprocess
import time
import statistics
import tarfile
import tempfile
from dataclasses import dataclass
from pathlib import Path
from typing import Any
from urllib.request import urlopen


class PreviewError(RuntimeError):
    pass


@dataclass(frozen=True)
class GameEngineAdapter:
    adapter_id: str
    label: str

    def supports(self, root: Path) -> bool:
        raise NotImplementedError

    def validation_commands(self, root: Path) -> list[list[str]]:
        raise NotImplementedError


class WebRtsAdapter(GameEngineAdapter):
    def __init__(self) -> None:
        super().__init__("web-rts-esm", "Web RTS (HTML/CSS/JavaScript ES modules)")

    def supports(self, root: Path) -> bool:
        return (root / "index.html").is_file() and any(root.rglob("*.js"))

    def validation_commands(self, root: Path) -> list[list[str]]:
        scripts = [
            item.relative_to(root).as_posix() for item in sorted(root.rglob("*.js"))
            if ".git" not in item.relative_to(root).parts and not item.is_symlink()
        ]
        commands = [["node", "--check", script] for script in scripts]
        if (root / "scripts" / "validate-locales.mjs").is_file():
            commands.append(["node", "scripts/validate-locales.mjs"])
        return commands


ADAPTERS = (WebRtsAdapter(),)
PROCESSES: dict[int, subprocess.Popen[str]] = {}
MAX_PREVIEW_WORKSPACE_BYTES = 256 * 1024 * 1024


def init_preview_db(db_path: Path) -> None:
    with sqlite3.connect(db_path) as connection:
        connection.executescript(
            """
            CREATE TABLE IF NOT EXISTS preview_sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                project_id INTEGER NOT NULL,
                task_id INTEGER,
                adapter_id TEXT NOT NULL,
                workspace_path TEXT NOT NULL,
                port INTEGER NOT NULL UNIQUE,
                status TEXT NOT NULL,
                source_manifest_json TEXT NOT NULL,
                startup_log TEXT NOT NULL DEFAULT '',
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                stopped_at TEXT,
                FOREIGN KEY(project_id) REFERENCES projects(id),
                FOREIGN KEY(task_id) REFERENCES agent_tasks(id)
            );
            CREATE TABLE IF NOT EXISTS preview_quality_runs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                preview_id INTEGER NOT NULL,
                status TEXT NOT NULL,
                gate_passed INTEGER NOT NULL,
                console_json TEXT NOT NULL,
                page_errors_json TEXT NOT NULL,
                load_failures_json TEXT NOT NULL,
                modified_json TEXT NOT NULL,
                metrics_json TEXT NOT NULL,
                visual_json TEXT NOT NULL,
                success_screenshot TEXT NOT NULL DEFAULT '',
                failure_screenshot TEXT NOT NULL DEFAULT '',
                rollback_path TEXT NOT NULL,
                log TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                finished_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(preview_id) REFERENCES preview_sessions(id)
            );
            CREATE TABLE IF NOT EXISTS preview_goldens (
                preview_id INTEGER PRIMARY KEY,
                project_id INTEGER,
                adapter_id TEXT,
                artifact_path TEXT NOT NULL,
                source_run_id INTEGER NOT NULL,
                approved_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                viewport TEXT NOT NULL DEFAULT '1440x900',
                browser_version TEXT NOT NULL DEFAULT 'unknown',
                artifact_sha256 TEXT NOT NULL DEFAULT '',
                approval_json TEXT NOT NULL DEFAULT '{}',
                FOREIGN KEY(preview_id) REFERENCES preview_sessions(id),
                FOREIGN KEY(source_run_id) REFERENCES preview_quality_runs(id)
            );
            CREATE TABLE IF NOT EXISTS preview_performance_suites (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                preview_id INTEGER NOT NULL,
                sample_count INTEGER NOT NULL,
                conditions_json TEXT NOT NULL,
                samples_json TEXT NOT NULL,
                summary_json TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(preview_id) REFERENCES preview_sessions(id)
            );
            """
        )
        golden_columns = {row[1] for row in connection.execute("PRAGMA table_info(preview_goldens)")}
        if "project_id" not in golden_columns:
            connection.execute("ALTER TABLE preview_goldens ADD COLUMN project_id INTEGER")
        if "adapter_id" not in golden_columns:
            connection.execute("ALTER TABLE preview_goldens ADD COLUMN adapter_id TEXT")
        for name, definition in (
            ("viewport", "TEXT NOT NULL DEFAULT '1440x900'"),
            ("browser_version", "TEXT NOT NULL DEFAULT 'unknown'"),
            ("artifact_sha256", "TEXT NOT NULL DEFAULT ''"),
            ("approval_json", "TEXT NOT NULL DEFAULT '{}'"),
        ):
            if name not in golden_columns:
                connection.execute(f"ALTER TABLE preview_goldens ADD COLUMN {name} {definition}")
        connection.execute(
            """
            UPDATE preview_goldens SET
                project_id = (SELECT project_id FROM preview_sessions WHERE id = preview_goldens.preview_id),
                adapter_id = (SELECT adapter_id FROM preview_sessions WHERE id = preview_goldens.preview_id)
            WHERE project_id IS NULL OR adapter_id IS NULL
            """
        )
        connection.execute(
            "CREATE UNIQUE INDEX IF NOT EXISTS preview_goldens_project_adapter ON preview_goldens(project_id, adapter_id)"
        )
        interrupted = connection.execute(
            "SELECT id FROM preview_sessions WHERE status IN ('starting', 'running')"
        ).fetchall()
        for (preview_id,) in interrupted:
            connection.execute(
                """
                UPDATE preview_sessions SET status = 'stopped', port = ?, stopped_at = CURRENT_TIMESTAMP,
                    startup_log = startup_log || ' Process ended with Studio restart.' WHERE id = ?
                """,
                (-preview_id, preview_id),
            )


def list_adapters() -> list[dict[str, Any]]:
    return [{"id": item.adapter_id, "label": item.label} for item in ADAPTERS]


def _manifest(root: Path) -> dict[str, dict[str, Any]]:
    result = {}
    for item in sorted(root.rglob("*")):
        relative = item.relative_to(root)
        if not item.is_file() or item.is_symlink() or any(part in {".git", ".vite"} for part in relative.parts):
            continue
        data = item.read_bytes()
        result[relative.as_posix()] = {
            "sha256": hashlib.sha256(data).hexdigest(), "size": len(data),
            "mtime_ns": item.stat().st_mtime_ns,
        }
    return result


def _tree_size(root: Path) -> int:
    return sum(item.stat().st_size for item in root.rglob("*") if item.is_file() and not item.is_symlink())


def _row(row: sqlite3.Row | None, message: str) -> dict[str, Any]:
    if row is None:
        raise PreviewError(message)
    return dict(row)


def get_preview(preview_id: int, db_path: Path) -> dict[str, Any]:
    with sqlite3.connect(db_path) as connection:
        connection.row_factory = sqlite3.Row
        preview = _row(connection.execute(
            "SELECT * FROM preview_sessions WHERE id = ?", (preview_id,)
        ).fetchone(), "preview not found")
        golden = connection.execute(
            """
            SELECT artifact_path, source_run_id, approved_at, viewport, browser_version,
                   artifact_sha256, approval_json FROM preview_goldens
            WHERE project_id = ? AND adapter_id = ?
            """,
            (preview["project_id"], preview["adapter_id"]),
        ).fetchone()
    preview["source_manifest"] = json.loads(preview.pop("source_manifest_json"))
    preview["preview_url"] = f"http://127.0.0.1:{preview['port']}/" if preview["status"] == "running" else ""
    preview["golden"] = dict(golden) if golden else None
    if preview["golden"]:
        preview["golden"]["approval"] = json.loads(preview["golden"].pop("approval_json"))
    preview["recent_files"] = recent_files(preview)
    preview["source_file_count"] = len(preview.pop("source_manifest"))
    return preview


def list_previews(db_path: Path) -> list[dict[str, Any]]:
    with sqlite3.connect(db_path) as connection:
        ids = [row[0] for row in connection.execute("SELECT id FROM preview_sessions ORDER BY id DESC")]
    return [get_preview(item, db_path) for item in ids]


def recent_files(preview: dict[str, Any]) -> list[dict[str, Any]]:
    root = Path(preview["workspace_path"])
    before = preview.get("source_manifest") or json.loads(preview.get("source_manifest_json", "{}"))
    current = _manifest(root) if root.is_dir() else {}
    changed = []
    for path in sorted(set(before) | set(current)):
        if before.get(path, {}).get("sha256") != current.get(path, {}).get("sha256"):
            changed.append({"path": path, "state": "deleted" if path not in current else "modified"})
    return changed[:200]


def _available_port(start: int = 5173, end: int = 5182) -> int:
    for port in range(start, end + 1):
        with socket.socket() as candidate:
            try:
                candidate.bind(("0.0.0.0", port))
            except OSError:
                continue
        return port
    raise PreviewError("no preview port is available")


def _wait_ready(port: int, process: subprocess.Popen[str]) -> None:
    deadline = time.monotonic() + 20
    while time.monotonic() < deadline:
        if process.poll() is not None:
            raise PreviewError("Vite stopped during startup")
        try:
            with urlopen(f"http://127.0.0.1:{port}/", timeout=1) as response:
                if response.status == 200:
                    return
        except OSError:
            time.sleep(0.2)
    raise PreviewError("Vite preview readiness timed out")


def _launch_preview(
    project_id: int, task_id: int | None, source: Path, db_path: Path,
    preview_root: Path, vite_entry: Path, port_start: int, port_end: int,
) -> dict[str, Any]:
    adapter = next((item for item in ADAPTERS if item.supports(source)), None)
    if adapter is None:
        raise PreviewError("no game engine adapter supports this project")
    if _tree_size(source) > MAX_PREVIEW_WORKSPACE_BYTES:
        raise PreviewError("preview source exceeds the 256 MiB quota")
    if not vite_entry.is_file():
        raise PreviewError("Vite runtime is not installed")
    vite_config = vite_entry.parents[3] / "vite.config.mjs"
    if not vite_config.is_file():
        raise PreviewError("Vite security configuration is unavailable")
    preview_root.mkdir(parents=True, exist_ok=True)
    port = _available_port(port_start, port_end)
    with sqlite3.connect(db_path) as connection:
        cursor = connection.execute(
            """
            INSERT INTO preview_sessions(project_id, task_id, adapter_id, workspace_path, port, status, source_manifest_json)
            VALUES (?, ?, ?, '', ?, 'starting', '{}')
            """,
            (project_id, task_id, adapter.adapter_id, port),
        )
        preview_id = cursor.lastrowid
    destination = preview_root / f"preview-{preview_id}" / "project"
    process = None
    try:
        shutil.copytree(source, destination, symlinks=False, ignore=shutil.ignore_patterns(".git", "node_modules"))
        destination.chmod(0o700)
        manifest = _manifest(destination)
        command = [
            "node", str(vite_entry), str(destination), "--host", "0.0.0.0", "--port", str(port),
            "--strictPort", "--config", str(vite_config), "--configLoader", "runner",
        ]
        environment = {
            "PATH": os.environ.get("PATH", "/usr/local/bin:/usr/bin:/bin"), "HOME": "/tmp",
            "NODE_ENV": "development", "FORGE_PREVIEW_PORT": str(port),
        }
        process = subprocess.Popen(
            command, cwd=destination, env=environment, stdout=subprocess.DEVNULL,
            stderr=subprocess.STDOUT, text=True,
        )
        _wait_ready(port, process)
    except Exception as exc:
        if process is not None:
            process.terminate()
        with sqlite3.connect(db_path) as connection:
            connection.execute(
                "UPDATE preview_sessions SET status = 'failed', port = ?, workspace_path = ?, startup_log = ? WHERE id = ?",
                (-preview_id, str(destination), str(exc)[:4000], preview_id),
            )
        raise
    PROCESSES[preview_id] = process
    with sqlite3.connect(db_path) as connection:
        connection.execute(
            """
            UPDATE preview_sessions SET workspace_path = ?, port = ?, status = 'running',
                source_manifest_json = ?, startup_log = ? WHERE id = ?
            """,
            (str(destination), port, json.dumps(manifest, sort_keys=True), f"Vite ready on isolated port {port}.", preview_id),
        )
    return get_preview(preview_id, db_path)


def start_preview(
    project_id: int, task_id: int | None, db_path: Path, workspace_root: Path,
    preview_root: Path, vite_entry: Path, port_start: int = 5173, port_end: int = 5182,
) -> dict[str, Any]:
    with sqlite3.connect(db_path) as connection:
        connection.row_factory = sqlite3.Row
        project = _row(connection.execute(
            "SELECT * FROM projects WHERE id = ?", (project_id,)
        ).fetchone(), "project not found")
        task = None
        if task_id is not None:
            task = _row(connection.execute(
                "SELECT * FROM agent_tasks WHERE id = ?", (task_id,)
            ).fetchone(), "agent task not found")
    source = (workspace_root / project["relative_path"]).resolve(strict=True)
    workspace_resolved = workspace_root.resolve(strict=True)
    if workspace_resolved not in source.parents:
        raise PreviewError("project is outside the read-only workspace")
    if task:
        if task["project_id"] != project_id or task["status"] != "completed":
            raise PreviewError("preview task must be a completed task for this project")
        source = Path(task["workspace_path"]).resolve(strict=True)
    return _launch_preview(
        project_id, task_id, source, db_path, preview_root, vite_entry, port_start, port_end,
    )


def start_trusted_workspace_preview(
    project_id: int, source: Path, allowed_root: Path, db_path: Path,
    preview_root: Path, vite_entry: Path, port_start: int = 5173, port_end: int = 5182,
) -> dict[str, Any]:
    source = source.resolve(strict=True)
    allowed = allowed_root.resolve(strict=True)
    if allowed not in source.parents:
        raise PreviewError("automation workspace is outside the trusted root")
    return _launch_preview(
        project_id, None, source, db_path, preview_root, vite_entry, port_start, port_end,
    )


def stop_preview(preview_id: int, db_path: Path) -> dict[str, Any]:
    preview = get_preview(preview_id, db_path)
    process = PROCESSES.pop(preview_id, None)
    if process and process.poll() is None:
        process.terminate()
        try:
            process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            process.kill()
    with sqlite3.connect(db_path) as connection:
        connection.execute(
            "UPDATE preview_sessions SET status = 'stopped', port = ?, stopped_at = CURRENT_TIMESTAMP WHERE id = ?",
            (-preview_id, preview_id),
        )
    return get_preview(preview_id, db_path)


def _process_metrics(preview_id: int) -> dict[str, Any]:
    process = PROCESSES.get(preview_id)
    if not process or process.poll() is not None:
        return {"vite_pid": None, "vite_rss_bytes": None}
    try:
        fields = Path(f"/proc/{process.pid}/status").read_text().splitlines()
        rss = next(int(line.split()[1]) * 1024 for line in fields if line.startswith("VmRSS:"))
    except (OSError, StopIteration, ValueError):
        rss = None
    try:
        container_memory = int(Path("/sys/fs/cgroup/memory.current").read_text().strip())
    except (OSError, ValueError):
        container_memory = None
    return {
        "vite_pid": process.pid, "vite_rss_bytes": rss,
        "forge_container_memory_bytes": container_memory,
    }


def run_quality_gate(
    preview_id: int, db_path: Path, artifact_root: Path, quality_script: Path,
    browser_endpoint: str,
) -> dict[str, Any]:
    preview = get_preview(preview_id, db_path)
    if preview["status"] != "running":
        raise PreviewError("preview must be running")
    if not quality_script.is_file():
        raise PreviewError("quality runner is unavailable")
    artifact_root.mkdir(parents=True, exist_ok=True)
    run_dir = artifact_root / f"preview-{preview_id}" / f"run-{int(time.time() * 1000)}"
    run_dir.mkdir(parents=True)
    rollback = run_dir / "rollback"
    shutil.copytree(preview["workspace_path"], rollback, ignore=shutil.ignore_patterns("node_modules"))
    with sqlite3.connect(db_path) as connection:
        golden = connection.execute(
            """
            SELECT artifact_path FROM preview_goldens WHERE project_id = ? AND adapter_id = ?
            """,
            (preview["project_id"], preview["adapter_id"]),
        ).fetchone()
    output_file = run_dir / "result.json"
    command = [
        "node", str(quality_script), "--url", f"http://127.0.0.1:{preview['port']}/",
        "--browser", browser_endpoint, "--out", str(run_dir), "--result", str(output_file),
    ]
    if golden:
        command.extend(["--baseline", golden[0]])
    try:
        completed = subprocess.run(
            command, env={"PATH": os.environ.get("PATH", "/usr/local/bin:/usr/bin:/bin"), "HOME": "/tmp"},
            capture_output=True, text=True, timeout=90, check=False,
        )
    except subprocess.TimeoutExpired as exc:
        completed = subprocess.CompletedProcess(command, 124, exc.stdout or "", exc.stderr or "")
    try:
        result = json.loads(output_file.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        result = {
            "status": "failed", "console_errors": [], "page_errors": [],
            "load_failures": [], "metrics": {}, "visual": {"status": "not_run"},
            "success_screenshot": "", "failure_screenshot": "",
            "log": (completed.stdout + completed.stderr)[-64000:] or "quality runner did not produce a result",
        }
    gate_passed = completed.returncode == 0 and result.get("status") == "passed"
    metrics = {**result.get("metrics", {}), **_process_metrics(preview_id)}
    modified = preview["recent_files"]
    with sqlite3.connect(db_path) as connection:
        cursor = connection.execute(
            """
            INSERT INTO preview_quality_runs(
                preview_id, status, gate_passed, console_json, page_errors_json,
                load_failures_json, modified_json, metrics_json, visual_json,
                success_screenshot, failure_screenshot, rollback_path, log
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                preview_id, "passed" if gate_passed else "failed", int(gate_passed),
                json.dumps(result.get("console_errors", [])), json.dumps(result.get("page_errors", [])),
                json.dumps(result.get("load_failures", [])), json.dumps(modified), json.dumps(metrics),
                json.dumps(result.get("visual", {})), result.get("success_screenshot", ""),
                result.get("failure_screenshot", ""), str(rollback), result.get("log", "")[-64000:],
            ),
        )
        run_id = cursor.lastrowid
    return get_quality_run(run_id, db_path)


def get_quality_run(run_id: int, db_path: Path) -> dict[str, Any]:
    with sqlite3.connect(db_path) as connection:
        connection.row_factory = sqlite3.Row
        run = _row(connection.execute(
            "SELECT * FROM preview_quality_runs WHERE id = ?", (run_id,)
        ).fetchone(), "quality run not found")
    for name in ("console", "page_errors", "load_failures", "modified", "metrics", "visual"):
        run[name] = json.loads(run.pop(f"{name}_json"))
    run["gate_passed"] = bool(run["gate_passed"])
    return run


def list_quality_runs(preview_id: int, db_path: Path) -> list[dict[str, Any]]:
    get_preview(preview_id, db_path)
    with sqlite3.connect(db_path) as connection:
        ids = [row[0] for row in connection.execute(
            "SELECT id FROM preview_quality_runs WHERE preview_id = ? ORDER BY id DESC", (preview_id,)
        )]
    return [get_quality_run(item, db_path) for item in ids]


def _percentile(values: list[float], percentile: float) -> float:
    ordered = sorted(values)
    position = max(0, min(len(ordered) - 1, round((len(ordered) - 1) * percentile)))
    return ordered[position]


def run_performance_suite(
    preview_id: int, sample_count: int, db_path: Path, artifact_root: Path,
    quality_script: Path, browser_endpoint: str,
) -> dict[str, Any]:
    if sample_count < 3 or sample_count > 10:
        raise PreviewError("performance suite requires 3 to 10 samples")
    get_preview(preview_id, db_path)
    runs = [
        run_quality_gate(preview_id, db_path, artifact_root, quality_script, browser_endpoint)
        for _ in range(sample_count)
    ]
    metric_names = ("measured_fps", "dom_content_loaded_ms", "load_ms", "interaction_latency_ms", "quality_duration_ms", "vite_rss_bytes")
    summary = {}
    for name in metric_names:
        values = [float(run["metrics"][name]) for run in runs if isinstance(run["metrics"].get(name), (int, float))]
        if values:
            summary[name] = {
                "min": min(values), "median": statistics.median(values),
                "p95": _percentile(values, .95), "max": max(values), "samples": len(values),
            }
    conditions = {
        "viewport": "1280x720", "browser_endpoint": browser_endpoint.split("://", 1)[0] + "://isolated-sidecar",
        "sample_order": "sequential", "warmup": "quality runner navigation per sample",
        "cpu_count": os.cpu_count(),
        "note": "Container load is not controlled; results are diagnostic and not production benchmarks.",
    }
    with sqlite3.connect(db_path) as connection:
        suite_id = connection.execute(
            "INSERT INTO preview_performance_suites(preview_id,sample_count,conditions_json,samples_json,summary_json) VALUES (?,?,?,?,?)",
            (preview_id, sample_count, json.dumps(conditions), json.dumps([{"run_id": r["id"], "passed": r["gate_passed"], "metrics": r["metrics"]} for r in runs]), json.dumps(summary)),
        ).lastrowid
    return {"id": suite_id, "preview_id": preview_id, "sample_count": sample_count,
            "conditions": conditions, "samples": runs, "summary": summary,
            "all_gates_passed": all(run["gate_passed"] for run in runs)}


def approve_golden(preview_id: int, run_id: int, confirm: bool, db_path: Path, artifact_root: Path) -> dict[str, Any]:
    if confirm is not True:
        raise PreviewError("explicit golden approval is required")
    run = get_quality_run(run_id, db_path)
    if run["preview_id"] != preview_id or not run["gate_passed"] or not run["success_screenshot"]:
        raise PreviewError("golden source must be a passing quality run with a screenshot")
    source = Path(run["success_screenshot"]).resolve(strict=True)
    allowed = artifact_root.resolve(strict=True)
    if allowed not in source.parents:
        raise PreviewError("golden source is outside the artifact root")
    destination = artifact_root / f"preview-{preview_id}" / "golden.png"
    destination.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source, destination)
    digest = hashlib.sha256(destination.read_bytes()).hexdigest()
    approval = {"kind": "explicit_user_approval", "source_run_id": run_id}
    with sqlite3.connect(db_path) as connection:
        connection.execute(
            """
            INSERT INTO preview_goldens(preview_id, project_id, adapter_id, artifact_path, source_run_id,
                viewport, browser_version, artifact_sha256, approval_json)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(project_id, adapter_id) DO UPDATE SET preview_id = excluded.preview_id,
                artifact_path = excluded.artifact_path, source_run_id = excluded.source_run_id,
                viewport = excluded.viewport, browser_version = excluded.browser_version,
                artifact_sha256 = excluded.artifact_sha256, approval_json = excluded.approval_json,
                approved_at = CURRENT_TIMESTAMP
            """,
            (preview_id, get_preview(preview_id, db_path)["project_id"], get_preview(preview_id, db_path)["adapter_id"],
             str(destination), run_id, run["metrics"].get("viewport", "1440x900"),
             run["metrics"].get("browser_version", "unknown"), digest, json.dumps(approval, sort_keys=True)),
        )
    return get_preview(preview_id, db_path)


def export_golden(project_id: int, adapter_id: str, package_path: Path, db_path: Path) -> dict[str, Any]:
    """Export an approved golden and its immutable approval metadata."""
    with sqlite3.connect(db_path) as connection:
        connection.row_factory = sqlite3.Row
        project = _row(connection.execute("SELECT name FROM projects WHERE id=?", (project_id,)).fetchone(), "project not found")
        golden = _row(connection.execute(
            "SELECT * FROM preview_goldens WHERE project_id=? AND adapter_id=?", (project_id, adapter_id)
        ).fetchone(), "approved golden not found")
    image = Path(golden["artifact_path"]).resolve(strict=True)
    digest = hashlib.sha256(image.read_bytes()).hexdigest()
    keys = set(golden.keys())
    recorded_digest = golden["artifact_sha256"] if "artifact_sha256" in keys else ""
    if recorded_digest and recorded_digest != digest:
        raise PreviewError("golden integrity check failed")
    viewport = golden["viewport"] if "viewport" in keys else "1440x900"
    browser_version = golden["browser_version"] if "browser_version" in keys else "legacy-unrecorded"
    approval = json.loads(golden["approval_json"]) if "approval_json" in keys else {
        "kind": "legacy_explicit_approval", "source_run_id": golden["source_run_id"]}
    manifest = {
        "schema": 1, "project": project["name"], "adapter_id": adapter_id,
        "viewport": viewport, "browser_version": browser_version,
        "artifact": "golden.png", "artifact_sha256": digest,
        "approved_at": golden["approved_at"], "approval": approval,
    }
    package_path.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as temporary:
        root = Path(temporary)
        shutil.copy2(image, root / "golden.png")
        (root / "manifest.json").write_text(json.dumps(manifest, indent=2, sort_keys=True) + "\n", encoding="utf-8")
        with tarfile.open(package_path, "w:gz", format=tarfile.PAX_FORMAT) as archive:
            archive.add(root / "manifest.json", arcname="manifest.json")
            archive.add(root / "golden.png", arcname="golden.png")
    return {**manifest, "package": str(package_path), "package_sha256": hashlib.sha256(package_path.read_bytes()).hexdigest()}


def import_golden(preview_id: int, package_path: Path, confirm: bool, db_path: Path, artifact_root: Path) -> dict[str, Any]:
    """Restore a verified golden; importing is itself an explicit approval action."""
    if confirm is not True:
        raise PreviewError("explicit golden import approval is required")
    preview = get_preview(preview_id, db_path)
    with sqlite3.connect(db_path) as connection:
        row = connection.execute("SELECT name FROM projects WHERE id=?", (preview["project_id"],)).fetchone()
        if row is None:
            raise PreviewError("project not found")
        project_name = row[0]
    with tempfile.TemporaryDirectory() as temporary, tarfile.open(package_path, "r:gz") as archive:
        members = archive.getmembers()
        if sorted(item.name for item in members) != ["golden.png", "manifest.json"] or any(not item.isfile() for item in members):
            raise PreviewError("golden package contains unexpected entries")
        root = Path(temporary)
        archive.extractall(root, filter="data")
        manifest = json.loads((root / "manifest.json").read_text(encoding="utf-8"))
        image = root / "golden.png"
        digest = hashlib.sha256(image.read_bytes()).hexdigest()
        required = {"schema", "project", "adapter_id", "viewport", "browser_version", "artifact_sha256", "approval"}
        if not required.issubset(manifest) or manifest.get("schema") != 1 or manifest.get("artifact_sha256") != digest:
            raise PreviewError("golden package integrity check failed")
        if manifest.get("project") != project_name or manifest.get("adapter_id") != preview["adapter_id"]:
            raise PreviewError("golden package identity does not match preview")
        destination = artifact_root / "portable-goldens" / str(preview["project_id"]) / preview["adapter_id"] / f"{digest}.png"
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(image, destination)
    approval = {"kind": "explicit_user_import", "package_sha256": hashlib.sha256(package_path.read_bytes()).hexdigest(), "original": manifest.get("approval", {})}
    with sqlite3.connect(db_path) as connection:
        run_id = connection.execute(
            """INSERT INTO preview_quality_runs(preview_id,status,gate_passed,console_json,page_errors_json,
            load_failures_json,modified_json,metrics_json,visual_json,success_screenshot,failure_screenshot,rollback_path,log)
            VALUES (?, 'imported_golden', 0, '[]', '[]', '[]', '[]', '{}', ?, ?, '', '', 'Verified portable golden import')""",
            (preview_id, json.dumps({"status": "imported_verified"}), str(destination)),
        ).lastrowid
        connection.execute(
            """INSERT INTO preview_goldens(preview_id,project_id,adapter_id,artifact_path,source_run_id,viewport,browser_version,artifact_sha256,approval_json)
            VALUES (?,?,?,?,?,?,?,?,?) ON CONFLICT(project_id,adapter_id) DO UPDATE SET preview_id=excluded.preview_id,
            artifact_path=excluded.artifact_path,source_run_id=excluded.source_run_id,viewport=excluded.viewport,
            browser_version=excluded.browser_version,artifact_sha256=excluded.artifact_sha256,approval_json=excluded.approval_json,
            approved_at=CURRENT_TIMESTAMP""",
            (preview_id, preview["project_id"], preview["adapter_id"], str(destination), run_id,
             manifest["viewport"], manifest["browser_version"], digest, json.dumps(approval, sort_keys=True)),
        )
    return get_preview(preview_id, db_path)


def resolve_artifact(run_id: int, kind: str, db_path: Path, artifact_root: Path) -> Path:
    run = get_quality_run(run_id, db_path)
    column = {"success": "success_screenshot", "failure": "failure_screenshot"}.get(kind)
    if not column or not run[column]:
        raise PreviewError("artifact not found")
    path = Path(run[column]).resolve(strict=True)
    root = artifact_root.resolve(strict=True)
    if root not in path.parents or path.suffix.lower() != ".png":
        raise PreviewError("artifact path rejected")
    return path
