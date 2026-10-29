#!/usr/bin/env python3
"""Original Korean-inspired mobile watch platform for an existing unit."""
import math
from pathlib import Path

STATES = ['idle', 'walk', 'attack', 'hit', 'death']


def cell(direction, state, frame):
    angle = direction * math.pi / 4
    dx, dy = math.cos(angle), math.sin(angle)
    recoil = [0, -3, -5, 0][frame] if state == 'attack' else 0
    bob = [0, -1, 0, 1][frame] if state == 'walk' else 0
    fall = [0, 14, 40, 72][frame] if state == 'death' else 0
    hit = [-2, -3, -1, 0][frame] if state == 'hit' else 0
    wheel_angle = frame * 35 if state == 'walk' else 0
    # A ground-plane cart with upright rails, guard and roof, not a rotated token.
    wheels = []
    for x, y in [(-18, -2), (15, -3)]:
        wheels.append(f'''<g transform="translate({x} {y})">
          <ellipse rx="7" ry="9" fill="#4b3a2e" stroke="#bd9b5d" stroke-width="2"/>
          <path transform="rotate({wheel_angle})" d="M-5 0H5M0-7V7M-4-5L4 5M-4 5L4-5" stroke="#a78754" stroke-width="1"/>
          <ellipse rx="1.7" ry="2.3" fill="#d5b778"/></g>''')
    bx, by = 12 * dx, -37 + 5 * dy
    bow = f'''<g transform="translate({bx+recoil:.2f} {by:.2f}) scale({1 if dx>=0 else -1} 1)">
      <path d="M-2 0H20" stroke="#745135" stroke-width="3"/>
      <path d="M14-12Q24 0 14 12" fill="none" stroke="#d0a96c" stroke-width="2"/>
      <path d="M14-12L{3+recoil} 0L14 12" fill="none" stroke="#e3ddba" stroke-width=".8"/>
      <path d="M0 0H28M28 0L24-2M28 0L24 2" stroke="#d7e1d9" stroke-width="1"/>
      </g>'''
    back = dy < -.3
    return f'''<g transform="translate(88 96)">
      <ellipse cy="6" rx="31" ry="8" fill="#152427" opacity=".28"/>
      <g transform="translate({hit} {bob}) rotate({fall})" opacity="{1-frame*.13 if state=='death' else 1}">
      <path d="M-21-11L2-22L24-11V-2L0 10L-21 0Z" fill="#765435" stroke="#b79862" stroke-width="1.4"/>
      {''.join(wheels)}
      <path d="M-22-23L2-35L24-23V-10L0 2L-22-10Z" fill="#477075" stroke="#d9c184" stroke-width="1.5"/>
      <path d="M-19-20L-1-10M4-12L20-20M0-10V-1" stroke="#aac0aa"/>
      <path d="M-15-17L-8-13L-9-4L-16-8ZM7-14L14-18L15-9L8-5Z" fill="#294a56" stroke="#d9c184"/>
      <path d="M-17-22V-51M18-22V-51" stroke="#735337" stroke-width="3"/>
      {bow if back else ''}
      <path d="M-7-43L-7-29H7L7-43Z" fill="#7b8270" stroke="#d3bb80"/>
      <ellipse cx="{dx*2:.2f}" cy="-48" rx="4" ry="5" fill="{'#677b76' if back else '#bb9975'}"/>
      <path d="M-6-49Q0-60 6-49L5-45H-5Z" fill="#94a49b" stroke="#d8c38d"/>
      <path d="M-13-28L-10-44M-10-28L-7-44M-7-28L-4-44" stroke="#ddce9e" stroke-width="1.2"/>
      <path d="M-7-40L{bx+recoil:.2f} {by:.2f}M7-40L{bx+4+recoil:.2f} {by:.2f}" stroke="#b2ae8b" stroke-width="3"/>
      {'' if back else bow}
      <path d="M-25-54Q-16-51 0-65Q16-51 25-54L19-48Q0-53-19-48Z" fill="#345f68" stroke="#d5bb77" stroke-width="1.6"/>
      <path d="M-18-52Q0-57 18-52M-10-55L-9-51M0-60V-53M10-55L9-51" fill="none" stroke="#769390"/>
      </g></g>'''


def build():
    cells = []
    for row, state in enumerate(STATES):
        for d in range(8):
            for frame in range(4):
                cells.append(f'<g transform="translate({((d%4)*4+frame)*176} {(row*2+d//4)*176})">{cell(d,state,frame)}</g>')
    svg = '<svg xmlns="http://www.w3.org/2000/svg" width="2816" height="1760" viewBox="0 0 2816 1760"><title>Riftwatch original Korean-inspired patrol cart and mobile bow platform</title>' + ''.join(cells) + '</svg>\n'
    return '\n'.join(line.rstrip() for line in svg.split('\n'))


if __name__ == '__main__':
    target = Path(__file__).resolve().parents[2] / 'assets/sprites/kor-patrol-cart-atlas.svg'
    target.write_text(build())
    print(target)
