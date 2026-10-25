"""Conservative Level1/2 research prototype. No network, calibration or hardware PASS claims."""
import argparse,json,math
from pathlib import Path
def insufficient(reason):return {'status':'INSUFFICIENT_DATA','reason':reason,'fps':None,'hardware_verified':False}
def positive(x):return isinstance(x,(int,float)) and not isinstance(x,bool) and math.isfinite(x) and x>0
def predict(d):
 if d.get('level')==1:
  a,b=d.get('reference',{}),d.get('target',{});keys=['suite','version','browser','workload','unit','backend','direction']
  if any(not a.get(k) or a.get(k)!=b.get(k) for k in keys):return insufficient('Benchmark suite/version/browser/workload/unit/backend/direction must match')
  if any(not x.get('hardware') or not x.get('source') or not x.get('date') or not positive(x.get('score')) for x in [a,b]):return insufficient('Both exact hardware models,score,source,date required')
  if a['direction'] not in ['higher','lower']:return insufficient('Unknown score direction')
  ratio=b['score']/a['score'] if a['direction']=='higher' else a['score']/b['score']
  return {'status':'BENCHMARK_REFERENCE','relative_capacity':ratio,'fps':None,'hardware_verified':False,'confidence':'low; benchmark-relative capacity only, not a game-FPS multiplier','reference':a,'target':b}
 if d.get('level')==2:
  p=d.get('profile',{});scales=d.get('scale_intervals',{})
  if not d.get('source_backend') or d.get('source_backend')!=d.get('target_backend'):return insufficient('Uncalibrated software/physical or backend transfer refused')
  if not p.get('exclusive_cpu') or not p.get('render_critical_path_validated'):return insufficient('Exclusive CPU and measured render critical path required; nested spans must not be summed')
  if not d.get('scale_evidence') or not d.get('target_hardware'):return insufficient('Workload-matched scale provenance and target hardware required')
  if not all(positive(p.get(k)) for k in ['cpu_critical_ms','render_critical_ms']) or not positive(d.get('refresh_hz')):return insufficient('Missing positive critical-path measurements/refresh rate')
  scheduler=p.get('scheduler_unoverlapped_ms')
  if not isinstance(scheduler,(int,float)) or not math.isfinite(scheduler) or scheduler<0:return insufficient('Measured non-overlapping scheduler cost required')
  for k in ['cpu','render']:
   s=scales.get(k)
   if not isinstance(s,list) or len(s)!=2 or not all(positive(v) for v in s) or s[0]>s[1]:return insufficient('Positive ordered CPU/render scale intervals required')
  def frame(i):return max(p['cpu_critical_ms']/scales['cpu'][i],p['render_critical_ms']/scales['render'][i],1000/d['refresh_hz'])+scheduler
  slow,fast=frame(0),frame(1)
  return {'status':'UNCALIBRATED_ESTIMATE','target_hardware':d['target_hardware'],'frame_ms_assumption_envelope':[fast,slow],'fps_assumption_envelope':[1000/slow,1000/fast],'interval_type':'deterministic assumption envelope, not statistical confidence interval','hardware_verified':False,'calibrated':False,'model':'max(exclusive CPU,render critical path,VSync)+measured non-overlapped scheduling; overlapping paths are not added','limitations':'GC/input/thermal/background changes outside profile not predicted; cannot replace physical acceptance','assumptions':d}
 return insufficient('Only research Level1/2 available; Level3 requires real calibration and held-out errors')
def main():
 p=argparse.ArgumentParser();p.add_argument('--input',type=Path,required=True);p.add_argument('--out',type=Path,required=True);a=p.parse_args();r=predict(json.loads(a.input.read_text()));a.out.write_text(json.dumps(r,indent=2)+'\n');print(r['status'])
if __name__=='__main__':main()
