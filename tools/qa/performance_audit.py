"""Three independent fresh-browser repetitions, plus separate diagnostic CPU profiles.
All outputs are local AFTER_LOCAL. No mutating remote APIs or live saves.
"""
import argparse,hashlib,json,os,platform,subprocess,time
from pathlib import Path
from playwright.sync_api import sync_playwright
from perf_stats import distribution,gates
p=argparse.ArgumentParser();p.add_argument('--url',default='http://127.0.0.1:8008');p.add_argument('--out',type=Path,required=True);p.add_argument('--warmup',type=int,default=8);p.add_argument('--seconds',type=int,default=20);p.add_argument('--repeats',type=int,default=3);p.add_argument('--counts',default='25,100,250,500,1000');p.add_argument('--modes',default='move,combat');p.add_argument('--diagnostic',action='store_true');p.add_argument('--expected-head',required=True);a=p.parse_args();assert a.url.startswith('http://127.0.0.1:');a.out.mkdir(parents=True,exist_ok=True)
def read(path):
 try:return Path(path).read_text().strip()
 except OSError:return None
hardware={'platform':platform.platform(),'cpu_model':next((x.split(':',1)[1].strip() for x in Path('/proc/cpuinfo').read_text().splitlines() if x.startswith('model name')),None),'cpus_visible':os.cpu_count(),'cpu_quota':read('/sys/fs/cgroup/cpu.max'),'memory_limit':read('/sys/fs/cgroup/memory.max'),'viewport':[1600,1100],'dpr':1,'warmup_seconds':a.warmup,'measure_seconds':a.seconds,'quantile':'nearest-rank','gate_metric':'rAF interval (original Frame Time gate); JS update-to-UI span is reported separately','diagnostic':a.diagnostic,'repeats':a.repeats}
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
  workloads=[('move',n) for n in order] if 'move' in a.modes.split(',') else []
  if 'combat' in a.modes.split(','):workloads.append(('combat',1000))
  for mode,count in workloads:
   folder=a.out/f'r{repetition+1}-{mode}-{count}';folder.mkdir(exist_ok=True)
   browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox']);context=browser.new_context(viewport={'width':1600,'height':1100},device_scale_factor=1);page=context.new_page();logs={'console':[],'errors':[],'failed':[]}
   page.on('console',lambda m:logs['console'].append({'type':m.type,'text':m.text}));page.on('pageerror',lambda e:logs['errors'].append(str(e)));page.on('requestfailed',lambda e:logs['failed'].append({'url':e.url,'error':e.failure}))
   page.goto(a.url);page.wait_for_function('!!window.ageOfAsh');manifest=context.request.get(a.url+'/__qa_build.json').json();assert manifest['commit']==a.expected_head and not manifest['dirty'],'Expected clean immutable source'
   page.locator('#setup-civ').select_option('TEU');page.locator('#setup-biome').select_option('steppe');page.locator('#setup-seed').fill('phase-a-perf');page.locator('#btn-start').click()
   fixture=page.evaluate('''async ([n,mode,detailed])=>{window.protocol=await import('/tools/qa/perf_protocol.js');const fixture=protocol.setup(n,mode);protocol.install(detailed);return fixture;}''',[count,mode,a.diagnostic])
   cdp=context.new_cdp_session(page);cdp.send('Performance.enable');before=perf_metrics(cdp);cpu_before=read('/sys/fs/cgroup/cpu.stat');pressure_before=read('/sys/fs/cgroup/cpu.pressure')
   if a.diagnostic:cdp.send('Profiler.enable');cdp.send('Profiler.setSamplingInterval',{'interval':1000});cdp.send('Profiler.start');cdp.send('Tracing.start',{'categories':'devtools.timeline,v8,disabled-by-default-v8.gc','transferMode':'ReturnAsStream'})
   result=page.evaluate('([warmup,seconds,mode,n])=>protocol.run(warmup,seconds,mode,n)',[a.warmup,a.seconds,mode,count]);after=perf_metrics(cdp)
   if a.diagnostic:
    profile=cdp.send('Profiler.stop')['profile'];dump(folder/'cpu-profile.json',profile);dump(folder/'cpu-summary.json',profile_summary(profile));completed=[];cdp.on('Tracing.tracingComplete',lambda e:completed.append(e));cdp.send('Tracing.end')
    while not completed:page.wait_for_timeout(50)
    stream=completed[0]['stream'];parts=[]
    while True:
     chunk=cdp.send('IO.read',{'handle':stream});parts.append(chunk['data'])
     if chunk.get('eof'):break
    cdp.send('IO.close',{'handle':stream});trace=json.loads(''.join(parts));dump(folder/'timeline.json',trace)
    gc=[e for e in trace.get('traceEvents',[]) if e.get('name') in ['MajorGC','MinorGC'] and 'dur' in e];dump(folder/'gc.json',{'count':len(gc),'total_ms':sum(e['dur'] for e in gc)/1000,'events':gc})
   result.update({'repetition':repetition+1,'browser':browser.version,'manifest':manifest,'fixture':fixture,'cdp_before':before,'cdp_after':after,'cpu_stat_before':cpu_before,'cpu_stat_after':read('/sys/fs/cgroup/cpu.stat'),'cpu_pressure_before':pressure_before,'cpu_pressure_after':read('/sys/fs/cgroup/cpu.pressure'),'logs':logs})
   result['distributions']={key:distribution(result['raw'][key]) for key in ['frames','frameWork','update','draw','ui','simDt','observer','nav','pending','alive','heap']};result['checks']=gates(result);result['pass']=all(result['checks'].values()) and not logs['errors'] and not logs['failed'];dump(folder/'result.json',result)
   page.screenshot(path=str(folder/'game.png'));context.close();browser.close()
   compact={k:v for k,v in result.items() if k not in ['raw','manifest','logs']};cases.append(compact);dump(a.out/'results.json',{'protocol':hardware,'cases':cases});print(json.dumps({'rep':repetition+1,'mode':mode,'count':count,'raf':result['distributions']['frames'],'js':result['distributions']['frameWork'],'moved':result['moved_fraction'],'attacks':result['attacks'],'alive':result['distributions']['alive'],'pass':result['pass']}),flush=True)
