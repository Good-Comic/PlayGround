import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import test from 'node:test';
import { ramBodyContains } from '../js/ram-body-picking.js';

const origin = Object.freeze({ x: 0, y: 0 });
const ground = Object.freeze({ x: 300, y: 240 });
const ram = (overrides = {}) => ({
  type: 'ram', alive: true, team: 'enemy', id: 0, state: 'idle',
  visualDirection: 'E', facing: 1, walkPhase: 0, hitFlash: 0, attackAnim: 0,
  ...overrides,
});

test('木殼兩側、屋頂與金屬端保留已重現的實心點', () => {
  const unit = ram();
  for (const [x, y] of [[19, -19], [-19, -19], [16, -29], [25, -13]]) {
    assert.equal(ramBodyContains(unit, x, y, origin), true, `實心座標 ${x}, ${y}`);
  }
});

test('木殼沿原梯形斜邊判定，不擴大到外側空白', () => {
  const unit = ram();
  for (const [x, y] of [[17, -32], [17.5, -29], [20, -19], [-20, -19], [-22, -13]]) {
    assert.equal(ramBodyContains(unit, x, y, origin), true, `斜邊內側 ${x}, ${y}`);
  }
  for (const [x, y] of [[17.01, -32], [18, -29], [20.5, -19], [-20.5, -19], [-22.1, -13], [0, -32.01]]) {
    assert.equal(ramBodyContains(unit, x, y, origin), false, `斜邊外側 ${x}, ${y}`);
  }
});

test('下底保留實心橢圓，排除曲線外及輪圈間的空隙', () => {
  const unit = ram();
  for (const [x, y] of [[0, -4], [12, -5], [0, -3], [-21, -13]]) {
    assert.equal(ramBodyContains(unit, x, y, origin), true, `橢圓內側 ${x}, ${y}`);
  }
  for (const [x, y] of [[14, -5], [0, -2.9], [-21, -12], [20, -9], [0, -1]]) {
    assert.equal(ramBodyContains(unit, x, y, origin), false, `橢圓外側 ${x}, ${y}`);
  }
});

test('金屬端採原實心圓，圓外角落維持不可選', () => {
  const unit = ram();
  for (const [x, y] of [[25, -13], [29, -13], [25, -17], [25, -9]]) {
    assert.equal(ramBodyContains(unit, x, y, origin), true, `金屬內側 ${x}, ${y}`);
  }
  for (const [x, y] of [[29.3, -13], [28, -16], [29, -17], [25, -8.7]]) {
    assert.equal(ramBodyContains(unit, x, y, origin), false, `金屬外側 ${x}, ${y}`);
  }
});

test('旗幟、血條、陰影與遠方空白不列入車身', () => {
  for (const [x, y] of [[12, -45], [22, -44], [0, -62], [2, 1.5], [60, -20], [35, -25], [-35, -25], [25, -30]]) {
    assert.equal(ramBodyContains(ram(), x, y, origin), false, `非車身座標 ${x}, ${y}`);
  }
});

// 固定畫面座標保留各朝向的金屬端位置與屋頂高度，不用受測函式推導預期值。
for (const [direction, headX, headY, roofY, wrongHeadX] of [
  ['E', 325, 227, 208.1, 275],
  ['W', 275, 227, 208.1, 325],
  ['N', 325, 228.04, 210.652, 275],
  ['S', 325, 228.04, 210.652, 275],
  ['NE', 325, 227.39, 209.057, 275],
  ['SE', 325, 227.39, 209.057, 275],
  ['NW', 275, 227.39, 209.057, 325],
  ['SW', 275, 227.39, 209.057, 325],
]) {
  test(`${direction} 朝向保留鏡像與景深壓縮後的車身位置`, () => {
    const unit = ram({ visualDirection: direction });
    assert.equal(ramBodyContains(unit, headX, headY, ground), true);
    assert.equal(ramBodyContains(unit, wrongHeadX, headY, ground), false);
    assert.equal(ramBodyContains(unit, 300, roofY, ground), true);
    assert.equal(ramBodyContains(unit, 300, 207.5, ground), false);
  });
}

