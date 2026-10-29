import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CIV_UNIT_SPRITE_ATLASES, unitSpriteAtlasKey, atlasFrame } from '../js/sprite-atlas.js';
globalThis.document = { documentElement: { dataset: {} }, dispatchEvent() {} };
const { Game } = await import('../js/game.js');

test('KOR cart is a complete civilization-scoped sheet without affecting other players or enemies', () => {
  const u = { type: 'patrol_cart', team: 'player' }, a = CIV_UNIT_SPRITE_ATLASES['KOR:patrol_cart'];
  assert.equal(unitSpriteAtlasKey(u, 'KOR'), 'KOR:patrol_cart');
  assert.equal(unitSpriteAtlasKey(u, 'TEU'), 'patrol_cart');
  assert.equal(unitSpriteAtlasKey({ ...u, team: 'enemy' }, 'KOR'), 'patrol_cart');
  const png = readFileSync(new URL('../' + a.src, import.meta.url));
  assert.equal(png.readUInt32BE(16), 2816); assert.equal(png.readUInt32BE(20), 1760);
  for (const direction of Object.keys(a.directions)) for (const state of Object.keys(a.states)) {
    assert.deepEqual([0,.26,.51,.99].map(progress => {
      const f = atlasFrame(a, direction, state, 0, progress);
      assert.ok(f.sx + f.sw <= 2816 && f.sy + f.sh <= 1760); return f.frame;
    }), [0,1,2,3]);
  }
});

test('existing Korean tower registration bonus caps at four carts and survives SaveLoad', () => {
  const g = new Game(); g.newRun(42, { civ: 'KOR', biome: 'steppe' });
  g.world.tile = () => ({ terrain: 'grass' });
  for (let i = 0; i < 12; i++) g.addBuilding('tower', 5 + i % 4 * 5, 6 + Math.floor(i / 4) * 5, true);
  assert.equal(g.units.filter(u => u.type === 'patrol_cart').length, 4);
  assert.equal(g.towerCartsSpawned, 4);
  const restored = new Game(); restored.restore(g.snapshot());
  assert.equal(restored.towerCartsSpawned, 4);
  for (let i = 0; i < 3; i++) restored.addBuilding('tower', 5 + i * 5, 21, true);
  assert.equal(restored.units.filter(u => u.type === 'patrol_cart').length, 4);
});
