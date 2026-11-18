#!/usr/bin/env python3
"""Trialum S7 greenhouse: real, individually selectable eight lighting families.
Deterministic geometry only; all emissive meshes are *visual* lights. The game
must add bounded real-time actual lighting later, under separate authorization.
Requires trimesh 4.11.1, numpy 2.3.5. No network and no game state changes.
"""
from __future__ import annotations
import math, hashlib, json, argparse
from pathlib import Path
import numpy as np
import trimesh
from trimesh.visual.material import PBRMaterial
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'assets/models'
ASSETS=ROOT/'assets/lighting'
PROJECTS=ROOT/'projects'
for d in (OUT,ASSETS,PROJECTS): d.mkdir(parents=True,exist_ok=True)

COLORS={
 'cream':([218,213,191,255],.68,.56),
 'sage':([122,147,132,255],.65,.49),
 'silver':([183,200,203,255],.96,.23),
 'chrome':([216,227,228,255],1.,.13),
 'dark':([34,47,51,255],.78,.49),
 'black':([22,27,32,255],.58,.75),
 'rubber':([48,54,59,255],0.,.86),
 'glass':([168,226,224,255],0.,.30),
 'warm':([253,237,190,255],0.,.43),
 'cyan':([72,234,228,255],0.,.28),
 'aqua':([134,246,220,255],0.,.24),
}
MATERIALS={}
for k,(rgba,metal,rough) in COLORS.items():
 em=[0.0,0.0,0.0]
 if k in ('cyan','aqua'):em=[.08,1.,.93]
 if k=='warm':em=[1.,.75,.38]
 MATERIALS[k]=PBRMaterial(name='S7_LIGHT_'+k,baseColorFactor=rgba,
     metallicFactor=metal,roughnessFactor=rough,emissiveFactor=em,
     doubleSided=False)

class Model:
 def __init__(self):self.scene=trimesh.Scene();self.n=0
 def add(self,mesh,mat,name):
  mesh.visual.material=MATERIALS[mat]
  self.scene.add_geometry(mesh,geom_name=f'{self.n:03d}_{name}',node_name=f'{self.n:03d}_{name}')
  self.n+=1
 def box(self,w,h,d,pt,mat,name):
  mesh=trimesh.creation.box(extents=[w,h,d]);mesh.apply_translation(pt);self.add(mesh,mat,name)
 def cyl(self,r,h,pt,mat,name,sections=32,axis='y'):
  mesh=trimesh.creation.cylinder(radius=r,height=h,sections=sections)
  if axis=='y':mesh.apply_transform(trimesh.transformations.rotation_matrix(math.pi/2,[1,0,0]))
  if axis=='x':mesh.apply_transform(trimesh.transformations.rotation_matrix(math.pi/2,[0,1,0]))
  mesh.apply_translation(pt);self.add(mesh,mat,name)
 def ring(self,rin,rout,h,pt,mat,name,sections=64):
  mesh=trimesh.creation.annulus(r_min=rin,r_max=rout,height=h,sections=sections)
  mesh.apply_transform(trimesh.transformations.rotation_matrix(math.pi/2,[1,0,0]))
  mesh.apply_translation(pt);self.add(mesh,mat,name)
 def rod(self,a,b,r,mat,name,sections=12):
  a=np.asarray(a,float);b=np.asarray(b,float);d=b-a;length=float(np.linalg.norm(d))
  if length<1e-7:return
  mesh=trimesh.creation.cylinder(radius=r,height=length,sections=sections)
  mesh.apply_transform(trimesh.geometry.align_vectors([0,0,1],d/length))
  mesh.apply_translation((a+b)*.5)
  self.add(mesh,mat,name)
 def arc_strip(self, length=1.,radius=8.27,width=.064,thick=.028, mat='sage', name='arc', n=32):
  # A short, local, repeatable strip along the actual G01-curvature, with pivot centered.
  theta0=-length/(2*radius)
  vs=[];uv=[]
  for h in (0.,thick):
   for i in range(n+1):
    a=theta0+i/n*length/radius
    for rad in (radius-width/2,radius+width/2):
     vs.append([radius*math.sin(a)*rad/radius,h,rad*math.cos(a)-radius])
     uv.append([i/n,h/max(1e-8,thick)])
  vs=np.array(vs);faces=[]
  idx=lambda y,i,k:y*(n+1)*2+i*2+k
  for i in range(n):
   for yy in (0,1):
    v0=idx(yy,i,0);v1=idx(yy,i+1,0);v2=idx(yy,i,1);v3=idx(yy,i+1,1)
    faces.extend(((v0,v1,v2),(v1,v3,v2)) if yy==1 else ((v0,v2,v1),(v1,v2,v3)))
   for k in (0,1):
    aa,bb,cc,dd=idx(0,i,k),idx(0,i+1,k),idx(1,i,k),idx(1,i+1,k)
    faces.extend(((aa,cc,bb),(bb,cc,dd)) if k==0 else ((aa,bb,cc),(bb,dd,cc)))
  for i in (0,n):
   a,b,c,d=idx(0,i,0),idx(0,i,1),idx(1,i,0),idx(1,i,1)
   faces.extend(((a,b,c),(b,d,c)) if i==n else ((a,c,b),(b,c,d)))
  mesh=trimesh.Trimesh(vertices=vs,faces=np.array(faces),process=False)
  mesh.fix_normals()
  assert mesh.is_watertight, 'arc not watertight'
  self.add(mesh,mat,name)

