#!/usr/bin/env python3
"""Trialum S7 G-00L: reproducible PBR art assets, pure geometry, no engine writes.
Owner-approved E0/E1 product board: 21 named designs and seven modular extras.
Dependencies: numpy, trimesh, Pillow (optional, no external texture assets).
"""
import hashlib, json, math, os
from pathlib import Path
import numpy as np
import trimesh
from trimesh.visual.material import PBRMaterial
from trimesh.visual import TextureVisuals
ROOT=Path(__file__).resolve().parents[1]
if ROOT.name=="tools": ROOT=ROOT.parent  # GitHub repo tools/b1/ layout
MODELS=ROOT/'assets/models'; MODELS.mkdir(parents=True, exist_ok=True)
ASSET_DIR=ROOT/'assets/s7-e0e1';ASSET_DIR.mkdir(parents=True,exist_ok=True)
SCENES=ROOT/'projects';SCENES.mkdir(parents=True,exist_ok=True)
C={
 'cream':('#e9e8d9',.35,.38), 'ivory':('#f6f0e0',.16,.42),
 'sage':('#697f67',.37,.6), 'sage2':('#9aa992',.3,.55),
 'forest':('#2b4944',.3,.63), 'chrome':('#bcc9c8',.95,.18),
 'metal':('#85948f',.75,.32), 'steel':('#576e73',.76,.46),
 'black':('#1c2a2d',.34,.6), 'dark':('#27363a',.65,.43),
 'tire':('#182222',.15,.85), 'glass':('#244e55',.48,.2),
 'cyan':('#22f2e9',.12,.16), 'blue':('#36acc9',.2,.25),
 'warm':('#ffecb6',.12,.2), 'green':('#74bb78',.12,.6),
 'leaf':('#5a935e',.02,.75), 'leaflight':('#9ccf72',.02,.75),
 'magenta':('#8a5fa7',.08,.7), 'soil':('#6d503b',.05,.92),
 'pot':('#505c55',.12,.75), 'card':('#d4d5c6',.02,.68),
 'yellow':('#edc478',.02,.65),'red':('#d77d72',.0,.6)
}
def hex_rgb(h):return tuple(int(h[i:i+2],16) for i in (1,3,5))
def palette_mat(k):
 h,met,rgh=C[k]; return PBRMaterial(name='TRIALUM_'+k, baseColorFactor=(*[n/255 for n in hex_rgb(h)],1),metallicFactor=met,roughnessFactor=rgh,emissiveFactor=([.08,.78,.7] if k=='cyan' else ([.6,.41,.12] if k=='warm' else [0,0,0])),doubleSided=True)
MAT={k:palette_mat(k) for k in C}

