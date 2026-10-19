import * as THREE from 'three';
import {
  RNG, clamp, lerp, smoothstep, fbm2,
  HEX_R, HEX_DIRS, SQRT3, axialToWorld, worldToAxial, axialKey,
  axialDistance, hexesWithin, hexCorners,
} from './core.js';

const WATER_Y = 0.3;

export const BIOMES = {
  ocean:    { top: 0x14424f, side: 0x0d2b36, yields: { food: 1, gold: 1 }, water: true, passable: false },
  coast:    { top: 0x2f8fa6, side: 0x1c5f76, yields: { food: 1, gold: 1 }, water: true, passable: false },
  grassland:{ top: 0x5f9a3f, side: 0x6f5a38, yields: { food: 2 }, passable: true },
  plains:   { top: 0xa8944e, side: 0x7d6a3d, yields: { food: 1, production: 1 }, passable: true },
  desert:   { top: 0xd8c07a, side: 0xb29a5c, yields: { gold: 1 }, passable: true },
  tundra:   { top: 0x8fa08c, side: 0x71786b, yields: { food: 1 }, passable: true },
  snow:     { top: 0xe8eef1, side: 0xbfc8ce, yields: {}, passable: true },
  hills:    { top: 0x5c8348, side: 0x6b5a3c, yields: { production: 2 }, hills: true, passable: true },
  mountain: { top: 0xa9abad, side: 0x7d7870, yields: { production: 1 }, mountain: true, passable: false },
  lake:     { top: 0x1f6672, side: 0x14424f, yields: { food: 2 }, water: true, passable: false },
};

export const FEATURES = {
  forest:  { label: 'Woods',  yields: { production: 1 }, move: 2, defense: 0.25 },
  jungle:  { label: 'Jungle', yields: { food: 1 }, move: 2, defense: 0.25 },
  marsh:   { label: 'Marsh',  yields: { food: 1 }, move: 2, defense: 0.15 },
  oasis:   { label: 'Oasis',  yields: { food: 2, gold: 1 } },
  floodplains: { label: 'Floodplains', yields: { food: 1 } },
  ice:     { label: 'Ice',    yields: {} },
  reef:    { label: 'Reef',   yields: { food: 1 } },
};

export const RESOURCES = {
  wheat:   { name: 'Wheat',   shape: 'grain', color: '#e3bf62', yields: { food: 2 } },
  cattle:  { name: 'Cattle',  shape: 'cattle', color: '#c98d5a', yields: { food: 1, production: 1 } },
  deer:    { name: 'Deer',    shape: 'deer', color: '#b07a4b', yields: { food: 1, production: 1 } },
  fish:    { name: 'Fish',    shape: 'fish', color: '#6fc7d6', yields: { food: 2 } },
  horses:  { name: 'Horses',  shape: 'horse', color: '#a9784a', yields: { production: 2 } },
  iron:    { name: 'Iron',    shape: 'ingot', color: '#9aa4ad', yields: { production: 2 } },
  stone:   { name: 'Stone',   shape: 'stone', color: '#b8bcc0', yields: { production: 1, gold: 1 } },
  copper:  { name: 'Copper',  shape: 'ingot', color: '#d08a5a', yields: { production: 1, gold: 2 } },
  gold:    { name: 'Gold',    shape: 'coin', color: '#f0cd71', yields: { gold: 3 } },
  spices:  { name: 'Spices',  shape: 'spice', color: '#d8843f', yields: { food: 1, gold: 2 } },
  silk:    { name: 'Silk',    shape: 'silk', color: '#e6a9c4', yields: { culture: 1, gold: 2 } },
  wine:    { name: 'Wine',    shape: 'grapes', color: '#8e4b7a', yields: { gold: 1, culture: 1 } },
};

const TERRAIN_ORDER = ['grassland', 'plains', 'desert', 'tundra', 'snow'];

export class World {
  constructor(scene, opts = {}) {
    this.scene = scene;
    this.seed = opts.seed ?? 20261019;
    this.cols = opts.cols ?? 21;
    this.rows = opts.rows ?? 13;
    this.sunDir = opts.sunDir ? opts.sunDir.clone().normalize() : new THREE.Vector3(0.62, 0.5, 0.42).normalize();
    this.rng = new RNG(this.seed);
    this.tiles = new Map();
    this.tileList = [];
    this.civs = new Map();
    this.cities = [];
    this.units = [];
    this.clocks = { time: 0 };
    this.bounds = { minX: 0, maxX: 0, minZ: 0, maxZ: 0 };
    this.groups = {};
    this._buildGroups();
    this.generate();
    this.buildTerrain();
    this.buildWater();
    this.buildSky();
  }

  _buildGroups() {
    const g = this.groups;
    g.terrain = new THREE.Group();
    g.props = new THREE.Group();
    g.resources = new THREE.Group();
    g.rivers = new THREE.Group();
    g.fog = new THREE.Group();
    g.overlay = new THREE.Group();
    g.units = new THREE.Group();
    g.cities = new THREE.Group();
    g.effects = new THREE.Group();
    g.territory = new THREE.Group();
    for (const key of Object.keys(g)) this.scene.add(g[key]);
  }

  /* ============================ GENERATION ============================ */
  generate() {
    const { cols, rows, rng } = this;
    const halfC = Math.floor((cols - 1) / 2);
    const minQ = -halfC, maxQ = -halfC + cols - 1;
    const minR = -Math.floor((rows - 1) / 2), maxR = minR + rows - 1;
    this.extent = { minQ, maxQ, minR, maxR };

    const elevation = [];
    const moisture = [];
    for (let q = minQ; q <= maxQ; q++) {
      for (let r = minR; r <= maxR; r++) {
        const w = axialToWorld(q, r);
        const nx = w.x / (maxQ * 1.5 + 1);
        const nz = w.z / (Math.max(Math.abs(minR), Math.abs(maxR)) * SQRT3 + 1);
        let e = fbm2(nx * 2.05 + 11.3, nz * 2.05 - 4.7, 5, this.seed, 2.05, 0.52);
        const radial = Math.sqrt(nx * nx + nz * nz);
        const continent = 1 - smoothstep(0.12, 0.96, radial);
        e = e * 0.52 + continent * 0.44 + 0.05 - smoothstep(0.95, 1.15, radial) * 0.3;
        const m = fbm2(nx * 3.1 - 9.1, nz * 3.1 + 6.4, 4, this.seed + 777, 2.1, 0.5);
        elevation.push({ q, r, e });
        moisture.push({ q, r, m });
      }
    }
    const eSorted = elevation.map((x) => x.e).sort((a, b) => a - b);
    const seaLevel = eSorted[Math.floor(eSorted.length * 0.4)];
    const landEs = eSorted.filter((x) => x > seaLevel);
    const quant = (p) => landEs[Math.min(landEs.length - 1, Math.floor(landEs.length * p))] ?? seaLevel + 0.02;
    const highT = quant(0.9), midT = quant(0.68);

    for (const entry of elevation) {
      const { q, r, e } = entry;
      const m = moisture.find((x) => x.q === q && x.r === r).m;
      const w = axialToWorld(q, r);
      const tile = {
        q, r, key: axialKey(q, r), x: w.x, z: w.z,
        elevation: e, moisture: m,
        terrain: 'ocean', feature: null, resource: null,
        h: -0.5, owner: null, city: null, units: [],
        explored: false, visible: false, river: null, improvement: null,
        yields: {}, move: 1, defense: 0,
      };
      this._classify(tile, e, m, seaLevel, highT, midT);
      this.tiles.set(tile.key, tile);
      this.tileList.push(tile);
    }
    this._findCoastsAndLakes();
    this._placeFeatures();
    this._placeResources();
    this._carveRivers();
    this._computeBounds();
  }

  _classify(tile, e, m, seaLevel, highT, midT) {
    const lat = clamp(Math.abs(tile.z) / 21, 0, 1);
    const temp = clamp(1.15 - lat * 1.32 - (e - seaLevel) * 0.5 + (m - 0.5) * 0.1, 0, 1);
    let terrain;
    if (e < seaLevel - (highT - seaLevel) * 0.16) terrain = 'ocean';
    else if (e < seaLevel) terrain = 'coast';
    else if (e > highT) terrain = 'mountain';
    else if (e > midT) terrain = 'hills';
    else if (temp < 0.24) terrain = 'snow';
    else if (temp < 0.4) terrain = 'tundra';
    else if (m < 0.34 && temp > 0.66) terrain = 'desert';
    else if (m > 0.56) terrain = 'grassland';
    else terrain = 'plains';
    tile.terrain = terrain;
    const span = Math.max(0.001, highT - seaLevel);
    const rel = clamp((e - seaLevel) / span, 0, 1.4);
    if (terrain === 'ocean') tile.h = -0.55 - (seaLevel - e) * 4.0;
    else if (terrain === 'coast') tile.h = WATER_Y - 0.06 - (seaLevel - e) * 0.8;
    else if (terrain === 'mountain') tile.h = 1.12 + rel * 0.95;
    else if (terrain === 'hills') tile.h = 0.82 + rel * 0.72;
    else if (terrain === 'desert') tile.h = 0.45 + rel * 0.5;
    else tile.h = 0.5 + rel * 0.9;
    tile.rel = rel;
  }

  _findCoastsAndLakes() {
    // enclosed shallow water becomes lakes
    const seen = new Set();
    for (const tile of this.tileList) {
      if (tile.terrain !== 'coast' || seen.has(tile.key)) continue;
      const region = [];
      const stack = [tile];
      let touchesOcean = false;
      seen.add(tile.key);
      while (stack.length) {
        const t = stack.pop();
        region.push(t);
        for (const [dq, dr] of HEX_DIRS) {
          const n = this.tiles.get(axialKey(t.q + dq, t.r + dr));
          if (!n) continue;
          if (n.terrain === 'ocean') touchesOcean = true;
          else if (n.terrain === 'coast' && !seen.has(n.key)) { seen.add(n.key); stack.push(n); }
        }
      }
      if (!touchesOcean && region.length <= 4) {
        for (const t of region) { t.terrain = 'lake'; t.h = WATER_Y - 0.05; }
      }
    }
  }

