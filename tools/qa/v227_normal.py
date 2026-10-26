"""Same real-input scenario for BEFORE_LIVE, AFTER_LOCAL and AFTER_DEPLOY_LIVE.
No game state writes, save/load, GM, deploy or repository writes. Isolated context.
"""
import argparse,datetime,json,os,subprocess,time
from pathlib import Path
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright
def require_url(url):assert url.startswith('http://127.0.0.1:')
def launch_options():return dict(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
parser=argparse.ArgumentParser();parser.add_argument('--stage',choices=['BEFORE_LIVE','AFTER_LOCAL','AFTER_DEPLOY_LIVE'],required=True);parser.add_argument('--url',required=True);parser.add_argument('--out',type=Path,required=True);parser.add_argument('--seconds',type=int,default=135);parser.add_argument('--seed',default='riftwatch-p0-v1');parser.add_argument('--expected-commit');args=parser.parse_args();require_url(args.url);assert args.stage=='AFTER_LOCAL'
if args.stage!='AFTER_LOCAL' and urlparse(args.url).hostname in ['localhost','127.0.0.1']:parser.error('LIVE stages cannot use localhost')
out=args.out.resolve();out.mkdir(parents=True,exist_ok=True)
meta={'stage':args.stage,'url':args.url,'seed_text':args.seed,'civilization':'TEU','biome':'steppe','timestamp':datetime.datetime.now(datetime.timezone.utc).isoformat(),'actions':[],'responses':[],'failed':[],'console':[],'page_errors':[],'samples':[]}
def save(): (out/'evidence.json').write_text(json.dumps(meta,ensure_ascii=False,indent=2))
save()
with sync_playwright() as pw:
 opts=launch_options()
 browser=pw.chromium.launch(**opts);meta['chromium']=browser.version
 context=browser.new_context(viewport={'width':1600,'height':1100},record_har_path=str(out/'network.har'))
 context.tracing.start(screenshots=True,snapshots=True,sources=True)
 page=context.new_page()
 page.on('response',lambda r:meta['responses'].append({'url':r.url,'status':r.status}))
 page.on('requestfailed',lambda r:meta['failed'].append({'url':r.url,'error':r.failure}))
 page.on('console',lambda m:meta['console'].append({'type':m.type,'text':m.text}))
 page.on('pageerror',lambda e:meta['page_errors'].append(str(e)))
 try:
  page.goto(args.url,wait_until='domcontentloaded',timeout=30000)
  frame=page.main_frame
  meta['build_manifest']=context.request.get(args.url.rstrip('/')+'/__qa_build.json').json()
  assert meta['build_manifest']['commit']==args.expected_commit and not meta['build_manifest']['dirty']
  page.wait_for_function("window.ageOfAsh?.playtestBuild?.resourceVerification==='SHA256_MATCH_28_FILES'")
  frame.locator('#btn-start').wait_for(state='visible',timeout=30000)
  meta['game_url']=frame.locator('body').evaluate('()=>location.href')
  meta['build']=frame.locator('body').evaluate('()=>window.ageOfAsh?.playtestBuild||null')
  frame.locator('#setup-civ').select_option('TEU');frame.locator('#setup-biome').select_option('steppe');frame.locator('#setup-seed').fill(args.seed)
  frame.locator('#btn-settings').click();frame.locator('#settings-speed').select_option('1');frame.locator('#btn-settings-close').click()
  frame.locator('#btn-start').click();meta['actions'].append({'action':'Start Game','seed':args.seed,'speed':1})
  page.screenshot(path=str(out/'01-start.png'))
  def read():
   return frame.locator('body').evaluate('''()=>{const g=ageOfAsh.game;return {time:g.time,phase:g.phase,waveIndex:g.waveIndex,waveClock:g.waveClock,prepTimer:g.prepTimer,coreHp:g.getTownCenter()?.hp,seed:g.seed,resources:{...g.resources},stats:{...g.stats},units:g.units.map(u=>({id:u.id,type:u.type,team:u.team,x:u.x,y:u.y,hp:u.hp,alive:u.alive,state:u.state,stance:u.stance,orderFailure:u.orderFailure,target:u.target?.id,carry:u.carry,carryType:u.carryType,gatherTarget:u.gatherTarget?.id,targetPos:u.targetPos,nav:u._nav&&{status:u._nav.status,expanded:u._nav.expanded}})),buildings:g.buildings.map(b=>({id:b.id,type:b.type,x:b.x,y:b.y,w:b.w,h:b.h,alive:b.alive})),nodes:g.world.resources.map(n=>({id:n.id,resource:n.resource,x:n.x,y:n.y,amount:n.amount,alive:n.alive}))}}''')
  def click_world(js,button='left'):
   pos=frame.locator('body').evaluate(js);box=frame.locator('#game').bounding_box();page.mouse.click(box['x']+pos['x'],box['y']+pos['y'],button=button);meta['actions'].append({'action':'mouse','button':button,'canvas_point':pos})
  meta['samples'].append(read())
  click_world("()=>{const u=ageOfAsh.game.units.find(u=>u.type==='light_cavalry');return ageOfAsh.renderer.screen(ageOfAsh.game,u.x,u.y)}")
  click_world('()=>ageOfAsh.renderer.screen(ageOfAsh.game,32,29)','right')
  started=time.monotonic();gathered=False;shots=set()
  while time.monotonic()-started<args.seconds:
   page.wait_for_timeout(500);sample=read();sample['wall_elapsed']=time.monotonic()-started;meta['samples'].append(sample);elapsed=time.monotonic()-started
   if not gathered and elapsed>5:
    click_world("()=>{const u=ageOfAsh.game.units.find(u=>u.id===7);return ageOfAsh.renderer.screen(ageOfAsh.game,u.x,u.y)}")
    click_world("()=>{const g=ageOfAsh.game,u=g.units.find(u=>u.id===7),n=g.world.resources.filter(n=>n.alive&&n.resource==='wood').sort((a,b)=>Math.hypot(a.x-u.x,a.y-u.y)-Math.hypot(b.x-u.x,b.y-u.y))[0];return ageOfAsh.renderer.screen(g,n.x,n.y)}",'right');gathered=True
   for sec in [15,45,90,130,180,240]:
    if elapsed>=sec and sec not in shots:page.screenshot(path=str(out/f'{sec:03d}-game.png'));shots.add(sec)
   if len(meta['samples'])%20==0:save()
  page.screenshot(path=str(out/'final.png'));meta['wall_seconds']=time.monotonic()-started;meta['result']='COMPLETED'
 except Exception as e:
  meta['result']='BLOCKED';meta['error']=str(e);page.screenshot(path=str(out/'blocked.png'));print(str(e),flush=True)
 finally:
  context.tracing.stop(path=str(out/'trace.zip'));context.close();browser.close();save()
print(json.dumps({'result':meta.get('result'),'stage':args.stage,'samples':len(meta['samples']),'errors':len(meta['page_errors']),'out':str(out)}),flush=True)
