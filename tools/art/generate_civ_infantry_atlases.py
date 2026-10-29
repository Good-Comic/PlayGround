#!/usr/bin/env python3
"""原創文明步兵姿勢，單次只生成指定切片。 / Original civ infantry poses; generate only the requested slice."""
import argparse
import math
from pathlib import Path

STATES = ['idle', 'walk', 'attack', 'hit', 'death']
VARIANTS = {'teu-guard': 'TEU', 'azt-militia': 'AZT', 'byz-spearman': 'BYZ', 'got-militia': 'GOT', 'spa-spearman': 'SPA'}


def equipment(civ, dx, dy, state, frame):
    back = dy < -.3
    swing = [-18, -58, 42, 2][frame] if state == 'attack' else -12
    handx, handy = 12*dx, -35+4*dy
    side = 1 if dx >= 0 else -1
    if civ == 'TEU':
        shield = '''<g transform="translate(-10 -29)"><path d="M-10-20L9-21L12 12L0 24L-11 13Z" fill="url(#enamel)" stroke="#d0c9ad" stroke-width="2"/>
          <path d="M-8-17L6-18L8 10L0 19L-7 11Z" fill="#d7d5bd"/><path d="M-2-15V15M-7-5H7" stroke="#343e43" stroke-width="4"/>
          <path d="M-10-20L-7 11L0 21" fill="none" stroke="#f3e7bd" stroke-width="1"/><circle cy="-4" r="2" fill="#8b9b9b"/></g>'''
        weapon = f'''<g transform="translate({handx:.2f} {handy:.2f}) rotate({swing*side}) scale({side} 1)">
          <path d="M0 5L-2-27L1-39L5-27L4 5Z" fill="url(#steel)" stroke="#34484e" stroke-width="1"/>
          <path d="M1-32L2 4" stroke="#e9eee2" stroke-width="1"/><path d="M-6 5H10M2 6V15" stroke="#bba674" stroke-width="3"/>
          <path d="M0 8H4M0 11H4" stroke="#4b3d2c" stroke-width="1"/></g>'''
        head = f'''<path d="M-10-60L8-62L10-43L2-38L-9-43Z" fill="url(#steel)" stroke="#d7d2b5" stroke-width="1.3"/>
          <path d="M{-6+dx*3:.2f}-53H{5+dx*3:.2f}M0-60V-42" stroke="#34474e" stroke-width="2"/>
          <path d="M-7-48h2m2 0h2m2 0h2M-7-45h2m2 0h2m2 0h2" stroke="#44545a" stroke-width="1"/>
          <path d="M-8-59L4-60" stroke="#f5f0d0" stroke-width="1"/>'''
        torso = '''<path d="M-14-41L-9-45L8-45L14-39L11-11L0-5L-12-12Z" fill="url(#steel)" stroke="#364a51" stroke-width="1.5"/>
          <path d="M-9-39L0-34L9-40M0-34V-14M-9-27L0-23L9-28" fill="none" stroke="#d0d6c8" stroke-width="1.3"/>
          <path d="M-8-26L-1-23L6-26L8-7L2-2L-3-7L-9-3Z" fill="#c8c6ad" stroke="#707b72"/>
          <path d="M-2-22V-7M-7-16H4" stroke="#36474b" stroke-width="2.7"/>
          <path d="M-16-40L-8-43L-6-34L-15-31ZM8-43L17-38L16-30L7-34Z" fill="url(#steel)" stroke="#d0c8a8" stroke-width="1.2"/>'''
    elif civ == 'AZT':
        shield = '''<g transform="translate(-10 -24)"><circle r="16" fill="#3d685a" stroke="#d6bc76" stroke-width="2"/>
          <circle r="12" fill="#ac9360" stroke="#304e43" stroke-width="1.5"/>
          <path d="M-8 5V-3H-3V-8H3V-3H8V5H3V8H-3V5Z" fill="#315e51" stroke="#e7d49e" stroke-width="1"/>
          <path d="M-10 13L-11 20M-4 15V23M4 15V23M10 13L11 20" stroke="#bc9160" stroke-width="2"/></g>'''
        teeth = ''.join(f'<path d="M-4 {y}l-4 1l1 5l4 1ZM5 {y}l4 1l-1 5l-4 1Z" fill="#243b3d" stroke="#758b80" stroke-width=".6"/>' for y in [-32,-25,-18])
        weapon = f'''<g transform="translate({handx:.2f} {handy:.2f}) rotate({swing*side}) scale({side} 1)">
          <path d="M-4-35Q0-40 5-35L5-10L2-7L2 13H-1V-7L-4-10Z" fill="#8d6941" stroke="#d1b274" stroke-width="1.2"/>{teeth}
          <path d="M-1-32V-11M-1 4H2M-1 7H2" stroke="#d6bd87" stroke-width="1"/></g>'''
        feathers = ''.join(f'<path d="M{x} -53Q{x-5} {y-4} {x} {y}Q{x+6} {y+2} {x+3} -52Z" fill="{color}" stroke="#b8c19a" stroke-width=".8"/>' for x,y,color in [(-12,-70,'#326c62'),(-6,-80,'#438d73'),(1,-85,'#315f58'),(8,-77,'#568978'),(14,-67,'#b39054')])
        head = f'''{feathers}<ellipse cx="{dx*2:.2f}" cy="-48" rx="7" ry="8" fill="{'#695b43' if back else '#b18b62'}" stroke="#73593e"/>
          <path d="M-9-52H9L8-46H-8Z" fill="#a78b52" stroke="#dbcc99"/><path d="M-6-50H-2M2-50H6" stroke="#3a6b5a" stroke-width="2"/>'''
        torso = '''<path d="M-12-39Q0-47 12-39L10-12L0-5L-10-12Z" fill="url(#cotton)" stroke="#776b4a" stroke-width="1.4"/>
          <path d="M-9-35L8-18M-9-27L4-14M-5-39L10-24M8-36L-9-19M10-29L-3-15M2-40L-10-27" stroke="#aa9c73" stroke-width="1.2"/>
          <path d="M-10-11L0-7L10-11L10-2L4 1L0-3L-5 1L-10-3Z" fill="#5b7c62" stroke="#d0bc7f"/>
          <path d="M-12-36L-15-22M12-36L15-22" stroke="#ad8a61" stroke-width="5"/>'''
    elif civ == 'BYZ':
        shield = '''<g transform="translate(-10 -27)"><ellipse rx="14" ry="18" fill="url(#bronze)" stroke="#e2c992" stroke-width="2"/>
          <ellipse rx="10" ry="14" fill="#536a78" stroke="#b7a873"/><path d="M0-11L3-3L9 0L3 3L0 11L-3 3L-9 0L-3-3Z" fill="#d6bf82"/>
          <ellipse rx="3" ry="4" fill="#9e8554" stroke="#efe0ad"/></g>'''
        thrust = [0,-3,10,1][frame] if state == 'attack' else 0
        endx, endy = dx*(39+thrust), (-25+dy*12 if state == 'death' else -45+dy*15)
        weapon = f'''<g transform="translate({handx:.2f} {handy:.2f})">
          <path d="M{-dx*18:.2f} 25L{endx:.2f} {endy:.2f}" stroke="#493d2c" stroke-width="3.5"/>
          <path d="M{-dx*18:.2f} 25L{endx:.2f} {endy:.2f}" stroke="#c1a474" stroke-width="1.4"/>
          <path d="M{endx-3:.2f} {endy+5:.2f}L{endx+dx*4:.2f} {endy-9:.2f}L{endx+4:.2f} {endy+4:.2f}Z" fill="url(#steel)" stroke="#54666a" stroke-width=".8"/>
          </g>'''
        head = f'''<path d="M-8-53Q0-68 8-53L7-43H-7Z" fill="url(#bronze)" stroke="#e0c18a"/>
          <path d="M-9-49L-11-37L-5-34L0-40L5-34L11-37L9-49" fill="#646f70" stroke="#c0b28b"/>
          <ellipse cx="{dx*2:.2f}" cy="-47" rx="4.5" ry="5" fill="{'#657575' if back else '#c0a07d'}"/>
          <path d="M-2-61Q-3-79 9-73L10-65L4-65L3-58Z" fill="#865748" stroke="#d5bb7c"/>'''
        rows = ''.join(f'<path d="M-10 {y}L0 {y+3}L10 {y}M-5 {y}v5M1 {y+2}v4M6 {y+1}v4" stroke="#c8aa76" stroke-width="1" fill="none"/>' for y in [-36,-30,-24,-18])
        torso = f'''<path d="M-13-40Q0-46 13-40L12-12L5-3L0-8L-5-3L-12-12Z" fill="url(#bronze)" stroke="#5d5d4c" stroke-width="1.4"/>{rows}
          <path d="M-11-13L-12-4M-6-12L-7-2M0-12V-3M6-12L7-2M11-13L12-4" stroke="#5a6978" stroke-width="3"/>'''
    elif civ == 'GOT':
        shield = '''<g transform="translate(-11 -27)"><path d="M0-24Q15-20 14 0Q13 19 0 25Q-15 18-14-1Q-14-20 0-24Z" fill="#716a44" stroke="#c7bd8b" stroke-width="2"/><path d="M0-20V20M-11-12L10 12M-11 11L10-12" stroke="#353f35" stroke-width="3"/><ellipse rx="4" ry="5" fill="url(#steel)" stroke="#d9c493"/><path d="M-9-14Q-15 0-7 15" fill="none" stroke="#d9ca9a" stroke-width="1"/></g>'''
        weapon = f'''<g transform="translate({handx:.2f} {handy:.2f}) rotate({swing*side}) scale({side} 1)"><path d="M-2 3L-3-29L0-39L4-29L3 3Z" fill="url(#steel)" stroke="#42585d"/><path d="M0-33V2" stroke="#e6e4ce"/><path d="M-7 4H8M0 6V15" stroke="#ad9467" stroke-width="3"/><circle cy="16" r="2.5" fill="#bdad7b"/></g>'''
        head = f'''<path d="M-9-53Q-8-63 0-68Q8-63 9-53L8-43L4-40V-49H-4V-40L-8-43Z" fill="url(#steel)" stroke="#b7c2b1" stroke-width="1.2"/><ellipse cx="{dx*2:.2f}" cy="-48" rx="4" ry="5" fill="{'#5a665c' if back else '#b8956e'}"/><path d="M0-66V-49M-8-55Q0-58 8-55" fill="none" stroke="#d3be86" stroke-width="2"/><path d="M-7-43L-4-37H4L7-43L3-40H-3Z" fill="#66563b"/>'''
        links = ''.join(f'<path d="M{x} {y}q-2 3 0 4q3 0 3-3" fill="none" stroke="#aeb8a3" stroke-width=".75"/>' for y in [-37,-32,-27,-22,-17,-12] for x in [-8,-3,2,7])
        torso = f'''<path d="M-15-40L-9-43L0-40L10-43L15-39L12-6L4 0L0-4L-5 0L-12-6Z" fill="#4e5b52" stroke="#b7bea7" stroke-width="1.2"/>{links}<path d="M-16-39L-12-45L-7-43L-3-46L1-43L6-45L11-43L16-39L12-34L7-36L3-33L-2-36L-7-33L-11-36Z" fill="#8b805c" stroke="#c6b489" stroke-width="1.2"/><path d="M-9-20L8-17" stroke="#51432e" stroke-width="3"/><path d="M-2-21L3-20L2-16L-3-17Z" fill="#bfaa74"/><path d="M-12-33L-17-18L-12-8" fill="none" stroke="#676246" stroke-width="3"/>'''
    else:
        thrust = [0,-4,12,2][frame] if state == 'attack' else 0
        ex, ey = dx*(43+thrust), (-20+dy*12 if state == 'death' else -40+dy*18)
        weapon = f'''<g transform="translate({handx:.2f} {handy:.2f})"><path d="M{-dx*20:.2f} 26L{ex:.2f} {ey:.2f}" stroke="#47382b" stroke-width="3.5"/><path d="M{-dx*20:.2f} 26L{ex:.2f} {ey:.2f}" stroke="#d0b583" stroke-width="1.3"/><path d="M{ex-3:.2f} {ey+4:.2f}L{ex+dx*4:.2f} {ey-10:.2f}L{ex+4:.2f} {ey+4:.2f}Z" fill="url(#steel)" stroke="#53696f"/><path d="M{ex-dx*7:.2f} {ey+12:.2f}L{ex+dx*2:.2f} {ey+10:.2f}" stroke="#8d6a43" stroke-width="2"/></g>'''
        shield = '''<path d="M-12-37L-16-24L-9-19M9-38L13-27" stroke="#bbb29a" stroke-width="5" stroke-linecap="round"/><path d="M-14-29L-17-21L-11-17L-8-23Z" fill="#95684b" stroke="#dbc295"/>'''
        head = f'''<ellipse cx="{dx*2:.2f}" cy="-48" rx="6" ry="7" fill="{'#7b7868' if back else '#c09b72'}" stroke="#6d634d"/><path d="M-9-53Q-10-63 0-66Q9-63 9-53L14-56L15-51Q0-45-15-51L-14-56Z" fill="url(#steel)" stroke="#d8d6bb" stroke-width="1.2"/><path d="M-1-65Q2-60 1-52" fill="none" stroke="#d9d7ba" stroke-width="2"/><path d="M-6-44L-3-40H3L6-44" stroke="#6c5139" stroke-width="2" fill="none"/>'''
        torso = '''<path d="M-15-36L-15-45L-8-43L-4-36L-6-26L-17-27Z" fill="#ddd3b1" stroke="#9c805a"/><path d="M8-43L15-45L17-28L7-26L4-36Z" fill="#c4b993" stroke="#9c805a"/><path d="M-13-41L-10-30M-8-40L-6-31M9-40L7-30M13-41L15-31" stroke="#8e4939" stroke-width="2.5"/><path d="M-10-41L0-43L10-41L9-20L0-15L-9-20Z" fill="url(#steel)" stroke="#d2cbaa" stroke-width="1.2"/><path d="M-7-38L0-34L7-38M0-34V-20" fill="none" stroke="#dce1c9" stroke-width="1.3"/><path d="M-10-21L0-17L10-21L11-8L5-5L0-9L-5-5L-11-8Z" fill="#bdb18a" stroke="#796847"/><path d="M-7-17V-8M0-15V-10M7-17V-8" stroke="#8e4d3a" stroke-width="3"/><path d="M-8-9L-9 1M7-9L9 1" stroke="#a38d61" stroke-width="5"/>'''
    return torso, head, shield, weapon


