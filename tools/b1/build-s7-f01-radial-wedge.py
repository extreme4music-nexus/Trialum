#!/usr/bin/env python3
"""S7 F01-F — owner-render-approved, genuine bevelled cream-marble radial wedge.

ONE 1m dry outside-walkway module. Not installed in canonical G01/Android.
Geometry is derived from actual G01 source (r=7.20..9.15 walk ring);
candidate sector r=9.15..10.15, centred at 45deg with mean arc length 1m.
Exact F01-A 384px ivory marble image and PBR properties are reused unchanged.
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
SEGMENTS=32

def rounded(v):
    return round(v, 10)

def build_mesh(spec):
    c=spec["candidate"]
    R0=float(c["radialInnerM"]);R1=float(c["radialOuterM"])
    top=float(c["thicknessM"]);bevel=float(c["bevelM"])
    a0=math.radians(float(c["sectorStartDegrees"]))
    a1=math.radians(float(c["sectorEndDegrees"]))
    assert c["radialWidthM"]==1 and abs(R1-R0-1.)<1e-9
    assert abs((a1-a0)*(R0+R1)/2-1)<1e-8
    assert abs(R0-9.15)<1e-9 and abs(top-.06)<1e-9 and abs(bevel-.004)<1e-9
    assert 0<bevel<top/4
    # Start-of-inner-arc pivot is an actual point on the module, not G01 centre.
    ax=R0*math.cos(a0); az=R0*math.sin(a0)
    delta=bevel/((R0+R1)/2)
    m=F01["Mesh"]()
    def xyz(r,y,a):
        return (r*math.cos(a)-ax,y,r*math.sin(a)-az)
    def uv(p):
        # PERIODIC WORLD UV: x,z from actual G01 metre grid, NOT
        # 0..1 remapped per piece (would visibly reset F01-A's mineral vein).
        return (p[0]+ax,p[2]+az)
    shoulder_inner=[xyz(R0,top-bevel,a0+(a1-a0)*i/SEGMENTS) for i in range(SEGMENTS+1)]
    shoulder_outer=[xyz(R1,top-bevel,a0+(a1-a0)*i/SEGMENTS) for i in range(SEGMENTS+1)]
    top_inner=[xyz(R0+bevel,top,a0+delta+(a1-a0-2*delta)*i/SEGMENTS) for i in range(SEGMENTS+1)]
    top_outer=[xyz(R1-bevel,top,a0+delta+(a1-a0-2*delta)*i/SEGMENTS) for i in range(SEGMENTS+1)]
    # All planar top faces are real mesh quadrilaterals, gently curved at 32
    # segments; no single photographic plane or alpha faking.
    for i in range(SEGMENTS):
        pts=[top_inner[i],top_inner[i+1],top_outer[i+1],top_outer[i]]
        m.quad(pts,(0,1,0),[uv(p) for p in pts])
    outline_top=top_inner+list(reversed(top_outer))
    outline_shoulder=shoulder_inner+list(reversed(shoulder_outer))
    outline_bottom=[(p[0],0.,p[2]) for p in outline_shoulder]
    assert len(outline_top)==len(outline_shoulder)==2*(SEGMENTS+1)
    # The closed loop runs clockwise in the x,z plane.
    for i in range(len(outline_top)):
        j=(i+1)%len(outline_top)
        p=outline_shoulder[i];q=outline_shoulder[j]
        dx=q[0]-p[0];dz=q[2]-p[2]
        ln=math.hypot(dx,dz)
        if ln<1e-8:raise ValueError("Degenerate perimeter segment")
        outward=(-dz/ln,0.,dx/ln)
        bevel_normal=(outward[0]*math.sqrt(.5),math.sqrt(.5),outward[2]*math.sqrt(.5))
        # 4mm continuous real bevel around BOTH curved AND radial sides.
        bevel_pts=[outline_top[i],outline_top[j],outline_shoulder[j],outline_shoulder[i]]
        m.quad(bevel_pts,bevel_normal,[uv(v) for v in bevel_pts])
        wall_pts=[outline_shoulder[i],outline_shoulder[j],outline_bottom[j],outline_bottom[i]]
        m.quad(wall_pts,outward,[(0,1),(ln,1),(ln,0),(0,0)])
    for i in range(SEGMENTS):
        pts=[outline_bottom[i],outline_bottom[i+1],
             outline_bottom[-i-2],outline_bottom[-i-1]]
        m.quad(pts,(0,-1,0))
    return m,{"worldAnchorXZ":[rounded(ax),rounded(az)],
              "absoluteSectorStartDegrees":c["sectorStartDegrees"],
              "absoluteSectorEndDegrees":c["sectorEndDegrees"],
              "radialBoundsM":[R0,R1],
              "arcWidthMeanM":1.0,"subdivisions":SEGMENTS,
              "pbrTextureSha256":FROZEN_TEXTURE_SHA}

def validate_geometry(m):
    assert len(m.pos)==len(m.norm)
    assert len(m.uv)//2==len(m.pos)//3
    assert len(m.indices)%3==0
    assert len(m.pos)//3<65535
    for i in range(0,len(m.indices),3):
        pts=[m.pos[3*m.indices[k]:3*m.indices[k]+3] for k in range(i,i+3)]
        u=[pts[1][k]-pts[0][k] for k in range(3)]
        v=[pts[2][k]-pts[0][k] for k in range(3)]
        cross=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]]
        if math.sqrt(sum(q*q for q in cross))<1e-10:
            raise ValueError("Zero area GLB triangle at "+str(i//3))
    assert min(m.pos[1::3])==0
    assert abs(max(m.pos[1::3])-.06)<1e-6
    return len(m.indices)//3

def retag(raw,extras):
    assert raw[:4]==b"glTF"
    json_len,typ=struct.unpack_from("<I4s",raw,12)
    assert typ==b"JSON"
    gltf=json.loads(raw[20:20+json_len])
    off=20+json_len
    bin_len,bin_type=struct.unpack_from("<I4s",raw,off)
    assert bin_type==b"BIN\0"
    binary=raw[off+8:off+8+bin_len]
    assert len(binary)==bin_len
    name="S7-FLOOR-F01-F"
    gltf["asset"]["generator"]="Trialum ORIGINAL F01-F survey-aligned sector / frozen F01-A PBR"
    gltf["scenes"][0]["name"]=name
    gltf["nodes"][0]["name"]=name+" :: premium 1m curved cream marble"
    gltf["nodes"][0]["extras"]={
       "assetId":name,"family":"S7-FLOOR-F01","module":"F01-F",
       "geometrySource":"G01 real r=9.15m dry walkway outside perimeter",
       "ownerRenderApproval":True,"ownerModelApproval":False,
       "placement":"ONE dry external trial sector; never blanket-cover water",
       "pivot":"LOCAL (0,0,0) = start of inner arc",
       "tileThicknessM":.06,"bevelM":.004,
       "units":"m","axis":"Y_UP","worldUV":"original G01 XZ metres",
       "material":"F01.cream-white.PBR-dry",
       "noGameStateWrites":True,"inGame":False,"gameAuthority":False,
       **extras
    }
    gltf["meshes"][0]["name"]=name+".CurvedBevelledSolid"
    gltf["images"][0]["name"]="Exact F01-A owner-approved seamless cream marble"
    js=json.dumps(gltf,separators=(",",":"),ensure_ascii=False).encode("utf-8")
    js+=b" "*(-len(js)%4)
    return (b"glTF"+struct.pack("<II",2,12+8+len(js)+8+len(binary))+
            struct.pack("<I4s",len(js),b"JSON")+js+
            struct.pack("<I4s",len(binary),b"BIN\0")+binary)

def main():
    spec=json.loads(SPEC_PATH.read_text(encoding="utf8"))
    assert spec["ownerVisualApproval"] is True and spec["module"]=="F01-F"
    assert spec["gameplayWrites"]==0
    image=F01["make_marble_png"]()
    assert hashlib.sha256(image).hexdigest()==FROZEN_TEXTURE_SHA
    frozen=F01["build_glb"](F01["create_tile"](),image)
    assert hashlib.sha256(frozen).hexdigest()==FROZEN_F01_A_SHA,"Original F01-A must never drift"
    mesh,extra=build_mesh(spec)
    triangles=validate_geometry(mesh)
    binary=retag(F01["build_glb"](mesh,image),extra)
    assert binary[:4]==b"glTF" and struct.unpack_from("<I",binary,8)[0]==len(binary)
    assert len(binary)<160_000
    OUT.mkdir(parents=True,exist_ok=True)
    (OUT/NAME).write_bytes(binary)
    (OUT/"f01-marble-cream-basecolor-shared.png").write_bytes(image)
    manifest={"schemaVersion":1,"assetId":"S7-FLOOR-F01-F",
       "source":"G01 measured annulus outside walkway, dry-only sample",
       "ownerRenderApproved":True,"ownerModelApproved":False,
       "glbBuilt":True,"inGame":False,"gameplayWrites":0,
       "glb":NAME,"glbSizeBytes":len(binary),
       "glbSha256":hashlib.sha256(binary).hexdigest(),
       "textureSha256":hashlib.sha256(image).hexdigest(),
       "frozenF01ASha256":FROZEN_F01_A_SHA,
       "vertices":len(mesh.pos)//3,"triangles":triangles,
       "geometry":extra}
    (OUT/"qa-manifest.json").write_text(json.dumps(manifest,indent=2)+"\n",encoding="utf8")
    print(json.dumps(manifest,indent=2))

if __name__=="__main__":
    main()
