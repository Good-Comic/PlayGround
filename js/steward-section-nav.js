export function installStewardSectionNav(dialog) {
  const nav = dialog.querySelector('[data-steward-section-nav]');
  if (!nav) return;
  nav.addEventListener('click', event => {
    const button = event.target.closest('button[data-steward-jump]');
    if (!button || !nav.contains(button)) return;
    const section = dialog.querySelector(`#${button.getAttribute('aria-controls')}`);
    const title = section?.querySelector('legend');
    if (!title) return;
    event.preventDefault();
    title.focus({ preventScroll: true });
    const top = dialog.scrollTop + title.getBoundingClientRect().top
      - dialog.getBoundingClientRect().top - dialog.clientTop
      - nav.getBoundingClientRect().height - 8;
    dialog.scrollTo({ top: Math.max(0, top), behavior: 'instant' });
  });
}
