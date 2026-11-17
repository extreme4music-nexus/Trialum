#!/usr/bin/env python3
"""Trialum S7.8-B / F01-B — TWO complementary 1.0 x 0.5 m real GLBs.
Both half-tiles have the EXACT same marble PNG/PBR as owner-approved F01-A.
No engine/scene/Android edits. Python standard library only.

Why two B subvariants? A single half-tile with the UV range 0..0.5 repeated
twice would RESET veins at the middle seam. F01-B1 maps v=0..0.5 and F01-B2
maps v=0.5..1.0. Place B2 at z+0.5 alongside B1. Together they reconstruct
the original whole tile's natural stone pattern without introducing a join.
"""
from __future__ import annotations
import hashlib
import json
import math
from pathlib import Path
import runpy
import struct

ROOT=Path(__file__).resolve().parents[2]
SOURCE=ROOT/"tools/b1/build-s7-f01-marble.py"
F01=runpy.run_path(str(SOURCE))
OUT=ROOT/"build/s7-floor-f01/F01-B"
OUT.mkdir(parents=True,exist_ok=True)

THICKNESS=.06
BEVEL=.004
WIDTH=1.0
DEPTH=.5
SOURCE_IMAGE_SHA="81c434a57b770148ced6e9c40dccabade929a844a27b143f2dc13a4da0ff8c98"
SOURCE_FULL_GLB_SHA="787965608e2e4005a0ee84c857d7f0379a8093149b39da6bacb2d012feafc147"


def make_half_mesh(v_offset:float):
    assert v_offset in (0.,.5)
    m=F01["Mesh"]()
    t=THICKNESS
    e=BEVEL
    d=DEPTH
    a=[(e,t,e),(WIDTH-e,t,e),(WIDTH-e,t,d-e),(e,t,d-e)]
    b=[(0,t-e,0),(WIDTH,t-e,0),(WIDTH,t-e,d),(0,t-e,d)]
    c=[(0,0,0),(WIDTH,0,0),(WIDTH,0,d),(0,0,d)]
    m.quad(a,(0,1,0),[
        (e,v_offset+e),(WIDTH-e,v_offset+e),
        (WIDTH-e,v_offset+d-e),(e,v_offset+d-e)
    ])
    for i in range(4):
        j=(i+1)%4
        tangent=(b[j][0]-b[i][0],b[j][2]-b[i][2])
        normal=(tangent[1],0,-tangent[0])
        length=math.hypot(*normal)
        normal=(normal[0]/length,0,normal[2]/length)
        diagonal=(normal[0]*math.sqrt(.5),math.sqrt(.5),normal[2]*math.sqrt(.5))
        # Use original F01-A bevel + thickness, and same PBR on all faces.
        m.quad([a[i],a[j],b[j],b[i]],diagonal,
               [(0,1),(1,1),(1,.94),(0,.94)])
        m.quad([b[i],b[j],c[j],c[i]],normal,
               [(0,1),(1,1),(1,0),(0,0)])
    m.quad(c,(0,-1,0))
    return m


