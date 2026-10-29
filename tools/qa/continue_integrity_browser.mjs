// 同頁選單不得越過完整性阻擋。 / Same-page menu must not bypass integrity blocking.
import {createRequire} from 'node:module';import {mkdirSync,writeFileSync} from 'node:fs';
const{chromium}=createRequire(import.meta.url)('playwright-core');const[url,source,out]=process.argv.slice(2);mkdirSync(out,{recursive:true});
const b=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});const c=await b.newContext({viewport:{width:1440,height:900}}),p=await c.newPage();const checks=[];
try{await p.goto(url);await p.waitForFunction(()=>/^SHA256_MATCH_\d+_FILES$/.test(window.ageOfAsh?.playtestBuild?.resourceVerification||''));
 if(await p.evaluate(()=>ageOfAsh.playtestBuild.commit)!==source)throw Error('Source mismatch');await p.locator('#btn-start').click();await p.evaluate(()=>{ageOfAsh.game.paused=true;ageOfAsh.ui.showPause(true)});await p.locator('#btn-save').click();
 await p.route('**/js/utils.js',async route=>{if(route.request().resourceType()==='fetch'){const response=await route.fetch();await route.fulfill({response,body:(await response.text())+'\n// integrity mismatch fixture\n'})}else await route.continue()});
 await p.reload();await p.waitForFunction(()=>window.ageOfAsh?.playtestBlocked===true);await p.evaluate(()=>ageOfAsh.ui.showMenu());
 const state=await p.evaluate(()=>({blocked:ageOfAsh.playtestBlocked,ready:ageOfAsh.ui.playtestReady,start:document.querySelector('#btn-start').disabled,cont:document.querySelector('#btn-continue').disabled,hasSave:!document.querySelector('#btn-continue').hidden}));
 checks.push({name:'saved run menu stays disabled after actual payload SHA256 mismatch',pass:state.blocked&&state.ready===false&&state.start&&state.cont&&state.hasSave,detail:state});await p.screenshot({path:out+'/integrity-blocked.png'});
}catch(e){checks.push({name:'execution',pass:false,detail:e.message})}await c.close();await b.close();const r={source_commit:source,mode:'CONTROLLED_INTEGRITY_FAILURE_NOT_GAMEPLAY_FAILURE',checks,pass:checks.length===1&&checks.every(x=>x.pass)};writeFileSync(out+'/browser.json',JSON.stringify(r,null,2));console.log(JSON.stringify(r));if(!r.pass)process.exitCode=1;
