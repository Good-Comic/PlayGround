import test from 'node:test';
import assert from 'node:assert/strict';
import { waterBankEdges } from '../js/renderer.js';

test('shorelines follow dry neighbors, skip map boundaries and preserve source tiles', () => {
  const world = { size: 3, tiles: Array.from({ length: 9 }, () => ({ terrain: 'water' })) };
  world.tiles[1].terrain = 'grass'; world.tiles[5].terrain = 'dirt';
  const before = JSON.stringify(world);
  assert.deepEqual(waterBankEdges(world, 1, 1), [0, 1]);
  assert.deepEqual(waterBankEdges(world, 0, 0), [1]);
  assert.deepEqual(waterBankEdges(world, 1, 0), []);
  assert.deepEqual(waterBankEdges(world, 2, 2), [0]);
  assert.equal(JSON.stringify(world), before);
});
