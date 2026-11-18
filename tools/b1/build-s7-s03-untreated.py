#!/usr/bin/env python3
"""Trialum S7 S03: 15 owner-render-approved modular untreated-soil GLBs.
Uses author-approved perspective-derived soil atlas, framed cream/sage shell,
metric Y-up geometry and shared global UV coordinates across parts.
No game-plant slots, no planting holes, no gameplay writes.
"""
from pathlib import Path
import hashlib, json, math, random, base64, struct, io
import numpy as np
from PIL import Image, ImageFilter
import trimesh
from trimesh.visual.material import PBRMaterial
from trimesh.visual.texture import TextureVisuals

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'assets/models';OUT.mkdir(parents=True,exist_ok=True)
SRC=ROOT/'assets/materials/s03-untreated-source.jpg.b64'
raw=base64.b64decode(''.join(SRC.read_text('ascii').split()))
print('S03 source art sha256',hashlib.sha256(raw).hexdigest())
SOIL_IMG=Image.open(io.BytesIO(raw)).convert('RGB')
SOIL_MAT=PBRMaterial(name='S03_untreated_natural_roots_stones_OWNER_RENDER',baseColorTexture=SOIL_IMG,roughnessFactor=.98,metallicFactor=0,doubleSided=False)
CREAM=PBRMaterial(name='S03_Ivory_Cream_Rim_PBR',baseColorFactor=[252,242,220,255],roughnessFactor=.64,metallicFactor=.07)
SAGE=PBRMaterial(name='S03_Sage_Green_Side_PBR',baseColorFactor=[145,163,126,255],roughnessFactor=.72,metallicFactor=.06)
METAL=PBRMaterial(name='S03_Brushed_Aluminium_Corner_PBR',baseColorFactor=[203,209,196,255],roughnessFactor=.58,metallicFactor=.24)
DARK=PBRMaterial(name='S03_Fascia_Dark_Inset_PBR',baseColorFactor=[57,64,51,255],roughnessFactor=.88,metallicFactor=.1)
GLOW=PBRMaterial(name='S03_Warm_White_Inlaid_Light_PBR',baseColorFactor=[250,229,179,255],emissiveFactor=[.72,.59,.36],roughnessFactor=.42,metallicFactor=.0)
ROCK=PBRMaterial(name='S03_Actual_Embedded_Stones_PBR',baseColorFactor=[118,110,95,255],roughnessFactor=.98,metallicFactor=0)
ROOT_MAT=PBRMaterial(name='S03_Actual_Exposed_Root_Fibers_PBR',baseColorFactor=[125,92,60,255],roughnessFactor=.99,metallicFactor=0)
HEIGHT=.135

def box(c,ext,mat):
  m=trimesh.creation.box(extents=ext)
  m.apply_translation(c)
  m.visual.material=mat
  return m

def cylinder_segment(a,b,r,mat,sections=7):
  # Fixed ring basis: unlike trimesh.creation.cylinder(segment=...), no
  # SVD-based quaternion alignment, so binary GLB SHA is stable across
  # Python/NumPy/GitHub runners and both repository workspaces.
  a=np.asarray(a,dtype=float);b=np.asarray(b,dtype=float)
  along=b-a;length=float(np.linalg.norm(along))
  if length<1e-6:return None
  axis=along/length
  ref=np.array([0.,1.,0.]) if abs(axis[1])<.9 else np.array([1.,0.,0.])
  ortho=np.cross(axis,ref);ortho/=np.linalg.norm(ortho)
  second=np.cross(axis,ortho)
  vertices=[]
  for center in (a,b):
    for j in range(sections):
      angle=math.tau*j/sections
      point=center+r*(math.cos(angle)*ortho+math.sin(angle)*second)
      vertices.append(point)
  vertices.extend((a,b));faces=[]
  for j in range(sections):
    q=(j+1)%sections
    faces.extend(((j,sections+j,q),(q,sections+j,sections+q),
                  (2*sections,q,j),(2*sections+1,sections+j,sections+q)))
  m=trimesh.Trimesh(vertices=vertices,faces=faces,process=False)
  m.fix_normals()
  assert m.is_watertight
  m.visual.material=mat
  return m

def ground_height(gx,gz):
  x=np.asarray(gx);z=np.asarray(gz)
  return .121 + .0090*np.sin(11*x+3*z)*np.cos(8*z-2*x)+.0047*np.sin(34*x+13*z)+.0032*np.sin(59*z+33*x)+.0014*np.cos(107*x-93*z)