class Model:
 def __init__(self,name):self.name=name;self.parts=[]
 def put(self,mesh,mat,tag):
  if not isinstance(mesh,trimesh.Trimesh):raise TypeError(type(mesh))
  mesh.visual=TextureVisuals(material=MAT[mat]);self.parts.append((mesh,tag,mat));return mesh
 def box(self,center,size,material='cream',tag='panel'):
  mesh=trimesh.creation.box(extents=size);mesh.apply_translation(center);return self.put(mesh,material,tag)
 def cyl(self,center,radius,height,mat='chrome',tag='tube',axis='y',sections=12):
  mesh=trimesh.creation.cylinder(radius=radius,height=height,sections=sections)
  if axis=='y':mesh.apply_transform(trimesh.transformations.rotation_matrix(math.pi/2,[1,0,0]))
  if axis=='x':mesh.apply_transform(trimesh.transformations.rotation_matrix(math.pi/2,[0,1,0]))
  mesh.apply_translation(center);return self.put(mesh,mat,tag)
 def torus(self,center,r_major,r_minor,mat='chrome',tag='ring',vertical=False,sections=40,tubular=8):
  verts=[];faces=[]
  for i in range(sections):
   a=2*math.pi*i/sections
   for j in range(tubular):
    b=2*math.pi*j/tubular
    r=r_major+r_minor*math.cos(b)
    if vertical:pt=[r*math.cos(a),r*math.sin(a),r_minor*math.sin(b)]
    else:pt=[r*math.cos(a),r_minor*math.sin(b),r*math.sin(a)]
    verts.append(np.array(pt)+np.array(center))
  for i in range(sections):
   for j in range(tubular):
    u=i*tubular+j;v=i*tubular+(j+1)%tubular;w=((i+1)%sections)*tubular+j;x=((i+1)%sections)*tubular+(j+1)%tubular
    faces.extend([[u,w,v],[v,w,x]])
  return self.put(trimesh.Trimesh(vertices=verts,faces=faces,process=False),mat,tag)
 def bar(self,a,b,radius,mat='chrome',tag='rail',sections=10):
  a,b=np.array(a,dtype=float),np.array(b,dtype=float)
  v=b-a;dist=np.linalg.norm(v)
  if dist<.0001:return
  mesh=trimesh.creation.cylinder(radius=radius,height=dist,sections=sections)
  mat4=trimesh.geometry.align_vectors([0,0,1],v/dist)
  mesh.apply_transform(mat4);mesh.apply_translation((a+b)/2)
  return self.put(mesh,mat,tag)
 def path(self,points,radius,mat='dark',tag='hose',sections=9):
  # Segmented smooth cylindrical path, with geometry from each point-to-point section.
  pts=[np.array(p,dtype=float) for p in points]
  for a,b in zip(pts,pts[1:]):self.bar(a,b,radius,mat,tag,sections)
 def wheel(self,x,y,z,r=.075):
  self.cyl((x,y,z),r,.047,'tire','wheel',axis='z',sections=12)
  self.cyl((x,y,z+.027),r*.44,.008,'chrome','wheel-hub',axis='z',sections=12)
 def led(self,c,s,mat='cyan',tag='cyan-indicator'):self.box(c,s,mat,tag)
 def leaf(self,c,length=.12,width=.06,mat='leaf',rot=0):
  sp=trimesh.creation.icosphere(subdivisions=1,radius=1)
  sp.apply_scale((width,length,.021))
  sp.apply_transform(trimesh.transformations.rotation_matrix(rot,[0,0,1]))
  sp.apply_translation(c);self.put(sp,mat,'leaf-mesh')
 def export(self,asset_id):
  sc=trimesh.Scene()
  for i,(mesh,tag,mat) in enumerate(self.parts):sc.add_geometry(mesh,geom_name=f'{asset_id}.{i:03d}.{tag}.{mat}',node_name=f'{tag}-{i:03d}')
  data=sc.export(file_type='glb'); assert data[:4]==b'glTF'
  p=MODELS/f'{asset_id}.glb';p.write_bytes(data)
  bounds=np.concatenate([np.array(m.bounds) for m,_,_ in self.parts],axis=0)
  lo,hi=bounds.min(axis=0),bounds.max(axis=0)
  assert lo[1]>-.06,(asset_id,lo)
  assert data[4:8]==(2).to_bytes(4,'little')
  jlen=int.from_bytes(data[12:16],'little');gltf=json.loads(data[20:20+jlen]);assert gltf.get('meshes') and gltf.get('materials')
  return {'path':str(p.relative_to(ROOT)),'sha256':hashlib.sha256(data).hexdigest(),'size':len(data),'meshes':len(gltf['meshes']),'materials':len(gltf['materials']),'dimensions':[round(float(hi[k]-lo[k]),4) for k in range(3)],'min':[round(float(lo[k]),4) for k in range(3)],'max':[round(float(hi[k]),4) for k in range(3)]}

# Core aesthetic: rounded-effect corner posts, pale ivory panels, sage beams, chrome structural hardware, small cyan LEDs.
def rack_frame(m,w,d,h,levels,wheels=False,heavy=False):
 r=.025 if heavy else .018
 for x in [-w/2+.055,w/2-.055]:
  for z in [-d/2+.05,d/2-.05]:
   m.bar((x,.13 if wheels else .02,z),(x,h-.08,z),r,'chrome','chrome-vertical-post')
   m.box((x,h-.07,z),(.09,.08,.09),'sage','top-corner-cap')
 for y in [(.17 if wheels else .065),h-.1]:
  for z in [-d/2+.05,d/2-.05]:m.box((0,y,z),(w-.08,.045,.065),'sage','rack-long-rail')
  for x in [-w/2+.055,w/2-.055]:m.box((x,y,0),(.065,.045,d-.07),'sage','rack-side-rail')
 for y in levels:
  m.box((0,y,0),(w-.10,.055,d-.10),'ivory','tray-load-deck')
  m.box((0,y+.016,-d/2+.055),(w-.11,.04,.04),'sage','deck-front-lip')
  m.box((0,y+.029,d/2-.073),(w-.12,.02,.032),'metal','deck-rear-stop')
  m.led((0,y+.014,-d/2+.034),(w*.68,.012,.012),'cyan','under-shelf-led')
  for x in [-w/2+.085,w/2-.085]:m.box((x,y-.09,0),(.04,.12,d*.58),'steel','shelf-support')
 for z in [-d/2+.042,d/2-.042]:
  m.box((0,h-.065,z),(w*.65,.026,.03),'metal','top-reinforcement')
 for x in [-w/2+.07,w/2-.07]:m.led((x,h-.055,-d/2+.035),(.025,.045,.024),'warm','top-corner-led')
 if wheels:
  for x in [-w/2+.125,w/2-.125]:
   for z in [-d/2+.12,d/2-.12]:
    m.cyl((x,.095,z),.029,.09,'metal','caster-stem')
    m.wheel(x,.062,z,r=.054)
 else:
  for x in [-w/2+.085,w/2-.085]:
   for z in [-d/2+.07,d/2-.07]:m.box((x,.023,z),(.11,.045,.11),'black','rubber-foot')
 if heavy:
  for x in [-w/2+.07,w/2-.07]:
   m.bar((x,.16,d/2-.055),(x,h-.13,-d/2+.055),.012,'steel','rear-diagonal-brace')

