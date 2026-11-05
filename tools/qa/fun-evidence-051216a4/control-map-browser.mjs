import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { captureVisibleUI, playerControlSelector } from './visible-controls.mjs';

const [build, out, resumePath] = process.argv.slice(2), source = '6852cf85acca5c08923e0191a1e0703189f4d3e6';
if (!build || !out || !resumePath || fs.existsSync(out)) throw Error('需指定正式構建、全新證據目錄及原始快照');
fs.mkdirSync(out, { recursive: true });
const repo = fileURLToPath(new URL('../../../', import.meta.url));
const original = execFileSync('git', ['-C', repo, 'show', source + ':tools/qa/player_lab_gateway.mjs'], { encoding: 'utf8' });
const a = original.indexOf('const ui=await page.evaluate(', original.indexOf('async function observe()')) + 'const ui=await page.evaluate('.length;
const b = original.indexOf('\n });return{session', a), legacy = original.slice(a, b) + '\n }';
const raw = fs.readFileSync(resumePath, 'utf8');
const result = { scope: 'CONTROLLED_UI_ADAPTER_REPRODUCTION：正式685構建正常Continue後立即原生暫停，僅查公開DOM及原生控制操作。不是新的玩家對局、自然勝利或主觀回報。', source,
  legacyGatewaySha256: crypto.createHash('sha256').update(original).digest('hex'), legacyCallbackSha256: crypto.createHash('sha256').update(legacy).digest('hex'),
  resumeSha256: crypto.createHash('sha256').update(raw).digest('hex'), checks: [], errors: [] };
