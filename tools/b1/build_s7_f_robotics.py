#!/usr/bin/env python3
"""Trialum S7-F | original procedural modular mobile-first glTF 2.0 robots.
No game state, inventory, engine writes or implicit autonomous background scheduling.
All measurements m, Y-up. Animated rigid joint nodes are independent visual clips.
"""
from __future__ import annotations
import json, math, hashlib, struct
from pathlib import Path
import numpy as np
import trimesh
from trimesh.visual.material import PBRMaterial
from trimesh.visual.texture import TextureVisuals
BASE=Path(__file__).resolve().parents[2] if Path(__file__).resolve().parent.name=='b1' else Path(__file__).resolve().parents[1]
OUT=BASE/'assets/models';OUT.mkdir(parents=True,exist_ok=True)
PALETTE={
 'cream':('#e6e3d4',.22,.43),'sage':('#5a735f',.44,.55),'dark_sage':('#2a4338',.42,.57),
 'chrome':('#adbab4',.86,.23),'black':('#1e2527',.08,.84),'tire':('#232628',.02,.9),
 'white':('#f4f4e8',.05,.45),'cyan':('#46e7fa',.12,.35),'amber':('#ffca70',.2,.35),
 'glass':('#6cbbc3',.45,.21),'soil':('#68503d',.0,.91),'transparent_look':('#325b62',.55,.26)
}
materials={}
for name,(col,metal,rough) in PALETTE.items():
 rgb=tuple(int(col[j:j+2],16) for j in (1,3,5))
 materials[name]=PBRMaterial(name='TRIALUM_'+name.upper(),baseColorFactor=(*rgb,255),metallicFactor=metal,roughnessFactor=rough,emissiveFactor=[0.15,0.9,1.0] if name=='cyan' else [0.0,0.0,0.0],doubleSided=False)

