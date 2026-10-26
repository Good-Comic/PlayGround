export const EVENT_MODULES = {
  FLANK: {
    id: 'FLANK', name: 'Flank', desc: 'A second force arrives from another gate.',
    tags: [], mods: {}, extra: 'flank',
  },
  RAID: {
    id: 'RAID', name: 'Raiding Party', desc: 'Cavalry prioritize visible supply camps within 8 tiles for 20 seconds.',
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
    id: 'SMOKE', name: 'Smoke Screen', desc: 'Smoke reduces both sides’ ranged range by 1, to a minimum of 2.',
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
    id: 'RELAY', name: 'Relay Runners', desc: 'Enemy movement speed increases by 10%.',
    tags: [], mods: { speedMul: 1.10 },
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
    id: 'RALLY', name: 'Rally', desc: 'Enemy attack speed increases by 10%.',
    tags: [], mods: { attackSpeedMul: 1.10 },
  },
  SCOUT: {
    id: 'SCOUT', name: 'Scouts', desc: 'Enemy movement speed increases by 25%.',
    tags: [], mods: { speedMul: 1.25 },
  },
  DRAIN: {
    id: 'DRAIN', name: 'Drain', desc: 'A drain field reduces gathering speed by 15%.',
    tags: [], mods: {}, zone: 'drain',
  },
  BELL: {
    id: 'BELL', name: 'Bell', desc: 'Reinforcements arrive late in the raid.',
    tags: [], mods: {}, extra: 'bell',
  },
  HUNT: {
    id: 'HUNT', name: 'Hunt', desc: 'Enemy spearmen chase only visible cavalry within 6 tiles.',
    tags: ['hunt'], mods: {},
  },
  SAPPER: {
    id: 'SAPPER', name: 'Sappers', desc: 'Infantry deals +50% damage to buildings.',
    tags: ['sapper'], mods: { buildingDamageMul: 1.5 },
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
  MNG: ['SCOUT', 'NET', 'RAID', 'KITE', 'DUEL', 'FLANK', 'HUNT', 'CONVOY', 'BREACH', 'RELAY'],
  TEU: ['SCOUT', 'KITE', 'SIEGE', 'SAPPER', 'DUEL', 'RAID', 'FIRE', 'BREACH', 'CONVOY', 'RALLY'],
  GOT: ['BLOCK', 'FIRE', 'SHIELD', 'MORALE', 'DUEL', 'CONVOY', 'SIEGE', 'DRAIN', 'WARD', 'RALLY'],
  FRK: ['HUNT', 'NET', 'BLOCK', 'DUEL', 'RALLY', 'RAID', 'WARD', 'DRAIN', 'SIEGE', 'SHIELD'],
  SAR: ['CONVOY', 'RAID', 'DRAIN', 'FEINT', 'DUEL', 'SAPPER', 'LAND', 'SMOKE', 'WARD', 'RALLY'],
  AZT: ['SCOUT', 'WARD', 'SMOKE', 'CONVOY', 'DUEL', 'FIRE', 'RAID', 'SIEGE', 'RELAY', 'SHIELD'],
  BRI: ['RAID', 'FEINT', 'NET', 'SHIELD', 'DUEL', 'LAND', 'SMOKE', 'BREACH', 'RALLY', 'HUNT'],
  CHN: ['SCOUT', 'SHIELD', 'KITE', 'RAID', 'DUEL', 'SAPPER', 'FIRE', 'FLANK', 'SIEGE', 'RELAY'],
  PER: ['HUNT', 'NET', 'FEINT', 'DRAIN', 'DUEL', 'RAID', 'LAND', 'WARD', 'SIEGE', 'RALLY'],
  KOR: ['RAID', 'SAPPER', 'SMOKE', 'SIEGE', 'DUEL', 'LAND', 'FEINT', 'BREACH', 'RELAY', 'SHIELD'],
  SPA: ['SCOUT', 'LAND', 'RAID', 'BELL', 'DUEL', 'FEINT', 'CONVOY', 'WARD', 'FIRE', 'RALLY'],
  TUR: ['SMOKE', 'RAID', 'FEINT', 'HUNT', 'DUEL', 'LAND', 'SHIELD', 'CONVOY', 'BREACH', 'RELAY'],
  BYZ: ['SAPPER', 'DRAIN', 'SIEGE', 'BREACH', 'DUEL', 'FLANK', 'FIRE', 'CONVOY', 'WARD', 'RALLY'],
  VIK: ['LAND', 'RAID', 'FEINT', 'MORALE', 'DUEL', 'FIRE', 'BLOCK', 'DRAIN', 'SIEGE', 'RELAY'],
  MAG: ['HUNT', 'NET', 'SHIELD', 'BLOCK', 'DUEL', 'SAPPER', 'DRAIN', 'FEINT', 'SIEGE', 'RALLY'],
  JPN: ['BELL', 'RAID', 'SMOKE', 'KITE', 'DUEL', 'LAND', 'FIRE', 'SAPPER', 'CONVOY', 'RELAY'],
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
