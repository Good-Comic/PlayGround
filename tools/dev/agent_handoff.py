#!/usr/bin/env python3
"""Safe manual handoff packages; ownership publication is a separate, explicit CAS command."""
import argparse,hashlib,json,os,re,subprocess,tempfile
from pathlib import Path
from worktree_recovery import atomic_json,git,inventory,load,utc

STATES={'READY','IN_PROGRESS','CHECKPOINTED','HANDOFF_READY','BLOCKED','VERIFIED','INTEGRATED'}
TRIGGERS={'TOKEN_LIMIT','RATE_LIMIT','CONTEXT_LIMIT','TOOL_FAILURE','ENVIRONMENT_LOST','MANUAL_HANDOFF'}
OWNERSHIP_REF='refs/heads/codex/riftwatch-task-ownership'
def transition(state,task,agent,execution,branch,expected,action,prior_stopped=False):
 if state.get('version')!=expected:raise ValueError('OWNERSHIP_VERSION_CONFLICT')
 if not branch.startswith('codex/riftwatch-') or 'checkpoint' in branch.lower():raise ValueError('PROTECTED_OR_OUT_OF_SCOPE_BRANCH')
 prior=state.get('tasks',{}).get(task)
 if action=='claim':
  if prior and prior['status']=='OWNED' and (prior['agent'],prior['execution'])!=(agent,execution) and not prior_stopped:raise ValueError('OWNER_NOT_CONFIRMED_STOPPED: use an independent branch/task')
  for key,row in state.get('tasks',{}).items():
   if key!=task and row['branch']==branch and row['status']=='OWNED':raise ValueError('BRANCH_ALREADY_OWNED')
 elif not prior or (prior['agent'],prior['execution'])!=(agent,execution):raise ValueError('ONLY_CURRENT_OWNER_CAN_RELEASE')
 out=json.loads(json.dumps(state));out['version']+=1;out.setdefault('tasks',{})[task]={'agent':agent,'execution':execution,'branch':branch,'status':'OWNED' if action=='claim' else 'RELEASED','revision':out['version'],'updated_at':utc(),'previous_owner_stopped_asserted':prior_stopped};return out
def remote_ownership(repo,fetch=False):
 rows=git(repo,'ls-remote','origin',OWNERSHIP_REF).splitlines()
 if not rows:return None,{'schema_version':1,'version':0,'tasks':{}}
 sha=rows[0].split()[0]
 try:raw=git(repo,'show',sha+':ownership.json')
 except subprocess.SubprocessError:
  if not fetch:raise ValueError('OWNERSHIP_OBJECT_MISSING: explicit fetch/revalidation required')
  # Explicit ownership command only. Fetch objects without rewriting any local branch.
  git(repo,'fetch','--no-tags','origin',OWNERSHIP_REF);raw=git(repo,'show',sha+':ownership.json')
 return sha,json.loads(raw)
def publish_ownership(repo,args):
 parent,state=remote_ownership(repo,fetch=True);updated=transition(state,args.task,args.agent,args.execution,args.branch,args.expected_version,args.action,args.prior_stopped)
 with tempfile.TemporaryDirectory(prefix='riftwatch-ownership-') as folder:
  env=dict(os.environ,GIT_INDEX_FILE=str(Path(folder)/'index'))
  def run(*cmd,input=None):return subprocess.check_output(['git','-C',str(repo),*cmd],input=input,env=env,stderr=subprocess.DEVNULL).decode().strip()
  run('read-tree','--empty');blob=run('hash-object','-w','--stdin',input=json.dumps(updated,indent=2).encode());run('update-index','--add','--cacheinfo',f'100644,{blob},ownership.json');tree=run('write-tree');cmd=['commit-tree',tree]+(['-p',parent] if parent else []);commit=run(*cmd,input=f'ownership: {args.action} {args.task} revision{updated["version"]}\n'.encode())
  # Normal fast-forward push is the distributed compare-and-swap. No force/lease bypass.
  try:run('push','origin',commit+':'+OWNERSHIP_REF)
  except subprocess.SubprocessError:raise ValueError('OWNERSHIP_PUBLISH_REJECTED: no write ownership acquired; re-read remote')
  current,_=remote_ownership(repo)
  if current!=commit:raise ValueError('OWNERSHIP_REMOTE_CHANGED: revalidate before any task writes')
 return {'status':'OWNERSHIP_PUBLISHED','commit':commit,'version':updated['version'],'task':args.task}
def validate_task(task):
 required=['task_id','name','requirement_source','priority','agent','environment','branch','base_commit','latest_pushed_commit','completed','uncommitted','unpushed','tests','evidence','failures','blockers','next_steps','permissions','status','updated_at']
 errors=[f'missing:{k}' for k in required if k not in task]
 if task.get('status') not in STATES:errors.append('invalid_status')
 for k in ['base_commit','latest_pushed_commit']:
  if task.get(k) is not None and not re.fullmatch('[0-9a-f]{40}',task[k]):errors.append('invalid_sha:'+k)
 return errors
