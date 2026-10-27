import { UNIT_TYPES } from './data.js';

// User-approved axes only: ordinary force counts and preparation windows.
// Normal is an identity transform, including the director RNG stream.
export const DIFFICULTIES = Object.freeze({
  easy: Object.freeze({ordinary: .8, preparation: 1.25}),
  normal: Object.freeze({ordinary: 1, preparation: 1}),
  hard: Object.freeze({ordinary: 1.2, preparation: .8}),
});
export const difficultyId = id => Object.hasOwn(DIFFICULTIES, id) ? id : 'normal';
export const preparationSeconds = (seconds, id) => seconds * DIFFICULTIES[difficultyId(id)].preparation;
export function applyDifficulty(plan, id) {
  const multiplier = DIFFICULTIES[difficultyId(id)].ordinary;
  if (multiplier === 1) return plan;
  // Round cumulative counts per type, not each spawn: small groups should not
  // make Hard identical to Normal or remove an entire enemy type on Easy.
  const totals = new Map();
  for (const spawn of plan.spawns) {
    for (const [type, count] of Object.entries(spawn.units)) {
      if (UNIT_TYPES[type]?.boss) continue;
      const before = totals.get(type) || 0, after = before + count;
      spawn.units[type] = Math.round(after * multiplier) - Math.round(before * multiplier);
      totals.set(type, after);
      if (!spawn.units[type]) delete spawn.units[type];
    }
  }
  plan.spawns = plan.spawns.filter(s => Object.values(s.units).some(n => n > 0));
  plan.totalUnits = plan.spawns.reduce((n,s) => n + Object.values(s.units).reduce((a,b) => a+b,0),0);
  plan.intel.units = [...new Set(plan.spawns.flatMap(s => Object.keys(s.units)))];
  return plan;
}

// A visible flank reinforcement changes positioning, not unit/Boss statistics.
// Added after difficulty scaling so the announced modifier is exact.
export function applyCycle(plan, cycle) {
  if (!(cycle > 1) || !plan.spawns.length) return plan;
  const first = plan.spawns[0];
  const gate = (first.gate + 2) % 4;
  const count = Math.min(3, cycle - 1);
  plan.spawns.push({at: 25, gate, units: {light_cavalry: count}, cycleFlank: true});
  plan.spawns.sort((a,b)=>a.at-b.at);
  plan.totalUnits += count;
  if (!plan.intel.units.includes('light_cavalry')) plan.intel.units.push('light_cavalry');
  if (!plan.intel.entrances.some(e => e.gate === gate)) plan.intel.entrances.push({gate, certainty: 'reported'});
  plan.intel.cycleModifier = {id: 'flank', count, at: 25, gate};
  return plan;
}
