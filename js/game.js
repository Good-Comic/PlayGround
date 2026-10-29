import { difficultyId, preparationSeconds, applyDifficulty, applyCycle } from './campaign.js';
import { Crowd } from './crowd.js';
import { findPath, segmentClear, crossesRect } from './navigation.js';
import {
  UNIT_TYPES, BUILDING_TYPES, TRAINABLE, GENERIC_UNITS, BUILD_OPTIONS, WAVES, BOONS,
  START_RESOURCES, CIVILIZATIONS, BIOMES, AGE_COSTS, INITIAL_BUILDINGS,
  RARITY_WEIGHT, MAX_BOONS, PLAYER_COLORS,
} from './data.js';
import { createWorld } from './world.js';
import { NemesisDirector, unitThreat } from './director.js';
import { t } from './i18n.js';
import { clamp, dist, dist2, iso, lerp, mulberry32, pick, pointInRect, rand, randInt, seedFromDate, formatNumber } from './utils.js';
import { visualDirectionFromVector } from './visuals.js';
import { HERO_SKILLS } from './hero-skills.js';
export { HERO_SKILLS } from './hero-skills.js';

const DEFAULT_EFFECTS = () => ({
  woodMul: 1, foodMul: 1, goldMul: 1, stoneMul: 1, woodYield: 1,
  farmMul: 1, attackSpeedMul: 1, archerDamageMul: 1, archerRange: 0,
  militarySpeedMul: 1, trainSpeedMul: 1, goldCostMul: 1, buildingHpMul: 1,
  buildSpeedMul: 1, villagerSpeedMul: 1, carryBonus: 0, bountyGold: 0,
  tcRegen: 0, towerRange: 0, towerDamageMul: 1, militaryHpMul: 1,
  infantryHpMul: 1, infantryDamageMul: 1, infantryPopMul: 1, infantryCostMul: 1,
  infantryAttackSpeedMul: 1, infantryArmor: 0, infantrySlow: 0,
  cavalryHpMul: 1, cavalryDamageMul: 1, cavalryCostMul: 1, cavalrySpeedMul: 1,
  rangedAttackSpeedMul: 1, siegeHpMul: 1, siegeCostMul: 1, siegeSpeedMul: 1,
  siegeSplash: 0, extraArrowEvery: 0, slowOnHit: 0, splash: 0, chainEvery: 0,
  lifesteal: 0, thorns: 0, houseArrows: false, veteran: false, decoyWave: 0,
  convertChance: 0, rescue: false, retreat: false, prototype: false,
  villagerHpBonus: 0, villagerAttackBonus: 0, unitRegen: 0,
  elephantUnlocked: false, elephantCostMul: 1, killFoodRate: 0, killGoldRate: 0,
  killFoodCap: 0, killGoldCap: 0, heroHpMul: 1, heroDamageMul: 1, heroCooldownMul: 1,
  extraArrowDamageMul: 1, ageCostMul: 1, startFoodBonus: 0,
  infantryRefundRate: 0, infantryRefundCap: 0, militaryPopCap: 0,
  recruiterCostMul: 1, recruiterTrainMul: 1, convertHpBonus: 0,
  elephantTrample: 0, elephantTrampleTargets: 0, towerCartEvery: 0, towerCartCap: 0,
  towerCostMul: 1, siegeRange: 0, counterCostMul: 1, infantryRegen: 0,
  fishingHutAnywhere: false, archerSight: 0, cavalrySight: 0, cavalryChargeBonus: 0, archerFirstShotDelay: 0,
  militaryBuildingHpMul: 1, marketHireCostMul: 1, marketHiresAny: false,
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

  newRun(seed, options = {}) {
    this.seed = seed;
    this.civ = CIVILIZATIONS.find(c => c.id === (options.civId || options.civ)) || CIVILIZATIONS[1];
    this.biome = BIOMES.find(b => b.id === (options.biomeId || options.biome)) || BIOMES.find(b => b.id === 'ash') || BIOMES[0];
    this.cycle = 1;
    this.inheritedBoons = [];
    this.difficulty = difficultyId(options.difficulty);
    this.runConfig = { civId: this.civ.id, biomeId: this.biome.id, difficulty: this.difficulty };
    this.playerColors = { ...PLAYER_COLORS, primary: this.civ.accent, cloth: this.civ.accent };
    this.world = createWorld(seed, this.biome.id);
    this.resources = { ...START_RESOURCES };
    this.effects = DEFAULT_EFFECTS();
    this.applyModifiers(this.civ.bonuses);
    this.applyModifiers(this.biome.mods);
    this.resources.food = Math.max(0, this.resources.food + this.effects.startFoodBonus);
    this.infantryRefunded = 0;
    this.towerCartsSpawned = 0;
    this.buildings = [];
    this.units = [];
    this.crowd = null;
    this.navigationQueue = []; this.navigationQueued = new Set();
    this.projectiles = [];
    this.particles = [];
    this.zones = [];
    this.selection = [];
    this.orderMode = null; this.controlGroups = {};
    this.selected = null;
    this.hovered = null;
    this.hoveredResource = null;
    this.boons = [];
    this.boonChoices = [];
    this.boonRerolls = 0;
    this.buildPage = 0;
    this.stats = { kills: 0, gathered: 0, trained: 0, waves: 0, assists: 0 };
    this.director = new NemesisDirector(seed);
    this.lastWaveReport = null;
    this.waveReports = [];
    this.waveStats = this.director.emptyStats();
    this.pendingWavePlan = null;
    this.waveEvent = null;
    this.waveEventMods = null;
    this.waveEventZone = null;
    this.waveEventActive = true;
    this.waveEventAt = 20;
    this.waveEventWarned = false;
    this.waveDuelAssigned = false;
    this.bossExtensionActive = false;
    this.bossExtensionReinforcements = 0;
    this.bossExtensionWarned = false;
    this.waveRetreatStarted = false;
    this.waveCleanupDone = false;
    this.waveInitialThreat = 0;
    this.waveClearSeconds = 0;
    this.biomeEventTimer = 0;
    this.biomeEventWarned = false;
    this.biomeEventActive = false;
    this.saracenDebt = 0;
    this.saracenDebtDue = 0;
    this.ottomanAmmoPaid = true;
    this.intel = null;
    this.assistActive = false;
    this.waveIndex = 0;
    this.phase = 'prep';
    this.prepTotal = preparationSeconds(45, this.difficulty);
    this.prepTimer = this.prepTotal;
    this.waveTotal = 0;
    this.waveName = t(`wave.0.name`);
    this.waveClock = 0;
    this.waveSpawns = [];
    this.waveEndTimer = 0;
    this.waveEnraged = false;
    this.endShown = false;
    this.dragBox = null;
    this.placement = null;
    this.commandMarkers = [];
    this.rng = mulberry32(seed ^ 0x5f3759df);
    this.time = 0;
    this.runTime = 0;
    this.orderMode=null; this.controlGroups={};
    this.paused = false;
    this.nextId = 1;
    this.lastWaveAnnounce = -1;
    this.enemyPressure = false;
    this.ageLevel = 1;
    this.ageResearch = null;
    this.hero = null;
    this.heroControl = false;
    this.heroReviveTimer = 0;
    this.heroSkillPreview = null;
    this.autoEconomy = true;
    this.autoMilitary = true;
    this.autoTimers = { gather: 0, villager: 0, military: 0 };
    this.speed = this.speed || 1;
    this.retreatUsed = false;
    this.killFoodEarned = 0;
    this.killGoldEarned = 0;
    this.buildInitialBase();
    this.prepareNextWavePlan();
    const center = iso(this.world.base.x, this.world.base.y);
    this.camera = { x: center.x, y: center.y, targetX: center.x, targetY: center.y, zoom: 1.0, targetZoom: 1.0 };
    this.inMenu = true;
  }


  canStartNextCycle() {
    return this.phase === 'victory' && this.stats.waves === WAVES.length;
  }

  startNextCycle(cardIds = []) {
    // Validate everything before resetting the player's completed campaign.
    if (!this.canStartNextCycle() || !Array.isArray(cardIds) || cardIds.length > 3 ||
        new Set(cardIds).size !== cardIds.length) return false;
    const cards = cardIds.map(id => this.boons.find(b => b.id === id));
    if (cards.some(b => !b)) return false;
    const nextCycle = this.cycle + 1;
    const options = { ...this.runConfig };
    const speed = this.speed, autoEconomy = this.autoEconomy, autoMilitary = this.autoMilitary;
    // A new, reproducible frontier; no old economy, research or entities carry.
    const seed = (this.seed ^ Math.imul(nextCycle, 0x9e3779b9)) >>> 0;
    this.newRun(seed, options);
    this.cycle = nextCycle;
    this.inheritedBoons = [...cardIds];
    for (const card of cards) { card.apply(this); this.boons.push(card); }
    this.refreshPlayerStats(); this.refreshBuildingStats();
    this.speed = speed; this.autoEconomy = autoEconomy; this.autoMilitary = autoMilitary;
    // newRun already consumed the first director plan; start the fresh director
    // again so cycle-one and later cycles share the same deterministic stream.
    this.director = new NemesisDirector(seed);
    this.prepareNextWavePlan();
    this.inMenu = false; this.paused = false;
    return true;
  }

  snapshot() {
    const ref = entity => {
      if (!entity) return null;
      const kind = entity.maxAmount !== undefined ? 'resource' : entity.w !== undefined ? 'building' : 'unit';
      return { id: entity.id, kind };
    };
    const unitKeys = [
      'id', 'team', 'type', 'x', 'y', 'hp', 'maxHp', 'baseMaxHp', 'pop', 'armor', 'attack',
      'state', 'carry', 'carryType', 'cooldown', 'attackAnim', 'walkPhase', 'facing', 'visualDirection', 'deathAnim', 'hitFlash',
      'alive', 'retargetTimer', 'hold', 'idleTimer', 'buildingHint', 'hero', 'shield', 'shieldTime',
      'marked', 'slowUntil', 'slowAmount', 'shots', 'rescueUsed', 'expireIn', 'bossSkillTimer', 'rageStage',
      'summoned', 'markCd', 'aegisCd', 'eventFlags', 'eventSpeedMul', 'eventAttackSpeedMul',
      'eventRegen', 'buildingDamageMul', 'convertResist', 'eventRetreat', 'eventRetreatCd',
      'eventFireCd', 'duel', 'chargeReady', 'chargeCd', 'combatAt', 'kiteCount', 'moraleUsed',
      'lureUsed', 'feintUsed', 'spawnGate', 'eventModsApplied', 'scale',
      'stance', 'guardOrigin', 'manualAttack', 'waveWithdrawal', 'withdrawn', 'withdrawalBlocked', 'retreatGate', 'carryover', '_orderScanAt',
    ];
    const buildingKeys = [
      'id', 'team', 'type', 'x', 'y', 'w', 'h', 'hp', 'maxHp', 'baseMaxHp', 'armor',
      'construction', 'alive', 'cooldown', 'queue', 'rally', 'hitFlash', 'foodStore', 'goldStore',
    ];
    const pick = (source, keys) => {
      const out = {};
      for (const key of keys) if (source[key] !== undefined) out[key] = source[key];
      return out;
    };
    return {
      version: 1,
      controlGroups: Object.fromEntries(Object.entries(this.controlGroups||{}).map(([k,v])=>[k,[...v]])),
      savedAt: Date.now(),
      seed: this.seed,
      mapGenerationVersion: this.world.generationVersion || 1,
      difficulty: this.difficulty,
      cycle: this.cycle,
      inheritedBoons: [...this.inheritedBoons],
      civId: this.civ.id,
      biomeId: this.biome.id,
      resources: { ...this.resources },
      effects: { ...this.effects },
      boons: this.boons.map(boon => boon.id),
      boonChoices: this.boonChoices.map(boon => boon.id),
      boonRerolls: this.boonRerolls,
      stats: { ...this.stats },
      waveIndex: this.waveIndex,
      phase: this.phase,
      prepTotal: this.prepTotal,
      prepTimer: this.prepTimer,
      waveTotal: this.waveTotal,
      waveClock: this.waveClock,
      waveEndTimer: this.waveEndTimer,
      waveEnraged: this.waveEnraged,
      runTime: this.runTime,
      time: this.time,
      nextId: this.nextId,
      ageLevel: this.ageLevel,
      ageResearch: this.ageResearch ? { ...this.ageResearch } : null,
      autoEconomy: this.autoEconomy,
      autoMilitary: this.autoMilitary,
      autoTimers: { ...this.autoTimers },
      heroControl: this.heroControl,
      heroReviveTimer: this.heroReviveTimer,
      retreatUsed: this.retreatUsed,
      killFoodEarned: this.killFoodEarned,
      killGoldEarned: this.killGoldEarned,
      infantryRefunded: this.infantryRefunded,
      towerCartsSpawned: this.towerCartsSpawned,
      assistActive: this.assistActive,
      lastWaveAnnounce: this.lastWaveAnnounce,
      enemyPressure: this.enemyPressure,
      lastWaveReport: this.lastWaveReport ? { ...this.lastWaveReport } : null,
      waveReports: this.waveReports.map(report => ({ ...report })),
      pendingWavePlan: this.pendingWavePlan ? JSON.parse(JSON.stringify(this.pendingWavePlan)) : null,
      intel: this.intel ? JSON.parse(JSON.stringify(this.intel)) : null,
      waveEvent: this.waveEvent ? { ...this.waveEvent } : null,
      waveEventMods: this.waveEventMods ? { ...this.waveEventMods } : null,
      waveEventZone: this.waveEventZone ? { ...this.waveEventZone } : null,
      waveEventActive: this.waveEventActive,
      waveEventAt: this.waveEventAt,
      waveEventWarned: this.waveEventWarned,
      waveDuelAssigned: this.waveDuelAssigned,
      bossExtensionActive: this.bossExtensionActive,
      bossExtensionReinforcements: this.bossExtensionReinforcements,
      bossExtensionWarned: this.bossExtensionWarned,
      waveRetreatStarted: this.waveRetreatStarted,
      waveCleanupDone: this.waveCleanupDone,
      waveInitialThreat: this.waveInitialThreat,
      waveClearSeconds: this.waveClearSeconds,
      biomeEventTimer: this.biomeEventTimer,
      biomeEventWarned: this.biomeEventWarned,
      biomeEventActive: this.biomeEventActive,
      saracenDebt: this.saracenDebt,
      saracenDebtDue: this.saracenDebtDue,
      ottomanAmmoPaid: this.ottomanAmmoPaid,
      waveSpawns: this.waveSpawns.map(group => ({ ...group, units: { ...group.units } })),
      camera: { ...this.camera },
      rngState: this.rng.state,
      director: {
        seed: this.director.seed,
        previousSuppression: this.director.previousSuppression,
        terrainAssistUsed: this.director.terrainAssistUsed,
        assistLog: this.director.assistLog.map(entry => ({ ...entry })),
        stats: this.director.stats ? { ...this.director.stats } : null,
      },
      heroId: this.hero?.id ?? null,
      selection: this.selection.map(ref),
      worldResources: this.world.resources.map(node => ({
        id: node.id, alive: node.alive, amount: node.amount, hitFlash: node.hitFlash || 0,
      })),
      units: this.units.map(unit => ({
        ...pick(unit, unitKeys),
        tacticalOrder: unit.tacticalOrder ? JSON.parse(JSON.stringify(unit.tacticalOrder)) : null,
        target: ref(unit.target),
        gatherTarget: ref(unit.gatherTarget),
        buildTarget: ref(unit.buildTarget),
        dropTarget: ref(unit.dropTarget),
        targetPos: unit.targetPos ? { ...unit.targetPos } : null,
      })),
      buildings: this.buildings.map(building => pick(building, buildingKeys)),
      projectiles: this.projectiles.map(p => ({
        ...pick(p, ['x','y','tx','ty','team','damage','speed','alive','scale']),
        target: ref(p.target), source: ref(p.source),
      })),
      zones: this.zones.map(z => ({
        ...pick(z, ['x','y','r','delay','elapsed','damage','kind','done','persist','duration']),
        source: ref(z.source),
      })),
    };
  }

  restore(snapshot) {
    if (!snapshot || snapshot.version !== 1) throw new Error('Unsupported save version');
    const offered = Array.isArray(snapshot.boonChoices) ? snapshot.boonChoices : [];
    if (snapshot.phase === 'boon' && (!offered.length || offered.length > 3 ||
      new Set(offered).size !== offered.length || offered.some(id =>
        !BOONS.some(b => b.id === id) || snapshot.boons?.includes(id)))) {
      throw new Error('Save is missing valid pending boon choices');
    }
    const civ = CIVILIZATIONS.find(c => c.id === snapshot.civId);
    const biome = BIOMES.find(b => b.id === snapshot.biomeId);
    if (!civ || !biome) throw new Error('Save references unknown civilization or biome');
    this.seed = snapshot.seed;
    this.civ = civ;
    this.biome = biome;
    this.cycle = Number.isSafeInteger(snapshot.cycle) && snapshot.cycle > 0 ? snapshot.cycle : 1;
    this.inheritedBoons = (snapshot.inheritedBoons || []).filter(id => BOONS.some(b => b.id === id)).slice(0,3);
    this.difficulty = difficultyId(snapshot.difficulty);
    this.runConfig = { civId: civ.id, biomeId: biome.id, difficulty: this.difficulty };
    this.playerColors = { ...PLAYER_COLORS, primary: civ.accent, cloth: civ.accent };
    this.world = createWorld(this.seed, biome.id, snapshot.mapGenerationVersion ?? 1);
    const worldNodes = new Map(this.world.resources.map(node => [node.id, node]));
    for (const saved of snapshot.worldResources || []) {
      const node = worldNodes.get(saved.id);
      if (!node) continue;
      node.alive = saved.alive;
      node.amount = saved.amount;
      node.hitFlash = saved.hitFlash || 0;
    }
    this.resources = { ...snapshot.resources };
    this.effects = { ...snapshot.effects };
    this.boons = BOONS.filter(boon => snapshot.boons?.includes(boon.id));
    this.boonChoices = offered.map(id => BOONS.find(b => b.id === id)).filter(Boolean);
    this.boonRerolls = Number.isSafeInteger(snapshot.boonRerolls) && snapshot.boonRerolls >= 0 ? snapshot.boonRerolls : 0;
    this.stats = { ...snapshot.stats };
    this.buildings = [];
    this.units = [];
    this.crowd = null;
    this.navigationQueue = []; this.navigationQueued = new Set();
    this.projectiles = [];
    this.particles = [];
    this.zones = [];
    this.commandMarkers = [];
    this.selection = [];
    this.selected = null;
    this.hovered = null;
    this.hoveredResource = null;
    this.placement = null;
    this.dragBox = null;
    this.orderMode=null;this.controlGroups=Object.fromEntries(Object.entries(snapshot.controlGroups||{}).map(([k,v])=>[k,Array.isArray(v)?[...v]:[]]));
    this.waveIndex = snapshot.waveIndex;
    this.phase = snapshot.phase;
    this.prepTotal = snapshot.prepTotal;
    this.prepTimer = snapshot.prepTimer;
    this.waveTotal = snapshot.waveTotal;
    this.waveClock = snapshot.waveClock;
    this.waveEndTimer = snapshot.waveEndTimer;
    this.waveEnraged = snapshot.waveEnraged;
    this.waveName = t(`wave.${Math.min(this.waveIndex, WAVES.length - 1)}.name`);
    this.runTime = snapshot.runTime;
    this.time = snapshot.time;
    this.ageLevel = snapshot.ageLevel;
    this.ageResearch = snapshot.ageResearch ? { ...snapshot.ageResearch } : null;
    this.autoEconomy = snapshot.autoEconomy;
    this.autoMilitary = snapshot.autoMilitary;
    this.autoTimers = { ...snapshot.autoTimers };
    this.heroControl = !!snapshot.heroControl;
    this.heroReviveTimer = snapshot.heroReviveTimer || 0;
    this.heroSkillPreview = null;
    this.retreatUsed = !!snapshot.retreatUsed;
    this.killFoodEarned = snapshot.killFoodEarned || 0;
    this.killGoldEarned = snapshot.killGoldEarned || 0;
    this.infantryRefunded = snapshot.infantryRefunded || 0;
    this.towerCartsSpawned = snapshot.towerCartsSpawned || 0;
    this.assistActive = !!snapshot.assistActive;
    this.lastWaveAnnounce = snapshot.lastWaveAnnounce ?? -1;
    this.enemyPressure = !!snapshot.enemyPressure;
    this.lastWaveReport = snapshot.lastWaveReport ? { ...snapshot.lastWaveReport } : null;
    this.waveReports = (snapshot.waveReports || []).map(report => ({ ...report }));
    this.pendingWavePlan = snapshot.pendingWavePlan ? JSON.parse(JSON.stringify(snapshot.pendingWavePlan)) : null;
    this.intel = snapshot.intel ? JSON.parse(JSON.stringify(snapshot.intel)) : null;
    this.waveEvent = snapshot.waveEvent ? { ...snapshot.waveEvent } : null;
    this.waveEventMods = snapshot.waveEventMods ? { ...snapshot.waveEventMods } : null;
    this.waveEventZone = snapshot.waveEventZone ? { ...snapshot.waveEventZone } : null;
    this.waveEventActive = !!snapshot.waveEventActive;
    this.waveEventAt = snapshot.waveEventAt;
    this.waveEventWarned = !!snapshot.waveEventWarned;
    this.waveDuelAssigned = !!snapshot.waveDuelAssigned;
    this.bossExtensionActive = !!snapshot.bossExtensionActive;
    this.bossExtensionReinforcements = snapshot.bossExtensionReinforcements || 0;
    this.bossExtensionWarned = !!snapshot.bossExtensionWarned;
    // Older saves used a one-second tactical timer for wave retreat; re-evaluate the policy.
    this.waveRetreatStarted = snapshot.waveInitialThreat !== undefined && !!snapshot.waveRetreatStarted;
    this.waveCleanupDone = snapshot.waveInitialThreat !== undefined && !!snapshot.waveCleanupDone;
    this.waveInitialThreat = snapshot.waveInitialThreat || 0;
    this.waveClearSeconds = snapshot.waveClearSeconds || 0;
    this.biomeEventTimer = snapshot.biomeEventTimer || 0;
    this.biomeEventWarned = !!snapshot.biomeEventWarned;
    this.biomeEventActive = !!snapshot.biomeEventActive;
    this.saracenDebt = snapshot.saracenDebt || 0;
    this.saracenDebtDue = snapshot.saracenDebtDue || 0;
    this.ottomanAmmoPaid = !!snapshot.ottomanAmmoPaid;
    this.waveSpawns = (snapshot.waveSpawns || []).map(group => ({ ...group, units: { ...group.units } }));
    this.camera = { ...snapshot.camera };
    this.director = new NemesisDirector(snapshot.director?.seed ?? this.seed);
    if (snapshot.director) {
      this.director.previousSuppression = snapshot.director.previousSuppression ?? null;
      this.director.terrainAssistUsed = !!snapshot.director.terrainAssistUsed;
      this.director.assistLog = (snapshot.director.assistLog || []).map(entry => ({ ...entry }));
      this.director.stats = snapshot.director.stats ? { ...snapshot.director.stats } : null;
    }
    this.nextId = 1;
    this.rng = mulberry32(this.seed ^ 0x5f3759df);
    this.buildings = (snapshot.buildings || []).map(saved => {
      const def = BUILDING_TYPES[saved.type];
      if (!def) return null;
      return {
        id: saved.id, kind: 'building', team: saved.team || 'player', type: saved.type,
        typeDef: def, x: saved.x, y: saved.y, w: def.w, h: def.h,
        hp: saved.hp, maxHp: saved.maxHp, baseMaxHp: saved.baseMaxHp ?? def.hp,
        armor: saved.armor ?? def.armor ?? 6, construction: saved.construction ?? 1,
        alive: saved.alive !== false, selected: false, queue: (saved.queue || []).map(item => ({ ...item })),
        cooldown: saved.cooldown || 0, rally: saved.rally && Number.isFinite(saved.rally.x) && Number.isFinite(saved.rally.y) && saved.rally.x>=0 && saved.rally.y>=0 && saved.rally.x<this.world.size && saved.rally.y<this.world.size ? {...saved.rally} : null, hitFlash: saved.hitFlash || 0,
        foodStore: saved.foodStore || 0, goldStore: saved.goldStore || 0,
      };
    }).filter(Boolean);
    for (const saved of snapshot.units || []) {
      if (!UNIT_TYPES[saved.type]) continue;
      const unit = this.spawnUnit(saved.type, saved.x, saved.y, saved.team, { hero: saved.hero, expireIn: saved.expireIn });
      if (!unit) continue;
      unit.id = saved.id;
      for (const [key, value] of Object.entries(saved)) {
        if (['target', 'gatherTarget', 'buildTarget', 'dropTarget', 'typeDef', 'selected'].includes(key)) continue;
        unit[key] = value;
      }
      const order=saved.tacticalOrder;
      const point=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.x>=0&&p.y>=0&&p.x<this.world.size&&p.y<this.world.size;
      unit.tacticalOrder = order&&['attackMove','guard','patrol'].includes(order.type)&&point(order.destination)&&point(order.origin)&&[0,1].includes(order.leg)&&(order.type!=='guard'||Number.isSafeInteger(order.protectedId)) ? JSON.parse(JSON.stringify(order)) : null;
      unit.typeDef = UNIT_TYPES[saved.type];
      unit.selected = false;
    }
    const byKind = {
      unit: new Map(this.units.map(unit => [unit.id, unit])),
      building: new Map(this.buildings.map(building => [building.id, building])),
      resource: worldNodes,
    };
    const resolve = ref => ref ? byKind[ref.kind]?.get(ref.id) || null : null;
    for (const unit of this.units) {
      const saved = (snapshot.units || []).find(entry => entry.id === unit.id);
      if (!saved) continue;
      unit.target = resolve(saved.target);
      unit.gatherTarget = resolve(saved.gatherTarget);
      unit.buildTarget = resolve(saved.buildTarget);
      unit.dropTarget = resolve(saved.dropTarget);
      unit.targetPos = saved.targetPos ? { ...saved.targetPos } : null;
    }
    // Restore gameplay transients only after all entity references exist.
    const finiteFields = (value, fields) => value && fields.every(k => Number.isFinite(value[k]));
    this.projectiles = (Array.isArray(snapshot.projectiles) ? snapshot.projectiles : [])
      .filter(p => finiteFields(p, ['x','y','damage','speed']) && p.damage >= 0 && p.speed >= 0)
      .map(p => ({ ...p, target: resolve(p.target), source: resolve(p.source) }))
      .filter(p => p.target);
    this.zones = (Array.isArray(snapshot.zones) ? snapshot.zones : [])
      .filter(z => finiteFields(z, ['x','y','r','delay','elapsed','damage']) && z.r >= 0 && z.elapsed >= 0)
      .map(z => ({ ...z, source: resolve(z.source) }));
    this.hero = snapshot.heroId ? byKind.unit.get(snapshot.heroId) || null : null;
    this.selection = (snapshot.selection || []).map(resolve).filter(Boolean);
    for (const entity of this.selection) entity.selected = true;
    this.nextId = Math.max(snapshot.nextId || 1, ...this.units.map(unit => unit.id + 1), ...this.buildings.map(building => building.id + 1));
    this.rng.restore(snapshot.rngState ?? (this.seed ^ 0x5f3759df));
    this.inMenu = true;
    this.paused = false;
    this.endShown = false;
    this.lastSignature = '';
    return true;
  }

  applyModifiers(mods = {}) {
    for (const [key, value] of Object.entries(mods)) {
      if (typeof value === 'boolean') this.effects[key] = value;
      else if (key.endsWith('Mul')) this.effects[key] = (this.effects[key] ?? 1) * value;
      else this.effects[key] = (this.effects[key] ?? 0) + value;
    }
  }

  get ageName() { return t(`age.${this.ageLevel}`); }

  hook(name, fn) { this.hooks[name] = fn; }
  toast(text, type = '', duration) { this.hooks.toast?.(text, type, duration); }

  buildInitialBase() {
    for(const b of INITIAL_BUILDINGS)this.addBuilding(b.type,b.x,b.y,true);

    const villagers = [
      this.spawnUnit('villager', 22.2, 29.2),
      this.spawnUnit('villager', 23.3, 29.5),
      this.spawnUnit('villager', 25.1, 29.4),
      this.spawnUnit('villager', 28.5, 29.6),
      this.spawnUnit('villager', 21.1, 27.7),
      this.spawnUnit('villager', 20.2, 26.9),
      this.spawnUnit('villager', 27.4, 29.1),
      this.spawnUnit('villager', 24.2, 30.2),
    ];
    this.spawnUnit('militia', 21.2, 24.2);
    this.spawnUnit('militia', 22.1, 24.7);
    this.spawnUnit('archer', 27.1, 24.6);
    if (!this.effects.noCavalry) this.spawnUnit('light_cavalry', 28.3, 26.3);
    this.hero = this.spawnUnit('commander', 25.4, 23.3, 'player', { hero: true });

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
    if (wood2) this.orderGather(villagers[6], wood2);
    if (food1) this.orderGather(villagers[7], food1);
  }

  start() {
    this.inMenu = false;
    this.camera.targetZoom = 1.12;
    this.paused = false;
    this.toast(t('toast.intro', { civ: t(`civ.${this.civ.id}.name`) }), '', 4800);
    setTimeout(() => this.toast(t('toast.heroReady'), '', 5200), 1500);
    setTimeout(() => this.toast(t('toast.stewardActive'), '', 4600), 3300);
  }

  focusAt(x, y) {
    const p = iso(clamp(x, 0.5, this.world.size - 0.5), clamp(y, 0.5, this.world.size - 0.5));
    this.camera.targetX = p.x;
    this.camera.targetY = p.y;
  }

  getTownCenter() { return this.buildings.find(b => b.type === 'core' && b.team === 'player' && b.alive); }
  get population() { return this.units.filter(u => u.alive && u.team === 'player').reduce((s, u) => s + (u.pop ?? u.typeDef.pop ?? 0), 0); }
  get militaryPopulation() { return this.units.filter(u => u.alive && u.team === 'player' && u.typeDef.category !== 'villager').reduce((s, u) => s + (u.pop ?? u.typeDef.pop ?? 0), 0); }
  get popCap() { return this.buildings.filter(b => b.alive && b.team === 'player' && b.construction >= 1).reduce((s, b) => s + (b.typeDef.pop || 0), 0); }
  // Issue8 §2.3: economy has its own budget; core20 + two houses10 = starting military40; later wave ceilings remain a separate reconciliation.
  get economicPopulation() { return this.units.filter(u=>u.alive&&u.team==='player'&&u.typeDef.category==='villager').reduce((n,u)=>n+(u.pop??u.typeDef.pop??0),0); }
  get economicPopCap() { return 60; }
  get militaryPopCap() { return Math.min(this.popCap,this.effects.militaryPopCap>0?this.effects.militaryPopCap:Infinity); }
  queuedPopulation(economic) {
    let total=0;
    for(const b of this.buildings)if(b.alive&&b.team==='player')for(const q of b.queue||[]){
      const def=UNIT_TYPES[q.type];
      if(def&&(def.category==='villager')===economic)total+=this.computeUnitPop(def);
    }
    return total;
  }
  hasPopulationRoom(type) {
    const def=UNIT_TYPES[type];if(!def)return false;
    const economic=def.category==='villager';
    const used=economic?this.economicPopulation:this.militaryPopulation;
    const cap=economic?this.economicPopCap:this.militaryPopCap;
    return used+this.queuedPopulation(economic)+this.computeUnitPop(def)<=cap;
  }
  get idleVillagers() { return this.units.filter(u => u.alive && u.team === 'player' && u.type === 'villager' && (u.state === 'idle' || u.state === 'hold')).length; }
  get enemiesAlive() { return this.units.filter(u => u.alive && u.team === 'enemy').length; }
  get ownedUnitCount() { return this.units.filter(u => u.alive && u.team === 'player').length; }
  get bossAlive() { return this.units.find(u => u.alive && u.team === 'enemy' && u.typeDef.boss) || null; }
  unitCategory(u) { return u.typeDef?.category || 'infantry'; }
  unitCategoryMul(u, kind) {
    const cat = this.unitCategory(u);
    if (cat === 'infantry') return this.effects[`infantry${kind}`] ?? 1;
    if (cat === 'cavalry') return this.effects[`cavalry${kind}`] ?? 1;
    if (cat === 'ranged') return this.effects[`ranged${kind}`] ?? 1;
    if (cat === 'siege') return this.effects[`siege${kind}`] ?? 1;
    return 1;
  }

  addBuilding(type, x, y, instant = false) {
    const def = BUILDING_TYPES[type];
    const military = ['barracks', 'range', 'stable', 'workshop'].includes(type);
    const newMaxHp = Math.round(def.hp * this.effects.buildingHpMul * (military ? this.effects.militaryBuildingHpMul : 1));
    const b = {
      id: this.nextId++, kind: 'building', team: 'player', type, typeDef: def,
      x, y, w: def.w, h: def.h, hp: instant ? newMaxHp : Math.round(newMaxHp * 0.14),
      maxHp: newMaxHp, baseMaxHp: def.hp, armor: def.armor || 6,
      construction: instant ? 1 : 0.02, alive: true, selected: false,
      queue: [], cooldown: this.rng() * 0.5, rally: null, hitFlash: 0,
    };
    this.buildings.push(b);
    if (type === 'tower' && this.effects.towerCartEvery > 0) {
      const towers = this.buildings.filter(x => x.alive && x.team === 'player' && x.type === 'tower').length;
      if (towers % this.effects.towerCartEvery === 0 && this.towerCartsSpawned < this.effects.towerCartCap) {
        this.towerCartsSpawned++;
        this.spawnUnit('patrol_cart', x + 3, y + 1);
      }
    }
    return b;
  }

  spawnUnit(type, x, y, team = 'player', options = {}) {
    const def = UNIT_TYPES[type];
    if (!def) return null;
    const maxHp = team === 'enemy'
      ? Math.round(def.hp * this.computeUnitHpMul(def, team))
      : this.computeUnitMaxHpFor(def, def.hp);
    const u = {
      id: this.nextId++, kind: 'unit', team, type, typeDef: def, combatAt: -99,
      x: clamp(x, 0.6, this.world.size - 0.6), y: clamp(y, 0.6, this.world.size - 0.6),
      hp: maxHp, maxHp, baseMaxHp: def.hp, pop: this.computeUnitPop(def),
      armor: (def.armor || 0) + (team === 'player' && def.category === 'infantry' ? this.effects.infantryArmor : 0),
      attack: def.attack * (team === 'enemy' ? 1 + this.waveIndex * 0.035 : 1),
      state: 'idle', target: null, targetPos: null, gatherTarget: null,
      buildTarget: null, carry: 0, carryType: null, cooldown: this.rng() * 0.4,
      attackAnim: 0, walkPhase: this.rng() * 6.28, facing: 1, visualDirection: 'SE', deathAnim: 0, selected: false,
      hitFlash: 0, alive: true, retargetTimer: this.rng() * 0.8, hold: false,
      stance: 'defensive', guardOrigin: { x, y }, manualAttack: false,
      idleTimer: this.rng(), buildingHint: options.buildingHint || null,
      hero: !!(def.hero || options.hero), shield: 0, shieldTime: 0, marked: 0, slowUntil: 0,
      shots: 0, rescueUsed: false, expireIn: options.expireIn || 0,
      bossSkillTimer: def.boss ? 6 : 0, rageStage: 0, summoned: !!options.summoned,
      markCd: 0, aegisCd: 0, eventFlags: [], eventSpeedMul: 1, eventAttackSpeedMul: 1,
      eventRegen: 0, buildingDamageMul: 1, convertResist: false, eventRetreat: 0,
      eventRetreatCd: 0, eventFireCd: 0, duel: false, chargeReady: true, chargeCd: 0,
    };
    const freeSpawn = (px,py) => this.isWalkable(px,py,u) && this.units.every(v=>!v.alive || dist(px,py,v.x,v.y)>=(u.typeDef.radius||.24)+(v.typeDef.radius||.24));
    if (!freeSpawn(u.x,u.y)) {
      let spawn = null;
      for (let r=.5;r<=5 && !spawn;r+=.5) for(let i=0;i<24;i++) {
        const a=i*Math.PI/12, px=x+Math.cos(a)*r, py=y+Math.sin(a)*r;
        if(freeSpawn(px,py)) {spawn={x:px,y:py};break;}
      }
      if (!spawn) return null;
      u.x=spawn.x;u.y=spawn.y;u.guardOrigin={...spawn};
    }
    this.units.push(u);
    this.crowd?.insert(u);
    if (u.hero && team === 'player') this.hero = u;
    return u;
  }

  computeUnitHpMul(def, team) {
    if (team === 'enemy') {
      return 1 + this.waveIndex * (def.boss ? 0.045 : 0.055);
    }
    if (def.category === 'hero') return this.effects.heroHpMul * (1 + (this.ageLevel - 1) * 0.1);
    if (def.category === 'villager') return 1;
    const category = this.effects[`${def.category}HpMul`] ?? 1;
    return this.effects.militaryHpMul * category * (1 + (this.ageLevel - 1) * 0.1);
  }

  computeUnitPop(def) {
    let pop = def.pop ?? 0;
    if (def.category === 'infantry') pop *= this.effects.infantryPopMul;
    return Math.round(pop * 2) / 2;
  }

  computeUnitMaxHpFor(def, baseHp) {
    let hp;
    if (def.category === 'villager') hp = baseHp + this.effects.villagerHpBonus;
    else if (def.category === 'hero') hp = baseHp * this.effects.heroHpMul * (1 + (this.ageLevel - 1) * 0.1);
    else hp = baseHp * this.effects.militaryHpMul * (this.effects[`${def.category}HpMul`] ?? 1) * (1 + (this.ageLevel - 1) * 0.1);
    return Math.round(hp);
  }

  computeUnitMaxHp(u) {
    if (u.team === 'enemy') return Math.round(u.baseMaxHp * this.computeUnitHpMul(u.typeDef, 'enemy'));
    return this.computeUnitMaxHpFor(u.typeDef, u.baseMaxHp);
  }

  refreshPlayerStats() {
    for (const u of this.units) {
      if (!u.alive || u.team !== 'player') continue;
      const oldMax = u.maxHp;
      u.maxHp = this.computeUnitMaxHp(u);
      if (u.maxHp > oldMax) u.hp = Math.min(u.maxHp, u.hp + u.maxHp - oldMax);
      else u.hp = Math.min(u.hp, u.maxHp);
      u.pop = this.computeUnitPop(u.typeDef);
      u.armor = (u.typeDef.armor || 0) + (u.typeDef.category === 'infantry' ? this.effects.infantryArmor : 0);
    }
  }

  refreshBuildingStats() {
    for (const b of this.buildings) {
      if (!b.alive || b.team !== 'player') continue;
      const oldMax = b.maxHp;
      b.maxHp = Math.round(b.baseMaxHp * this.effects.buildingHpMul);
      if (b.maxHp > oldMax) b.hp = Math.min(b.maxHp, b.hp + b.maxHp - oldMax);
      else b.hp = Math.min(b.hp, b.maxHp);
    }
  }

  spawnPrototype() {
    const tc = this.getTownCenter();
    const x = tc ? tc.x + tc.w + 1.5 : this.world.base.x + 3;
    const y = tc ? tc.y + 1 : this.world.base.y + 3;
    const u = this.spawnUnit('prototype', x, y);
    if (u) {
      this.sound?.prototype?.();
      this.toast(t('toast.prototype'), 'good', 3600);
    }
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
    u._nav = null; u._progress = null; u._goalProgress=null; u._yieldTo = null; u._trafficPriority=u.id; u.orderFailure=null;
    if (u.carry > 0 && u.carryType && u.carryType !== node.resource) {
      u.gatherTarget = node; this.beginReturn(u); return;
    }
    u.state = 'gather';
    u.gatherTarget = node;
    u.target = null;
    u.targetPos = { x: node.x, y: node.y };
  }

  findReachableResource(u, type) {
    return this.world.resources.filter(n => n.alive && n.amount > 0 && n.resource === type && (u.unreachableResources?.[n.id] || 0) <= this.time)
      .sort((a,b) => dist2(u.x,u.y,a.x,a.y)-dist2(u.x,u.y,b.x,b.y))[0] || null;
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
    if (u.team === 'player' && u.typeDef.category === 'ranged') r += this.effects.archerRange;
    if (u.team === 'player' && u.typeDef.category === 'siege') r += this.effects.siegeRange;
    const smoke = this.insideZone(u.x, u.y, 'smoke');
    if (smoke) r -= 1;
    return Math.max(smoke ? 2 : 0.5, r);
  }

  insideZone(x, y, kind) {
    return this.zones.some(zone => zone.persist && zone.kind === kind && dist(x, y, zone.x, zone.y) <= zone.r);
  }

  unitAttack(u) {
    if (u.team === 'enemy') return u.attack;
    let attack = u.attack;
    const category = this.unitCategory(u);
    if (category === 'infantry') attack *= this.effects.infantryDamageMul;
    else if (category === 'cavalry') attack *= this.effects.cavalryDamageMul;
    else if (category === 'ranged') attack *= this.effects.archerDamageMul;
    else if (category === 'hero') attack *= this.effects.heroDamageMul;
    attack *= 1 + (this.ageLevel - 1) * 0.1;
    if (this.effects.veteran) attack *= 1 + Math.min(0.4, this.stats.kills * 0.01);
    if (u.type === 'villager') attack += this.effects.villagerAttackBonus;
    if (this.nearBuildingAura('forge', u.x, u.y)) attack *= 1 + BUILDING_TYPES.forge.damageAura;
    return attack;
  }

  nearBuildingAura(type, x, y) {
    const def = BUILDING_TYPES[type];
    if (!def) return false;
    return this.buildings.some(b => b.alive && b.team === 'player' && b.type === type && b.construction >= 1 && dist(x, y, b.x + b.w / 2, b.y + b.h / 2) <= (def.auraRadius || 6));
  }

  damageMul(u) {
    if (u.team !== 'player' || !u.typeDef.attack) return 1;
    return this.unitAttack(u) / Math.max(1, u.typeDef.attack);
  }

  attackCooldown(u) {
    let cd = u.typeDef.cooldown;
    if (u.team === 'player') {
      const category = this.unitCategory(u);
      if (category === 'infantry') cd /= this.effects.infantryAttackSpeedMul;
      else if (category === 'ranged') cd /= this.effects.rangedAttackSpeedMul;
      else if (category === 'hero') cd /= this.effects.heroCooldownMul;
      if (!cd || !Number.isFinite(cd)) cd = u.typeDef.cooldown;
      cd /= this.effects.attackSpeedMul;
      // Ottoman ammo penalty: gunpowder reload 15% slower if unpaid
      if (this.civ?.id === 'TUR' && u.typeDef.family === 'R' && !this.ottomanAmmoPaid) {
        cd *= 1.15;
      }
    } else {
      cd /= u.eventAttackSpeedMul || 1;
      if (this.waveEnraged) cd /= 1.15;
    }
    return Math.max(0.25, cd);
  }

  unitSpeed(u) {
    let s = u.typeDef.speed;
    if (u.team === 'player') {
      if (u.typeDef.category === 'villager') s *= this.effects.villagerSpeedMul;
      else {
        s *= this.effects.militarySpeedMul;
        if (u.typeDef.category === 'cavalry') s *= this.effects.cavalrySpeedMul;
        if (u.typeDef.category === 'siege') s *= this.effects.siegeSpeedMul;
      }
    } else {
      s *= u.eventSpeedMul || 1;
      if (this.waveEnraged) s *= 1.12;
    }
    if (u.team === 'player' && this.insideZone(u.x, u.y, 'net')) s *= .6;
    if (u.slowUntil > this.time) s *= 1 - (u.slowAmount || 0.15);
    return s;
  }

  unitCost(type, viaMarket = false) {
    const def = UNIT_TYPES[type];
    const cost = { ...def.cost };
    let mul = viaMarket ? this.effects.marketHireCostMul : 1;
    if (def.category === 'infantry') mul *= this.effects.infantryCostMul;
    if (def.category === 'cavalry') mul *= this.effects.cavalryCostMul;
    if (def.category === 'siege') mul *= this.effects.siegeCostMul;
    if (type === 'elephant') mul *= this.effects.elephantCostMul;
    if (type === 'recruiter') mul *= this.effects.recruiterCostMul;
    if (['P', 'K'].includes(def.family)) mul *= this.effects.counterCostMul;
    for (const k of Object.keys(cost)) cost[k] = Math.round(cost[k] * mul);
    if (cost.gold) cost.gold = Math.round(cost.gold * this.effects.goldCostMul);
    return cost;
  }

  trainableFor(building) {
    const list=building.type==='market'&&this.effects.marketHiresAny?[...GENERIC_UNITS]:[...(TRAINABLE[building.type]||[])];
    if(building.type==='range'&&this.civ?.id==='CHN')list.push('chu_ko_nu');
    return list.filter(type=>!(this.effects.noCavalry&&UNIT_TYPES[type].category==='cavalry') && !(type==='elephant'&&!this.effects.elephantUnlocked));
  }

  trainingRestriction(type) {
    const def=UNIT_TYPES[type];
    if(!def || def.uniqueCiv&&def.uniqueCiv!==this.civ?.id)return 'civilization';
    if(this.effects.noCavalry&&def.category==='cavalry')return 'civilization';
    if(type==='elephant'&&!this.effects.elephantUnlocked)return 'civilization';
    if(def.minAge&&this.ageLevel<def.minAge)return 'age';
    return null;
  }

  canSetRally(b) {
    return !!(b?.alive && b.team==='player' && b.construction>=1 && this.trainableFor(b).length);
  }

  setRally(b, x, y, resource=null) {
    if(!this.canSetRally(b) || !Number.isFinite(x) || !Number.isFinite(y) || x<0 || y<0 || x>=this.world.size || y>=this.world.size)return false;
    if(!resource && !this.isWalkable(x,y,{team:'player',typeDef:{radius:.3}}))return false;
    b.rally={x,y,...(resource?.alive && resource.amount>0?{resourceId:resource.id}:{})};
    this.hooks.selectionChanged?.();return true;
  }

  applyRally(b,unit) {
    const r=b.rally;if(!r || !Number.isFinite(r.x) || !Number.isFinite(r.y))return false;
    if(unit.type==='villager' && r.resourceId!==undefined){
      const node=this.world.resources.find(n=>n.id===r.resourceId&&n.alive&&n.amount>0);
      if(node){this.orderGather(unit,node);return true;}
    }
    this.commandMove([unit],r.x,r.y);return true;
  }

  buildingCost(type) {
    const cost = { ...(BUILDING_TYPES[type]?.cost || {}) };
    if (type === 'tower') for (const k of Object.keys(cost)) cost[k] = Math.round(cost[k] * this.effects.towerCostMul);
    return cost;
  }

  ageCost(level = this.ageLevel) {
    const cost = { ...(AGE_COSTS[level] || {}) };
    for (const k of Object.keys(cost)) cost[k] = Math.round(cost[k] * this.effects.ageCostMul);
    return cost;
  }

  canAfford(cost) { return Object.entries(cost).every(([k, v]) => this.resources[k] >= v); }
  pay(cost) { for (const [k, v] of Object.entries(cost)) this.resources[k] -= v; }

  update(dt) {
    const baseDt = Math.max(0, Math.min(dt, 0.05));
    this.updateCamera(baseDt);
    if (this.inMenu || this.paused || this.phase === 'boon') { this.updateParticles(baseDt); return; }
    if (this.phase === 'victory' || this.phase === 'defeat') { this.updateParticles(baseDt); return; }
    dt = baseDt * (this.speed || 1);
    this.time += dt;
    this.updateAgeResearch(dt);

    if (this.phase === 'prep') {
      this.prepTimer -= dt;
      this.runTime += dt;
      if (this.prepTimer <= 0) this.startWave();
    } else if (this.phase === 'wave') {
      this.runTime += dt;
      this.updateWave(dt);
    }

    this.updateAutoAids(dt);
    this.updateHeroLife(dt);
    this.updateBuildings(dt);
    this.updateUnits(dt);
    this.updateProjectiles(dt);
    this.updateZones(dt);
    this.updateParticles(dt);
    this.updateMarkers(dt);
    this.checkRetreat();
    this.recalcSelection();
    this.enemyPressure = this.units.some(u => u.alive && u.team === 'enemy' && dist(u.x, u.y, this.world.base.x, this.world.base.y) < 8.5);
    this.refreshHover();
  }

  updateCamera(dt) {
    const speed = 720 / this.camera.zoom;
    let dx = 0, dy = 0;
    if (!this.heroControl) {
      if (this.keys.has('a') || this.keys.has('arrowleft')) dx -= 1;
      if (this.keys.has('d') || this.keys.has('arrowright')) dx += 1;
      if (this.keys.has('w') || this.keys.has('arrowup')) dy -= 1;
      if (this.keys.has('s') || this.keys.has('arrowdown')) dy += 1;
    }
    if (dx || dy) {
      const len = Math.hypot(dx, dy) || 1;
      this.camera.targetX += dx / len * speed * dt;
      this.camera.targetY += dy / len * speed * dt;
    }
    if (this.heroControl && this.hero?.alive) {
      const hp = iso(this.hero.x, this.hero.y);
      this.camera.targetX = hp.x;
      this.camera.targetY = hp.y;
    }
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
        b.foodStore = (b.foodStore || 0) + this.effects.farmMul * this.effects.foodMul * (b.typeDef.foodRate || 0.16) * dt;
        if (b.foodStore > 1) {
          const gain = b.foodStore;
          b.foodStore -= gain;
          this.resources.food += gain;
          this.stats.gathered += gain;
        }
        continue;
      }
      if (b.type === 'fishing_hut' && b.team === 'player') {
        // Viking: fishing huts work on inland wells
        const isViking = this.civ?.id === 'VIK';
        const requiresWater = b.typeDef.requiresWater && !isViking;
        if (!requiresWater || this.isNearWater(b.x, b.y, 5)) {
          // Cap at 4 per player for Vikings, standard for others
          const maxHuts = this.civ?.id === 'VIK' ? 4 : Infinity;
          const hutCount = this.buildings.filter(b => b.alive && b.team === 'player' && b.type === 'fishing_hut').length;
          if (hutCount <= maxHuts) {
            b.foodStore = (b.foodStore || 0) + this.effects.farmMul * this.effects.foodMul * (b.typeDef.foodRate || 0.5) * dt;
            if (b.foodStore > 1) {
              const gain = b.foodStore;
              b.foodStore -= gain;
              this.resources.food += gain;
              this.stats.gathered += gain;
            }
          }
        }
        continue;
        if (b.foodStore > 1) {
          const gain = b.foodStore;
          b.foodStore -= gain;
          this.resources.food += gain;
          this.stats.gathered += gain;
        }
        continue;
      }
      if (b.type === 'market' && b.team === 'player') {
        b.goldStore = (b.goldStore || 0) + (b.typeDef.goldRate || 0.08) * dt;
        if (b.goldStore > 1) {
          const gain = b.goldStore;
          b.goldStore -= gain;
          this.resources.gold += gain;
          this.stats.gathered += gain;
        }
        continue;
      }
      if (b.type === 'shrine' && b.team === 'player') {
        const radius = b.typeDef.healRadius || 5;
        const rate = (b.typeDef.healRate || 2) * dt;
        for (const u of this.units) {
          if (!u.alive || u.team !== 'player' || u.hp >= u.maxHp) continue;
          if (dist(u.x, u.y, b.x + b.w / 2, b.y + b.h / 2) <= radius) u.hp = Math.min(u.maxHp, u.hp + rate);
        }
        continue;
      }
      const shoots = b.type === 'core' || b.type === 'tower' || (b.type === 'house' && this.effects.houseArrows);
      if (shoots) {
        b.cooldown -= dt;
        if (b.cooldown <= 0) {
          let range = b.typeDef.range || 5;
          if (b.type === 'tower') range += this.effects.towerRange;
          if (b.type === 'house') range = 4;
          const target = this.nearestEnemyAt(b.x + b.w / 2, b.y + b.h / 2, range);
          if (target) {
            let damage = b.typeDef.attack || (b.type === 'house' ? 6 : 4);
            if (b.type === 'tower') damage *= this.effects.towerDamageMul;
            this.spawnProjectile(b.x + b.w / 2, b.y + b.h / 2 - 0.5, target, damage, 'player', 0.9, b);
            b.cooldown = b.type === 'house' ? 2 : (b.typeDef.cooldown || 1.5);
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
          const centerX = b.x + b.w / 2, centerY = b.y + b.h / 2;
          const angle = b.rally
            ? Math.atan2(b.rally.y - centerY, b.rally.x - centerX)
            : this.rng() * Math.PI * 2;
          const sx = centerX + Math.cos(angle) * (b.w / 2 + 0.8);
          const sy = centerY + Math.sin(angle) * (b.h / 2 + 0.8);
          const unit = this.spawnUnit(item.type, sx, sy, 'player');
          // Retain the paid queue item if every spawn position is occupied.
          if(!unit){item.remaining=0;continue;}
          this.stats.trained++;
          if (!this.applyRally(b,unit) && item.type === 'villager') {
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
    if(this.crowd)this.crowd.rebuild(this.units);else this.crowd=new Crowd(this.units);
    const active = new Set(this.units.filter(u=>u.alive && ['move','attack','gather','return','build'].includes(u.state)).map(u=>u.id));
    this.navigationQueue = (this.navigationQueue || []).filter(id=>active.has(id));
    this.navigationQueued = new Set(this.navigationQueue);
    this.navigationRequested = new Set();
    const previous = this.navigationStats || {};
    this.navigationStats = { searches: 0, expanded: 0, ms: 0, directRoutes: 0, routeReuses: 0, totalDirectRoutes: previous.totalDirectRoutes || 0, totalSearches: previous.totalSearches || 0 };
    this.navigationBudget = 2; // Avoid an A* stampede; waiting units retain their orders.
    for (const u of this.units) {
      if (!u.alive) { u.deathAnim = Math.max(0, (u.deathAnim || 0) - dt); continue; }
      u.cooldown = Math.max(0, u.cooldown - dt);
      u.attackAnim = Math.max(0, u.attackAnim - dt * 5.5);
      u.hitFlash = Math.max(0, u.hitFlash - dt * 5);
      if (u.shieldTime > 0) {
        u.shieldTime = Math.max(0, u.shieldTime - dt);
        if (u.shieldTime === 0) u.shield = 0;
      }
      u.marked = Math.max(0, u.marked - dt);
      u.eventRetreat = Math.max(0, (u.eventRetreat || 0) - dt);
      u.eventRetreatCd = Math.max(0, (u.eventRetreatCd || 0) - dt);
      u.eventFireCd = Math.max(0, (u.eventFireCd || 0) - dt);
      if (u.team === 'enemy' && u.eventRegen > 0 && u.hp < u.maxHp) u.hp = Math.min(u.maxHp, u.hp + u.maxHp * u.eventRegen * dt);
      if (u.markCd > 0) u.markCd = Math.max(0, u.markCd - dt);
      if (u.aegisCd > 0) u.aegisCd = Math.max(0, u.aegisCd - dt);
      if (u.chargeCd > 0) {
        u.chargeCd = Math.max(0, u.chargeCd - dt);
        if (u.chargeCd === 0) u.chargeReady = true;
      }
      if (u.expireIn > 0) {
        u.expireIn -= dt;
        if (u.expireIn <= 0) { this.killEntity(u, null); continue; }
      }
      if (u.team === 'player' && u.typeDef.category !== 'villager' && this.effects.unitRegen > 0 && u.hp < u.maxHp) {
        u.hp = Math.min(u.maxHp, u.hp + u.maxHp * this.effects.unitRegen * dt);
      }
      if (u.team === 'player' && u.typeDef.category === 'infantry' && this.effects.infantryRegen > 0 && u.hp < u.maxHp && this.time - (u.combatAt || -99) > 5) {
        u.hp = Math.min(u.maxHp, u.hp + u.maxHp * this.effects.infantryRegen * dt);
      }
      if (u.hero && this.heroControl && u.team === 'player') {
        this.updateHeroDirect(u, dt);
        continue;
      }
      if (u.team === 'enemy') this.updateEnemy(u, dt);
      else this.updatePlayerUnit(u, dt);
    }
    this.navigationQueue = this.navigationQueue.filter(id=>this.navigationRequested.has(id));
    this.navigationQueued = new Set(this.navigationQueue);
  }

  updateHeroDirect(u, dt) {
    let dx = 0, dy = 0;
    if (this.keys.has('w') || this.keys.has('arrowup')) { dx -= 1; dy -= 1; }
    if (this.keys.has('s') || this.keys.has('arrowdown')) { dx += 1; dy += 1; }
    if (this.keys.has('a') || this.keys.has('arrowleft')) { dx -= 1; dy += 1; }
    if (this.keys.has('d') || this.keys.has('arrowright')) { dx += 1; dy -= 1; }
    if (dx || dy) {
      const len = Math.hypot(dx, dy);
      const speed = this.unitSpeed(u);
      const nx = u.x + dx / len * speed * dt;
      const ny = u.y + dy / len * speed * dt;
      const next = this.crowd ? this.crowd.steer(u,{x:nx,y:ny},(a,b)=>this.segmentWalkable(a,b,u),this.time) : {x:nx,y:ny};
      if(next && this.segmentWalkable(u,next,u)) {u.x=next.x;u.y=next.y;this.crowd?.moved(u);}
      u.guardOrigin={x:u.x,y:u.y};
      u.walkPhase += speed * dt * 5.3;
      u.facing = dx >= 0 ? 1 : -1;
      u.visualDirection = visualDirectionFromVector(dx, dy, u.visualDirection);
      u.state = 'move';
      u.targetPos = null;
    } else {
      u.state = 'hold';
      if (u.cooldown <= 0) {
        const near = u.stance === 'passive' ? null : this.acquireTarget(u, Math.max(1.5, this.unitRange(u) + 0.5));
        if (near) this.attackUnit(u, near);
      }
    }
  }

  updateHeroLife(dt) {
    if (this.hero?.alive) return;
    if (this.heroReviveTimer <= 0) return;
    this.heroReviveTimer -= dt;
    if (this.heroReviveTimer <= 0) {
      const tc = this.getTownCenter();
      if (!tc) return;
      const cost = { gold: 100 };
      if (!this.canAfford(cost)) {
        this.heroReviveTimer = 12;
        this.toast(t('toast.heroGold'), 'bad', 2600);
        return;
      }
      this.pay(cost);
      this.hero = this.spawnUnit('commander', tc.x + tc.w / 2 + 1.2, tc.y + tc.h + 0.8);
      this.hero.hp = Math.round(this.hero.maxHp * 0.6);
      this.toast(t('toast.heroReturn'), 'good', 3000);
      this.sound?.complete();
    }
  }

  updateAutoAids(dt) {
    const timers = this.autoTimers;
    if (this.autoEconomy) {
      timers.gather += dt;
      timers.villager += dt;
      if (timers.gather >= 2.4) {
        timers.gather = 0;
        this.autoAssignVillagers();
      }
      if (timers.villager >= 11) {
        timers.villager = 0;
        const tc = this.getTownCenter();
        const villagers = this.units.filter(u => u.alive && u.team === 'player' && u.type === 'villager').length;
        if (tc && !tc.queue.length && villagers < 22 && this.hasPopulationRoom('villager') && this.resources.food >= 70) {
          this.trainUnit(tc, 'villager', true);
        }
      }
    }
    if (this.autoMilitary) {
      timers.military += dt;
      if (timers.military >= 13) {
        timers.military = 0;
        this.autoTrainSoldier();
      }
    }
  }

  autoAssignVillagers() {
    const idle = this.units.filter(u => u.alive && u.team === 'player' && u.type === 'villager' && u.state === 'idle');
    if (!idle.length) return;
    const counts = { food: 0, wood: 0, gold: 0, stone: 0 };
    for (const u of this.units) {
      if (!u.alive || u.team !== 'player' || u.type !== 'villager' || u.state === 'idle') continue;
      const type = u.gatherTarget?.resource || u.carryType || (u.dropTarget ? 'food' : null);
      if (type) counts[type] = (counts[type] || 0) + 1;
    }
    const order = ['food', 'wood', 'gold', 'stone'];
    const target = { food: 0.34, wood: 0.32, gold: 0.22, stone: 0.12 };
    let pickType = null, best = -1;
    for (const type of order) {
      const ratio = counts[type] / Math.max(1, Object.values(counts).reduce((a, b) => a + b, 0));
      if (target[type] - ratio > best && this.findResource(type, this.world.base.x, this.world.base.y)) {
        best = target[type] - ratio;
        pickType = type;
      }
    }
    if (!pickType) pickType = 'wood';
    for (const u of idle) {
      if(u.carry>0) {this.beginReturn(u);continue;}
      const node = this.findReachableResource(u, pickType) || this.findReachableResource(u, 'wood') || this.findReachableResource(u, 'food');
      if (node) this.orderGather(u, node);
    }
  }

  autoTrainSoldier() {
    const options = [
      ['barracks', 'spearman'], ['range', 'archer'], ['stable', 'light_cavalry'],
      ['barracks', 'militia'], ['range', 'skirmisher'], ['stable', 'horse_archer'],
      ['workshop', 'ram'], ['barracks', 'guard'],
    ];
    const enemies = this.units.filter(u => u.alive && u.team === 'enemy');
    const cavalry = enemies.filter(u => u.typeDef.category === 'cavalry').length;
    if (cavalry > 2) options.unshift(['barracks', 'spearman'], ['barracks', 'spearman']);
    for (const [type, unitType] of options) {
      if (unitType === 'elephant' && !this.effects.elephantUnlocked) continue;
      const b = this.buildings.find(x => x.alive && x.team === 'player' && x.type === type && x.construction >= 1 && !x.queue.length);
      if (!b) continue;
      const def = UNIT_TYPES[unitType];
      if (this.effects.noCavalry && def.category === 'cavalry') continue;
      if (def.category !== 'villager' && this.effects.militaryPopCap > 0 && this.militaryPopulation + this.computeUnitPop(def) > this.effects.militaryPopCap) continue;
      if (!this.hasPopulationRoom(unitType)) continue;
      if (!this.canAfford(this.unitCost(unitType))) continue;
      this.trainUnit(b, unitType, true);
      return;
    }
  }

  updateEnemy(u, dt) {
    if (u.waveWithdrawal) return this.updateWaveWithdrawal(u, dt);
    if (u.typeDef.boss) this.updateBoss(u, dt);
    const flags = this.waveEventActive ? (u.eventFlags || []) : [];
    if (u.eventRetreat > 0) {
      const camp = this.world.camps[(u.spawnGate || 0) % this.world.camps.length];
      if (camp) this.stepToward(u, camp.x, camp.y, dt);
      u.state = 'move';
      return;
    }
    if (flags.includes('kite') && u.typeDef.category === 'ranged' && u.eventRetreatCd <= 0 && (u.kiteCount || 0) < 2) {
      const threat = this.units.find(o => o.alive && o.team === 'player' && o.typeDef.category === 'infantry' && dist(o.x, o.y, u.x, u.y) < 2);
      if (threat) { u.eventRetreat = 1.6; u.eventRetreatCd = 4.2; u.kiteCount = (u.kiteCount || 0) + 1; }
    }
    if (flags.includes('morale') && !u.moraleUsed && u.hp / u.maxHp < .3) {
      u.moraleUsed = true;
      u.eventRetreat = 2.4;
    }
    if ((flags.includes('lure') && !u.lureUsed) || (flags.includes('feint') && !u.feintUsed && this.waveClock > 8)) {
      const near = this.units.some(o => o.alive && o.team === 'player' && dist(o.x, o.y, u.x, u.y) < 3.4);
      if (near) {
        if (flags.includes('lure')) u.lureUsed = true;
        if (flags.includes('feint')) u.feintUsed = true;
        u.eventRetreat = 2.2;
      }
    }
    u.retargetTimer -= dt;

    // Stuck handling: 8s no progress -> recalculate, 16s -> escape to gate
    if (u.target && u.targetValid !== false) {
      const prevDist = u._lastTargetDist || Infinity;
      const currDist = dist2(u.x, u.y, u.target.x, u.target.y);
      if (currDist >= prevDist - 0.01) {
        u._stuckTimer = (u._stuckTimer || 0) + dt;
        if (u._stuckTimer > 8 && !u._recalculated) {
          u._recalculated = true;
          u.retargetTimer = 0; // Force retarget
        } else if (u._stuckTimer > 16) {
          // Escape to original gate
          u.eventRetreat = 1;
          u.retreatGate = u.spawnGate || 0;
          u._stuckTimer = 0;
          u._recalculated = false;
        }
      } else {
        u._stuckTimer = 0;
        u._recalculated = false;
      }
      u._lastTargetDist = currDist;
    }

    const targetValid = u.target && u.target.alive;
    if (!targetValid || u.retargetTimer <= 0) {
      u.retargetTimer = 0.9 + this.rng() * 0.5;
      const tc = this.getTownCenter();
      const playerUnits = this.units.filter(o => o.alive && o.team === 'player');
      let priority = null;
      if (flags.includes('breach')) {
        priority = this.buildings
          .filter(b => b.alive && b.team === 'player')
          .sort((a, b) => a.hp - b.hp)[0] || null;
      } else if (flags.includes('raid') && u.typeDef.category === 'cavalry' && this.waveClock - this.waveEventAt <= 20) {
        priority = this.buildings
          .filter(b => b.alive && b.team === 'player' && b.type === 'camp')
          .map(o => ({ o, d: dist2(u.x, u.y, o.x + o.w / 2, o.y + o.h / 2) }))
          .filter(entry => entry.d < 64)
          .sort((a, b) => a.d - b.d)[0]?.o || null;
      } else if (flags.includes('hunt') && u.typeDef.family === 'P') {
        priority = playerUnits
          .filter(o => o.typeDef.category === 'cavalry')
          .map(o => ({ o, d: dist2(u.x, u.y, o.x, o.y) }))
          .filter(entry => entry.d < 36)
          .sort((a, b) => a.d - b.d)[0]?.o || null;
      }
      let best = priority, bestD = priority ? dist2(u.x, u.y, priority.x + (priority.w ? priority.w / 2 : 0), priority.y + (priority.h ? priority.h / 2 : 0)) : Infinity;
      if (!best) {
        for (const o of playerUnits) {
          const d = dist2(u.x, u.y, o.x, o.y);
          if (d < bestD && d < 49) { best = o; bestD = d; }
        }
      }
      if (best) u.target = best;
      else if (tc) u.target = tc;
      else u.target = null;
    }
    if (!u.target) {
      // No core or nearby player: stop advertising an obsolete movement order.
      u.state='idle';u._nav=null;
      return;
    }
    const target = u.target;
    const d = this.distanceTo(u, target);
    const range = this.unitRange(u) + (target.w ? 0 : target.typeDef.radius || 0.2);
    if (d <= range) {
      u.state = 'attack';
      if (u.cooldown <= 0) this.attackUnit(u, target);
    } else {
      u.state = 'move';
      this.stepToward(u, target.x + (target.w ? target.w / 2 : 0), target.y + (target.h ? target.h / 2 : 0), dt, Math.max(.35, range - .1), target.w ? target : null);
      this.tryAutoAttack(u, target);
    }
  }

  updateBoss(u, dt) {
    u.bossSkillTimer -= dt;
    if (u.bossSkillTimer <= 0) {
      u.bossSkillTimer = u.type === 'warlord2' ? 7.5 : 9;
      const tc = this.getTownCenter();
      const targets = this.units.filter(o => o.alive && o.team === 'player');
      let tx = tc ? tc.x + tc.w / 2 : this.world.base.x;
      let ty = tc ? tc.y + tc.h / 2 : this.world.base.y;
      if (targets.length) {
        let best = null, bestD = Infinity;
        for (const o of targets) {
          const d = dist2(o.x, o.y, u.x, u.y);
          if (d < bestD) { bestD = d; best = o; }
        }
        tx = best.x; ty = best.y;
      }
      this.zones.push({
        x: tx, y: ty, r: u.type === 'warlord2' ? 3.3 : 2.8,
        delay: 2.4, elapsed: 0, damage: u.type === 'warlord2' ? 105 : 65,
        source: u, kind: 'boss', done: false,
      });
      this.toast(t('toast.bossStrike', { name: t(`unit.${u.type}.name`) }), 'bad', 2400);
      this.sound?.horn();
    }
    const ratio = u.hp / u.maxHp;
    const stage = ratio < 0.3 ? 2 : ratio < 0.6 ? 1 : 0;
    if (stage > u.rageStage) {
      u.rageStage = stage;
      u.attack *= 1.12;
      u.bossSkillTimer = Math.min(u.bossSkillTimer, 2.5);
      this.toast(t('toast.bossPhase', { name: t(`unit.${u.type}.name`), stage: stage + 1 }), 'bad', 2800);
      const adds = u.type === 'warlord2' ? 4 : 3;
      for (let i = 0; i < adds; i++) {
        const a = this.rng() * Math.PI * 2;
        const add = this.spawnUnit(u.type === 'warlord2' ? 'marauder' : 'raider', u.x + Math.cos(a) * 2, u.y + Math.sin(a) * 2, 'enemy');
        if (add) { add.eventFlags = [...(u.eventFlags || [])]; this.applyEventMods(add); add.target = this.getTownCenter(); add.state = 'move'; }
      }
    }
  }

  tryAutoAttack(u, preferred) {
    if (u.cooldown > 0) return;
    const range = this.unitRange(u);
    const d = this.distanceTo(u, preferred) + (preferred.w ? 0 : (preferred.typeDef.radius || 0.2));
    if (d <= range + 0.3) {
      this.attackUnit(u, preferred);
    } else if (u.typeDef.range < 2) {
      const near = u.team === 'enemy' ? this.nearestPlayerTarget(u.x, u.y, 1.2) : this.nearestEnemyAt(u.x, u.y, 1.2);
      if (near) this.attackUnit(u, near);
    }
  }

  acquireTarget(u, radius = (u.typeDef.sight || 6)*.72) {
    if (u.stance === 'passive' || u.type === 'villager') return null;
    let best=null, bestD=radius*radius;
    const candidates = this.crowd ? this.crowd.nearby(u, Math.ceil(radius/2)+1) : this.units;
    for (const e of [...candidates, ...this.buildings]) {
      if (!e.alive || e.team !== 'enemy' || (u.blockedTargets?.[e.id]||0)>this.time) continue;
      if(u.stance==='defensive' && u.guardOrigin && this.distanceTo(u.guardOrigin,e)>8)continue;
      const d=this.distanceTo(u,e)**2;
      if(d<bestD){best=e;bestD=d;}
    }
    return best;
  }

  updatePlayerUnit(u, dt) {
    if (u.tacticalOrder && this.updateTacticalOrder(u,dt)) return;
    if (u.state === 'gather') return this.updateGather(u, dt);
    if (u.state === 'return') return this.updateReturn(u, dt);
    if (u.state === 'build') return this.updateBuild(u, dt);
    if (u.state === 'attack') {
      if (!u.target?.alive || u.target.team === u.team) {
        u.target = null; u.manualAttack = false;
        u.state = u.hold ? 'hold' : 'idle';
      } else return this.updateAttack(u, dt);
    }
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
        const near = this.acquireTarget(u, this.unitRange(u));
        if (near) { u.target = near; u.state = 'attack'; }
      }
      return;
    }
    if (u.state === 'idle') {
      if (u.type !== 'villager' && u.stance !== 'passive') {
        const sight = u.typeDef.sight + (u.typeDef.category === 'ranged' ? this.effects.archerSight : 0) + (u.typeDef.category === 'cavalry' ? this.effects.cavalrySight : 0);
        const near = this.acquireTarget(u, u.stance === 'hold' ? this.unitRange(u) : sight * 0.72);
        if (near) {
          u.guardOrigin ||= { x: u.x, y: u.y };
          u.manualAttack = false;
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
    if (u.typeDef.noAttack) { u.state = u.hold ? 'hold' : 'idle'; return; }
    const target = u.target;
    if (!target || !target.alive) { u.state = u.hold ? 'hold' : 'idle'; u.target = null; return; }
    if (!u.manualAttack && (u.stance === 'passive' || (u.stance === 'defensive' && u.guardOrigin && this.distanceTo({ x: u.guardOrigin.x, y: u.guardOrigin.y }, target) > 8))) {
      u.target = null; u.state = u.hold ? 'hold' : 'idle';
      if (u.stance === 'defensive' && u.guardOrigin) {
        u.targetPos = { ...u.guardOrigin }; u.state = 'move';
      }
      return;
    }
    const d = this.distanceTo(u, target);
    const range = this.unitRange(u) + (target.w ? -0.1 : (target.typeDef.radius || 0.2));
    if (d <= range) {
      if (u.cooldown <= 0) this.attackUnit(u, target);
    } else if (!u.hold && (u.manualAttack || u.stance !== 'hold')) {
      const status = this.stepToward(u, target.x + (target.w ? target.w / 2 : 0), target.y + (target.h ? target.h / 2 : 0), dt, Math.max(.35, range - .1), target.w ? target : null);
      if (status === 'unreachable' || status === 'congested') {
        u.blockedTargets ||= {}; u.blockedTargets[target.id] = this.time+8;
        u.orderFailure = status; u.target = null; u.manualAttack = false; u._nav = null;
        u.state = u.hold ? 'hold' : 'idle';
        const replacement=this.acquireTarget(u);
        if(replacement) {u.target=replacement;u.state='attack';}
        return;
      }
    } else {
      u.target = null; u.state = 'hold';
    }
    if (!u.manualAttack && u.retargetTimer !== undefined) {
      u.retargetTimer -= dt;
      if (u.retargetTimer <= 0) {
        u.retargetTimer = 0.7;
        const near = this.acquireTarget(u, Math.max(4, this.unitRange(u) + 2));
        if (near && dist2(near.x, near.y, target.x, target.y) < 16) u.target = near;
      }
    }
  }

  updateGather(u, dt) {
    const node = u.gatherTarget;
    if (u.carry > 0 && u.carryType && node && u.carryType !== node.resource) {this.beginReturn(u);return;}
    if (!node || !node.alive || node.amount <= 0) {
      if (u.carry > 0) { this.beginReturn(u); return; }
      u.state = 'idle';
      u.gatherTarget = null;
      u.targetPos = null;
      return;
    }
    const range = this.unitRange(u) + node.radius + 0.2;
    const d = dist(u.x, u.y, node.x, node.y);
    if (d > range) {
      const status = this.stepToward(u, node.x, node.y, dt, range * .95);
      if (status === 'unreachable' || status === 'congested') {
        u.unreachableResources ||= {}; u.unreachableResources[node.id] = this.time + 15;
        const next = this.findReachableResource(u, node.resource);
        if (next) this.orderGather(u, next);
        else { u.gatherTarget = null; u.targetPos = null; if (u.carry > 0) this.beginReturn(u); else u.state = 'idle'; }
      }
      return;
    }
    u.state = 'gather';
    const cap = 10 + this.effects.carryBonus;
    if (u.carry >= cap) {
      this.beginReturn(u);
      return;
    }
    let rate = 1.25;
    if (this.insideZone(u.x, u.y, 'drain')) rate *= .85;
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
    u._nav = null;
    const candidates=this.buildings.filter(b=>b.alive && b.team==='player' && b.construction>=1 && b.typeDef.dropoff && (u.unreachableDropoffs?.[b.id]||0)<=this.time);
    candidates.sort((a,b)=>this.distanceTo(u,a)-this.distanceTo(u,b));
    u.dropTarget=candidates[0]||null;
    u.state=u.dropTarget?'return':'idle';
    u.targetPos=null;
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

  // Find a walkable position at the building edge for resource dropoff
  findDropoffPosition(building) {
    if (!building || !building.alive) return null;
    const edgeDist = 1.2; // Distance from building edge
    const halfW = building.w / 2;
    const halfH = building.h / 2;
    const cx = building.x + halfW;
    const cy = building.y + halfH;
    
    // Try 8 directions around the building (N, NE, E, SE, S, SW, W, NW)
    const directions = [
      { dx: 0, dy: -1 },     // N
      { dx: 0.7, dy: -0.7 }, // NE
      { dx: 1, dy: 0 },      // E
      { dx: 0.7, dy: 0.7 },  // SE
      { dx: 0, dy: 1 },      // S
      { dx: -0.7, dy: 0.7 }, // SW
      { dx: -1, dy: 0 },     // W
      { dx: -0.7, dy: -0.7 }, // NW
    ];
    
    for (const dir of directions) {
      const tx = cx + dir.dx * (halfW + edgeDist);
      const ty = cy + dir.dy * (halfH + edgeDist);
      // Check if position is walkable (not inside building, not water, not blocked)
      if (this.isWalkable(tx, ty, null)) {
        return { x: tx, y: ty };
      }
    }
    
    // Fallback: try 16 directions with smaller steps
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const tx = cx + Math.cos(angle) * (Math.max(halfW, halfH) + edgeDist);
      const ty = cy + Math.sin(angle) * (Math.max(halfW, halfH) + edgeDist);
      if (this.isWalkable(tx, ty, null)) {
        return { x: tx, y: ty };
      }
    }
    
    // Last resort: return a position just outside the building bounds
    return { x: cx, y: cy + halfH + edgeDist };
  }

  updateReturn(u, dt) {
    const drop = u.dropTarget;
    if (!drop?.alive || !drop.typeDef.dropoff || drop.construction<1) {this.beginReturn(u);return;}
    if (this.distanceTo(u,drop) > .8) {
      const status=this.stepToward(u,drop.x+drop.w/2,drop.y+drop.h/2,dt,.75,drop);
      if(status==='unreachable') {
        u.unreachableDropoffs ||= {};u.unreachableDropoffs[drop.id]=this.time+15;this.beginReturn(u);
      }
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
    const d = this.distanceTo(u, b);
    if (d > 1.2) {
      this.stepToward(u, cx, cy, dt, 1.15, b);
      return;
    }
    u.state = 'build';
    const buildTime = b.typeDef.buildTime * (b.type === 'core' ? 0.7 : 1);
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
      this.addFloating(cx, cy, t('float.raised', { name: t(`building.${b.type}.name`) }), 'rgba(229,204,138,ALPHA)');
      this.toast(t('toast.buildingComplete', { name: t(`building.${b.type}.name`) }), 'good', 2200);
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
    const result = this.stepToward(u, u.targetPos.x, u.targetPos.y, dt);
    if(result==='unreachable')u.orderFailure='unreachable';
    return result === 'arrived' || result === 'unreachable';
  }

  stepToward(u, tx, ty, dt, range = 0, entity = null) {
    const walkable = (x, y) => this.isWalkable(x, y, u);
    walkable.segment = (a,b) => this.segmentWalkable(a,b,u);
    const target = { x: tx, y: ty };
    let nav = u._nav;
    if (!nav || Math.hypot(tx-nav.tx, ty-nav.ty) > .6 || nav.range !== range) {
      nav = u._nav = { tx, ty, range, points: [], status: 'pending', retryAt: 0, stalled: 0 };
    }
    if (entity ? this.distanceTo(u,entity)<=range : range && dist(u.x,u.y,tx,ty)<=range) return 'arrived';
    if (!range && walkable(tx, ty) && dist(u.x,u.y,tx,ty)<.08) return 'arrived';
    if (!range && nav.status === 'ready' && nav.goal && dist(u.x,u.y,nav.goal.x,nav.goal.y)<.08) return 'arrived';
    if (nav.status==='ready' && nav.points.length && this.navigationStats) this.navigationStats.routeReuses++;
    if ((!nav.points.length || nav.status !== 'ready') && this.time >= nav.retryAt) {
      // Sweep the complete segment first. A legal straight route does not need A*.
      // Dynamic collision avoidance still executes for every movement step below.
      if(!entity && !(u._avoidCrowdUntil>this.time)) {
        const distance=dist(u.x,u.y,tx,ty),stop=range?Math.max(0,distance-range*.98):distance;
        const goal=distance?{x:u.x+(tx-u.x)/distance*stop,y:u.y+(ty-u.y)/distance*stop}:{x:tx,y:ty};
        if(walkable(goal.x,goal.y) && segmentClear(walkable,u,goal)) {
          nav.status='ready';nav.points=[goal];nav.goal=goal;nav.stalled=0;nav.crowdDetour=false;
          if(this.navigationStats){this.navigationStats.directRoutes++;this.navigationStats.totalDirectRoutes++;}
        }
      }
    }
    if ((!nav.points.length || nav.status !== 'ready') && this.time >= nav.retryAt) {
      this.navigationRequested?.add(u.id);
      this.navigationQueue ||= []; this.navigationQueued ||= new Set();
      if(!this.navigationQueued.has(u.id)) {this.navigationQueue.push(u.id);this.navigationQueued.add(u.id);}
      if ((this.navigationBudget ?? 2) <= 0 || this.navigationQueue[0] !== u.id) return 'pending';
      this.navigationQueue.shift();this.navigationQueued.delete(u.id);
      this.navigationBudget = (this.navigationBudget ?? 2)-1;
      const searchStart = performance.now();
      const occupied = this.crowd && u._avoidCrowdUntil > this.time ? this.crowd.nearby(u,2).filter(v=>['idle','hold','gather'].includes(v.state)) : [];
      const planWalkable=(x,y)=>walkable(x,y) && occupied.every(v=>dist(x,y,v.x,v.y)>=(u.typeDef.radius||.24)+(v.typeDef.radius||.24));
      planWalkable.segment=(a,b)=>walkable.segment(a,b) && occupied.every(v=>{
        const dx=b.x-a.x,dy=b.y-a.y,len=dx*dx+dy*dy,t=len?clamp(((v.x-a.x)*dx+(v.y-a.y)*dy)/len,0,1):0;
        return dist(v.x,v.y,a.x+t*dx,a.y+t*dy)>=(u.typeDef.radius||.24)+(v.typeDef.radius||.24)-.015;
      });
      const path = findPath(u, target, occupied.length?planWalkable:walkable, this.world.size, {range:entity?range+Math.hypot(entity.w,entity.h)/2:range, goalTest:entity?p=>this.distanceTo(p,entity)<=range:null});
      if(this.navigationStats) {
        this.navigationStats.searches++; this.navigationStats.totalSearches++;
        this.navigationStats.expanded += path.expanded; this.navigationStats.ms += performance.now()-searchStart;
      }
      if(occupied.length && path.status==='unreachable') {nav.status='pending';nav.retryAt=this.time+1;return 'pending';}
      Object.assign(nav, path);nav.stalled=0;nav.crowdDetour=occupied.length>0;
      nav.retryAt=this.time+(path.status==='ready'?0:2);
    }
    if (nav.status !== 'ready') return nav.status;
    // Do not discard a ranged final endpoint while still outside the true interaction radius.
    // At60Hz a small step may stop within.07 of that endpoint but still outside range forever.
    while(nav.points.length && dist(u.x,u.y,nav.points[0].x,nav.points[0].y)<.07 && (nav.points.length>1 || !range)) nav.points.shift();
    if (!nav.points.length) {
      if (entity && this.distanceTo(u,entity)>range || !entity && range && dist(u.x,u.y,tx,ty)>range+.01) {nav.status='pending';nav.retryAt=this.time;return 'pending';}
      return 'arrived';
    }
    // Skip only fully collision-checked segments, never snap a unit to a waypoint.
    // A crowd-aware A* detour cannot be shortened using a static-only segment test.
    while(!nav.crowdDetour && nav.points.length>1 && segmentClear(walkable,u,nav.points[1])) nav.points.shift();
    const p=nav.points[0], d=dist(u.x,u.y,p.x,p.y), step=Math.min(d,this.unitSpeed(u)*dt);
    if(d<1e-9){nav.points=[];nav.status='pending';nav.retryAt=this.time;return 'pending';}
    const desired={x:u.x+(p.x-u.x)/d*step,y:u.y+(p.y-u.y)/d*step};
    u._heading={x:(p.x-u.x)/d,y:(p.y-u.y)/d};
    const next=this.crowd ? this.crowd.steer(u,desired,(a,b)=>segmentClear(walkable,a,b),this.time) : desired;
    if(next && segmentClear(walkable,u,next)) {
      const faceDx=next.x-u.x,faceDy=next.y-u.y;u.x=next.x;u.y=next.y;u.walkPhase+=step*5.3;u.facing=faceDx>=0?1:-1;u.visualDirection=visualDirectionFromVector(faceDx,faceDy,u.visualDirection);nav.stalled=0;
      this.crowd?.moved(u);
    } else {
      nav.stalled+=dt;
      if(nav.stalled>.3) {nav.points=[];nav.status='pending';nav.retryAt=this.time;}
    }
    const goalDistance=dist(u.x,u.y,tx,ty);
    if(!u._goalProgress || goalDistance<u._goalProgress.distance-.2) u._goalProgress={distance:goalDistance,at:this.time};
    else if(this.time-u._goalProgress.at>2) {
      u._avoidCrowdUntil=this.time+5;u._goalProgress={distance:goalDistance,at:this.time};
      nav.points=[];nav.status='pending';nav.retryAt=this.time;
    }
    const progress = u._progress;
    if(!progress || Math.hypot(u.x-progress.x,u.y-progress.y)>.4) u._progress={x:u.x,y:u.y,at:this.time};
    else if(this.time-progress.at>6) {
      u._progress={x:u.x,y:u.y,at:this.time}; nav.points=[];nav.status='pending';nav.retryAt=this.time;
      return 'congested';
    }
    return 'moving';
  }

  segmentWalkable(a,b,u) {
    if(!this.isWalkable(b.x,b.y,u))return false;
    const r=u?.typeDef?.radius ?? .24;
    for(const building of this.buildings) {
      if(!building.alive || u?.team==='player' && building.team==='player' && building.type==='gate' && building.construction>=1)continue;
      if(crossesRect(a,b,building.x-r-.02,building.y-r-.02,building.x+building.w+r+.02,building.y+building.h+r+.02))return false;
    }
    for(let x=Math.max(0,Math.floor(Math.min(a.x,b.x)-r));x<=Math.min(this.world.size-1,Math.floor(Math.max(a.x,b.x)+r));x++)
      for(let y=Math.max(0,Math.floor(Math.min(a.y,b.y)-r));y<=Math.min(this.world.size-1,Math.floor(Math.max(a.y,b.y)+r));y++) {
        if(this.world.tile(x+.5,y+.5)?.terrain==='water' && crossesRect(a,b,x-r,y-r,x+1+r,y+1+r))return false;
      }
    const dx=b.x-a.x,dy=b.y-a.y,len=dx*dx+dy*dy;
    for(const n of this.world.resources) {
      if(!n.alive || !['oak','pine'].includes(n.kind))continue;
      const t=len?clamp(((n.x-a.x)*dx+(n.y-a.y)*dy)/len,0,1):0;
      if(dist2(n.x,n.y,a.x+dx*t,a.y+dy*t)<(r+.22)**2)return false;
    }
    return true;
  }

  isWalkable(x, y, u) {
    const radius=u?.typeDef?.radius ?? .24;
    if (x < radius || y < radius || x > this.world.size-radius || y > this.world.size-radius) return false;
    for (const [dx,dy] of [[0,0],[radius,0],[-radius,0],[0,radius],[0,-radius],[radius,radius],[-radius,radius],[radius,-radius],[-radius,-radius]]) {
      const tile=this.world.tile(x+dx,y+dy);
      if(!tile || tile.terrain==='water')return false;
    }
    for (const b of this.buildings) {
      if (!b.alive) continue;
      if (u?.team==='player' && b.type==='gate' && b.construction>=1 && b.team==='player') continue;
      if (x>b.x-radius-.02 && x<b.x+b.w+radius+.02 && y>b.y-radius-.02 && y<b.y+b.h+radius+.02) return false;
    }
    for(const n of this.world.resources) {
      if(n.alive && ['oak','pine'].includes(n.kind) && dist2(x,y,n.x,n.y)<(radius+.22)**2)return false;
    }
    return true;
  }

  isNearWater(x, y, radius = 5) {
    // Check if there's water within radius
    const r = Math.ceil(radius);
    for (let dx = -r; dx <= r; dx++) {
      for (let dy = -r; dy <= r; dy++) {
        if (dx*dx + dy*dy <= radius*radius) {
          const tile = this.world.tile(x + dx, y + dy);
          if (tile && tile.terrain === 'water') return true;
        }
      }
    }
    return false;
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

  counterMultiplier(u, target) {
    if (!target) return 1;
    const a = u.typeDef.family;
    const t = target.typeDef?.family;
    if (target.w) {
      if (a === 'B') return 4;
      if (a === 'S') return 1.5;
      return this.unitCategory(u) === 'siege' ? 1.25 : 1;
    }
    if (a === 'P' && ['C', 'A', 'W'].includes(t)) return 2;
    if (a === 'K' && ['R', 'A'].includes(t)) return 1.6;
    if (a === 'C' && ['S', 'V'].includes(t)) return 1.5;
    if (a === 'B') return 0.25;
    if (['R', 'K', 'A'].includes(a) && t === 'B') return 0.25;
    return 1;
  }

  attackUnit(u, target) {
    if (!target || !target.alive || u.typeDef.noAttack) return;
    const def = u.typeDef;
    const newTarget = u.target !== target;
    u.combatAt = this.time;
    u.visualDirection = visualDirectionFromVector((target.x + (target.w || 0) / 2) - u.x, (target.y + (target.h || 0) / 2) - u.y, u.visualDirection);
    u.attackAnim = 1;
    u.cooldown = this.attackCooldown(u) + (u.team === 'player' && def.projectile && newTarget ? this.effects.archerFirstShotDelay : 0);
    u.state = 'attack';
    u.target = target;
    let damage = this.unitAttack(u) * this.counterMultiplier(u, target);
    if (u.team === 'player' && target.marked > 0) damage *= 1.1;
    const chargeHit = u.team === 'player' && u.type === 'light_cavalry' && u.chargeReady && !def.projectile;
    if (chargeHit) {
      damage += this.effects.cavalryChargeBonus;
      u.chargeReady = false;
      u.chargeCd = 10;
    }
    if (def.projectile) {
      this.spawnProjectile(u.x, u.y - 0.4, target, damage, u.team, 1, u);
      u.shots++;
      if (u.team === 'player' && this.effects.extraArrowEvery && u.shots % this.effects.extraArrowEvery === 0) {
        const second = this.nearestEnemyAt(target.x, target.y, 4.5) || target;
        this.spawnProjectile(u.x, u.y - 0.45, second, damage * this.effects.extraArrowDamageMul, u.team, 0.85, u);
      }
      this.sound?.arrow();
    } else {
      this.applyDamage(target, damage, u);
      // Spanish villager stun: first hit every 8s stuns non-boss for 0.5s
      if (u.team === 'player' && u.civ?.id === 'SPA' && u.type === 'villager' && !target.typeDef?.boss) {
        if (!target._stunCd || target._stunCd <= this.time) {
          target._stunCd = this.time + 8;
          target.slowUntil = this.time + 0.5;
          target.slowAmount = 1; // Fully stunned (speed = 0)
          this.addFloating(target.x, target.y, t('toast.spanishStun'), 'rgba(255,200,100,ALPHA)');
        }
      }
      if (u.team === 'player' && u.type === 'elephant' && this.effects.elephantTrample > 0) {
        let hit = 0;
        for (const e of this.units) {
          if (hit >= this.effects.elephantTrampleTargets) break;
          if (!e.alive || e.team !== 'enemy' || e === target) continue;
          if (dist(e.x, e.y, target.x + (target.w ? target.w / 2 : 0), target.y + (target.h ? target.h / 2 : 0)) > 1.5) continue;
          this.applyDamage(e, damage * this.effects.elephantTrample, u);
          hit++;
        }
      }
      this.sound?.attack();
      if (u.team === 'player' && this.selection.includes(u)) {
        this.addParticles(target.x + (target.w ? target.w / 2 : 0), target.y + (target.h ? target.h / 2 : 0), 'slash', 'rgba(244,226,178,ALPHA)', 1, 1, 0.35);
      }
    }
  }

  spawnProjectile(x, y, target, damage, team, scale = 1, source = null) {
    this.projectiles.push({
      x, y, target, tx: target.x + (target.w ? target.w / 2 : 0), ty: target.y + (target.h ? target.h / 2 : 0),
      team, damage, speed: 8.4, alive: true, scale, source,
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
        const source = p.source;
        this.applyDamage(target, p.damage, source);
        if (source?.typeDef?.family === 'S') {
          let hits = 0;
          for (const e of this.units) {
            if (e === target || !e.alive || e.team === source.team) continue;
            if (dist(e.x, e.y, target.x, target.y) > 1.5) continue;
            this.applyDamage(e, p.damage * 0.5, source);
            if (++hits >= 7) break;
          }
          this.addParticles(p.tx, p.ty, 'ring', 'rgba(227,166,85,ALPHA)', 1.8, 9, 0.55);
        }
        if (source?.team === 'player' && !target.w) {
          if (this.effects.slowOnHit > 0 && this.unitCategory(source) === 'ranged') {
            target.slowUntil = this.time + 1.5;
            target.slowAmount = this.effects.slowOnHit;
          }
          if (this.effects.splash > 0 && this.unitCategory(source) === 'ranged') {
            for (const e of this.units) {
              if (e === target || !e.alive || e.team !== 'enemy') continue;
              if (dist(e.x, e.y, target.x, target.y) <= 1.5) this.applyDamage(e, p.damage * this.effects.splash, source);
            }
            this.addParticles(target.x, target.y, 'ring', 'rgba(227,134,65,ALPHA)', 1, 4, 0.4);
          }
          if (this.effects.chainEvery && source.shots % this.effects.chainEvery === 0) {
            const chained = this.units
              .filter(e => e.alive && e.team === 'enemy' && e !== target && dist(e.x, e.y, target.x, target.y) <= 4)
              .slice(0, 2);
            for (const e of chained) this.applyDamage(e, p.damage * 0.55, source);
            this.addParticles(target.x, target.y, 'ring', 'rgba(137,190,222,ALPHA)', 1, 3, 0.35);
          }
        }
        this.sound?.hit();
        this.addParticles(p.tx, p.ty, 'spark', 'rgba(230,213,171,ALPHA)', 1, 4, 0.7);
        continue;
      }
      const step = Math.min(d, p.speed * dt);
      p.x += dx / d * step; p.y += dy / d * step;
    }
    this.projectiles = this.projectiles.filter(p => p.alive);
  }

  updateZones(dt) {
    for (const zone of this.zones) {
      zone.elapsed += dt;
      if (zone.persist) continue;
      if (!zone.done && zone.elapsed >= zone.delay) {
        zone.done = true;
        for (const u of this.units) {
          if (!u.alive || u.team !== 'player') continue;
          if (dist(u.x, u.y, zone.x, zone.y) <= zone.r) this.applyDamage(u, zone.damage, zone.source);
        }
        for (const b of this.buildings) {
          if (!b.alive || b.team !== 'player') continue;
          const dx = Math.max(b.x - zone.x, 0, zone.x - (b.x + b.w));
          const dy = Math.max(b.y - zone.y, 0, zone.y - (b.y + b.h));
          if (Math.hypot(dx, dy) <= zone.r) this.applyDamage(b, zone.damage * 0.8, zone.source);
        }
        this.addParticles(zone.x, zone.y, 'ring', 'rgba(229,92,68,ALPHA)', 2.2, 12, 0.8);
        this.addParticles(zone.x, zone.y, 'smoke', 'rgba(80,35,29,ALPHA)', 5, 12, 1.1);
        this.sound?.hit();
      }
    }
    this.zones = this.zones.filter(z => z.persist ? z.elapsed < (z.duration || 60) : z.elapsed < z.delay + 0.9);
  }

  applyDamage(target, amount, source) {
    if (!target || !target.alive) return;
    let damage = amount;
    if (this.waveEventActive && source?.team === 'enemy' && target.w && source.buildingDamageMul > 1) {
      const flags = source.eventFlags || [];
      const category = source.typeDef.category;
      if (category === 'siege' || flags.includes('breach') || (flags.includes('sapper') && category === 'infantry')) {
        damage *= source.buildingDamageMul;
      }
    }
    damage = Math.max(1, damage - (target.armor || 0) * 0.6);
    if (target.shield > 0) {
      const absorbed = Math.min(target.shield, damage);
      target.shield -= absorbed;
      damage -= absorbed;
      if (target.shield <= 0) target.shield = 0;
      if (damage <= 0) {
        this.addFloating(target.x, target.y, 'shielded', 'rgba(147,197,220,ALPHA)');
        return;
      }
    }

    // Japanese melee block: block one ordinary melee hit every 10s
    if (target.team === 'player' && target.civ?.id === 'JPN' && source && !source.typeDef?.projectile && !source.typeDef?.boss) {
      if (!target._blockCd || target._blockCd <= this.time) {
        target._blockCd = this.time + 10;
        this.addFloating(target.x, target.y, t('toast.japaneseBlock'), 'rgba(147,197,220,ALPHA)');
        return; // Block the attack completely
      }
    }
    if (target.team === 'enemy' && source?.team === 'player') this.director.recordDamage(source, damage);
    if (this.waveEventActive && source?.team === 'enemy' && target.team === 'player' && target.alive && source.eventFlags?.includes('fire') && source.typeDef.category === 'ranged' && (source.eventFireCd || 0) <= 0) {
      source.eventFireCd = 3;
      this.zones.push({ x: target.x, y: target.y, r: 1.7, delay: .45, damage: 8, source, kind: 'fire', elapsed: 0, done: false });
    }
    if (target.team === 'player' && !target.w && target.type !== 'villager' && source?.team === 'enemy' && source.alive && !target.manualAttack && ['idle', 'hold'].includes(target.state) && target.stance !== 'passive') {
      const canReach = !target.hold && target.stance !== 'hold' || this.distanceTo(target, source) <= this.unitRange(target);
      const insideGuard = target.stance !== 'defensive' || !target.guardOrigin || this.distanceTo(target.guardOrigin, source) <= 8;
      if (canReach && insideGuard) { target.target = source; target.state = 'attack'; }
    }
    target.combatAt = this.time;
    target.hp -= damage;
    target.hitFlash = 1;
    this.addParticles(target.x + (target.w ? target.w / 2 : 0), target.y + (target.h ? target.h / 2 : 0), 'spark', 'rgba(178,64,49,ALPHA)', 1, 4, 0.5);
    if (source?.team === 'player' && source.alive && this.effects.lifesteal > 0) {
      source.hp = Math.min(source.maxHp, source.hp + damage * this.effects.lifesteal);
    }
    if (target.team === 'player' && target.w && this.effects.thorns > 0 && source?.team === 'enemy' && !source.typeDef?.projectile) {
      this.applyDamage(source, damage * this.effects.thorns, null);
    }
    if (target.hp <= 0) {
      const elite = target.hero || ['knight', 'elephant', 'prototype', 'warlord', 'warlord2'].includes(target.type);
      if (target.team === 'player' && this.effects.rescue && elite && !target.rescueUsed) {
        target.rescueUsed = true;
        target.hp = 1;
        target.shield = 80;
        target.shieldTime = 6;
        this.toast(t('toast.rescue'), 'good', 3200);
        this.addParticles(target.x, target.y, 'ring', 'rgba(232,201,126,ALPHA)', 2, 8, 0.8);
        return;
      }
      this.killEntity(target, source);
    }
  }

  killEntity(target, source) {
    if (!target.alive) return;
    if (target.team === 'player' && target.typeDef?.category === 'villager') this.director.recordWorkerLoss();
    if (target.team === 'player' && target.typeDef?.category === 'infantry' && this.effects.infantryRefundRate > 0) {
      const room = Math.max(0, this.effects.infantryRefundCap - (this.infantryRefunded || 0));
      const refund = Math.min(room, Math.round((target.typeDef.cost?.food || 0) * this.effects.infantryRefundRate));
      if (refund > 0) {
        this.resources.food += refund;
        this.infantryRefunded = (this.infantryRefunded || 0) + refund;
        this.addFloating(target.x, target.y, `+${refund}f`, 'rgba(191,201,128,ALPHA)');
      }
    }
    target.alive = false;
    target.deathAnim = 1.2;
    for (const u of this.units) {
      if (u.target !== target) continue;
      u.target=null;u.manualAttack=false;u._nav=null;
      if(u.state==='attack') {
        u.state=u.hold?'hold':'idle';
        const next=u.team==='player'?this.acquireTarget(u):null;
        if(next){u.target=next;u.state='attack';}
      }
    }
    target.selected = false;
    if (target.w) {
      this.addParticles(target.x + target.w / 2, target.y + target.h / 2, 'smoke', 'rgba(67,58,45,ALPHA)', 6, 12, 1.4);
      this.addParticles(target.x + target.w / 2, target.y + target.h / 2, 'spark', 'rgba(212,128,75,ALPHA)', 2, 14, 1.0);
      if (target.type === 'core') this.triggerDefeat();
      if (target.team === 'player') {
        const key = target.w ? `building.${target.type}.name` : `unit.${target.type}.name`;
        this.toast(t('toast.destroyed', { name: t(key) }), 'bad', 3200);
      }
    } else {
      this.addParticles(target.x, target.y, 'spark', 'rgba(157,58,45,ALPHA)', 1.2, 8, 0.7);
      this.addParticles(target.x, target.y, 'smoke', 'rgba(61,48,36,ALPHA)', 3, 4, 1.1);
      if (target.hero && target.team === 'player') {
        this.heroReviveTimer = 30;
        this.heroControl = false;
        this.heroSkillPreview = null;
        this.toast(t('toast.heroFallen'), 'bad', 5000);
      } else {
        this.addFloating(target.x, target.y, 'slain', 'rgba(216,190,150,ALPHA)');
      }
      if (target.team === 'enemy') {
        this.stats.kills++;
        const bounty = (target.typeDef.bounty || 0) + this.effects.bountyGold;
        this.resources.gold += bounty;
        if (bounty > 0) this.addFloating(target.x, target.y, `+${Math.round(bounty)}g`, 'rgba(223,190,102,ALPHA)');
        if (this.effects.killGoldRate > 0 && this.killGoldEarned < this.effects.killGoldCap) {
          const gain = Math.min(12, this.effects.killGoldCap - this.killGoldEarned);
          this.killGoldEarned += gain;
          this.resources.gold += gain;
        }
        if (this.effects.killFoodRate > 0 && this.killFoodEarned < this.effects.killFoodCap) {
          const gain = Math.min(14, this.effects.killFoodCap - this.killFoodEarned);
          this.killFoodEarned += gain;
          this.resources.food += gain;
        }
        if (this.effects.convertChance > 0 && !target.typeDef.boss && !target.convertResist && this.rng() < this.effects.convertChance) {
          const convert = this.spawnUnit('militia', target.x, target.y, 'player', { summoned: true, expireIn: 20 });
          if (convert) {
            convert.hp = convert.maxHp;
            this.addParticles(target.x, target.y, 'ring', 'rgba(129,181,199,ALPHA)', 1.5, 6, 0.7);
            this.toast(t('toast.converted'), 'good', 2200);
          }
        }
        if (target.duel) {
          if (this.hero?.alive) {
            this.hero.shield = Math.max(this.hero.shield, 60);
            this.hero.shieldTime = Math.max(this.hero.shieldTime || 0, 5);
          }
          this.toast(t('toast.duelWon'), 'good', 3200);
        }
        if (target.typeDef.boss) {
          this.sound?.victory();
          this.toast(t('toast.bossBroken', { name: t(`unit.${target.type}.name`) }), 'good', 4200);
        } else {
          this.sound?.hit();
        }
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
    this.stats.waves = WAVES.length;
    setTimeout(() => this.showEnd(true), 1600);
  }

  showEnd(victory) {
    if (this.endShown) return;
    this.endShown = true;
    this.hooks.end?.(victory, {
      waves: victory ? WAVES.length : this.waveIndex,
      kills: this.stats.kills,
      gathered: this.stats.gathered,
      assists: this.stats.assists || 0,
      time: this.runTime,
      civId: this.civ.id,
      biomeId: this.biome.id,
    });
  }

  prepareNextWavePlan() {
    const wave = WAVES[Math.min(this.waveIndex, WAVES.length - 1)];
    const plan = this.director.planWave({
      wave,
      waveIndex: this.waveIndex,
      civ: this.civ,
      report: this.lastWaveReport,
      camps: this.world.camps,
      prepSeconds: this.prepTotal,
    });
    applyDifficulty(plan, this.difficulty);
    applyCycle(plan, this.cycle);
    this.pendingWavePlan = plan;
    this.intel = plan.intel;
    this.waveName = t(`wave.${this.waveIndex}.name`);
    return plan;
  }

  spawnRiftfallHazards(plan) {
    if (!plan?.hazard || plan.hazard.suppressed) return;
    const base = this.world.base;
    for (const gate of plan.hazard.gates) {
      const camp = this.world.camps[gate];
      if (!camp) continue;
      const t = .56;
      const x = camp.x + (base.x - camp.x) * t;
      const y = camp.y + (base.y - camp.y) * t;
      this.zones.push({
        x, y, r: plan.hazard.radius, delay: plan.hazard.delay,
        damage: plan.hazard.damage, source: null, kind: 'hazard',
        elapsed: 0, done: false,
      });
    }
  }

  startWave() {
    this.bossExtensionActive=false;
    this.bossExtensionReinforcements=0;
    this.bossExtensionWarned=false;
    this.waveRetreatStarted=false; this.waveCleanupDone=false; this.waveClearSeconds=0;
    const wave = WAVES[Math.min(this.waveIndex, WAVES.length - 1)];
    const plan = this.pendingWavePlan?.waveIndex === this.waveIndex
      ? this.pendingWavePlan
      : this.prepareNextWavePlan();
    this.pendingWavePlan = null;
    this.intel = plan.intel;
    this.waveEvent = plan.event || null;
    this.waveEventMods = plan.eventMods || {};
    this.waveEventZone = plan.eventZone || null;
    this.waveEventAt = [20, 20, 25, 25, 45, 20, 30, 25, 30, 45][this.waveIndex] ?? 20;
    this.waveEventActive = !this.waveEvent;
    this.waveEventWarned = false;
    this.waveDuelAssigned = false;
    this.director.beginWave();
    this.infantryRefunded = 0;
    this.assistActive = false;
    this.phase = 'wave';
    this.waveName = t(`wave.${this.waveIndex}.name`);
    this.waveClock = 0;
    this.waveEnraged = false;
    this.waveEndTimer = 0;
    this.waveSpawns = plan.spawns.map(group => ({ ...group, spawned: false }));
    this.waveTotal = plan.totalUnits;
    this.waveInitialThreat = this.waveSpawns.reduce((sum,group)=>sum+Object.entries(group.units).reduce((n,[type,count])=>n+unitThreat(type)*count,0),0);
    const tc = this.getTownCenter();
    if (plan.hazard && tc && tc.hp / tc.maxHp < .3 && !this.director.terrainAssistUsed) {
      plan.hazard.suppressed = true;
      plan.intel.hazard = plan.hazard;
      plan.intel.assist = t('intel.assistDisabled');
      this.director.terrainAssistUsed = true;
      this.assistActive = true;
      this.stats.assists = (this.stats.assists || 0) + 1;
      this.director.assistLog.push({ wave: this.waveIndex, type: 'terrain-hazard', message: plan.intel.assist });
      this.toast(t('intel.assistToast'), 'good', 5200);
    } else {
      this.spawnRiftfallHazards(plan);
    }
    for (const u of this.units) if (u.alive && u.team === 'player') u.rescueUsed = false;

    if (this.effects.decoyWave > 0) {
      const tc = this.getTownCenter();
      for (let i = 0; i < this.effects.decoyWave; i++) {
        const decoy = this.spawnUnit('decoy', (tc?.x || this.world.base.x) + 2 + i, (tc?.y || this.world.base.y) + 4, 'player', { expireIn: 45 });
        if (decoy) decoy.state = 'hold';
      }
    }

    this.sound?.horn();
    const gates = [...new Set(this.waveSpawns.map(g => g.gate % this.world.camps.length))];
    const dirs = gates.map(gate => t(`camp.${gate}`)).join(' · ');
    this.toast(t('toast.raidersApproach', { gates: dirs }), 'bad', 4200);
    if (wave.boss) {
      const bossGroup = this.waveSpawns.find(g => Object.keys(g.units).some(type => UNIT_TYPES[type]?.boss));
      const at = bossGroup ? bossGroup.at : 0;
      setTimeout(() => {
        const boss = this.bossAlive;
        if (boss) this.toast(t('toast.bossEntered', { name: t(`unit.${boss.type}.name`) }), 'bad', 5000);
      }, (at + 0.8) * 1000);
    }
  }

  updateWave(dt) {
    if (this.phase !== 'wave') return;
    const core=this.getTownCenter();
    if (!core || core.hp<=0) { this.triggerDefeat(); return; }
    // Recover original scheduled budget for older saves, never derive the cap from survivors alone.
    this.waveInitialThreat ||= this.waveSpawns.reduce((sum,group)=>sum+Object.entries(group.units).reduce((n,[type,count])=>n+unitThreat(type)*count,0),0) || this.units.filter(u=>u.alive&&u.team==='enemy').reduce((n,u)=>n+unitThreat(u.type),0);
    this.waveClock += dt;
    const wave = WAVES[Math.min(this.waveIndex, WAVES.length - 1)];
    if (this.waveEvent && !this.waveEventActive) {
      if (!this.waveEventWarned && this.waveClock >= Math.max(0, this.waveEventAt - 8)) {
        this.waveEventWarned = true;
        this.toast(t(`event.${this.waveEvent.id}.name`), 'bad', 3000);
      }
      if (this.waveClock >= this.waveEventAt) {
        this.waveEventActive = true;
        for (const u of this.units) {
          if (!u.alive || u.team !== 'enemy' || u.eventModsApplied) continue;
          this.applyEventMods(u);
          u.eventModsApplied = true;
        }
        this.spawnEventZone({ eventZone: this.waveEventZone });
        this.toast(t(`event.${this.waveEvent.id}.name`), 'bad', 3200);
      }
    }
    for (const group of this.waveSpawns) {
      if (!group.spawned && this.waveClock >= group.at) {
        group.spawned = true;
        this.spawnWaveGroup(group);
      }
    }
    if (!this.waveEnraged && this.waveClock >= wave.duration) {
      this.waveEnraged = true;
      this.toast(t('toast.enraged'), 'bad', 3600);
      this.sound?.horn();
    }

    // Boss wave extension logic (waves 5 and 10 only)
    const isBossWave = wave.boss && (this.waveIndex === 4 || this.waveIndex === 9);
    if (isBossWave) {
      const normalDuration = 120; // Both boss waves extend from 120s
      const maxDuration = 240;    // Hard limit at 240s
      const extensionStart = normalDuration;
      const reinforcementInterval = 30;
      const maxReinforcements = 3;

      // 30s advance warning before extension
      if (!this.bossExtensionActive && !this.bossExtensionWarned && this.waveClock >= extensionStart - 30) {
        this.bossExtensionWarned = true;
        this.toast(t('toast.bossExtensionWarning'), 'bad', 4000);
      }

      // Enter extension phase
      if (!this.bossExtensionActive && this.waveClock >= extensionStart && this.bossAlive) {
        this.bossExtensionActive = true;
        this.toast(t('toast.bossExtension'), 'bad', 4200);
      }

      // In extension: spawn reinforcements every 30s, max 3 times
      if (this.bossExtensionActive && this.bossAlive) {
        const nextReinforcementTime = extensionStart + (this.bossExtensionReinforcements + 1) * reinforcementInterval;
        if (this.waveClock >= nextReinforcementTime && this.bossExtensionReinforcements < maxReinforcements) {
          this.bossExtensionReinforcements++;
          this.spawnBossReinforcements();
          this.toast(t('toast.bossReinforcement', { count: this.bossExtensionReinforcements }), 'bad', 3500);
        }

        // Hard limit at 240s - wave failed
        if (this.waveClock >= maxDuration) {
          this.toast(t('toast.bossTimeout'), 'bad', 4500);
          this.triggerDefeat();
          return;
        }
      }
    }

    // GDD issue8: persistent withdrawal at110s, original-threat cap and settlement at120s.
    if (!isBossWave) {
      if (!this.waveRetreatStarted && this.waveClock >= 110) {
        this.waveRetreatStarted=true;
        this.toast(t('toast.waveRetreat'),'bad',3000);
        for (const u of this.units) if(u.alive&&u.team==='enemy') this.beginWaveWithdrawal(u);
      }
      if (!this.waveCleanupDone && this.waveClock >= 120 && this.waveSpawns.every(g=>g.spawned)) {
        this.waveCleanupDone=true;
        let carried=0;
        const cap=this.waveInitialThreat*.30;
        const survivors=this.units.filter(u=>u.alive&&u.team==='enemy').sort((a,b)=>unitThreat(b.type)-unitThreat(a.type)||a.id-b.id);
        for (const u of survivors) {
          const threat=unitThreat(u.type);
          if(carried+threat<=cap) {
            carried+=threat;u.carryover=true;u.waveWithdrawal=false;u.withdrawalBlocked=null;u.eventRetreat=0;
            u.target=null;u.retargetTimer=0;u._nav=null;u.state='idle';
          } else this.beginWaveWithdrawal(u);
        }
        // Keep all survivors, HP and native routes; this is scheduled settlement, not a kill/skip.
        this.completeWave();return;
      }
    }

    // Biome scheduled events
    if (this.phase === 'wave' && this.biome) {
      this.biomeEventTimer += dt;
      const biomeEventTimes = [20, 20, 25, 25, 45, 20, 30, 25, 30, 45];
      const triggerTime = biomeEventTimes[this.waveIndex] ?? 20;
      const executeTime = triggerTime + 8; // Execute 8s after warning

      // Warning
      if (!this.biomeEventWarned && this.biomeEventTimer >= triggerTime) {
        this.biomeEventWarned = true;
        this.triggerBiomeEventWarning();
      }

      // Execute
      if (!this.biomeEventActive && this.biomeEventTimer >= executeTime) {
        this.biomeEventActive = true;
        this.executeBiomeEvent();
      }
    }

    const remainingThreat=this.units.filter(u=>u.alive&&u.team==='enemy').reduce((n,u)=>n+unitThreat(u.type),0);
    const eligible=this.waveSpawns.every(g=>g.spawned)&&(!isBossWave||!this.bossAlive)&&remainingThreat<=this.waveInitialThreat*.05;
    this.waveClearSeconds=eligible?(this.waveClearSeconds||0)+dt:0;
    if(this.waveClearSeconds>=3) this.completeWave();
  }

  beginWaveWithdrawal(u) {
    if(!u.waveWithdrawal){u._nav=null;u.targetPos=null;}
    u.waveWithdrawal=true;u.carryover=false;u.target=null;u.state='move';u.retreatGate=u.spawnGate||0;
  }

  updateWaveWithdrawal(u,dt) {
    u.target=null;u.state='move';
    const camps=this.world.camps||[],camp=camps[u.retreatGate%camps.length];
    if(!camp){u.withdrawalBlocked='no_exit';return;}
    if(dist(u.x,u.y,camp.x,camp.y)<=1) {
      // Exit reached physically. Preserve the entity record; no killEntity, loot or resurrection.
      u.withdrawn=true;u.alive=false;u.state='withdrawn';u._nav=null;
      this.stats.withdrawals=(this.stats.withdrawals||0)+1;return;
    }
    const status=this.stepToward(u,camp.x,camp.y,dt,.7);
    u.withdrawalBlocked=['unreachable','congested'].includes(status)?status:null;
  }

  triggerBiomeEventWarning() {
    const biome = this.biome.id;
    let msg = '';
    switch (biome) {
      case 'steppe': msg = t('biomeEvent.sidewindWarning'); break;
      case 'forest': msg = t('biomeEvent.regrowthWarning'); break;
      case 'dune': msg = t('biomeEvent.sandstormWarning'); break;
      case 'river': msg = t('biomeEvent.floodWarning'); break;
      case 'fjord': msg = t('biomeEvent.iceWarning'); break;
      case 'ash': msg = t('biomeEvent.ashfallWarning'); break;
    }
    if (msg) this.toast(msg, 'bad', 4000);
  }

  executeBiomeEvent() {
    const biome = this.biome.id;
    switch (biome) {
      case 'steppe': this.executeSidewind(); break;
      case 'forest': this.executeRegrowth(); break;
      case 'dune': this.executeSandstorm(); break;
      case 'river': this.executeFlood(); break;
      case 'fjord': this.executeIceCrack(); break;
      case 'ash': this.executeAshfall(); break;
    }
  }

  executeSidewind() {
    // Crosswind: arrow speed -15% for 12s
    this.effects.sidewind = 12;
    this.toast(t('biomeEvent.sidewind'), 'bad', 4000);
    setTimeout(() => { this.effects.sidewind = 0; }, 12000);
  }

  executeRegrowth() {
    // Regrowth: trees regrow after 120s (handled in world generation)
    this.toast(t('biomeEvent.regrowth'), 'good', 4000);
  }

  executeSandstorm() {
    // Sandstorm: vision -20% for 20s
    this.effects.sandstorm = 20;
    this.toast(t('biomeEvent.sandstorm'), 'bad', 4000);
    setTimeout(() => { this.effects.sandstorm = 0; }, 20000);
  }

  executeFlood() {
    // Flood: lowland farms pause 15s
    this.effects.flood = 15;
    this.toast(t('biomeEvent.flood'), 'bad', 4000);
    // Pause farms in lowland areas
    for (const b of this.buildings) {
      if (b.alive && b.team === 'player' && b.type === 'farm') {
        const isLowland = b.y > this.world.base.y + 5; // Simple heuristic
        if (isLowland) b.flooded = 15;
      }
    }
    setTimeout(() => {
      this.effects.flood = 0;
      for (const b of this.buildings) b.flooded = 0;
    }, 15000);
  }

  executeIceCrack() {
    // Ice cracking: load >12 for 4s cracks, 3s warning already given
    // Units on ice take 30% max HP damage and wash ashore
    this.toast(t('biomeEvent.iceCrack'), 'bad', 4000);
    // Find units on ice (FJORD biome has ice tiles)
    for (const u of this.units) {
      if (u.alive && u.team !== 'enemy') {
        const tile = this.world.tile(u.x, u.y);
        if (tile && tile.terrain === 'ice') {
          u.hp = Math.max(1, u.hp - u.maxHp * 0.3);
          // Wash ashore - move to nearest land
          const land = this.findNearestLand(u.x, u.y);
          if (land) { u.x = land.x; u.y = land.y; }
        }
      }
    }
  }

  executeAshfall() {
    // Ashfall: once per act max, 150 env damage, exclude core 6 tiles
    if (this.effects.ashfallUsed) return;
    this.effects.ashfallUsed = true;
    this.toast(t('biomeEvent.ashfall'), 'bad', 4000);
    const tc = this.getTownCenter();
    for (const u of this.units) {
      if (u.alive) {
        const distToCore = tc ? dist(u.x, u.y, tc.x + tc.w/2, tc.y + tc.h/2) : Infinity;
        if (distToCore > 6) {
          u.hp = Math.max(1, u.hp - 150);
        }
      }
    }
    for (const b of this.buildings) {
      if (b.alive && b.team !== 'enemy') {
        const distToCore = tc ? dist(b.x + b.w/2, b.y + b.h/2, tc.x + tc.w/2, tc.y + tc.h/2) : Infinity;
        if (distToCore > 6) {
          b.hp = Math.max(1, b.hp - 150);
        }
      }
    }
  }

  findNearestLand(x, y) {
    // Simple: move toward map center
    return { x: this.world.base.x, y: this.world.base.y };
  }

  spawnBossReinforcements() {
    if (!this.bossAlive) return [];
    const boss = this.bossAlive, spawned=[];
    // GDD issue8 §§5.1/5.4: family M4 uses the registered militia ID.
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const x = boss.x + Math.cos(angle) * 3;
      const y = boss.y + Math.sin(angle) * 3;
      const unit=this.spawnUnit('militia',x,y,'enemy');
      if(!unit)continue;
      unit.spawnGate=boss.spawnGate||0;unit.eventFlags=[...(boss.eventFlags||[])];
      if(this.waveEventActive){this.applyEventMods(unit);unit.eventModsApplied=true;}
      unit.target=this.getTownCenter();unit.state='move';spawned.push(unit);
    }
    return spawned;
  }

  applyEventMods(u) {
    const mods = this.waveEventMods;
    if (!mods) return;
    if (mods.hpMul) {
      u.maxHp = Math.round(u.maxHp * mods.hpMul);
      u.hp = u.maxHp;
    }
    if (mods.attackMul) u.attack *= mods.attackMul;
    if (mods.armorBonus) u.armor += mods.armorBonus;
    u.eventSpeedMul = mods.speedMul || 1;
    u.eventAttackSpeedMul = mods.attackSpeedMul || 1;
    u.eventRegen = mods.regen || 0;
    u.buildingDamageMul = mods.buildingDamageMul || 1;
    u.convertResist = !!mods.convertResist;
  }

  spawnEventZone(plan) {
    if (!plan?.eventZone) return;
    const camp = this.world.camps[plan.eventZone.gate % this.world.camps.length];
    if (!camp) return;
    const base = this.world.base;
    const t = .56;
    this.zones.push({
      x: camp.x + (base.x - camp.x) * t,
      y: camp.y + (base.y - camp.y) * t,
      r: plan.eventZone.radius,
      delay: 0.01,
      damage: 0,
      source: null,
      kind: plan.eventZone.kind,
      elapsed: 0,
      done: true,
      persist: true,
      duration: plan.eventZone.kind === 'smoke' ? 10 : 20,
    });
  }

  spawnWaveGroup(group) {
    const camp = this.world.camps[group.gate % this.world.camps.length];
    if (!camp) return;
    let index = 0;
    for (const [type, count] of Object.entries(group.units)) {
      for (let i = 0; i < count; i++) {
        const angle = this.rng() * Math.PI * 2;
        const radius = 1.1 + this.rng() * 2.6;
        let sx = camp.x + Math.cos(angle) * radius;
        let sy = camp.y + Math.sin(angle) * radius;
        if (!this.isWalkable(sx, sy, { team: 'enemy' })) {
          sx = camp.x + rand(this.rng, -1.2, 1.2);
          sy = camp.y + rand(this.rng, -1.2, 1.2);
        }
        const u = this.spawnUnit(type, sx, sy, 'enemy');
        if (!u) continue;
        u.eventFlags = [...(group.eventFlags || [])];
        u.spawnGate = group.gate;
        if (this.waveEventActive) {
          this.applyEventMods(u);
          u.eventModsApplied = true;
        }
        if (u.eventFlags.includes('duel') && !this.waveDuelAssigned) {
          this.waveDuelAssigned = true;
          u.duel = true;
          u.maxHp = Math.round(u.maxHp * 1.35);
          u.hp = u.maxHp;
          u.attack *= 1.2;
          u.scale = (u.typeDef.scale || 1) * 1.12;
        }
        u.target = this.getTownCenter();
        u.state = 'move';
        index++;
      }
    }
    if (index > 0) {
      this.addParticles(camp.x, camp.y, 'smoke', 'rgba(89,56,40,ALPHA)', 4, 8, 1.0);
    }
  }

  completeWave() {
    if (this.phase !== 'wave') return;
    const report = this.director.finishWave(this);
    this.lastWaveReport = report;
    this.waveReports.push(report);
    this.stats.lastReport = report;
    if (this.waveIndex >= WAVES.length - 1) {
      this.triggerVictory();
      return;
    }
    this.stats.waves = this.waveIndex + 1;
    const WAVE_REWARDS = [
      { food: 80,  wood: 60,  gold: 20, stone: 0  },  // Wave 1
      { food: 90,  wood: 70,  gold: 25, stone: 10 },  // Wave 2
      { food: 100, wood: 75,  gold: 30, stone: 15 },  // Wave 3
      { food: 110, wood: 80,  gold: 35, stone: 20 },  // Wave 4
      { food: 140, wood: 100, gold: 60, stone: 30 },  // Wave 5
      { food: 130, wood: 90,  gold: 45, stone: 25 },  // Wave 6
      { food: 140, wood: 95,  gold: 50, stone: 30 },  // Wave 7
      { food: 150, wood: 100, gold: 55, stone: 35 },  // Wave 8
      { food: 160, wood: 105, gold: 60, stone: 40 },  // Wave 9
      { food: 0,   wood: 0,   gold: 0,  stone: 0  },  // Wave 10 (victory)
    ];
    const reward = WAVE_REWARDS[this.waveIndex] || { food: 0, wood: 0, gold: 0, stone: 0 };
    for (const [key, value] of Object.entries(reward)) this.resources[key] += value;
    for (const u of this.units) {
      if (u.alive && u.team === 'player') u.hp = Math.min(u.maxHp, u.hp + u.maxHp * 0.3);
    }
    for (const b of this.buildings) {
      if (b.alive && b.team === 'player') b.hp = Math.min(b.maxHp, b.hp + b.maxHp * 0.15);
    }
    this.phase = 'boon';
    this.toast(t('toast.spoils', reward), 'good', 3800);
    // Saracen loan repayment
    if (this.civ.id === 'SAR' && this.saracenDebt > 0) {
      const repayment = 115;
      if (this.resources.gold >= repayment) {
        this.resources.gold -= repayment;
        this.saracenDebt = 0;
        this.toast(t('toast.saracenRepaid'), 'good', 3000);
      } else {
        this.toast(t('toast.saracenDefault'), 'bad', 3000);
        this.effects.saracenDefaulted = true;
      }
    }

    // Saracen new loan offer
    if (this.civ.id === 'SAR' && !this.effects.saracenDefaulted) {
      this.saracenDebt = 100;
      this.resources.gold += 100;
      this.toast(t('toast.saracenLoan'), 'good', 3000);
    }

    this.boonRerolls = 0;
    const choices = this.pickBoons();
    this.boonChoices = choices;
    this.hooks.boons?.(choices, boon => this.chooseBoon(boon));
  }

  pickBoons(exclude = []) {
    const available = BOONS.filter(b => !this.boons.some(c => c.id === b.id) && !exclude.includes(b.id));
    const chosen = [];
    const pool = [...available];
    while (chosen.length < 3 && pool.length) {
      let total = 0;
      for (const card of pool) total += RARITY_WEIGHT[card.rarity] || 1;
      let roll = this.rng() * total;
      let index = 0;
      for (let i = 0; i < pool.length; i++) {
        roll -= RARITY_WEIGHT[pool[i].rarity] || 1;
        if (roll <= 0) { index = i; break; }
      }
      chosen.push(pool.splice(index, 1)[0]);
    }
    return chosen;
  }

  chooseBoon(boon) {
    if (!boon) return;
    if (this.boons.length >= MAX_BOONS) { this.sound?.error(); return; }
    boon.apply(this);
    this.refreshPlayerStats();
    this.refreshBuildingStats();
    this.boons.push(boon);
    this.waveIndex++;
    this.boonChoices = [];
    this.boonRerolls = 0;
    this.waveName = t(`wave.${Math.min(this.waveIndex, WAVES.length - 1)}.name`);
    this.phase = 'prep';
    const midBreak = this.waveIndex === 5 ? 75 : 0;
    this.prepTotal = preparationSeconds(30 + midBreak, this.difficulty);
    this.prepTimer = this.prepTotal;
    this.prepareNextWavePlan();
    if (midBreak) this.toast(t('toast.midBreak'), 'good', 6200);
    this.camera.targetZoom = 1.12;
    this.toast(t('toast.boonClaimed', { name: t(`boon.${boon.id}.name`) }), 'good', 3800);
    this.hooks.selectionChanged?.();
  }

  rerollBoons() {
    if (this.phase !== 'boon' || !this.boonChoices.length) return false;
    const cost = 25 + this.boonRerolls * 15;
    if (this.resources.gold < cost) {
      this.sound?.error();
      this.toast(t('toast.rerollNeeds', { cost }), 'bad', 2200);
      return false;
    }
    this.resources.gold -= cost;
    this.boonRerolls++;
    const exclude = this.boonChoices.map(card => card.id);
    const choices = this.pickBoons(exclude);
    if (!choices.length) return false;
    this.boonChoices = choices;
    this.sound?.select();
    this.hooks.boons?.(choices, boon => this.chooseBoon(boon));
    return true;
  }

  beginPlacement(type) {
    if (!BUILDING_TYPES[type]) return;
    const cost = this.buildingCost(type);
    if (!this.canAfford(cost)) { this.sound?.error(); this.toast(t('toast.notEnoughBuild', { name: t(`building.${type}.name`) }), 'bad', 2200); return; }
    if (!this.selection.some(e => e.team === 'player' && e.type === 'villager')) {
      this.sound?.error();
      this.toast(t('toast.selectVillager'), 'bad', 2200);
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
    if (valid && def.requiresWater && !(this.placement.type === 'fishing_hut' && this.effects.fishingHutAnywhere)) {
      let coast = false;
      for (let ty = y - 2; ty <= y + def.h + 1 && !coast; ty++) {
        for (let tx = x - 2; tx <= x + def.w + 1; tx++) {
          if (tx < 0 || ty < 0 || tx >= this.world.size || ty >= this.world.size) continue;
          if (this.world.tile(tx + 0.5, ty + 0.5)?.terrain === 'water') { coast = true; break; }
        }
      }
      if (!coast) valid = false;
    }
    if (valid && !this.canAfford(this.buildingCost(this.placement.type))) valid = false;
    this.placement.valid = valid;
  }

  placeCurrent() {
    if (!this.placement) return false;
    this.updatePlacementValidity();
    if (!this.placement.valid) {
      this.sound?.error();
      this.toast(t('toast.cannotPlace'), 'bad', 1900);
      return false;
    }
    const type = this.placement.type;
    const def = BUILDING_TYPES[type];
    this.pay(this.buildingCost(type));
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
    this.toast(t('toast.underConstruction', { name: t(`building.${type}.name`) }), '', 2200);
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
    if(id.startsWith('order:')) {const mode=id.slice(6);if(['attackMove','guard','patrol'].includes(mode)&&this.selection.some(u=>u.alive&&u.team==='player'&&!u.w&&u.type!=='villager')) {this.orderMode=mode;this.hooks.selectionChanged?.();}return;}
    if(id==='stop'||id==='hold'||id.startsWith('stance:')){this.orderMode=null;for(const u of this.selection)u.tacticalOrder=null;this.hooks.selectionChanged?.();}
    if(id==='train:page'){const b=this.selection[0];if(b?.w&&b.alive&&b.team==='player')b.trainingPage=((b.trainingPage||0)+1)%Math.max(1,Math.ceil(this.trainableFor(b).length/4));this.hooks.selectionChanged?.();return;}
    if (id === 'build:page') {
      const pages = Math.max(1, Math.ceil(BUILD_OPTIONS.length / 4));
      this.buildPage = ((this.buildPage || 0) + 1) % pages;
      this.hooks.selectionChanged?.();
      this.sound?.select();
      return;
    }
    if (id.startsWith('build:')) { this.beginPlacement(id.slice(6)); return; }
    if (id.startsWith('train:')) {
      const b = this.selection[0];
      if (b?.w && b.team === 'player') this.trainUnit(b, id.slice(6));
      return;
    }
    if(id==='rally:clear'){for(const b of this.selection)if(this.canSetRally(b))b.rally=null;this.hooks.selectionChanged?.();return;}
    if (id === 'age:advance') { this.advanceAge(); return; }
    if (id === 'hero:mark') { this.heroMark(); return; }
    if (id === 'hero:control') { this.toggleHeroControl(); this.hooks.selectionChanged?.(); return; }
    if (id === 'hero:aegis') { this.heroAegis(); return; }
    const units = this.selection.filter(e => e.team === 'player' && !e.w);
    if (id.startsWith('stance:')) {
      const stances = ['aggressive', 'defensive', 'hold', 'passive'];
      const current = units.find(u => u.type !== 'villager')?.stance || 'defensive';
      const stance = id === 'stance:next' ? stances[(stances.indexOf(current)+1)%stances.length] : id.slice(7);
      if (!['aggressive', 'defensive', 'hold', 'passive'].includes(stance)) return;
      for (const u of units) {
        if (u.type === 'villager') continue;
        u.stance = stance; u.hold = stance === 'hold';
        u.guardOrigin = { x: u.x, y: u.y }; u.manualAttack = false;
        u.target = null; u.targetPos = null; u.state = u.hold ? 'hold' : 'idle';
      }
      this.hooks.selectionChanged?.();
    } else if (id === 'stop') {
      for (const u of units) {
        u.state = 'idle'; u.target = null; u.targetPos = null; u.gatherTarget = null; u.buildTarget = null; u.hold = false; u.manualAttack = false; u.guardOrigin = {x:u.x,y:u.y}; u._nav = null;
      }
      this.sound?.command();
    } else if (id === 'hold') {
      for (const u of units) {
        if (u.type === 'villager') continue;
        u.state = 'hold'; u.hold = true; u.stance = 'hold'; u.manualAttack = false; u.targetPos = null; u.target = null; u._nav = null;
      }
      this.sound?.command();
    } else if (id === 'demolish') {
      this.demolishSelected();
      this.sound?.command();
    } else if (id === 'repair') {
      this.repairSelected();
      this.sound?.command();
    }
  }

  repairSelected() {
    const buildings = this.selection.filter(e => e.w && e.team === 'player' && e.alive && e.hp < e.maxHp);
    for (const b of buildings) {
      this.repairBuilding(b);
    }
  }

  demolishSelected() {
    const buildings = this.selection.filter(e => e.w && e.team === 'player' && e.alive);
    for (const b of buildings) {
      if (b.construction < 1) {
        // Cancel construction: 80% refund
        const cost = b.typeDef.cost || {};
        for (const [resource, amount] of Object.entries(cost)) {
          this.resources[resource] = (this.resources[resource] || 0) + Math.round(amount * 0.8);
        }
        this.toast(t('toast.cancelRefund', { name: t(`building.${b.type}.name`), pct: 80 }), 'good', 2500);
      } else {
        // Demolish completed: 35% refund
        const cost = b.typeDef.cost || {};
        for (const [resource, amount] of Object.entries(cost)) {
          this.resources[resource] = (this.resources[resource] || 0) + Math.round(amount * 0.35);
        }
        this.toast(t('toast.demolishRefund', { name: t(`building.${b.type}.name`), pct: 35 }), 'good', 2500);
      }
      b.alive = false;
      this.addParticles(b.x + b.w / 2, b.y + b.h / 2, 'smoke', 'rgba(67,58,45,ALPHA)', 6, 12, 1.4);
    }
    this.selection = [];
    this.hooks.selectionChanged?.();
  }

    repairBuilding(b) {
    if (!b.alive || b.hp >= b.maxHp) return;
    const missingHp = b.maxHp - b.hp;
    const woodCost = Math.ceil(missingHp / 10);
    // Persian repair cost +15%
    const costMul = this.civ?.id === 'PER' ? 1.15 : 1;
    const totalWoodCost = Math.ceil(woodCost * (this.civ?.id === 'PER' ? 1.15 : 1));
    if (this.resources.wood < totalWoodCost) {
      this.toast(t('toast.notEnough', { name: t('resource.wood') }), 'bad', 2000);
      return;
    }
    // Core repairs max 30 HP/s
    const isCore = b.type === 'core';
    const maxHpPerSec = isCore ? 30 : Infinity;
    const hpToRepair = Math.min(missingHp, maxHpPerSec);
    const woodPerSec = Math.ceil(hpToRepair / 10);
    // Check 3s no auto-repair after damage
    if (b._lastDamageTime && this.time - b._lastDamageTime < 3) {
      this.toast(t('toast.repairDelayed'), 'bad', 2000);
      return;
    }
    this.resources.wood -= totalWoodCost;
    b.hp = Math.min(b.maxHp, b.hp + hpToRepair);
    this.addFloating(b.x + b.w / 2, b.y + b.h / 2, `+${hpToRepair}HP`, 'rgba(100,200,100,ALPHA)');
    this.sound?.repair?.();
  }

  advanceAge() {
    if (this.ageLevel >= 3) { this.sound?.error(); this.toast(t('toast.imperial'), '', 2000); return; }
    if (this.ageResearch) { this.sound?.error(); this.toast(t('toast.ageResearching', { seconds: Math.ceil(this.ageResearch.remaining) }), '', 2000); return; }
    const tc = this.getTownCenter();
    if (!tc) return;
    const cost = this.ageCost();
    if (!this.canAfford(cost)) {
      this.sound?.error();
      this.toast(t('toast.advanceNeeds', { costs: Object.entries(cost).map(([k, v]) => `${v} ${t(`resourceType.${k}`)}`).join(' · ') }), 'bad', 2600);
      return;
    }
    this.pay(cost);
    const seconds = this.ageLevel === 1 ? 20 : 30;
    this.ageResearch = { level: this.ageLevel + 1, remaining: seconds, total: seconds };
    this.sound?.command();
    this.toast(t('toast.ageResearch', { age: t(`age.${this.ageLevel + 1}`), seconds }), '', 3000);
    this.hooks.selectionChanged?.();
  }

  updateAgeResearch(dt) {
    if (!this.ageResearch) return;
    this.ageResearch.remaining -= dt;
    if (this.ageResearch.remaining > 0) return;
    const tc = this.getTownCenter();
    this.ageLevel = this.ageResearch.level;
    this.ageResearch = null;
    this.refreshPlayerStats();
    this.sound?.complete();
    if (tc) this.addParticles(tc.x + tc.w / 2, tc.y + tc.h / 2, 'ring', 'rgba(232,201,126,ALPHA)', 2, 14, 1.0);
    this.toast(t('toast.ageEntered', { age: this.ageName }), 'good', 4000);
    this.hooks.selectionChanged?.();
  }

  previewHeroSkill(id) {
    const skill = HERO_SKILLS[id];
    if (!skill || !this.hero?.alive) { this.heroSkillPreview = null; return false; }
    this.heroSkillPreview = { id, radius: skill.radius, rangeColor: skill.rangeColor };
    return true;
  }

  clearHeroSkillPreview() {
    this.heroSkillPreview = null;
  }

  heroMark() {
    const hero = this.hero;
    const skill = HERO_SKILLS.mark;
    if (!hero?.alive) { this.sound?.error(); this.toast(t('toast.heroMissing'), 'bad', 2200); return; }
    if (hero.markCd > 0) { this.sound?.error(); this.toast(t('toast.markCooldown', { seconds: Math.ceil(hero.markCd) }), '', 1600); return; }
    const target = this.nearestEnemyAt(hero.x, hero.y, skill.radius);
    if (!target) { this.sound?.error(); this.toast(t('toast.noMarkTarget'), '', 2000); return; }
    target.marked = skill.duration;
    hero.markCd = skill.cooldown;
    this.addCommandMarker(target.x + (target.w ? target.w / 2 : 0), target.y + (target.h ? target.h / 2 : 0), true);
    this.addParticles(target.x + (target.w ? target.w / 2 : 0), target.y + (target.h ? target.h / 2 : 0), 'ring', `rgba(${skill.rangeColor},ALPHA)`, 1.4, 6, 0.6);
    this.sound?.command();
    this.toast(t('toast.marked', { name: t(`unit.${target.type}.name`) }), 'good', 2600);
  }

  heroAegis() {
    const hero = this.hero;
    const skill = HERO_SKILLS.aegis;
    if (!hero?.alive) { this.sound?.error(); this.toast(t('toast.heroMissing'), 'bad', 2200); return; }
    if (hero.aegisCd > 0) { this.sound?.error(); this.toast(t('toast.aegisCooldown', { seconds: Math.ceil(hero.aegisCd) }), '', 1600); return; }
    let count = 0;
    for (const u of this.units) {
      if (!u.alive || u.team !== 'player') continue;
      if (dist(u.x, u.y, hero.x, hero.y) > skill.radius) continue;
      u.shield = Math.max(u.shield, 60);
      u.shieldTime = Math.max(u.shieldTime, 5);
      count++;
    }
    hero.aegisCd = skill.cooldown;
    this.addParticles(hero.x, hero.y, 'ring', `rgba(${skill.rangeColor},ALPHA)`, 2.5, 12, 0.8);
    this.sound?.boon();
    this.toast(t('toast.aegisShields', { count }), 'good', 2600);
  }

  toggleHeroControl() {
    if (!this.hero?.alive) {
      this.sound?.error();
      this.toast(t('toast.heroUnavailable'), 'bad', 1800);
      return false;
    }
    this.heroControl = !this.heroControl;
    if (this.heroControl) {
      this.setSelection([this.hero]);
      this.focusAt(this.hero.x, this.hero.y);
      this.toast(t('toast.heroControl'), 'good', 4200);
    } else {
      this.toast(t('toast.controlReleased'), '', 1800);
    }
    return this.heroControl;
  }

  checkRetreat() {
    if (!this.effects.retreat || this.retreatUsed) return;
    const tc = this.getTownCenter();
    if (!tc || tc.hp / tc.maxHp >= 0.3) return;
    this.retreatUsed = true;
    for (const u of this.units) {
      if (u.alive && u.team === 'player') u.hp = Math.min(u.maxHp, u.hp + u.maxHp * 0.25);
    }
    for (const b of this.buildings) {
      if (b.alive && b.team === 'player') b.hp = Math.min(b.maxHp, b.hp + b.maxHp * 0.1);
    }
    this.toast(t('toast.retreat'), 'good', 3600);
  }

  trainUnit(building, type, silent = false) {
    if (!building?.alive || building.team!=='player' || building.construction < 1) return;
    if (!this.trainableFor(building).includes(type)) return;
    const def = UNIT_TYPES[type];
    if(this.trainingRestriction(type)){if(!silent)this.toast(t('training.ageRequired',{age:t(`age.${def.minAge||2}`)}),'bad',2200);return;}
    if (this.effects.noCavalry && def.category === 'cavalry') return;
    if (type === 'elephant' && !this.effects.elephantUnlocked) {
      if (!silent) { this.sound?.error(); this.toast(t('toast.elephantLocked'), 'bad', 2600); }
      return;
    }
    const cost = this.unitCost(type, building.type === 'market');
    if (!this.hasPopulationRoom(type)) {
      if (!silent) { this.sound?.error(); this.toast(t('toast.popLimit'), 'bad', 2400); }
      return;
    }
    if (!this.canAfford(cost)) {
      if (!silent) { this.sound?.error(); this.toast(t('toast.notEnough', { name: t(`unit.${type}.name`) }), 'bad', 2000); }
      return;
    }
    if (building.queue.length >= 5) {
      if (!silent) { this.sound?.error(); this.toast(t('toast.queueFull'), 'bad', 2000); }
      return;
    }
    this.pay(cost);
    const time = def.trainTime / (this.effects.trainSpeedMul * (type === 'recruiter' ? this.effects.recruiterTrainMul : 1));
    building.queue.push({ type, total: time, remaining: time });
    if (!silent) this.sound?.train();
    this.hooks.selectionChanged?.();
  }

  canTrainNow(type) {
    if(this.trainingRestriction(type))return false;
    const def = UNIT_TYPES[type];
    if (!def) return false;
    if (this.effects.noCavalry && def.category === 'cavalry') return false;
    if (type === 'elephant' && !this.effects.elephantUnlocked) return false;
    return this.hasPopulationRoom(type);
  }

  selectIdleVillager() {
    const idle = this.units.filter(u => u.alive && u.team === 'player' && u.type === 'villager' && (u.state === 'idle' || u.state === 'hold'));
    if (!idle.length) { this.sound?.error(); this.toast(t('toast.noIdle'), '', 1800); return; }
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

  selectSameTypeOnScreen(sx, sy, width, height, additive = false) {
    const hit = this.pickAt(sx, sy);
    if (!hit || hit.w || hit.team !== 'player' || !hit.alive) return false;
    const picked = this.units.filter(unit => {
      if (!unit.alive || unit.team !== 'player' || unit.type !== hit.type) return false;
      const point = this.screenPos(unit.x, unit.y);
      return point.x >= 0 && point.x <= width && point.y >= 0 && point.y <= height;
    });
    const selection = additive ? [...this.selection] : [];
    for (const unit of picked) if (!selection.includes(unit)) selection.push(unit);
    this.setSelection(selection);
    if (picked.length) this.sound?.select();
    return picked.length > 0;
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
      const height = (b.w + b.h) * 12 * z + (b.type === 'core' ? 112 : b.type === 'tower' ? 92 : 54) * z;
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
    if(!units.length){
      const producers=this.selection.filter(b=>this.canSetRally(b));if(!producers.length)return;
      const hit=this.pickAt(sx,sy),wp=this.worldAt(sx,sy),resource=hit?.resource?hit:null;
      const x=resource?resource.x:wp.x,y=resource?resource.y:wp.y;
      let changed=false;for(const b of producers)changed=this.setRally(b,x,y,resource)||changed;
      if(changed){this.sound?.command();this.addCommandMarker(x,y,false);}else this.toast(t('rally.invalid'),'bad',2200);
      return;
    }
    for(const u of units)u.tacticalOrder=null;
    const hit = this.pickAt(sx, sy);
    if (hit) {
      if (hit.team === 'enemy') {
        for (const u of units) {
          if (u.type === 'villager') continue;
          u.state = 'attack'; u.target = hit; u.targetPos = null; u.retargetTimer = 1.1; u.manualAttack = true; u.blockedTargets = {}; u.orderFailure = null; u._progress=null; u._nav=null;
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
      if (hit.w && hit.team === 'player' && hit.typeDef.dropoff && hit.construction >= 1) {
        let handled = false;
        for (const u of units) {
          if (u.type === 'villager') {
            u.state = 'return'; u.dropTarget = hit;
            const pos = this.findDropoffPosition(hit);
            if (pos) {
              u.targetPos = pos;
            } else {
              u.targetPos = { x: hit.x + hit.w / 2, y: hit.y + hit.h / 2 };
            }
            u.carry = Math.max(u.carry, 0);
            handled = true;
          }
        }
        if (handled) {
          this.sound?.command();
          this.addCommandMarker(hit.x + hit.w / 2, hit.y + hit.h / 2, false);
          return;
        }
      }
    }
    const wp = this.worldAt(sx, sy);
    this.commandMove(units, wp.x, wp.y);
    this.sound?.command();
    this.addCommandMarker(wp.x, wp.y, false);
  }

  commandMove(units, x, y) {
    for(const u of units)u.tacticalOrder=null;
    const count = units.length;
    const cols = Math.ceil(Math.sqrt(count));
    const spacing = 0.8;
    const center = units.reduce((p,u)=>({x:p.x+u.x/count,y:p.y+u.y/count}),{x:0,y:0});
    const compact = count>1 && units.every(u=>Math.abs(u.x-center.x)<Math.sqrt(count)*.8 && Math.abs(u.y-center.y)<Math.sqrt(count)*.8);
    units.forEach((u, i) => {
      const col = i % cols, row = Math.floor(i / cols);
      const ox = compact ? u.x-center.x : (col - (cols - 1) / 2) * spacing;
      const oy = compact ? u.y-center.y : (row - (Math.ceil(count / cols) - 1) / 2) * spacing;
      u._nav = null; u._progress = null; u._goalProgress=null; u._yieldTo = null; u._trafficPriority=u.id; u.orderFailure=null;
      u.state = 'move';
      u.guardOrigin = { x: clamp(x + ox, 1, this.world.size - 1), y: clamp(y + oy, 1, this.world.size - 1) };
      u.manualAttack = false;
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

  issueTacticalCommand(sx,sy) {
    const mode=this.orderMode,units=this.selection.filter(u=>u.alive&&u.team==='player'&&!u.w&&u.type!=='villager');
    if(!mode||!units.length)return false;
    const hit=this.pickAt(sx,sy),point=this.worldAt(sx,sy);
    if(mode==='guard'&&(!hit||hit.team!=='player'||units.includes(hit)))return false;
    const starts=units.map(u=>({x:u.x,y:u.y}));
    this.commandMove(units,point.x,point.y);
    units.forEach((u,i)=>{u.tacticalOrder={type:mode,destination:{...u.targetPos},origin:starts[i],leg:1,protectedId:mode==='guard'?hit.id:null};u._orderScanAt=0;});
    if(units.some(u=>u.hero))this.heroControl=false;
    this.orderMode=null;this.addCommandMarker(point.x,point.y,true);this.sound?.command();this.hooks.selectionChanged?.();return true;
  }

  updateTacticalOrder(u,dt) {
    const order=u.tacticalOrder;
    let guardRange=2;
    let goal=order.type==='patrol'&&order.leg===0?order.origin:order.destination;
    if(order.type==='guard') {
      const ally=[...this.units,...this.buildings].find(e=>e.id===order.protectedId&&e.alive&&e.team==='player');
      if(!ally){u.tacticalOrder=null;u.target=null;u.targetPos=null;u._nav=null;u.state='idle';return true;}
      goal={x:ally.x+(ally.w?ally.w/2:0),y:ally.y+(ally.h?ally.h/2:0)};
      guardRange=ally.w?Math.hypot(ally.w,ally.h)/2+1:2;
      u.guardOrigin={...goal};
      if(u.target&&this.distanceTo(goal,u.target)>8){u.target=null;u.state='idle';u._nav=null;}
    }
    if(u.state==='attack'&&u.target?.alive){order.engaged=true;return false;}
    if(order.engaged){order.engaged=false;u._nav=null;u._progress=null;u._goalProgress=null;u._yieldTo=null;}
    if(u.state==='attack'){u.target=null;u.manualAttack=false;u.state='idle';}
    if(this.time>=(u._orderScanAt||0)) {
      u._orderScanAt=this.time+.25;
      if(order.type!=='guard')u.guardOrigin={x:u.x,y:u.y};
      const near=!u.typeDef.noAttack?this.acquireTarget(u,u.stance==='hold'?this.unitRange(u):(u.typeDef.sight||6)*.72):null;
      if(near){order.engaged=true;u.target=near;u.manualAttack=false;u.state='attack';u._nav=null;return false;}
    }
    if(u.orderFailure){u.tacticalOrder=null;return true;}
    const tolerance=order.type==='guard'?guardRange:.25;
    if(dist(u.x,u.y,goal.x,goal.y)<=tolerance) {
      if(order.type==='attackMove'){u.tacticalOrder=null;u.targetPos=null;u.state='idle';return true;}
      if(order.type==='patrol'){order.leg=1-order.leg;u.targetPos=null;u._nav=null;u._progress=null;u._goalProgress=null;}
      else{u.state='idle';u.targetPos=null;}
      return true;
    }
    if(!u.targetPos||dist(u.targetPos.x,u.targetPos.y,goal.x,goal.y)>.5){u.targetPos={...goal};u._nav=null;u._progress=null;u._goalProgress=null;}
    u.state='move';const arrived=this.stepToward(u,goal.x,goal.y,dt,tolerance);
    if(arrived==='unreachable'||arrived==='congested'){u.orderFailure=arrived;u.tacticalOrder=null;u.state='idle';u._nav=null;}
    return true;
  }

  clearControlGroup(slot) {
    if(!/^[1-9]$/.test(String(slot)))return false;
    this.controlGroups ||= {};
    delete this.controlGroups[String(slot)];
    return true;
  }

  controlGroup(slot,store=false,add=false) {
    if(!/^[1-9]$/.test(String(slot)))return;
    this.controlGroups ||= {};
    if(store){const selected=this.selection.filter(u=>u.alive&&u.team==='player'&&!u.w).map(u=>u.id);this.controlGroups[slot]=[...new Set([...(add?(this.controlGroups[slot]||[]):[]),...selected])];}
    else{const ids=this.controlGroups[slot]||[],units=this.units.filter(u=>u.alive&&u.team==='player'&&ids.includes(u.id));this.setSelection(add?[...new Set([...this.selection,...units])]:units);}
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
