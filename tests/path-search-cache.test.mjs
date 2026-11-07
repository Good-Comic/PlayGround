import test from 'node:test';
import assert from 'node:assert/strict';
import '../tools/qa/ram-pick-065e2912/node-dom-fixture.mjs';
import {Game} from '../js/game.js';
import {Crowd} from '../js/crowd.js';
import {stepToward as original} from './fixtures/step-toward-reference-41c8a7e2.mjs';

function fixture(seed){const g=new Game();g.newRun(seed,{civ:'FRK',biome:'steppe'});g.start();const u=g.units.find(u=>u.type==='militia');const ally=g.units.find(v=>v.type==='militia'&&v!==u);const foe=g.spawnUnit('militia',ally.x+1,ally.y,'enemy');ally.state='attack';ally.target=foe;g.crowd=new Crowd(g.units);u._avoidCrowdUntil=10;u._crowdBlockedBy=[ally];return{g,u};}
test('每次搜尋的靜態快取與圓形粗篩在36個原地圖查詢保持完整路徑/位移/雙RNG',()=>{
 for(const seed of[42,101])for(const[dx,dy]of[[5,3],[-5,3],[5,-3],[-5,-3],[0,5],[0,-5]])for(const range of[0,.8,1.4]){
  const a=fixture(seed),b=fixture(seed),x=a.g.world.base.x+dx,y=a.g.world.base.y+dy;for(const f of[a,b])f.u._nav={tx:x,ty:y,range,status:'pending',points:[],retryAt:0};
  const ra=a.g.stepToward(a.u,x,y,1/60,range),rb=original.call(b.g,b.u,x,y,1/60,range);
  assert.equal(ra,rb);assert.deepEqual(a.u._nav,b.u._nav);assert.equal(a.u.x,b.u.x);assert.equal(a.u.y,b.u.y);assert.deepEqual(a.u._progress,b.u._progress);assert.deepEqual(a.u._goalProgress,b.u._goalProgress);assert.equal(a.g.rng.state,b.g.rng.state);assert.equal(a.g.visualRng.state,b.g.visualRng.state);
 }
});
