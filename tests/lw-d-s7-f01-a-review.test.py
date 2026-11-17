#!/usr/bin/env python3
"""S7 F01-A original 1-metre 3D GLB verification. Run AFTER F01 generator."""
from __future__ import annotations
import hashlib, json, pathlib, struct, sys, unittest, zlib

ROOT=pathlib.Path(__file__).resolve().parents[1]
OUT=ROOT/'build/s7-floor-f01/F01-A'
FILE=OUT/'f01-marble-cream-full.glb'


class F01RealGlbTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.data=FILE.read_bytes()
        cls.manifest=json.loads((OUT/'qa-manifest.json').read_text(encoding='utf-8'))
        d=cls.data
        assert d[:4]==b'glTF', "Not a binary glTF"
        assert struct.unpack_from('<II',d,4)==(2,len(d)), "Bad GLB length/version"
        jlen,jtyp=struct.unpack_from('<I4s',d,12)
        assert jtyp==b'JSON'
        cls.root=json.loads(d[20:20+jlen])
        bi=20+jlen
        blen,btyp=struct.unpack_from('<I4s',d,bi)
        assert btyp==b'BIN\x00'
        cls.bin=d[bi+8:bi+8+blen]
        assert len(cls.bin)==blen
    def test_actual_binary_glb_not_a_flat_image(self):
        d=self.data
        self.assertEqual(self.root['asset']['version'],'2.0')
        self.assertGreater(len(self.root['meshes']),0)
        self.assertGreater(len(self.root['meshes'][0]['primitives']),0)
        self.assertEqual(self.root['nodes'][0]['extras']['assetId'],'S7-FLOOR-F01-A')
        self.assertEqual(self.root['meshes'][0]['primitives'][0]['mode'],4)
        self.assertEqual(self.root['scene'],0)
        self.assertLess(len(d),1_000_000,"Mobile GLB size budget")
    def test_metric_dimensions_and_pivot(self):
        p=self.root['meshes'][0]['primitives'][0]
        loc=self.root['accessors'][p['attributes']['POSITION']]
        self.assertEqual(loc['min'],[0.0,0.0,0.0])
        self.assertEqual(loc['max'],[1.0,.06,1.0])
        self.assertEqual(loc['count'],40)
        self.assertEqual(self.root['nodes'][0]['extras']['origin'],'bottom-left')
        self.assertEqual(self.manifest['triangles'],20)
    def test_pbr_and_embedded_texture(self):
        mat=self.root['materials'][0]['pbrMetallicRoughness']
        self.assertEqual(mat['metallicFactor'],0)
        self.assertEqual(mat['roughnessFactor'],.275)
        self.assertIn('TEXCOORD_0',self.root['meshes'][0]['primitives'][0]['attributes'])
        self.assertIn('baseColorTexture',mat)
        img=self.root['images'][0];self.assertEqual(img['mimeType'],'image/png')
        view=self.root['bufferViews'][img['bufferView']]
        png=self.bin[view['byteOffset']:view['byteOffset']+view['byteLength']]
        self.assertTrue(png.startswith(b'\x89PNG\r\n\x1a\n'))
        self.assertEqual(struct.unpack('>II',png[16:24]),(384,384))
        self.assertEqual(hashlib.sha256(png).hexdigest(),self.manifest['textureSha256'])
        self.assertEqual(png,(OUT/'f01-marble-cream-basecolor.png').read_bytes())
        self.assertEqual(self.root['samplers'][0]['wrapS'],10497)
        self.assertEqual(self.root['samplers'][0]['wrapT'],10497)
    def test_manifest_and_no_engine_gameplay_changes(self):
        self.assertEqual(self.manifest['glbBytes'],len(self.data))
        self.assertEqual(self.manifest['glbSha256'],hashlib.sha256(self.data).hexdigest())
        self.assertFalse(self.manifest['inGame'])
        self.assertFalse(self.manifest['ownerModelPass'])
        self.assertEqual(self.manifest['canonicalBedWrites'],0)
        self.assertEqual(self.manifest['actualAquaticSlotsAdded'],0)
        self.assertEqual(list(OUT.glob('*.glb')),[FILE])
    def test_marble_texture_wrap_in_both_directions(self):
        # Scan filter-free PNG raw rows and check near-edge continuity.
        png=(OUT/'f01-marble-cream-basecolor.png').read_bytes()
        pos=8;idat=bytearray()
        while pos<len(png):
            n=struct.unpack('>I',png[pos:pos+4])[0];kind=png[pos+4:pos+8]
            if kind==b'IDAT':idat.extend(png[pos+8:pos+8+n])
            pos+=12+n
        raw=zlib.decompress(idat)
        stride=1+384*4
        # Seams are not zero by nature; color difference should stay small (sub-14).
        horizontal=[]
        for y in range(0,384,7):
            row=raw[y*stride:(y+1)*stride]
            a=row[1:4];b=row[1+383*4:1+383*4+3]
            horizontal.append(max(abs(x-z) for x,z in zip(a,b)))
        vertical=[]
        for x in range(0,384,7):
            a=raw[1+x*4:1+x*4+3]
            base=(383*stride)+1+x*4
            b=raw[base:base+3]
            vertical.append(max(abs(k-z) for k,z in zip(a,b)))
        self.assertLessEqual(max(horizontal),14)
        self.assertLessEqual(max(vertical),14)


if __name__=='__main__':
    unittest.main(verbosity=2)
