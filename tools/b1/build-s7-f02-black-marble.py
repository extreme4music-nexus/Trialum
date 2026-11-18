#!/usr/bin/env python3
"""F02 owner-approved black marble, 29 genuine GLB shapes. Source-derived atlas.
15 A-E F01-compatible modules, F and G pool modules, H/I finishes,
plus 8 larger L-corners/raised-borders explicitly shown in owner's renders.
Do NOT install into game, change F01 files, or claim anti-slip certification.
"""
from __future__ import annotations
import base64,hashlib,json,math,runpy,struct,zlib
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/"build/s7-floor-f02"
ATLAS=ROOT/"assets/materials/f02-black-marble-approved-render-atlas.b64"
OUT.mkdir(parents=True,exist_ok=True)
def part(name):return runpy.run_path(str(ROOT/"tools/b1"/name))
F=part("build-s7-f01-marble.py")
B=part("build-s7-f01-half.py")
C=part("build-s7-f01-quarter.py")
D=part("build-s7-f01-edge.py")
E=part("build-s7-f01-corner.py")
G=part("build-s7-f01-g-pool-trim.py")
W=part("build-s7-f01-radial-wedge.py")
HI=part("build-s7-f01-h-i-marble-finishes.py")
def png(w,h,pix):
 def chunk(k,raw):return struct.pack(">I",len(raw))+k+raw+struct.pack(">I",zlib.crc32(k+raw)&0xffffffff)
 scan=b"".join(b"\0"+pix[i*w*4:(i+1)*w*4] for i in range(h))
 return b"\x89PNG\r\n\x1a\n"+chunk(b"IHDR",struct.pack(">IIBBBBB",w,h,8,6,0,0,0))+chunk(b"IDAT",zlib.compress(scan,7))+chunk(b"IEND",b"")
def texture():
 src=zlib.decompress(base64.b64decode(ATLAS.read_text().strip()))
 assert len(src)==128*128 and max(src)<=19
 w=512;pixels=bytearray()
 for y in range(w):
  fy=y*127/(w-1);iy=int(fy);y2=min(127,iy+1);ty=fy-iy
  for x in range(w):
   fx=x*127/(w-1);ix=int(fx);x2=min(127,ix+1);tx=fx-ix
   gray=max(7,min(246,int(255*((1-tx)*(1-ty)*src[128*iy+ix]+tx*(1-ty)*src[128*iy+x2]+(1-tx)*ty*src[128*y2+ix]+tx*ty*src[128*y2+x2])/19)))
   pixels.extend((gray,int(gray*.992),gray,255))
 return png(w,w,bytes(pixels))
def box(w=1,d=1,h=.06,bevel=.004):
 m=F["Mesh"]();q=lambda x,y,z:(x,y,z)
 a=[q(bevel,h,bevel),q(w-bevel,h,bevel),q(w-bevel,h,d-bevel),q(bevel,h,d-bevel)]
 b=[q(0,h-bevel,0),q(w,h-bevel,0),q(w,h-bevel,d),q(0,h-bevel,d)]
 c=[q(0,0,0),q(w,0,0),q(w,0,d),q(0,0,d)]
 m.quad(a,(0,1,0))
 for i in range(4):
  j=(i+1)%4;dx=b[j][0]-b[i][0];dz=b[j][2]-b[i][2];l=math.hypot(dx,dz);nx,nz=dz/l,-dx/l
  m.quad([a[i],a[j],b[j],b[i]],(nx*.70710678,.70710678,nz*.70710678))
  m.quad([b[i],b[j],c[j],c[i]],(nx,0,nz))
 m.quad(c,(0,-1,0))
 return m
def l_corner(corner):
 m=F["Mesh"]();w=.25;b=.008;h=.135
 shp=[(0,0),(1,0),(1,w),(w,w),(w,1),(0,1)]
 top=[(b,b),(1-b,b),(1-b,w-b),(w-b,w-b),(w-b,1-b),(b,1-b)]
 p=lambda x,y:(x[0],y,x[1])
 m.quad([p(q,h) for q in [top[0],top[1],top[2],(b,w-b)]],(0,1,0))
 m.quad([p(q,h) for q in [(b,w-b),top[3],top[4],top[5]]],(0,1,0))
 m.quad([p(q,0) for q in [(0,0),(1,0),(1,w),(0,w)]],(0,-1,0))
 m.quad([p(q,0) for q in [(0,w),(w,w),(w,1),(0,1)]],(0,-1,0))
 for i in range(6):
  j=(i+1)%6;aa,bb=shp[i],shp[j];dx=bb[0]-aa[0];dz=bb[1]-aa[1];l=math.hypot(dx,dz);nx,nz=dz/l,-dx/l
  m.quad([p(top[i],h),p(top[j],h),p(bb,h-b),p(aa,h-b)],(nx*.70710678,.70710678,nz*.70710678))
  m.quad([p(aa,h-b),p(bb,h-b),p(bb,0),p(aa,0)],(nx,0,nz))
 turns={"north-west":0,"north-east":1,"south-east":2,"south-west":3}[corner]
 for i in range(0,len(m.pos),3):
  x,y,z=m.pos[i:i+3]
  for _ in range(turns):x,z=1-z,x
  m.pos[i:i+3]=[x,y,z]
 for i in range(0,len(m.norm),3):
  x,y,z=m.norm[i:i+3]
  for _ in range(turns):x,z=-z,x
  m.norm[i:i+3]=[x,y,z]
 return m
