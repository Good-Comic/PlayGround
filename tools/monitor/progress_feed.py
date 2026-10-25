#!/usr/bin/env python3
"""GitHub snapshots, not a live Cloud stream. Default is local; explicit publish uses a dedicated owned ref."""
import argparse,hashlib,json,os,re,subprocess,sys,tempfile
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'dev'))
from worktree_recovery import git,utc,atomic_json
from agent_handoff import remote_ownership
REF='refs/heads/codex/riftwatch-progress-feed'
LEVELS={'INFO','PROGRESS','WARNING','BLOCKED','ACTION_REQUIRED'}
SECRET=re.compile(r'(?i)(bearer\s+\S+|(?:api[_ -]?key|password|cookie|authorization|access[_ -]?token)\s*[:=]\s*\S+|github_pat_[a-z0-9_]+|gh[pousr]_[a-z0-9]{20,}|sk-[a-z0-9_-]{16,}|-----BEGIN .*PRIVATE KEY-----|[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})')
def text(value,limit=6000):
 if not isinstance(value,str) or len(value)>limit or SECRET.search(value):raise ValueError('Sensitive/invalid text rejected; do not put raw logs or credentials in progress')
 return value
def sha(value):
 if not isinstance(value,str) or not re.fullmatch('[a-f0-9]{40}',value):raise ValueError('Full commit SHA required')
 return value
def evidence(path):
 if not isinstance(path,str) or not re.fullmatch(r'docs/[a-zA-Z0-9_./-]+',path) or '..' in path:raise ValueError('Use repository-relative docs evidence, never URLs/credentials/local personal paths')
 return path
def normalize(data):
 if data.get('severity') not in LEVELS:raise ValueError('Invalid severity')
 branch=text(data.get('branch',''),140)
 if not re.fullmatch('codex/riftwatch-[a-zA-Z0-9_./-]+',branch) or '..' in branch:raise ValueError('Out-of-scope branch')
 out={'task_id':text(data.get('task_id',''),100),'agent':text(data.get('agent',''),80),'severity':data['severity'],'branch':branch,'commit':sha(data.get('commit')),'build_sha':sha(data['build_sha']) if data.get('build_sha') else None,'summary':text(data.get('summary','')),'code_changes':[text(x,1000) for x in data.get('code_changes',[])[:40]],'next_steps':[text(x,1000) for x in data.get('next_steps',[])[:20]],'requires_user_decision':bool(data.get('requires_user_decision')),'tests':[],'blockers':[],'response':text(data.get('response',''),16000)}
 for row in data.get('tests',[])[:80]:
  if row.get('status') not in ['PASS','FAIL','BLOCKED','NOT_TESTED']:raise ValueError('Invalid test status')
  out['tests'].append({'name':text(row['name'],200),'status':row['status'],'source_commit':sha(row['source_commit']),'evidence':evidence(row['evidence']),'evidence_commit':sha(row.get('evidence_commit',out['commit']))})
 for row in data.get('blockers',[])[:40]:out['blockers'].append({'id':text(row['id'],100),'severity':row['severity'] if row.get('severity') in LEVELS else 'BLOCKED','summary':text(row['summary'],1000),'source_commit':sha(row.get('source_commit',out['commit'])),'requires_user_decision':bool(row.get('requires_user_decision'))})
 out['event_id']=hashlib.sha256(json.dumps(out,sort_keys=True,ensure_ascii=True).encode()).hexdigest();return out
def resolve_source(repo,event):
 rows=git(repo,'ls-remote','origin','refs/heads/'+event['branch']).splitlines();head=rows[0].split()[0] if rows else None;event['remote_head']=head;event['pushed']=head==event['commit'];event['remote_query']='VERIFIED'
 if head and not event['pushed']:
  try:event['pushed']=subprocess.run(['git','-C',str(repo),'merge-base','--is-ancestor',event['commit'],head],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL).returncode==0
  except OSError:pass
 for row in event['tests']:
  try:row['evidence_blob']=git(repo,'rev-parse',row['evidence_commit']+':'+row['evidence']);row['evidence_status']='GIT_BLOB_VERIFIED'
  except subprocess.SubprocessError:row['evidence_status']='NOT_FOUND_NOT_VERIFIED'
 return event
