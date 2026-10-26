import test from 'node:test';
import assert from 'node:assert/strict';

globalThis.document={documentElement:{dataset:{}},dispatchEvent(){}};
globalThis.window={innerWidth:1600,innerHeight:1000};
const {Game}=await import('../js/game.js');

function arena(){
  const game=new Game();
  game.units=[];game.buildings=[];game.world={size:50,resources:[],props:[],tile:()=>({terrain:'grass'})};
  game.camera={x:0,y:800,targetX:0,targetY:800,zoom:1,targetZoom:1};
  game.toast=()=>{};game.addParticles=()=>{};
  return game;
}

test('double-click helper selects only visible allied units of the clicked type',()=>{
  const game=arena();
  const first=game.spawnUnit('militia',25,25),second=game.spawnUnit('militia',26,25),other=game.spawnUnit('archer',25,26);
  const offscreen=game.spawnUnit('militia',49,49),enemy=game.spawnUnit('militia',24,25,'enemy');
  const point=game.screenPos(first.x,first.y);
  assert.equal(game.selectSameTypeOnScreen(point.x,point.y-18,1600,1000),true);
  assert.deepEqual(new Set(game.selection),new Set([first,second]));
  assert.ok(!game.selection.includes(other));assert.ok(!game.selection.includes(offscreen));assert.ok(!game.selection.includes(enemy));
});

test('same-type selection can add visible units without removing an existing selection',()=>{
  const game=arena(),archer=game.spawnUnit('archer',24,24),first=game.spawnUnit('militia',25,25),second=game.spawnUnit('militia',26,25);
  game.setSelection([archer]);const point=game.screenPos(first.x,first.y);
  assert.equal(game.selectSameTypeOnScreen(point.x,point.y-18,1600,1000,true),true);
  assert.deepEqual(new Set(game.selection),new Set([archer,first,second]));
});
