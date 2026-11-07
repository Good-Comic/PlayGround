import test from 'node:test';
import assert from 'node:assert/strict';
import {findPath} from '../js/navigation.js';
import {findPath as original} from './fixtures/navigation-reference-41c8a7e2.mjs';

function terrain(seed,sealed=false){
 let state=seed>>>0;const blocked=new Set();for(let i=0;i<90;i++){state=(Math.imul(state,1664525)+1013904223)>>>0;const x=2+state%16;state=(Math.imul(state,1664525)+1013904223)>>>0;blocked.add(x+','+(2+state%16));}
 const walk=(x,y)=>{if(x<.25||y<.25||x>19.75||y>19.75)return false;if(sealed&&((x>=13&&x<=17&&(Math.abs(y-13)<.3||Math.abs(y-17)<.3))||(y>=13&&y<=17&&(Math.abs(x-13)<.3||Math.abs(x-17)<.3))))return false;return sealed||!blocked.has(Math.floor(x)+','+Math.floor(y));};
 walk.segment=(a,b)=>{const n=Math.max(1,Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)/.1));for(let i=1;i<=n;i++)if(!walk(a.x+(b.x-a.x)*i/n,a.y+(b.y-a.y)*i/n))return false;return true;};return walk;
}
test('端點粗篩在56組範圍/地形/目標下與原路徑逐項相同',()=>{
 for(const seed of [1,42,101,991])for(const range of [-1,0,.35,.8,1.4,3,5])for(const target of [{x:15.2,y:15.6},{x:3.7,y:4.3}]){const walk=terrain(seed),args=[{x:1.1,y:1.2},target,walk,20,{range}];assert.deepEqual(findPath(...args),original(...args),JSON.stringify({seed,range,target}));}
});
test('無法抵達的互動目標仍完整搜尋並保留相同失敗分類/展開數',()=>{
 const args=[{x:2,y:2},{x:15,y:15},terrain(1,true),20,{range:.35}],a=findPath(...args),b=original(...args);assert.deepEqual(a,b);assert.equal(a.status,'unreachable');assert.ok(a.expanded>400);
});
test('建築型goalTest及接近端點門檻的路徑保持原結果',()=>{
 for(const target of [{x:4.2,y:3.5},{x:10.1,y:9.3}]){const walk=terrain(7,true),goalTest=p=>Math.hypot(Math.max(target.x-1-p.x,0,p.x-target.x-1),Math.max(target.y-1-p.y,0,p.y-target.y-1))<=.7;const args=[{x:1.5,y:1.5},target,walk,20,{range:2.2,goalTest}];assert.deepEqual(findPath(...args),original(...args));}
});
