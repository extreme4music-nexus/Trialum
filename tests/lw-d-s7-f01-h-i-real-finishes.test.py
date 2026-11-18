#!/usr/bin/env python3
"""QA for the two genuine F01-H / F01-I premium cream-white marble GLBs."""
import hashlib,json,math,struct,unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"build/s7-floor-f01/F01-HI"
EXPECTED_TEX="81c434a57b770148ced6e9c40dccabade929a844a27b143f2dc13a4da0ff8c98"
A_SHA="787965608e2e4005a0ee84c857d7f0379a8093149b39da6bacb2d012feafc147"
NAMES={"H":"f01-h-cream-marble-matte-service.glb",
       "I":"f01-i-cream-marble-fine-textured-wet.glb"}

def load(file):
    raw=file.read_bytes()
    assert raw[:4]==b"glTF" and struct.unpack_from("<II",raw,4)==(2,len(raw))
    size,typ=struct.unpack_from("<I4s",raw,12)
    assert typ==b"JSON"
    g=json.loads(raw[20:20+size])
    bsize,typ=struct.unpack_from("<I4s",raw,20+size)
    assert typ==b"BIN\0"
    binary=raw[28+size:28+size+bsize]
    assert len(binary)==bsize
    return raw,g,binary

class RealMarbleFinishes(unittest.TestCase):
    def test_original_approved_F01_A_is_frozen_and_both_glbs_are_real(self):
        m=json.loads((OUT/"qa-manifest.json").read_text())
        self.assertEqual(m["frozenOriginalAGlbSha256"],A_SHA)
        self.assertEqual(m["frozenOriginalATextureSha256"],EXPECTED_TEX)
        self.assertEqual(len(m["assets"]),2)
        self.assertEqual(m["gameplayWrites"],0)
        for e in m["assets"]:
            raw,g,binary=load(OUT/e["file"])
            self.assertEqual(hashlib.sha256(raw).hexdigest(),e["sha256"])
            self.assertLess(len(raw),500000)
            self.assertEqual(g["asset"]["version"],"2.0")
            self.assertEqual(len(g["meshes"]),1)
            self.assertEqual(len(g["images"]),2)
            self.assertEqual(len(g["textures"]),2)
            self.assertTrue(g["meshes"][0]["primitives"][0]["attributes"].get("NORMAL") is not None)
            self.assertTrue(g["meshes"][0]["primitives"][0]["attributes"].get("TEXCOORD_0") is not None)
            self.assertEqual(g["nodes"][0]["extras"]["module"],e["module"])
            self.assertFalse(g["nodes"][0]["extras"]["inGame"])
            self.assertTrue(g["nodes"][0]["extras"]["ownerModelVisualReviewPending"])
            self.assertFalse(g["nodes"][0]["extras"]["actualTestedSlipResistance"])
            for img in g["images"]:
                view=g["bufferViews"][img["bufferView"]]
                embedded=binary[view["byteOffset"]:view["byteOffset"]+view["byteLength"]]
                self.assertTrue(embedded.startswith(b"\x89PNG"))
                if img==g["images"][0]:
                    self.assertEqual(hashlib.sha256(embedded).hexdigest(),EXPECTED_TEX)

    def test_both_are_1x1x6cm_but_physically_distinct_finishes(self):
        checks=(("H",.70,False),("I",.86,True))
        for mode,roughness,toptextured in checks:
            _,g,_=load(OUT/NAMES[mode])
            m=g["nodes"][0]["extras"]
            self.assertEqual(m["dimensionsM"],[1,.06,1])
            self.assertAlmostEqual(m["bevelM"],.004)
            self.assertEqual(m["realTopSurfaceDisplacement"],toptextured)
            self.assertEqual(m["normalMapEmbedded"],True)
            self.assertEqual(m["gameAuthority"],False)
            pbr=g["materials"][0]["pbrMetallicRoughness"]
            self.assertEqual(pbr["metallicFactor"],0)
            self.assertAlmostEqual(pbr["roughnessFactor"],roughness)
            self.assertGreater(g["materials"][0]["normalTexture"]["scale"],0)
            v=g["accessors"][0]
            self.assertEqual(v["min"][0],0)
            self.assertEqual(v["min"][1],0)
            self.assertEqual(v["min"][2],0)
            self.assertEqual(v["max"][0],1)
            self.assertAlmostEqual(v["max"][1],.06)
            self.assertEqual(v["max"][2],1)
        _,h,_=load(OUT/NAMES["H"])
        _,i,_=load(OUT/NAMES["I"])
        self.assertGreater(i["accessors"][0]["count"],h["accessors"][0]["count"]*100)
        self.assertGreater(i["accessors"][3]["count"],6000)

if __name__=="__main__":unittest.main(verbosity=2)
