import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import pixelmatch from 'pixelmatch';
import {PNG} from 'pngjs';
import {chromium} from 'playwright-core';

const args = Object.fromEntries(process.argv.slice(2).reduce((pairs, value, index, all) => {
  if (value.startsWith('--')) pairs.push([value.slice(2), all[index + 1]]);
  return pairs;
}, []));
const required = ['url', 'browser', 'out', 'result'];
if (required.some(key => !args[key])) throw new Error('missing quality runner argument');
fs.mkdirSync(args.out, {recursive: true});
const successScreenshot = path.join(args.out, 'success.png');
const failureScreenshot = path.join(args.out, 'failure.png');
const result = {
  status: 'failed', console_errors: [], page_errors: [], load_failures: [], metrics: {},
  visual: {status: args.baseline ? 'pending' : 'no_baseline'}, success_screenshot: '',
  failure_screenshot: '', log: '',
};
let browser;
let context;
let page;
let cdp;
const started = performance.now();

async function captureScreenshot(target) {
  const capture = cdp.send('Page.captureScreenshot', {format: 'png', fromSurface: true});
  const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('CDP screenshot timed out')), 10000));
  const image = await Promise.race([capture, timeout]);
  fs.writeFileSync(target, Buffer.from(image.data, 'base64'));
}

