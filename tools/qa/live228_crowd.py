"""AFTER_DEPLOY_LIVE publicv228 browser acceptance. All synthetic fixtures are explicitly labelled.
The only save is in a fresh, local browser context, discarded on close.
"""
import argparse,json,time
from pathlib import Path
from playwright.sync_api import sync_playwright
from live228_runtime import connect_browser,require_url
parser=argparse.ArgumentParser();parser.add_argument('--out',type=Path,required=True);parser.add_argument('--url',default='http://127.0.0.1:8008');parser.add_argument('--expected-commit',required=True);a=parser.parse_args();require_url(a.url);a.out.mkdir(parents=True,exist_ok=True)
r={'stage':'AFTER_DEPLOY_LIVE','tests':[],'actions':[],'console':[],'page_errors':[],'failed':[],'samples':[]}
with sync_playwright() as pw:
 b=connect_browser(pw);c=b.new_context(viewport={'width':1600,'height':1100},record_har_path=str(a.out/'network.har'));c.tracing.start(screenshots=False,snapshots=True);p=c.new_page();p.on('console',lambda m:r['console'].append({'type':m.type,'text':m.text}));p.on('pageerror',lambda e:r['page_errors'].append(str(e)));p.on('requestfailed',lambda e:r['failed'].append({'url':e.url,'error':e.failure}))
 def save(): (a.out/'results.json').write_text(json.dumps(r,ensure_ascii=False,indent=2))
 def sample():return p.evaluate('''()=>{const g=ageOfAsh.game;return {time:g.time,seed:g.seed,resources:g.resources,units:g.units.map(u=>({id:u.id,type:u.type,x:u.x,y:u.y,state:u.state,alive:u.alive,target:u.target?.id,carry:u.carry,stance:u.stance})),navigation:g.navigationStats}}''')
 def screenshot(name):p.screenshot(path=str(a.out/name))
 def click_world(x,y,button='right'):
  pos=p.evaluate('([x,y])=>ageOfAsh.renderer.screen(ageOfAsh.game,x,y)',[x,y]);box=p.locator('#game').bounding_box();p.mouse.click(box['x']+pos['x'],box['y']+pos['y'],button=button);p.evaluate("()=>{window.fixtureGoals ||= {};for(const u of ageOfAsh.game.units)if(u.targetPos)fixtureGoals[u.id]={...u.targetPos};}");r['actions'].append({'action':'mouse','button':button,'world':[x,y],'canvas':pos})
 def select_ids(ids):
  points=p.evaluate('ids=>ageOfAsh.game.units.filter(u=>ids.includes(u.id)).map(u=>ageOfAsh.renderer.screen(ageOfAsh.game,u.x,u.y))',ids);left=min(x['x'] for x in points)-10;right=max(x['x'] for x in points)+10;top=min(x['y'] for x in points)-35;bottom=max(x['y'] for x in points)+10
  box=p.locator('#game').bounding_box();p.mouse.move(box['x']+left,box['y']+top);p.mouse.down();p.mouse.move(box['x']+right,box['y']+bottom,steps=10);p.mouse.up();selected=p.evaluate('()=>ageOfAsh.game.selection.map(u=>u.id)');r['actions'].append({'action':'drag_select','expected':ids,'selected':selected});assert set(selected)==set(ids),(selected,ids)
 def fixture(narrow=False):
  return p.evaluate('''narrow=>{const g=ageOfAsh.game;g.newRun(3215474622,{civ:'TEU',biome:'steppe'});g.inMenu=false;g.paused=false;g.phase='prep';g.prepTimer=1e6;g.autoEconomy=false;g.autoMilitary=false;g.speed=1;g.units=[];g.buildings=[];g.crowd=null;g.hero=null;g.world.resources=[];g.world.props=[];g.world.wildlife=[];g.world.camps=[];g.world.seed+=narrow?2:1;for(let y=0;y<50;y++)for(let x=0;x<50;x++)g.world.tiles[y*50+x].terrain=narrow&&x>=10&&x<14&&(y<9||y>=10)?'water':'grass';window.fixtureGoals={};ageOfAsh.renderer.terrainKey='';g.camera={x:0,y:480,targetX:0,targetY:480,zoom:1,targetZoom:1};const left=[],right=[];if(narrow){g.addBuilding('core',10,5,true);g.addBuilding('core',10,10,true);for(let i=0;i<4;i++){left.push(g.spawnUnit('militia',5+i*.8,9.5).id);right.push(g.spawnUnit('militia',17+i*.8,9.5).id);}}else{for(let y=0;y<4;y++)for(let x=0;x<6;x++)left.push(g.spawnUnit('militia',4+x*.8,5+y*.8).id);}window.fixtureCrossed=new Set();const token=window.fixtureToken=(window.fixtureToken||0)+1;function observe(){if(window.fixtureToken!==token)return;for(const u of g.units)if(u.x>11&&u.x<13&&u.y>9&&u.y<10)fixtureCrossed.add(u.id);requestAnimationFrame(observe);}requestAnimationFrame(observe);return {left,right};}''',narrow)
 def wait_arrival(name,ids,timeout):
  start=time.monotonic();max_pen=0;clipped=0;crossed=set()
  while time.monotonic()-start<timeout:
   p.wait_for_timeout(500);s=sample();s['scenario']=name;r['samples'].append(s)
   if name.startswith('narrow'):
    crossed.update(p.evaluate('()=>[...window.fixtureCrossed]'))
   obs=p.evaluate('''ids=>{const g=ageOfAsh.game,u=g.units.filter(u=>ids.includes(u.id));let pen=0;for(let i=0;i<u.length;i++)for(let j=i+1;j<u.length;j++)pen=Math.max(pen,(u[i].typeDef.radius||.24)+(u[j].typeDef.radius||.24)-Math.hypot(u[i].x-u[j].x,u[i].y-u[j].y));return {arrived:u.filter(u=>u.state==='idle'&&fixtureGoals[u.id]&&Math.hypot(u.x-fixtureGoals[u.id].x,u.y-fixtureGoals[u.id].y)<.15).length,penetration:pen,clipped:u.filter(u=>!g.isWalkable(u.x,u.y,u)).length};}''',ids)
   max_pen=max(max_pen,obs['penetration']);clipped+=obs['clipped']
   if obs['arrived']==len(ids):break
  result={'name':name,'fixture':'controlled public-runtime map fixture, actual game engine, real drag selection/right-click','threshold':f'{len(ids)}/{len(ids)} idle within {timeout}s; penetration<=.025; clipping=0','arrived':obs['arrived'],'units':len(ids),'wall_seconds':time.monotonic()-start,'max_penetration':max_pen,'clipped_samples':clipped,'crossed_channel':len(crossed) if name.startswith('narrow') else None,'pass':obs['arrived']==len(ids) and max_pen<=.025 and clipped==0 and (not name.startswith('narrow') or len(crossed)==len(ids))};r['tests'].append(result);screenshot(name+'.png');save();assert result['pass'],result
 try:
  p.goto(a.url);p.wait_for_function('!!window.ageOfAsh');r['manifest']=c.request.get(a.url+'/__qa_build.json').json();assert r['manifest']['commit']==a.expected_commit and not r['manifest']['dirty']
  p.locator('#setup-seed').fill('riftwatch-p0-v1');p.locator('#setup-civ').select_option('TEU');p.locator('#setup-biome').select_option('steppe');p.locator('#btn-start').click();r['actions'].append({'action':'Start Game','seed':'riftwatch-p0-v1','civ':'TEU','biome':'steppe'});p.wait_for_timeout(4000)
  p.locator('#btn-pause').click();before=sample();p.locator('#btn-save').click();r['actions'].append({'action':'Pause + Save Run','scope':'fresh local context only'});screenshot('save-run.png');p.reload();p.locator('#btn-continue').click();after=sample();same=before['seed']==after['seed'] and len(before['units'])==len(after['units']) and abs(before['time']-after['time'])<1;r['tests'].append({'name':'real-ui-save-load','threshold':'same seed/unit count; restored time within1s','before':before,'after':after,'pass':same});assert same
  p.keyboard.press('Tab');p.keyboard.press('Tab');stances=[]
  for i in range(4):p.locator('[data-command="stance:next"]').click();p.wait_for_timeout(100);stances.append(p.evaluate('()=>ageOfAsh.game.hero.stance'))
  r['tests'].append({'name':'four-stance-ui','observed':stances,'threshold':'all four states reachable','pass':set(stances)=={'hold','passive','aggressive','defensive'}});assert r['tests'][-1]['pass'];screenshot('stances.png')
  ids=fixture(False);p.wait_for_timeout(300);select_ids(ids['left']);click_world(21,20);screenshot('crowd-start.png');wait_arrival('crowd-24',ids['left'],75)
  ids=fixture(True);p.wait_for_timeout(300);select_ids(ids['left']);click_world(19,9.5);select_ids(ids['right']);click_world(5,9.5);screenshot('narrow-start.png');wait_arrival('narrow-queues-8',ids['left']+ids['right'],85)
  r['pass']=all(t['pass'] for t in r['tests']) and not r['page_errors'] and not r['failed']
 except Exception as e:r['pass']=False;r['error']=str(e);screenshot('failure.png');print(str(e),flush=True)
 finally:c.tracing.stop(path=str(a.out/'trace.zip'));c.close();b.close();save()
print(json.dumps({'pass':r['pass'],'tests':[{'name':x['name'],'pass':x['pass']} for x in r['tests']],'out':str(a.out)}),flush=True)
