#!/usr/bin/env python3
"""原創中國奇幻英雄：長柄偃月刀、紅纓、札甲與長鬚；非歷史復原。 / Original Chinese-inspired fantasy hero: long guandao, red plume, lamellar armour and long beard; not a historical reconstruction."""
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
    hammer=f'''<g transform="translate({handx} {handy}) rotate({swing*side}) scale({side} 1)"><path d="M0 31V-48" stroke="#5f4130" stroke-width="5"/><path d="M-1 30V-48" stroke="#d9b973" stroke-width="1.1"/><path d="M-2-47L4-57Q8-47 20-43Q22-33 11-27Q10-37 2-38L-2-38Z" fill="#8ea8a6" stroke="#e2dbad" stroke-width="1.5"/><path d="M5-54Q9-46 19-43Q22-33 12-28" fill="none" stroke="#eff0d4" stroke-width="2"/><path d="M-6-36L-9-23L-5-24L-3-34" fill="#a65043" stroke="#d19b6c"/><path d="M-3 5H3M-3 10H3M-3 15H3" stroke="#443c30" stroke-width="2"/></g>'''
    lily='<path d="M0-16L6-10L0-4L-6-10Z" fill="#bda36b" stroke="#e6d5a2"/><path d="M0-14V-6M-4-10H4" stroke="#6b7558"/>'
    cloak=f'''<path d="M-17-43L-27 4L-13 9L-3 1L0-9L4 1L15 9L28 3L17-43Z" fill="#395b50" stroke="#a69e6b" stroke-width="1.4"/><path d="M-17-32L-21 3M17-32L22 2" stroke="#7d9580"/>{f'<g transform="translate(0 -14)">{lily}</g>' if back else ''}'''
    plates=''.join(f'<path d="M-12 {y}L0 {y+4}L12 {y}" fill="none" stroke="#d6dcc7" stroke-width="1.2"/>' for y in [-33,-26,-19])
    head=f'''<path d="M-11-57L-10-67L-6-73H7L11-67L12-57L8-48H-8Z" fill="#7d8b75" stroke="#d7c08a" stroke-width="1.3"/><path d="M-5-72Q-12-85-1-94Q-3-82 5-76L3-70Z" fill="#a95846" stroke="#d7996a" stroke-width="1.2"/><path d="M-1-90L-1-78" stroke="#e4b080"/><path d="M-10-60H11M0-71V-61" stroke="#cbb47c" stroke-width="2"/>{'<path d="M-7-56Q0-60 8-56L6-45L0-42L-6-45Z" fill="#b68f66"/><path d="M-6-48Q0-41 7-48L5-27L0-18L-5-27Z" fill="#3d493f" stroke="#8b8765"/><path d="M-3-44L-2-27M3-44L2-27" stroke="#6a6e53"/><path d="M-5-53H-1M2-53H6" stroke="#39483b" stroke-width="1.5"/>' if not back else '<path d="M-9-56L-11-39L0-33L12-39L9-56" fill="#7f8e71" stroke="#c2b17b"/>'}'''
    arms=f'<path d="M-17-40L-19-29L{handx-3} {handy+6}M17-40L20-31L{handx+3} {handy+2}" fill="none" stroke="#81948f" stroke-width="6" stroke-linecap="round"/><path d="M-17-38L-18-31M17-38L19-32" stroke="#d6dbc3" stroke-width="2"/>'
    scales=''.join(f'<path d="M-13 {y}q3 6 6 0q3 6 6 0q3 6 6 0q3 6 6 0" fill="none" stroke="#d3b77e" stroke-width="1.3"/>' for y in [-38,-32,-26,-20])
    layers=''.join(f'<path d="M-13 {y}L0 {y+3}L13 {y}" stroke="#c0ac77" fill="none" stroke-width="2"/>' for y in [-37,-31,-25,-19])
    rivets=''.join(f'<path d="M{x}-39V-17" stroke="#5b6751" stroke-width="1.5"/>' for x in [-8,-3,3,8])
    body=f'''<path d="M-15-44L0-48L15-44L13-13L0-5L-13-13Z" fill="#869477" stroke="#455c4b"/>{layers}{rivets}<path d="M-13-16H13L17 8L7 10L0 4L-7 10L-17 8Z" fill="#3d6652" stroke="#c4b27b"/><path d="M-10-14L-13 7M-4-13L-5 6M4-13L5 6M10-14L13 7" stroke="#a99e6c"/><path d="M-14-16H14" stroke="#8b5540" stroke-width="4"/><path d="M-23-43L-15-48L-8-42L-12-31L-24-34ZM15-48L24-43L25-34L12-31L8-42Z" fill="#9c9e78" stroke="#d4c18a" stroke-width="1.3"/>'''
    shield=''
    return f'''<g transform="translate(104 120)"><ellipse cy="5" rx="23" ry="6" fill="#182522" opacity=".28"/><g transform="translate({recoil} {bob}) rotate({fall}) scale({.72+.28*abs(dy):.3f} 1)" opacity="{1-f*.13 if state=='death' else 1}">{cloak}<path d="M-7-7L{-8+step} 7M7-7L{8-step} 7" stroke="#415255" stroke-width="6"/><path d="M{-9+step} 7h-5M{9-step} 7h5" stroke="#83918b" stroke-width="3"/>{hammer if back else ''}{body}{arms}{shield if not back else ''}{head}{'' if back else hammer}{f'<circle cx="{handx}" cy="{handy}" r="{[3,6,10,4][f]}" fill="none" stroke="#e7d8a3" stroke-width="1.5"/>' if state=='cast' else ''}</g></g>'''
def build():
    defs='''<defs><linearGradient id="steel" x2="1" y2=".6"><stop stop-color="#dce2d1"/><stop offset=".35" stop-color="#8a9f9b"/><stop offset=".62" stop-color="#c1d0bd"/><stop offset="1" stop-color="#435b65"/></linearGradient><linearGradient id="cloth" x2="1" y2=".3"><stop stop-color="#e9e4c9"/><stop offset=".5" stop-color="#c7ccb3"/><stop offset="1" stop-color="#919f90"/></linearGradient></defs>'''
    cells=''.join(f'<g transform="translate({((d%4)*4+f)*208} {(r*2+d//4)*208})">{cell(d,s,f)}</g>' for r,s in enumerate(STATES) for d in range(8) for f in range(4))
    return '<svg xmlns="http://www.w3.org/2000/svg" width="3328" height="2496" viewBox="0 0 3328 2496"><title>Riftwatch original Chinese guandao red plume lamellar hero</title>'+defs+cells+'</svg>\n'
if __name__=='__main__':
    p=Path(__file__).resolve().parents[2]/'assets/sprites/chn-hero-atlas.svg';p.write_text(build());print(p)
