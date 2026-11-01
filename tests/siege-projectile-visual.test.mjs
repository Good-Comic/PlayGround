import test from 'node:test';
import assert from 'node:assert/strict';
import {Renderer} from '../js/renderer.js';
function draw(p){const calls=[];const ctx=new Proxy({},{get:(o,k)=>o[k]??((...a)=>calls.push([k,...a])),set:(o,k,v)=>(calls.push([k,v]),o[k]=v,true)});const r=Object.create(Renderer.prototype);r.ctx=ctx;r.screen=(_,x,y)=>({x,y});const before=JSON.stringify(p);r.drawProjectiles({camera:{zoom:1},projectiles:[p]},0);assert.equal(JSON.stringify(p),before);return calls}
test('siege shot uses stone geometry while ordinary arrows retain their shape',()=>{const p={x:1,y:2,tx:4,ty:5,source:{typeDef:{family:'S'}}};const siege=draw(p),arrow=draw({...p,source:{typeDef:{family:'R'}}}),old=draw({...p,source:null});assert.ok(siege.some(x=>x[0]==='fillStyle'&&x[1]==='#aaa28c'));assert.ok(!arrow.some(x=>x[0]==='fillStyle'&&x[1]==='#aaa28c'));assert.deepEqual(arrow,old)});