def T(x=0,y=0,z=0):a=np.eye(4);a[:3,3]=[x,y,z];return a
class Kit:
 def __init__(self):self.scene=trimesh.Scene(base_frame='world');self.n=0;self.pivots=[]
 def add(self,geo,center=(0,0,0),mat='cream',name='part',parent=None,rotation=None):
  geo.visual=TextureVisuals(material=materials[mat]);self.n+=1
  x,y,z=center;trans=T(x,y,z)
  if rotation is not None:trans[:3,:3]=np.array(rotation)[:3,:3]
  self.scene.add_geometry(geo,node_name=f'{name}_{self.n:03d}',geom_name=f'{name}_{self.n:03d}',parent_node_name=parent,transform=trans);return self
 def box(self,xyz,dim,mat='cream',name='panel',parent=None):
  return self.add(trimesh.creation.box(extents=dim),xyz,mat,name,parent)
 def ball(self,xyz,r,mat='chrome',name='joint',parent=None):
  return self.add(trimesh.creation.icosphere(subdivisions=2,radius=r),xyz,mat,name,parent)
 def cyl(self,xyz,r,h,mat='chrome',name='cylinder',axis='y',parent=None,sections=16):
  geo=trimesh.creation.cylinder(radius=r,height=h,sections=sections)
  if axis=='y':geo.apply_transform(trimesh.transformations.rotation_matrix(math.pi/2,[1,0,0]))
  elif axis=='x':geo.apply_transform(trimesh.transformations.rotation_matrix(math.pi/2,[0,1,0]))
  return self.add(geo,xyz,mat,name,parent)
 def tube(self,a,b,r,mat='chrome',name='pipe',parent=None,sections=12):
  a,b=np.asarray(a,float),np.asarray(b,float);vec=b-a;ln=np.linalg.norm(vec)
  if ln<1e-5:return self
  geo=trimesh.creation.cylinder(radius=r,height=ln,sections=sections)
  geo.apply_transform(trimesh.geometry.align_vectors([0,0,1],vec/ln))
  return self.add(geo,(a+b)/2,mat,name,parent)
 def pivot(self,name,xyz,parent=None):
  self.scene.graph.update(frame_to=name,frame_from=parent or 'world',matrix=T(*xyz))
  self.pivots.append(name);return name
 def panel(self,xyz,wh,mat='cyan',parent=None):return self.box(xyz,(wh[0],wh[1],.016),mat,'display',parent)
 def wheels(self,axles=(-.65,.65),side=.52,r=.24):
  for x in axles:
   for z in (-side,side):
    node=self.pivot(f'WHEEL_{len([n for n in self.pivots if n.startswith("WHEEL_")]):02d}',(x,r,z))
    self.cyl((0,0,0),r,.19,'tire','wheel',axis='z',parent=node)
    out=.105 if z>0 else -.105
    self.cyl((0,0,out),r*.52,.012,'chrome','wheelhub',axis='z',parent=node)
    self.cyl((0,0,out+(.010 if z>0 else -.010)),r*.22,.019,'cyan','axlecap',axis='z',parent=node)
    self.box((r*.42,.03,out),(.10,.06,.017),'cream','wheelmarker',node)
 def vehicle(self,length=1.8,width=1.12,ht=.38,axles=(-.65,.65),wheels=True):
  r=.23
  self.box((0,r+ht*.47,0),(length,ht,width),'sage','vehicleframe')
  self.box((0,r+ht+.015,0),(length*.86,.08,width*.85),'cream','topplating')
  self.box((length*.48,r+ht*.36,0),(.09,.25,width*.8),'cream','bumper')
  self.box((length*.5,r+ht*.46,0),(.04,.07,width*.5),'cyan','frontlights')
  if wheels:self.wheels(axles,side=width*.56,r=r)
 def track(self,z,centerx=0,length=1.5,r=.29):
  for x in (centerx-length*.39,centerx+length*.39):
   self.cyl((x,r,z),r,.22,'black','trackroller',axis='z')
   self.cyl((x,r,z+math.copysign(.12,z)),r*.45,.02,'chrome','trackhub',axis='z')
  self.box((centerx,r,z),(length,r*.38,.25),'tire','trackbelt')
  self.box((centerx,r*1.8,z),(length*.83,.07,.19),'black','tracktop')
  for i in range(9):
   x=centerx-length*.43+i*(length*.86/8)
   for y in (.028,2*r-.028):self.box((x,y,z),(.08,.065,.28),'black','treadlug')
 def rail(self,x1,x2,z1,z2,y=.8):
  for z in (z1,z2):self.tube((x1,y,z),(x2,y,z),.026,'chrome','rail')
  for x in (x1,x2):self.tube((x,y,z1),(x,y,z2),.026,'chrome','crossrail')
 def small_icon(self,xyz=(0,1,0)):
  self.box(xyz,(.24,.17,.012),'dark_sage','brandplate')
  self.box((xyz[0],xyz[1],xyz[2]+.011),(.11,.025,.007),'cyan','brandline')

def hero_e01():
 k=Kit();k.box((0,.70,0),(1.56,.48,.94),'sage','dieselbody');k.box((-.25,1.04,0),(.66,.36,.8),'cream','cabbase')
 for z in (-.64,.64):k.track(z,length=1.63,r=.30)
 k.box((-.30,1.44,0),(.68,.75,.78),'cream','excavatorcab')
 k.box((-.30,1.48,.411),(.57,.46,.018),'glass','windscreen')
 for y in (1.18,1.78):k.box((-.25,y,.0),(.8,.028,.85),'chrome','cabrail')
 for x in (-.59,.09):k.tube((x,1.14,-.42),(x,1.75,-.42),.024,'chrome')
 k.cyl((.23,1.02,0),.28,.22,'chrome','slewring')
 p=k.pivot('E01_BOOM_PIVOT',(.48,1.20,0));k.box((.52,.19,0),(1.10,.22,.2),'cream','boom',p)
 k.tube((.02,.16,0),(1.02,.35,0),.06,'chrome','boomhydraulic',p)
 q=k.pivot('E01_STICK_PIVOT',(1.04,.18,0),p)
 k.box((.39,-.17,0),(.86,.2,.19),'sage','stick',q)
 k.tube((.05,-.12,0),(.74,-.27,0),.045,'chrome','stickcylinder',q)
 r=k.pivot('E01_BUCKET_PIVOT',(.82,-.29,0),q)
 k.box((.17,-.18,0),(.40,.31,.47),'chrome','bucket',r)
 for z in (-.17,0,.17):k.box((.39,-.38,z),(.13,.13,.08),'dark_sage','buckettooth',r)
 k.panel((-.63,1.5,.416),(.12,.11));return k,{'dig':[(p,'z',[-.18,.30,-.18]),(q,'z',[.13,-.55,.13]),(r,'z',[.1,.36,.1])],'inspect':[(p,'z',[0,.16,0])], 'idle':[(p,'z',[0,.014,0])]}