def package(repo,out,trigger,trigger_evidence=None):
 active=load(repo/'docs/handoff/ACTIVE-TASK.json',{});queue=load(repo/'docs/handoff/NEXT-TASKS.json',{});registry=load(repo/'docs/recovery/task-registry.json',{});prior=load(repo/'docs/recovery/worktree-recovery.json',None);recovery=inventory(repo,registry,'RECOVERY_RESUME',prior)
 errors=validate_task(active)
 for task in queue.get('tasks',[]):errors.extend(task.get('task_id','unknown')+':'+e for e in validate_task(task))
 known={r['branch']:r for r in recovery['worktrees']};row=known.get(active.get('branch'))
 if row:
  active=dict(active,latest_pushed_commit=row['remote_head'],uncommitted=row['changed_files'],unpushed=row['unpushed_commits'],updated_at=utc())
 queue=json.loads(json.dumps(queue))
 for task in queue.get('tasks',[]):
  w=known.get(task.get('branch'))
  if w:task.update({'latest_pushed_commit':w['remote_head'],'uncommitted':w['changed_files'],'unpushed':w['unpushed_commits'],'updated_at':recovery['captured_at_utc']})
 try:
  owner_head,owners=remote_ownership(repo);ownership={'status':'REMOTE_QUERIED','commit':owner_head,'state':owners}
 except (subprocess.SubprocessError,OSError,ValueError):ownership={'status':'REMOTE_UNKNOWN'}
 # This report cannot assert other agents are stopped or account quota is exhausted.
 r={'schema_version':1,'generated_at':utc(),'framework_status':'HANDOFF_FRAMEWORK_READY' if not errors else 'INCOMPLETE','cross_agent_status':'NOT_TESTED','write_eligibility':'REVALIDATE_REMOTE_OWNERSHIP_AND_HEAD_BEFORE_WRITING','trigger':{'kind':trigger,'confidence':'CONFIRMED' if trigger_evidence else 'OPERATOR_REQUESTED_NOT_AUTODETECTED','evidence':trigger_evidence},'active_task':active,'next_tasks':queue,'recovery':recovery,'ownership':ownership,'validation_errors':errors,'pending_preservation':[{'branch':w['branch'],'dirty':w['dirty'],'remote_status':w['remote_status'],'unpushed':w['unpushed_commits']} for w in recovery['worktrees'] if w['dirty'] or w['remote_status']!='REMOTE_SAVED']}
 atomic_json(out/'handoff-package.json',r);prompt='''Read AGENTS.md, docs/handoff/SHARED-RULES.md, all current docs/handoff/STRATEGY*.md (including explicit authorized scopes), the recovery manifest and handoff-package.json first. Verify actual GitHub refs and evidence hashes. Confirm ownership in the shared ownership branch before writing; an expired lease is not permission. If the previous owner cannot be confirmed stopped, use an independent continuation branch/task. Do not redo completed valid tests, overwrite dirty files, alter main/checkpoints, launch workflows or publish outside confirmed explicit scope. Current user authorization prevails over historical blanket prohibitions; never infer new permission from a handoff. Resume the smallest uncompleted slice from active_task.next_steps. Local, online, prototype and hardware evidence remain distinct. Save an ordinary commit/push and refresh recovery after each slice. No credentials are provided by this package.\n'''
 (out/'NEXT-AGENT-PROMPT.md').write_text(prompt);(out/'HANDOFF.md').write_text('# Agent Handoff\n\n'+r['framework_status']+' · CROSS_AGENT_HANDOFF_VERIFIED is not claimed.\n\n'+prompt+'\n## Pending preservation\n\n'+json.dumps(r['pending_preservation'],indent=2)+'\n')
 return r
def main():
 p=argparse.ArgumentParser();p.add_argument('--repo',type=Path,default=Path(__file__).resolve().parents[2]);sub=p.add_subparsers(dest='command',required=True);pack=sub.add_parser('pack');pack.add_argument('--out',type=Path);pack.add_argument('--trigger',choices=sorted(TRIGGERS),default='MANUAL_HANDOFF');pack.add_argument('--trigger-evidence');own=sub.add_parser('ownership');own.add_argument('action',choices=['claim','release']);own.add_argument('--task',required=True);own.add_argument('--agent',required=True);own.add_argument('--execution',required=True);own.add_argument('--branch',required=True);own.add_argument('--expected-version',type=int,required=True);own.add_argument('--prior-stopped',action='store_true');own.add_argument('--publish',action='store_true');a=p.parse_args();repo=a.repo.resolve()
 if a.command=='pack':
  r=package(repo,a.out or repo/'docs/handoff',a.trigger,a.trigger_evidence);print(json.dumps({'status':r['framework_status'],'errors':r['validation_errors'],'pending':len(r['pending_preservation'])}));raise SystemExit(bool(r['validation_errors']))
 if not a.publish:
  _,state=remote_ownership(repo);updated=transition(state,a.task,a.agent,a.execution,a.branch,a.expected_version,a.action,a.prior_stopped);print(json.dumps({'status':'DRY_RUN_NOT_OWNED','proposed_version':updated['version']}))
 else:print(json.dumps(publish_ownership(repo,a)))
if __name__=='__main__':
 try:main()
 except (ValueError,subprocess.SubprocessError,OSError) as e:raise SystemExit(type(e).__name__+': '+str(e) if isinstance(e,ValueError) else 'OPERATION_FAILED: transport details suppressed; no ownership assumed')
