import test from 'node:test';
import assert from 'node:assert/strict';
import { Renderer } from '../js/renderer.js';
function drawing(type){const calls=[];const ctx=new Proxy({},{get:(o,k)=>o[k]??((...a)=>calls.push([k,...a])),set:(o,k,v)=>(calls.push([k,v]),o[k]=v,true)});const r=Object.create(Renderer.prototype);r.ctx=ctx;const u={carry:5,carryType:type};let before=JSON.stringify(u);r.drawVillagerCargo(u,{x:20,y:30},1,0);assert.equal(JSON.stringify(u),before);return JSON.stringify(calls)}
test('four cargo types have distinct outlines and drawing does not mutate resource state',()=>{assert.equal(new Set(['food','wood','stone','gold'].map(drawing)).size,4)});
