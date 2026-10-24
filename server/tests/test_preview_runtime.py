import sqlite3
import tempfile
import time
import unittest
from pathlib import Path
from urllib.request import urlopen

from server.app import init_db
from server.preview_runtime import (
    PreviewError,
    WebRtsAdapter,
    approve_golden,
    get_preview,
    get_quality_run,
    start_preview,
    stop_preview,
)


class PreviewRuntimeTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.db = self.root / "forge.db"
        self.workspace = self.root / "workspace"
        self.game = self.workspace / "game"
        self.game.mkdir(parents=True)
        (self.game / "index.html").write_text(
            '<!doctype html><script type="module" src="/main.js"></script><h1 id="status">original</h1>',
            encoding="utf-8",
        )
        (self.game / "main.js").write_text(
            "document.querySelector('#status').textContent = 'ready';\n", encoding="utf-8"
        )
        init_db(self.db)
        with sqlite3.connect(self.db) as connection:
            cursor = connection.execute(
                "INSERT INTO projects(name, relative_path) VALUES ('game', 'game')"
            )
            self.project_id = cursor.lastrowid
        self.vite = Path(__file__).parents[1] / "node_modules" / "vite" / "bin" / "vite.js"
        self.preview_root = self.root / "previews"
        self.preview_id = None

    def tearDown(self):
        if self.preview_id is not None:
            try:
                stop_preview(self.preview_id, self.db)
            except PreviewError:
                pass
        self.temp.cleanup()

    def test_adapter_detects_existing_web_game(self):
        adapter = WebRtsAdapter()
        self.assertTrue(adapter.supports(self.game))
        self.assertEqual(adapter.adapter_id, "web-rts-esm")

    def test_vite_preview_is_isolated_and_live_reload_source_changes_are_visible(self):
        preview = start_preview(
            self.project_id, None, self.db, self.workspace, self.preview_root, self.vite,
            port_start=55173, port_end=55182,
        )
        self.preview_id = preview["id"]
        self.assertEqual(preview["status"], "running")
        self.assertEqual(preview["adapter_id"], "web-rts-esm")
        with urlopen(preview["preview_url"], timeout=5) as response:
            html = response.read().decode()
        self.assertIn("/@vite/client", html)
        isolated = Path(preview["workspace_path"])
        (isolated / "main.js").write_text(
            "document.querySelector('#status').textContent = 'updated';\n", encoding="utf-8"
        )
        time.sleep(0.2)
        with urlopen(preview["preview_url"] + "main.js", timeout=5) as response:
            updated = response.read().decode()
        self.assertIn("updated", updated)
        self.assertIn("original", (self.game / "index.html").read_text(encoding="utf-8"))
        refreshed = get_preview(self.preview_id, self.db)
        self.assertEqual(refreshed["recent_files"], [{"path": "main.js", "state": "modified"}])

    def test_golden_requires_explicit_approval_and_passing_run(self):
        artifact_root = self.root / "artifacts"
        artifact_root.mkdir()
        image = artifact_root / "candidate.png"
        image.write_bytes(b"png fixture")
        with sqlite3.connect(self.db) as connection:
            preview = connection.execute(
                """
                INSERT INTO preview_sessions(project_id, adapter_id, workspace_path, port, status, source_manifest_json)
                VALUES (?, 'web-rts-esm', ?, 5173, 'running', '{}')
                """,
                (self.project_id, str(self.game)),
            )
            run = connection.execute(
                """
                INSERT INTO preview_quality_runs(
                    preview_id, status, gate_passed, console_json, page_errors_json,
                    load_failures_json, modified_json, metrics_json, visual_json,
                    success_screenshot, rollback_path, log
                ) VALUES (?, 'passed', 1, '[]', '[]', '[]', '[]', '{}', '{}', ?, ?, 'passed')
                """,
                (preview.lastrowid, str(image), str(self.root / "rollback")),
            )
            preview_id, run_id = preview.lastrowid, run.lastrowid
        with self.assertRaisesRegex(PreviewError, "explicit"):
            approve_golden(preview_id, run_id, False, self.db, artifact_root)
        approved = approve_golden(preview_id, run_id, True, self.db, artifact_root)
        self.assertEqual(approved["golden"]["source_run_id"], run_id)
        self.assertTrue(Path(approved["golden"]["artifact_path"]).is_file())
        self.assertTrue(get_quality_run(run_id, self.db)["gate_passed"])


if __name__ == "__main__":
    unittest.main()
