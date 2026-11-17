#!/usr/bin/env python3
"""Actual F01-D cardinal 1-metre exposed edges + A/B/C regression safety."""
from __future__ import annotations
import hashlib, json, math, pathlib, struct, unittest
ROOT=pathlib.Path(__file__).resolve().parents[1]
OUT=ROOT/"build/s7-floor-f01/F01-D"
IMAGE_SHA="81c434a57b770148ced6e9c40dccabade929a844a27b143f2dc13a4da0ff8c98"
A_SHA="787965608e2e4005a0ee84c857d7f0379a8093149b39da6bacb2d012feafc147"
EXPECTED={
 "north":((0.,0.,-.06),(1.,.056,0.)),
 "south":((0.,0.,1.),(1.,.056,1.06)),
 "west":((-.06,0.,0.),(0.,.056,1.)),
 "east":((1.,0.,0.),(1.06,.056,1.))
}
def load_model(path):
    raw=path.read_bytes()
    assert raw[:4]==b"glTF"
    assert struct.unpack_from("<II",raw,4)==(2,len(raw))
    n,tag=struct.unpack_from("<I4s",raw,12)
    assert tag==b"JSON"
    m=json.loads(raw[20:20+n])
    bp=20+n;bin_len,tag=struct.unpack_from("<I4s",raw,bp)
    assert tag==b"BIN\0"
    buf=raw[bp+8:bp+8+bin_len]
    assert len(buf)==bin_len
    return raw,m,buf

def acc(m,buf,idx):
    a=m["accessors"][idx]
    view=m["bufferViews"][a["bufferView"]]
    pos=view.get("byteOffset",0)+a.get("byteOffset",0)
    w={"SCALAR":1,"VEC2":2,"VEC3":3}[a["type"]]
    if a["componentType"]==5126:fmt="f"
    elif a["componentType"]==5123:fmt="H"
    else:raise ValueError(a["componentType"])
    n=a["count"]*w
    raw=struct.unpack_from("<"+str(n)+fmt,buf,pos)
    return [tuple(raw[i:i+w]) for i in range(0,n,w)]

