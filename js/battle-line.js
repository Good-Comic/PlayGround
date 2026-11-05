import { t } from './i18n.js';
import { battleArmy } from './battle-actions.js';

const combatUnit = u => u?.alive && u.team === 'player' && !u.w && !u.hero && u.type !== 'commander' && u.type !== 'villager' && !u.typeDef?.noAttack;
export const lineCanAct = g => !g.inMenu && !g.paused && !g.placement && !g.heroControl && ['prep','wave'].includes(g.phase);
export function lineUnits(g, selection = g.selection) {
  const actual = new Set(g.units);
  return [...new Set(selection)].filter(u => actual.has(u) && combatUnit(u)).sort((a,b)=>a.id-b.id);
}

// 只產生玩家下令的落點；0.8沿用commandMove間距，大單位依真實碰撞半徑加寬。
export function buildBattleLine(g, selection, a, b = a, reversed = false) {
  const units = lineUnits(g,selection);
  if (!units.length || !a || !b || ![a.x,a.y,b.x,b.y].every(Number.isFinite)) return null;
  const center = units.reduce((s,u)=>({x:s.x+u.x/units.length,y:s.y+u.y/units.length}),{x:0,y:0});
  const spacing = Math.max(.8,...units.map(u=>2*(u.typeDef.radius||.2)));
  const mid={x:(a.x+b.x)/2,y:(a.y+b.y)/2};
  let width=Math.hypot(b.x-a.x,b.y-a.y),tangent;
  if(width<1e-6){const dx=mid.x-center.x,dy=mid.y-center.y,len=Math.hypot(dx,dy)||1;tangent={x:dy/len,y:-dx/len};if(!dx&&!dy)tangent={x:1,y:0};width=(Math.ceil(Math.sqrt(units.length))-1)*spacing;}
  else tangent={x:(b.x-a.x)/width,y:(b.y-a.y)/width};
  let normal={x:-tangent.y,y:tangent.x};
  if(normal.x*(mid.x-center.x)+normal.y*(mid.y-center.y)<0)normal={x:-normal.x,y:-normal.y};
  if(reversed)normal={x:-normal.x,y:-normal.y};
  const cols=Math.max(1,Math.min(units.length,Math.floor(width/spacing+1e-8)+1));
  const ranged=units.filter(u=>u.typeDef.category==='ranged'),siege=units.filter(u=>u.typeDef.category==='siege');
  let flank=units.filter(u=>u.typeDef.category==='cavalry');
  let front=units.filter(u=>!['ranged','siege','cavalry'].includes(u.typeDef.category));
  if(!front.length){front=flank;flank=[];}
  const pairs=[];
  const add=(unit,side,depth)=>{
    const point={x:mid.x+tangent.x*side-normal.x*depth,y:mid.y+tangent.y*side-normal.y*depth};
    const inside=point.x>=1&&point.y>=1&&point.x<g.world.size-1&&point.y<g.world.size-1;
    const known=inside&&g.isVisible({alive:true,team:'neutral',x:point.x,y:point.y});
    const valid=inside&&(!known||g.isWalkable(point.x,point.y,unit));
    pairs.push({unit,point,known,valid,role:unit.typeDef.category});
  };
  const rows=(group,start)=>{
    for(let i=0;i<group.length;i++){
      const row=Math.floor(i/cols),count=Math.min(cols,group.length-row*cols),col=i%cols;
      const step=count>1?width/(count-1):0;
      add(group[i],(col-(count-1)/2)*step,(start+row)*spacing);
    }
    return Math.ceil(group.length/cols);
  };
  const frontRows=rows(front,0);
  const rangedStart=frontRows?frontRows+1:0,rangedRows=rows(ranged,rangedStart);
  rows(siege,rangedRows?rangedStart+rangedRows+1:frontRows?frontRows+1:0);
  for(let i=0;i<flank.length;i++)add(flank[i],(i%2?1:-1)*(width/2+spacing),Math.floor(i/2)*spacing);
  return {pairs,mid,normal,tangent,width,spacing,blocked:pairs.filter(p=>!p.valid).length,unknown:pairs.filter(p=>!p.known&&p.valid).length};
}

// 同一個手勢只回報一次選取、旗標與指令音；所有部隊仍走原生移動／戰術入口。
export function issueBattleLine(g, selection, a, b=a, mode='attackMove', reversed=false) {
  if(!lineCanAct(g)||!['attackMove','move'].includes(mode))return {ok:false,reason:'unavailable'};
  const plan=buildBattleLine(g,selection,a,b,reversed);
  if(!plan||plan.blocked)return {ok:false,reason:'blocked',plan};
  const selected=plan.pairs.map(p=>p.unit),hook=g.hooks.selectionChanged,marker=g.addCommandMarker;
  const sound=g.sound,hasSound=!!sound&&typeof sound.command==='function',ownSound=hasSound&&Object.hasOwn(sound,'command'),soundCommand=sound?.command;
  g.hooks.selectionChanged=null;g.addCommandMarker=()=>{};if(hasSound)sound.command=()=>{};
  let applied=0;
  try {
    for(const {unit,point} of plan.pairs){
      g.setSelection([unit]);g.orderMode=null;
      if(mode==='move'){g.commandMove([unit],point.x,point.y);applied++;}
      else {g.command('order:attackMove');const p=g.screenPos(point.x,point.y);if(g.issueTacticalCommand(p.x,p.y))applied++;}
    }
  } finally {
    g.hooks.selectionChanged=hook;g.addCommandMarker=marker;
    if(hasSound){if(ownSound)sound.command=soundCommand;else delete sound.command;}
    g.orderMode=null;g.setSelection(selected.filter(u=>u.alive));
  }
  marker.call(g,plan.mid.x,plan.mid.y,mode==='attackMove');soundCommand?.call(sound);
  return {ok:applied===selected.length,count:applied,plan};
}

