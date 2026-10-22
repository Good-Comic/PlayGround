import { UNIT_TYPES } from './data.js';
import { clamp, hash2 } from './utils.js';
import { t } from './i18n.js';

const TACTICS = [
  { id: 'ranged', label: 'Screen the Archers', counter: 'knight' },
  { id: 'cavalry', label: 'Brace the Line', counter: 'spearman' },
  { id: 'tower', label: 'Sunder the Towers', counter: 'ram' },
  { id: 'map', label: 'Contest the Frontier', counter: 'marauder' },
  { id: 'worker', label: 'Harry the Villagers', counter: 'raider' },
];

const CIV_PREFERENCE = {
  MNG: { cavalry: .9, map: .75, worker: .62 },
  TEU: { tower: .92, worker: .4 },
  GOT: { worker: .82, map: .46 },
  FRK: { cavalry: .96, map: .38 },
  SAR: { ranged: .76, map: .74, worker: .58 },
  AZT: { worker: .74, cavalry: .48 },
  BRI: { ranged: .98, tower: .52 },
  CHN: { ranged: .92, map: .48 },
  PER: { cavalry: .78, worker: .5 },
  KOR: { tower: .98, map: .4 },
  SPA: { worker: .7, map: .52 },
  TUR: { ranged: .94, tower: .44 },
  BYZ: { tower: .82, map: .48 },
  VIK: { map: .8, worker: .7 },
  MAG: { ranged: .82, cavalry: .66 },
  JPN: { tower: .7, worker: .52 },
};

const BASE_PREFERENCE = { ranged: .35, cavalry: .35, tower: .35, map: .35, worker: .35 };
const ACT_ONE_END = 5;

function unitThreat(type) {
  const def = UNIT_TYPES[type];
  if (!def) return 1;
  const cost = def.cost || {};
  return Math.max(1,
    (cost.food || 0) + (cost.wood || 0) * .8 + (cost.gold || 0) * 1.15 + (cost.stone || 0) +
    (def.hp || 0) * .16 + (def.attack || 0) * 1.4 + (def.boss ? 420 : 0));
}

function cloneSpawns(spawns) {
  return spawns.map(group => ({ ...group, units: { ...group.units } }));
}

function sumUnits(spawns) {
  return spawns.reduce((sum, group) => sum + Object.values(group.units).reduce((n, count) => n + count, 0), 0);
}

function sumThreat(spawns) {
  return spawns.reduce((sum, group) => sum + Object.entries(group.units)
    .reduce((n, [type, count]) => n + unitThreat(type) * count, 0), 0);
}

export class NemesisDirector {
  constructor(seed) {
    this.seed = seed >>> 0;
    this.previousSuppression = null;
    this.terrainAssistUsed = false;
    this.assistLog = [];
  }

  emptyStats() {
    return {
      rangedDamage: 0,
      cavalryDamage: 0,
      towerDamage: 0,
      totalDamage: 0,
      workerLosses: 0,
    };
  }

  recordDamage(source, amount) {
    if (!source || !amount || !Number.isFinite(amount)) return;
    const stats = this.stats;
    if (!stats) return;
    stats.totalDamage += amount;
    if (source.w) {
      if (source.type === 'tower') stats.towerDamage += amount;
      return;
    }
    const category = source.typeDef?.category;
    if (category === 'ranged') stats.rangedDamage += amount;
    else if (category === 'cavalry') stats.cavalryDamage += amount;
  }

  recordWorkerLoss() {
    if (this.stats) this.stats.workerLosses++;
  }

  beginWave() {
    this.stats = this.emptyStats();
  }

  finishWave(game) {
    const stats = this.stats || this.emptyStats();
    const safeTotal = Math.max(1, stats.totalDamage);
    const camps = game.world?.camps || [];
    let controlled = 0;
    for (const camp of camps) {
      const nearPlayer = game.units.some(u => u.alive && u.team === 'player' && Math.hypot(u.x - camp.x, u.y - camp.y) <= 9)
        || game.buildings.some(b => b.alive && b.team === 'player' && Math.hypot(b.x + b.w / 2 - camp.x, b.y + b.h / 2 - camp.y) <= 10);
      if (nearPlayer) controlled++;
    }
    const report = {
      wave: game.waveIndex,
      rangedShare: clamp(stats.rangedDamage / safeTotal, 0, 1),
      cavalryShare: clamp(stats.cavalryDamage / safeTotal, 0, 1),
      towerShare: clamp(stats.towerDamage / safeTotal, 0, 1),
      mapControl: camps.length ? controlled / camps.length : 0,
      workerLosses: stats.workerLosses,
      workerLossRatio: clamp(stats.workerLosses / 3, 0, 1),
      totalDamage: stats.totalDamage,
    };
    this.stats = null;
    return report;
  }

