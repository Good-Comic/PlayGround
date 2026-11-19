import fs from 'node:fs';
const [input,out]=process.argv.slice(2);
if(!input||!out||fs.existsSync(out))throw Error('input and fresh output required');
const d=JSON.parse(fs.readFileSync(input,'utf8')),pairs=[];
for(let i=1;i<d.rows.length;i++){
 const a=d.rows[i-1],b=d.rows[i];if(!(a.moved>1e-6&&b.moved>1e-6))continue;
 const ax=a.after.x-a.before.x,ay=a.after.y-a.before.y,bx=b.after.x-b.before.x,by=b.after.y-b.before.y;
 const cos=(ax*bx+ay*by)/(a.moved*b.moved);
 if(cos<-.9)pairs.push({sim:b.sim,cos,net:Math.hypot(b.after.x-a.before.x,b.after.y-a.before.y),sameGoal:JSON.stringify(a.goal)===JSON.stringify(b.goal),sameWaypoint:JSON.stringify(a.waypoint)===JSON.stringify(b.waypoint),reverseInPair:a.reverse||b.reverse,a,b});
}
const {rows,...metadata}=d;
const summary={...metadata,successiveNearOppositePairs:pairs.length,pairsWithReverseMove:pairs.filter(p=>p.reverseInPair).length,pairsWithSameWaypoint:pairs.filter(p=>p.sameWaypoint).length,reverseMovesWithoutActiveLease:rows.filter(r=>r.reverse&&!(r.yieldTo&&r.yieldTo.until>r.sim)).length,firstPairs:pairs.slice(0,3),firstSameWaypointReversePair:pairs.find(p=>p.sameWaypoint&&p.reverseInPair),limit:'僅受控受測版本；近反向配對可重疊，不代表獨立循環數或自然C36。'};
fs.writeFileSync(out,JSON.stringify(summary,null,2)+'\n');console.log(JSON.stringify({...summary,firstPairs:undefined,firstSameWaypointReversePair:undefined}));
