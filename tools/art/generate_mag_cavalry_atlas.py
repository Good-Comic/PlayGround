#!/usr/bin/env python3
"""原創馬札爾輕騎：裸馬、弧刀、皮甲與圓盾。 / Original Magyar light rider: unbarded horse, sabre, leather armor and round shield."""
import math
from pathlib import Path
STATES = ['idle', 'walk', 'attack', 'hit', 'death']

def cell(d, state, f):
    a=d*math.pi/4; dx,dy=math.cos(a),math.sin(a); back=dy<-.3; side=1 if dx>=0 else -1
    stride=[-5,1,5,-1][f] if state=='walk' else 0
    bob=[0,-2,0,1][f] if state=='walk' else math.sin(f*math.pi/2)*.6 if state=='idle' else 0
    fall=[0,20,52,82][f] if state=='death' else 0
    recoil=[-2,-5,-1,0][f] if state=='hit' else 0
    rx=14+12*abs(dx); hx,hy=26*dx,-31+7*dy
    legs=[]
    for i,(x,y) in enumerate([(-rx*.65,-19),(rx*.6,-19),(-rx*.45,-13),(rx*.75,-13)]):
        step=stride*(1 if i%2 else -1)
        legs.append(f'<path d="M{x:.2f} {y}L{x+step*.5:.2f} -7L{x+step:.2f} 2" fill="none" stroke="{"#5a3b2c" if i<2 else "#9e7048"}" stroke-width="4"/><path d="M{x+step-2:.2f} 3H{x+step+3:.2f}" stroke="#30312b" stroke-width="2.5"/>')
    head=f'''<path d="M{15*dx:.2f}-24Q{18*dx:.2f}-40 {hx:.2f} {hy-10:.2f}L{hx+7*dx:.2f} {hy-4:.2f}L{hx+9*dx:.2f} {hy+3:.2f}L{hx+4*dx:.2f} {hy+7:.2f}L{hx-4*dx:.2f} {hy+1:.2f}L{10*dx:.2f}-17Z" fill="url(#horse)" stroke="#493c2d" stroke-width="1.3"/>
    <path d="M{hx-4*dx:.2f} {hy-8:.2f}L{hx-5*dx:.2f} {hy-17:.2f}L{hx+dx:.2f} {hy-10:.2f}" fill="#574132"/>
    <path d="M{14*dx:.2f}-28Q{14*dx:.2f}-39 {hx-3*dx:.2f} {hy-10:.2f}" fill="none" stroke="#392f28" stroke-width="4"/>
    <path d="M{hx+7*dx:.2f} {hy+1:.2f}L{hx-2*dx:.2f} {hy-4:.2f}L{hx-5*dx:.2f} {hy+4:.2f}Q5-24 1-37" fill="none" stroke="#c4a275" stroke-width="1.2"/>
    <circle cx="{hx+2*dx:.2f}" cy="{hy-5:.2f}" r="1.2" fill="#171f1e"/><path d="M{hx+4*dx:.2f} {hy-3:.2f}l-2 6" stroke="#d4c5a1" stroke-width="2"/>'''
    swing=[-12,-72,58,4][f] if state=='attack' else -22
    saber=f'''<g transform="translate({13*side} -43) rotate({swing*side}) scale({side} 1)"><path d="M1 5Q9-5 13-22Q15-33 12-40Q12-18-2 2Z" fill="url(#steel)" stroke="#42545b" stroke-width="1"/><path d="M3-1Q12-18 12-34" fill="none" stroke="#ece6ca"/><path d="M-6 5Q1 1 8 7M0 7L-2 15" fill="none" stroke="#c6a16a" stroke-width="3"/></g>'''
    shield='''<g transform="translate(-13 -39)"><ellipse rx="12" ry="15" fill="#6a5038" stroke="#cead76" stroke-width="1.7"/><ellipse rx="9" ry="12" fill="#906842" stroke="#b99b68"/><path d="M-8-7L7 6M-8 5L7-7" stroke="#5e4933" stroke-width="2"/><ellipse rx="3.5" ry="4" fill="url(#steel)" stroke="#d3bb83"/><path d="M-5-12L-3-9M5 11L3 8" stroke="#e1c588"/></g>'''
    rows=''.join(f'<path d="M-8 {y}L0 {y+2}L8 {y}M-4 {y+1}v3M3 {y+1}v3" fill="none" stroke="#c0a071" stroke-width=".9"/>' for y in [-47,-42,-37])
    rider=f'''<path d="M-6-34L-13-19L-9-14M6-34L13-20L12-15" fill="none" stroke="#4d4a38" stroke-width="4"/><path d="M-14-14H-7M10-14H17" stroke="#302f28" stroke-width="3"/>
    <path d="M-11-50L0-54L11-50L9-34L4-26L0-30L-4-26L-10-33Z" fill="url(#leather)" stroke="#5c4932" stroke-width="1.3"/>{rows}<path d="M-9-34H9" stroke="#d4b476" stroke-width="2"/>
    <path d="M-10-49L-14-38M9-49L{13*side}-43" stroke="#796544" stroke-width="4"/>
    <path d="M-9-39L-8-24L-4-21L-2-36Z" fill="#514431" stroke="#bba071"/>
    <ellipse cx="{dx*2:.2f}" cy="-59" rx="5.5" ry="7" fill="{'#594d3b' if back else '#bb956a'}" stroke="#68563d"/>
    <path d="M-8-62Q-8-69 0-77Q8-69 8-62L7-58H-7Z" fill="url(#steel)" stroke="#d5bc85" stroke-width="1"/><path d="M-8-62Q0-66 8-62L8-57Q0-60-8-57Z" fill="#65513b" stroke="#a88c5e"/>
    <path d="M-6-58L-8-50M6-58L8-50" stroke="#674c33" stroke-width="2"/>{'' if back else shield}{'' if back else saber}'''
    return f'''<g transform="translate(96 112)"><ellipse cy="5" rx="29" ry="7" fill="#18251e" opacity=".28"/><g transform="translate({recoil} {bob}) rotate({fall})" opacity="{1-f*.13 if state=='death' else 1}">{''.join(legs[:2])}{head if back else ''}<ellipse cy="-24" rx="{rx:.2f}" ry="13" fill="url(#horse)" stroke="#604733" stroke-width="1.2"/><path d="M{-rx*.8:.2f}-28Q{-rx*1.5:.2f}-20 {-rx*1.2:.2f} -4" fill="none" stroke="#3b3028" stroke-width="4"/>
    <path d="M-13-32L13-32L15-17L0-20L-15-17Z" fill="#716548" stroke="#d3b379" stroke-width="1.2"/><path d="M-12-25H12M-9-22L0-26L9-22" stroke="#bca577" fill="none"/><path d="M-9-34Q0-40 9-34L7-28H-8Z" fill="#4b3d2e" stroke="#b59361"/>{''.join(legs[2:])}{'' if back else head}{shield+saber if back else ''}{rider}</g></g>'''

