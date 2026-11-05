import test from 'node:test';
import assert from 'node:assert/strict';

globalThis.document = { documentElement: { dataset: {} }, dispatchEvent() {} };
globalThis.window = { innerWidth: 1440, innerHeight: 900 };
const { Game } = await import('../js/game.js');
const { battleArmy } = await import('../js/battle-actions.js');
const { defenseClickPoint } = await import('../js/core-defense.js');
const { sightRadius } = await import('../js/visibility.js');
const { selectedAttackers, selectedVisibleTargetContext, attackSelectedVisibleTarget, focusVisibleTarget } = await import('../js/manual-target.js');

const snapshot = g => { const s = structuredClone(g.snapshot()); delete s.savedAt; return s; };
const withoutCamera = g => { const s = snapshot(g); delete s.camera; return s; };
function fixture(civ = 'FRK') {
  const g = new Game();
  g.newRun(42, { civ }); g.start();
  const target = g.spawnUnit('militia', g.hero.x + 2, g.hero.y + 2, 'enemy');
  g.setSelection(battleArmy(g).slice(0, 2));
  assert.equal(g.isVisible(target), true);
  const point = defenseClickPoint(g, target);
  assert.ok(point); assert.equal(g.pickAt(point.x, point.y), target);
  return { g, target };
}
function countCommands(g) {
  let commands = 0, sounds = 0, markers = 0;
  const issue = g.issueCommand.bind(g), marker = g.addCommandMarker.bind(g);
  g.issueCommand = (...args) => { commands++; return issue(...args); };
  g.addCommandMarker = (...args) => { markers++; return marker(...args); };
  g.sound = { command() { sounds++; } };
  return () => ({ commands, sounds, markers });
}
function settleCamera(g) {
  for (let i = 0; i < 160; i++) g.updateCamera(.1);
}
function projectedCenter(g, target) {
  return g.screenPos(target.x + (target.w || 0) / 2, target.y + (target.h || 0) / 2);
}
function assertPoint(actual, expected) {
  assert.ok(Math.abs(actual.x - expected.x) < 1e-7, `x: ${actual.x} / ${expected.x}`);
  assert.ok(Math.abs(actual.y - expected.y) < 1e-7, `y: ${actual.y} / ${expected.y}`);
}
function emptyGround(g) {
  for (let y = 3; y < g.world.size - 2; y += 3) for (let x = 3; x < g.world.size - 2; x += 3) {
    const p = g.screenPos(x, y);
    if (!g.pickAt(p.x, p.y)) return p;
  }
  assert.fail('找不到原生空地命令點');
}

test('已選戰士只取目前正式軍隊實體交集，死亡／舊實體／英雄／村民／支援兵不混入', () => {
  const { g, target } = fixture(), [a, b] = battleArmy(g);
  const dead = g.spawnUnit('militia', 30, 30); dead.alive = false;
  const support = g.spawnUnit('recruiter', 31, 30), stale = { ...b };
  g.selection = [b, a, b, g.hero, g.units.find(u => u.type === 'villager'), support, dead, stale, target, g.getTownCenter()];
  const selection = g.selection, before = snapshot(g);
  assert.deepEqual(selectedAttackers(g), [b, a]);
  assert.equal(g.selection, selection); assert.deepEqual(snapshot(g), before);
  g.setSelection([]); assert.deepEqual(selectedAttackers(g), []);
});

test('可用情境回傳原生同實體命中點；重讀不消耗模擬或視覺RNG及快照', () => {
  const { g, target } = fixture(), before = snapshot(g), rng = g.rng.state, visual = g.visualRng?.state;
  g.orderMode = 'guard';
  for (let i = 0; i < 80; i++) {
    const context = selectedVisibleTargetContext(g, target);
    assert.equal(context.ok, true); assert.equal(context.count, 2); assert.equal(context.target, target);
    assert.equal(g.pickAt(context.point.x, context.point.y), target);
  }
  assert.equal(g.orderMode, 'guard'); assert.equal(g.rng.state, rng); assert.equal(g.visualRng?.state, visual);
  assert.deepEqual(snapshot(g), before);
});

