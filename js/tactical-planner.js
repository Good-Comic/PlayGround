import { t } from './i18n.js';
import { battleArmy, battleSkillContext } from './battle-actions.js';

const livePhase = g => !g.inMenu && ['prep', 'wave'].includes(g.phase) && !g.placement;
const military = u => u.alive && u.team === 'player' && !u.w && u.type !== 'villager' && !u.typeDef?.noAttack;

// 暫停期間只存意圖；恢復時才經原生指令入口執行。每單位保留最後一項布令。
export function createTacticalPlan(g) {
  let stamp = null, orders = [];
  const valid = () => stamp && g.paused && livePhase(g) && stamp.world === g.world && stamp.wave === g.waveIndex && stamp.phase === g.phase;
  const reset = () => { stamp = null; orders = []; };
  return {
    begin() { if (!g.paused || !livePhase(g)) return false; stamp = { world: g.world, wave: g.waveIndex, phase: g.phase }; orders = []; return true; },
    active() { if (!valid()) reset(); return !!stamp; },
    list() { return valid() ? orders.map(o => ({ ...o, ids: o.ids?.slice(), point: o.point && { ...o.point } })) : []; },
    clear() { orders = []; },
    cancel: reset,
    stage(type, selection, point, target = null) {
      if (!valid() || !['move', 'attackMove', 'attack', 'guard'].includes(type)) return false;
      const ids = [...new Set(selection.filter(u => g.units.includes(u) && military(u)).map(u => u.id))];
      if (!ids.length || !point || !Number.isFinite(point.x) || !Number.isFinite(point.y) || point.x < 0 || point.y < 0 || point.x >= g.world.size || point.y >= g.world.size) return false;
      if (type === 'attack' && (!target?.alive || target.team !== 'enemy' || !g.isVisible(target))) return false;
      if (type === 'guard' && (!target?.alive || target.team !== 'player' || ids.includes(target.id) || ![...g.units, ...g.buildings].includes(target))) return false;
      orders = orders.map(o => o.ids ? { ...o, ids: o.ids.filter(id => !ids.includes(id)) } : o).filter(o => !o.ids || o.ids.length);
      orders.push({ type, ids, point: { ...point }, targetId: target?.id ?? null });
      return true;
    },
    skill(type) {
      if (!valid() || !['mark', 'aegis'].includes(type) || !g.hero?.alive || g.hero[type + 'Cd'] > 0) return false;
      if (type === 'mark' && !battleSkillContext(g).markTarget) return false;
      orders = orders.filter(o => o.type !== type);
      orders.push({ type }); return true;
    },
    commit() {
      if (!valid()) { reset(); return null; }
      const pending = orders, selection = g.selection.slice(); reset();
      g.resume();
      const result = { applied: 0, skipped: 0 };
      for (const order of pending) {
        if (['mark', 'aegis'].includes(order.type)) {
          const h = g.hero, before = h?.[order.type + 'Cd'];
          g.command('hero:' + order.type);
          (h && h[order.type + 'Cd'] > before) ? result.applied++ : result.skipped++;
          continue;
        }
        const units = g.units.filter(u => order.ids.includes(u.id) && military(u));
        const p = g.screenPos(order.point.x, order.point.y);
        const target = [...g.units, ...g.buildings].find(e => e.id === order.targetId && e.alive);
        if (!units.length || (['attack', 'guard'].includes(order.type) && (!target || g.pickAt(p.x, p.y) !== target || (order.type === 'attack' && !g.isVisible(target))))) { result.skipped++; continue; }
        if (g.heroControl && units.includes(g.hero)) g.toggleHeroControl();
        g.setSelection(units); g.orderMode = null;
        if (order.type === 'move') {
          g.commandMove(units, order.point.x, order.point.y); g.addCommandMarker(order.point.x, order.point.y, false); g.sound?.command();
        } else if (order.type === 'attack') g.issueCommand(p.x, p.y);
        else { g.command('order:' + order.type); g.issueTacticalCommand(p.x, p.y); }
        result.applied++;
      }
      g.setSelection(selection.filter(u => u.alive));
      return result;
    },
  };
}