function resolveCdpEndpoint(endpoint) {
  return new Promise((resolve, reject) => {
    const target = new URL('/json/version', endpoint);
    const request = http.get(target, {headers: {Host: 'localhost'}}, response => {
      let body = '';
      response.setEncoding('utf8');
      response.on('data', chunk => { body += chunk; });
      response.on('end', () => {
        try {
          const advertised = JSON.parse(body).webSocketDebuggerUrl;
          const origin = new URL(endpoint);
          resolve(advertised.replace(/^ws:\/\/localhost(?::\d+)?\//, `ws://${origin.host}/`));
        } catch (error) { reject(error); }
      });
    });
    request.on('error', reject);
  });
}

function compareImages(baselinePath, candidatePath) {
  const baseline = PNG.sync.read(fs.readFileSync(baselinePath));
  const candidate = PNG.sync.read(fs.readFileSync(candidatePath));
  if (baseline.width !== candidate.width || baseline.height !== candidate.height) {
    return {status: 'failed', reason: 'dimensions_changed', ratio: 1};
  }
  const diff = new PNG({width: baseline.width, height: baseline.height});
  const pixels = pixelmatch(baseline.data, candidate.data, diff.data, baseline.width, baseline.height, {threshold: 0.2});
  fs.writeFileSync(path.join(args.out, 'visual-diff.png'), PNG.sync.write(diff));
  const ratio = pixels / (baseline.width * baseline.height);
  return {status: ratio <= 0.01 ? 'passed' : 'failed', changed_pixels: pixels, ratio, threshold: 0.01};
}

try {
  browser = await chromium.connectOverCDP(await resolveCdpEndpoint(args.browser), {headers: {Host: 'localhost'}});
  context = await browser.newContext({viewport: {width: 1440, height: 900}, serviceWorkers: 'block'});
  await context.addInitScript(() => {
    let state = 0x5f3759df;
    Math.random = () => {
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
      return state / 0x100000000;
    };
  });
  page = await context.newPage();
  cdp = await context.newCDPSession(page);
  page.on('console', message => { if (message.type() === 'error') result.console_errors.push(message.text()); });
  page.on('pageerror', error => result.page_errors.push(error.message));
  page.on('requestfailed', request => result.load_failures.push(`${request.method()} ${request.url()}: ${request.failure()?.errorText || 'failed'}`));

  const response = await page.goto(args.url, {waitUntil: 'networkidle', timeout: 20000});
  if (!response || response.status() !== 200) throw new Error(`game load returned ${response?.status() || 'no response'}`);
  await page.waitForFunction(() => window.ageOfAsh?.game && document.querySelector('#btn-start'), null, {timeout: 10000});
  const navigation = await page.evaluate(() => {
    const entry = performance.getEntriesByType('navigation')[0];
    return {dom_content_loaded_ms: entry.domContentLoadedEventEnd, load_ms: entry.loadEventEnd, transfer_bytes: entry.transferSize};
  });
  const fps = await page.evaluate(() => new Promise(resolve => {
    let frames = 0;
    const begin = performance.now();
    const tick = now => {
      frames += 1;
      if (now - begin >= 1000) resolve({frames, duration_ms: now - begin, fps: frames * 1000 / (now - begin)});
      else requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }));

  const expectedTitles = {
    en: 'Age of Empires II: Riftwatch',
    'zh-Hant': '世紀帝國二：裂境守望',
    'zh-Hans': '世纪帝国二：裂境守望',
    ja: 'エイジ オブ エンパイア II：裂境の守り',
  };
  const translations = [];
  for (const [locale, expected] of Object.entries(expectedTitles)) {
    await page.selectOption('#setup-locale', locale);
    const title = await page.title();
    if (title !== expected) throw new Error(`title mismatch for ${locale}: ${title}`);
    translations.push({locale, title});
  }
  await page.selectOption('#setup-locale', 'en');
  for (const selector of ['#btn-start', '#setup-locale', '#objective-waves']) {
    if (!await page.locator(selector).count()) throw new Error(`major UI missing: ${selector}`);
  }
  await captureScreenshot(successScreenshot);
  const interactionStarted = performance.now();
  await page.click('#btn-start');
  await page.waitForFunction(() => window.ageOfAsh.game.inMenu === false, null, {timeout: 5000});
  const interactionLatency = performance.now() - interactionStarted;
  const traversal = await page.evaluate(() => {
    const game = window.ageOfAsh.game;
    const initial = {
      phase: game.phase, director: game.director?.constructor?.name,
      player_units: game.units.filter(unit => unit.alive && unit.team === 'player').length,
      buildings: game.buildings.filter(building => building.alive && building.team === 'player').length,
      objective: document.querySelector('#objective-waves')?.textContent?.trim(),
    };
    if (initial.director !== 'NemesisDirector') throw new Error(`unexpected director ${initial.director}`);
    const waves = [];
    for (let index = 0; index < 10; index += 1) {
      if (game.phase !== 'prep' || game.pendingWavePlan?.waveIndex !== index) throw new Error(`invalid prep ${index + 1}`);
      waves.push({wave: index + 1, units: game.pendingWavePlan.totalUnits, event: game.pendingWavePlan.event?.id || null});
      game.startWave();
      if (game.phase !== 'wave') throw new Error(`invalid wave ${index + 1}`);
      game.completeWave();
      if (index < 9) {
        if (game.phase !== 'boon' || !window.ageOfAsh.ui.boonChoices?.length) throw new Error(`invalid boon ${index + 1}`);
        window.ageOfAsh.ui.selectBoon(0);
        window.ageOfAsh.ui.claimBoon();
      }
    }
    return {initial, phase: game.phase, completed: game.stats.waves, reports: game.waveReports.length, waves};
  });
  if (traversal.phase !== 'victory' || traversal.completed !== 10 || traversal.reports !== 10) throw new Error('ten-wave traversal failed');
  if (result.console_errors.length || result.page_errors.length || result.load_failures.length) throw new Error('browser errors were captured');

  result.metrics = {
    ...navigation, measured_fps: fps.fps, fps_frames: fps.frames,
    interaction_latency_ms: interactionLatency, quality_duration_ms: performance.now() - started,
    traversal_kind: 'controlled_state_machine_not_full_combat', translations, traversal,
  };
  result.success_screenshot = successScreenshot;
  result.visual = args.baseline ? compareImages(args.baseline, successScreenshot) : {status: 'no_baseline'};
  if (result.visual.status === 'failed') throw new Error(`visual regression ratio ${result.visual.ratio}`);
  result.status = 'passed';
  result.log = 'Four locales, Start Game, major UI, Nemesis Director, and controlled ten-wave state traversal passed.';
} catch (error) {
  result.log = String(error?.stack || error);
  if (page) {
    try {
      await captureScreenshot(failureScreenshot);
      result.failure_screenshot = failureScreenshot;
    } catch {
      if (fs.existsSync(successScreenshot)) {
        fs.copyFileSync(successScreenshot, failureScreenshot);
        result.failure_screenshot = failureScreenshot;
      }
    }
  }
} finally {
  fs.writeFileSync(args.result, JSON.stringify(result, null, 2));
  if (context) {
    await Promise.race([
      context.close().catch(() => {}),
      new Promise(resolve => setTimeout(resolve, 3000)),
    ]);
  }
}
process.exit(result.status === 'passed' ? 0 : 1);
