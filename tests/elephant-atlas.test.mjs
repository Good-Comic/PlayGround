import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { UNIT_SPRITE_ATLASES, atlasFrame } from '../js/sprite-atlas.js';
globalThis.document = { documentElement: { dataset: {} }, dispatchEvent() {} };
const { Game } = await import('../js/game.js');

test('war elephant has complete independent directional PNG frames within its decoded dimensions', () => {
  const a = UNIT_SPRITE_ATLASES.elephant, png = readFileSync(new URL('../' + a.src, import.meta.url));
  assert.equal(png.readUInt32BE(16), 2816); assert.equal(png.readUInt32BE(20), 1760);
  assert.equal(Object.keys(a.directions).length, 8); assert.equal(Object.keys(a.states).length, 5);
  assert.equal(a.bakedPose, true); assert.equal(a.cacheFrames, true);
  for (const direction of Object.keys(a.directions)) for (const state of Object.keys(a.states)) {
    assert.deepEqual([0, .26, .51, .99].map(progress => {
      const f = atlasFrame(a, direction, state, 0, progress);
      assert.ok(f.sx + f.sw <= 2816 && f.sy + f.sh <= 1760); return f.frame;
    }), [0, 1, 2, 3]);
  }
});

test('Persian elephant production combat still tramples at most four nearby secondary enemies', () => {
  const g = new Game(); g.newRun(42, { civ: 'PER', biome: 'river' });
  g.units = []; g.world.tile = () => ({ terrain: 'grass' });
  const elephant = g.spawnUnit('elephant', 35, 15), primary = g.spawnUnit('brute', 36, 15, 'enemy');
  const extras = Array.from({ length: 5 }, (_, i) => {
    const u = g.spawnUnit('raider', 38 + i, 15, 'enemy'); u.x = 36 + i * .1; u.y = 15.2; return u;
  });
  const hp = extras.map(u => u.hp), radius = elephant.typeDef.radius;
  g.attackUnit(elephant, primary);
  assert.equal(extras.filter((u, i) => u.hp < hp[i]).length, 4);
  assert.equal(elephant.typeDef.radius, radius); assert.equal(radius, .44);
  assert.equal(g.effects.elephantTrample, .25);
});
