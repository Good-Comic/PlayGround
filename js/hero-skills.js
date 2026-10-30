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
  if (zone?.kind !== 'boss' || !Number.isFinite(zone.delay) || zone.delay <= 0 || !Number.isFinite(zone.elapsed) || !Number.isFinite(zone.r) || zone.r < 0) return null;
  const marshal = zone.source?.type === 'warlord2';
  // 只讀模擬倒數；毫秒取樣供顯示，不更動傷害時間。 / Read simulation countdown; millisecond display sampling never changes strike timing.
  const remaining = zone.done ? 0 : Math.max(0, Math.min(zone.delay, zone.delay - zone.elapsed));
  const countdownText = zone.done ? null : `${(remaining > 0 ? Math.max(1, Math.ceil(Math.round(remaining * 1000) / 100)) / 10 : 0).toFixed(1)}s`;
  return {
    remaining, countdownText, urgent: !zone.done && remaining > 0 && remaining <= .5,
    progress: Math.max(0, Math.min(1, zone.elapsed / zone.delay)),
    fade: zone.done ? Math.max(0, 1 - (zone.elapsed - zone.delay) / .9) : 1,
    tint: marshal ? '176,123,226' : '235,126,62',
    spokes: marshal ? 8 : 6,
    // iso(x,y)=(32(x-y),16(x+y)); Euclidean world circles need sqrt(2).
    radiusX: zone.r * 32 * Math.SQRT2,
    radiusY: zone.r * 16 * Math.SQRT2,
  };
}