def terrain(ax,az,w,d):
  # exact local origin -> m, global UV phase inherited from position within one original full tile
  nx=max(10,round(w*64));nz=max(10,round(d*64))
  xs=np.linspace(0,w,nx+1);zs=np.linspace(0,d,nz+1)
  XX,ZZ=np.meshgrid(xs,zs)
  YY=ground_height(ax+XX,az+ZZ)
  # consistent flat boundary only below raised frame strips
  margin=np.minimum.reduce([XX,w-XX,ZZ,d-ZZ]); fade=np.clip(margin/.023,0,1);fade=fade*fade*(3-2*fade)
  YY=.120+(YY-.120)*fade
  vertices=np.stack((XX,YY,ZZ),axis=-1).reshape(-1,3)
  uv=np.stack((ax+XX,az+ZZ),axis=-1).reshape(-1,2)
  f=[];index=lambda i,j:j*(nx+1)+i
  for j in range(nz):
   for i in range(nx):
    a,b,c,e=index(i,j),index(i+1,j),index(i,j+1),index(i+1,j+1)
    f.extend(((a,c,b),(b,c,e)))
  perimeter=[index(i,0) for i in range(nx)]+[index(nx,j) for j in range(nz)]+[index(i,nz) for i in range(nx,0,-1)]+[index(0,j) for j in range(nz,0,-1)]
  vv=list(vertices);tt=list(uv);base=len(vv)
  for p in perimeter:
    v=vertices[p];vv.append([v[0],.025,v[2]]);tt.append(uv[p])
  center=len(vv);vv.append([w*.5,.025,d*.5]);tt.append([ax+w*.5,az+d*.5])
  for j in range(len(perimeter)):
   q=(j+1)%len(perimeter)
   f.extend(((perimeter[j],perimeter[q],base+q),(perimeter[j],base+q,base+j),(center,base+q,base+j)))
  m=trimesh.Trimesh(vertices=vv,faces=f,process=False);m.fix_normals()
  if not m.is_watertight:raise ValueError('soil surface watertight failure')
  m.visual=TextureVisuals(uv=np.array(tt),material=SOIL_MAT)
  return m

def add_scene_item(scene,mesh,name):
 if mesh is not None:scene.add_geometry(mesh,node_name=name,geom_name=name)

def generate(code,description,ax,az,w,d):
 s=trimesh.Scene();add=lambda mesh,name:add_scene_item(s,mesh,name)
 # structural genuinely solid soil bed, cream protective outer lip, sage fascia
 add(box((w/2,.042,d/2),[w,.084,d],SAGE),'S03_Frame_Sage_Solid_Bottom')
 add(box((w/2,.020,d/2),[w-.02,.032,d-.02],DARK),'S03_Frame_Recessed_Bottom')
 add(terrain(ax,az,w,d),'S03_Physical_Untreated_Soil_Top_RealRelief')
 # rim and fascia: perimeter frame built from four geometrically independent pieces
 border=min(.017,w*.115,d*.115)
 for side in ('N','S'):
  z=d-border/2 if side=='N' else border/2
  add(box((w/2,.132,z),[w,.025,border],CREAM),f'S03_Cream_Rim_{side}')
  add(box((w/2,.070,z),[w,.050,.009],METAL),f'S03_Fascia_Metal_{side}')
 for side in ('E','W'):
  x=w-border/2 if side=='E' else border/2
  add(box((x,.132,d/2),[border,.025,d],CREAM),f'S03_Cream_Rim_{side}')
  add(box((x,.070,d/2),[.009,.050,d],METAL),f'S03_Fascia_Metal_{side}')
 # cream/sage outer strip on every side and warm pale-cream inset lights (not neon)
 for side in ('N','S'):
  z=d-.006 if side=='N' else .006
  if w>.28:
   add(box((w/2,.072,z),[w*.51,.016,.004],DARK),f'S03_Fascia_MatteVent_{side}')
   add(box((w/2,.073,z+(.002 if side=='N' else -.002)),[min(w*.19,.2),.007,.003],GLOW),f'S03_White_AccessLight_{side}')
 for side in ('E','W'):
  x=w-.006 if side=='E' else .006
  if d>.28:
   add(box((x,.072,d/2),[.004,.016,d*.45],DARK),f'S03_Fascia_MatteVent_{side}')
   add(box((x+(.002 if side=='E' else -.002),.073,d/2),[.003,.007,min(d*.17,.20)],GLOW),f'S03_White_AccessLight_{side}')
 # Corner caps from render: cream, rounded implied via discrete small silver panel bevel
 cap=min(.038,w*.18,d*.18)
 for i,x in enumerate((cap/2,w-cap/2)):
  for j,z in enumerate((cap/2,d-cap/2)):
   add(box((x,.128,z),[cap,.025,cap],CREAM),f'S03_Cream_Protective_Corner_{i}_{j}')
   add(box((x,.145,z),[cap*.5,.008,cap*.5],SAGE),f'S03_Sage_Corner_Inset_{i}_{j}')
 # Physical stone/clods in addition to source-derived texture. Stable global positions.
 rng=random.Random(2071803)
 features=[]
 for k in range(140):
  gx=rng.uniform(.018,.982);gz=rng.uniform(.018,.982)
  radius=rng.uniform(.004,.020)
  features.append((gx,gz,radius,k))
 for gx,gz,r,k in features:
  lx,lz=gx-ax,gz-az
  if lx<border+r or lx>w-border-r or lz<border+r or lz>d-border-r:continue
  if (k%4)!=0:continue
  stone=trimesh.creation.icosphere(subdivisions=1,radius=1)
  stone.apply_scale([r,r*.48,r*.72])
  stone.apply_translation([lx,float(ground_height(gx,gz))+.001,lz]);stone.visual.material=ROCK
  add(stone,f'S03_Embedded_Stone_{k:03d}')
 # genuine root geometry on soil top, sparse and low, never a planted/rooted crop
 for idx in range(13):
  a=(idx+1)*.073
  gx=.08+(.74*((math.sin(97*a)*.5+.5)))
  gz=.08+(.74*((math.cos(73*a)*.5+.5)))
  points=[]
  for i in range(4):
   X=gx+(i-1.5)*.023;Z=gz+.011*math.sin(i*1.9+idx)
   if X<ax+border+.018 or X>ax+w-border-.018 or Z<az+border+.018 or Z>az+d-border-.018:
    points=[];break
   points.append((X-ax,float(ground_height(X,Z))+.0035,Z-az))
  for t in range(len(points)-1):
   add(cylinder_segment(points[t],points[t+1],.0015,ROOT_MAT,sections=6),f'S03_Visible_Surface_Root_{idx}_{t}')
 # All assets independent. No game events or plant slots.
 exported=s.export(file_type='glb')
 # embed immutable canonical asset identification into glTF JSON for programmatic audit
 jlen=struct.unpack_from('<I',exported,12)[0];doc=json.loads(exported[20:20+jlen]);ptr=20+jlen
 assert exported[ptr+4:ptr+8]==b'BIN\0';bin_chunk=exported[ptr:]
 doc['asset'].setdefault('extras',{})['trialum']={'canonicalSoilState':'S03','untreated':True,'plantingHoles':0,'plantSlotsGranted':0,'gameplayWrites':0,'dimensions':[w,.153,d],'origin':'local lower-left bottom','sourceAtlasSHA256':hashlib.sha256(raw).hexdigest(),'fullTileUVOrigin':[ax,az],'ownerConceptRenderPass':True,'ownerPhysicalGLBPass':False,'assetId':code}
 encoded=json.dumps(doc,separators=(',',':'),ensure_ascii=False).encode();encoded+=b' ' * (-len(encoded)%4)
 payload=struct.pack('<I4s',len(encoded),b'JSON')+encoded+bin_chunk
 output=b'glTF'+struct.pack('<II',2,12+len(payload))+payload
 assert struct.unpack_from('<I',output,8)[0]==len(output)
 filename=f's03-untreated-{code}.glb'
 (OUT/filename).write_bytes(output)
 triangles=sum(len(m.faces) for m in s.geometry.values())
 return {'file':filename,'id':f's03-untreated-{code}','family':description,'widthMeters':w,'depthMeters':d,'heightMeters':.153,'textureAtlasOffset':[ax,az],'bytes':len(output),'sha256':hashlib.sha256(output).hexdigest(),'meshes':len(s.geometry),'triangles':triangles,'ownerRenderPass':True,'ownerGLBPass':False,'gameplayWrites':0,'hasPhysicalStonesAndRoots':True,'hasPlantingHoles':False}

