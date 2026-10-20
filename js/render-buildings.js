import { TILE_W, TILE_H } from './constants.js';
import { clamp, lerp, shade, hash2 } from './utils.js';

export const buildingMethods = {
  buildingSelection(b) {
    const ctx = this.ctx;
    const p = this.worldToScreen(b.x, b.y);
    const hw = b.def.size * TILE_W / 2 * this.scale;
    const hh = b.def.size * TILE_H / 2 * this.scale;
    ctx.save();
    ctx.strokeStyle = 'rgba(244,210,128,.9)';
    ctx.lineWidth = 2;
    ctx.shadowColor = 'rgba(244,210,128,.6)';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y - hh);
    ctx.lineTo(p.x + hw, p.y);
    ctx.lineTo(p.x, p.y + hh);
    ctx.lineTo(p.x - hw, p.y);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  },

  isoBox(cx, cy, hw, hh, height, top, left, right) {
    const ctx = this.ctx;
    const ty = cy - height;
    ctx.fillStyle = left;
    ctx.beginPath();
    ctx.moveTo(cx - hw, cy);
    ctx.lineTo(cx, cy + hh);
    ctx.lineTo(cx, cy + hh - height);
    ctx.lineTo(cx - hw, ty);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = right;
    ctx.beginPath();
    ctx.moveTo(cx, cy + hh);
    ctx.lineTo(cx + hw, cy);
    ctx.lineTo(cx + hw, ty);
    ctx.lineTo(cx, cy + hh - height);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = top;
    ctx.beginPath();
    ctx.moveTo(cx, ty - hh);
    ctx.lineTo(cx + hw, ty);
    ctx.lineTo(cx, ty + hh);
    ctx.lineTo(cx - hw, ty);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(20,14,8,.35)';
    ctx.lineWidth = Math.max(0.7, this.scale * 0.9);
    ctx.stroke();
  },

  pyramidRoof(cx, baseY, hw, hh, peak, c1, c2, c3) {
    const ctx = this.ctx;
    const L = { x: cx - hw, y: baseY };
    const R = { x: cx + hw, y: baseY };
    const B = { x: cx, y: baseY + hh };
    const T = { x: cx, y: baseY - hh };
    const A = { x: cx, y: baseY - peak };
    ctx.fillStyle = c1;
    ctx.beginPath(); ctx.moveTo(L.x, L.y); ctx.lineTo(B.x, B.y); ctx.lineTo(A.x, A.y); ctx.closePath(); ctx.fill();
    ctx.fillStyle = c2;
    ctx.beginPath(); ctx.moveTo(B.x, B.y); ctx.lineTo(R.x, R.y); ctx.lineTo(A.x, A.y); ctx.closePath(); ctx.fill();
    ctx.fillStyle = c3;
    ctx.beginPath(); ctx.moveTo(L.x, L.y); ctx.lineTo(T.x, T.y); ctx.lineTo(A.x, A.y); ctx.closePath(); ctx.fill();
    ctx.fillStyle = shade(c2, -0.12);
    ctx.beginPath(); ctx.moveTo(T.x, T.y); ctx.lineTo(R.x, R.y); ctx.lineTo(A.x, A.y); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(20,13,8,.35)';
    ctx.lineWidth = Math.max(0.7, this.scale * 0.9);
    ctx.beginPath();
    ctx.moveTo(A.x, A.y); ctx.lineTo(L.x, L.y);
    ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y);
    ctx.moveTo(A.x, A.y); ctx.lineTo(R.x, R.y);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,220,150,.15)';
    ctx.beginPath();
    ctx.moveTo(A.x, A.y); ctx.lineTo(A.x + 1, baseY - hh * 0.2);
    ctx.stroke();
  },

  merlons(cx, topY, hw, hh, color) {
    const ctx = this.ctx;
    const s = this.scale;
    ctx.fillStyle = color;
    const edges = [
      [cx - hw, topY, cx, topY - hh],
      [cx, topY - hh, cx + hw, topY],
      [cx + hw, topY, cx, topY + hh]
    ];
    for (const [x1, y1, x2, y2] of edges) {
      for (let i = 1; i <= 4; i++) {
        const t = i / 5;
        const x = lerp(x1, x2, t);
        const y = lerp(y1, y2, t);
        ctx.fillRect(x - 2.6 * s, y - 5 * s, 5.2 * s, 5 * s);
      }
    }
  },

  flag(x, y, size, t, color = '#a83227') {
    const ctx = this.ctx;
    ctx.strokeStyle = '#3a2a16';
    ctx.lineWidth = Math.max(0.8, this.scale * 1.2);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y - size);
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.quadraticCurveTo(x + size * 0.42, y - size + Math.sin(t * 3 + x) * 2, x + size * 0.62, y - size * 0.55);
    ctx.lineTo(x + size * 0.4, y - size * 0.34);
    ctx.quadraticCurveTo(x + size * 0.18, y - size * 0.4, x, y - size * 0.35);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(247,217,139,.75)';
    ctx.beginPath(); ctx.arc(x + size * 0.22, y - size * 0.68, size * 0.07, 0, Math.PI * 2); ctx.fill();
  },

  diamond(cx, cy, hw, hh) {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.moveTo(cx, cy - hh);
    ctx.lineTo(cx + hw, cy);
    ctx.lineTo(cx, cy + hh);
    ctx.lineTo(cx - hw, cy);
    ctx.closePath();
  },

  healthBar(x, y, w, ratio, hostile = false) {
    const ctx = this.ctx;
    const h = Math.max(3, 3 * this.scale);
    ctx.fillStyle = 'rgba(8,6,4,.75)';
    ctx.fillRect(x - w / 2 - 1, y - 1, w + 2, h + 2);
    ctx.fillStyle = hostile ? (ratio > 0.3 ? '#b5452f' : '#7d2418') : ratio > 0.5 ? '#7fae58' : ratio > 0.25 ? '#c99a47' : '#a83b2b';
    ctx.fillRect(x - w / 2, y, w * clamp(ratio, 0, 1), h);
  },

  drawBuilding(b, ghost = false) {
    const ctx = this.ctx;
    const s = this.scale;
    const p = this.worldToScreen(b.x, b.y);
    const size = b.def.size;
    const hw = size * TILE_W / 2 * s;
    const hh = size * TILE_H / 2 * s;
    const t = this.game.time || 0;
    const damaged = b.hp / b.maxHp;

    ctx.save();
    if (ghost) ctx.globalAlpha = 0.62;

    ctx.fillStyle = 'rgba(0,0,0,.28)';
    ctx.beginPath();
    ctx.ellipse(p.x + hw * 0.1, p.y + hh * 0.45, hw * 0.86, hh * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();

    if (b.type === 'towncenter') {
      ctx.fillStyle = '#8c806a';
      this.diamond(p.x, p.y, hw * 0.98, hh * 0.98);
      ctx.fill();
      ctx.fillStyle = '#6f6654';
      this.diamond(p.x, p.y + 2 * s, hw * 0.82, hh * 0.82);
      ctx.fill();
      this.isoBox(p.x, p.y - 4 * s, hw * 0.92, hh * 0.92, 15 * s, '#b2a58b', '#746b5a', '#90846d');
      this.merlons(p.x, p.y - 19 * s, hw * 0.92, hh * 0.92, '#8f836c');
      const khw = hw * 0.43, khh = hh * 0.43;
      this.isoBox(p.x, p.y - 13 * s, khw, khh, 44 * s, '#b8ab8f', '#776d5b', '#958972');
      this.pyramidRoof(p.x, p.y - 57 * s, khw * 1.18, khh * 1.18, 30 * s, '#733024', '#9d4531', '#8a3a2a');
      ctx.fillStyle = '#5e2b20';
      ctx.fillRect(p.x - khw * 0.16, p.y - 87 * s, khw * 0.32, 10 * s);
      this.flag(p.x, p.y - 96 * s, 20 * s, t);
      const towerX = [p.x - hw * 0.6, p.x + hw * 0.6];
      for (let i = 0; i < 2; i++) {
        const tx = towerX[i];
        this.isoBox(tx, p.y + hh * 0.24, hw * 0.19, hh * 0.19, 38 * s, '#b0a388', '#716858', '#8d816b');
        this.merlons(tx, p.y + hh * 0.24 - 38 * s, hw * 0.19, hh * 0.19, '#958972');
        this.pyramidRoof(tx, p.y + hh * 0.24 - 38 * s, hw * 0.22, hh * 0.22, 16 * s, '#6f2f24', '#963f2e', '#823427');
        this.flag(tx, p.y + hh * 0.24 - 54 * s, 14 * s, t + i);
      }
      ctx.fillStyle = '#3d2a1b';
      ctx.beginPath();
      ctx.moveTo(p.x - 10 * s, p.y + hh * 0.55);
      ctx.lineTo(p.x - 10 * s, p.y + hh * 0.22);
      ctx.quadraticCurveTo(p.x, p.y + hh * 0.08, p.x + 10 * s, p.y + hh * 0.22);
      ctx.lineTo(p.x + 10 * s, p.y + hh * 0.55);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'rgba(255,204,120,.55)';
      ctx.fillRect(p.x - 20 * s, p.y - 34 * s, 5 * s, 8 * s);
      ctx.fillRect(p.x + 15 * s, p.y - 34 * s, 5 * s, 8 * s);
    } else if (b.type === 'house') {
      this.isoBox(p.x, p.y, hw * 0.88, hh * 0.88, 7 * s, '#9d9078', '#6c6252', '#827763');
      this.isoBox(p.x, p.y - 4 * s, hw * 0.56, hh * 0.56, 21 * s, '#a68354', '#6b4f31', '#87663e');
      this.pyramidRoof(p.x, p.y - 25 * s, hw * 0.7, hh * 0.7, 24 * s, '#8c6631', '#b98c46', '#a17a3b');
      ctx.fillStyle = '#4b3520';
      ctx.fillRect(p.x - 4 * s, p.y + 2 * s, 8 * s, 10 * s);
      ctx.fillStyle = '#d8b267';
      ctx.fillRect(p.x - 6 * s, p.y - 15 * s, 4 * s, 4 * s);
      ctx.fillStyle = '#6b5842';
      ctx.fillRect(p.x + hw * 0.35, p.y - 35 * s, 5 * s, 15 * s);
      this.flag(p.x + hw * 0.37, p.y - 35 * s, 10 * s, t + 1);
    } else if (b.type === 'farm') {
      ctx.fillStyle = '#6d5331';
      this.diamond(p.x, p.y, hw * 0.95, hh * 0.95);
      ctx.fill();
      ctx.strokeStyle = 'rgba(54,38,20,.55)';
      ctx.lineWidth = Math.max(0.6, s * 1.2);
      for (let i = -2; i <= 2; i++) {
        const off = i * hw * 0.16;
        ctx.beginPath();
        ctx.moveTo(p.x - hw * 0.66 + off, p.y + hh * 0.34);
        ctx.lineTo(p.x + off, p.y - hh * 0.2);
        ctx.stroke();
      }
      for (let i = 0; i < 8; i++) {
        const a = hash2(i, b.tx, 71);
        const bx = p.x - hw * 0.6 + a * hw * 1.2;
        const by = p.y - hh * 0.18 + hash2(i, b.ty, 73) * hh * 0.45;
        ctx.strokeStyle = '#95a855';
        ctx.lineWidth = Math.max(0.7, s);
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(bx - 2 * s, by - 5 * s);
        ctx.moveTo(bx, by);
        ctx.lineTo(bx + 2 * s, by - 4 * s);
        ctx.stroke();
      }
      ctx.strokeStyle = '#5b4229';
      ctx.lineWidth = 1.5 * s;
      ctx.beginPath();
      ctx.moveTo(p.x + hw * 0.45, p.y);
      ctx.lineTo(p.x + hw * 0.45, p.y - 14 * s);
      ctx.moveTo(p.x + hw * 0.32, p.y - 10 * s);
      ctx.lineTo(p.x + hw * 0.58, p.y - 10 * s);
      ctx.stroke();
      ctx.fillStyle = '#c8a95c';
      ctx.beginPath(); ctx.arc(p.x + hw * 0.45, p.y - 15 * s, 3 * s, 0, Math.PI * 2); ctx.fill();
    } else if (b.type === 'barracks') {
      this.isoBox(p.x, p.y, hw * 0.92, hh * 0.92, 8 * s, '#9a8a6f', '#6c6050', '#81735d');
      this.isoBox(p.x, p.y - 5 * s, hw * 0.62, hh * 0.62, 29 * s, '#8f6a40', '#5b4029', '#75552f');
      this.pyramidRoof(p.x, p.y - 34 * s, hw * 0.78, hh * 0.78, 23 * s, '#6e3023', '#9a4834', '#843b2b');
      ctx.fillStyle = '#442b19';
      ctx.fillRect(p.x - 7 * s, p.y + 3 * s, 14 * s, 13 * s);
      ctx.fillStyle = '#5b3a21';
      ctx.fillRect(p.x - hw * 0.55, p.y - 12 * s, 4 * s, 22 * s);
      ctx.fillStyle = '#8d3a29';
      ctx.beginPath();
      ctx.arc(p.x - hw * 0.55, p.y - 14 * s, 6 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#d5b06a';
      ctx.lineWidth = 1.2 * s;
      ctx.beginPath(); ctx.moveTo(p.x - hw * 0.55 - 3 * s, p.y - 14 * s); ctx.lineTo(p.x - hw * 0.55 + 3 * s, p.y - 14 * s); ctx.stroke();
      this.flag(p.x + hw * 0.5, p.y - 34 * s, 16 * s, t + 0.7);
      ctx.fillStyle = '#e0c68a';
      ctx.fillRect(p.x + hw * 0.83, p.y - 8 * s, 3 * s, 15 * s);
      ctx.fillStyle = '#bab4a4';
      ctx.beginPath(); ctx.arc(p.x + hw * 0.845, p.y - 10 * s, 4 * s, 0, Math.PI * 2); ctx.fill();
    } else if (b.type === 'range') {
      ctx.fillStyle = '#76603d';
      this.diamond(p.x, p.y, hw * 0.92, hh * 0.92);
      ctx.fill();
      ctx.fillStyle = '#6b5434';
      this.diamond(p.x, p.y - 2 * s, hw * 0.78, hh * 0.78);
      ctx.fill();
      for (const [ox, oy] of [[-0.6, 0.2], [0.6, 0.2], [-0.35, -0.42], [0.35, -0.42]]) {
        ctx.strokeStyle = '#4f3a24';
        ctx.lineWidth = 2 * s;
        ctx.beginPath();
        ctx.moveTo(p.x + hw * ox, p.y + hh * oy);
        ctx.lineTo(p.x + hw * ox, p.y + hh * oy - 26 * s);
        ctx.stroke();
      }
      ctx.fillStyle = '#9a7f4d';
      ctx.beginPath();
      ctx.moveTo(p.x - hw * 0.7, p.y - 22 * s + hh * 0.2);
      ctx.lineTo(p.x - hw * 0.32, p.y - 30 * s - hh * 0.3);
      ctx.lineTo(p.x + hw * 0.55, p.y - 30 * s + hh * 0.1);
      ctx.lineTo(p.x + hw * 0.72, p.y - 22 * s + hh * 0.42);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(64,44,24,.5)';
      ctx.stroke();
      const target = (tx, ty) => {
        ctx.strokeStyle = '#d9c79b';
        ctx.lineWidth = 1.3 * s;
        for (let r = 3; r <= 7; r += 2) {
          ctx.beginPath(); ctx.arc(p.x + tx, p.y + ty, r * s, 0, Math.PI * 2); ctx.stroke();
        }
        ctx.fillStyle = '#a73a2c';
        ctx.beginPath(); ctx.arc(p.x + tx, p.y + ty, 1.2 * s, 0, Math.PI * 2); ctx.fill();
      };
      target(-hw * 0.28, hh * 0.15);
      target(hw * 0.3, hh * 0.18);
      ctx.strokeStyle = '#d8c59a';
      ctx.lineWidth = 1.1 * s;
      ctx.beginPath();
      ctx.moveTo(p.x + hw * 0.08, p.y + hh * 0.06);
      ctx.lineTo(p.x + hw * 0.38, p.y - hh * 0.18);
      ctx.stroke();
      this.flag(p.x - hw * 0.65, p.y - 25 * s + hh * 0.2, 14 * s, t + 2);
    } else if (b.type === 'tower') {
      this.isoBox(p.x, p.y, hw * 0.62, hh * 0.62, 10 * s, '#a1957c', '#6a6251', '#837866');
      this.isoBox(p.x, p.y - 4 * s, hw * 0.5, hh * 0.5, 58 * s, '#a99d84', '#6d6453', '#897d69');
      this.isoBox(p.x, p.y - 60 * s, hw * 0.64, hh * 0.64, 7 * s, '#8c8069', '#5c5547', '#746b5a');
      this.merlons(p.x, p.y - 67 * s, hw * 0.64, hh * 0.64, '#8f836d');
      ctx.fillStyle = '#2e2519';
      ctx.fillRect(p.x - 2.5 * s, p.y - 52 * s, 5 * s, 10 * s);
      ctx.fillStyle = '#d8a75c';
      ctx.fillRect(p.x - 3 * s, p.y - 35 * s, 6 * s, 8 * s);
      this.pyramidRoof(p.x, p.y - 67 * s, hw * 0.55, hh * 0.55, 14 * s, '#6b2c22', '#943d2d', '#7e3325');
      this.flag(p.x, p.y - 82 * s, 19 * s, t + 0.4);
      ctx.fillStyle = 'rgba(255,178,82,.2)';
      ctx.beginPath(); ctx.arc(p.x, p.y - 30 * s, 14 * s, 0, Math.PI * 2); ctx.fill();
    }

    if (damaged < 0.62 && !ghost) {
      ctx.strokeStyle = 'rgba(38,26,18,.55)';
      ctx.lineWidth = Math.max(0.7, s);
      for (let i = 0; i < 5; i++) {
        const a = hash2(b.tx, b.ty, i + 11);
        const x = p.x - hw * 0.4 + a * hw * 0.8;
        const y = p.y - 12 * s - hash2(b.tx, b.ty, i + 20) * 30 * s;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + 4 * s, y + 6 * s);
        ctx.lineTo(x + 1 * s, y + 11 * s);
        ctx.stroke();
      }
    }
    if (damaged < 0.38 && !ghost) {
      const flick = 0.55 + Math.sin(t * 11 + b.tx) * 0.3;
      for (let i = 0; i < 3; i++) {
        const fx = p.x + (hash2(b.tx, b.ty, i + 33) - 0.5) * hw;
        const fy = p.y - 20 * s - hash2(b.tx, b.ty, i + 40) * 25 * s;
        const gg = ctx.createRadialGradient(fx, fy, 0, fx, fy, 10 * s);
        gg.addColorStop(0, `rgba(255,196,92,${flick * 0.5})`);
        gg.addColorStop(1, 'rgba(255,120,40,0)');
        ctx.fillStyle = gg;
        ctx.beginPath(); ctx.arc(fx, fy, 10 * s, 0, Math.PI * 2); ctx.fill();
      }
    }

    if (b.hitFlash > 0 && !ghost) {
      ctx.fillStyle = `rgba(255,240,210,${b.hitFlash * 0.35})`;
      this.diamond(p.x, p.y - 16 * s, hw * 0.8, hh * 0.8);
      ctx.fill();
    }

    if (!ghost && (damaged < 0.999 || this.game.selected.includes(b))) {
      const y = p.y - (b.type === 'tower' ? 94 : b.type === 'towncenter' ? 112 : 58) * s;
      this.healthBar(p.x, y, 44 * s, b.hp / b.maxHp);
    }
    ctx.restore();
  }
};
