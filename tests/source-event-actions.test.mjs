import test from 'node:test';
import assert from 'node:assert/strict';

globalThis.document = { documentElement: { dataset: {} }, dispatchEvent() {} };
globalThis.window = { innerWidth: 1440, innerHeight: 900 };
const { Game } = await import('../js/game.js');
const { observeCoreDamage, coreDamageText, installCoreDamageReadback } = await import('../js/core-damage-readback.js');
const { battleArmy } = await import('../js/battle-actions.js');
const { defenseClickPoint } = await import('../js/core-defense.js');
const { setLocale } = await import('../js/i18n.js');
const { STRINGS } = await import('../js/locales.js');

const snapshot = g => { const s = structuredClone(g.snapshot()); delete s.savedAt; return s; };
const withoutCamera = g => { const s = snapshot(g); delete s.camera; return s; };
function fixture() {
  const g = new Game(); g.newRun(42, { civ: 'FRK' }); g.start();
  const source = g.spawnUnit('militia', g.hero.x + 2, g.hero.y + 2, 'enemy');
  const observer = observeCoreDamage(g);
  g.setSelection(battleArmy(g).slice(0, 2));
  assert.ok(g.isVisible(source));
  return { g, source, observer, core: g.getTownCenter() };
}
function hit(f, amount = 20, source = f.source) { f.g.applyDamage(f.core, amount, source, 'melee'); return f.observer.view(); }
function capture(f, action = 'attack', kind = 'last', token, options) {
  const view = f.observer.view(), row = kind === 'last' ? view : view?.peak;
  const result = f.observer.captureAction(kind, token === undefined ? row?.token : token, action, options);
  assert.equal(result.ok, true); assert.ok(result.lease); return result.lease;
}
function counts(g) {
  let commands = 0, sounds = 0, markers = 0;
  const issue = g.issueCommand.bind(g), marker = g.addCommandMarker.bind(g);
  g.issueCommand = (...args) => { commands++; return issue(...args); };
  g.addCommandMarker = (...args) => { markers++; return marker(...args); };
  g.sound = { command() { sounds++; } };
  return () => ({ commands, sounds, markers });
}
const none = { commands: 0, sounds: 0, markers: 0 };

test('同tick同來源同值的每次真正扣血都有不同、不透明且不可改的事件身分', () => {
  const f = fixture(), first = hit(f), second = hit(f);
  assert.equal(first.loss, second.loss); assert.equal(first.at, second.at); assert.equal(first.sourceId, second.sourceId);
  assert.ok(first.token); assert.notEqual(first.token, second.token); assert.equal(second.peak.token, first.token);
  assert.equal(Object.isFrozen(first.token), true); assert.deepEqual(Reflect.ownKeys(first.token), []);
  assert.equal(Object.values(second).includes(f.g.world), false); assert.equal(Object.values(second).includes(f.source), false);
  f.core.shield = 100; hit(f); assert.equal(f.observer.view().token, second.token);
});

test('last與peak各綁各自事件及同名實體；原生完整命令只送向所選行一次', () => {
  for (const kind of ['last', 'peak']) {
    const f = fixture(), second = f.g.spawnUnit('militia', f.source.x + 3, f.source.y, 'enemy');
    hit(f, 100); const view = hit(f, 20, second), expected = kind === 'last' ? second : f.source;
    assert.equal(view.name, view.peak.name); assert.notEqual(view.token, view.peak.token);
    const totals = counts(f.g), lease = capture(f, 'attack', kind);
    const result = f.observer.activateAction(lease);
    assert.equal(result.ok, true); assert.equal(result.targetId, expected.id); assert.equal(result.count, 2);
    assert.deepEqual(totals(), { commands: 1, sounds: 1, markers: 1 });
    for (const u of f.g.selection) { assert.equal(u.target, expected); assert.equal(u.manualAttack, true); assert.equal(u.retargetTimer, 1.1); }
  }
});

