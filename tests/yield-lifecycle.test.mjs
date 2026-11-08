import test from 'node:test';import assert from 'node:assert/strict';
import {Crowd}from'../js/crowd.js';import{UNIT_TYPES}from'../js/data.js';
function scene(){const low={id:1,alive:true,team:'player',state:'move',x:4,y:3,typeDef:UNIT_TYPES.militia,_heading:{x:-1,y:0}},high={id:2,alive:true,team:'player',state:'move',x:3,y:3,typeDef:UNIT_TYPES.militia};const crowd=new Crowd([low,high]);crowd.steer(high,{x:3.02,y:3},()=>true,0);assert.equal(high._yieldTo.id,low.id);return{low,high,crowd};}
test('對向單位轉向離開後，不繼續執行已失效的讓行',()=>{const{low,high,crowd}=scene();low._heading={x:1,y:0};const p=crowd.steer(high,{x:3.02,y:3},()=>true,.1);assert.ok(p.x>3);assert.equal(p.y,3);assert.equal(high._yieldTo,null);});
test('對向單位停下後，舊讓行不讓本單位持續倒退',()=>{const{low,high,crowd}=scene();low.state='hold';low._heading=null;const p=crowd.steer(high,{x:3.02,y:3},()=>true,.1);assert.ok(p.x>3);assert.equal(high._yieldTo,null);});
test('真正迎面尚未通過時仍讓行，原四秒最大租約不變',()=>{const{low,high,crowd}=scene();crowd.steer(high,{x:3.02,y:3},()=>true,.1);assert.equal(high._yieldTo.id,low.id);assert.equal(high._yieldTo.until,4.1);});
test('附近車隊傳遞仍在接近的來源讓行時，不取消合法傳遞',()=>{const{low,high}=scene();high.x=2.8;high._heading={x:1,y:0};const follower={id:3,alive:true,team:'player',state:'move',x:2,y:3,typeDef:UNIT_TYPES.militia};const crowd=new Crowd([low,high,follower]);crowd.steer(follower,{x:2.02,y:3},()=>true,.1);assert.equal(follower._yieldTo.id,low.id);});
test('靜態或身體無法通行時，取消過期讓行也不能穿越',()=>{const{low,high,crowd}=scene();low._heading=null;assert.equal(crowd.steer(high,{x:3.02,y:3},()=>false,.1),null);});
