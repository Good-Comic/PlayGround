import test from 'node:test';
import assert from 'node:assert/strict';
import { createSeedText, seedFromString, SEED_NORMALIZATION_VERSION } from '../js/utils.js';
import { createWorld, MAP_GENERATION_VERSION } from '../js/world.js';
globalThis.document = { documentElement: { dataset: {} }, dispatchEvent() {} };
const { Game } = await import('../js/game.js');

const worldSignature = world => JSON.stringify({
  version: world.generationVersion,
  tiles: world.tiles.map(tile => tile.terrain),
  resources: world.resources.map(node => [node.resource, node.x, node.y, node.amount]),
  camps: world.camps.map(camp => [camp.x, camp.y, camp.name]),
});

test('shareable setup seeds have a stable bounded format and normalization version', () => {
  assert.equal(SEED_NORMALIZATION_VERSION, 1);
  assert.equal(createSeedText(() => 0), 'RW-0000000');
  assert.equal(createSeedText(() => 0xffffffff), 'RW-1Z141Z3');
  assert.match(createSeedText(() => 123456789), /^RW-[0-9A-Z]{7}$/);
  assert.equal(seedFromString('player-seed'), seedFromString('player-seed'));
  assert.equal(seedFromString('  player-seed  '), seedFromString('player-seed'));
});

test('same seed biome and map generation version reproduce the same frontier', () => {
  const seed = seedFromString('RW-TEST240');
  const first = createWorld(seed, 'steppe');
  const second = createWorld(seed, 'steppe');
  assert.equal(first.generationVersion, MAP_GENERATION_VERSION);
  assert.equal(worldSignature(first), worldSignature(second));
});

test('Save Load records map generation compatibility without invalidating older saves', () => {
  const game = new Game();
  game.newRun(seedFromString('RW-SAVE240'), { civ: 'TEU', biome: 'steppe' });
  const snapshot = game.snapshot();
  assert.equal(snapshot.mapGenerationVersion, MAP_GENERATION_VERSION);
  const restored = new Game();
  assert.doesNotThrow(() => restored.restore(structuredClone(snapshot)));
  const legacy = structuredClone(snapshot);
  delete legacy.mapGenerationVersion;
  assert.doesNotThrow(() => restored.restore(legacy));
  const future = structuredClone(snapshot);
  future.mapGenerationVersion = MAP_GENERATION_VERSION + 1;
  assert.throws(() => restored.restore(future), /map generation version/);
});
