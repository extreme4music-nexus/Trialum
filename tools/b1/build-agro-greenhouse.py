#!/usr/bin/env python3
"""Trialum S7 ORIGINAL GLB authoring: empty greenhouse shell only.
Standard library, deterministic, no gameplay writes, no props or procedural device geometry.
Coordinates are metric X-right/Y-up/Z+ toward original Agro Atrium.
"""
from __future__ import annotations
import hashlib, json, math, struct, pathlib

ROOT=pathlib.Path(__file__).resolve().parents[2]
OUT=ROOT/"prototypes/lw-d/scenes/agro-greenhouse/greenhouse-shell.glb"

class Model:
 def __init__(self):
  self.materials=[];self.meshes=[];self.nodes=[{'name':'trialum.ground.agro.garden','children':[],'extras':{'sceneId':'trialum.ground.agro.garden','gameAuthority':False}}]
  self.bin=bytearray();self.views=[];self.accessors=[];self.grouped={}
  for name,color,rough,metal,alpha in [
   ('foundation',[.18,.29,.26],.88,.05,1),('floor',[.77,.78,.69],.76,0,1),
   ('metal',[.74,.78,.72],.3,.74,1),('glass',[.66,.91,.83],.06,.02,.28),
   ('edge',[.34,.57,.52],.42,.36,1)]:
   m={'name':name,'pbrMetallicRoughness':{'baseColorFactor':[*color,alpha],'roughnessFactor':rough,'metallicFactor':metal},'doubleSided':True}
   if alpha<1:m.update({'alphaMode':'BLEND','alphaCutoff':.02})
   self.materials.append(m)
 def view(self,content,target=None):
  off=len(self.bin);self.bin.extend(content);self.bin.extend(b'\0'*(-len(self.bin)%4))
  v={'buffer':0,'byteOffset':off,'byteLength':len(content)}
  if target:v['target']=target
  self.views.append(v);return len(self.views)-1
 def attr(self,data,component=5126,arity=3,target=34962):
  fmt='f' if component==5126 else 'H'
  b=struct.pack('<'+fmt*len(data),*data)
  view=self.view(b,target);t={1:'SCALAR',2:'VEC2',3:'VEC3',4:'VEC4'}[arity]
  a={'bufferView':view,'componentType':component,'count':len(data)//arity,'type':t}
  if t=='VEC3':
   a['min']=[min(data[j::3]) for j in range(3)];a['max']=[max(data[j::3]) for j in range(3)]
  self.accessors.append(a);return len(self.accessors)-1
 def geom(self,verts,faces,mat,name,uv=None):
  if len(verts)<3:return
  group=self.grouped.setdefault(mat,{'vertices':[],'faces':[]})
  start=len(group['vertices']);group['vertices'].extend(verts)
  group['faces'].extend([(a+start,b+start,c+start) for a,b,c in faces])
 def flush(self):
  for mat,group in self.grouped.items():
   vertices,faces=group['vertices'],group['faces']
   normals=[[0.,0.,0.] for _ in vertices]
   for a,b,c in faces:
    p,q,r=vertices[a],vertices[b],vertices[c]
    u=[q[i]-p[i] for i in range(3)];v=[r[i]-p[i] for i in range(3)]
    n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]]
    for idx in (a,b,c):
     for j in range(3):normals[idx][j]+=n[j]
   norms=[]
   for n in normals:
    d=math.sqrt(sum(x*x for x in n)) or 1
    norms.extend(x/d for x in n)
   for part in range(0,len(faces),3000):
    selected=faces[part:part+3000]
    unique=sorted({i for f in selected for i in f})
    lookup={idx:i for i,idx in enumerate(unique)}
    indexed=[vertices[i] for i in unique]
    indexed_norms=[[norms[3*i+j] for j in range(3)] for i in unique]
    p=self.attr([x for v in indexed for x in v])
    n=self.attr([x for v in indexed_norms for x in v])
    idx=self.attr([lookup[x] for face in selected for x in face],5123,1,34963)
    name=f'shell-material-{mat}-{part//3000}'
    self.meshes.append({'name':name,'primitives':[{'attributes':{'POSITION':p,'NORMAL':n},'indices':idx,'material':mat,'mode':4}]})
    self.node(name,mesh=len(self.meshes)-1)
 def node(self,name,mesh=None,extras=None,xyz=None):
  x={'name':name}
  if mesh is not None:x['mesh']=mesh
  if xyz is not None:x['translation']=xyz
  if extras:x['extras']=extras
  self.nodes[0]['children'].append(len(self.nodes));self.nodes.append(x)
 def box(self,name,c,d,mat):
  x,y,z=c;w,h,l=[v/2 for v in d]
  vs=[[x+dx*w,y+dy*h,z+dz*l] for dx,dy,dz in [(-1,-1,-1),(1,-1,-1),(1,1,-1),(-1,1,-1),(-1,-1,1),(1,-1,1),(1,1,1),(-1,1,1)]]
  fs=[(0,2,1),(0,3,2),(4,5,6),(4,6,7),(0,1,5),(0,5,4),(1,2,6),(1,6,5),(2,3,7),(2,7,6),(3,0,4),(3,4,7)]
  self.geom(vs,fs,mat,name)
 def quad(self,name,pts,mat):self.geom(pts,[(0,1,2),(0,2,3)],mat,name)
 def cyl(self,name,center,rad,h,mat,segments=48):
  x,y,z=center;vs=[]
  for yy in [y-h/2,y+h/2]:
   for i in range(segments):
    a=2*math.pi*i/segments;vs.append([x+rad*math.cos(a),yy,z+rad*math.sin(a)])
  fs=[]
  for i in range(segments):
   j=(i+1)%segments;fs.extend([(i,j,segments+j),(i,segments+j,segments+i)])
  vs.extend([[x,y-h/2,z],[x,y+h/2,z]])
  for i in range(segments):
   j=(i+1)%segments;fs.extend([(2*segments,i,j),(2*segments+1,segments+j,segments+i)])
  self.geom(vs,fs,mat,name)
 def beam(self,name,a,b,r,mat,ns=6):
  dx=[b[i]-a[i] for i in range(3)];length=math.sqrt(sum(x*x for x in dx))
  if length<1e-6:return
  u=[x/length for x in dx];aux=[0,1,0] if abs(u[1])<.9 else [1,0,0]
  v=[aux[1]*u[2]-aux[2]*u[1],aux[2]*u[0]-aux[0]*u[2],aux[0]*u[1]-aux[1]*u[0]]
  d=math.sqrt(sum(x*x for x in v));v=[x/d for x in v]
  w=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]]
  vs=[]
  for c in [a,b]:
   for i in range(ns):
    t=2*math.pi*i/ns
    vs.append([c[k]+r*(v[k]*math.cos(t)+w[k]*math.sin(t)) for k in range(3)])
  fs=[]
  for i in range(ns):
   j=(i+1)%ns;fs.extend([(i,j,ns+j),(i,ns+j,ns+i)])
  self.geom(vs,fs,mat,name)
 def glb(self):
  self.flush()
  gltf={'asset':{'version':'2.0','generator':'Trialum-original S7 empty-glass-shell build-only'},
    'scene':0,'scenes':[{'nodes':[0]}],'nodes':self.nodes,'meshes':self.meshes,
    'materials':self.materials,'buffers':[{'byteLength':len(self.bin)}],
    'bufferViews':self.views,'accessors':self.accessors}
  js=json.dumps(gltf,ensure_ascii=False,separators=(',',':')).encode()
  js+=b' '*(-len(js)%4)
  raw=bytes(self.bin);raw+=b'\0'*(-len(raw)%4)
  return struct.pack('<III',0x46546c67,2,12+8+len(js)+8+len(raw))+struct.pack('<II',len(js),0x4e4f534a)+js+struct.pack('<II',len(raw),0x004e4942)+raw

