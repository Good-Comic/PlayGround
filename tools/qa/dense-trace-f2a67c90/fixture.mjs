import assert from 'node:assert/strict';
import{defenseClickPoint}from'../../../js/core-defense.js';
export function fixture(g,{mixed=false,n=10,spacing=.55}={}){
g.newRun(42,{civ:'FRK',biome:'steppe'});g.start();g.units=[];g.buildings=[];g.hero=null;g.crowd=null;g.time=0;
 let p;for(let y=4;y<g.world.size-5&&!p;y++)for(let x=4;x<g.world.size-10;x++){let ok=true;for(let yy=-2;yy<=3;yy+=.5)for(let xx=-2;xx<=8;xx+=.5)if(!g.isWalkable(x+xx,y+yy))ok=false;if(ok){p={x,y};break;}}
 assert.ok(p,'缺正常開闊地形');
 const units=Array.from({length:n},(_,i)=>g.spawnUnit(mixed?['militia','spearman','guard'][i%3]:'militia',p.x+(i%2)*spacing,p.y+(Math.floor(i/2)-(Math.ceil(n/2)-1)/2)*spacing,'player'));
 for(let i=0;i<n;i++)for(let j=i+1;j<n;j++)assert.ok(Math.hypot(units[i].x-units[j].x,units[i].y-units[j].y)>=units[i].typeDef.radius+units[j].typeDef.radius,'禁止初始重疊');
 const target=g.addBuilding('core',p.x+5,p.y-1,true);target.team='enemy';
 const pt=defenseClickPoint(g,target);assert.equal(g.pickAt(pt.x,pt.y),target);g.setSelection(units);g.issueCommand(pt.x,pt.y);assert.ok(units.every(u=>u.manualAttack&&u.target===target));
return{g,units,target,p};
}
