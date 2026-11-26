import test from 'node:test';import assert from 'node:assert/strict';
import{pruneVisionCircles as before}from'../tools/qa/vision-axis-7a42d9b1/reference.mjs';
import{pruneVisionCircles as after}from'../js/vision-mask.js';
const dense=()=>Array.from({length:200},(_,i)=>({x:(i%10)*30,y:Math.floor(i/10)*30,radius:180}));
function measured(fn,c){const original=Math.hypot;let calls=0;Math.hypot=(...a)=>{calls++;return original(...a)};try{return{result:fn(c,4),calls};}finally{Math.hypot=original;}}
test('200個重疊圓保留清單不變，斜邊運算次數下降',()=>{const c=dense(),a=measured(before,c),b=measured(after,c);assert.deepEqual(b.result,a.result);assert.ok(b.calls<a.calls,`${b.calls} < ${a.calls}`);console.log(JSON.stringify({before:a.calls,after:b.calls,retained:b.result.length}));});
test('固定種子2000組與極大極小尺度的保留物件、順序及輸入均等價',()=>{let seed=42;const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);for(let k=0;k<2000;k++){const scale=[1e-300,1e-150,1e-6,1,1e6,1e150,1e300][k%7];const c=Array.from({length:8+k%21},(_,i)=>({x:(random()-.5)*600*scale,y:(random()-.5)*600*scale,radius:(20+random()*300)*scale,id:i}));const input=structuredClone(c),a=before(c,4*scale),b=after(c,4*scale);assert.deepEqual(b,a,`case ${k}`);assert.deepEqual(c,input);for(const x of b)assert.ok(c.includes(x));}});
test('相切、無效與溢位資料沿用原處理',()=>{for(const c of[[{x:0,y:0,radius:10},{x:20,y:0,radius:10}],[{x:NaN,y:0,radius:2}],[],[{x:1e308,y:-1e308,radius:1e308},{x:-1e308,y:1e308,radius:1e308}]])assert.deepEqual(after(c,1),before(c,1));});