  _placeFeatures() {
    const { rng } = this;
    for (const tile of this.tileList) {
      const bt = BIOMES[tile.terrain];
      if (!bt.passable) {
        if (tile.terrain === 'coast' && rng.chance(0.06)) tile.feature = 'reef';
        continue;
      }
      const lat = clamp(Math.abs(tile.z) / 21, 0, 1);
      if (tile.terrain === 'grassland') {
        if (rng.chance(0.44 + (tile.moisture - 0.5) * 0.5)) tile.feature = 'forest';
        else if (lat < 0.32 && rng.chance(0.22)) tile.feature = 'jungle';
        else if (tile.moisture > 0.62 && rng.chance(0.14)) tile.feature = 'marsh';
      } else if (tile.terrain === 'plains') {
        if (rng.chance(0.3)) tile.feature = 'forest';
      } else if (tile.terrain === 'tundra') {
        if (rng.chance(0.34)) tile.feature = 'forest';
      } else if (tile.terrain === 'desert') {
        if (rng.chance(0.06)) tile.feature = 'oasis';
      } else if (tile.terrain === 'coast') {
        if (rng.chance(0.05)) tile.feature = 'reef';
      } else if (tile.terrain === 'snow') {
        if (rng.chance(0.2)) tile.feature = 'ice';
      } else if (tile.terrain === 'hills') {
        if (rng.chance(0.38)) tile.feature = 'forest';
      }
    }
  }

  _placeResources() {
    const { rng } = this;
    const pool = Object.keys(RESOURCES);
    for (const tile of this.tileList) {
      const bt = BIOMES[tile.terrain];
      if (tile.feature === 'oasis') { tile.resource = 'wheat'; continue; }
      if (!bt.passable && tile.terrain !== 'coast') continue;
      if (tile.feature === 'ice') continue;
      const chance = tile.terrain === 'coast' ? 0.1 : 0.1 + (tile.moisture - 0.5) * 0.1;
      if (!rng.chance(chance)) continue;
      let candidates = pool;
      if (tile.terrain === 'coast') candidates = ['fish', 'fish', 'gold', 'stone'];
      else if (tile.terrain === 'desert') candidates = ['wheat', 'copper', 'gold', 'stone', 'spices'];
      else if (tile.terrain === 'snow' || tile.terrain === 'tundra') candidates = ['deer', 'iron', 'stone', 'copper'];
      else if (tile.terrain === 'hills') candidates = ['iron', 'stone', 'copper', 'horses', 'gold'];
      else if (tile.feature === 'forest') candidates = ['deer', 'iron', 'stone'];
      else if (tile.feature === 'jungle') candidates = ['spices', 'silk', 'wine'];
      else candidates = ['wheat', 'cattle', 'horses', 'stone', 'wine', 'silk', 'spices', 'copper', 'gold'];
      tile.resource = rng.pick(candidates);
    }
  }

  _carveRivers() {
    // Find spring tiles high on the map flowing to water.
    const candidates = this.tileList
      .filter((t) => t.terrain === 'mountain' || (t.terrain === 'hills' && t.h > 1.2))
      .sort((a, b) => b.h - a.h);
    const rivers = [];
    for (const spring of candidates) {
      if (rivers.length >= 3) break;
      if (rivers.some((path) => path.some((k) => k === spring.key))) continue;
      const path = this._traceRiver(spring);
      if (path && path.length >= 5) rivers.push(path.map((t) => t.key));
    }
    for (const path of rivers) {
      for (let i = 0; i < path.length; i++) {
        const tile = this.tiles.get(path[i]);
        tile.river = { down: path[i + 1] || null, flow: i / path.length };
        if (BIOMES[tile.terrain].passable) tile.h -= 0.09;
      }
    }
    this.riverPaths = rivers.map((path) => path.map((k) => this.tiles.get(k)));
  }

  _traceRiver(spring) {
    const visited = new Set([spring.key]);
    const path = [spring];
    let cur = spring;
    for (let step = 0; step < 40; step++) {
      const neighbors = HEX_DIRS
        .map(([dq, dr]) => this.tiles.get(axialKey(cur.q + dq, cur.r + dr)))
        .filter((n) => n && !visited.has(n.key) && BIOMES[n.terrain].passable && n.terrain !== 'mountain');
      if (!neighbors.length) return path;
      let next = null;
      if (BIOMES[cur.terrain].passable && cur.terrain !== 'mountain') {
        const water = HEX_DIRS
          .map(([dq, dr]) => this.tiles.get(axialKey(cur.q + dq, cur.r + dr)))
          .find((n) => n && (n.terrain === 'ocean' || n.terrain === 'coast' || n.terrain === 'lake'));
        if (water) { path.push(water); return path; }
      }
      neighbors.sort((a, b) => a.h - b.h);
      next = neighbors[0];
      if (this.rng.chance(0.18) && neighbors[1]) next = neighbors[1];
      visited.add(next.key);
      path.push(next);
      cur = next;
      if (cur.terrain === 'coast' || cur.terrain === 'ocean' || cur.terrain === 'lake') break;
    }
    return path;
  }

  _computeBounds() {
    let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
    for (const t of this.tileList) {
      minX = Math.min(minX, t.x - 1); maxX = Math.max(maxX, t.x + 1);
      minZ = Math.min(minZ, t.z - 1); maxZ = Math.max(maxZ, t.z + 1);
    }
    this.bounds = { minX, maxX, minZ, maxZ };
  }

  /* ============================ TERRAIN MESH ============================ */
  buildTerrain() {
    const pos = [], col = [];
    const rock = new THREE.Color(0x6b6156);
    const tmp = new THREE.Color();
    const push = (a, b, c, ca, cb, cc) => {
      pos.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z);
      col.push(ca.r, ca.g, ca.b, cb.r, cb.g, cb.b, cc.r, cc.g, cc.b);
    };
    const baseY = -2.6;
    for (const tile of this.tileList) {
      const bt = BIOMES[tile.terrain];
      const top = new THREE.Color(bt.top);
      const side = new THREE.Color(bt.side);
      const center = new THREE.Vector3(tile.x, tile.h + (bt.water ? 0 : 0.05), tile.z);
      const corners = hexCorners(tile.x, tile.z, HEX_R);
      const topPts = corners.map((p) => new THREE.Vector3(p.x, tile.h, p.z));
      // top face (wound so normals face upward)
      for (let i = 0; i < 6; i++) {
        const a = topPts[i], b = topPts[(i + 1) % 6];
        const cCenter = center.clone();
        cCenter.y += 0.02;
        const shade = 0.92 + 0.16 * fbm2(tile.x * 1.7, tile.z * 1.7, 2, this.seed + 5);
        const faceCol = top.clone().multiplyScalar(clamp(shade, 0.7, 1.15));
        const edgeCol = faceCol.clone().multiplyScalar(0.9);
        const cen = faceCol.clone().multiplyScalar(1.06);
        push(a, cCenter, b, edgeCol, cen, edgeCol);
      }
      // side walls
      {
        for (let i = 0; i < 6; i++) {
          const a = topPts[i], b = topPts[(i + 1) % 6];
          const a2 = new THREE.Vector3(a.x, baseY, a.z);
          const b2 = new THREE.Vector3(b.x, baseY, b.z);
          const topSide = side.clone().lerp(rock, tile.terrain === 'coast' ? 0.25 : 0.45);
          const deep = topSide.clone().multiplyScalar(0.5);
          const nvar = 0.9 + 0.2 * fbm2(tile.x * 3.1 + i, tile.z * 3.1, 2, this.seed + 9);
          push(a, b, b2, topSide.clone().multiplyScalar(nvar), topSide.clone().multiplyScalar(nvar), deep);
          push(a, b2, a2, topSide.clone().multiplyScalar(nvar), deep, deep);
        }
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    geo.computeVertexNormals();
    const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, metalness: 0.0, flatShading: true });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.name = 'terrain';
    this.terrainMesh = mesh;
    this.groups.terrain.add(mesh);

