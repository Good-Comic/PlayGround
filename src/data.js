export const AGES = [
  { name: 'Dark Age', short: 'Dark', next: { food: 150, gold: 100 }, unlocks: ['Spearman', 'Archer', 'Archery Range'] },
  { name: 'Feudal Age', short: 'Feudal', next: { food: 300, gold: 200 }, unlocks: ['Knight', 'Crossbow'] },
  { name: 'Castle Age', short: 'Castle', next: { food: 500, gold: 350 }, unlocks: ['Champion', 'Longbowman'] },
  { name: 'Imperial Age', short: 'Imperial', next: null, unlocks: [] }
];

export const UNITS = {
  villager: {
    name: 'Villager', role: 'Economy', hp: 40, attack: 3, armor: 0, range: .85, speed: 2.35,
    cooldown: 1.4, pop: 1, cost: { food: 50 }, train: 8, age: 0, building: 'towncenter',
    desc: 'Gathers food, wood, gold, and stone. Builds and repairs structures.'
  },
  scout: {
    name: 'Outrider', role: 'Scout', hp: 110, attack: 6, armor: 1, range: 1, speed: 3.35,
    cooldown: 1.1, pop: 1, cost: { food: 80 }, train: 12, age: 0, building: 'towncenter',
    desc: 'A swift rider. Excellent for harrying raiders and scouting the ford.'
  },
  militia: {
    name: 'Militia', role: 'Infantry', hp: 85, attack: 8, armor: 1, range: 1, speed: 2.15,
    cooldown: 1.1, pop: 1, cost: { food: 50 }, train: 8, age: 0, building: 'barracks',
    desc: 'A sturdy shield-bearing soldier. The backbone of any early host.'
  },
  spearman: {
    name: 'Spearman', role: 'Infantry', hp: 80, attack: 10, armor: 0, range: 1.4, speed: 2.1,
    cooldown: 1.25, pop: 1, cost: { food: 35, wood: 25 }, train: 9, age: 1, building: 'barracks',
    desc: 'Reaches past shields and punishes brutes from a cautious distance.'
  },
  archer: {
    name: 'Archer', role: 'Ranged', hp: 55, attack: 7, armor: 0, range: 5.7, speed: 2.0,
    cooldown: 1.4, pop: 1, cost: { wood: 35, gold: 45 }, train: 9, age: 1, building: 'archery',
    desc: 'Looses arrows from the safety of the second rank. Fragile in melee.'
  },
  knight: {
    name: 'Knight', role: 'Cavalry', hp: 165, attack: 16, armor: 3, range: 1, speed: 2.9,
    cooldown: 1.15, pop: 1, cost: { food: 60, gold: 75 }, train: 13, age: 2, building: 'barracks',
    desc: 'Armoured cavalry. Fast, durable, and devastating against archers.'
  },
  crossbow: {
    name: 'Crossbowman', role: 'Ranged', hp: 70, attack: 13, armor: 1, range: 6.4, speed: 2.0,
    cooldown: 1.5, pop: 1, cost: { wood: 40, gold: 60 }, train: 12, age: 2, building: 'archery',
    desc: 'A slower, heavier bolt that punches through mail and hide.'
  },
  champion: {
    name: 'Champion', role: 'Infantry', hp: 140, attack: 18, armor: 3, range: 1, speed: 2.2,
    cooldown: 1.0, pop: 1, cost: { food: 90, gold: 60 }, train: 14, age: 3, building: 'barracks',
    desc: 'A veteran of a dozen campaigns. Holds the line when all else fails.'
  },
  longbow: {
    name: 'Longbowman', role: 'Ranged', hp: 80, attack: 16, armor: 1, range: 7.2, speed: 2.0,
    cooldown: 1.55, pop: 1, cost: { wood: 50, gold: 80 }, train: 14, age: 3, building: 'archery',
    desc: 'An arrow that darkens the sun. The finest shot in the realm.'
  }
};

export const ENEMIES = {
  raider: {
    name: 'Raider', role: 'Raider', hp: 62, attack: 7, armor: 1, range: 1, speed: 2.05,
    cooldown: 1.15, pop: 0, color: '#8f3f34', desc: 'A hungry marauder with a notched axe.'
  },
  skirmisher: {
    name: 'Skirmisher', role: 'Raider', hp: 50, attack: 6, armor: 0, range: 4.9, speed: 2.0,
    cooldown: 1.5, pop: 0, color: '#8d543c', desc: 'Throws javelins from the edge of the fray.'
  },
  brute: {
    name: 'Brute', role: 'Elite', hp: 190, attack: 15, armor: 3, range: 1, speed: 1.65,
    cooldown: 1.35, pop: 0, color: '#71352f', desc: 'A towering butcher wrapped in scrap iron.'
  },
  warlord: {
    name: 'The Warlord', role: 'Warlord', hp: 1550, attack: 28, armor: 4, range: 1.45, speed: 1.9,
    cooldown: 1.0, pop: 0, color: '#5d2021', boss: true, desc: 'The hand behind every torch on the horizon.'
  }
};

