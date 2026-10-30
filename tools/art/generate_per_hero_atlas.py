#!/usr/bin/env python3
"""原創波斯奇幻英雄：翼飾脊盔、瓣錘、日輪橢圓盾及層甲；非歷史復原。 / Original Persian-inspired fantasy hero: winged ridge helm, flanged mace, sun oval shield and lamellar armour; not a historical reconstruction."""
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
    hammer=f'''<g transform="translate({handx} {handy}) rotate({swing*side})"><path d="M0 20V-34" stroke="#534638" stroke-width="4"/><path d="M-1 17V-33" stroke="#dec485" stroke-width="1.2"/><path d="M-3-47L0-52L4-47L5-41L11-39L8-29L4-26H-4L-9-30L-11-40L-5-42Z" fill="#b6b8a0" stroke="#ece0ac" stroke-width="1.4"/><path d="M0-47V-27M-6-41L-4-29M6-41L4-29" stroke="#6e827b" stroke-width="2"/><path d="M-3 6H3M-3 10H3M-3 14H3" stroke="#6e543b" stroke-width="2"/><circle cy="22" r="2.5" fill="#c5a16b"/></g>'''
    rays=''.join(f'<path d="M{math.cos(i*math.pi/4)*8:.2f} {math.sin(i*math.pi/4)*8:.2f}L{math.cos(i*math.pi/4)*12:.2f} {math.sin(i*math.pi/4)*12:.2f}" stroke="#e2c783" stroke-width="1.5"/>' for i in range(8))
    lily=f'<circle r="5" fill="#b69056" stroke="#e8d29a" stroke-width="1.4"/>{rays}'
    cloak=f'''<path d="M-16-45L-30 1L-17 8L-4-1L0-13L5-1L18 8L30 1L16-45Z" fill="#63516d" stroke="#baa577" stroke-width="1.4"/><path d="M-18-35L-24 1M18-35L24 1" stroke="#988394"/>{f'<g transform="translate(0 -27) scale(.7)">{lily}</g>' if back else ''}'''
    plates=''.join(f'<path d="M-12 {y}L0 {y+4}L12 {y}" fill="none" stroke="#d6dcc7" stroke-width="1.2"/>' for y in [-33,-26,-19])
    head=f'''<path d="M-11-57L-9-69L0-79L9-69L12-57L8-46H-8Z" fill="#a3aea0" stroke="#e3cf98" stroke-width="1.4"/><path d="M0-77V-55M-7-69L-4-57M7-69L4-57" stroke="#6b827b" stroke-width="1.5"/><path d="M-8-69L-17-83L-20-81L-18-69L-12-62M8-69L17-83L20-81L18-69L12-62" fill="#dadcc4" stroke="#b9b58d" stroke-width="1.1"/><path d="M-17-78L-13-68M17-78L13-68" stroke="#8e9a8a"/>{'<path d="M-7-55Q0-60 7-55L6-46L0-43L-6-46Z" fill="#b38c62"/><path d="M-8-58L-10-47L-7-43L-5-53M8-58L10-47L7-43L5-53" fill="#c7bd8d" stroke="#e7d3a0"/><path d="M-5-46L-3-37L0-34L4-38L6-46Z" fill="#4f5140"/><path d="M-4-53H-1M2-53H5" stroke="#354840" stroke-width="1.5"/>' if not back else '<path d="M-8-55L-9-37L0-34L9-37L8-55" fill="#7d8e7e" stroke="#c8bd89"/>'}'''
    arms=f'<path d="M-17-40L-19-29L{handx-3} {handy+6}M17-40L20-31L{handx+3} {handy+2}" fill="none" stroke="#81948f" stroke-width="6" stroke-linecap="round"/><path d="M-17-38L-18-31M17-38L19-32" stroke="#d6dbc3" stroke-width="2"/>'
    layers=''.join(f'<path d="M-13 {y}L0 {y+4}L13 {y}L12 {y+5}L0 {y+9}L-12 {y+5}Z" fill="{color}" stroke="#d6bd82" stroke-width="1"/>' for y,color in [(-38,'#9d956e'),(-31,'#9a9270'),(-24,'#8b8d6c')])
    body=f'''<path d="M-16-45L0-48L16-45L13-13L0-5L-13-13Z" fill="#687e72" stroke="#425b56"/>{layers}<path d="M-13-16L13-16L15 3L6-2L0 4L-6-2L-15 3Z" fill="#6d566d" stroke="#c9b280"/><path d="M-14-15H14" stroke="#3f777a" stroke-width="4"/><circle cy="-15" r="3" fill="#dcc48b"/><path d="M-22-44L-14-48L-8-42L-12-32L-24-35ZM13-48L23-44L24-35L12-32L8-42Z" fill="#b2a174" stroke="#e5cf93" stroke-width="1.3"/>'''
    shield=f'''<g transform="translate({-20*side} -24) rotate({-8*side})"><ellipse rx="14" ry="21" fill="#526f70" stroke="#d8bd7c" stroke-width="2"/><ellipse rx="11" ry="18" fill="none" stroke="#8fa69a"/><g transform="scale(.78)">{lily}</g><path d="M-5-16L0-18L5-16M-5 16L0 18L5 16" stroke="#c5b481" fill="none"/></g>'''
    return f'''<g transform="translate(104 120)"><ellipse cy="5" rx="23" ry="6" fill="#182522" opacity=".28"/><g transform="translate({recoil} {bob}) rotate({fall}) scale({.72+.28*abs(dy):.3f} 1)" opacity="{1-f*.13 if state=='death' else 1}">{cloak}<path d="M-7-7L{-8+step} 7M7-7L{8-step} 7" stroke="#415255" stroke-width="6"/><path d="M{-9+step} 7h-5M{9-step} 7h5" stroke="#83918b" stroke-width="3"/>{hammer if back else ''}{body}{arms}{shield if not back else ''}{head}{'' if back else hammer}{f'<circle cx="{handx}" cy="{handy}" r="{[3,6,10,4][f]}" fill="none" stroke="#e7d8a3" stroke-width="1.5"/>' if state=='cast' else ''}</g></g>'''
def build():
    defs='''<defs><linearGradient id="steel" x2="1" y2=".6"><stop stop-color="#dce2d1"/><stop offset=".35" stop-color="#8a9f9b"/><stop offset=".62" stop-color="#c1d0bd"/><stop offset="1" stop-color="#435b65"/></linearGradient><linearGradient id="cloth" x2="1" y2=".3"><stop stop-color="#e9e4c9"/><stop offset=".5" stop-color="#c7ccb3"/><stop offset="1" stop-color="#919f90"/></linearGradient></defs>'''
    cells=''.join(f'<g transform="translate({((d%4)*4+f)*208} {(r*2+d//4)*208})">{cell(d,s,f)}</g>' for r,s in enumerate(STATES) for d in range(8) for f in range(4))
    return '<svg xmlns="http://www.w3.org/2000/svg" width="3328" height="2496" viewBox="0 0 3328 2496"><title>Riftwatch original Persian flanged mace winged helm sun shield hero</title>'+defs+cells+'</svg>\n'
if __name__=='__main__':
    p=Path(__file__).resolve().parents[2]/'assets/sprites/per-hero-atlas.svg';p.write_text(build());print(p)
