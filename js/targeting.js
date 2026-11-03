// Shared, deterministic target preference. Damage/cooldown/range remain in Game.
export function scoredTarget(g,u,candidates,radius) {
  if(u.manualAttack&&u.target?.alive&&g.canSee(u,u.target))return u.target;
  let best=null,bestScore=-Infinity;
  for(const e of candidates){
    if(!e.alive||e.team===u.team||!['player','enemy'].includes(e.team)||!g.canSee(u,e)||(u.blockedTargets?.[e.id]||0)>g.time)continue;
    const d=g.distanceTo(u,e);if(d>=radius)continue;
    if(u.stance==='defensive'&&u.guardOrigin&&g.distanceTo(u.guardOrigin,e)>8)continue;
    // Existing navigation failures exclude inaccessible opponents; never issue A* for every candidate.
    const rawCounter=g.counterMultiplier(u,e);
    const counter=u.typeDef.family==='K'&&d>g.unitRange(u)+(e.typeDef?.radius||0.2)?1:rawCounter;
    const chase=u.typeDef.category==='cavalry'&&e.typeDef?.category==='ranged'?1.3:0;
    const threat=Math.min(1,(e.attack||e.typeDef?.attack||0)/30);
    const vulnerable=1-Math.min(1,e.hp/Math.max(1,e.maxHp));
    const ready=(u.cooldown||0)<=0&&d<=g.unitRange(u)?0.25:0;
    const sticky=e===u.target?0.65:0;
    const score=(counter-1)*2.4+chase-d/Math.max(1,radius)+threat*.15+vulnerable*.2+ready+sticky;
    if(score>bestScore){best=e;bestScore=score;}
  }
  return best;
}
