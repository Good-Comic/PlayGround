"""Build an exact-commit static candidate outside Git; never deploy/configure hosting."""
import argparse,datetime,hashlib,html,io,json,re,subprocess,tarfile,zipfile
from pathlib import Path
def build(repo,commit,out,built_at=None):
 if not re.fullmatch('[a-f0-9]{40}',commit):raise ValueError('Full40-character commit required')
 if out.exists():raise ValueError('Fresh output directory required; rollback never overwrites artifacts')
 actual=subprocess.check_output(['git','-C',str(repo),'rev-parse',commit+'^{commit}'],text=True).strip()
 if actual!=commit:raise ValueError('Commit resolution mismatch')
 data=subprocess.check_output(['git','-C',str(repo),'archive',commit,'--','index.html','styles.css','js','assets','KNOWN-ISSUES.md'])
 out.mkdir(parents=True)
 with tarfile.open(fileobj=io.BytesIO(data)) as archive:archive.extractall(out,filter='data')
 if not (out/'js/playtest.js').exists():raise ValueError('Source is not a Playtest Candidate; legacy is not silently relabelled')
 known=(out/'KNOWN-ISSUES.md').read_text();(out/'KNOWN-ISSUES.html').write_text('<!doctype html><meta charset="utf-8"><title>Riftwatch known issues</title><style>body{max-width:55rem;margin:2rem auto;font:18px/1.6 system-ui;padding:1rem}pre{white-space:pre-wrap}</style><h1>PLAYTEST-EXPERIMENTAL</h1><pre>'+html.escape(known)+'</pre>')
 (out/'.nojekyll').touch()
 files={str(p.relative_to(out)):hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(out.rglob('*')) if p.is_file() and p.name!='.nojekyll'}
 meta={'id':'riftwatch-playtest-v1','commit':commit,'status':'PLAYTEST-EXPERIMENTAL','builtAt':built_at or datetime.datetime.now(datetime.timezone.utc).isoformat(),'branch':'codex/riftwatch-playtest-candidate','dirty':False,'files':files,'manifest_scope':'All served payload files; hosting control .nojekyll and metadata aliases excluded to avoid recursive hashes','verification_level':'AFTER_LOCAL_ONLY_UNTIL_AUTHORIZED_DEPLOY'}
 for name in ['build-metadata.json','__qa_build.json']:(out/name).write_text(json.dumps(meta,indent=2)+'\n')
 return meta
def main():
 p=argparse.ArgumentParser();p.add_argument('--repo',type=Path,default=Path(__file__).resolve().parents[2]);p.add_argument('--commit',required=True);p.add_argument('--out',type=Path,required=True);p.add_argument('--built-at');p.add_argument('--zip',type=Path);a=p.parse_args()
 if a.zip and a.zip.exists():raise SystemExit('Zip already exists; preserve existing delivery')
 meta=build(a.repo,a.commit,a.out,a.built_at)
 if a.zip:
  with zipfile.ZipFile(a.zip,'w',zipfile.ZIP_DEFLATED) as z:
   for f in sorted(a.out.rglob('*')):
    if f.is_file():z.write(f,str(f.relative_to(a.out)))
 print(json.dumps({'commit':meta['commit'],'files':len(meta['files']),'artifact':str(a.out),'zip':str(a.zip) if a.zip else None,'deployed':False}))
if __name__=='__main__':main()
