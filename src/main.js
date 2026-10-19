import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { World } from './world.js';
import { Game, UNIT_TYPES, TECHS } from './game.js';
import { UI } from './ui.js';
import { axialKey, axialToWorld, clamp } from './core.js';

const canvas = document.getElementById('scene');

/* ---------------- renderer ---------------- */
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
renderer.setSize(window.innerWidth, window.innerHeight, false);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a1622);
scene.fog = new THREE.Fog(0xa9c6da, 62, 150);

const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.5, 1100);

/* ---------------- lights ---------------- */
const sunDir = new THREE.Vector3(0.62, 0.52, 0.42).normalize();
const sun = new THREE.DirectionalLight(0xfff0d6, 2.05);
sun.position.copy(sunDir.clone().multiplyScalar(70));
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
sun.shadow.camera.near = 1;
sun.shadow.camera.far = 170;
sun.shadow.camera.left = -34;
sun.shadow.camera.right = 34;
sun.shadow.camera.top = 34;
sun.shadow.camera.bottom = -34;
sun.shadow.bias = -0.0006;
sun.shadow.normalBias = 0.03;
scene.add(sun);
scene.add(sun.target);

const hemi = new THREE.HemisphereLight(0xbcd9ee, 0x6a5a44, 0.85);
scene.add(hemi);
const fill = new THREE.DirectionalLight(0x9fc4e0, 0.4);
fill.position.set(-0.5, 0.6, -0.6);
scene.add(fill);
const ambient = new THREE.AmbientLight(0xffffff, 0.22);
scene.add(ambient);

/* ---------------- world + game ---------------- */
const world = new World(scene, { seed: 20261019, cols: 21, rows: 13, sunDir });
const game = new Game(world);
game.setup();

const sunTarget = world.civs.get(game.playerId).capital.tile;
sun.position.copy(sunDir.clone().multiplyScalar(70).add(new THREE.Vector3(sunTarget.x, 0, sunTarget.z)));
sun.target.position.set(sunTarget.x, 0, sunTarget.z);
sun.target.updateMatrixWorld();

/* ---------------- camera controls ---------------- */
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 6;
controls.maxDistance = 52;
controls.maxPolarAngle = 1.31;
controls.minPolarAngle = 0.22;
controls.panSpeed = 0.85;
controls.rotateSpeed = 0.6;
controls.zoomSpeed = 0.9;
controls.screenSpacePanning = false;

function setCameraTo(tile, opts = {}) {
  const pos = new THREE.Vector3(tile.x, tile.h, tile.z);
  controls.target.copy(pos);
  spawnCamera(pos, opts.distance ?? 15, opts.azimuth ?? -0.62, opts.polar ?? 0.92);
}
function spawnCamera(target, distance, azimuth, polar) {
  const offset = new THREE.Vector3(
    Math.sin(polar) * Math.sin(azimuth),
    Math.cos(polar),
    Math.sin(polar) * Math.cos(azimuth)
  ).multiplyScalar(distance);
  camera.position.copy(target.clone().add(offset));
  controls.update();
}
setCameraTo(sunTarget, { distance: 19, azimuth: -0.82, polar: 0.8 });

/* ---------------- UI ---------------- */
const ui = new UI(game, world);

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let hoverTile = null;
let selectedRange = null;
let downPos = null;
let downButton = 0;
let lastInteraction = performance.now();
let focusHighlight = null;
const targetPoint = new THREE.Vector3();

function tileFromEvent(clientX, clientY) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObject(world.terrainMesh, false);
  if (hits.length) return world.tileAtPoint(hits[0].point);
  return null;
}

function computeRange(unit) {
  if (!unit) return;
  const { moves, attacks, prev, best } = game.reachable(unit);
  const pathFor = (tile) => {
    const path = [];
    let key = tile.key;
    const startKey = axialKey(unit.q, unit.r);
    let guard = 0;
    while (key !== startKey && guard++ < 60) {
      path.unshift(world.tiles.get(key));
      key = prev.get(key);
      if (!key) break;
    }
    return path;
  };
  selectedRange = { unit, moves, attacks, pathFor };
  world.showMoveRange(moves, attacks);
}

