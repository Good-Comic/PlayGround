import { createRescue } from './expeditions.js';
import { UNIT_TYPES } from './data.js';
import { t } from './i18n.js';
export function updateWorkshop(g){
  if(!g.workshopInitialized){const p=createRescue(g,8,g.expedition);g.workshop=p?{x:p.x,y:p.y,used:false,unitId:null}:null;g.workshopInitialized=true;}
}
export function workshopReady(g){return !g.inMenu&&!g.paused&&!g.placement&&['prep','wave'].includes(g.phase)&&g.hero?.alive&&g.workshop&&!g.workshop.used&&Math.hypot(g.hero.x-g.workshop.x,g.hero.y-g.workshop.y)<=2;}
export function sendWorkshop(g){const p=g.workshop;if(!p||p.used||g.inMenu||g.paused||g.placement||!g.hero?.alive||!['prep','wave'].includes(g.phase))return false;if(g.heroControl)g.toggleHeroControl();g.orderMode=null;g.setSelection([g.hero]);g.commandMove([g.hero],p.x,p.y);g.focusAt(p.x,p.y);return true;}
export function buyWorkshop(g,type){
  if(!workshopReady(g)||!['ram','mangonel'].includes(type)||!g.canAfford({wood:80})||!g.hasPopulationRoom(type))return false;
  const p=g.workshop,def=UNIT_TYPES[type],probe={...g.hero,type,typeDef:def};
  const spot=[[1.2,0],[-1.2,0],[0,1.2],[0,-1.2],[1.2,1.2],[-1.2,-1.2]].find(([x,y])=>g.isWalkable(p.x+x,p.y+y,probe)&&!g.units.some(u=>u.alive&&Math.hypot(u.x-p.x-x,u.y-p.y-y)<(u.typeDef.radius||.25)+def.radius));
  if(!spot)return false;
  const u=g.spawnUnit(type,p.x+spot[0],p.y+spot[1],'player',{expireIn:30});if(!u)return false;
  g.pay({wood:80});p.used=true;p.unitId=u.id;p.unitType=type;g.setSelection([u]);g.sound?.complete?.();g.toast(t('workshop.started',{unit:t('unit.'+type+'.name')}),'good',4000);return true;
}
export function drawWorkshop(ctx,g,project){const p=g.workshop;if(!p||p.used)return;const s=project(p.x,p.y),z=g.camera.zoom;ctx.save();ctx.translate(s.x,s.y);ctx.strokeStyle='#9bdaec';ctx.fillStyle='#192b31';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,0,22*z,11*z,0,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillRect(-22*z,-44*z,44*z,26*z);ctx.strokeRect(-22*z,-44*z,44*z,26*z);ctx.fillStyle='#e6fbff';ctx.font='bold 12px sans-serif';ctx.textAlign='center';ctx.fillText('30s',0,-27*z);ctx.restore();}
export function installWorkshopUI(g,ui){
  const box=document.createElement('details');box.id='workshop-expedition';box.innerHTML='<summary></summary><p></p><button type="button" data-workshop="go"></button><button type="button" data-workshop="mangonel"></button><button type="button" data-workshop="ram"></button>';document.querySelector('#rescue-expedition').append(box);
  for(const b of box.querySelectorAll('button'))b.onclick=()=>{if(document.querySelector('dialog[open]')||ui.boonsOpen||ui.pauseOpen||ui.settingsOpen||ui.gmOpen)return;b.dataset.workshop==='go'?sendWorkshop(g):buyWorkshop(g,b.dataset.workshop);last=0;};
  let last=0;const old=ui.update.bind(ui);ui.update=(...a)=>{old(...a);const p=g.workshop;box.hidden=!p;if(!p||performance.now()-last<100)return;last=performance.now();
    const unit=g.units.find(u=>u.id===p.unitId&&u.alive),remaining=unit?Math.max(0,Math.ceil(unit.expireIn)):0;
    const set=(e,v)=>{if(e.textContent!==v)e.textContent=v;};set(box.querySelector('summary'),t('workshop.title'));
    set(box.querySelector('p'),p.used?(remaining?t('workshop.remaining',{seconds:remaining}):t('workshop.done')):t('workshop.help')+(g.phase==='prep'?' '+t('workshop.prepWarning'):''));
    for(const b of box.querySelectorAll('button')){const kind=b.dataset.workshop;set(b,kind==='go'?t('rescue.go'):t('workshop.borrow',{unit:t('unit.'+kind+'.name')}));b.disabled=kind==='go'?p.used||g.inMenu||g.paused||!!g.placement||!g.hero?.alive:!workshopReady(g)||!g.canAfford({wood:80})||!g.hasPopulationRoom(kind);}
  };
}
