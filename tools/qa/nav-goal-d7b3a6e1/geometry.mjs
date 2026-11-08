import {geometry} from './fixture.mjs';
import '../ram-pick-065e2912/node-dom-fixture.mjs';
import fs from 'node:fs';
const {Game}=await import(process.env.GOAL_GAME||'../../../js/game.js');
import {defenseClickPoint} from '../../../js/core-defense.js';
const {g,actor,target}=geometry(Game);
const pt=defenseClickPoint(g,target);if(!pt||g.pickAt(pt.x,pt.y)!==target)throw Error('原生敵牆點選失敗');g.setSelection([actor]);g.issueCommand(pt.x,pt.y);if(actor.target!==target)throw Error('原生集火未接受');
const endpointWitnesses=[];const stop=Math.max(.35,g.unitRange(actor)-.2),rr=stop+Math.hypot(target.w,target.h)/2;for(const fraction of [1,.75,.5,.25,0])for(let i=0;i<32;i++){const a=i*Math.PI/16,p={x:target.x+target.w/2+Math.cos(a)*rr*fraction,y:target.y+target.h/2+Math.sin(a)*rr*fraction};if(g.isWalkable(p.x,p.y,actor)&&g.distanceTo(p,target)<=stop)endpointWitnesses.push(p);}
const events=[],states=[];const apply=g.applyDamage;g.applyDamage=function(t,a,s,...rest){const hp=t.hp,r=apply.call(this,t,a,s,...rest);if(s===actor&&t===target)events.push({time:this.time,hpDamage:hp-t.hp,manual:s.manualAttack});return r;};
for(let i=0;i<600;i++){g.time+=1/60;g.updateUnits(1/60);g.updateProjectiles(1/60);if(i%60===59)states.push({time:g.time,x:actor.x,y:actor.y,state:actor.state,target:actor.target?.id,failure:actor.orderFailure||null,nav:actor._nav?{status:actor._nav.status,points:actor._nav.points}:null});}
const r={endpointWitnesses,scope:'受控浮點牆座標幾何，使用正式建築尺寸、兵種半徑與碰撞；不是玩家格線施工或自然地圖。',radius:actor.typeDef.radius,range:g.unitRange(actor),actor:{id:actor.id,x:actor.x,y:actor.y,failure:actor.orderFailure||null},target:{id:target.id,hp:target.hp},events,states};fs.writeFileSync(process.argv[2],JSON.stringify(r,null,2)+'\n');console.log(JSON.stringify(r));
