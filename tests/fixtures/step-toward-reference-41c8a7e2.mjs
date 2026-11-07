// 效能快取前參考：80d2af138b68d1eef7da40024d7dcc13667923fa；不供正式遊戲載入。
import {findPath,segmentClear} from '../../js/navigation.js';
import {clamp,dist} from '../../js/utils.js';
import {visualDirectionFromVector} from '../../js/visuals.js';
export function stepToward(u, tx, ty, dt, range = 0, entity = null) {
    u._movementAttempted = true;
    const walkable = (x, y) => this.isWalkable(x, y, u);
    walkable.segment = (a,b) => this.segmentWalkable(a,b,u);
    const target = { x: tx, y: ty };
    let nav = u._nav;
    if (!nav || Math.hypot(tx-nav.tx, ty-nav.ty) > .6 || nav.range !== range) {
      nav = u._nav = { tx, ty, range, points: [], status: 'pending', retryAt: 0, stalled: 0 };
    }
    if (entity ? this.distanceTo(u,entity)<=range : range && dist(u.x,u.y,tx,ty)<=range) return 'arrived';
    if (!range && walkable(tx, ty) && dist(u.x,u.y,tx,ty)<.08) return 'arrived';
    if (!range && nav.status === 'ready' && nav.goal && dist(u.x,u.y,nav.goal.x,nav.goal.y)<.08) return 'arrived';
    if (nav.status==='ready' && nav.points.length && this.navigationStats) this.navigationStats.routeReuses++;
    if ((!nav.points.length || nav.status !== 'ready') && this.time >= nav.retryAt) {
      // Sweep the complete segment first. A legal straight route does not need A*.
      // Dynamic collision avoidance still executes for every movement step below.
      if(!entity && !(u._avoidCrowdUntil>this.time)) {
        const distance=dist(u.x,u.y,tx,ty),stop=range?Math.max(0,distance-range*.98):distance;
        const goal=distance?{x:u.x+(tx-u.x)/distance*stop,y:u.y+(ty-u.y)/distance*stop}:{x:tx,y:ty};
        if(walkable(goal.x,goal.y) && segmentClear(walkable,u,goal)) {
          nav.status='ready';nav.points=[goal];nav.goal=goal;nav.stalled=0;nav.crowdDetour=false;
          if(this.navigationStats){this.navigationStats.directRoutes++;this.navigationStats.totalDirectRoutes++;}
        }
      }
    }
    if ((!nav.points.length || nav.status !== 'ready') && this.time >= nav.retryAt) {
      this.navigationRequested?.add(u.id);
      this.navigationQueue ||= []; this.navigationQueued ||= new Set();
      if(!this.navigationQueued.has(u.id)) {this.navigationQueue.push(u.id);this.navigationQueued.add(u.id);}
      if ((this.navigationBudget ?? 2) <= 0 || this.navigationQueue[0] !== u.id) return 'pending';
      this.navigationQueue.shift();this.navigationQueued.delete(u.id);
      this.navigationBudget = (this.navigationBudget ?? 2)-1;
      const searchStart = performance.now();
      const occupied = this.crowd && u._avoidCrowdUntil > this.time ? this.crowd.nearby(u,2).filter(v=>{
        if(['idle','hold','gather'].includes(v.state))return true;
        // 射程內原地交戰的友軍也佔據身體空間；追擊中的單位不當成靜態障礙。
        if(v.team!==u.team || v.state!=='attack' || !v.target?.alive || v.target.team===v.team)return false;
        const range=this.unitRange(v)+(v.target.w?(v.team==='player'?-.1:0):(v.target.typeDef.radius||.2));
        return this.distanceTo(v,v.target)<=range;
      }) : [];
      const planWalkable=(x,y)=>walkable(x,y) && occupied.every(v=>dist(x,y,v.x,v.y)>=(u.typeDef.radius||.24)+(v.typeDef.radius||.24));
      planWalkable.segment=(a,b)=>walkable.segment(a,b) && occupied.every(v=>{
        const dx=b.x-a.x,dy=b.y-a.y,len=dx*dx+dy*dy,t=len?clamp(((v.x-a.x)*dx+(v.y-a.y)*dy)/len,0,1):0;
        return dist(v.x,v.y,a.x+t*dx,a.y+t*dy)>=(u.typeDef.radius||.24)+(v.typeDef.radius||.24)-.015;
      });
      const path = findPath(u, target, occupied.length?planWalkable:walkable, this.world.size, {range:entity?range+Math.hypot(entity.w,entity.h)/2:range, goalTest:entity?p=>this.distanceTo(p,entity)<=range:null});
      if(this.navigationStats) {
        this.navigationStats.searches++; this.navigationStats.totalSearches++;
        this.navigationStats.expanded += path.expanded; this.navigationStats.ms += performance.now()-searchStart;
      }
      if(occupied.length && path.status==='unreachable') {nav.status='pending';nav.retryAt=this.time+1;return 'pending';}
      Object.assign(nav, path);nav.stalled=0;nav.crowdDetour=occupied.length>0;
      nav.retryAt=this.time+(path.status==='ready'?0:2);
    }
    if (nav.status !== 'ready') return nav.status;
    // Do not discard a ranged final endpoint while still outside the true interaction radius.
    // At60Hz a small step may stop within.07 of that endpoint but still outside range forever.
    while(nav.points.length && dist(u.x,u.y,nav.points[0].x,nav.points[0].y)<.07 && (nav.points.length>1 || !range)) nav.points.shift();
    if (!nav.points.length) {
      if (entity && this.distanceTo(u,entity)>range || !entity && range && dist(u.x,u.y,tx,ty)>range+.01) {nav.status='pending';nav.retryAt=this.time;return 'pending';}
      return 'arrived';
    }
    // Skip only fully collision-checked segments, never snap a unit to a waypoint.
    // A crowd-aware A* detour cannot be shortened using a static-only segment test.
    while(!nav.crowdDetour && nav.points.length>1 && segmentClear(walkable,u,nav.points[1])) nav.points.shift();
    const p=nav.points[0], d=dist(u.x,u.y,p.x,p.y), step=Math.min(d,this.unitSpeed(u)*dt);
    if(d<1e-9){nav.points=[];nav.status='pending';nav.retryAt=this.time;return 'pending';}
    const desired={x:u.x+(p.x-u.x)/d*step,y:u.y+(p.y-u.y)/d*step};
    u._heading={x:(p.x-u.x)/d,y:(p.y-u.y)/d};
    const next=this.crowd ? this.crowd.steer(u,desired,(a,b)=>segmentClear(walkable,a,b),this.time) : desired;
    if(next && segmentClear(walkable,u,next)) {
      const faceDx=next.x-u.x,faceDy=next.y-u.y;u.x=next.x;u.y=next.y;u.walkPhase+=step*5.3;u.facing=faceDx>=0?1:-1;u.visualDirection=visualDirectionFromVector(faceDx,faceDy,u.visualDirection);nav.stalled=0;
      this.crowd?.moved(u);
    } else {
      nav.stalled+=dt;
      if(nav.stalled>.3) {nav.points=[];nav.status='pending';nav.retryAt=this.time;}
    }
    const goalDistance=dist(u.x,u.y,tx,ty);
    if(!u._goalProgress || goalDistance<u._goalProgress.distance-.2) u._goalProgress={distance:goalDistance,at:this.time};
    else if(this.time-u._goalProgress.at>2) {
      u._avoidCrowdUntil=this.time+5;u._goalProgress={distance:goalDistance,at:this.time};
      nav.points=[];nav.status='pending';nav.retryAt=this.time;
    }
    const progress = u._progress;
    if(!progress || Math.hypot(u.x-progress.x,u.y-progress.y)>.4) u._progress={x:u.x,y:u.y,at:this.time};
    else if(this.time-progress.at>6) {
      u._progress={x:u.x,y:u.y,at:this.time}; nav.points=[];nav.status='pending';nav.retryAt=this.time;
      return 'congested';
    }
    return 'moving';
  }
