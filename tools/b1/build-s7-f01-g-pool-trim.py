#!/usr/bin/env python3
"""F01-G real cream marble curved raised pool trim GLBs, owner visual review.
The long showcase arc matches the left design render. Individually movable
1-sector and 1/2-sector modules match the tiled ring at real G01 pool.
No production/gameplay integration; frozen F01-A marble texture.
"""
from __future__ import annotations
import hashlib,json,math,runpy,struct
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
F01=runpy.run_path(str(ROOT/"tools/b1/build-s7-f01-marble.py"))
OUT=ROOT/"build/s7-floor-f01/F01-G"
TEX_SHA="81c434a57b770148ced6e9c40dccabade929a844a27b143f2dc13a4da0ff8c98"
FROZEN_A_SHA="787965608e2e4005a0ee84c857d7f0379a8093149b39da6bacb2d012feafc147"
RI=8.2;RO=8.39;HEIGHT=.135;BEVEL=.008;GROUT=.006;DELTA=math.tau/48

def make_mesh(sectors=1,grout=True):
 assert sectors in (.5,1,3)
 span=DELTA*sectors
 mean=(RI+RO)/2
 margin=GROUT/(2*mean) if grout else 0
 a0,a1=margin,span-margin
 div=max(36,round(46*sectors))
 m=F01["Mesh"]()
 def pt(r,y,a):return (r*math.cos(a)-RI,y,r*math.sin(a))
 def uv(p):return (p[0]+RI,p[2])
 def ring(r,y,lo,hi):return [pt(r,y,lo+(hi-lo)*i/div) for i in range(div+1)]
 inside=ring(RI,HEIGHT-BEVEL,a0,a1)
 outside=ring(RO,HEIGHT-BEVEL,a0,a1)
 topin=ring(RI+BEVEL,HEIGHT,a0+BEVEL/mean,a1-BEVEL/mean)
 topout=ring(RO-BEVEL,HEIGHT,a0+BEVEL/mean,a1-BEVEL/mean)
 for i in range(div):
  q=[topin[i],topin[i+1],topout[i+1],topout[i]]
  m.quad(q,(0,1,0),[uv(p) for p in q])
 shoulder=inside+list(reversed(outside))
 top=topin+list(reversed(topout))
 bottom=[(v[0],0.,v[2]) for v in shoulder]
 for i in range(len(shoulder)):
  j=(i+1)%len(shoulder)
  p,q=shoulder[i],shoulder[j]
  dx,dz=q[0]-p[0],q[2]-p[2]
  leng=math.hypot(dx,dz)
  assert leng>1e-9
  outward=(-dz/leng,0.,dx/leng)
  normal=(outward[0]*math.sqrt(.5),math.sqrt(.5),outward[2]*math.sqrt(.5))
  face=[top[i],top[j],shoulder[j],shoulder[i]]
  m.quad(face,normal,[uv(p) for p in face])
  wall=[shoulder[i],shoulder[j],bottom[j],bottom[i]]
  m.quad(wall,outward,[(0,1),(leng,1),(leng,0),(0,0)])
 for i in range(div):
  m.quad([bottom[i],bottom[i+1],bottom[-i-2],bottom[-i-1]],(0,-1,0))
 assert abs(max(m.pos[1::3])-HEIGHT)<1e-8 and min(m.pos[1::3])==0
 assert max(m.indices)<65535 and len(m.indices)%3==0
 return m

def pack(m,texture,label,sectors,grout):
 raw=F01["build_glb"](m,texture)
 length,typ=struct.unpack_from("<I4s",raw,12)
 assert typ==b"JSON"
 gltf=json.loads(raw[20:20+length])
 off=20+length
 n,tag=struct.unpack_from("<I4s",raw,off)
 assert tag==b"BIN\0"
 binary=raw[off+8:off+8+n]
 gltf["asset"]["generator"]="Trialum F01-G true original cream marble G01 curved finishing trim"
 gltf["scenes"][0]["name"]=label
 gltf["nodes"][0]["name"]=label+" - genuine curved poolside marble edging"
 gltf["nodes"][0]["extras"]={
  "assetId":label,"family":"S7-FLOOR-F01","module":"F01-G",
  "ownerDesignRenderReferenceApproved":True,
  "ownerPhysicalModelVisualReviewPending":True,
  "realG01RadiusInnerM":RI,"realG01RadiusOuterM":RO,
  "heightM":HEIGHT,"topBevelM":BEVEL,
  "gapBetweenModulesM":GROUT if grout else 0,
  "arcRadians":DELTA*sectors,"arcLengthMeanM":DELTA*sectors*(RI+RO)/2,
  "modular":sectors!=3,"showcaseOnly":sectors==3,
  "pivot":"LOCAL start at inner arc r=8.2; Y rotation -theta around G01",
  "units":"m","axis":"Y_UP","inGame":False,"gameAuthority":False,
  "gameplayWrites":0,"textureSha256":TEX_SHA
 }
 gltf["meshes"][0]["name"]="F01-G.real-solid-polished-curved-cream-marble"
 gltf["materials"][0]["name"]="F01-G polished warm-ivory marble (original F01-A mineral pattern)"
 gltf["materials"][0]["pbrMetallicRoughness"]["roughnessFactor"]=.225
 gltf["images"][0]["name"]="Frozen owner-approved F01-A cream marble texture"
 packed=json.dumps(gltf,separators=(",",":"),ensure_ascii=False).encode("utf8")
 packed+=b" "*(-len(packed)%4)
 result=(b"glTF"+struct.pack("<II",2,12+8+len(packed)+8+len(binary))+
         struct.pack("<I4s",len(packed),b"JSON")+packed+
         struct.pack("<I4s",len(binary),b"BIN\0")+binary)
 assert struct.unpack_from("<II",result,4)==(2,len(result))
 return result

def main():
 texture=F01["make_marble_png"]()
 assert hashlib.sha256(texture).hexdigest()==TEX_SHA
 original=F01["build_glb"](F01["create_tile"](),texture)
 assert hashlib.sha256(original).hexdigest()==FROZEN_A_SHA
 OUT.mkdir(parents=True,exist_ok=True)
 files=[]
 for key,n,gap in (("1m",1,True),("half",.5,True),("3m-showcase",3,False)):
  m=make_mesh(n,gap)
  label="S7-FLOOR-F01-G-"+key
  glb=pack(m,texture,label,n,gap)
  assert len(glb)<220000
  name="f01-g-cream-marble-pool-trim-"+key+".glb"
  (OUT/name).write_bytes(glb)
  files.append({"name":name,"sha256":hashlib.sha256(glb).hexdigest(),
   "bytes":len(glb),"triangles":len(m.indices)//3,
   "vertices":len(m.pos)//3,"arcLengthM":DELTA*n*(RI+RO)/2,
   "ownerModelPass":False,"inGame":False})
 manifest={"schemaVersion":1,"assetId":"S7-FLOOR-F01-G",
  "status":"REAL_GLBS_BUILT_OWNER_MODEL_QA_PENDING",
  "ownerDesignRenderReferenceApproved":True,
  "originalF01TextureSha256":TEX_SHA,"originalFrozenF01ASha256":FROZEN_A_SHA,
  "gameplayWrites":0,"inGame":False,"assets":files}
 (OUT/"qa-manifest.json").write_text(json.dumps(manifest,indent=2)+"\n",encoding="utf8")
 print(json.dumps(manifest,indent=2))
if __name__=="__main__":main()
