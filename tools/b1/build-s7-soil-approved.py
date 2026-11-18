#!/usr/bin/env python3
"""Trialum S7 approved soil asset generator.

Deterministic real GLB geometry from owner-approved soil reference:
* S02 1m planting board with exactly 25 individually addressable physical depressions;
* separate root-collar soil plug (no baked-in plant, 25 independent placements);
* S01 dug/ploughed soil tile (approved second photo, no holes or plants);
* separate ring highlighting one slot in Builder (design-only);
* demo seedling OBJ/GLB (design-only, never actual plant identity).

Canonical game: ONLY four terrestrial beds x five approved plant slots.
Visual matrix 25 possible positions != 25 game plant slots. No game writes.
"""
from __future__ import annotations
import base64,hashlib,json,math,random
from pathlib import Path
import numpy as np
from PIL import Image,ImageFilter,ImageEnhance
import trimesh
from trimesh.visual.texture import TextureVisuals
from trimesh.visual.material import PBRMaterial

HERE=Path(__file__).resolve().parent
if not (HERE/'assets/source/soil_approved_s01_s02_atlas.jpg').exists():
    HERE=HERE.parents[1]
OUT=HERE/'assets/models'
OUT.mkdir(exist_ok=True,parents=True)
SRC=HERE/'assets/source/soil_approved_s01_s02_atlas.jpg'
TILE=1.0
THICK=.12
N=144
C=[.1,.3,.5,.7,.9]
R=.067
H=.045
SEED=17310

def make_texture(mode):
    im=Image.open(SRC).convert('RGB')
    # source imagery is perspective rectified from the second, owner-approved soil photo
    a=np.asarray(im.resize((512,512),Image.Resampling.LANCZOS)).astype(np.float32)
    # 2 colorways of the same authentic soil microstructure, not artificial uniform brown
    if mode=='plant':
        a[:,:,0]*=.91;a[:,:,1]*=.77;a[:,:,2]*=.67
    else:
        a[:,:,0]*=1.02;a[:,:,1]*=1.0;a[:,:,2]*=.96
    # Blend opposing edges for repeating 1m tiles; center still remains original
    for axis in [0,1]:
        for i in range(44):
            alpha=.5*(1-i/44)**2
            first=np.take(a,i,axis=axis).copy()
            last=np.take(a,511-i,axis=axis).copy()
            blended=(first+last)*.5
            if axis==0:
                a[i,:,:]=first*(1-alpha)+blended*alpha
                a[511-i,:,:]=last*(1-alpha)+blended*alpha
            else:
                a[:,i,:]=first*(1-alpha)+blended*alpha
                a[:,511-i,:]=last*(1-alpha)+blended*alpha
    img=Image.fromarray(np.uint8(np.clip(a,0,255)),'RGB')
    img.save(HERE/f'assets/soil-{mode}-basecolor.png',optimize=True)
    gray=np.asarray(img.convert('L').filter(ImageFilter.GaussianBlur(0.6)),dtype=np.float32)
    gx=np.gradient(gray,axis=1)/255; gz=np.gradient(gray,axis=0)/255
    scale=.55 if mode=='plant' else .95
    nx=-gx*scale;ny=-gz*scale;nz=np.ones_like(nx)
    ln=np.sqrt(nx*nx+ny*ny+nz*nz)
    normal=np.stack((nx/ln,ny/ln,nz/ln),axis=2)
    nimg=Image.fromarray(np.uint8(np.clip((normal+1)*127.5,0,255)),'RGB')
    nimg.save(HERE/f'assets/soil-{mode}-normal.png',optimize=True)
    return img,nimg

PLANT_IMG,PLANT_NORMAL=make_texture('plant')
DUG_IMG,DUG_NORMAL=make_texture('dug')

def noise(x,z):
    return (.0016*np.sin(math.tau*(8*x+3*z)) * np.cos(math.tau*(9*z-2*x))
        +.0011*np.sin(math.tau*(17*x-23*z))
        +.0009*np.cos(math.tau*(41*x+35*z)))