test('缺少或未知朝向時沿用既有 facing 回退', () => {
  for (const visualDirection of [undefined, '未知']) {
    assert.equal(ramBodyContains(ram({ visualDirection, facing: -1 }), 275, 227, ground), true);
    assert.equal(ramBodyContains(ram({ visualDirection, facing: -1 }), 325, 227, ground), false);
    assert.equal(ramBodyContains(ram({ visualDirection, facing: 1 }), 325, 227, ground), true);
  }
});

test('半倍與兩倍縮放使用畫面地面錨點並保留斜邊空白', () => {
  const unit = ram();
  for (const [scale, woodX, woodY, roofX, roofY, headX, headY, blankX, blankY] of [
    [0.5, 309.5, 230.5, 308, 225.5, 312.5, 233.5, 310.25, 230.5],
    [2, 338, 202, 332, 182, 350, 214, 341, 202],
  ]) {
    assert.equal(ramBodyContains(unit, woodX, woodY, ground, scale), true);
    assert.equal(ramBodyContains(unit, roofX, roofY, ground, scale), true);
    assert.equal(ramBodyContains(unit, headX, headY, ground, scale), true);
    assert.equal(ramBodyContains(unit, blankX, blankY, ground, scale), false);
    assert.equal(ramBodyContains(unit, headX, 240, ground, scale), false);
  }
});

test('移動、返程、建造與採集依相同移動晃動修正屋頂及底緣', () => {
  for (const state of ['move', 'return', 'build', 'gather']) {
    const unit = ram({ state });
    assert.equal(ramBodyContains(unit, 300, 207.6, ground), true, `${state} 晃動後屋頂`);
    assert.equal(ramBodyContains(unit, 319, 220.4, ground), true, `${state} 木殼`);
    assert.equal(ramBodyContains(unit, 325, 226.4, ground), true, `${state} 金屬端`);
    assert.equal(ramBodyContains(unit, 300, 236.8, ground), false, `${state} 底緣外`);
  }
  assert.equal(ramBodyContains(ram(), 300, 207.6, ground), false);
  assert.equal(ramBodyContains(ram(), 300, 236.8, ground), true);
});

test('步行相位改變時跟隨原餘弦晃動，不固定抬高車身', () => {
  assert.equal(ramBodyContains(ram({ state: 'move', walkPhase: 0 }), 0, -32.3, origin), true);
  assert.equal(ramBodyContains(ram({ state: 'move', walkPhase: Math.PI / 2 }), 0, -32.3, origin), false);
  assert.equal(ramBodyContains(ram({ state: 'move', walkPhase: Math.PI / 2 }), 0, -31.9, origin), true);
});

test('待命晃動使用傳入時間與單位編號，保留位移前後空白', () => {
  assert.equal(ramBodyContains(ram(), 0, -32.1, origin), false);
  assert.equal(ramBodyContains(ram(), 0, -32.1, origin, 1, Math.PI / 4), true);
  assert.equal(ramBodyContains(ram({ id: Math.PI / 2 }), 0, -32.1, origin), true);
  assert.equal(ramBodyContains(ram(), 0, -31.9, origin, 1, 3 * Math.PI / 4), false);
  assert.equal(ramBodyContains(ram(), 0, -2.9, origin, 1, 3 * Math.PI / 4), true);
  assert.equal(ramBodyContains(ram(), 0, -2.9, origin), false);
});

test('攻擊動畫沿用待命晃動與原車身，不加入攻擊範圍', () => {
  const unit = ram({ state: 'attack', attackAnim: 0.8 });
  assert.equal(ramBodyContains(unit, 25, -13, origin), true);
  assert.equal(ramBodyContains(unit, 0, -32.1, origin, 1, Math.PI / 4), true);
  assert.equal(ramBodyContains(unit, 30, -13, origin), false);
  assert.equal(ramBodyContains(unit, 55, -13, origin), false);
});

