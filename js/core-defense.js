import { battleArmy, battleCanAct } from './battle-actions.js';
import { unitThreat } from './director.js';
import { t } from './i18n.js';

// A deliberate player shortcut through native commands, never an automatic AI override.
export function defenseClickPoint(g, target) {
  const point = g.screenPos(target.x + (target.w ? target.w / 2 : 0), target.y + (target.h ? target.h / 2 : 0)), z = g.camera.zoom;
  const offsets = target.w ? [[0,-60],[-45,-60],[45,-60],[0,-100],[-70,-90],[70,-90],[0,-20],[0,0]] : [[0,-18],[-6,-18],[6,-18],[0,-26],[0,-10]];
  for (const [dx,dy] of offsets) { const p = { x: point.x + dx*z, y: point.y + dy*z }; if (g.pickAt(p.x,p.y) === target) return p; }
  return null;
}
export function defendCore(g, blocked = false) {
  if (!battleCanAct(g, blocked)) return { ok: false, reason: 'unavailable' };
  const core = g.getTownCenter(), army = battleArmy(g);
  if (!core || !army.length) return { ok: false, reason: 'unavailable' };
  const attackers = g.units.filter(u => u.alive && u.team === 'enemy' && g.isVisible(u) && u.target === core && u.state === 'attack' && g.distanceTo(u,core) <= g.unitRange(u) - .1)
    .sort((a,b) => g.distanceTo(a,core) - g.distanceTo(b,core) || unitThreat(b.type) - unitThreat(a.type) || a.id - b.id);
  let target = core, point = null;
  for (const attacker of attackers) { const p = defenseClickPoint(g,attacker); if (p) { target = attacker; point = p; break; } }
  point ||= defenseClickPoint(g,core);
  if (!point) return { ok: false, reason: 'noTarget' };
  if (g.heroControl) g.toggleHeroControl();
  g.setSelection(army); g.orderMode = null;
  let ok;
  if (target === core) { g.command('order:guard'); ok = g.issueTacticalCommand(point.x,point.y); }
  else { g.issueCommand(point.x,point.y); ok = army.every(u => u.manualAttack && u.target === target); }
  if (ok) g.focusAt(core.x + core.w/2,core.y + core.h/2);
  return { ok: !!ok, kind: target === core ? 'guard' : 'attack', count: army.length, targetId: target.id, protectedId: core.id, type: target.type };
}

export function installCoreDefense(g,ui) {
  const button = document.createElement('button'); button.id = 'btn-core-defense'; button.type = 'button'; button.className = 'defense-launch';
  const head = document.querySelector('#battle-actions .battle-head'); head.insertBefore(button,head.querySelector('.line-launch'));
  const blocked = () => ui.menuVisible || ui.settingsOpen || ui.gmOpen || ui.boonsOpen || ui.pauseOpen || !ui.el.howto.hidden || !!document.querySelector('dialog[open]');
  button.addEventListener('keydown',e => { if ([' ','Enter','Tab'].includes(e.key)) { e.stopPropagation(); if (e.repeat && e.key !== 'Tab') e.preventDefault(); } });
  button.onclick = () => {
    if (!battleCanAct(g,blocked())) return;
    ui.battleLine?.cancel();
    const result = defendCore(g,blocked());
    if (!result.ok) g.toast(t('defense.' + (result.reason || 'unavailable')),'bad',2200);
    else g.toast(t('defense.'+result.kind,{count:result.count,name:t('unit.'+result.type+'.name')}),'good',2600);
    update(true);
  };
  let lastPaint = 0, signature = '';
  function update(force = false) {
    if (!force && performance.now() - lastPaint < 100) return; lastPaint = performance.now();
    const core = g.getTownCenter(), count = battleArmy(g).length, disabled = !core || !count || !battleCanAct(g,blocked()), damaged = !!core && core.hp < core.maxHp;
    const key = [document.documentElement.lang,disabled,damaged].join('|'); if (key === signature) return; signature = key;
    button.textContent = t('defense.launch'); button.title = t('defense.help'); button.disabled = !!disabled;
    button.dataset.damaged = String(damaged);
  }
  const oldUpdate = ui.update.bind(ui); ui.update = (...args) => { oldUpdate(...args); update(); };
  document.addEventListener('localechange',()=>update(true)); update(true);
  return { update };
}
