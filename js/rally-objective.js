import { UNIT_TYPES } from './data.js';
import { unitThreat } from './director.js';
import { t } from './i18n.js';

// GDD §6.1: reuse an existing elite (lowest-threat infantry fallback), 4 tiles,
// +10% attack speed for 15 simulation seconds; the bearer dying ends the aura.
export const RALLY_RULE = Object.freeze({ radius: 4, duration: 15, speed: 1.1 });
const infantry = type => UNIT_TYPES[type]?.category === 'infantry' && !UNIT_TYPES[type]?.boss;
export function rallyCarrierType(groups = []) {
  const types = [...new Set(groups.flatMap(group => Object.entries(group.units || {}).filter(([, n]) => n > 0).map(([type]) => type)))].filter(infantry);
  return types.sort((a, b) => Number(UNIT_TYPES[b].family === 'E') - Number(UNIT_TYPES[a].family === 'E') || unitThreat(a) - unitThreat(b) || a.localeCompare(b))[0] || null;
}

export function installRallyMechanic(g) {
  let state = null, cachedCarrier = null, resolvedId = null;
  const cooldownViews = new WeakMap();
  const matches = () => g.waveEvent?.id === 'RALLY' && state?.waveIndex === g.waveIndex;
  const carrier = () => {
    if (!matches() || state.carrierId === null) return null;
    if (resolvedId !== state.carrierId) { cachedCarrier = g.units.find(u => u.id === state.carrierId) || null; resolvedId = state.carrierId; }
    return cachedCarrier;
  };
  const status = () => {
    if (g.waveEvent?.id !== 'RALLY' || g.phase !== 'wave') return 'off';
    if (!matches()) return 'legacy'; // Never invent a bearer or a new timer for an old save.
    const u = carrier();
    if (state.carrierId !== null && (!u?.alive || u.team !== 'enemy')) return 'broken';
    if (g.waveClock >= state.expiresAt) return 'expired';
    if (!state.carrierType) return 'unavailable';
    if (!u || !g.waveEventActive || g.waveClock < state.eventAt) return 'pending';
    return 'active';
  };
  const multiplier = u => {
    if (u.team !== 'enemy' || u.typeDef.boss || status() !== 'active') return 1;
    const flag = carrier();
    return Math.hypot(u.x - flag.x, u.y - flag.y) <= RALLY_RULE.radius ? RALLY_RULE.speed : 1;
  };
  const applyMods = g.applyEventMods.bind(g);
  g.applyEventMods = (u, ...args) => {
    const result = applyMods(u, ...args);
    // The new aura is evaluated at attack time. Never leave the old permanent
    // global multiplier on survivors who can carry over into another wave.
    if (matches()) u.eventAttackSpeedMul = 1;
    return result;
  };
  const start = g.startWave.bind(g);
  g.startWave = (...args) => {
    state = null; cachedCarrier = null; resolvedId = null;
    const result = start(...args);
    if (g.waveEvent?.id === 'RALLY') state = { version: 1, waveIndex: g.waveIndex, eventAt: g.waveEventAt, expiresAt: g.waveEventAt + RALLY_RULE.duration, carrierType: rallyCarrierType(g.waveSpawns), carrierId: null };
    return result;
  };
  const spawn = g.spawnWaveGroup.bind(g);
  g.spawnWaveGroup = (...args) => {
    const seeking = matches() && state.carrierId === null && state.carrierType && g.waveClock < state.expiresAt;
    const before = seeking ? new Set(g.units.map(u => u.id)) : null;
    const result = spawn(...args);
    if (seeking) {
      const candidate = g.units.filter(u => !before.has(u.id) && u.alive && u.team === 'enemy' && u.type === state.carrierType).sort((a, b) => a.id - b.id)[0];
      if (candidate) { state.carrierId = candidate.id; cachedCarrier = candidate; resolvedId = candidate.id; }
    }
    return result;
  };
  const cooldown = g.attackCooldown.bind(g);
  g.attackCooldown = u => {
    if (!matches() || u.team !== 'enemy') return cooldown(u);
    // Override only the RALLY input, retaining the native cooldown floor, rage and
    // all other rules. The unit and its current countdown are never modified.
    let view = cooldownViews.get(u);
    if (!view) { view = Object.create(u); cooldownViews.set(u, view); }
    view.eventAttackSpeedMul = multiplier(u);
    return cooldown(view);
  };
  const snapshot = g.snapshot.bind(g);
  g.snapshot = (...args) => {
    const saved = snapshot(...args);
    if (matches()) saved.rallyObjective = { ...state };
    return saved;
  };
  const restore = g.restore.bind(g);
  g.restore = (saved, ...args) => {
    const result = restore(saved, ...args), row = saved.rallyObjective;
    state = null; cachedCarrier = null; resolvedId = null;
    if (g.waveEvent?.id === 'RALLY' && row?.version === 1 && row.waveIndex === g.waveIndex &&
      Number.isFinite(row.eventAt) && row.eventAt === g.waveEventAt && row.expiresAt === row.eventAt + RALLY_RULE.duration &&
      (row.carrierType === null || infantry(row.carrierType)) && (row.carrierId === null || Number.isSafeInteger(row.carrierId) && row.carrierId > 0)) state = { version: 1, waveIndex: row.waveIndex, eventAt: row.eventAt, expiresAt: row.expiresAt, carrierType: row.carrierType, carrierId: row.carrierId };
    return result;
  };
  const newRun = g.newRun.bind(g);
  g.newRun = (...args) => { const result = newRun(...args); state = null; cachedCarrier = null; resolvedId = null; return result; };
  return { state: () => matches() ? { ...state } : null, carrier, status, multiplier };
}

