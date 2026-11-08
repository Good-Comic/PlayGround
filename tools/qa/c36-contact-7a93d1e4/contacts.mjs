// 只讀重建原地圖並查詢封存姿態；不是自然戰役重播或當時完整導航狀態。
import '../ram-pick-065e2912/node-dom-fixture.mjs';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {Game} from '../../../js/game.js';
import {UNIT_TYPES,BUILDING_TYPES} from '../../../js/data.js';
import {findPath,segmentClear} from '../../../js/navigation.js';
import {Crowd} from '../../../js/crowd.js';
if(!process.argv[2] || fs.existsSync(process.argv[2]))throw Error('輸出必須是新檔案');
const root=process.env.C36_SOURCE_ROOT||'/workspace/riftwatch-fun-lab-v2-8e41d6b2/formal/private-observer/C/after';
const paths=['samples.jsonl','snapshot-43-false-4-wave.json','snapshot-48-false-4-defeat.json'];
const sources=paths.map(name=>{const b=fs.readFileSync(root+'/'+name);return{name,bytes:b.length,sha256:crypto.createHash('sha256').update(b).digest('hex')};});
const samples=fs.readFileSync(root+'/samples.jsonl','utf8').trim().split('\n').map(JSON.parse),rows=[];
for(const name of paths.slice(1,2)){
 const snapshot=JSON.parse(fs.readFileSync(root+'/'+name));
 for(const time of [468.9132]){
  const s=samples.reduce((a,b)=>Math.abs(a.sim-time)<Math.abs(b.sim-time)?a:b),g=new Game();g.restore(snapshot);
  const templates=new Map(g.units.map(u=>[u.id,u]));
  g.units=s.units.map(u=>({...templates.get(u.id),...u,typeDef:UNIT_TYPES[u.type]||templates.get(u.id)?.typeDef}));
  g.buildings=s.buildings.map(b=>({...g.buildings.find(v=>v.id===b.id),...b,team:'player',typeDef:BUILDING_TYPES[b.type],w:BUILDING_TYPES[b.type].w,h:BUILDING_TYPES[b.type].h}));
  if(g.seed!==s.seed)throw Error('原始地圖種子不符');
  const entities=new Map([...g.units,...g.buildings].map(u=>[u.id,u]));
  for(const u of g.units)u.target=entities.get(u.target)||null;
  g.time=s.sim;const target=g.units.find(u=>u.id===126),rng=g.rng.state,visual=g.visualRng.state;
  for(const id of [16,70,72,85,109,113]){
   const u=g.units.find(u=>u.id===id),walk=(x,y)=>g.isWalkable(x,y,u);walk.segment=(a,b)=>g.segmentWalkable(a,b,u);
   const range=Math.max(.35,g.unitRange(u)+(target.typeDef.radius||.2)-.1);
   const path=findPath(u,target,walk,g.world.size,{range});
   const points=[...path.points||[]];while(points.length>1&&Math.hypot(u.x-points[0].x,u.y-points[0].y)<.07)points.shift();
   const first=points[0];let steer=null;const probes=[];
   if(first){const dx=first.x-u.x,dy=first.y-u.y,d=Math.hypot(dx,dy),step=Math.min(d,g.unitSpeed(u)*.05);if(d){const crowd=new Crowd(g.units);steer=crowd.steer(u,{x:u.x+dx/d*step,y:u.y+dy/d*step},(a,b)=>{const clear=segmentClear(walk,a,b);const vx=b.x-a.x,vy=b.y-a.y,len=vx*vx+vy*vy;const blockingBodies=g.units.filter(v=>v!==u&&v.alive).filter(v=>{const r=(u.typeDef.radius||.24)+(v.typeDef.radius||.24)-.015,ox=a.x-v.x,oy=a.y-v.y,before=ox*ox+oy*oy,t=len?Math.max(0,Math.min(1,((v.x-a.x)*vx+(v.y-a.y)*vy)/len)):0;if(before<r*r)return Math.hypot(b.x-v.x,b.y-v.y)<=Math.sqrt(before)+1e-6;return(a.x+vx*t-v.x)**2+(a.y+vy*t-v.y)**2<r*r;}).map(v=>({id:v.id,team:v.team,state:v.state}));probes.push({next:b,staticClear:clear,blockingBodies});return clear;},g.time);}}
   const crowd=new Crowd(g.units),near=crowd.nearby(u,2);
   const actualContacts=[...new Set(u._crowdBlockedBy||[])].map(v=>{const t=v.target;const r=t?(v.team==='player'?g.unitRange(v):v.typeDef.range)+(t.typeDef?.radius||0):null;return {id:v.id,team:v.team,state:v.state,target:t?.id,targetAlive:t?.alive,targetTeam:t?.team,distance:t?g.distanceTo(v,t):null,range:r};});
   rows.push({actualContacts,resourceSnapshot:name,snapshotSim:snapshot.runTime,sampleSim:s.sim,id,position:{x:u.x,y:u.y},target:{id:126,x:target.x,y:target.y},range,staticPath:{status:path.status,expanded:path.expanded,points:path.points,goal:path.goal},firstStepWithSampledBodies:steer,probes,nearbyDetourEligible:near.filter(v=>['idle','hold','gather'].includes(v.state)).map(v=>v.id),nearbyAttackers:near.filter(v=>v.state==='attack').map(v=>v.id)});
  }
  if(g.rng.state!==rng||g.visualRng.state!==visual)throw Error('只讀查詢不應消耗雙RNG');
 }
}
const report={sources,scope:'原地圖按正式snapshot.restore重建；建築與單位位置取相同採樣。分別使用波初及敗北樹木資源狀態，沒有憑空補造中間狀態。路線查詢保留正式碰撞/射程/速度，未推進戰鬥、未改傷害。',limitations:['採樣缺當時_nav/_heading/_yieldTo/交通優先序，firstStep是重建姿態下的查詢，不能冒稱當時真實路線或碰撞序列。','建築隊伍依本場友軍建築重建；兩資源快照一致不等於中間逐幀完全相同。','靜態有路不保證動態接敵成功，單步無路也不代表不存在繞行方案。','瞬時buff與原先導航佇列也未完整保留；查詢採正式snapshot的相關屬性，不冒稱逐幀精確重播。'],rows};
fs.writeFileSync(process.argv[2],JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(rows.map(r=>({map:r.resourceSnapshot,sim:r.sampleSim,id:r.id,path:r.staticPath.status,step:!!r.firstStepWithSampledBodies,eligible:r.nearbyDetourEligible.length,attackers:r.nearbyAttackers.length}))));