def render(event,previous=None):
 previous=previous or [];events=list(previous)
 if any(r['event_id']==event['event_id'] for r in events):return None
 event=dict(event,recorded_at=utc(),confidence='AGENT_REPORTED_TEST_RESULTS_WITH_GIT_PROVENANCE');events.append(event)
 tasks={r['task_id']:r for r in events[-200:] if r.get('task_id')};blockers=[dict(b,task_id=r['task_id']) for r in tasks.values() for b in r.get('blockers',[])]
 status={'schema_version':1,'capability':'GITHUB_PROGRESS_SYNC_READY','channel':'GitHub atomic snapshots; LIVE_CODEX_STREAM_VERIFIED is NOT claimed','updated_at':event['recorded_at'],'latest_event':event,'workstreams':tasks,'notification_policy':'Only material WARNING/BLOCKED/ACTION_REQUIRED; no external messages are automatically sent','supervisor_topics':['commits','QA','gameplay','performance','simulation_time','GDD','merge_conflicts','interruptions','ownership','candidate_deployment']}
 return {'docs/monitor/PROJECT-STATUS.json':json.dumps(status,indent=2)+'\n','docs/monitor/RECENT-EVENTS.jsonl':''.join(json.dumps(r,sort_keys=True)+'\n' for r in events[-200:]),'docs/monitor/BLOCKERS.json':json.dumps({'updated_at':event['recorded_at'],'blockers':blockers},indent=2)+'\n','docs/monitor/LATEST-RESPONSE.md':event['response'] or event['summary']+'\n'}
def main():
 p=argparse.ArgumentParser();p.add_argument('--repo',type=Path,default=Path(__file__).resolve().parents[2]);p.add_argument('--input',type=Path,required=True);p.add_argument('--out',type=Path,required=True);p.add_argument('--publish',action='store_true');p.add_argument('--agent');p.add_argument('--execution');a=p.parse_args();repo=a.repo.resolve();out=a.out.resolve()
 if out.is_relative_to(repo):raise SystemExit('Generate outside source tree to avoid recursive commits')
 event=resolve_source(repo,normalize(json.loads(a.input.read_text())));rows=git(repo,'ls-remote','origin',REF).splitlines();parent=rows[0].split()[0] if rows else None;previous=[]
 if parent:
  try:raw=git(repo,'show',parent+':docs/monitor/RECENT-EVENTS.jsonl')
  except subprocess.SubprocessError:
   if not a.publish:raise SystemExit('Remote feed object unavailable; fetch explicitly or use --publish')
   git(repo,'fetch','--no-tags','origin',REF);raw=git(repo,'show',parent+':docs/monitor/RECENT-EVENTS.jsonl')
  previous=[json.loads(x) for x in raw.splitlines() if x]
 files=render(event,previous)
 if files is None:print(json.dumps({'status':'NO_CHANGE_NO_COMMIT','commit':parent,'event_id':event['event_id']}));return
 out.mkdir(parents=True,exist_ok=True)
 for name,value in files.items():f=out/name;f.parent.mkdir(parents=True,exist_ok=True);f.write_text(value)
 if not a.publish:print(json.dumps({'status':'LOCAL_SNAPSHOT_ONLY','event_id':event['event_id']}));return
 _,state=remote_ownership(repo);owners=[r for r in state['tasks'].values() if r['branch']==REF.removeprefix('refs/heads/') and r['status']=='OWNED']
 if len(owners)!=1 or (owners[0]['agent'],owners[0]['execution'])!=(a.agent,a.execution):raise SystemExit('Confirmed progress-feed ownership required')
 with tempfile.TemporaryDirectory(prefix='riftwatch-monitor-') as folder:
  env=dict(os.environ,GIT_INDEX_FILE=str(Path(folder)/'index'))
  def run(*args,input=None):return subprocess.check_output(['git','-C',str(repo),*args],env=env,input=input,stderr=subprocess.DEVNULL).decode().strip()
  run('read-tree','--empty')
  for name,value in files.items():blob=run('hash-object','-w','--stdin',input=value.encode());run('update-index','--add','--cacheinfo',f'100644,{blob},{name}')
  tree=run('write-tree');commit=run('commit-tree',tree,*(['-p',parent] if parent else []),input=f'monitor: {event["task_id"]} {event["event_id"]}\n'.encode());run('push','origin',commit+':'+REF)
  if git(repo,'ls-remote','origin',REF).split()[0]!=commit:raise SystemExit('REMOTE_HEAD_CHANGED; do not overwrite')
 receipt={'status':'REMOTE_SAVED','commit':commit,'event_id':event['event_id'],'source_commit':event['commit'],'stream':'SNAPSHOT_ONLY'};atomic_json(out/'publication-receipt.json',receipt);print(json.dumps(receipt))
if __name__=='__main__':main()