if (result.resumeSha256 !== '1d35c76c1b35c5b4e901019dec95c02426114b582b32a3b91b5d29202f5462e4') throw Error('原始快照SHA不符');
const save = () => fs.writeFileSync(path.join(out, 'result.json'), JSON.stringify(result, null, 2));
const check = (name, pass, data = {}) => { result.checks.push({ name, pass: !!pass, ...data }); save(); if (!pass) throw Error(name); };
const { chromium } = createRequire('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/package.json')('playwright-core');
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml' };
let browser, context, page, id, wanted;
async function desired() {
  const producer = page.locator(`#steward-dialog details[data-producer="${id}"]`);
  if (await producer.getAttribute('open') === null) await producer.locator(':scope > summary').click();
  const summary = producer.locator('details[data-production-unit] > summary').first();
  await summary.scrollIntoViewIfNeeded(); wanted = await summary.elementHandle(); return summary;
}
async function snap() {
  return page.evaluate(() => { const g = ageOfAsh.game, s = g.snapshot(); delete s.savedAt; delete s.camera; return { snapshot: JSON.stringify(s), rng: g.rng.state, visualRng: g.visualRng.state, sim: g.runTime, paused: g.paused }; });
}
(async () => {
  try {
    check('舊數字別名與格式錯誤一律拒絕，不猜其他控制', playerControlSelector('@33') === null && playerControlSelector('@rw-ui-bad') === null);
    check('正式id與name等既有選取介面保持原樣', playerControlSelector('#btn-stewards') === '#btn-stewards' && playerControlSelector('input[name="age"]') === 'input[name="age"]' && playerControlSelector(undefined) === undefined);
    browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] }); result.browser = browser.version();
    context = await browser.newContext({ viewport: { width: 1440, height: 900 }, recordVideo: { dir: path.join(out, 'video'), size: { width: 960, height: 600 } } }); page = await context.newPage();
    page.on('pageerror', e => { result.errors.push(e.message); save(); });
    await page.route('http://127.0.0.1:28131/**', route => {
      const u = new URL(route.request().url()).pathname, f = path.resolve(build, '.' + (u === '/' ? '/index.html' : decodeURIComponent(u)));
      if (!f.startsWith(path.resolve(build) + path.sep)) return route.fulfill({ status: 403, body: '' });
      try { return route.fulfill({ status: 200, contentType: mime[path.extname(f)] || 'application/octet-stream', body: fs.readFileSync(f) }); } catch { return route.fulfill({ status: 404, body: '' }); }
    });
    await page.goto('http://127.0.0.1:28131/', { waitUntil: 'networkidle' }); await page.waitForFunction(() => window.ageOfAsh && !document.querySelector('#btn-start').disabled);
    const verified = await page.evaluate(() => ({ source: ageOfAsh.playtestBuild.commit, hash: ageOfAsh.playtestBuild.resourceVerification }));
    check('新環境Chromium實際啟動且正式163資源完整', verified.source === source && verified.hash === 'SHA256_MATCH_163_FILES', { verified });
    await page.evaluate(raw => localStorage.setItem('riftwatch.playtest.v227.run.v1', raw), raw); await page.reload({ waitUntil: 'networkidle' }); await page.waitForFunction(() => !document.querySelector('#btn-start').disabled);
    await page.locator('#setup-locale').selectOption('zh-Hant'); await page.locator('#btn-continue').click(); await page.locator('#btn-pause').click(); await page.locator('#btn-stewards').click();
    id = await page.evaluate(() => ageOfAsh.game.buildings.find(b => b.alive && b.type === 'stable').id);
    await page.locator('#steward-dialog select[name="age"]').scrollIntoViewIfNeeded();
    await page.evaluate('(' + legacy + ')()');
    const rememberedAge = await page.locator('#steward-dialog select[name="age"]').getAttribute('data-player-control');
    await desired(); const oldMap = await page.evaluate('(' + legacy + ')()');
    const old = await page.evaluate(el => { const key = el.dataset.playerControl, first = document.querySelector(`[data-player-control="${key}"]`); return { key, wanted: { tag: el.tagName, text: el.innerText }, first: { tag: first?.tagName, name: first?.name, text: first?.innerText }, same: first === el, matches: document.querySelectorAll(`[data-player-control="${key}"]`).length }; }, wanted);
    check('原685回呼重現：重新編號撞到仍在DOM的另一控制', !old.same && old.matches > 1 && oldMap.controls.some(c => c.key === old.key && c.label === old.wanted.text), { old, rememberedAge });
    const wrong = page.locator(`[data-player-control="${old.key}"]`).first();
    check('舊act的isVisible仍會接受離開可視區的舊控制', await wrong.isVisible(), { target: old.first });
    if (['SELECT', 'INPUT'].includes(old.first.tag)) {
      await wrong.click(); const focused = await page.evaluate(() => ({ tag: document.activeElement.tagName, name: document.activeElement.name }));
      check('舊解析器實際原生點擊落到錯誤表單控制', focused.tag === old.first.tag && focused.name === old.first.name, { focused });
      await page.screenshot({ path: path.join(out, 'before-wrong-native-control.png') });
      await page.keyboard.press('Escape');
    } else result.legacyClickNotExecuted = '避免刻意觸發其他可能有副作用的控制；錯誤DOM接收者已重現';
    if (!await page.locator('#steward-dialog').evaluate(d => d.open)) await page.locator('#btn-stewards').click();
    await page.locator('#steward-dialog select[name="age"]').scrollIntoViewIfNeeded(); await page.evaluate(captureVisibleUI);
    const stableAge = await page.locator('#steward-dialog select[name="age"]').getAttribute('data-player-control');
    await desired(); const stableMap = await page.evaluate(captureVisibleUI), key = await page.evaluate(el => el.dataset.playerControl, wanted), selector = playerControlSelector('@' + key);
    const stable = await page.evaluate(({ el, key }) => ({ key, unique: document.querySelectorAll(`[data-player-control="${key}"]`).length, same: document.querySelector(`[data-player-control="${key}"]`) === el, tag: el.tagName, text: el.innerText }), { el: wanted, key });
    check('新映射不重用其他可見區的別名，精確綁同一DOM', stable.same && stable.unique === 1 && key !== stableAge && stableMap.controls.some(c => c.key === key && c.label === stable.text), { stable, stableAge });
    const before = await snap();
    for (let i = 0; i < 20; i++) await page.evaluate(captureVisibleUI);
    const after = await snap();
    check('反覆觀察保留同一元素身分', await page.evaluate(({ el, key }) => el.dataset.playerControl === key, { el: wanted, key }));
    check('純觀察不改模擬快照、庫存、時間與兩種遊戲RNG', before.snapshot === after.snapshot && before.rng === after.rng && before.visualRng === after.visualRng && after.paused, { before: { ...before, snapshot: undefined }, after: { ...after, snapshot: undefined } });
    await page.locator(selector).click();
    check('新別名原生點擊正確展開輕騎兵明細', await page.evaluate(el => el.parentElement.open, wanted));
    await page.screenshot({ path: path.join(out, 'after-correct-native-details.png') });
    const oldKey = '@' + key; await page.evaluate(() => ageOfAsh.ui.changeLocale('en')); await page.evaluate(captureVisibleUI);
    check('原生重新呈現移除舊元素時不把舊別名配給新元素', await page.locator(playerControlSelector(oldKey)).count() === 0);
    await desired(); await page.evaluate(captureVisibleUI); const newer = await page.evaluate(el => el.dataset.playerControl, wanted);
    check('新DOM即使同一功能也取得新的不重用身分', newer !== key && await page.locator(playerControlSelector('@' + newer)).count() === 1);
    await page.reload({ waitUntil: 'networkidle' }); await page.waitForFunction(() => !document.querySelector('#btn-start').disabled); const fresh = await page.evaluate(captureVisibleUI);
    const oldDocumentId = key.split('-').slice(2, 7).join('-'), freshKey = fresh.controls[0].key;
    check('正式Reload換文件nonce，前一頁別名不能誤綁', !freshKey.startsWith('rw-ui-' + oldDocumentId + '-') && await page.locator(playerControlSelector('@' + newer)).count() === 0, { oldKey: key, freshKey });
    check('零瀏覽器程式錯誤', result.errors.length === 0); result.status = 'LEGACY_ALIAS_COLLISION_REPRODUCED_STABLE_MAPPING_PASS';
  } catch (e) { result.status = 'FAIL'; result.failure = String(e.stack || e); process.exitCode = 1; if (page && !page.isClosed()) await page.screenshot({ path: path.join(out, 'failure.png') }).catch(() => {}); }
  finally { if (context) { const v = page?.video(); await context.close(); if (v) fs.copyFileSync(await v.path(), path.join(out, 'continuous-validation.webm')); } await browser?.close(); save(); console.log(JSON.stringify({ status: result.status, pass: result.checks.filter(c => c.pass).length, fail: result.checks.filter(c => !c.pass).length, failure: result.failure, errors: result.errors })); }
})();
