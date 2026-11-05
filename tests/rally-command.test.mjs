import test from 'node:test';
import assert from 'node:assert/strict';
globalThis.document = { documentElement: { dataset: {} }, dispatchEvent() {} };
globalThis.window = { innerWidth: 1440, innerHeight: 900 };
const { Game } = await import('../js/game.js');
const { EVENT_MODULES } = await import('../js/events.js');
const { battleArmy } = await import('../js/battle-actions.js');
const { defenseClickPoint } = await import('../js/core-defense.js');
const { installRallyMechanic, rallyAttackContext, attackRallyCarrier } = await import('../js/rally-objective.js');
const { STRINGS } = await import('../js/locales.js');
const { sightRadius } = await import('../js/visibility.js');
const snapshot = g => { const s = g.snapshot(); delete s.savedAt; return s; };
// Controlled native event: unchanged unit attributes and command/hit testing.
function fixture() {
  const g = new Game(); g.newRun(42, { civ: 'FRK' }); g.start();
  const m = installRallyMechanic(g), p = g.pendingWavePlan;
  g.pendingWavePlan = { ...p, event: EVENT_MODULES.RALLY, eventMods: EVENT_MODULES.RALLY.mods, spawns: [{ at: 0, gate: 0, units: { spearman: 1 } }] };
  g.startWave(); g.updateWave(.01);
  const flag = m.carrier(), hero = g.hero;
  assert.ok(flag); flag.x = hero.x + 2; flag.y = hero.y + 2;
  g.focusAt(flag.x, flag.y); g.setSelection(battleArmy(g).slice(0, 1));
  assert.equal(g.isVisible(flag), true); assert.ok(defenseClickPoint(g, flag));
  return { g, m, flag };
}

