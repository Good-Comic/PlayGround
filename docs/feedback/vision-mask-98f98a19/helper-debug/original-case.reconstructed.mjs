// 依當時寫入內容重建；首輪原始檔案／輸出 bytes 未封存。
// 此檔保存資料生成式，不執行已更正的歷史斷言。
export function buildOriginalCase() {
  const circle = (x, y, radius, label) => ({ x, y, radius, label });
  const first = circle(0, 0, 1, '中心一');
  const second = circle(0, 0, 1, '中心二');
  const ring = Array.from({ length: 8 }, (_, index) => {
    const angle = index * Math.PI / 4;
    return circle(Math.cos(angle) * 1.8, Math.sin(angle) * 1.8, 1.1, `外環${index}`);
  });
  return { first, second, ring, circles: [first, second, ...ring], inset: 0.01 };
}

export const originalAssertion = 'assert.equal(result.filter(c => c === first || c === second).length, 1);';
export const observedAssertion = { actual: 2, expected: 1, operator: 'strictEqual' };
export const command = 'node tests/vision-mask.test.mjs';
export const observedSummary = { tests: 14, pass: 13, fail: 1, exitCode: 1 };