  scoreTactic(tactic, index, report, civ, waveIndex) {
    const pref = { ...BASE_PREFERENCE, ...(CIV_PREFERENCE[civ?.id] || {}) }[tactic.id] ?? BASE_PREFERENCE[tactic.id];
    let weakness = 0;
    if (report) {
      if (tactic.id === 'ranged') weakness = report.rangedShare;
      else if (tactic.id === 'cavalry') weakness = report.cavalryShare;
      else if (tactic.id === 'tower') weakness = report.towerShare;
      else if (tactic.id === 'map') weakness = report.mapControl;
      else if (tactic.id === 'worker') weakness = report.workerLossRatio;
    }
    const perturbation = hash2(waveIndex + 1, index + 3, this.seed);
    return clamp(pref * .5 + weakness * .3 + perturbation * .2, 0, 1);
  }

  planWave({ wave, waveIndex, civ, report, camps, prepSeconds = 30 }) {
    const scored = TACTICS.map((tactic, index) => ({
      tactic,
      score: this.scoreTactic(tactic, index, report, civ, waveIndex),
    })).sort((a, b) => b.score - a.score);
    const legal = scored.filter(entry => entry.tactic.id !== this.previousSuppression);
    const chosen = (legal[0] || scored[0]).tactic;
    this.previousSuppression = chosen.id;

    const actOne = waveIndex < ACT_ONE_END;
    const ratio = actOne ? .15 : .3;
    const spawns = cloneSpawns(wave.spawns);
    const baseThreat = sumThreat(spawns);
    const baseUnits = sumUnits(spawns);
    const targetCount = Math.max(0, Math.floor(baseUnits * ratio));
    let removedCount = 0;
    let addedCount = 0;

    while (removedCount < targetCount) {
      const groups = spawns.map((group, index) => ({
        group,
        index,
        count: Object.entries(group.units)
          .filter(([type, count]) => count > 0 && !UNIT_TYPES[type]?.boss && type !== chosen.counter)
          .reduce((sum, [, count]) => sum + count, 0),
      })).filter(entry => entry.count > 0).sort((a, b) => b.count - a.count || a.index - b.index);
      if (!groups.length) break;
      const group = groups[0].group;
      const removeType = Object.entries(group.units)
        .filter(([type, count]) => count > 0 && !UNIT_TYPES[type]?.boss && type !== chosen.counter)
        .sort((a, b) => b[1] - a[1] || unitThreat(a[0]) - unitThreat(b[0]))[0]?.[0];
      if (!removeType) break;
      group.units[removeType] -= 1;
      if (group.units[removeType] <= 0) delete group.units[removeType];
      group.units[chosen.counter] = (group.units[chosen.counter] || 0) + 1;
      removedCount++;
      addedCount++;
    }

    const totalUnits = sumUnits(spawns);
    const identityShare = baseUnits > 0 ? clamp(1 - removedCount / baseUnits, 0, 1) : 1;
    const gateUse = new Map();
    for (const group of spawns) {
      const count = Object.values(group.units).reduce((sum, n) => sum + n, 0);
      gateUse.set(group.gate, (gateUse.get(group.gate) || 0) + count);
    }
    const orderedGates = [...gateUse.entries()].sort((a, b) => b[1] - a[1]).map(([gate]) => gate);
    for (let gate = 0; gate < (camps?.length || 0); gate++) {
      if (!orderedGates.includes(gate)) orderedGates.push(gate);
      if (orderedGates.length >= 2) break;
    }
    const entropy = hash2(waveIndex + 2, 17, this.seed);
    if (orderedGates.length > 2 && entropy > .55) [orderedGates[1], orderedGates[2]] = [orderedGates[2], orderedGates[1]];
    const entrances = orderedGates.slice(0, 2).map((gate, index) => ({
      gate,
      name: t(`camp.${gate}`),
      certainty: index === 0 ? 'reported' : 'possible',
    }));
    const counts = {};
    for (const group of spawns) for (const [type, count] of Object.entries(group.units)) counts[type] = (counts[type] || 0) + count;
    const sortedTypes = Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([type]) => type);
    const mainUnits = sortedTypes.filter(type => !UNIT_TYPES[type]?.boss).slice(0, 3);
    const bossType = sortedTypes.find(type => UNIT_TYPES[type]?.boss);
    if (bossType) mainUnits.push(bossType);
    const hazard = !actOne && ['map', 'worker'].includes(chosen.id)
      ? { gates: entrances.map(entry => entry.gate), damage: 15, radius: 2.15, delay: 4.2, suppressed: false }
      : null;
    const intel = {
      waveIndex,
      prepSeconds,
      units: mainUnits,
      entrances,
      hazard,
      assist: null,
    };
    return {
      waveIndex,
      waveName: wave.name,
      tactic: chosen.id,
      tacticLabel: t(`tactic.${chosen.id}`),
      suppression: chosen.id,
      intensity: actOne ? 'low' : 'high',
      ratio,
      baseThreat,
      baseUnits,
      totalUnits,
      identityShare,
      removedCount,
      addedCount,
      spawns,
      hazard,
      intel,
    };
  }
}
