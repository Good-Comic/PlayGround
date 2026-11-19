import test from 'node:test';import assert from 'node:assert/strict';
import '../tools/qa/ram-pick-065e2912/node-dom-fixture.mjs';
import {Game} from '../js/game.js';import {fixture} from '../tools/qa/dense-trace-f2a67c90/fixture.mjs';
for(const options of [{n:10,spacing:.55},{mixed:true,n:6,spacing:.7}])test('被友軍占位的攻擊終點改走合法側翼 '+JSON.stringify(options),()=>{
 const{g,units,target}=fixture(new Game(),options),hitters=new Set();let maxPenetration=0;const damage=g.applyDamage;
 g.applyDamage=function(t,a,u,...args){const hp=t.hp,r=damage.call(this,t,a,u,...args);if(t===target&&t.hp<hp&&units.includes(u))hitters.add(u.id);return r;};
 for(let i=0;i<1200;i++){
  g.time+=1/60;g.updateUnits(1/60);g.updateProjectiles(1/60);
  for(let a=0;a<units.length;a++){
   assert.ok(g.isWalkable(units[a].x,units[a].y,units[a]),'不可穿過正式建築／地形');
   for(let b=a+1;b<units.length;b++)maxPenetration=Math.max(maxPenetration,units[a].typeDef.radius+units[b].typeDef.radius-Math.hypot(units[a].x-units[b].x,units[a].y-units[b].y));
  }
 }
 assert.equal(hitters.size,units.length,'每名受命單位須真正造成傷害');assert.ok(target.alive,'不能清除目標求通過');assert.ok(maxPenetration<=.015001,'保留原有掃掠碰撞容許值');assert.ok(units.every(u=>u.manualAttack&&u.target===target&&!u.orderFailure),'手動目標保持，不以取消指令假稱完成');
});
test('受阻中Save／Load後沿正式命令重新接敵，保持目標與碰撞',()=>{
 const initial=fixture(new Game(),{mixed:true,n:6,spacing:.7});
 for(let i=0;i<213;i++){initial.g.time+=1/60;initial.g.updateUnits(1/60);initial.g.updateProjectiles(1/60);}
 const saved=initial.g.snapshot(),ids=initial.units.map(u=>u.id),targetId=initial.target.id;
 const g=new Game();g.restore(saved);g.start();const units=ids.map(id=>g.units.find(u=>u.id===id)),target=g.buildings.find(b=>b.id===targetId),hits=new Set();assert.ok(target?.alive);assert.ok(units.every(u=>u.manualAttack&&u.target===target));
 const damage=g.applyDamage;g.applyDamage=function(t,a,u,...args){const hp=t.hp,r=damage.call(this,t,a,u,...args);if(t===target&&hp>t.hp&&units.includes(u))hits.add(u.id);return r;};
 for(let i=0;i<1200;i++){g.time+=1/60;g.updateUnits(1/60);g.updateProjectiles(1/60);for(let a=0;a<units.length;a++)for(let b=a+1;b<units.length;b++)assert.ok(Math.hypot(units[a].x-units[b].x,units[a].y-units[b].y)>=units[a].typeDef.radius+units[b].typeDef.radius-.015001);}
 assert.equal(hits.size,units.length);assert.ok(units.every(u=>u.manualAttack&&u.target===target&&!u.orderFailure));
});
