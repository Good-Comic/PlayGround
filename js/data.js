export const RESOURCES = ['food', 'wood', 'gold', 'stone'];

export const UNIT_TYPES = {
  villager: {
    name: 'Villager', role: 'Townfolk', icon: 'villager', hotkey: 'V',
    hp: 40, attack: 2, range: 0.65, speed: 2.35, cooldown: 1.35,
    radius: 0.24, sight: 5, cost: { food: 50 }, trainTime: 9, pop: 1,
    desc: 'Gathers resources and raises the kingdom’s works.',
  },
  militia: {
    name: 'Militiaman', role: 'Infantry', icon: 'sword', hotkey: 'M',
    hp: 72, attack: 8, range: 0.72, speed: 2.05, cooldown: 1.05,
    radius: 0.26, sight: 6.5, cost: { food: 60, gold: 20 }, trainTime: 8, pop: 1,
    desc: 'A shield of oak and iron. Sturdy, faithful, unforgiving.',
  },
  archer: {
    name: 'Longbowman', role: 'Archer', icon: 'bow', hotkey: 'A',
    hp: 46, attack: 7, range: 4.6, speed: 2.15, cooldown: 1.35,
    radius: 0.24, sight: 7.5, projectile: 'arrow', cost: { wood: 40, gold: 30 }, trainTime: 9, pop: 1,
    desc: 'Rain death from the treeline. Fragile if caught alone.',
  },
  knight: {
    name: 'Knight of Ash', role: 'Cavalry', icon: 'horse', hotkey: 'K',
    hp: 126, attack: 13, range: 0.8, speed: 2.9, cooldown: 1.05,
    radius: 0.34, sight: 8, cost: { food: 95, gold: 65 }, trainTime: 14, pop: 2,
    desc: 'The last oathsworn riders of the old crown.',
  },
  raider: {
    name: 'Ash Raider', role: 'Raider', icon: 'sword', enemy: true,
    hp: 52, attack: 6, range: 0.72, speed: 2.0, cooldown: 1.2,
    radius: 0.25, sight: 7, bounty: 5,
  },
  marauder: {
    name: 'Marauder', role: 'Raider', icon: 'sword', enemy: true,
    hp: 34, attack: 5, range: 4.0, speed: 1.95, cooldown: 1.5,
    radius: 0.24, sight: 7, projectile: 'arrow', bounty: 5,
  },
  brute: {
    name: 'Ashen Brute', role: 'Heavy', icon: 'hammer', enemy: true,
    hp: 128, attack: 14, range: 0.8, speed: 1.55, cooldown: 1.5,
    radius: 0.36, sight: 6.5, bounty: 9, scale: 1.18,
  },
  warlord: {
    name: 'Vask the Unburnt', role: 'Warlord', icon: 'skull', enemy: true,
    hp: 760, attack: 25, range: 1.05, speed: 1.65, cooldown: 1.25,
    radius: 0.5, sight: 9, bounty: 80, scale: 1.55, boss: true,
  },
};

export const BUILDING_TYPES = {
  towncenter: {
    name: 'Town Center', icon: 'crown', w: 3, h: 3, hp: 1800,
    cost: {}, buildTime: 0, pop: 5, dropoff: true, attack: 5, range: 6.2, cooldown: 1.9,
    desc: 'Heart of the realm. Trains villagers. Shelter it at all costs.',
  },
  house: {
    name: 'House', icon: 'house', w: 1, h: 1, hp: 360,
    cost: { wood: 50 }, buildTime: 7, pop: 5,
    desc: 'Raises population capacity by five.',
  },
  barracks: {
    name: 'Barracks', icon: 'sword', w: 2, h: 2, hp: 920,
    cost: { wood: 150 }, buildTime: 14,
    desc: 'Trains militiamen, longbowmen, and knights.',
  },
  tower: {
    name: 'Watchtower', icon: 'tower', w: 1, h: 1, hp: 680,
    cost: { wood: 80, stone: 40 }, buildTime: 12, attack: 9, range: 7.0, cooldown: 1.35,
    desc: 'Looses arrows at raiders within seven tiles.',
  },
  farm: {
    name: 'Wheat Farm', icon: 'farm', w: 2, h: 2, hp: 210,
    cost: { wood: 60 }, buildTime: 8, foodRate: 0.62,
    desc: 'A quiet field that yields food over time.',
  },
};

export const TRAINABLE = {
  towncenter: ['villager'],
  barracks: ['militia', 'archer', 'knight'],
};

export const COMMAND_ICONS = {
  villager: 'villager', militia: 'sword', archer: 'bow', knight: 'horse',
  house: 'house', barracks: 'sword', tower: 'tower', farm: 'farm',
  stop: 'stop', hold: 'hold',
};

