import test from 'node:test';import assert from 'node:assert/strict';
import '../tools/qa/ram-pick-065e2912/node-dom-fixture.mjs';
import {Game} from '../js/game.js';import {Crowd} from '../js/crowd.js';
import {fixture} from '../tools/qa/stun-traffic-6a83d2f1/fixture.mjs';
const tick=g=>{g.time+=1/60;g.updateUnits(1/60);};
test('正式西班牙暈眩清除停止單位的過期朝向，後方同隊不再錯誤倒退讓行',()=>{
 const{g,leader,follower,attacker}=fixture(new Game());g.attackUnit(attacker,leader);const before={x:leader.x,y:leader.y,fx:follower.x,hp:attacker.hp,rng:g.rng.state,visual:g.visualRng.state};
 tick(g);assert.equal(leader.x,before.x);assert.equal(leader.y,before.y);assert.equal(leader._heading,null);assert.equal(leader._yieldTo,null);assert.equal(leader._trafficPriority,leader.id);assert.ok(follower.x>before.fx);assert.ok(!follower._yieldTo);assert.equal(attacker.hp,before.hp);assert.equal(g.rng.state,before.rng);assert.equal(g.visualRng.state,before.visual);
 assert.ok(Math.hypot(follower.x-leader.x,follower.y-leader.y)>=leader.typeDef.radius+follower.typeDef.radius-.015);
});
test('暈眩完整維持正式0.5秒並於到期恢復攻擊，不改村民八秒冷卻',()=>{
 const{g,leader,attacker}=fixture(new Game());g.attackUnit(attacker,leader);assert.equal(leader.slowUntil,10.5);assert.equal(attacker._stunCd,18);const hp=attacker.hp;for(let i=0;i<29;i++)tick(g);assert.equal(attacker.hp,hp);tick(g);assert.ok(attacker.hp<hp);
});
test('未暈眩的真實迎面行軍仍維持原讓行優先，不以清除全部交通規則通過',()=>{
 const{g,leader,follower}=fixture(new Game());g.crowd=new Crowd(g.units);g.navigationBudget=2;const before=follower.x;g.stepToward(follower,5,3,1/60);assert.ok(follower.x<before);assert.equal(follower._yieldTo.id,leader.id);
});
test('暫停不推進暈眩、位置或交通狀態',()=>{
 const{g,leader,attacker}=fixture(new Game());g.attackUnit(attacker,leader);g.paused=true;const before={time:g.time,x:leader.x,until:leader.slowUntil,heading:leader._heading};g.update(.25);assert.deepEqual({time:g.time,x:leader.x,until:leader.slowUntil,heading:leader._heading},before);
});
test('Save／Load與現場暈眩後首步及模擬RNG等效',()=>{
 const a=fixture(new Game());a.g.attackUnit(a.attacker,a.leader);const b=new Game();b.restore(JSON.parse(JSON.stringify(a.g.snapshot())));const follower=b.units.find(u=>u.id===a.follower.id);tick(a.g);tick(b);assert.equal(follower.x,a.follower.x);assert.equal(follower.y,a.follower.y);assert.equal(b.rng.state,a.g.rng.state);
});
