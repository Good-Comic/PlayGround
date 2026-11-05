const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const { chromium } = require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright-core');
const root = '/workspace/riftwatch-fun-lab-281169b5', afterSha = process.argv[2], afterBuild = process.argv[3], out = process.argv[4];
if (!/^[a-f0-9]{40}$/.test(afterSha) || !afterBuild || !out || fs.existsSync(out)) throw Error('需要正式來源與全新證據目錄');
fs.mkdirSync(out, { recursive: true });
const raw = fs.readFileSync(root + '/checkpoints/B-before-critical.json', 'utf8');
const result = { scope: 'CONTROLLED_LOAD：同一原封B快照原生增兵至100／200，AI、碰撞、傷害與死亡保留；每案5秒暖機＋30秒牆鐘，ABBA各2次。不是自然戰役、持續全員存活、長測或實體GPU驗證。', resumeSha256: crypto.createHash('sha256').update(raw).digest('hex'), rows: [], errors: [] };
const save = () => fs.writeFileSync(out + '/result.json', JSON.stringify(result, null, 2));
const pct = (a, p) => { a = [...a].sort((x, y) => x - y); return a.length ? a[Math.min(a.length - 1, Math.floor(a.length * p))] : null; };
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml' };
(async () => {
  let browser;
  try {
    browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--no-sandbox', '--enable-precise-memory-info'] });
    result.browser = browser.version(); const cdp = await browser.newBrowserCDPSession(); result.gpu = (await cdp.send('SystemInfo.getInfo')).gpu.devices;
    result.cpuQuota = fs.readFileSync('/sys/fs/cgroup/cpu.max', 'utf8').trim(); result.memoryLimit = fs.readFileSync('/sys/fs/cgroup/memory.max', 'utf8').trim();
    for (const n of [100, 200]) for (const [repeat, mode] of [[1, 'before'], [1, 'after'], [2, 'after'], [2, 'before']]) {
      const source = mode === 'before' ? '1456591db51ee4fb0cf6714ccb5dc6b645a33625' : afterSha;
      const build = mode === 'before' ? root + '/build-core-max-r1' : afterBuild;
      const context = await browser.newContext({ viewport: { width: 1440, height: 900 } }), page = await context.newPage();
      page.on('pageerror', e => result.errors.push({ n, mode, repeat, error: e.message }));
      await page.route('http://127.0.0.1:28128/**', route => {
        const u = new URL(route.request().url()).pathname, f = path.resolve(build, '.' + (u === '/' ? '/index.html' : decodeURIComponent(u)));
        if (!f.startsWith(build + path.sep)) return route.fulfill({ status: 403, body: '' });
        try { return route.fulfill({ status: 200, contentType: mime[path.extname(f)] || 'application/octet-stream', body: fs.readFileSync(f) }); } catch { return route.fulfill({ status: 404, body: '' }); }
      });
      await page.goto('http://127.0.0.1:28128/', { waitUntil: 'networkidle' }); await page.waitForFunction(() => window.ageOfAsh && !document.querySelector('#btn-start').disabled);
      await page.evaluate(raw => localStorage.setItem('riftwatch.playtest.v227.run.v1', raw), raw); await page.reload({ waitUntil: 'networkidle' }); await page.waitForFunction(() => !document.querySelector('#btn-start').disabled);
      const verified = await page.evaluate(() => ({ source: ageOfAsh.playtestBuild.commit, hash: ageOfAsh.playtestBuild.resourceVerification }));
      const count = Object.keys(JSON.parse(fs.readFileSync(build + '/build-metadata.json')).files).length;
      if (verified.source !== source || verified.hash !== `SHA256_MATCH_${count}_FILES`) throw Error('正式來源／資源核對不符');
      await page.locator('#btn-continue').click();
      const setup = await page.evaluate(({ raw, n }) => {
        const g = ageOfAsh.game; g.restore(JSON.parse(raw)); g.start(); g.paused = true; g.autoEconomy = g.autoMilitary = false;
        const b = g.world.base; let attempts = 0;
        while (g.units.filter(u => u.alive).length < n && attempts < 5000) {
          const i = attempts++, x = b.x - 8 + i % 20 * .8, y = b.y - 6 + Math.floor(i / 20) * .8;
          if (y >= g.world.size - 2) break;
          if (!g.isWalkable(x, y, g.hero)) continue;
          g.spawnUnit(['militia', 'archer', 'knight'][i % 3], x, y, i % 3 ? 'player' : 'enemy');
        }
        const s = g.snapshot(); delete s.savedAt;
        const data = { alive: g.units.filter(u => u.alive).length, scene: JSON.stringify(s), rng: g.rng.state, visualRng: g.visualRng.state, attempts };
        g.paused = false; return data;
      }, { raw, n });
      if (setup.alive !== n) throw Error('受限增兵夾具未達指定數量');
      setup.sceneSha256 = crypto.createHash('sha256').update(setup.scene).digest('hex'); delete setup.scene;
      await page.keyboard.press('F2'); await page.locator('#btn-core-defense').click(); await page.waitForTimeout(5000);
      const measured = await page.evaluate(async () => {
        const g = ageOfAsh.game, start = performance.now(), heapStart = performance.memory.usedJSHeapSize, aliveStart = g.units.filter(u => u.alive).length, simStart = g.runTime;
        const frames = [], trace = []; let previous = start;
        const timer = setInterval(() => { const v = ageOfAsh.ui.coreDamageReadback.view(); trace.push({ wallMs: performance.now() - start, alive: g.units.filter(u => u.alive).length, phase: g.phase, hasLoss: !!v, knownLast: !!v?.name, knownPeak: !!v?.peak?.name, actionButtons: [...document.querySelectorAll('.core-source-action')].filter(b => !b.hidden && !b.disabled).length, events: ageOfAsh.ui.coreDamageReadback.diagnostics() }); }, 500);
        await new Promise(resolve => { const frame = now => { frames.push(now - previous); previous = now; if (now - start >= 30000) resolve(); else requestAnimationFrame(frame); }; requestAnimationFrame(frame); });
        clearInterval(timer);
        return { frames, trace, wallMs: performance.now() - start, simStart, simEnd: g.runTime, heapStart, heapEnd: performance.memory.usedJSHeapSize, aliveStart, aliveEnd: g.units.filter(u => u.alive).length, phase: g.phase };
      });
      const { frames, ...data } = measured;
      result.rows.push({ n, repeat, mode, source, verified, ...setup, ...data, samples: frames.length, fps: frames.length / (data.wallMs / 1000), p50Ms: pct(frames, .5), p95Ms: pct(frames, .95), sourceVisibleFraction: data.trace.filter(x => x.knownLast || x.knownPeak).length / data.trace.length });
      save(); await page.screenshot({ path: out + `/${n}-${mode}-${repeat}.png` }); await context.close();
      const brief = result.rows.at(-1); console.log(JSON.stringify(brief, (k, v) => k === 'trace' ? undefined : v));
    }
    result.pairs = [100, 200].flatMap(n => [1, 2].map(repeat => { const a = result.rows.find(r => r.n === n && r.repeat === repeat && r.mode === 'before'), b = result.rows.find(r => r.n === n && r.repeat === repeat && r.mode === 'after'); return { n, repeat, initialSceneEqual: a.sceneSha256 === b.sceneSha256, rngEqual: a.rng === b.rng, visualRngEqual: a.visualRng === b.visualRng }; }));
    result.status = 'MEASURED_ABBA_SHORT_SAMPLES_LIMITED_COVERAGE_NOT_LONG_RUN_CERTIFICATION';
  } catch (e) { result.status = 'FAIL'; result.failure = String(e.stack || e); process.exitCode = 1; }
  finally { await browser?.close(); save(); }
})();
