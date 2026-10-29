import test from 'node:test';
import assert from 'node:assert/strict';
globalThis.document={documentElement:{dataset:{}},dispatchEvent(){}};
const {Game}=await import('../js/game.js');
function setup(civ='JPN') {const g=new Game();g.newRun(42,{civ,biome:'steppe'});g.units=[];g.world.tile=()=>({terrain:'grass'});const guard=g.spawnUnit('guard',35,15),foe=g.spawnUnit('brute',36,15,'enemy');g.time=20;return {g,guard,foe};}

test('production-spawned JPN guard blocks first ordinary melee hit without a unit civ field',()=>{
 const {g,guard,foe}=setup();const hp=guard.hp;assert.equal(guard.civ,undefined);g.attackUnit(foe,guard);
 assert.equal(guard.hp,hp);assert.equal(guard._blockCd,30);assert.ok(g.particles.some(f=>f.kind==='text'));
});
test('ordinary damage during cooldown keeps armor and block returns exactly at ten seconds',()=>{
 const {g,guard,foe}=setup();const hp=guard.hp;g.attackUnit(foe,guard);g.time=29.999;g.attackUnit(foe,guard);
 assert.equal(guard.hp,hp-Math.max(1,g.unitAttack(foe)-guard.armor*.6));const after=guard.hp;g.time=30;g.attackUnit(foe,guard);assert.equal(guard.hp,after);assert.equal(guard._blockCd,40);
});
test('other civilizations, enemies, buildings and source-less damage do not acquire Japanese block',()=>{
 for(const civ of ['TEU','VIK','SPA','BRI']){const {g,guard,foe}=setup(civ);guard.civ={id:'JPN'};const hp=guard.hp;g.attackUnit(foe,guard);assert.ok(guard.hp<hp);}
 const {g,guard,foe}=setup();let hp=foe.hp;g.attackUnit(guard,foe);assert.ok(foe.hp<hp);
 const tc=g.getTownCenter();hp=tc.hp;g.attackUnit(foe,tc);assert.ok(tc.hp<hp);
 hp=guard.hp;g.applyDamage(guard,20,null);assert.ok(guard.hp<hp);
});
test('arrows, splash and environmental zones neither block nor consume block readiness',()=>{
 const {g,guard,foe}=setup();const bow=g.spawnUnit('marauder',37,15,'enemy');let hp=guard.hp;
 g.spawnProjectile(guard.x,guard.y,guard,20,'enemy',1,bow);g.updateProjectiles(0);assert.ok(guard.hp<hp);assert.equal(guard._blockCd||0,0);
 for(const kind of ['zone','splash','projectile']) {hp=guard.hp;g.applyDamage(guard,20,foe,kind);assert.ok(guard.hp<hp);assert.equal(guard._blockCd||0,0);}
 hp=guard.hp;g.attackUnit(foe,guard);assert.equal(guard.hp,hp);
});
test('actual Boss warning zone and Boss strike remain damaging without spending block',()=>{
 const {g,guard}=setup();const boss=g.spawnUnit('warlord',36,15,'enemy');let hp=guard.hp;g.attackUnit(boss,guard);assert.ok(guard.hp<hp);assert.equal(guard._blockCd||0,0);
 hp=guard.hp;g.zones=[{x:guard.x,y:guard.y,r:2,delay:0,elapsed:0,damage:20,source:boss,kind:'boss',done:false}];g.updateZones(.01);assert.ok(guard.hp<hp);assert.equal(guard._blockCd||0,0);
});
test('shield absorbs first, remaining damage can block, and other defenses remain intact',()=>{
 const {g,guard,foe}=setup();const hp=guard.hp;guard.shield=100;g.attackUnit(foe,guard);assert.equal(guard.hp,hp);assert.ok(guard.shield<100);assert.equal(guard._blockCd||0,0);
 guard.shield=.5;g.attackUnit(foe,guard);assert.equal(guard.shield,0);assert.equal(guard.hp,hp);assert.equal(guard._blockCd,30);
});
test('JSON SaveLoad preserves per-unit block cooldown; legacy saves default to ready',()=>{
 const {g,guard,foe}=setup();g.attackUnit(foe,guard);const snapshot=JSON.parse(JSON.stringify(g.snapshot()));
 assert.equal(snapshot.units.find(u=>u.id===guard.id)._blockCd,30);
 const restored=new Game();restored.restore(snapshot);let a=restored.units.find(u=>u.id===guard.id),b=restored.units.find(u=>u.id===foe.id);let hp=a.hp;restored.attackUnit(b,a);assert.ok(a.hp<hp);hp=a.hp;restored.time=30;restored.attackUnit(b,a);assert.equal(a.hp,hp);
 delete snapshot.units.find(u=>u.id===guard.id)._blockCd;const legacy=new Game();legacy.restore(snapshot);a=legacy.units.find(u=>u.id===guard.id);b=legacy.units.find(u=>u.id===foe.id);hp=a.hp;legacy.attackUnit(b,a);assert.equal(a.hp,hp);
});
test('block is per defender and consumes no simulation RNG',()=>{
 const {g,guard,foe}=setup();const second=g.spawnUnit('militia',38,15);const state=g.rng.state;g.attackUnit(foe,guard);g.attackUnit(foe,second);assert.equal(guard._blockCd,30);assert.equal(second._blockCd,30);assert.equal(g.rng.state,state);
});
