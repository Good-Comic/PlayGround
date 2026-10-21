import {
  UNIT_TYPES, BUILDING_TYPES, TRAINABLE, WAVES, WAVE_COMPOSITIONS,
  START_RESOURCES, BOONS,
} from './data.js';
import { createWorld } from './world.js';
import { clamp, dist, dist2, iso, lerp, mulberry32, pick, pointInRect, rand, randInt, seedFromDate, formatNumber } from './utils.js';

const DEFAULT_EFFECTS = () => ({
  woodMul: 1, foodMul: 1, goldMul: 1, stoneMul: 1, woodYield: 1,
  farmMul: 1, attackSpeedMul: 1, archerDamageMul: 1, archerRange: 0,
  militarySpeedMul: 1, trainSpeedMul: 1, goldCostMul: 1, buildingHpMul: 1,
  buildSpeedMul: 1, villagerSpeedMul: 1, carryBonus: 0, bountyGold: 0,
  tcRegen: 0, towerRange: 0, towerDamageMul: 1, militaryHpMul: 1,
});

export class Game {
  constructor({ sound } = {}) {
    this.sound = sound;
    this.buildingDefs = BUILDING_TYPES;
    this.unitDefs = UNIT_TYPES;
    this.keys = new Set();
    this.mouse = { x: 0, y: 0, dirty: false };
    this.camera = { x: 0, y: 0, targetX: 0, targetY: 0, zoom: 1.08, targetZoom: 1.08 };
    this.inMenu = true;
    this.paused = false;
    this.phase = 'prep';
    this.hooks = {};
    this.time = 0;
    this.nextId = 1;
    this.selectBoxStart = null;
    this.grabbing = false;
    this.newRun(seedFromDate());
  }

  newRun(seed) {
    this.seed = seed;
    this.world = createWorld(seed);
    this.resources = { ...START_RESOURCES };
    this.effects = DEFAULT_EFFECTS();
    this.buildings = [];
    this.units = [];
    this.projectiles = [];
    this.particles = [];
    this.selection = [];
    this.selected = null;
    this.hovered = null;
    this.hoveredResource = null;
    this.boons = [];
    this.stats = { kills: 0, gathered: 0, trained: 0, waves: 0 };
    this.waveIndex = 0;
    this.phase = 'prep';
    this.prepTotal = 35;
    this.prepTimer = 35;
    this.waveTotal = 0;
    this.waveName = WAVES[0].name;
    this.waveEndTimer = 0;
    this.endShown = false;
    this.dragBox = null;
    this.placement = null;
    this.commandMarkers = [];
    this.rng = mulberry32(seed ^ 0x5f3759df);
    this.time = 0;
    this.runTime = 0;
    this.paused = false;
    this.nextId = 1;
    this.lastWaveAnnounce = -1;
    this.enemyPressure = false;
    this.buildInitialBase();
    const center = iso(this.world.base.x, this.world.base.y);
    this.camera = { x: center.x, y: center.y, targetX: center.x, targetY: center.y, zoom: 1.0, targetZoom: 1.0 };
    this.inMenu = true;
  }

  hook(name, fn) { this.hooks[name] = fn; }
  toast(text, type = '', duration) { this.hooks.toast?.(text, type, duration); }

  buildInitialBase() {
    this.addBuilding('towncenter', 23, 25, true);
    this.addBuilding('barracks', 18, 28, true);
    this.addBuilding('house', 28, 21, true);
    this.addBuilding('house', 30, 23, true);
    this.addBuilding('house', 27, 30, true);
    this.addBuilding('tower', 20, 21, true);
    this.addBuilding('farm', 31, 28, true);

    const villagers = [
      this.spawnUnit('villager', 22.2, 29.2),
      this.spawnUnit('villager', 23.3, 29.5),
      this.spawnUnit('villager', 25.1, 29.4),
      this.spawnUnit('villager', 26.1, 28.7),
      this.spawnUnit('villager', 21.1, 27.7),
      this.spawnUnit('villager', 20.2, 26.9),
    ];
    this.spawnUnit('militia', 21.2, 24.2);
    this.spawnUnit('militia', 22.1, 24.7);
    this.spawnUnit('archer', 27.1, 24.6);
    this.spawnUnit('knight', 27.4, 25.8);

    const wood1 = this.findResource('wood', 18.5, 22);
    const wood2 = this.findResource('wood', 30.4, 29.8);
    const food1 = this.findResource('food', 29.4, 21.1);
    const food2 = this.findResource('food', 20, 29.5);
    const gold = this.findResource('gold', 18, 23);
    const stone = this.findResource('stone', 21.5, 32);
    if (wood1) this.orderGather(villagers[0], wood1);
    if (wood2) this.orderGather(villagers[1], wood2);
    if (food1) this.orderGather(villagers[2], food1);
    if (food2) this.orderGather(villagers[3], food2);
    if (gold) this.orderGather(villagers[4], gold);
    if (stone) this.orderGather(villagers[5], stone);
  }

  start() {
    this.inMenu = false;
    this.camera.targetZoom = 1.12;
    this.paused = false;
    this.toast('Survive five raids. The Town Center must not fall.', '', 4600);
    setTimeout(() => this.toast('Right-click trees, berries, gold, or stone to gather.', '', 4200), 1400);
  }

  focusAt(x, y) {
    const p = iso(clamp(x, 0.5, this.world.size - 0.5), clamp(y, 0.5, this.world.size - 0.5));
    this.camera.targetX = p.x;
    this.camera.targetY = p.y;
  }

  getTownCenter() { return this.buildings.find(b => b.type === 'towncenter' && b.team === 'player' && b.alive); }
  get population() { return this.units.filter(u => u.alive && u.team === 'player').reduce((s, u) => s + u.typeDef.pop, 0); }
  get popCap() { return this.buildings.filter(b => b.alive && b.team === 'player' && b.construction >= 1).reduce((s, b) => s + (b.typeDef.pop || 0), 0); }
  get idleVillagers() { return this.units.filter(u => u.alive && u.team === 'player' && u.type === 'villager' && (u.state === 'idle' || u.state === 'hold')).length; }
  get enemiesAlive() { return this.units.filter(u => u.alive && u.team === 'enemy').length; }
  get ownedUnitCount() { return this.units.filter(u => u.alive && u.team === 'player').length; }

