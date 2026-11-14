import test from 'node:test';import assert from 'node:assert/strict';
import '../tools/qa/ram-pick-065e2912/node-dom-fixture.mjs';
import {Game}from'../js/game.js';import{UNIT_TYPES}from'../js/data.js';
import{segmentWalkable as reference}from'./fixtures/static-sweep-reference-4d72b1c9.mjs';
function compare(g,a,b,u,callback){const expected=reference.call(g,a,b,u,callback),actual=g.segmentWalkable(a,b,u,callback);assert.equal(actual,expected,JSON.stringify({a,b,radius:u?.typeDef?.radius,team:u?.team}));return actual;}
test('四個原生地圖種子、雙方及正式兵種半徑的16000條線段與凍結實作相同',()=>{
 let checks=0,state=123456789;const rand=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};
 for(const seed of[1,42,1116648138,991]){const g=new Game();g.newRun(seed,{civ:'FRK',biome:'steppe'});g.start();const rng=g.rng.state,visual=g.visualRng.state;for(const team of['player','enemy'])for(const type of['militia','spearman','knight','ram']){const typeDef=UNIT_TYPES[type];assert.ok(typeDef);const u={team,typeDef};for(let i=0;i<500;i++){const a={x:rand()*g.world.size,y:rand()*g.world.size},b=i%5?{x:a.x+(rand()-.5)*1.5,y:a.y+(rand()-.5)*1.5}:{x:rand()*g.world.size,y:rand()*g.world.size};compare(g,a,b,u);checks++;}}assert.equal(g.rng.state,rng);assert.equal(g.visualRng.state,visual);}assert.equal(checks,16000);
});
test('零長度、正反向、貼邊與極近切線仍使用原始最終門檻',()=>{
 const g=new Game();g.newRun(42,{civ:'FRK',biome:'steppe'});g.start();g.buildings=[];g.world.resources=[{id:1,kind:'oak',alive:true,x:10,y:10}];
 for(const radius of[0,.12,.24,.26,.44,.9]){const u={team:'player',typeDef:{radius}},r=radius+.22;for(const delta of[-1e-8,-1e-12,0,1e-12,1e-8]){const a={x:9,y:10+r+delta},b={x:11,y:a.y};compare(g,a,b,u,()=>true);compare(g,b,a,u,()=>true);compare(g,a,a,u,()=>true);}assert.equal(compare(g,{x:9,y:10},{x:11,y:10},u,()=>true),false);}
});
test('森林死亡／再生與資源種類變化立即反映，不使用過期快取',()=>{
 const g=new Game();g.newRun(42,{civ:'FRK',biome:'steppe'});g.start();g.buildings=[];const n={id:1,kind:'oak',alive:false,x:10,y:10};g.world.resources=[n];const a={x:9,y:10},b={x:11,y:10},u={team:'player',typeDef:UNIT_TYPES.militia};assert.equal(compare(g,a,b,u,()=>true),true);n.alive=true;assert.equal(compare(g,a,b,u,()=>true),false);n.kind='pine';assert.equal(compare(g,a,b,u,()=>true),false);n.kind='gold';assert.equal(compare(g,a,b,u,()=>true),true);
});
test('端點快取回呼仍只呼叫一次並保留立即拒絕語意',()=>{
 const g=new Game();g.newRun(42,{civ:'FRK',biome:'steppe'});g.start();let calls=0;assert.equal(g.segmentWalkable({x:3,y:3},{x:4,y:3},null,()=>{calls++;return false;}),false);assert.equal(calls,1);
});
