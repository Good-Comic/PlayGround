const MAX_SUBDIVISIONS = 3;
const ROUNDING_ALLOWANCE = 16 * Number.EPSILON;
const MIN_ROUNDING_ALLOWANCE = 16 * Number.MIN_VALUE;

// 浮點誤差只會縮小可證明的覆蓋範圍，不擴大刪除條件。
function roundingAllowance(scale) {
  return Math.max(MIN_ROUNDING_ALLOWANCE, scale * ROUNDING_ALLOWANCE);
}

function boxCovered(minX, minY, maxX, maxY, sourceRadius, donors, depth, allowance) {
  const nearX = Math.max(0, minX, -maxX);
  const nearY = Math.max(0, minY, -maxY);
  if (Math.hypot(nearX, nearY) > sourceRadius + allowance) return true;

  for (const donor of donors) {
    const farX = Math.max(Math.abs(minX - donor.x), Math.abs(maxX - donor.x));
    const farY = Math.max(Math.abs(minY - donor.y), Math.abs(maxY - donor.y));
    // 圓是凸集合；涵蓋最遠角點便涵蓋整個矩形。
    if (Math.hypot(farX, farY) <= donor.radius) return true;
  }
  if (depth === 0) return false;

  // 先除以二，避免同號大座標相加溢位。
  const midX = minX / 2 + maxX / 2;
  const midY = minY / 2 + maxY / 2;
  return boxCovered(minX, minY, midX, midY, sourceRadius, donors, depth - 1, allowance)
    && boxCovered(midX, minY, maxX, midY, sourceRadius, donors, depth - 1, allowance)
    && boxCovered(minX, midY, midX, maxY, sourceRadius, donors, depth - 1, allowance)
    && boxCovered(midX, midY, maxX, maxY, sourceRadius, donors, depth - 1, allowance);
}

/**
 * 省略已被其他保留圓覆蓋的視野繪製，維持輸入順序與原物件引用。
 * x、y 必須是同軸圓的實際投影中心；inset 是同一座標尺度的正 AA 餘裕。
 * 不修改半徑或輸入；資料無效時原樣交回，保留呼叫端既有的壞資料處理。
 */
export function pruneVisionCircles(circles, inset) {
  if (!Number.isFinite(inset) || inset <= 0) return circles;
  for (const circle of circles) {
    if (!circle || !Number.isFinite(circle.x) || !Number.isFinite(circle.y)
      || !Number.isFinite(circle.radius) || circle.radius <= 0) return circles;
  }
  if (circles.length < 2) return circles;

  const active = new Set(circles);
  const ordered = [...active].sort((a, b) => a.radius - b.radius);
  for (const source of ordered) {
    const expanded = source.radius + inset;
    if (!Number.isFinite(expanded)) continue;
    const allowance = roundingAllowance(expanded);
    const sourceRadius = expanded + allowance;
    if (!Number.isFinite(sourceRadius)) continue;

    const donors = [];
    let contained = false;
    // 大圓優先證明覆蓋；已移除的來源不能再供其他候選依賴。
    for (let i = ordered.length - 1; i >= 0; i--) {
      const other = ordered[i];
      if (other === source || !active.has(other) || other.radius <= inset) continue;
      // 以候選中心為原點，避免包圍方框在大絕對座標下失去小尺度差異。
      const x = other.x - source.x;
      const y = other.y - source.y;
      const distance = Math.hypot(x, y);
      if (!Number.isFinite(distance) || distance >= other.radius + expanded) continue;

      const error = roundingAllowance(Math.max(Math.abs(x), Math.abs(y), other.radius, expanded));
      const radius = other.radius - inset - error;
      if (radius <= 0) continue;
      if (other.radius > expanded && distance + source.radius + error <= radius) {
        contained = true;
        break;
      }
      donors.push({ x, y, radius });
    }

    // 只有整個擴張圓域都能證明覆蓋才移除；深度用完仍不明便保留。
    if (contained || (donors.length > 0 && boxCovered(
      -sourceRadius, -sourceRadius, sourceRadius, sourceRadius,
      sourceRadius, donors, MAX_SUBDIVISIONS, allowance,
    ))) active.delete(source);
  }
  return circles.filter(circle => active.has(circle));
}
