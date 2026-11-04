import { t } from './i18n.js';
import { findPath } from './navigation.js';
import { pointSegmentDist } from './utils.js';
import { BUILD_OPTIONS, UNIT_TYPES, BUILDING_TYPES } from './data.js';

export const RESOURCES = ['food', 'wood', 'gold', 'stone'];
const weights = { balanced:[34,32,22,12], food:[64,16,12,8], wood:[20,56,16,8], gold:[24,20,48,8], stone:[24,24,16,36] };
export function defaultStewards() {
  return { gather:'balanced', ratios:[34,32,22,12], reserve:[0,0,0,0], villagers:22, age:'manual',
    buildings:{}, military:{}, lastMilitaryProducerId:null, army:'balanced', nextPlanAt:0, pending:null, status:'idle' };
}
export function restoreStewards(saved) {
  const s = { ...defaultStewards(), ...structuredClone(saved || {}) };
  for (const key of ['ratios','reserve']) s[key] = RESOURCES.map((_,i)=>Math.max(0,Math.min(100000,Number(s[key]?.[i])||0)));
  s.buildings ||= {}; s.military ||= {};
  return s;
}
export function gatherWeights(s) {
  const v = weights[s.gather] || s.ratios;
  const sum = v.reduce((a,b)=>a+b,0);
  return RESOURCES.map((_,i)=>sum ? v[i]/sum : weights.balanced[i]/100);
}
export function reserveCost(g) {
  const s=g.stewards, result=Object.fromEntries(RESOURCES.map((r,i)=>[r,s.reserve[i]]));
  if (s.age!=='manual' && g.ageLevel<3 && !g.ageResearch) for (const [r,v] of Object.entries(g.ageCost())) result[r]=s.age==='auto'?(result[r]||0)+v:Math.max(result[r]||0,v);
  return result;
}
export function canSpend(g,cost,extra={}) {
  const floor=reserveCost(g);
  return RESOURCES.every(r=>!(cost[r]>0) || (g.resources[r]||0)-cost[r]>=Math.max(floor[r]||0,extra[r]||0));
}
export function assignWorkers(g) {
  const workers=g.units.filter(u=>u.alive&&u.team==='player'&&u.type==='villager');
  const counts=Object.fromEntries(RESOURCES.map(r=>[r,0]));
  const target=gatherWeights(g.stewards);
  for(const u of workers) { const r=u.carryType||u.gatherTarget?.resource; if(r && (u.carry>0||u.state==='gather'||u.state==='return')) counts[r]++; }
  for(const u of workers) {
    if(u.manualEconomy || u.state!=='idle')continue;
    if(u.carry>0){g.beginReturn(u);continue;}
    const total=Object.values(counts).reduce((a,b)=>a+b,0)+1;
    const choices=RESOURCES.map((r,i)=>({r,score:target[i]*total-counts[r]})).sort((a,b)=>b.score-a.score);
    for(const {r} of choices){const node=g.findReachableResource(u,r);if(node){g.orderGather(u,node);u.autoAssignedAt=g.time;counts[r]++;break;}}
  }
  // Rebalance one unlocked, empty-handed worker at a time; keep a 12-sim-second hysteresis.
  const total=Math.max(1,Object.values(counts).reduce((a,b)=>a+b,0));
  const deficit=RESOURCES.map((r,i)=>({r,d:target[i]*total-counts[r]})).sort((a,b)=>b.d-a.d);
  if(deficit[0].d>1){
    const wanted=deficit[0].r;
    for(const u of workers){const old=u.gatherTarget?.resource;
      if(u.manualEconomy||u.carry>0||u.state!=='gather'||!old||old===wanted||g.time-(u.autoAssignedAt||0)<12)continue;
      const index=RESOURCES.indexOf(old);if(counts[old]-target[index]*total<=1)continue;
      const node=g.findReachableResource(u,wanted);if(node){g.orderGather(u,node);u.autoAssignedAt=g.time;break;}
    }
  }

}
export function planBuilding(g,type) {
  if(g.placement || !BUILD_OPTIONS.includes(type) || !canSpend(g,g.buildingCost(type)))return false;
  const workers=g.units.filter(u=>u.alive&&u.team==='player'&&u.type==='villager'&&!u.manualEconomy&&!u.carry&&['idle','gather'].includes(u.state));
  if(!workers.length)return false;
  const oldPlacement=g.placement, oldSelection=g.selection;
  const base=g.world.base,def=BUILDING_TYPES[type],sites=[];
  for(let radius=5;radius<=14;radius+=3)for(let i=0;i<16;i++){
    const a=i*Math.PI/8;
    sites.push({x:Math.round(base.x+Math.cos(a)*radius),y:Math.round(base.y+Math.sin(a)*radius)});
  }
  // Keep existing ring placements first, then cover gaps on the same local grid.
  // Dense map obstacles must not make a safe reachable site invisible forever.
  const known=new Set(sites.map(p=>`${p.x},${p.y}`)),fallback=[];
  for(let y=Math.floor(base.y)-14;y<=Math.ceil(base.y)+14;y++)for(let x=Math.floor(base.x)-14;x<=Math.ceil(base.x)+14;x++){
    if(Math.hypot(x-base.x,y-base.y)<=14&&!known.has(`${x},${y}`))fallback.push({x,y});
  }
  fallback.sort((a,b)=>Math.hypot(a.x-base.x,a.y-base.y)-Math.hypot(b.x-base.x,b.y-base.y)||a.y-b.y||a.x-b.x);
  sites.push(...fallback);
  const cursors=g.stewards.placementCursor ||= {};
  const total=sites.length*workers.length,offset=(cursors[type]||0)%total,checked=new Map();
  let searches=0;
  try {
    for(let step=0;step<total;step++){
      const index=(offset+step)%total,siteIndex=Math.floor(index/workers.length),rank=index%workers.length;
      const {x,y}=sites[siteIndex],destination={x:x+def.w/2,y:y+def.h/2};
      g.placement={type,x,y,valid:false};
      if(!checked.has(siteIndex)){
        // Bound collision/safety probes as well as the existing12 path searches.
        if(checked.size>=64){cursors[type]=index;return false;}
        g.updatePlacementValidity();
        const safe=g.placement.valid
          && !g.world.camps.some(c=>Math.hypot(c.x-x,c.y-y)<9)
          && !g.units.some(e=>e.alive&&e.team==='enemy'&&g.isVisible(e)&&Math.hypot(e.x-x,e.y-y)<9)
          && !g.world.camps.some(c=>pointSegmentDist(destination.x,destination.y,c.x,c.y,base.x,base.y)<1.8+Math.hypot(def.w,def.h)/2);
        checked.set(siteIndex,safe?workers.slice().sort((a,b)=>Math.hypot(a.x-destination.x,a.y-destination.y)-Math.hypot(b.x-destination.x,b.y-destination.y)):null);
      }
      const ordered=checked.get(siteIndex);if(!ordered)continue;
      // 每次最多12次尋路，保存續查位置；不消耗模擬RNG。 / At most12 path searches per call; persist the cursor without consuming simulation RNG.
      if(searches>=12){cursors[type]=index;return false;}
      searches++;
      const worker=ordered[rank],probe={...worker,_nav:null,targetPos:null};
      const walk=(px,py)=>g.isWalkable(px,py,probe);walk.segment=(a,b)=>g.segmentWalkable(a,b,probe);
      const path=findPath(probe,destination,walk,g.world.size,{range:Math.hypot(def.w,def.h)/2+1.8});
      if(path.status!=='ready'&&path.status!=='arrived')continue;
      g.placement.valid=true;g.selection=[worker];
      if(g.placeCurrent()){worker.manualEconomy=false;delete cursors[type];return true;}
    }
    delete cursors[type];return false;
  } finally {g.selection=oldSelection;g.placement=oldPlacement;g.hooks.placement?.(oldPlacement);}
}
// 規劃預估，不改實際人口上限。 / Planning forecast, not an actual cap change.
export function planningMilitaryRoom(g) {
  const pending=g.buildings.reduce((n,b)=>n+(b.alive&&b.team==='player'&&b.construction<1?(b.typeDef?.pop||0):0),0);
  const cap=Math.min(g.popCap+pending,g.effects.militaryPopCap>0?g.effects.militaryPopCap:Infinity);
  return Math.max(0,cap-g.militaryPopulation-g.queuedPopulation(false));
}
function militaryRoomAllows(g,p) {
  return !Number.isFinite(p?.militaryRoom)||p.militaryRoom<0||planningMilitaryRoom(g)<=p.militaryRoom;
}
// 確認與撤回使用相同的現行條件。 / Validate current conditions before
// confirmation or keeping an outstanding proposal.
function buildingProposalValid(g,type,p) {
  if(!BUILD_OPTIONS.includes(type)||p?.mode!=='ask'||g.ageLevel<(p.age||1))return false;
  const workers=g.units.filter(u=>u.alive&&u.team==='player'&&u.type==='villager').length;
  if(workers<(p.workers||0))return false;
  const count=g.buildings.filter(b=>b.alive&&b.team==='player'&&b.type===type).length;
  const max=Math.min(20,Math.max(0,Number(p.max)||0));
  return count<max&&militaryRoomAllows(g,p)&&canSpend(g,g.buildingCost(type));
}
export function updatePlans(g) {
  const s=g.stewards;
  if(g.time<s.nextPlanAt)return;
  s.nextPlanAt=g.time+3;
  s.status='idle';
  if(s.pending?.kind==='age' && (s.age!=='ask' || g.ageResearch || g.ageLevel>=3 || !g.getTownCenter() || !g.canAfford(g.ageCost())))s.pending=null;
  if(s.pending?.kind==='building'&&!buildingProposalValid(g,s.pending.type,s.buildings[s.pending.type]))s.pending=null;
  if(s.age!=='manual' && g.ageLevel<3 && !g.ageResearch && g.getTownCenter() && g.canAfford(g.ageCost())){
    if(s.age==='auto'){
      const cost=g.ageCost();
      if(RESOURCES.every((r,i)=>!(cost[r]>0) || (g.resources[r]||0)-cost[r]>=s.reserve[i])){g.advanceAge();s.pending=null;}
      else s.status='budget';
    }else{if(s.pending?.kind!=='age')g.toast(t('steward.title')+': '+t('steward.confirm')+' — '+t('steward.age'),'',5000);s.pending={kind:'age'};s.status='confirm';}
  }
  const workers=g.units.filter(u=>u.alive&&u.team==='player'&&u.type==='villager').length;
  for(const [type,p]of Object.entries(s.buildings).sort((a,b)=>(b[1].priority||0)-(a[1].priority||0))){
    if(!BUILD_OPTIONS.includes(type)||!['ask','auto'].includes(p.mode)||workers<(p.workers||0)||g.ageLevel<(p.age||1))continue;
    const count=g.buildings.filter(b=>b.alive&&b.team==='player'&&b.type===type).length;
    if(count>=Math.min(20,Math.max(0,p.max||0)))continue;
    if(!militaryRoomAllows(g,p)){s.status='capacity';continue;}
    if(!canSpend(g,g.buildingCost(type))){s.status='budget';continue;}
    if(p.mode==='ask'){if(!s.pending){s.pending={kind:'building',type};g.toast(t('steward.title')+': '+t('steward.confirm')+' — '+t('building.'+type+'.name'),'',5000);}s.status='confirm';continue;}
    s.status=planBuilding(g,type)?'building':'blocked';return;
  }
}
export function confirmPlan(g) {
  const p=g.stewards.pending;if(!p)return false;
  g.stewards.pending=null;
  if(p.kind==='age'){
    if(g.stewards.age!=='ask' || g.ageResearch || g.ageLevel>=3 || !g.getTownCenter() || !g.canAfford(g.ageCost()))return false;
    g.advanceAge();return !!g.ageResearch;
  }
  const setting=g.stewards.buildings[p.type];
  if(!buildingProposalValid(g,p.type,setting))return false;
  return planBuilding(g,p.type);
}
export function trainArmy(g) {
  const s=g.stewards;
  const counts={};for(const u of g.units)if(u.alive&&u.team==='player')counts[u.type]=(counts[u.type]||0)+1;
  for(const b of g.buildings)if(b.alive&&b.team==='player')for(const q of b.queue)counts[q.type]=(counts[q.type]||0)+1;
  const visible=g.units.filter(u=>u.alive&&u.team==='enemy'&&g.isVisible(u));
  // 成功後從下一座接續，保留原本每輪一筆訂單。 / Resume after the last
  // successful producer, retaining the existing one-order-per-cycle limit.
  const buildings=g.buildings,previous=buildings.findIndex(b=>b.id===s.lastMilitaryProducerId);
  const first=previous<0?0:(previous+1)%buildings.length;
  for(let offset=0;offset<buildings.length;offset++){
    const b=buildings[(first+offset)%buildings.length];
    if(!b.alive||b.team!=='player'||b.construction<1||b.type==='core'||b.type==='market')continue;
    const p=s.military[b.id];
    if(p?.enabled===false || (b.manualProductionUntil||0)>g.time || b.queue.some(q=>q.manual))continue;
    const limit=Math.max(1,Math.min(5,p?.queue||1));if(b.queue.length>=limit)continue;
    let choices=p?.units?.length?p.units:g.trainableFor(b).filter(t=>!UNIT_TYPES[t].noAttack);
    choices=choices.filter(t=>g.trainableFor(b).includes(t)&&g.canTrainNow(t));
    const score=t=>{
      const entry=p?.targets?.[t],n=counts[t]||0;
      if(entry && n>=entry.count)return -Infinity;
      let value=(entry?.priority||1)/Math.max(1,n+1);
      if(s.army==='counter'&&visible.length){const probe={type:t,typeDef:UNIT_TYPES[t]};value*=Math.max(...visible.map(e=>g.counterMultiplier(probe,e)));}
      if(s.army==='defense'&&['spearman','skirmisher','guard'].includes(t))value*=2;
      return value;
    };
    choices.sort((a,b)=>score(b)-score(a));
    for(const type of choices){if(!Number.isFinite(score(type)))continue;
      const extra=Object.fromEntries(RESOURCES.map((r,i)=>[r,Number(p?.budget?.[i])||0]));
      if(!canSpend(g,g.unitCost(type),extra)){s.status='budget';continue;}
      const before=b.queue.length;g.trainUnit(b,type,true);if(b.queue.length>before){s.lastMilitaryProducerId=b.id;s.status='training';return;}
    }
    s.status=g.militaryPopulation>=g.militaryPopCap?'population':'blocked';
  }
}

