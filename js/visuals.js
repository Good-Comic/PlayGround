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
