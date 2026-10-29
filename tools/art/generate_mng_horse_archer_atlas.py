#!/usr/bin/env python3
"""Original steppe riding/bow equipment for existing Mongol horse archers."""
import math
from pathlib import Path

STATES = ['idle', 'walk', 'attack', 'hit', 'death']


def cell(direction, state, frame):
    a = direction * math.pi / 4
    dx, dy = math.cos(a), math.sin(a)
    back = dy < -.3
    stride = [-4, 0, 4, 0][frame] if state == 'walk' else 0
    bob = [0, -2, 0, 1][frame] if state == 'walk' else 0
    pull = [0, 6, 11, 1][frame] if state == 'attack' else 0
    fall = [0, 18, 48, 80][frame] if state == 'death' else 0
    recoil = [-2, -4, -1, 0][frame] if state == 'hit' else 0
    rx = 14 + 10 * abs(dx)
    hx, hy = 25 * dx, -29 + 8 * dy
    horsehead = f'''<path d="M{18*dx:.2f}-24L{hx:.2f} {hy-11:.2f}L{hx+6*dx:.2f} {hy-6:.2f}L{hx+9*dx:.2f} {hy+1:.2f}L{hx+3*dx:.2f} {hy+4:.2f}L{hx-3*dx:.2f} {hy-2:.2f}L{12*dx:.2f}-18Z" fill="url(#horse)" stroke="#40332a" stroke-width="1.4"/>
      <path d="M{hx-3*dx:.2f} {hy-9:.2f}L{hx-5*dx:.2f} {hy-17:.2f}L{hx+1*dx:.2f} {hy-11:.2f}" fill="#44362d"/>
      <path d="M{hx+6*dx:.2f} {hy-4:.2f}L{hx-2*dx:.2f} {hy-6:.2f}L{hx-5*dx:.2f} {hy+2:.2f}" fill="none" stroke="#d1b578"/>
      <circle cx="{hx+2*dx:.2f}" cy="{hy-7:.2f}" r="1.1" fill="#161e1d"/>'''
    bx, by = 13 * dx, -42 + 5 * dy
    bow = f'''<g transform="translate({bx:.2f} {by:.2f}) scale({1 if dx>=0 else -1} 1)">
      <path d="M4-16Q17-7 8 0Q17 7 4 16" fill="none" stroke="#dab270" stroke-width="2.4"/>
      <path d="M4-16L{-pull} 0L4 16" fill="none" stroke="#e3dfb9" stroke-width=".8"/>
      <path d="M{-pull} 0H23M23 0L20-2M23 0L20 2" stroke="#c6d5d5" stroke-width="1"/>
      </g>'''
    legs = []
    for i, (x, y) in enumerate([(-rx*.6, -15), (rx*.55, -15), (-rx*.4, -10), (rx*.75, -10)]):
        step = stride * (1 if i % 2 else -1)
        legs.append(f'<path d="M{x:.2f} {y}L{x+step:.2f} -4L{x+step+1:.2f} 2" fill="none" stroke="{"#594131" if i<2 else "#896449"}" stroke-width="4"/><path d="M{x+step-1:.2f} 3H{x+step+4:.2f}" stroke="#302f2c" stroke-width="2"/>')
    return f'''<g transform="translate(88 96)">
      <ellipse cy="4" rx="27" ry="7" fill="#17241f" opacity=".28"/>
      <g transform="translate({recoil} {bob}) rotate({fall})" opacity="{1-frame*.13 if state=='death' else 1}">
      {''.join(legs[:2])}{horsehead if back else ''}
      <ellipse cy="-23" rx="{rx:.2f}" ry="12" fill="url(#horse)" stroke="#4d392e"/>
      <path d="M{-rx*.8:.2f}-26Q{-rx*1.4:.2f}-17 {-rx*1.2:.2f} -3" fill="none" stroke="#3b302a" stroke-width="4"/>
      <path d="M-12-29Q0-36 12-29L13-17L0-13L-13-17Z" fill="#476b70" stroke="#d4b774" stroke-width="1.5"/>
      <path d="M-9-25L0-30L9-25L0-19Z" fill="none" stroke="#d6c594"/>
      {''.join(legs[2:])}{'' if back else horsehead}
      {bow if back else ''}
      <path d="M-6-36L-12-20M6-36L12-20" stroke="#393835" stroke-width="4"/>
      <path d="M-9-49L-8-34L0-29L8-34L9-49Z" fill="#657b6a" stroke="#d6c18a"/>
      <path d="M-7-43H7M-6-37H6M0-47V-32" stroke="#bca36c" stroke-width="1"/>
      <path d="M-9-45L-15-52L-19-38L-12-32Z" fill="#805738" stroke="#c2a46c"/>
      <path d="M-15-47L-17-59M-12-46L-14-58M-9-45L-11-57" stroke="#ded8b0"/>
      <ellipse cx="{dx*2:.2f}" cy="-54" rx="4" ry="5" fill="{'#65786d' if back else '#b38c64'}"/>
      <path d="M-6-55Q0-67 6-55L5-51H-5Z" fill="#86938a" stroke="#d6bf82"/>
      <path d="M0-62Q-8-74-11-60Q-7-64-3-57" fill="#45392f" stroke="#b69b68"/>
      <path d="M-6-47L{bx-pull*.3:.2f} {by:.2f}M6-47L{bx:.2f} {by:.2f}" stroke="#7f977f" stroke-width="3"/>
      {'' if back else bow}
      </g></g>'''


def build():
    cells = []
    for row, state in enumerate(STATES):
        for d in range(8):
            for frame in range(4):
                cells.append(f'<g transform="translate({((d%4)*4+frame)*176} {(row*2+d//4)*176})">{cell(d,state,frame)}</g>')
    svg = '<svg xmlns="http://www.w3.org/2000/svg" width="2816" height="1760" viewBox="0 0 2816 1760"><title>Riftwatch original Mongol riding and composite-bow equipment</title><defs><linearGradient id="horse" x2=".6" y2="1"><stop stop-color="#b38a5a"/><stop offset=".5" stop-color="#8b6747"/><stop offset="1" stop-color="#634732"/></linearGradient></defs>' + ''.join(cells) + '</svg>\n'
    return '\n'.join(line.rstrip() for line in svg.split('\n'))


if __name__ == '__main__':
    target = Path(__file__).resolve().parents[2] / 'assets/sprites/mng-horse-archer-atlas.svg'
    target.write_text(build())
    print(target)