test('人工攻擊與同點原生右鍵完整快照、全部命令欄位、一次音效與標記一致', () => {
  const a = fixture(), b = fixture();
  for (const { g } of [a, b]) {
    g.orderMode = 'guard';
    for (const u of g.selection) Object.assign(u, {
      tacticalOrder: { type: 'guard', protectedId: g.getTownCenter().id },
      target: g.hero, targetPos: { x: 20, y: 21 }, state: 'hold', hold: true,
      manualAttack: false, retargetTimer: 9, blockedTargets: { old: 4 }, orderFailure: 'blocked',
      _progress: { x: 1 }, _nav: { x: 2 },
    });
  }
  const left = countCommands(a.g), right = countCommands(b.g), point = defenseClickPoint(b.g, b.target);
  b.g.orderMode = null; b.g.issueCommand(point.x, point.y);
  assert.deepEqual(attackSelectedVisibleTarget(a.g, a.target), { ok: true, count: 2, targetId: a.target.id, type: a.target.type });
  assert.deepEqual(snapshot(a.g), snapshot(b.g));
  assert.deepEqual(a.g.commandMarkers, b.g.commandMarkers);
  assert.deepEqual(left(), { commands: 1, sounds: 1, markers: 1 }); assert.deepEqual(right(), left());
  for (const u of a.g.selection) {
    assert.equal(u.target, a.target); assert.equal(u.state, 'attack'); assert.equal(u.manualAttack, true);
    assert.equal(u.tacticalOrder, null); assert.equal(u.targetPos, null); assert.equal(u.retargetTimer, 1.1);
    assert.deepEqual(u.blockedTargets, {}); assert.equal(u.orderFailure, null); assert.equal(u._progress, null); assert.equal(u._nav, null); assert.equal(u.hold, false);
  }
  assert.equal(a.g.orderMode, null);
});

test('只對點擊當下選兵發令，保留未選兵、英雄、村民、相機及持續按鍵', () => {
  const { g, target } = fixture();
  const shown = selectedVisibleTargetContext(g, target), current = battleArmy(g).slice(2, 3);
  assert.equal(shown.count, 2); assert.equal(current.length, 1); g.setSelection(current);
  g.keys.add('d'); g.keys.add('q'); const camera = { ...g.camera }, selection = g.selection;
  const before = snapshot(g), rest = before.units.filter(u => !current.some(s => s.id === u.id));
  assert.equal(attackSelectedVisibleTarget(g, target).count, 1);
  assert.equal(g.selection, selection); assert.deepEqual(g.camera, camera); assert.deepEqual([...g.keys], ['d', 'q']);
  assert.deepEqual(snapshot(g).units.filter(u => !current.some(s => s.id === u.id)), rest);
  assert.equal(g.heroControl, false);
  assert.deepEqual(g.resources, before.resources); assert.equal(g.time, before.time); assert.equal(g.rng.state, before.rngState);
});

test('重複選取同戰士只計一個實體，仍只發送一次原生命令', () => {
  const { g, target } = fixture(), soldier = g.selection[0]; g.selection = [soldier, soldier];
  const counts = countCommands(g);
  assert.equal(selectedVisibleTargetContext(g, target).count, 1);
  assert.equal(attackSelectedVisibleTarget(g, target).count, 1);
  assert.deepEqual(counts(), { commands: 1, sounds: 1, markers: 1 }); assert.deepEqual(g.selection, [soldier, soldier]);
});

