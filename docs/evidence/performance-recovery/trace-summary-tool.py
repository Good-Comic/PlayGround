from pathlib import Path
import json,collections
root=Path('/workspace/diagnostics/riftwatch/perf-recovery')
results=[]
for suite in ['baseline-diagnostic-advance','candidate-profile','final-profile','vector-ablation-profile']:
 for folder in (root/suite).glob('r*'):
  if not folder.is_dir():continue
  trace=json.loads((folder/'timeline.json').read_text())['traceEvents'];marks={e['name']:e['ts'] for e in trace if e.get('name') in ['AUDIT_MEASURE_START','AUDIT_MEASURE_END']};threads={e['tid']:e['args']['name'] for e in trace if e.get('name')=='thread_name'};totals=collections.defaultdict(lambda:{'count':0,'duration_sum_ms':0});lo=marks.get('AUDIT_MEASURE_START',0);hi=marks.get('AUDIT_MEASURE_END',float('inf'))
  names=['RasterTask','DrawFrame','Paint','CompositeLayers','UpdateLayerTree','Layout','UpdateLayoutTree','MajorGC','MinorGC']
  for e in trace:
   if e.get('name') not in names or e.get('ph')!='X' or 'dur' not in e or not lo<=e['ts']<=hi:continue
   k=e['name']+' @ '+threads.get(e['tid'],str(e['tid']));totals[k]['count']+=1;totals[k]['duration_sum_ms']+=e['dur']/1000
  row={'suite':suite,'case':folder.name,'scope':'measurement' if len(marks)==2 else 'whole trace','note':'Summed event durations on potentially concurrent threads; not GPU time or exclusive end-to-end time. CPU profile includes warmup.','threads':totals};(folder/'trace-summary.json').write_text(json.dumps(row,indent=2));results.append(row)
(root/'trace-summaries.json').write_text(json.dumps(results,indent=2));print(json.dumps(results[-3:],indent=2))