test('受擊沿 Renderer 的局部平移修正車身與原位置外緣', () => {
  const unit = ram({ hitFlash: 0.7, attackAnim: 0.8 });
  assert.equal(ramBodyContains(unit, 322.5, 225.5, ground), true);
  assert.equal(ramBodyContains(unit, 326.5, 225.5, ground), true);
  assert.equal(ramBodyContains(unit, 300, 207, ground), true);
  assert.equal(ramBodyContains(unit, 329, 227, ground), false);
  assert.equal(ramBodyContains(ram(), 329, 227, ground), true);
  assert.equal(ramBodyContains(ram(), 300, 207, ground), false);
});

test('西向鏡像及北向景深縮放保留受擊平移順序', () => {
  assert.equal(ramBodyContains(ram({ visualDirection: 'W', hitFlash: 1 }), 277.5, 229.5, ground), true);
  assert.equal(ramBodyContains(ram({ visualDirection: 'W', hitFlash: 1 }), 271, 227, ground), false);
  assert.equal(ramBodyContains(ram({ visualDirection: 'W' }), 271, 227, ground), true);
  assert.equal(ramBodyContains(ram({ visualDirection: 'NW', hitFlash: 1 }), 277.5, 229.815, ground), true);
  assert.equal(ramBodyContains(ram({ visualDirection: 'N', hitFlash: 1 }), 345, 213.32, ground, 2), true);
  assert.equal(ramBodyContains(ram({ visualDirection: 'N', hitFlash: 1 }), 300, 178.5, ground, 2), true);
  assert.equal(ramBodyContains(ram({ visualDirection: 'N' }), 300, 178.5, ground, 2), false);
});

test('移動中受擊仍採移動晃動並套用受擊平移', () => {
  const unit = ram({ state: 'move', hitFlash: 1 });
  assert.equal(ramBodyContains(unit, 300, 206.2, ground), true);
  assert.equal(ramBodyContains(unit, 322.5, 224.9, ground), true);
  assert.equal(ramBodyContains(unit, 300, 205.8, ground), false);
  assert.equal(ramBodyContains(ram({ hitFlash: 1 }), 300, 206.2, ground), false);
});

test('不可靠的座標、地面錨點、縮放、時間與文明輸入一律拒絕', () => {
  const unit = ram();
  for (const invalid of [NaN, Infinity, -Infinity, undefined, null, '25']) {
    assert.equal(ramBodyContains(unit, invalid, -13, origin), false, `無效橫座標 ${String(invalid)}`);
    assert.equal(ramBodyContains(unit, 25, invalid, origin), false, `無效縱座標 ${String(invalid)}`);
    assert.equal(ramBodyContains(unit, 25, -13, { x: invalid, y: 0 }), false);
    assert.equal(ramBodyContains(unit, 25, -13, { x: 0, y: invalid }), false);
  }
  for (const invalid of [NaN, Infinity, -Infinity, 0, -1, null, '1']) {
    assert.equal(ramBodyContains(unit, 25, -13, origin, invalid), false, `無效縮放 ${String(invalid)}`);
  }
  for (const invalid of [NaN, Infinity, -Infinity, null, '0']) {
    assert.equal(ramBodyContains(unit, 25, -13, origin, 1, invalid), false, `無效時間 ${String(invalid)}`);
  }
  for (const invalid of [null, undefined, {}, { x: 0 }]) {
    assert.equal(ramBodyContains(unit, 25, -13, invalid), false);
  }
  for (const invalid of [NaN, Infinity, null, 1, {}]) {
    assert.equal(ramBodyContains(unit, 25, -13, origin, 1, 0, invalid), false);
  }
  assert.equal(ramBodyContains(unit, Number.MAX_VALUE, -13, { x: -Number.MAX_VALUE, y: 0 }), false);
  assert.equal(ramBodyContains(unit, 25, -13, origin, 1, Number.MAX_VALUE), false);
});

