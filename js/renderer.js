import { TILE_W, TILE_H, MAP_SIZE } from './constants.js';
import { clamp, hash2 } from './utils.js';
import { titleMethods } from './render-title.js';
import { buildingMethods } from './render-buildings.js';
import { unitMethods } from './render-units.js';
import { effectMethods } from './render-effects.js';

const GRASS = ['#6b8c46', '#72954c', '#678842', '#6f9149', '#63843f'];
const FOREST_FLOOR = ['#4f7039', '#54753c', '#4a6a35'];
const DIRT = ['#8a7048', '#92784e', '#806741'];
const SAND = ['#b4a071', '#bba778', '#ad9869'];
const WATER = ['#3a6670', '#3e6d77', '#37616b'];

export class Renderer {
  constructor(canvas, game) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.game = game;
    this.tileW = TILE_W;
    this.tileH = TILE_H;
    this.dpr = 1;
    this.w = 1;
    this.h = 1;
    this.scale = 1;
    this.originX = 0;
    this.originY = 0;
    this.groundCanvas = null;
    this.groundWorld = null;
    this.groundDirty = true;
    this.titleSeed = 9173;
    this.resize();
  }

  resize() {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = window.innerWidth;
    this.h = window.innerHeight;
    this.canvas.width = Math.round(this.w * this.dpr);
    this.canvas.height = Math.round(this.h * this.dpr);
    this.canvas.style.width = this.w + 'px';
    this.canvas.style.height = this.h + 'px';
    this.groundDirty = true;
    this.layout();
  }

  layout() {
    const compact = this.w < 760;
    const top = compact ? 128 : 76;
    const bottom = compact ? 226 : 184;
    const availW = this.w - (compact ? 16 : 44);
    const availH = this.h - top - bottom;
    const mapW = MAP_SIZE * TILE_W;
    const mapH = MAP_SIZE * TILE_H;
    this.scale = clamp(Math.min(availW / mapW, availH / (mapH + 64), 1.14), 0.18, 1.14);
    this.originX = this.w / 2;
    this.originY = top + (availH - mapH * this.scale) / 2 + 20 * this.scale;
    this.compact = compact;
  }

  worldToScreen(x, y) {
    return {
      x: this.originX + (x - y) * (TILE_W / 2) * this.scale,
      y: this.originY + (x + y) * (TILE_H / 2) * this.scale
    };
  }

  screenToWorld(x, y) {
    const ix = (x - this.originX) / this.scale;
    const iy = (y - this.originY) / this.scale;
    return {
      x: (ix / (TILE_W / 2) + iy / (TILE_H / 2)) / 2,
      y: (iy / (TILE_H / 2) - ix / (TILE_W / 2)) / 2
    };
  }

  draw() {
    const ctx = this.ctx;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, this.w, this.h);
    if (this.game.state === 'title') {
      this.drawTitle(this.game.titleTime);
      return;
    }
    this.layout();
    if (this.groundDirty || this.groundWorld !== this.game.world) this.prepareGround();
    this.drawGame();
  }

  drawGame() {
    const ctx = this.ctx;
    const w = this.w, h = this.h;
    const g = this.game;

    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#20261c');
    bg.addColorStop(0.45, '#151a12');
    bg.addColorStop(1, '#0c0d09');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    const haze = ctx.createRadialGradient(w * 0.5, h * 0.42, 0, w * 0.5, h * 0.42, Math.max(w, h) * 0.62);
    haze.addColorStop(0, 'rgba(120,132,88,.07)');
    haze.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = haze;
    ctx.fillRect(0, 0, w, h);

    if (this.groundCanvas) ctx.drawImage(this.groundCanvas, 0, 0, w, h);
    this.drawWater(g.time || 0);

    for (const b of g.buildings) {
      if (g.selected.includes(b)) this.buildingSelection(b);
    }

    const draws = [];
    for (const node of g.world.nodes) {
      if (node.amount > 0 || node.kind === 'tree') draws.push({ y: node.y + 0.2, fn: () => this.drawNode(node) });
    }
    for (const b of g.buildings) draws.push({ y: b.y + b.def.size * 0.38, fn: () => this.drawBuilding(b) });
    for (const u of g.units) draws.push({ y: u.y, fn: () => this.drawUnit(u) });
    draws.sort((a, b) => a.y - b.y);
    for (const d of draws) d.fn();

    for (const s of g.spawnQueue) {
      const wx = clamp(s.pos.x, 0.4, MAP_SIZE - 0.4);
      const wy = clamp(s.pos.y, 0.4, MAP_SIZE - 0.4);
      const p = this.worldToScreen(wx, wy);
      const pulse = 0.45 + Math.sin(g.time * 6 + s.delay) * 0.25;
      ctx.fillStyle = `rgba(190,62,42,${0.12 + pulse * 0.12})`;
      ctx.beginPath(); ctx.ellipse(p.x, p.y, 22 * this.scale, 11 * this.scale, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = `rgba(230,110,76,${pulse})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.ellipse(p.x, p.y, 16 * this.scale, 8 * this.scale, 0, 0, Math.PI * 2); ctx.stroke();
    }

    for (const p of g.projectiles) this.drawProjectile(p);
    for (const p of g.particles) this.drawParticle(p);
    for (const f of g.floatTexts) this.drawFloatText(f);

    if (g.placing) this.drawPlacement();

    if (g.dragRect) {
      const r = g.dragRect;
      const x = Math.min(r.x1, r.x2), y = Math.min(r.y1, r.y2);
      const ww = Math.abs(r.x2 - r.x1), hh = Math.abs(r.y2 - r.y1);
      ctx.fillStyle = 'rgba(218,178,96,.08)';
      ctx.fillRect(x, y, ww, hh);
      ctx.strokeStyle = 'rgba(235,198,113,.7)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(x + 0.5, y + 0.5, ww, hh);
      ctx.setLineDash([]);
    }
  }

  prepareGround() {
    const c = this.groundCanvas || document.createElement('canvas');
    c.width = this.canvas.width;
    c.height = this.canvas.height;
    const ctx = c.getContext('2d');
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, this.w, this.h);
    const world = this.game.world;
    const scale = this.scale;

    const corners = [this.worldToScreen(0, 0), this.worldToScreen(MAP_SIZE, 0), this.worldToScreen(MAP_SIZE, MAP_SIZE), this.worldToScreen(0, MAP_SIZE)];
    ctx.save();
    ctx.filter = 'blur(14px)';
    ctx.fillStyle = 'rgba(0,0,0,.5)';
    ctx.beginPath();
    ctx.moveTo(corners[0].x, corners[0].y + 18);
    for (let i = 1; i < 4; i++) ctx.lineTo(corners[i].x, corners[i].y + 18);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    for (let y = 0; y < MAP_SIZE; y++) {
      for (let x = 0; x < MAP_SIZE; x++) {
        const tile = world.tiles[y][x];
        const p0 = this.worldToScreen(x, y);
        const p1 = this.worldToScreen(x + 1, y);
        const p2 = this.worldToScreen(x + 1, y + 1);
        const p3 = this.worldToScreen(x, y + 1);
        let palette = GRASS;
        if (tile.terrain === 'water') palette = WATER;
        else if (tile.terrain === 'sand') palette = SAND;
        else if (tile.terrain === 'dirt') palette = DIRT;
        else if (tile.terrain === 'forest') palette = FOREST_FLOOR;
        const color = palette[Math.floor((tile.tone * 0.999) * palette.length) % palette.length];
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(20,18,10,.035)';
        ctx.lineWidth = 1;
        ctx.stroke();

        if (tile.terrain === 'water') {
          ctx.fillStyle = 'rgba(190,225,225,.05)';
          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y);
          ctx.lineTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.lineTo(p3.x, p3.y);
          ctx.closePath();
          ctx.fill();
        }

        if (tile.terrain === 'grass' || tile.terrain === 'forest') {
          const h1 = hash2(x, y, world.seed + 17);
          if (h1 > 0.5) {
            const gx = x + 0.18 + hash2(x, y, 31) * 0.64;
            const gy = y + 0.18 + hash2(x, y, 73) * 0.64;
            const gp = this.worldToScreen(gx, gy);
            const hgt = (2.5 + h1 * 4) * scale;
            ctx.strokeStyle = tile.terrain === 'forest' ? 'rgba(44,66,32,.7)' : 'rgba(53,78,36,.65)';
            ctx.lineWidth = Math.max(0.6, scale * 1.1);
            ctx.beginPath();
            ctx.moveTo(gp.x, gp.y);
            ctx.lineTo(gp.x - 2 * scale, gp.y - hgt);
            ctx.moveTo(gp.x, gp.y);
            ctx.lineTo(gp.x + 2.4 * scale, gp.y - hgt * 0.9);
            ctx.stroke();
            if (h1 > 0.86 && tile.terrain === 'grass') {
              ctx.fillStyle = h1 > 0.93 ? '#d7b56b' : '#d6cba4';
              ctx.beginPath(); ctx.arc(gp.x - 1.5 * scale, gp.y - hgt - 1.5 * scale, 1.2 * scale, 0, Math.PI * 2); ctx.fill();
            }
          }
          if (h1 > 0.74 && h1 < 0.78) {
            const gp = this.worldToScreen(x + 0.35, y + 0.6);
            ctx.fillStyle = 'rgba(76,80,62,.5)';
            ctx.beginPath(); ctx.ellipse(gp.x, gp.y, 2.6 * scale, 1.4 * scale, 0, 0, Math.PI * 2); ctx.fill();
          }
        }

        if (tile.terrain === 'dirt' && hash2(x, y, 91) > 0.55) {
          const gp = this.worldToScreen(x + 0.3 + hash2(x, y, 5) * 0.4, y + 0.3 + hash2(x, y, 9) * 0.4);
          ctx.strokeStyle = 'rgba(72,55,31,.35)';
          ctx.lineWidth = Math.max(0.7, scale);
          ctx.beginPath();
          ctx.moveTo(gp.x - 3 * scale, gp.y);
          ctx.lineTo(gp.x + 3 * scale, gp.y + 1.5 * scale);
          ctx.stroke();
        }
      }
    }

    ctx.strokeStyle = 'rgba(26,22,15,.9)';
    ctx.lineWidth = Math.max(2, scale * 4.5);
    ctx.beginPath();
    ctx.moveTo(corners[0].x, corners[0].y);
    for (let i = 1; i < 4; i++) ctx.lineTo(corners[i].x, corners[i].y);
    ctx.closePath();
    ctx.stroke();

    ctx.fillStyle = 'rgba(18,16,12,.85)';
    ctx.beginPath();
    ctx.moveTo(corners[3].x, corners[3].y);
    ctx.lineTo(corners[2].x, corners[2].y);
    ctx.lineTo(corners[2].x + 7 * scale, corners[2].y + 16 * scale);
    ctx.lineTo(corners[3].x - 7 * scale, corners[3].y + 16 * scale);
    ctx.closePath();
    ctx.fill();

    this.groundCanvas = c;
    this.groundWorld = world;
    this.groundDirty = false;
  }

  drawWater(t) {
    const ctx = this.ctx;
    const world = this.game.world;
    const s = this.scale;
    for (let y = 0; y < MAP_SIZE; y++) {
      for (let x = 0; x < MAP_SIZE; x++) {
        if (world.tiles[y][x].terrain !== 'water') continue;
        const p = this.worldToScreen(x + 0.5, y + 0.5);
        const phase = t * 1.2 + x * 0.7 + y * 0.4;
        const a = 0.07 + Math.max(0, Math.sin(phase)) * 0.09;
        ctx.strokeStyle = `rgba(196,232,232,${a})`;
        ctx.lineWidth = Math.max(0.6, s * 1.1);
        ctx.beginPath();
        ctx.moveTo(p.x - 12 * s, p.y);
        ctx.quadraticCurveTo(p.x, p.y - 3.5 * s, p.x + 12 * s, p.y);
        ctx.stroke();
        if (hash2(x, y, world.seed + 4) > 0.55) {
          ctx.beginPath();
          ctx.moveTo(p.x - 6 * s, p.y + 4 * s);
          ctx.quadraticCurveTo(p.x + 2 * s, p.y + 2 * s, p.x + 8 * s, p.y + 4 * s);
          ctx.stroke();
        }
      }
    }
  }

  drawNode(node) {
    const ctx = this.ctx;
    const s = this.scale;
    const p = this.worldToScreen(node.x, node.y);
    if (node.amount <= 0) {
      if (node.kind === 'tree') {
        ctx.fillStyle = 'rgba(0,0,0,.22)';
        ctx.beginPath(); ctx.ellipse(p.x, p.y + 2 * s, 8 * s, 4 * s, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#5b4229';
        ctx.fillRect(p.x - 3 * s, p.y - 7 * s, 6 * s, 8 * s);
        ctx.fillStyle = '#7c5c37';
        ctx.beginPath(); ctx.ellipse(p.x, p.y - 7 * s, 3 * s, 1.6 * s, 0, 0, Math.PI * 2); ctx.fill();
      }
      return;
    }
    const sc = s * node.scale;
    const sway = Math.sin(this.game.time * 1.1 + node.sway) * 1.6;
    if (node.kind === 'tree') {
      const hgt = 42 * sc;
      ctx.fillStyle = 'rgba(0,0,0,.24)';
      ctx.beginPath();
      ctx.ellipse(p.x + 4 * sc, p.y + 2 * sc, 15 * sc, 6.4 * sc, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#4e3823';
      ctx.fillRect(p.x - 2.4 * sc, p.y - hgt * 0.44, 4.8 * sc, hgt * 0.44);
      ctx.fillStyle = '#64482b';
      ctx.fillRect(p.x - 2.4 * sc, p.y - hgt * 0.44, 1.8 * sc, hgt * 0.44);
      const hues = node.seed > 500 ? ['#2f4f2b', '#3d6532', '#4c7a3d', '#5f8f49'] : ['#35562c', '#446b35', '#527f3f', '#629049'];
      const blobs = [
        [-9, -26, 11], [7, -27, 10], [0, -38, 12], [-5, -19, 9], [10, -16, 8], [0, -50, 8]
      ];
      for (let i = 0; i < blobs.length; i++) {
        const [bx, by, br] = blobs[i];
        ctx.fillStyle = hues[i % hues.length];
        ctx.beginPath();
        ctx.arc(p.x + bx * sc + sway * (i / 6), p.y + by * sc - hgt * 0.34, br * sc, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = 'rgba(168,196,108,.18)';
      ctx.beginPath();
      ctx.arc(p.x - 3 * sc + sway * 0.6, p.y - 44 * sc, 6 * sc, 0, Math.PI * 2);
      ctx.fill();
    } else if (node.kind === 'berry') {
      ctx.fillStyle = 'rgba(0,0,0,.2)';
      ctx.beginPath(); ctx.ellipse(p.x, p.y + 1.5 * sc, 12 * sc, 5 * sc, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#37522c';
      ctx.beginPath(); ctx.ellipse(p.x, p.y - 7 * sc, 11 * sc, 7.5 * sc, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#486a35';
      ctx.beginPath(); ctx.ellipse(p.x - 4 * sc, p.y - 11 * sc, 6 * sc, 5 * sc, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(p.x + 5 * sc, p.y - 9 * sc, 5.5 * sc, 4.5 * sc, 0, 0, Math.PI * 2); ctx.fill();
      for (let i = 0; i < 7; i++) {
        const a = hash2(node.tx, node.ty, 40 + i) * Math.PI * 2;
        const r = 2 + hash2(node.tx, node.ty, 60 + i) * 7;
        ctx.fillStyle = i % 3 === 0 ? '#d38a52' : '#b23937';
        ctx.beginPath(); ctx.arc(p.x + Math.cos(a) * r * sc, p.y - 8 * sc + Math.sin(a) * r * 0.6 * sc, 1.5 * sc, 0, Math.PI * 2); ctx.fill();
      }
    } else if (node.kind === 'gold') {
      ctx.fillStyle = 'rgba(0,0,0,.25)';
      ctx.beginPath(); ctx.ellipse(p.x, p.y + 2 * sc, 13 * sc, 5 * sc, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#6f6a5e';
      ctx.beginPath();
      ctx.moveTo(p.x - 11 * sc, p.y);
      ctx.lineTo(p.x - 7 * sc, p.y - 13 * sc);
      ctx.lineTo(p.x + 3 * sc, p.y - 16 * sc);
      ctx.lineTo(p.x + 12 * sc, p.y - 5 * sc);
      ctx.lineTo(p.x + 8 * sc, p.y + 1 * sc);
      ctx.lineTo(p.x - 3 * sc, p.y + 2 * sc);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#8b8474';
      ctx.beginPath();
      ctx.moveTo(p.x - 7 * sc, p.y - 13 * sc);
      ctx.lineTo(p.x + 3 * sc, p.y - 16 * sc);
      ctx.lineTo(p.x + 4 * sc, p.y - 7 * sc);
      ctx.lineTo(p.x - 4 * sc, p.y - 5 * sc);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#d8ab42';
      ctx.beginPath();
      ctx.moveTo(p.x - 3 * sc, p.y - 9 * sc);
      ctx.lineTo(p.x + 4 * sc, p.y - 10 * sc);
      ctx.lineTo(p.x + 2 * sc, p.y - 3 * sc);
      ctx.lineTo(p.x - 4 * sc, p.y - 2 * sc);
      ctx.closePath();
      ctx.fill();
      const spark = 0.3 + Math.max(0, Math.sin(this.game.time * 2.4 + node.sway)) * 0.5;
      ctx.strokeStyle = `rgba(255,226,132,${spark})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(p.x + 5 * sc, p.y - 18 * sc);
      ctx.lineTo(p.x + 5 * sc, p.y - 23 * sc);
      ctx.moveTo(p.x + 2.5 * sc, p.y - 20.5 * sc);
      ctx.lineTo(p.x + 7.5 * sc, p.y - 20.5 * sc);
      ctx.stroke();
    } else {
      ctx.fillStyle = 'rgba(0,0,0,.24)';
      ctx.beginPath(); ctx.ellipse(p.x, p.y + 2 * sc, 13 * sc, 5 * sc, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#77766e';
      ctx.beginPath();
      ctx.moveTo(p.x - 12 * sc, p.y);
      ctx.lineTo(p.x - 8 * sc, p.y - 12 * sc);
      ctx.lineTo(p.x - 1 * sc, p.y - 16 * sc);
      ctx.lineTo(p.x + 9 * sc, p.y - 11 * sc);
      ctx.lineTo(p.x + 12 * sc, p.y - 2 * sc);
      ctx.lineTo(p.x + 4 * sc, p.y + 2 * sc);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#929088';
      ctx.beginPath();
      ctx.moveTo(p.x - 8 * sc, p.y - 12 * sc);
      ctx.lineTo(p.x - 1 * sc, p.y - 16 * sc);
      ctx.lineTo(p.x + 3 * sc, p.y - 8 * sc);
      ctx.lineTo(p.x - 4 * sc, p.y - 5 * sc);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#5e5d57';
      ctx.beginPath();
      ctx.moveTo(p.x + 2 * sc, p.y - 2 * sc);
      ctx.lineTo(p.x + 8 * sc, p.y - 4 * sc);
      ctx.lineTo(p.x + 10 * sc, p.y + 1 * sc);
      ctx.closePath();
      ctx.fill();
    }
  }
}

Object.assign(Renderer.prototype, titleMethods, buildingMethods, unitMethods, effectMethods);
