const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const { chromium } = require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright-core');
const root = '/workspace/riftwatch-fun-lab-281169b5';
const source = process.argv[2], build = process.argv[3], out = process.argv[4];
if (!/^[a-f0-9]{40}$/.test(source) || !build || !out || fs.existsSync(out)) throw Error('需要固定 SHA、正式構建及全新證據目錄');
fs.mkdirSync(out, { recursive: true });
const raw = fs.readFileSync(root + '/checkpoints/B-before-critical.json', 'utf8');
const result = { source, scope: '原封B自然快照Continue、先記自然首擊。其後CONTROLLED_BROWSER_NO_SIM_TICK：原生spawn/applyDamage建立雙來源，僅測手勢與UI，不是自然戰役或攻擊數值驗收。', resumeSha256: crypto.createHash('sha256').update(raw).digest('hex'), checks: [], errors: [] };
const save = () => fs.writeFileSync(out + '/result.json', JSON.stringify(result, null, 2));
const check = (name, pass, data = {}) => { result.checks.push({ name, pass: !!pass, ...data }); save(); if (!pass) throw Error(name); };
const button = (kind, action) => `#core-damage-readback [data-source-kind="${kind}"][data-source-action="${action}"]`;
let browser, context, page;
async function fixture() {
  return page.evaluate(raw => {
    const g = ageOfAsh.game;
    window.__qaFreeze = true; window.__qaCameraMotion = false;
    g.restore(JSON.parse(raw)); g.start(); g.inMenu = false; g.paused = false;
    ageOfAsh.ui.hideMenu(); ageOfAsh.ui.showPause(false); ageOfAsh.ui.hideEnd(); ageOfAsh.ui.hideBoons();
    const c = g.getTownCenter();
    const peak = g.spawnUnit('ram', c.x + c.w + 1, c.y + c.h / 2, 'enemy');
    const last = g.spawnUnit('archer', c.x + c.w + 2, c.y + c.h / 2 + 1, 'enemy');
    if (!g.isVisible(peak) || !g.isVisible(last)) throw Error('測試來源不在原生視野');
    g.applyDamage(c, 180, peak, 'melee'); g.applyDamage(c, 20, last, 'projectile');
    window.__qaSources = { peak, last }; window.__qaCommands = [];
    ageOfAsh.ui.update(g); ageOfAsh.ui.coreDamageReadback.update(true);
    return { peak: peak.id, last: last.id, view: ageOfAsh.ui.coreDamageReadback.view() };
  }, raw);
}
async function frozenSnapshot() {
  return page.evaluate(() => { const g = ageOfAsh.game, s = g.snapshot(); delete s.savedAt; return { snapshot: JSON.stringify(s), rng: g.rng.state, visual: g.visualRng.state, camera: { ...g.camera }, selected: g.selection.map(u => u.id), commands: window.__qaCommands.length }; });
}
async function selectArmy() { await page.keyboard.press('F2'); await page.waitForTimeout(50); }
async function pointAtButton(kind, action) { const q = await page.locator(button(kind, action)).boundingBox(); if (!q) throw Error('找不到來源按鈕'); return { x: q.x + q.width / 2, y: q.y + q.height / 2 }; }
async function gestureCancel(name, mutate) {
  await fixture(); await selectArmy();
  const p = await pointAtButton('last', 'attack'); await page.mouse.move(p.x, p.y); await page.mouse.down();
  await page.evaluate(mutate); await page.waitForTimeout(30); await page.mouse.up();
  const data = await page.evaluate(() => ({ commands: window.__qaCommands, toast: document.querySelector('#toasts')?.textContent || document.querySelector('.toasts')?.textContent || '', phase: ageOfAsh.game.phase }));
  check(name, data.commands.length === 0, data);
}
(async () => {
  try {
    browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
    result.browser = browser.version();
    context = await browser.newContext({ viewport: { width: 1440, height: 900 }, recordVideo: { dir: out + '/video', size: { width: 960, height: 600 } } });
    page = await context.newPage(); page.on('pageerror', e => { result.errors.push(e.message); save(); });
    const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml' };
    await page.route('http://127.0.0.1:28127/**', route => {
      const u = new URL(route.request().url()).pathname, f = path.resolve(build, '.' + (u === '/' ? '/index.html' : decodeURIComponent(u)));
      if (!f.startsWith(build + path.sep)) return route.fulfill({ status: 403, body: '' });
      try { return route.fulfill({ status: 200, contentType: mime[path.extname(f)] || 'application/octet-stream', body: fs.readFileSync(f) }); } catch { return route.fulfill({ status: 404, body: '' }); }
    });
    await page.goto('http://127.0.0.1:28127/', { waitUntil: 'networkidle' });
    await page.waitForFunction(() => window.ageOfAsh && !document.querySelector('#btn-start').disabled);
    await page.evaluate(raw => localStorage.setItem('riftwatch.playtest.v227.run.v1', raw), raw);
    await page.reload({ waitUntil: 'networkidle' }); await page.waitForFunction(() => !document.querySelector('#btn-start').disabled);
    const verified = await page.evaluate(() => ({ commit: ageOfAsh.playtestBuild.commit, resourceVerification: ageOfAsh.playtestBuild.resourceVerification }));
    const manifest = JSON.parse(fs.readFileSync(build + '/build-metadata.json'));
    check('正式來源與全部實際資源SHA', verified.commit === source && verified.resourceVerification === `SHA256_MATCH_${Object.keys(manifest.files).length}_FILES`, { verified });
    await page.locator('#setup-locale').selectOption('zh-Hant'); await page.locator('#btn-continue').click();
    await page.evaluate(() => {
      const g = ageOfAsh.game, damage = g.applyDamage.bind(g);
      window.__qaNaturalHits = [];
      g.applyDamage = (target, ...args) => { const before = target?.team === 'player' && target.type === 'core' ? target.hp : null; const r = damage(target, ...args); if (before !== null && before > target.hp) window.__qaNaturalHits.push({ before, after: target.hp, loss: Math.max(0, before) - Math.max(0, target.hp), view: ageOfAsh.ui.coreDamageReadback.view() }); return r; };
    });
    await page.locator('#btn-core-defense').click();
    await page.waitForFunction(() => window.__qaNaturalHits.length > 0, null, { timeout: 30000 });
    const natural = await page.evaluate(() => window.__qaNaturalHits.at(-1));
    check('正常Continue原生首擊實損與畫面紀錄相符', natural.loss === natural.view.loss, { natural });
    await page.screenshot({ path: out + '/natural-first-core-hit.png' });
    await page.evaluate(() => {
      const g = ageOfAsh.game, nativeUpdate = g.update.bind(g), nativeCommand = g.issueCommand.bind(g);
      g.update = dt => { if (!window.__qaFreeze) return nativeUpdate(dt); if (window.__qaCameraMotion) g.updateCamera(dt); };
      window.__qaCommands = [];
      g.issueCommand = (...args) => { const target = g.pickAt(...args); const r = nativeCommand(...args); window.__qaCommands.push({ targetId: target?.id, point: args, selected: g.selection.map(u => ({ id: u.id, targetId: u.target?.id, manualAttack: u.manualAttack, order: u.order?.type })) }); return r; };
    });
    const f = await fixture();
    check('受控雙行有獨立查看及反擊按鈕', await page.locator('[data-source-action]').count() === 4 && f.view.sourceId === f.last && f.view.peak.sourceId === f.peak, { fixture: f });
    const beforeView = await frozenSnapshot(); await page.evaluate(() => { window.__qaCameraMotion = true; });
    await page.locator(button('peak', 'view')).click(); await page.waitForTimeout(700); await page.evaluate(() => { window.__qaCameraMotion = false; });
    const afterView = await frozenSnapshot();
    check('原生滑鼠查看僅移相機、不選兵或派令', beforeView.commands === afterView.commands && JSON.stringify(beforeView.selected) === JSON.stringify(afterView.selected) && beforeView.rng === afterView.rng && beforeView.visual === afterView.visual && JSON.stringify(beforeView.camera) !== JSON.stringify(afterView.camera), { before: { ...beforeView, snapshot: undefined }, after: { ...afterView, snapshot: undefined } });
    await selectArmy(); await page.locator(button('peak', 'attack')).click();
    let commands = await page.evaluate(() => window.__qaCommands);
    check('原生鼠標反擊一次且正式戰士對準該筆同一來源', commands.length === 1 && commands[0].targetId === f.peak && commands[0].selected.length > 0 && commands[0].selected.every(u => u.manualAttack && u.targetId === f.peak), { commands });
    await page.screenshot({ path: out + '/controlled-source-retaliate.png' });
    await page.locator('[data-command="stop"]').click();
    check('後續原生停止可以覆蓋人工反擊', await page.evaluate(() => ageOfAsh.game.selection.every(u => !u.manualAttack && !u.target)));
    for (const key of ['Space', 'Enter']) {
      await fixture(); await selectArmy();
      await page.locator(button('last', 'view')).click(); await page.evaluate(() => { window.__qaCameraMotion = true; }); await page.waitForTimeout(600); await page.evaluate(() => { window.__qaCameraMotion = false; });
      await page.locator(button('last', 'attack')).focus(); await page.keyboard.down(key); await page.keyboard.down(key); await page.keyboard.up(key);
      commands = await page.evaluate(() => window.__qaCommands);
      check('原生鍵盤' + key + '長按只送一次且不誤開暫停', commands.length === 1 && !await page.evaluate(() => ageOfAsh.game.paused), { commands });
    }
    await gestureCancel('按下後同來源同時刻同傷新事件取消、不偷換新紀錄', () => { const g = ageOfAsh.game; g.applyDamage(g.getTownCenter(), 20, window.__qaSources.last, 'projectile'); ageOfAsh.ui.coreDamageReadback.update(true); });
    await gestureCancel('按下後同名不同來源取消、不轉打近鄰', () => { const g = ageOfAsh.game, c = g.getTownCenter(), other = g.spawnUnit('archer', c.x + 2, c.y - 1, 'enemy'); g.applyDamage(c, 20, other, 'projectile'); ageOfAsh.ui.coreDamageReadback.update(true); });
    await gestureCancel('按下後選兵改變取消', () => { ageOfAsh.game.selection = ageOfAsh.game.selection.slice(1); });
    await gestureCancel('按下後來源死亡取消', () => { window.__qaSources.last.alive = false; ageOfAsh.ui.coreDamageReadback.update(true); });
    await gestureCancel('按下後暫停取消', () => { ageOfAsh.game.paused = true; });
    await gestureCancel('按下後更換波次取消', () => { ageOfAsh.game.waveIndex++; ageOfAsh.ui.coreDamageReadback.update(true); });
    await gestureCancel('按下後原生還原同快照取消舊實體', () => { const g = ageOfAsh.game, s = g.snapshot(); g.restore(s); g.start(); ageOfAsh.ui.coreDamageReadback.update(true); });
    await fixture(); const pureBefore = await frozenSnapshot();
    await page.evaluate(() => { const g = ageOfAsh.game, native = g.pickAt.bind(g); window.__qaReadbackPicks = 0; window.__qaButtonNodes = [...document.querySelectorAll('#core-damage-readback button')]; g.pickAt = (...args) => { window.__qaReadbackPicks++; return native(...args); }; });
    for (let i = 0; i < 30; i++) await page.evaluate(() => ageOfAsh.ui.coreDamageReadback.update(true));
    const pureAfter = await frozenSnapshot();
    check('純回讀不改完整快照與兩種RNG、也不派令', pureBefore.snapshot === pureAfter.snapshot && pureBefore.rng === pureAfter.rng && pureBefore.visual === pureAfter.visual && pureBefore.commands === pureAfter.commands);
    check('純更新不搜尋原生命中點且保留原生按鈕節點', await page.evaluate(() => window.__qaReadbackPicks === 0 && [...document.querySelectorAll('#core-damage-readback button')].every((b, i) => b === window.__qaButtonNodes[i])));
    for (const locale of ['zh-Hant', 'zh-Hans', 'en', 'ja']) for (const [w, h] of [[1440, 900], [1024, 768], [800, 600], [390, 844]]) {
      await page.setViewportSize({ width: w, height: h }); await page.evaluate(l => ageOfAsh.ui.changeLocale(l), locale); await page.waitForTimeout(120);
      const layout = await page.evaluate(() => {
        const node = document.querySelector('#core-damage-readback'), r = node.getBoundingClientRect();
        return { text: node.innerText, inside: r.left >= 0 && r.right <= innerWidth && r.top >= 0 && r.bottom <= innerHeight, buttons: [...node.querySelectorAll('button:not(:disabled)')].filter(b => !b.closest('[hidden]')).every(b => { const q = b.getBoundingClientRect(); return b.contains(document.elementFromPoint(q.x + q.width / 2, q.y + q.height / 2)); }), battleButtons: [...document.querySelectorAll('.battle-buttons button')].every(b => { const q = b.getBoundingClientRect(); return b.contains(document.elementFromPoint(q.x + q.width / 2, q.y + q.height / 2)); }) };
      });
      check('四語視口來源操作及既有命令可見可點-' + locale + '-' + w, layout.inside && layout.buttons && layout.battleButtons && !layout.text.includes('coreDamage.'), layout);
      if (locale === 'zh-Hant' && w === 1440 || locale === 'ja' && w === 390) await page.screenshot({ path: out + '/controlled-' + locale + '-' + w + '.png' });
    }
    await page.setViewportSize({ width: 1440, height: 900 }); await page.evaluate(() => ageOfAsh.ui.changeLocale('zh-Hant'));
    await fixture(); await page.evaluate(() => { const g = ageOfAsh.game; const source = window.__qaSources.last; const visible = g.isVisible.bind(g); g.isVisible = u => u !== source && visible(u); ageOfAsh.ui.coreDamageReadback.update(); });
    check('失視野即移除來源與停用其操作、另一筆保留', await page.evaluate(() => { const u = ageOfAsh.ui.coreDamageReadback.view(); return u.sourceId === null && u.peak.sourceId === window.__qaSources.peak.id && [...document.querySelectorAll('button[data-source-kind="last"]')].every(b => b.disabled && b.hidden); }));
    const diagnosticsBeforeLoad = await page.evaluate(() => ageOfAsh.ui.coreDamageReadback.diagnostics());
    check('本輪初始無紀錄、清空與各手勢均零額外HUD例外', diagnosticsBeforeLoad.uiFaults === 0 && diagnosticsBeforeLoad.faults === 0, { diagnosticsBeforeLoad });
    await page.evaluate(() => { window.__qaFreeze = false; ageOfAsh.game.paused = false; });
    await page.locator('#btn-pause').click(); await page.locator('#btn-save').click();
    await page.reload({ waitUntil: 'networkidle' }); await page.waitForFunction(() => !document.querySelector('#btn-start').disabled);
    await page.locator('#btn-continue').click();
    check('原生儲存與重新載入不重播舊來源或留下舊操作', await page.evaluate(() => ageOfAsh.ui.coreDamageReadback.view() === null && document.querySelector('#core-damage-readback').hidden));
    const diagnosticsAfterLoad = await page.evaluate(() => ageOfAsh.ui.coreDamageReadback.diagnostics());
    check('重新載入無紀錄狀態維持零額外HUD例外', diagnosticsAfterLoad.uiFaults === 0 && diagnosticsAfterLoad.faults === 0, { diagnosticsAfterLoad });
    check('零瀏覽器程式錯誤', result.errors.length === 0);
    result.status = 'PASS_NATIVE_INPUT_AND_CONTROLLED_GESTURE_BOUNDARIES';
  } catch (e) {
    result.status = 'FAIL'; result.failure = String(e.stack || e); process.exitCode = 1;
    if (page && !page.isClosed()) await page.screenshot({ path: out + '/failure.png' }).catch(() => {});
  } finally {
    const video = page?.video(); await context?.close().catch(() => {});
    if (video) fs.copyFileSync(await video.path(), out + '/continuous-browser-test.webm');
    await browser?.close(); save(); console.log(JSON.stringify({ status: result.status, pass: result.checks.filter(c => c.pass).length, fail: result.checks.filter(c => !c.pass).length, failure: result.failure, errors: result.errors }));
  }
})();
