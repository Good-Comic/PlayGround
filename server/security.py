from __future__ import annotations

import hashlib
import hmac
import json
import os
import secrets
import sqlite3
import time
from dataclasses import dataclass
from http.cookies import SimpleCookie
from pathlib import Path
from typing import Any


SESSION_SECONDS = 8 * 60 * 60
REAUTH_SECONDS = 5 * 60
MAX_FAILURES = 5
LOCKOUT_SECONDS = 15 * 60
PERMISSIONS = ("read", "modify", "execute", "push", "pr", "merge")


class AuthError(RuntimeError):
    pass


@dataclass(frozen=True)
class Principal:
    user_id: int
    username: str
    permissions: frozenset[str]
    session_id: str
    csrf_token: str
    reauthenticated_at: float


def password_hash(password: str, salt: bytes | None = None, rounds: int = 600_000) -> str:
    if len(password) < 14:
        raise AuthError("password must contain at least 14 characters")
    salt = salt or secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, rounds)
    return f"pbkdf2_sha256${rounds}${salt.hex()}${digest.hex()}"


def verify_password(password: str, encoded: str) -> bool:
    try:
        algorithm, raw_rounds, raw_salt, expected = encoded.split("$", 3)
        if algorithm != "pbkdf2_sha256":
            return False
        digest = hashlib.pbkdf2_hmac("sha256", password.encode(), bytes.fromhex(raw_salt), int(raw_rounds))
        return hmac.compare_digest(digest.hex(), expected)
    except (ValueError, TypeError):
        return False


def init_security_db(db_path: Path) -> None:
    with sqlite3.connect(db_path) as connection:
        connection.executescript(
            """
            CREATE TABLE IF NOT EXISTS auth_users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                permissions_json TEXT NOT NULL,
                disabled INTEGER NOT NULL DEFAULT 0,
                failed_attempts INTEGER NOT NULL DEFAULT 0,
                locked_until REAL NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS auth_sessions (
                token_hash TEXT PRIMARY KEY,
                user_id INTEGER NOT NULL,
                csrf_hash TEXT NOT NULL,
                expires_at REAL NOT NULL,
                revoked_at REAL,
                reauthenticated_at REAL NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                last_seen_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(user_id) REFERENCES auth_users(id)
            );
            CREATE TABLE IF NOT EXISTS security_audit (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                event TEXT NOT NULL,
                outcome TEXT NOT NULL,
                remote_hash TEXT NOT NULL DEFAULT '',
                details_json TEXT NOT NULL DEFAULT '{}',
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            """
        )
        connection.execute("DELETE FROM auth_sessions WHERE expires_at <= ?", (time.time(),))
    bootstrap_admin(db_path)


def _read_bootstrap_hash() -> str:
    encoded = os.environ.get("FORGE_ADMIN_PASSWORD_HASH", "").strip()
    password_file = os.environ.get("FORGE_ADMIN_PASSWORD_FILE", "").strip()
    if encoded and password_file:
        raise AuthError("configure only one admin password source")
    if password_file:
        path = Path(password_file)
        if path.is_symlink() or not path.is_file() or path.stat().st_mode & 0o077:
            raise AuthError("admin password file must be a private regular file")
        encoded = password_hash(path.read_text(encoding="utf-8").strip())
    return encoded


def bootstrap_admin(db_path: Path) -> None:
    encoded = _read_bootstrap_hash()
    with sqlite3.connect(db_path) as connection:
        count = connection.execute("SELECT COUNT(*) FROM auth_users").fetchone()[0]
        if count or not encoded:
            return
        connection.execute(
            "INSERT INTO auth_users(username,password_hash,permissions_json) VALUES ('admin',?,?)",
            (encoded, json.dumps(PERMISSIONS)),
        )


def _digest(value: str) -> str:
    return hashlib.sha256(value.encode()).hexdigest()


def _audit(connection: sqlite3.Connection, event: str, outcome: str, user_id: int | None = None, remote: str = "", details: dict[str, Any] | None = None) -> None:
    connection.execute(
        "INSERT INTO security_audit(user_id,event,outcome,remote_hash,details_json) VALUES (?,?,?,?,?)",
        (user_id, event, outcome, _digest(remote) if remote else "", json.dumps(details or {}, sort_keys=True)),
    )


