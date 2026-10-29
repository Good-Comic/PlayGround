import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { UNIT_SPRITE_ATLASES, atlasFrame } from '../js/sprite-atlas.js';
import { Renderer } from '../js/renderer.js';

test('hero support and bosses use independent complete decoded PNG sheets', () => {
  const sources = new Set();
  for (const type of ['commander', 'recruiter', 'warlord', 'warlord2']) {
    const atlas = UNIT_SPRITE_ATLASES[type], png = readFileSync(new URL('../' + atlas.src, import.meta.url));
    sources.add(atlas.src);
    assert.equal(png.subarray(1, 4).toString(), 'PNG');
    assert.equal(png.readUInt32BE(16), 2816); assert.equal(png.readUInt32BE(20), 1760);
    assert.equal(Object.keys(atlas.directions).length, 8);
    assert.equal(Object.keys(atlas.states).length, 5);
    for (const direction of Object.keys(atlas.directions)) for (const state of Object.keys(atlas.states)) {
      assert.deepEqual([0, .26, .51, .99].map(progress => {
        const f = atlasFrame(atlas, direction, state, 0, progress);
        assert.ok(f.sx + f.sw <= 2816 && f.sy + f.sh <= 1760); return f.frame;
      }), [0, 1, 2, 3]);
    }
  }
  assert.equal(sources.size, 4);
});

test('production renderer does not mirror or rotate an already-baked champion pose twice; fallback keeps transforms', () => {
  const r = Object.create(Renderer.prototype), calls = [];
  r.ctx = new Proxy({}, { get: (_, key) => (...args) => calls.push([key, ...args]), set: () => true });
  Object.assign(r, { w: 1600, h: 900, screen: () => ({ x: 500, y: 500 }), drawUnitShadow() {}, drawHeroUnit() {}, drawCivilizationUnitAccent() {} });
  const entry = { descriptor: UNIT_SPRITE_ATLASES.commander, ready: true, failed: false, image: { naturalWidth: 5120 } };
  r.unitSpriteAtlases = new Map([['commander', entry]]);
  const unit = { type: 'commander', typeDef: {}, team: 'player', visualDirection: 'W', alive: false, deathAnim: .6, x: 1, y: 1 };
  const game = { camera: { zoom: 1 }, playerColors: {} };
  r.drawUnit(unit, game, 0);
  assert.equal(calls.some(([key]) => key === 'scale' || key === 'rotate'), false);
  assert.equal(calls.filter(([key]) => key === 'drawImage').length, 1);
  calls.length = 0; entry.failed = true; r.drawUnit(unit, game, 0);
  assert.ok(calls.some(([key, x]) => key === 'scale' && x === -1));
  assert.ok(calls.some(([key]) => key === 'rotate'));
  assert.equal(calls.some(([key]) => key === 'drawImage'), false);
});
