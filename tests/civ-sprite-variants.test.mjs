import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CIV_UNIT_SPRITE_ATLASES, unitSpriteAtlasKey, atlasFrame, loadUnitSpriteAtlases } from '../js/sprite-atlas.js';

test('Mongol equipment is player/civilization scoped without changing other roles or hostile visuals', () => {
  const unit = { type: 'horse_archer', team: 'player' }, original = JSON.stringify(unit);
  assert.equal(unitSpriteAtlasKey(unit, 'MNG'), 'MNG:horse_archer');
  assert.equal(unitSpriteAtlasKey(unit, 'PER'), 'horse_archer');
  assert.equal(unitSpriteAtlasKey({ ...unit, team: 'enemy' }, 'MNG'), 'horse_archer');
  assert.equal(unitSpriteAtlasKey({ ...unit, type: 'elephant' }, 'MNG'), 'elephant');
  assert.equal(JSON.stringify(unit), original);
  class Image { set src(value) { this.onload(); } }
  assert.ok(loadUnitSpriteAtlases(undefined, Image).get('MNG:horse_archer').ready);
});

test('Mongol mounted bow sheet has all160 independent animation frames within PNG bounds', () => {
  const a = CIV_UNIT_SPRITE_ATLASES['MNG:horse_archer'], png = readFileSync(new URL('../' + a.src, import.meta.url));
  assert.equal(png.readUInt32BE(16), 2816); assert.equal(png.readUInt32BE(20), 1760);
  for (const direction of Object.keys(a.directions)) for (const state of Object.keys(a.states)) {
    assert.deepEqual([0,.26,.51,.99].map(progress => {
      const f = atlasFrame(a, direction, state, 0, progress);
      assert.ok(f.sx + f.sw <= 2816 && f.sy + f.sh <= 1760); return f.frame;
    }), [0,1,2,3]);
  }
});