def retag(raw,name,module,rough,extra):
 n,typ=struct.unpack_from("<I4s",raw,12);assert typ==b"JSON"
 obj=json.loads(raw[20:20+n])
 offset=20+n;size,tag=struct.unpack_from("<I4s",raw,offset);assert tag==b"BIN\0"
 binary=raw[offset+8:offset+8+size]
 mat=obj["materials"][0];mat["name"]="F02 genuine midnight-black mineral marble | white calcite veins"
 mat["pbrMetallicRoughness"]["metallicFactor"]=0
 mat["pbrMetallicRoughness"]["roughnessFactor"]=rough
 if module not in ("F02-H","F02-I"):
  mat["extensions"]={"KHR_materials_clearcoat":{"clearcoatFactor":.58,"clearcoatRoughnessFactor":.19}}
  obj["extensionsUsed"]=["KHR_materials_clearcoat"]
 else:obj["extensionsUsed"]=[]
 obj["asset"]["generator"]="Trialum F02 / source-derived user-approved black marble render"
 obj["scenes"][0]["name"]=name;obj["nodes"][0]["name"]=name
 obj["nodes"][0]["extras"]={"assetId":name,"module":module,"family":"F02",
  "ownerRenderApproval":True,"ownerGlbModelPass":False,"gameplayWrites":0,"inGame":False,
  "originalReference":"approved glossy black tile with white and silver veins",
  "referenceImageDerivation":"corrected top-face perspective extracted from user-approved 3D render",**(extra or {})}
 obj["meshes"][0]["name"]=name+".solid-mesh"
 obj["images"][0]["name"]="F02 reference top: authentic deep black silver-white mineral pattern"
 js=json.dumps(obj,ensure_ascii=False,separators=(",",":")).encode("utf8")
 js+=b" "*(-len(js)%4)
 result=b"glTF"+struct.pack("<II",2,12+8+len(js)+8+len(binary))+struct.pack("<I4s",len(js),b"JSON")+js+struct.pack("<I4s",len(binary),b"BIN\0")+binary
 assert struct.unpack_from("<II",result,4)==(2,len(result))
 return result
def build():
 tex=texture();(OUT/"f02-black-marble-exact-reference-atlas.png").write_bytes(tex)
 data=[]
 def emit(name,mode,mesh,rough=.23,extra=None,normal=False):
  raw=F["build_glb"](mesh,tex)
  if normal:raw=HI["retag_and_attach_normal"](raw,HI["grain_png"](mode[-1]),mode[-1])
  raw=retag(raw,name,mode,rough,extra)
  target=OUT/(name+".glb");target.write_bytes(raw)
  data.append({"file":target.name,"module":mode,"sha256":hashlib.sha256(raw).hexdigest(),
    "bytes":len(raw),"triangles":len(mesh.indices)//3,"vertices":len(mesh.pos)//3})
 emit("f02-black-marble-full","F02-A",F["create_tile"]())
 for label,offset in (("first",0.),("second",.5)):
  emit("f02-black-marble-half-"+label,"F02-B",B["make_half_mesh"](offset),extra={"phaseZ":offset})
 for num,x,z in (("c1",0,0),("c2",.5,0),("c3",0,.5),("c4",.5,.5)):
  emit("f02-black-marble-quarter-"+num,"F02-C",C["quarter_mesh"](x,z),extra={"phaseXZ":[x,z]})
 for side in ("north","south","east","west"):
  emit("f02-black-marble-edge-"+side,"F02-D",D["make_edge"](side),extra={"side":side})
 for side in ("north-west","north-east","south-east","south-west"):
  emit("f02-black-marble-corner-"+side,"F02-E",E["make_corner"](side),extra={"corner":side,"tinyOriginalCap":True})
 for side in ("north-west","north-east","south-east","south-west"):
  emit("f02-black-marble-l-corner-showcase-"+side,"F02-E-SHOWCASE",l_corner(side),extra={"corner":side,"realLShaped":True})
 for side in ("north","south","east","west"):
  dims=(1,.19) if side in ("north","south") else (.19,1)
  emit("f02-black-marble-raised-border-showcase-"+side,"F02-D-SHOWCASE",box(*dims,.135,.008),extra={"side":side,"raised":True})
 spec=json.loads((ROOT/"docs/blueprints/S7_F01_F_RADIAL_WEDGE_PREVIEW_SPEC_20261117.json").read_text())
 wedge=W["build_mesh"](spec)[0]
 emit("f02-black-marble-radial-wedge","F02-F",wedge,extra={"radiusBandM":[7.2,8.2],"sectorDegrees":7.5})
 for tag,num in (("1m",1),("half",.5),("3m-showcase",3)):
  emit("f02-black-marble-pool-trim-"+tag,"F02-G",G["make_mesh"](num,num<=1),.225,
       extra={"radiusBandM":[8.2,8.39],"angleDegrees":7.5*num,"showcaseOnly":num==3})
 emit("f02-black-marble-matte-service","F02-H",F["create_tile"](),.70,
      extra={"serviceMatte":True},normal=True)
 emit("f02-black-marble-fine-textured-wet","F02-I",HI["textured_mesh"](),.86,
      extra={"visuallyWetAdjacent":True,"physicallyCertifiedSlipResistance":False},normal=True)
 assert len(data)==29,len(data)
 manifest={"schemaVersion":1,"family":"F02","renderOwnerPass":True,"glbOwnerVisualReviewPending":True,
  "atlasSha256":hashlib.sha256(tex).hexdigest(),"gameplayWrites":0,"models":data}
 (OUT/"qa-manifest.json").write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+"\n")
 print(json.dumps({"models":len(data),"atlasSha256":manifest["atlasSha256"]},indent=2))
if __name__=="__main__":build()