test('空選、混選、死選、支援兵、英雄直控及同ID舊戰士一律拒絕，不暗選全軍', () => {
  for (const kind of ['none', 'hero', 'worker', 'building', 'support', 'dead', 'enemy', 'direct', 'stale']) {
    const { g, target } = fixture(), fighter = g.selection[0];
    if (kind === 'none') g.setSelection([]);
    if (kind === 'hero') g.selection.push(g.hero);
    if (kind === 'worker') g.selection.push(g.units.find(u => u.type === 'villager'));
    if (kind === 'building') g.selection.push(g.getTownCenter());
    if (kind === 'support') g.selection.push(g.spawnUnit('recruiter', 30, 30));
    if (kind === 'dead') { fighter.alive = false; g.selection = [fighter]; }
    if (kind === 'enemy') g.selection.push(target);
    if (kind === 'direct') g.heroControl = true;
    if (kind === 'stale') g.selection = [{ ...fighter }];
    g.orderMode = 'patrol'; g.keys.add('a'); const before = snapshot(g), selection = g.selection, counts = countCommands(g);
    const result = attackSelectedVisibleTarget(g, target);
    assert.equal(result.reason, 'select', kind); assert.equal(result.ok, false, kind);
    assert.equal(g.selection, selection); assert.equal(g.orderMode, 'patrol'); assert.ok(g.keys.has('a'));
    assert.deepEqual(counts(), { commands: 0, sounds: 0, markers: 0 }); assert.deepEqual(snapshot(g), before, kind);
  }
});

test('西班牙原生可攻擊村民仍不被本入口納入已選正式戰士', () => {
  const { g, target } = fixture('SPA'), worker = g.units.find(u => u.type === 'villager');
  g.selection.push(worker); const before = snapshot(g);
  assert.equal(attackSelectedVisibleTarget(g, target).reason, 'select'); assert.deepEqual(snapshot(g), before);
});

test('暫停、面板阻擋、施工、選卡、結算與選單先拒絕，三個入口零命令且不查視野', () => {
  for (const kind of ['pause', 'blocked', 'placement', 'boon', 'defeat', 'victory', 'menu']) {
    const { g, target } = fixture();
    if (kind === 'pause') g.paused = true;
    if (kind === 'placement') g.placement = { type: 'house' };
    if (['boon', 'defeat', 'victory'].includes(kind)) g.phase = kind;
    if (kind === 'menu') g.inMenu = true;
    const counts = countCommands(g), before = snapshot(g), options = { blocked: kind === 'blocked' };
    g.isVisible = () => { throw Error('不應於停用時查視野'); };
    for (const api of [selectedVisibleTargetContext, attackSelectedVisibleTarget, focusVisibleTarget]) {
      const result = api(g, target, options); assert.equal(result.ok, false, kind); assert.equal(result.reason, 'unavailable', kind);
    }
    assert.deepEqual(counts(), { commands: 0, sounds: 0, markers: 0 }); assert.deepEqual(snapshot(g), before);
  }
});

test('死亡、轉陣營、移出世界、空目標與霧中目標都不讀座標、不發令或移相機', () => {
  for (const kind of ['death', 'team', 'removed', 'null', 'fog']) {
    const { g, target } = fixture();
    if (kind === 'death') target.alive = false;
    if (kind === 'team') target.team = 'player';
    if (kind === 'removed') g.units = g.units.filter(u => u !== target);
    if (kind === 'fog') { const visible = g.isVisible.bind(g); g.isVisible = e => e !== target && visible(e); }
    const counts = countCommands(g), before = snapshot(g), x = target.x, y = target.y;
    Object.defineProperty(target, 'x', { configurable: true, get() { throw Error('不可讀取隱藏X'); } });
    Object.defineProperty(target, 'y', { configurable: true, get() { throw Error('不可讀取隱藏Y'); } });
    for (const api of [selectedVisibleTargetContext, attackSelectedVisibleTarget, focusVisibleTarget]) {
      const result = api(g, kind === 'null' ? null : target); assert.equal(result.ok, false, kind); assert.equal(result.reason, 'unseen', kind);
    }
    Object.defineProperty(target, 'x', { configurable: true, writable: true, value: x });
    Object.defineProperty(target, 'y', { configurable: true, writable: true, value: y });
    assert.deepEqual(counts(), { commands: 0, sounds: 0, markers: 0 }); assert.deepEqual(snapshot(g), before);
  }
});