def cell(civ, direction, state, frame):
    angle = direction*math.pi/4
    dx, dy = math.cos(angle), math.sin(angle)
    back = dy < -.3
    stride = [-4,0,4,0][frame] if state == 'walk' else 0
    bob = [0,-1.5,0,-.5][frame] if state == 'walk' else [0,-.5,0,.5][frame] if state == 'idle' else 0
    fall = [5,24,53,82][frame] if state == 'death' else 0
    recoil = [-2,-4,-1,0][frame] if state == 'hit' else 0
    torso, head, shield, weapon = equipment(civ, dx, dy, state, frame)
    legs = f'''<path d="M-6-10L{-7+stride} 4L{-9+stride} 8M6-10L{7-stride} 4L{10-stride} 8" stroke="{'#886b46' if civ=='AZT' else '#40515a'}" stroke-width="5" stroke-linecap="round"/>
      <path d="M{-9+stride} 7h-4M{10-stride} 7h4" stroke="#373a30" stroke-width="3"/>
      <path d="M-7-8L{-6+stride} 2M6-8L{7-stride} 2" stroke="{'#c9ad7d' if civ=='AZT' else '#b4c0b8'}" stroke-width="2"/>'''
    return f'''<g transform="translate(96 112)"><ellipse cy="5" rx="18" ry="5" fill="#182826" opacity=".25"/>
      <g transform="translate({recoil} {bob}) rotate({fall})" opacity="{1-frame*.12 if state=='death' else 1}">
      {legs}{shield if back else weapon}{torso}
      <path d="M-10-34L-13-25L-10-20M10-34L{12*dx:.2f} {-35+4*dy:.2f}" stroke="{'#aa845d' if civ=='AZT' else '#8d9e98'}" stroke-width="4" stroke-linecap="round"/>
      {head}{weapon if back else shield}</g></g>'''


