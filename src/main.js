import { AudioEngine } from './audio.js';
import { initI18n } from './i18n.js';
import { Game } from './game.js';
import { Renderer } from './renderer.js';
import { UI } from './ui.js';
import { MAP_H, MAP_W, clamp } from './utils.js';

initI18n();
const canvas = document.getElementById('game');
const audio = new AudioEngine();
const game = new Game(audio);
const renderer = new Renderer(canvas, game);

const keys = new Set();
const groups = new Map();
let pointer = { x: 0, y: 0, worldX: 0, worldY: 0 };
let panning = false;
let panStart = null;
let cameraStart = null;
let selecting = false;
let selectionStart = null;
let selectionCurrent = null;
let dragMoved = false;
let lastClick = { time: 0, kind: null };

function clampCamera() {
  game.camera.zoom = clamp(game.camera.zoom, .72, 1.75);
  const marginX = 110;
  const marginTop = 70;
  const marginBottom = 180;
  game.camera.x = clamp(game.camera.x, -1152 - marginX, 1152 + marginX);
  game.camera.y = clamp(game.camera.y, -marginTop, 1152 + marginBottom);
}

const actions = {
  play() {
    audio.init();
    audio.play('click');
    game.start();
  },
  playAgain() {
    audio.init();
    game.playAgain();
    clampCamera();
  },
  restart() {
    audio.init();
    game.playAgain();
    clampCamera();
  },
  mainMenu() {
    game.returnToMenu();
    clampCamera();
    audio.play('click');
  },
  togglePause() {
    if (game.state !== 'playing') return;
    game.togglePause();
  },
  centerCamera(x, y) {
    game.centerCameraOn(x, y);
    clampCamera();
  }
};

const ui = new UI(game, renderer, audio, actions);
window.__aoe = { game, renderer, ui, audio, actions };
clampCamera();

function updatePointer(clientX, clientY) {
  pointer.x = clientX;
  pointer.y = clientY;
  const world = renderer.screenToWorld(clientX, clientY);
  pointer.worldX = world.x;
  pointer.worldY = world.y;
  if (game.placement) game.updatePlacement(world.x, world.y);
  const hovered = game.state === 'playing' ? game.entityAt(world.x, world.y) : null;
  canvas.style.cursor = game.placement ? 'crosshair' : hovered ? 'pointer' : 'default';
}

function pickBox(x1, y1, x2, y2, additive) {
  const left = Math.min(x1, x2);
  const right = Math.max(x1, x2);
  const top = Math.min(y1, y2);
  const bottom = Math.max(y1, y2);
  const selected = [];
  for (const unit of game.units) {
    if (unit.team !== 'player' || unit.dead) continue;
    const point = renderer.worldToScreen(unit.x, unit.y);
    if (point.x >= left && point.x <= right && point.y >= top && point.y <= bottom) selected.push(unit);
  }
  if (selected.length) game.select(selected, additive);
  else if (!additive) game.clearSelection();
}

function selectAt(entity, additive) {
  if (!entity) {
    if (!additive) game.clearSelection();
    return;
  }
  const now = performance.now();
  const isDouble = now - lastClick.time < 330 && lastClick.kind === entity.kind;
  lastClick = { time: now, kind: entity.kind };
  if (isDouble && entity.team === 'player') {
    const nearby = game.units.filter(unit => unit.team === 'player' && unit.kind === entity.kind && !unit.dead);
    game.select(nearby, additive);
    return;
  }
  game.select([entity], additive);
}

canvas.addEventListener('contextmenu', event => event.preventDefault());

canvas.addEventListener('pointerdown', event => {
  if (game.state !== 'playing') return;
  canvas.setPointerCapture(event.pointerId);
  updatePointer(event.clientX, event.clientY);
  if (event.button === 1) {
    event.preventDefault();
    panning = true;
    panStart = { x: event.clientX, y: event.clientY };
    cameraStart = { x: game.camera.x, y: game.camera.y };
    canvas.style.cursor = 'grabbing';
    return;
  }
  if (event.button === 2) {
    if (game.placement) {
      game.cancelPlacement();
      return;
    }
    if (game.paused) return;
    game.commandSelectedAt(pointer.worldX, pointer.worldY);
    return;
  }
  if (event.button !== 0) return;
  if (game.paused) return;
  if (game.placement) {
    game.confirmPlacement();
    return;
  }
  selecting = true;
  dragMoved = false;
  selectionStart = { x: event.clientX, y: event.clientY };
  selectionCurrent = { ...selectionStart };
});

canvas.addEventListener('pointermove', event => {
  updatePointer(event.clientX, event.clientY);
  if (panning && panStart) {
    game.camera.x = cameraStart.x - (event.clientX - panStart.x) / game.camera.zoom;
    game.camera.y = cameraStart.y - (event.clientY - panStart.y) / game.camera.zoom;
    clampCamera();
    return;
  }
  if (selecting && selectionStart) {
    selectionCurrent = { x: event.clientX, y: event.clientY };
    if (Math.hypot(selectionCurrent.x - selectionStart.x, selectionCurrent.y - selectionStart.y) > 7) dragMoved = true;
    if (dragMoved) {
      game.selectionBox = {
        x1: selectionStart.x, y1: selectionStart.y,
        x2: selectionCurrent.x, y2: selectionCurrent.y
      };
    }
  }
});

