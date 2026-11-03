import { BOONS, CIVILIZATIONS } from './data.js';
import { t } from './i18n.js';
import { codexCards, boonTheme, adviceKind, TECH_BRANCHES, TECH_NODES, ageView } from './codex-data.js';

const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const tr=(key,vars)=>t('codex.'+key,vars);
const icon=key=>`<svg aria-hidden="true"><use href="#i-${({arrow:'bow',cart:'scroll',cog:'hammer',elephant:'horse'}[key]||key)}"/></svg>`;
const symbols=['①','②','③'];
const costText=cost=>Object.entries(cost).map(([r,n])=>`${t('resourceType.'+r)} ${n}`).join(' · ')||tr('free');

export class CardTree {
  constructor(root,game,{reward=false,onCandidate=()=>{}}={}){
    this.root=root;this.game=game;this.reward=reward;this.onCandidate=onCandidate;this.zoom=1;this.focused=null;this.viewCiv=game.civ?.id;this.filters={theme:'all',rarity:'all',state:'all'};this.nodes=new Map();this.fitMode='all';
    root.classList.add('card-tree-panel');
    root.innerHTML=`<div class="codex-civ"><label>${tr('viewCiv')} <select data-civ aria-label="${tr('viewCiv')}"></select></label><div data-civ-trait></div></div>
      <div class="codex-toolbar"><label>${tr('theme')} <select data-filter="theme"></select></label><label>${tr('rarity')} <select data-filter="rarity"></select></label><label>${tr('state')} <select data-filter="state"></select></label>
      <button type="button" data-fit>${tr('overview')}</button><button type="button" data-all>${tr('allCards')}</button><button type="button" data-minus aria-label="${tr('zoomOut')}">−</button><output data-zoom>100%</output><button type="button" data-plus aria-label="${tr('zoomIn')}">＋</button></div>
      <nav class="codex-offer-pins" aria-label="${tr('offered')}"></nav><p class="codex-legend">${tr('legend')}</p>
      <div class="codex-scroll" tabindex="0" aria-label="${tr('panHelp')}"><div class="codex-extent"><div class="codex-graph"></div></div></div>
      <article class="codex-detail" aria-live="polite"></article>`;
    this.scroll=root.querySelector('.codex-scroll');this.graph=root.querySelector('.codex-graph');this.extent=root.querySelector('.codex-extent');this.detail=root.querySelector('.codex-detail');
    const civSelect=root.querySelector('[data-civ]');civSelect.innerHTML=CIVILIZATIONS.map(c=>`<option value="${c.id}">${esc(t('civ.'+c.id+'.name'))} · ${c.id}</option>`).join('');
    civSelect.onchange=()=>{this.viewCiv=civSelect.value;this.refresh();};
    const themes=[...new Set(BOONS.map(c=>boonTheme(c.id)))];
    for(const key of Object.keys(this.filters)){
      const list=key==='theme'?themes:key==='rarity'?[...new Set(BOONS.map(c=>c.rarity))]:['owned','offered','recommended'];
      const select=root.querySelector(`[data-filter="${key}"]`);
      select.innerHTML=`<option value="all">${tr('all')}</option>`+list.map(k=>`<option value="${k}">${esc(key==='rarity'?t('rarity.'+k):tr(k))}</option>`).join('');
      select.onchange=()=>{this.filters[key]=select.value;this.refresh();this.fitAll();};
    }
    for(const theme of themes){
      const branch=document.createElement('section');branch.className='codex-branch';branch.dataset.theme=theme;
      const h=document.createElement('h4');h.textContent=tr(theme);branch.append(h);
      for(const card of BOONS.filter(c=>boonTheme(c.id)===theme)){
        const b=document.createElement('button');b.type='button';b.className='codex-node';b.dataset.boonId=card.id;
        b.innerHTML=`<span class="codex-node-icon">${icon(card.icon)}</span><span class="codex-node-name">${esc(t('boon.'+card.id+'.name'))}</span><small>${card.code} · ${esc(t('rarity.'+card.rarity))}</small><b class="codex-offer-number"></b><span class="codex-owned-mark">✓</span>`;
        b.onclick=()=>this.chooseNode(card.id);branch.append(b);this.nodes.set(card.id,b);
      }
      this.graph.append(branch);
    }
    root.querySelector('[data-fit]').onclick=()=>this.fitOffers();root.querySelector('[data-all]').onclick=()=>this.fitAll();
    root.querySelector('[data-minus]').onclick=()=>this.setZoom(this.zoom-.15);root.querySelector('[data-plus]').onclick=()=>this.setZoom(this.zoom+.15);
    this.scroll.addEventListener('wheel',e=>{if(!e.ctrlKey)return;e.preventDefault();this.setZoom(this.zoom+(e.deltaY<0?.1:-.1));},{passive:false});
    this.scroll.addEventListener('pointerdown',e=>{if(e.button!==0||e.target.closest('button'))return;this.drag={x:e.clientX,y:e.clientY,left:this.scroll.scrollLeft,top:this.scroll.scrollTop};this.scroll.setPointerCapture(e.pointerId);});
    this.scroll.addEventListener('pointermove',e=>{if(this.drag){this.scroll.scrollLeft=this.drag.left+this.drag.x-e.clientX;this.scroll.scrollTop=this.drag.top+this.drag.y-e.clientY;}});
    this.scroll.addEventListener('pointerup',()=>{this.drag=null;});this.scroll.addEventListener('pointercancel',()=>{this.drag=null;});
    this.resize=new ResizeObserver(()=>{if(this.scroll.clientWidth)this.fitMode==='offers'?this.fitOffers():this.fitAll();});this.resize.observe(this.scroll);
    this.refresh();
  }
  chooseNode(id){const row=this.rows.find(c=>c.id===id);if(this.reward&&row?.offer)this.onCandidate(row.offer-1);else this.focus(id,false);}
  refresh(){
    const g=this.game;this.rows=codexCards(g,this.viewCiv);this.root.querySelector('[data-civ]').value=this.viewCiv||g.civ.id;
    const civ=this.viewCiv||g.civ.id;
    this.root.querySelector('[data-civ-trait]').textContent=tr('currentCiv',{name:t('civ.'+g.civ.id+'.name')})+' · '+t('civ.'+civ+'.trait');
    for(const row of this.rows){const b=this.nodes.get(row.id),match=(this.filters.theme==='all'||row.theme===this.filters.theme)&&(this.filters.rarity==='all'||row.rarity===this.filters.rarity)&&(this.filters.state==='all'||row[this.filters.state==='offered'?'offer':this.filters.state]);
      b.hidden=!match&&!row.offer;b.classList.toggle('is-offered',!!row.offer);b.classList.toggle('is-owned',row.owned);b.classList.toggle('is-recommended',row.recommended);b.classList.toggle('is-focused',row.id===this.focused);
      b.dataset.offer=String(row.offer);b.querySelector('.codex-offer-number').textContent=row.offer?symbols[row.offer-1]:'';
      b.setAttribute('aria-label',[row.offer?symbols[row.offer-1]:'',t('boon.'+row.id+'.name'),row.owned?tr('owned'):'',row.recommended?tr('recommended'):''].filter(Boolean).join(' · '));
    }
    for(const branch of this.graph.children)branch.hidden=![...branch.querySelectorAll('.codex-node')].some(n=>!n.hidden);
    const pins=this.root.querySelector('.codex-offer-pins');pins.replaceChildren();
    for(const row of this.rows.filter(c=>c.offer).sort((a,b)=>a.offer-b.offer)){const b=document.createElement('button');b.type='button';b.textContent=symbols[row.offer-1]+' '+t('boon.'+row.id+'.name');b.dataset.pin=row.id;b.onclick=()=>{this.chooseNode(row.id);this.focus(row.id,true);};pins.append(b);}
    if(!this.focused||!this.rows.some(c=>c.id===this.focused))this.focused=this.rows.find(c=>c.offer)?.id||this.rows.find(c=>c.owned)?.id||this.rows[0]?.id;
    this.focus(this.focused,false);
  }
  focus(id,scroll=true){
    this.focused=id;for(const [key,b]of this.nodes)b.classList.toggle('is-focused',key===id);
    const row=this.rows?.find(c=>c.id===id);if(!row)return;
    const b=this.nodes.get(id);if(b.hidden){for(const k of Object.keys(this.filters)){this.filters[k]='all';this.root.querySelector(`[data-filter="${k}"]`).value='all';}this.refresh();}
    this.detail.innerHTML=`<h3>${esc(t('boon.'+id+'.name'))} <small>${row.code} · ${esc(t('rarity.'+row.rarity))}</small></h3><p>${esc(t('boon.'+id+'.desc'))}</p><p class="codex-advice">${esc(tr('advice.'+adviceKind(row,this.viewCiv)))} ${esc(tr('sharedPool'))}</p>`;
    if(scroll){this.setZoom(Math.max(.8,this.zoom));const bounds=this.bounds([id]);if(bounds){this.scroll.scrollLeft=bounds.x*this.zoom-this.scroll.clientWidth/2+bounds.w*this.zoom/2;this.scroll.scrollTop=bounds.y*this.zoom-this.scroll.clientHeight/2+bounds.h*this.zoom/2;}}
  }
  bounds(ids){const rect=this.graph.getBoundingClientRect(),boxes=ids.map(id=>this.nodes.get(id)).filter(n=>n&&!n.hidden).map(n=>{const r=n.getBoundingClientRect();return{x:(r.left-rect.left)/this.zoom,y:(r.top-rect.top)/this.zoom,w:r.width/this.zoom,h:r.height/this.zoom};});if(!boxes.length)return null;const x=Math.min(...boxes.map(r=>r.x)),y=Math.min(...boxes.map(r=>r.y));return{x,y,w:Math.max(...boxes.map(r=>r.x+r.w))-x,h:Math.max(...boxes.map(r=>r.y+r.h))-y};}
  setZoom(value){this.zoom=Math.max(.35,Math.min(1.8,value));this.graph.style.transform=`scale(${this.zoom})`;this.extent.style.width=this.graph.offsetWidth*this.zoom+'px';this.extent.style.height=this.graph.offsetHeight*this.zoom+'px';this.root.querySelector('[data-zoom]').textContent=Math.round(this.zoom*100)+'%';}
  fit(ids,mode){this.fitMode=mode;if(!this.scroll.clientWidth)return;this.setZoom(1);const r=this.bounds(ids);if(!r)return;this.setZoom(Math.min((this.scroll.clientWidth-24)/(r.w+24),(this.scroll.clientHeight-24)/(r.h+24),1.2));this.scroll.scrollLeft=Math.max(0,r.x*this.zoom-12);this.scroll.scrollTop=Math.max(0,r.y*this.zoom-12);}
  fitOffers(){const ids=this.rows.filter(c=>c.offer).map(c=>c.id);this.fit(ids.length?ids:this.rows.map(c=>c.id),'offers');}
  fitAll(){this.fit(this.rows.filter(c=>!this.nodes.get(c.id).hidden).map(c=>c.id),'all');}
  suspend(){this.drag=null;}
  destroy(){this.resize.disconnect();this.root.replaceChildren();}
}