test('正式沙暴視野縮減會即時禁用，恢復視野後才可再下人工命令', () => {
  const { g, target } = fixture(), hero = g.hero, fighter = g.selection[0];
  g.units = [hero, fighter, target]; g.buildings = []; g.setSelection([fighter]);
  fighter.x = hero.x; fighter.y = hero.y;
  target.x = hero.x + Math.max(sightRadius(g, hero), sightRadius(g, fighter)) * .9; target.y = hero.y;
  assert.equal(g.isVisible(target), true);
  g.effects.sandstorm = 20; assert.equal(g.isVisible(target), false);
  assert.equal(attackSelectedVisibleTarget(g, target).reason, 'unseen'); assert.equal(focusVisibleTarget(g, target).reason, 'unseen');
  g.effects.sandstorm = 0; assert.equal(g.isVisible(target), true); assert.equal(attackSelectedVisibleTarget(g, target).ok, true);
});

test('第一個點被Canvas檢查拒絕可用原生offset，不繞過命中判定', () => {
  const { g, target } = fixture(), first = defenseClickPoint(g, target), points = [];
  const canPoint = p => { points.push(p); return p.x !== first.x; };
  const context = selectedVisibleTargetContext(g, target, { canPoint });
  assert.equal(context.ok, true); assert.notEqual(context.point.x, first.x); assert.equal(g.pickAt(context.point.x, context.point.y), target);
  assert.equal(points[0].x, first.x); assert.equal(attackSelectedVisibleTarget(g, target, { canPoint }).ok, true);
});

test('所有Canvas點拒絕時零pick與零命令，保留armed模式及快照', () => {
  const { g, target } = fixture(); g.orderMode = 'attackMove'; const before = snapshot(g), counts = countCommands(g);
  g.pickAt = () => { throw Error('不應pick被Canvas拒絕的點'); };
  assert.deepEqual(attackSelectedVisibleTarget(g, target, { canPoint: () => false }), { ok: false, reason: 'noPoint', count: 2 });
  assert.equal(g.orderMode, 'attackMove'); assert.deepEqual(snapshot(g), before); assert.deepEqual(counts(), { commands: 0, sounds: 0, markers: 0 });
});

test('原生pick被同位置其他敵軍擋住時不改打其他敵軍、不退回移動', () => {
  const { g, target } = fixture(), blocker = g.spawnUnit(target.type, target.x, target.y, 'enemy');
  // 原生spawn會避免重疊；此處明確設定測試遮擋。 / Native spawn separates units; place the controlled occluder explicitly.
  blocker.x = target.x; blocker.y = target.y;
  g.units = [blocker, ...g.units.filter(u => u !== blocker)];
  const p = g.screenPos(target.x, target.y); assert.equal(g.pickAt(p.x, p.y - 18 * g.camera.zoom), blocker);
  const before = snapshot(g), counts = countCommands(g);
  assert.equal(attackSelectedVisibleTarget(g, target).reason, 'noPoint'); assert.deepEqual(snapshot(g), before);
  assert.deepEqual(counts(), { commands: 0, sounds: 0, markers: 0 });
});

test('派送前第二次pick改變就停止，不嘗試其他點、其他目標或原生移動', () => {
  const { g, target } = fixture(), pick = g.pickAt.bind(g); let picks = 0;
  const counts = countCommands(g), before = snapshot(g);
  g.pickAt = (...args) => ++picks === 1 ? pick(...args) : g.hero;
  assert.equal(attackSelectedVisibleTarget(g, target).reason, 'noPoint'); assert.equal(picks, 2);
  assert.deepEqual(counts(), { commands: 0, sounds: 0, markers: 0 }); assert.deepEqual(snapshot(g), before);
});