    this._buildMountains();
    this._buildHills();
    this._buildTrees();
    this._buildWaterProps();
    this._buildResources();
    this._buildRivers();
    this._buildCoastFoam();
  }

  _buildMountains() {
    const rng = new RNG(this.seed + 42);
    const parts = [];
    const rock = new THREE.Color(0x8a8d90);
    for (const tile of this.tileList) {
      if (tile.terrain !== 'mountain') continue;
      const peaks = rng.int(1, 2);
      for (let p = 0; p < peaks; p++) {
        const ox = p === 0 ? 0 : rng.float(-0.36, 0.36);
        const oz = p === 0 ? 0 : rng.float(-0.36, 0.36);
        const r = p === 0 ? rng.float(0.66, 0.8) : rng.float(0.4, 0.54);
        const height = p === 0 ? rng.float(1.35, 1.95) : rng.float(0.8, 1.15);
        const seg = 7;
        const geo = new THREE.ConeGeometry(r, height, seg, 1);
        const pos = geo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
          const y = pos.getY(i);
          if (y < height * 0.4) {
            const j = rng.float(0.86, 1.12);
            pos.setX(i, pos.getX(i) * j + rng.float(-0.05, 0.05));
            pos.setZ(i, pos.getZ(i) * j + rng.float(-0.05, 0.05));
            pos.setY(i, y + rng.float(-0.06, 0.06));
          }
        }
        geo.computeVertexNormals();
        const baseY = tile.h - (p === 0 ? 0.32 : 0.22) + height / 2;
        parts.push({ geo, color: rock.clone().multiplyScalar(0.74 + p * 0.08).getHex(), x: tile.x + ox, y: baseY, z: tile.z + oz });
        if (height > 1.2) {
          const capH = height * 0.3;
          const cap = new THREE.ConeGeometry(r * 0.46, capH, seg, 1);
          const cp = cap.attributes.position;
          for (let i = 0; i < cp.count; i++) {
            if (cp.getY(i) < capH * 0.4) { const j = rng.float(0.85, 1.12); cp.setX(i, cp.getX(i) * j); cp.setZ(i, cp.getZ(i) * j); }
          }
          cap.computeVertexNormals();
          cap.translate(0, height * 0.66, 0);
          parts.push({ geo: cap, color: 0xeef3f6, x: tile.x + ox * 0.9, y: baseY, z: tile.z + oz * 0.9 });
        }
      }
    }
    if (!parts.length) return;
    const geo = mergeParts(parts);
    const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.94, flatShading: true });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = mesh.receiveShadow = true;
    this.groups.props.add(mesh);
  }

  _buildHills() {
    const geo = new THREE.IcosahedronGeometry(1, 1);
    const mat = new THREE.MeshStandardMaterial({ color: 0x6d8a52, roughness: 0.98, flatShading: true });
    const rng = new RNG(this.seed + 77);
    const list = [];
    for (const tile of this.tileList) {
      if (tile.terrain !== 'hills') continue;
      const count = rng.int(2, 4);
      for (let i = 0; i < count; i++) {
        const a = rng.float(0, Math.PI * 2), rr = rng.float(0, 0.6);
        list.push({
          x: tile.x + Math.cos(a) * rr, z: tile.z + Math.sin(a) * rr,
          y: tile.h - 0.1 + rng.float(0, 0.08),
          sx: rng.float(0.28, 0.5), sy: rng.float(0.18, 0.3), sz: rng.float(0.28, 0.5),
          rot: rng.float(0, Math.PI),
        });
      }
    }
    const inst = new THREE.InstancedMesh(geo, mat, list.length);
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
    list.forEach((it, i) => {
      e.set(0, it.rot, 0); q.setFromEuler(e);
      m.compose(new THREE.Vector3(it.x, it.y, it.z), q, new THREE.Vector3(it.sx, it.sy, it.sz));
      inst.setMatrixAt(i, m);
    });
    inst.castShadow = inst.receiveShadow = true;
    this.groups.props.add(inst);
  }

  _buildTrees() {
    const rng = new RNG(this.seed + 123);
    const conifer = makeConiferGeometry();
    const broad = makeBroadleafGeometry();
    const palm = makePalmGeometry();
    const matC = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9, flatShading: true });
    const matB = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9, flatShading: true });
    const matP = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9, flatShading: true });
    const conifers = [], broads = [], palms = [];
    for (const tile of this.tileList) {
      if (!tile.feature) continue;
      let geoList = null;
      if (tile.feature === 'forest') geoList = Math.abs(tile.z) > 15 ? conifers : (rng.chance(0.55) ? conifers : broads);
      else if (tile.feature === 'jungle') geoList = palms;
      else if (tile.feature === 'marsh' && rng.chance(0.4)) geoList = broads;
      if (!geoList) continue;
      const count = rng.int(3, 6);
      for (let i = 0; i < count; i++) {
        const a = rng.float(0, Math.PI * 2);
        const rr = Math.sqrt(rng.float(0, 1)) * 0.72;
        geoList.push({
          x: tile.x + Math.cos(a) * rr, z: tile.z + Math.sin(a) * rr,
          y: tile.h + 0.02 - (tile.river ? 0.02 : 0),
          s: rng.float(0.8, 1.25), rot: rng.float(0, Math.PI * 2),
        });
      }
    }
    const build = (geo, mat, list, shadow = true) => {
      if (!list.length) return;
      const inst = new THREE.InstancedMesh(geo, mat, list.length);
      const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
      list.forEach((it, i) => {
        e.set(0, it.rot, 0); q.setFromEuler(e);
        m.compose(new THREE.Vector3(it.x, it.y, it.z), q, new THREE.Vector3(it.s, it.s, it.s));
        inst.setMatrixAt(i, m);
        const tint = 0.86 + rng.float(0, 0.26);
        inst.setColorAt(i, new THREE.Color().setRGB(tint, tint * (0.95 + rng.float(0, 0.1)), tint * 0.94));
      });
      inst.castShadow = shadow; inst.receiveShadow = true;
      this.groups.props.add(inst);
    };
    build(conifer, matC, conifers);
    build(broad, matB, broads);
    build(palm, matP, palms);
  }

  _buildWaterProps() {
    const rng = new RNG(this.seed + 321);
    const geo = new THREE.IcosahedronGeometry(1, 0);
    const mat = new THREE.MeshStandardMaterial({ color: 0x9fb0b8, roughness: 0.9, flatShading: true });
    const rocks = [];
    for (const tile of this.tileList) {
      if (tile.terrain !== 'coast' && tile.terrain !== 'ocean') continue;
      if (!rng.chance(tile.terrain === 'coast' ? 0.05 : 0.02)) continue;
      const a = rng.float(0, Math.PI * 2), rr = rng.float(0, 0.5);
      rocks.push({ x: tile.x + Math.cos(a) * rr, z: tile.z + Math.sin(a) * rr, y: WATER_Y - 0.05, s: rng.float(0.06, 0.16) });
    }
    if (!rocks.length) return;
    const inst = new THREE.InstancedMesh(geo, mat, rocks.length);
    const m = new THREE.Matrix4(), q = new THREE.Quaternion();
    rocks.forEach((it, i) => {
      m.compose(new THREE.Vector3(it.x, it.y, it.z), q, new THREE.Vector3(it.s, it.s * 0.7, it.s));
      inst.setMatrixAt(i, m);
    });
    inst.castShadow = true;
    this.groups.props.add(inst);
  }

  _buildResources() {
    const rng = new RNG(this.seed + 654);
    for (const tile of this.tileList) {
      if (!tile.resource) continue;
      const res = RESOURCES[tile.resource];
      const sprite = makeResourceBadge(res, tile);
      sprite.position.set(tile.x, tile.h + 0.62, tile.z);
      sprite.userData.baseY = tile.h + 0.62;
      sprite.userData.phase = rng.float(0, Math.PI * 2);
      sprite.userData.isResource = true;
      this.groups.resources.add(sprite);
      this.billboardSprites = this.billboardSprites || [];
      this.billboardSprites.push(sprite);

      // a small ground prop to anchor the badge
      if (res.shape === 'fish') continue;
      const prop = makeResourceProp(res.shape, res.color, rng);
      if (prop) {
        prop.position.set(tile.x + rng.float(-0.22, 0.22), tile.h + 0.02, tile.z + rng.float(-0.22, 0.22));
        prop.rotation.y = rng.float(0, Math.PI * 2);
        prop.scale.setScalar(0.8);
        prop.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
        this.groups.resources.add(prop);
      }
    }
  }

  _buildRivers() {
    if (!this.riverPaths || !this.riverPaths.length) return;
    const mat = new THREE.MeshStandardMaterial({
      color: 0x3fa7c4, roughness: 0.15, metalness: 0.2, transparent: true, opacity: 0.92,
      emissive: 0x0d3b4c, emissiveIntensity: 0.4,
    });
    this.riverMaterials = [mat];
    for (const path of this.riverPaths) {
      const pts = path.map((t) => new THREE.Vector3(t.x, t.h + 0.035, t.z));
      if (pts.length < 2) continue;
      const curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.4);
      const samples = Math.max(24, pts.length * 8);
      const geo = new THREE.TubeGeometry(curve, samples, 0.085, 6, false);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.receiveShadow = true;
      this.groups.rivers.add(mesh);
    }
  }

  _buildCoastFoam() {
    const pos = [];
    const y = WATER_Y + 0.012;
    for (const tile of this.tileList) {
      if (tile.terrain !== 'coast' && tile.terrain !== 'lake') continue;
      const corners = hexCorners(tile.x, tile.z, HEX_R * 0.995);
      const isShore = HEX_DIRS.some(([dq, dr]) => {
        const n = this.tiles.get(axialKey(tile.q + dq, tile.r + dr));
        return n && BIOMES[n.terrain].passable && !BIOMES[n.terrain].water;
      });
      if (!isShore) continue;
      for (let i = 0; i < 6; i++) {
        const a = corners[i], b = corners[(i + 1) % 6];
        const mx = (a.x + b.x) / 2, mz = (a.z + b.z) / 2;
        const n = this.tiles.get(axialKey(tile.q + HEX_DIRS[i][0], tile.r + HEX_DIRS[i][1]));
        const n2 = this.tiles.get(axialKey(tile.q + HEX_DIRS[(i + 1) % 6][0], tile.r + HEX_DIRS[(i + 1) % 6][1]));
        if ((n && BIOMES[n.terrain].passable) || (n2 && BIOMES[n2.terrain].passable)) {
          const inner = 0.86;
          const ia = { x: lerp(tile.x, a.x, inner), z: lerp(tile.z, a.z, inner) };
          const ib = { x: lerp(tile.x, b.x, inner), z: lerp(tile.z, b.z, inner) };
          pos.push(ia.x, y, ia.z, ib.x, y, ib.z, a.x, y, a.z, ib.x, y, ib.z, b.x, y, b.z, a.x, y, a.z);
        }
      }
    }
    if (!pos.length) return;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.computeVertexNormals();
    const mat = new THREE.MeshBasicMaterial({ color: 0xdfeef2, transparent: true, opacity: 0.22, depthWrite: false, side: THREE.DoubleSide });
    this.foamMaterial = mat;
    const mesh = new THREE.Mesh(geo, mat);
    this.groups.effects.add(mesh);
  }

  /* ============================ WATER ============================ */
  buildWater() {
    const { minX, maxX, minZ, maxZ } = this.bounds;
    const w = maxX - minX + 24, d = maxZ - minZ + 24;
    const geo = new THREE.PlaneGeometry(w, d, 1, 1);
    geo.rotateX(-Math.PI / 2);
    const depthTex = this._makeDepthTexture(512);
    this.waterUniforms = {
      uTime: { value: 0 },
      uDepth: { value: depthTex },
      uShallow: { value: new THREE.Color(0x1f86a0) },
      uDeep: { value: new THREE.Color(0x114668) },
      uSky: { value: new THREE.Color(0x6f9ec0) },
      uSun: { value: new THREE.Vector3(0.5, 0.8, 0.3).normalize() },
      uBounds: { value: new THREE.Vector4(minX - 12, minZ - 12, w, d) },
    };
    const mat = new THREE.ShaderMaterial({
      uniforms: this.waterUniforms,
      transparent: true,
      depthWrite: false,
      vertexShader: /* glsl */`
        uniform float uTime;
        varying vec3 vWorld;
        varying vec2 vUv;
        void main(){
          vec3 p = position;
          float w1 = sin(p.x*0.55 + uTime*0.9)*0.02;
          float w2 = cos(p.z*0.7 - uTime*1.1)*0.018;
          p.y += w1 + w2;
          vec4 wp = modelMatrix * vec4(p,1.0);
          vWorld = wp.xyz;
          vUv = uv;
          gl_Position = projectionMatrix * viewMatrix * wp;
        }`,
      fragmentShader: /* glsl */`
        uniform float uTime;
        uniform sampler2D uDepth;
        uniform vec3 uShallow, uDeep, uSky, uSun;
        uniform vec4 uBounds;
        varying vec3 vWorld;
        varying vec2 vUv;
        float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
        float noise(vec2 p){
          vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
          return mix(mix(hash(i),hash(i+vec2(1,0)),f.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x), f.y);
        }
        void main(){
          vec2 uv = (vWorld.xz - uBounds.xy) / uBounds.zw;
          float depth = texture2D(uDepth, uv).r;
          vec2 wuv = vWorld.xz*0.5;
          float n1 = noise(wuv + vec2(uTime*0.14, uTime*0.1));
          float n2 = noise(wuv*2.1 - vec2(uTime*0.22, uTime*0.16));
          float ripple = (n1-0.5)*0.5 + (n2-0.5)*0.28;
          vec3 nrm = normalize(vec3(ripple*0.35, 1.0, ripple*0.28));
          vec3 viewDir = normalize(cameraPosition - vWorld);
          float fres = pow(1.0 - max(dot(nrm, viewDir), 0.0), 3.0);
          vec3 base = mix(uShallow, uDeep, clamp(depth*1.5, 0.0, 1.0));
          float sparkle = pow(max(0.0, dot(reflect(-uSun, nrm), viewDir)), 60.0);
          float foam = smoothstep(0.13, 0.02, depth) * (0.45 + 0.55*noise(wuv*3.0 + uTime*0.35));
          vec3 col = mix(base, uSky, fres*0.2);
          col += vec3(1.0,0.98,0.9)*sparkle*0.6;
          col = mix(col, vec3(0.95,0.98,1.0), clamp(foam,0.0,0.85));
          gl_FragColor = vec4(col, 0.93);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set((minX + maxX) / 2, WATER_Y, (minZ + maxZ) / 2);
    mesh.renderOrder = 3;
    this.waterMesh = mesh;
    this.scene.add(mesh);
  }

  _makeDepthTexture(size) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, size, size);
    const { minX, maxX, minZ, maxZ } = this.bounds;
    const pad = 12;
    const sx = size / (maxX - minX + pad * 2);
    const sz = size / (maxZ - minZ + pad * 2);
    const toX = (x) => (x - minX + pad) * sx;
    const toZ = (z) => (z - minZ + pad) * sz;
    for (const tile of this.tileList) {
      const bt = BIOMES[tile.terrain];
      if (!bt.water && tile.terrain !== 'coast') continue;
      const depth = bt.water || tile.terrain === 'coast' ? clamp(WATER_Y - tile.h, 0, 1) : 0;
      const val = Math.round(clamp(depth, 0, 1) * 255);
      ctx.fillStyle = `rgba(${val},${val},${val},1)`;
      ctx.beginPath();
      const corners = hexCorners(tile.x, tile.z, HEX_R * 1.02);
      corners.forEach((c, i) => {
        const px = toX(c.x), pz = toZ(c.z);
        i ? ctx.lineTo(px, pz) : ctx.moveTo(px, pz);
      });
      ctx.closePath();
      ctx.fill();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.NoColorSpace;
    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
    return tex;
  }

  /* ============================ SKY ============================ */
  buildSky() {
    const geo = new THREE.SphereGeometry(500, 32, 16);
    const uniforms = {
      uTop: { value: new THREE.Color(0x2f74bd) },
      uMid: { value: new THREE.Color(0x9fcae4) },
      uHorizon: { value: new THREE.Color(0xf6e0b6) },
      uSun: { value: this.sunDir || new THREE.Vector3(0.45, 0.36, 0.82).normalize() },
    };
    const mat = new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false, uniforms,
      vertexShader: 'varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
      fragmentShader: /* glsl */`
        uniform vec3 uTop,uMid,uHorizon,uSun; varying vec3 vDir;
        void main(){
          float h = clamp(vDir.y, -0.2, 1.0);
          vec3 col = mix(uHorizon, uMid, smoothstep(-0.04, 0.4, h));
          col = mix(col, uTop, smoothstep(0.4, 0.95, h));
          float sun = pow(max(dot(normalize(vDir), normalize(uSun)), 0.0), 34.0);
          float halo = pow(max(dot(normalize(vDir), normalize(uSun)), 0.0), 5.0);
          col += vec3(1.0,0.86,0.62)*sun*0.9 + vec3(1.0,0.8,0.55)*halo*0.14;
          gl_FragColor = vec4(col,1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
    });
    this.skyMesh = new THREE.Mesh(geo, mat);
    this.skyMesh.frustumCulled = false;
    this.scene.add(this.skyMesh);

    // sun glow billboard
    const sunTex = makeGlowTexture();
    const sunSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: sunTex, color: 0xfff2cf, transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending }));
    sunSprite.scale.set(60, 60, 1);
    sunSprite.position.copy((this.sunDir || new THREE.Vector3(0.45, 0.36, 0.82).normalize()).clone().multiplyScalar(380));
    this.scene.add(sunSprite);

    // distant cirrus clouds
    const cloudTex = makeCloudTexture();
    this.highClouds = [];
    const rng = new RNG(this.seed + 999);
    for (let i = 0; i < 14; i++) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: cloudTex, transparent: true, opacity: rng.float(0.1, 0.26), depthWrite: false, color: 0xffffff }));
      const ang = rng.float(0, Math.PI * 2), rad = rng.float(60, 230);
      s.position.set(Math.cos(ang) * rad, rng.float(26, 60), Math.sin(ang) * rad);
      const sc = rng.float(40, 110);
      s.scale.set(sc, sc * rng.float(0.3, 0.5), 1);
      s.userData.speed = rng.float(0.2, 0.7);
      this.highClouds.push(s);
      this.scene.add(s);
    }

    // birds
    this.birds = [];
    for (let i = 0; i < 5; i++) {
      const b = makeBird();
      const ang = rng.float(0, Math.PI * 2), rad = rng.float(14, 30);
      b.position.set(Math.cos(ang) * rad, rng.float(9, 14), Math.sin(ang) * rad);
      b.userData = { ang, rad, speed: rng.float(0.12, 0.24), bob: rng.float(0, Math.PI * 2) };
      b.scale.setScalar(rng.float(0.7, 1.1));
      this.birds.push(b);
      this.scene.add(b);
    }
  }

  /* ============================ CITIES + UNITS ============================ */
  registerCiv(civ) {
    this.civs.set(civ.id, civ);
  }

  addCity(city) {
    this.cities.push(city);
    const tile = this.tiles.get(axialKey(city.q, city.r));
    tile.city = city;
    city.tile = tile;
    city.mesh = createCityMesh(city, this);
    city.mesh.position.set(tile.x, tile.h, tile.z);
    city.label = createCityLabel(city);
    city.label.position.set(tile.x, tile.h + 2.35, tile.z);
    this.groups.cities.add(city.mesh);
    this.groups.cities.add(city.label);
    return city;
  }

  addUnit(unit) {
    this.units.push(unit);
    const tile = this.tiles.get(axialKey(unit.q, unit.r));
    unit.tile = tile;
    tile.units.push(unit);
    unit.mesh = createUnitMesh(unit, this);
    unit.mesh.position.set(tile.x, tile.h, tile.z);
    unit.mesh.rotation.y = unit.facing ?? 0;
    unit.bar = createHealthBar();
    unit.mesh.add(unit.bar);
    unit.bar.position.set(0, 0.82, 0);
    updateHealthBar(unit);
    this.groups.units.add(unit.mesh);
    return unit;
  }

  moveUnitTo(unit, q, r, opts = {}) {
    const oldTile = this.tiles.get(axialKey(unit.q, unit.r));
    if (oldTile) oldTile.units = oldTile.units.filter((u) => u !== unit);
    unit.q = q; unit.r = r;
    const tile = this.tiles.get(axialKey(q, r));
    unit.tile = tile;
    tile.units.push(unit);
    const dest = new THREE.Vector3(tile.x, tile.h, tile.z);
    const heading = Math.atan2(dest.x - unit.mesh.position.x, dest.z - unit.mesh.position.z);
    unit.mesh.rotation.y = heading;
    unit.facing = heading;
    if (opts.instant) {
      unit.mesh.position.copy(dest);
      return Promise.resolve();
    }
    return animateWalk(unit, dest, this);
  }

  removeUnit(unit) {
    const tile = this.tiles.get(axialKey(unit.q, unit.r));
    if (tile) tile.units = tile.units.filter((u) => u !== unit);
    this.units = this.units.filter((u) => u !== unit);
    unit.mesh.parent?.remove(unit.mesh);
  }

  /* ============================ VISUALS: FOG / OVERLAYS / TERRITORY ============================ */
  buildFog() {
    this.fogGroup = this.groups.fog;
    this.refreshFog();
  }

  refreshFog() {
    if (!this.fogGroup) return;
    this.fogGroup.clear();
    const rng = new RNG(this.seed + 4242);
    const sphere = new THREE.IcosahedronGeometry(1, 1);
    const pos = [];
    const pushSphere = (cx, cy, cz, r) => {
      const g = sphere.clone();
      g.translate(cx, cy, cz);
      g.scale(r, r * 0.8, r);
      const p = g.attributes.position.array;
      for (let i = 0; i < p.length; i++) pos.push(p[i]);
    };
    const counts = [];
    for (const tile of this.tileList) {
      if (tile.explored) continue;
      const puffs = 3 + (rng.chance(0.4) ? 1 : 0);
      for (let i = 0; i < puffs; i++) {
        const a = rng.float(0, Math.PI * 2);
        const rr = rng.float(0, 0.55);
        pushSphere(
          tile.x + Math.cos(a) * rr,
          tile.h + 0.62 + rng.float(0, 0.34) + (BIOMES[tile.terrain].water ? 0.3 : 0),
          tile.z + Math.sin(a) * rr,
          rng.float(0.36, 0.6)
        );
      }
      counts.push(tile);
    }
    if (!pos.length) return;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.computeVertexNormals();
    const mat = new THREE.MeshStandardMaterial({ color: 0xd6dee5, roughness: 1, metalness: 0, flatShading: true, emissive: 0x46555f, emissiveIntensity: 0.18 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.renderOrder = 4;
    this.fogGroup.add(mesh);
  }

  buildOverlays() {
    // move range overlay (instanced, hidden by default)
    const geo = new THREE.CylinderGeometry(0.94, 0.94, 0.04, 6);
    geo.rotateY(Math.PI / 6);
    this.rangeMesh = new THREE.InstancedMesh(geo, new THREE.MeshBasicMaterial({ color: 0x4fa8ff, transparent: true, opacity: 0.3, depthWrite: false }), 128);
    this.rangeMesh.count = 0;
    this.rangeMesh.renderOrder = 6;
    this.groups.overlay.add(this.rangeMesh);

    this.attackMesh = new THREE.InstancedMesh(geo, new THREE.MeshBasicMaterial({ color: 0xff5b45, transparent: true, opacity: 0.38, depthWrite: false }), 64);
    this.attackMesh.count = 0;
    this.attackMesh.renderOrder = 6;
    this.groups.overlay.add(this.attackMesh);

    const ringGeo = new THREE.RingGeometry(0.86, 1.0, 6, 1);
    ringGeo.rotateX(-Math.PI / 2);
    this.selectionRing = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0xffd98a, transparent: true, opacity: 0.95, depthWrite: false, side: THREE.DoubleSide }));
    this.selectionRing.renderOrder = 7;
    this.selectionRing.visible = false;
    this.groups.overlay.add(this.selectionRing);

    this.hoverRing = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55, depthWrite: false, side: THREE.DoubleSide }));
    this.hoverRing.renderOrder = 7;
    this.hoverRing.visible = false;
    this.groups.overlay.add(this.hoverRing);

    this.dimMesh = new THREE.InstancedMesh(
      new THREE.CylinderGeometry(0.97, 0.97, 0.03, 6).rotateY(Math.PI / 6),
      new THREE.MeshBasicMaterial({ color: 0x16304a, transparent: true, opacity: 0.2, depthWrite: false }),
      this.tileList.length
    );
    this.dimMesh.count = 0;
    this.dimMesh.renderOrder = 5;
    this.groups.overlay.add(this.dimMesh);
  }

  updateDimOverlay() {
    if (!this.dimMesh) return;
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const zero = new THREE.Vector3(0, 0, 0);
    let i = 0;
    for (const tile of this.tileList) {
      if (tile.explored && !tile.visible) {
        m.compose(new THREE.Vector3(tile.x, tile.h + 0.04, tile.z), q, new THREE.Vector3(1, 1, 1));
        this.dimMesh.setMatrixAt(i++, m);
      }
    }
    this.dimMesh.count = i;
    this.dimMesh.instanceMatrix.needsUpdate = true;
  }

  showMoveRange(tiles, attackTiles = []) {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const s = new THREE.Vector3(1, 1, 1);
    tiles.forEach((t, i) => {
      m.compose(new THREE.Vector3(t.x, t.h + 0.06, t.z), q, s);
      this.rangeMesh.setMatrixAt(i, m);
    });
    this.rangeMesh.count = Math.min(tiles.length, this.rangeMesh.instanceMatrix.count);
    this.rangeMesh.instanceMatrix.needsUpdate = true;
    attackTiles.forEach((t, i) => {
      m.compose(new THREE.Vector3(t.x, t.h + 0.07, t.z), q, s);
      this.attackMesh.setMatrixAt(i, m);
    });
    this.attackMesh.count = Math.min(attackTiles.length, this.attackMesh.instanceMatrix.count);
    this.attackMesh.instanceMatrix.needsUpdate = true;
  }

  clearMoveRange() {
    this.rangeMesh.count = 0;
    this.attackMesh.count = 0;
  }

  setSelectionRing(tile) {
    if (!tile) { this.selectionRing.visible = false; return; }
    this.selectionRing.position.set(tile.x, tile.h + 0.08, tile.z);
    this.selectionRing.visible = true;
  }

  setHoverRing(tile) {
    if (!tile) { this.hoverRing.visible = false; return; }
    this.hoverRing.position.set(tile.x, tile.h + 0.09, tile.z);
    this.hoverRing.visible = true;
  }

  rebuildTerritory() {
    const g = this.groups.territory;
    g.clear();
    const byCiv = new Map();
    for (const tile of this.tileList) {
      if (!tile.owner) continue;
      if (!byCiv.has(tile.owner)) byCiv.set(tile.owner, []);
      byCiv.get(tile.owner).push(tile);
    }
    for (const [civId, tiles] of byCiv) {
      const civ = this.civs.get(civId);
      if (!civ) continue;
      const fillPos = [];
      for (const tile of tiles) {
        const corners = hexCorners(tile.x, tile.z, HEX_R * 0.985);
        for (let i = 0; i < 6; i++) {
          const a = corners[i], b = corners[(i + 1) % 6];
          fillPos.push(tile.x, tile.h + 0.015, tile.z, a.x, tile.h + 0.015, a.z, b.x, tile.h + 0.015, b.z);
        }
      }
      const fillGeo = new THREE.BufferGeometry();
      fillGeo.setAttribute('position', new THREE.Float32BufferAttribute(fillPos, 3));
      fillGeo.computeVertexNormals();
      const fill = new THREE.Mesh(fillGeo, new THREE.MeshBasicMaterial({
        color: civ.color, transparent: true, opacity: 0.11, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
      }));
      fill.renderOrder = 4;
      g.add(fill);

      // borders
      const bpos = [];
      const width = 0.055;
      for (const tile of tiles) {
        const corners = hexCorners(tile.x, tile.z, HEX_R * 0.985);
        for (let i = 0; i < 6; i++) {
          const n = this.tiles.get(axialKey(tile.q + HEX_DIRS[i][0], tile.r + HEX_DIRS[i][1]));
          if (n && n.owner === civId) continue;
          const a = corners[i], b = corners[(i + 1) % 6];
          const dx = b.x - a.x, dz = b.z - a.z;
          const len = Math.hypot(dx, dz) || 1;
          const nx = -dz / len * width, nz = dx / len * width;
          const y = tile.h + 0.055;
          bpos.push(
            a.x + nx, y, a.z + nz, a.x - nx, y, a.z - nz, b.x - nx, y, b.z - nz,
            a.x + nx, y, a.z + nz, b.x - nx, y, b.z - nz, b.x + nx, y, b.z + nz
          );
        }
      }
      if (!bpos.length) continue;
      const bgeo = new THREE.BufferGeometry();
      bgeo.setAttribute('position', new THREE.Float32BufferAttribute(bpos, 3));
      bgeo.computeVertexNormals();
      const border = new THREE.Mesh(bgeo, new THREE.MeshBasicMaterial({ color: civ.border || civ.color, transparent: true, opacity: 0.92, depthWrite: false, side: THREE.DoubleSide }));
      border.renderOrder = 5;
      g.add(border);
    }
  }

  /* ============================ UPDATE LOOP ============================ */
  update(dt, camera) {
    this.clocks.time += dt;
    if (this.waterUniforms) this.waterUniforms.uTime.value = this.clocks.time;
    if (this.foamMaterial) this.foamMaterial.opacity = 0.16 + 0.1 * (0.5 + 0.5 * Math.sin(this.clocks.time * 1.6));
    if (this.riverMaterials) {
      for (const m of this.riverMaterials) m.emissiveIntensity = 0.32 + 0.16 * Math.sin(this.clocks.time * 2.2);
    }
    if (this.highClouds) {
      for (const c of this.highClouds) {
        c.position.x += c.userData.speed * dt;
        if (c.position.x > 260) c.position.x = -260;
      }
    }
    if (this.birds) {
      for (const b of this.birds) {
        b.userData.ang += b.userData.speed * dt;
        b.position.x = Math.cos(b.userData.ang) * b.userData.rad;
        b.position.z = Math.sin(b.userData.ang) * b.userData.rad;
        b.position.y += Math.sin(this.clocks.time * 2 + b.userData.bob) * 0.006;
        b.rotation.y = -b.userData.ang + Math.PI / 2;
        b.children.forEach((w, i) => { w.rotation.z = Math.sin(this.clocks.time * 6 + i) * 0.4; });
      }
    }
    if (this.billboardSprites) {
      for (const s of this.billboardSprites) {
        s.position.y = s.userData.baseY + Math.sin(this.clocks.time * 1.8 + s.userData.phase) * 0.06;
      }
    }
    for (const city of this.cities) {
      if (city.mesh?.userData.animate) city.mesh.userData.animate(dt, this.clocks.time);
    }
    for (const unit of this.units) {
      if (unit.mesh?.userData.animate) unit.mesh.userData.animate(dt, this.clocks.time, unit);
    }
  }

  /* ============================ PICKING ============================ */
  tileAtPoint(point) {
    const { q, r } = worldToAxial(point.x, point.z);
    return this.tiles.get(axialKey(q, r)) || null;
  }
}