def nursery(m,w,tiers,mobile=False):
 h=1.45 if tiers==3 else 1.83;d=.54
 levels=np.linspace(.27,h-.25,tiers)
 rack_frame(m,w,d,h,levels,wheels=mobile)
 for y in levels:
  for x in np.linspace(-w*.32,w*.32,3):
   # Sliding seedling tray supports, normally EMPTY until linked to canonical inventory.
   m.box((x,y+.048,0),(w*.19,.04,d*.66),'pot','empty-nursery-tray')
   m.box((x,y+.073,-d*.32),(w*.18,.022,.022),'sage2','tray-handle')
 for y in levels[:2]:m.box((0,y-.068,0),(w*.73,.012,d*.76),'metal','drip-catch-pan')
 m.box((0,h-.079,-d/2-.07),(w*.48,.095,.034),'cream','rack-identity-panel')
 m.led((0,h-.125,-d/2-.092),(w*.36,.011,.012),'cyan','nursery-status-line')

def mature(m,w,tiers=2,tall=False,double=False):
 h=2.3 if tall else 2.04;d=.88 if not double else .94
 levels=np.linspace(.32,h-.30,tiers)
 rack_frame(m,w,d,h,levels,heavy=True)
 for y in levels:
  for x in np.linspace(-w*.3,w*.3,3 if w>1.4 else 2):
   m.box((x,y+.047,0),(w*.21,.045,d*.60),'sage','reinforced-empty-carrier')
   for z in [-d*.25,d*.25]:m.box((x,y+.083,z),(w*.20,.026,.038),'metal','carrier-stop')
 for x in [-w/2+.20,w/2-.20]:
  m.box((x,.14,-d/2+.03),(.19,.12,.04),'cream','rm-base-service-panel')
  m.led((x,.12,-d/2+.058),(.12,.018,.009),'cyan','rm-service-indicator')
 if double:
  m.box((0,h-.083,-d/2+.04),(.14,.12,.08),'chrome','central-shelf-divider')

# Scaled real-world game-room dimensions; all models have level y>=0, Y-up.
def storage_rack(m,w=1.28,d=.55,h=1.9,levels=4,closed=False):
 if closed:
  m.box((0,h/2,0),(w,h,d),'cream','closed-locker-shell')
  m.box((0,h-.045,-d/2-.02),(w,.075,.032),'sage','locker-header')
  for xx in [-w/4,w/4]:
   m.box((xx,h*.51,-d/2-.021),(w*.48,h*.81,.018),'ivory','locker-door')
   m.box((xx+(.085 if xx<0 else -.085),h*.50,-d/2-.042),(.018,.19,.025),'chrome','door-handle')
   for i in range(4):m.box((xx+(i-1.5)*.037,h-.27,-d/2-.047),(.018,.07,.008),'steel','locker-vent')
  for xx in [-w/2+.085,w/2-.085]:
   m.box((xx,.038,0),(.12,.076,d*.7),'black','stability-foot')
  m.led((0,h*.20,-d/2-.048),(w*.54,.02,.009),'cyan','locker-led')
 else:
  rack_frame(m,w,d,h,np.linspace(.18,h-.23,levels),heavy=False)
  for i,y in enumerate(np.linspace(.18,h-.23,levels)):
   for xx in np.linspace(-w*.28,w*.28,3):
    mat=['sage','cream','metal'][i%3]
    m.box((xx,y+.075,0),(.27,.11,.35),mat,'storage-bin')
    m.box((xx,y+.138,-d*.33),(.16,.025,.008),'ivory','storage-label')
    m.led((xx,y+.152,-d*.33),(.09,.007,.008),'cyan','storage-tag-led')

