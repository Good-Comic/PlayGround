import { Sound } from './audio.js';
import { Game } from './game.js';
import { Renderer } from './renderer.js';
import { UI } from './ui.js';
import { clamp, seedFromDate, seedFromString } from './utils.js';

const canvas = document.getElementById('game');
const sound = new Sound();
const game = new Game({ sound });
const renderer = new Renderer(canvas);

let ui;
let currentSetup = { civ: 'TEU', biome: 'ashlands' };

function startGame(setup = {}) {
  currentSetup = { civ: setup.civ || 'TEU', biome: setup.biome || 'ashlands' };
  const seed = setup.seed ? seedFromString(setup.seed) : seedFromDate();
  game.newRun(seed, currentSetup);
  sound.init();
  ui.hideMenu();
  ui.hideEnd();
  ui.hideBoons();
  ui.showPause(false);
  ui.setPlacement(null);
  game.inMenu = false;
  game.paused = false;
  game.start();
  ui.lastSignature = '';
  ui.lastCommandSignature = '';
  ui.updateSelection(true);
  ui.renderCommands(game);
}

function restartRun() {
  sound.init();
  game.newRun(seedFromDate(), currentSetup);
  ui.hideEnd();
  ui.hideBoons();
  ui.showPause(false);
  ui.hideMenu();
  ui.setPlacement(null);
  game.start();
  ui.lastSignature = '';
  ui.lastCommandSignature = '';
  ui.updateSelection(true);
  ui.renderCommands(game);
}

function quitToMenu() {
  game.newRun(seedFromDate(), currentSetup);
  game.inMenu = true;
  ui.hideEnd();
  ui.hideBoons();
  ui.showPause(false);
  ui.setPlacement(null);
  ui.showMenu();
  menuNeedsFrame = true;
  ui.lastSignature = '';
  ui.lastCommandSignature = '';
  ui.updateSelection(true);
  ui.renderCommands(game);
}

function togglePauseGame() {
  if (game.inMenu || game.phase === 'boon' || game.phase === 'victory' || game.phase === 'defeat') return;
  const paused = game.togglePause();
  if (paused === null) return;
  ui.showPause(paused);
}

function resumeGame() {
  game.resume();
  ui.showPause(false);
}

ui = new UI(game, {
  sound,
  start: startGame,
  restart: restartRun,
  quit: quitToMenu,
  pause: togglePauseGame,
  resume: resumeGame,
  idle: () => game.selectIdleVillager(),
  command: id => game.command(id),
  minimap: (x, y) => game.focusAt(x, y),
  toggleSound: () => {
    sound.init();
    sound.setEnabled(!sound.enabled);
    return sound.enabled;
  },
});

game.hook('toast', (text, type, duration) => ui.toast(text, type, duration));
game.hook('boons', (choices, choose) => ui.showBoons(choices, choose));
game.hook('end', (victory, stats) => ui.showEnd(victory, stats));
game.hook('selectionChanged', () => ui.updateSelection(true));
game.hook('placement', placement => ui.setPlacement(placement));

ui.showMenu();
ui.setSound(true);

const movementKeys = new Set(['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright']);

window.addEventListener('keydown', e => {
  if (!ui.el.howto.hidden) {
    if (e.key === 'Escape') ui.closeHowTo();
    return;
  }
  if (ui.boonsOpen) return;
  if (game.inMenu) {
    if (e.key === 'Enter') { e.preventDefault(); ui.startWithSetup(); }
    return;
  }
  if (e.key === 'Escape') {
    if (game.placement) { game.cancelPlacement(); return; }
    if (ui.pauseOpen) { resumeGame(); return; }
    togglePauseGame();
    return;
  }
  if (e.code === 'Space') {
    e.preventDefault();
    togglePauseGame();
    return;
  }
  if (game.paused) return;
  const key = e.key.toLowerCase();
  if (movementKeys.has(key)) {
    game.keys.add(key);
    if (key.startsWith('arrow')) e.preventDefault();
    return;
  }
  if (e.key === 'Tab') {
    e.preventDefault();
    game.toggleHeroControl();
    ui.updateSelection(true);
    ui.renderCommands(game);
    return;
  }
  if (key === 'q') { game.heroMark(); return; }
  if (key === 'e') { game.heroAegis(); return; }
  if (key === 'i') { game.selectIdleVillager(); return; }
  if (key === 'm') {
    sound.init();
    sound.setEnabled(!sound.enabled);
    ui.setSound(sound.enabled);
    return;
  }
  if (/^[1-6]$/.test(e.key)) {
    const commands = ui.getCommands(game);
    const cmd = commands[Number(e.key) - 1];
    if (cmd) game.command(cmd.id);
  }
});

