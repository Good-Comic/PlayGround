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
