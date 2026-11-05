const { chromium } = require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright-core');
const fs = require('fs'), out = '/workspace/rally-carrier-61ac';
(async () => {
 let browser, context, page; const rows = [], errors = [];
 const save = () => fs.writeFileSync(out + '/browser.json', JSON.stringify({source:'c756e3b05fa767c8f3b55e097d5e68c53cadd64f',scope:'CONTROLLED_RALLY_EVENT: native CHN first-wave plan with only its event replaced by RALLY before native early-wave confirmation. No extra units/resources/HP/time edits. Native mouse army/hero commands and damage. This is not a natural FRK wave5 or ten-wave campaign.',rows,errors},null,2));
 const check = (name, pass, data={}) => { rows.push({name,pass:!!pass,...data}); save(); if(!pass) throw Error(name); };
 try {
  browser = await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
  context = await browser.newContext({viewport:{width:1366,height:900},recordVideo:{dir:out+'/video',size:{width:684,height:450}}});
  page = await context.newPage(); page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8175'); await page.waitForFunction(()=>window.ageOfAsh?.ui?.playtestReady);
  await page.locator('#setup-civ').selectOption('CHN'); await page.locator('#setup-locale').selectOption('zh-Hant'); await page.locator('#setup-seed').fill('RALLY-CARRIER-FUN'); await page.locator('#btn-start').click();
  const fixture = await page.evaluate(async()=>{
   const g=ageOfAsh.game,{EVENT_MODULES}=await import('./js/events.js'),p=g.pendingWavePlan,rng=g.rng.state;
   g.pendingWavePlan={...p,event:EVENT_MODULES.RALLY,eventMods:EVENT_MODULES.RALLY.mods};
   window.flagHits=[]; const damage=g.applyDamage.bind(g);g.applyDamage=(target,amount,source,kind)=>{const hp=target?.hp,flag=ageOfAsh.ui.rallyObjective.carrier(),r=damage(target,amount,source,kind);if(target===flag)flagHits.push({time:g.time,clock:g.waveClock,source:source?.id,team:source?.team,hpBefore:hp,hpAfter:target.hp,kind,status:ageOfAsh.ui.rallyObjective.status()});return r};
   const gate=g.world.camps[p.spawns[0].gate%g.world.camps.length],base=g.world.base;
   return {total:p.totalUnits,spawns:p.spawns,unchangedRng:g.rng.state===rng,intercept:{x:base.x+(gate.x-base.x)*.35,y:base.y+(gate.y-base.y)*.35}};
  });check('event-fixture-retains-native-budget-and-rng',fixture.unchangedRng,{fixture});
  await page.keyboard.press('F2');
  const hero=await page.evaluate(()=>{const g=ageOfAsh.game,s=g.screenPos(g.hero.x,g.hero.y);return{x:s.x,y:s.y-18*g.camera.zoom}});
  await page.keyboard.down('Shift');await page.mouse.click(hero.x,hero.y);await page.keyboard.up('Shift');
  check('native-shift-click-adds-hero-to-army',await page.evaluate(()=>ageOfAsh.game.selection.includes(ageOfAsh.game.hero)));
  await page.evaluate(pos=>ageOfAsh.game.focusAt(pos.x,pos.y),fixture.intercept);await page.waitForTimeout(700);
  const dest=await page.evaluate(pos=>ageOfAsh.game.screenPos(pos.x,pos.y),fixture.intercept);await page.mouse.click(dest.x,dest.y,{button:'right'});
  await page.locator('[data-raid=arm]').click(); await page.locator('[data-raid=confirm]').click();
  await page.waitForFunction(()=>ageOfAsh.game.waveClock>=20.05,null,{timeout:45000});
  const active=await page.evaluate(()=>{const g=ageOfAsh.game,m=ageOfAsh.ui.rallyObjective,flag=m.carrier();return{clock:g.waveClock,state:m.state(),status:m.status(),flag:flag&&{id:flag.id,hp:flag.hp,alive:flag.alive,visible:g.isVisible(flag),x:flag.x,y:flag.y},enemyCount:g.units.filter(u=>u.alive&&u.team==='enemy').length,selected:g.selection.map(u=>u.type),hits:flagHits}});
  check('native-timer-activates-bearer-aura',active.status==='active',{active});
  if(!active.flag?.visible) check('fog-keeps-unseen-bearer-unfocusable',await page.locator('#rally-objective button').isDisabled(),{clock:active.clock});
  await page.waitForFunction(()=>{const g=ageOfAsh.game,m=ageOfAsh.ui.rallyObjective;return m.status()==='active'&&m.carrier()?.alive&&g.isVisible(m.carrier())},null,{timeout:20000});
  check('native-approach-reveals-live-bearer',true,{observation:await page.evaluate(()=>({clock:ageOfAsh.game.waveClock,hp:ageOfAsh.ui.rallyObjective.carrier().hp,army:ageOfAsh.game.selection.map(u=>({id:u.id,x:u.x,y:u.y}))}))});
  await page.locator('#rally-objective button').click();await page.waitForTimeout(150);
  await page.screenshot({path:out+'/active.png'});
  const aura=await page.evaluate(()=>{const g=ageOfAsh.game,m=ageOfAsh.ui.rallyObjective;return g.units.filter(u=>u.alive&&u.team==='enemy').map(u=>({id:u.id,type:u.type,distance:Math.hypot(u.x-m.carrier().x,u.y-m.carrier().y),multiplier:m.multiplier(u),cooldown:g.attackCooldown(u),base:u.typeDef.cooldown}))});
  check('native-enemy-cooldowns-follow-radius',aura.some(u=>u.distance<=4&&u.multiplier===1.1)&&aura.every(u=>u.distance<=4||u.multiplier===1),{aura});
  await page.locator('#btn-pause').click();const paused=await page.evaluate(()=>({clock:ageOfAsh.game.waveClock,state:ageOfAsh.ui.rallyObjective.state(),rng:ageOfAsh.game.rng.state>>>0}));await page.waitForTimeout(1500);
  check('real-pause-freezes-rally',await page.evaluate(before=>ageOfAsh.game.waveClock===before.clock&&JSON.stringify(ageOfAsh.ui.rallyObjective.state())===JSON.stringify(before.state),paused));
  await page.locator('#btn-save').click();const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('riftwatch.playtest.v227.run.v1')));fs.writeFileSync(out+'/native-save.json',JSON.stringify(stored));
  await page.reload();await page.waitForFunction(()=>window.ageOfAsh?.ui?.playtestReady);await page.locator('#btn-continue').click();
  check('native-load-preserves-bearer-and-deadline',await page.evaluate(before=>{const g=ageOfAsh.game,m=ageOfAsh.ui.rallyObjective;return m.state().carrierId===before.state.carrierId&&m.state().expiresAt===before.state.expiresAt&&g.waveClock>=before.clock&&g.waveClock<before.clock+1},paused),{paused});
  // Reload removes logging hooks; reinstall observation only, without changing damage.
  await page.evaluate(()=>{window.flagHits=[];const g=ageOfAsh.game,damage=g.applyDamage.bind(g);g.applyDamage=(target,amount,source,kind)=>{const hp=target?.hp,flag=ageOfAsh.ui.rallyObjective.carrier(),r=damage(target,amount,source,kind);if(target===flag)flagHits.push({time:g.time,clock:g.waveClock,source:source?.id,team:source?.team,hpBefore:hp,hpAfter:target.hp,kind,status:ageOfAsh.ui.rallyObjective.status()});return r}});
  await page.locator('#rally-objective button').click(); await page.waitForTimeout(150);
  const target=await page.evaluate(()=>{const g=ageOfAsh.game,u=ageOfAsh.ui.rallyObjective.carrier(),s=g.screenPos(u.x,u.y);for(const dy of[-18,-26,-10])for(const dx of[0,-6,6])if(g.pickAt(s.x+dx*g.camera.zoom,s.y+dy*g.camera.zoom)===u)return{x:s.x+dx*g.camera.zoom,y:s.y+dy*g.camera.zoom};return null});check('visible-bearer-has-native-click-target',target);
  await page.mouse.click(target.x,target.y,{button:'right'});
  const orders=await page.evaluate(()=>{const g=ageOfAsh.game,id=ageOfAsh.ui.rallyObjective.state().carrierId;return g.selection.map(u=>({id:u.id,type:u.type,target:u.target?.id,manual:u.manualAttack,correct:u.target?.id===id&&u.manualAttack}))});
  check('real-right-click-orders-focus-fire',orders.some(u=>u.correct),{orders});
  const begin=Date.now();while(Date.now()-begin<25000){const s=await page.evaluate(()=>ageOfAsh.ui.rallyObjective.status());if(s==='broken'||s==='expired')break;const aegis=page.locator('[data-battle-action=aegis]');if(await aegis.isVisible()&&await aegis.isEnabled())await aegis.click();await page.waitForTimeout(250)}
  const result=await page.evaluate(()=>{const g=ageOfAsh.game,m=ageOfAsh.ui.rallyObjective;return{clock:g.waveClock,status:m.status(),flag:m.carrier()&&{id:m.carrier().id,hp:m.carrier().hp,alive:m.carrier().alive},hits:flagHits,remaining:g.units.filter(u=>u.alive&&u.team==='enemy').map(u=>({id:u.id,multiplier:m.multiplier(u),cooldown:g.attackCooldown(u),base:u.typeDef.cooldown})),core:g.getTownCenter()?.hp,hero:g.hero?.hp}});
  check('native-attacks-break-banner-before-expiry',result.status==='broken'&&result.clock<35&&result.hits.some(h=>h.hpAfter<=0&&h.team==='player'),{result});
  check('bearer-death-removes-nearby-bonus',result.remaining.every(u=>u.multiplier===1));await page.screenshot({path:out+'/broken.png'});
  check('no-page-errors',errors.length===0);
 } finally {save();if(context){const video=page.video();await context.close();fs.renameSync(await video.path(),out+'/rally-flow.webm')}await browser?.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
