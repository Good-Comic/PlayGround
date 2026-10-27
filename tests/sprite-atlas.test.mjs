import test from 'node:test';
import assert from 'node:assert/strict';
import { UNIT_SPRITE_ATLASES, atlasFrame, loadUnitSpriteAtlases } from '../js/sprite-atlas.js';

test('militia atlas describes eight directions and all combat states', () => {
  const atlas = UNIT_SPRITE_ATLASES.militia;
  assert.deepEqual(Object.keys(atlas.directions), ['E','SE','S','SW','W','NW','N','NE']);
  assert.deepEqual(Object.keys(atlas.states), ['idle','walk','attack','hit','death']);
  for (const state of Object.keys(atlas.states)) for (const direction of Object.keys(atlas.directions)) {
    const first = atlasFrame(atlas, direction, state, 0, 0);
    const last = atlasFrame(atlas, direction, state, 99, .999);
    assert.ok(first && last); assert.equal(first.sy, last.sy); assert.notEqual(first.sx, last.sx);
  }
});

test('atlas loading exposes ready and failed states without blocking fallback', () => {
  class FakeImage { set src(value) { this._src=value; this.onload?.(); } get naturalWidth(){ return 1024; } }
  const loaded = loadUnitSpriteAtlases(UNIT_SPRITE_ATLASES, FakeImage);
  assert.equal(loaded.get('militia').ready, true);
  assert.equal(loadUnitSpriteAtlases(UNIT_SPRITE_ATLASES, null).size, 0);
});
