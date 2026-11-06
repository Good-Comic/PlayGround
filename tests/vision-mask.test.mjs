import test from 'node:test';
import assert from 'node:assert/strict';
import { pruneVisionCircles } from '../js/vision-mask.js';

const circle = (x, y, radius, label) => ({ x, y, radius, label });
const containsPoint = (circles, x, y) => circles.some(c => Math.hypot(x - c.x, y - c.y) <= c.radius);

// 獨立核對幾何聯集：規則格點與各原圓的中心、內環和圓周取樣。
function assertSampledUnionEqual(before, after) {
  const minX = Math.min(...before.map(c => c.x - c.radius));
  const maxX = Math.max(...before.map(c => c.x + c.radius));
  const minY = Math.min(...before.map(c => c.y - c.radius));
  const maxY = Math.max(...before.map(c => c.y + c.radius));
  const compare = (x, y) => assert.equal(containsPoint(after, x, y), containsPoint(before, x, y),
    `取樣點 (${x}, ${y}) 的聯集覆蓋必須一致`);
  for (let row = 0; row <= 80; row++) {
    for (let col = 0; col <= 80; col++) {
      compare(minX + (maxX - minX) * col / 80, minY + (maxY - minY) * row / 80);
    }
  }
  for (const c of before) {
    compare(c.x, c.y);
    for (const radialScale of [0.5, 1]) {
      for (let i = 0; i < 128; i++) {
        const angle = i * Math.PI / 64;
        compare(c.x + Math.cos(angle) * c.radius * radialScale,
          c.y + Math.sin(angle) * c.radius * radialScale);
      }
    }
  }
}

test('空陣列與單圓原樣保留', () => {
  const empty = [];
  const single = [circle(0, 0, 1, '唯一來源')];
  assert.strictEqual(pruneVisionCircles(empty, 0.1), empty);
  assert.strictEqual(pruneVisionCircles(single, 0.1), single);
});

test('完整單圓包含只省略被覆蓋的來源', () => {
  const inner = circle(1, -1, 2, '內圓');
  const outer = circle(0, 0, 6, '外圓');
  const result = pruneVisionCircles([inner, outer], 0.1);
  assert.deepEqual(result, [outer]);
  assert.strictEqual(result[0], outer);
});

test('相交但仍有外露圓弧的來源不能省略', () => {
  const circles = [circle(0, 0, 2), circle(3, 0, 2)];
  assert.deepEqual(pruneVisionCircles(circles, 0.05), circles);
});

test('多圓共同覆蓋可省略任一單圓都無法包含的來源', () => {
  const source = circle(0, 0, 1, '共同覆蓋來源');
  const left = circle(-0.6, 0, 1.5, '左圓');
  const right = circle(0.6, 0, 1.5, '右圓');
  for (const donor of [left, right]) {
    assert.ok(Math.hypot(source.x - donor.x, source.y - donor.y) + source.radius > donor.radius);
  }
  const circles = [left, source, right];
  const result = pruneVisionCircles(circles, 0.02);
  assert.deepEqual(result, [left, right]);
  assertSampledUnionEqual(circles, result);
});

test('同半徑交疊、重合圓與重複引用都保留 AA 邊界', () => {
  const repeated = circle(0, 0, 1, '重複引用');
  const circles = [repeated, circle(0.4, 0, 1), circle(0, 0, 1), repeated];
  const result = pruneVisionCircles(circles, 0.01);
  assert.deepEqual(result, circles);
  result.forEach((item, index) => assert.strictEqual(item, circles[index]));
});

test('原外環配置允許保守保留，且聯集不變、中心來源不會全刪', () => {
  const first = circle(0, 0, 1, '中心一');
  const second = circle(0, 0, 1, '中心二');
  const ring = Array.from({ length: 8 }, (_, index) => {
    const angle = index * Math.PI / 4;
    return circle(Math.cos(angle) * 1.8, Math.sin(angle) * 1.8, 1.1, `外環${index}`);
  });
  const circles = [first, second, ...ring];
  assertSampledUnionEqual(circles, [first, ...ring]);
  assertSampledUnionEqual(circles, [second, ...ring]);
  assert.equal(containsPoint(ring, 0, 0), false);
  const result = pruneVisionCircles(circles, 0.01);
  // 保留一個或兩個中心都符合保守 API；不要求一定達成裁減。
  assert.ok(result.filter(c => c === first || c === second).length >= 1);
  assert.ok(result.length > 0);
  assert.equal(containsPoint(result, 0, 0), true);
  assertSampledUnionEqual(circles, result);
});

test('加大外環重疊會觸發刪除，仍不能將兩個中心來源一起刪除', () => {
  const first = circle(0, 0, 1, '中心一');
  const second = circle(0, 0, 1, '中心二');
  const ring = Array.from({ length: 8 }, (_, index) => {
    const angle = index * Math.PI / 4;
    return circle(Math.cos(angle) * 1.6, Math.sin(angle) * 1.6, 1.2, `外環${index}`);
  });
  const circles = [first, second, ...ring];
  assertSampledUnionEqual(circles, [first, ...ring]);
  assertSampledUnionEqual(circles, [second, ...ring]);
  assert.equal(containsPoint(ring, 0, 0), false);
  const result = pruneVisionCircles(circles, 0.01);
  assert.equal(result.filter(c => c === first || c === second).length, 1);
  assert.equal(containsPoint(result, 0, 0), true);
  assertSampledUnionEqual(circles, result);
});

