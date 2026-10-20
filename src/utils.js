export const TILE_W = 64;
export const TILE_H = 32;
export const HALF_W = TILE_W / 2;
export const HALF_H = TILE_H / 2;
export const MAP_W = 36;
export const MAP_H = 36;

export const clamp = (value, min, max) => value < min ? min : value > max ? max : value;
export const lerp = (a, b, t) => a + (b - a) * t;
export const invLerp = (a, b, v) => (v - a) / (b - a);
export const easeOut = t => 1 - Math.pow(1 - t, 3);
export const easeInOut = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
export const dist = (ax, ay, bx, by) => Math.hypot(bx - ax, by - ay);
export const dist2 = (ax, ay, bx, by) => (bx - ax) ** 2 + (by - ay) ** 2;
export const angleTo = (ax, ay, bx, by) => Math.atan2(by - ay, bx - ax);
export const randomRange = (rng, min, max) => min + rng() * (max - min);
export const randomInt = (rng, min, max) => Math.floor(min + rng() * (max - min + 1));

export function hashString(value) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export class RNG {
  constructor(seed = Date.now()) {
    this.seed = typeof seed === 'number' ? seed >>> 0 : hashString(String(seed));
    this.state = this.seed || 1;
  }
  next() {
    let x = this.state;
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    this.state = x >>> 0;
    return this.state / 4294967296;
  }
  range(min, max) { return min + this.next() * (max - min); }
  int(min, max) { return Math.floor(this.range(min, max + 0.999999)); }
  pick(list) { return list[Math.floor(this.next() * list.length)]; }
  chance(probability) { return this.next() < probability; }
  shuffle(list) {
    const copy = list.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }
}

export function tileHash(x, y, salt = 0) {
  const saltValue = typeof salt === 'number' ? salt : hashString(String(salt));
  let n = Math.imul(x + 374761393, 668265263) ^ Math.imul(y + 1442695041, 2246822519) ^ Math.imul(saltValue + 1, 3266489917);
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
}

export function isoToScreen(x, y) {
  return { x: (x - y) * HALF_W, y: (x + y) * HALF_H };
}

export function screenToIso(px, py) {
  return {
    x: (px / HALF_W + py / HALF_H) / 2,
    y: (py / HALF_H - px / HALF_W) / 2
  };
}

export function hexToRgb(color) {
  if (typeof color !== 'string') return { r: 0, g: 0, b: 0 };
  const value = color.trim();
  const rgbMatch = value.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/i);
  if (rgbMatch) return { r: Number(rgbMatch[1]), g: Number(rgbMatch[2]), b: Number(rgbMatch[3]) };
  const clean = value.replace('#', '');
  const n = parseInt(clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean, 16);
  if (!Number.isFinite(n)) return { r: 0, g: 0, b: 0 };
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function rgba(hex, alpha) {
  const c = hexToRgb(hex);
  return `rgba(${c.r}, ${c.g}, ${c.b}, ${alpha})`;
}

export function mixColor(a, b, t) {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  return `rgb(${Math.round(lerp(ca.r, cb.r, t))}, ${Math.round(lerp(ca.g, cb.g, t))}, ${Math.round(lerp(ca.b, cb.b, t))})`;
}

export function formatNumber(value) {
  return Math.max(0, Math.floor(value)).toLocaleString('en-US');
}

