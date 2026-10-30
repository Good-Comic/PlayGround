#!/usr/bin/env python3
"""原創日本英雄：雙手刀、大袖札甲、鍬形盔與背旗。 / Original Japanese hero: two-handed sword, lamellar shoulder guards, crested kabuto and back banner."""
import math
from pathlib import Path
STATES=['idle','walk','attack','hit','death','cast']
def cell(d,state,f):
    dx,dy=math.cos(d*math.pi/4),math.sin(d*math.pi/4);back=dy<-.3;side=1 if dx>=0 else -1
    step=[-4,0,4,0][f] if state=='walk' else 0;bob=[0,-1,0,1][f] if state in ['walk','idle'] else 0
    swing=[-20,-56,48,1][f] if state=='attack' else -18
    fall=[0,24,53,82][f] if state=='death' else 0;recoil=[-2,-4,-1,0][f] if state=='hit' else 0
    hx,hy=12*side,-36-([0,8,14,3][f] if state=='cast' else 0)
    sword=f'''<g transform="translate({hx} {hy}) rotate({swing*side}) scale({side} 1)"><path d="M-1 2Q4-12 3-33L0-41Q1-13-4 1Z" fill="#c5d4ce" stroke="#52686b" stroke-width="1"/><path d="M0-31Q0-12-2 0" fill="none" stroke="#f1eed6" stroke-width="1"/><ellipse cy="4" rx="6" ry="2" fill="#b39a5f" stroke="#dbc18b"/><path d="M-1 6L-3 20" stroke="#403e37" stroke-width="4"/><path d="M-2 8L0 10M-2 12L-1 14M-3 16L-1 18" stroke="#bcae85" stroke-width="1.3"/></g>'''
    wave=[-1,0,2,0][f]
    banner=f'''<path d="M-19-18V-89" stroke="#6c5033" stroke-width="2.4"/><path d="M-18-86H{2+wave}L{-1+wave}-57H-18Z" fill="#8a443a" stroke="#d0b47c" stroke-width="1"/><circle cx="-8" cy="-73" r="6" fill="#d6c59b"/><path d="M-11-76L-5-73L-11-70Z" fill="#4d4e3c"/><path d="M-18-50L-13-44M-18-28L-13-25" stroke="#c8af7d"/>'''
    laces=''.join(f'<path d="M-12 {y}H12M-8 {y-2}v4M-2 {y-2}v4M4 {y-2}v4M10 {y-2}v4" stroke="#be9c69" stroke-width=".9" fill="none"/>' for y in [-38,-32,-26,-20])
    body=f'''<path d="M-14-45L-7-48L0-44L7-48L14-45L13-15L0-9L-13-15Z" fill="#4a4e4a" stroke="#c6af7b" stroke-width="1.3"/>{laces}<path d="M-13-16L-3-12L-5 3L-15-1ZM-2-11H4L6 4H-4ZM5-12L13-16L16-1L7 3Z" fill="#784d3e" stroke="#ccad74"/><path d="M-13-10L-6-7M-13-5L-6-2M-1-7H3M-1-2H4M7-7L14-10M8-2L15-5" stroke="#ccb17c" stroke-width="1.1"/><path d="M-22-45L-12-47L-11-27L-23-25ZM12-47L23-45L24-25L12-27Z" fill="#8b4f3c" stroke="#ccb17a" stroke-width="1.2"/><path d="M-22-40L-12-42M-22-34L-12-36M-22-28L-12-30M13-42L23-40M13-36L23-34M13-30L23-28" stroke="#d4b779" stroke-width="1.3"/><path d="M-17-19L18-4" stroke="#383d39" stroke-width="4"/><path d="M12-7L20-3" stroke="#c5a86d" stroke-width="2"/>'''
    head=f'''<path d="M-11-57Q-12-71 0-73Q12-71 11-57L16-51L8-44H-8L-16-51Z" fill="#454e4a" stroke="#bba778" stroke-width="1.2"/><path d="M-10-56L-14-48M-6-55L-9-47M6-55L9-47M10-56L14-48" stroke="#bd8f61" stroke-width="1.2"/><ellipse cx="{dx*2:.2f}" cy="-51" rx="5.5" ry="6" fill="{'#535c50' if back else '#b68f65'}"/><path d="M-9-62H9L10-57H-10Z" fill="#8f593f" stroke="#d0ae75"/><path d="M-7-64L-17-78Q-11-79-3-69L0-73L3-69Q11-79 17-78L7-64Z" fill="#c6a76b" stroke="#efdaad"/><path d="M-6-49L-5-43L0-40L5-43L6-49L2-46H-2Z" fill="#5e4b3b" stroke="#aa8b62"/>'''
    arms=f'<path d="M-15-33L-18-26L{hx-3} {hy+9}M15-33L18-26L{hx+3} {hy+2}" stroke="#7c694c" stroke-width="5" stroke-linecap="round" fill="none"/><path d="M-15-32L-17-27M15-32L17-27" stroke="#c3b089" stroke-width="1.5"/>'
    return f'''<g transform="translate(104 120)"><ellipse cy="5" rx="22" ry="6" fill="#172420" opacity=".28"/><g transform="translate({recoil} {bob}) rotate({fall})" opacity="{1-f*.13 if state=='death' else 1}">{banner}<path d="M-7-7L{-8+step} 7M7-7L{8-step} 7" stroke="#3c4943" stroke-width="6"/><path d="M{-9+step} 7h-5M{9-step} 7h5" stroke="#9a977b" stroke-width="3"/>{sword if back else ''}{body}{arms}{head}{'' if back else sword}{f'<circle cx="{hx}" cy="{hy}" r="{[3,6,10,4][f]}" fill="none" stroke="#e8d4a1" stroke-width="1.4"/>' if state=='cast' else ''}</g></g>'''
def build():
    cells=''.join(f'<g transform="translate({((d%4)*4+f)*208} {(r*2+d//4)*208})">{cell(d,s,f)}</g>' for r,s in enumerate(STATES) for d in range(8) for f in range(4))
    return '<svg xmlns="http://www.w3.org/2000/svg" width="3328" height="2496" viewBox="0 0 3328 2496"><title>Riftwatch original Japanese sword banner hero</title>'+cells+'</svg>\n'
if __name__=='__main__':
    p=Path(__file__).resolve().parents[2]/'assets/sprites/jpn-hero-atlas.svg';p.write_text(build());print(p)