CATALOG=[]
MANIFEST=[]

def record(id,name,group,kind,model,placement,notes=''):
 scene=model.scene
 assert len(scene.geometry)>0,(id,'empty')
 assert all(x.is_watertight and x.volume>0 for x in scene.geometry.values()),(id,'not closed 3D')
 # Lights can be composed of pieces, but they may not be a single plane/texture illusion.
 mesh_count=len(scene.geometry)
 triangle_count=sum(len(x.faces) for x in scene.geometry.values())
 assert triangle_count>=48 and mesh_count>=2,(id,triangle_count,mesh_count)
 data=scene.export(file_type='glb')
 assert data[:4]==b'glTF' and int.from_bytes(data[4:8],'little')==2
 assert int.from_bytes(data[8:12],'little')==len(data)
 target=OUT/(id+'.glb');target.write_bytes(data)
 mesh_names=sorted(scene.geometry.keys())
 raw=trimesh.load(target,force='scene')
 assert len(raw.geometry)>0 and sum(len(x.faces) for x in raw.geometry.values())==triangle_count
 bounds=scene.bounds.tolist()
 # Real open-source glTF emissive material is deliberately NOT a Three.js PointLight.
 has_emissive=any('diffus' in x.lower() or 'glow' in x.lower() or 'emitter' in x.lower() or 'led' in x.lower() for x in mesh_names)
 assert has_emissive,(id,'missing emission surface')
 cat={'id':id,'name':name,'category':f'Светилки S7 · {group}',
 'src':f'assets/models/{id}.glb','dimensions':[round(q,4) for q in (scene.extents[0],scene.extents[1],scene.extents[2])],
 'placement':placement,'source':'tools/b1/build-s7-lights.py / S7 visual brief REF-05',
 'materialFinish':'cream/sage/chrome with cyan + warm LED diffusers',
 'approval':'OWNER APPROVAL OF GENERAL S7 LIGHT DESIGN; PHYSICAL MODEL VISUAL/DEVICE PASS PENDING',
 'renderOnly':True,'gameplayWrites':0,'realDynamicLightsIncluded':0,'lightFamily':group,
 'emissiveGeometry':True,'notes':notes}
 CATALOG.append(cat)
 MANIFEST.append({'id':id,'file':id+'.glb','sha256':hashlib.sha256(data).hexdigest(),
                  'bytes':len(data),'meshes':mesh_count,'triangles':triangle_count,
                  'bounds':[[round(float(v),5) for v in row] for row in bounds],
                  'hasEmissiveMesh':has_emissive,'gameplayWrites':0,'visualOwnerGlbPass':False})
 return id

def fixture_corner(m,x,z):
 m.box(.068,.035,.08,(x,.0175,z),'cream','frame_corner_cap')
 m.box(.038,.028,.06,(x,.017,z),'sage','sage_lock')

