import test from 'node:test';
import assert from 'node:assert/strict';
import {Renderer} from '../js/renderer.js';
function render(building){const calls=[];const ctx=new Proxy({}, {get:(o,k)=>o[k]??((...a)=>calls.push([k,...a])),set:(o,k,v)=>(calls.push([k,v]),o[k]=v,true)});const r=Object.create(Renderer.prototype);r.ctx=ctx;r.screen=()=>({x:100,y:100});r.drawProductionIndicator(building,{camera:{zoom:1}});return calls;}
const b={team:'player',alive:true,construction:1,x:1,y:1,w:2,h:2,type:'barracks',queue:[{total:10,remaining:5},{total:10,remaining:10}]};
test('production cue reads progress and queue count without mutating simulation',()=>{const before=JSON.stringify(b),c=render(b);assert.deepEqual(c.filter(x=>x[0]==='fillRect').map(x=>x.slice(1)),[[81,30,38,6],[82,31,18,4],[82,27,3,2],[87,27,3,2]]);assert.equal(JSON.stringify(b),before)});
test('blocked cue appears only for player completed buildings with paid production',()=>{const c=render({...b,queue:[{total:10,remaining:0}]});assert.ok(c.some(x=>x[0]==='fillStyle'&&x[1]==='#df6857'));assert.equal(c.filter(x=>x[0]==='lineTo').length,2);for(const x of [{...b,team:'enemy'},{...b,alive:false},{...b,construction:.5},{...b,queue:[]},{...b,queue:[{remaining:2,total:0}]}])assert.deepEqual(render(x),[])});
