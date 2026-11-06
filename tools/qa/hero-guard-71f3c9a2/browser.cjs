const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {chromium}=require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright-core');
const [build,out]=process.argv.slice(2);if(!build||!out||fs.existsSync(out))throw Error('fresh evidence directory required');fs.mkdirSync(out,{recursive:true});
const meta=JSON.parse(fs.readFileSync(build+'/build-metadata.json')),result={source:meta.commit,scope:'NATIVE_START_RESCUE_GUARD plus explicitly labelled CONTROLLED_UI_FIXTURE invalid states and viewport/locale matrix. No victory claim.',checks:[],errors:[]};
const save=()=>fs.writeFileSync(out+'/result.json',JSON.stringify(result,null,2));
const check=(name,pass,data={})=>{result.checks.push({name,pass:!!pass,...data});save();if(!pass)throw Error(name);};
for(const [f,h]of Object.entries(meta.files))if(crypto.createHash('sha256').update(fs.readFileSync(build+'/'+f)).digest('hex')!==h)throw Error('resource mismatch '+f);
result.resources=Object.keys(meta.files).length;
let browser,context;
(async()=>{try{
 browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--enable-precise-memory-info']});result.browser=browser.version();
 context=await browser.newContext({viewport:{width:1440,height:900},recordVideo:{dir:out+'/video',size:{width:960,height:600}}});const page=await context.newPage();page.on('pageerror',e=>{result.errors.push(e.message);save();});
 const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.svg':'image/svg+xml'};
 await page.route('http://127.0.0.1:28149/**',route=>{const u=new URL(route.request().url()).pathname,f=path.resolve(build,'.'+(u==='/'?'/index.html':decodeURIComponent(u)));if(!f.startsWith(path.resolve(build)+path.sep))return route.fulfill({status:403,body:''});try{return route.fulfill({status:200,contentType:mime[path.extname(f)]||'application/octet-stream',body:fs.readFileSync(f)});}catch{return route.fulfill({status:404,body:''});}});
 await page.goto('http://127.0.0.1:28149/',{waitUntil:'networkidle'});await page.waitForFunction(()=>window.ageOfAsh&&!document.querySelector('#btn-start').disabled);
 check('exact source and runtime resource gate',await page.evaluate(({sha,n})=>ageOfAsh.playtestBuild.commit===sha&&ageOfAsh.playtestBuild.resourceVerification===`SHA256_MATCH_${n}_FILES`,{sha:meta.commit,n:result.resources}));
 await page.locator('#setup-locale').selectOption('zh-Hant');await page.locator('#setup-civ').selectOption('FRK');await page.locator('#setup-biome').selectOption('steppe');await page.locator('#setup-seed').fill('HERO-GUARD-71F3');await page.locator('#btn-start').click();
 result.seed=await page.evaluate(()=>({numeric:ageOfAsh.game.seed,input:document.querySelector('#setup-seed').value}));
 await page.waitForFunction(()=>ageOfAsh.game.expedition);check('before rescue only original go visible',await page.locator('#rescue-expedition button').first().isVisible()&&!await page.locator('#btn-hero-core-guard').isVisible());
 await page.locator('#rescue-expedition button').first().click();
 const rescueStart=await page.evaluate(()=>({time:ageOfAsh.game.time,hero:{x:ageOfAsh.game.hero.x,y:ageOfAsh.game.hero.y},expedition:{...ageOfAsh.game.expedition}}));result.rescueStart=rescueStart;save();
 await page.waitForFunction(()=>ageOfAsh.game.expedition.rescued>=2,{},{timeout:60000});
 check('native movement completed rescue',await page.evaluate(()=>ageOfAsh.game.expedition.rescued===2));
 await page.waitForFunction(()=>!document.querySelector('#btn-hero-core-guard').hidden);await page.screenshot({path:out+'/rescue-complete.png'});
 check('one replacement button, original go DOM retained',await page.locator('#btn-hero-core-guard').isVisible()&&!await page.locator('#rescue-expedition button').first().isVisible());
 const previous=await page.evaluate(()=>{const g=ageOfAsh.game;g.setSelection(g.units.filter(u=>!u.hero).slice(0,2));return{selection:g.selection.map(u=>u.id),orders:g.units.filter(u=>!u.hero).map(u=>({id:u.id,order:u.tacticalOrder}))};});
 await page.locator('#btn-hero-core-guard').click();
 const issued=await page.evaluate(()=>{const g=ageOfAsh.game,c=g.getTownCenter();return{order:g.hero.tacticalOrder,core:c.id,selection:g.selection.map(u=>u.id),time:g.time,hero:{x:g.hero.x,y:g.hero.y},distance:g.distanceTo(g.hero,c),toast:document.querySelector('.toast-stack')?.textContent};});
 check('click issues native guard to same core and preserves selection',issued.order?.type==='guard'&&issued.order.protectedId===issued.core&&JSON.stringify(issued.selection)===JSON.stringify(previous.selection),issued);
 await page.screenshot({path:out+'/guard-issued.png'});
 await page.waitForFunction(()=>{const g=ageOfAsh.game;return g.distanceTo(g.hero,g.getTownCenter())<2;},{},{timeout:60000});
 result.arrival=await page.evaluate(()=>{const g=ageOfAsh.game;return{time:g.time,hero:{x:g.hero.x,y:g.hero.y},distance:g.distanceTo(g.hero,g.getTownCenter()),order:g.hero.tacticalOrder,phase:g.phase};});check('native path approached and retained core guard',result.arrival.distance<2&&result.arrival.order?.type==='guard',result.arrival);await page.screenshot({path:out+'/guard-arrival.png'});
 await page.waitForTimeout(1500);
 check('native guard remains after approach',await page.evaluate(()=>{const g=ageOfAsh.game;return g.hero.tacticalOrder?.protectedId===g.getTownCenter().id&&g.distanceTo(g.hero,g.getTownCenter())<2;}));
 await page.locator('[data-battle-action="hero"]').click();
 await page.keyboard.down('d');await page.waitForTimeout(400);await page.keyboard.up('d');
 check('later native direct control takes over',await page.evaluate(()=>ageOfAsh.game.heroControl));
 await page.locator('[data-battle-action="hero"]').click();
 const manualPoint=await page.evaluate(()=>{const g=ageOfAsh.game;return g.screenPos(g.hero.x+3,g.hero.y);});
 await page.mouse.click(manualPoint.x,manualPoint.y,{button:'right'});await page.waitForTimeout(300);
 check('later native right-click replaces guard without replay',await page.evaluate(()=>!ageOfAsh.game.hero.tacticalOrder));
 await page.locator('#btn-hero-core-guard').click();check('new explicit click may issue guard again',await page.evaluate(()=>ageOfAsh.game.hero.tacticalOrder?.type==='guard'));
 // From here invalid-state and display checks are controlled fixtures, not natural campaign evidence.
 for(const reason of ['pause','placement','deadHero','deadCore','defeat','victory','boon','dialog','menu']){
  const r=await page.evaluate(reason=>{const g=ageOfAsh.game,ui=ageOfAsh.ui,c=g.getTownCenter(),h=g.hero;const old={phase:g.phase,paused:g.paused,placement:g.placement,alive:h.alive,coreAlive:c.alive,menu:ui.menuVisible};let dialog;
   if(reason==='pause')g.paused=true;if(reason==='placement')g.placement={type:'house'};if(reason==='deadHero')h.alive=false;if(reason==='deadCore')c.alive=false;if(['defeat','victory','boon'].includes(reason))g.phase=reason;if(reason==='menu')ui.menuVisible=true;if(reason==='dialog'){dialog=document.createElement('dialog');dialog.open=true;document.body.append(dialog);}
   ui.heroCoreGuard.update();const button=document.querySelector('#btn-hero-core-guard'),before=JSON.stringify({order:h.tacticalOrder,selection:g.selection.map(u=>u.id),mode:g.orderMode});let toasts=0;const nativeToast=g.toast;g.toast=()=>{toasts++;};button.click();button.dispatchEvent(new MouseEvent('click'));g.toast=nativeToast;const after=JSON.stringify({order:h.tacticalOrder,selection:g.selection.map(u=>u.id),mode:g.orderMode});const disabled=button.disabled;
   g.phase=old.phase;g.paused=old.paused;g.placement=old.placement;h.alive=old.alive;c.alive=old.coreAlive;ui.menuVisible=old.menu;dialog?.remove();ui.heroCoreGuard.update();return{disabled,unchanged:before===after,toasts};},reason);check('CONTROLLED '+reason+' rejects UI command',r.disabled&&r.unchanged&&r.toasts===0,r);
 }
 await page.evaluate(()=>ageOfAsh.game.paused=true);
 for(const width of [1440,800,390])for(const locale of ['zh-Hant','zh-Hans','en','ja']){
  await page.setViewportSize({width,height:900});await page.evaluate(async locale=>{const{setLocale}=await import('/js/i18n.js');setLocale(locale);ageOfAsh.game.paused=false;ageOfAsh.ui.heroCoreGuard.update();},locale);
  const r=await page.locator('#btn-hero-core-guard').evaluate(b=>{const r=b.getBoundingClientRect();return{label:b.textContent,title:b.title,type:b.type,visible:!!r.width&&!!r.height,x:r.x,y:r.y,right:r.right,bottom:r.bottom,disabled:b.disabled};});
  check('CONTROLLED layout '+width+' '+locale,r.type==='button'&&r.visible&&!r.disabled&&r.x>=0&&r.right<=width&&r.bottom<=900&&!r.label.startsWith('heroCoreGuard.'),r);
  await page.screenshot({path:out+`/layout-${width}-${locale}.png`});
 }
 await page.setViewportSize({width:1440,height:900});
 for(const key of ['Space','Enter']){
  await page.locator('#btn-hero-core-guard').focus();await page.keyboard.press(key);
  check('native focus activation '+key,await page.evaluate(()=>ageOfAsh.game.hero.tacticalOrder?.type==='guard'&&!ageOfAsh.game.paused));
 }
 await page.locator('#btn-hero-core-guard').focus();await page.keyboard.press('Tab');check('Tab retains native focus navigation without direct control',await page.evaluate(()=>document.activeElement.id!=='btn-hero-core-guard'&&!ageOfAsh.game.heroControl));
 check('no browser errors',result.errors.length===0);result.status='PASS';save();
 }catch(e){result.status='FAIL';result.failure=String(e.stack||e);save();process.exitCode=1;}finally{await context?.close();await browser?.close();save();}})();