export function installTacticalPlanner(g, ui, renderer, canvas) {
  const plan = createTacticalPlan(g);
  const root = document.createElement('section'); root.id = 'tactical-planner'; root.hidden = true;
  root.innerHTML = '<strong></strong><p class="plan-help"></p><div class="plan-tools"></div><p class="plan-status" aria-live="polite"></p><div class="plan-footer"></div>';
  const toolActions = ['army', 'hero', 'select', 'move', 'attackMove', 'attack', 'guard', 'mark', 'aegis'];
  const footerActions = ['clear', 'cancel', 'resume'];
  const buttons = {};
  for (const action of [...toolActions, ...footerActions]) {
    const b = document.createElement('button'); b.type = 'button'; b.dataset.plan = action;
    b.addEventListener('keydown', e => { if ([' ', 'Enter', 'Tab'].includes(e.key)) { e.stopPropagation(); if (e.repeat && e.key !== 'Tab') e.preventDefault(); } });
    root.querySelector(footerActions.includes(action) ? '.plan-footer' : '.plan-tools').append(b); buttons[action] = b;
  }
  document.body.append(root);
  const launch = document.createElement('button'); launch.type = 'button'; launch.id = 'btn-tactical-plan'; launch.className = 'icon-button';
  launch.innerHTML = '<svg aria-hidden="true"><use href="#i-flag"/></svg>';
  ui.$('btn-pause').after(launch);
  const pauseLaunch = document.createElement('button'); pauseLaunch.type = 'button'; pauseLaunch.id = 'btn-pause-plan'; pauseLaunch.className = 'secondary-button small'; ui.$('btn-resume').after(pauseLaunch);
  let mode = 'select', drag = null, message = '', signature = '', last = 0;
  const blocked = () => ui.settingsOpen || ui.gmOpen || ui.boonsOpen || ui.menuVisible || !ui.el.howto.hidden || !!document.querySelector('dialog[open]');
  function begin() {
    if (blocked() || !livePhase(g)) return;
    if (!g.paused) g.togglePause();
    if (!plan.begin()) return;
    g.keys.clear(); ui.showPause(false); mode = 'select'; message = ''; update(true);
  }
  function finish(commit) {
    if (commit) {
      const result = plan.commit();
      if (result) { ui.showPause(false); g.toast(t('plan.executed', result), 'good', 3200); }
    } else { plan.cancel(); ui.showPause(true); }
    drag = null; g.clearHeroSkillPreview(); update(true);
  }
  function act(action) {
    if (!plan.active() || blocked()) return;
    if (action === 'resume') return finish(true);
    if (action === 'cancel') return finish(false);
    if (action === 'clear') { plan.clear(); message = ''; }
    else if (action === 'army' || action === 'hero') {
      const units = action === 'army' ? battleArmy(g) : g.hero?.alive ? [g.hero] : [];
      g.setSelection(units); mode = 'select';
    } else if (action === 'mark' || action === 'aegis') {
      message = t(plan.skill(action) ? 'plan.skillStaged' : 'plan.unavailable');
    } else { mode = action; message = ''; }
    update(true);
  }
  for (const [action, b] of Object.entries(buttons)) b.onclick = () => act(action);
  launch.onclick = pauseLaunch.onclick = begin;
  function update(force = false) {
    if (blocked() && plan.active()) { plan.cancel(); drag = null; if (!g.inMenu) ui.showPause(true); }
    const active = plan.active();
    if (root.hidden === active) root.hidden = !active;
    document.body.classList.toggle('planning-mode', active);
    if (!active) drag = null;
    const now = performance.now(); if (!force && now - last < 100) return; last = now;
    const selected = g.selection.filter(military), orders = plan.list();
    const state = [document.documentElement.lang, active, mode, orders.length, selected.map(u=>u.id).join(','), Math.ceil(g.hero?.markCd||0), Math.ceil(g.hero?.aegisCd||0), message, livePhase(g), g.paused].join('|');
    if (state === signature) return; signature = state;
    launch.title = launch.ariaLabel = t('plan.launch'); launch.disabled = !livePhase(g) || !!blocked();
    pauseLaunch.textContent = t('plan.title'); pauseLaunch.disabled = !livePhase(g);
    if (!active) return;
    root.querySelector('strong').textContent = t('plan.title'); root.querySelector('.plan-help').textContent = t('plan.help');
    root.querySelector('.plan-status').textContent = t('plan.status', { units: selected.length, orders: orders.length, mode: t('plan.' + mode) }) + (message ? ' · ' + message : '');
    for (const [action, b] of Object.entries(buttons)) {
      b.textContent = t('plan.' + action); b.setAttribute('aria-pressed', String(mode === action && !footerActions.includes(action)));
      b.disabled = ['mark','aegis'].includes(action) ? !g.hero?.alive || g.hero[action+'Cd'] > 0 || (action === 'mark' && !battleSkillContext(g).markTarget) : false;
    }
  }
  function canvasEvent(e) {
    if (!plan.active() || blocked()) return false;
    e.preventDefault(); e.stopImmediatePropagation(); return true;
  }
  canvas.addEventListener('pointerdown', e => {
    if (!canvasEvent(e)) return;
    if (e.button !== 0) { mode = 'select'; update(true); return; }
    const r = canvas.getBoundingClientRect(); drag = { x: e.clientX-r.left, y: e.clientY-r.top, shift: e.shiftKey };
    canvas.setPointerCapture?.(e.pointerId);
  }, true);
  window.addEventListener('pointerup', e => {
    if (!drag || !canvasEvent(e)) return;
    const from = drag; drag = null; const r = canvas.getBoundingClientRect(), x=e.clientX-r.left, y=e.clientY-r.top;
    if (mode === 'select') {
      if (Math.hypot(x-from.x,y-from.y)>5) g.selectBox(Math.min(from.x,x),Math.min(from.y,y),Math.abs(x-from.x),Math.abs(y-from.y),from.shift);
      else g.selectAt(x,y,from.shift);
    } else {
      const ok = plan.stage(mode, g.selection, g.worldAt(x,y), g.pickAt(x,y)); message = t(ok ? 'plan.staged' : 'plan.invalid');
    }
    update(true);
  }, true);
  window.addEventListener('keydown', e => {
    const editable = e.target?.closest?.('input,textarea,select,[contenteditable=true]');
    if (!plan.active()) {
      if (e.code==='Space' && e.shiftKey && !e.repeat && !e.ctrlKey && !e.altKey && !e.metaKey && !editable && !blocked() && livePhase(g)) { e.preventDefault(); e.stopImmediatePropagation(); begin(); }
      return;
    }
    if (editable || (e.target?.closest?.('button') && [' ','Enter','Tab'].includes(e.key))) return;
    e.preventDefault(); e.stopImmediatePropagation(); if (e.repeat) return;
    if (e.key==='Escape') finish(false);
    else if (e.code==='Space') finish(true);
    else if (e.key==='F2') act('army');
    else if (e.key==='Tab') act('hero');
    else { const action={m:'move',a:'attackMove',g:'guard',q:'mark',e:'aegis'}[e.key.toLowerCase()]; if(action)act(action); }
  }, true);
  const oldUpdate = ui.update.bind(ui); ui.update = (...a) => { oldUpdate(...a); update(); };
  const oldDraw = renderer.draw.bind(renderer); renderer.draw = (...args) => {
    oldDraw(...args); if (!plan.active()) return;
    const ctx=renderer.ctx; ctx.save(); ctx.strokeStyle='#92e4eb';ctx.fillStyle='#e8fcff';ctx.lineWidth=2;ctx.setLineDash([6,5]);ctx.font='bold 13px sans-serif';
    for(const [i,order] of plan.list().entries()) {
      const h=order.ids ? g.units.filter(u=>order.ids.includes(u.id)&&u.alive) : [g.hero].filter(Boolean);
      const end=order.point ? g.screenPos(order.point.x,order.point.y) : h[0]&&g.screenPos(h[0].x,h[0].y);if(!end)continue;
      for(const u of h){const start=g.screenPos(u.x,u.y);ctx.beginPath();ctx.moveTo(start.x,start.y);ctx.lineTo(end.x,end.y);ctx.stroke();}
      ctx.beginPath();ctx.arc(end.x,end.y,12,0,Math.PI*2);ctx.stroke();ctx.fillText(String(i+1),end.x+15,end.y-4);
    }
    if(drag){const x=g.mouse.x,y=g.mouse.y;ctx.strokeRect(drag.x,drag.y,x-drag.x,y-drag.y);}
    ctx.restore();
  };
  document.addEventListener('localechange', () => update(true)); update(true);
  return { plan, begin, update };
}
