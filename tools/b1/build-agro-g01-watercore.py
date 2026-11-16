#!/usr/bin/env python3
"""Trialum S7.3 G-01 first water-core GLB module candidates.
Generate real original glTF2 geometry, not images. NEVER modify live game state.
All output goes to build/g01-watercore/ (review only; NOT Android assets).
Based on existing deterministic Trialum original stdlib GLB Model writer.
"""
from __future__ import annotations
import runpy, math, json, hashlib
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
Model=runpy.run_path(str(ROOT/"tools/b1/build-agro-greenhouse.py"))["Model"]
OUT=ROOT/"build/g01-watercore"
OUT.mkdir(parents=True,exist_ok=True)
TAU=math.tau
P = [( -2.7,-2.0),( 2.7,-2.0),(-2.7,2.0),(2.7,2.0)]
SMALL=[(-10.,0.,2.1),(10.,1.,2.1),(0.,-11.,2.0)]

def new_model():
 m=Model()
 # Existing materials: 0 foundation 1 floor 2 metal 3 glass 4 edge
 m.materials.append({"name":"g01-turquoise-water","pbrMetallicRoughness":{
   "baseColorFactor":[.05,.72,.76,.76],"metallicFactor":.01,"roughnessFactor":.075},
   "alphaMode":"BLEND","doubleSided":True,"emissiveFactor":[.01,.1,.11]})
 m.materials.append({"name":"g01-dark-basin-stone","pbrMetallicRoughness":{
   "baseColorFactor":[.14,.23,.26,1],"metallicFactor":.06,"roughnessFactor":.72},
   "doubleSided":True})
 m.materials.append({"name":"g01-soft-glow","pbrMetallicRoughness":{
   "baseColorFactor":[.24,.83,.78,1],"metallicFactor":.25,"roughnessFactor":.26},
   "emissiveFactor":[.04,.3,.28],"doubleSided":True})
 return m

def ring(m,name,x,z,ri,ro,y0,y1,mat,segments=72):
 # Closed ring shell: upper/lower annulus and inner/outer wall
 vs=[]
 for y in (y0,y1):
  for r in (ri,ro):
   for i in range(segments):
    a=TAU*i/segments
    vs.append([x+math.cos(a)*r,y,z+math.sin(a)*r])
 fs=[]
 for i in range(segments):
  j=(i+1)%segments
  # bottom interior to outside
  fs.extend([(i,segments+i,segments+j),(i,segments+j,j)])
  # top
  ii=2*segments+i;jj=2*segments+j;oi=3*segments+i;oj=3*segments+j
  fs.extend([(ii,oj,oi),(ii,jj,oj)])
  # inside wall
  fs.extend([(i,j,2*segments+j),(i,2*segments+j,2*segments+i)])
  # outside wall
  os=segments+i;oe=segments+j;top=3*segments+i;topj=3*segments+j
  fs.extend([(os,top,topj),(os,topj,oe)])
 m.geom(vs,fs,mat,name)

def disk(m,name,x,z,r,y,mat,n=64):
 verts=[[x,y,z]]
 for i in range(n):
  a=TAU*i/n;verts.append([x+r*math.cos(a),y,z+r*math.sin(a)])
 m.geom(verts,[(0,i+1,(i+1)%n+1) for i in range(n)],mat,name)

def circle_beams(m,name,x,z,r,y,mat,thickness=.055,n=48):
 for i in range(n):
  a=TAU*i/n;b=TAU*(i+1)/n
  m.beam(name,[x+r*math.cos(a),y,z+r*math.sin(a)],
        [x+r*math.cos(b),y,z+r*math.sin(b)],thickness,mat,6)

def basin(m,name,x,z,r):
 # Currently IN GROUND. Installation must cut matching openings into existing shell floor.
 disk(m,name+".bottom",x,z,r-.12,-1.04,6)
 ring(m,name+".containment",x,z,r-.32,r+.14,-1.03,.10,6)
 ring(m,name+".rim",x,z,r-.40,r+.38,.02,.16,2)
 ring(m,name+".light-ring",x,z,r-.28,r-.18,.09,.135,7)
 disk(m,name+".water",x,z,r-.42,-.23,5)
 m.node(name+".planned-station",xyz=[x,0,z],
        extras={"designOnly":True,"notGameplay":True,"waterStage":"G-01"})

def stairs(m,name,x,z,w,h,steps=7):
 for i in range(steps):
  m.box(name,[x,(-.13+i*.07),z+(i-steps/2)*.35],[w,.12,.31],1)

def rail(m,name,x,z,r,opens=None,high=1.0):
 opens=opens or []
 n=64
 for i in range(n):
  a=TAU*i/n;b=TAU*(i+1)/n
  mid=(a+b)/2
  if any(abs((mid-v+math.pi)%TAU-math.pi)<width for v,width in opens):continue
  p1=[x+r*math.cos(a),.3,z+r*math.sin(a)]
  p2=[x+r*math.cos(b),.3,z+r*math.sin(b)]
  top=[p1[0],high+.3,p1[2]],top2=[p2[0],high+.3,p2[2]]
  m.beam(name+".upper",top,top2,.045,2,6)
  if i%4==0:m.beam(name+".post",p1,top,.045,2,6)
  m.beam(name+".lower",[p1[0],.65,p1[2]],[p2[0],.65,p2[2]],.027,2,6)

