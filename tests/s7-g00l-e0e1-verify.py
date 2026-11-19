#!/usr/bin/env python3
"""S7 E0/E1 physical GLB QA without dependency on scene state or runtime gameplay."""
from pathlib import Path
import json,struct,hashlib
root=Path(__file__).resolve().parents[1]
dir=root/'assets/models'
manifest=json.loads((root/'assets/s7-e0e1/s7-e0e1-manifest.json').read_text())
cat=json.loads((root/'assets/s7-e0e1/s7-e0e1-catalog-additions.json').read_text())
assert len(manifest['models'])==len(cat)==28
assert len({x['id'] for x in cat})==28
assert len(list(dir.glob('s7-e0e1-*.glb')))==28
for row in manifest['models']:
 file=root/row['path'];data=file.read_bytes()
 assert data[:4]==b'glTF',(file,'not GLB')
 assert struct.unpack_from('<II',data,4)==(2,len(data)),file
 assert struct.unpack_from('<4s',data,16)[0]==b'JSON'
 n=struct.unpack_from('<I',data,12)[0]
 gltf=json.loads(data[20:20+n])
 assert gltf['asset']['version']=='2.0'
 assert gltf['meshes'] and gltf['materials'] and gltf['accessors'] and gltf['bufferViews']
 assert all(m.get('pbrMetallicRoughness') for m in gltf['materials'])
 assert not any(x.get('uri','').startswith(('http:','https:')) for x in gltf.get('images',[])+gltf.get('buffers',[]))
 assert row['meshes']==len(gltf['meshes'])
 assert row['size']==len(data)
 assert row['sha256']==hashlib.sha256(data).hexdigest()
 assert all(float(v)>0 for v in row['dimensions']),row
 assert row['min'][1]>=-0.06,row
 assert len(data)<1_000_000
scenes=sorted((root/'projects').glob('trialum-g00l-e0e1-*.json'))
assert len(scenes)==7
ids={c['id'] for c in cat}
for sc in scenes:
 p=json.loads(sc.read_text())
 assert p['instances']
 for ins in p['instances']:assert ins['assetId'] in ids,(sc.name,ins['assetId'])
 assert p['room']['width']>=12
assert sum('RS' in x['category'] for x in cat)==5
assert sum('RM' in x['category'] for x in cat)==5
assert sum('ST' in x['category'] for x in cat)==6
assert sum(x['category'].startswith('W') for x in cat)==6
assert sum(x['category'].startswith('Дополнителна') for x in cat)==6
print('PASS: 28/28 physically valid GLB2/PBR, SHA256 manifest, 7/7 scenes, no gameplay writes')
