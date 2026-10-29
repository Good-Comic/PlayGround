// 繁體中文：原生入口＋明示受控場景，測正式格擋。 / English: Native start plus explicit controlled fixtures, production block.
import {createRequire} from 'node:module';
import {mkdirSync,writeFileSync,copyFileSync,existsSync} from 'node:fs';
const {chromium}=createRequire(import.meta.url)('playwright-core');
const [url,source,out]=process.argv.slice(2);
if(!url?.startsWith('http://127.0.0.1:')||!/^[a-f0-9]{40}$/.test(source||'')||existsSync(out))throw Error('Fresh local output and exact SHA required');
mkdirSync(out,{recursive:true});
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const context=await browser.newContext({viewport:{width:1440,height:900},recordVideo:{dir:out,size:{width:1440,height:900}}});
const page=await context.newPage(),checks=[],errors=[];
const check=(name,pass,detail)=>{checks.push({name,pass:!!pass,detail});if(!pass)throw Error(name)};
page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});page.on('response',r=>{if(r.status()>=400)errors.push(r.url()+':'+r.status())});page.on('requestfailed',r=>errors.push(r.url()));
try{
 await page.goto(url);await page.waitForFunction(()=>/^SHA256_MATCH_\d+_FILES$/.test(window.ageOfAsh?.playtestBuild?.resourceVerification||''));
 check('exact artifact verified',await page.evaluate(s=>ageOfAsh.playtestBuild.commit===s,source),await page.evaluate(()=>ageOfAsh.playtestBuild));
 await page.locator('#setup-civ').selectOption('JPN');await page.locator('#setup-seed').fill('JPN-BLOCK-REPAIR');await page.locator('#btn-start').click();
 await page.waitForFunction(()=>ageOfAsh.renderer.unitSpriteAtlases.get('JPN:guard')?.ready);
 const point=await page.evaluate(()=>{
  const g=ageOfAsh.game,r=ageOfAsh.renderer;g.paused=true;g.phase='prep';g.prepTimer=1e6;g.autoEconomy=false;g.autoMilitary=false;g.units=[];g.projectiles=[];g.zones=[];g.particles=[];g.world.resources=[];g.world.props=[];g.world.wildlife=[];
  for(const t of g.world.tiles)t.terrain='grass';r.terrainKey='';
  window.actor=g.spawnUnit('guard',29,33);actor.stance='passive';actor.state='hold';actor.hold=true;window.foe=g.spawnUnit('brute',30,33,'enemy');foe.cooldown=0;
  g.focusAt(actor.x,actor.y);g.camera.x=g.camera.targetX;g.camera.y=g.camera.targetY;g.camera.zoom=g.camera.targetZoom=2;
  window.incoming=[];const attack=g.attackUnit.bind(g);g.attackUnit=(u,t)=>{const hp=t.hp,cd=t._blockCd;attack(u,t);if(t===actor)incoming.push({time:g.time,hpBefore:hp,hpAfter:t.hp,cdBefore:cd,cdAfter:t._blockCd,source:u.type})};
  window.initialHP=actor.hp;return r.screen(g,actor.x,actor.y);
 });
 await page.mouse.click(point.x,point.y-25);await page.evaluate(()=>ageOfAsh.game.paused=false);
 await page.waitForFunction(()=>incoming.length>=1,null,{timeout:15000});await page.evaluate(()=>ageOfAsh.game.paused=true);
 const first=await page.evaluate(()=>({row:incoming[0],unitCiv:actor.civ??null,civ:ageOfAsh.game.civ.id,text:ageOfAsh.game.particles.filter(p=>p.kind==='text').map(p=>p.text)}));
 await page.screenshot({path:out+'/first-block.png'});check('real enemy first melee is blocked on production JPN guard',first.row.hpBefore===first.row.hpAfter&&Math.abs(first.row.cdAfter-first.row.time-10)<1e-8,first);
 check('existing localized block feedback rendered',first.text.length>0,first.text);
 await page.evaluate(()=>ageOfAsh.game.paused=false);await page.waitForFunction(()=>incoming.length>=2,null,{timeout:10000});await page.evaluate(()=>ageOfAsh.game.paused=true);
 const second=await page.evaluate(()=>incoming[1]);check('second production melee hits during cooldown',second.hpAfter<second.hpBefore&&second.cdAfter===incomingSafe(first),second);
 function incomingSafe(f){return f.row.cdAfter}
 await page.screenshot({path:out+'/cooldown-hit.png'});
 await page.evaluate(()=>ageOfAsh.game.paused=false);await page.waitForFunction(()=>incoming.filter(x=>x.hpBefore===x.hpAfter).length>=2,null,{timeout:20000});await page.evaluate(()=>ageOfAsh.game.paused=true);
 const rows=await page.evaluate(()=>incoming);const blocks=rows.filter(x=>x.hpBefore===x.hpAfter);check('live cooldown rearms after ten simulation seconds',blocks[1].time-blocks[0].time>=10&&rows.some(x=>x.hpAfter<x.hpBefore),rows);
 await page.screenshot({path:out+'/rearmed-block.png'});
 const saved=await page.evaluate(()=>{const g=ageOfAsh.game,s=JSON.parse(JSON.stringify(g.snapshot())),id=actor.id,foeId=foe.id;g.restore(s);window.actor=g.units.find(u=>u.id===id);window.foe=g.units.find(u=>u.id===foeId);g.paused=true;const hp=actor.hp,cd=actor._blockCd;g.attackUnit(foe,actor);return{hpBefore:hp,hpAfter:actor.hp,cd,restored:actor._blockCd,time:g.time,civ:g.civ.id}});
 check('actual JSON SaveLoad retains active cooldown and damage',saved.hpAfter<saved.hpBefore&&saved.cd===saved.restored&&saved.restored>saved.time,saved);
 const exclusions=await page.evaluate(()=>{const g=ageOfAsh.game;actor._blockCd=0;const result=[];
  const bow=g.spawnUnit('marauder',31,33,'enemy');let hp=actor.hp;g.spawnProjectile(actor.x,actor.y,actor,20,'enemy',1,bow);g.updateProjectiles(0);result.push({kind:'arrow',damaged:actor.hp<hp,cd:actor._blockCd});
  const boss=g.spawnUnit('warlord',32,33,'enemy');hp=actor.hp;g.zones=[{x:actor.x,y:actor.y,r:2,delay:0,elapsed:0,damage:20,source:boss,kind:'boss',done:false}];g.updateZones(.01);result.push({kind:'boss-zone',damaged:actor.hp<hp,cd:actor._blockCd});
  hp=actor.hp;g.zones=[{x:actor.x,y:actor.y,r:2,delay:0,elapsed:0,damage:20,source:foe,kind:'fire',done:false}];g.updateZones(.01);result.push({kind:'ordinary-source-zone',damaged:actor.hp<hp,cd:actor._blockCd});return result});
 check('actual arrow, Boss zone and ordinary-source zone bypass block without spending readiness',exclusions.every(x=>x.damaged&&x.cd===0),exclusions);
 await page.screenshot({path:out+'/zone-damage.png'});
 const other=await page.evaluate(async()=>{const {CIVILIZATIONS}=await import('./js/data.js');const g=ageOfAsh.game;g.civ=CIVILIZATIONS.find(c=>c.id==='TEU');actor._blockCd=0;const hp=actor.hp;g.attackUnit(foe,actor);return {before:hp,after:actor.hp,cd:actor._blockCd}});
 check('other civilization does not inherit block',other.after<other.before&&other.cd===0,other);
 check('no browser or network errors',errors.length===0,errors);
}catch(e){checks.push({name:'execution',pass:false,detail:{message:e.message,stack:e.stack}});await page.screenshot({path:out+'/failure.png'}).catch(()=>{});}
const video=page.video();await context.close();copyFileSync(await video.path(),out+'/browser.webm');await browser.close();
const result={mode:'CONTROLLED_FIXTURE_PRODUCTION_COMBAT_NOT_NATURAL_CAMPAIGN',source_commit:source,checks,errors,pass:checks.length>0&&checks.every(c=>c.pass)};
writeFileSync(out+'/browser.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));if(!result.pass)process.exitCode=1;
