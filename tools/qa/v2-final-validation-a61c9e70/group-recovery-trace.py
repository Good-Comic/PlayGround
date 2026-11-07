"""封存後唯讀：群組重選到原生命令，逐ID距離，不把座標變化當抵達。"""
import json,pathlib,math,sys
root=pathlib.Path(sys.argv[1]);out=pathlib.Path(sys.argv[2]);p=root/'private-observer/C/after'
def rows(name):return [json.loads(x) for x in (p/name).read_text().splitlines()]
actions=rows('action-observer.jsonl');commands=rows('command-events.jsonl');samples=rows('samples.jsonl')
selected=next(x for x in actions if x['actionId']=='C-36');move=next(x for x in commands if x.get('actionId')=='C-37' and x['name']=='commandMove');next_action=next(x for x in actions if x['actionId']=='C-38')
start=move['after']['sim'];end=next_action['before']['sim'];ids=move['before']['selection'];before={u['id']:u for u in move['before']['units']};after={u['id']:u for u in move['after']['units']};seq=[x for x in samples if start<x.get('sim',0)<=end]
distance=lambda u,g:math.hypot(u['x']-g['x'],u['y']-g['y'])
result=[]
for uid in ids:
 goal=after[uid]['targetPos'];initial=before[uid];trace=[]
 for s in seq:
  u=next((u for u in s['units'] if u['id']==uid),None)
  if u:trace.append({'sim':s['sim'],'x':u['x'],'y':u['y'],'alive':u['alive'],'state':u['state'],'targetId':u.get('target'),'orderFailure':u.get('orderFailure'),'distanceToAssigned':distance(u,goal)})
 d0=distance(initial,goal)
 result.append({'id':uid,'initial':{'x':initial['x'],'y':initial['y']},'assigned':goal,'nativeAccepted':after[uid]['state']=='move' and goal is not None,'initialDistance':d0,'sampledMinimumDistance':min([d0]+[x['distanceToAssigned'] for x in trace]),'lastObservedDistance':trace[-1]['distanceToAssigned'] if trace else None,'closestSample':min(trace,key=lambda x:x['distanceToAssigned']) if trace else None,'trace':trace,'terminalArrival':'NOT_DIRECTLY_OBSERVED_NO_TARGETPOS_CLEAR_TELEMETRY'})
old={u['id']:u for u in selected['before']['units']};r={'scope':'自然C封存後私有唯讀交叉核對，沒有提供玩家私有資料','newComponentAction':{'actionId':'C-36','intent':selected['intent'],'beforeSelection':selected['before']['selection'],'afterSelection':selected['after']['selection'],'selectedPriorCauses':{str(uid):old[uid].get('orderFailure') for uid in selected['after']['selection']},'nativeCommandsDuringSelection':[x['name'] for x in commands if x.get('actionId')=='C-36']},'followingPlayerCommand':{'actionId':'C-37','intent':next(x for x in actions if x['actionId']=='C-37')['intent'],'nativeMethod':move['name'],'return':'undefined不代表成功；下列逐單位state/targetPos證明接受','startSim':start,'censorBeforeNextPlayerAction':'C-38','censorSim':end,'units':result},'interpretation':'10人接令，逐ID列距離以區分靠近與偏離；本場10人都曾在採樣點進入各自assigned落點0.08內，之後部分再壅塞/自主接敵，不能把最後位置當從未靠近或把近接當全程持續疏通。採樣5秒，沒有targetPos清除逐幀紀錄，不冒稱全員終端抵達、成功疏通、衝車擊殺或城心反事實減傷。','coreMitigation':'UNKNOWN','testScenario':'NATURAL_PLAY_NO_STATE_INJECTION'}
out.write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'units':len(result),'allNativeAccepted':all(x['nativeAccepted'] for x in result),'minDistances':[round(x['sampledMinimumDistance'],4) for x in result]},ensure_ascii=False))
