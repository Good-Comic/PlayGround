export const RESOURCES = ['food', 'wood', 'gold', 'stone'];

export const CIVILIZATIONS = [
  {
    id: 'MNG', name: 'Mongols', epithet: 'Steppe Riders', accent: '#8e6b3a',
    trait: 'Cavalry march 10% faster; farms yield 20% more; raids yield food.',
    bonuses: { cavalrySpeedMul: 1.1, farmMul: 1.2, killFoodRate: 0.12, killFoodCap: 180 },
  },
  {
    id: 'TEU', name: 'Teutons', epithet: 'Iron Covenant', accent: '#56616a',
    trait: 'Buildings gain 12% health; villagers gain 15 health; towers reach farther.',
    bonuses: { buildingHpMul: 1.12, villagerHpBonus: 15, towerRange: 1 },
  },
  {
    id: 'GOT', name: 'Goths', epithet: 'Endless Levy', accent: '#4d5d3e',
    trait: 'Infantry cost half a population and train faster, but are more fragile.',
    bonuses: { infantryPopMul: 0.5, infantryHpMul: 0.88, trainSpeedMul: 1.12 },
  },
  {
    id: 'FRK', name: 'Franks', epithet: 'Knightly Blood', accent: '#3d5670',
    trait: 'Cavalry gain 20% health and 10% damage.',
    bonuses: { cavalryHpMul: 1.2, cavalryDamageMul: 1.1 },
  },
  {
    id: 'SAR', name: 'Saracens', epithet: 'Desert Ledger', accent: '#8d6a2c',
    trait: 'Gold gathering is 12% faster and ranged soldiers strike 8% faster.',
    bonuses: { goldMul: 1.12, rangedAttackSpeedMul: 1.08 },
  },
  {
    id: 'AZT', name: 'Aztecs', epithet: 'Obsidian Oath', accent: '#6d5a35',
    trait: 'Infantry deal 12% more damage and cost 10% less food.',
    bonuses: { infantryDamageMul: 1.12, infantryCostMul: 0.9 },
  },
  {
    id: 'BRI', name: 'Britons', epithet: 'Longbow Doctrine', accent: '#4a6140',
    trait: 'Archers gain one tile of range and 10% damage; cavalry is frailer.',
    bonuses: { archerRange: 1, archerDamageMul: 1.1, cavalryHpMul: 0.9 },
  },
  {
    id: 'CHN', name: 'Chinese', epithet: 'Repeating Crossbows', accent: '#7b4433',
    trait: 'Every third ranged attack looses an extra bolt; ranged attack 10% faster.',
    bonuses: { extraArrowEvery: 3, rangedAttackSpeedMul: 1.1 },
  },
  {
    id: 'PER', name: 'Persians', epithet: 'War Elephants', accent: '#765a2c',
    trait: 'War elephants are unlocked and cost 15% less.',
    bonuses: { elephantUnlocked: true, elephantCostMul: 0.85 },
  },
  {
    id: 'KOR', name: 'Koreans', epithet: 'Stone Watch', accent: '#4d5b58',
    trait: 'Towers gain two tiles of range and 15% damage.',
    bonuses: { towerRange: 2, towerDamageMul: 1.15 },
  },
  {
    id: 'SPA', name: 'Spanish', epithet: 'Tercio', accent: '#8b4b2b',
    trait: 'Villagers gain 30 health and 3 attack, and can defend themselves.',
    bonuses: { villagerHpBonus: 30, villagerAttackBonus: 3 },
  },
  {
    id: 'TUR', name: 'Turks', epithet: 'Powder Legacy', accent: '#596633',
    trait: 'Ranged soldiers deal 20% more damage.',
    bonuses: { archerDamageMul: 1.2 },
  },
  {
    id: 'BYZ', name: 'Byzantines', epithet: 'Theodosian Walls', accent: '#5c4b74',
    trait: 'Buildings gain 25% health and are raised 8% faster.',
    bonuses: { buildingHpMul: 1.25, buildSpeedMul: 1.08 },
  },
  {
    id: 'VIK', name: 'Vikings', epithet: 'Sea Wolves', accent: '#3e5f63',
    trait: 'Infantry slowly regenerate; food gathering is 10% faster.',
    bonuses: { unitRegen: 0.008, foodMul: 1.1 },
  },
  {
    id: 'MAG', name: 'Magyars', epithet: 'Raider Archers', accent: '#6f4c34',
    trait: 'Cavalry cost 15% less; ranged soldiers deal 5% more damage.',
    bonuses: { cavalryCostMul: 0.85, archerDamageMul: 1.05 },
  },
  {
    id: 'JPN', name: 'Japanese', epithet: 'Blade Discipline', accent: '#793d3d',
    trait: 'Infantry attack 15% faster; towers gain one tile of range.',
    bonuses: { infantryAttackSpeedMul: 1.15, towerRange: 1 },
  },
];

