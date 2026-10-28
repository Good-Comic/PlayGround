// QA only: forwards original damage exactly once; sink failures cannot change gameplay.
export function installWorkerDamageObserver({game=globalThis.ageOfAsh.game,sink=globalThis.qaWorkerHit}={}) {
 const original=game.applyDamage;
 function observed(target,amount,source){
  const worker=target?.team==='player'&&target?.type==='villager';
  const before=worker?{hp:target.hp,shield:target.shield||0,state:target.state,x:target.x,y:target.y,gather:target.gatherTarget?.id,drop:target.dropTarget?.id}:null;
  const result=original.apply(this,arguments);
  if(worker){try{const distance=u=>Math.hypot(u.x-target.x,u.y-target.y),defenders=game.units.filter(u=>u.alive&&u.team==='player'&&u.type!=='villager').map(u=>({id:u.id,type:u.type,x:u.x,y:u.y,distance:distance(u),state:u.state,target:u.target?.id,guard:u.tacticalOrder?.protectedId,order:u.tacticalOrder?.type})).sort((a,b)=>a.distance-b.distance);
   const row={simulationSeconds:game.runTime,combatTime:game.time,wave:game.waveIndex+1,worker:target.id,amount,before,after:{hp:target.hp,shield:target.shield||0,alive:target.alive,state:target.state},source:source?{id:source.id,type:source.type,team:source.team,x:source.x,y:source.y,target:source.target?.id}:null,nearestDefenders:defenders.slice(0,6),defendersWithin3:defenders.filter(u=>u.distance<=3).length};
   const pending=sink(row);pending?.catch?.(()=>{});
  }catch{ /* Observation must not interrupt production damage. */ }}
  return result;
 }
 game.applyDamage=observed;
 return()=>{if(game.applyDamage===observed)game.applyDamage=original;};
}
