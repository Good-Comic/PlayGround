import test from 'node:test';
import assert from 'node:assert/strict';
globalThis.document={documentElement:{dataset:{}},dispatchEvent(){}};
globalThis.window={innerWidth:1600,innerHeight:1000};
const {Game}=await import('../js/game.js');
const {directionalAnimationFrame}=await import('../js/visuals.js');

test('movement and combat update visual direction without changing gameplay radii',()=>{
 const g=new Game(),u=g.units.find(unit=>unit.type==='militia'),radius=u.typeDef.radius;
 g.inMenu=false;g.paused=false;g.autoEconomy=false;g.autoMilitary=false;
 for(const tile of g.world.tiles)tile.terrain='grass';g.world.resources=[];g.world.props=[];g.world.wildlife=[];g.world.seed++;g.crowd=null;
 const start={x:u.x,y:u.y};g.commandMove([u],u.x-5,u.y);
 for(let i=0;i<20;i++)g.updateUnits(.05);
 assert.ok(Math.hypot(u.x-start.x,u.y-start.y)>.1);
 assert.ok(['W','NW','SW'].includes(u.visualDirection));
 assert.equal(u.typeDef.radius,radius);
 const foe=g.spawnUnit('raider',u.x-1,u.y,'enemy');g.attackUnit(u,foe);
 assert.equal(directionalAnimationFrame(u).state,'attack');
 assert.ok(['W','NW','SW'].includes(u.visualDirection));
});

test('death presentation persists briefly and survives a snapshot without reviving the unit',()=>{
 const g=new Game(),u=g.units.find(unit=>unit.type==='militia');g.killEntity(u,null);
 assert.equal(u.alive,false);assert.equal(u.deathAnim,1.2);assert.equal(directionalAnimationFrame(u).state,'death');
 g.updateUnits(.2);assert.ok(u.deathAnim<1.2&&u.deathAnim>0);
 const snapshot=g.snapshot(),restored=new Game();restored.restore(snapshot);const dead=restored.units.find(unit=>unit.id===u.id);
 assert.equal(dead.alive,false);assert.equal(dead.deathAnim,u.deathAnim);assert.equal(directionalAnimationFrame(dead).state,'death');
 restored.updateUnits(2);assert.equal(dead.deathAnim,0);assert.equal(dead.alive,false);
});
