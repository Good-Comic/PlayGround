import test from 'node:test';
import assert from 'node:assert/strict';
globalThis.document = { documentElement: { dataset: {} }, dispatchEvent() {} };
globalThis.window = { innerWidth: 1440, innerHeight: 900 };
const { Game } = await import('../js/game.js');
const { observeCoreDamage, coreDamageText } = await import('../js/core-damage-readback.js');
const { setLocale } = await import('../js/i18n.js');
const fresh = () => { const g = new Game(); g.newRun(42, { civ: 'FRK' }); g.start(); return g; };
const enemy = (g, type = 'ram') => { const c = g.getTownCenter(); return g.spawnUnit(type, c.x + c.w + 1, c.y + c.h / 2, 'enemy'); };
const snap = g => { const s = g.snapshot(); delete s.savedAt; return s; };

test('真實近戰鏈的護甲後HP差、RNG及整份snapshot與未裝版相同', () => {
  const a = fresh(), b = fresh(), x = enemy(a), y = enemy(b), o = observeCoreDamage(a), c = a.getTownCenter(), hp = c.hp;
  a.attackUnit(x, c); b.attackUnit(y, b.getTownCenter());
  assert.deepEqual(snap(a), snap(b)); assert.equal(a.rng.state, b.rng.state); assert.equal(a.visualRng.state, b.visualRng.state);
  const v = o.view(); assert.equal(v.loss, hp - c.hp); assert.equal(v.sourceId, x.id); assert.ok(v.direction); assert.equal(o.diagnostics().events, 1);
});
test('完全護盾不誤報、部分護盾只算實際HP而非輸入amount', () => {
  const g = fresh(), e = enemy(g), o = observeCoreDamage(g), c = g.getTownCenter(); c.shield = 100;
  g.applyDamage(c, 20, e, 'melee'); assert.equal(o.view(), null); assert.equal(o.diagnostics().events, 0);
  c.shield = 3; const hp = c.hp; g.applyDamage(c, 20, e, 'melee');
  assert.equal(o.view().loss, hp - c.hp); assert.ok(o.view().loss < 20); assert.ok(o.view().loss > 0);
});
test('投射物抵達才記錄，絕不把射手現在位置當發射來向', () => {
  const g = fresh(), e = enemy(g, 'archer'), o = observeCoreDamage(g), c = g.getTownCenter(), hp = c.hp;
  e.target = c; e.state = 'attack'; assert.equal(o.view(), null);
  g.spawnProjectile(c.x + c.w / 2, c.y + c.h / 2, c, 20, 'enemy', 1, e); assert.equal(o.view(), null);
  g.updateProjectiles(.02); assert.equal(o.view().loss, hp - c.hp); assert.equal(o.view().sourceId, e.id); assert.equal(o.view().direction, null);
});
test('原生zone傷害只記真實城心失血，不推測火焰方向', () => {
  const g = fresh(), e = enemy(g), o = observeCoreDamage(g), c = g.getTownCenter(), hp = c.hp;
  g.zones.push({ x: c.x + 2, y: c.y + 2, r: 1, delay: .1, elapsed: 0, damage: 40, source: e, kind: 'fire', done: false });
  g.updateZones(.1); assert.equal(o.view().loss, hp - c.hp); assert.equal(o.view().direction, null);
});
test('過量致命傷只記剩餘HP，死亡／敗北原流程完全不變', () => {
  const a = fresh(), b = fresh(), x = enemy(a), y = enemy(b), o = observeCoreDamage(a); a.getTownCenter().hp = b.getTownCenter().hp = 17;
  a.applyDamage(a.getTownCenter(), 10000, x, 'melee'); b.applyDamage(b.getTownCenter(), 10000, y, 'melee');
  assert.deepEqual(snap(a), snap(b)); assert.equal(a.phase, 'defeat'); assert.equal(o.diagnostics().lastLoss, 17); assert.equal(o.view(), null);
});
test('source在受傷當時已死／未見／不在世界時只顯自己的HP損失', () => {
  for (const kind of ['dead', 'fog', 'stale', 'none']) {
    const g = fresh(), e = enemy(g), o = observeCoreDamage(g), c = g.getTownCenter();
    if (kind === 'dead') e.alive = false;
    if (kind === 'fog') g.isVisible = () => false;
    if (kind === 'stale') g.units = g.units.filter(u => u !== e);
    g.applyDamage(c, 20, kind === 'none' ? null : e, 'melee');
    const v = o.view(); assert.ok(v.loss > 0); assert.equal(v.name, null, kind); assert.equal(v.direction, null, kind); assert.equal(v.sourceId, null, kind);
  }
});
test('受傷後死亡或失視野立即去掉身分／方向，再看見也不重建追蹤', () => {
  for (const kind of ['dead', 'fog', 'stale']) {
    const g = fresh(), e = enemy(g), o = observeCoreDamage(g); g.applyDamage(g.getTownCenter(), 20, e, 'melee'); assert.ok(o.view().name);
    if (kind === 'dead') e.alive = false;
    if (kind === 'fog') g.isVisible = () => false;
    if (kind === 'stale') g.units = g.units.filter(u => u !== e);
    assert.equal(o.view().name, null, kind); assert.equal(o.view().direction, null);
    e.alive = true; g.isVisible = () => true; if (!g.units.includes(e)) g.units.push(e);
    assert.equal(o.view().name, null); assert.equal(o.view().direction, null);
  }
});
test('只是瞄準／攻擊意圖、修復或其他單位受傷不假造城心傷害', () => {
  const g = fresh(), e = enemy(g), o = observeCoreDamage(g), c = g.getTownCenter(); e.target = c; e.state = 'attack';
  assert.equal(o.view(), null); g.applyDamage(g.hero, 20, e, 'melee'); assert.equal(o.view(), null);
  c.hp -= 100; c.hp += 50; assert.equal(o.view(), null);
});
test('反覆查看與暫停不改任何模擬狀態或額外消耗兩種RNG', () => {
  const g = fresh(), e = enemy(g), o = observeCoreDamage(g); g.applyDamage(g.getTownCenter(), 20, e, 'melee'); g.paused = true;
  const before = snap(g), rng = g.rng.state, visual = g.visualRng.state, at = o.view().at;
  for (let i = 0; i < 100; i++) { o.view(); coreDamageText(o.view()); }
  assert.deepEqual(snap(g), before);
  // Native camera easing continues while paused; compare it with unmodified Game.
  const h = fresh(), other = enemy(h); h.applyDamage(h.getTownCenter(), 20, other, 'melee'); h.paused = true;
  for (let i = 0; i < 100; i++) { g.update(.05); h.update(.05); o.view(); }
  assert.deepEqual(snap(g), snap(h)); assert.equal(g.rng.state, rng); assert.equal(g.visualRng.state, visual); assert.equal(o.view().at, at);
});
test('Save/Load、新局、換world及獎勵結算清除舊UI，不改存檔schema', () => {
  for (const kind of ['load', 'new', 'world', 'boon', 'defeat']) {
    const g = fresh(), e = enemy(g), o = observeCoreDamage(g); g.applyDamage(g.getTownCenter(), 20, e, 'melee'); const save = snap(g); assert.ok(o.view());
    assert.equal(Object.keys(save).some(k => /coreDamage/i.test(k)), false);
    if (kind === 'load') { g.restore(save); g.start(); }
    if (kind === 'new') g.newRun(43, { civ: 'CHN' });
    if (kind === 'world') g.world = { ...g.world };
    if (['boon', 'defeat'].includes(kind)) g.phase = kind;
    assert.equal(o.view(), null, kind);
  }
});
test('觀察失敗不攔截致命原生傷害，原生命令異常仍原樣拋出', () => {
  const g = fresh(), e = enemy(g), o = observeCoreDamage(g); g.isVisible = () => { throw Error('OBSERVER_FAULT'); };
  g.applyDamage(g.getTownCenter(), 10000, e, 'melee'); assert.equal(g.phase, 'defeat'); assert.ok(o.diagnostics().faults > 0);
  const h = fresh(), error = Error('NATIVE_FAILURE'); h.applyDamage = () => { throw error; }; observeCoreDamage(h);
  assert.throws(() => h.applyDamage(h.getTownCenter(), 1, null), e => e === error);
});
test('四語具名／未知來源及微量損失格式正確，不把箭頭當投射方向', () => {
  const g = fresh(), e = enemy(g), o = observeCoreDamage(g); g.applyDamage(g.getTownCenter(), 20, e, 'melee');
  for (const locale of ['zh-Hant', 'zh-Hans', 'en', 'ja']) { setLocale(locale); const text = coreDamageText(o.view()); assert.ok(text.includes('−')); assert.equal(text.includes('coreDamage.'), false); assert.ok(coreDamageText({ loss: .001, at: 61, name: null, direction: null }).includes('<0.01')); }
  setLocale('zh-Hant');
});
