import { FRAME_CROPS as SAR_HERO_CROPS } from '../assets/sprites/sar-hero-crops.js';
import { FRAME_CROPS as FRK_HERO_CROPS } from '../assets/sprites/frk-hero-crops.js';
import { FRAME_CROPS as VIK_HERO_CROPS } from '../assets/sprites/vik-hero-crops.js';
import { FRAME_CROPS as AZT_HERO_CROPS } from '../assets/sprites/azt-hero-crops.js';
import { FRAME_CROPS as JPN_HERO_CROPS } from '../assets/sprites/jpn-hero-crops.js';
import { FRAME_CROPS as TEU_HERO_CROPS } from '../assets/sprites/teu-hero-crops.js';
const DIRECTIONS = ['E', 'SE', 'S', 'SW', 'W', 'NW', 'N', 'NE'];
const STATES = Object.freeze({
  idle: Object.freeze({ row: 0, frames: 2, fps: 2, loop: true }),
  walk: Object.freeze({ row: 1, frames: 2, fps: 7, loop: true }),
  attack: Object.freeze({ row: 2, frames: 2, fps: 10, loop: false }),
  hit: Object.freeze({ row: 3, frames: 2, fps: 12, loop: false }),
  death: Object.freeze({ row: 4, frames: 2, fps: 4, loop: false }),
});
const DIRECTION_MAP = Object.freeze(Object.fromEntries(DIRECTIONS.map((direction, index) => [direction, index])));

export const UNIT_SPRITE_ATLASES = Object.freeze({
  elephant: Object.freeze({
    id: 'elephant-v1', src: 'assets/sprites/elephant-atlas.png', bakedPose: true, cacheFrames: true,
    frame: Object.freeze({ width: 176, height: 176 }), anchor: Object.freeze({ x: 88, y: 96 }), directionsPerRow: 4,
    offset: Object.freeze({ x: 0, y: 0 }), scale: 1, directions: DIRECTION_MAP,
    states: Object.freeze(Object.fromEntries(Object.entries(STATES).map(([name, animation]) =>
      [name, Object.freeze({ ...animation, frames: 4, fps: animation.fps * 2 })]))),
  }),
  ...Object.fromEntries(['commander', 'recruiter', 'warlord', 'warlord2'].map(type => [type, Object.freeze({
    pickBody: Object.freeze({ x: 0, y: -28, rx: type === 'recruiter' ? 23 : 29, ry: 39 }),
    id: `${type}-v1`, src: `assets/sprites/${type}-atlas.png`, bakedPose: true, cacheFrames: true,
    frame: Object.freeze({ width: 176, height: 176 }), anchor: Object.freeze({ x: 88, y: 96 }), directionsPerRow: 4,
    offset: Object.freeze({ x: 0, y: 0 }), scale: 0.78, directions: DIRECTION_MAP,
    states: Object.freeze({
      ...Object.fromEntries(Object.entries(STATES).map(([name, animation]) =>
        [name, Object.freeze({ ...animation, frames: 4, fps: animation.fps * 2 })])),
      ...(type === 'commander' ? { cast: Object.freeze({ row: 5, frames: 4, fps: 4 / .6, loop: false }) } : {}),
    }),
  })])),
  ...Object.fromEntries(['spearman', 'guard'].map(type => [type, Object.freeze({
    id: `${type}-migration-v1`, src: `assets/sprites/${type}-atlas.png`,
    frame: Object.freeze({ width: 128, height: 160 }), anchor: Object.freeze({ x: 64, y: 88 }),
    offset: Object.freeze({ x: 0, y: 0 }), scale: 0.78, directions: DIRECTION_MAP,
    states: Object.freeze(Object.fromEntries(Object.entries(STATES).map(([name, animation]) =>
      [name, Object.freeze({ ...animation, frames: 4, fps: animation.fps * 2 })]))),
  })])),
  chu_ko_nu: Object.freeze({
    id: 'chu-ko-nu-v1', src: 'assets/sprites/chu-ko-nu-atlas.png',
    frame: Object.freeze({ width: 80, height: 80 }), anchor: Object.freeze({ x: 40, y: 64 }),
    offset: Object.freeze({ x: 0, y: 0 }), scale: 0.78, directions: DIRECTION_MAP,
    states: Object.freeze(Object.fromEntries(Object.entries(STATES).map(([name, animation]) =>
      [name, Object.freeze({ ...animation, frames: 4, fps: animation.fps * 2 })]))),
  }),
  militia: Object.freeze({
    id: 'militia-v1',
    src: 'assets/sprites/militia-atlas.svg',
    frame: Object.freeze({ width: 64, height: 64 }),
    anchor: Object.freeze({ x: 32, y: 54 }),
    offset: Object.freeze({ x: 0, y: 0 }),
    scale: 0.78,
    directions: DIRECTION_MAP,
    states: STATES,
  }),
  archer: Object.freeze({
    id: 'archer-v1', src: 'assets/sprites/archer-atlas.svg',
    frame: Object.freeze({ width: 64, height: 64 }), anchor: Object.freeze({ x: 32, y: 54 }),
    offset: Object.freeze({ x: 0, y: 0 }), scale: 0.76, directions: DIRECTION_MAP, states: STATES,
  }),
  light_cavalry: Object.freeze({
    id: 'light-cavalry-v1', src: 'assets/sprites/light-cavalry-atlas.svg',
    frame: Object.freeze({ width: 80, height: 64 }), anchor: Object.freeze({ x: 40, y: 54 }),
    offset: Object.freeze({ x: 0, y: 0 }), scale: 0.88, directions: DIRECTION_MAP, states: STATES,
  }),
});