// Read-only explanation for the same production gates used by trainArmy.
// Called when opening the planning UI, never during Canvas rendering.
export function productionStatus(g,b) {
  const p=g.stewards.military[b.id];
  if(!g.autoMilitary || p?.enabled===false)return 'off';
  if(!b.alive || b.construction<1)return 'unavailable';
  if((b.manualProductionUntil||0)>g.time || b.queue.some(q=>q.manual))return 'manual';
  if(b.queue.length>=Math.max(1,Math.min(5,p?.queue||1)))return 'queue';
  const legal=g.trainableFor(b);
  let choices=(p?.units?.length?p.units:legal.filter(t=>!UNIT_TYPES[t].noAttack)).filter(t=>legal.includes(t));
  if(!choices.length)return 'unavailable';
  const counts={};
  for(const u of g.units)if(u.alive&&u.team==='player')counts[u.type]=(counts[u.type]||0)+1;
  for(const producer of g.buildings)if(producer.alive&&producer.team==='player')for(const q of producer.queue)counts[q.type]=(counts[q.type]||0)+1;
  choices=choices.filter(t=>!p?.targets?.[t] || (counts[t]||0)<p.targets[t].count);
  if(!choices.length)return 'target';
  const available=choices.filter(t=>g.canTrainNow(t));
  if(!available.length)return choices.some(t=>!g.hasPopulationRoom(t))?'population':'unavailable';
  const extra=Object.fromEntries(RESOURCES.map((r,i)=>[r,Number(p?.budget?.[i])||0]));
  return available.some(t=>canSpend(g,g.unitCost(t),extra))?'ready':'budget';
}