  addBuilding(type, x, y, instant = false) {
    const def = BUILDING_TYPES[type];
    const newMaxHp = Math.round(def.hp * (type === 'towncenter' || type === 'house' ? 1 : this.effects.buildingHpMul));
    const b = {
      id: this.nextId++, kind: 'building', team: 'player', type, typeDef: def,
      x, y, w: def.w, h: def.h, hp: instant ? newMaxHp : Math.round(newMaxHp * 0.14),
      maxHp: newMaxHp, construction: instant ? 1 : 0.02, alive: true, selected: false,
      queue: [], cooldown: this.rng() * 0.5, rally: null, hitFlash: 0,
    };
    this.buildings.push(b);
    return b;
  }

  spawnUnit(type, x, y, team = 'player', options = {}) {
    const def = UNIT_TYPES[type];
    const hpMul = team === 'player' && type !== 'villager' ? this.effects.militaryHpMul : 1;
    const maxHp = Math.round(def.hp * hpMul);
    const u = {
      id: this.nextId++, kind: 'unit', team, type, typeDef: def,
      x: clamp(x, 0.6, this.world.size - 0.6), y: clamp(y, 0.6, this.world.size - 0.6),
      hp: maxHp, maxHp, state: 'idle', target: null, targetPos: null, gatherTarget: null,
      buildTarget: null, carry: 0, carryType: null, cooldown: this.rng() * 0.4,
      attackAnim: 0, walkPhase: this.rng() * 6.28, facing: 1, selected: false,
      hitFlash: 0, alive: true, retargetTimer: this.rng() * 0.8, hold: false,
      idleTimer: this.rng(), buildingHint: options.buildingHint || null,
    };
    this.units.push(u);
    return u;
  }

  findResource(resource, nearX, nearY) {
    let best = null, bestD = Infinity;
    for (const n of this.world.resources) {
      if (!n.alive || n.resource !== resource) continue;
      const d = dist2(n.x, n.y, nearX, nearY);
      if (d < bestD) { bestD = d; best = n; }
    }
    return best;
  }

  orderGather(u, node) {
    if (!u || !node || !node.alive) return;
    u.state = 'gather';
    u.gatherTarget = node;
    u.target = null;
    u.targetPos = { x: node.x, y: node.y };
  }

  distanceTo(u, target) {
    if (target.w) {
      const dx = Math.max(target.x - u.x, 0, u.x - (target.x + target.w));
      const dy = Math.max(target.y - u.y, 0, u.y - (target.y + target.h));
      return Math.hypot(dx, dy);
    }
    return dist(u.x, u.y, target.x, target.y);
  }

  unitRange(u) {
    let r = u.typeDef.range;
    if (u.team === 'player' && u.type === 'archer') r += this.effects.archerRange;
    return r;
  }

  damageMul(u) {
    if (u.team !== 'player') return 1;
    if (u.type === 'archer') return this.effects.archerDamageMul;
    return 1;
  }

  unitSpeed(u) {
    let s = u.typeDef.speed;
    if (u.team === 'player') {
      if (u.type === 'villager') s *= this.effects.villagerSpeedMul;
      else s *= this.effects.militarySpeedMul;
    }
    return s;
  }

  unitCost(type) {
    const def = UNIT_TYPES[type];
    const cost = { ...def.cost };
    if (cost.gold) cost.gold = Math.round(cost.gold * this.effects.goldCostMul);
    return cost;
  }

  canAfford(cost) { return Object.entries(cost).every(([k, v]) => this.resources[k] >= v); }
  pay(cost) { for (const [k, v] of Object.entries(cost)) this.resources[k] -= v; }

  update(dt) {
    dt = Math.min(dt, 0.05);
    this.time += dt;
    this.updateCamera(dt);
    if (this.inMenu || this.paused) { this.updateParticles(dt); return; }
    if (this.phase === 'victory' || this.phase === 'defeat') { this.updateParticles(dt); return; }

    if (this.phase === 'prep') {
      this.prepTimer -= dt;
      this.runTime += dt;
      if (this.prepTimer <= 0) this.startWave();
    } else if (this.phase === 'wave') {
      this.runTime += dt;
      if (this.enemiesAlive === 0 && this.waveTotal > 0) {
        if (this.waveEndTimer <= 0) this.waveEndTimer = 1.4;
      }
    } else if (this.phase === 'boon') {
      this.runTime += dt * 0;
    }

    if (this.waveEndTimer > 0) {
      this.waveEndTimer -= dt;
      if (this.waveEndTimer <= 0) {
        this.waveEndTimer = 0;
        this.completeWave();
      }
    }

    this.updateBuildings(dt);
    this.updateUnits(dt);
    this.updateProjectiles(dt);
    this.updateParticles(dt);
    this.updateMarkers(dt);
    this.recalcSelection();
    this.enemyPressure = this.units.some(u => u.alive && u.team === 'enemy' && dist(u.x, u.y, this.world.base.x, this.world.base.y) < 8.5);
    this.refreshHover();
  }

  updateCamera(dt) {
    const speed = 720 / this.camera.zoom;
    let dx = 0, dy = 0;
    if (this.keys.has('a') || this.keys.has('arrowleft')) dx -= 1;
    if (this.keys.has('d') || this.keys.has('arrowright')) dx += 1;
    if (this.keys.has('w') || this.keys.has('arrowup')) dy -= 1;
    if (this.keys.has('s') || this.keys.has('arrowdown')) dy += 1;
    if (dx || dy) {
      const len = Math.hypot(dx, dy) || 1;
      this.camera.targetX += dx / len * speed * dt;
      this.camera.targetY += dy / len * speed * dt;
    }
    const b = iso(this.world.base.x, this.world.base.y);
    this.camera.targetX = clamp(this.camera.targetX, -this.world.size * 12, this.world.size * 12);
    this.camera.targetY = clamp(this.camera.targetY, -200, this.world.size * 34);
    const k = 1 - Math.pow(0.001, dt);
    this.camera.x = lerp(this.camera.x, this.camera.targetX, k);
    this.camera.y = lerp(this.camera.y, this.camera.targetY, k);
    this.camera.zoom = lerp(this.camera.zoom, this.camera.targetZoom, 1 - Math.pow(0.002, dt));
  }