export function installBattleLine(g,ui,renderer,canvas) {
  const launch=document.createElement('button');launch.id='btn-battle-line';launch.type='button';launch.className='line-launch';
  document.querySelector('#battle-actions .battle-head').append(launch);
  const panel=document.createElement('section');panel.id='battle-line-panel';panel.hidden=true;
  panel.innerHTML='<strong></strong><p class="line-help"></p><div><label><span></span> <select><option value="attackMove"></option><option value="move"></option></select></label><button type="button" class="line-flip"></button><button type="button" class="line-cancel"></button></div><p class="line-status" aria-live="polite"></p>';
  document.body.append(panel);
  const modeSelect=panel.querySelector('select'),cancelButton=panel.querySelector('.line-cancel'),flipButton=panel.querySelector('.line-flip');
  let state=null,drag=null,cached=null,lastCalc=0,lastPaint=0,signature='',message='',reversed=false;
  const blocked=()=>ui.menuVisible||ui.settingsOpen||ui.gmOpen||ui.boonsOpen||ui.pauseOpen||!ui.el.howto.hidden||!!document.querySelector('dialog[open]');
  function cancel(){state=null;drag=null;cached=null;message='';panel.hidden=true;document.body.classList.remove('lining-up');}
  function active(){
    if(!state)return false;
    const units=lineUnits(g,state.units),selected=lineUnits(g);
    if(!lineCanAct(g)||blocked()||g.orderMode||g.world!==state.world||g.waveIndex!==state.wave||g.phase!==state.phase||!units.length||units.length!==selected.length||units.some((u,i)=>u!==selected[i])){cancel();return false;}
    return true;
  }
  function begin(){
    if(state){cancel();return;}
    if(!lineCanAct(g)||blocked())return;
    const units=lineUnits(g);const roster=units.length?units:battleArmy(g);
    if(!roster.length)return;
    g.orderMode=null;g.dragBox=null;g.setSelection(roster);
    reversed=false;
    state={units:roster,world:g.world,wave:g.waveIndex,phase:g.phase};message='';cached=null;lastCalc=0;update(true);
  }
  function recalc(){if(!active()||!drag)return null;const r=canvas.getBoundingClientRect();const end=g.worldAt(drag.x-r.left,drag.y-r.top),short=Math.hypot(drag.x-drag.sx,drag.y-drag.sy)<8;return buildBattleLine(g,state.units,drag.from,short?drag.from:end,reversed);}
  function update(force=false){
    const on=active();if(panel.hidden===on)panel.hidden=!on;document.body.classList.toggle('lining-up',on);
    const now=performance.now();if(!force&&now-lastPaint<100)return;lastPaint=now;
    const count=state?lineUnits(g,state.units).length:lineUnits(g).length||battleArmy(g).length;
    const disabled=!lineCanAct(g)||blocked()||!count;
    const key=[document.documentElement.lang,on,disabled,count,modeSelect.value,reversed,cached?.blocked,cached?.unknown,message].join('|');if(key===signature)return;signature=key;
    const set=(node,value)=>{if(node.textContent!==value)node.textContent=value;};
    set(launch,t('line.launch'));launch.disabled=!!disabled;launch.setAttribute('aria-pressed',String(on));launch.title=t('line.help');
    set(panel.querySelector('strong'),t('line.title'));set(panel.querySelector('.line-help'),t('line.help'));
    set(panel.querySelector('label span'),t('line.mode'));set(modeSelect.options[0],t('line.attackMove'));set(modeSelect.options[1],t('line.move'));set(flipButton,t('line.flip'));flipButton.setAttribute('aria-pressed',String(reversed));set(cancelButton,t('line.cancel'));
    set(panel.querySelector('.line-status'),message||t(cached?.blocked?'line.blocked':cached?.unknown?'line.unknown':'line.ready',{count,blocked:cached?.blocked||0,unknown:cached?.unknown||0}));
  }
  const flip=()=>{reversed=!reversed;cached=recalc();lastCalc=0;update(true);};
  launch.onclick=begin;cancelButton.onclick=cancel;flipButton.onclick=flip;modeSelect.onchange=()=>update(true);
  for(const el of[launch,cancelButton,flipButton,modeSelect])el.addEventListener('keydown',e=>{if([' ','Enter','Tab'].includes(e.key)||el===modeSelect)e.stopPropagation();});
  window.addEventListener('keydown',e=>{
    if(e.target?.closest?.('input,select,textarea,[contenteditable=true]')||e.ctrlKey||e.metaKey||e.altKey)return;
    if(e.key.toLowerCase()==='v'&&!e.repeat&&active()){e.preventDefault();e.stopImmediatePropagation();flip();return;}
    if(e.key==='Escape'&&active()){e.preventDefault();e.stopImmediatePropagation();cancel();return;}
    if(e.key.toLowerCase()==='f'&&!e.shiftKey&&!e.repeat&&lineCanAct(g)&&!blocked()){e.preventDefault();e.stopImmediatePropagation();begin();}
  },true);
  canvas.addEventListener('pointerdown',e=>{
    if(!active())return;e.preventDefault();e.stopImmediatePropagation();
    if(e.button!==0){cancel();return;}
    const r=canvas.getBoundingClientRect();drag={from:g.worldAt(e.clientX-r.left,e.clientY-r.top),sx:e.clientX,sy:e.clientY,x:e.clientX,y:e.clientY};canvas.setPointerCapture?.(e.pointerId);cached=recalc();update(true);
  },true);
  canvas.addEventListener('pointermove',e=>{if(!active()||!drag)return;drag.x=e.clientX;drag.y=e.clientY;},true);
  window.addEventListener('pointerup',e=>{
    if(!active()||!drag)return;e.preventDefault();e.stopImmediatePropagation();
    drag.x=e.clientX;drag.y=e.clientY;
    if(document.elementFromPoint(e.clientX,e.clientY)!==canvas){drag=null;cached=null;message=t('line.onField');update(true);return;}
    const r=canvas.getBoundingClientRect(),end=g.worldAt(e.clientX-r.left,e.clientY-r.top),from=drag.from,short=Math.hypot(e.clientX-drag.sx,e.clientY-drag.sy)<8;
    const result=issueBattleLine(g,state.units,from,short?from:end,modeSelect.value,reversed);drag=null;
    if(result.ok){g.toast(t('line.issued',{count:result.count}),'good',2600);cancel();}
    else {cached=result.plan;message=t('line.blocked',{blocked:result.plan?.blocked||0});update(true);}
  },true);
  canvas.addEventListener('pointercancel',()=>{drag=null;cached=null;});window.addEventListener('blur',()=>{drag=null;cached=null;});
  const oldUpdate=ui.update.bind(ui);ui.update=(...args)=>{oldUpdate(...args);update();};
  const oldDraw=renderer.draw.bind(renderer);renderer.draw=(...args)=>{
    oldDraw(...args);if(!active()||!drag)return;
    if(performance.now()-lastCalc>75){cached=recalc();lastCalc=performance.now();}
    if(!cached)return;
    const ctx=renderer.ctx;ctx.save();ctx.lineWidth=2;ctx.setLineDash([5,4]);
    for(const p of cached.pairs){const s=g.screenPos(p.point.x,p.point.y);if(s.x<-20||s.y<-20||s.x>renderer.w+20||s.y>renderer.h+20)continue;
      ctx.strokeStyle=!p.valid?'#ffab79':p.known?'#9de6e9':'#b3b7bb';ctx.fillStyle='#13252699';
      ctx.beginPath();if(p.role==='ranged')ctx.rect(s.x-6,s.y-6,12,12);else if(p.role==='cavalry'){ctx.moveTo(s.x,s.y-8);ctx.lineTo(s.x+8,s.y+6);ctx.lineTo(s.x-8,s.y+6);ctx.closePath();}else if(p.role==='siege'){ctx.moveTo(s.x,s.y-8);ctx.lineTo(s.x+8,s.y);ctx.lineTo(s.x,s.y+8);ctx.lineTo(s.x-8,s.y);ctx.closePath();}else ctx.arc(s.x,s.y,7,0,Math.PI*2);ctx.fill();ctx.stroke();
      if(!p.valid){ctx.beginPath();ctx.moveTo(s.x-6,s.y-6);ctx.lineTo(s.x+6,s.y+6);ctx.moveTo(s.x+6,s.y-6);ctx.lineTo(s.x-6,s.y+6);ctx.stroke();}
      if(cached.pairs.length<=32){const u=g.screenPos(p.unit.x,p.unit.y);ctx.beginPath();ctx.moveTo(u.x,u.y);ctx.lineTo(s.x,s.y);ctx.stroke();}
    }
    const mid=g.screenPos(cached.mid.x,cached.mid.y),front=g.screenPos(cached.mid.x+cached.normal.x,cached.mid.y+cached.normal.y);ctx.strokeStyle='#ffe2a2';ctx.beginPath();ctx.moveTo(mid.x,mid.y);ctx.lineTo(front.x,front.y);ctx.stroke();ctx.restore();
  };
  document.addEventListener('localechange',()=>update(true));update(true);
  return {begin,cancel,active,update};
}