def cart(m,toolbox=False):
 w,d,h=.81,.54,1.08
 for y in [.28,.56,.89]:
  m.box((0,y,0),(w,.065,d),'sage','mobile-cart-shelf')
  m.box((0,y+.04,-d*.48),(w*.9,.047,.018),'ivory','mobile-cart-lip')
 for x in [-w*.43,w*.43]:
  for z in [-d*.44,d*.44]:m.bar((x,.16,z),(x,1.02,z),.021,'chrome','caster-trolley-post')
 for x in [-w*.4,w*.4]:
  for z in [-d*.38,d*.38]:m.wheel(x,.065,z,r=.068)
 m.bar((-w*.43,1.02,-d*.44),(w*.43,1.02,-d*.44),.024,'chrome','cart-handle')
 m.led((0,.89,-d*.40),(.48,.014,.015),'cyan','cart-worklight')
 if toolbox:
  for y in [.35,.58,.81]:
   m.box((0,y+.055,0),(.65,.165,.43),'ivory','drawer-front')
   m.box((0,y+.053,-.228),(.24,.015,.015),'chrome','drawer-pull')
  m.box((0,.99,0),(.71,.09,.48),'dark','rubberized-tool-mat')
 else:
  for i in range(3):
   x=(i-1)*.22;m.box((x,.655,0),(.18,.13,.25),'pot','parts-tray')
   m.box((x,.96,0),(.16,.12,.21),'cream','spares-box')

def desk(m):
 w,d=2.2,.78
 m.box((0,.79,0),(w,.105,d),'ivory','ergonomic-desk-top')
 m.box((0,.855,-d/2+.026),(w*.73,.018,.028),'sage','rear-tech-trim')
 m.led((0,.77,-d/2+.04),(w*.55,.018,.025),'cyan','desk-edge-light')
 for x in [-.91,.91]:
  m.box((x,.38,0),(.42,.73,.68),'cream','drawer-cabinet')
  m.box((x,.36,-d/2-.006),(.33,.60,.023),'ivory','cabinet-face')
  for j in range(3):
   y=.19+j*.18;m.box((x,y,-d/2-.021),(.30,.009,.009),'steel','drawer-split')
   m.box((x,y+.058,-d/2-.04),(.11,.012,.02),'chrome','drawer-handle')
  m.led((x,.14,-d/2-.039),(.27,.013,.018),'cyan','drawer-status')
  m.box((x,.037,0),(.37,.075,.63),'forest','cabinet-base')
 m.box((0,.68,.24),(.91,.13,.12),'forest','cable-routing')
 for x in [-.7,0,.7]:m.box((x,.91,.17),(.18,.015,.10),'metal','desktop-grommet')

def chair(m):
 m.cyl((0,.39,0),.08,.76,'chrome','gas-lift')
 for i in range(5):
  a=i*2*math.pi/5;x=.34*math.cos(a);z=.34*math.sin(a)
  m.bar((0,.095,0),(x,.075,z),.027,'metal','chair-five-star-base')
  m.wheel(x,.053,z,r=.045)
 m.box((0,.68,0),(.58,.13,.56),'sage','padded-seat')
 m.box((0,1.00,.235),(.55,.69,.115),'cream','chair-backrest')
 m.box((0,1.01,.303),(.44,.47,.035),'sage2','chair-back-padding')
 m.box((0,1.35,.242),(.34,.12,.11),'sage','headrest')
 for x in [-.32,.32]:
  m.bar((x,.7,.02),(x,.90,.09),.018,'chrome','armrest-upright')
  m.box((x,.905,-.01),(.16,.038,.27),'sage','padded-armrest')
 m.led((0,1.29,.30),(.19,.017,.009),'cyan','chair-status-light')

def monitor(m,wall=False):
 w,h=(.96,.58) if not wall else (1.48,.85)
 y=1.04 if not wall else 1.64
 m.box((0,y,0),(w+.08,h+.09,.075),'dark','hologram-monitor-frame')
 m.box((0,y,.045),(w,h,.008),'glass','holographic-active-screen')
 # Real geometry UI: abstract plant/health only, never pretend to be live game data.
 for i in range(7):
  x=-w*.38+i*w*.12;m.box((x,y-h*.32,.06),(.024,h*.12*(.5+.5*math.sin(i+1)),.008),'cyan','holo-bar')
 for i in range(4):m.led((-w*.33+i*w*.20,y+h*.36,.064),(.08,.008,.006),'cyan','holo-header-tick')
 m.bar((0,y-h*.12,.069),(0,y+h*.15,.069),.010,'green','holo-stem')
 for ang in [-.9,-.32,.32,.9]:
  m.leaf((.09*math.sin(ang*2),y+.15*math.cos(ang),.074),.078,.028,'leaflight',rot=ang)
 for x in [-w/2+.028,w/2-.028]:m.led((x,y,.056),(.008,h*.82,.012),'cyan','edge-lit-panel')
 if not wall:
  m.bar((0,.14,-.05),(0,y-h*.54,-.05),.024,'chrome','monitor-pedestal')
  m.box((0,.11,-.05),(.42,.045,.32),'metal','monitor-base')
 else:
  for x in [-w*.38,w*.38]:m.box((x,y,-.065),(.16,.25,.08),'sage','wall-bracket')