  updateBuildings(dt) {
    const tc = this.getTownCenter();
    if (tc && this.effects.tcRegen > 0 && tc.hp < tc.maxHp) {
      tc.hp = Math.min(tc.maxHp, tc.hp + this.effects.tcRegen * dt);
    }
    for (const b of this.buildings) {
      if (!b.alive) continue;
      if (b.construction < 1) {
        b.hp = Math.min(b.maxHp, b.hp + b.maxHp * dt * 0.05);
        continue;
      }
      if (b.type === 'farm' && b.team === 'player') {
        b.foodStore = (b.foodStore || 0) + this.effects.farmMul * this.effects.foodMul * 0.16 * dt;
        if (b.foodStore > 1) {
          const gain = b.foodStore;
          b.foodStore -= gain;
          this.resources.food += gain;
          this.stats.gathered += gain;
        }
        continue;
      }
      if (b.type === 'towncenter' || b.type === 'tower') {
        b.cooldown -= dt;
        if (b.cooldown <= 0) {
          const range = b.type === 'tower' ? b.typeDef.range + this.effects.towerRange : b.typeDef.range;
          const target = this.nearestEnemyAt(b.x + b.w / 2, b.y + b.h / 2, range);
          if (target) {
            const damage = b.typeDef.attack * (b.type === 'tower' ? this.effects.towerDamageMul : 1);
            this.spawnProjectile(b.x + b.w / 2, b.y + b.h / 2 - 0.5, target, damage, 'player', 0.9);
            b.cooldown = b.typeDef.cooldown;
            this.sound?.arrow();
          } else {
            b.cooldown = 0.25;
          }
        }
      }
      if (b.queue.length) {
        const item = b.queue[0];
        item.remaining -= dt;
        if (item.remaining <= 0) {
          const angle = this.rng() * Math.PI * 2;
          const sx = b.x + b.w / 2 + Math.cos(angle) * (b.w / 2 + 0.8);
          const sy = b.y + b.h / 2 + Math.sin(angle) * (b.h / 2 + 0.8);
          const unit = this.spawnUnit(item.type, sx, sy, 'player');
          this.stats.trained++;
          if (item.type === 'villager') {
            const node = this.findResource('wood', sx, sy) || this.findResource('food', sx, sy);
            if (node) this.orderGather(unit, node);
          }
          b.queue.shift();
          this.sound?.complete();
          this.addParticles(sx, sy, 'ring', 'rgba(235,207,132,ALPHA)', 8);
          if (this.selection.includes(b)) this.hooks.selectionChanged?.();
        }
      }
    }
  }

  updateUnits(dt) {
    for (const u of this.units) {
      if (!u.alive) continue;
      u.cooldown = Math.max(0, u.cooldown - dt);
      u.attackAnim = Math.max(0, u.attackAnim - dt * 5.5);
      u.hitFlash = Math.max(0, u.hitFlash - dt * 5);
      if (u.team === 'enemy') this.updateEnemy(u, dt);
      else this.updatePlayerUnit(u, dt);
    }
  }

  updateEnemy(u, dt) {
    u.retargetTimer -= dt;
    const targetValid = u.target && u.target.alive;
    if (!targetValid || u.retargetTimer <= 0) {
      u.retargetTimer = 0.9 + this.rng() * 0.5;
      const tc = this.getTownCenter();
      const playerUnits = this.units.filter(o => o.alive && o.team === 'player');
      let best = null, bestD = Infinity;
      for (const o of playerUnits) {
        const d = dist2(u.x, u.y, o.x, o.y);
        if (d < bestD && d < 49) { best = o; bestD = d; }
      }
      if (best) u.target = best;
      else if (tc) u.target = tc;
      else u.target = null;
    }
    if (!u.target) return;
    const target = u.target;
    const d = this.distanceTo(u, target);
    const range = this.unitRange(u) + (target.w ? 0 : target.typeDef.radius || 0.2);
    if (d <= range) {
      u.state = 'attack';
      if (u.cooldown <= 0) this.attackUnit(u, target);
    } else {
      u.state = 'move';
      this.stepToward(u, target.x + (target.w ? target.w / 2 : 0), target.y + (target.h ? target.h / 2 : 0), dt);
      this.tryAutoAttack(u, target);
    }
  }

  tryAutoAttack(u, preferred) {
    if (u.cooldown > 0) return;
    const range = this.unitRange(u);
    const d = this.distanceTo(u, preferred) + (preferred.w ? 0 : (preferred.typeDef.radius || 0.2));
    if (d <= range + 0.3) {
      this.attackUnit(u, preferred);
    } else if (u.typeDef.range < 2) {
      const near = this.nearestEnemyAt(u.x, u.y, 1.2);
      if (near) this.attackUnit(u, near);
    }
  }

  updatePlayerUnit(u, dt) {
    if (u.state === 'gather') return this.updateGather(u, dt);
    if (u.state === 'return') return this.updateReturn(u, dt);
    if (u.state === 'build') return this.updateBuild(u, dt);
    if (u.state === 'attack' && u.target?.alive) return this.updateAttack(u, dt);
    if (u.state === 'move') {
      const arrived = this.moveAlong(u, dt);
      if (arrived) {
        u.state = u.hold ? 'hold' : 'idle';
        u.targetPos = null;
        u.idleTimer = 0;
      }
      return;
    }
    if (u.state === 'hold') {
      if (u.type !== 'villager') {
        const near = this.nearestEnemyAt(u.x, u.y, Math.max(1.4, this.unitRange(u)));
        if (near) { u.target = near; u.state = 'attack'; }
      }
      return;
    }
    if (u.state === 'idle') {
      if (u.type !== 'villager') {
        const near = this.nearestEnemyAt(u.x, u.y, u.typeDef.sight * 0.72);
        if (near) {
          u.target = near;
          u.state = 'attack';
          u.retargetTimer = 0.8;
          return;
        }
      }
      u.idleTimer += dt;
    }
  }

  updateAttack(u, dt) {
    const target = u.target;
    if (!target || !target.alive) { u.state = u.hold ? 'hold' : 'idle'; u.target = null; return; }
    const d = this.distanceTo(u, target);
    const range = this.unitRange(u) + (target.w ? -0.1 : (target.typeDef.radius || 0.2));
    if (d <= range) {
      if (u.cooldown <= 0) this.attackUnit(u, target);
    } else {
      this.stepToward(u, target.x + (target.w ? target.w / 2 : 0), target.y + (target.h ? target.h / 2 : 0), dt);
    }
    if (u.retargetTimer !== undefined) {
      u.retargetTimer -= dt;
      if (u.retargetTimer <= 0) {
        u.retargetTimer = 0.7;
        const near = this.nearestEnemyAt(u.x, u.y, Math.max(4, this.unitRange(u) + 2));
        if (near && dist2(near.x, near.y, target.x, target.y) < 16) u.target = near;
      }
    }
  }