export const CIV_UNIT_SPRITE_ATLASES = Object.freeze({
  'BYZ:spearman': Object.freeze({
    pickBody: Object.freeze({ x: 0, y: -34, rx: 24, ry: 46 }),
    id: 'byz-spearman-v1', src: 'assets/sprites/byz-spearman-atlas.png', bakedPose: true, cacheFrames: true,
    frame: Object.freeze({ width: 192, height: 192 }), anchor: Object.freeze({ x: 96, y: 112 }), directionsPerRow: 4,
    offset: Object.freeze({ x: 0, y: 0 }), scale: .78, directions: DIRECTION_MAP, healthBarHeight: 68,
    states: UNIT_SPRITE_ATLASES.elephant.states,
  }),
  'AZT:militia': Object.freeze({
    pickBody: Object.freeze({ x: -2, y: -38, rx: 26, ry: 48 }),
    id: 'azt-militia-v1', src: 'assets/sprites/azt-militia-atlas.png', bakedPose: true, cacheFrames: true,
    frame: Object.freeze({ width: 192, height: 192 }), anchor: Object.freeze({ x: 96, y: 112 }), directionsPerRow: 4,
    offset: Object.freeze({ x: 0, y: 0 }), scale: .78, directions: DIRECTION_MAP, healthBarHeight: 72,
    states: UNIT_SPRITE_ATLASES.elephant.states,
  }),
  'TEU:guard': Object.freeze({
    pickBody: Object.freeze({ x: 0, y: -28, rx: 23, ry: 37 }),
    id: 'teu-guard-v1', src: 'assets/sprites/teu-guard-atlas.png', bakedPose: true, cacheFrames: true,
    frame: Object.freeze({ width: 192, height: 192 }), anchor: Object.freeze({ x: 96, y: 112 }), directionsPerRow: 4,
    offset: Object.freeze({ x: 0, y: 0 }), scale: .78, directions: DIRECTION_MAP, healthBarHeight: 60,
    states: UNIT_SPRITE_ATLASES.elephant.states,
  }),
  'SAR:commander': Object.freeze({
    pickBody: Object.freeze({ x: 0, y: -36, rx: 31, ry: 47 }),
    id: 'sar-hero-v1', src: 'assets/sprites/sar-hero-atlas.png', bakedPose: true, cacheFrames: true,
    frame: Object.freeze({ width: 208, height: 208 }), anchor: Object.freeze({ x: 104, y: 120 }), directionsPerRow: 4,
    offset: Object.freeze({ x: 0, y: 0 }), scale: .82, directions: DIRECTION_MAP, healthBarHeight: 82,
    heroEmblem: 'saracen', frameCrops: SAR_HERO_CROPS, states: UNIT_SPRITE_ATLASES.commander.states,
  }),
  'FRK:commander': Object.freeze({
    pickBody: Object.freeze({ x: 0, y: -36, rx: 31, ry: 47 }),
    id: 'frk-hero-v1', src: 'assets/sprites/frk-hero-atlas.png', bakedPose: true, cacheFrames: true,
    frame: Object.freeze({ width: 208, height: 208 }), anchor: Object.freeze({ x: 104, y: 120 }), directionsPerRow: 4,
    offset: Object.freeze({ x: 0, y: 0 }), scale: .82, directions: DIRECTION_MAP, healthBarHeight: 82,
    heroEmblem: 'frankish', frameCrops: FRK_HERO_CROPS, states: UNIT_SPRITE_ATLASES.commander.states,
  }),
  'VIK:commander': Object.freeze({
    pickBody: Object.freeze({ x: 0, y: -36, rx: 31, ry: 47 }),
    id: 'vik-hero-v1', src: 'assets/sprites/vik-hero-atlas.png', bakedPose: true, cacheFrames: true,
    frame: Object.freeze({ width: 208, height: 208 }), anchor: Object.freeze({ x: 104, y: 120 }), directionsPerRow: 4,
    offset: Object.freeze({ x: 0, y: 0 }), scale: .82, directions: DIRECTION_MAP, healthBarHeight: 82,
    heroEmblem: 'norse', frameCrops: VIK_HERO_CROPS, states: UNIT_SPRITE_ATLASES.commander.states,
  }),
  'AZT:commander': Object.freeze({
    pickBody: Object.freeze({ x: 0, y: -36, rx: 31, ry: 47 }),
    id: 'azt-hero-v1', src: 'assets/sprites/azt-hero-atlas.png', bakedPose: true, cacheFrames: true,
    frame: Object.freeze({ width: 208, height: 208 }), anchor: Object.freeze({ x: 104, y: 120 }), directionsPerRow: 4,
    offset: Object.freeze({ x: 0, y: 0 }), scale: .82, directions: DIRECTION_MAP, healthBarHeight: 82,
    heroEmblem: 'jaguar', frameCrops: AZT_HERO_CROPS, states: UNIT_SPRITE_ATLASES.commander.states,
  }),
  'JPN:commander': Object.freeze({
    pickBody: Object.freeze({ x: 0, y: -33, rx: 30, ry: 47 }),
    id: 'jpn-hero-v1', src: 'assets/sprites/jpn-hero-atlas.png', bakedPose: true, cacheFrames: true,
    frame: Object.freeze({ width: 208, height: 208 }), anchor: Object.freeze({ x: 104, y: 120 }), directionsPerRow: 4,
    offset: Object.freeze({ x: 0, y: 0 }), scale: .82, directions: DIRECTION_MAP, healthBarHeight: 80,
    heroEmblem: 'samurai', frameCrops: JPN_HERO_CROPS, states: UNIT_SPRITE_ATLASES.commander.states,
  }),
  'TEU:commander': Object.freeze({
    pickBody: Object.freeze({ x: 0, y: -36, rx: 32, ry: 48 }),
    id: 'teu-hero-v1', src: 'assets/sprites/teu-hero-atlas.png', bakedPose: true, cacheFrames: true,
    frame: Object.freeze({ width: 208, height: 208 }), anchor: Object.freeze({ x: 104, y: 120 }), directionsPerRow: 4,
    offset: Object.freeze({ x: 0, y: 0 }), scale: .82, directions: DIRECTION_MAP, healthBarHeight: 80,
    heroEmblem: 'teutonic', frameCrops: TEU_HERO_CROPS, states: UNIT_SPRITE_ATLASES.commander.states,
  }),
  'TUR:archer': Object.freeze({
    pickBody: Object.freeze({ x: 0, y: -28, rx: 24, ry: 43 }),
    id: 'tur-archer-v1', src: 'assets/sprites/tur-archer-atlas.png', bakedPose: true, cacheFrames: true,
    frame: Object.freeze({ width: 192, height: 192 }), anchor: Object.freeze({ x: 96, y: 112 }), directionsPerRow: 4,
    offset: Object.freeze({ x: 0, y: 0 }), scale: .78, directions: DIRECTION_MAP, healthBarHeight: 65,
    states: UNIT_SPRITE_ATLASES.elephant.states,
  }),
  'SAR:guard': Object.freeze({
    pickBody: Object.freeze({ x: 0, y: -29, rx: 25, ry: 41 }),
    id: 'sar-guard-v1', src: 'assets/sprites/sar-guard-atlas.png', bakedPose: true, cacheFrames: true,
    frame: Object.freeze({ width: 192, height: 192 }), anchor: Object.freeze({ x: 96, y: 112 }), directionsPerRow: 4,
    offset: Object.freeze({ x: 0, y: 0 }), scale: .78, directions: DIRECTION_MAP, healthBarHeight: 64,
    states: UNIT_SPRITE_ATLASES.elephant.states,
  }),
  'SPA:spearman': Object.freeze({
    pickBody: Object.freeze({ x: 0, y: -28, rx: 24, ry: 39 }),
    id: 'spa-spearman-v1', src: 'assets/sprites/spa-spearman-atlas.png', bakedPose: true, cacheFrames: true,
    frame: Object.freeze({ width: 192, height: 192 }), anchor: Object.freeze({ x: 96, y: 112 }), directionsPerRow: 4,
    offset: Object.freeze({ x: 0, y: 0 }), scale: .78, directions: DIRECTION_MAP, healthBarHeight: 62,
    states: UNIT_SPRITE_ATLASES.elephant.states,
  }),
  'GOT:militia': Object.freeze({
    pickBody: Object.freeze({ x: 0, y: -30, rx: 25, ry: 38 }),
    id: 'got-militia-v1', src: 'assets/sprites/got-militia-atlas.png', bakedPose: true, cacheFrames: true,
    frame: Object.freeze({ width: 192, height: 192 }), anchor: Object.freeze({ x: 96, y: 112 }), directionsPerRow: 4,
    offset: Object.freeze({ x: 0, y: 0 }), scale: .78, directions: DIRECTION_MAP, healthBarHeight: 62,
    states: UNIT_SPRITE_ATLASES.elephant.states,
  }),
  'MAG:light_cavalry': Object.freeze({
    pickBody: Object.freeze({ x: 0, y: -34, rx: 31, ry: 46 }),
    id: 'mag-cavalry-v1', src: 'assets/sprites/mag-cavalry-atlas.png', bakedPose: true, cacheFrames: true,
    frame: Object.freeze({ width: 192, height: 192 }), anchor: Object.freeze({ x: 96, y: 112 }), directionsPerRow: 4,
    offset: Object.freeze({ x: 0, y: 0 }), scale: .88, directions: DIRECTION_MAP, healthBarHeight: 74,
    states: UNIT_SPRITE_ATLASES.elephant.states,
  }),
  'FRK:light_cavalry': Object.freeze({
    pickBody: Object.freeze({ x: 0, y: -34, rx: 33, ry: 42 }),
    healthBarHeight: 68,
    id: 'frk-cavalry-v1', src: 'assets/sprites/frk-cavalry-atlas.png', bakedPose: true, cacheFrames: true,
    frame: Object.freeze({ width: 176, height: 176 }), anchor: Object.freeze({ x: 88, y: 96 }), directionsPerRow: 4,
    offset: Object.freeze({ x: 0, y: 0 }), scale: .88, directions: DIRECTION_MAP,
    states: UNIT_SPRITE_ATLASES.elephant.states,
  }),
  'JPN:guard': Object.freeze({
    id: 'jpn-lamellar-v1', src: 'assets/sprites/jpn-lamellar-atlas.png', bakedPose: true, cacheFrames: true,
    frame: Object.freeze({ width: 128, height: 128 }), anchor: Object.freeze({ x: 64, y: 88 }), directionsPerRow: 4,
    offset: Object.freeze({ x: 0, y: 0 }), scale: .78, directions: DIRECTION_MAP,
    states: UNIT_SPRITE_ATLASES.elephant.states,
  }),
  'VIK:guard': Object.freeze({
    id: 'vik-roundshield-v1', src: 'assets/sprites/vik-roundshield-atlas.png', bakedPose: true, cacheFrames: true,
    frame: Object.freeze({ width: 128, height: 128 }), anchor: Object.freeze({ x: 64, y: 88 }), directionsPerRow: 4,
    offset: Object.freeze({ x: 0, y: 0 }), scale: .78, directions: DIRECTION_MAP,
    states: UNIT_SPRITE_ATLASES.elephant.states,
  }),
  'BRI:archer': Object.freeze({
    id: 'bri-longbow-v1', src: 'assets/sprites/bri-longbow-atlas.png', bakedPose: true, cacheFrames: true,
    frame: Object.freeze({ width: 128, height: 128 }), anchor: Object.freeze({ x: 64, y: 88 }), directionsPerRow: 4,
    offset: Object.freeze({ x: 0, y: 0 }), scale: .78, directions: DIRECTION_MAP,
    states: UNIT_SPRITE_ATLASES.elephant.states,
  }),
  'KOR:patrol_cart': Object.freeze({
    id: 'kor-patrol-cart-v1', src: 'assets/sprites/kor-patrol-cart-atlas.png', bakedPose: true, cacheFrames: true,
    frame: Object.freeze({ width: 176, height: 176 }), anchor: Object.freeze({ x: 88, y: 96 }), directionsPerRow: 4,
    offset: Object.freeze({ x: 0, y: 0 }), scale: .9, directions: DIRECTION_MAP,
    states: UNIT_SPRITE_ATLASES.elephant.states,
  }),
  'MNG:horse_archer': Object.freeze({
    id: 'mng-horse-archer-v1', src: 'assets/sprites/mng-horse-archer-atlas.png', bakedPose: true, cacheFrames: true,
    frame: Object.freeze({ width: 176, height: 176 }), anchor: Object.freeze({ x: 88, y: 96 }), directionsPerRow: 4,
    offset: Object.freeze({ x: 0, y: 0 }), scale: .88, directions: DIRECTION_MAP,
    states: UNIT_SPRITE_ATLASES.elephant.states,
  }),
});

