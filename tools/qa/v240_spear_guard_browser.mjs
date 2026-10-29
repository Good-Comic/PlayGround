// New migration-era QA. Explicit controlled scenes, never natural-campaign acceptance.
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync, copyFileSync } from 'node:fs';
const { chromium } = createRequire(import.meta.url)('playwright-core');
const [url, source, out] = process.argv.slice(2);
if (!url?.startsWith('http://127.0.0.1:') || !/^[a-f0-9]{40}$/.test(source || '') || !out) throw Error('Local exact-commit URL, full SHA and output directory required');
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, recordVideo: { dir: out, size: { width: 1440, height: 900 } } });
const page = await context.newPage(), checks = [], errors = [], network = [], snapshots = [];
const check = (name, pass, detail) => checks.push({ name, pass: !!pass, detail });
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
page.on('requestfailed', r => network.push({ url: r.url(), error: r.failure()?.errorText }));
page.on('response', r => { if (r.status() >= 400) network.push({ url: r.url(), status: r.status() }); });
try {
  await page.goto(url);
  await page.waitForFunction(() => /^SHA256_MATCH_\d+_FILES$/.test(window.ageOfAsh?.playtestBuild?.resourceVerification || ''));
  const metadata = await page.evaluate(() => ageOfAsh.playtestBuild);
  check('exact committed payload verified', metadata.commit === source, metadata);
  await page.locator('#setup-seed').fill('MIGRATION-SPEAR-GUARD');
  await page.locator('#btn-start').click();
  await page.waitForFunction(() => ['spearman', 'guard'].every(type => ageOfAsh.renderer.unitSpriteAtlases.get(type)?.ready));
  await page.evaluate(async () => { window.atlasAPI = await import('./js/sprite-atlas.js'); });
  // Check actual decoded pixels, including transparent gutters around every frame.
  const sheets = await page.evaluate(() => ['spearman', 'guard'].map(type => {
    const e = ageOfAsh.renderer.unitSpriteAtlases.get(type), c = document.createElement('canvas');
    c.width = e.image.naturalWidth; c.height = e.image.naturalHeight;
    const ctx = c.getContext('2d', { willReadFrequently: true }); ctx.drawImage(e.image, 0, 0);
    const pixels = ctx.getImageData(0, 0, c.width, c.height).data, failures = [];
    for (let row = 0; row < 5; row++) for (let col = 0; col < 32; col++) {
      let ink = 0, border = 0;
      for (let y = 0; y < 112; y++) for (let x = 0; x < 128; x++) {
        const a = pixels[((row * 112 + y) * c.width + col * 128 + x) * 4 + 3];
        if (a) { ink++; if (x === 0 || x === 127 || y === 0 || y === 111) border++; }
      }
      if (ink < 100 || border) failures.push({ row, col, ink, border });
    }
    return { type, width: c.width, height: c.height, failures };
  }));
  check('320 decoded frames have visible artwork and no edge clipping', sheets.every(x => x.width === 4096 && x.height === 560 && !x.failures.length), sheets);
  for (const type of ['spearman', 'guard']) {
    await page.evaluate(type => {
      const g = ageOfAsh.game, r = ageOfAsh.renderer;
      g.paused = true; g.phase = 'prep'; g.prepTimer = 1e6; g.units = []; g.selection = [];
      g.world.resources = []; g.world.props = []; g.world.wildlife = [];
      for (const t of g.world.tiles) t.terrain = 'grass'; r.terrainKey = '';
      window.actor = g.spawnUnit(type, 29, 33);
      window.reference = g.spawnUnit(type === 'spearman' ? 'guard' : 'spearman', 32, 33); reference.hold = true;
      g.focusAt(29, 33); g.camera.x = g.camera.targetX; g.camera.y = g.camera.targetY; g.camera.zoom = g.camera.targetZoom = 2;
      // Install once; the wrapper observes the current actor through window.actor.
      if (!window.atlasObserved) {
        const draw = r.drawSpriteAtlasUnit.bind(r);
        r.drawSpriteAtlasUnit = (u, p, s, v, t) => {
          if (u === window.actor) {
            visualStates[v.state] = (visualStates[v.state] || 0) + 1;
            if (v.state === 'attack') {
              const f = atlasAPI.atlasFrame(r.unitSpriteAtlases.get(u.type).descriptor, v.direction, v.state, t, atlasAPI.atlasActionProgress(u, v.state)).frame;
              if (!attackFrames.includes(f)) attackFrames.push(f);
            }
          }
          return draw(u, p, s, v, t);
        }; window.atlasObserved = true;
      }
      window.visualStates = {}; window.attackFrames = [];
    }, type);
    for (const direction of ['E', 'SE', 'S', 'SW', 'W', 'NW', 'N', 'NE']) {
      await page.evaluate(d => { actor.visualDirection = d; actor.state = 'move'; }, direction);
      await page.waitForTimeout(80); await page.screenshot({ path: `${out}/${type}-${direction}.png` });
    }
    for (const zoom of [.8, 1.4, 2]) {
      await page.evaluate(z => { ageOfAsh.game.camera.zoom = ageOfAsh.game.camera.targetZoom = z; actor.state = 'idle'; }, zoom);
      await page.waitForTimeout(100); await page.screenshot({ path: `${out}/${type}-zoom-${zoom}.png` });
    }
    await page.evaluate(() => {
      const g = ageOfAsh.game; g.camera.zoom = g.camera.targetZoom = 2;
      actor.state = 'idle'; actor.hold = false; g.selection = [actor]; actor.selected = true;
      const p = ageOfAsh.renderer.screen(g, 33, 35); g.issueCommand(p.x, p.y);
      window.startPosition = { x: actor.x, y: actor.y }; g.paused = false;
    });
    await page.waitForFunction(() => Math.hypot(actor.x - startPosition.x, actor.y - startPosition.y) > 1, null, { timeout: 12000 });
    const move = await page.evaluate(() => ({ start: startPosition, end: { x: actor.x, y: actor.y }, seen: { ...visualStates } }));
    check(`${type}: production move and walk presentation`, move.seen.walk > 0, move);
    const point = await page.evaluate(() => {
      const g = ageOfAsh.game; window.enemy = g.spawnUnit('brute', actor.x + 1, actor.y, 'enemy');
      window.enemyStartHP = enemy.hp; reference.hold = true; g.selection = [actor];
      const p = ageOfAsh.renderer.screen(g, enemy.x, enemy.y); return { x: p.x, y: p.y - 18 * g.camera.zoom };
    });
    await page.mouse.click(point.x, point.y, { button: 'right' });
    await page.waitForFunction(() => visualStates.attack > 0 && enemy.hp < enemyStartHP, null, { timeout: 15000 });
    await page.waitForFunction(() => attackFrames.length === 4, null, { timeout: 6000 });
    await page.screenshot({ path: `${out}/${type}-combat.png` });
    const combat = await page.evaluate(() => ({ hp: actor.hp, enemyHP: enemy.hp, enemyStartHP, attackFrames: [...attackFrames], seen: { ...visualStates }, time: ageOfAsh.game.time }));
    snapshots.push({ type, combat }); check(`${type}: native right-click combat and four attack frames`, combat.enemyHP < combat.enemyStartHP && combat.attackFrames.length === 4, combat);
    await page.evaluate(() => { ageOfAsh.game.applyDamage(actor, 1, enemy); ageOfAsh.game.paused = true; });
    await page.waitForTimeout(100); await page.screenshot({ path: `${out}/${type}-hit.png` });
    check(`${type}: production hit presentation`, await page.evaluate(() => visualStates.hit > 0));
    await page.evaluate(() => { ageOfAsh.game.killEntity(actor, enemy); actor.deathAnim = .5; });
    await page.waitForTimeout(100); await page.screenshot({ path: `${out}/${type}-death.png` });
    check(`${type}: production death presentation`, await page.evaluate(() => !actor.alive && visualStates.death > 0));
    const fallback = await page.evaluate(() => {
      const r = ageOfAsh.renderer, e = r.unitSpriteAtlases.get(actor.type); e.failed = true;
      const used = r.drawSpriteAtlasUnit(actor, { x: 300, y: 300 }, 1, { state: 'idle', direction: 'E' }, 0);
      e.failed = false; return used;
    });
    check(`${type}: missing asset permits procedural fallback`, fallback === false);
  }
  const perf = await page.evaluate(() => {
    const g = ageOfAsh.game, r = ageOfAsh.renderer; g.paused = true; g.units = [];
    for (let i = 0; i < 100; i++) g.spawnUnit(i % 2 ? 'spearman' : 'guard', 20 + i % 10, 20 + Math.floor(i / 10));
    g.camera.zoom = g.camera.targetZoom = 1.4; const runs = [];
    for (let repeat = 0; repeat < 3; repeat++) for (const mode of (repeat % 2 ? ['atlas', 'fallback'] : ['fallback', 'atlas'])) {
      for (const type of ['spearman', 'guard']) r.unitSpriteAtlases.get(type).failed = mode === 'fallback';
      for (let j = 0; j < 20; j++) r.draw(g, 0);
      const samples = []; for (let j = 0; j < 80; j++) { const start = performance.now(); r.draw(g, 0); samples.push(performance.now() - start); }
      samples.sort((a, b) => a - b); runs.push({ repeat, mode, samples, mean: samples.reduce((a, b) => a + b, 0) / samples.length, p50: samples[39], p95: samples[75] });
    }
    for (const type of ['spearman', 'guard']) r.unitSpriteAtlases.get(type).failed = false;
    return runs;
  });
  writeFileSync(`${out}/render-samples.json`, JSON.stringify(perf, null, 2));
  check('100-unit static renderer JS budget and paired medians', perf.filter(x => x.mode === 'atlas').every(x => x.mean <= 33.3 && x.p95 <= 50 && x.p50 <= perf.find(y => y.repeat === x.repeat && y.mode === 'fallback').p50 * 1.2), perf.map(({ samples, ...x }) => x));
  check('no page console or resource errors', errors.length === 0 && network.length === 0, { errors, network });
} catch (e) {
  check('browser execution', false, { message: e.message, stack: e.stack });
  await page.screenshot({ path: `${out}/failure.png` }).catch(() => {});
} finally {
  const video = page.video(); await context.close();
  if (video) copyFileSync(await video.path(), `${out}/browser.webm`);
  await browser.close();
}
const result = { mode: 'AFTER_LOCAL_CONTROLLED_FIXTURE_NOT_NATURAL_PLAY', source_commit: source, seed: 'MIGRATION-SPEAR-GUARD', browser: 'Chromium', checks, errors, network, snapshots, pass: checks.length > 0 && checks.every(x => x.pass) };
writeFileSync(`${out}/browser.json`, JSON.stringify(result, null, 2));
console.log(JSON.stringify({ pass: result.pass, checks: checks.map(({ name, pass }) => ({ name, pass })) }));
if (!result.pass) process.exitCode = 1;