def repack_half_glb(raw:bytes,variant:str,v_offset:float):
    """Reuse original generator's GLB writer and replace metadata only.
    Geometry, normals, texture and PBR material are made by the SAME code.
    """
    assert raw[:4]==b"glTF"
    json_len,json_tag=struct.unpack_from("<I4s",raw,12)
    assert json_tag==b"JSON"
    j=json.loads(raw[20:20+json_len])
    offset=20+json_len
    bin_len,bin_tag=struct.unpack_from("<I4s",raw,offset)
    assert bin_tag==b"BIN\0"
    binary=raw[offset+8:offset+8+bin_len]
    assert len(binary)==bin_len
    asset_id=f"S7-FLOOR-F01-{variant}"
    j["scenes"][0]["name"]=asset_id
    j["nodes"][0]["name"]=f"{variant}: cream marble half 1 x 0.5m"
    j["nodes"][0]["extras"]={
        "assetId":asset_id,
        "parentFamily":"S7-FLOOR-F01",
        "pairedVariant":"F01-B2" if variant=="F01-B1" else "F01-B1",
        "origin":"bottom-left",
        "units":"m",
        "dimensionsMeters":[WIDTH,THICKNESS,DEPTH],
        "placeAtLocalZ":v_offset,
        "textureVRange":[v_offset,v_offset+DEPTH],
        "ownerF01RenderApproved":True,
        "ownerF01AModelApproved":True,
        "ownerF01BModelApproved":False,
        "gameAuthority":False,
        "changesGameplay":False,
    }
    j["meshes"][0]["name"]=f"{variant}.GenuineHalfMarbleSlab"
    j["images"][0]["name"]="F01.cream-marble.shared-exact-F01-A-texture"
    j["asset"]["generator"]="Trialum S7 F01-B halves sharing F01-A stdlib writer v1"
    out_json=json.dumps(j,separators=(",",":"),ensure_ascii=False).encode("utf-8")
    out_json+=b" "*(-len(out_json)%4)
    size=12+8+len(out_json)+8+len(binary)
    return (b"glTF"+struct.pack("<II",2,size)+
            struct.pack("<I4s",len(out_json),b"JSON")+out_json+
            struct.pack("<I4s",len(binary),b"BIN\0")+binary)


def main():
    tex=F01["make_marble_png"]()
    actual_image_sha=hashlib.sha256(tex).hexdigest()
    assert actual_image_sha==SOURCE_IMAGE_SHA, (
        "Owner-approved F01-A texture changed unexpectedly; STOP before B build"
    )
    # Reproduce approved A byte-for-byte, but do not write a new A asset.
    full=F01["build_glb"](F01["create_tile"](),tex)
    assert hashlib.sha256(full).hexdigest()==SOURCE_FULL_GLB_SHA, (
        "Owner-approved F01-A geometry/material changed unexpectedly; STOP"
    )
    models=[]
    for variant,offset,suffix in (
        ("F01-B1",0.,"half-first"),
        ("F01-B2",.5,"half-second"),
    ):
        m=make_half_mesh(offset)
        glb=repack_half_glb(F01["build_glb"](m,tex),variant,offset)
        name=f"f01-marble-cream-{suffix}.glb"
        (OUT/name).write_bytes(glb)
        models.append({
            "assetId":f"S7-FLOOR-{variant}",
            "filename":name,
            "dimensionsMeters":[WIDTH,THICKNESS,DEPTH],
            "topUVVRange":[offset+BEVEL,offset+DEPTH-BEVEL],
            "placeAtZOffsetMeters":offset,
            "glbBytes":len(glb),
            "glbSha256":hashlib.sha256(glb).hexdigest(),
            "vertices":len(m.pos)//3,
            "triangles":len(m.indices)//3,
            "ownerModelPass":False,
        })
    tex_name="f01-marble-cream-basecolor-shared.png"
    (OUT/tex_name).write_bytes(tex)
    manifest={
        "family":"S7-FLOOR-F01-B","status":"REAL_HALF_GLB_BUILT_FOR_REVIEW_NOT_IN_GAME",
        "ownerF01AModelPass":True,"ownerF01BModelPass":False,
        "textureFile":tex_name,"sharedTextureSha256":actual_image_sha,
        "originalF01AUnchangedSha256":SOURCE_FULL_GLB_SHA,
        "metallic":0,"roughness":.275,"thicknessM":THICKNESS,"bevelM":BEVEL,
        "materialsSource":"exact same existing F01-A procedural material",
        "models":models,"mergeRule":"Place B1 at z=0 and B2 at z=0.5; both use ORIGINAL 1-metre UV scale; never repeat B1 twice with same phase.",
        "gameplayWrites":0,"inGame":False,"newAPK":False,
        "remainingF01":["F01-C","F01-D","F01-E","F01-F","F01-G","F01-H","F01-I"]
    }
    (OUT/"qa-manifest.json").write_text(
        json.dumps(manifest,indent=2,ensure_ascii=False)+"\n",encoding="utf-8"
    )
    print(json.dumps(manifest,indent=2,ensure_ascii=False))


if __name__=="__main__":
    main()