  updateGather(u, dt) {
    const node = u.gatherTarget;
    if (!node || !node.alive) {
      u.state = 'idle';
      u.gatherTarget = null;
      u.targetPos = null;
      return;
    }
    const range = this.unitRange(u) + node.radius + 0.2;
    const d = dist(u.x, u.y, node.x, node.y);
    if (d > range) {
      this.stepToward(u, node.x, node.y, dt);
      return;
    }
    u.state = 'gather';
    const cap = 10 + this.effects.carryBonus;
    if (u.carry >= cap) {
      this.beginReturn(u);
      return;
    }
    let rate = 1.25;
    if (node.resource === 'wood') rate *= this.effects.woodMul;
    else if (node.resource === 'food') rate *= this.effects.foodMul;
    else if (node.resource === 'gold') rate *= this.effects.goldMul;
    else if (node.resource === 'stone') rate *= this.effects.stoneMul;
    const amount = Math.min(rate * dt, cap - u.carry, node.amount);
    u.carry += amount;
    u.carryType = node.resource;
    node.amount = Math.max(0, node.amount - amount);
    u.walkPhase += dt * 2.2;
    if (this.time - (u.gatherSoundAt || 0) > 0.55) {
      u.gatherSoundAt = this.time;
      if (node.resource === 'wood') this.sound?.chop(); else this.sound?.gather();
      this.addParticles(node.x + rand(this.rng, -0.2, 0.2), node.y, 'spark', resourceParticle(node.resource), 1, 2 + this.rng() * 3);
    }
    if (node.amount <= 0) {
      this.depleteNode(node);
      if (u.carry > 0) this.beginReturn(u);
      else { u.state = 'idle'; u.gatherTarget = null; }
    } else if (u.carry >= cap) {
      this.beginReturn(u);
    }
  }

  beginReturn(u) {
    const drop = this.nearestDropoff(u.x, u.y);
    if (!drop) { u.state = 'idle'; return; }
    u.state = 'return';
    u.dropTarget = drop;
    u.targetPos = { x: drop.x + drop.w / 2, y: drop.y + drop.h / 2 };
  }

  nearestDropoff(x, y) {
    let best = null, bestD = Infinity;
    for (const b of this.buildings) {
      if (!b.alive || b.team !== 'player' || b.construction < 1 || !b.typeDef.dropoff) continue;
      const d = dist2(x, y, b.x + b.w / 2, b.y + b.h / 2);
      if (d < bestD) { bestD = d; best = b; }
    }
    return best;
  }

  updateReturn(u, dt) {
    const drop = u.dropTarget;
    if (!drop || !drop.alive) {
      const other = this.nearestDropoff(u.x, u.y);
      if (!other) { u.state = 'idle'; return; }
      u.dropTarget = other;
      return;
    }
    const d = dist(u.x, u.y, drop.x + drop.w / 2, drop.y + drop.h / 2);
    if (d > 1.5) {
      this.moveAlong(u, dt);
      return;
    }
    if (u.carry > 0) {
      const type = u.carryType || 'food';
      let amount = u.carry;
      if (type === 'wood') amount *= this.effects.woodYield;
      this.resources[type] = (this.resources[type] || 0) + amount;
      this.stats.gathered += amount;
      this.addFloating(drop.x + drop.w / 2, drop.y + drop.h / 2, `+${Math.round(amount)} ${resourceShort(type)}`, resourceText(type));
      this.sound?.deposit();
      u.carry = 0;
      u.carryType = null;
    }
    if (u.gatherTarget?.alive && u.gatherTarget.amount > 0) {
      u.state = 'gather';
      u.targetPos = { x: u.gatherTarget.x, y: u.gatherTarget.y };
    } else {
      u.state = 'idle';
      u.gatherTarget = null;
      u.targetPos = null;
      u.idleTimer = 0;
    }
  }

  updateBuild(u, dt) {
    const b = u.buildTarget;
    if (!b || !b.alive || b.construction >= 1) {
      u.state = 'idle';
      u.buildTarget = null;
      u.targetPos = null;
      return;
    }
    const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
    const d = dist(u.x, u.y, cx, cy);
    if (d > 1.6) {
      this.stepToward(u, cx, cy, dt);
      return;
    }
    u.state = 'build';
    const buildTime = b.typeDef.buildTime * (b.type === 'towncenter' ? 0.7 : 1);
    b.construction = Math.min(1, b.construction + dt * this.effects.buildSpeedMul / Math.max(2, buildTime));
    b.hp = Math.min(b.maxHp, b.maxHp * (0.14 + b.construction * 0.86));
    u.walkPhase += dt * 7;
    if (this.time - (u.buildSoundAt || 0) > 0.75) {
      u.buildSoundAt = this.time;
      this.sound?.build();
      this.addParticles(cx + rand(this.rng, -0.6, 0.6), cy, 'spark', 'rgba(221,186,108,ALPHA)', 1.2, 2);
    }
    if (b.construction >= 1) {
      b.hp = b.maxHp;
      this.sound?.complete();
      this.addFloating(cx, cy, `${b.typeDef.name} raised`, 'rgba(229,204,138,ALPHA)');
      this.toast(`${b.typeDef.name} completed.`, 'good', 2200);
      u.state = 'idle';
      u.buildTarget = null;
      u.targetPos = null;
      if (this.selection.includes(b)) this.hooks.selectionChanged?.();
    }
  }

  depleteNode(node) {
    node.alive = false;
    node.amount = 0;
    if (node.kind === 'oak' || node.kind === 'pine') {
      this.world.props.push({ kind: 'stump', x: node.x, y: node.y, angle: this.rng() * 6 });
    }
    this.addParticles(node.x, node.y, 'spark', 'rgba(208,190,145,ALPHA)', 1.2, 8, 0.7);
  }

  moveAlong(u, dt) {
    if (!u.targetPos) return true;
    const dx = u.targetPos.x - u.x, dy = u.targetPos.y - u.y;
    const d = Math.hypot(dx, dy);
    const speed = this.unitSpeed(u);
    if (d < 0.08) return true;
    const step = Math.min(d, speed * dt);
    this.stepToward(u, u.targetPos.x, u.targetPos.y, dt);
    return step >= d - 0.04;
  }

