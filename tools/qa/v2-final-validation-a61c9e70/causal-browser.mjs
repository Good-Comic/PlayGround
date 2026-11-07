// 受控瀏覽器驗收；凍結更新只供同步觀察，不代表自然玩家流程。
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { resolve, join, extname } from 'node:path';
import { createHash } from 'node:crypto';
const { chromium } = createRequire('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/package.json')('playwright-core');
const [beforeArg, afterArg, outArg] = process.argv.slice(2);
if (!beforeArg || !afterArg || !outArg) throw Error('Usage: beforeBuild afterBuild freshOut');
const before=resolve(beforeArg), after=resolve(afterArg), out=resolve(outArg);
if(existsSync(out))throw Error('輸出必須是全新目錄');mkdirSync(out,{recursive:true});
const stable=x=>JSON.stringify(x,(k,v)=>k==='savedAt'?undefined:v);
const sha=x=>createHash('sha256').update(x).digest('hex'), checks=[], errors=[], consoleLog=[], metadata={}, observations={};
const check=(name,pass,detail)=>{checks.push({name,status:pass?'PASS':'FAIL',detail});};
const note=(name,detail)=>checks.push({name,status:'NOT_TESTED',detail});
const json=(name,x)=>writeFileSync(join(out,name),JSON.stringify(x,null,2)+'\n');
const saveDir='/workspace/riftwatch-fun-lab-v2-8e41d6b2/formal/private-observer/C/after';
const savePath=join(saveDir,readdirSync(saveDir).find(x=>/^native-save-.*\.json$/.test(x))), raw=readFileSync(savePath,'utf8');
metadata.originalSave={path:savePath,sha256:sha(raw),bytes:Buffer.byteLength(raw),mode:'ORIGINAL_C_RAW_SAVE_LOCALSTORAGE_NATIVE_CONTINUE'};
const manifests={};
for(const [kind,dir,n]of[['before',before,167],['after',after,168]]){const m=JSON.parse(readFileSync(join(dir,'build-metadata.json')));manifests[kind]=m;const bad=Object.entries(m.files).filter(([p,h])=>sha(readFileSync(join(dir,p)))!==h);check(kind+'完整資源 SHA',bad.length===0&&Object.keys(m.files).length===n,{expected:n,actual:Object.keys(m.files).length,bad});metadata[kind]={root:dir,manifest:m};}
if(checks.some(x=>x.status==='FAIL')){json('REPORT.json',{metadata,checks});throw Error('hashgate failed');}
let browser;
const snap=()=>{const g=ageOfAsh.game;return {snapshot:g.snapshot(),rng:g.rng.state,visualRng:g.visualRng.state,selection:g.selection.map(u=>u.id),units:g.units.map(u=>({id:u.id,orderFailure:u.orderFailure,target:u.target?.id||u.target,manualAttack:u.manualAttack,hp:u.hp,x:u.x,y:u.y})),camera:{...g.camera},heroControl:g.heroControl,orderMode:g.orderMode};};
async function open(kind){const dir=kind==='before'?before:after,c=await browser.newContext({viewport:{width:1440,height:900},recordVideo:{dir:join(out,kind+'-video'),size:{width:1440,height:900}}});await c.route('http://localhost/**',async route=>{const u=new URL(route.request().url());let p=resolve(dir,'.'+decodeURIComponent(u.pathname==='/'?'/index.html':u.pathname));if(!p.startsWith(dir+'/'))return route.abort();try{const types={'.js':'text/javascript','.html':'text/html','.css':'text/css','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.webp':'image/webp','.wav':'audio/wav','.mp3':'audio/mpeg'};await route.fulfill({body:readFileSync(p),contentType:types[extname(p)]||'application/octet-stream'});}catch(e){errors.push({kind,request:u.pathname,error:e.message});await route.fulfill({status:404,body:'missing'});}});await c.addInitScript(raw=>{if(!localStorage.getItem('riftwatch.playtest.v227.run.v1'))localStorage.setItem('riftwatch.playtest.v227.run.v1',raw);},raw);const p=await c.newPage();p.on('pageerror',e=>errors.push({kind,pageerror:e.message}));p.on('console',m=>consoleLog.push({kind,type:m.type(),text:m.text()}));await p.goto('http://localhost/');await p.waitForFunction(n=>ageOfAsh?.playtestBuild?.resourceVerification===`SHA256_MATCH_${n}_FILES`,kind==='before'?167:168);check(kind+'瀏覽器來源',await p.evaluate(commit=>ageOfAsh.playtestBuild.commit===commit,manifests[kind].commit));await p.evaluate(()=>document.querySelector('#btn-continue').addEventListener('click',()=>{const g=ageOfAsh.game;window.__initial={snapshot:g.snapshot(),rng:g.rng.state,visualRng:g.visualRng.state};window.__realUpdate=g.update;g.update=()=>{};}));await p.locator('#btn-continue').click();observations[kind+'Initial']=await p.evaluate(()=>__initial);await p.screenshot({path:join(out,kind+'-native-continue.png')});return {c,p};}
try{browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});metadata.browser=browser.version();const b=await open('before');check('before無新增面板',await b.p.locator('#recorded-order-group').count()===0);await b.c.close();const {c,p}=await open('after');check('after有新增面板',await p.locator('#recorded-order-group').count()===1);check('同原始存檔同步初始狀態及兩RNG',stable(observations.beforeInitial)===stable(observations.afterInitial),{mode:'CONTROLLED_SYNCHRONOUS_CAPTURE_UPDATE_FREEZE',historicalStrictRngRestore:'FAIL_RETAINED_NOT_REPAIRED'});
await p.evaluate(async()=>{
 const g=ageOfAsh.game;const {battleArmy}=await import('/js/battle-actions.js');
 window.__startSnapshot=g.snapshot();window.__army=battleArmy(g);window.__fixture=()=>{g.inMenu=false;g.paused=false;g.heroControl=false;g.orderMode=null;g.placement=null;ageOfAsh.ui.pauseOpen=false;ageOfAsh.ui.menuVisible=false;__army=battleArmy(g);__army.forEach(u=>delete u.orderFailure);__army[0].orderFailure='congested';__army[1].orderFailure='unreachable';g.setSelection([...__army.slice(0,3),g.hero]);ageOfAsh.ui.update(g);ageOfAsh.ui.recordedOrderGroup.update(true);};
 __fixture();window.__sets=[];window.__commands=[];window.__damage=[];
 const set=g.setSelection,cmd=g.issueCommand,damage=g.applyDamage;
 g.setSelection=function(us,...args){__sets.push(us.map(u=>u.id));return set.call(this,us,...args);};
 g.issueCommand=function(...args){const result=cmd.apply(this,args);__commands.push({sim:this.runTime,args,selection:this.selection.map(u=>({id:u.id,state:u.state,target:u.target?.id,manualAttack:u.manualAttack,targetPos:u.targetPos?{...u.targetPos}:null}))});return result;};
 g.applyDamage=function(target,amount,source,...args){const row={sim:this.runTime,sourceId:source?.id,targetId:target?.id,sourceTargetId:source?.target?.id,manualAttack:source?.manualAttack,before:target?.hp,amount};const result=damage.call(this,target,amount,source,...args);row.after=target?.hp;__damage.push(row);return result;};
});
await p.waitForTimeout(180);const pre=await p.evaluate(snap);await p.locator('#recorded-order-group button').click();const post=await p.evaluate(snap);const calls=await p.evaluate(()=>({sets:__sets,commands:__commands,expected:__army.slice(0,2).map(u=>u.id)}));check('原生滑鼠重選正確組且零軍令',calls.sets.length===1&&stable(calls.sets[0])===stable(calls.expected)&&calls.commands.length===0,calls);delete pre.selection;delete post.selection;delete pre.snapshot.selection;delete post.snapshot.selection;check('重選保留模擬資源HP雙RNG',stable(pre)===stable(post),{pre,post});await p.screenshot({path:join(out,'native-select-group.png')});
const move=await p.evaluate(()=>{
 const g=ageOfAsh.game,r=ageOfAsh.renderer,us=g.selection,center=us.reduce((v,u)=>({x:v.x+u.x/us.length,y:v.y+u.y/us.length}),{x:0,y:0});
 g.focusAt(center.x,center.y);g.camera.x=g.camera.targetX;g.camera.y=g.camera.targetY;
 let target;const candidates=[];
 for(const [dx,dy] of [[0,-2],[-2,0],[2,0],[0,2],[-1,-1],[1,-1]]){
 const t={x:center.x+dx,y:center.y+dy};candidates.push({t,walk:us.map(u=>g.segmentWalkable(u,{x:t.x+u.x-center.x,y:t.y+u.y-center.y},u)),screen:r.screen(g,t.x,t.y),tag:document.elementFromPoint(r.screen(g,t.x,t.y).x,r.screen(g,t.x,t.y).y)?.tagName,pick:g.pickAt(r.screen(g,t.x,t.y).x,r.screen(g,t.x,t.y).y)?.id});if(us.every(u=>g.segmentWalkable(u,{x:t.x+u.x-center.x,y:t.y+u.y-center.y},u))){const s=r.screen(g,t.x,t.y);const el=document.elementFromPoint(s.x,s.y);if(s.y>160&&s.y<580&&el?.tagName==='CANVAS'&&g.pickAt(s.x,s.y)?.team!=='enemy'){target=t;break;}}
 }
 if(!target)throw Error('沒有符合原生可行走及無覆蓋的移動fixture落點:'+JSON.stringify(candidates));
 return {initial:us.map(u=>({id:u.id,x:u.x,y:u.y})),target,screen:r.screen(g,target.x,target.y)};
});
await p.mouse.click(move.screen.x,move.screen.y,{button:'right'});
const moveOrder=await p.evaluate(()=>({commands:__commands,units:ageOfAsh.game.selection.map(u=>({id:u.id,state:u.state,targetPos:u.targetPos?{...u.targetPos}:null}))}));
check('原生移動同步接受指定組',moveOrder.commands.length===1&&moveOrder.units.length===2&&moveOrder.units.every(u=>u.state==='move'&&u.targetPos),moveOrder);
await p.evaluate(()=>ageOfAsh.game.update=__realUpdate);const trace=[];
for(let i=0;i<35;i++){await p.waitForTimeout(80);trace.push(await p.evaluate(()=>({sim:ageOfAsh.game.runTime,units:ageOfAsh.game.selection.map(u=>({id:u.id,x:u.x,y:u.y,state:u.state,target:u.target?.id,targetPos:u.targetPos?{...u.targetPos}:null,orderFailure:u.orderFailure}))})));if(trace.at(-1).units.every(u=>{const old=moveOrder.units.find(v=>v.id===u.id);return Math.hypot(u.x-old.targetPos.x,u.y-old.targetPos.y)<.65;}))break;}
await p.evaluate(()=>ageOfAsh.game.update=()=>{});
const progress=moveOrder.units.map(u=>{const a=move.initial.find(v=>v.id===u.id),start=Math.hypot(a.x-u.targetPos.x,a.y-u.targetPos.y);const distances=trace.map(t=>{const v=t.units.find(v=>v.id===u.id);return Math.hypot(v.x-u.targetPos.x,v.y-u.targetPos.y);});return{id:u.id,start,min:Math.min(...distances),arrived:Math.min(...distances)<.65};});
check('同組沿指定移動落點實際進展與抵達',progress.every(x=>x.min<x.start-.1&&x.arrived),{move,moveOrder,progress,trace});await p.screenshot({path:join(out,'native-move-trace-end.png')});
// 回到同原生存檔初始場景，受控只添加歷史記錄及一名原生敵人；不修改戰鬥規則。
await p.evaluate(()=>{const g=ageOfAsh.game;g.restore(__startSnapshot);g.update=()=>{};__fixture();__sets.length=0;__commands.length=0;__damage.length=0;});await p.waitForTimeout(180);await p.locator('#recorded-order-group button').click();
const enemy=await p.evaluate(()=>{const g=ageOfAsh.game,us=g.selection,r=ageOfAsh.renderer,u=us[0];g.focusAt(u.x,u.y);g.camera.x=g.camera.targetX;g.camera.y=g.camera.targetY;let pos;
 for(let d=1;d<=3&&!pos;d+=.4)for(const [dx,dy]of [[0,-d],[-d,0],[d,0],[0,d],[-d,-d],[d,-d]]){const x=u.x+dx,y=u.y+dy,probe={x,y,alive:true,team:'enemy'};if(g.isWalkable(x,y,u)&&g.isVisible(probe)&&g.segmentWalkable(u,{x,y},u)&&g.units.every(v=>!v.alive||Math.hypot(v.x-x,v.y-y)>.65)){const s=r.screen(g,x,y);const el=document.elementFromPoint(s.x,s.y-18*g.camera.zoom);if(el?.tagName==='CANVAS'&&s.y>180&&s.y<570){pos={x,y};break;}}}
 if(!pos)throw Error('找不到原生正常視野內可點擊敵人位置');const e=g.spawnUnit('militia',pos.x,pos.y,'enemy');window.__enemy=e;const foot=r.screen(g,e.x,e.y),point={x:foot.x,y:foot.y-18*g.camera.zoom};return{id:e.id,hp:e.hp,pos,point,visible:g.isVisible(e),pickId:g.pickAt(point.x,point.y)?.id,selectedIds:us.map(u=>u.id),sim:g.runTime};});
