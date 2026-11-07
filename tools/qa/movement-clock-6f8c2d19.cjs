// 正式構建的短 Chromium 受控前後對照，不是自然戰役或效能認證。
const fs=require('node:fs'), path=require('node:path'), crypto=require('node:crypto');
const {chromium}=require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright-core');
const out='/workspace/riftwatch-movement-clock-6f8c2d19/evidence/browser-native';fs.mkdirSync(out,{recursive:true});
const rows=[], errors=[];let browser;
(async()=>{
 browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--enable-unsafe-swiftshader','--use-angle=swiftshader-webgl']});
 for(const [label,root]of[['before','/workspace/riftwatch-v2-resume-audit-7d392c8e/build-order-group'],['after','/workspace/riftwatch-movement-clock-6f8c2d19/build']]){
  const meta=JSON.parse(fs.readFileSync(path.join(root,'build-metadata.json'))),bad=Object.entries(meta.files).filter(([p,h])=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,p))).digest('hex')!==h);
  if(bad.length)throw Error('資源雜湊錯誤');
  const context=await browser.newContext({viewport:{width:1440,height:900}});
  await context.route('http://localhost/**',async route=>{const p=new URL(route.request().url()).pathname;const file=path.resolve(root,'.'+(p==='/'?'/index.html':p));if(!file.startsWith(root+'/'))return route.abort();const type={'.js':'text/javascript','.json':'application/json','.css':'text/css','.html':'text/html','.svg':'image/svg+xml','.png':'image/png','.ttf':'font/ttf'}[path.extname(file)];try{await route.fulfill({body:fs.readFileSync(file),contentType:type||'application/octet-stream'});}catch{await route.fulfill({status:404,body:'missing'});}});
  const p=await context.newPage();p.on('pageerror',e=>errors.push({label,error:String(e)}));await p.goto('http://localhost/');
  await p.waitForFunction(()=>globalThis.ageOfAsh?.playtestBuild?.resourceVerification==='SHA256_MATCH_168_FILES');
  await p.locator('#setup-seed').fill('CLOCK-6F8C2D19');await p.locator('#btn-start').click();
  const result=await p.evaluate(()=>{
   const {game:g,ui}=ageOfAsh;g.newRun(42,{civ:'FRK'});g.start();g.paused=true;ui.showPause(false);ui.hideMenu();
   const u=g.units.find(u=>u.type==='militia'&&u.team==='player');let point;
   for(let y=3;y<g.world.size-4&&!point;y++)for(let x=3;x<g.world.size-6;x++)if(g.isWalkable(x,y,u)&&g.segmentWalkable({x,y},{x:x+4,y},u)){point={x,y};break;}
   if(!point)throw Error('缺少正常可走地形');
   Object.assign(u,point,{guardOrigin:{...point},state:'idle',target:null,targetPos:null,_nav:null,orderFailure:null});g.units=[u];g.crowd=null;g.time=0;
   u._progress=null;u._goalProgress=null;
   const tick=(dt=1/60)=>{g.time+=dt;g.updateUnits(dt);};
   g.commandMove([u],point.x+.7,point.y);for(let i=0;i<200;i++)tick(.05);
   if(u.state!=='idle')throw Error('原生行程必須先完成');
   const initial={point:{x:u.x,y:u.y},rng:g.rng.state,visual:g.visualRng.state,hp:u.hp};
   const priorProgress=u._progress?{...u._progress}:null;
   const enemy=g.spawnUnit('militia',point.x+4,point.y,'enemy');if(!enemy||!g.canSee(u,enemy))throw Error('對手必須原生可見');
   tick();const acquired=u.target===enemy;tick();
   const row={initial,priorProgress,acquired,targetId:u.target?.id||null,enemyId:enemy.id,failure:u.orderFailure,position:{x:u.x,y:u.y},progress:Math.hypot(u.x-initial.point.x,u.y-initial.point.y),rng:g.rng.state,visual:g.visualRng.state};
   g.setSelection([u]);g.focusAt(point.x+1.5,point.y);g.camera.x=g.camera.targetX;g.camera.y=g.camera.targetY;ui.update(g);return row;
  });
  await p.waitForTimeout(1000);await p.screenshot({path:path.join(out,label+'.png')});rows.push({label,source:meta.commit,resources:Object.keys(meta.files).length,...result});await context.close();
 }
 const [b,a]=rows, checks={sameInitial:JSON.stringify(b.initial)===JSON.stringify(a.initial),beforeReproduced:b.acquired&&b.failure==='congested'&&b.targetId===null,afterKeepsTarget:a.acquired&&a.failure!=='congested'&&a.targetId===a.enemyId&&a.progress>0,pairedRng:b.rng===a.rng&&b.visual===a.visual,zeroPageErrors:errors.length===0};
 fs.writeFileSync(path.join(out,'REPORT.json'),JSON.stringify({mode:'CONTROLLED_NATIVE_STATE_MACHINE_NOT_NATURAL_CAMPAIGN',rows,checks,errors},null,2));if(Object.values(checks).some(v=>!v))throw Error('前後對照未全部通過');console.log(JSON.stringify(checks));
})().catch(e=>{fs.writeFileSync(path.join(out,'ERROR.txt'),String(e));console.error(e);process.exitCode=1;}).finally(async()=>{await browser?.close();});
