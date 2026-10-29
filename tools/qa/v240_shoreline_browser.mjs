// Native generated maps; explicitly controlled pause/camera, not campaign acceptance.
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync, copyFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const { chromium } = createRequire(import.meta.url)('playwright-core');
const [url, source, out] = process.argv.slice(2);
if (!url?.startsWith('http://127.0.0.1:') || !/^[a-f0-9]{40}$/.test(source || '') || !out) throw Error('Local exact-commit URL, full SHA and output directory required');
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, recordVideo: { dir: out, size: { width: 1440, height: 900 } } });
const checks = [], errors = [], videos = [];
const check = (name, pass, detail) => { checks.push({ name, pass: !!pass, detail }); if (!pass) throw Error(name); };
let page;
try {
  for (const biome of ['river', 'fjord', 'island', 'ash']) {
    page = await context.newPage();
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('requestfailed', r => errors.push(r.url() + ': ' + r.failure()?.errorText));
    page.on('response', r => { if (r.status() >= 400) errors.push(r.url() + ': ' + r.status()); });
    await page.goto(url);
    await page.waitForFunction(() => /^SHA256_MATCH_\d+_FILES$/.test(window.ageOfAsh?.playtestBuild?.resourceVerification || ''));
    check(`${biome}: exact payload`, await page.evaluate(s => ageOfAsh.playtestBuild.commit === s, source));
    await page.locator('#setup-seed').fill('MIGRATION-SHORELINE');
    await page.locator('#setup-biome').selectOption(biome);
    await page.locator('#btn-start').click();
    await page.waitForFunction(() => !ageOfAsh.game.inMenu);
    const observation = await page.evaluate(async () => {
      const { waterBankEdges } = await import('./js/renderer.js');
      const g = ageOfAsh.game, r = ageOfAsh.renderer; g.paused = true;
      const banks = g.world.tiles.flatMap((t, i) => {
        const x = i % g.world.size, y = Math.floor(i / g.world.size);
        return waterBankEdges(g.world, x, y).length ? [{ x, y }] : [];
      });
      banks.sort((a, b) => Math.hypot(a.x - g.world.base.x, a.y - g.world.base.y) - Math.hypot(b.x - g.world.base.x, b.y - g.world.base.y));
      if (!banks.length) throw Error('No real shoreline in generated map');
      const target = banks[0]; g.focusAt(target.x, target.y);
      g.camera.x = g.camera.targetX; g.camera.y = g.camera.targetY; g.camera.zoom = g.camera.targetZoom = 1.7;
      window.originalWaterBanks = r.drawWaterBanks.bind(r);
      window.worldBeforeBanks = JSON.stringify(g.world);
      r.drawWaterBanks = () => {}; r.terrainKey = ''; r.draw(g, 0);
      return { target, bankTiles: banks.length, seed: g.seed, generationVersion: g.world.generationVersion, terrainBefore: r.terrainLayer.toDataURL() };
    });
    await page.screenshot({ path: `${out}/${biome}-before.png` });
    const after = await page.evaluate(() => {
      const g = ageOfAsh.game, r = ageOfAsh.renderer;
      window.bankDrawCalls = 0;
      r.drawWaterBanks = (...args) => { bankDrawCalls++; originalWaterBanks(...args); };
      r.terrainKey = ''; r.draw(g, 0); const rebuiltCalls = bankDrawCalls;
      bankDrawCalls = 0; for (let i = 0; i < 30; i++) r.drawTerrain(g, 0);
      return { unchangedWorld: JSON.stringify(g.world) === worldBeforeBanks, rebuiltCalls, cachedCalls: bankDrawCalls, terrainAfter: r.terrainLayer.toDataURL() };
    });
    await page.screenshot({ path: `${out}/${biome}-after.png` });
    const digest = value => createHash('sha256').update(value).digest('hex');
    check(`${biome}: visible shoreline changes without world mutation`, after.unchangedWorld && digest(observation.terrainBefore) !== digest(after.terrainAfter), { ...observation, terrainBefore: digest(observation.terrainBefore), terrainAfter: digest(after.terrainAfter), unchangedWorld: after.unchangedWorld });
    check(`${biome}: banks baked once and reused for30frames`, after.rebuiltCalls > 0 && after.cachedCalls === 0, { rebuiltCalls: after.rebuiltCalls, cachedCalls: after.cachedCalls });
    videos.push(page.video()); await page.close();
  }
  check('no console page or resource errors', errors.length === 0, errors);
} catch (e) {
  checks.push({ name: 'browser execution', pass: false, detail: { message: e.message, stack: e.stack } });
  await page?.screenshot({ path: `${out}/failure.png` }).catch(() => {});
  if (page && !page.isClosed()) videos.push(page.video());
} finally {
  await context.close();
  for (let i = 0; i < videos.length; i++) if (videos[i]) copyFileSync(await videos[i].path(), `${out}/shoreline-${i}.webm`);
  await browser.close();
}
const result = { source_commit: source, mode: 'LOCAL_NATIVE_MAPS_CONTROLLED_CAMERA_PAUSE', seed: 'MIGRATION-SHORELINE', checks, errors, pass: checks.length > 0 && checks.every(x => x.pass) };
writeFileSync(`${out}/browser.json`, JSON.stringify(result, null, 2));
console.log(JSON.stringify({ pass: result.pass, checks: checks.map(({ name, pass }) => ({ name, pass })) }));
if (!result.pass) process.exitCode = 1;
