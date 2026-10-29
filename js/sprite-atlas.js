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

export function loadUnitSpriteAtlases(descriptors = UNIT_SPRITE_ATLASES, ImageClass = globalThis.Image) {
  const loaded = new Map();
  if (typeof ImageClass !== 'function') return loaded;
  for (const [type, descriptor] of Object.entries(descriptors)) {
    const image = new ImageClass();
    const entry = { descriptor, image, ready: false, failed: false };
    image.onload = () => { entry.ready = true; };
    image.onerror = () => { entry.failed = true; };
    image.src = descriptor.src;
    loaded.set(type, entry);
  }
  return loaded;
}
