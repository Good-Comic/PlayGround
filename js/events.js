export const EVENT_MODULES = {
  FLANK: {
    id: 'FLANK', name: 'Flank', desc: 'A second force arrives from another gate.',
    tags: [], mods: {}, extra: 'flank',
  },
  RAID: {
    id: 'RAID', name: 'Raiding Party', desc: 'Raiders prioritize villagers and farms.',
    tags: ['raid'], mods: {},
  },
  SHIELD: {
    id: 'SHIELD', name: 'Shield Wall', desc: 'Enemy armor increases by 2.',
    tags: [], mods: { armorBonus: 2 },
  },
  KITE: {
    id: 'KITE', name: 'Kite', desc: 'Ranged raiders retreat from melee pressure.',
    tags: ['kite'], mods: {},
  },
  SIEGE: {
    id: 'SIEGE', name: 'Siege Train', desc: 'Siege units deal +50% damage to buildings.',
    tags: [], mods: { buildingDamageMul: 1.5 },
  },
  BREACH: {
    id: 'BREACH', name: 'Breach', desc: 'Enemies seek the weakest building.',
    tags: ['breach'], mods: { buildingDamageMul: 1.25 },
  },
  SMOKE: {
    id: 'SMOKE', name: 'Smoke Screen', desc: 'Smoke reduces player ranged range by 2.',
    tags: [], mods: {}, zone: 'smoke',
  },
  CONVOY: {
    id: 'CONVOY', name: 'Supply Convoy', desc: 'Enemies slowly regenerate health.',
    tags: [], mods: { regen: 0.012 },
  },
  NET: {
    id: 'NET', name: 'Snare Nets', desc: 'Snare fields slow player units.',
    tags: [], mods: {}, zone: 'net',
  },
  LURE: {
    id: 'LURE', name: 'Lure', desc: 'The enemy front line feints a retreat.',
    tags: ['lure'], mods: {},
  },
  DUEL: {
    id: 'DUEL', name: "Champion's Duel", desc: 'A champion leads the raid; slaying it shields your hero.',
    tags: ['duel'], mods: {},
  },
  RELAY: {
    id: 'RELAY', name: 'Relay Runners', desc: 'Enemy movement speed increases by 15%.',
    tags: [], mods: { speedMul: 1.15 },
  },
  FEINT: {
    id: 'FEINT', name: 'Feint', desc: 'A diversion force arrives late from another gate.',
    tags: ['feint'], mods: {}, extra: 'feint',
  },
  BLOCK: {
    id: 'BLOCK', name: 'Block', desc: 'Enemies hold the approach with heavier armor.',
    tags: [], mods: { armorBonus: 1, hpMul: 1.08 },
  },
  LAND: {
    id: 'LAND', name: 'Landing', desc: 'The whole raid lands at one unexpected gate.',
    tags: [], mods: {}, gateMode: 'single',
  },
  FIRE: {
    id: 'FIRE', name: 'Fire Arrows', desc: 'Ranged hits ignite fire zones.',
    tags: ['fire'], mods: {},
  },
  RALLY: {
    id: 'RALLY', name: 'Rally', desc: 'Enemy attack speed increases by 15%.',
    tags: [], mods: { attackSpeedMul: 1.15 },
  },
  SCOUT: {
    id: 'SCOUT', name: 'Scouts', desc: 'Enemy movement speed increases by 25%.',
    tags: [], mods: { speedMul: 1.25 },
  },
  DRAIN: {
    id: 'DRAIN', name: 'Drain', desc: 'A drain field halves player gathering speed.',
    tags: [], mods: {}, zone: 'drain',
  },
  BELL: {
    id: 'BELL', name: 'Bell', desc: 'Reinforcements arrive late in the raid.',
    tags: [], mods: {}, extra: 'bell',
  },
  HUNT: {
    id: 'HUNT', name: 'Hunt', desc: 'Raiders hunt cavalry and villagers.',
    tags: ['hunt'], mods: {},
  },
  SAPPER: {
    id: 'SAPPER', name: 'Sappers', desc: 'Infantry deals double damage to buildings.',
    tags: ['sapper'], mods: { buildingDamageMul: 2 },
  },
  MORALE: {
    id: 'MORALE', name: 'Morale', desc: 'Wounded enemies retreat once.',
    tags: ['morale'], mods: {},
  },
  WARD: {
    id: 'WARD', name: 'Ward', desc: 'Enemies gain +3 armor and resist conversion.',
    tags: ['ward'], mods: { armorBonus: 3, convertResist: true },
  },
};