m=Model();rad=math.radians
branches=[('G-02',-73,38,9,7.5),('G-03',-38,55,12,9),
          ('G-04',-2,63,14,10),('G-05',37,56,12.5,9)]
def xy(a,r,l=0):
 a=rad(a);return r*math.sin(a)+l*math.cos(a),-r*math.cos(a)+l*math.sin(a)

# Shell floor and foundation only; NO BASIN, BED, RACK, PLANT OR ROBOT.
m.cyl('shell.pad.floor',(0,-.11,0),17,.22,1,64)
m.cyl('shell.pad.foundation',(0,-.31,0),17.12,.22,0,64)
for id,a,end,width,h in branches:
 for yy,material,kind in [(-.11,1,'floor'),(-.32,0,'foundation')]:
  vs=[]
  for r,l in [(14,-width/2),(14,width/2),(end,width/2),(end,-width/2)]:
   x,z=xy(a,r,l);vs.append([x,yy,z])
  m.quad(f'shell.{id}.{kind}',vs,material)
 start=16;nsteps=max(6,int((end-start)/4));sectors=12
 for k in range(nsteps+1):
  r=start+(end-start)*k/nsteps
  for j in range(1,sectors+1):
   t0=math.pi*(j-1)/sectors;t1=math.pi*j/sectors
   l0=-width/2*math.cos(t0);l1=-width/2*math.cos(t1)
   y0=4.2+(h-4.2)*math.sin(t0);y1=4.2+(h-4.2)*math.sin(t1)
   x0,z0=xy(a,r,l0);x1,z1=xy(a,r,l1)
   m.beam(f'shell.{id}.arch.{k}.{j}',[x0,y0,z0],[x1,y1,z1],.095,2)
 for k in range(nsteps):
  r0=start+(end-start)*k/nsteps;r1=start+(end-start)*(k+1)/nsteps
  for j in range(sectors):
   t0=math.pi*j/sectors;t1=math.pi*(j+1)/sectors
   l0=-width/2*math.cos(t0);l1=-width/2*math.cos(t1)
   y0=4.2+(h-4.2)*math.sin(t0);y1=4.2+(h-4.2)*math.sin(t1)
   pts=[]
   for rr,ll,yy in [(r0,l0,y0),(r1,l0,y0),(r1,l1,y1),(r0,l1,y1)]:
    x,z=xy(a,rr,ll);pts.append([x,yy,z])
   m.quad(f'shell.{id}.glass.{k}.{j}',pts,3)
  for side in [-1,1]:
   x0,z0=xy(a,r0,side*width/2);x1,z1=xy(a,r1,side*width/2)
   m.quad(f'shell.{id}.wall.{side}.{k}',[[x0,.15,z0],[x1,.15,z1],[x1,4.2,z1],[x0,4.2,z0]],3)
   m.beam(f'shell.{id}.sidepost.{side}.{k}',[x0,0,z0],[x0,4.2,z0],.09,2)
 for j in range(sectors+1):
  t=math.pi*j/sectors;l=-width/2*math.cos(t);y=4.2+(h-4.2)*math.sin(t)
  x0,z0=xy(a,start,l);x1,z1=xy(a,end,l)
  m.beam(f'shell.{id}.longrib.{j}',[x0,y,z0],[x1,y,z1],.054,2)
 for j in range(sectors):
  t0=math.pi*j/sectors;t1=math.pi*(j+1)/sectors
  l0=-width/2*math.cos(t0);l1=-width/2*math.cos(t1)
  h0=4.2+(h-4.2)*math.sin(t0);h1=4.2+(h-4.2)*math.sin(t1)
  x0,z0=xy(a,end,l0);x1,z1=xy(a,end,l1)
  m.quad(f'shell.{id}.endglass.{j}',[[x0,.05,z0],[x1,.05,z1],[x1,h1,z1],[x0,h0,z0]],3)

