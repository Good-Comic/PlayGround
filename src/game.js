import { clamp, RNG, axialKey, axialDistance, hexesWithin, axialRing, HEX_DIRS } from './core.js';
import { BIOMES, FEATURES, RESOURCES, updateHealthBar } from './world.js';
import {
  FUTURE_TECHS, FUTURE_UNITS, FUTURE_BUILDINGS, GENERALS, SCENARIOS, CRISES,
  DOCTRINES, SCHEMES, STRATEGIC, TECH_ERA_ORDER,
} from './expansions.js';

export const CIVS = [
  {
    id: 'aurelia', name: '奧蕾莉亞', leader: '奧蕾莉亞女皇', title: '黎明君主',
    color: 0xe3bd74, accent: 0x2f4a63, border: 0xffe1a2, colorHex: '#e3bd74',
    glyph: 'sun', traitName: '黎明律法', trait: '首都 +1 文化、+1 金幣。',
    personality: 'visionary', greeting: '黎明為新時代揭幕。與我同行吧。',
  },
  {
    id: 'kemet', name: '凱美特', leader: '法老內費魯', title: '兩地之主',
    color: 0x49b3a5, accent: 0x18494b, border: 0x9df2e2, colorHex: '#49b3a5',
    glyph: 'ankh', traitName: '河流恩賜', trait: '河流格 +1 食物。起始於水邊。',
    personality: 'builder', greeting: '河流銘記一切，我們亦然。',
  },
  {
    id: 'norlund', name: '諾爾蘭', leader: '至高王比約恩', title: '斷鏈者',
    color: 0xc4584c, accent: 0x4a1f1d, border: 0xff9182, colorHex: '#c4584c',
    glyph: 'raven', traitName: '鋼鐵洪流', trait: '對城市攻擊力 +20%。',
    personality: 'warlord', greeting: '有話快說，南方人。我的斧頭渴了。',
  },
  {
    id: 'xian', name: '長安', leader: '武則天女皇', title: '天命之女',
    color: 0x74c27a, accent: 0x204a2c, border: 0xaef0a6, colorHex: '#74c27a',
    glyph: 'dragon', traitName: '天命', trait: '首都 +1 科學、+1 生產。',
    personality: 'scholar', greeting: '上天賜你覲見之機，切勿虛度。',
  },
];

export const UNIT_TYPES = {
  settler:  { name: '開拓者',  cls: 'civilian', str: 0, moves: 2, range: 1, sight: 2, cost: 80, civilian: true, found: true, icon: 'i-settle', blurb: '在可通行地格上建立新城市。' },
  builder:  { name: '建造者',  cls: 'civilian', str: 0, moves: 2, range: 1, sight: 2, cost: 50, civilian: true, build: true, icon: 'i-production', blurb: '建造農場與礦場以改良地格。' },
  scout:    { name: '斥候',    cls: 'recon',    str: 12, moves: 3, range: 1, sight: 3, cost: 30, icon: 'i-move', blurb: '視野遼闊的快速探索單位。' },
  warrior:  { name: '戰士',  cls: 'melee',    str: 20, moves: 2, range: 1, sight: 2, cost: 40, icon: 'i-strength', blurb: '早期可靠的近戰步兵。' },
  archer:   { name: '弓箭手',   cls: 'ranged',   str: 15, rangedStr: 28, moves: 2, range: 2, sight: 2, cost: 60, tech: 'archery', icon: 'i-attack', blurb: '遠距離攻擊，不受反擊。' },
  spearman: { name: '長矛兵', cls: 'melee',    str: 26, moves: 2, range: 1, sight: 2, cost: 55, tech: 'bronzeWorking', antiCav: true, icon: 'i-strength', blurb: '嚴整陣型，對騎兵致命。' },
  horseman: { name: '騎兵', cls: 'cavalry',  str: 36, moves: 4, range: 1, sight: 3, cost: 90, tech: 'horseback', icon: 'i-attack', blurb: '平原上迅捷的劫掠者。' },
  swordsman:{ name: '劍士',cls: 'melee',    str: 36, moves: 2, range: 1, sight: 2, cost: 95, tech: 'ironWorking', icon: 'i-strength', blurb: '訓練有素的重裝步兵。' },
  catapult: { name: '投石機', cls: 'siege',    str: 20, rangedStr: 36, moves: 2, range: 2, sight: 2, cost: 120, tech: 'engineering', icon: 'i-attack', blurb: '從遠處摧毀城牆與城市。' },
  knight:   { name: '騎士',   cls: 'cavalry',  str: 48, moves: 4, range: 1, sight: 3, cost: 150, tech: 'stirrups', icon: 'i-attack', blurb: '重甲槍騎兵，當代之懼。' },
};

export const BUILDINGS = {
  monument:      { name: '紀念碑',       cost: 60,  icon: 'i-wonder',     yields: { culture: 2 }, blurb: '此城 +2 文化。' },
  granary:       { name: '糧倉',        cost: 65,  icon: 'i-food',       yields: { food: 1 }, blurb: '此城 +1 食物。' },
  shrine:        { name: '神龕',         cost: 65,  icon: 'i-faith',      yields: { faith: 1 }, blurb: '此城 +1 信仰。' },
  library:       { name: '圖書館',        cost: 80,  reqTech: 'writing',     icon: 'i-research', yields: { science: 2 }, blurb: '此城 +2 科學。' },
  barracks:      { name: '兵營',       cost: 75,  reqTech: 'bronzeWorking', icon: 'i-strength', defense: 4, blurb: '+4 城防。可訓練老兵。' },
  walls:         { name: '城牆',     cost: 90,  reqTech: 'masonry',     icon: 'i-defense',  defense: 8, blurb: '+8 城防與遠程打擊。' },
  market:        { name: '市場',         cost: 95,  reqTech: 'currency',    icon: 'i-gold',     yields: { gold: 2 }, blurb: '此城 +2 金幣。' },
  harbor:        { name: '港口',         cost: 120, reqTech: 'sailing',     icon: 'i-influence', yields: { gold: 2, food: 1 }, blurb: '+2 金幣、+1 食物。改良海岸地格。' },
  temple:        { name: '神殿',         cost: 120, reqTech: 'philosophy',  icon: 'i-faith',    yields: { faith: 2, culture: 1 }, blurb: '+2 信仰、+1 文化。' },
  amphitheater:  { name: '圓形劇場',   cost: 130, reqTech: 'philosophy',  icon: 'i-culture',  yields: { culture: 3 }, blurb: '此城 +3 文化。' },
  workshop:      { name: '工坊',       cost: 140, reqTech: 'machinery',   icon: 'i-production', yields: { production: 2 }, blurb: '此城 +2 生產。' },
  aqueduct:      { name: '引水道',       cost: 150, reqTech: 'engineering', icon: 'i-food',     yields: { food: 2 }, blurb: '此城 +2 食物。' },
  university:    { name: '大學',     cost: 190, reqTech: 'philosophy',  icon: 'i-research', yields: { science: 4 }, blurb: '此城 +4 科學。' },
  bank:          { name: '銀行',           cost: 200, reqTech: 'economics',   icon: 'i-gold',     yields: { gold: 4 }, blurb: '此城 +4 金幣。' },
  armory:        { name: '軍械庫',         cost: 180, reqTech: 'militaryScience', icon: 'i-defense', defense: 10, blurb: '+10 城防。' },
};

export const WONDERS = {
  stonehenge:    { name: '巨石陣',        cost: 170, icon: 'i-wonder', reqTech: 'masonry',   yields: { faith: 3 }, blurb: '遠古石環：全帝國 +3 信仰。' },
  pyramids:      { name: '金字塔',      cost: 220, icon: 'i-wonder', reqTech: 'masonry',   yields: { culture: 2, production: 1 }, blurb: '全帝國 +2 文化、+1 生產。' },
  greatLibrary:  { name: '大圖書館',     cost: 230, icon: 'i-research', reqTech: 'writing', yields: { science: 4 }, blurb: '全帝國 +4 科學。立即獲得科技突破。' },
  hangingGardens:{ name: '空中花園',   cost: 210, icon: 'i-food',   reqTech: 'currency',  yields: { food: 3 }, blurb: '此城 +3 食物。迅速成長。' },
  colosseum:     { name: '大競技場',   cost: 240, icon: 'i-culture', reqTech: 'philosophy', yields: { culture: 3 }, blurb: '全帝國 +3 文化、+2 人口。' },
  lighthouse:    { name: '大燈塔',  cost: 200, icon: 'i-influence', reqTech: 'sailing', yields: { gold: 3 }, blurb: '全帝國 +3 金幣。海軍移動更快。' },
};

for (const [id, def] of Object.entries(FUTURE_UNITS)) if (!UNIT_TYPES[id]) UNIT_TYPES[id] = def;
for (const [id, def] of Object.entries(FUTURE_BUILDINGS)) if (!BUILDINGS[id]) BUILDINGS[id] = def;
const CIV_DEFAULTS = CIVS.map((civ) => ({ ...civ }));

export const TECHS = [
  { id: 'pottery',        name: '陶器',         era: 'Antiquity', cost: 30,  prereq: [],                          bonus: '擁有淡水的城市 +1 食物。', yields: { food: 1 }, icon: 'i-food' },
  { id: 'animalHusbandry',name: '畜牧',era: 'Antiquity', cost: 35,  prereq: [],                          bonus: '揭示馬匹。牧場可改良地格。', icon: 'i-food' },
  { id: 'mining',         name: '採礦',          era: 'Antiquity', cost: 30,  prereq: [],                          bonus: '建造者可建造礦場（+生產）。', icon: 'i-production' },
  { id: 'archery',        name: '射箭',         era: 'Antiquity', cost: 55,  prereq: ['animalHusbandry'],         bonus: '解鎖弓箭手，早期遠程戰爭大師。', icon: 'i-attack', unlockUnit: 'archer' },
  { id: 'sailing',        name: '航海',         era: 'Antiquity', cost: 55,  prereq: ['pottery'],                 bonus: '解鎖港口與沿海貿易。', icon: 'i-influence' },
  { id: 'writing',        name: '文字',         era: 'Antiquity', cost: 60,  prereq: ['pottery'],                 bonus: '解鎖圖書館與大圖書館。', icon: 'i-research' },
  { id: 'bronzeWorking',  name: '青銅器',  era: 'Antiquity', cost: 80,  prereq: ['mining'],                  bonus: '解鎖長矛兵與兵營。', icon: 'i-strength', unlockUnit: 'spearman' },
  { id: 'masonry',        name: '石工',         era: 'Antiquity', cost: 80,  prereq: ['mining'],                  bonus: '解鎖城牆與古代奇觀。', icon: 'i-defense' },
  { id: 'horseback',      name: '騎術',era: 'Antiquity', cost: 85,  prereq: ['animalHusbandry'],         bonus: '解鎖騎兵，加速擴張。', icon: 'i-move', unlockUnit: 'horseman' },
  { id: 'currency',       name: '貨幣',        era: 'Antiquity', cost: 120, prereq: ['writing', 'mining'],       bonus: '解鎖市場與空中花園。', icon: 'i-gold' },
  { id: 'ironWorking',    name: '鐵器',    era: 'Antiquity', cost: 130, prereq: ['bronzeWorking'],           bonus: '解鎖劍士與鐵礦。', icon: 'i-strength', unlockUnit: 'swordsman' },
  { id: 'mathematics',    name: '數學',     era: 'Exploration', cost: 170, prereq: ['currency'],              bonus: '+2 科學。工程學的基礎。', icon: 'i-research', yields: { science: 2 } },
  { id: 'philosophy',     name: '哲學',      era: 'Exploration', cost: 180, prereq: ['writing', 'currency'],   bonus: '解鎖神殿、圓形劇場與大學。', icon: 'i-culture' },
  { id: 'engineering',    name: '工程學',     era: 'Exploration', cost: 220, prereq: ['masonry', 'mathematics'],bonus: '解鎖投石機與引水道。', icon: 'i-wonder', unlockUnit: 'catapult' },
  { id: 'apprenticeship', name: '學徒制',  era: 'Exploration', cost: 210, prereq: ['currency'],              bonus: '每座城市 +1 生產。', icon: 'i-production', yields: { production: 1 } },
  { id: 'machinery',      name: '機械',       era: 'Exploration', cost: 240, prereq: ['ironWorking', 'engineering'], bonus: '解鎖工坊與弩。', icon: 'i-production' },
  { id: 'feudalism',      name: '封建制度',       era: 'Exploration', cost: 260, prereq: ['apprenticeship'],        bonus: '+1 食物、+1 生產。更強的徵兵。', icon: 'i-defense', yields: { food: 1, production: 1 } },
  { id: 'navigation',     name: '導航',      era: 'Exploration', cost: 230, prereq: ['sailing', 'mathematics'],bonus: '可航行海洋。港口 +1 金幣。', icon: 'i-influence', yields: { gold: 2 } },
  { id: 'stirrups',       name: '馬鐙',        era: 'Modern',      cost: 320, prereq: ['horseback', 'feudalism'],bonus: '解鎖騎士，戰場之主。', icon: 'i-attack', unlockUnit: 'knight' },
  { id: 'gunpowder',      name: '火藥',       era: 'Modern',      cost: 360, prereq: ['ironWorking', 'stirrups'],bonus: '所有近戰單位 +3 戰鬥力。', icon: 'i-strength' },
  { id: 'printing',       name: '印刷術',        era: 'Modern',      cost: 330, prereq: ['philosophy'],            bonus: '+3 科學，識字普及。', icon: 'i-research', yields: { science: 3 } },
  { id: 'economics',      name: '經濟學',       era: 'Modern',      cost: 350, prereq: ['apprenticeship'],        bonus: '解鎖銀行。全帝國 +2 金幣。', icon: 'i-gold', yields: { gold: 2 } },
  { id: 'militaryScience',name: '軍事科學',era: 'Modern',      cost: 380, prereq: ['gunpowder'],             bonus: '解鎖軍械庫與常備軍。', icon: 'i-defense' },
  { id: 'astronomy',      name: '天文學',       era: 'Modern',      cost: 340, prereq: ['navigation', 'printing'], bonus: '+3 科學。天界已被測繪。', icon: 'i-research', yields: { science: 3 } },
];

