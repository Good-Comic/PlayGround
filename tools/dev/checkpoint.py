#!/usr/bin/env python3
"""Explicit authorized commit/push wrapper; manifests are snapshots, never recursively committed."""
import argparse,subprocess
from pathlib import Path
from worktree_recovery import git,inventory,load,atomic_json,markdown
def snapshot(repo,trigger):
 out=repo/'docs/recovery';data=inventory(repo,load(out/'task-registry.json',{}),trigger,load(out/'worktree-recovery.json',None));atomic_json(out/'worktree-recovery.json',data);(out/'WORKTREE-RECOVERY.md').write_text(markdown(data))
def main():
 p=argparse.ArgumentParser();p.add_argument('--repo',type=Path,default=Path.cwd());p.add_argument('--manifest-repo',type=Path);p.add_argument('--agent');p.add_argument('--execution');p.add_argument('--message');p.add_argument('--stage',nargs='+',default=[]);p.add_argument('--push',action='store_true');a=p.parse_args();repo=a.repo.resolve();manifest_repo=(a.manifest_repo or repo).resolve();branch=git(repo,'branch','--show-current')
 if not branch.startswith('codex/riftwatch-') or 'checkpoint' in branch.lower():raise SystemExit('Protected/out-of-scope branch')
 if a.message or a.push:
  from agent_handoff import remote_ownership
  _,state=remote_ownership(repo)
  owners=[r for r in state['tasks'].values() if r['branch']==branch and r['status']=='OWNED']
  if len(owners)!=1 or (owners[0]['agent'],owners[0]['execution'])!=(a.agent,a.execution):raise SystemExit('Confirmed remote branch ownership required via --agent/--execution')
 git(repo,'diff','--check');git(repo,'diff','--cached','--check')
 if a.stage:
  if not a.message:raise SystemExit('--stage requires an explicit commit message')
  git(repo,'add','--',*a.stage)
 if a.message:
  git(repo,'commit','-m',a.message);snapshot(manifest_repo,'POST_COMMIT')
 if a.push:
  head=git(repo,'rev-parse','HEAD');git(repo,'push','origin',head+':refs/heads/'+branch);actual=git(repo,'ls-remote','origin','refs/heads/'+branch).split()[0]
  if actual!=head:raise SystemExit('REMOTE_HEAD_MISMATCH; preserve local work and re-inventory')
  snapshot(manifest_repo,'POST_PUSH');print('REMOTE_SAVED',branch,head)
 else:snapshot(manifest_repo,'SLICE_COMPLETE');print('LOCAL_SNAPSHOT_ONLY; no push performed')
if __name__=='__main__':main()
