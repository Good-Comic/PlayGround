import { VFX_ATLASES } from './vfx-atlas-data.js';
// 純視覺有限佇列，以模擬時間取幀，無RNG。 / Bounded presentation queue, simulation-time frames, no RNG.
export class CombatVfx {
  constructor({loadImage=src=>{const i=new Image();i.src=src;return i;},limit=48}={}){
    this.limit=limit;this.events=[];this.enabled=true;this.lastTime=0;
    this.images=Object.fromEntries(Object.entries(VFX_ATLASES).map(([k,v])=>[k,loadImage(v.src)]));
    this.stats={emitted:0,dropped:0,drawn:0,culled:0};
  }
  reset(){this.events.length=0;}
  emit(event,game){
    if(!this.enabled||!VFX_ATLASES[event.kind])return;
    if(game.time<this.lastTime)this.reset();this.lastTime=game.time;
    this.events=this.events.filter(e=>game.time-e.time<VFX_ATLASES[e.kind].frames.length/VFX_ATLASES[e.kind].fps);
    if(this.events.length>=this.limit){this.stats.dropped++;return;}
    this.events.push({...event,time:game.time});this.stats.emitted++;
  }
  draw(ctx,game,screen,w,h,layer){
    if(game.time<this.lastTime)this.reset();this.lastTime=game.time;
    if(!this.enabled)return;
    this.events=this.events.filter(e=>game.time-e.time<VFX_ATLASES[e.kind].frames.length/VFX_ATLASES[e.kind].fps);
    for(const e of this.events){
      if(e.layer!==layer)continue;
      if(!game.isVisible({x:e.x,y:e.y,alive:true})){this.stats.culled++;continue;}
      const d=VFX_ATLASES[e.kind],i=this.images[e.kind],f=d.frames[Math.floor(Math.max(0,game.time-e.time)*d.fps)];
      if(!f||!i?.complete||!i.naturalWidth)continue;
      const p=screen(e.x,e.y),s=game.camera.zoom*e.scale,extent=Math.hypot(f.w,f.h)*s;
      if(p.x+extent<0||p.x-extent>w||p.y+extent<0||p.y-extent>h){this.stats.culled++;continue;}
      ctx.save();ctx.translate(p.x,p.y);ctx.rotate(e.angle);ctx.scale(s,s);
      ctx.drawImage(i,f.x,f.y,f.w,f.h,-d.pivot[0],-d.pivot[1],f.w,f.h);ctx.restore();this.stats.drawn++;
    }
  }
}
