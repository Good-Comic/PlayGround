import { AGES, BUILDINGS, BOONS, ENEMIES, META_UNLOCKS, UNITS, WAVES } from './data.js';
import { MAP_H, MAP_W, RNG, angleTo, clamp, dist, formatNumber, idGenerator, roman, smoothPath, findPath } from './utils.js';
import { World } from './world.js';
import { costText, nodeResourceLabel, resourceLabel, roleLabel, t } from './i18n.js';

const STARTING_RESOURCES = { food: 250, wood: 250, gold: 100, stone: 50 };

function baseMods() {
  return {
    gather: 1, woodGather: 1, foodGather: 1, goldGather: 1, stoneGather: 1,
    unitHp: 1, unitAttack: 1, infantryHp: 1, infantryAttack: 1,
    archerRange: 1, archerAttack: 1, buildingHp: 1, armor: 0,
    unitSpeed: 1, attackSpeed: 1, trainSpeed: 1, ageCost: 1,
    popCap: 0, extraArrows: 0, buildingReload: 1, waveHeal: 0, tcRegen: 0,
    lootGold: 0, waveMilitia: 0, farmYield: 1
  };
}

function loadMeta() {
  try {
    const raw = localStorage.getItem('aoe-roguelite-meta-v1');
    if (!raw) return { renown: 0, bestWave: 0, runs: 0, wins: 0 };
    const data = JSON.parse(raw);
    return {
      renown: Number(data.renown) || 0,
      bestWave: Number(data.bestWave) || 0,
      runs: Number(data.runs) || 0,
      wins: Number(data.wins) || 0
    };
  } catch {
    return { renown: 0, bestWave: 0, runs: 0, wins: 0 };
  }
}

function saveMeta(meta) {
  try { localStorage.setItem('aoe-roguelite-meta-v1', JSON.stringify(meta)); } catch {}
}

function makeSeed() {
  const alphabet = 'ABCDEF0123456789';
  let seed = '';
  const values = new Uint32Array(6);
  crypto.getRandomValues(values);
  for (const value of values) seed += alphabet[value % alphabet.length];
  return seed;
}

export class Game {
  constructor(audio) {
    this.audio = audio;
    this.listeners = new Map();
    this.meta = loadMeta();
    this.state = 'menu';
    this.paused = false;
    this.speed = 1;
    this.id = idGenerator('e');
    this.selection = [];
    this.selectedIds = new Set();
    this.time = 0;
    this.elapsed = 0;
    this.camera = { x: 0, y: 0, zoom: 1.05 };
    this.boons = [];
    this.mods = baseMods();
    this.placement = null;
    this.hover = null;
    this.hoverTile = null;
    this.flash = 0;
    this.bannerTimer = 0;
    this.clearTimer = 0;
    this.attackAlertCooldown = 0;
    this.soundCooldown = 0;
    this.awarded = false;
    this.newCampaign(makeSeed(), 'menu');
  }