  stepToward(u, tx, ty, dt) {
    const dx = tx - u.x, dy = ty - u.y;
    const d = Math.hypot(dx, dy);
    if (d < 0.001) return;
    const speed = this.unitSpeed(u);
    const nx = u.x + dx / d * speed * dt;
    const ny = u.y + dy / d * speed * dt;
    if (this.isWalkable(nx, ny, u)) {
      u.x = nx; u.y = ny;
    } else if (this.isWalkable(nx, u.y, u)) {
      u.x = nx;
    } else if (this.isWalkable(u.x, ny, u)) {
      u.y = ny;
    } else {
      u.stuck = (u.stuck || 0) + dt;
      if (u.stuck > 0.5) {
        const side = Math.sin(u.id * 2.3 + this.time) > 0 ? 1 : -1;
        const px = -dy / d * side, py = dx / d * side;
        const sx = u.x + px * speed * dt, sy = u.y + py * speed * dt;
        if (this.isWalkable(sx, sy, u)) { u.x = sx; u.y = sy; }
        u.stuck = 0;
      }
    }
    u.walkPhase += speed * dt * 5.3;
    u.facing = dx >= 0 ? 1 : -1;
  }

  isWalkable(x, y, u) {
    if (x < 0.5 || y < 0.5 || x > this.world.size - 0.5 || y > this.world.size - 0.5) return false;
    const tile = this.world.tile(x, y);
    if (!tile || tile.terrain === 'water') return false;
    for (const b of this.buildings) {
      if (!b.alive) continue;
      if (x > b.x - 0.12 && x < b.x + b.w + 0.12 && y > b.y - 0.12 && y < b.y + b.h + 0.12) return false;
    }
    return true;
  }

  nearestEnemyAt(x, y, range) {
    let best = null, bestD = range * range;
    for (const e of this.units) {
      if (!e.alive || e.team !== 'enemy') continue;
      const d = dist2(e.x, e.y, x, y);
      if (d < bestD) { bestD = d; best = e; }
    }
    if (!best) {
      for (const b of this.buildings) {
        if (!b.alive || b.team !== 'enemy') continue;
        const dx = Math.max(b.x - x, 0, x - (b.x + b.w));
        const dy = Math.max(b.y - y, 0, y - (b.y + b.h));
        const d = dx * dx + dy * dy;
        if (d < bestD) { bestD = d; best = b; }
      }
    }
    return best;
  }

  nearestPlayerTarget(x, y, range) {
    let best = null, bestD = range * range;
    for (const e of this.units) {
      if (!e.alive || e.team !== 'player') continue;
      const d = dist2(e.x, e.y, x, y);
      if (d < bestD) { bestD = d; best = e; }
    }
    return best;
  }

  attackUnit(u, target) {
    if (!target || !target.alive) return;
    const def = u.typeDef;
    u.attackAnim = 1;
    u.cooldown = def.cooldown / (u.team === 'player' && u.type !== 'villager' ? this.effects.attackSpeedMul : 1);
    u.state = 'attack';
    u.target = target;
    if (def.projectile) {
      const damage = def.attack * this.damageMul(u);
      this.spawnProjectile(u.x, u.y - 0.4, target, damage, u.team, 1);
      this.sound?.arrow();
    } else {
      const damage = def.attack * this.damageMul(u);
      setTimeout(() => {
        if (!this.paused && target.alive) this.applyDamage(target, damage, u);
      }, 140);
      this.sound?.attack();
      if (u.team === 'player' && this.selection.includes(u)) {
        this.addParticles(target.x, target.y, 'slash', 'rgba(244,226,178,ALPHA)', 1, 1, 0.35);
      }
    }
  }

  spawnProjectile(x, y, target, damage, team, scale = 1) {
    this.projectiles.push({
      x, y, target, tx: target.x + (target.w ? target.w / 2 : 0), ty: target.y + (target.h ? target.h / 2 : 0),
      team, damage, speed: 8.4, alive: true, scale,
    });
  }

  updateProjectiles(dt) {
    for (const p of this.projectiles) {
      if (!p.alive) continue;
      const target = p.target;
      if (!target || !target.alive) { p.alive = false; continue; }
      p.tx = target.x + (target.w ? target.w / 2 : 0);
      p.ty = target.y + (target.h ? target.h / 2 : 0);
      const dx = p.tx - p.x, dy = p.ty - p.y;
      const d = Math.hypot(dx, dy);
      if (d < 0.24) {
        p.alive = false;
        this.applyDamage(target, p.damage, null);
        this.sound?.hit();
        this.addParticles(p.tx, p.ty, 'spark', 'rgba(230,213,171,ALPHA)', 1, 4, 0.7);
        continue;
      }
      const step = Math.min(d, p.speed * dt);
      p.x += dx / d * step; p.y += dy / d * step;
    }
    this.projectiles = this.projectiles.filter(p => p.alive);
  }

  applyDamage(target, amount, source) {
    if (!target.alive) return;
    target.hp -= amount;
    target.hitFlash = 1;
    this.addParticles(target.x + (target.w ? target.w / 2 : 0), target.y + (target.h ? target.h / 2 : 0), 'spark', 'rgba(178,64,49,ALPHA)', 1, 4, 0.5);
    if (target.hp <= 0) this.killEntity(target, source);
  }

  killEntity(target, source) {
    target.alive = false;
    target.selected = false;
    if (target.w) {
      this.addParticles(target.x + target.w / 2, target.y + target.h / 2, 'smoke', 'rgba(67,58,45,ALPHA)', 6, 12, 1.4);
      this.addParticles(target.x + target.w / 2, target.y + target.h / 2, 'spark', 'rgba(212,128,75,ALPHA)', 2, 14, 1.0);
      if (target.type === 'towncenter') this.triggerDefeat();
      if (target.team === 'player') this.toast(`${target.typeDef.name} destroyed!`, 'bad', 3200);
    } else {
      this.addParticles(target.x, target.y, 'spark', 'rgba(157,58,45,ALPHA)', 1.2, 8, 0.7);
      this.addParticles(target.x, target.y, 'smoke', 'rgba(61,48,36,ALPHA)', 3, 4, 1.1);
      this.addFloating(target.x, target.y, 'slain', 'rgba(216,190,150,ALPHA)');
      if (target.team === 'enemy') {
        this.stats.kills++;
        const bounty = (target.typeDef.bounty || 0) + this.effects.bountyGold;
        this.resources.gold += bounty;
        if (bounty > 0) this.addFloating(target.x, target.y, `+${Math.round(bounty)}g`, 'rgba(223,190,102,ALPHA)');
        this.sound?.hit();
      }
    }
    this.recalcSelection();
  }

  recalcSelection() {
    const alive = this.selection.filter(e => e.alive);
    if (alive.length !== this.selection.length) {
      this.selection = alive;
      for (const e of alive) e.selected = true;
      this.hooks.selectionChanged?.();
    }
  }

