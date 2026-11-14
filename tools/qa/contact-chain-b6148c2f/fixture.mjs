import {Crowd} from '../../../js/crowd.js';
import {defenseClickPoint} from '../../../js/core-defense.js';
export function fixture(g,{gap=.51}={}){
 g.newRun(42,{civ:'FRK',biome:'steppe'});g.start();g.autoEconomy=false;g.autoMilitary=false;g.units=[];g.buildings=[g.getTownCenter()];g.hero=null;g.crowd=null;g.time=0;
 let p;for(let y=4;y<g.world.size-5&&!p;y++)for(let x=4;x<g.world.size-9;x++){let ok=true;for(let yy=-2.5;yy<=2.5;yy+=.5)for(let xx=-1.5;xx<=8.5;xx+=.5)if(!g.isWalkable(x+xx,y+yy))ok=false;if(ok){p={x,y};break;}}
 if(!p)throw Error('缺正常開闊地形');const walls=[];
 const wall=(x,y,team='player')=>{const b=g.addBuilding('wall',x,y,true);b.team=team;walls.push(b);return b;};
 let top,bottom;for(let x=p.x-1;x<=p.x+7;x++){const t=wall(x,p.y-2),b=wall(x,p.y+1);if(x===p.x+3){top=t;bottom=b;top.team=bottom.team='enemy';}}
 for(const x of [p.x-1,p.x+7])for(const y of [p.y-1,p.y])wall(x,y);
 const allies=[g.spawnUnit('militia',p.x+3,p.y-gap),g.spawnUnit('militia',p.x+3,p.y+gap)];
 allies.forEach((u,i)=>{u.state='attack';u.target=i?bottom:top;u.manualAttack=true;});
 const actor=g.spawnUnit('militia',p.x+2,p.y),target=wall(p.x+5,p.y,'enemy');
 actor.state='move';g.crowd=new Crowd(g.units);for(let i=0;i<120&&actor.x<p.x+2.96;i++){g.time+=1/60;g.navigationBudget=2;g.stepToward(actor,p.x+3.3,p.y,1/60);}
 const failedStep=g.crowd.steer(actor,{x:actor.x+.014,y:actor.y-.042},(a,b)=>g.segmentWalkable(a,b,actor),g.time);
 const contacts=[...new Set(actor._crowdBlockedBy||[])].map(u=>u.id);
 actor._avoidCrowdUntil=g.time+5; // 受控重現已進入既有重新規劃階段，並非C-36逐幀歷史。
 const point=defenseClickPoint(g,target);
 if(!point||g.pickAt(point.x,point.y)!==target)throw Error('目標點選不符');
 return{g,p,walls,allies,actor,target,point,contacts,failedStep,gap};
}
export function primeContactReplan(f){
 const {g,actor,target}=f,range=Math.max(.35,g.unitRange(actor)-.2);
 g.navigationBudget=2;g.stepToward(actor,target.x+target.w/2,target.y+target.h/2,0,range,target);
 const rejected=g.crowd.steer(actor,{x:actor.x+.014,y:actor.y-.042},(a,b)=>g.segmentWalkable(a,b,actor),g.time);
 if(rejected||new Set(actor._crowdBlockedBy||[]).size!==2)throw Error('未建立真實雙方阻擋接觸');
 actor._avoidCrowdUntil=g.time+5;actor._nav.points=[];actor._nav.status='pending';actor._nav.retryAt=g.time;
 return actor._crowdBlockedBy.map(u=>u.id);
}