def hero_e02():
 k=Kit();k.box((0,.69,0),(1.74,.50,1.04),'cream','tillerbody')
 for z in (-.66,.66):k.track(z,length=1.68,r=.31)
 k.box((-.29,1.13,0),(.91,.43,1.02),'sage','housing')
 k.box((-.39,1.37,.37),(.47,.18,.015),'glass','sensorbar');k.box((.7,.73,0),(.62,.45,1.19),'chrome','rotorguard')
 p=k.pivot('E02_TILLER_DRUM_PIVOT',(.82,.46,0))
 k.cyl((0,0,0),.27,1.13,'black','drum',axis='z',parent=p)
 for i in range(13):
  angle=2*math.pi*i/13;z=-.48+i*.078
  k.ball((math.cos(angle)*.31,math.sin(angle)*.31,z),.068,'chrome','tine',p)
  k.tube((math.cos(angle)*.24,math.sin(angle)*.24,z),(math.cos(angle)*.40,math.sin(angle)*.40,z),.028,'chrome','blade',p)
 for z in (-.55,.55):k.cyl((.75,.49,z),.12,.10,'sage','drumsupport',axis='z')
 k.box((-.70,1.40,.35),(.28,.08,.02),'cyan','LEDstatus')
 return k,{'till':[(p,'z',[0,math.pi*2,math.pi*4])], 'idle':[(p,'z',[0,.04,0])]}

def hero_t01():
 k=Kit();k.vehicle(1.9,1.09,.35,axles=(-.62,.64));k.box((-.18,.85,0),(.72,.38,.73),'cream','robotplatform')
 p=k.pivot('T01_ARM_PIVOT',(-.15,.92,0));k.cyl((0,0,0),.21,.16,'chrome','armbase',parent=p)
 k.box((.09,.35,0),(.19,.70,.16),'cream','arm01',p)
 q=k.pivot('T01_ELBOW_PIVOT',(.10,.72,0),p);k.box((.25,.0,0),(.52,.15,.13),'sage','arm02',q)
 k.cyl((0,0,0),.14,.16,'chrome','elbow',axis='z',parent=q)
 r=k.pivot('T01_GRIPPER_PIVOT',(.51,0,0),q)
 k.box((.13,0,0),(.22,.12,.19),'chrome','gripperhub',r)
 for z in (-.14,.14):k.box((.31,-.04,z),(.21,.08,.07),'chrome','gripperfinger',r)
 k.box((.66,.71,0),(.45,.07,.77),'sage','carrytray');k.rail(.40,.88,-.47,.47,y=.93)
 return k,{'plant':[(p,'z',[0,-.20,0]),(q,'z',[0,.55,0]),(r,'y',[0,.30,0])], 'pickup':[(p,'z',[0,.23,0]),(q,'z',[0,-.31,0])], 'drive':[(p,'z',[0,.025,0])]}

def hero_t02():
 k=Kit();k.vehicle(2.3,1.19,.30,axles=(-.81,.80));k.box((0,.73,0),(2.08,.15,1.05),'chrome','flatbed')
 for z in (-.52,.52):k.box((0,.95,z),(2.02,.10,.06),'sage','sideguard')
 for x in (-.92,.92):k.box((x,.93,0),(.07,.10,1.07),'cream','endguard')
 for x in (-.78,.78):
  for z in (-.52,.52):k.tube((x,.80,z),(x,1.06,z),.028,'chrome','upright')
 k.box((-.84,1.02,0),(.29,.18,.67),'dark_sage','driveconsole');k.panel((-.84,1.13,.34),(.19,.09))
 return k,{'drive':[(n,'z',[0,.45,.90]) for n in k.pivots if n.startswith('WHEEL_')], 'brake':[(n,'z',[0,.14,.14]) for n in k.pivots if n.startswith('WHEEL_')]}