# Rounded central dome + correctly OPEN mouths of four fingers.
N=48
for i in range(N):
 a0=2*math.pi*i/N;a1=2*math.pi*(i+1)/N
 mid=180/math.pi*(a0+a1)/2
 blocked=any(abs(((mid-angle+180)%360)-180)<(18 if angle in [-38,-2,37] else 15)
             for angle in [-73,-38,-2,37,180])
 x0,z0=17*math.sin(a0),-17*math.cos(a0)
 x1,z1=17*math.sin(a1),-17*math.cos(a1)
 if not blocked:
  m.quad(f'shell.pad.wallglass.{i}',[[x0,.1,z0],[x1,.1,z1],[x1,4.1,z1],[x0,4.1,z0]],3)
  m.beam(f'shell.pad.wallpost.{i}',[x0,0,z0],[x0,4.1,z0],.11,2)
for i in range(24):
 a0=2*math.pi*i/24;a1=2*math.pi*(i+1)/24
 for j in range(6):
  t0=math.pi/2*(j/6);t1=math.pi/2*((j+1)/6)
  def p(a,t):
   r=17*math.cos(t)
   return [r*math.sin(a),4.1+7.9*math.sin(t),-r*math.cos(a)]
  p0,p1,p2,p3=p(a0,t0),p(a1,t0),p(a1,t1),p(a0,t1)
  m.quad(f'shell.pad.domeglass.{i}.{j}',[p0,p1,p2,p3],3)
  if j==0:m.beam(f'shell.pad.domebase.{i}',p0,p1,.07,2)
  m.beam(f'shell.pad.domerib.{i}.{j}',p0,p3,.08,2)