export const BIOMES = [
  {
    id: 'steppe', name: 'Golden Steppe', trait: 'Open ground · cavalry +8% speed · sparse woods',
    palette: 'steppe', mods: { cavalrySpeedMul: 1.08, woodMul: 0.95 },
  },
  {
    id: 'blackforest', name: 'Black Forest', trait: 'Dense woods · wood +15% · tight sightlines',
    palette: 'blackforest', mods: { woodMul: 1.15, woodYield: 1.05 },
  },
  {
    id: 'dunes', name: 'Amber Dunes', trait: 'Gold-rich sand · gold +15% · few trees',
    palette: 'dunes', mods: { goldMul: 1.15, woodMul: 0.9 },
  },
  {
    id: 'riverlands', name: 'Riverlands', trait: 'Fertile banks · food +12% · farms +10%',
    palette: 'riverlands', mods: { foodMul: 1.12, farmMul: 1.1 },
  },
  {
    id: 'highlands', name: 'Highlands', trait: 'Thin air · archer range +0.6 · stone +8%',
    palette: 'highlands', mods: { archerRange: 0.6, stoneMul: 1.08 },
  },
  {
    id: 'fjord', name: 'Frostfjord', trait: 'Cold shores · stone +12% · buildings +5% health',
    palette: 'fjord', mods: { stoneMul: 1.12, buildingHpMul: 1.05 },
  },
  {
    id: 'isles', name: 'Shattered Isles', trait: 'Scattered isles · carry +3 · farms +10%',
    palette: 'isles', mods: { carryBonus: 3, farmMul: 1.1 },
  },
  {
    id: 'ashlands', name: 'Ashlands', trait: 'Scorched home · towers +1 range · wood +5%',
    palette: 'ashlands', mods: { towerRange: 1, woodMul: 1.05 },
  },
];

export const AGE_NAMES = ['', 'Feudal Age', 'Castle Age', 'Imperial Age'];
export const AGE_COSTS = [null, { food: 200, gold: 100 }, { food: 450, gold: 250 }];

