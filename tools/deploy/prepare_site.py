"""Prepare version-addressed static hosting files; never creates a site/ref or changes Pages."""
import argparse,hashlib,json,re,zipfile
from pathlib import Path,PurePosixPath
def prepare(artifact,out):
 if out.exists():raise ValueError('Fresh destination required')
 with zipfile.ZipFile(artifact) as z:
  for name in z.namelist():
   if PurePosixPath(name).is_absolute() or '..' in PurePosixPath(name).parts:raise ValueError('Unsafe artifact path')
  meta=json.loads(z.read('build-metadata.json'));commit=meta['commit']
  if not re.fullmatch('[a-f0-9]{40}',commit) or meta.get('status')!='PLAYTEST-EXPERIMENTAL':raise ValueError('Not a source-pinned candidate')
  expected=set(meta['files'])|{'build-metadata.json','__qa_build.json','.nojekyll'}
  if set(z.namelist())!=expected:raise ValueError('Unexpected/unlisted artifact files')
  for path,value in meta['files'].items():
   if hashlib.sha256(z.read(path)).hexdigest()!=value:raise ValueError('Payload hash mismatch')
  dest=out/'builds'/commit;dest.mkdir(parents=True)
  for name in z.namelist():(dest/name).parent.mkdir(parents=True,exist_ok=True);(dest/name).write_bytes(z.read(name))
 (out/'.nojekyll').touch();url='builds/'+commit+'/'
 (out/'index.html').write_text('<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0;url='+url+'"><title>Riftwatch Playtest</title><h1>PLAYTEST-EXPERIMENTAL</h1><a href="'+url+'">Open verified local candidate '+commit+'</a>')
 current={'source_sha':commit,'status':'PLAYTEST-EXPERIMENTAL','relative_url':url,'built_at':meta['builtAt'],'source_artifact_sha256':hashlib.sha256(artifact.read_bytes()).hexdigest(),'hosting_status':'PREPARED_NOT_DEPLOYED','update_rule':'Add new build directory and root pointer; preserve old build directories. Rollback via a new normal commit changing pointer, never force push.'};(out/'CURRENT.json').write_text(json.dumps(current,indent=2)+'\n');return current
def main():
 p=argparse.ArgumentParser();p.add_argument('--artifact',type=Path,required=True);p.add_argument('--out',type=Path,required=True);p.add_argument('--zip',type=Path);a=p.parse_args()
 if a.zip and a.zip.exists():raise SystemExit('Preserve existing package')
 result=prepare(a.artifact,a.out)
 if a.zip:
  with zipfile.ZipFile(a.zip,'w',zipfile.ZIP_DEFLATED) as z:
   for f in sorted(a.out.rglob('*')):
    if f.is_file():z.write(f,str(f.relative_to(a.out)))
 print(json.dumps(result))
if __name__=='__main__':main()
