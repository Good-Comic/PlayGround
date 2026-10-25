import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
globalThis.document={documentElement:{dataset:{}},dispatchEvent(){}};
const {Game}=await import('../js/game.js');
const observations=[];
function report(name,threshold,observed){observations.push({name,threshold,observed});console.log('OBSERVATION',JSON.stringify({name,threshold,observed}));}
process.on('exit',()=>{if(process.env.QA_OUT)fs.writeFileSync(process.env.QA_OUT,JSON.stringify(observations,null,2));});
function arena(size=30){const g=new Game();g.units=[];g.buildings=[];g.crowd=null;g.world={size,resources:[],props:[],tile:(x,y)=>x>=0&&y>=0&&x<size&&y<size?{terrain:'grass'}:null};g.addParticles=()=>{};g.addFloating=()=>{};g.toast=()=>{};g.autoEconomy=false;g.autoMilitary=false;return g;}
function tick(g,n,dt=.05,check=()=>{}){for(let i=0;i<n;i++){g.time+=dt;g.updateUnits(dt);check();}}
function pairPenetration(units){let max=0;for(let i=0;i<units.length;i++)for(let j=i+1;j<units.length;j++)max=Math.max(max,(units[i].typeDef.radius||.24)+(units[j].typeDef.radius||.24)-Math.hypot(units[i].x-units[j].x,units[i].y-units[j].y));return max;}
test('24-unit crowd reaches separate formation slots without overlap or static clipping',()=>{
 const g=arena();const units=[];for(let y=0;y<4;y++)for(let x=0;x<6;x++)units.push(g.spawnUnit('militia',4+x*.8,5+y*.8));
 g.commandMove(units,21,20);let penetration=0,clipped=0;
 tick(g,1400,.05,()=>{penetration=Math.max(penetration,pairPenetration(units));clipped+=units.filter(u=>!g.isWalkable(u.x,u.y,u)).length;});
 const arrived=units.filter(u=>u.state==='idle').length;report('crowd-24','24/24 arrive within 70s; penetration <= .025; static clips 0',{arrived,penetration,clipped});
 assert.equal(clipped,0);assert.ok(penetration<=.025);assert.equal(arrived,24);
});
test('opposing units pass a narrow building corridor by yielding, without overlap',()=>{
 const g=arena();g.addBuilding('core',10,5,true);g.addBuilding('core',10,10,true); // 1-tile corridor y9..10
 const a=g.spawnUnit('militia',7,9.5),b=g.spawnUnit('militia',17,9.5);
 g.commandMove([a],18,9.5);g.commandMove([b],6,9.5);let penetration=0,clipped=0;
 tick(g,1200,.05,()=>{penetration=Math.max(penetration,pairPenetration([a,b]));clipped+=![a,b].every(u=>g.isWalkable(u.x,u.y,u));});
 report('narrow-opposing','both arrive <=60s, penetration <=.025, no static clipping',{a:{x:a.x,y:a.y,state:a.state},b:{x:b.x,y:b.y,state:b.state},penetration,clipped});
 assert.equal(clipped,0);assert.ok(penetration<=.025);assert.equal(a.state,'idle');assert.equal(b.state,'idle');
});
test('unreachable manual combat target is abandoned and reachable enemy acquired',()=>{
 const g=arena();g.world.tile=(x,y)=>({terrain:x>=14&&x<16?'water':'grass'});
 const u=g.spawnUnit('militia',10,10),unreachable=g.spawnUnit('militia',20,10,'enemy'),other=g.spawnUnit('militia',11,12,'enemy');
 u.state='attack';u.target=unreachable;u.manualAttack=true;unreachable.stance='passive';other.stance='passive';
 for(let i=0;i<100&&!u.orderFailure;i++){g.time+=.05;g.navigationBudget=2;g.updatePlayerUnit(u,.05);}
 report('unreachable-combat','failure recorded <=5s, target replaced, no water crossing',{time:g.time,failure:u.orderFailure,target:u.target?.id,x:u.x});
 assert.equal(u.orderFailure,'unreachable');assert.equal(u.target,other);assert.ok(u.x<14);
});
test('continuous combat clears death references in the same kill event and acquires next',()=>{
 const g=arena(),u=g.spawnUnit('militia',10,10);const enemies=[g.spawnUnit('militia',10.6,10,'enemy'),g.spawnUnit('militia',11,10.5,'enemy'),g.spawnUnit('militia',10.7,11,'enemy')];
 u.state='attack';u.target=enemies[0];const transitions=[];
 for(const enemy of enemies){g.killEntity(enemy,u);transitions.push({dead:enemy.id,target:u.target?.id,state:u.state});assert.notEqual(u.target,enemy);}
 report('continuous-retarget','zero dead references immediately after each of 3 kills',transitions);assert.equal(u.target,null);assert.equal(u.state,'idle');
});
test('all stances obey acquire, chase, retaliation and manual priority contracts',()=>{
 const results=[];
 for(const stance of ['aggressive','defensive','hold','passive']){
  const g=arena(),u=g.spawnUnit('militia',10,10),e=g.spawnUnit('militia',12,10,'enemy');u.stance=stance;u.hold=stance==='hold';u.state=u.hold?'hold':'idle';
  g.updatePlayerUnit(u,.05);const acquired=!!u.target;assert.equal(acquired,['aggressive','defensive'].includes(stance));
  g.applyDamage(u,2,e);const retaliates=!!u.target;assert.equal(retaliates,['aggressive','defensive'].includes(stance));
  g.commandMove([u],6,10);g.navigationBudget=2;g.updatePlayerUnit(u,.05);assert.equal(u.state,'move');assert.equal(u.target,null);results.push({stance,acquired,retaliates,manualMove:true});
 }
 report('stances','all four stance contracts match; explicit move never stolen',results);
});
test('12 villagers competing for wood complete long-run cycles with conservation',()=>{
 const g=arena();g.addBuilding('core',12,12,true);g.world.resources=[{id:100,x:8,y:9,kind:'oak',resource:'wood',amount:2000,maxAmount:2000,radius:.32,alive:true},{id:101,x:8,y:16,kind:'oak',resource:'wood',amount:2000,maxAmount:2000,radius:.32,alive:true}];
 const workers=[];for(let i=0;i<12;i++){const u=g.spawnUnit('villager',5+(i%4)*.8,6+Math.floor(i/4)*.8);workers.push(u);g.orderGather(u,g.world.resources[i%2]);}
 const before=g.resources.wood,cycles=new Map(workers.map(u=>[u.id,0])),prev=new Map();let penetration=0;
 tick(g,6000,.05,()=>{penetration=Math.max(penetration,pairPenetration(workers));for(const u of workers){if((prev.get(u.id)||0)>0&&u.carry===0)cycles.set(u.id,cycles.get(u.id)+1);prev.set(u.id,u.carry);}});
 const extracted=4000-g.world.resources.reduce((n,r)=>n+r.amount,0),credited=g.resources.wood-before,carried=workers.reduce((n,u)=>n+u.carry,0),error=Math.abs(extracted-credited-carried);
 report('economy-competition','300s, each worker >=3 unloads, conservation error <1e-6, penetration <=.025',{cycles:[...cycles.values()],credited,carried,error,penetration});
 assert.ok(error<1e-6);assert.ok(penetration<=.025);assert.ok([...cycles.values()].every(x=>x>=3));
});
test('save/load resumes move, gather, return and valid attack orders without path-cache dependence',()=>{
 const g=new Game();g.newRun(3215474622,{civ:'TEU',biome:'steppe'});g.autoEconomy=false;g.autoMilitary=false;
 const move=g.units.find(u=>u.type==='light_cavalry');g.commandMove([move],34,30);
 const returner=g.units.find(u=>u.type==='villager');returner.carry=7;returner.carryType='gold';g.beginReturn(returner);
 const soldier=g.units.find(u=>u.type==='militia');const e=g.spawnUnit('militia',soldier.x+2,soldier.y,'enemy');soldier.target=e;soldier.state='attack';soldier.manualAttack=true;
 const snap=JSON.parse(JSON.stringify(g.snapshot())),loaded=new Game();loaded.restore(snap);const before=loaded.resources.gold;
 let deadRefs=0;tick(loaded,1200,.05,()=>{deadRefs+=loaded.units.filter(u=>u.alive&&u.state==='attack'&&u.target&&!u.target.alive).length;});
 const restoredMove=loaded.units.find(u=>u.id===move.id);report('save-load','move completes, cargo credited once, no dead attack references',{moveState:restoredMove.state,goldDelta:loaded.resources.gold-before,deadRefs});
 assert.equal(restoredMove.state,'idle');assert.ok(loaded.resources.gold>=before+7);assert.equal(deadRefs,0);
});
test('eight units in opposing queues pass the one-tile corridor',()=>{
 const g=arena();g.addBuilding('core',10,5,true);g.addBuilding('core',10,10,true);
 const left=[],right=[];for(let i=0;i<4;i++){left.push(g.spawnUnit('militia',5+i*.8,9.5));right.push(g.spawnUnit('militia',17+i*.8,9.5));}
 g.commandMove(left,19,9.5);g.commandMove(right,5,9.5);const units=[...left,...right];let maxPenetration=0,clipped=0;
 tick(g,1600,.05,()=>{maxPenetration=Math.max(maxPenetration,pairPenetration(units));clipped+=units.filter(u=>!g.isWalkable(u.x,u.y,u)).length;});
 const arrived=units.filter(u=>u.state==='idle').length;report('narrow-queues-8','8/8 within80s, penetration<=.025, static clips0',{arrived,maxPenetration,clipped});assert.equal(arrived,8);assert.ok(maxPenetration<=.025);assert.equal(clipped,0);
});
test('fair search queue starts all 100 units despite continuous low-ID demand',()=>{
 const g=arena(50),units=[];for(let i=0;i<100;i++){const u=g.spawnUnit('militia',3+(i%10)*3,3+Math.floor(i/10)*3);u.stance='passive';units.push(u);g.commandMove([u],u.x+.6,u.y+.6);}
 const origins=new Map(units.map(u=>[u.id,{x:u.x,y:u.y}])),moved=new Set();let maximum=0;
 tick(g,300,.016,()=>{maximum=Math.max(maximum,g.navigationStats.searches);for(const u of units){const o=origins.get(u.id);if(Math.hypot(u.x-o.x,u.y-o.y)>.15)moved.add(u.id);if(u.state==='idle')g.commandMove([u],o.x+.6,o.y+.6);}});
 report('fair-queue-100','all100 move within4.8s; <=2 searches/update',{moved:moved.size,maxSearches:maximum});assert.equal(moved.size,100);assert.ok(maximum<=2);
});
test('directly controlled passive hero does not auto-attack',()=>{
 const g=arena(),u=g.spawnUnit('commander',10,10),e=g.spawnUnit('militia',11,10,'enemy');g.heroControl=true;u.stance='passive';u.cooldown=0;const hp=e.hp;
 g.updateHeroDirect(u,.05);assert.equal(e.hp,hp);assert.equal(u.target,null);
 report('passive-direct-hero','no damage or autonomous target while passive',{enemyHp:e.hp,initialHp:hp});
});
