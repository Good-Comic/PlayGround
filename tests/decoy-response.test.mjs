import test from 'node:test';import assert from 'node:assert/strict';
globalThis.document={documentElement:{dataset:{}},dispatchEvent(){}};const{Game}=await import('../js/game.js');
function scene(){const g=new Game();g.newRun(42,{civ:'TEU'});g.units=[];g.buildings=[];g.world.resources=[];g.crowd=null;const d=g.spawnUnit('decoy',10,10),e=g.spawnUnit('brute',11,10,'enemy');return{g,d,e}}
test('idle and held noncombat decoys do not auto-acquire enemy targets',()=>{for(const state of ['idle','hold']){const{g,d,e}=scene();d.state=state;d.hold=state==='hold';g.updatePlayerUnit(d,.05);assert.equal(d.state,state);assert.notEqual(d.target,e)}});
test('damage does not make a decoy attempt retaliation but still hurts it',()=>{const{g,d,e}=scene(),hp=d.hp;d.state='idle';g.applyDamage(d,20,e);assert.ok(d.hp<hp);assert.equal(d.state,'idle');assert.notEqual(d.target,e)});
test('ordinary stationary military still acquires and retaliates',()=>{const{g,e}=scene(),u=g.spawnUnit('guard',10,11);u.state='idle';g.applyDamage(u,20,e);assert.equal(u.state,'attack');assert.equal(u.target,e)});