/* ====================================================================== */
/* Geometry factories                                                      */
/* ====================================================================== */

function mergeParts(parts) {
  const pos = [], col = [], nrm = [];
  for (const part of parts) {
    const geo = part.geo;
    const g = geo.index ? geo.toNonIndexed() : geo;
    const p = g.attributes.position.array;
    const n = g.attributes.normal ? g.attributes.normal.array : null;
    const c = new THREE.Color(part.color);
    for (let i = 0; i < p.length; i += 3) {
      pos.push(p[i] + (part.x || 0), p[i + 1] + (part.y || 0), p[i + 2] + (part.z || 0));
      col.push(c.r, c.g, c.b);
      if (n) { nrm.push(n[i], n[i + 1], n[i + 2]); }
    }
    if (!n) for (let i = 0; i < p.length; i += 3) nrm.push(0, 1, 0);
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  out.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  out.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3));
  return out;
}

function makeConiferGeometry() {
  const parts = [];
  parts.push({ geo: new THREE.CylinderGeometry(0.028, 0.04, 0.22, 5), color: 0x5a4128, y: 0.11 });
  parts.push({ geo: new THREE.ConeGeometry(0.17, 0.34, 7), color: 0x356b3c, y: 0.3 });
  parts.push({ geo: new THREE.ConeGeometry(0.13, 0.3, 7), color: 0x3d7a44, y: 0.46 });
  parts.push({ geo: new THREE.ConeGeometry(0.09, 0.26, 7), color: 0x47884c, y: 0.62 });
  return mergeParts(parts);
}
function makeBroadleafGeometry() {
  const parts = [];
  parts.push({ geo: new THREE.CylinderGeometry(0.03, 0.045, 0.26, 5), color: 0x5a4128, y: 0.13 });
  parts.push({ geo: new THREE.IcosahedronGeometry(0.19, 0), color: 0x3f7a3a, y: 0.44 });
  parts.push({ geo: new THREE.IcosahedronGeometry(0.14, 0), color: 0x4b8a42, x: 0.13, y: 0.4 });
  parts.push({ geo: new THREE.IcosahedronGeometry(0.13, 0), color: 0x356e34, x: -0.12, y: 0.42 });
  return mergeParts(parts);
}
function makePalmGeometry() {
  const parts = [];
  const trunk = new THREE.CylinderGeometry(0.028, 0.045, 0.5, 5);
  parts.push({ geo: trunk, color: 0x7a5a35, y: 0.25, x: 0.04 });
  for (let i = 0; i < 5; i++) {
    const frond = new THREE.ConeGeometry(0.055, 0.34, 4);
    const a = (i / 5) * Math.PI * 2;
    parts.push({ geo: frond, color: 0x2f7a44, x: 0.04 + Math.cos(a) * 0.12, y: 0.5, z: Math.sin(a) * 0.12 });
  }
  return mergeParts(parts);
}

