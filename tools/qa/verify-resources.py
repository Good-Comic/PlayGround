"""Compare captured HTTP bytes to a Git tree. Never runs that tree as a LIVE test."""
import argparse,base64,hashlib,json,subprocess
from pathlib import Path
from urllib.parse import urlparse
p=argparse.ArgumentParser();p.add_argument('--har',type=Path,required=True);p.add_argument('--repo',type=Path,required=True);p.add_argument('--commit',required=True);p.add_argument('--host',required=True);p.add_argument('--out',type=Path,required=True);a=p.parse_args()
raw=subprocess.check_output(['git','-C',str(a.repo),'ls-tree','-r',a.commit],text=True);tree={line.split('\t',1)[1]:line.split()[2] for line in raw.splitlines()};records=[]
for entry in json.loads(a.har.read_text())['log']['entries']:
 u=urlparse(entry['request']['url']);path=u.path.lstrip('/') or 'index.html';content=entry['response']['content']
 if u.hostname!=a.host or 'text' not in content or path not in tree:continue
 b=base64.b64decode(content['text']) if content.get('encoding')=='base64' else content['text'].encode()
 actual=hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()
 records.append({'url':entry['request']['url'],'path':path,'match':actual==tree[path],'captured_blob':actual,'git_blob':tree[path]})
a.out.write_text(json.dumps({'commit':a.commit,'records':records},indent=2));print('Compared',len(records),'resources;',sum(r['match'] for r in records),'match')
