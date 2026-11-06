import { directionalAnimationFrame } from './visuals.js';
import { CIV_UNIT_SPRITE_ATLASES, UNIT_SPRITE_ATLASES, unitSpriteAtlasKey } from './sprite-atlas.js';

// 僅供程序式衝車的畫面點選；幾何直接取自 Renderer.drawRamUnit 的實心填色。
export function ramBodyContains(unit, sx, sy, ground, scale = 1, elapsed = 0, civId) {
  if (unit?.type !== 'ram' || unit.alive !== true) return false;
  if (![sx, sy, ground?.x, ground?.y, scale, elapsed].every(Number.isFinite) || scale <= 0) return false;
  if (civId !== undefined && typeof civId !== 'string') return false;
  const numericFields = ['id', 'walkPhase', 'hitFlash', 'attackAnim', 'facing'];
  if (numericFields.some(field => unit[field] !== undefined && !Number.isFinite(unit[field]))) return false;

  // 未來若有衝車圖集，交回既有圖集點選，不套用程序式車身。
  const atlasKey = unitSpriteAtlasKey(unit, civId);
  if (CIV_UNIT_SPRITE_ATLASES[atlasKey] || UNIT_SPRITE_ATLASES[atlasKey]) return false;

  const moving = ['move', 'return', 'build', 'gather'].includes(unit.state);
  if (!Number.isFinite(moving ? unit.walkPhase : unit.id)) return false;
  const bob = moving ? Math.abs(Math.cos(unit.walkPhase)) * 1.2 : Math.sin(elapsed * 2 + unit.id) * 0.35;
  const frame = directionalAnimationFrame(unit);
  const hit = frame.state === 'hit';

  // 依繪圖順序逆轉朝向壓縮、受擊平移、縮放及車身上下晃動。
  const x = (sx - ground.x) / frame.mirror / scale + (hit ? 2.5 : 0);
  const y = (sy - ground.y) / frame.depthScale / scale + (hit ? 1.5 : 0) + bob * 0.5;
  if (![x, y].every(Number.isFinite)) return false;

  const shell = y >= -32 && y <= -13 && Math.abs(x) <= 17 + (y + 32) * 5 / 19;
  const base = (x / 21) ** 2 + ((y + 13) / 10) ** 2 <= 1;
  const head = (x - 25) ** 2 + (y + 13) ** 2 <= 4.2 ** 2;
  return shell || base || head;
}
