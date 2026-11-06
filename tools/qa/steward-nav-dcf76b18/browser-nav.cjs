const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const { chromium } = require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright-core');
const [mode, build, out] = process.argv.slice(2);
if (!['before', 'after'].includes(mode) || !build || !out || fs.existsSync(out)) throw Error('需要 before/after、正式構建與全新輸出目錄');
fs.mkdirSync(out, { recursive: true });
const meta = JSON.parse(fs.readFileSync(path.join(build, 'build-metadata.json')));
const raw = fs.readFileSync('/workspace/riftwatch-resume-20261106-d908d81b/worktree/docs/feedback/production-player-d908d81b/root-only-replay/B-before-critical.json', 'utf8');
const result = { mode, source: meta.commit, scope: 'CONTROLLED_NATIVE_UI：原封合法B存檔；原生滑鼠／鍵盤與表單操作。不是自然戰役、真人或勝率驗證。', checks: [], observations: [], errors: [] };
const save = () => fs.writeFileSync(path.join(out, 'result.json'), JSON.stringify(result, null, 2));
const check = (name, pass, data = {}) => { result.checks.push({ name, pass: !!pass, ...data }); save(); if (!pass) throw Error(name); };
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml' };
const fingerprint = async page => crypto.createHash('sha256').update(await page.evaluate(() => { const s = ageOfAsh.game.snapshot(); delete s.savedAt; return JSON.stringify(s); })).digest('hex');
let browser, context;
(async () => {
  try {
    browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--no-sandbox', '--enable-precise-memory-info'] });
    result.browser = browser.version();
    context = await browser.newContext({ viewport: { width: 1440, height: 900 }, recordVideo: { dir: path.join(out, 'video'), size: { width: 960, height: 600 } } });
    const page = await context.newPage();
    page.on('pageerror', e => { result.errors.push(e.message); save(); });
    await page.route('http://127.0.0.1:28146/**', route => {
      const url = new URL(route.request().url()).pathname, file = path.resolve(build, '.' + (url === '/' ? '/index.html' : decodeURIComponent(url)));
      if (!file.startsWith(path.resolve(build) + path.sep)) return route.fulfill({ status: 403, body: '' });
      try { return route.fulfill({ status: 200, contentType: mime[path.extname(file)] || 'application/octet-stream', body: fs.readFileSync(file) }); }
      catch { return route.fulfill({ status: 404, body: '' }); }
    });
    const ready = async () => { await page.goto('http://127.0.0.1:28146/', { waitUntil: 'networkidle' }); await page.waitForFunction(() => window.ageOfAsh && !document.querySelector('#btn-start').disabled); };
    await ready();
    check('正式構建完整性閘門', await page.evaluate(({ source, count }) => ageOfAsh.playtestBuild.commit === source && ageOfAsh.playtestBuild.resourceVerification === `SHA256_MATCH_${count}_FILES`, { source: meta.commit, count: Object.keys(meta.files).length }));
    await page.evaluate(raw => { localStorage.setItem('riftwatch.playtest.v227.run.v1', raw); localStorage.setItem('riftwatch.playtest.locale', 'zh-Hant'); }, raw);
    await ready();
    await page.locator('#btn-continue').click();
    await page.locator('#btn-stewards-hud').click();
    await page.waitForFunction(() => document.querySelector('#steward-dialog').open && ageOfAsh.game.paused);
    const before = await fingerprint(page);
    const geometry = async () => page.evaluate(() => {
      const d = document.querySelector('#steward-dialog'), f = [...d.querySelectorAll('form > fieldset')], box = el => { const b = el.getBoundingClientRect(); return { top: b.top, bottom: b.bottom, left: b.left, right: b.right }; };
      return { dialog: box(d), military: box(f[2].querySelector('legend')), nav: !!d.querySelector('[data-steward-section-nav]'), fields: f.length, scrollTop: d.scrollTop, viewport: { width: innerWidth, height: innerHeight } };
    });
    if (mode === 'before') {
      const g = await geometry(); result.observations.push(g);
      check('重現既有面板沒有區段直達且軍務在首屏外', !g.nav && g.military.top > g.dialog.bottom, g);
      await page.screenshot({ path: path.join(out, 'before-top.png') });
      await page.locator('#steward-dialog').evaluate(d => d.scrollTop = d.scrollHeight);
      await page.screenshot({ path: path.join(out, 'before-military-after-scroll.png') });
      check('唯讀捲動不改遊戲快照', before === await fingerprint(page));
    } else {
      await page.screenshot({ path: path.join(out, 'after-top.png') });
      await page.locator('#steward-close').click();
      check('原先進行中關閉會恢復模擬', await page.evaluate(() => !ageOfAsh.game.paused));
      await page.locator('#btn-pause').click();
      await page.locator('#btn-stewards').click();
      const stable = await fingerprint(page);
      const initialFields = await page.locator('#steward-dialog form').evaluate(f => JSON.stringify([...new FormData(f)]));
      const initialReserve = await page.evaluate(() => ageOfAsh.game.stewards.reserve[0]);
      const form = await page.locator('#steward-dialog form').elementHandle();
      const input = await page.locator('[name="reserve0"]').elementHandle();
      await page.locator('[name="reserve0"]').fill(String(initialReserve + 17));
      const draft = await page.locator('#steward-dialog form').evaluate(f => JSON.stringify([...new FormData(f)]));
      check('修改僅成草稿而不改正式快照', stable === await fingerprint(page));
      const jump = async (section, key) => {
        const button = page.locator(`[data-steward-jump="${section}"]`);
        if (key) { await button.focus(); await page.keyboard.press(key); } else await button.click();
        return page.evaluate(section => {
          const d = document.querySelector('#steward-dialog'), nav = d.querySelector('[data-steward-section-nav]'), title = d.querySelector(`#steward-section-${section} legend`), footer = d.querySelector('.steward-controls');
          const a = nav.getBoundingClientRect(), b = title.getBoundingClientRect(), c = footer.getBoundingClientRect(), box = d.getBoundingClientRect();
          return { section, title: title.textContent, focused: document.activeElement === title, titleVisible: b.top >= a.bottom - 1 && b.bottom <= c.top + 1, titleAligned: b.top >= a.bottom - 1 && b.top <= a.bottom + 12, navVisible: a.top >= box.top && a.bottom < c.top, viewport: [innerWidth, innerHeight], scrollTop: d.scrollTop, paused: ageOfAsh.game.paused, open: d.open };
        }, section);
      };
      for (const [section, key] of [['military', null], ['buildings', 'Enter'], ['economy', 'Space'], ['military', 'Enter']]) {
        const row = await jump(section, key); result.observations.push(row);
        check('直達頂端、標題焦點與按鍵不提交-' + section + '-' + key, row.titleVisible && row.titleAligned && row.navVisible && row.focused && row.paused && row.open, row);
        check('同DOM、草稿及完整遊戲狀態不變-' + section + '-' + key,
          await page.evaluate(([f, i]) => document.querySelector('#steward-dialog form') === f && document.querySelector('[name="reserve0"]') === i, [form, input])
          && draft === await page.locator('#steward-dialog form').evaluate(f => JSON.stringify([...new FormData(f)])) && stable === await fingerprint(page));
      }
      const producer = page.locator('details[data-producer]').first();
      check('存檔確實有正式生產建築', await producer.count() === 1);
      await producer.locator(':scope > summary').click();
      await page.waitForFunction(() => !document.querySelector('details[data-producer] [data-production-content]').hidden);
      check('原生展開建築時摘要與診斷開頭進入首屏', await producer.evaluate(p => {
        const d = p.closest('dialog'), nav = d.querySelector('[data-steward-section-nav]').getBoundingClientRect(), footer = d.querySelector('.steward-controls').getBoundingClientRect(), summary = p.querySelector('summary').getBoundingClientRect(), content = p.querySelector('[data-production-content]').getBoundingClientRect();
        return document.activeElement === p.querySelector('summary') && summary.top >= nav.bottom - 1 && summary.top <= nav.bottom + 12 && content.top < footer.top;
      }));
      check('直達後既有診斷仍明示草稿、讀正式設定', await page.locator('#steward-applied-notice').getAttribute('data-draft') === 'true' && stable === await fingerprint(page));
      await page.screenshot({ path: path.join(out, 'after-military-draft.png') });
      await jump('economy'); await jump('military');
      check('往返保留建築展開與診斷節點', await producer.getAttribute('open') !== null);
      await page.locator('#steward-close').click();
      check('取消不套用且還原原本暫停', stable === await fingerprint(page) && await page.evaluate(() => ageOfAsh.game.paused));
      await page.locator('#btn-stewards').click();
      check('重開不保留未套用草稿', initialFields === await page.locator('#steward-dialog form').evaluate(f => JSON.stringify([...new FormData(f)])));
      const nonPlan = async () => page.evaluate(() => { const s = ageOfAsh.game.snapshot(); delete s.savedAt; delete s.stewards; return JSON.stringify(s); });
      const nonPlanBefore = await nonPlan();
      await page.locator('[name="reserve0"]').fill(String(initialReserve + 17));
      await jump('military'); await page.locator('#steward-apply').focus(); await page.keyboard.press('Enter');
      check('只有顯式儲存才套用且不影響非規劃狀態', await page.evaluate(v => ageOfAsh.game.stewards.reserve[0] === v && ageOfAsh.game.paused && !document.querySelector('#steward-dialog').open, initialReserve + 17) && nonPlanBefore === await nonPlan());
      await page.locator('#btn-save').click();
      await ready(); await page.locator('#btn-continue').click(); await page.locator('#btn-pause').click(); await page.locator('#btn-stewards').click();
      check('原生Save／Reload／Continue保留已套用值', await page.evaluate(v => ageOfAsh.game.stewards.reserve[0] === v && Number(document.querySelector('[name="reserve0"]').value) === v, initialReserve + 17));
      await page.locator('#steward-close').click();
      for (const locale of ['zh-Hant', 'zh-Hans', 'en', 'ja']) for (const width of [1440, 800, 390]) {
        await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
        await page.evaluate(async locale => (await import('/js/i18n.js')).setLocale(locale), locale);
        await page.locator('#btn-stewards').click();
        const state = await fingerprint(page);
        for (const section of ['military', 'buildings', 'economy']) {
          const row = await jump(section); row.locale = locale; result.observations.push(row);
          check('四語／視口直達頂端-' + locale + '-' + width + '-' + section, row.titleVisible && row.titleAligned && row.navVisible && row.focused && row.open && row.paused, row);
        }
        check('導航三按鈕皆有正式在地化名稱-' + locale + '-' + width, await page.locator('[data-steward-jump]').evaluateAll(buttons => buttons.length === 3 && buttons.every(b => b.textContent.trim() && !b.textContent.includes('steward.') && b.type === 'button' && !b.name)));
        check('四語／視口查閱不耗RNG或改快照-' + locale + '-' + width, state === await fingerprint(page));
        if (width === 390 || (width === 1440 && locale === 'zh-Hant')) await page.screenshot({ path: path.join(out, `after-${locale}-${width}.png`) });
        await page.locator('#steward-close').click();
      }
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.evaluate(() => { ageOfAsh.game.buildings = ageOfAsh.game.buildings.filter(b => b.team !== 'player' || b.type === 'core'); });
      await page.locator('#btn-stewards').click(); const emptyState = await fingerprint(page); const empty = await jump('military');
      check('沒有軍事建築仍可頂端對齊且不自動建造', empty.titleVisible && empty.titleAligned && empty.focused && await page.locator('details[data-producer]').count() === 0 && emptyState === await fingerprint(page));
      await page.screenshot({ path: path.join(out, 'after-no-producer.png') });
      await page.keyboard.press('Escape');
      check('Escape關閉並保留原本暫停', await page.evaluate(() => !document.querySelector('#steward-dialog').open && ageOfAsh.game.paused));
    }
    check('零程式錯誤', result.errors.length === 0);
    result.status = mode === 'before' ? 'REPRODUCED_DISCOVERABILITY_GAP_NOT_PRODUCTION_RULE_DEFECT' : 'PASS_CONTROLLED_UI';
  } catch (e) { result.status = 'FAIL'; result.failure = String(e.stack || e); process.exitCode = 1; }
  finally { await context?.close(); await browser?.close(); save(); }
})();
