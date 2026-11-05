import { battleArmy } from './battle-actions.js';
import { t } from './i18n.js';

// 只回讀已選正式戰士；不下令、不替玩家選軍，也不把 attack 當成已命中。
const nameOf = e => {
  const key = `${e.w ? 'building' : 'unit'}.${e.type}.name`, name = t(key);
  return name === key ? t('readback.ally') : name;
};
export function commandReadback(g, { carrier = null } = {}) {
  const army = battleArmy(g), selected = new Set(g.selection);
  const available = !g.inMenu && ['prep', 'wave'].includes(g.phase);
  const actors = available ? army.filter(u => selected.has(u)) : [];
  const allies = new Map([...g.units, ...g.buildings].filter(e => e.team === 'player').map(e => [e.id, e]));
  const groups = new Map(), targets = new Map(), visibility = new Map();
  const visible = target => {
    if (!visibility.has(target)) visibility.set(target, !!target.alive && g.isVisible(target));
    return visibility.get(target);
  };
  for (const u of actors) {
    let kind = 'idle', key, name = '';
    const order = u.tacticalOrder;
    if (order?.type === 'guard') {
      kind = 'guard'; const ally = allies.get(order.protectedId);
      name = ally?.alive ? nameOf(ally) : t('readback.ally'); key = `guard:${order.protectedId}`;
    } else if (['attackMove', 'patrol'].includes(order?.type)) kind = order.type;
    else if (u.manualAttack && u.target) {
      // 通過當下正式可見性前，不讀敵人的名稱、類型、HP或座標。
      if (visible(u.target) && u.target.team === 'enemy') {
        const target = u.target; kind = 'focus'; key = `focus:${target.id}`;
        name = target === carrier ? t('readback.flag', { name: nameOf(target) }) : nameOf(target);
        const entry = targets.get(target) || { target, count: 0, name };
        entry.count++; targets.set(target, entry);
      } else kind = 'unseen';
    } else if (u.hold) kind = 'hold';
    else if (u.state === 'move') kind = 'move';
    else if (u.state === 'attack' && u.target) kind = 'auto';
    key ||= kind;
    const group = groups.get(key) || { key, kind, name, count: 0 };
    group.count++; groups.set(key, group);
  }
  const ordered = [...groups.values()].sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));
  return { available, selected: actors.length, army: army.length, heroDirect: !!g.heroControl,
    actors, groups: ordered, targets: [...targets.values()].sort((a,b) => b.count-a.count || a.target.id-b.target.id) };
}

export const readbackGroupText = group => t('readback.' + group.kind, { count: group.count, name: group.name });

// 前景提示只對到目前已選戰士的人工目標。死亡／失去視野／改令時逐幀剔除。
export function drawCommandReadback(renderer, g, view) {
  if (!view?.available || g.inMenu || !['prep','wave'].includes(g.phase)) return;
  const ctx = renderer.ctx, z = g.camera.zoom;
  for (const entry of view.targets.slice(0, 4)) {
    const target = entry.target;
    if (!target.alive || !g.isVisible(target) || target.team !== 'enemy' || !(g.units.includes(target) || g.buildings.includes(target))) continue;
    const count = view.actors.filter(u => u.alive && u.team === 'player' && g.selection.includes(u) && u.manualAttack && !u.tacticalOrder && u.target === target).length;
    if (!count) continue;
    const p = renderer.screen(g, target.x + (target.w || 0)/2, target.y + (target.h || 0)/2);
    if (p.x < -40 || p.y < -40 || p.x > renderer.w+40 || p.y > renderer.h+60) continue;
    ctx.save();
    try {
      ctx.setTransform(renderer.dpr,0,0,renderer.dpr,0,0);
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.setLineDash([]);
      ctx.strokeStyle = '#191b19'; ctx.lineWidth = 5;
      const ring = () => { ctx.beginPath(); ctx.ellipse(p.x,p.y-12*z,21*z,12*z,0,0,Math.PI*2); ctx.stroke(); };
      ring(); ctx.strokeStyle = '#ffdf83'; ctx.lineWidth = 2; ring();
      ctx.beginPath();
      for (const side of [-1,1]) { ctx.moveTo(p.x+side*17*z,p.y-12*z); ctx.lineTo(p.x+side*27*z,p.y-12*z); }
      ctx.moveTo(p.x,p.y-31*z); ctx.lineTo(p.x,p.y-23*z); ctx.stroke();
      const label = t('readback.target', { name: entry.name, count });
      ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const width = Math.min(240,ctx.measureText(label).width+16);
      const x = Math.max(width/2+4,Math.min(renderer.w-width/2-4,p.x)), y = Math.max(14,p.y-46*z);
      ctx.fillStyle = '#171c20ed'; ctx.fillRect(x-width/2,y-11,width,22);
      ctx.strokeStyle = '#ffdf83'; ctx.lineWidth = 1; ctx.strokeRect(x-width/2,y-11,width,22);
      ctx.fillStyle = '#fff1c5'; ctx.fillText(label,x,y,width-10);
    } finally { ctx.restore(); }
  }
}

