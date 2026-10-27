// Legal player-policy automation: actual UI commands only; never grants resources,
// health, units, clock progress, boons, age or waves. Read-only state inspection
// is used to choose actions and persist evidence. Normal production aids remain on.
import{createRequire}from'node:module';import{mkdirSync,writeFileSync,appendFileSync,copyFileSync}from'node:fs';import{resolve}from'node:path';
const{chromium}=createRequire(import.meta.url)('playwright-core'),a=process.argv.slice(2),arg=(n,d)=>{const i=a.indexOf(n);return i<0?d:a[i+1]},url=arg('--url'),commit=arg('--commit'),out=resolve(arg('--out')),seconds=Number(arg('--seconds','1800'));mkdirSync(out,{recursive:true});
const b=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']}),c=await b.newContext({viewport:{width:1280,height:800},recordVideo:{dir:out,size:{width:640,height:400}}}),p=await c.newPage();const errors=[],failures=[],actions=[],started=Date.now();
const record=(kind,data)=>{const row={wallSeconds:(Date.now()-started)/1000,kind,...data};appendFileSync(resolve(out,'events.jsonl'),JSON.stringify(row)+'\n');if(kind==='action')actions.push(row)};
p.on('pageerror',e=>{errors.push(e.message);record('page-error',{message:e.message})});p.on('console',m=>{if(m.type()==='error'){errors.push(m.text());record('console-error',{message:m.text()})}});p.on('requestfailed',r=>failures.push(r.url()));
const state=()=>p.evaluate(()=>{const g=ageOfAsh.game;return{seed:g.seed,version:g.world.generationVersion,phase:g.phase,wave:g.waveIndex+1,simulationSeconds:g.runTime,clock:g.waveClock,prep:g.prepTimer,resources:{...g.resources},population:{mil:g.militaryPopulation,eco:g.economicPopulation,cap:g.militaryPopCap},core:g.getTownCenter()?{id:g.getTownCenter().id,hp:g.getTownCenter().hp,maxHp:g.getTownCenter().maxHp}:null,age:g.ageLevel,boons:g.boons.map(b=>b.id),choices:g.boonChoices.map(b=>b.id),units:g.units.filter(u=>u.alive).map(u=>({id:u.id,type:u.type,team:u.team,state:u.state,x:u.x,y:u.y,hp:u.hp,target:u.target?.id,orderFailure:u.orderFailure})),buildings:g.buildings.map(b=>({id:b.id,type:b.type,x:b.x,y:b.y,hp:b.hp,alive:b.alive,construction:b.construction,queue:b.queue.map(q=>q.type)})),stats:{...g.stats},hero:g.hero?{alive:g.hero.alive,hp:g.hero.hp,mark:g.hero.markCd,aegis:g.hero.aegisCd}:null}});
async function select(id){const pos=await p.evaluate(id=>{const g=ageOfAsh.game,u=g.units.find(u=>u.id===id)||g.buildings.find(u=>u.id===id);if(!u?.alive)return null;const q=g.screenPos(u.x+(u.w||0)/2,u.y+(u.h||0)/2);return{x:q.x,y:q.y-(u.w?22:18)*g.camera.zoom}},id);if(!pos||pos.x<270||pos.x>1210||pos.y<130||pos.y>620)return false;await p.mouse.click(pos.x,pos.y);return p.evaluate(id=>ageOfAsh.game.selection.some(u=>u.id===id),id)}
async function command(id){const q=p.locator(`[data-command="${id}"]`);if(await q.count()&&await q.isEnabled()){await q.click({timeout:1200});record('action',{command:id});return true}return false}
async function build(type){const worker=await p.evaluate(()=>ageOfAsh.game.units.find(u=>u.alive&&u.type==='villager'&&u.state!=='build')?.id);if(!worker||!await select(worker))return false;for(let i=0;i<5;i++){if(await command('build:'+type))break;if(!await command('build:page'))return false}const armed=await p.evaluate(type=>ageOfAsh.game.placement?.type===type,type);if(!armed)return false;
 for(const [x,y]of [[23,20],[25,20],[28,28],[23,31],[26,31],[21,31],[28,31],[22,18],[26,18],[30,26],[19,24]]){const pos=await p.evaluate(([x,y])=>{const g=ageOfAsh.game,d=g.buildingDefs[g.placement.type];return g.screenPos(x+d.w/2,y+d.h/2)},[x,y]);if(pos.x<270||pos.x>1200||pos.y<145||pos.y>620)continue;await p.mouse.move(pos.x,pos.y);await p.waitForTimeout(80);if(await p.evaluate(()=>ageOfAsh.game.placement?.valid)){await p.mouse.click(pos.x,pos.y);record('action',{command:'place',type,world:[x,y]});return true}}
 await p.keyboard.press('Escape');return false;
}
async function defend(s) {
 const threat=s.units.find(u=>u.team==='enemy'&&Math.hypot(u.x-25,u.y-26)<13);
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
let result={status:'INCOMPLETE'};
try{
 await p.goto(url,{waitUntil:'networkidle'});await p.waitForFunction(()=>ageOfAsh?.playtestBuild?.resourceVerification?.startsWith('SHA256_MATCH_'));if(await p.evaluate(()=>ageOfAsh.playtestBuild.commit)!==commit)throw Error('SOURCE_MISMATCH');
 await p.locator('#setup-seed').fill(arg('--seed','MILESTONE-NORMAL'));await p.locator('#setup-civ').selectOption('TEU');await p.locator('#setup-biome').selectOption('steppe');
 // Use a supported user-facing speed; report simulation/wall discrepancy rather
 // than assume the game's known low-FPS cap is semantically correct.
 await p.locator('#btn-settings').click();await p.locator('#settings-speed').selectOption('1.5');await p.locator('#btn-settings-close').click();await p.locator('#btn-start').click();record('action',{command:'Start',mode:'standard',speed:1.5});
 let lastPhase='',lastShot=0,lastPolicy=0,lastSave=0;const gameStart=Date.now();
 while((Date.now()-gameStart)/1000<seconds){
  const s=await state(),wall=(Date.now()-gameStart)/1000;record('state',s);writeFileSync(resolve(out,'latest-state.json'),JSON.stringify(s,null,2)+'\n');
  if(lastPhase!==s.phase+':'+s.wave||wall-lastShot>60){await p.screenshot({path:resolve(out,`wave-${s.wave}-${s.phase}-${Math.floor(wall)}.png`)});lastShot=wall;lastPhase=s.phase+':'+s.wave}
  if(s.phase==='victory'||s.phase==='defeat'){result={status:s.phase==='victory'?'NATURAL_VICTORY':'NATURAL_DEFEAT',state:s,wallSeconds:wall};break}
  if(errors.length){result={status:'BROWSER_ERROR',state:s};break}
  if(s.phase==='boon'){
    const priority=['rift_prototype','tc_regen','siege_math','veteran_honors'];const index=Math.max(0,s.choices.findIndex(id=>priority.includes(id)));await p.locator('.boon-card').nth(index).click();await p.locator('#btn-claim').click();record('action',{command:'claim-boon',id:s.choices[index]});await p.waitForTimeout(1000);continue;
  }
  if(wall-lastPolicy>6){lastPolicy=wall;
    await defend(s);
    // Native defensive construction and production/technology choices, paid by
    // the game's normal affordability checks. No GM shortcuts are used.
    const towers=s.buildings.filter(b=>b.alive&&b.type==='tower').length,houses=s.buildings.filter(b=>b.alive&&b.type==='house').length;
    if(towers<3&&s.resources.wood>=80&&s.resources.stone>=60)await build('tower');
    else if(houses<5&&s.resources.wood>=60)await build('house');
    else if(!s.buildings.some(b=>b.alive&&b.type==='range')&&s.resources.wood>=120)await build('range');
    else if(s.age<3&&s.resources.food>600&&s.resources.gold>250&&s.core&&await select(s.core.id))await command('age:advance');
    else {const barracks=s.buildings.find(b=>b.alive&&b.type==='barracks'&&b.queue.length<2);if(barracks&&s.resources.food>120&&await select(barracks.id))await command('train:militia')}
    if(s.units.some(u=>u.team==='enemy')&&s.hero?.alive){if(s.hero.aegis<=0){await p.keyboard.press('e');record('action',{command:'hero-aegis'})}if(s.hero.mark<=0){await p.keyboard.press('q');record('action',{command:'hero-mark'})}}
  }
  if(wall-lastSave>90){lastSave=wall;await p.locator('#btn-pause').click();await p.locator('#btn-save').click();await p.locator('#btn-resume').click();record('action',{command:'native-save-checkpoint'})}
  await p.waitForTimeout(2000);
 }
 if(result.status==='INCOMPLETE')result={status:'BOUNDED_SAMPLE_INCOMPLETE',state:await state(),seconds};
}catch(e){result={status:'HARNESS_OR_GAME_ERROR',error:e.message,stack:e.stack};await p.screenshot({path:resolve(out,'failure.png')}).catch(()=>{})}
result={source_commit:commit,stage:'AFTER_LOCAL',mode:'NATURAL_UI_LEGAL_POLICY_NO_STATE_INJECTION',policy:'V2_NATIVE_ARMY_DEFENSE_AND_RALLY',...result,errors,failures,actions};writeFileSync(resolve(out,'result.json'),JSON.stringify(result,null,2)+'\n');const v=p.video();await c.close();if(v)copyFileSync(await v.path(),resolve(out,'campaign.webm'));await b.close();console.log(JSON.stringify({status:result.status,wave:result.state?.wave,sim:result.state?.simulationSeconds,errors}));
