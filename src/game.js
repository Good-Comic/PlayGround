import { clamp, RNG, axialKey, axialDistance, hexesWithin, axialRing, HEX_DIRS } from './core.js';
import { BIOMES, FEATURES, RESOURCES, updateHealthBar } from './world.js';

export const CIVS = [
  {
    id: 'aurelia', name: 'AURELIA', leader: 'Empress Aurelia', title: 'Sovereign of the Dawn',
    color: 0xe3bd74, accent: 0x2f4a63, border: 0xffe1a2, colorHex: '#e3bd74',
    glyph: 'sun', traitName: 'Laws of the Dawn', trait: '+1 Culture and +1 Gold in the Capital.',
    personality: 'visionary', greeting: 'The dawn breaks on a new age. Walk with me.',
  },
  {
    id: 'kemet', name: 'KEMET', leader: 'Pharaoh Neferu', title: 'Ruler of the Two Lands',
    color: 0x49b3a5, accent: 0x18494b, border: 0x9df2e2, colorHex: '#49b3a5',
    glyph: 'ankh', traitName: 'Gift of the River', trait: '+1 Food from River tiles. Starts beside water.',
    personality: 'builder', greeting: 'The river remembers all. So shall we.',
  },
  {
    id: 'norlund', name: 'NORLUND', leader: 'High King Bjorn', title: 'Breaker of Chains',
    color: 0xc4584c, accent: 0x4a1f1d, border: 0xff9182, colorHex: '#c4584c',
    glyph: 'raven', traitName: 'Tide of Iron', trait: '+20% attack strength against cities.',
    personality: 'warlord', greeting: 'Speak quickly, southerner. My axes grow thirsty.',
  },
  {
    id: 'xian', name: 'XIAN', leader: 'Empress Wu Zetian', title: 'Daughter of Heaven',
    color: 0x74c27a, accent: 0x204a2c, border: 0xaef0a6, colorHex: '#74c27a',
    glyph: 'dragon', traitName: 'Celestial Mandate', trait: '+1 Science and +1 Production in the Capital.',
    personality: 'scholar', greeting: 'Heaven has granted you an audience. Do not waste it.',
  },
];

export const UNIT_TYPES = {
  settler:  { name: 'Settler',  cls: 'civilian', str: 0, moves: 2, range: 1, sight: 2, cost: 80, civilian: true, found: true, icon: 'i-settle', blurb: 'Founds a new city on a passable tile.' },
  builder:  { name: 'Builder',  cls: 'civilian', str: 0, moves: 2, range: 1, sight: 2, cost: 50, civilian: true, build: true, icon: 'i-production', blurb: 'Constructs farms and mines to improve tiles.' },
  scout:    { name: 'Scout',    cls: 'recon',    str: 12, moves: 3, range: 1, sight: 3, cost: 30, icon: 'i-move', blurb: 'Fast explorer with extended sight.' },
  warrior:  { name: 'Warrior',  cls: 'melee',    str: 20, moves: 2, range: 1, sight: 2, cost: 40, icon: 'i-strength', blurb: 'Reliable melee infantry of the early age.' },
  archer:   { name: 'Archer',   cls: 'ranged',   str: 15, rangedStr: 28, moves: 2, range: 2, sight: 2, cost: 60, tech: 'archery', icon: 'i-attack', blurb: 'Strikes from a distance without reprisal.' },
  spearman: { name: 'Spearman', cls: 'melee',    str: 26, moves: 2, range: 1, sight: 2, cost: 55, tech: 'bronzeWorking', antiCav: true, icon: 'i-strength', blurb: 'Braced formation, deadly against cavalry.' },
  horseman: { name: 'Horseman', cls: 'cavalry',  str: 36, moves: 4, range: 1, sight: 3, cost: 90, tech: 'horseback', icon: 'i-attack', blurb: 'Swift raider of the open plains.' },
  swordsman:{ name: 'Swordsman',cls: 'melee',    str: 36, moves: 2, range: 1, sight: 2, cost: 95, tech: 'ironWorking', icon: 'i-strength', blurb: 'Disciplined heavy infantry.' },
  catapult: { name: 'Catapult', cls: 'siege',    str: 20, rangedStr: 36, moves: 2, range: 2, sight: 2, cost: 120, tech: 'engineering', icon: 'i-attack', blurb: 'Shatters walls and cities from afar.' },
  knight:   { name: 'Knight',   cls: 'cavalry',  str: 48, moves: 4, range: 1, sight: 3, cost: 150, tech: 'stirrups', icon: 'i-attack', blurb: 'Armoured lancer, terror of the age.' },
};

