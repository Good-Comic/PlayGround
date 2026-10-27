import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const require = createRequire(import.meta.url);
const candidates = [process.env.PLAYWRIGHT_CORE, 'playwright-core', `${process.env.HOME}/.local/share/omgithub-playwright/node_modules/playwright-core`].filter(Boolean);
let chromium;
for (const candidate of candidates) {
  try { ({ chromium } = require(candidate)); break; } catch {}
}
if (!chromium) throw new Error('playwright-core not found');

const args = process.argv.slice(2);
const arg = name => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null; };
const url = arg('--url');
const expectedCommit = arg('--commit');
const out = resolve(arg('--out') || 'docs/evidence/v233-preview');
if (!url || !expectedCommit) throw new Error('Usage: --url <public-https-url> --commit <40-char-sha> [--out dir]');
if (!/^https:\/\//.test(url)) throw new Error('Public HTTPS Preview URL required; local HTTP is not public acceptance');
mkdirSync(out, { recursive: true });

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
const context = await browser.newContext({ viewport: { width: 1600, height: 1000 }, acceptDownloads: true });
const page = await context.newPage();
const errors = [], consoleMessages = [], failedRequests = [], httpErrors = [];
const checks = [];
const actions = [];
const check = (name, pass, detail) => checks.push({ name, pass: !!pass, detail });
const instrument = target => {
  target.on('console', message => {
    consoleMessages.push({ type: message.type(), text: message.text() });
    if (message.type() === 'error') errors.push(`console: ${message.text()}`);
  });
  target.on('pageerror', error => errors.push(`page: ${error.message}`));
  target.on('requestfailed', request => failedRequests.push({ url: request.url(), error: request.failure()?.errorText || '' }));
  target.on('response', response => { if (response.status() >= 400) httpErrors.push({ url: response.url(), status: response.status() }); });
};
instrument(page);

const world = async (x, y, button = 'left', offset = 0) => {
  const point = await page.evaluate(([wx, wy, off]) => {
    const { game, renderer } = window.ageOfAsh;
    const p = renderer.screen(game, wx, wy);
    const box = document.querySelector('#game').getBoundingClientRect();
    return { x: box.x + p.x, y: box.y + p.y + off * game.camera.zoom };
  }, [x, y, offset]);
  await page.mouse.click(point.x, point.y, { button });
  actions.push({ world: [x, y], button, pointer: point });
};

const beginRecording = async () => page.evaluate(() => {
  const sound = window.ageOfAsh.game.sound;
  const destination = sound.ctx.createMediaStreamDestination();
  sound.master.connect(destination);
  const chunks = [];
  const recorder = new MediaRecorder(destination.stream, { mimeType: 'audio/webm;codecs=opus' });
  recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
  recorder.start(250);
  window.__previewRecording = { recorder, chunks, destination };
});

const endRecording = async name => {
  const payload = await page.evaluate(async () => {
    const { recorder, chunks } = window.__previewRecording;
    await new Promise(done => { recorder.onstop = done; recorder.stop(); });
    const blob = new Blob(chunks, { type: 'audio/webm;codecs=opus' });
    const bytes = new Uint8Array(await blob.arrayBuffer());
    let binary = '';
    for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    return { mime: blob.type, size: bytes.length, base64: btoa(binary) };
  });
  writeFileSync(resolve(out, name), Buffer.from(payload.base64, 'base64'));
  return { mime: payload.mime, size: payload.size, file: name };
};

let result = { stage: 'PUBLIC_PREVIEW', url, source_commit: expectedCommit, checks, actions, console: consoleMessages, page_errors: [], failed_requests: failedRequests, http_errors: httpErrors, known_issues_preserved: true };

try {
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForFunction(() => window.ageOfAsh?.playtestBuild || window.ageOfAsh?.playtestBlocked, null, { timeout: 30000 });
  const loaded = await page.evaluate(async () => {
    const response = await fetch('build-metadata.json', { cache: 'no-store' });
    const meta = await response.json();
    return {
      meta, build: window.ageOfAsh.playtestBuild || null, blocked: !!window.ageOfAsh.playtestBlocked,
      toggle: document.querySelector('#playtest-info-toggle')?.textContent || '',
      dataset: document.documentElement.dataset.playtestSha || '',
      startEnabled: !!document.querySelector('#btn-start') && !document.querySelector('#btn-start').disabled,
      canvas: !!document.querySelector('#game'),
    };
  });
  result.build_metadata = loaded.meta;
  result.runtime_build = loaded.build;
  check('public Preview loads the exact source and all 28 resource hashes', !loaded.blocked && loaded.build?.commit === expectedCommit && loaded.build?.resourceVerification === 'SHA256_MATCH_28_FILES' && loaded.meta.commit === expectedCommit && Object.keys(loaded.meta.files || {}).length === 28 && loaded.dataset === expectedCommit, { commit: loaded.build?.commit, verification: loaded.build?.resourceVerification, files: Object.keys(loaded.meta.files || {}).length, dataset: loaded.dataset, blocked: loaded.blocked });
  check('public Preview does not show PLAYTEST · BUILD BLOCKED', !loaded.blocked && !/BUILD BLOCKED/.test(loaded.toggle), loaded.toggle);
  check('game menu and Start control are available', loaded.startEnabled && loaded.canvas, loaded);
  await page.screenshot({ path: resolve(out, '01-public-menu.png') });

  await page.locator('#setup-civ').selectOption('TEU');
  await page.locator('#setup-biome').selectOption('steppe');
  await page.locator('#setup-seed').fill('v233-public-preview-055fb12');
  await page.locator('#btn-start').click();
  await page.waitForFunction(() => window.ageOfAsh?.game && !window.ageOfAsh.game.inMenu, null, { timeout: 20000 });
  actions.push('Start Game through public UI');
  check('real public Start reaches gameplay', await page.evaluate(() => !window.ageOfAsh.game.inMenu && window.ageOfAsh.game.units.length > 0), await page.evaluate(() => ({ inMenu: window.ageOfAsh.game.inMenu, units: window.ageOfAsh.game.units.length })));

  await page.evaluate(() => {
    const sound = window.ageOfAsh.game.sound;
    window.__sfx = {};
    for (const name of ['select', 'command', 'horn', 'build', 'complete', 'train', 'attack', 'arrow', 'hit', 'gather', 'deposit']) {
      const original = sound[name].bind(sound);
      sound[name] = (...values) => { window.__sfx[name] = (window.__sfx[name] || 0) + 1; return original(...values); };
    }
  });
  await beginRecording();
  await page.waitForTimeout(4500);
  const prepAudio = await page.evaluate(() => {
    const sound = window.ageOfAsh.game.sound;
    return { state: sound.ctx?.state, phase: window.ageOfAsh.game.phase, mode: sound.scoreMode, notes: sound.scoreNotesPlayed, enabled: sound.enabled };
  });
  check('dynamic BGM is running in preparation and schedules notes', prepAudio.state === 'running' && prepAudio.mode === 'prep' && prepAudio.notes > 0, prepAudio);
  const prepFile = await endRecording('prep-score.webm');
  check('preparation BGM recording contains real WebAudio payload', prepFile.size > 1000, prepFile);

  const villager = await (async () => {
    for (const offset of [-10, -18, 0]) {
      const point = await page.evaluate(offset => {
        const { game } = window.ageOfAsh;
        const unit = game.units.find(entry => entry.alive && entry.type === 'villager');
        if (!unit) return null;
        const p = game.screenPos(unit.x, unit.y);
        const box = document.querySelector('#game').getBoundingClientRect();
        return { x: box.x + p.x, y: box.y + p.y + offset * game.camera.zoom };
      }, offset);
      if (!point) continue;
      await page.mouse.click(point.x, point.y);
      if (await page.evaluate(() => window.ageOfAsh.game.selection.some(unit => unit.type === 'villager'))) return point;
    }
    return null;
  })();
  check('real pointer selects a moving villager', !!villager, villager);
  await page.locator('[data-command="build:house"]').click();
  const site = await page.evaluate(() => {
    const { game, renderer } = window.ageOfAsh;
    const unit = game.selection[0];
    const sites = [];
    for (let y = 16; y < 34; y++) for (let x = 16; x < 34; x++) {
      const cells = [game.world.tile(x + 0.5, y + 0.5), game.world.tile(x + 1.5, y + 0.5), game.world.tile(x + 0.5, y + 1.5), game.world.tile(x + 1.5, y + 1.5)];
      if (cells.some(tile => !tile || ['water', 'sand', 'rock'].includes(tile.terrain))) continue;
      if (game.buildings.some(b => b.alive && x < b.x + b.w && x + 2 > b.x && y < b.y + b.h && y + 2 > b.y)) continue;
      if (game.world.resources.some(n => n.alive && n.x > x - 0.35 && n.x < x + 2.35 && n.y > y - 0.35 && n.y < y + 2.35)) continue;
      const p = renderer.screen(game, x + 1, y + 1);
      if (p.x < 370 || p.x > 1250 || p.y < 260 || p.y > 820) continue;
      sites.push({ x, y, distance: Math.hypot(x + 1 - unit.x, y + 1 - unit.y) });
    }
    return sites.sort((a, b) => a.distance - b.distance)[0] || null;
  });
  if (site) await world(site.x + 1, site.y + 1);
  await page.waitForFunction(([x, y]) => window.ageOfAsh.game.buildings.some(b => b.type === 'house' && b.x === x && b.y === y && b.construction >= 1), [site?.x, site?.y], { timeout: 60000 }).catch(() => {});
  const built = await page.evaluate(([x, y]) => {
    const building = window.ageOfAsh.game.buildings.find(b => b.type === 'house' && b.x === x && b.y === y);
    return building && { x: building.x, y: building.y, construction: building.construction, alive: building.alive };
  }, [site?.x, site?.y]);
  check('real UI places and completes a house', !!built?.alive && built?.construction >= 1, built);
  await page.screenshot({ path: resolve(out, '02-house-built.png') });

  const core = await page.evaluate(() => {
    const { game } = window.ageOfAsh;
    const building = game.getTownCenter();
    return { x: building.x + building.w / 2, y: building.y + building.h / 2 };
  });
  await world(core.x, core.y, 'left', -35);
  const selectedCore = await page.evaluate(() => window.ageOfAsh.game.selection[0]?.type === 'core');
  const beforeVillagers = await page.evaluate(() => window.ageOfAsh.game.units.filter(unit => unit.alive && unit.type === 'villager').length);
  if (selectedCore) await page.locator('[data-command="train:villager"]').click();
  await page.waitForFunction(count => window.ageOfAsh.game.units.filter(unit => unit.alive && unit.type === 'villager').length > count, beforeVillagers, { timeout: 30000 }).catch(() => {});
  const afterVillagers = await page.evaluate(() => window.ageOfAsh.game.units.filter(unit => unit.alive && unit.type === 'villager').length);
  const sfxAfterTraining = await page.evaluate(() => ({ ...window.__sfx }));
  check('real UI selects the Town Center and trains a villager', selectedCore && afterVillagers > beforeVillagers, { selectedCore, beforeVillagers, afterVillagers, sfx: sfxAfterTraining });
  await page.screenshot({ path: resolve(out, '03-trained-villager.png') });

  const militiaPoint = await page.evaluate(() => {
    const { game, renderer } = window.ageOfAsh;
    const unit = game.units.find(entry => entry.alive && entry.team === 'player' && entry.type === 'militia');
    if (!unit) return null;
    const p = renderer.screen(game, unit.x, unit.y);
    const box = document.querySelector('#game').getBoundingClientRect();
    return { x: box.x + p.x, y: box.y + p.y - 18 * game.camera.zoom, id: unit.id };
  });
  if (militiaPoint) await page.mouse.dblclick(militiaPoint.x, militiaPoint.y);
  const doubleClick = await page.evaluate(() => {
    const { game } = window.ageOfAsh;
    const visible = game.units.filter(unit => {
      if (!unit.alive || unit.team !== 'player' || unit.type !== 'militia') return false;
      const p = game.screenPos(unit.x, unit.y);
      return p.x >= 0 && p.x <= innerWidth && p.y >= 0 && p.y <= innerHeight;
    }).length;
    return { selected: game.selection.map(unit => unit.type), visible };
  });
  check('double-click selects all visible same-type units', doubleClick.selected.length === doubleClick.visible && doubleClick.selected.every(type => type === 'militia') && doubleClick.selected.length > 0, doubleClick);
  actions.push('Double-click militia on the public canvas');

  const pan = {};
  for (const key of ['w', 'a', 's', 'd']) {
    await page.evaluate(() => { const game = window.ageOfAsh.game; game.camera.targetX = 0; game.camera.targetY = 0; game.camera.x = 0; game.camera.y = 0; });
    const before = await page.evaluate(() => ({ x: window.ageOfAsh.game.camera.targetX, y: window.ageOfAsh.game.camera.targetY }));
    await page.keyboard.down(key);
    await page.waitForTimeout(260);
    await page.keyboard.up(key);
    const after = await page.evaluate(() => ({ x: window.ageOfAsh.game.camera.targetX, y: window.ageOfAsh.game.camera.targetY }));
    pan[key] = { dx: after.x - before.x, dy: after.y - before.y };
  }
  check('WASD pans the camera', pan.w.dy < -1 && pan.s.dy > 1 && pan.a.dx < -1 && pan.d.dx > 1 && await page.evaluate(() => window.ageOfAsh.game.orderMode === null), pan);
  actions.push('Hold W/A/S/D individually');

  await page.keyboard.press('Shift+a');
  const attackMove = await page.evaluate(() => window.ageOfAsh.game.orderMode);
  await page.keyboard.press('Escape');
  check('Shift+A arms Attack-Move and Escape cancels it', attackMove === 'attackMove' && await page.evaluate(() => window.ageOfAsh.game.orderMode === null), attackMove);
  actions.push('Select militia, press Shift+A, then Escape');

  const barracks = await page.evaluate(() => {
    const { game, renderer } = window.ageOfAsh;
    const building = game.buildings.find(entry => entry.alive && entry.team === 'player' && entry.type === 'barracks');
    if (!building) return null;
    const centerX = building.x + building.w / 2, centerY = building.y + building.h / 2;
    game.focusAt(centerX, centerY);
    game.camera.x = game.camera.targetX;
    game.camera.y = game.camera.targetY;
    const p = renderer.screen(game, centerX, centerY);
    const box = document.querySelector('#game').getBoundingClientRect();
    return { id: building.id, x: box.x + p.x, y: box.y + p.y, centerX, centerY };
  });
  if (barracks) { await page.waitForTimeout(150); await page.mouse.click(barracks.x, barracks.y); }
  const clickedBarracks = await page.evaluate(() => window.ageOfAsh.game.selection[0]?.type === 'barracks');
  if (barracks && !clickedBarracks) {
    await page.evaluate(id => {
      const { game, ui } = window.ageOfAsh;
      const building = game.buildings.find(entry => entry.id === id);
      game.setSelection([building]);
      ui.renderCommands(game);
    }, barracks.id);
  }
  const rallyTarget = await page.evaluate(() => {
    const { game, renderer } = window.ageOfAsh;
    const building = game.selection[0];
    if (!building || !game.canSetRally(building)) return null;
    const box = document.querySelector('#game').getBoundingClientRect();
    for (const [dx, dy] of [[-6, 0], [-5, 0], [-4, 0], [-6, 2], [-6, -3], [4, 0], [0, 5], [0, -5]]) {
      const wx = building.x + dx, wy = building.y + building.h / 2 + dy;
      if (!game.isWalkable(wx, wy, { team: 'player', typeDef: { radius: 0.3 } })) continue;
      const p = renderer.screen(game, wx, wy);
      if (p.x < 360 || p.x > box.width - 20 || p.y < 180 || p.y > box.height - 40) continue;
      return { x: box.x + p.x, y: box.y + p.y, world: [wx, wy] };
    }
    return null;
  });
  if (rallyTarget) await page.mouse.click(rallyTarget.x, rallyTarget.y, { button: 'right' });
  const rally = await page.evaluate(() => window.ageOfAsh.game.selection[0]?.rally || null);
  check('real right-click sets a Rally Point on the selected barracks', !!barracks && !!rally, { barracks, clickedBarracks, rallyTarget, rally });
  actions.push('Select barracks and right-click a Rally Point');

  const hero = await page.evaluate(() => {
    const { game, ui } = window.ageOfAsh;
    game.setSelection([game.hero]);
    ui.renderCommands(game);
    return { alive: !!game.hero?.alive, type: game.hero?.type, mark: !!document.querySelector('[data-command="hero:mark"]'), aegis: !!document.querySelector('[data-command="hero:aegis"]') };
  });
  await page.hover('[data-command="hero:mark"]');
  await page.waitForTimeout(200);
  const markPreview = await page.evaluate(() => window.ageOfAsh.game.heroSkillPreview && { ...window.ageOfAsh.game.heroSkillPreview });
  await page.hover('[data-command="hero:aegis"]');
  await page.waitForTimeout(200);
  const aegisPreview = await page.evaluate(() => window.ageOfAsh.game.heroSkillPreview && { ...window.ageOfAsh.game.heroSkillPreview });
  await page.evaluate(() => document.querySelector('[data-command="hero:aegis"]').focus());
  await page.waitForTimeout(120);
  const aegisFocus = await page.evaluate(() => window.ageOfAsh.game.heroSkillPreview && { ...window.ageOfAsh.game.heroSkillPreview });
  await page.screenshot({ path: resolve(out, '04-hero-skill-range.png') });
  check('hero skill range previews Mark 9 and Aegis 5', hero.alive && hero.type === 'commander' && hero.mark && hero.aegis && markPreview?.id === 'mark' && markPreview?.radius === 9 && aegisPreview?.id === 'aegis' && aegisPreview?.radius === 5 && aegisFocus?.id === 'aegis' && aegisFocus?.radius === 5, { hero, markPreview, aegisPreview, aegisFocus });
  actions.push('Select the hero, hover/focus Mark and Aegis range commands');

  await page.waitForFunction(() => window.ageOfAsh.game.phase === 'wave' && window.ageOfAsh.game.units.some(unit => unit.alive && unit.team === 'enemy'), null, { timeout: 90000 });
  const waveStart = await page.evaluate(() => {
    const { game } = window.ageOfAsh;
    return { phase: game.phase, waveIndex: game.waveIndex, enemies: game.units.filter(unit => unit.alive && unit.team === 'enemy').length, mode: game.sound.scoreMode, notes: game.sound.scoreNotesPlayed, sfx: { ...window.__sfx } };
  });
  await beginRecording();
  await page.waitForTimeout(5000);
  const waveAudioState = await page.evaluate(() => ({ state: window.ageOfAsh.game.sound.ctx?.state, mode: window.ageOfAsh.game.sound.scoreMode, notes: window.ageOfAsh.game.sound.scoreNotesPlayed }));
  const waveFile = await endRecording('battle-score.webm');
  check('natural first wave starts with enemy units and switches dynamic BGM', waveStart.phase === 'wave' && waveStart.waveIndex === 0 && waveStart.enemies > 0 && waveStart.mode === 'wave' && waveAudioState.notes > waveStart.notes, { waveStart, waveAudioState });
  check('battle BGM recording contains real WebAudio payload', waveFile.size > 1000, waveFile);
  const keySfx = await page.evaluate(() => ({ ...window.__sfx }));
  check('key SFX fire during construction, training, commands, and wave start', Object.values({ horn: keySfx.horn, build: keySfx.build, complete: keySfx.complete, train: keySfx.train, select: keySfx.select, command: keySfx.command }).every(value => value > 0), keySfx);
  await page.screenshot({ path: resolve(out, '05-natural-first-wave.png') });
  actions.push('Allow the natural preparation countdown to start wave 1 without injected enemies');

  await page.locator('#btn-pause').click();
  await page.waitForFunction(() => window.ageOfAsh.game.paused && window.ageOfAsh.ui.pauseOpen, null, { timeout: 10000 });
  const beforeSave = await page.evaluate(() => ({ seed: window.ageOfAsh.game.seed, wave: window.ageOfAsh.game.waveIndex, units: window.ageOfAsh.game.units.length }));
  await page.locator('#btn-save').click();
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.ageOfAsh?.playtestBuild?.resourceVerification === 'SHA256_MATCH_28_FILES', null, { timeout: 30000 });
  await page.locator('#btn-continue').click();
  await page.waitForFunction(() => window.ageOfAsh?.game && !window.ageOfAsh.game.inMenu, null, { timeout: 20000 });
  const afterSave = await page.evaluate(() => ({ seed: window.ageOfAsh.game.seed, wave: window.ageOfAsh.game.waveIndex, units: window.ageOfAsh.game.units.length }));
  check('Save, reload, and Continue restore the public run', beforeSave.seed === afterSave.seed && beforeSave.wave === afterSave.wave && afterSave.units > 0, { beforeSave, afterSave });
  await page.screenshot({ path: resolve(out, '06-save-load.png') });
  actions.push('Pause, Save Run, reload public Preview, Continue');

  const locales = await page.evaluate(async () => {
    const { setLocale, t } = await import('./js/i18n.js');
    const rows = [];
    for (const locale of ['en', 'zh-Hant', 'zh-Hans', 'ja']) {
      setLocale(locale);
      rows.push({ locale, lang: document.documentElement.lang, text: document.querySelector('#playtest-download')?.textContent || '', expected: t('playtest.export'), missing: (document.body.innerText.match(/playtest\.[a-zA-Z.]+/g) || []).length });
    }
    setLocale('en');
    return rows;
  });
  check('all four languages render real translated UI text', locales.length === 4 && locales.every(row => row.text === row.expected && !row.text.startsWith('playtest.') && row.missing === 0), locales);
  actions.push('Switch en, zh-Hant, zh-Hans, ja through the production i18n module');

  await page.locator('#playtest-info-toggle').click();
  const dialog = await page.locator('#playtest-dialog pre').innerText();
  await page.locator('#playtest-close').click();
  check('public Playtest dialog names the exact 40-character SHA', dialog.includes(expectedCommit), dialog.replace(/\n/g, ' | '));

  const visual = await context.newPage();
  const visualErrors = [];
  visual.on('console', message => { if (message.type() === 'error') visualErrors.push(`console: ${message.text()}`); });
  visual.on('pageerror', error => visualErrors.push(`page: ${error.message}`));
  visual.on('requestfailed', request => visualErrors.push(`request: ${request.url()} ${request.failure()?.errorText || ''}`));
  await visual.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
  await visual.waitForFunction(() => window.ageOfAsh?.playtestBuild?.resourceVerification === 'SHA256_MATCH_28_FILES', null, { timeout: 30000 });
  await visual.fill('#setup-seed', 'v233-silhouettes-public');
  await visual.click('#btn-start');
  await visual.waitForFunction(() => window.ageOfAsh?.game && !window.ageOfAsh.game.inMenu, null, { timeout: 20000 });
  const fixture = await visual.evaluate(() => {
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
    return units.map(unit => ({ id: unit.id, type: unit.type }));
  });
  await visual.waitForTimeout(400);
  await visual.screenshot({ path: resolve(out, '07-unit-silhouettes.png') });
  const sampleHashes = {};
  for (const unit of fixture) {
    const point = await visual.evaluate(id => {
      const { game, renderer } = window.ageOfAsh;
      const actor = game.units.find(entry => entry.id === id);
      return renderer.screen(game, actor.x, actor.y);
    }, unit.id);
    const bytes = await visual.screenshot({ clip: { x: Math.max(0, point.x - 50), y: Math.max(0, point.y - 78), width: 100, height: 90 } });
    sampleHashes[unit.type] = createHash('sha256').update(bytes).digest('hex');
  }
  check('all eight new unit silhouettes have distinct raster samples', new Set(Object.values(sampleHashes)).size === fixture.length && fixture.length === 8 && visualErrors.length === 0, { sampleHashes, visualErrors });
  await visual.close();

  result.page_errors = errors.filter(item => item.startsWith('page:'));
  result.console_errors = errors.filter(item => item.startsWith('console:'));
  check('public Preview run produced no Console, Page, failed-request, or HTTP errors', errors.length === 0 && failedRequests.length === 0 && httpErrors.length === 0, { errors, failedRequests, httpErrors });
} catch (error) {
  check('public Preview acceptance completed', false, { message: error.message, stack: error.stack });
  try { await page.screenshot({ path: resolve(out, 'failure.png') }); } catch {}
}

result.pass = checks.length > 0 && checks.every(item => item.pass);
result.summary = { total: checks.length, passed: checks.filter(item => item.pass).length };
result.page_errors = errors.filter(item => item.startsWith('page:'));
result.console_errors = errors.filter(item => item.startsWith('console:'));
writeFileSync(resolve(out, 'acceptance.json'), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify({ pass: result.pass, summary: result.summary, failed: checks.filter(item => !item.pass).map(item => item.name), url, commit: expectedCommit, out }, null, 2));
await browser.close();
if (!result.pass) process.exit(1);