test('過期last即使保留為peak也不能悄改行別；偽造token與action一律拒絕', () => {
  const f = fixture(), first = hit(f, 100); hit(f, 20);
  for (const [kind, token, action] of [['last', first.token, 'attack'], ['last', {}, 'attack'], ['other', first.token, 'attack'], ['peak', first.token, 'move']]) {
    const before = snapshot(f.g), result = f.observer.captureAction(kind, token, action);
    assert.equal(result.ok, false); assert.equal(result.reason, 'changed'); assert.deepEqual(snapshot(f.g), before);
  }
  assert.equal(f.observer.captureAction('peak', first.token, 'attack').ok, true);
});

test('新的last不取代仍顯示的peak；同值隱藏peak則取消該行操作', () => {
  const f = fixture(); hit(f, 100); hit(f, 20); const peakLease = capture(f, 'attack', 'peak');
  hit(f, 30); assert.equal(f.observer.activateAction(peakLease).ok, true);
  const disappearing = capture(f, 'attack', 'peak'), peakToken = f.observer.view().peak.token, totals = counts(f.g);
  hit(f, 100); assert.equal(coreDamageText(f.observer.view()).includes('\n'), false);
  assert.equal(f.observer.activateAction(disappearing).ok, false);
  assert.equal(f.observer.captureAction('peak', peakToken, 'attack').ok, false); assert.deepEqual(totals(), none);
});

test('憑證只可用一次，偽造、取消、重複啟用都不能重送或退回移動', () => {
  const f = fixture(); hit(f); const totals = counts(f.g), lease = capture(f);
  assert.equal(Object.isFrozen(lease), true); assert.deepEqual(Reflect.ownKeys(lease), []);
  assert.equal(f.observer.activateAction(lease).ok, true);
  const after = snapshot(f.g);
  for (const stale of [lease, {}, null]) assert.equal(f.observer.activateAction(stale).reason, 'changed');
  const cancelled = capture(f); f.observer.cancelAction(cancelled); assert.equal(f.observer.activateAction(cancelled).ok, false);
  assert.deepEqual(snapshot(f.g), after); assert.deepEqual(totals(), { commands: 1, sounds: 1, markers: 1 });
});

for (const change of ['same-source-hit', 'same-name-hit', 'world', 'wave', 'restore', 'newRun', 'selection-count', 'selection-entity', 'selection-order', 'hero', 'order', 'phase', 'pause', 'blocked', 'placement', 'menu', 'dead', 'unseen', 'same-id-replacement', 'core-replacement']) {
  test(`啟用前${change}改變即取消，不下錯令且不動快照與兩種RNG`, () => {
    const f = fixture(); hit(f, 100); const lease = capture(f), saved = snapshot(f.g), totals = counts(f.g);
    if (change === 'same-source-hit') hit(f, 20);
    if (change === 'same-name-hit') hit(f, 20, f.g.spawnUnit('militia', f.source.x + 3, f.source.y, 'enemy'));
    if (change === 'world') f.g.world = { ...f.g.world };
    if (change === 'wave') f.g.waveIndex++;
    if (change === 'restore') { f.g.restore(saved); f.g.start(); }
    if (change === 'newRun') { f.g.newRun(42, { civ: 'FRK' }); f.g.start(); }
    if (change === 'selection-count') f.g.selection = f.g.selection.slice(0, 1);
    if (change === 'selection-entity') f.g.selection = [{ ...f.g.selection[0] }, f.g.selection[1]];
    if (change === 'selection-order') f.g.selection.reverse();
    if (change === 'hero') f.g.heroControl = true;
    if (change === 'order') f.g.orderMode = 'guard';
    if (change === 'phase') f.g.phase = 'boon';
    if (change === 'pause') f.g.paused = true;
    if (change === 'placement') f.g.placement = { type: 'house' };
    if (change === 'menu') f.g.inMenu = true;
    if (change === 'dead') f.source.alive = false;
    if (change === 'unseen') f.g.isVisible = () => false;
    if (change === 'same-id-replacement') f.g.units = f.g.units.map(u => u === f.source ? { ...u } : u);
    if (change === 'core-replacement') f.g.buildings = f.g.buildings.map(u => u === f.core ? { ...u } : u);
    const before = snapshot(f.g), rng = f.g.rng.state, visual = f.g.visualRng.state, selection = f.g.selection, mode = f.g.orderMode;
    assert.equal(f.observer.activateAction(lease, { blocked: change === 'blocked' }).ok, false);
    assert.deepEqual(totals(), none); assert.deepEqual(snapshot(f.g), before); assert.equal(f.g.rng.state, rng); assert.equal(f.g.visualRng.state, visual);
    assert.equal(f.g.selection, selection); assert.equal(f.g.orderMode, mode);
    assert.equal(f.observer.activateAction(lease).ok, false);
  });
}