def led_strip(length,variant):
 m=Model()
 if variant=='curve':
  m.arc_strip(length=length,width=.095,thick=.025,mat='sage',name='waterproof_arc_housing')
  m.arc_strip(length=length,width=.049,thick=.029,mat='cyan',name='cyan_led_arc_diffuser')
  m.arc_strip(length=length,width=.013,thick=.034,mat='glass',name='transparent_arc_lens')
 elif variant=='corner':
  for i,(x,z,w,d) in enumerate(((.50,0,1.0,.087),(0,.50,.087,1.0))):
   m.box(w,.028,d,(x,.014,z),'sage',f'L_corner_housing_{i}')
   m.box(w*.94,.011,d*.53,(x,.030,z),'cyan',f'waterproof_corner_emitter_{i}')
   m.box(w*.92,.004,d*.48,(x,.038,z),'glass',f'corner_diffuser_{i}')
  m.box(.11,.04,.11,(0,.020,0),'chrome','joint_cap')
 else:
  m.box(length,.029,.092,(0,.0145,0),'sage','waterproof_aluminium_housing')
  m.box(length*.94,.010,.046,(0,.032,0),'cyan','continuous_cyan_led_emitter')
  m.box(length*.94,.004,.051,(0,.039,0),'glass','optical_diffuser')
  for x in (-length*.44,length*.44):
   m.box(.035,.009,.065,(x,.036,0),'silver','retainer_bracket')
 return m
for id,label,length,variant in [
 ('s7-lf1-perimeter-straight-1m','L-F1 · Водоотпорна LED лента 1 m',1.,'straight'),
 ('s7-lf1-perimeter-straight-half','L-F1 · Водоотпорна LED лента 0.5 m',.5,'straight'),
 ('s7-lf1-perimeter-corner','L-F1 · LED лента под агол 90°',1.,'corner'),
 ('s7-lf1-perimeter-g01-curve','L-F1 · LED краток закривен сегмент G01 1 m',1.,'curve')]:
 record(id,label,'L-F1',variant,led_strip(length,variant),'floor','Visual segment only: all pool arcs must preserve water opening and bridges.')

def floor_puck(radius,kind):
 m=Model();m.cyl(radius,.019,(0,.010,0),'dark','embedded_lowprofile_chassis')
 m.ring(radius*.70,radius*.97,.008,(0,.022,0),'chrome','annular_chrome_recess')
 m.cyl(radius*.68,.004,(0,.027,0),'warm' if kind=='warm' else 'cyan','top_emitter_glow')
 m.ring(radius*.60,radius*.70,.003,(0,.030,0),'glass','diffuser_rim')
 for a in (0,math.pi/2,math.pi,3*math.pi/2):
  x=math.cos(a)*radius*.80;z=math.sin(a)*radius*.80
  m.cyl(.007,.003,(x,.028,z),'silver','flush_mount_screw',sections=10)
 return m
for id,label,r,kind in [
 ('s7-lf2-recessed-puck-small','L-F2 · Мала кружна подна 150 mm',.075,'cyan'),
 ('s7-lf2-recessed-puck-medium','L-F2 · Кружна подна 230 mm',.115,'cyan'),
 ('s7-lf2-recessed-puck-warm','L-F2 · Топло-бела кружна подна 150 mm',.075,'warm')]:
 record(id,label,'L-F2',kind,floor_puck(r,kind),'floor','Recessed floor-light visual; no new runtime light sources.')

def floor_panel(width,kind):
 m=Model();d=width if kind!='half' else .50
 m.box(width,.070,d,(0,.035,0),'dark','reinforced_floor_chassis')
 m.box(width-.045,.008,d-.045,(0,.073,0),'sage','cream_sage_inner_frame')
 m.box(width-.12,.006,d-.12,(0,.079,0),'cyan','glass_led_emitter_panel')
 m.box(width-.115,.005,d-.115,(0,.083,0),'glass','protected_glass_diffuser')
 for z in (-d/2+.034,d/2-.034):
  m.box(width-.045,.015,.025,(0,.083,z),'chrome','metallic_frame_rail')
 for x in (-width/2+.035,width/2-.035):
  m.box(.025,.015,d-.045,(x,.083,0),'cream','cream_frame_rail')
 for x in (-width*.435,width*.435):
  for z in (-d*.43,d*.43):
   m.cyl(.007,.003,(x,.09,z),'silver','sealed_mount')
 return m