function refreshRange() {
  if (game.selected?.type === 'unit' && game.selected.ref.moves > 0) computeRange(game.selected.ref);
  else if (game.selected?.type === 'unit') { computeRange(game.selected.ref); }
  else { world.clearMoveRange(); selectedRange = null; }
}

async function handleClick(clientX, clientY) {
  if (game.busy) return;
  const tile = tileFromEvent(clientX, clientY);
  if (!tile) return;
  const player = world.civs.get(game.playerId);
  // select own unit
  const ownUnit = tile.units.find((u) => u.civId === game.playerId);
  if (ownUnit && !ownUnit.asleep) {
    game.select('unit', ownUnit);
    return;
  }
  // select own city
  if (tile.city && tile.city.civId === game.playerId) {
    game.select('city', tile.city);
    return;
  }
  // if a unit is selected, order move/attack
  const sel = game.selected;
  if (sel?.type === 'unit') {
    const unit = sel.ref;
    if (selectedRange && selectedRange.unit === unit) {
      if (selectedRange.attacks.some((t) => t.key === tile.key)) {
        await game.attack(unit, tile);
        if (unit.hp > 0) computeRange(unit);
        return;
      }
      if (selectedRange.moves.some((t) => t.key === tile.key)) {
        const path = selectedRange.pathFor(tile);
        await game.moveUnit(unit, tile.q, tile.r, path);
        computeRange(unit);
        return;
      }
    }
    // click empty far tile: ignore but keep selection; allow deselect if same
    if (tile.key === axialKey(unit.q, unit.r)) return;
    return;
  }
  if (sel?.type === 'city') return;
  // nothing selected: show tile info via selection? select city under cursor enemy
  if (tile.city && tile.city.civId !== game.playerId && tile.city.civ.met) {
    game.select('city', tile.city);
  }
}

/* ---------------- Actions from UI ---------------- */
ui.setActions({
  command(name) {
    const sel = game.selected;
    const player = world.civs.get(game.playerId);
    switch (name) {
      case 'endTurn': game.endTurn(); break;
      case 'tech': ui.techTree(); break;
      case 'help': ui.helpModal(); break;
      case 'found': if (sel?.type === 'unit' && UNIT_TYPES[sel.ref.type].found) game.foundCity(sel.ref); break;
      case 'improve': if (sel?.type === 'unit' && UNIT_TYPES[sel.ref.type].build) game.improve(sel.ref); break;
      case 'fortify': if (sel?.type === 'unit') game.fortify(sel.ref); break;
      case 'sleep': if (sel?.type === 'unit') game.sleep(sel.ref); break;
      case 'skip': if (sel?.type === 'unit') { sel.ref.moves = 0; game.emit('change'); } break;
      case 'cityPanel': if (sel?.type === 'city') ui.cityModal(sel.ref); break;
      case 'next': selectNextUnit(); break;
      default: break;
    }
    if (game.selected?.type === 'unit') refreshRange();
  },
  focusTile(q, r) {
    const tile = world.tiles.get(axialKey(q, r));
    if (!tile) return;
    animateTarget(new THREE.Vector3(tile.x, tile.h, tile.z));
  },
  getCameraTarget() { return controls.target; },
});

function selectNextUnit() {
  const player = world.civs.get(game.playerId);
  const ready = player.units.filter((u) => u.moves > 0 && !u.asleep);
  if (!ready.length) { game.select(null); return; }
  const current = game.selected?.type === 'unit' ? game.selected.ref : null;
  const idx = current ? ready.indexOf(current) : -1;
  const next = ready[(idx + 1) % ready.length];
  game.select('unit', next);
  animateTarget(new THREE.Vector3(next.tile.x, next.tile.h, next.tile.z));
}

function animateTarget(point) {
  tweenTarget = { from: controls.target.clone(), to: point, t: 0 };
}
let tweenTarget = null;