def hero_t03():
 k=Kit();k.vehicle(2.65,1.37,.48,axles=(-.93,.96));k.wheels((0,),side=.77,r=.25)
 for x in (-.63,.24):k.box((x,1.10,0),(.71,.50,1.05),'dark_sage','servicecrate')
 for x in (-.63,.24):
  for z in (-.53,.53):k.box((x,1.16,z),(.72,.50,.03),'chrome','cratestrap')
 k.rail(-1.22,1.21,-.72,.72,y=1.53)
 k.box((1.18,1.45,0),(.30,.24,1.12),'cream','tailgate')
 k.panel((-1.22,1.19,.72),(.22,.09))
 return k,{'drive':[(n,'z',[0,.45,.90]) for n in k.pivots if n.startswith('WHEEL_')], 'brake':[(n,'z',[0,.14,.14]) for n in k.pivots if n.startswith('WHEEL_')]}

def hero_r01():
 k=Kit();k.box((0,.81,0),(.36,.25,.30),'sage','pelvis')
 k.box((0,1.18,0),(.65,.61,.36),'cream','thorax');k.box((0,1.42,.195),(.32,.16,.014),'sage','chestbadge')
 k.box((0,1.37,.204),(.13,.03,.02),'cyan','heartLED')
 k.box((0,.86,0),(.44,.28,.29),'chrome','waist')
 neck=k.pivot('R01_NECK_PIVOT',(0,1.53,0));k.box((0,.19,0),(.44,.37,.39),'cream','head',neck)
 k.box((0,.20,.205),(.36,.19,.015),'dark_sage','visor',neck)
 for x in (-.11,.11):k.ball((x,.22,.215),.053,'cyan','eye',neck)
 for side in (-1,1):
  sh=k.pivot(('R01_LEFT' if side<0 else 'R01_RIGHT')+'_SHOULDER_PIVOT',(side*.43,1.42,0))
  k.ball((0,0,0),.13,'chrome','shoulder',sh)
  k.box((0,-.26,0),(.19,.47,.20),'cream','upperarm',sh)
  el=k.pivot(('R01_LEFT' if side<0 else 'R01_RIGHT')+'_ELBOW_PIVOT',(0,-.53,0),sh)
  k.cyl((0,0,0),.11,.19,'chrome','elbow',axis='z',parent=el)
  k.box((0,-.20,0),(.17,.39,.18),'sage','forearm',el)
  k.box((0,-.44,.02),(.16,.12,.2),'chrome','hand',el)
  for i in (-1,0,1):k.box((i*.05,-.53,.09),(.038,.13,.056),'cream','finger',el)
  hip=k.pivot(('R01_LEFT' if side<0 else 'R01_RIGHT')+'_HIP_PIVOT',(side*.20,.95,0))
  k.ball((0,0,0),.13,'chrome','hip',hip)
  k.box((0,-.23,0),(.24,.40,.26),'cream','thigh',hip)
  knee=k.pivot(('R01_LEFT' if side<0 else 'R01_RIGHT')+'_KNEE_PIVOT',(0,-.45,0),hip)
  k.ball((0,0,0),.11,'sage','knee',knee)
  k.box((0,-.19,0),(.19,.36,.23),'cream','shin',knee)
  k.box((0,-.41,.10),(.29,.16,.46),'sage','foot',knee)
 k.box((0,1.33,-.20),(.30,.38,.14),'sage','powerpack')
 # R01 feet rest at y about -.02 (corrected by root Y translation in asset manifest). Robot height 1.94 m.
 return k,{
 'idle': [('R01_NECK_PIVOT','y',[0,.11,0])],
 'walk':[('R01_LEFT_HIP_PIVOT','z',[-.32,.36,-.32]),('R01_RIGHT_HIP_PIVOT','z',[.32,-.36,.32]),('R01_LEFT_SHOULDER_PIVOT','z',[.24,-.25,.24]),('R01_RIGHT_SHOULDER_PIVOT','z',[-.24,.25,-.24])],
 'inspect':[('R01_NECK_PIVOT','y',[-.22,.33,-.22]),('R01_RIGHT_SHOULDER_PIVOT','z',[0,.48,0])],
 'repair':[('R01_RIGHT_SHOULDER_PIVOT','z',[0,.45,.30]),('R01_RIGHT_ELBOW_PIVOT','z',[0,-.65,0])],
 'carry':[('R01_LEFT_SHOULDER_PIVOT','z',[0,-.49,-.49]),('R01_RIGHT_SHOULDER_PIVOT','z',[0,.49,.49])],
 'shutdown':[('R01_NECK_PIVOT','x',[0,-.30,-.30])]
 }

