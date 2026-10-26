const SETTINGS_KEY = 'riftwatch.playtest.settings.v1';

export const DEFAULT_SETTINGS = {
  gameSpeed: 1,
  autoEconomy: true,
  autoMilitary: true,
  reducedMotion: false,
};

export function loadSettings() {
  try {
    const raw = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
    const speed = Number(raw.gameSpeed);
    return {
      gameSpeed: [0.75, 1, 1.25, 1.5].includes(speed) ? speed : DEFAULT_SETTINGS.gameSpeed,
      autoEconomy: raw.autoEconomy !== false,
      autoMilitary: raw.autoMilitary !== false,
      reducedMotion: raw.reducedMotion === true,
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings) {
  const normalized = {
    gameSpeed: [0.75, 1, 1.25, 1.5].includes(Number(settings.gameSpeed)) ? Number(settings.gameSpeed) : 1,
    autoEconomy: settings.autoEconomy !== false,
    autoMilitary: settings.autoMilitary !== false,
    reducedMotion: settings.reducedMotion === true,
  };
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(normalized)); } catch {}
  return normalized;
}

export function applySettings(settings) {
  document.body.classList.toggle('reduced-motion', !!settings.reducedMotion);
  document.documentElement.dataset.gameSpeed = String(settings.gameSpeed || 1);
}

export function resetSettings() {
  try { localStorage.removeItem(SETTINGS_KEY); } catch {}
  return { ...DEFAULT_SETTINGS };
}
