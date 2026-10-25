"""Collect real Windows acceptance; Linux smoke mode is explicitly never hardware certification."""
import argparse,datetime,json,platform,subprocess,sys,time,urllib.request
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('--out',type=Path,required=True);p.add_argument('--channel',choices=['chrome','msedge'],default='chrome');p.add_argument('--port',type=int,default=8025);p.add_argument('--smoke-cloud',action='store_true');a=p.parse_args();root=Path(__file__).resolve().parents[2];a.out=a.out.resolve();a.out.mkdir(parents=True,exist_ok=True)
if platform.system()!='Windows' and not a.smoke_cloud:raise SystemExit('Windows required. --smoke-cloud is tooling validation only, never hardware acceptance.')
if a.out.is_relative_to(root):raise SystemExit('Output must be outside repository so immutable clean-tree check remains meaningful.')
def git(*args):return subprocess.check_output(['git','-C',str(root),*args],text=True).strip()
if git('status','--porcelain'):raise SystemExit('Clean committed checkout required; preserve changes, do not reset them.')
head=git('rev-parse','HEAD');r={'commit':head,'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'os':platform.platform(),'channel':a.channel,'smoke_cloud':a.smoke_cloud,'acceptance_status':'HARDWARE_TEST_PENDING','gpu_render_path':'UNCONFIRMED: attach chrome://gpu or edge://gpu full report; WebGL alone does not establish Canvas acceleration','thresholds':{'50_100':'60FPS optimization target','101_200':'60FPS optimization goal','250':'operable30FPS stress target; mean rAF<=33.3ms,P95<=50ms,moved90%by15s; clock correctness separate'},'mid_end_match':'USER_REVIEW_REQUIRED'}
if platform.system()=='Windows':
 script="[pscustomobject]@{CPU=@(Get-CimInstance Win32_Processor | Select-Object Name,NumberOfCores,NumberOfLogicalProcessors);RAMBytes=(Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory;GPU=@(Get-CimInstance Win32_VideoController | Select-Object Name,DriverVersion,AdapterRAM,CurrentHorizontalResolution,CurrentVerticalResolution,CurrentRefreshRate)} | ConvertTo-Json -Depth 5"
 result=subprocess.run(['powershell.exe','-NoProfile','-Command',script],capture_output=True,text=True);r['hardware_capture']={'exit':result.returncode,'stdout':result.stdout,'stderr':result.stderr}
(a.out/'machine.json').write_text(json.dumps(r,indent=2));server_log=(a.out/'server.log.txt').open('w');server=subprocess.Popen([sys.executable,str(root/'tools/qa/serve.py'),'--port',str(a.port)],cwd=root,stdout=server_log,stderr=subprocess.STDOUT)
try:
 url=f'http://127.0.0.1:{a.port}'
 for _ in range(50):
  if server.poll() is not None:raise RuntimeError('Dedicated server failed; choose an unused port. No existing server is reused.')
  try:
   with urllib.request.urlopen(url+'/__qa_build.json') as q:manifest=json.load(q)
   assert manifest['commit']==head and not manifest['dirty'];break
  except (OSError,AssertionError):time.sleep(.1)
 else:raise RuntimeError('Server unavailable or wrong provenance')
 cmd=[sys.executable,str(root/'tools/qa/tiered_audit.py'),'--url',url,'--out',str(a.out/'runs'),'--expected-head',head,'--counts','100,200,250','--modes','combat,mixed','--repeats','3','--warmup','10','--seconds','60','--width','1920','--height','1080','--browser-channel',a.channel,'--headed']
 if a.smoke_cloud:
  cmd=cmd[:-3]+['--browser-path','/usr/bin/chromium'];cmd[cmd.index('--counts')+1]='25';cmd[cmd.index('--modes')+1]='combat';cmd[cmd.index('--repeats')+1]='1';cmd[cmd.index('--warmup')+1]='1';cmd[cmd.index('--seconds')+1]='2'
 with (a.out/'runner.log.txt').open('w') as log:result=subprocess.run(cmd,cwd=root,stdout=log,stderr=subprocess.STDOUT)
 r['runner_exit']=result.returncode;r['runner_command']=cmd;r['collection_status']='SMOKE_ONLY' if a.smoke_cloud else 'HARDWARE_DATA_COLLECTED_REVIEW_REQUIRED';(a.out/'machine.json').write_text(json.dumps(r,indent=2));raise SystemExit(result.returncode)
finally:server.terminate();server.wait(timeout=10);server_log.close()