export const UNIT_TYPES = {
  villager: {
    name: 'Villager', role: 'Townfolk', icon: 'villager', category: 'villager',
    hp: 45, attack: 2, range: 0.65, speed: 2.35, cooldown: 1.35, armor: 1,
    radius: 0.24, sight: 5, cost: { food: 50 }, trainTime: 9, pop: 1,
    desc: 'Gathers resources and raises the kingdom’s works.',
  },
  militia: {
    name: 'Militiaman', role: 'Infantry', icon: 'sword', category: 'infantry',
    hp: 78, attack: 9, range: 0.72, speed: 2.05, cooldown: 1.05, armor: 4,
    radius: 0.26, sight: 6.5, cost: { food: 60, gold: 20 }, trainTime: 8, pop: 1,
    desc: 'A shield of oak and iron. Sturdy, faithful, unforgiving.',
  },
  spearman: {
    name: 'Spearman', role: 'Anti-Cavalry', icon: 'spear', category: 'infantry',
    hp: 68, attack: 8, range: 0.95, speed: 2.15, cooldown: 1.2, armor: 3,
    radius: 0.26, sight: 6.5, cost: { food: 35, wood: 25 }, trainTime: 7, pop: 1,
    desc: 'A long shaft and a braced foot. Doubles damage against riders and elephants.',
  },
  archer: {
    name: 'Longbowman', role: 'Archer', icon: 'bow', category: 'ranged',
    hp: 48, attack: 8, range: 4.7, speed: 2.15, cooldown: 1.35, armor: 1,
    radius: 0.24, sight: 7.5, projectile: 'arrow', cost: { wood: 40, gold: 30 }, trainTime: 9, pop: 1,
    desc: 'Rain death from the treeline. Fragile if caught alone.',
  },
  skirmisher: {
    name: 'Skirmisher', role: 'Ranged', icon: 'javelin', category: 'ranged',
    hp: 44, attack: 6, range: 4.25, speed: 2.4, cooldown: 1.45, armor: 2,
    radius: 0.24, sight: 7, projectile: 'javelin', cost: { food: 30, wood: 25 }, trainTime: 8, pop: 1,
    desc: 'Cheap skirmishers who punish massed archers.',
  },
  knight: {
    name: 'Knight of Ash', role: 'Cavalry', icon: 'horse', category: 'cavalry',
    hp: 135, attack: 14, range: 0.8, speed: 2.9, cooldown: 1.05, armor: 5,
    radius: 0.34, sight: 8, cost: { food: 95, gold: 65 }, trainTime: 14, pop: 2,
    desc: 'The last oathsworn riders of the old crown.',
  },
  elephant: {
    name: 'War Elephant', role: 'Cavalry', icon: 'elephant', category: 'cavalry',
    hp: 360, attack: 24, range: 0.95, speed: 1.75, cooldown: 1.45, armor: 8,
    radius: 0.44, sight: 7, cost: { food: 180, gold: 120 }, trainTime: 22, pop: 4,
    desc: 'A living rampart. Slow, immense, and terrifying to infantry.',
  },
  ram: {
    name: 'Battering Ram', role: 'Siege', icon: 'hammer', category: 'siege',
    hp: 260, attack: 55, range: 1.05, speed: 1.4, cooldown: 2.2, armor: 16,
    radius: 0.4, sight: 6, cost: { wood: 120, gold: 40 }, trainTime: 16, pop: 3,
    desc: 'Splinters gates and walls, but is nearly helpless against soldiers.',
  },
  commander: {
    name: 'Riftwarden', role: 'Hero', icon: 'crown', category: 'hero', hero: true,
    hp: 520, attack: 18, range: 0.9, speed: 2.55, cooldown: 0.95, armor: 8,
    radius: 0.32, sight: 9, cost: {}, trainTime: 0, pop: 0,
    desc: 'Your sworn champion. Mark prey with Q; grant a shield with E.',
  },
  decoy: {
    name: 'Decoy Cart', role: 'Decoy', icon: 'cart', category: 'support', noAttack: true,
    hp: 180, attack: 0, range: 0.5, speed: 2.1, cooldown: 2, armor: 2,
    radius: 0.3, sight: 5, cost: {}, trainTime: 0, pop: 0,
    desc: 'A straw rider meant to draw raider eyes away from the keep.',
  },
  prototype: {
    name: 'Rift Prototype', role: 'Relic', icon: 'cog', category: 'siege',
    hp: 300, attack: 26, range: 5.2, speed: 1.7, cooldown: 1.5, armor: 10,
    radius: 0.36, sight: 8, cost: {}, trainTime: 0, pop: 4,
    desc: 'A humming engine of the old world. Its bolts burn with pale fire.',
  },
  raider: {
    name: 'Ash Raider', role: 'Raider', icon: 'sword', category: 'infantry', enemy: true,
    hp: 58, attack: 7, range: 0.72, speed: 2.0, cooldown: 1.2, armor: 3,
    radius: 0.25, sight: 7, bounty: 5,
  },
  marauder: {
    name: 'Marauder', role: 'Raider', icon: 'bow', category: 'ranged', enemy: true,
    hp: 38, attack: 6, range: 4.0, speed: 1.95, cooldown: 1.5, armor: 1,
    radius: 0.24, sight: 7, projectile: 'arrow', bounty: 5,
  },
  brute: {
    name: 'Ashen Brute', role: 'Heavy', icon: 'hammer', category: 'infantry', enemy: true,
    hp: 145, attack: 16, range: 0.8, speed: 1.55, cooldown: 1.5, armor: 6,
    radius: 0.36, sight: 6.5, bounty: 9, scale: 1.18,
  },
  warlord: {
    name: 'Vask the Unburnt', role: 'Warlord', icon: 'skull', category: 'hero', enemy: true,
    hp: 1800, attack: 24, range: 1.05, speed: 1.8, cooldown: 1.25, armor: 10,
    radius: 0.5, sight: 9, bounty: 150, scale: 1.55, boss: true,
  },
  warlord2: {
    name: 'The Rift-Marshal', role: 'Warlord', icon: 'skull', category: 'hero', enemy: true,
    hp: 3200, attack: 32, range: 1.15, speed: 1.8, cooldown: 1.1, armor: 20,
    radius: 0.56, sight: 10, bounty: 320, scale: 1.72, boss: true,
  },
};