test('驗證發現中途改變後永久取消，改回相同選兵也不能復活舊憑證', () => {
  const f = fixture(); hit(f); const lease = capture(f), selection = [...f.g.selection], totals = counts(f.g);
  f.g.selection = []; assert.equal(f.observer.validateAction(lease).ok, false);
  f.g.selection = selection; assert.equal(f.observer.activateAction(lease).ok, false); assert.deepEqual(totals(), none);
});

test('已失視野事件永久去身分，後來再見或同名新敵都不能重新辨認', () => {
  const f = fixture(), first = hit(f, 100), lease = capture(f);
  f.g.isVisible = () => false; assert.equal(f.observer.view().name, null);
  f.g.isVisible = () => true;
  assert.equal(f.observer.captureAction('last', first.token, 'view').ok, false);
  assert.equal(f.observer.activateAction(lease).ok, false);
  const other = f.g.spawnUnit('militia', f.source.x + 3, f.source.y, 'enemy'); const view = hit(f, 20, other);
  assert.equal(view.peak.name, null); assert.equal(view.peak.token, first.token); assert.equal(view.sourceId, other.id);
});

test('本來未知的來源不建立入口，微量與同顯示精度最大值仍只顯一行', () => {
  const f = fixture(); f.g.isVisible = () => false; const v = hit(f);
  f.g.isVisible = () => true; assert.equal(f.observer.captureAction('last', v.token, 'view').ok, false);
  const raw = { loss: 4.001, at: 50, name: null, peak: { loss: 4.004, at: 49, name: null } };
  assert.equal(coreDamageText(raw).includes('\n'), false);
});

test('空選能查看，混選／英雄直控／非正式戰士不能反擊；查看不偷切模式', () => {
  for (const selection of ['none', 'hero', 'worker', 'direct', 'stale', 'dead']) {
    const f = fixture(); hit(f); const token = f.observer.view().token;
    if (selection === 'none') f.g.selection = [];
    if (selection === 'hero') f.g.selection.push(f.g.hero);
    if (selection === 'worker') f.g.selection.push(f.g.units.find(u => u.type === 'villager'));
    if (selection === 'direct') f.g.heroControl = true;
    if (selection === 'stale') f.g.selection = [{ ...f.g.selection[0] }];
    if (selection === 'dead') f.g.selection[0].alive = false;
    f.g.orderMode = 'guard'; const before = snapshot(f.g), totals = counts(f.g), keys = [...f.g.keys];
    assert.equal(f.observer.captureAction('last', token, 'attack').ok, false, selection);
    assert.deepEqual(snapshot(f.g), before);
    const view = f.observer.captureAction('last', token, 'view');
    if (selection === 'direct') assert.equal(view.ok, false);
    else { assert.equal(view.ok, true); assert.equal(f.observer.activateAction(view.lease).ok, true); }
    assert.deepEqual(withoutCamera(f.g), (() => { const s = structuredClone(before); delete s.camera; return s; })());
    assert.equal(f.g.orderMode, 'guard'); assert.deepEqual([...f.g.keys], keys); assert.deepEqual(totals(), none);
  }
});

test('大量view與capture／validate／cancel完全不查原生pick、Canvas，不動快照及兩種RNG', () => {
  const f = fixture(); hit(f); f.g.orderMode = 'guard'; f.g.keys.add('a'); const before = snapshot(f.g), rng = f.g.rng.state, visual = f.g.visualRng.state;
  f.g.pickAt = () => { throw Error('讀取不准pick'); };
  for (let i = 0; i < 100; i++) {
    const lease = capture(f, i % 2 ? 'view' : 'attack'); assert.equal(f.observer.validateAction(lease).ok, true);
    f.observer.cancelAction(lease); coreDamageText(f.observer.view());
  }
  assert.deepEqual(snapshot(f.g), before); assert.equal(f.g.rng.state, rng); assert.equal(f.g.visualRng.state, visual);
  assert.equal(f.g.orderMode, 'guard'); assert.deepEqual([...f.g.keys], ['a']);
});

