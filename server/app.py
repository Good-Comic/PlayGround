from __future__ import annotations

import json
import mimetypes
import os
import re
import sqlite3
import subprocess
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any
from urllib.parse import parse_qs, unquote, urlparse


DB_PATH = Path(os.environ.get("FORGE_DB_PATH", "/data/forge.db"))
WORKSPACE_ROOT = Path(os.environ.get("FORGE_WORKSPACE_ROOT", "/workspace"))
STATIC_ROOT = Path(__file__).with_name("static")
MAX_TEXT_FILE = 512 * 1024
MAX_PREVIEW_FILE = 20 * 1024 * 1024
MAX_RUN_OUTPUT = 64 * 1024


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
            """
        )


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


class ForgeHandler(SimpleHTTPRequestHandler):
    server_version = "ProjectForge/0.2"

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
        except (ValueError, LookupError, OSError) as exc:
            self.json_response(HTTPStatus.BAD_REQUEST, {"error": str(exc)})
            return
        super().do_GET()

    def do_POST(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path == "/api/projects/import-local":
            try:
                payload = self.read_json()
                project = import_project(payload.get("path", ""))
            except (ValueError, OSError, sqlite3.Error) as exc:
                self.json_response(HTTPStatus.BAD_REQUEST, {"error": str(exc)})
                return
            self.json_response(HTTPStatus.CREATED, {"project": project})
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