export function unitSpriteAtlasKey(unit, civId) {
  const variant = `${civId}:${unit.type}`;
  return unit.team === 'player' && CIV_UNIT_SPRITE_ATLASES[variant] ? variant : unit.type;
}

// UI body picking only; never changes simulation radius, navigation or weapon range.
export function atlasBodyContains(unit, civId, sx, sy, ground, scale = 1) {
  const key = unitSpriteAtlasKey(unit, civId);
  const atlas = CIV_UNIT_SPRITE_ATLASES[key] || UNIT_SPRITE_ATLASES[key];
  const body = atlas?.pickBody;
  if (!body || ![sx, sy, ground?.x, ground?.y, scale].every(Number.isFinite) || scale <= 0) return false;
  const z = scale * atlas.scale;
  const dx = (sx - ground.x - body.x * z) / (body.rx * z);
  const dy = (sy - ground.y - body.y * z) / (body.ry * z);
  return dx * dx + dy * dy <= 1;
}

export function atlasFrame(atlas, direction, state, elapsed = 0, progress = null) {
  const directionIndex = atlas?.directions?.[direction];
  const animation = atlas?.states?.[state];
  if (!Number.isInteger(directionIndex) || !animation) return null;
  const raw = progress == null ? Math.floor(Math.max(0, elapsed) * animation.fps) : Math.floor(Math.max(0, Math.min(.9999, progress)) * animation.frames);
  const frame = animation.loop ? raw % animation.frames : Math.min(animation.frames - 1, raw);
  const perRow = atlas.directionsPerRow || DIRECTIONS.length;
  const directionRows = Math.ceil(DIRECTIONS.length / perRow);
  return {
    sx: ((directionIndex % perRow) * animation.frames + frame) * atlas.frame.width,
    sy: (animation.row * directionRows + Math.floor(directionIndex / perRow)) * atlas.frame.height,
    sw: atlas.frame.width,
    sh: atlas.frame.height,
    frame,
  };
}

