const fs = require('node:fs'), path = require('node:path');
const { chromium } = require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright-core');
const [mode, build, out] = process.argv.slice(2);
if (!['before', 'after'].includes(mode) || !build || !out || fs.existsSync(out)) throw Error('需要模式、正式構建與全新目錄');
fs.mkdirSync(out, { recursive: true });
const meta = JSON.parse(fs.readFileSync(build + '/build-metadata.json'));
const result = { mode, source: meta.commit, scope: 'CONTROLLED_PICKING_FIXTURE：原生Start與戰術暫停，受控新增一台可見衝車，沒有自然戰役或勝利宣稱。點擊與布令走原生滑鼠；Game只做觀察與設定明示的幾何夾具。', checks: [], points: [], errors: [] };
const save = () => fs.writeFileSync(out + '/result.json', JSON.stringify(result, null, 2));
const check = (name, pass, data = {}) => { result.checks.push({ name, pass: !!pass, ...data }); save(); if (!pass) throw Error(name); };
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml' };
let browser, context;
(async () => {
  try {
    browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] }); result.browser = browser.version();
    context = await browser.newContext({ viewport: { width: 1440, height: 900 }, recordVideo: { dir: out + '/video', size: { width: 960, height: 600 } } });
    const page = await context.newPage(); page.on('pageerror', e => result.errors.push(e.message));
    await page.route('http://127.0.0.1:28148/**', route => {
      const u = new URL(route.request().url()).pathname, f = path.resolve(build, '.' + (u === '/' ? '/index.html' : decodeURIComponent(u)));
      if (!f.startsWith(path.resolve(build) + path.sep)) return route.fulfill({ status: 403, body: '' });
      try { return route.fulfill({ status: 200, contentType: mime[path.extname(f)] || 'application/octet-stream', body: fs.readFileSync(f) }); } catch { return route.fulfill({ status: 404, body: '' }); }
    });
    await page.goto('http://127.0.0.1:28148/', { waitUntil: 'networkidle' }); await page.waitForFunction(() => window.ageOfAsh && !document.querySelector('#btn-start').disabled);
    check('正式來源與資源閘門', await page.evaluate(({ sha, n }) => ageOfAsh.playtestBuild.commit === sha && ageOfAsh.playtestBuild.resourceVerification === `SHA256_MATCH_${n}_FILES`, { sha: meta.commit, n: Object.keys(meta.files).length }));
    await page.locator('#setup-locale').selectOption('zh-Hant'); await page.locator('#setup-civ').selectOption('FRK'); await page.locator('#setup-biome').selectOption('steppe'); await page.locator('#setup-seed').fill('RAM-PICK-065E2912'); await page.locator('#btn-start').click();
    await page.locator('#btn-tactical-plan').click();
    check('原生戰術暫停已開啟', await page.evaluate(() => ageOfAsh.game.paused && !document.querySelector('#tactical-planner').hidden));
    const fixture = await page.evaluate(async () => {
      const g = ageOfAsh.game, r = ageOfAsh.renderer, { directionalAnimationFrame } = await import('/js/visuals.js'), { Renderer } = await import('/js/renderer.js');
      let spot;
      for (let dx = -5; dx <= 5 && !spot; dx++) for (let dy = -5; dy <= 5 && !spot; dy++) {
        const x = g.hero.x + dx, y = g.hero.y + dy, d = Math.hypot(dx, dy);
        if (d < 3 || d > 5.8 || !g.isWalkable(x, y, g.hero) || g.units.some(u => u.alive && Math.hypot(u.x - x, u.y - y) < 2.5)) continue;
        const proxy = { x, y, team: 'enemy', alive: true };
        if (g.isVisible(proxy)) spot = { x, y };
      }
      if (!spot) throw Error('沒有合法孤立可見夾具位置');
      const u = g.spawnUnit('ram', spot.x, spot.y, 'enemy'); u.visualDirection = 'E';
      g.focusAt(u.x, u.y); g.camera.x = g.camera.targetX; g.camera.y = g.camera.targetY;
      const p = g.screenPos(u.x, u.y), scale = g.camera.zoom * (u.typeDef.scale || 1), frame = directionalAnimationFrame(u);
      const receiver = Object.create(r); receiver.ctx = document.createElement('canvas').getContext('2d'); receiver.ctx.canvas.width = r.w; receiver.ctx.canvas.height = r.h;
      Renderer.prototype.drawUnit.call(receiver, u, g, g.time);
      const moving = ['move', 'return', 'build', 'gather'].includes(u.state), bob = moving ? Math.abs(Math.cos(u.walkPhase)) * 1.2 : Math.sin(g.time * 2 + u.id) * .35;
      const points = [[19, -19, 'wood-right'], [-19, -19, 'wood-left'], [25, -13, 'metal-head'], [16, -29, 'wood-roof']].map(([x, y, name]) => {
        const sx = p.x + frame.mirror * x * scale, sy = p.y + frame.depthScale * (y - bob * .5) * scale;
        return { name, x: sx, y: sy, rgba: [...receiver.ctx.getImageData(Math.round(sx), Math.round(sy), 1, 1).data], pickedId: g.pickAt(sx, sy)?.id ?? null, pickedType: g.pickAt(sx, sy)?.type ?? null };
      });
      return { ramId: u.id, ramVisible: g.isVisible(u), zoom: g.camera.zoom, frame, points, center: { x: p.x, y: p.y - 18 * g.camera.zoom }, rng: g.rng.state, visualRng: g.visualRng.state, time: g.time, collisionRadius: u.typeDef.radius, attackRange: u.typeDef.range };
    });
    result.fixture = fixture; result.points = fixture.points; save();
    check('衝車可見且正式木殼有不透明像素', fixture.ramVisible && fixture.points.filter(p => p.name.startsWith('wood') && p.rgba[3] > 220).length >= 2);
    const point = fixture.points.find(p => p.name === 'wood-right');
    check(mode === 'before' ? '重現可見木殼未被pickAt辨識' : '可見木殼可被pickAt辨識', point.rgba[3] > 220 && (mode === 'before' ? point.pickedId !== fixture.ramId : point.pickedId === fixture.ramId), { point });
    await page.locator('[data-plan="select"]').click(); await page.mouse.click(point.x, point.y);
    const selected = await page.evaluate(id => ageOfAsh.game.selection.some(u => u.id === id), fixture.ramId);
    check(mode === 'before' ? '原生木殼點擊確實未選到衝車' : '原生木殼點擊確實選到衝車', mode === 'before' ? !selected : selected);
    await page.screenshot({ path: out + '/native-wood-click.png' });
    await page.mouse.click(fixture.center.x, fixture.center.y);
    check('原有中央點擊仍可選取', await page.evaluate(id => ageOfAsh.game.selection.some(u => u.id === id), fixture.ramId));
    await page.screenshot({ path: out + '/native-center-click.png' });
    await page.locator('[data-plan="army"]').click(); await page.locator('[data-plan="attack"]').click(); await page.mouse.click(point.x, point.y);
    const stagedAtBody = (await page.locator('.plan-summary').textContent()).trim();
    check(mode === 'before' ? '木殼點擊未排入集火的流程重現' : '木殼點擊排入正式集火', mode === 'before' ? !stagedAtBody : !!stagedAtBody, { summary: stagedAtBody });
    if (mode === 'before') { await page.mouse.click(fixture.center.x, fixture.center.y); check('中央點擊可排入正式集火', !!(await page.locator('.plan-summary').textContent()).trim()); }
    await page.screenshot({ path: out + '/native-attack-plan.png' });
    check('暫停幾何查閱與選取不耗RNG或模擬時間', await page.evaluate(f => ageOfAsh.game.time === f.time && ageOfAsh.game.rng.state === f.rng && ageOfAsh.game.visualRng.state === f.visualRng, fixture));
    if (mode === 'after') {
      const matrix = await page.evaluate(async ramId => {
        const g = ageOfAsh.game, r = ageOfAsh.renderer, u = g.units.find(e => e.id === ramId), { Renderer } = await import('/js/renderer.js'), { directionalAnimationFrame } = await import('/js/visuals.js');
        const original = { team: u.team, state: u.state, visualDirection: u.visualDirection, hitFlash: u.hitFlash, attackAnim: u.attackAnim, zoom: g.camera.zoom, targetZoom: g.camera.targetZoom };
        const c = document.createElement('canvas').getContext('2d'); c.canvas.width = c.canvas.height = 192;
        const receiver = Object.create(r); receiver.ctx = c; const rows = [];
        for (const team of ['player', 'enemy']) for (const z of [.78, 1, 1.6]) for (const direction of ['E', 'SE', 'S', 'SW', 'W', 'NW', 'N', 'NE']) for (const pose of ['idle', 'move', 'attack', 'hit']) {
          u.team = team; u.visualDirection = direction; u.state = pose === 'move' ? 'move' : 'idle'; u.hitFlash = pose === 'hit' ? .5 : 0; u.attackAnim = pose === 'attack' ? .5 : 0; g.camera.zoom = g.camera.targetZoom = z;
          const p = g.screenPos(u.x, u.y), scale = z * (u.typeDef.scale || 1), f = directionalAnimationFrame(u), bob = pose === 'move' ? Math.abs(Math.cos(u.walkPhase)) * 1.2 : Math.sin(g.time * 2 + u.id) * .35;
          c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, 192, 192); c.translate(96 - p.x, 96 - p.y); Renderer.prototype.drawUnit.call(receiver, u, g, g.time);
          const project = (x, y) => ({ x: p.x + f.mirror * (x - (f.state === 'hit' ? 2.5 : 0)) * scale, y: p.y + f.depthScale * (y - bob * .5 - (f.state === 'hit' ? 1.5 : 0)) * scale });
          const points = [[19, -19], [-19, -19], [25, -13], [16, -29]].map(([x, y]) => {
            const q = project(x, y), alpha = c.getImageData(Math.round(q.x - p.x + 96), Math.round(q.y - p.y + 96), 1, 1).data[3];
            return { x, y, alpha, picked: g.pickAt(q.x, q.y)?.id === u.id };
          });
          const outside = [[48, -18], [12, -49], [35, 4]].map(([x, y]) => { const q = project(x, y); return g.pickAt(q.x, q.y)?.id !== u.id; });
          rows.push({ team, z, direction, pose, points, opaqueSamples: points.filter(p => p.alpha > 220).length, outside, pass: points.every(p => p.picked) && points.filter(p => p.alpha > 220).length >= 2 && outside.every(Boolean) });
        }
        Object.assign(u, { team: original.team, state: original.state, visualDirection: original.visualDirection, hitFlash: original.hitFlash, attackAnim: original.attackAnim }); g.camera.zoom = original.zoom; g.camera.targetZoom = original.targetZoom;
        return rows;
      }, fixture.ramId);
      result.matrix = matrix; save();
      check('192組雙方／三縮放／八向／四姿態正式繪圖與拾取案例', matrix.length === 192 && matrix.every(row => row.pass), { cases: matrix.length, failed: matrix.filter(row => !row.pass).slice(0, 8) });
      check('矩陣還原夾具後RNG與暫停時間仍相同', await page.evaluate(f => ageOfAsh.game.time === f.time && ageOfAsh.game.rng.state === f.rng && ageOfAsh.game.visualRng.state === f.visualRng, fixture));
      await page.locator('[data-plan="resume"]').click();
      check('原生恢復執行既有集火且指向所點衝車', await page.evaluate(id => ageOfAsh.game.units.some(u => u.team === 'player' && u.alive && u.manualAttack && u.target?.id === id), fixture.ramId));
      await page.screenshot({ path: out + '/native-attack-executed.png' });
    }
    check('零程式錯誤', result.errors.length === 0); result.status = mode === 'before' ? 'REPRODUCED_UI_RAM_BODY_PICK_MISMATCH' : 'PASS_CONTROLLED_NATIVE_RAM_BODY_PICK';
  } catch (e) { result.status = 'FAIL'; result.failure = String(e.stack || e); process.exitCode = 1; }
  finally { await context?.close(); await browser?.close(); save(); }
})();