function makeResourceProp(shape, color, rng) {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: new THREE.Color(color), roughness: 0.8, flatShading: true });
  if (shape === 'grain') {
    for (let i = 0; i < 3; i++) {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.22, 4), mat);
      m.position.set(rng.float(-0.14, 0.14), 0.11, rng.float(-0.14, 0.14));
      group.add(m);
    }
  } else if (shape === 'cattle' || shape === 'deer' || shape === 'horse') {
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.14, 0.13), mat);
    body.position.y = 0.2; group.add(body);
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.09, 0.09), mat);
    head.position.set(0.16, 0.27, 0); group.add(head);
    for (const [x, z] of [[-0.08, 0.06], [-0.08, -0.06], [0.08, 0.06], [0.08, -0.06]]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.02, 0.16, 4), mat);
      leg.position.set(x, 0.08, z); group.add(leg);
    }
  } else if (shape === 'ingot' || shape === 'stone') {
    for (let i = 0; i < 3; i++) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.08, 0.1), mat);
      m.position.set(rng.float(-0.1, 0.1), 0.04 + i * 0.07, rng.float(-0.1, 0.1));
      m.rotation.y = rng.float(0, Math.PI);
      group.add(m);
    }
  } else if (shape === 'coin') {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.04, 10), new THREE.MeshStandardMaterial({ color: 0xf0cd71, metalness: 0.8, roughness: 0.3 }));
    m.position.y = 0.05; group.add(m);
  } else if (shape === 'spice') {
    for (let i = 0; i < 4; i++) {
      const m = new THREE.Mesh(new THREE.SphereGeometry(0.035, 5, 4), mat);
      m.position.set(rng.float(-0.12, 0.12), 0.05, rng.float(-0.12, 0.12)); group.add(m);
    }
  } else if (shape === 'grapes' || shape === 'silk') {
    for (let i = 0; i < 5; i++) {
      const m = new THREE.Mesh(new THREE.SphereGeometry(0.05, 5, 4), mat);
      m.position.set(rng.float(-0.1, 0.1), 0.05 + (i > 2 ? 0.08 : 0), rng.float(-0.1, 0.1)); group.add(m);
    }
  } else {
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.12, 0.14), mat);
    m.position.y = 0.06; group.add(m);
  }
  return group;
}

