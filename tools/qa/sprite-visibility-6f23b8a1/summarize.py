import json,statistics,sys
from pathlib import Path
root=Path(sys.argv[1]);first=json.loads((root/'browser/REPORT.json').read_text());correct=json.loads((root/'retest-200-map/REPORT.json').read_text())
assert len(first['pixels'])==48 and all(x['diff']==0 and x['unchanged'] for x in first['pixels'])
assert correct['pass'] and len(correct['perf'])==8 and not correct['errors'] and not first['errors']
valid=[x for x in first['perf'] if x['n']==100]+correct['perf'];assert len(valid)==16 and all(x['alive']==x['n'] for x in valid)
rows=[]
for n in [100,200]:
 for scene in ['offscreen','hidden']:
  for mode in ['before','after']:
   v=[x for x in valid if (x['n'],x['scene'],x['mode'])==(n,scene,mode)];assert len(v)==2
   rows.append(dict(n=n,scene=scene,mode=mode,**{k:statistics.median(x[k] for x in v) for k in ['frameP50','frameP95','fps','renderMean','renderP50','renderP95']},queries=[x['queryCounts'] for x in v],heapMB=[[x['heapStart']/1e6,x['heapEnd']/1e6] for x in v]))
result={'scope':'靜止受控兩種場景短ABBA，不是自然戰役、全動態性能或Windows硬體驗收','rows':rows,'historical_invalid_200':{'requested':200,'actual':186,'classification':'INVALID_FIXTURE_NOT_200_UNIT_EVIDENCE','original_harness_reported_pass':first.get('pass')},'pixel_cases':48,'valid_runs':16}
(root/'summary.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');print(json.dumps(result,ensure_ascii=False,indent=2))
