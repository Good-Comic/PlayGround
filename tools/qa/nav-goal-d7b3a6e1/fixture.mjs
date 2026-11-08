export function geometry(Game,team='player'){
const g=new Game();g.newRun(42,{civ:'FRK',biome:'steppe'});g.start();g.units=[];g.buildings=[];g.hero=null;g.crowd=null;g.time=0;
for(const x of [2.719,4.281])for(const y of [1,2,3])g.addBuilding('wall',x,y,true);
for(let y=2;y<=5;y++)g.addBuilding('wall',5.8,y,true);for(let x=2;x<=7;x++)g.addBuilding('wall',x,x===3?5.85:6,true);
g.addBuilding('wall',3.5,4.28,true);const target=g.addBuilding('wall',4.5,4.5,true);target.team=team==='player'?'enemy':'player';for(let i=0;i<g.buildings.length;i++)for(let j=i+1;j<g.buildings.length;j++){const a=g.buildings[i],b=g.buildings[j];if(a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y)throw Error('建築不可重疊');}const actor=g.spawnUnit('spearman',4,2,team);if(actor.x!==4||actor.y!==2)throw Error('生成挪位');

return {g,actor,target};
}
