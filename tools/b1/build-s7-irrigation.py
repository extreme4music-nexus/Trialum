#!/usr/bin/env python3
"""Trialum S7 greenhouse I01..I06 + C-IRR01 — authentic parametric GLB asset kit.

Editor-only geometry; no game logic and no claim that preview GLBs contain dynamic physics.
Requires Python3 numpy + trimesh. Run from any location with --root TARGET_REPO_DIR.
All curves use actual watertight swept tube geometry, not a flat billboard.
The source curves and connector tangents are preserved in a per-asset endpoint registry
for a future owner-approved Three.js Spline/TubeGeometry Builder edit tool.
"""
from __future__ import annotations
import argparse, math, json, hashlib
from pathlib import Path
import numpy as np
import trimesh
from trimesh.visual.material import PBRMaterial

MATS={
 'cream':([223,222,204,255],.48,.38), 'sage':([112,132,118,255],.64,.42),
 'deep_sage':([62,83,76,255],.73,.40), 'chrome':([209,222,224,255],1.0,.15),
 'steel':([151,168,170,255],.91,.24), 'dark':([37,48,53,255],.78,.56),
 'rubber':([36,42,46,255],.04,.78),'hose':([59,68,71,255],.1,.65),
 'water':([80,180,198,185],.14,.28),'glass':([147,222,221,170],.08,.24),
 'cyan':([82,239,229,255],.20,.22),'warm':([248,224,170,255],.0,.34),
 'blue':([62,117,184,255],.48,.35), 'red':([215,93,77,255],.15,.42),
 'copper':([191,137,83,255],.90,.29),'filter':([237,236,224,255],.04,.86),
 'screen':([29,71,76,255],.45,.3),'green':([77,201,135,255],.22,.29)
}
materials={}
for k,(c,metal,rough) in MATS.items():
 p=PBRMaterial(name='TRIALUM_IRR_'+k,baseColorFactor=c,metallicFactor=metal,
               roughnessFactor=rough, doubleSided=False)
 if k=='cyan':p.emissiveFactor=[.03,.5,.46]
 if k=='warm':p.emissiveFactor=[.30,.19,.04]
 if k=='green':p.emissiveFactor=[.01,.18,.06]
 materials[k]=p

