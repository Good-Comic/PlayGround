import test from 'node:test';
import assert from 'node:assert/strict';
globalThis.document = { documentElement: { dataset: {} }, dispatchEvent() {} };
globalThis.window = { innerWidth: 1440, innerHeight: 900 };
const { Game } = await import('../js/game.js');
const { directionalAnimationFrame } = await import('../js/visuals.js');
const { createTacticalPlan } = await import('../js/tactical-planner.js');
const { battleArmy } = await import('../js/battle-actions.js');
const { ramBodyContains } = await import('../js/ram-body-picking.js');

function fixture(team = 'enemy', civ = 'FRK') {
  const g = new Game(); g.newRun(42, { civ, biome: 'steppe' }); g.inMenu = false; g.paused = true;
  let spot;
  for (let dx = -5; dx <= 5 && !spot; dx++) for (let dy = -5; dy <= 5 && !spot; dy++) {
    const x = g.hero.x + dx, y = g.hero.y + dy, d = Math.hypot(dx, dy);
    if (d >= 3 && d <= 5.8 && g.isWalkable(x, y, g.hero) && !g.units.some(u => u.alive && Math.hypot(u.x - x, u.y - y) < 2.5) && g.isVisible({ team: 'enemy', x, y, alive: true })) spot = { x, y };
  }
  assert.ok(spot, '正式地圖有孤立可見夾具位置');
  const ram = g.spawnUnit('ram', spot.x, spot.y, team); assert.ok(ram);
  g.focusAt(ram.x, ram.y); g.camera.x = g.camera.targetX; g.camera.y = g.camera.targetY;
  return { g, ram };
}
function bodyPoint(g, ram, x = 19, y = -19) {
  const p = g.screenPos(ram.x, ram.y), scale = g.camera.zoom * (ram.typeDef.scale || 1), f = directionalAnimationFrame(ram);
  const moving = ['move', 'return', 'build', 'gather'].includes(ram.state), bob = moving ? Math.abs(Math.cos(ram.walkPhase)) * 1.2 : Math.sin(g.time * 2 + ram.id) * .35;
  return { x: p.x + f.mirror * (x - (f.state === 'hit' ? 2.5 : 0)) * scale, y: p.y + f.depthScale * (y - bob * .5 - (f.state === 'hit' ? 1.5 : 0)) * scale };
}
const snapshot = g => { const s = g.snapshot(); delete s.savedAt; return JSON.stringify(s); };

test('真實Game可拾取衝車木殼／撞頭，八向三縮放不改快照、費用、半徑或攻擊距離', () => {
  const { g, ram } = fixture();
  const rules = JSON.stringify({ cost: g.unitCost('ram'), radius: ram.typeDef.radius, range: ram.typeDef.range, attack: ram.attack });
  for (const zoom of [.78, 1, 1.6]) for (const direction of ['E', 'SE', 'S', 'SW', 'W', 'NW', 'N', 'NE']) {
    g.camera.zoom = g.camera.targetZoom = zoom; ram.visualDirection = direction;
    for (const [x, y] of [[19, -19], [-19, -19], [16, -29], [25, -13]]) {
      const p = bodyPoint(g, ram, x, y), before = snapshot(g);
      assert.equal(g.pickAt(p.x, p.y), ram, `${zoom}/${direction}/${x},${y}`); assert.equal(snapshot(g), before);
    }
  }
  assert.equal(JSON.stringify({ cost: g.unitCost('ram'), radius: ram.typeDef.radius, range: ram.typeDef.range, attack: ram.attack }), rules);
});

test('正常中央拾取與其他兵種沿用原有流程，敵我衝車均可選取', () => {
  for (const team of ['player', 'enemy']) {
    const { g, ram } = fixture(team); ram.visualDirection = 'E';
    const p = g.screenPos(ram.x, ram.y); assert.equal(g.pickAt(p.x, p.y - 18 * g.camera.zoom), ram);
    const body = bodyPoint(g, ram); g.selectAt(body.x, body.y); assert.deepEqual(g.selection, [ram]);
    const hero = g.screenPos(g.hero.x, g.hero.y); assert.equal(g.pickAt(hero.x, hero.y - 18 * g.camera.zoom), g.hero);
  }
});

test('木殼可走原正式暫停布令、commit與手動後令覆寫，不直接指定目標冒充成功', () => {
  const { g, ram } = fixture(), army = battleArmy(g); assert.ok(army.length);
  ram.visualDirection = 'E'; const p = bodyPoint(g, ram), target = g.pickAt(p.x, p.y); assert.equal(target, ram);
  const plan = createTacticalPlan(g); assert.equal(plan.begin(), true);
  assert.equal(plan.stage('attack', army, g.worldAt(p.x, p.y), target), true);
  assert.deepEqual(plan.commit(), { applied: 1, skipped: 0 });
  assert.ok(army.every(u => u.target === ram && u.manualAttack));
  g.commandMove(army, g.hero.x + 1, g.hero.y + 1); assert.ok(army.every(u => !u.manualAttack));
});

test('視野與沙暴閘門仍在UI木殼判定之前：雙單位視野facade不讀取隱藏衝車', () => {
  const { g, ram } = fixture(); const view = Object.create(g); view.units = [g.hero, ram]; view.buildings = []; view.effects = { ...g.effects };
  const range = view.sightRadius(g.hero); ram.x = g.hero.x + range * .9; ram.y = g.hero.y; ram.visualDirection = 'E';
  const p = bodyPoint(view, ram); assert.equal(view.isVisible(ram), true); assert.equal(view.pickAt(p.x, p.y), ram);
  view.effects.sandstorm = 20; assert.equal(view.isVisible(ram), false); assert.notEqual(view.pickAt(p.x, p.y), ram);
  view.effects.sandstorm = 0; assert.equal(view.pickAt(p.x, p.y), ram);
});

test('死亡衝車與旗幟／陰影／遠方空白不因新增木殼判定而可選', () => {
  const { g, ram } = fixture(); ram.visualDirection = 'E'; const p = bodyPoint(g, ram);
  ram.alive = false; assert.notEqual(g.pickAt(p.x, p.y), ram); ram.alive = true;
  const ground = g.screenPos(ram.x, ram.y), scale = g.camera.zoom * (ram.typeDef.scale || 1);
  for (const [x, y] of [[12, -49], [35, 4], [80, -20]]) {
    const sx = ground.x + x * scale, sy = ground.y + y * scale;
    assert.equal(ramBodyContains(ram, sx, sy, ground, scale, g.time, g.civ.id), false); assert.notEqual(g.pickAt(sx, sy), ram);
  }
});

test('原生快照JSON讀檔後木殼拾取、沙暴剩時與規則仍保留；不改判歷史strict RNG表示FAIL', () => {
  const { g, ram } = fixture(); ram.visualDirection = 'NW'; g.effects.sandstorm = 7;
  const h = new Game(); h.restore(JSON.parse(JSON.stringify(g.snapshot()))); h.inMenu = false; h.paused = true;
  const saved = h.units.find(u => u.id === ram.id); assert.ok(saved);
  const p = bodyPoint(h, saved); assert.equal(h.pickAt(p.x, p.y), saved); assert.equal(h.effects.sandstorm, 7);
  assert.equal(h.rng.state >>> 0, g.rng.state >>> 0); assert.equal(h.visualRng.state >>> 0, g.visualRng.state >>> 0);
  assert.equal(saved.typeDef.radius, ram.typeDef.radius); assert.equal(saved.typeDef.range, ram.typeDef.range);
});
