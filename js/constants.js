export const TILE_W = 76;
export const TILE_H = 38;
export const MAP_SIZE = 16;
export const TOTAL_WAVES = 10;

export const RESOURCE_META = {
  food: { name: 'Food', icon: 'i-food', color: '#e6b95c' },
  wood: { name: 'Wood', icon: 'i-wood', color: '#a97845' },
  gold: { name: 'Gold', icon: 'i-gold', color: '#e8c562' },
  stone: { name: 'Stone', icon: 'i-stone', color: '#a8a49a' }
};

export const BUILD_DEFS = {
  towncenter: {
    name: 'Town Center', size: 3, hp: 2600, icon: 'i-crown', desc: 'The heart of your settlement',
    sub: 'Trains villagers · drop-off point', cost: {}
  },
  house: {
    name: 'House', size: 2, hp: 420, icon: 'i-house', desc: 'Shelter for your people',
    sub: '+5 population capacity', cost: { wood: 30 }, buildTime: 3
  },
  farm: {
    name: 'Farm', size: 2, hp: 260, icon: 'i-farm', desc: 'Fields that feed the town',
    sub: '+0.45 food per second', cost: { wood: 60 }, buildTime: 4
  },
  barracks: {
    name: 'Barracks', size: 2, hp: 700, icon: 'i-barracks', desc: 'Home of the militia',
    sub: 'Unlocks Militia training', cost: { wood: 100 }, buildTime: 5
  },
  range: {
    name: 'Archery Range', size: 2, hp: 620, icon: 'i-range', desc: 'Yew bows and steady hands',
    sub: 'Unlocks Archer training', cost: { wood: 120, stone: 20 }, buildTime: 5
  },
  tower: {
    name: 'Watch Tower', size: 1, hp: 580, icon: 'i-tower', desc: 'Eyes upon the tree line',
    sub: 'Fires arrows at nearby raiders', cost: { wood: 40, stone: 60 }, buildTime: 4,
    range: 5.6, damage: 13, cooldown: 1.35
  }
};

export const UNIT_DEFS = {
  villager: {
    name: 'Villager', icon: 'i-villager', hp: 45, speed: 1.38, pop: 1,
    cost: { food: 50 }, time: 4.5, desc: 'Gathers resources for the settlement',
    sub: 'Gathers food, wood, gold and stone'
  },
  militia: {
    name: 'Militia', icon: 'i-militia', hp: 88, speed: 1.5, pop: 1,
    cost: { food: 60, gold: 20 }, time: 5.2, damage: 10, range: 0.85, cooldown: 1.0,
    desc: 'Sturdy melee infantry', sub: 'Requires a Barracks'
  },
  archer: {
    name: 'Archer', icon: 'i-archer', hp: 56, speed: 1.44, pop: 1,
    cost: { food: 40, wood: 30 }, time: 5.2, damage: 8, range: 4.1, cooldown: 1.45,
    desc: 'Ranged support', sub: 'Requires an Archery Range'
  }
};

export const ENEMY_DEFS = {
  raider: {
    name: 'Raider', hp: 62, speed: 1.16, damage: 8, range: 0.85, cooldown: 1.05,
    bounty: 9, size: 1
  },
  skirmisher: {
    name: 'Skirmisher', hp: 46, speed: 1.24, damage: 6, range: 3.4, cooldown: 1.6,
    bounty: 11, size: 1
  },
  brute: {
    name: 'Brute', hp: 195, speed: 0.86, damage: 18, range: 0.95, cooldown: 1.35,
    bounty: 24, size: 1.25
  },
  ram: {
    name: 'Siege Ram', hp: 270, speed: 0.66, damage: 34, range: 1.1, cooldown: 1.7,
    bounty: 30, size: 1.3, buildingDamage: 60
  }
};

export const DIFFICULTIES = {
  squire: { name: 'Squire', enemies: 0.78, hp: 0.85, damage: 0.86, prep: 12, desc: 'A gentler realm' },
  knight: { name: 'Knight', enemies: 1, hp: 1, damage: 1, prep: 0, desc: 'A fair fight' },
  emperor: { name: 'Emperor', enemies: 1.28, hp: 1.14, damage: 1.16, prep: -6, desc: 'No mercy' }
};

