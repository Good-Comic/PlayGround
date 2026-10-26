// Bounded A* on a half-tile grid. Paths are transient; only player orders are saved.
// All edges are swept through the same collision predicate as actual movement.
export function segmentClear(walkable, a, b) {
  if (walkable.segment) return walkable.segment(a,b);
  const n = Math.max(1, Math.ceil(Math.hypot(b.x-a.x, b.y-a.y) / .035));
  for (let i=1; i<=n; i++) if (!walkable(a.x+(b.x-a.x)*i/n, a.y+(b.y-a.y)*i/n)) return false;
  return true;
}
class Heap {
  a = [];
  push(v) { const a=this.a; a.push(v); let i=a.length-1; while(i) { const p=(i-1)>>1; if(a[p].f<=v.f) break; a[i]=a[p]; i=p; } a[i]=v; }
  pop() { const a=this.a, top=a[0], v=a.pop(); if(a.length) { let i=0; while(i*2+1<a.length) { let j=i*2+1; if(j+1<a.length&&a[j+1].f<a[j].f) j++; if(a[j].f>=v.f) break; a[i]=a[j];i=j; } a[i]=v; } return top; }
}
export function findPath(start, target, walkable, size, { range = 0, maxNodes = 10000, goalTest = null } = {}) {
  const cell=.5, n=size*2, total=n*n, point=i=>({x:(i%n)*cell,y:Math.floor(i/n)*cell});
  const mask=new Int8Array(total), costs=new Float64Array(total).fill(Infinity), parents=new Int32Array(total).fill(-1);
  const open=new Heap(), closed=new Uint8Array(total);
  const legal=i=>{if(!mask[i]) { const p=point(i);mask[i]=walkable(p.x,p.y)?1:-1; }return mask[i]>0;};
  const distance=p=>Math.hypot(p.x-target.x,p.y-target.y);
  // For ordinary moves project a blocked endpoint onto the nearest legal point.
  let goal=target;
  if(!range && !walkable(target.x,target.y)) {
    let best=Infinity;
    for(let i=0;i<total;i++) { const p=point(i),d=distance(p);if(d<best&&d<=4&&legal(i)){best=d;goal=p;} }
    if(best===Infinity) return {status:'unreachable',points:[],expanded:0};
  }
  const interactionGoals=[];
  if(range) {
    for(const fraction of [1,.75,.5,.25,0]) for(let i=0;i<32;i++) {
      const a=i*Math.PI/16,p={x:target.x+Math.cos(a)*range*fraction,y:target.y+Math.sin(a)*range*fraction};
      if(walkable(p.x,p.y)&&(!goalTest||goalTest(p)))interactionGoals.push(p);
    }
    if(!interactionGoals.length)return {status:'unreachable',points:[],expanded:0};
  }
  const h=p=>Math.max(0,Math.hypot(p.x-goal.x,p.y-goal.y)-range);
  const reached=p=>goalTest ? goalTest(p) : range ? distance(p)<=range : Math.hypot(p.x-goal.x,p.y-goal.y)<=.4&&segmentClear(walkable,p,goal);
  // Connect the actual (non-grid) unit position without crossing obstacles.
  const sx=Math.floor(start.x/cell),sy=Math.floor(start.y/cell);
  for(let y=Math.max(0,sy-2);y<=Math.min(n-1,sy+2);y++) for(let x=Math.max(0,sx-2);x<=Math.min(n-1,sx+2);x++) {
    const i=y*n+x,p=point(i);if(!legal(i)||!segmentClear(walkable,start,p))continue;
    costs[i]=Math.hypot(p.x-start.x,p.y-start.y);open.push({i,f:costs[i]+h(p)});
  }
  let expanded=0;
  while(open.a.length&&expanded<maxNodes) {
    const {i}=open.pop();if(closed[i])continue;closed[i]=1;expanded++;
    const p=point(i);
    const endpoint=range ? interactionGoals.find(q=>Math.hypot(p.x-q.x,p.y-q.y)<=.8&&segmentClear(walkable,p,q)) : null;
    if(reached(p) || endpoint) {
      const points=[];for(let k=i;k!==-1;k=parents[k])points.push(point(k));points.reverse();
      if(!range)points.push({...goal});else if(endpoint)points.push(endpoint);
      return {status:'ready',points,goal:range?(endpoint||p):{...goal},expanded};
    }
    const x=i%n,y=Math.floor(i/n);
    for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++) {
      if(!dx&&!dy)continue;const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=n||ny>=n)continue;
      const j=ny*n+nx;if(closed[j]||!legal(j))continue;const q=point(j),cost=costs[i]+Math.hypot(dx,dy)*cell;
      if(cost>=costs[j]||!segmentClear(walkable,p,q))continue;
      costs[j]=cost;parents[j]=i;open.push({i:j,f:cost+h(q)});
    }
  }
  return {status:open.a.length?'budget_exhausted':'unreachable',points:[],expanded};
}

export function crossesRect(a,b,left,top,right,bottom) {
  let lo=0,hi=1;
  for(const [p,d,min,max] of [[a.x,b.x-a.x,left,right],[a.y,b.y-a.y,top,bottom]]) {
    if(Math.abs(d)<1e-10) {if(p<=min||p>=max)return false;continue;}
    let t1=(min-p)/d,t2=(max-p)/d;if(t1>t2)[t1,t2]=[t2,t1];
    lo=Math.max(lo,t1);hi=Math.min(hi,t2);if(lo>=hi)return false;
  }
  return hi>0 && lo<1;
}
