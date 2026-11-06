const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const { chromium } = require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright-core');
const [build, reference, out] = process.argv.slice(2);
if (!build || !reference || !out || fs.existsSync(out)) throw Error('需指定正式構建、原版構建與全新輸出目錄');
fs.mkdirSync(out, { recursive: true });
const meta = JSON.parse(fs.readFileSync(path.join(build, 'build-metadata.json')));
const oldMeta = JSON.parse(fs.readFileSync(path.join(reference, 'build-metadata.json')));
const result = { scope: 'CONTROLLED_RENDER_VALIDATION：原生啟動及存讀檔；遮罩以舊版函式逐byte比較。合成來源與投影案例不是自然戰役或現行地形功能聲明。', source: meta.commit, reference: oldMeta.commit, checks: [], rows: [], errors: [] };
const save = () => fs.writeFileSync(path.join(out, 'result.json'), JSON.stringify(result, null, 2));
function check(name, pass, details = {}) { result.checks.push({ name, pass: !!pass, ...details }); save(); if (!pass) throw Error(name); }
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml' };
let browser, context;
(async () => {
  try {
    browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
    result.browser = browser.version();
    context = await browser.newContext({ viewport: { width: 1440, height: 900 }, recordVideo: { dir: path.join(out, 'video'), size: { width: 960, height: 600 } } });
    const page = await context.newPage();
    page.on('pageerror', e => { result.errors.push(e.message); save(); });
    await page.route('http://127.0.0.1:28145/**', route => {
      const url = new URL(route.request().url()).pathname;
      const file = url === '/js/reference-renderer.js' ? path.join(reference, 'js/renderer.js') : path.resolve(build, '.' + (url === '/' ? '/index.html' : decodeURIComponent(url)));
      if (url !== '/js/reference-renderer.js' && !file.startsWith(path.resolve(build) + path.sep)) return route.fulfill({ status: 403, body: '' });
      try { return route.fulfill({ status: 200, contentType: mime[path.extname(file)] || 'application/octet-stream', body: fs.readFileSync(file) }); }
      catch { return route.fulfill({ status: 404, body: '' }); }
    });
    await page.goto('http://127.0.0.1:28145/', { waitUntil: 'networkidle' });
    await page.waitForFunction(() => window.ageOfAsh && !document.querySelector('#btn-start').disabled);
    const verified = await page.evaluate(() => ({ source: ageOfAsh.playtestBuild.commit, hash: ageOfAsh.playtestBuild.resourceVerification }));
    check('正式來源與全部資源通過原有完整性閘門', verified.source === meta.commit && verified.hash === `SHA256_MATCH_${Object.keys(meta.files).length}_FILES`, { verified });
    const civilizations = await page.locator('#setup-civ option').evaluateAll(options => options.map(o => o.value));
    for (const locale of ['zh-Hant', 'zh-Hans', 'en', 'ja']) {
      await page.locator('#setup-locale').selectOption(locale);
      check('四語啟動入口可用-' + locale, await page.locator('#btn-start').isEnabled());
    }
    await page.locator('#setup-locale').selectOption('zh-Hant');
    await page.locator('#setup-civ').selectOption('CHN');
    await page.locator('#btn-start').click();
    await page.waitForFunction(() => !ageOfAsh.game.inMenu);
    await page.keyboard.press('F2');
    await page.screenshot({ path: path.join(out, 'native-chinese-start.png') });
    await page.locator('#btn-pause').click();
    check('原生滑鼠啟動與鍵盤選兵後可暫停', await page.evaluate(() => ageOfAsh.game.paused && !ageOfAsh.game.inMenu));
    const data = await page.evaluate(async civilizations => {
      const { Renderer: ReferenceRenderer } = await import('/js/reference-renderer.js');
      const g = ageOfAsh.game, r = ageOfAsh.renderer, legacy = ReferenceRenderer.prototype.drawVisibility;
      const snapshot = () => { const s = g.snapshot(); delete s.savedAt; return JSON.stringify(s); };
      const rows = [];
      function compare(name, units = g.units, buildings = g.buildings, projectedOffset = false) {
        const before = snapshot(), facade = Object.create(g), receiver = Object.create(r);
        facade.units = units; facade.buildings = buildings; facade.sightRadius = g.sightRadius.bind(g);
        receiver.ctx = document.createElement('canvas').getContext('2d'); receiver.ctx.canvas.width = r.w; receiver.ctx.canvas.height = r.h;
        receiver.visionLayer = document.createElement('canvas'); receiver.visionLayer.width = r.w; receiver.visionLayer.height = r.h;
        if (projectedOffset) receiver.screen = (game, x, y) => { const p = r.screen(game, x, y); return { x: p.x, y: p.y - ((Math.round(x * 7 + y * 3) % 5) - 2) * 17 }; };
        const c = receiver.visionLayer.getContext('2d'), ellipse = c.ellipse;
        let count = 0;
        c.ellipse = function (...args) { count++; return ellipse.apply(this, args); };
        legacy.call(receiver, facade);
        const previousCount = count, previous = c.getImageData(0, 0, r.w, r.h).data;
        count = 0; r.drawVisibility.call(receiver, facade);
        const current = c.getImageData(0, 0, r.w, r.h).data;
        let differentBytes = 0, maxDifference = 0;
        for (let i = 0; i < previous.length; i++) if (previous[i] !== current[i]) { differentBytes++; maxDifference = Math.max(maxDifference, Math.abs(previous[i] - current[i])); }
        c.ellipse = ellipse;
        const row = { name, width: r.w, height: r.h, zoom: g.camera.zoom, originalDraws: previousCount, optimizedDraws: count, differentBytes, maxDifference, snapshotUnchanged: before === snapshot(), storm: g.effects.sandstorm || 0 };
        rows.push(row);
        if (differentBytes || !row.snapshotUnchanged || count > previousCount) throw Error(JSON.stringify(row));
      }
      const base = g.world.base, template = g.units.find(u => u.team === 'player'), core = g.getTownCenter();
      const clone = (x, y, extra = {}) => ({ ...template, alive: true, team: 'player', x, y, ...extra });
      const dense = Array.from({ length: 81 }, (_, i) => clone(base.x + (i % 9 - 4) * .6, base.y + (Math.floor(i / 9) - 4) * .6));
      const separate = Array.from({ length: 8 }, (_, i) => clone(base.x + (i % 4 - 2) * 9, base.y + (Math.floor(i / 4) - .5) * 13));
      const coincident = Array.from({ length: 6 }, () => clone(base.x, base.y));
      const withFiltered = [...dense, clone(base.x, base.y, { alive: false }), clone(base.x, base.y, { team: 'neutral' }), clone(base.x, base.y, { team: 'enemy' })];
      const sets = [['actual', g.units, g.buildings], ['dense', dense, [core]], ['empty', [], []], ['separate', separate, []], ['coincident', coincident, []], ['filtered', withFiltered, [core]]];
      for (const zoom of [.78, 1, 1.6]) {
        g.camera.zoom = zoom;
        for (const [name, units, buildings] of sets) compare(name + '-' + zoom, units, buildings);
        compare('synthetic-projection-offset-' + zoom, dense, [core], true);
      }
      g.executeSandstorm();
      for (const zoom of [.78, 1, 1.6]) { g.camera.zoom = zoom; compare('storm-actual-' + zoom); compare('storm-dense-' + zoom, dense, [core]); }
      const state = JSON.parse(snapshot()); g.restore(state); g.start(); g.paused = true;
      compare('restored-storm');
      const restoredStorm = g.effects.sandstorm;
      g.newRun(42, { civ: 'TEU', biome: 'dune' }); g.start(); g.executeSandstorm(); g.paused = false;
      for (let i = 0; i < 401; i++) g.update(.05);
      g.paused = true; compare('expired-native-simulation-storm');
      const expiredStorm = g.effects.sandstorm;
      for (const civ of civilizations) { g.newRun(42, { civ, biome: 'steppe' }); g.start(); g.paused = true; compare('civilization-' + civ); }
      return { rows, restoredStorm, expiredStorm, strictRngRestore: '歷史strict表示FAIL保留；此處驗遮罩與render前後快照，不宣稱修復SaveLoad RNG' };
    }, civilizations);
    result.rows.push(...data.rows); result.saveLoadScope = data.strictRngRestore; save();
    check('全部參考遮罩逐RGBA byte相同且渲染不改快照', data.rows.every(x => !x.differentBytes && x.snapshotUnchanged));
    check('密集來源有實際減少繪圖', data.rows.some(x => x.name.startsWith('dense') && x.optimizedDraws < x.originalDraws));
    check('沙暴讀檔保留並由正式模擬更新結束', data.restoredStorm > 0 && data.expiredStorm === 0, { restoredStorm: data.restoredStorm, expiredStorm: data.expiredStorm });
    const metrics = await context.newCDPSession(page);
    for (const dimensions of [{ width: 800, height: 600 }, { width: 390, height: 844 }, { width: 1280, height: 800, deviceScaleFactor: 1.75 }]) {
      await page.setViewportSize({ width: dimensions.width, height: dimensions.height });
      if (dimensions.deviceScaleFactor) await metrics.send('Emulation.setDeviceMetricsOverride', { ...dimensions, mobile: false });
      const row = await page.evaluate(async () => {
        const { Renderer: Ref } = await import('/js/reference-renderer.js'); const r = ageOfAsh.renderer, g = ageOfAsh.game;
        r.resize(); g.paused = true; const receiver = Object.create(r); receiver.ctx = document.createElement('canvas').getContext('2d'); receiver.ctx.canvas.width = r.w; receiver.ctx.canvas.height = r.h;
        receiver.visionLayer = document.createElement('canvas'); Ref.prototype.drawVisibility.call(receiver, g); const c = receiver.visionLayer.getContext('2d'), before = c.getImageData(0, 0, r.w, r.h).data;
        r.drawVisibility.call(receiver, g); const after = c.getImageData(0, 0, r.w, r.h).data; let different = 0; for (let i = 0; i < before.length; i++) if (before[i] !== after[i]) different++;
        return { width: r.w, height: r.h, devicePixelRatio, rendererDpr: r.dpr, differentBytes: different };
      });
      check('原生resize參考遮罩相同-' + dimensions.width, !row.differentBytes, row);
    }
    await metrics.send('Emulation.clearDeviceMetricsOverride'); await metrics.detach();
    await page.setViewportSize({ width: 1440, height: 900 });
    if (!await page.locator('#btn-save').isVisible()) {
      await page.locator('#btn-pause').click();
      if (!await page.locator('#btn-save').isVisible()) await page.locator('#btn-pause').click();
    }
    await page.locator('#btn-save').click();
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForFunction(() => window.ageOfAsh && !document.querySelector('#btn-start').disabled);
    await page.locator('#btn-continue').click();
    await page.waitForFunction(() => !ageOfAsh.game.inMenu);
    check('原生儲存及Reload後Continue啟動無錯誤', await page.evaluate(() => !!ageOfAsh.game.world && !ageOfAsh.game.inMenu));
    await page.screenshot({ path: path.join(out, 'native-save-continue.png') });
    check('零瀏覽器程式錯誤', !result.errors.length, { errors: result.errors });
    result.status = 'PASS_CONTROLLED_MASK_PIXELS_STATE_AND_NATIVE_INPUT'; save();
  } catch (e) { result.status = 'FAIL'; result.failure = String(e.stack || e); process.exitCode = 1; save(); }
  finally { await context?.close(); await browser?.close(); save(); }
})();
