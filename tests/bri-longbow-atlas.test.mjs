import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CIV_UNIT_SPRITE_ATLASES, unitSpriteAtlasKey, atlasFrame} from '../js/sprite-atlas.js';
globalThis.document = {documentElement:{dataset:{}},dispatchEvent(){}};
const {Game} = await import('../js/game.js');

test('BRI longbow appearance is isolated from other civilizations and enemies', () => {
  for (const civ of ['BRI','CHN','MNG','TEU','JPN']) for (const team of ['player','enemy'])
    assert.equal(unitSpriteAtlasKey({type:'archer',team},civ),civ==='BRI'&&team==='player'?'BRI:archer':'archer');
});

test('every longbow direction and animation frame fits the actual PNG', () => {
  const a=CIV_UNIT_SPRITE_ATLASES['BRI:archer'], png=readFileSync(new URL('../'+a.src,import.meta.url));
  assert.equal(png.readUInt32BE(16),2048); assert.equal(png.readUInt32BE(20),1280);
  for(const d of Object.keys(a.directions)) for(const s of Object.keys(a.states))
    assert.deepEqual([0,.26,.51,.99].map(p=>{const f=atlasFrame(a,d,s,0,p);assert.ok(f.sx>=0&&f.sy>=0&&f.sx+f.sw<=2048&&f.sy+f.sh<=1280);return f.frame}),[0,1,2,3]);
  assert.equal(a.bakedPose,true);assert.equal(a.cacheFrames,true);
});

test('existing British range, first-shot penalty, cost and snapshot identity remain production rules', () => {
  const g=new Game();g.newRun(42,{civ:'BRI',biome:'steppe'});
  const a=g.spawnUnit('archer',30,30);
  assert.equal(g.effects.archerRange,1);assert.equal(g.effects.archerFirstShotDelay,.4);
  const cost=g.unitCost('archer'), radius=a.radius;
  const restored=new Game();restored.restore(g.snapshot());
  assert.equal(restored.civ.id,'BRI');assert.deepEqual(restored.unitCost('archer'),cost);
  const b=restored.units.find(u=>u.id===a.id);assert.equal(b.radius,radius);
  assert.equal(unitSpriteAtlasKey(b,restored.civ.id),'BRI:archer');
});
