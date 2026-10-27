import sys,tempfile,unittest,json,datetime,subprocess,os
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[2]/'tools/dev'))
from quota_guard import decide,resume_plan,reserve_resume,save_slice
from agent_handoff import transition

def git(p,*args,input=None,env=None):return subprocess.check_output(['git','-C',str(p),*args],input=input,env=env,stderr=subprocess.DEVNULL).decode().strip()
class QuotaTests(unittest.TestCase):
 def test_unknown_is_not_low_or_account_percent(self):
  self.assertEqual(decide()['state'],'QUOTA_PERCENT_UNKNOWN');self.assertIsNone(decide()['account_percent'])
  with self.assertRaises(ValueError):decide(2)
 def test_simulated_boundaries(self):
  for value in [100,10.001,10,3.001,3,0]:self.assertEqual(decide(value,simulation=True)['state'],'INFORMATIONAL_ONLY')
  self.assertEqual(decide(3,simulation=True,checkpoint_saved=True)['state'],'INFORMATIONAL_ONLY')
  for invalid in [-1,101,float('nan'),True]:
   with self.assertRaises(ValueError):decide(invalid,simulation=True)
 def test_reset_is_check_not_promise_or_recurring_schedule(self):
  reset=datetime.datetime.fromisoformat('2026-10-27T01:39:00+08:00');now=reset+datetime.timedelta(seconds=1)
  r=resume_plan(reset_at=reset,now=now,service_available=False,quota_available=False);self.assertEqual(r['status'],'RESET_REACHED_STILL_UNAVAILABLE');self.assertFalse(r['bounded_retry_plan']['scheduled'])
  for connected in [False,True]:self.assertEqual(resume_plan(reset_at=reset,now=now,service_available=True,quota_available=True,dispatch_connected=connected)['status'],'RESUME_READY_MANUAL_DISPATCH')
 def test_resume_dedup_and_exact_saved_checkpoint(self):
  with tempfile.TemporaryDirectory() as t:
   p=Path(t);self.assertEqual(reserve_resume(p,'a'*64,'b'*40),'RESERVED_MANUAL_PLAN_NOT_DISPATCHED');self.assertEqual(reserve_resume(p,'a'*64,'b'*40),'DUPLICATE_NO_DISPATCH')
   with self.assertRaises(ValueError):reserve_resume(p,'a'*64,'c'*40)
 def test_other_agent_ownership_conflict(self):
  state=transition({'version':0,'tasks':{}},'T','Gemini-SIMULATED','other','codex/riftwatch-fixture',0,'claim')
  with self.assertRaises(ValueError):transition(state,'T','Codex','new','codex/riftwatch-fixture',1,'claim')
 def fixture(self,root):
  p=root/'repo';p.mkdir();git(p,'init','-b','codex/riftwatch-fixture');git(p,'config','user.name','Fixture');git(p,'config','user.email','fixture@example.invalid');(p/'source').write_text('base');git(p,'add','source');git(p,'commit','-m','base');remote=root/'remote.git';git(p,'init','--bare',str(remote));git(p,'remote','add','origin',str(remote));git(p,'push','origin','HEAD');other=root/'other';git(p,'worktree','add','-b','codex/riftwatch-other',str(other));git(other,'push','origin','HEAD')
  state={'schema_version':1,'version':2,'tasks':{'A':{'branch':'codex/riftwatch-fixture','agent':'SIMULATED','execution':'fixture','status':'OWNED'},'B':{'branch':'codex/riftwatch-other','agent':'SIMULATED','execution':'fixture','status':'OWNED'}}};blob=git(p,'hash-object','-w','--stdin',input=json.dumps(state).encode());env=dict(os.environ,GIT_INDEX_FILE=str(root/'index'));git(p,'read-tree','--empty',env=env);git(p,'update-index','--add','--cacheinfo',f'100644,{blob},ownership.json',env=env);tree=git(p,'write-tree',env=env);commit=git(p,'commit-tree',tree,input=b'fixture ownership\n');git(p,'push','origin',commit+':refs/heads/codex/riftwatch-task-ownership');return p,other,remote
 def test_two_dirty_worktrees_real_local_fixture_push_and_recovery(self):
  with tempfile.TemporaryDirectory() as t:
   p,other,remote=self.fixture(Path(t))
   for wt in [p,other]:(wt/'source').write_text('WIP independently saved')
   for wt in [p,other]:
    r=save_slice(wt,['source'],agent='SIMULATED',execution='fixture',message='WIP simulated safe checkpoint');self.assertEqual(r['status'],'REMOTE_SAVED');self.assertEqual(r['local_sha'],r['remote_sha']);self.assertFalse(r['ownership_released']);self.assertEqual(git(wt,'show',r['remote_sha']+':source'),'WIP independently saved')
   clone=Path(t)/'resumed';git(p,'clone','--branch','codex/riftwatch-fixture',str(remote),str(clone));self.assertEqual(git(clone,'rev-parse','HEAD'),git(p,'rev-parse','HEAD'));self.assertEqual((clone/'source').read_text(),'WIP independently saved')
 def test_denied_checkpoint_does_not_mislabel_already_remote_old_head_as_saved_dirty_work(self):
  with tempfile.TemporaryDirectory() as t:
   p,other,remote=self.fixture(Path(t));(p/'source').write_text('not committed');old=git(p,'rev-parse','HEAD');r=save_slice(p,['source'],agent='UNOWNED',execution='wrong',message='WIP refused');self.assertEqual(r['status'],'CHECKPOINT_BLOCKED');self.assertEqual(r['local_sha'],r['remote_sha']);self.assertEqual(r['local_sha'],old);self.assertFalse(r['requested_paths_clean']);self.assertFalse(r['checkpoint_command_success'])
 def test_rejected_push_never_claims_remote_saved(self):
  with tempfile.TemporaryDirectory() as t:
   p,other,remote=self.fixture(Path(t));hook=remote/'hooks/pre-receive';hook.write_text('#!/bin/sh\nexit 1\n');hook.chmod(0o755);(p/'source').write_text('pending checkpoint');r=save_slice(p,['source'],agent='SIMULATED',execution='fixture',message='WIP retain rejected push');self.assertEqual(r['status'],'PUSH_BLOCKED');self.assertNotEqual(r['local_sha'],r['remote_sha']);self.assertFalse(r['checkpoint_command_success'])
if __name__=='__main__':unittest.main(verbosity=2)
