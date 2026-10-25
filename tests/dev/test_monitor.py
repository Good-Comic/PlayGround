import sys,unittest,json
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[2]/'tools/monitor'))
from progress_feed import normalize,render
class MonitorTests(unittest.TestCase):
 def fixture(self):return {'task_id':'P0','agent':'Codex','severity':'PROGRESS','branch':'codex/riftwatch-playtest-candidate','commit':'a'*40,'summary':'candidate prepared','tests':[],'next_steps':['verify'],'response':'Candidate local only'}
 def test_schema_and_snapshot_only(self):
  e=normalize(self.fixture());files=render(e);d=json.loads(files['docs/monitor/PROJECT-STATUS.json']);self.assertEqual(d['capability'],'GITHUB_PROGRESS_SYNC_READY');self.assertIn('NOT claimed',d['channel']);self.assertEqual(len(files),4)
 def test_idempotent_event_no_commit_loop(self):
  e=normalize(self.fixture());files=render(e);prior=[json.loads(s) for s in files['docs/monitor/RECENT-EVENTS.jsonl'].splitlines()];self.assertIsNone(render(normalize(self.fixture()),prior))
 def test_credentials_and_personal_text_rejected(self):
  for value in ['password=PRIVATE_CANARY','Bearer PRIVATE_CANARY','cookie: PRIVATE_CANARY','alice@example.com','sk-abcdefghijklmnopqrstuvwxyz']:
   d=self.fixture();d['summary']=value
   with self.assertRaises(ValueError):normalize(d)
 def test_unknown_fields_are_dropped(self):
  d=self.fixture();d['cookie']='PRIVATE_CANARY';self.assertNotIn('PRIVATE_CANARY',json.dumps(normalize(d)))
 def test_bad_sha_or_protected_branch_rejected(self):
  for k,v in [('commit','abc'),('branch','main'),('severity','LIVE_CODEX_STREAM_VERIFIED')]:
   d=self.fixture();d[k]=v
   with self.assertRaises(ValueError):normalize(d)
 def test_history_is_bounded_and_failure_is_retained(self):
  prior=[{'event_id':str(i)} for i in range(220)];d=self.fixture();d['severity']='BLOCKED';d['blockers']=[{'id':'PERF','summary':'retained failure','severity':'BLOCKED'}];files=render(normalize(d),prior);self.assertEqual(len(files['docs/monitor/RECENT-EVENTS.jsonl'].splitlines()),200);self.assertIn('retained failure',files['docs/monitor/BLOCKERS.json'])
 def test_separate_workstreams_keep_other_tasks_blockers(self):
  first=self.fixture();first['blockers']=[{'id':'PERF','summary':'retained failure','severity':'BLOCKED'}];f=render(normalize(first));previous=[json.loads(x) for x in f['docs/monitor/RECENT-EVENTS.jsonl'].splitlines()];second=self.fixture();second['task_id']='MONITOR';f=render(normalize(second),previous);self.assertEqual(len(json.loads(f['docs/monitor/PROJECT-STATUS.json'])['workstreams']),2);self.assertIn('retained failure',f['docs/monitor/BLOCKERS.json'])
if __name__=='__main__':unittest.main(verbosity=2)