check('敵人正常視野與原生pickAt精確同ID',enemy.visible&&enemy.pickId===enemy.id,enemy);if(!enemy.visible||enemy.pickId!==enemy.id)throw Error('敵人可見/pick前置未通過，不進攻擊PASS');
await p.mouse.click(enemy.point.x,enemy.point.y,{button:'right'});const attackOrder=await p.evaluate(()=>({commands:__commands,units:ageOfAsh.game.selection.map(u=>({id:u.id,state:u.state,targetId:u.target?.id,manualAttack:u.manualAttack}))}));
check('原生右鍵攻擊接受特定敵人',attackOrder.commands.length===1&&attackOrder.units.length===2&&attackOrder.units.every(u=>u.targetId===enemy.id&&u.manualAttack===true&&u.state==='attack'),attackOrder);if(!attackOrder.units.every(u=>u.targetId===enemy.id&&u.manualAttack))throw Error('攻擊目標未接受，不以後續任意扣血PASS');
await p.screenshot({path:join(out,'native-attack-accepted.png')});await p.evaluate(()=>ageOfAsh.game.update=__realUpdate);let effect;
for(let i=0;i<70;i++){await p.waitForTimeout(80);effect=await p.evaluate(()=>({sim:ageOfAsh.game.runTime,hp:__enemy.hp,alive:__enemy.alive,damage:__damage,units:ageOfAsh.game.selection.map(u=>({id:u.id,x:u.x,y:u.y,state:u.state,targetId:u.target?.id,manualAttack:u.manualAttack}))}));if(effect.damage.some(d=>enemy.selectedIds.includes(d.sourceId)&&d.targetId===enemy.id&&d.sourceTargetId===enemy.id&&d.manualAttack&&d.after<d.before))break;}
await p.evaluate(()=>ageOfAsh.game.update=()=>{});const matched=effect.damage.filter(d=>enemy.selectedIds.includes(d.sourceId)&&d.targetId===enemy.id&&d.sourceTargetId===enemy.id&&d.manualAttack&&d.after<d.before);
check('指定組對指定目標實際手動命中來源閉環',matched.length>0,{mode:'CONTROLLED_NATIVE_ENEMY_SPAWN_NO_COMBAT_RULE_CHANGE',enemy,attackOrder,effect,matched,limitation:'單次受控手動命中，不等擊殺/城心反事實減傷或自然通關'});await p.screenshot({path:join(out,'native-attack-damage-source.png')});await c.close();
}catch(e){errors.push({execution:e.message,stack:e.stack});check('工具完整執行',false,e.message);}finally{await browser?.close();}
check('零pageerror',!errors.some(x=>x.pageerror),errors);json('metadata.json',metadata);json('observations.json',observations);json('console.json',consoleLog);json('REPORT.json',{mode:'CONTROLLED_CAUSAL_NATIVE_INPUT_NOT_NATURAL_C',historicalFalsePositive:'run03原生攻擊且實際傷害：TEST_ASSERTION_FALSE_POSITIVE；原文保留，沒有以任意HP下降代替手動命中',historicalStrictSaveLoad:'FAIL_RETAINED',checks,errors,metadata});console.log(JSON.stringify({out,checks:checks.map(({name,status})=>({name,status})),errors}));if(checks.some(x=>x.status==='FAIL'))process.exitCode=1;
