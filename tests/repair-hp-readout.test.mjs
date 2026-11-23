import '../tools/qa/ram-pick-065e2912/node-dom-fixture.mjs';
import test from 'node:test';import assert from 'node:assert/strict';
import { Game } from '../js/game.js';import { formatRepairHp } from '../js/utils.js';
test('維修文字去除浮點長尾，小於0.01仍標示正數，整數不添零',()=>{assert.equal(formatRepairHp(13.949999999999818),'13.95');assert.equal(formatRepairHp(30),'30');assert.equal(formatRepairHp(.004),'<0.01');assert.equal(formatRepairHp(0),'0');});
test('顯示取整不改真實HP、費用、模擬時間或RNG',()=>{const g=new Game();g.newRun(42,{civ:'FRK'});const core=g.getTownCenter();core.hp=2986.05;g.resources.wood=100;const plan=g.repairPlan(core),rng=g.rng.state,time=g.time;let text;g.addFloating=(x,y,value)=>text=value;g.repairBuilding(core);assert.equal(text,'+13.95HP');assert.equal(core.hp,3000);assert.equal(g.resources.wood,100-plan.wood);assert.equal(plan.hp,13.949999999999818);assert.equal(g.rng.state,rng);assert.equal(g.time,time);});
