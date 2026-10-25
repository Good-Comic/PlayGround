"""Read-only local game server with explicit build provenance; never a deployment."""
import argparse,hashlib,json,subprocess
from pathlib import Path
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
ROOT=Path(__file__).resolve().parents[2]
def git(*args):return subprocess.check_output(['git','-C',str(ROOT),*args],text=True).strip()
class Handler(SimpleHTTPRequestHandler):
 def __init__(self,*a,**kw):super().__init__(*a,directory=str(ROOT),**kw)
 def end_headers(self):self.send_header('Cache-Control','no-store');super().end_headers()
 def do_GET(self):
  if self.path=='/__qa_build.json':
   data={'commit':git('rev-parse','HEAD'),'branch':git('branch','--show-current'),'dirty':bool(git('status','--porcelain')),'files':{str(p.relative_to(ROOT)):hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(ROOT.rglob('*')) if p.is_file() and (str(p.relative_to(ROOT)).startswith('js/') or p.name in ['index.html','styles.css'])}}
   b=json.dumps(data).encode();self.send_response(200);self.send_header('Content-Type','application/json');self.send_header('Content-Length',str(len(b)));self.end_headers();self.wfile.write(b)
  else:super().do_GET()
if __name__=='__main__':
 parser=argparse.ArgumentParser();parser.add_argument('--port',type=int,default=8008);args=parser.parse_args();ThreadingHTTPServer(('127.0.0.1',args.port),Handler).serve_forever()