  triggerDefeat() {
    if (this.phase === 'defeat' || this.phase === 'victory') return;
    this.phase = 'defeat';
    this.paused = false;
    this.sound?.defeat();
    setTimeout(() => this.showEnd(false), 1300);
  }

  triggerVictory() {
    if (this.phase === 'defeat' || this.phase === 'victory') return;
    this.phase = 'victory';
    this.sound?.victory();
    this.stats.waves = 5;
    setTimeout(() => this.showEnd(true), 1600);
  }

  showEnd(victory) {
    if (this.endShown) return;
    this.endShown = true;
    this.hooks.end?.(victory, {
      waves: victory ? 5 : this.waveIndex,
      kills: this.stats.kills,
      gathered: this.stats.gathered,
      time: this.runTime,
    });
  }

  startWave() {
    this.phase = 'wave';
    this.waveName = WAVES[Math.min(this.waveIndex, WAVES.length - 1)].name;
    const comp = WAVE_COMPOSITIONS[Math.min(this.waveIndex, WAVE_COMPOSITIONS.length - 1)];
    const campCount = this.waveIndex === 0 ? 1 : this.waveIndex < 3 ? 2 : 3;
    const camps = [...this.world.camps].slice(0, campCount);
    let count = 0;
    for (const n of Object.values(comp)) count += n;
    this.waveTotal = count;
    this.waveEndTimer = 0;
    let index = 0;
    for (const [type, num] of Object.entries(comp)) {
      for (let i = 0; i < num; i++) {
        const camp = camps[index % camps.length];
        const angle = this.rng() * Math.PI * 2;
        const radius = 1.4 + this.rng() * 2.2;
        let sx = camp.x + Math.cos(angle) * radius;
        let sy = camp.y + Math.sin(angle) * radius;
        if (!this.isWalkable(sx, sy, { team: 'enemy' })) {
          sx = camp.x + rand(this.rng, -1, 1);
          sy = camp.y + rand(this.rng, -1, 1);
        }
        const u = this.spawnUnit(type, sx, sy, 'enemy');
        u.target = this.getTownCenter();
        u.state = 'move';
        index++;
      }
    }
    this.sound?.horn();
    const dirs = camps.map(c => c.name.replace('The ', '')).join(' and ');
    this.toast(`Raiders approach from ${dirs}.`, 'bad', 4200);
    if (this.waveIndex === 4) setTimeout(() => this.toast('Vask the Unburnt has entered the field.', 'bad', 5000), 900);
  }

  completeWave() {
    if (this.waveIndex >= 4) {
      this.triggerVictory();
      return;
    }
    this.stats.waves = this.waveIndex + 1;
    const reward = { food: 100 + this.waveIndex * 20, wood: 80 + this.waveIndex * 20, gold: 55 + this.waveIndex * 15 };
    this.resources.food += reward.food;
    this.resources.wood += reward.wood;
    this.resources.gold += reward.gold;
    for (const u of this.units) {
      if (u.alive && u.team === 'player') u.hp = Math.min(u.maxHp, u.hp + u.maxHp * 0.25);
    }
    for (const b of this.buildings) {
      if (b.alive && b.team === 'player') b.hp = Math.min(b.maxHp, b.hp + b.maxHp * 0.12);
    }
    this.phase = 'boon';
    this.toast(`Raid broken. Spoils: +${reward.food} food, +${reward.wood} wood, +${reward.gold} gold.`, 'good', 3800);
    const choices = this.pickBoons();
    this.hooks.boons?.(choices, boon => this.chooseBoon(boon));
  }

  pickBoons() {
    const available = BOONS.filter(b => !this.boons.some(c => c.id === b.id));
    const chosen = [];
    const pool = [...available];
    while (chosen.length < 3 && pool.length) {
      const idx = Math.floor(this.rng() * pool.length);
      chosen.push(pool.splice(idx, 1)[0]);
    }
    return chosen;
  }

  chooseBoon(boon) {
    if (!boon) return;
    boon.apply(this);
    this.boons.push(boon);
    this.waveIndex++;
    this.waveName = WAVES[Math.min(this.waveIndex, WAVES.length - 1)].name;
    this.phase = 'prep';
    this.prepTotal = 26;
    this.prepTimer = 26;
    this.camera.targetZoom = 1.12;
    this.toast(`Boon claimed: ${boon.name}.`, 'good', 3800);
    this.hooks.selectionChanged?.();
  }

  beginPlacement(type) {
    if (!BUILDING_TYPES[type]) return;
    const cost = BUILDING_TYPES[type].cost;
    if (!this.canAfford(cost)) { this.sound?.error(); this.toast(`Not enough resources for ${BUILDING_TYPES[type].name}.`, 'bad', 2200); return; }
    if (!this.selection.some(e => e.team === 'player' && e.type === 'villager')) {
      this.sound?.error();
      this.toast('Select a villager to raise this structure.', 'bad', 2200);
      return;
    }
    const worldPos = this.mouseWorld();
    this.placement = { type, x: Math.round(worldPos.x - BUILDING_TYPES[type].w / 2), y: Math.round(worldPos.y - BUILDING_TYPES[type].h / 2), valid: false };
    this.updatePlacementValidity();
    this.hooks.placement?.(this.placement);
    this.sound?.select();
  }

  cancelPlacement() {
    if (!this.placement) return;
    this.placement = null;
    this.hooks.placement?.(null);
  }

  updatePlacementValidity() {
    if (!this.placement) return;
    const def = BUILDING_TYPES[this.placement.type];
    const { x, y } = this.placement;
    let valid = x >= 1 && y >= 1 && x + def.w < this.world.size - 1 && y + def.h < this.world.size - 1;
    if (valid) {
      for (let ty = y; ty < y + def.h; ty++) {
        for (let tx = x; tx < x + def.w; tx++) {
          const tile = this.world.tile(tx + 0.5, ty + 0.5);
          if (!tile || tile.terrain === 'water' || tile.terrain === 'sand' || tile.terrain === 'rock') valid = false;
        }
      }
    }
    if (valid) {
      for (const b of this.buildings) {
        if (!b.alive) continue;
        if (x < b.x + b.w && x + def.w > b.x && y < b.y + b.h && y + def.h > b.y) valid = false;
      }
    }
    if (valid) {
      for (const n of this.world.resources) {
        if (!n.alive) continue;
        if (n.x > x - 0.35 && n.x < x + def.w + 0.35 && n.y > y - 0.35 && n.y < y + def.h + 0.35) valid = false;
      }
    }
    if (valid && !this.canAfford(def.cost)) valid = false;
    this.placement.valid = valid;
  }

