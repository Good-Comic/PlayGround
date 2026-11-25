import json,statistics,sys
from pathlib import Path
p=Path(sys.argv[1]);r=json.loads(p.read_text())
assert len(r['rows'])==8 and not r['errors'], '未完成8組或有頁面錯誤'
assert all(x['scene'] and x['holdFixture'] and x['rng'] and x['visualRng'] for x in r['pairs']), '初始配對不一致'
assert all(x['command']['accepted'] and x['command']['selected'] for x in r['rows']), '原生命令未接受'
rows=[]
for n in [100,200]:
 for mode in ['before','after']:
  v=[x for x in r['rows'] if x['n']==n and x['mode']==mode]
  assert len(v)==2 and all(not x['truncated'] for x in v)
  rows.append({'n':n,'mode':mode,'frameP50MedianMs':statistics.median(x['p50Ms'] for x in v),'frameP95MedianMs':statistics.median(x['p95Ms'] for x in v),'fpsMedian':statistics.median(x['fps'] for x in v),'aliveStart':[x['aliveStart'] for x in v],'aliveEnd':[x['aliveEnd'] for x in v],'simSeconds':[x['simEnd']-x['simStart'] for x in v],'heapStartMB':[x['heapStart']/1e6 for x in v],'heapEndMB':[x['heapEnd']/1e6 for x in v],'visionCache':[x['visionCache'] for x in v],'subsystemMsPerFrame':{k:statistics.median(x['subsystems'][k]['totalMs']/x['samples'] for x in v) for k in ['renderInclusive','fog','pathAndMovementInclusive','staticCollision','dynamicCollision','target','DOM','nativeAstarPerUpdate']}})
out={'status':'MEASURED_SHORT_ABBA_NOT_HARDWARE_ACCEPTANCE','rows':rows,'gpu':r['gpu'],'cpuQuota':r['cpuQuota'],'limitations':['方法時間重疊，不可加總','兩次各10秒量測不足以認定顯著效能變化或洩漏','修復會改變實際命中與後續戰況，初始一致不代表後續相同工作量','非自然戰役、非Windows實體GPU']}
p.with_name('summary.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(out,ensure_ascii=False,indent=2))
