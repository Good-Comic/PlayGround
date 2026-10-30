#!/usr/bin/env python3
"""原創撒拉森英雄：彎刀、小圓盾、纏巾盔與鱗甲。 / Original Saracen hero: curved sword, small round shield, wrapped helm and scale armour."""
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
    hammer=f'''<g transform="translate({handx} {handy}) rotate({swing*side}) scale({side} 1)"><path d="M-3 0Q-11-27 0-54Q-2-25 7-5L4 1Z" fill="#b5c9c8" stroke="#e4e3bc" stroke-width="1.4"/><path d="M-2-2Q-9-25-1-47" fill="none" stroke="#65858d"/><path d="M-9 2Q0-2 9 2" fill="none" stroke="#c6ac70" stroke-width="3"/><path d="M0 3V15" stroke="#63503a" stroke-width="4"/><circle cy="17" r="2.5" fill="#c9b17d"/></g>'''
    lily='<path d="M0-14L6-8L0-2L-6-8Z" fill="none" stroke="#d7bd7b" stroke-width="1.5"/><circle cy="-8" r="2" fill="#d7bd7b"/>'
    cloak=f'''<path d="M-17-46L-26 6L-10 3L0 8L12 3L26 6L17-46Z" fill="#3d6661" stroke="#ac9c67" stroke-width="1.4"/><path d="M-19-35L-22 0M18-35L22 0" stroke="#81a294"/>{f'<g transform="translate(0 -8)">{lily}</g>' if back else ''}'''
    plates=''.join(f'<path d="M-12 {y}L0 {y+4}L12 {y}" fill="none" stroke="#d6dcc7" stroke-width="1.2"/>' for y in [-33,-26,-19])
    head=f'''<path d="M-10-58L-8-71L0-81L9-71L12-58L8-45H-8Z" fill="#9b9d8a" stroke="#dbcf9c" stroke-width="1.3"/><path d="M-12-64Q0-73 13-64L12-54Q0-61-12-54Z" fill="#d5cfab" stroke="#9b9b7b"/><path d="M-10-61Q0-67 11-61M-10-57Q0-62 11-57" fill="none" stroke="#f0e7c7" stroke-width="1.2"/>{'<path d="M-8-52Q0-56 8-52L6-44H-6Z" fill="#ac8962"/><path d="M-6-51H-2M2-51H6" stroke="#374c46" stroke-width="1.5"/><path d="M-7-46L-5-35L0-31L6-37L8-46Z" fill="#4c4e40" stroke="#bca77a"/>' if not back else '<path d="M-8-53L-7-34L7-34L8-53" fill="#a7a589" stroke="#d3c89e"/>'}'''
    arms=f'<path d="M-17-40L-19-29L{handx-3} {handy+6}M17-40L20-31L{handx+3} {handy+2}" fill="none" stroke="#81948f" stroke-width="6" stroke-linecap="round"/><path d="M-17-38L-18-31M17-38L19-32" stroke="#d6dbc3" stroke-width="2"/>'
    scales=''.join(f'<path d="M-13 {y}q3 6 6 0q3 6 6 0q3 6 6 0q3 6 6 0" fill="none" stroke="#d3b77e" stroke-width="1.3"/>' for y in [-38,-32,-26,-20])
    body=f'''<path d="M-16-45L0-48L16-45L13-13L0-5L-13-13Z" fill="#737e64" stroke="#3b5a55"/>{scales}<path d="M-13-16L13-16L16 3L0-1L-16 3Z" fill="#3b6961" stroke="#c6ae75"/><path d="M-14-16H14" stroke="#b7a070" stroke-width="4"/><path d="M-23-44L-14-48L-8-42L-12-32L-24-35ZM13-48L23-44L24-35L12-32L8-42Z" fill="#838b70" stroke="#d1bd85" stroke-width="1.5"/>'''
    shield=f'''<g transform="translate({-20*side} -25) rotate({-8*side})"><circle r="13" fill="#6f7d64" stroke="#dac58c" stroke-width="2"/><circle r="9" fill="none" stroke="#bcc09b"/><path d="M-9 0H9M0-9V9" stroke="#adad88"/><circle r="4" fill="#c6b07b" stroke="#e2d4a8"/></g>'''
    return f'''<g transform="translate(104 120)"><ellipse cy="5" rx="23" ry="6" fill="#182522" opacity=".28"/><g transform="translate({recoil} {bob}) rotate({fall}) scale({.72+.28*abs(dy):.3f} 1)" opacity="{1-f*.13 if state=='death' else 1}">{cloak}<path d="M-7-7L{-8+step} 7M7-7L{8-step} 7" stroke="#415255" stroke-width="6"/><path d="M{-9+step} 7h-5M{9-step} 7h5" stroke="#83918b" stroke-width="3"/>{hammer if back else ''}{body}{arms}{shield if not back else ''}{head}{'' if back else hammer}{f'<circle cx="{handx}" cy="{handy}" r="{[3,6,10,4][f]}" fill="none" stroke="#e7d8a3" stroke-width="1.5"/>' if state=='cast' else ''}</g></g>'''
def build():
    defs='''<defs><linearGradient id="steel" x2="1" y2=".6"><stop stop-color="#dce2d1"/><stop offset=".35" stop-color="#8a9f9b"/><stop offset=".62" stop-color="#c1d0bd"/><stop offset="1" stop-color="#435b65"/></linearGradient><linearGradient id="cloth" x2="1" y2=".3"><stop stop-color="#e9e4c9"/><stop offset=".5" stop-color="#c7ccb3"/><stop offset="1" stop-color="#919f90"/></linearGradient></defs>'''
    cells=''.join(f'<g transform="translate({((d%4)*4+f)*208} {(r*2+d//4)*208})">{cell(d,s,f)}</g>' for r,s in enumerate(STATES) for d in range(8) for f in range(4))
    return '<svg xmlns="http://www.w3.org/2000/svg" width="3328" height="2496" viewBox="0 0 3328 2496"><title>Riftwatch original Saracen curved sword wrapped helm hero</title>'+defs+cells+'</svg>\n'
if __name__=='__main__':
    p=Path(__file__).resolve().parents[2]/'assets/sprites/sar-hero-atlas.svg';p.write_text(build());print(p)
