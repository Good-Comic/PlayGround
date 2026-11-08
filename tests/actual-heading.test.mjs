import test from 'node:test';
import assert from 'node:assert/strict';
import '../tools/qa/ram-pick-065e2912/node-dom-fixture.mjs';
import {Game} from '../js/game.js';
import {Crowd} from '../js/crowd.js';
function run(blocker=true){
 const g=new Game();g.newRun(42,{civ:'FRK',biome:'steppe'});g.start();g.units=[];g.buildings=[];g.hero=null;g.crowd=null;g.time=0;
 const actor=g.spawnUnit('militia',3,3);actor.state='move';if(blocker){const u=g.spawnUnit('militia',3.535,3);assert.equal(u.x,3.535,'原生生成不可自動挪位');u.state='hold';u.hold=true;u.stance='passive';}
 g.crowd=new Crowd(g.units);const start={x:actor.x,y:actor.y};const status=g.stepToward(actor,6,3,1/60);const dx=actor.x-start.x,dy=actor.y-start.y,step=Math.hypot(dx,dy);
 return {g,actor,status,start,dx,dy,step};
}
test('成功側移避碰後，交通方向反映實際位移而不是被拒絕的直走方向',()=>{
 const r=run();assert.equal(r.status,'moving');assert.ok(r.step>0);assert.ok(Math.abs(r.dy)>.001,'必須實際發生側移');assert.ok(Math.abs(r.actor._heading.x-r.dx/r.step)<1e-10);assert.ok(Math.abs(r.actor._heading.y-r.dy/r.step)<1e-10);
 const other=r.g.units[1];assert.ok(Math.hypot(r.actor.x-other.x,r.actor.y-other.y)>=r.actor.typeDef.radius+other.typeDef.radius-.015001);
});
test('沒有阻擋的直線移動保持方向、速度與原生通行規則',()=>{
 const r=run(false);assert.equal(r.status,'moving');assert.ok(r.dx>0);assert.equal(r.dy,0);assert.deepEqual(r.actor._heading,{x:1,y:0});assert.ok(Math.abs(r.step-r.g.unitSpeed(r.actor)/60)<1e-10);
});

test('第三名友軍以實際側移方向辨識迎面交通，而不是漏判已朝自己移動的單位',()=>{
 const r=run(),u=r.g.spawnUnit('militia',3.5,4);assert.equal(u.x,3.5);assert.equal(u.y,4);u.state='move';r.g.crowd.insert(u);
 const p=r.g.crowd.steer(u,{x:u.x-.4*.02,y:u.y-Math.sqrt(.84)*.02},()=>true,0);assert.ok(p);assert.equal(u._yieldTo?.id,r.actor.id);
});
