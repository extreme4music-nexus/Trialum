#!/usr/bin/env python3
"""Trialum S7.8-B: deterministic ORIGINAL F01-A cream-white marble GLB, REVIEW ONLY.
No game-state writes, no scene installation. Python 3 standard library only.
Run from any working directory: python3 tools/b1/build-s7-f01-marble.py
Outputs build/s7-floor-f01/F01-A/*.glb, basecolor PNG and QA manifest.
"""
from __future__ import annotations
import hashlib, json, math, pathlib, struct, zlib

ROOT=pathlib.Path(__file__).resolve().parents[2]
OUT=ROOT/'build/s7-floor-f01/F01-A'
OUT.mkdir(parents=True,exist_ok=True)
SIZE=384


def png_rgba(w,h,pixels):
    def ch(typ,payload):return struct.pack('>I',len(payload))+typ+payload+struct.pack('>I',zlib.crc32(typ+payload)&0xffffffff)
    scan=b''.join(b'\x00'+pixels[y*w*4:(y+1)*w*4] for y in range(h))
    return (b'\x89PNG\r\n\x1a\n'+ch(b'IHDR',struct.pack('>IIBBBBB',w,h,8,6,0,0,0))+
            ch(b'IDAT',zlib.compress(scan,level=9))+ch(b'IEND',b''))


def make_marble_png():
    colors=bytearray()
    tau=2*math.pi
    for py in range(SIZE):
        v=(py+.5)/SIZE
        for px in range(SIZE):
            u=(px+.5)/SIZE
            # Periodic 2D harmonics: borders match when identical modules repeat.
            a=tau*(u+v)
            warp=(.78*math.sin(tau*(2*u-v))+.35*math.sin(tau*(3*u+2*v))+
                  .21*math.cos(tau*(7*u-4*v))+.09*math.sin(tau*(13*u+11*v)))
            phase=a+warp
            gap=abs(math.sin(phase))
            vein=math.exp(-((gap/.045)**2))
            phase2=tau*(3*u-2*v)+.4*math.sin(tau*(u+3*v))
            vein2=math.exp(-((abs(math.sin(phase2))/.033)**2))*.35
            plume=math.exp(-((gap/.25)**2))*.24
            cloud=(1.3*math.sin(tau*(2*u+3*v))+
                   .9*math.sin(tau*(5*u-4*v))+
                   .8*math.cos(tau*(11*u+7*v)))
            # Natural non-metallic warm ivory with gentle desaturated beige veining.
            strength=min(.82,.56*vein+.20*vein2+.16*plume)
            base=(244+cloud,240+.65*cloud,233+.60*cloud)
            mineral=(183,158,123)
            rgb=[max(0,min(255,int(base[i]*(1-strength)+mineral[i]*strength))) for i in range(3)]
            colors.extend([*rgb,255])
    return png_rgba(SIZE,SIZE,bytes(colors))


class Mesh:
    def __init__(self):self.pos=[];self.norm=[];self.uv=[];self.indices=[]
    def quad(self,corners,normal,uv=None):
        start=len(self.pos)//3
        self.pos.extend(k for p in corners for k in p)
        self.norm.extend(k for _ in corners for k in normal)
        self.uv.extend(k for p in (uv or [(0,0),(1,0),(1,1),(0,1)]) for k in p)
        # choose winding to match authored face normal
        a,b,c=corners[:3]
        q=[b[i]-a[i] for i in range(3)];r=[c[i]-a[i] for i in range(3)]
        cr=(q[1]*r[2]-q[2]*r[1],q[2]*r[0]-q[0]*r[2],q[0]*r[1]-q[1]*r[0])
        if sum(cr[i]*normal[i] for i in range(3))>=0:
            self.indices.extend([start,start+1,start+2,start,start+2,start+3])
        else:self.indices.extend([start,start+2,start+1,start,start+3,start+2])


def create_tile():
    m=Mesh();t=.06;bevel=.004
    a=[(bevel,t,bevel),(1-bevel,t,bevel),(1-bevel,t,1-bevel),(bevel,t,1-bevel)]
    b=[(0,t-bevel,0),(1,t-bevel,0),(1,t-bevel,1),(0,t-bevel,1)]
    c=[(0,0,0),(1,0,0),(1,0,1),(0,0,1)]
    m.quad(a,(0,1,0),[(bevel,bevel),(1-bevel,bevel),(1-bevel,1-bevel),(bevel,1-bevel)])
    for i in range(4):
        j=(i+1)%4
        tangent=(b[j][0]-b[i][0],b[j][2]-b[i][2])
        # outward for sequence going clockwise viewed from above
        normal=(tangent[1],0,-tangent[0]);nl=math.hypot(*normal)
        normal=(normal[0]/nl,0,normal[2]/nl)
        diagonal=(normal[0]*.70710678,.70710678,normal[2]*.70710678)
        m.quad([a[i],a[j],b[j],b[i]],diagonal,[(0,1),(1,1),(1,.94),(0,.94)])
        m.quad([b[i],b[j],c[j],c[i]],normal,[(0,1),(1,1),(1,0),(0,0)])
    m.quad(c,(0,-1,0))
    return m


