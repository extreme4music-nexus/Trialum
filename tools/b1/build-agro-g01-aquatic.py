#!/usr/bin/env python3
"""G01 original water animation + Aquaglow canonical aquatic plant stage GLBs.
Review only: produces build/g01-aquatic-review/, NOT APK assets, no gameplay writes.
"""
import json,struct,math,pathlib,hashlib,runpy
ROOT=pathlib.Path(__file__).resolve().parents[2]
OUT=ROOT/"build/g01-aquatic-review";OUT.mkdir(parents=True,exist_ok=True)
Model=runpy.run_path(str(ROOT/"tools/b1/build-agro-greenhouse.py"))["Model"]
TAU=2*math.pi
STAGES=[("sprout",3,19,2,.27,.12,0),("young",20,49,4,.65,.20,0),
 ("growing",50,84,7,1.03,.29,1),("mature",85,100,10,1.54,.39,3)]
POOLS=[("main",0,0,6.27),("satellite-1",-10,0,1.69),
 ("satellite-2",10,1,1.69),("satellite-3",0,-11,1.59)]
def mat(name,rgb,a=1,rough=.42,glow=None):
 m={"name":name,"pbrMetallicRoughness":{
  "baseColorFactor":[*rgb,a],"roughnessFactor":rough,"metallicFactor":.04},
  "doubleSided":True}
 if a<1:m["alphaMode"]="BLEND"
 if glow:m["emissiveFactor"]=glow
 return m
def leaf(m,angle,height,width,dead=False):
 n=10;vs=[];q=math.pi/2+angle
 for k in range(n+1):
  t=k/n;w=width*math.sin(math.pi*t)**.85
  r=.14+(height*.48)*t
  yy=.12+height*(.35+.52*t)-(height*.38*t*t if dead else 0)
  for side in (-1,1):
   vs.append([r*math.cos(angle)-side*w*math.sin(angle),
              yy+.04*w*side,
              r*math.sin(angle)+side*w*math.cos(angle)])
 faces=[]
 for k in range(n):
  a=k*2;faces.extend([(a,a+2,a+1),(a+1,a+2,a+3)])
 m.geom(vs,faces,10 if dead else 5,"aquaglow.leaf")
 if not dead:
  m.beam("leaf.vein",[0,.15,0],vs[-2],.013,6,6)
def plant(stage,n,h,w,flowers,dead=False,weak=False):
 m=Model();m.materials.extend([
  mat("aquaglow-cyan-leaves",(.08,.78,.65),.86,glow=(.04,.20,.12)), # 5
  mat("aquaglow-veins",(.44,.98,.86),glow=(.12,.38,.23)),         # 6
  mat("aquaglow-rhizome",(.28,.40,.26),rough=.9),                  # 7
  mat("aquaglow-heart",(.4,.98,.79),glow=(.23,.42,.3)),            # 8
  mat("aquaglow-bloom",(.73,.38,.94),glow=(.35,.07,.35)),          # 9
  mat("aquaglow-withered",(.38,.29,.2),rough=.84)])               # 10
 m.cyl("aquaglow.rhizome",(0,.08,0),.14,.15,7,12)
 for j in range(7):
  a=TAU*j/7
  m.beam("aquaglow.root",[.04*math.cos(a),.04,.04*math.sin(a)],
    [.24*math.cos(a),-.24,.24*math.sin(a)],.022,7,6)
 for i in range(n):
  a=TAU*i/n+.13*(i%3)
  top=(.45 if dead else .75 if weak else 1)*h
  m.beam("aquaglow.stem",[0,.08,0],
   [.20*math.cos(a),top*.68,.20*math.sin(a)],.028,7,6)
  leaf(m,a,top,w*(.82+.11*(i%4)),dead)
 if not dead:
  m.cyl("aquaglow.luminous-core",(0,h*.45,0),.12,.21,8,12)
  for j in range(flowers):
   a=TAU*j/max(1,flowers)
   x=.16*math.cos(a);z=.16*math.sin(a);y=.65*h
   m.beam("flower.stem",[0,.3,0],[x,y,z],.022,7,6)
   m.cyl("flower.heart",(x,y,z),.065,.12,9,12)
   for k in range(6):
    a2=TAU*k/6
    m.beam("flower.petal",[x,y,z],[x+.17*math.cos(a2),y+.12,z+.17*math.sin(a2)],.024,8,6)
 m.node("aquaglow.root-anchor",xyz=[0,0,0],extras={
  "speciesId":"aquaglow","canonicalBedId":"aquarium",
  "variant":stage,"renderOnly":True,"gameStateWrites":False})
 return m.glb()