def tower(m):
 w,h,d=.32,.78,.48
 m.box((0,h/2,0),(w,h,d),'cream','workstation-tower-case')
 m.box((0,h/2,-d/2-.012),(w*.79,h*.84,.015),'dark','mesh-tower-front')
 for y in [.22,.49]:
  m.torus((0,y,-d/2-.029),.083,.011,'cyan','workstation-fan-ring',vertical=True)
  m.cyl((0,y,-d/2-.025),.031,.006,'metal','fan-boss',axis='z')
 m.box((0,h-.10,-d/2-.025),(.22,.018,.025),'cyan','case-power-indicator')
 for i in range(8):m.box((-.12+i*.034,.085,-d/2-.027),(.012,.06,.02),'chrome','front-vent-slat')
 m.box((0,.023,0),(w*.88,.045,d*.94),'forest','case-foot')

def keyboard(m):
 w,d=.57,.18
 m.box((0,.022,0),(w,.044,d),'forest','keyboard-chassis')
 m.box((0,.048,0),(w*.94,.017,d*.89),'dark','key-mat')
 for row in range(4):
  for col in range(14 if row<3 else 9):
   x=-w*.42+col*(w*.82/(13 if row<3 else 8));z=-d*.35+row*.041
   m.box((x,.062,z),(.025,.008,.029),('cyan' if (col+row)%9==0 else 'ivory'),'independent-key')
 m.led((0,.031,-d*.47),(.39,.007,.005),'cyan','keyboard-underglow')

def mouse(m):
 sphere=trimesh.creation.icosphere(subdivisions=2,radius=1);sphere.apply_scale((.045,.031,.066));sphere.apply_translation([0,.036,0]);m.put(sphere,'sage','ergonomic-mouse-shell')
 m.box((0,.063,-.009),(.007,.008,.039),'dark','mouse-button-divider')
 m.cyl((0,.070,-.022),.007,.013,'chrome','scroll-wheel',axis='x')
 m.led((0,.055,.045),(.027,.009,.018),'cyan','mouse-light')

def lamp(m):
 m.box((0,.035,0),(.23,.07,.17),'ivory','lamp-base')
 m.box((0,.073,-.01),(.12,.01,.08),'cyan','lamp-base-indicator')
 for a,b in [((0,.1,0),(-.14,.42,.05)),((-.14,.42,.05),(.07,.72,.03))]:m.bar(a,b,.016,'chrome','articulated-lamp-arm')
 m.cyl((-.14,.42,.05),.038,.038,'sage','joint',axis='z')
 m.box((.18,.74,.02),(.34,.07,.105),'cream','task-lamp-lighthead')
 m.box((.18,.69,.02),(.28,.012,.073),'cyan','lamp-emissive-lens')
 m.cyl((.07,.72,.03),.035,.04,'chrome','head-knuckle',axis='z')

def tray(m,seeded=False,shallow=False):
 w,d=.59,.38
 m.box((0,.047,0),(w,.074,d),'pot','seedling-tray-shell')
 m.box((0,.088,-d/2+.013),(w*.92,.021,.024),'sage','front-edge')
 for a in range(4):
  for b in range(2):
   x=(a-1.5)*.12;z=(b-.5)*.17
   m.box((x,.085,z),(.108,.017,.15),'soil' if seeded else 'dark','tray-compartment')
   if seeded:
    m.bar((x,.103,z),(x,.175,z),.005,'leaf','seedling-demo-stem')
    m.leaf((x-.025,.165,z),.046,.024,'leaflight',rot=-.5)
    m.leaf((x+.025,.169,z),.047,.025,'leaf',rot=.5)
 m.led((0,.064,-d/2-.02),(.27,.01,.012),'cyan','tray-status-indicator')

def binbox(m,w=.49,h=.36,d=.37,open_=False):
 m.box((0,h/2,0),(w,h,d),'sage','lidded-storage-container')
 if not open_:
  m.box((0,h+.020,0),(w+.035,.045,d+.03),'cream','sealed-lid')
  m.led((0,h+.049,-d*.4),(.16,.008,.009),'cyan','container-status')
 else:
  # Open equipment case: lifted back lid plus 6 modelled compartments.
  m.box((0,h+.17,d*.45),(w+.025,.035,d*.87),'forest','opened-lid')
  m.box((0,h+.21,d*.45),(w*.81,.012,d*.67),'glass','lid-surface')
  for i in range(3):
   for j in range(2):m.box(((i-1)*.125,h+.024,(j-.5)*.12),(.10,.035,.10),'pot','seed-organizer-cell')
 for x in [-w*.43,w*.43]:m.box((x,h*.63,-d/2-.017),(.014,.10,.016),'chrome','box-handle')