def attachment(kind):
 k=Kit()
 if kind=='e01-bucket':
  k.box((0,.22,0),(.52,.39,.61),'chrome','bucket');
  for z in (-.20,0,.20):k.box((.25,.025,z),(.20,.10,.10),'dark_sage','buckettooth')
  k.cyl((-.27,.36,0),.14,.58,'sage','hinge',axis='z')
 elif kind=='e01-tracks':
  for z in (-.42,.42):k.track(z,length=1.44)
 elif kind=='e02-drum':
  k.cyl((0,.29,0),.28,1.15,'tire','drum',axis='z')
  for i in range(15):
   a=2*math.pi*i/15;z=-.5+i/14;k.tube((math.cos(a)*.18,.29+math.sin(a)*.18,z),(math.cos(a)*.44,.29+math.sin(a)*.44,z),.035,'chrome','tine')
 elif kind=='e02-tine':
  k.tube((0,.045,0),(.22,.27,0),.04,'chrome');k.ball((.22,.27,0),.06,'chrome')
 elif kind=='t01-gripper':
  k.box((0,.15,0),(.27,.17,.26),'sage','gripperbase')
  for z in (-.19,.19):k.box((.15,.13,z),(.40,.09,.08),'chrome','gripperfinger')
 elif kind=='t01-carrier':
  k.box((0,.12,0),(.9,.13,.67),'cream','tray');
  for z in (-.31,.31):k.box((0,.20,z),(.88,.06,.03),'chrome','rail')
 elif kind=='t02-crate':
  k.box((0,.17,0),(.76,.30,.55),'dark_sage','crate');k.box((0,.31,0),(.75,.02,.54),'cream','cratecover')
  for x in (-.30,.30):k.box((x,.18,.28),(.05,.22,.03),'chrome','latch')
 elif kind=='t02-flatbed':
  k.box((0,.18,0),(1.8,.14,1.1),'chrome','bed');
  for z in (-.54,.54):k.box((0,.31,z),(1.7,.16,.055),'sage','bedrail')
 elif kind=='t03-crate':
  k.box((0,.35,0),(1.14,.66,.87),'dark_sage','heavyequipmentbox');k.box((0,.70,0),(1.18,.04,.91),'cream','lid')
  for z in (-.42,.42):k.box((0,.38,z),(1.11,.07,.04),'chrome','protectiveband')
 elif kind=='t03-hitch':
  k.box((0,.16,0),(.66,.18,.22),'sage','towbeam');k.cyl((.34,.16,0),.10,.07,'chrome','coupler')
 elif kind=='r01-tool':
  k.box((0,.1,0),(.52,.16,.23),'dark_sage','repairtool');k.box((.2,.21,0),(.18,.09,.13),'cream','handle');k.cyl((-.25,.16,0),.1,.10,'chrome','bit',axis='x')
 elif kind=='r01-dock':
  k.box((0,.055,0),(.90,.11,.73),'sage','dock');k.box((0,.07,.37),(.85,.06,.04),'cyan','docklight')
  for x in (-.35,.35):k.box((x,.24,-.34),(.11,.37,.11),'chrome','chargingpin')
 else:raise ValueError(kind)
 return k,{}

