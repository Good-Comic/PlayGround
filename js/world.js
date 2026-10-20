import { MAP_SIZE } from './constants.js';
import { mulberry32, hash2, dist, pick } from './utils.js';

export const NODE_DATA = {
  tree: { resource: 'wood', amount: 110, name: 'Tree' },
  berry: { resource: 'food', amount: 150, name: 'Berry Bush' },
  gold: { resource: 'gold', amount: 300, name: 'Gold Vein' },
  stone: { resource: 'stone', amount: 260, name: 'Stone Outcrop' }
};

export class World {
  constructor(seed = Date.now()) {
    this.seed = seed;
    this.rng = mulberry32(seed);
    this.tiles = [];
    this.nodes = [];
    this.occupancy = new Map();
    this.reserved = new Set();
    this.build();
  }

  key(x, y) { return `${x},${y}`; }

  build() {
    const rng = this.rng;
    this.reserve(6, 6, 3);
    this.reserve(3, 5, 2);
    this.reserve(10, 7, 2);
    this.reserve(9, 4, 2);
    this.reserve(4, 9, 2);

    for (let y = 0; y < MAP_SIZE; y++) {
      const row = [];
      for (let x = 0; x < MAP_SIZE; x++) {
        row.push({
          x, y,
          terrain: 'grass',
          variant: rng(),
          tone: rng(),
          deco: rng(),
          road: false
        });
      }
      this.tiles.push(row);
    }

    const lakes = [
      { x: 2.2 + rng() * 1.1, y: 12.6 + rng() * 1.2, r: 1.7 + rng() * 0.9 },
      { x: 12.7 + rng() * 1.2, y: 2.6 + rng() * 1.1, r: 1.5 + rng() * 0.8 }
    ];
    for (const lake of lakes) {
      for (let y = 0; y < MAP_SIZE; y++) {
        for (let x = 0; x < MAP_SIZE; x++) {
          const d = dist(x + 0.5, y + 0.5, lake.x, lake.y);
          if (d < lake.r) this.tiles[y][x].terrain = 'water';
          else if (d < lake.r + 0.85 && this.tiles[y][x].terrain === 'grass') this.tiles[y][x].terrain = 'sand';
        }
      }
    }

    for (let y = 0; y < MAP_SIZE; y++) {
      for (let x = 0; x < MAP_SIZE; x++) {
        const t = this.tiles[y][x];
        const onCross = (Math.abs(x - 7.5) <= 1.6 || Math.abs(y - 7.5) <= 1.6);
        const nearTC = Math.max(Math.abs(x - 7.5), Math.abs(y - 7.5));
        if (t.terrain !== 'water' && (nearTC < 2.2 || (onCross && nearTC < 6.4 && rng() > 0.18))) {
          t.road = true;
          if (t.terrain === 'grass') t.terrain = 'dirt';
        }
      }
    }

    const forests = [
      [1.8, 1.8], [14.2, 1.5], [1.5, 8.5], [14.2, 8.8], [8.0, 1.4],
      [1.4, 14.3], [14.3, 14.2], [11.8, 12.9], [5.0, 14.1]
    ];
    for (const [cx, cy] of forests) {
      const count = 7 + Math.floor(rng() * 6);
      for (let i = 0; i < count; i++) {
        const a = rng() * Math.PI * 2;
        const r = Math.pow(rng(), 0.7) * 2.6;
        const x = Math.round(cx + Math.cos(a) * r);
        const y = Math.round(cy + Math.sin(a) * r);
        this.addNode('tree', x, y);
      }
    }
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2 + rng() * 0.5;
      const r = 3.1 + rng() * 1.3;
      const x = Math.round(7.5 + Math.cos(a) * r);
      const y = Math.round(7.5 + Math.sin(a) * r);
      this.addNode('tree', x, y);
    }

    const foodSpots = [[5.0, 3.7], [10.6, 5.4], [10.4, 10.2], [5.2, 11.2], [3.5, 7.7], [12.2, 8.0]];
    for (const [sx, sy] of foodSpots) {
      const n = 2 + Math.floor(rng() * 2);
      for (let i = 0; i < n; i++) this.addNode('berry', Math.round(sx + (rng() - 0.5) * 2), Math.round(sy + (rng() - 0.5) * 2));
    }

    const goldSpots = [[3.2, 4.0], [12.6, 5.2], [11.4, 13.0], [4.0, 12.4], [8.4, 2.6]];
    for (const [sx, sy] of goldSpots) {
      const n = 1 + Math.floor(rng() * 2);
      for (let i = 0; i < n; i++) this.addNode('gold', Math.round(sx + (rng() - 0.5) * 1.2), Math.round(sy + (rng() - 0.5) * 1.2));
    }
    const stoneSpots = [[2.4, 6.8], [13.4, 9.6], [7.2, 13.6], [9.6, 2.2]];
    for (const [sx, sy] of stoneSpots) {
      const n = 1 + Math.floor(rng() * 2);
      for (let i = 0; i < n; i++) this.addNode('stone', Math.round(sx + (rng() - 0.5) * 1.2), Math.round(sy + (rng() - 0.5) * 1.2));
    }

