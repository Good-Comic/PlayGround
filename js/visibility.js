// 共用確定性即時視野；未探索區不保存情報。 / Shared deterministic current vision; no explored-memory intelligence.
export function sightRadius(game, entity) {
  let radius = entity.typeDef?.sight ?? 6;
  if (!entity.w && entity.team === 'player') {
    if (entity.typeDef?.category === 'ranged') radius += game.effects.archerSight || 0;
    if (entity.typeDef?.category === 'cavalry') radius += game.effects.cavalrySight || 0;
  }
  return Math.max(0, radius) * (game.effects.sandstorm > 0 ? .8 : 1);
}
export function position(entity) { return {x:entity.x+(entity.w||0)/2,y:entity.y+(entity.h||0)/2}; }
export function canSee(game, observer, target) {
  if (!observer?.alive || !target?.alive) return false;
  const a=position(observer),b=position(target),r=sightRadius(game,observer);
  return (a.x-b.x)**2+(a.y-b.y)**2<=r*r;
}
export function teamSees(game, team, target) {
  if(target.team===team)return true;
  return [...game.units,...game.buildings].some(o=>o.team===team&&canSee(game,o,target));
}
