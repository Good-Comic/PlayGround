import {
  BUILD_DEFS, UNIT_DEFS, ENEMY_DEFS, DIFFICULTIES, BOONS, TOTAL_WAVES,
  TITLE_BEST_KEY, MAP_SIZE
} from './constants.js';
import { World } from './world.js';
import { AudioEngine } from './audio.js';
import { Renderer } from './renderer.js';
import { UI } from './ui.js';
import { clamp, dist, shuffle, uid, mulberry32 } from './utils.js';

const RESOURCE_KEYS = ['food', 'wood', 'gold', 'stone'];
const GATHER_NODE = { food: 'berry', wood: 'tree', gold: 'gold', stone: 'stone' };
const GATHER_MOD = { food: 'foodGather', wood: 'woodGather', gold: 'mineGather', stone: 'mineGather' };
const CARRY_CAP = 10;

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.audio = new AudioEngine();
    this.renderer = new Renderer(canvas, this);
    this.state = 'title';
    this.titleTime = 0;
    this.time = 0;
    this.difficulty = 'knight';
    this.bestWave = this.readBest();
    this.world = new World(1337);
    this.mods = this.defaultMods();
    this.resources = { food: 0, wood: 0, gold: 0, stone: 0 };
    this.units = [];
    this.buildings = [];
    this.projectiles = [];
    this.particles = [];
    this.floatTexts = [];
    this.spawnQueue = [];
    this.queue = [];
    this.selected = [];
    this.taken = {};
    this.wave = 1;
    this.waveActive = false;
    this.prepTime = 45;
    this.placing = null;
    this.pointer = null;
    this.dragRect = null;
    this.lastMouse = { x: 0, y: 0 };
    this.stats = { kills: 0, gathered: { food: 0, wood: 0, gold: 0, stone: 0 }, lost: 0, buildingsLost: 0 };
    this.fxTime = 0;
    this.ui = new UI(this);
    this.bindInput();
    this.resize = this.resize.bind(this);
    window.addEventListener('resize', this.resize);
    this.resize();
    this.lastFrame = performance.now();
    this.ui.sync(true);
    requestAnimationFrame(t => this.frame(t));
  }

  defaultMods() {
    return {
      foodGather: 1, woodGather: 1, mineGather: 1,
      militiaDamage: 1, militiaHp: 1, archerDamage: 1, archerRange: 0,
      soldierDamage: 1, soldierHp: 1, buildingHp: 1,
      towerDamage: 1, towerRange: 0, speed: 1,
      lifesteal: 0, bounty: 0, reinforcement: 0, fertility: 0,
      tcArrows: false, farmRate: 1, trainTime: 1, attackSpeed: 1
    };
  }

  readBest() {
    try {
      const n = parseInt(localStorage.getItem(TITLE_BEST_KEY) || '1', 10);
      return Number.isFinite(n) ? clamp(n, 1, TOTAL_WAVES) : 1;
    } catch { return 1; }
  }

  saveBest() {
    this.bestWave = clamp(Math.max(this.bestWave, this.wave), 1, TOTAL_WAVES);
    try { localStorage.setItem(TITLE_BEST_KEY, String(this.bestWave)); } catch {}
  }

  resize() {
    this.renderer.resize();
    this.ui.onResize();
  }

  frame(now) {
    const dt = Math.min((now - this.lastFrame) / 1000, 0.05);
    this.lastFrame = now;
    this.tick(dt);
    this.renderer.draw();
    this.ui.sync();
    requestAnimationFrame(t => this.frame(t));
  }

  tick(dt) {
    if (this.state === 'title') {
      this.titleTime += dt;
      return;
    }
    if (this.state !== 'playing') {
      this.fxTime += dt;
      return;
    }
    this.time += dt;
    this.updateAmbient(dt);
    this.updateWave(dt);
    this.updateBuildings(dt);
    this.updateUnits(dt);
    this.updateQueue(dt);
    this.updateProjectiles(dt);
    this.updateParticles(dt);
    this.cleanupSelection();
  }

  startRun(difficulty = this.difficulty) {
    this.audio.ensure();
    this.difficulty = difficulty;
    const diff = DIFFICULTIES[difficulty];
    this.world = new World((Math.random() * 1e9) | 0);
    this.mods = this.defaultMods();
    this.units = [];
    this.buildings = [];
    this.projectiles = [];
    this.particles = [];
    this.floatTexts = [];
    this.spawnQueue = [];
    this.queue = [];
    this.selected = [];
    this.taken = {};
    this.placing = null;
    this.dragRect = null;
    this.time = 0;
    this.fxTime = 0;
    this.wave = 1;
    this.waveActive = false;
    this.prepTime = 55 + diff.prep;
    this.stats = { kills: 0, gathered: { food: 0, wood: 0, gold: 0, stone: 0 }, lost: 0, buildingsLost: 0 };
    this.resources = { food: 280, wood: 280, gold: 110, stone: 70 };
    this.createBuilding('towncenter', 6, 6, true);
    this.createBuilding('house', 3, 5, true);
    this.createBuilding('house', 10, 7, true);
    for (let i = 0; i < 4; i++) {
      const u = this.spawnPlayerUnit('villager');
      if (u) this.autoAssignVillager(u);
    }
    for (let i = 0; i < 3; i++) this.spawnPlayerUnit('militia');
    for (const b of this.buildings) b.hp = b.maxHp;
    this.state = 'playing';
    this.ui.showGame();
    this.ui.sync(true);
    this.toast('Your village awakens. Prepare for the first wave.', 'good');
  }

  returnToTitle() {
    this.state = 'title';
    this.titleTime = 0;
    this.selected = [];
    this.placing = null;
    this.ui.showTitle();
  }

  defaultResources() {
    return { food: 0, wood: 0, gold: 0, stone: 0 };
  }

  createBuilding(type, tx, ty, free = false) {
    const def = BUILD_DEFS[type];
    if (!def) return null;
    const maxHp = Math.round(def.hp * (type === 'towncenter' ? 1 : this.mods.buildingHp));
    const b = {
      id: uid(), building: true, type, def, tx, ty,
      x: tx + def.size / 2, y: ty + def.size / 2,
      hp: maxHp, maxHp, dead: false,
      cooldown: 0, hitFlash: 0, builtAt: this.time,
      smokeTimer: Math.random() * 2, farmTimer: 0,
      buildingDamage: 0
    };
    this.buildings.push(b);
    this.world.occupy(b);
    if (!free) this.audio.place();
    return b;
  }

  addBuilding(type, tx, ty) {
    const def = BUILD_DEFS[type];
    if (!def) return false;
    if (!this.canAfford(def.cost)) { this.toast('Not enough resources.', 'warn'); this.audio.error(); return false; }
    if (!this.world.canPlace(type, tx, ty, def, this.buildings)) { this.toast('Cannot build there.', 'warn'); this.audio.error(); return false; }
    for (const k of Object.keys(def.cost)) this.spend(k, def.cost[k]);
    this.createBuilding(type, tx, ty);
    this.burst(tx + def.size / 2, ty + def.size / 2, 30, 10, '#d9c08a', 'dust');
    this.toast(`${def.name} constructed.`, 'good');
    this.ui.sync(true);
    return true;
  }

  canAfford(cost) {
    return Object.entries(cost).every(([k, v]) => (this.resources[k] || 0) >= v);
  }

  spend(kind, amount) {
    this.resources[kind] = Math.max(0, this.resources[kind] - amount);
  }

  addResource(kind, amount, reason = null) {
    this.resources[kind] = (this.resources[kind] || 0) + amount;
    if (reason) this.floatTexts.push({ x: 7.5, y: 7.5, z: 40, text: `+${Math.round(amount)} ${kind}`, color: '#f3d589', life: 1.4, max: 1.4 });
  }

  hasBuilding(type) {
    return this.buildings.some(b => !b.dead && b.type === type);
  }

  townCenter() {
    return this.buildings.find(b => !b.dead && b.type === 'towncenter');
  }

  popCap() {
    let cap = 10;
    for (const b of this.buildings) if (!b.dead && b.type === 'house') cap += 5;
    return cap;
  }

  popUsed() {
    let n = 0;
    for (const u of this.units) if (u.team === 'player' && !u.dead) n++;
    return n;
  }

  toast(text, type = '') {
    this.ui.toast(text, type);
  }

  beginPlacement(type) {
    if (this.state !== 'playing') return;
    const def = BUILD_DEFS[type];
    if (!def) return;
    if (this.placing && this.placing.type === type) { this.cancelPlacement(); return; }
    if (!this.canAfford(def.cost)) { this.toast(`Not enough resources for a ${def.name}.`, 'warn'); this.audio.error(); return; }
    this.placing = { type, def, tx: 0, ty: 0, valid: false };
    this.audio.click();
    this.ui.setPlacing(type);
  }

  cancelPlacement() {
    this.placing = null;
    this.ui.clearPlacing();
  }

  updatePlacing(sx, sy) {
    if (!this.placing) return;
    const w = this.renderer.screenToWorld(sx, sy);
    const size = this.placing.def.size;
    let tx = Math.round(w.x - size / 2);
    let ty = Math.round(w.y - size / 2);
    tx = clamp(tx, 0, MAP_SIZE - size);
    ty = clamp(ty, 0, MAP_SIZE - size);
    this.placing.tx = tx;
    this.placing.ty = ty;
    this.placing.valid = this.world.canPlace(this.placing.type, tx, ty, this.placing.def, this.buildings);
  }

  confirmPlacement() {
    if (!this.placing) return false;
    if (!this.placing.valid) { this.toast('Cannot build there.', 'warn'); this.audio.error(); return false; }
    const { type, tx, ty } = this.placing;
    const ok = this.addBuilding(type, tx, ty);
    if (ok) this.cancelPlacement();
    return ok;
  }

  train(kind) {
    if (this.state !== 'playing') return;
    const def = UNIT_DEFS[kind];
    if (!def) return;
    if (kind === 'militia' && !this.hasBuilding('barracks')) { this.toast('Build a Barracks to train Militia.', 'warn'); this.audio.error(); return; }
    if (kind === 'archer' && !this.hasBuilding('range')) { this.toast('Build an Archery Range to train Archers.', 'warn'); this.audio.error(); return; }
    if (!this.hasBuilding('towncenter')) return;
    if (!this.canAfford(def.cost)) { this.toast('Not enough resources.', 'warn'); this.audio.error(); return; }
    if (this.popUsed() + this.queue.length >= this.popCap()) { this.toast('Population capped. Build a House.', 'warn'); this.audio.error(); return; }
    for (const k of Object.keys(def.cost)) this.spend(k, def.cost[k]);
    const total = def.time * this.mods.trainTime;
    this.queue.push({ kind, time: total, total });
    this.audio.train();
    this.ui.sync(true);
  }

  updateQueue(dt) {
    if (!this.queue.length) return;
    const q = this.queue[0];
    q.time -= dt;
    if (q.time > 0) return;
    if (this.popUsed() >= this.popCap()) { q.time = 0; return; }
    this.queue.shift();
    const pos = this.findSpawnPos();
    const u = this.spawnPlayerUnit(q.kind, pos.x, pos.y);
    if (u && q.kind === 'villager') this.autoAssignVillager(u);
    this.ui.sync(true);
  }

  findSpawnPos() {
    const tc = this.townCenter();
    const cx = tc ? tc.x : 7.5;
    const cy = tc ? tc.y : 7.5;
    for (let i = 0; i < 24; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 2.1 + Math.random() * 1.2;
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r;
      if (!this.world.isWater(x, y) && !this.world.isOccupied(x, y)) return { x: clamp(x, 0.4, MAP_SIZE - 0.4), y: clamp(y, 0.4, MAP_SIZE - 0.4) };
    }
    return { x: cx + 1.8, y: cy + 1.8 };
  }

  spawnPlayerUnit(kind, x = null, y = null) {
    const def = UNIT_DEFS[kind];
    if (!def) return null;
    if (x === null || y === null) {
      const p = this.findSpawnPos();
      x = p.x; y = p.y;
    }
    const isMilitia = kind === 'militia';
    const isArcher = kind === 'archer';
    const maxHp = Math.round(def.hp * this.mods.soldierHp * (isMilitia ? this.mods.militiaHp : 1));
    const u = {
      id: uid(), unit: true, team: 'player', kind, def,
      x, y, hp: maxHp, maxHp,
      speed: def.speed * this.mods.speed,
      damage: def.damage ? def.damage * this.mods.soldierDamage * (isMilitia ? this.mods.militiaDamage : isArcher ? this.mods.archerDamage : 1) : 0,
      range: (def.range || 0) + (isArcher ? this.mods.archerRange : 0),
      cooldown: def.cooldown ? def.cooldown / this.mods.attackSpeed : 1,
      cooldownLeft: Math.random() * 0.4,
      dead: false, target: null, command: null, task: null,
      gatherState: 'idle', carry: 0, carryType: null,
      facing: 1, phase: Math.random() * Math.PI * 2,
      attackAnim: 0, hitFlash: 0, scan: Math.random() * 0.4,
      teammate: true
    };
    this.units.push(u);
    return u;
  }

  spawnFreeMilitia(n) {
    for (let i = 0; i < n; i++) this.spawnPlayerUnit('militia');
    if (n > 0) this.toast(`${n} militia join your ranks.`, 'good');
  }

  spawnFreeVillagers(n) {
    for (let i = 0; i < n; i++) {
      const u = this.spawnPlayerUnit('villager');
      if (u) this.autoAssignVillager(u);
    }
    if (n > 0) this.toast(`${n} villagers arrive from the countryside.`, 'good');
  }

  refreshUnitStats(kind) {
    for (const u of this.units) {
      if (u.team !== 'player' || u.kind !== kind || u.dead) continue;
      const ratio = u.hp / u.maxHp;
      const def = u.def;
      const isMilitia = kind === 'militia';
      const isArcher = kind === 'archer';
      u.maxHp = Math.round(def.hp * this.mods.soldierHp * (isMilitia ? this.mods.militiaHp : 1));
      u.hp = Math.max(1, Math.round(u.maxHp * ratio));
      u.damage = def.damage ? def.damage * this.mods.soldierDamage * (isMilitia ? this.mods.militiaDamage : isArcher ? this.mods.archerDamage : 1) : 0;
      u.range = (def.range || 0) + (isArcher ? this.mods.archerRange : 0);
      u.speed = def.speed * this.mods.speed;
      u.cooldown = def.cooldown ? def.cooldown / this.mods.attackSpeed : 1;
    }
  }

  autoAssignVillager(u) {
    const type = this.chooseResourceType(u);
    if (type) {
      const node = this.world.nearestNode(u.x, u.y, GATHER_NODE[type]);
      if (node) this.assignGather(u, node);
    }
  }

  chooseResourceType(u) {
    const counts = { food: 0, wood: 0, gold: 0, stone: 0 };
    for (const v of this.units) {
      if (v.team === 'player' && v.kind === 'villager' && !v.dead && v.task) counts[v.task.node.resource] = (counts[v.task.node.resource] || 0) + 1;
    }
    let total = 0;
    for (const k of RESOURCE_KEYS) total += counts[k];
    const weights = {
      food: 0.4,
      wood: 0.38,
      gold: this.wave >= 2 ? 0.15 : 0,
      stone: this.wave >= 3 ? 0.12 : 0
    };
    let best = null, bestScore = -Infinity;
    for (const k of RESOURCE_KEYS) {
      if (weights[k] <= 0) continue;
      if (!this.world.nodesOfKind(GATHER_NODE[k]).length) continue;
      const score = weights[k] * (total + 1) - counts[k];
      if (score > bestScore) { bestScore = score; best = k; }
    }
    if (!best) {
      for (const k of RESOURCE_KEYS) {
        if (this.world.nodesOfKind(GATHER_NODE[k]).length) { best = k; break; }
      }
    }
    return best;
  }

  assignGather(u, node) {
    if (!node || node.amount <= 0) return;
    u.task = { node };
    u.gatherState = 'toNode';
    u.command = null;
    u.target = null;
  }

  updateVillager(u, dt) {
    u.scan -= dt;
    if (u.scan <= 0) {
      u.scan = 0.5;
      const threat = this.nearestEnemy(u.x, u.y, 2.9);
      const tc = this.townCenter();
      if (threat && tc) {
        if (!u.fleeing) u.fleeing = { previous: u.task, previousState: u.gatherState };
        this.moveUnit(u, tc.x, tc.y + 0.6, dt, 1.5);
        u.phase += dt * 9;
        if (dist(u.x, u.y, tc.x, tc.y) < 2.4) {
          if (u.carry > 0) this.depositVillager(u);
          u.gatherState = 'fleeing';
        }
        return;
      }
      if (u.fleeing) {
        if (u.fleeing.previous && u.fleeing.previous.node.amount > 0) {
          u.task = u.fleeing.previous;
          u.gatherState = 'toNode';
        } else {
          u.task = null;
          this.autoAssignVillager(u);
        }
        u.fleeing = null;
      }
    }
    if (u.command) {
      const arrived = this.moveUnit(u, u.command.x, u.command.y, dt, 0.15);
      u.phase += dt * 10;
      if (arrived) u.command = null;
      return;
    }
    if (!u.task) {
      if (u.scan <= 0) { u.scan = 1.2; this.autoAssignVillager(u); }
      return;
    }
    const node = u.task.node;
    if (!node || node.amount <= 0) {
      const replacement = this.world.nearestNode(u.x, u.y, node ? node.kind : null);
      if (replacement) this.assignGather(u, replacement);
      else { u.task = null; u.gatherState = 'idle'; this.autoAssignVillager(u); }
      return;
    }
    if (u.gatherState === 'toNode') {
      const arrived = this.moveUnit(u, node.x, node.y, dt, 0.8);
      u.phase += dt * 11;
      if (arrived) u.gatherState = 'gather';
      return;
    }
    if (u.gatherState === 'gather') {
      u.facing = node.x >= u.x ? 1 : -1;
      const rate = 0.92 * this.mods[GATHER_MOD[node.resource]];
      const take = Math.min(rate * dt, node.amount, CARRY_CAP - u.carry);
      node.amount -= take;
      u.carry += take;
      u.carryType = node.resource;
      u.phase += dt * 5;
      if (Math.random() < dt * 3.4) this.gatherSpark(node);
      if (node.amount <= 0.01) {
        node.amount = 0;
        this.onNodeDepleted(node);
      }
      if (u.carry >= CARRY_CAP - 0.001 || node.amount <= 0) u.gatherState = 'return';
      return;
    }
    if (u.gatherState === 'return' || u.gatherState === 'fleeing') {
      const tc = this.townCenter();
      if (!tc) return;
      const arrived = this.moveUnit(u, tc.x, tc.y + 0.7, dt, 1.9);
      u.phase += dt * 11;
      if (arrived || dist(u.x, u.y, tc.x, tc.y) < 2.3) {
        this.depositVillager(u);
        if (node.amount > 0) u.gatherState = 'toNode';
        else {
          const replacement = this.world.nearestNode(u.x, u.y, node.kind);
          if (replacement) this.assignGather(u, replacement);
          else { u.task = null; u.gatherState = 'idle'; this.autoAssignVillager(u); }
        }
      }
    }
  }

  depositVillager(u) {
    if (u.carry <= 0.01) return;
    const amount = Math.floor(u.carry);
    u.carry -= amount;
    if (amount > 0 && u.carryType) {
      this.resources[u.carryType] = (this.resources[u.carryType] || 0) + amount;
      this.stats.gathered[u.carryType] += amount;
      this.audio.deposit();
      this.floatTexts.push({ x: u.x, y: u.y, z: 34, text: `+${amount}`, color: '#d9e6a4', life: 0.9, max: 0.9 });
      this.burst(u.x, u.y, 40, 4, '#d8c58c', 'dust');
    }
    u.carry = 0;
  }

  gatherSpark(node) {
    this.particles.push({
      x: node.x + (Math.random() - 0.5) * 0.4,
      y: node.y + (Math.random() - 0.5) * 0.4,
      z: 12 + Math.random() * 22,
      vx: (Math.random() - 0.5) * 0.35,
      vy: 0.15 + Math.random() * 0.3,
      vz: 12 + Math.random() * 18,
      life: 0.5, max: 0.5, size: 1.4 + Math.random() * 1.6,
      color: node.kind === 'gold' ? '#f4d878' : node.kind === 'stone' ? '#c5c3b8' : node.kind === 'berry' ? '#c65b58' : '#c99c57',
      gravity: 45, kind: 'spark'
    });
    this.audio.gather(node.resource);
  }

  onNodeDepleted(node) {
    if (node.kind === 'tree') {
      const t = this.world.tile(node.x, node.y);
      if (t && t.terrain === 'forest') t.terrain = 'grass';
    }
    this.renderer.groundDirty = true;
    this.burst(node.x, node.y, 12, 6, node.kind === 'tree' ? '#6d5132' : '#b7ae99', 'dust');
  }

  nearestEnemy(x, y, radius = 99) {
    let best = null, bestD = radius;
    for (const u of this.units) {
      if (u.team !== 'enemy' || u.dead) continue;
      const d = dist(x, y, u.x, u.y);
      if (d < bestD) { bestD = d; best = u; }
    }
    return best;
  }

  enemies() {
    return this.units.filter(u => u.team === 'enemy' && !u.dead);
  }

  updateUnits(dt) {
    for (const u of this.units) {
      if (u.dead) continue;
      u.cooldownLeft = Math.max(0, u.cooldownLeft - dt);
      u.attackAnim = Math.max(0, u.attackAnim - dt * 3.5);
      u.hitFlash = Math.max(0, u.hitFlash - dt * 4);
      if (u.team === 'player') {
        if (u.kind === 'villager') this.updateVillager(u, dt);
        else this.updateSoldier(u, dt);
      } else {
        this.updateEnemy(u, dt);
      }
    }
    this.separateUnits();
    this.units = this.units.filter(u => !u.dead);
  }

  separateUnits() {
    const list = this.units.filter(u => !u.dead);
    for (let i = 0; i < list.length; i++) {
      const a = list[i];
      for (let j = i + 1; j < list.length; j++) {
        const b = list[j];
        if (a.team !== b.team) continue;
        if (a.kind === 'villager' && b.kind === 'villager') continue;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const d = Math.hypot(dx, dy);
        const min = 0.52 * Math.max(a.size || 1, b.size || 1);
        if (d >= min) continue;
        const angle = d > 0.001 ? Math.atan2(dy, dx) : (i * 2.4 + j * 0.9);
        const push = (min - d) * 0.5;
        for (const u of [a, b]) {
          const sign = u === a ? -1 : 1;
          const nx = u.x + Math.cos(angle) * push * sign;
          const ny = u.y + Math.sin(angle) * push * sign;
          if (!this.blocked(nx, ny)) { u.x = nx; u.y = ny; }
        }
      }
    }
  }

  updateSoldier(u, dt) {
    if (u.command && u.command.type === 'attack' && u.command.target && !u.command.target.dead) {
      u.target = u.command.target;
    } else if (u.command && u.command.type === 'move') {
      if (this.moveUnit(u, u.command.x, u.command.y, dt, 0.2)) u.command = null;
      if (u.target && (u.target.dead || dist(u.x, u.y, u.target.x, u.target.y) > 9)) u.target = null;
      if (!u.target) return;
    }
    if (!u.target || u.target.dead) {
      u.target = this.nearestEnemy(u.x, u.y, 8.5);
    }
    if (!u.target) {
      const tc = this.townCenter();
      if (tc && !u.command && dist(u.x, u.y, tc.x, tc.y) > 5.5) this.moveUnit(u, tc.x + (Math.random() - 0.5) * 3, tc.y + 2 + Math.random() * 1.5, dt, 0.5);
      return;
    }
    const target = u.target;
    const isBuilding = !!target.building;
    const size = isBuilding ? target.def.size : 0;
    const stop = u.range + size * 0.42 + (isBuilding ? 0.2 : 0);
    const d = dist(u.x, u.y, target.x, target.y);
    if (d > stop + 0.06) {
      if (u.kind === 'archer' && d < stop * 0.62) {
        const dx = u.x - target.x, dy = u.y - target.y;
        const len = Math.hypot(dx, dy) || 1;
        this.moveUnit(u, u.x + (dx / len) * 1.4, u.y + (dy / len) * 1.4, dt, 0.1);
      } else {
        this.moveUnit(u, target.x, target.y, dt, stop);
      }
      u.phase += dt * 11;
    } else {
      u.facing = target.x >= u.x ? 1 : -1;
      if (u.cooldownLeft <= 0) this.attack(u, target);
    }
  }

  updateEnemy(u, dt) {
    let target = u.target;
    if (!target || target.dead) {
      target = this.chooseEnemyTarget(u);
      u.target = target;
    }
    if (!target) return;
    const isBuilding = !!target.building;
    const size = isBuilding ? target.def.size : 0;
    const stop = u.range + size * 0.44;
    const d = dist(u.x, u.y, target.x, target.y);
    if (d > stop + 0.06) {
      this.moveUnit(u, target.x, target.y, dt, stop);
      u.phase += dt * 10;
    } else {
      u.facing = target.x >= u.x ? 1 : -1;
      if (u.cooldownLeft <= 0) this.attack(u, target);
    }
  }

  chooseEnemyTarget(u) {
    let best = null, bestScore = Infinity;
    for (const b of this.buildings) {
      if (b.dead) continue;
      let d = dist(u.x, u.y, b.x, b.y) - b.def.size * 0.35;
      if (u.kind === 'ram') d -= 3.2;
      if (b.type === 'towncenter') d -= 0.4;
      if (d < bestScore) { bestScore = d; best = b; }
    }
    for (const p of this.units) {
      if (p.team !== 'player' || p.dead) continue;
      let d = dist(u.x, u.y, p.x, p.y);
      if (u.kind === 'brute') d -= 1.6;
      if (u.kind === 'ram') d += 2.2;
      if (p.kind === 'villager') d += 0.9;
      if (d < bestScore) { bestScore = d; best = p; }
    }
    return best;
  }

  attack(source, target) {
    if (!target || target.dead) return;
    const isRanged = source.kind === 'archer' || source.kind === 'skirmisher' || source.tower;
    source.cooldownLeft = source.cooldown;
    source.attackAnim = 1;
    if (isRanged) {
      this.spawnProjectile(source, target);
      this.audio.arrow();
    } else {
      const dmg = target.building && source.buildingDamage ? source.buildingDamage : source.damage;
      this.dealDamage(target, dmg, source);
      this.burst(target.x, target.y, target.building ? 25 : 30, 5, target.team === 'enemy' ? '#b34832' : '#d4c89f', 'spark');
      this.audio.hit();
    }
  }

  spawnProjectile(source, target) {
    const sx = source.x;
    const sy = source.y;
    const startZ = source.building ? 44 : 16;
    const d = dist(sx, sy, target.x, target.y);
    this.projectiles.push({
      x: sx, y: sy, z: startZ,
      sourceX: sx, sourceY: sy, startZ,
      target, team: source.team, kind: source.kind,
      damage: source.damage * (source.building ? 1 : 1),
      t: 0, duration: clamp(d / 11, 0.18, 0.55),
      arc: 12 + d * 2.2,
      dead: false
    });
  }

  updateProjectiles(dt) {
    for (const p of this.projectiles) {
      p.t += dt / p.duration;
      if (p.target && !p.target.dead) {
        p.targetX = p.target.x;
        p.targetY = p.target.y;
        p.targetZ = p.target.building ? 22 : 12;
      }
      if (p.t >= 1) {
        p.dead = true;
        if (p.target && !p.target.dead) {
          this.dealDamage(p.target, p.damage, { team: p.team, kind: p.kind, projectile: true });
          this.burst(p.target.x, p.target.y, p.target.building ? 30 : 20, 4, '#e5d7ab', 'spark');
        }
      }
    }
    this.projectiles = this.projectiles.filter(p => !p.dead);
  }

  dealDamage(target, amount, source) {
    if (!target || target.dead) return;
    target.hp -= amount;
    target.hitFlash = 0.22;
    if (target.building) {
      if (Math.random() < 0.5) this.burst(target.x + (Math.random() - 0.5) * 1.2, target.y + (Math.random() - 0.5) * 1.2, 22, 3, '#9b8b70', 'dust');
      if (target.hp <= 0) this.destroyBuilding(target);
      return;
    }
    if (Math.random() < 0.35) this.burst(target.x, target.y, 16, 2, target.team === 'enemy' ? '#a53b2c' : '#7d1f1a', 'spark');
    if (target.hp <= 0) this.killUnit(target, source);
  }

  killUnit(u, source) {
    if (u.dead) return;
    u.dead = true;
    this.burst(u.x, u.y, 10, 9, u.team === 'enemy' ? '#8e3327' : '#6f2b24', 'spark');
    this.audio.death();
    if (u.team === 'enemy') {
      this.stats.kills++;
      const bounty = (u.def.bounty || 5) + this.mods.bounty;
      this.resources.gold += bounty;
      if (source && source.team === 'player' && this.mods.lifesteal > 0) {
        const healer = this.units.find(p => p.team === 'player' && !p.dead && p.kind !== 'villager' && dist(p.x, p.y, u.x, u.y) < 1.6);
        if (healer) healer.hp = Math.min(healer.maxHp, healer.hp + this.mods.lifesteal);
      }
      if (Math.random() < 0.6) this.floatTexts.push({ x: u.x, y: u.y, z: 24, text: `+${bounty}g`, color: '#f2d479', life: 1, max: 1 });
      if (u.team === 'enemy' && this.enemies().length === 0 && this.spawnQueue.length === 0) this.ui.sync(true);
    } else {
      this.stats.lost++;
      this.selected = this.selected.filter(s => s !== u);
    }
  }

  destroyBuilding(b) {
    if (b.dead) return;
    b.dead = true;
    this.world.vacate(b);
    this.stats.buildingsLost++;
    this.burst(b.x, b.y, 35, 20, '#8a6a44', 'dust');
    this.burst(b.x, b.y, 40, 12, '#d47a3c', 'spark');
    this.toast(`${b.def.name} destroyed!`, 'warn');
    this.audio.place();
    this.buildings = this.buildings.filter(x => x !== b);
    this.selected = this.selected.filter(s => s !== b);
    if (b.type === 'towncenter') this.defeat();
  }

  updateBuildings(dt) {
    for (const b of this.buildings) {
      b.hitFlash = Math.max(0, b.hitFlash - dt * 3);
      b.cooldown = Math.max(0, b.cooldown - dt);
      b.smokeTimer -= dt;
      if (b.smokeTimer <= 0) {
        b.smokeTimer = 1.4 + Math.random() * 2.2;
        if (b.type === 'towncenter' || b.type === 'house' || b.type === 'barracks') {
          this.particles.push({
            x: b.x + 0.55, y: b.y - 0.3, z: 30 + b.def.size * 14,
            vx: 0.12 + Math.random() * 0.12, vy: -0.06,
            vz: 10 + Math.random() * 8,
            life: 2.4, max: 2.4, size: 3 + Math.random() * 4,
            color: '#8d8a80', gravity: -2, kind: 'smoke'
          });
        }
      }
      if (b.type === 'farm') {
        b.farmTimer += dt;
        if (b.farmTimer >= 1) {
          b.farmTimer -= 1;
          this.resources.food += 0.45 * this.mods.farmRate;
        }
      }
      const tower = b.type === 'tower';
      const tcArrows = b.type === 'towncenter' && this.mods.tcArrows;
      if (!tower && !tcArrows) continue;
      const range = (tower ? b.def.range : 5.4) + (tower ? this.mods.towerRange : 0);
      if (b.cooldown <= 0) {
        const target = this.nearestEnemy(b.x, b.y, range);
        if (target) {
          b.cooldown = tower ? b.def.cooldown / this.mods.attackSpeed : 1.6 / this.mods.attackSpeed;
          b.attackAnim = 1;
          const damage = (tower ? b.def.damage : 9) * this.mods.towerDamage;
          this.spawnTowerArrow(b, target, damage);
        }
      }
    }
  }

  spawnTowerArrow(b, target, damage) {
    const d = dist(b.x, b.y, target.x, target.y);
    this.projectiles.push({
      x: b.x, y: b.y, z: 46,
      sourceX: b.x, sourceY: b.y, startZ: 46,
      target, team: 'player', kind: 'tower',
      damage, t: 0, duration: clamp(d / 12, 0.15, 0.45),
      arc: 10 + d * 1.6, dead: false
    });
    this.audio.arrow();
  }

  moveUnit(u, tx, ty, dt, stopDist = 0) {
    const dx = tx - u.x;
    const dy = ty - u.y;
    const d = Math.hypot(dx, dy);
    if (d <= stopDist + 0.04) return true;
    const step = Math.min(d - stopDist, u.speed * dt);
    if (step <= 0) return true;
    const baseAngle = Math.atan2(dy, dx);
    const angles = [0, 0.55, -0.55, 1.1, -1.1, 1.7, -1.7, 2.35, -2.35, 2.9, -2.9];
    let moved = false;
    for (const a of angles) {
      const ang = baseAngle + a;
      const nx = u.x + Math.cos(ang) * step;
      const ny = u.y + Math.sin(ang) * step;
      if (u.team === 'player' && (nx < 0.25 || ny < 0.25 || nx > MAP_SIZE - 0.25 || ny > MAP_SIZE - 0.25)) continue;
      if (this.blocked(nx, ny)) continue;
      const vx = nx - u.x;
      u.x = nx;
      u.y = ny;
      if (Math.abs(vx) > 0.0005) u.facing = vx >= 0 ? 1 : -1;
      moved = true;
      break;
    }
    if (!moved) {
      u.x = clamp(u.x + Math.cos(baseAngle) * step * 0.12, 0.25, MAP_SIZE - 0.25);
      u.y = clamp(u.y + Math.sin(baseAngle) * step * 0.12, 0.25, MAP_SIZE - 0.25);
    }
    return false;
  }

  blocked(x, y) {
    if (x < 0 || y < 0 || x >= MAP_SIZE || y >= MAP_SIZE) return false;
    return this.world.isWater(x, y) || this.world.isOccupied(x, y);
  }

  startWave() {
    if (this.state !== 'playing' || this.waveActive) return;
    this.waveActive = true;
    this.prepTime = 0;
    this.spawnQueue = [];
    if (this.mods.fertility > 0) this.spawnFreeVillagers(this.mods.fertility);
    if (this.mods.reinforcement > 0) this.spawnFreeMilitia(this.mods.reinforcement);
    const diff = DIFFICULTIES[this.difficulty];
    const count = Math.max(2, Math.round((1.6 + this.wave * 1.25) * diff.enemies));
    const skirmishers = this.wave >= 2 ? Math.floor(count * 0.24) : 0;
    const brutes = this.wave >= 4 ? Math.floor(count * 0.15) : 0;
    const rams = this.wave >= 6 ? 1 + Math.floor((this.wave - 6) / 2) : 0;
    const raiders = Math.max(1, count - skirmishers - brutes - rams);
    const kinds = [];
    for (let i = 0; i < raiders; i++) kinds.push('raider');
    for (let i = 0; i < skirmishers; i++) kinds.push('skirmisher');
    for (let i = 0; i < brutes; i++) kinds.push('brute');
    for (let i = 0; i < rams; i++) kinds.push('ram');
    const rng = mulberry32((this.time * 1000 + this.wave * 97) >>> 0);
    const order = shuffle(kinds, rng);
    const edgeCount = this.wave >= 5 ? 2 : 1;
    const edges = [];
    for (let i = 0; i < edgeCount; i++) {
      let e = Math.floor(rng() * 4);
      if (edges.includes(e)) e = (e + 2) % 4;
      edges.push(e);
    }
    const edgeNames = ['north', 'east', 'south', 'west'];
    this.toast(`Wave ${this.wave}: raiders approach from the ${edges.map(e => edgeNames[e]).join(' and ')}!`, 'warn');
    let t = 0;
    for (let i = 0; i < order.length; i++) {
      const edge = edges[i % edges.length];
      const pos = this.world.spawnField(edge, rng);
      t += 0.24 + rng() * 0.65;
      this.spawnQueue.push({ kind: order[i], pos, delay: t, edge });
    }
    this.audio.horn();
    this.ui.sync(true);
  }

  callWave() {
    if (this.state !== 'playing' || this.waveActive) return;
    const bonus = 18 + this.wave * 4;
    this.resources.gold += bonus;
    this.toast(`The horn sounds early. +${bonus} gold.`, 'good');
    this.audio.coin();
    this.startWave();
  }

  updateWave(dt) {
    if (!this.waveActive) {
      this.prepTime -= dt;
      if (this.prepTime <= 0) this.startWave();
      return;
    }
    for (const s of this.spawnQueue) {
      s.delay -= dt;
      if (s.delay <= 0 && !s.spawned) {
        s.spawned = true;
        this.spawnEnemy(s.kind, s.pos.x, s.pos.y, s.edge);
      }
    }
    this.spawnQueue = this.spawnQueue.filter(s => !s.spawned);
    if (this.spawnQueue.length === 0 && this.enemies().length === 0) this.completeWave();
  }

  spawnEnemy(kind, x, y, edge) {
    const def = ENEMY_DEFS[kind];
    const diff = DIFFICULTIES[this.difficulty];
    const waveScale = 1 + (this.wave - 1) * 0.095;
    const maxHp = Math.round(def.hp * waveScale * diff.hp);
    const u = {
      id: uid(), unit: true, team: 'enemy', kind, def,
      x, y, hp: maxHp, maxHp,
      speed: def.speed * (1 + Math.min(0.18, this.wave * 0.008)),
      damage: def.damage * (1 + (this.wave - 1) * 0.06) * diff.damage,
      range: def.range, cooldown: def.cooldown, cooldownLeft: Math.random() * 0.5,
      dead: false, target: null, command: null, task: null,
      facing: 1, phase: Math.random() * 6, attackAnim: 0, hitFlash: 0,
      buildingDamage: def.buildingDamage || 0, size: def.size,
      bounty: def.bounty, edge
    };
    this.units.push(u);
    if (edge !== undefined) {
      const wx = x < 0 ? 0.2 : x > MAP_SIZE ? MAP_SIZE - 0.2 : x;
      const wy = y < 0 ? 0.2 : y > MAP_SIZE ? MAP_SIZE - 0.2 : y;
      this.burst(wx, wy, 10, 6, '#a63e2b', 'dust');
    }
  }

  completeWave() {
    if (!this.waveActive) return;
    this.waveActive = false;
    this.saveBest();
    this.audio.waveClear();
    for (const u of this.units) if (u.team === 'player' && !u.dead) u.hp = Math.min(u.maxHp, Math.round(u.hp + u.maxHp * 0.14));
    for (const b of this.buildings) if (!b.dead) b.hp = Math.min(b.maxHp, Math.round(b.hp + b.maxHp * 0.08));
    for (const n of this.world.nodes) if (n.amount > 0) n.amount = Math.min(n.max, n.amount + n.max * 0.05);
    this.resources.food += 30;
    this.resources.gold += 25;
    if (this.wave >= TOTAL_WAVES) { this.victory(); return; }
    this.state = 'boon';
    const choices = this.rollBoons(3);
    this.audio.boon();
    this.ui.showBoons(choices);
    this.ui.sync(true);
    this.toast(`Wave ${this.wave} repelled! Choose a blessing.`, 'good');
  }

  rollBoons(n) {
    const available = BOONS.filter(b => (this.taken[b.id] || 0) < b.max);
    const pool = shuffle(available);
    const chosen = [];
    const categories = {
      economy: ['harvest', 'forestry', 'prospector', 'granary', 'royalgrant', 'fertility', 'conscription'],
      military: ['drills', 'fletching', 'towers', 'bloodlust', 'bounty', 'reinforcements', 'ironclad', 'zeal'],
      defense: ['masonry', 'swift', 'townarrows']
    };
    for (const group of [categories.economy, categories.military]) {
      const candidate = pool.find(b => group.includes(b.id) && !chosen.includes(b));
      if (candidate) chosen.push(candidate);
      if (chosen.length >= n) break;
    }
    for (const b of pool) {
      if (chosen.length >= n) break;
      if (!chosen.includes(b)) chosen.push(b);
    }
    return chosen.slice(0, n);
  }

  chooseBoon(index) {
    if (this.state !== 'boon') return;
    const boon = this.ui.boonChoices[index];
    if (!boon) return;
    this.taken[boon.id] = (this.taken[boon.id] || 0) + 1;
    this.ui.hideBoons();
    this.state = 'playing';
    this.wave++;
    this.prepTime = Math.max(20, 32 + DIFFICULTIES[this.difficulty].prep);
    boon.apply(this);
    this.audio.boon();
    this.toast(`${boon.name} — ${boon.desc.split('.')[0]}.`, 'good');
    this.ui.sync(true);
  }

  victory() {
    if (this.state === 'victory' || this.state === 'gameover') return;
    this.state = 'victory';
    this.wave = TOTAL_WAVES;
    this.saveBest();
    this.audio.victory();
    this.ui.showEnd(true, this.endStats());
  }

  defeat() {
    if (this.state === 'gameover' || this.state === 'victory') return;
    this.state = 'gameover';
    this.saveBest();
    this.audio.defeat();
    this.ui.showEnd(false, this.endStats());
  }

  endStats() {
    return {
      wave: Math.min(this.wave, TOTAL_WAVES),
      kills: this.stats.kills,
      gathered: RESOURCE_KEYS.reduce((a, k) => a + this.stats.gathered[k], 0),
      lost: this.stats.lost,
      time: this.time
    };
  }

  togglePause() {
    if (this.state === 'playing') {
      this.state = 'paused';
      this.ui.showPause(true);
    } else if (this.state === 'paused') {
      this.state = 'playing';
      this.ui.showPause(false);
    }
  }

  quitRun() {
    this.ui.showPause(false);
    this.returnToTitle();
  }

  updateAmbient(dt) {
    if (Math.random() < dt * 0.9) {
      this.particles.push({
        x: Math.random() * MAP_SIZE, y: -0.5, z: 40 + Math.random() * 60,
        vx: 0.25 + Math.random() * 0.4, vy: 0.5 + Math.random() * 0.4, vz: -3 - Math.random() * 3,
        life: 7, max: 7, size: 1.5 + Math.random() * 1.5,
        color: Math.random() > 0.5 ? '#b8914b' : '#8b9a56', gravity: 0, kind: 'leaf'
      });
    }
  }

  burst(x, y, z, count, color, kind) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 0.2 + Math.random() * 1.1;
      this.particles.push({
        x, y, z: z + Math.random() * 8,
        vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
        vz: (Math.random() - 0.3) * 22,
        life: 0.4 + Math.random() * 0.6, max: 1,
        size: 1 + Math.random() * 2.2, color, gravity: 34, kind
      });
    }
  }

  updateParticles(dt) {
    for (const p of this.particles) {
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.z += p.vz * dt;
      p.vz -= (p.gravity || 0) * dt;
      if (p.kind === 'smoke') p.size += dt * 4;
    }
    this.particles = this.particles.filter(p => p.life > 0);
    for (const f of this.floatTexts) {
      f.life -= dt;
      f.z += dt * 18;
    }
    this.floatTexts = this.floatTexts.filter(f => f.life > 0);
  }

  cleanupSelection() {
    this.selected = this.selected.filter(s => {
      if (s.dead) return false;
      if (s.unit) return true;
      return this.buildings.includes(s);
    });
  }

  selectedUnits() {
    return this.selected.filter(s => s.unit && s.team === 'player' && !s.dead);
  }

  selectAt(sx, sy, additive = false) {
    const scale = this.renderer.scale;
    let best = null, bestY = -Infinity;
    for (const u of this.units) {
      if (u.dead) continue;
      const p = this.renderer.worldToScreen(u.x, u.y);
      const dy = sy - p.y;
      if (Math.abs(sx - p.x) < 20 * scale && dy < 10 * scale && dy > -40 * scale) {
        if (u.y > bestY) { bestY = u.y; best = u; }
      }
    }
    if (!best) {
      for (const b of this.buildings) {
        if (b.dead) continue;
        const p = this.renderer.worldToScreen(b.x, b.y);
        const w = b.def.size * this.renderer.tileW * scale * 0.56;
        const h = b.def.size * this.renderer.tileH * scale * 0.56;
        if (Math.abs(sx - p.x) < w && Math.abs(sy - p.y) < h + 28 * scale) { best = b; break; }
      }
    }
    if (best) {
      if (additive && best.unit) {
        if (this.selected.includes(best)) this.selected = this.selected.filter(s => s !== best);
        else this.selected.push(best);
      } else this.selected = [best];
      this.audio.select();
    } else if (!additive) {
      this.selected = [];
    }
    this.ui.sync(true);
  }

  selectBox(rect) {
    const x1 = Math.min(rect.x1, rect.x2), x2 = Math.max(rect.x1, rect.x2);
    const y1 = Math.min(rect.y1, rect.y2), y2 = Math.max(rect.y1, rect.y2);
    const picked = [];
    for (const u of this.units) {
      if (u.team !== 'player' || u.dead) continue;
      const p = this.renderer.worldToScreen(u.x, u.y);
      if (p.x >= x1 && p.x <= x2 && p.y >= y1 - 20 && p.y <= y2) picked.push(u);
    }
    if (picked.length) {
      this.selected = picked;
      this.audio.select();
    } else {
      this.selected = [];
    }
    this.ui.sync(true);
  }

  commandAt(sx, sy) {
    const units = this.selectedUnits();
    if (!units.length) return;
    const w = this.renderer.screenToWorld(sx, sy);
    const enemy = this.units.find(u => u.team === 'enemy' && !u.dead && dist(w.x, w.y, u.x, u.y) < 0.9);
    const node = this.world.nodeAt(w.x, w.y, 0.9);
    const tc = this.townCenter();
    let did = false;
    for (const u of units) {
      if (u.kind === 'villager' && node) {
        this.assignGather(u, node);
        did = true;
      } else if (u.kind === 'villager' && enemy) {
        const shelter = tc ? { x: tc.x, y: tc.y + 0.8 } : { x: u.x, y: u.y };
        u.command = { type: 'move', x: shelter.x, y: shelter.y };
        u.task = null;
        u.target = null;
        did = true;
      } else if (enemy) {
        u.command = { type: 'attack', target: enemy };
        u.target = enemy;
        u.task = null;
        did = true;
      } else {
        u.command = { type: 'move', x: clamp(w.x, 0.3, MAP_SIZE - 0.3), y: clamp(w.y, 0.3, MAP_SIZE - 0.3) };
        u.task = null;
        u.target = null;
        did = true;
      }
    }
    if (did) {
      this.burst(w.x, w.y, 2, 5, '#d9c68e', 'dust');
      this.audio.click();
      this.ui.sync(true);
    }
  }

  pointerDown(e) {
    if (this.state !== 'playing') return;
    const rect = this.canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    this.lastMouse = { x: sx, y: sy };
    if (e.button === 2) {
      if (this.placing) { this.cancelPlacement(); return; }
      this.commandAt(sx, sy);
      return;
    }
    if (e.button !== 0) return;
    if (this.placing) {
      this.updatePlacing(sx, sy);
      this.confirmPlacement();
      return;
    }
    this.pointer = { sx, sy, x: sx, y: sy, moved: false };
  }

  pointerMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    this.lastMouse = { x: sx, y: sy };
    if (this.placing) this.updatePlacing(sx, sy);
    if (this.pointer) {
      this.pointer.x = sx;
      this.pointer.y = sy;
      if (Math.abs(sx - this.pointer.sx) + Math.abs(sy - this.pointer.sy) > 8) this.pointer.moved = true;
      if (this.pointer.moved) this.dragRect = { x1: this.pointer.sx, y1: this.pointer.sy, x2: sx, y2: sy };
    }
  }

  pointerUp(e) {
    if (this.state !== 'playing') return;
    if (e.button !== 0) return;
    if (this.pointer) {
      const rect = this.canvas.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      if (this.pointer.moved) this.selectBox({ x1: this.pointer.sx, y1: this.pointer.sy, x2: sx, y2: sy });
      else this.selectAt(sx, sy, e.shiftKey);
      this.pointer = null;
      this.dragRect = null;
    }
  }

  bindInput() {
    const c = this.canvas;
    c.addEventListener('contextmenu', e => e.preventDefault());
    c.addEventListener('pointerdown', e => this.pointerDown(e));
    c.addEventListener('pointermove', e => this.pointerMove(e));
    c.addEventListener('pointerup', e => this.pointerUp(e));
    c.addEventListener('pointerleave', () => { this.pointer = null; this.dragRect = null; });
    window.addEventListener('keydown', e => {
      if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return;
      const key = e.key.toLowerCase();
      if (this.state === 'title') {
        if (key === 'enter' || key === ' ') { e.preventDefault(); this.startRun(this.difficulty); }
        return;
      }
      if (this.state === 'boon') {
        if (['1', '2', '3'].includes(key)) { e.preventDefault(); this.chooseBoon(parseInt(key, 10) - 1); }
        return;
      }
      if (this.state === 'paused') {
        if (key === 'escape' || key === 'p') this.togglePause();
        return;
      }
      if (this.state === 'gameover' || this.state === 'victory') {
        if (key === 'enter') this.ui.retry();
        return;
      }
      if (key === 'escape') {
        if (this.placing) this.cancelPlacement();
        else if (this.selected.length) { this.selected = []; this.ui.sync(true); }
        else this.togglePause();
      } else if (key === 'p') this.togglePause();
      else if (key === 'm') this.ui.toggleSound();
      else if (key === ' ') { e.preventDefault(); this.callWave(); }
      else if (key === 'q') this.train('villager');
      else if (key === 'w') this.train('militia');
      else if (key === 'e') this.train('archer');
      else if (['1', '2', '3', '4', '5'].includes(key)) {
        const types = ['house', 'farm', 'barracks', 'range', 'tower'];
        this.beginPlacement(types[parseInt(key, 10) - 1]);
      }
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.state === 'playing') this.togglePause();
    });
  }
}
