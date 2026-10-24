import tempfile
import unittest
from pathlib import Path

from server.isolation import IsolationError, IsolationLimits, build_job_spec, validate_runner_binding


IMAGE = "registry.example.invalid/forge/job@sha256:" + "a" * 64


class IsolationPolicyTests(unittest.TestCase):
    def test_disposable_job_contract_is_fail_closed(self):
        with tempfile.TemporaryDirectory() as root:
            source = Path(root) / "source"
            output = Path(root) / "output"
            source.mkdir(); output.mkdir()
            spec = build_job_spec("job-1", "javascript-check", IMAGE, source, output)
        self.assertEqual(spec["network"], "none")
        self.assertTrue(spec["read_only_root"])
        self.assertEqual(spec["cap_drop"], ["ALL"])
        self.assertEqual(spec["secrets"], [])
        self.assertTrue(spec["remove_after_exit"])
        self.assertTrue(spec["mounts"][0]["read_only"])
        with self.assertRaisesRegex(IsolationError, "required"):
            validate_runner_binding(None)

    def test_malicious_paths_actions_images_and_exhaustion_are_rejected(self):
        with tempfile.TemporaryDirectory() as root:
            source = Path(root) / "source"
            output = Path(root) / "output"
            source.mkdir(); output.mkdir()
            bad = (("shell", IMAGE, IsolationLimits()),
                   ("javascript-check", "forge/job:latest", IsolationLimits()),
                   ("javascript-check", IMAGE, IsolationLimits(memory_bytes=8 * 1024**3)),
                   ("javascript-check", IMAGE, IsolationLimits(timeout_seconds=3600)))
            for action, image, limits in bad:
                with self.subTest(action=action, image=image, limits=limits):
                    with self.assertRaises(IsolationError):
                        build_job_spec("job-1", action, image, source, output, limits)

    def test_runner_transport_rejects_plain_http(self):
        with self.assertRaises(IsolationError):
            validate_runner_binding("http://runner:8080")
        self.assertEqual(validate_runner_binding("unix:///run/forge-runner.sock"), "unix:///run/forge-runner.sock")


if __name__ == "__main__":
    unittest.main()
