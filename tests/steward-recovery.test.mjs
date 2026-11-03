import test from 'node:test';
import assert from 'node:assert/strict';
globalThis.document={documentElement:{dataset:{}},dispatchEvent(){}};
const {Game}=await import('../js/game.js');
const {canSpend,updatePlans,confirmPlan,trainArmy,planBuilding}=await import('../js/stewards.js');
function fresh(){const g=new Game();g.newRun(42,{civ:'CHN'});return g;}

test('升級缺糧不阻擋純木建築，實際支出的資源仍須預留 / age food shortfall does not block wood-only construction; charged reserves remain enforced',()=>{
 const g=fresh();g.stewards.age='ask';g.resources={food:0,wood:100,gold:0,stone:0};
 assert.equal(canSpend(g,g.buildingCost('house')),true);
 assert.equal(canSpend(g,{food:1}),false);
 g.stewards.reserve=[0,60,0,999];assert.equal(canSpend(g,{wood:60}),false);
 g.resources.wood=120;assert.equal(canSpend(g,{wood:60}),true);
 assert.equal(canSpend(g,{wood:60},{wood:80}),false);
});
test('資源不足、手動放置及恢復不重複施工 / scarcity, manual placement and recovery never duplicate construction',()=>{
 const g=fresh();g.stewards.age='ask';g.stewards.buildings.house={mode:'auto',max:3,age:1};g.resources={food:0,wood:0,gold:0,stone:0};updatePlans(g);
 assert.equal(g.buildings.filter(b=>b.type==='house').length,2);
 g.resources.wood=120;g.time=3;g.placement={type:'house',x:1,y:1};updatePlans(g);assert.equal(g.buildings.filter(b=>b.type==='house').length,2);
 g.placement=null;g.time=6;updatePlans(g);assert.equal(g.buildings.filter(b=>b.type==='house').length,3);
 g.time=9;updatePlans(g);assert.equal(g.buildings.filter(b=>b.type==='house').length,3);assert.equal(g.resources.wood,60);
});
test('手動升級、資源改派與模式變更使提案失效 / manual research, reprioritized resources and mode changes invalidate proposals',()=>{
 for(const mode of['research','manual','shortfall']){const g=fresh();g.resources={food:5000,wood:5000,gold:5000,stone:5000};g.stewards.age='ask';updatePlans(g);assert.equal(g.stewards.pending.kind,'age');
 if(mode==='research')g.advanceAge();if(mode==='manual')g.stewards.age='manual';if(mode==='shortfall')g.resources.food=0;
 g.time=3;updatePlans(g);assert.equal(g.stewards.pending,null,mode);}
});
test('過期升級確認不得冒充新研究成功 / stale age confirmation cannot claim a new research success',()=>{
 const g=fresh();g.resources={food:5000,wood:5000,gold:5000,stone:5000};g.stewards.age='ask';updatePlans(g);g.advanceAge();const research={...g.ageResearch},resources={...g.resources};
 assert.equal(confirmPlan(g),false);assert.deepEqual(g.ageResearch,research);assert.deepEqual(g.resources,resources);
});
test('無關資源預留不阻擋軍營，實際費用與手動佇列仍優先 / unrelated reserves do not block barracks; actual costs and manual queues stay authoritative',()=>{
 const g=fresh();g.resources={food:5000,wood:5000,gold:5000,stone:0};g.stewards.reserve=[0,0,0,500];const b=g.buildings.find(b=>b.type==='barracks');g.stewards.military[b.id]={enabled:true,units:['militia'],targets:{militia:{count:10,priority:1}},queue:3};
 trainArmy(g);assert.equal(b.queue.length,1);b.queue=[];g.trainUnit(b,'militia');const n=b.queue.length;trainArmy(g);assert.equal(b.queue.length,n);
});
test('自動升級不得花掉玩家預留，手動升級仍可決定支出 / auto ages honor configured reserves while manual research remains available',()=>{
 const g=fresh();g.stewards.age='auto';g.stewards.reserve=[100,0,0,500];g.resources={food:200,wood:500,gold:100,stone:0};updatePlans(g);assert.equal(g.ageResearch,null);
 g.resources.food=300;g.time=3;updatePlans(g);assert.ok(g.ageResearch);assert.equal(g.resources.food,130);
 const h=fresh();h.stewards.age='auto';h.stewards.reserve=[100,0,0,0];h.resources={food:200,wood:500,gold:100,stone:0};h.advanceAge();assert.ok(h.ageResearch);
});
test('自動升級預留包含費用加玩家底線，防止訓練吃掉可用餘額 / auto-age reserve includes fee plus player floor so training cannot starve research',()=>{
 const g=fresh();g.stewards.age='auto';g.stewards.reserve=[100,0,0,500];g.resources={food:260,wood:500,gold:120,stone:0};updatePlans(g);assert.equal(g.ageResearch,null);
 assert.equal(canSpend(g,g.unitCost('villager')),false);
 g.resources.food=270;g.time=3;updatePlans(g);assert.ok(g.ageResearch);assert.equal(g.resources.food,100);
});
function cageWorkers(g,all=false){const workers=g.units.filter(u=>u.type==='villager');for(const u of all?workers:[workers[0]]){u.x=12;u.y=12;}const walls=[];for(let i=10;i<=14;i++){walls.push(g.addBuilding('wall',i,10,true),g.addBuilding('wall',i,14,true));if(i>10&&i<14)walls.push(g.addBuilding('wall',10,i,true),g.addBuilding('wall',14,i,true));}return{workers,walls};}
test('首名工人受困時其他可達工人接手 / another reachable worker builds when the first is trapped',()=>{
 const g=fresh();g.resources={food:5000,wood:5000,gold:5000,stone:5000};const{workers}=cageWorkers(g);assert.equal(planBuilding(g,'house'),true);const house=g.buildings.at(-1);assert.equal(house.type,'house');assert.notEqual(g.units.find(u=>u.buildTarget===house)?.id,workers[0].id);
});
test('全員受困不花費，解除阻塞後續查完成 / all blocked workers spend nothing and resume after obstruction removal',()=>{
 const g=fresh();g.resources={food:5000,wood:5000,gold:5000,stone:5000};const{walls}=cageWorkers(g,true),before={...g.resources};assert.equal(planBuilding(g,'house'),false);assert.deepEqual(g.resources,before);for(const w of walls)w.alive=false;let placed=false;for(let i=0;i<8&&!placed;i++)placed=planBuilding(g,'house');assert.equal(placed,true);assert.equal(g.resources.wood,before.wood-60);
});
