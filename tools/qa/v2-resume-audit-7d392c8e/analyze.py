"""封存後唯讀分析：單位狀態與來源事件分列；不推斷未觀測因果。"""
import json,pathlib,sys,statistics,hashlib
lab=pathlib.Path(sys.argv[1]);out=pathlib.Path(sys.argv[2]);out.mkdir(parents=True,exist_ok=True)
def rows(p):return [json.loads(x) for x in p.read_text().splitlines()] if p.exists() else []
report={'scope':'正式封存後私有觀測交叉核對，玩家未獲私有狀態','causalLimit':'觀測到命令與後續傷害的時間／單位關聯不等同反事實城心減傷；無配對控制不得宣稱因果改善','players':{}}
for role in (sys.argv[3] if len(sys.argv)>3 else 'ABC'):
 p=lab/'private-observer'/role/'after';public=lab/'players'/role/'after';result=json.loads((p/'result.json').read_text());actions=rows(p/'action-observer.jsonl');commands=rows(p/'command-events.jsonl');damage=rows(p/'damage-events.jsonl');samples=rows(p/'samples.jsonl');events=[];coreId=next((s['core']['id'] for s in samples if s.get('core')),None)
 for a in actions:
  before={u['id']:u for u in a['before']['units']};after={u['id']:u for u in a['after']['units']};changes=[]
  for uid,u in after.items():
   b=before.get(uid,{});keys=['target','manualAttack','order','orderFailure','state'];diff={k:{'before':b.get(k),'after':u.get(k)} for k in keys if b.get(k)!=u.get(k)}
   if diff:changes.append({'unitId':uid,'changes':diff})
  ce=[c for c in commands if c.get('actionId')==a.get('actionId')];synchronousChanges=[]
  for c in ce:
   cb={u['id']:u for u in (c.get('before') or {}).get('units',[])}
   for u in (c.get('after') or {}).get('units',[]):
    b=cb.get(u['id'],{});diff={k:{'before':b.get(k),'after':u.get(k)} for k in ['targetId','manualAttack','order','targetPos','state'] if b.get(k)!=u.get(k)}
    if diff:synchronousChanges.append({'unitId':u['id'],'nativeMethod':c['name'],'changes':diff})
  ids={u['unitId'] for u in synchronousChanges};sim=a['after'].get('sim',0);observed=[d for d in damage if d.get('sourceId') in ids and sim<=d.get('sim',0)<=sim+15]
  explicitTargets={}
  for c in ce:
   if c.get('name')!='issueCommand':continue
   selected=set((c.get('before') or {}).get('selection',[]))
   for u in (c.get('after') or {}).get('units',[]):
    if u['id'] in selected and u.get('manualAttack') and u.get('targetId') is not None:explicitTargets[u['id']]=u['targetId']
  exact=[d for d in observed if explicitTargets.get(d.get('sourceId'))==d.get('targetId') and d.get('sourceTargetId')==d.get('targetId') and d.get('manualAttack') and d.get('targetTeam')=='enemy' and (d.get('afterHp',0)<d.get('beforeHp',0))]
  directKills=[d for d in exact if d.get('afterAlive') is False]

  events.append({'actionId':a.get('actionId'),'intent':a.get('intent'),'INTENT':'RECORDED_BEFORE_INPUT' if a.get('intent',{}).get('intent') else 'NOT_EXPLICIT','COMMAND_SENT':a['ok'],'COMMAND_ACCEPTED':{'status':'SYNCHRONOUS_NATIVE_RETURN_OR_STATE_EVIDENCE' if synchronousChanges or any(c.get('result') is True for c in ce) else 'UNKNOWN','units':synchronousChanges,'duringInputIntervalUnattributedChanges':changes,'nativeReturns':[{'name':c['name'],'result':c.get('result'),'undefined':not 'result' in c} for c in ce]},'EXECUTED':'見後續samples的位置／target與射程；不得由SENT推斷','EFFECT_OBSERVED':{'sameChangedUnitDamageWithin15SimSeconds':observed,'explicitNativeAttackTargets':explicitTargets,'explicitTargetMatchingManualDamageAtImpact':exact,'explicitTargetMatchingManualKills':directKills,'matchingRule':'sourceId由該次原生issueCommand選取且after為manualAttack，指定targetId須與damage.targetId及sourceTargetId相同；不是15秒內任意傷害。護衛/巡邏自動傷害不列直接集火成功。','causality':'TEMPORAL_ASSOCIATION_ONLY','coreMitigation':'UNKNOWN_WITHOUT_COUNTERFACTUAL'}})
 frame=json.loads((p/'frames.json').read_text());f=sorted(frame);percent=lambda q:f[min(len(f)-1,int(len(f)*q))] if f else None
 native=[]
 for q in p.glob('native-save-*.json'):native.append({'file':q.name,'sha256':hashlib.sha256(q.read_bytes()).hexdigest()})
 report['players'][role]={'source':result['source'],'phase':result['state'].get('phase'),'wave':result['state'].get('wave'),'sim':result['state'].get('sim'),'stopReason':result['stopReason'],'errors':result['errors'],'safety':rows(p/'safety.jsonl'),'actions':len(actions),'nativeCommands':len(commands),'damageEvents':len(damage),'observerErrors':rows(p/'observer-errors.jsonl'),'coreDamageEvents':[d for d in damage if d.get('targetId')==((result['state'].get('core') or {}).get('id') or next((d.get('targetId') for d in damage if d.get('targetType')=='core'),None))],'actualSeeds':sorted(set(s.get('seed') for s in samples if s.get('seed') is not None and not s.get('inMenu'))),'frameCadenceIncludingMenuAndPause':{'samples':len(f),'p50Ms':percent(.5),'p95Ms':percent(.95),'fps':1000/statistics.mean(frame) if frame else None,'limitation':'自然遊戲全窗，含暫停與選牌，不作100/200校準性能比較'},'nativeSaves':native,'chain':events}
(out/'OBSERVER-CROSSCHECK.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({r:{k:v for k,v in x.items() if k in ['phase','wave','sim','actions','nativeCommands','damageEvents','actualSeeds','stopReason']} for r,x in report['players'].items()},ensure_ascii=False))
