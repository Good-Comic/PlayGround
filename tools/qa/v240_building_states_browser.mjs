import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const require = createRequire(import.meta.url);
const candidates = [process.env.PLAYWRIGHT_CORE, 'playwright-core', `${process.env.HOME}/.local/share/omgithub-playwright/node_modules/playwright-core`].filter(Boolean);
let chromium;
for (const candidate of candidates) { try { ({ chromium } = require(candidate)); break; } catch {} }
if (!chromium) throw new Error('playwright-core not found');

const args = process.argv.slice(2);
const arg = name => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null; };
const url = arg('--url') || 'http://127.0.0.1:8040/';
const expected = arg('--commit');
const out = resolve(arg('--out') || 'docs/evidence/v240-building-states');
if (!expected) throw new Error('Usage: --url <task-local-url> --commit <full-sha> --out <directory>');
mkdirSync(out, { recursive: true });

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
const context = await browser.newContext({ viewport: { width: 1600, height: 1000 }, recordVideo: { dir: out, size: { width: 1600, height: 1000 } } });
const page = await context.newPage();
const errors = [], failedRequests = [], checks = [], timeline = [];
page.on('console', message => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); });
page.on('pageerror', error => errors.push(`page: ${error.message}`));
page.on('requestfailed', request => failedRequests.push({ url: request.url(), error: request.failure()?.errorText || '' }));
const check = (name, pass, detail) => checks.push({ name, pass: !!pass, detail });
const record = async label => timeline.push({ wall_ms: Date.now(), label, state: await page.evaluate(() => ({ seed: window.ageOfAsh?.game?.seed, phase: window.ageOfAsh?.game?.phase, buildings: window.ageOfAsh?.game?.buildings?.map(b => ({ id: b.id, type: b.type, alive: b.alive, construction: b.construction, hp: b.hp, maxHp: b.maxHp })) || [] })) });

let video;
try {
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !document.querySelector('#btn-start')?.disabled, null, { timeout: 15000 });
  const metadata = await page.evaluate(async () => (await fetch('/__qa_build.json')).json());
  check('exact clean source snapshot loaded', metadata.commit === expected && metadata.dirty === false, metadata);
  await page.selectOption('#setup-civ', 'TEU');
  await page.fill('#setup-seed', 'v240-building-states');
  await page.click('#btn-start');
  await page.waitForFunction(() => window.ageOfAsh?.game && !window.ageOfAsh.game.inMenu, null, { timeout: 15000 });
  await record('NATURAL_START_THROUGH_HOME_UI');
  check('real Start reaches a playable game before fixture setup', await page.evaluate(() => !window.ageOfAsh.game.inMenu && window.ageOfAsh.game.buildings.some(b => b.type === 'core' && b.alive)), await page.evaluate(() => ({ seed: window.ageOfAsh.game.seed, buildings: window.ageOfAsh.game.buildings.length })));

  const fixture = await page.evaluate(() => {
    const { game } = window.ageOfAsh;
    game.paused = true;
    game.units = [];
    game.buildings = [];
    game.selection = [];
    game.world.resources = [];
    game.world.props = [];
    game.world.wildlife = [];
    for (const tile of game.world.tiles) tile.terrain = 'grass';
    const core = game.addBuilding('core', 17, 17, true);
    const barracks = game.addBuilding('barracks', 25, 18, true); barracks.hp = barracks.maxHp * 0.62;
    const range = game.addBuilding('range', 17, 26, true); range.hp = range.maxHp * 0.28;
    const stable = game.addBuilding('stable', 25, 26, false); stable.construction = 0.68; stable.hp = stable.maxHp * 0.68;
    const tower = game.addBuilding('tower', 33, 22, true); tower.hp = 0; tower.alive = false;
    game.focusAt(25, 23);
    game.camera.x = game.camera.targetX;
    game.camera.y = game.camera.targetY;
    game.camera.zoom = game.camera.targetZoom = 1.15;
    window.ageOfAsh.renderer.terrainKey = '';
    return [core, barracks, range, stable, tower].map(b => ({ id: b.id, type: b.type, alive: b.alive, construction: b.construction, hp: b.hp, maxHp: b.maxHp }));
  });
  await page.waitForTimeout(900);
  await record('CONTROLLED_FIXTURE_RENDERED');
  await page.screenshot({ path: resolve(out, 'building-states.png') });

  const hashes = {};
  for (const building of fixture) {
    const point = await page.evaluate(id => { const { game, renderer } = window.ageOfAsh; const b = game.buildings.find(entry => entry.id === id); return renderer.screen(game, b.x + b.w / 2, b.y + b.h / 2); }, building.id);
    const clip = { x: Math.max(0, point.x - 105), y: Math.max(0, point.y - 165), width: 210, height: 190 };
    const bytes = await page.screenshot({ clip });
    hashes[`${building.type}:${building.alive ? 'alive' : 'ruined'}`] = createHash('sha256').update(bytes).digest('hex');
  }
  check('complete damaged critical construction and ruin presentations are distinct', new Set(Object.values(hashes)).size === fixture.length, { fixture, hashes });
  check('ruined tower remains visible as battlefield rubble without becoming alive', await page.evaluate(() => { const b = window.ageOfAsh.game.buildings.find(entry => entry.type === 'tower'); return !!b && !b.alive; }), fixture.find(b => b.type === 'tower'));
  check('real Chromium produced no Console Page or request errors', errors.length === 0 && failedRequests.length === 0, { errors, failedRequests });
} catch (error) {
  checks.push({ name: 'browser run completed', pass: false, detail: { message: error.message, stack: error.stack } });
  try { await page.screenshot({ path: resolve(out, 'failure.png') }); } catch {}
}

const result = { stage: 'AFTER_LOCAL', mode: 'REAL_UI_START_THEN_CONTROLLED_FIXTURE', source_commit: expected, url, checks, errors, failedRequests, timeline, pass: checks.length > 0 && checks.every(item => item.pass) };
writeFileSync(resolve(out, 'browser.json'), JSON.stringify(result, null, 2) + '\n');
writeFileSync(resolve(out, 'timeline.json'), JSON.stringify(timeline, null, 2) + '\n');
video = page.video();
await context.close();
if (video) copyFileSync(await video.path(), resolve(out, 'building-states.webm'));
await browser.close();
console.log(JSON.stringify({ pass: result.pass, checks: checks.map(item => [item.name, item.pass]), video: 'building-states.webm', out }, null, 2));
if (!result.pass) process.exit(1);
