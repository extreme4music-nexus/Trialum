#!/usr/bin/env python3
"""Verify 4 authentic 0.5 x 0.5 x 0.06m F01-C quarter GLBs, UV phase and frozen A/B."""
from __future__ import annotations
import hashlib, json, pathlib, struct, unittest

ROOT=pathlib.Path(__file__).resolve().parents[1]
OUT=ROOT/"build/s7-floor-f01/F01-C"
MASTER_A="787965608e2e4005a0ee84c857d7f0379a8093149b39da6bacb2d012feafc147"
MASTER_IMG="81c434a57b770148ced6e9c40dccabade929a844a27b143f2dc13a4da0ff8c98"
MASTER_B=["d5b88ef3079066ce6bba317e6f38196d13bd316f7a24eee8404177506b7cae8e",
          "db04892a98d14bb7ab8c92270042f3dc5f22edb782575200fed2d43acad3c5d5"]


def read_glb(path):
    d=path.read_bytes()
    assert d[:4]==b"glTF"
    assert struct.unpack_from("<II",d,4)==(2,len(d))
    jslen,tag=struct.unpack_from("<I4s",d,12)
    assert tag==b"JSON"
    m=json.loads(d[20:20+jslen])
    pos=20+jslen
    length,tag=struct.unpack_from("<I4s",d,pos)
    assert tag==b"BIN\0"
    blob=d[pos+8:pos+8+length]
    assert len(blob)==length
    return d,m,blob


def vecs(m,blob,accessor_id):
    a=m["accessors"][accessor_id]
    v=m["bufferViews"][a["bufferView"]]
    off=v.get("byteOffset",0)+a.get("byteOffset",0)
    dim={"VEC2":2,"VEC3":3}[a["type"]]
    assert a["componentType"]==5126
    flat=struct.unpack_from("<"+"f"*(a["count"]*dim),blob,off)
    return [list(flat[i:i+dim]) for i in range(0,len(flat),dim)]


class VerifyC(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.manifest=json.loads((OUT/"qa-manifest.json").read_text(encoding="utf-8"))
        cls.rows={}
        for v in cls.manifest["models"]:
            cls.rows[v["assetId"]]=(v,*read_glb(OUT/v["glb"]))

    def test_four_unique_REAL_GLBS_and_correct_size(self):
        self.assertEqual(len(list(OUT.glob("*.glb"))),4)
        self.assertEqual(set(self.rows),{"S7-FLOOR-F01-"+x for x in ("C1","C2","C3","C4")})
        for name,(meta,raw,glb,blob) in self.rows.items():
            self.assertEqual(meta["assetId"],name)
            self.assertEqual(glb["nodes"][0]["extras"]["assetId"],name)
            self.assertEqual(glb["scene"],0)
            self.assertEqual(len(glb["meshes"]),1)
            self.assertEqual(glb["meshes"][0]["primitives"][0]["mode"],4)
            self.assertEqual(meta["triangles"],20)
            self.assertEqual(meta["vertices"],40)
            self.assertGreater(len(raw),60_000)
            self.assertLess(len(raw),120_000)
            self.assertEqual(hashlib.sha256(raw).hexdigest(),meta["sha256"])

    def test_metric_bounds_thickness_and_pivot(self):
        for _,(_,_,glb,blob) in self.rows.items():
            pr=glb["meshes"][0]["primitives"][0]
            p=glb["accessors"][pr["attributes"]["POSITION"]]
            self.assertEqual(p["min"],[0,0,0])
            self.assertEqual(p["max"],[.5,.06,.5])
            self.assertEqual(p["count"],40)
            self.assertEqual(glb["nodes"][0]["extras"]["origin"],"bottom-left")
            self.assertEqual(glb["nodes"][0]["extras"]["dimensionXYZMeters"],[.5,.06,.5])

    def test_frozen_A_B_texture_and_pbr_exact_identity(self):
        self.assertEqual(self.manifest["unchangedFullTileSHA256"],MASTER_A)
        self.assertEqual(self.manifest["unchangedHalfTileSHAs"],MASTER_B)
        self.assertEqual(self.manifest["commonTextureSHA256"],MASTER_IMG)
        image=(OUT/self.manifest["commonTexture"]).read_bytes()
        self.assertEqual(hashlib.sha256(image).hexdigest(),MASTER_IMG)
        self.assertEqual(struct.unpack(">II",image[16:24]),(384,384))
        for _,(_,_,g,binary) in self.rows.items():
            mat=g["materials"][0]["pbrMetallicRoughness"]
            self.assertEqual(mat["metallicFactor"],0)
            self.assertEqual(mat["roughnessFactor"],.275)
            self.assertEqual(g["materials"][0]["name"],"F01.cream-white.PBR-dry")
            iv=g["bufferViews"][g["images"][0]["bufferView"]]
            embedded=binary[iv["byteOffset"]:iv["byteOffset"]+iv["byteLength"]]
            self.assertEqual(embedded,image)
            self.assertEqual(g["samplers"][0]["wrapS"],10497)
            self.assertEqual(g["samplers"][0]["wrapT"],10497)

    def test_four_quadrants_texture_maps_into_one_original_meter(self):
        expected={"S7-FLOOR-F01-C1":(0.,0.),
                  "S7-FLOOR-F01-C2":(.5,0.),
                  "S7-FLOOR-F01-C3":(0.,.5),
                  "S7-FLOOR-F01-C4":(.5,.5)}
        for name,(metadata,raw,g,binary) in self.rows.items():
            ox,oz=expected[name]
            self.assertEqual(metadata["placeAtOffsetXZ"],[ox,oz])
            pr=g["meshes"][0]["primitives"][0]
            verts=vecs(g,binary,pr["attributes"]["POSITION"])
            tex=vecs(g,binary,pr["attributes"]["TEXCOORD_0"])
            self.assertEqual(len(verts),len(tex))
            for (x,y,z),(u,v) in zip(verts[:4],tex[:4]):
                self.assertAlmostEqual(u,x+ox,places=6)
                self.assertAlmostEqual(v,z+oz,places=6)
                self.assertAlmostEqual(y,.06,places=6)
            self.assertEqual(metadata["topUVURange"],[ox+.004,ox+.496])
            self.assertEqual(metadata["topUVVRange"],[oz+.004,oz+.496])
        # The four offsets cover the same four sub-squares as one metre A.
        self.assertEqual({tuple(v["placeAtOffsetXZ"]) for v,_,_,_ in self.rows.values()},set(expected.values()))

    def test_no_gameplay_changes_or_extra_stages(self):
        self.assertFalse(self.manifest["inGame"])
        self.assertFalse(self.manifest["newAPK"])
        self.assertFalse(self.manifest["ownerF01CModelPass"])
        self.assertEqual(self.manifest["gameplayWrites"],0)
        self.assertEqual(self.manifest["remainingF01Modules"],["F01-D","F01-E","F01-F","F01-G","F01-H","F01-I"])

if __name__=="__main__":
    unittest.main(verbosity=2)