test('結果保持原順序、物件引用與任意附加欄位', () => {
  const nested = Object.freeze({ elevation: 3 });
  const isolated = Object.freeze({ ...circle(-20, 5, 3, '左側來源'), nested });
  const outer = Object.freeze(circle(0, 0, 8, '中央來源'));
  const inner = Object.freeze(circle(0, 0, 1, '可省略來源'));
  const other = Object.freeze(circle(25, -4, 2, '右側來源'));
  const circles = Object.freeze([isolated, inner, outer, other]);
  const before = structuredClone(circles);
  const result = pruneVisionCircles(circles, 0.05);
  assert.deepEqual(result, [isolated, outer, other]);
  result.forEach((item, index) => assert.strictEqual(item, [isolated, outer, other][index]));
  assert.strictEqual(result[0].nested, nested);
  assert.deepEqual(circles, before);
});

test('單圓包含必須留足指定的 AA 餘裕', () => {
  const source = circle(0.95, 0, 1);
  const donor = circle(0, 0, 2);
  assert.deepEqual(pruneVisionCircles([source, donor], 0.01), [donor]);
  assert.deepEqual(pruneVisionCircles([source, donor], 0.1), [source, donor]);
});

test('共同覆蓋也必須涵蓋 AA 擴張邊界', () => {
  const source = circle(0, 0, 1);
  const left = circle(-0.6, 0, 1.3);
  const right = circle(0.6, 0, 1.3);
  const circles = [source, left, right];
  assert.deepEqual(pruneVisionCircles(circles, 0.01), [left, right]);
  assert.deepEqual(pruneVisionCircles(circles, 0.2), circles);
});

test('實際投影中心的高低差不能被當成相同圓心', () => {
  const lower = circle(0, 0, 2, '低處投影');
  const higher = circle(0, -1.5, 1, '高處投影');
  assert.deepEqual(pruneVisionCircles([lower, higher], 0.05), [lower, higher]);
});

test('負座標、極大及極小尺度都維持包含判定', () => {
  for (const scale of [1e-200, 1e-8, 1, 1e8, 1e200]) {
    const source = circle(-29 * scale, -12 * scale, 2 * scale);
    const donor = circle(-30 * scale, -12 * scale, 6 * scale);
    assert.deepEqual(pruneVisionCircles([source, donor], 0.1 * scale), [donor]);
    const exposed = circle(-21 * scale, -12 * scale, 6 * scale);
    assert.deepEqual(pruneVisionCircles([donor, exposed], 0.1 * scale), [donor, exposed]);
  }
});

test('中間值溢位與次正規浮點數無法證明覆蓋時保留來源', () => {
  const separated = [circle(-1e308, 0, 9e307), circle(1e308, 0, 9e307)];
  assert.deepEqual(pruneVisionCircles(separated, 1e306), separated);
  const overflowing = [circle(0, 0, 1e308), circle(1e307, 0, 1.2e308)];
  assert.deepEqual(pruneVisionCircles(overflowing, 1e308), overflowing);
  const tiny = [circle(0, 0, Number.MIN_VALUE * 4), circle(Number.MIN_VALUE * 2, 0, Number.MIN_VALUE * 4)];
  assert.deepEqual(pruneVisionCircles(tiny, Number.MIN_VALUE), tiny);
});

test('任一座標、半徑或 AA 餘裕無效即交回整個原陣列', () => {
  const valid = [circle(0, 0, 1), circle(0, 0, 10)];
  for (const inset of [undefined, null, '0.1', 0, -1, NaN, Infinity, -Infinity]) {
    assert.strictEqual(pruneVisionCircles(valid, inset), valid);
  }
  const invalid = [null, undefined, {}, circle(NaN, 0, 1), circle(0, Infinity, 1),
    circle(-Infinity, 0, 1), circle(0, 0, 0), circle(0, 0, -1), circle(0, 0, NaN),
    circle(0, 0, Infinity), circle(0, 0, '1')];
  for (const entry of invalid) {
    const circles = [valid[0], valid[1], entry];
    assert.strictEqual(pruneVisionCircles(circles, 0.1), circles);
  }
  const sparse = [valid[0], , valid[1]];
  assert.strictEqual(pruneVisionCircles(sparse, 0.1), sparse);
});

// 僅供測試的固定本地 PRNG；不使用或改動遊戲 RNG。
function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

test('固定種子圓群省略繪製後的獨立聯集取樣一致', () => {
  for (const [seed, scale] of [[1, 1], [12345, 1e-6], [0xdecafbad, 1e6], [0x12345678, 3]]) {
    const random = seededRandom(seed);
    const circles = [circle(-6, 0, 8), circle(6, 0, 8), circle(0, 0, 0.5)];
    for (let index = 0; index < 24; index++) {
      circles.push(circle(random() * 24 - 12, random() * 24 - 12, 1.5 + random() * 5.5));
    }
    const transformed = circles.map(c => circle((c.x - 17) * scale, (c.y - 23) * scale, c.radius * scale));
    const before = structuredClone(transformed);
    const result = pruneVisionCircles(transformed, 0.03 * scale);
    assert.ok(result.length > 0 && result.length < transformed.length);
    const retained = new Set(result);
    assert.deepEqual(result, transformed.filter(c => retained.has(c)));
    for (const item of result) assert.ok(transformed.includes(item));
    assert.deepEqual(transformed, before);
    assertSampledUnionEqual(transformed, result);
  }
});
