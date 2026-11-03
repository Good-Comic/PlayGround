"""Windows本機试玩啟動器；僅綁定loopback。 / Local playtest launcher; loopback only."""
import argparse,functools,hashlib,http.server,json,pathlib,threading,webbrowser,zipfile
p=argparse.ArgumentParser();p.add_argument('--port',type=int,default=8765);p.add_argument('--no-browser',action='store_true');a=p.parse_args();root=pathlib.Path(__file__).resolve().parent;archive=root/'riftwatch-internal-playtest-final.zip';app=root/'Riftwatch-Internal-563f107'
expected='ba0e9000b4aae8c67d80f434d38ee53d3d9261057f18ec548925c8f134fcf26a'
if hashlib.sha256(archive.read_bytes()).hexdigest()!=expected:raise SystemExit('ZIP SHA256 mismatch / ZIP雜湊不符')
with zipfile.ZipFile(archive) as z:
 meta=json.loads(z.read('build-metadata.json'))
 if len(meta['files'])!=128:raise SystemExit('Resource count mismatch')
 for name,digest in meta['files'].items():
  if hashlib.sha256(z.read(name)).hexdigest()!=digest:raise SystemExit('Resource hash mismatch: '+name)
 if not app.exists():
  for name in z.namelist():
   q=pathlib.PurePosixPath(name)
   if q.is_absolute() or '..' in q.parts:raise SystemExit('Unsafe archive path')
  z.extractall(app)
for name,digest in meta['files'].items():
 if not (app/name).is_file() or hashlib.sha256((app/name).read_bytes()).hexdigest()!=digest:raise SystemExit('Existing game files changed; extract delivery into a fresh folder / 既有檔案已改變，請在新資料夾解壓縮')
server=http.server.ThreadingHTTPServer(('127.0.0.1',a.port),functools.partial(http.server.SimpleHTTPRequestHandler,directory=str(app)));url=f'http://127.0.0.1:{a.port}/';print('Local only / 僅本機: '+url,flush=True);print('Stop: Ctrl+C / 按Ctrl+C停止',flush=True)
if not a.no_browser:threading.Timer(.5,lambda:webbrowser.open(url)).start()
try:server.serve_forever()
except KeyboardInterrupt:pass
finally:server.server_close()