function makeResourceBadge(res, tile) {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const cx = size / 2, cy = size / 2;
  // medallion
  const grad = ctx.createLinearGradient(0, 0, 0, size);
  grad.addColorStop(0, 'rgba(20,28,38,0.92)');
  grad.addColorStop(1, 'rgba(8,13,20,0.94)');
  ctx.beginPath(); ctx.arc(cx, cy, 44, 0, Math.PI * 2);
  ctx.fillStyle = grad; ctx.fill();
  ctx.lineWidth = 4; ctx.strokeStyle = res.color; ctx.stroke();
  ctx.beginPath(); ctx.arc(cx, cy, 36, 0, Math.PI * 2);
  ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.stroke();
  drawResourceSymbol(ctx, res.shape, res.color, cx, cy);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, depthTest: true }));
  sprite.scale.set(0.5, 0.5, 1);
  return sprite;
}

function drawResourceSymbol(ctx, shape, color, cx, cy) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.strokeStyle = color; ctx.fillStyle = color;
  ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const poly = (pts, fill = true) => {
    ctx.beginPath();
    pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]));
    ctx.closePath(); fill ? ctx.fill() : ctx.stroke();
  };
  switch (shape) {
    case 'grain':
      ctx.beginPath(); ctx.moveTo(0, 22); ctx.lineTo(0, -20); ctx.stroke();
      for (let s = -1; s <= 1; s += 2) {
        for (let i = 0; i < 4; i++) {
          const y = -14 + i * 10;
          ctx.beginPath(); ctx.ellipse(s * 8, y, 5, 9, s * 0.6, 0, Math.PI * 2); ctx.fill();
        }
      }
      break;
    case 'cattle': case 'deer': case 'horse':
      ctx.beginPath(); ctx.ellipse(0, 4, 16, 9, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(13, 0); ctx.lineTo(22, -8); ctx.lineTo(20, 2); ctx.closePath(); ctx.fill();
      [-10, -3, 4, 11].forEach((x) => { ctx.beginPath(); ctx.moveTo(x, 10); ctx.lineTo(x, 22); ctx.lineWidth = 4; ctx.stroke(); });
      ctx.lineWidth = 5;
      break;
    case 'fish':
      ctx.beginPath(); ctx.ellipse(-3, 0, 16, 9, 0, 0, Math.PI * 2); ctx.fill();
      poly([[12, 0], [22, -10], [22, 10]], true);
      ctx.fillStyle = '#0a1720'; ctx.beginPath(); ctx.arc(-9, -3, 2.4, 0, Math.PI * 2); ctx.fill();
      break;
    case 'ingot':
      poly([[-18, 10], [-12, -4], [12, -4], [18, 10]], true);
      ctx.fillStyle = 'rgba(0,0,0,0.25)'; poly([[-12, -4], [12, -4], [8, 0], [-8, 0]], true);
      break;
    case 'stone':
      poly([[-18, 8], [-10, -10], [6, -14], [18, -2], [12, 12], [-6, 14]], true);
      ctx.fillStyle = 'rgba(255,255,255,0.22)'; poly([[-10, -10], [6, -14], [2, -2], [-6, 0]], true);
      break;
    case 'coin':
      ctx.beginPath(); ctx.arc(0, 0, 18, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.font = 'bold 20px Georgia'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('$', 0, 1);
      break;
    case 'spice':
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        ctx.beginPath(); ctx.ellipse(Math.cos(a) * 9, Math.sin(a) * 9, 6, 4, a, 0, Math.PI * 2); ctx.fill();
      }
      break;
    case 'silk':
      for (let i = 0; i < 3; i++) {
        ctx.beginPath(); ctx.arc(-6 + i * 6, -2 + i * 3, 9, 0, Math.PI * 2); ctx.fill();
      }
      break;
    case 'grapes':
      for (const [x, y] of [[-7, -8], [7, -8], [0, 0], [-7, 8], [7, 8], [0, 16]]) {
        ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI * 2); ctx.fill();
      }
      break;
    default:
      ctx.beginPath(); ctx.arc(0, 0, 16, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function makeGlowTexture() {
  const size = 256;
  const c = document.createElement('canvas'); c.width = c.height = size;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(255,246,220,1)');
  g.addColorStop(0.18, 'rgba(255,228,170,0.75)');
  g.addColorStop(0.45, 'rgba(255,200,120,0.18)');
  g.addColorStop(1, 'rgba(255,200,120,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; return tex;
}
function makeCloudTexture() {
  const size = 256;
  const c = document.createElement('canvas'); c.width = c.height = size;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, size, size);
  const rng = new RNG(7);
  for (let i = 0; i < 26; i++) {
    const x = 40 + rng.float(0, size - 80), y = 80 + rng.float(0, size - 160), r = rng.float(18, 52);
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, 'rgba(255,255,255,0.5)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; return tex;
}
function makeBird() {
  const g = new THREE.Group();
  const mat = new THREE.MeshBasicMaterial({ color: 0x2a2f36 });
  for (const s of [-1, 1]) {
    const wing = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.02, 0.12), mat);
    wing.position.set(s * 0.26, 0, 0);
    g.add(wing);
  }
  return g;
}

/* ------------------------ Units ------------------------ */
const unitGeoTemplates = {};
export function createUnitMesh(unit, world) {
  const civ = world.civs.get(unit.civId);
  const color = new THREE.Color(civ?.color ?? 0xe0b060);
  const accent = new THREE.Color(civ?.accent ?? 0x2b3a4a);
  const type = unit.type;
  const group = new THREE.Group();
  const parts = {};
  const M = {
    cloth: new THREE.MeshStandardMaterial({ color, roughness: 0.7, metalness: 0.08, flatShading: true }),
    accent: new THREE.MeshStandardMaterial({ color: accent, roughness: 0.75, flatShading: true }),
    skin: new THREE.MeshStandardMaterial({ color: 0xd9a074, roughness: 0.8, flatShading: true }),
    metal: new THREE.MeshStandardMaterial({ color: 0xb9c2c9, roughness: 0.35, metalness: 0.75, flatShading: true }),
    dark: new THREE.MeshStandardMaterial({ color: 0x3a3f45, roughness: 0.7, flatShading: true }),
    wood: new THREE.MeshStandardMaterial({ color: 0x6b4a2c, roughness: 0.9, flatShading: true }),
    gold: new THREE.MeshStandardMaterial({ color: 0xe3bd74, roughness: 0.3, metalness: 0.7, flatShading: true }),
    canvas: new THREE.MeshStandardMaterial({ color: 0xe8ddc4, roughness: 0.9, flatShading: true }),
    horse: new THREE.MeshStandardMaterial({ color: 0x6b4a32, roughness: 0.85, flatShading: true }),
  };

  const add = (geo, mat, x, y, z, parent = group) => {
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    mesh.castShadow = true; mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  };

  const base = add(new THREE.CylinderGeometry(0.27, 0.29, 0.05, 12), M.cloth, 0, 0.025, 0);
  add(new THREE.TorusGeometry(0.275, 0.014, 6, 18).rotateX(Math.PI / 2), M.gold, 0, 0.05, 0);

  if (type === 'settler') {
    // covered wagon
    add(new THREE.BoxGeometry(0.5, 0.11, 0.3), M.wood, 0, 0.3, 0);
    const canopy = add(new THREE.CylinderGeometry(0.16, 0.16, 0.5, 8, 1, false, 0, Math.PI).rotateZ(Math.PI / 2), M.canvas, 0, 0.38, 0);
    canopy.rotation.y = 0;
    for (const [x, z] of [[-0.2, 0.15], [-0.2, -0.15], [0.2, 0.15], [0.2, -0.15]]) {
      const w = add(new THREE.CylinderGeometry(0.07, 0.07, 0.04, 10).rotateX(Math.PI / 2), M.wood, x, 0.14, z);
      w.rotation.z = Math.PI / 2;
      parts[`wheel${x}${z}`] = w;
    }
    const driver = add(new THREE.CapsuleGeometry(0.05, 0.12, 3, 6), M.cloth, 0, 0.42, 0.22);
    add(new THREE.SphereGeometry(0.05, 8, 6), M.skin, 0, 0.53, 0.22);
    add(new THREE.ConeGeometry(0.06, 0.08, 8), M.accent, 0, 0.6, 0.22);
  } else if (type === 'horseman' || type === 'knight') {
    const horse = new THREE.Group();
    horse.position.y = 0.12;
    group.add(horse);
    add(new THREE.CapsuleGeometry(0.11, 0.26, 3, 8).rotateZ(Math.PI / 2), M.horse, 0, 0.34, 0, horse);
    add(new THREE.BoxGeometry(0.14, 0.14, 0.16), M.horse, 0.22, 0.44, 0, horse);
    add(new THREE.ConeGeometry(0.05, 0.14, 5), M.horse, 0.28, 0.52, 0, horse);
    for (const [x, z] of [[0.18, 0.09], [0.18, -0.09], [-0.18, 0.09], [-0.18, -0.09]]) {
      add(new THREE.CylinderGeometry(0.028, 0.024, 0.3, 6), M.dark, x, 0.15, z, horse);
    }
    add(new THREE.ConeGeometry(0.05, 0.16, 6), M.dark, -0.26, 0.42, 0, horse).rotation.z = -1.0;
    const rider = new THREE.Group();
    rider.position.set(0, 0.5, 0);
    horse.add(rider);
    add(new THREE.CapsuleGeometry(0.08, 0.16, 3, 8), type === 'knight' ? M.metal : M.cloth, 0, 0.16, 0, rider);
    add(new THREE.SphereGeometry(0.075, 8, 6), M.skin, 0, 0.32, 0, rider);
    add(new THREE.ConeGeometry(0.085, 0.13, 8), M.metal, 0, 0.4, 0, rider);
    const weapon = add(new THREE.CylinderGeometry(0.014, 0.014, 0.7, 5), M.wood, 0.16, 0.34, 0, rider);
    weapon.rotation.z = 1.15;
    add(new THREE.ConeGeometry(0.03, 0.1, 5), M.metal, 0.31, 0.62, 0, rider);
    parts.rider = rider;
    if (type === 'knight') {
      add(new THREE.BoxGeometry(0.02, 0.28, 0.22), M.cloth, 0.16, 0.34, 0, rider).rotation.z = 1.15;
    }
    parts.horse = horse;
  } else {
    const rig = new THREE.Group();
    group.add(rig);
    parts.rig = rig;
    const hip = new THREE.Group(); hip.position.y = 0.24; rig.add(hip); parts.hip = hip;
    const torso = add(new THREE.CapsuleGeometry(0.095, 0.2, 4, 8), M.cloth, 0, 0.13, 0, hip);
    parts.torso = torso;
    add(new THREE.BoxGeometry(0.24, 0.1, 0.16), M.accent, 0, 0.02, 0, hip);
    const head = add(new THREE.SphereGeometry(0.078, 10, 8), M.skin, 0, 0.31, 0, hip);
    parts.head = head;
    const helmet = add(new THREE.ConeGeometry(0.088, 0.12, 8), M.metal, 0, 0.4, 0, hip);
    parts.helmet = helmet;
    const armL = new THREE.Group(); armL.position.set(-0.11, 0.24, 0); hip.add(armL); parts.armL = armL;
    add(new THREE.CapsuleGeometry(0.033, 0.14, 3, 6), M.cloth, 0, -0.09, 0, armL);
    const armR = new THREE.Group(); armR.position.set(0.11, 0.24, 0); hip.add(armR); parts.armR = armR;
    add(new THREE.CapsuleGeometry(0.033, 0.14, 3, 6), M.cloth, 0, -0.09, 0, armR);
    const legL = new THREE.Group(); legL.position.set(-0.05, 0.24, 0); rig.add(legL); parts.legL = legL;
    add(new THREE.CapsuleGeometry(0.038, 0.14, 3, 6), M.accent, 0, -0.09, 0, legL);
    const legR = new THREE.Group(); legR.position.set(0.05, 0.24, 0); rig.add(legR); parts.legR = legR;
    add(new THREE.CapsuleGeometry(0.038, 0.14, 3, 6), M.accent, 0, -0.09, 0, legR);

    if (type === 'warrior' || type === 'swordsman') {
      add(new THREE.CylinderGeometry(0.012, 0.012, 0.42, 5), M.metal, 0, -0.2, 0, armR).rotation.z = 0.15;
      add(new THREE.BoxGeometry(0.03, 0.1, 0.02), M.gold, 0, -0.4, 0, armR);
      add(new THREE.CylinderGeometry(0.14, 0.14, 0.03, 14), type === 'swordsman' ? M.metal : M.wood, 0, -0.14, 0.02, armL).rotation.x = Math.PI / 2;
      add(new THREE.CylinderGeometry(0.03, 0.03, 0.05, 8), M.gold, 0, -0.14, 0.04, armL).rotation.x = Math.PI / 2;
    } else if (type === 'archer' || type === 'scout') {
      const bow = add(new THREE.TorusGeometry(0.16, 0.01, 5, 12, Math.PI * 1.2), M.wood, 0, -0.16, 0.06, armL);
      bow.rotation.z = Math.PI / 2;
      add(new THREE.CylinderGeometry(0.006, 0.006, 0.32, 4), M.canvas, 0.14, 0.2, -0.06, hip).rotation.z = -0.4;
    } else if (type === 'spearman' || type === 'builder') {
      const tool = add(new THREE.CylinderGeometry(0.012, 0.014, type === 'spearman' ? 0.62 : 0.4, 5), M.wood, 0, -0.12, 0, armR);
      if (type === 'spearman') add(new THREE.ConeGeometry(0.026, 0.12, 6), M.metal, 0, 0.24, 0, armR);
      else add(new THREE.BoxGeometry(0.1, 0.08, 0.06), M.metal, 0, -0.3, 0, armR);
      add(new THREE.CylinderGeometry(0.11, 0.11, 0.03, 12), M.accent, 0, -0.14, 0.02, armL).rotation.x = Math.PI / 2;
    } else if (type === 'catapult') {
      // replace humanoid with siege engine for clarity
      rig.clear();
      add(new THREE.BoxGeometry(0.5, 0.12, 0.32), M.wood, 0, 0.24, 0, rig);
      for (const [x, z] of [[-0.2, 0.16], [-0.2, -0.16], [0.2, 0.16], [0.2, -0.16]]) {
        add(new THREE.CylinderGeometry(0.08, 0.08, 0.04, 10).rotateX(Math.PI / 2), M.wood, x, 0.12, z, rig);
      }
      const arm = add(new THREE.BoxGeometry(0.5, 0.05, 0.06), M.wood, -0.1, 0.42, 0, rig);
      arm.rotation.z = 0.7;
      add(new THREE.IcosahedronGeometry(0.09, 0), M.metal, -0.32, 0.6, 0, rig);
      parts.siegeArm = arm;
    }
  }

  // banner pole
  const pole = add(new THREE.CylinderGeometry(0.012, 0.012, 0.9, 5), M.wood, 0.2, 0.45, -0.16);
  const flagGeo = new THREE.PlaneGeometry(0.28, 0.18, 6, 1);
  const flag = new THREE.Mesh(flagGeo, new THREE.MeshStandardMaterial({ color, roughness: 0.8, side: THREE.DoubleSide, flatShading: false }));
  flag.position.set(0.35, 0.78, -0.16);
  flag.castShadow = true;
  group.add(flag);
  parts.flag = flag;

  const animate = (dt, time, u) => {
    if (u?.moving) return;
    const bob = Math.sin(time * 1.4 + (unit.phase ?? 0)) * 0.012;
    if (parts.hip) parts.hip.position.y = 0.24 + bob;
    if (parts.rig) parts.rig.position.y = bob * 0.5;
    if (parts.flag?.geometry) {
      const p = parts.flag.geometry.attributes.position;
      for (let i = 0; i < p.count; i++) {
        const x = p.getX(i);
        p.setZ(i, Math.sin(time * 3 + x * 10 + (unit.phase ?? 0)) * 0.03 * (x + 0.14));
      }
      p.needsUpdate = true;
    }
    if (parts.armL) parts.armL.rotation.x = Math.sin(time * 1.3 + (unit.phase ?? 0)) * 0.06;
    if (parts.horse) parts.horse.position.y = 0.12 + Math.sin(time * 1.6) * 0.008;
  };
  group.userData.animate = animate;
  group.userData.parts = parts;
  return group;
}

function animateWalk(unit, dest, world) {
  return new Promise((resolve) => {
    const start = unit.mesh.position.clone();
    const dist = start.distanceTo(dest);
    const dur = clamp(dist * 0.28, 0.32, 1.4);
    unit.moving = true;
    const t0 = performance.now();
    const parts = unit.mesh.userData.parts || {};
    let last = t0;
    const step = () => {
      const now = performance.now();
      const t = clamp((now - t0) / (dur * 1000), 0, 1);
      const e = t * t * (3 - 2 * t);
      unit.mesh.position.lerpVectors(start, dest, e);
      unit.mesh.position.y += Math.abs(Math.sin(t * Math.PI * 2.2)) * 0.09;
      const dt = (now - last) / 1000; last = now;
      if (parts.legL) parts.legL.rotation.x = Math.sin(now * 0.012) * 0.5;
      if (parts.legR) parts.legR.rotation.x = -Math.sin(now * 0.012) * 0.5;
      if (parts.armL) parts.armL.rotation.x = -Math.sin(now * 0.012) * 0.4;
      if (parts.armR) parts.armR.rotation.x = Math.sin(now * 0.012) * 0.4;
      if (t < 1) requestAnimationFrame(step);
      else {
        unit.mesh.position.copy(dest);
        if (parts.legL) parts.legL.rotation.x = 0;
        if (parts.legR) parts.legR.rotation.x = 0;
        unit.moving = false;
        resolve();
      }
    };
    requestAnimationFrame(step);
  });
}

/* ------------------------ Health bars ------------------------ */
function createHealthBar() {
  const canvas = document.createElement('canvas');
  canvas.width = 96; canvas.height = 16;
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, depthTest: false }));
  sprite.scale.set(0.62, 0.1, 1);
  sprite.userData.canvas = canvas;
  sprite.userData.tex = tex;
  return sprite;
}
export function updateHealthBar(unit) {
  if (!unit.bar) return;
  const { canvas, tex } = unit.bar.userData;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'rgba(4,8,12,0.85)';
  ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 2;
  roundRect(ctx, 2, 3, canvas.width - 4, canvas.height - 6, 5); ctx.fill(); ctx.stroke();
  const frac = clamp(unit.hp / unit.maxHp, 0, 1);
  const g = ctx.createLinearGradient(0, 0, canvas.width, 0);
  if (frac > 0.5) { g.addColorStop(0, '#7ad17f'); g.addColorStop(1, '#3fae5a'); }
  else if (frac > 0.25) { g.addColorStop(0, '#e6c25a'); g.addColorStop(1, '#c98a34'); }
  else { g.addColorStop(0, '#e8886d'); g.addColorStop(1, '#c9483a'); }
  ctx.fillStyle = g;
  roundRect(ctx, 5, 6, (canvas.width - 10) * frac, canvas.height - 12, 3); ctx.fill();
  tex.needsUpdate = true;
}
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/* ------------------------ Cities ------------------------ */
const cityMaterials = null;
export function createCityMesh(city, world) {
  const civ = world.civs.get(city.civId);
  const color = new THREE.Color(civ?.color ?? 0xe0b060);
  const accent = new THREE.Color(civ?.accent ?? 0x2b3a4a);
  const group = new THREE.Group();
  const M = {
    stone: new THREE.MeshStandardMaterial({ color: 0xcfc4ab, roughness: 0.85, flatShading: true }),
    stoneDark: new THREE.MeshStandardMaterial({ color: 0xa89a7e, roughness: 0.9, flatShading: true }),
    roof: new THREE.MeshStandardMaterial({ color: 0x8a4a33, roughness: 0.8, flatShading: true }),
    cloth: new THREE.MeshStandardMaterial({ color, roughness: 0.7, flatShading: true }),
    accent: new THREE.MeshStandardMaterial({ color: accent, roughness: 0.8, flatShading: true }),
    gold: new THREE.MeshStandardMaterial({ color: 0xe3bd74, roughness: 0.3, metalness: 0.7, flatShading: true }),
    wood: new THREE.MeshStandardMaterial({ color: 0x6b4a2c, roughness: 0.9, flatShading: true }),
    window: new THREE.MeshStandardMaterial({ color: 0xffca7a, emissive: 0xffab4d, emissiveIntensity: 1.2, roughness: 0.5 }),
  };
  const add = (geo, mat, x, y, z, parent = group) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.castShadow = true; m.receiveShadow = true;
    parent.add(m);
    return m;
  };
  const rng = new RNG(world.seed + city.q * 31 + city.r * 17);

  // base platform
  add(new THREE.CylinderGeometry(0.95, 1.0, 0.14, 6).rotateY(Math.PI / 6), M.stoneDark, 0, 0.07, 0);
  add(new THREE.CylinderGeometry(0.9, 0.92, 0.06, 6).rotateY(Math.PI / 6), M.stone, 0, 0.15, 0);
  // outer wall ring with crenellations
  const wallR = 0.74, towers = 6;
  for (let i = 0; i < towers; i++) {
    if (i === 0) continue; // gate opening
    const a = (i / towers) * Math.PI * 2;
    const wx = Math.cos(a) * wallR, wz = Math.sin(a) * wallR;
    const seg = add(new THREE.BoxGeometry(0.42, 0.22, 0.11), M.stone, wx, 0.28, wz);
    seg.rotation.y = -a + Math.PI / 2;
    const tower = add(new THREE.CylinderGeometry(0.1, 0.12, 0.42, 8), M.stone, wx, 0.36, wz);
    add(new THREE.ConeGeometry(0.14, 0.18, 8), M.roof, wx, 0.66, wz);
    add(new THREE.CylinderGeometry(0.008, 0.008, 0.3, 4), M.wood, wx, 0.86, wz);
    add(new THREE.BoxGeometry(0.12, 0.08, 0.005), M.cloth, wx + 0.06, 0.94, wz);
  }
  // gate towers flanking entrance
  for (const s of [-1, 1]) {
    const a = s * 0.42;
    const gx = Math.cos(a) * wallR, gz = Math.sin(a) * wallR;
    add(new THREE.CylinderGeometry(0.13, 0.15, 0.62, 8), M.stone, gx, 0.45, gz);
    add(new THREE.ConeGeometry(0.18, 0.22, 8), M.roof, gx, 0.86, gz);
    add(new THREE.CylinderGeometry(0.01, 0.01, 0.36, 4), M.wood, gx, 1.08, gz);
    add(new THREE.BoxGeometry(0.16, 0.1, 0.006), M.cloth, gx + 0.08, 1.18, gz);
  }
  // central keep
  const keep = add(new THREE.BoxGeometry(0.42, 0.5, 0.42), M.stone, 0, 0.4, 0);
  add(new THREE.BoxGeometry(0.46, 0.06, 0.46), M.stoneDark, 0, 0.66, 0);
  add(new THREE.ConeGeometry(0.34, 0.34, 4).rotateY(Math.PI / 4), M.roof, 0, 0.86, 0);
  add(new THREE.CylinderGeometry(0.01, 0.01, 0.5, 4), M.wood, 0, 1.14, 0);
  add(new THREE.BoxGeometry(0.22, 0.14, 0.008), M.cloth, 0.11, 1.3, 0);
  // keep windows
  for (const [x, z] of [[-0.11, 0.212], [0.11, 0.212], [0, -0.212]]) {
    add(new THREE.BoxGeometry(0.06, 0.09, 0.01), M.window, x, 0.34, z);
  }
  // houses (tier-based)
  const houseGroup = new THREE.Group();
  group.add(houseGroup);
  const houseCount = clamp(2 + city.population, 3, 9);
  for (let i = 0; i < houseCount; i++) {
    const a = rng.float(0, Math.PI * 2);
    const rr = rng.float(0.36, 0.62);
    const hx = Math.cos(a) * rr, hz = Math.sin(a) * rr;
    const w = rng.float(0.13, 0.2), h = rng.float(0.13, 0.2);
    add(new THREE.BoxGeometry(w, h, w * rng.float(0.8, 1.2)), M.stone, hx, 0.15 + h / 2, hz, houseGroup);
    add(new THREE.ConeGeometry(w * 0.78, h * 0.7, 4).rotateY(Math.PI / 4), M.roof, hx, 0.15 + h + h * 0.3, hz, houseGroup);
    if (rng.chance(0.5)) add(new THREE.BoxGeometry(0.02, 0.03, 0.01), M.window, hx, 0.15 + h * 0.5, hz + w * 0.5, houseGroup);
  }
  // market awning
  add(new THREE.BoxGeometry(0.3, 0.02, 0.18), M.cloth, 0.34, 0.62, 0.3).rotation.z = 0.08;
  // monument / obelisk
  add(new THREE.BoxGeometry(0.05, 0.5, 0.05), M.gold, -0.34, 0.42, -0.3);
  add(new THREE.ConeGeometry(0.05, 0.12, 4), M.gold, -0.34, 0.72, -0.3);

  // wonder slot
  const wonderGroup = new THREE.Group();
  wonderGroup.visible = false;
  group.add(wonderGroup);
  group.userData.wonderGroup = wonderGroup;
  group.userData.setWonder = (kind) => {
    wonderGroup.clear();
    wonderGroup.visible = !!kind;
    if (!kind) return;
    if (kind === 'pyramids') {
      for (const [x, z, s] of [[-0.3, 0.25, 0.34], [0.08, -0.28, 0.28]]) {
        add(new THREE.ConeGeometry(s, s * 1.3, 4).rotateY(Math.PI / 4), M.gold, x, 0.16 + s * 0.65, z, wonderGroup);
      }
    } else if (kind === 'colosseum') {
      add(new THREE.CylinderGeometry(0.26, 0.3, 0.18, 16, 1, true), M.stone, 0, 0.24, 0.34, wonderGroup);
      add(new THREE.CylinderGeometry(0.22, 0.22, 0.02, 16), M.stoneDark, 0, 0.33, 0.34, wonderGroup);
    } else if (kind === 'greatLibrary') {
      add(new THREE.BoxGeometry(0.34, 0.3, 0.22), M.stone, 0, 0.3, 0.34, wonderGroup);
      add(new THREE.ConeGeometry(0.24, 0.18, 6), M.roof, 0, 0.5, 0.34, wonderGroup);
    } else if (kind === 'stonehenge') {
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        add(new THREE.BoxGeometry(0.05, 0.22, 0.05), M.stone, Math.cos(a) * 0.22, 0.26, 0.34 + Math.sin(a) * 0.22, wonderGroup);
      }
      add(new THREE.BoxGeometry(0.5, 0.04, 0.05), M.stone, 0, 0.4, 0.34, wonderGroup);
    }
  };

  // smoke particles from keep
  const smokeTex = makeSmokeTexture();
  const smoke = [];
  for (let i = 0; i < 4; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: smokeTex, transparent: true, opacity: 0.0, depthWrite: false, color: 0xd8dde2 }));
    s.userData = { t: rng.float(0, 1), speed: rng.float(0.09, 0.16), x: 0.02 * rng.float(-1, 1), z: 0.02 * rng.float(-1, 1) };
    s.scale.setScalar(0.3);
    group.add(s);
    smoke.push(s);
  }

  group.userData.animate = (dt, time) => {
    for (const s of smoke) {
      s.userData.t += dt * s.userData.speed;
      if (s.userData.t > 1) s.userData.t -= 1;
      const t = s.userData.t;
      s.position.set(s.userData.x * t, 0.95 + t * 0.9, s.userData.z * t);
      s.scale.setScalar(0.22 + t * 0.5);
      s.material.opacity = Math.sin(t * Math.PI) * 0.22;
    }
  };
  return group;
}

