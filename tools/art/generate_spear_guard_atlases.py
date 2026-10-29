#!/usr/bin/env python3
"""New migration-era original artwork; not recovered from the offline commit."""
import math
from pathlib import Path

STATES = ['idle', 'walk', 'attack', 'hit', 'death']
WIDTH, HEIGHT = 128, 160


def cell(kind, direction, state, frame):
    angle = direction * math.pi / 4
    dx, dy = math.cos(angle), math.sin(angle)
    back = dy < -.3
    stride = [-3, 0, 3, 0][frame] if state == 'walk' else 0
    bob = [0, -1, 0, 1][frame] if state in ('walk', 'idle') else 0
    thrust = [0, 5, 11, 2][frame] if state == 'attack' else 0
    fall = [0, 24, 58, 86][frame] if state == 'death' else 0
    recoil = [-2, -4, -1, 0][frame] if state == 'hit' else 0
    spear = kind == 'spearman'
    cloth, metal = ('#45695d', '#c5d0c8') if spear else ('#803f3b', '#cbb985')
    # Ground-plane direction changes weapon endpoints and front/back occlusion;
    # bodies stay upright rather than rotating as flat overhead tokens.
    wx, wy = 8 * dx + thrust * dx, -24 + 4 * dy + thrust * dy * .5
    if spear:
        weapon = f'''<g transform="translate({wx:.2f} {wy:.2f})">
          <path d="M{-19*dx:.2f} {-10*dy:.2f}L{34*dx:.2f} {18*dy:.2f}" stroke="#292c28" stroke-width="4"/>
          <path d="M{-19*dx:.2f} {-10*dy:.2f}L{34*dx:.2f} {18*dy:.2f}" stroke="#c59859" stroke-width="2"/>
          <path d="M{30*dx-3*dy:.2f} {16*dy+3*dx:.2f}L{42*dx:.2f} {22*dy:.2f}L{30*dx+3*dy:.2f} {16*dy-3*dx:.2f}Z" fill="#e4e6cf" stroke="#58666b"/>
          </g>'''
        shield = '''<circle cx="-11" cy="-19" r="8" fill="#294b45" stroke="#c9b978" stroke-width="2"/>
          <path d="M-17-19H-5M-11-25V-13" stroke="#849987"/><circle cx="-11" cy="-19" r="2.5" fill="#d5c68f"/>'''
    else:
        swing = [-22, 5, 60, 12][frame] if state == 'attack' else 0
        weapon = f'''<g transform="translate({wx:.2f} {wy:.2f}) rotate({-35+dx*30+swing:.2f})">
          <path d="M0 2V-24L3-30L6-24V2Z" fill="#d8dfdb" stroke="#4c5b60"/>
          <path d="M-4 0H10M3 0V8" stroke="#dcbb70" stroke-width="3"/></g>'''
        shield = '''<path d="M-22-33Q-12-38-2-33L-4-16L-12-5L-20-16Z" fill="#813c38" stroke="#e5c27b" stroke-width="2"/>
          <path d="M-12-32V-12M-18-26L-12-31L-6-26L-12-21Z" fill="#e2c78a" stroke="#e2c78a"/>'''
    return f'''<g transform="translate(64 88)">
      <ellipse cy="3" rx="15" ry="4" fill="#14201f" opacity=".28"/>
      <g transform="translate({recoil} {bob}) rotate({fall})" opacity="{1-frame*.12 if state=='death' else 1}">
      {weapon if back else ''}{shield if back else ''}
      <path d="M-5-5L{-5+stride} 3M5-5L{5-stride} 3" stroke="#2e3032" stroke-width="5" stroke-linecap="round"/>
      <path d="M-10-31L-9-8L-5-3H5L9-8L10-31L4-35H-4Z" fill="{cloth}" stroke="#253c3e" stroke-width="1.5"/>
      <path d="M-7-30H7V-13H-7ZM-9-24H9M-8-18H8M-3-29V-13M3-29V-13" fill="{metal}" stroke="#657774" stroke-width="1"/>
      <path d="M-12-31L-15-25L-7-23M12-31L15-25L7-23" fill="{metal}" stroke="#354346"/>
      <ellipse cx="{dx*2:.2f}" cy="-41" rx="5" ry="6" fill="{'#667777' if back else '#c69b76'}"/>
      <path d="M-7-42Q-6-51 0-52Q6-51 7-42L6-37H-6Z" fill="{metal}" stroke="#34474d"/>
      {'' if spear else '<path d="M0-51L-2-59L3-57L5-50Z" fill="#b26c45" stroke="#e0bd78"/>'}
      <path d="M-6-42H6M0-50V-42" stroke="#e9d8a3"/>
      <path d="M8-29L{wx:.2f} {wy:.2f}M-8-29L-11-20" stroke="{cloth}" stroke-width="4" stroke-linecap="round"/>
      {'' if back else weapon}{'' if back else shield}
      </g></g>'''


def build(kind):
    cells = []
    for row, state in enumerate(STATES):
        for direction in range(8):
            for frame in range(4):
                cells.append(f'<g transform="translate({(direction*4+frame)*WIDTH} {row*HEIGHT})">{cell(kind,direction,state,frame)}</g>')
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="4096" height="800" viewBox="0 0 4096 800"><title>Riftwatch original {kind} migration-era atlas</title>{"".join(cells)}</svg>\n'


if __name__ == '__main__':
    root = Path(__file__).resolve().parents[2] / 'assets/sprites'
    for kind in ('spearman', 'guard'):
        target = root / f'{kind}-atlas.svg'
        target.write_text(build(kind))
        print(target)
