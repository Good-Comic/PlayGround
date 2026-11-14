// 凍結來源7bd49fcd0f92a1d328f735ffd865103156d7b0cf；僅供回歸對照，不載入遊戲。
import {clamp,dist2} from '../../js/utils.js';
import {crossesRect} from '../../js/navigation.js';
export function segmentWalkable(a,b,u, endpointWalkable = null) {
    if(!(endpointWalkable?endpointWalkable(b.x,b.y):this.isWalkable(b.x,b.y,u)))return false;
    const r=u?.typeDef?.radius ?? .24;
    for(const building of this.buildings) {
      if(!building.alive || u?.team==='player' && building.team==='player' && building.type==='gate' && building.construction>=1)continue;
      if(crossesRect(a,b,building.x-r-.02,building.y-r-.02,building.x+building.w+r+.02,building.y+building.h+r+.02))return false;
    }
    for(let x=Math.max(0,Math.floor(Math.min(a.x,b.x)-r));x<=Math.min(this.world.size-1,Math.floor(Math.max(a.x,b.x)+r));x++)
      for(let y=Math.max(0,Math.floor(Math.min(a.y,b.y)-r));y<=Math.min(this.world.size-1,Math.floor(Math.max(a.y,b.y)+r));y++) {
        if(this.world.tile(x+.5,y+.5)?.terrain==='water' && crossesRect(a,b,x-r,y-r,x+1+r,y+1+r))return false;
      }
    const dx=b.x-a.x,dy=b.y-a.y,len=dx*dx+dy*dy;
    for(const n of this.world.resources) {
      if(!n.alive || !['oak','pine'].includes(n.kind))continue;
      const t=len?clamp(((n.x-a.x)*dx+(n.y-a.y)*dy)/len,0,1):0;
      if(dist2(n.x,n.y,a.x+dx*t,a.y+dy*t)<(r+.22)**2)return false;
    }
    return true;
  }
