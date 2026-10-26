import json,sys,tempfile,unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[2]/'tools/dev'))
from agent_dispatcher import validate,reserve,classify_failure

class DispatcherTests(unittest.TestCase):
 def fixture(self):
  d=dict(task_id='QA-PROGRESS-READ',event_id='b'*64,source_sha='a'*40,source_branch='codex/riftwatch-v226-delivery',continuation_branch='codex/riftwatch-qa-next',permissions=['READ','LOCAL_QA','LOCAL_REPORT'],max_attempts=1,max_concurrent=1,cost_cap_usd=0,ownership_task='QA-NEXT',review_request_id='REVIEW-1')
  r=dict(request_id='REVIEW-1',source_sha='a'*40,status='REVIEW_PENDING',reviewer_executed=False)
  o={'QA-NEXT':dict(branch=d['continuation_branch'],status='OWNED',agent='Codex',execution='test')}
  return d,r,o
 def test_pending_is_never_accepted(self):
  d,r,o=self.fixture();self.assertEqual(validate(d,r,'a'*40,o,'Codex','test'),'REVIEW_PENDING')
 def test_review_never_connects_agent(self):
  d,r,o=self.fixture();r.update(status='ACCEPTED',reviewer_executed=True);self.assertEqual(validate(d,r,'a'*40,o,'Codex','test'),'DISPATCH_NOT_CONNECTED')
 def test_rejects_unauthorized_scope_source_owner_cost(self):
  for key,value in [('task_id','UPDATE_MAIN'),('permissions',['PUSH']),('continuation_branch','main'),('source_sha','c'*40),('execute',True),('cost_cap_usd',1),('max_attempts',2),('max_concurrent',2)]:
   d,r,o=self.fixture();d[key]=value
   with self.assertRaises(ValueError):validate(d,r,'a'*40,o,'Codex','test')
  d,r,o=self.fixture()
  with self.assertRaises(ValueError):validate(d,r,'a'*40,o,'Gemini','other')
 def test_idempotent_reservation_and_audit(self):
  with tempfile.TemporaryDirectory() as t:
   p=Path(t);row=dict(status='DISPATCH_NOT_CONNECTED',source_sha='a'*40)
   reserve(p,'event',row);self.assertEqual(reserve(p,'event',row)['status'],'DUPLICATE_PLAN_NO_EXECUTION');self.assertEqual(len((p/'audit.jsonl').read_text().splitlines()),1)
 def test_interrupted_lock_not_stolen(self):
  with tempfile.TemporaryDirectory() as t:
   p=Path(t);(p/'dispatch.lock').touch()
   with self.assertRaises(ValueError):reserve(p,'event',{})
   self.assertTrue((p/'dispatch.lock').exists())
 def test_event_reuse_cannot_change_source(self):
  with tempfile.TemporaryDirectory() as t:
   p=Path(t);reserve(p,'event',dict(status='REVIEW_PENDING',source_sha='a'*40))
   with self.assertRaises(ValueError):reserve(p,'event',dict(status='REVIEW_PENDING',source_sha='b'*40))
 def test_active_execution_blocks_new_plan(self):
  with tempfile.TemporaryDirectory() as t:
   p=Path(t);(p/'dispatch-state.json').write_text(json.dumps(dict(plans={},active_executions=1)))
   with self.assertRaises(ValueError):reserve(p,'event',{})
 def test_error_classification_requires_observation(self):
  self.assertEqual(classify_failure('rate_limit'),'RATE_LIMIT');self.assertEqual(classify_failure('quota maybe low'),'UNKNOWN_FAILURE')
if __name__=='__main__':unittest.main()
