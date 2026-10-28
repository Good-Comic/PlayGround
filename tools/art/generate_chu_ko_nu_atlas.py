#!/usr/bin/env python3
"""Original Riftwatch repeating-crossbow atlas; no external artwork or simulation RNG."""
import math
from pathlib import Path

STATES = ['idle', 'walk', 'attack', 'hit', 'death']
DIRECTIONS = ['E', 'SE', 'S', 'SW', 'W', 'NW', 'N', 'NE']


def cell(direction, state, frame):
    angle = direction * math.pi / 4
    dx, dy = math.cos(angle), math.sin(angle)
    side = 1 if dx >= 0 else -1
    stride = [-2, 0, 2, 0][frame] if state == 'walk' else 0
    bob = [0, -1, 0, 1][frame] if state == 'walk' else 0
    recoil = [0, -2, -1, 0][frame] if state == 'attack' else 0
    lever = [0, 26, 48, 0][frame] if state == 'attack' else 0
    fall = [0, 24, 60, 85][frame] if state == 'death' else 0
    hit = [-2, -3, -1, 0][frame] if state == 'hit' else 0
    # Upright body in all directions; face, weapon and occluding arms rotate in ground space.
    weapon_x, weapon_y = 8 * dx, -19 + 5 * dy
    weapon = f'''<g transform="translate({weapon_x:.2f} {weapon_y:.2f}) scale({side} 1)">
      <path d="M-8-2L12-2L15 1L-8 2Z" fill="#91572f" stroke="#342b27"/>
      <path d="M10-9Q18 0 10 9" fill="none" stroke="#c79c58" stroke-width="2"/>
      <path d="M10-9L13 0L10 9" fill="none" stroke="#ece1bb" stroke-width=".7"/>
      <rect x="-3" y="-8" width="10" height="6" rx="1" fill="#ac773f" stroke="#e4c68d"/>
      <path d="M-1-8V-3M2-8V-3M5-8V-3" stroke="#493d32" stroke-width=".8"/>
      <path d="M-5-3L3-11L8-10" transform="rotate({lever} -5 -3)" fill="none" stroke="#ded0a2" stroke-width="1.8"/>
      <path d="M0 0H18M18 0L15-2M18 0L15 2" stroke="#dbe1dd" stroke-width="1"/>
    </g>'''
    back = dy < -.3
    arms = f'<path d="M-8-25L{weapon_x-5:.2f} {weapon_y+2:.2f}M8-25L{weapon_x+4:.2f} {weapon_y+2:.2f}" stroke="#36575b" stroke-width="4" stroke-linecap="round"/>'
    return f'''<g transform="translate(40 64)">
      <ellipse cy="2" rx="13" ry="4" fill="#101b20" opacity=".3"/>
      <g transform="translate({hit+recoil*dx:.2f} {bob}) rotate({fall}) scale({.8 if state=='death' else 1})" opacity="{1-frame*.14 if state=='death' else 1}">
      {weapon if back else ''}
      <path d="M-5-4L{-5+stride} 3M5-4L{5-stride} 3" stroke="#292c30" stroke-width="4"/>
      <path d="M-10-27L-8-5Q0 0 8-5L10-27L4-31H-4Z" fill="url(#lamellar)" stroke="#253a41" stroke-width="1.3"/>
      <path d="M-9-15H9M-8-10H8M-9-21H9M-4-26V-5M3-26V-5" stroke="#c7b98a" stroke-width=".7" opacity=".85"/>
      <path d="M-11-26L-14-20L-7-19M11-26L14-20L7-19" fill="#718c8d" stroke="#dbc68a"/>
      <path d="M-8-6L-9 0H-2L0-5L2 0H9L8-6" fill="#49666b" stroke="#c3a875" stroke-width=".7"/>
      <ellipse cx="{dx*2:.2f}" cy="-35" rx="5" ry="6" fill="{'#4d5e63' if back else '#cb9d76'}"/>
      <path d="M-7-36Q-7-44 0-45Q7-44 7-36L5-32H-5Z" fill="url(#helm)" stroke="#26383f"/>
      <path d="M0-44V-36M-6-36H6" stroke="#e0ca90" stroke-width="1"/>
      {arms}{'' if back else weapon}
      </g></g>'''


def build():
    cells = []
    for row, state in enumerate(STATES):
        for direction in range(8):
            for frame in range(4):
                cells.append(f'<g transform="translate({(direction*4+frame)*80} {row*80})">{cell(direction,state,frame)}</g>')
    return '''<svg xmlns="http://www.w3.org/2000/svg" width="2560" height="400" viewBox="0 0 2560 400"><title>Riftwatch original lamellar repeating-crossbow infantry</title><defs><linearGradient id="lamellar" x2="1" y2=".2"><stop stop-color="#29474d"/><stop offset=".5" stop-color="#718d8a"/><stop offset="1" stop-color="#345359"/></linearGradient><linearGradient id="helm"><stop stop-color="#455d65"/><stop offset=".45" stop-color="#b0bcb6"/><stop offset="1" stop-color="#4c646a"/></linearGradient></defs>''' + ''.join(cells) + '</svg>\n'


if __name__ == '__main__':
    target = Path(__file__).resolve().parents[2] / 'assets/sprites/chu-ko-nu-atlas.svg'
    target.write_text(build())
    print(target)
