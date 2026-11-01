import test from 'node:test';
import assert from 'node:assert/strict';
import { Sound } from '../js/audio.js';
globalThis.document={documentElement:{dataset:{}},dispatchEvent(){}};
const {Game}=await import('../js/game.js');

test('successful casts route distinct cues; rejected casts only report errors',()=>{
 const g=new Game(); g.newRun(42,{civ:'TEU'}); const events=[];
 g.sound={heroMark:()=>events.push('mark'),heroAegis:()=>events.push('aegis'),error:()=>events.push('error')};
 g.units=g.units.filter(u=>u.team==='player'); g.heroMark(); assert.deepEqual(events,['error']);
 g.spawnUnit('brute',g.hero.x+1,g.hero.y,'enemy'); g.heroMark(); g.heroMark(); g.heroAegis(); g.heroAegis();
 assert.deepEqual(events,['error','mark','error','aegis','error']);
 assert.equal(g.hero.markCd,30); assert.equal(g.hero.aegisCd,60); assert.equal(g.hero.shield,60);
});
test('cues are distinct, muted and throttled without consuming simulation RNG',()=>{
 const s=new Sound(); s.ctx={}; const tones=[]; s.tone=(...a)=>tones.push(a);
 s.throttle=()=>true; s.heroMark(); const mark=tones.splice(0); s.heroAegis(); const aegis=tones.splice(0);
 assert.equal(mark.length,2); assert.equal(aegis.length,3); assert.notDeepEqual(mark,aegis);
 s.enabled=false; s.heroMark(); s.heroAegis(); assert.equal(tones.length,0);
 s.enabled=true; s.throttle=()=>false; s.heroMark(); s.heroAegis(); assert.equal(tones.length,0);
 const states=[false,true].map(audible=>{const g=new Game();g.newRun(42,{civ:'TEU'});g.spawnUnit('brute',g.hero.x+1,g.hero.y,'enemy');if(audible){s.throttle=()=>true;g.sound=s}g.heroMark();g.heroAegis();return g.rng.state});
 assert.equal(states[0],states[1]);
});
