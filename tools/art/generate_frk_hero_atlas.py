#!/usr/bin/env python3
"""原創法蘭克英雄：長劍、鳶盾、冠盔與百合披袍。 / Original Frankish hero: long sword, kite shield, crowned helm and fleur-de-lis surcoat."""
import math
from pathlib import Path
STATES=['idle','walk','attack','hit','death','cast']
def cell(d,state,f):
    dx,dy=math.cos(d*math.pi/4),math.sin(d*math.pi/4);back=dy<-.3;side=1 if dx>=0 else -1
    step=[-4,0,4,0][f] if state=='walk' else 0
    bob=[0,-1.5,0,1][f] if state in ['idle','walk'] else 0
    swing=[-12,-48,42,4][f] if state=='attack' else [0,-12,-18,0][f] if state=='cast' else -12
    fall=[0,22,52,82][f] if state=='death' else 0
    recoil=[-2,-4,-1,0][f] if state=='hit' else 0
    handx=12*side;handy=-37-([0,8,13,3][f] if state=='cast' else 0)
    hammer=f'''<g transform="translate({handx} {handy}) rotate({swing*side})"><path d="M-3-19L0-55L4-19L3 2H-3Z" fill="#b8c9cb" stroke="#f0e8bb" stroke-width="1.4"/><path d="M0-48V1" stroke="#607e88"/><path d="M-10 2Q0-2 10 2" stroke="#d1b66b" stroke-width="3" fill="none"/><path d="M0 3V16" stroke="#69513d" stroke-width="4"/><circle cy="18" r="3" fill="#c7a961"/></g>'''
    lily='<path d="M0-8Q-6-15 0-20Q6-15 0-8M-2-9Q-13-17-11-7L-3-4M2-9Q13-17 11-7L3-4M-6-3H6M0-6V3" fill="none" stroke="#d4ba77" stroke-width="2"/>'
    cloak=f'''<path d="M-17-46L-26 6L-10 3L0 8L12 3L26 6L17-46Z" fill="#314f79" stroke="#ac9c67" stroke-width="1.4"/><path d="M-19-35L-22 0M18-35L22 0" stroke="#6c83a4"/>{f'<g transform="translate(0 -8)">{lily}</g>' if back else ''}'''
    plates=''.join(f'<path d="M-12 {y}L0 {y+4}L12 {y}" fill="none" stroke="#d6dcc7" stroke-width="1.2"/>' for y in [-33,-26,-19])
    head=f'''<path d="M-10-67Q0-77 11-67L10-51L0-44L-9-51Z" fill="url(#steel)" stroke="#d9d6af" stroke-width="1.3"/><path d="M-9-62H10M0-71V-48M-6-55H-3M3-55H6" stroke="#304856" stroke-width="2"/><path d="M-10-69L-12-78L-5-74L0-82L5-74L12-78L10-69Z" fill="#c9aa60" stroke="#eddb98" stroke-width="1.2"/><path d="M-8-68H8" stroke="#e8d49a" stroke-width="2"/>'''
    arms=f'<path d="M-17-40L-19-29L{handx-3} {handy+6}M17-40L20-31L{handx+3} {handy+2}" fill="none" stroke="#81948f" stroke-width="6" stroke-linecap="round"/><path d="M-17-38L-18-31M17-38L19-32" stroke="#d6dbc3" stroke-width="2"/>'
    body=f'''<path d="M-16-45L0-48L16-45L13-13L0-5L-13-13Z" fill="url(#steel)" stroke="#435b62"/>{plates}<path d="M-9-38H9L12 3L0-1L-12 3Z" fill="#345782" stroke="#d4ba77"/><g transform="translate(0 -13) scale(.7)">{lily}</g><path d="M-22-43L-14-48L-8-42L-12-33L-23-35ZM13-48L23-43L24-35L12-33L8-42Z" fill="url(#steel)" stroke="#c5b786" stroke-width="1.5"/>'''
    shield=f'''<g transform="translate({-19*side} -24) rotate({-8*side})"><path d="M-12-19Q0-25 12-19L9 3L0 19L-9 3Z" fill="#304c76" stroke="#d8be78" stroke-width="2"/><path d="M-10-18L-8 2L0 16" fill="none" stroke="#8096ad"/><g transform="translate(0 3) scale(.65)">{lily}</g></g>'''
    return f'''<g transform="translate(104 120)"><ellipse cy="5" rx="23" ry="6" fill="#182522" opacity=".28"/><g transform="translate({recoil} {bob}) rotate({fall}) scale({.72+.28*abs(dy):.3f} 1)" opacity="{1-f*.13 if state=='death' else 1}">{cloak}<path d="M-7-7L{-8+step} 7M7-7L{8-step} 7" stroke="#415255" stroke-width="6"/><path d="M{-9+step} 7h-5M{9-step} 7h5" stroke="#83918b" stroke-width="3"/>{hammer if back else ''}{body}{arms}{shield if not back else ''}{head}{'' if back else hammer}{f'<circle cx="{handx}" cy="{handy}" r="{[3,6,10,4][f]}" fill="none" stroke="#e7d8a3" stroke-width="1.5"/>' if state=='cast' else ''}</g></g>'''
def build():
    defs='''<defs><linearGradient id="steel" x2="1" y2=".6"><stop stop-color="#dce2d1"/><stop offset=".35" stop-color="#8a9f9b"/><stop offset=".62" stop-color="#c1d0bd"/><stop offset="1" stop-color="#435b65"/></linearGradient><linearGradient id="cloth" x2="1" y2=".3"><stop stop-color="#e9e4c9"/><stop offset=".5" stop-color="#c7ccb3"/><stop offset="1" stop-color="#919f90"/></linearGradient></defs>'''
    cells=''.join(f'<g transform="translate({((d%4)*4+f)*208} {(r*2+d//4)*208})">{cell(d,s,f)}</g>' for r,s in enumerate(STATES) for d in range(8) for f in range(4))
    return '<svg xmlns="http://www.w3.org/2000/svg" width="3328" height="2496" viewBox="0 0 3328 2496"><title>Riftwatch original Frankish sword kite shield hero</title>'+defs+cells+'</svg>\n'
if __name__=='__main__':
    p=Path(__file__).resolve().parents[2]/'assets/sprites/frk-hero-atlas.svg';p.write_text(build());print(p)
