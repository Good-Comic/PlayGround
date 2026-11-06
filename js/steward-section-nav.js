export function installStewardSectionNav(dialog) {
  const nav = dialog.querySelector('[data-steward-section-nav]');
  if (!nav) return;
  const reveal = target => {
    const tail = dialog.querySelector('#steward-section-military');
    tail.style.minBlockSize = '';
    target.focus({ preventScroll: true });
    const top = Math.max(0, dialog.scrollTop + target.getBoundingClientRect().top
      - dialog.getBoundingClientRect().top - dialog.clientTop
      - nav.getBoundingClientRect().height - 8);
    const missing = top - Math.max(0, dialog.scrollHeight - dialog.clientHeight);
    if (missing > 0) tail.style.minBlockSize = `${tail.getBoundingClientRect().height + missing + 1}px`;
    dialog.scrollTo({ top, behavior: 'instant' });
  };
  nav.addEventListener('click', event => {
    const button = event.target.closest('button[data-steward-jump]');
    if (!button || !nav.contains(button)) return;
    const section = dialog.querySelector(`#${button.getAttribute('aria-controls')}`);
    const title = section?.querySelector('legend');
    if (!title) return;
    event.preventDefault();
    reveal(title);
  });
  for (const producer of dialog.querySelectorAll('details[data-producer]')) {
    producer.addEventListener('toggle', event => {
      if (event.target !== producer || !producer.open) return;
      queueMicrotask(() => {
        if (dialog.open && producer.isConnected && producer.open) reveal(producer.querySelector('summary'));
      });
    });
  }
}
