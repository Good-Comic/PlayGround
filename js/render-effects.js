import { TILE_W, TILE_H } from './constants.js';
import { clamp, lerp, rgba } from './utils.js';

export const effectMethods = {
  drawProjectile(p) {
    const ctx = this.ctx;
    const t = clamp(p.t, 0, 1);
    const tx = p.target && !p.target.dead ? p.target.x : (p.targetX ?? p.x);
    const ty = p.target && !p.target.dead ? p.target.y : (p.targetY ?? p.y);
    const tz = p.target && !p.target.dead ? (p.target.building ? 24 : 12) : (p.targetZ ?? 12);
    const x = lerp(p.sourceX, tx, t);
    const y = lerp(p.sourceY, ty, t);
    const z = lerp(p.startZ, tz, t) + Math.sin(Math.PI * t) * p.arc;
    const a = this.worldToScreen(x, y);
    const prevX = lerp(p.sourceX, tx, Math.max(0, t - 0.14));
    const prevY = lerp(p.sourceY, ty, Math.max(0, t - 0.14));
    const prevZ = lerp(p.startZ, tz, Math.max(0, t - 0.14)) + Math.sin(Math.PI * Math.max(0, t - 0.14)) * p.arc;
    const b = this.worldToScreen(prevX, prevY);
    const y1 = a.y - z * this.scale;
    const y2 = b.y - prevZ * this.scale;
    const ang = Math.atan2(y1 - y2, a.x - b.x);
    const len = 10 * this.scale;
    ctx.save();
    ctx.translate(a.x, y1);
    ctx.rotate(ang);
    ctx.strokeStyle = 'rgba(50,34,18,.5)';
    ctx.lineWidth = Math.max(1.2, 2.2 * this.scale);
    ctx.beginPath(); ctx.moveTo(-len, 0); ctx.lineTo(len * 0.45, 0); ctx.stroke();
    ctx.strokeStyle = '#e7d8a9';
    ctx.lineWidth = Math.max(0.8, 1.3 * this.scale);
    ctx.beginPath(); ctx.moveTo(-len, 0); ctx.lineTo(len * 0.45, 0); ctx.stroke();
    ctx.fillStyle = '#d4c393';
    ctx.beginPath();
    ctx.moveTo(len * 0.5, 0);
    ctx.lineTo(len * 0.2, -2 * this.scale);
    ctx.lineTo(len * 0.2, 2 * this.scale);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  },

  drawParticle(p) {
    const ctx = this.ctx;
    const a = clamp(p.life / p.max, 0, 1);
    const s = this.scale;
    const pos = this.worldToScreen(p.x, p.y);
    const y = pos.y - p.z * s;
    if (p.kind === 'smoke') {
      ctx.fillStyle = rgba(p.color, a * 0.16);
      ctx.beginPath(); ctx.arc(pos.x, y, p.size * s, 0, Math.PI * 2); ctx.fill();
      return;
    }
    if (p.kind === 'leaf') {
      ctx.save();
      ctx.translate(pos.x, y);
      ctx.rotate(p.life * 2 + p.z * 0.05);
      ctx.fillStyle = rgba(p.color, a * 0.5);
      ctx.beginPath(); ctx.ellipse(0, 0, p.size * s * 1.3, p.size * s * 0.55, 0.4, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      return;
    }
    if (p.kind === 'spark') {
      const dx = p.vx * 7 * s;
      const dy = (p.vy - p.vz * 0.06) * 5 * s;
      ctx.strokeStyle = rgba(p.color, a * 0.9);
      ctx.lineWidth = Math.max(0.7, p.size * s * 0.7);
      ctx.beginPath();
      ctx.moveTo(pos.x, y);
      ctx.lineTo(pos.x - dx, y - dy);
      ctx.stroke();
      return;
    }
    ctx.fillStyle = rgba(p.color, a * 0.45);
    ctx.beginPath(); ctx.arc(pos.x, y, p.size * s, 0, Math.PI * 2); ctx.fill();
  },

  drawFloatText(f) {
    const ctx = this.ctx;
    const p = this.worldToScreen(f.x, f.y);
    const a = clamp(f.life / f.max, 0, 1);
    ctx.save();
    ctx.font = `700 ${Math.max(9, 11 * this.scale)}px "Palatino Linotype", Georgia, serif`;
    ctx.textAlign = 'center';
    ctx.fillStyle = rgba('#f7e6b7', a * 0.9);
    ctx.shadowColor = 'rgba(0,0,0,.8)';
    ctx.shadowBlur = 3;
    ctx.fillText(f.text, p.x, p.y - f.z * this.scale);
    ctx.restore();
  },

  drawPlacement() {
    const ctx = this.ctx;
    const g = this.game;
    const pl = g.placing;
    const def = pl.def;
    const size = def.size;
    const s = this.scale;
    for (let j = 0; j < size; j++) {
      for (let i = 0; i < size; i++) {
        const tx = pl.tx + i, ty = pl.ty + j;
        const center = this.worldToScreen(tx + 0.5, ty + 0.5);
        const hw = TILE_W / 2 * s;
        const hh = TILE_H / 2 * s;
        ctx.fillStyle = pl.valid ? 'rgba(113,178,84,.22)' : 'rgba(190,58,42,.24)';
        ctx.beginPath();
        ctx.moveTo(center.x, center.y - hh);
        ctx.lineTo(center.x + hw, center.y);
        ctx.lineTo(center.x, center.y + hh);
        ctx.lineTo(center.x - hw, center.y);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = pl.valid ? 'rgba(159,220,117,.7)' : 'rgba(238,104,76,.75)';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
    }
    const fake = {
      type: pl.type, def, tx: pl.tx, ty: pl.ty,
      x: pl.tx + size / 2, y: pl.ty + size / 2,
      hp: 1, maxHp: 1, hitFlash: 0, building: true
    };
    ctx.save();
    this.drawBuilding(fake, true);
    ctx.restore();
    const label = this.worldToScreen(pl.tx + size / 2, pl.ty + size / 2);
    ctx.save();
    ctx.font = `600 ${Math.max(9, 11 * s)}px "Palatino Linotype", Georgia, serif`;
    ctx.textAlign = 'center';
    ctx.fillStyle = pl.valid ? 'rgba(205,235,168,.95)' : 'rgba(244,160,134,.95)';
    ctx.shadowColor = 'rgba(0,0,0,.85)';
    ctx.shadowBlur = 4;
    ctx.fillText(def.name, label.x, label.y + 26 * s);
    ctx.restore();
  }
};
