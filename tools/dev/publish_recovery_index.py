#!/usr/bin/env python3
"""Explicit immutable recovery-index publication. Default produces files only, never pushes."""
import argparse,json,os,subprocess,tempfile
from pathlib import Path
from agent_handoff import package,remote_ownership
from worktree_recovery import git,inventory,load,write_snapshot,atomic_json
REF='refs/heads/codex/riftwatch-recovery-index'
def main():
 p=argparse.ArgumentParser();p.add_argument('--repo',type=Path,default=Path(__file__).resolve().parents[2]);p.add_argument('--out',type=Path,required=True);p.add_argument('--publish',action='store_true');p.add_argument('--agent');p.add_argument('--execution');a=p.parse_args();repo=a.repo.resolve();out=a.out.resolve()
 if out.is_relative_to(repo):raise SystemExit('Index output must be outside working tree to preserve clean source')
 if out.exists() and any(out.iterdir()):raise SystemExit('Fresh empty output directory required; never publish unrelated existing files')
 if a.publish:
  _,owners=remote_ownership(repo);rows=[r for r in owners['tasks'].values() if r['branch']==REF.removeprefix('refs/heads/') and r['status']=='OWNED']
  if len(rows)!=1 or (rows[0]['agent'],rows[0]['execution'])!=(a.agent,a.execution):raise SystemExit('Confirmed recovery-index ownership required')
 data=inventory(repo,load(repo/'docs/recovery/task-registry.json',{}),'FINAL_CHECKPOINT',load(repo/'docs/recovery/worktree-recovery.json',None));write_snapshot(out/'docs/recovery',data)
 handoff=package(repo,out/'docs/handoff','MANUAL_HANDOFF')
 if handoff['validation_errors']:raise SystemExit('Incomplete handoff; index not published')
 for name in ['ACTIVE-TASK.json','NEXT-TASKS.json','SHARED-RULES.md',*[p.name for p in sorted((repo/'docs/handoff').glob('STRATEGY*.md'))]]:
  if (repo/'docs/handoff'/name).exists():(out/'docs/handoff'/name).write_bytes((repo/'docs/handoff'/name).read_bytes())
 # Package's freshly resolved task refs are more current than the checked-in templates.
 atomic_json(out/'docs/handoff/ACTIVE-TASK.json',handoff['active_task']);atomic_json(out/'docs/handoff/NEXT-TASKS.json',handoff['next_tasks'])
 (out/'README.md').write_text('# Recovery index snapshot\n\nThis branch stores immutable point-in-time recovery data, not game source. Bootstrap source/full instructions from codex/riftwatch-gameplay-integration or the source refs in the manifest. Actual Git refs prevail. Snapshot captures application/worktree commits before its own publication; index HEAD is the publication receipt, never embedded recursively. No credentials or actual external-agent verification are supplied.\n')
 if not a.publish:print(json.dumps({'status':'LOCAL_INDEX_ONLY','path':str(out)}));return
 rows=git(repo,'ls-remote','origin',REF).splitlines();parent=rows[0].split()[0] if rows else None
 if parent:
  try:git(repo,'cat-file','-e',parent)
  except subprocess.SubprocessError:git(repo,'fetch','--no-tags','origin',REF)
 with tempfile.TemporaryDirectory(prefix='riftwatch-recovery-index-') as tmp:
  env=dict(os.environ,GIT_INDEX_FILE=str(Path(tmp)/'index'))
  def run(*args,input=None):return subprocess.check_output(['git','-C',str(repo),*args],input=input,env=env,stderr=subprocess.DEVNULL).decode().strip()
  run('read-tree','--empty')
  for path in sorted(out.rglob('*')):
   if not path.is_file() or path.name=='publication-receipt.json':continue
   blob=run('hash-object','-w','--stdin',input=path.read_bytes());run('update-index','--add','--cacheinfo',f'100644,{blob},{path.relative_to(out)}')
  tree=run('write-tree');commit=run('commit-tree',tree,*(['-p',parent] if parent else []),input=f'recovery: immutable final snapshot from {data["collector_commit"]}\n'.encode());run('push','origin',commit+':'+REF)
  actual=git(repo,'ls-remote','origin',REF).split()[0]
  if actual!=commit:raise SystemExit('INDEX_REMOTE_CHANGED; revalidate remote, no overwrite attempted')
 receipt={'status':'REMOTE_SAVED','index_ref':REF,'index_commit':commit,'source_commit':data['collector_commit'],'snapshot_id':data['snapshot_id'],'snapshot_time':data['captured_at_utc'],'semantics':'Application refs observed before index publication; no recursive source modification'};atomic_json(out/'publication-receipt.json',receipt);print(json.dumps(receipt))
if __name__=='__main__':main()