export const BUILDING_TYPES = {
  towncenter: {
    name: 'Town Center', icon: 'crown', w: 3, h: 3, hp: 1900, armor: 8,
    cost: {}, buildTime: 0, pop: 10, dropoff: true, attack: 6, range: 6.2, cooldown: 1.9,
    desc: 'Heart of the realm. Trains villagers and advances the ages.',
  },
  house: {
    name: 'House', icon: 'house', w: 2, h: 2, hp: 300, armor: 6,
    cost: { wood: 60 }, buildTime: 8, pop: 10,
    desc: 'Raises population capacity by ten.',
  },
  barracks: {
    name: 'Barracks', icon: 'sword', w: 2, h: 2, hp: 940, armor: 8,
    cost: { wood: 130 }, buildTime: 13,
    desc: 'Trains militiamen and spearmen.',
  },
  archery_range: {
    name: 'Archery Range', shortName: 'Archery', icon: 'bow', w: 2, h: 2, hp: 680, armor: 6,
    cost: { wood: 130 }, buildTime: 13,
    desc: 'Trains longbowmen and skirmishers.',
  },
  stable: {
    name: 'Stable', icon: 'horse', w: 2, h: 2, hp: 760, armor: 7,
    cost: { wood: 140 }, buildTime: 15,
    desc: 'Trains knights of Ash, and war elephants when unlocked.',
  },
  tower: {
    name: 'Watchtower', icon: 'tower', w: 1, h: 1, hp: 720, armor: 10,
    cost: { wood: 80, stone: 40 }, buildTime: 12, attack: 11, range: 7.0, cooldown: 1.3,
    desc: 'Looses arrows at raiders within seven tiles.',
  },
  farm: {
    name: 'Wheat Farm', icon: 'farm', w: 2, h: 2, hp: 220, armor: 4,
    cost: { wood: 60 }, buildTime: 8, foodRate: 0.62,
    desc: 'A quiet field that yields food over time.',
  },
};

export const TRAINABLE = {
  towncenter: ['villager'],
  barracks: ['militia', 'spearman'],
  archery_range: ['archer', 'skirmisher'],
  stable: ['knight', 'elephant'],
};

export const BUILD_OPTIONS = [
  'house', 'farm', 'barracks', 'archery_range', 'stable', 'tower',
];

export const COMMAND_ICONS = {
  villager: 'villager', militia: 'sword', spearman: 'spear', archer: 'bow', skirmisher: 'javelin',
  knight: 'horse', elephant: 'elephant', ram: 'hammer', commander: 'crown', decoy: 'cart', prototype: 'cog',
  house: 'house', farm: 'farm', barracks: 'sword', archery_range: 'bow', stable: 'horse', tower: 'tower',
  stop: 'stop', hold: 'hold', age: 'crown', mark: 'arrow', aegis: 'shield',
};

const CARD = (id, name, rarity, icon, desc, apply) => ({ id, name, rarity, icon, desc, apply });

