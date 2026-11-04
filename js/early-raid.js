import { t } from './i18n.js';

export function canCallWave(game, blocked = false) {
  return !blocked && !game.inMenu && !game.paused && !game.placement
    && game.phase === 'prep' && game.prepTimer > 0;
}

// 確認只呼叫原生波次入口；不跳過模擬時間、不發放獎勵。
export function createEarlyRaidControl(game, blocked = () => false) {
  let pending = null;
  const valid = () => canCallWave(game, blocked()) && pending?.world === game.world
    && pending.wave === game.waveIndex && pending.plan === game.pendingWavePlan;
  return {
    arm() {
      if (!canCallWave(game, blocked())) return false;
      pending = { world: game.world, wave: game.waveIndex, plan: game.pendingWavePlan };
      return true;
    },
    cancel() { pending = null; },
    isArmed() { if (!valid()) pending = null; return !!pending; },
    confirm() {
      const allowed = valid();
      pending = null;
      if (!allowed) return false;
      game.startWave();
      return true;
    },
  };
}

export function installEarlyRaid(game, ui) {
  const root = document.createElement('section');
  root.id = 'early-raid'; root.hidden = true;
  root.innerHTML = '<p aria-live="polite"></p><div><button type="button" data-raid="arm"></button><button type="button" data-raid="cancel" hidden></button><button type="button" data-raid="confirm" hidden></button></div>';
  document.body.append(root);
  const blocked = () => ui.menuVisible || ui.settingsOpen || ui.gmOpen || ui.boonsOpen
    || ui.pauseOpen || !ui.el.howto.hidden || !!document.querySelector('dialog[open]');
  const control = createEarlyRaidControl(game, blocked);
  const buttons = Object.fromEntries([...root.querySelectorAll('button')].map(b => [b.dataset.raid, b]));
  const setText = (node, value) => { if (node.textContent !== value) node.textContent = value; };
  let last = 0, signature = '';
  function update(force = false) {
    const hidden = !canCallWave(game, blocked());
    if (hidden) control.cancel();
    root.hidden = hidden;
    if (hidden) { signature = ''; return; }
    const armed = control.isArmed();
    const now = performance.now();
    if (!force && now - last < 100) return;
    last = now;
    const state = [armed, document.documentElement.lang, Math.ceil(game.prepTimer)].join('|');
    if (signature === state) return;
    signature = state;
    setText(root.querySelector('p'), armed ? t('raid.warning', { seconds: Math.ceil(game.prepTimer) }) : t('raid.help'));
    for (const [action, b] of Object.entries(buttons)) {
      b.hidden = action === 'arm' ? armed : !armed;
      setText(b, t('raid.' + action));
    }
    root.classList.toggle('is-armed', armed);
  }
  for (const [action, b] of Object.entries(buttons)) {
    b.addEventListener('keydown', e => { if (e.repeat && ['Enter', ' '].includes(e.key)) e.preventDefault(); });
    b.onclick = () => {
      if (action === 'cancel') control.cancel();
      else if (action === 'arm') control.arm();
      else control.confirm();
      update(true);
      // 初次點擊的焦點落在取消；不讓連按 Enter 直接確認開戰。
      if (action === 'arm' && control.isArmed()) buttons.cancel.focus({ preventScroll: true });
    };
  }
  const old = ui.update.bind(ui);
  ui.update = (...args) => { old(...args); update(); };
  document.addEventListener('localechange', () => update(true));
  update(true);
  return { control, update };
}
