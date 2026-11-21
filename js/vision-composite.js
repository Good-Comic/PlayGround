// 僅尋找可證明透明的矩形；不影響視野或原遮罩的像素。
export function transparentVisionRect(shapes, width, height) {
  if(!Number.isFinite(width)||!Number.isFinite(height)||width<=0||height<=0||width>65536||height>65536)return null;
  if(shapes.some(s=>![s.screenX,s.screenY,s.rx,s.ry].every(Number.isFinite)||s.rx<=0||s.ry<=0||Math.max(Math.abs(s.screenX),Math.abs(s.screenY),s.rx,s.ry)>1e6))return null;
  let best=null,area=width*height*.25;
  for(const fraction of [.15,.25,.35]) {
    const top=Math.ceil(height*fraction),bottom=Math.floor(height*(1-fraction));
    if(bottom<=top)continue;
    const intervals=[];
    for(const s of shapes) {
      // 將矩形向四邊各擴二像素後仍完全落在橢圓內，保留AA與取樣餘裕。
      const dy=Math.max(Math.abs(top-s.screenY),Math.abs(bottom-s.screenY))+2;
      if(dy>=s.ry)continue;
      const half=s.rx*Math.sqrt(1-(dy/s.ry)**2)-2;
      const left=Math.max(0,Math.ceil(s.screenX-half)),right=Math.min(width,Math.floor(s.screenX+half));
      if(right>left)intervals.push([left,right]);
    }
    intervals.sort((a,b)=>a[0]-b[0]);
    let left=0,right=0;
    const consider=()=>{const a=(right-left)*(bottom-top);if(a>area){area=a;best={left,top,right,bottom};}};
    for(const interval of intervals){if(interval[0]>right){consider();[left,right]=interval;}else right=Math.max(right,interval[1]);}
    consider();
  }
  return best;
}