  placeCurrent() {
    if (!this.placement) return false;
    this.updatePlacementValidity();
    if (!this.placement.valid) {
      this.sound?.error();
      this.toast('Cannot raise that structure here.', 'bad', 1900);
      return false;
    }
    const type = this.placement.type;
    const def = BUILDING_TYPES[type];
    this.pay(def.cost);
    const b = this.addBuilding(type, this.placement.x, this.placement.y, false);
    const builders = this.selection.filter(e => e.alive && e.team === 'player' && e.type === 'villager');
    for (const v of builders) {
      v.buildTarget = b;
      v.state = 'build';
      v.target = null;
      v.gatherTarget = null;
      v.targetPos = { x: b.x + b.w / 2, y: b.y + b.h / 2 };
    }
    this.placement = null;
    this.hooks.placement?.(null);
    this.sound?.command();
    this.toast(`${def.name} under construction.`, '', 2200);
    return true;
  }

  updatePlacementAtMouse() {
    if (!this.placement) return;
    const worldPos = this.mouseWorld();
    this.placement.x = Math.round(worldPos.x - BUILDING_TYPES[this.placement.type].w / 2);
    this.placement.y = Math.round(worldPos.y - BUILDING_TYPES[this.placement.type].h / 2);
    this.updatePlacementValidity();
  }

  command(id) {
    if (id.startsWith('build:')) { this.beginPlacement(id.slice(6)); return; }
    if (id.startsWith('train:')) {
      const b = this.selection[0];
      if (b?.w && b.team === 'player') this.trainUnit(b, id.slice(6));
      return;
    }
    const units = this.selection.filter(e => e.team === 'player' && !e.w);
    if (id === 'stop') {
      for (const u of units) {
        u.state = 'idle'; u.target = null; u.targetPos = null; u.gatherTarget = null; u.buildTarget = null; u.hold = false;
      }
      this.sound?.command();
    } else if (id === 'hold') {
      for (const u of units) {
        if (u.type === 'villager') continue;
        u.state = 'hold'; u.hold = true; u.targetPos = null; u.target = null;
      }
      this.sound?.command();
    }
  }

  trainUnit(building, type) {
    if (building.construction < 1) return;
    if (!TRAINABLE[building.type]?.includes(type)) return;
    const def = UNIT_TYPES[type];
    const cost = this.unitCost(type);
    const queuedPop = building.queue.reduce((s, q) => s + UNIT_TYPES[q.type].pop, 0);
    if (!this.canAfford(cost)) { this.sound?.error(); this.toast(`Not enough resources for ${def.name}.`, 'bad', 2000); return; }
    if (this.population + queuedPop + def.pop > this.popCap) { this.sound?.error(); this.toast('Population limit reached. Raise more houses.', 'bad', 2400); return; }
    if (building.queue.length >= 5) { this.sound?.error(); this.toast('Training queue is full.', 'bad', 2000); return; }
    this.pay(cost);
    const time = def.trainTime / this.effects.trainSpeedMul;
    building.queue.push({ type, total: time, remaining: time });
    this.sound?.train();
    this.hooks.selectionChanged?.();
  }

  canTrainNow(type) {
    const def = UNIT_TYPES[type];
    return this.population + def.pop <= this.popCap;
  }

  selectIdleVillager() {
    const idle = this.units.filter(u => u.alive && u.team === 'player' && u.type === 'villager' && (u.state === 'idle' || u.state === 'hold'));
    if (!idle.length) { this.sound?.error(); this.toast('No idle villagers.', '', 1800); return; }
    this.setSelection([idle[0]]);
    this.focusAt(idle[0].x, idle[0].y);
    this.sound?.select();
  }

  setSelection(list) {
    for (const e of this.selection) e.selected = false;
    this.selection = list.filter(e => e && e.alive);
    for (const e of this.selection) e.selected = true;
    this.hooks.selectionChanged?.();
  }

  selectAt(sx, sy, additive = false) {
    const hit = this.pickAt(sx, sy);
    if (!hit) {
      if (!additive) this.setSelection([]);
      return;
    }
    if (additive) {
      if (this.selection.includes(hit)) this.setSelection(this.selection.filter(e => e !== hit));
      else this.setSelection([...this.selection, hit]);
    } else this.setSelection([hit]);
    this.sound?.select();
  }

  pickAt(sx, sy) {
    const z = this.camera.zoom;
    let best = null, bestScore = Infinity;
    for (const u of this.units) {
      if (!u.alive) continue;
      const p = this.screenPos(u.x, u.y);
      const dx = p.x - sx, dy = (p.y - 18 * z) - sy;
      const d = Math.hypot(dx, dy);
      if (d < 18 * z && d < bestScore) { best = u; bestScore = d; }
    }
    if (best) return best;
    for (const b of this.buildings) {
      if (!b.alive) continue;
      const p = this.screenPos(b.x + b.w / 2, b.y + b.h / 2);
      const width = (b.w + b.h) * 16 * z + 8;
      const height = (b.w + b.h) * 12 * z + (b.type === 'towncenter' ? 112 : b.type === 'tower' ? 92 : 54) * z;
      if (sx > p.x - width - 20 * z && sx < p.x + width + 20 * z && sy > p.y - height && sy < p.y + 22 * z) {
        const d = Math.abs(sx - p.x) + Math.abs(sy - p.y);
        if (d < bestScore) { best = b; bestScore = d; }
      }
    }
    if (best) return best;
    let node = null, nodeD = 22 * z;
    for (const n of this.world.resources) {
      if (!n.alive) continue;
      const p = this.screenPos(n.x, n.y);
      const d = Math.hypot(p.x - sx, (p.y - 10 * z) - sy);
      if (d < nodeD) { nodeD = d; node = n; }
    }
    return node;
  }

  selectBox(x, y, w, h, additive = false) {
    const picked = [];
    for (const u of this.units) {
      if (!u.alive || u.team !== 'player') continue;
      const p = this.screenPos(u.x, u.y);
      if (p.x >= x && p.x <= x + w && p.y - 20 * this.camera.zoom >= y && p.y <= y + h + 10) picked.push(u);
    }
    if (additive) {
      const merged = [...this.selection];
      for (const u of picked) if (!merged.includes(u)) merged.push(u);
      this.setSelection(merged);
    } else this.setSelection(picked);
    if (picked.length) this.sound?.select();
  }

