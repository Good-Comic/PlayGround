import test from 'node:test';
import assert from 'node:assert/strict';
import {Sound} from '../js/audio.js';
globalThis.document={documentElement:{dataset:{}},dispatchEvent(){}};
const {Game}=await import('../js/game.js');
test('phase cues follow real Boss transitions once without changing existing thresholds or reinforcements',()=>{
 const g=new Game();g.newRun(42,{civ:'TEU'});const boss=g.spawnUnit('warlord',g.hero.x+5,g.hero.y,'enemy');const cues=[];g.sound={bossPhase:()=>cues.push('phase')};boss.bossSkillTimer=9;const attack=boss.attack;boss.hp=boss.maxHp*.59;const before=g.units.length;g.updateBoss(boss,0);assert.equal(boss.rageStage,1);assert.equal(boss.attack,attack*1.12);assert.equal(g.units.length-before,3);assert.equal(cues.length,1);g.updateBoss(boss,0);assert.equal(cues.length,1);boss.hp=boss.maxHp*.29;g.updateBoss(boss,0);assert.equal(boss.rageStage,2);assert.equal(cues.length,2);
});
test('phase sound is bounded and respects mute and throttle',()=>{const s=new Sound(),tones=[];s.ctx={};s.throttle=()=>true;s.tone=(...a)=>tones.push(a);s.bossPhase();assert.equal(tones.length,2);tones.length=0;s.enabled=false;s.bossPhase();assert.equal(tones.length,0);s.enabled=true;s.throttle=()=>false;s.bossPhase();assert.equal(tones.length,0)});
