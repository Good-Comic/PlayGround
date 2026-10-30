#!/usr/bin/env python3
"""讀取透明邊界，保存含一像素邊緣的裁格資訊。 / Read alpha bounds and save crop metadata with a one-pixel gutter."""
import argparse,json
from pathlib import Path
from PIL import Image
p=argparse.ArgumentParser();p.add_argument('png');p.add_argument('out');p.add_argument('--size',type=int,required=True);a=p.parse_args();im=Image.open(a.png).convert('RGBA');crops=[]
for y in range(0,im.height,a.size):
 for x in range(0,im.width,a.size):
  b=im.crop((x,y,x+a.size,y+a.size)).getchannel('A').getbbox()
  if b:
   l,t,r,bt=max(0,b[0]-1),max(0,b[1]-1),min(a.size,b[2]+1),min(a.size,b[3]+1);crops.append([l,t,r-l,bt-t])
  else:crops.append([0,0,1,1])
Path(a.out).write_text('// 原創圖集透明裁格資訊；重建 PNG 後重新量測。 / Original atlas alpha crops; remeasure after rebuilding PNG.\nexport const FRAME_CROPS=Object.freeze('+json.dumps(crops,separators=(',',':'))+'.map(Object.freeze));\n')
print(json.dumps({'frames':len(crops),'fullPixels':len(crops)*a.size*a.size,'croppedPixels':sum(c[2]*c[3] for c in crops)}))
