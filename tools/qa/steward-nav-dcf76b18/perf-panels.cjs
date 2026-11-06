const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const { chromium } = require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright-core');
const [beforeBuild, afterBuild, out, sampleMode] = process.argv.slice(2);
if (!beforeBuild || !afterBuild || !out || fs.existsSync(out)) throw Error('需要兩個正式構建與全新證據目錄');
fs.mkdirSync(out, { recursive: true });
const raw = fs.readFileSync('/workspace/riftwatch-resume-20261106-d908d81b/worktree/docs/feedback/production-player-d908d81b/root-only-replay/B-before-critical.json', 'utf8');
const result = { scope: 'CONTROLLED_SHORT_PANEL_LOAD：100／200為開始時單位數；活戰鬥保留死亡、碰撞與原封快照已啟用的自動經濟／軍事。每案3秒暖機、10秒活戰鬥、3次原生開關各2秒。ABBA兩次，不代表長測、真人或實體GPU。', rows: [], errors: [] };
if (sampleMode === 'focused') result.scope = 'CONTROLLED_R2_PANEL_RETEST：100／200各before/after一次，僅限定補測；每案3秒暖機、10秒活戰鬥，3次原生開啟、跳軍事區、展開兵營並查閱2秒。保留自動總管／碰撞／死亡；不是ABBA長測或實體GPU。';
const save = () => fs.writeFileSync(out + '/result.json', JSON.stringify(result, null, 2));
const pct = (a, p) => { const b = [...a].sort((x, y) => x - y); return b[Math.min(b.length - 1, Math.floor(b.length * p))] ?? null; };
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml' };
let browser;
(async () => {
  try {
    browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--no-sandbox', '--enable-precise-memory-info'] });
    result.browser = browser.version(); const cdp = await browser.newBrowserCDPSession(); result.gpu = (await cdp.send('SystemInfo.getInfo')).gpu.devices;
    result.cpuQuota = fs.readFileSync('/sys/fs/cgroup/cpu.max', 'utf8').trim(); result.memoryLimit = fs.readFileSync('/sys/fs/cgroup/memory.max', 'utf8').trim();
    const order = sampleMode === 'focused' ? [[1, 'before'], [1, 'after']] : [[1, 'before'], [1, 'after'], [2, 'after'], [2, 'before']];
    for (const n of [100, 200]) for (const [repeat, mode] of order) {
      const build = mode === 'before' ? beforeBuild : afterBuild, meta = JSON.parse(fs.readFileSync(build + '/build-metadata.json'));
      const context = await browser.newContext({ viewport: { width: 1440, height: 900 } }), page = await context.newPage();
      page.on('pageerror', e => result.errors.push({ n, repeat, mode, error: e.message }));
      await page.route('http://127.0.0.1:28147/**', route => {
        const u = new URL(route.request().url()).pathname, f = path.resolve(build, '.' + (u === '/' ? '/index.html' : decodeURIComponent(u)));
        if (!f.startsWith(path.resolve(build) + path.sep)) return route.fulfill({ status: 403, body: '' });
        try { return route.fulfill({ status: 200, contentType: mime[path.extname(f)] || 'application/octet-stream', body: fs.readFileSync(f) }); }
        catch { return route.fulfill({ status: 404, body: '' }); }
      });
      await page.goto('http://127.0.0.1:28147/', { waitUntil: 'networkidle' }); await page.waitForFunction(() => window.ageOfAsh && !document.querySelector('#btn-start').disabled);
      await page.evaluate(raw => localStorage.setItem('riftwatch.playtest.v227.run.v1', raw), raw); await page.reload({ waitUntil: 'networkidle' }); await page.waitForFunction(() => !document.querySelector('#btn-start').disabled);
      const verified = await page.evaluate(() => ({ source: ageOfAsh.playtestBuild.commit, hash: ageOfAsh.playtestBuild.resourceVerification }));
      if (verified.source !== meta.commit || verified.hash !== `SHA256_MATCH_${Object.keys(meta.files).length}_FILES`) throw Error('正式來源或資源不符');
      await page.locator('#btn-continue').click();
      const setup = await page.evaluate(({ raw, n }) => {
        const g = ageOfAsh.game; g.restore(JSON.parse(raw)); g.start(); g.paused = true;
        if (!g.autoEconomy || !g.autoMilitary) throw Error('原始夾具自動狀態改變');
        const b = g.world.base; let attempts = 0;
        while (g.units.filter(u => u.alive).length < n && attempts < 5000) {
          const i = attempts++, x = b.x - 8 + i % 20 * .8, y = b.y - 6 + Math.floor(i / 20) * .8;
          if (y >= g.world.size - 2) break;
          if (g.isWalkable(x, y, g.hero)) g.spawnUnit(['militia', 'archer', 'knight'][i % 3], x, y, i % 3 ? 'player' : 'enemy');
        }
        const s = g.snapshot(); delete s.savedAt;
        const state = { alive: g.units.filter(u => u.alive).length, scene: JSON.stringify(s), rng: g.rng.state, visualRng: g.visualRng.state, autoEconomy: g.autoEconomy, autoMilitary: g.autoMilitary };
        g.paused = false; return state;
      }, { raw, n });
      if (setup.alive !== n) throw Error('未達指定起始單位數');
      setup.sceneSha256 = crypto.createHash('sha256').update(setup.scene).digest('hex'); delete setup.scene;
      await page.waitForTimeout(3000);
      const live = await page.evaluate(async () => {
        const frames = [], g = ageOfAsh.game, start = performance.now(), aliveStart = g.units.filter(u => u.alive).length, heapStart = performance.memory.usedJSHeapSize, simStart = g.runTime; let previous = start;
        await new Promise(resolve => { const frame = now => { frames.push(now - previous); previous = now; if (now - start >= 10000) resolve(); else requestAnimationFrame(frame); }; requestAnimationFrame(frame); });
        return { frames, wallMs: performance.now() - start, aliveStart, aliveEnd: g.units.filter(u => u.alive).length, heapStart, heapEnd: performance.memory.usedJSHeapSize, simStart, simEnd: g.runTime };
      });
      const cycles = [];
      for (let cycle = 0; cycle < 3; cycle++) {
        const clickStart = performance.now();
        await page.locator('#btn-stewards-hud').click();
        const openRequestMs = performance.now() - clickStart;
        if (sampleMode === 'focused') {
          await page.locator('[data-steward-jump="military"]').click();
          await page.locator('details[data-producer]').first().locator(':scope > summary').click();
          await page.waitForFunction(() => !document.querySelector('details[data-producer] [data-production-content]').hidden);
        }
        const paused = await page.evaluate(() => { const s = ageOfAsh.game.snapshot(); delete s.savedAt; return { snapshot: JSON.stringify(s), heap: performance.memory.usedJSHeapSize, sim: ageOfAsh.game.runTime }; });
        const panel = await page.evaluate(async () => {
          const frames = [], start = performance.now(); let previous = start;
          await new Promise(resolve => { const frame = now => { frames.push(now - previous); previous = now; if (now - start >= 2000) resolve(); else requestAnimationFrame(frame); }; requestAnimationFrame(frame); });
          return { frames, wallMs: performance.now() - start, heap: performance.memory.usedJSHeapSize };
        });
        const end = await page.evaluate(() => { const s = ageOfAsh.game.snapshot(); delete s.savedAt; return { snapshot: JSON.stringify(s), paused: ageOfAsh.game.paused }; });
        const row = { cycle, openRequestMs, openTimingScope: 'Playwright點擊呼叫往返，非純UI事件延遲', pausedUnchanged: paused.snapshot === end.snapshot && end.paused, heapStart: paused.heap, heapEnd: panel.heap, samples: panel.frames.length, p50Ms: pct(panel.frames, .5), p95Ms: pct(panel.frames, .95) };
        if (!row.pausedUnchanged) throw Error('面板開啟時模擬改變');
        cycles.push(row); await page.locator('#steward-close').click();
        if (!await page.evaluate(() => !ageOfAsh.game.paused && !document.querySelector('#steward-dialog').open)) throw Error('關閉未恢復');
      }
      const frames = live.frames; delete live.frames;
      result.rows.push({ n, repeat, mode, source: meta.commit, ...setup, live: { ...live, samples: frames.length, fps: frames.length / (live.wallMs / 1000), p50Ms: pct(frames, .5), p95Ms: pct(frames, .95) }, cycles }); save();
      console.log(JSON.stringify({ n, repeat, mode, live: result.rows.at(-1).live, panelCycles: cycles.length })); await context.close();
    }
    result.pairs = [100, 200].flatMap(n => (sampleMode === 'focused' ? [1] : [1, 2]).map(repeat => { const a = result.rows.find(r => r.n === n && r.repeat === repeat && r.mode === 'before'), b = result.rows.find(r => r.n === n && r.repeat === repeat && r.mode === 'after'); return { n, repeat, scene: a.sceneSha256 === b.sceneSha256, rng: a.rng === b.rng, visualRng: a.visualRng === b.visualRng }; }));
    if (result.pairs.some(p => !p.scene || !p.rng || !p.visualRng) || result.errors.length) throw Error('配對或瀏覽器檢查失敗');
    result.status = sampleMode === 'focused' ? 'MEASURED_R2_FOCUSED_SHORT_SAMPLES_NOT_ABBA_OR_LONG_RUN' : 'MEASURED_SHORT_ABBA_PANEL_CHECKS_NOT_LONG_RUN_CERTIFICATION';
  } catch (e) { result.status = 'FAIL'; result.failure = String(e.stack || e); process.exitCode = 1; }
  finally { await browser?.close(); save(); }
})();
