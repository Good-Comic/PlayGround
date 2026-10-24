export const TILE_W = 64;
export const TILE_H = 32;
export const HALF_W = TILE_W / 2;
export const HALF_H = TILE_H / 2;

export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
export const lerp = (a, b, t) => a + (b - a) * t;
export const dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);
export const dist2 = (ax, ay, bx, by) => (ax - bx) ** 2 + (ay - by) ** 2;
export const easeOut = t => 1 - (1 - t) ** 3;
export const easeInOut = t => t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;

export function mulberry32(seed) {
  let a = seed >>> 0;
  const rng = function () {
    a |= 0;
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    rng.state = a;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  rng.state = a;
  rng.restore = state => { a = state >>> 0; rng.state = a; };
  return rng;
}

export function hash2(x, y, seed = 0) {
  let h = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(seed | 0, 1442695041);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

export const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];
export const rand = (rng, min, max) => min + rng() * (max - min);
export const randInt = (rng, min, max) => Math.floor(rand(rng, min, max + 1));

export function iso(x, y) {
  return { x: (x - y) * HALF_W, y: (x + y) * HALF_H };
}

export function isoToWorld(px, py) {
  return { x: px / TILE_W + py / TILE_H, y: py / TILE_H - px / TILE_W };
}

export function formatNumber(n) {
  if (n >= 10000) return `${(n / 1000).toFixed(1)}k`;
  return Math.round(n).toLocaleString('en-US');
}

export function formatTime(seconds) {
  const s = Math.max(0, Math.floor(seconds));
  return `${String(Math.floor(s / 60)).padStart(1, '0')}:${String(s % 60).padStart(2, '0')}`;
}

export function roman(n) {
  return ['0', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'][n] || String(n);
}

export function shade(hex, amt) {
  const c = hex.replace('#', '');
  const num = parseInt(c.length === 3 ? c.split('').map(v => v + v).join('') : c, 16);
  let r = (num >> 16) + amt;
  let g = ((num >> 8) & 0xff) + amt;
  let b = (num & 0xff) + amt;
  r = clamp(r, 0, 255); g = clamp(g, 0, 255); b = clamp(b, 0, 255);
  return `rgb(${r},${g},${b})`;
}

export function pointInRect(x, y, rect) {
  return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
}

export function pointInDiamond(x, y, cx, cy, hw, hh) {
  return Math.abs(x - cx) / hw + Math.abs(y - cy) / hh <= 1;
}

export function pointSegmentDist(px, py, ax, ay, bx, by) {
  const vx = bx - ax, vy = by - ay;
  const wx = px - ax, wy = py - ay;
  const l2 = vx * vx + vy * vy;
  const t = l2 ? clamp((wx * vx + wy * vy) / l2, 0, 1) : 0;
  return Math.hypot(px - (ax + vx * t), py - (ay + vy * t));
}

export function rgba(hex, alpha) {
  const c = hex.replace('#', '');
  const num = parseInt(c.length === 3 ? c.split('').map(v => v + v).join('') : c, 16);
  return `rgba(${num >> 16},${(num >> 8) & 0xff},${num & 0xff},${alpha})`;
}

export function nearest(list, x, y, predicate = null) {
  let best = null;
  let bestD = Infinity;
  for (const item of list) {
    if (predicate && !predicate(item)) continue;
    const d = dist2(x, y, item.x, item.y);
    if (d < bestD) { bestD = d; best = item; }
  }
  return { item: best, distance: Math.sqrt(bestD) };
}

export function seedFromDate() {
  return (Date.now() ^ (Math.random() * 0xffffffff)) >>> 0;
}

export function seedFromString(value) {
  const text = String(value || '').trim();
  if (!text) return seedFromDate();
  if (/^\d+$/.test(text)) return Number(text) >>> 0;
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
