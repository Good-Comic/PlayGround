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
  page.setDefaultTimeout(15000);
  await page.waitForFunction(() => /^SHA256_MATCH_\d+_FILES$/.test(window.ageOfAsh?.playtestBuild?.resourceVerification || ''));
  const metadata = await page.evaluate(() => ageOfAsh.playtestBuild);
  check('exact committed payload verified', metadata.commit === source, metadata);
  await page.locator('#setup-seed').fill('KOREAN-PATROL-CART');
  await page.locator('#setup-civ').selectOption('KOR');
  await page.locator('#btn-start').click();
  await page.waitForFunction(() => ['patrol_cart'].every(type => ageOfAsh.renderer.unitSpriteAtlases.get('KOR:'+type)?.ready));
  await page.evaluate(async () => { window.atlasAPI = await import('./js/sprite-atlas.js'); });
  await page.evaluate(() => {
    const g = ageOfAsh.game; g.paused=true; g.phase='prep'; g.prepTimer=1e6; g.ageLevel=2;
    window.cartCountBefore=g.units.filter(u=>u.type==='patrol_cart').length;
    g.addBuilding('tower',33,10,true);g.addBuilding('tower',36,10,true);
    window.cartCountAfterTwo=g.units.filter(u=>u.type==='patrol_cart').length;
    g.addBuilding('tower',39,10,true);
    window.bonusCart=g.units.find(u=>u.type==='patrol_cart');window.bonusCartId=bonusCart?.id;
    window.workshop=g.addBuilding('workshop',35,15,true); g.setSelection([workshop]); ageOfAsh.ui.renderCommands(g);
    window.beforeTraining={resources:{...g.resources},cost:g.unitCost('patrol_cart'),time:g.runTime};
  });
  const bonus=await page.evaluate(()=>({before:cartCountBefore,afterTwo:cartCountAfterTwo,afterThree:ageOfAsh.game.units.filter(u=>u.type==='patrol_cart').length,bonusId:bonusCartId,every:ageOfAsh.game.effects.towerCartEvery}));
  check('production Korean three-completed-tower fixture grants a real bonus cart',bonus.before===0&&bonus.afterTwo===0&&bonus.afterThree===1&&bonus.every===3,bonus);
  await page.locator('[data-command="train:patrol_cart"]').click();
  const payment=await page.evaluate(()=>({before:beforeTraining,after:{...ageOfAsh.game.resources},queue:workshop.queue.map(q=>({type:q.type,remaining:q.remaining}))}));
  check('native Korean workshop training pays all production costs',payment.queue.some(q=>q.type==='patrol_cart')&&Object.entries(payment.before.cost).every(([k,v])=>payment.before.resources[k]-payment.after[k]===v),payment);
  await page.evaluate(()=>{ageOfAsh.game.paused=false});
  await page.waitForFunction(()=>ageOfAsh.game.units.some(u=>u.type==='patrol_cart'&&u.id!==bonusCartId),null,{timeout:90000});
  const training=await page.evaluate(()=>{window.trained=ageOfAsh.game.units.find(u=>u.type==='patrol_cart'&&u.id!==bonusCartId);return{id:trained.id,elapsed:ageOfAsh.game.runTime-beforeTraining.time,queue:workshop.queue.length,civ:ageOfAsh.game.civ.id}});
  check('production simulation completes ordinary patrol_cart training',training.elapsed>=15.9&&training.queue===0&&training.civ==='KOR',training);

  // Check actual decoded pixels, including transparent gutters around every frame.
  const sheets = await page.evaluate(() => ['patrol_cart'].map(type => {
    const e = ageOfAsh.renderer.unitSpriteAtlases.get('KOR:'+type), c = document.createElement('canvas');
    c.width = e.image.naturalWidth; c.height = e.image.naturalHeight;
    const ctx = c.getContext('2d', { willReadFrequently: true }); ctx.drawImage(e.image, 0, 0);
    const pixels = ctx.getImageData(0, 0, c.width, c.height).data, failures = [];
    for (let row = 0; row < c.height / 176; row++) for (let col = 0; col < 16; col++) {
      let ink = 0, border = 0;
      for (let y = 0; y < 176; y++) for (let x = 0; x < 176; x++) {
        const a = pixels[((row * 176 + y) * c.width + col * 176 + x) * 4 + 3];
        if (a) { ink++; if (x === 0 || x === 175 || y === 0 || y === 175) border++; }
      }
      if (ink < 100 || border) failures.push({ row, col, ink, border });
    }
    return { type, width: c.width, height: c.height, failures };
  }));
  check('all patrol_cart frames have visible artwork and no edge clipping', sheets.every(x => x.width === 2816 && x.height === (x.type === 'commander' ? 2112 : 1760) && !x.failures.length), sheets);
  for (const type of ['patrol_cart']) {
    await page.evaluate(type => {
      const g = ageOfAsh.game, r = ageOfAsh.renderer;
      g.paused = true; g.phase = 'prep'; g.prepTimer = 1e6; g.units = []; g.selection = [];
      g.world.resources = []; g.world.props = []; g.world.wildlife = [];
      for (const t of g.world.tiles) t.terrain = 'grass'; r.terrainKey = '';
      window.actor = window.trained; actor.x=29;actor.y=33;actor.state='idle';g.units=[actor];
      window.reference = g.spawnUnit(type.startsWith('warlord') ? 'commander' : 'guard', 34, 33, 'player', {hero: type.startsWith('warlord')}); reference.hold = true; reference.stance='passive';
      if (type === 'commander') g.hero = actor; else if (type.startsWith('warlord')) g.hero = reference;
      else g.hero = null;
      g.focusAt(29, 33); g.camera.x = g.camera.targetX; g.camera.y = g.camera.targetY; g.camera.zoom = g.camera.targetZoom = 2;
      // Install once; the wrapper observes the current actor through window.actor.
      if (!window.atlasObserved) {
        const draw = r.drawSpriteAtlasUnit.bind(r);
        r.drawSpriteAtlasUnit = (u, p, s, v, t) => {
          if (u === window.actor) {
            visualStates[v.state] = (visualStates[v.state] || 0) + 1;
            if (v.state === 'attack') {
              const f = atlasAPI.atlasFrame(r.unitSpriteAtlases.get('KOR:'+u.type).descriptor, v.direction, v.state, t, atlasAPI.atlasActionProgress(u, v.state)).frame;
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
      await page.waitForTimeout(80); if (['E', 'W', 'N', 'S'].includes(direction)) await page.screenshot({ path: `${out}/${type}-${direction}.png` });
    }
    for (const zoom of [.8, 1.4, 2]) {
      await page.evaluate(z => { ageOfAsh.game.camera.zoom = ageOfAsh.game.camera.targetZoom = z; actor.state = 'idle'; }, zoom);
      await page.waitForTimeout(100); await page.screenshot({ path: `${out}/${type}-zoom-${zoom}.png` });
    }
    await page.evaluate(() => {
      const g = ageOfAsh.game; g.camera.zoom = g.camera.targetZoom = 2;
      actor.state = 'idle'; actor.hold = false; g.selection = [actor]; actor.selected = true;
      if (actor.team === 'player') { const p = ageOfAsh.renderer.screen(g, 33, 35); g.issueCommand(p.x, p.y); } else { actor.target = reference; actor.state = 'move'; }
      window.startPosition = { x: actor.x, y: actor.y }; g.paused = false;
    });
    await page.waitForFunction(() => Math.hypot(actor.x - startPosition.x, actor.y - startPosition.y) > 1, null, { timeout: 12000 });
    const move = await page.evaluate(() => ({ start: startPosition, end: { x: actor.x, y: actor.y }, seen: { ...visualStates } }));
    check(`${type}: production movement and walk presentation`, move.seen.walk > 0, move);
    if (type !== 'recruiter') {
      const point = await page.evaluate(() => {
        const g = ageOfAsh.game;
        if (actor.team === 'enemy') window.enemy = reference;
        else window.enemy = g.spawnUnit('brute', actor.x + 1, actor.y, 'enemy');
        window.enemyStartHP = enemy.hp; window.secondary=g.spawnUnit('raider',enemy.x+.8,enemy.y+.7,'enemy');secondary.x=enemy.x+.8;secondary.y=enemy.y+.7;window.secondaryHP=secondary.hp; reference.hold = true; reference.stance='passive'; g.selection = actor.team === 'player' ? [actor] : [];
        const p = ageOfAsh.renderer.screen(g, enemy.x, enemy.y); return {x:p.x,y:p.y-18*g.camera.zoom};
      });
      if (type === 'patrol_cart') await page.mouse.click(point.x, point.y, {button:'right'});
      await page.waitForFunction(() => visualStates.attack > 0 && enemy.hp < enemyStartHP, null, {timeout:15000});
      await page.waitForFunction(() => attackFrames.length === 4, null, {timeout:6000});
      await page.screenshot({path:`${out}/${type}-combat.png`});
      const combat = await page.evaluate(() => ({hp:actor.hp,enemyHP:enemy.hp,enemyStartHP,attackFrames:[...attackFrames],seen:{...visualStates},time:ageOfAsh.game.runTime}));
      const arrows=await page.evaluate(()=>({shots:actor.shots,enemyHP:enemy.hp,startHP:enemyStartHP}));check('production patrol cart fires actual arrows',arrows.shots>0&&arrows.enemyHP<arrows.startHP,arrows);
      snapshots.push({type,combat}); check(`${type}: production combat and four attack frames`,combat.enemyHP<combat.enemyStartHP&&combat.attackFrames.length===4,combat);
    } else {
      await page.evaluate(() => { window.enemy = reference; });
      check('recruiter: support retains production no-attack role',await page.evaluate(()=>actor.typeDef.noAttack===true));
    }
    await page.evaluate(() => { ageOfAsh.game.applyDamage(actor, 1, enemy); ageOfAsh.game.paused = true; });
    await page.waitForTimeout(100); await page.screenshot({ path: `${out}/${type}-hit.png` });
    check(`${type}: production hit presentation`, await page.evaluate(() => visualStates.hit > 0));
    await page.evaluate(() => { ageOfAsh.game.killEntity(actor, enemy); actor.deathAnim = .5; });
    await page.waitForTimeout(100); await page.screenshot({ path: `${out}/${type}-death.png` });
    check(`${type}: production death presentation`, await page.evaluate(() => !actor.alive && visualStates.death > 0));
    const fallback = await page.evaluate(() => {
      const r = ageOfAsh.renderer, e = r.unitSpriteAtlases.get('KOR:'+actor.type); e.failed = true;
      const used = r.drawSpriteAtlasUnit(actor, { x: 300, y: 300 }, 1, { state: 'idle', direction: 'E', atlasKey:'KOR:patrol_cart' }, 0);
      e.failed = false; return used;
    });
    check(`${type}: missing asset permits procedural fallback`, fallback === false);
  }
  const perf = await page.evaluate(() => {
    const g = ageOfAsh.game, r = ageOfAsh.renderer; g.paused = true; g.units = [];
    for (let i = 0; i < 100; i++) g.spawnUnit('patrol_cart', 20 + i % 10, 20 + Math.floor(i / 10));
    g.camera.zoom = g.camera.targetZoom = 1.4; const runs = [];
    for (let repeat = 0; repeat < 3; repeat++) for (const mode of (repeat % 2 ? ['atlas', 'fallback'] : ['fallback', 'atlas'])) {
      for (const type of ['patrol_cart']) r.unitSpriteAtlases.get('KOR:'+type).failed = mode === 'fallback';
      for (let j = 0; j < 20; j++) r.draw(g, 0);
      const samples = []; for (let j = 0; j < 80; j++) { const start = performance.now(); r.draw(g, 0); samples.push(performance.now() - start); }
      samples.sort((a, b) => a - b); runs.push({ repeat, mode, samples, mean: samples.reduce((a, b) => a + b, 0) / samples.length, p50: samples[39], p95: samples[75] });
    }
    for (const type of ['patrol_cart']) r.unitSpriteAtlases.get('KOR:'+type).failed = false;
    return runs;
  });
  writeFileSync(`${out}/render-samples.json`, JSON.stringify(perf, null, 2));
  check('100-unit static renderer JS budget and paired medians', perf.filter(x => x.mode === 'atlas').every(x => x.mean <= 33.3 && x.p95 <= 50 && x.p50 <= perf.find(y => y.repeat === x.repeat && y.mode === 'fallback').p50 * 1.2), perf.map(({ samples, ...x }) => x));
  const teu=await context.newPage();
  teu.on('pageerror',e=>errors.push(e.message));
  await teu.goto(url);
  await teu.waitForFunction(()=>/^SHA256_MATCH_\d+_FILES$/.test(window.ageOfAsh?.playtestBuild?.resourceVerification||''));
  await teu.locator('#setup-civ').selectOption('TEU');await teu.locator('#btn-start').click();
  await teu.waitForFunction(()=>!ageOfAsh.game.inMenu);
  const fallbackRole=await teu.evaluate(async()=>{const api=await import('./js/sprite-atlas.js'),g=ageOfAsh.game,r=ageOfAsh.renderer;g.paused=true;g.units=[];window.teuRider=g.spawnUnit('patrol_cart',29,33);g.focusAt(29,33);g.camera.x=g.camera.targetX;g.camera.y=g.camera.targetY;g.camera.zoom=g.camera.targetZoom=1.4;return{civ:g.civ.id,key:api.unitSpriteAtlasKey(teuRider,g.civ.id),variant:r.drawSpriteAtlasUnit(teuRider,{x:300,y:300},1,{state:'idle',direction:'E',atlasKey:api.unitSpriteAtlasKey(teuRider,g.civ.id)},0)}});
  check('native Teuton game retains procedural patrol cart, not Korean kit',fallbackRole.civ==='TEU'&&fallbackRole.key==='patrol_cart'&&fallbackRole.variant===false,fallbackRole);
  await teu.waitForTimeout(600);await teu.screenshot({path:out+'/teuton-existing-horse-archer.png'});
  const tv=teu.video();await teu.close();copyFileSync(await tv.path(),out+'/teuton.webm');
  check('no page console or resource errors', errors.length === 0 && network.length === 0, { errors, network });
} catch (e) {
  check('browser execution', false, { message: e.message, stack: e.stack });
  await page.screenshot({ path: `${out}/failure.png` }).catch(() => {});
} finally {
  const video = page.video(); await context.close();
  if (video) copyFileSync(await video.path(), `${out}/browser.webm`);
  await browser.close();
}
const result = { mode: 'AFTER_LOCAL_CONTROLLED_FIXTURE_NOT_NATURAL_PLAY', source_commit: source, seed: 'KOREAN-PATROL-CART', browser: 'Chromium', checks, errors, network, snapshots, pass: checks.length > 0 && checks.every(x => x.pass) };
writeFileSync(`${out}/browser.json`, JSON.stringify(result, null, 2));
console.log(JSON.stringify({ pass: result.pass, checks: checks.map(({ name, pass }) => ({ name, pass })) }));
if (!result.pass) process.exitCode = 1;
