import test from 'node:test';
import assert from 'node:assert/strict';
globalThis.document={documentElement:{dataset:{}},dispatchEvent(){}};
const {Game}=await import('../js/game.js');
function scene(){const g=new Game();g.newRun(42,{civ:'TEU',biome:'dune'});g.inMenu=false;return g}
function advance(g,n){for(let i=0;i<n;i++)g.update(.05)}
test('沙暴使用模擬時間並結束 / sandstorm expires on simulation time',()=>{const g=scene();g.executeSandstorm();assert.equal(g.effects.sandstorm,20);advance(g,100);assert.ok(Math.abs(g.effects.sandstorm-15)<1e-8);advance(g,301);assert.equal(g.effects.sandstorm,0)});
test('暫停與選卡不減少剩餘時間 / pause and boon freeze remaining time',()=>{const g=scene();g.executeSandstorm();g.paused=true;advance(g,500);assert.equal(g.effects.sandstorm,20);g.paused=false;g.phase='boon';advance(g,500);assert.equal(g.effects.sandstorm,20);g.phase='prep';advance(g,20);assert.ok(Math.abs(g.effects.sandstorm-19)<1e-8)});
test('讀檔延續剩餘時間 / save load preserves remaining time',()=>{const g=scene();g.executeSandstorm();advance(g,80);const h=new Game();h.restore(JSON.parse(JSON.stringify(g.snapshot())));assert.equal(h.effects.sandstorm,g.effects.sandstorm);h.inMenu=false;h.paused=false;advance(h,20);assert.ok(Math.abs(h.effects.sandstorm-15)<1e-8)});
test('重複事件沒有過期現實計時器 / repeated events have no stale wall timer',()=>{const g=scene();const old=globalThis.setTimeout;let timers=0;globalThis.setTimeout=()=>{timers++;return 0};try{g.executeSandstorm();advance(g,200);g.executeSandstorm();advance(g,201);assert.ok(g.effects.sandstorm>9);assert.equal(timers,0)}finally{globalThis.setTimeout=old}});
test('觸發不消耗RNG且不改其他事件 / trigger preserves RNG and other effects',()=>{const g=scene();g.effects.sidewind=7;g.effects.flood=4;const before=g.snapshot();g.executeSandstorm();const after=g.snapshot();assert.deepEqual(after.rng,before.rng);assert.equal(g.effects.sidewind,7);assert.equal(g.effects.flood,4);assert.equal(g.time,before.time)});