for (const tech of FUTURE_TECHS) if (!TECHS.some((t) => t.id === tech.id)) TECHS.push(tech);

export const CIVICS = [
  { name: '法典',       at: 25,  desc: '每回合 +1 影響力。治理由此開始。' },
  { name: '工藝',      at: 60,  desc: '建造者 +1 次使用次數。' },
  { name: '早期帝國',       at: 110, desc: '每回合 +1 文化，邊界擴張更快。' },
  { name: '政治哲學',at: 180, desc: '每回合 +2 科學、+1 文化。' },
  { name: '戲劇與詩歌',     at: 260, desc: '每回合 +3 文化。偉大作品綻放。' },
  { name: '人文主義',           at: 360, desc: '每回合 +4 科學。理性的黃金時代。' },
  { name: '啟蒙',      at: 480, desc: '每回合所有產出 +2。天才的年代。' },
];

const ERAS = [
  { name: '上古時代',   from: 1 },
  { name: '探索時代', from: 14 },
  { name: '近代',      from: 28 },
  { name: '工業時代', from: 42 },
  { name: '資訊時代', from: 56 },
  { name: '核融合時代', from: 70 },
  { name: '軌道時代', from: 84 },
  { name: '奇點時代', from: 98 },
];

const TURN_LIMIT = 120;

export class Game {
  constructor(world, opts = {}) {
    this.world = world;
    this.listeners = new Map();
    this.turn = 1;
    this.playerId = 'aurelia';
    this.rng = new RNG(world.seed + 2024);
    this.selected = null; // {type:'unit'|'city', ref}
    this.hoverTile = null;
    this.scenarioId = SCENARIOS[opts.scenario] ? opts.scenario : 'legacy';
    this.scenario = SCENARIOS[this.scenarioId];
    this.turnLimit = this.scenario.turnLimit ?? TURN_LIMIT;
    this.maxEra = this.scenario.maxEra ?? ERAS.length - 1;
    this.eraFloor = this.scenario.startEra ?? 0;
    this.eraIndex = this.eraFloor;
    this.stocks = {};
    this.perTurn = {};
    this.techProgress = {};
    this.currentTech = {};
    this.civicsUnlocked = {};
    this.doctrines = {};
    this.blackUnlocks = {};
    this.generals = [];
    this.strategic = {};
    this.orbitals = {};
    this.met = new Set();
    this.wondersBuilt = new Set();
    this.objectives = [];
    this.log = [];
    this.gameOver = false;
    this.busy = false;
    this.schemeMode = null;
    this.weather = { name: '微風', wind: [1, -1], angle: -0.6, strength: 1 };
    this.climate = { emissions: 0, temperature: 0, seaLevel: 0, events: 0, nextThreshold: 40 };
    this.activeCrisis = null;
    this.nextCrisisTurn = 10;
    this.crisisHistory = [];
    this._cultureBank = {};
    this._acquired = {};
  }

  applyScenario() {
    for (const def of CIVS) {
      const base = CIV_DEFAULTS.find((x) => x.id === def.id);
      if (base) Object.assign(def, base);
    }
    const overrides = this.scenario.civOverrides;
    if (overrides) {
      for (const def of CIVS) {
        if (overrides[def.id]) Object.assign(def, overrides[def.id]);
      }
    }
    if (this.scenario.mutation != null) this.world.mutation = this.scenario.mutation;
    this.world.scenarioId = this.scenario.id;
  }

  grantEraTechs(civId) {
    const startEra = this.eraFloor;
    if (!startEra) return;
    const acquired = this.techStateFor(civId);
    for (const t of TECHS) {
      const era = TECH_ERA_ORDER.indexOf(t.era);
      if (era >= 0 && era < startEra && !t.branch && !t.requiresBlack) acquired.add(t.id);
    }
    const avail = this.availableTechs(civId).filter((t) => !t.branch);
    this.currentTech[civId] = avail.length ? avail[this.rng.int(0, avail.length - 1)].id : null;
    this.techProgress[civId] = 0;
  }

  initExpansionState(world) {
    this.initWeather();
    for (const civ of CIVS) {
      this.doctrines[civ.id] = null;
      this.blackUnlocks[civ.id] = new Set();
      this.strategic[civ.id] = { copper: 2, iron: 2, quartz: 0, rareEarth: 0, helium3: 0, oil: 0, chips: 0, alloys: 0, fuel: 0, superconductors: 0 };
      this.orbitals[civ.id] = 0;
    }
    this.strategic.wilds = { copper: 0, iron: 0, quartz: 0, rareEarth: 0, helium3: 0, oil: 0, chips: 0, alloys: 0, fuel: 0, superconductors: 0 };
  }

