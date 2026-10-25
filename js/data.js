export const RESOURCES = ['food', 'wood', 'gold', 'stone'];

export const CIVILIZATIONS = [
  {
    id: 'MNG', name: 'Mongols', epithet: 'Steppe Riders', accent: '#8e6b3a',
    trait: 'Mobile camp · slain foes yield food and gold each wave · farms −20%.',
    bonuses: { farmMul: 0.8, killFoodRate: 0.15, killGoldRate: 0.05, killFoodCap: 100, killGoldCap: 40 },
  },
  {
    id: 'TEU', name: 'Teutons', epithet: 'Iron Covenant', accent: '#56616a',
    trait: 'Houses shoot arrows · buildings reflect 10% melee damage · villagers move 10% slower.',
    bonuses: { houseArrows: true, thorns: 0.1, villagerSpeedMul: 0.9 },
  },
  {
    id: 'GOT', name: 'Goths', epithet: 'Endless Levy', accent: '#4d5d3e',
    trait: 'Infantry cost half population and have 15% less HP · fallen infantry refund 30% food, up to 120 per wave.',
    bonuses: { infantryPopMul: 0.5, infantryHpMul: 0.85, infantryRefundRate: 0.3, infantryRefundCap: 120 },
  },
  {
    id: 'FRK', name: 'Franks', epithet: 'Knightly Blood', accent: '#3d5670',
    trait: 'Military population cap 40 · cavalry HP +60% · infantry cost 10% less.',
    bonuses: { cavalryHpMul: 1.6, infantryCostMul: 0.9, militaryPopCap: 40 },
  },
  {
    id: 'SAR', name: 'Saracens', epithet: 'Desert Ledger', accent: '#8d6a2c',
    trait: 'Market hires any generic unit at +15% cost · borrow 100 gold per wave, repay 115 next wave.',
    bonuses: { marketHiresAny: true, marketHireCostMul: 1.15, waveLoan: 100 },
  },
  {
    id: 'AZT', name: 'Aztecs', epithet: 'Obsidian Oath', accent: '#6d5a35',
    trait: 'Recruiters cost 25% less and train 20% faster · each recruitment grants +1% army HP this wave, up to +10% · no cavalry.',
    bonuses: { recruiterCostMul: 0.75, recruiterTrainMul: 0.8, convertHpBonus: 0.01, noCavalry: true },
  },
  {
    id: 'BRI', name: 'Britons', epithet: 'Longbow Doctrine', accent: '#4a6140',
    trait: 'Foot archers gain +1 range and +1 sight · first shot after moving takes 0.4s longer · cavalry HP −10%.',
    bonuses: { archerRange: 1, archerSight: 1, archerFirstShotDelay: 0.4, cavalryHpMul: 0.9 },
  },
  {
    id: 'CHN', name: 'Chinese', epithet: 'Repeating Crossbows', accent: '#7b4433',
    trait: 'Every third archer shot fires a 35% extra bolt · age research costs 15% less · start with 40 less food.',
    bonuses: { extraArrowEvery: 3, extraArrowDamageMul: 0.35, ageCostMul: 0.85, startFoodBonus: -40 },
  },
  {
    id: 'PER', name: 'Persians', epithet: 'War Elephants', accent: '#765a2c',
    trait: 'War elephants unlocked · melee attacks trample 25% damage to up to 4 foes · slower turns and costlier repairs.',
    bonuses: { elephantUnlocked: true, elephantTrample: 0.25, elephantTrampleTargets: 4, elephantTurnRateMul: 0.8, elephantRepairCostMul: 1.15 },
  },
  {
    id: 'KOR', name: 'Koreans', epithet: 'Stone Watch', accent: '#4d5b58',
    trait: 'Every 3 towers grants a patrol cart, max 4 · siege range +1 · towers cost 15% more.',
    bonuses: { towerCartEvery: 3, towerCartCap: 4, siegeRange: 1, towerCostMul: 1.15 },
  },
  {
    id: 'SPA', name: 'Spanish', epithet: 'Tercio', accent: '#8b4b2b',
    trait: 'Villagers gain +40 HP and +4 melee attack · first hit stuns non-boss foes for 0.5s · market fee −50%.',
    bonuses: { villagerHpBonus: 40, villagerAttackBonus: 4, villagerStun: 0.5, marketFeeMul: 0.5 },
  },
  {
    id: 'TUR', name: 'Turks', epithet: 'Powder Legacy', accent: '#596633',
    trait: 'Gunpowder damage +20% · ammunition supply costs 40 gold each wave, or reload 15% slower.',
    bonuses: { gunpowderDamageMul: 1.2, ammoSupply: 40, ammoReloadPenalty: 0.15 },
  },
  {
    id: 'BYZ', name: 'Byzantines', epithet: 'Theodosian Walls', accent: '#5c4b74',
    trait: 'Buildings gain 35% HP · counter-infantry cost 15% less · construction 10% slower.',
    bonuses: { buildingHpMul: 1.35, counterCostMul: 0.85, buildSpeedMul: 0.9 },
  },
  {
    id: 'VIK', name: 'Vikings', epithet: 'Sea Wolves', accent: '#3e5f63',
    trait: 'Infantry regenerate 1% HP/s after 5s out of combat · fishing huts may be built at inland wells · cavalry damage −10%.',
    bonuses: { infantryRegen: 0.01, fishingHutAnywhere: true, cavalryDamageMul: 0.9 },
  },
  {
    id: 'MAG', name: 'Magyars', epithet: 'Raider Archers', accent: '#6f4c34',
    trait: 'Light cavalry cost 20% less and see 2 tiles farther · first melee hit deals +8 · military buildings have 15% less HP.',
    bonuses: { cavalryCostMul: 0.8, cavalrySight: 2, cavalryChargeBonus: 8, militaryBuildingHpMul: 0.85 },
  },
  {
    id: 'JPN', name: 'Japanese', epithet: 'Blade Discipline', accent: '#793d3d',
    trait: 'Infantry attack 15% faster · block one normal melee hit every 10s · siege costs 15% more.',
    bonuses: { infantryAttackSpeedMul: 1.15, blockEvery: 10, siegeCostMul: 1.15 },
  },
];

