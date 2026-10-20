import { MAP_W, MAP_H, RNG, tileHash } from './utils.js';

const RESOURCE_TYPES = {
  tree: { amount: 95, blocked: true, label: 'Oak' },
  gold: { amount: 420, blocked: true, label: 'Gold Vein' },
  stone: { amount: 360, blocked: true, label: 'Stone Outcrop' },
  berry: { amount: 240, blocked: false, label: 'Berry Bush' },
  sheep: { amount: 180, blocked: false, label: 'Sheep' }
};

export class World {
  constructor(seed) {
    this.seed = seed;
    this.rng = new RNG(seed);
    this.w = MAP_W;
    this.h = MAP_H;
    this.tiles = [];
    this.nodes = [];
    this.decor = [];
    this.spawnPoints = [];
    this.camps = [];
    this.bridge = [];
    this.generate();
  }

  idx(x, y) { return y * MAP_W + x; }
  inBounds(x, y) { return x >= 0 && y >= 0 && x < MAP_W && y < MAP_H; }
  tileAt(x, y) { return this.inBounds(x, y) ? this.tiles[this.idx(x, y)] : null; }
  nodeAt(x, y) { return this.nodes.find(node => node.x === x && node.y === y && !node.depleted) || null; }

  isStaticBlocked(x, y) {
    const tile = this.tileAt(x, y);
    if (!tile) return true;
    if (tile.terrain === 'water') return true;
    const node = this.nodeAt(x, y);
    return Boolean(node && node.blocked);
  }

