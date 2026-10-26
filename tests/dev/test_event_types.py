import sys,unittest,json
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[2]/'tools/monitor'))
from progress_feed import normalize,render,EVENT_TYPES

class TypedEventsTests(unittest.TestCase):
 def fixture(self):return dict(task_id='TEST',agent='Codex',severity='PROGRESS',branch='codex/riftwatch-v226-delivery',commit='a'*40,summary='verified checkpoint')
 def test_backward_compatible_default(self):self.assertEqual(normalize(self.fixture())['event_type'],'PROGRESS')
 def test_all_required_types_and_idempotence(self):
  for kind in EVENT_TYPES:
   d=dict(self.fixture(),event_type=kind);e=normalize(d);files=render(e);rows=[json.loads(x) for x in files['docs/monitor/RECENT-EVENTS.jsonl'].splitlines()]
   self.assertEqual(rows[0]['event_type'],kind);self.assertIsNone(render(normalize(d),rows));self.assertIn('NOT_EXTERNAL_EXECUTION_DETECTION',rows[0]['occurrence_basis'])
 def test_unknown_type_or_unzoned_date_rejected(self):
  for k,v in [('event_type','FAKE_QUOTA_DETECTED'),('occurred_at','2026-10-26T10:00:00'),('occurred_at','nonsense')]:
   with self.assertRaises(ValueError):normalize(dict(self.fixture(),**{k:v}))
 def test_provided_date_retained(self):
  d=dict(self.fixture(),occurred_at='2026-10-26T11:00:00+08:00');files=render(normalize(d));self.assertEqual(json.loads(files['docs/monitor/PROJECT-STATUS.json'])['latest_event']['occurred_at'],d['occurred_at'])
if __name__=='__main__':unittest.main()
