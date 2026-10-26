"""AFTER_LOCAL browser acceptance. All synthetic fixtures are explicitly labelled.
The only save is in a fresh, local browser context, discarded on close.
"""
import argparse,json,time,gzip
from pathlib import Path
from playwright.sync_api import sync_playwright
parser=argparse.ArgumentParser();parser.add_argument('--out',type=Path,required=True);parser.add_argument('--url',default='http://127.0.0.1:8008');parser.add_argument('--expected-commit',required=True);a=parser.parse_args();assert a.url.startswith('http://127.0.0.1:');a.out.mkdir(parents=True,exist_ok=True)
r={'stage':'AFTER_LOCAL','tests':[],'actions':[],'console':[],'page_errors':[],'failed':[],'samples':[]}
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox']);c=b.new_context(viewport={'width':1600,'height':1100},record_har_path=str(a.out/'network.har'));c.tracing.start(screenshots=False,snapshots=True);p=c.new_page();p.on('console',lambda m:r['console'].append({'type':m.type,'text':m.text}));p.on('pageerror',lambda e:r['page_errors'].append(str(e)));p.on('requestfailed',lambda e:r['failed'].append({'url':e.url,'error':e.failure}))
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
  result={'name':name,'fixture':'synthetic local map, actual game engine, real drag selection/right-click','threshold':f'{len(ids)}/{len(ids)} idle within {timeout}s; penetration<=.025; clipping=0','arrived':obs['arrived'],'units':len(ids),'wall_seconds':time.monotonic()-start,'max_penetration':max_pen,'clipped_samples':clipped,'crossed_channel':len(crossed) if name.startswith('narrow') else None,'pass':obs['arrived']==len(ids) and max_pen<=.025 and clipped==0 and (not name.startswith('narrow') or len(crossed)==len(ids))};r['tests'].append(result);screenshot(name+'.png');save();assert result['pass'],result
 try:
  p.goto(a.url);p.wait_for_function("ageOfAsh?.playtestBuild?.resourceVerification==='SHA256_MATCH_28_FILES'");r['build']=p.evaluate('ageOfAsh.playtestBuild');assert r['build']['commit']==a.expected_commit
  p.locator('#setup-seed').fill('riftwatch-p0-v1');p.locator('#setup-civ').select_option('TEU');p.locator('#setup-biome').select_option('steppe');p.locator('#btn-start').click();p.wait_for_timeout(500)
  ids=fixture(True)
  p.evaluate("""()=>{const g=ageOfAsh.game;window.navCapture={snapshot:g.snapshot(),worldSeed:g.world.seed,frames:[],commands:[]};const update=g.update.bind(g),command=g.commandMove.bind(g);g.commandMove=(units,x,y)=>{const v=command(units,x,y);navCapture.commands.push({beforeFrame:navCapture.frames.length,time:g.time,ids:units.map(u=>u.id),x,y,goals:units.map(u=>({id:u.id,...u.targetPos}))});return v;};g.update=dt=>{const before=g.time;const value=update(dt);navCapture.frames.push({dt,before,time:g.time,nav:{...g.navigationStats},units:g.units.map(u=>({id:u.id,x:u.x,y:u.y,state:u.state,goal:u.targetPos,failure:u.orderFailure,nav:u._nav&&{...u._nav,points:u._nav.points.map(p=>({...p}))},distance:u.targetPos?Math.hypot(u.x-u.targetPos.x,u.y-u.targetPos.y):null,heading:u._heading&&{...u._heading},yield:u._yieldTo&&{...u._yieldTo},priority:u._trafficPriority,avoidUntil:u._avoidCrowdUntil,progress:u._progress&&{...u._progress},goalProgress:u._goalProgress&&{...u._goalProgress},staticLegal:g.isWalkable(u.x,u.y,u),nearest:g.units.filter(v=>v!==u).map(v=>({id:v.id,d:Math.hypot(u.x-v.x,u.y-v.y),state:v.state,r:(u.typeDef.radius||.24)+(v.typeDef.radius||.24)})).sort((a,b)=>a.d-b.d).slice(0,2)}))});return value;};}""")
  p.wait_for_timeout(300);select_ids(ids['left']);click_world(19,9.5);select_ids(ids['right']);click_world(5,9.5);screenshot('narrow-initial.png');wait_arrival('narrow-queues-8',ids['left']+ids['right'],85);r['pass']=True
 except Exception as e:r['pass']=False;r['error']=str(e);screenshot('narrow-failure.png')
 finally:
  capture=json.loads(p.evaluate('()=>{ageOfAsh.game.paused=true;return JSON.stringify(window.navCapture||null)}'))
  if capture:
   with gzip.open(a.out/'per-update.json.gz','wb') as f:f.write(json.dumps(capture,separators=(',',':')).encode())
   r['capture']={'frames':len(capture['frames']),'commands':capture['commands'],'last':capture['frames'][-1] if capture['frames'] else None,'scope':'actualChromium game.update inputs and native commands; controlled map; instrumentation walltime overhead not benchmark'}
  c.tracing.stop(path=str(a.out/'trace.zip'));c.close();b.close();save()
print(json.dumps({'pass':r['pass'],'tests':r['tests'],'frames':r.get('capture',{}).get('frames'),'out':str(a.out)}),flush=True)