test('原生音效例外直接傳出且只呼叫一次，已清armed模式，不恢復或重試命令', () => {
  const { g, target } = fixture(), issue = g.issueCommand.bind(g), selection = g.selection, camera = { ...g.camera }; let calls = 0;
  g.orderMode = 'guard'; g.keys.add('a');
  g.issueCommand = (...args) => { calls++; return issue(...args); };
  g.sound = { command() { throw Error('原生命令音效失敗'); } };
  assert.throws(() => attackSelectedVisibleTarget(g, target), /原生命令音效失敗/);
  assert.equal(calls, 1); assert.equal(g.orderMode, null); assert.equal(g.selection, selection); assert.deepEqual(g.camera, camera); assert.ok(g.keys.has('a'));
});

test('原生命令沒有完成指定target的manualAttack時回失敗，不補發命令', () => {
  const { g, target } = fixture(); let calls = 0; g.issueCommand = () => { calls++; };
  const result = attackSelectedVisibleTarget(g, target);
  assert.deepEqual(result, { ok: false, reason: 'unavailable', count: 2 }); assert.equal(calls, 1);
});

test('後續人工原生移動與停止立即覆寫，不因重讀情境或查看而搶回舊目標', () => {
  const { g, target } = fixture(); assert.equal(attackSelectedVisibleTarget(g, target).ok, true);
  const p = emptyGround(g); g.issueCommand(p.x, p.y);
  assert.ok(g.selection.every(u => u.state === 'move' && !u.manualAttack && !u.target));
  const moved = withoutCamera(g);
  for (let i = 0; i < 20; i++) selectedVisibleTargetContext(g, target);
  assert.equal(focusVisibleTarget(g, target).ok, true); assert.deepEqual(withoutCamera(g), moved);
  g.command('stop'); const stopped = snapshot(g);
  for (let i = 0; i < 20; i++) selectedVisibleTargetContext(g, target);
  assert.deepEqual(snapshot(g), stopped); assert.ok(g.selection.every(u => u.state === 'idle' && !u.manualAttack));
});

test('原生Save／Load使用新目標實體；同ID舊參考拒絕、新實體可攻擊與查看', () => {
  const { g, target } = fixture(), saved = snapshot(g);
  g.restore(saved); g.start(); const current = g.units.find(u => u.id === target.id);
  assert.notEqual(current, target); assert.equal(current.id, target.id);
  const before = snapshot(g);
  assert.equal(attackSelectedVisibleTarget(g, target).reason, 'unseen'); assert.equal(focusVisibleTarget(g, target).reason, 'unseen'); assert.deepEqual(snapshot(g), before);
  assert.equal(attackSelectedVisibleTarget(g, current).ok, true); assert.equal(g.selection[0].target, current);
  assert.equal(focusVisibleTarget(g, current).ok, true);
});

test('目前世界的可見敵軍建築也走原生命中與一次命令，查看定位建築中心', () => {
  const { g } = fixture(), core = g.getTownCenter(), target = g.addBuilding('tower', core.x + core.w + 1, core.y, true);
  target.team = 'enemy'; assert.equal(g.isVisible(target), true);
  const counts = countCommands(g);
  assert.equal(attackSelectedVisibleTarget(g, target).ok, true); assert.ok(g.selection.every(u => u.target === target));
  const result = focusVisibleTarget(g, target); assert.equal(result.ok, true); settleCamera(g); assertPoint(projectedCenter(g, target), result.spot);
  assert.deepEqual(counts(), { commands: 1, sounds: 1, markers: 1 });
});

test('原生focusAt只設定目標而非瞬移；查看中心會保留該緩動語義', () => {
  const { g, target } = fixture(), before = { ...g.camera }, focus = g.focusAt.bind(g); let calls = 0;
  g.focusAt = (...args) => { calls++; const result = focus(...args); assert.equal(g.camera.x, before.x); assert.equal(g.camera.y, before.y); return result; };
  const result = focusVisibleTarget(g, target);
  assert.deepEqual(result, { ok: true, targetId: target.id, spot: { x: window.innerWidth / 2, y: window.innerHeight / 2 } });
  assert.equal(calls, 1); assert.equal(g.camera.x, before.x); assert.equal(g.camera.y, before.y);
  assert.notEqual(g.camera.targetY, before.targetY); settleCamera(g); assertPoint(projectedCenter(g, target), result.spot);
});