def hfield(mode):
    xx,zz=np.meshgrid(np.linspace(0,1,N+1),np.linspace(0,1,N+1))
    if mode=='plant':
        y=THICK+noise(xx,zz)*.7
        # 25 real shallow depressions with defined rims and concave bottoms.
        for cx in C:
            for cz in C:
                rr=np.sqrt((xx-cx)**2+(zz-cz)**2)
                # Smooth 4cm pocket. Center / ring physically recessed, not painted dark.
                inner=np.clip((rr-.023)/(.067-.023),0,1)
                smooth=inner*inner*(3-2*inner)
                y-=H*(1-smooth)
                y+=.0027*np.exp(-((rr-.072)/.010)**2)
        # Clearly readable 5x5 positioning matrix as fine engraved guides.
        for edge in (.2,.4,.6,.8):
            y-=.00075*np.exp(-((xx-edge)/.0024)**2)
            y-=.00075*np.exp(-((zz-edge)/.0024)**2)
    else:
        # Dug/turned soil is irregular across broad and fine scales, no pockets.
        y=THICK +.008*np.sin(math.tau*(2.2*xx+.3*zz))*np.sin(math.tau*(2.7*zz-.2*xx))
        y+=.005*np.sin(math.tau*(4*xx+2.3*zz))
        y+=.004*np.cos(math.tau*(6.7*xx-6.2*zz))
        y+=.0025*np.sin(math.tau*(17*xx+13*zz))
        y+=noise(xx,zz)*1.7
    # all 4 lateral mesh edges equal THICK, so adjacent cubes do not visibly break.
    fade=np.minimum.reduce([xx,1-xx,zz,1-zz])
    fade=np.clip(fade/.026,0,1)
    fade=fade*fade*(3-2*fade)
    return xx,zz,THICK+(y-THICK)*fade


def terrain_mesh(mode):
    xx,zz,y=hfield(mode)
    vertices=np.stack((xx,y,zz),axis=-1).reshape((-1,3))
    tex=np.stack((xx,zz),axis=-1).reshape((-1,2))
    faces=[]
    ind=lambda x,z:z*(N+1)+x
    for z in range(N):
        for x in range(N):
            a,b,c,d=ind(x,z),ind(x+1,z),ind(x,z+1),ind(x+1,z+1)
            faces.extend([(a,c,b),(b,c,d)])
    perimeter=[]
    perimeter += [ind(x,0) for x in range(N)]
    perimeter += [ind(N,z) for z in range(N)]
    perimeter += [ind(x,N) for x in range(N,0,-1)]
    perimeter += [ind(0,z) for z in range(N,0,-1)]
    # shared top vertices + new perimeter bottom vertices + one bottom center
    b_start=len(vertices)
    verts=list(vertices)
    uvs=list(tex)
    for idx in perimeter:
        x,z=vertices[idx,0],vertices[idx,2]
        verts.append([x,0.,z]);uvs.append([x,z])
    center=len(verts);verts.append([.5,0,.5]);uvs.append([.5,.5])
    L=len(perimeter)
    for k in range(L):
        kp=(k+1)%L
        faces.extend([(perimeter[k],perimeter[kp],b_start+kp),
                      (perimeter[k],b_start+kp,b_start+k),
                      (center,b_start+kp,b_start+k)])
    mesh=trimesh.Trimesh(vertices=verts,faces=faces,process=False)
    mesh.fix_normals()
    assert mesh.is_watertight,(mode,mesh.euler_number)
    mesh.visual=TextureVisuals(uv=np.asarray(uvs),material=PBRMaterial(
      name='S02_dark_brown_prepared_soil' if mode=='plant' else 'S01_lighter_turnover_loose_soil',
      baseColorTexture=PLANT_IMG if mode=='plant' else DUG_IMG,
      normalTexture=PLANT_NORMAL if mode=='plant' else DUG_NORMAL,
      roughnessFactor=.94 if mode=='plant' else .98,
      metallicFactor=0.,doubleSided=False))
    return mesh


def plug_mesh():
    # A discrete soil closure fills ONLY the selected round indentation.
    # Pivot (0,0,0) at soil plane surface; relative to holder tile at y=.12.
    rings=[(-.048,.041),(-.041,.056),(-.013,.060),(-.006,.062),(-.001,.047),(0.,.015)]
    ns=40;v=[];uv=[];f=[]
    for y,r in rings:
      for j in range(ns):
        a=math.tau*j/ns
        x=math.cos(a)*r;z=math.sin(a)*r
        rough=.0007*math.sin(9*a+8*y)+.0006*math.cos(23*a)
        v.append([x,y+rough,z]);uv.append([x*5+.5,z*5+.5])
    for k in range(len(rings)-1):
      for j in range(ns):
        jp=(j+1)%ns;a=k*ns+j;b=k*ns+jp;c=(k+1)*ns+j;d=(k+1)*ns+jp
        f.extend(((a,c,b),(b,c,d)))
    bottom=len(v);v.append([0.,-.048,0.]);uv.append([.5,.5])
    top=len(v);v.append([0.,.001,0.]);uv.append([.5,.5])
    for j in range(ns):
      jp=(j+1)%ns
      f.append((bottom,j,jp))
      a=(len(rings)-1)*ns+j;b=(len(rings)-1)*ns+jp
      f.append((top,b,a))
    mesh=trimesh.Trimesh(vertices=v,faces=f,process=False)
    mesh.fix_normals()
    assert mesh.is_watertight
    mesh.visual=TextureVisuals(uv=uv,material=PBRMaterial(name='S02_Occupied_soil_plug',baseColorTexture=PLANT_IMG,roughnessFactor=.98,metallicFactor=0.))
    return mesh


