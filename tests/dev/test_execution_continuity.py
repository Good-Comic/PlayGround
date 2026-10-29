import datetime as dt
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'tools/dev'))
from execution_continuity import evaluate


class ContinuityTests(unittest.TestCase):
    def state(self, **extra):
        return dict(CHECKPOINT_SHA='a'*40, NEXT_AUTHORIZED_TASK='JPN existing guard', **extra)

    def test_checkpoint_and_unknown_quota_continue_after_arbitrary_elapsed_minutes(self):
        for minutes in [20, 30, 310]:
            state = self.state(started_at='2026-10-30T00:00:00Z')
            now = dt.datetime.fromisoformat(state['started_at'].replace('Z', '+00:00')) + dt.timedelta(minutes=minutes)
            r = evaluate(state, now.isoformat())
            self.assertEqual(r['decision'], 'CONTINUE_AUTHORIZED_TASK')
            self.assertEqual(r['STOP_REASON'], 'NOT_STOPPED')

    def test_voluntary_stop_is_early_stop_not_a_platform_limit(self):
        r = evaluate(self.state(event='stop', explanation='Two slices saved'), '2026-10-30T00:00:00Z')
        self.assertEqual(r['STOP_REASON'], 'AGENT_EARLY_STOP')
        self.assertEqual(r['decision'], 'CONTINUE_AUTHORIZED_TASK')
        self.assertIsNone(r['EXECUTION_DURATION']['seconds'])

    def test_blocker_requires_evidence_and_is_not_independently_certified(self):
        for reason in ['QUOTA_REJECTED', 'TOOL_FAILURE', 'ENVIRONMENT_FAILURE', 'CONTEXT_LIMIT']:
            with self.assertRaises(ValueError):
                evaluate(self.state(observed_blocker={'reason': reason}), '2026-10-30T00:00:00Z')
            r = evaluate(self.state(observed_blocker={'reason': reason, 'evidence_reference': 'fixture/tool-result', 'observation': 'SIMULATED error'}), '2026-10-30T00:00:00Z')
            self.assertEqual(r['STOP_REASON'], reason)
            self.assertEqual(r['evidence_verification'], 'CALLER_RECORDED_NOT_INDEPENDENTLY_VERIFIED')

    def test_monitor_and_connection_assertion_do_not_certify_auto_resume(self):
        r = evaluate(self.state(AUTO_RESUME_AVAILABLE=True, scheduler_connected=True, monitor_hourly=True), '2026-10-30T00:00:00Z')
        self.assertFalse(r['AUTO_RESUME_AVAILABLE'])
        self.assertFalse(r['automatic_execution'])

    def test_scoped_duration_and_invalid_timestamps(self):
        s = self.state(started_at='2026-10-30T08:00:00+08:00', duration_scope='snapshot interval only')
        r = evaluate(s, '2026-10-30T00:07:52Z')
        self.assertEqual(r['EXECUTION_DURATION']['seconds'], 472)
        self.assertEqual(r['EXECUTION_DURATION']['scope'], 'snapshot interval only')
        for start in ['2026-10-30T01:00:00', '2026-10-30T01:00:00Z']:
            with self.assertRaises(ValueError):
                evaluate(self.state(started_at=start), '2026-10-30T00:00:00Z')

    def test_actual_checkpoint_cli_emits_continue_without_dispatch_or_commit(self):
        with tempfile.TemporaryDirectory() as folder:
            p = Path(folder)
            def git(*args):
                return subprocess.check_output(['git', '-C', str(p), *args], stderr=subprocess.DEVNULL, text=True).strip()
            git('init', '-b', 'codex/riftwatch-fixture')
            git('config', 'user.name', 'Fixture')
            git('config', 'user.email', 'fixture@example.invalid')
            d = p / 'docs/handoff'; d.mkdir(parents=True)
            (d/'ACTIVE-TASK.json').write_text(json.dumps({'next_steps':['JPN existing guard']}))
            git('add', '.'); git('commit', '-m', 'fixture')
            before = git('rev-parse', 'HEAD')
            result = subprocess.run([sys.executable, str(ROOT/'tools/dev/checkpoint.py'), '--repo', str(p)], capture_output=True, text=True)
            self.assertEqual(result.returncode, 0, result.stderr)
            record = json.loads(result.stdout.splitlines()[-1])
            self.assertEqual(record['decision'], 'CONTINUE_AUTHORIZED_TASK')
            self.assertEqual(record['CHECKPOINT_SHA'], before)
            self.assertEqual(git('rev-parse', 'HEAD'), before)
            self.assertFalse(record['automatic_execution'])


if __name__ == '__main__':
    unittest.main(verbosity=2)
