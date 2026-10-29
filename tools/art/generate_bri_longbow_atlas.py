#!/usr/bin/env python3
"""原創長弓兵影格 / Original longbow infantry frames; no third-party assets."""
import math
from pathlib import Path

STATES = ['idle', 'walk', 'attack', 'hit', 'death']


def cell(direction, state, frame):
    a = direction * math.pi / 4
    dx, dy = math.cos(a), math.sin(a)
    back = dy < -.3
    stride = [-4, 0, 4, 0][frame] if state == 'walk' else 0
    bob = [0, -1, 0, -1][frame] if state == 'walk' else 0
    draw = [2, 7, 10, 0][frame] if state == 'attack' else 1
    fall = [0, 22, 52, 82][frame] if state == 'death' else 0
    recoil = [-2, -3, -1, 0][frame] if state == 'hit' else 0
    bx, by = dx * 15, -23 + dy * 5
    handx, handy = bx - dx * draw, by - dy * draw * .4
    bow = f'''<g transform="translate({bx:.2f} {by:.2f}) scale({1 if dx >= 0 else -1} 1)">
      <path d="M0-24Q17 0 0 24" fill="none" stroke="#2d241b" stroke-width="3.8"/>
      <path d="M0-24Q17 0 0 24" fill="none" stroke="#c9a66c" stroke-width="2"/>
      <path d="M0-24L{-draw} 0L0 24" fill="none" stroke="#e5dcc0" stroke-width=".8"/>
      <path d="M{-draw-3} 0H27M27 0L23-2M27 0L23 2" stroke="#e7ded0" stroke-width="1"/>
      </g>'''
    return f'''<g transform="translate(64 88)">
      <ellipse cy="3" rx="15" ry="5" fill="#12201b" opacity=".26"/>
      <g transform="translate({recoil} {bob}) rotate({fall})" opacity="{1-frame*.12 if state == 'death' else 1}">
      <path d="M-5-5L{-6+stride} 6M5-5L{6-stride} 6" stroke="#453e2b" stroke-width="5"/>
      <path d="M{-6+stride} 5h-5M{6-stride} 5h5" stroke="#302b23" stroke-width="3"/>
      {bow if back else ''}
      <path d="M-9-32Q0-36 9-32L11-10L5-3L0-7L-6-3L-11-10Z" fill="#49634a" stroke="#b9ae7a" stroke-width="1.2"/>
      <path d="M-8-30L-7-10M7-30L6-10M-9-14H9" stroke="#7f8b65" stroke-width="1.5"/>
      <path d="M-8-27L8-12" stroke="#604730" stroke-width="3"/>
      <path d="M-12-29L-15-10L-9-8L-7-26Z" fill="#735639" stroke="#c4a66b"/>
      <path d="M-12-28L-11-39M-10-28L-8-40M-8-27L-5-38" stroke="#d6c8a3" stroke-width="1.2"/>
      <path d="M-7-27L{handx:.2f} {handy:.2f}M7-27L{bx:.2f} {by:.2f}" stroke="#ad9a73" stroke-width="4" stroke-linecap="round"/>
      <ellipse cx="{dx*2:.2f}" cy="-38" rx="5" ry="6" fill="{'#475642' if back else '#c5a47b'}"/>
      <path d="M-7-36Q-10-47 0-49Q10-46 8-34L5-36Q4-44-3-42L-4-35Z" fill="#354d3b" stroke="#a7ad7c" stroke-width="1"/>
      {'' if back else bow}
      </g></g>'''


def build():
    cells = [f'<g transform="translate({((d%4)*4+f)*128} {(r*2+d//4)*128})">{cell(d,s,f)}</g>'
             for r, s in enumerate(STATES) for d in range(8) for f in range(4)]
    return '<svg xmlns="http://www.w3.org/2000/svg" width="2048" height="1280" viewBox="0 0 2048 1280"><title>Riftwatch original hooded longbow infantry</title>' + ''.join(cells) + '</svg>\n'


if __name__ == '__main__':
    target = Path(__file__).resolve().parents[2] / 'assets/sprites/bri-longbow-atlas.svg'
    target.write_text(build())
    print(target)