for id,label,width,kind in [
 ('s7-lf3-glass-floor-square-1m','L-F3 · Голем LED стаклен поден квадрат 1 m',1.,'full'),
 ('s7-lf3-glass-floor-square-half','L-F3 · LED стаклен модул 0.5 m',.5,'half'),
 ('s7-lf3-glass-floor-square-service','L-F3 · LED квадрат со заштитен сервисен раб',1.,'service')]:
 record(id,label,'L-F3',kind,floor_panel(width,kind),'floor','Loadbearing-style tile design only; not a real-world load/ingress certification.')

def task_lamp(arm=0.28):
 m=Model();m.box(.17,.14,.05,(0,.35,0),'cream','task_wall_mount')
 m.box(.11,.10,.014,(0,.35,.033),'sage','gimbal_plate')
 m.rod((0,.35,.05),(.08,.34,.11),.017,'silver','upper_hinge')
 m.rod((.08,.34,.11),(.17,.22,arm),.014,'chrome','angled_arm')
 m.box(.24,.055,.105,(.17,.18,arm+.02),'sage','angled_led_head')
 m.box(.215,.008,.083,(.17,.146,arm+.02),'warm','downward_warm_emitter')
 m.box(.215,.004,.084,(.17,.139,arm+.02),'glass','desk_optical_diffuser')
 for x in (.10,.24):m.cyl(.007,.006,(x,.18,arm-.02),'silver','hinge_screw')
 return m
for id,label,arm in [
 ('s7-lw1-desk-task-short','L-W1 · Насочена работна светилка кратка',.27),
 ('s7-lw1-desk-task-long','L-W1 · Насочена работна светилка долга',.43)]:
 record(id,label,'L-W1','task',task_lamp(arm),'wall','Mounted in G-00L entry-left service desk area only.')

def wall_flood(width):
 m=Model();m.box(width,.18,.105,(0,.58,.010),'sage','sealed_wall_flood_body')
 m.box(width*.94,.105,.021,(0,.58,.073),'cream','outer_lens_carrier')
 m.box(width*.86,.078,.008,(0,.575,.092),'warm','warm_broad_flood_emitter')
 m.box(width*.90,.084,.004,(0,.575,.098),'glass','flood_diffuser')
 for x in (-width*.47,width*.47):
  m.box(.040,.11,.07,(x,.58,.045),'silver','side_flood_bracket')
  m.cyl(.011,.04,(x,.61,.060),'dark','cable_gland',axis='z')
 return m
for id,label,width in [
 ('s7-lw2-wall-flood-wide','L-W2 · Широк ѕиден рефлектор 0.80 m',.8),
 ('s7-lw2-wall-flood-narrow','L-W2 · Компактен ѕиден рефлектор 0.45 m',.45)]:
 record(id,label,'L-W2','wall-flood',wall_flood(width),'wall')

def chandelier_ring(m,r,pt,name):
 x,y,z=pt;m.ring(r-.072,r,.060,(x,y,z),'cream',name+'_cream_housing')
 m.ring(r-.066,r-.018,.018,(x,y-.039,z),'cyan',name+'_circumference_led_emitter')
 m.ring(r-.063,r-.020,.006,(x,y-.050,z),'glass',name+'_diffuser')
 for a in (0,math.pi/2,math.pi,3*math.pi/2):
  px=x+(r-.04)*math.cos(a);pz=z+(r-.04)*math.sin(a)
  m.cyl(.012,.020,(px,y+.032,pz),'silver',name+'_suspension_eye')

