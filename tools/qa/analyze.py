"""Evidence analysis, not a replacement for inspecting screenshots or play traces."""
import argparse,json
from pathlib import Path
parser=argparse.ArgumentParser();parser.add_argument('evidence',type=Path);args=parser.parse_args();d=json.loads(args.evidence.read_text());s=d['samples'];stale=[];cycles={};previous={};stalls={};maxstalls={}
for sample in s:
 units={u['id']:u for u in sample['units']}
 for u in sample['units']:
  old=previous.get(u['id']);target=units.get(u.get('target'))
  if u['alive'] and u['team']=='player' and u['state']=='attack' and target and not target['alive']:stale.append({'time':sample['time'],'id':u['id'],'target':target['id']})
  if old and old['state']=='return' and old['carry']>0 and u['carry']==0:
   key=old['carryType'];cycles[key]=cycles.get(key,0)+1
  if old and u['alive'] and u['state']=='gather' and u['carry']==0 and old['carry']==0 and u['gatherTarget']==old['gatherTarget'] and abs(u['x']-old['x'])+abs(u['y']-old['y'])<.01:
   start=stalls.setdefault(u['id'],sample['time']);maxstalls[u['id']]=max(maxstalls.get(u['id'],0),sample['time']-start)
  else:stalls.pop(u['id'],None)
  previous[u['id']]=u
cavalry=[(x['time'],u) for x in s for u in x['units'] if u['type']=='light_cavalry' and u['team']=='player']
r={'stage':d['stage'],'result':d.get('result'),'samples':len(s),'seed':s[0]['seed'] if s else None,'simulation_seconds':s[-1]['time'] if s else 0,'stale_dead_target_samples':len(stale),'first_stale':stale[:3],'deposit_cycles':cycles,'gather_stalls_over_20s':{k:v for k,v in maxstalls.items() if v>=20},'cavalry_completed_move':any(1<t<35 and u['state']=='idle' for t,u in cavalry),'page_errors':d['page_errors'],'failed_resources':d['failed'],'build':d.get('build'),'build_manifest':d.get('build_manifest')}
events=[]
for before,after in zip(s,s[1:]):
 current={u['id']:u for u in after['units']}
 for u in before['units']:
  now=current.get(u['id']);dead=current.get(u.get('target'))
  if not now or u['team']!='player' or not now['alive'] or not dead or dead['alive']:continue
  replacement=current.get(now.get('target'))
  if replacement and replacement['alive'] and replacement['id']!=dead['id']:
   events.append({'before_time':before['time'],'after_time':after['time'],'unit_id':u['id'],'dead_target':dead['id'],'new_target':replacement['id']})
r['confirmed_retargets']=events
r['checks']={'no_dead_target_samples':len(stale)==0,'no_zero_cargo_stall_over_20s':not r['gather_stalls_over_20s'],'cavalry_move_completes':r['cavalry_completed_move'],'four_resource_deposits_at_least_three':all(cycles.get(k,0)>=3 for k in ['food','wood','gold','stone']),'observed_death_to_living_retarget':bool(events),'no_page_errors':not d['page_errors'],'no_failed_requests':not d['failed'],'no_console_errors':not any(m['type']=='error' for m in d['console'])}
r['scenario_pass']=all(r['checks'].values())
args.evidence.with_name('summary.json').write_text(json.dumps(r,ensure_ascii=False,indent=2));print(json.dumps({k:v for k,v in r.items() if k not in ['build_manifest','failed_resources']},ensure_ascii=False,indent=2))
