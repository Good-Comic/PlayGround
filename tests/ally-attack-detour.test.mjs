import test from 'node:test';
import assert from 'node:assert/strict';
import '../tools/qa/ram-pick-065e2912/node-dom-fixture.mjs';
import {Crowd} from '../js/crowd.js';
import {defenseClickPoint} from '../js/core-defense.js';
const {Game}=await import(process.env.ALLY_TEST_GAME||'../js/game.js');

// 受控正常地形：不改兵種數值、碰撞或地形；不是自然戰役／C-36精確重播。
function fixture(team='player',hold=false,ram=false){
 const g=new Game();g.newRun(42,{civ:'FRK',biome:'steppe'});g.start();g.units=[];g.buildings=[];g.hero=null;g.crowd=null;g.time=0;let p;
 for(let y=3;y<g.world.size-4&&!p;y++)for(let x=3;x<g.world.size-8;x++){let ok=true;for(let dy=-2;dy<=2;dy+=.5)for(let dx=-1;dx<=6;dx+=.5)if(!g.isWalkable(x+dx,y+dy))ok=false;if(ok){p={x,y};break;}}
 assert.ok(p);const actor=g.spawnUnit('militia',p.x,p.y,team),blockers=[g.spawnUnit('archer',p.x+.435,p.y-.25,team),g.spawnUnit('archer',p.x+.435,p.y+.25,team)];
 let target=g.addBuilding(ram?'core':team==='player'?'house':'core',p.x+4,p.y-1,true);target.team=ram?'player':team==='player'?'enemy':'player';
 if(ram){target=g.spawnUnit('ram',p.x+3.4,p.y,'enemy');g.waveEventActive=true;target.eventFlags=['breach'];}
 assert.ok(blockers.every((u,i)=>Math.abs(u.x-p.x-.435)<1e-8&&Math.abs(u.y-p.y-(i? .25:-.25))<1e-8));
 if(team==='player'){const point=defenseClickPoint(g,target);assert.ok(point);assert.equal(g.pickAt(point.x,point.y),target);g.setSelection([actor,...blockers]);g.issueCommand(point.x,point.y);}
 if(hold)for(const u of blockers)Object.assign(u,{state:'hold',hold:true,stance:'passive',target:null});
 return{g,actor,blockers,target,p};
}
function battle(team='player',hold=false,restore=false,ram=false){
 let f=fixture(team,hold,ram);
 if(restore){const ids={actor:f.actor.id,blockers:f.blockers.map(u=>u.id),target:f.target.id},g=new Game();g.restore(f.g.snapshot());f={g,actor:g.units.find(u=>u.id===ids.actor),blockers:ids.blockers.map(id=>g.units.find(u=>u.id===id)),target:g.buildings.find(b=>b.id===ids.target)};}
 const{g,actor,blockers,target}=f,origin=blockers.map(u=>({x:u.x,y:u.y})),hits=[];let maxBlockerMove=0,maxPenetration=0,firstFailure=null;
 const apply=g.applyDamage;g.applyDamage=function(t,amount,source,...args){const before=t.hp,result=apply.call(this,t,amount,source,...args);if(source===actor&&t===target)hits.push({time:this.time,source:source.id,target:t.id,actual:before-t.hp});return result;};
 for(let i=0;i<600;i++){g.time+=1/60;g.updateUnits(1/60);g.updateProjectiles(1/60);for(let j=0;j<2;j++)maxBlockerMove=Math.max(maxBlockerMove,Math.hypot(blockers[j].x-origin[j].x,blockers[j].y-origin[j].y));for(let j=0;j<g.units.length;j++)for(let k=j+1;k<g.units.length;k++){const a=g.units[j],b=g.units[k];maxPenetration=Math.max(maxPenetration,a.typeDef.radius+b.typeDef.radius-Math.hypot(a.x-b.x,a.y-b.y));}if(actor.orderFailure&&!firstFailure)firstFailure=g.time;}
 const result={team,hold,actor:{x:actor.x,y:actor.y,state:actor.state,failure:actor.orderFailure||null},target:{type:target.type,hp:target.hp,alive:target.alive},hits,maxBlockerMove,maxPenetration,firstFailure,rng:g.rng.state,visualRng:g.visualRng.state};console.log('ALLY_DETOUR',JSON.stringify(result));return result;
}
test('原地射擊的友軍不再使已接令近戰兵誤走相同堵塞路線直到退出',()=>{
 const r=battle();assert.ok(r.hits.length>0,'必須是該近戰兵的實際傷害');assert.equal(r.actor.failure,null);assert.equal(r.maxBlockerMove,0);assert.ok(r.maxPenetration<=.015001);
});
test('同隊敵軍使用相同佔位修正，原生AI可繞過射程內友軍接敵',()=>{
 const r=battle('enemy');assert.ok(r.hits.length>0);assert.equal(r.maxBlockerMove,0);assert.ok(r.maxPenetration<=.015001);
});
test('既有原地待命佔位繞行仍正常',()=>{const r=battle('player',true);assert.ok(r.hits.length>0);assert.equal(r.maxBlockerMove,0);assert.ok(r.maxPenetration<=.015001);});
test('原生存檔讀回同樣可繞行接敵，不新增持久導航欄位',()=>{const r=battle('player',false,true);assert.ok(r.hits.length>0);assert.equal(r.actor.failure,null);assert.ok(r.maxPenetration<=.015001);});
test('衝車正常攻城時可繞過射擊友軍接敵，不改護甲或偽造衝車擊殺',()=>{const r=battle('player',false,false,true);assert.equal(r.target.type,'ram');assert.ok(r.target.alive);assert.ok(r.hits.length>0);assert.ok(r.hits.every(h=>h.actual===1));assert.equal(r.actor.failure,null);assert.equal(r.maxBlockerMove,0);assert.ok(r.maxPenetration<=.015001);});
test('射程外追擊、死亡目標、敵方攻擊者與建築射程邊界不新增靜態佔位',()=>{
 for(const kind of ['chasing','dead','opponent','building-boundary']){
  const{g,actor,blockers,target,p}=fixture();
  for(const v of blockers){v.state='attack';v.target=target;if(kind==='chasing')v.x=p.x-1;if(kind==='dead')target.alive=false;if(kind==='opponent'){v.team='enemy';v.target=actor;}if(kind==='building-boundary')v.x=p.x-.95;}
  if(kind==='building-boundary')assert.ok(blockers.every(v=>g.distanceTo(v,target)>g.unitRange(v)-.1&&g.distanceTo(v,target)<g.unitRange(v)));
  g.crowd=new Crowd(g.units);actor._avoidCrowdUntil=10;actor._nav={tx:target.x,ty:target.y,range:.8,status:'pending',points:[],retryAt:0};actor._crowdBlockedBy=blockers;g.navigationBudget=2;g.stepToward(actor,target.x,target.y,1/60,.8,target);
  assert.equal(actor._nav.crowdDetour,false,kind);
 }
});
test('固定種子與步進可重現，沒有新的隨機佔位決策',()=>{assert.deepEqual(battle(),battle());});
