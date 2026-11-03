"""固定來源官方構建與原ZIP重現；不部署。 / Official pinned build and original ZIP reproduction; no deployment."""
import argparse,hashlib,json,pathlib,subprocess,sys,tempfile,zipfile,shutil
p=argparse.ArgumentParser();p.add_argument('--repo',type=pathlib.Path,required=True);p.add_argument('--out',type=pathlib.Path,required=True);a=p.parse_args();recipe=json.loads((pathlib.Path(__file__).parent/'zip-recipe.json').read_text())
if a.out.exists():raise SystemExit('Fresh delivery output required')
a.out.mkdir(parents=True)
with tempfile.TemporaryDirectory() as folder:
 t=pathlib.Path(folder);builder=subprocess.check_output(['git','-C',str(a.repo),'show',recipe['source']+':tools/qa/build_playtest.py'])
 if hashlib.sha256(builder).hexdigest()!=recipe['builder_sha256']:raise SystemExit('Pinned builder SHA256 mismatch')
 tool=t/'build_playtest.py';tool.write_bytes(builder);game=t/'game'
 subprocess.run([sys.executable,str(tool),'--repo',str(a.repo),'--commit',recipe['source'],'--out',str(game),'--built-at',recipe['built_at'],'--branch',recipe['branch'],'--build-id',recipe['build_id'],'--zip',str(t/'official.zip')],check=True)
 for name,expected in recipe['payload_hashes'].items():
  if hashlib.sha256((game/name).read_bytes()).hexdigest()!=expected:raise SystemExit('Payload mismatch: '+name)
 target=a.out/'riftwatch-internal-playtest-final.zip'
 with zipfile.ZipFile(target,'w',zipfile.ZIP_DEFLATED) as z:
  z.comment=bytes.fromhex(recipe['archive_comment'])
  for row in recipe['entries']:
   i=zipfile.ZipInfo(row['filename'],tuple(row['date_time']))
   for k,v in row.items():
    if k not in ['filename','date_time','extra','comment']:setattr(i,k,v)
   i.extra=bytes.fromhex(row['extra']);i.comment=bytes.fromhex(row['comment']);z.writestr(i,(game/i.filename).read_bytes())
 digest=hashlib.sha256(target.read_bytes()).hexdigest()
 if digest!=recipe['expected_zip_sha256'] or target.stat().st_size!=recipe['expected_zip_bytes']:raise SystemExit('Original ZIP reproduction mismatch; do not distribute')
 (a.out/'SHA256SUMS.txt').write_text(digest+'  '+target.name+'\n')
 (a.out/'DELIVERY.json').write_text(json.dumps({'source':recipe['source'],'zip_sha256':digest,'zip_bytes':target.stat().st_size,'resource_count':len(recipe['payload_hashes']),'resource_mismatches':0,'original_zip_byte_identical':True},indent=2)+'\n')
 for name in ['START-WINDOWS.cmd','serve_windows.py','WINDOWS-README.md']:shutil.copyfile(pathlib.Path(__file__).parent/name,a.out/name)
 print(json.dumps({'zip':str(target),'sha256':digest,'resources':128,'byte_identical':True}))
