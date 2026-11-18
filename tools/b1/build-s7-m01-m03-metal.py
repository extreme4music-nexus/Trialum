#!/usr/bin/env python3
"""Trialum S7 M01–M03 fully modular metallic floor panel GLBs.
Three owner-render-approved looks x 15 basic tiles + 5 service panel options.
Only design assets. NEVER creates, edits, or transfers gameplay state.
Python 3.12+; numpy, Pillow, trimesh. Deterministic.
"""
import json, hashlib, math, os, random
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter
import trimesh
from trimesh.visual.material import PBRMaterial
from trimesh.visual.texture import TextureVisuals

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'assets/models'; OUT.mkdir(parents=True,exist_ok=True)
MATDIR=ROOT/'assets/materials'; MATDIR.mkdir(parents=True,exist_ok=True)
SEED=20261118
C = {
 'm01': dict(name='Крем-сивозелен фарбан метал',label='M01 CREAM-SAGE',panel=(212,205,181),frame=(89,114,88),rim=(181,186,161),secondary=(100,121,99),roughness=.34,metallic=.42,gloss='satin'),
 'm02': dict(name='Полиран хром',label='M02 POLISHED CHROME',panel=(188,204,210),frame=(65,84,95),rim=(215,228,234),secondary=(120,150,160),roughness=.16,metallic=.62,gloss='mirror'),
 'm03': dict(name='Мат црн метал',label='M03 MATTE BLACK',panel=(44,50,54),frame=(25,30,36),rim=(73,81,88),secondary=(52,63,70),roughness=.83,metallic=.47,gloss='matte'),
}
cyan=(55,232,237); recess=(26,36,43); white=(232,224,190)
base_shape=[('full',1,1),('half-x',1,.5),('half-z',.5,1),
 ('quarter-nw',.5,.5),('quarter-ne',.5,.5),('quarter-sw',.5,.5),('quarter-se',.5,.5),
 ('edge-north',1,.23),('edge-south',1,.23),('edge-east',.23,1),('edge-west',.23,1),
 ('corner-nw',.25,.25),('corner-ne',.25,.25),('corner-sw',.25,.25),('corner-se',.25,.25)]
services=['service-vent','service-hatch','service-conduit','service-led-panel','service-drain']
assert len(base_shape)==15 and len(services)==5

def tint(c,alpha=255):return tuple(int(max(0,min(255,x))) for x in c)+(alpha,)

def texture(code,style):
    """Very subtle deterministic brushed/PBR metal base color, not a marble texture."""
    rng=np.random.default_rng(SEED+int(code[-2:])*91)
    n=256; base=np.array(style['panel'],np.float32)
    grain=rng.normal(0,1.15,(n,n,1))
    scan=rng.normal(0,1.2,(n,1,1))
    a=np.clip(base+grain+scan,0,255).astype('uint8')
    img=Image.fromarray(a,'RGB')
    path=MATDIR/f'{code}-brushed-metal-source.png'
    img.save(path,optimize=True)
    # Tangent-space near-flat micro-normal: perceptible only in actual reflective light.
    vv=rng.normal(0,1.4,(n,n,2))
    nx=np.clip(127+vv[:,:,0],0,255).astype('uint8')
    ny=np.clip(127+vv[:,:,1],0,255).astype('uint8')
    normal=np.stack((nx,ny,np.full((n,n),254,dtype='uint8')),axis=2)
    npath=MATDIR/f'{code}-micro-normal.png'
    Image.fromarray(normal,'RGB').save(npath,optimize=True)
    return img,Image.fromarray(normal,'RGB'),path,npath

def prism_polygon_xy_xz(points,ylo,yhi):
    """Convex chamfered XZ footprint with true side walls. Y is UP."""
    n=len(points); vertices=[]
    for y in (ylo,yhi):vertices.extend([[x,y,z] for x,z in points])
    faces=[]
    for i in range(1,n-1):faces.append((n,n+i,n+i+1));faces.append((0,i+1,i))
    for i in range(n):
        j=(i+1)%n
        faces.extend([(i,j,n+j),(i,n+j,n+i)])
    mesh=trimesh.Trimesh(vertices=np.asarray(vertices,float),faces=faces,process=False)
    mesh.fix_normals()
    assert mesh.is_watertight
    return mesh

