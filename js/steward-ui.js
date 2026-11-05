import { t } from './i18n.js';
import { BUILD_OPTIONS, UNIT_TYPES } from './data.js';
import { RESOURCES, restoreStewards, reserveCost, confirmPlan, productionStatus, planningMilitaryRoom, gatherWeights, workerAllocation } from './stewards.js';

export function installStewardUI(game) {
  const button=document.createElement('button');button.id='btn-stewards';button.className='secondary-button small';
  document.querySelector('.pause-actions').prepend(button);
  const hudButton=button.cloneNode();hudButton.id='btn-stewards-hud';document.querySelector('.top-actions').prepend(hudButton);
  const dialog=document.createElement('dialog');dialog.id='steward-dialog';dialog.className='steward-dialog';document.body.append(dialog);
  let wasPaused=false,notice=false;
  const tr=k=>t('steward.'+k);
  const label=(key,input)=>`<label>${tr(key)} ${input}</label>`;
  const number=(name,v,min=0,max=100000)=>`<input type="number" name="${name}" value="${v}" min="${min}" max="${max}" step="1">`;
  const optionalNumber=(name,v)=>`<input type="number" name="${name}" value="${Number.isFinite(v)?v:''}" min="0" max="100000" step="0.5" placeholder="${tr('unlimited')}" aria-label="${tr('room')}">`;
  const select=(name,value,items)=>`<select name="${name}">${items.map(([v,text])=>`<option value="${v}" ${v===value?'selected':''}>${text}</option>`).join('')}</select>`;
  const options=keys=>keys.map(k=>[k,tr(k)]);
  const close=()=>{dialog.close();game.paused=wasPaused;};
  function render(){
    const s=game.stewards, floor=reserveCost(game);
    button.textContent=tr('title');
    dialog.innerHTML=`<form method="dialog"><h2>${tr('title')}</h2><p>${tr('help')}</p>
    <p>${tr('reserve')}: ${RESOURCES.map(r=>`${t('resourceType.'+r)} ${Math.floor(floor[r])}`).join(' · ')} | ${tr(s.status||'idle')}</p>
    <fieldset><legend>${tr('economy')}</legend><div id="steward-workforce"></div>
    ${label('gather',select('gather',s.gather,options(['balanced','food','wood','gold','stone','custom'])))}
    <div class="steward-grid">${RESOURCES.map((r,i)=>`<label>${t('resourceType.'+r)} % ${number('ratio'+i,s.ratios[i],0,100)}</label><label>${tr('reserve')} ${t('resourceType.'+r)} ${number('reserve'+i,s.reserve[i])}</label>`).join('')}</div>
    <p id="steward-gather-preview" role="status" aria-live="polite"></p><p>${tr('gatherPreviewHelp')}</p>
    ${label('villagers',number('villagers',s.villagers,0,200))}
    ${label('age',select('age',s.age,options(['manual','ask','auto'])))}
    <button type="button" id="steward-release">${tr('release')}</button></fieldset>
    <fieldset><legend>${tr('buildings')}</legend><p>${tr('buildHelp')}</p><p data-military-room>${tr('roomNow')}: ${planningMilitaryRoom(game)}. ${tr('roomHelp')}</p><div class="steward-scroll"><table><thead><tr>${['type','mode','max','priority','workers','age','room'].map(k=>`<th>${tr(k)}</th>`).join('')}</tr></thead><tbody>${BUILD_OPTIONS.map(type=>{const p=s.buildings[type]||{};return `<tr data-build="${type}"><th>${t('building.'+type+'.name')}</th><td>${select(type+'mode',p.mode||'off',options(['off','ask','auto']))}</td><td>${number(type+'max',p.max||0,0,20)}</td><td>${number(type+'priority',p.priority||0,0,100)}</td><td>${number(type+'workers',p.workers||0,0,200)}</td><td>${number(type+'age',p.age||1,1,3)}</td><td>${optionalNumber(type+'room',p.militaryRoom)}</td></tr>`}).join('')}</tbody></table></div></fieldset>
    <fieldset><legend>${tr('military')}</legend>
    ${label('army',select('army',s.army,options(['balanced','counter','defense','custom'])))}
    <p>${tr('milHelp')}</p>${game.buildings.filter(b=>b.alive&&b.team==='player'&&b.type!=='core'&&b.type!=='market'&&game.trainableFor(b).length).map(b=>{const p=s.military[b.id]||{};return `<details data-producer="${b.id}"><summary>${t('building.'+b.type+'.name')} #${b.id} (${b.queue.length}/5)</summary><p class="producer-status" data-production-status="${productionStatus(game,b)}">${tr('producer.label')}: ${tr('producer.'+productionStatus(game,b))}</p><label><input type="checkbox" name="enabled${b.id}" ${p.enabled!==false?'checked':''}>${tr('auto')}</label> ${label('queue',number('queue'+b.id,p.queue||1,1,5))}
    <div>${RESOURCES.map((r,i)=>`<label>${tr('reserve')} ${t('resourceType.'+r)} ${number('budget'+b.id+'_'+i,p.budget?.[i]||0)}</label>`).join('')}</div>
    ${game.trainableFor(b).map(type=>{const e=p.targets?.[type];return `<div data-unit="${type}"><label><input type="checkbox" name="unit${b.id}_${type}" ${(!p.units||p.units.includes(type))?'checked':''}>${t('unit.'+type+'.name')}</label> ${tr('max')} ${number('target'+b.id+'_'+type,e?.count??200,0,200)} ${tr('priority')} ${number('weight'+b.id+'_'+type,e?.priority||1,1,100)} ${game.trainingRestriction(type)?t('training.ageRequired',{age:t('age.'+(UNIT_TYPES[type]?.minAge||3))}):''}</div>`}).join('')}</details>`}).join('')}
    </fieldset><p>${tr('confirmHelp')}</p><p id="steward-notice" class="steward-notice" role="alert" ${notice?'':'hidden'}>${notice?tr('stalePlan'):''}</p>
    <div class="steward-controls"><button type="button" id="steward-confirm" ${s.pending?'':'disabled'}>${tr('confirm')} ${s.pending?.kind==='building'?t('building.'+s.pending.type+'.name'):s.pending?tr('age'):''}</button>
    <button type="submit" id="steward-apply">${tr('apply')}</button><button type="button" id="steward-close">${tr('close')}</button></div></form>`;
    const form=dialog.querySelector('form');
    const renderWorkforce=()=>{
      const view=workerAllocation(game);
      const release=dialog.querySelector('#steward-release');
      release.disabled=view.idleManual===0;release.textContent=tr('release')+' ('+view.idleManual+')';
      dialog.querySelector('#steward-workforce').innerHTML=`<p>${tr('allocation')}: ${RESOURCES.map(r=>`<span data-worker-resource="${r}" data-count="${view.resources[r]}">${t('resourceType.'+r)}: ${view.resources[r]}</span>`).join(' · ')} · <span data-worker-other data-count="${view.other}">${tr('workerOther')}: ${view.other}</span></p>
      <p>${['total','manual','unlocked','carrying','idle'].map(k=>`<span data-worker-status="${k}" data-count="${view[k]}">${tr('worker.'+k)}: ${view[k]}</span>`).join(' · ')}</p><p>${tr('allocationHelp')}</p>`;
    };
    renderWorkforce();
    const preview=()=>{
      const ratios=RESOURCES.map((_,i)=>Math.max(0,Number(form.elements['ratio'+i].value)||0));
      const shares=gatherWeights({gather:form.elements.gather.value,ratios});
      const output=dialog.querySelector('#steward-gather-preview');
      output.textContent=tr('gatherPreview')+': '+RESOURCES.map((r,i)=>t('resourceType.'+r)+' '+(shares[i]*100).toFixed(1)+'%').join(' · ');
      output.dataset.shares=JSON.stringify(shares);
    };
    form.addEventListener('input',preview);form.addEventListener('change',preview);preview();
    const save=()=>{const f=new FormData(form), n=k=>Math.max(0,Number(f.get(k))||0);const next=restoreStewards(s);
      next.gather=f.get('gather');next.ratios=RESOURCES.map((_,i)=>n('ratio'+i));next.reserve=RESOURCES.map((_,i)=>n('reserve'+i));next.villagers=Math.min(200,n('villagers'));next.age=f.get('age');next.army=f.get('army');next.pending=null;next.nextPlanAt=game.time;
      for(const type of BUILD_OPTIONS)next.buildings[type]={mode:f.get(type+'mode'),max:Math.min(20,n(type+'max')),priority:n(type+'priority'),workers:n(type+'workers'),age:Math.max(1,Math.min(3,n(type+'age'))),militaryRoom:f.get(type+'room')===''?null:Math.min(100000,n(type+'room'))};
      for(const el of form.querySelectorAll('[data-producer]')){const b=game.buildings.find(b=>String(b.id)===el.dataset.producer);if(!b)continue;const units=game.trainableFor(b).filter(type=>f.has('unit'+b.id+'_'+type));next.military[b.id]={enabled:f.has('enabled'+b.id)&&units.length>0,queue:Math.max(1,Math.min(5,n('queue'+b.id))),budget:RESOURCES.map((_,i)=>n('budget'+b.id+'_'+i)),units,targets:Object.fromEntries(units.map(type=>[type,{count:Math.min(200,n('target'+b.id+'_'+type)),priority:Math.max(1,n('weight'+b.id+'_'+type))}]))};}
      game.stewards=next;
    };
    form.addEventListener('submit',e=>{e.preventDefault();save();close();});
    dialog.querySelector('#steward-close').onclick=close;
    dialog.querySelector('#steward-release').onclick=()=>{for(const u of game.units)if(u.alive&&u.team==='player'&&u.type==='villager'&&u.state==='idle')u.manualEconomy=false;renderWorkforce();};
    dialog.querySelector('#steward-confirm').onclick=()=>{notice=!confirmPlan(game);render();if(notice){dialog.querySelector('#steward-notice').scrollIntoView({block:'nearest'});dialog.querySelector('#steward-close').focus();}};
  }
  button.onclick=hudButton.onclick=()=>{if(game.inMenu)return;wasPaused=game.paused;notice=false;game.paused=true;render();dialog.showModal();};
  dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
  document.addEventListener('localechange',()=>{button.textContent=hudButton.textContent=tr('title');if(dialog.open)render();});
  button.textContent=hudButton.textContent=tr('title');
}
