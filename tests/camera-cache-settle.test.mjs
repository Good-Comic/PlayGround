import test from 'node:test';
import assert from 'node:assert/strict';
import '../tools/qa/ram-pick-065e2912/node-dom-fixture.mjs';
import {Game} from '../js/game.js';
import {updateCamera as reference} from './fixtures/camera-reference-79c41e2a.mjs';

function fixture(){const g=new Game();g.newRun(1116648138,{civ:'FRK',biome:'steppe'});g.start();g.heroControl=false;g.keys.clear();return g;}
function paired(camera){const a=fixture(),b=fixture();Object.assign(a.camera,camera);Object.assign(b.camera,camera);return {a,b};}
const state=g=>{const s=g.snapshot();delete s.camera;delete s.savedAt;return s;};

test('停止輸入後相機可精確收斂，地形key不再持續改變',()=>{
 for(const fps of [10,30,60,144]){const g=fixture();Object.assign(g.camera,{x:0,y:0,targetX:200,targetY:300,zoom:.7,targetZoom:1.12});for(let i=0;i<fps*4;i++)g.updateCamera(1/fps);assert.equal(g.camera.x,g.camera.targetX);assert.equal(g.camera.y,g.camera.targetY);assert.equal(g.camera.zoom,g.camera.targetZoom);const frozen={...g.camera};for(let i=0;i<60;i++)g.updateCamera(1/fps);assert.deepEqual(g.camera,frozen);}
});
test('仍可見的大幅移動與縮放保留原始插值與速度',()=>{
 const {a,b}=paired({x:0,y:0,targetX:200,targetY:300,zoom:.7,targetZoom:1.12});a.updateCamera(.016);reference.call(b,.016);assert.deepEqual(a.camera,b.camera);
});
test('僅在既定CSS像素尾差內貼齊，dt=0維持原座標',()=>{
 const {a,b}=paired({x:100.000001,y:200.000001,targetX:100,targetY:200,zoom:1.000000001,targetZoom:1});const frozen={...a.camera};a.updateCamera(0);assert.deepEqual(a.camera,frozen);a.updateCamera(.016);reference.call(b,.016);assert.equal(a.camera.x,100);assert.equal(a.camera.y,200);assert.equal(a.camera.zoom,1);assert.ok(Math.abs(a.camera.x-b.camera.x)*a.camera.zoom<.01);assert.ok(Math.abs(a.camera.y-b.camera.y)*a.camera.zoom<.01);assert.ok(Math.abs(a.camera.zoom-b.camera.zoom)*a.world.size*64<.01);
});
test('持續按鍵與英雄追蹤仍更新目標，不被尾差收斂鎖住',()=>{
 for(const key of ['a','d','w','s']){const {a,b}=paired({x:100,y:200,targetX:100,targetY:200,zoom:1,targetZoom:1});a.keys.add(key);b.keys.add(key);a.updateCamera(.1);reference.call(b,.1);assert.deepEqual(a.camera,b.camera);}
 const {a,b}=paired({x:0,y:0,targetX:0,targetY:0,zoom:1,targetZoom:1});a.heroControl=b.heroControl=true;a.updateCamera(.1);reference.call(b,.1);assert.deepEqual(a.camera,b.camera);
});
test('四種視窗與縮放下screenPos／worldAt互逆',()=>{
 const width=window.innerWidth,height=window.innerHeight;try{for(const [w,h]of [[1280,720],[1440,900],[1920,1080],[2560,1440]])for(const zoom of [.55,1,1.6]){window.innerWidth=w;window.innerHeight=h;const g=fixture();Object.assign(g.camera,{x:100.00001,y:200.00001,targetX:100,targetY:200,zoom:zoom+1e-9,targetZoom:zoom});g.updateCamera(.1);for(const [x,y]of [[5,7],[25,30],[45,47]]){const p=g.screenPos(x,y),q=g.worldAt(p.x,p.y);assert.ok(Math.abs(x-q.x)<1e-10);assert.ok(Math.abs(y-q.y)<1e-10);}}}finally{window.innerWidth=width;window.innerHeight=height;}
});
test('相機收斂不改模擬、單位、資源、時間或雙RNG',()=>{
 const g=fixture();const before=state(g),rng=g.rng.state,visual=g.visualRng.state;g.camera.x+=100;g.camera.y+=100;g.camera.zoom=.7;for(let i=0;i<240;i++)g.updateCamera(1/60);assert.deepEqual(state(g),before);assert.equal(g.rng.state,rng);assert.equal(g.visualRng.state,visual);
});
test('原生Save／Load恢復後仍能收斂且不更動遊戲狀態',()=>{
 const a=fixture();a.camera.x+=100;const b=new Game();b.restore(a.snapshot());const before=state(b);for(let i=0;i<240;i++)b.updateCamera(1/60);assert.equal(b.camera.x,b.camera.targetX);assert.equal(b.camera.y,b.camera.targetY);assert.equal(b.camera.zoom,b.camera.targetZoom);assert.deepEqual(state(b),before);
});
