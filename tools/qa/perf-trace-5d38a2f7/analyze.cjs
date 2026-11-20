const fs=require('fs'),path=require('path');const[root,out]=process.argv.slice(2);if(!root||!out||fs.existsSync(out))throw Error('capture directory and fresh output required');
const result=JSON.parse(fs.readFileSync(path.join(root,'result.json'))),rows=[];
for(const mode of ['legacy','flank','clip']){
 const p=JSON.parse(fs.readFileSync(path.join(root,`cpu-${mode}.cpuprofile`))),nodes=new Map(p.nodes.map(n=>[n.id,n])),parents=new Map(),self=new Map(),inclusive=new Map(),fileInclusive=new Map(),drawImageParents=new Map();
 for(const n of p.nodes)for(const id of n.children||[])parents.set(id,n.id);
 const label=n=>{const f=n.callFrame;return `${f.functionName||'(anonymous)'} @ ${f.url||'(system)'}:${f.lineNumber+1}`;};let sampledUs=0;
 for(let i=0;i<(p.samples||[]).length;i++){
  const us=p.timeDeltas?.[i]||0;sampledUs+=us;let id=p.samples[i];const leaf=nodes.get(id);if(!leaf)continue;const key=label(leaf);self.set(key,(self.get(key)||0)+us);if(leaf.callFrame.functionName==='drawImage'){let ancestor=parents.get(id);while(ancestor){const frame=nodes.get(ancestor);if(frame.callFrame.url){const site=label(frame);drawImageParents.set(site,(drawImageParents.get(site)||0)+us);break;}ancestor=parents.get(ancestor);}}const functions=new Set(),files=new Set();
  while(id){const n=nodes.get(id);if(!n)break;functions.add(label(n));if(n.callFrame.url)files.add(n.callFrame.url);id=parents.get(id);}
  for(const k of functions)inclusive.set(k,(inclusive.get(k)||0)+us);for(const k of files)fileInclusive.set(k,(fileInclusive.get(k)||0)+us);
 }
 const top=m=>[...m].sort((a,b)=>b[1]-a[1]).slice(0,25).map(([name,us])=>({name,ms:us/1000,percentOfSampled:sampledUs?us/sampledUs*100:0}));
 const trace=JSON.parse(fs.readFileSync(path.join(root,`trace-${mode}.json`))),events=trace.traceEvents||[],threadNames=new Map();for(const e of events)if(e.ph==='M'&&e.name==='thread_name')threadNames.set(`${e.pid}:${e.tid}`,e.args?.name||'');
 const mainKeys=[...threadNames].filter(([,name])=>name==='CrRendererMain').map(([key])=>key);const xs=events.filter(e=>e.ph==='X'&&Number.isFinite(e.dur));const taskNames=['RunTask','ThreadControllerImpl::RunTask'];let main=null,tasks=[];
 for(const key of mainKeys){const candidates=xs.filter(e=>`${e.pid}:${e.tid}`===key);let t=[];for(const name of taskNames){t=candidates.filter(e=>e.name===name);if(t.length)break;}if(!main||t.reduce((s,e)=>s+e.dur,0)>tasks.reduce((s,e)=>s+e.dur,0)){main=key;tasks=t;}}
 const mainEvents=xs.filter(e=>`${e.pid}:${e.tid}`===main),gcNames=['MinorGC','MajorGC'];const gc=Object.fromEntries(gcNames.map(name=>{const es=mainEvents.filter(e=>e.name===name);return[name,{count:es.length,totalMs:es.reduce((s,e)=>s+e.dur,0)/1000,maxMs:Math.max(0,...es.map(e=>e.dur))/1000}];}));
 const gpuKeys=new Set([...threadNames].filter(([,name])=>/gpu|compositor|viz/i.test(name)).map(([key])=>key)),gpuEvents=new Map();for(const e of xs)if(gpuKeys.has(`${e.pid}:${e.tid}`)){const x=gpuEvents.get(e.name)||{count:0,us:0};x.count++;x.us+=e.dur;gpuEvents.set(e.name,x);}
 const perf=result.rows.find(r=>r.runId===mode);rows.push({mode,source:perf.source,fpsWithProfiling:perf.fps,p50:perf.p50Ms,p95:perf.p95Ms,profileWallMs:(p.endTime-p.startTime)/1000,sampledMs:sampledUs/1000,self:top(self),inclusive:top(inclusive),fileInclusive:top(fileInclusive),drawImageParents:top(drawImageParents),eventCount:events.length,mainThread:main,mainTasks:{count:tasks.length,over50ms:tasks.filter(e=>e.dur>50000).length,totalMs:tasks.reduce((s,e)=>s+e.dur,0)/1000,maxMs:Math.max(0,...tasks.map(e=>e.dur))/1000},gc,gpuThreads:[...threadNames].filter(([key])=>gpuKeys.has(key)),gpuEvents:[...gpuEvents].sort((a,b)=>b[1].us-a[1].us).slice(0,15).map(([name,x])=>({name,count:x.count,inclusiveMs:x.us/1000}))});
}
fs.writeFileSync(out,JSON.stringify({scope:'三版同一100人受控戰鬥場景、帶CPU採樣及Chrome tracing。inclusive堆疊／事件有重疊，不可加總；GPU執行緒為SwiftShader軟體事件，並非實體GPU成本。GC只列所選Renderer主執行緒MinorGC/MajorGC，未見不等於所有GC不存在。',initialPairs:result.pairs,rows},null,2)+'\n');
for(const r of rows)console.log(JSON.stringify({mode:r.mode,fps:r.fpsWithProfiling,main:r.mainTasks,gc:r.gc,top:r.self.slice(0,8),files:r.fileInclusive.slice(0,6)}));