def login(username: str, password: str, remote: str, db_path: Path) -> dict[str, Any]:
    now = time.time()
    with sqlite3.connect(db_path) as connection:
        connection.row_factory = sqlite3.Row
        row = connection.execute("SELECT * FROM auth_users WHERE username=?", (username,)).fetchone()
        valid = bool(row and not row["disabled"] and row["locked_until"] <= now and verify_password(password, row["password_hash"]))
        if not valid:
            if row:
                failures = row["failed_attempts"] + 1
                locked_until = now + LOCKOUT_SECONDS if failures >= MAX_FAILURES else row["locked_until"]
                connection.execute("UPDATE auth_users SET failed_attempts=?,locked_until=? WHERE id=?", (failures, locked_until, row["id"]))
            _audit(connection, "login", "denied", row["id"] if row else None, remote)
            connection.commit()
            raise AuthError("invalid credentials or account temporarily locked")
        token, csrf = secrets.token_urlsafe(32), secrets.token_urlsafe(32)
        connection.execute("UPDATE auth_users SET failed_attempts=0,locked_until=0 WHERE id=?", (row["id"],))
        connection.execute(
            "INSERT INTO auth_sessions(token_hash,user_id,csrf_hash,expires_at,reauthenticated_at) VALUES (?,?,?,?,?)",
            (_digest(token), row["id"], _digest(csrf), now + SESSION_SECONDS, now),
        )
        _audit(connection, "login", "allowed", row["id"], remote)
    return {"session_token": token, "csrf_token": csrf, "expires_at": now + SESSION_SECONDS,
            "user": {"username": username, "permissions": json.loads(row["permissions_json"])}}


def session_token(cookie_header: str) -> str:
    cookie = SimpleCookie()
    cookie.load(cookie_header or "")
    return cookie["forge_session"].value if "forge_session" in cookie else ""


def authenticate(cookie_header: str, db_path: Path) -> Principal:
    token = session_token(cookie_header)
    if not token:
        raise AuthError("authentication required")
    with sqlite3.connect(db_path) as connection:
        connection.row_factory = sqlite3.Row
        row = connection.execute(
            """SELECT s.*,u.username,u.permissions_json,u.disabled FROM auth_sessions s
               JOIN auth_users u ON u.id=s.user_id WHERE s.token_hash=?""", (_digest(token),),
        ).fetchone()
        if not row or row["disabled"] or row["revoked_at"] or row["expires_at"] <= time.time():
            raise AuthError("session expired or revoked")
        connection.execute("UPDATE auth_sessions SET last_seen_at=CURRENT_TIMESTAMP WHERE token_hash=?", (_digest(token),))
    return Principal(row["user_id"], row["username"], frozenset(json.loads(row["permissions_json"])), _digest(token), row["csrf_hash"], row["reauthenticated_at"])


def authorize(principal: Principal, permission: str, csrf_token: str | None = None, require_reauth: bool = False) -> None:
    if permission not in principal.permissions:
        raise AuthError("permission denied")
    if csrf_token is not None and not hmac.compare_digest(_digest(csrf_token), principal.csrf_token):
        raise AuthError("CSRF validation failed")
    if require_reauth and time.time() - principal.reauthenticated_at > REAUTH_SECONDS:
        raise AuthError("recent reauthentication required")


def reauthenticate(principal: Principal, password: str, db_path: Path) -> None:
    with sqlite3.connect(db_path) as connection:
        encoded = connection.execute("SELECT password_hash FROM auth_users WHERE id=?", (principal.user_id,)).fetchone()
        if not encoded or not verify_password(password, encoded[0]):
            _audit(connection, "reauthenticate", "denied", principal.user_id)
            raise AuthError("reauthentication failed")
        connection.execute("UPDATE auth_sessions SET reauthenticated_at=? WHERE token_hash=?", (time.time(), principal.session_id))
        _audit(connection, "reauthenticate", "allowed", principal.user_id)


def revoke(principal: Principal, db_path: Path) -> None:
    with sqlite3.connect(db_path) as connection:
        connection.execute("UPDATE auth_sessions SET revoked_at=? WHERE token_hash=?", (time.time(), principal.session_id))
        _audit(connection, "logout", "allowed", principal.user_id)
