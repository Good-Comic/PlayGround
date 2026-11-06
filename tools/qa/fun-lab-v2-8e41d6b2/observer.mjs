// 唯讀同步觀測；擷取例外只記observerError，絕不覆蓋原命令回傳／例外。
export function installReadOnlyObserver(){
 const g=globalThis.ageOfAsh.game;
 globalThis.__v2CommandEvents=[];globalThis.__v2DamageEvents=[];globalThis.__v2ObserverErrors=[];
 const error=(where,e)=>{try{globalThis.__v2ObserverErrors.push({where,error:String(e)});}catch{}};
 const safe=(where,fn)=>{try{return fn();}catch(e){error(where,e);return null;}};
 const copy=x=>JSON.parse(JSON.stringify(x));
 const unit=u=>({id:u.id,alive:u.alive,hp:u.hp,x:u.x,y:u.y,state:u.state,targetId:u.target?.id,manualAttack:u.manualAttack,order:u.tacticalOrder,targetPos:u.targetPos});
 const state=()=>safe('unitState',()=>copy({sim:g.runTime,time:g.time,selection:g.selection.map(u=>u.id),orderMode:g.orderMode,units:g.units.map(unit)}));
 for(const name of ['command','issueTacticalCommand','issueCommand','commandMove']){
  if(typeof g[name]!=='function')continue;const original=g[name];
  g[name]=function(...args){const before=state(),safeArgs=safe('args:'+name,()=>copy(args.map(a=>Array.isArray(a)?a.map(u=>u.id):a)));let result,nativeError;
   try{result=original.apply(this,args);return result;}catch(e){nativeError=e;throw e;}finally{safe('commandEvent:'+name,()=>globalThis.__v2CommandEvents.push(copy({actionId:globalThis.__v2ActionId,name,args:safeArgs,before,after:state(),result,error:nativeError?String(nativeError):undefined,interpretation:'undefined回傳不代表ACCEPTED；以逐單位狀態判斷'})));}
  };
 }
 const original=g.applyDamage;
 g.applyDamage=function(target,amount,source,kind){
  const row=safe('damageBefore',()=>copy({sim:this.runTime,sourceId:source?.id,sourceType:source?.type,sourceTeam:source?.team,targetId:target?.id,targetType:target?.type,targetTeam:target?.team,beforeHp:target?.hp,beforeShield:target?.shield,amount,kind,selectedSource:this.selection.includes(source),sourceTargetId:source?.target?.id,sourceOrder:source?.tacticalOrder,manualAttack:source?.manualAttack,sourcePosition:source?{x:source.x,y:source.y}:null,targetPosition:target?{x:target.x,y:target.y}:null}));
  try{return original.apply(this,arguments);}finally{safe('damageAfter',()=>{if(row){row.afterHp=target?.hp;row.afterShield=target?.shield;row.afterAlive=target?.alive;globalThis.__v2DamageEvents.push(row);}});}
 };
}
export function drainReadOnlyEvidence(){let nativeSave=null;try{nativeSave=localStorage.getItem('riftwatch.playtest.v227.run.v1');}catch(e){globalThis.__v2ObserverErrors.push({where:'nativeSaveRead',error:String(e)});}return {damage:globalThis.__v2DamageEvents.splice(0),commands:globalThis.__v2CommandEvents.splice(0),observerErrors:globalThis.__v2ObserverErrors.splice(0),nativeSave};}