def pot(m):
 m.cyl((0,.115,0),.105,.205,'pot','empty-cylindrical-pot',sections=24)
 m.cyl((0,.222,0),.115,.025,'chrome','rolled-pot-lip',sections=24)
 m.cyl((0,.226,0),.077,.03,'soil','open-pot-interior',sections=24)
 m.cyl((0,.014,0),.113,.027,'sage','pot-drain-pan',sections=24)

def statuspanel(m):
 m.box((0,.17,0),(.54,.34,.055),'ivory','rack-status-monitor')
 m.box((0,.18,.034),(.46,.23,.005),'glass','status-glass')
 for row in range(3):
  y=.10+.070*row;m.box((-.084,y,.041),(.19,.012,.006),'cyan','slot-status')
  m.box((.12,y,.041),(.09,.018,.007),'green','ready-icon')
 for x in [-.24,.24]:m.box((x,.17,.029),(.011,.28,.01),'steel','frame-rail')

def tool_box(m):
 m.box((0,.18,0),(.57,.36,.31),'cream','toolkit-case')
 m.box((0,.365,0),(.60,.035,.34),'sage','toolkit-lid')
 for y in [.11,.215,.32]:m.box((0,y,-.167),(.30,.018,.013),'metal','toolkit-drawer')
 m.bar((-.13,.392,0),(.13,.392,0),.014,'chrome','carrying-handle')
 m.led((0,.293,-.18),(.12,.011,.007),'cyan','maintenance-indicator')

def drawer_stack(m):
 m.box((0,.48,0),(.56,.93,.48),'cream','spare-service-cabinet')
 for i in range(5):
  y=.14+i*.157;m.box((0,y,-.25),(.49,.125,.014),'ivory','parts-drawer')
  m.box((0,y+.02,-.265),(.12,.016,.014),'chrome','parts-drawer-handle')
 m.box((0,.962,0),(.6,.045,.49),'sage','parts-work-surface')
 m.led((0,.96,-.20),(.28,.01,.01),'cyan','drawer-led')

def make(name):
 m=Model(name)
 if name=='rs01-nursery-3-tier':nursery(m,.96,3)
 elif name=='rs02-nursery-4-tier':nursery(m,1.1,4)
 elif name=='rs03-nursery-mobile':nursery(m,1.02,4,True)
 elif name=='rm01-mature-single':mature(m,1.34,2)
 elif name=='rm02-mature-double':mature(m,2.72,2,double=True)
 elif name=='rm03-mature-tall':mature(m,1.62,3,tall=True)
 elif name=='st01-spares-rack':storage_rack(m,1.24,.57,1.9,4)
 elif name=='st02-secure-cabinet':storage_rack(m,1.03,.58,1.9,closed=True)
 elif name=='st03-mobile-tool-cart':cart(m,True)
 elif name=='st04-container-shelf':storage_rack(m,1.16,.54,1.75,4)
 elif name=='w01-workstation-desk':desk(m)
 elif name=='w02-ergonomic-chair':chair(m)
 elif name=='w03-hologram-monitor':monitor(m)
 elif name=='w04-workstation-tower':tower(m)
 elif name=='w05-backlit-keyboard':keyboard(m)
 elif name=='w06-ergonomic-mouse':mouse(m)
 elif name=='lt01-task-lamp':lamp(m)
 elif name=='cn01-seedling-tray-demo':tray(m,True)
 elif name=='cn02-sealed-soil-container':binbox(m)
 elif name=='cn03-open-seed-kit':binbox(m,open_=True)
 elif name=='cn04-empty-plant-pot':pot(m)
 elif name=='rs04-nursery-single-bay':nursery(m,.73,3)
 elif name=='rs05-empty-seedling-tray':tray(m,False)
 elif name=='rm04-reinforced-mature-carrier':
  m.box((0,.063,0),(.83,.1,.62),'sage','reinforced-carrier-platform')
  for x in [-.39,.39]:
   for z in [-.28,.28]:m.box((x,.14,z),(.075,.16,.08),'chrome','carrier-anchor-post')
  for z in [-.28,.28]:m.box((0,.15,z),(.70,.052,.033),'steel','carrier-side-rail')
  for x in [-.41,.41]:m.led((x,.07,0),(.013,.015,.19),'cyan','carrier-status-rail')
 elif name=='rm05-rack-status-panel':statuspanel(m)
 elif name=='st05-service-parts-chest':drawer_stack(m)
 elif name=='st06-closed-toolkit':tool_box(m)
 elif name=='cn05-multipot-nursery-tray':
  m.box((0,.04,0),(.65,.06,.45),'pot','six-pot-carry-tray')
  for i in range(3):
   for j in range(2):
    x=(i-1)*.20;z=(j-.5)*.22;m.cyl((x,.14,z),.082,.15,'sage','nursery-individual-pot')
    m.cyl((x,.212,z),.083,.016,'chrome','pot-rim');m.cyl((x,.22,z),.055,.017,'soil','pot-empty-soil')
 else:raise KeyError(name)
 return m

