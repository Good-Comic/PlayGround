#!/usr/bin/env python3
"""Read-only Git inventory plus explicit output files. Never fetch/commit/push or read credentials."""
import argparse,datetime,hashlib,json,os,subprocess,tempfile
from pathlib import Path

SCHEMA=1
TRIGGERS=['TASK_START','RECOVERY_RESUME','POST_COMMIT','POST_PUSH','PRE_MERGE','POST_MERGE','SLICE_COMPLETE','FINAL_CHECKPOINT']
def utc():return datetime.datetime.now(datetime.timezone.utc).isoformat()
def git(repo,*args):
 return subprocess.check_output(['git','-C',str(repo),*args],stderr=subprocess.DEVNULL,timeout=35).decode('utf-8','surrogateescape').strip()
def atomic_json(path,data):
 path=Path(path);path.parent.mkdir(parents=True,exist_ok=True)
 fd,tmp=tempfile.mkstemp(prefix='.'+path.name,dir=path.parent)
 try:
  with os.fdopen(fd,'w') as f:json.dump(data,f,ensure_ascii=True,indent=2);f.write('\n')
  os.replace(tmp,path)
 finally:
  if os.path.exists(tmp):os.unlink(tmp)
def load(path,default):
 try:return json.loads(Path(path).read_text())
 except FileNotFoundError:return default
def worktrees(repo):
 raw=git(repo,'worktree','list','--porcelain','-z');rows=[];row={}
 for item in raw.split('\0'):
  if not item:
   if row:rows.append(row);row={}
  else:
   key,_,value=item.partition(' ');row[key]=value
 if row:rows.append(row)
 return rows
def status_files(repo):
 raw=subprocess.check_output(['git','-C',str(repo),'status','--porcelain=v1','-z','--untracked-files=all'],stderr=subprocess.DEVNULL,timeout=35).decode('utf-8','surrogateescape');parts=raw.split('\0');rows=[];i=0
 while i<len(parts):
  item=parts[i];i+=1
  if not item:continue
  row={'status':item[:2],'path':item[3:]}
  if 'R' in row['status'] or 'C' in row['status']:
   row['previous_path']=parts[i];i+=1
  rows.append(row)
 return rows
def resources(repo,commit=None):
 def relevant(p):return p in ['index.html','styles.css'] or p.startswith(('js/','assets/'))
 if commit:
  entries={}
  for row in git(repo,'ls-tree','-r',commit).splitlines():
   meta,path=row.split('\t',1)
   if relevant(path):entries[path]=meta.split()[2]
  return entries
 entries={}
 for path in [Path(repo)/'index.html',Path(repo)/'styles.css',*(Path(repo)/'js').rglob('*'),*(Path(repo)/'assets').rglob('*')]:
  if path.is_file():
   b=path.read_bytes();entries[str(path.relative_to(repo))]=hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()
 return entries
