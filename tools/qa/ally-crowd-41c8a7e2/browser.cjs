const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const{chromium}=require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright-core');
const out=process.argv[2]||'/workspace/riftwatch-ally-crowd-41c8a7e2/evidence/browser';if(fs.existsSync(out))throw Error('fresh output required');fs.mkdirSync(out,{recursive:true});
const result={scope:'正常地形的受控四單位場景；原生滑鼠下令後真實RAF戰鬥，不是自然戰役或C36精確重播。只有測試場景停用自動經濟/軍事；不改碰撞、數值或敵人生命。',rows:[],errors:[]};let browser;
(async()=>{try{
 browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--enable-unsafe-swiftshader','--use-angle=swiftshader-webgl']});result.browser=browser.version();
 for(const[label,root]of[['before','/workspace/riftwatch-movement-clock-6f8c2d19/build'],['after',process.argv[3]||'/workspace/riftwatch-ally-crowd-41c8a7e2/build-contact']]){
  const meta=JSON.parse(fs.readFileSync(root+'/build-metadata.json'));for(const[f,h]of Object.entries(meta.files))if(crypto.createHash('sha256').update(fs.readFileSync(root+'/'+f)).digest('hex')!==h)throw Error('資源SHA錯誤');
  const c=await browser.newContext({viewport:{width:1440,height:900}});await c.route('http://localhost/**',async route=>{const u=new URL(route.request().url()).pathname,f=path.resolve(root,'.'+(u==='/'?'/index.html':u));if(!f.startsWith(root+'/'))return route.abort();const mime={'.js':'text/javascript','.html':'text/html','.css':'text/css','.json':'application/json','.png':'image/png','.svg':'image/svg+xml'};try{await route.fulfill({body:fs.readFileSync(f),contentType:mime[path.extname(f)]||'application/octet-stream'});}catch{await route.fulfill({status:404,body:'missing'});}});
  const p=await c.newPage();p.on('pageerror',e=>result.errors.push({label,error:String(e)}));await p.goto('http://localhost/');await p.waitForFunction(()=>ageOfAsh?.playtestBuild?.resourceVerification==='SHA256_MATCH_168_FILES');
  await p.locator('#setup-civ').selectOption('FRK');await p.locator('#setup-biome').selectOption('steppe');await p.locator('#setup-seed').fill('ALLY-41C8A7E2');await p.locator('#btn-start').click();
  const setup=await p.evaluate(()=>{
   const{game:g,ui}=ageOfAsh;g.newRun(42,{civ:'FRK',biome:'steppe'});g.start();g.paused=true;g.autoEconomy=false;g.autoMilitary=false;const core=g.getTownCenter();g.units=[];g.buildings=[core];g.hero=null;g.crowd=null;
   for(let x=2;x<=9;x+=.5)for(let y=1;y<=5;y+=.5)if(!g.isWalkable(x,y))throw Error('場景須使用正常可走地形');
   const actor=g.spawnUnit('militia',3,3),blockers=[g.spawnUnit('archer',3.435,2.75),g.spawnUnit('archer',3.435,3.25)],target=g.addBuilding('house',7,2,true);target.team='enemy';g.setSelection([actor,...blockers]);
   ui.hideMenu();ui.showPause(false);ui.hideEnd();ui.hideBoons();g.focusAt(5,3);g.camera.x=g.camera.targetX;g.camera.y=g.camera.targetY;ui.update(g);
   const point=g.screenPos(8,3);if(g.pickAt(point.x,point.y)!==target)throw Error('原生pick不符');
   const q=window.__ally={actor,blockers,target,commands:[],hits:[],samples:[],origin:blockers.map(u=>({x:u.x,y:u.y}))};
   const issue=g.issueCommand,damage=g.applyDamage;g.issueCommand=function(...args){const r=issue.apply(this,args);q.commands.push(this.selection.map(u=>({id:u.id,target:u.target?.id,manualAttack:u.manualAttack})));return r;};
   g.applyDamage=function(t,amount,source,...args){const before=t.hp,r=damage.call(this,t,amount,source,...args);if(source===actor&&t===target)q.hits.push({time:this.runTime,source:source.id,target:t.id,sourceTarget:source.target?.id,manualAttack:source.manualAttack,actual:before-t.hp});return r;};
   const snap=g.snapshot();delete snap.savedAt;return{point,targetId:target.id,ids:[actor,...blockers].map(u=>u.id),scene:JSON.stringify(snap)};
  });
  await p.waitForTimeout(1000);await p.screenshot({path:out+'/'+label+'-start.png'});
  if(await p.evaluate(pt=>document.elementFromPoint(pt.x,pt.y)?.tagName!=='CANVAS',setup.point))throw Error('點位被UI遮擋');
  await p.evaluate(()=>{const g=ageOfAsh.game,q=__ally;g.paused=false;const sample=()=>{if(!q.done){q.samples.push({sim:g.runTime,x:q.actor.x,y:q.actor.y,failure:q.actor.orderFailure||null,blockers:q.blockers.map(u=>({x:u.x,y:u.y}))});requestAnimationFrame(sample);}};requestAnimationFrame(sample);});
  await p.mouse.click(setup.point.x,setup.point.y,{button:'right'});await p.waitForTimeout(10500);
  const measured=await p.evaluate(()=>{const g=ageOfAsh.game,q=__ally;g.paused=true;q.done=true;return{commands:q.commands,hits:q.hits,samples:q.samples,origin:q.origin,sim:g.runTime,actor:{x:q.actor.x,y:q.actor.y,state:q.actor.state,failure:q.actor.orderFailure||null},targetHp:q.target.hp};});
  await p.screenshot({path:out+'/'+label+'-end.png'});const initialSceneSha256=crypto.createHash('sha256').update(setup.scene).digest('hex');delete setup.scene;result.rows.push({label,source:meta.commit,resources:Object.keys(meta.files).length,...setup,initialSceneSha256,...measured});await c.close();
 }
 const[b,a]=result.rows;result.checks={sameInitial:b.initialSceneSha256===a.initialSceneSha256,nativeAccepted:result.rows.every(r=>r.commands.length===1&&r.commands[0].length===3&&r.commands[0].every(u=>u.manualAttack&&u.target===r.targetId)),beforeReproduced:b.actor.failure==='congested'&&b.hits.length===0,afterActorDamage:a.actor.failure===null&&a.hits.length>0&&a.hits.every(h=>h.source===a.ids[0]&&h.target===a.targetId&&h.sourceTarget===a.targetId&&h.actual>0),blockersStay:result.rows.every(r=>r.samples.every(s=>s.blockers.every((v,i)=>Math.hypot(v.x-r.origin[i].x,v.y-r.origin[i].y)<1e-8))),zeroPageErrors:result.errors.length===0};if(Object.values(result.checks).some(v=>!v))throw Error('受控前後驗證未全通過');
}catch(e){result.failure=String(e.stack||e);process.exitCode=1;}finally{await browser?.close();fs.writeFileSync(out+'/REPORT.json',JSON.stringify(result,null,2));console.log(JSON.stringify({checks:result.checks,failure:result.failure,rows:result.rows.map(r=>({label:r.label,sim:r.sim,hits:r.hits.length,failure:r.actor.failure}))}));}})();
