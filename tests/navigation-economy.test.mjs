import test from 'node:test';
import assert from 'node:assert/strict';
import {findPath,segmentClear} from '../js/navigation.js';
globalThis.document={documentElement:{dataset:{}},dispatchEvent(){}};
const {Game}=await import('../js/game.js');
function arena() {
 const g=new Game();g.units=[];g.buildings=[];g.world={size:30,resources:[],props:[],tile:(x,y)=>x>=0&&y>=0&&x<30&&y<30?{terrain:'grass'}:null};
 g.addParticles=()=>{};g.addFloating=()=>{};g.toast=()=>{};g.autoEconomy=false;g.autoMilitary=false;
 return g;
}
function tick(g,n,dt=.1){for(let i=0;i<n;i++){g.time+=dt;g.updateUnits(dt);}}
test('A* routes around a wall through its only gap without cutting corners',()=>{
 const legal=(x,y)=>x>=.3&&y>=.3&&x<20&&y<20&&!(x>9&&x<11&&y<16);
 const start={x:4,y:4},p=findPath(start,{x:16,y:4},legal,20);
 assert.equal(p.status,'ready');assert.ok(p.points.some(p=>p.y>=16));
 for(const q of p.points){assert.ok(segmentClear(legal,start,q));Object.assign(start,q);}
});
test('blocked endpoint projects onto a legal destination',()=>{
 const legal=(x,y)=>x>0&&y>0&&x<20&&y<20&&!(x>=10&&x<=13&&y>=10&&y<=13);
 const p=findPath({x:5,y:5},{x:11,y:11},legal,20);assert.equal(p.status,'ready');assert.ok(legal(p.goal.x,p.goal.y));
});
test('water-separated destination is unreachable, never teleported to',()=>{
 const legal=(x,y)=>x>0&&y>0&&x<20&&y<20&&!(x>9&&x<11);
 assert.equal(findPath({x:4,y:4},{x:16,y:4},legal,20).status,'unreachable');
});
test('all unit classes navigate around a building and finish a blocked-endpoint move',()=>{
 for(const type of ['villager','militia','archer','light_cavalry','commander','ram','elephant']){
  const g=arena();g.addBuilding('house',10,10);const u=g.spawnUnit(type,7,11);assert.ok(u,type);
  g.commandMove([u],11,11);tick(g,220);
  assert.equal(u.state,'idle',type);assert.ok(g.isWalkable(u.x,u.y,u),type);assert.ok(u.x>8,type);
 }
});
test('moving around trees and water preserves collision clearance',()=>{
 const g=arena();g.world.tile=(x,y)=>({terrain:x>9&&x<11&&y<17?'water':'grass'});
 g.world.resources=[{id:1,x:7,y:8,kind:'oak',alive:true,amount:100,resource:'wood'}];
 const u=g.spawnUnit('militia',4,4);g.commandMove([u],16,4);
 for(let i=0;i<600;i++){tick(g,1);assert.ok(g.isWalkable(u.x,u.y,u));}
 assert.equal(u.state,'idle');assert.ok(Math.hypot(u.x-16,u.y-4)<.1);
});
test('four resources complete at least three capacity/deposit/restart cycles each',()=>{
 const g=arena();g.addBuilding('core',12,12,true);
 const nodes=[['food',7,9],['wood',18,9],['gold',7,18],['stone',18,18]].map(([resource,x,y],i)=>({id:100+i,x,y,kind:resource==='wood'?'oak':'ore',resource,amount:200,maxAmount:200,radius:.32,alive:true}));
 g.world.resources=nodes;const initial={...g.resources};const cycles=new Map();const previous=new Map();
 for(const n of nodes){const u=g.spawnUnit('villager',n.x-1,n.y);g.orderGather(u,n);cycles.set(u.id,0);}
 for(let i=0;i<1300;i++){
  tick(g,1);
  for(const u of g.units){if(previous.get(u.id)>0&&u.carry===0)cycles.set(u.id,cycles.get(u.id)+1);previous.set(u.id,u.carry);}
 }
 assert.ok([...cycles.values()].every(n=>n>=3),JSON.stringify([...cycles]));
 for(const n of nodes){const u=g.units.find(u=>u.gatherTarget===n);assert.ok(g.resources[n.resource]-initial[n.resource]>=30,n.resource);assert.ok(Math.abs((200-n.amount)-(g.resources[n.resource]-initial[n.resource]+u.carry))<1e-6,n.resource);}
});
test('depleted resource delivers remainder, switching resource cannot change carried type',()=>{
 const g=arena();g.addBuilding('core',12,12,true);const u=g.spawnUnit('villager',10,10);
 const wood={id:1,x:8,y:8,kind:'oak',resource:'wood',alive:true,amount:1,radius:.32};g.world.resources=[wood];
 g.orderGather(u,wood);tick(g,300);assert.equal(u.carry,0);assert.equal(wood.amount,0);
 u.carry=4;u.carryType='wood';const gold={id:2,x:7,y:7,resource:'gold',alive:true,amount:100,radius:.32};g.world.resources.push(gold);
 const before={...g.resources};g.orderGather(u,gold);assert.equal(u.state,'return');tick(g,100);
 assert.ok(g.resources.wood>=before.wood+4);assert.ok(u.carryType===null||u.carryType==='gold');
});
test('unreachable gathering target is replaced without losing carried cargo',()=>{
 const g=arena();g.addBuilding('core',3,12,true);g.world.tile=(x,y)=>({terrain:x>14&&x<16?'water':'grass'});
 const nodes=[{id:1,x:20,y:10,resource:'gold',alive:true,amount:100,radius:.32},{id:2,x:9,y:10,resource:'gold',alive:true,amount:100,radius:.32}];g.world.resources=nodes;
 const u=g.spawnUnit('villager',10,10);g.orderGather(u,nodes[0]);tick(g,250);assert.equal(u.gatherTarget,nodes[1]);assert.ok(nodes[1].amount<100);
});
test('destroyed dropoff reassigns to a surviving camp without duplicate credit',()=>{
 const g=arena();const core=g.addBuilding('core',12,12,true),camp=g.addBuilding('camp',3,12,true);
 const u=g.spawnUnit('villager',11,11);u.carry=10;u.carryType='gold';const before=g.resources.gold;
 g.beginReturn(u);core.alive=false;tick(g,300);
 assert.equal(u.carry,0);assert.equal(g.resources.gold,before+10);assert.equal(u.dropTarget,camp);
 tick(g,100);assert.equal(g.resources.gold,before+10);
});
test('save/load restores an in-flight return and continues economic work',()=>{
 const g=new Game();g.autoEconomy=false;g.autoMilitary=false;
 const u=g.units.find(u=>u.type==='villager');const n=g.world.resources.find(n=>n.alive&&n.resource==='gold');
 u.carry=7;u.carryType='gold';u.gatherTarget=n;g.beginReturn(u);
 const snapshot=JSON.parse(JSON.stringify(g.snapshot()));const restored=new Game();restored.restore(snapshot);
 const loaded=restored.units.find(x=>x.id===u.id),before=restored.resources.gold;
 for(let i=0;i<500&&loaded.carry>=7;i++)tick(restored,1);
 assert.ok(restored.resources.gold>=before+7);assert.equal(loaded.gatherTarget.id,n.id);assert.equal(loaded.state,'gather');
});
test('old saves without stances migrate safely',()=>{
 const g=new Game(),snapshot=g.snapshot();for(const u of snapshot.units){delete u.stance;delete u.guardOrigin;delete u.manualAttack;}
 const loaded=new Game();loaded.restore(snapshot);assert.ok(loaded.units.every(u=>u.stance==='defensive'));
});
test('LIVE seed regression: food workers reach the sub-grid building edge and deposit',()=>{
 const g=new Game();g.newRun(3215474622,{civ:'TEU',biome:'steppe'});g.autoEconomy=false;g.autoMilitary=false;
 const before=g.resources.food;tick(g,450);
 assert.ok(g.resources.food>=before+30);
 for(const id of [9,10,14]) {const u=g.units.find(u=>u.id===id);assert.ok(u.gatherTarget.amount<u.gatherTarget.maxAmount);assert.notEqual(u._nav?.status,'budget_exhausted');}
});
test('a newly placed building invalidates an old route without clipping through it',()=>{
 const g=arena(),u=g.spawnUnit('light_cavalry',4,12);g.commandMove([u],20,12);tick(g,10);
 const wall=g.addBuilding('house',11,11,true);
 for(let i=0;i<150;i++){tick(g,1);assert.ok(g.isWalkable(u.x,u.y,u));}
 assert.equal(u.state,'idle');assert.ok(u.x>wall.x+wall.w);
});
