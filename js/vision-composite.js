// 僅尋找可證明透明的矩形；不影響視野或原遮罩的像素。
export function transparentVisionRect(shapes, width, height) {
  if(!Number.isFinite(width)||!Number.isFinite(height)||width<=0||height<=0||width>65536||height>65536)return null;
  if(shapes.some(s=>![s.screenX,s.screenY,s.rx,s.ry].every(Number.isFinite)||s.rx<=0||s.ry<=0||Math.max(Math.abs(s.screenX),Math.abs(s.screenY),s.rx,s.ry)>1e6))return null;
  let best=null,area=width*height*.25;
  const bands=[];
  for(let row=0;row<16;row++) {
    const top=Math.floor(height*row/16),bottom=Math.floor(height*(row+1)/16),intervals=[];
    for(const s of shapes) {
      // 擴二像素後的條帶仍完全在橢圓內；聯集僅合併真正相接的區間。
      const dy=Math.max(Math.abs(top-s.screenY),Math.abs(bottom-s.screenY))+2;
      if(dy>=s.ry)continue;
      const half=s.rx*Math.sqrt(1-(dy/s.ry)**2)-2;
      const left=Math.max(0,Math.ceil(s.screenX-half)),right=Math.min(width,Math.floor(s.screenX+half));
      if(right>left)intervals.push([left,right]);
    }
    intervals.sort((a,b)=>a[0]-b[0]);const merged=[];
    for(const range of intervals){const prior=merged.at(-1);if(prior&&range[0]<=prior[1])prior[1]=Math.max(prior[1],range[1]);else merged.push(range);}
    bands.push({top,bottom,ranges:merged});
  }
  for(let top=0;top<bands.length;top++){
    let shared=bands[top].ranges;
    for(let bottom=top;bottom<bands.length&&shared.length;bottom++){
      if(bottom>top){const next=[],other=bands[bottom].ranges;let a=0,b=0;
        while(a<shared.length&&b<other.length){const left=Math.max(shared[a][0],other[b][0]),right=Math.min(shared[a][1],other[b][1]);if(right>left)next.push([left,right]);if(shared[a][1]<other[b][1])a++;else b++;}shared=next;
      }
      for(const [left,right] of shared){const a=(right-left)*(bands[bottom].bottom-bands[top].top);if(a>area){area=a;best={left,top:bands[top].top,right,bottom:bands[bottom].bottom};}}
    }
  }
  return best;
}
