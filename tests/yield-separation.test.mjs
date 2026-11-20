import test from 'node:test';
import assert from 'node:assert/strict';
import {Crowd} from '../js/crowd.js';
import {UNIT_TYPES} from '../js/data.js';
function scene(gap){const anchor={id:7,alive:true,team:'player',state:'return',x:10,y:10,typeDef:UNIT_TYPES.militia,_heading:{x:0,y:1}},actor={id:21,alive:true,team:'player',state:'attack',x:10,y:10+gap,typeDef:UNIT_TYPES.spearman,_yieldTo:{id:7,priority:7,until:4,dx:0,dy:1.35}};return{anchor,actor,crowd:new Crowd([anchor,actor])};}
test('已分離到迎面讓路範圍外，舊租約不再令攻擊者倒退',()=>{for(const gap of[1.81,2,2.5]){const{actor,crowd}=scene(gap);const p=crowd.steer(actor,{x:actor.x,y:actor.y-.02},()=>true,.1);assert.equal(actor._yieldTo,null);assert.ok(p.y<actor.y);assert.equal(p.x,actor.x);}});
test('尚在迎面範圍內仍正常讓路，不縮短四秒上限',()=>{const{actor,crowd}=scene(1.35);const p=crowd.steer(actor,{x:actor.x,y:actor.y-.02},()=>true,.1);assert.equal(actor._yieldTo.id,7);assert.equal(actor._yieldTo.until,4.1);assert.ok(p.y>actor.y);});
test('釋放租約不允許越過靜態障礙',()=>{const{actor,crowd}=scene(2);assert.equal(crowd.steer(actor,{x:actor.x,y:actor.y-.02},()=>false,.1),null);assert.equal(actor._yieldTo,null);});