def chamfer_points(x,z,w,d,cut):
    cut=min(cut,w*.28,d*.28)
    # xz points in clockwise footprint; this produces physically clipped corners.
    return [(x+cut,z),(x+w-cut,z),(x+w,z+cut),(x+w,z+d-cut),
            (x+w-cut,z+d),(x+cut,z+d),(x,z+d-cut),(x,z+cut)]

def cuboid(x,y,z,w,h,d):
    mesh=trimesh.creation.box(extents=[w,h,d]);mesh.apply_translation([x+w/2,y+h/2,z+d/2]);return mesh

def tube_cylinder(cx,cy,cz,rad,height,segments=16):
    mesh=trimesh.creation.cylinder(radius=rad,height=height,sections=segments)
    mesh.apply_transform(trimesh.transformations.rotation_matrix(-math.pi/2,[1,0,0]))
    mesh.apply_translation([cx,cy+height/2,cz]);return mesh

def material(name,rgb,rough=.68,metal=.7,emissive=None,img=None,normal=None):
    kw=dict(name=name,baseColorFactor=tint(rgb),roughnessFactor=float(rough),metallicFactor=float(metal),doubleSided=False)
    if img is not None:
        kw['baseColorTexture']=img
        if normal is not None:kw['normalTexture']=normal
    if emissive:kw['emissiveFactor']=tuple((x/255)*.92 for x in emissive)
    return PBRMaterial(**kw)

def assign(mesh,m,uv=False,scale=1):
    if uv:
        vs=np.asarray(mesh.vertices)
        mesh.visual=TextureVisuals(uv=np.column_stack((vs[:,0]*scale,vs[:,2]*scale)),material=m)
    else:mesh.visual.material=m
    return mesh

