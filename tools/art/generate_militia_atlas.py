#!/usr/bin/env python3
"""Generate the repository-owned eight-direction militia SVG atlas."""
from pathlib import Path

DIRECTIONS = ['E', 'SE', 'S', 'SW', 'W', 'NW', 'N', 'NE']
ANGLES = [-90, -45, 0, 45, 90, 135, 180, -135]
STATES = ['idle', 'walk', 'attack', 'hit', 'death']

def frame(x, y, angle, state, phase):
    bob = -1 if phase else 0
    stride = (3 if phase else -3) if state == 'walk' else 0
    sword = 18 if state == 'attack' and phase else 0
    recoil = -4 if state == 'hit' and phase else 0
    fall = 70 if state == 'death' and phase else (28 if state == 'death' else 0)
    opacity = .62 if state == 'death' and phase else 1
    return f'''<g transform="translate({x+32} {y+50}) rotate({fall}) translate({recoil} {bob})" opacity="{opacity}">
      <ellipse cx="0" cy="3" rx="13" ry="4" fill="#14150f" opacity=".34"/>
      <g transform="rotate({angle})">
        <path d="M{-4+stride} 0 L{-6+stride} 8 M{4-stride} 0 L{6-stride} 8" stroke="#32251b" stroke-width="4" stroke-linecap="round"/>
        <path d="M-8 -18 Q0 -25 8 -18 L6 1 Q0 5 -6 1Z" fill="#a63f35" stroke="#ead49b" stroke-width="1.5"/>
        <circle cx="0" cy="-27" r="7" fill="#d8aa72" stroke="#5d3c26" stroke-width="1.5"/>
        <path d="M-8 -29 Q0 -38 8 -29 L6 -25 L-6 -25Z" fill="#6d7272" stroke="#d7c28a" stroke-width="1.5"/>
        <path d="M-10 -17 L-17 -10 L-12 -4 L-5 -10Z" fill="#315b6f" stroke="#d6b55c" stroke-width="1.8"/>
        <g transform="rotate({sword} -2 -17)"><path d="M4 -17 L18 -31" stroke="#d8dde0" stroke-width="2.5"/><path d="M13 -28 L19 -34" stroke="#f5e8bf" stroke-width="1.5"/><path d="M1 -20 L7 -14" stroke="#9a6a2f" stroke-width="2.5"/></g>
        <path d="M-3 -17 L8 -17" stroke="#efcf73" stroke-width="2"/>
      </g></g>'''

def main():
    cells=[]
    for row,state in enumerate(STATES):
        for d,angle in enumerate(ANGLES):
            for phase in range(2): cells.append(frame((d*2+phase)*64,row*64,angle,state,phase))
    svg=f'''<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="320" viewBox="0 0 1024 320">
<title>Riftwatch repository-owned militia animation atlas</title>
<rect width="1024" height="320" fill="none"/>{''.join(cells)}</svg>\n'''
    out=Path(__file__).resolve().parents[2]/'assets/sprites/militia-atlas.svg'
    out.parent.mkdir(parents=True,exist_ok=True);out.write_text(svg)
    print(out)

if __name__ == '__main__': main()
