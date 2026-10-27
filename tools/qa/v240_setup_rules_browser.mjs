import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync, copyFileSync } from 'node:fs';
import { resolve } from 'node:path';
const {chromium}=createRequire(import.meta.url)('playwright-core');
const a=process.argv.slice(2),arg=n=>a[a.indexOf(n)+1],out=resolve(arg('--out')),commit=arg('--commit'),url=arg('--url');mkdirSync(out,{recursive:true});
const b=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const c=await b.newContext({viewport:{width:1280,height:720},recordVideo:{dir:out,size:{width:1280,height:720}},acceptDownloads:true}),p=await c.newPage();
const checks=[],errors=[],requests=[],failed=[],actions=[];const check=(name,pass,detail)=>{checks.push({name,pass:!!pass,detail});if(!pass)throw Error(name)};
p.on('console',m=>{if(m.type()==='error')errors.push(m.text())});p.on('pageerror',e=>errors.push(e.message));p.on('requestfailed',r=>failed.push({url:r.url(),error:r.failure()?.errorText}));p.on('response',r=>requests.push({url:r.url(),status:r.status()}));
try{
  await p.goto(url,{waitUntil:'networkidle'});await p.waitForFunction(()=>ageOfAsh?.playtestBuild?.resourceVerification==='SHA256_MATCH_33_FILES');
  const build=await p.evaluate(()=>ageOfAsh.playtestBuild);check('exact 33-file artifact',build.commit===commit,build);
  await p.locator('#setup-seed').fill('RULES-NATURAL');await p.locator('#setup-civ').selectOption('FRK');await p.locator('#setup-biome').selectOption('steppe');
  await p.locator('#btn-settings').click();await p.locator('#settings-ui-scale').selectOption('1.3');await p.locator('#btn-settings-close').click();
  const snap=()=>p.evaluate(()=>{const s=ageOfAsh.game.snapshot();delete s.savedAt;return JSON.stringify(s)});const before=await snap();
  const locales=[];
  for(const locale of ['en','zh-Hant','zh-Hans','ja']){
    await p.locator('#setup-locale').selectOption(locale);await p.locator('#btn-setup-rules').click();
    await p.waitForFunction(()=>document.getElementById('setup-rules-dialog').open);
    const info=await p.evaluate(()=>{const d=document.querySelector('#setup-rules-dialog'),r=d.getBoundingClientRect();return {lang:document.documentElement.lang,text:d.innerText,entries:d.querySelectorAll('dd').length,width:r.width,x:r.x,right:r.right,height:r.height,bottom:r.bottom,overflow:d.scrollWidth>d.clientWidth,scale:ageOfAsh.ui.settings.uiScale}});
    check(`${locale} localized rules and layout at 130% text`,info.lang===locale&&info.entries===7&&info.text.includes('RULES-NATURAL')&&info.text.includes('40')&&info.text.includes('60')&&info.text.includes('5, 10')&&!/rules\.(open|title|waves|caps|on|off)\b/.test(info.text)&&!info.overflow&&info.x>=0&&info.right<=1280&&info.bottom<=720&&info.scale===1.3,info);
    await p.screenshot({path:resolve(out,`rules-${locale}.png`)});locales.push(info);
    await p.keyboard.press('Escape');check(`${locale} Escape closes dialog`,!(await p.locator('#setup-rules-dialog').evaluate(d=>d.open)));
  }
  check('opening translated rules preserves simulation and RNG',before===await snap());
  await p.locator('#btn-setup-rules').click();await p.keyboard.press('Enter');
  check('Enter inside modal cannot start a run',await p.evaluate(()=>ageOfAsh.game.inMenu));
  if(await p.locator('#setup-rules-dialog').evaluate(d=>d.open))await p.keyboard.press('Escape');
  await p.locator('#setup-civ').selectOption('TEU');await p.locator('#setup-locale').selectOption('en');await p.locator('#btn-setup-rules').click();
  const capacity=await p.locator('#setup-rules-list').innerText();check('uncapped civilization shows building capacity instead of stale Frank cap',capacity.includes('capacity provided')&&!capacity.includes('up to 40'),capacity);
  await p.locator('#btn-setup-rules-close').click();await p.locator('#btn-start').click();await p.waitForFunction(()=>!ageOfAsh.game.inMenu);
  const start=await p.evaluate(()=>({seed:ageOfAsh.game.seed,civ:ageOfAsh.game.civ.id,biome:ageOfAsh.game.biome.id,wave:ageOfAsh.game.waveIndex,units:ageOfAsh.game.units.length}));check('natural Start uses selected unchanged setup',start.civ==='TEU'&&start.biome==='steppe'&&start.units>0,start);
  const actor=await p.evaluate(()=>{const g=ageOfAsh.game,u=g.units.find(u=>u.type==='militia'),pos=g.screenPos(u.x,u.y);return{id:u.id,x:u.x,y:u.y,sx:pos.x,sy:pos.y-18*g.camera.zoom}});
  await p.mouse.click(actor.sx,actor.sy);check('natural unit selection after rules query',await p.evaluate(id=>ageOfAsh.game.selection.some(u=>u.id===id),actor.id),actor);
  const dest=await p.evaluate(()=>ageOfAsh.game.screenPos(32,29));await p.mouse.click(dest.x,dest.y,{button:'right'});actions.push({unit:actor.id,command:'right-click move',goal:[32,29]});
  await p.waitForFunction(id=>{const u=ageOfAsh.game.units.find(u=>u.id===id);return u&&Math.hypot(u.x-32,u.y-29)<2.5},actor.id,{timeout:45000});
  await p.screenshot({path:resolve(out,'natural-game.png')});
  await p.locator('#btn-pause').click();await p.locator('#btn-save').click();await p.reload();await p.waitForFunction(()=>ageOfAsh?.playtestBuild?.resourceVerification==='SHA256_MATCH_33_FILES');
  check('saved run available after reload',await p.locator('#btn-continue').isEnabled());await p.locator('#btn-continue').click();
  const restored=await p.evaluate(()=>({menu:ageOfAsh.game.inMenu,civ:ageOfAsh.game.civ.id,seed:ageOfAsh.game.seed,units:ageOfAsh.game.units.length}));check('natural Save Reload Continue',!restored.menu&&restored.civ===start.civ&&restored.seed===start.seed&&restored.units>0,restored);
  await p.locator('#playtest-info-toggle').click();const downloadPromise=p.waitForEvent('download');await p.locator('#playtest-download').click();const download=await downloadPromise;await download.saveAs(resolve(out,'bug-report.json'));await p.locator('#playtest-close').click();
  check('no console page HTTP or request errors',!errors.length&&!failed.length&&!requests.some(r=>r.status>=400),{errors,failed});
}catch(e){checks.push({name:'run complete',pass:false,detail:{message:e.message,stack:e.stack}});try{await p.screenshot({path:resolve(out,'failure.png')})}catch{}}
const result={source_commit:commit,stage:'AFTER_LOCAL',mode:'NATURAL_UI_NO_STATE_FIXTURES',checks,actions,errors,failed,requests,pass:checks.every(t=>t.pass)};writeFileSync(resolve(out,'browser.json'),JSON.stringify(result,null,2)+'\n');const v=p.video();await c.close();if(v)copyFileSync(await v.path(),resolve(out,'setup-rules.webm'));await b.close();console.log(JSON.stringify({pass:result.pass,checks:checks.map(x=>[x.name,x.pass])}));if(!result.pass)process.exit(1);
