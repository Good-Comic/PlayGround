"""Compare captured HTTP bytes to a Git tree. Never runs that tree as a LIVE test."""
import argparse,base64,hashlib,json,subprocess
from pathlib import Path
from urllib.parse import urlparse
p=argparse.ArgumentParser();p.add_argument('--har',type=Path,required=True);p.add_argument('--repo',type=Path,required=True);p.add_argument('--commit',required=True);p.add_argument('--host',required=True);p.add_argument('--out',type=Path,required=True);p.add_argument('--path-prefix',default='');a=p.parse_args()
raw=subprocess.check_output(['git','-C',str(a.repo),'ls-tree','-r',a.commit],text=True);tree={line.split('\t',1)[1]:line.split()[2] for line in raw.splitlines()};records=[]
for entry in json.loads(a.har.read_text())['log']['entries']:
 u=urlparse(entry['request']['url']);prefix='/'+a.path_prefix.strip('/')+'/' if a.path_prefix else '/';
 if not u.path.startswith(prefix):continue
 path=u.path[len(prefix):] or 'index.html';content=entry['response']['content']
 if u.hostname!=a.host or 'text' not in content or path not in tree:continue
 b=base64.b64decode(content['text']) if content.get('encoding')=='base64' else content['text'].encode()
 actual=hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()
 original=actual;decoding='base64' if content.get('encoding')=='base64' else 'HAR-text-UTF8'
 if actual!=tree[path] and content.get('encoding')!='base64' and content.get('mimeType','').split(';')[0] in ['text/markdown','text/plain']:
  try:
   recovered=content['text'].encode('cp1252');candidate=hashlib.sha1(b'blob '+str(len(recovered)).encode()+b'\0'+recovered).hexdigest()
   if candidate==tree[path]:b=recovered;actual=candidate;decoding='HAR-charset-reconstruction-cp1252-matches-exact-Git-bytes'
  except UnicodeEncodeError:pass
 records.append({'url':entry['request']['url'],'path':path,'match':actual==tree[path],'captured_blob':actual,'git_blob':tree[path],'original_har_blob':original,'decoding':decoding})
a.out.write_text(json.dumps({'commit':a.commit,'records':records},indent=2));print('Compared',len(records),'resources;',sum(r['match'] for r in records),'match')
if not records or not all(r['match'] for r in records):raise SystemExit('Resource verification failed: zero comparisons or mismatched bytes')
