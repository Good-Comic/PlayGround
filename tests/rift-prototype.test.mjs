import test from 'node:test';
import assert from 'node:assert/strict';

globalThis.document = { documentElement: { dataset: {} }, dispatchEvent() {} };
globalThis.window = { innerWidth: 1600, innerHeight: 1100 };
globalThis.CustomEvent = class {};
const nativeTimeout = globalThis.setTimeout;
globalThis.setTimeout = (...args) => {
  const handle = nativeTimeout(...args);
  handle.unref?.();
  return handle;
};

const { Game } = await import('../js/game.js');

test('Rift Prototype spawns alive on a walkable free tile and plays its awakening cue once', () => {
  let cues = 0;
  const game = new Game({ sound: { prototype() { cues++; } } });
  game.newRun(221014483, { civ: 'TEU', biome: 'ash' });
  const before = game.units.length;
  const unit = game.spawnPrototype();

  assert.ok(unit?.alive);
  assert.equal(unit.type, 'prototype');
  assert.equal(game.units.length, before + 1);
  assert.equal(game.isWalkable(unit.x, unit.y, unit), true);
  assert.equal(cues, 1);
});
