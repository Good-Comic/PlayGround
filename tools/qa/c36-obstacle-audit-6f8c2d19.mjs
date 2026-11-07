// 封存座標的靜態幾何查詢，不重演不存在的逐幀路線，不修改遊戲。
import fs from 'node:fs';
import {UNIT_TYPES,BUILDING_TYPES} from '../../js/data.js';
import {crossesRect} from '../../js/navigation.js';
const file='/workspace/riftwatch-fun-lab-v2-8e41d6b2/formal/private-observer/C/after/samples.jsonl';
const all=fs.readFileSync(file,'utf8').trim().split('\n').map(JSON.parse);
const rows=[];
for(const time of [468.9132,474.6296]){
 const s=all.reduce((a,b)=>Math.abs(a.sim-time)<Math.abs(b.sim-time)?a:b), target=s.units.find(u=>u.id===126);
 for(const id of [16,70,72,85,109,113]){
  const u=s.units.find(u=>u.id===id),radius=UNIT_TYPES[u.type].radius||.24;
  const buildings=s.buildings.filter(b=>b.alive&&BUILDING_TYPES[b.type]).filter(b=>{const d=BUILDING_TYPES[b.type];return crossesRect(u,target,b.x-radius-.02,b.y-radius-.02,b.x+d.w+radius+.02,b.y+d.h+radius+.02);}).map(b=>({id:b.id,type:b.type}));
  const dx=target.x-u.x,dy=target.y-u.y,len=dx*dx+dy*dy;
  const bodies=s.units.filter(v=>v.alive&&v.id!==id&&v.id!==126).map(v=>{const t=len?Math.max(0,Math.min(1,((v.x-u.x)*dx+(v.y-u.y)*dy)/len)):0;return{id:v.id,team:v.team,type:v.type,lineDistance:Math.hypot(v.x-u.x-t*dx,v.y-u.y-t*dy),threshold:radius+(UNIT_TYPES[v.type]?.radius||.24)-.015};}).filter(v=>v.lineDistance<v.threshold);
  rows.push({sim:s.sim,id,actualTarget:u.target,manualAttack:u.manualAttack,orderFailure:u.orderFailure,straightSegmentBuildings:buildings,straightSegmentBodies:bodies});
 }
}
const out=process.argv[2];fs.writeFileSync(out,JSON.stringify({source:file,scope:'封存實際座標至原衝車的直線幾何，不是當時實際導航路線或單步steer。障礙交線只提供候選瓶頸，不證明無繞路；缺nav/heading/逐幀樹木狀態，不能把相關性當根因。',rows},null,2)+'\n');
console.log(JSON.stringify(rows.map(r=>({sim:r.sim,id:r.id,buildings:r.straightSegmentBuildings,bodies:r.straightSegmentBodies.map(x=>x.id)}))));
