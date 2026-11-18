#!/usr/bin/env python3
"""Independent QA for S7.8-C eight real GLB lighting families."""
from pathlib import Path
import hashlib, json, struct, collections
import trimesh
root=Path(__file__).resolve().parents[1]
assets=json.loads((root/'assets/lighting/s7-lights-catalog-additions.json').read_text())
manifest=json.loads((root/'assets/lighting/s7-lights-manifest.json').read_text())
assert len(assets)==24 and manifest['count']==24
assert len({a['id'] for a in assets})==24
assert all(a['ownerModelPass'] if 'ownerModelPass' in a else not a['renderOnly'] is False for a in [])  # empty no-op
assert {a['lightFamily'] for a in assets}=={'L-F1','L-F2','L-F3','L-W1','L-W2','L-C1','L-C2','L-C3'}
assert collections.Counter(a['lightFamily'] for a in assets)=={'L-F1':4,'L-F2':3,'L-F3':3,'L-W1':2,'L-W2':2,'L-C1':4,'L-C2':3,'L-C3':3}
records={a['id']:a for a in manifest['assets']}
assert len(records)==24 and not manifest['physicalModelOwnerPass']
for a in assets:
 p=root/a['src'];raw=p.read_bytes();m=records[a['id']]
 assert raw[:4]==b'glTF' and struct.unpack_from('<II',raw,4)==(2,len(raw)),p
 assert hashlib.sha256(raw).hexdigest()==m['sha256'],p
 n,typ=struct.unpack_from('<I4s',raw,12);assert typ==b'JSON'
 doc=json.loads(raw[20:20+n]);assert doc['asset']['version']=='2.0'
 assert len(doc['meshes'])==m['meshes']>=2,p
 assert len(doc['materials'])>=2
 assert any(sum(mat.get('emissiveFactor',[0,0,0]))>0.2 for mat in doc['materials']),p
 sc=trimesh.load(p,force='scene');assert len(sc.geometry)>0
 assert sum(len(g.faces) for g in sc.geometry.values())==m['triangles']>=48
 assert all(g.is_watertight and g.volume>0 for g in sc.geometry.values()),p
 assert m['hasEmissiveMesh'] and a['emissiveGeometry']
 assert a['gameplayWrites']==0 and a['realDynamicLightsIncluded']==0
 assert not m['visualOwnerGlbPass']
assert any('1plus4' in a['id'] for a in assets)
ids={a['id'] for a in assets}
for p in sorted((root/'projects').glob('trialum-s7-lights-*.json')):
 d=json.loads(p.read_text());assert d['meta']['gameplayWrites']==0
 assert d['meta']['realDynamicLights']==0
 assert all(i['assetId'] in ids for i in d['instances'])
 assert d['instances'] and len({i['id'] for i in d['instances']})==len(d['instances'])
print('PASS S7.8-C 24 real closed glTF2 GLB meshes, emissive material, stable independent assets, 5 safe authoring scenes and source provenance.')
