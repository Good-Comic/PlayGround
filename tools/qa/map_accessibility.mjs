// Offline simulation audit using the exact production collision and A* code.
import {writeFileSync} from 'node:fs';
import {BIOMES,UNIT_TYPES} from '../../js/data.js';
import {findPath} from '../../js/navigation.js';
globalThis.document={documentElement:{dataset:{}},dispatchEvent(){}};
const {Game}=await import('../../js/game.js');
const rows=[];
for(const biome of BIOMES)for(const seed of [1,42,100,200,987654321]){
  const g=new Game();g.newRun(seed,{civ:'TEU',biome:biome.id});const core=g.getTownCenter(),row={seed,biome:biome.id,version:g.world.generationVersion,routes:[],resources:[]};
  for(const camp of g.world.camps)for(const type of ['ram','warlord2']){
    const u={...camp,team:'enemy',type,typeDef:UNIT_TYPES[type]},legal=(x,y)=>g.isWalkable(x,y,u);legal.segment=(a,b)=>g.segmentWalkable(a,b,u);
    const range=Math.max(.35,u.typeDef.range-.2),p=findPath(u,{x:core.x+core.w/2,y:core.y+core.h/2},legal,g.world.size,{range:range+Math.hypot(core.w,core.h)/2,goalTest:point=>g.distanceTo(point,core)<=range});
    let prev=u;const swept=p.points.every(q=>{const ok=g.segmentWalkable(prev,q,u);prev=q;return ok});
    row.routes.push({camp:camp.name,type,startLegal:legal(u.x,u.y),status:p.status,swept,expanded:p.expanded});
  }
  const u=g.units.find(u=>u.type==='villager'),legal=(x,y)=>g.isWalkable(x,y,u);legal.segment=(a,b)=>g.segmentWalkable(a,b,u);
  for(const type of ['wood','food','gold','stone']){
    const n=g.findResource(type,g.world.base.x,g.world.base.y),p=n?findPath(u,n,legal,g.world.size,{range:(g.unitRange(u)+n.radius+.2)*.95}):null;
    row.resources.push({type,target:n?.id,status:p?.status??'missing',expanded:p?.expanded});
  }
  row.pass=row.routes.every(r=>r.startLegal&&r.status==='ready'&&r.swept)&&row.resources.every(r=>r.status==='ready');rows.push(row);
}
const result={kind:'PRODUCTION_SIMULATION_NOT_BROWSER',rows,pass:rows.every(r=>r.pass)};
writeFileSync(process.argv[2]||'/tmp/map-accessibility.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({maps:rows.length,paths:rows.reduce((n,r)=>n+r.routes.length+r.resources.length,0),failures:rows.filter(r=>!r.pass),pass:result.pass}));if(!result.pass)process.exit(1);
