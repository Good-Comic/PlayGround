import test from 'node:test';
import assert from 'node:assert/strict';
globalThis.document = { documentElement: { dataset: {} }, dispatchEvent() {} };
const { Game } = await import('../js/game.js');
const { canCallWave, createEarlyRaidControl } = await import('../js/early-raid.js');
const snapshot = g => { const s = g.snapshot(); delete s.savedAt; return s; };
const fresh = () => { const g = new Game(); g.newRun(42, { civ: 'CHN' }); g.start(); return g; };

test('檢視、取消與未武裝確認不改模擬、候選波次或RNG', () => {
  const g = fresh(), c = createEarlyRaidControl(g), before = JSON.stringify(snapshot(g));
  assert.equal(c.confirm(), false);
  for (let i = 0; i < 5; i++) { assert.ok(c.arm()); assert.ok(c.isArmed()); c.cancel(); }
  assert.equal(c.confirm(), false);
  assert.equal(JSON.stringify(snapshot(g)), before);
});
test('提前迎戰與原生startWave完全相同，不給資源、時間或冷卻優惠；只生效一次', () => {
  const g = fresh(), native = fresh(), c = createEarlyRaidControl(g), time = g.time, stock = { ...g.resources };
  g.hero.markCd = native.hero.markCd = 12;
  c.arm(); assert.equal(c.confirm(), true); native.startWave();
  assert.equal(g.phase, 'wave'); assert.equal(g.time, time); assert.equal(g.hero.markCd, 12);
  assert.deepEqual(g.resources, stock); assert.equal(c.confirm(), false);
  assert.deepEqual(snapshot(g), snapshot(native));
});
test('暫停、選卡、結算、選單、放置與對話框阻止開戰且消除確認', () => {
  for (const kind of ['paused', 'menu', 'boon', 'victory', 'defeat', 'placement', 'modal']) {
    const g = fresh(); let blocked = false; const c = createEarlyRaidControl(g, () => blocked); c.arm();
    if (kind === 'paused') g.paused = true;
    else if (kind === 'menu') g.inMenu = true;
    else if (kind === 'placement') g.placement = {};
    else if (kind === 'modal') blocked = true;
    else g.phase = kind;
    const before = JSON.stringify(snapshot(g));
    assert.equal(canCallWave(g, blocked), false); assert.equal(c.isArmed(), false); assert.equal(c.confirm(), false);
    assert.equal(JSON.stringify(snapshot(g)), before);
  }
});
test('自然倒數仍開戰，舊確認無法重開或跨波次／新局使用', () => {
  const g = fresh(), c = createEarlyRaidControl(g); c.arm(); g.prepTimer = .01; g.update(.05);
  assert.equal(g.phase, 'wave'); assert.equal(c.confirm(), false);
  for (const kind of ['wave', 'world', 'plan']) {
    const h = fresh(), d = createEarlyRaidControl(h); d.arm();
    if (kind === 'wave') h.waveIndex++;
    if (kind === 'world') h.newRun(43, { civ: 'CHN' });
    if (kind === 'plan') h.pendingWavePlan = { ...h.pendingWavePlan };
    assert.equal(d.confirm(), false);
  }
});
test('提前迎戰存讀檔保留原生波次、RNG與相對生成時刻，確認不入存檔', () => {
  const g = fresh(), c = createEarlyRaidControl(g); c.arm(); c.confirm();
  const save = JSON.parse(JSON.stringify(snapshot(g))), h = new Game(); h.restore(save);
  assert.equal(h.phase, 'wave'); assert.deepEqual(h.waveSpawns, g.waveSpawns);
  assert.equal(h.rng.state, g.rng.state); assert.equal(h.waveClock, 0);
  assert.equal(createEarlyRaidControl(h).confirm(), false);
});
