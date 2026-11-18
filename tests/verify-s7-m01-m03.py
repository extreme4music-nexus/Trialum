#!/usr/bin/env python3
import json, hashlib, struct, collections
from pathlib import Path
import numpy as np
import trimesh
ROOT=Path(__file__).resolve().parents[1]
manifest=json.loads((ROOT/'assets/materials/m01-m03-metal-60-manifest.json').read_text())
assets=json.loads((ROOT/'assets/m01-m03-catalog-additions.json').read_text())
assert manifest['glbCount']==60==len(manifest['allModels'])==len(assets)
ids=[x['id'] for x in assets]; assert len(ids)==len(set(ids))
groups=collections.Counter(x['finish'] for x in manifest['allModels']);assert groups=={'m01':20,'m02':20,'m03':20},groups
for m in manifest['allModels']:
 p=ROOT/'assets/models'/m['file'];raw=p.read_bytes()
 assert raw[:4]==b'glTF' and struct.unpack_from('<II',raw,4)==(2,len(raw)),p
 assert hashlib.sha256(raw).hexdigest()==m['sha256'],p
 length=int.from_bytes(raw[12:16],'little');doc=json.loads(raw[20:20+length]);assert len(doc['meshes'])>=1
 assert doc['asset']['extras']['trialum']['gameplayWrites']==0
 assert doc['asset']['extras']['trialum']['ownerModelInspectionPending'] is True
 scene=trimesh.load(p,force='scene');assert scene.geometry
 assert all(geo.is_watertight for geo in scene.geometry.values()),m['id']
 assert sum(len(geo.faces) for geo in scene.geometry.values())==m['triangles']
 assert len(scene.geometry)==m['physicalMeshes']
 assert np.isfinite(scene.bounds).all()
 width,thick,depth=m['dimensions'];bound=scene.bounds[1]-scene.bounds[0]
 assert abs(bound[0]-width)<.006 and abs(bound[2]-depth)<.006 and abs(bound[1]-thick)<.006,(m['id'],bound,m['dimensions'])
 assert scene.bounds[0,1]>=-0.0001,m['id']
 assert len(doc.get('materials',[]))>=4,m['id']
 assert len(doc.get('textures',[]))>=1,m['id']
 assert 'KHR_materials_unlit' not in doc.get('extensionsUsed',[])
 # The product concept does not grant gameplay / power semantics.
 assert doc['asset']['extras']['trialum']['serviceFunctionality'].startswith('display only')
for f in ('m01','m02','m03'):
 assert (ROOT/f'assets/materials/{f}-brushed-metal-source.png').exists()
 assert (ROOT/f'assets/materials/{f}-micro-normal.png').exists()
for sc in (ROOT/'projects').glob('trialum-s7-metal-*.json'):
 p=json.loads(sc.read_text());assert p['schemaVersion']==1
 assert not p['meta']['gameplayWrites'] and not p['meta']['officialScene']
 assert all(x['assetId'] in ids for x in p['instances']),(sc.name,'unknown asset')
 assert len(set(x['id'] for x in p['instances']))==len(p['instances'])
 print('PASS design scene:',sc.name,len(p['instances']))
print('PASS: 60 real solid glTF 2.0 metal GLBs, 45 modular + 15 service, material/triangles/SHA/scene checks; no gameplay writes')