test('窄窗與寬窗中心被HUD擋住可上移，依原生目標縮放計算偏移且不改縮放', () => {
  const previous = { ...window };
  try {
    for (const viewport of [{ w: 390, h: 844 }, { w: 1440, h: 900 }]) {
      window.innerWidth = viewport.w; window.innerHeight = viewport.h;
      const { g, target } = fixture(), initial = { ...g.camera }, seen = [];
      assert.notEqual(initial.zoom, initial.targetZoom);
      const canPoint = p => { seen.push(p); return p.y < viewport.h * .4; };
      const result = focusVisibleTarget(g, target, { viewport, canPoint });
      assert.equal(result.ok, true); assertPoint(seen[0], { x: viewport.w / 2, y: viewport.h / 2 });
      assertPoint(result.spot, { x: viewport.w / 2, y: viewport.h * .3 });
      assert.equal(g.camera.x, initial.x); assert.equal(g.camera.y, initial.y);
      assert.equal(g.camera.zoom, initial.zoom); assert.equal(g.camera.targetZoom, initial.targetZoom);
      settleCamera(g); assertPoint(projectedCenter(g, target), result.spot);
    }
  } finally { Object.assign(window, previous); }
});

test('窄窗尚在縮小時以最終targetZoom偏移，保留原生兩軸與縮放緩動', () => {
  const previous = { ...window }, viewport = { w: 390, h: 844 };
  try {
    window.innerWidth = viewport.w; window.innerHeight = viewport.h;
    const { g, target } = fixture(); g.camera.zoom = 1.35; g.camera.targetZoom = .78;
    const initial = { ...g.camera }, before = withoutCamera(g);
    const result = focusVisibleTarget(g, target, { viewport, canPoint: p => p.x > viewport.w * .7 && p.y < viewport.h * .4 });
    assert.equal(result.ok, true); assert.notEqual(initial.zoom, initial.targetZoom);
    assert.equal(g.camera.x, initial.x); assert.equal(g.camera.y, initial.y);
    assert.equal(g.camera.zoom, initial.zoom); assert.equal(g.camera.targetZoom, initial.targetZoom);
    settleCamera(g); assertPoint(projectedCenter(g, target), result.spot);
    assert.ok(Math.abs(g.camera.zoom - initial.targetZoom) < 1e-7); assert.deepEqual(withoutCamera(g), before);
  } finally { Object.assign(window, previous); }
});

test('中心與上方都被擋可選右上free spot，原生相機兩軸緩動後落在合法點', () => {
  const { g, target } = fixture(), viewport = { w: window.innerWidth, h: window.innerHeight }, seen = [];
  const canPoint = p => { seen.push(p); return p.x > viewport.w * .7 && p.y < viewport.h * .4; };
  const result = focusVisibleTarget(g, target, { viewport, canPoint });
  assert.equal(result.ok, true); assert.equal(seen.length, 3); assert.ok(canPoint(result.spot));
  settleCamera(g); assertPoint(projectedCenter(g, target), result.spot);
});

test('查看找不到free spot完全不動相機、不下命令、不清armed模式', () => {
  const { g, target } = fixture(); g.orderMode = 'patrol'; const before = snapshot(g), counts = countCommands(g); let samples = 0;
  g.focusAt = () => { throw Error('找不到點時不可focus'); };
  g.pickAt = () => { throw Error('查看不需要pick'); };
  assert.deepEqual(focusVisibleTarget(g, target, { canPoint: () => { samples++; return false; } }), { ok: false, reason: 'noPoint' });
  assert.ok(samples > 0 && samples <= 16); assert.equal(g.orderMode, 'patrol'); assert.deepEqual(snapshot(g), before); assert.deepEqual(counts(), { commands: 0, sounds: 0, markers: 0 });
});

