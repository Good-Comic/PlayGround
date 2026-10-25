// Virtual render cadence fed to the actual Game. Not measured browser/hardware FPS.
import fs from 'node:fs';import {execFileSync} from 'node:child_process';
globalThis.document={documentElement:{dataset:{}},dispatchEvent(){}};globalThis.window={innerWidth:1920,innerHeight:1080};
const nativeTimeout=setTimeout;globalThis.setTimeout=(...a)=>{const h=nativeTimeout(...a);h.unref?.();return h;};
const {Game}=await import('../../js/game.js');const {FixedStepPrototype}=await import('./fixed-step-prototype.mjs');
function scenario(fps,fixed){
 const g=new Game();g.newRun(3215474622,{civ:'TEU',biome:'steppe'});g.inMenu=false;g.paused=false;g.updateCamera=()=>{};g.refreshHover=()=>{};g.toast=()=>{};g.phase='wave';g.waveIndex=4;g.waveClock=0;g.waveSpawns=[];g.waveTotal=1;g.director.beginWave();g.hero.markCd=50;g.hero.aegisCd=55;g.hero.shield=60;g.hero.shieldTime=40;
 const boss=g.spawnUnit('warlord',g.hero.x+3,g.hero.y,'enemy');g.hero.state='attack';g.hero.target=boss;g.hero.manualAttack=true;
 const c=new FixedStepPrototype();let attacks=0;const attack=g.attackUnit.bind(g);g.attackUnit=(...args)=>{attacks++;return attack(...args);};
 for(let i=0;i<fps*60;i++){if(fixed)c.advance(1/fps,dt=>g.update(dt));else g.update(1/fps);}
 return {fps,mode:fixed?'prototype-only':'production-legacy',virtual_wall_seconds:60,simulation_seconds:g.runTime,wave_seconds:g.waveClock,error_seconds:g.runTime-60,error_percent:100*(g.runTime-60)/60,attacks,gathered:g.stats.gathered,markCd:g.hero?.markCd,aegisCd:g.hero?.aegisCd,shieldTime:g.hero?.shieldTime,bossHp:boss.hp,seed:g.seed,debt:c.debt,pass_clock:Math.abs(g.runTime-60)<=.1&&Math.abs(g.waveClock-60)<=.1};
}
const r={source:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),scope:'60virtual seconds; native headless Game AI/combat/economy; not natural campaign or hardware benchmark',proposed_threshold:'At speed1 active/unpaused, <=0.1s absolute clock error per60s (0.167%); prototype proposal, not retroactively accepted production contract',rows:[10,15,20,30,60].flatMap(f=>[scenario(f,false),scenario(f,true)]),save_load_determinism:'KNOWN_FAIL from fixed-step suite; prototype not production-ready',production_loop_modified:false};
const out=process.argv[2];if(out)fs.writeFileSync(out,JSON.stringify(r,null,2));console.log(JSON.stringify(r,null,2));
