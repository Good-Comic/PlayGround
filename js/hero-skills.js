// Shared production rules and read-only presentation; no gameplay RNG or timers added.
export const HERO_SKILLS = Object.freeze({
  mark: Object.freeze({ radius: 9, duration: 6, cooldown: 30, rangeColor: '229,160,74' }),
  aegis: Object.freeze({ radius: 5, duration: 5, cooldown: 60, rangeColor: '147,197,220' }),
});

export function heroCastVisual(unit) {
  if (!unit?.alive || unit.type !== 'commander') return null;
  const active = Object.entries(HERO_SKILLS).flatMap(([id, skill]) => {
    const remaining = unit[id === 'mark' ? 'markCd' : 'aegisCd'];
    const elapsed = skill.cooldown - remaining;
    return Number.isFinite(elapsed) && remaining > 0 && elapsed >= 0 && elapsed < .6
      ? [{ id, progress: elapsed / .6, color: skill.rangeColor }] : [];
  });
  return active.sort((a, b) => a.progress - b.progress)[0] || null;
}

export function bossStrikeVisual(zone) {
  if (zone?.kind !== 'boss' || !Number.isFinite(zone.delay) || zone.delay <= 0 || !Number.isFinite(zone.elapsed)) return null;
  const marshal = zone.source?.type === 'warlord2';
  return {
    progress: Math.max(0, Math.min(1, zone.elapsed / zone.delay)),
    fade: zone.done ? Math.max(0, 1 - (zone.elapsed - zone.delay) / .9) : 1,
    tint: marshal ? '176,123,226' : '235,126,62',
    spokes: marshal ? 8 : 6,
  };
}
