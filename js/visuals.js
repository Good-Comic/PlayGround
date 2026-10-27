const FAMILY_BY_CIV = {
  MNG: 'steppe', MAG: 'steppe',
  TEU: 'fortress', GOT: 'fortress', FRK: 'fortress', BRI: 'fortress', SPA: 'fortress', VIK: 'fortress',
  SAR: 'desert', PER: 'desert', TUR: 'desert', BYZ: 'desert',
  CHN: 'eastern', KOR: 'eastern', JPN: 'eastern',
  AZT: 'mesoamerican',
};

export const CIV_VISUAL_FAMILIES = Object.freeze({
  steppe: Object.freeze({ id: 'steppe', roof: 'swallowtail', kit: 'horsehair', emblem: 'diamond' }),
  fortress: Object.freeze({ id: 'fortress', roof: 'crenellated', kit: 'kite', emblem: 'chevron' }),
  desert: Object.freeze({ id: 'desert', roof: 'dome', kit: 'round', emblem: 'sun' }),
  eastern: Object.freeze({ id: 'eastern', roof: 'upturned', kit: 'lamellar', emblem: 'bars' }),
  mesoamerican: Object.freeze({ id: 'mesoamerican', roof: 'stepped', kit: 'feathered', emblem: 'step' }),
});

export function civilizationVisualProfile(civId) {
  return CIV_VISUAL_FAMILIES[FAMILY_BY_CIV[civId] || 'fortress'];
}

export function civilizationVisualFamily(civId) {
  return civilizationVisualProfile(civId).id;
}

const DIRECTIONS = ['E', 'SE', 'S', 'SW', 'W', 'NW', 'N', 'NE'];

export function visualDirectionFromVector(dx, dy, fallback = 'SE') {
  if (!Number.isFinite(dx) || !Number.isFinite(dy) || Math.hypot(dx, dy) < 1e-6) return fallback;
  const screenX = dx - dy, screenY = (dx + dy) * 0.5;
  const octant = Math.round(Math.atan2(screenY, screenX) / (Math.PI / 4));
  return DIRECTIONS[(octant + 8) % 8];
}

export function directionalAnimationFrame(unit) {
  const direction = DIRECTIONS.includes(unit?.visualDirection) ? unit.visualDirection : (unit?.facing < 0 ? 'W' : 'E');
  const mirror = ['W', 'NW', 'SW'].includes(direction) ? -1 : 1;
  const depthScale = ['N', 'S'].includes(direction) ? 0.92 : ['NE', 'NW', 'SE', 'SW'].includes(direction) ? 0.97 : 1;
  const state = !unit?.alive && unit?.deathAnim > 0 ? 'death' : unit?.hitFlash > 0 ? 'hit' : unit?.attackAnim > 0 ? 'attack' : ['move', 'return', 'build', 'gather'].includes(unit?.state) ? 'walk' : 'idle';
  return { direction, mirror, depthScale, state };
}
