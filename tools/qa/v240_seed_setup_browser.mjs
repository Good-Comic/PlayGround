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
const arg = name => { const index = args.indexOf(name); return index >= 0 ? args[index + 1] : null; };
const url = arg('--url') || 'http://127.0.0.1:8042/';
const expected = arg('--commit');
const out = resolve(arg('--out') || 'docs/evidence/v240-seed-setup');
if (!expected) throw new Error('Usage: --url <url> --commit <full-sha> --out <directory>');
mkdirSync(out, { recursive: true });

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
const context = await browser.newContext({ viewport: { width: 1600, height: 1000 }, recordVideo: { dir: out, size: { width: 1600, height: 1000 } } });
const page = await context.newPage();
const errors = [], failedRequests = [], httpErrors = [], checks = [], timeline = [];
page.on('console', message => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); });
page.on('pageerror', error => errors.push(`page: ${error.message}`));
page.on('requestfailed', request => failedRequests.push({ url: request.url(), error: request.failure()?.errorText || '' }));
page.on('response', response => { if (response.status() >= 400) httpErrors.push({ url: response.url(), status: response.status() }); });
const check = (name, pass, detail) => checks.push({ name, pass: !!pass, detail });
const state = async () => {
  const snapshot = await page.evaluate(() => {
  const game = window.ageOfAsh?.game;
  return game ? {
    seed: game.seed,
    mapGenerationVersion: game.world?.generationVersion,
    phase: game.phase,
    world: {
      tiles: game.world.tiles.map(tile => tile.terrain),
      resources: game.world.resources.map(node => [node.resource, node.x, node.y, node.amount]),
      camps: game.world.camps.map(camp => [camp.x, camp.y, camp.name]),
    },
  } : null;
  });
  if (!snapshot) return null;
  const signature = createHash('sha256').update(JSON.stringify(snapshot.world)).digest('hex');
  const terrain = Object.fromEntries([...new Set(snapshot.world.tiles)].map(kind => [kind, snapshot.world.tiles.filter(tile => tile === kind).length]));
  return { seed: snapshot.seed, mapGenerationVersion: snapshot.mapGenerationVersion, phase: snapshot.phase, signature, terrain, resources: snapshot.world.resources.length, camps: snapshot.world.camps.length };
};

try {
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.ageOfAsh?.playtestBuild?.resourceVerification === 'SHA256_MATCH_28_FILES');
  const build = await page.evaluate(() => window.ageOfAsh.playtestBuild);
  check('exact immutable 28-file artifact loaded', build.commit === expected && build.resourceVerification === 'SHA256_MATCH_28_FILES', build);

  const initialSeed = await page.locator('#setup-seed').inputValue();
  check('menu is prefilled with a valid visible seed', /^RW-[0-9A-Z]{7}$/.test(initialSeed), initialSeed);
  await page.screenshot({ path: resolve(out, 'generated-seed-menu.png') });

  await page.locator('#setup-seed').fill('PLAYER-240');
  const localeSeeds = {};
  for (const locale of ['zh-Hant', 'zh-Hans', 'ja', 'en']) {
    await page.locator('#setup-locale').selectOption(locale);
    localeSeeds[locale] = await page.locator('#setup-seed').inputValue();
  }
  check('manual seed survives all four locale changes', Object.values(localeSeeds).every(value => value === 'PLAYER-240'), localeSeeds);

  await page.locator('#btn-seed-randomize').click();
  const rerolled = await page.locator('#setup-seed').inputValue();
  check('real reroll control generates another valid seed', /^RW-[0-9A-Z]{7}$/.test(rerolled) && rerolled !== initialSeed, { initialSeed, rerolled });

  await page.locator('#setup-seed').fill('PLAYER-240');
  await page.locator('#setup-civ').selectOption('TEU');
  await page.locator('#setup-biome').selectOption('steppe');
  await page.locator('#btn-start').click();
  await page.waitForFunction(() => window.ageOfAsh?.game && !window.ageOfAsh.game.inMenu);
  const first = await state();
  timeline.push({ label: 'FIRST_NATURAL_START', at: Date.now(), state: first });
  check('manual seed starts a versioned playable map', first.seed === await page.evaluate(() => window.ageOfAsh.seedFromString('PLAYER-240')) && first.mapGenerationVersion === 1, first);

  await page.locator('#btn-pause').click();
  await page.locator('#btn-save').click();
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.ageOfAsh?.playtestBuild?.resourceVerification === 'SHA256_MATCH_28_FILES');
  await page.locator('#btn-continue').click();
  await page.waitForFunction(() => window.ageOfAsh?.game && !window.ageOfAsh.game.inMenu);
  const loaded = await state();
  timeline.push({ label: 'SAVE_RELOAD_CONTINUE', at: Date.now(), state: loaded });
  check('Save Reload Continue preserves seed generation version and frontier', loaded.seed === first.seed && loaded.mapGenerationVersion === first.mapGenerationVersion && loaded.signature === first.signature, { first, loaded });

  await page.locator('#btn-pause').click();
  await page.locator('#btn-quit').click();
  await page.locator('#setup-seed').fill('PLAYER-240');
  await page.locator('#setup-biome').selectOption('steppe');
  await page.locator('#btn-start').click();
  await page.waitForFunction(() => !window.ageOfAsh.game.inMenu);
  const repeated = await state();
  timeline.push({ label: 'REPEATED_NATURAL_START', at: Date.now(), state: repeated });
  check('same manual seed and biome reproduce the same generated frontier', repeated.seed === first.seed && repeated.signature === first.signature, { firstSeed: first.seed, repeatedSeed: repeated.seed, sameSignature: repeated.signature === first.signature });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: resolve(out, 'reproduced-seed-game.png') });

  check('real Chromium produced no Console Page HTTP or request failures', errors.length === 0 && failedRequests.length === 0 && httpErrors.length === 0, { errors, failedRequests, httpErrors });
} catch (error) {
  checks.push({ name: 'browser run completed', pass: false, detail: { message: error.message, stack: error.stack } });
  try { await page.screenshot({ path: resolve(out, 'failure.png') }); } catch {}
}

const result = { stage: 'AFTER_LOCAL', mode: 'NATURAL_UI_SETUP_AND_SAVELOAD', source_commit: expected, url, checks, errors, failedRequests, httpErrors, timeline, pass: checks.length > 0 && checks.every(item => item.pass) };
writeFileSync(resolve(out, 'browser.json'), JSON.stringify(result, null, 2) + '\n');
writeFileSync(resolve(out, 'timeline.json'), JSON.stringify(timeline, null, 2) + '\n');
const video = page.video();
await context.close();
if (video) copyFileSync(await video.path(), resolve(out, 'seed-setup.webm'));
await browser.close();
console.log(JSON.stringify({ pass: result.pass, checks: checks.map(item => [item.name, item.pass]), out }, null, 2));
if (!result.pass) process.exit(1);