def panel(code,kind,w,d,atlas,normal):
    style=C[code]
    main=material('panel_'+code,(255,255,255),style['roughness'],style['metallic'],img=atlas,normal=normal)
    rim=material('panel_rim_'+code,style['rim'],min(1,style['roughness']+.1),style['metallic'])
    frame=material('frame_'+code,style['frame'],.45,.76)
    secondary=material('secondary_'+code,style['secondary'],.62,.65)
    dark=material('groove_'+code,recess,.82,.3)
    light=material('cyan_status_glass',cyan,.26,.16,emissive=cyan)
    glass=material('frosted_panel_glass',(128,218,227),.34,.16,emissive=(6,85,94))
    gold=material('screws_titanium',(178,188,186),.22,.92)
    geo=[]
    def add(g,m,uv=False):
        g=assign(g,m,uv)
        geo.append(g)
    height=.065
    add(prism_polygon_xy_xz(chamfer_points(0,0,w,d,.018),0,.019),frame)
    add(prism_polygon_xy_xz(chamfer_points(.008,.008,w-.016,d-.016,.016),.019,.049),rim)
    # Fine true recessed channel under metallic face; several layered solids.
    add(prism_polygon_xy_xz(chamfer_points(.018,.018,w-.036,d-.036,.013),.048,.053),dark)
    add(prism_polygon_xy_xz(chamfer_points(.025,.025,w-.050,d-.050,.012),.053,.065),main,uv=True)
    # Panel geometry forms a consistent X-shaped V pattern for main floor modules.
    wide=w>=.45 and d>=.45
    if wide:
        # Inset centre plate with beveled perimeter and X-shaped seams (physical thin strips).
        mx,my=w/2,d/2
        cx=max(.10,w*.25); cz=max(.10,d*.25)
        add(prism_polygon_xy_xz(chamfer_points(mx-cx/2,my-cz/2,cx,cz,.009),.065,.066),rim)
        # Grooves are thin dark solid recessed lines laid over top, no decal cards.
        for sx in (-1,1):
            for sz in (-1,1):
                x1=mx + sx*cx*.41;z1=my+sz*cz*.41
                x2=mx+sx*(w*.43);z2=my+sz*(d*.43)
                delta=(x2-x1,z2-z1);length=math.hypot(*delta)
                if length<.025:continue
                bar=cuboid(-length/2,.0645,-.0019,length,.0018,.0038)
                # Initially aligned to X, rotate into XZ direction centered on endpoints.
                bar.apply_transform(trimesh.transformations.rotation_matrix(-math.atan2(delta[1],delta[0]),[0,1,0]))
                bar.apply_translation([(x1+x2)/2,0,(z1+z2)/2]);add(bar,dark)
    else:
        # narrow trims: one continuous shallow straight groove down long dimension
        if w>=d and w>.35:add(cuboid(.045,.0645,d*.49,w-.09,.0017,.004),dark)
        if d>w and d>.35:add(cuboid(w*.49,.0645,.045,.004,.0017,d-.09),dark)
    # Mechanical corner caps with chamfer, tiny metal bolts; avoid intersections beyond bounds.
    bolts=[]
    for x,z in ((.056,.056),(w-.056,.056),(.056,d-.056),(w-.056,d-.056)):
        if x<=.03 or z<=.03 or x>=w-.03 or z>=d-.03:continue
        if any(abs(x-u)<.012 and abs(z-v)<.012 for u,v in bolts):continue
        bolts.append((x,z));add(tube_cylinder(x,.0648,z,.0065,.003,12),gold)
    # Surface illuminated strips as real solids, on the interior lip, not dynamic game lights.
    if w>.35:
        span=min(w*.29,.28);add(cuboid((w-span)/2,.051,.013,span,.0045,.009),light)
        if d>.35:add(cuboid((w-span)/2,.051,d-.022,span,.0045,.009),light)
    if d>.35:
        span=min(d*.23,.22);add(cuboid(.013,.051,(d-span)/2,.009,.0045,span),light)
    # Narrow slots beneath face edge mimic ventilation vents of the accepted render.
    if w>.32 and d>.32:
        for k in range(4):
            x=.08+k*.018
            if x<w-.1:add(cuboid(x,.0487,.010,.009,.0017,.006),dark)
    # Extra service panel variants: five mechanical top modules per material.
    if kind in services:
        # Service modules all remain separate complete 1x1m square assemblies.
        inner=.18; size=.64
        add(prism_polygon_xy_xz(chamfer_points(inner,inner,size,size,.035),.066,.072),dark)
        if kind=='service-vent':
            # Six deep black ventilation openings with raised individual chrome grates.
            for k in range(6):
                z=.25+k*.085
                add(cuboid(.25,.072,z,.50,.004,.029),dark)
                add(cuboid(.25,.076,z+.011,.50,.004,.007),rim)
        elif kind=='service-hatch':
            add(prism_polygon_xy_xz(chamfer_points(.205,.205,.59,.59,.03),.073,.077),main,uv=True)
            for k in range(3):
                add(cuboid(.35+k*.035,.077,.28,.01,.003,.018),dark)
            for x,z in ((.23,.23),(.77,.23),(.77,.77),(.23,.77)):add(tube_cylinder(x,.077,z,.009,.003),gold)
        elif kind=='service-conduit':
            add(cuboid(.468,.072,.19,.064,.008,.62),secondary)
            add(cuboid(.482,.079,.19,.035,.004,.62),light)
            for k in range(7):add(cuboid(.40,.074,.24+k*.073,.20,.002,.006),rim)
        elif kind=='service-led-panel':
            add(prism_polygon_xy_xz(chamfer_points(.205,.205,.59,.59,.03),.072,.079),glass)
            for k in range(6):
                x=.255+k*.085
                add(cuboid(x,.079,.25,.012,.0015,.50),light)
            for k in range(6):
                z=.255+k*.085
                add(cuboid(.25,.079,z,.50,.0015,.009),light)
        elif kind=='service-drain':
            # Concentric angular covers with a radial opening, true cylinders/slots.
            add(tube_cylinder(.5,.073,.5,.205,.008,32),secondary)
            for k in range(8):
                ang=k*math.pi/4
                bx=.5+.15*math.cos(ang);bz=.5+.15*math.sin(ang)
                add(tube_cylinder(bx,.082,bz,.014,.002),dark)
            add(tube_cylinder(.5,.082,.5,.058,.003,32),rim)
    result=trimesh.Scene()
    # use named individual pieces so users can inspect subcomponents in GLB.
    for i,obj in enumerate(geo):
        if not obj.is_watertight:raise RuntimeError(f'Non-solid {code} {kind} mesh {i}')
        result.add_geometry(obj,geom_name=f'{code}_{kind}_part_{i:03d}',node_name=f'{kind}/{i:03d}')
    return result,len(geo),sum(len(g.faces) for g in geo),[w,round(float(result.bounds[1,1]),5),d]


