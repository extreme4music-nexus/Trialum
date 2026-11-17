#!/usr/bin/env python3
"""Trialum S7.8-B F01-C: FOUR complementary 0.5m x 0.5m 3D marble quarters.
All use the EXACT F01-A texture; quarter UVs preserve original global 1m
coordinates on the top. Together the C1..C4 set fits the full 1x1 tile.
Original Python stdlib-only glTF2 authoring; REVIEW ONLY / no game writes.

Place bottom-left C1 at x,z=(0,0), C2 at (.5,0), C3 at (0,.5),
and C4 at (.5,.5). Do NOT repeat the first texture phase on every quarter.
"""
from __future__ import annotations
import hashlib
import json
import math
from pathlib import Path
import runpy
import struct

ROOT=Path(__file__).resolve().parents[2]
F01=runpy.run_path(str(ROOT/"tools/b1/build-s7-f01-marble.py"))
B=runpy.run_path(str(ROOT/"tools/b1/build-s7-f01-half.py"))
OUT=ROOT/"build/s7-floor-f01/F01-C"
OUT.mkdir(parents=True,exist_ok=True)

SIDE=.5
HEIGHT=.06
BEVEL=.004
ORIGINAL_IMAGE_SHA="81c434a57b770148ced6e9c40dccabade929a844a27b143f2dc13a4da0ff8c98"
ORIGINAL_FULL_SHA="787965608e2e4005a0ee84c857d7f0379a8093149b39da6bacb2d012feafc147"
ORIGINAL_HALVES=[
    "d5b88ef3079066ce6bba317e6f38196d13bd316f7a24eee8404177506b7cae8e",
    "db04892a98d14bb7ab8c92270042f3dc5f22edb782575200fed2d43acad3c5d5"
]


def quarter_mesh(xphase,zphase):
    assert xphase in (0.,.5) and zphase in (0.,.5)
    m=F01["Mesh"]()
    t=HEIGHT;e=BEVEL;w=d=SIDE
    # Local bottom-left pivot, geometry independent of position within 1m
    top=[(e,t,e),(w-e,t,e),(w-e,t,d-e),(e,t,d-e)]
    bevel_bottom=[(0,t-e,0),(w,t-e,0),(w,t-e,d),(0,t-e,d)]
    base=[(0,0,0),(w,0,0),(w,0,d),(0,0,d)]
    m.quad(top,(0,1,0),[
      (xphase+e,zphase+e),
      (xphase+w-e,zphase+e),
      (xphase+w-e,zphase+d-e),
      (xphase+e,zphase+d-e),
    ])
    for i in range(4):
        j=(i+1)%4
        tang=(bevel_bottom[j][0]-bevel_bottom[i][0],
              bevel_bottom[j][2]-bevel_bottom[i][2])
        nx,nz=tang[1],-tang[0]
        length=math.hypot(nx,nz)
        norm=(nx/length,0,nz/length)
        diagonal=(norm[0]*math.sqrt(.5),math.sqrt(.5),norm[2]*math.sqrt(.5))
        m.quad([top[i],top[j],bevel_bottom[j],bevel_bottom[i]],diagonal,
               [(0,1),(1,1),(1,.94),(0,.94)])
        m.quad([bevel_bottom[i],bevel_bottom[j],base[j],base[i]],norm,
               [(0,1),(1,1),(1,0),(0,0)])
    m.quad(base,(0,-1,0))
    return m