export function roman(number) {
  return ['0', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'][number] || String(number);
}

export function idGenerator(prefix = 'e') {
  let number = 0;
  return () => `${prefix}${++number}`;
}

export function nearestPointOnRect(x, y, rect) {
  return {
    x: clamp(x, rect.x, rect.x + rect.w),
    y: clamp(y, rect.y, rect.y + rect.h)
  };
}

export class MinHeap {
  constructor() { this.items = []; }
  get size() { return this.items.length; }
  push(value, score) {
    const item = { value, score };
    this.items.push(item);
    this.bubbleUp(this.items.length - 1);
  }
  pop() {
    if (!this.items.length) return null;
    const top = this.items[0];
    const end = this.items.pop();
    if (this.items.length) {
      this.items[0] = end;
      this.sinkDown(0);
    }
    return top.value;
  }
  bubbleUp(index) {
    while (index > 0) {
      const parent = (index - 1) >> 1;
      if (this.items[parent].score <= this.items[index].score) break;
      [this.items[parent], this.items[index]] = [this.items[index], this.items[parent]];
      index = parent;
    }
  }
  sinkDown(index) {
    const length = this.items.length;
    while (true) {
      const left = index * 2 + 1;
      const right = left + 1;
      let smallest = index;
      if (left < length && this.items[left].score < this.items[smallest].score) smallest = left;
      if (right < length && this.items[right].score < this.items[smallest].score) smallest = right;
      if (smallest === index) break;
      [this.items[index], this.items[smallest]] = [this.items[smallest], this.items[index]];
      index = smallest;
    }
  }
}

const DIRS = [
  [1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1],
  [1, 1, 1.414], [1, -1, 1.414], [-1, 1, 1.414], [-1, -1, 1.414]
];

export function findPath(startX, startY, goalX, goalY, passable, width = MAP_W, height = MAP_H) {
  const sx = Math.round(startX);
  const sy = Math.round(startY);
  const gx = Math.round(goalX);
  const gy = Math.round(goalY);
  if (sx === gx && sy === gy) return [];
  if (!passable(gx, gy)) {
    let best = null;
    let bestScore = Infinity;
    for (let radius = 1; radius <= 4 && !best; radius++) {
      for (let oy = -radius; oy <= radius; oy++) {
        for (let ox = -radius; ox <= radius; ox++) {
          if (Math.max(Math.abs(ox), Math.abs(oy)) !== radius) continue;
          const nx = gx + ox;
          const ny = gy + oy;
          if (nx < 0 || ny < 0 || nx >= width || ny >= height || !passable(nx, ny)) continue;
          const score = Math.abs(ox) + Math.abs(oy);
          if (score < bestScore) { best = [nx, ny]; bestScore = score; }
        }
      }
    }
    if (!best) return [];
    return findPath(sx, sy, best[0], best[1], passable, width, height);
  }
  const key = (x, y) => y * width + x;
  const open = new MinHeap();
  const came = new Map();
  const cost = new Map();
  const startKey = key(sx, sy);
  open.push([sx, sy], 0);
  cost.set(startKey, 0);
  const limit = width * height * 4;
  let steps = 0;
  while (open.size && steps++ < limit) {
    const [cx, cy] = open.pop();
    const ck = key(cx, cy);
    if (cx === gx && cy === gy) {
      const path = [];
      let cursor = ck;
      while (cursor !== startKey) {
        const x = cursor % width;
        const y = Math.floor(cursor / width);
        path.push([x, y]);
        const prev = came.get(cursor);
        if (prev === undefined) break;
        cursor = prev;
      }
      return path.reverse();
    }
    const currentCost = cost.get(ck) ?? Infinity;
    for (const [dx, dy, weight] of DIRS) {
      const nx = cx + dx;
      const ny = cy + dy;
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
      if (!passable(nx, ny)) continue;
      if (dx && dy && (!passable(cx + dx, cy) || !passable(cx, cy + dy))) continue;
      const nk = key(nx, ny);
      const nextCost = currentCost + weight;
      if (nextCost >= (cost.get(nk) ?? Infinity)) continue;
      cost.set(nk, nextCost);
      came.set(nk, ck);
      const heuristic = Math.hypot(gx - nx, gy - ny);
      open.push([nx, ny], nextCost + heuristic * 1.05);
    }
  }
  return [];
}

export function smoothPath(path) {
  if (path.length < 3) return path;
  const result = [];
  let anchor = path[0];
  result.push(anchor);
  let index = 2;
  while (index < path.length) {
    const prev = path[index - 1];
    const next = path[index];
    const dx1 = prev[0] - anchor[0];
    const dy1 = prev[1] - anchor[1];
    const dx2 = next[0] - anchor[0];
    const dy2 = next[1] - anchor[1];
    if (dx1 * dy2 - dy1 * dx2 !== 0) {
      result.push(prev);
      anchor = prev;
    }
    index++;
  }
  const last = path[path.length - 1];
  if (result[result.length - 1] !== last) result.push(last);
  return result;
}
