import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {createWorld} from '../js/world.js';
import {BIOMES} from '../js/data.js';
import {findPath} from '../js/navigation.js';
globalThis.document={documentElement:{dataset:{}},dispatchEvent(){}};
const {Game}=await import('../js/game.js');
const hash=w=>createHash('sha256').update(JSON.stringify(w)).digest('hex');

test('version-1 generator exactly preserves all historical world signatures',()=>{
  const fixture=JSON.parse(readFileSync(new URL('./fixtures/map-v1-signatures.json',import.meta.url)));
  for(const row of fixture.rows)assert.equal(hash(createWorld(row.seed,row.biome,1)),row.sha256,`${row.biome}/${row.seed}`);
});

test('version-2 Seed changes real water layout, camp locations and resource positions reproducibly',()=>{
  for(const biome of BIOMES){
    const a=createWorld(100,biome.id),b=createWorld(200,biome.id);
    assert.equal(hash(a),hash(createWorld(100,biome.id)));
    assert.notDeepEqual(a.tiles.map(t=>t.terrain),b.tiles.map(t=>t.terrain),biome.id);
    assert.notDeepEqual(a.camps,b.camps);assert.notDeepEqual(a.resources.map(n=>[n.x,n.y]),b.resources.map(n=>[n.x,n.y]));
    assert.ok(a.resources.every(n=>a.tile(n.x,n.y)?.terrain!=='water'));
  }
});

test('both map generations survive SaveLoad with resource identity and terrain intact',()=>{
  for(const version of [1,2]){
    const game=new Game();game.newRun(100,{civ:'TEU',biome:'river'});game.world=createWorld(100,'river',version);
    game.world.resources[0].amount-=10;const before=hash(game.world),snapshot=game.snapshot();
    const restored=new Game();restored.restore(snapshot);assert.equal(hash(restored.world),before);
    if(version===1){delete snapshot.mapGenerationVersion;restored.restore(snapshot);assert.equal(hash(restored.world),before);}
  }
});

test('food patch regression: the nearest food is not inside an initial house',()=>{
  const g=new Game();g.newRun(1,{civ:'TEU',biome:'steppe'});
  const u=g.units.find(u=>u.type==='villager'),node=g.findResource('food',g.world.base.x,g.world.base.y);
  assert.ok(node);
  const walkable=(x,y)=>g.isWalkable(x,y,u);walkable.segment=(a,b)=>g.segmentWalkable(a,b,u);
  const path=findPath(u,node,walkable,g.world.size,{range:(g.unitRange(u)+node.radius+.2)*.95});
  assert.equal(path.status,'ready');
});