export function installRallyObjective(g, ui, renderer) {
  const mechanic = installRallyMechanic(g);
  const panel = document.createElement('section'); panel.id = 'rally-objective'; panel.hidden = true;
  panel.innerHTML = '<strong></strong><p class="rally-rule"></p><p class="rally-status" aria-live="polite"></p><button type="button"></button>';
  document.body.append(panel);
  const button = panel.querySelector('button'); let signature = '', lastPaint = 0;
  const visibleCarrier = () => { const u = mechanic.carrier(); return u?.alive && u.team === 'enemy' && g.isVisible(u) ? u : null; };
  button.onclick = () => { const u = visibleCarrier(); if (u) g.focusAt(u.x, u.y); };
  button.addEventListener('keydown', e => { if ([' ', 'Enter'].includes(e.key)) e.stopPropagation(); });
  const update = (force = false) => {
    const status = mechanic.status(), blocked = status === 'off' || g.inMenu || g.paused || ui.menuVisible || ui.settingsOpen || ui.gmOpen || ui.boonsOpen || ui.pauseOpen || !ui.el.howto.hidden || !!document.querySelector('dialog[open]');
    if (panel.hidden !== !!blocked) panel.hidden = !!blocked;
    if (panel.hidden) return;
    if (!force && performance.now() - lastPaint < 100) return; lastPaint = performance.now();
    const state = mechanic.state(), u = visibleCarrier(), seconds = Math.max(0, Math.ceil((status === 'pending' ? state?.eventAt : state?.expiresAt) - g.waveClock));
    const key = [document.documentElement.lang, status, seconds, u?.id].join('|'); if (key === signature) return; signature = key;
    const text = (el, value) => { if (el.textContent !== value) el.textContent = value; };
    text(panel.querySelector('strong'), t('flag.title'));
    text(panel.querySelector('.rally-rule'), t('flag.rule'));
    text(panel.querySelector('.rally-status'), t('flag.' + status, { seconds }) + (['pending', 'active'].includes(status) && !u ? ' ' + t('flag.unseen') : ''));
    text(button, t('flag.focus')); button.disabled = !u || !['pending', 'active'].includes(status);
    if (panel.dataset.status !== status) panel.dataset.status = status;
  };
  const oldUpdate = ui.update.bind(ui); ui.update = (...args) => { oldUpdate(...args); update(); };
  const drawUnit = renderer.drawUnit.bind(renderer);
  renderer.drawUnit = (u, game, time) => {
    if (u !== mechanic.carrier()) return drawUnit(u, game, time);
    const state = mechanic.status(), isFlag = u === visibleCarrier() && ['pending', 'active'].includes(state);
    const ctx = renderer.ctx, z = game.camera.zoom, p = isFlag ? renderer.screen(game, u.x, u.y) : null;
    const onScreen = p && p.x > -60 && p.y > -20 && p.x < renderer.w + 60 && p.y < renderer.h + 90;
    if (onScreen && state === 'active' && (game.hovered === u || game.selected === u)) {
      ctx.save(); ctx.strokeStyle = '#f5d477aa'; ctx.lineWidth = 1.5; ctx.setLineDash([4, 4]); ctx.beginPath();
      for (let i = 0; i <= 32; i++) { const a = i / 32 * Math.PI * 2, s = renderer.screen(game, u.x + Math.cos(a) * RALLY_RULE.radius, u.y + Math.sin(a) * RALLY_RULE.radius); if (i) ctx.lineTo(s.x, s.y); else ctx.moveTo(s.x, s.y); }
      ctx.closePath(); ctx.stroke(); ctx.restore();
    }
    drawUnit(u, game, time);
    if (!onScreen) return;
    ctx.save(); ctx.translate(p.x + 11 * z, p.y - 4 * z); ctx.scale(z, z);
    ctx.strokeStyle = '#fff0c3'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -48); ctx.stroke();
    ctx.fillStyle = state === 'active' ? '#b33b35' : '#786555'; ctx.strokeStyle = '#ffe49f'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, -47); ctx.lineTo(22, -44); ctx.lineTo(16, -36); ctx.lineTo(22, -28); ctx.lineTo(0, -31); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#fff4cf'; ctx.beginPath(); ctx.moveTo(5, -39); ctx.lineTo(14, -39); ctx.moveTo(9.5, -43); ctx.lineTo(9.5, -34); ctx.stroke(); ctx.restore();
  };
  document.addEventListener('localechange', () => update(true));
  return { ...mechanic, update };
}
