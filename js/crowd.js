// Local collision avoidance. Spatial buckets avoid an all-pairs scan per moving unit.
// Higher IDs yield to lower IDs in head-on traffic; no positions are snapped.
export class Crowd {
  constructor(units) {
    this.buckets = new Map();
    for (const u of units) if (u.alive) this.insert(u);
  }
  key(x, y) { return `${Math.floor(x / 2)},${Math.floor(y / 2)}`; }
  insert(u) {
    const key = this.key(u.x, u.y);
    if (!this.buckets.has(key)) this.buckets.set(key, new Set());
    this.buckets.get(key).add(u); u._crowdKey = key;
  }
  moved(u) {
    if (this.key(u.x, u.y) === u._crowdKey) return;
    this.buckets.get(u._crowdKey)?.delete(u); this.insert(u);
  }
  nearby(u, radius = 2) {
    const result = [];
    const x = Math.floor(u.x / 2), y = Math.floor(u.y / 2);
    for (let dy = -radius; dy <= radius; dy++) for (let dx = -radius; dx <= radius; dx++) {
      for (const v of this.buckets.get(`${x + dx},${y + dy}`) || []) {
        if (v !== u && v.alive) result.push(v);
      }
    }
    return result;
  }
  steer(u, next, clear, time) {
    const neighbours = this.nearby(u, 1);
    const step = Math.hypot(next.x-u.x, next.y-u.y);
    if (!step) return next;
    let dx = (next.x-u.x)/step, dy = (next.y-u.y)/step;
    const radius = u.typeDef.radius || .24;
    const leader = neighbours.find(v => {
      if (v.id >= u.id || !['move','gather','return','attack','build'].includes(v.state)) return false;
      const distance = Math.hypot(v.x-u.x, v.y-u.y);
      const heading = v._heading;
      return heading && distance < 1.8 && heading.x*dx + heading.y*dy < -.5;
    });
    if (leader) u._yieldTo = { id: leader.id, until: time+4 };
    const yielding = u._yieldTo && u._yieldTo.until > time && neighbours.find(v=>v.id===u._yieldTo.id);
    if (yielding) {
      const awayX = u.x-yielding.x, awayY = u.y-yielding.y;
      const len = Math.hypot(awayX, awayY) || 1;
      // A lateral component lets the yielding unit clear the mouth of a passage.
      dx = awayX/len + .7*awayY/len; dy = awayY/len - .7*awayX/len;
      const norm = Math.hypot(dx,dy); dx/=norm; dy/=norm;
    }
    const safe = p => {
      if (!clear(u,p)) return false;
      for (const v of neighbours) {
        const r = radius + (v.typeDef.radius || .24) - .015;
        const before = Math.hypot(u.x-v.x, u.y-v.y);
        const vx=p.x-u.x, vy=p.y-u.y, len=vx*vx+vy*vy;
        const t=len?Math.max(0,Math.min(1,((v.x-u.x)*vx+(v.y-u.y)*vy)/len)):0;
        const closest=Math.hypot(u.x+vx*t-v.x,u.y+vy*t-v.y);
        if (before < r) {
          // Old saves may overlap. Permit only motion that increases separation.
          if (Math.hypot(p.x-v.x,p.y-v.y) <= before+1e-6) return false;
        } else if (closest < r) return false;
      }
      return true;
    };
    for (const angle of [0,.35,-.35,.7,-.7,1.05,-1.05,1.45,-1.45]) {
      const cos=Math.cos(angle),sin=Math.sin(angle);
      const p={x:u.x+(dx*cos-dy*sin)*step,y:u.y+(dx*sin+dy*cos)*step};
      if(safe(p))return p;
    }
    return null;
  }
}
