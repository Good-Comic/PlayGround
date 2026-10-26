import importlib.util,json,subprocess,sys,tempfile,unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[2]/'tools/dev'))
from worktree_recovery import inventory,atomic_json,write_snapshot
from agent_handoff import transition,validate_task
def run(cwd,*args):return subprocess.check_output(['git','-C',str(cwd),*args],stderr=subprocess.DEVNULL,text=True).strip()
class RecoveryTests(unittest.TestCase):
 def setUp(self):
  self.temp=tempfile.TemporaryDirectory();self.root=Path(self.temp.name);self.repo=self.root/'repo';self.repo.mkdir();run(self.repo,'init','-b','codex/riftwatch-test');run(self.repo,'config','user.name','Fixture');run(self.repo,'config','user.email','fixture@example.invalid');(self.repo/'one file.txt').write_text('one');run(self.repo,'add','.');run(self.repo,'commit','-m','fixture');self.remote=self.root/'remote.git';run(self.repo,'init','--bare',str(self.remote));run(self.repo,'remote','add','origin',str(self.remote));run(self.repo,'push','origin','HEAD');self.other=self.root/'other tree';run(self.repo,'worktree','add','-b','codex/riftwatch-other',str(self.other))
 def tearDown(self):self.temp.cleanup()
 def test_actual_remote_dirty_rename_and_prior_delta(self):
  a=inventory(self.repo);self.assertEqual(len(a['worktrees']),2);self.assertEqual(a['worktrees'][0]['remote_status'],'REMOTE_SAVED');run(self.repo,'mv','one file.txt','renamed file.txt');(self.other/'new.txt').write_text('pending');b=inventory(self.repo,prior=a);self.assertTrue(b['worktrees'][0]['dirty']);self.assertEqual(b['worktrees'][0]['changed_files'][0]['previous_path'],'one file.txt');self.assertTrue(b['comparison']);self.assertEqual(b['worktrees'][1]['remote_status'],'REMOTE_BRANCH_ABSENT')
 def test_unpushed_and_remote_unknown_are_distinct(self):
  (self.repo/'two').write_text('two');run(self.repo,'add','two');run(self.repo,'commit','-m','never dump commit messages');a=inventory(self.repo);self.assertEqual(a['worktrees'][0]['remote_status'],'LOCAL_AHEAD');self.assertEqual(len(a['worktrees'][0]['unpushed_commits']),1);run(self.repo,'remote','set-url','origin',str(self.root/'missing.git'));b=inventory(self.repo);self.assertEqual(b['remote_query']['status'],'REMOTE_UNKNOWN');self.assertEqual(b['worktrees'][0]['remote_status'],'REMOTE_UNKNOWN')
 def test_non_fast_forward_race_rejected_by_real_git(self):
  parent=run(self.repo,'rev-parse','HEAD');tree=run(self.repo,'rev-parse','HEAD^{tree}');c1=run(self.repo,'commit-tree',tree,'-p',parent,'-m','agent1');c2=run(self.repo,'commit-tree',tree,'-p',parent,'-m','agent2');ref='refs/heads/codex/riftwatch-task-ownership';run(self.repo,'push','origin',c1+':'+ref)
  with self.assertRaises(subprocess.CalledProcessError):run(self.repo,'push','origin',c2+':'+ref)
  self.assertEqual(run(self.repo,'ls-remote','origin',ref).split()[0],c1)
 def test_ownership_cas_collision_and_release(self):
  empty={'version':0,'tasks':{}};a=transition(empty,'T','Codex','run1','codex/riftwatch-test',0,'claim')
  for args in [('T','Gemini','run2','codex/riftwatch-test',0,'claim'),('T','Gemini','run2','codex/riftwatch-test',1,'claim'),('X','Gemini','run2','codex/riftwatch-test',1,'claim'),('T','Gemini','run2','codex/riftwatch-test',1,'release')]:
   with self.assertRaises(ValueError):transition(a,*args)
  b=transition(a,'T','Codex','run1','codex/riftwatch-test',1,'release');c=transition(b,'T','Gemini-SIMULATED','fixture','codex/riftwatch-test',2,'claim');self.assertEqual(c['version'],3)
 def test_protected_branch_and_missing_handoff_rejected(self):
  with self.assertRaises(ValueError):transition({'version':0,'tasks':{}},'T','A','X','main',0,'claim')
  self.assertTrue(validate_task({}))
 def test_atomic_snapshot_is_not_remote_push(self):
  d=inventory(self.repo);out=self.root/'snapshot.json';atomic_json(out,d);r=json.loads(out.read_text());self.assertEqual(r['local_record_status'],'LOCAL_INVENTORIED_NOT_A_PUSH');self.assertNotIn('never dump',out.read_text())
 def test_SIMULATED_codex_gemini_codex_independent_clone_relay(self):
  # The test harness simulates Gemini; no Gemini binary/API is invoked or certified.
  branch='codex/riftwatch-relay-fixture';state={'version':0,'tasks':{}}
  state=transition(state,'relay','Codex','A',branch,0,'claim');state=transition(state,'relay','Codex','A',branch,1,'release');state=transition(state,'relay','Gemini-SIMULATED','B',branch,2,'claim')
  clone=self.root/'simulated-agent-environment';run(self.repo,'clone','--branch','codex/riftwatch-test',str(self.remote),str(clone));run(clone,'switch','-c',branch);run(clone,'config','user.name','SIMULATED Gemini');run(clone,'config','user.email','fixture@example.invalid');(clone/'relay-test.txt').write_text('low-risk test fixture only; no real Gemini');run(clone,'add','relay-test.txt');run(clone,'commit','-m','SIMULATED relay test');head=run(clone,'rev-parse','HEAD');run(clone,'push','origin',head+':refs/heads/'+branch)
  state=transition(state,'relay','Gemini-SIMULATED','B',branch,3,'release');state=transition(state,'relay','Codex','C',branch,4,'claim');run(self.repo,'fetch','origin','refs/heads/'+branch);self.assertEqual(run(self.repo,'show',head+':relay-test.txt'),'low-risk test fixture only; no real Gemini');self.assertEqual(state['tasks']['relay']['agent'],'Codex');self.assertEqual(run(self.repo,'branch','--show-current'),'codex/riftwatch-test')
 def test_snapshot_pair_id_and_non_owner_lock_are_preserved(self):
  out=self.root/'out';d=inventory(self.repo);write_snapshot(out,d);saved=json.loads((out/'worktree-recovery.json').read_text());self.assertIn(saved['snapshot_id'],(out/'WORKTREE-RECOVERY.md').read_text());lock=out/'.snapshot-write.lock';lock.write_text('another writer')
  with self.assertRaises(FileExistsError):write_snapshot(out,d)
  self.assertTrue(lock.exists())
 def test_recovery_index_default_is_read_only_and_requires_fresh_directory(self):
  head=run(self.repo,'rev-parse','HEAD');d=self.repo/'docs/handoff';d.mkdir(parents=True);task={'task_id':'fixture','name':'test','requirement_source':'unit fixture','priority':'P0','agent':'SIMULATED','environment':'temp repo','branch':'codex/riftwatch-test','base_commit':head,'latest_pushed_commit':head,'completed':[],'uncommitted':[],'unpushed':[],'tests':[],'evidence':[],'failures':[],'blockers':[],'next_steps':['fixture'],'permissions':['local test only'],'status':'READY','updated_at':'2026-10-26T00:00:00Z'};(d/'ACTIVE-TASK.json').write_text(json.dumps(task));(d/'NEXT-TASKS.json').write_text('{"tasks":[]}');(d/'STRATEGY-V2.2.6.md').write_text('Exact bounded Pages authorization fixture; never authorize main');before=run(self.repo,'show-ref');dirty=run(self.repo,'status','--porcelain');tool=Path(__file__).resolve().parents[2]/'tools/dev/publish_recovery_index.py';out=self.root/'fresh-index';cmd=[sys.executable,str(tool),'--repo',str(self.repo),'--out',str(out)];result=subprocess.run(cmd,capture_output=True,text=True);self.assertEqual(result.returncode,0,result.stderr);self.assertIn('LOCAL_INDEX_ONLY',result.stdout);self.assertEqual((out/'docs/handoff/STRATEGY-V2.2.6.md').read_text(),'Exact bounded Pages authorization fixture; never authorize main');self.assertIn('outside confirmed explicit scope',(out/'docs/handoff/NEXT-AGENT-PROMPT.md').read_text());self.assertEqual(run(self.repo,'show-ref'),before);self.assertEqual(run(self.repo,'status','--porcelain'),dirty);again=subprocess.run(cmd,capture_output=True,text=True);self.assertNotEqual(again.returncode,0);self.assertIn('Fresh empty',again.stderr)
if __name__=='__main__':unittest.main(verbosity=2)