test('非衝車、死亡、缺少必要動畫資料與非有限單位數值不套用車身', () => {
  for (const unit of [null, undefined, {}, ram({ type: 'mangonel' }), ram({ type: 'elephant' }), ram({ alive: false, deathAnim: 1 }), ram({ alive: 1 }), ram({ id: undefined }), ram({ state: 'move', walkPhase: undefined })]) {
    assert.equal(ramBodyContains(unit, 19, -19, origin), false);
  }
  for (const field of ['id', 'walkPhase', 'hitFlash', 'attackAnim', 'facing']) {
    for (const invalid of [NaN, Infinity, -Infinity, null, '1']) {
      assert.equal(ramBodyContains(ram({ [field]: invalid }), 19, -19, origin), false, `${field} 為 ${String(invalid)}`);
    }
  }
});

test('固定輸入可重複判定，且不修改單位或地面資料', () => {
  const unit = Object.freeze(ram({ typeDef: Object.freeze({ scale: 1, radius: 0.7 }) }));
  const beforeUnit = structuredClone(unit);
  const beforeGround = structuredClone(ground);
  const results = Array.from({ length: 3 }, () => ramBodyContains(unit, 319, 221, ground, 1, 0, 'JPN'));
  assert.deepEqual(results, [true, true, true]);
  assert.deepEqual(unit, beforeUnit);
  assert.deepEqual(ground, beforeGround);
});

async function withAtlasFixture(name, atlasSource, verify) {
  const helperUrl = new URL(`../js/ram-body-picking.js?atlas-fixture=${name}`, import.meta.url).href;
  const atlasUrl = `data:text/javascript,${encodeURIComponent(atlasSource)}`;
  const hooks = registerHooks({
    resolve(specifier, context, nextResolve) {
      if (specifier === './sprite-atlas.js' && context.parentURL === helperUrl) {
        return { url: atlasUrl, shortCircuit: true };
      }
      return nextResolve(specifier, context);
    },
  });
  try {
    const fixture = await import(helperUrl);
    await verify(fixture.ramBodyContains);
  } finally {
    hooks.deregister();
  }
}

test('未來有通用衝車圖集時即使尚無 pickBody 也交回既有圖集流程', async () => {
  await withAtlasFixture('generic', `
    export const UNIT_SPRITE_ATLASES = Object.freeze({ ram: Object.freeze({ id: 'future-ram' }) });
    export const CIV_UNIT_SPRITE_ATLASES = Object.freeze({});
    export const unitSpriteAtlasKey = unit => unit.type;
  `, contains => {
    assert.equal(contains(ram(), 19, -19, origin), false);
    assert.equal(contains(ram({ team: 'player' }), 25, -13, origin, 1, 0, 'JPN'), false);
  });
});

test('未來文明衝車圖集依既有 key 回交，未對應的衝車仍採程序式幾何', async () => {
  await withAtlasFixture('civilization', `
    export const UNIT_SPRITE_ATLASES = Object.freeze({});
    export const CIV_UNIT_SPRITE_ATLASES = Object.freeze({ 'JPN:ram': Object.freeze({ id: 'future-jpn-ram' }) });
    export function unitSpriteAtlasKey(unit, civId) {
      const variant = civId + ':' + unit.type;
      return unit.team === 'player' && CIV_UNIT_SPRITE_ATLASES[variant] ? variant : unit.type;
    }
  `, contains => {
    assert.equal(contains(ram({ team: 'player' }), 19, -19, origin, 1, 0, 'JPN'), false);
    assert.equal(contains(ram(), 19, -19, origin, 1, 0, 'JPN'), true);
    assert.equal(contains(ram({ team: 'player' }), 19, -19, origin, 1, 0, 'TEU'), true);
  });
});
