import test from 'node:test';
import assert from 'node:assert/strict';

globalThis.document = { documentElement: { dataset: {} }, dispatchEvent() {} };
globalThis.window = { innerWidth: 1440, innerHeight: 900 };
const { Game } = await import('../js/game.js');
const { UNIT_TYPES, BOONS } = await import('../js/data.js');
const { RESOURCES, reserveCost, canSpend, productionStatus, trainArmy } = await import('../js/stewards.js');
const { productionReadback, productionReadbackHTML, productionNumber } = await import('../js/production-readback.js');
const { installStewardUI } = await import('../js/steward-ui.js');
const { setLocale, getLocale } = await import('../js/i18n.js');
const { STRINGS } = await import('../js/locales.js');
const snapshot = game => { const s = structuredClone(game.snapshot()); delete s.savedAt; return s; };
function setup(civ = 'CHN', type = 'barracks', unit = 'militia') {
  const g = new Game(); g.newRun(42, { civ }); g.inMenu = false;
  g.resources = { food: 5000, wood: 5000, gold: 5000, stone: 5000 }; g.autoMilitary = true;
  const b = g.buildings.find(building => building.type === type) || g.addBuilding(type, 18, 18, true);
  g.stewards.military[b.id] = { enabled: true, units: [unit], queue: 1, budget: [0, 0, 0, 0], targets: { [unit]: { count: 200, priority: 1 } } };
  return { g, b, plan: g.stewards.military[b.id] };
}
const row = f => productionReadback(f.g, f.b).units[0];

test('正式Game費用、庫存、付款後底線與每項缺口皆與原生canSpend一致', () => {
  const f = setup(); f.g.stewards.reserve = [100, 80, 30, 900]; f.plan.budget = [60, 120, 50, 1000]; f.g.resources = { food: 110, wood: 99, gold: 25, stone: 0 };
  const view = productionReadback(f.g, f.b), unit = view.units[0];
  assert.deepEqual(unit.cost, f.g.unitCost('militia')); assert.equal(view.status, productionStatus(f.g, f.b));
  assert.equal(unit.resourceReady, canSpend(f.g, unit.cost, view.producerFloor));
  for (const r of RESOURCES) {
    const value = unit.resources[r], fee = unit.cost[r] || 0;
    assert.equal(value.stock, f.g.resources[r] || 0); assert.equal(value.cost, fee);
    assert.equal(value.floor, Math.max(reserveCost(f.g)[r] || 0, Number(f.plan.budget[RESOURCES.indexOf(r)]) || 0));
    assert.equal(value.after, value.stock - fee); assert.equal(value.shortage, fee > 0 ? Math.max(0, value.floor - value.after) : 0);
  }
});

test('全域與逐建築底線取max而非相加，建築保留不是花費上限', () => {
  const f = setup(), cost = f.g.unitCost('militia'); f.g.stewards.reserve = [100, 0, 0, 0]; f.plan.budget = [80, 0, 0, 0];
  f.g.resources.food = cost.food + 100; assert.equal(row(f).resourceReady, true); assert.equal(row(f).resources.food.floor, 100);
  f.plan.budget[0] = 140; assert.equal(row(f).resourceReady, false); assert.equal(row(f).resources.food.shortage, 40);
  f.plan.budget[0] = 1; f.g.resources.food = cost.food + 200; assert.equal(row(f).resourceReady, true);
});

test('費用為零或未列入的資源低於兩層保留不產生假缺口', () => {
  const f = setup(); f.g.stewards.reserve = [0, 50000, 0, 50000]; f.plan.budget = [0, 90000, 0, 90000];
  f.g.resources.wood = 0; delete f.g.resources.stone;
  const unit = row(f); assert.equal(unit.resourceReady, canSpend(f.g, unit.cost, productionReadback(f.g, f.b).producerFloor));
  for (const r of ['wood', 'stone']) { assert.equal(unit.resources[r].checked, false); assert.equal(unit.resources[r].shortage, 0); }
  assert.equal(unit.resourceReady, true); assert.ok(productionReadbackHTML(productionReadback(f.g, f.b)).includes(STRINGS[getLocale()]['production.unused']));
});

