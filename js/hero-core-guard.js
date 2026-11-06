import { battleCanAct } from './battle-actions.js';
import { defenseClickPoint } from './core-defense.js';
import { t } from './i18n.js';

// Player-issued convenience command. Native tactical orders own all movement and combat.
export function heroCoreGuardTarget(g, blocked = false) {
  if (!battleCanAct(g, blocked) || !(g.expedition?.rescued >= 2)) return null;
  const hero = g.hero, core = g.getTownCenter();
  if (!hero?.alive || !hero.hero || hero.team !== 'player' || !g.units.includes(hero)
    || !core?.alive || core.team !== 'player' || !g.buildings.includes(core)) return null;
  return { hero, core };
}
export function guardHeroCore(g, blocked = false) {
  const target = heroCoreGuardTarget(g, blocked);
  if (!target) return { ok: false };
  const { hero, core } = target, point = defenseClickPoint(g, core);
  if (!point || !Number.isFinite(point.x) || !Number.isFinite(point.y)) return { ok: false };
  const selection = [...g.selection], orderMode = g.orderMode;
  let ok = false;
  try {
    g.setSelection([hero]);
    g.command('order:guard');
    ok = !!g.issueTacticalCommand(point.x, point.y);
  } finally {
    g.orderMode = orderMode;
    g.setSelection(selection.filter(u => u.alive));
  }
  if (ok) g.focusAt(core.x + core.w / 2, core.y + core.h / 2);
  return { ok, protectedId: core.id };
}
export function installHeroCoreGuard(g, ui) {
  const box = document.querySelector('#rescue-expedition'), go = box.querySelector('button');
  const button = document.createElement('button');
  button.id = 'btn-hero-core-guard'; button.type = 'button'; button.hidden = true;
  box.append(button);
  const blocked = () => ui.menuVisible || ui.settingsOpen || ui.gmOpen || ui.boonsOpen || ui.pauseOpen || !ui.el.howto.hidden || !!document.querySelector('dialog[open]');
  button.addEventListener('keydown', e => {
    if ([' ', 'Enter', 'Tab'].includes(e.key)) { e.stopPropagation(); if (e.repeat && e.key !== 'Tab') e.preventDefault(); }
  });
  button.onclick = () => {
    const result = guardHeroCore(g, blocked());
    g.toast(t('heroCoreGuard.' + (result.ok ? 'issued' : 'unavailable')), result.ok ? 'good' : 'bad', 2800);
    update();
  };
  let signature = "";
  function update() {
    const done = g.expedition?.rescued >= 2;
    const disabled = !heroCoreGuardTarget(g, blocked());
    const next = [document.documentElement.lang, !!done, disabled].join('|');
    if (next === signature) return; signature = next;
    go.hidden = !!done; button.hidden = !done;
    button.disabled = disabled;
    button.textContent = t('heroCoreGuard.launch'); button.title = t('heroCoreGuard.help');
  }
  const old = ui.update.bind(ui); ui.update = (...args) => { old(...args); update(); };
  document.addEventListener('localechange', update); update();
  return { update };
}