export const BUILDINGS = {
  monument:      { name: 'Monument',       cost: 60,  icon: 'i-wonder',     yields: { culture: 2 }, blurb: '+2 Culture in this city.' },
  granary:       { name: 'Granary',        cost: 65,  icon: 'i-food',       yields: { food: 1 }, blurb: '+1 Food in this city.' },
  shrine:        { name: 'Shrine',         cost: 65,  icon: 'i-faith',      yields: { faith: 1 }, blurb: '+1 Faith in this city.' },
  library:       { name: 'Library',        cost: 80,  reqTech: 'writing',     icon: 'i-research', yields: { science: 2 }, blurb: '+2 Science in this city.' },
  barracks:      { name: 'Barracks',       cost: 75,  reqTech: 'bronzeWorking', icon: 'i-strength', defense: 4, blurb: '+4 city defence. Trains veterans.' },
  walls:         { name: 'City Walls',     cost: 90,  reqTech: 'masonry',     icon: 'i-defense',  defense: 8, blurb: '+8 city defence and ranged strike.' },
  market:        { name: 'Market',         cost: 95,  reqTech: 'currency',    icon: 'i-gold',     yields: { gold: 2 }, blurb: '+2 Gold in this city.' },
  harbor:        { name: 'Harbor',         cost: 120, reqTech: 'sailing',     icon: 'i-influence', yields: { gold: 2, food: 1 }, blurb: '+2 Gold, +1 Food. Rework coast tiles.' },
  temple:        { name: 'Temple',         cost: 120, reqTech: 'philosophy',  icon: 'i-faith',    yields: { faith: 2, culture: 1 }, blurb: '+2 Faith, +1 Culture.' },
  amphitheater:  { name: 'Amphitheater',   cost: 130, reqTech: 'philosophy',  icon: 'i-culture',  yields: { culture: 3 }, blurb: '+3 Culture in this city.' },
  workshop:      { name: 'Workshop',       cost: 140, reqTech: 'machinery',   icon: 'i-production', yields: { production: 2 }, blurb: '+2 Production in this city.' },
  aqueduct:      { name: 'Aqueduct',       cost: 150, reqTech: 'engineering', icon: 'i-food',     yields: { food: 2 }, blurb: '+2 Food in this city.' },
  university:    { name: 'University',     cost: 190, reqTech: 'philosophy',  icon: 'i-research', yields: { science: 4 }, blurb: '+4 Science in this city.' },
  bank:          { name: 'Bank',           cost: 200, reqTech: 'economics',   icon: 'i-gold',     yields: { gold: 4 }, blurb: '+4 Gold in this city.' },
  armory:        { name: 'Armory',         cost: 180, reqTech: 'militaryScience', icon: 'i-defense', defense: 10, blurb: '+10 city defence.' },
};

export const WONDERS = {
  stonehenge:    { name: 'Stonehenge',        cost: 170, icon: 'i-wonder', reqTech: 'masonry',   yields: { faith: 3 }, blurb: 'Ancient circle: +3 Faith empire-wide.' },
  pyramids:      { name: 'The Pyramids',      cost: 220, icon: 'i-wonder', reqTech: 'masonry',   yields: { culture: 2, production: 1 }, blurb: '+2 Culture, +1 Production empire-wide.' },
  greatLibrary:  { name: 'Great Library',     cost: 230, icon: 'i-research', reqTech: 'writing', yields: { science: 4 }, blurb: '+4 Science empire-wide. Instant tech boost.' },
  hangingGardens:{ name: 'Hanging Gardens',   cost: 210, icon: 'i-food',   reqTech: 'currency',  yields: { food: 3 }, blurb: '+3 Food in this city. Grows swiftly.' },
  colosseum:     { name: 'Grand Colosseum',   cost: 240, icon: 'i-culture', reqTech: 'philosophy', yields: { culture: 3 }, blurb: '+3 Culture empire-wide, +2 population.' },
  lighthouse:    { name: 'Great Lighthouse',  cost: 200, icon: 'i-influence', reqTech: 'sailing', yields: { gold: 3 }, blurb: '+3 Gold empire-wide. Navy moves faster.' },
};

