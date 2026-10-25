// Code-derived envelopes, never labelled a naturally played campaign peak.
import fs from 'node:fs';
import {CIVILIZATIONS,WAVES,UNIT_TYPES} from '../../js/data.js';
globalThis.document={documentElement:{dataset:{}},dispatchEvent(){}};const {NemesisDirector}=await import('../../js/director.js');
const camps=[{x:5,y:5},{x:45,y:5},{x:45,y:45},{x:5,y:45}],rows=[];
for(const civ of CIVILIZATIONS)for(const seed of [3215474622,17,20261025]){
 const d=new NemesisDirector(seed),waves=WAVES.map((wave,waveIndex)=>{const p=d.planWave({wave,waveIndex,civ,report:null,camps});const bosses=p.spawns.reduce((s,g)=>s+Object.entries(g.units).reduce((n,[t,c])=>n+(UNIT_TYPES[t].boss?c:0),0),0);return {wave:waveIndex+1,base:wave.spawns.reduce((s,g)=>s+Object.values(g.units).reduce((a,b)=>a+b,0),0),planned:p.totalUnits,bossRageAddsMax:bosses*(waveIndex===9?8:6),event:p.event?.id};});
 rows.push({civ:civ.id,seed,bonuses:civ.bonuses,waves});
}
const {Game}=await import('../../js/game.js');const g=new Game();g.newRun(3215474622,{civ:'TEU',biome:'steppe'});g.units=[];g.buildings=[];g.world.resources=[];g.world.tile=()=>({terrain:'grass'});g.spawnUnit('warlord',20,20,'enemy');const before=g.units.length;g.spawnBossReinforcements();const bossExtensionAudit={scheduledRounds:3,scheduledUnitsPerRound:4,actualUnitsAddedInDirectProbe:g.units.length-before,missingTypeId:'M',typeExists:!!UNIT_TYPES.M,note:'Existing bug: extension uses family ID M rather than registered unit ID. Counter reset between boss waves also needs review. Full envelope if repaired reaches68 enemies before carryovers.'};
const r={bossExtensionAudit,scope:'CODE_INFERRED: actual director plans for16 civs x3seeds x10waves; not natural campaign concurrency',rows,limits:{totalActiveHardCap:null,economicHardCap:null,militaryHardCap:'Franks effects40 only in auto military; manual getters undefined',buildingQueue:5,globalQueueReservation:false,automaticVillagers:22,koreanTowerCarts:4,bossThresholdAdds:'Vask3 per each of2 rage thresholds; Marshal4 per each of2',conversion:'replacement on kill,20s summon expiration, no explicit count cap',decoys:'boon effect count per wave,45s expiration',housing:'spatial/resource bound, no numeric building-count cap'},budget:'provisional250 total active target; no hard cap applied; natural full-ten-wave peak and campaign stability NOT_TESTED'};
console.log(JSON.stringify(r,null,2));
