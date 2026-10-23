from __future__ import annotations

import json
import os
import sqlite3
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any
from urllib.parse import urlparse


DB_PATH = Path(os.environ.get("FORGE_DB_PATH", "/data/forge.db"))
WORKSPACE_ROOT = Path(os.environ.get("FORGE_WORKSPACE_ROOT", "/workspace"))
STATIC_ROOT = Path(__file__).with_name("static")


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


def project_changes(project_id: int, db_path: Path = DB_PATH, workspace_root: Path = WORKSPACE_ROOT) -> dict[str, Any]:
    with sqlite3.connect(db_path) as connection:
        connection.row_factory = sqlite3.Row
        project = connection.execute(
            "SELECT id, name, relative_path FROM projects WHERE id = ?", (project_id,)
        ).fetchone()
    if project is None:
        raise LookupError("project not found")
    project_root, _ = resolve_project_path(project["relative_path"], workspace_root)
    files = []
    for item in sorted(project_root.rglob("*")):
        if item.is_file() and ".git" not in item.parts:
            files.append({"path": item.relative_to(project_root).as_posix(), "size": item.stat().st_size})
            if len(files) >= 200:
                break
    return {
        "project_id": project_id,
        "source": "filesystem-inventory",
        "note": "Git diff classification is not enabled in Task 01.",
        "files": files,
    }


class ForgeHandler(SimpleHTTPRequestHandler):
    server_version = "ProjectForge/0.1"

    def __init__(self, *args: Any, **kwargs: Any) -> None:
        super().__init__(*args, directory=str(STATIC_ROOT), **kwargs)

    def end_headers(self) -> None:
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("X-Frame-Options", "DENY")
        self.send_header("Referrer-Policy", "no-referrer")
        self.send_header("Content-Security-Policy", "default-src 'self'; style-src 'self'; script-src 'self'; connect-src 'self'")
        super().end_headers()

    def json_response(self, status: HTTPStatus, payload: Any) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
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
                query = dict(item.split("=", 1) for item in parsed.query.split("&") if "=" in item)
                self.json_response(HTTPStatus.OK, project_changes(int(query.get("project_id", "0"))))
            except (ValueError, LookupError) as exc:
                self.json_response(HTTPStatus.BAD_REQUEST, {"error": str(exc)})
            return
        super().do_GET()

    def do_POST(self) -> None:
        if urlparse(self.path).path != "/api/projects/import-local":
            self.json_response(HTTPStatus.NOT_FOUND, {"error": "not found"})
            return
        try:
            payload = self.read_json()
            project = import_project(payload.get("path", ""))
        except (ValueError, OSError, sqlite3.Error) as exc:
            self.json_response(HTTPStatus.BAD_REQUEST, {"error": str(exc)})
            return
        self.json_response(HTTPStatus.CREATED, {"project": project})


def main() -> None:
    init_db(DB_PATH)
    server = ThreadingHTTPServer(("0.0.0.0", 8080), ForgeHandler)
    server.serve_forever()


if __name__ == "__main__":
    main()