export const TECHS = [
  { id: 'pottery',        name: 'Pottery',         era: 'Antiquity', cost: 30,  prereq: [],                          bonus: '+1 Food in cities with fresh water.', yields: { food: 1 }, icon: 'i-food' },
  { id: 'animalHusbandry',name: 'Animal Husbandry',era: 'Antiquity', cost: 35,  prereq: [],                          bonus: 'Reveals Horses. Pastures improve tiles.', icon: 'i-food' },
  { id: 'mining',         name: 'Mining',          era: 'Antiquity', cost: 30,  prereq: [],                          bonus: 'Builders may construct Mines (+Production).', icon: 'i-production' },
  { id: 'archery',        name: 'Archery',         era: 'Antiquity', cost: 55,  prereq: ['animalHusbandry'],         bonus: 'Unlocks the Archer, master of early ranged war.', icon: 'i-attack', unlockUnit: 'archer' },
  { id: 'sailing',        name: 'Sailing',         era: 'Antiquity', cost: 55,  prereq: ['pottery'],                 bonus: 'Unlocks the Harbor and coastal trade.', icon: 'i-influence' },
  { id: 'writing',        name: 'Writing',         era: 'Antiquity', cost: 60,  prereq: ['pottery'],                 bonus: 'Unlocks the Library and the Great Library.', icon: 'i-research' },
  { id: 'bronzeWorking',  name: 'Bronze Working',  era: 'Antiquity', cost: 80,  prereq: ['mining'],                  bonus: 'Unlocks Spearmen and the Barracks.', icon: 'i-strength', unlockUnit: 'spearman' },
  { id: 'masonry',        name: 'Masonry',         era: 'Antiquity', cost: 80,  prereq: ['mining'],                  bonus: 'Unlocks Walls and the ancient Wonders.', icon: 'i-defense' },
  { id: 'horseback',      name: 'Horseback Riding',era: 'Antiquity', cost: 85,  prereq: ['animalHusbandry'],         bonus: 'Unlocks the Horseman and faster expansion.', icon: 'i-move', unlockUnit: 'horseman' },
  { id: 'currency',       name: 'Currency',        era: 'Antiquity', cost: 120, prereq: ['writing', 'mining'],       bonus: 'Unlocks the Market and the Hanging Gardens.', icon: 'i-gold' },
  { id: 'ironWorking',    name: 'Iron Working',    era: 'Antiquity', cost: 130, prereq: ['bronzeWorking'],           bonus: 'Unlocks the Swordsman and Iron mines.', icon: 'i-strength', unlockUnit: 'swordsman' },
  { id: 'mathematics',    name: 'Mathematics',     era: 'Exploration', cost: 170, prereq: ['currency'],              bonus: '+2 Science. Foundations of engineering.', icon: 'i-research', yields: { science: 2 } },
  { id: 'philosophy',     name: 'Philosophy',      era: 'Exploration', cost: 180, prereq: ['writing', 'currency'],   bonus: 'Unlocks Temples, Amphitheaters and Universities.', icon: 'i-culture' },
  { id: 'engineering',    name: 'Engineering',     era: 'Exploration', cost: 220, prereq: ['masonry', 'mathematics'],bonus: 'Unlocks the Catapult and Aqueduct.', icon: 'i-wonder', unlockUnit: 'catapult' },
  { id: 'apprenticeship', name: 'Apprenticeship',  era: 'Exploration', cost: 210, prereq: ['currency'],              bonus: '+1 Production in every city.', icon: 'i-production', yields: { production: 1 } },
  { id: 'machinery',      name: 'Machinery',       era: 'Exploration', cost: 240, prereq: ['ironWorking', 'engineering'], bonus: 'Unlocks Workshops and crossbows.', icon: 'i-production' },
  { id: 'feudalism',      name: 'Feudalism',       era: 'Exploration', cost: 260, prereq: ['apprenticeship'],        bonus: '+1 Food and +1 Production. Stronger levies.', icon: 'i-defense', yields: { food: 1, production: 1 } },
  { id: 'navigation',     name: 'Navigation',      era: 'Exploration', cost: 230, prereq: ['sailing', 'mathematics'],bonus: 'Ocean travel. Harbors earn +1 Gold.', icon: 'i-influence', yields: { gold: 2 } },
  { id: 'stirrups',       name: 'Stirrups',        era: 'Modern',      cost: 320, prereq: ['horseback', 'feudalism'],bonus: 'Unlocks the Knight, lord of battle.', icon: 'i-attack', unlockUnit: 'knight' },
  { id: 'gunpowder',      name: 'Gunpowder',       era: 'Modern',      cost: 360, prereq: ['ironWorking', 'stirrups'],bonus: '+3 Combat Strength for all melee units.', icon: 'i-strength' },
  { id: 'printing',       name: 'Printing',        era: 'Modern',      cost: 330, prereq: ['philosophy'],            bonus: '+3 Science and widespread literacy.', icon: 'i-research', yields: { science: 3 } },
  { id: 'economics',      name: 'Economics',       era: 'Modern',      cost: 350, prereq: ['apprenticeship'],        bonus: 'Unlocks the Bank. +2 Gold empire-wide.', icon: 'i-gold', yields: { gold: 2 } },
  { id: 'militaryScience',name: 'Military Science',era: 'Modern',      cost: 380, prereq: ['gunpowder'],             bonus: 'Unlocks the Armory and professional armies.', icon: 'i-defense' },
  { id: 'astronomy',      name: 'Astronomy',       era: 'Modern',      cost: 340, prereq: ['navigation', 'printing'], bonus: '+3 Science. The heavens mapped.', icon: 'i-research', yields: { science: 3 } },
];