  generate() {
    const rng = this.rng;
    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        this.tiles[this.idx(x, y)] = {
          x, y, terrain: 'grass', blocked: false,
          variant: tileHash(x, y, this.seed),
          tint: tileHash(x, y, this.seed + 77),
          detail: tileHash(x, y, this.seed + 144)
        };
      }
    }
    this.carveRiver();
    this.paintRoad();
    this.placeCamps();
    this.placeResources();
    this.placeDecor();
    this.markBridge();
  }

  carveRiver() {
    for (let y = 0; y < MAP_H; y++) {
      const center = 24 + Math.round(Math.sin(y * .31 + 1.4) * 1.1);
      for (let x = center; x <= center + 1; x++) {
        const tile = this.tileAt(x, y);
        tile.terrain = 'water';
        tile.blocked = true;
      }
      if (y % 4 === 0) {
        for (let x = center - 1; x <= center + 2; x++) {
          const tile = this.tileAt(x, y);
          if (tile && tile.terrain !== 'water') tile.terrain = 'sand';
        }
      }
    }
    for (let y = 17; y <= 20; y++) {
      const center = 24 + Math.round(Math.sin(y * .31 + 1.4) * 1.1);
      for (let x = center; x <= center + 1; x++) {
        const tile = this.tileAt(x, y);
        tile.terrain = 'bridge';
        tile.blocked = false;
        this.bridge.push({ x, y });
      }
    }
  }

  paintRoad() {
    const road = [];
    for (let x = 8; x <= 34; x++) road.push([x, 18]);
    for (let x = 10; x <= 14; x++) road.push([x, 19]);
    for (let y = 8; y <= 17; y++) {
      if (y < 13) road.push([31, y]);
    }
    for (const [x, y] of road) {
      const tile = this.tileAt(x, y);
      if (!tile || tile.terrain === 'water') continue;
      if (tile.terrain !== 'bridge') tile.terrain = 'dirt';
    }
    for (let y = 19; y <= 29; y++) {
      if (y > 24) road.push([32, y]);
      const tile = this.tileAt(32, y);
      if (tile && tile.terrain !== 'water') tile.terrain = 'dirt';
    }
  }

  placeCamps() {
    const camps = [
      { x: 33, y: 8, variant: 0 },
      { x: 33, y: 28, variant: 1 },
      { x: 30, y: 33, variant: 2 }
    ];
    for (const camp of camps) {
      this.camps.push(camp);
      for (let oy = -1; oy <= 1; oy++) {
        for (let ox = -1; ox <= 1; ox++) {
          const tile = this.tileAt(camp.x + ox, camp.y + oy);
          if (tile && tile.terrain !== 'water') tile.terrain = 'ash';
        }
      }
    }
    this.spawnPoints = [
      { x: 33.5, y: 8.5 },
      { x: 34.2, y: 18.5 },
      { x: 33.5, y: 28.5 }
    ];
  }

  canPlaceNode(x, y, clearance = 1) {
    if (!this.inBounds(x, y)) return false;
    const tile = this.tileAt(x, y);
    if (tile.terrain !== 'grass' && tile.terrain !== 'dirt') return false;
    if (this.nodeAt(x, y)) return false;
    if (x >= 7 && x <= 15 && y >= 14 && y <= 23) return false;
    if (y === 18 || y === 19) return false;
    if (x >= 29) return false;
    if (clearance > 0) {
      for (let oy = -1; oy <= 1; oy++) {
        for (let ox = -1; ox <= 1; ox++) {
          if (!ox && !oy) continue;
          if (this.nodeAt(x + ox, y + oy)) return false;
        }
      }
    }
    return true;
  }

  addNode(type, x, y) {
    const def = RESOURCE_TYPES[type];
    const node = {
      id: `n${this.nodes.length + 1}`,
      type, x, y,
      amount: def.amount,
      max: def.amount,
      blocked: def.blocked,
      depleted: false,
      variant: this.rng.next()
    };
    this.nodes.push(node);
    return node;
  }

  placeCluster(type, cx, cy, radius, density = .65) {
    const reach = Math.ceil(radius);
    for (let oy = -reach; oy <= reach; oy++) {
      for (let ox = -reach; ox <= reach; ox++) {
        if (Math.hypot(ox, oy) > radius + .2) continue;
        if (this.rng.next() > density) continue;
        const x = cx + ox;
        const y = cy + oy;
        if (!this.canPlaceNode(x, y)) continue;
        this.addNode(type, x, y);
      }
    }
  }

  placeResources() {
    this.placeCluster('tree', 5, 10, 3.2, .8);
    this.placeCluster('tree', 14, 6, 2.7, .78);
    this.placeCluster('tree', 3, 20, 2.6, .8);
    this.placeCluster('tree', 5, 28, 3.1, .8);
    this.placeCluster('tree', 16, 30, 3.4, .82);
    this.placeCluster('tree', 18, 12, 1.8, .55);
    this.placeCluster('tree', 22, 5, 2.4, .65);
    this.placeCluster('tree', 29, 34, 2.6, .7);
    this.placeCluster('tree', 2, 4, 3.2, .7);
    this.placeCluster('tree', 20, 33, 2.2, .55);

    this.addNode('berry', 13, 15);
    this.addNode('berry', 14, 15);
    this.addNode('berry', 13, 16);
    this.addNode('berry', 7, 24);
    this.addNode('berry', 8, 24);
    this.addNode('berry', 16, 23);

    this.addNode('gold', 17, 14);
    this.addNode('gold', 17, 15);
    this.addNode('gold', 18, 15);
    this.addNode('gold', 5, 25);
    this.addNode('gold', 6, 25);
    this.addNode('gold', 20, 9);
    this.addNode('gold', 21, 9);
    this.addNode('gold', 27, 31);
    this.addNode('gold', 28, 31);

    this.addNode('stone', 4, 16);
    this.addNode('stone', 4, 17);
    this.addNode('stone', 15, 27);
    this.addNode('stone', 16, 27);
    this.addNode('stone', 21, 22);
    this.addNode('stone', 22, 22);

    const sheepSpots = [[12, 22], [14, 22], [12, 23], [15, 23], [7, 17]];
    for (const [x, y] of sheepSpots) {
      const tile = this.tileAt(x, y);
      if (tile && tile.terrain === 'grass' && !this.nodeAt(x, y)) {
        this.addNode('sheep', x, y);
        tile.terrain = 'grass';
      }
    }

    for (let i = 0; i < 12; i++) {
      const x = this.rng.int(16, 23);
      const y = this.rng.int(2, 34);
      if (this.canPlaceNode(x, y) && this.rng.chance(.65)) this.addNode('tree', x, y);
    }
  }

  placeDecor() {
    const rng = this.rng;
    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        const tile = this.tileAt(x, y);
        if (!tile || tile.terrain === 'water' || tile.terrain === 'bridge') continue;
        if (this.nodeAt(x, y)) continue;
        const roll = tileHash(x, y, this.seed + 501);
        if (roll > .86) {
          this.decor.push({ type: 'tuft', x: x + rng.range(.2, .8), y: y + rng.range(.2, .8), variant: rng.next() });
        } else if (roll > .82) {
          this.decor.push({ type: 'flower', x: x + rng.range(.2, .8), y: y + rng.range(.2, .8), variant: rng.next() });
        } else if (roll > .808) {
          this.decor.push({ type: 'rock', x: x + rng.range(.25, .75), y: y + rng.range(.25, .75), variant: rng.next() });
        } else if (roll < .025 && !(x >= 7 && x <= 15 && y >= 14 && y <= 23)) {
          this.decor.push({ type: 'stump', x: x + .5, y: y + .5, variant: rng.next() });
        }
      }
    }
    for (const b of this.bridge) {
      // bridge planks are drawn by the renderer
      this.decor.push({ type: 'bridgeMark', x: b.x + .5, y: b.y + .5 });
    }
    for (let y = 0; y < MAP_H; y++) {
      const tile = this.tileAt(23, y);
      if (tile && tile.terrain === 'water') {
        this.decor.push({ type: 'reed', x: 23 + this.rng.range(.1, .4), y: y + this.rng.range(.1, .9), variant: this.rng.next() });
      }
    }
    this.decor.push({ type: 'ruin', x: 19, y: 7 });
    this.decor.push({ type: 'bones', x: 27, y: 16 });
    this.decor.push({ type: 'bones', x: 28, y: 24 });
  }

  markBridge() {
    for (const tile of this.tiles) {
      if (tile.terrain === 'bridge') tile.blocked = false;
    }
  }

  nearestNode(type, x, y, predicate = null) {
    let best = null;
    let bestDistance = Infinity;
    for (const node of this.nodes) {
      if (node.depleted || node.type !== type) continue;
      if (predicate && !predicate(node)) continue;
      const d = Math.hypot(node.x + .5 - x, node.y + .5 - y);
      if (d < bestDistance) { bestDistance = d; best = node; }
    }
    return best;
  }
}