test('微小正缺口仍由原生拒絕，摘要與表格不顯零，資料保留原始精度', () => {
  const f = setup(), cost = f.g.unitCost('militia'); f.g.stewards.reserve[0] = 10; f.g.resources.food = cost.food + 10 - 1e-12;
  const unit = row(f), shortage = unit.resources.food.shortage;
  assert.ok(shortage > 0 && shortage < .01); assert.equal(unit.resourceReady, false); assert.equal(canSpend(f.g, unit.cost), false);
  assert.equal(productionNumber(shortage, true), '<0.01'); assert.equal(Number(productionNumber(shortage)), shortage);
  const html = productionReadbackHTML(productionReadback(f.g, f.b)); assert.ok(html.includes('&lt;0.01')); assert.ok(html.includes(`data-value="${String(shortage)}" data-column="shortage"`));
  assert.ok(html.includes(`data-value="${String(shortage)}" data-column="shortage">&lt;0.01</td>`));
  f.g.resources.food = cost.food + 10; assert.equal(row(f).resourceReady, true); assert.equal(row(f).resources.food.shortage, 0);
});

test('auto、ask、manual及研究中／滿級的全域保留直接沿用reserveCost', () => {
  for (const policy of ['manual', 'ask', 'auto']) for (const state of ['available', 'researching', 'max']) {
    const f = setup(); f.g.stewards.age = policy; f.g.stewards.reserve = [100, 11, 70, 5];
    if (state === 'researching') f.g.ageResearch = { remaining: 20, total: 20, to: 2 };
    if (state === 'max') f.g.ageLevel = 3;
    const view = productionReadback(f.g, f.b), ageCost = f.g.ageCost(); assert.deepEqual(view.globalFloor, reserveCost(f.g));
    for (const [i, r] of RESOURCES.entries()) {
      const base = f.g.stewards.reserve[i], fee = ageCost[r] || 0;
      const expected = policy === 'manual' || state !== 'available' ? base : policy === 'auto' ? base + fee : Math.max(base, fee);
      assert.equal(view.globalFloor[r], expected, policy + ':' + state + ':' + r);
    }
    assert.equal(view.units[0].resourceReady, canSpend(f.g, view.units[0].cost, view.producerFloor));
  }
});

test('文明與正式卡片後使用unitCost，而非基礎表或市場費率', () => {
  for (const [civ, building, type] of [['FRK', 'barracks', 'militia'], ['BYZ', 'barracks', 'spearman'], ['MAG', 'stable', 'light_cavalry']]) {
    const f = setup(civ, building, type); assert.deepEqual(row(f).cost, f.g.unitCost(type)); assert.notDeepEqual(row(f).cost, UNIT_TYPES[type].cost);
  }
  const f = setup('FRK'); const before = row(f).cost; BOONS.find(boon => boon.id === 'wartime_rotation').apply(f.g);
  assert.deepEqual(row(f).cost, f.g.unitCost('militia')); assert.notDeepEqual(row(f).cost, before);
  const sar = setup('SAR'); assert.deepEqual(row(sar).cost, sar.g.unitCost('militia')); assert.notDeepEqual(row(sar).cost, sar.g.unitCost('militia', true));
});

