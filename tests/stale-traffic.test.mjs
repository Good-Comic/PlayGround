import test from 'node:test';
import assert from 'node:assert/strict';
import '../tools/qa/ram-pick-065e2912/node-dom-fixture.mjs';
import {Game} from '../js/game.js';
import {defenseClickPoint} from '../js/core-defense.js';
function fixture(){
 const g=new Game();g.newRun(42,{civ:'FRK',biome:'steppe'});g.start();g.units=[];g.buildings=[];g.hero=null;g.crowd=null;g.time=0;
 const archer=g.spawnUnit('archer',3,3),actor=g.spawnUnit('militia',1.8,3),target=g.addBuilding('house',6,2,true);target.team='enemy';actor.state='hold';actor.hold=true;actor.stance='passive';
 g.stepToward(archer,2.4,3,.05);assert.ok(archer._heading.x<0,'先以真實移動建立相反朝向');
 const pt=defenseClickPoint(g,target);g.setSelection([archer]);g.issueCommand(pt.x,pt.y);assert.equal(archer.target,target);assert.ok(g.distanceTo(archer,target)<g.unitRange(archer)-.1);
 return {g,archer,actor};
}
test('已停止並在射程內射擊的友軍不保留舊移動朝向，使後方單位誤讓行倒退',()=>{
 const {g,archer,actor}=fixture();const origin={x:archer.x,y:archer.y};g.time+=1/60;g.updateUnits(1/60);
 assert.equal(archer.x,origin.x);assert.equal(archer.y,origin.y);assert.equal(archer._heading,null);
 const next=g.crowd.steer(actor,{x:actor.x+.02,y:actor.y},()=>true,g.time);assert.ok(next);assert.ok(next.x>actor.x,'無接觸時應向前，而非對靜止友軍倒退讓行');assert.ok(!actor._yieldTo);
});
test('真正在移動的單位仍保留朝向與合法交通讓行資料',()=>{
 const {g,archer,actor}=fixture();g.setSelection([archer]);const pt=g.screenPos(2,2);g.issueCommand(pt.x,pt.y);g.time+=1/60;g.updateUnits(1/60);assert.ok(archer._heading);assert.ok(archer._movementAttempted);
});
