import test from 'node:test';
import assert from 'node:assert/strict';
import {Sound} from '../js/audio.js';
globalThis.document={documentElement:{dataset:{}},dispatchEvent(){}};
const {Game}=await import('../js/game.js');
test('Boss impact cue occurs once at actual strike while other zones keep generic hit',()=>{
 const g=new Game();g.newRun(42,{civ:'TEU'}); const events=[];g.sound={bossImpact:()=>events.push('boss'),hit:()=>events.push('hit')};
 g.units=[];g.buildings=[];g.zones=[{x:0,y:0,r:2,delay:2.4,elapsed:0,damage:65,kind:'boss',done:false},{x:0,y:0,r:1,delay:1,elapsed:0,damage:8,kind:'fire',done:false}];
 g.updateZones(1);assert.deepEqual(events,['hit']);g.updateZones(1.39);assert.deepEqual(events,['hit']);g.updateZones(.02);assert.deepEqual(events,['hit','boss']);g.updateZones(.1);assert.deepEqual(events,['hit','boss']);
});
test('Boss cue is bounded, respects mute and throttle, and consumes no simulation RNG',()=>{
 const s=new Sound();s.ctx={};const tones=[];s.tone=(...a)=>tones.push(a);s.throttle=()=>true;s.bossImpact();assert.equal(tones.length,2);tones.length=0;s.enabled=false;s.bossImpact();assert.equal(tones.length,0);s.enabled=true;s.throttle=()=>false;s.bossImpact();assert.equal(tones.length,0);
 const state=[false,true].map(audible=>{const g=new Game();g.newRun(42,{civ:'TEU'});g.units=[];g.buildings=[];if(audible){s.throttle=()=>true;g.sound=s}g.zones=[{x:0,y:0,r:2,delay:2.4,elapsed:2.3,damage:65,kind:'boss',done:false}];g.updateZones(.1);return g.rng.state});assert.equal(state[0],state[1]);
});
