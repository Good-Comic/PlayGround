"""Focused LOCAL native browser checks for new v227 slices; never an online certification."""
import argparse,json
from pathlib import Path
from playwright.sync_api import sync_playwright
p=argparse.ArgumentParser();p.add_argument('--case',default='groups');p.add_argument('--url',required=True);p.add_argument('--sha',required=True);p.add_argument('--out',type=Path,required=True);a=p.parse_args();assert a.url.startswith('http://127.0.0.1:');a.out.mkdir(parents=True,exist_ok=True)
r={'stage':'AFTER_LOCAL','case':a.case,'source_sha':a.sha,'tests':[],'actions':[],'console':[],'errors':[],'failed':[],'http_errors':[],'fixture':'Native UI for scale; explicit clear-field initial state for tactical/wave cases; no skip/forced kill to settle waves'}
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox']);c=b.new_context(viewport={'width':1600,'height':1100},accept_downloads=True,record_har_path=str(a.out/'network.har'));c.tracing.start(screenshots=False,snapshots=True);c.add_init_script("if(!localStorage.getItem('riftwatch.playtest.run.v1'))localStorage.setItem('riftwatch.playtest.run.v1','D6_CANARY');if(!localStorage.getItem('riftwatch.playtest.settings.v1'))localStorage.setItem('riftwatch.playtest.settings.v1','D6_SETTINGS_CANARY')");page=c.new_page();r['browser']=b.version
 page.on('console',lambda m:r['console'].append({'type':m.type,'text':m.text}));page.on('pageerror',lambda e:r['errors'].append(str(e)));page.on('requestfailed',lambda q:r['failed'].append({'url':q.url,'error':q.failure}));page.on('response',lambda q:r['http_errors'].append({'url':q.url,'status':q.status}) if q.status>=400 else None)
 def check(name,ok,observed=None):r['tests'].append({'name':name,'pass':bool(ok),'observed':observed});assert ok,(name,observed)
 def world(x,y,button='left'):
  pos=page.evaluate('([x,y])=>{const p=ageOfAsh.game.screenPos(x,y),b=document.querySelector("#game").getBoundingClientRect();return{x:b.x+p.x,y:b.y+p.y}}',[x,y]);page.mouse.click(pos['x'],pos['y'],button=button);r['actions'].append({'world':[x,y],'button':button,'pointer':pos})
 def unit(name,button='left'):
  pos=page.evaluate('name=>{const u=window[name],g=ageOfAsh.game,p=g.screenPos(u.x,u.y),b=document.querySelector("#game").getBoundingClientRect();return{x:b.x+p.x,y:b.y+p.y-18*g.camera.zoom}}',name);page.mouse.click(pos['x'],pos['y'],button=button);r['actions'].append({'unit':name,'button':button,'pointer':pos})
 def ready():page.wait_for_function("window.ageOfAsh?.playtestBuild?.resourceVerification==='SHA256_MATCH_28_FILES'")
 def start():page.locator('#setup-civ').select_option('TEU');page.locator('#setup-biome').select_option('steppe');page.locator('#setup-seed').fill('riftwatch-p0-v1');page.locator('#btn-start').click()
 try:
  page.goto(a.url);ready();check('exact group build',page.evaluate('ageOfAsh.playtestBuild.commit')==a.sha)
  page.locator('#setup-locale').select_option('zh-Hant');page.locator('#btn-settings').click();page.locator('#settings-ui-scale').select_option('1.3');page.locator('#btn-settings-close').click();start();page.wait_for_timeout(200)
  page.evaluate("()=>{const g=ageOfAsh.game;window.actor=g.units.find(u=>u.type==='militia');window.ally=g.units.filter(u=>u.type==='militia')[1];window.hero=g.hero}")
  unit('actor');page.locator('[data-control-group="1"]').click(modifiers=['Control']);check('Ctrl-click stores actual selected soldier',page.evaluate('()=>ageOfAsh.game.controlGroups[1][0]===actor.id'))
  unit('ally');page.locator('[data-control-group="1"]').click(modifiers=['Control','Shift']);check('CtrlShift-click appends second soldier',page.evaluate('()=>ageOfAsh.game.controlGroups[1].length===2'))
  unit('hero');page.locator('[data-control-group="2"]').click(modifiers=['Control']);page.locator('[data-control-group="1"]').click(modifiers=['Shift']);check('Shift-click adds group to current selection',page.evaluate('()=>ageOfAsh.game.selection.length===3'))
  page.locator('[data-control-group="1"]').click();check('plain click recalls group and accessible count/pressed',page.evaluate('()=>ageOfAsh.game.selection.length===2') and page.locator('[data-control-group="1"]').get_attribute('aria-pressed')=='true' and '2' in page.locator('[data-control-group="1"]').inner_text())
  page.keyboard.press('Alt+2');check('existing keyboard group shortcuts preserved',page.evaluate('()=>ageOfAsh.game.selection.length===1&&ageOfAsh.game.selection[0]===hero'))
  page.screenshot(path=str(a.out/'groups-zh-Hant-130.png'));page.locator('#btn-pause').click();page.locator('#btn-pause-settings').click();page.locator('#settings-groups').uncheck();page.locator('#btn-settings-close').click();page.locator('#btn-save').click();page.reload();ready();page.locator('#btn-continue').click();check('SaveLoad keeps groups and Settings hides buttons',page.evaluate('()=>ageOfAsh.game.controlGroups[1].length===2&&ageOfAsh.ui.settings.showControlGroups===false') and page.locator('#control-groups').is_hidden());page.keyboard.press('Alt+1');check('hidden buttons do not disable keyboard groups',page.evaluate('()=>ageOfAsh.game.selection.length===2'));page.locator('#btn-pause').click();page.locator('#btn-pause-settings').click();page.locator('#settings-groups').check();page.locator('#btn-settings-close').click();page.locator('#btn-resume').click();check('Settings can restore clickable group panel',page.locator('#control-groups').is_visible())
  page.locator('#playtest-info-toggle').click()
  with page.expect_download() as pending:page.locator('#playtest-download').click()
  pending.value.save_as(str(a.out/'bug-report.json'));report=json.loads((a.out/'bug-report.json').read_text());check('BugJSON includes only allowlisted group visibility',report['settings']['showControlGroups'] is True);page.locator('#playtest-close').click()
  for width,height in [(1920,1080),(1280,720)]:
   page.set_viewport_size({'width':width,'height':height})
   for locale in ['en','zh-Hant','zh-Hans','ja']:
    page.reload();ready();page.locator('#setup-locale').select_option(locale);start();page.wait_for_timeout(100);page.evaluate("()=>{window.actor=ageOfAsh.game.units.find(u=>u.type==='militia')}");unit('actor')
    observed=page.evaluate("()=>{const b=document.getElementById('tactical-bar').getBoundingClientRect(),p=document.getElementById('selection-panel').getBoundingClientRect();return{width:innerWidth,height:innerHeight,bar:b.toJSON(),panel:p.toJSON(),overflow:document.documentElement.scrollWidth>innerWidth,label:document.querySelector('#control-groups>span').textContent,title:document.querySelector('[data-control-group]').title,scale:ageOfAsh.ui.settings.uiScale,start:document.getElementById('btn-start').textContent.trim()}}")
    check(f'{width}/{locale}:130percent group panel fits, translated, fixedEnglishStart',observed['scale']==1.3 and observed['bar']['top']>=60 and observed['bar']['bottom']<=observed['panel']['top']+1 and observed['bar']['right']<=width and not observed['overflow'] and not observed['label'].startswith('group.') and observed['start']=='Start Game',observed);page.screenshot(path=str(a.out/f'{width}-{locale}-groups.png'))
  check('no Console/Page/HTTP/request errors',not r['errors'] and not r['failed'] and not r['http_errors'] and not any(v['type']=='error' for v in r['console']));r['pass']=True
 except Exception as e:r['pass']=False;r['error']=str(e);page.screenshot(path=str(a.out/'failure.png'))
 finally:c.tracing.stop(path=str(a.out/'trace.zip'));c.close();b.close();(a.out/'results.json').write_text(json.dumps(r,indent=2,ensure_ascii=False))
print(json.dumps({'pass':r['pass'],'tests':[(t['name'],t['pass']) for t in r['tests']],'error':r.get('error')}));raise SystemExit(not r['pass'])
