import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CIV_UNIT_SPRITE_ATLASES, unitSpriteAtlasKey, atlasFrame} from '../js/sprite-atlas.js';
globalThis.document = {documentElement:{dataset:{}},dispatchEvent(){}};
const {Game} = await import('../js/game.js');

test('JPN lamellar appearance is isolated from other civilizations and enemies', () => {
  for (const civ of ['JPN','VIK','BRI','TEU','CHN']) for (const team of ['player','enemy'])
    assert.equal(unitSpriteAtlasKey({type:'guard',team},civ),team==='player'&&['VIK','JPN'].includes(civ)?`${civ}:guard`:'guard');
});

test('every lamellar direction and animation frame fits the actual PNG', () => {
  const a=CIV_UNIT_SPRITE_ATLASES['JPN:guard'], png=readFileSync(new URL('../'+a.src,import.meta.url));
  assert.equal(png.readUInt32BE(16),2048); assert.equal(png.readUInt32BE(20),1280);
  for(const d of Object.keys(a.directions)) for(const s of Object.keys(a.states))
    assert.deepEqual([0,.26,.51,.99].map(p=>{const f=atlasFrame(a,d,s,0,p);assert.ok(f.sx>=0&&f.sy>=0&&f.sx+f.sw<=2048&&f.sy+f.sh<=1280);return f.frame}),[0,1,2,3]);
  assert.equal(a.bakedPose,true);assert.equal(a.cacheFrames,true);
});

test('Japanese infantry speed, cost, snapshot identity and recovered block stay integrated', () => {
  const g=new Game();g.newRun(42,{civ:'JPN',biome:'steppe'});
  const a=g.spawnUnit('guard',30,30),enemy=g.spawnUnit('brute',31,30,'enemy');
  const cost=g.unitCost('guard'),radius=a.typeDef.radius;
  assert.equal(g.effects.infantryAttackSpeedMul,1.15);
  const hp=a.hp;g.time=10;g.applyDamage(a,20,enemy);
  assert.equal(a.civ,undefined);assert.equal(a.hp,hp);assert.equal(a._blockCd,20);
  const restored=new Game();restored.restore(g.snapshot());
  assert.equal(restored.civ.id,'JPN');assert.deepEqual(restored.unitCost('guard'),cost);
  const b=restored.units.find(u=>u.id===a.id);assert.equal(b.typeDef.radius,radius);
  assert.equal(unitSpriteAtlasKey(b,restored.civ.id),'JPN:guard');
});
