from pathlib import Path
import json,sys,collections,math
root=Path(sys.argv[1]);initial=json.loads((root/'chromium/REPORT.json').read_text());supp=json.loads((root/'chromium-supplement/REPORT.json').read_text());before,after=initial['rows'][:2];auto,manual=supp['rows'];assert initial['pass'] and supp['pass']
assert before['initial']==after['initial']==auto['initial']==manual['initial']
assert len({r['mapSHA256'] for r in [before,after,auto,manual]})==1
for key in ['time','heroHp','coreHp','units','rng','coreDamage','attacks']:assert before['result'][key]==after['result'][key]==auto['result'][key],key
assert all(r['illegalAttackCount']==0 for r in [before,after,auto,manual])
p=manual['result']['priority'];assert p['checks']>0 and p['end']['reason']=='target-dead' and not manual['result']['manualViolation']
by_source={}
for r in [auto,manual]:
 sums=collections.defaultdict(float)
 for event in r['result']['coreDamageEvents']:sums[event['source']]+=event['loss']
 by_source[r['label']]=dict(sums)
delta=auto['result']['coreDamage']-manual['result']['coreDamage'];assert math.isclose(delta,manual['result']['coreHp']-auto['result']['coreHp'],abs_tol=1e-8)
result={'status':'PASS_SCOPED_SAVE_CONTINUATION','runtime_changed':False,'scope':'同一自然場次完整快照，原生直控輸入後20秒固定步長續玩；不是新自然開局或真人評價','save_sha256':initial['saveSHA256'],'auto_before_after_recorded_state_identical':True,'manual_priority_checked_ticks':p['checks'],'manual_priority_end':p['end'],'local_core_damage_reduction':delta,'source_damage':by_source,'rows':[{'case':r['label'],'source':r['source'],'hero_attacks':len(r['result']['attacks']),'effective_hero_damage':r['effectiveHeroDamage'],'core_damage':r['result']['coreDamage'],'core_hp':r['result']['coreHp'],'hero_hp':r['result']['heroHp'],'phase':r['result']['phase'],'time':r['result']['time']} for r in [auto,manual]],'limitations':['此自然快照沒有觸發舊射程缺陷，不能用前後相同宣稱改版收益','未記錄所有目標死亡的最後傷害來源，未宣稱英雄單殺指定敵人','20秒局部因果對照不代表整場勝率或真人留存']}
print(json.dumps(result,ensure_ascii=False,indent=2))