class Water:
 def __init__(self):
  self.bin=bytearray();self.views=[];self.accessors=[];self.meshes=[];self.nodes=[]
 def acc(self,data,fmt,comp,typ,dim,target=None,limits=False):
  while len(self.bin)%4:self.bin.append(0)
  b=struct.pack("<"+fmt*len(data),*data);off=len(self.bin);self.bin.extend(b)
  bv={"buffer":0,"byteOffset":off,"byteLength":len(b)}
  if target:bv["target"]=target
  self.views.append(bv)
  acc={"bufferView":len(self.views)-1,"componentType":comp,
   "count":len(data)//dim,"type":typ}
  if limits:acc["min"]=[min(data[i::dim]) for i in range(dim)];acc["max"]=[max(data[i::dim]) for i in range(dim)]
  self.accessors.append(acc);return len(self.accessors)-1
 def pool(self,name,cx,cz,r):
  n=48 if name=="main" else 28;nr=10 if name=="main" else 6
  verts=[[cx,-.235,cz]];uv=[[.5,.5]];rings=[]
  for j in range(1,nr+1):
   ring=[]
   for i in range(n):
    a=TAU*i/n;rho=r*j/nr;ring.append(len(verts))
    verts.append([cx+rho*math.cos(a),-.235,cz+rho*math.sin(a)])
    uv.append([.5+.5*rho/r*math.cos(a),.5+.5*rho/r*math.sin(a)])
   rings.append(ring)
  tris=[(0,rings[0][i],rings[0][(i+1)%n]) for i in range(n)]
  for j in range(nr-1):
   for i in range(n):
    a=rings[j][i];b=rings[j][(i+1)%n]
    c=rings[j+1][i];d=rings[j+1][(i+1)%n]
    tris.extend([(a,c,d),(a,d,b)])
  pos=[v for p in verts for v in p]
  norm=[v for _ in verts for v in (0.,1.,0.)]
  uvdata=[v for p in uv for v in p]
  morph=[]
  for phase in (0,1.55):
   v=[]
   for x,y,z in verts:
    rho=math.hypot(x-cx,z-cz);angle=math.atan2(z-cz,x-cx)
    envelope=math.sin(math.pi*min(1.,rho/r))**.5
    v.extend((0.,.048*envelope*math.sin(5.1*rho+1.3*math.sin(4*angle+phase)+phase),0.))
   morph.append(v)
  a=self.acc(pos,"f",5126,"VEC3",3,34962,True)
  b=self.acc(norm,"f",5126,"VEC3",3,34962)
  c=self.acc(uvdata,"f",5126,"VEC2",2,34962)
  d=self.acc(morph[0],"f",5126,"VEC3",3,34962)
  e=self.acc(morph[1],"f",5126,"VEC3",3,34962)
  ids=[k for t in tris for k in (t[0],t[2],t[1])]
  idx=self.acc(ids,"H",5123,"SCALAR",1,34963)
  self.meshes.append({"name":"G01."+name+".water","weights":[0.,0.],
    "extras":{"targetNames":["waveA","waveB"]},
    "primitives":[{"attributes":{"POSITION":a,"NORMAL":b,"TEXCOORD_0":c},
      "targets":[{"POSITION":d},{"POSITION":e}],"indices":idx,"mode":4,"material":0}]})
  self.nodes.append({"name":"G01."+name+".animated-water-surface","mesh":len(self.meshes)-1,
   "extras":{"renderOnly":True,"water":True,"extraAquaticSlots":0}})
 def glb(self):
  t=self.acc([0.,1.2,2.4,3.6,4.8,6.],"f",5126,"SCALAR",1,limits=True)
  w=self.acc([0.,0.,1.,0.,.55,.65,0.,1.,.75,.5,0.,0.],"f",5126,"SCALAR",1)
  gltf={"asset":{"version":"2.0","generator":"Trialum native G01 original water morph animation"},
   "scene":0,"scenes":[{"nodes":list(range(len(self.nodes)))}],
   "nodes":self.nodes,"meshes":self.meshes,"materials":[mat("G01 water",(.06,.52,.67),.75,.09,(.02,.08,.10))],
   "buffers":[{"byteLength":len(self.bin)}],"bufferViews":self.views,"accessors":self.accessors,
   "animations":[{"name":"G01_WATER_RIPPLES_LOOP_6S",
    "samplers":[{"input":t,"output":w,"interpolation":"LINEAR"}],
    "channels":[{"sampler":0,"target":{"node":i,"path":"weights"}} for i in range(len(self.nodes))]}]}
  j=json.dumps(gltf,separators=(",",":")).encode();j+=b" "*(-len(j)%4)
  binary=bytes(self.bin);binary+=b"\0"*(-len(binary)%4)
  return struct.pack("<III",0x46546c67,2,12+8+len(j)+8+len(binary))+struct.pack("<II",len(j),0x4e4f534a)+j+struct.pack("<II",len(binary),0x004e4942)+binary
records=[]
def save(file,raw,kind,extras):
 assert raw[:4]==b"glTF" and struct.unpack_from("<I",raw,8)[0]==len(raw)
 assert len(raw)<2_000_000
 (OUT/file).write_bytes(raw)
 records.append({"file":file,"kind":kind,"bytes":len(raw),
  "sha256":hashlib.sha256(raw).hexdigest(),"installedInGame":False,"meta":extras})
water=Water()
for args in POOLS:water.pool(*args)
save("g01-water-surfaces-animated.glb",water.glb(),"animated-water",
 {"animation":"G01_WATER_RIPPLES_LOOP_6S","durationS":6,"morphTargets":2,"surfaces":4})
for stage,lo,hi,n,h,w,blooms in STAGES:
 save("aquaglow-"+stage+".glb",plant(stage,n,h,w,blooms),"aquatic-growth-stage",
  {"speciesId":"aquaglow","medium":"aquatic","bedId":"aquarium","growthMin":lo,"growthMax":hi})
for variant in ("weakened","dead"):
 save("aquaglow-"+variant+".glb",plant(variant,7,1.03,.25,0,variant=="dead",variant=="weakened"),
   "aquatic-health-override",{"speciesId":"aquaglow","status":variant})
manifest={"version":"S7-G01-AQUATIC-v1","sourceOfTruth":"js/plant-lifecycle.js",
 "canonicalSpecies":{"id":"aquaglow","nameMk":"Аквалум","medium":"aquatic",
 "researchTier":3,"bedId":"aquarium"},
 "realAquaticSlots":4,"additionalPlantSlots":0,"visualOnly":True,
 "stageRanges":[{"id":id,"min":lo,"max":hi} for id,lo,hi,*_ in STAGES],
 "healthPriority":"dead -> dead; health<40 -> weakened; otherwise growth stage",
 "plantFields":["id","species","bedId","medium","growth","health","hydration","dead"],
 "waterAnimationClip":"G01_WATER_RIPPLES_LOOP_6S","animationDurationSeconds":6,
 "ownerVisualPass":False,"installedInAPK":False,
 "limitations":["Only one canonical aquatic species currently exists.",
 "Animated GLB ripples are genuine morph-target animation; realistic light caustics/refraction require later scene shader.",
 "Do not install water/plant models into the accepted EMPTY shell before owner review.",
 "Below-grade basin requires physical floor cutouts and visual blending.",
 "World simulation runs in original engine, never in water/plant GLB."],
 "assets":records}
(OUT/"G01-AQUATIC-ANIMATION-MANIFEST.json").write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+"\n")
print(json.dumps({"assetCount":len(records),"totalBytes":sum(x["bytes"] for x in records),"files":[x["file"] for x in records]},indent=2,ensure_ascii=False))
