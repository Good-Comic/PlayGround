"""Three independent fresh-browser repetitions, plus separate diagnostic CPU profiles.
All outputs are local AFTER_LOCAL. No mutating remote APIs or live saves.
"""
import argparse,datetime,hashlib,json,os,platform,subprocess,time
from pathlib import Path
from playwright.sync_api import sync_playwright
from perf_stats import distribution,gates
p=argparse.ArgumentParser();p.add_argument('--url',default='http://127.0.0.1:8008');p.add_argument('--out',type=Path,required=True);p.add_argument('--warmup',type=int,default=8);p.add_argument('--seconds',type=int,default=20);p.add_argument('--repeats',type=int,default=3);p.add_argument('--counts',default='25,100,250,500,1000');p.add_argument('--modes',default='combat,mixed');p.add_argument('--diagnostic',action='store_true');p.add_argument('--expected-head',required=True);p.add_argument('--browser-channel',choices=['chrome','msedge']);p.add_argument('--browser-path');p.add_argument('--headed',action='store_true');p.add_argument('--width',type=int,default=1600);p.add_argument('--height',type=int,default=1100);a=p.parse_args();assert a.url.startswith('http://127.0.0.1:');a.out.mkdir(parents=True,exist_ok=True)
def read(path):
 try:return Path(path).read_text().strip()
 except OSError:return None
hardware={'platform':platform.platform(),'cpu_model':next((x.split(':',1)[1].strip() for x in (read('/proc/cpuinfo') or '').splitlines() if x.startswith('model name')),None),'cpus_visible':os.cpu_count(),'cpu_quota':read('/sys/fs/cgroup/cpu.max'),'memory_limit':read('/sys/fs/cgroup/memory.max'),'viewport':[a.width,a.height],'dpr':1,'warmup_seconds':a.warmup,'measure_seconds':a.seconds,'quantile':'nearest-rank','gate_metric':'rAF interval (original Frame Time gate); JS update-to-UI span is reported separately','diagnostic':a.diagnostic,'repeats':a.repeats}
(a.out/'protocol.json').write_text(json.dumps(hardware,indent=2))
def dump(path,obj):path.write_text(json.dumps(obj,ensure_ascii=False,indent=2))
def perf_metrics(cdp):return {x['name']:x['value'] for x in cdp.send('Performance.getMetrics')['metrics']}
def profile_summary(profile):
 nodes={n['id']:n for n in profile['nodes']};totals={}
 for node,dt in zip(profile.get('samples',[]),profile.get('timeDeltas',[])):
  frame=nodes[node]['callFrame'];key=(frame['functionName'] or '(anonymous)',frame['url'],frame.get('lineNumber',0));totals[key]=totals.get(key,0)+dt
 return [{'function':k[0],'url':k[1],'line':k[2]+1,'sampled_self_ms':v/1000} for k,v in sorted(totals.items(),key=lambda x:-x[1])[:60]]