test('無Canvas可用點或無原生命中點均不發令、不清原模式；第一點被擋可查後續合法點', () => {
  for (const kind of ['covered', 'noPick', 'later']) {
    const f = fixture(); hit(f); f.g.orderMode = 'patrol'; const totals = counts(f.g), before = snapshot(f.g); let points = 0;
    if (kind === 'noPick') f.g.pickAt = () => null;
    const result = f.observer.activateAction(capture(f), { canPoint: () => { points++; return kind === 'later' ? points > 1 : kind !== 'covered'; } });
    if (kind === 'later') { assert.equal(result.ok, true); assert.ok(points > 1); assert.equal(totals().commands, 1); }
    else { assert.equal(result.reason, 'noPoint'); assert.deepEqual(totals(), none); assert.deepEqual(snapshot(f.g), before); assert.equal(f.g.orderMode, 'patrol'); }
  }
});

test('啟用時最後一次native pick換成另一同名敵人也拒絕，不送move或替代攻擊', () => {
  const f = fixture(); hit(f); const lease = capture(f), nativePick = f.g.pickAt.bind(f.g), totals = counts(f.g), before = snapshot(f.g); let picks = 0;
  f.g.pickAt = (x, y) => ++picks === 1 ? nativePick(x, y) : { ...f.source };
  assert.equal(f.observer.activateAction(lease).reason, 'noPoint'); assert.equal(picks, 2);
  assert.deepEqual(totals(), none); assert.deepEqual(snapshot(f.g), before);
});

test('查看沒有任何可用Canvas位置時也不改相機或原軍令', () => {
  const f = fixture(); hit(f); f.g.orderMode = 'guard'; const before = snapshot(f.g), totals = counts(f.g);
  assert.equal(f.observer.activateAction(capture(f, 'view'), { canPoint: () => false }).reason, 'noPoint');
  assert.deepEqual(snapshot(f.g), before); assert.equal(f.g.orderMode, 'guard'); assert.deepEqual(totals(), none);
});

test('合法反擊與同點原生右鍵的完整快照及全部命令欄位相同', () => {
  const a = fixture(), b = fixture(); hit(a); hit(b);
  for (const f of [a, b]) {
    f.g.orderMode = 'guard'; f.g.keys.add('d');
    for (const u of f.g.selection) Object.assign(u, { tacticalOrder: { type: 'guard', protectedId: f.core.id }, target: f.g.hero, targetPos: { x: 20, y: 21 }, state: 'hold', hold: true, manualAttack: false, retargetTimer: 9, blockedTargets: { old: 4 }, orderFailure: 'blocked', _progress: { x: 1 }, _nav: { x: 2 } });
  }
  const left = counts(a.g), right = counts(b.g), point = defenseClickPoint(b.g, b.source), selection = a.g.selection;
  b.g.orderMode = null; b.g.issueCommand(point.x, point.y);
  assert.equal(a.observer.activateAction(capture(a)).ok, true);
  assert.deepEqual(snapshot(a.g), snapshot(b.g)); assert.deepEqual(a.g.commandMarkers, b.g.commandMarkers); assert.deepEqual(left(), right());
  assert.equal(a.g.selection, selection); assert.equal(a.g.orderMode, null); assert.deepEqual([...a.g.keys], ['d']);
});