class Mod:
 def __init__(self):self.s=trimesh.Scene();self.i=0;self.control_points=[];self.tags=[]
 def add(self,mesh,mat,name):
  if mesh is None or len(mesh.faces)==0:return
  mesh.visual.material=materials[mat];
  n=f'{self.i:03d}_{name}';self.i+=1
  self.s.add_geometry(mesh,geom_name=n,node_name=n)
 def box(self,extent,at,mat,name):
  mesh=trimesh.creation.box(extents=extent);mesh.apply_translation(at);self.add(mesh,mat,name)
 def cyl(self,r,h,at,mat,name,axis='y',sections=24):
  mesh=trimesh.creation.cylinder(radius=r,height=h,sections=sections)
  if axis=='y':mesh.apply_transform(trimesh.transformations.rotation_matrix(math.pi/2,[1,0,0]))
  if axis=='x':mesh.apply_transform(trimesh.transformations.rotation_matrix(math.pi/2,[0,1,0]))
  mesh.apply_translation(at);self.add(mesh,mat,name)
 def sphere(self,r,at,mat,name,sub=2):
  m=trimesh.creation.icosphere(subdivisions=sub,radius=r);m.apply_translation(at);self.add(m,mat,name)
 def ring(self,rin,rout,height,at,mat,name,axis='y',sections=36):
  m=trimesh.creation.annulus(r_min=rin,r_max=rout,height=height,sections=sections)
  if axis=='y':m.apply_transform(trimesh.transformations.rotation_matrix(math.pi/2,[1,0,0]))
  if axis=='x':m.apply_transform(trimesh.transformations.rotation_matrix(math.pi/2,[0,1,0]))
  m.apply_translation(at);self.add(m,mat,name)
 def rod(self,a,b,r,mat,name,sections=12):
  a=np.array(a,float);b=np.array(b,float);v=b-a;d=np.linalg.norm(v)
  if d<1e-5:return
  m=trimesh.creation.cylinder(radius=r,height=d,sections=sections)
  m.apply_transform(trimesh.geometry.align_vectors([0,0,1],v/d));m.apply_translation((a+b)*.5)
  self.add(m,mat,name)
 def sweep(self,points,r,mat,name,segments=0,radial=12,corrugate=False,register=False):
  """Closed tube along smooth cubic Hermite interpolated polyline with stable endpoint tangents."""
  poly=np.asarray(points,float)
  if len(poly)<2:return
  if segments<=0:segments=max(12,(len(poly)-1)*14)
  # Uniform Catmull Rom, including clamped end tangents.
  curve=[]
  for q in range(len(poly)-1):
   p0=poly[q-1] if q else (2*poly[0]-poly[1]);p1=poly[q];p2=poly[q+1]
   p3=poly[q+2] if q+2<len(poly) else (2*poly[-1]-poly[-2]);
   count=max(5,segments//(len(poly)-1))
   for k in range(count):
    t=k/count
    curve.append(.5*((2*p1)+(-p0+p2)*t+(2*p0-5*p1+4*p2-p3)*t*t+(-p0+3*p1-3*p2+p3)*t*t*t))
  curve.append(poly[-1]);curve=np.array(curve)
  tangents=np.gradient(curve,axis=0);tangents/=np.maximum(1e-9,np.linalg.norm(tangents,axis=1,keepdims=True))
  frames=[]
  v=np.array([0.,1.,0.]) if abs(np.dot(tangents[0],[0,1,0]))<.90 else np.array([1.,0.,0.])
  n=np.cross(tangents[0],v);n/=max(1e-9,np.linalg.norm(n));
  for t in tangents:
   n-=t*np.dot(n,t);n/=max(1e-9,np.linalg.norm(n));binorm=np.cross(t,n)
   frames.append((n.copy(),binorm))
  vs=[];faces=[];N=len(curve)
  for i,(c,(u,v)) in enumerate(zip(curve,frames)):
   # Corrugation is surface geometry, not texture-only; small amplitude for rubber hoses.
   actual_r=r*(1.0+(0.038*math.sin(i*2*math.pi/4) if corrugate else 0))
   for j in range(radial):
    a=2*math.pi*j/radial;vs.append(c+actual_r*(u*math.cos(a)+v*math.sin(a)))
  vs.extend([curve[0],curve[-1]]);faces=[]
  for i in range(N-1):
   for j in range(radial):
    a=i*radial+j;b=i*radial+(j+1)%radial;c=(i+1)*radial+j;d=(i+1)*radial+(j+1)%radial
    faces.extend([[a,c,b],[b,c,d]])
  for j in range(radial):
   faces.append([N*radial,(j+1)%radial,j])
   faces.append([N*radial+1,(N-1)*radial+j,(N-1)*radial+(j+1)%radial])
  m=trimesh.Trimesh(vertices=np.asarray(vs),faces=faces,process=False);m.fix_normals()
  assert m.is_watertight,(name,'open curve')
  self.add(m,mat,name)
  if register:
   self.control_points.append({'mesh':name,'localPoints':[[round(float(x),5) for x in pt] for pt in poly],
    'radius':r,'corrugated':corrugate,
    'startTangent':np.around(tangents[0],5).tolist(),'endTangent':np.around(tangents[-1],5).tolist()})
 def connector(self,pos,axis='x',scale=1,kind='quick',name='connector'):
  x,y,z=pos;ax=axis
  self.cyl(.041*scale,.080*scale,pos,'cream',name+'_sealing_socket',axis=ax)
  self.cyl(.046*scale,.016*scale,([x+.023*scale,y,z] if ax=='x' else [x,y,z+.023*scale]),'cyan',name+'_cyan_snap_seal',axis=ax)
  self.cyl(.055*scale,.015*scale,([x-.017*scale,y,z] if ax=='x' else [x,y,z-.017*scale]),'steel',name+'_locking_collar',axis=ax)
  if kind=='threaded':
   for n in range(3):
    p=([x+(.03+n*.012)*scale,y,z] if ax=='x' else [x,y,z+(.03+n*.012)*scale])
    self.cyl(.047*scale,.004*scale,p,'steel',name+'_thread_'+str(n),axis=ax)

parser=argparse.ArgumentParser()
parser.add_argument('--root',type=Path,default=Path(__file__).resolve().parent)
ARGS=parser.parse_args()
ROOT=ARGS.root.resolve()
MODELS=ROOT/'assets/models';ASSETS=ROOT/'assets/irrigation';PROJECTS=ROOT/'projects'
for d in (MODELS,ASSETS,PROJECTS):d.mkdir(parents=True,exist_ok=True)

CAT=[];MAN=[]

def register(m,id,label,family,placement='floor',notes='',extra=None):
 scene=m.s;geom=list(scene.geometry.values())
 assert len(geom)>=2,(id,len(geom));assert all(g.is_watertight for g in geom),(id,'open mesh')
 if any(np.any(~np.isfinite(x.vertices)) for x in geom):raise ValueError(id)
 data=scene.export(file_type='glb');assert data[:4]==b'glTF' and int.from_bytes(data[8:12],'little')==len(data)
 dest=MODELS/(id+'.glb');dest.write_bytes(data)
 reopened=trimesh.load(dest,force='scene',process=False);assert len(reopened.geometry)==len(geom)
 dims=np.around(scene.extents,4).tolist();hash_=hashlib.sha256(data).hexdigest()
 entry={'id':id,'name':label,'category':f'Наводнување S7 · {family}','src':f'assets/models/{id}.glb',
  'dimensions':dims,'placement':placement,'source':'tools/b1/build-s7-irrigation.py / greenhouse REF-05 / I01–I06 brief',
  'approval':'OWNER GENERAL IRRIGATION CONCEPT; ACTUAL GLB OWNER VISUAL PASS PENDING',
  'dynamicHose':False,'splineReady':bool(m.control_points),'engineStateWrites':0,
  'notes':notes}
 if extra:entry.update(extra)
 CAT.append(entry);MAN.append({'id':id,'sha256':hash_,'bytes':len(data),'meshCount':len(geom),
   'triangles':sum(len(x.faces) for x in geom),'dimensions':dims,
   'controlPoints':m.control_points,'ownerActualGlbPass':False})
 return id

# Shared machine details

def engine_base(m,width=1.2,height=.10,depth=.6):
 m.box([width,height,depth],[0,height/2,0],'deep_sage','reinforced_industrial_base');
 for x in [-width*.40,width*.40]:
  for z in [-depth*.34,depth*.34]:m.box([.09,.07,.09],[x,height+.025,z],'chrome','mounting_foot')

def level_strip(m,x,y,z,h):
 m.box([.066,h,.034],[x,y,z],'dark','sealed_level_strip_frame');
 m.box([.034,h*.85,.040],[x,y,z+.006],'glass','translucent_level_strip');
 for s in [-.30,0,.30]:m.box([.038,.012,.046],[x,y+h*s,z+.015],'cyan','level_readout')

def tank(radius=0.44,height=1.6,kind='large'):
 m=Mod();engine_base(m,2*radius+.36,.08,2*radius+.3)
 m.cyl(radius,height,[0,height/2+.15,0],'cream','sealed_cleanwater_tank_shell',sections=64)
 for dy in [.16,height*.65+.15,height+.14]:m.cyl(radius*1.035,.038,[0,dy,0],'sage','reinforcement_ring',sections=64)
 m.cyl(.17,.09,[0,height+.20,0],'chrome','top_cleanable_fill_fitting')
 m.cyl(.105,.038,[0,height+.26,0],'dark','fill_seal');m.cyl(.085,.012,[0,height+.286,0],'cyan','top_status_emitter')
 level_strip(m,radius*.45,height*.52,radius*.83,height*.58)
 m.cyl(.085,.17,[radius+.075,.37,0],'chrome','water_outlet',axis='x')
 m.cyl(.083,.16,[-radius-.06,.37,0],'chrome','water_return',axis='x')
 m.connector([radius+.13,.37,0],scale=.9,name='cleanwater_outlet')
 m.cyl(.07,.12,[0,.16,radius+.05],'chrome','drain_valve',axis='z')
 for yy in [height*.30+.12,height*.75+.12]:
  m.box([.07,.09,.16],[radius*.95,yy,.18],'sage','inspection_rail')
 return m

def manifold(count=4):
 m=Mod();engine_base(m,1.25,.095,.37)
 m.rod([-.49,.28,0],[.49,.28,0],.055,'chrome','distribution_header')
 for i in range(count):
  x=(i-(count-1)/2)*(.84/max(count-1,1));m.rod([x,.28,0],[x,.12,.16],.025,'chrome',f'outlet_branch_{i}')
  m.connector([x,.12,.17],axis='z',scale=.72,name='hose_outlet_'+str(i))
  m.box([.04,.07,.028],[x,.36,-.02],'cyan','outlet_active_indicator')
 m.box([.45,.23,.13],[0,.52,-.02],'cream','header_control_chassis')
 m.box([.34,.09,.007],[0,.54,.052],'screen','status_display');m.box([.26,.014,.012],[0,.54,.057],'cyan','status_led')
 return m

def pump(scale=1,kind='pump'):
 m=Mod();engine_base(m,1.0*scale,.09*scale,.48*scale)
 m.cyl(.145*scale,.48*scale,[0,.29*scale,0],'deep_sage','electric_motor',axis='x',sections=32)
 for k in range(13):
  x=(-.21+k*.035)*scale
  m.cyl(.153*scale,.008*scale,[x,.29*scale,0],'dark','cooling_fin_'+str(k),axis='x',sections=28)
 m.cyl(.18*scale,.16*scale,[-.33*scale,.29*scale,0],'chrome','water_pump_volute',axis='x',sections=40)
 m.cyl(.102*scale,.1*scale,[-.44*scale,.29*scale,0],'steel','input_flange',axis='x')
 m.cyl(.096*scale,.13*scale,[-.31*scale,.48*scale,0],'chrome','upper_output_flange')
 m.cyl(.064*scale,.02*scale,[.37*scale,.29*scale,0],'sage','motor_end_cap',axis='x')
 m.box([.25*scale,.1*scale,.25*scale],[.18*scale,.49*scale,0],'cream','pump_terminal_box')
 m.box([.19*scale,.025*scale,.095*scale],[.18*scale,.545*scale,.08*scale],'cyan','power_status_led')
 return m

def filter_unit(kind='double'):
 m=Mod();n={'single':1,'double':2,'triple':3,'compact':1}.get(kind,2)
 engine_base(m,.45*n+.42,.10,.49)
 m.box([.42*n,.55,.19],[0,.6,-.08],'cream','filtration_backplate')
 m.box([.43*n,.085,.23],[0,.92,-.08],'sage','water_manifold_top')
 for j in range(n):
  x=(j-(n-1)/2)*.43
  m.cyl(.115,.53,[x,.43,.04],'glass',f'filter_translucent_canister_{j}',sections=36)
  m.cyl(.090,.42,[x,.42,.04],'filter',f'white_filter_cartridge_{j}',sections=28)
  m.cyl(.116,.06,[x,.72,.04],'chrome',f'steel_filter_cap_{j}')
  m.cyl(.116,.03,[x,.17,.04],'deep_sage',f'filter_bottom_lock_{j}')
  for k in range(3):m.cyl(.094,.007,[x,.29+.11*k,.04],'sage',f'cartridge_retain_ring_{j}_{k}')
 m.rod([-(n*.43)/2,.94,0],[(n*.43)/2,.94,0],.03,'chrome','cleanwater_trunk')
 m.box([.18,.12,.12],[0,1.02,-.07],'dark','filter_status_controller')
 m.box([.08,.016,.014],[0,1.08,.005],'cyan','filter_status_led')
 return m

def pressure_gauge():
 m=Mod();m.box([.14,.15,.14],[0,.09,0],'sage','gauge_sensor_body')
 m.cyl(.105,.05,[0,.30,0],'chrome','dial_housing',axis='z')
 m.cyl(.087,.016,[0,.30,.031],'filter','dial_back',axis='z')
 m.rod([0,.30,.047],[.051,.332,.049],.003,'red','red_pressure_needle')
 for k in range(9):
  a=(k/8*1.50-.75)*math.pi
  m.sphere(.004,[.073*math.sin(a),.30+.073*math.cos(a),.049],'dark','dial_marker')
 m.rod([0,.09,0],[0,.018,0],.04,'chrome','lower_coupling')
 m.box([.04,.025,.02],[0,.05,.073],'cyan','sensor_status')
 return m

for id,label,obj in [
 ('s7-i01-reservoir-primary','I01 · Главен чистоводен резервоар',tank(.44,1.67)),
 ('s7-i01-reservoir-buffer','I01 · Компактен бафер резервоар',tank(.30,1.09)),
 ('s7-i01-reservoir-lowprofile','I01 · Низок технички резервоар',tank(.36,.68)),
 ('s7-i01-feed-distributor-4','I01 · Главен воден разделувач за 4 леи',manifold(4)),
 ]:register(obj,id,label,'I01','floor','Visual-only; do not invent water volume, actual consumption, or plant slots.')

for id,label,obj in [
 ('s7-i02-pump-industrial','I02 · Главна пречистена водна пумпа',pump(1.05)),
 ('s7-i02-pump-compact','I02 · Компактна водна пумпа',pump(.73)),
 ('s7-i02-filter-single','I02 · Единечен проѕирен филтер',filter_unit('single')),
 ('s7-i02-filter-double','I02 · Двоен филтерски систем',filter_unit('double')),
 ('s7-i02-filter-triple','I02 · Троен филтерски систем',filter_unit('triple')),
 ('s7-i02-distribution-four-outlets','I02 · Филтерска дистрибуција четири излези',manifold(4)),
 ('s7-i02-pressure-gauge','I02 · Механички манометар',pressure_gauge()),
 ]:register(obj,id,label,'I02','floor','Separate filter cartridges are visible geometry; pump controls require engine binding.')

# I03 real bendable geometry. Fixed GLB shapes are genuine curved tubing and
# provide control point metadata; live free bending requires a future spline editor.
def hose(pts,rad=.035,kind='flex',ends=True):
 m=Mod();m.sweep(pts,rad,'hose' if kind!='steel' else 'steel','actual_curved_hose_swept_3d',radial=16,corrugate=kind!='steel',register=True)
 if ends:
  for i,pt in enumerate((pts[0],pts[-1])):
   q=np.asarray(pt,float);direction=np.asarray(pts[1],float)-np.asarray(pts[0],float) if i==0 else np.asarray(pts[-1],float)-np.asarray(pts[-2],float)
   if abs(direction[0])>abs(direction[2]):axis='x'
   else:axis='z'
   m.connector(q.tolist(),axis=axis,scale=.85,name=f'end_{i}')
 for k,t in enumerate(np.linspace(.15,.85,3)):
  if kind=='flex' and len(pts)==2:
   v=(1-t)*np.asarray(pts[0])+t*np.asarray(pts[-1]);m.cyl(rad*1.20,.012,v,'dark',f'rib_banding_{k}',axis='x' if abs(pts[-1][0]-pts[0][0])>abs(pts[-1][2]-pts[0][2]) else 'z')
 return m

hose_items=[]
for length in [.25,.5,1.,2.]:
 suffix=str(length).replace('.','p')
 hose_items.append((f's7-i03-hose-straight-{suffix}m',f'I03 · Флексибилно црево {length:g} m',[[0,.16,0],[length,.16,0]]))
for degree in [15,30,45,60,90]:
 a=math.radians(degree);p0=[0,.16,0];p1=[.29,.16,.05];p2=[.29+.28*math.cos(a/2),.16,.05+.28*math.sin(a/2)];p3=[p2[0]+.30*math.cos(a),.16,p2[2]+.30*math.sin(a)]
 hose_items.append((f's7-i03-hose-bend-{degree}',f'I03 · Флексибилен свиок {degree}°',[p0,p1,p2,p3]))
hose_items.extend([
 ('s7-i03-hose-soft-arch-0p5','I03 · Мек лак 0.5 m',[[0,.12,0],[.12,.35,0],[.35,.45,0],[.52,.12,0]]),
 ('s7-i03-hose-soft-arch-1m','I03 · Мек лак 1 m',[[0,.12,0],[.25,.62,0],[.75,.62,0],[1,.12,0]]),
 ('s7-i03-hose-s-bend','I03 · S-кривина',[[0,.18,0],[.27,.18,.22],[.55,.18,-.22],[.86,.18,0]]),
 ('s7-i03-hose-u-bend','I03 · U-кривина',[[0,.15,0],[.16,.15,.12],[.26,.15,.42],[.43,.15,.46],[.58,.15,.20]]),
 ('s7-i03-hose-riser','I03 · Вертикален флексибилен подигнувач',[[0,.14,0],[.22,.22,0],[.33,.46,0],[.35,.83,0]]),
 ('s7-i03-hose-natural-sag','I03 · Природно провиснато црево',[[0,.59,0],[.27,.35,0],[.64,.34,0],[.97,.60,0]]),
 ('s7-i03-hose-offset-step','I03 · Мек степенест премин',[[0,.12,0],[.18,.12,.07],[.38,.38,.10],[.62,.47,.10],[.88,.47,.10]]),
 ('s7-i03-hose-loop','I03 · Флексибилна кружна обиколка',[[0,.14,0],[.08,.20,.16],[.30,.45,.25],[.55,.55,.04],[.50,.31,-.23],[.22,.16,-.23],[0,.14,0]]),
])
for id,label,pts in hose_items:register(hose(pts),id,label,'I03','floor','FIXED CURVED GLB; control points in manifest for future spline-driven editing. Not real-time bendable yet.')

# I04 fittings and valves. Cylinders/rods are actual round watertight parts.
def fitting(kind):
 m=Mod();length=.27
 if kind in ('coupler','quick','threaded','check','cap'):
  m.cyl(.053,length,[0,.15,0],'steel','coupling_barrel',axis='x')
  m.connector([-.13,.15,0],kind='threaded' if kind=='threaded' else 'quick',name='left_interface')
  if kind!='cap':m.connector([.13,.15,0],name='right_interface')
  else:m.cyl(.067,.032,[.15,.15,0],'cream','watertight_end_cap',axis='x')
  if kind=='check':
   m.box([.105,.095,.090],[0,.15,0],'sage','oneway_check_valve_body')
   m.box([.055,.019,.012],[0,.20,.045],'cyan','flow_direction_indicator')
  if kind=='quick':m.box([.07,.05,.095],[0,.15,0],'cyan','quick_release_thumb_latch')
 elif kind in ('elbow','tee','y','cross'):
  if kind=='elbow':
   pts=[[0,.14,0],[.13,.14,0],[.22,.14,.09],[.22,.14,.22]]
  else:
   pts=[[-.25,.14,0],[0,.14,0],[.25,.14,0]]
  m.sweep(pts,.046,'deep_sage','rigid_splitter_trunk',radial=16)
  m.connector(pts[0],name='input');m.connector(pts[-1],name='output')
  if kind in ('tee','y','cross'):
   branches=[[[0,.14,0],[0,.14,.24]]] if kind=='tee' else ([[[0,.14,0],[.16,.14,.23]]] if kind=='y' else [[[0,.14,0],[0,.14,.24]],[[0,.14,0],[0,.14,-.24]]])
   for j,br in enumerate(branches):
    m.sweep(br,.045,'steel','branch_'+str(j),radial=16)
    m.connector(br[-1],axis='z',name='branch_connector_'+str(j))
 elif kind in ('ball','electric'):
  m.cyl(.075,.38,[0,.15,0],'steel','valve_pressure_body',axis='x')
  for xx in [-.19,.19]:m.connector([xx,.15,0],name='valve_side')
  m.sphere(.102,[0,.16,0],'sage','valve_rotor')
  m.cyl(.035,.16,[0,.33,0],'chrome','valve_vertical_spindle')
  if kind=='ball':
   m.box([.27,.034,.07],[0,.43,0],'cyan','manual_valve_handle')
  else:
   m.box([.20,.22,.19],[0,.48,0],'cream','electrically_actuated_motor')
   m.box([.12,.045,.012],[0,.51,.10],'cyan','motor_live_status')
 elif kind=='clamp':
  m.ring(.042,.063,.025,[0,.15,0],'steel','hose_clamp_ring',axis='x')
  m.box([.09,.055,.052],[0,.21,0],'chrome','lock_buckle');m.box([.04,.018,.07],[0,.25,0],'sage','tightening_head')
 else:raise ValueError(kind)
 return m
fitting_rows=[('coupler','Стандардна спојка'),('quick','Брза спојка со заклучување'),('threaded','Навојна спојка'),('elbow','Мек 90° аголен адаптер'),('tee','Т-разделник'),('y','Y-разделник'),('cross','Четирикрак разделник'),('ball','Рачен вентил'),('electric','Електричен вентил'),('check','Неповратен вентил'),('cap','Завршен капак'),('clamp','Механичка стега')]
for kind,label in fitting_rows:register(fitting(kind),f's7-i04-{kind}',f'I04 · {label}','I04','floor','Modular interface; snapping in Builder requires a future approved editor feature.')

# I05 drip irrigation physical hardware, NOT sprinklers.
def dripline(length=1,n=5,branches=False):
 m=hose([[0,.15,0],[length,.15,0]],.024,ends=True)
 for k in range(n):
  x=length*(k+.5)/n;m.cyl(.035,.08,[x,.09,0],'deep_sage',f'drip_junction_{k}')
  m.cyl(.022,.043,[x,.055,0],'cyan',f'drip_emitter_{k}')
  m.sphere(.010,[x,.029,0],'water',f'real_drip_visual_no_simulation_{k}',sub=1)
 if branches:
  for x in (length*.28,length*.73):
   m.sweep([[x,.15,0],[x,.15,.17],[x,.12,.37]],.018,'rubber',f'branch_tube_{x}',register=True)
 return m

def dripper(style='simple'):
 m=Mod();m.cyl(.039,.12,[0,.12,0],'deep_sage','dripper_body')
 m.cyl(.048,.03,[0,.19,0],'cream','upper_dripper_collar')
 m.cyl(.045,.014,[0,.21,0],'cyan','flow_cap')
 m.cyl(.015,.13,[0,.02,0],'dark','soil_stake')
 if style=='adjustable':
  for k in range(8):
   a=2*math.pi*k/8;m.box([.009,.036,.020],[.035*math.cos(a),.21,.035*math.sin(a)],'sage','adjustment_ridge')
 if style=='inline':m.cyl(.025,.19,[0,.15,0],'chrome','inline_barrel',axis='x')
 return m

def drip_spider(branches):
 m=Mod();m.box([.22,.13,.15],[0,.22,0],'cream','multi_outlet_cap')
 m.cyl(.065,.12,[0,.16,0],'steel','main_feed_plug')
 for i in range(branches):
  a=(i-(branches-1)/2)*.50
  ex=math.sin(a)*.48;ez=.43*math.cos(a)
  m.sweep([[0,.22,.02],[ex*.25,.28,ez*.50],[ex,.15,ez]],.015,'rubber','spider_drip_tube_'+str(i),register=True)
  m.cyl(.017,.10,[ex,.09,ez],'deep_sage','terminal_emitter_'+str(i))
 return m

for id,label,obj in [
 ('s7-i05-dripline-0p5m','I05 · Половина метар линија со 3 капалки',dripline(.5,3)),
 ('s7-i05-dripline-1m','I05 · 1 m линија со 5 капалки',dripline(1,5)),
 ('s7-i05-dripline-2m','I05 · 2 m линија со 10 капалки',dripline(2,10)),
 ('s7-i05-dripline-1m-branches','I05 · Разгранета линија со две цевчиња',dripline(1,5,True)),
 ('s7-i05-dripper-inline','I05 · Едноставна inline капалка',dripper('inline')),
 ('s7-i05-dripper-adjustable','I05 · Прилагодлива капалка',dripper('adjustable')),
 ('s7-i05-dripper-stake','I05 · Земјена капалка со колче',dripper('simple')),
 ('s7-i05-drip-spider-3','I05 · Мек троен капиларен разделувач',drip_spider(3)),
 ('s7-i05-drip-spider-5','I05 · Мек петкратен капиларен разделувач',drip_spider(5)),
 ]:register(obj,id,label,'I05','floor','Real drip-delivery visual; water droplet mesh is decorative until engine-bound receipt.')

# I06 diagnostics & repair, not functioning sensors before engine binding.
def sensor(kind):
 m=Mod();m.box([.22,.23,.13],[0,.28,0],'cream','sealed_field_sensor')
 m.box([.18,.12,.018],[0,.29,.071],'screen','status_readout')
 m.box([.13,.015,.023],[0,.32,.084],'cyan','data_display_glow')
 m.box([.06,.035,.08],[0,.18,.02],'sage','diagnostic_select_button')
 if kind=='pressure':m.cyl(.052,.18,[0,.06,0],'chrome','pressure_sensor_tip')
 if kind=='flow':
  m.cyl(.05,.36,[0,.07,0],'steel','inline_flow_body',axis='x')
  for x in [-.17,.17]:m.connector([x,.07,0],name='flow_connector')
 if kind=='leak':m.cyl(.07,.024,[0,.02,0],'deep_sage','leak_ground_probe')
 m.box([.06,.012,.018],[0,.40,.01],'green','power_led')
 return m

def repair_tool():
 m=Mod();m.box([.63,.31,.33],[0,.18,0],'deep_sage','portable_service_toolcase')
 m.box([.58,.024,.29],[0,.36,0],'cream','toolkit_snap_lid')
 m.box([.22,.075,.045],[0,.42,0],'sage','carry_handle')
 for i in range(3):
  x=(i-1)*.19;m.box([.11,.025,.11],[x,.375,.075],'chrome',f'tool_steel_storage_badge_{i}')
 m.box([.12,.05,.012],[0,.27,.17],'cyan','service_live_indicator')
 return m

def spare_cartridge():
 m=Mod();m.cyl(.105,.42,[0,.27,0],'filter','replacement_filter_media')
 for h in [.08,.47]:m.cyl(.114,.044,[0,h,0],'dark','sealed_cartridge_cap')
 for i in range(3):m.cyl(.108,.015,[0,.16+i*.10,0],'chrome','cartridge_ring')
 return m

def hose_coil():
 m=Mod();pts=[]
 for k in range(100):
  a=math.pi*2*k/14
  pts.append([.31*math.cos(a),.10+.34*(k/100),.31*math.sin(a)])
 m.sweep(pts,.027,'hose','service_replacement_coiled_flexible_hose',segments=180,register=True,corrugate=True)
 m.connector(pts[0],axis='z',scale=.75,name='left_end')
 m.connector(pts[-1],axis='z',scale=.75,name='right_end')
 for k in range(3):m.box([.08,.17,.05],[.25*math.cos(k*2.1),.23,.25*math.sin(k*2.1)],'sage','hose_carry_strap')
 return m

def tool_wrench():
 m=Mod();m.box([.045,.39,.025],[0,.24,0],'steel','steel_wrench_handle')
 m.ring(.046,.066,.026,[0,.48,0],'chrome','head_open_service_ring')
 m.box([.055,.065,.038],[.05,.49,0],'dark','wrench_jaw')
 m.box([.07,.04,.027],[0,.095,0],'sage','anti_slip_handle')
 return m

for id,label,obj in [
 ('s7-i06-sensor-pressure','I06 · Дигитален сензор за притисок',sensor('pressure')),
 ('s7-i06-sensor-flow','I06 · Сензор за проток во црево',sensor('flow')),
 ('s7-i06-sensor-leak','I06 · Сензор за истекување',sensor('leak')),
 ('s7-i06-spare-hose-coil','I06 · Резервно завиткано флексибилно црево',hose_coil()),
 ('s7-i06-toolcase','I06 · Алат за техничар и поправка',repair_tool()),
 ('s7-i06-replacement-cartridge','I06 · Замeнлив филтерски вметок',spare_cartridge()),
 ('s7-i06-service-wrench','I06 · Сервисен клуч',tool_wrench()),
 ]:register(obj,id,label,'I06','floor','Diagnostic visuals are not engine commands; failure states only when approved.')

def controller(compact=False):
 m=Mod();w=.38 if compact else .52;h=.32 if compact else .45
 m.box([w,h,.095],[0,.32,0],'deep_sage','field_control_reinforced_back_shell')
 m.box([w*.91,h*.89,.026],[0,.32,.056],'cream','control_panel_cream_cover')
 m.box([w*.67,h*.26,.012],[0,.43,.075],'screen','display_dark_glass')
 for i in range(4):
  x=(i-1.5)*w*.19
  m.box([w*.13,.048,.014],[x,.345,.079],'cyan','zone_status_led_'+str(i))
  m.cyl(.022,.026,[x,.245,.085],'sage','bed_zone_pushbutton_'+str(i),axis='z')
  m.box([.032,.013,.020],[x,.195,.077],'dark','label_slot_'+str(i))
 for i in range(4):
  x=(i-1.5)*w*.19;m.cyl(.025,.11,[x,.10,0],'chrome','hose_output_4_zones_'+str(i))
 for x in (-w*.44,w*.44):
  for y in (.32-h*.40,.32+h*.40):m.cyl(.008,.010,[x,y,.075],'chrome','tamper_screw',axis='z')
 return m
for id,label,obj in [
 ('s7-c-irr01-bed-control-4zone','C-IRR01 · Четириканален контролен панел',controller(False)),
 ('s7-c-irr01-bed-control-compact','C-IRR01 · Компактен контролер за една леа',controller(True)),
 ]:register(obj,id,label,'C-IRR01','wall','READ-ONLY concept; disabled controls until validated engine authority actions exist.')

# Persistent scene JSON: exactly 4 actual terrestrial beds, not a fifth.
project_files=[]
def project(name,title,ids,cols=5,roomW=None):
 ids=list(ids);rows=math.ceil(len(ids)/cols);spacing=3.4
 roomW=roomW or (cols*spacing+4)
 depth=rows*spacing+4
 instances=[]
 for i,id in enumerate(ids):
  row=i//cols;col=i%cols;x=(col-(cols-1)/2)*spacing;z=(row-(rows-1)/2)*spacing
  p=[round(x,3),0,round(z,3)]
  instances.append({'id':f'irrigation-{i:03d}','assetId':id,'label':CAT_BY_ID[id]['name'],
    'position':p,'rotationY':0,'scale':[1,1,1],'layer':'props','locked':False,'visible':True,
    'binding':'','note':'DESIGN MODEL ONLY, no live pump, water, sensor, or bed control action'})
 d={'schemaVersion':1,'projectId':name.replace('.json',''),'name':title,
    'description':'Genuine GLB irrigation geometry only. Flexible static hoses with spline-source points. No gameplay writes.',
    'room':{'width':roomW,'depth':depth,'height':5.0,'gridSize':.1,'showWalls':False,
    'floorColor':'#34454a','wallColor':'#485b59'},'instances':instances}
 (PROJECTS/name).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf8');project_files.append(name)

CAT_BY_ID={a['id']:a for a in CAT}
ALLIDS=[a['id'] for a in CAT]
for g in ['I01','I02','I03','I04','I05','I06','C-IRR01']:
 selection=[a['id'] for a in CAT if a['category'].endswith(g)]
 project('trialum-s7-irrigation-'+g.lower()+'-gallery.json','S7 · Наводнување '+g+' · '+str(len(selection))+' реални GLB',selection,cols=4)
project('trialum-s7-irrigation-all-glbs.json','S7.8-D · ЦЕЛАТА група наводнување · '+str(len(CAT))+' вистински GLB',ALLIDS,cols=7)
# Single physical-control demonstration only, 4 beds; not a stateful irrigation system.
project('trialum-s7-irrigation-four-bed-panels.json','S7 · G02-G05 · четири технички панели · визуелен преглед',
        ['s7-c-irr01-bed-control-compact']*4,cols=4)
for i,name in enumerate(project_files):pass

MAN_DOC={'schemaVersion':1,'phase':'S7.8-D','familyCount':7,'modelCount':len(CAT),
 'ownerActualGlbPass':False,'authoritativeGameplayActions':0,
 'splineEditingBuiltInBuilder':False,'dynamicTubeSimulationPresent':False,
 'curvedTubeGeometry':True,'modelSha256':MAN,'reviewScenes':project_files,
 'allowedRealBedIds':['G02','G03','G04','G05'],
 'warning':'owner concept render ≠ perfect GLB replication; owner GLB review pending'}
(ASSETS/'s7-irrigation-manifest.json').write_text(json.dumps(MAN_DOC,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
(ASSETS/'s7-irrigation-catalog-additions.json').write_text(json.dumps(CAT,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps({'modelCount':len(CAT),'families':{g:sum(1 for a in CAT if a['category'].endswith(g)) for g in ['I01','I02','I03','I04','I05','I06','C-IRR01']},'scenes':project_files,'bytes':sum(x['bytes'] for x in MAN)},ensure_ascii=False,indent=2))

if __name__=='__main__':pass