export const BUILDINGS = {
  towncenter: {
    name: 'Town Center', size: 4, hp: 2600, armor: 4, cost: {}, build: 0, age: 0,
    desc: 'The heart of your realm. Trains villagers, accepts resources, and looses arrows.'
  },
  house: {
    name: 'House', size: 2, hp: 520, armor: 2, cost: { wood: 25 }, build: 8, age: 0, pop: 5,
    desc: 'A warm hearth and a stout roof. Raises population capacity by 5.'
  },
  farm: {
    name: 'Farm', size: 2, hp: 220, armor: 0, cost: { wood: 60 }, build: 8, age: 0, farmFood: 420,
    desc: 'A field of barley. Villagers harvest food here without leaving your walls.'
  },
  barracks: {
    name: 'Barracks', size: 3, hp: 1100, armor: 3, cost: { wood: 150 }, build: 18, age: 0,
    desc: 'Trains infantry. Advance your age to muster spearmen, knights, and champions.'
  },
  archery: {
    name: 'Archery Range', size: 3, hp: 950, armor: 2, cost: { wood: 150 }, build: 18, age: 1,
    desc: 'Trains archers. The butts and fletchers here keep the sky full of arrows.'
  },
  tower: {
    name: 'Watch Tower', size: 2, hp: 900, armor: 5, cost: { wood: 50, stone: 50 }, build: 14, age: 0,
    range: 7.2, attack: 9, cooldown: 1.15, desc: 'A stone eye above the treeline. Fires on approaching raiders.'
  }
};

export const WAVES = [
  {
    title: 'The First Night', subtitle: 'Bandits gather at the eastern ford.',
    prep: 70, composition: { raider: 3 }, interval: 3.2,
    note: 'Raiders are coming from the eastern ford. Raise a barracks and muster militia.'
  },
  {
    title: 'Ashes on the Wind', subtitle: 'The smoke of burning farms drifts closer.',
    prep: 58, composition: { raider: 5, skirmisher: 2 }, interval: 2.9,
    note: 'Skirmishers throw javelins. Close the distance with cavalry or answer with archers.'
  },
  {
    title: 'The Iron Tribute', subtitle: 'A brute leads a column through the water.',
    prep: 56, composition: { raider: 6, skirmisher: 2, brute: 1 }, interval: 2.7,
    note: 'Brutes soak arrow fire. Spearmen and concentrated volleys will bring them down.'
  },
  {
    title: 'A Red Moon Rises', subtitle: 'The ford churns with torchlight.',
    prep: 54, composition: { raider: 8, skirmisher: 4, brute: 2 }, interval: 2.3,
    note: 'The host is larger than before. Towers and a strong economy will decide the night.'
  },
  {
    title: 'The Shattered Crown', subtitle: 'The Warlord himself has come to claim your keep.',
    prep: 62, composition: { warlord: 1, raider: 8, skirmisher: 4, brute: 2 }, interval: 2.1,
    note: 'The Warlord is here. Hold the Town Center at all costs and strike him down.'
  }
];

