import { clamp, hash2 } from './utils.js';

export const titleMethods = {
  drawTitle(t) {
    const ctx = this.ctx;
    const w = this.w, h = this.h;
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#17121c');
    sky.addColorStop(0.32, '#38242a');
    sky.addColorStop(0.58, '#7c4531');
    sky.addColorStop(0.78, '#c67a41');
    sky.addColorStop(1, '#2a1912');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    const sunX = w * (w < 700 ? 0.74 : 0.73);
    const sunY = h * 0.33;
    const sunR = Math.min(w, h) * 0.075;
    const glow = ctx.createRadialGradient(sunX, sunY, sunR * 0.2, sunX, sunY, sunR * 5.6);
    glow.addColorStop(0, 'rgba(255,220,140,.5)');
    glow.addColorStop(0.25, 'rgba(232,162,86,.24)');
    glow.addColorStop(1, 'rgba(160,80,40,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);
    const sun = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunR);
    sun.addColorStop(0, '#fff1c4');
    sun.addColorStop(0.6, '#f2c67b');
    sun.addColorStop(1, 'rgba(220,150,78,0)');
    ctx.fillStyle = sun;
    ctx.beginPath(); ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2); ctx.fill();

    for (let i = 0; i < 7; i++) {
      const speed = 4 + i * 1.3;
      const cx = ((i * 317 + t * speed) % (w + 500)) - 250;
      const cy = h * (0.12 + (i % 3) * 0.075);
      this.cloud(cx, cy, (0.7 + (i % 4) * 0.3) * (w / 1440), 'rgba(52,32,34,.42)', i);
    }

    this.mountains(w, h, 0.62, '#4b2c29', 0.055, t * 0.6, 0.3);
    this.mountains(w, h, 0.7, '#38211f', 0.07, -t * 0.35, 0.66);
    this.mountains(w, h, 0.78, '#271918', 0.055, t * 0.2, 1.3);
    this.forestBand(w, h, 0.76, '#1c1412', 0.1);

    const castleScale = clamp(Math.min(w, h) / 900, 0.55, 1.45);
    this.castle(w * (w < 760 ? 0.62 : 0.73), h * 0.795, castleScale, t);

    const fog = ctx.createLinearGradient(0, h * 0.55, 0, h);
    fog.addColorStop(0, 'rgba(30,18,16,0)');
    fog.addColorStop(0.62, 'rgba(22,13,11,.42)');
    fog.addColorStop(1, 'rgba(11,7,6,.95)');
    ctx.fillStyle = fog;
    ctx.fillRect(0, h * 0.55, w, h * 0.45);

    this.foreground(w, h, t);

    for (let i = 0; i < 46; i++) {
      const seed = hash2(i, 3, this.titleSeed);
      const speed = 4 + seed * 12;
      const x = (hash2(i, 8, this.titleSeed) * w + Math.sin(t * 0.3 + i) * 24 + t * speed * 0.2) % w;
      const y = h * 0.95 - ((t * speed + seed * h) % (h * 0.9));
      const a = 0.12 + 0.35 * Math.abs(Math.sin(t * 0.5 + i));
      ctx.fillStyle = `rgba(255,196,112,${a})`;
      ctx.beginPath(); ctx.arc(x, y, 0.7 + seed * 1.6, 0, Math.PI * 2); ctx.fill();
    }

    for (let i = 0; i < 5; i++) {
      const bx = ((t * (12 + i * 5) + i * 340) % (w + 300)) - 150;
      const by = h * (0.18 + i * 0.035) + Math.sin(t * 0.6 + i) * 8;
      const flap = Math.sin(t * 3.4 + i * 1.7) * 4;
      ctx.strokeStyle = 'rgba(25,16,15,.7)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(bx - 8, by + flap);
      ctx.quadraticCurveTo(bx - 3, by - 3, bx, by);
      ctx.quadraticCurveTo(bx + 3, by - 3, bx + 8, by + flap);
      ctx.stroke();
    }

    const bottomGlow = ctx.createRadialGradient(w * 0.72, h * 0.79, 0, w * 0.72, h * 0.79, w * 0.3);
    bottomGlow.addColorStop(0, 'rgba(228,142,66,.12)');
    bottomGlow.addColorStop(1, 'rgba(228,142,66,0)');
    ctx.fillStyle = bottomGlow;
    ctx.fillRect(0, 0, w, h);
  },

  cloud(x, y, s, color, seed) {
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(x, y, 130 * s, 17 * s, 0, 0, Math.PI * 2);
    ctx.ellipse(x - 66 * s, y + 4 * s, 62 * s, 12 * s, 0, 0, Math.PI * 2);
    ctx.ellipse(x + 58 * s, y + 6 * s, 76 * s, 14 * s, 0, 0, Math.PI * 2);
    ctx.ellipse(x + 12 * s, y - 11 * s, 48 * s, 15 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  },

  mountains(w, h, base, color, amp, phase, seed) {
    const ctx = this.ctx;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.lineTo(0, h * base);
    const steps = 14;
    for (let i = 0; i <= steps; i++) {
      const x = (i / steps) * w;
      const y = h * base - Math.abs(Math.sin(i * 1.7 + seed + phase * 0.01)) * h * amp - Math.sin(i * 0.9 + seed) * h * amp * 0.35;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();
  },

  forestBand(w, h, base, color, amp) {
    const ctx = this.ctx;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.lineTo(0, h * base);
    const step = 15;
    for (let x = 0; x <= w + step; x += step) {
      const rand = hash2(x, 2, this.titleSeed);
      const y = h * base - rand * h * amp;
      ctx.lineTo(x, y);
      ctx.lineTo(x + step * 0.45, y + h * amp * 0.52);
      ctx.lineTo(x + step, h * base - hash2(x + 1, 2, this.titleSeed) * h * amp * 0.75);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();
  },

  castle(cx, baseY, s, t) {
    const ctx = this.ctx;
    const dark = '#160f0e';
    const mid = '#241615';
    const warm = 'rgba(230,146,74,.28)';

    ctx.save();
    ctx.translate(cx, baseY);
    ctx.scale(s, s);

    const hill = ctx.createLinearGradient(0, -10, 0, 120);
    hill.addColorStop(0, '#211614');
    hill.addColorStop(1, '#0c0807');
    ctx.fillStyle = hill;
    ctx.beginPath();
    ctx.moveTo(-310, 150);
    ctx.quadraticCurveTo(-150, 22, -30, 28);
    ctx.quadraticCurveTo(120, 36, 300, 160);
    ctx.lineTo(310, 210);
    ctx.lineTo(-320, 210);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = mid;
    ctx.fillRect(-210, 40, 420, 44);

    for (let i = -9; i <= 9; i++) {
      const x = i * 22;
      ctx.fillRect(x - 7, 26, 14, 16);
    }

    const tower = (x, w, hgt, roof) => {
      ctx.fillStyle = dark;
      ctx.fillRect(x - w / 2, 40 - hgt, w, hgt);
      for (let i = 0; i < 3; i++) ctx.fillRect(x - w / 2 + 3 + i * (w / 2.8), 34 - hgt, w / 7, 12);
      if (roof) {
        ctx.fillStyle = '#1d1211';
        ctx.beginPath();
        ctx.moveTo(x - w / 2 - 4, 40 - hgt);
        ctx.lineTo(x, 40 - hgt - 34);
        ctx.lineTo(x + w / 2 + 4, 40 - hgt);
        ctx.closePath();
        ctx.fill();
      }
      ctx.fillStyle = 'rgba(255,190,110,.55)';
      ctx.fillRect(x - 2, 40 - hgt + 14, 4, 8);
      ctx.fillStyle = warm;
      ctx.fillRect(x + w / 2 - 2, 40 - hgt, 2, hgt - 2);
    };

    tower(-178, 30, 80, true);
    tower(178, 30, 92, true);
    tower(-64, 24, 46, false);
    tower(64, 24, 46, false);

    ctx.fillStyle = dark;
    ctx.fillRect(-52, -62, 104, 102);
    for (let i = -2; i <= 2; i++) ctx.fillRect(i * 20 - 6, -74, 12, 14);
    ctx.fillStyle = '#100b0a';
    ctx.beginPath();
    ctx.moveTo(-60, -62);
    ctx.lineTo(0, -134);
    ctx.lineTo(60, -62);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgba(255,196,116,.6)';
    ctx.fillRect(-5, -18, 10, 18);
    ctx.fillRect(-25, -44, 6, 10);
    ctx.fillRect(19, -44, 6, 10);
    ctx.fillRect(-94, -6, 7, 12);
    ctx.fillRect(88, -6, 7, 12);

    ctx.strokeStyle = 'rgba(226,148,82,.26)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-210, 40);
    ctx.lineTo(-210, 84);
    ctx.moveTo(210, 40);
    ctx.lineTo(210, 84);
    ctx.stroke();

    const flag = (x, y, size, phase) => {
      ctx.strokeStyle = '#0d0908';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y - size);
      ctx.stroke();
      ctx.fillStyle = '#7d2b22';
      ctx.beginPath();
      ctx.moveTo(x, y - size);
      ctx.quadraticCurveTo(x + size * 0.7, y - size + Math.sin(t * 2 + phase) * 3, x + size * 0.95, y - size * 0.55);
      ctx.lineTo(x + size * 0.7, y - size * 0.38);
      ctx.quadraticCurveTo(x + size * 0.3, y - size * 0.45, x, y - size * 0.4);
      ctx.closePath();
      ctx.fill();
    };
    flag(-178, -40, 30, 0);
    flag(178, -52, 36, 1.7);
    flag(0, -134, 40, 3);

    ctx.fillStyle = '#0b0706';
    ctx.beginPath();
    ctx.moveTo(-40, 84);
    ctx.quadraticCurveTo(-40, 48, 0, 48);
    ctx.quadraticCurveTo(40, 48, 40, 84);
    ctx.closePath();
    ctx.fill();
    const gateGlow = ctx.createRadialGradient(0, 64, 0, 0, 64, 44);
    gateGlow.addColorStop(0, 'rgba(255,193,105,.42)');
    gateGlow.addColorStop(1, 'rgba(255,160,70,0)');
    ctx.fillStyle = gateGlow;
    ctx.beginPath(); ctx.arc(0, 64, 44, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = 'rgba(255,190,110,.5)';
    ctx.fillRect(-4, 56, 8, 28);

    ctx.fillStyle = '#171010';
    for (let i = 0; i < 14; i++) {
      const x = -280 + i * 43 + (i % 2) * 12;
      const hh = 26 + hash2(i, 5, this.titleSeed) * 40;
      ctx.beginPath();
      ctx.moveTo(x, 160);
      ctx.lineTo(x + 11, 160 - hh);
      ctx.lineTo(x + 22, 160);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  },

  foreground(w, h, t) {
    const ctx = this.ctx;
    ctx.fillStyle = '#0a0706';
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.lineTo(0, h * 0.88);
    for (let x = 0; x <= w + 40; x += 40) {
      const hh = 20 + hash2(x, 11, this.titleSeed) * 70;
      ctx.lineTo(x + 20, h * 0.88 - hh);
      ctx.lineTo(x + 40, h * 0.88 + 6);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgba(10,7,6,.82)';
    ctx.fillRect(0, h * 0.93, w, h * 0.07);
    ctx.fillStyle = 'rgba(255,180,96,.06)';
    for (let i = 0; i < 4; i++) {
      const x = w * (0.2 + i * 0.2) + Math.sin(t * 0.4 + i) * 20;
      ctx.beginPath(); ctx.arc(x, h * 0.95, 40 + i * 16, 0, Math.PI * 2); ctx.fill();
    }
  }
};