def guide_ring():
    # separate GLB to show a selectable planting target, not visible in game by default
    v=[];faces=[];ns=48
    for y,r in ((0,.068),(.0015,.068),(.0015,.075),(0,.075)):
      for j in range(ns):
        a=math.tau*j/ns
        v.append((math.cos(a)*r,y,math.sin(a)*r))
    for k in range(4):
      jnext=(k+1)%4
      for j in range(ns):
        jp=(j+1)%ns
        a=k*ns+j;b=k*ns+jp;c=jnext*ns+j;d=jnext*ns+jp
        faces.extend(((a,b,c),(b,d,c)))
    mesh=trimesh.Trimesh(vertices=v,faces=faces,process=False)
    mesh.fix_normals()
    assert mesh.is_watertight
    mesh.visual.material=PBRMaterial(name='S02_Slot_Selection_Amber',baseColorFactor=[226,187,91,220],roughnessFactor=.78,metallicFactor=0.)
    return mesh


def demo_seedling():
    """Minimal demonstrator only, NOT game-grown plant species; position per soil slot."""
    rng=random.Random(SEED)
    parts=[]
    trunk=trimesh.creation.cone(radius=.0065,height=.10,sections=12)
    # Cone trimesh Y/Z orientation transform: z axis to Y up
    trunk.apply_transform(trimesh.transformations.rotation_matrix(-math.pi/2,[1,0,0]))
    trunk.apply_translation([0,.051,0])
    trunk.visual.material=PBRMaterial(name='demo_stem',baseColorFactor=[75,132,58,255],roughnessFactor=.78,metallicFactor=0.)
    parts.append(trunk)
    # Leaves as real double-sided elliptical 3D capsules simplified to flattened ellipsoids.
    for sign in (-1,1):
        leaf=trimesh.creation.icosphere(subdivisions=2,radius=1)
        leaf.apply_scale([.034,.008,.015]);leaf.apply_transform(trimesh.transformations.rotation_matrix(sign*.38,[0,0,1]));leaf.apply_translation([sign*.028,.096,.0])
        leaf.visual.material=PBRMaterial(name='demo_leaf_not_canonical',baseColorFactor=[94,177,64,255],roughnessFactor=.7,metallicFactor=0.)
        parts.append(leaf)
    return trimesh.Scene(parts)

SLOTS=[{'slotId':f'R{r+1:02d}C{c+1:02d}','row':r+1,'column':c+1,
        'x':round(.1+c*.2,3),'z':round(.1+r*.2,3),'topY':THICK,
        'status':'OPEN','plantId':None,'visualOnly':True} for r in range(5) for c in range(5)]

MODEL_SPECS=[
 ('s02-planting-bed-5x5-empty.glb','S02','plant',terrain_mesh('plant')),
 ('s03-dug-turnover-soil.glb','S03-DUG-OWNER-RENDER','dug',terrain_mesh('dug')),
 ('s02-single-hole-soil-plug.glb','S02-PLUG','plug',plug_mesh()),
 ('s02-slot-target-ring.glb','S02-SELECT-MARKER','ring',guide_ring()),
 ('s02-demo-seedling-preview.glb','S02-DEMO-SEEDLING','demo',demo_seedling())
]

manifest={'schemaVersion':1,'project':'Trialum S7 Soil S02+owner-approved dug soil preview','unit':'meter','axes':'Y_UP',
   'tile':{'width':1,'depth':1,'thickness':THICK},'approvedRenderRefs':{
    'preparedWithMixedOccupancy':'s02_modular_soil_planting_grid.png',
    'dugUnplanted':'photorealistic_compacted_soil_tile.png'},
   'authoritativeGameplay':{'beds':['bed-1','bed-2','bed-3','bed-4'],
      'plantSlotsPerBed':5,'25GridSlotsAreNOTGameCapacity':True,'engineIntegration':False},
   'sourceTextureSha256':hashlib.sha256(SRC.read_bytes()).hexdigest(),
   'slots':SLOTS,'assets':[]}