def build():
    cells=[]
    for row,state in enumerate(STATES):
        for d in range(8):
            for f in range(4):cells.append(f'<g transform="translate({((d%4)*4+f)*192} {(row*2+d//4)*192})">{cell(d,state,f)}</g>')
    defs='''<defs><linearGradient id="horse" x2=".5" y2="1"><stop stop-color="#c69d68"/><stop offset=".5" stop-color="#a27649"/><stop offset="1" stop-color="#775238"/></linearGradient><linearGradient id="steel" x2="1" y2=".3"><stop stop-color="#c4c8b4"/><stop offset=".4" stop-color="#7f8d87"/><stop offset=".7" stop-color="#dce0c7"/><stop offset="1" stop-color="#5d726e"/></linearGradient><linearGradient id="leather" x2="1" y2="1"><stop stop-color="#9b8056"/><stop offset=".5" stop-color="#6d6046"/><stop offset="1" stop-color="#473f31"/></linearGradient></defs>'''
    return '<svg xmlns="http://www.w3.org/2000/svg" width="3072" height="1920" viewBox="0 0 3072 1920"><title>Riftwatch original Magyar sabre light cavalry</title>'+defs+''.join(cells)+'</svg>\n'
if __name__=='__main__':
    p=Path(__file__).resolve().parents[2]/'assets/sprites/mag-cavalry-atlas.svg';p.write_text(build());print(p)
