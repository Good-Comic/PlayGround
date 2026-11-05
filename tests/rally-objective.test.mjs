import test from 'node:test';
import assert from 'node:assert/strict';
globalThis.document = { documentElement: { dataset: {} }, dispatchEvent() {} };
globalThis.window = { innerWidth: 1366, innerHeight: 900 };
const { Game } = await import('../js/game.js');
const { EVENT_MODULES, EVENT_MATRIX } = await import('../js/events.js');
const { installRallyMechanic, rallyCarrierType, RALLY_RULE } = await import('../js/rally-objective.js');

// Controlled event fixtures: no production matrix, unit stats or director budget changes.
const fresh = () => { const g = new Game(); g.newRun(42, { civ: 'CHN' }); g.start(); return g; };
const rally = (groups = null, install = true) => {
  const g = fresh(), mechanic = install ? installRallyMechanic(g) : null;
  const p = g.pendingWavePlan;
  g.pendingWavePlan = { ...p, event: EVENT_MODULES.RALLY, eventMods: EVENT_MODULES.RALLY.mods, spawns: groups || p.spawns };
  g.startWave();
  return { g, mechanic };
};
const deployed = () => { const r = rally(); r.g.updateWave(10.01); r.g.waveClock = 20; r.g.waveEventActive = true; for (const u of r.g.units.filter(u => u.team === 'enemy')) r.g.applyEventMods(u); return r; };

