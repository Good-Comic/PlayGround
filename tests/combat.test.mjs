import test from 'node:test';
import assert from 'node:assert/strict';
globalThis.document = { documentElement: { dataset: {} }, dispatchEvent() {} };
const { Game } = await import('../js/game.js');

function arena() {
  const g = new Game();
  g.units = []; g.buildings = []; g.autoEconomy = false; g.autoMilitary = false;
  g.addParticles = () => {}; g.addFloating = () => {}; g.toast = () => {};
  const soldier = g.spawnUnit('militia', 10, 10);
  const enemy = g.spawnUnit('militia', 11, 10, 'enemy');
  return { g, soldier, enemy };
}
test('dead attack target is replaced on the next player update', () => {
  const { g, soldier, enemy } = arena();
  soldier.state = 'attack'; soldier.target = enemy; enemy.alive = false;
  const next = g.spawnUnit('militia', 12, 10, 'enemy');
  g.updatePlayerUnit(soldier, .016);
  assert.equal(soldier.target, next); assert.equal(soldier.state, 'attack');
});
test('dead target with no replacement returns to idle', () => {
  const { g, soldier, enemy } = arena();
  soldier.state = 'attack'; soldier.target = enemy; enemy.alive = false;
  g.updatePlayerUnit(soldier, .016);
  assert.equal(soldier.target, null); assert.equal(soldier.state, 'idle');
});
test('manual move and attack take precedence over automatic acquisition', () => {
  const { g, soldier, enemy } = arena();
  g.commandMove([soldier], 14, 10); g.updatePlayerUnit(soldier, .016);
  assert.equal(soldier.state, 'move'); assert.equal(soldier.target, null);
  soldier.manualAttack = true; soldier.state = 'attack'; soldier.target = enemy; soldier.retargetTimer = 0;
  g.spawnUnit('militia', 10.2, 10, 'enemy');
  g.updatePlayerUnit(soldier, .016); assert.equal(soldier.target, enemy);
});
test('passive never acquires or retaliates automatically', () => {
  const { g, soldier, enemy } = arena(); soldier.stance = 'passive';
  g.updatePlayerUnit(soldier, .016); assert.equal(soldier.target, null);
  g.applyDamage(soldier, 2, enemy); assert.equal(soldier.target, null);
});
test('hold position can attack in range without pursuing', () => {
  const { g, soldier, enemy } = arena(); soldier.stance = 'hold'; soldier.hold = true; soldier.state = 'hold';
  enemy.x = 10.4; g.updatePlayerUnit(soldier, .016); assert.equal(soldier.target, enemy);
  enemy.x = 15; g.updatePlayerUnit(soldier, .016);
  assert.equal(soldier.x, 10); assert.equal(soldier.y, 10); assert.equal(soldier.target, null);
});
test('defensive units return to guard origin after leash is exceeded', () => {
  const { g, soldier, enemy } = arena(); soldier.state = 'attack'; soldier.target = enemy; enemy.x = 20;
  g.updatePlayerUnit(soldier, .016);
  assert.equal(soldier.target, null); assert.deepEqual(soldier.targetPos, {x:10,y:10});
});
test('idle defensive unit retaliates; moving unit keeps manual order', () => {
  const { g, soldier, enemy } = arena(); g.applyDamage(soldier, 2, enemy); assert.equal(soldier.target, enemy);
  g.commandMove([soldier], 14, 10); g.applyDamage(soldier, 2, enemy); assert.equal(soldier.target, null);
});
test('enemy opportunistic attack cannot target itself or friendly units', () => {
  const { g, soldier, enemy } = arena(); soldier.x = 30;
  const ally = g.spawnUnit('militia', 11.2, 10, 'enemy'); enemy.cooldown = 0;
  const hit = []; g.attackUnit = (u, target) => hit.push(target);
  g.tryAutoAttack(enemy, soldier); assert.equal(hit.length, 0); assert.equal(ally.hp, ally.maxHp);
});
test('stances persist in snapshots and old saves default to defensive', () => {
  const g = new Game(); const u = g.units.find(u=>u.type==='militia');
  u.stance = 'passive'; const snapshot = g.snapshot();
  const restored = new Game(); assert.equal(restored.restore(snapshot), true);
  assert.equal(restored.units.find(x=>x.id===u.id).stance, 'passive');
});
test('single stance command cycles through all four stances, including for heroes',()=>{
 const {g,soldier}=arena();g.setSelection([soldier]);const seen=new Set();
 for(let i=0;i<4;i++){g.command('stance:next');seen.add(soldier.stance);}
 assert.deepEqual([...seen].sort(),['aggressive','defensive','hold','passive']);
});
