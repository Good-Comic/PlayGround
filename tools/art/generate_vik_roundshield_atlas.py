#!/usr/bin/env python3
"""原創圓盾鏈甲步兵 / Original round-shield mail infantry; no third-party assets."""
import math
from pathlib import Path

STATES = ['idle', 'walk', 'attack', 'hit', 'death']


def cell(direction, state, frame):
    a = direction * math.pi / 4
    dx, dy = math.cos(a), math.sin(a)
    back = dy < -.3
    stride = [-4, 0, 4, 0][frame] if state == 'walk' else 0
    bob = [0, -1, 0, -1][frame] if state == 'walk' else 0
    swing = [-45, -80, 30, 0][frame] if state == 'attack' else -15
    fall = [0, 20, 50, 80][frame] if state == 'death' else 0
    recoil = [-2, -3, -1, 0][frame] if state == 'hit' else 0
    sx, sy = -dx * 10, -18 + dy * 5
    wx, wy = dx * 10, -25 + dy * 3
    shield = f'''<g transform="translate({sx:.2f} {sy:.2f}) scale({.65+abs(dy)*.35:.2f} 1)">
      <circle r="13" fill="#604d35" stroke="#c4b789" stroke-width="2"/>
      <path d="M-8-9V9M-3-12V12M3-12V12M8-9V9" stroke="#9b8053" stroke-width="1"/>
      <path d="M0-12V12M-12 0H12" stroke="#375d62" stroke-width="4"/>
      <circle r="4" fill="#abb1a0" stroke="#3c4947" stroke-width="1.5"/>
      <circle cx="-8" cy="-8" r="1" fill="#d1c69e"/><circle cx="8" cy="8" r="1" fill="#d1c69e"/>
      </g>'''
    sword = f'''<g transform="translate({wx:.2f} {wy:.2f}) rotate({swing if dx >= 0 else -swing})">
      <path d="M0 4V-23L2-29L4-23V4Z" fill="#cbd6d1" stroke="#647975" stroke-width=".8"/>
      <path d="M2-22V1" stroke="#f1ead3" stroke-width="1"/>
      <path d="M-4 3H8M2 4V11" stroke="#bb9c5e" stroke-width="2.5"/>
      </g>'''
    mail = ''.join(f'<path d="M-7 {y}q2 3 4 0q2 3 4 0q2 3 4 0" fill="none" stroke="#a2aca3" stroke-width=".9"/>' for y in [-29,-25,-21,-17,-13])
    return f'''<g transform="translate(64 88)">
      <ellipse cy="3" rx="16" ry="5" fill="#12201b" opacity=".27"/>
      <g transform="translate({recoil} {bob}) rotate({fall})" opacity="{1-frame*.12 if state == 'death' else 1}">
      <path d="M-5-4L{-6+stride} 6M5-4L{6-stride} 6" stroke="#594a35" stroke-width="5"/>
      <path d="M{-6+stride} 6h-5M{6-stride} 6h5" stroke="#302b23" stroke-width="3"/>
      {shield if back else sword}
      <path d="M-9-32Q0-36 9-32L11-8L5-3L0-6L-6-3L-11-8Z" fill="#596e6b" stroke="#c0b78c" stroke-width="1.3"/>
      {mail}
      <path d="M-9-11H9M0-11V-4" stroke="#9d8050" stroke-width="2"/>
      <path d="M-8-27L{sx:.2f} {sy:.2f}M8-27L{wx:.2f} {wy+6:.2f}" stroke="#8d8970" stroke-width="4" stroke-linecap="round"/>
      <ellipse cx="{dx*2:.2f}" cy="-38" rx="5" ry="6" fill="{'#657971' if back else '#c5a47b'}"/>
      <path d="M-7-39Q-7-49 0-51Q7-49 7-39L5-36H-5Z" fill="#84938c" stroke="#d3ccaa" stroke-width="1.2"/>
      <path d="M0-49V-37M-6-39H6" stroke="#4b625e" stroke-width="1.5"/>
      {sword if back else shield}
      </g></g>'''


def build():
    cells = [f'<g transform="translate({((d%4)*4+f)*128} {(r*2+d//4)*128})">{cell(d,s,f)}</g>'
             for r, s in enumerate(STATES) for d in range(8) for f in range(4)]
    return '<svg xmlns="http://www.w3.org/2000/svg" width="2048" height="1280" viewBox="0 0 2048 1280"><title>Riftwatch original round-shield mail infantry</title>' + ''.join(cells) + '</svg>\n'


if __name__ == '__main__':
    target = Path(__file__).resolve().parents[2] / 'assets/sprites/vik-roundshield-atlas.svg'
    target.write_text(build())
    print(target)
