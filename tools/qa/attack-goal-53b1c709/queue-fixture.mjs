// 受控合法路線佇列及接近六秒門檻的歷史；不改預算、傷害、碰撞或RNG。
export function prepareQueued(g,u,target,count=10){
 const bots=[];for(let i=0;i<count;i++){const v=g.spawnUnit('militia',4+i*.7,10);if(!v)throw Error('queue fixture spawn failed');v.state='attack';v.target=target;v.manualAttack=true;bots.push(v);}
 u._progress={x:u.x-.25,y:u.y,at:g.time-(6-.1)};
 u._goalProgress={distance:Math.hypot(u.x-(target.x+target.w/2),u.y-(target.y+target.h/2)),at:g.time};
 u._nav={tx:target.x+target.w/2,ty:target.y+target.h/2,range:Math.max(.35,g.unitRange(u)-.2),status:'pending',points:[],retryAt:0,stalled:0};
 g.navigationQueue=[...bots.map(v=>v.id),u.id];g.navigationQueued=new Set(g.navigationQueue);return bots;
}
