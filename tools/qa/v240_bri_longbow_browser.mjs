import {createRequire} from 'node:module';
import {mkdirSync,writeFileSync,copyFileSync} from 'node:fs';
const {chromium}=createRequire(import.meta.url)('playwright-core');
const [url,source,out]=process.argv.slice(2);mkdirSync(out,{recursive:true});
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const context=await browser.newContext({viewport:{width:1440,height:900},recordVideo:{dir:out,size:{width:1440,height:900}}});
const page=await context.newPage(),checks=[],errors=[],network=[],observed={};
const check=(name,pass,detail)=>checks.push({name,pass:!!pass,detail});
page.on('pageerror',e=>errors.push({kind:'page',message:e.message}));page.on('console',m=>{if(m.type()==='error')errors.push({kind:'console',message:m.text()})});
page.on('requestfailed',r=>network.push({url:r.url(),error:r.failure()?.errorText}));page.on('response',r=>{if(r.status()>=400)network.push({url:r.url(),status:r.status()})});
try {
 await page.goto(url);await page.waitForFunction(()=>/^SHA256_MATCH_\d+_FILES$/.test(window.ageOfAsh?.playtestBuild?.resourceVerification || ''));
 const metadata=await page.evaluate(()=>ageOfAsh.playtestBuild);check('exact committed committed artifact',metadata.commit===source,metadata);
 await page.locator('#setup-civ').selectOption('BRI');await page.locator('#setup-seed').fill('BRI-LONGBOW-VISUAL');await page.locator('#btn-start').click();
 await page.waitForFunction(()=>ageOfAsh?.renderer?.unitSpriteAtlases.get('BRI:archer')?.ready);
 await page.evaluate(async()=>{window.atlasAPI=await import('./js/sprite-atlas.js')});
 await page.evaluate(()=>{
  const g=ageOfAsh.game,r=ageOfAsh.renderer;g.paused=true;g.phase='prep';g.prepTimer=1e6;g.units=[];g.selection=[];g.world.resources=[];g.world.props=[];g.world.wildlife=[];
  for(const t of g.world.tiles)t.terrain='grass';r.terrainKey='';
  window.soundCalls=[];const arrow=g.sound.arrow.bind(g.sound);g.sound.arrow=type=>{soundCalls.push(type);return arrow(type)};window.actor=g.spawnUnit('archer',29,33);window.bow=g.spawnUnit('skirmisher',31,33);window.sword=g.spawnUnit('militia',27,33);window.horse=g.spawnUnit('light_cavalry',29,36);
  g.focusAt(29,33);g.camera.x=g.camera.targetX;g.camera.y=g.camera.targetY;g.camera.zoom=g.camera.targetZoom=2;
  const draw=r.drawSpriteAtlasUnit.bind(r);window.visualStates={};window.attackFrames=[];r.drawSpriteAtlasUnit=(u,p,s,v,t)=>{if(u===actor){visualStates[v.state]=(visualStates[v.state]||0)+1;if(v.state==='attack'){const e=r.unitSpriteAtlases.get(atlasAPI.unitSpriteAtlasKey(u,ageOfAsh.game.civ.id)),f=atlasAPI.atlasFrame(e.descriptor,v.direction,v.state,t,atlasAPI.atlasActionProgress(u,v.state)).frame;if(!attackFrames.includes(f))attackFrames.push(f)}}return draw(u,p,s,v,t)};
 });
 const asset=await page.evaluate(()=>{const e=ageOfAsh.renderer.unitSpriteAtlases.get('BRI:archer');return{width:e.image.naturalWidth,height:e.image.naturalHeight,src:e.descriptor.src}});
 check('independent external longbow loaded',asset.width===2048&&asset.height===1280,asset);
 await page.evaluate(()=>ageOfAsh.renderer.unitSpriteAtlases.get('BRI:archer').failed=true);await page.waitForTimeout(150);await page.screenshot({path:out+'/before-canvas.png'});
 await page.evaluate(()=>ageOfAsh.renderer.unitSpriteAtlases.get('BRI:archer').failed=false);await page.waitForTimeout(150);await page.screenshot({path:out+'/after-atlas.png'});
 // Direction gallery is explicitly posed, separate from the production motion/combat below.
 for(const direction of ['E','SE','S','SW','W','NW','N','NE']){
  await page.evaluate(d=>{actor.visualDirection=d;actor.state='move'},direction);await page.waitForTimeout(80);await page.screenshot({path:out+`/direction-${direction}.png`});
 }
 await page.evaluate(()=>{const g=ageOfAsh.game;actor.state='idle';g.selection=[actor];actor.selected=true;const p=ageOfAsh.renderer.screen(g,33,34);g.issueCommand(p.x,p.y);g.paused=false;window.startPosition={x:actor.x,y:actor.y}});
 await page.waitForFunction(()=>Math.hypot(actor.x-startPosition.x,actor.y-startPosition.y)>1,null,{timeout:12000});
 const move=await page.evaluate(()=>({start:startPosition,end:{x:actor.x,y:actor.y},state:actor.state}));check('production move command advances longbow',Math.hypot(move.end.x-move.start.x,move.end.y-move.start.y)>1,move);
 await page.screenshot({path:out+'/moving.png'});
 const targetPoint=await page.evaluate(()=>{const g=ageOfAsh.game;window.enemy=g.spawnUnit('brute',actor.x+1,actor.y,'enemy');window.enemyStartHP=enemy.hp;enemy.attackCooldown=999;g.selection=[actor];bow.hold=true;sword.hold=true;horse.hold=true;const p=ageOfAsh.renderer.screen(g,enemy.x,enemy.y);return{x:p.x,y:p.y-18*g.camera.zoom}});
 await page.mouse.click(targetPoint.x,targetPoint.y,{button:'right'});
 await page.waitForFunction(()=>actor.shots>0&&enemy.hp<enemyStartHP&&visualStates.attack>0,null,{timeout:15000});await page.waitForFunction(()=>attackFrames.length===4,null,{timeout:5000});await page.screenshot({path:out+'/combat.png'});check('production longbow uses existing arrow sound',await page.evaluate(()=>soundCalls.includes('archer')),await page.evaluate(()=>soundCalls));
 const combat=await page.evaluate(()=>({enemyHP:enemy.hp,startHP:enemyStartHP,actorState:actor.state,shots:actor.shots,seen:{...visualStates},attackFrames:[...attackFrames]}));check('production ranged attack and live state synchronization',combat.enemyHP<combat.startHP&&combat.shots>0&&combat.seen.attack>0&&combat.attackFrames.length===4,combat);
 await page.evaluate(()=>{ageOfAsh.game.applyDamage(actor,1,enemy);ageOfAsh.game.paused=true});await page.waitForTimeout(100);await page.screenshot({path:out+'/hit.png'});
 check('production damage displays hit animation',await page.evaluate(()=>visualStates.hit>0),await page.evaluate(()=>({hitFlash:actor.hitFlash,seen:{...visualStates}})));
 await page.evaluate(()=>{ageOfAsh.game.killEntity(actor,enemy);actor.deathAnim=.5});await page.waitForTimeout(100);await page.screenshot({path:out+'/death.png'});
 check('production death displays terminal atlas',await page.evaluate(()=>!actor.alive&&visualStates.death>0),await page.evaluate(()=>({...visualStates})));
 const isolation=await page.evaluate(()=>({other:atlasAPI.unitSpriteAtlasKey({type:'archer',team:'player'},'TEU'),enemy:atlasAPI.unitSpriteAtlasKey({type:'archer',team:'enemy'},'BRI')}));check('civilization and enemy isolation',isolation.other==='archer'&&isolation.enemy==='archer',isolation);
 const fallback=await page.evaluate(()=>{const r=ageOfAsh.renderer,e=r.unitSpriteAtlases.get('BRI:archer');e.failed=true;const used=r.drawSpriteAtlasUnit(actor,{x:300,y:300},1,{state:'idle',direction:'E'},0);e.failed=false;return used});check('failed asset retains procedural fallback',fallback===false,{used:fallback});
 // Fixed static simulation, serial renderer-only A/B; not rAF/FPS or hardware acceptance.
 const perf=await page.evaluate(()=>{const g=ageOfAsh.game,r=ageOfAsh.renderer;g.units=[];for(let i=0;i<100;i++)g.spawnUnit('archer',20+i%10,20+Math.floor(i/10));g.camera.zoom=g.camera.targetZoom=1.4;const e=r.unitSpriteAtlases.get('BRI:archer'),runs=[];for(let repeat=0;repeat<3;repeat++)for(const mode of(repeat%2?['atlas','fallback']:['fallback','atlas'])){e.failed=mode==='fallback';for(let j=0;j<20;j++)r.draw(g,0);const samples=[];for(let j=0;j<80;j++){const start=performance.now();r.draw(g,0);samples.push(performance.now()-start)}samples.sort((a,b)=>a-b);runs.push({repeat,mode,samples,mean:samples.reduce((a,b)=>a+b,0)/samples.length,p50:samples[Math.ceil(samples.length*.5)-1],p95:samples[Math.ceil(samples.length*.95)-1]})}e.failed=false;return runs});
 writeFileSync(out+'/render-samples.json',JSON.stringify(perf,null,2));check('bounded 100-unit renderer JS within budget and no >20% median regression',perf.filter(x=>x.mode==='atlas').every(x=>x.mean<=33.3&&x.p95<=50&&x.p50<=perf.find(y=>y.repeat===x.repeat&&y.mode==='fallback').p50*1.2),perf.map(({samples,...x})=>x));
 check('no browser or network errors',errors.length===0&&network.length===0,{errors,network});
} catch(e){check('browser execution',false,{message:e.message,stack:e.stack,state:await page.evaluate(()=>({actor:window.actor?{x:actor.x,y:actor.y,state:actor.state,shots:actor.shots,target:actor.target?.id}:null,seen:window.visualStates,paused:ageOfAsh?.game?.paused})).catch(()=>null)});await page.screenshot({path:out+'/failure.png'}).catch(()=>{})}
const video=page.video();await context.close();copyFileSync(await video.path(),out+'/browser.webm');await browser.close();
const result={mode:'AFTER_LOCAL_CONTROLLED_VISUAL_SCENE_NOT_NATURAL_PLAY',source_commit:source,browser:'Chromium',checks,errors,network,pass:checks.length>0&&checks.every(x=>x.pass)};
writeFileSync(out+'/browser.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));if(!result.pass)process.exitCode=1;
