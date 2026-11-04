import { t } from './i18n.js';
import { HERO_SKILLS } from './hero-skills.js';

// 使用既有命令介面，不改戰鬥或索敵規則。 / Existing command adapter only.
export function battleArmy(game) {
  return game.units.filter(u=>u.alive&&u.team==='player'&&!u.w&&u.type!=='villager'&&!u.hero&&u.type!=='commander'&&!u.typeDef?.noAttack);
}
export function battleSkillContext(game) {
  const h=game.hero;if(!h?.alive)return {markTarget:null,shieldCount:0};
  return {markTarget:game.nearestEnemyAt(h.x,h.y,HERO_SKILLS.mark.radius),
    shieldCount:game.units.filter(u=>u.alive&&u.team==='player'&&Math.hypot(u.x-h.x,u.y-h.y)<=HERO_SKILLS.aegis.radius).length};
}
export function battleCanAct(game,blocked=false) {
  return !blocked&&!game.inMenu&&!game.paused&&!game.placement&&['prep','wave'].includes(game.phase);
}
export function battleAction(game,action,blocked=false) {
  if(!battleCanAct(game,blocked))return false;
  if(action==='hero'){if(!game.hero?.alive)return false;game.toggleHeroControl();return true;}
  if(action==='mark'||action==='aegis') {
    if(!game.hero?.alive||game.hero[action+'Cd']>0)return false;
    if(action==='mark'&&!battleSkillContext(game).markTarget)return false;
    game.command('hero:'+action);return true;
  }
  if(!['army','advance','guard'].includes(action))return false;
  const army=battleArmy(game);if(!army.length)return false;
  if(game.heroControl)game.toggleHeroControl();
  game.setSelection(army);
  if(action==='army')game.orderMode=null;
  else game.command('order:'+(action==='advance'?'attackMove':'guard'));
  return true;
}
export function installBattleActions(game,ui) {
  const root=document.createElement('section');root.id='battle-actions';root.hidden=true;
  root.innerHTML='<div class="battle-caption"></div><div class="battle-buttons"></div><p class="battle-hint" aria-live="polite"></p>';
  document.querySelector('.center-controls').prepend(root);
  const actions=['army','advance','guard','hero','mark','aegis'],buttons=new Map();
  for(const [i,action]of actions.entries()){
    const b=document.createElement('button');b.type='button';b.dataset.battleAction=action;
    b.innerHTML=`<svg aria-hidden="true"><use href="#i-${['sword','flag','shield','speed','flame','shield'][i]}"></use></svg><span class="battle-label"></span><small></small>`;
    root.querySelector('.battle-buttons').append(b);buttons.set(action,b);
  }
  let signature='',lastPaint=0,previewing=false;
  const blocked=()=>ui.settingsOpen||ui.gmOpen||ui.boonsOpen||ui.pauseOpen||!ui.el.howto.hidden||!!document.querySelector('dialog[open]');
  const clearPreview=()=>{if(previewing){game.clearHeroSkillPreview();previewing=false;}};
  const update=(force=false)=>{
    const hidden=game.inMenu||ui.menuVisible||['boon','victory','defeat'].includes(game.phase)||blocked();
    if(root.hidden!==!!hidden)root.hidden=!!hidden;if(hidden){clearPreview();signature='';return;}
    const now=performance.now();if(!force&&now-lastPaint<90)return;lastPaint=now;
    const context=battleSkillContext(game),army=battleArmy(game),h=game.hero,active=battleCanAct(game),mode=game.orderMode;
    const state=[document.documentElement.lang,army.length,active,h?.alive,Math.ceil(h?.markCd||0),Math.ceil(h?.aegisCd||0),game.heroControl,context.markTarget?.id,context.shieldCount,mode].join('|');
    if(state===signature)return;signature=state;
    root.setAttribute('aria-label',t('battle.title'));root.querySelector('.battle-caption').textContent=t('battle.title');
    for(const action of actions){
      const b=buttons.get(action),skill=action==='mark'||action==='aegis',cd=Math.ceil(h?.[action+'Cd']||0);
      b.disabled=!active||(action==='hero'?!h?.alive:skill?(!h?.alive||cd>0||(action==='mark'&&!context.markTarget)):!army.length);
      const label=skill?t('command.'+action):t('battle.'+action);
      const detail=skill?((action==='mark'?'Q':'E')+' · '+(cd>0?cd+'s':action==='mark'&&!context.markTarget?t('battle.noTarget'):action==='aegis'?t('battle.shieldCount',{count:context.shieldCount}):t('battle.ready'))):action==='hero'?(game.heroControl?t('battle.direct'):'Tab'):action==='army'?String(army.length)+' · F2':action==='advance'?'Shift+A':'G';
      b.querySelector('.battle-label').textContent=label;b.querySelector('small').textContent=detail;
      b.title=skill?t('command.'+action+'Tooltip'):t('battle.'+action+'Help');
      b.setAttribute('aria-label',label+' — '+detail);
      b.classList.toggle('is-ready',skill&&active&&h?.alive&&cd<=0&&(action!=='mark'||!!context.markTarget));
      b.classList.toggle('is-active',action==='advance'&&mode==='attackMove'||action==='guard'&&mode==='guard'||action==='hero'&&game.heroControl);
    }
    root.querySelector('.battle-hint').textContent=!active?t('battle.paused'):mode==='attackMove'?t('battle.advanceHelp'):mode==='guard'?t('battle.guardHelp'):game.heroControl?t('battle.heroHelp'):t('battle.hint');
  };
  for(const action of actions){
    const b=buttons.get(action);
    b.addEventListener('click',()=>{clearPreview();battleAction(game,action,blocked());update(true);});
    if(action==='mark'||action==='aegis'){
      const preview=()=>{if(battleCanAct(game,blocked())&&game.hero?.alive){previewing=game.previewHeroSkill(action);}};
      b.addEventListener('pointerenter',preview);b.addEventListener('focus',preview);
      b.addEventListener('pointerleave',clearPreview);b.addEventListener('blur',clearPreview);
    }
  }
  window.addEventListener('keydown',e=>{
    if(e.key!=='F2'||e.repeat||e.ctrlKey||e.altKey||e.metaKey||e.target?.closest?.('input,select,textarea,[contenteditable=true]')||!battleCanAct(game,blocked()))return;
    e.preventDefault();battleAction(game,'army');update(true);
  });
  const original=ui.update.bind(ui);ui.update=(...args)=>{original(...args);update();};
  document.addEventListener('localechange',()=>update(true));update(true);
  return {update};
}
