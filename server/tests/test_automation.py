import json
import sqlite3
import subprocess
import tempfile
import unittest
from pathlib import Path

from server.app import init_db
from server.automation import (
    AutomationError, WorkspaceLocked, acquire_workspace_lock, create_automation_job,
    load_spec_manifest, release_workspace_lock, run_automation_job,
)
from server.github_integration import register_repository


class AutomationTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.db = self.root / "forge.db"
        init_db(self.db)
        self.source = self.root / "source"
        (self.source / "docs").mkdir(parents=True)
        (self.source / "scripts").mkdir()
        (self.source / "README.md").write_text("# Fixture\n", encoding="utf-8")
        (self.source / "docs" / "DECISIONS.md").write_text("# Decisions\n", encoding="utf-8")
        (self.source / "index.html").write_text("<h1>Game</h1><script src='app.js'></script>\n", encoding="utf-8")
        (self.source / "app.js").write_text("console.log('ok');\n", encoding="utf-8")
        (self.source / "scripts" / "validate-locales.mjs").write_text("console.log('573');\n", encoding="utf-8")
        self.git("init", "-b", "codex/riftwatch-forge-integration")
        self.git("config", "user.name", "Fixture")
        self.git("config", "user.email", "fixture@example.invalid")
        self.git("add", ".")
        self.git("commit", "-m", "fixture")
        self.sha = self.git("rev-parse", "HEAD").strip()
        with sqlite3.connect(self.db) as connection:
            self.project_id = connection.execute(
                "INSERT INTO projects(name, relative_path) VALUES ('riftwatch', 'riftwatch')"
            ).lastrowid
        self.repo = register_repository({
            "project_id": self.project_id, "owner": "Good-Comic", "name": "PlayGround",
            "mode": "mock", "default_branch": "main",
            "base_ref": "codex/riftwatch-forge-integration", "base_sha": self.sha,
        }, self.db)
        self.spec = Path(__file__).parents[2] / "specs" / "v3"

    def tearDown(self):
        self.temp.cleanup()

    def git(self, *args):
        return subprocess.run(["git", *args], cwd=self.source, check=True, capture_output=True, text=True).stdout

    def payload(self, **updates):
        value = {
            "project_id": self.project_id, "repo_id": self.repo["id"], "title": "Safe fixture change",
            "request": "Update the two approved documentation files without touching game behavior.",
            "requirement_ids": ["T05-AUT-001", "T05-SAFE-001"],
            "target_paths": ["README.md", "docs/DECISIONS.md"],
            "role_providers": {role: 1 for role in ("planner", "engineer", "qa", "reviewer")},
            "max_retries": 2, "timeout_seconds": 120, "token_limit": 20000,
            "cost_limit_usd": 0, "execution_limit": 12,
        }
        value.update(updates)
        return value

    def run_job(self, job, **kwargs):
        return run_automation_job(
            job["id"], self.db, self.spec, self.source, self.root / "jobs",
            self.root / "previews", self.root / "artifacts", Path("vite"), Path("quality"),
            "http://browser.invalid", quality_callback=lambda _: {"id": 77, "gate_passed": True}, **kwargs,
        )

    def test_mock_closed_loop_is_traceable_and_does_not_touch_source(self):
        original = self.git("status", "--porcelain")
        job = self.run_job(create_automation_job(self.payload(), self.db, self.spec))
        self.assertEqual(job["status"], "awaiting_pr_approval")
        self.assertEqual([item["role"] for item in job["roles"]], ["planner", "engineer", "qa", "reviewer"])
        self.assertTrue(all(item["execution_kind"] == "sequential_mock_role" for item in job["roles"]))
        self.assertTrue(all(not item["independent_agent"] for item in job["roles"]))
        self.assertEqual(job["pr_draft"]["external_action"], "not_performed")
        self.assertEqual({item["status"] for item in job["requirements"]}, {"verified"})
        self.assertEqual(self.git("status", "--porcelain"), original)
        self.assertEqual((self.source / "README.md").read_text(), "# Fixture\n")
        self.assertIn("README.md", job["diff"])
        self.assertIn("docs/DECISIONS.md", job["diff"])

    def test_retry_is_bounded_and_safe_stops_with_recovery_state(self):
        job = create_automation_job(self.payload(), self.db, self.spec)
        result = self.run_job(job, failure_mode="engineer_always")
        self.assertEqual(result["status"], "safe_stopped")
        self.assertEqual(result["attempt"], 3)
        self.assertIn("Safe stop after 3 attempts", result["safe_stop_reason"])
        self.assertEqual(len([item for item in result["roles"] if item["role"] == "engineer"]), 3)

    def test_atomic_lock_conflict_and_expired_lease_recovery(self):
        first = create_automation_job(self.payload(title="first"), self.db, self.spec)
        second = create_automation_job(self.payload(title="second"), self.db, self.spec)
        token = acquire_workspace_lock("fixture", first["id"], self.db)
        with self.assertRaises(WorkspaceLocked):
            acquire_workspace_lock("fixture", second["id"], self.db)
        with sqlite3.connect(self.db) as connection:
            connection.execute("UPDATE automation_locks SET expires_at=0 WHERE workspace_key='fixture'")
        replacement = acquire_workspace_lock("fixture", second["id"], self.db)
        release_workspace_lock("fixture", second["id"], replacement, self.db)
        self.assertNotEqual(token, replacement)

    def test_manifest_and_input_boundaries(self):
        manifest = load_spec_manifest(self.spec)
        self.assertEqual(manifest["status"], "source_incomplete")
        self.assertLessEqual(max(item["characters"] for item in manifest["chunks"]), 6000)
        with self.assertRaisesRegex(AutomationError, "6000"):
            create_automation_job(self.payload(request="x" * 6001), self.db, self.spec)
        with self.assertRaisesRegex(AutomationError, "unknown"):
            create_automation_job(self.payload(requirement_ids=["MADE-UP"]), self.db, self.spec)
        with self.assertRaisesRegex(AutomationError, "allowlist boundary"):
            create_automation_job(self.payload(target_paths=["../secret"]), self.db, self.spec)


if __name__ == "__main__":
    unittest.main()