counts=list(map(int,a.counts.split(',')));cases=[]
with sync_playwright() as pw:
 for repetition in range(a.repeats):
  order=counts[2*repetition%len(counts):]+counts[:2*repetition%len(counts)]
  workloads=[(mode,n) for mode in a.modes.split(',') for n in (order if mode=='combat' else [250])]
  for mode,count in workloads:
   case_started=datetime.datetime.now(datetime.timezone.utc).isoformat()
   folder=a.out/f'r{repetition+1}-{mode}-{count}';folder.mkdir(exist_ok=True)
   launch={'headless':not a.headed};
   if a.browser_channel:launch['channel']=a.browser_channel
   else:launch['executable_path']=a.browser_path or '/usr/bin/chromium'
   if platform.system()=='Linux':launch['args']=['--no-sandbox']
   browser=pw.chromium.launch(**launch);gpu=browser.new_browser_cdp_session().send('SystemInfo.getInfo');dump(folder/'browser-gpu.json',gpu);context=browser.new_context(viewport={'width':a.width,'height':a.height},device_scale_factor=1);page=context.new_page();logs={'console':[],'errors':[],'failed':[]}
   page.on('console',lambda m:logs['console'].append({'type':m.type,'text':m.text}));page.on('pageerror',lambda e:logs['errors'].append(str(e)));page.on('requestfailed',lambda e:logs['failed'].append({'url':e.url,'error':e.failure}))
   page.goto(a.url);page.wait_for_function('!!window.ageOfAsh');manifest=context.request.get(a.url+'/__qa_build.json').json();assert manifest['commit']==a.expected_head and not manifest['dirty'],'Expected clean immutable source'
   page.locator('#setup-civ').select_option('TEU');page.locator('#setup-biome').select_option('steppe');page.locator('#setup-seed').fill('phase-a-perf');page.locator('#btn-start').click()
   fixture=page.evaluate('''async ([n,mode,detailed])=>{window.protocol=await import('/tools/qa/tiered_protocol.js');const fixture=protocol.setup(n,mode);protocol.install(detailed);return fixture;}''',[count,mode,a.diagnostic])
   probe=page.evaluate('()=>protocol.inputProbe()');page.mouse.click(probe['canvas']['x'],probe['canvas']['y'],button='right')
   cdp=context.new_cdp_session(page);cdp.send('Performance.enable');before=perf_metrics(cdp);cpu_before=read('/sys/fs/cgroup/cpu.stat');pressure_before=read('/sys/fs/cgroup/cpu.pressure')
   if a.diagnostic:cdp.send('Profiler.enable');cdp.send('Profiler.setSamplingInterval',{'interval':1000});cdp.send('Profiler.start');cdp.send('Tracing.start',{'categories':'devtools.timeline,v8,cc,disabled-by-default-devtools.timeline,disabled-by-default-devtools.timeline.frame,disabled-by-default-v8.gc,blink.user_timing','transferMode':'ReturnAsStream'})
   result=page.evaluate('([warmup,seconds,mode,n])=>protocol.run(warmup,seconds,mode,n)',[a.warmup,a.seconds,mode,count]);after=perf_metrics(cdp)
   if a.diagnostic:
    profile=cdp.send('Profiler.stop')['profile'];dump(folder/'cpu-profile.json',profile);dump(folder/'cpu-summary.json',profile_summary(profile));completed=[];cdp.on('Tracing.tracingComplete',lambda e:completed.append(e));cdp.send('Tracing.end')
    while not completed:page.wait_for_timeout(50)
    stream=completed[0]['stream'];parts=[]
    while True:
     chunk=cdp.send('IO.read',{'handle':stream});parts.append(chunk['data'])
     if chunk.get('eof'):break
    cdp.send('IO.close',{'handle':stream});trace=json.loads(''.join(parts));dump(folder/'timeline.json',trace)
    marks={e['name']:e['ts'] for e in trace.get('traceEvents',[]) if e.get('name') in ['AUDIT_MEASURE_START','AUDIT_MEASURE_END']};gc=[e for e in trace.get('traceEvents',[]) if e.get('name') in ['MajorGC','MinorGC'] and 'dur' in e and marks.get('AUDIT_MEASURE_START',0)<=e['ts']<=marks.get('AUDIT_MEASURE_END',float('inf'))];dump(folder/'gc.json',{'scope':'measurement' if 'AUDIT_MEASURE_START' in marks and 'AUDIT_MEASURE_END' in marks else 'whole diagnostic; marks missing','marks':marks,'count':len(gc),'total_ms':sum(e['dur'] for e in gc)/1000,'events':gc})
   result.update({'utc_started':case_started,'repetition':repetition+1,'browser':browser.version,'manifest':manifest,'fixture':fixture,'cdp_before':before,'cdp_after':after,'cpu_stat_before':cpu_before,'cpu_stat_after':read('/sys/fs/cgroup/cpu.stat'),'cpu_pressure_before':pressure_before,'cpu_pressure_after':read('/sys/fs/cgroup/cpu.pressure'),'logs':logs})
   result['distributions']={key:distribution(result['raw'][key][1:] if key in ['observer','nav'] and len(result['raw'][key])==len(result['raw']['frames'])+1 else result['raw'][key]) for key in ['frames','frameWork','update','draw','ui','simDt','observer','nav','pending','alive','heap']};result['checks']=gates(result);result['checks'].pop('mean_alive_ge_900',None);result['checks']['mean_alive_ge_90_percent']=distribution(result['raw']['alive'])['mean']>=count*.9;result['checks'].update({'input_response_le_250ms':result['tier']['input']['responseMs'] is not None and result['tier']['input']['responseMs']<=250,'input_command_completes':result['tier']['input']['complete'],'persistent_stuck_fraction_le_2_percent':result['tier']['peakStuckFraction']<=.02});
   if mode=='mixed':result['checks'].update({'economic_deposits':result['tier']['deposits']>=4,'economic_credit':result['tier']['gatheredDelta']>0,'real_combat':result['attacks']>=100})
   result['checks']['native_loop_heartbeat']=len(result['raw']['frameWork'])>=.95*len(result['raw']['frames']);result['checks']['simulation_progress_ge_90_percent']=result['measured_sim_seconds']>=result['measured_wall_seconds']*.9;result['checks']['full_measurement_window']=result['measured_wall_seconds']>=a.seconds;result['simulation_integrity_status']='NOT_CERTIFIED: progress ratio is descriptive, not time correctness';result['pass']=all(result['checks'].values()) and not logs['errors'] and not logs['failed'];dump(folder/'result.json',result)
   page.screenshot(path=str(folder/'game.png'));context.close();browser.close()
   compact={k:v for k,v in result.items() if k not in ['raw','manifest','logs']};cases.append(compact);dump(a.out/'results.json',{'protocol':hardware,'cases':cases});print(json.dumps({'rep':repetition+1,'mode':mode,'count':count,'raf':result['distributions']['frames'],'js':result['distributions']['frameWork'],'moved15':result['moved_fraction_15s'],'attacks':result['attacks'],'alive':result['distributions']['alive'],'pass':result['pass']}),flush=True)
