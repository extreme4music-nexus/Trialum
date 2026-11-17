#!/usr/bin/env python3
"""Owner-approved F01-A compatible half tile pair: actual glTF, UV and engine-safety tests."""
from __future__ import annotations
import hashlib,json,pathlib,struct,unittest

ROOT=pathlib.Path(__file__).resolve().parents[1]
OUT=ROOT/"build/s7-floor-f01/F01-B"
REFERENCE_GLBSHA="787965608e2e4005a0ee84c857d7f0379a8093149b39da6bacb2d012feafc147"
REFERENCE_TEXSHA="81c434a57b770148ced6e9c40dccabade929a844a27b143f2dc13a4da0ff8c98"

def parse_glb(path):
    raw=path.read_bytes()
    assert raw[:4]==b"glTF"
    assert struct.unpack_from("<II",raw,4)==(2,len(raw))
    size,typ=struct.unpack_from("<I4s",raw,12)
    assert typ==b"JSON"
    model=json.loads(raw[20:20+size])
    off=20+size
    blen,bt=struct.unpack_from("<I4s",raw,off)
    assert bt==b"BIN\0"
    bin_data=raw[off+8:off+8+blen]
    assert len(bin_data)==blen
    return raw,model,bin_data

def get_accessor(model,binary,access_id):
    acc=model["accessors"][access_id]
    bv=model["bufferViews"][acc["bufferView"]]
    off=bv.get("byteOffset",0)+acc.get("byteOffset",0)
    typ=acc["type"]
    size={"SCALAR":1,"VEC2":2,"VEC3":3}[typ]
    assert acc["componentType"]==5126
    fmt="<"+"f"*(acc["count"]*size)
    return [list(v) for v in zip(*[iter(struct.unpack_from(fmt,binary,off))]*size)]

class TestF01BHalf(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.manifest=json.loads((OUT/"qa-manifest.json").read_text(encoding="utf-8"))
        cls.records={}
        for item in cls.manifest["models"]:
            raw,model,binary=parse_glb(OUT/item["filename"])
            cls.records[item["assetId"]]=(item,raw,model,binary)

    def test_two_real_glbs_only_no_2d_fakes(self):
        self.assertEqual(set(self.records),{"S7-FLOOR-F01-B1","S7-FLOOR-F01-B2"})
        self.assertEqual(len(list(OUT.glob("*.glb"))),2)
        for asset,(meta,raw,m,binary) in self.records.items():
            self.assertEqual(len(m["meshes"]),1)
            self.assertEqual(m["asset"]["version"],"2.0")
            self.assertEqual(m["nodes"][0]["extras"]["assetId"],asset)
            self.assertEqual(m["meshes"][0]["primitives"][0]["mode"],4)
            self.assertEqual(hashlib.sha256(raw).hexdigest(),meta["glbSha256"])
            self.assertEqual(meta["triangles"],20)
            self.assertLess(len(raw),120_000)

    def test_half_meter_metric_geometry_and_bottom_left_pivot(self):
        for meta,raw,m,binary in self.records.values():
            prim=m["meshes"][0]["primitives"][0]
            positions=m["accessors"][prim["attributes"]["POSITION"]]
            self.assertEqual(positions["min"],[0,0,0])
            self.assertEqual(positions["max"],[1,.06,.5])
            self.assertEqual(positions["count"],40)
            self.assertEqual(m["nodes"][0]["extras"]["origin"],"bottom-left")
            self.assertEqual(m["nodes"][0]["translation"] if "translation" in m["nodes"][0] else [0,0,0],[0,0,0])
            self.assertEqual(meta["dimensionsMeters"],[1,.06,.5])

    def test_owner_F01_A_marble_is_identical_without_recompression(self):
        self.assertEqual(self.manifest["originalF01AUnchangedSha256"],REFERENCE_GLBSHA)
        self.assertEqual(self.manifest["sharedTextureSha256"],REFERENCE_TEXSHA)
        source_image=(OUT/"f01-marble-cream-basecolor-shared.png").read_bytes()
        self.assertEqual(hashlib.sha256(source_image).hexdigest(),REFERENCE_TEXSHA)
        for asset,(meta,raw,m,binary) in self.records.items():
            mat=m["materials"][0]
            self.assertEqual(mat["name"],"F01.cream-white.PBR-dry")
            pbr=mat["pbrMetallicRoughness"]
            self.assertEqual(pbr["metallicFactor"],0)
            self.assertEqual(pbr["roughnessFactor"],.275)
            view=m["bufferViews"][m["images"][0]["bufferView"]]
            img=binary[view["byteOffset"]:view["byteOffset"]+view["byteLength"]]
            self.assertEqual(img,source_image)

    def test_uv_preserves_one_meter_scale_and_validated_midline(self):
        for variant,zshift in (("S7-FLOOR-F01-B1",0.),("S7-FLOOR-F01-B2",.5)):
            meta,raw,m,binary=self.records[variant]
            prim=m["meshes"][0]["primitives"][0]
            pos=get_accessor(m,binary,prim["attributes"]["POSITION"])
            uvs=get_accessor(m,binary,prim["attributes"]["TEXCOORD_0"])
            self.assertEqual(len(pos),len(uvs))
            # The four upper vertices reconstruct original A texture by
            # transforming physical half coordinates with the correct phase.
            for (x,y,z),(u,v) in zip(pos[:4],uvs[:4]):
                self.assertAlmostEqual(x,u,places=6)
                self.assertAlmostEqual(z+zshift,v,places=6)
                self.assertAlmostEqual(y,.06,places=6)
            self.assertEqual(meta["placeAtZOffsetMeters"],zshift)
            self.assertEqual(m["nodes"][0]["extras"]["textureVRange"],[zshift,zshift+.5])
        # Texture stages meet exactly in the same 1x1 UV frame; never repeat
        # two B1s adjacent as that would reset the veining pattern at v=.5.
        b1=self.records["S7-FLOOR-F01-B1"][0]
        b2=self.records["S7-FLOOR-F01-B2"][0]
        self.assertAlmostEqual(b1["topUVVRange"][1]+.008,b2["topUVVRange"][0])

    def test_no_game_mutations_no_phantom_slots_or_android_apk(self):
        self.assertFalse(self.manifest["inGame"])
        self.assertFalse(self.manifest["newAPK"])
        self.assertFalse(self.manifest["ownerF01BModelPass"])
        self.assertTrue(self.manifest["ownerF01AModelPass"])
        self.assertEqual(self.manifest["gameplayWrites"],0)
        self.assertIn("F01-C",self.manifest["remainingF01"])

if __name__=="__main__":
    unittest.main(verbosity=2)
