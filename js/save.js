const SAVE_KEY = 'riftwatch.run.v1';

export function hasSavedRun() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    const snapshot = JSON.parse(raw);
    return snapshot?.version === 1 && !!snapshot.seed && !!snapshot.civId && !!snapshot.biomeId;
  } catch {
    return false;
  }
}

export function saveRun(game) {
  if (!game || game.inMenu) return false;
  try {
    const snapshot = game.snapshot();
    localStorage.setItem(SAVE_KEY, JSON.stringify(snapshot));
    return true;
  } catch (error) {
    console.error('Unable to save run', error);
    return false;
  }
}

export function loadRun(game) {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    const snapshot = JSON.parse(raw);
    if (snapshot?.version !== 1) return false;
    game.restore(snapshot);
    return true;
  } catch (error) {
    console.error('Unable to load run', error);
    return false;
  }
}

export function clearSavedRun() {
  try { localStorage.removeItem(SAVE_KEY); } catch {}
}
