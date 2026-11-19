#!/usr/bin/env python3
"""Original real GLB and animation gate; no game-state mutation."""
from pathlib import Path
import json,hashlib,struct
import trimesh
ROOT=Path(__file__).resolve().parents[1]
MAN=json.loads((ROOT/'assets/s7-f/s7-f-manifest.json').read_text())
CAT=json.loads((ROOT/'assets/s7-f/s7-f-catalog-additions.json').read_text())
assert MAN['count']==len(MAN['models'])==len(CAT)==18
ids={a['id'] for a in CAT};assert len(ids)==18
assert all(a['engineStateWrites']==0 and not a['gameplayIntegration'] and not a['ownerModelPass'] for a in CAT)
assert {m['group'] for m in MAN['models']}=={'E01','E02','T01','T02','T03','R01'}
assert len([a for a in CAT if a['id'].endswith(('excavator','tiller','planting-carrier','flat-transport','heavy-transport','humanoid'))])==6
for model in MAN['models']:
 src=ROOT/'assets/models'/(model['id']+'.glb');data=src.read_bytes()
 assert len(data)==model['bytes'] and hashlib.sha256(data).hexdigest()==model['sha256'],src
 assert data[:4]==b'glTF' and struct.unpack_from('<II',data,4)==(2,len(data)),src
 size,typ=struct.unpack_from('<I4s',data,12);assert typ==b'JSON'
 doc=json.loads(data[20:20+size]);assert doc['asset']['version']=='2.0'
 assert len(doc['meshes'])==model['meshes']>0
 assert len(doc['materials'])>=1
 for animation in doc.get('animations',[]):
  assert animation['name'] in model['animations']
  assert animation['channels'] and animation['samplers'],(model['id'],animation['name'])
  for ch in animation['channels']:
   assert ch['target']['path']=='rotation'
   assert ch['target']['node']<len(doc['nodes'])
   assert ch['sampler']<len(animation['samplers'])
  for sampler in animation['samplers']:
   assert sampler['input']<len(doc['accessors']) and sampler['output']<len(doc['accessors'])
 assert len(doc.get('animations',[]))==len(model['animations'])
 s=trimesh.load(src,force='scene');assert len(s.geometry)==model['meshes']
 assert all(m.is_watertight for m in s.geometry.values()),src
 assert max(model['dimensions'])<7
for name in ('all','heroes','machines','transports','robot','tools','g00l-preview','rig-demo'):
 p=ROOT/f'projects/trialum-s7-f-{name}.json';j=json.loads(p.read_text()); assert j['instances']
 assert all(i['assetId'] in ids for i in j['instances'])
 assert all(i['binding']=='' for i in j['instances'])
print(json.dumps({'result':'PASS','models':18,'animated':6,'scenes':8,'allMeshesWatertight':True,'noGameWrites':True}))
