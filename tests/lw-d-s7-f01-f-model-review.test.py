#!/usr/bin/env python3
"""F01-F review: genuine owner-render-approved radial ivory-marble glTF 2.0, not game-installed."""
from __future__ import annotations
import hashlib
import json
import math
from pathlib import Path
import struct
import unittest

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"build/s7-floor-f01/F01-F"
FILENAME="f01-marble-cream-radial-wedge.glb"
A_SHA="787965608e2e4005a0ee84c857d7f0379a8093149b39da6bacb2d012feafc147"
TEX_SHA="81c434a57b770148ced6e9c40dccabade929a844a27b143f2dc13a4da0ff8c98"

def parse_glb(raw):
    assert raw[:4]==b"glTF" and struct.unpack_from("<II",raw,4)==(2,len(raw))
    jl,tag=struct.unpack_from("<I4s",raw,12)
    assert tag==b"JSON"
    gltf=json.loads(raw[20:20+jl])
    length,typ=struct.unpack_from("<I4s",raw,20+jl)
    assert typ==b"BIN\0"
    binary=raw[28+jl:28+jl+length]
    assert len(binary)==length
    return gltf,binary

def attr(gltf,binary,index):
    a=gltf["accessors"][index]
    v=gltf["bufferViews"][a["bufferView"]]
    offset=v.get("byteOffset",0)+a.get("byteOffset",0)
    count={"VEC3":3,"VEC2":2,"SCALAR":1}[a["type"]]
    fmt={5126:"f",5123:"H"}[a["componentType"]]
    data=struct.unpack_from("<"+fmt*(count*a["count"]),binary,offset)
    return [data[i:i+count] for i in range(0,len(data),count)]

class OwnerMarbleF(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.spec=json.loads((ROOT/"docs/blueprints/S7_F01_F_RADIAL_WEDGE_PREVIEW_SPEC_20261117.json").read_text())
        cls.manifest=json.loads((OUT/"qa-manifest.json").read_text())
        cls.raw=(OUT/FILENAME).read_bytes()
        cls.gltf,cls.binary=parse_glb(cls.raw)
        cls.prim=cls.gltf["meshes"][0]["primitives"][0]

    def test_is_real_one_piece_glb_with_identifiable_geometry(self):
        self.assertEqual(self.gltf["asset"]["version"],"2.0")
        self.assertEqual(len(self.gltf["meshes"]),1)
        self.assertEqual(len(self.gltf["images"]),1)
        self.assertEqual(self.prim["mode"],4)
        self.assertGreater(self.manifest["triangles"],250)
        self.assertLess(len(self.raw),160000)
        self.assertEqual(self.manifest["sha256"],hashlib.sha256(self.raw).hexdigest())

    def test_owner_render_approved_not_independent_model_pass_or_game_install(self):
        self.assertTrue(self.spec["ownerVisualReferenceApproved"])
        self.assertTrue(self.manifest["ownerApprovedConceptStyle"])
        self.assertFalse(self.manifest["ownerCorrectedModelApproval"])
        self.assertEqual(self.manifest["gameplayWrites"],0)
        meta=self.gltf["nodes"][0]["extras"]
        self.assertEqual(meta["assetId"],"S7-FLOOR-F01-F")
        self.assertTrue(meta["previousOversizedStandaloneRejected"])
        self.assertTrue(meta["poolsideNotOutboard"])
        self.assertFalse(meta["inGame"])
        self.assertFalse(meta["gameAuthority"])
        self.assertEqual(meta["subdivisions"],24)
        self.assertEqual(meta["moduleRadialBoundsM"],[7.2,8.2])

    def test_original_approved_F01_A_identical_texture_and_PBR(self):
        self.assertEqual(self.manifest["frozenASha256"],A_SHA)
        self.assertEqual(self.manifest["texSha256"],TEX_SHA)
        texture=(OUT/"f01-marble-cream-basecolor-shared.png").read_bytes()
        self.assertEqual(hashlib.sha256(texture).hexdigest(),TEX_SHA)
        image=self.gltf["images"][0]
        v=self.gltf["bufferViews"][image["bufferView"]]
        self.assertEqual(image["mimeType"],"image/png")
        self.assertEqual(self.binary[v["byteOffset"]:v["byteOffset"]+v["byteLength"]],texture)
        pbr=self.gltf["materials"][0]["pbrMetallicRoughness"]
        self.assertEqual(pbr["metallicFactor"],0)
        self.assertEqual(pbr["roughnessFactor"],.275)

    def test_bevel_bounds_sector_radius_and_topology(self):
        prim=self.prim
        pts=attr(self.gltf,self.binary,prim["attributes"]["POSITION"])
        norms=attr(self.gltf,self.binary,prim["attributes"]["NORMAL"])
        indices=[x[0] for x in attr(self.gltf,self.binary,prim["indices"])]
        uv=attr(self.gltf,self.binary,prim["attributes"]["TEXCOORD_0"])
        self.assertEqual(len(indices),self.manifest["triangles"]*3)
        self.assertEqual(len(pts),len(norms))
        self.assertEqual(len(pts),len(uv))
        self.assertAlmostEqual(min(p[1] for p in pts),0.,places=7)
        self.assertAlmostEqual(max(p[1] for p in pts),.06,places=6)
        anchor=[7.2,0.]
        sectors=self.spec["design"]
        for x,y,z in pts:
            rr=math.hypot(x+anchor[0],z+anchor[1])
            self.assertGreaterEqual(rr,sectors["radialInnerM"]-0.00001)
            self.assertLessEqual(rr,sectors["radialOuterM"]+0.00001)
            if y>=.06-1e-7:
                self.assertGreater(rr,sectors["radialInnerM"])
                self.assertLess(rr,sectors["radialOuterM"])
        for i in range(0,len(indices),3):
            a,b,c=[pts[j] for j in indices[i:i+3]]
            u=[b[k]-a[k] for k in range(3)]
            v=[c[k]-a[k] for k in range(3)]
            cross=(u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0])
            length=math.sqrt(sum(q*q for q in cross))
            self.assertGreater(length,1e-10,"real nondegenerate triangle "+str(i//3))
            n=norms[indices[i]]
            self.assertGreater(sum(cross[k]*n[k] for k in range(3)),0)

if __name__=="__main__":
    unittest.main(verbosity=2)
