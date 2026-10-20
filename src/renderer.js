import { BUILDINGS, UNITS } from './data.js';
import { HALF_H, HALF_W, MAP_H, MAP_W, clamp, mixColor, rgba, screenToIso, tileHash } from './utils.js';

const TAU = Math.PI * 2;

const PALETTES = [
  { top: '#f4c37c', bottom: '#2a1c10', overlay: 'rgba(255, 170, 76, .06)', mist: 'rgba(236, 191, 123, .06)' },
  { top: '#d98d54', bottom: '#25170f', overlay: 'rgba(214, 103, 44, .08)', mist: 'rgba(230, 154, 88, .055)' },
  { top: '#7d6f79', bottom: '#171522', overlay: 'rgba(55, 61, 111, .12)', mist: 'rgba(132, 140, 178, .045)' },
  { top: '#4a5369', bottom: '#090c14', overlay: 'rgba(30, 42, 78, .18)', mist: 'rgba(128, 150, 186, .04)' },
  { top: '#7f2b28', bottom: '#100609', overlay: 'rgba(109, 21, 28, .16)', mist: 'rgba(198, 86, 68, .035)' }
];

export class Renderer {
  constructor(canvas, game) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.game = game;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = 0;
    this.height = 0;
    this.time = 0;
    this.last = performance.now();
    this.groundCache = null;
    this.groundWorld = null;
    this.lightingCache = null;
    this.lightingKey = '';
    this.dangerCache = null;
    this.dangerKey = '';
    this.minimapCache = null;
    this.minimapWorld = null;
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.birds = Array.from({ length: 7 }, (_, i) => ({
      x: (i * 241) % 1400, y: 80 + (i * 73) % 260, speed: 7 + (i % 3) * 3, phase: i * 1.7
    }));
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);
    this.canvas.style.width = this.width + 'px';
    this.canvas.style.height = this.height + 'px';
    this.lightingKey = '';
    this.dangerKey = '';
  }

  iso(x, y) {
    return { x: (x - y) * HALF_W, y: (x + y) * HALF_H };
  }

  screenToWorld(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    const localX = (clientX - rect.left - this.width / 2) / this.game.camera.zoom + this.game.camera.x;
    const localY = (clientY - rect.top - this.height / 2) / this.game.camera.zoom + this.game.camera.y;
    return screenToIso(localX, localY);
  }

  worldToScreen(x, y, z = 0) {
    const local = this.iso(x, y);
    return {
      x: (local.x - this.game.camera.x) * this.game.camera.zoom + this.width / 2,
      y: (local.y - this.game.camera.y - z * 10) * this.game.camera.zoom + this.height / 2
    };
  }

  diamond(cx, cy, w = 32.5, h = 16.5) {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + w, cy + h);
    ctx.lineTo(cx, cy + h * 2);
    ctx.lineTo(cx - w, cy + h);
    ctx.closePath();
  }

  poly(points, fill, stroke = null, line = 1) {
    if (!points || !points.length) return;
    const ctx = this.ctx;
    const px = point => Array.isArray(point) ? point[0] : point.x;
    const py = point => Array.isArray(point) ? point[1] : point.y;
    ctx.beginPath();
    ctx.moveTo(px(points[0]), py(points[0]));
    for (let i = 1; i < points.length; i++) ctx.lineTo(px(points[i]), py(points[i]));
    ctx.closePath();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = line; ctx.stroke(); }
  }

  ellipse(cx, cy, rx, ry, fill) {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, TAU);
    ctx.fillStyle = fill;
    ctx.fill();
  }

  render(now = performance.now()) {
    const dt = Math.min(.05, (now - this.last) / 1000);
    this.last = now;
    this.time += dt;
    const ctx = this.ctx;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, this.width, this.height);
    ctx.save();
    ctx.translate(this.width / 2, this.height / 2);
    ctx.scale(this.game.camera.zoom, this.game.camera.zoom);
    ctx.translate(-this.game.camera.x, -this.game.camera.y);
    this.drawGroundCache();
    this.drawWorldObjects();
    this.drawProjectiles();
    this.drawParticles();
    this.drawFloaters();
    this.drawPlacement();
    ctx.restore();
    this.drawBoxSelection();
    this.drawBirds();
    this.drawScreenMotes();
  }

  ensureGroundCache() {
    if (this.groundWorld === this.game.world && this.groundCache) return;
    const canvas = document.createElement('canvas');
    canvas.width = 2304;
    canvas.height = 1152;
    const cacheCtx = canvas.getContext('2d');
    const previous = this.ctx;
    this.ctx = cacheCtx;
    cacheCtx.save();
    cacheCtx.translate(1152, 0);
    this.drawGround();
    this.drawDecor();
    cacheCtx.restore();
    this.ctx = previous;
    this.groundCache = canvas;
    this.groundWorld = this.game.world;
  }

  drawGroundCache() {
    this.ensureGroundCache();
    this.ctx.drawImage(this.groundCache, -1152, 0);
  }

  paintLighting(ctx, wave) {
    const palette = PALETTES[clamp(this.game.state === 'victory' ? 1 : this.game.state === 'defeat' ? 4 : wave, 0, 4)];
    const topGlow = ctx.createRadialGradient(this.width * .58, -this.height * .16, 40, this.width * .58, -this.height * .16, this.height * 1.1);
    topGlow.addColorStop(0, palette.top + '2e');
    topGlow.addColorStop(.5, palette.top + '08');
    topGlow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = topGlow;
    ctx.fillRect(0, 0, this.width, this.height);
    const dark = this.game.state === 'menu' ? .08 : [0.02, .05, .11, .2, .13][clamp(wave, 0, 4)];
    const bottom = ctx.createLinearGradient(0, 0, 0, this.height);
    bottom.addColorStop(0, `rgba(7, 7, 5, ${dark})`);
    bottom.addColorStop(.55, 'rgba(0,0,0,0)');
    bottom.addColorStop(1, `rgba(2, 2, 2, ${dark + .16})`);
    ctx.fillStyle = bottom;
    ctx.fillRect(0, 0, this.width, this.height);
    const mist = ctx.createRadialGradient(this.width * .4, this.height * .62, 20, this.width * .5, this.height * .6, this.width * .7);
    mist.addColorStop(0, palette.mist);
    mist.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = mist;
    ctx.fillRect(0, 0, this.width, this.height);
  }

  paintDanger(ctx) {
    const pulse = (Math.sin(this.time * 2.1) + 1) * .5;
    const edge = ctx.createRadialGradient(this.width / 2, this.height / 2, this.height * .35, this.width / 2, this.height / 2, this.width * .72);
    edge.addColorStop(0, 'rgba(0,0,0,0)');
    edge.addColorStop(1, `rgba(128, 30, 24, ${.055 + pulse * .035})`);
    ctx.fillStyle = edge;
    ctx.fillRect(0, 0, this.width, this.height);
  }

  drawBackdrop() {
    const ctx = this.ctx;
    const gradient = ctx.createRadialGradient(this.width * .5, this.height * .42, 40, this.width * .5, this.height * .55, this.width * .8);
    gradient.addColorStop(0, '#243020');
    gradient.addColorStop(.52, '#121710');
    gradient.addColorStop(1, '#070705');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.width, this.height);
    const glow = ctx.createLinearGradient(0, 0, 0, this.height);
    glow.addColorStop(0, 'rgba(228, 179, 105, .035)');
    glow.addColorStop(.5, 'rgba(0,0,0,0)');
    glow.addColorStop(1, 'rgba(0,0,0,.4)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, this.width, this.height);
  }

  drawGround() {
    const ctx = this.ctx;
    const t = this.time;
    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        const tile = this.game.world.tiles[y * MAP_W + x];
        const p = this.iso(x, y);
        const cx = p.x;
        const cy = p.y + 16;
        const v = tile.variant;
        let color;
        if (tile.terrain === 'grass') {
          color = mixColor('#3e4d2c', '#51643a', v * .75);
          if (tile.tint > .75) color = mixColor(color, '#5f6b3f', .22);
        } else if (tile.terrain === 'dirt') {
          color = mixColor('#685638', '#7a6644', v * .75);
        } else if (tile.terrain === 'water') {
          color = mixColor('#1e383c', '#27474a', v * .6);
        } else if (tile.terrain === 'sand') {
          color = mixColor('#706746', '#897d58', v * .7);
        } else if (tile.terrain === 'bridge') {
          color = '#4c3520';
        } else if (tile.terrain === 'ash') {
          color = mixColor('#342e28', '#423a31', v * .6);
        } else {
          color = '#3f4d2d';
        }
        this.diamond(cx, cy, 32.6, 16.4);
        ctx.fillStyle = color;
        ctx.fill();
        if (tile.terrain === 'grass') {
          if (v > .68) this.ellipse(cx + (v - .68) * 25, cy + 2, 11, 4, 'rgba(118, 133, 72, .11)');
          if (v < .18) this.ellipse(cx - 8, cy + 5, 12, 4, 'rgba(27, 34, 20, .16)');
          const h = tileHash(x, y, 981);
          if (h > .55) {
            ctx.strokeStyle = h > .8 ? 'rgba(108, 128, 70, .55)' : 'rgba(67, 85, 45, .55)';
            ctx.lineWidth = .8;
            ctx.beginPath();
            const gx = cx + (h - .5) * 32;
            const gy = cy + (tile.detail - .5) * 12;
            ctx.moveTo(gx, gy);
            ctx.lineTo(gx - 2, gy - 4);
            ctx.moveTo(gx + 2, gy);
            ctx.lineTo(gx + 4, gy - 3);
            ctx.stroke();
          }
          if (tile.detail > .93) {
            ctx.fillStyle = '#c9bd75';
            ctx.fillRect(cx + (tile.detail - .93) * 120 - 26, cy - 2, 1.3, 1.3);
          }
        } else if (tile.terrain === 'dirt') {
          const h = tileHash(x, y, 12);
          if (h > .6) {
            ctx.fillStyle = 'rgba(52, 42, 27, .35)';
            ctx.beginPath();
            ctx.ellipse(cx + (h - .5) * 28, cy + (tile.detail - .5) * 10, 3.4, 1.5, 0, 0, TAU);
            ctx.fill();
          }
          if (h > .86) {
            ctx.strokeStyle = 'rgba(173, 155, 110, .35)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(cx - 6, cy);
            ctx.lineTo(cx + 2, cy + 4);
            ctx.stroke();
          }
        } else if (tile.terrain === 'water') {
          this.drawWaterTile(cx, cy, x, y, t);
        } else if (tile.terrain === 'bridge') {
          this.drawBridgeTile(cx, cy, x, y);
        } else if (tile.terrain === 'ash') {
          if (v > .5) this.ellipse(cx + 4, cy + 2, 9, 3, 'rgba(0,0,0,.14)');
        }
        ctx.strokeStyle = 'rgba(13, 18, 10, .09)';
        ctx.lineWidth = .7;
        ctx.beginPath();
        ctx.moveTo(cx - 32.6, cy + 16.4);
        ctx.lineTo(cx, cy + 32.9);
        ctx.lineTo(cx + 32.6, cy + 16.4);
        ctx.stroke();
      }
    }
    this.drawShorelines();
  }

  drawWaterTile(cx, cy, x, y, t) {
    const ctx = this.ctx;
    const phase = x * 1.7 + y * 2.3;
    const shimmer = (Math.sin(t * 1.4 + phase) + 1) * .5;
    ctx.strokeStyle = `rgba(119, 163, 155, ${.08 + shimmer * .1})`;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(cx - 14 + shimmer * 6, cy + 2);
    ctx.quadraticCurveTo(cx - 2, cy - 3, cx + 12, cy + 2);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(12, 33, 34, .22)';
    ctx.beginPath();
    ctx.moveTo(cx - 23, cy + 17);
    ctx.quadraticCurveTo(cx, cy + 12, cx + 21, cy + 16);
    ctx.stroke();
    if ((x + y) % 3 === 0) {
      ctx.fillStyle = `rgba(206, 225, 204, ${.08 + shimmer * .12})`;
      ctx.fillRect(cx + Math.sin(phase) * 10, cy + 8 + Math.cos(phase) * 3, 3, 1);
    }
  }

  drawBridgeTile(cx, cy, x, y) {
    const ctx = this.ctx;
    this.diamond(cx, cy, 32.7, 16.4);
    ctx.fillStyle = '#4a3120';
    ctx.fill();
    ctx.strokeStyle = 'rgba(25, 15, 8, .5)';
    ctx.lineWidth = .8;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(cx - 25 + i * 4, cy + 13 + i * 4);
      ctx.lineTo(cx + 8 + i * 4, cy - 3 + i * 4);
      ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(143, 105, 61, .55)';
    ctx.beginPath();
    ctx.moveTo(cx - 30, cy + 10);
    ctx.lineTo(cx + 2, cy + 26);
    ctx.moveTo(cx + 30, cy + 10);
    ctx.lineTo(cx - 2, cy + 26);
    ctx.stroke();
    ctx.fillStyle = '#21140b';
    ctx.fillRect(cx - 31, cy + 24, 4, 5);
    ctx.fillRect(cx + 27, cy + 24, 4, 5);
    ctx.strokeStyle = 'rgba(79, 53, 30, .8)';
    ctx.beginPath();
    ctx.moveTo(cx - 29, cy + 26);
    ctx.lineTo(cx - 29, cy + 15);
    ctx.moveTo(cx + 29, cy + 26);
    ctx.lineTo(cx + 29, cy + 15);
    ctx.stroke();
  }

  drawShorelines() {
    const ctx = this.ctx;
    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        const tile = this.game.world.tiles[y * MAP_W + x];
        if (tile.terrain !== 'water') continue;
        const p = this.iso(x, y);
        const cx = p.x;
        const cy = p.y + 16;
        const neighbors = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        for (const [dx, dy] of neighbors) {
          const n = this.game.world.tileAt(x + dx, y + dy);
          if (n && n.terrain !== 'water') {
            ctx.strokeStyle = 'rgba(196, 187, 142, .19)';
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            if (dx === 1) { ctx.moveTo(cx + 16, cy + 8); ctx.lineTo(cx, cy + 16); }
            else if (dx === -1) { ctx.moveTo(cx - 16, cy + 8); ctx.lineTo(cx, cy); }
            else if (dy === 1) { ctx.moveTo(cx, cy + 16); ctx.lineTo(cx + 16, cy + 24); }
            else { ctx.moveTo(cx - 16, cy - 8); ctx.lineTo(cx, cy - 16); }
            ctx.stroke();
          }
        }
      }
    }
  }

  drawDecor() {
    const ctx = this.ctx;
    for (const decor of this.game.world.decor) {
      if (decor.type === 'bridgeMark') continue;
      const p = this.iso(decor.x, decor.y);
      if (decor.type === 'tuft') {
        ctx.strokeStyle = 'rgba(92, 111, 60, .75)';
        ctx.lineWidth = .8;
        const sway = Math.sin(this.time * 1.2 + decor.variant * 9) * .7;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y + 16);
        ctx.quadraticCurveTo(p.x - 2 + sway, p.y + 10, p.x - 4 + sway, p.y + 6);
        ctx.moveTo(p.x + 1, p.y + 16);
        ctx.quadraticCurveTo(p.x + 3 + sway, p.y + 9, p.x + 4 + sway, p.y + 5);
        ctx.stroke();
      } else if (decor.type === 'flower') {
        ctx.fillStyle = decor.variant > .5 ? '#b9a45d' : '#8b6c74';
        ctx.beginPath();
        ctx.arc(p.x, p.y + 14, 1.5, 0, TAU);
        ctx.fill();
        ctx.fillStyle = 'rgba(90, 118, 62, .65)';
        ctx.fillRect(p.x - .3, p.y + 15, .7, 3);
      } else if (decor.type === 'rock') {
        this.poly([[p.x - 5, p.y + 17], [p.x - 2, p.y + 11], [p.x + 5, p.y + 13], [p.x + 6, p.y + 17], [p.x + 1, p.y + 19]], '#666452', 'rgba(25,25,19,.3)', .6);
        this.poly([[p.x - 2, p.y + 12], [p.x + 2, p.y + 12], [p.x + 3, p.y + 14], [p.x - 1, p.y + 15]], 'rgba(167, 158, 126, .3)');
      } else if (decor.type === 'stump') {
        this.ellipse(p.x, p.y + 16, 6, 2.6, 'rgba(16, 14, 9, .32)');
        this.poly([[p.x - 4, p.y + 10], [p.x + 4, p.y + 10], [p.x + 5, p.y + 15], [p.x - 5, p.y + 15]], '#58422a');
        this.ellipse(p.x, p.y + 10, 4.5, 2, '#7d623c');
      } else if (decor.type === 'reed') {
        ctx.strokeStyle = 'rgba(107, 122, 73, .7)';
        ctx.lineWidth = 1;
        const sway = Math.sin(this.time * 1.6 + decor.variant * 8) * 2;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y + 18);
        ctx.lineTo(p.x + sway, p.y + 6);
        ctx.moveTo(p.x + 2, p.y + 18);
        ctx.lineTo(p.x + 3 + sway, p.y + 9);
        ctx.stroke();
      } else if (decor.type === 'bones') {
        ctx.strokeStyle = 'rgba(207, 197, 166, .42)';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(p.x - 6, p.y + 12);
        ctx.lineTo(p.x + 5, p.y + 16);
        ctx.stroke();
        ctx.fillStyle = 'rgba(212, 200, 168, .4)';
        ctx.beginPath();
        ctx.arc(p.x - 8, p.y + 12, 2, 0, TAU);
        ctx.arc(p.x + 7, p.y + 16, 2, 0, TAU);
        ctx.fill();
      } else if (decor.type === 'ruin') {
        this.drawRuin(p);
      }
    }
  }

  drawRuin(p) {
    const ctx = this.ctx;
    this.ellipse(p.x, p.y + 20, 26, 9, 'rgba(12, 12, 9, .3)');
    this.poly([[p.x - 18, p.y + 18], [p.x - 18, p.y - 4], [p.x - 10, p.y - 8], [p.x - 4, p.y - 2], [p.x - 4, p.y + 18]], '#5a5749');
    this.poly([[p.x + 9, p.y + 20], [p.x + 9, p.y + 2], [p.x + 18, p.y + 6], [p.x + 18, p.y + 20]], '#625e4e');
    this.poly([[p.x - 18, p.y - 4], [p.x - 10, p.y - 8], [p.x - 4, p.y - 2], [p.x - 10, p.y + 1]], '#77715e');
    ctx.strokeStyle = 'rgba(194, 184, 150, .16)';
    ctx.lineWidth = 1;
    ctx.strokeRect(p.x - 14, p.y + 1, 6, 5);
    ctx.strokeRect(p.x + 12, p.y + 8, 3, 6);
    ctx.fillStyle = 'rgba(75, 96, 53, .5)';
    ctx.fillRect(p.x - 16, p.y + 8, 2, 7);
    ctx.fillRect(p.x + 14, p.y + 11, 2, 5);
  }

  drawWorldObjects() {
    const game = this.game;
    const corners = [this.screenToWorld(0, 0), this.screenToWorld(this.width, 0), this.screenToWorld(this.width, this.height), this.screenToWorld(0, this.height)];
    const left = Math.min(...corners.map(c => c.x)) - 2;
    const right = Math.max(...corners.map(c => c.x)) + 2;
    const top = Math.min(...corners.map(c => c.y)) - 2;
    const bottom = Math.max(...corners.map(c => c.y)) + 2;
    const visible = (x, y) => x >= left && x <= right && y >= top && y <= bottom;
    const objects = [];
    for (const node of game.world.nodes) {
      if (node.depleted || !visible(node.x, node.y)) continue;
      objects.push({ type: 'node', depth: node.x + node.y + .2, x: node.x, y: node.y, entity: node });
    }
    for (const camp of game.world.camps) {
      if (!visible(camp.x, camp.y)) continue;
      objects.push({ type: 'camp', depth: camp.x + camp.y + .3, x: camp.x, y: camp.y, entity: camp });
    }
    for (const building of game.buildings) {
      if (building.dead || !visible(building.x, building.y)) continue;
      objects.push({ type: 'building', depth: building.x + building.y + .1, x: building.x, y: building.y, entity: building });
    }
    for (const unit of game.units) {
      if (unit.dead || !visible(unit.x, unit.y)) continue;
      objects.push({ type: 'unit', depth: unit.x + unit.y + .3, x: unit.x, y: unit.y, entity: unit });
    }
    objects.sort((a, b) => a.depth - b.depth || a.x - b.x || a.y - b.y);
    for (const object of objects) {
      if (object.type === 'node') this.drawNode(object.entity);
      else if (object.type === 'camp') this.drawCamp(object.entity);
      else if (object.type === 'building') this.drawBuilding(object.entity);
      else this.drawUnit(object.entity);
    }
  }

  drawNode(node) {
    const p = this.iso(node.x + .5, node.y + .5);
    if (node.type === 'tree') this.drawTree(p, node);
    else if (node.type === 'gold') this.drawGold(p, node);
    else if (node.type === 'stone') this.drawStone(p, node);
    else if (node.type === 'berry') this.drawBerry(p, node);
    else if (node.type === 'sheep') this.drawSheep(p, node);
  }

  drawTree(p, node) {
    const ctx = this.ctx;
    const v = node.variant;
    const scale = .86 + v * .35;
    const sway = Math.sin(this.time * .9 + v * 8) * 1.4;
    this.ellipse(p.x + 3, p.y + 15, 14 * scale, 5 * scale, 'rgba(8, 10, 6, .36)');
    ctx.strokeStyle = '#4a3723';
    ctx.lineWidth = 3.1 * scale;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(p.x, p.y + 14);
    ctx.lineTo(p.x + sway * .4, p.y - 2);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(113, 84, 50, .65)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(p.x + 1, p.y + 13);
    ctx.lineTo(p.x + 1 + sway * .3, p.y - 1);
    ctx.stroke();
    const cx = p.x + sway;
    const cy = p.y - 10;
    const r = 14 * scale;
    const blobs = [
      { x: cx - r * .55, y: cy + 2, r: r * .86, c: '#2d4429' },
      { x: cx + r * .55, y: cy + 4, r: r * .8, c: '#304a2c' },
      { x: cx - r * .1, y: cy - r * .55, r: r * .9, c: '#3a5734' },
      { x: cx + r * .2, y: cy + r * .18, r: r * .75, c: '#46643a' }
    ];
    for (const blob of blobs) {
      ctx.beginPath();
      ctx.arc(blob.x, blob.y, blob.r, 0, TAU);
      ctx.fillStyle = blob.c;
      ctx.fill();
    }
    ctx.fillStyle = 'rgba(119, 143, 82, .3)';
    ctx.beginPath();
    ctx.ellipse(cx - r * .45, cy - r * .55, r * .42, r * .25, -.5, 0, TAU);
    ctx.fill();
    ctx.fillStyle = 'rgba(168, 177, 107, .22)';
    for (let i = 0; i < 3; i++) {
      const a = v * 8 + i * 2.1;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(a) * r * .45, cy + Math.sin(a) * r * .25, 1.3, 0, TAU);
      ctx.fill();
    }
    if (node.amount < node.max * .35) {
      ctx.fillStyle = 'rgba(102, 70, 35, .55)';
      ctx.fillRect(p.x - 2, p.y - 2, 2, 14);
    }
  }

  drawGold(p, node) {
    const ctx = this.ctx;
    this.ellipse(p.x + 2, p.y + 16, 15, 5, 'rgba(8, 8, 6, .4)');
    const shiny = (Math.sin(this.time * 2 + node.variant * 9) + 1) * .5;
    this.poly([[p.x - 13, p.y + 14], [p.x - 9, p.y + 4], [p.x - 1, p.y + 2], [p.x + 8, p.y + 7], [p.x + 12, p.y + 14], [p.x + 4, p.y + 18], [p.x - 5, p.y + 17]], '#5b584c');
    this.poly([[p.x - 7, p.y + 8], [p.x - 1, p.y + 5], [p.x + 5, p.y + 8], [p.x + 2, p.y + 12], [p.x - 4, p.y + 12]], '#777264');
    ctx.fillStyle = `rgba(238, 196, 94, ${.55 + shiny * .35})`;
    ctx.fillRect(p.x - 6, p.y + 8, 2.5, 2);
    ctx.fillRect(p.x + 2, p.y + 10, 2, 1.8);
    ctx.fillRect(p.x - 1, p.y + 4, 2, 1.6);
    ctx.fillStyle = 'rgba(255, 230, 150, .55)';
    ctx.fillRect(p.x + 1, p.y + 8, 1, 1);
    if (shiny > .8) {
      ctx.strokeStyle = 'rgba(255, 226, 133, .5)';
      ctx.lineWidth = .8;
      ctx.beginPath();
      ctx.moveTo(p.x + 6, p.y + 3); ctx.lineTo(p.x + 9, p.y + 1);
      ctx.stroke();
    }
  }

  drawStone(p, node) {
    this.ellipse(p.x + 2, p.y + 16, 15, 5, 'rgba(8, 8, 6, .38)');
    this.poly([[p.x - 14, p.y + 14], [p.x - 10, p.y + 5], [p.x - 2, p.y + 2], [p.x + 8, p.y + 5], [p.x + 13, p.y + 13], [p.x + 5, p.y + 17], [p.x - 6, p.y + 18]], '#697069');
    this.poly([[p.x - 9, p.y + 7], [p.x - 1, p.y + 4], [p.x + 4, p.y + 7], [p.x + 1, p.y + 12], [p.x - 6, p.y + 12]], '#858a7e');
    this.poly([[p.x + 2, p.y + 9], [p.x + 8, p.y + 8], [p.x + 10, p.y + 13], [p.x + 4, p.y + 14]], '#767c72');
    const ctx = this.ctx;
    ctx.strokeStyle = 'rgba(42, 46, 42, .5)';
    ctx.lineWidth = .8;
    ctx.beginPath();
    ctx.moveTo(p.x - 5, p.y + 6); ctx.lineTo(p.x - 2, p.y + 12);
    ctx.stroke();
  }

  drawBerry(p, node) {
    const ctx = this.ctx;
    this.ellipse(p.x + 2, p.y + 16, 12, 4, 'rgba(8, 10, 6, .35)');
    ctx.fillStyle = '#354b2b';
    ctx.beginPath();
    ctx.arc(p.x - 6, p.y + 8, 8, 0, TAU);
    ctx.arc(p.x + 5, p.y + 8, 8.5, 0, TAU);
    ctx.arc(p.x, p.y + 3, 7, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#456239';
    ctx.beginPath();
    ctx.arc(p.x - 4, p.y + 5, 4, 0, TAU);
    ctx.arc(p.x + 5, p.y + 5, 4, 0, TAU);
    ctx.fill();
    const dots = [[-8, 8], [-3, 4], [4, 6], [8, 10], [-1, 11], [3, 2]];
    ctx.fillStyle = '#a84238';
    for (const [dx, dy] of dots) {
      ctx.beginPath();
      ctx.arc(p.x + dx, p.y + dy, 1.3, 0, TAU);
      ctx.fill();
    }
    ctx.fillStyle = 'rgba(233, 142, 118, .55)';
    ctx.fillRect(p.x - 4, p.y + 3, .9, .9);
  }

  drawSheep(p, node) {
    const ctx = this.ctx;
    const bob = Math.sin(this.time * 2.4 + node.variant * 7) * .7;
    this.ellipse(p.x, p.y + 15, 9, 3.5, 'rgba(8, 10, 6, .3)');
    ctx.strokeStyle = '#4d4738';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(p.x - 4, p.y + 11); ctx.lineTo(p.x - 5, p.y + 16);
    ctx.moveTo(p.x + 3, p.y + 11); ctx.lineTo(p.x + 4, p.y + 16);
    ctx.stroke();
    ctx.fillStyle = '#d8d0b7';
    ctx.beginPath();
    ctx.ellipse(p.x, p.y + 8 + bob, 8, 5, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#bdb59d';
    ctx.beginPath();
    ctx.arc(p.x + 6, p.y + 6 + bob, 3.2, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#514a3d';
    ctx.beginPath();
    ctx.arc(p.x + 7, p.y + 5 + bob, 1.1, 0, TAU);
    ctx.fill();
  }

  drawCamp(camp) {
    const ctx = this.ctx;
    const p = this.iso(camp.x + .5, camp.y + .5);
    this.ellipse(p.x, p.y + 16, 38, 13, 'rgba(7, 7, 5, .35)');
    ctx.strokeStyle = 'rgba(43, 31, 22, .85)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(p.x - 30, p.y + 17);
    ctx.lineTo(p.x - 8, p.y - 3);
    ctx.stroke();
    this.poly([[p.x - 34, p.y + 15], [p.x - 24, p.y - 18], [p.x - 4, p.y + 4]], '#5e3b2d', 'rgba(28,16,11,.5)', 1);
    this.poly([[p.x - 24, p.y - 18], [p.x - 18, p.y + 6], [p.x - 4, p.y + 4]], '#734a36');
    this.poly([[p.x + 3, p.y + 12], [p.x + 16, p.y - 13], [p.x + 30, p.y + 7]], '#4d342b', 'rgba(27,16,12,.4)', 1);
    this.poly([[p.x + 16, p.y - 13], [p.x + 18, p.y + 9], [p.x + 30, p.y + 7]], '#613f31');
    ctx.strokeStyle = '#2e2017';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(p.x + 16, p.y - 13); ctx.lineTo(p.x + 17, p.y - 24);
    ctx.stroke();
    const wave = Math.sin(this.time * 3 + camp.variant) * 2;
    this.poly([[p.x + 17, p.y - 24], [p.x + 17 + 10 + wave, p.y - 21], [p.x + 17, p.y - 15]], '#812e26');
    const flick = Math.sin(this.time * 9 + camp.variant * 4) * .18;
    const fireX = p.x - 2;
    const fireY = p.y + 8;
    const glow = ctx.createRadialGradient(fireX, fireY, 1, fireX, fireY, 26);
    glow.addColorStop(0, 'rgba(245, 157, 72, .22)');
    glow.addColorStop(1, 'rgba(245, 157, 72, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(fireX - 28, fireY - 28, 56, 56);
    ctx.fillStyle = '#e68a3d';
    ctx.beginPath();
    ctx.moveTo(fireX - 5, fireY + 4);
    ctx.quadraticCurveTo(fireX - 3, fireY - 8 - flick * 15, fireX + 1, fireY - 11 - flick * 12);
    ctx.quadraticCurveTo(fireX + 7, fireY - 3, fireX + 5, fireY + 4);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#ffd284';
    ctx.beginPath();
    ctx.moveTo(fireX - 1, fireY + 3);
    ctx.quadraticCurveTo(fireX + 1, fireY - 3, fireX + 2, fireY - 6);
    ctx.quadraticCurveTo(fireX + 4, fireY - 1, fireX + 3, fireY + 3);
    ctx.closePath();
    ctx.fill();
    for (let i = 0; i < 2; i++) {
      const t = (this.time * .55 + i * .5 + camp.variant * .3) % 1;
      ctx.fillStyle = `rgba(170, 162, 143, ${.18 * (1 - t)})`;
      ctx.beginPath();
      ctx.arc(fireX + t * 12, fireY - 12 - t * 28, 3 + t * 6, 0, TAU);
      ctx.fill();
    }
  }

  drawBuilding(building) {
    const ctx = this.ctx;
    const def = BUILDINGS[building.kind];
    const base = this.iso(building.x, building.y);
    const center = this.iso(building.x + building.w / 2, building.y + building.h / 2);
    const shadowW = building.w * 24;
    ctx.save();
    this.ellipse(center.x + 4, center.y + 12, shadowW, building.h * 9, 'rgba(6, 8, 5, .36)');
    if (building.selected) this.drawSelectionRing(center.x, center.y + 6, building.w * 19, building.h * 7.5, '#e3c17a');
    if (!building.complete) {
      this.drawConstruction(building, base, center);
      ctx.restore();
      return;
    }
    if (building.kind === 'towncenter') this.drawTownCenter(building);
    else if (building.kind === 'house') this.drawHouse(building);
    else if (building.kind === 'barracks') this.drawBarracks(building);
    else if (building.kind === 'archery') this.drawArchery(building);
    else if (building.kind === 'tower') this.drawTower(building);
    else if (building.kind === 'farm') this.drawFarm(building);
    this.drawBuildingStatus(building);
    ctx.restore();
  }

  drawSelectionRing(cx, cy, rx, ry, color) {
    const ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.6;
    ctx.setLineDash([5, 5]);
    ctx.lineDashOffset = -this.time * 14;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, TAU);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle = 'rgba(0, 0, 0, .35)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx + 1.5, ry + 1.5, 0, 0, TAU);
    ctx.stroke();
    ctx.restore();
  }

  facePoints(building, z = 0, inset = 0) {
    const x = building.x + inset;
    const y = building.y + inset;
    const w = building.w - inset * 2;
    const h = building.h - inset * 2;
    const N = this.iso(x, y);
    const E = this.iso(x + w, y);
    const S = this.iso(x + w, y + h);
    const W = this.iso(x, y + h);
    return {
      N: { x: N.x, y: N.y - z },
      E: { x: E.x, y: E.y - z },
      S: { x: S.x, y: S.y - z },
      W: { x: W.x, y: W.y - z }
    };
  }

  drawPrism(building, z0, z1, inset, wallColor, topColor, sideColor = null) {
    const a = this.facePoints(building, z0, inset);
    const b = this.facePoints(building, z1, inset);
    const ctx = this.ctx;
    const se = [a.E, a.S, b.S, b.E];
    const sw = [a.S, a.W, b.W, b.S];
    this.poly(se, sideColor || wallColor);
    this.poly(sw, mixColor(sideColor || wallColor, '#000000', .18));
    this.poly([b.N, b.E, b.S, b.W], topColor);
    ctx.strokeStyle = 'rgba(28, 20, 12, .24)';
    ctx.lineWidth = .8;
    ctx.beginPath();
    ctx.moveTo(b.E.x, b.E.y); ctx.lineTo(a.E.x, a.E.y);
    ctx.moveTo(b.S.x, b.S.y); ctx.lineTo(a.S.x, a.S.y);
    ctx.moveTo(b.W.x, b.W.y); ctx.lineTo(a.W.x, a.W.y);
    ctx.stroke();
    return { a, b };
  }

  drawRoof(building, z, height, inset, color, ridgeColor) {
    const p = this.facePoints(building, z, inset);
    const apex = this.iso(building.x + building.w / 2, building.y + building.h / 2);
    apex.y -= z + height;
    const ctx = this.ctx;
    this.poly([p.N, p.E, apex], mixColor(color, '#ffffff', .07));
    this.poly([p.E, p.S, apex], mixColor(color, '#000000', .12));
    this.poly([p.S, p.W, apex], mixColor(color, '#000000', .22));
    this.poly([p.W, p.N, apex], mixColor(color, '#ffffff', .02));
    ctx.strokeStyle = ridgeColor;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(apex.x, apex.y);
    ctx.lineTo(p.S.x, p.S.y);
    ctx.stroke();
    return apex;
  }

  wallFacePoints(building, z0, z1, inset, face = 'se') {
    const a = this.facePoints(building, z0, inset);
    const b = this.facePoints(building, z1, inset);
    return face === 'se' ? [a.E, a.S, b.S, b.E] : [a.S, a.W, b.W, b.S];
  }

  drawTownCenter(building) {
    const ctx = this.ctx;
    const b = building;
    this.drawPrism(b, 0, 9, 0, '#746f60', '#8c8672', '#625d50');
    this.drawPrism(b, 9, 27, .38, '#8c8370', '#a19a84', '#746c5c');
    const wall = this.facePoints(b, 9, .38);
    const top = this.facePoints(b, 27, .38);
    ctx.strokeStyle = 'rgba(58, 49, 36, .3)';
    ctx.lineWidth = .8;
    for (let i = 1; i < 4; i++) {
      const t = i / 4;
      const x1 = wall.E.x + (wall.S.x - wall.E.x) * t;
      const y1 = wall.E.y + (wall.S.y - wall.E.y) * t;
      const x2 = top.E.x + (top.S.x - top.E.x) * t;
      const y2 = top.E.y + (top.S.y - top.E.y) * t;
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    }
    const doorX = wall.E.x + (wall.S.x - wall.E.x) * .38;
    const doorY = wall.E.y + (wall.S.y - wall.E.y) * .38;
    ctx.fillStyle = '#382717';
    ctx.beginPath();
    ctx.moveTo(doorX - 6, doorY + 1);
    ctx.lineTo(doorX - 6, doorY - 15);
    ctx.quadraticCurveTo(doorX, doorY - 23, doorX + 6, doorY - 15);
    ctx.lineTo(doorX + 6, doorY + 1);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(204, 178, 119, .35)';
    ctx.lineWidth = 1;
    ctx.stroke();
    this.drawWindow(doorX - 24, doorY - 7, 3, 7);
    this.drawWindow(doorX + 21, doorY - 8, 3, 7);
    this.drawPrism(b, 27, 43, .85, '#6c4c2e', '#8d633b', '#5c4028');
    const timber = this.facePoints(b, 27, .85);
    const upper = this.facePoints(b, 43, .85);
    ctx.strokeStyle = 'rgba(40, 28, 16, .7)';
    ctx.lineWidth = 1.4;
    const beamXs = [.18, .82];
    for (const t of beamXs) {
      const x1 = timber.E.x + (timber.S.x - timber.E.x) * t;
      const y1 = timber.E.y + (timber.S.y - timber.E.y) * t;
      const x2 = upper.E.x + (upper.S.x - upper.E.x) * t;
      const y2 = upper.E.y + (upper.S.y - upper.E.y) * t;
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(timber.E.x, timber.E.y);
    ctx.lineTo(upper.S.x, upper.S.y);
    ctx.moveTo(timber.S.x, timber.S.y);
    ctx.lineTo(upper.E.x, upper.E.y);
    ctx.stroke();
    this.drawWindow(upper.E.x + (upper.S.x - upper.E.x) * .28, upper.E.y + (upper.S.y - upper.E.y) * .28 - 2, 4, 8);
    this.drawWindow(upper.E.x + (upper.S.x - upper.E.x) * .68, upper.E.y + (upper.S.y - upper.E.y) * .68 - 2, 4, 8);
    const apex = this.drawRoof(b, 43, 29, .85, '#50341f', 'rgba(31, 20, 12, .8)');
    this.drawFlag(apex.x, apex.y - 1, 1.15, '#b18a42', '#6d4e22');
    this.drawTurrets(b);
    this.drawBanners(b);
    this.drawSmoke(building.x + .8, building.y + .65, 52);
  }

  drawWindow(x, y, w, h) {
    const ctx = this.ctx;
    ctx.fillStyle = '#2d2216';
    ctx.fillRect(x - w / 2, y - h, w, h);
    ctx.fillStyle = 'rgba(230, 178, 86, .3)';
    ctx.fillRect(x - w / 2 + .7, y - h + .8, w - 1.4, h - 1.6);
    ctx.fillStyle = 'rgba(20, 14, 9, .8)';
    ctx.fillRect(x - .4, y - h, .8, h);
  }

  drawTurrets(b) {
    const ctx = this.ctx;
    const positions = [[b.x + .12, b.y + b.h - .88], [b.x + b.w - .88, b.y + .12]];
    for (let i = 0; i < positions.length; i++) {
      const [x, y] = positions[i];
      const mini = { x, y, w: 1, h: 1 };
      const z = i ? 44 : 47;
      this.drawPrism(mini, 0, z, 0, '#827b6b', '#9b9380', '#6b6558');
      const top = this.facePoints(mini, z, 0);
      ctx.fillStyle = '#a29a86';
      for (let c = 0; c < 3; c++) {
        const p1 = top.N.x + (top.E.x - top.N.x) * (c / 3 + .03);
        const p2 = top.N.y + (top.E.y - top.N.y) * (c / 3 + .03);
        ctx.fillRect(p1 - 2, p2 - 8, 4, 8);
      }
      const flagX = (top.N.x + top.S.x) / 2;
      const flagY = (top.N.y + top.S.y) / 2 - 8;
      this.drawFlag(flagX, flagY, .8, i ? '#8d342b' : '#c3a35d', '#3a2a18');
      this.drawWindow(top.S.x - 12, top.S.y + 4, 3, 6);
    }
  }

  drawHouse(building) {
    const ctx = this.ctx;
    this.drawPrism(building, 0, 14, .08, '#b5a37b', '#c3b28b', '#8e8064');
    const wall = this.facePoints(building, 0, .08);
    const top = this.facePoints(building, 14, .08);
    const cx = (wall.S.x + wall.E.x) / 2;
    const cy = (wall.S.y + wall.E.y) / 2;
    const doorX = wall.E.x + (wall.S.x - wall.E.x) * .55;
    const doorY = wall.E.y + (wall.S.y - wall.E.y) * .55;
    this.poly([[doorX - 6, doorY + 1], [doorX - 6, doorY - 14], [doorX + 6, doorY - 14], [doorX + 6, doorY + 1]], '#4a301a');
    ctx.strokeStyle = 'rgba(241, 221, 174, .45)';
    ctx.lineWidth = .8;
    ctx.strokeRect(doorX - 4, doorY - 12, 8, 12);
    this.drawWindow(doorX - 20, doorY - 6, 3, 5);
    ctx.strokeStyle = 'rgba(63, 41, 22, .72)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(wall.E.x, wall.E.y - 14);
    ctx.lineTo(wall.S.x, wall.S.y - 14);
    ctx.moveTo(wall.S.x, wall.S.y - 14);
    ctx.lineTo(wall.W.x, wall.W.y - 14);
    ctx.stroke();
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(wall.E.x + 9, wall.E.y - 9);
    ctx.lineTo(wall.E.x + 9, wall.E.y);
    ctx.moveTo(wall.S.x - 8, wall.S.y - 13);
    ctx.lineTo(wall.S.x - 8, wall.S.y);
    ctx.stroke();
    this.drawRoof(building, 14, 16, .02, '#a78d57', 'rgba(80, 57, 30, .7)');
    const roofP = this.facePoints(building, 14, .4);
    ctx.strokeStyle = 'rgba(91, 68, 35, .42)';
    ctx.lineWidth = .8;
    for (let i = 1; i < 5; i++) {
      const t = i / 5;
      ctx.beginPath();
      ctx.moveTo(roofP.E.x + (roofP.S.x - roofP.E.x) * t, roofP.E.y + (roofP.S.y - roofP.E.y) * t);
      ctx.lineTo(roofP.N.x + (roofP.W.x - roofP.N.x) * t, roofP.N.y + (roofP.W.y - roofP.N.y) * t);
      ctx.stroke();
    }
    this.drawSmoke(building.x + 1.4, building.y + .3, 26);
  }

  drawBarracks(building) {
    const ctx = this.ctx;
    this.drawPrism(building, 0, 11, .06, '#756b58', '#8d816a', '#625a4c');
    this.drawPrism(building, 11, 25, .4, '#805a38', '#9b7045', '#6c4b2e');
    const wall = this.facePoints(building, 11, .4);
    const upper = this.facePoints(building, 25, .4);
    const doorX = wall.E.x + (wall.S.x - wall.E.x) * .54;
    const doorY = wall.E.y + (wall.S.y - wall.E.y) * .54;
    this.poly([[doorX - 7, doorY + 1], [doorX - 7, doorY - 15], [doorX + 7, doorY - 15], [doorX + 7, doorY + 1]], '#332417');
    ctx.strokeStyle = 'rgba(217, 180, 111, .5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(doorX - 6, doorY - 2); ctx.lineTo(doorX + 6, doorY - 2);
    ctx.moveTo(doorX - 6, doorY - 8); ctx.lineTo(doorX + 6, doorY - 8);
    ctx.stroke();
    const shieldX = doorX;
    const shieldY = doorY - 23;
    this.poly([[shieldX - 8, shieldY - 9], [shieldX + 8, shieldY - 9], [shieldX + 7, shieldY + 5], [shieldX, shieldY + 12], [shieldX - 7, shieldY + 5]], '#5d2922', 'rgba(235, 197, 127, .6)', 1);
    ctx.strokeStyle = '#cba960';
    ctx.beginPath();
    ctx.moveTo(shieldX, shieldY - 5); ctx.lineTo(shieldX, shieldY + 6);
    ctx.moveTo(shieldX - 4, shieldY - 1); ctx.lineTo(shieldX + 4, shieldY - 1);
    ctx.stroke();
    this.drawWindow(wall.E.x + (wall.S.x - wall.E.x) * .18, wall.E.y + (wall.S.y - wall.E.y) * .18 - 1, 4, 7);
    this.drawWindow(wall.E.x + (wall.S.x - wall.E.x) * .82, wall.E.y + (wall.S.y - wall.E.y) * .82 - 1, 4, 7);
    ctx.strokeStyle = 'rgba(53, 33, 17, .65)';
    ctx.lineWidth = 1.3;
    for (let i = 0; i < 3; i++) {
      const t = .16 + i * .32;
      ctx.beginPath();
      ctx.moveTo(upper.E.x + (upper.S.x - upper.E.x) * t, upper.E.y + (upper.S.y - upper.E.y) * t);
      ctx.lineTo(upper.E.x + (upper.S.x - upper.E.x) * t, upper.E.y + (upper.S.y - upper.E.y) * t + 12);
      ctx.stroke();
    }
    this.drawRoof(building, 25, 19, .06, '#7d382b', 'rgba(61, 25, 19, .75)');
    this.drawFlag(this.iso(building.x + building.w / 2, building.y + building.h / 2).x + 8, this.iso(building.x + building.w / 2, building.y + building.h / 2).y - 30, .9, '#8e362b', '#44221a');
    const dummy = this.iso(building.x + building.w + .6, building.y + 2.2);
    this.ellipse(dummy.x, dummy.y + 12, 8, 3, 'rgba(8,8,5,.3)');
    ctx.strokeStyle = '#5b4328';
    ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.moveTo(dummy.x, dummy.y + 12); ctx.lineTo(dummy.x, dummy.y - 11); ctx.stroke();
    ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(dummy.x - 8, dummy.y - 4); ctx.lineTo(dummy.x + 8, dummy.y - 4); ctx.stroke();
    ctx.fillStyle = '#a58b5e';
    ctx.beginPath(); ctx.arc(dummy.x, dummy.y - 14, 3, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(170, 144, 91, .5)';
    ctx.beginPath(); ctx.arc(dummy.x, dummy.y - 3, 5, 0, TAU); ctx.stroke();
  }

  drawArchery(building) {
    const ctx = this.ctx;
    this.drawPrism(building, 0, 10, .08, '#76664e', '#8d7b5e', '#645744');
    this.drawPrism(building, 10, 18, .5, '#76502f', '#8f6139', '#654426');
    const wall = this.facePoints(building, 10, .5);
    const doorX = wall.E.x + (wall.S.x - wall.E.x) * .5;
    const doorY = wall.E.y + (wall.S.y - wall.E.y) * .5;
    ctx.fillStyle = '#2d2116';
    ctx.fillRect(doorX - 9, doorY - 16, 18, 16);
    ctx.strokeStyle = 'rgba(184, 143, 82, .45)';
    ctx.lineWidth = 1;
    ctx.strokeRect(doorX - 7, doorY - 14, 14, 14);
    const px = this.iso(building.x + .6, building.y + building.h + .5);
    const py = this.iso(building.x + 1.9, building.y + building.h + .35);
    const targetX = py.x + 3;
    const targetY = py.y + 8;
    ctx.strokeStyle = '#5b4128';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(targetX + 3, targetY + 14); ctx.lineTo(targetX + 3, targetY - 5); ctx.stroke();
    ctx.fillStyle = '#c9b186';
    ctx.beginPath(); ctx.arc(targetX + 3, targetY - 7, 7, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#7e3a2e';
    ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(targetX + 3, targetY - 7, 4.5, 0, TAU); ctx.stroke();
    ctx.beginPath(); ctx.arc(targetX + 3, targetY - 7, 2, 0, TAU); ctx.stroke();
    this.drawRoof(building, 18, 14, .1, '#7c5e32', 'rgba(65, 46, 22, .7)');
    this.drawFlag(this.iso(building.x + building.w - .4, building.y + .5).x + 4, this.iso(building.x + building.w - .4, building.y + .5).y - 24, .8, '#b48e43', '#4c3b1d');
  }

  drawTower(building) {
    const ctx = this.ctx;
    this.drawPrism(building, 0, 8, .05, '#6d6a5d', '#858172', '#5d5a50');
    this.drawPrism(building, 8, 52, .22, '#898273', '#9f9786', '#716a5e');
    const wall = this.facePoints(building, 8, .22);
    const upper = this.facePoints(building, 52, .22);
    ctx.strokeStyle = 'rgba(52, 47, 39, .34)';
    ctx.lineWidth = .8;
    for (let i = 1; i < 5; i++) {
      const t = i / 5;
      const x = wall.E.x + (wall.S.x - wall.E.x) * t;
      const y = wall.E.y + (wall.S.y - wall.E.y) * t;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - 42); ctx.stroke();
    }
    this.drawWindow(upper.S.x - 17, upper.S.y + 20, 3, 7);
    this.drawWindow(upper.S.x - 8, upper.S.y + 30, 3, 7);
    const top = this.facePoints(building, 58, .22);
    ctx.fillStyle = '#9a9281';
    for (let i = 0; i < 5; i++) {
      const t = i / 5 + .02;
      const x = top.E.x + (top.S.x - top.E.x) * t;
      const y = top.E.y + (top.S.y - top.E.y) * t;
      ctx.fillRect(x - 2.5, y - 7, 5, 7);
    }
    const apexX = (top.N.x + top.S.x) / 2;
    const apexY = (top.N.y + top.S.y) / 2;
    this.drawFlag(apexX, apexY - 9, 1, '#a47b35', '#5c431e');
    const torchX = upper.S.x - 4;
    const torchY = upper.S.y + 10;
    const flick = Math.sin(this.time * 7 + building.anim) * .2;
    const glow = ctx.createRadialGradient(torchX, torchY - 4, 1, torchX, torchY - 4, 20);
    glow.addColorStop(0, 'rgba(247, 167, 84, .18)');
    glow.addColorStop(1, 'rgba(247, 167, 84, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(torchX - 21, torchY - 25, 42, 42);
    ctx.fillStyle = '#f0a043';
    ctx.beginPath();
    ctx.moveTo(torchX - 2, torchY);
    ctx.quadraticCurveTo(torchX - 2, torchY - 7 - flick * 7, torchX, torchY - 9 - flick * 7);
    ctx.quadraticCurveTo(torchX + 3, torchY - 3, torchX + 2, torchY);
    ctx.fill();
  }

  drawFarm(building) {
    const ctx = this.ctx;
    const p = this.facePoints(building, 0, .05);
    this.poly([p.N, p.E, p.S, p.W], '#5d4a2e', 'rgba(36, 26, 14, .5)', 1);
    for (let i = 1; i < 6; i++) {
      const t = i / 6;
      const a = { x: p.W.x + (p.N.x - p.W.x) * t, y: p.W.y + (p.N.y - p.W.y) * t };
      const b = { x: p.S.x + (p.E.x - p.S.x) * t, y: p.S.y + (p.E.y - p.S.y) * t };
      ctx.strokeStyle = 'rgba(110, 82, 42, .55)';
      ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      ctx.strokeStyle = 'rgba(163, 145, 74, .7)';
      ctx.lineWidth = .9;
      ctx.beginPath(); ctx.moveTo(a.x + 1, a.y + 2); ctx.lineTo(b.x + 1, b.y + 2); ctx.stroke();
      for (let k = 0; k < 3; k++) {
        const tt = (k + .5) / 3;
        const x = a.x + (b.x - a.x) * tt;
        const y = a.y + (b.y - a.y) * tt + Math.sin(this.time + k + t * 4) * .8;
        ctx.strokeStyle = 'rgba(196, 176, 97, .7)';
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 1, y - 5); ctx.stroke();
      }
    }
    if (building.selected) this.drawSelectionRing(this.iso(building.x + 1, building.y + 1).x, this.iso(building.x + 1, building.y + 1).y + 8, 38, 15, '#e3c17a');
    const cx = this.iso(building.x + building.w / 2, building.y + building.h / 2);
    ctx.fillStyle = 'rgba(231, 206, 137, .0)';
  }

  drawConstruction(building, base, center) {
    const ctx = this.ctx;
    const p = this.facePoints(building, 0, 0);
    this.poly([p.N, p.E, p.S, p.W], '#574936', 'rgba(33, 24, 15, .5)', 1);
    const height = 5 + building.progress * 15;
    this.drawPrism(building, 0, height, .2, 'rgba(132, 121, 98, .55)', 'rgba(146, 134, 108, .75)', 'rgba(102, 93, 78, .7)');
    const frames = [
      [building.x + .2, building.y + .2],
      [building.x + building.w - .4, building.y + .2],
      [building.x + .2, building.y + building.h - .4],
      [building.x + building.w - .4, building.y + building.h - .4]
    ];
    ctx.strokeStyle = 'rgba(74, 51, 28, .9)';
    ctx.lineWidth = 1.6;
    for (const [x, y] of frames) {
      const pp = this.iso(x, y);
      ctx.beginPath();
      ctx.moveTo(pp.x, pp.y + 12);
      ctx.lineTo(pp.x, pp.y - 20 - building.progress * 18);
      ctx.stroke();
    }
    const a = this.iso(building.x + .2, building.y + .2);
    const b = this.iso(building.x + building.w - .4, building.y + .2);
    const c = this.iso(building.x + .2, building.y + .2);
    const d = this.iso(building.x + .2, building.y + building.h - .4);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y - 20 - building.progress * 18);
    ctx.lineTo(b.x, b.y - 20 - building.progress * 18);
    ctx.moveTo(c.x, c.y - 20 - building.progress * 18);
    ctx.lineTo(d.x, d.y - 20 - building.progress * 18);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(195, 165, 104, .5)';
    ctx.lineWidth = .8;
    ctx.beginPath();
    ctx.moveTo(center.x - building.w * 10, center.y + 4);
    ctx.lineTo(center.x + building.w * 10, center.y + 4);
    ctx.stroke();
    const pulse = (Math.sin(this.time * 3) + 1) * .5;
    ctx.fillStyle = `rgba(235, 200, 125, ${.12 + pulse * .12})`;
    ctx.beginPath();
    ctx.arc(center.x, center.y - 14, 2.4, 0, TAU);
    ctx.fill();
  }

  drawBuildingStatus(building) {
    const ctx = this.ctx;
    const center = this.iso(building.x + building.w / 2, building.y + building.h / 2);
    if (building.selected || building.hp < building.maxHp) {
      const width = 36 + building.w * 7;
      const x = center.x - width / 2;
      const y = center.y - building.h * 4 - 45;
      ctx.fillStyle = 'rgba(9, 8, 6, .72)';
      ctx.fillRect(x - 1, y - 1, width + 2, 6);
      ctx.fillStyle = building.team === 'player' ? '#77935c' : '#a5483b';
      ctx.fillRect(x, y, width * clamp(building.hp / building.maxHp, 0, 1), 4);
    }
    if (building.queue.length) {
      const cx = center.x;
      const cy = center.y - building.h * 4 - 36;
      ctx.fillStyle = 'rgba(10, 8, 6, .7)';
      ctx.fillRect(cx - 10, cy - 1, 20, 5);
      ctx.fillStyle = '#d3a451';
      const def = UNITS[building.queue[0]];
      const progress = 1 - building.trainTimer / (def.train * this.game.mods.trainSpeed);
      ctx.fillRect(cx - 9, cy, 18 * clamp(progress, 0, 1), 3);
    }
  }

  drawBanners(building) {
    const ctx = this.ctx;
    const points = [
      { x: building.x + .6, y: building.y + building.h - .3 },
      { x: building.x + building.w - .5, y: building.y + building.h - .4 }
    ];
    for (let i = 0; i < points.length; i++) {
      const p = this.iso(points[i].x, points[i].y);
      const wave = Math.sin(this.time * 2.2 + i) * 2;
      ctx.strokeStyle = '#3a2c18';
      ctx.lineWidth = 1.3;
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x, p.y - 35); ctx.stroke();
      this.poly([[p.x + 1, p.y - 35], [p.x + 12 + wave, p.y - 31], [p.x + 12 + wave, p.y - 19], [p.x + 1, p.y - 24]], i ? '#7a2c25' : '#b08a3f', 'rgba(31,22,12,.4)', .6);
      ctx.fillStyle = 'rgba(242, 219, 164, .55)';
      ctx.fillRect(p.x + 5, p.y - 30, 1, 6);
    }
  }

  drawFlag(x, y, scale, color, poleColor) {
    const ctx = this.ctx;
    const wave = Math.sin(this.time * 2.8 + x * .04) * 3;
    ctx.strokeStyle = poleColor || '#3f2f1a';
    ctx.lineWidth = 1.2 * scale;
    ctx.beginPath();
    ctx.moveTo(x, y + 13 * scale);
    ctx.lineTo(x, y - 10 * scale);
    ctx.stroke();
    this.poly([[x + .5, y - 10 * scale], [x + 10 * scale + wave, y - 7 * scale], [x + 10 * scale + wave, y + 1 * scale], [x + .5, y - 2 * scale]], color, 'rgba(28, 20, 10, .45)', .5);
    ctx.fillStyle = 'rgba(248, 229, 173, .55)';
    ctx.fillRect(x + 3, y - 7 * scale, 1, 4 * scale);
  }

  drawSmoke(x, y, height) {
    const ctx = this.ctx;
    const p = this.iso(x, y);
    const baseY = p.y - height;
    for (let i = 0; i < 4; i++) {
      const t = (this.time * .18 + i * .26) % 1;
      const drift = Math.sin(this.time * .5 + i) * 4;
      ctx.fillStyle = `rgba(174, 168, 151, ${.13 * (1 - t)})`;
      ctx.beginPath();
      ctx.ellipse(p.x + drift + t * 10, baseY - t * 34, 4 + t * 9, 3 + t * 6, 0, 0, TAU);
      ctx.fill();
    }
  }

  drawUnit(unit) {
    const ctx = this.ctx;
    const p = this.iso(unit.x, unit.y);
    const bob = unit.moving ? Math.abs(Math.sin(unit.anim * 2.2)) * 2.2 : Math.sin(unit.anim * .6) * .5;
    const baseY = p.y + 7 - bob;
    const scale = unit.boss ? 1.42 : unit.kind === 'knight' || unit.kind === 'scout' ? 1.08 : .94;
    this.ellipse(p.x, p.y + 10, (unit.boss ? 15 : 9) * scale, (unit.boss ? 5 : 3.5) * scale, 'rgba(6, 8, 5, .4)');
    if (unit.selected) this.drawSelectionRing(p.x, p.y + 8, (unit.boss ? 19 : 11) * scale, (unit.boss ? 7 : 4) * scale, unit.team === 'enemy' ? '#b65143' : '#dfbd73');
    ctx.save();
    ctx.translate(p.x, baseY);
    const flip = Math.cos(unit.facing) < -0.05 ? -1 : 1;
    ctx.scale(flip * scale, scale);
    if (unit.kind === 'knight' || unit.kind === 'scout') this.drawHorseman(unit);
    else if (unit.kind === 'arbalester') this.drawArcher(unit);
    else if (unit.kind === 'longbow' || unit.kind === 'archer' || unit.kind === 'skirmisher') this.drawArcher(unit);
    else if (unit.kind === 'brute' || unit.boss) this.drawBrute(unit);
    else if (unit.kind === 'spearman') this.drawSpearman(unit);
    else if (unit.kind === 'villager') this.drawVillager(unit);
    else this.drawInfantry(unit);
    ctx.restore();
    if (unit.hitFlash > 0) {
      ctx.fillStyle = `rgba(255, 243, 207, ${unit.hitFlash * .6})`;
      ctx.beginPath();
      ctx.ellipse(p.x, baseY - 12 * scale, 8 * scale, 14 * scale, 0, 0, TAU);
      ctx.fill();
    }
    if (unit.selected || unit.hp < unit.maxHp || unit.boss) {
      const width = unit.boss ? 48 : 23;
      const x = p.x - width / 2;
      const y = baseY - (unit.boss ? 47 : 37) * scale;
      ctx.fillStyle = 'rgba(8, 7, 5, .74)';
      ctx.fillRect(x - 1, y - 1, width + 2, 5);
      ctx.fillStyle = unit.team === 'enemy' ? '#a94a3d' : '#7e995f';
      ctx.fillRect(x, y, width * clamp(unit.hp / unit.maxHp, 0, 1), 3);
      if (unit.boss) {
        ctx.fillStyle = '#d3a451';
        ctx.fillRect(x + width * clamp(unit.hp / unit.maxHp, 0, 1) - 1, y - 1, 2, 5);
      }
    }
    if (unit.carry > 0 && unit.team === 'player') {
      const colors = { wood: '#87633a', food: '#b9784d', gold: '#d3ae4f', stone: '#8d9189' };
      ctx.fillStyle = colors[unit.carryType] || '#bda367';
      ctx.beginPath();
      ctx.arc(p.x + 10 * scale, baseY - 16 * scale, 3.2 * scale, 0, TAU);
      ctx.fill();
    }
  }

  drawVillager(unit) {
    const ctx = this.ctx;
    const enemy = unit.team === 'enemy';
    const step = Math.sin(unit.anim * 2.2) * (unit.moving ? 3 : .4);
    const swing = unit.attackAnim > 0 ? Math.sin(unit.attackAnim / .32 * Math.PI) * 1.2 : 0;
    ctx.strokeStyle = '#3c2c19';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-2, -8); ctx.lineTo(-3 + step, 0); ctx.moveTo(2, -8); ctx.lineTo(3 - step, 0); ctx.stroke();
    this.poly([[-5, -21], [5, -21], [7, -9], [-7, -9]], enemy ? '#6d3a2d' : '#7f6037');
    this.poly([[-5, -21], [1, -21], [2, -9], [-7, -9]], enemy ? '#7d4536' : '#94724a');
    ctx.fillStyle = enemy ? '#8a3f32' : '#426b47';
    ctx.fillRect(-7, -15, 14, 3);
    ctx.fillStyle = '#c9a77c';
    ctx.beginPath(); ctx.arc(0, -27, 4.5, 0, TAU); ctx.fill();
    ctx.fillStyle = enemy ? '#4c2b22' : '#5e4528';
    ctx.beginPath(); ctx.arc(0, -28, 5, Math.PI, TAU); ctx.fill();
    ctx.fillRect(-5, -28, 10, 2);
    ctx.strokeStyle = '#79552f';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    const toolAng = unit.task === 'gather' ? Math.sin(this.time * 7 + unit.anim) * .6 : -.4;
    ctx.moveTo(5, -17);
    ctx.lineTo(9 + Math.cos(toolAng) * 6, -18 + Math.sin(toolAng) * 6);
    ctx.stroke();
    ctx.fillStyle = '#a6a397';
    ctx.fillRect(13 + Math.cos(toolAng) * 5, -20 + Math.sin(toolAng) * 5, 4, 2);
    if (unit.carry > 0) {
      ctx.fillStyle = '#6f5837';
      ctx.beginPath(); ctx.ellipse(-6, -14, 4, 5, -.3, 0, TAU); ctx.fill();
    }
    if (swing > 0) {
      ctx.strokeStyle = 'rgba(219, 193, 137, .5)';
      ctx.lineWidth = .8;
      ctx.beginPath(); ctx.arc(7, -17, 9, -.7, .8); ctx.stroke();
    }
  }

  drawInfantry(unit) {
    const ctx = this.ctx;
    const enemy = unit.team === 'enemy';
    const step = Math.sin(unit.anim * 2.1) * (unit.moving ? 3.2 : .4);
    const swing = unit.attackAnim > 0 ? Math.sin((1 - unit.attackAnim / .32) * Math.PI) : 0;
    ctx.strokeStyle = '#302b22';
    ctx.lineWidth = 2.3;
    ctx.beginPath(); ctx.moveTo(-2.5, -8); ctx.lineTo(-3.5 + step, 0); ctx.moveTo(2.5, -8); ctx.lineTo(3.5 - step, 0); ctx.stroke();
    this.poly([[-6, -23], [6, -23], [8, -8], [-8, -8]], enemy ? '#573730' : '#6f726a');
    this.poly([[-6, -23], [0, -23], [1, -8], [-8, -8]], enemy ? '#6a3f36' : '#888b80');
    ctx.fillStyle = enemy ? '#7f3028' : '#596b45';
    ctx.fillRect(-8, -15, 16, 3);
    ctx.fillStyle = enemy ? '#463027' : '#9d9b8c';
    ctx.beginPath(); ctx.arc(0, -29, 5.5, 0, TAU); ctx.fill();
    ctx.fillStyle = enemy ? '#5b3830' : '#7e7e73';
    ctx.beginPath(); ctx.arc(0, -30, 5.7, Math.PI, TAU); ctx.fill();
    ctx.fillRect(-5.7, -30, 11.4, 2.4);
    ctx.fillStyle = '#2f2a20';
    ctx.fillRect(-.8, -31, 1.6, 3);
    ctx.save();
    ctx.translate(-7, -17);
    ctx.rotate(-.2 + swing * .3);
    this.poly([[-3, -8], [3, -8], [4, 7], [0, 10], [-4, 7]], enemy ? '#663029' : '#8d6a3b', 'rgba(31,22,12,.55)', .7);
    ctx.fillStyle = '#d3b371';
    ctx.fillRect(-1, -5, 2, 10);
    ctx.fillRect(-3, -1, 6, 1.5);
    ctx.restore();
    ctx.save();
    ctx.translate(6, -18);
    ctx.rotate(-.5 + swing * 1.7);
    ctx.strokeStyle = '#d0c9b3';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, 5); ctx.lineTo(0, -15); ctx.stroke();
    ctx.fillStyle = '#b9b19d';
    ctx.beginPath(); ctx.moveTo(-2, -15); ctx.lineTo(2, -15); ctx.lineTo(0, -21); ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  drawSpearman(unit) {
    const ctx = this.ctx;
    const step = Math.sin(unit.anim * 2.1) * (unit.moving ? 3 : .4);
    ctx.strokeStyle = '#3b2f20';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-2, -8); ctx.lineTo(-3 + step, 0); ctx.moveTo(2, -8); ctx.lineTo(3 - step, 0); ctx.stroke();
    this.poly([[-5, -22], [5, -22], [6, -8], [-6, -8]], '#5f4d32');
    this.poly([[-5, -22], [1, -22], [2, -8], [-6, -8]], '#776040');
    ctx.fillStyle = '#4d5f45';
    ctx.fillRect(-6, -14, 12, 2.5);
    ctx.fillStyle = '#c9a67b';
    ctx.beginPath(); ctx.arc(0, -27, 4, 0, TAU); ctx.fill();
    ctx.fillStyle = '#5b4a30';
    ctx.beginPath(); ctx.arc(0, -28, 4.5, Math.PI, TAU); ctx.fill();
    ctx.strokeStyle = '#b8a680';
    ctx.lineWidth = 1.5;
    const spearAngle = -.25 + (unit.attackAnim > 0 ? Math.sin(unit.attackAnim / .32 * Math.PI) * .3 : 0);
    ctx.save();
    ctx.translate(7, -18);
    ctx.rotate(spearAngle);
    ctx.beginPath(); ctx.moveTo(0, 11); ctx.lineTo(0, -23); ctx.stroke();
    ctx.fillStyle = '#cfc7b1';
    ctx.beginPath(); ctx.moveTo(-2, -23); ctx.lineTo(2, -23); ctx.lineTo(0, -30); ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  drawArcher(unit) {
    const ctx = this.ctx;
    const enemy = unit.team === 'enemy';
    const step = Math.sin(unit.anim * 2.2) * (unit.moving ? 2.6 : .3);
    ctx.strokeStyle = '#3a3122';
    ctx.lineWidth = 1.9;
    ctx.beginPath(); ctx.moveTo(-2, -8); ctx.lineTo(-3 + step, 0); ctx.moveTo(2, -8); ctx.lineTo(3 - step, 0); ctx.stroke();
    this.poly([[-5, -21], [5, -21], [6, -8], [-6, -8]], enemy ? '#5f4030' : '#4c5f3b');
    this.poly([[-5, -21], [1, -21], [2, -8], [-6, -8]], enemy ? '#75503a' : '#627444');
    ctx.fillStyle = enemy ? '#7c3028' : '#8a7040';
    ctx.fillRect(-6, -14, 12, 2.2);
    ctx.fillStyle = '#c9a77b';
    ctx.beginPath(); ctx.arc(0, -26, 4, 0, TAU); ctx.fill();
    ctx.fillStyle = enemy ? '#59342a' : '#3f4f2e';
    ctx.beginPath(); ctx.arc(0, -27, 4.8, Math.PI, TAU); ctx.fill();
    ctx.strokeStyle = enemy ? '#9b583e' : '#88653a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(2, -22);
    ctx.quadraticCurveTo(14, -28, 11, -35);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(196, 172, 118, .6)';
    ctx.beginPath();
    ctx.moveTo(3, -22);
    ctx.lineTo(11, -35);
    ctx.stroke();
    ctx.fillStyle = '#7a3d2f';
    ctx.fillRect(-6, -20, 3, 7);
    ctx.strokeStyle = '#5f4326';
    ctx.beginPath(); ctx.moveTo(-5, -19); ctx.lineTo(1, -23); ctx.stroke();
  }

  drawHorseman(unit) {
    const ctx = this.ctx;
    const enemy = unit.team === 'enemy';
    const step = Math.sin(unit.anim * 2.4) * (unit.moving ? 2.6 : .3);
    const horseColor = enemy ? '#5f3b30' : unit.kind === 'scout' ? '#8b6c45' : '#6b5140';
    ctx.strokeStyle = '#3d2f23';
    ctx.lineWidth = 2.1;
    ctx.beginPath();
    ctx.moveTo(-7, -9); ctx.lineTo(-8 + step, 2);
    ctx.moveTo(6, -9); ctx.lineTo(8 - step, 2);
    ctx.stroke();
    ctx.fillStyle = horseColor;
    ctx.beginPath(); ctx.ellipse(0, -12, 12, 6.5, 0, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.ellipse(15, -18, 5, 4, -.3, 0, TAU); ctx.fill();
    ctx.fillStyle = mixColor(horseColor, '#000000', .22);
    ctx.beginPath(); ctx.ellipse(-12, -13, 4, 4.5, .5, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#362a1d';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(17, -19); ctx.lineTo(20, -24);
    ctx.stroke();
    ctx.fillStyle = enemy ? '#7f332a' : '#445f3d';
    this.poly([[-4, -25], [4, -25], [6, -14], [-6, -14]], enemy ? '#6d3f33' : '#63704d');
    ctx.fillStyle = '#c6a277';
    ctx.beginPath(); ctx.arc(0, -31, 3.8, 0, TAU); ctx.fill();
    if (unit.kind === 'knight') {
      ctx.fillStyle = '#9c9c8e';
      ctx.beginPath(); ctx.arc(0, -32, 4.3, Math.PI, TAU); ctx.fill();
      ctx.fillRect(-4.3, -32, 8.6, 2);
      ctx.fillStyle = '#c94335';
      ctx.fillRect(-1, -37, 2, 5);
      ctx.strokeStyle = '#c8c2ae';
      ctx.lineWidth = 2;
      const lance = unit.attackAnim > 0 ? Math.sin(unit.attackAnim / .32 * Math.PI) * .2 : 0;
      ctx.save(); ctx.translate(10, -23); ctx.rotate(-.6 + lance);
      ctx.beginPath(); ctx.moveTo(0, 14); ctx.lineTo(0, -22); ctx.stroke();
      ctx.fillStyle = '#d3cbb6'; ctx.beginPath(); ctx.moveTo(-2, -22); ctx.lineTo(2, -22); ctx.lineTo(0, -29); ctx.closePath(); ctx.fill();
      ctx.restore();
    } else {
      ctx.strokeStyle = '#6f5330';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, -34); ctx.lineTo(3, -38); ctx.stroke();
    }
  }

  drawBrute(unit) {
    const ctx = this.ctx;
    const enemy = unit.team === 'enemy';
    const step = Math.sin(unit.anim * 1.9) * (unit.moving ? 3 : .5);
    ctx.strokeStyle = '#2e261d';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-4, -9); ctx.lineTo(-6 + step, 1); ctx.moveTo(4, -9); ctx.lineTo(6 - step, 1); ctx.stroke();
    this.poly([[-9, -27], [9, -27], [11, -10], [-11, -10]], enemy ? '#4b342d' : '#4b3c2b');
    this.poly([[-9, -27], [0, -27], [1, -10], [-11, -10]], enemy ? '#654036' : '#5b4935');
    ctx.fillStyle = unit.boss ? '#941f1b' : '#743027';
    ctx.fillRect(-11, -20, 22, 4);
    ctx.fillStyle = unit.boss ? '#4b2520' : '#5f352a';
    ctx.beginPath(); ctx.arc(0, -35, 7, 0, TAU); ctx.fill();
    if (unit.boss) {
      ctx.fillStyle = '#b48b44';
      ctx.beginPath();
      ctx.moveTo(-7, -39); ctx.lineTo(-4, -47); ctx.lineTo(0, -40); ctx.lineTo(4, -47); ctx.lineTo(7, -39);
      ctx.fill();
      ctx.fillStyle = '#34251b';
      ctx.fillRect(-5, -36, 2.5, 2);
      ctx.fillRect(2.5, -36, 2.5, 2);
    }
    ctx.strokeStyle = '#4d3823';
    ctx.lineWidth = 3.4;
    const swing = unit.attackAnim > 0 ? Math.sin((1 - unit.attackAnim / .32) * Math.PI) : 0;
    ctx.save(); ctx.translate(10, -20); ctx.rotate(-.5 + swing * 1.3);
    ctx.strokeStyle = '#6f4d2c'; ctx.lineWidth = 2.8;
    ctx.beginPath(); ctx.moveTo(0, 8); ctx.lineTo(0, -19); ctx.stroke();
    ctx.fillStyle = '#9fa092';
    ctx.beginPath();
    ctx.moveTo(-6, -18); ctx.lineTo(6, -18); ctx.lineTo(9, -11); ctx.lineTo(-4, -7); ctx.closePath(); ctx.fill();
    ctx.restore();
    if (unit.boss) {
      ctx.strokeStyle = 'rgba(218, 122, 87, .5)';
      ctx.lineWidth = 1.1;
      ctx.beginPath(); ctx.arc(0, -20, 17, 0, TAU); ctx.stroke();
    }
  }

  drawProjectiles() {
    const ctx = this.ctx;
    for (const projectile of this.game.projectiles) {
      const p = this.iso(projectile.x, projectile.y);
      const z = projectile.z + Math.sin(clamp(projectile.life / 3, 0, 1) * Math.PI) * 1.6;
      const x = p.x;
      const y = p.y - z * 10;
      const angle = projectile.angle ?? -0.6;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.strokeStyle = projectile.color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-5, 0);
      ctx.lineTo(4, 0);
      ctx.stroke();
      ctx.fillStyle = projectile.color;
      ctx.beginPath();
      ctx.moveTo(4, 0); ctx.lineTo(1, -1.7); ctx.lineTo(1, 1.7);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(235, 218, 168, .28)';
      ctx.beginPath();
      ctx.moveTo(-10, 0); ctx.lineTo(-5, 0);
      ctx.stroke();
      ctx.restore();
    }
  }

  drawParticles() {
    const ctx = this.ctx;
    for (const particle of this.game.particles) {
      const p = this.iso(particle.x, particle.y);
      const y = p.y - particle.z * 10;
      const alpha = clamp(particle.life / particle.maxLife, 0, 1);
      if (particle.type === 'dust') {
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = alpha * .45;
        ctx.beginPath(); ctx.ellipse(p.x, y, particle.size, particle.size * .55, 0, 0, TAU); ctx.fill();
      } else if (particle.type === 'spark') {
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = alpha;
        ctx.fillRect(p.x, y, particle.size, particle.size * .8);
      } else if (particle.type === 'blood') {
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = alpha * .8;
        ctx.beginPath(); ctx.arc(p.x, y, particle.size, 0, TAU); ctx.fill();
      } else if (particle.type === 'debris') {
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = alpha;
        ctx.fillRect(p.x, y, particle.size, particle.size);
      } else if (particle.type === 'stump') {
        ctx.fillStyle = '#5e462c';
        ctx.globalAlpha = alpha;
        ctx.beginPath(); ctx.ellipse(p.x, y, particle.size, particle.size * .5, 0, 0, TAU); ctx.fill();
      } else {
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = alpha;
        ctx.beginPath(); ctx.arc(p.x, y, particle.size, 0, TAU); ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  drawFloaters() {
    const ctx = this.ctx;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const floater of this.game.floaters) {
      const p = this.iso(floater.x, floater.y);
      const alpha = clamp(floater.life / floater.maxLife, 0, 1);
      ctx.globalAlpha = alpha;
      ctx.font = '600 10px "Palatino Linotype", "WenQuanYi Zen Hei", "Noto Sans CJK TC", Georgia, serif';
      ctx.fillStyle = 'rgba(0,0,0,.6)';
      ctx.fillText(floater.text, p.x + 1, p.y - floater.z * 10 + 1);
      ctx.fillStyle = floater.color;
      ctx.fillText(floater.text, p.x, p.y - floater.z * 10);
    }
    ctx.globalAlpha = 1;
  }

  drawPlacement() {
    const placement = this.game.placement;
    if (!placement) return;
    const def = BUILDINGS[placement.kind];
    const ctx = this.ctx;
    const p = this.facePoints({ x: placement.x, y: placement.y, w: def.size, h: def.size }, 0, 0);
    const color = placement.valid ? 'rgba(137, 171, 103, .3)' : 'rgba(165, 70, 57, .3)';
    const stroke = placement.valid ? 'rgba(201, 224, 152, .9)' : 'rgba(207, 92, 77, .9)';
    this.poly([p.N, p.E, p.S, p.W], color, stroke, 1.4);
    ctx.fillStyle = stroke;
    for (const point of [p.N, p.E, p.S, p.W]) {
      ctx.beginPath(); ctx.arc(point.x, point.y, 2, 0, TAU); ctx.fill();
    }
  }

  drawBoxSelection() {
    const box = this.game.selectionBox;
    if (!box) return;
    const ctx = this.ctx;
    ctx.strokeStyle = 'rgba(223, 198, 132, .9)';
    ctx.fillStyle = 'rgba(201, 165, 90, .1)';
    ctx.lineWidth = 1.2;
    const x = Math.min(box.x1, box.x2);
    const y = Math.min(box.y1, box.y2);
    const w = Math.abs(box.x2 - box.x1);
    const h = Math.abs(box.y2 - box.y1);
    ctx.fillRect(x, y, w, h);
    ctx.strokeRect(x, y, w, h);
  }

  drawLighting() {
    const wave = this.game.state === 'menu' ? 1 : this.game.waveIndex;
    const key = `${wave}|${this.game.state}|${this.width}x${this.height}@${this.dpr}`;
    if (this.lightingKey !== key || !this.lightingCache) {
      const cache = document.createElement('canvas');
      cache.width = Math.floor(this.width * this.dpr);
      cache.height = Math.floor(this.height * this.dpr);
      const cacheCtx = cache.getContext('2d');
      cacheCtx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      this.paintLighting(cacheCtx, wave);
      this.lightingCache = cache;
      this.lightingKey = key;
    }
    const ctx = this.ctx;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(this.lightingCache, 0, 0);
    if (this.game.state !== 'menu' && this.game.state !== 'victory' && this.game.state !== 'defeat' && this.game.phase === 'battle') {
      const dangerKey = `${this.width}x${this.height}@${this.dpr}`;
      if (this.dangerKey !== dangerKey || !this.dangerCache) {
        const cache = document.createElement('canvas');
        cache.width = Math.floor(this.width * this.dpr);
        cache.height = Math.floor(this.height * this.dpr);
        const cacheCtx = cache.getContext('2d');
        cacheCtx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
        cacheCtx.fillStyle = 'rgba(128, 30, 24, .09)';
        cacheCtx.fillRect(0, 0, this.width, this.height);
        const edge = cacheCtx.createRadialGradient(this.width / 2, this.height / 2, this.height * .35, this.width / 2, this.height / 2, this.width * .72);
        edge.addColorStop(0, 'rgba(0,0,0,0)');
        edge.addColorStop(1, 'rgba(0,0,0,.5)');
        cacheCtx.globalCompositeOperation = 'destination-out';
        cacheCtx.fillStyle = edge;
        cacheCtx.fillRect(0, 0, this.width, this.height);
        cacheCtx.globalCompositeOperation = 'source-over';
        this.dangerCache = cache;
        this.dangerKey = dangerKey;
      }
      const pulse = (Math.sin(this.time * 2.1) + 1) * .5;
      ctx.globalAlpha = .55 + pulse * .55;
      ctx.drawImage(this.dangerCache, 0, 0);
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }

  drawBirds() {
    const ctx = this.ctx;
    ctx.strokeStyle = 'rgba(39, 31, 20, .4)';
    ctx.lineWidth = 1;
    for (const bird of this.birds) {
      const x = (bird.x + this.time * bird.speed) % (this.width + 160) - 80;
      const y = bird.y + Math.sin(this.time * .4 + bird.phase) * 16;
      const flap = Math.sin(this.time * 2.4 + bird.phase) * 2.5;
      ctx.beginPath();
      ctx.moveTo(x - 5, y + flap);
      ctx.quadraticCurveTo(x - 2, y - 2, x, y);
      ctx.quadraticCurveTo(x + 2, y - 2, x + 5, y + flap);
      ctx.stroke();
    }
  }

  drawScreenMotes() {
    const ctx = this.ctx;
    const wave = this.game.state === 'menu' ? 1 : this.game.waveIndex;
    const night = wave >= 3 && this.game.state !== 'menu';
    const count = night ? 34 : 16;
    for (let i = 0; i < count; i++) {
      const seed = tileHash(i, 3, 77);
      const speed = .01 + seed * .025;
      const x = ((seed * this.width * 2 + this.time * speed * this.width * .05) % (this.width + 80)) - 40;
      const y = ((tileHash(i, 9, 5) * this.height + Math.sin(this.time * .4 + i) * 18) % this.height);
      const alpha = night ? .3 + Math.sin(this.time * 2 + i) * .2 : .12 + Math.sin(this.time * .8 + i) * .06;
      ctx.fillStyle = night ? `rgba(221, 202, 126, ${Math.max(.05, alpha)})` : `rgba(227, 199, 138, ${Math.max(.03, alpha)})`;
      ctx.beginPath();
      ctx.arc(x, y, night ? 1.1 : .8, 0, TAU);
      ctx.fill();
    }
  }

  ensureMinimapCache(canvas) {
    if (this.minimapWorld === this.game.world && this.minimapCache) return;
    const size = canvas.width;
    const scale = size / MAP_W;
    const cache = document.createElement('canvas');
    cache.width = size;
    cache.height = size;
    const ctx = cache.getContext('2d');
    ctx.fillStyle = '#1a1d14';
    ctx.fillRect(0, 0, size, size);
    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        const tile = this.game.world.tiles[y * MAP_W + x];
        let color = '#39442b';
        if (tile.terrain === 'water') color = '#1c3a3e';
        else if (tile.terrain === 'dirt') color = '#655538';
        else if (tile.terrain === 'bridge') color = '#6d4b2c';
        else if (tile.terrain === 'sand') color = '#756b4c';
        else if (tile.terrain === 'ash') color = '#3d342b';
        ctx.fillStyle = color;
        ctx.fillRect(x * scale, y * scale, scale + .5, scale + .5);
      }
    }
    for (const node of this.game.world.nodes) {
      if (node.depleted) continue;
      if (node.type === 'tree') ctx.fillStyle = '#22331f';
      else if (node.type === 'gold') ctx.fillStyle = '#c39e4b';
      else if (node.type === 'stone') ctx.fillStyle = '#85877c';
      else if (node.type === 'berry' || node.type === 'sheep') ctx.fillStyle = '#994438';
      ctx.fillRect(node.x * scale + 2, node.y * scale + 2, scale - 3, scale - 3);
    }
    this.minimapCache = cache;
    this.minimapWorld = this.game.world;
  }

  drawMinimap(canvas) {
    const ctx = canvas.getContext('2d');
    const size = canvas.width;
    const scale = size / MAP_W;
    this.ensureMinimapCache(canvas);
    ctx.clearRect(0, 0, size, size);
    ctx.drawImage(this.minimapCache, 0, 0);
    for (const building of this.game.buildings) {
      if (building.dead) continue;
      ctx.fillStyle = building.team === 'player' ? '#d1ad64' : '#a8483c';
      ctx.fillRect(building.x * scale + 1, building.y * scale + 1, building.w * scale - 2, building.h * scale - 2);
      ctx.strokeStyle = 'rgba(255, 238, 192, .4)';
      ctx.lineWidth = 1;
      ctx.strokeRect(building.x * scale + 1, building.y * scale + 1, building.w * scale - 2, building.h * scale - 2);
    }
    for (const unit of this.game.units) {
      if (unit.dead) continue;
      ctx.fillStyle = unit.team === 'player' ? (unit.kind === 'villager' ? '#dfc978' : '#e9c36c') : '#bd4e42';
      ctx.beginPath();
      ctx.arc((unit.x) * scale, (unit.y) * scale, unit.boss ? 4 : 1.8, 0, TAU);
      ctx.fill();
    }
    for (const camp of this.game.world.camps) {
      const pulse = (Math.sin(this.time * 2 + camp.variant) + 1) * .5;
      ctx.strokeStyle = `rgba(181, 67, 52, ${.35 + pulse * .35})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(camp.x * scale, camp.y * scale, 8 + pulse * 3, 0, TAU);
      ctx.stroke();
    }
    if (this.game.phase === 'battle') {
      ctx.fillStyle = 'rgba(181, 67, 52, .7)';
      for (const spawn of this.game.world.spawnPoints) {
        ctx.beginPath(); ctx.arc(spawn.x * scale, spawn.y * scale, 3, 0, TAU); ctx.fill();
      }
    }
    const corners = [
      this.screenToWorld(0, 0),
      this.screenToWorld(this.width, 0),
      this.screenToWorld(this.width, this.height),
      this.screenToWorld(0, this.height)
    ];
    ctx.strokeStyle = 'rgba(244, 224, 169, .8)';
    ctx.lineWidth = 1.3;
    ctx.strokeRect(
      Math.min(...corners.map(c => c.x)) * scale,
      Math.min(...corners.map(c => c.y)) * scale,
      Math.max(...corners.map(c => c.x)) * scale - Math.min(...corners.map(c => c.x)) * scale,
      Math.max(...corners.map(c => c.y)) * scale - Math.min(...corners.map(c => c.y)) * scale
    );
    const gradient = ctx.createRadialGradient(size / 2, size / 2, size * .3, size / 2, size / 2, size * .72);
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(1, 'rgba(0,0,0,.45)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }
}
