"""Actual online language selector, visible UI, screenshots and native Chinese Start/export."""
import argparse,json,platform
from pathlib import Path
from playwright.sync_api import sync_playwright
from live_runtime import launch_options,require_url,BUILD
p=argparse.ArgumentParser();p.add_argument('--url',required=True);p.add_argument('--out',type=Path,required=True);a=p.parse_args();require_url(a.url);a.out.mkdir(parents=True,exist_ok=True)
r=dict(stage='AFTER_DEPLOY_LIVE',source=BUILD,fixture='NONE; actual language selector/menu/Start/export; fresh disposable storage',checks=[],locales=[],console=[],page_errors=[],failed=[],http_errors=[])
with sync_playwright() as pw:
 b=pw.chromium.launch(**launch_options());c=b.new_context(viewport={'width':1600,'height':1100},accept_downloads=True,record_har_path=str(a.out/'network.har'));c.tracing.start(screenshots=True,snapshots=True);page=c.new_page();r['browser']=b.version
 page.on('console',lambda m:r['console'].append({'type':m.type,'text':m.text}));page.on('pageerror',lambda e:r['page_errors'].append(str(e)));page.on('requestfailed',lambda q:r['failed'].append({'url':q.url,'error':q.failure}));page.on('response',lambda q:r['http_errors'].append({'url':q.url,'status':q.status}) if q.status>=400 else None)
 def check(name,ok,observed):r['checks'].append(dict(name=name,passed=bool(ok),observed=observed));assert ok,(name,observed)
 try:
  page.goto(a.url);page.wait_for_function("window.ageOfAsh?.playtestBuild?.resourceVerification==='SHA256_MATCH_28_FILES'")
  r['runtime']=page.evaluate("()=>({ua:navigator.userAgent,platform:navigator.platform,build:ageOfAsh.playtestBuild,canvasType:document.querySelector('#game').getContext('2d')?'Canvas2D':null})")
  for locale,settings,title in [('en','Settings','Age of Ash'),('zh-Hant','設定','世紀帝國二'),('zh-Hans','设置','世纪帝国二'),('ja','設定','エイジ オブ エンパイア')]:
   page.locator('#setup-locale').select_option(locale);page.wait_for_timeout(150)
   observed=page.evaluate("()=>({lang:document.documentElement.lang,title:document.title,settings:document.querySelector('#btn-settings').textContent.trim(),start:document.querySelector('#btn-start').textContent.trim(),civLabel:document.querySelector('[data-i18n=\"menu.civ\"]').textContent,body:document.body.innerText.slice(0,500)})");r['locales'].append(observed)
   check('actual selector and visible menu '+locale,observed['lang']==locale and settings in observed['settings'] and bool(observed['civLabel']) and 'menu.' not in observed['body'],observed);page.screenshot(path=str(a.out/(locale+'-menu.png')))
  page.locator('#setup-locale').select_option('zh-Hant');page.locator('#setup-civ').select_option('CHN');page.locator('#setup-biome').select_option('steppe');page.locator('#setup-seed').fill('riftwatch-live-locale');page.locator('#btn-start').click();page.wait_for_timeout(800);check('native TraditionalChinese Start reaches actual game',page.evaluate('()=>!ageOfAsh.game.inMenu&&ageOfAsh.game.units.length>0'),page.evaluate('()=>({seed:ageOfAsh.game.seed,phase:ageOfAsh.game.phase,n:ageOfAsh.game.units.length})'));page.screenshot(path=str(a.out/'zh-Hant-game.png'));page.locator('#playtest-info-toggle').click()
  with page.expect_download() as pending:page.locator('#playtest-download').click()
  pending.value.save_as(str(a.out/'bug-report-zh-Hant.json'));report=json.loads((a.out/'bug-report-zh-Hant.json').read_text());check('native Chinese game BugJSON download uses actualBuild/seed',report['build']['commit']==BUILD and report['run']['seed']==page.evaluate('()=>ageOfAsh.game.seed'),{'build':report['build'],'run':report['run']});r['known_lqa_residue']='Start Game remains English in all three non-English menus; visible, usable, not full native-language LQA.'
  check('no runtime or network errors',not r['page_errors'] and not r['failed'] and not r['http_errors'] and not any(x['type']=='error' for x in r['console']),{'console':r['console'],'page':r['page_errors'],'failed':r['failed'],'http':r['http_errors']});r['pass']=True
 except Exception as e:r['pass']=False;r['error']=str(e);page.screenshot(path=str(a.out/'failure.png'))
 finally:c.tracing.stop(path=str(a.out/'trace.zip'));c.close();b.close();(a.out/'results.json').write_text(json.dumps(r,indent=2,ensure_ascii=False))
print(json.dumps({'pass':r['pass'],'checks':r['checks'],'error':r.get('error')},ensure_ascii=False));raise SystemExit(not r['pass'])
