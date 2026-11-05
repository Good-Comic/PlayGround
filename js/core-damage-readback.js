import { t } from './i18n.js';

const current = (g, u) => !!u && (g.units.includes(u) || g.buildings.includes(u));
const known = (g, u) => !!u?.alive && u.team === 'enemy' && current(g, u) && g.isVisible(u);
const arrows = ['→', '↘', '↓', '↙', '←', '↖', '↑', '↗'];

// Observe the native damage operation, never recompute, replace or catch it.
// Observer failures are isolated so lethal hits and defeat still finish normally.
export function observeCoreDamage(g) {
  let last = null, peak = null, events = 0, faults = 0;
  const damage = g.applyDamage;
  g.applyDamage = function (target, amount, source, kind, ...rest) {
    let before = null;
    try {
      if (target?.alive && target.type === 'core' && target.team === 'player' && target === g.getTownCenter()) {
        before = { hp: target.hp, world: g.world, wave: g.waveIndex, source: null, direction: null };
        if (known(g, source)) {
          before.source = source;
          // A visible melee attacker's position at impact, not projectile origin.
          if (kind === 'melee') {
            const p = g.screenPos(source.x + (source.w || 0) / 2, source.y + (source.h || 0) / 2);
            const q = g.screenPos(target.x + target.w / 2, target.y + target.h / 2);
            before.direction = arrows[(Math.round(Math.atan2(p.y - q.y, p.x - q.x) / (Math.PI / 4)) + 8) % 8];
          }
        }
      }
    } catch { faults++; }
    const result = damage.call(this, target, amount, source, kind, ...rest);
    try {
      if (before && g.world === before.world) {
        const loss = Math.max(0, before.hp) - Math.max(0, target.hp);
        if (Number.isFinite(loss) && loss > 0) {
          last = { ...before, core: target, loss, at: g.runTime }; events++;
          // Two transient events only. This is one native HP loss, not DPS or a
          // source ranking; loaded history before observation remains unknown.
          if (!peak || peak.world !== g.world || peak.wave !== before.wave || loss > peak.loss) peak = last;
        }
      }
    } catch { faults++; }
    return result;
  };
  const clear = () => { last = null; peak = null; };
  for (const method of ['newRun', 'restore']) {
    const native = g[method];
    g[method] = function (...args) { const result = native.apply(this, args); clear(); return result; };
  }
  const view = () => {
    if (!last || last.world !== g.world || last.wave !== g.waveIndex || !last.core.alive || last.core !== g.getTownCenter() || !['prep', 'wave'].includes(g.phase)) { clear(); return null; }
    const expose = row => {
      // Validate each attribution independently. Losing sight is permanent for
      // this event; a later visible hit cannot reveal an older hidden source.
      try { if (row.source && !known(g, row.source)) { row.source = null; row.direction = null; } }
      catch { faults++; row.source = null; row.direction = null; }
      let name = null, sourceId = null;
      try { if (row.source) { sourceId = row.source.id; name = t((row.source.w ? 'building.' : 'unit.') + row.source.type + '.name'); } }
      catch { faults++; row.source = null; row.direction = null; sourceId = null; }
      return { loss: row.loss, at: row.at, sourceId, name, direction: row.direction };
    };
    const latest = expose(last);
    return { ...latest, peak: peak === last ? latest : expose(peak) };
  };
  return { view, clear, diagnostics: () => ({ events, faults, lastLoss: last?.loss ?? null }) };
}

export function coreDamageText(view) {
  if (!view) return '';
  const displayLoss = loss => loss < .01 ? '<0.01' : Number(loss.toFixed(2));
  const text = (row, key) => {
    const damage = displayLoss(row.loss);
    const time = Math.floor(row.at / 60) + ':' + String(Math.floor(row.at % 60)).padStart(2, '0');
    const source = !row.name ? t('coreDamage.unknown') : row.name + (row.direction ? ' · ' + t('coreDamage.direction', { arrow: row.direction }) : '');
    return t('coreDamage.' + key, { damage, source, time });
  };
  const extra = view.peak?.loss > view.loss && displayLoss(view.peak.loss) !== displayLoss(view.loss);
  return text(view, 'hit') + (extra ? '\n' + text(view.peak, 'peak') : '');
}

export function installCoreDamageReadback(g, ui) {
  const observer = observeCoreDamage(g), note = document.createElement('p');
  note.id = 'core-damage-readback'; note.hidden = true; note.setAttribute('role', 'status');
  const root = document.querySelector('#battle-actions'); root.insertBefore(note, root.querySelector('.battle-hint'));
  let lastPaint = 0, shownSourceId = null, shownPeakSourceId = null;
  const update = (force = false) => {
    const view = observer.view();
    // Identity loss bypasses the text throttle in the same native UI update.
    const invalidated = !!note.textContent && (!view || shownSourceId !== view.sourceId || shownPeakSourceId !== view.peak?.sourceId);
    if (!force && !invalidated && performance.now() - lastPaint < 100) return; lastPaint = performance.now();
    const text = coreDamageText(view); shownSourceId = view?.sourceId ?? null; shownPeakSourceId = view?.peak?.sourceId ?? null;
    if (note.textContent !== text) note.textContent = text;
    if (note.hidden !== !text) note.hidden = !text;
    const title = t('coreDamage.help') + ' ' + t('coreDamage.peakHelp'); if (note.title !== title) note.title = title;
  };
  const original = ui.update.bind(ui); ui.update = (...args) => { original(...args); update(); };
  document.addEventListener('localechange', () => update(true)); update(true);
  return { ...observer, update };
}
