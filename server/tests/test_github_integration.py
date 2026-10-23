import hashlib
import hmac
import json
import sqlite3
import subprocess
import tempfile
import unittest
from pathlib import Path

from server.app import init_db
from server.github_integration import (
    GitHubIntegrationError,
    MockGitHubApp,
    WebhookAuthenticationError,
    WebhookReplayError,
    approve_commit,
    create_pull_request,
    get_change,
    get_repository,
    ingest_webhook,
    list_deliveries,
    prepare_change,
    process_delivery,
    push_change,
    reconcile_repository,
    register_repository,
    scan_secrets,
)


class GitHubIntegrationTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.db = self.root / "forge.db"
        init_db(self.db)
        self.source = self.root / "source"
        self.source.mkdir()
        self._git("init", "-b", "codex/riftwatch-forge-integration")
        self._git("config", "user.name", "Fixture")
        self._git("config", "user.email", "fixture@example.invalid")
        (self.source / "README.md").write_text("# Fixture\n", encoding="utf-8")
        (self.source / "index.html").write_text("<h1>fixture</h1>\n", encoding="utf-8")
        (self.source / "app.js").write_text("console.log('fixture');\n", encoding="utf-8")
        (self.source / "scripts").mkdir()
        (self.source / "scripts" / "validate-locales.mjs").write_text(
            "console.log('Locale validation passed: fixture');\n", encoding="utf-8"
        )
        self._git("add", ".")
        self._git("commit", "-m", "fixture base")
        self.base_sha = self._git("rev-parse", "HEAD").strip()
        with sqlite3.connect(self.db) as connection:
            project = connection.execute(
                "INSERT INTO projects(name, relative_path) VALUES ('riftwatch', 'riftwatch')"
            )
            self.project_id = project.lastrowid
            task = connection.execute(
                """
                INSERT INTO agent_tasks(
                    project_id, provider_id, instruction, requested_mode, effective_mode,
                    target_path, status, proposal_json, validation_output
                ) VALUES (?, 1, 'safe edit', 'test', 'test', 'README.md', 'completed', ?, 'passed')
                """,
                (self.project_id, json.dumps([{"path": "README.md", "content": "# Fixture\n\nSafe change.\n"}])),
            )
            self.task_id = task.lastrowid
        self.repo = register_repository({
            "project_id": self.project_id,
            "owner": "Good-Comic",
            "name": "PlayGround",
            "mode": "mock",
            "default_branch": "main",
            "base_ref": "codex/riftwatch-forge-integration",
            "base_sha": self.base_sha,
        }, self.db)
        self.secret = "unit-test-webhook-secret"

    def tearDown(self):
        self.temp.cleanup()

    def _git(self, *args):
        completed = subprocess.run(
            ["git", *args], cwd=self.source, capture_output=True, text=True, check=True
        )
        return completed.stdout

    def _payload(self, full_name="Good-Comic/PlayGround", after=None, forced=False):
        return json.dumps({
            "repository": {"full_name": full_name},
            "ref": "refs/heads/codex/riftwatch-forge-integration",
            "before": self.base_sha,
            "after": after or ("a" * 40),
            "forced": forced,
        }, sort_keys=True).encode()

    def _signature(self, body):
        return "sha256=" + hmac.new(self.secret.encode(), body, hashlib.sha256).hexdigest()

    def test_hmac_dedup_replay_and_unauthorized_repo(self):
        body = self._payload()
        with self.assertRaises(WebhookAuthenticationError):
            ingest_webhook(body, "sha256=bad", "delivery-0001", "push", self.db, self.secret)
        first = ingest_webhook(body, self._signature(body), "delivery-0001", "push", self.db, self.secret)
        self.assertFalse(first["duplicate"])
        duplicate = ingest_webhook(body, self._signature(body), "delivery-0001", "push", self.db, self.secret)
        self.assertTrue(duplicate["duplicate"])
        changed = self._payload(after="b" * 40)
        with self.assertRaises(WebhookReplayError):
            ingest_webhook(changed, self._signature(changed), "delivery-0001", "push", self.db, self.secret)
        unauthorized = self._payload(full_name="Other/Repository")
        with self.assertRaisesRegex(GitHubIntegrationError, "not authorized"):
            ingest_webhook(unauthorized, self._signature(unauthorized), "delivery-0002", "push", self.db, self.secret)
        database_bytes = self.db.read_bytes()
        self.assertNotIn(self.secret.encode(), database_bytes)
        self.assertNotIn(b"PRIVATE KEY", database_bytes)

    def test_delivery_retry_conflict_and_recovery(self):
        body = self._payload()
        ingest_webhook(body, self._signature(body), "delivery-1001", "push", self.db, self.secret)

        def unavailable(repo, event):
            raise RuntimeError("mock network unavailable")

        failed = process_delivery("delivery-1001", self.db, unavailable)
        self.assertEqual(failed["status"], "retry")
        recovered = process_delivery("delivery-1001", self.db, lambda repo, event: {"latest_sha": event["after"]})
        self.assertEqual(recovered["status"], "processed")
        self.assertEqual(list_deliveries(self.repo["id"], self.db)[0]["attempts"], 2)

        with sqlite3.connect(self.db) as connection:
            connection.execute("UPDATE github_repositories SET local_dirty = 1 WHERE id = ?", (self.repo["id"],))
        blocked_body = self._payload(after="c" * 40)
        ingest_webhook(blocked_body, self._signature(blocked_body), "delivery-1002", "push", self.db, self.secret)
        blocked = process_delivery("delivery-1002", self.db)
        self.assertEqual(blocked["status"], "retry")
        self.assertIn("dirty", blocked["error"])
        self.assertTrue(get_repository(self.repo["id"], self.db)["conflict"])

        with sqlite3.connect(self.db) as connection:
            connection.execute("UPDATE github_repositories SET local_dirty = 0 WHERE id = ?", (self.repo["id"],))
        forced_body = self._payload(after="d" * 40, forced=True)
        ingest_webhook(forced_body, self._signature(forced_body), "delivery-1003", "push", self.db, self.secret)
        forced = process_delivery("delivery-1003", self.db)
        self.assertEqual(forced["status"], "retry")
        self.assertIn("forced", forced["error"])

    def test_disconnect_reconciliation_is_idempotent(self):
        client = MockGitHubApp(self.db)
        client.push(self.repo, "forge/offline-event", "e" * 40)
        recovered = reconcile_repository(self.repo["id"], self.db, client)
        self.assertEqual((recovered["events_found"], recovered["processed"]), (1, 1))
        again = reconcile_repository(self.repo["id"], self.db, client)
        self.assertEqual((again["events_found"], again["processed"]), (0, 0))
        self.assertEqual(get_repository(self.repo["id"], self.db)["latest_remote_sha"], "e" * 40)

    def test_reconciliation_does_not_advance_past_conflict(self):
        client = MockGitHubApp(self.db)
        client.push(self.repo, "forge/offline-event", "e" * 40)
        with sqlite3.connect(self.db) as connection:
            connection.execute("UPDATE github_repositories SET local_dirty = 1 WHERE id = ?", (self.repo["id"],))
        blocked = reconcile_repository(self.repo["id"], self.db, client)
        self.assertEqual((blocked["processed"], blocked["cursor"]), (0, ""))
        with sqlite3.connect(self.db) as connection:
            connection.execute("UPDATE github_repositories SET local_dirty = 0 WHERE id = ?", (self.repo["id"],))
        recovered = reconcile_repository(self.repo["id"], self.db, client)
        self.assertEqual((recovered["processed"], recovered["cursor"]), (1, "1"))

    def test_isolated_change_commit_mock_push_and_pr(self):
        source_status = self._git("status", "--porcelain")
        change = prepare_change(
            self.task_id, self.repo["id"], self.db, self.source, self.root / "worktrees"
        )
        self.assertEqual(change["status"], "ready_for_commit_approval")
        self.assertTrue(change["branch"].startswith("forge/task-"))
        self.assertIn("Safe change", change["diff"])
        self.assertIn("Secrets scan passed", change["scan_output"])
        self.assertIn("Locale validation passed", change["validation_output"])
        self.assertEqual(self._git("status", "--porcelain"), source_status)
        self.assertEqual((self.source / "README.md").read_text(encoding="utf-8"), "# Fixture\n")

        committed = approve_commit(change["id"], "docs: apply reviewed fixture change", self.db)
        self.assertEqual(committed["status"], "committed")
        self.assertRegex(committed["commit_sha"], r"^[0-9a-f]{40}$")
        client = MockGitHubApp(self.db)
        pushed = push_change(change["id"], self.db, client)
        self.assertEqual(pushed["status"], "mock_pushed")
        dry_run = create_pull_request(change["id"], "Fixture PR", "Mock only", self.db, client, dry_run=True)
        self.assertEqual(dry_run["status"], "pr_dry_run")
        mock_pr = create_pull_request(change["id"], "Fixture PR", "Mock only", self.db, client, dry_run=False)
        self.assertEqual(mock_pr["status"], "mock_pr_created")
        self.assertTrue(mock_pr["pr_url"].startswith("mock://"))
        self.assertFalse(any(event["action"] == "merge" for event in mock_pr["audit"]))
        self.assertEqual(self._git("status", "--porcelain"), source_status)

    def test_secret_scan_and_base_conflict_stop_before_commit(self):
        with self.assertRaisesRegex(GitHubIntegrationError, "GitHub token"):
            scan_secrets("+++ b/config\n+token = ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZ123456\n")
        with sqlite3.connect(self.db) as connection:
            connection.execute("UPDATE github_repositories SET base_sha = ? WHERE id = ?", ("f" * 40, self.repo["id"]))
        with self.assertRaisesRegex(GitHubIntegrationError, "base commit changed"):
            prepare_change(self.task_id, self.repo["id"], self.db, self.source, self.root / "conflict-worktrees")

    def test_minimum_permissions_and_real_installation_are_enforced(self):
        with self.assertRaisesRegex(GitHubIntegrationError, "minimum"):
            register_repository({
                "project_id": self.project_id, "owner": "Good-Comic", "name": "Other",
                "mode": "mock", "default_branch": "main", "base_ref": "main", "base_sha": self.base_sha,
                "permissions": {"metadata": "read", "contents": "admin"},
            }, self.db)
        with self.assertRaisesRegex(GitHubIntegrationError, "installation_id"):
            register_repository({
                "project_id": self.project_id, "owner": "Good-Comic", "name": "Real",
                "mode": "real", "default_branch": "main", "base_ref": "main", "base_sha": self.base_sha,
            }, self.db)

        with sqlite3.connect(self.db) as connection:
            connection.execute(
                "UPDATE github_repositories SET mode = 'real', installation_id = 42 WHERE id = ?",
                (self.repo["id"],),
            )
        change = prepare_change(
            self.task_id, self.repo["id"], self.db, self.source, self.root / "real-worktrees"
        )
        approve_commit(change["id"], "docs: reviewed real-mode fixture", self.db)
        with self.assertRaisesRegex(GitHubIntegrationError, "explicit authorization"):
            push_change(change["id"], self.db, MockGitHubApp(self.db), allow_external=False)


if __name__ == "__main__":
    unittest.main()