export function installCommandReadback(g, ui, renderer) {
  const panel = document.createElement('section'); panel.id = 'command-readback';
  panel.innerHTML = '<strong></strong><p></p>';
  document.querySelector('#battle-actions').append(panel);
  let view = null, lastPaint = -Infinity, signature = '', world = null, selection = null, observed = [], lastCarrier = null;
  const carrier = () => ['pending','active'].includes(ui.rallyObjective?.status()) ? ui.rallyObjective.carrier() : null;
  const update = (force = false) => {
    const hidden = document.querySelector('#battle-actions').hidden;
    if (hidden) { view = null; signature = ''; world = null; selection = null; observed = []; return; }
    const liveCarrier = carrier();
    const changed = world !== g.world || selection !== g.selection || liveCarrier !== lastCarrier || observed.some(e =>
      !e.u.alive || e.u.team !== 'player' || e.state !== e.u.state || e.manual !== e.u.manualAttack || e.target !== e.u.target || e.order !== e.u.tacticalOrder);
    const lost = view?.targets.some(e => !e.target.alive || !g.isVisible(e.target) || e.target.team !== 'enemy');
    if (!force && !changed && !lost && performance.now()-lastPaint<100) return;
    lastPaint = performance.now(); world = g.world; selection = g.selection; lastCarrier = liveCarrier;
    view = commandReadback(g,{carrier:liveCarrier});
    observed = view.actors.map(u=>({u,state:u.state,manual:u.manualAttack,target:u.target,order:u.tacticalOrder}));
    const head = (view.heroDirect ? t('readback.direct')+' · ' : '') + t('readback.coverage', { selected:view.selected,total:view.army });
    const shown = view.groups.slice(0,4), rest = view.groups.slice(4).reduce((n,e)=>n+e.count,0);
    const detail = shown.map(readbackGroupText).join(' · ') + (rest ? ' · '+t('readback.more',{count:rest}) : '') || t('readback.none');
    const key = [document.documentElement.lang,head,detail].join('|');
    if (key !== signature) {
      signature = key; panel.querySelector('strong').textContent = head; panel.querySelector('p').textContent = detail;
      panel.setAttribute('aria-label',t('readback.title')); panel.title=t('readback.help');
    }
  };
  const oldUpdate = ui.update.bind(ui); ui.update = (...args) => { const result=oldUpdate(...args); update(); return result; };
  const draw = renderer.draw.bind(renderer);
  renderer.draw = (...args) => { const result=draw(...args); if(world===g.world && !panel.parentElement.hidden) drawCommandReadback(renderer,g,view); return result; };
  document.addEventListener('localechange',()=>update(true)); update(true);
  return { update };
}
