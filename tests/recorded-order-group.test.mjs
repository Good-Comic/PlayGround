import test from 'node:test';
import assert from 'node:assert/strict';
import '../tools/qa/ram-pick-065e2912/node-dom-fixture.mjs';
import { Game } from '../js/game.js';
import { battleArmy } from '../js/battle-actions.js';
import { recordedOrderActors, selectRecordedOrderGroup } from '../js/recorded-order-group.js';
import { t, hasKey } from '../js/i18n.js';
const fresh = () => { const g = new Game(); g.newRun(42, { civ: 'CHN' }); g.start(); return g; };
const setup = () => { const g = fresh(), army = battleArmy(g); army[0].orderFailure = 'congested'; army[1].orderFailure = 'unreachable'; g.setSelection([...g.units]); return {g, army}; };
const state = g => JSON.stringify({ snapshot:(( {savedAt,selection,...rest})=>rest)(g.snapshot()), rng:g.rng.state, visual:g.visualRng.state, time:g.time, units:g.units.map(u=>({id:u.id,hp:u.hp,cooldown:u.cooldown,state:u.state,target:u.target?.id,manualAttack:u.manualAttack,orderFailure:u.orderFailure})), resources:g.resources, heroControl:g.heroControl, orderMode:g.orderMode });
test('CONTROLLED_FIXTURE：僅選取內存活正式戰士已知記錄', () => {
  const {g,army}=setup();
  for (const u of g.units.filter(u=>!army.includes(u))) u.orderFailure='congested';
  const dead={...army[0],alive:false}, removed={...army[0]}, unknown={...army[0],orderFailure:'other'};
  g.units.push(dead,unknown);g.selection.push(dead,removed,unknown,army[0]);
  assert.deepEqual(recordedOrderActors(g), army.slice(0,2));
  army[0].state='attack';army[0].manualAttack=false;
  assert.ok(recordedOrderActors(g).includes(army[0]));
  g.setSelection([]);assert.deepEqual(recordedOrderActors(g),[]);
});
test('CONTROLLED_FIXTURE：重讀零遊戲狀態副作用，選組只有setSelection', () => {
  const {g,army}=setup(), before=state(g);
  for(let i=0;i<200;i++) recordedOrderActors(g);
  assert.equal(state(g),before);
  let selections=0;const original=g.setSelection.bind(g);g.setSelection=list=>{selections++;original(list);};
  for(const method of ['command','commandMove','focusAt','toggleHeroControl'])g[method]=()=>assert.fail(method);
  assert.equal(selectRecordedOrderGroup(g),true);assert.equal(selections,1);
  assert.deepEqual(g.selection,army.slice(0,2));assert.equal(state(g),before);
});
test('CONTROLLED_FIXTURE：點擊交集、死亡、移除及新世界不選舊人', () => {
  const {g,army}=setup(), group=recordedOrderActors(g), world=g.world;
  g.setSelection([army[1]]);assert.equal(selectRecordedOrderGroup(g,group,world),true);assert.deepEqual(g.selection,[army[1]]);
  army[1].alive=false;assert.equal(selectRecordedOrderGroup(g,group,world),false);
  g.setSelection([army[0]]);g.units=g.units.filter(u=>u!==army[0]);assert.equal(selectRecordedOrderGroup(g,group,world),false);
  g.newRun(42,{civ:'CHN'});g.start();assert.equal(selectRecordedOrderGroup(g,group,world),false);
});
test('CONTROLLED_FIXTURE：阻擋及英雄直控不變更', () => {
  for(const kind of ['paused','inMenu','placement','heroControl','orderMode','blocked','phase']){
    const {g}=setup();if(kind==='phase')g.phase='boon';else if(kind!=='blocked')g[kind]=true;
    const selection=g.selection;assert.equal(selectRecordedOrderGroup(g,undefined,g.world,kind==='blocked'),false,kind);assert.equal(g.selection,selection);
    if(kind==='heroControl')assert.equal(g.heroControl,true);
  }
});
test('CONTROLLED_FIXTURE：後續原生移動與直接選組一致', () => {
  const a=setup(),b=setup();selectRecordedOrderGroup(a.g);b.g.setSelection(b.army.slice(0,2));
  for(const {g}of[a,b])g.commandMove(g.selection,g.world.base.x+3,g.world.base.y+3);
  assert.equal(state(a.g),state(b.g));assert.ok(a.g.selection.every(u=>u.orderFailure===null));
});
test('四語歷史文案key齊備', () => {
  for(const locale of ['en','zh-Hant','zh-Hans','ja'])for(const key of ['title','count','select','history','details','reasons','current'])assert.equal(hasKey(locale,'recordedOrder.'+key),true);
  assert.match(t('recordedOrder.history'),/Retained|保留|保存/);
});
test('CONTROLLED_FIXTURE：原生snapshot/restore不選舊世界、不合成記錄', () => {
  const {g}=setup(), group=recordedOrderActors(g), world=g.world, snapshot=g.snapshot();
  g.restore(snapshot);
  assert.notEqual(g.world,world);
  assert.ok(g.selection.every(u=>!group.includes(u)));
  assert.equal(selectRecordedOrderGroup(g,group,world),false);
  const savedRecords=(snapshot.units||[]).filter(u=>['congested','unreachable'].includes(u.orderFailure));
  assert.equal(savedRecords.length,0);
  assert.deepEqual(recordedOrderActors(g),[]);
});
