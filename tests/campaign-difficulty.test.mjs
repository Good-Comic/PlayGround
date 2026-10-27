import test from 'node:test';
import assert from 'node:assert/strict';
import {applyDifficulty,preparationSeconds} from '../js/campaign.js';
import {UNIT_TYPES,WAVES} from '../js/data.js';
globalThis.document={documentElement:{dataset:{}},dispatchEvent(){}};
const {Game}=await import('../js/game.js');
const {NemesisDirector}=await import('../js/director.js');
const count=(p,type)=>p.spawns.reduce((n,s)=>n+(s.units[type]||0),0);

test('Normal is exactly the existing director plan across all ten waves and three Seeds',()=>{
 for(const seed of [1,42,1376821427])for(let waveIndex=0;waveIndex<10;waveIndex++){
  const g=new Game();g.newRun(seed,{civ:'TEU',biome:'steppe'});g.waveIndex=waveIndex;g.director=new NemesisDirector(seed);
  const raw=new NemesisDirector(seed).planWave({wave:WAVES[waveIndex],waveIndex,civ:g.civ,report:null,camps:g.world.camps,prepSeconds:g.prepTotal});
  assert.deepEqual(g.prepareNextWavePlan(),raw);
 }
 const plan={spawns:[]};assert.equal(applyDifficulty(plan,'normal'),plan);assert.equal(preparationSeconds(45,'normal'),45);
});
test('Easy and Hard round aggregate ordinary counts, preserve Boss and actual total/intel',()=>{
 for(const difficulty of ['easy','hard'])for(let waveIndex=0;waveIndex<10;waveIndex++){
  const g=new Game();g.newRun(42,{civ:'CHN',biome:'ash',difficulty});g.waveIndex=waveIndex;
  const raw=g.director.planWave({wave:WAVES[waveIndex],waveIndex,civ:g.civ,report:null,camps:g.world.camps,prepSeconds:g.prepTotal});
  const before=structuredClone(raw);applyDifficulty(raw,difficulty);
  for(const type of new Set(before.spawns.flatMap(s=>Object.keys(s.units))))assert.equal(count(raw,type),UNIT_TYPES[type].boss?count(before,type):Math.round(count(before,type)*(difficulty==='easy'?.8:1.2)));
  assert.equal(raw.totalUnits,raw.spawns.reduce((n,s)=>n+Object.values(s.units).reduce((a,b)=>a+b,0),0));
  assert.deepEqual(new Set(raw.intel.units),new Set(raw.spawns.flatMap(s=>Object.keys(s.units))));
  assert.equal(g.prepTotal,difficulty==='easy'?56.25:36);
 }
});
test('difficulty SaveLoad preserves queued plan without scaling it twice; legacy defaults Normal',()=>{
 for(const difficulty of ['easy','normal','hard']){
  const g=new Game();g.newRun(42,{difficulty});const snapshot=g.snapshot(),r=new Game();r.restore(snapshot);
  assert.equal(r.difficulty,difficulty);assert.equal(r.runConfig.difficulty,difficulty);assert.deepEqual(r.pendingWavePlan,g.pendingWavePlan);
  assert.equal(r.prepTimer,g.prepTimer);r.startWave();assert.equal(r.waveTotal,g.pendingWavePlan.totalUnits);
 }
 const g=new Game(),snapshot=g.snapshot();delete snapshot.difficulty;g.restore(snapshot);assert.equal(g.difficulty,'normal');
});
