import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const require = createRequire(import.meta.url);
const candidates = [process.env.PLAYWRIGHT_CORE, 'playwright-core', `${process.env.HOME}/.local/share/omgithub-playwright/node_modules/playwright-core`].filter(Boolean);
let chromium;
for (const candidate of candidates) { try { ({ chromium } = require(candidate)); break; } catch {} }
if (!chromium) throw new Error('playwright-core not found');

const args = process.argv.slice(2);
const arg = name => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null; };
const url = arg('--url') || 'http://127.0.0.1:8025/';
const expected = arg('--commit');
const out = resolve(arg('--out') || 'docs/evidence/v233-visual-silhouettes');
mkdirSync(out, { recursive: true });

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
const errors = [], failedRequests = [], checks = [];
page.on('console', message => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); });
page.on('pageerror', error => errors.push(`page: ${error.message}`));
page.on('requestfailed', request => failedRequests.push({ url: request.url(), error: request.failure()?.errorText || '' }));
const check = (name, pass, detail) => checks.push({ name, pass: !!pass, detail });

try {
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !document.querySelector('#btn-start')?.disabled);
  const metadata = await page.evaluate(async () => (await fetch('build-metadata.json')).json());
  const build = await page.evaluate(() => window.ageOfAsh?.playtestBuild);
  check('exact immutable 28-file artifact loaded', metadata.commit === expected && Object.keys(metadata.files).length === 28 && build?.commit === expected && build?.resourceVerification === 'SHA256_MATCH_28_FILES', { metadataCommit: metadata.commit, runtimeCommit: build?.commit, files: Object.keys(metadata.files).length, verification: build?.resourceVerification });

  await page.fill('#setup-seed', 'v233-visual-silhouettes');
  await page.click('#btn-start');
  await page.waitForFunction(() => window.ageOfAsh?.game && !window.ageOfAsh.game.inMenu);
  const fixture = await page.evaluate(() => {
    const { game } = window.ageOfAsh;
    game.paused = true;
    game.units = [];
    game.buildings = [];
    game.projectiles = [];
    game.particles = [];
    game.selection = [];
    const specs = [
      ['archer', 24.0, 25.0], ['skirmisher', 26.5, 25.0], ['chu_ko_nu', 29.0, 25.0],
      ['militia', 24.0, 28.5], ['guard', 27.0, 28.5],
      ['knight', 23.5, 32.0], ['light_cavalry', 27.0, 32.0], ['horse_archer', 30.5, 32.0],
    ];
    const units = specs.map(([type, x, y]) => game.spawnUnit(type, x, y, 'player'));
    units.forEach(unit => { unit.state = 'idle'; unit.attackAnim = 0.45; unit.walkPhase = 0.35; });
    game.focusAt(27.2, 28.4);
    game.camera.x = game.camera.targetX;
    game.camera.y = game.camera.targetY;
    game.camera.zoom = game.camera.targetZoom = 1.7;
    return units.map(unit => ({ id: unit.id, type: unit.type, x: unit.x, y: unit.y }));
  });
  await page.waitForTimeout(400);
  await page.screenshot({ path: resolve(out, 'battlefield-silhouettes.png') });

  const sampleHashes = {};
  for (const unit of fixture) {
    const point = await page.evaluate(id => { const { game, renderer } = window.ageOfAsh; const unit = game.units.find(entry => entry.id === id); return renderer.screen(game, unit.x, unit.y); }, unit.id);
    const clip = { x: Math.max(0, point.x - 50), y: Math.max(0, point.y - 78), width: 100, height: 90 };
    const bytes = await page.screenshot({ clip });
    sampleHashes[unit.type] = createHash('sha256').update(bytes).digest('hex');
  }
  check('all eight production unit drawings have distinct raster samples', new Set(Object.values(sampleHashes)).size === fixture.length, sampleHashes);

  const liveMove = await page.evaluate(() => {
    const game = window.ageOfAsh.game;
    const actor = game.units.find(unit => unit.type === 'light_cavalry');
    game.paused = false;
    game.setSelection([actor]);
    game.commandMove([actor], 34, 31);
    return { id: actor.id, startX: actor.x, startY: actor.y };
  });
  await page.waitForTimeout(1200);
  const moved = await page.evaluate(id => { const unit = window.ageOfAsh.game.units.find(entry => entry.id === id); return { x: unit.x, y: unit.y, state: unit.state }; }, liveMove.id);
  check('visually updated cavalry remains a live movable gameplay unit', Math.hypot(moved.x - liveMove.startX, moved.y - liveMove.startY) > 0.5, { before: liveMove, after: moved });
  check('real Chromium produced no Console, Page, or failed-request errors', errors.length === 0 && failedRequests.length === 0, { errors, failedRequests });
} catch (error) {
  checks.push({ name: 'browser run completed', pass: false, detail: { message: error.message, stack: error.stack } });
}

const result = { stage: 'AFTER_LOCAL', source_commit: expected, url, fixture: 'Explicit visual gallery using production spawnUnit and renderer; local Chromium only', checks, errors, failedRequests, pass: checks.length > 0 && checks.every(item => item.pass) };
writeFileSync(resolve(out, 'browser.json'), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result, null, 2));
await browser.close();
if (!result.pass) process.exit(1);
