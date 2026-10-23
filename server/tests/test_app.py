import sqlite3
import tempfile
import unittest
from pathlib import Path

from server.app import (
    import_project,
    init_db,
    list_project_files,
    list_projects,
    list_runs,
    project_changes,
    read_project_text,
    resolve_project_file,
    resolve_project_path,
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


if __name__ == "__main__":
    unittest.main()