def build_glb(m,texture):
    buff=bytearray();views=[];access=[]
    def add(data,target=None):
        off=len(buff);buff.extend(data);buff.extend(b'\0'*(-len(buff)%4))
        view={'buffer':0,'byteOffset':off,'byteLength':len(data)}
        if target:view['target']=target
        views.append(view)
        return len(views)-1
    def accessor(data,comp,typ,arity,target):
        if comp==5126:payload=struct.pack('<%sf'%len(data),*data)
        elif comp==5123:payload=struct.pack('<%sH'%len(data),*data)
        else:raise ValueError('unsupported accessor')
        idx=add(payload,target)
        obj={'bufferView':idx,'componentType':comp,'count':len(data)//arity,'type':typ}
        if typ=='VEC3':
            obj['min']=[min(data[i::3]) for i in range(3)]
            obj['max']=[max(data[i::3]) for i in range(3)]
        access.append(obj);return len(access)-1
    positions=accessor(m.pos,5126,'VEC3',3,34962)
    normals=accessor(m.norm,5126,'VEC3',3,34962)
    uv=accessor(m.uv,5126,'VEC2',2,34962)
    indices=accessor(m.indices,5123,'SCALAR',1,34963)
    texview=add(texture)
    model={
      'asset':{'version':'2.0','generator':'Trialum S7 F01 standard-library generator 1.0','copyright':'Original Trialum artwork'},
      'extensionsUsed':[],
      'scenes':[{'name':'S7-FLOOR-F01-A','nodes':[0]}],'scene':0,
      'nodes':[{'name':'F01-A :: 1m cream-white marble floor, Y-up','mesh':0,
                'extras':{'assetId':'S7-FLOOR-F01-A','status':'OWNER_RENDER_APPROVED_GEOMETRY_REVIEW','centerOfTileMeters':[.5,.03,.5], 'origin':'bottom-left','units':'m','gameAuthority':False,'changesGameplay':False}}],
      'meshes':[{'name':'F01-A.GenuineSlab','primitives':[{'attributes':{'POSITION':positions,'NORMAL':normals,'TEXCOORD_0':uv},'indices':indices,'material':0,'mode':4}]}],
      'materials':[{'name':'F01.cream-white.PBR-dry','pbrMetallicRoughness':{'baseColorTexture':{'index':0},'baseColorFactor':[1,1,1,1], 'metallicFactor':0.,'roughnessFactor':.275},'doubleSided':False}],
      'samplers':[{'magFilter':9729,'minFilter':9987,'wrapS':10497,'wrapT':10497}],
      'textures':[{'sampler':0,'source':0}],
      'images':[{'name':'F01-A cream marble embedded original texture','mimeType':'image/png','bufferView':texview}],
      'buffers':[{'byteLength':len(buff)}],'bufferViews':views,'accessors':access
    }
    js=json.dumps(model,separators=(',',':'),ensure_ascii=False).encode('utf-8')
    js+=b' '*(-len(js)%4)
    binbytes=bytes(buff)
    return (b'glTF'+struct.pack('<II',2,12+8+len(js)+8+len(binbytes))+
             struct.pack('<I4s',len(js),b'JSON')+js+
             struct.pack('<I4s',len(binbytes),b'BIN\0')+binbytes)


def main():
    p=make_marble_png();m=create_tile();b=build_glb(m,p)
    dst=OUT/'f01-marble-cream-full.glb';dst.write_bytes(b)
    tex=OUT/'f01-marble-cream-basecolor.png';tex.write_bytes(p)
    qa={'assetId':'S7-FLOOR-F01-A','status':'REAL_GLB_BUILT_FOR_REVIEW_NOT_IN_GAME',
        'widthM':1.0,'depthM':1.0,'heightM':.06,'pivot':[0,0,0],'axis':'Y_UP',
        'vertices':len(m.pos)//3,'triangles':len(m.indices)//3,'metallic':0,'roughness':.275,
        'source':'REF-02 approved by owner 2026-11-17','glb':dst.name,'glbBytes':len(b),
        'glbSha256':hashlib.sha256(b).hexdigest(),'textureBytes':len(p),
        'textureSha256':hashlib.sha256(p).hexdigest(),'inGame':False,'ownerModelPass':False,
        'canonicalBedWrites':0,'actualAquaticSlotsAdded':0,
        'notes':'Single tile only. F01-B..I NOT built; no signed Android APK.'}
    (OUT/'qa-manifest.json').write_text(json.dumps(qa,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
    assert b[:4]==b'glTF' and struct.unpack_from('<I',b,8)[0]==len(b)
    assert len(m.pos)//3==4*(1+4+4+1)
    print(json.dumps(qa,indent=2,ensure_ascii=False))

if __name__=='__main__':main()
