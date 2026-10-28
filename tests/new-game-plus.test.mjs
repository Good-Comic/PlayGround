import test from 'node:test';import assert from 'node:assert/strict';
import {BOONS,START_RESOURCES,UNIT_TYPES}from'../js/data.js';
globalThis.document={documentElement:{dataset:{}},dispatchEvent(){}};
const{Game}=await import('../js/game.js');
function completed(){const g=new Game();g.newRun(42,{civ:'TEU',biome:'river',difficulty:'hard'});g.phase='victory';g.stats.waves=10;g.boons=BOONS.slice(0,6);return g}
test('NG+ is gated behind completed victory and validates owned unique maximum-three cards before mutation',()=>{
 const g=completed();g.phase='wave';assert.equal(g.startNextCycle([]),false);g.phase='victory';g.stats.waves=9;assert.equal(g.startNextCycle([]),false);g.stats.waves=10;
 for(const ids of [['missing'],[g.boons[0].id,g.boons[0].id],g.boons.slice(0,4).map(b=>b.id),null]){const before=g.snapshot();assert.equal(g.startNextCycle(ids),false);const after=g.snapshot();delete before.savedAt;delete after.savedAt;assert.deepEqual(after,before)}
});
test('NG+ resets economy entities technology and stats, applies only selected cards once and announces flank',()=>{
 const g=completed(),oldUnit=g.units[0];g.resources.gold=9999;g.ageLevel=3;g.ageResearch={type:3,progress:99};g.effects.attackSpeedMul=5;g.stats.kills=999;const ids=[g.boons[0].id,g.boons[3].id,g.boons[5].id];
 assert.equal(g.startNextCycle(ids),true);assert.equal(g.cycle,2);assert.equal(g.phase,'prep');assert.equal(g.inMenu,false);assert.equal(g.waveIndex,0);assert.equal(g.ageLevel,1);assert.equal(g.ageResearch,null);assert.equal(g.stats.kills,0);assert.equal(g.stats.waves,0);assert.equal(g.resources.gold,START_RESOURCES.gold);assert.equal(g.units.includes(oldUnit),false);assert.equal(g.buildings.length,6);assert.equal(g.effects.attackSpeedMul,1);
 assert.deepEqual(g.boons.map(b=>b.id),ids);assert.deepEqual(g.inheritedBoons,ids);assert.equal(g.effects.archerRange,1);assert.equal(g.effects.militarySpeedMul,1.06);assert.equal(g.difficulty,'hard');
 const modifier=g.pendingWavePlan.intel.cycleModifier;assert.equal(modifier.count,1);assert.equal(modifier.at,25);const flank=g.pendingWavePlan.spawns.find(s=>s.cycleFlank);assert.equal(flank.units.light_cavalry,1);assert.equal(g.pendingWavePlan.intel.entrances.some(e=>e.gate===flank.gate),true);
});
test('NG+ frontier and RNG are repeatable; SaveLoad does not reapply inherited effects or alter plan',()=>{
 const a=completed(),b=completed();for(const g of [a,b])g.startNextCycle([g.boons[0].id,g.boons[3].id]);assert.deepEqual(a.world.tiles,b.world.tiles);assert.deepEqual(a.pendingWavePlan,b.pendingWavePlan);assert.equal(a.rng(),b.rng());
 const snapshot=a.snapshot(),r=new Game();r.restore(snapshot);assert.equal(r.cycle,2);assert.deepEqual(r.inheritedBoons,a.inheritedBoons);assert.deepEqual(r.effects,a.effects);assert.deepEqual(r.pendingWavePlan,a.pendingWavePlan);assert.equal(r.rng(),a.rng());r.startWave();assert.equal(r.waveSpawns.filter(s=>s.cycleFlank).length,1);
});
test('inherited immediate Prototype card uses its real effect; no prior entities are carried',()=>{
 const g=completed(),card=BOONS.find(b=>b.id==='rift_prototype');g.boons.push(card);assert.equal(g.startNextCycle([card.id]),true);assert.equal(g.units.filter(u=>u.alive&&u.type==='prototype').length,1);assert.equal(g.boons.length,1);
});
test('legacy SaveLoad defaults cycle one and no inherited cards, leaving Boss stats unchanged',()=>{
 const g=new Game(),snapshot=g.snapshot();delete snapshot.cycle;delete snapshot.inheritedBoons;g.restore(snapshot);assert.equal(g.cycle,1);assert.deepEqual(g.inheritedBoons,[]);assert.equal(g.pendingWavePlan.intel.cycleModifier,undefined);
 const before=JSON.stringify(UNIT_TYPES);const h=completed();h.startNextCycle([]);assert.equal(JSON.stringify(UNIT_TYPES),before);
});
test('every shipped card can be inherited once on a fresh frontier and restored without effect duplication',()=>{
 for(const card of BOONS){
  const g=completed();g.boons=[card];assert.equal(g.startNextCycle([card.id]),true,card.id);
  const snapshot=g.snapshot(),r=new Game();r.restore(snapshot);
  assert.deepEqual(r.effects,g.effects,card.id);assert.deepEqual(r.inheritedBoons,[card.id]);assert.equal(r.boons.length,1);assert.equal(r.boons[0].id,card.id);assert.deepEqual(r.resources,g.resources);
 }
});
