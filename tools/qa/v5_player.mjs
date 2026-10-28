// Native-input policy only. Page evaluation reads state; it never changes game state.
export function recoveryPriority({workers,queued,food,cost,coreAlive,target=8}) {
 return coreAlive && workers+queued<target && food>=cost;
}
export const workerTarget = wave => Math.min(22, 8 + 2 * Math.max(0,wave-1));
export const foodTarget = workers => Math.max(3,Math.ceil(workers/2));
export const shouldResearch = ({age,wave,military}) => age===1 || (age===2 && (wave>=5 || military>=12));
export function resourcePriority(counts,resources,desiredFood=2) {
 if(counts.wood<2)return 'wood';
 if(counts.gold<2)return 'gold';
 if(counts.food<desiredFood)return 'food';
 return resources.food<200?'food':resources.wood<180?'wood':'gold';
}
export function createV5Player({page:p,record,build}){
 async function pan(x,y){const r=await p.locator('#minimap').boundingBox();await p.mouse.click(r.x+x/50*r.width,r.y+y/50*r.height);await p.waitForTimeout(400)}
 async function point(id,resource=false){return p.evaluate(({id,resource})=>{const g=ageOfAsh.game,e=(resource?g.world.resources:[...g.units,...g.buildings]).find(e=>e.id===id&&e.alive);if(!e)return null;const q=g.screenPos(e.x+(e.w||0)/2,e.y+(e.h||0)/2),offsets=e.w?[-22,-45,-65,-90]:e.resource?[-10,-20,0]:[-18,-10,-25];for(const dy of offsets)for(const dx of [0,-9,9]){const x=q.x+dx*g.camera.zoom,y=q.y+dy*g.camera.zoom;if(x>270&&x<1210&&y>135&&y<610&&g.pickAt(x,y)===e&&document.elementFromPoint(x,y)===document.getElementById('game'))return{x,y,wx:e.x+(e.w||0)/2,wy:e.y+(e.h||0)/2}}return null},{id,resource})}
 async function select(id){if(await p.evaluate(()=>ageOfAsh.game.inMenu||ageOfAsh.game.paused||['boon','victory','defeat'].includes(ageOfAsh.game.phase)))return false;const armed=await p.evaluate(()=>({placement:ageOfAsh.game.placement?.type,order:ageOfAsh.game.orderMode}));if(armed.placement||armed.order){await p.keyboard.press('Escape');record('action',{command:'cancel-armed-cursor',armed})}let q=await point(id);if(!q){const e=await p.evaluate(id=>{const g=ageOfAsh.game,e=[...g.units,...g.buildings].find(e=>e.id===id&&e.alive);return e?{x:e.x+(e.w||0)/2,y:e.y+(e.h||0)/2}:null},id);if(!e)return false;await pan(e.x,e.y);q=await point(id)}if(!q){record('action-skipped',{command:'select',id,reason:'NO_NATIVE_PICK_POINT'});return false}await p.mouse.click(q.x,q.y);return p.evaluate(id=>ageOfAsh.game.selection.some(u=>u.id===id),id)}
 async function train(id,type){if(!await select(id))return false;const before=await p.evaluate(id=>{const g=ageOfAsh.game,b=g.buildings.find(b=>b.id===id);return{n:b.queue.length,resources:{...g.resources}}},id),button=p.locator(`[data-command="train:${type}"]`);if(!await button.count())return false;try{await button.click({timeout:1500})}catch(e){record('action-skipped',{command:'train:'+type,reason:e.name});return false}const after=await p.evaluate(id=>{const g=ageOfAsh.game,b=g.buildings.find(b=>b.id===id);return{n:b.queue.length,resources:{...g.resources}}},id);const accepted=after.n>before.n||(after.n>0&&Object.keys(before.resources).some(k=>after.resources[k]<before.resources[k]));record(accepted?'action':'action-skipped',{command:'verified-train:'+type,building:id,before,after});return accepted}
 async function assign(worker){
  if(!await select(worker.id))return;
  const choice=await p.evaluate(id=>{const g=ageOfAsh.game,u=g.units.find(u=>u.id===id),tc=g.getTownCenter();if(!u?.alive||!tc)return null;const enemies=g.units.filter(e=>e.alive&&e.team==='enemy');const danger=enemies.some(e=>Math.hypot(u.x-e.x,u.y-e.y)<8);const counts={food:0,wood:0,gold:0};for(const v of g.units.filter(v=>v.alive&&v.team==='player'&&v.type==='villager')){const k=v.gatherTarget?.resource;if(k in counts)counts[k]++}return{danger,counts,desiredFood:Math.max(3,Math.ceil(g.economicPopulation/2)),resources:{...g.resources},core:{x:tc.x,y:tc.y}}},worker.id);if(!choice)return;
  if(choice.danger){
   const stop=p.locator('[data-command="stop"]');if(await stop.count())await stop.click({timeout:1500});
   const tc=await p.evaluate(()=>{const g=ageOfAsh.game,b=g.getTownCenter();return b?{id:b.id,x:b.x+2,y:b.y+2}:null});
   if(tc){await pan(tc.x,tc.y);const q=await point(tc.id);if(q){await p.mouse.click(q.x,q.y,{button:'right'});const outcome=await p.evaluate(id=>{const g=ageOfAsh.game,u=g.units.find(u=>u.id===id);return{state:u?.state,drop:u?.dropTarget?.id,gather:u?.gatherTarget?.id,distance:u?g.distanceTo(u,g.getTownCenter()):null}},worker.id);record(outcome.drop===tc.id&&!outcome.gather?'action':'action-skipped',{command:'verified-worker-withdraw-to-core',worker:worker.id,outcome});return}}
   record('action-skipped',{command:'withdraw-worker',id:worker.id,reason:'NO_NATIVE_CORE_TARGET'});return;
  }
  if(worker.state!=='idle'&&!(worker.gatherType==='wood'&&choice.counts.wood>2&&(choice.counts.gold<2||choice.counts.food<choice.desiredFood)))return;
  const type=resourcePriority(choice.counts,choice.resources,choice.desiredFood);
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
  if(info.workers>=4&&s.resources.wood>=60&&s.buildings.filter(b=>b.alive&&b.type==='house').length<8)await build('house');
  const reserveTechnology=shouldResearch({age:s.age,wave:s.wave,military:s.population.mil});
  const militaryBudget=await p.evaluate(reserveTechnology=>{const g=ageOfAsh.game,reserve=reserveTechnology&&!g.ageResearch?g.ageCost().food||0:0;return g.resources.food>=reserve+(g.unitCost('militia').food||0)},reserveTechnology);
  if(info.workers>=4&&militaryBudget){const building=await p.evaluate(()=>{const g=ageOfAsh.game;return g.buildings.find(b=>b.alive&&b.type==='barracks'&&b.queue.length<2)?.id});if(building&&s.resources.food>100)await train(building,'militia')}
  const tc=await p.evaluate(()=>{const g=ageOfAsh.game,b=g.getTownCenter();return b?{id:b.id,x:b.x+2,y:b.y+2}:null});if(tc){await pan(tc.x,tc.y);
   const production=s.buildings.find(b=>b.alive&&b.type==='barracks');if(production&&await select(production.id)){
    const goal=await p.evaluate(core=>{const g=ageOfAsh.game;for(const[x,y]of [[core.x-3,core.y+1],[core.x+3,core.y+1],[core.x-2,core.y-3]]){const q=g.screenPos(x,y);if(q.x>270&&q.x<1210&&q.y>135&&q.y<610&&!g.pickAt(q.x,q.y))return{...q,wx:x,wy:y}}return null},tc);
    if(goal){await p.mouse.click(goal.x,goal.y,{button:'right'});const actual=await p.evaluate(id=>ageOfAsh.game.buildings.find(b=>b.id===id)?.rally,production.id);record(actual&&Math.hypot(actual.x-goal.wx,actual.y-goal.wy)<.5?'action':'action-skipped',{command:'verified-rally',building:production.id,actual,expected:{x:goal.wx,y:goal.wy}})}
   }

   const guard=await p.evaluate(()=>ageOfAsh.game.units.filter(u=>u.alive&&u.team==='player'&&u.type!=='villager'&&u.tacticalOrder?.type!=='guard').map(u=>u.id));
   for(const id of guard.slice(0,8)){if(!await select(id))continue;await p.keyboard.press('g');const q=await point(tc.id);if(q&&await p.evaluate(()=>ageOfAsh.game.orderMode==='guard')){await p.mouse.click(q.x,q.y);const accepted=await p.evaluate(id=>ageOfAsh.game.units.find(u=>u.id===id)?.tacticalOrder?.type==='guard',id);record(accepted?'action':'action-skipped',{command:'verified-guard-core',id})}else if(await p.evaluate(()=>!!ageOfAsh.game.orderMode))await p.keyboard.press('Escape')}
  }
 }};
}
