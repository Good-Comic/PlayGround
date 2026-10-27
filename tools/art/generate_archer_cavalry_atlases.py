#!/usr/bin/env python3
"""Generate repository-owned archer and light-cavalry animation atlases."""
from pathlib import Path
DIRECTIONS=['E','SE','S','SW','W','NW','N','NE']; ANGLES=[-90,-45,0,45,90,135,180,-135]; STATES=['idle','walk','attack','hit','death']

def motion(state,phase):
 return (-1 if phase else 0),(3 if phase else -3) if state=='walk' else 0,(70 if state=='death' and phase else 28 if state=='death' else 0),(-4 if state=='hit' and phase else 0),(.62 if state=='death' and phase else 1)

def archer(x,y,angle,state,phase):
 bob,stride,fall,recoil,opacity=motion(state,phase);draw=7 if state=='attack' and phase else 0
 return f'''<g transform="translate({x+32} {y+50}) rotate({fall}) translate({recoil} {bob})" opacity="{opacity}"><ellipse cy="3" rx="12" ry="3.5" fill="#10140e" opacity=".34"/><g transform="rotate({angle})"><path d="M{-3+stride} 0L{-5+stride} 8M{3-stride} 0L{5-stride} 8" stroke="#3a291c" stroke-width="3.5"/><path d="M-7-18Q0-24 7-18L5 1Q0 4-5 1Z" fill="#35634f" stroke="#d8c482" stroke-width="1.3"/><circle cy="-27" r="6" fill="#d6a473"/><path d="M-7-29Q0-35 7-29L5-25H-5Z" fill="#4b3928"/><path d="M-9-18L-14-5" stroke="#6f4529" stroke-width="3"/><path d="M-13-20L-8-7M-11-21L-6-8M-9-21L-4-9" stroke="#dfc37a" stroke-width="1"/><g transform="translate({draw} 0)"><path d="M9-31Q22-18 9-5" fill="none" stroke="#bb8748" stroke-width="2.5"/><path d="M9-31L9-5" stroke="#e6d59d" stroke-width=".8"/><path d="M1-18L20-18" stroke="#d9dde0" stroke-width="1.5"/><path d="M20-18L16-21M20-18L16-15" stroke="#d9dde0"/></g></g></g>'''

def cavalry(x,y,angle,state,phase):
 bob,stride,fall,recoil,opacity=motion(state,phase);thrust=9 if state=='attack' and phase else 0
 return f'''<g transform="translate({x+40} {y+49}) rotate({fall}) translate({recoil} {bob})" opacity="{opacity}"><ellipse cy="4" rx="20" ry="5" fill="#10140e" opacity=".36"/><g transform="rotate({angle})"><path d="M-13-4L{-16+stride} 9M-5-3L{-6-stride} 9M8-4L{12+stride} 9M15-5L{17-stride} 8" stroke="#3a2619" stroke-width="4" stroke-linecap="round"/><path d="M-20-14Q0-23 19-12L15 1Q0 6-17 0Z" fill="#704a2d" stroke="#d7b86d" stroke-width="1.5"/><path d="M15-14Q25-22 28-12L23-4L15-5Z" fill="#805637"/><path d="M24-17L28-23" stroke="#342219" stroke-width="2"/><path d="M-3-27Q4-34 10-26L9-12H-4Z" fill="#9f4237" stroke="#e0c57b" stroke-width="1.4"/><circle cx="4" cy="-36" r="5.5" fill="#d4a06d"/><path d="M-2-38Q4-44 10-38L8-34H0Z" fill="#70777a"/><path d="M8-26L{31+thrust}-33" stroke="#d8dde0" stroke-width="2.2"/><path d="M{28+thrust}-36L{35+thrust}-34L{29+thrust}-30Z" fill="#e8d59b"/></g></g>'''

def build(name,width,drawer):
 cells=[]
 for row,state in enumerate(STATES):
  for direction,angle in enumerate(ANGLES):
   for phase in range(2):cells.append(drawer((direction*2+phase)*width,row*64,angle,state,phase))
 return f'<svg xmlns="http://www.w3.org/2000/svg" width="{width*16}" height="320" viewBox="0 0 {width*16} 320"><title>Riftwatch repository-owned {name} animation atlas</title>{"".join(cells)}</svg>\n'

root=Path(__file__).resolve().parents[2]/'assets/sprites';root.mkdir(parents=True,exist_ok=True)
(root/'archer-atlas.svg').write_text(build('archer',64,archer));(root/'light-cavalry-atlas.svg').write_text(build('light cavalry',80,cavalry));print(root)
