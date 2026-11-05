const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const { chromium } = require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright-core');
const root = '/workspace/riftwatch-fun-lab-281169b5', source = process.argv[2], build = process.argv[3], out = process.argv[4];
if (!/^[a-f0-9]{40}$/.test(source) || !build || !out || fs.existsSync(out)) throw Error('正式來源與新目錄必填');
fs.mkdirSync(out, { recursive: true });
const raw = fs.readFileSync(root + '/checkpoints/A-before-critical.json', 'utf8');
const result = { source, resumeSha256: crypto.createHash('sha256').update(raw).digest('hex'), scope: '正式構建＋原封A存檔Continue，原生暫停／總管／設定／SaveContinue；另明標單一資源小數邊界CONTROLLED_RESOURCE_FIXTURE，不當玩家流程或新平衡。純讀比較排除原生暫停仍有的camera緩動。', checks: [], errors: [] };
const save = () => fs.writeFileSync(out + '/result.json', JSON.stringify(result, null, 2));
const check = (name, pass, data = {}) => { result.checks.push({ name, pass: !!pass, ...data }); save(); if (!pass) throw Error(name); };
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml' };
let browser, context, page, producerId;
const producer = () => `#steward-dialog details[data-producer="${producerId}"]`;
const refresh = () => `#steward-dialog button[data-production-refresh="${producerId}"]`;
async function snapshot() { return page.evaluate(() => { const g = ageOfAsh.game, s = g.snapshot(); delete s.savedAt; delete s.camera; return { snapshot: JSON.stringify(s), rng: g.rng.state, visual: g.visualRng.state, sim: g.runTime, paused: g.paused }; }); }
async function openProducer() { const p = page.locator(producer()); if (await p.getAttribute('open') === null) await p.locator(':scope > summary').click(); await page.waitForFunction(id => !document.querySelector(`[data-producer="${id}"] [data-production-content]`).hidden, producerId); }
async function openUnit(type) { const u = page.locator(`${producer()} details[data-production-unit="${type}"]`); if (await u.getAttribute('open') === null) await u.locator(':scope > summary').click(); await u.locator(':scope > summary').scrollIntoViewIfNeeded(); }
async function liveView() { return page.evaluate(async id => { const { productionReadback } = await import('./js/production-readback.js'); const g = ageOfAsh.game; return productionReadback(g, g.buildings.find(b => b.id === id)); }, producerId); }
async function close(name) { const v = page.video(); await context.close(); context = null; if (v) fs.copyFileSync(await v.path(), out + '/' + name + '.webm'); }
async function boot(mode) {
  const actualBuild = mode === 'before' ? root + '/build-terminal-cache-r2' : build, expected = mode === 'before' ? '35dedfe6ee203a4d9689290dc466484c39557cf8' : source;
  context = await browser.newContext({ viewport: { width: 1440, height: 900 }, recordVideo: { dir: out + '/video', size: { width: 960, height: 600 } } }); page = await context.newPage();
  page.on('pageerror', e => { result.errors.push({ mode, message: e.message }); save(); });
  await page.route('http://127.0.0.1:28130/**', route => {
    const u = new URL(route.request().url()).pathname, f = path.resolve(actualBuild, '.' + (u === '/' ? '/index.html' : decodeURIComponent(u)));
    if (!f.startsWith(actualBuild + path.sep)) return route.fulfill({ status: 403, body: '' });
    try { return route.fulfill({ status: 200, contentType: mime[path.extname(f)] || 'application/octet-stream', body: fs.readFileSync(f) }); } catch { return route.fulfill({ status: 404, body: '' }); }
  });
  await page.goto('http://127.0.0.1:28130/', { waitUntil: 'networkidle' }); await page.waitForFunction(() => window.ageOfAsh && !document.querySelector('#btn-start').disabled);
  await page.evaluate(raw => localStorage.setItem('riftwatch.playtest.v227.run.v1', raw), raw); await page.reload({ waitUntil: 'networkidle' }); await page.waitForFunction(() => !document.querySelector('#btn-start').disabled);
  const verified = await page.evaluate(() => ({ source: ageOfAsh.playtestBuild.commit, hash: ageOfAsh.playtestBuild.resourceVerification })), count = Object.keys(JSON.parse(fs.readFileSync(actualBuild + '/build-metadata.json')).files).length;
  check(mode + '正式來源與全部資源', verified.source === expected && verified.hash === `SHA256_MATCH_${count}_FILES`, { verified });
  await page.locator('#setup-locale').selectOption('zh-Hant'); await page.locator('#btn-continue').click(); await page.locator('#btn-pause').click(); await page.locator('#btn-stewards').click();
  producerId = await page.evaluate(() => { const g = ageOfAsh.game; return (g.buildings.find(b => b.alive && b.team === 'player' && b.type === 'stable') || g.buildings.find(b => b.alive && b.team === 'player' && !['core', 'market'].includes(b.type) && g.trainableFor(b).length)).id; });
}
(async () => {
  try {
    browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] }); result.browser = browser.version();
    await boot('before'); await page.locator(producer() + ' > summary').click();
    check('Before仍只有原生概括狀態，沒有逐兵種成本明細', await page.locator('[data-production-unit]').count() === 0, { text: await page.locator(producer()).innerText() });
    await page.screenshot({ path: out + '/before-producer-generic-status.png' }); await close('before');
    await boot('after'); check('尚未展開建築時沒有重建整份診斷', await page.locator('[data-production-unit]').count() === 0);
    await openProducer(); let view = await liveView();
    check('當前已套用合法兵種與正式費用讀回有資料', view.units.length > 0, { view });
    const type = view.units[0].type, unit = () => `${producer()} details[data-production-unit="${type}"]`;
    await openUnit(type);
    const cells = await page.locator(unit()).evaluate(n => [...n.querySelectorAll('tr[data-resource]')].map(r => ({ resource: r.dataset.resource, checked: r.dataset.checked, values: Object.fromEntries([...r.querySelectorAll('td[data-column]')].map(c => [c.dataset.column, Number(c.dataset.value)])) })));
    check('實際表格全部四資源欄等同原生費用與底線資料', cells.length === 4 && cells.every(r => r.checked === String(view.units[0].resources[r.resource].checked) && Object.entries(r.values).every(([k, v]) => v === view.units[0].resources[r.resource][k])), { cells, native: view.units[0] });
    await page.screenshot({ path: out + '/after-producer-native-costs.png' });
    const beforePure = await snapshot(); await page.evaluate(el => { window.__refreshNode = el; }, await page.locator(refresh()).elementHandle());
    await page.locator(refresh()).focus(); await page.keyboard.press('Enter'); const afterPure = await snapshot();
    check('原生Enter更新不套用草稿／不關面板，更新控制節點穩定', await page.evaluate(() => document.querySelector('#steward-dialog').open && document.querySelector('[data-production-refresh]') && window.__refreshNode.isConnected));
    check('查看與顯式更新不改完整模擬快照或兩種RNG', beforePure.snapshot === afterPure.snapshot && beforePure.rng === afterPure.rng && beforePure.visual === afterPure.visual && afterPure.paused, { rngBefore: beforePure.rng, rngAfter: afterPure.rng, simBefore: beforePure.sim, simAfter: afterPure.sim });
    const applied = await page.evaluate(() => ageOfAsh.game.stewards.reserve[0]); await page.locator('#steward-dialog [name="reserve0"]').fill(String(applied + 7));
    check('未套用草稿有全域及建築提示', await page.locator('#steward-applied-notice').getAttribute('data-draft') === 'true' && !await page.locator(producer() + ' [data-production-draft]').isHidden());
    await page.locator(refresh()).click(); const draftView = await liveView();
    check('草稿更新仍讀已套用計畫而不替換live Game', JSON.stringify(view.globalFloor) === JSON.stringify(draftView.globalFloor) && await page.evaluate(v => ageOfAsh.game.stewards.reserve[0] === v, applied));
    await page.screenshot({ path: out + '/unapplied-draft-stays-separate.png' });
    await page.locator('#steward-dialog [name="reserve0"]').fill(String(applied));
    check('表單改回原值即清除未套用提示', await page.locator('#steward-applied-notice').getAttribute('data-draft') === 'false');
    await page.locator('#steward-dialog [name="reserve0"]').fill('80'); await page.locator(`#steward-dialog [name="budget${producerId}_0"]`).fill('50'); await page.locator('#steward-apply').click();
    check('原生套用保留既有設定費用與暫停狀態', await page.evaluate(id => ageOfAsh.game.stewards.reserve[0] === 80 && ageOfAsh.game.stewards.military[id].budget[0] === 50 && ageOfAsh.game.paused, producerId));
    await page.locator('#btn-stewards').click(); await openProducer(); view = await liveView();
    check('套用後全域與建築50取max，沒有把底線相加', view.globalFloor.food >= 80 && view.producerFloor.food === 50 && view.units.every(u => u.resources.food.floor === Math.max(view.globalFloor.food, 50)), { view });
    await page.locator('#steward-close').click(); await page.locator('#btn-save').click(); await page.reload({ waitUntil: 'networkidle' }); await page.waitForFunction(() => !document.querySelector('#btn-start').disabled); await page.locator('#btn-continue').click(); await page.locator('#btn-stewards-hud').click(); await openProducer(); view = await liveView();
    check('正式SaveContinue還原已套用保留與診斷', view.globalFloor.food >= 80 && view.producerFloor.food === 50 && await page.evaluate(() => ageOfAsh.game.stewards.reserve[0] === 80), { view });
    const boundary = await page.evaluate(async ({ id, type }) => { const { productionReadback } = await import('./js/production-readback.js'); const g = ageOfAsh.game, b = g.buildings.find(b => b.id === id), initial = productionReadback(g, b).units.find(u => u.type === type), charged = Object.keys(initial.resources).filter(r => initial.resources[r].checked); if (!charged.length) throw Error('沒有可測的實際付費資源'); for (const r of charged) g.resources[r] = initial.resources[r].cost + initial.resources[r].floor + 10; const r = charged[0]; g.resources[r] = initial.resources[r].cost + initial.resources[r].floor - .005; return { resource: r, unit: productionReadback(g, b).units.find(u => u.type === type), classification: 'CONTROLLED_RESOURCE_FLOAT_BOUNDARY_NOT_PLAYER_RESULT' }; }, { id: producerId, type });
    await page.locator(refresh()).click(); const summary = await page.locator(unit() + ' > summary').innerText(); await openUnit(type);
    const rawShortage = Number(await page.locator(`${unit()} tr[data-resource="${boundary.resource}"] [data-column="shortage"]`).getAttribute('data-value'));
    check('受控微小正缺口不被四捨五入成零或冒稱可生產', summary.includes('<0.01') && !boundary.unit.resourceReady && rawShortage > 0 && rawShortage < .01 && rawShortage === boundary.unit.resources[boundary.resource].shortage, { boundary, summary, rawShortage });
    for (const locale of ['zh-Hant', 'zh-Hans', 'en', 'ja']) for (const [w, h] of [[1440, 900], [1024, 768], [800, 600], [390, 844]]) {
      await page.setViewportSize({ width: w, height: h }); await page.evaluate(l => ageOfAsh.ui.changeLocale(l), locale); await openProducer(); await openUnit(type); await page.waitForTimeout(100);
      const layout = await page.evaluate(id => { const d = document.querySelector('#steward-dialog'), r = d.getBoundingClientRect(); return { inside: r.left >= 0 && r.right <= innerWidth && r.top >= 0 && r.bottom <= innerHeight, noOuterOverflow: d.scrollWidth <= d.clientWidth + 2, text: d.querySelector(`[data-producer="${id}"]`).innerText, controls: ['steward-apply', 'steward-close'].every(id => { const b = document.getElementById(id), q = b.getBoundingClientRect(); return b.contains(document.elementFromPoint(q.x + q.width / 2, q.y + q.height / 2)); }) }; }, producerId);
      check('四語視口診斷與固定操作列-' + locale + '-' + w, layout.inside && layout.noOuterOverflow && layout.controls && !layout.text.includes('production.') && !layout.text.includes('NaN'), layout);
      if (locale === 'zh-Hant' && w === 1440 || locale === 'ja' && w === 390) await page.screenshot({ path: out + '/layout-' + locale + '-' + w + '.png' });
    }
    check('零瀏覽器程式錯誤', result.errors.length === 0); result.status = 'PASS_NATIVE_PRODUCTION_READBACK_AND_CONTROLLED_RESOURCE_EDGE'; await close('after');
  } catch (e) { result.status = 'FAIL'; result.failure = String(e.stack || e); process.exitCode = 1; if (page && !page.isClosed()) await page.screenshot({ path: out + '/failure.png' }).catch(() => {}); }
  finally { if (context) await close('failed').catch(() => {}); await browser?.close(); save(); console.log(JSON.stringify({ status: result.status, pass: result.checks.filter(c => c.pass).length, fail: result.checks.filter(c => !c.pass).length, failure: result.failure, errors: result.errors })); }
})();
