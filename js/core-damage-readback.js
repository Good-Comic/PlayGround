import { t, getLocale } from './i18n.js';
import { battleCanAct } from './battle-actions.js';
import { selectedAttackers, attackSelectedVisibleTarget, focusVisibleTarget } from './manual-target.js';

const current = (g, u) => !!u && (g.units.includes(u) || g.buildings.includes(u));
const known = (g, u) => !!u?.alive && u.team === 'enemy' && current(g, u) && g.isVisible(u);
const arrows = ['→', '↘', '↓', '↙', '←', '↖', '↑', '↗'];

// Observe the native damage operation, never recompute, replace or catch it.
// Observer failures are isolated so lethal hits and defeat still finish normally.
export function observeCoreDamage(g) {
  let last = null, peak = null, events = 0, faults = 0;
  let records = new WeakMap(), leases = new WeakMap();
  const retire = row => { if (row && row !== last && row !== peak) records.delete(row.token); };
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
          const oldLast = last, oldPeak = peak, token = Object.freeze({});
          last = { ...before, core: target, loss, at: g.runTime, token };
          records.set(token, last); events++;
          // Two transient events only. This is one native HP loss, not DPS or a
          // source ranking; loaded history before observation remains unknown.
          if (!peak || peak.world !== g.world || peak.wave !== before.wave || loss > peak.loss) peak = last;
          retire(oldLast); retire(oldPeak);
        }
      }
    } catch { faults++; }
    return result;
  };
  const clear = () => { last = null; peak = null; records = new WeakMap(); leases = new WeakMap(); };
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
      return { loss: row.loss, at: row.at, sourceId, name, direction: row.direction, token: row.token };
    };
    const latest = expose(last);
    return { ...latest, peak: peak === last ? latest : expose(peak) };
  };
  const rowFor = kind => kind === 'last' ? last : kind === 'peak' ? peak : null;
  const changed = () => ({ ok: false, reason: 'changed' });
  // 憑證只存於私有 WeakMap；普通 view 與 DOM 都不取得世界或單位參照。
  // Leases stay private; neither the ordinary view nor DOM receives unit/world references.
  const captureAction = (kind, token, action, { blocked = false } = {}) => {
    const shown = view();
    const row = rowFor(kind);
    if (!['view', 'attack'].includes(action) || !row || records.get(token) !== row || row.token !== token || kind === 'peak' && !showPeak(shown)) return changed();
    if (!row.source) return changed();
    const count = selectedAttackers(g).length;
    if (!battleCanAct(g, blocked) || g.heroControl) return { ok: false, reason: 'unavailable', count };
    if (action === 'attack' && (!count || count !== new Set(g.selection).size)) return { ok: false, reason: 'select', count };
    const lease = Object.freeze({});
    leases.set(lease, { kind, token, action, row, source: row.source, world: g.world, wave: g.waveIndex, core: row.core,
      selection: [...g.selection], heroControl: g.heroControl, orderMode: g.orderMode, phase: g.phase });
    return { ok: true, lease, count };
  };
  const validateAction = (lease, { blocked = false } = {}) => {
    const captured = leases.get(lease);
    if (!captured) return changed();
    const shown = view();
    const { kind, token, row, source, world, wave, core, selection, heroControl, orderMode, phase, action } = captured;
    if (rowFor(kind) !== row || records.get(token) !== row || row.source !== source || !source || kind === 'peak' && !showPeak(shown)
      || g.world !== world || g.waveIndex !== wave || g.getTownCenter() !== core
      || g.heroControl !== heroControl || g.orderMode !== orderMode || g.phase !== phase
      || g.selection.length !== selection.length || selection.some((u, i) => u !== g.selection[i])
      || !battleCanAct(g, blocked) || g.heroControl) {
      leases.delete(lease); return changed();
    }
    if (action === 'attack') {
      const count = selectedAttackers(g).length;
      if (!count || count !== new Set(g.selection).size) { leases.delete(lease); return changed(); }
    }
    return { ok: true };
  };
  const activateAction = (lease, options = {}) => {
    const captured = leases.get(lease), valid = validateAction(lease, options);
    // 原生命令或相機即使拋例外，這次人工啟用也已消耗；原生例外原樣傳出。
    // Consume before dispatch, including native exceptions; never retry or catch native failures.
    leases.delete(lease);
    if (!valid.ok) return valid;
    return captured.action === 'attack' ? attackSelectedVisibleTarget(g, captured.source, options) : focusVisibleTarget(g, captured.source, options);
  };
  const cancelAction = lease => leases.delete(lease);
  return { view, clear, captureAction, validateAction, activateAction, cancelAction,
    diagnostics: () => ({ events, faults, lastLoss: last?.loss ?? null }) };
}

