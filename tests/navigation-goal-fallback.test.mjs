import test from 'node:test';
import assert from 'node:assert/strict';
import {findPath,segmentClear} from '../js/navigation.js';
function corridor(){const f=(x,y)=>Math.abs(x-4)<.001&&y>=1&&y<=4;f.segment=(a,b)=>f(a.x,a.y)&&f(b.x,b.y);return f;}
test('互動端點取樣全部錯過時，仍可走到合法半格目標區域',()=>{
 const walk=corridor(),target={x:4.1,y:4.1},r=findPath({x:4,y:1},target,walk,10,{range:.6});
 assert.equal(r.status,'ready');assert.ok(Math.hypot(r.goal.x-target.x,r.goal.y-target.y)<=.6);
 for(let i=1;i<r.points.length;i++)assert.ok(segmentClear(walk,r.points[i-1],r.points[i]));
});
test('自訂goalTest的正式到達判定不應被輔助圓形取樣否決',()=>{
 const walk=corridor(),goal=p=>p.x===4&&p.y===4,r=findPath({x:4,y:1},{x:4.1,y:4.1},walk,10,{range:.6,goalTest:goal});assert.equal(r.status,'ready');assert.ok(goal(r.goal));
});
test('沒有任何合法目標節點時，仍快速回報不可達，不展開整張地圖',()=>{
 const r=findPath({x:1,y:1},{x:4.1,y:4.1},(x,y)=>x<2,10,{range:.6});assert.equal(r.status,'unreachable');assert.equal(r.expanded,0);
});
test('存在目標節點但路段被阻隔，不能跳過碰撞連接',()=>{
 const f=corridor();f.segment=(a,b)=>f(a.x,a.y)&&f(b.x,b.y)&&!(Math.min(a.y,b.y)<2.25&&Math.max(a.y,b.y)>2.25);const r=findPath({x:4,y:1},{x:4.1,y:4.1},f,10,{range:.6});assert.equal(r.status,'unreachable');
});
test('fallback仍遵守原搜尋預算，不直接傳送到合法目標',()=>{
 const r=findPath({x:4,y:1},{x:4.1,y:4.1},corridor(),10,{range:.6,maxNodes:0});assert.equal(r.status,'budget_exhausted');assert.equal(r.expanded,0);assert.equal(r.points.length,0);
});

test('正式目標外框可限制回退檢查，不改合法終點',()=>{
 const r=findPath({x:4,y:1},{x:4.1,y:4.1},corridor(),50,{range:.6,goalTest:p=>p.x===4&&p.y===4,goalBounds:{left:4,right:4,top:4,bottom:4}});assert.equal(r.status,'ready');assert.deepEqual(r.goal,{x:4,y:4});
});
test('封閉目標有外框時只檢查局部網格，仍不展開A星',()=>{
 let calls=0;const r=findPath({x:1,y:1},{x:40,y:40},()=>false,50,{range:.6,goalTest:()=>{calls++;return true;},goalBounds:{left:39,right:41,top:39,bottom:41}});assert.equal(r.status,'unreachable');assert.equal(r.expanded,0);assert.ok(calls<=25);
});
test('任意goalTest未提供外框時，不擅自假定目標必在圓形範圍內',()=>{
 const r=findPath({x:4,y:1},{x:4.1,y:4.1},corridor(),10,{range:.6,goalTest:p=>p.x===4&&p.y===1});assert.equal(r.status,'ready');assert.deepEqual(r.goal,{x:4,y:1});
});
