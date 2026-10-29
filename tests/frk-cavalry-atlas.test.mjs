import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CIV_UNIT_SPRITE_ATLASES, unitSpriteAtlasKey, atlasFrame} from '../js/sprite-atlas.js';
globalThis.document = {documentElement:{dataset:{}},dispatchEvent(){}};
const {Game} = await import('../js/game.js');

test('FRK cavalry appearance is isolated from other civilizations and enemies', () => {
  for (const civ of ['FRK','CHN','MNG','TEU','JPN']) for (const team of ['player','enemy'])
    assert.equal(unitSpriteAtlasKey({type:'light_cavalry',team},civ),civ==='FRK'&&team==='player'?'FRK:light_cavalry':'light_cavalry');
});

test('every cavalry direction and animation frame fits the actual PNG', () => {
  const a=CIV_UNIT_SPRITE_ATLASES['FRK:light_cavalry'], png=readFileSync(new URL('../'+a.src,import.meta.url));
  assert.equal(png.readUInt32BE(16),2816); assert.equal(png.readUInt32BE(20),1760);
  for(const d of Object.keys(a.directions)) for(const s of Object.keys(a.states))
    assert.deepEqual([0,.26,.51,.99].map(p=>{const f=atlasFrame(a,d,s,0,p);assert.ok(f.sx>=0&&f.sy>=0&&f.sx+f.sw<=2816&&f.sy+f.sh<=1760);return f.frame}),[0,1,2,3]);
  assert.equal(a.bakedPose,true);assert.equal(a.cacheFrames,true);
});

test('Frankish cavalry HP and cost still use approved production bonuses and saved identity',()=>{
  const g=new Game();g.newRun(42,{civ:'FRK',biome:'steppe'});const u=g.spawnUnit('light_cavalry',35,15);
  assert.equal(g.effects.cavalryHpMul,1.6);assert.equal(u.maxHp,Math.round(u.typeDef.hp*1.6));
  const cost=g.unitCost('light_cavalry'),radius=u.typeDef.radius;const h=new Game();h.restore(JSON.parse(JSON.stringify(g.snapshot())));const restored=h.units.find(v=>v.id===u.id);
  assert.deepEqual(h.unitCost('light_cavalry'),cost);assert.equal(restored.typeDef.radius,radius);assert.equal(restored.maxHp,u.maxHp);assert.equal(unitSpriteAtlasKey(restored,h.civ.id),'FRK:light_cavalry');
});