  initWeather() {
    const dirs = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]];
    const names = ['東風', '東南風', '南風', '西南風', '西風', '西北風', '北風', '東北風'];
    const dir = dirs[this.rng.int(0, dirs.length - 1)];
    this.weather = { name: names[this.rng.int(0, names.length - 1)], wind: dir, angle: Math.atan2(dir[0], dir[1]), strength: this.rng.int(1, 2) };
  }

  on(type, fn) {
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    this.listeners.get(type).push(fn);
    return () => {
      const arr = this.listeners.get(type);
      arr.splice(arr.indexOf(fn), 1);
    };
  }
  emit(type, payload) {
    for (const fn of this.listeners.get(type) ?? []) fn(payload);
  }

  /* ============================ SETUP ============================ */
  setup() {
    const world = this.world;
    this.applyScenario();
    const wilds = {
      id: 'wilds', name: '遠古荒野', leader: '守護者', title: '沉睡的意志',
      color: 0x8d7cff, accent: 0x2c2145, border: 0xc3b6ff, colorHex: '#8d7cff',
      glyph: 'dragon', traitName: '亙古守望', trait: '守護異常生態區。', isWilds: true,
      cities: [], units: [], isAI: true, met: false, atWar: true, capital: null,
    };
    world.registerCiv(wilds);
    for (const def of CIVS) {
      const civ = {
        ...def,
        cities: [],
        units: [],
        isAI: def.id !== this.playerId,
        met: def.id === this.playerId,
        atWar: def.id !== this.playerId,
        capital: null,
      };
      world.registerCiv(civ);
      this.stocks[civ.id] = { gold: 40, faith: 0, influence: 0 };
      this.perTurn[civ.id] = { food: 0, production: 0, gold: 0, science: 0, culture: 0, faith: 0, influence: 0 };
      this.techProgress[civ.id] = 0;
      this.currentTech[civ.id] = null;
      this.civicsUnlocked[civ.id] = 0;
    }
    this.initExpansionState(world);
    this.currentTech[this.playerId] = 'pottery';
    // give AI a random starter tech to research
    for (const civ of CIVS) {
      if (civ.id === this.playerId) continue;
      const avail = TECHS.filter((t) => !t.prereq.length);
      this.currentTech[civ.id] = this.rng.pick(avail).id;
    }
    if (this.eraFloor > 0) for (const civ of CIVS) this.grantEraTechs(civ.id);

    this.placeCivs();
    this.spawnGuardians();
    this.claimInitialTerritory();
    // The capital's hinterland is known from the start, for a welcoming vista.
    const cap = this.playerCapital.tile;
    for (const [q, r] of hexesWithin(cap.q, cap.r, 9)) {
      const t = world.tiles.get(axialKey(q, r));
      if (t) t.explored = true;
    }
    this.recomputeVision();
    world.buildFog();
    world.buildOverlays();
    world.updateDimOverlay();
    world.rebuildTerritory();
    this.initObjectives();
    this.emit('setup');
  }

  startTilesForCivs() {
    const world = this.world;
    const passableNeighbours = (t) => HEX_DIRS.reduce((n, [dq, dr]) => {
      const nb = world.tiles.get(axialKey(t.q + dq, t.r + dr));
      return n + (nb && BIOMES[nb.terrain].passable ? 1 : 0);
    }, 0);
    const land = world.tileList.filter((t) => BIOMES[t.terrain].passable && !t.feature?.includes('ice') && passableNeighbours(t) >= 3);
    const scoreTile = (t) => {
      let s = 0;
      if (t.terrain === 'grassland') s += 3;
      if (t.terrain === 'plains') s += 2.5;
      if (t.terrain === 'hills') s += 2;
      if (t.river) s += 3;
      if (t.resource) s += 1.5;
      if (t.feature === 'forest') s += 0.5;
      let water = 0, mountains = 0, river = 0;
      for (const [dq, dr] of HEX_DIRS) {
        const n = world.tiles.get(axialKey(t.q + dq, t.r + dr));
        if (!n) continue;
        if (n.terrain === 'coast' || n.terrain === 'ocean') { water++; s += 1.1; }
        if (n.terrain === 'mountain') { mountains++; }
        if (n.river) { river++; s += 0.4; }
      }
      s -= mountains * 1.6;
      const dc = axialDistance(t.q, t.r, 0, 0);
      if (dc >= 2 && dc <= 6) s += 1.6;
      s -= Math.max(0, dc - 8) * 0.6;
      return { t, s, water, dc };
    };
    const scored = land.map(scoreTile).sort((a, b) => b.s - a.s);
    // player takes an open, coastal, central-ish start with a pleasing vista
    const playerPick = scored.find((c) => c.water >= 1 && c.dc >= 2 && c.dc <= 7) || scored[0];
    const chosen = [playerPick.t];
    const used = new Set([playerPick.t.key]);
    for (const minD of [9, 8, 7, 6, 5, 4]) {
      for (const c of scored) {
        if (chosen.length >= CIVS.length) break;
        if (used.has(c.t.key)) continue;
        if (chosen.some((p) => axialDistance(p.q, p.r, c.t.q, c.t.r) < minD)) continue;
        chosen.push(c.t); used.add(c.t.key);
      }
      if (chosen.length >= CIVS.length) break;
    }
    for (const c of scored) {
      if (chosen.length >= CIVS.length) break;
      if (!used.has(c.t.key)) { chosen.push(c.t); used.add(c.t.key); }
    }
    return chosen;
  }

  placeCivs() {
    const world = this.world;
    const starts = this.startTilesForCivs();
    // player = aurelia; order others by distance so rivals are far
    CIVS.forEach((def, i) => {
      const civ = world.civs.get(def.id);
      const tile = starts[i];
      const city = this.makeCity(civ, tile, true);
      civ.capital = city;
      if (def.id === this.playerId) this.playerCapital = city;
    });
    // player starting units around capital
    const cap = this.playerCapital.tile;
    const player = world.civs.get(this.playerId);
    const spawnSpots = world.tileList
      .filter((t) => BIOMES[t.terrain].passable && !t.city && axialDistance(t.q, t.r, cap.q, cap.r) <= 1)
      .sort((a, b) => a.key.localeCompare(b.key));
    const place = (type, idx) => {
      const spot = spawnSpots.length ? spawnSpots[idx % spawnSpots.length] : cap;
      this.spawnUnit(player, type, spot.q, spot.r);
    };
    place('warrior', 0); place('scout', 1); place('settler', 2); place('builder', 3);
    // AI start with a defender and a settler
    for (const def of CIVS) {
      if (def.id === this.playerId) continue;
      const civ = world.civs.get(def.id);
      const ct = civ.capital.tile;
      const adj = world.tileList.filter((t) => BIOMES[t.terrain].passable && !t.city && axialDistance(t.q, t.r, ct.q, ct.r) === 1);
      this.spawnUnit(civ, 'warrior', adj[0]?.q ?? ct.q, adj[0]?.r ?? ct.r);
      this.spawnUnit(civ, 'spearman', adj[1]?.q ?? ct.q, adj[1]?.r ?? ct.r);
      this.spawnUnit(civ, 'settler', adj[2]?.q ?? ct.q, adj[2]?.r ?? ct.r);
    }
  }

  makeCity(civ, tile, capital = false) {
    const world = this.world;
    const baseNames = {
      aurelia: ['奧蕾莉亞', '盧門', '索拉里斯', '維斯佩拉', '科羅納', '奧羅拉', '波爾圖斯', '諾瓦'],
      kemet: ['瓦塞特', '孟菲斯', '伊烏努', '阿貝朱', '努布特', '佩爾瓦吉特', '賽斯', '埃德夫'],
      norlund: ['斯克約爾德', '烏普薩拉', '費里斯', '約塔蘭', '尼達羅斯', '比爾卡', '拉夫內', '尤米爾'],
      xian: ['長安', '洛陽', '建康', '臨安', '郢', '邯鄲', '曲阜', '成都'],
    };
    const override = this.scenario?.civOverrides?.[civ.id];
    const names = override?.cityNames ?? baseNames[civ.id] ?? ['城市'];
    const index = civ.cities.length;
    const city = {
      civId: civ.id, civ,
      q: tile.q, r: tile.r, name: capital && override?.capital ? override.capital : names[index % names.length],
      population: capital ? 2 : 1,
      hp: 200, maxHp: 200,
      production: 0, food: 0, culture: 0, isCapital: capital,
      buildings: [], wonders: [],
      producing: null, produceProgress: 0,
      defense: capital ? 12 : 6,
      level: capital ? 2 : 1,
    };
    civ.cities.push(city);
    world.addCity(city);
    this.assignTerritory(city, capital ? 2 : 1);
    return city;
  }

  claimInitialTerritory() {
    const world = this.world;
    for (const tile of world.tileList) {
      if (tile.city) {
        tile.owner = tile.city.civId;
      }
    }
  }

  assignTerritory(city, radius) {
    const world = this.world;
    const rings = hexesWithin(city.q, city.r, radius);
    for (const [q, r] of rings) {
      const tile = world.tiles.get(axialKey(q, r));
      if (!tile) continue;
      if (BIOMES[tile.terrain].water && tile.terrain === 'ocean') continue;
      if (tile.owner && tile.owner !== city.civId && tile.city) continue;
      if (!tile.owner) tile.owner = city.civId;
    }
  }

  spawnUnit(civ, type, q, r) {
    const world = this.world;
    const def = UNIT_TYPES[type];
    const tile = world.tiles.get(axialKey(q, r));
    if (!tile) return null;
    const unit = {
      id: `u${this.rng.int(100000, 999999)}`,
      civId: civ.id, civ, type, name: def.name,
      q, r, hp: 100, maxHp: 100, moves: def.moves, maxMoves: def.moves,
      str: def.str + (civ.id === this.playerId ? 0 : 0),
      xp: 0, level: 0, fortified: false, asleep: false,
      supplied: true, supplyDistance: 0, supplyTurns: 0, generalId: null,
      phase: this.rng.float(0, Math.PI * 2),
      facing: this.rng.float(-Math.PI, Math.PI),
    };
    civ.units.push(unit);
    world.addUnit(unit);
    return unit;
  }

  /* ============================ VISION ============================ */
  cube(q, r) { return { x: q, z: r, y: -q - r }; }
  cubeRound({ x, y, z }) {
    let rx = Math.round(x), ry = Math.round(y), rz = Math.round(z);
    const dx = Math.abs(rx - x), dy = Math.abs(ry - y), dz = Math.abs(rz - z);
    if (dx > dy && dx > dz) rx = -ry - rz;
    else if (dy > dz) ry = -rx - rz;
    else rz = -rx - ry;
    return { q: rx, r: rz };
  }
  lineTiles(a, b) {
    const out = [];
    const ac = this.cube(a.q, a.r), bc = this.cube(b.q, b.r);
    const n = Math.max(Math.abs(ac.x - bc.x), Math.abs(ac.y - bc.y), Math.abs(ac.z - bc.z));
    for (let i = 0; i <= n; i++) {
      const t = n ? i / n : 0;
      const c = { x: ac.x + (bc.x - ac.x) * t, y: ac.y + (bc.y - ac.y) * t, z: ac.z + (bc.z - ac.z) * t };
      const { q, r } = this.cubeRound(c);
      const tile = this.world.tiles.get(axialKey(q, r));
      if (tile && out[out.length - 1] !== tile) out.push(tile);
    }
    return out;
  }
  terrainSightBonus(tile) {
    if (!tile) return 0;
    return tile.terrain === 'mountain' ? 2 : tile.terrain === 'hills' ? 1 : 0;
  }
  losBlocked(source, target) {
    if (!source || !target) return false;
    const dist = axialDistance(source.q, source.r, target.q, target.r);
    if (dist <= 1) return false;
    const elevated = source.terrain === 'mountain' || source.terrain === 'hills';
    const line = this.lineTiles(source, target);
    for (let i = 1; i < line.length - 1; i++) {
      const t = line[i];
      if (t.terrain === 'mountain' && source.terrain !== 'mountain') return true;
      if (!elevated && (t.feature === 'forest' || t.feature === 'jungle')) return true;
      if (t.effect === 'storm') return true;
    }
    return false;
  }
  sightTiles(source, radius) {
    const out = [];
    for (const [q, r] of hexesWithin(source.q, source.r, radius)) {
      const t = this.world.tiles.get(axialKey(q, r));
      if (!t) continue;
      if (this.losBlocked(source, t)) continue;
      out.push(t);
    }
    return out;
  }
  isUnitVisible(unit, viewerId = this.playerId) {
    if (!unit || unit.civId === viewerId) return true;
    const tile = this.world.tiles.get(axialKey(unit.q, unit.r));
    if (!tile) return false;
    const viewer = this.world.civs.get(viewerId);
    if (!viewer) return tile.visible;
    const close = [...viewer.units, ...viewer.cities].some((v) => axialDistance(v.q, v.r, unit.q, unit.r) <= 1);
    if (close) return true;
    const scoutNear = viewer.units.some((v) => (UNIT_TYPES[v.type].sight ?? 2) >= 3 && axialDistance(v.q, v.r, unit.q, unit.r) <= 2);
    if (!scoutNear && (tile.feature === 'forest' || tile.feature === 'jungle')) return false;
    return !!tile.visible;
  }
  updateUnitVisibility() {
    for (const unit of this.world.units) {
      if (!unit.mesh) continue;
      unit.mesh.visible = unit.civId === this.playerId ? true : this.isUnitVisible(unit, this.playerId);
    }
  }

  recomputeVision() {
    const world = this.world;
    for (const tile of world.tileList) tile.visible = false;
    const player = world.civs.get(this.playerId);
    for (const unit of player.units) {
      const sight = (UNIT_TYPES[unit.type].sight ?? 2) + this.terrainSightBonus(unit.tile);
      for (const t of this.sightTiles(unit.tile, sight)) t.visible = true;
    }
    for (const city of player.cities) {
      const sight = 3 + this.terrainSightBonus(city.tile);
      for (const t of this.sightTiles(city.tile, sight)) t.visible = true;
    }
    for (const tile of world.tileList) if (tile.visible) tile.explored = true;
    // meeting rivals
    for (const def of CIVS) {
      if (def.id === this.playerId || this.met.has(def.id)) continue;
      const civ = world.civs.get(def.id);
      if (!civ) continue;
      const near = civ.cities.some((c) => this.isTileExplored(c.q, c.r) && this.tilesNearPlayer(c, 3))
        || civ.units.some((u) => this.isUnitVisible(u, this.playerId) && this.tilesNearPlayer(u, 3));
      if (near) {
        this.met.add(def.id);
        this.emit('meet', civ);
      }
    }
    world.refreshFog();
    world.updateDimOverlay();
    this.updateUnitVisibility();
  }

  isTileExplored(q, r) {
    const t = this.world.tiles.get(axialKey(q, r));
    return t ? t.explored : false;
  }
  tilesNearPlayer(entity, radius) {
    const player = this.world.civs.get(this.playerId);
    const all = [...player.units, ...player.cities];
    return all.some((p) => axialDistance(p.q, p.r, entity.q, entity.r) <= radius);
  }

  /* ============================ YIELDS ============================ */
  tileYields(tile, civId = this.playerId) {
    const y = { food: 0, production: 0, gold: 0, science: 0, culture: 0, faith: 0 };
    if (!tile.explored && civId === this.playerId) return y;
    const bt = BIOMES[tile.terrain];
    for (const k in bt.yields) y[k] += bt.yields[k];
    if (tile.feature && FEATURES[tile.feature]) {
      for (const k in FEATURES[tile.feature].yields) y[k] += FEATURES[tile.feature].yields[k];
    }
    if (tile.resource) {
      const r = RESOURCES[tile.resource];
      if (bt.water) y.food += 1;
      for (const k in r.yields) y[k] += r.yields[k];
    }
    if (tile.river) { y.food += 1; if (civId === 'aurelia' || civId === 'kemet') y.food += 0; }
    if (tile.improvement === 'farm') y.food += 1;
    if (tile.improvement === 'mine') y.production += 1;
    if (tile.anomaly) { y.science += 1; y.culture += 1; }
    if (tile.effect === 'fire') { y.food = Math.max(0, y.food - 1); y.production = Math.max(0, y.production - 1); }
    if (tile.effect === 'scorched') { y.food = 0; y.production = Math.max(0, y.production - 1); }
    if (tile.effect === 'flood') { y.food = Math.max(0, y.food - 1); y.gold = Math.max(0, y.gold - 1); }
    if (tile.effect === 'rubble') y.production = Math.max(0, y.production - 1);
    if (tile.effect === 'storm') { y.food = 0; y.gold = 0; }
    if (tile.blocked) y.production = Math.max(0, y.production - 1);
    if (tile.city && tile.city.civId === civId) {
      y.food += 1; y.production += 1; y.gold += 1;
    }
    return y;
  }

  civYields(civId) {
    const world = this.world;
    const civ = world.civs.get(civId);
    const total = { food: 0, production: 0, gold: 0, science: 0, culture: 0, faith: 0, influence: 0 };
    const owned = world.tileList.filter((t) => t.owner === civId);
    // worked tiles: cap by population for realism
    let pop = 0;
    for (const c of civ.cities) pop += c.population;
    let worked = pop * 2 + civ.cities.length * 2;
    const sorted = owned
      .filter((t) => civId === this.playerId ? t.explored : true)
      .sort((a, b) => this.tileScore(b) - this.tileScore(a));
    for (const tile of sorted) {
      if (worked <= 0) break;
      const y = this.tileYields(tile, civId);
      for (const k in y) total[k] += y[k];
      worked--;
    }
    // buildings
    for (const c of civ.cities) {
      for (const b of c.buildings) {
        const def = BUILDINGS[b];
        if (def?.yields) for (const k in def.yields) total[k] += def.yields[k];
      }
      for (const w of c.wonders) {
        const def = WONDERS[w];
        if (def?.yields) for (const k in def.yields) total[k] += def.yields[k];
      }
      if (c.isCapital) {
        if (civId === 'aurelia') { total.culture += 1; total.gold += 1; }
        if (civId === 'xian') { total.science += 1; total.production += 1; }
        if (this.scenarioId === 'chrono' && civId === 'aurelia') { total.gold += 2; total.influence += 1; }
      }
    }
    if (this.scenarioId === 'threeKingdoms' && civId === 'aurelia') {
      total.food += civ.cities.length;
      total.production += civ.cities.length;
    }
    if (this.scenarioId === 'chrono') {
      if (civId === 'kemet') total.production *= 1.2;
      if (civId === 'xian') { total.science *= 1.15; total.culture *= 1.15; }
    }
    // tech passive
    for (const t of TECHS) {
      if (this.hasTech(civId, t.id) && t.yields) for (const k in t.yields) total[k] += t.yields[k];
    }
    // civics
    const civics = CIVICS.filter((c, i) => i < this.civicsUnlocked[civId]);
    for (const c of civics) {
      const idx = CIVICS.indexOf(c);
      if (idx === 0) total.influence += 1;
      if (idx === 2) total.culture += 1;
      if (idx === 3) { total.science += 2; total.culture += 1; }
      if (idx === 4) total.culture += 3;
      if (idx === 5) total.science += 4;
      if (idx === 6) { total.science += 2; total.culture += 2; total.gold += 2; total.faith += 2; }
    }
    const doctrine = this.doctrines?.[civId];
    if (doctrine && DOCTRINES[doctrine]) {
      const b = DOCTRINES[doctrine].bonuses;
      if (b.science) total.science *= 1 + b.science;
      if (b.production) total.production *= 1 + b.production;
      if (b.gold) total.gold *= 1 + b.gold;
      if (b.food) total.food *= 1 + b.food;
    }
    if (this.scenario.techBoost) total.science *= 1.2;
    for (const gen of this.generals ?? []) {
      if (gen.civId !== civId || gen.dead) continue;
      const b = gen.bonuses ?? {};
      if (b.sciencePct) total.science *= 1 + b.sciencePct * 0.5;
      if (b.goldPct) total.gold *= 1 + b.goldPct * 0.5;
      if (b.productionPct) total.production *= 1 + b.productionPct * 0.5;
    }
    total.science += pop;
    total.food -= pop;
    total.influence += 1;
    const mods = this.crisisMods(civId);
    total.food *= mods.food;
    total.production *= mods.production;
    total.gold *= mods.gold;
    total.science *= mods.science;
    return total;
  }

  crisisMods(civId) {
    const mods = { food: 1, production: 1, gold: 1, science: 1, popLoss: 0 };
    const crisis = this.activeCrisis;
    if (!crisis) return mods;
    const def = crisis.def;
    if (def.base?.food) mods.food *= def.base.food;
    if (def.base?.production) mods.production *= def.base.production;
    if (def.base?.gold) mods.gold *= def.base.gold;
    if (def.base?.science) mods.science *= def.base.science;
    if (crisis.choice === 'negotiate') mods.science *= 1.1;
    if (civId !== this.playerId) {
      mods.food *= 0.92; mods.production *= 0.92; mods.science *= 0.92;
    }
    return mods;
  }

  tileScore(tile) {
    const y = this.tileYields(tile, tile.owner);
    return (y.food * 2 + y.production * 1.6 + y.gold + y.science * 1.4 + y.culture * 1.4 + y.faith);
  }

  /* ============================ MOVEMENT ============================ */
  effectiveRange(unit) {
    const def = UNIT_TYPES[unit.type];
    const tile = this.world.tiles.get(axialKey(unit.q, unit.r));
    const elevated = tile && (tile.terrain === 'hills' || tile.terrain === 'mountain');
    const gen = this.generalForUnit(unit);
    return (def.range ?? 1) + (elevated ? 1 : 0) + (gen?.bonuses?.range ?? 0);
  }
  moveCost(tile, unitType) {
    const def = UNIT_TYPES[unitType];
    const bt = BIOMES[tile.terrain];
    if (tile.blocked) return Infinity;
    if (def?.domain === 'air') return 1;
    if (def?.domain === 'water') {
      if (bt.water || tile.terrain === 'coast' || tile.terrain === 'lake' || tile.terrain === 'ocean') return 1;
      if (def.riverine && tile.river) return 1.5;
      return Infinity;
    }
    if (def?.riverine && (tile.river || bt.water)) return 1;
    if (bt.mountain) return Infinity;
    if (bt.water) return Infinity;
    let cost = 1;
    if (tile.feature && FEATURES[tile.feature]?.move) cost = FEATURES[tile.feature].move;
    if (tile.terrain === 'hills') cost = 2;
    if (tile.river) cost += 0.5;
    if (tile.effect === 'flood' || tile.effect === 'storm') cost += 1;
    if (tile.effect === 'fire') cost += 1;
    return cost;
  }

  reachable(unit) {
    const world = this.world;
    const def = UNIT_TYPES[unit.type];
    const start = world.tiles.get(axialKey(unit.q, unit.r));
    const max = unit.moves;
    const best = new Map([[start.key, 0]]);
    const prev = new Map();
    const frontier = [[start, 0]];
    const moves = [];
    while (frontier.length) {
      frontier.sort((a, b) => a[1] - b[1]);
      const [tile, cost] = frontier.shift();
      for (const [dq, dr] of [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]]) {
        const n = world.tiles.get(axialKey(tile.q + dq, tile.r + dr));
        if (!n) continue;
        const hostile = n.city && n.city.civId !== unit.civId;
        const occupied = n.units.some((u) => u.civId !== unit.civId);
        const mc = this.moveCost(n, unit.type);
        if (!isFinite(mc)) continue;
        if (hostile || occupied) continue;
        if (n.units.some((u) => u.civId === unit.civId && u !== unit)) continue;
        const nc = cost + mc;
        if (nc > max + 0.001) continue;
        if (best.has(n.key) && best.get(n.key) <= nc) continue;
        best.set(n.key, nc);
        prev.set(n.key, tile.key);
        frontier.push([n, nc]);
        moves.push(n);
      }
    }
    const attacks = [];
    if (!def.civilian && unit.moves > 0) {
      for (const [q, r] of hexesWithin(unit.q, unit.r, this.effectiveRange(unit))) {
        if (q === unit.q && r === unit.r) continue;
        const t = world.tiles.get(axialKey(q, r));
        if (!t) continue;
        const enemyUnit = t.units.find((u) => u.civId !== unit.civId && (unit.civId !== this.playerId || this.isUnitVisible(u, unit.civId)));
        const enemyCity = t.city && t.city.civId !== unit.civId ? t.city : null;
        if (enemyUnit || enemyCity) attacks.push(t);
      }
    }
    return { moves, attacks, prev, best };
  }

  async moveUnit(unit, q, r, pathTiles) {
    const world = this.world;
    const path = pathTiles && pathTiles.length ? pathTiles : [world.tiles.get(axialKey(q, r))];
    let spent = 0;
    for (const tile of path) {
      spent += this.moveCost(tile, unit.type);
      await world.moveUnitTo(unit, tile.q, tile.r);
    }
    unit.moves = Math.max(0, unit.moves - spent);
    this.recomputeVision();
    this.emit('change');
  }

  /* ============================ ACTIONS ============================ */
  async foundCity(unit) {
    if (unit.type !== 'settler') return false;
    const world = this.world;
    const tile = world.tiles.get(axialKey(unit.q, unit.r));
    if (!BIOMES[tile.terrain].passable) return false;
    const near = world.cities.some((c) => axialDistance(c.q, c.r, tile.q, tile.r) < 3);
    if (near) { this.notify('無法定居', '距離其他城市太近。', 'warn'); return false; }
    const civ = world.civs.get(unit.civId);
    world.removeUnit(unit);
    civ.units = civ.units.filter((u) => u !== unit);
    const city = this.makeCity(civ, tile, false);
    world.rebuildTerritory();
    this.recomputeVision();
    this.emit('cityFounded', city);
    this.emit('change');
    return true;
  }

  improve(unit) {
    const world = this.world;
    const tile = world.tiles.get(axialKey(unit.q, unit.r));
    if (!BIOMES[tile.terrain].passable || tile.city) return false;
    if (tile.improvement) { this.notify('已有改良', '此地格已有改良設施。', 'warn'); return false; }
    const def = UNIT_TYPES[unit.type];
    tile.improvement = tile.terrain === 'hills' ? 'mine' : 'farm';
    unit.moves = 0;
    this.emit('notify', { title: '地格已改良', body: `${def.name}建造了${tile.improvement === 'mine' ? '礦場' : '農場'}。`, kind: 'good', icon: 'i-production' });
    this.emit('change');
    return true;
  }

  buildDepot(unit) {
    if (unit.type !== 'builder') return false;
    const tile = this.world.tiles.get(axialKey(unit.q, unit.r));
    if (!tile || !BIOMES[tile.terrain].passable || tile.city) return false;
    tile.improvement = 'depot';
    unit.moves = 0;
    unit.xp += 1;
    this.notify('補給站建立', '此地的軍團補給範圍將延伸至此。', 'good', 'i-production');
    this.emit('change');
    return true;
  }

  fortify(unit) {
    unit.fortified = !unit.fortified;
    unit.moves = 0;
    this.emit('change');
  }
  sleep(unit) { unit.asleep = true; this.emit('change'); }

  generalForUnit(unit) {
    if (!unit?.generalId) return null;
    return this.generals.find((g) => g.id === unit.generalId && !g.dead) ?? null;
  }
  legionBonus(unit) {
    const gen = this.generalForUnit(unit);
    let aura = 0;
    if (gen) {
      const source = this.world.tiles.get(axialKey(unit.q, unit.r));
      const generalUnit = this.world.units.find((u) => u.generalId === gen.id);
      if (generalUnit && source) {
        const near = this.world.units.filter((u) => u.civId === unit.civId && axialDistance(u.q, u.r, generalUnit.q, generalUnit.r) <= 2);
        if (near.length > 1) aura = 0.08;
      }
    }
    return aura;
  }
  attackStrength(unit, ranged = false) {
    const def = UNIT_TYPES[unit.type];
    const tile = this.world.tiles.get(axialKey(unit.q, unit.r));
    const gen = this.generalForUnit(unit);
    let str = (ranged ? (def.rangedStr ?? def.str) : def.str);
    str *= 1 + unit.level * 0.08;
    str *= 1 + (gen?.bonuses?.strPct ?? 0);
    if (ranged) str *= 1 + (gen?.bonuses?.rangedPct ?? 0);
    if (def.domain === 'water') str *= 1 + (gen?.bonuses?.navy ?? 0);
    if (this.scenarioId === 'threeKingdoms' && unit.civId === 'norlund' && (def.domain === 'water' || tile?.terrain === 'coast')) str *= 1.2;
    if (this.scenarioId === 'chrono' && unit.civId === 'norlund' && ranged) str *= 1.2;
    str *= 1 + this.legionBonus(unit);
    if (tile && (tile.terrain === 'hills' || tile.terrain === 'mountain')) str *= 1.25;
    if (!unit.supplied) str *= 0.75;
    if (this.doctrines[unit.civId] === 'bio') str *= 1.08;
    return str;
  }
  async attack(unit, targetTile) {
    const world = this.world;
    const def = UNIT_TYPES[unit.type];
    const enemyUnit = targetTile.units.find((u) => u.civId !== unit.civId);
    const enemyCity = targetTile.city && targetTile.city.civId !== unit.civId ? targetTile.city : null;
    if (!enemyUnit && !enemyCity) return;
    if ((def.range ?? 1) > 1) {
      const src = world.tiles.get(axialKey(unit.q, unit.r));
      if (this.losBlocked(src, targetTile)) {
        this.notify('視線受阻', '山脈、密林或風暴遮蔽了射擊路線。', 'warn', 'i-defense');
        return;
      }
    }
    const attackerCiv = world.civs.get(unit.civId);
    const atkStr = this.attackStrength(unit, (def.rangedStr ?? def.str) > def.str);
    this.emit('combatFlash');
    if (enemyCity) {
      const defStr = enemyCity.defense + enemyCity.hp * 0.05;
      const bonus = unit.civId === 'norlund' ? 1.2 : 1;
      const dmg = clamp((atkStr * bonus - defStr * 0.5) * this.rng.float(0.85, 1.15) + 10, 6, 60);
      enemyCity.hp = Math.max(0, enemyCity.hp - dmg);
      enemyCity.defense = Math.max(0, enemyCity.defense - 1);
      const retaliate = (def.range ?? 1) <= 1 ? clamp(defStr * 0.35, 4, 26) : 0;
      unit.hp -= retaliate;
      this.emit('notify', { title: `${enemyCity.name}遭到圍攻`, body: `造成 ${Math.round(dmg)} 點傷害${retaliate ? `，承受 ${Math.round(retaliate)} 點` : ''}。`, kind: 'war', icon: 'i-attack' });
      if (enemyCity.hp <= 0) await this.captureCity(enemyCity, attackerCiv);
    } else if (enemyUnit) {
      const eDef = UNIT_TYPES[enemyUnit.type];
      let defStr = eDef.str * (1 + enemyUnit.level * 0.08) * (1 + (enemyUnit.fortified ? 0.25 : 0));
      if (eDef.antiCav && def.cls === 'cavalry') defStr *= 1.5;
      if (!enemyUnit.supplied) defStr *= 0.8;
      if (targetTile.effect === 'fire' && eDef.cls !== 'siege') defStr *= 0.9;
      const dmg = clamp((atkStr - defStr * 0.55) * this.rng.float(0.85, 1.15) + 22, 8, 75);
      enemyUnit.hp = Math.max(0, enemyUnit.hp - dmg);
      const retaliate = (def.range ?? 1) <= 1 ? clamp(defStr * 0.42 - atkStr * 0.08, 4, 32) : 0;
      unit.hp -= retaliate;
      unit.xp += 2;
      this.emit('combat', { unit, enemyUnit, dmg, retaliate });
      if (enemyUnit.hp <= 0) {
        this.detachGeneral(enemyUnit);
        world.removeUnit(enemyUnit);
        const eCiv = world.civs.get(enemyUnit.civId);
        eCiv.units = eCiv.units.filter((u) => u !== enemyUnit);
        unit.xp += 5;
        unit.level = Math.min(5, Math.floor(unit.xp / 12));
        if (eDef.guardian) this.claimAnomaly(unit.civId, targetTile);
        this.emit('notify', { title: '敵軍殲滅', body: `${eDef.name}已敗於我軍之手。`, kind: 'good', icon: 'i-kills' });
      }
    }
    unit.moves = Math.max(0, unit.moves - 1);
    updateHealthBar(unit);
    if (enemyUnit) updateHealthBar(enemyUnit);
    if (unit.hp <= 0) {
      world.removeUnit(unit);
      const civ = world.civs.get(unit.civId);
      civ.units = civ.units.filter((u) => u !== unit);
      this.detachGeneral(unit);
      this.emit('notify', { title: '單位陣亡', body: `我軍${def.name}已戰死沙場。`, kind: 'war', icon: 'i-kills' });
    }
    this.recomputeVision();
    this.emit('change');
  }

  claimAnomaly(civId, tile) {
    if (!tile?.anomaly) return;
    const a = tile.anomaly;
    const unlocks = this.blackUnlocks[civId] ?? (this.blackUnlocks[civId] = new Set());
    if (a.kind === 'atlantis' || a.kind === 'alien') unlocks.add(a.kind);
    const stock = this.strategic[civId];
    if (stock) {
      stock.rareEarth += 2;
      stock.helium3 += 1;
      stock.quartz += 2;
    }
    if (this.orbitals) this.orbitals[civId] = (this.orbitals[civId] ?? 0) + 1;
    tile.anomaly = null;
    this.world.anomalyTiles = (this.world.anomalyTiles ?? []).filter((t) => t !== tile);
    this.world.refreshEffects();
    this.notify('異常區已淨化', '遠古守護者倒下，遺物成為帝國的養分。解鎖黑科技。', 'good', 'i-wonder');
  }

  async captureCity(city, conqueror) {
    const world = this.world;
    const old = world.civs.get(city.civId);
    old.cities = old.cities.filter((c) => c !== city);
    city.civId = conqueror.id;
    city.civ = conqueror;
    city.hp = city.maxHp * 0.5;
    city.population = Math.max(1, Math.floor(city.population / 2));
    conqueror.cities.push(city);
    for (const tile of world.tileList) if (tile.owner === old.id && axialDistance(tile.q, tile.r, city.q, city.r) <= 2) tile.owner = conqueror.id;
    world.rebuildTerritory();
    this.emit('cityCaptured', { city, conqueror, old });
    if (old.cities.length === 0) this.checkElimination(old);
    this.emit('change');
  }

  checkElimination(civ) {
    if (civ.id === this.playerId || civ.cities.length > 0) return;
    this.emit('notify', { title: '文明覆滅', body: `${civ.name}已從歷史上抹去。`, kind: 'war', icon: 'i-kills' });
  }

  /* ============================ PRODUCTION / TECH ============================ */
  productionOptions(city) {
    const civId = city.civId;
    const opts = [];
    for (const [id, def] of Object.entries(UNIT_TYPES)) {
      if (def.tech && !this.hasTech(civId, def.tech)) continue;
      if (def.guardian) continue;
      if (id === 'settler' && city.population < 2) continue;
      const afford = this.hasStrategic(civId, def.strategic);
      opts.push({ kind: 'unit', id, name: def.name, cost: def.cost, icon: def.icon, blurb: def.blurb + (def.strategic ? `　需求：${this.strategicLabel(def.strategic)}` : ''), turns: this.estimateTurns(city, def.cost), afford, strategic: def.strategic });
    }
    for (const [id, def] of Object.entries(BUILDINGS)) {
      if (city.buildings.includes(id)) continue;
      if (def.reqTech && !this.hasTech(civId, def.reqTech)) continue;
      opts.push({ kind: 'building', id, name: def.name, cost: def.cost, icon: def.icon, blurb: def.blurb, turns: this.estimateTurns(city, def.cost) });
    }
    for (const [id, def] of Object.entries(WONDERS)) {
      if (this.wondersBuilt.has(id)) continue;
      if (city.wonders.includes(id)) continue;
      if (def.reqTech && !this.hasTech(civId, def.reqTech)) continue;
      opts.push({ kind: 'wonder', id, name: def.name, cost: def.cost, icon: def.icon, blurb: def.blurb, turns: this.estimateTurns(city, def.cost) });
    }
    return opts;
  }

  estimateTurns(city, cost) {
    const y = this.civYields(city.civId);
    const prod = Math.max(1, y.production + city.population);
    return Math.max(1, Math.ceil((cost - city.produceProgress) / prod));
  }

  setProduction(city, kind, id) {
    let def;
    if (kind === 'unit') def = UNIT_TYPES[id];
    else if (kind === 'building') def = BUILDINGS[id];
    else def = WONDERS[id];
    city.producing = { kind, id, name: def.name, cost: def.cost, icon: def.icon };
    city.produceProgress = 0;
    this.emit('change');
  }

  strategicLabel(cost) {
    if (!cost) return '';
    return Object.entries(cost).map(([k, n]) => `${STRATEGIC.refined[k]?.name ?? STRATEGIC.raw[k]?.name ?? k}×${n}`).join('、');
  }
  hasStrategic(civId, cost) {
    if (!cost) return true;
    const stock = this.strategic[civId];
    if (!stock) return false;
    return Object.entries(cost).every(([k, n]) => (stock[k] ?? 0) >= n);
  }
  consumeStrategic(civId, cost) {
    if (!cost) return true;
    if (!this.hasStrategic(civId, cost)) return false;
    const stock = this.strategic[civId];
    for (const [k, n] of Object.entries(cost)) stock[k] -= n;
    return true;
  }
  gainStrategic(civId, key, amount) {
    const stock = this.strategic[civId];
    if (stock) stock[key] = (stock[key] ?? 0) + amount;
  }

  completeProduction(city) {
    const world = this.world;
    const p = city.producing;
    if (!p) return;
    const civ = world.civs.get(city.civId);
    if (p.kind === 'unit') {
      const def = UNIT_TYPES[p.id];
      if (!this.consumeStrategic(city.civId, def.strategic)) {
        this.notify('戰略資源不足', `${p.name}需要 ${this.strategicLabel(def.strategic)}。`, 'warn', 'i-production');
        city.producing = null;
        city.produceProgress = 0;
        return;
      }
      const tile = world.tiles.get(axialKey(city.q, city.r));
      const domain = def.domain;
      const spot = world.tileList.find((t) => {
        const ok = domain === 'water'
          ? (t.terrain === 'coast' || t.terrain === 'lake' || t.terrain === 'ocean')
          : BIOMES[t.terrain].passable;
        return ok && axialDistance(t.q, t.r, city.q, city.r) <= 2 && !t.city && t.units.length === 0;
      }) ?? tile;
      const unit = this.spawnUnit(civ, p.id, spot.q, spot.r);
      if (city.civId === this.playerId) this.emit('unitBuilt', unit);
    } else if (p.kind === 'building') {
      city.buildings.push(p.id);
      const bdef = BUILDINGS[p.id];
      if (bdef?.defense) city.defense += bdef.defense;
      this.adjustCityLabel(city);
    } else if (p.kind === 'wonder') {
      city.wonders.push(p.id);
      this.wondersBuilt.add(p.id);
      if (city.mesh?.userData?.setWonder) city.mesh.userData.setWonder(p.id);
      this.emit('wonderBuilt', { city, id: p.id });
    }
    city.producing = null;
    city.produceProgress = 0;
    this.emit('change');
  }

  adjustCityLabel(city) {
    if (city.label?.userData?.redraw) city.label.userData.redraw();
  }

  hasTech(civId, techId) {
    return this.techStateFor(civId).has(techId);
  }

  techStateFor(civId) {
    this.acquired = this.acquired || {};
    if (!this.acquired[civId]) this.acquired[civId] = new Set();
    return this.acquired[civId];
  }

  techCost(tech) {
    if (!tech) return 0;
    return Math.round(tech.cost * (this.scenario.techCost ?? 1));
  }
  doctrineLocked(civId, tech) {
    if (!tech?.branch) return false;
    const current = this.doctrines[civId];
    return !!current && current !== tech.branch;
  }
  availableTechs(civId) {
    const acquired = this.techStateFor(civId);
    return TECHS.filter((t) => {
      if (acquired.has(t.id)) return false;
      const era = TECH_ERA_ORDER.indexOf(t.era);
      if (era > this.maxEra) return false;
      if (!t.prereq.every((p) => acquired.has(p))) return false;
      if (this.doctrineLocked(civId, t)) return false;
      if (t.requiresBlack && !this.blackUnlocks[civId]?.has(t.requiresBlack)) return false;
      return true;
    });
  }

  chooseDoctrine(civId, branch) {
    if (!DOCTRINES[branch] || this.doctrines[civId]) return false;
    this.doctrines[civId] = branch;
    if (civId === this.playerId) this.notify('文明路線確立', `${DOCTRINES[branch].name}：${DOCTRINES[branch].blurb}`, 'good', 'i-wonder');
    this.emit('doctrine', { civId, branch });
    this.emit('change');
    return true;
  }

  setResearch(civId, techId) {
    const acquired = this.techStateFor(civId);
    const tech = TECHS.find((t) => t.id === techId);
    if (!tech || acquired.has(techId)) return false;
    if (TECH_ERA_ORDER.indexOf(tech.era) > this.maxEra) return false;
    if (!tech.prereq.every((p) => acquired.has(p))) return false;
    if (this.doctrineLocked(civId, tech)) return false;
    if (tech.requiresBlack && !this.blackUnlocks[civId]?.has(tech.requiresBlack)) return false;
    if (tech.branch && !this.doctrines[civId]) this.chooseDoctrine(civId, tech.branch);
    this.currentTech[civId] = techId;
    this.techProgress[civId] = 0;
    this.emit('change');
    return true;
  }

  researchTurns(civId) {
    const y = this.civYields(civId);
    const tech = TECHS.find((t) => t.id === this.currentTech[civId]);
    if (!tech) return '—';
    const remaining = this.techCost(tech) - (this.techProgress[civId] || 0);
    return Math.max(1, Math.ceil(remaining / Math.max(1, y.science)));
  }

  finishTech(civId, tech) {
    const acquired = this.techStateFor(civId);
    acquired.add(tech.id);
    if (tech.branch && !this.doctrines[civId]) this.chooseDoctrine(civId, tech.branch);
    if (tech.pop) {
      const civ = this.world.civs.get(civId);
      for (const city of civ?.cities ?? []) { city.population += tech.pop; this.adjustCityLabel(city); }
    }
    if (tech.id === 'satellites') this.orbitals[civId] = (this.orbitals[civId] ?? 0) + 1;
    if (tech.id === 'orbitalDock') this.orbitals[civId] = (this.orbitals[civId] ?? 0) + 1;
    this.emit('techComplete', { civId, tech });
  }

  rollWeather() {
    const dirs = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]];
    const names = ['東風', '東南風', '南風', '西南風', '西風', '西北風', '北風', '東北風'];
    const dir = dirs[this.rng.int(0, dirs.length - 1)];
    this.weather = {
      name: names[this.rng.int(0, names.length - 1)],
      wind: dir,
      angle: Math.atan2(dir[0], dir[1]),
      strength: this.rng.int(1, 2),
      stormy: this.rng.chance(0.16),
    };
    this.emit('weather', this.weather);
  }

  supplyRange(unit) {
    const gen = this.generalForUnit(unit);
    let range = 12 + (gen?.bonuses?.supply ?? 0);
    if (this.scenarioId === 'chrono' && unit.civId === 'kemet') range += 4;
    for (const tech of TECHS) if (tech.supply && this.hasTech(unit.civId, tech.id)) range += tech.supply;
    return range;
  }
  supplySourceAt(tile, civId) {
    if (!tile) return false;
    if (tile.city && tile.city.civId === civId) return true;
    return tile.owner === civId && tile.improvement === 'depot';
  }
  supplyInfo(unit) {
    const world = this.world;
    if (UNIT_TYPES[unit.type]?.domain === 'air') return { ok: true, distance: 0, range: 99 };
    const start = world.tiles.get(axialKey(unit.q, unit.r));
    if (!start) return { ok: false, distance: 99, range: 0 };
    if (this.supplySourceAt(start, unit.civId)) return { ok: true, distance: 0, range: this.supplyRange(unit) };
    const range = this.supplyRange(unit);
    const best = new Map([[start.key, 0]]);
    const queue = [[start, 0]];
    while (queue.length) {
      queue.sort((a, b) => a[1] - b[1]);
      const [tile, dist] = queue.shift();
      if (dist > 0 && this.supplySourceAt(tile, unit.civId)) return { ok: true, distance: dist, range };
      if (dist >= range) continue;
      for (const [dq, dr] of HEX_DIRS) {
        const n = world.tiles.get(axialKey(tile.q + dq, tile.r + dr));
        if (!n || best.has(n.key)) continue;
        if (n.city && n.city.civId !== unit.civId) continue;
        if (n.units.some((u) => u.civId !== unit.civId)) continue;
        if (n.effect === 'storm') continue;
        if (!isFinite(this.moveCost(n, unit.type))) continue;
        best.set(n.key, dist + 1);
        queue.push([n, dist + 1]);
      }
    }
    return { ok: false, distance: range + 1, range };
  }
  supplyPath(unit) {
    const world = this.world;
    const start = world.tiles.get(axialKey(unit.q, unit.r));
    if (!start) return [];
    const prev = new Map();
    const seen = new Set([start.key]);
    const queue = [start];
    let found = null;
    while (queue.length) {
      const tile = queue.shift();
      if (tile !== start && this.supplySourceAt(tile, unit.civId)) { found = tile; break; }
      for (const [dq, dr] of HEX_DIRS) {
        const n = world.tiles.get(axialKey(tile.q + dq, tile.r + dr));
        if (!n || seen.has(n.key)) continue;
        if (n.city && n.city.civId !== unit.civId) continue;
        if (n.effect === 'storm') continue;
        if (!isFinite(this.moveCost(n, unit.type))) continue;
        seen.add(n.key);
        prev.set(n.key, tile);
        queue.push(n);
      }
    }
    if (!found) return [];
    const path = [found];
    let cur = found;
    while (cur !== start) { cur = prev.get(cur.key); if (!cur) break; path.push(cur); }
    return path;
  }
  armScheme(type, unit = this.schemeActor()) {
    if (!this.schemeAvailable(type, unit)) return [];
    this.schemeMode = { type, unitId: unit.id };
    return this.schemeTargets(type, unit);
  }
  cancelScheme() { this.schemeMode = null; this.world.clearTacticalTargets(); }
  updateSupply() {
    for (const unit of this.world.units) {
      if (UNIT_TYPES[unit.type]?.civilian || unit.guardian) continue;
      const info = this.supplyInfo(unit);
      unit.supplied = info.ok;
      unit.supplyDistance = info.distance;
      if (!info.ok) {
        unit.supplyTurns = (unit.supplyTurns ?? 0) + 1;
        unit.hp = Math.max(1, unit.hp - 7);
        updateHealthBar(unit);
      } else unit.supplyTurns = 0;
    }
  }

  availableGenerals(civId) {
    const taken = new Set(this.generals.map((g) => g.id));
    return GENERALS.filter((g) => !taken.has(g.id) && !g.dead);
  }
  ownedGenerals(civId) {
    return this.generals.filter((g) => g.civId === civId && !g.dead);
  }
  recruitGeneral(civId, defId) {
    const def = GENERALS.find((g) => g.id === defId);
    const civ = this.world.civs.get(civId);
    if (!def || !civ) return false;
    if (this.generals.some((g) => g.id === defId && !g.dead)) return false;
    const stock = this.stocks[civId];
    if (!stock || stock.gold < def.cost) return false;
    stock.gold -= def.cost;
    const gen = {
      ...def, civId, age: def.age, loyalty: def.loyalty, unitId: null,
      bornTurn: this.turn, legacy: 0, dead: false,
    };
    this.generals.push(gen);
    if (civId === this.playerId) this.notify('名將投效', `${gen.name}加入了你的麾下。`, 'good', 'i-influence');
    this.emit('generalRecruited', gen);
    this.emit('change');
    return true;
  }
  assignGeneral(civId, genId, unit) {
    const gen = this.generals.find((g) => g.id === genId && g.civId === civId && !g.dead);
    if (!gen || !unit || unit.civId !== civId) return false;
    if (unit.generalId) this.detachGeneral(unit);
    const old = this.world.units.find((u) => u.generalId === gen.id);
    if (old) this.detachGeneral(old);
    gen.unitId = unit.id;
    unit.generalId = gen.id;
    if (gen.bonuses?.hp) {
      unit.generalHpBonus = gen.bonuses.hp;
      unit.maxHp += gen.bonuses.hp;
      unit.hp += gen.bonuses.hp;
    }
    this.world.attachGeneral(unit, gen);
    this.emit('change');
    return true;
  }
  detachGeneral(unit) {
    if (!unit?.generalId) return;
    const gen = this.generals.find((g) => g.id === unit.generalId);
    if (gen && gen.unitId === unit.id) gen.unitId = null;
    if (unit.generalHpBonus) {
      unit.maxHp = Math.max(1, unit.maxHp - unit.generalHpBonus);
      unit.hp = Math.min(unit.hp, unit.maxHp);
      unit.generalHpBonus = 0;
    }
    unit.generalId = null;
    this.world.detachGeneral(unit);
  }
  tickGenerals(civ) {
    const stock = this.stocks[civ.id];
    for (const gen of this.ownedGenerals(civ.id)) {
      gen.age += this.scenario.immortal ? 0 : 1;
      const pay = 2;
      if (stock.gold >= pay) stock.gold -= pay;
      else gen.loyalty -= 3;
      if (this.turn % 6 === 0) gen.loyalty += gen.unitId ? 2 : -1;
      gen.loyalty = clamp(gen.loyalty, 0, 100);
      const memory = this.hasTech(civ.id, 'memoryChips') || civ.cities.some((c) => c.buildings.includes('memoryVault'));
      if (!this.scenario.immortal && gen.age > gen.lifespan && !memory) {
        gen.dead = true;
        gen.legacy = Math.round(10 + gen.loyalty * 0.3);
        const unit = this.world.units.find((u) => u.generalId === gen.id);
        if (unit) this.detachGeneral(unit);
        if (civ.id === this.playerId) this.notify('名將殞落', `${gen.name}走完了一生，留下傳承 ${gen.legacy}。`, 'war', 'i-wonder');
        continue;
      }
      if (gen.loyalty < 22 && this.turn > 8) {
        const rivals = [...this.world.civs.values()].filter((c) => c.id !== civ.id && !c.isWilds && c.cities.length);
        gen.loyalty += 8;
        if (rivals.length && this.rng.chance(0.35)) {
          const oldUnit = this.world.units.find((u) => u.generalId === gen.id);
          if (oldUnit) this.detachGeneral(oldUnit);
          const rival = rivals[this.rng.int(0, rivals.length - 1)];
          gen.civId = rival.id;
          gen.loyalty = 55;
          if (civ.id === this.playerId) this.notify('名將叛離', `${gen.name}投向了${rival.name}。`, 'warn', 'i-influence');
        }
      }
    }
  }

  healUnits(civ) {
    const healBase = this.doctrines[civ.id] === 'bio' ? 3 : 0;
    for (const unit of civ.units) {
      const gen = this.generalForUnit(unit);
      const tile = this.world.tiles.get(axialKey(unit.q, unit.r));
      const ownLand = this.scenarioId === 'threeKingdoms' && civ.id === 'kemet' && tile?.owner === civ.id ? 3 : 0;
      const heal = healBase + ownLand + (gen?.bonuses?.heal ? Math.round(unit.maxHp * gen.bonuses.heal) : 0);
      if (heal > 0 && unit.hp < unit.maxHp) {
        unit.hp = Math.min(unit.maxHp, unit.hp + heal);
        updateHealthBar(unit);
      }
    }
  }

  climateTick() {
    let total = 0;
    for (const civ of this.world.civs.values()) {
      if (civ.isWilds) continue;
      const y = this.civYields(civ.id);
      let emissions = 0;
      for (const city of civ.cities) {
        for (const b of city.buildings) {
          const def = BUILDINGS[b];
          if (def?.emissions) emissions += def.emissions;
          if (def?.clean) emissions -= def.clean;
        }
        emissions += Math.max(0, city.population - 3) * 0.4;
      }
      if (this.doctrines[civ.id] === 'cyber') emissions += 2;
      for (const tech of TECHS) {
        if (tech.clean && this.hasTech(civ.id, tech.id)) emissions -= tech.clean;
      }
      for (const gen of this.generals ?? []) {
        if (gen.civId === civ.id && !gen.dead && gen.bonuses?.clean) emissions -= gen.bonuses.clean * 0.5;
      }
      total += Math.max(0, emissions);
    }
    this.climate.emissions = Math.max(0, this.climate.emissions + total / 4);
    const thresholds = [40, 80, 140, 220, 320];
    while (this.climate.emissions >= this.climate.nextThreshold) {
      this.climate.temperature++;
      this.climate.seaLevel++;
      this.climate.events++;
      const flooded = this.submergeCoastal(2 + this.climate.seaLevel);
      this.notify('氣候變遷', `全球均溫上升 ${this.climate.temperature}°C，${flooded} 個沿海地格被海水吞沒。`, 'war', 'i-wonder');
      const idx = thresholds.findIndex((t) => t > this.climate.emissions);
      this.climate.nextThreshold = idx >= 0 ? thresholds[idx] : thresholds[thresholds.length - 1] * 1.4;
    }
  }
  submergeCoastal(count) {
    const world = this.world;
    const candidates = world.tileList.filter((t) => t.terrain === 'coast' && !t.city && !t.units.length && !t.submerged);
    let n = 0;
    for (const t of candidates) {
      if (n >= count) break;
      if (!t.explored && this.rng.chance(0.5)) continue;
      t.submerged = true;
      t.terrain = 'coast';
      t.feature = null;
      t.resource = null;
      t.improvement = null;
      t.effect = 'submerged';
      t.effectTurns = 999;
      n++;
    }
    if (n) world.refreshEffects();
    return n;
  }

  strategicTick(civ) {
    const stock = this.strategic[civ.id];
    if (!stock) return;
    for (const tile of this.world.tileList) {
      if (tile.owner !== civ.id || !tile.resource) continue;
      const res = RESOURCES[tile.resource];
      if (res?.strategic && !tile.submerged) stock[res.strategic] = (stock[res.strategic] ?? 0) + 1;
    }
    for (const recipe of STRATEGIC.recipes) {
      const hasBuilding = civ.cities.some((c) => c.buildings.includes(recipe.building));
      if (!hasBuilding) continue;
      if (this.consumeStrategic(civ.id, recipe.inputs)) stock[recipe.id] = (stock[recipe.id] ?? 0) + recipe.output;
    }
  }

  schemeActor() {
    if (this.selected?.type === 'unit') return this.selected.ref;
    return null;
  }
  schemeAvailable(type, unit = this.schemeActor()) {
    const scheme = SCHEMES[type];
    if (!scheme || !unit) return false;
    if (unit.moves <= 0) return false;
    if (scheme.tech && !this.hasTech(unit.civId, scheme.tech)) return false;
    if (type === 'orbital' && !(this.orbitals[unit.civId] > 0)) return false;
    return true;
  }
  schemeTargets(type, unit = this.schemeActor()) {
    if (!unit) return [];
    const scheme = SCHEMES[type];
    if (!scheme) return [];
    const origin = this.world.tiles.get(axialKey(unit.q, unit.r));
    if (!origin) return [];
    const out = [];
    for (const [q, r] of hexesWithin(unit.q, unit.r, scheme.range)) {
      const tile = this.world.tiles.get(axialKey(q, r));
      if (!tile || !tile.explored) continue;
      if (q === unit.q && r === unit.r) continue;
      if (!this.schemeTileValid(type, unit, tile)) continue;
      out.push(tile);
    }
    return out;
  }
  schemeTileValid(type, unit, tile) {
    if (!tile) return false;
    if (type === 'fire') return !BIOMES[tile.terrain].water && !tile.city && tile.terrain !== 'mountain' && tile.effect !== 'fire';
    if (type === 'rockslide') {
      if (tile.city) return false;
      if (tile.terrain === 'mountain' || tile.terrain === 'hills') return true;
      return HEX_DIRS.some(([dq, dr]) => {
        const n = this.world.tiles.get(axialKey(tile.q + dq, tile.r + dr));
        return n && (n.terrain === 'mountain' || n.terrain === 'hills');
      });
    }
    if (type === 'flood') {
      if (tile.city || BIOMES[tile.terrain].water) return false;
      if (tile.river) return true;
      return HEX_DIRS.some(([dq, dr]) => this.world.tiles.get(axialKey(tile.q + dq, tile.r + dr))?.river);
    }
    if (type === 'orbital') return true;
    if (type === 'storm') return !tile.city && !BIOMES[tile.terrain].water;
    if (type === 'terraform') return tile.terrain === 'mountain' || tile.terrain === 'desert' || tile.terrain === 'hills' || tile.terrain === 'snow';
    return false;
  }
  performScheme(type, unit, tile) {
    const scheme = SCHEMES[type];
    if (!scheme || !unit || !tile) return false;
    if (!this.schemeAvailable(type, unit)) return false;
    if (!this.schemeTargets(type, unit).some((t) => t.key === tile.key)) return false;
    const world = this.world;
    const power = 1 + (this.generalForUnit(unit)?.bonuses?.scheme ?? 0);
    if (type === 'fire') {
      tile.effect = 'fire'; tile.effectTurns = 3;
      this.damageTileUnits(tile, 10 * power);
      this.notify('火攻', `火焰在${tile.q},${tile.r}燃起，${this.weather.name}將助長火勢。`, 'war', 'i-attack');
    } else if (type === 'rockslide') {
      tile.blocked = true; tile.blockedTurns = 2; tile.effect = 'rubble'; tile.effectTurns = 6;
      tile.improvement = null;
      for (const t of hexesWithin(tile.q, tile.r, 1)) {
        const n = world.tiles.get(axialKey(t[0], t[1]));
        if (n) this.damageTileUnits(n, (n === tile ? 26 : 12) * power);
      }
      if (tile.city) tile.city.hp = Math.max(0, tile.city.hp - 18);
      this.notify('落石', '山崩掩埋了道路，山下敵軍死傷慘重。', 'war', 'i-defense');
    } else if (type === 'flood') {
      for (const t of hexesWithin(tile.q, tile.r, 1)) {
        const n = world.tiles.get(axialKey(t[0], t[1]));
        if (!n || BIOMES[n.terrain].water) continue;
        n.effect = 'flood'; n.effectTurns = 4;
        n.improvement = null;
        this.damageTileUnits(n, 16 * power);
      }
      if (tile.city) tile.city.hp = Math.max(0, tile.city.hp - 20);
      this.notify('水攻', '堤壩潰決，洪水吞沒了下游河谷。', 'war', 'i-influence');
    } else if (type === 'orbital') {
      this.orbitals[unit.civId]--;
      for (const t of hexesWithin(tile.q, tile.r, 1)) {
        const n = world.tiles.get(axialKey(t[0], t[1]));
        if (!n) continue;
        this.damageTileUnits(n, (n === tile ? 60 : 25) * power);
        if (n.city) n.city.hp = Math.max(0, n.city.hp - 40);
        n.effect = 'rubble'; n.effectTurns = 5;
      }
      this.notify('上帝之杖', '鎢棒自軌道落下，目標化為焦土。', 'war', 'i-wonder');
    } else if (type === 'storm') {
      tile.effect = 'storm'; tile.effectTurns = 999;
      this.damageTileUnits(tile, 8 * power);
      this.notify('氣象武器', '永恆風暴在敵境生成，補給線為之中斷。', 'war', 'i-influence');
    } else if (type === 'terraform') {
      if (tile.terrain === 'mountain') { tile.terrain = 'hills'; tile.h = Math.min(tile.h, 1.2); }
      else if (tile.terrain === 'desert' || tile.terrain === 'snow') tile.terrain = 'grassland';
      tile.feature = tile.terrain === 'grassland' ? 'forest' : null;
      tile.effect = 'terraformed'; tile.effectTurns = 6;
      this.climate.emissions = Math.max(0, this.climate.emissions - 15);
      this.notify('地球工程', '地貌被永久改寫。', 'good', 'i-wonder');
    }
    unit.moves = Math.max(0, unit.moves - (scheme.costMoves ?? 1));
    world.refreshEffects();
    this.emit('schemeResult', { type, tile, unit });
    this.emit('change');
    return true;
  }
  damageTileUnits(tile, dmg) {
    for (const u of [...tile.units]) {
      u.hp = Math.max(0, u.hp - dmg);
      updateHealthBar(u);
      if (u.hp <= 0) {
        this.world.removeUnit(u);
        const civ = this.world.civs.get(u.civId);
        if (civ) civ.units = civ.units.filter((x) => x !== u);
        this.detachGeneral(u);
      }
    }
  }
  tacticalHazards() {
    const world = this.world;
    for (const tile of world.tileList) {
      if (!tile.effect) {
        if (tile.blockedTurns > 0) {
          tile.blockedTurns--;
          if (tile.blockedTurns <= 0) { tile.blocked = false; world.refreshEffects(); }
        }
        continue;
      }
      if (tile.effect === 'fire') {
        this.damageTileUnits(tile, 10);
        if (tile.feature === 'forest' || tile.feature === 'jungle') tile.feature = null;
        const wind = this.weather.wind;
        const neighbors = HEX_DIRS
          .map(([dq, dr]) => world.tiles.get(axialKey(tile.q + dq, tile.r + dr)))
          .filter((n) => n && n.effect !== 'fire' && this.schemeTileValid('fire', null, n));
        const towardWind = neighbors.filter((n) => {
          const dq = n.q - tile.q, dr = n.r - tile.r;
          return dq * wind[0] + dr * wind[1] > 0;
        });
        const pool = towardWind.length ? towardWind : neighbors;
        if (pool.length && this.rng.chance(0.45 + this.weather.strength * 0.1)) {
          const n = pool[this.rng.int(0, pool.length - 1)];
          n.effect = 'fire'; n.effectTurns = 3;
        }
      }
      if (tile.effect === 'storm') this.damageTileUnits(tile, 5);
      tile.effectTurns = (tile.effectTurns ?? 1) - 1;
      if (tile.effectTurns <= 0) {
        if (tile.effect === 'fire') { tile.effect = 'scorched'; tile.effectTurns = 5; }
        else if (tile.effect === 'flood') { tile.effect = null; }
        else if (tile.effect === 'rubble') { tile.effect = null; tile.blocked = false; }
        else if (tile.effect === 'storm') { tile.effect = null; }
        else if (tile.effect === 'scorched' || tile.effect === 'terraformed') tile.effect = null;
      }
    }
    world.refreshEffects();
  }

  triggerCrisis(id) {
    const def = CRISES.find((c) => c.id === id) ?? this.eligibleCrises()[0];
    if (!def || this.activeCrisis) return false;
    this.activeCrisis = { def, turnsLeft: def.base.turns, choice: null };
    if (def.base.spawn) this.spawnCrisisRaiders(def.base.spawn);
    this.notify('時代危機', `${def.name}：${def.desc}`, 'war', def.icon);
    this.emit('crisis', this.activeCrisis);
    this.emit('change');
    return true;
  }
  spawnCrisisRaiders(count) {
    const wilds = this.world.civs.get('wilds');
    const player = this.world.civs.get(this.playerId);
    if (!wilds || !player?.capital) return;
    const cap = player.capital;
    const spots = this.rng.shuffle(this.world.tileList.filter((t) =>
      BIOMES[t.terrain].passable && !t.city && !t.units.length && !t.anomaly &&
      axialDistance(t.q, t.r, cap.q, cap.r) >= 3 && axialDistance(t.q, t.r, cap.q, cap.r) <= 6));
    for (let i = 0; i < count && i < spots.length; i++) {
      const unit = this.spawnUnit(wilds, 'horseman', spots[i].q, spots[i].r);
      if (unit) { unit.raider = true; unit.supplied = true; }
    }
  }
  clearCrisisRaiders() {
    const wilds = this.world.civs.get('wilds');
    if (!wilds) return;
    for (const unit of [...wilds.units]) {
      if (!unit.raider) continue;
      this.world.removeUnit(unit);
      wilds.units = wilds.units.filter((u) => u !== unit);
    }
  }
  eligibleCrises() {
    return CRISES.filter((c) => (c.minEra ?? 0) <= this.eraIndex);
  }
  strongestRival() {
    return [...this.world.civs.values()]
      .filter((c) => c.id !== this.playerId && CIVS.some((d) => d.id === c.id))
      .sort((a, b) => (b.cities.length * 3 + b.units.length) - (a.cities.length * 3 + a.units.length))[0];
  }
  resolveCrisis(choiceId) {
    const crisis = this.activeCrisis;
    if (!crisis) return false;
    const choice = crisis.def.choices.find((c) => c.id === choiceId);
    if (!choice) return false;
    const civId = this.playerId;
    const stock = this.stocks[civId];
    const strategic = this.strategic[civId];
    for (const [k, n] of Object.entries(choice.cost ?? {})) {
      if (['gold', 'influence', 'faith'].includes(k)) {
        if ((stock[k] ?? 0) < n) return false;
      } else if ((strategic[k] ?? 0) < n) return false;
    }
    for (const [k, n] of Object.entries(choice.cost ?? {})) {
      if (['gold', 'influence', 'faith'].includes(k)) stock[k] -= n;
      else strategic[k] -= n;
    }
    crisis.choice = choice.id;
    if (choice.id === 'tribute') this.clearCrisisRaiders();
    if (choice.id === 'redirect') {
      const rival = this.strongestRival();
      const rivalStock = rival ? this.stocks[rival.id] : null;
      if (rivalStock) rivalStock.gold = Math.max(0, (rivalStock.gold ?? 0) - 60);
    }
    if (choice.id === 'incinerate') {
      const tile = this.world.tileList.find((t) => t.owner === civId && t.improvement && !t.city);
      if (tile) { tile.improvement = null; tile.effect = 'rubble'; tile.effectTurns = 4; this.world.refreshEffects(); }
    }
    if (choice.id === 'levy') {
      const cap = this.world.civs.get(this.playerId)?.capital;
      if (cap) {
        const spots = this.world.tileList.filter((t) => BIOMES[t.terrain].passable && !t.city && !t.units.length && axialDistance(t.q, t.r, cap.q, cap.r) === 1);
        for (let i = 0; i < 2 && i < spots.length; i++) this.spawnUnit(this.world.civs.get(this.playerId), 'warrior', spots[i].q, spots[i].r);
      }
    }
    if (['quarantine', 'redirect', 'shutdown', 'ration', 'adapt'].includes(choice.id)) crisis.turnsLeft = Math.max(1, Math.ceil(crisis.turnsLeft / 2));
    if (['shield', 'magnet', 'geo', 'incinerate', 'negotiate', 'tribute', 'levy'].includes(choice.id)) {
      if (choice.id === 'geo') this.climate.emissions = Math.max(0, this.climate.emissions - 40);
      if (choice.id === 'negotiate') this.techProgress[civId] = (this.techProgress[civId] ?? 0) + 30;
      this.crisisHistory.push({ id: crisis.def.id, name: crisis.def.name, choice: choice.label, turn: this.turn });
      this.activeCrisis = null;
      this.nextCrisisTurn = this.turn + 14 + this.rng.int(0, 8);
    }
    this.notify('危機應對', choice.desc, 'good', 'i-influence');
    this.emit('change');
    return true;
  }
  crisisTick() {
    if (this.activeCrisis) {
      const c = this.activeCrisis;
      if (c.def.base.popLoss) {
        for (const city of this.world.civs.get(this.playerId).cities) {
          if (this.rng.chance(0.5)) city.population = Math.max(1, city.population - c.def.base.popLoss);
        }
      }
      if (c.def.base.flood) this.submergeCoastal(Math.ceil(c.def.base.flood * (c.choice === 'adapt' ? 0.5 : 1)));
      if (c.def.base.tileLoss) {
        const candidates = this.world.tileList.filter((t) => t.owner === this.playerId && t.improvement && !t.city);
        for (let i = 0; i < c.def.base.tileLoss && candidates.length; i++) {
          const t = candidates[this.rng.int(0, candidates.length - 1)];
          t.improvement = null;
          t.effect = 'rubble'; t.effectTurns = 4;
        }
      }
      c.turnsLeft--;
      if (c.turnsLeft <= 0) {
        if (c.def.base.spawn) this.clearCrisisRaiders();
        this.crisisHistory.push({ id: c.def.id, name: c.def.name, choice: '自然平息', turn: this.turn });
        this.activeCrisis = null;
        this.nextCrisisTurn = this.turn + 14 + this.rng.int(0, 8);
      }
      this.world.refreshEffects();
    } else if (this.turn >= this.nextCrisisTurn) {
      const pool = this.eligibleCrises();
      if (pool.length && this.rng.chance(0.55)) this.triggerCrisis(pool[this.rng.int(0, pool.length - 1)].id);
      else this.nextCrisisTurn = this.turn + 8;
    }
  }

  spawnGuardians() {
    const world = this.world;
    const wilds = world.civs.get('wilds');
    if (!wilds) return;
    const spots = world.anomalyTiles ?? [];
    for (const tile of spots) {
      const g = this.spawnUnit(wilds, 'guardian', tile.q, tile.r);
      if (g) { g.guardian = true; g.supplied = true; }
    }
  }

  /* ============================ TURN ============================ */
  async endTurn() {
    if (this.busy || this.gameOver) return;
    this.busy = true;
    this.emit('turnStart', { turn: this.turn });
    const world = this.world;
    this.rollWeather();
    // process all civs' economy
    for (const civ of world.civs.values()) {
      if (civ.isWilds) continue;
      const y = this.civYields(civ.id);
      const stock = this.stocks[civ.id];
      stock.gold += y.gold;
      stock.faith += y.faith;
      stock.influence += y.influence;
      // research
      const tech = TECHS.find((t) => t.id === this.currentTech[civ.id]);
      if (tech) {
        this.techProgress[civ.id] = (this.techProgress[civ.id] || 0) + y.science;
        if (this.techProgress[civ.id] >= this.techCost(tech)) {
          this.finishTech(civ.id, tech);
          if (civ.id === this.playerId) this.notify('研究完成', `${tech.name}：${tech.bonus}`, 'good', 'i-research');
          // pick next
          const avail = this.availableTechs(civ.id).filter((t) => !t.branch);
          this.currentTech[civ.id] = avail.length ? avail[this.rng.int(0, avail.length - 1)].id : null;
          this.techProgress[civ.id] = 0;
        }
      }
      // civics unlocks
      const civics = this.civicsUnlocked[civ.id];
      const totalCulture = y.culture + (civ.id === this.playerId ? 0 : 0);
      if (civics < CIVICS.length && this.accumulateCulture(civ.id, totalCulture)) {
        this.civicsUnlocked[civ.id]++;
        const c = CIVICS[this.civicsUnlocked[civ.id] - 1];
        if (civ.id === this.playerId) this.notify('採用市政', `${c.name}：${c.desc}`, 'good', 'i-culture');
      }
      // cities growth + production
      for (const city of civ.cities) {
        city.food += Math.max(0, y.food);
        const growth = 14 + city.population * 9;
        if (city.food >= growth) {
          city.food -= growth;
          city.population++;
          city.hp = Math.min(city.maxHp, city.hp + 20);
          city.level = clamp(1 + Math.floor(city.population / 3), 1, 4);
          this.adjustCityLabel(city);
          if (city.civId === this.playerId) this.notify('城市成長', `${city.name}現有 ${city.population} 名市民。`, 'good', 'i-pop');
        }
        // production
        if (city.producing) {
          city.produceProgress += Math.max(1, y.production + city.population);
          if (city.produceProgress >= city.producing.cost) this.completeProduction(city);
        } else if (civ.isAI) {
          const opts = this.productionOptions(city);
          const pickUnit = opts.find((o) => o.kind === 'unit' && !UNIT_TYPES[o.id].civilian);
          this.setProduction(city, pickUnit ? 'unit' : opts[0]?.kind ?? 'unit', pickUnit ? pickUnit.id : 'warrior');
        }
        // border growth
        city.culture += Math.max(0, y.culture) * 0.5;
        const expandAt = 16 + city.population * 5;
        if (city.culture >= expandAt) {
          city.culture = 0;
          this.expandBorders(city);
        }
      }
      // reset unit moves for next turn (player reset after AI? do now for player)
      this.tickGenerals(civ);
      this.strategicTick(civ);
      this.healUnits(civ);
    }
    this.climateTick();
    this.crisisTick();

    // AI turns
    for (const def of CIVS) {
      if (def.id === this.playerId) continue;
      const civ = world.civs.get(def.id);
      if (!civ.cities.length && !civ.units.length) continue;
      await this.runAI(civ);
    }
    this.tacticalHazards();
    this.updateSupply();

    // player new turn
    const player = world.civs.get(this.playerId);
    for (const unit of player.units) {
      const gen = this.generalForUnit(unit);
      let techMove = 0;
      for (const tech of TECHS) {
        if (!tech.move || !this.hasTech(player.id, tech.id)) continue;
        if (tech.id === 'ionDrives' && UNIT_TYPES[unit.type].domain !== 'air') continue;
        techMove += tech.move;
      }
      unit.moves = UNIT_TYPES[unit.type].moves + (gen?.bonuses?.move ?? 0) + techMove;
      unit.maxMoves = unit.moves;
      unit.fortified = false;
    }
    this.turn++;
    this.updateEra();
    this.recomputeVision();
    this.world.updateDimOverlay();
    this.world.rebuildTerritory();
    this.checkVictory();
    this.busy = false;
    this.emit('change');
    this.emit('turnEnd', { turn: this.turn });
  }

  accumulateCulture(civId, amount) {
    this.cultureBank = this.cultureBank || {};
    this.cultureBank[civId] = (this.cultureBank[civId] || 0) + amount;
    const next = CIVICS[this.civicsUnlocked[civId]];
    if (next && this.cultureBank[civId] >= next.at) {
      this.cultureBank[civId] -= next.at;
      return true;
    }
    return false;
  }

  expandBorders(city) {
    const world = this.world;
    const candidates = [];
    for (const [q, r] of hexesWithin(city.q, city.r, 4)) {
      const t = world.tiles.get(axialKey(q, r));
      if (!t || t.owner) continue;
      if (t.terrain === 'ocean') continue;
      candidates.push({ t, d: axialDistance(q, r, city.q, city.r) });
    }
    if (!candidates.length) return;
    candidates.sort((a, b) => a.d - b.d || this.tileScore(b.t) - this.tileScore(a.t));
    candidates[0].t.owner = city.civId;
    world.rebuildTerritory();
  }

  async runAI(civ) {
    const world = this.world;
    const player = world.civs.get(this.playerId);
    const targetCity = player.cities[0];
    const target = targetCity ? { q: targetCity.q, r: targetCity.r } : { q: 0, r: 0 };
    // move units
    for (const unit of [...civ.units]) {
      const def = UNIT_TYPES[unit.type];
      if (unit.type === 'settler') {
        if (this.aiFoundCity(civ, unit)) continue;
      }
      // attack adjacent enemy
      const adjacentTarget = world.tileList.find((t) => {
        if (axialDistance(t.q, t.r, unit.q, unit.r) > def.range) return false;
        if (t.q === unit.q && t.r === unit.r) return false;
        return (t.city && t.city.civId === this.playerId) || t.units.some((u) => u.civId === this.playerId);
      });
      if (adjacentTarget && !def.civilian) {
        await this.attack(unit, adjacentTarget);
        await this.pause(60);
        continue;
      }
      // move toward target
      let steps = unit.maxMoves;
      const neighbors = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]];
      while (steps > 0) {
        const options = neighbors
          .map(([dq, dr]) => world.tiles.get(axialKey(unit.q + dq, unit.r + dr)))
          .filter((t) => t && BIOMES[t.terrain].passable && !BIOMES[t.terrain].mountain)
          .filter((t) => !(t.city && t.city.civId !== unit.civId))
          .filter((t) => !t.units.some((u) => u.civId !== unit.civId))
          .filter((t) => !t.units.some((u) => u.civId === unit.civId && u !== unit));
        if (!options.length) break;
        const curDist = axialDistance(unit.q, unit.r, target.q, target.r);
        options.sort((a, b) => axialDistance(a.q, a.r, target.q, target.r) - axialDistance(b.q, b.r, target.q, target.r));
        const next = options[0];
        if (axialDistance(next.q, next.r, target.q, target.r) >= curDist && this.rng.chance(0.5)) {
          // wander
          const n2 = options[this.rng.int(0, Math.min(2, options.length - 1))];
          await world.moveUnitTo(unit, n2.q, n2.r, { instant: true });
          steps--;
          continue;
        }
        await world.moveUnitTo(unit, next.q, next.r, { instant: true });
        steps--;
        await this.pause(30);
        // attack after moving
        const atk = world.tileList.find((t) => axialDistance(t.q, t.r, unit.q, unit.r) <= def.range && !(t.q === unit.q && t.r === unit.r) &&
          ((t.city && t.city.civId === this.playerId) || t.units.some((u) => u.civId === this.playerId)));
        if (atk && !def.civilian) { await this.attack(unit, atk); break; }
      }
    }
    await this.pause(40);
  }

  aiFoundCity(civ, unit) {
    const world = this.world;
    const tile = world.tiles.get(axialKey(unit.q, unit.r));
    if (!BIOMES[tile.terrain].passable) return false;
    if (civ.cities.some((c) => axialDistance(c.q, c.r, tile.q, tile.r) < 4)) return false;
    if (this.playerCapital && axialDistance(this.playerCapital.q, this.playerCapital.r, tile.q, tile.r) < 2) return false;
    world.removeUnit(unit);
    civ.units = civ.units.filter((u) => u !== unit);
    const city = this.makeCity(civ, tile, false);
    world.rebuildTerritory();
    return true;
  }

  pause(ms) { return new Promise((r) => setTimeout(r, ms)); }

  updateEra() {
    let idx = this.eraFloor;
    for (let i = 0; i < ERAS.length; i++) if (this.turn >= ERAS[i].from) idx = i;
    idx = clamp(idx, this.eraFloor, this.maxEra);
    if (idx !== this.eraIndex) {
      this.eraIndex = idx;
      this.emit('newEra', ERAS[idx]);
    }
  }

  checkVictory() {
    const world = this.world;
    const player = world.civs.get(this.playerId);
    const rivals = CIVS.filter((c) => c.id !== this.playerId);
    const allCapitals = rivals.every((r) => {
      const civ = world.civs.get(r.id);
      return !civ.capital || civ.capital.civId === this.playerId;
    });
    if (allCapitals && rivals.length) {
      this.gameOver = true;
      this.emit('gameOver', { victory: 'domination', score: this.score() });
      return;
    }
    if (this.turn > this.turnLimit) {
      this.gameOver = true;
      this.emit('gameOver', { victory: 'time', score: this.score() });
    }
  }

  score() {
    const world = this.world;
    const player = world.civs.get(this.playerId);
    let score = 0;
    for (const c of player.cities) score += 12 + c.population * 4 + c.wonders.length * 15 + c.buildings.length * 3;
    score += this.techStateFor(this.playerId).size * 6;
    score += world.tileList.filter((t) => t.owner === this.playerId).length * 1.5;
    score += this.stocks[this.playerId].gold * 0.1;
    score += this.ownedGenerals(this.playerId).length * 25;
    score += this.climate.events * -4;
    score += this.blackUnlocks[this.playerId]?.size * 40;
    if (this.doctrines[this.playerId]) score += 30;
    return Math.round(score);
  }

  /* ============================ OBJECTIVES ============================ */
  initObjectives() {
    this.objectives = [
      { id: 'city2', text: '建立第二座城市', done: false },
      { id: 'tech3', text: '發現 3 項科技', done: false },
      { id: 'meet', text: '會見所有對手領袖', done: false },
      { id: 'wonder', text: '建造一座世界奇觀', done: false },
      { id: 'pop5', text: '將首都成長至 5 名市民', done: false },
      { id: 'army', text: '訓練 4 個軍事單位', done: false },
    ];
  }

  refreshObjectives() {
    const world = this.world;
    const player = world.civs.get(this.playerId);
    const set = (id, done) => {
      const o = this.objectives.find((x) => x.id === id);
      if (o && o.done !== done) {
        o.done = done;
        if (done) this.emit('objectiveDone', o);
      }
    };
    set('city2', player.cities.length >= 2);
    set('tech3', this.techStateFor(this.playerId).size >= 3);
    set('meet', CIVS.filter((c) => c.id !== this.playerId).every((c) => this.met.has(c.id)));
    set('wonder', this.wondersBuilt.size > 0 && player.cities.some((c) => c.wonders.length > 0));
    set('pop5', (this.playerCapital?.population ?? 0) >= 5);
    set('army', player.units.filter((u) => !UNIT_TYPES[u.type].civilian).length >= 4);
  }

  notify(title, body, kind = 'info', icon = 'i-research') {
    this.emit('notify', { title, body, kind, icon });
  }

  leaderRelations(civ) {
    if (!this.met.has(civ.id)) return { label: '未知', cls: 'meeting' };
    if (civ.atWar) return { label: '交戰中', cls: 'war' };
    return { label: '和平', cls: 'peace' };
  }

  /* ============================ SELECTION ============================ */
  select(type, ref) {
    this.selected = type ? { type, ref } : null;
    this.emit('selection', this.selected);
  }
}

export { ERAS, TURN_LIMIT };
