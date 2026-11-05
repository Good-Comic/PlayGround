import { battleArmy, battleCanAct } from './battle-actions.js';
import { defenseClickPoint } from './core-defense.js';
import { iso } from './utils.js';

// 只取目前選兵的正式戰士交集。 / Only the current selection's native army members.
export function selectedAttackers(g) {
  const army = new Set(battleArmy(g));
  return [...new Set(g.selection)].filter(u => army.has(u));
}

function visibleCurrentEnemy(g, target) {
  return !!target?.alive && target.team === 'enemy'
    && (g.units.includes(target) || g.buildings.includes(target)) && g.isVisible(target);
}

export function selectedVisibleTargetContext(g, target, { blocked = false, canPoint = () => true } = {}) {
  const available = battleCanAct(g, blocked), count = selectedAttackers(g).length;
  if (!available) return { ok: false, reason: 'unavailable', count };
  // 先核對即時視野，再讀目標座標。 / Check current vision before reading target coordinates.
  if (!visibleCurrentEnemy(g, target)) return { ok: false, reason: 'unseen', count };
  if (g.heroControl || !count || count !== new Set(g.selection).size) return { ok: false, reason: 'select', count };
  const point = defenseClickPoint(g, target, canPoint);
  if (!point) return { ok: false, reason: 'noPoint', count };
  return { ok: true, target, point, count };
}

export function attackSelectedVisibleTarget(g, target, options) {
  const context = selectedVisibleTargetContext(g, target, options);
  if (!context.ok) return context;
  const { point, count } = context;
  if (g.pickAt(point.x, point.y) !== target) return { ok: false, reason: 'noPoint', count };
  g.orderMode = null;
  g.issueCommand(point.x, point.y);
  const selected = selectedAttackers(g);
  const ok = selected.length === count && new Set(g.selection).size === count
    && selected.every(u => u.manualAttack && u.target === target);
  return ok ? { ok: true, count, targetId: target.id, type: target.type } : { ok: false, reason: 'unavailable', count };
}

export function focusVisibleTarget(g, target, {
  blocked = false, canPoint = () => true,
  viewport = { w: window.innerWidth, h: window.innerHeight },
} = {}) {
  if (!battleCanAct(g, blocked) || g.heroControl) return { ok: false, reason: 'unavailable' };
  if (!visibleCurrentEnemy(g, target)) return { ok: false, reason: 'unseen' };
  const { w, h } = viewport;
  // 原生相機會緩動至 targetZoom。 / Native camera easing settles at targetZoom.
  const zoom = g.camera.targetZoom;
  if (![w, h, zoom].every(n => Number.isFinite(n) && n > 0)) return { ok: false, reason: 'noPoint' };
  const x = target.x + (target.w || 0) / 2, y = target.y + (target.h || 0) / 2, projected = iso(x, y);
  if (![projected.x, projected.y].every(Number.isFinite)) return { ok: false, reason: 'noPoint' };
  const candidates = [[.5,.5],[.5,.3],[.75,.3],[.25,.3],[.75,.5],[.25,.5],[.5,.7],[.75,.7],[.25,.7],[.5,.18],[.82,.18],[.18,.18]];
  for (const [rx, ry] of candidates) {
    const spot = { x: w * rx, y: h * ry };
    if (!canPoint(spot)) continue;
    const targetX = projected.x + (w / 2 - spot.x) / zoom, targetY = projected.y + (h / 2 - spot.y) / zoom;
    // 原生 updateCamera 的邊界仍須容納此落點。 / Keep the spot within native camera bounds.
    if (targetX < -g.world.size * 12 || targetX > g.world.size * 12 || targetY < -200 || targetY > g.world.size * 34) continue;
    g.focusAt(x, y);
    g.camera.targetX = targetX;
    g.camera.targetY = targetY;
    return { ok: true, targetId: target.id, spot };
  }
  return { ok: false, reason: 'noPoint' };
}
