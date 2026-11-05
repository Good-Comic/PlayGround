import test from 'node:test';
import assert from 'node:assert/strict';

globalThis.document = { documentElement: { dataset: {} }, dispatchEvent() {} };
globalThis.window = { innerWidth: 1440, innerHeight: 900 };
const { Game } = await import('../js/game.js');

function live() {
  const events = [];
  const sound = new Proxy({}, { get: (_, key) => (...args) => events.push({ sound: key, args }) });
  const g = new Game({ sound }); g.newRun(42, { civ: 'FRK' }); g.start();
  const enemy = g.spawnUnit('militia', g.hero.x + 2, g.hero.y, 'enemy');
  const soldier = g.units.find(u => u.alive && u.team === 'player' && !u.hero && u.type === 'militia');
  assert.ok(soldier); assert.ok(g.isVisible(enemy)); g.setSelection([soldier]);
  return { g, events, enemy, soldier };
}
function end(f, phase) {
  if (phase === 'defeat') {
    const core = f.g.getTownCenter(); f.g.applyDamage(core, core.maxHp * 100, f.enemy, 'melee');
  } else f.g.triggerVictory();
  assert.equal(f.g.phase, phase);
}
function state(f) {
  const snapshot = f.g.snapshot(); delete snapshot.savedAt;
  return { snapshot, events: structuredClone(f.events), markers: structuredClone(f.g.commandMarkers), particles: structuredClone(f.g.particles),
    selection: f.g.selection.map(u => u.id), heroControl: f.g.heroControl, orderMode: f.g.orderMode };
}

for (const phase of ['defeat', 'victory']) {
  test(`原生${phase}後直接技能不再施放、消耗冷卻或發出成功聲光`, () => {
    const f = live(); end(f, phase); const before = state(f);
    f.g.heroAegis(); f.g.heroMark();
    assert.deepEqual(state(f), before);
  });

  test(`原生${phase}後既有命令介面不改盾、標記、軍令或預留資源`, () => {
    const f = live(); end(f, phase); const before = state(f);
    for (const id of ['hero:aegis', 'hero:mark', 'hero:control', 'order:guard', 'order:attackMove', 'stop', 'hold']) f.g.command(id);
    assert.deepEqual(state(f), before);
  });

  test(`原生${phase}後軍事生產不新增佇列或支付費用`, () => {
    const f = live(), b = f.g.buildings.find(b => f.g.trainableFor(b).includes('militia'));
    assert.ok(b); f.g.setSelection([b]); end(f, phase); const before = state(f);
    f.g.command('train:militia'); assert.deepEqual(state(f), before);
  });
}

test('prep與wave仍沿原生神盾、標記及正式冷卻，未改任何技能數值', () => {
  for (const phase of ['prep', 'wave']) {
    const f = live(); f.g.phase = phase;
    f.g.heroAegis(); assert.equal(f.g.hero.aegisCd, 60); assert.equal(f.g.hero.shield, 60);
    f.g.heroMark(); assert.equal(f.g.hero.markCd, 30); assert.equal(f.enemy.marked, 6);
    const hp = f.g.hero.hp, cd = f.g.hero.aegisCd; f.g.heroAegis(); assert.equal(f.g.hero.aegisCd, cd); assert.equal(f.g.hero.hp, hp);
  }
});

test('正常新局及正式NG+初始化後仍能主動使用技能，結算防線不永久鎖住控制', () => {
  for (const mode of ['newRun', 'nextCycle']) {
    const f = live(); end(f, 'victory');
    if (mode === 'newRun') f.g.newRun(43, { civ: 'FRK' });
    else assert.equal(f.g.startNextCycle([]), true);
    f.g.start(); assert.equal(f.g.phase, 'prep'); f.g.heroAegis();
    assert.equal(f.g.hero.aegisCd, 60); assert.equal(f.g.hero.shield, 60);
  }
});