/* ---------------- input ---------------- */
renderer.domElement.addEventListener('pointerdown', (e) => {
  downPos = { x: e.clientX, y: e.clientY, button: e.button };
  downButton = e.button;
  lastInteraction = performance.now();
});
renderer.domElement.addEventListener('pointerup', async (e) => {
  if (!downPos) return;
  const moved = Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y);
  lastInteraction = performance.now();
  if (downButton === 0 && moved < 6) await handleClick(e.clientX, e.clientY);
  downPos = null;
});
renderer.domElement.addEventListener('pointermove', (e) => {
  lastInteraction = performance.now();
  const tile = tileFromEvent(e.clientX, e.clientY);
  hoverTile = tile;
  world.setHoverRing(tile);
  if (tile) ui.showTooltip(tile, e.clientX, e.clientY);
  else ui.hideTooltip();
});
renderer.domElement.addEventListener('pointerleave', () => { world.setHoverRing(null); ui.hideTooltip(); });
renderer.domElement.addEventListener('contextmenu', (e) => e.preventDefault());
renderer.domElement.addEventListener('wheel', () => { lastInteraction = performance.now(); }, { passive: true });

window.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  const key = e.key.toLowerCase();
  const sel = game.selected;
  if (key === 'escape') { ui.closeModal(); game.select(null); return; }
  if (game.busy) return;
  switch (key) {
    case ' ': case 'enter': e.preventDefault(); game.endTurn(); break;
    case 't': ui.techTree(); break;
    case 'c':
      if (sel?.type === 'city') ui.cityModal(sel.ref);
      else if (sel?.type === 'unit') { const t = world.tiles.get(axialKey(sel.ref.q, sel.ref.r)); if (t.city && t.city.civId === game.playerId) ui.cityModal(t.city); }
      else { const cap = world.civs.get(game.playerId).capital; if (cap) ui.cityModal(cap); }
      break;
    case 'n': selectNextUnit(); break;
    case 'f': if (sel?.type === 'unit' && UNIT_TYPES[sel.ref.type].found) game.foundCity(sel.ref); break;
    case 'b': if (sel?.type === 'unit' && UNIT_TYPES[sel.ref.type].build) game.improve(sel.ref); break;
    case 'z': if (sel?.type === 'unit') game.sleep(sel.ref); break;
    case 'h': ui.helpModal(); break;
    default: break;
  }
  if (game.selected?.type === 'unit') refreshRange();
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight, false);
});

/* selection ring + range updates */
game.on('selection', (sel) => {
  if (sel?.type === 'unit') {
    const tile = world.tiles.get(axialKey(sel.ref.q, sel.ref.r));
    world.setSelectionRing(tile);
    refreshRange();
  } else if (sel?.type === 'city') {
    world.setSelectionRing(sel.ref.tile);
    world.clearMoveRange();
    selectedRange = null;
  } else {
    world.setSelectionRing(null);
    world.clearMoveRange();
    selectedRange = null;
  }
});
game.on('change', () => {
  if (game.selected?.type === 'unit') {
    world.setSelectionRing(world.tiles.get(axialKey(game.selected.ref.q, game.selected.ref.r)));
  }
});
game.on('turnEnd', () => { refreshRange(); });

/* ---------------- loop ---------------- */
let prevTime = performance.now();
let minimapTimer = 0;
let frame = 0;
function tick() {
  requestAnimationFrame(tick);
  const now = performance.now();
  const dt = Math.min((now - prevTime) / 1000, 0.05);
  prevTime = now;
  frame++;
  world.update(dt, camera);
  if (tweenTarget) {
    tweenTarget.t = Math.min(1, tweenTarget.t + dt * 1.6);
    const e = tweenTarget.t * tweenTarget.t * (3 - 2 * tweenTarget.t);
    controls.target.lerpVectors(tweenTarget.from, tweenTarget.to, e);
    if (tweenTarget.t >= 1) tweenTarget = null;
  }
  controls.update();
  // keep target above terrain and within map
  const b = world.bounds;
  controls.target.x = clamp(controls.target.x, b.minX, b.maxX);
  controls.target.z = clamp(controls.target.z, b.minZ, b.maxZ);
  controls.target.y = clamp(controls.target.y, 0, 6);
  minimapTimer += dt;
  if (minimapTimer > 0.45) { minimapTimer = 0; ui.drawMinimap(); }
  renderer.render(scene, camera);
}
tick();

/* ---------------- reveal & landing ---------------- */
setTimeout(() => {
  ui.el.loading.classList.add('gone');
  ui.toast({ title: 'The Age of Antiquity', body: 'Your people look to you, Empress. Lead them well.', kind: 'info', icon: 'i-wonder' });
}, 700);

window.__civ = { game, world, ui, camera, controls };