    for (const node of this.nodes) {
      const t = this.tile(node.tx, node.ty);
      if (t && t.terrain === 'grass') {
        t.deco = 0.5;
        if (node.kind === 'tree') t.terrain = 'forest';
      }
    }
  }

  reserve(x, y, size) {
    for (let j = 0; j < size; j++) for (let i = 0; i < size; i++) this.reserved.add(this.key(x + i, y + j));
  }

  addNode(kind, tx, ty) {
    if (tx < 0 || ty < 0 || tx >= MAP_SIZE || ty >= MAP_SIZE) return;
    const key = this.key(tx, ty);
    if (this.reserved.has(key)) return;
    const tile = this.tiles[ty][tx];
    if (tile.terrain === 'water' || tile.terrain === 'sand') return;
    if (this.nodes.some(n => n.tx === tx && n.ty === ty)) return;
    const data = NODE_DATA[kind];
    const rng = mulberry32((this.seed ^ (tx * 73856093) ^ (ty * 19349663)) >>> 0);
    this.nodes.push({
      id: `node-${tx}-${ty}`,
      kind,
      tx, ty,
      x: tx + 0.5 + (rng() - 0.5) * 0.32,
      y: ty + 0.5 + (rng() - 0.5) * 0.32,
      amount: data.amount,
      max: data.amount,
      resource: data.resource,
      scale: 0.82 + rng() * 0.4,
      seed: rng() * 1000,
      sway: rng() * Math.PI * 2
    });
  }

  tile(x, y) {
    const ix = Math.floor(x), iy = Math.floor(y);
    if (ix < 0 || iy < 0 || ix >= MAP_SIZE || iy >= MAP_SIZE) return null;
    return this.tiles[iy][ix];
  }

  isWater(x, y) {
    const t = this.tile(x, y);
    return !t || t.terrain === 'water';
  }

  isOccupied(x, y) {
    return this.occupancy.has(this.key(Math.floor(x), Math.floor(y)));
  }

  nodeAt(x, y, radius = 0.85) {
    let best = null, bestD = radius;
    for (const n of this.nodes) {
      if (n.amount <= 0) continue;
      const d = dist(x, y, n.x, n.y);
      if (d < bestD) { bestD = d; best = n; }
    }
    return best;
  }

  nearestNode(x, y, kind, maxR = 99) {
    let best = null, bestD = maxR;
    for (const n of this.nodes) {
      if (n.amount <= 0) continue;
      if (kind && n.kind !== kind) continue;
      const d = dist(x, y, n.x, n.y);
      if (d < bestD) { bestD = d; best = n; }
    }
    return best;
  }

  nodesOfKind(kind, resource) {
    return this.nodes.filter(n => n.amount > 0 && (kind ? n.kind === kind : n.resource === resource));
  }

  occupy(building) {
    const def = building.def;
    for (let j = 0; j < def.size; j++) {
      for (let i = 0; i < def.size; i++) {
        this.occupancy.set(this.key(building.tx + i, building.ty + j), building.id);
      }
    }
  }

  vacate(building) {
    for (let j = 0; j < building.def.size; j++) {
      for (let i = 0; i < building.def.size; i++) {
        const k = this.key(building.tx + i, building.ty + j);
        if (this.occupancy.get(k) === building.id) this.occupancy.delete(k);
      }
    }
  }

  canPlace(type, tx, ty, def, buildings) {
    for (let j = 0; j < def.size; j++) {
      for (let i = 0; i < def.size; i++) {
        const x = tx + i, y = ty + j;
        if (x < 0 || y < 0 || x >= MAP_SIZE || y >= MAP_SIZE) return false;
        const t = this.tiles[y][x];
        if (!t || t.terrain === 'water') return false;
        const k = this.key(x, y);
        if (this.occupancy.has(k)) return false;
        if (this.nodes.some(n => n.amount > 0 && n.tx === x && n.ty === y)) return false;
        if (type !== 'towncenter' && this.reserved.has(k)) return false;
      }
    }
    return true;
  }

  randomEdgePoint(edge, rng = Math.random) {
    const p = 0.5 + rng() * (MAP_SIZE - 1);
    if (edge === 0) return { x: p, y: 0.2 };
    if (edge === 1) return { x: MAP_SIZE - 0.2, y: p };
    if (edge === 2) return { x: p, y: MAP_SIZE - 0.2 };
    return { x: 0.2, y: p };
  }

  spawnField(edge, rng = Math.random) {
    const p = 1.2 + rng() * (MAP_SIZE - 2.4);
    if (edge === 0) return { x: p, y: -0.6 };
    if (edge === 1) return { x: MAP_SIZE + 0.6, y: p };
    if (edge === 2) return { x: p, y: MAP_SIZE + 0.6 };
    return { x: -0.6, y: p };
  }

  tilesFlattened() {
    return this.tiles.flat();
  }

  decoHash(x, y, salt = 0) {
    return hash2(x, y, this.seed + salt);
  }
}
