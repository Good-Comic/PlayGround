import{recoverNativeSavePause}from'./native_save_pause.mjs';
import{installWorkerDamageObserver}from'./worker_damage_observer.mjs';
import{createV5Player}from'./v5_player.mjs';
// Legal player-policy automation: actual UI commands only; never grants resources,
// health, units, clock progress, boons, age or waves. Read-only state inspection
// is used to choose actions and persist evidence. Native aid settings are explicitly verified.
import{createRequire}from'node:module';import{mkdirSync,writeFileSync,appendFileSync,copyFileSync,existsSync,readFileSync}from'node:fs';import{resolve}from'node:path';import{createHash}from'node:crypto';
const{chromium}=createRequire(import.meta.url)('playwright-core'),a=process.argv.slice(2),arg=(n,d)=>{const i=a.indexOf(n);return i<0?d:a[i+1]},url=arg('--url'),commit=arg('--commit'),out=resolve(arg('--out')),seconds=Number(arg('--seconds','1800')),policy=arg('--policy','v2'),speed=arg('--speed','1.5'),armySteward=arg('--army-steward','off')==='on';mkdirSync(out,{recursive:true});
const harnessHash=createHash('sha256').update(readFileSync(new URL(import.meta.url))).update(readFileSync(new URL('./v5_player.mjs',import.meta.url))).update(readFileSync(new URL('./worker_damage_observer.mjs',import.meta.url))).update(readFileSync(new URL('./native_save_pause.mjs',import.meta.url))).digest('hex');
const b=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']}),c=await b.newContext({viewport:{width:1280,height:800},recordVideo:{dir:out,size:{width:640,height:400}}}),p=await c.newPage();const errors=[],failures=[],actions=[],started=Date.now();
const record=(kind,data)=>{const row={wallSeconds:(Date.now()-started)/1000,kind,...data};appendFileSync(resolve(out,'events.jsonl'),JSON.stringify(row)+'\n');if(kind==='action')actions.push(row)};
p.on('pageerror',e=>{errors.push(e.message);record('page-error',{message:e.message})});p.on('console',m=>{if(m.type()==='error'){errors.push(m.text());record('console-error',{message:m.text()})}});p.on('requestfailed',r=>failures.push(r.url()));
const state=()=>p.evaluate(()=>{const g=ageOfAsh.game;return{seed:g.seed,difficulty:g.difficulty,paused:g.paused,version:g.world.generationVersion,phase:g.phase,cycle:g.cycle,wave:g.waveIndex+1,simulationSeconds:g.runTime,clock:g.waveClock,prep:g.prepTimer,resources:{...g.resources},population:{mil:g.militaryPopulation,eco:g.economicPopulation,cap:g.militaryPopCap},core:g.getTownCenter()?{id:g.getTownCenter().id,hp:g.getTownCenter().hp,maxHp:g.getTownCenter().maxHp}:null,age:g.ageLevel,ageCost:g.ageCost(),ageResearch:g.ageResearch,boons:g.boons.map(b=>b.id),choices:g.boonChoices.map(b=>b.id),units:g.units.filter(u=>u.alive).map(u=>({id:u.id,type:u.type,team:u.team,state:u.state,x:u.x,y:u.y,hp:u.hp,gatherType:u.gatherTarget?.resource||u.carryType||null,target:u.target?.id,orderFailure:u.orderFailure})),buildings:g.buildings.map(b=>({id:b.id,type:b.type,x:b.x,y:b.y,hp:b.hp,alive:b.alive,construction:b.construction,queue:b.queue.map(q=>q.type)})),stats:{...g.stats},hero:g.hero?{alive:g.hero.alive,hp:g.hero.hp,mark:g.hero.markCd,aegis:g.hero.aegisCd}:null}});
async function select(id){const pos=await p.evaluate(id=>{const g=ageOfAsh.game,u=g.units.find(u=>u.id===id)||g.buildings.find(u=>u.id===id);if(!u?.alive)return null;const q=g.screenPos(u.x+(u.w||0)/2,u.y+(u.h||0)/2);return{x:q.x,y:q.y-(u.w?22:18)*g.camera.zoom}},id);if(!pos||pos.x<270||pos.x>1210||pos.y<130||pos.y>620)return false;await p.mouse.click(pos.x,pos.y);return p.evaluate(id=>ageOfAsh.game.selection.some(u=>u.id===id),id)}
async function command(id){const q=p.locator(`[data-command="${id}"]`);if(await q.count()&&await q.isEnabled()){try{await q.click({timeout:1200});record('action',{command:id});return true}catch(e){if(e.name!=='TimeoutError')throw e;record('action-skipped',{command:id,reason:'NATIVE_UI_TIMEOUT_NO_FORCE_CLICK'});return false}}return false}
async function build(type){const worker=await p.evaluate(()=>ageOfAsh.game.units.find(u=>u.alive&&u.type==='villager'&&u.state!=='build')?.id);if(!worker||!await select(worker))return false;for(let i=0;i<5;i++){if(await command('build:'+type))break;if(!await command('build:page'))return false}const armed=await p.evaluate(type=>ageOfAsh.game.placement?.type===type,type);if(!armed)return false;
 for(const [x,y]of (policy.startsWith('v5.')?Array.from({length:121},(_,i)=>[15+i%11*2,17+Math.floor(i/11)*2]).sort((a,b)=>Math.hypot(a[0]-25,a[1]-27)-Math.hypot(b[0]-25,b[1]-27)):['v3','v4','v5'].includes(policy)?[[26,23],[26,27],[24,28],[21,26],[20,22],[23,20],[28,24],[28,28],[30,26],[24,28],[25,30],[23,20],[19,24],[25,20],[23,31]]:[[23,20],[25,20],[28,28],[23,31],[26,31],[21,31],[28,31],[22,18],[26,18],[30,26],[19,24]])){const pos=await p.evaluate(([x,y])=>{const g=ageOfAsh.game,d=g.buildingDefs[g.placement.type];return g.screenPos(x+d.w/2,y+d.h/2)},[x,y]);if(pos.x<270||pos.x>1200||pos.y<145||pos.y>620)continue;await p.mouse.move(pos.x,pos.y);await p.waitForTimeout(80);if(await p.evaluate(()=>ageOfAsh.game.placement?.valid)){await p.mouse.click(pos.x,pos.y);record('action',{command:'place',type,world:[x,y]});return true}}
 await p.keyboard.press('Escape');return false;
}
async function defend(s) {
 const threat=s.units.filter(u=>u.team==='enemy'&&Math.hypot(u.x-25,u.y-26)<(['v3','v4','v5'].includes(policy)?8:13)).sort((a,b)=>Math.hypot(a.x-25,a.y-26)-Math.hypot(b.x-25,b.y-26))[0];
 const target=threat?{x:threat.x,y:threat.y}:{x:28,y:26};
 for(const type of ['militia','spearman','archer','commander']) {
  const u=s.units.find(u=>u.team==='player'&&u.type===type&&u.state==='idle');
  if(!u||!await select(u.id))continue;
  const pos=await p.evaluate(id=>{const g=ageOfAsh.game,u=g.units.find(u=>u.id===id),q=g.screenPos(u.x,u.y);return{x:q.x,y:q.y-18*g.camera.zoom}},u.id);
  await p.mouse.dblclick(pos.x,pos.y);await p.keyboard.press('Shift+A');
  if(!await p.evaluate(()=>ageOfAsh.game.orderMode==='attackMove'))continue;
  const goal=await p.evaluate(v=>ageOfAsh.game.screenPos(v.x,v.y),target);
  if(goal.x>270&&goal.x<1210&&goal.y>130&&goal.y<620){await p.mouse.click(goal.x,goal.y);record('action',{command:'defensive-attack-move',type,target})}
  else await p.keyboard.press('Escape');
 }
 const barracks=s.buildings.find(b=>b.alive&&b.type==='barracks');
 if(barracks&&await select(barracks.id)) {
  const goal=await p.evaluate(()=>ageOfAsh.game.screenPos(28,26));await p.mouse.click(goal.x,goal.y,{button:'right'});record('action',{command:'rally',building:barracks.id,world:[28,26]});
 }
}
async function economy(s) {
 if((policy==='v5'||s.population.eco>=12)&&await p.evaluate(()=>ageOfAsh.game.autoEconomy)){
  await p.locator('#btn-pause').click();await p.locator('#auto-econ').uncheck();await p.locator('#btn-resume').click();record('action',{command:policy==='v5'?'manual-worker-economy':'stop-auto-worker-training-at12'});
 }
 for(const worker of s.units.filter(u=>u.team==='player'&&u.type==='villager')){
  const danger=s.units.some(u=>u.team==='enemy'&&Math.hypot(u.x-worker.x,u.y-worker.y)<3.5);
  if(!danger&&worker.state!=='idle')continue;
  if(!await select(worker.id))continue;
  let target;
  if(danger) target={x:21,y:24};
  else target=await p.evaluate(({resources,counts,v5})=>{const g=ageOfAsh.game,type=v5?(counts.gold<2?'gold':counts.food<3?'food':resources.wood<200?'wood':'food'):(resources.food<200?'food':resources.wood<180?'wood':'gold');return g.world.resources.filter(n=>n.alive&&n.amount>0&&n.resource===type&&!g.units.some(u=>u.alive&&u.team==='enemy'&&Math.hypot(u.x-n.x,u.y-n.y)<5)).sort((a,b)=>Math.hypot(a.x-25,a.y-26)-Math.hypot(b.x-25,b.y-26))[0]},{resources:s.resources,counts:{gold:s.units.filter(u=>u.team==='player'&&u.gatherType==='gold').length,food:s.units.filter(u=>u.team==='player'&&u.gatherType==='food').length},v5:policy==='v5'});
  if(!target)continue;const pos=await p.evaluate(v=>ageOfAsh.game.screenPos(v.x,v.y),target);
  if(pos.x>270&&pos.x<1210&&pos.y>130&&pos.y<620){await p.mouse.click(pos.x,pos.y,{button:'right'});record('action',{command:danger?'withdraw-threatened-worker':'assign-idle-worker',worker:worker.id,target:{x:target.x,y:target.y}})}
 }
}
const openingPolicy=arg('--opening-policy','legacy'),defense=arg('--defense','workers');
const adaptive=createV5Player({page:p,record,build,openingPolicy,defense});
let result={status:'INCOMPLETE'},naturalVictory=false;
try{
 await p.goto(url,{waitUntil:'networkidle'});await p.waitForFunction(()=>ageOfAsh?.playtestBuild?.resourceVerification?.startsWith('SHA256_MATCH_'));if(await p.evaluate(()=>ageOfAsh.playtestBuild.commit)!==commit)throw Error('SOURCE_MISMATCH');
 const resume=arg('--resume');
 if(resume){
  const raw=readFileSync(resolve(resume)),digest=createHash('sha256').update(raw).digest('hex');
  if(digest!==arg('--resume-sha256'))throw Error('RESUME_DIGEST_MISMATCH');
  const snapshot=JSON.parse(raw);if(snapshot.version!==1||!['prep','wave'].includes(snapshot.phase)||!snapshot.buildings?.some(b=>b.type==='core'&&b.alive&&b.hp>0))throw Error('RESUME_REQUIRES_LIVING_OBSERVED_RUN');
  await p.locator('#btn-settings').click();await p.locator('#settings-speed').selectOption(speed);await p.locator('#btn-settings-close').click();
  await p.evaluate(snapshot=>localStorage.setItem('riftwatch.playtest.v227.run.v1',JSON.stringify(snapshot)),snapshot);
  await p.reload();await p.waitForFunction(()=>ageOfAsh?.playtestBuild?.resourceVerification?.startsWith('SHA256_MATCH_'));await p.locator('#btn-continue').click();record('action',{command:'ContinueObservedSave',snapshotSha256:digest,priorWave:snapshot.waveIndex+1,priorRunTime:snapshot.runTime});
 }else{
 await p.locator('#setup-difficulty').selectOption(arg('--difficulty','normal'));await p.locator('#setup-seed').fill(arg('--seed','MILESTONE-NORMAL'));await p.locator('#setup-civ').selectOption('TEU');await p.locator('#setup-biome').selectOption('steppe');
 // Use a supported user-facing speed; report simulation/wall discrepancy rather
 // than assume the game's known low-FPS cap is semantically correct.
 await p.locator('#btn-settings').click();await p.locator('#settings-speed').selectOption(speed);await p.locator('#btn-settings-close').click();await p.locator('#btn-start').click();record('action',{command:'Start',mode:'standard',speed:Number(speed),policy});
 if(['v3','v4','v5'].includes(policy)){await p.locator('#btn-pause').click();await p.locator('#auto-mil').uncheck();await p.locator('#btn-resume').click();record('action',{command:'disable-auto-military-manual-ranged-production'})}
 }
 if(policy.startsWith('v5.')){await p.locator('#btn-pause').click();await p.locator('#auto-mil').setChecked(armySteward);await p.locator('#auto-econ').uncheck();await p.locator('#btn-resume').click();const actual=await p.evaluate(()=>({armySteward:ageOfAsh.game.autoMilitary,autoEconomy:ageOfAsh.game.autoEconomy,speed:ageOfAsh.game.speed}));record('action',{command:'manual-economy-army-setting',requested:{armySteward,speed:Number(speed)},actual});if(actual.armySteward!==armySteward||actual.autoEconomy||actual.speed!==Number(speed))throw Error('NATIVE_SETTINGS_MISMATCH')}
 await p.exposeFunction('qaWorkerHit',row=>record('worker-hit',row));await p.evaluate(installWorkerDamageObserver);record('observer',{type:'WORKER_DAMAGE_FORWARD_ONLY'});
 const actualDifficulty=await p.evaluate(()=>ageOfAsh.game.difficulty);if(actualDifficulty!==arg('--difficulty','normal'))throw Error('DIFFICULTY_MISMATCH');record('difficulty',{requested:arg('--difficulty','normal'),actual:actualDifficulty});
 let lastPhase='',lastShot=0,lastPolicy=0,lastSave=0;const gameStart=Date.now();
 while((Date.now()-gameStart)/1000<seconds&&!existsSync(resolve(out,'STOP_REQUESTED'))){
  const s=await state(),wall=(Date.now()-gameStart)/1000;record('state',s);writeFileSync(resolve(out,'latest-state.json'),JSON.stringify(s,null,2)+'\n');
  if(lastPhase!==s.phase+':'+s.wave||wall-lastShot>60){await p.screenshot({path:resolve(out,`wave-${s.wave}-${s.phase}-${Math.floor(wall)}.png`)});lastShot=wall;lastPhase=s.phase+':'+s.wave}
  if(s.paused&&['prep','wave'].includes(s.phase)){await recoverNativeSavePause(p,record);continue}
  if(s.phase==='victory'&&policy.startsWith('v5.')&&!naturalVictory){
   naturalVictory=true;record('natural-victory',{wave:s.wave,cycle:s.cycle,stats:s.stats});writeFileSync(resolve(out,'natural-victory.json'),JSON.stringify(await p.evaluate(()=>ageOfAsh.game.snapshot()),null,2)+'\n');
   await p.locator('#next-cycle-choice').waitFor({state:'visible',timeout:10000});const wanted=['siege_math','night_watch','farwatch','citizen_arms'];const ids=[...wanted.filter(id=>s.boons.includes(id)),...s.boons.filter(id=>!wanted.includes(id))].slice(0,3);
   for(const id of ids)await p.locator(`#next-cycle-cards input[value="${id}"]`).check();await p.locator('#btn-next-cycle').scrollIntoViewIfNeeded();await p.locator('#btn-next-cycle').click();record('action',{command:'NaturalVictoryNextCycle',inherited:ids});continue;
  }
  if(naturalVictory&&s.cycle===2&&s.phase==='wave'&&s.clock>=26&&await p.evaluate(()=>ageOfAsh.game.waveSpawns.some(g=>g.cycleFlank&&g.spawned))){result={status:'NATURAL_VICTORY_AND_NGPLUS_FLANK_VERIFIED',state:s};break}
  if(s.phase==='victory'||s.phase==='defeat'){result={status:s.phase==='victory'?'NATURAL_VICTORY':'NATURAL_DEFEAT',state:s,wallSeconds:wall};break}
  if(errors.length){result={status:'BROWSER_ERROR',state:s};break}
  if(s.phase==='boon'){
    const priority=(policy==='v5'||policy.startsWith('v5.'))?['rift_prototype','siege_math','night_watch','farwatch','citizen_arms','butcher','fire_oil','veteran_honors']:['rift_prototype','tc_regen','siege_math','veteran_honors'];const index=Math.max(0,priority.map(id=>s.choices.indexOf(id)).find(i=>i>=0)??0);await p.locator('.boon-card').nth(index).click();await p.locator('#btn-claim').click();record('action',{command:'claim-boon',id:s.choices[index]});await p.waitForTimeout(1000);continue;
  }
  if(wall-lastPolicy>6){lastPolicy=wall;
    if(policy.startsWith('v5.'))await adaptive.step(s);
    else if(['v4','v5'].includes(policy))await economy(s);
    if(!policy.startsWith('v5.'))await defend(s);
    // Native defensive construction and production/technology choices, paid by
    // the game's normal affordability checks. No GM shortcuts are used.
    const towers=s.buildings.filter(b=>b.alive&&b.type==='tower').length,houses=s.buildings.filter(b=>b.alive&&b.type==='house').length;
    if(policy.startsWith('v5.')){/* recovery and production handled above */}
    else if(['v4','v5'].includes(policy)&&s.age<3&&!s.ageResearch&&Object.entries(s.ageCost).every(([k,v])=>s.resources[k]>=v)&&s.core&&await select(s.core.id))await command('age:advance');
    else if(policy==='v5'&&houses<8&&s.resources.wood>=60)await build('house');
    else if(['v3','v4','v5'].includes(policy)&&!s.buildings.some(b=>b.alive&&b.type==='range')&&s.resources.wood>=120)await build('range');
    else if(['v3','v4','v5'].includes(policy)&&(!['v4','v5'].includes(policy)||s.resources.wood>250)&&s.buildings.filter(b=>b.alive&&b.type==='farm').length<3&&s.resources.wood>=60)await build('farm');
    else if(towers<(['v3','v4','v5'].includes(policy)?2:3)&&s.resources.wood>=80&&s.resources.stone>=60)await build('tower');
    else if((!['v4','v5'].includes(policy)||s.population.mil>s.population.cap-6)&&houses<(['v3','v4','v5'].includes(policy)?3:5)&&s.resources.wood>=60)await build('house');
    else if(!s.buildings.some(b=>b.alive&&b.type==='range')&&s.resources.wood>=120)await build('range');
    else if(!['v4','v5'].includes(policy)&&s.age<3&&s.resources.food>600&&s.resources.gold>250&&s.core&&await select(s.core.id))await command('age:advance');
    else if(['v3','v4','v5'].includes(policy)&&(!['v4','v5'].includes(policy)||s.units.filter(u=>u.team==='player'&&u.type==='archer').length<6)&&s.resources.wood>=35&&s.resources.gold>=25){const range=s.buildings.find(b=>b.alive&&b.type==='range'&&b.queue.length<2);if(range&&await select(range.id))await command('train:archer')}
    else {const barracks=s.buildings.find(b=>b.alive&&b.type==='barracks'&&b.queue.length<2);if(barracks&&s.resources.food>(['v4','v5'].includes(policy)?60:120)&&await select(barracks.id))await command('train:militia')}
    if(s.units.some(u=>u.team==='enemy')&&s.hero?.alive){if(s.hero.aegis<=0){await p.keyboard.press('e');record('action',{command:'hero-aegis'})}if(s.hero.mark<=0){await p.keyboard.press('q');record('action',{command:'hero-mark'})}}
  }
  if(wall-lastSave>90){
   const eligible=await p.evaluate(()=>!ageOfAsh.game.paused&&!ageOfAsh.game.inMenu&&['prep','wave'].includes(ageOfAsh.game.phase));
   if(eligible){try{await p.locator('#btn-pause').click({timeout:1200})}catch(e){if(e.name!=='TimeoutError')throw e;const observed=await p.evaluate(()=>({paused:ageOfAsh.game.paused,phase:ageOfAsh.game.phase}));record('action-skipped',{command:'native-save-checkpoint',reason:'PAUSE_CLICK_TIMEOUT',observed});if(observed.paused)await recoverNativeSavePause(p,record);continue}
    await p.locator('#btn-save').click();await p.locator('#btn-resume').click();lastSave=wall;writeFileSync(resolve(out,`checkpoint-${Math.floor(wall)}.json`),JSON.stringify(await p.evaluate(()=>ageOfAsh.game.snapshot()),null,2)+'\n');record('action',{command:'native-save-checkpoint'})}
  }
  await p.waitForTimeout(2000);
 }
 if(result.status==='INCOMPLETE')result={status:'BOUNDED_SAMPLE_INCOMPLETE',state:await state(),seconds};
}catch(e){result={status:e.name==='TimeoutError'?'HARNESS_ACTION_TIMEOUT':'HARNESS_OR_GAME_ERROR',error:e.message,stack:e.stack};await p.screenshot({path:resolve(out,'failure.png')}).catch(()=>{})}
try{writeFileSync(resolve(out,'save-snapshot.json'),JSON.stringify(await p.evaluate(()=>ageOfAsh.game.snapshot()),null,2)+'\n')}catch(e){record('checkpoint-unavailable',{reason:e.name})}
result={source_commit:commit,harness_sha256:harnessHash,difficulty:arg('--difficulty','normal'),user_speed:Number(speed),army_steward:armySteward,opening_policy:openingPolicy,defense,policy_revision:policy,elapsed_wall_seconds:(Date.now()-started)/1000,stop_reason:existsSync(resolve(out,'STOP_REQUESTED'))?'REQUESTED_SAFE_CHECKPOINT':null,stage:'AFTER_LOCAL',mode:arg('--resume')?'NATIVE_UI_OBSERVED_SAVE_CONTINUATION':'NATURAL_UI_LEGAL_POLICY_NO_STATE_INJECTION',policy:policy.startsWith('v5.')?'V5_1_VERIFIED_INPUT_AND_ECONOMY_RECOVERY':policy==='v5'?'V5_TEUTON_HOUSE_DEFENSE_MANUAL_ECONOMY':['v4','v5'].includes(policy)?'V4_ACTUAL_TECH_COSTS_AND_MANUAL_ECONOMY':['v3','v4','v5'].includes(policy)?'V3_NATIVE_RANGED_FARM_DEFENSIVE_MACRO':'V2_NATIVE_ARMY_DEFENSE_AND_RALLY',...result,errors,failures,actions};writeFileSync(resolve(out,'result.json'),JSON.stringify(result,null,2)+'\n');const v=p.video();await c.close();if(v)copyFileSync(await v.path(),resolve(out,'campaign.webm'));await b.close();console.log(JSON.stringify({status:result.status,wave:result.state?.wave,sim:result.state?.simulationSeconds,errors}));
