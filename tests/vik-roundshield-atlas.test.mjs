import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CIV_UNIT_SPRITE_ATLASES, unitSpriteAtlasKey, atlasFrame} from '../js/sprite-atlas.js';
globalThis.document = {documentElement:{dataset:{}},dispatchEvent(){}};
const {Game} = await import('../js/game.js');

test('VIK roundshield appearance is isolated from other civilizations and enemies', () => {
  for (const civ of ['VIK','BRI','MNG','TEU','JPN']) for (const team of ['player','enemy'])
    assert.equal(unitSpriteAtlasKey({type:'guard',team},civ),civ==='VIK'&&team==='player'?'VIK:guard':'guard');
});

test('every roundshield direction and animation frame fits the actual PNG', () => {
  const a=CIV_UNIT_SPRITE_ATLASES['VIK:guard'], png=readFileSync(new URL('../'+a.src,import.meta.url));
  assert.equal(png.readUInt32BE(16),2048); assert.equal(png.readUInt32BE(20),1280);
  for(const d of Object.keys(a.directions)) for(const s of Object.keys(a.states))
    assert.deepEqual([0,.26,.51,.99].map(p=>{const f=atlasFrame(a,d,s,0,p);assert.ok(f.sx>=0&&f.sy>=0&&f.sx+f.sw<=2048&&f.sy+f.sh<=1280);return f.frame}),[0,1,2,3]);
  assert.equal(a.bakedPose,true);assert.equal(a.cacheFrames,true);
});

test('existing Viking regeneration, cost and snapshot identity remain production rules', () => {
  const g=new Game();g.newRun(42,{civ:'VIK',biome:'steppe'});
  const a=g.spawnUnit('guard',30,30);a.hold=true;g.units=[a];
  const cost=g.unitCost('guard'),radius=a.radius;
  assert.equal(g.effects.infantryRegen,.01);
  a.hp=a.maxHp-20;a.combatAt=10;g.time=14;g.updateUnits(.5);
  assert.equal(a.hp,a.maxHp-20);
  g.time=16;g.updateUnits(.5);assert.equal(a.hp,a.maxHp-20+a.maxHp*.005);
  const restored=new Game();restored.restore(g.snapshot());
  assert.equal(restored.civ.id,'VIK');assert.deepEqual(restored.unitCost('guard'),cost);
  const b=restored.units.find(u=>u.id===a.id);assert.equal(b.radius,radius);
  assert.equal(unitSpriteAtlasKey(b,restored.civ.id),'VIK:guard');
});