class TestD(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.manifest=json.loads((OUT/"qa-manifest.json").read_text(encoding="utf-8"))
        cls.assets={}
        for item in cls.manifest["models"]:
            cls.assets[item["direction"]]=(item,*load_model(OUT/item["glb"]))

    def test_four_real_finite_complete_3d_geometry_modules(self):
        self.assertEqual(set(self.assets),set(EXPECTED))
        self.assertEqual(len(list(OUT.glob("*.glb"))),4)
        for direction,(data,raw,j,buf) in self.assets.items():
            self.assertLess(len(raw),160_000)
            self.assertEqual(hashlib.sha256(raw).hexdigest(),data["glbSha256"])
            self.assertEqual(j["scene"],0)
            self.assertEqual(len(j["meshes"]),1)
            p=j["meshes"][0]["primitives"][0]
            self.assertEqual(p["mode"],4)
            self.assertEqual(data["triangles"],14)
            self.assertEqual(data["vertices"],34)
            self.assertIn("NORMAL",p["attributes"])
            self.assertIn("TEXCOORD_0",p["attributes"])
            self.assertEqual(j["nodes"][0]["extras"]["assetId"],
                             "S7-FLOOR-F01-D-"+direction.upper())
            self.assertEqual(j["nodes"][0]["extras"]["gameAuthority"],False)

    def test_exact_1m_straight_outer_extent_but_zero_overlap_with_tile(self):
        for direction,(meta,_,j,buf) in self.assets.items():
            exp_min,exp_max=EXPECTED[direction]
            p=j["meshes"][0]["primitives"][0]
            a=j["accessors"][p["attributes"]["POSITION"]]
            for actual,expected in zip(a["min"],exp_min):
                self.assertAlmostEqual(actual,expected,places=7)
            for actual,expected in zip(a["max"],exp_max):
                self.assertAlmostEqual(actual,expected,places=7)
            self.assertEqual(a["count"],34)
            self.assertEqual(j["nodes"][0]["extras"]["tileGridPivot"],
                             "(0,0,0) is ORIGINAL F01-A tile bottom-left")
            verts=acc(j,buf,p["attributes"]["POSITION"])
            self.assertEqual(len(verts),34)
            for x,y,z in verts:
                self.assertTrue(all(math.isfinite(q) for q in (x,y,z)))
                self.assertTrue(
                    (z<=0.0000001 if direction=="north" else
                     z>=.9999999 if direction=="south" else
                     x<=0.0000001 if direction=="west" else
                     x>=.9999999),
                    "D must never overlap existing whole marble tile: "+direction
                )
            # Inner seam/attachment at y=.056, no raised ledge vs original F01-A.
            seam=[v for v in verts if abs(v[2] if direction=="north" else
                     v[2]-1 if direction=="south" else
                     v[0] if direction=="west" else v[0]-1)<1e-6]
            self.assertTrue(any(abs(v[1]-.056)<1e-6 for v in seam))

    def test_original_approved_PBR_texture_byte_for_byte_unchanged(self):
        tex=(OUT/"f01-marble-cream-basecolor-shared.png").read_bytes()
        self.assertEqual(hashlib.sha256(tex).hexdigest(),IMAGE_SHA)
        self.assertEqual(self.manifest["approvedF01AglbSha256"],A_SHA)
        self.assertEqual(self.manifest["sharedImageSha256"],IMAGE_SHA)
        for _,(_,raw,j,buf) in self.assets.items():
            material=j["materials"][0]
            self.assertEqual(material["name"],"F01.cream-white.PBR-dry")
            self.assertEqual(material["pbrMetallicRoughness"]["metallicFactor"],0.)
            self.assertEqual(material["pbrMetallicRoughness"]["roughnessFactor"],.275)
            bv=j["bufferViews"][j["images"][0]["bufferView"]]
            embedded=buf[bv["byteOffset"]:bv["byteOffset"]+bv["byteLength"]]
            self.assertEqual(embedded,tex)

    def test_global_uv_phase_on_real_top_face_meets_original_1m_grid(self):
        for direction,(_,_,j,buf) in self.assets.items():
            p=j["meshes"][0]["primitives"][0]
            v=acc(j,buf,p["attributes"]["POSITION"])
            uv=acc(j,buf,p["attributes"]["TEXCOORD_0"])
            for (x,y,z),(u,w) in zip(v[:4],uv[:4]):
                self.assertAlmostEqual(x,u,places=6)
                self.assertAlmostEqual(z,w,places=6)
                self.assertAlmostEqual(y,.056,places=6)
            self.assertEqual(j["samplers"][0]["wrapS"],10497)
            self.assertEqual(j["samplers"][0]["wrapT"],10497)

    def test_triangle_winding_and_normals_non_degenerate(self):
        for direction,(_,_,j,buf) in self.assets.items():
            p=j["meshes"][0]["primitives"][0]
            v=acc(j,buf,p["attributes"]["POSITION"])
            norms=acc(j,buf,p["attributes"]["NORMAL"])
            indices=[x[0] for x in acc(j,buf,p["indices"])]
            self.assertEqual(len(indices),42)
            for i in range(0,len(indices),3):
                idx=indices[i:i+3]
                self.assertTrue(all(0<=x<len(v) for x in idx))
                a,b,c=(v[z] for z in idx)
                u=[b[k]-a[k] for k in range(3)]
                w=[c[k]-a[k] for k in range(3)]
                cr=(u[1]*w[2]-u[2]*w[1],
                    u[2]*w[0]-u[0]*w[2],
                    u[0]*w[1]-u[1]*w[0])
                norm=norms[idx[0]]
                self.assertGreater(sum(cr[k]*norm[k] for k in range(3)),1e-8,
                    f"{direction} non-triangle or incorrect facing {i//3}")

    def test_safe_state_and_F01_E_corner_precondition(self):
        m=self.manifest
        self.assertFalse(m["ownerDPass"])
        self.assertFalse(m["inGame"])
        self.assertFalse(m["newSignedApk"])
        self.assertEqual(m["originalEngineWrites"],0)
        self.assertEqual(m["threeDSceneChanges"],0)
        self.assertIn("AFTER F01-D owner visual review",m["nextStage"])
        for direction in EXPECTED:
            extras=self.assets[direction][2]["nodes"][0]["extras"]
            self.assertIn("do NOT mount perpendicular D",extras["cornerRule"])

if __name__=="__main__":
    unittest.main(verbosity=2)