  on(event, callback) {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event).push(callback);
    return () => {
      const list = this.listeners.get(event) || [];
      const index = list.indexOf(callback);
      if (index >= 0) list.splice(index, 1);
    };
  }

  emit(event, payload) {
    for (const callback of this.listeners.get(event) || []) callback(payload);
  }

  notify(text, type = 'info') {
    this.emit('toast', { text, type });
  }

  newCampaign(seed = makeSeed(), state = 'playing') {
    this.seed = seed;
    this.world = new World(seed);
    this.rng = new RNG(seed + 'run');
    this.mods = baseMods();
    this.boons = [];
    this.units = [];
    this.buildings = [];
    this.projectiles = [];
    this.particles = [];
    this.floaters = [];
    this.fx = [];
    this.selection = [];
    this.selectedIds = new Set();
    this.occupancy = new Uint8Array(MAP_W * MAP_H);
    this.entityMap = new Map();
    this.resources = { ...STARTING_RESOURCES };
    this.age = 0;
    this.waveIndex = 0;
    this.phase = 'prepare';
    this.prepTime = WAVES[0].prep;
    this.prepTotal = WAVES[0].prep;
    this.spawnQueue = [];
    this.spawnTimer = 0;
    this.spawnPointIndex = 0;
    this.stats = { kills: 0, trained: 0, gathered: 0, lost: 0, built: 0, damage: 0, waves: 0 };
    this.elapsed = 0;
    this.time = 0;
    this.clearTimer = 0;
    this.awarded = false;
    this.placement = null;
    this.paused = false;
    this.state = state;
    this.applyMeta();
    this.buildStartingVillage();
    this.emit('selectionChanged');
    this.emit('ageChanged');
    this.emit('stateChanged', this.state);
  }

  applyMeta() {
    const unlocked = META_UNLOCKS.filter(item => this.meta.renown >= item.renown);
    this.metaBonuses = { villagers: 0, scouts: 0, wood: 0, food: 0, tcHp: 0 };
    for (const item of unlocked) {
      for (const [key, value] of Object.entries(item.apply)) {
        if (key === 'wood' || key === 'food') this.resources[key] += value;
        else if (key === 'tcHp') this.metaBonuses.tcHp += value;
        else this.metaBonuses[key] += value;
      }
    }
  }

  buildStartingVillage() {
    const tc = this.addBuilding('towncenter', 9, 16, true, 'player');
    this.addBuilding('house', 13, 20, true, 'player');
    this.addBuilding('house', 6, 15, true, 'player');
    const spots = [[8, 21], [9, 21], [10, 21], [11, 21], [8, 22], [12, 22]];
    for (const [x, y] of spots) this.addUnit('villager', 'player', x + .5, y + .5);
    for (let i = 0; i < this.metaBonuses.villagers; i++) this.addUnit('villager', 'player', 13.5, 21.5);
    this.addUnit('scout', 'player', 7.5, 22.5);
    for (let i = 0; i < this.metaBonuses.scouts; i++) this.addUnit('scout', 'player', 6.5, 21.5);
    this.addUnit('militia', 'player', 12.5, 21.5);
    this.recalculatePopulation();
    this.centerCameraOn(11, 18);
  }

  resourceValue(type) {
    return Math.floor(this.resources[type] || 0);
  }

  canAfford(cost) {
    return Object.entries(cost).every(([type, amount]) => (this.resources[type] || 0) >= amount);
  }

  spend(cost) {
    for (const [type, amount] of Object.entries(cost)) this.resources[type] -= amount;
  }

  refund(cost) {
    for (const [type, amount] of Object.entries(cost)) this.resources[type] = (this.resources[type] || 0) + amount;
  }

  recalculatePopulation() {
    let used = 0;
    for (const unit of this.units) if (unit.team === 'player') used += unit.pop || 0;
    let cap = 0;
    for (const building of this.buildings) {
      if (building.team !== 'player') continue;
      const def = BUILDINGS[building.kind];
      if (building.kind === 'towncenter') cap += 10;
      if (building.complete && def.pop) cap += def.pop;
    }
    cap += this.mods.popCap;
    this.popUsed = used;
    this.popCap = cap;
  }

  start() {
    if (this.state !== 'menu') return;
    this.state = 'playing';
    this.phase = 'prepare';
    this.prepTime = WAVES[0].prep;
    this.prepTotal = WAVES[0].prep;
    this.emit('stateChanged', this.state);
    this.emit('wavePreparing', { index: 0 });
    this.notify(t('The Warden\'s horn has not yet sounded. Prepare your village.'), 'good');
  }

  returnToMenu() {
    this.newCampaign(makeSeed(), 'menu');
    this.emit('stateChanged', 'menu');
  }

  playAgain() {
    this.newCampaign(makeSeed(), 'playing');
    this.emit('stateChanged', 'playing');
    this.emit('banner', { kicker: t('A new campaign'), title: t('The Shattered Crown'), text: t('A fresh map. A fresh chance to endure.') });
    this.notify(t('A new campaign begins. The ford is yours to hold.'), 'good');
  }

  togglePause() {
    if (this.state !== 'playing') return this.paused;
    this.paused = !this.paused;
    this.audio.play('click');
    this.emit('pauseChanged', this.paused);
    return this.paused;
  }

  setPaused(value) {
    if (this.state !== 'playing') return;
    this.paused = value;
    this.emit('pauseChanged', this.paused);
  }

  cycleSpeed() {
    const speeds = [1, 1.5, 2];
    const index = speeds.indexOf(this.speed);
    this.speed = speeds[(index + 1) % speeds.length];
    this.emit('speedChanged', this.speed);
    this.notify(t('Game speed {speed}×', { speed: this.speed }), 'info');
  }

  centerCameraOn(x, y) {
    this.camera.x = (x - y) * 32;
    this.camera.y = (x + y) * 16;
  }

  get tileWidth() { return 32; }
  get tileHeight() { return 16; }

  idx(x, y) { return y * MAP_W + x; }

  pointInBuilding(building, x, y) {
    return x >= building.x && x < building.x + building.w && y >= building.y && y < building.y + building.h;
  }

  buildingAt(x, y) {
    for (let i = this.buildings.length - 1; i >= 0; i--) {
      const building = this.buildings[i];
      if (!building.dead && this.pointInBuilding(building, x, y)) return building;
    }
    return null;
  }

  unitAt(x, y, radius = .42) {
    let found = null;
    let best = Infinity;
    for (const unit of this.units) {
      if (unit.dead) continue;
      const d = Math.hypot(unit.x - x, unit.y - y);
      if (d < Math.max(radius, unit.radius + .15) && d < best) { best = d; found = unit; }
    }
    return found;
  }

  entityAt(x, y) {
    return this.unitAt(x, y) || this.buildingAt(x, y);
  }

  nodeAt(x, y) {
    return this.world.nodeAt(Math.floor(x), Math.floor(y));
  }

  isPassable(x, y) {
    if (x < 0 || y < 0 || x >= MAP_W || y >= MAP_H) return false;
    if (this.world.isStaticBlocked(x, y)) return false;
    if (this.occupancy[this.idx(x, y)]) return false;
    return true;
  }

  markBuilding(building, occupied) {
    const value = occupied ? 1 : 0;
    for (let y = building.y; y < building.y + building.h; y++) {
      for (let x = building.x; x < building.x + building.w; x++) {
        if (x >= 0 && y >= 0 && x < MAP_W && y < MAP_H) this.occupancy[this.idx(x, y)] = value;
      }
    }
  }

  findFreeTileNear(cx, cy, radius = 5) {
    const ox = Math.round(cx);
    const oy = Math.round(cy);
    for (let r = 0; r <= radius; r++) {
      for (let y = oy - r; y <= oy + r; y++) {
        for (let x = ox - r; x <= ox + r; x++) {
          if (Math.max(Math.abs(x - ox), Math.abs(y - oy)) !== r) continue;
          if (this.isPassable(x, y)) return { x: x + .5, y: y + .5 };
        }
      }
    }
    return null;
  }

  spawnPointNearBuilding(building) {
    const cx = building.x + building.w / 2;
    const cy = building.y + building.h / 2;
    for (let radius = building.w / 2 + .8; radius < 8; radius += .8) {
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2 + radius;
        const x = Math.floor(cx + Math.cos(angle) * radius);
        const y = Math.floor(cy + Math.sin(angle) * radius);
        if (this.isPassable(x, y)) return { x: x + .5, y: y + .5 };
      }
    }
    return { x: cx, y: cy };
  }

  addUnit(type, team, x, y, opts = {}) {
    const def = team === 'enemy' ? ENEMIES[type] : UNITS[type];
    if (!def) return null;
    const waveScale = team === 'enemy' ? 1 + this.waveIndex * .055 : 1;
    const isInfantry = def.role === 'Infantry';
    const isArcher = def.role === 'Ranged';
    let maxHp = def.hp * (team === 'player' ? this.mods.unitHp : waveScale);
    if (team === 'player' && isInfantry) maxHp *= this.mods.infantryHp;
    if (team === 'enemy' && opts.boss) maxHp *= 1.12;
    let attack = def.attack * (team === 'player' ? this.mods.unitAttack : waveScale);
    if (team === 'player' && isInfantry) attack *= this.mods.infantryAttack;
    if (team === 'player' && isArcher) attack *= this.mods.archerAttack;
    let range = def.range;
    if (team === 'player' && isArcher) range *= this.mods.archerRange;
    let speed = def.speed;
    if (team === 'player') speed *= type === 'villager' ? this.mods.villagerSpeed || this.mods.unitSpeed : this.mods.unitSpeed;
    const unit = {
      id: this.id(), kind: type, type, team,
      name: def.name, role: def.role,
      x, y, prevX: x, prevY: y,
      hp: maxHp, maxHp,
      baseHp: def.hp, baseAttack: def.attack,
      attack, armor: def.armor + (team === 'player' ? this.mods.armor : 0),
      range, speed,
      cooldownBase: def.cooldown / (team === 'player' ? this.mods.attackSpeed : 1),
      cooldown: 0,
      pop: def.pop, radius: type === 'knight' || type === 'scout' ? .38 : .31,
      facing: team === 'enemy' ? Math.PI : 0,
      anim: this.rng.next() * 10,
      moving: false,
      task: 'idle', target: null, combatTarget: null, resource: null, farm: null,
      path: [], pathIndex: 0, repath: 0,
      carry: 0, carryType: null, carryCapacity: 10,
      gatherTimer: 0, gatherPhase: 0,
      hitFlash: 0, attackAnim: 0,
      boss: Boolean(opts.boss || def.boss),
      dead: false, selected: false
    };
    if (team === 'enemy') {
      unit.maxHp *= 1;
      unit.hp = unit.maxHp;
      unit.task = 'attack';
    }
    this.units.push(unit);
    this.entityMap.set(unit.id, unit);
    this.recalculatePopulation();
    return unit;
  }

  addBuilding(kind, x, y, complete = true, team = 'player') {
    const def = BUILDINGS[kind];
    const hpMul = team === 'player' ? this.mods.buildingHp : 1;
    let maxHp = def.hp * hpMul;
    if (kind === 'towncenter' && team === 'player') maxHp *= 1 + this.metaBonuses.tcHp;
    const building = {
      id: this.id(), kind, name: def.name, team,
      x, y, w: def.size, h: def.size,
      hp: complete ? maxHp : Math.max(20, maxHp * .12),
      maxHp, baseHp: def.hp,
      armor: def.armor, range: def.range || 6.35,
      attack: def.attack || (kind === 'towncenter' ? 7 : 0),
      cooldownBase: def.cooldown || 1.3,
      cooldown: this.rng.next(),
      complete, progress: complete ? 1 : 0,
      buildTime: def.build || 1,
      queue: [], trainTimer: 0,
      rally: null, selected: false, dead: false,
      hitFlash: 0, anim: this.rng.next() * 5,
      foodCurrent: kind === 'farm' ? Math.round((def.farmFood || 0) * this.mods.farmYield) : 0,
      smokeTimer: this.rng.next() * 3
    };
    this.buildings.push(building);
    this.entityMap.set(building.id, building);
    this.markBuilding(building, true);
    this.recalculatePopulation();
    return building;
  }

  canPlaceBuilding(kind, x, y) {
    const def = BUILDINGS[kind];
    if (!def) return false;
    if (def.age > this.age) return false;
    if (x < 0 || y < 0 || x + def.size > MAP_W || y + def.size > MAP_H) return false;
    for (let oy = 0; oy < def.size; oy++) {
      for (let ox = 0; ox < def.size; ox++) {
        const tx = x + ox;
        const ty = y + oy;
        if (!this.isPassable(tx, ty)) return false;
        if (this.nodeAt(tx, ty)) return false;
      }
    }
    return true;
  }

  findBuildingSpot(kind, nearX, nearY) {
    const def = BUILDINGS[kind];
    for (let radius = 0; radius <= 10; radius++) {
      for (let oy = -radius; oy <= radius; oy++) {
        for (let ox = -radius; ox <= radius; ox++) {
          if (Math.max(Math.abs(ox), Math.abs(oy)) !== radius) continue;
          const x = Math.round(nearX) + ox;
          const y = Math.round(nearY) + oy;
          if (this.canPlaceBuilding(kind, x, y)) return { x, y };
        }
      }
    }
    return null;
  }

  startPlacement(kind) {
    if (this.state !== 'playing' || this.paused) return false;
    const villagers = this.selection.filter(entity => entity.team === 'player' && entity.kind === 'villager');
    if (!villagers.length) {
      this.notify(t('Select a villager to construct buildings.'), 'danger');
      return false;
    }
    const def = BUILDINGS[kind];
    if (!def) return false;
    if (def.age > this.age) {
      this.notify(t('{name} requires the {age}.', { name: def.name, age: AGES[def.age].name }), 'danger');
      this.audio.play('deny');
      return false;
    }
    if (!this.canAfford(def.cost)) {
      this.notify(t('Not enough resources for {name}.', { name: def.name }), 'danger');
      this.audio.play('deny');
      return false;
    }
    this.placement = { kind, x: 0, y: 0, valid: false, villagers: villagers.map(v => v.id) };
    this.emit('placementChanged', this.placement);
    this.audio.play('click');
    return true;
  }

  cancelPlacement() {
    if (!this.placement) return;
    this.placement = null;
    this.emit('placementChanged', null);
  }

  updatePlacement(x, y) {
    if (!this.placement) return;
    const def = BUILDINGS[this.placement.kind];
    const gx = Math.round(x - def.size / 2 + .25);
    const gy = Math.round(y - def.size / 2 + .25);
    this.placement.x = gx;
    this.placement.y = gy;
    this.placement.valid = this.canPlaceBuilding(this.placement.kind, gx, gy);
  }

  confirmPlacement() {
    if (!this.placement) return false;
    const { kind, x, y, valid, villagers } = this.placement;
    if (!valid) {
      this.notify(t('Cannot build there.'), 'danger');
      this.audio.play('deny');
      return false;
    }
    const def = BUILDINGS[kind];
    if (!this.canAfford(def.cost)) {
      this.notify(t('Not enough resources.'), 'danger');
      this.audio.play('deny');
      this.cancelPlacement();
      return false;
    }
    this.spend(def.cost);
    const building = this.addBuilding(kind, x, y, false, 'player');
    building.progress = 0;
    building.hp = Math.max(20, building.maxHp * .12);
    this.stats.built++;
    for (const id of villagers) {
      const villager = this.entityMap.get(id);
      if (villager && !villager.dead) this.assignBuild(villager, building);
    }
    this.audio.play('build');
    this.notify(t('{name} under construction.', { name: def.name }), 'info');
    this.emit('placementChanged', null);
    this.placement = null;
    return true;
  }

  assignBuild(unit, building) {
    unit.task = 'build';
    unit.target = building;
    unit.combatTarget = null;
    unit.resource = null;
    unit.farm = null;
    unit.path = [];
    unit.repath = 0;
  }

  findNearestDropoff(x, y) {
    let best = null;
    let bestDistance = Infinity;
    for (const building of this.buildings) {
      if (building.team !== 'player' || building.dead || !building.complete) continue;
      if (building.kind !== 'towncenter') continue;
      const cx = building.x + building.w / 2;
      const cy = building.y + building.h / 2;
      const d = dist(x, y, cx, cy);
      if (d < bestDistance) { bestDistance = d; best = building; }
    }
    return best;
  }

  nearestResource(type, x, y) {
    const types = type === 'food' ? ['berry', 'sheep'] : [type];
    let best = null;
    let bestDistance = Infinity;
    for (const node of this.world.nodes) {
      if (node.depleted || !types.includes(node.type)) continue;
      const d = dist(x, y, node.x + .5, node.y + .5);
      if (d < bestDistance) { bestDistance = d; best = node; }
    }
    return best;
  }

  commandGather(unit, node) {
    if (!node || node.depleted) return;
    unit.task = 'gather';
    unit.resource = node;
    unit.farm = null;
    unit.combatTarget = null;
    unit.target = null;
    unit.path = [];
    unit.repath = 0;
  }

  commandGatherFarm(unit, building) {
    unit.task = 'gatherFarm';
    unit.farm = building;
    unit.resource = null;
    unit.combatTarget = null;
    unit.target = null;
    unit.path = [];
    unit.repath = 0;
  }

  commandAttack(unit, target) {
    unit.task = 'attack';
    unit.combatTarget = target;
    unit.target = null;
    unit.resource = null;
    unit.farm = null;
    unit.path = [];
    unit.repath = 0;
  }

  commandMove(unit, x, y) {
    unit.task = 'move';
    unit.combatTarget = null;
    unit.resource = null;
    unit.farm = null;
    unit.target = null;
    const path = findPath(unit.x, unit.y, x, y, (tx, ty) => this.isPassable(tx, ty));
    unit.path = smoothPath(path);
    unit.pathIndex = 0;
    unit.repath = 0;
  }

  commandSelectedAt(x, y, additive = false) {
    if (!this.selection.length) return;
    const target = this.entityAt(x, y);
    const node = this.nodeAt(x, y);
    const selectedUnits = this.selection.filter(e => e && !e.dead && e.unit !== false && e.team === 'player' && !e.w);
    const selectedBuildings = this.selection.filter(e => e && !e.dead && e.w);
    if (selectedBuildings.length === 1 && !selectedUnits.length) {
      const building = selectedBuildings[0];
      if (building.team === 'player') {
        building.rally = { x, y };
        this.addFloater(x, y, t('Rally'), '#e4c987');
        this.emit('selectionChanged');
        this.audio.play('command');
      }
      return;
    }
    if (!selectedUnits.length) return;
    let commandSound = false;
    if (target && target.team === 'enemy' && !target.dead) {
      for (const unit of selectedUnits) this.commandAttack(unit, target);
      this.addTargetRing(target, '#aa4a3d');
      commandSound = true;
    } else if (node) {
      let gatherers = 0;
      for (const unit of selectedUnits) {
        if (unit.kind === 'villager') {
          this.commandGather(unit, node);
          gatherers++;
        } else {
          this.commandMove(unit, x + (Math.random() - .5) * 1.4, y + (Math.random() - .5) * 1.4);
        }
      }
      if (gatherers) commandSound = true;
    } else if (target && target.team === 'player' && target.w && target.kind === 'farm') {
      let gatherers = 0;
      for (const unit of selectedUnits) {
        if (unit.kind === 'villager') { this.commandGatherFarm(unit, target); gatherers++; }
      }
      if (gatherers) commandSound = true;
    } else if (target && target.team === 'player' && target.w && target.hp < target.maxHp) {
      let repairers = 0;
      for (const unit of selectedUnits) {
        if (unit.kind === 'villager') {
          unit.task = 'repair';
          unit.target = target;
          unit.combatTarget = null;
          unit.path = [];
          repairers++;
        }
      }
      if (repairers) commandSound = true;
    } else {
      const count = selectedUnits.length;
      const columns = Math.ceil(Math.sqrt(count));
      selectedUnits.forEach((unit, index) => {
        const ox = (index % columns) - (columns - 1) / 2;
        const oy = Math.floor(index / columns) - (Math.ceil(count / columns) - 1) / 2;
        this.commandMove(unit, clamp(x + ox * .75, .5, MAP_W - .5), clamp(y + oy * .75, .5, MAP_H - .5));
      });
      this.addTargetRing({ x, y }, '#89a35d');
      commandSound = true;
    }
    if (commandSound) this.audio.play('command');
    this.emit('selectionChanged');
  }

  queueUnit(building, type) {
    if (!building || building.dead || building.team !== 'player' || !building.complete) return false;
    const def = UNITS[type];
    if (!def) return false;
    if (def.age > this.age) {
      this.notify(t('{name} requires the {age}.', { name: def.name, age: AGES[def.age].name }), 'danger');
      this.audio.play('deny');
      return false;
    }
    if (building.queue.length >= 5) {
      this.notify(t('The training queue is full.'), 'danger');
      this.audio.play('deny');
      return false;
    }
    if (building.kind !== def.building) return false;
    if (!this.canAfford(def.cost)) {
      this.notify(t('Not enough resources for {name}.', { name: def.name }), 'danger');
      this.audio.play('deny');
      return false;
    }
    const queuedPop = building.queue.reduce((total, item) => total + (UNITS[item]?.pop || 0), 0);
    if (this.popUsed + queuedPop >= this.popCap) {
      this.notify(t('Population limit reached. Build more houses.'), 'danger');
      this.audio.play('deny');
      return false;
    }
    this.spend(def.cost);
    building.queue.push(type);
    if (!building.trainTimer) building.trainTimer = def.train * this.mods.trainSpeed;
    if (building.queue.length === 1) {
      this.notify(t('{name} queued at the {building}.', { name: def.name, building: building.name }), 'info');
      this.audio.play('click');
    }
    this.emit('selectionChanged');
    return true;
  }

  advanceAge() {
    if (this.state !== 'playing') return false;
    if (this.age >= AGES.length - 1) return false;
    const cost = this.costForNextAge();
    if (!this.canAfford(cost)) {
      this.notify(t('Need {cost} to advance.', { cost: costText(cost) }), 'danger');
      this.audio.play('deny');
      return false;
    }
    this.spend(cost);
    this.age++;
    this.audio.play('age');
    const age = AGES[this.age];
    this.notify(t('The realm enters the {age}.', { age: age.name }), 'good');
    this.emit('banner', { kicker: t('A new age'), title: age.name, text: t('New soldiers and structures are now available.') });
    this.emit('ageChanged');
    for (const unit of this.units) {
      if (unit.team === 'player') unit.hp = Math.min(unit.maxHp, unit.hp + 15);
    }
    this.addFloater(this.tc().x + 2, this.tc().y + 2, age.name, '#f0d38d');
    this.emit('selectionChanged');
    return true;
  }

  costForNextAge() {
    if (this.age >= AGES.length - 1) return {};
    const cost = AGES[this.age].next;
    return Object.fromEntries(Object.entries(cost).map(([key, value]) => [key, Math.round(value * this.mods.ageCost)]));
  }

  tc() {
    return this.buildings.find(b => b.team === 'player' && b.kind === 'towncenter' && !b.dead) || null;
  }

  beginWave() {
    if (this.state !== 'playing' || this.phase === 'battle') return;
    const wave = WAVES[this.waveIndex];
    this.phase = 'battle';
    this.prepTime = 0;
    this.spawnTimer = .4;
    this.spawnPointIndex = 0;
    const queue = [];
    for (const [type, count] of Object.entries(wave.composition)) {
      for (let i = 0; i < count; i++) queue.push({ type, boss: type === 'warlord' });
    }
    const bossEntries = queue.filter(item => item.boss);
    const regular = this.rng.shuffle(queue.filter(item => !item.boss));
    this.spawnQueue = [...regular, ...bossEntries];
    if (this.mods.waveMilitia > 0) {
      const tc = this.tc();
      if (tc) {
        const spot = this.spawnPointNearBuilding(tc);
        for (let i = 0; i < this.mods.waveMilitia; i++) this.addUnit('militia', 'player', spot.x + i * .3, spot.y + i * .3);
      }
    }
    this.audio.play('horn');
    this.emit('waveStarted', { index: this.waveIndex, wave });
    this.emit('banner', { kicker: t('Wave {wave}', { wave: roman(this.waveIndex + 1) }), title: wave.title, text: wave.subtitle });
    this.notify(t('The horn sounds. Raiders are crossing the ford!'), 'danger');
    this.emit('selectionChanged');
  }

  callWaveEarly() {
    if (this.state !== 'playing' || this.phase !== 'prepare') return;
    if (this.prepTime <= 2) return;
    this.resources.gold += 75;
    this.notify(t('You sound the horn early. The steward rewards your boldness with 75 gold.'), 'good');
    this.audio.play('horn');
    this.beginWave();
  }

  completeWave() {
    this.phase = 'cleared';
    this.clearTimer = 1.4;
    this.stats.waves = this.waveIndex + 1;
    for (const unit of this.units) {
      if (unit.team === 'player') unit.hp = Math.min(unit.maxHp, unit.hp + this.mods.waveHeal);
    }
    const tc = this.tc();
    if (tc) tc.hp = Math.min(tc.maxHp, tc.hp + tc.maxHp * .08);
    this.audio.play('complete');
    this.notify(t('Wave {wave} survived. The ford is quiet again.', { wave: roman(this.waveIndex + 1) }), 'good');
  }

  offerBoons() {
    const pool = BOONS.filter(boon => !this.boons.some(taken => taken.id === boon.id));
    const picks = this.rng.shuffle(pool).slice(0, 3);
    this.state = 'boon';
    this.emit('stateChanged', this.state);
    this.emit('boonOffered', picks);
    this.audio.play('boon');
  }

  chooseBoon(boon) {
    if (this.state !== 'boon') return;
    this.applyBoon(boon);
    this.boons.push(boon);
    this.state = 'playing';
    this.waveIndex++;
    this.phase = 'prepare';
    const wave = WAVES[this.waveIndex];
    this.prepTime = wave.prep;
    this.prepTotal = wave.prep;
    this.emit('stateChanged', this.state);
    this.emit('boonChosen', boon);
    this.emit('wavePreparing', { index: this.waveIndex });
    this.emit('ageChanged');
    this.emit('selectionChanged');
    this.notify(t('{name} joins your campaign.', { name: boon.name }), 'good');
    this.emit('banner', { kicker: t('Wave {wave} approaches', { wave: roman(this.waveIndex + 1) }), title: wave.title, text: t('Use this respite wisely.') });
  }

  applyBoon(boon) {
    if (boon.immediate) {
      for (const [key, value] of Object.entries(boon.immediate)) this.resources[key] = (this.resources[key] || 0) + value;
    }
    if (boon.mods) {
      const additive = new Set(['armor', 'popCap', 'extraArrows', 'lootGold', 'waveMilitia', 'waveHeal', 'tcRegen']);
      for (const [key, value] of Object.entries(boon.mods)) {
        if (additive.has(key)) this.mods[key] = (this.mods[key] || 0) + value;
        else this.mods[key] = (this.mods[key] || 1) * value;
      }
      if (boon.mods.farmYield) {
        for (const building of this.buildings) {
          if (building.kind === 'farm' && building.foodCurrent > 0) building.foodCurrent = Math.round(building.foodCurrent * boon.mods.farmYield);
        }
      }
    }
    if (boon.id === 'wall') {
      const tc = this.tc();
      if (tc) { tc.maxHp += 500; tc.hp += 500; }
    }
    if (boon.freeUnits) {
      const tc = this.tc();
      for (const entry of boon.freeUnits) {
        for (let i = 0; i < entry.count; i++) {
          const spot = tc ? this.spawnPointNearBuilding(tc) : { x: 12, y: 20 };
          this.addUnit(entry.type, 'player', spot.x + i * .4, spot.y + i * .4);
        }
      }
    }
    if (boon.freeBuildings) {
      const tc = this.tc();
      for (const entry of boon.freeBuildings) {
        for (let i = 0; i < entry.count; i++) {
          const spot = this.findBuildingSpot(entry.type, tc ? tc.x + tc.w + 1 : 15, tc ? tc.y + 2 : 18);
          if (spot) {
            const building = this.addBuilding(entry.type, spot.x, spot.y, true, 'player');
            this.stats.built++;
            if (entry.type === 'farm') building.foodCurrent = Math.round((BUILDINGS.farm.farmFood) * this.mods.farmYield);
          }
        }
      }
    }
    this.refreshPlayerUnits();
    this.recalculatePopulation();
  }

  refreshPlayerUnits() {
    for (const unit of this.units) {
      if (unit.team !== 'player' || unit.dead) continue;
      const def = UNITS[unit.kind];
      const isInfantry = def.role === 'Infantry';
      const isArcher = def.role === 'Ranged';
      const hpRatio = unit.hp / unit.maxHp;
      let maxHp = def.hp * this.mods.unitHp;
      if (isInfantry) maxHp *= this.mods.infantryHp;
      unit.maxHp = maxHp;
      unit.hp = Math.max(1, maxHp * hpRatio);
      unit.attack = def.attack * this.mods.unitAttack * (isInfantry ? this.mods.infantryAttack : 1) * (isArcher ? this.mods.archerAttack : 1);
      unit.range = def.range * (isArcher ? this.mods.archerRange : 1);
      unit.armor = def.armor + this.mods.armor;
      unit.speed = def.speed * (unit.kind === 'villager' ? (this.mods.villagerSpeed || this.mods.unitSpeed) : this.mods.unitSpeed);
      unit.cooldownBase = def.cooldown / this.mods.attackSpeed;
    }
    for (const building of this.buildings) {
      if (building.team !== 'player' || building.dead) continue;
      const ratio = building.hp / building.maxHp;
      let maxHp = building.baseHp * this.mods.buildingHp;
      if (building.kind === 'towncenter') maxHp *= 1 + this.metaBonuses.tcHp;
      building.maxHp = maxHp;
      building.hp = Math.max(1, maxHp * ratio);
    }
  }

  select(entities, additive = false) {
    const list = entities.filter(Boolean);
    if (additive) {
      for (const entity of list) {
        if (this.selectedIds.has(entity.id)) {
          this.selectedIds.delete(entity.id);
          entity.selected = false;
        } else {
          this.selectedIds.add(entity.id);
          entity.selected = true;
        }
      }
    } else {
      for (const entity of this.selection) entity.selected = false;
      this.selectedIds.clear();
      for (const entity of list) { this.selectedIds.add(entity.id); entity.selected = true; }
    }
    this.selection = [...this.selectedIds].map(id => this.entityMap.get(id)).filter(entity => entity && !entity.dead);
    this.emit('selectionChanged');
    if (this.selection.length) this.audio.play('select');
  }

  clearSelection() {
    for (const entity of this.selection) entity.selected = false;
    this.selectedIds.clear();
    this.selection = [];
    this.emit('selectionChanged');
  }

  selectIdleVillager() {
    const villagers = this.units.filter(unit => unit.team === 'player' && unit.kind === 'villager' && !unit.dead && (unit.task === 'idle' || unit.task === 'move') && unit.task !== 'build');
    if (!villagers.length) return null;
    this.idleIndex = ((this.idleIndex || 0) + 1) % villagers.length;
    const villager = villagers[this.idleIndex];
    this.select([villager]);
    this.centerCameraOn(villager.x, villager.y);
    return villager;
  }

  addFloater(x, y, text, color = '#f1d99f') {
    this.floaters.push({ x, y, z: 1.2, text, color, life: 1.5, maxLife: 1.5 });
  }

  addParticle(type, x, y, options = {}) {
    const life = options.life ?? .8;
    this.particles.push({
      type, x, y,
      z: options.z ?? .3,
      vx: options.vx ?? 0,
      vy: options.vy ?? 0,
      vz: options.vz ?? 0,
      life, maxLife: life,
      size: options.size ?? 3,
      color: options.color ?? '#c9b58a',
      gravity: options.gravity ?? 0
    });
  }

  addTargetRing(target, color) {
    this.fx.push({ type: 'target', x: target.x, y: target.y, life: .65, maxLife: .65, color });
  }

  addHitSparks(x, y, color = '#e7c681') {
    for (let i = 0; i < 5; i++) {
      this.addParticle('spark', x, y, {
        vx: (Math.random() - .5) * 2.4,
        vy: (Math.random() - .5) * 2.4,
        vz: Math.random() * 1.5 + .5,
        gravity: 3.5, life: .4 + Math.random() * .25, size: 1.4 + Math.random(), color
      });
    }
  }

  addDust(x, y, count = 4) {
    for (let i = 0; i < count; i++) {
      this.addParticle('dust', x + (Math.random() - .5) * .6, y + (Math.random() - .5) * .6, {
        vx: (Math.random() - .5) * .7,
        vy: (Math.random() - .5) * .7,
        vz: .3 + Math.random() * .5,
        life: .6 + Math.random() * .5,
        size: 2 + Math.random() * 2,
        color: '#c9bb9d'
      });
    }
  }

  dealDamage(target, amount, source = null, ranged = false) {
    if (!target || target.dead) return;
    const armor = target.armor || 0;
    const damage = Math.max(1, amount - armor);
    target.hp -= damage;
    target.hitFlash = .16;
    if (target.team === 'player') this.stats.damage += damage;
    if (Math.random() < .6) this.addHitSparks(target.x, target.y, target.team === 'enemy' ? '#c98d61' : '#e7c681');
    if (source && source.team === 'player' && source.kind === 'villager' && target.team === 'enemy') {}
    if (target.hp <= 0) {
      if (target.w) this.destroyBuilding(target);
      else this.destroyUnit(target, source);
    }
  }

  destroyUnit(unit, source = null) {
    if (unit.dead) return;
    unit.dead = true;
    this.selectedIds.delete(unit.id);
    this.selection = this.selection.filter(entity => entity !== unit);
    this.addDust(unit.x, unit.y, 7);
    for (let i = 0; i < 5; i++) {
      this.addParticle('blood', unit.x, unit.y, {
        vx: (Math.random() - .5) * 2,
        vy: (Math.random() - .5) * 2,
        vz: Math.random() * .8 + .2,
        gravity: 5, life: .5 + Math.random() * .4, size: 1.8, color: unit.team === 'enemy' ? '#6f2d26' : '#7d3d32'
      });
    }
    if (unit.team === 'enemy') {
      this.stats.kills++;
      if (this.mods.lootGold) {
        this.resources.gold += this.mods.lootGold;
        this.addFloater(unit.x, unit.y, t('+{gold} gold', { gold: this.mods.lootGold }), '#e2bf77');
      }
      if (unit.boss) this.addFloater(unit.x, unit.y, t('Warlord fallen'), '#f0cc86');
    } else {
      this.stats.lost++;
      this.notify(t('{name} has fallen.', { name: unit.name }), 'danger');
    }
    this.audio.play('death');
    this.emit('selectionChanged');
    this.recalculatePopulation();
  }

  destroyBuilding(building) {
    if (building.dead) return;
    building.dead = true;
    this.markBuilding(building, false);
    this.selectedIds.delete(building.id);
    this.selection = this.selection.filter(entity => entity !== building);
    this.addDust(building.x + building.w / 2, building.y + building.h / 2, 20);
    for (let i = 0; i < 12; i++) {
      this.addParticle('debris', building.x + building.w / 2 + (Math.random() - .5) * building.w, building.y + building.h / 2 + (Math.random() - .5) * building.h, {
        vx: (Math.random() - .5) * 2, vy: (Math.random() - .5) * 2, vz: Math.random() * 2 + .5,
        gravity: 5, life: .8 + Math.random(), size: 2 + Math.random() * 2, color: '#7f725f'
      });
    }
    this.recalculatePopulation();
    this.emit('selectionChanged');
    if (building.kind === 'towncenter' && building.team === 'player') {
      this.endCampaign(false);
    }
  }

  endCampaign(victory) {
    if (this.awarded) return;
    this.awarded = true;
    this.state = victory ? 'victory' : 'defeat';
    this.paused = true;
    const reached = Math.max(this.stats.waves, this.waveIndex + 1);
    const renown = Math.round(12 + reached * 22 + this.stats.kills * 1.6 + (victory ? 160 : 0));
    this.meta.renown += renown;
    this.meta.bestWave = Math.max(this.meta.bestWave, reached);
    this.meta.runs++;
    if (victory) this.meta.wins++;
    saveMeta(this.meta);
    this.reward = renown;
    if (victory) this.audio.play('victory');
    else this.audio.play('defeat');
    this.emit('stateChanged', this.state);
    this.emit('gameOver', {
      victory,
      wave: reached,
      kills: this.stats.kills,
      trained: this.stats.trained,
      gathered: Math.round(this.stats.gathered),
      renown,
      seed: this.seed,
      boons: this.boons
    });
  }

  update(dt) {
    if (this.state !== 'playing' || this.paused) return;
    dt = Math.min(dt, .05) * this.speed;
    this.time += dt;
    this.elapsed += dt;
    this.attackAlertCooldown = Math.max(0, this.attackAlertCooldown - dt);
    this.soundCooldown = Math.max(0, this.soundCooldown - dt);
    this.bannerTimer = Math.max(0, this.bannerTimer - dt);

    for (const particle of this.particles) {
      particle.life -= dt;
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.z += particle.vz * dt;
      particle.vz -= particle.gravity * dt;
      if (particle.z < 0) { particle.z = 0; particle.vz *= -.2; particle.vx *= .7; particle.vy *= .7; }
    }
    this.particles = this.particles.filter(p => p.life > 0);
    for (const floater of this.floaters) { floater.life -= dt; floater.z += dt * .55; }
    this.floaters = this.floaters.filter(f => f.life > 0);
    for (const effect of this.fx) effect.life -= dt;
    this.fx = this.fx.filter(effect => effect.life > 0);

    if (this.phase === 'prepare') {
      this.prepTime -= dt;
      if (this.prepTime <= 0) this.beginWave();
    } else if (this.phase === 'battle') {
      this.updateSpawning(dt);
      if (!this.spawnQueue.length && !this.units.some(unit => unit.team === 'enemy' && !unit.dead)) {
        this.completeWave();
      }
    } else if (this.phase === 'cleared') {
      this.clearTimer -= dt;
      if (this.clearTimer <= 0) {
        if (this.waveIndex >= WAVES.length - 1) this.endCampaign(true);
        else this.offerBoons();
      }
    }

    for (const unit of this.units) if (!unit.dead) this.updateUnit(unit, dt);
    for (const building of this.buildings) if (!building.dead) this.updateBuilding(building, dt);
    this.updateProjectiles(dt);
    this.units = this.units.filter(unit => !unit.dead);
    this.buildings = this.buildings.filter(building => !building.dead);

    for (const entity of this.selection) if (entity.dead) entity.selected = false;
    this.selection = this.selection.filter(entity => !entity.dead);
    this.recalculatePopulation();
    for (const unit of this.units) {
      unit.hitFlash = Math.max(0, unit.hitFlash - dt);
      unit.attackAnim = Math.max(0, unit.attackAnim - dt);
    }
    for (const building of this.buildings) building.hitFlash = Math.max(0, building.hitFlash - dt);
  }

  updateSpawning(dt) {
    if (!this.spawnQueue.length) return;
    this.spawnTimer -= dt;
    if (this.spawnTimer > 0) return;
    const wave = WAVES[this.waveIndex];
    const item = this.spawnQueue.shift();
    const spawn = this.world.spawnPoints[this.spawnPointIndex % this.world.spawnPoints.length];
    this.spawnPointIndex++;
    const ang = this.rng.range(0, Math.PI * 2);
    const radius = this.rng.range(.1, 1.1);
    let x = spawn.x + Math.cos(ang) * radius;
    let y = spawn.y + Math.sin(ang) * radius;
    if (!this.isPassable(Math.floor(x), Math.floor(y))) {
      const free = this.findFreeTileNear(spawn.x, spawn.y, 4);
      if (free) { x = free.x; y = free.y; }
    }
    const enemy = this.addUnit(item.type, 'enemy', x, y, { boss: item.boss });
    if (enemy) {
      enemy.spawnFade = 1;
      enemy.task = 'attack';
      const tc = this.tc();
      if (tc) enemy.combatTarget = tc;
      this.addDust(x, y, 4);
    }
    this.spawnTimer = wave.interval * (item.boss ? 2 : 1);
    this.emit('waveProgress');
  }

  updateUnit(unit, dt) {
    if (unit.dead) return;
    unit.cooldown = Math.max(0, unit.cooldown - dt);
    unit.repath = Math.max(0, unit.repath - dt);
    unit.hitFlash = Math.max(0, unit.hitFlash - dt);
    unit.anim += dt * (unit.moving ? 7 : 2);
    unit.moving = false;
    unit.prevX = unit.x;
    unit.prevY = unit.y;

    if (unit.task === 'idle') {
      if (unit.team === 'player') {
        if (unit.role !== 'Economy') {
          const enemy = this.findNearestEnemy(unit, unit.boss ? 12 : 6.4);
          if (enemy) {
            unit.task = 'attack';
            unit.combatTarget = enemy;
          }
        } else {
          const threat = this.findNearestEnemy(unit, 2.2);
          if (threat && unit.hp < unit.maxHp * .55) {
            const tc = this.tc();
            if (tc) this.commandMove(unit, tc.x + tc.w + 1.5, tc.y + tc.h + 1.5);
          }
        }
      }
    }

    if (unit.team === 'player' && unit.task === 'move' && !unit.path.length) unit.task = 'idle';
    if (unit.team === 'enemy') this.updateEnemyAI(unit, dt);

    if (unit.task === 'attack') this.updateAttack(unit, dt);
    else if (unit.task === 'move') this.followPath(unit, dt);
    else if (unit.task === 'gather') this.updateGather(unit, dt);
    else if (unit.task === 'gatherFarm') this.updateGatherFarm(unit, dt);
    else if (unit.task === 'return') this.updateReturn(unit, dt);
    else if (unit.task === 'build') this.updateBuild(unit, dt);
    else if (unit.task === 'repair') this.updateRepair(unit, dt);

    if (unit.task === 'attack' && !unit.combatTarget) unit.task = 'idle';
    if (unit.task === 'idle' && unit.team === 'player') this.separateUnit(unit);
  }

  findNearestEnemy(unit, range) {
    let best = null;
    let bestDistance = range;
    const targets = unit.team === 'player' ? this.units.filter(u => u.team === 'enemy' && !u.dead) : this.units.filter(u => u.team === 'player' && !u.dead);
    for (const target of targets) {
      const d = dist(unit.x, unit.y, target.x, target.y);
      if (d < bestDistance) { bestDistance = d; best = target; }
    }
    return best;
  }

  findNearestPlayerTarget(unit, range = Infinity) {
    let best = null;
    let bestDistance = range;
    for (const target of this.units) {
      if (target.team !== 'player' || target.dead) continue;
      const d = dist(unit.x, unit.y, target.x, target.y);
      if (d < bestDistance) { bestDistance = d; best = target; }
    }
    if (!best) {
      for (const building of this.buildings) {
        if (building.team !== 'player' || building.dead) continue;
        const cx = building.x + building.w / 2;
        const cy = building.y + building.h / 2;
        const d = Math.max(0, dist(unit.x, unit.y, cx, cy) - building.w / 2);
        if (d < bestDistance) { bestDistance = d; best = building; }
      }
    }
    return best;
  }

  updateEnemyAI(unit, dt) {
    if (!unit.combatTarget || unit.combatTarget.dead) {
      const target = this.findNearestPlayerTarget(unit, unit.boss ? 20 : 11);
      if (target) unit.combatTarget = target;
      else {
        const tc = this.tc();
        if (tc) unit.combatTarget = tc;
      }
    }
    unit.retarget = (unit.retarget || 0) - dt;
    if (unit.retarget <= 0) {
      unit.retarget = 1.2 + Math.random() * .8;
      const nearby = this.findNearestPlayerTarget(unit, 5.5);
      if (nearby && nearby !== unit.combatTarget) unit.combatTarget = nearby;
    }
    if (!unit.combatTarget) return;
    const target = unit.combatTarget;
    const distance = this.distanceToTarget(unit, target);
    if (distance > unit.range) {
      if (!unit.path.length || unit.repath <= 0) {
        this.pathToTarget(unit, target);
        unit.repath = .9 + Math.random() * .5;
      }
      this.followPath(unit, dt);
      const newDistance = this.distanceToTarget(unit, target);
      if (newDistance <= unit.range) unit.path = [];
    }
  }

  distanceToTarget(unit, target) {
    if (target.w) {
      const nx = clamp(unit.x, target.x + .15, target.x + target.w - .15);
      const ny = clamp(unit.y, target.y + .15, target.y + target.h - .15);
      return dist(unit.x, unit.y, nx, ny);
    }
    return dist(unit.x, unit.y, target.x, target.y);
  }

  pathToTarget(unit, target) {
    let tx = target.x;
    let ty = target.y;
    if (target.w) {
      tx = clamp(unit.x, target.x - .4, target.x + target.w + .4);
      ty = clamp(unit.y, target.y - .4, target.y + target.h + .4);
      if (unit.x < target.x) tx = target.x - .8;
      else if (unit.x > target.x + target.w) tx = target.x + target.w + .8;
      if (unit.y < target.y) ty = target.y - .8;
      else if (unit.y > target.y + target.h) ty = target.y + target.h + .8;
      if (unit.x >= target.x - .8 && unit.x <= target.x + target.w + .8) tx = unit.x;
      if (unit.y >= target.y - .8 && unit.y <= target.y + target.h + .8) ty = unit.y;
    }
    const path = findPath(unit.x, unit.y, tx, ty, (x, y) => this.isPassable(x, y));
    unit.path = smoothPath(path);
    unit.pathIndex = 0;
  }

  updateAttack(unit, dt) {
    const target = unit.combatTarget;
    if (!target || target.dead) { unit.combatTarget = null; unit.task = 'idle'; return; }
    const distance = this.distanceToTarget(unit, target);
    if (distance > unit.range) {
      if (!unit.path.length || unit.repath <= 0) { this.pathToTarget(unit, target); unit.repath = .8; }
      this.followPath(unit, dt);
      return;
    }
    unit.path = [];
    unit.facing = angleTo(unit.x, unit.y, target.x, target.y);
    if (unit.cooldown <= 0) {
      unit.cooldown = unit.cooldownBase;
      unit.attackAnim = .32;
      const isRanged = unit.range > 2;
      if (isRanged) {
        this.spawnProjectile(unit, target);
        if (this.soundCooldown <= 0) { this.audio.play('arrow'); this.soundCooldown = .08; }
      } else {
        this.dealDamage(target, unit.attack * (unit.boss ? 1.35 : 1), unit, false);
        if (this.soundCooldown <= 0) { this.audio.play(target.w ? 'hit' : 'sword'); this.soundCooldown = .09; }
      }
      if (target.w && target.team === 'player' && unit.team === 'enemy' && this.attackAlertCooldown <= 0) {
        this.notify(t('{name} is under attack!', { name: target.name }), 'danger');
        this.audio.play('alert');
        this.attackAlertCooldown = 14;
      }
    }
  }

  spawnProjectile(source, target) {
    const speed = 11;
    this.projectiles.push({
      x: source.x, y: source.y, z: source.boss ? 1.3 : 1.05,
      target, speed,
      damage: source.attack * (source.boss ? 1.3 : 1),
      team: source.team,
      color: source.team === 'enemy' ? '#c1674f' : '#e9d09b',
      life: 3
    });
  }

  updateProjectiles(dt) {
    for (const projectile of this.projectiles) {
      if (!projectile.target || projectile.target.dead) { projectile.life = 0; continue; }
      const target = projectile.target;
      const tx = target.x;
      const ty = target.y;
      const dx = tx - projectile.x;
      const dy = ty - projectile.y;
      const d = Math.hypot(dx, dy);
      const step = projectile.speed * dt;
      projectile.life -= dt;
      projectile.angle = Math.atan2(dy, dx);
      if (d <= step || projectile.life <= 0) {
        this.dealDamage(target, projectile.damage, null, true);
        projectile.life = 0;
        if (Math.random() < .5) this.addHitSparks(tx, ty, '#d4bb8c');
      } else {
        projectile.x += dx / d * step;
        projectile.y += dy / d * step;
      }
    }
    this.projectiles = this.projectiles.filter(p => p.life > 0);
  }

  followPath(unit, dt) {
    if (!unit.path.length) return;
    const [tx, ty] = unit.path[0];
    const dx = tx + .5 - unit.x;
    const dy = ty + .5 - unit.y;
    const d = Math.hypot(dx, dy);
    if (d < .08) {
      unit.path.shift();
      if (!unit.path.length) return;
      return this.followPath(unit, dt);
    }
    const step = Math.min(d, unit.speed * dt);
    const nx = unit.x + dx / d * step;
    const ny = unit.y + dy / d * step;
    if (this.isPassable(Math.floor(nx), Math.floor(ny)) || unit.path.length === 1) {
      unit.x = nx;
      unit.y = ny;
    } else {
      unit.path = [];
    }
    unit.facing = Math.atan2(dy, dx);
    unit.moving = true;
    unit.x = clamp(unit.x, .3, MAP_W - .3);
    unit.y = clamp(unit.y, .3, MAP_H - .3);
  }

  separateUnit(unit) {
    for (const other of this.units) {
      if (other === unit || other.dead) continue;
      const dx = unit.x - other.x;
      const dy = unit.y - other.y;
      const d = Math.hypot(dx, dy);
      const min = unit.radius + other.radius;
      if (d > 0 && d < min) {
        const push = (min - d) * .3;
        const nx = unit.x + dx / d * push;
        const ny = unit.y + dy / d * push;
        if (this.isPassable(Math.floor(nx), Math.floor(ny))) { unit.x = nx; unit.y = ny; }
      }
    }
  }

  updateGather(unit, dt) {
    const node = unit.resource;
    if (!node || node.depleted) {
      if (unit.carry > 0) return this.beginReturn(unit);
      const type = node ? node.type : null;
      const nearest = type ? this.nearestResource(type === 'berry' || type === 'sheep' ? 'food' : type, unit.x, unit.y) : null;
      if (nearest) return this.commandGather(unit, nearest);
      unit.task = 'idle';
      return;
    }
    if (unit.carry >= unit.carryCapacity) return this.beginReturn(unit);
    const d = dist(unit.x, unit.y, node.x + .5, node.y + .5);
    if (d > 1.35) {
      if (!unit.path.length || unit.repath <= 0) {
        const path = findPath(unit.x, unit.y, node.x, node.y, (x, y) => this.isPassable(x, y));
        unit.path = smoothPath(path);
        unit.repath = 1.6;
      }
      this.followPath(unit, dt);
      return;
    }
    unit.path = [];
    unit.facing = angleTo(unit.x, unit.y, node.x + .5, node.y + .5);
    unit.moving = false;
    unit.anim += dt * 4;
    const rate = this.gatherRate(node.type);
    const amount = Math.min(rate * dt, node.amount, unit.carryCapacity - unit.carry);
    node.amount -= amount;
    unit.carry += amount;
    unit.carryType = node.type === 'tree' ? 'wood' : node.type === 'gold' ? 'gold' : node.type === 'stone' ? 'stone' : 'food';
    if (Math.random() < dt * 1.5) this.addDust(node.x + .5, node.y + .5, 1);
    if (node.amount <= 0.01) {
      node.amount = 0;
      node.depleted = true;
      this.addDust(node.x + .5, node.y + .5, 5);
      if (node.type === 'tree') this.addParticle('stump', node.x + .5, node.y + .5, { life: 1, size: 5, color: '#58422a' });
      const nearest = this.nearestResource(node.type === 'berry' || node.type === 'sheep' ? 'food' : node.type, unit.x, unit.y);
      if (nearest) { this.commandGather(unit, nearest); return; }
      if (unit.carry > 0) this.beginReturn(unit);
      else unit.task = 'idle';
    }
  }

  gatherRate(type) {
    let rate = .82;
    if (type === 'tree') rate *= this.mods.woodGather;
    else if (type === 'gold') rate *= this.mods.goldGather;
    else if (type === 'stone') rate *= this.mods.stoneGather;
    else rate *= this.mods.foodGather;
    return rate * this.mods.gather;
  }

  beginReturn(unit) {
    const dropoff = this.findNearestDropoff(unit.x, unit.y);
    if (!dropoff) { unit.task = 'idle'; return; }
    unit.task = 'return';
    unit.returnResource = unit.resource;
    unit.returnFarm = unit.farm;
    unit.target = dropoff;
    unit.path = findPath(unit.x, unit.y, dropoff.x + dropoff.w / 2, dropoff.y + dropoff.h / 2, (x, y) => this.isPassable(x, y));
    unit.path = smoothPath(unit.path);
    unit.pathIndex = 0;
    unit.repath = 2;
    unit.resource = null;
    unit.farm = null;
  }

  updateReturn(unit, dt) {
    const dropoff = this.findNearestDropoff(unit.x, unit.y);
    if (!dropoff) { unit.task = 'idle'; return; }
    const d = Math.hypot(unit.x - (dropoff.x + dropoff.w / 2), unit.y - (dropoff.y + dropoff.h / 2));
    if (d > dropoff.w / 2 + 1.3) {
      if (!unit.path.length || unit.repath <= 0) {
        unit.path = smoothPath(findPath(unit.x, unit.y, dropoff.x + dropoff.w / 2, dropoff.y + dropoff.h / 2, (x, y) => this.isPassable(x, y)));
        unit.repath = 2;
      }
      this.followPath(unit, dt);
      return;
    }
    if (unit.carry > 0) {
      const type = unit.carryType || 'food';
      this.resources[type] = (this.resources[type] || 0) + unit.carry;
      this.stats.gathered += unit.carry;
      if (unit.carry >= 5) this.addFloater(dropoff.x + dropoff.w / 2, dropoff.y + dropoff.h / 2, `+${Math.round(unit.carry)} ${resourceLabel(type)}`, '#e9d49c');
      unit.carry = 0;
      unit.carryType = null;
      if (this.soundCooldown <= 0) { this.audio.play('gather'); this.soundCooldown = .15; }
    }
    const returnResource = unit.returnResource;
    const returnFarm = unit.returnFarm;
    unit.returnResource = null;
    unit.returnFarm = null;
    if (returnFarm && !returnFarm.dead && returnFarm.foodCurrent > 0) this.commandGatherFarm(unit, returnFarm);
    else if (returnResource && !returnResource.depleted) this.commandGather(unit, returnResource);
    else {
      const type = returnResource ? (returnResource.type === 'tree' ? 'wood' : returnResource.type === 'gold' ? 'gold' : returnResource.type === 'stone' ? 'stone' : 'food') : null;
      const nearest = type ? this.nearestResource(type, unit.x, unit.y) : this.nearestResource('food', unit.x, unit.y);
      if (nearest) this.commandGather(unit, nearest);
      else unit.task = 'idle';
    }
  }

  updateGatherFarm(unit, dt) {
    const farm = unit.farm;
    if (!farm || farm.dead || farm.foodCurrent <= 0) {
      if (unit.carry > 0) return this.beginReturn(unit);
      unit.task = 'idle';
      return;
    }
    if (unit.carry >= unit.carryCapacity) return this.beginReturn(unit);
    const cx = farm.x + farm.w / 2;
    const cy = farm.y + farm.h / 2;
    const d = Math.hypot(unit.x - cx, unit.y - cy);
    if (d > farm.w / 2 + 1.25) {
      if (!unit.path.length || unit.repath <= 0) {
        unit.path = smoothPath(findPath(unit.x, unit.y, cx, cy, (x, y) => this.isPassable(x, y)));
        unit.repath = 1.6;
      }
      this.followPath(unit, dt);
      return;
    }
    unit.path = [];
    unit.facing = angleTo(unit.x, unit.y, cx, cy);
    const amount = Math.min(.82 * this.mods.gather * this.mods.foodGather * dt, farm.foodCurrent, unit.carryCapacity - unit.carry);
    farm.foodCurrent -= amount;
    unit.carry += amount;
    unit.carryType = 'food';
    if (farm.foodCurrent <= 0) {
      farm.foodCurrent = 0;
      if (unit.carry > 0) this.beginReturn(unit);
      else unit.task = 'idle';
    }
  }

  updateBuild(unit, dt) {
    const building = unit.target;
    if (!building || building.dead || building.complete) { unit.task = 'idle'; unit.target = null; return; }
    const cx = building.x + building.w / 2;
    const cy = building.y + building.h / 2;
    const d = Math.max(0, Math.hypot(unit.x - cx, unit.y - cy) - building.w / 2);
    if (d > 1.35) {
      if (!unit.path.length || unit.repath <= 0) {
        unit.path = smoothPath(findPath(unit.x, unit.y, cx, cy, (x, y) => this.isPassable(x, y)));
        unit.repath = 1.4;
      }
      this.followPath(unit, dt);
      return;
    }
    unit.path = [];
    unit.anim += dt * 5;
    building.progress = Math.min(1, building.progress + dt / building.buildTime * 1.25);
    building.hp = Math.max(building.hp, building.maxHp * (.12 + .88 * building.progress));
    if (Math.random() < dt * 3) {
      this.addParticle('spark', cx + (Math.random() - .5) * building.w, cy + (Math.random() - .5) * building.h, {
        vz: .7, gravity: 3, life: .35, size: 1.4, color: '#e3c37f'
      });
      if (this.soundCooldown <= 0) { this.audio.play('build'); this.soundCooldown = .5; }
    }
    if (building.progress >= 1) {
      building.complete = true;
      building.progress = 1;
      building.hp = building.maxHp;
      unit.task = 'idle';
      unit.target = null;
      this.recalculatePopulation();
      this.notify(t('{name} completed.', { name: building.name }), 'good');
      this.audio.play('complete');
      this.addDust(cx, cy, 10);
      this.emit('selectionChanged');
    }
  }

  updateRepair(unit, dt) {
    const building = unit.target;
    if (!building || building.dead || building.hp >= building.maxHp) { unit.task = 'idle'; unit.target = null; return; }
    const cx = building.x + building.w / 2;
    const cy = building.y + building.h / 2;
    const d = Math.max(0, Math.hypot(unit.x - cx, unit.y - cy) - building.w / 2);
    if (d > 1.35) {
      if (!unit.path.length || unit.repath <= 0) {
        unit.path = smoothPath(findPath(unit.x, unit.y, cx, cy, (x, y) => this.isPassable(x, y)));
        unit.repath = 1.4;
      }
      this.followPath(unit, dt);
      return;
    }
    unit.path = [];
    unit.anim += dt * 5;
    building.hp = Math.min(building.maxHp, building.hp + 18 * dt);
    if (Math.random() < dt * 2) this.addParticle('spark', cx, cy, { vz: .8, gravity: 4, life: .3, color: '#d9c38d' });
    if (building.hp >= building.maxHp) { unit.task = 'idle'; unit.target = null; }
  }

  updateBuilding(building, dt) {
    if (building.team === 'player' && building.kind === 'towncenter' && this.mods.tcRegen > 0 && this.phase !== 'battle') {
      building.hp = Math.min(building.maxHp, building.hp + building.maxHp * this.mods.tcRegen * dt);
    }
    if (!building.complete) return;
    if (building.queue.length) {
      const type = building.queue[0];
      const def = UNITS[type];
      if (!building.trainTimer) building.trainTimer = def.train * this.mods.trainSpeed;
      building.trainTimer -= dt;
      if (building.trainTimer <= 0) {
        building.queue.shift();
        const spot = this.spawnPointNearBuilding(building);
        const unit = this.addUnit(type, building.team, spot.x, spot.y);
        if (unit) {
          this.stats.trained++;
          if (building.rally) this.commandMove(unit, building.rally.x, building.rally.y);
          this.audio.play('complete');
          this.notify(t('{name} is ready.', { name: def.name }), 'good');
          this.addDust(spot.x, spot.y, 4);
        }
        building.trainTimer = building.queue.length ? (UNITS[building.queue[0]].train * this.mods.trainSpeed) : 0;
        this.emit('selectionChanged');
      }
    }
    if (building.attack > 0) {
      building.cooldown -= dt;
      if (building.cooldown <= 0) {
        const target = this.findBuildingTarget(building);
        if (target) {
          const arrows = 1 + this.mods.extraArrows + (building.kind === 'towncenter' ? 1 : 0);
          for (let i = 0; i < arrows; i++) {
            const targetOffset = i === 0 ? target : this.findBuildingTarget(building) || target;
            this.projectiles.push({
              x: building.x + building.w / 2 + (Math.random() - .5) * building.w * .5,
              y: building.y + building.h / 2 + (Math.random() - .5) * building.h * .5,
              z: building.kind === 'tower' ? 2.4 : 2.1,
              target: targetOffset,
              speed: 12,
              damage: building.attack + this.age * 1.5,
              team: building.team,
              color: building.team === 'player' ? '#efd59d' : '#d16f58',
              life: 3
            });
          }
          building.cooldown = building.cooldownBase * (this.mods.buildingReload || 1) * (this.mods.extraArrows ? .8 : 1);
          if (this.soundCooldown <= 0) { this.audio.play('arrow'); this.soundCooldown = .09; }
        } else {
          building.cooldown = .25;
        }
      }
    }
    building.anim += dt;
  }

  findBuildingTarget(building) {
    let best = null;
    let bestDistance = building.range;
    const enemies = building.team === 'player' ? this.units.filter(u => u.team === 'enemy' && !u.dead) : this.units.filter(u => u.team === 'player' && !u.dead);
    for (const unit of enemies) {
      const d = dist(building.x + building.w / 2, building.y + building.h / 2, unit.x, unit.y);
      if (d < bestDistance) { bestDistance = d; best = unit; }
    }
    return best;
  }

  selectedInfo() {
    if (!this.selection.length) return null;
    if (this.selection.length > 1) {
      const counts = {};
      for (const entity of this.selection) {
        const key = entity.w ? t('Building') : entity.name;
        counts[key] = (counts[key] || 0) + 1;
      }
      return { multiple: true, count: this.selection.length, counts, entities: this.selection };
    }
    const entity = this.selection[0];
    if (entity.w) {
      return {
        multiple: false, isBuilding: true, entity,
        name: entity.name,
        subtitle: entity.complete ? BUILDINGS[entity.kind].desc.split(/[.。]/)[0] : t('Under construction'),
        hp: entity.hp, maxHp: entity.maxHp,
        task: entity.complete ? (entity.queue.length ? t('Training {name} ({count})', { name: UNITS[entity.queue[0]].name, count: entity.queue.length }) : t('Awaiting orders')) : t('{percent}% built', { percent: Math.round(entity.progress * 100) }),
        stats: entity.attack ? [{ label: t('Attack'), value: entity.attack }, { label: t('Range'), value: entity.range.toFixed(1) }] : []
      };
    }
    const def = entity.team === 'enemy' ? ENEMIES[entity.kind] : UNITS[entity.kind];
    const taskLabels = {
      idle: t('Awaiting orders'), move: t('Moving'), attack: t('Engaged'), gather: entity.resource ? t('Gathering {resource}', { resource: nodeResourceLabel(entity.resource.type) }) : t('Gathering'),
      gatherFarm: t('Harvesting the field'), return: t('Returning resources'), build: t('Constructing'), repair: t('Repairing')
    };
    return {
      multiple: false, isBuilding: false, entity,
      name: entity.name,
      subtitle: roleLabel(entity.role),
      hp: entity.hp, maxHp: entity.maxHp,
      task: taskLabels[entity.task] || t('Awaiting orders'),
      stats: [
        { label: t('Attack'), value: Math.round(entity.attack) },
        { label: t('Armour'), value: Math.round(entity.armor) },
        { label: t('Range'), value: entity.range.toFixed(1) }
      ],
      desc: def?.desc
    };
  }

  getWaveState() {
    const wave = WAVES[this.waveIndex];
    return {
      index: this.waveIndex,
      wave,
      phase: this.phase,
      prepTime: this.prepTime,
      prepTotal: this.prepTotal,
      pending: this.spawnQueue.length,
      enemies: this.units.filter(unit => unit.team === 'enemy' && !unit.dead).length
    };
  }

  statusLine() {
    if (this.placement) return 'Placing building';
    if (this.phase === 'battle') return 'Battle joined';
    if (this.phase === 'prepare') return 'Preparing';
    if (this.phase === 'cleared') return 'Victory';
    return 'Campaign';
  }

  formatResource(type) {
    return formatNumber(this.resources[type]);
  }
}