const displayLoss = loss => loss < .01 ? '<0.01' : Number(loss.toFixed(2));
const showPeak = view => !!view && view.peak?.loss > view.loss && displayLoss(view.peak.loss) !== displayLoss(view.loss);
function rowText(row, key) {
  const damage = displayLoss(row.loss);
  const clock = Math.floor(row.at / 60) + ':' + String(Math.floor(row.at % 60)).padStart(2, '0');
  const time = t('coreDamage.time', { time: clock });
  const source = !row.name ? t('coreDamage.unknown') : row.name + (row.direction ? ' · ' + t('coreDamage.direction', { arrow: row.direction }) : '');
  return t('coreDamage.' + key, { damage, source, time });
}

export function coreDamageText(view) {
  if (!view) return '';
  return rowText(view, 'hit') + (showPeak(view) ? '\n' + rowText(view.peak, 'peak') : '');
}

export function installCoreDamageReadback(g, ui, renderer) {
  const observer = observeCoreDamage(g), note = document.createElement('div');
  note.id = 'core-damage-readback'; note.hidden = true; note.setAttribute('role', 'status');
  const root = document.querySelector('#battle-actions'); root.insertBefore(note, root.querySelector('.battle-hint'));
  const blocked = () => !!(ui.menuVisible || ui.settingsOpen || ui.gmOpen || ui.boonsOpen || ui.pauseOpen || !ui.el.howto.hidden
    || document.querySelector('dialog[open]') || document.querySelector('#battle-line-panel:not([hidden])'));
  const canPoint = p => Number.isFinite(p.x) && Number.isFinite(p.y) && p.x >= 0 && p.y >= 0
    && p.x < window.innerWidth && p.y < window.innerHeight && !!renderer?.canvas && document.elementFromPoint(p.x, p.y) === renderer.canvas;
  const setText = (node, value) => { if (node.textContent !== value) node.textContent = value; };
  let pending = null, heldKey = null, uiFaults = 0, paintedState = null;
  const explain = reason => g.toast(t('coreDamage.' + (['select', 'unavailable', 'noPoint'].includes(reason) ? reason : 'changed')), 'bad', 2200);
  const cancel = (explainChange = false) => {
    if (!pending) return;
    observer.cancelAction(pending.lease); pending = null;
    if (explainChange) explain('changed');
  };
  const rows = ['last', 'peak'].map(kind => {
    const element = document.createElement('div'), text = document.createElement('span');
    element.className = 'core-damage-row'; text.className = 'core-damage-text'; element.append(text);
    const row = { kind, element, text, token: null, buttons: {} };
    for (const action of ['view', 'attack']) {
      const button = document.createElement('button'); button.type = 'button'; button.className = 'core-source-action';
      button.dataset.sourceKind = kind; button.dataset.sourceAction = action; element.append(button); row.buttons[action] = button;
      const arm = () => {
        cancel();
        // 此處讀的是上次呈現的 token；capture 不會把舊 last 換成新 last 或 peak。
        // Capture the rendered row, never silently substitute a newer last/peak event.
        const result = observer.captureAction(kind, row.token, action, { blocked: blocked() });
        if (result.ok) pending = { lease: result.lease, button };
        else explain(result.reason);
      };
      button.addEventListener('pointerdown', e => { if (e.button === 0 && e.isPrimary !== false) arm(); });
      button.addEventListener('keydown', e => {
        if (![' ', 'Enter', 'Tab'].includes(e.key)) return;
        e.stopPropagation();
        if (e.key === 'Tab') { cancel(true); return; }
        if (e.repeat) { e.preventDefault(); return; }
        heldKey = e.key;
        arm();
      });
      button.addEventListener('keyup', e => {
        if ([' ', 'Enter', 'Tab'].includes(e.key)) e.stopPropagation();
        if (heldKey === e.key) heldKey = null;
      });
      button.addEventListener('click', () => {
        const armed = pending;
        if (!armed || armed.button !== button) { explain('changed'); return; }
        pending = null;
        const result = observer.activateAction(armed.lease, { blocked: blocked(), canPoint, viewport: { w: window.innerWidth, h: window.innerHeight } });
        if (!result.ok) explain(result.reason);
        else g.toast(t('coreDamage.' + (action === 'attack' ? 'issued' : 'viewed'), { count: result.count }), 'good', 2200);
        update();
      });
      const cancelOwn = () => { if (pending?.button === button) cancel(true); };
      button.addEventListener('blur', cancelOwn); button.addEventListener('pointercancel', cancelOwn);
    }
    note.append(element); return row;
  });
  const paint = () => {
    const view = observer.view(), uiBlocked = blocked(), unavailable = !battleCanAct(g, uiBlocked) || g.heroControl;
    if (pending && !observer.validateAction(pending.lease, { blocked: uiBlocked }).ok) cancel(true);
    const peakView = showPeak(view) ? view.peak : null, hasSource = !!(view?.name || peakView?.name);
    const count = hasSource ? selectedAttackers(g).length : 0, onlyFighters = count > 0 && count === new Set(g.selection).size;
    // 即時身分與憑證驗證在快取之前；此快取只省去不變文字／DOM 工作，不能授權發令。
    // Always validate identities and leases first; this display cache never authorizes actions.
    const state = [getLocale(), count, onlyFighters, unavailable];
    for (const data of [view, peakView]) state.push(data?.token, data?.sourceId, data?.name, data?.direction, data?.loss, data?.at);
    if (paintedState && state.every((value, i) => Object.is(value, paintedState[i]))) return;
    for (const row of rows) {
      const data = row.kind === 'last' ? view : peakView;
      row.token = data?.token ?? null;
      if (row.element.hidden !== !data) row.element.hidden = !data;
      const text = data ? rowText(data, row.kind === 'last' ? 'hit' : 'peak') : '';
      setText(row.text, text);
      for (const [action, button] of Object.entries(row.buttons)) {
        const visible = !!data?.name;
        if (button.hidden !== !visible) button.hidden = !visible;
        const disabled = !visible || unavailable || action === 'attack' && !onlyFighters;
        if (button.disabled !== disabled) button.disabled = disabled;
        const label = visible ? t('coreDamage.' + action, { count }) : '';
        setText(button, label);
        const title = !visible ? '' : t('coreDamage.' + action + 'Help', { count })
          + (unavailable ? ' ' + t('coreDamage.unavailable') : action === 'attack' && !onlyFighters ? ' ' + t('coreDamage.select') : '');
        if (button.title !== title) button.title = title;
        const aria = visible ? text + ' · ' + label + ' · ' + title : '';
        if (button.getAttribute('aria-label') !== aria) button.setAttribute('aria-label', aria);
      }
    }
    if (note.hidden !== !view) note.hidden = !view;
    const title = t('coreDamage.help') + ' ' + t('coreDamage.peakHelp'); if (note.title !== title) note.title = title;
    paintedState = state;
  };
  // UI 配置與觀察器失敗不截斷原生更新／致命傷害。明確啟用的原生例外不在此攔截。
  // Isolate optional rendering failures; explicit native action failures remain uncaught.
  const update = () => { try { paint(); } catch { paintedState = null; uiFaults++; cancel(); note.hidden = true; } };
  window.addEventListener('blur', () => { heldKey = null; cancel(true); });
  window.addEventListener('keydown', e => {
    // 來源消失使按鈕失焦時，尚未放開的重複鍵也不能變成全域暫停／英雄操作。
    // A disappearing button must not turn its still-held activation key into a global hotkey.
    if (heldKey === e.key && e.repeat) { e.preventDefault(); e.stopPropagation(); return; }
    if (![' ', 'Enter', 'Tab'].includes(e.key)) cancel(true);
  }, true);
  window.addEventListener('keyup', e => { if (heldKey === e.key) heldKey = null; }, true);
  for (const type of ['pointerdown', 'pointerup']) window.addEventListener(type, e => { if (pending && e.target !== pending.button) cancel(true); }, true);
  const original = ui.update.bind(ui); ui.update = (...args) => { original(...args); update(); };
  document.addEventListener('localechange', update); update();
  return { ...observer, update, diagnostics: () => ({ ...observer.diagnostics(), uiFaults }) };
}