test('反擊沒有持續工作，後續原生移動、停止、護衛立即覆蓋而不重送', () => {
  for (const later of ['move', 'stop', 'guard']) {
    const f = fixture(); hit(f); assert.equal(f.observer.activateAction(capture(f)).ok, true); const totals = counts(f.g);
    if (later === 'move') f.g.commandMove(f.g.selection, 20, 21);
    if (later === 'stop') f.g.command('stop');
    if (later === 'guard') { f.g.orderMode = 'guard'; const p = defenseClickPoint(f.g, f.core); assert.ok(p); assert.equal(f.g.issueTacticalCommand(p.x, p.y), true); }
    const after = snapshot(f.g); for (let i = 0; i < 20; i++) f.observer.view();
    assert.deepEqual(snapshot(f.g), after); assert.equal(totals().commands, 0);
    for (const u of f.g.selection) { assert.equal(u.manualAttack, false); assert.notEqual(u.target, f.source); }
  }
});

test('查看只動原生相機目標，沒有兵、按鍵、命令、HP、資源或兩種RNG副作用', () => {
  const f = fixture(); hit(f); f.g.selection = []; f.g.orderMode = 'guard'; f.g.keys.add('d'); const before = withoutCamera(f.g), rng = f.g.rng.state, visual = f.g.visualRng.state, camera = { ...f.g.camera }, totals = counts(f.g);
  f.g.pickAt = () => { throw Error('查看不准pick'); };
  const result = f.observer.activateAction(capture(f, 'view')); assert.equal(result.ok, true);
  assert.deepEqual({ ...f.g.camera, targetX: camera.targetX, targetY: camera.targetY }, camera);
  assert.deepEqual(withoutCamera(f.g), before); assert.equal(f.g.rng.state, rng); assert.equal(f.g.visualRng.state, visual); assert.deepEqual(totals(), none);
});

test('原生攻擊與相機異常原樣傳出，憑證已消耗；UI失敗不攔截致命傷害', () => {
  for (const action of ['view', 'attack']) {
    const f = fixture(); hit(f); const lease = capture(f, action), nativeError = Error('原生異常');
    f.g[action === 'view' ? 'focusAt' : 'issueCommand'] = () => { throw nativeError; };
    assert.throws(() => f.observer.activateAction(lease), e => e === nativeError);
    assert.equal(f.observer.activateAction(lease).ok, false);
  }
  const f = fixture(); f.g.isVisible = () => { throw Error('觀察失敗'); }; f.g.applyDamage(f.core, 10000, f.source, 'melee');
  assert.equal(f.g.phase, 'defeat'); assert.ok(f.observer.diagnostics().faults > 0);
});

test('事件token配置失敗仍保留原生致命傷害、敗北與兩種RNG結果', () => {
  const f = fixture(), baseline = fixture(); f.core.hp = baseline.core.hp = 17;
  const freeze = Object.freeze;
  try { Object.freeze = () => { throw Error('額外觀察配置失敗'); }; f.g.applyDamage(f.core, 10000, f.source, 'melee'); }
  finally { Object.freeze = freeze; }
  baseline.g.applyDamage(baseline.core, 10000, baseline.source, 'melee');
  assert.deepEqual(snapshot(f.g), snapshot(baseline.g)); assert.equal(f.g.phase, 'defeat'); assert.ok(f.observer.diagnostics().faults > 0);
  assert.equal(f.g.rng.state, baseline.g.rng.state); assert.equal(f.g.visualRng.state, baseline.g.visualRng.state);
});

