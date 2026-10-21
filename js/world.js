import { mulberry32, rand, randInt, dist, pointSegmentDist, pick, hash2 } from './utils.js';

export const WORLD_SIZE = 50;

const CAMPS = [
  { x: 26, y: 3.5, name: 'The Northern Pyres', angle: 0.2 },
  { x: 46, y: 27, name: 'The Red Camp', angle: 2.8 },
  { x: 27, y: 46.3, name: 'The Broken Causeway', angle: 5.5 },
  { x: 5.5, y: 42, name: 'The Sunken Fens', angle: 4.2 },
];

const FOREST_CLUSTERS = [
  { x: 16, y: 19.5, r: 3.8, count: 17, kind: 'oak' },
  { x: 31.5, y: 18.5, r: 3.4, count: 14, kind: 'pine' },
  { x: 34.5, y: 32.5, r: 3.8, count: 16, kind: 'oak' },
  { x: 17.5, y: 34, r: 3.6, count: 14, kind: 'pine' },
  { x: 9.5, y: 26, r: 3.2, count: 12, kind: 'pine' },
  { x: 38.5, y: 13, r: 3.7, count: 15, kind: 'oak' },
  { x: 12.5, y: 40, r: 3.1, count: 11, kind: 'oak' },
  { x: 39.5, y: 35, r: 3.2, count: 11, kind: 'pine' },
  { x: 28, y: 44, r: 3.4, count: 12, kind: 'oak' },
  { x: 44, y: 41, r: 2.6, count: 8, kind: 'pine' },
];

const GOLD_PATCHES = [
  { x: 18, y: 23, count: 5 },
  { x: 32, y: 27.5, count: 5 },
  { x: 26.5, y: 14, count: 4 },
  { x: 11.5, y: 33, count: 4 },
  { x: 37.5, y: 27, count: 4 },
];

const STONE_PATCHES = [
  { x: 21.5, y: 32, count: 4 },
  { x: 35.5, y: 23.5, count: 4 },
  { x: 15, y: 16, count: 3 },
  { x: 38, y: 38, count: 3 },
];

const BERRY_PATCHES = [
  { x: 29.5, y: 21.2, count: 6 },
  { x: 19.5, y: 29.5, count: 5 },
  { x: 34.5, y: 35.5, count: 4 },
  { x: 25.5, y: 37.5, count: 4 },
];

