const fs = require('node:fs'), path = require('node:path');
const { chromium } = require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright-core');
const root = '/workspace/riftwatch-fun-lab-281169b5', afterSha = process.argv[2], afterBuild = process.argv[3], out = process.argv[4];
if (!/^[a-f0-9]{40}$/.test(afterSha) || !afterBuild || !out || fs.existsSync(out)) throw Error('固定來源與新目錄必填');
fs.mkdirSync(out, { recursive: true });
const result = { scope: 'CONTROLLED_NATIVE_TERMINAL_EVENT：正式Start後以原生致命扣血／triggerVictory建立結算狀態，測真正鍵鼠與正式重開／NG+入口；不是自然勝利、十波或平衡驗證。before固定1710938；自然B失敗另存原始證據。', checks: [], errors: [] };
const save = () => fs.writeFileSync(out + '/result.json', JSON.stringify(result, null, 2));
const check = (name, pass, data = {}) => { result.checks.push({ name, pass: !!pass, ...data }); save(); if (!pass) throw Error(name); };
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml' };
let browser, context, page;
async function boot(mode) {
  const build = mode === 'before' ? root + '/build-source-actions-r1' : afterBuild, expected = mode === 'before' ? '1710938cd79da6d347a54764e85e13b11babca34' : afterSha;
  context = await browser.newContext({ viewport: { width: 1440, height: 900 }, recordVideo: { dir: out + '/video', size: { width: 960, height: 600 } } });
  page = await context.newPage(); page.on('pageerror', e => { result.errors.push({ mode, error: e.message }); save(); });
  await page.route('http://127.0.0.1:28129/**', route => {
    const u = new URL(route.request().url()).pathname, f = path.resolve(build, '.' + (u === '/' ? '/index.html' : decodeURIComponent(u)));
    if (!f.startsWith(build + path.sep)) return route.fulfill({ status: 403, body: '' });
    try { return route.fulfill({ status: 200, contentType: mime[path.extname(f)] || 'application/octet-stream', body: fs.readFileSync(f) }); } catch { return route.fulfill({ status: 404, body: '' }); }
  });
  await page.goto('http://127.0.0.1:28129/', { waitUntil: 'networkidle' }); await page.waitForFunction(() => window.ageOfAsh && !document.querySelector('#btn-start').disabled);
  const verified = await page.evaluate(() => ({ source: ageOfAsh.playtestBuild.commit, hash: ageOfAsh.playtestBuild.resourceVerification }));
  const n = Object.keys(JSON.parse(fs.readFileSync(build + '/build-metadata.json')).files).length;
  check(mode + '正式來源及全部資源核對', verified.source === expected && verified.hash === `SHA256_MATCH_${n}_FILES`, { verified });
  await page.locator('#setup-locale').selectOption('zh-Hant'); await page.locator('#setup-civ').selectOption('FRK'); await page.locator('#setup-biome').selectOption('steppe'); await page.locator('#setup-seed').fill('FUN-LAB-BASE-281169B5'); await page.locator('#btn-start').click();
  await page.keyboard.press('F2');
}
async function terminal(phase) {
  return page.evaluate(phase => {
    const g = ageOfAsh.game;
    if (phase === 'defeat') { const c = g.getTownCenter(); g.applyDamage(c, c.maxHp * 100, null, 'direct'); }
    else g.triggerVictory();
    return { phase: g.phase, sim: g.runTime, shield: g.hero.shield, cd: g.hero.aegisCd };
  }, phase);
}
async function state() {
  return page.evaluate(() => {
    const g = ageOfAsh.game, s = g.snapshot(); delete s.savedAt; delete s.camera;
    return { snapshot: JSON.stringify(s), phase: g.phase, sim: g.runTime, cd: g.hero.aegisCd, mark: g.hero.markCd,
      shields: g.units.filter(u => u.team === 'player').map(u => [u.id, u.shield, u.shieldTime]), keys: [...g.keys], heroControl: g.heroControl, orderMode: g.orderMode,
      selected: g.selection.map(u => u.id), rng: g.rng.state, visual: g.visualRng.state };
  });
}
async function close(name) { const video = page.video(); await context.close(); context = null; if (video) fs.copyFileSync(await video.path(), out + '/' + name + '.webm'); }
(async () => {
  try {
    browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] }); result.browser = browser.version();
    await boot('before'); await terminal('defeat'); const oldBefore = await state(); await page.keyboard.press('e'); const oldAfter = await state();
    check('修復前實際重現：defeat與模擬時鐘不變仍啟動神盾', oldBefore.phase === 'defeat' && oldAfter.phase === 'defeat' && oldBefore.sim === oldAfter.sim && oldBefore.cd === 0 && oldAfter.cd === 60, { classification: 'FAIL_REPRODUCED_BEFORE_DEFECT', before: { ...oldBefore, snapshot: undefined }, after: { ...oldAfter, snapshot: undefined } });
    await page.waitForTimeout(1500); await page.screenshot({ path: out + '/before-defeat-wrong-aegis.png' }); await close('before-defect');
    for (const phase of ['defeat', 'victory']) {
      await boot('after');
      const point = await page.evaluate(() => { const g = ageOfAsh.game; for (const [x, y] of [[1100, 450], [1080, 500], [950, 300], [600, 500]]) if (document.elementFromPoint(x, y) === ageOfAsh.renderer.canvas && !g.pickAt(x, y)) return { x, y }; return null; });
      check(phase + '有未遮擋原生Canvas地面輸入點', !!point);
      await terminal(phase); const before = await state();
      for (const key of ['e', 'q', 'Tab', 'i', 'g', 'p', 'Shift+a', '1', 'Control+1', 'w']) await page.keyboard.press(key);
      await page.mouse.click(point.x, point.y, { button: 'right' }); await page.mouse.click(point.x, point.y, { clickCount: 2 });
      const after = await state();
      check(phase + '原生鍵鼠不再改技能、選兵、軍令、資源與兩種RNG', JSON.stringify(before) === JSON.stringify(after), { before: { ...before, snapshot: undefined }, after: { ...after, snapshot: undefined } });
      const api = await page.evaluate(() => { const g = ageOfAsh.game, s = g.snapshot(); delete s.savedAt; const a = JSON.stringify(s); g.heroAegis(); g.heroMark(); for (const id of ['hero:aegis', 'hero:mark', 'hero:control', 'stop', 'hold', 'order:guard']) g.command(id); const b = g.snapshot(); delete b.savedAt; return a === JSON.stringify(b); });
      check(phase + '正式Game技能與命令API也拒絕結算操作', api);
      await page.locator('#btn-new-run').waitFor({ state: 'visible' });
      check(phase + '結算保持原生結果、且無空紀錄HUD例外', await page.evaluate(phase => ageOfAsh.game.phase === phase && ageOfAsh.ui.coreDamageReadback.diagnostics().uiFaults === 0 && ageOfAsh.ui.coreDamageReadback.diagnostics().faults === 0, phase));
      await page.screenshot({ path: out + '/after-' + phase + '-guard.png' });
      const restart = phase === 'defeat' ? '#btn-new-run' : '#btn-next-cycle';
      await page.locator(restart).focus(); await page.keyboard.press('Enter');
      await page.waitForFunction(() => ageOfAsh.game.phase === 'prep' && !ageOfAsh.game.inMenu);
      const restarted = await page.evaluate(() => ({ cd: ageOfAsh.game.hero.aegisCd, coreAlive: !!ageOfAsh.game.getTownCenter()?.alive, cycle: ageOfAsh.game.cycle, phase: ageOfAsh.game.phase }));
      check(phase + '原生結算按鈕Enter可進新局或NG+不被攔截', restarted.cd === 0 && restarted.coreAlive && restarted.cycle === (phase === 'victory' ? 2 : 1), { restarted });
      await page.evaluate(() => { const g = ageOfAsh.game, cast = g.heroAegis.bind(g); window.__liveCasts = []; g.heroAegis = (...args) => { const beforeCd = g.hero.aegisCd, r = cast(...args); window.__liveCasts.push({ beforeCd, cdAtCast: g.hero.aegisCd, shieldAtCast: g.hero.shield }); return r; }; });
      await page.keyboard.press('e');
      const liveCast = await page.evaluate(() => ({ calls: window.__liveCasts, currentCd: ageOfAsh.game.hero.aegisCd, shield: ageOfAsh.game.hero.shield }));
      check(phase + '新局或NG+正常E鍵仍施放既定神盾', liveCast.calls.length === 1 && liveCast.calls[0].beforeCd === 0 && liveCast.calls[0].cdAtCast === 60 && liveCast.calls[0].shieldAtCast === 60 && liveCast.currentCd > 0 && liveCast.currentCd <= 60, { liveCast });
      if (phase === 'defeat') {
        await page.mouse.move(point.x, point.y); await page.mouse.down(); await page.mouse.move(point.x + 40, point.y + 40);
        check('正式存活時拖曳手勢已開始', await page.evaluate(() => !!ageOfAsh.game.dragBox && ageOfAsh.game.grabbing));
        await terminal('defeat'); const selected = await page.evaluate(() => ageOfAsh.game.selection.map(u => u.id)); await page.mouse.up();
        check('按下至放開間敗北：只清拖曳、不另選兵或派令', await page.evaluate(ids => JSON.stringify(ageOfAsh.game.selection.map(u => u.id)) === JSON.stringify(ids) && ageOfAsh.game.dragBox === null && !ageOfAsh.game.grabbing, selected));
      }
      await close('after-' + phase);
    }
    check('零瀏覽器程式錯誤', result.errors.length === 0); result.status = 'BEFORE_DEFECT_REPRODUCED_AFTER_TERMINAL_GUARDS_PASS';
  } catch (e) { result.status = 'FAIL'; result.failure = String(e.stack || e); process.exitCode = 1; if (page && !page.isClosed()) await page.screenshot({ path: out + '/failure.png' }).catch(() => {}); }
  finally { if (context) await close('failed').catch(() => {}); await browser?.close(); save(); console.log(JSON.stringify({ status: result.status, pass: result.checks.filter(c => c.pass).length, fail: result.checks.filter(c => !c.pass).length, failure: result.failure, errors: result.errors })); }
})();
