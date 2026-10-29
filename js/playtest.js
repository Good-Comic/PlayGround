import { getLocale, t } from './i18n.js';
import { hasSavedRun } from './save.js';

const numeric=n=>Number.isFinite(n)?n:null;
const id=s=>typeof s==='string'&&/^[a-zA-Z0-9_-]{1,40}$/.test(s)?s:'unknown';
export function safeError(error={}) {
  const name=['Error','TypeError','RangeError','ReferenceError','SyntaxError','SecurityError'].includes(error.name)?error.name:'Error';
  const text=String(error.message||'');
  const category=/negative|radius/i.test(text)?'Invalid geometry':/undefined|null/i.test(text)?'Invalid object reference':/network|fetch/i.test(text)?'Resource request failed':'Runtime exception';
  return {name,message:category+' (raw details omitted for privacy)'};
}
export function makeBugReport(game,settings,build,errors=[],browser={}) {
  const ua=String(browser.userAgent||'');
  const browserMatch=ua.match(/(Edg|Firefox|Chrome|Version)\/(\d+(?:\.\d+){0,3})/);
  const os=/Windows/.test(ua)?'Windows':/Android/.test(ua)?'Android':/iPhone|iPad/.test(ua)?'iOS':/Mac OS/.test(ua)?'macOS':/Linux/.test(ua)?'Linux':'unknown';
  const units=(game.units||[]).filter(u=>u.alive);
  return {
    schemaVersion:1,exportedAt:new Date().toISOString(),
    build:{id:build.id,commit:build.commit,status:build.status,builtAt:build.builtAt,resourceVerification:build.resourceVerification},
    run:{seed:numeric(game.seed),mapGenerationVersion:numeric(game.world?.generationVersion),difficulty:id(game.difficulty),cycle:numeric(game.cycle),inheritedBoons:(game.inheritedBoons||[]).slice(0,3).map(id),civilization:id(game.civ?.id),map:id(game.biome?.id),wave:numeric(game.waveIndex+1),phase:id(game.phase),simulationSeconds:numeric(game.runTime)},
    settings:{showControlGroups:settings.showControlGroups!==false,uiScale:numeric(settings.uiScale||1),gameSpeed:numeric(settings.gameSpeed),autoEconomy:!!settings.autoEconomy,autoMilitary:!!settings.autoMilitary,reducedMotion:!!settings.reducedMotion,locale:id(settings.locale)},
    population:{military:numeric(game.militaryPopulation),militaryCap:numeric(game.militaryPopCap),economic:numeric(game.economicPopulation),economicCap:numeric(game.economicPopCap),activeUnits:units.length},
    resources:Object.fromEntries(['food','wood','gold','stone'].map(k=>[k,numeric(game.resources?.[k])])),
    browser:{name:browserMatch?.[1]||'unknown',version:browserMatch?.[2]||'unknown',os,width:numeric(browser.width),height:numeric(browser.height),dpr:numeric(browser.dpr)},
    errors:errors.slice(-20).map(safeError),
    state:{units:units.slice(0,40).map(u=>({id:numeric(u.id),type:id(u.type),team:id(u.team),state:id(u.state),x:numeric(u.x),y:numeric(u.y),hp:numeric(u.hp),target:numeric(u.target?.id),path:id(u._nav?.status)})),sampledUnits:Math.min(40,units.length),queueItems:(game.buildings||[]).reduce((n,b)=>n+(b.queue?.length||0),0)},
    privacy:'No cookies, storage dump, account/name, URL/referrer, raw console/stack, save file or free-text included. Review this JSON before sharing.'
  };
}
export async function verifyBuild(meta,fetcher=fetch) {
  if(!/^[a-f0-9]{40}$/.test(meta.commit)||meta.status!=='PLAYTEST-EXPERIMENTAL'||typeof meta.builtAt!=='string')throw Error('Invalid candidate metadata');
  const entries=Object.entries(meta.files||{});
  if(!entries.some(([p])=>p==='js/main.js')||!entries.some(([p])=>p==='index.html'))throw Error('Incomplete candidate manifest');
  for(const [path,expected] of entries){
    if(!/^[a-zA-Z0-9_./-]+$/.test(path)||path.includes('..')||path.startsWith('/')||!/^[a-f0-9]{64}$/.test(expected))throw Error('Invalid candidate resource path');
    const response=await fetcher(new URL('../'+path,import.meta.url),{cache:'no-store'});if(!response.ok)throw Error('Candidate resource missing');
    const digest=await crypto.subtle.digest('SHA-256',await response.arrayBuffer());const actual=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
    if(actual!==expected)throw Error('Candidate resource integrity mismatch');
  }
  return entries.length;
}
// Use verified artifact identity rather than the historical hard-coded v1 label.
export function buildIdentity(meta, count) {
  const label = typeof meta.id === 'string' && /^[a-zA-Z0-9_.-]{1,80}$/.test(meta.id) ? meta.id : 'riftwatch-playtest';
  return Object.freeze({id:label,commit:meta.commit,status:meta.status,builtAt:meta.builtAt,resourceVerification:`SHA256_MATCH_${count}_FILES`});
}
export async function installPlaytest({game,ui}) {
  ui.playtestReady=false;
  const start=document.getElementById('btn-start'),cont=document.getElementById('btn-continue');
  const setDisabled=value=>{start.disabled=value;cont.disabled=value||!hasSavedRun();};setDisabled(true);
  const errors=[];addEventListener('error',e=>errors.push(safeError(e.error||{})));addEventListener('unhandledrejection',e=>errors.push(safeError(e.reason||{})));
  const root=document.createElement('aside');root.id='playtest-tools';
  const toggle=document.createElement('button');toggle.id='playtest-info-toggle';toggle.textContent='PLAYTEST · Loading…';root.append(toggle);
  const dialog=document.createElement('dialog');dialog.id='playtest-dialog';
  const title=document.createElement('h2'),version=document.createElement('pre'),known=document.createElement('a'),download=document.createElement('button'),close=document.createElement('button'),privacy=document.createElement('p');
  known.href=new URL('../KNOWN-ISSUES.html',import.meta.url).href;known.target='_blank';known.rel='noopener';download.id='playtest-download';close.id='playtest-close';privacy.className='playtest-privacy';dialog.append(title,version,known,privacy,download,close);root.append(dialog);document.body.append(root);
  const translate=()=>{title.textContent=t('playtest.title');known.textContent=t('playtest.known');download.textContent=t('playtest.export');close.textContent=t('playtest.close');privacy.textContent=t('playtest.privacy');};translate();document.addEventListener('localechange',translate);
  toggle.addEventListener('click',()=>dialog.showModal());close.addEventListener('click',()=>dialog.close());
  try{
    const response=await fetch(new URL('../build-metadata.json',import.meta.url),{cache:'no-store'});if(!response.ok)throw Error('Candidate metadata missing');const meta=await response.json();
    const count=await verifyBuild(meta);const build=buildIdentity(meta,count);
    const sourceLabel=document.getElementById('build-version');if(sourceLabel)sourceLabel.textContent=build.id;document.documentElement.dataset.buildId=build.id;
    window.ageOfAsh.playtestBuild=build;toggle.textContent='PLAYTEST · '+build.commit.slice(0,7);version.textContent=`${build.id}\n${build.status}\n${build.commit}\n${build.builtAt}\n${build.resourceVerification}`;document.documentElement.dataset.playtestSha=build.commit;
    download.addEventListener('click',()=>{const report=makeBugReport(game,{...ui.settings,locale:getLocale()},build,errors,{userAgent:navigator.userAgent,width:innerWidth,height:innerHeight,dpr:devicePixelRatio});const blob=new Blob([JSON.stringify(report,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`riftwatch-bug-${build.commit.slice(0,7)}-${game.seed||'menu'}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
    ui.playtestReady=true;setDisabled(false);
  }catch(error){version.textContent='BUILD_INTEGRITY_BLOCKED: '+safeError(error).message;toggle.textContent='PLAYTEST · BUILD BLOCKED';download.disabled=true;window.ageOfAsh.playtestBlocked=true;}
}
