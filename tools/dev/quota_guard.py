#!/usr/bin/env python3
"""Disconnected quota/checkpoint guard. No account scraper, paid API, scheduler or automatic Agent execution."""
import argparse,datetime,hashlib,json,math,os,subprocess
from pathlib import Path
from worktree_recovery import git,utc,atomic_json

def decide(percent=None,*,simulation=False,checkpoint_saved=False):
    if percent is None:
        return {'state':'QUOTA_PERCENT_UNKNOWN','start_large_work':True,'source':'NO_SUPPORTED_QUOTA_INTERFACE_CONNECTED','account_percent':None,'execution_decision':'RECHECK_ACTUAL_CONSTRAINTS_NOT_PERCENT'}
    if not simulation:
        raise ValueError('No official quota adapter connected; supplied percentages are accepted only as labelled simulations')
    if not isinstance(percent,(int,float)) or isinstance(percent,bool) or not math.isfinite(percent) or not 0<=percent<=100:
        raise ValueError('Invalid remaining percent')
    # USER-APPROVED OVERRIDE 2026-10-27: percentages are informational only.
    # Actual platform refusal, environment/tool/auth failure, ownership conflict,
    # or an exhausted execution/context window controls checkpointing.
    state='INFORMATIONAL_ONLY'
    return {'state':state,'start_large_work':True,'source':'SIMULATION_ONLY_NOT_ACCOUNT_TELEMETRY','account_percent':None,'simulated_percent':percent,'execution_decision':'RECHECK_ACTUAL_CONSTRAINTS_NOT_PERCENT'}

def resume_plan(*,reset_at,now,service_available,quota_available,dispatch_connected=False):
    if reset_at.tzinfo is None or now.tzinfo is None:raise ValueError('Timezone-aware times required')
    if now<reset_at:return {'status':'WAIT_UNTIL_CHECK_TIME','automatic_execution':False}
    if not service_available or not quota_available:return {'status':'RESET_REACHED_STILL_UNAVAILABLE','automatic_execution':False,'bounded_retry_plan':{'maximum_checks':3,'delay_seconds':600,'scheduled':False}}
    # Connection assertion alone is insufficient; only an actual authorised dispatch receipt could certify auto-resume.
    return {'status':'RESUME_READY_MANUAL_DISPATCH','automatic_execution':False,'dispatch_claim':'NOT_EXECUTED','adapter_claim':bool(dispatch_connected),'instruction':'Read latest remote Recovery/Handoff; verify exact branch/SHA and ownership; resume the smallest unfinished slice, preserve valid tests; record RESUMED only after actual start.'}

def reserve_resume(directory,event_id,source_sha):
    if len(event_id)!=64 or len(source_sha)!=40 or any(c not in '0123456789abcdef' for c in event_id+source_sha):raise ValueError('Full event/SHA required')
    directory.mkdir(parents=True,exist_ok=True);lock=directory/'.resume.lock'
    try:fd=os.open(lock,os.O_CREAT|os.O_EXCL|os.O_WRONLY,0o600)
    except FileExistsError:raise ValueError('RESUME_LOCKED; revalidate stopped writer before intervention') from None
    try:
        os.close(fd);path=directory/'resume-events.json';state=json.loads(path.read_text()) if path.exists() else {}
        if event_id in state:
            if state[event_id]!=source_sha:raise ValueError('EVENT_SOURCE_CONFLICT')
            return 'DUPLICATE_NO_DISPATCH'
        state[event_id]=source_sha;atomic_json(path,state);return 'RESERVED_MANUAL_PLAN_NOT_DISPATCHED'
    finally:lock.unlink()

def save_slice(repo,paths,*,agent,execution,message):
    """Explicit reviewed paths only; existing checkpoint tool enforces remote ownership and normal push."""
    branch=git(repo,'branch','--show-current')
    if not branch.startswith('codex/riftwatch-') or 'checkpoint' in branch.lower():raise ValueError('Protected/out-of-scope branch')
    if not paths or any(Path(x).is_absolute() or '..' in Path(x).parts for x in paths):raise ValueError('Explicit safe repository-relative paths required')
    tool=Path(__file__).with_name('checkpoint.py')
    cp=subprocess.run(['python',str(tool),'--repo',str(repo),'--agent',agent,'--execution',execution,'--stage',*paths,'--message',message,'--push'],capture_output=True,text=True)
    local=git(repo,'rev-parse','HEAD')
    try:
        rows=git(repo,'ls-remote','origin','refs/heads/'+branch).splitlines();remote=rows[0].split()[0] if rows else None
        paths_clean=not git(repo,'status','--porcelain','--',*paths)
        status='REMOTE_SAVED' if cp.returncode==0 and remote==local and paths_clean else 'PUSH_BLOCKED' if remote!=local else 'CHECKPOINT_BLOCKED'
    except (subprocess.SubprocessError,OSError):remote=None;paths_clean=False;status='REMOTE_UNKNOWN'
    # A clean exit, manifest or a local commit is never enough to assert remote saving.
    return {'branch':branch,'local_sha':local,'remote_sha':remote,'status':status,'checkpoint_command_success':cp.returncode==0,'requested_paths_clean':paths_clean,'dirty':bool(git(repo,'status','--porcelain')),'transport_details':'OMITTED_NO_CREDENTIALS','ownership_released':False}

def main():
    p=argparse.ArgumentParser();p.add_argument('--out',type=Path,required=True);p.add_argument('--simulate-percent',type=float);p.add_argument('--simulate-checkpoint-saved',action='store_true');a=p.parse_args()
    r={'recorded_at':utc(),'quota':decide(a.simulate_percent,simulation=a.simulate_percent is not None,checkpoint_saved=a.simulate_checkpoint_saved),'resume_check':{'user_provided_once':'2026-10-27T01:39:00+08:00','utc':'2026-10-26T17:39:00Z','recurring_rule':False,'verified_provider_reset':False},'resume_status':'RESUME_READY_MANUAL_DISPATCH','service_execution':'DISPATCH_NOT_CONNECTED','backup_agent':'NOT_CONNECTED_NOT_VERIFIED','automatic_account_detection':False,'checkpoint_order':['finish interruptible slice','inventory all worktrees','diff safety and targeted tests','explicit reviewed normal commit or WIP','normal branch push','query remote fullSHA','Recovery/Handoff/Feed/evidence/nextstep','release only confirmed stopped ownership'],'safety':'Never treat context length as account quota; no credential scraping, sleeping daemon, scheduler or service invocation. Account depletion is not inferred from a generic rate error.'};atomic_json(a.out,r);print(json.dumps(r))
if __name__=='__main__':main()