def add_glb_animations(blob,clips):
 if not clips:return blob
 assert blob[:4]==b'glTF'
 magic,version,total=struct.unpack_from('<4sII',blob,0);assert version==2 and total==len(blob)
 off=12;chunks=[]
 while off<len(blob):
  length,tag=struct.unpack_from('<I4s',blob,off);off+=8;chunks.append([tag,blob[off:off+length]]);off+=length
 doc=json.loads(next(x[1] for x in chunks if x[0]==b'JSON'));binpart=bytearray(next((x[1] for x in chunks if x[0]==b'BIN\x00'),b''))
 names={x.get('name'):i for i,x in enumerate(doc['nodes'])};animations=[]
 for clip,rules in clips.items():
  samplers=[];channels=[]
  for node,axis,angles in rules:
   if node not in names:raise RuntimeError(f'Animation pivot not exported: {node}, available {list(names)[:15]}')
   times=np.asarray([0.0,0.75,1.5],dtype=np.float32)
   if len(angles)!=3:raise ValueError('angles')
   quats=np.zeros((3,4),dtype=np.float32)
   idx={'x':0,'y':1,'z':2}[axis];quats[:,idx]=np.sin(np.array(angles)/2);quats[:,3]=np.cos(np.array(angles)/2)
   def accessor(data,typ,count):
    while len(binpart)%4:binpart.append(0)
    byteOffset=len(binpart);bb=data.tobytes();binpart.extend(bb)
    view=len(doc.setdefault('bufferViews',[]));doc['bufferViews'].append({'buffer':0,'byteOffset':byteOffset,'byteLength':len(bb)})
    acc=len(doc.setdefault('accessors',[]));doc['accessors'].append({'bufferView':view,'componentType':5126,'count':count,'type':typ});return acc
   ti=accessor(times,'SCALAR',3);ro=accessor(quats,'VEC4',3)
   si=len(samplers);samplers.append({'input':ti,'output':ro,'interpolation':'LINEAR'})
   channels.append({'sampler':si,'target':{'node':names[node],'path':'rotation'}})
  if samplers:animations.append({'name':clip,'samplers':samplers,'channels':channels})
 doc['animations']=animations;doc['buffers'][0]['byteLength']=len(binpart)
 def pad(raw,padder):return raw+padder*((-len(raw))%4)
 js=pad(json.dumps(doc,separators=(',',':'),ensure_ascii=False).encode(),b' ');bn=pad(bytes(binpart),b'\x00')
 out=struct.pack('<4sII',b'glTF',2,12+8+len(js)+8+len(bn))+struct.pack('<I4s',len(js),b'JSON')+js+struct.pack('<I4s',len(bn),b'BIN\x00')+bn
 return out

ASSETS=[
 ('s7-f-e01-excavator','E01 · Гасеничарски ископувач','E01',hero_e01),
 ('s7-f-e01-bucket','E01 · Заменлива корпа со заби','E01',lambda:attachment('e01-bucket')),
 ('s7-f-e01-tracks','E01 · Гасеници, резервен модул','E01',lambda:attachment('e01-tracks')),
 ('s7-f-e02-tiller','E02 · Машина за разорување почва','E02',hero_e02),
 ('s7-f-e02-drum','E02 · Ротор за обработка на почва','E02',lambda:attachment('e02-drum')),
 ('s7-f-e02-replaceable-tine','E02 · Резервен метален заб','E02',lambda:attachment('e02-tine')),
 ('s7-f-t01-planting-carrier','T01 · Транспортер со садечка рака','T01',hero_t01),
 ('s7-f-t01-gripper','T01 · Роботски фаќач','T01',lambda:attachment('t01-gripper')),
 ('s7-f-t01-seedling-carrier','T01 · Носач за садници, празен','T01',lambda:attachment('t01-carrier')),
 ('s7-f-t02-flat-transport','T02 · Транспортер со рамна платформа','T02',hero_t02),
 ('s7-f-t02-empty-crate','T02 · Празен транспортен сандак','T02',lambda:attachment('t02-crate')),
 ('s7-f-t02-flatbed-module','T02 · Заменлива платформа','T02',lambda:attachment('t02-flatbed')),
 ('s7-f-t03-heavy-transport','T03 · Тежок сервисен транспортер','T03',hero_t03),
 ('s7-f-t03-service-crate','T03 · Сервисен сандак со капак','T03',lambda:attachment('t03-crate')),
 ('s7-f-t03-tow-hitch','T03 · Сервисна спојка за влечење','T03',lambda:attachment('t03-hitch')),
 ('s7-f-r01-humanoid','R01 · Хуманоиден сервисен робот','R01',hero_r01),
 ('s7-f-r01-repair-tool','R01 · Алат за поправки','R01',lambda:attachment('r01-tool')),
 ('s7-f-r01-charging-dock','R01 · Станица за полнење','R01',lambda:attachment('r01-dock')),
]