class ElementStub {
  constructor(tag = 'div') { this.tagName = tag.toUpperCase(); this.children = []; this.listeners = new Map(); this.dataset = {}; this.attributes = {}; this.hidden = false; this.disabled = false; this._text = ''; }
  append(...nodes) { this.children.push(...nodes); for (const n of nodes) n.parentElement = this; }
  insertBefore(node, before) { const i = this.children.indexOf(before); if (i < 0) this.append(node); else { this.children.splice(i, 0, node); node.parentElement = this; } }
  set textContent(v) { this._text = String(v); this.children = []; }
  get textContent() { return this._text + this.children.map(n => n.textContent).join(''); }
  setAttribute(k, v) { this.attributes[k] = String(v); }
  getAttribute(k) { return this.attributes[k] ?? null; }
  addEventListener(k, fn) { if (!this.listeners.has(k)) this.listeners.set(k, []); this.listeners.get(k).push(fn); }
  querySelector(selector) { return this.children.find(n => selector === '.battle-hint' && n.className === 'battle-hint') || null; }
  fire(type, values = {}) {
    const e = { type, target: this, currentTarget: this, button: 0, isPrimary: true, pointerId: 1, key: '', repeat: false, stopped: false, prevented: false, stopPropagation() { this.stopped = true; }, preventDefault() { this.prevented = true; }, ...values };
    for (const fn of this.listeners.get(type) || []) fn(e); return e;
  }
}
function mount() {
  const saved = { document: globalThis.document, window: globalThis.window };
  const root = new ElementStub('section'), hint = new ElementStub('p'), canvas = new ElementStub('canvas'); hint.className = 'battle-hint'; root.append(hint);
  const docEvents = new ElementStub(), winEvents = new ElementStub(); let pointChecks = 0, canvasAt = () => canvas, lineOpen = false;
  globalThis.document = { documentElement: { dataset: {} }, createElement: tag => new ElementStub(tag), querySelector: selector => selector === '#battle-actions' ? root : selector === '#battle-line-panel:not([hidden])' && lineOpen ? new ElementStub() : null, addEventListener: docEvents.addEventListener.bind(docEvents), dispatchEvent() {}, elementFromPoint(x, y) { pointChecks++; return canvasAt(x, y); } };
  globalThis.window = { innerWidth: 1440, innerHeight: 900, addEventListener: winEvents.addEventListener.bind(winEvents) };
  const g = new Game(); g.newRun(42, { civ: 'FRK' }); g.start();
  const source = g.spawnUnit('militia', g.hero.x + 2, g.hero.y + 2, 'enemy'); g.setSelection(battleArmy(g).slice(0, 2));
  const ui = { update() {}, el: { howto: { hidden: true } } }, installed = installCoreDamageReadback(g, ui, { canvas }), core = g.getTownCenter();
  const note = root.children.find(n => n.id === 'core-damage-readback');
  const descendants = node => node.children.flatMap(n => [n, ...descendants(n)]);
  const button = (kind, action) => descendants(note).find(n => n.dataset.sourceKind === kind && n.dataset.sourceAction === action);
  const restore = () => Object.assign(globalThis, saved);
  return { g, ui, source, core, installed, note, button, winEvents, docEvents, canvas, restore, pointChecks: () => pointChecks, setCanvasAt: fn => { canvasAt = fn; }, setLineOpen: open => { lineOpen = open; } };
}
function usingMount(fn) { const m = mount(); try { return fn(m); } finally { m.restore(); } }
function mountHit(m, amount = 20, source = m.source) { m.g.applyDamage(m.core, amount, source, 'melee'); m.ui.update(); }

test('HUD固定節點、零選兵仍可查看，讀取／hover／focus及更新不做pick或Canvas查詢', () => usingMount(m => {
  mountHit(m); const view = m.button('last', 'view'), attack = m.button('last', 'attack'), totals = counts(m.g);
  assert.ok(view); assert.ok(attack); m.g.selection = []; m.ui.update();
  assert.equal(view.disabled, false); assert.equal(attack.disabled, true); assert.ok(attack.textContent.includes('0'));
  m.g.pickAt = () => { throw Error('未啟用不可pick'); };
  for (let i = 0; i < 20; i++) { m.ui.update(); view.fire('pointerenter'); view.fire('focus'); }
  assert.equal(m.pointChecks(), 0); assert.deepEqual(totals(), none); assert.equal(m.button('last', 'view'), view);
}));

test('HUD按下後新傷到達取消，按下前顯示舊事件亦拒絕；不偷偷換最新行', () => usingMount(m => {
  mountHit(m, 100); const attack = m.button('last', 'attack'), totals = counts(m.g);
  attack.fire('pointerdown'); m.g.applyDamage(m.core, 20, m.source, 'melee'); attack.fire('click');
  assert.deepEqual(totals(), none);
  m.ui.update(); m.g.applyDamage(m.core, 30, m.source, 'melee'); attack.fire('pointerdown'); attack.fire('click');
  assert.deepEqual(totals(), none);
  m.ui.update(); attack.fire('pointerdown'); attack.fire('click'); attack.fire('click');
  assert.deepEqual(totals(), { commands: 1, sounds: 1, markers: 1 });
}));