export const BOONS = [
  {
    id: 'ironwood', name: 'Ironwood Axes', rarity: 'COMMON', icon: 'wood',
    desc: 'Woodcutters gather 35% faster and felled trees yield 25% more timber.',
    apply(g) { g.effects.woodMul *= 1.35; g.effects.woodYield *= 1.25; },
  },
  {
    id: 'harvest', name: 'Bountiful Harvest', rarity: 'COMMON', icon: 'food',
    desc: 'Food gathering is 30% faster. Wheat farms yield half again as much.',
    apply(g) { g.effects.foodMul *= 1.3; g.effects.farmMul *= 1.5; },
  },
  {
    id: 'prospector', name: 'The Prospector’s Eye', rarity: 'COMMON', icon: 'gold',
    desc: 'Gold gathering is 30% faster. Claim 180 gold immediately.',
    apply(g) { g.effects.goldMul *= 1.3; g.resources.gold += 180; },
  },
  {
    id: 'masonry', name: 'Master Masons', rarity: 'RARE', icon: 'stone',
    desc: 'Buildings gain 30% health and are erected 25% faster.',
    apply(g) {
      g.effects.buildingHpMul *= 1.3;
      g.effects.buildSpeedMul *= 1.25;
      for (const b of g.buildings) {
        if (b.team !== 'player') continue;
        const old = b.maxHp;
        b.maxHp = Math.round(b.maxHp * 1.3);
        b.hp += b.maxHp - old;
      }
    },
  },
  {
    id: 'fletching', name: 'Fletching of Ravens', rarity: 'RARE', icon: 'bow',
    desc: 'Longbowmen deal 30% more damage and shoot two tiles farther.',
    apply(g) { g.effects.archerDamageMul *= 1.3; g.effects.archerRange += 2; },
  },
  {
    id: 'wardrums', name: 'War Drums', rarity: 'RARE', icon: 'speed',
    desc: 'All soldiers attack 18% faster and march 8% faster.',
    apply(g) { g.effects.attackSpeedMul *= 1.18; g.effects.militarySpeedMul *= 1.08; },
  },
  {
    id: 'conscription', name: 'Levy of the Ashlands', rarity: 'COMMON', icon: 'hourglass',
    desc: 'Troops train 30% faster and cost 15% less gold.',
    apply(g) { g.effects.trainSpeedMul *= 1.3; g.effects.goldCostMul *= 0.85; },
  },
  {
    id: 'kingsguard', name: 'The King’s Guard', rarity: 'LEGENDARY', icon: 'shield',
    desc: 'Two knights of the old crown ride to your banner at once. All soldiers gain 12% health.',
    apply(g) {
      g.effects.militaryHpMul *= 1.12;
      for (const u of g.units) {
        if (u.team === 'player' && u.type !== 'villager') {
          const old = u.maxHp;
          u.maxHp = Math.round(u.maxHp * 1.12);
          u.hp += u.maxHp - old;
        }
      }
      g.spawnUnit('knight', g.world.base.x - 2, g.world.base.y + 4);
      g.spawnUnit('knight', g.world.base.x + 3, g.world.base.y + 3);
    },
  },
  {
    id: 'ealdorman', name: 'Wisdom of the Ealdorman', rarity: 'RARE', icon: 'villager',
    desc: 'Villagers move 20% faster and carry five more resources.',
    apply(g) { g.effects.villagerSpeedMul *= 1.2; g.effects.carryBonus += 5; },
  },
  {
    id: 'spoils', name: 'Spoils of War', rarity: 'COMMON', icon: 'coin',
    desc: 'Each slain raider yields 7 gold, and the treasury swells by 120 gold.',
    apply(g) { g.effects.bountyGold += 7; g.resources.gold += 120; },
  },
  {
    id: 'hearth', name: 'The Hearth Still Burns', rarity: 'LEGENDARY', icon: 'flame',
    desc: 'The Town Center slowly repairs itself and 180 food is delivered.',
    apply(g) { g.effects.tcRegen += 4; g.resources.food += 180; },
  },
  {
    id: 'towerwatch', name: 'Eyes of the Watch', rarity: 'RARE', icon: 'tower',
    desc: 'Watchtowers gain 30% range and damage. A free tower is raised beside the keep.',
    apply(g) {
      g.effects.towerRange += 2;
      g.effects.towerDamageMul *= 1.3;
      g.addBuilding('tower', Math.round(g.world.base.x - 5), Math.round(g.world.base.y - 1), true);
    },
  },
];

export const WAVES = [
  { name: 'The First Raid', sub: 'Smoke on the northern road' },
  { name: 'Burning Fields', sub: 'They come for the harvest' },
  { name: 'The Iron Tide', sub: 'No banner, no mercy' },
  { name: 'Shattered Oaths', sub: 'Traitors among the raiders' },
  { name: 'Warlord’s Reckoning', sub: 'Vask the Unburnt rides' },
];

export const WAVE_COMPOSITIONS = [
  { raider: 4, marauder: 1 },
  { raider: 5, marauder: 2, brute: 1 },
  { raider: 6, marauder: 3, brute: 2 },
  { raider: 7, marauder: 3, brute: 3 },
  { raider: 6, marauder: 3, brute: 2, warlord: 1 },
];

export const START_RESOURCES = { food: 360, wood: 380, gold: 210, stone: 150 };

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
