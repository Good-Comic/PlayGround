const DIRECTIONS = ['E', 'SE', 'S', 'SW', 'W', 'NW', 'N', 'NE'];

export const UNIT_SPRITE_ATLASES = Object.freeze({
  militia: Object.freeze({
    id: 'militia-v1',
    src: 'assets/sprites/militia-atlas.svg',
    frame: Object.freeze({ width: 64, height: 64 }),
    anchor: Object.freeze({ x: 32, y: 54 }),
    offset: Object.freeze({ x: 0, y: 0 }),
    scale: 0.78,
    directions: Object.freeze(Object.fromEntries(DIRECTIONS.map((direction, index) => [direction, index]))),
    states: Object.freeze({
      idle: Object.freeze({ row: 0, frames: 2, fps: 2, loop: true }),
      walk: Object.freeze({ row: 1, frames: 2, fps: 7, loop: true }),
      attack: Object.freeze({ row: 2, frames: 2, fps: 10, loop: false }),
      hit: Object.freeze({ row: 3, frames: 2, fps: 12, loop: false }),
      death: Object.freeze({ row: 4, frames: 2, fps: 4, loop: false }),
    }),
  }),
});

export function atlasFrame(atlas, direction, state, elapsed = 0, progress = null) {
  const directionIndex = atlas?.directions?.[direction];
  const animation = atlas?.states?.[state];
  if (!Number.isInteger(directionIndex) || !animation) return null;
  const raw = progress == null ? Math.floor(Math.max(0, elapsed) * animation.fps) : Math.floor(Math.max(0, Math.min(.9999, progress)) * animation.frames);
  const frame = animation.loop ? raw % animation.frames : Math.min(animation.frames - 1, raw);
  return {
    sx: (directionIndex * animation.frames + frame) * atlas.frame.width,
    sy: animation.row * atlas.frame.height,
    sw: atlas.frame.width,
    sh: atlas.frame.height,
    frame,
  };
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