export const BIOMES = [
  {
    id: 'steppe', name: 'Grasssea Plain', trait: '60% open ground · one sidewind per act slows arrows 15% for 12s after an 8s warning',
    palette: 'steppe', mods: { woodMul: 0.95 },
  },
  {
    id: 'forest', name: 'Regrowth Forest', trait: '45% forest · felled woods regrow after 120s · no regrowth near buildings, units, or roads',
    palette: 'forest', mods: { woodMul: 1.15, woodYield: 1.05 },
  },
  {
    id: 'dune', name: 'Dunesea Trade Road', trait: 'Central gold veins hold +30% · sandstorm after an 8s warning cuts vision 20% for 20s',
    palette: 'dune', mods: { goldMul: 1.15, woodMul: 0.9 },
  },
  {
    id: 'river', name: 'Fertile River Valley', trait: 'Two fixed bridges and a ford · floods warn after 10s and halt lowland farms for 15s',
    palette: 'river', mods: { foodMul: 1.12, farmMul: 1.1 },
  },
  {
    id: 'highland', name: 'Stoneridge Hills', trait: 'High-ground ranged damage +10% against visible targets · at least two ramps',
    palette: 'highland', mods: { archerDamageMul: 1.1, stoneMul: 1.08 },
  },
  {
    id: 'fjord', name: 'Icebay Rift', trait: 'Two permanent land bridges · brittle ice cracks after 4s overweight with a 3s warning',
    palette: 'fjord', mods: { stoneMul: 1.12, buildingHpMul: 1.05 },
  },
  {
    id: 'island', name: 'Tidal Isles', trait: 'Main island linked by two bridges · landings telegraphed 12s ahead · a pure land army can finish',
    palette: 'island', mods: { carryBonus: 3, farmMul: 1.1 },
  },
  {
    id: 'ash', name: 'Volcanic Plateau', trait: 'Ashfall once per act · 12s warning, excludes the core within 6 tiles · 150 fixed damage',
    palette: 'ash', mods: { towerRange: 1, woodMul: 1.05 },
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
    name: 'Man-at-Arms', role: 'Infantry', icon: 'sword', category: 'infantry', family: 'M',
    hp: 60, attack: 8, range: 1, speed: 2.4, cooldown: 1.5, armor: 10,
    radius: 0.26, sight: 6.5, cost: { food: 40, gold: 10 }, trainTime: 8, pop: 1, threat: 1,
    desc: 'A shielded line-holder. The backbone of every levy.',
  },
  spearman: {
    name: 'Spearman', role: 'Anti-Cavalry', icon: 'spear', category: 'infantry', family: 'P',
    hp: 50, attack: 6, range: 1.5, speed: 2.5, cooldown: 1.7, armor: 5,
    radius: 0.26, sight: 6.5, cost: { food: 35, wood: 15 }, trainTime: 8, pop: 1, threat: 1,
    desc: 'A braced shaft. Doubles damage against cavalry and elephants.',
  },
  archer: {
    name: 'Archer', role: 'Archer', icon: 'bow', category: 'ranged', family: 'R',
    hp: 35, attack: 7, range: 5, speed: 2.5, cooldown: 1.8, armor: 0,
    radius: 0.24, sight: 7.5, projectile: 'arrow', cost: { wood: 35, gold: 25 }, trainTime: 10, pop: 1, threat: 1.5,
    desc: 'Massed arrows from the treeline. Fragile if caught alone.',
  },
  chu_ko_nu: {
    name:'Chu Ko Nu',role:'Repeating Crossbow',icon:'bow',category:'ranged',family:'R',visual:'archer',uniqueCiv:'CHN',minAge:1,
    hp:35,attack:7,range:5,speed:2.5,cooldown:1.8,armor:0,radius:.24,sight:7.5,projectile:'arrow',
    cost:{wood:35*1.15,gold:25*1.15},trainTime:10,pop:1,threat:1.5*1.15,
    desc:'Chinese repeating crossbow infantry. Uses the Chinese third-shot extra bolt; trained with the R-family template at the Archery Range.',
  },
  skirmisher: {
    name: 'Skirmisher', role: 'Ranged', icon: 'javelin', category: 'ranged', family: 'K',
    hp: 40, attack: 5, range: 4.5, speed: 2.6, cooldown: 1.8, armor: 10,
    radius: 0.24, sight: 7, projectile: 'javelin', cost: { food: 25, wood: 25 }, trainTime: 8, pop: 1, threat: 1.2,
    desc: 'Cheap skirmishers who punish massed archers.',
  },
  light_cavalry: {
    name: 'Light Cavalry', role: 'Cavalry', icon: 'horse', category: 'cavalry', family: 'C',
    hp: 90, attack: 10, range: 1, speed: 3.8, cooldown: 1.6, armor: 10,
    radius: 0.32, sight: 8, cost: { food: 65, gold: 20 }, trainTime: 12, pop: 2, threat: 2.5,
    desc: 'Fast riders who run down siege, recruiters, and isolated archers.',
  },
  horse_archer: {
    name: 'Horse Archer', role: 'Cavalry Archer', icon: 'bow', category: 'cavalry', family: 'A',
    hp: 65, attack: 8, range: 4.5, speed: 3.5, cooldown: 2, armor: 5,
    radius: 0.3, sight: 8, projectile: 'arrow', cost: { food: 35, wood: 25, gold: 40 }, trainTime: 14, pop: 2, threat: 3,
    desc: 'Mounted skirmishers who shoot while riding.',
  },
  guard: {
    name: 'Elite Guard', role: 'Heavy Infantry', icon: 'shield', category: 'infantry', family: 'E',
    hp: 130, attack: 14, range: 1, speed: 2.1, cooldown: 1.8, armor: 25,
    radius: 0.3, sight: 7, cost: { food: 70, gold: 50 }, trainTime: 18, pop: 2, threat: 4,
    desc: 'Armoured veterans who anchor a wavering line.',
  },
  mangonel: {
    name: 'Mangonel', role: 'Siege', icon: 'hammer', category: 'siege', family: 'S',
    hp: 100, attack: 40, range: 7, speed: 1.7, cooldown: 4.5, armor: 15,
    radius: 0.4, sight: 8, projectile: 'boulder', cost: { wood: 100, gold: 80 }, trainTime: 25, pop: 3, threat: 10,
    desc: 'A stone thrower that splashes damage across a tight formation.',
  },
  ram: {
    name: 'Battering Ram', role: 'Siege', icon: 'hammer', category: 'siege', family: 'B',
    hp: 220, attack: 30, range: 1, speed: 1.5, cooldown: 2.8, armor: 50,
    radius: 0.4, sight: 6, cost: { wood: 120, gold: 50 }, trainTime: 25, pop: 3, threat: 8,
    desc: 'Quadruple damage against buildings, but nearly helpless against soldiers.',
  },
  recruiter: {
    name: 'Recruiter', role: 'Support', icon: 'scroll', category: 'support', family: 'V', noAttack: true,
    hp: 45, attack: 0, range: 5, speed: 2.4, cooldown: 15, armor: 0,
    radius: 0.26, sight: 7, cost: { gold: 80 }, trainTime: 18, pop: 1, threat: 6,
    desc: 'Carries offers of gold and safe passage to turn enemy soldiers.',
  },
  elephant: {
    name: 'War Elephant', role: 'Cavalry', icon: 'elephant', category: 'cavalry', family: 'W',
    hp: 350, attack: 22, range: 1, speed: 1.8, cooldown: 2.2, armor: 20,
    radius: 0.44, sight: 7, cost: { food: 150, gold: 80 }, trainTime: 25, pop: 4, threat: 9,
    desc: 'A living rampart. Slow, immense, and terrifying to infantry.',
  },
  patrol_cart: {
    name: 'Patrol Cart', role: 'Ranged Support', icon: 'tower', category: 'ranged', family: 'N',
    hp: 80, attack: 8, range: 4, speed: 2.8, cooldown: 2, armor: 15,
    radius: 0.3, sight: 7, projectile: 'arrow', cost: { wood: 65, gold: 45 }, trainTime: 16, pop: 2, threat: 3,
    desc: 'A mobile watch platform that adds a bow to any patrol.',
  },
  knight: {
    name: 'Knight of Ash', role: 'Legacy Cavalry', icon: 'horse', category: 'cavalry',
    hp: 135, attack: 14, range: 0.8, speed: 2.9, cooldown: 1.05, armor: 5,
    radius: 0.34, sight: 8, cost: { food: 95, gold: 65 }, trainTime: 14, pop: 2, threat: 3.5,
    desc: 'The last oathsworn riders of the old crown.',
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
  core: {
    name: 'Town Center', icon: 'crown', w: 4, h: 4, hp: 3000, armor: 8,
    cost: {}, buildTime: 60, pop: 10, dropoff: true, attack: 6, range: 6, cooldown: 2,
    desc: 'Heart of the realm. Trains villagers and advances the ages.',
  },
  house: {
    name: 'House', icon: 'house', w: 2, h: 2, hp: 300, armor: 6,
    cost: { wood: 60 }, buildTime: 8, pop: 10,
    desc: 'Raises military population capacity by ten.',
  },
  farm: {
    name: 'Wheat Farm', icon: 'farm', w: 2, h: 2, hp: 160, armor: 4,
    cost: { food: 50, wood: 40 }, buildTime: 6, foodRate: 0.16,
    desc: 'A quiet field that yields food over time.',
  },
  camp: {
    name: 'Supply Camp', shortName: 'Camp', icon: 'banner', w: 2, h: 2, hp: 250, armor: 6,
    cost: { wood: 80 }, buildTime: 10, dropoff: true,
    desc: 'A forward drop-off point within eight tiles of the resource line.',
  },
  barracks: {
    name: 'Barracks', icon: 'sword', w: 3, h: 3, hp: 600, armor: 8,
    cost: { wood: 120 }, buildTime: 15,
    desc: 'Trains man-at-arms, spearmen, and elite guards.',
  },
  range: {
    name: 'Archery Range', shortName: 'Archery', icon: 'bow', w: 3, h: 3, hp: 600, armor: 6,
    cost: { wood: 120 }, buildTime: 15,
    desc: 'Trains archers and skirmishers.',
  },
  stable: {
    name: 'Stable', icon: 'horse', w: 3, h: 3, hp: 600, armor: 7,
    cost: { wood: 120 }, buildTime: 15,
    desc: 'Trains light cavalry and horse archers; war elephants when unlocked.',
  },
  tower: {
    name: 'Watchtower', icon: 'tower', w: 2, h: 2, hp: 650, armor: 10,
    cost: { wood: 80, stone: 60 }, buildTime: 20, attack: 12, range: 6, cooldown: 2,
    desc: 'Looses arrows at visible raiders within six tiles.',
  },
  wall: {
    name: 'Stone Wall', shortName: 'Wall', icon: 'shield', w: 1, h: 1, hp: 500, armor: 12,
    cost: { stone: 15 }, buildTime: 3,
    desc: 'A cheap barrier that channels raiders into your towers.',
  },
  gate: {
    name: 'Gatehouse', shortName: 'Gate', icon: 'banner', w: 2, h: 1, hp: 650, armor: 12,
    cost: { wood: 30, stone: 30 }, buildTime: 6, gate: true,
    desc: 'A fortified gate that opens for your own soldiers.',
  },
  workshop: {
    name: 'Siege Workshop', shortName: 'Workshop', icon: 'hammer', w: 3, h: 3, hp: 600, armor: 7,
    cost: { wood: 160, gold: 100 }, buildTime: 20,
    desc: 'Builds battering rams, mangonels, and patrol carts.',
  },
  market: {
    name: 'Market', icon: 'coin', w: 3, h: 3, hp: 450, armor: 6,
    cost: { wood: 120 }, buildTime: 15, goldRate: 0.08,
    desc: 'Trades quietly with the frontier, producing a trickle of gold.',
  },
  shrine: {
    name: 'Shrine', icon: 'heart', w: 3, h: 3, hp: 500, armor: 5,
    cost: { wood: 120, gold: 80 }, buildTime: 20, healRate: 2.5, healRadius: 5,
    desc: 'Heals nearby soldiers and trains recruiters.',
  },
  forge: {
    name: 'Forge', icon: 'flame', w: 3, h: 3, hp: 450, armor: 7,
    cost: { wood: 100, gold: 50 }, buildTime: 15, damageAura: 0.1, auraRadius: 6,
    desc: 'Nearby soldiers deal 10% more damage.',
  },
  monument: {
    name: 'Monument', icon: 'crown', w: 4, h: 4, hp: 1600, armor: 8,
    cost: { wood: 240, gold: 200, stone: 150 }, buildTime: 40, pop: 15,
    desc: 'An imperial symbol that raises population capacity by fifteen.',
  },
  fishing_hut: {
    name: 'Fishing Hut', shortName: 'Fishery', icon: 'food', w: 2, h: 2, hp: 400, armor: 3,
    cost: { wood: 60 }, buildTime: 8, foodRate: 0.5, dropoff: true, requiresWater: true, maxPerPlayer: 4,
    desc: 'A shore-side hut that yields food. Vikings can build on inland wells.',
  },
};

export const GENERIC_UNITS = [
  'militia', 'spearman', 'archer', 'skirmisher', 'light_cavalry', 'horse_archer',
  'guard', 'mangonel', 'ram', 'recruiter', 'elephant', 'patrol_cart',
];

export const TRAINABLE = {
  core: ['villager'],
  barracks: ['militia', 'spearman', 'guard'],
  range: ['archer', 'skirmisher'],
  workshop: ['ram', 'mangonel', 'patrol_cart'],
  stable: ['light_cavalry', 'horse_archer', 'elephant'],
  shrine: ['recruiter'],
};

export const BUILD_OPTIONS = [
  'house', 'farm', 'camp', 'barracks', 'range', 'stable', 'tower',
  'wall', 'gate', 'workshop', 'market', 'shrine', 'forge', 'monument', 'fishing_hut',
];

export const COMMAND_ICONS = {
  villager: 'villager', militia: 'sword', spearman: 'spear', archer: 'bow', skirmisher: 'javelin',
  light_cavalry: 'horse', horse_archer: 'bow', guard: 'shield', mangonel: 'hammer',
  recruiter: 'scroll', patrol_cart: 'tower',
  knight: 'horse', elephant: 'elephant', ram: 'hammer', commander: 'crown', decoy: 'cart', prototype: 'cog',
  house: 'house', farm: 'farm', camp: 'banner', barracks: 'sword', range: 'bow', stable: 'horse', tower: 'tower',
  wall: 'shield', gate: 'banner', workshop: 'hammer', market: 'coin', shrine: 'heart', forge: 'flame', monument: 'crown', fishing_hut: 'food',
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

BOONS.forEach((card, index) => { card.code = `C${String(index + 1).padStart(2, '0')}`; });

export const MAX_BOONS = 12;
export const RARITY_WEIGHT = { COMMON: 60, RARE: 28, LEGENDARY: 10, LEGACY: 2 };
export const RARITY_ORDER = { COMMON: 0, RARE: 1, LEGENDARY: 2, LEGACY: 3 };

export const WAVES = [
  {
    name: 'The First Raid', sub: 'Smoke on the northern road', duration: 120,
    spawns: [
      { at: 10, gate: 0, units: { militia: 6, archer: 2 } },
      { at: 35, gate: 0, units: { militia: 6, archer: 2 } },
    ],
  },
  {
    name: 'Burning Fields', sub: 'They come for the harvest', duration: 120,
    spawns: [
      { at: 10, gate: 1, units: { militia: 7, archer: 3 } },
      { at: 35, gate: 0, units: { militia: 7, archer: 3 } },
      { at: 60, gate: 1, units: { spearman: 4 } },
    ],
  },
  {
    name: 'The Iron Tide', sub: 'No banner, no mercy', duration: 120,
    spawns: [
      { at: 10, gate: 0, units: { spearman: 6, archer: 6 } },
      { at: 40, gate: 1, units: { light_cavalry: 4 } },
      { at: 65, gate: 0, units: { spearman: 6, archer: 6 } },
    ],
  },
  {
    name: 'Shattered Oaths', sub: 'Traitors among the raiders', duration: 120,
    spawns: [
      { at: 10, gate: 0, units: { militia: 8, archer: 6 } },
      { at: 35, gate: 3, units: { ram: 1 } },
      { at: 60, gate: 0, units: { militia: 8, archer: 6 } },
    ],
  },
  {
    name: 'Warlord’s Reckoning', sub: 'Vask the Unburnt rides', duration: 120, boss: true,
    spawns: [
      { at: 10, gate: 0, units: { guard: 3, archer: 6 } },
      { at: 35, gate: 0, units: { warlord: 1 } },
      { at: 55, gate: 0, units: { spearman: 8 } },
      { at: 80, gate: 0, units: { guard: 3, archer: 6 } },
    ],
  },
  {
    name: 'The Second Banner', sub: 'A new host gathers', duration: 120,
    spawns: [
      { at: 10, gate: 1, units: { militia: 11, light_cavalry: 3 } },
      { at: 35, gate: 3, units: { horse_archer: 8 } },
      { at: 65, gate: 1, units: { militia: 11, light_cavalry: 3 } },
    ],
  },
  {
    name: 'Outer Fires', sub: 'The horizon burns', duration: 120,
    spawns: [
      { at: 10, gate: 0, units: { spearman: 10, archer: 8 } },
      { at: 40, gate: 2, units: { mangonel: 1 } },
      { at: 65, gate: 0, units: { spearman: 10, archer: 8 } },
    ],
  },
  {
    name: 'Twin Breach', sub: 'Two gates, one grave', duration: 120,
    spawns: [
      { at: 10, gate: 0, units: { militia: 12, light_cavalry: 5 } },
      { at: 40, gate: 3, units: { ram: 2 } },
      { at: 70, gate: 0, units: { militia: 12, light_cavalry: 5 } },
    ],
  },
  {
    name: 'The Long Arm', sub: 'The rift sends its hunters', duration: 120,
    spawns: [
      { at: 10, gate: 1, units: { guard: 7, archer: 10 } },
      { at: 40, gate: 0, units: { mangonel: 2 } },
      { at: 70, gate: 1, units: { guard: 7, archer: 10 } },
    ],
  },
  {
    name: 'The Last Watch', sub: 'The Rift-Marshal comes', duration: 150, boss: true,
    spawns: [
      { at: 10, gate: 0, units: { militia: 15, horse_archer: 7 } },
      { at: 30, gate: 0, units: { warlord2: 1 } },
      { at: 55, gate: 3, units: { ram: 3 } },
      { at: 80, gate: 0, units: { militia: 15, horse_archer: 7 } },
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
