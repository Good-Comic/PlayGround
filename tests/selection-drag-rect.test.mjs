import test from 'node:test';
import assert from 'node:assert/strict';
import {selectionDragRect} from '../js/utils.js';
test('selection rectangle follows pointer across both sides of its fixed origin',()=>{
 const start=[100,100];
 for(const [x,y,expected] of [[40,30,{x:40,y:30,w:60,h:70}],[160,170,{x:100,y:100,w:60,h:70}],[40,170,{x:40,y:100,w:60,h:70}],[160,30,{x:100,y:30,w:60,h:70}],[100,100,{x:100,y:100,w:0,h:0}]]) assert.deepEqual(selectionDragRect(...start,x,y),expected);
});