window.addEventListener('keyup', e => {
  game.keys.delete(e.key.toLowerCase());
});
window.addEventListener('blur', () => game.keys.clear());

function localPos(e) {
  const rect = canvas.getBoundingClientRect();
  return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}

canvas.addEventListener('contextmenu', e => e.preventDefault());

canvas.addEventListener('pointerdown', e => {
  if (game.inMenu || game.paused || ui.boonsOpen) return;
  const pos = localPos(e);
  game.mouse.x = pos.x; game.mouse.y = pos.y; game.mouse.dirty = true;
  if (e.button === 0) {
    if (game.placement) {
      game.placeCurrent();
      return;
    }
    game.dragBox = { x: pos.x, y: pos.y, w: 0, h: 0, startX: pos.x, startY: pos.y, moved: false, shift: e.shiftKey };
    canvas.setPointerCapture?.(e.pointerId);
    game.grabbing = true;
  } else if (e.button === 2) {
    e.preventDefault();
    game.issueCommand(pos.x, pos.y);
  } else if (e.button === 1) {
    e.preventDefault();
    game.panning = { x: pos.x, y: pos.y };
  }
});

canvas.addEventListener('pointermove', e => {
  const pos = localPos(e);
  game.mouse.x = pos.x; game.mouse.y = pos.y; game.mouse.dirty = true;
  if (game.dragBox) {
    game.dragBox.w = pos.x - game.dragBox.startX;
    game.dragBox.h = pos.y - game.dragBox.startY;
    if (Math.abs(game.dragBox.w) > 5 || Math.abs(game.dragBox.h) > 5) game.dragBox.moved = true;
    if (game.dragBox.w < 0) { game.dragBox.x = pos.x; game.dragBox.w = -game.dragBox.w; }
    if (game.dragBox.h < 0) { game.dragBox.y = pos.y; game.dragBox.h = -game.dragBox.h; }
  }
  if (game.panning) {
    const dx = pos.x - game.panning.x, dy = pos.y - game.panning.y;
    game.panning = { x: pos.x, y: pos.y };
    game.camera.targetX -= dx / game.camera.zoom;
    game.camera.targetY -= dy / game.camera.zoom;
    game.camera.x = game.camera.targetX;
    game.camera.y = game.camera.targetY;
  }
  if (game.placement) game.updatePlacementAtMouse();
});

canvas.addEventListener('pointerleave', () => {
  if (!game.dragBox) {
    game.hovered = null;
    game.hoveredResource = null;
  }
});

window.addEventListener('pointerup', e => {
  if (e.button === 0 && game.dragBox) {
    const box = game.dragBox;
    game.dragBox = null;
    game.grabbing = false;
    if (box.moved) game.selectBox(box.x, box.y, box.w, box.h, box.shift);
    else game.selectAt(box.startX, box.startY, box.shift);
  }
  if (e.button === 1) game.panning = null;
});

canvas.addEventListener('wheel', e => {
  if (game.inMenu || game.paused || ui.boonsOpen) return;
  e.preventDefault();
  const factor = e.deltaY > 0 ? 0.92 : 1.08;
  game.camera.targetZoom = clamp(game.camera.targetZoom * factor, 0.78, 1.6);
}, { passive: false });

window.addEventListener('resize', () => renderer.resize());

let last = performance.now();
let menuNeedsFrame = true;
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (game.inMenu) {
    if (menuNeedsFrame) {
      menuNeedsFrame = false;
      game.update(dt);
      renderer.draw(game, game.time);
      ui.update(game);
    }
    requestAnimationFrame(frame);
    return;
  }
  game.update(dt);
  renderer.draw(game, game.time);
  ui.update(game);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

window.addEventListener('resize', () => { menuNeedsFrame = true; });

window.ageOfAsh = { game, renderer, ui, startGame, restartRun, seedFromString };

window.addEventListener('error', e => {
  console.error(e.error || e.message);
});
