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

test('archer and cavalry use independent assets geometry and equipment scales', () => {
  const archer = UNIT_SPRITE_ATLASES.archer, cavalry = UNIT_SPRITE_ATLASES.light_cavalry;
  assert.match(archer.src, /archer-atlas/); assert.match(cavalry.src, /light-cavalry-atlas/);
  assert.notEqual(archer.src, UNIT_SPRITE_ATLASES.militia.src);
  assert.notEqual(cavalry.frame.width, archer.frame.width);
  assert.notEqual(cavalry.anchor.x, archer.anchor.x);
  assert.equal(Object.keys(archer.directions).length, 8); assert.equal(Object.keys(cavalry.states).length, 5);
});

test('repeating crossbow has independent four-frame directional actions within sheet bounds', () => {
  const atlas = UNIT_SPRITE_ATLASES.chu_ko_nu;
  assert.notEqual(atlas.src, UNIT_SPRITE_ATLASES.archer.src);
  for (const direction of Object.keys(atlas.directions)) {
    for (const state of Object.keys(atlas.states)) {
      assert.equal(atlas.states[state].frames, 4);
      for (const progress of [0, .26, .51, .99]) {
        const f = atlasFrame(atlas, direction, state, 0, progress);
        assert.ok(f.sx >= 0 && f.sx + f.sw <= 2560);
        assert.ok(f.sy >= 0 && f.sy + f.sh <= 400);
      }
    }
  }
  assert.equal(atlas.states.death.loop, false);
  assert.equal(atlasFrame(atlas, 'E', 'death', 99).frame, 3);
});
