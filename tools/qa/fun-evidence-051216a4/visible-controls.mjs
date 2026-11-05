// 測試器的文件 nonce 與 DOM 身分；不讀取遊戲物件或使用遊戲 RNG。
export function captureVisibleUI() {
  const slot = Symbol.for('riftwatch.playerLab.visibleControls.v1');
  const registry = globalThis[slot] ||= { documentId: crypto.randomUUID(), next: 0, ids: new WeakMap() };
  const visible = e => {
    if (!e || !e.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) return false;
    const r = e.getBoundingClientRect();
    let x = Math.max(0, r.left), y = Math.max(0, r.top), right = Math.min(innerWidth, r.right), bottom = Math.min(innerHeight, r.bottom);
    for (let p = e.parentElement; p; p = p.parentElement) {
      const s = getComputedStyle(p);
      if (/auto|scroll|hidden|clip/.test(s.overflow + s.overflowX + s.overflowY)) {
        const q = p.getBoundingClientRect(); x = Math.max(x, q.left); y = Math.max(y, q.top); right = Math.min(right, q.right); bottom = Math.min(bottom, q.bottom);
      }
    }
    return right > x && bottom > y;
  };
  const controls = [];
  for (const e of document.querySelectorAll('button,input,select,summary,[role="button"],.boon-card')) {
    if (!visible(e)) continue;
    let key = registry.ids.get(e);
    if (!key) { key = `rw-ui-${registry.documentId}-${++registry.next}`; registry.ids.set(e, key); }
    e.dataset.playerControl = key;
    const r = e.getBoundingClientRect();
    controls.push({ key, selector: e.id ? '#' + e.id : e.name ? e.tagName.toLowerCase() + '[name="' + e.name + '"]' : e.dataset.command ? '[data-command="' + e.dataset.command + '"]' : '@' + key,
      label: (e.innerText || e.getAttribute('aria-label') || e.closest('label')?.innerText || '').trim().slice(0, 350), title: e.title || '', type: e.type, disabled: !!e.disabled,
      value: e.value, checked: e.checked, options: e.tagName === 'SELECT' ? [...e.options].map(o => ({ value: o.value, label: o.text })) : undefined,
      bounds: { x: r.x, y: r.y, w: r.width, h: r.height } });
  }
  const chunks = [], walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node;
  while (node = walker.nextNode()) {
    const e = node.parentElement;
    if (['SCRIPT', 'STYLE'].includes(e?.tagName) || !visible(e)) continue;
    const s = node.textContent.trim(); if (s && s.length < 1500) chunks.push(s);
  }
  return { text: chunks.join('\n').slice(0, 24000), controls, viewport: { width: innerWidth, height: innerHeight } };
}

// 原生id/name選取保持原介面；過期或猜測的舊數字別名不得改綁其他控制。
export function playerControlSelector(selector) {
  if (typeof selector !== 'string' || !selector.startsWith('@')) return selector;
  if (!/^@rw-ui-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-[1-9]\d*$/.test(selector)) return null;
  return '[data-player-control="' + selector.slice(1) + '"]';
}
