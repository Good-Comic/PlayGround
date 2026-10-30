#!/usr/bin/env python3
"""原創維京英雄：雙手長斧、毛皮肩披、眼罩盔與鬍辮。 / Original Viking hero: long two-handed axe, fur mantle, spectacle helm and braided beard."""
import math
from pathlib import Path
STATES=['idle','walk','attack','hit','death','cast']
def cell(d,state,f):
 dx,dy=math.cos(d*math.pi/4),math.sin(d*math.pi/4);back=dy<-.3;side=1 if dx>=0 else -1
 step=[-4,0,4,0][f] if state=='walk' else 0;bob=[0,-1,0,1][f] if state in ['idle','walk'] else 0
 swing=[-15,-55,44,3][f] if state=='attack' else -15;fall=[0,24,53,82][f] if state=='death' else 0;recoil=[-2,-4,-1,0][f] if state=='hit' else 0
 hx,hy=13*side,-35-([0,7,13,3][f] if state=='cast' else 0)
 axe=f'''<g transform="translate({hx} {hy}) rotate({swing*side}) scale({side} 1)"><path d="M0 24V-43" stroke="#47372c" stroke-width="5"/><path d="M-1 22V-43" stroke="#b39b70" stroke-width="1.4"/><path d="M-3-39L8-41Q16-39 25-44Q29-27 22-18Q15-29 7-29L-3-31Z" fill="#899fa4" stroke="#d2ded0" stroke-width="1.5"/><path d="M24-42Q27-28 22-20" stroke="#edf0d5" stroke-width="2.3" fill="none"/><path d="M-4-40H5V-29H-4Z" fill="#ac9869"/><path d="M-3 7H3M-3 11H3M-3 15H3" stroke="#e0c697" stroke-width="1.3"/></g>'''
 cloak='<path d="M-19-46L-27-3L-15 4L-5-1L2 6L12 0L23 4L29-4L19-46Z" fill="#4c6270" stroke="#263d49" stroke-width="1.5"/><path d="M-17-29L-20-2M16-27L21-1" stroke="#7a9194"/>'
 fur='<path d="M-22-47L-17-51L-12-48L-7-52L0-48L7-52L13-48L19-51L24-45L29-32L21-34L18-28L12-33L7-29L0-33L-8-29L-13-33L-20-29L-22-35L-29-33Z" fill="#8d8170" stroke="#c0b69b" stroke-width="1.3"/><path d="M-23-43L-19-38M-14-44L-12-38M14-44L12-38M23-43L19-38" stroke="#5c584e" stroke-width="2"/>'
 mail=''.join(f'<path d="M-12 {y}q3 4 6 0q3 4 6 0q3 4 6 0q3 4 6 0" stroke="#b4b7a0" fill="none" stroke-width="1"/>' for y in [-29,-24,-19,-14])
 body=f'<path d="M-16-40L15-40L13-7L0-2L-14-7Z" fill="#596b6e" stroke="#283e48"/>{mail}<path d="M-14-14L14-14" stroke="#70513b" stroke-width="5"/><path d="M-3-16H3V-12H-3Z" fill="#c8ad72"/>{fur}'
 face='' if back else '<path d="M-8-52L-6-43L-2-31L1-28L4-33L8-44L9-52Z" fill="#a97f4f" stroke="#d1ab75"/><path d="M-4-45L-1-34M4-45L2-34" stroke="#694e35" stroke-width="1.5"/><path d="M-3-35H3" stroke="#d0b16e" stroke-width="2"/>'
 head=f'<path d="M-11-55V-64Q-9-75 0-76Q11-74 12-64V-54L7-48H-7Z" fill="#71878b" stroke="#ccd3bb" stroke-width="1.4"/><path d="M0-75V-52M-10-60H11" stroke="#bba974" stroke-width="2.5"/>{face}'+('' if back else f'<path d="M-10-59L-2-61L0-57L3-61L11-59L8-52H3L0-55L-3-52H-8Z" fill="#b5b8a2" stroke="#d8d7b6"/><path d="M-8-57H-3M3-57H8" stroke="#28383e" stroke-width="2"/>')
 arms=f'<path d="M-18-33L-21-24L{hx-3} {hy+10}M18-33L21-25L{hx+3} {hy+1}" stroke="#957b5b" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M-20-28L-21-24M20-28L21-25" stroke="#5d6c6a" stroke-width="6"/>'
 return f'<g transform="translate(104 120)"><ellipse cy="5" rx="24" ry="6" fill="#172720" opacity=".28"/><g transform="translate({recoil} {bob}) rotate({fall})" opacity="{1-f*.13 if state=="death" else 1}">{cloak}<path d="M-7-6L{-8+step} 7M7-6L{8-step} 7" stroke="#6c6251" stroke-width="6"/><path d="M{-9+step} 7h-5M{9-step} 7h5" stroke="#403c34" stroke-width="3"/>{axe if back else ""}{body}{arms}{head}{"" if back else axe}{f"<circle cx=\"{hx}\" cy=\"{hy}\" r=\"{[3,6,10,4][f]}\" fill=\"none\" stroke=\"#e8d29d\" stroke-width=\"1.5\"/>" if state=="cast" else ""}</g></g>'
def build():
 cells=''.join(f'<g transform="translate({((d%4)*4+f)*208} {(r*2+d//4)*208})">{cell(d,s,f)}</g>' for r,s in enumerate(STATES) for d in range(8) for f in range(4))
 return '<svg xmlns="http://www.w3.org/2000/svg" width="3328" height="2496" viewBox="0 0 3328 2496"><title>Riftwatch original Viking long axe spectacle helm hero</title>'+cells+'</svg>\n'
if __name__=='__main__':
 p=Path(__file__).resolve().parents[2]/'assets/sprites/vik-hero-atlas.svg';p.write_text(build());print(p)