test('正式規則固定4格、15模擬秒、1.1；文明波次表不變', () => {
  assert.deepEqual(RALLY_RULE, { radius: 4, duration: 15, speed: 1.1 });
  assert.equal(EVENT_MATRIX.FRK[4], 'RALLY'); assert.equal(EVENT_MATRIX.BRI[8], 'RALLY');
  assert.equal(EVENT_MATRIX.CHN.includes('RALLY'), false);
});
test('整份原生波次優先精銳，否則同類最低威脅，不改組成', () => {
  const groups = [{ units: { militia: 3 } }, { units: { guard: 1, archer: 1 } }], copy = structuredClone(groups);
  assert.equal(rallyCarrierType(groups), 'guard'); assert.deepEqual(groups, copy);
  assert.equal(rallyCarrierType([{ units: { guard: 0, militia: 1, archer: 4 } }]), 'militia');
  assert.equal(rallyCarrierType([{ units: { archer: 4, warlord: 1 } }]), null);
});
test('不額外產兵、不消耗RNG或資源、不改原生生命／傷害', () => {
  const a = rally(), b = rally(null, false);
  a.g.updateWave(10.01); b.g.updateWave(10.01);
  assert.equal(a.g.rng.state, b.g.rng.state); assert.deepEqual(a.g.resources, b.g.resources);
  assert.deepEqual(a.g.units.map(u => [u.id, u.type, u.hp, u.attack, u.x, u.y]), b.g.units.map(u => [u.id, u.type, u.hp, u.attack, u.x, u.y]));
  assert.ok(a.mechanic.carrier());
});
test('等待正式波次中精銳出場，不提前給小兵旗幟或轉派', () => {
  const groups = [{ at: 10, gate: 0, units: { militia: 2 } }, { at: 15, gate: 0, units: { guard: 1 } }];
  const { g, mechanic: m } = rally(groups); g.updateWave(10.01); assert.equal(m.carrier(), null);
  g.updateWave(5); assert.equal(m.carrier().type, 'guard'); const id = m.carrier().id;
  m.carrier().alive = false; g.spawnWaveGroup({ gate: 0, units: { guard: 1 } }); assert.equal(m.state().carrierId, id); assert.equal(m.status(), 'broken');
});
test('啟動前無加成，半徑內含邊界、半徑外不加成，Boss及玩家不加成', () => {
  const { g, mechanic: m } = deployed(), flag = m.carrier(), enemy = g.units.find(u => u.team === 'enemy' && u !== flag);
  enemy.x = flag.x + 4; enemy.y = flag.y;
  g.waveClock = 19.99; g.waveEventActive = false; assert.equal(m.multiplier(enemy), 1);
  g.waveClock = 20; g.waveEventActive = true; assert.equal(m.multiplier(enemy), 1.1);
  enemy.x += .0001; assert.equal(m.multiplier(enemy), 1);
  assert.equal(m.multiplier({ ...flag, team: 'player' }), 1);
  assert.equal(m.multiplier({ ...flag, typeDef: { ...flag.typeDef, boss: true } }), 1);
});
test('原生冷卻下限及其他倍率不變，不重設正在運作的攻擊冷卻', () => {
  const { g, mechanic: m } = deployed(), flag = m.carrier(); flag.cooldown = .6;
  const original = Game.prototype.attackCooldown.bind(g), mods = flag.eventAttackSpeedMul;
  assert.equal(g.attackCooldown(flag), original({ ...flag, eventAttackSpeedMul:1.1 })); assert.equal(flag.cooldown, .6); assert.equal(flag.eventAttackSpeedMul, mods);
  flag.typeDef = { ...flag.typeDef, cooldown: .1 }; assert.equal(g.attackCooldown(flag), .25);
  flag.typeDef = { ...flag.typeDef, cooldown: 1.5 }; g.waveEnraged = true;
  assert.equal(g.attackCooldown(flag), Math.max(.25, 1.5 / 1.1 / 1.15));
  g.waveClock = 35; assert.equal(g.attackCooldown(flag), Math.max(.25, 1.5 / 1.15));
});
test('旗手死亡或改變陣營立即解除，沒有額外獎勵或重生', () => {
  for (const kind of ['death', 'conversion']) {
    const { g, mechanic: m } = deployed(), flag = m.carrier(), before = { ...g.resources }, count = g.units.length;
    if (kind === 'death') flag.alive = false; else flag.team = 'player';
    assert.equal(m.status(), 'broken'); assert.equal(m.multiplier(g.units.find(u => u.team === 'enemy')), 1);
    assert.equal(g.units.length, count); assert.deepEqual(g.resources, before);
  }
});
test('15模擬秒到期，不依現實時間延長或縮短', async () => {
  const { g, mechanic: m } = deployed(); g.waveClock = 34.99; assert.equal(m.status(), 'active');
  await new Promise(resolve => setTimeout(resolve, 15)); assert.equal(m.status(), 'active');
  g.waveClock = 35; assert.equal(m.status(), 'expired'); assert.equal(m.multiplier(m.carrier()), 1);
});
test('暫停與選卡不推進集結時間，恢復後原生更新繼續', () => {
  const { g, mechanic: m } = deployed(); g.paused = true; const clock = g.waveClock, state = m.state();
  g.update(.05); assert.equal(g.waveClock, clock); assert.deepEqual(m.state(), state);
  g.paused = false; g.phase = 'boon'; g.update(.05); assert.equal(g.waveClock, clock); assert.equal(m.status(), 'off');
  g.phase = 'wave'; g.update(.05); assert.ok(g.waveClock > clock); assert.equal(m.state().expiresAt, 35);
});
test('Save/Load保留旗手、剩餘時間、原冷卻及RNG位元，不新增15秒', () => {
  const { g, mechanic: m } = deployed(); g.waveClock = 28.25; m.carrier().cooldown = .45;
  const saved = JSON.parse(JSON.stringify(g.snapshot())), h = fresh(), n = installRallyMechanic(h); h.restore(saved);
  assert.deepEqual(n.state(), m.state()); assert.equal(h.waveClock, 28.25); assert.equal(n.state().expiresAt - h.waveClock, 6.75);
  assert.equal(n.carrier().cooldown, .45); assert.equal(h.rng.state >>> 0, g.rng.state >>> 0); assert.equal(n.multiplier(n.carrier()), 1.1);
  assert.deepEqual(h.snapshot().rallyObjective, saved.rallyObjective);
});
test('死旗手讀檔不復活、不重新指定；無效計時資料不重啟效果', () => {
  const { g, mechanic: m } = deployed(); m.carrier().alive = false;
  const saved = g.snapshot(), h = fresh(), n = installRallyMechanic(h); h.restore(saved); assert.equal(n.status(), 'broken');
  for (const row of [{ ...saved.rallyObjective, expiresAt: Infinity }, { ...saved.rallyObjective, version: 2 }, { ...saved.rallyObjective, eventAt: -1 }]) {
    h.restore({ ...saved, rallyObjective: row }); assert.equal(n.state(), null); assert.equal(n.status(), 'legacy');
  }
});
test('舊RALLY存檔保留原波原行為，不猜測舊旗手或重新計時', () => {
  const { g } = deployed(), saved = g.snapshot(); delete saved.rallyObjective;
  for(const u of saved.units) if(u.team==='enemy') u.eventAttackSpeedMul=1.1; // Historical global RALLY payload.
  const h = fresh(), n = installRallyMechanic(h); h.restore(saved); const enemy = h.units.find(u => u.team === 'enemy');
  assert.equal(n.status(), 'legacy'); assert.equal(enemy.eventAttackSpeedMul,1.1); assert.equal(h.attackCooldown(enemy), Game.prototype.attackCooldown.call(h, enemy)); assert.equal(h.snapshot().rallyObjective, undefined);
});
test('所有其他事件與玩家單位逐一保持原生冷卻，重開清除旗手狀態', () => {
  const { g, mechanic: m } = deployed(), enemy = m.carrier(), hero = g.hero;
  assert.equal(g.attackCooldown(hero), Game.prototype.attackCooldown.call(g, hero));
  for (const event of Object.values(EVENT_MODULES).filter(e => e.id !== 'RALLY')) { g.waveEvent = event; assert.equal(m.status(), 'off'); assert.equal(g.attackCooldown(enemy), Game.prototype.attackCooldown.call(g, enemy), event.id); }
  g.newRun(44, { civ: 'FRK' }); assert.equal(m.state(), null); assert.equal(m.carrier(), null);
});
test('查看機制狀態與存檔不消耗模擬RNG；回傳狀態不能修改內部資料', () => {
  const { g, mechanic: m } = deployed(), rng = g.rng.state, clock = g.waveClock, state = m.state();
  for (let i = 0; i < 100; i++) { m.status(); m.multiplier(m.carrier()); g.snapshot(); m.state().expiresAt = 999; }
  assert.equal(g.rng.state, rng); assert.equal(g.waveClock, clock); assert.deepEqual(m.state(), state);
});
test('本波結束後存活殘兵不攜帶舊RALLY全域加成到下一波', () => {
  const {g, mechanic:m}=deployed(), flag=m.carrier();
  g.waveIndex++;g.waveEvent=EVENT_MODULES.RAID;g.phase='prep';
  assert.equal(g.attackCooldown(flag),flag.typeDef.cooldown);
});