NAMES=[
 ('rs01-nursery-3-tier','RS-01 · Полица за садници (3 нивоа)','RS · Расадници','floor'),
 ('rs02-nursery-4-tier','RS-02 · Проширена полица (4 нивоа)','RS · Расадници','floor'),
 ('rs03-nursery-mobile','RS-03 · Мобилна полица за садници','RS · Расадници','floor'),
 ('rm01-mature-single','RM-01 · Голема единечна полица','RM · Зрели растенија','floor'),
 ('rm02-mature-double','RM-02 · Широка двојна полица','RM · Зрели растенија','floor'),
 ('rm03-mature-tall','RM-03 · Висока полица за возрасни растенија','RM · Зрели растенија','floor'),
 ('st01-spares-rack','ST-01 · Полица за резервни материјали','ST · Сервис и складирање','floor'),
 ('st02-secure-cabinet','ST-02 · Затворен сервисен ормар','ST · Сервис и складирање','floor'),
 ('st03-mobile-tool-cart','ST-03 · Мобилна сервисна количка','ST · Сервис и складирање','floor'),
 ('st04-container-shelf','ST-04 · Полица за контејнери','ST · Сервис и складирање','floor'),
 ('w01-workstation-desk','W01 · Модуларна работна маса','W · Работна станица','floor'),
 ('w02-ergonomic-chair','W02 · Ергономски стол','W · Работна станица','floor'),
 ('w03-hologram-monitor','W03 · Холограмски монитор (демо HUD)','W · Работна станица','floor'),
 ('w04-workstation-tower','W04 · Компјутерско куќиште','W · Работна станица','floor'),
 ('w05-backlit-keyboard','W05 · Осветлена тастатура','W · Работна станица','floor'),
 ('w06-ergonomic-mouse','W06 · Ергономско глувче','W · Работна станица','floor'),
 ('lt01-task-lamp','LT-01 · Насочна работна LED ламба','Дополнителна опрема G-00L','floor'),
 ('cn01-seedling-tray-demo','CN-01 · Послужавник со ДЕМО садници','Дополнителна опрема G-00L','floor'),
 ('cn02-sealed-soil-container','CN-02 · Затворен контејнер за почва','Дополнителна опрема G-00L','floor'),
 ('cn03-open-seed-kit','CN-03 · Отворен организер за семиња','Дополнителна опрема G-00L','floor'),
 ('cn04-empty-plant-pot','CN-04 · Резервна саксија','Дополнителна опрема G-00L','floor'),
 ('rs04-nursery-single-bay','RS-04 · Компактна модуларна секција','RS · Расадници','floor'),
 ('rs05-empty-seedling-tray','RS-05 · Празен расаднички послужавник','RS · Расадници','floor'),
 ('rm04-reinforced-mature-carrier','RM-04 · Засилен носач за зрело растение','RM · Зрели растенија','floor'),
 ('rm05-rack-status-panel','RM-05 · Статусен дисплеј за регал','RM · Зрели растенија','wall'),
 ('st05-service-parts-chest','ST-05 · Ормар со фиоки за делови','ST · Сервис и складирање','floor'),
 ('st06-closed-toolkit','ST-06 · Комплет алат за поправка','ST · Сервис и складирање','floor'),
 ('cn05-multipot-nursery-tray','CN-05 · Модуларен послужавник со саксии','Дополнителна опрема G-00L','floor'),
]
assert len(NAMES)==28

