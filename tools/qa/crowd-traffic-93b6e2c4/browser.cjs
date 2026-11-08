const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const{chromium}=require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright-core');
const out=process.argv[2]||'/workspace/riftwatch-ally-crowd-41c8a7e2/evidence/browser';if(fs.existsSync(out))throw Error('fresh output required');fs.mkdirSync(out,{recursive:true});
const result={scope:'正常地形的原地射擊與過期交通朝向受控場景；原生滑鼠下令後真實RAF戰鬥，不是自然戰役或C36精確重播。只有測試場景停用自動經濟/軍事；不改碰撞、數值或敵人生命。',rows:[],errors:[]};let browser;
(async()=>{try{
 browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--enable-unsafe-swiftshader','--use-angle=swiftshader-webgl']});result.browser=browser.version();
 for(const[label,root]of[['before','/workspace/riftwatch-ally-crowd-41c8a7e2/build-contact'],['after',process.argv[3]||'/workspace/riftwatch-crowd-traffic-93b6e2c4/build']]){
  const meta=JSON.parse(fs.readFileSync(root+'/build-metadata.json'));for(const[f,h]of Object.entries(meta.files))if(crypto.createHash('sha256').update(fs.readFileSync(root+'/'+f)).digest('hex')!==h)throw Error('資源SHA錯誤');
  const c=await browser.newContext({viewport:{width:1440,height:900}});await c.route('http://localhost/**',async route=>{const u=new URL(route.request().url()).pathname,f=path.resolve(root,'.'+(u==='/'?'/index.html':u));if(!f.startsWith(root+'/'))return route.abort();const mime={'.js':'text/javascript','.html':'text/html','.css':'text/css','.json':'application/json','.png':'image/png','.svg':'image/svg+xml'};try{await route.fulfill({body:fs.readFileSync(f),contentType:mime[path.extname(f)]||'application/octet-stream'});}catch{await route.fulfill({status:404,body:'missing'});}});
  const p=await c.newPage();p.on('pageerror',e=>result.errors.push({label,error:String(e)}));await p.goto('http://localhost/');await p.waitForFunction(()=>ageOfAsh?.playtestBuild?.resourceVerification==='SHA256_MATCH_168_FILES');
  await p.locator('#setup-civ').selectOption('FRK');await p.locator('#setup-biome').selectOption('steppe');await p.locator('#setup-seed').fill('ALLY-41C8A7E2');await p.locator('#btn-start').click();
  const setup=await p.evaluate(()=>{
   const{game:g,ui}=ageOfAsh;g.newRun(42,{civ:'FRK',biome:'steppe'});g.start();g.paused=true;g.autoEconomy=false;g.autoMilitary=false;const core=g.getTownCenter();g.units=[];g.buildings=[core];g.hero=null;g.crowd=null;
   for(let x=2;x<=9;x+=.5)for(let y=1;y<=5;y+=.5)if(!g.isWalkable(x,y))throw Error('場景須使用正常可走地形');
   const archer=g.spawnUnit('archer',3,3),actor=g.spawnUnit('militia',1.8,3),blockers=[archer],target=g.addBuilding('house',6,2,true);target.team='enemy';actor.state='hold';actor.hold=true;actor.stance='passive';g.stepToward(archer,2.4,3,.05);g.setSelection([archer]);
   ui.hideMenu();ui.showPause(false);ui.hideEnd();ui.hideBoons();g.focusAt(4,3);g.camera.x=g.camera.targetX;g.camera.y=g.camera.targetY;ui.update(g);
   const point=g.screenPos(6.5,2.5);if(g.pickAt(point.x,point.y)!==target)throw Error('原生pick不符');
   const q=window.__ally={actor,blockers,target,commands:[],hits:[],samples:[],origin:blockers.map(u=>({x:u.x,y:u.y}))};
   const issue=g.issueCommand,damage=g.applyDamage;g.issueCommand=function(...args){const r=issue.apply(this,args);q.commands.push(this.selection.map(u=>({id:u.id,target:u.target?.id,manualAttack:u.manualAttack})));return r;};
   g.applyDamage=function(t,amount,source,...args){const before=t.hp,r=damage.call(this,t,amount,source,...args);if(source===actor&&t===target)q.hits.push({time:this.runTime,source:source.id,target:t.id,sourceTarget:source.target?.id,manualAttack:source.manualAttack,actual:before-t.hp});return r;};
   const snap=g.snapshot();delete snap.savedAt;return{point,targetId:target.id,ids:[actor,...blockers].map(u=>u.id),scene:JSON.stringify(snap)};
  });
  await p.waitForTimeout(1000);await p.screenshot({path:out+'/'+label+'-start.png'});
  if(await p.evaluate(pt=>document.elementFromPoint(pt.x,pt.y)?.tagName!=='CANVAS',setup.point))throw Error('點位被UI遮擋');
  await p.evaluate(()=>ageOfAsh.game.paused=false);
  await p.mouse.click(setup.point.x,setup.point.y,{button:'right'});await p.waitForTimeout(300);
  const actorPoint=await p.evaluate(()=>{const g=ageOfAsh.game,p=g.screenPos(__ally.actor.x,__ally.actor.y);p.y-=18;if(g.pickAt(p.x,p.y)!==__ally.actor)throw Error('兵體點選不符');return p;});
  await p.mouse.click(actorPoint.x,actorPoint.y);
  const move=await p.evaluate(()=>{const g=ageOfAsh.game,q=__ally;if(g.selection.length!==1||g.selection[0]!==q.actor)throw Error('原生選兵失敗');const point=[[8,1],[9,1],[8,0],[5,1]].filter(([x,y])=>g.isWalkable(x,y,q.actor)).map(([x,y])=>g.screenPos(x,y)).find(p=>!g.pickAt(p.x,p.y)&&document.elementFromPoint(p.x,p.y)?.tagName==='CANVAS');if(!point)throw Error('移動目標不是可點選空地');q.startX=q.actor.x;q.startY=q.actor.y;const sample=()=>{if(!q.done){q.samples.push({sim:g.runTime,x:q.actor.x,y:q.actor.y,yieldTo:q.actor._yieldTo||null,archerHeading:q.blockers[0]._heading||null});requestAnimationFrame(sample);}};requestAnimationFrame(sample);return point;});
  await p.mouse.click(move.x,move.y,{button:'right'});await p.waitForTimeout(1500);
  const measured=await p.evaluate(()=>{const g=ageOfAsh.game,q=__ally;g.paused=true;q.done=true;return{commands:q.commands,hits:q.hits,samples:q.samples,origin:q.origin,startX:q.startX,startY:q.startY,sim:g.runTime,actor:{x:q.actor.x,y:q.actor.y,state:q.actor.state,failure:q.actor.orderFailure||null},targetHp:q.target.hp};});
  await p.screenshot({path:out+'/'+label+'-end.png'});const initialSceneSha256=crypto.createHash('sha256').update(setup.scene).digest('hex');delete setup.scene;result.rows.push({label,source:meta.commit,resources:Object.keys(meta.files).length,...setup,initialSceneSha256,...measured});await c.close();
 }
 const[b,a]=result.rows;const first=r=>r.samples.find(s=>Math.abs(s.x-r.startX)>1e-6);result.checks={beforeBackwards:first(b)?.x<b.startX,afterForwards:first(a)?.x>a.startX,afterNoFalseYield:!first(a)?.yieldTo,zeroPageErrors:result.errors.length===0,resourceHashVerified:result.rows.every(r=>r.resources===168)};result.firstMovement={before:first(b),after:first(a)};if(Object.values(result.checks).some(v=>!v))throw Error('前後行為未符合預期');
}catch(e){result.failure=String(e.stack||e);process.exitCode=1;}finally{await browser?.close();fs.writeFileSync(out+'/REPORT.json',JSON.stringify(result,null,2));console.log(JSON.stringify({checks:result.checks,failure:result.failure,rows:result.rows.map(r=>({label:r.label,sim:r.sim,hits:r.hits.length,failure:r.actor.failure}))}));}})();