export const BOONS = [
  CARD('farwatch', 'Farwatch Doctrine', 'COMMON', 'bow',
    'Archers and towers gain one tile of range.',
    g => { g.effects.archerRange += 1; g.effects.towerRange += 1; }),
  CARD('bolt_rack', 'Linked Bolt Rack', 'RARE', 'arrow',
    'Every third ranged attack fires an additional bolt at 80% damage.',
    g => { g.effects.extraArrowEvery = 3; }),
  CARD('levy_rolls', 'Levy Rolls', 'RARE', 'people',
    'Infantry cost half a population, but lose 15% health.',
    g => { g.effects.infantryPopMul *= 0.5; g.effects.infantryHpMul *= 0.85; g.refreshPlayerStats(); }),
  CARD('light_axles', 'Light Axles', 'COMMON', 'speed',
    'Soldiers march 6% faster and all training is 8% quicker.',
    g => { g.effects.militarySpeedMul *= 1.06; g.effects.trainSpeedMul *= 1.08; }),
  CARD('elephant_compact', 'Elephant Compact', 'RARE', 'elephant',
    'Unlock war elephants. If already unlocked, they cost 15% less.',
    g => { g.effects.elephantUnlocked = true; g.effects.elephantCostMul *= 0.85; }),
  CARD('patrol_depot', 'Patrol Depot', 'COMMON', 'tower',
    'Towers gain one tile of range and 20% damage.',
    g => { g.effects.towerRange += 1; g.effects.towerDamageMul *= 1.2; }),
  CARD('citizen_arms', 'Citizen Arms', 'COMMON', 'villager',
    'Villagers gain 30 health and 3 attack.',
    g => { g.effects.villagerHpBonus += 30; g.effects.villagerAttackBonus += 3; g.refreshPlayerStats(); }),
  CARD('wartime_rotation', 'Wartime Rotation', 'COMMON', 'hourglass',
    'Infantry gain 12% health and cost 10% less food.',
    g => { g.effects.infantryHpMul *= 1.12; g.effects.infantryCostMul *= 0.9; g.refreshPlayerStats(); }),
  CARD('heavy_arrowheads', 'Heavy Arrowheads', 'RARE', 'arrow',
    'Ranged hits slow their target by 18% for 1.5 seconds.',
    g => { g.effects.slowOnHit = Math.max(g.effects.slowOnHit, 0.18); }),
  CARD('fire_oil', 'Fire-Oil Pots', 'RARE', 'flame',
    'Ranged hits splash 45% of their damage to nearby enemies.',
    g => { g.effects.splash = Math.max(g.effects.splash, 0.45); }),
  CARD('hooked_lines', 'Hooked Lines', 'COMMON', 'spear',
    'Infantry hits slow enemies by 15%.',
    g => { g.effects.infantrySlow = 0.15; }),
  CARD('deflecting_shields', 'Deflecting Shields', 'RARE', 'shield',
    'Infantry gain 15% health and take 2 less damage from every hit.',
    g => { g.effects.infantryHpMul *= 1.15; g.effects.infantryArmor += 2; g.refreshPlayerStats(); }),
  CARD('battlefield_care', 'Battlefield Care', 'RARE', 'heart',
    'Your soldiers heal for 8% of the damage they deal.',
    g => { g.effects.lifesteal += 0.08; }),
  CARD('fragment_shells', 'Fragment Shells', 'RARE', 'hammer',
    'Siege attacks splash 60% damage. Siege units gain 15% health.',
    g => { g.effects.siegeSplash = 0.6; g.effects.siegeHpMul *= 1.15; g.refreshPlayerStats(); }),
  CARD('resonant_strings', 'Resonant Strings', 'RARE', 'speed',
    'Every fifth ranged hit chains a shock to two nearby enemies.',
    g => { g.effects.chainEvery = 5; }),
  CARD('veteran_honors', 'Veteran Honors', 'LEGACY', 'crown',
    'Each slain raider grants your soldiers a permanent +1% attack, up to +40%.',
    g => { g.effects.veteran = true; }),
  CARD('decoy_cart', 'Decoy Cart', 'COMMON', 'cart',
    'Two decoy carts roll out before every raid.',
    g => { g.effects.decoyWave = 2; }),
  CARD('shared_oath', 'Shared Oath', 'LEGACY', 'people',
    'Slain raiders have a 10% chance to rise under your banner for 20 seconds.',
    g => { g.effects.convertChance = 0.1; }),
  CARD('horse_armor', 'Horse Armor', 'COMMON', 'horse',
    'Cavalry gain 20% health but move 6% slower.',
    g => { g.effects.cavalryHpMul *= 1.2; g.effects.cavalrySpeedMul *= 0.94; g.refreshPlayerStats(); }),
  CARD('pack_mules', 'Pack Mules', 'COMMON', 'wood',
    'Villagers carry seven more resources and move 12% faster.',
    g => { g.effects.carryBonus += 7; g.effects.villagerSpeedMul *= 1.12; }),
  CARD('war_banner', 'War Banner', 'RARE', 'banner',
    'Soldiers attack 5% faster and march 8% faster.',
    g => { g.effects.attackSpeedMul *= 1.05; g.effects.militarySpeedMul *= 1.08; }),
  CARD('night_watch', 'Night Watch', 'COMMON', 'tower',
    'Houses fire arrows and towers gain two tiles of range.',
    g => { g.effects.houseArrows = true; g.effects.towerRange += 2; }),
  CARD('rescue_writ', 'Rescue Writ', 'LEGENDARY', 'scroll',
    'Once per raid, a lethal blow leaves your hero or an elite at 1 health with a shield.',
    g => { g.effects.rescue = true; }),
  CARD('rift_prototype', 'Rift Prototype', 'LEGENDARY', 'cog',
    'A Rift Prototype marches to your banner at once.',
    g => { g.spawnPrototype(); }),
  CARD('siege_math', 'Siege Mathematics', 'RARE', 'hammer',
    'Buildings gain 20% health and are raised 15% faster.',
    g => { g.effects.buildingHpMul *= 1.2; g.effects.buildSpeedMul *= 1.15; g.refreshBuildingStats(); }),
  CARD('zeal', 'Zeal of the Faithful', 'RARE', 'sword',
    'Infantry deal 15% more damage and attack 10% faster.',
    g => { g.effects.infantryDamageMul *= 1.15; g.effects.infantryAttackSpeedMul *= 1.1; }),
  CARD('gold_teeth', 'Gold Teeth', 'COMMON', 'gold',
    'Each slain raider yields two extra gold. Receive 120 gold now.',
    g => { g.effects.killGoldRate += 0.12; g.effects.killGoldCap += 120; g.resources.gold += 120; }),
  CARD('butcher', 'The Butcher’s Due', 'COMMON', 'food',
    'Each slain raider yields food. Receive 150 food now.',
    g => { g.effects.killFoodRate += 0.12; g.effects.killFoodCap += 180; g.resources.food += 150; }),
  CARD('retreat_standard', 'Retreat Standard', 'RARE', 'banner',
    'Once per run, when the keep falls below 30% health, all soldiers heal 25%.',
    g => { g.effects.retreat = true; }),
  CARD('bronze_oath', 'Bronze Oath', 'RARE', 'shield',
    'All soldiers gain 10% health; buildings gain 10% health.',
    g => { g.effects.militaryHpMul *= 1.1; g.effects.buildingHpMul *= 1.1; g.refreshPlayerStats(); g.refreshBuildingStats(); }),
  CARD('black_powder', 'Black Powder', 'LEGENDARY', 'flame',
    'Ranged soldiers deal 30% more damage but lose half a tile of range.',
    g => { g.effects.archerDamageMul *= 1.3; g.effects.archerRange -= 0.5; }),
  CARD('rift_echo', 'Rift Echo', 'LEGENDARY', 'cog',
    'The Riftwarden gains 30% health, 20% attack, and refreshes abilities 25% faster.',
    g => { g.effects.heroHpMul *= 1.3; g.effects.heroDamageMul *= 1.2; g.effects.heroCooldownMul *= 0.75; g.refreshPlayerStats(); }),
];

