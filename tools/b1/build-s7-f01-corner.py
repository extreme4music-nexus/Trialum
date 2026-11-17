#!/usr/bin/env python3
"""Trialum S7.8-B F01-E — four genuine exposed outer corner caps for F01-D.

Authoring ONLY, no placement into actual 3D greenhouse or APK.
Each module occupies only the 60 x 60 mm OUTSIDE quadrant of original
1 m F01-A tile. F01-D edges occupy the adjacent strips but never overlap
this quadrant. Top/outer-nose height profiles exactly match F01-D.

Using ORIGINAL F01-A embedded cream PBR PNG, unchanged glTF writer.
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
D=runpy.run_path(str(ROOT/"tools/b1/build-s7-f01-edge.py"))
OUT=ROOT/"build/s7-floor-f01/F01-E"
OUT.mkdir(parents=True,exist_ok=True)
TEX_SHA="81c434a57b770148ced6e9c40dccabade929a844a27b143f2dc13a4da0ff8c98"
A_SHA="787965608e2e4005a0ee84c857d7f0379a8093149b39da6bacb2d012feafc147"
D_SHA={
    "north":"8c4bf1ea7be0f67f83b3ded5e9ab998152445f0b086c1e9c54a96a5571c47e64",
    "south":"65fde6167a7aac38095d47f5e199ab29d338ce64ccb7ac9ead0d12e86e4704ef",
    "east":"be475ce00838b7d2d8db712537efa1b75e6e80654e79ffbb887e1e3b3cca7237",
    "west":"774564be16fb59b177a4ac66dd221bfaec40c5be301753a23127740cfc093a74",
}
SIDE=.060
BEVEL=.004
SHOULDER=.056
TOP=.056
OUTER=.052
STATIONS=(0.,SHOULDER,SIDE)
CORNERS={
  "north-west":(0.,0.,-1.,-1.),
  "north-east":(1.,0.,1.,-1.),
  "south-east":(1.,1.,1.,1.),
  "south-west":(0.,1.,-1.,1.)
}


def vec(mesh,points,normal,uv):
    """One nondegenerate triangle; correct original material coordinates."""
    D["vertex_tri"](mesh,points,normal,uv)


def unit_cross(a,b,c,prefer=None):
    u=tuple(b[i]-a[i] for i in range(3))
    v=tuple(c[i]-a[i] for i in range(3))
    q=(u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0])
    length=math.sqrt(sum(t*t for t in q))
    if length<=1e-9:raise ValueError("degenerate triangular area")
    n=tuple(t/length for t in q)
    if prefer is not None and sum(n[i]*prefer[i] for i in range(3))<0:
        n=tuple(-v for v in n)
    return n


def nose_height(u,v):
    # Meets both original D edge bevel profiles at u=0 and v=0.
    return TOP-max(0.,u-SHOULDER,v-SHOULDER)


def make_corner(corner):
    if corner not in CORNERS:raise ValueError(corner)
    x0,z0,dx,dz=CORNERS[corner]
    p=lambda u,y,v:(x0+dx*u,y,z0+dz*v)
    uv=lambda v:(v[0],v[2])
    m=F01["Mesh"]()

    # 3x3 cross-grid of plateau (0..56mm) and 4mm bevel outer edges.
    # An explicit top mesh avoids beveled geometry overlapping D edge strips.
    for i in range(2):
        for j in range(2):
            u0,u1=STATIONS[i],STATIONS[i+1]
            v0,v1=STATIONS[j],STATIONS[j+1]
            pts=[
                p(u0,nose_height(u0,v0),v0),
                p(u1,nose_height(u1,v0),v0),
                p(u1,nose_height(u1,v1),v1),
                p(u0,nose_height(u0,v1),v1),
            ]
            for a,b,c in ((0,1,2),(0,2,3)):
                tri=(pts[a],pts[b],pts[c])
                normal=unit_cross(*tri,prefer=(0,1,0))
                vec(m,tri,normal,[uv(t) for t in tri])

    # Two outer vertical faces of square cap: x-most and z-most,
    # from flat y=0 to y=.052 at the bevel rim.
    for j in range(2):
        v0,v1=STATIONS[j],STATIONS[j+1]
        m.quad([
            p(SIDE,nose_height(SIDE,v0),v0),
            p(SIDE,nose_height(SIDE,v1),v1),
            p(SIDE,0,v1),
            p(SIDE,0,v0),
        ],(dx,0,0),[(v0,1),(v1,1),(v1,0),(v0,0)])
    for i in range(2):
        u0,u1=STATIONS[i],STATIONS[i+1]
        m.quad([
            p(u0,nose_height(u0,SIDE),SIDE),
            p(u1,nose_height(u1,SIDE),SIDE),
            p(u1,0,SIDE),
            p(u0,0,SIDE),
        ],(0,0,dz),[(u0,1),(u1,1),(u1,0),(u0,0)])

    # Bottom face; seam inner walls intentionally absent: those planes
    # are already closed by original D north/east/west/south end caps.
    m.quad([
        p(0,0,0),p(SIDE,0,0),
        p(SIDE,0,SIDE),p(0,0,SIDE)
    ],(0,-1,0),[(0,0),(1,0),(1,1),(0,1)])
    return m


def patch_glb(raw,corner):
    assert raw[:4]==b"glTF"
    n,t=struct.unpack_from("<I4s",raw,12)
    assert t==b"JSON"
    obj=json.loads(raw[20:20+n])
    pos=20+n
    ln,t=struct.unpack_from("<I4s",raw,pos)
    assert t==b"BIN\0"
    blob=raw[pos+8:pos+8+ln]
    assert len(blob)==ln
    uid="S7-FLOOR-F01-E-"+corner.upper().replace("-","_")
    obj["asset"]["generator"]="Trialum original F01-E exposed-corner cap glTF2, same frozen F01-A PBR"
    obj["scenes"][0]["name"]=uid
    obj["nodes"][0]["name"]=uid+" :: 60mm exposed 3D marble outer corner"
    obj["nodes"][0]["extras"]={
       "assetId":uid,"family":"S7-FLOOR-F01","module":"F01-E",
       "corner":corner,"units":"m","axis":"Y_UP","pivot":"ORIGINAL F01-A tile bottom-left",
       "tileBoundsMeters":[0,0,0,1,.06,1],
       "cornerExtensionM":SIDE,"topHeightM":TOP,"bevelM":BEVEL,
       "matchedParts":"F01-D two orthogonal exposed edges at same tile corner",
       "ownerF01AApproved":True,"ownerF01EApproved":False,
       "inGame":False,"gameAuthority":False,"changesGameplay":False
    }
    obj["meshes"][0]["name"]=uid+".NonOverlappingActualCornerGeometry"
    obj["images"][0]["name"]="SAME approved F01-A cream mineral PBR texture (not an approximation)"
    js=json.dumps(obj,separators=(",",":"),ensure_ascii=False).encode("utf-8")
    js+=b" "*(-len(js)%4)
    size=12+8+len(js)+8+len(blob)
    return b"glTF"+struct.pack("<II",2,size)+struct.pack("<I4s",len(js),b"JSON")+js+struct.pack("<I4s",len(blob),b"BIN\0")+blob


def main():
    image=F01["make_marble_png"]()
    assert hashlib.sha256(image).hexdigest()==TEX_SHA, "original PBR drift"
    original=F01["build_glb"](F01["create_tile"](),image)
    assert hashlib.sha256(original).hexdigest()==A_SHA, "approved F01-A GLB drift"
    for dir_,expected in D_SHA.items():
        d_mesh=D["make_edge"](dir_)
        d_blob=D["retag_glb"](F01["build_glb"](d_mesh,image),dir_)
        assert hashlib.sha256(d_blob).hexdigest()==expected, "F01-D source drift "+dir_
    (OUT/"f01-marble-cream-basecolor-shared.png").write_bytes(image)
    manifest={
       "family":"S7-FLOOR-F01-E",
       "status":"FOUR_REAL_CORNER_GLBS_BUILT_FOR_OWNER_REVIEW",
       "source":"EXACT original F01-A PNG + glTF writer, F01-D independent unchanged",
       "originalA_SHA256":A_SHA,"originalD_SHA256":D_SHA,"texture_SHA256":TEX_SHA,
       "cornerSizeM":SIDE,"upperFlatHeightM":TOP,"outerLipHeightM":OUTER,
       "bevelM":BEVEL,"metallic":0,"roughness":.275,
       "ownerApproval":False,"inGame":False,"newAndroidAPK":False,
       "originalEngineWrites":0,"threeDSceneChanges":0,
       "models":[],"nextStep":"F01-F real G01 curved basin geometry survey before radial wedges"
    }
    for c in CORNERS:
        mesh=make_corner(c)
        glb=patch_glb(F01["build_glb"](mesh,image),c)
        name=f"f01-marble-cream-corner-{c}.glb"
        (OUT/name).write_bytes(glb)
        manifest["models"].append({
          "assetId":"S7-FLOOR-F01-E-"+c.upper().replace("-","_"),
          "glb":name,"corner":c,
          "boundsMin":[min(mesh.pos[i::3]) for i in range(3)],
          "boundsMax":[max(mesh.pos[i::3]) for i in range(3)],
          "triangles":len(mesh.indices)//3,"vertices":len(mesh.pos)//3,
          "glbBytes":len(glb),"glbSha256":hashlib.sha256(glb).hexdigest()
        })
    (OUT/"qa-manifest.json").write_text(json.dumps(manifest,indent=2)+"\n",encoding="utf-8")
    print(json.dumps(manifest,indent=2))

if __name__=="__main__":main()
