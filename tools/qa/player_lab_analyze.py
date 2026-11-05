"""旁觀資料彙整。不得把本檔或輸出交給仍在遊玩的玩家。"""
import pathlib,json,math,collections,hashlib,sys
ROOT=pathlib.Path(sys.argv[1]).resolve()
def readlines(p):return [json.loads(x) for x in p.read_text().splitlines()] if p.exists() else []
def pct(a,p):
 if not a:return None
 a=sorted(a);return a[min(len(a)-1,math.ceil(p*len(a))-1)]
def metrics(role,round):
 d=ROOT/'private-observer'/role/round
 if not (d/'result.json').exists():return None
 result=json.loads((d/'result.json').read_text());samples=[s for s in readlines(d/'samples.jsonl') if not s.get('inMenu',True)]
 if not samples:return {'role':role,'round':round,'status':'INCONCLUSIVE_NO_GAME_STARTED'}
 end=result['state']; actions=readlines(ROOT/'players'/role/round/'actions.jsonl'); observations=readlines(d/'action-observer.jsonl')
 positive={r:0 for r in ['food','wood','gold','stone']}; workerTime=armyTime=workingTime=attackingTime=idleArmyTime=0.;split=collections.defaultdict(float);paused=activeWall=0.;phaseWall=collections.defaultdict(float);losses=set();everAlive=set();finalAlive=set()
 for a,b in zip(samples,samples[1:]):
  dt=max(0,b['sim']-a['sim']);dw=max(0,b['wallSeconds']-a['wallSeconds']);phaseWall[a['phase']]+=dw
  if a['paused']:paused+=dw
  elif a['phase'] in ('prep','wave'):activeWall+=dw
  workers=[u for u in a['units'] if u['alive'] and u['team']=='player' and u['type']=='villager'];army=[u for u in a['units'] if u['alive'] and u['team']=='player' and u['type'] not in ('villager','commander')]
  workerTime+=len(workers)*dt;workingTime+=sum(u['state'] in ('gather','return','build') for u in workers)*dt
  armyTime+=len(army)*dt;attackingTime+=sum(u['state']=='attack' for u in army)*dt;idleArmyTime+=sum(u['state']=='idle' and not u.get('order') for u in army)*dt
  for u in workers:split[u.get('gather') or ('building' if u['state']=='build' else u.get('carryType') or 'unassigned')]+=dt
  for r in positive:positive[r]+=max(0,b['resources'][r]-a['resources'][r])
 for s in samples:
  everAlive.update(u['id'] for u in s['units'] if u['alive'] and u['team']=='player')
 finalAlive={u['id'] for u in end['units'] if u['alive'] and u['team']=='player'}
 live=[u for u in end['units'] if u['alive'] and u['team']=='player']; losses=everAlive-finalAlive
 changedOrders=0;skillUse=collections.Counter();bonuses=[]
 for row in observations:
  a=row.get('before') or {};b=row.get('after') or {};am={u['id']:u for u in a.get('units',[])};bm={u['id']:u for u in b.get('units',[])}
  if any((u.get('order'),u.get('target'),u.get('manualAttack'))!=(am[i].get('order'),am[i].get('target'),am[i].get('manualAttack')) for i,u in bm.items() if i in am and u.get('team')=='player'):changedOrders+=1
  for k in ('mark','aegis'):
   if (b.get('hero') or {}).get(k,0)>(a.get('hero') or {}).get(k,0)+1:skillUse[k]+=1
  if a.get('boons')!=b.get('boons'):bonuses.append({'wallSeconds':row['wallSeconds'],'before':a.get('boons'),'after':b.get('boons')})
 frames=json.loads((d/'frames.json').read_text());memory=[s['memory']['used'] for s in samples if s.get('memory')]
 terminal='PASS_NATURAL_VICTORY' if end['phase']=='victory' else 'NATURAL_DEFEAT' if end['phase']=='defeat' else 'INCONCLUSIVE'
 out={'role':role,'round':round,'source':result['source'],'mode':result['validity'],'result':terminal,'wave_reached':end['wave'],'waves_cleared':end['stats']['waves'],'sim_seconds':end['sim'],'game_wall_seconds':result['gameWallSeconds'],'simulation_to_wall_ratio':end['sim']/result['gameWallSeconds'] if result['gameWallSeconds'] else None,'sampled_paused_wall_seconds':paused,'phase_wall_seconds_approx':dict(phaseWall),'core':end['core'],'final_resources':end['resources'],'gathered_total_native_stat':end['stats']['gathered'],'per_resource_sampled_positive_delta_LOWER_BOUND':positive,'income_measurement_limit':'每5秒抽樣的正庫存變化下界；同期支出會遮蔽收入，不能當成完整四資源收入。原生 gathered 為全部實際交付總量。','final_soldiers':sum(u['type'] not in ('villager','commander') for u in live),'final_workers':sum(u['type']=='villager' for u in live),'units_ceased_alive_observed':len(losses),'ceased_alive_ids':sorted(losses),'loss_limit':'每5秒抽樣曾活著而最終不存活，包含期限到期；兩次樣本間出生又死亡可能漏計，不能全當戰鬥傷亡。','worker_productive_state_time_ratio':workingTime/workerTime if workerTime else None,'worker_assignment_person_seconds':dict(split),'army_attacking_state_time_ratio':attackingTime/armyTime if armyTime else None,'army_idle_without_order_time_ratio':idleArmyTime/armyTime if armyTime else None,'native_inputs_dispatched':sum(a['ok'] for a in actions),'native_input_failures':sum(not a['ok'] for a in actions),'observed_order_change_inputs':changedOrders,'observed_skill_activations':dict(skillUse),'boon_claim_observations':bonuses,'boons':end['boons'],'boon_combat_causal_contribution':'NOT_TESTED：套用效果可由獨立 snapshot 核對；本輪不以卡牌存在推論增加幾點傷害或通關貢獻。','tactical_input_counts':dict(collections.Counter(a['intent'].get('selector') or a['intent'].get('key') or a['intent']['op'] for a in actions)),'frame_observation':{'scope':'整個工作階段的 requestAnimationFrame，包含選單及暫停；不能當持續戰鬥負載或實體GPU結果','n':len(frames),'duration_seconds':sum(frames)/1000,'fps':1000*len(frames)/sum(frames) if sum(frames) else None,'p50_ms':pct(frames,.5),'p95_ms':pct(frames,.95),'max_ms':max(frames) if frames else None},'heap_used_bytes':{'peak':max(memory) if memory else None,'median':pct(memory,.5),'end':end.get('memory')},'page_errors':result['errors'],'core_failure_context_last_samples':[{'sim':s['sim'],'core':s['core'],'resources':s['resources'],'alive_workers':sum(u['alive'] and u['type']=='villager' and u['team']=='player' for u in s['units']),'soldier_states':dict(collections.Counter(u['state'] for u in s['units'] if u['alive'] and u['team']=='player' and u['type'] not in ('villager','commander'))),'order_failures':dict(collections.Counter(u['orderFailure'] for u in s['units'] if u['alive'] and u['team']=='player' and isinstance(u.get('orderFailure'),str)))} for s in ([x for x in samples if x.get('core') and x.get('phase')=='wave'][-8:]+[end])]}
 rejected=0
 for f in (ROOT/'players'/role/'inbox').glob('*.response.json'):
  if not (d/'result.json').stat().st_mtime-result['wallSeconds']-2 <= f.stat().st_mtime <= (d/'result.json').stat().st_mtime+2:continue
  response=json.loads(f.read_text())
  if response.get('ok') is False and response.get('reason')=='CONTROL_NOT_VISIBLE_OR_ENABLED':rejected+=1
 out['control_rejections_before_dispatch']=rejected
 out.update(active_unpaused_wall_seconds_APPROX=activeWall,sim_to_active_wall_ratio_APPROX=end['sim']/activeWall if activeWall else None,native_dispatched_APM_whole_session=sum(a['ok'] for a in actions)/(result['wallSeconds']/60) if result['wallSeconds'] else None)
 (d/'metrics.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');return out
if __name__=='__main__':
 results=[m for role in ('A','B','C') for round in ('before','after') if (m:=metrics(role,round))]
 (ROOT/'BEFORE-AFTER-RESULTS.json').write_text(json.dumps({'matching':'同初始條件，行動與RNG流程會不同；非嚴格因果A/B，也非真人娛樂感受','results':results},ensure_ascii=False,indent=2)+'\n')
 for m in results:print(json.dumps({k:m.get(k) for k in ['role','round','result','waves_cleared','sim_seconds','native_inputs_dispatched','native_input_failures']},ensure_ascii=False))