export const CIVICS = [
  { name: 'Code of Laws',       at: 25,  desc: '+1 Influence per turn. Governance begins.' },
  { name: 'Craftsmanship',      at: 60,  desc: 'Builders gain +1 charge.' },
  { name: 'Early Empire',       at: 110, desc: '+1 Culture per turn, faster border growth.' },
  { name: 'Political Philosophy',at: 180, desc: '+2 Science and +1 Culture per turn.' },
  { name: 'Drama & Poetry',     at: 260, desc: '+3 Culture per turn. Great works flourish.' },
  { name: 'Humanism',           at: 360, desc: '+4 Science per turn. A golden age of reason.' },
  { name: 'Enlightenment',      at: 480, desc: '+2 to all yields per turn. An age of genius.' },
];

const ERAS = [
  { name: 'Antiquity',   from: 1 },
  { name: 'Exploration', from: 14 },
  { name: 'Modern',      from: 28 },
  { name: 'Future',      from: 44 },
];

const TURN_LIMIT = 50;

export class Game {
  constructor(world) {
    this.world = world;
    this.listeners = new Map();
    this.turn = 1;
    this.eraIndex = 0;
    this.playerId = 'aurelia';
    this.rng = new RNG(world.seed + 2024);
    this.selected = null; // {type:'unit'|'city', ref}
    this.hoverTile = null;
    this.stocks = {};
    this.perTurn = {};
    this.techProgress = {};
    this.currentTech = {};
    this.civicsUnlocked = {};
    this.met = new Set();
    this.wondersBuilt = new Set();
    this.objectives = [];
    this.log = [];
    this.gameOver = false;
    this.busy = false;
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
    this.currentTech[this.playerId] = 'pottery';
    // give AI a random starter tech to research
    for (const civ of CIVS) {
      if (civ.id === this.playerId) continue;
      const avail = TECHS.filter((t) => !t.prereq.length);
      this.currentTech[civ.id] = this.rng.pick(avail).id;
    }

    this.placeCivs();
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
      aurelia: ['Aurelia', 'Lumen', 'Solaris', 'Vespera', 'Corona', 'Aurora', 'Portus', 'Nova'],
      kemet: ['Waset', 'Memphis', 'Iunu', 'Abedju', 'Nubt', 'Perwadjyt', 'Sais', 'Edfu'],
      norlund: ['Skjoldr', 'Uppsala', 'Fyris', 'Gotaland', 'Nidaros', 'Birka', 'Ravne', 'Ymir'],
      xian: ['Chang\'an', 'Luoyang', 'Jiankang', 'Lin\'an', 'Ying', 'Handan', 'Qufu', 'Chengdu'],
    };
    const names = baseNames[civ.id] ?? ['City'];
    const index = civ.cities.length;
    const city = {
      civId: civ.id, civ,
      q: tile.q, r: tile.r, name: names[index % names.length],
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
      phase: this.rng.float(0, Math.PI * 2),
      facing: this.rng.float(-Math.PI, Math.PI),
    };
    civ.units.push(unit);
    world.addUnit(unit);
    return unit;
  }

  /* ============================ VISION ============================ */
  recomputeVision() {
    const world = this.world;
    for (const tile of world.tileList) tile.visible = false;
    const player = world.civs.get(this.playerId);
    const reveal = (tile, radius) => {
      for (const [q, r] of hexesWithin(tile.q, tile.r, radius)) {
        const t = world.tiles.get(axialKey(q, r));
        if (t) t.visible = true;
      }
    };
    for (const unit of player.units) {
      const sight = UNIT_TYPES[unit.type].sight ?? 2;
      reveal(unit.tile, sight);
    }
    for (const city of player.cities) reveal(city.tile, 3);
    for (const tile of world.tileList) if (tile.visible) tile.explored = true;
    // meeting rivals
    for (const def of CIVS) {
      if (def.id === this.playerId || this.met.has(def.id)) continue;
      const civ = world.civs.get(def.id);
      const near = civ.cities.some((c) => this.isTileExplored(c.q, c.r) && this.tilesNearPlayer(c, 3))
        || civ.units.some((u) => this.tilesNearPlayer(u, 3));
      if (near) {
        this.met.add(def.id);
        this.emit('meet', civ);
      }
    }
    world.refreshFog();
    world.updateDimOverlay();
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
      }
    }
    // tech passive
    for (const t of TECHS) {
      if (this.hasTech(civId, t.id) && t.yields) for (const k in t.yields) total[k] += t.yields[k];
    }
    // civics
    const civics = CIVICS.filter((c, i) => i < this.civicsUnlocked[civId]);
    for (const c of civics) {
      if (c.name === 'Code of Laws') total.influence += 1;
      if (c.name === 'Early Empire') total.culture += 1;
      if (c.name === 'Political Philosophy') { total.science += 2; total.culture += 1; }
      if (c.name === 'Drama & Poetry') total.culture += 3;
      if (c.name === 'Humanism') total.science += 4;
      if (c.name === 'Enlightenment') { total.science += 2; total.culture += 2; total.gold += 2; total.faith += 2; }
    }
    // food consumption
    total.food -= pop;
    total.influence += 1;
    return total;
  }

  tileScore(tile) {
    const y = this.tileYields(tile, tile.owner);
    return (y.food * 2 + y.production * 1.6 + y.gold + y.science * 1.4 + y.culture * 1.4 + y.faith);
  }

  /* ============================ MOVEMENT ============================ */
  moveCost(tile, unitType) {
    const bt = BIOMES[tile.terrain];
    if (bt.mountain) return Infinity;
    if (bt.water) return Infinity;
    let cost = 1;
    if (tile.feature && FEATURES[tile.feature]?.move) cost = FEATURES[tile.feature].move;
    if (tile.terrain === 'hills') cost = 2;
    if (tile.river) cost += 0.5;
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
    // attacks: adjacent enemy units/cities within range
    const attacks = [];
    if (!def.civilian && unit.moves > 0) {
      for (const [q, r] of hexesWithin(unit.q, unit.r, def.range)) {
        if (q === unit.q && r === unit.r) continue;
        const t = world.tiles.get(axialKey(q, r));
        if (!t) continue;
        const enemyUnit = t.units.find((u) => u.civId !== unit.civId);
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
    if (near) { this.notify('Cannot settle', 'Too close to another city.', 'warn'); return false; }
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
    if (tile.improvement) { this.notify('Already improved', 'This tile has an improvement.', 'warn'); return false; }
    const def = UNIT_TYPES[unit.type];
    tile.improvement = tile.terrain === 'hills' ? 'mine' : 'farm';
    unit.moves = 0;
    this.emit('notify', { title: 'Tile improved', body: `${def.name} built a ${tile.improvement === 'mine' ? 'mine' : 'farm'}.`, kind: 'good', icon: 'i-production' });
    this.emit('change');
    return true;
  }

  fortify(unit) {
    unit.fortified = !unit.fortified;
    unit.moves = 0;
    this.emit('change');
  }
  sleep(unit) { unit.asleep = true; this.emit('change'); }

  async attack(unit, targetTile) {
    const world = this.world;
    const def = UNIT_TYPES[unit.type];
    const enemyUnit = targetTile.units.find((u) => u.civId !== unit.civId);
    const enemyCity = targetTile.city && targetTile.city.civId !== unit.civId ? targetTile.city : null;
    const attackerCiv = world.civs.get(unit.civId);
    const atkStr = (def.rangedStr ?? def.str) * (1 + unit.level * 0.08) + (unit.fortified ? 0 : 0);
    this.emit('combatFlash');
    if (enemyCity) {
      const defStr = enemyCity.defense + enemyCity.hp * 0.05;
      const bonus = unit.civId === 'norlund' ? 1.2 : 1;
      const dmg = clamp((atkStr * bonus - defStr * 0.5) * this.rng.float(0.85, 1.15) + 10, 6, 60);
      enemyCity.hp = Math.max(0, enemyCity.hp - dmg);
      enemyCity.defense = Math.max(0, enemyCity.defense - 1);
      const retaliate = def.range <= 1 ? clamp(defStr * 0.35, 4, 26) : 0;
      unit.hp -= retaliate;
      this.emit('notify', { title: `${enemyCity.name} besieged`, body: `${Math.round(dmg)} damage dealt${retaliate ? `, ${Math.round(retaliate)} taken` : ''}.`, kind: 'war', icon: 'i-attack' });
      if (enemyCity.hp <= 0) await this.captureCity(enemyCity, attackerCiv);
    } else if (enemyUnit) {
      const eDef = UNIT_TYPES[enemyUnit.type];
      let defStr = eDef.str * (1 + enemyUnit.level * 0.08) * (1 + (enemyUnit.fortified ? 0.25 : 0));
      if (eDef.antiCav && def.cls === 'cavalry') defStr *= 1.5;
      const dmg = clamp((atkStr - defStr * 0.55) * this.rng.float(0.85, 1.15) + 22, 8, 75);
      enemyUnit.hp = Math.max(0, enemyUnit.hp - dmg);
      const retaliate = def.range <= 1 ? clamp(defStr * 0.42 - atkStr * 0.08, 4, 32) : 0;
      unit.hp -= retaliate;
      unit.xp += 2;
      this.emit('combat', { unit, enemyUnit, dmg, retaliate });
      if (enemyUnit.hp <= 0) {
        world.removeUnit(enemyUnit);
        const eCiv = world.civs.get(enemyUnit.civId);
        eCiv.units = eCiv.units.filter((u) => u !== enemyUnit);
        unit.xp += 5;
        this.emit('notify', { title: 'Unit destroyed', body: `A ${eDef.name} has fallen to our arms.`, kind: 'good', icon: 'i-kills' });
      }
    }
    unit.moves = Math.max(0, unit.moves - 1);
    updateHealthBar(unit);
    if (enemyUnit) updateHealthBar(enemyUnit);
    if (unit.hp <= 0) {
      world.removeUnit(unit);
      const civ = world.civs.get(unit.civId);
      civ.units = civ.units.filter((u) => u !== unit);
      this.emit('notify', { title: 'Unit lost', body: `Our ${def.name} has perished in battle.`, kind: 'war', icon: 'i-kills' });
    }
    this.recomputeVision();
    this.emit('change');
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
    this.emit('notify', { title: 'Civilization eclipsed', body: `${civ.name} has been erased from history.`, kind: 'war', icon: 'i-kills' });
  }

  /* ============================ PRODUCTION / TECH ============================ */
  productionOptions(city) {
    const civId = city.civId;
    const opts = [];
    for (const [id, def] of Object.entries(UNIT_TYPES)) {
      if (def.tech && !this.hasTech(civId, def.tech)) continue;
      if (id === 'settler' && city.population < 2) continue;
      opts.push({ kind: 'unit', id, name: def.name, cost: def.cost, icon: def.icon, blurb: def.blurb, turns: this.estimateTurns(city, def.cost) });
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

  completeProduction(city) {
    const world = this.world;
    const p = city.producing;
    if (!p) return;
    const civ = world.civs.get(city.civId);
    if (p.kind === 'unit') {
      const tile = world.tiles.get(axialKey(city.q, city.r));
      const spot = world.tileList.find((t) => BIOMES[t.terrain].passable && axialDistance(t.q, t.r, city.q, city.r) <= 1 && !t.city && t.units.length === 0)
        ?? tile;
      const unit = this.spawnUnit(civ, p.id, spot.q, spot.r);
      if (city.civId === this.playerId) this.emit('unitBuilt', unit);
    } else if (p.kind === 'building') {
      city.buildings.push(p.id);
      if (p.id === 'walls') city.defense += 8;
      if (p.id === 'barracks') city.defense += 4;
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

  availableTechs(civId) {
    const acquired = this.techStateFor(civId);
    return TECHS.filter((t) => !acquired.has(t.id) && t.prereq.every((p) => acquired.has(p)));
  }

  setResearch(civId, techId) {
    this.acquired = this.acquired || {};
    const acquired = this.techStateFor(civId);
    const tech = TECHS.find((t) => t.id === techId);
    if (!tech || acquired.has(techId)) return false;
    if (!tech.prereq.every((p) => acquired.has(p))) return false;
    this.currentTech[civId] = techId;
    this.techProgress[civId] = 0;
    this.emit('change');
    return true;
  }

  researchTurns(civId) {
    const y = this.civYields(civId);
    const tech = TECHS.find((t) => t.id === this.currentTech[civId]);
    if (!tech) return '—';
    const remaining = tech.cost - (this.techProgress[civId] || 0);
    return Math.max(1, Math.ceil(remaining / Math.max(1, y.science)));
  }

  finishTech(civId, tech) {
    const acquired = this.techStateFor(civId);
    acquired.add(tech.id);
    if (tech.unlockUnit) { /* unlocked via hasTech check */ }
    if (tech.id === 'greatLibrary') { }
    this.emit('techComplete', { civId, tech });
  }

  /* ============================ TURN ============================ */
  async endTurn() {
    if (this.busy || this.gameOver) return;
    this.busy = true;
    this.emit('turnStart', { turn: this.turn });
    const world = this.world;
    // process all civs' economy
    for (const civ of world.civs.values()) {
      const y = this.civYields(civ.id);
      const stock = this.stocks[civ.id];
      stock.gold += y.gold;
      stock.faith += y.faith;
      stock.influence += y.influence;
      // research
      const tech = TECHS.find((t) => t.id === this.currentTech[civ.id]);
      if (tech) {
        this.techProgress[civ.id] = (this.techProgress[civ.id] || 0) + y.science;
        if (this.techProgress[civ.id] >= tech.cost) {
          this.finishTech(civ.id, tech);
          this.emit('techComplete', { civId: civ.id, tech });
          if (civ.id === this.playerId) this.notify('Research complete', `${tech.name}: ${tech.bonus}`, 'good', 'i-research');
          // pick next
          const avail = this.availableTechs(civ.id);
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
        if (civ.id === this.playerId) this.notify('Civic adopted', `${c.name}: ${c.desc}`, 'good', 'i-culture');
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
          if (city.civId === this.playerId) this.notify('City grew', `${city.name} now has ${city.population} citizens.`, 'good', 'i-pop');
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
    }

    // AI turns
    for (const def of CIVS) {
      if (def.id === this.playerId) continue;
      const civ = world.civs.get(def.id);
      if (!civ.cities.length && !civ.units.length) continue;
      await this.runAI(civ);
    }

    // player new turn
    const player = world.civs.get(this.playerId);
    for (const unit of player.units) {
      unit.moves = UNIT_TYPES[unit.type].moves;
      unit.fortified = unit.fortified && false;
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
    let idx = 0;
    for (let i = 0; i < ERAS.length; i++) if (this.turn >= ERAS[i].from) idx = i;
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
    if (this.turn > TURN_LIMIT) {
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
    return Math.round(score);
  }

  /* ============================ OBJECTIVES ============================ */
  initObjectives() {
    this.objectives = [
      { id: 'city2', text: 'Found a second city', done: false },
      { id: 'tech3', text: 'Discover 3 technologies', done: false },
      { id: 'meet', text: 'Meet all rival leaders', done: false },
      { id: 'wonder', text: 'Commission a World Wonder', done: false },
      { id: 'pop5', text: 'Grow your capital to 5 citizens', done: false },
      { id: 'army', text: 'Train 4 military units', done: false },
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
    if (!this.met.has(civ.id)) return { label: 'Unknown', cls: 'meeting' };
    if (civ.atWar) return { label: 'At War', cls: 'war' };
    return { label: 'Peace', cls: 'peace' };
  }

  /* ============================ SELECTION ============================ */
  select(type, ref) {
    this.selected = type ? { type, ref } : null;
    this.emit('selection', this.selected);
  }
}
