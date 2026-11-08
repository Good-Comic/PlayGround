import '../ram-pick-065e2912/node-dom-fixture.mjs';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {Game} from '../../../js/game.js';
import {defenseClickPoint} from '../../../js/core-defense.js';
const out=process.argv[2];if(!out||fs.existsSync(out))throw Error('fresh output required');
const results=[];
for(const mixed of [false,true])for(const n of [6,10])for(const spacing of [.55,.7]){
 const g=new Game();g.newRun(42,{civ:'FRK',biome:'steppe'});g.start();g.units=[];g.buildings=[];g.hero=null;g.crowd=null;g.time=0;
 let p;for(let y=4;y<g.world.size-5&&!p;y++)for(let x=4;x<g.world.size-10;x++){let ok=true;for(let yy=-2;yy<=3;yy+=.5)for(let xx=-2;xx<=8;xx+=.5)if(!g.isWalkable(x+xx,y+yy))ok=false;if(ok){p={x,y};break;}}
 assert.ok(p,'缺正常開闊地形');
 const units=Array.from({length:n},(_,i)=>g.spawnUnit(mixed?['militia','spearman','guard'][i%3]:'militia',p.x+(i%2)*spacing,p.y+(Math.floor(i/2)-(Math.ceil(n/2)-1)/2)*spacing,'player'));
 for(let i=0;i<n;i++)for(let j=i+1;j<n;j++)assert.ok(Math.hypot(units[i].x-units[j].x,units[i].y-units[j].y)>=units[i].typeDef.radius+units[j].typeDef.radius,'禁止初始重疊');
 const target=g.addBuilding('core',p.x+5,p.y-1,true);target.team='enemy';
 const pt=defenseClickPoint(g,target);assert.equal(g.pickAt(pt.x,pt.y),target);g.setSelection(units);g.issueCommand(pt.x,pt.y);assert.ok(units.every(u=>u.manualAttack&&u.target===target));
 const hits=new Map(),failures=[],snapshots=[];const apply=g.applyDamage;g.applyDamage=function(t,a,s,...args){const hp=t.hp,r=apply.call(this,t,a,s,...args);if(t===target&&units.includes(s)&&t.hp<hp)hits.set(s.id,(hits.get(s.id)||0)+1);return r;};
 for(let i=0;i<1200;i++){g.time+=1/60;g.updateUnits(1/60);g.updateProjectiles(1/60);for(const u of units)if(u.orderFailure&&!failures.some(f=>f.id===u.id))failures.push({id:u.id,sim:g.time,cause:u.orderFailure});if(i%60===59)snapshots.push({sim:g.time,units:units.map(u=>({id:u.id,x:u.x,y:u.y,state:u.state,manual:u.manualAttack,failure:u.orderFailure||null,blockedBy:[...new Set(u._crowdBlockedBy||[])].map(v=>v.id),heading:u._heading,yieldTo:u._yieldTo,nav:u._nav?{status:u._nav.status,points:u._nav.points,crowdDetour:u._nav.crowdDetour}:null}))});}
 const row={mixed,n,spacing,hitters:[...hits],failures,targetAlive:target.alive,snapshots};results.push(row);console.log(JSON.stringify({mixed,n,spacing,hitters:hits.size,failures}));
}
fs.writeFileSync(out,JSON.stringify({scope:'正常地形、正式兵種／碰撞／命令、固定步進20模擬秒的合成場景；不是C36精確重播或自然遊玩。',results},null,2)+'\n');
