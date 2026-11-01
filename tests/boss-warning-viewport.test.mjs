import test from 'node:test';
import assert from 'node:assert/strict';
import { Renderer } from '../js/renderer.js';
import { bossStrikeVisual } from '../js/hero-skills.js';

test('boss countdown remains inside viewport at upper and lower edges across zoom levels',()=>{
 for(const zoom of [.8,1,2]) for(const y of [-20,450,930]) {
  const calls=[]; const ctx=new Proxy({}, {get:(_,key)=>(...args)=>calls.push([key,...args]),set:()=>true});
  const z={kind:'boss',source:{type:'warlord2'},r:3.3,delay:2.4,elapsed:1.2,done:false};
  Renderer.prototype.drawBossStrike.call({ctx,w:1440,h:900},z,bossStrikeVisual(z),{x:500,y},zoom);
  const rect=calls.find(c=>c[0]==='fillRect'); const label=calls.find(c=>c[0]==='fillText');
  assert.ok(rect[2]>=0 && rect[2]+rect[4]<=900,JSON.stringify({zoom,y,rect}));
  assert.equal(label[1],'1.2s'); assert.ok(Number.isFinite(label[3]));
 }
});

test('fully offscreen strike does not pin a misleading countdown to the viewport',()=>{
 for(const p of [{x:-500,y:450},{x:2000,y:450},{x:500,y:-500},{x:500,y:1500}]) {
  const calls=[]; const ctx=new Proxy({}, {get:(_,key)=>(...args)=>calls.push([key,...args]),set:()=>true});
  const zone={kind:'boss',source:{type:'warlord'},r:2.8,delay:2.4,elapsed:1.2,done:false};
  Renderer.prototype.drawBossStrike.call({ctx,w:1440,h:900},zone,bossStrikeVisual(zone),p,1);
  assert.ok(!calls.some(c=>c[0]==='fillText'),JSON.stringify(p));
 }
});