test('指定、空集合與未設定的合法兵種回退維持原生，排除市場／城心與未選參考', () => {
  const f = setup(); f.plan.units = ['spearman', 'archer', 'militia'];
  assert.deepEqual(productionReadback(f.g, f.b).units.map(u => u.type), ['spearman', 'militia']);
  for (const units of [[], undefined]) {
    f.plan.units = units; const view = productionReadback(f.g, f.b);
    assert.equal(view.usesFallback, true); assert.deepEqual(view.units.map(u => u.type), f.g.trainableFor(f.b).filter(type => !UNIT_TYPES[type].noAttack));
  }
  const support = f.g.addBuilding('shrine', 21, 18, true); assert.deepEqual(productionReadback(f.g, support).units, []);
  f.g.stewards.military[support.id] = { enabled: true, units: ['recruiter'] };
  assert.deepEqual(productionReadback(f.g, support).units.map(u => u.type), ['recruiter']);
  const azt = setup('AZT', 'stable', 'light_cavalry'); assert.deepEqual(productionReadback(azt.g, azt.b).units, []);
  assert.equal(productionReadback(azt.g, azt.b).status, productionStatus(azt.g, azt.b));
  assert.equal(productionReadback(f.g, f.g.getTownCenter()), null); assert.equal(productionReadback(f.g, f.g.addBuilding('market', 25, 18, true)), null);
  assert.equal(productionReadback(f.g, { ...f.b }), null);
});

for (const status of ['off', 'construction', 'manual', 'queue', 'target', 'population', 'budget', 'ready']) {
  test(`原生${status}狀態優先，資源條件通過也不保證立即生產`, () => {
    const f = setup();
    if (status === 'off') f.plan.enabled = false;
    if (status === 'construction') f.b.construction = .5;
    if (status === 'manual') f.g.trainUnit(f.b, 'militia');
    if (status === 'queue') f.b.queue = [{ type: 'militia', total: 10, remaining: 10, manual: false }];
    if (status === 'target') f.plan.targets.militia.count = 0;
    if (status === 'population') f.g.effects.militaryPopCap = 1;
    if (status === 'budget') f.g.stewards.reserve[0] = 10000;
    const before = snapshot(f.g), view = productionReadback(f.g, f.b);
    assert.equal(view.status, productionStatus(f.g, f.b)); assert.equal(view.status, status === 'construction' ? 'unavailable' : status);
    assert.equal(view.units[0].resourceReady, status !== 'budget'); assert.equal(view.units[0].canTrainNow, f.g.canTrainNow('militia'));
    assert.deepEqual(snapshot(f.g), before);
  });
}

test('人口與兵種時代條件直接沿用正式Game，其他建築佇列也計入目標與人口', () => {
  const f = setup(), other = f.g.addBuilding('barracks', 20, 18, true);
  for (const u of f.g.units) if (u.type === 'militia') u.alive = false;
  other.queue = [{ type: 'militia', total: 10, remaining: 10, manual: false }]; f.plan.targets.militia.count = 1;
  assert.equal(productionReadback(f.g, f.b).status, 'target');
  f.plan.targets.militia.count = 200; f.g.effects.militaryPopCap = f.g.militaryPopulation + f.g.queuedPopulation(false);
  assert.equal(row(f).populationRoom, false); assert.equal(productionReadback(f.g, f.b).status, 'population');
  const age = setup('CHN', 'range', 'chu_ko_nu'); age.g.ageLevel = 0; // 受控邊界，沒有替普通兵添加新時代規則。
  assert.equal(row(age).restriction, 'age'); assert.equal(row(age).canTrainNow, age.g.canTrainNow('chu_ko_nu'));
  age.g.ageLevel = 1; assert.equal(row(age).restriction, null); assert.equal(row(age).canTrainNow, true);
});

test('已有佇列費用不重扣，手動付得起而自動仍等待是合法差異', () => {
  const f = setup(), fee = f.g.unitCost('militia'); f.g.stewards.reserve[0] = f.g.resources.food;
  assert.equal(row(f).resourceReady, false); assert.equal(f.g.canAfford(fee), true);
  f.g.trainUnit(f.b, 'militia'); const paid = { ...f.g.resources }, view = productionReadback(f.g, f.b);
  assert.equal(view.status, 'manual'); assert.equal(view.units[0].resources.food.stock, paid.food);
  assert.equal(view.units[0].resources.food.after, paid.food - fee.food); assert.deepEqual(f.g.resources, paid);
});

