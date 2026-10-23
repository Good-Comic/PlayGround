import sqlite3
import tempfile
import time
import unittest
from pathlib import Path

from server.app import (
    _run_agent_task,
    approve_agent_task,
    cancel_agent_task,
    create_agent_task,
    create_provider,
    diagnose_provider,
    get_agent_task,
    get_provider,
    import_project,
    init_db,
    list_project_files,
    list_projects,
    list_runs,
    project_changes,
    read_project_text,
    resolve_project_file,
    resolve_project_path,
    retry_agent_task,
    rollback_agent_task,
    run_project_action,
)


class StudioTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name) / "workspace"
        self.root.mkdir()
        self.project = self.root / "demo-game"
        self.project.mkdir()
        (self.project / "index.html").write_text("<h1>demo</h1>", encoding="utf-8")
        (self.project / "app.js").write_text("console.log('demo');", encoding="utf-8")
        (self.project / "scripts").mkdir()
        (self.project / "scripts" / "validate-locales.mjs").write_text(
            "console.log('Locale validation passed: fixture');", encoding="utf-8"
        )
        self.db = Path(self.temp.name) / "forge.db"
        self.task_root = Path(self.temp.name) / "agent-tasks"
        init_db(self.db)

    def tearDown(self):
        self.temp.cleanup()

    def test_import_and_list_project(self):
        project = import_project("demo-game", self.db, self.root)
        self.assertEqual(project["relative_path"], "demo-game")
        self.assertEqual(len(list_projects(self.db)), 1)

    def test_duplicate_import_is_idempotent(self):
        first = import_project("demo-game", self.db, self.root)
        second = import_project("demo-game", self.db, self.root)
        self.assertEqual(first["id"], second["id"])
        self.assertEqual(len(list_projects(self.db)), 1)

    def test_rejects_absolute_path(self):
        with self.assertRaisesRegex(ValueError, "absolute"):
            resolve_project_path(str(self.project), self.root)

    def test_rejects_parent_traversal(self):
        outside = Path(self.temp.name) / "outside"
        outside.mkdir()
        with self.assertRaisesRegex(ValueError, "inside"):
            resolve_project_path("../outside", self.root)

    def test_rejects_workspace_root(self):
        with self.assertRaisesRegex(ValueError, "inside"):
            resolve_project_path(".", self.root)

    def test_changes_are_scoped_to_imported_project(self):
        project = import_project("demo-game", self.db, self.root)
        changes = project_changes(project["id"], self.db, self.root)
        self.assertIn("index.html", [item["path"] for item in changes["files"]])

    def test_event_is_recorded_separately(self):
        import_project("demo-game", self.db, self.root)
        with sqlite3.connect(self.db) as connection:
            count = connection.execute("SELECT COUNT(*) FROM events").fetchone()[0]
        self.assertEqual(count, 1)

    def test_file_listing_and_text_view(self):
        project = import_project("demo-game", self.db, self.root)
        files = list_project_files(project["id"], self.db, self.root)
        self.assertIn({"path": "index.html", "size": 13}, files)
        viewed = read_project_text(project["id"], "index.html", self.db, self.root)
        self.assertEqual(viewed["content"], "<h1>demo</h1>")

    def test_file_view_rejects_traversal_and_git_metadata(self):
        project = import_project("demo-game", self.db, self.root)
        (self.project / ".git").mkdir()
        (self.project / ".git" / "config").write_text("secret", encoding="utf-8")
        with self.assertRaisesRegex(ValueError, "not allowed"):
            resolve_project_file(project["id"], "../outside", self.db, self.root)
        with self.assertRaisesRegex(ValueError, "not allowed"):
            resolve_project_file(project["id"], ".git/config", self.db, self.root)
        self.assertNotIn(".git/config", [item["path"] for item in list_project_files(project["id"], self.db, self.root)])

    def test_allowlisted_build_and_test_runs_are_recorded(self):
        project = import_project("demo-game", self.db, self.root)
        build = run_project_action(project["id"], "build", self.db, self.root)
        test = run_project_action(project["id"], "test", self.db, self.root)
        self.assertEqual(build["status"], "passed")
        self.assertEqual(test["status"], "passed")
        self.assertIn("Locale validation passed", test["output"])
        self.assertEqual(len(list_runs(project["id"], self.db)), 2)

    def test_runner_rejects_arbitrary_action(self):
        project = import_project("demo-game", self.db, self.root)
        with self.assertRaisesRegex(ValueError, "build or test"):
            run_project_action(project["id"], "shell", self.db, self.root)

    def test_provider_url_and_secret_boundaries(self):
        with self.assertRaisesRegex(ValueError, "server"):
            create_provider({
                "name": "leaky", "kind": "openai-compatible",
                "base_url": "https://api.example.com/v1", "model_id": "example", "api_key": "never-store-this",
            }, self.db)
        with self.assertRaisesRegex(ValueError, "HTTPS"):
            create_provider({
                "name": "bad cloud", "kind": "openai-compatible",
                "base_url": "http://api.example.com/v1", "model_id": "example",
            }, self.db)
        with self.assertRaisesRegex(ValueError, "private IP"):
            create_provider({
                "name": "cloud ssrf", "kind": "openai-compatible",
                "base_url": "https://127.0.0.1/v1", "model_id": "example",
            }, self.db)
        with self.assertRaisesRegex(ValueError, "private IP"):
            create_provider({
                "name": "bad local", "kind": "ollama",
                "base_url": "http://example.com/v1", "model_id": "example",
            }, self.db)
        provider = create_provider({
            "name": "cloud", "kind": "openai-compatible",
            "base_url": "https://api.example.com/v1", "model_id": "example",
            "input_cost_per_million": 1, "output_cost_per_million": 2, "max_cost_usd": 1,
        }, self.db)
        self.assertFalse(provider["api_key_configured"])
        self.assertNotIn("api_key", provider)

    def test_mock_provider_diagnosis(self):
        mock = get_provider(1, self.db, public=True)
        self.assertEqual(mock["kind"], "mock")
        self.assertEqual(diagnose_provider(mock["id"], self.db)["status"], "ok")

    def test_unknown_tool_capability_downgrades_to_plan(self):
        project = import_project("demo-game", self.db, self.root)
        provider = create_provider({
            "name": "local", "kind": "ollama", "base_url": "http://127.0.0.1:11434/v1",
            "model_id": "example", "supports_tool_calls": None,
        }, self.db)
        task = create_agent_task({
            "project_id": project["id"], "provider_id": provider["id"], "mode": "edit",
            "target_path": "index.html", "instruction": "change heading",
        }, self.db, self.root, self.task_root, start=False)
        self.assertEqual(task["requested_mode"], "edit")
        self.assertEqual(task["effective_mode"], "plan")
        cancelled = cancel_agent_task(task["id"], self.db)
        self.assertEqual(cancelled["status"], "cancelled")

    def test_mock_edit_approval_validation_and_rollback(self):
        project = import_project("demo-game", self.db, self.root)
        original = (self.project / "index.html").read_text(encoding="utf-8")
        task = create_agent_task({
            "project_id": project["id"], "provider_id": 1, "mode": "edit",
            "target_path": "index.html", "instruction": "prepare a safe mock edit",
        }, self.db, self.root, self.task_root, start=False)
        _run_agent_task(task["id"], self.db, self.root, self.task_root)
        proposed = get_agent_task(task["id"], self.db)
        self.assertEqual(proposed["status"], "awaiting_approval")
        self.assertIn("Project Forge mock proposal", proposed["diff"])
        self.assertEqual((self.project / "index.html").read_text(encoding="utf-8"), original)

        completed = approve_agent_task(task["id"], self.db, self.root)
        self.assertEqual(completed["status"], "completed")
        self.assertIn("node --check app.js", completed["validation_output"])
        self.assertIn("Locale validation passed", completed["validation_output"])
        self.assertEqual((self.project / "index.html").read_text(encoding="utf-8"), original)

        rolled_back = rollback_agent_task(task["id"], self.db, self.root)
        self.assertEqual(rolled_back["status"], "rolled_back")
        sandbox_file = Path(rolled_back["workspace_path"]) / "index.html"
        self.assertEqual(sandbox_file.read_text(encoding="utf-8"), original)
        self.assertGreaterEqual(len(rolled_back["events"]), 6)

    def test_mock_plan_completes_without_workspace(self):
        project = import_project("demo-game", self.db, self.root)
        task = create_agent_task({
            "project_id": project["id"], "provider_id": 1, "mode": "plan",
            "instruction": "summarize the project",
        }, self.db, self.root, self.task_root, start=False)
        _run_agent_task(task["id"], self.db, self.root, self.task_root)
        completed = get_agent_task(task["id"], self.db)
        self.assertEqual(completed["status"], "completed")
        self.assertEqual(completed["workspace_path"], "")
        self.assertEqual(completed["diff"], "")

    def test_failed_primary_uses_fallback_without_losing_task(self):
        project = import_project("demo-game", self.db, self.root)
        primary = create_provider({
            "name": "offline local", "kind": "ollama", "base_url": "http://127.0.0.1:1/v1",
            "model_id": "offline", "timeout_seconds": 1, "retries": 0,
            "supports_tool_calls": True, "fallback_provider_id": 1,
        }, self.db)
        task = create_agent_task({
            "project_id": project["id"], "provider_id": primary["id"], "mode": "edit",
            "target_path": "index.html", "instruction": "preserve this instruction across fallback",
        }, self.db, self.root, self.task_root, start=False)
        _run_agent_task(task["id"], self.db, self.root, self.task_root)
        fallback = get_agent_task(task["id"], self.db)
        self.assertEqual(fallback["status"], "awaiting_approval")
        self.assertEqual(fallback["used_provider_id"], 1)
        self.assertEqual(fallback["instruction"], "preserve this instruction across fallback")
        self.assertTrue(any("fallback provider #1" in event["message"] for event in fallback["events"]))

    def test_cancelled_task_can_retry(self):
        project = import_project("demo-game", self.db, self.root)
        task = create_agent_task({
            "project_id": project["id"], "provider_id": 1, "mode": "plan",
            "instruction": "summarize the project",
        }, self.db, self.root, self.task_root, start=False)
        cancel_agent_task(task["id"], self.db)
        retried = retry_agent_task(task["id"], self.db, self.root, self.task_root)
        self.assertEqual(retried["attempt"], 2)
        for _ in range(100):
            completed = get_agent_task(task["id"], self.db)
            if completed["status"] not in {"queued", "running"}:
                break
            time.sleep(0.01)
        self.assertEqual(completed["status"], "completed")


if __name__ == "__main__":
    unittest.main()
