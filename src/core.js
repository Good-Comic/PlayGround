export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const smoothstep = (e0, e1, x) => {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
};
export const invLerp = (a, b, v) => (v - a) / (b - a);

export function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class RNG {
  constructor(seed) { this.next = typeof seed === 'number' ? mulberry32(seed) : seed; }
  float(min = 0, max = 1) { return min + this.next() * (max - min); }
  int(min, max) { return Math.floor(this.float(min, max + 1)); }
  pick(arr) { return arr[Math.floor(this.next() * arr.length)]; }
  chance(p) { return this.next() < p; }
  shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  weighted(entries) {
    let total = 0;
    for (const e of entries) total += e.weight;
    let roll = this.next() * total;
    for (const e of entries) { roll -= e.weight; if (roll <= 0) return e; }
    return entries[entries.length - 1];
  }
}

/* ---- value noise + fbm ---- */
function hash2(x, y, seed) {
  let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(seed | 0, 2246822519);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

export function valueNoise2(x, y, seed = 1) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi, seed), b = hash2(xi + 1, yi, seed);
  const c = hash2(xi, yi + 1, seed), d = hash2(xi + 1, yi + 1, seed);
  return lerp(lerp(a, b, u), lerp(c, d, u), v);
}

export function fbm2(x, y, octaves = 5, seed = 1, lacunarity = 2.0, gain = 0.5) {
  let sum = 0, amp = 0.5, freq = 1, norm = 0;
  for (let i = 0; i < octaves; i++) {
    sum += amp * valueNoise2(x * freq, y * freq, seed + i * 101);
    norm += amp;
    amp *= gain; freq *= lacunarity;
  }
  return sum / norm;
}

/* ---- flat-top hex axial math ---- */
export const HEX_R = 1;
export const HEX_DIRS = [
  [1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1],
];
export const SQRT3 = Math.sqrt(3);

export function axialToWorld(q, r, y = 0) {
  return { x: 1.5 * HEX_R * q, y, z: SQRT3 * HEX_R * (r + q / 2) };
}
export function worldToAxialFrac(x, z) {
  const q = (2 / 3) * (x / HEX_R);
  const r = (-1 / 3) * (x / HEX_R) + (SQRT3 / 3) * (z / HEX_R);
  return { q, r };
}
function cubeRound(q, r) {
  let x = q, z = r, y = -x - z;
  let rx = Math.round(x), ry = Math.round(y), rz = Math.round(z);
  const dx = Math.abs(rx - x), dy = Math.abs(ry - y), dz = Math.abs(rz - z);
  if (dx > dy && dx > dz) rx = -ry - rz;
  else if (dy > dz) ry = -rx - rz;
  else rz = -rx - ry;
  return { q: rx, r: rz };
}
export function worldToAxial(x, z) {
  const f = worldToAxialFrac(x, z);
  return cubeRound(f.q, f.r);
}
export function axialDistance(aq, ar, bq, br) {
  return (Math.abs(aq - bq) + Math.abs(ar - br) + Math.abs((aq + ar) - (bq + br))) / 2;
}
export function axialKey(q, r) { return `${q},${r}`; }
export function axialNeighbors(q, r) {
  return HEX_DIRS.map(([dq, dr]) => [q + dq, r + dr]);
}
export function hexCorners(cx, cz, radius = HEX_R) {
  const pts = [];
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 180) * (60 * i);
    pts.push({ x: cx + radius * Math.cos(a), z: cz + radius * Math.sin(a) });
  }
  return pts;
}
export function axialRing(q, r, radius) {
  if (radius <= 0) return [[q, r]];
  const out = [];
  let cq = q + HEX_DIRS[4][0] * radius;
  let cr = r + HEX_DIRS[4][1] * radius;
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < radius; j++) {
      out.push([cq, cr]);
      cq += HEX_DIRS[i][0];
      cr += HEX_DIRS[i][1];
    }
  }
  return out;
}
export function hexesWithin(q, r, radius) {
  const out = [[q, r]];
  for (let k = 1; k <= radius; k++) out.push(...axialRing(q, r, k));
  return out;
}
