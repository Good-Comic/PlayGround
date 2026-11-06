import { battleArmy, battleCanAct } from './battle-actions.js';
import { getLocale, t } from './i18n.js';

// 僅掃描目前選取；沿用正式戰士定義。
export function recordedOrderActors(g) {
  const selected = [...new Set(g.selection || [])].filter(u => g.units.includes(u));
  return battleArmy({ units: selected }).filter(u => u.orderFailure === 'congested' || u.orderFailure === 'unreachable');
}

// 候選物件及世界都必須仍相同。
export function selectRecordedOrderGroup(g, group = recordedOrderActors(g), world = g.world, blocked = false) {
  if (world !== g.world || !battleCanAct(g, blocked) || g.heroControl || g.orderMode) return false;
  const actors = recordedOrderActors(g).filter(u => group.includes(u));
  if (!actors.length) return false;
  g.setSelection(actors);
  return true;
}

export function installRecordedOrderGroup(g, ui) {
  const host = document.querySelector('#battle-actions');
  const root = document.createElement('section');
  root.id = 'recorded-order-group'; root.hidden = true;
  root.innerHTML = '<div class="recorded-order-row"><span class="recorded-order-count"></span><button type="button" data-recorded-order-select></button></div><p class="recorded-order-history"></p><details><summary></summary><p class="recorded-order-reasons"></p><p class="recorded-order-current"></p></details>';
  host.append(root);
  const button = root.querySelector('button'), details = root.querySelector('details');
  const put = (selector, value) => { const node = root.querySelector(selector); if (node.textContent !== value) node.textContent = value; };
  const blocked = () => !!(document.body.classList.contains('planning-mode') || document.body.classList.contains('lining-up') || ui.menuVisible || ui.settingsOpen || ui.gmOpen || ui.boonsOpen || ui.pauseOpen || (ui.el?.howto && !ui.el.howto.hidden) || document.querySelector('dialog[open]'));
  let signature = '', lastPaint = -Infinity, group = [], world = null;
  const update = (force = false) => {
    const now = performance.now();
    const hidden = host.hidden || g.inMenu || !['prep', 'wave'].includes(g.phase) || blocked();
    if (hidden) { root.hidden = true; group = []; world = null; signature = ''; return; }
    if (!force && now - lastPaint < 120) return;
    lastPaint = now;
    const actors = recordedOrderActors(g);
    // 物件身分不靠 id：讀檔可能重用 id。
    group = actors; world = g.world;
    const disabled = !battleCanAct(g, blocked()) || !!g.heroControl || !!g.orderMode;
    const congested = actors.filter(u => u.orderFailure === 'congested').length;
    const unreachable = actors.length - congested;
    const next = [getLocale(), actors.length, congested, unreachable, disabled].join('|');
    root.hidden = !actors.length;
    if (signature === next) return;
    signature = next;
    if (!actors.length) { details.open = false; return; }
    root.setAttribute('aria-label', t('recordedOrder.title'));
    put('.recorded-order-count', t('recordedOrder.count', { count: actors.length }));
    put('button', t('recordedOrder.select', { count: actors.length }));
    button.disabled = disabled;
    put('.recorded-order-history', t('recordedOrder.history'));
    put('summary', t('recordedOrder.details'));
    put('.recorded-order-reasons', t('recordedOrder.reasons', { congested, unreachable }));
    put('.recorded-order-current', t('recordedOrder.current'));
  };
  // 讓瀏覽器處理 Tab、Enter、Space；僅阻止戰鬥全域捷徑。
  for (const control of [button, root.querySelector('summary')]) control.addEventListener('keydown', e => {
    if ([' ', 'Enter', 'Tab'].includes(e.key)) { e.stopPropagation(); if (e.repeat && e.key !== 'Tab') e.preventDefault(); }
  });
  button.addEventListener('click', () => {
    if (!root.hidden && !host.hidden) selectRecordedOrderGroup(g, group, world, blocked());
    update(true);
  });
  const original = ui.update.bind(ui);
  ui.update = (...args) => { const result = original(...args); update(); return result; };
  document.addEventListener('localechange', () => update(true));
  update(true);
  return { update, root };
}
