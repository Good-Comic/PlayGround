import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { UNIT_SPRITE_ATLASES, atlasActionProgress, atlasFrame, loadUnitSpriteAtlases } from '../js/sprite-atlas.js';

test('new spear and shield atlases have complete independent four-frame actions and real PNG dimensions', () => {
  for (const type of ['spearman', 'guard']) {
    const atlas = UNIT_SPRITE_ATLASES[type];
    const png = readFileSync(new URL('../' + atlas.src, import.meta.url));
    assert.equal(png.subarray(1, 4).toString(), 'PNG');
    const width = png.readUInt32BE(16), height = png.readUInt32BE(20);
    assert.equal(width, 4096); assert.equal(height, 560);
    assert.notEqual(atlas.src, UNIT_SPRITE_ATLASES.militia.src);
    for (const direction of Object.keys(atlas.directions)) for (const state of Object.keys(atlas.states)) {
      const frames = [0, .26, .51, .99].map(progress => {
        const f = atlasFrame(atlas, direction, state, 0, progress);
        assert.ok(f.sx >= 0 && f.sx + f.sw <= width && f.sy + f.sh <= height);
        return f.frame;
      });
      assert.deepEqual(frames, [0, 1, 2, 3]);
    }
    assert.equal(atlas.states.death.loop, false);
    assert.equal(atlasFrame(atlas, 'E', 'death', 99).frame, 3);
  }
  assert.notEqual(UNIT_SPRITE_ATLASES.spearman.src, UNIT_SPRITE_ATLASES.guard.src);
});

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

// Regression: treating normalized amplitude as seconds froze most of each action at frame zero.
test('production normalized attack and hit amplitudes play all four frames without changing timers', () => {
  const atlas = UNIT_SPRITE_ATLASES.chu_ko_nu;
  for (const [state,key] of [['attack','attackAnim'],['hit','hitFlash']]) {
    const unit = { [key]: 1 };
    const frames = [1,.74,.49,.24].map(value => {
      unit[key]=value;
      const frame=atlasFrame(atlas,'E',state,0,atlasActionProgress(unit,state)).frame;
      assert.equal(unit[key],value);
      return frame;
    });
    assert.deepEqual(frames,[0,1,2,3]);
  }
  assert.equal(atlasActionProgress({deathAnim:.6},'death'),.5);
  assert.equal(atlasActionProgress({},'walk'),null);
});
