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
    for (const n of [200]) for (const [repeat, mode] of [[1, 'after']]) {
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
      const measured = await page.evaluate(() => {
        const g=ageOfAsh.game,r=ageOfAsh.renderer,wasPaused=g.paused;g.paused=true;
        const snapshot=()=>{const s=g.snapshot();delete s.savedAt;return JSON.stringify(s)};
        const beforeState=snapshot();
        const sources=[...g.units,...g.buildings].filter(e=>e.alive&&e.team==='player').map(e=>({e,x:e.x+(e.w||0)/2,y:e.y+(e.h||0)/2,r:g.sightRadius(e)}));
        const origin=r.screen(g,0,0),one=r.screen(g,1,0),minor=Math.SQRT2*Math.abs(one.y-origin.y),margin=2/minor;
        const retained=sources.filter((s,i)=>!sources.some((q,j)=>j!==i&&q.r>s.r+margin&&Math.hypot(q.x-s.x,q.y-s.y)+s.r<=q.r-margin));
        const kept=new Set(retained.map(s=>s.e));const facade=Object.create(g);facade.units=g.units.filter(e=>kept.has(e));facade.buildings=g.buildings.filter(e=>kept.has(e));facade.sightRadius=g.sightRadius.bind(g);
        const canvas=document.createElement('canvas');canvas.width=r.w;canvas.height=r.h;const ctx=canvas.getContext('2d');const saved=r.ctx;r.ctx=ctx;
        try{
          r.drawVisibility(g);const original=r.visionLayer.getContext('2d').getImageData(0,0,r.w,r.h).data;
          r.drawVisibility(facade);const pruned=r.visionLayer.getContext('2d').getImageData(0,0,r.w,r.h).data;
          let differentBytes=0,maxDifference=0;for(let i=0;i<original.length;i++){if(original[i]!==pruned[i])differentBytes++;maxDifference=Math.max(maxDifference,Math.abs(original[i]-pruned[i]));}
          const measurements=[];for(const mode of ['before','after','after','before','before','after']){const start=performance.now();for(let i=0;i<10;i++){ctx.clearRect(0,0,r.w,r.h);r.drawVisibility(mode==='before'?g:facade);}ctx.getImageData(0,0,1,1);measurements.push({mode,draws:10,wallMs:performance.now()-start});}
          return{classification:'CONTROLLED_FROZEN_VISIBILITY_ONLY_PROTOTYPE_NOT_GAME_FPS',sources:sources.length,retained:retained.length,marginCssPixels:2,differentBytes,maxDifference,measurements,gameSnapshotUnchanged:beforeState===snapshot(),rng:g.rng.state,visualRng:g.visualRng.state};
        }finally{r.ctx=saved;g.paused=wasPaused;}
      });
      result.rows.push({n,source,verified,...setup,...measured});
      save(); await page.screenshot({ path: out + `/${n}-${mode}-${repeat}.png` }); await context.close();
      const brief = result.rows.at(-1); console.log(JSON.stringify(brief, (k, v) => k === 'trace' ? undefined : v));
    }
    result.pairs = [];
    result.status = 'MASK_PRUNING_READ_ONLY_PROTOTYPE_NOT_PRODUCTION_OR_FPS_CERTIFICATION';
  } catch (e) { result.status = 'FAIL'; result.failure = String(e.stack || e); process.exitCode = 1; }
  finally { await browser?.close(); save(); }
})();
