// Director 唯讀重現：使用未修改正式 build 與原生 Chromium 輸入。
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { createRequire } = require('node:module');
const { chromium } = createRequire('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/package.json')('playwright-core');
const root = '/workspace/riftwatch-fun-lab-281169b5';
const build = path.join(root, 'build-before');
const out = path.join(root, 'director');
const source = 'f6ae896bb3554ae7b6d131c734d9ac51d9f07131';
const mime = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json', '.png':'image/png', '.svg':'image/svg+xml', '.ttf':'font/ttf' };
const manifest = JSON.parse(fs.readFileSync(path.join(build,'build-metadata.json')));
for (const [name, expected] of Object.entries(manifest.files)) {
  const actual = crypto.createHash('sha256').update(fs.readFileSync(path.join(build,name))).digest('hex');
  if (actual !== expected) throw new Error('Build manifest mismatch: '+name);
}
let browser;
const record = { source, classification:'DIRECT_CHROMIUM_UI_GAP_REPRODUCTION', rawArtifactsOnlyInDirector:true, noPublicAdapter:true, stateInjection:false, transport:'OFFLINE_ROUTE_UNCHANGED_FORMAL_PAYLOAD_NO_LISTEN_SOCKET', environmentNote:'首次 local server listen 被 sandbox 以 EPERM 拒絕；此版本改由 Playwright 靜態回應未修改正式檔案，未繞過任何遠端服務或讀取外站。', tests:[], errors:[] };
const began = new Date().toISOString();
(async () => {
  try {
    browser = await chromium.launch({ executablePath:'/usr/bin/chromium', headless:true, args:['--no-sandbox'] });
    record.browser = browser.version();
    const context = await browser.newContext({ viewport:{width:1440,height:900} });
    const page = await context.newPage();
    await page.route('http://127.0.0.1:28118/**',route=>{
      const name=decodeURIComponent(new URL(route.request().url()).pathname);
      const file=path.resolve(build,'.'+(name==='/'?'/index.html':name));
      if(!file.startsWith(build+path.sep)) return route.fulfill({status:403,body:''});
      try { return route.fulfill({status:200,contentType:mime[path.extname(file)]||'application/octet-stream',body:fs.readFileSync(file)}); }
      catch { return route.fulfill({status:404,body:''}); }
    });
    page.on('pageerror',e=>record.errors.push(e.message));
    await page.goto('http://127.0.0.1:28118/',{waitUntil:'networkidle'});
    await page.waitForFunction(()=>window.ageOfAsh && !document.querySelector('#btn-start').disabled);
    record.buildVerification = await page.evaluate(()=>({commit:ageOfAsh.playtestBuild.commit,hash:ageOfAsh.playtestBuild.resourceVerification}));
    if (record.buildVerification.commit!==source || !record.buildVerification.hash.startsWith('SHA256_MATCH_')) throw Error('Formal build verification failed');
    await page.locator('#setup-locale').selectOption('zh-Hant');
    await page.locator('#setup-civ').selectOption('FRK');
    await page.locator('#setup-biome').selectOption('steppe');
    await page.locator('#setup-difficulty').selectOption('normal');
    await page.locator('#setup-seed').fill('FUN-LAB-BASE-281169B5');
    await page.locator('#btn-start').click();
    await page.keyboard.press('F2');
    const read = () => page.evaluate(()=>{
      const g=ageOfAsh.game;
      return {sim:g.time,phase:g.phase,seed:g.seed,selection:g.selection.map(u=>({id:u.id,type:u.type,state:u.state,manualAttack:!!u.manualAttack,target:u.target?.id,order:u.tacticalOrder?.type,protectedId:u.tacticalOrder?.protectedId})),markers:g.commandMarkers.length,battleText:document.querySelector('#battle-actions')?.innerText,hint:document.querySelector('.battle-hint')?.innerText};
    });
    const ground = await page.evaluate(()=>{
      const g=ageOfAsh.game;
      for (const [x,y] of [[1090,530],[1060,550],[1090,460],[1050,500],[1000,530]]) {
        if (!g.pickAt(x,y) && document.elementFromPoint(x,y)?.tagName==='CANVAS') return {x,y,world:g.worldAt(x,y)};
      }
      return null;
    });
    if (!ground) throw Error('No visible empty native click location');
    const beforeMove = await read();
    await page.mouse.click(ground.x,ground.y,{button:'right'});
    const immediateMove = await read();
    await page.waitForTimeout(1300);
    const delayedMove = await read();
    await page.screenshot({path:path.join(out,'direct-move-after-1.3s.png')});
    record.tests.push({name:'原生右鍵空地是移動，0.8秒標記後無持續命令語意',ground,before:beforeMove,immediate:immediateMove,delayed:delayedMove,checks:{nativeMoveAccepted:immediateMove.selection.length>0&&immediateMove.selection.every(u=>u.state==='move'&&!u.manualAttack),markerExpired:delayedMove.markers===0,staticHintUnchanged:beforeMove.hint===delayedMove.hint}});
    await page.locator('#btn-core-defense').click();
    const immediateGuard = await read();
    await page.waitForTimeout(3000);
    const delayedGuard = await read();
    await page.screenshot({path:path.join(out,'direct-guard-after-3s.png')});
    record.tests.push({name:'援護城心實際接受護衛；toast後未持續顯示護衛語意',immediate:immediateGuard,delayed:delayedGuard,checks:{nativeGuardAccepted:immediateGuard.selection.length>0&&immediateGuard.selection.every(u=>u.order==='guard'&&u.protectedId===1),markerExpired:delayedGuard.markers===0,staticHintUnchanged:beforeMove.hint===delayedGuard.hint}});
    record.status = record.tests.every(t=>Object.values(t.checks).every(Boolean)) && record.errors.length===0 ? 'UI_GAP_REPRODUCED_NO_GAMEPLAY_BUG_CLAIM' : 'CHECK_FAILED';
    await context.close();
  } catch(e) { record.status='REPRO_ERROR';record.error=String(e.stack||e); }
  finally {
    if (browser) await browser.close();
    record.startedAtUtc=began;record.finishedAtUtc=new Date().toISOString();
    fs.writeFileSync(path.join(out,'DIRECT-CHROMIUM-BEFORE.json'),JSON.stringify(record,null,2)+'\n');
    process.stdout.write(JSON.stringify({status:record.status,tests:record.tests.map(t=>({name:t.name,checks:t.checks})),errors:record.errors,error:record.error})+'\n');
    if (record.status!=='UI_GAP_REPRODUCED_NO_GAMEPLAY_BUG_CLAIM') process.exitCode=1;
  }
})();