def save_glb(scene,fn,extras):
    raw=scene.export(file_type='glb')
    # Append semantic metadata into glTF JSON and preserve BIN chunks.
    assert raw[:4]==b'glTF' and int.from_bytes(raw[4:8],'little')==2
    length=int.from_bytes(raw[12:16],'little'); assert raw[16:20]==b'JSON'
    doc=json.loads(raw[20:20+length])
    doc['asset'].setdefault('extras',{})['trialum']=extras
    payload=raw[20+length:]
    text=json.dumps(doc,separators=(',',':'),ensure_ascii=False).encode('utf8')
    text+=b' '*((-len(text))%4)
    output=b'glTF'+(2).to_bytes(4,'little')+(12+8+len(text)+len(payload)).to_bytes(4,'little')+len(text).to_bytes(4,'little')+b'JSON'+text+payload
    assert int.from_bytes(output[8:12],'little')==len(output)
    p=OUT/fn;p.write_bytes(output)
    return p,output


def build():
    manifest={'schemaVersion':1,'series':'Trialum S7 M01-M03 metal floor modular family','created':'2026-11-18','glbCount':60,'unit':'m','upAxis':'Y','pbr':True,'styleReference':'User-approved M01-M03 grouped 3D render boards in chat; sci-fi metal frames and cyan accent bars','ownerRenderPass':True,'ownerPhysicalGlbDevicePass':False,'gameplayWrites':0,'allModels':[],'sourceTextures':{}}
    catalog=[]
    for code,st in C.items():
        atlas,normal,p,npath=texture(code,st)
        manifest['sourceTextures'][code]={'albedo':str(p.relative_to(ROOT)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'microNormal':str(npath.relative_to(ROOT)),'normalSHA256':hashlib.sha256(npath.read_bytes()).hexdigest()}
        for kind,w,d in [*base_shape,*[(x,1,1) for x in services]]:
            filename=f'{code}-metal-{kind}.glb'
            scene,nmeshes,ntris,bounds=panel(code,kind,w,d,atlas,normal)
            info={'assetId':filename[:-4],'finish':code,'variant':kind,'unit':'m','upAxis':'Y','localOrigin':'bottom lower-left tile corner, XZ positive, Y up','width':w,'depth':d,'height':bounds[1],'ownerApprovedRender':True,'ownerModelInspectionPending':True,'gameplayWrites':0,'renderedActiveLighting':False,'serviceFunctionality':'display only, not wired to gameplay or electricity'}
            path,raw=save_glb(scene,filename,info)
            sha=hashlib.sha256(raw).hexdigest()
            manifest['allModels'].append({'id':filename[:-4],'file':filename,'sha256':sha,'bytes':len(raw),'triangles':ntris,'physicalMeshes':nmeshes,'dimensions':bounds,'finish':code,'variant':kind,'glbHeader':'glTF 2.0'})
            catalog.append({'id':filename[:-4],'name':f'{code.upper()} · {st["name"]} · {kind}','category':f'Метални подови {code.upper()} · вистински GLB','src':f'assets/models/{filename}','dimensions':bounds,'placement':'floor','source':'tools/b1/build-s7-m01-m03-metal.py, approved metal render concept','approval':'OWNER 3D RENDER PASS; PHYSICAL GLB SHA/GEOMETRY QA; OWNER DEVICE PASS PENDING','material':st['name'],'finish':code,'variant':kind,'ownerModelPass':False,'gameplayWrites':0,'activeGameLighting':False})
    assert len(manifest['allModels'])==60 and len(set(a['id'] for a in catalog))==60
    (MATDIR/'m01-m03-metal-60-manifest.json').write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+'\n')
    (ROOT/'assets/m01-m03-catalog-additions.json').write_text(json.dumps(catalog,indent=2,ensure_ascii=False)+'\n')
    return manifest

if __name__=='__main__':
    x=build();print(json.dumps({'count':len(x['allModels']),'bytes':sum(v['bytes'] for v in x['allModels']),'finishCounts':{z:sum(v['finish']==z for v in x['allModels']) for z in C},'totalTriangles':sum(v['triangles'] for v in x['allModels'])},indent=2))
