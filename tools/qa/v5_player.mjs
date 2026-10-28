// Native-input policy only. Page evaluation reads state; it never changes game state.
export function recoveryPriority({workers,queued,food,cost,coreAlive}) {
 return coreAlive && workers+queued<8 && food>=cost;
}
export function resourcePriority(counts,resources) {
 if(counts.wood<2)return 'wood';
 if(counts.gold<2)return 'gold';
 if(counts.food<2)return 'food';
 return resources.food<200?'food':resources.wood<180?'wood':'gold';
}
export function createV5Player({page:p,record}){
 async function pan(x,y){const r=await p.locator('#minimap').boundingBox();await p.mouse.click(r.x+x/50*r.width,r.y+y/50*r.height);await p.waitForTimeout(400)}
 async function point(id,resource=false){return p.evaluate(({id,resource})=>{const g=ageOfAsh.game,e=(resource?g.world.resources:[...g.units,...g.buildings]).find(e=>e.id===id&&e.alive);if(!e)return null;const q=g.screenPos(e.x+(e.w||0)/2,e.y+(e.h||0)/2),offsets=e.w?[-22,-45,-65,-90]:e.resource?[-10,-20,0]:[-18,-10,-25];for(const dy of offsets)for(const dx of [0,-9,9]){const x=q.x+dx*g.camera.zoom,y=q.y+dy*g.camera.zoom;if(x>270&&x<1210&&y>135&&y<610&&g.pickAt(x,y)===e)return{x,y,wx:e.x+(e.w||0)/2,wy:e.y+(e.h||0)/2}}return null},{id,resource})}
 async function select(id){let q=await point(id);if(!q){const e=await p.evaluate(id=>{const g=ageOfAsh.game,e=[...g.units,...g.buildings].find(e=>e.id===id&&e.alive);return e?{x:e.x+(e.w||0)/2,y:e.y+(e.h||0)/2}:null},id);if(!e)return false;await pan(e.x,e.y);q=await point(id)}if(!q){record('action-skipped',{command:'select',id,reason:'NO_NATIVE_PICK_POINT'});return false}await p.mouse.click(q.x,q.y);return p.evaluate(id=>ageOfAsh.game.selection.some(u=>u.id===id),id)}
 async function train(id,type){if(!await select(id))return false;const before=await p.evaluate(id=>{const g=ageOfAsh.game,b=g.buildings.find(b=>b.id===id);return{n:b.queue.length,resources:{...g.resources}}},id),button=p.locator(`[data-command="train:${type}"]`);if(!await button.count())return false;try{await button.click({timeout:1500})}catch(e){record('action-skipped',{command:'train:'+type,reason:e.name});return false}const after=await p.evaluate(id=>{const g=ageOfAsh.game,b=g.buildings.find(b=>b.id===id);return{n:b.queue.length,resources:{...g.resources}}},id);const accepted=after.n>before.n;record(accepted?'action':'action-skipped',{command:'verified-train:'+type,building:id,before,after});return accepted}
 async function assign(worker){
  if(!await select(worker.id))return;
  const choice=await p.evaluate(id=>{const g=ageOfAsh.game,u=g.units.find(u=>u.id===id),tc=g.getTownCenter();if(!u?.alive||!tc)return null;const enemies=g.units.filter(e=>e.alive&&e.team==='enemy');const danger=enemies.some(e=>Math.hypot(u.x-e.x,u.y-e.y)<5);const counts={food:0,wood:0,gold:0};for(const v of g.units.filter(v=>v.alive&&v.team==='player'&&v.type==='villager')){const k=v.gatherTarget?.resource;if(k in counts)counts[k]++}return{danger,counts,resources:{...g.resources},core:{x:tc.x,y:tc.y}}},worker.id);if(!choice)return;
  if(choice.danger){const q=await p.evaluate(core=>{const g=ageOfAsh.game;for(const[x,y]of [[core.x-1,core.y+1],[core.x,core.y-1],[core.x+2,core.y-1]]){const q=g.screenPos(x,y);if(q.x>270&&q.x<1210&&q.y>135&&q.y<610&&!g.pickAt(q.x,q.y))return q}return null},choice.core);if(q){await p.mouse.click(q.x,q.y,{button:'right'});record('action',{command:'withdraw-worker',id:worker.id})}return}
  if(worker.state!=='idle')return;
  const type=resourcePriority(choice.counts,choice.resources);
  const candidates=await p.evaluate(type=>{const g=ageOfAsh.game,tc=g.getTownCenter(),enemies=g.units.filter(u=>u.alive&&u.team==='enemy');return g.world.resources.filter(n=>n.alive&&n.amount>0&&n.resource===type&&Math.hypot(n.x-tc.x-2,n.y-tc.y-2)<11&&!enemies.some(e=>Math.hypot(e.x-n.x,e.y-n.y)<6)).sort((a,b)=>Math.hypot(a.x-tc.x,a.y-tc.y)-Math.hypot(b.x-tc.x,b.y-tc.y)).slice(0,8).map(n=>({id:n.id,x:n.x,y:n.y}))},type);
  for(const node of candidates){await pan(node.x,node.y);const q=await point(node.id,true);if(!q)continue;await p.mouse.click(q.x,q.y,{button:'right'});const outcome=await p.evaluate(id=>{const u=ageOfAsh.game.units.find(u=>u.id===id);return{state:u?.state,target:u?.gatherTarget?.id}},worker.id);record(outcome.target===node.id?'action':'action-skipped',{command:'verified-gather',worker:worker.id,node:node.id,type,outcome});return}
  record('action-skipped',{command:'gather',worker:worker.id,type,reason:'NO_SAFE_CLICKABLE_NODE'});
 }
 return{async step(s){
  const info=await p.evaluate(()=>{const g=ageOfAsh.game,tc=g.getTownCenter();return{workers:g.economicPopulation,queued:tc?.queue.filter(q=>q.type==='villager').length||0,food:g.resources.food,cost:g.unitCost('villager').food,coreAlive:!!tc,core:tc?.id}});
  if(recoveryPriority(info))await train(info.core,'villager');
  for(const worker of s.units.filter(u=>u.team==='player'&&u.type==='villager'))await assign(worker);
  if(info.workers>=4){const building=await p.evaluate(()=>{const g=ageOfAsh.game;return g.buildings.find(b=>b.alive&&b.type==='barracks'&&b.queue.length<2)?.id});if(building&&s.resources.food>100)await train(building,'militia')}
  const tc=await p.evaluate(()=>{const g=ageOfAsh.game,b=g.getTownCenter();return b?{id:b.id,x:b.x+2,y:b.y+2}:null});if(tc){await pan(tc.x,tc.y);
   const guard=await p.evaluate(()=>ageOfAsh.game.units.filter(u=>u.alive&&u.team==='player'&&u.type!=='villager'&&u.tacticalOrder?.type!=='guard').map(u=>u.id));
   for(const id of guard.slice(0,8)){if(!await select(id))continue;await p.keyboard.press('g');const q=await point(tc.id);if(q&&await p.evaluate(()=>ageOfAsh.game.orderMode==='guard')){await p.mouse.click(q.x,q.y);const accepted=await p.evaluate(id=>ageOfAsh.game.units.find(u=>u.id===id)?.tacticalOrder?.type==='guard',id);record(accepted?'action':'action-skipped',{command:'verified-guard-core',id})}}
  }
 }};
}
