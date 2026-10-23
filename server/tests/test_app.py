import sqlite3
import tempfile
import unittest
from pathlib import Path

from server.app import import_project, init_db, list_projects, project_changes, resolve_project_path


class StudioTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name) / "workspace"
        self.root.mkdir()
        self.project = self.root / "demo-game"
        self.project.mkdir()
        (self.project / "index.html").write_text("<h1>demo</h1>", encoding="utf-8")
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
        self.assertEqual(changes["files"], [{"path": "index.html", "size": 13}])

    def test_event_is_recorded_separately(self):
        import_project("demo-game", self.db, self.root)
        with sqlite3.connect(self.db) as connection:
            count = connection.execute("SELECT COUNT(*) FROM events").fetchone()[0]
        self.assertEqual(count, 1)


if __name__ == "__main__":
    unittest.main()