export const BOONS = [
  {
    id: 'harvest', name: 'Harvest Tithe', rarity: 'Common', icon: 'wheat',
    desc: 'The granaries fill at your command. Receive 180 food and 80 wood immediately.',
    immediate: { food: 180, wood: 80 }
  },
  {
    id: 'royal-stipend', name: 'Royal Stipend', rarity: 'Common', icon: 'coin',
    desc: 'A loyal merchant delivers a chest from the capital. Receive 250 gold and 100 food.',
    immediate: { gold: 250, food: 100 }
  },
  {
    id: 'hearth', name: 'Blessing of the Hearth', rarity: 'Common', icon: 'heart',
    desc: 'Villagers gather all resources 18% faster and move 15% faster.',
    mods: { gather: 1.18, villagerSpeed: 1.15 }
  },
  {
    id: 'wolf', name: 'Banner of the Wolf', rarity: 'Rare', icon: 'sword',
    desc: 'Infantry gain 25% attack and 15% health. The shield wall advances.',
    mods: { infantryAttack: 1.25, infantryHp: 1.15 }
  },
  {
    id: 'fletcher', name: "Fletcher's Eye", rarity: 'Rare', icon: 'bow',
    desc: 'Archers gain 30% range and 20% attack. Every arrow finds a seam.',
    mods: { archerRange: 1.3, archerAttack: 1.2 }
  },
  {
    id: 'mason', name: 'Master Mason', rarity: 'Rare', icon: 'hammer',
    desc: 'Buildings gain 30% health. Advancing your age costs 20% less.',
    mods: { buildingHp: 1.3, ageCost: .8 }
  },
  {
    id: 'drums', name: 'War Drums', rarity: 'Rare', icon: 'drum',
    desc: 'All soldiers attack 15% faster and gain 1 armour.',
    mods: { attackSpeed: 1.15, armor: 1 }
  },
  {
    id: 'march', name: 'Forced March', rarity: 'Common', icon: 'boot',
    desc: 'All military units move 15% faster. Speed wins flanks.',
    mods: { unitSpeed: 1.15 }
  },
  {
    id: 'spoils', name: 'Spoils of War', rarity: 'Common', icon: 'skull',
    desc: 'Slain raiders yield 5 gold each. The battlefield pays for itself.',
    mods: { lootGold: 5 }
  },
  {
    id: 'twin-watch', name: 'Twin Watch', rarity: 'Rare', icon: 'tower',
    desc: 'Two Watch Towers are raised beside your Town Center, free of charge.',
    freeBuildings: [{ type: 'tower', count: 2 }]
  },
  {
    id: 'muster', name: 'Militia Muster', rarity: 'Common', icon: 'flag',
    desc: 'Two militia join your host now. One more militia arrives at the start of every wave.',
    freeUnits: [{ type: 'militia', count: 2 }], mods: { waveMilitia: 1 }
  },
  {
    id: 'knights', name: 'Old Alliance', rarity: 'Epic', icon: 'horse',
    desc: 'Two knights arrive from a neighbouring lord, along with 100 food and 100 gold.',
    freeUnits: [{ type: 'knight', count: 2 }], immediate: { food: 100, gold: 100 }
  },
  {
    id: 'champion', name: "Champion's Oath", rarity: 'Epic', icon: 'crown',
    desc: 'A champion swears to your banner. All soldiers gain 1 armour and 8% health.',
    freeUnits: [{ type: 'champion', count: 1 }], mods: { armor: 1, unitHp: 1.08 }
  },
  {
    id: 'swift-muster', name: 'Swift Muster', rarity: 'Rare', icon: 'hourglass',
    desc: 'Units train 30% faster. Reinforcement arrives before the dust settles.',
    mods: { trainSpeed: .7 }
  },
  {
    id: 'granary', name: 'Granary Stores', rarity: 'Common', icon: 'farm',
    desc: 'Farms yield 50% more food. Receive two free farms beside your keep.',
    mods: { farmYield: 1.5 }, freeBuildings: [{ type: 'farm', count: 2 }]
  },
  {
    id: 'relic', name: 'Relic of Fury', rarity: 'Epic', icon: 'flame',
    desc: 'Town Centers and towers fire one extra arrow and reload 40% faster.',
    mods: { extraArrows: 1, buildingReload: .6 }
  },
  {
    id: 'iron', name: 'Iron Discipline', rarity: 'Rare', icon: 'shield',
    desc: 'Every soldier gains 16% health and repairs 15 health after each wave.',
    mods: { unitHp: 1.16, waveHeal: 15 }
  },
  {
    id: 'wall', name: 'Stone Ward', rarity: 'Common', icon: 'stone',
    desc: 'Your Town Center gains 500 health and slowly mends itself between waves.',
    mods: { tcHp: 500, tcRegen: .12 }
  },
  {
    id: 'forest', name: 'Timber Rights', rarity: 'Common', icon: 'tree',
    desc: 'Woodcutters work 30% faster. Receive 120 wood immediately.',
    mods: { woodGather: 1.3 }, immediate: { wood: 120 }
  },
  {
    id: 'feast', name: "Hunters' Feast", rarity: 'Common', icon: 'meat',
    desc: 'Foragers gather food 30% faster. Receive 150 food immediately.',
    mods: { foodGather: 1.3 }, immediate: { food: 150 }
  },
  {
    id: 'gold', name: 'The Golden Vein', rarity: 'Rare', icon: 'gem',
    desc: 'Miners gather gold 35% faster. Receive 150 gold immediately.',
    mods: { goldGather: 1.35 }, immediate: { gold: 150 }
  },
  {
    id: 'population', name: 'Banner of the People', rarity: 'Rare', icon: 'people',
    desc: 'Population capacity rises by 15. No houses required.',
    mods: { popCap: 15 }
  }
];

export const META_UNLOCKS = [
  { renown: 40, name: 'Veteran\'s Banner', desc: 'Begin each campaign with an extra villager.', apply: { villagers: 1 } },
  { renown: 100, name: 'War Chest', desc: 'Begin each campaign with 100 extra wood and food.', apply: { wood: 100, food: 100 } },
  { renown: 200, name: 'Stone Ward', desc: 'Your Town Center begins with 20% more health.', apply: { tcHp: .2 } },
  { renown: 360, name: 'Mounted Patrol', desc: 'Begin each campaign with a second Outrider.', apply: { scouts: 1 } }
];

export const DIFFICULTY_LABELS = {
  calm: 'Calm', danger: 'Raiders abroad', battle: 'Battle joined'
};
