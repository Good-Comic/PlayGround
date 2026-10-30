#!/usr/bin/env python3
"""原創阿茲特克英雄：美洲虎面具、棉甲、黑曜石雙手武器。 / Original Aztec hero: jaguar mask, quilted cotton and two-handed obsidian weapon."""
import math
from pathlib import Path
STATES=['idle','walk','attack','hit','death','cast']
def cell(d,state,f):
    dx,dy=math.cos(d*math.pi/4),math.sin(d*math.pi/4);back=dy<-.3;side=1 if dx>=0 else -1
    step=[-4,0,4,0][f] if state=='walk' else 0;bob=[0,-1,0,1][f] if state in ['walk','idle'] else 0
    swing=[-18,-54,46,2][f] if state=='attack' else -16
    fall=[0,24,53,82][f] if state=='death' else 0;recoil=[-2,-4,-1,0][f] if state=='hit' else 0
    hx,hy=12*side,-36-([0,7,13,3][f] if state=='cast' else 0)
    teeth=''.join(f'<path d="M-6 {y}l-5 1l1 6l5 1ZM6 {y}l5 1l-1 6l-5 1Z" fill="#243d3e" stroke="#85978a" stroke-width=".8"/>' for y in [-34,-25,-16])
    weapon=f'''<g transform="translate({hx} {hy}) rotate({swing*side}) scale({side} 1)"><path d="M-6-37Q0-42 6-37V-10L2-5V18H-2V-5L-6-10Z" fill="#926c42" stroke="#d4b379" stroke-width="1.4"/>{teeth}<path d="M-1-34V-12M-3 4H3M-3 8H3M-3 12H3" stroke="#e1c68b" stroke-width="1.2"/></g>'''
    feathers=''.join(f'<path d="M{x}-57Q{x-6} {y-3} {x} {y}Q{x+6} {y+2} {x+3}-57Z" fill="{color}" stroke="#b8c59a" stroke-width=".8"/>' for x,y,color in [(-10,-80,'#376b59'),(-4,-90,'#4b8c70'),(3,-94,'#335c53'),(10,-86,'#729576'),(16,-76,'#b29c5d')])
    spots=''.join(f'<path d="M{x} {y}q-4-4-5 0q1 5 5 1" fill="none" stroke="#51462e" stroke-width="1.8"/>' for x,y in [(-20,-42),(18,-42),(-16,-33),(18,-32),(-13,-23),(15,-23)])
    cloak=f'''<path d="M-18-47L-25-15L-14-7L-5-14L0-10L7-15L15-7L25-15L18-47Z" fill="#b99558" stroke="#d9c18c" stroke-width="1.3"/>{spots}'''
    quilt=''.join(f'<path d="M-10 {y}L9 {y+15}M9 {y}L-10 {y+15}" stroke="#a69a71" stroke-width="1.1"/>' for y in [-40,-33,-26])
    torso=f'''<path d="M-13-42Q0-51 13-42L11-17L0-10L-11-17Z" fill="#d9d0aa" stroke="#8a7950" stroke-width="1.3"/>{quilt}<path d="M-12-17L0-12L12-17L12-8L6-4L0-9L-6-4L-12-8Z" fill="#426e5d" stroke="#ccb078"/><path d="M-9-9L-10 3M9-9L10 3" stroke="#bf9b6a" stroke-width="5"/><path d="M-15-44L-22-42L-24-31L-14-33M15-44L23-41L24-31L14-33" fill="#bd9a5e" stroke="#d8bf89" stroke-width="1.3"/>{spots}<path d="M-9-41Q0-33 9-41" fill="none" stroke="#517b62" stroke-width="4"/><circle cy="-36" r="3" fill="#d5af6b" stroke="#e4d2a0"/>'''
    head=f'''<path d="M-11-54Q-17-66-11-72L-6-69Q0-74 7-69L12-73Q18-65 12-54L8-44H-8Z" fill="#c4a265" stroke="#e0c68d" stroke-width="1.3"/><path d="M-12-66L-9-69L-6-65M8-66L11-69L13-65" stroke="#675034" stroke-width="2" fill="none"/><path d="M-9-61L-4-63M4-63L9-61" stroke="#3e4433" stroke-width="2"/><path d="M-10-54Q0-62 10-54L8-44L4-41H-4L-8-44Z" fill="#765b3e" stroke="#e1d0a4"/><ellipse cx="{dx*2:.2f}" cy="-49" rx="5" ry="6" fill="{'#665d41' if back else '#ad845b'}"/><path d="M-9-53L-6-47L-5-54M9-53L6-47L5-54" fill="#ede2b9"/><path d="M-3-64L0-62L3-64" fill="none" stroke="#6a4c31" stroke-width="1.5"/><circle cx="-9" cy="-58" r="1.4" fill="#635136"/><circle cx="9" cy="-58" r="1.4" fill="#635136"/>'''
    arms=f'<path d="M-16-34L-20-25L{hx-3} {hy+8}M16-34L20-26L{hx+3} {hy+2}" stroke="#b48b5c" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M-17-29L-19-25M17-29L19-25" stroke="#47715e" stroke-width="5"/>'
    return f'''<g transform="translate(104 120)"><ellipse cy="5" rx="22" ry="6" fill="#172720" opacity=".28"/><g transform="translate({recoil} {bob}) rotate({fall})" opacity="{1-f*.13 if state=='death' else 1}">{feathers}{cloak}<path d="M-7-7L{-8+step} 7M7-7L{8-step} 7" stroke="#ad885b" stroke-width="5"/><path d="M{-9+step} 7h-5M{9-step} 7h5" stroke="#5d5337" stroke-width="3"/>{weapon if back else ''}{torso}{arms}{head}{'' if back else weapon}{f'<circle cx="{hx}" cy="{hy}" r="{[3,6,10,4][f]}" fill="none" stroke="#e8d29d" stroke-width="1.5"/>' if state=='cast' else ''}</g></g>'''
def build():
    cells=''.join(f'<g transform="translate({((d%4)*4+f)*208} {(r*2+d//4)*208})">{cell(d,s,f)}</g>' for r,s in enumerate(STATES) for d in range(8) for f in range(4))
    return '<svg xmlns="http://www.w3.org/2000/svg" width="3328" height="2496" viewBox="0 0 3328 2496"><title>Riftwatch original Aztec jaguar obsidian hero</title>'+cells+'</svg>\n'
if __name__=='__main__':
    p=Path(__file__).resolve().parents[2]/'assets/sprites/azt-hero-atlas.svg';p.write_text(build());print(p)