def build_scenes(catalog):
 by_id={a['id']:a for a in catalog}
 scene_ids={
  'all':list(by_id),
  'rs':[a['id'] for a in catalog if 'RS' in a['category']],
  'rm':[a['id'] for a in catalog if 'RM' in a['category']],
  'st':[a['id'] for a in catalog if 'ST' in a['category']],
  'desk':[a['id'] for a in catalog if a['category'].startswith('W')],
  'accessories':[a['id'] for a in catalog if a['category'].startswith('Дополнителна')],
 }
 def instance(id,i,x,z,y=0):
  a=by_id[id];return dict(id=f'e0e1-{i:03d}',assetId=id,label=a['name'],position=[round(x,3),round(y,3),round(z,3)],rotationY=0,scale=[1,1,1],layer='props',locked=False,visible=True,binding='',note='G-00L asset review only; no live inventory or mature holding state')
 for key,ids in scene_ids.items():
  num_cols=4 if len(ids)>12 else 3
  xs=4.4 if key=='all' else 3.8; zs=4.0
  nrows=math.ceil(len(ids)/num_cols)
  instances=[]
  for i,id in enumerate(ids):
   row=i//num_cols; col=i%num_cols
   instances.append(instance(id,i,(col-(num_cols-1)/2)*xs,(row-(nrows-1)/2)*zs))
  room=dict(width=max(15,(num_cols+1)*xs),depth=max(14,(nrows+1)*zs),height=4.4,gridSize=.1,showWalls=False,floorColor='#35494a',wallColor='#596d6a')
  j=dict(schemaVersion=1,projectId=f'trialum-g00l-e0e1-{key}-review',name=f'G-00L · E0/E1 · {key.upper()} · {len(ids)} вистински GLB',description='Visual review of real 3D GLBs; unstocked shelving is intentional; no engine inventory writes.',room=room,instances=instances)
  (SCENES/f'trialum-g00l-e0e1-{key}-review.json').write_text(json.dumps(j,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
 # Main service zone illustrative arrangement, no production scene writes, empty racks.
 arrangement=[('rs01-nursery-3-tier',-5.5,-2.2),('rs02-nursery-4-tier',-4.2,-2.2),('rm01-mature-single',-1.5,-2.0),('rm02-mature-double',1,-1.9),('rm03-mature-tall',4.6,-2.0),('rm01-mature-single',6,-2),('st01-spares-rack',-6,2.5),('st02-secure-cabinet',-4.4,2.5),('st03-mobile-tool-cart',-2.5,2.4),('st04-container-shelf',-1.2,2.5),('w01-workstation-desk',3.2,2.4),('w02-ergonomic-chair',3.2,3.8),('w03-hologram-monitor',3.2,2.2),('w04-workstation-tower',4.65,2.8),('w05-backlit-keyboard',3.2,1.8),('w06-ergonomic-mouse',3.75,1.8)]
 ins=[]
 for i,(short,x,z) in enumerate(arrangement):
  id='s7-e0e1-'+short
  y=0.84 if short in ('w05-backlit-keyboard','w06-ergonomic-mouse') else 0
  if short=='w03-hologram-monitor':y=.82
  ins.append(instance(id,i,x,z,y))
 j=dict(schemaVersion=1,projectId='trialum-g00l-e0e1-layout-concept',name='G-00L · 2 RS / 4 RM · ОРИЕНТАЦИОНЕН РАСПОРЕД',description='Illustrative rack count and positions ONLY; not surveyed live greenhouse coordinates. 2 RS + 4 RM, RS and RM empty by default.',room=dict(width=19,depth=14,height=4.6,gridSize=.1,showWalls=False,floorColor='#394c4e',wallColor='#4f625f'),instances=ins)
 (SCENES/'trialum-g00l-e0e1-layout-concept.json').write_text(json.dumps(j,ensure_ascii=False,indent=2)+'\n',encoding='utf8')


def main():
 catalog=[];manifest=[]
 for short,name,category,placement in NAMES:
  id='s7-e0e1-'+short
  m=make(short);metrics=m.export(id);manifest.append(dict(id=id,**metrics))
  catalog.append(dict(id=id,name=name,category=category,src=metrics['path'],dimensions=metrics['dimensions'],placement=placement,source='tools/b1/build-s7-g00l-e0e1.py / approved G-00L E0/E1 concept 20261119',approval='OWNER CONCEPT PASS; REAL EXPORTED GLB DEVICE VISUAL REVIEW PENDING',ownerRenderPass=True,ownerModelPass=False,engineStateWrites=0,stockBinding='NONE; separate canonical state contract required',highSwapCompatible=True))
 build_scenes(catalog)
 (ASSET_DIR/'s7-e0e1-catalog-additions.json').write_text(json.dumps(catalog,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
 (ASSET_DIR/'s7-e0e1-manifest.json').write_text(json.dumps(dict(schemaVersion=1,group='S7-E0/E1',count=28,models=manifest,actualPlantSpeciesAdded=0,engineWrites=0,ownerConceptPass=True,ownerRealGlbPass=False),ensure_ascii=False,indent=2)+'\n',encoding='utf8')
 print(json.dumps(dict(count=len(catalog),sumBytes=sum(m['size'] for m in manifest),largest=max(m['size'] for m in manifest),meshes=sum(m['meshes'] for m in manifest),scenes=len(list(SCENES.glob('trialum-g00l-e0e1-*.json')))),indent=2))
if __name__=='__main__':main()
