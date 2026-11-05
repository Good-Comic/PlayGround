import { t } from './i18n.js';

const current = (g, u) => !!u && (g.units.includes(u) || g.buildings.includes(u));
const known = (g, u) => !!u?.alive && u.team === 'enemy' && current(g, u) && g.isVisible(u);
const arrows = ['→', '↘', '↓', '↙', '←', '↖', '↑', '↗'];

// Observe the native damage operation, never recompute, replace or catch it.
// Observer failures are isolated so lethal hits and defeat still finish normally.
export function observeCoreDamage(g) {
  let last = null, events = 0, faults = 0;
  const damage = g.applyDamage;
  g.applyDamage = function (target, amount, source, kind, ...rest) {
    let before = null;
    try {
      if (target?.alive && target.type === 'core' && target.team === 'player' && target === g.getTownCenter()) {
        before = { hp: target.hp, world: g.world, source: null, direction: null };
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
        if (Number.isFinite(loss) && loss > 0) { last = { ...before, core: target, loss, at: g.runTime }; events++; }
      }
    } catch { faults++; }
    return result;
  };
  const clear = () => { last = null; };
  for (const method of ['newRun', 'restore']) {
    const native = g[method];
    g[method] = function (...args) { const result = native.apply(this, args); clear(); return result; };
  }
  const view = () => {
    if (!last || last.world !== g.world || !last.core.alive || last.core !== g.getTownCenter() || !['prep', 'wave'].includes(g.phase)) { clear(); return null; }
    // Losing sight permanently removes this transient attribution; no reacquire.
    try { if (last.source && !known(g, last.source)) { last.source = null; last.direction = null; } }
    catch { faults++; last.source = null; last.direction = null; }
    let name = null, sourceId = null;
    try {
      if (last.source) { sourceId = last.source.id; name = t((last.source.w ? 'building.' : 'unit.') + last.source.type + '.name'); }
    } catch { faults++; last.source = null; last.direction = null; sourceId = null; }
    return { loss: last.loss, at: last.at, sourceId, name, direction: last.direction };
  };
  return { view, clear, diagnostics: () => ({ events, faults, lastLoss: last?.loss ?? null }) };
}

export function coreDamageText(view) {
  if (!view) return '';
  const damage = view.loss < .01 ? '<0.01' : Number(view.loss.toFixed(2));
  const time = Math.floor(view.at / 60) + ':' + String(Math.floor(view.at % 60)).padStart(2, '0');
  const source = !view.name ? t('coreDamage.unknown') : view.name + (view.direction ? ' · ' + t('coreDamage.direction', { arrow: view.direction }) : '');
  return t('coreDamage.hit', { damage, source, time });
}

export function installCoreDamageReadback(g, ui) {
  const observer = observeCoreDamage(g), note = document.createElement('p');
  note.id = 'core-damage-readback'; note.hidden = true; note.setAttribute('role', 'status');
  const root = document.querySelector('#battle-actions'); root.insertBefore(note, root.querySelector('.battle-hint'));
  let lastPaint = 0, shownSourceId = null;
  const update = (force = false) => {
    const view = observer.view();
    // Identity loss bypasses the text throttle in the same native UI update.
    const invalidated = !!note.textContent && (!view || shownSourceId !== view.sourceId);
    if (!force && !invalidated && performance.now() - lastPaint < 100) return; lastPaint = performance.now();
    const text = coreDamageText(view); shownSourceId = view?.sourceId ?? null;
    if (note.textContent !== text) note.textContent = text;
    if (note.hidden !== !text) note.hidden = !text;
    const title = t('coreDamage.help'); if (note.title !== title) note.title = title;
  };
  const original = ui.update.bind(ui); ui.update = (...args) => { original(...args); update(); };
  document.addEventListener('localechange', () => update(true)); update(true);
  return { ...observer, update };
}
