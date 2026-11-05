#!/usr/bin/env python3
"""只傳遞可見 UI 與原生輸入；不提供 JavaScript evaluate 入口。"""
import json,sys,time,uuid,pathlib
root=pathlib.Path(sys.argv[1]).resolve()
role=sys.argv[2]; op=sys.argv[3]; args=json.loads(sys.argv[4]) if len(sys.argv)>4 else {}
if role not in ('A','B','C'): raise SystemExit('INVALID_ROLE')
d=root/'players'/role/'inbox'; d.mkdir(parents=True,exist_ok=True)
key=uuid.uuid4().hex;p=d/(key+'.request.json');tmp=p.with_suffix('.tmp')
tmp.write_text(json.dumps({'op':op,**args}));tmp.rename(p)
answer=d/(key+'.response.json');start=time.monotonic()
while not answer.exists():
 if time.monotonic()-start>55:raise SystemExit('CLIENT_WAIT_TIMEOUT: 不代表遊戲操作失敗，請先 observe')
 time.sleep(.1)
print(answer.read_text())