test('HUD來源失效不受節流，立即移除名稱、方向、按鈕身份與完整tooltip', () => usingMount(m => {
  mountHit(m, 100); const oldName = m.installed.view().name, attack = m.button('last', 'attack'), totals = counts(m.g);
  attack.fire('pointerdown'); m.g.isVisible = () => false; m.ui.update();
  assert.equal(m.note.textContent.includes(oldName), false); assert.equal(m.note.textContent.includes('←'), false);
  for (const action of ['view', 'attack']) { const b = m.button('last', action); assert.equal(b.hidden, true); assert.equal(b.title, ''); assert.equal(b.getAttribute('aria-label'), ''); }
  attack.fire('click'); assert.deepEqual(totals(), none);
}));

test('HUD Enter與Space保留native啟用，repeat不再發令，Tab保留導航並阻擋全域hero快捷鍵', () => usingMount(m => {
  mountHit(m); const attack = m.button('last', 'attack'), totals = counts(m.g);
  for (const key of ['Enter', ' ']) {
    const down = attack.fire('keydown', { key }); assert.equal(down.stopped, true); assert.equal(down.prevented, false);
    if (key === ' ') { const up = attack.fire('keyup', { key }); assert.equal(up.stopped, true); assert.equal(up.prevented, false); }
    attack.fire('click');
    const repeated = attack.fire('keydown', { key, repeat: true }); assert.equal(repeated.prevented, true); attack.fire('click');
    attack.fire('keyup', { key });
  }
  const tab = attack.fire('keydown', { key: 'Tab' }); assert.equal(tab.stopped, true); assert.equal(tab.prevented, false);
  assert.deepEqual(totals(), { commands: 2, sounds: 2, markers: 2 }); assert.equal(m.g.heroControl, false); assert.equal(m.g.paused, false);
}));

for (const event of ['blur', 'pointercancel', 'window-blur', 'military-key', 'outside-pointerup', 'selection-change', 'phase-change', 'blocked', 'line-panel']) {
  test(`HUD未完成操作遇到${event}即取消，改回亦不自動重送`, () => usingMount(m => {
    mountHit(m); const attack = m.button('last', 'attack'), totals = counts(m.g), selection = m.g.selection;
    attack.fire('pointerdown');
    if (event === 'blur' || event === 'pointercancel') attack.fire(event);
    if (event === 'window-blur') m.winEvents.fire('blur');
    if (event === 'military-key') m.winEvents.fire('keydown', { key: 'g' });
    if (event === 'outside-pointerup') m.winEvents.fire('pointerup', { target: m.canvas });
    if (event === 'selection-change') { m.g.selection = []; m.ui.update(); m.g.selection = selection; }
    if (event === 'phase-change') { m.g.phase = 'boon'; m.ui.update(); m.g.phase = 'prep'; }
    if (event === 'blocked') { m.ui.gmOpen = true; m.ui.update(); m.ui.gmOpen = false; }
    if (event === 'line-panel') { m.setLineOpen(true); m.ui.update(); assert.equal(attack.disabled, true); m.setLineOpen(false); }
    attack.fire('click'); assert.deepEqual(totals(), none);
  }));
}

test('HUD相同顯示文字仍更新事件身分，repeat與殘留click不啟用新事件', () => usingMount(m => {
  mountHit(m); const attack = m.button('last', 'attack'), beforeText = m.note.textContent, totals = counts(m.g);
  attack.fire('keydown', { key: ' ' }); mountHit(m); assert.equal(m.note.textContent, beforeText);
  const repeat = attack.fire('keydown', { key: ' ', repeat: true }); assert.equal(repeat.prevented, true);
  attack.fire('keyup', { key: ' ' }); attack.fire('click'); assert.deepEqual(totals(), none);
  attack.fire('keydown', { key: ' ' }); attack.fire('keyup', { key: ' ' }); attack.fire('click');
  assert.deepEqual(totals(), { commands: 1, sounds: 1, markers: 1 });
}));

