#!/usr/bin/env python3
"""F01-F CORRECTED: SMALL individual poolside marble TILE, not an oversized outer slab.
Physical authoring for standalone preview only. The owner's approved render
depicts a REPEATED cream-marble arc beside the REAL G01 water/railing.
Each GLB copy is one selectable 1m x ~1m curved wedge; seven copies build
the 22.5°--75° sample arc in Builder. No gameplay/production mutation.
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
SPEC_PATH=ROOT/"docs/blueprints/S7_F01_F_RADIAL_WEDGE_PREVIEW_SPEC_20261117.json"
OUT=ROOT/"build/s7-floor-f01/F01-F"
NAME="f01-marble-cream-radial-wedge.glb"
FROZEN_F01_A_SHA="787965608e2e4005a0ee84c857d7f0379a8093149b39da6bacb2d012feafc147"
FROZEN_TEXTURE_SHA="81c434a57b770148ced6e9c40dccabade929a844a27b143f2dc13a4da0ff8c98"

def build_mesh(spec):
    d=spec["design"]
    inner=float(d["radialInnerM"]);outer=float(d["radialOuterM"])
    thick=float(d["thicknessM"]);bevel=float(d["bevelM"])
    grout=float(d["radialGroutGapM"])
    subdivisions=int(d["subdivisions"])
    n=int(d["numberOfSectorsAroundFullRing"])
    assert n==48 and subdivisions==24
    assert abs(inner-7.2)<1e-10 and abs(outer-8.2)<1e-10
    assert abs(outer-inner-1)<1e-10
    assert abs(thick-.06)<1e-10 and abs(bevel-.004)<1e-10
    assert 0<grout<.015
    delta=math.tau/n
    assert abs(float(d["angularStepRadians"])-delta)<1e-10
    mean=(inner+outer)/2.
    side_margin=grout/(2*mean)
    a0=side_margin
    a1=delta-side_margin
    m=F01["Mesh"]()
    # One physical piece. Its LOCAL pivot is the inner-arc leading edge of
    # the sector BEFORE grout. Allows precise rotations and translations
    # around the origin of the REAL G01 pool by the Builder design project.
    def pt(r,y,a):
        return (r*math.cos(a)-inner,y,r*math.sin(a))
    def uv(p):
        # Keep exactly the owner-approved F01-A texture at a 1m natural scale.
        # The grout seam makes individual real stone slabs visually separate.
        return (p[0]+inner,p[2])
    def ring(r,y,lo,hi):
        return [pt(r,y,lo+(hi-lo)*i/subdivisions) for i in range(subdivisions+1)]
    shoulder_inner=ring(inner,thick-bevel,a0,a1)
    shoulder_outer=ring(outer,thick-bevel,a0,a1)
    a_bevel=bevel/mean
    top_inner=ring(inner+bevel,thick,a0+a_bevel,a1-a_bevel)
    top_outer=ring(outer-bevel,thick,a0+a_bevel,a1-a_bevel)
    for i in range(subdivisions):
        q=[top_inner[i],top_inner[i+1],top_outer[i+1],top_outer[i]]
        m.quad(q,(0,1,0),[uv(v) for v in q])
    per_top=top_inner+list(reversed(top_outer))
    per_shoulder=shoulder_inner+list(reversed(shoulder_outer))
    per_bottom=[(v[0],0.,v[2]) for v in per_shoulder]
    for i in range(len(per_top)):
        j=(i+1)%len(per_top)
        p,q=per_shoulder[i],per_shoulder[j]
        dx=q[0]-p[0];dz=q[2]-p[2]
        length=math.hypot(dx,dz)
        if length<1e-8:raise ValueError("zero-length perimeter segment")
        outward=(-dz/length,0.,dx/length)
        bevel_normal=(outward[0]*math.sqrt(.5),math.sqrt(.5),outward[2]*math.sqrt(.5))
        quad=[per_top[i],per_top[j],per_shoulder[j],per_shoulder[i]]
        m.quad(quad,bevel_normal,[uv(v) for v in quad])
        wall=[per_shoulder[i],per_shoulder[j],per_bottom[j],per_bottom[i]]
        m.quad(wall,outward,[(0,1),(length,1),(length,0),(0,0)])
    for i in range(subdivisions):
        q=[per_bottom[i],per_bottom[i+1],per_bottom[-i-2],per_bottom[-i-1]]
        m.quad(q,(0,-1,0))
    return m,{
      "localPivot":"(0,0,0) = untrimmed start of inner poolside arc",
      "moduleRadialBoundsM":[inner,outer],"individualArcStepRadians":round(delta,12),
      "originalG01ExistingWalkwayM":[7.2,9.15],
      "sampleInstanceIndices":d["sampleSectorIndices"],
      "subdivisions":subdivisions,"groutGapM":grout,"poolsideNotOutboard":True,
      "sourceImageSha256":FROZEN_TEXTURE_SHA
    }

def validate_mesh(m):
    assert len(m.pos)==len(m.norm)
    assert len(m.uv)//2==len(m.pos)//3
    assert len(m.indices)%3==0
    assert len(m.pos)//3<65535
    for i in range(0,len(m.indices),3):
        v=[m.pos[3*m.indices[k]:3*m.indices[k]+3] for k in range(i,i+3)]
        u=[v[1][k]-v[0][k] for k in range(3)]
        w=[v[2][k]-v[0][k] for k in range(3)]
        cr=(u[1]*w[2]-u[2]*w[1],u[2]*w[0]-u[0]*w[2],u[0]*w[1]-u[1]*w[0])
        if math.sqrt(sum(x*x for x in cr))<1e-10:
            raise ValueError("Zero area triangle "+str(i//3))
    assert abs(min(m.pos[1::3]))<1e-12
    assert abs(max(m.pos[1::3])-.06)<1e-9
    return len(m.indices)//3

def retag(glb,geometry):
    length,tag=struct.unpack_from("<I4s",glb,12)
    assert tag==b"JSON"
    model=json.loads(glb[20:20+length])
    bo=20+length
    blen,btag=struct.unpack_from("<I4s",glb,bo)
    assert btag==b"BIN\0"
    binary=glb[bo+8:bo+8+blen]
    assert len(binary)==blen
    identity="S7-FLOOR-F01-F"
    model["asset"]["generator"]="Trialum F01-F individual G01 poolside 48-module annular tiles, exact original F01-A PBR"
    model["scenes"][0]["name"]=identity
    model["nodes"][0]["name"]=identity+" :: INDIVIDUAL cream marble curved poolside tile"
    model["nodes"][0]["extras"]={
       "assetId":identity,"family":"S7-FLOOR-F01",
       "module":"F01-F","units":"m","axis":"Y_UP",
       "ownerApprovedConceptRender":True,"previousOversizedStandaloneRejected":True,
       "ownerCorrectedModelApproval":False,"inGame":False,
       "gameAuthority":False,"noGameStateWrites":True,
       "originalF01AMaterial":True,"tileThicknessM":.06,"bevelM":.004,
       **geometry
    }
    model["meshes"][0]["name"]="F01-F.SINGLE.PoolsideCurvedMarbleTile"
    model["images"][0]["name"]="Exact original F01-A cream marble PBR PNG"
    packed=json.dumps(model,separators=(",",":"),ensure_ascii=False).encode("utf8")
    packed+=b" "*(-len(packed)%4)
    result=(b"glTF"+struct.pack("<II",2,12+8+len(packed)+8+len(binary))+
       struct.pack("<I4s",len(packed),b"JSON")+packed+
       struct.pack("<I4s",len(binary),b"BIN\0")+binary)
    assert struct.unpack_from("<II",result,4)==(2,len(result))
    return result

def main():
    spec=json.loads(SPEC_PATH.read_text(encoding="utf8"))
    assert spec["schemaVersion"]==2 and spec["module"]=="F01-F"
    assert spec["ownerCorrectedPreviewApprovalPending"] is True
    assert spec["gameplayWrites"]==0
    texture=F01["make_marble_png"]()
    assert hashlib.sha256(texture).hexdigest()==FROZEN_TEXTURE_SHA
    a=F01["build_glb"](F01["create_tile"](),texture)
    assert hashlib.sha256(a).hexdigest()==FROZEN_F01_A_SHA
    mesh,extra=build_mesh(spec)
    triangles=validate_mesh(mesh)
    glb=retag(F01["build_glb"](mesh,texture),extra)
    assert len(glb)<160000
    OUT.mkdir(parents=True,exist_ok=True)
    (OUT/NAME).write_bytes(glb)
    (OUT/"f01-marble-cream-basecolor-shared.png").write_bytes(texture)
    record={
      "schemaVersion":2,"assetId":"S7-FLOOR-F01-F",
      "status":"CORRECTED_REAL_SMALL_POOL_TILE_NEEDS_OWNER_MODEL_VISUAL_QA",
      "ownerApprovedConceptStyle":True,"ownerCorrectedModelApproval":False,
      "previousOversizedStandaloneRejected":True,
      "file":NAME,"size":len(glb),"sha256":hashlib.sha256(glb).hexdigest(),
      "texSha256":FROZEN_TEXTURE_SHA,"frozenASha256":FROZEN_F01_A_SHA,
      "vertices":len(mesh.pos)//3,"triangles":triangles,
      "geometry":extra,"gameplayWrites":0,"inGame":False
    }
    (OUT/"qa-manifest.json").write_text(json.dumps(record,indent=2)+"\n",encoding="utf8")
    print(json.dumps(record,indent=2))
if __name__=="__main__":
    main()
