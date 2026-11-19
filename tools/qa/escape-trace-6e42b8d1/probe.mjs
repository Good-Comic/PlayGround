import '../ram-pick-065e2912/node-dom-fixture.mjs';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {Game} from '../../../js/game.js';
import {Crowd} from '../../../js/crowd.js';
import {fixture} from '../dense-trace-f2a67c90/fixture.mjs';
const out=process.argv[2];
const runtimeCrowdSha256=createHash('sha256').update(fs.readFileSync(new URL('../../../js/crowd.js',import.meta.url))).digest('hex');
const expectedCrowdSha256=process.argv[3];
assert.equal(runtimeCrowdSha256,expectedCrowdSha256,'須明確指定本次受測crowd.js的SHA-256，不得誤標來源');
if(!out||fs.existsSync(out))throw Error('fresh output required');
const clone=x=>x==null?null:JSON.parse(JSON.stringify(x));
function run(observe){
 const {g,units,target}=fixture(new Game(),{mixed:true,n:6,spacing:.7});
 const actor=units.find(u=>u.id===25);assert.ok(actor);
 const rows=[],hits=new Map(),digest=createHash('sha256');
 const steer=Crowd.prototype.steer,step=g.stepToward,apply=g.applyDamage;
 if(observe){
  Crowd.prototype.steer=function(u,desired,clear,time){
   const before={x:u.x,y:u.y},result=steer.call(this,u,desired,clear,time);
   if(u===actor)rows.push({sim:time,before,desired:clone(desired),result:clone(result),yieldTo:clone(u._yieldTo),avoidUntil:u._avoidCrowdUntil,blocked:[...new Set(u._crowdBlockedBy||[])].map(v=>v.id),goal:clone(u._nav?.goal),waypoint:clone(u._nav?.points?.[0]),navStalled:u._nav?.stalled,progress:clone(u._progress),goalProgress:clone(u._goalProgress)});
   return result;
  };
  g.stepToward=function(u,...args){const r=step.call(this,u,...args);if(u===actor){const row=rows.at(-1);if(row&&row.sim===this.time){row.after={x:u.x,y:u.y};row.status=r;row.manual=u.manualAttack;row.progressAfter=clone(u._progress);}}return r;};
 }
 g.applyDamage=function(t,a,s,...args){const hp=t.hp,r=apply.call(this,t,a,s,...args);if(t===target&&units.includes(s)&&t.hp<hp)hits.set(s.id,(hits.get(s.id)||0)+1);return r;};
 try{
  for(let i=0;i<1200;i++){
   g.time+=1/60;g.updateUnits(1/60);g.updateProjectiles(1/60);
   digest.update(JSON.stringify(units.map(u=>({id:u.id,x:u.x,y:u.y,hp:u.hp,state:u.state,manual:u.manualAttack,target:u.target?.id,nav:u._nav,progress:u._progress,yield:u._yieldTo,heading:u._heading})))+'\n');
  }
  return {digest:digest.digest('hex'),snapshot:g.snapshot(),hits:[...hits],rows};
 }finally{Crowd.prototype.steer=steer;}
}
const control=run(false),observed=run(true);
assert.equal(control.digest,observed.digest,'觀察器改變逐幀單位狀態');const {savedAt:controlSavedAt,...controlState}=control.snapshot;const {savedAt:observedSavedAt,...observedState}=observed.snapshot;assert.deepEqual(controlState,observedState,'除牆鐘保存時間外完整存檔不相等');assert.deepEqual(control.hits,observed.hits);
const rows=observed.rows;
for(const r of rows){if(r.after){const dx=r.after.x-r.before.x,dy=r.after.y-r.before.y,tx=r.desired.x-r.before.x,ty=r.desired.y-r.before.y;r.moved=Math.hypot(dx,dy);r.reverse=dx*tx+dy*ty< -1e-10;r.accepted=r.result!==null;}}
const summary={scope:'受控6混兵/.7，FRK、steppe、seed42、20模擬秒；受測程式以runtimeCrowdSha256辨識，不代表自然C36或採用新規則。',runtimeCrowdSha256,observerControlEqual:true,frameDigest:observed.digest,hits:observed.hits,actorId:25,actorHits:dictHit(observed.hits,25),steeringAttempts:rows.length,reverseMoves:rows.filter(r=>r.reverse).length,distance:rows.reduce((s,r)=>s+(r.moved||0),0),rows};
function dictHit(hits,id){return hits.find(x=>x[0]===id)?.[1]||0;}
fs.writeFileSync(out,JSON.stringify(summary,null,2)+'\n');console.log(JSON.stringify({...summary,rows:undefined}));
