import assert from 'node:assert/strict';
import fs from 'node:fs';
import {findPath} from '../../../js/navigation.js';
import {findPath as reference} from '../../../tests/fixtures/navigation-reference-91d7a4e2.mjs';
const output=process.argv[2];if(!output||fs.existsSync(output))throw Error('fresh output required');
let cases=0;
const terrain=seed=>{let state=seed;const blocked=new Set();for(let i=0;i<40;i++){state=(Math.imul(state,1664525)+1013904223)>>>0;blocked.add((state%12)+','+((state>>>8)%12));}const walk=(x,y)=>x>=0&&y>=0&&x<12&&y<12&&!blocked.has(Math.floor(x)+','+Math.floor(y));return walk;};
for(const seed of [1,42,101,991])for(const range of [-1,0,.35,.8,1.4,3,5])for(const target of [{x:9.2,y:9.6},{x:3.7,y:4.3},{x:.8,y:.8}])for(const maxNodes of [1,10000]){
const args=[{x:1.1,y:1.2},target,terrain(seed),12,{range,maxNodes}];assert.deepEqual(findPath(...args),reference(...args));cases++;
}
// Exact, adjacent floating-point and clipped map boundary terminal distances.
for(const delta of [-1e-12,0,1e-12])for(const axis of ['x','y'])for(const sign of [-1,1]){
const start={x:2,y:2},target={x:2,y:2};target[axis]+=sign*(.8+delta);const walk=(x,y)=>x>=0&&y>=0&&x<8&&y<8;
const args=[start,target,walk,8,{range:.5,goalTest:p=>Math.hypot(p.x-target.x,p.y-target.y)<=.5}];assert.deepEqual(findPath(...args),reference(...args));cases++;
}
const walk=(x,y)=>{const r=(x-16)**2+(y-15)**2;return x>=0&&y>=0&&x<20&&y<20&&!(r>3.1**2&&r<3.6**2);};
const args=[{x:2,y:2},{x:16,y:15},walk,20,{range:3}];
const measure=fn=>{let hypot=0;const prior=Math.hypot;Math.hypot=(...args)=>{hypot++;return prior(...args);};let value;const start=performance.now();try{value=fn(...args);}finally{Math.hypot=prior;}return{hypot,ms:performance.now()-start,value};};
const old=measure(reference),candidate=measure(findPath);assert.deepEqual(candidate.value,old.value);assert.equal(old.value.status,'unreachable');assert.ok(candidate.hypot<old.hypot*.8,'same path with fewer distance calculations');
for(let i=0;i<10;i++){reference(...args);findPath(...args);}
const timings=[];for(const mode of ['before','after','after','before']){const fn=mode==='before'?reference:findPath,start=performance.now();for(let i=0;i<40;i++)assert.deepEqual(fn(...args),old.value);timings.push({mode,calls:40,ms:performance.now()-start});}
const r={timings,scope:'純尋路等效測試及單一不可達查詢的距離計算次數；不是遊戲FPS或自然戰役',cases:cases+1,exact:true,before:old,after:candidate};fs.writeFileSync(output,JSON.stringify(r,null,2)+'\n');console.log(JSON.stringify({cases:r.cases,before:old.hypot,after:candidate.hypot}));
