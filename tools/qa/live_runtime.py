"""Shared launch configuration for the exact authorized public D6 build, never local replay."""
import os,subprocess
from pathlib import Path
TARGET='https://good-comic.github.io/PlayGround/builds/d6ee34a5c5d3f2082ee635adb27d6405a41e5f3c/'
BUILD='d6ee34a5c5d3f2082ee635adb27d6405a41e5f3c'
def launch_options():
 home=Path('/workspace/diagnostics/riftwatch/live-d6/browser-home');db=home/'.pki/nssdb';db.mkdir(parents=True,exist_ok=True)
 if not (db/'cert9.db').exists():
  subprocess.run(['certutil','-N','-d',f'sql:{db}','--empty-password'],check=True)
  for cert in Path('/usr/local/share/ca-certificates').glob('*.crt'):
   subprocess.run(['certutil','-A','-d',f'sql:{db}','-n',cert.stem,'-t','C,,','-i',str(cert)],check=True)
 return dict(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'],env={**os.environ,'HOME':str(home)},proxy={'server':os.environ.get('HTTPS_PROXY') or os.environ.get('https_proxy') or 'http://proxy:8080'})
def require_url(url):
 assert url.rstrip('/')==TARGET.rstrip('/'),'Only the explicitly authorized online D6 build is accepted'