def write(name,m,metadata):
 raw=m.glb()
 assert raw[:4]==b"glTF" and len(raw)<2_000_000
 target=OUT/name
 target.write_bytes(raw)
 return {"file":name,"bytes":len(raw),"sha256":hashlib.sha256(raw).hexdigest(),
         "designOnly":True,"installInGame":False,"plantSlotsCreated":0,
         "meshCount":len(m.meshes),"metadata":metadata}

ledger=[]

# 1. CENTRAL BELOW-GRADE BASIN: clear four REAL existing aquatic slot reservations.
m=new_model();basin(m,"g01.main",0,0,6.7)
for i,(x,z) in enumerate(P,1):
 # Empty holding baskets: four canonical aquatic reservation slots, NO PLANTS.
 ring(m,f"g01.aquatic.slot-{i}.basket",x,z,.61,.84,-.75,-.28,2,32)
 ring(m,f"g01.aquatic.slot-{i}.bright-edge",x,z,.72,.82,-.33,-.30,7,32)
 m.node(f"aquatic-slot-{i}",xyz=[x,-.22,z],extras={
  "plannedEngineSlotId":f"aquatic-slot-{i}","stagedOnly":True,"noPlantSpawn":True})
ledger.append(write("g01-main-basin.glb",m,{"mainRadiusM":6.7,"slotsReserved":4}))

# 2. SATELLITE BASINS: three basins, zero new playable slots.
m=new_model()
for j,(x,z,r) in enumerate(SMALL,1):basin(m,f"g01.satellite-{j}",x,z,r)
ledger.append(write("g01-satellite-basins.glb",m,{"satelliteBasins":3,"additionalAquaticSlots":0}))

# 3. PERIMETER RAILING & WALKWAY — circular protected basin, no extra plants.
m=new_model()
ring(m,"g01.walkway.plan",0,0,7.2,9.15,.07,.12,1)
rail(m,"g01.main.rail",0,0,7.1,opens=[(math.pi/2,.13),(math.pi*1.5,.13)])
for j,(x,z,r) in enumerate(SMALL,1):
 rail(m,f"g01.small{j}.rail",x,z,r+.53,high=.9)
ledger.append(write("g01-walkway-and-railings.glb",m,{"walkwayOuterRadiusM":9.15,"walkwayInnerRadiusM":7.2}))

# 4. BRIDGE from right to left above the water, including safety guards.
m=new_model()
m.box("g01.bridge.deck",(0,.53,0),(14.8,.22,1.85),1)
for z in [-.93,.93]:
 for x in [i*1.85-7.4 for i in range(9)]:
  m.beam("g01.bridge.post",[x,.58,z],[x,1.65,z],.054,2)
 m.beam("g01.bridge.handrail",[-7.4,1.65,z],[7.4,1.65,z],.055,2)
 m.beam("g01.bridge.lowerrail",[-7.4,1.0,z],[7.4,1.0,z],.033,2)
stairs(m,"g01.bridge.left.access",-7.7,0,1.9,.5)
stairs(m,"g01.bridge.right.access",7.7,0,1.9,.5)
ledger.append(write("g01-crossing-bridge.glb",m,{"deckHeightM":.53,"isDecorative":False,"isPhysicsLive":False}))

# 5. TWO SERVICE PUMP/FILTER STATIONS, visual-only (NOT token economy).
m=new_model()
for j,x in enumerate([-12.4,12.4],1):
 z=2.5
 m.box(f"g01.pump{j}.base",(x,.3,z),(1.65,.55,1.5),2)
 m.cyl(f"g01.pump{j}.housing",(x,1.25,z),.57,1.45,2,16)
 m.cyl(f"g01.pump{j}.filter",(x+1.3,1.1,z),.38,1.5,4,14)
 for i in range(2):
  zz=z+(i-.5)*.3
  m.beam(f"g01.pump{j}.line",[x,.7,zz],[x,1.1,zz+1.1],.065,2)
  m.beam(f"g01.pump{j}.outlet",[x,1.1,zz+1.1],[x*.6,1.,zz+1.4],.075,2)
 m.box(f"g01.pump{j}.status-panel",(x,1.3,z-.62),(.85,.40,.12),7)
 m.node(f"g01.pump{j}.future-control",xyz=[x,1.3,z-.62],
        extras={"planned":True,"noCurrencyWrites":True,"notConnectedToEngine":True})
ledger.append(write("g01-visual-service-pumps.glb",m,{"pumps":2,"currencyWrites":False}))

result={"design":"G-01 central water core","version":"1.0-candidate",
 "coordinateFrame":"trialum.ground.agro.garden: X right, Y up, -Z toward greenhouse fingers",
 "ownerVisualPass":False,"gameplayImplementation":False,
 "containsAquaticPlants":False,"actualAquaticSlots":4,
 "satelliteBasinsAdditionalSlots":0,"mainBasinBelowGrade":True,
 "requiredBeforeSceneInstallation":["owner approval of render and G01 modules",
  "cut floor openings in original S7 empty GLB shell at basin positions",
  "coordinate/check physical railings, bridge and camera/collision",
  "place modules without replacing original game state"],
 "source":"original Trialum GLB geometry, generated using pinned existing stdlib GLB builder",
 "assets":ledger}
(OUT/"G01-REVIEW-MANIFEST.json").write_text(json.dumps(result,indent=2,ensure_ascii=False)+"\n")
print(json.dumps({"output":str(OUT),"assets":ledger},indent=2,ensure_ascii=False))
