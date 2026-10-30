#!/usr/bin/env python3
"""原創條頓英雄：雙手戰鎚、翼冠重盔、白披風。 / Original Teuton hero: two-handed war hammer, winged heavy helm, white mantle."""
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
    hammer=f'''<g transform="translate({handx} {handy}) rotate({swing*side})"><path d="M0 22V-27" stroke="#4c3d2c" stroke-width="4"/><path d="M0 18V-26" stroke="#bea571" stroke-width="1.3"/><path d="M-12-32H10L14-25L10-19H-12L-15-25Z" fill="url(#steel)" stroke="#d7c58f" stroke-width="1.5"/><path d="M-7-31V-20M3-31V-20M-12-25H12" stroke="#536975" stroke-width="1.5"/><path d="M-1-35L2-40L4-35V-32" fill="#ced5bf" stroke="#7f927e"/><path d="M-4 3H4M-4 7H4M-4 11H4" stroke="#473f31" stroke-width="2"/></g>'''
    cloak=f'''<path d="M-17-46L{-29+step*.3} 5L-10 0L0 7L12 1L{29-step*.3} 5L17-46Z" fill="url(#cloth)" stroke="#6e766b" stroke-width="1.3"/><path d="M-18-37L-21-1M17-37L21 0M-10-27L-12 0" stroke="#a8ad96" fill="none"/>{'<path d="M-2-36V-5M-12-26H9" stroke="#3e4f51" stroke-width="5"/>' if back else ''}'''
    plates=''.join(f'<path d="M-12 {y}L0 {y+4}L12 {y}" fill="none" stroke="#d6dcc7" stroke-width="1.2"/>' for y in [-33,-26,-19])
    head=f'''<path d="M-10-65L-8-73L6-74L11-65L9-49L0-43L-9-49Z" fill="url(#steel)" stroke="#e4d9ab" stroke-width="1.2"/><path d="M{-6+dx*2:.2f}-61H{6+dx*2:.2f}M0-72V-49M-6-55H-3M3-55H6" stroke="#344950" stroke-width="2"/><path d="M-8-72L-17-82L-19-75L-13-62M7-73L16-82L19-75L13-62" fill="#c6bc94" stroke="#f0dfae" stroke-width="1.1"/><path d="M-7-75L-6-80L-2-77L1-83L4-77L8-80L9-75Z" fill="#c8ad6e" stroke="#f4df9f"/>'''
    arms=f'<path d="M-17-40L-19-29L{handx-3} {handy+6}M17-40L20-31L{handx+3} {handy+2}" fill="none" stroke="#81948f" stroke-width="6" stroke-linecap="round"/><path d="M-17-38L-18-31M17-38L19-32" stroke="#d6dbc3" stroke-width="2"/>'
    body=f'''<path d="M-16-46L-10-49L0-44L10-49L16-46L13-13L0-6L-13-13Z" fill="url(#steel)" stroke="#435b62" stroke-width="1.4"/>{plates}<path d="M-10-24L0-20L10-24L11-3L5 3L0-2L-6 3L-11-3Z" fill="#dad9bb" stroke="#929c85"/><path d="M-2-19V-3M-7-13H5" stroke="#344d51" stroke-width="3.5"/><path d="M-22-44L-14-49L-8-43L-12-32L-23-34ZM13-49L23-44L24-34L12-32L8-43Z" fill="url(#steel)" stroke="#d8c590" stroke-width="1.5"/><path d="M-23-45L-21-49L-17-47L-13-51L-9-46M10-46L14-50L18-47L22-49L24-45" stroke="#d3c7a0" stroke-width="3" fill="none"/>'''
    return f'''<g transform="translate(104 120)"><ellipse cy="5" rx="23" ry="6" fill="#182522" opacity=".28"/><g transform="translate({recoil} {bob}) rotate({fall})" opacity="{1-f*.13 if state=='death' else 1}">{cloak}<path d="M-7-7L{-8+step} 7M7-7L{8-step} 7" stroke="#415255" stroke-width="6"/><path d="M{-9+step} 7h-5M{9-step} 7h5" stroke="#83918b" stroke-width="3"/>{hammer if back else ''}{body}{arms}{head}{'' if back else hammer}{f'<circle cx="{handx}" cy="{handy}" r="{[3,6,10,4][f]}" fill="none" stroke="#e7d8a3" stroke-width="1.5"/>' if state=='cast' else ''}</g></g>'''
def build():
    defs='''<defs><linearGradient id="steel" x2="1" y2=".6"><stop stop-color="#dce2d1"/><stop offset=".35" stop-color="#8a9f9b"/><stop offset=".62" stop-color="#c1d0bd"/><stop offset="1" stop-color="#435b65"/></linearGradient><linearGradient id="cloth" x2="1" y2=".3"><stop stop-color="#e9e4c9"/><stop offset=".5" stop-color="#c7ccb3"/><stop offset="1" stop-color="#919f90"/></linearGradient></defs>'''
    cells=''.join(f'<g transform="translate({((d%4)*4+f)*208} {(r*2+d//4)*208})">{cell(d,s,f)}</g>' for r,s in enumerate(STATES) for d in range(8) for f in range(4))
    return '<svg xmlns="http://www.w3.org/2000/svg" width="3328" height="2496" viewBox="0 0 3328 2496"><title>Riftwatch original Teutonic hammer hero</title>'+defs+cells+'</svg>\n'
if __name__=='__main__':
    p=Path(__file__).resolve().parents[2]/'assets/sprites/teu-hero-atlas.svg';p.write_text(build());print(p)