MODELS=[
 ('full','A full tile',0,0,1,1),
 ('half-west','B1 west half',0,0,.5,1),('half-east','B2 east half',.5,0,.5,1),
 ('quarter-nw','C1 NW quarter',0,.5,.5,.5),('quarter-ne','C2 NE quarter',.5,.5,.5,.5),
 ('quarter-sw','C3 SW quarter',0,0,.5,.5),('quarter-se','C4 SE quarter',.5,0,.5,.5),
 ('edge-north','D1 north border',0,.8,1,.2),('edge-south','D2 south border',0,0,1,.2),
 ('edge-east','D3 east border',.8,0,.2,1),('edge-west','D4 west border',0,0,.2,1),
 ('corner-nw','E1 NW corner',0,.8,.2,.2),('corner-ne','E2 NE corner',.8,.8,.2,.2),
 ('corner-se','E3 SE corner',.8,0,.2,.2),('corner-sw','E4 SW corner',0,0,.2,.2),
]
manifest={'schemaVersion':1,'family':'S03 canonical untreated compacted soil','ownerReference':['S03_A_B_C_3D_GROUP_RENDER.png','S03_D_E_3D_GROUP_RENDER.png'],'sourceAtlasFile':'s03-untreated-source.jpg.b64','sourceAtlasSha256':hashlib.sha256(raw).hexdigest(),'originalSource':'s03_concept_texture_from_render.png','modelCount':15,'gameplayWrites':0,'canonicalPlantSlotsPerBed':5,'sourceOfTruth':'existing Trialum engine','approvedConceptRender':True,'ownerGLBReviewPending':True,'models':[]}
for item in MODELS:
 m=generate(*item);manifest['models'].append(m);print('built',m['file'],m['bytes'],'tris',m['triangles'])
(ROOT/'assets/materials/s03-untreated-15-glb-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
print('PASS 15 standalone physical S03 GLBs, bytes',sum(m['bytes'] for m in manifest['models']))