def chandelier(kind):
 m=Model()
 if kind=='main-ring':
  chandelier_ring(m,1.08,(0,.90,0),'G01_large_main')
 elif kind=='satellite-ring':
  chandelier_ring(m,.29,(0,.65,0),'G01_small_ring')
 elif kind=='canopy':
  m.cyl(.24,.040,(0,1.80,0),'sage','ceiling_canopy')
  m.cyl(.08,.060,(0,1.74,0),'chrome','cable_entry')
  m.cyl(.043,.035,(0,1.69,0),'cyan','canopy_glow_emitter')
 else:
  chandelier_ring(m,1.08,(0,.90,0),'G01_main')
  for i,a in enumerate((0,math.pi/2,math.pi,3*math.pi/2)):
   x=1.42*math.cos(a);z=1.42*math.sin(a)
   chandelier_ring(m,.29,(x,.72,z),f'G01_satellite_{i+1}')
   m.rod((x,.79,z),(x,1.72,z),.012,'chrome',f'satellite_hanging_cable_{i+1}')
  for a in (0,2*math.pi/3,4*math.pi/3):
   x=.77*math.cos(a);z=.77*math.sin(a)
   m.rod((x,.94,z),(x,1.72,z),.016,'chrome','main_three_point_hanging_cable')
  m.cyl(.22,.045,(0,1.76,0),'sage','top_ceiling_canopy')
  m.cyl(.06,.018,(0,1.725,0),'cyan','canopy_pilot_glow')
 return m
for id,label,kind in [
 ('s7-lc1-g01-1plus4-ring-chandelier','L-C1 · G01 главен лустер 1 голем + 4 мали прстени','assembly'),
 ('s7-lc1-g01-main-ring','L-C1 · Одделен голем прстен','main-ring'),
 ('s7-lc1-g01-satellite-ring','L-C1 · Одделен мал прстен','satellite-ring'),
 ('s7-lc1-g01-ceiling-canopy','L-C1 · Таванска розета и електричен приклучок','canopy')]:
 record(id,label,'L-C1',kind,chandelier(kind),'free','One main + exactly four satellite rings over actual G01; no new basin or planting capacity.')

def rope_pendant(num):
 m=Model();locations={1:[(0,0)],2:[(-.36,0),(.36,0)],3:[(-.48,0),(0,.12),(.48,0)]}[num]
 for i,(x,z) in enumerate(locations):
  length=.55+i*.15
  m.cyl(.071,.03,(x,1.55,z),'cream',f'ceiling_collar_{i}')
  m.rod((x,1.53,z),(x,1.53-length,z),.023,'rubber',f'heavy_rope_hanger_{i}',sections=16)
  y=1.53-length
  m.cyl(.165,.10,(x,y-.085,z),'sage',f'compact_pendant_housing_{i}')
  m.ring(.115,.160,.016,(x,y-.135,z),'cream',f'pendant_bezel_{i}')
  m.cyl(.12,.009,(x,y-.150,z),'warm',f'warm_led_emitter_{i}')
  m.cyl(.118,.004,(x,y-.157,z),'glass',f'optical_diffuser_{i}')
 return m
for id,label,count in [
 ('s7-lc2-rope-pendant-single','L-C2 · Висечка LED светилка со дебело јаже — една',1),
 ('s7-lc2-rope-pendant-double','L-C2 · Две висечки LED светилки со дебело јаже',2),
 ('s7-lc2-rope-pendant-triple','L-C2 · Три висечки LED светилки со дебело јаже',3)]:
 record(id,label,'L-C2','rope-pendant',rope_pendant(count),'free')

def corridor_ring(radius,pair=False):
 m=Model();offsets=[(0,0)] if not pair else [(-radius*1.75,0),(radius*1.75,0)]
 for i,(x,z) in enumerate(offsets):
  m.cyl(radius,.032,(x,1.68,z),'sage',f'corridor_ceiling_backplate_{i}')
  m.ring(radius*.56,radius*.87,.030,(x,1.643,z),'cream',f'ceiling_recessed_bezel_{i}')
  m.ring(radius*.61,radius*.83,.010,(x,1.622,z),'cyan',f'recessed_ring_emitter_{i}')
  m.ring(radius*.62,radius*.82,.004,(x,1.613,z),'glass',f'ring_diffuser_{i}')
  m.cyl(radius*.27,.020,(x,1.618,z),'dark',f'non_glare_center_dome_{i}')
 return m