# Architectural connection to actual Agro Lobby center portal x=0,z=-8.32.
m.box('shell.entry.floor',(0,-.12,20),(6,.24,12),1)
for x in [-3,3]:
 m.quad(f'shell.entry.wallglass.{x}',[[x,.1,14],[x,.1,25],[x,5,25],[x,5,14]],3)
 for z in [14,19.5,25]:
  m.beam(f'shell.entry.post.{x}.{z}',[x,0,z],[x,5,z],.1,2)
m.box('shell.entry.glassroof',(0,5,20),(6,.08,12),3)
for z in [14,17,20,23,25]:
 m.beam(f'shell.entry.roofrib.{z}',[-3,5,z],[3,5,z],.08,2)
for x in [-3,-1.25,1.25,3]:
 m.beam(f'shell.entry.doorframe.{x}',[x,.12,25],[x,3.15,25],.09,2)
m.beam('shell.entry.doorlintel',[-1.25,3.15,25],[1.25,3.15,25],.11,2)
m.node('ground.agro.greenhouse.door-main',
 extras={'semanticAnchor':'ground.agro.greenhouse.door-main','kind':'portal','hasNoGameAuthority':True},
 xyz=[0,1.55,24])
m.node('greenhouse.zone.water.core',extras={'zoneAnchor':'G-01','gameAuthority':False},xyz=[0,0,0])
for id,a,end,width,h in branches:
 x,z=xy(a,end*.7)
 m.node(f'greenhouse.zone.{id}',extras={'zoneAnchor':id,'gameAuthority':False},xyz=[x,0,z])

OUT.parent.mkdir(parents=True,exist_ok=True)
assets={}
for name,mat_set in [
 ('greenhouse-shell.glb',set(range(5))),
 ('greenhouse-floor-shell.glb',{0,1}),
 ('greenhouse-glass-roof-shell.glb',{2,3,4})]:
 n=Model()
 n.grouped={key:group for key,group in m.grouped.items() if key in mat_set}
 if name=='greenhouse-shell.glb':
  n.node('ground.agro.greenhouse.door-main',
   extras={'semanticAnchor':'ground.agro.greenhouse.door-main','kind':'portal','hasNoGameAuthority':True},
   xyz=[0,1.55,24])
  n.node('greenhouse.zone.water.core',extras={'zoneAnchor':'G-01','gameAuthority':False},xyz=[0,0,0])
  for id,a,end,width,h in branches:
   x,z=xy(a,end*.7)
   n.node(f'greenhouse.zone.{id}',extras={'zoneAnchor':id,'gameAuthority':False},xyz=[x,0,z])
 raw=n.glb();dest=OUT.parent/name;dest.write_bytes(raw)
 assets[name]={'bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest(),
               'meshCount':len(n.meshes),'nodeCount':len(n.nodes)}
assert assets['greenhouse-shell.glb']['bytes']<2_000_000
evidence={'sceneId':'trialum.ground.agro.garden','source':'Trialum-authored stdlib source only',
 'buildOnly':True,'assetFiles':assets,'gameStateWrites':False,'plantSlotsCreated':0,
 'noProps':True,'originalLobbyPortal':'ground.agro.lobby.door-garden',
 'ownerDevicePass':False}
(OUT.parent/'asset-evidence.json').write_text(json.dumps(evidence,indent=2,ensure_ascii=False)+'\n')
print(json.dumps(evidence,indent=2,ensure_ascii=False))
