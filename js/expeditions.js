import { findPath } from './navigation.js';
import { t } from './i18n.js';

export function createRescue(g,offset=0,avoid=null) {
  const h=g.hero;if(!h)return null;
  const base=g.world.base, walk=(x,y)=>g.isWalkable(x,y,h);
  walk.segment=(a,b)=>g.segmentWalkable(a,b,h);
  for(const r of [12,14,16])for(let i=0;i<16;i++){
    const a=((i+((g.seed>>>0)+offset)%16)%16)*Math.PI/8,x=Math.round(base.x+Math.cos(a)*r),y=Math.round(base.y+Math.sin(a)*r);
    if(avoid&&Math.hypot(x-avoid.x,y-avoid.y)<6)continue;
    if(x<2||y<2||x>g.world.size-3||y>g.world.size-3||!walk(x,y)||g.world.camps.some(c=>Math.hypot(c.x-x,c.y-y)<9))continue;
    const path=findPath({...h,_nav:null,targetPos:null},{x,y},walk,g.world.size,{range:1});
    if(path.status==='ready'||path.status==='arrived')return {x,y,rescued:0};
  }
  return null;
}
export function updateRescue(g) {
  if(!g.expeditionInitialized){g.expedition=createRescue(g);g.expeditionInitialized=true;}
  const p=g.expedition,h=g.hero;
  if(!p||p.rescued>=2||!h?.alive||Math.hypot(h.x-p.x,h.y-p.y)>2)return;
  while(p.rescued<2&&g.hasPopulationRoom('villager')){
    const spots=[[.6,0],[-.6,0],[0,.6],[0,-.6],[0,0]],spot=spots.find(([x,y])=>g.isWalkable(p.x+x,p.y+y,h)&&!g.units.some(u=>u.alive&&Math.hypot(u.x-p.x-x,u.y-p.y-y)<(u.typeDef.radius||.25)+.25));
    if(!spot)return;
    const u=g.spawnUnit('villager',p.x+spot[0],p.y+spot[1],'player');if(!u)return;
    p.rescued++;
    const tc=g.getTownCenter(),home=tc&&g.findDropoffPosition(tc);
    if(home)g.commandMove([u],home.x,home.y);
    g.toast(t('rescue.joined',{count:p.rescued}),'good',4000);
  }
}
export function sendRescue(g) {
  const p=g.expedition;
  if(g.inMenu||g.paused||g.placement||!['prep','wave'].includes(g.phase)||!g.hero?.alive||!p||p.rescued>=2)return false;
  if(g.heroControl)g.toggleHeroControl();g.orderMode=null;g.setSelection([g.hero]);g.commandMove([g.hero],p.x,p.y);g.focusAt(p.x,p.y);return true;
}
export function drawRescue(ctx,g,project) {
  const p=g.expedition;if(!p||p.rescued>=2)return;const s=project(p.x,p.y),z=g.camera.zoom;
  ctx.save();ctx.translate(s.x,s.y);ctx.strokeStyle='#f1d784';ctx.fillStyle='#29251c';ctx.lineWidth=2;ctx.setLineDash([5,4]);ctx.beginPath();ctx.ellipse(0,0,20*z,10*z,0,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-45*z);ctx.lineTo(27*z,-35*z);ctx.lineTo(0,-25*z);ctx.closePath();ctx.fill();ctx.stroke();ctx.font='bold 13px sans-serif';ctx.textAlign='center';ctx.fillStyle='#fff2c7';ctx.fillText('+2',12*z,-32*z);ctx.restore();
}
export function installExpeditionUI(g,ui) {
  const box=document.createElement('section');box.id='rescue-expedition';box.hidden=true;box.innerHTML='<strong></strong><p></p><button type="button"></button>';document.body.append(box);
  const button=box.querySelector('button');button.onclick=()=>sendRescue(g);
  let key='',last=0;const old=ui.update.bind(ui);ui.update=(...a)=>{old(...a);const p=g.expedition;const hidden=g.inMenu||ui.menuVisible||ui.boonsOpen||ui.pauseOpen||ui.settingsOpen||ui.gmOpen||!!document.querySelector('dialog[open]')||['boon','victory','defeat'].includes(g.phase);box.hidden=hidden||!p;if(box.hidden)return;
    const now=performance.now();if(now-last<100)return;last=now;const room=p.rescued>=2||g.hasPopulationRoom('villager');
    const near=g.hero?.alive&&Math.hypot(g.hero.x-p.x,g.hero.y-p.y)<=2;
    const state=[document.documentElement.lang,p.rescued,g.paused,g.hero?.alive,near,room,g.placement?.type].join('|');if(state===key)return;key=state;
    box.querySelector('strong').textContent=t('rescue.title');box.querySelector('p').textContent=p.rescued>=2?t('rescue.done'):near&&!room?t('rescue.cap'):t('rescue.help',{count:p.rescued});box.querySelector('p').title=box.querySelector('p').textContent;button.textContent=t('rescue.go');button.disabled=g.paused||!!g.placement||!g.hero?.alive||p.rescued>=2;
  };
  document.addEventListener('localechange',()=>{key='';last=0;});
}