function makeSmokeTexture() {
  const size = 128;
  const c = document.createElement('canvas'); c.width = c.height = size;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(255,255,255,0.9)');
  g.addColorStop(0.5, 'rgba(255,255,255,0.35)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; return tex;
}

export function createCityLabel(city) {
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const civ = city.civ;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // banner plate
    const gw = 300, gh = 54, gx = (canvas.width - gw) / 2, gy = 14;
    ctx.fillStyle = 'rgba(8,13,20,0.78)';
    roundRect(ctx, gx, gy, gw, gh, 10); ctx.fill();
    ctx.strokeStyle = civ?.colorHex ?? '#e3bd74'; ctx.lineWidth = 3; ctx.stroke();
    ctx.font = '600 34px Cinzel, Georgia, serif';
    ctx.fillStyle = '#f6ead1';
    ctx.shadowColor = 'rgba(0,0,0,0.8)'; ctx.shadowBlur = 8;
    ctx.fillText(city.name.toUpperCase(), canvas.width / 2, gy + gh / 2 + 2);
    ctx.shadowBlur = 0;
    // population banner
    ctx.fillStyle = civ?.colorHex ?? '#e3bd74';
    ctx.beginPath(); ctx.arc(gx + 22, gy + gh / 2, 17, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#0a1219';
    ctx.font = '700 22px Cinzel, Georgia, serif';
    ctx.fillText(String(city.population), gx + 22, gy + gh / 2 + 1);
    // production pips under
    ctx.font = '500 18px Cormorant Garamond, Georgia, serif';
    ctx.fillStyle = 'rgba(230,220,200,0.85)';
    if (city.producing) ctx.fillText(`⚒ ${city.producing.name}`, canvas.width / 2, gy + gh + 26);
  };
  draw();
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, depthTest: false }));
  sprite.scale.set(2.6, 0.65, 1);
  sprite.userData.redraw = () => { draw(); tex.needsUpdate = true; };
  return sprite;
}

export { WATER_Y, makeGlowTexture };