  issueCommand(sx, sy) {
    if (this.placement) { this.cancelPlacement(); return; }
    const units = this.selection.filter(e => e.team === 'player' && !e.w).filter(e => e.alive);
    if (!units.length) return;
    const hit = this.pickAt(sx, sy);
    if (hit) {
      if (hit.team === 'enemy') {
        for (const u of units) {
          if (u.type === 'villager') continue;
          u.state = 'attack'; u.target = hit; u.targetPos = null; u.retargetTimer = 1.1;
          u.hold = false;
        }
        this.sound?.command();
        this.addCommandMarker(hit.x + (hit.w ? hit.w / 2 : 0), hit.y + (hit.h ? hit.h / 2 : 0), true);
        return;
      }
      if (hit.resource) {
        let gathered = 0;
        for (const u of units) {
          if (u.type !== 'villager') continue;
          this.orderGather(u, hit);
          gathered++;
        }
        if (gathered) {
          this.sound?.command();
          this.addCommandMarker(hit.x, hit.y, false);
          return;
        }
      }
      if (hit.w && hit.team === 'player') {
        for (const u of units) {
          if (u.type === 'villager') {
            u.state = 'return'; u.dropTarget = hit; u.targetPos = { x: hit.x + hit.w / 2, y: hit.y + hit.h / 2 }; u.carry = Math.max(u.carry, 0);
          }
        }
      }
    }
    const wp = this.worldAt(sx, sy);
    this.commandMove(units, wp.x, wp.y);
    this.sound?.command();
    this.addCommandMarker(wp.x, wp.y, false);
  }

  commandMove(units, x, y) {
    const count = units.length;
    const cols = Math.ceil(Math.sqrt(count));
    const spacing = 0.8;
    units.forEach((u, i) => {
      const col = i % cols, row = Math.floor(i / cols);
      const ox = (col - (cols - 1) / 2) * spacing;
      const oy = (row - (Math.ceil(count / cols) - 1) / 2) * spacing;
      u.state = 'move';
      u.target = null;
      u.gatherTarget = null;
      u.buildTarget = null;
      u.hold = false;
      u.targetPos = {
        x: clamp(x + ox, 1, this.world.size - 1),
        y: clamp(y + oy, 1, this.world.size - 1),
      };
    });
  }

  cycleIdleVillager() { this.selectIdleVillager(); }

  screenPos(x, y) {
    const p = iso(x, y);
    return {
      x: (p.x - this.camera.x) * this.camera.zoom + window.innerWidth / 2,
      y: (p.y - this.camera.y) * this.camera.zoom + window.innerHeight / 2,
    };
  }

  worldAt(sx, sy) {
    const px = (sx - window.innerWidth / 2) / this.camera.zoom + this.camera.x;
    const py = (sy - window.innerHeight / 2) / this.camera.zoom + this.camera.y;
    return { x: px / 64 + py / 32, y: py / 32 - px / 64 };
  }

  mouseWorld() { return this.worldAt(this.mouse.x, this.mouse.y); }

  refreshHover() {
    if (!this.mouse.dirty) return;
    this.mouse.dirty = false;
    if (this.inMenu || this.paused || this.placement) { this.hovered = null; this.hoveredResource = null; return; }
    const hit = this.pickAt(this.mouse.x, this.mouse.y);
    if (hit && hit.maxAmount !== undefined) { this.hoveredResource = hit; this.hovered = null; }
    else { this.hovered = hit; this.hoveredResource = null; }
  }

  updateMarkers(dt) {
    for (const m of this.commandMarkers) m.life -= dt;
    this.commandMarkers = this.commandMarkers.filter(m => m.life > 0);
  }

  addCommandMarker(x, y, hostile) {
    this.commandMarkers.push({ x, y, hostile, life: 0.8, maxLife: 0.8 });
  }

  updateParticles(dt) {
    for (const p of this.particles) {
      p.life -= dt;
      p.x += (p.vx || 0) * dt;
      p.y += (p.vy || 0) * dt;
      p.z = (p.z || 0) + (p.vz || 0) * dt;
      if (p.vz) p.vz -= 30 * dt;
    }
    this.particles = this.particles.filter(p => p.life > 0);
  }

  addParticles(x, y, kind, color, size = 1, count = 5, life = 0.7) {
    for (let i = 0; i < count; i++) {
      const a = this.rng() * Math.PI * 2;
      const speed = kind === 'smoke' ? rand(this.rng, 0.1, 0.4) : rand(this.rng, 0.4, 1.7);
      this.particles.push({
        kind, x: x + rand(this.rng, -0.1, 0.1), y: y + rand(this.rng, -0.1, 0.1),
        vx: Math.cos(a) * speed * (kind === 'smoke' ? 0.4 : 1),
        vy: Math.sin(a) * speed * (kind === 'smoke' ? 0.4 : 1),
        z: kind === 'smoke' ? 10 + this.rng() * 10 : 8 + this.rng() * 12,
        vz: kind === 'smoke' ? rand(this.rng, 6, 14) : rand(this.rng, -12, 18),
        life: life * rand(this.rng, 0.7, 1.3), maxLife: life, color,
        size: size * rand(this.rng, 0.7, 1.4),
      });
    }
  }

  addFloating(x, y, text, color) {
    this.particles.push({ kind: 'text', x, y, z: 26, life: 1.4, maxLife: 1.4, text, color, size: 9, vx: 0, vy: 0, vz: 10 });
  }

  togglePause() {
    if (this.inMenu || this.phase === 'victory' || this.phase === 'defeat' || this.phase === 'boon') return null;
    this.paused = !this.paused;
    return this.paused;
  }

  resume() { this.paused = false; }
}

function resourceParticle(type) {
  if (type === 'wood') return 'rgba(137,101,59,ALPHA)';
  if (type === 'gold') return 'rgba(232,195,91,ALPHA)';
  if (type === 'stone') return 'rgba(183,177,158,ALPHA)';
  return 'rgba(203,157,112,ALPHA)';
}
function resourceText(type) {
  if (type === 'wood') return 'rgba(205,171,112,ALPHA)';
  if (type === 'gold') return 'rgba(235,201,109,ALPHA)';
  if (type === 'stone') return 'rgba(194,191,177,ALPHA)';
  return 'rgba(214,184,135,ALPHA)';
}
function resourceShort(type) {
  return type === 'wood' ? 'wood' : type === 'gold' ? 'gold' : type === 'stone' ? 'stone' : 'food';
}
