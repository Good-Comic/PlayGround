export const unitMethods = {
  drawUnit(u) {
    const ctx = this.ctx;
    const s = this.scale * (u.size || 1);
    const p = this.worldToScreen(u.x, u.y);
    const bob = u.kind === 'ram' ? 0 : Math.abs(Math.sin(u.phase)) * 1.6 * s;
    const selected = this.game.selected.includes(u);
    const t = this.game.time || 0;

    if (selected && u.team === 'player') {
      ctx.strokeStyle = 'rgba(244,210,128,.9)';
      ctx.lineWidth = 1.6;
      ctx.shadowColor = 'rgba(244,210,128,.5)';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y + 1, 13 * s, 6 * s, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    ctx.fillStyle = 'rgba(0,0,0,.28)';
    ctx.beginPath();
    ctx.ellipse(p.x, p.y + 1.5 * s, (u.kind === 'ram' ? 18 : 8) * s, (u.kind === 'ram' ? 6 : 3.6) * s, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(p.x, p.y - bob);
    ctx.scale(u.facing * s, s);

    if (u.kind === 'villager') this.drawVillager(u, t);
    else if (u.kind === 'militia') this.drawMilitia(u, t);
    else if (u.kind === 'archer') this.drawArcher(u, t);
    else if (u.kind === 'raider') this.drawRaider(u, t);
    else if (u.kind === 'skirmisher') this.drawSkirmisher(u, t);
    else if (u.kind === 'brute') this.drawBrute(u, t);
    else if (u.kind === 'ram') this.drawRam(u, t);

    if (u.hitFlash > 0) {
      ctx.fillStyle = `rgba(255,236,205,${u.hitFlash * 0.55})`;
      ctx.beginPath(); ctx.ellipse(0, -16, 10, 16, 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();

    if (u.team === 'enemy' || selected || u.hp < u.maxHp) {
      const barY = p.y - (u.kind === 'ram' ? 34 : u.kind === 'brute' ? 42 : 34) * s;
      this.healthBar(p.x, barY, (u.kind === 'ram' ? 30 : 22) * s, u.hp / u.maxHp, u.team === 'enemy');
    }
  },

  drawVillager(u, t) {
    const ctx = this.ctx;
    const swing = Math.sin(u.phase) * 2.5;
    ctx.strokeStyle = '#3d2c1d';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-3, 0); ctx.lineTo(-3 + swing, -8);
    ctx.moveTo(3, 0); ctx.lineTo(3 - swing, -8);
    ctx.stroke();
    ctx.fillStyle = '#4c6c8a';
    ctx.beginPath();
    ctx.moveTo(-6, -7);
    ctx.lineTo(-5, -19);
    ctx.quadraticCurveTo(0, -22, 5, -19);
    ctx.lineTo(6, -7);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#314d66';
    ctx.fillRect(-6, -10, 12, 3);
    ctx.fillStyle = '#d8a778';
    ctx.beginPath(); ctx.arc(0, -24, 4.4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#6b4a2b';
    ctx.beginPath(); ctx.arc(-0.5, -25.4, 4.2, Math.PI, Math.PI * 1.88); ctx.fill();
    ctx.fillStyle = '#c9a15c';
    ctx.beginPath();
    ctx.moveTo(-8, -27);
    ctx.lineTo(0, -32);
    ctx.lineTo(8, -27);
    ctx.lineTo(4, -26);
    ctx.lineTo(-4, -26);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#d8a778';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-5, -16); ctx.lineTo(-8, -10 + swing * 0.4);
    ctx.moveTo(5, -16); ctx.lineTo(8, -11 - swing * 0.4);
    ctx.stroke();
    ctx.strokeStyle = '#4d3620';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(8, -11); ctx.lineTo(11, -24);
    ctx.stroke();
    ctx.fillStyle = '#8b8a82';
    ctx.beginPath();
    ctx.moveTo(9, -24);
    ctx.lineTo(14, -26);
    ctx.lineTo(13, -21);
    ctx.closePath();
    ctx.fill();
    if (u.carry > 0.5) {
      ctx.fillStyle = '#a98a54';
      ctx.beginPath(); ctx.ellipse(-7, -9, 4, 5, 0, 0, Math.PI * 2); ctx.fill();
    }
    if (u.gatherState === 'gather') {
      ctx.strokeStyle = 'rgba(240,220,160,.55)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(11, -22, 3 + Math.sin(t * 8) * 1, 0, Math.PI * 2);
      ctx.stroke();
    }
  },

  drawMilitia(u, t) {
    const ctx = this.ctx;
    const swing = u.attackAnim * 0.9;
    ctx.strokeStyle = '#37342f';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-3, 0); ctx.lineTo(-3, -8);
    ctx.moveTo(3, 0); ctx.lineTo(3, -8);
    ctx.stroke();
    ctx.fillStyle = '#707983';
    ctx.beginPath();
    ctx.moveTo(-6, -8); ctx.lineTo(-5, -20); ctx.quadraticCurveTo(0, -23, 5, -20); ctx.lineTo(6, -8); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#355f86';
    ctx.beginPath();
    ctx.moveTo(-3, -20); ctx.lineTo(3, -20); ctx.lineTo(5, -9); ctx.lineTo(-5, -9); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#b9c0c5';
    ctx.beginPath(); ctx.arc(0, -25, 4.6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#858d95';
    ctx.beginPath(); ctx.arc(0, -26, 4.9, Math.PI, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#a73227';
    ctx.beginPath();
    ctx.moveTo(0, -30);
    ctx.quadraticCurveTo(4, -35, 8, -32);
    ctx.quadraticCurveTo(3, -31, 1, -29);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#5b6e8b';
    ctx.beginPath(); ctx.ellipse(-8, -14, 4.4, 6.5, 0.1, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#d9c68c';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-8, -19); ctx.lineTo(-8, -9); ctx.moveTo(-11, -14); ctx.lineTo(-5, -14); ctx.stroke();
    ctx.save();
    ctx.translate(7, -15);
    ctx.rotate(-0.5 + swing);
    ctx.fillStyle = '#c7c9c4';
    ctx.fillRect(0, -2, 13, 2.6);
    ctx.fillStyle = '#8b6a3c';
    ctx.fillRect(-1, -2, 4, 2.6);
    ctx.restore();
  },

  drawArcher(u, t) {
    const ctx = this.ctx;
    ctx.strokeStyle = '#3d3525';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-3, 0); ctx.lineTo(-3, -8);
    ctx.moveTo(3, 0); ctx.lineTo(3, -8);
    ctx.stroke();
    ctx.fillStyle = '#55704a';
    ctx.beginPath();
    ctx.moveTo(-6, -8); ctx.lineTo(-4, -20); ctx.quadraticCurveTo(0, -22, 4, -20); ctx.lineTo(6, -8); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#7d5e38';
    ctx.fillRect(-6, -11, 12, 2.6);
    ctx.fillStyle = '#c18e64';
    ctx.beginPath(); ctx.arc(0, -24, 4.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#3f5137';
    ctx.beginPath();
    ctx.arc(0, -25, 5.2, Math.PI, Math.PI * 2);
    ctx.lineTo(5, -21);
    ctx.lineTo(-4, -22);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#d8a778';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(5, -17); ctx.lineTo(8, -13); ctx.stroke();
    ctx.strokeStyle = '#8a5b2f';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(9, -17, 8, -1.2, 1.2);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(236,226,190,.8)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(9 - Math.cos(1.2) * 8, -17 + Math.sin(-1.2) * 8);
    ctx.lineTo(9 - Math.cos(1.2) * 8, -17 + Math.sin(1.2) * 8);
    ctx.stroke();
    const qx = u.attackAnim * 3;
    ctx.strokeStyle = '#c6b98d';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(8, -14);
    ctx.lineTo(17 + qx, -15);
    ctx.stroke();
    ctx.fillStyle = '#7a4b27';
    ctx.fillRect(-8, -18, 3.6, 9);
  },

  drawRaider(u, t) {
    const ctx = this.ctx;
    ctx.strokeStyle = '#35271c';
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(-3, 0); ctx.lineTo(-3, -8);
    ctx.moveTo(3, 0); ctx.lineTo(3, -8);
    ctx.stroke();
    ctx.fillStyle = '#6e2b23';
    ctx.beginPath();
    ctx.moveTo(-6, -7); ctx.lineTo(-5, -19); ctx.quadraticCurveTo(0, -22, 5, -19); ctx.lineTo(6, -7); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#4b3a29';
    ctx.fillRect(-6, -11, 12, 3);
    ctx.fillStyle = '#c18e64';
    ctx.beginPath(); ctx.arc(0, -24, 4.3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#59564f';
    ctx.beginPath(); ctx.arc(0, -25, 5, Math.PI, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#d8cbb2';
    ctx.beginPath();
    ctx.moveTo(-5, -27); ctx.lineTo(-9, -32); ctx.lineTo(-3, -29);
    ctx.moveTo(5, -27); ctx.lineTo(9, -32); ctx.lineTo(3, -29);
    ctx.fill();
    ctx.strokeStyle = '#c18e64';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(5, -16); ctx.lineTo(9, -12); ctx.stroke();
    ctx.save();
    ctx.translate(8, -14);
    ctx.rotate(-0.3 + u.attackAnim * 1.1);
    ctx.strokeStyle = '#5f4322';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(9, -11); ctx.stroke();
    ctx.fillStyle = '#a9a49a';
    ctx.beginPath();
    ctx.moveTo(8, -12); ctx.lineTo(13, -14); ctx.lineTo(12, -8);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  },

  drawSkirmisher(u, t) {
    const ctx = this.ctx;
    ctx.strokeStyle = '#2f2a22';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(-3, 0); ctx.lineTo(-3, -7);
    ctx.moveTo(3, 0); ctx.lineTo(3, -7);
    ctx.stroke();
    ctx.fillStyle = '#493a58';
    ctx.beginPath();
    ctx.moveTo(-6, -7); ctx.lineTo(-4, -19); ctx.quadraticCurveTo(0, -21, 4, -19); ctx.lineTo(6, -7); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#b28158';
    ctx.beginPath(); ctx.arc(0, -23, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#3e3348';
    ctx.beginPath(); ctx.arc(0, -24, 5, Math.PI, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#b28158';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(5, -16); ctx.lineTo(8, -12); ctx.stroke();
    ctx.strokeStyle = '#8d6c3f';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(7, -12); ctx.lineTo(17, -25); ctx.stroke();
    ctx.fillStyle = '#b7b2a5';
    ctx.beginPath();
    ctx.moveTo(17, -26); ctx.lineTo(19, -23); ctx.lineTo(15, -23);
    ctx.closePath(); ctx.fill();
  },

  drawBrute(u, t) {
    const ctx = this.ctx;
    ctx.strokeStyle = '#3a2a1d';
    ctx.lineWidth = 3.4;
    ctx.beginPath();
    ctx.moveTo(-4, 0); ctx.lineTo(-4, -10);
    ctx.moveTo(4, 0); ctx.lineTo(4, -10);
    ctx.stroke();
    ctx.fillStyle = '#7d4a32';
    ctx.beginPath();
    ctx.moveTo(-8, -9); ctx.lineTo(-7, -26); ctx.quadraticCurveTo(0, -30, 7, -26); ctx.lineTo(8, -9); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#5e3725';
    ctx.beginPath();
    ctx.moveTo(-8, -24); ctx.lineTo(-4, -23); ctx.lineTo(-4, -9); ctx.lineTo(-8, -9); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#b98860';
    ctx.beginPath(); ctx.arc(0, -33, 5.6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#4d4b43';
    ctx.beginPath(); ctx.arc(0, -34, 6.3, Math.PI, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#d4c6ab';
    ctx.beginPath();
    ctx.moveTo(-5, -37); ctx.lineTo(-10, -43); ctx.lineTo(-3, -39);
    ctx.moveTo(5, -37); ctx.lineTo(10, -43); ctx.lineTo(3, -39);
    ctx.fill();
    ctx.save();
    ctx.translate(9, -20);
    ctx.rotate(-0.45 + u.attackAnim * 1.1);
    ctx.strokeStyle = '#5a4025';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(7, -13); ctx.stroke();
    ctx.fillStyle = '#7a6f5a';
    ctx.beginPath(); ctx.ellipse(8, -15, 5, 6, -0.3, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  },

  drawRam(u, t) {
    const ctx = this.ctx;
    const roll = Math.sin(u.phase) * 1.5;
    ctx.fillStyle = '#5b4228';
    ctx.fillRect(-16, -14, 30, 10);
    ctx.fillStyle = '#745633';
    ctx.fillRect(-16, -14, 30, 3);
    ctx.fillStyle = '#3b2c1c';
    ctx.fillRect(-4, -18, 14, 5);
    ctx.strokeStyle = '#4d3820';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-10, -14); ctx.lineTo(-10, -4);
    ctx.moveTo(10, -14); ctx.lineTo(10, -4);
    ctx.stroke();
    ctx.fillStyle = '#3a2b1b';
    ctx.beginPath(); ctx.arc(-10, -3, 4.5, 0, Math.PI * 2); ctx.arc(10, -3, 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#7a5c38';
    ctx.beginPath(); ctx.arc(-10, -3, 2, 0, Math.PI * 2); ctx.arc(10, -3, 2, 0, Math.PI * 2); ctx.fill();
    ctx.save();
    ctx.translate(-16, -12);
    ctx.rotate(-0.05 + roll * 0.01);
    ctx.fillStyle = '#6b4a27';
    ctx.fillRect(-18, -3, 22, 6);
    ctx.fillStyle = '#8e8b82';
    ctx.beginPath();
    ctx.moveTo(-18, -4); ctx.lineTo(-22, 0); ctx.lineTo(-18, 4);
    ctx.closePath(); ctx.fill();
    ctx.restore();
    ctx.strokeStyle = '#6a5536';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(-8, -18); ctx.lineTo(-8, -28); ctx.stroke();
    ctx.fillStyle = '#8e3327';
    ctx.beginPath();
    ctx.moveTo(-8, -28); ctx.lineTo(1, -25); ctx.lineTo(-8, -22);
    ctx.closePath(); ctx.fill();
  }
};