test('反覆唯讀查詢與輸出不改完整快照、資源、佇列、游標／時窗或兩種RNG', () => {
  const f = setup(); f.g.stewards.lastMilitaryProducerId = f.b.id; f.g.stewards.nextPlanAt = 19; f.g.runTime = 61.5;
  const before = snapshot(f.g), selection = f.g.selection, rng = f.g.rng.state, visual = f.g.visualRng.state;
  for (let i = 0; i < 80; i++) productionReadbackHTML(productionReadback(f.g, f.b));
  assert.deepEqual(snapshot(f.g), before); assert.equal(f.g.selection, selection); assert.equal(f.g.rng.state, rng); assert.equal(f.g.visualRng.state, visual);
  const view = productionReadback(f.g, f.b); view.globalFloor.food = 99999; view.producerFloor.food = 99999; view.units[0].cost.food = 0; view.units[0].resources.food.stock = 0;
  assert.deepEqual(snapshot(f.g), before);
});

test('觀察後一次正式trainArmy與未觀察組完全一致，不改輪替、權重或訂單數', () => {
  const a = setup(), b = setup();
  for (const f of [a, b]) { const other = f.g.addBuilding('range', 20, 18, true); f.g.stewards.military[other.id] = { enabled: true, units: ['archer'], queue: 1 }; }
  for (let i = 0; i < 10; i++) for (const producer of a.g.buildings) productionReadback(a.g, producer);
  trainArmy(a.g); trainArmy(b.g); assert.deepEqual(snapshot(a.g), snapshot(b.g));
  assert.equal(a.g.buildings.reduce((sum, producer) => sum + producer.queue.length, 0), 1);
});

test('四語完整呈現已套用、費用、原始表格及小缺口，不顯示未翻譯key', () => {
  const f = setup(); f.g.resources.food = f.g.unitCost('militia').food - 1e-10;
  for (const locale of ['zh-Hant', 'zh-Hans', 'en', 'ja']) {
    setLocale(locale); const html = productionReadbackHTML(productionReadback(f.g, f.b));
    for (const key of ['applied', 'draft', 'refresh', 'snapshot', 'rule', 'agePolicy', 'fee', 'missing', 'resourcePassShort', 'resourcePass', 'resourceWait', 'noCost', 'resource', 'stock', 'cost', 'globalFloor', 'producerFloor', 'floor', 'after', 'shortage', 'unused', 'rawHelp', 'noUnits', 'restricted', 'draftShort', 'fallback']) assert.ok(STRINGS[locale]['production.' + key], locale + ':' + key);
    assert.equal(html.includes('production.'), false); assert.ok(html.includes('&lt;0.01')); assert.ok(html.includes('<summary>')); assert.equal(html.includes('<details open'), false);
  }
  setLocale('zh-Hant');
});

