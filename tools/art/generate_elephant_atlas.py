#!/usr/bin/env python3
"""Original isometric war elephant; repository-owned art, no external assets."""
import math
from pathlib import Path

STATES = ['idle', 'walk', 'attack', 'hit', 'death']
SIZE = 176


def cell(direction, state, frame):
    a = direction * math.pi / 4
    dx, dy = math.cos(a), math.sin(a)
    back = dy < -.3
    stride = [-3, 0, 3, 0][frame] if state == 'walk' else 0
    bob = [0, -1, 0, 1][frame] if state == 'walk' else 0
    thrust = [0, 3, 7, 1][frame] if state == 'attack' else 0
    recoil = [-2, -4, -1, 0][frame] if state == 'hit' else 0
    fall = [0, 12, 38, 67][frame] if state == 'death' else 0
    hx, hy = (25 + thrust) * dx, -29 + 10 * dy
    head = f'''<g transform="translate({hx:.2f} {hy:.2f})">
      <ellipse rx="11" ry="13" fill="url(#skin)" stroke="#35454a" stroke-width="1.4"/>
      <ellipse cx="{-6*dx:.2f}" cy="1" rx="7" ry="10" fill="#72878a" stroke="#445b60"/>
      <path d="M{7*dx:.2f} 5Q{18*dx:.2f} 16 {13*dx:.2f} 25Q{10*dx:.2f} 30 {5*dx:.2f} 23" fill="none" stroke="#475d61" stroke-width="7" stroke-linecap="round"/>
      <path d="M{8*dx:.2f} 6Q{23*dx:.2f} 17 {28*dx:.2f} 8M{3*dx:.2f} 7Q{18*dx:.2f} 19 {23*dx:.2f} 12" fill="none" stroke="#efe2ba" stroke-width="3" stroke-linecap="round"/>
      <path d="M-7-8L0-13L7-8L4 3L0 6L-4 3Z" fill="#b4a06b" stroke="#ead292"/>
      <circle cx="{7*dx:.2f}" cy="-2" r="1.3" fill="#202f30"/>
      </g>'''
    legs = []
    for i, (x, y) in enumerate([(-17, -16), (11, -16), (-11, -10), (18, -10)]):
        step = stride * (1 if i % 2 else -1)
        legs.append(f'<path d="M{x} {y}L{x+step} 2" stroke="{"#53686a" if i<2 else "#829596"}" stroke-width="8" stroke-linecap="round"/><path d="M{x+step-3} 3H{x+step+3}" stroke="#c2c3ad" stroke-width="2"/>')
    return f'''<g transform="translate(88 96)">
      <ellipse cy="4" rx="30" ry="8" fill="#142628" opacity=".3"/>
      <g transform="translate({recoil} {bob}) rotate({fall})" opacity="{1-frame*.13 if state=='death' else 1}">
      {head if back else ''}{''.join(legs[:2])}
      <ellipse cy="-24" rx="29" ry="18" fill="url(#skin)" stroke="#3e555b" stroke-width="1.5"/>
      <path d="M{-24*dx:.2f} -26Q{-38*dx:.2f} -16 {-31*dx:.2f} -6" fill="none" stroke="#526b6c" stroke-width="2"/>
      <path d="M-20-33Q0-44 20-33L22-16L14-9H-14L-22-16Z" fill="#3a6671" stroke="#d8bc72" stroke-width="1.5"/>
      <path d="M-16-28V-13M-8-32V-12M0-34V-12M8-32V-12M16-28V-13" stroke="#b9b18b" stroke-width="1"/>
      <path d="M-7-22L0-29L7-22L0-15Z" fill="#dbc789" stroke="#f5e1aa"/>
      {''.join(legs[2:])}{'' if back else head}
      <path d="M-16-42L0-50L16-42V-34L0-28L-16-34Z" fill="#a37e43" stroke="#ead18d" stroke-width="1.4"/>
      <path d="M-12-41V-54M12-41V-54" stroke="#d0b170" stroke-width="2"/>
      <path d="M-14-54Q0-70 14-54L10-51Q0-61-10-51Z" fill="#497884" stroke="#e4c67c" stroke-width="1.5"/>
      <path d="M-6-51L-5-40H5L6-51Z" fill="#6b4140" stroke="#d6b97c"/>
      <ellipse cy="-56" rx="4" ry="5" fill="{'#708d8e' if back else '#c29c76'}"/>
      <path d="M-5-58Q0-66 5-58L4-54H-4Z" fill="#dfc98d" stroke="#8e774d"/>
      <path d="M5-47L{15*dx:.2f} {-47+5*dy:.2f}L{27*dx:.2f} {-61+5*dy:.2f}" fill="none" stroke="#dbca94" stroke-width="2"/>
      </g></g>'''


def build():
    cells = []
    for row, state in enumerate(STATES):
        for direction in range(8):
            for frame in range(4):
                x = ((direction % 4) * 4 + frame) * SIZE
                y = (row * 2 + direction // 4) * SIZE
                cells.append(f'<g transform="translate({x} {y})">{cell(direction,state,frame)}</g>')
    svg = '<svg xmlns="http://www.w3.org/2000/svg" width="2816" height="1760" viewBox="0 0 2816 1760"><title>Riftwatch original Persian-inspired armored war elephant</title><defs><linearGradient id="skin" x2=".7" y2="1"><stop stop-color="#9cb0ab"/><stop offset=".5" stop-color="#7b9290"/><stop offset="1" stop-color="#4b646a"/></linearGradient></defs>' + ''.join(cells) + '</svg>\n'
    return '\n'.join(line.rstrip() for line in svg.split('\n'))


if __name__ == '__main__':
    path = Path(__file__).resolve().parents[2] / 'assets/sprites/elephant-atlas.svg'
    path.write_text(build())
    print(path)
