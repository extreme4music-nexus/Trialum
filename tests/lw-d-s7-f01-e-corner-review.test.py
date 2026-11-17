#!/usr/bin/env python3
"""F01-E original 4 corner caps must exactly fit F01-D in 3D, no game edits."""
from __future__ import annotations
import hashlib
import json
from pathlib import Path
import struct
import unittest

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"build/s7-floor-f01/F01-E"
TEX_SHA="81c434a57b770148ced6e9c40dccabade929a844a27b143f2dc13a4da0ff8c98"
A_SHA="787965608e2e4005a0ee84c857d7f0379a8093149b39da6bacb2d012feafc147"
EXPECTED={
 "north-west":([-.06,0,-.06],[0,.056,0]),
 "north-east":([1,0,-.06],[1.06,.056,0]),
 "south-east":([1,0,1],[1.06,.056,1.06]),
 "south-west":([-.06,0,1],[0,.056,1.06])
}


def glb(path):
    raw=path.read_bytes()
    assert raw[:4]==b"glTF"
    assert struct.unpack_from("<II",raw,4)==(2,len(raw))
    n,tag=struct.unpack_from("<I4s",raw,12)
    assert tag==b"JSON"
    model=json.loads(raw[20:20+n])
    pos=20+n
    size,tag=struct.unpack_from("<I4s",raw,pos)
    assert tag==b"BIN\0"
    data=raw[pos+8:pos+8+size]
    assert len(data)==size
    return raw,model,data


def attribute(model,data,index):
    a=model["accessors"][index]
    bv=model["bufferViews"][a["bufferView"]]
    o=bv.get("byteOffset",0)+a.get("byteOffset",0)
    n={"VEC3":3,"VEC2":2,"SCALAR":1}[a["type"]]
    code={5126:"f",5123:"H"}[a["componentType"]]
    flat=struct.unpack_from("<%d%s"%(a["count"]*n,code),data,o)
    return [flat[i:i+n] for i in range(0,len(flat),n)]


class Corners(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.manifest=json.loads((OUT/"qa-manifest.json").read_text())
        cls.models={m["corner"]:(m,*glb(OUT/m["glb"])) for m in cls.manifest["models"]}

    def test_true_four_glb_corner_files_and_exact_metric_bounds(self):
        self.assertEqual(set(self.models),set(EXPECTED))
        self.assertEqual(len(list(OUT.glob("*.glb"))),4)
        for corner,(m,raw,data,binary) in self.models.items():
            self.assertEqual(hashlib.sha256(raw).hexdigest(),m["glbSha256"])
            self.assertEqual(data["asset"]["version"],"2.0")
            self.assertEqual(data["scene"],0)
            self.assertEqual(len(data["meshes"]),1)
            p=data["meshes"][0]["primitives"][0]
            self.assertEqual(p["mode"],4)
            self.assertEqual(m["triangles"],18)
            self.assertEqual(m["vertices"],44)
            bounds=data["accessors"][p["attributes"]["POSITION"]]
            self.assertEqual(bounds["count"],44)
            for actual,expected in zip(bounds["min"],EXPECTED[corner][0]):
                self.assertAlmostEqual(actual,expected,places=6)
            for actual,expected in zip(bounds["max"],EXPECTED[corner][1]):
                self.assertAlmostEqual(actual,expected,places=6)
            self.assertEqual(data["nodes"][0]["extras"]["inGame"],False)

    def test_never_overlaps_original_F01_A_tile_volume(self):
        for corner,(meta,raw,data,binary) in self.models.items():
            mesh=data["meshes"][0]["primitives"][0]
            p=attribute(data,binary,mesh["attributes"]["POSITION"])
            for x,y,z in p:
                self.assertTrue(y>=0)
                self.assertTrue((x<=.0000001 if "west" in corner else x>=.9999999))
                self.assertTrue((z<=.0000001 if "north" in corner else z>=.9999999))
                self.assertTrue(x<0 or x>1 or z<0 or z>1 or y<=.056+1e-7)

    def test_all_upper_boundaries_match_D_edge_nose_height(self):
        for corner,(meta,raw,data,binary) in self.models.items():
            prim=data["meshes"][0]["primitives"][0]
            pts=attribute(data,binary,prim["attributes"]["POSITION"])
            x0=0 if "west" in corner else 1
            z0=0 if "north" in corner else 1
            sx=-1 if "west" in corner else 1
            sz=-1 if "north" in corner else 1
            by={} # (u,v) -> top expected Y
            for x,y,z in pts:
                u=round((x-x0)*sx,6);v=round((z-z0)*sz,6)
                if y>.045:by[(u,v)]=round(y,6)
            for u in (0.,.056,.06):
                self.assertIn((u,0.),by)
                self.assertIn((0.,u),by)
                correct=round(.056-max(0,u-.056),6)
                self.assertAlmostEqual(by[(u,0.)],correct,places=5)
                self.assertAlmostEqual(by[(0.,u)],correct,places=5)

    def test_genuine_triangle_normals_and_index_winding(self):
        for corner,(meta,raw,data,binary) in self.models.items():
            p=data["meshes"][0]["primitives"][0]
            xyz=attribute(data,binary,p["attributes"]["POSITION"])
            norm=attribute(data,binary,p["attributes"]["NORMAL"])
            indices=[x[0] for x in attribute(data,binary,p["indices"])]
            self.assertEqual(len(indices),54)
            for i in range(0,len(indices),3):
                a,b,c=[xyz[z] for z in indices[i:i+3]]
                u=[b[k]-a[k] for k in range(3)]
                v=[c[k]-a[k] for k in range(3)]
                cross=(u[1]*v[2]-u[2]*v[1],
                       u[2]*v[0]-u[0]*v[2],
                       u[0]*v[1]-u[1]*v[0])
                n=norm[indices[i]]
                self.assertGreater(sum(cross[k]*n[k] for k in range(3)),1e-9,
                    "bad face orientation "+corner)

    def test_approved_F01_A_D_unmodified_and_exact_PBR_texture(self):
        self.assertEqual(self.manifest["originalA_SHA256"],A_SHA)
        texture=(OUT/"f01-marble-cream-basecolor-shared.png").read_bytes()
        self.assertEqual(hashlib.sha256(texture).hexdigest(),TEX_SHA)
        for _,(_,raw,data,blob) in self.models.items():
            pbr=data["materials"][0]["pbrMetallicRoughness"]
            self.assertEqual(pbr["metallicFactor"],0)
            self.assertEqual(pbr["roughnessFactor"],.275)
            img=data["images"][0];self.assertEqual(img["mimeType"],"image/png")
            view=data["bufferViews"][img["bufferView"]]
            embedded=blob[view["byteOffset"]:view["byteOffset"]+view["byteLength"]]
            self.assertEqual(embedded,texture)

    def test_no_scene_gameplay_or_apk_changes_until_owner_review(self):
        m=self.manifest
        self.assertFalse(m["inGame"])
        self.assertFalse(m["newAndroidAPK"])
        self.assertFalse(m["ownerApproval"])
        self.assertEqual(m["originalEngineWrites"],0)
        self.assertEqual(m["threeDSceneChanges"],0)
        self.assertIn("survey",m["nextStep"])

if __name__=="__main__":
    unittest.main(verbosity=2)