export function atlasActionProgress(unit, state) {
  // Combat flashes are normalized amplitudes (1 -> 0), not seconds.
  // Death alone is stored as a 1.2-second remaining lifetime.
  if (state === 'death') return 1 - Math.max(0, Math.min(1, (unit.deathAnim || 0) / 1.2));
  if (state === 'hit') return 1 - Math.max(0, Math.min(1, unit.hitFlash || 0));
  if (state === 'attack') return 1 - Math.max(0, Math.min(1, unit.attackAnim || 0));
  return null;
}

// 文明圖集可延後解碼；預設保留既有 eager API。 / Civilization decoding can be deferred; default preserves the eager API.
export function loadUnitSpriteAtlases(descriptors = { ...UNIT_SPRITE_ATLASES, ...CIV_UNIT_SPRITE_ATLASES }, ImageClass = globalThis.Image, { deferCivilizations = false } = {}) {
  const loaded = new Map();
  if (typeof ImageClass !== 'function') return loaded;
  for (const [type, descriptor] of Object.entries(descriptors)) {
    const deferred = deferCivilizations && type.includes(':');
    const entry = { descriptor, image: null, ready: false, failed: false, requested: false };
    entry.load = () => {
      if (entry.requested) return entry;
      entry.requested = true;
      const image = new ImageClass();
      entry.image = image;
      image.onload = () => { if (entry.image === image) entry.ready = true; };
      image.onerror = () => { if (entry.image === image) entry.failed = true; };
      image.src = descriptor.src;
      return entry;
    };
    if (deferred) entry.release = () => {
      if (entry.image) { entry.image.onload = null; entry.image.onerror = null; }
      entry.image = null; entry.ready = false; entry.failed = false; entry.requested = false;
      delete entry.frameImages;
    };
    loaded.set(type, entry);
    if (!deferred) entry.load();
  }
  return loaded;
}
