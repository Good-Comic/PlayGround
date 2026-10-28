// Native-input policy only. Page evaluation reads state; it never changes game state.
export function recoveryPriority({workers,queued,food,cost,coreAlive,target=8}) {
 return coreAlive && workers+queued<target && food>=cost;
}
export const workerTarget = wave => Math.min(22, 8 + 2 * Math.max(0,wave-1));
export const foodTarget = workers => Math.max(3,Math.ceil(workers/2));
export const shouldResearch = ({age,wave,military}) => age===1 || (age===2 && (wave>=6 || military>=12));
export function laborTargets(workers){const food=Math.ceil(workers/2),wood=Math.min(workers-food,workers>=8?2:1),gold=Math.min(2,Math.max(0,workers-food-wood));return{food,wood,gold}}
export function resourcePriority(counts,resources,desiredFood=2,targets={wood:2,gold:2}) {
 if(resources.food<200&&counts.food<desiredFood)return 'food';
 if(counts.wood<targets.wood)return 'wood';
 if(counts.gold<targets.gold)return 'gold';
 if(counts.food<desiredFood)return 'food';
 return resources.food<200?'food':resources.wood<180?'wood':'gold';
}
export function protectionTargets(workers,enemies,core) {
 const active=workers.filter(w=>w.alive!==false);
 const ranked=active.map(w=>({worker:w,score:(enemies.some(e=>e.target===w.id)?100:0)+(w.gatherType==='food'?20:0)+(w.state==='gather'?10:0)-Math.hypot(w.x-core.x,w.y-core.y)*.01})).sort((a,b)=>b.score-a.score);
 return ranked.slice(0,2).map(r=>r.worker.id);
}
export function createV5Player({page:p,record,build}){
 let regrouped=false;
 async function pan(x,y){const r=await p.locator('#minimap').boundingBox();await p.mouse.click(r.x+x/50*r.width,r.y+y/50*r.height);await p.waitForTimeout(400)}
 async function point(id,resource=false){return p.evaluate(({id,resource})=>{const g=ageOfAsh.game,e=(resource?g.world.resources:[...g.units,...g.buildings]).find(e=>e.id===id&&e.alive);if(!e)return null;const q=g.screenPos(e.x+(e.w||0)/2,e.y+(e.h||0)/2),offsets=e.w?[-22,-45,-65,-90]:e.resource?[-10,-20,0]:[-18,-10,-25];for(const dy of offsets)for(const dx of [0,-9,9]){const x=q.x+dx*g.camera.zoom,y=q.y+dy*g.camera.zoom;if(x>270&&x<1210&&y>135&&y<610&&g.pickAt(x,y)===e&&document.elementFromPoint(x,y)===document.getElementById('game'))return{x,y,wx:e.x+(e.w||0)/2,wy:e.y+(e.h||0)/2}}return null},{id,resource})}
 async function select(id){if(await p.evaluate(()=>ageOfAsh.game.inMenu||ageOfAsh.game.paused||['boon','victory','defeat'].includes(ageOfAsh.game.phase)))return false;const armed=await p.evaluate(()=>({placement:ageOfAsh.game.placement?.type,order:ageOfAsh.game.orderMode}));if(armed.placement||armed.order){await p.keyboard.press('Escape');record('action',{command:'cancel-armed-cursor',armed})}let q=await point(id);if(!q){const e=await p.evaluate(id=>{const g=ageOfAsh.game,e=[...g.units,...g.buildings].find(e=>e.id===id&&e.alive);return e?{x:e.x+(e.w||0)/2,y:e.y+(e.h||0)/2}:null},id);if(!e)return false;await pan(e.x,e.y);q=await point(id)}if(!q){record('action-skipped',{command:'select',id,reason:'NO_NATIVE_PICK_POINT'});return false}await p.mouse.click(q.x,q.y);return p.evaluate(id=>ageOfAsh.game.selection.some(u=>u.id===id),id)}
 async function train(id,type){if(!await select(id))return false;const before=await p.evaluate(id=>{const g=ageOfAsh.game,b=g.buildings.find(b=>b.id===id);return{n:b.queue.length,resources:{...g.resources}}},id),button=p.locator(`[data-command="train:${type}"]`);if(!await button.count())return false;try{await button.click({timeout:1500})}catch(e){record('action-skipped',{command:'train:'+type,reason:e.name});return false}const after=await p.evaluate(id=>{const g=ageOfAsh.game,b=g.buildings.find(b=>b.id===id);return{n:b.queue.length,resources:{...g.resources}}},id);const accepted=after.n>before.n||(after.n>0&&Object.keys(before.resources).some(k=>after.resources[k]<before.resources[k]));record(accepted?'action':'action-skipped',{command:'verified-train:'+type,building:id,before,after});return accepted}
 async function assign(worker){
  const choice=await p.evaluate(id=>{const g=ageOfAsh.game,u=g.units.find(u=>u.id===id),tc=g.getTownCenter();if(!u?.alive||!tc)return null;const enemies=g.units.filter(e=>e.alive&&e.team==='enemy');const danger=enemies.some(e=>Math.hypot(u.x-e.x,u.y-e.y)<8);const counts={food:0,wood:0,gold:0};for(const v of g.units.filter(v=>v.alive&&v.team==='player'&&v.type==='villager')){const k=v.gatherTarget?.resource;if(k in counts)counts[k]++}return{idle:g.units.filter(v=>v.alive&&v.team==='player'&&v.type==='villager'&&!v.gatherTarget?.resource).length,danger,returning:u.state==='return'&&u.dropTarget===tc&&!u.gatherTarget,sheltered:u.state==='idle'&&g.distanceTo(u,tc)<1.5,counts,desiredFood:Math.max(3,Math.ceil(g.economicPopulation/2)),resources:{...g.resources},core:{x:tc.x,y:tc.y}}},worker.id);if(!choice)return;
  if(choice.danger){
   if(choice.returning||choice.sheltered)return;
   if(!await select(worker.id))return;
   const stop=p.locator('[data-command="stop"]');if(await stop.count()){try{await stop.click({timeout:1500})}catch(e){if(e.name!=='TimeoutError')throw e;const observed=await p.evaluate(id=>({alive:ageOfAsh.game.units.some(u=>u.id===id&&u.alive),phase:ageOfAsh.game.phase,selection:ageOfAsh.game.selection.map(u=>u.id)}),worker.id);record('action-skipped',{command:'withdraw-worker-stop',worker:worker.id,reason:'NATIVE_TARGET_CHANGED_OR_HIDDEN',observed});return}}
   const tc=await p.evaluate(()=>{const g=ageOfAsh.game,b=g.getTownCenter();return b?{id:b.id,x:b.x+2,y:b.y+2}:null});
   if(tc){await pan(tc.x,tc.y);const q=await point(tc.id);if(q){await p.mouse.click(q.x,q.y,{button:'right'});const outcome=await p.evaluate(id=>{const g=ageOfAsh.game,u=g.units.find(u=>u.id===id);return{state:u?.state,drop:u?.dropTarget?.id,gather:u?.gatherTarget?.id,distance:u?g.distanceTo(u,g.getTownCenter()):null}},worker.id);record(outcome.drop===tc.id&&!outcome.gather?'action':'action-skipped',{command:'verified-worker-withdraw-to-core',worker:worker.id,outcome});return}}
   record('action-skipped',{command:'withdraw-worker',id:worker.id,reason:'NO_NATIVE_CORE_TARGET'});return;
  }
  const targets=laborTargets(Object.values(choice.counts).reduce((a,b)=>a+b,0)+choice.idle);
  const overAllocated=(worker.gatherType==='wood'&&choice.counts.wood>targets.wood)||(worker.gatherType==='gold'&&choice.counts.gold>targets.gold)||worker.gatherType==='stone';
  if(worker.state!=='idle'&&!(overAllocated&&(choice.counts.gold<targets.gold||choice.counts.food<targets.food)))return;
  if(!await select(worker.id))return;
  const type=resourcePriority(choice.counts,choice.resources,targets.food,targets);
  const candidates=await p.evaluate(type=>{const g=ageOfAsh.game,tc=g.getTownCenter(),enemies=g.units.filter(u=>u.alive&&u.team==='enemy');return g.world.resources.filter(n=>n.alive&&n.amount>0&&n.resource===type&&Math.hypot(n.x-tc.x-2,n.y-tc.y-2)<11&&!enemies.some(e=>Math.hypot(e.x-n.x,e.y-n.y)<6)).sort((a,b)=>Math.hypot(a.x-tc.x,a.y-tc.y)-Math.hypot(b.x-tc.x,b.y-tc.y)).slice(0,8).map(n=>({id:n.id,x:n.x,y:n.y}))},type);
  for(const node of candidates){await pan(node.x,node.y);const q=await point(node.id,true);if(!q)continue;await p.mouse.click(q.x,q.y,{button:'right'});const outcome=await p.evaluate(id=>{const u=ageOfAsh.game.units.find(u=>u.id===id);return{state:u?.state,target:u?.gatherTarget?.id,selection:ageOfAsh.game.selection.map(e=>e.id),placement:ageOfAsh.game.placement?.type,order:ageOfAsh.game.orderMode,paused:ageOfAsh.game.paused,phase:ageOfAsh.game.phase}},worker.id);record(outcome.target===node.id?'action':'action-skipped',{command:'verified-gather',worker:worker.id,node:node.id,type,outcome});return}
  record('action-skipped',{command:'gather',worker:worker.id,type,reason:'NO_SAFE_CLICKABLE_NODE'});
 }
 return{async step(s){
  const info=await p.evaluate(()=>{const g=ageOfAsh.game,tc=g.getTownCenter();return{workers:g.economicPopulation,queued:tc?.queue.filter(q=>q.type==='villager').length||0,food:g.resources.food,cost:g.unitCost('villager').food,coreAlive:!!tc,core:tc?.id}});
  if(recoveryPriority({...info,target:workerTarget(s.wave)}))await train(info.core,'villager');
  if(info.workers>=4&&shouldResearch({age:s.age,wave:s.wave,military:s.population.mil})&&!s.ageResearch){
   const affordable=await p.evaluate(()=>{const g=ageOfAsh.game;return g.canAfford(g.ageCost())});
   if(affordable&&await select(info.core)){const button=p.locator('[data-command="age:advance"]');if(await button.count()){try{await button.click({timeout:1500});const research=await p.evaluate(()=>ageOfAsh.game.ageResearch);record(research?'action':'action-skipped',{command:'verified-age-research',research})}catch(e){record('action-skipped',{command:'age:advance',reason:e.name})}}}
  }
  for(const worker of s.units.filter(u=>u.team==='player'&&u.type==='villager'))await assign(worker);
  if(info.workers>=4&&!s.buildings.some(b=>b.alive&&b.type==='range')&&s.resources.wood>=120)await build('range');
  else if(info.workers>=4&&s.resources.wood>=60&&s.buildings.filter(b=>b.alive&&b.type==='house').length<6)await build('house');
  const ranged=await p.evaluate(()=>{const g=ageOfAsh.game;return{archers:g.units.filter(u=>u.alive&&u.team==='player'&&u.type==='archer').length,range:g.buildings.find(b=>b.alive&&b.type==='range'&&b.construction>=1&&b.queue.length<2)?.id,affordable:g.canAfford(g.unitCost('archer'))}});
  if(ranged.range&&ranged.affordable&&ranged.archers<8)await train(ranged.range,'archer');
  const reserveTechnology=shouldResearch({age:s.age,wave:s.wave,military:s.population.mil});
  const militaryBudget=await p.evaluate(reserveTechnology=>{const g=ageOfAsh.game,reserve=reserveTechnology&&!g.ageResearch?g.ageCost().food||0:0;return g.resources.food>=reserve+(g.unitCost('militia').food||0)},reserveTechnology);
  if(info.workers>=4&&militaryBudget){const building=await p.evaluate(()=>{const g=ageOfAsh.game;return g.buildings.find(b=>b.alive&&b.type==='barracks'&&b.queue.length<2)?.id});if(building&&s.resources.food>100)await train(building,'militia')}
  const tc=await p.evaluate(()=>{const g=ageOfAsh.game,b=g.getTownCenter();return b?{id:b.id,x:b.x+2,y:b.y+2}:null});if(tc){await pan(tc.x,tc.y);
   const production=s.buildings.find(b=>b.alive&&b.type==='barracks');if(production&&await select(production.id)){
    const goal=await p.evaluate(core=>{const g=ageOfAsh.game;for(const[x,y]of [[core.x-3,core.y+1],[core.x+3,core.y+1],[core.x-2,core.y-3]]){const q=g.screenPos(x,y);if(q.x>270&&q.x<1210&&q.y>135&&q.y<610&&!g.pickAt(q.x,q.y))return{...q,wx:x,wy:y}}return null},tc);
    if(goal){await p.mouse.click(goal.x,goal.y,{button:'right'});const actual=await p.evaluate(id=>ageOfAsh.game.buildings.find(b=>b.id===id)?.rally,production.id);record(actual&&Math.hypot(actual.x-goal.wx,actual.y-goal.wy)<.5?'action':'action-skipped',{command:'verified-rally',building:production.id,actual,expected:{x:goal.wx,y:goal.wy}})}
   }

   async function meleeGroup(){let added=false;for(const type of ['militia','commander','light_cavalry','spearman','guard']){const ids=await p.evaluate(type=>ageOfAsh.game.units.filter(u=>u.alive&&u.team==='player'&&u.type===type).map(u=>u.id),type);for(const id of ids){const q=await point(id);if(!q)continue;if(added)await p.keyboard.down('Shift');await p.mouse.dblclick(q.x,q.y);if(added)await p.keyboard.up('Shift');added=true;break}}return added}
   if(!regrouped&&s.phase==='prep'&&s.wave===1){const goal=await p.evaluate(()=>{const g=ageOfAsh.game;for(const[x,y]of [[28,26],[25,30],[22,24]])if(g.isWalkable(x,y)){const q=g.screenPos(x,y);if(document.elementFromPoint(q.x,q.y)===document.querySelector('#game'))return q}return null});if(goal&&await meleeGroup()){await p.keyboard.press('Shift+A');await p.mouse.click(goal.x,goal.y);const actors=await p.evaluate(()=>ageOfAsh.game.selection.filter(u=>u.tacticalOrder?.type==='attackMove').map(u=>u.id));regrouped=actors.length>0;record(regrouped?'action':'action-skipped',{command:'verified-initial-attack-move-regroup',actors})}}
   const siege=await p.evaluate(()=>{const g=ageOfAsh.game,tc=g.getTownCenter(),enemy=g.units.find(u=>u.alive&&u.team==='enemy'&&u.type==='ram'&&g.distanceTo(u,tc)<8);return enemy?{x:enemy.x,y:enemy.y,id:enemy.id}:null});
   if(siege){const armed=await p.evaluate(()=>!!(ageOfAsh.game.orderMode||ageOfAsh.game.placement));if(armed)await p.keyboard.press('Escape');if(await meleeGroup()){const q=await point(siege.id);if(q){await p.mouse.click(q.x,q.y,{button:'right'});const focused=await p.evaluate(id=>ageOfAsh.game.selection.filter(u=>u.alive&&u.team==='player'&&u.type!=='villager'&&u.manualAttack&&u.target?.id===id).map(u=>u.id),siege.id);record(focused.length?'action':'action-skipped',{command:'verified-direct-focus-siege',enemy:siege.id,actors:focused})}}}
   const live=await p.evaluate(()=>{const g=ageOfAsh.game;return{workers:g.units.filter(u=>u.alive&&u.team==='player'&&u.type==='villager').map(u=>({id:u.id,x:u.x,y:u.y,hp:u.hp,state:u.state,gatherType:u.gatherTarget?.resource})),enemies:g.units.filter(u=>u.alive&&u.team==='enemy').map(u=>({target:u.target?.id})),army:g.units.filter(u=>u.alive&&u.team==='player'&&u.type!=='villager').sort((a,b)=>(a.hero?-2:a.type==='archer'?-1:0)-(b.hero?-2:b.type==='archer'?-1:0)).map(u=>({id:u.id,order:u.tacticalOrder,focus:u.manualAttack&&u.target?.alive&&u.target.type==='ram'}))}});
   const targets=protectionTargets(live.workers,live.enemies,tc);
   const desired=live.army.map((u,i)=>({...u,protect:i<3&&targets.length?targets[i%targets.length]:tc.id})).filter(u=>!u.focus&&u.order?.type!=='attackMove'&&(u.order?.type!=='guard'||u.order.protectedId!==u.protect));
   for(const unit of desired.slice(0,8)){const id=unit.id;if(!await select(id))continue;const ally=await p.evaluate(id=>{const g=ageOfAsh.game,e=[...g.units,...g.buildings].find(e=>e.id===id&&e.alive);return e?{x:e.x+(e.w||0)/2,y:e.y+(e.h||0)/2}:null},unit.protect);if(!ally)continue;await pan(ally.x,ally.y);const q=await point(unit.protect);if(!q)continue;await p.keyboard.press('g');if(await p.evaluate(()=>ageOfAsh.game.orderMode==='guard')){await p.mouse.click(q.x,q.y);const order=await p.evaluate(id=>ageOfAsh.game.units.find(u=>u.id===id)?.tacticalOrder,id);record(order?.type==='guard'&&order.protectedId===unit.protect?'action':'action-skipped',{command:unit.protect===tc.id?'verified-guard-core':'verified-guard-resource-worker',id,protected:unit.protect,order})}}

  }
 }};
}