export function createWorld(seed, biomeId = 'ashlands') {
  const rng = mulberry32(seed);
  const tiles = new Array(WORLD_SIZE * WORLD_SIZE);
  const resources = [];
  const props = [];
  const camps = CAMPS.map(c => ({ ...c }));
  let nextId = 1;

  for (let y = 0; y < WORLD_SIZE; y++) {
    for (let x = 0; x < WORLD_SIZE; x++) {
      tiles[y * WORLD_SIZE + x] = {
        terrain: 'grass',
        variant: Math.floor(rng() * 4),
        tint: rng(),
        detail: rng(),
      };
    }
  }

  const base = { x: 24.5, y: 26.5 };
  const lakeScale = biomeId === 'isles' ? 1.75 : biomeId === 'fjord' ? 1.45 : biomeId === 'dunes' ? 0.45 : 1;
  const inLake = (x, y) => {
    const cx = 44.5, cy = 43.5;
    const wobble = Math.sin(x * 1.7 + y * 0.8) * 1.2 + Math.cos(y * 2.1) * 0.8;
    return dist(x, y, cx, cy) + wobble < 7.8 * lakeScale && x > 36 - lakeScale * 2 && y > 34 - lakeScale * 2;
  };
  const inRiver = (x, y) => {
    if (biomeId !== 'riverlands') return false;
    const center = 11.5 + Math.sin(y * 0.33) * 1.6 + Math.cos(y * 0.11) * 0.9;
    return Math.abs(x + 0.5 - center) < 1.7;
  };
  const onBridge = (x, y) => biomeId === 'riverlands' && ((y >= 19 && y <= 21) || (y >= 34 && y <= 39));

  for (let y = 0; y < WORLD_SIZE; y++) {
    for (let x = 0; x < WORLD_SIZE; x++) {
      const tile = tiles[y * WORLD_SIZE + x];
      if (inLake(x, y) || (inRiver(x, y) && !onBridge(x, y))) {
        tile.terrain = 'water';
        continue;
      }
      if (onBridge(x, y)) { tile.terrain = 'cobble'; continue; }
      if (biomeId === 'dunes' && dist(x, y, base.x, base.y) > 8 && hash2(x, y, seed) > 0.64) tile.terrain = 'sand';
      if (biomeId === 'ashlands' && dist(x, y, base.x, base.y) > 9 && hash2(x, y, seed + 9) > 0.84) tile.terrain = 'rock';
      if (biomeId === 'highlands' && dist(x, y, base.x, base.y) > 11 && hash2(x, y, seed + 4) > 0.9) tile.terrain = 'rock';
      if (x > 36 && y > 34 && dist(x, y, 43, 42) < 9.2 * Math.min(1.4, lakeScale)) tile.terrain = 'sand';
      const d = dist(x + 0.5, y + 0.5, base.x, base.y);
      if (d < 7.8) {
        const roadNoise = Math.sin(x * 1.2 + y * 2.3) * 0.7 + Math.cos(x * 2.7 - y) * 0.5;
        if (d < 4.8 + roadNoise) tile.terrain = rng() < 0.2 ? 'cobble' : 'dirt';
        else if (d < 6.1 && rng() < 0.35) tile.terrain = 'dirt';
      }
    }
  }

  for (const camp of camps) {
    for (let t = 0; t <= 1; t += 0.035) {
      const x = camp.x + (base.x - camp.x) * t + Math.sin(t * 13 + camp.angle) * 0.8;
      const y = camp.y + (base.y - camp.y) * t + Math.cos(t * 11 + camp.angle) * 0.8;
      for (let oy = -1; oy <= 1; oy++) {
        for (let ox = -1; ox <= 1; ox++) {
          if (Math.abs(ox) + Math.abs(oy) > 1) continue;
          const tx = Math.round(x + ox), ty = Math.round(y + oy);
          if (tx < 0 || ty < 0 || tx >= WORLD_SIZE || ty >= WORLD_SIZE) continue;
          const tile = tiles[ty * WORLD_SIZE + tx];
          if (tile.terrain !== 'water' && rng() < 0.28) tile.terrain = 'dirt';
        }
      }
    }
  }

  const forestScale = biomeId === 'blackforest' ? 1.45 : biomeId === 'steppe' ? 0.6 : biomeId === 'dunes' ? 0.38 : biomeId === 'ashlands' ? 0.72 : 1;
  for (const cluster of FOREST_CLUSTERS) {
    const clusterCount = Math.round(cluster.count * forestScale);
    for (let i = 0; i < clusterCount; i++) {
      const ang = rng() * Math.PI * 2;
      const rad = Math.sqrt(rng()) * cluster.r;
      const x = cluster.x + Math.cos(ang) * rad;
      const y = cluster.y + Math.sin(ang) * rad;
      const tileX = Math.floor(x), tileY = Math.floor(y);
      if (tileX < 1 || tileY < 1 || tileX >= WORLD_SIZE - 1 || tileY >= WORLD_SIZE - 1) continue;
      const tile = tiles[tileY * WORLD_SIZE + tileX];
      if (tile.terrain === 'water' || tile.terrain === 'sand') continue;
      if (dist(x, y, base.x, base.y) < 7.6) continue;
      if (nearSpawnLane(x, y, camps, base, 2.3)) continue;
      if (resources.some(n => n.resource === 'wood' && dist(n.x, n.y, x, y) < 1.15)) continue;
      const kind = cluster.kind === 'pine' || rng() < 0.2 ? 'pine' : 'oak';
      resources.push(makeNode(nextId++, 'wood', kind, x, y, kind === 'pine' ? rand(rng, 105, 145) : rand(rng, 120, 165), rng));
      if (tile.terrain === 'grass' && rng() < 0.65) tile.terrain = 'forest';
    }
  }

  for (const [x, y, kind] of [
    [28.5, 19.8, 'oak'], [20.5, 19.2, 'pine'], [30.5, 29.7, 'oak'],
    [17.8, 30.5, 'pine'], [28.8, 32.2, 'oak'], [22.4, 17.7, 'pine'],
    [33.3, 22.7, 'oak'], [15.8, 26.8, 'pine'], [36.2, 31.2, 'oak'],
  ]) {
    if (dist(x, y, base.x, base.y) < 6) continue;
    resources.push(makeNode(nextId++, 'wood', kind, x + rand(rng, -0.2, 0.2), y + rand(rng, -0.2, 0.2), rand(rng, 115, 160), rng));
  }

  for (const patch of GOLD_PATCHES) {
    for (let i = 0; i < patch.count; i++) {
      const ang = rng() * Math.PI * 2, rad = Math.sqrt(rng()) * 1.7;
      const x = patch.x + Math.cos(ang) * rad, y = patch.y + Math.sin(ang) * rad;
      if (!nodeClear(resources, x, y, base)) continue;
      resources.push(makeNode(nextId++, 'gold', 'gold', x, y, rand(rng, 300, 430), rng));
    }
  }

  for (const patch of STONE_PATCHES) {
    for (let i = 0; i < patch.count; i++) {
      const ang = rng() * Math.PI * 2, rad = Math.sqrt(rng()) * 1.6;
      const x = patch.x + Math.cos(ang) * rad, y = patch.y + Math.sin(ang) * rad;
      if (!nodeClear(resources, x, y, base)) continue;
      resources.push(makeNode(nextId++, 'stone', 'stone', x, y, rand(rng, 260, 380), rng));
    }
  }

  for (const patch of BERRY_PATCHES) {
    for (let i = 0; i < patch.count; i++) {
      const ang = rng() * Math.PI * 2, rad = Math.sqrt(rng()) * 1.6;
      const x = patch.x + Math.cos(ang) * rad, y = patch.y + Math.sin(ang) * rad;
      if (!nodeClear(resources, x, y, base)) continue;
      resources.push(makeNode(nextId++, 'food', 'berry', x, y, rand(rng, 130, 190), rng));
    }
  }

  for (const [x, y, kind] of [
    [26.4, 31.2, 'sheep'], [27.2, 31.8, 'sheep'], [21.1, 28.2, 'sheep'],
    [33, 26, 'sheep'], [13.5, 24.5, 'sheep'], [15.2, 25.7, 'sheep'],
  ]) {
    if (!nodeClear(resources, x, y, base, 1.2)) continue;
    resources.push(makeNode(nextId++, 'food', kind, x, y, rand(rng, 140, 175), rng));
  }

  for (const camp of camps) {
    props.push({ kind: 'warcamp', x: camp.x, y: camp.y, angle: camp.angle, size: 1 });
    for (let i = 0; i < 4; i++) {
      const a = camp.angle + i * 1.4 + rng() * 0.4;
      props.push({ kind: 'tent', x: camp.x + Math.cos(a) * 2.1, y: camp.y + Math.sin(a) * 2.1, angle: a, size: rand(rng, .8, 1.1) });
    }
    for (let i = 0; i < 3; i++) {
      props.push({ kind: 'campfire', x: camp.x + rand(rng, -1.2, 1.2), y: camp.y + rand(rng, -1.2, 1.2), phase: rng() * 6, size: rand(rng, .8, 1.15) });
    }
    for (let i = 0; i < 3; i++) {
      props.push({ kind: 'palisade', x: camp.x + rand(rng, -2.7, 2.7), y: camp.y + rand(rng, -2.7, 2.7), angle: rng() * 6, size: rand(rng, .8, 1.1) });
    }
  }

  props.push(
    { kind: 'cart', x: 30.4, y: 31.1, angle: -0.4 },
    { kind: 'hay', x: 19.7, y: 31.7, angle: 0.5 },
    { kind: 'crates', x: 21.7, y: 23.6, angle: 0.1 },
    { kind: 'well', x: 31.2, y: 24.6, angle: 0 },
    { kind: 'stump', x: 18.7, y: 21.7, angle: 0.6 },
    { kind: 'ruin', x: 14.2, y: 38.2, angle: 0.8 },
    { kind: 'ruin', x: 41.2, y: 9.7, angle: 2.2 },
    { kind: 'banner', x: 27.3, y: 23.2, angle: 0 },
    { kind: 'banner', x: 21.5, y: 29.2, angle: 0 },
  );

  for (let i = 0; i < 24; i++) {
    const x = rand(rng, 2, WORLD_SIZE - 2), y = rand(rng, 2, WORLD_SIZE - 2);
    if (dist(x, y, base.x, base.y) < 6) continue;
    props.push({ kind: pick(rng, ['bush', 'bush', 'rocks', 'flowers']), x, y, angle: rng() * 6, size: rand(rng, .65, 1.05) });
  }

  if (biomeId === 'dunes') {
    for (let i = 0; i < 16; i++) {
      const x = rand(rng, 3, WORLD_SIZE - 3), y = rand(rng, 3, WORLD_SIZE - 3);
      if (dist(x, y, base.x, base.y) < 7) continue;
      props.push({ kind: pick(rng, ['rocks', 'bush']), x, y, angle: rng() * 6, size: rand(rng, .55, .9) });
    }
  } else if (biomeId === 'ashlands') {
    for (let i = 0; i < 14; i++) {
      const x = rand(rng, 3, WORLD_SIZE - 3), y = rand(rng, 3, WORLD_SIZE - 3);
      if (dist(x, y, base.x, base.y) < 7) continue;
      props.push({ kind: 'rocks', x, y, angle: rng() * 6, size: rand(rng, .7, 1.2) });
    }
  }

  const wildlife = [
    { kind: 'deer', x: 12.5, y: 24.5, phase: 0.2, homeX: 12.5, homeY: 24.5 },
    { kind: 'deer', x: 35.1, y: 18.8, phase: 2.4, homeX: 35.1, homeY: 18.8 },
    { kind: 'deer', x: 24.4, y: 12.2, phase: 4.8, homeX: 24.4, homeY: 12.2 },
    { kind: 'deer', x: 33.2, y: 38.1, phase: 1.2, homeX: 33.2, homeY: 38.1 },
  ];

  for (let i = resources.length - 1; i >= 0; i--) {
    const n = resources[i];
    const t = tiles[Math.floor(n.y) * WORLD_SIZE + Math.floor(n.x)];
    if (!t || t.terrain === 'water') resources.splice(i, 1);
  }

  return {
    size: WORLD_SIZE, tiles, resources, props, camps, base, wildlife, seed, biome: biomeId,
    tile(x, y) {
      const tx = Math.floor(x), ty = Math.floor(y);
      if (tx < 0 || ty < 0 || tx >= WORLD_SIZE || ty >= WORLD_SIZE) return null;
      return tiles[ty * WORLD_SIZE + tx];
    },
  };
}

function makeNode(id, resource, kind, x, y, amount, rng) {
  return {
    id, resource, kind, x, y, amount, maxAmount: amount,
    radius: kind === 'sheep' ? 0.26 : 0.32,
    variant: Math.floor(rng() * 5),
    phase: rng() * 8,
    scale: kind === 'pine' ? 0.9 + rng() * 0.25 : 0.88 + rng() * 0.3,
    selectable: true,
    alive: true,
    hitFlash: 0,
  };
}

function nodeClear(resources, x, y, base, extra = 0.9) {
  if (x < 1 || y < 1 || x > WORLD_SIZE - 1 || y > WORLD_SIZE - 1) return false;
  if (dist(x, y, base.x, base.y) < 5.3 + extra) return false;
  return !resources.some(n => dist(n.x, n.y, x, y) < extra);
}

function nearSpawnLane(x, y, camps, base, threshold) {
  for (const camp of camps) {
    if (pointSegmentDist(x, y, camp.x, camp.y, base.x, base.y) < threshold) return true;
  }
  return false;
}
