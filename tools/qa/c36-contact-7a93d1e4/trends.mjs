// 封存資料唯讀診斷；不建立遊戲、改寫存檔或推論未記錄的命令。
import fs from 'node:fs';
import crypto from 'node:crypto';
const [root,out]=process.argv.slice(2);
if(!root||!out)throw Error('usage: node trends.mjs SOURCE_ROOT OUTPUT');
if(fs.existsSync(out))throw Error('輸出必須是新檔案');
const files=['samples.jsonl','damage-events.jsonl'];
const bytes=files.map(n=>fs.readFileSync(`${root}/${n}`));
const [samples,damage]=bytes.map(b=>b.toString().trim().split('\n').map(JSON.parse));
for(let i=1;i<samples.length;i++)if(samples[i].sim<samples[i-1].sim)throw Error('採樣時間非遞增');
const start=468.9132,end=474.6297,target=126,ids=[16,70,72,85,105,109,113,126,132,139];
const window=samples.filter(s=>s.sim>=start&&s.sim<=end);
if(window.length<2)throw Error('採樣不足');
const rows=ids.map(id=>{
 const points=window.map(s=>({sim:s.sim,u:s.units.find(u=>u.id===id)})).filter(p=>p.u);
 const first=points[0],last=points.at(-1);if(!first)throw Error(`缺少單位 ${id}`);
 let path=0,max=0;for(let i=0;i<points.length;i++){const p=points[i];max=Math.max(max,Math.hypot(p.u.x-first.u.x,p.u.y-first.u.y));if(i)path+=Math.hypot(p.u.x-points[i-1].u.x,p.u.y-points[i-1].u.y);}
 const hits=damage.filter(d=>d.sim>=first.sim&&d.sim<=last.sim&&d.sourceId===id&&d.targetId===target&&d.beforeHp>d.afterHp);
 const failed=points.find(p=>p.u.orderFailure==='congested');
 return {id,type:first.u.type,sampleCount:points.length,firstSim:first.sim,lastSim:last.sim,sampledTravel:path,maxDisplacement:max,netDisplacement:Math.hypot(last.u.x-first.u.x,last.u.y-first.u.y),manualTarget126Samples:points.filter(p=>p.u.manualAttack&&p.u.target===target).length,firstFailure:failed?{sim:failed.sim,target:failed.u.target,manualAttack:failed.u.manualAttack}:null,firstTarget:first.u.target,lastTarget:last.u.target,confirmedTarget126Hits:hits.length,target126HpDamage:hits.reduce((n,d)=>n+d.beforeHp-d.afterHp,0)};
});
const result={sourceCommit:'232104e964e3ad59993960e202ef37479fac0983',sources:files.map((name,i)=>({name,bytes:bytes[i].length,sha256:crypto.createHash('sha256').update(bytes[i]).digest('hex')})),window:{requestedStart:start,requestedEnd:end,samples:window.length,first:window[0].sim,last:window.at(-1).sim},rows,limitations:['封存採樣之間的細小往返可能未被記錄；sampledTravel 是採樣折線，不是逐幀真實里程。','state=attack 不等於正在移動，也不等於有命中；以位置與實際傷害分開判定。','未恢復當時導航、heading、交通讓行優先序；不能由低位移單獨證明演算法缺陷。','本輪不執行戰鬥、不修改遊戲，不代表修復後驗收或自然戰役結果。']};
fs.writeFileSync(out,JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
