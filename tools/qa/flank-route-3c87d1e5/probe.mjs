import '../ram-pick-065e2912/node-dom-fixture.mjs';
import fs from 'node:fs';import{createHash}from'node:crypto';import assert from 'node:assert/strict';import {Game}from'../../../js/game.js';import{findPath}from'../../../js/navigation.js';import{fixture}from'../dense-trace-f2a67c90/fixture.mjs';
const out=process.argv[2];if(!out||fs.existsSync(out))throw Error('fresh output required');
const{g,units,target}=fixture(new Game(),{mixed:true,n:6,spacing:.7});const actor=units.find(u=>u.id===22),rows=[];
const state=()=>{const s=g.snapshot();delete s.savedAt;return s;};
const clone=x=>JSON.parse(JSON.stringify(x));
function audit(){
 const before=state(),all=units.filter(v=>v!==actor&&v.alive),standing=all.filter(v=>v.state==='attack'&&v.target?.alive&&g.distanceTo(v,v.target)<=g.unitRange(v)+(v.target.w?-.1:v.target.typeDef.radius));
 const queries=[];
 for(const[label,bodies]of[['standing',standing],['allFrozen',all]]){
  const radius=v=>actor.typeDef.radius+v.typeDef.radius-.015;
  const walkable=(x,y)=>g.isWalkable(x,y,actor)&&bodies.every(v=>Math.hypot(x-v.x,y-v.y)>=radius(v));
  walkable.segment=(a,b)=>g.segmentWalkable(a,b,actor)&&bodies.every(v=>{const dx=b.x-a.x,dy=b.y-a.y,len=dx*dx+dy*dy,t=len?Math.max(0,Math.min(1,((v.x-a.x)*dx+(v.y-a.y)*dy)/len)):0;const before=Math.hypot(a.x-v.x,a.y-v.y),after=Math.hypot(b.x-v.x,b.y-v.y);return before<radius(v)?after>before+1e-6&&(a.x-v.x)*dx+(a.y-v.y)*dy>=0:Math.hypot(a.x+t*dx-v.x,a.y+t*dy-v.y)>=radius(v);});
  const range=actor._nav?.range||.8,path=findPath(actor,{x:target.x+target.w/2,y:target.y+target.h/2},walkable,g.world.size,{range:range+Math.hypot(target.w,target.h)/2,goalTest:p=>g.distanceTo(p,target)<=range,goalBounds:{left:target.x-range,right:target.x+target.w+range,top:target.y-range,bottom:target.y+target.h+range}});
  let previous={x:actor.x,y:actor.y},length=0;for(const p of path.points){assert.ok(walkable.segment(previous,p),label+'返回路線必須合法');length+=Math.hypot(p.x-previous.x,p.y-previous.y);previous=p;}
  if(path.status==='ready')assert.ok(g.distanceTo(path.goal,target)<=range);
  queries.push({label,bodies:bodies.map(v=>({id:v.id,x:v.x,y:v.y,radius:v.typeDef.radius,state:v.state})),path,length});
 }
 assert.deepEqual(state(),before,'離線路線查詢不得改模擬狀態或RNG');
 rows.push({sim:g.time,actor:{id:actor.id,x:actor.x,y:actor.y,radius:actor.typeDef.radius,manual:actor.manualAttack,target:actor.target?.id},existingNav:actor._nav?clone(actor._nav):null,existingGoalOccupied:all.filter(v=>actor._nav?.goal&&Math.hypot(actor._nav.goal.x-v.x,actor._nav.goal.y-v.y)<actor.typeDef.radius+v.typeDef.radius-.015).map(v=>v.id),queries,snapshot:before});
}
for(let i=0;i<660;i++){g.time+=1/60;g.updateUnits(1/60);g.updateProjectiles(1/60);if([212,311,653].includes(i))audit();}
const report={runtimeGameSha256:createHash('sha256').update(fs.readFileSync(new URL('../../../js/game.js',import.meta.url))).digest('hex'),scope:'受測6混兵/.7，FRK、steppe、seed42；固定當刻友軍身體做可行路線查詢，不採用至AI、不代表完整動態執行或自然C36。',stateUnchanged:true,rows};fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({rows:rows.map(r=>({sim:r.sim,existingGoalOccupied:r.existingGoalOccupied,queries:r.queries.map(q=>({label:q.label,status:q.path.status,length:q.length,expanded:q.path.expanded,goal:q.path.goal}))}))}));