def retag_glb(glb,asset_id,phase):
    """Source-author glTF from shared A engine; retag the human-readable
    metadata while leaving all geometry/PBR/PNG buffers untouched."""
    assert glb[:4]==b"glTF"
    jl,typ=struct.unpack_from("<I4s",glb,12)
    assert typ==b"JSON"
    js=json.loads(glb[20:20+jl])
    pos=20+jl
    bl,btype=struct.unpack_from("<I4s",glb,pos)
    assert btype==b"BIN\0"
    binary=glb[pos+8:pos+8+bl]
    assert len(binary)==bl
    js["scenes"][0]["name"]=asset_id
    js["nodes"][0]["name"]=asset_id+" :: exact 0.5m original cream marble quarter"
    js["nodes"][0]["extras"]={
      "assetId":asset_id,
      "parentFamily":"S7-FLOOR-F01",
      "origin":"bottom-left",
      "dimensionXYZMeters":[SIDE,HEIGHT,SIDE],
      "textureGlobalOffsetXZ":[*phase],
      "placementGlobalOffsetXZ":[*phase],
      "topUVUPhase":[phase[0],phase[0]+SIDE],
      "topUVVPhase":[phase[1],phase[1]+SIDE],
      "materialSource":"exact-F01-A-original-384px-PBR-texture",
      "ownerF01AModelPass":True,
      "ownerF01BModelPass":None,
      "ownerF01CModelPass":False,
      "inGame":False,
      "gameAuthority":False,
      "changesGameplay":False,
    }
    js["meshes"][0]["name"]=asset_id+".RealSlabGeometry"
    js["asset"]["generator"]="Trialum S7 F01-C 4-phase 0.5m quarters using original F01-A writer"
    js["images"][0]["name"]="F01 approved 1m seamless cream marble PNG (same bytes)"
    newjson=json.dumps(js,separators=(",",":"),ensure_ascii=False).encode("utf-8")
    newjson+=b" "*(-len(newjson)%4)
    size=12+8+len(newjson)+8+len(binary)
    return b"glTF"+struct.pack("<II",2,size)+struct.pack("<I4s",len(newjson),b"JSON")+newjson+struct.pack("<I4s",len(binary),b"BIN\0")+binary


def main():
    tex=F01["make_marble_png"]()
    assert hashlib.sha256(tex).hexdigest()==ORIGINAL_IMAGE_SHA, "STOP: approved marble texture changed"
    same_a=F01["build_glb"](F01["create_tile"](),tex)
    assert hashlib.sha256(same_a).hexdigest()==ORIGINAL_FULL_SHA, "STOP: approved full tile changed"
    # The B pair is read-only regenerated to assert our parent toolchain is unchanged.
    for phase,expected in zip((0.,.5),ORIGINAL_HALVES):
        bmesh=B["make_half_mesh"](phase)
        bdata=B["repack_half_glb"](F01["build_glb"](bmesh,tex),
                                    "F01-B1" if phase==0 else "F01-B2",phase)
        assert hashlib.sha256(bdata).hexdigest()==expected, "STOP: approved B model changed"

    models=[]
    for key,x,z in (("C1",0.,0.),("C2",.5,0.),("C3",0.,.5),("C4",.5,.5)):
        ident="S7-FLOOR-F01-"+key
        mesh=quarter_mesh(x,z)
        raw=retag_glb(F01["build_glb"](mesh,tex),ident,(x,z))
        name=f"f01-marble-cream-quarter-{key.lower()}.glb"
        (OUT/name).write_bytes(raw)
        models.append({
          "assetId":ident,"glb":name,
          "dimensionsMeters":[SIDE,HEIGHT,SIDE],
          "placeAtOffsetXZ":[x,z],
          "topUVURange":[x+BEVEL,x+SIDE-BEVEL],
          "topUVVRange":[z+BEVEL,z+SIDE-BEVEL],
          "vertices":len(mesh.pos)//3,
          "triangles":len(mesh.indices)//3,
          "bytes":len(raw),
          "sha256":hashlib.sha256(raw).hexdigest(),
          "actualGlb":True
        })
    texname="f01-marble-cream-basecolor-shared.png"
    (OUT/texname).write_bytes(tex)
    manifest={
       "family":"S7-FLOOR-F01-C","status":"REAL_FOUR_QUARTERS_FOR_REVIEW_NOT_INSTALLED",
       "ownerApprovedPrevious":"F01-A approved, F01-B owner review not explicitly recorded",
       "ownerF01CModelPass":False,"inGame":False,"newAPK":False,"gameplayWrites":0,
       "commonTexture":texname,"commonTextureSHA256":ORIGINAL_IMAGE_SHA,
       "unchangedFullTileSHA256":ORIGINAL_FULL_SHA,
       "unchangedHalfTileSHAs":ORIGINAL_HALVES,
       "material":{"metallic":0,"roughness":.275,"PBR":True},
       "thicknessM":HEIGHT,"bevelM":BEVEL,
       "placement":"C1=(0,0), C2=(0.5,0), C3=(0,0.5), C4=(0.5,0.5) inside one original full 1-metre tile",
       "models":models,
       "remainingF01Modules":["F01-D","F01-E","F01-F","F01-G","F01-H","F01-I"],
       "notes":"Four quarter GLBs are complementary texture phases of one approved F01 marble; original engine and G01 untouched."
    }
    (OUT/"qa-manifest.json").write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    print(json.dumps(manifest,indent=2,ensure_ascii=False))

if __name__=="__main__":
    main()