def build(variant):
    civ = VARIANTS[variant]
    defs = '''<defs><linearGradient id="steel" x2="1" y2=".7"><stop stop-color="#d1d9d1"/><stop offset=".38" stop-color="#8fa09d"/><stop offset=".6" stop-color="#c4cdc1"/><stop offset="1" stop-color="#495f67"/></linearGradient>
      <linearGradient id="enamel" x2="1" y2=".4"><stop stop-color="#364e57"/><stop offset=".45" stop-color="#617673"/><stop offset="1" stop-color="#293e48"/></linearGradient>
      <linearGradient id="cotton" x2="1" y2=".8"><stop stop-color="#e5dec0"/><stop offset=".45" stop-color="#c6b98d"/><stop offset="1" stop-color="#8d835e"/></linearGradient>
      <linearGradient id="bronze" x2="1" y2=".7"><stop stop-color="#d4bc83"/><stop offset=".4" stop-color="#a58c5b"/><stop offset=".65" stop-color="#c5a977"/><stop offset="1" stop-color="#6d6b56"/></linearGradient></defs>'''
    cells = [f'<g transform="translate({((d%4)*4+f)*192} {(row*2+d//4)*192})">{cell(civ,d,s,f)}</g>' for row,s in enumerate(STATES) for d in range(8) for f in range(4)]
    return '<svg xmlns="http://www.w3.org/2000/svg" width="3072" height="1920" viewBox="0 0 3072 1920"><title>Riftwatch original '+variant+' directional infantry</title>'+defs+''.join(cells)+'</svg>\n'


if __name__ == '__main__':
    p = argparse.ArgumentParser();p.add_argument('variant',choices=VARIANTS);a=p.parse_args()
    target=Path(__file__).resolve().parents[2]/'assets/sprites'/f'{a.variant}-atlas.svg'
    target.write_text(build(a.variant));print(target)
