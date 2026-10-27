// Real Start UI, then an explicitly controlled visual/state/performance scene.
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync, copyFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cpus, totalmem } from 'node:os';
const { chromium } = createRequire(import.meta.url)('playwright-core');
const args=process.argv.slice(2), arg=(n,d)=>{const i=args.indexOf(n);return i<0?d:args[i+1]};
const url=arg('--url'), commit=arg('--commit'), out=resolve(arg('--out')), mode=arg('--mode','gallery');
mkdirSync(out,{recursive:true});
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--use-angle=swiftshader']});
const checks=[], consoleErrors=[], pageErrors=[], requests=[], failures=[], timeline=[];
const context=await browser.newContext({viewport:{width:1920,height:1080},deviceScaleFactor:1,
  ...(mode==='gallery'?{recordVideo:{dir:out,size:{width:1920,height:1080}}}:{})});
const page=await context.newPage();
page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text())});page.on('pageerror',e=>pageErrors.push(e.message));
page.on('response',r=>requests.push({url:r.url(),status:r.status()}));page.on('requestfailed',r=>failures.push({url:r.url(),failure:r.failure()?.errorText}));
const check=(name,pass,detail)=>checks.push({name,pass:!!pass,detail});
try {
  await page.goto(url,{waitUntil:'networkidle'});
  await page.waitForFunction(()=>window.ageOfAsh?.playtestBuild?.resourceVerification?.startsWith('SHA256_MATCH_'));
  const build=await page.evaluate(()=>ageOfAsh.playtestBuild);
  check('exact commit artifact integrity',build.commit===commit&&build.resourceVerification==='SHA256_MATCH_33_FILES',build);
  await page.locator('#setup-seed').fill('LANDMARK-240');await page.locator('#btn-start').click();
  await page.waitForFunction(()=>ageOfAsh?.game&&!ageOfAsh.game.inMenu);
  await page.evaluate(()=>{
    const g=ageOfAsh.game;g.paused=true;g.units=[];g.buildings=[];g.selection=[];
    g.world.resources=[];g.world.props=[];g.world.wildlife=[];g.particles=[];g.zones=[];
    for(const t of g.world.tiles)t.terrain='grass';g.focusAt(25,25);g.camera.x=g.camera.targetX;g.camera.y=g.camera.targetY;
    g.camera.zoom=g.camera.targetZoom=1.35;ageOfAsh.renderer.terrainKey='';
  });
  const environment=await page.evaluate(()=>{
    const c=document.createElement('canvas'),gl=c.getContext('webgl');const ext=gl?.getExtension('WEBGL_debug_renderer_info');
    return {userAgent:navigator.userAgent,renderer:ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):null,viewport:[innerWidth,innerHeight],dpr:devicePixelRatio};
  });
  if(mode==='gallery'){
    await page.evaluate(()=>{
      const labels=document.createElement('div');labels.id='qa-labels';labels.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:9999;color:#fff;font:16px system-ui;text-shadow:0 1px 2px #000';
      labels.innerHTML='<div style="position:absolute;top:180px;left:320px;background:#172015;padding:10px">CONTROLLED FIXTURE · House (top) / Barracks (bottom) · fixed Seed LANDMARK-240</div>';
      ['Foundation','Scaffold','Complete','Damaged 60%','Critical 25%','Ruin (dead)'].forEach((text,i)=>{const e=document.createElement('b');e.style.cssText=`position:absolute;left:${260+i*265-70}px;top:265px;background:#172015;padding:4px`;e.textContent=text;labels.append(e)});document.body.append(labels);
      window.gallery=[];
      for(const [row,type]of ['house','barracks'].entries())for(let col=0;col<6;col++){
        const g=ageOfAsh.game,r=ageOfAsh.renderer,p=r.worldAt(g,260+col*265,row?760:475),b=g.addBuilding(type,p.x-(type==='house'?1:1.5),p.y-(type==='house'?1:1.5),true);
        b.construction=col===0?.2:col===1?.7:1;b.hp=b.maxHp*(col===3?.6:col===4?.25:col===5?0:1);b.alive=col!==5;
        gallery.push(b);
        // Draw one unit behind, and one in front of each complete building.
        if(col===2){g.spawnUnit('militia',b.x+.4,b.y-.4);g.spawnUnit('archer',b.x+b.w+.2,b.y+b.h+.2);}
      }
      window.beforeGeometry=JSON.stringify(gallery.map(b=>({type:b.type,w:b.w,h:b.h,cost:b.typeDef.cost,hp:b.hp,maxHp:b.maxHp,construction:b.construction,alive:b.alive})));
    });
    for(const id of ['MNG','TEU','SAR','CHN','AZT']){
      const state=await page.evaluate(async id=>{
        const {CIVILIZATIONS}=await import('./js/data.js');const {buildingVisualState}=await import('./js/renderer.js');const g=ageOfAsh.game;
        g.civ=CIVILIZATIONS.find(c=>c.id===id);
        const e=document.getElementById('qa-family')||document.body.appendChild(Object.assign(document.createElement('div'),{id:'qa-family'}));e.style.cssText='position:fixed;left:320px;top:135px;color:#fff;background:#172015;z-index:99999;padding:8px;font:22px system-ui';e.textContent=id+' · '+({MNG:'Steppe',TEU:'Fortress',SAR:'Desert',CHN:'Eastern',AZT:'Mesoamerican'}[id]);
        return gallery.map(b=>({id:b.id,type:b.type,state:buildingVisualState(b),alive:b.alive,hp:b.hp,construction:b.construction}));
      },id);
      await page.waitForTimeout(450);await page.screenshot({path:resolve(out,`family-${id}.png`)});timeline.push({id,states:state});
      check(`${id} both buildings expose all six states`,state.filter(x=>x.type==='house').length===6&&state.filter(x=>x.type==='barracks').length===6&&new Set(state.map(x=>x.state)).size===6,state);
    }
    const invariants=await page.evaluate(()=>({unchanged:beforeGeometry===JSON.stringify(gallery.map(b=>({type:b.type,w:b.w,h:b.h,cost:b.typeDef.cost,hp:b.hp,maxHp:b.maxHp,construction:b.construction,alive:b.alive}))),cacheLayers:ageOfAsh.renderer.landmarkMaterialCache?.size??null,ruins:gallery.filter(b=>!b.alive).map(b=>({id:b.id,alive:b.alive,hp:b.hp}))}));
    check('drawing preserves geometry cost health and permanent dead ruins',invariants.unchanged&&invariants.ruins.every(b=>!b.alive&&b.hp===0),invariants);
    const order=await page.evaluate(()=>{
      const r=ageOfAsh.renderer,g=ageOfAsh.game,events=[];const methods=['drawBuilding','drawBuildingRuin','drawUnit'];const originals={};
      for(const m of methods){originals[m]=r[m];r[m]=function(obj,...rest){events.push({kind:m,id:obj.id,depth:obj.w?obj.x+obj.y+.4*(obj.w+obj.h):obj.x+obj.y+.1});return originals[m].call(this,obj,...rest)}}
      r.draw(g,g.time);for(const m of methods)r[m]=originals[m];return events;
    });check('production depth order remains monotonic with front and rear units',order.every((x,i)=>!i||x.depth>=order[i-1].depth),order);
    // Permanent ruin round-trip through the production snapshot loader.
    const persistence=await page.evaluate(()=>{const g=ageOfAsh.game,s=g.snapshot();g.restore(s);return g.buildings.filter(b=>!b.alive).map(b=>({type:b.type,alive:b.alive,hp:b.hp}));});
    check('ruins remain dead after snapshot restore',persistence.length===2&&persistence.every(b=>!b.alive&&b.hp===0),persistence);
  }else{
    await page.evaluate(()=>{
      const g=ageOfAsh.game;g.camera.zoom=g.camera.targetZoom=.8;window.sceneUnits=[];
      for(let i=0;i<24;i++)g.addBuilding(i%2?'house':'barracks',14+(i%6)*4,14+Math.floor(i/6)*5,true);
      for(let i=0;i<100;i++){const u=g.spawnUnit(['militia','archer','light_cavalry'][i%3],12+(i%20),12+Math.floor(i/20)*5);u.state='move';sceneUnits.push(u)}
      ageOfAsh.renderer.terrainKey='';
    });
    const samples=await page.evaluate(async()=>{
      const g=ageOfAsh.game,r=ageOfAsh.renderer;await new Promise(done=>setTimeout(done,3000));const raf=[],draw=[];let previous=null;
      const original=r.draw;
      await new Promise(done=>{setTimeout(()=>{r.draw=original;done()},15000);r.draw=function(...args){const now=performance.now();if(previous!==null)raf.push(now-previous);previous=now;const t=performance.now();original.apply(this,args);draw.push(performance.now()-t)}});
      return{raf,draw,units:g.units.length,buildings:g.buildings.length};
    });
    check('mixed scene measurement completed (15 seconds, not an FPS pass)',samples.draw.length>=10&&samples.units===100&&samples.buildings===24,samples);timeline.push(samples);
  }
  check('no console page network failures',!consoleErrors.length&&!pageErrors.length&&!failures.length&&!requests.some(r=>r.status>=400),{consoleErrors,pageErrors,failures});
  writeFileSync(resolve(out,'environment.json'),JSON.stringify({browser:browser.version(),...environment,cpu:cpus()[0]?.model,logicalCpus:cpus().length,totalMemory:totalmem()},null,2));
}catch(error){check('completed run',false,{message:error.message,stack:error.stack});try{await page.screenshot({path:resolve(out,'failure.png')})}catch{}}
const result={stage:'AFTER_LOCAL',mode:'CONTROLLED_FIXTURE',commit,url,checks,timeline,consoleErrors,pageErrors,failures,requests,pass:checks.length>0&&checks.every(c=>c.pass)};
writeFileSync(resolve(out,'browser.json'),JSON.stringify(result,null,2)+'\n');
const video=page.video();await context.close();if(video)copyFileSync(await video.path(),resolve(out,'landmark-gallery.webm'));await browser.close();
console.log(JSON.stringify({pass:result.pass,checks:checks.map(c=>[c.name,c.pass]),out}));if(!result.pass)process.exit(1);