for fn,logical,kind,mesh in MODEL_SPECS:
    sc=mesh if isinstance(mesh,trimesh.Scene) else trimesh.Scene([mesh])
    exported=sc.export(file_type='glb')
    # Embed stable slot anchors, purpose, and hard non-authority into actual GLB2
    # JSON metadata. This is not just a loose catalogue description.
    n=int.from_bytes(exported[12:16],'little')
    doc=json.loads(exported[20:20+n])
    offset=20+n
    blen=int.from_bytes(exported[offset:offset+4],'little')
    assert exported[offset+4:offset+8]==b'BIN\0'
    payload=exported[offset+8:offset+8+blen]
    extra={'trialumSoilAssetId':logical,'role':kind,'unit':'meter','upAxis':'Y',
      'gameplayWrites':0,'ownerModelVisualReviewPending':True,
      'newPlantSlotsGranted':0,'authoritativeGameState':False,
      'ownerReferenceImage':'s02_modular_soil_planting_grid.png' if kind in ('plant','plug','ring','demo') else 'photorealistic_compacted_soil_tile.png'}
    if kind=='plant':
        extra.update({'rows':5,'columns':5,'pitchMeters':.2,'slotCountVisualOnly':25,
          'holeRadiusMeters':.067,'holeDepthMeters':.045,
          'canonicalPlantSlotsPerBed':5,'slots':SLOTS,
          'plantIdMustComeFromEngine':True,'occupancyMechanism':'Unoccupied crater stays open. Occupied crater receives independent S02 soil-plug GLB and authorized game plantId.'})
    elif kind=='dug':
        extra.update({'plantingHoles':0,'plantAnchors':0,
          'ownerVisualLabel':'S03 dug ploughed tile; original 2026 S7 planning uses S01 for dug soil, requires owner mapping reconciliation before integration'})
    elif kind=='plug':
        extra.update({'pivot':'0,0,0 at hole center top soil plane','attachYLocal':.12,
          'plantIdMustComeFromEngine':True,'plugDoesNotCreatePlant':True})
    elif kind=='ring':
        extra.update({'previewSelectionOnly':True,'hiddenUnlessSelection':True})
    elif kind=='demo':
        extra.update({'previewOnlySeedling':True,'notCanonicalSpecies':True,'notPlantId':True})
    for node in doc['nodes']:
        if 'mesh' in node:node['extras']=extra
    doc['asset']['extras']={'trialum':{'id':logical,'gameplayWrites':0}}
    packed=json.dumps(doc,separators=(',',':'),ensure_ascii=False).encode('utf8')
    packed+=b' '*(-len(packed)%4)
    exported=(b'glTF'+(2).to_bytes(4,'little')+
         (12+8+len(packed)+8+len(payload)).to_bytes(4,'little')+
         len(packed).to_bytes(4,'little')+b'JSON'+packed+
         len(payload).to_bytes(4,'little')+b'BIN\0'+payload)
    assert exported[:4]==b'glTF' and int.from_bytes(exported[8:12],'little')==len(exported)
    assert exported[:4]==b'glTF'  and int.from_bytes(exported[4:8],'little')==2
    target=OUT/fn;target.write_bytes(exported)
    manifest['assets'].append({'name':fn,'logicalId':logical,'role':kind,
        'sha256':hashlib.sha256(exported).hexdigest(),'bytes':len(exported),
        'triangles':sum(len(g.faces) for g in sc.geometry.values()),
        'meshes':len(sc.geometry),'contains25HolePhysicalGeometry':kind=='plant',
        'ownerModelVisualPassPending':True,'gameplayWrites':0})

(HERE/'assets/soil-slot-matrix.json').write_text(json.dumps({
    'schemaVersion':1,'tileId':'S02-PLANTING-HOLES','slotCount':25,'rows':5,'columns':5,
    'canonicalPlantSlotsPerBed':5,'slotPitchMeters':.2,'slotRadiusMeters':R,
    'emptyHoleGlb':'s02-planting-bed-5x5-empty.glb',
    'occupiedSoilPlugGlb':'s02-single-hole-soil-plug.glb',
    'selectionRingGlb':'s02-slot-target-ring.glb',
    'demoSeedlingGlb':'s02-demo-seedling-preview.glb',
    'plantAttachment':'Use game-approved plantId, position at slot x, .12, z; never create plant IDs from graphics',
    'simulationIsSourceOfTruth':True,'slots':SLOTS
},indent=2,ensure_ascii=False)+'\n')
(HERE/'assets/soil-model-manifest.json').write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+'\n')
print(json.dumps({'models':[(a['name'],a['bytes'],a['triangles']) for a in manifest['assets']],
    'slots':len(SLOTS),'totalBytes':sum(a['bytes'] for a in manifest['assets'])},indent=2))