canvas.addEventListener('pointerup', event => {
  if (event.button === 1) {
    panning = false;
    panStart = null;
    canvas.style.cursor = 'default';
    return;
  }
  if (event.button !== 0) return;
  if (!selecting) return;
  selecting = false;
  game.selectionBox = null;
  if (!selectionStart) return;
  if (dragMoved) {
    pickBox(selectionStart.x, selectionStart.y, selectionCurrent.x, selectionCurrent.y, event.shiftKey);
  } else {
    const entity = game.entityAt(pointer.worldX, pointer.worldY);
    selectAt(entity, event.shiftKey);
  }
  selectionStart = null;
  selectionCurrent = null;
});

canvas.addEventListener('pointercancel', () => {
  panning = false;
  selecting = false;
  game.selectionBox = null;
  canvas.style.cursor = 'default';
});

canvas.addEventListener('wheel', event => {
  if (game.state !== 'playing') return;
  event.preventDefault();
  const oldZoom = game.camera.zoom;
  const nextZoom = clamp(oldZoom * (event.deltaY > 0 ? .92 : 1.08), .72, 1.75);
  if (nextZoom === oldZoom) return;
  const localX = (event.clientX - window.innerWidth / 2) / oldZoom + game.camera.x;
  const localY = (event.clientY - window.innerHeight / 2) / oldZoom + game.camera.y;
  game.camera.zoom = nextZoom;
  game.camera.x = localX - (event.clientX - window.innerWidth / 2) / nextZoom;
  game.camera.y = localY - (event.clientY - window.innerHeight / 2) / nextZoom;
  clampCamera();
}, { passive: false });

window.addEventListener('keydown', event => {
  if (event.defaultPrevented) return;
  const tag = event.target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA') return;
  if (event.key === 'Escape') {
    if (game.placement) { game.cancelPlacement(); return; }
    if (game.state === 'playing' && game.paused) {
      const pauseVisible = document.getElementById('modalRoot').querySelector('.pause-panel');
      if (pauseVisible) { game.setPaused(false); return; }
    }
    if (game.state === 'playing' && document.getElementById('modalRoot').children.length) return;
    if (game.state === 'playing') game.clearSelection();
  }
  if (game.state !== 'playing') return;
  if (event.key === ' ') {
    const pauseVisible = document.getElementById('modalRoot').querySelector('.pause-panel');
    const modalOpen = document.getElementById('modalRoot').children.length > 0;
    if (modalOpen && !pauseVisible) return;
    event.preventDefault();
    game.togglePause();
    return;
  }
  if (document.getElementById('modalRoot').children.length) return;
  if (event.key === 'Tab') {
    event.preventDefault();
    const villager = game.selectIdleVillager();
    if (villager) {
      game.centerCameraOn(villager.x, villager.y);
      clampCamera();
    }
    return;
  }
  if (event.key.toLowerCase() === 'h') {
    event.preventDefault();
    ui.openHelp();
    return;
  }
  if (event.key.toLowerCase() === 'f') {
    event.preventDefault();
    const tc = game.tc();
    if (tc) {
      game.select([tc]);
      game.centerCameraOn(tc.x + tc.w / 2, tc.y + tc.h / 2);
      clampCamera();
    }
    return;
  }
  if (/^[1-9]$/.test(event.key)) {
    const index = Number(event.key);
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();
      groups.set(index, game.selection.map(entity => entity.id));
      ui.toast(`Group ${index} assigned.`, 'info');
      return;
    }
    const ids = groups.get(index);
    if (ids && ids.length) {
      event.preventDefault();
      const entities = ids.map(id => game.entityMap.get(id)).filter(entity => entity && !entity.dead);
      if (entities.length) game.select(entities);
    }
    return;
  }
  if (['w', 'a', 's', 'd', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
    keys.add(event.key);
    event.preventDefault();
  }
});

window.addEventListener('keyup', event => {
  keys.delete(event.key);
});

window.addEventListener('blur', () => {
  keys.clear();
  panning = false;
  selecting = false;
  game.selectionBox = null;
});

const minimap = document.getElementById('minimap');
minimap.addEventListener('pointerup', () => { minimap.dragging = false; });
minimap.addEventListener('pointercancel', () => { minimap.dragging = false; });

function updateCamera(dt) {
  if (game.state !== 'playing' || game.paused) return;
  const speed = 520 * dt / game.camera.zoom;
  let dx = 0;
  let dy = 0;
  if (keys.has('a') || keys.has('ArrowLeft')) dx -= speed;
  if (keys.has('d') || keys.has('ArrowRight')) dx += speed;
  if (keys.has('w') || keys.has('ArrowUp')) dy -= speed;
  if (keys.has('s') || keys.has('ArrowDown')) dy += speed;
  if (dx || dy) {
    game.camera.x += dx;
    game.camera.y += dy;
    clampCamera();
  }
}

let last = performance.now();
let lastMenuPaint = 0;
let firstFrame = true;
function frame(now) {
  const dt = Math.min(.05, (now - last) / 1000);
  last = now;
  updateCamera(dt);
  const menuIdle = game.state === 'menu' && !firstFrame;
  if (!menuIdle || now - lastMenuPaint > 240) {
    game.update(dt);
    renderer.render(now);
    lastMenuPaint = now;
  }
  ui.update(dt);
  if (firstFrame) {
    firstFrame = false;
    const loading = document.getElementById('loadingScreen');
    loading.classList.add('done');
    loading.style.pointerEvents = 'none';
    setTimeout(() => loading.remove(), 700);
  }
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
