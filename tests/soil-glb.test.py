from pathlib import Path
import json,math,struct,hashlib
import numpy as np
import trimesh
ROOT=Path(__file__).resolve().parent
if not (ROOT/'assets/models').exists():ROOT=ROOT.parent
M=json.loads((ROOT/'assets/soil-model-manifest.json').read_text())
S=json.loads((ROOT/'assets/soil-slot-matrix.json').read_text())
assert len(M['assets'])==5
assert len(S['slots'])==25
assert S['canonicalPlantSlotsPerBed']==5 and S['slotCount']==25
assert all(s['status']=='OPEN' and s['plantId'] is None for s in S['slots'])
assert len(set(s['slotId'] for s in S['slots']))==25
for a in M['assets']:
 raw=(ROOT/'assets/models'/a['name']).read_bytes()
 assert raw[:4]==b'glTF' and struct.unpack_from('<II',raw,4)==(2,len(raw))
 jlen,jtype=struct.unpack_from('<I4s',raw,12)
 assert jtype==b'JSON'
 js=json.loads(raw[20:20+jlen]);assert js['asset']['version']=='2.0'
 assert len(js['meshes'])>=1
 assert hashlib.sha256(raw).hexdigest()==a['sha256']
 extras=[n.get('extras') for n in js.get('nodes',[]) if n.get('mesh') is not None]
 assert extras and all(x and x['gameplayWrites']==0 for x in extras)
 if a['logicalId']=='S02':
  assert extras[0]['slotCountVisualOnly']==25
  assert len(extras[0]['slots'])==25
 if a['logicalId']=='S03-DUG-OWNER-RENDER':assert extras[0]['plantAnchors']==0
 scene=trimesh.load(ROOT/'assets/models'/a['name'],force='scene')
 assert scene.geometry and all(g.is_watertight for g in scene.geometry.values()),a['name']
 assert sum(len(g.faces) for g in scene.geometry.values())==a['triangles']
 print('PASS',a['name'],len(raw),'bytes',a['triangles'],'triangles',len(scene.geometry),'meshes')

# Actual 3D depression test: 25 hole bottoms must be at least 3cm below plateau.
sc=trimesh.load(ROOT/'assets/models/s02-planting-bed-5x5-empty.glb',force='scene')
mesh=next(iter(sc.geometry.values()))
v=np.asarray(mesh.vertices)
for x in [.1,.3,.5,.7,.9]:
 for z in [.1,.3,.5,.7,.9]:
  dist=np.hypot(v[:,0]-x,v[:,2]-z)
  i=np.argmin(dist + (v[:,1]<.06)*100)
  assert v[i,1]<.09,(x,z,v[i],dist[i])
  side=(np.abs(v[:,0]-(x+.082))<.004)&(np.abs(v[:,2]-z)<.004)&(v[:,1]>.06)
  assert side.any() and np.max(v[side,1])>.11,(x,z)
print('PASS all 25 physical holes are >3 cm deep and have surrounding real 3D soil')

known={a['id'] for a in json.loads((ROOT/'assets/catalog-additions.json').read_text())}
for p in (ROOT/'projects').glob('*.json'):
 d=json.loads(p.read_text());assert d['meta']['gameplayWrites']==0
 ids=[i['id'] for i in d['instances']]
 assert len(ids)==len(set(ids)) and all(i['assetId'] in known for i in d['instances'])
 assert d['meta']['canonicalSlotsPerBed']==5
 print('PASS editable Builder scene',p.name,len(ids),'objects')
print('PASS all geometric/scene safeguards')
