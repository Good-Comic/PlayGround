#!/usr/bin/env python3
"""原創法蘭克披掛騎槍外觀 / Original Frankish caparison and lance appearance."""
import math
from pathlib import Path

STATES = ['idle', 'walk', 'attack', 'hit', 'death']


def cell(direction, state, frame):
    a = direction * math.pi / 4
    dx, dy = math.cos(a), math.sin(a)
    back = dy < -.3
    stride = [-4, 0, 4, 0][frame] if state == 'walk' else 0
    bob = [0, -2, 0, 1][frame] if state == 'walk' else 0
    pull = [0, 3, 9, 1][frame] if state == 'attack' else 0
    fall = [0, 18, 48, 80][frame] if state == 'death' else 0
    recoil = [-2, -4, -1, 0][frame] if state == 'hit' else 0
    rx = 14 + 10 * abs(dx)
    hx, hy = 25 * dx, -29 + 8 * dy
    horsehead = f'''<path d="M{18*dx:.2f}-24L{hx:.2f} {hy-11:.2f}L{hx+6*dx:.2f} {hy-6:.2f}L{hx+9*dx:.2f} {hy+1:.2f}L{hx+3*dx:.2f} {hy+4:.2f}L{hx-3*dx:.2f} {hy-2:.2f}L{12*dx:.2f}-18Z" fill="url(#horse)" stroke="#40332a" stroke-width="1.4"/>
      <path d="M{hx-3*dx:.2f} {hy-9:.2f}L{hx-5*dx:.2f} {hy-17:.2f}L{hx+1*dx:.2f} {hy-11:.2f}" fill="#44362d"/>
      <path d="M{hx+6*dx:.2f} {hy-4:.2f}L{hx-2*dx:.2f} {hy-6:.2f}L{hx-5*dx:.2f} {hy+2:.2f}" fill="none" stroke="#d1b578"/>
      <circle cx="{hx+2*dx:.2f}" cy="{hy-7:.2f}" r="1.1" fill="#161e1d"/>'''
    bx, by = 13 * dx, -42 + 5 * dy
    tipx, tipy = (48 + pull) * dx, (24 + pull*.4) * dy - 3
    lance = f'''<g transform="translate({bx:.2f} {by:.2f})">
      <path d="M{-8*dx:.2f} {-4*dy:.2f}L{tipx:.2f} {tipy:.2f}" stroke="#5f4630" stroke-width="3"/>
      <path d="M{-8*dx:.2f} {-4*dy:.2f}L{tipx:.2f} {tipy:.2f}" stroke="#d2b37a" stroke-width="1.3"/>
      <path d="M{tipx-4*dx+2*dy:.2f} {tipy-3*dy-2*dx:.2f}L{tipx+6*dx:.2f} {tipy+4*dy:.2f}L{tipx-4*dx-2*dy:.2f} {tipy-3*dy+2*dx:.2f}Z" fill="#d8e0dc" stroke="#6b807e" stroke-width=".7"/>
      <path d="M{tipx-10*dx:.2f} {tipy-6*dy:.2f}l-3 -10l-8 4l8 3Z" fill="#d0ba80" stroke="#354d6a" stroke-width=".8"/>
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
      <path d="M{-rx:.2f}-26Q0-33 {rx:.2f}-26L{rx+2:.2f}-3L{rx*.45:.2f}-7L0-2L{-rx*.6:.2f}-6L{-rx-2:.2f}-3Z" fill="#3e5574" stroke="#cab580" stroke-width="1.4"/>
      <path d="M-17-20L-9-24L-1-20L-9-12ZM5-21L13-25L21-21L13-13Z" fill="none" stroke="#e0d1a0" stroke-width="1.7"/>
      {''.join(legs[2:])}{'' if back else horsehead}
      {lance if back else ''}
      <path d="M-6-36L-12-20M6-36L12-20" stroke="#393835" stroke-width="4"/>
      <path d="M-9-49L-8-34L0-29L8-34L9-49Z" fill="#87958e" stroke="#d6c18a"/>
      <path d="M-7-43H7M-6-37H6M0-47V-32" stroke="#bca36c" stroke-width="1"/>
      <path d="M-10-47L-19-44L-18-30L-10-19L-3-32L-3-45Z" fill="#344f70" stroke="#d6c18a" stroke-width="1.5"/>
      <path d="M-17-38L-11-42L-5-38M-16-32L-11-36L-6-32" fill="none" stroke="#e6d5a1" stroke-width="1.5"/>
      <ellipse cx="{dx*2:.2f}" cy="-54" rx="4" ry="5" fill="{'#65786d' if back else '#b38c64'}"/>
      <path d="M-6-62L5-63L7-51L1-48L-6-51Z" fill="#8f9c94" stroke="#d3c7a0" stroke-width="1.2"/>
      <path d="M-5-57H5M0-62V-50" stroke="#334c58" stroke-width="1.5"/>
      <path d="M-4-64Q0-72 6-65L3-62Z" fill="#345273" stroke="#c8af76"/>
      <path d="M-6-47L{bx-pull*.3:.2f} {by:.2f}M6-47L{bx:.2f} {by:.2f}" stroke="#8c9a92" stroke-width="3"/>
      {'' if back else lance}
      </g></g>'''


def build():
    cells = []
    for row, state in enumerate(STATES):
        for d in range(8):
            for frame in range(4):
                cells.append(f'<g transform="translate({((d%4)*4+frame)*176} {(row*2+d//4)*176})">{cell(d,state,frame)}</g>')
    svg = '<svg xmlns="http://www.w3.org/2000/svg" width="2816" height="1760" viewBox="0 0 2816 1760"><title>Riftwatch original Frankish caparison and lance cavalry</title><defs><linearGradient id="horse" x2=".6" y2="1"><stop stop-color="#b38a5a"/><stop offset=".5" stop-color="#8b6747"/><stop offset="1" stop-color="#634732"/></linearGradient></defs>' + ''.join(cells) + '</svg>\n'
    return '\n'.join(line.rstrip() for line in svg.split('\n'))


if __name__ == '__main__':
    target = Path(__file__).resolve().parents[2] / 'assets/sprites/frk-cavalry-atlas.svg'
    target.write_text(build())
    print(target)