export const BOONS = [
  {
    id: 'harvest', name: 'Golden Harvest', icon: 'i-food', rarity: 'Common', max: 3,
    desc: 'Your villagers gather food 30% faster. Full granaries make bold soldiers.',
    apply: g => { g.mods.foodGather *= 1.3; }
  },
  {
    id: 'forestry', name: "Forester's Axe", icon: 'i-wood', rarity: 'Common', max: 3,
    desc: 'Your villagers gather wood 30% faster. The forest gives freely.',
    apply: g => { g.mods.woodGather *= 1.3; }
  },
  {
    id: 'prospector', name: 'Deep Veins', icon: 'i-gold', rarity: 'Common', max: 3,
    desc: 'Gold and stone gather 30% faster. The mountain opens its heart.',
    apply: g => { g.mods.mineGather *= 1.3; }
  },
  {
    id: 'drills', name: 'Militia Drills', icon: 'i-militia', rarity: 'Rare', max: 2,
    desc: 'Militia gain +25% attack and +12% hit points.',
    apply: g => { g.mods.militiaDamage *= 1.25; g.mods.militiaHp *= 1.12; g.refreshUnitStats('militia'); }
  },
  {
    id: 'fletching', name: 'Fletching', icon: 'i-archer', rarity: 'Rare', max: 2,
    desc: 'Archers gain +30% damage and +1 tile of range.',
    apply: g => { g.mods.archerDamage *= 1.3; g.mods.archerRange += 1; g.refreshUnitStats('archer'); }
  },
  {
    id: 'masonry', name: 'Stone Masonry', icon: 'i-house', rarity: 'Common', max: 2,
    desc: 'All buildings gain +35% maximum hit points and are repaired to full.',
    apply: g => {
      g.mods.buildingHp *= 1.35;
      for (const b of g.buildings) {
        const ratio = b.hp / b.maxHp;
        b.maxHp = Math.round(b.maxHp * 1.35);
        b.hp = Math.round(b.maxHp * ratio);
      }
    }
  },
  {
    id: 'towers', name: 'Eagle Eyes', icon: 'i-tower', rarity: 'Rare', max: 2,
    desc: 'Watch Towers deal +50% damage and shoot 1 tile farther.',
    apply: g => { g.mods.towerDamage *= 1.5; g.mods.towerRange += 1; }
  },
  {
    id: 'swift', name: 'Fleet Footed', icon: 'i-shield', rarity: 'Common', max: 2,
    desc: 'All of your units move 15% faster.',
    apply: g => { g.mods.speed *= 1.15; }
  },
  {
    id: 'bloodlust', name: 'Bloodlust', icon: 'i-flame', rarity: 'Rare', max: 1,
    desc: 'Your soldiers recover 10 hit points whenever they slay an enemy.',
    apply: g => { g.mods.lifesteal += 10; }
  },
  {
    id: 'bounty', name: 'Raider Bounty', icon: 'i-gold', rarity: 'Common', max: 2,
    desc: 'Every slain raider yields an additional 14 gold.',
    apply: g => { g.mods.bounty += 14; }
  },
  {
    id: 'reinforcements', name: 'Reinforcements', icon: 'i-militia', rarity: 'Rare', max: 1,
    desc: 'Two militia join at once, and one more musters before every wave.',
    apply: g => { g.mods.reinforcement += 1; g.spawnFreeMilitia(2); }
  },
  {
    id: 'fertility', name: 'Fertility Rites', icon: 'i-pop', rarity: 'Rare', max: 2,
    desc: 'Two villagers join at once, and another arrives at the start of each wave.',
    apply: g => { g.mods.fertility += 1; g.spawnFreeVillagers(2); }
  },
  {
    id: 'townarrows', name: 'Arrows from the Keep', icon: 'i-arrow', rarity: 'Legendary', max: 1,
    desc: 'Your Town Center fires arrows at any raider who dares draw near.',
    apply: g => { g.mods.tcArrows = true; }
  },
  {
    id: 'granary', name: 'Royal Granary', icon: 'i-farm', rarity: 'Common', max: 2,
    desc: 'Farms produce 60% more food and your stores gain 120 food immediately.',
    apply: g => { g.mods.farmRate *= 1.6; g.addResource('food', 120); }
  },
  {
    id: 'conscription', name: 'Conscription', icon: 'i-clock', rarity: 'Rare', max: 2,
    desc: 'All units train 25% faster. The rally square never sleeps.',
    apply: g => { g.mods.trainTime *= 0.75; }
  },
  {
    id: 'royalgrant', name: 'Royal Grant', icon: 'i-crown', rarity: 'Common', max: 3,
    desc: 'The crown sends 180 food, 140 wood, 90 gold and 50 stone.',
    apply: g => { g.addResource('food', 180); g.addResource('wood', 140); g.addResource('gold', 90); g.addResource('stone', 50); }
  },
  {
    id: 'ironclad', name: 'Iron Discipline', icon: 'i-shield', rarity: 'Legendary', max: 1,
    desc: 'All of your soldiers gain +25% hit points and attack.',
    apply: g => {
      g.mods.soldierHp *= 1.25; g.mods.soldierDamage *= 1.25;
      for (const u of g.units) if (u.team === 'player' && u.kind !== 'villager') {
        u.maxHp = Math.round(u.maxHp * 1.25); u.hp = Math.round(u.hp * 1.25);
        u.damage = Math.round(u.damage * 1.25);
      }
    }
  },
  {
    id: 'zeal', name: 'Zealotry', icon: 'i-flame', rarity: 'Rare', max: 2,
    desc: 'Your soldiers attack 18% faster.',
    apply: g => { g.mods.attackSpeed *= 1.18; }
  }
];

export const TITLE_BEST_KEY = 'aoe2rogue.bestWave';
export const SOUND_KEY = 'aoe2rogue.muted';
