import test from 'node:test';
import assert from 'node:assert/strict';
import {Renderer,resourceVisualStage} from '../js/renderer.js';
const stages=[['rich',100],['low',50],['scarce',20]];
test('node stages derive from remaining stock without changing it',()=>{for(const [stage,amount] of stages){const n={amount,maxAmount:100};assert.equal(resourceVisualStage(n),stage);assert.deepEqual(n,{amount,maxAmount:100});}assert.equal(resourceVisualStage({}), 'rich')});
test('worked mines and bushes visibly differ by stock without touching gameplay',()=>{for(const kind of ['Gold','Stone','Berry']){const patterns=[];for(const [stage,amount] of stages){let calls=[];let ctx=new Proxy({},{get:(o,k)=>o[k]??((...a)=>calls.push([k,...a])),set:(o,k,v)=>(calls.push([k,v]),o[k]=v,true)});let renderer=Object.create(Renderer.prototype);renderer.ctx=ctx;let n={id:1,amount,maxAmount:100,scale:1,phase:0};const before=JSON.stringify(n);renderer['draw'+kind](n,{x:100,y:100},1,0);assert.equal(JSON.stringify(n),before);patterns.push(JSON.stringify(calls))}assert.notEqual(patterns[0],patterns[1],kind);if(kind!=='Stone')assert.notEqual(patterns[1],patterns[2],kind)}});
