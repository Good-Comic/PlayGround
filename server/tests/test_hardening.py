import json
import sqlite3
import subprocess
import tempfile
import time
import unittest
from unittest.mock import patch
from pathlib import Path
from http.server import ThreadingHTTPServer
from threading import Thread
from urllib.error import HTTPError
from urllib.request import Request, urlopen

import server.app as studio_app

from server.app import init_db
from server.operations import (
    OperationsError, cancel, claim, create_backup, enqueue, fail, finish, get_job,
    metrics, recover_expired_jobs, restore_drill,
)
from server.security import (
    AuthError, authenticate, authorize, login, password_hash, reauthenticate, revoke,
)
from server.secrets_store import SecretStoreError, read_secret


class HardeningTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.db = self.root / "forge.db"
        init_db(self.db)
        self.password = "Correct-Horse-Battery-2026!"
        with sqlite3.connect(self.db) as connection:
            connection.execute(
                "INSERT INTO auth_users(username,password_hash,permissions_json) VALUES ('admin',?,?)",
                (password_hash(self.password), json.dumps(["read", "modify", "execute", "push", "pr"])),
            )

    def tearDown(self):
        self.temp.cleanup()

    def test_session_csrf_permissions_reauthentication_and_revocation(self):
        signed_in = login("admin", self.password, "127.0.0.1", self.db)
        principal = authenticate(f"forge_session={signed_in['session_token']}", self.db)
        authorize(principal, "read")
        authorize(principal, "execute", signed_in["csrf_token"])
        with self.assertRaisesRegex(AuthError, "CSRF"):
            authorize(principal, "execute", "wrong")
        with self.assertRaisesRegex(AuthError, "permission"):
            authorize(principal, "merge")
        with sqlite3.connect(self.db) as connection:
            connection.execute("UPDATE auth_sessions SET reauthenticated_at=0")
        stale = authenticate(f"forge_session={signed_in['session_token']}", self.db)
        with self.assertRaisesRegex(AuthError, "reauthentication"):
            authorize(stale, "push", signed_in["csrf_token"], require_reauth=True)
        reauthenticate(stale, self.password, self.db)
        revoke(principal, self.db)
        with self.assertRaisesRegex(AuthError, "revoked"):
            authenticate(f"forge_session={signed_in['session_token']}", self.db)

    def test_login_rate_limit_and_no_plaintext_secret(self):
        for _ in range(5):
            with self.assertRaises(AuthError):
                login("admin", "wrong password value", "198.51.100.4", self.db)
        with self.assertRaises(AuthError):
            login("admin", self.password, "198.51.100.4", self.db)
        self.assertNotIn(self.password.encode(), self.db.read_bytes())
        self.assertNotIn(b"wrong password value", self.db.read_bytes())

    def test_durable_queue_idempotency_crash_recovery_dead_letter_and_cancel(self):
        first = enqueue("quality", {"preview_id": 1}, "same-request", self.db, max_attempts=2)
        duplicate = enqueue("quality", {"preview_id": 99}, "same-request", self.db, max_attempts=2)
        self.assertEqual(first["id"], duplicate["id"])
        running = claim(self.db, lease_seconds=60)
        self.assertEqual(running["attempts"], 1)
        with sqlite3.connect(self.db) as connection:
            connection.execute("UPDATE worker_jobs SET lease_expires_at=0 WHERE id=?", (running["id"],))
        self.assertEqual(recover_expired_jobs(self.db), 1)
        recovered = claim(self.db)
        dead = fail(recovered["id"], recovered["lease_token"], "bounded failure", self.db)
        self.assertEqual(dead["status"], "dead_letter")
        queued = enqueue("build", {}, "cancel-me", self.db)
        self.assertEqual(cancel(queued["id"], self.db)["status"], "cancelled")
        good = enqueue("build", {}, "complete-me", self.db)
        active = claim(self.db)
        self.assertEqual(active["id"], good["id"])
        self.assertEqual(finish(active["id"], active["lease_token"], {"passed": True}, self.db)["status"], "completed")

    def test_backup_is_restored_and_sqlite_integrity_verified(self):
        repo = self.root / "repo"
        repo.mkdir()
        subprocess.run(["git", "init", "-b", "main"], cwd=repo, check=True, capture_output=True)
        subprocess.run(["git", "config", "user.email", "fixture@example.invalid"], cwd=repo, check=True)
        subprocess.run(["git", "config", "user.name", "Fixture"], cwd=repo, check=True)
        (repo / "README.md").write_text("fixture\n")
        subprocess.run(["git", "add", "."], cwd=repo, check=True)
        subprocess.run(["git", "commit", "-m", "base"], cwd=repo, check=True, capture_output=True)
        data = self.root / "data"
        (data / "agent-tasks" / "1").mkdir(parents=True)
        (data / "agent-tasks" / "1" / "record.txt").write_text("recoverable")
        backup = create_backup(self.db, repo, data, self.root / "backup")
        restored = restore_drill(Path(backup["destination"]), self.root / "restore")
        self.assertEqual(restored["sqlite_integrity"], "ok")
        self.assertEqual((self.root / "restore/workspaces/agent-tasks/1/record.txt").read_text(), "recoverable")
        self.assertGreater(metrics(self.db)["resources"]["cpu_count"], 0)

    def test_secret_file_permissions_and_no_frontend_leak(self):
        secret = self.root / "provider.secret"
        secret.write_text("unit-secret-must-never-leak")
        secret.chmod(0o600)
        with patch.dict("os.environ", {"FORGE_OPENAI_API_KEY_FILE": str(secret)}, clear=False):
            self.assertEqual(read_secret("FORGE_OPENAI_API_KEY"), "unit-secret-must-never-leak")
        secret.chmod(0o644)
        with patch.dict("os.environ", {"FORGE_OPENAI_API_KEY_FILE": str(secret)}, clear=False):
            with self.assertRaises(SecretStoreError):
                read_secret("FORGE_OPENAI_API_KEY")
        frontend = b"".join(item.read_bytes() for item in (Path(__file__).parents[1] / "static").iterdir() if item.is_file())
        self.assertNotIn(b"unit-secret-must-never-leak", frontend)

    def test_http_api_rejects_anonymous_and_missing_csrf(self):
        original = studio_app.DB_PATH
        studio_app.DB_PATH = self.db
        server = ThreadingHTTPServer(("127.0.0.1", 0), studio_app.ForgeHandler)
        thread = Thread(target=server.serve_forever, daemon=True)
        thread.start()
        base = f"http://127.0.0.1:{server.server_port}"
        try:
            with self.assertRaises(HTTPError) as anonymous:
                urlopen(base + "/api/projects")
            self.assertEqual(anonymous.exception.code, 401)
            request = Request(
                base + "/api/auth/login", method="POST",
                data=json.dumps({"username": "admin", "password": self.password}).encode(),
                headers={"Content-Type": "application/json"},
            )
            response = urlopen(request)
            cookie = response.headers["Set-Cookie"].split(";", 1)[0]
            session = json.loads(response.read())
            with self.assertRaises(HTTPError) as csrf_failure:
                urlopen(Request(base + "/api/projects/1/runs", method="POST", data=b'{"action":"test"}', headers={"Content-Type": "application/json", "Cookie": cookie}))
            self.assertEqual(csrf_failure.exception.code, 403)
            observed = json.loads(urlopen(Request(base + "/api/operations/metrics", headers={"Cookie": cookie})).read())
            self.assertEqual(observed["source"], "persisted SQLite records and current cgroup")
            self.assertTrue(session["csrf_token"])
        finally:
            server.shutdown()
            server.server_close()
            studio_app.DB_PATH = original


if __name__ == "__main__":
    unittest.main()
