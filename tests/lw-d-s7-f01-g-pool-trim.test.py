#!/usr/bin/env python3
"""S7 F01-G — actual glTF 2.0 owner-render-referenced premium poolside trim QA.
Does not allow a screenshot to substitute for genuine GLB geometry.
"""
import hashlib,json,math,struct,unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
DIR=ROOT/"build/s7-floor-f01/F01-G"
ORIGINAL_A_SHA="787965608e2e4005a0ee84c857d7f0379a8093149b39da6bacb2d012feafc147"
TEX_SHA="81c434a57b770148ced6e9c40dccabade929a844a27b143f2dc13a4da0ff8c98"
NAMES=("f01-g-cream-marble-pool-trim-1m.glb",
       "f01-g-cream-marble-pool-trim-half.glb",
       "f01-g-cream-marble-pool-trim-3m-showcase.glb")
def decode(path):
 data=path.read_bytes()
 assert data[:4]==b"glTF" and struct.unpack_from("<II",data,4)==(2,len(data))
 n,typ=struct.unpack_from("<I4s",data,12)
 assert typ==b"JSON"
 model=json.loads(data[20:20+n])
 size,typ=struct.unpack_from("<I4s",data,20+n)
 assert typ==b"BIN\0"
 return data,model,data[28+n:28+n+size]
class RealPoolTrim(unittest.TestCase):
 def test_three_distinct_actual_glb2_files(self):
  manifest=json.loads((DIR/"qa-manifest.json").read_text())
  self.assertEqual(len(manifest["assets"]),3)
  self.assertEqual({x["name"] for x in manifest["assets"]},set(NAMES))
  self.assertEqual(manifest["originalF01TextureSha256"],TEX_SHA)
  self.assertEqual(manifest["originalFrozenF01ASha256"],ORIGINAL_A_SHA)
  self.assertEqual(manifest["gameplayWrites"],0)
  for row in manifest["assets"]:
   raw,model,binary=decode(DIR/row["name"])
   self.assertEqual(hashlib.sha256(raw).hexdigest(),row["sha256"])
   self.assertEqual(len(raw),row["bytes"])
   self.assertEqual(model["asset"]["version"],"2.0")
   self.assertEqual(model["nodes"][0]["extras"]["module"],"F01-G")
   self.assertFalse(model["nodes"][0]["extras"]["inGame"])
   self.assertEqual(model["nodes"][0]["extras"]["gameplayWrites"],0)
   self.assertGreater(len(raw),60000)
   self.assertGreater(len(model["meshes"]),0)
   self.assertEqual(model["materials"][0]["pbrMetallicRoughness"]["metallicFactor"],0)
   self.assertAlmostEqual(model["materials"][0]["pbrMetallicRoughness"]["roughnessFactor"],.225)
   self.assertEqual(model["images"][0]["mimeType"],"image/png")
   texView=model["bufferViews"][model["images"][0]["bufferView"]]
   tex=binary[texView["byteOffset"]:texView["byteOffset"]+texView["byteLength"]]
   self.assertEqual(hashlib.sha256(tex).hexdigest(),TEX_SHA)
 def test_curve_dimensions_and_variants(self):
  for f,segs in [(NAMES[0],1),(NAMES[1],.5),(NAMES[2],3)]:
   _,j,_=decode(DIR/f)
   meta=j["nodes"][0]["extras"]
   self.assertAlmostEqual(meta["realG01RadiusInnerM"],8.2)
   self.assertAlmostEqual(meta["realG01RadiusOuterM"],8.39)
   self.assertAlmostEqual(meta["heightM"],.135)
   self.assertAlmostEqual(meta["topBevelM"],.008)
   self.assertAlmostEqual(meta["arcRadians"],math.tau/48*segs)
   self.assertEqual(meta["modular"],segs!=3)
   bounds=j["accessors"][0]
   self.assertGreater(bounds["max"][2]-bounds["min"][2],.3)
   self.assertLess(bounds["max"][1],.13501)
   self.assertGreater(bounds["max"][1],.13499)
if __name__=="__main__":unittest.main(verbosity=2)