export const EVENT_MATRIX = {
  MNG: ['FLANK', 'KITE', 'RAID', 'FEINT', 'LAND', 'HUNT', 'RELAY', 'SMOKE', 'FLANK', 'DUEL'],
  TEU: ['SHIELD', 'BLOCK', 'SIEGE', 'WARD', 'BREACH', 'RALLY', 'SAPPER', 'SHIELD', 'CONVOY', 'DUEL'],
  GOT: ['RAID', 'FEINT', 'RALLY', 'HUNT', 'MORALE', 'FLANK', 'SAPPER', 'RAID', 'FEINT', 'DUEL'],
  FRK: ['SHIELD', 'RALLY', 'SIEGE', 'BREACH', 'DUEL', 'HUNT', 'BLOCK', 'SHIELD', 'FLANK', 'DUEL'],
  SAR: ['KITE', 'SMOKE', 'DRAIN', 'FIRE', 'NET', 'RELAY', 'LURE', 'SCOUT', 'DRAIN', 'DUEL'],
  AZT: ['RAID', 'MORALE', 'HUNT', 'RALLY', 'FEINT', 'SHIELD', 'RAID', 'DUEL', 'FLANK', 'DUEL'],
  BRI: ['KITE', 'SMOKE', 'NET', 'SIEGE', 'FIRE', 'SCOUT', 'KITE', 'RALLY', 'FIRE', 'DUEL'],
  CHN: ['KITE', 'FIRE', 'NET', 'RELAY', 'SIEGE', 'SMOKE', 'KITE', 'FIRE', 'SAPPER', 'DUEL'],
  PER: ['SHIELD', 'SIEGE', 'BREACH', 'RALLY', 'BLOCK', 'WARD', 'SHIELD', 'SIEGE', 'CONVOY', 'DUEL'],
  KOR: ['SHIELD', 'BLOCK', 'SIEGE', 'WARD', 'SMOKE', 'NET', 'BELL', 'SHIELD', 'FIRE', 'DUEL'],
  SPA: ['RALLY', 'RAID', 'SIEGE', 'DUEL', 'SHIELD', 'HUNT', 'SAPPER', 'RALLY', 'BREACH', 'DUEL'],
  TUR: ['KITE', 'FIRE', 'SIEGE', 'SMOKE', 'SAPPER', 'BREACH', 'FIRE', 'KITE', 'SIEGE', 'DUEL'],
  BYZ: ['SHIELD', 'WARD', 'BLOCK', 'SIEGE', 'BREACH', 'RALLY', 'CONVOY', 'SHIELD', 'SAPPER', 'DUEL'],
  VIK: ['RAID', 'FLANK', 'HUNT', 'MORALE', 'FEINT', 'LAND', 'RAID', 'FLANK', 'HUNT', 'DUEL'],
  MAG: ['KITE', 'HUNT', 'FEINT', 'FLANK', 'SCOUT', 'RAID', 'LURE', 'HUNT', 'FLANK', 'DUEL'],
  JPN: ['SHIELD', 'RALLY', 'BLOCK', 'DUEL', 'MORALE', 'KITE', 'SAPPER', 'SHIELD', 'FLANK', 'DUEL'],
};

export function eventFor(civId, waveIndex) {
  const row = EVENT_MATRIX[civId] || EVENT_MATRIX.TEU;
  return EVENT_MODULES[row[waveIndex] || 'SHIELD'];
}

export const EVENT_INSTANCES = Object.entries(EVENT_MATRIX).flatMap(([civId, row]) =>
  row.map((eventId, waveIndex) => ({
    id: `${civId}-${String(waveIndex + 1).padStart(2, '0')}`,
    civId,
    waveIndex,
    eventId,
  })));