test('一次明確命令只作用於已選戰士，未選兵與英雄／村民不變', () => {
  const { g, m, flag } = fixture(), selection = [...g.selection], rest = g.units.filter(u => !selection.includes(u));
  const restState = rest.map(u => [u.id, u.state, u.target, u.manualAttack, u.tacticalOrder]);
  let calls = 0; const native = g.issueCommand.bind(g); g.issueCommand = (...a) => { calls++; return native(...a); };
  const result = attackRallyCarrier(g, m);
  assert.equal(result.ok, true); assert.equal(calls, 1); assert.equal(result.count, 1); assert.equal(result.targetId, flag.id);
  assert.deepEqual(g.selection, selection); assert.equal(g.selection[0].target, flag); assert.equal(g.selection[0].manualAttack, true);
  assert.deepEqual(rest.map(u => [u.id, u.state, u.target, u.manualAttack, u.tacticalOrder]), restState);
});
test('攻擊欄位、命令標記、音效及模擬狀態與同點原生右鍵一致', () => {
  const a = fixture(), b = fixture(); let left = 0, right = 0;
  a.g.sound = { command() { left++; } }; b.g.sound = { command() { right++; } };
  const point = defenseClickPoint(b.g, b.flag); b.g.issueCommand(point.x, point.y);
  assert.equal(attackRallyCarrier(a.g, a.m).ok, true);
  assert.deepEqual(snapshot(a.g), snapshot(b.g)); assert.equal(left, 1); assert.equal(right, 1);
  assert.deepEqual(a.g.commandMarkers, b.g.commandMarkers);
});
test('反覆讀取入口與重新繪製不消耗RNG、資源、HP、冷卻或事件時間', () => {
  const { g, m } = fixture(), before = snapshot(g), rng = g.rng.state, visual = g.visualRng?.state;
  for (let i = 0; i < 100; i++) assert.equal(rallyAttackContext(g, m).count, 1);
  assert.deepEqual(snapshot(g), before); assert.equal(g.rng.state, rng); assert.equal(g.visualRng?.state, visual);
});
test('空選、混合英雄／村民／建築、英雄直控及舊實體不偷偷選兵', () => {
  for (const kind of ['none', 'hero', 'worker', 'building', 'direct', 'stale']) {
    const { g, m } = fixture(), fighter = g.selection[0];
    if (kind === 'none') g.selection = [];
    if (kind === 'hero') g.selection.push(g.hero);
    if (kind === 'worker') g.selection.push(g.units.find(u => u.type === 'villager'));
    if (kind === 'building') g.selection.push(g.getTownCenter());
    if (kind === 'direct') g.heroControl = true;
    if (kind === 'stale') g.selection = [{ ...fighter }];
    const before = snapshot(g), selected = [...g.selection], camera = { ...g.camera }; g.keys.add('d');
    const result = attackRallyCarrier(g, m); assert.equal(result.reason, 'select', kind);
    assert.deepEqual(g.selection, selected); assert.deepEqual(g.camera, camera); assert.ok(g.keys.has('d'));
    assert.deepEqual(snapshot(g), before);
  }
});
test('暫停、面板、施工、選卡、結算、選單及過期事件一律零命令', () => {
  for (const kind of ['pause', 'blocked', 'build', 'boon', 'defeat', 'victory', 'menu', 'expiry', 'wave']) {
    const { g, m } = fixture();
    if (kind === 'pause') g.paused = true;
    if (kind === 'build') g.placement = { type: 'house' };
    if (['boon', 'defeat', 'victory'].includes(kind)) g.phase = kind;
    if (kind === 'menu') g.inMenu = true;
    if (kind === 'expiry') g.waveClock = 35;
    if (kind === 'wave') g.waveIndex++;
    let calls = 0; g.issueCommand = () => calls++;
    assert.equal(attackRallyCarrier(g, m, { blocked: kind === 'blocked' }).ok, false, kind); assert.equal(calls, 0);
  }
});
test('已死／轉陣營／不在目前世界／霧中目標不下令且不讀隱藏座標', () => {
  for (const kind of ['death', 'team', 'stale', 'fog']) {
    const { g, m, flag } = fixture();
    if (kind === 'death') flag.alive = false;
    if (kind === 'team') flag.team = 'player';
    if (kind === 'stale') g.units = g.units.filter(u => u !== flag);
    if (kind === 'fog') { g.isVisible = () => false; Object.defineProperty(flag, 'x', { get() { throw Error('HIDDEN_COORDINATE'); } }); }
    let calls = 0; g.issueCommand = () => calls++;
    assert.equal(attackRallyCarrier(g, m).ok, false, kind); assert.equal(calls, 0);
  }
});
test('無原生命中點、UI遮擋／畫面外或點擊當下變更不退回移動／其他敵人', () => {
  for (const kind of ['occluded', 'surface', 'changed']) {
    const { g, m, flag } = fixture(); let calls = 0; g.issueCommand = () => calls++;
    if (kind === 'occluded') g.pickAt = () => g.hero;
    if (kind === 'changed') { let picks = 0; g.pickAt = () => ++picks === 1 ? flag : g.hero; }
    assert.equal(attackRallyCarrier(g, m, { canPoint: () => kind !== 'surface' }).reason, 'noPoint', kind); assert.equal(calls, 0);
  }
});
test('沙暴沿正式視野縮減禁用入口，恢復後才重新可用，不延長集結', () => {
  const { g, m, flag } = fixture(), fighter = g.selection[0], hero = g.hero;
  g.units = [hero, fighter, flag]; g.buildings = [];
  fighter.x = hero.x; fighter.y = hero.y;
  flag.x = hero.x + Math.max(sightRadius(g, hero), sightRadius(g, fighter)) * .9; flag.y = hero.y;
  assert.equal(g.isVisible(flag), true); const expires = m.state().expiresAt;
  g.effects.sandstorm = 20;
  assert.equal(g.isVisible(flag), false); assert.equal(attackRallyCarrier(g, m).reason, 'unseen');
  g.effects.sandstorm = 0;
  assert.equal(g.isVisible(flag), true); assert.equal(rallyAttackContext(g, m).reason, undefined); assert.equal(m.state().expiresAt, expires);
});
test('第一個原生點被UI遮住仍可採用下一個合法點，不繞過pickAt', () => {
  const { g, m, flag } = fixture(), first = defenseClickPoint(g, flag);
  const context = rallyAttackContext(g, m, { canPoint: p => p.x !== first.x });
  assert.equal(context.reason, undefined); assert.notEqual(context.point.x, first.x); assert.equal(g.pickAt(context.point.x, context.point.y), flag);
});
test('入口不持續改令；後續原生移動／停止立即覆蓋', () => {
  const { g, m } = fixture(); assert.equal(attackRallyCarrier(g, m).ok, true);
  g.pickAt = () => null; g.issueCommand(1100, 600);
  assert.equal(g.selection[0].manualAttack, false); assert.equal(g.selection[0].state, 'move');
  rallyAttackContext(g, m); assert.equal(g.selection[0].state, 'move');
  g.command('stop'); assert.equal(g.selection[0].state, 'idle'); rallyAttackContext(g, m); assert.equal(g.selection[0].state, 'idle');
});
test('原生Save/Load改用新實體並保留剩餘時窗，舊旗手不被重用', () => {
  const { g, m, flag } = fixture(); g.waveClock = 28;
  const saved = g.snapshot(); g.restore(saved); g.start(); const current = m.carrier();
  assert.notEqual(current, flag); assert.equal(current.id, flag.id); assert.equal(m.state().expiresAt - g.waveClock, 7);
  g.setSelection(battleArmy(g).slice(0, 1)); assert.equal(attackRallyCarrier(g, m).ok, true); assert.equal(g.selection[0].target, current);
});
test('四語有完整明確人工控制與禁用原因，不覆蓋正式既有規則', () => {
  for (const locale of ['zh-Hant', 'zh-Hans', 'en', 'ja']) for (const key of ['attack', 'attackHelp', 'select', 'noPoint', 'orderUnavailable', 'issued']) assert.ok(STRINGS[locale]['flag.' + key], locale + key);
});
