#!/usr/bin/env python3
"""原創哥德奇幻英雄：鋸背巨劍、毛皮鎖甲、裸首束髮與寬肩；非歷史復原。 / Original Gothic-inspired fantasy hero: sawback greatsword, fur/mail, bare head/topknot and broad shoulders; not a historical reconstruction."""
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
    hammer=f'''<g transform="translate({handx} {handy}) rotate({swing*side}) scale({side} 1)"><path d="M-4-4L-6-43L0-59L6-43L5-5L2 0H-2Z" fill="#a6b3aa" stroke="#e0d8b1" stroke-width="1.5"/><path d="M-5-39L-9-35L-5-32L-9-28L-5-25L-9-21L-5-18" fill="#879a92" stroke="#e0d8b1" stroke-width="1.2"/><path d="M0-52V-6" stroke="#536d6d" stroke-width="1.5"/><path d="M-12 0L-9-4L0-1L9-4L12 0" fill="none" stroke="#c8ae75" stroke-width="3"/><path d="M0 2V19" stroke="#5e4434" stroke-width="5"/><path d="M-3 6H3M-3 10H3M-3 14H3" stroke="#bc9d6b"/><circle cy="21" r="3" fill="#b7b596"/></g>'''
    lily='<path d="M0-16L6-10L0-4L-6-10Z" fill="#bda36b" stroke="#e6d5a2"/><path d="M0-14V-6M-4-10H4" stroke="#6b7558"/>'
    cloak='<path d="M-20-43L-31-2L-22 1L-19 8L-10 2L-3 7L4 2L12 7L20 2L29 5L31-3L20-43Z" fill="#685a47" stroke="#a99672" stroke-width="1.5"/><path d="M-23-29L-24-1M22-30L24-1" stroke="#91816a"/>'
    plates=''.join(f'<path d="M-12 {y}L0 {y+4}L12 {y}" fill="none" stroke="#d6dcc7" stroke-width="1.2"/>' for y in [-33,-26,-19])
    head=f'''<path d="M-9-54L-8-66Q0-74 9-65L10-54L7-45H-6Z" fill="#b0936c" stroke="#d4ba8f" stroke-width="1.3"/><path d="M-8-66Q-11-74 0-75L4-84L11-81L8-72L10-65Z" fill="#514b3d" stroke="#a19370"/><path d="M3-79L7-78" stroke="#c6ac75"/>{'<path d="M-5-58H-1M3-58H7" stroke="#3f493c" stroke-width="1.7"/><path d="M1-55L-1-50H3" stroke="#7d6850" fill="none"/><path d="M-6-48L-4-41L2-38L7-43L8-49Z" fill="#655841"/><path d="M-7-61L-4-54" stroke="#9b6750" stroke-width="1.4"/>' if not back else '<path d="M-7-64Q0-68 8-64V-49L0-46L-8-50Z" fill="#5d5743"/>'}'''
    arms=f'<path d="M-17-40L-19-29L{handx-3} {handy+6}M17-40L20-31L{handx+3} {handy+2}" fill="none" stroke="#81948f" stroke-width="6" stroke-linecap="round"/><path d="M-17-38L-18-31M17-38L19-32" stroke="#d6dbc3" stroke-width="2"/>'
    scales=''.join(f'<path d="M-13 {y}q3 6 6 0q3 6 6 0q3 6 6 0q3 6 6 0" fill="none" stroke="#d3b77e" stroke-width="1.3"/>' for y in [-38,-32,-26,-20])
    layers=''.join(f'<path d="M-13 {y}L0 {y+3}L13 {y}" stroke="#c0ac77" fill="none" stroke-width="2"/>' for y in [-37,-31,-25,-19])
    rivets=''.join(f'<path d="M{x}-39V-17" stroke="#5b6751" stroke-width="1.5"/>' for x in [-8,-3,3,8])
    mail=''.join(f'<path d="M-14 {y}q3 5 6 0q3 5 6 0q3 5 6 0q3 5 6 0" stroke="#a9b3a0" fill="none" stroke-width="1.1"/>' for y in [-36,-30,-24,-18])
    fur='<path d="M-26-43L-19-49L-15-46L-10-49L-5-44L0-47L6-44L12-49L17-46L23-49L29-41L28-31L22-34L18-28L13-33L7-30L0-34L-7-30L-13-33L-20-29L-22-34L-29-32Z" fill="#958970" stroke="#c8b996" stroke-width="1.4"/>'
    body=f'''<path d="M-18-43L0-46L18-43L16-12L0-5L-16-12Z" fill="#596b5f" stroke="#344c43"/>{mail}<path d="M-12-38L12-13M12-38L-12-13" stroke="#76523b" stroke-width="5"/><circle cy="-25" r="4" fill="#c6b17b"/><path d="M-15-16H15L15-4L8 2L0-2L-8 2L-15-4Z" fill="#736248" stroke="#b8a679"/>{fur}'''
    shield=''
    return f'''<g transform="translate(104 120)"><ellipse cy="5" rx="23" ry="6" fill="#182522" opacity=".28"/><g transform="translate({recoil} {bob}) rotate({fall}) scale({.72+.28*abs(dy):.3f} 1)" opacity="{1-f*.13 if state=='death' else 1}">{cloak}<path d="M-7-7L{-8+step} 7M7-7L{8-step} 7" stroke="#415255" stroke-width="6"/><path d="M{-9+step} 7h-5M{9-step} 7h5" stroke="#83918b" stroke-width="3"/>{hammer if back else ''}{body}{arms}{shield if not back else ''}{head}{'' if back else hammer}{f'<circle cx="{handx}" cy="{handy}" r="{[3,6,10,4][f]}" fill="none" stroke="#e7d8a3" stroke-width="1.5"/>' if state=='cast' else ''}</g></g>'''
def build():
    defs='''<defs><linearGradient id="steel" x2="1" y2=".6"><stop stop-color="#dce2d1"/><stop offset=".35" stop-color="#8a9f9b"/><stop offset=".62" stop-color="#c1d0bd"/><stop offset="1" stop-color="#435b65"/></linearGradient><linearGradient id="cloth" x2="1" y2=".3"><stop stop-color="#e9e4c9"/><stop offset=".5" stop-color="#c7ccb3"/><stop offset="1" stop-color="#919f90"/></linearGradient></defs>'''
    cells=''.join(f'<g transform="translate({((d%4)*4+f)*208} {(r*2+d//4)*208})">{cell(d,s,f)}</g>' for r,s in enumerate(STATES) for d in range(8) for f in range(4))
    return '<svg xmlns="http://www.w3.org/2000/svg" width="3328" height="2496" viewBox="0 0 3328 2496"><title>Riftwatch original Gothic sawback greatsword fur mail hero</title>'+defs+cells+'</svg>\n'
if __name__=='__main__':
    p=Path(__file__).resolve().parents[2]/'assets/sprites/got-hero-atlas.svg';p.write_text(build());print(p)
