// CONTROLLED_FIXTURE ONLY. Overwhelming injected army/core HP; no natural-play claim.
import{writeFileSync,mkdirSync,readFileSync}from'node:fs';import{createHash}from'node:crypto';import{execFileSync}from'node:child_process';
globalThis.document={documentElement:{dataset:{}},dispatchEvent(){}};globalThis.window={innerWidth:1280,innerHeight:800};
const{Game}=await import('../../js/game.js'),{UNIT_TYPES}=await import('../../js/data.js');const out=process.argv[2];mkdirSync(out,{recursive:true});let g=new Game();g.newRun(1376821427,{civ:'TEU',biome:'steppe',difficulty:'easy'});g.inMenu=false;g.autoEconomy=false;g.autoMilitary=false;
const configure=()=>{g.addParticles=()=>{};g.addFloating=()=>{};g.toast=()=>{};g.updateCamera=()=>{};g.refreshHover=()=>{}};configure();g.getTownCenter().hp=g.getTownCenter().maxHp=g.getTownCenter().baseMaxHp=1e7;
const events=[],bossDeaths=[];const durableSiege=process.argv.includes('--durable-siege');let lastWave=-1,steps=0,lastFocusedBoss=null;
const observeDamage=()=>{const original=g.applyDamage;g.applyDamage=function(t,a,s){const alive=t?.alive,result=original.call(this,t,a,s);if(alive&&!t.alive&&t.typeDef?.boss)bossDeaths.push({wave:this.waveIndex+1,type:t.type,source:s?.type,simulationSeconds:this.runTime});return result}};observeDamage();
for(;steps<80000&&!['victory','defeat'].includes(g.phase);steps++){
 if(g.waveIndex!==lastWave){lastWave=g.waveIndex;events.push({kind:'wave-entry',wave:lastWave+1,phase:g.phase,time:g.runTime});
  // Inject defenders only, preserving all production unit statistics and attack code.
  if(durableSiege){if(lastWave===0)for(let i=0;i<8;i++){const u=g.spawnUnit('mangonel',29+(i%4)*.8,29+Math.floor(i/4)*.8);if(u)u.hp=u.maxHp=u.baseMaxHp=1e6;}}
  else for(const c of g.world.camps)for(let i=0;i<12;i++)g.spawnUnit('guard',c.x+(i%4-1.5)*.7,c.y+(Math.floor(i/4)-1)*.7);
  g.selection=g.units.filter(u=>u.alive&&u.team==='player'&&u.type!=='villager');g.command('order:attackMove');const point=g.screenPos(25,26);const accepted=g.issueTacticalCommand(point.x,point.y);events.push({kind:'fixture-native-attack-move',accepted,actors:g.selection.length});
 }
 if(g.phase==='boon'){
  const s=JSON.parse(JSON.stringify(g.snapshot()));const restored=new Game();restored.restore(s);g=restored;g.inMenu=false;configure();observeDamage();g.chooseBoon(g.boonChoices[0]);events.push({kind:'restored-claimed',wave:g.waveIndex+1});
 }
 const boss=g.units.find(u=>u.alive&&u.team==='enemy'&&u.typeDef.boss);
 if(boss&&boss.id!==lastFocusedBoss){g.selection=g.units.filter(u=>u.alive&&u.team==='player'&&u.type!=='villager');const q=g.screenPos(boss.x,boss.y);let accepted=false;for(const dy of [-18,-25,-10]){const y=q.y+dy*g.camera.zoom;if(g.pickAt(q.x,y)===boss){g.issueCommand(q.x,y);accepted=g.selection.some(u=>u.manualAttack&&u.target===boss);break}}if(accepted)lastFocusedBoss=boss.id;events.push({kind:'fixture-native-boss-focus',id:boss.id,accepted,actors:g.selection.length})}
 g.update(.05);
}
const status=g.phase==='victory'&&bossDeaths.some(x=>x.wave===5)&&bossDeaths.some(x=>x.wave===10)?'FLOW_REACHED_VICTORY':'FLOW_NOT_VERIFIED';writeFileSync(out+'/victory-snapshot.json',JSON.stringify(g.snapshot(),null,2)+'\n');
let cycle=null;if(status==='FLOW_REACHED_VICTORY'){const chosen=g.boons.slice(0,3).map(b=>b.id),accepted=g.startNextCycle(chosen);cycle={accepted,cycle:g.cycle,age:g.ageLevel,resources:{...g.resources},inherited:g.inheritedBoons,coreBaseHP:g.getTownCenter()?.baseMaxHp};if(accepted){for(let i=0;i<2500&&!(g.phase==='wave'&&g.waveClock>=26);i++)g.update(.05);cycle.activePhase=g.phase;cycle.activeWave=g.waveIndex+1;cycle.flankSpawned=g.waveSpawns.some(s=>s.cycleFlank&&s.spawned);const s=g.snapshot(),h=new Game();h.restore(s);cycle.restoreCycle=h.cycle;cycle.restoreInherited=h.inheritedBoons}}
writeFileSync(out+'/result.json',JSON.stringify({source_commit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),harness_sha256:createHash('sha256').update(readFileSync(new URL(import.meta.url))).digest('hex'),mode:'CONTROLLED_FIXTURE_HEADLESS_GAME_UPDATE_NOT_NATURAL',fixture:{seed:1376821427,difficulty:'easy',coreHP:1e7,guardsPerWave:durableSiege?0:48,durableSiege:durableSiege?{count:8,HP:1e6}:null,unitStats:'ATTACK_COOLDOWN_RANGE_UNCHANGED; FIXTURE_HP_OVERRIDES_EXPLICIT',directEnemyKills:false},status,steps,events,bossDeaths,cycle,unitBossStats:Object.fromEntries(Object.entries(UNIT_TYPES).filter(([,v])=>v.boss).map(([k,v])=>[k,{hp:v.hp,attack:v.attack}]))},null,2)+'\n');console.log(JSON.stringify({status,steps,bossDeaths,cycle}));if(status!=='FLOW_REACHED_VICTORY')process.exitCode=1;