export const RARITY_WEIGHT = { COMMON: 60, RARE: 28, LEGENDARY: 10, LEGACY: 2 };
export const RARITY_ORDER = { COMMON: 0, RARE: 1, LEGENDARY: 2, LEGACY: 3 };

export const WAVES = [
  {
    name: 'The First Raid', sub: 'Smoke on the northern road', duration: 120,
    spawns: [
      { at: 0, gate: 0, units: { raider: 6, marauder: 2 } },
      { at: 26, gate: 0, units: { raider: 4 } },
    ],
  },
  {
    name: 'Burning Fields', sub: 'They come for the harvest', duration: 125,
    spawns: [
      { at: 0, gate: 1, units: { raider: 7, marauder: 3 } },
      { at: 20, gate: 0, units: { raider: 4, marauder: 2 } },
    ],
  },
  {
    name: 'The Iron Tide', sub: 'No banner, no mercy', duration: 135,
    spawns: [
      { at: 0, gate: 0, units: { spearman: 6, marauder: 4 } },
      { at: 22, gate: 1, units: { raider: 6, marauder: 5 } },
    ],
  },
  {
    name: 'Shattered Oaths', sub: 'Traitors among the raiders', duration: 140,
    spawns: [
      { at: 0, gate: 2, units: { raider: 8, marauder: 4 } },
      { at: 16, gate: 0, units: { brute: 4, raider: 3 } },
      { at: 36, gate: 1, units: { raider: 6 } },
    ],
  },
  {
    name: 'Warlord’s Reckoning', sub: 'Vask the Unburnt rides', duration: 210, boss: true,
    spawns: [
      { at: 0, gate: 0, units: { brute: 4, marauder: 6 } },
      { at: 12, gate: 1, units: { raider: 6 } },
      { at: 30, gate: 0, units: { warlord: 1 } },
    ],
  },
  {
    name: 'The Second Banner', sub: 'A new host gathers', duration: 145,
    spawns: [
      { at: 0, gate: 1, units: { raider: 10, knight: 4 } },
      { at: 20, gate: 2, units: { marauder: 6, brute: 2 } },
      { at: 42, gate: 0, units: { raider: 8 } },
    ],
  },
  {
    name: 'Outer Fires', sub: 'The horizon burns', duration: 150,
    spawns: [
      { at: 0, gate: 0, units: { spearman: 8, marauder: 6 } },
      { at: 22, gate: 3, units: { raider: 8, marauder: 4 } },
      { at: 46, gate: 1, units: { brute: 6 } },
    ],
  },
  {
    name: 'Twin Breach', sub: 'Two gates, one grave', duration: 155,
    spawns: [
      { at: 0, gate: 2, units: { raider: 10, knight: 4 } },
      { at: 18, gate: 1, units: { ram: 2, elephant: 2 } },
      { at: 38, gate: 0, units: { marauder: 8, skirmisher: 4 } },
    ],
  },
  {
    name: 'The Long Arm', sub: 'The rift sends its hunters', duration: 165,
    spawns: [
      { at: 0, gate: 0, units: { brute: 8, marauder: 8 } },
      { at: 24, gate: 1, units: { raider: 10, knight: 6 } },
      { at: 50, gate: 2, units: { marauder: 8 } },
    ],
  },
  {
    name: 'The Last Watch', sub: 'The Rift-Marshal comes', duration: 240, boss: true,
    spawns: [
      { at: 0, gate: 0, units: { raider: 12, marauder: 6 } },
      { at: 18, gate: 1, units: { brute: 8, elephant: 4 } },
      { at: 36, gate: 0, units: { warlord2: 1 } },
      { at: 54, gate: 2, units: { raider: 10, skirmisher: 6 } },
    ],
  },
];

export const START_RESOURCES = { food: 300, wood: 300, gold: 120, stone: 100 };

export const PLAYER_COLORS = {
  primary: '#557f83',
  light: '#91b5b3',
  dark: '#2f4c52',
  trim: '#d6b56a',
  cloth: '#3e656b',
};

export const ENEMY_COLORS = {
  primary: '#8c3f35',
  light: '#bd7462',
  dark: '#4b2421',
  trim: '#a98458',
  cloth: '#6b302a',
};
