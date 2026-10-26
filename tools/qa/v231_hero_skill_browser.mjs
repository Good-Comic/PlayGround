import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const require = createRequire(import.meta.url);
const candidates = [process.env.PLAYWRIGHT_CORE, 'playwright-core', `${process.env.HOME}/.local/share/omgithub-playwright/node_modules/playwright-core`].filter(Boolean);
let chromium = null;
for (const candidate of candidates) {
  try { ({ chromium } = require(candidate)); break; } catch {}
}
if (!chromium) throw new Error('playwright-core not found; set PLAYWRIGHT_CORE');

const args = process.argv.slice(2);
const arg = name => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null; };
const url = arg('--url') || 'http://127.0.0.1:8020/';
const out = resolve(arg('--out') || '/tmp/riftwatch-v231-shots');
const expectedCommit = arg('--commit');
const chrome = process.env.CHROME_PATH || '/usr/bin/chromium';
mkdirSync(out, { recursive: true });

const browser = await chromium.launch({ executablePath: chrome, headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('console', message => { if (message.type() === 'error') errors.push('console: ' + message.text()); });
page.on('pageerror', error => errors.push('page: ' + error.message));
page.on('requestfailed', request => errors.push('request: ' + request.url() + ' ' + (request.failure()?.errorText || '')));

const checks = [];
const check = (name, pass, detail) => checks.push({ name, pass: !!pass, detail });
let failed = false;

try {
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => { const button = document.querySelector('#btn-start'); return button && !button.disabled; }, null, { timeout: 15000 });

  const meta = await page.evaluate(async () => (await fetch('/__qa_build.json')).json());
  check('served artifact is the expected clean commit', !expectedCommit || (meta.commit === expectedCommit && meta.dirty === false), { commit: meta.commit, dirty: meta.dirty, files: Object.keys(meta.files || {}).length });

  await page.fill('#setup-seed', 'v231-hero-preview');
  await page.click('#btn-start');
  await page.waitForFunction(() => window.ageOfAsh?.game && !window.ageOfAsh.game.inMenu, null, { timeout: 15000 });
  await page.evaluate(() => { const { game, ui } = window.ageOfAsh; game.paused = true; game.setSelection([game.hero]); ui.renderCommands(game); });
  await page.waitForTimeout(250);

  const prepared = await page.evaluate(() => ({
    heroAlive: !!window.ageOfAsh.game.hero?.alive,
    heroType: window.ageOfAsh.game.hero?.type,
    selected: window.ageOfAsh.game.selection.includes(window.ageOfAsh.game.hero),
    markButton: !!document.querySelector('[data-command="hero:mark"]'),
    aegisButton: !!document.querySelector('[data-command="hero:aegis"]'),
  }));
  check('living commander is selected with both skill commands', prepared.heroAlive && prepared.heroType === 'commander' && prepared.selected && prepared.markButton && prepared.aegisButton, prepared);

  await page.hover('[data-command="hero:mark"]');
  await page.waitForTimeout(150);
  const markHover = await page.evaluate(() => window.ageOfAsh.game.heroSkillPreview && { ...window.ageOfAsh.game.heroSkillPreview });
  await page.screenshot({ path: resolve(out, 'mark-preview.png') });
  check('Mark hover previews radius 9', markHover?.id === 'mark' && markHover?.radius === 9, markHover);

  await page.mouse.move(8, 8);
  await page.waitForTimeout(120);
  const markLeave = await page.evaluate(() => window.ageOfAsh.game.heroSkillPreview);
  check('leaving Mark clears the preview', markLeave === null, markLeave);

  await page.hover('[data-command="hero:aegis"]');
  await page.waitForTimeout(150);
  const aegisHover = await page.evaluate(() => window.ageOfAsh.game.heroSkillPreview && { ...window.ageOfAsh.game.heroSkillPreview });
  await page.screenshot({ path: resolve(out, 'aegis-preview.png') });
  check('Aegis hover previews radius 5', aegisHover?.id === 'aegis' && aegisHover?.radius === 5, aegisHover);

  await page.evaluate(() => document.querySelector('[data-command="hero:aegis"]').focus());
  await page.waitForTimeout(100);
  const aegisFocus = await page.evaluate(() => window.ageOfAsh.game.heroSkillPreview && { ...window.ageOfAsh.game.heroSkillPreview });
  check('keyboard focus previews Aegis radius 5', aegisFocus?.id === 'aegis' && aegisFocus?.radius === 5, aegisFocus);

  await page.evaluate(() => document.querySelector('[data-command="hero:aegis"]').blur());
  await page.waitForTimeout(100);
  const aegisBlur = await page.evaluate(() => window.ageOfAsh.game.heroSkillPreview);
  check('blur clears the preview', aegisBlur === null, aegisBlur);

  await page.click('[data-command="hero:aegis"]');
  await page.waitForTimeout(200);
  const afterClick = await page.evaluate(() => ({
    aegisCd: window.ageOfAsh.game.hero.aegisCd,
    shielded: window.ageOfAsh.game.units.filter(unit => unit.alive && unit.team === 'player' && unit.shield > 0).length,
    preview: window.ageOfAsh.game.heroSkillPreview && { ...window.ageOfAsh.game.heroSkillPreview },
  }));
  check('Aegis command still shields allies inside the previewed range', afterClick.aegisCd === 60 && afterClick.shielded > 0, afterClick);
  check('real local Chromium produced no Console, Page, or request errors', errors.length === 0, errors);
} catch (error) {
  failed = true;
  check('browser run completed', false, { error: error.message, stack: error.stack });
}

for (const item of checks) if (!item.pass) failed = true;
const result = { url, source_commit: expectedCommit || null, checks, errors, ok: !failed };
writeFileSync(resolve(out, 'browser-checks.json'), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result, null, 2));
await browser.close();
if (failed) process.exit(1);
