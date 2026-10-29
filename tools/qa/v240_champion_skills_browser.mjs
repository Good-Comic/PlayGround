// Actual UI skills and real update-loop zones in explicit controlled fixtures.
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync, copyFileSync } from 'node:fs';
const { chromium } = createRequire(import.meta.url)('playwright-core');
const [url, source, out] = process.argv.slice(2);
if (!url?.startsWith('http://127.0.0.1:') || !/^[a-f0-9]{40}$/.test(source || '') || !out) throw Error('Local URL, full commit and output required');
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, recordVideo: { dir: out, size: { width: 1440, height: 900 } } });
const page = await context.newPage(), checks = [], errors = [], timeline = [];
const check = (name, pass, detail) => { checks.push({ name, pass: !!pass, detail }); if (!pass) throw Error(name); };
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
page.on('requestfailed', r => errors.push(r.url() + ':' + r.failure()?.errorText));
page.on('response', r => { if (r.status() >= 400) errors.push(r.url() + ':' + r.status()); });
try {
  await page.goto(url);
  await page.waitForFunction(() => /^SHA256_MATCH_\d+_FILES$/.test(window.ageOfAsh?.playtestBuild?.resourceVerification || ''));
  check('exact committed artifact', await page.evaluate(s => ageOfAsh.playtestBuild.commit === s, source), await page.evaluate(() => ageOfAsh.playtestBuild));
  await page.locator('#setup-seed').fill('CHAMPION-SKILLS'); await page.locator('#btn-start').click();
  await page.waitForFunction(() => getComputedStyle(document.querySelector('#menu-screen')).visibility === 'hidden');
  await page.waitForFunction(() => ageOfAsh.renderer.unitSpriteAtlases.get('commander')?.ready);
  const sheet = await page.evaluate(() => {
    const e = ageOfAsh.renderer.unitSpriteAtlases.get('commander'), c = document.createElement('canvas');
    c.width = e.image.naturalWidth; c.height = e.image.naturalHeight;
    const ctx = c.getContext('2d', { willReadFrequently: true }); ctx.drawImage(e.image, 0, 0);
    const pixels = ctx.getImageData(0, 0, c.width, c.height).data, failures = [];
    for (let row = 0; row < 12; row++) for (let col = 0; col < 16; col++) {
      let ink = 0, border = 0;
      for (let y = 0; y < 176; y++) for (let x = 0; x < 176; x++) {
        if (pixels[((row * 176 + y) * c.width + col * 176 + x) * 4 + 3]) {
          ink++; if (x === 0 || x === 175 || y === 0 || y === 175) border++;
        }
      }
      if (ink < 100 || border) failures.push({ row, col, ink, border });
    }
    return { width: c.width, height: c.height, failures };
  });
  check('all192 hero frames including casting have visible unclipped pixels', sheet.width === 2816 && sheet.height === 2112 && !sheet.failures.length, sheet);
  await page.evaluate(async () => {
    const g = ageOfAsh.game, r = ageOfAsh.renderer;
    window.atlasAPI = await import('./js/sprite-atlas.js'); window.skillAPI = await import('./js/hero-skills.js');
    g.paused = true; g.phase = 'prep'; g.prepTimer = 1e6; g.units = []; g.zones = []; g.particles = []; g.projectiles = [];
    g.selection = []; g.hovered = null; g.hoveredResource = null;
    g.world.resources = []; g.world.props = []; g.world.wildlife = [];
    for (const t of g.world.tiles) t.terrain = 'grass'; r.terrainKey = '';
    window.actor = g.spawnUnit('commander', 29, 33, 'player', { hero: true }); g.hero = actor;
    window.ally = g.spawnUnit('guard', 31, 33); ally.hold = true;
    window.foe = g.spawnUnit('brute', 34, 33, 'enemy');
    g.focusAt(30, 33); g.camera.x = g.camera.targetX; g.camera.y = g.camera.targetY; g.camera.zoom = g.camera.targetZoom = 1.7;
    g.setSelection([actor]); ageOfAsh.ui.renderCommands(g);
    window.castFrames = { mark: [], aegis: [] }; window.feedbackSeen = { marks: 0, shields: 0, warnings: 0, impacts: 0 };
    const draw = r.drawSpriteAtlasUnit.bind(r);
    r.drawSpriteAtlasUnit = (u, p, s, v, t) => {
      if (u === g.hero && v.state === 'cast') {
        const casting = skillAPI.heroCastVisual(u), f = atlasAPI.atlasFrame(r.unitSpriteAtlases.get(u.type).descriptor, v.direction, v.state, t, v.progress).frame;
        if (casting && !castFrames[casting.id].includes(f)) castFrames[casting.id].push(f);
      }
      return draw(u, p, s, v, t);
    };
    const feedback = r.drawChampionFeedback.bind(r);
    r.drawChampionFeedback = (u, ...args) => { if (u.marked > 0) feedbackSeen.marks++; if (u.shield > 0) feedbackSeen.shields++; feedback(u, ...args); };
    const strike = r.drawBossStrike.bind(r);
    r.drawBossStrike = (zone, ...args) => { feedbackSeen[zone.done ? 'impacts' : 'warnings']++; strike(zone, ...args); };
  });
  await page.locator('[data-command="hero:mark"]').click();
  await page.waitForFunction(() => castFrames.mark.includes(0) && feedbackSeen.marks > 0);
  await page.mouse.move(8, 8); await page.screenshot({ path: `${out}/hero-mark.png` });
  check('native Mark applies production duration and persistent target glyph', await page.evaluate(() => foe.marked === 6 && actor.markCd === 30 && feedbackSeen.marks > 0));
  await page.evaluate(() => { ageOfAsh.game.paused = false; });
  await page.waitForFunction(() => castFrames.mark.length === 4, null, { timeout: 5000 });
  await page.waitForFunction(() => actor.markCd < 29.3);
  await page.evaluate(() => { ageOfAsh.game.paused = true; ageOfAsh.ui.renderCommands(ageOfAsh.game); });
  await page.locator('[data-command="hero:aegis"]').click();
  await page.waitForFunction(() => castFrames.aegis.includes(0) && feedbackSeen.shields > 0);
  await page.mouse.move(8, 8); await page.screenshot({ path: `${out}/hero-aegis.png` });
  check('native Aegis shields nearby ally and renders faceted ward', await page.evaluate(() => ally.shield === 60 && actor.aegisCd === 60 && feedbackSeen.shields > 0));
  await page.evaluate(() => { ageOfAsh.game.paused = false; });
  await page.waitForFunction(() => castFrames.aegis.length === 4, null, { timeout: 5000 });
  const casts = await page.evaluate(() => ({ mark: castFrames.mark, aegis: castFrames.aegis }));
  check('both skills play all four real cooldown-driven cast frames', casts.mark.length === 4 && casts.aegis.length === 4, casts);
  for (const type of ['warlord', 'warlord2']) {
    await page.evaluate(type => {
      const g = ageOfAsh.game, r = ageOfAsh.renderer;
      g.paused = true; g.units = []; g.zones = []; g.particles = []; g.projectiles = []; g.hovered = null; g.hoveredResource = null;
      window.actor = g.spawnUnit('commander', 29, 33, 'player', { hero: true }); g.hero = actor;
      window.witness = g.spawnUnit('guard', 29, 33); witness.hold = true; witness.stance = 'passive';
      window.boss = g.spawnUnit(type, 38, 33, 'enemy'); boss.bossSkillTimer = .05;
      g.focusAt(30, 33); g.camera.x = g.camera.targetX; g.camera.y = g.camera.targetY; g.camera.zoom = g.camera.targetZoom = 1.45;
      g.setSelection([actor]); window.witnessStartHP = witness.hp; window.heroStartHP = actor.hp;
      feedbackSeen.warnings = 0; feedbackSeen.impacts = 0; g.paused = false;
    }, type);
    await page.waitForFunction(() => ageOfAsh.game.zones.some(z => z.kind === 'boss'), null, { timeout: 5000 });
    await page.evaluate(() => { ageOfAsh.game.paused = true; });
    await page.waitForFunction(() => feedbackSeen.warnings > 0);
    const warning = await page.evaluate(() => { const z = ageOfAsh.game.zones[0]; return { source: z.source.type, x: z.x, y: z.y, r: z.r, damage: z.damage, delay: z.delay, elapsed: z.elapsed, visual: skillAPI.bossStrikeVisual(z) }; });
    check(`${type}: production warning geometry and distinct glyph`, warning.r === (type === 'warlord2' ? 3.3 : 2.8) && warning.damage === (type === 'warlord2' ? 105 : 65) && warning.delay === 2.4 && warning.visual.spokes === (type === 'warlord2' ? 8 : 6) && Math.abs(warning.visual.radiusX - warning.r * 32 * Math.SQRT2) < 1e-9, warning);
    await page.mouse.move(8, 8); await page.screenshot({ path: `${out}/${type}-warning.png` });
    const target = await page.evaluate(() => { const p = ageOfAsh.renderer.screen(ageOfAsh.game, 24, 37); return { x: p.x, y: p.y }; });
    await page.evaluate(() => { ageOfAsh.game.paused = false; });
    await page.mouse.click(target.x, target.y, { button: 'right' });
    const order = await page.evaluate(() => ({ state: actor.state, target: actor.targetPos }));
    check(`${type}: native escape command accepted while running`, order.state === 'move' && order.target && Math.hypot(order.target.x - 24, order.target.y - 37) < 1, order);
    await page.waitForFunction(() => feedbackSeen.impacts > 0, null, { timeout: 10000 });
    await page.evaluate(() => { ageOfAsh.game.paused = true; });
    await page.screenshot({ path: `${out}/${type}-impact-and-escape.png` });
    const result = await page.evaluate(() => { const z = ageOfAsh.game.zones[0]; return { hero: { x: actor.x, y: actor.y, hp: actor.hp, startHP: heroStartHP }, witness: { hp: witness.hp, startHP: witnessStartHP }, distance: Math.hypot(actor.x - z.x, actor.y - z.y), radius: z.r, done: z.done, elapsed: z.elapsed, seen: { ...feedbackSeen } }; });
    timeline.push({ type, warning, result });
    check(`${type}: native movement escapes actual resolved damage zone`, result.done && result.distance > result.radius && result.hero.hp === result.hero.startHP && result.witness.hp < result.witness.startHP && result.seen.impacts > 0, result);
  }
  check('no console page or resource errors', errors.length === 0, errors);
} catch (e) {
  checks.push({ name: 'browser execution', pass: false, detail: { message: e.message, stack: e.stack } });
  await page.screenshot({ path: `${out}/failure.png` }).catch(() => {});
} finally {
  const video = page.video(); await context.close(); if (video) copyFileSync(await video.path(), `${out}/browser.webm`); await browser.close();
}
const result = { source_commit: source, seed: 'CHAMPION-SKILLS', mode: 'LOCAL_CONTROLLED_FIXTURE_NATIVE_UI_SKILLS_AND_UPDATE_LOOP_DAMAGE_NOT_NATURAL_CAMPAIGN', checks, errors, timeline, pass: checks.length > 0 && checks.every(c => c.pass) };
writeFileSync(`${out}/browser.json`, JSON.stringify(result, null, 2));
console.log(JSON.stringify({ pass: result.pass, checks: checks.map(({ name, pass }) => ({ name, pass })) }));
if (!result.pass) process.exitCode = 1;
