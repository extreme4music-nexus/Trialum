#!/usr/bin/env python3
"""Trialum S7.8-B / F01-D: Four real 1m marble exposed-edge nosing GLBs.
Standalone asset review. NO installation, game state, floor collision or APK.

F01-A is a 1.00 x 1.00 x 0.06 m original cream-white marble slab. Its
outside vertical face begins at y=0.056 below a 4mm bevel. Each F01-D module
adjoins an *exposed* north/south/west/east side and extends outward 0.060m,
its top flush at y=0.056 and chamfer down to 0.052m on the exterior lip.

IMPORTANT:
  - F01-D is for exposed straight runs ONLY. Do not overlap two perpendicular
    D trims at the same corner; future F01-E owns corner finishing/mitres.
  - Placement pivot is ORIGINAL tile's (x,z)=(0,0) lower-left. These trims
    sit immediately OUTSIDE the tile's [0,1] x [0,1] footprint.
  - Texture is EXACT original F01-A PBR 384px PNG. Top UV equals original
    tile global metre coordinates, with cyclic UV wrap for outside extension.
  - No hidden inner face, since the existing F01-A slab already has a side.
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
OUT=ROOT/"build/s7-floor-f01/F01-D"
OUT.mkdir(parents=True,exist_ok=True)
ORIGINAL_IMAGE_SHA="81c434a57b770148ced6e9c40dccabade929a844a27b143f2dc13a4da0ff8c98"
ORIGINAL_F01_A_SHA="787965608e2e4005a0ee84c857d7f0379a8093149b39da6bacb2d012feafc147"
EXTENT=.060             # 6cm external depth (does not modify 1m original tile)
LIP_SHOULDER=.056       # first 4mm of exterior lip is a bevel
TOP=.056                # exactly meets F01-A at its pre-existing front bevel
OUTER_TOP=.052          # 4mm below lip shoulder, matching approved A bevel

DIRECTIONS=("north","south","west","east")


def world_point(direction,t,y,r):
    """All orientations are authored in absolute *adjacent tile* metres."""
    if direction=="north":return (t,y,-r)
    if direction=="south":return (t,y,1.+r)
    if direction=="west":return (-r,y,t)
    if direction=="east":return (1.+r,y,t)
    raise ValueError(direction)


def outward(direction):
    return {"north":(0,0,-1),"south":(0,0,1),
            "west":(-1,0,0),"east":(1,0,0)}[direction]


def tangent(direction):
    return (0,0,1) if direction in ("west","east") else (1,0,0)


def vertex_tri(mesh,points,normal,uvs):
    """A genuine triangle with consistent face normal and material UVs."""
    start=len(mesh.pos)//3
    a,b,c=points
    u=tuple(b[i]-a[i] for i in range(3))
    v=tuple(c[i]-a[i] for i in range(3))
    cross=(u[1]*v[2]-u[2]*v[1],
           u[2]*v[0]-u[0]*v[2],
           u[0]*v[1]-u[1]*v[0])
    # Never create zero-area/coplanar-degenerate triangles.
    if math.sqrt(sum(z*z for z in cross))<1e-9:raise ValueError("degenerate face")
    mesh.pos.extend(q for p in points for q in p)
    mesh.norm.extend(q for _ in range(3) for q in normal)
    mesh.uv.extend(q for p in uvs for q in p)
    if sum(cross[i]*normal[i] for i in range(3))>=0:
        mesh.indices.extend((start,start+1,start+2))
    else:
        mesh.indices.extend((start,start+2,start+1))


def make_edge(direction):
    if direction not in DIRECTIONS:raise ValueError(direction)
    m=F01["Mesh"]()
    p=lambda t,y,r:world_point(direction,t,y,r)
    o=outward(direction)
    bevel=tuple((o[i]+(1 if i==1 else 0))/math.sqrt(2) for i in range(3))
    # Only the top face needs globally aligned UV. Reusing the original
    # period-1 F01 texture keeps vein flow seamless across the tile boundary.
    topcorners=[p(0,TOP,0),p(1,TOP,0),
                p(1,TOP,LIP_SHOULDER),p(0,TOP,LIP_SHOULDER)]
    m.quad(topcorners,(0,1,0),[(q[0],q[2]) for q in topcorners])
    # Chamfer on OUTER nose only; original F01-A 4mm top bevel untouched.
    shoulder=[p(0,TOP,LIP_SHOULDER),p(1,TOP,LIP_SHOULDER)]
    outer=[p(0,OUTER_TOP,EXTENT),p(1,OUTER_TOP,EXTENT)]
    m.quad([*shoulder,outer[1],outer[0]],bevel,
           [(0,.75),(1,.75),(1,1),(0,1)])
    # Exterior visible down-face, then lower closing face; no internal face.
    m.quad([outer[0],outer[1],p(1,0,EXTENT),p(0,0,EXTENT)],
           o,[(0,1),(1,1),(1,0),(0,0)])
    m.quad([p(0,0,EXTENT),p(1,0,EXTENT),p(1,0,0),p(0,0,0)],
           (0,-1,0))

    # Visible end caps are a true FIVE-point cross-section triangulated into
    # 3 triangles, so there are no degenerate quads, T-joints or missing walls.
    tang=tangent(direction)
    for t,sign in ((0,-1),(1,1)):
        norm=tuple(sign*x for x in tang)
        poly=[p(t,0,0),p(t,TOP,0),p(t,TOP,LIP_SHOULDER),
              p(t,OUTER_TOP,EXTENT),p(t,0,EXTENT)]
        uv=[(0,0),(0,1),(.93,1),(1,.93),(1,0)]
        for ii,jj,kk in ((0,1,2),(0,2,3),(0,3,4)):
            vertex_tri(m,[poly[ii],poly[jj],poly[kk]],norm,
                       [uv[ii],uv[jj],uv[kk]])
    return m


def retag_glb(raw,direction):
    assert raw[:4]==b"glTF"
    jl,ty=struct.unpack_from("<I4s",raw,12)
    assert ty==b"JSON"
    j=json.loads(raw[20:20+jl])
    offset=20+jl
    bl,bty=struct.unpack_from("<I4s",raw,offset)
    assert bty==b"BIN\0"
    binary=raw[offset+8:offset+8+bl]
    assert len(binary)==bl
    id_="S7-FLOOR-F01-D-"+direction.upper()
    j["asset"]["generator"]="Trialum F01-D original edge trim glTF2 builder / F01-A shared PBR"
    j["scenes"][0]["name"]=id_
    j["nodes"][0]["name"]=id_+" :: exposed marble edge 1.0m / 60mm exterior"
    j["nodes"][0]["extras"]={
       "assetId":id_,"family":"S7-FLOOR-F01","module":"F01-D",
       "direction":direction,"units":"m","axis":"Y_UP",
       "tileGridPivot":"(0,0,0) is ORIGINAL F01-A tile bottom-left",
       "floorTileBounds":[0,0,0,1,.06,1],
       "outwardDepthM":EXTENT,"topHeightM":TOP,
       "shoulderM":LIP_SHOULDER,"bevelM":.004,
       "placement":"abut a straight EXPOSED side of original F01-A tile",
       "cornerRule":"do NOT mount perpendicular D modules on same corner; F01-E will cap/mitre",
       "ownerF01AApproved":True,"ownerF01DApproved":False,
       "inGame":False,"changesGameplay":False,"gameAuthority":False
    }
    j["meshes"][0]["name"]=id_+".ActualSolidMarbleEdge"
    j["images"][0]["name"]="F01 ORIGINAL 384px same approved marble mineral veins"
    js=json.dumps(j,separators=(",",":"),ensure_ascii=False).encode("utf-8")
    js+=b" "*(-len(js)%4)
    size=12+8+len(js)+8+len(binary)
    return (b"glTF"+struct.pack("<II",2,size)+
           struct.pack("<I4s",len(js),b"JSON")+js+
           struct.pack("<I4s",len(binary),b"BIN\0")+binary)


def main():
    image=F01["make_marble_png"]()
    assert hashlib.sha256(image).hexdigest()==ORIGINAL_IMAGE_SHA, "STOP: original material drift"
    original=F01["build_glb"](F01["create_tile"](),image)
    assert hashlib.sha256(original).hexdigest()==ORIGINAL_F01_A_SHA,"STOP: approved full tile drift"
    (OUT/"f01-marble-cream-basecolor-shared.png").write_bytes(image)
    manifest={"family":"S7-FLOOR-F01-D","status":"FOUR_REAL_EDGE_GLBS_BUILT_OWNER_REVIEW_PENDING",
       "materialSource":"byte-for-byte original F01-A PBR image/material",
       "approvedF01AglbSha256":ORIGINAL_F01_A_SHA,
       "sharedImageSha256":ORIGINAL_IMAGE_SHA,
       "physicalFaceHeightM":TOP,"outwardDepthM":EXTENT,
       "metallic":0,"roughness":.275,
       "ownerDPass":False,"inGame":False,"newSignedApk":False,
       "originalEngineWrites":0,"threeDSceneChanges":0,
       "models":[],"nextStage":"F01-E geometric corner trim only AFTER F01-D owner visual review"}
    for d in DIRECTIONS:
        m=make_edge(d)
        blob=retag_glb(F01["build_glb"](m,image),d)
        name=f"f01-marble-cream-edge-{d}.glb"
        (OUT/name).write_bytes(blob)
        manifest["models"].append({
          "assetId":"S7-FLOOR-F01-D-"+d.upper(),
          "glb":name,"direction":d,
          "boundsMin":[min(m.pos[i::3]) for i in range(3)],
          "boundsMax":[max(m.pos[i::3]) for i in range(3)],
          "vertices":len(m.pos)//3,"triangles":len(m.indices)//3,
          "glbBytes":len(blob),"glbSha256":hashlib.sha256(blob).hexdigest()})
    (OUT/"qa-manifest.json").write_text(
       json.dumps(manifest,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    print(json.dumps(manifest,indent=2,ensure_ascii=False))

if __name__=="__main__":main()
