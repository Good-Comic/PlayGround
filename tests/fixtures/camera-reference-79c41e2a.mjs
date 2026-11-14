// 凍結安全基底7bd49fcd；只供回歸對照。
import {clamp,iso,lerp} from '../../js/utils.js';
export function updateCamera(dt) {
    const speed = 720 / this.camera.zoom;
    let dx = 0, dy = 0;
    if (!this.heroControl) {
      if (this.keys.has('a') || this.keys.has('arrowleft')) dx -= 1;
      if (this.keys.has('d') || this.keys.has('arrowright')) dx += 1;
      if (this.keys.has('w') || this.keys.has('arrowup')) dy -= 1;
      if (this.keys.has('s') || this.keys.has('arrowdown')) dy += 1;
    }
    if (dx || dy) {
      const len = Math.hypot(dx, dy) || 1;
      this.camera.targetX += dx / len * speed * dt;
      this.camera.targetY += dy / len * speed * dt;
    }
    if (this.heroControl && this.hero?.alive) {
      const hp = iso(this.hero.x, this.hero.y);
      this.camera.targetX = hp.x;
      this.camera.targetY = hp.y;
    }
    this.camera.targetX = clamp(this.camera.targetX, -this.world.size * 12, this.world.size * 12);
    this.camera.targetY = clamp(this.camera.targetY, -200, this.world.size * 34);
    const k = 1 - Math.pow(0.001, dt);
    this.camera.x = lerp(this.camera.x, this.camera.targetX, k);
    this.camera.y = lerp(this.camera.y, this.camera.targetY, k);
    this.camera.zoom = lerp(this.camera.zoom, this.camera.targetZoom, 1 - Math.pow(0.002, dt));
  }