def inventory(repo,registry=None,trigger='TASK_START',prior=None):
 repo=Path(repo).resolve();registry=registry or {};captured=utc();remote={'status':'REMOTE_UNKNOWN','queried_at':captured};heads={}
 try:
  heads={row.split()[1].removeprefix('refs/heads/'):row.split()[0] for row in git(repo,'ls-remote','--heads','origin').splitlines()};remote['status']='REMOTE_QUERIED'
 except (subprocess.SubprocessError,OSError):remote['reason']='query_failed_or_timed_out; no credential/transport stderr recorded'
 rows=[]
 for item in worktrees(repo):
  p=Path(item['worktree']);branch=item.get('branch','').removeprefix('refs/heads/');task=registry.get('branches',{}).get(branch,{})
  r={'path':str(p),'branch':branch or None,'head':item.get('HEAD'),'locked':'locked' in item,'task_id':task.get('task_id'),'last_validation':task.get('last_validation',[]),'blockers':task.get('blockers',['NOT_ASSESSED']),'next_steps':task.get('next_steps',['Inspect task registry and relevant diff before writing']),'remote_status':'REMOTE_UNKNOWN','remote_head':None,'unpushed_commits':None}
  try:
   r['changed_files']=status_files(p);r['dirty']=bool(r['changed_files']);r['local_record_status']='LOCAL_INVENTORIED';rh=heads.get(branch);r['remote_head']=rh
   if remote['status']=='REMOTE_QUERIED':
    if not branch:r['remote_status']='DETACHED_HEAD'
    elif not rh:r['remote_status']='REMOTE_BRANCH_ABSENT';r['unpushed_commits']=git(p,'rev-list',r['head'],'--not','--remotes').splitlines()
    elif rh==r['head']:r['remote_status']='REMOTE_SAVED';r['unpushed_commits']=[]
    else:
     try:
      counts=git(p,'rev-list','--left-right','--count',rh+'...'+r['head']).split();behind,ahead=map(int,counts);r.update({'ahead':ahead,'behind':behind,'remote_status':'LOCAL_AHEAD' if ahead and not behind else 'REMOTE_AHEAD' if behind and not ahead else 'DIVERGED','unpushed_commits':git(p,'rev-list',rh+'..'+r['head']).splitlines()})
     except subprocess.SubprocessError:r['remote_status']='REMOTE_HISTORY_UNKNOWN'
   validated=[]
   for evidence in r['last_validation']:
    e=dict(evidence);ep=Path(e['path']);ep=ep if ep.is_absolute() else p/ep;e['exists']=ep.is_file()
    e['storage']='LOCAL_ONLY_OR_MISSING'
    if e['exists']:
     e['sha256']=hashlib.sha256(ep.read_bytes()).hexdigest()
     try:
      rel=str(ep.relative_to(p));blob=git(p,'rev-parse',r['head']+':'+rel);b=ep.read_bytes();actual=hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()
      if blob==actual:e['storage']='REMOTE_SAVED' if r['remote_status']=='REMOTE_SAVED' else 'COMMITTED_LOCAL_REMOTE_UNCONFIRMED'
     except (ValueError,subprocess.SubprocessError):pass
    try:e['resource_freshness']='MATCHES_WORKING_RESOURCES' if resources(p)==resources(p,e['source_commit']) else 'SOURCE_CHANGED'
    except (subprocess.SubprocessError,OSError,KeyError):e['resource_freshness']='UNKNOWN'
    validated.append(e)
   r['last_validation']=validated
  except (subprocess.SubprocessError,OSError):r['inventory_status']='WORKTREE_UNAVAILABLE';r['dirty']=None;r['changed_files']=[]
  rows.append(r)
 previous={r['path']:r for r in (prior or {}).get('worktrees',[])};deltas=[]
 for r in rows:
  old=previous.get(r['path'])
  if not old:deltas.append({'path':r['path'],'change':'NEW_OR_MANIFEST_MISSING'})
  else:
   changed=[k for k in ['branch','head','dirty','remote_head','changed_files'] if old.get(k)!=r.get(k)]
   if changed:deltas.append({'path':r['path'],'changed_fields':changed,'previous_head':old.get('head'),'actual_head':r['head']})
 branches=[]
 for line in git(repo,'for-each-ref','--format=%(refname:short) %(objectname)','refs/heads').splitlines():
  name,head=line.split()
  if not name.startswith('codex/riftwatch-'):continue
  rh=heads.get(name);branches.append({'branch':name,'head':head,'remote_head':rh,'status':'REMOTE_UNKNOWN' if remote['status']=='REMOTE_UNKNOWN' else 'REMOTE_SAVED' if head==rh else 'REMOTE_BRANCH_ABSENT' if not rh else 'HEAD_DIFFERS_REVIEW_REQUIRED'})
 return {'schema_version':SCHEMA,'captured_at_utc':captured,'trigger':trigger,'collector_commit':git(repo,'rev-parse','HEAD'),'collector_dirty':bool(status_files(repo)),'local_record_status':'LOCAL_INVENTORIED_NOT_A_PUSH','remote_query':remote,'remote_heads':heads,'local_branches':branches,'worktrees':rows,'comparison':deltas,'snapshot_semantics':'Point-in-time observation before writing output; snapshot publication commit is necessarily later. No recursive commit loop; pending dirty files remain explicitly unsaved.'}
def markdown(data):
 lines=['# Worktree Recovery Manifest','',f"Captured UTC: {data['captured_at_utc']} · Trigger: {data['trigger']}",f"Collector source: `{data['collector_commit']}` · {data['local_record_status']}",'',data['snapshot_semantics'],'','| Worktree | Branch | HEAD | Remote HEAD | Status | Dirty |','|---|---|---|---|---|---|']
 for r in data['worktrees']:lines.append('| '+' | '.join(str(v).replace('|','\\|') for v in [r['path'],r['branch'],r['head'],r['remote_head'],r['remote_status'],r['dirty']])+' |')
 for r in data['worktrees']:
  lines.extend(['',f"## {r['branch'] or r['path']}",'',f"Unpushed commits: {json.dumps(r['unpushed_commits'])}",f"Uncommitted paths: {json.dumps(r['changed_files'])}",f"Validation: {json.dumps(r['last_validation'],ensure_ascii=False)}",f"Blockers: {'; '.join(r['blockers'])}",f"Next: {'; '.join(r['next_steps'])}"])
 return '\n'.join(lines)+'\n'
def main():
 p=argparse.ArgumentParser();p.add_argument('--repo',type=Path,default=Path(__file__).resolve().parents[2]);p.add_argument('--out',type=Path);p.add_argument('--registry',type=Path);p.add_argument('--trigger',choices=TRIGGERS,default='TASK_START');a=p.parse_args();out=a.out or a.repo/'docs/recovery';prior=load(out/'worktree-recovery.json',None);data=inventory(a.repo,load(a.registry or a.repo/'docs/recovery/task-registry.json',{}),a.trigger,prior);atomic_json(out/'worktree-recovery.json',data);(out/'WORKTREE-RECOVERY.md').write_text(markdown(data));print(json.dumps({'worktrees':len(data['worktrees']),'remote_query':data['remote_query']['status'],'snapshot':str(out/'worktree-recovery.json')}))
if __name__=='__main__':main()