test('英雄直控拒絕查看，不取代追蹤相機或讀取Canvas位置', () => {
  const { g, target } = fixture(); g.toggleHeroControl(); g.keys.add('s'); const before = snapshot(g), selection = g.selection;
  assert.deepEqual(focusVisibleTarget(g, target, { canPoint() { throw Error('英雄直控不應尋點'); } }), { ok: false, reason: 'unavailable' });
  assert.equal(g.selection, selection); assert.ok(g.keys.has('s')); assert.deepEqual(snapshot(g), before);
});

test('人工查看不要求選兵，空選及混選保留原狀，也不改hero／keys／orderMode', () => {
  for (const mixed of [false, true]) {
    const { g, target } = fixture(); g.setSelection(mixed ? [g.hero, g.units.find(u => u.type === 'villager'), g.selection[0]] : []);
    g.orderMode = 'guard'; g.keys.add('d'); g.keys.add('q'); const selection = g.selection, before = withoutCamera(g), counts = countCommands(g);
    assert.equal(focusVisibleTarget(g, target).ok, true);
    assert.equal(g.selection, selection); assert.equal(g.orderMode, 'guard'); assert.deepEqual([...g.keys], ['d', 'q']);
    assert.equal(g.heroControl, false); assert.deepEqual(withoutCamera(g), before); assert.deepEqual(counts(), { commands: 0, sounds: 0, markers: 0 });
  }
});

test('查看只更新相機目標；後續每幀不再讀Canvas配置，也不消耗模擬或視覺RNG', () => {
  const { g, target } = fixture(), before = withoutCamera(g), rng = g.rng.state, visual = g.visualRng?.state;
  const original = { ...g.camera }; let samples = 0;
  assert.equal(focusVisibleTarget(g, target, { canPoint: () => { samples++; return true; } }).ok, true);
  assert.deepEqual({ ...g.camera, targetX: original.targetX, targetY: original.targetY }, original);
  const atClick = samples; settleCamera(g);
  assert.equal(samples, atClick); assert.deepEqual(withoutCamera(g), before); assert.equal(g.rng.state, rng); assert.equal(g.visualRng?.state, visual);
});

test('無效視口或目標縮放回noPoint，不將NaN或Infinity寫入相機', () => {
  for (const kind of ['zero', 'negative', 'nan', 'infinite', 'zoom']) {
    const { g, target } = fixture(), viewport = { w: window.innerWidth, h: window.innerHeight };
    if (kind === 'zero') viewport.w = 0;
    if (kind === 'negative') viewport.h = -1;
    if (kind === 'nan') viewport.w = NaN;
    if (kind === 'infinite') viewport.h = Infinity;
    if (kind === 'zoom') g.camera.targetZoom = 0;
    const before = snapshot(g);
    assert.equal(focusVisibleTarget(g, target, { viewport }).reason, 'noPoint', kind); assert.deepEqual(snapshot(g), before);
  }
});

test('原生相機邊界無法容納任何free spot時回noPoint，不製造緩動後被裁掉的假定位', () => {
  const { g, target } = fixture(); target.x = g.world.size - 1; target.y = 1;
  g.spawnUnit('militia', target.x - 1, target.y, 'player'); assert.equal(g.isVisible(target), true);
  const before = snapshot(g);
  assert.deepEqual(focusVisibleTarget(g, target, { viewport: { w: 390, h: 844 } }), { ok: false, reason: 'noPoint' });
  assert.deepEqual(snapshot(g), before);
});

test('原生focusAt例外傳出，不發令或建立持續相機工作', () => {
  const { g, target } = fixture(), counts = countCommands(g), before = snapshot(g);
  g.focusAt = () => { throw Error('原生查看失敗'); };
  assert.throws(() => focusVisibleTarget(g, target), /原生查看失敗/);
  assert.deepEqual(snapshot(g), before); assert.deepEqual(counts(), { commands: 0, sounds: 0, markers: 0 });
});
