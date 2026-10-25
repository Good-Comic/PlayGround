from pathlib import Path
import json,sys,statistics
sys.path.insert(0,'/workspace/riftwatch/tools/qa');from perf_stats import distribution
root=Path('/workspace/diagnostics/riftwatch/perf-recovery');cases=[]
for suite in ['baseline-repeat','baseline-extra-500','baseline-combat-advance','candidate-smoke','final-verified-repeat']:
 for path in sorted((root/suite).glob('*/result.json')):
  r=json.loads(path.read_text());name=path.parent.name
  if suite=='baseline-repeat' and r['mode']=='combat':continue
  d=r['distributions'];row={'suite':suite,'case':name,'mode':r['mode'],'units':r['fixture']['count'],'source_commit':r['manifest']['commit'],'game_files':r['manifest']['files'],'thresholds':r['checks'],'pass':r['pass'],'rAF_ms':d['frames'],'JS_work_ms':d['frameWork'],'update_ms':d['update'],'draw_ms':d['draw'],'UI_ms':d['ui'],'observer_ms':d['observer'],'moved_15s':r['moved_fraction_15s'],'first_move_s':distribution(r['first_move_latency_seconds']),'attacks':r['attacks'],'kills':r['kills'],'alive':d['alive'],'sim_seconds':r.get('measured_sim_seconds'),'navigation':r['navigation'],'console':r['logs'],'heap_before':r['cdp_before']['JSHeapUsedSize'],'heap_after':r['cdp_after']['JSHeapUsedSize']}
  cases.append(row)
out={'status':'PERF_IN_PROGRESS','metric_note':'rAF interval is original gate; JS work spans update+draw+UI; their difference is NOT GPU time. No pooling or rounding for gates.','cases':cases}
(root/'case-summary.json').write_text(json.dumps(out,ensure_ascii=False,indent=2))
for mode,count in [('move',25),('move',100),('move',250),('move',500),('move',1000),('combat',1000)]:
 print(mode,count)
 for suite in ['baseline','final']:
  rows=[r for r in cases if r['mode']==mode and r['units']==count and (r['suite'].startswith('baseline') if suite=='baseline' else r['suite']=='final-verified-repeat')];print(suite,[(r['case'],round(r['rAF_ms']['mean'],2),round(r['rAF_ms']['p95'],2),round(r['JS_work_ms']['mean'],2) if r['JS_work_ms']['mean'] is not None else None,r['moved_15s'],r['pass']) for r in rows])
