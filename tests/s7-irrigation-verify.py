#!/usr/bin/env python3
"""Standalone GLB QA. Run after build-s7-irrigation.py, no gameplay access."""
from pathlib import Path
import hashlib,json,struct,sys
import trimesh
import numpy as np
root=Path(__file__).resolve().parents[1]
m=json.loads((root/'assets/irrigation/s7-irrigation-manifest.json').read_text(encoding='utf8'))
items=m['modelSha256'];assert len(items)==58,(len(items),'expected 58')
ids=set()
for row in items:
 id=row['id'];assert id not in ids;ids.add(id)
 p=root/'assets/models'/(id+'.glb');data=p.read_bytes()
 assert struct.unpack_from('<4sII',data,0)==(b'glTF',2,len(data)),id
 assert hashlib.sha256(data).hexdigest()==row['sha256'],id
 scene=trimesh.load(p,force='scene',process=False)
 assert len(scene.geometry)==row['meshCount'],id
 assert len(scene.geometry)>=2 and all(g.is_watertight for g in scene.geometry.values()),id
 assert all(np.all(np.isfinite(g.vertices)) for g in scene.geometry.values()),id
 assert len(scene.geometry)>0 and scene.extents.max()>0,id
 assert row['ownerActualGlbPass'] is False,id
 assert row['triangles']>=20,id
assert any(k.startswith('s7-i03-hose-') for k in ids)
assert m['dynamicTubeSimulationPresent'] is False and m['splineEditingBuiltInBuilder'] is False
for g in ('i01','i02','i03','i04','i05','i06','c-irr01'):
 p=root/'projects'/('trialum-s7-irrigation-'+g+'-gallery.json')
 doc=json.loads(p.read_text(encoding='utf8'))
 assert len(doc['instances'])>0,p
 assert all(x['assetId'] in ids for x in doc['instances']),p
assert len(json.loads((root/'projects/trialum-s7-irrigation-all-glbs.json').read_text())['instances'])==58
bed=json.loads((root/'projects/trialum-s7-irrigation-four-bed-panels.json').read_text())
assert len(bed['instances'])==4
print('PASS 58 genuine GLBs, closed meshes, 7 groups, 9 scenes, 4 demo beds, static-spline safety')