def build():
 manifest=[];catalog=[]
 for i,(aid,name,group,fn) in enumerate(ASSETS):
  kit,clips=fn();binblob=kit.scene.export(file_type='glb');binblob=add_glb_animations(binblob,clips)
  path=OUT/(aid+'.glb');path.write_bytes(binblob)
  loaded=trimesh.load(path,force='scene');bb=loaded.bounds;dim=(bb[1]-bb[0]).round(4).tolist()
  names=list(clips);data={'id':aid,'name':name,'category':'S7-F · '+group,'src':'assets/models/'+path.name,'dimensions':dim,'placement':'floor','source':'tools/b1/build_s7_f_robotics.py','approval':'OWNER CONCEPT DIRECTION; REAL GLB VISUAL PASS PENDING','ownerModelPass':False,'engineStateWrites':0,'gameplayIntegration':False,'animationClips':names,'pivotStandard':'Y-up; physical floor y≈0; attach named joints via glTF nodes'}
  manifest.append({'id':aid,'bytes':len(binblob),'sha256':hashlib.sha256(binblob).hexdigest(),'meshes':len(loaded.geometry),'nodes':len(loaded.graph.nodes),'animations':names,'dimensions':dim,'group':group})
  catalog.append(data)
 (BASE/'assets/s7-f/s7-f-catalog-additions.json').write_text(json.dumps(catalog,ensure_ascii=False,indent=2)+'\n')
 (BASE/'assets/s7-f/s7-f-manifest.json').write_text(json.dumps({'schemaVersion':1,'phase':'S7.8-F','count':len(manifest),'real3dModels':True,'runtimeIntegration':False,'previewOnly':True,'oneToOneHighReplacementContract':{'preserve':['assetId','Y-up','scale','pivot','joint names','connectors','anchors','bounding envelope']},'models':manifest},ensure_ascii=False,indent=2)+'\n')
 scenes={
 'all':list(range(18)),'heroes':[0,3,6,9,12,15], 'machines':list(range(0,6)),
 'transports':list(range(6,15)),'robot':[15,16,17],'tools':[1,2,4,5,7,8,10,11,13,14,16,17],
 'g00l-preview':[6,9,12,15,16,17], 'rig-demo':[0,3,6,15]}
 for kind,indices in scenes.items():
  cols=6 if kind=='all' else (3 if kind in ('heroes','transports','g00l-preview') else 4)
  instances=[]
  for n,j in enumerate(indices):
   aid,name,group,_=ASSETS[j]
   x=(n%cols-(cols-1)/2)*3.05;z=(n//cols-(math.ceil(len(indices)/cols)-1)/2)*3.9
   instances.append({'id':f's7f-{kind}-{j:03d}','assetId':aid,'label':name,'position':[round(x,3),0,round(z,3)],'rotationY':0,'scale':[1,1,1],'layer':'props','locked':False,'visible':True,'binding':'','note':'S7-F model review ONLY; no real plant transfer, digging, autonomous scheduling or game writes'})
  room={'width':max(15,cols*3.65),'depth':max(13,math.ceil(len(indices)/cols)*4.6),'height':6,'gridSize':.1,'showWalls':False,'floorColor':'#304043','wallColor':'#4b625d'}
  scene={'schemaVersion':1,'projectId':f'trialum-s7-f-{kind}','name':'S7-F · '+{'all':'СИТЕ 18 GLB · МАШИНИ / ТРАНСПОРТ / R01','heroes':'6 главни возила и робот','machines':'E01/E02 машини и делови','transports':'T01/T02/T03 транспортери и делови','robot':'R01 робот, алат и док','tools':'12 заменливи елементи','g00l-preview':'G-00L сервисна станица (демо)','rig-demo':'Подвижни зглобови (GLB клипови)'}[kind], 'description':'Reference-only S7-F GLB gallery. Individual joint clips in GLB; preview application may require animation UI selection. Does not modify live engine.','room':room,'instances':instances}
  (BASE/f'projects/trialum-s7-f-{kind}.json').write_text(json.dumps(scene,ensure_ascii=False,indent=2)+'\n')
 print(json.dumps({'count':len(manifest),'files':[x['id'] for x in manifest],'totalBytes':sum(x['bytes'] for x in manifest),'animated':{x['id']:x['animations'] for x in manifest if x['animations']}},ensure_ascii=False))
if __name__=='__main__':build()