test('HUD來源消失失焦後，仍按住的Space重複鍵也不洩漏成全域暫停', () => usingMount(m => {
  mountHit(m); const attack = m.button('last', 'attack'), totals = counts(m.g);
  attack.fire('keydown', { key: ' ' }); m.g.isVisible = () => false; m.ui.update(); attack.fire('blur');
  const repeat = m.winEvents.fire('keydown', { key: ' ', repeat: true, target: m.canvas });
  assert.equal(repeat.prevented, true); assert.equal(repeat.stopped, true);
  m.winEvents.fire('keyup', { key: ' ' }); attack.fire('click'); assert.deepEqual(totals(), none);
}));

test('HUD原生例外傳出且不可重送，額外DOM呈現失敗不攔截後續原生更新與敗北', () => usingMount(m => {
  mountHit(m); const attack = m.button('last', 'attack'), nativeError = Error('原生UI反擊異常'); let commands = 0;
  m.g.issueCommand = () => { commands++; throw nativeError; };
  attack.fire('pointerdown'); assert.throws(() => attack.fire('click'), e => e === nativeError); attack.fire('click'); assert.equal(commands, 1);
  Object.defineProperty(m.note, 'title', { get() { return ''; }, set() { throw Error('DOM配置失敗'); } });
  assert.doesNotThrow(() => m.ui.update()); assert.ok(m.installed.diagnostics().uiFaults > 0); assert.equal(m.note.hidden, true);
  assert.doesNotThrow(() => m.g.applyDamage(m.core, 10000, m.source, 'melee')); assert.equal(m.g.phase, 'defeat');
}));

test('HUD canPoint限CSS視口及renderer.canvas；UI全擋不fallback，第一點被擋可用後續點', () => {
  for (const kind of ['covered', 'outside', 'later']) usingMount(m => {
    mountHit(m); const attack = m.button('last', 'attack'), totals = counts(m.g); let checked = 0;
    if (kind === 'covered') m.setCanvasAt(() => new ElementStub());
    if (kind === 'outside') { m.source.x = -500; m.source.y = -500; m.g.isVisible = () => true; }
    if (kind === 'later') m.setCanvasAt(() => ++checked === 1 ? new ElementStub() : m.canvas);
    attack.fire('pointerdown'); attack.fire('click');
    assert.equal(totals().commands, kind === 'later' ? 1 : 0);
    if (kind === 'outside') assert.equal(m.pointChecks(), 0);
    if (kind === 'later') assert.ok(checked > 1);
  });
});

test('HUD同顯示精度peak隱藏無入口；新事件與選兵人數同步且固定focus節點', () => usingMount(m => {
  mountHit(m, m.core.armor * .6 + 4.004); mountHit(m, m.core.armor * .6 + 4.001);
  const peak = m.button('peak', 'attack'), last = m.button('last', 'attack'); assert.equal(peak.hidden, true);
  mountHit(m, m.core.armor * .6 + 1); assert.equal(peak.hidden, false);
  m.g.selection = m.g.selection.slice(0, 1); m.ui.update(); assert.ok(last.textContent.includes('1')); assert.equal(m.button('last', 'attack'), last);
  const before = snapshot(m.g); last.fire('click'); assert.deepEqual(snapshot(m.g), before);
}));

test('四語提供完整入口、失效原因、實際人數、事件局內時間與tooltip', () => usingMount(m => {
  m.g.runTime = 510; mountHit(m);
  for (const locale of ['zh-Hant', 'zh-Hans', 'en', 'ja']) {
    setLocale(locale); m.installed.update(true);
    for (const key of ['time', 'view', 'viewHelp', 'attack', 'attackHelp', 'changed', 'select', 'unavailable', 'noPoint', 'viewed', 'issued']) assert.ok(STRINGS[locale]['coreDamage.' + key], locale + ':' + key);
    for (const action of ['view', 'attack']) { const b = m.button('last', action); assert.ok(b.title); assert.ok(b.getAttribute('aria-label')); assert.equal(b.textContent.includes('coreDamage.'), false); }
    assert.ok(m.note.textContent.includes('8:30')); assert.equal(m.note.textContent.includes('coreDamage.'), false);
  }
  setLocale('zh-Hant');
}));
