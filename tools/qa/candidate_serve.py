"""Immutable exact-commit LOCAL candidate. Never an OmGitHub deployment."""
import argparse,hashlib,io,json,re,subprocess,tarfile
from pathlib import Path
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
p=argparse.ArgumentParser();p.add_argument('--commit',required=True);p.add_argument('--port',type=int,required=True);p.add_argument('--directory',type=Path,required=True);a=p.parse_args();assert re.fullmatch('[a-f0-9]{40}',a.commit),'Full SHA required';assert not a.directory.exists(),'Use a fresh snapshot directory; existing data is never overwritten'
repo=Path(__file__).resolve().parents[2];resolved=subprocess.check_output(['git','-C',str(repo),'rev-parse',a.commit+'^{commit}'],text=True).strip();assert resolved==a.commit
archive=subprocess.check_output(['git','-C',str(repo),'archive',a.commit,'--','index.html','styles.css','js','assets']);a.directory.mkdir(parents=True)
with tarfile.open(fileobj=io.BytesIO(archive)) as t:t.extractall(a.directory,filter='data')
def hashes():return {str(f.relative_to(a.directory)):hashlib.sha256(f.read_bytes()).hexdigest() for f in sorted(a.directory.rglob('*')) if f.is_file()}
expected=hashes();manifest={'commit':a.commit,'branch':'isolated-local-candidate','verification_level':'LOCAL_ONLY_NOT_OMGITHUB','files':expected}
class Handler(SimpleHTTPRequestHandler):
 def __init__(self,*args,**kw):super().__init__(*args,directory=str(a.directory),**kw)
 def end_headers(self):self.send_header('Cache-Control','no-store');self.send_header('X-Riftwatch-Build-SHA',a.commit);self.send_header('X-Riftwatch-Verification','LOCAL_ONLY_NOT_OMGITHUB');super().end_headers()
 def do_GET(self):
  if self.path in ['/__candidate_build.json','/__qa_build.json']:
   data=json.dumps({**manifest,'dirty':hashes()!=expected}).encode();self.send_response(200);self.send_header('Content-Type','application/json');self.send_header('Content-Length',str(len(data)));self.end_headers();self.wfile.write(data);return
  super().do_GET()
print(json.dumps({'url':f'http://127.0.0.1:{a.port}','commit':a.commit,'scope':'LOCAL_ONLY_NOT_OMGITHUB','snapshot':str(a.directory)}),flush=True)
ThreadingHTTPServer(('127.0.0.1',a.port),Handler).serve_forever()