// 僅模擬表單事件與原生 FormData；生產、費用、暫停、套用和確認仍走真實 Game。
// Minimal form/event fixture; all production, costs, Apply and confirmation use the real Game.
class NodeStub {
  constructor() { this.listeners = new Map(); this.dataset = {}; this.classList = { toggle() {} }; this.textContent = ''; this.hidden = false; this.open = false; this.children = []; }
  append(node) { this.children.push(node); }
  prepend(node) { this.children.unshift(node); }
  cloneNode() { return new NodeStub(); }
  addEventListener(type, fn) { if (!this.listeners.has(type)) this.listeners.set(type, []); this.listeners.get(type).push(fn); }
  fire(type) { const event = { target: this, preventDefault() {} }; for (const fn of this.listeners.get(type) || []) fn(event); }
  showModal() { this.open = true; }
  close() { this.open = false; }
  scrollIntoView() {}
  focus() {}
}
const attrs = text => Object.fromEntries([...text.matchAll(/([\w-]+)(?:="([^"]*)")?/g)].map(m => [m[1], m[2] ?? '']));
class FormDataStub {
  constructor(form) { this.entries = Object.values(form.elements).filter(e => e.type !== 'checkbox' || e.checked).map(e => [e.name, e.value]); }
  [Symbol.iterator]() { return this.entries[Symbol.iterator](); }
  get(name) { return this.entries.find(e => e[0] === name)?.[1] ?? null; }
  has(name) { return this.entries.some(e => e[0] === name); }
}
class DialogStub extends NodeStub {
  set innerHTML(html) {
    this.html = html; this.form = new NodeStub(); this.form.elements = {};
    for (const match of html.matchAll(/<input\b([^>]*)>/g)) {
      const a = attrs(match[1]); if (!a.name) continue;
      this.form.elements[a.name] = { name: a.name, type: a.type, value: a.value ?? 'on', checked: Object.hasOwn(a, 'checked') };
    }
    for (const match of html.matchAll(/<select\b([^>]*)>([\s\S]*?)<\/select>/g)) {
      const a = attrs(match[1]), options = [...match[2].matchAll(/<option\b([^>]*)>/g)].map(m => attrs(m[1]));
      this.form.elements[a.name] = { name: a.name, type: 'select', value: (options.find(o => Object.hasOwn(o, 'selected')) || options[0]).value };
    }
    this.nodes = Object.fromEntries(['steward-workforce', 'steward-release', 'steward-gather-preview', 'steward-applied-notice', 'steward-close', 'steward-confirm', 'steward-notice'].map(id => ['#' + id, new NodeStub()]));
    this.producers = [...html.matchAll(/<details data-producer="(\d+)"/g)].map(match => {
      const node = new NodeStub(); node.dataset.producer = match[1]; node.output = new NodeStub(); node.refresh = new NodeStub(); node.status = new NodeStub(); node.draft = new NodeStub();
      node.output.hidden = true; node.querySelector = selector => selector === '[data-production-content]' ? node.output : selector === '[data-production-refresh]' ? node.refresh : node.status;
      return node;
    });
    this.form.querySelectorAll = selector => selector === '[data-production-draft]' ? this.producers.map(p => p.draft) : this.producers;
  }
  querySelector(selector) { return selector === 'form' ? this.form : this.nodes[selector]; }
}
function mount(f) {
  const saved = { document: globalThis.document, FormData: globalThis.FormData };
  const pause = new NodeStub(), top = new NodeStub(), body = new NodeStub();
  globalThis.FormData = FormDataStub;
  globalThis.document = { documentElement: { dataset: {} }, dispatchEvent() {}, addEventListener() {}, body,
    createElement: tag => tag === 'dialog' ? new DialogStub() : new NodeStub(), querySelector: selector => selector === '.pause-actions' ? pause : top };
  installStewardUI(f.g); const dialog = body.children[0];
  return { dialog, open: () => top.children[0].onclick(), restore: () => Object.assign(globalThis, saved) };
}
function usingUI(fn) { const f = setup(), ui = mount(f); try { fn(f, ui); } finally { ui.restore(); } }

test('草稿改全域／age／建築預留／兵種／目標僅顯未套用，重新診斷仍讀正式設定；取消保留完整快照', () => usingUI((f, ui) => {
  const before = snapshot(f.g), rng = f.g.rng.state, visual = f.g.visualRng.state; ui.open();
  const producer = ui.dialog.producers.find(p => p.dataset.producer === String(f.b.id)); producer.open = true; producer.fire('toggle');
  const initial = producer.output.innerHTML, form = ui.dialog.form;
  for (const [name, value] of [['reserve0', '99999'], ['age', 'auto'], ['budget' + f.b.id + '_0', '88888'], ['target' + f.b.id + '_militia', '0']]) form.elements[name].value = value;
  form.elements['enabled' + f.b.id].checked = false; form.elements['unit' + f.b.id + '_militia'].checked = false; form.fire('input');
  assert.equal(ui.dialog.nodes['#steward-applied-notice'].dataset.draft, 'true');
  assert.equal(producer.draft.hidden, false);
  producer.refresh.onclick(); assert.equal(producer.output.innerHTML, initial); assert.deepEqual(snapshot(f.g), before);
  ui.dialog.nodes['#steward-close'].onclick(); assert.equal(f.g.paused, false); assert.deepEqual(snapshot(f.g), before);
  assert.equal(f.g.rng.state, rng); assert.equal(f.g.visualRng.state, visual);
}));

test('草稿恢復原值會清提示，套用後才改正式設定並在重開時反映新底線', () => usingUI((f, ui) => {
  ui.open(); const form = ui.dialog.form; form.elements.reserve0.value = '1234'; form.fire('change'); assert.equal(ui.dialog.nodes['#steward-applied-notice'].dataset.draft, 'true');
  form.elements.reserve0.value = '0'; form.fire('input'); assert.equal(ui.dialog.nodes['#steward-applied-notice'].dataset.draft, 'false');
  form.elements.reserve0.value = '99999'; form.fire('change'); assert.equal(f.g.stewards.reserve[0], 0);
  form.fire('submit'); assert.equal(f.g.stewards.reserve[0], 99999); assert.equal(f.g.paused, false);
  ui.open(); const producer = ui.dialog.producers.find(p => p.dataset.producer === String(f.b.id)); producer.open = true; producer.fire('toggle');
  assert.ok(producer.output.innerHTML.includes('data-value="99999"')); assert.equal(ui.dialog.nodes['#steward-applied-notice'].dataset.draft, 'false');
}));

test('確認既有升級待辦不套用草稿，實付後重新呈現依新庫存與研究中保留', () => usingUI((f, ui) => {
  f.g.stewards.age = 'ask'; f.g.stewards.pending = { kind: 'age' }; const cost = f.g.ageCost(), stock = { ...f.g.resources }; ui.open();
  ui.dialog.form.elements.reserve0.value = '99999'; ui.dialog.form.fire('input'); ui.dialog.nodes['#steward-confirm'].onclick();
  assert.ok(f.g.ageResearch); assert.equal(f.g.stewards.reserve[0], 0); assert.equal(f.g.stewards.age, 'ask');
  for (const r of RESOURCES) assert.equal(f.g.resources[r], stock[r] - (cost[r] || 0));
  const producer = ui.dialog.producers.find(p => p.dataset.producer === String(f.b.id)); producer.open = true; producer.fire('toggle');
  assert.ok(producer.output.innerHTML.includes(`data-value="${f.g.resources.food}" data-column="stock"`));
  assert.equal(row(f).resources.food.globalFloor, 0); assert.equal(ui.dialog.nodes['#steward-applied-notice'].dataset.draft, 'false');
}));

test('只有顯式展開或更新才建立診斷，刷新控制保持節點且關閉還原原暫停狀態', () => usingUI((f, ui) => {
  f.g.paused = true; ui.open(); const producer = ui.dialog.producers.find(p => p.dataset.producer === String(f.b.id)), button = producer.refresh;
  assert.equal(producer.output.hidden, true); assert.equal(producer.output.innerHTML, undefined);
  producer.open = true; producer.fire('toggle'); assert.equal(producer.output.hidden, false); const before = producer.output.innerHTML;
  f.g.resources.food = 0; assert.equal(producer.output.innerHTML, before); button.onclick(); assert.notEqual(producer.output.innerHTML, before); assert.equal(producer.refresh, button);
  ui.dialog.fire('cancel'); assert.equal(f.g.paused, true); assert.equal(ui.dialog.open, false);
}));
