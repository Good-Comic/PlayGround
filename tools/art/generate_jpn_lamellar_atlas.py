#!/usr/bin/env python3
"""原創札甲步兵 / Original lamellar infantry; no third-party assets."""
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
    shield = f'''<g transform="translate({sx:.2f} {sy-6:.2f})">
      <path d="M-8-13L5-15L9 5L-5 9Z" fill="#793f37" stroke="#d4b378" stroke-width="1.2"/>
      <path d="M-7-8L6-10M-6-3L7-5M-5 2L8 0" stroke="#b68a68" stroke-width="1.7"/>
      <path d="M-5-12L-2 6M1-13L4 5" stroke="#3e5452" stroke-width="1"/>
      </g>'''
    sword = f'''<g transform="translate({wx:.2f} {wy:.2f}) rotate({swing if dx >= 0 else -swing})">
      <path d="M0 3Q1-17 8-31L10-34Q5-12 3 4Z" fill="#d2dbd4" stroke="#59736f" stroke-width=".8"/>
      <path d="M2 0Q3-19 9-31" fill="none" stroke="#f4e7c6" stroke-width="1"/>
      <path d="M-3 3L7 5M1 5L0 13" stroke="#d4b477" stroke-width="2.5"/>
      </g>'''
    mail = ''.join(f'<path d="M-7 {y}h14" fill="none" stroke="#c59c73" stroke-width=".9"/>' for y in [-29,-25,-21,-17,-13])
    return f'''<g transform="translate(64 88)">
      <ellipse cy="3" rx="16" ry="5" fill="#12201b" opacity=".27"/>
      <g transform="translate({recoil} {bob}) rotate({fall})" opacity="{1-frame*.12 if state == 'death' else 1}">
      <path d="M-5-4L{-6+stride} 6M5-4L{6-stride} 6" stroke="#594a35" stroke-width="5"/>
      <path d="M{-6+stride} 6h-5M{6-stride} 6h5" stroke="#302b23" stroke-width="3"/>
      {shield if back else sword}
      <path d="M-9-32Q0-36 9-32L11-8L5-3L0-6L-6-3L-11-8Z" fill="#713e36" stroke="#c0b78c" stroke-width="1.3"/>
      {mail}
      <path d="M-9-11H9M0-11V-4" stroke="#9d8050" stroke-width="2"/>
      <path d="M-8-27L{sx:.2f} {sy:.2f}M8-27L{wx:.2f} {wy+6:.2f}" stroke="#8d8970" stroke-width="4" stroke-linecap="round"/>
      <ellipse cx="{dx*2:.2f}" cy="-38" rx="5" ry="6" fill="{'#657971' if back else '#c5a47b'}"/>
      <path d="M-10-38Q-10-48 0-51Q10-48 10-38L13-33L6-34L0-37L-6-34L-13-33Z" fill="#465854" stroke="#c9b079" stroke-width="1.2"/>
      <path d="M-9-36L-12-29M-5-36L-7-28M5-36L7-28M9-36L12-29" stroke="#885146" stroke-width="3"/>
      <path d="M-5-45L0-53L5-45M0-52V-40" fill="none" stroke="#d8bc73" stroke-width="2"/>
      {sword if back else shield}
      </g></g>'''


def build():
    cells = [f'<g transform="translate({((d%4)*4+f)*128} {(r*2+d//4)*128})">{cell(d,s,f)}</g>'
             for r, s in enumerate(STATES) for d in range(8) for f in range(4)]
    return '<svg xmlns="http://www.w3.org/2000/svg" width="2048" height="1280" viewBox="0 0 2048 1280"><title>Riftwatch original lamellar infantry</title>' + ''.join(cells) + '</svg>\n'


if __name__ == '__main__':
    target = Path(__file__).resolve().parents[2] / 'assets/sprites/jpn-lamellar-atlas.svg'
    target.write_text(build())
    print(target)
