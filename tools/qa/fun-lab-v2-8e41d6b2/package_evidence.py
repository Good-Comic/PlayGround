"""完整封存已結束lab，不改seal；分塊避免GitHub單檔上限，原文可重建。"""
import argparse,hashlib,json,pathlib,tarfile,tempfile
p=argparse.ArgumentParser();p.add_argument('--lab',type=pathlib.Path,required=True);p.add_argument('--out',type=pathlib.Path,required=True);p.add_argument('--role',choices=['A','B','C']);a=p.parse_args()
if a.out.exists():raise SystemExit('FRESH_OUTPUT_REQUIRED')
a.out.mkdir(parents=True);h=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
files=[p for p in sorted(a.lab.rglob('*')) if p.is_file() and (not a.role or (len(p.relative_to(a.lab).parts)>=2 and p.relative_to(a.lab).parts[0] in ['players','private-observer'] and p.relative_to(a.lab).parts[1]==a.role) or len(p.relative_to(a.lab).parts)==1)]
manifest=[{'path':str(p.relative_to(a.lab)),'bytes':p.stat().st_size,'sha256':h(p)} for p in files]
with tempfile.TemporaryDirectory(dir='/tmp') as d:
 archive=pathlib.Path(d)/'evidence.tar.gz'
 with tarfile.open(archive,'w:gz',compresslevel=6) as t:
  for f in files:t.add(f,arcname=str(f.relative_to(a.lab)),recursive=False)
 sha=h(archive);parts=[]
 with archive.open('rb') as source:
  n=0
  while data:=source.read(40*1024*1024):
   f=a.out/f'evidence.tar.gz.part{n:03}';f.write_bytes(data);parts.append({'name':f.name,'bytes':len(data),'sha256':h(f)});n+=1
 (a.out/'MANIFEST.json').write_text(json.dumps({'scope':'完整原始公開玩家、私有唯讀觀測與inbox；封存未改，沒有curated省略','lab':str(a.lab),'role':a.role,'files':manifest,'parts':parts,'archiveSha256':sha,'recovery':'依parts順序連接為evidence.tar.gz，先驗archiveSha256，再解壓；以files逐一核SHA與既有玩家seal。'},ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'files':len(files),'parts':len(parts),'archiveSha256':sha}))
