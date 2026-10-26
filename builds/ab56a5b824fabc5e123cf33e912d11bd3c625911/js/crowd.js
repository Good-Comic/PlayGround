// Local collision avoidance. Spatial buckets avoid an all-pairs scan per moving unit.
// Higher IDs yield to lower IDs in head-on traffic; no positions are snapped.
export class Crowd {
  constructor(units) {
    this.buckets = new Map();
    this.rebuild(units);
  }
  // The world is 50x50; numeric bucket IDs avoid per-query string allocations.
  key(x, y) { return Math.floor(x/2)+Math.floor(y/2)*4096; }
  rebuild(units) {
    for(const bucket of this.buckets.values())bucket.clear();
    for(const u of units)if(u.alive)this.insert(u);
  }
  insert(u) {
    const key = this.key(u.x, u.y);
    if (!this.buckets.has(key)) this.buckets.set(key, new Set());
    this.buckets.get(key).add(u); u._crowdKey = key;
  }
  moved(u) {
    if (this.key(u.x, u.y) === u._crowdKey) return;
    this.buckets.get(u._crowdKey)?.delete(u); this.insert(u);
  }
  nearby(u, radius = 2, result = []) {
    result.length=0;
    const x = Math.floor(u.x / 2), y = Math.floor(u.y / 2);
    for (let dy = -radius; dy <= radius; dy++) for (let dx = -radius; dx <= radius; dx++) {
      for (const v of this.buckets.get(x+dx+(y+dy)*4096) || []) {
        if (v !== u && v.alive) result.push(v);
      }
    }
    return result;
  }
  steer(u, next, clear, time) {
    const neighbours = this.nearby(u,1,u._crowdNeighbours ||= []);
    const step = Math.hypot(next.x-u.x, next.y-u.y);
    if (!step) return next;
    let dx = (next.x-u.x)/step, dy = (next.y-u.y)/step;
    const radius = u.typeDef.radius || .24;
    // Active opponents must close to weapon range, not grant traffic right-of-way.
    // They remain in the hard swept-disc collision checks below.
    const fighting=v=>u.team!==v.team&&(u.target===v||v.target===u);
    let priority=u._trafficPriority||u.id;
    for(const v of neighbours)if(!fighting(v) && v._heading && v._heading.x*dx+v._heading.y*dy>.5)priority=Math.min(priority,v._trafficPriority||v.id);
    u._trafficPriority=priority;
    for(const v of neighbours) {
      if(!fighting(v) && v._heading && v._heading.x*dx+v._heading.y*dy>.5 && v._yieldTo?.until>time && v._yieldTo.priority<priority){u._yieldTo={...v._yieldTo};break;}
    }
    let leader=null;
    for(const v of neighbours) {
      if(fighting(v)||(v._trafficPriority||v.id)>=priority || !['move','gather','return','attack','build'].includes(v.state))continue;
      const heading=v._heading;
      if(heading && (v.x-u.x)**2+(v.y-u.y)**2<3.24 && heading.x*dx+heading.y*dy<-.5){leader=v;break;}
    }
    if (leader) u._yieldTo = { id: leader.id, priority:leader._trafficPriority||leader.id, until: time+4, dx:u.x-leader.x, dy:u.y-leader.y };
    if(u._yieldTo){const anchor=neighbours.find(v=>v.id===u._yieldTo.id);if(anchor&&fighting(anchor))u._yieldTo=null;}
    const yielding = u._yieldTo && u._yieldTo.until > time ? u._yieldTo : null;
    if (yielding) {
      const anchor=neighbours.find(v=>v.id===yielding.id);
      const awayX = anchor?u.x-anchor.x:yielding.dx, awayY = anchor?u.y-anchor.y:yielding.dy;
      const len = Math.hypot(awayX, awayY) || 1;
      // A lateral component lets the yielding unit clear the mouth of a passage.
      dx = awayX/len + .7*awayY/len; dy = awayY/len - .7*awayX/len;
      const norm = Math.hypot(dx,dy); dx/=norm; dy/=norm;
    }
    const safe = p => {
      if (!clear(u,p)) return false;
      for (const v of neighbours) {
        const r = radius + (v.typeDef.radius || .24) - .015;
        const ox=u.x-v.x,oy=u.y-v.y;
        if(Math.abs(ox)>r+step || Math.abs(oy)>r+step)continue;
        const before2=ox*ox+oy*oy;
        const vx=p.x-u.x, vy=p.y-u.y, len=vx*vx+vy*vy;
        const t=len?Math.max(0,Math.min(1,((v.x-u.x)*vx+(v.y-u.y)*vy)/len)):0;
        const cx=u.x+vx*t-v.x,cy=u.y+vy*t-v.y,closest2=cx*cx+cy*cy;
        if (before2 < r*r) {
          const before=Math.sqrt(before2);
          // Old saves may overlap. Permit only motion that increases separation.
          if (Math.hypot(p.x-v.x,p.y-v.y) <= before+1e-6) return false;
        } else if (closest2 < r*r) return false;
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