for id,label,r,pair in [
 ('s7-lc3-corridor-ceiling-ring-small','L-C3 · Мала кружна ходничка таванска LED',.22,False),
 ('s7-lc3-corridor-ceiling-ring-medium','L-C3 · Средна кружна ходничка таванска LED',.32,False),
 ('s7-lc3-corridor-ceiling-ring-pair','L-C3 · Двоен ходнички LED модул',.22,True)]:
 record(id,label,'L-C3','corridor-ring',corridor_ring(r,pair),'free')

assert len(CATALOG)==24 and len({a['id'] for a in CATALOG})==24
assert {a['lightFamily'] for a in CATALOG}=={'L-F1','L-F2','L-F3','L-W1','L-W2','L-C1','L-C2','L-C3'}
assert all(a['gameplayWrites']==0 and a['realDynamicLightsIncluded']==0 for a in CATALOG)
(ASSETS/'s7-lights-catalog-additions.json').write_text(json.dumps(CATALOG,ensure_ascii=False,indent=2)+'\n')
(ASSETS/'s7-lights-manifest.json').write_text(json.dumps({'schemaVersion':1,'group':'S7.8-C','count':24,'ownerRenderApprovalOnly':True,
 'physicalModelOwnerPass':False,'hardwareRayTracing':False,'dynamicGameLights':0,'assets':MANIFEST},ensure_ascii=False,indent=2)+'\n')

def obj(asset,x,z,i):
 return {'id':f'light-{i:03d}', 'assetId':asset['id'],'label':asset['name'],
 'position':[round(x,4),0,round(z,4)],'rotationY':0,'scale':[1,1,1],
 'layer':'props','locked':False,'visible':True,'binding':'','note':'Preview scene only; use real game renderer contract for actual light sources'}

def project(pid,title,items,cols=4):
 instances=[]
 # Wide stage, no accidental overlap on chandelier / 3 hanging-pendants.
 for i,a in enumerate(items):
  x=(i%cols-(cols-1)/2)*4.4;z=(i//cols)*4.1-((math.ceil(len(items)/cols)-1)*4.1/2)
  instances.append(obj(a,x,z,i))
 p={'schemaVersion':1,'projectId':pid,'name':title,'description':'Genuine S7.8-C lighting GLBs; emissive PBR visual geometry, not runtime light objects. No gameplay changes.',
 'room':{'width':max(18,cols*5),'depth':max(12,math.ceil(len(items)/cols)*4.6),'height':4.,'gridSize':.1,'showWalls':False,'floorColor':'#36494b','wallColor':'#445357'},
 'instances':instances,'assets':[],'bindings':{},
 'meta':{'editorVersion':'0.1.0','gameplayWrites':0,'officialScene':False,'ownerGlbVisualPass':False,'group':'S7.8-C','realDynamicLights':0}}
 (PROJECTS/(pid+'.json')).write_text(json.dumps(p,ensure_ascii=False,indent=2)+'\n')

project('trialum-s7-lights-all-24-glbs','S7.8-C · СИТЕ 24 LED GLB модели',CATALOG,4)
project('trialum-s7-lights-floor-f1-f3','S7.8-C · Подни LED светилки L-F1/F2/F3',[a for a in CATALOG if a['lightFamily'].startswith('L-F')],4)
project('trialum-s7-lights-wall-w1-w2','S7.8-C · Ѕидни LED светилки L-W1/W2',[a for a in CATALOG if a['lightFamily'].startswith('L-W')],2)
project('trialum-s7-lights-ceiling-c1-c3','S7.8-C · Тавански LED светилки L-C1/C2/C3',[a for a in CATALOG if a['lightFamily'].startswith('L-C')],3)
project('trialum-s7-lights-g01-five-rings','S7.8-C · G01 1+4 кружен лустер',[a for a in CATALOG if a['id'] in ['s7-lc1-g01-1plus4-ring-chandelier','s7-lc1-g01-main-ring','s7-lc1-g01-satellite-ring','s7-lc1-g01-ceiling-canopy']],2)
print(json.dumps({'count':len(CATALOG),'family_counts':{f:sum(a['lightFamily']==f for a in CATALOG) for f in ('L-F1','L-F2','L-F3','L-W1','L-W2','L-C1','L-C2','L-C3')},'total_bytes':sum(x['bytes'] for x in MANIFEST),'triangle_count':sum(x['triangles'] for x in MANIFEST)},ensure_ascii=False))
