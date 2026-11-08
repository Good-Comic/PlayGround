import test from 'node:test';
import assert from 'node:assert/strict';
import {Crowd} from '../js/crowd.js';
import {UNIT_TYPES} from '../js/data.js';
function fixture(apart=false,enemy=false){
 const low={id:1,alive:true,team:'player',state:'move',x:apart?3:4,y:3,typeDef:UNIT_TYPES.militia,_heading:{x:-1,y:0}};
 const high={id:2,alive:true,team:enemy?'enemy':'player',state:'move',x:apart?4:3,y:3,typeDef:UNIT_TYPES.militia};
 if(enemy){low.target=high;high.target=low;}
 return {low,high,crowd:new Crowd([low,high])};
}
test('相反朝向但正在遠離時，不應被視為迎面來車而無故偏航',()=>{
 const{high,crowd}=fixture(true);const p=crowd.steer(high,{x:high.x+.02,y:high.y},()=>true,0);
 assert.ok(p);assert.equal(p.y,high.y);assert.ok(p.x>high.x);assert.ok(!high._yieldTo);
});
test('真正互相靠近的友軍仍由高ID讓行，沒有取消交通規則',()=>{
 const{low,high,crowd}=fixture();const p=crowd.steer(high,{x:high.x+.02,y:high.y},()=>true,0);
 assert.ok(p);assert.equal(high._yieldTo.id,low.id);assert.ok(p.x<high.x);
});
test('正在交戰的對手不獲交通通行權，仍保留硬碰撞',()=>{
 const{high,crowd}=fixture(false,true);const p=crowd.steer(high,{x:high.x+.02,y:high.y},()=>true,0);
 assert.ok(p);assert.ok(p.x>high.x);assert.ok(!high._yieldTo);
});
test('沒有合法靜態路段時仍拒絕移動',()=>{
 const{high,crowd}=fixture(true);assert.equal(crowd.steer(high,{x:high.x+.02,y:high.y},()=>false,0),null);
});
