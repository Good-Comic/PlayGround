import test from 'node:test';
import assert from 'node:assert/strict';
import '../tools/qa/ram-pick-065e2912/node-dom-fixture.mjs';
const { Game } = await import(process.env.MOVEMENT_TEST_GAME || '../js/game.js');

// 受控小場景，保留原生地形、碰撞、兵種參數與接敵流程，不代表自然戰役。
function fixture() {
  const g = new Game(); g.newRun(42, { civ: 'FRK' }); g.start();
  const u = g.units.find(u => u.team === 'player' && u.type === 'militia');
  let point;
  for (let y = 3; y < g.world.size - 4 && !point; y++) for (let x = 3; x < g.world.size - 6; x++) {
    if (g.isWalkable(x, y, u) && g.segmentWalkable({ x, y }, { x: x + 4, y }, u)) { point = { x, y }; break; }
  }
  assert.ok(point); Object.assign(u, point, { guardOrigin: { ...point }, state: 'idle', target: null, targetPos: null, _nav: null, orderFailure: null });
  g.units = [u]; g.crowd = null; g.time = 10;
  u._progress = { ...point, at: 0 }; u._goalProgress = { distance: 0, at: 0 };
  return { g, u, point };
}
function tick(g, dt = 1 / 60) { g.time += dt; g.updateUnits(dt); }

for (const distance of [1, .7]) test(`原生移動${distance}格完成後實際待命十秒，再接敵不繼承先前行程時計`, () => {
  const { g, u, point } = fixture(); g.time = 0; u._progress = null; u._goalProgress = null;
  g.commandMove([u], point.x + distance, point.y);
  for (let i = 0; i < 200; i++) tick(g, .05);
  assert.equal(u.state, 'idle');
  const enemy = g.spawnUnit('militia', point.x + 4, point.y, 'enemy');
  assert.ok(enemy); assert.ok(g.canSee(u, enemy));
  tick(g); assert.equal(u.target, enemy); tick(g);
  assert.equal(u.target, enemy); assert.notEqual(u.orderFailure, 'congested');
});

test('待命時間不應使下一個正常接敵步驟立刻誤報壅塞', () => {
  const { g, u, point } = fixture(); tick(g);
  const enemy = g.spawnUnit('militia', point.x + 3, point.y, 'enemy');
  assert.ok(enemy); assert.ok(g.canSee(u, enemy));
  tick(g); assert.equal(u.target, enemy); assert.equal(u.state, 'attack');
  const before = { x: u.x, y: u.y }; tick(g);
  assert.equal(u.target, enemy); assert.notEqual(u.orderFailure, 'congested');
  assert.ok(Math.hypot(u.x - before.x, u.y - before.y) > 0);
});
test('射程內交戰時間不計入目標離開射程後的移動停滯', () => {
  const { g, u, point } = fixture();
  const enemy = g.spawnUnit('militia', point.x + .9, point.y, 'enemy');
  Object.assign(u, { target: enemy, state: 'attack', manualAttack: true, cooldown: 1 });
  tick(g); assert.equal(u._progress, null); assert.equal(u._goalProgress, null);
  enemy.x = point.x + 3; enemy.y = point.y;
  tick(g); assert.equal(u.target, enemy); assert.equal(u.manualAttack, true);
  assert.notEqual(u.orderFailure, 'congested');
});
test('暈眩與英雄直控不帶入過期自動移動計時', () => {
  const { g, u } = fixture(); u.slowUntil = 20; u.slowAmount = 1; tick(g);
  assert.equal(u._progress, null); assert.equal(u._goalProgress, null);
  g.units = [g.hero]; g.heroControl = true;
  g.hero._progress = { x: g.hero.x, y: g.hero.y, at: 0 }; g.hero._goalProgress = { distance: 0, at: 0 };
  tick(g); assert.equal(g.hero._progress, null); assert.equal(g.hero._goalProgress, null);
});
test('連續真正受阻仍按原六秒門檻回報，不延長或關閉碰撞', () => {
  const { g, u, point } = fixture(); g.time = 0; u._progress = null; u._goalProgress = null;
  g.crowd = { steer: () => null, nearby: () => [], moved() {} };
  let firstFailure;
  for (let i = 0; i < 70; i++) {
    g.time += .1; g.navigationBudget = 2;
    const status = g.stepToward(u, point.x + 3, point.y, .1);
    if (status === 'congested') { firstFailure = g.time; break; }
  }
  assert.ok(firstFailure > 6 && firstFailure < 6.4, String(firstFailure));
  assert.equal(u.x, point.x); assert.equal(u.y, point.y);
});
test('不移動的計時重置不消耗雙RNG，且不加入存檔schema', () => {
  const { g, u } = fixture(), rng = g.rng.state, visual = g.visualRng.state;
  tick(g); assert.equal(g.rng.state, rng); assert.equal(g.visualRng.state, visual);
  const saved = g.snapshot().units.find(v => v.id === u.id);
  assert.equal(Object.hasOwn(saved, '_movementAttempted'), false);
  assert.equal(Object.hasOwn(saved, '_progress'), false);
});
