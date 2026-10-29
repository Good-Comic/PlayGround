#!/usr/bin/env python3
"""Repository-original hero, support and boss artwork; deterministic SVG source."""
import math
from pathlib import Path

KINDS = ['commander', 'recruiter', 'warlord', 'warlord2']
STATES = ['idle', 'walk', 'attack', 'hit', 'death']
SIZE = 176


def cell(kind, direction, state, frame):
    angle = direction * math.pi / 4
    dx, dy = math.cos(angle), math.sin(angle)
    back = dy < -.3
    stride = [-3, 0, 3, 0][frame] if state == 'walk' else 0
    bob = [0, -1, 0, 1][frame] if state in ('idle', 'walk') else 0
    swing = [-25, 5, 62, 12][frame] if state == 'attack' else 0
    fall = [0, 25, 58, 86][frame] if state == 'death' else 0
    hit = [-2, -4, -1, 0][frame] if state == 'hit' else 0
    cape_shift = [-2, 0, 2, 0][frame]
    hero, support, marshal = kind == 'commander', kind == 'recruiter', kind == 'warlord2'
    cloth = '#365e80' if hero else '#e0d0a4' if support else '#582d64' if marshal else '#802f29'
    metal = '#d6d9c9' if hero else '#a67d45' if support else '#7d7199' if marshal else '#a99a7d'
    trim = '#f0ce78' if hero or support else '#bca4e9' if marshal else '#e0a55b'
    shoulder = 10 if support else 16 if hero else 21
    # Face and gear rotate in the isometric ground plane; the body stays upright.
    hand_x, hand_y = 13 * dx, -30 + 5 * dy
    if state == 'cast':
        hand_y -= [3, 11, 17, 7][frame]
    if support:
        weapon = f'''<g transform="translate({hand_x:.2f} {hand_y:.2f})">
          <path d="M0 29V-34" stroke="#47392d" stroke-width="3"/>
          <path d="M-5-32L0-41L5-32L0-25Z" fill="#d1b66d" stroke="#fff0b3"/>
          <circle cy="-32" r="2" fill="#e9f4d4"/>
          </g>'''
        badge = '''<g transform="translate(-14 -26)"><path d="M-6-7H8V10H-6Z" fill="#f3e4bb" stroke="#9f7445"/>
          <path d="M-8-7H10M-8 10H10" stroke="#a06e3d" stroke-width="3"/>
          <path d="M-3-3H5M-3 1H5M-3 5H2" stroke="#8a7655"/></g>'''
    elif marshal:
        weapon = f'''<g transform="translate({hand_x:.2f} {hand_y:.2f}) rotate({dx*12+swing*.4:.2f})">
          <path d="M0 28V-37" stroke="#363044" stroke-width="4"/>
          <path d="M0-45L-9-29L0-33L9-29Z" fill="#c9c0e3" stroke="#57436c"/>
          <path d="M-3-20L-24-25L-22-10L-14-12L-7-3L-3-5Z" fill="#42234f" stroke="#b89ccc"/>
          <path d="M-18-21L-13-16L-17-11M-10-20V-9" stroke="#c7a8e3"/></g>'''
        badge = '<path d="M-14-26L-21-20L-14-7L-7-20Z" fill="#3b294f" stroke="#c7a6eb" stroke-width="2"/>'
    else:
        blade = '<path d="M-3 0V-25L0-34L4-25V0Z" fill="#e8e9db" stroke="#627881"/>' if hero else '<path d="M0 1L-4-29L9-29L17-16L7-6Z" fill="#ada990" stroke="#514e49" stroke-width="2"/>'
        weapon = f'''<g transform="translate({hand_x:.2f} {hand_y:.2f}) rotate({-25+dx*25+swing:.2f})">
          {blade}<path d="M-8 0H9M1 0V10" stroke="{trim}" stroke-width="3"/>
          <path d="M0-22V-8" stroke="{'#b2e2ea' if hero else '#e7a76b'}"/></g>'''
        badge = f'<path d="M-20-32L-8-35L-4-21L-12-9L-23-19Z" fill="{cloth}" stroke="{trim}" stroke-width="2"/><path d="M-14-29V-16M-19-23H-9" stroke="{trim}" stroke-width="2"/>'
    if support:
        helm = '<path d="M-10-43Q-9-60 0-62Q9-60 10-43L5-38H-5Z" fill="#ede0b9" stroke="#827451"/><path d="M-5-48Q0-55 5-48V-40H-5Z" fill="#b38664"/>'
    elif hero:
        helm = '<path d="M-8-45Q-7-56 0-56Q7-56 8-45L6-39H-6Z" fill="#c4d7d9" stroke="#586f79"/><path d="M-9-52L-11-61L-4-57L0-65L4-57L11-61L9-52Z" fill="#ebc86f" stroke="#9f7c42"/><circle cy="-54" r="2" fill="#7dd4dc"/>'
    elif marshal:
        helm = '<path d="M-10-44L-8-59L0-65L8-59L10-44L5-37H-5Z" fill="#827897" stroke="#34273d"/><path d="M-9-55L-18-66L-15-50M9-55L18-66L15-50" fill="#b29ccf" stroke="#4b365e"/><path d="M-6-45H-1M2-45H7" stroke="#dfbaff" stroke-width="2"/>'
    else:
        helm = '<path d="M-10-44L-8-56L0-59L8-56L10-44L5-36H-5Z" fill="#7d7668" stroke="#352f2c"/><path d="M-7-52L-20-62L-16-49M7-52L20-62L16-49" fill="#d9c6a0" stroke="#594a39"/><path d="M-6-44H-1M2-44H7" stroke="#efae64" stroke-width="2"/>'
    torso = f'<path d="M-12-34L-10-9L0-4L10-9L12-34Z" fill="{metal}" stroke="#343e42" stroke-width="1.5"/><path d="M-10-28H10M-9-21H9M0-33V-9" stroke="{trim}" stroke-width="1"/>'
    if support:
        torso = f'<path d="M-8-38L-17-3Q0 6 17-3L8-38Z" fill="{cloth}" stroke="#8b7750" stroke-width="1.4"/><path d="M0-34V-1M-8-19H8" stroke="#b18c48" stroke-width="2"/>'
    return f'''<g transform="translate(88 96)">
      <ellipse cy="3" rx="18" ry="5" fill="#131b20" opacity=".28"/>
      <g transform="translate({hit} {bob}) rotate({fall})" opacity="{1-frame*.13 if state=='death' else 1}">
      <path d="M-10-40L{-21+cape_shift}-1L-4-6L6 0L{21+cape_shift}-4L10-40Z" fill="{cloth}" stroke="#30313c" stroke-width="1.4"/>
      <path d="M-10-34L{-13+cape_shift}-5M9-34L{13+cape_shift}-5" stroke="{trim}" opacity=".45"/>
      {weapon if back else ''}{badge if back else ''}
      <path d="M-6-7L{-6+stride} 3M6-7L{6-stride} 3" stroke="#292c32" stroke-width="5"/>
      {torso}
      <path d="M-8-36L{-shoulder}-31L{-shoulder+2}-23L-7-25M8-36L{shoulder}-31L{shoulder-2}-23L7-25" fill="{metal}" stroke="{trim}" stroke-width="1.2"/>
      {'' if hero or support else '<path d="M-15-34L-20-41L-22-31M15-34L20-41L22-31" fill="#b8ab91" stroke="#514756"/>'}
      <ellipse cx="{dx*2:.2f}" cy="-44" rx="6" ry="7" fill="{'#4b4d55' if back else '#bc926d'}"/>
      {helm}
      <path d="M8-31L{hand_x:.2f} {hand_y:.2f}M-8-31L-14-24" stroke="{metal}" stroke-width="4" stroke-linecap="round"/>
      {'' if back else weapon}{'' if back else badge}{f'<circle cx="{hand_x:.2f}" cy="{hand_y:.2f}" r="{[2, 5, 8, 3][frame]}" fill="none" stroke="#f4e1a6" stroke-width="1.5"/>' if state=='cast' else ''}
      </g></g>'''


def build(kind):
    cells = []
    states = STATES + (['cast'] if kind == 'commander' else [])
    for row, state in enumerate(states):
        for direction in range(8):
            for frame in range(4):
                cells.append(f'<g transform="translate({((direction%4)*4+frame)*SIZE} {(row*2+direction//4)*SIZE})">{cell(kind,direction,state,frame)}</g>')
    height = len(states) * 2 * SIZE
    svg = f'<svg xmlns="http://www.w3.org/2000/svg" width="2816" height="{height}" viewBox="0 0 2816 {height}"><title>Riftwatch original {kind} animation atlas</title>{"".join(cells)}</svg>\n'
    return '\n'.join(line.rstrip() for line in svg.split('\n'))


if __name__ == '__main__':
    root = Path(__file__).resolve().parents[2] / 'assets/sprites'
    for kind in KINDS:
        target = root / f'{kind}-atlas.svg'
        target.write_text(build(kind))
        print(target)