export function installCodex(game,ui){
  const overlay=ui.el.boon;overlay.classList.add('boon-dual');
  const header=overlay.querySelector('.boon-head'),left=document.createElement('section'),right=document.createElement('section'),layout=document.createElement('div');
  left.className='boon-offer-panel';left.setAttribute('aria-label',tr('offered'));layout.className='boon-dual-layout';right.className='boon-tree-side';
  const list=document.createElement('div');list.className='boon-offers-scroll';list.append(ui.el.boonGrid);
  const actions=document.createElement('div');actions.className='boon-actions';for(const el of[ui.el.claim,ui.el.reroll,ui.$('btn-boon-save'),overlay.querySelector('.boon-hint')])actions.append(el);
  left.append(overlay.querySelector('#boon-history'),list,actions);layout.append(left,right);overlay.append(header,layout);
  let rewardTree=new CardTree(right,game,{reward:true,onCandidate:index=>ui.selectBoon(index)});
  const dialog=document.createElement('dialog');dialog.id='game-codex';dialog.className='game-codex';document.body.append(dialog);
  let wasPaused=false,returnFocus=null,tab='cards',libraryTree=null,techSelection='age-2';
  function close(){libraryTree?.suspend();dialog.close();game.paused=wasPaused;returnFocus?.focus?.();}
  function techDetail(id){
    techSelection=id;const target=dialog.querySelector('.tech-detail');if(!target)return;
    if(id.startsWith('age-')){const level=Number(id.slice(4)),a=ageView(game,level);target.innerHTML=`<h3>${esc(t('age.'+level))} · ${esc(tr(a.status))}</h3><p>${esc(tr('ageDetail',{age:level>1?t('age.'+(level-1)):tr('none'),seconds:a.seconds}))}</p><p>${tr('cost')}: ${esc(costText(a.cost))}</p><button type="button" data-research ${a.status==='available'?'':'disabled'}>${tr('researchAge')}</button>`;target.querySelector('[data-research]').onclick=()=>{if(ageView(game,level).status!=='available')return;game.advanceAge();renderTech();};return;}
    const n=TECH_NODES.find(n=>n.id===id);if(!n)return;
    target.innerHTML=`<h3>${esc(tr('tech.'+id))} · ${esc(tr(n.prototype?'prototype':'control'))}</h3><p>${esc(tr('desc.'+id))}</p><p>${tr('era')}: ${esc(n.tier===0?tr('darkReference'):t('age.'+n.tier))} · ${tr('cost')}: ${esc(tr(n.prototype?'undecided':'free'))}</p><p>${esc(tr(n.prototype?'prototypeHelp':'controlHelp'))}</p>${!n.prototype&&n.branch!=='tactics'?`<button type="button" data-plans>${tr('openPlans')}</button>`:''}`;
    target.querySelector('[data-plans]')?.addEventListener('click',()=>{close();document.getElementById('btn-stewards-hud')?.click();});
  }
  function renderTech(){
    const target=dialog.querySelector('[data-tech]');if(!target)return;
    target.innerHTML=`<p class="codex-tech-note">${tr('eraNote')}</p><nav class="tech-age-chain">${[1,2,3].map(level=>{const a=ageView(game,level);return `<button type="button" data-age="${level}" class="tech-age ${a.status}">${icon('hourglass')}<b>${esc(t('age.'+level))}</b><small>${esc(tr(a.status))}</small></button>`}).join('<span aria-hidden="true">→</span>')}</nav><div class="tech-system-scroll">${TECH_BRANCHES.map(branch=>`<section class="tech-system"><h3>${esc(tr(branch==='economy'?'economy':branch==='military'?'military':'tactics'))}</h3><div class="tech-era-grid">${[0,1,2,3].map(tier=>`<div class="tech-era"><h4>${esc(tier===0?tr('darkReference'):t('age.'+tier))}</h4>${TECH_NODES.filter(n=>n.branch===branch&&n.tier===tier).map(n=>`<button type="button" data-tech-id="${n.id}" class="tech-node ${n.prototype?'is-prototype':'is-control'}">${icon(n.icon)}<b>${esc(tr('tech.'+n.id))}</b><small>${esc(tr(n.prototype?'prototype':'control'))}</small></button>`).join('')}</div>`).join('')}</div></section>`).join('')}</div><article class="tech-detail" aria-live="polite"></article>`;
    for(const b of target.querySelectorAll('[data-tech-id]'))b.onclick=()=>techDetail(b.dataset.techId);
    for(const b of target.querySelectorAll('[data-age]'))b.onclick=()=>techDetail('age-'+b.dataset.age);
    techDetail(techSelection);
  }
  function renderDialog(){
    libraryTree?.destroy();libraryTree=null;
    dialog.innerHTML=`<header class="codex-dialog-head"><h2>${tr('title')}</h2><nav><button type="button" data-tab="cards" aria-pressed="${tab==='cards'}">${tr('cards')}</button><button type="button" data-tab="tech" aria-pressed="${tab==='tech'}">${tr('tech')}</button><button type="button" data-close>${tr('close')}</button></nav></header><section data-library ${tab==='cards'?'':'hidden'}></section><section data-tech ${tab==='tech'?'':'hidden'}></section>`;
    dialog.querySelector('[data-close]').onclick=close;for(const b of dialog.querySelectorAll('[data-tab]'))b.onclick=()=>{tab=b.dataset.tab;renderDialog();};
    if(tab==='cards'){libraryTree=new CardTree(dialog.querySelector('[data-library]'),game);libraryTree.viewCiv=game.civ.id;libraryTree.refresh();requestAnimationFrame(()=>libraryTree?.fitAll());}else renderTech();
  }
  function open(initial='cards'){if(game.inMenu)return;tab=initial;wasPaused=game.paused;returnFocus=document.activeElement;game.paused=true;renderDialog();dialog.showModal();requestAnimationFrame(()=>libraryTree?.fitAll());}
  dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
  const buttons=[];for(const parent of[document.querySelector('.top-actions'),document.querySelector('.pause-actions')]){const b=document.createElement('button');b.type='button';b.className='secondary-button small codex-entry';b.textContent=tr('entry');b.id=buttons.length?'btn-codex-pause':'btn-codex';b.onclick=()=>open();parent.append(b);buttons.push(b);}
  const oldShow=ui.showBoons.bind(ui),oldSelect=ui.selectBoon.bind(ui),oldHide=ui.hideBoons.bind(ui);
  ui.showBoons=(choices,onChoose)=>{oldShow(choices,onChoose);rewardTree.viewCiv=game.civ.id;rewardTree.refresh();if(ui.el.boonHint)ui.el.boonHint.textContent=tr('keys');for(let i=0;i<ui.el.boonGrid.children.length;i++){const b=ui.el.boonGrid.children[i],card=choices[i];b.dataset.boonId=card.id;const p=document.createElement('p');p.className='boon-civ-advice';p.textContent=tr('advice.'+adviceKind(card,game.civ.id));b.append(p);b.setAttribute('aria-pressed','false');}requestAnimationFrame(()=>rewardTree.fitOffers());};
  ui.selectBoon=index=>{oldSelect(index);const card=ui.boonChoices?.[index];if(card){rewardTree.focus(card.id,true);for(let i=0;i<ui.el.boonGrid.children.length;i++)ui.el.boonGrid.children[i].setAttribute('aria-pressed',String(i===index));}};
  ui.hideBoons=()=>{rewardTree.suspend();oldHide();};
  document.addEventListener('localechange',()=>{for(const b of buttons)b.textContent=tr('entry');rewardTree.destroy();const replacement=new CardTree(right,game,{reward:true,onCandidate:index=>ui.selectBoon(index)});rewardTree=replacement;if(ui.boonsOpen)ui.showBoons(game.boonChoices,ui.onBoonChoose);if(dialog.open)renderDialog();});
  return {open,close,dialog,get rewardTree(){return rewardTree;}};
}
