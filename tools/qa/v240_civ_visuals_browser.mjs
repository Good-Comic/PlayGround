import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const require=createRequire(import.meta.url);let chromium;for(const c of [process.env.PLAYWRIGHT_CORE,'playwright-core',`${process.env.HOME}/.local/share/omgithub-playwright/node_modules/playwright-core`].filter(Boolean)){try{({chromium}=require(c));break;}catch{}}
if(!chromium)throw new Error('playwright-core not found');
const args=process.argv.slice(2),arg=n=>{const i=args.indexOf(n);return i>=0?args[i+1]:null;};
const url=arg('--url')||'http://127.0.0.1:8043/',expected=arg('--commit'),out=resolve(arg('--out')||'docs/evidence/v240-civ-visuals');if(!expected)throw new Error('full commit required');mkdirSync(out,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const context=await browser.newContext({viewport:{width:1600,height:1000},recordVideo:{dir:out,size:{width:1600,height:1000}}}),page=await context.newPage();
const errors=[],failedRequests=[],httpErrors=[],checks=[];page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',r=>failedRequests.push({url:r.url(),error:r.failure()?.errorText}));page.on('response',r=>{if(r.status()>=400)httpErrors.push({url:r.url(),status:r.status()});});const check=(name,pass,detail)=>checks.push({name,pass:!!pass,detail});
try{
 await page.goto(url,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>ageOfAsh?.playtestBuild?.resourceVerification?.startsWith('SHA256_MATCH_'));const build=await page.evaluate(()=>ageOfAsh.playtestBuild);check('exact immutable 29-file artifact loaded',build.commit===expected&&build.resourceVerification==='SHA256_MATCH_29_FILES',build);
 await page.locator('#setup-seed').fill('V240-CIV-VISUALS');await page.locator('#btn-start').click();await page.waitForFunction(()=>ageOfAsh?.game&&!ageOfAsh.game.inMenu);
 await page.evaluate(()=>{const g=ageOfAsh.game;g.paused=true;g.units=[];g.buildings=[];g.selection=[];g.world.resources=[];g.world.props=[];g.world.wildlife=[];for(const t of g.world.tiles)t.terrain='grass';const b=g.addBuilding('barracks',23,23,true),u=g.spawnUnit('guard',28,27);window.__visualBaseline={unitRadius:u.typeDef.radius,building:[b.w,b.h]};g.focusAt(26,25);g.camera.x=g.camera.targetX;g.camera.y=g.camera.targetY;g.camera.zoom=g.camera.targetZoom=2;ageOfAsh.renderer.terrainKey='';});
 const ids=['MNG','TEU','SAR','CHN','AZT'],hashes={};
 for(const id of ids){await page.evaluate(async civId=>{const data=await import('./js/data.js');const civ=data.CIVILIZATIONS.find(item=>item.id===civId),g=ageOfAsh.game;g.civ=civ;g.playerColors={...g.playerColors,primary:civ.accent,cloth:civ.accent};},id);await page.waitForTimeout(220);const bytes=await page.screenshot({path:resolve(out,`family-${id}.png`)});hashes[id]=createHash('sha256').update(bytes).digest('hex');}
 check('five representative civilization families produce distinct battlefield frames',new Set(Object.values(hashes)).size===ids.length,hashes);
 const collision=await page.evaluate(()=>{const u=ageOfAsh.game.units[0],b=ageOfAsh.game.buildings[0];return{before:window.__visualBaseline,after:{unitRadius:u.typeDef.radius,building:[b.w,b.h]}};});
 check('simulation collision sizes remain unchanged by visual family changes',JSON.stringify(collision.before)===JSON.stringify(collision.after),collision);
 check('real Chromium produced no Console Page HTTP or request failures',errors.length===0&&failedRequests.length===0&&httpErrors.length===0,{errors,failedRequests,httpErrors});
}catch(error){checks.push({name:'browser run completed',pass:false,detail:{message:error.message,stack:error.stack}});try{await page.screenshot({path:resolve(out,'failure.png')});}catch{}}
const result={stage:'AFTER_LOCAL',mode:'REAL_UI_START_THEN_CONTROLLED_VISUAL_FAMILY_GALLERY',source_commit:expected,checks,errors,failedRequests,httpErrors,pass:checks.length>0&&checks.every(x=>x.pass)};writeFileSync(resolve(out,'browser.json'),JSON.stringify(result,null,2)+'\n');const video=page.video();await context.close();if(video)copyFileSync(await video.path(),resolve(out,'civ-visual-families.webm'));await browser.close();console.log(JSON.stringify({pass:result.pass,checks:checks.map(x=>[x.name,x.pass]),out},null,2));if(!result.pass)process.exit(1);
