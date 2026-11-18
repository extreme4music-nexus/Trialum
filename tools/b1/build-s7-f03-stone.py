#!/usr/bin/env python3
"""Trialum F03 54 genuine GLB 2.0 models: 27 grey-sage stone shapes x 2 owner-approved finishes.

Source texture atlases are perspective-corrected/downsized from OWNER'S ORIGINAL
smooth + subtly textured 1m photo-reference images (see docs for SHA256).
All 3D shapes are actual solid mesh with normals, UV, bevels, bounded geometry.
T is only SUBTLY uneven, not coarse rock/gravel. Pure Python stdlib, deterministic.
Owner approved the four render BOARDS. Final GLB on-device visual QA pending.
No Classic/gameplay/Android/Play Store writes.
"""
from __future__ import annotations
import base64, hashlib, json, math, struct, zlib
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
ATLAS_ROOT=ROOT/'assets/materials'
OUT=ROOT/'build/s7-floor-f03'
OUT.mkdir(parents=True,exist_ok=True)
TAU=math.tau
BEVEL=.004
THICK=.06
RI=7.2;RF=8.2;RG=8.39
SECTORS=48
SIZE=384
SOURCE_SIDE=160
EXPECTED_SOURCE_SHA={
 's':'261258381683fef534eb8d97955691b6aae9f1ded9749f20727a4d7e61bef3a9',
 't':'8f6149eba5289b68d844fd49aedbc45888de49db905ec797870bb1f0e0f0ec8c',
}
REFERENCE_SHA={
 's':'b50a1542ed4ef986424a025bf4237955b1b5d78ead42084ca8a0c3c06209fa17',
 't':'7d069b68df567197ba7f9e950982a4a39a811ee822f264a77d0e7a73e3eaa1b6',
}

class Mesh:
 def __init__(self):self.pos=[];self.norm=[];self.uv=[];self.indices=[]
 def tri(self,points,normal,uvs):
  a,b,c=points
  ab=[b[i]-a[i] for i in range(3)];ac=[c[i]-a[i] for i in range(3)]
  cr=(ab[1]*ac[2]-ab[2]*ac[1],ab[2]*ac[0]-ab[0]*ac[2],ab[0]*ac[1]-ab[1]*ac[0])
  cross=sum(cr[i]*normal[i] for i in range(3))
  if abs(cross)<1e-12:raise ValueError('Degenerate triangle: '+str(points))
  start=len(self.pos)//3
  self.pos.extend(v for p in points for v in p)
  self.norm.extend(v for _ in range(3) for v in normal)
  self.uv.extend(v for uv in uvs for v in uv)
  self.indices.extend((start,start+1,start+2) if cross>0 else (start,start+2,start+1))
 def quad(self,p,n,uv=None):
  if uv is None:uv=[(a[0],a[2]) for a in p]
  self.tri((p[0],p[1],p[2]),n,(uv[0],uv[1],uv[2]))
  self.tri((p[0],p[2],p[3]),n,(uv[0],uv[2],uv[3]))

def cloud(p,mode,width=1,depth=1,bevel=.004):
 x,z=p
 distance=min(x-bevel,z-bevel,width-bevel-x,depth-bevel-z)
 fade=max(0,min(1,distance/.035))
 fade=fade*fade*(3-2*fade)
 v=(math.sin(TAU*(27*x+11*z))*math.sin(TAU*(19*z-7*x))+
    .42*math.cos(TAU*(43*x+39*z)))
 return .00016*max(0,v)*fade if mode=='I' else 0

def slab(width=1,depth=1,phase=(0,0),height=THICK,bevel=BEVEL,mode='A'):
 """A real CLOSED / watertight solid. T finish's fine tessellated top is
 matched by segmented bevel/side walls and a triangle-fan underside, so the
 sculpted natural grain never creates a T-junction/invalid nonmanifold seam.
 """
 m=Mesh();px,pz=phase
 if min(width,depth)<.1:bevel=min(bevel,.001)
 inner=[(bevel,height,bevel),(width-bevel,height,bevel),
        (width-bevel,height,depth-bevel),(bevel,height,depth-bevel)]
 shoulder=[(0,height-bevel,0),(width,height-bevel,0),
           (width,height-bevel,depth),(0,height-bevel,depth)]
 bottom=[(x,0,z) for (x,y,z) in shoulder]
 uv=lambda p:(p[0]+px,p[2]+pz)
 div=40 if mode=='I' else 1
 if mode=='I':
  for ix in range(div):
   x0=bevel+(width-2*bevel)*ix/div
   x1=bevel+(width-2*bevel)*(ix+1)/div
   for iz in range(div):
    z0=bevel+(depth-2*bevel)*iz/div
    z1=bevel+(depth-2*bevel)*(iz+1)/div
    pts=[(x0,height-cloud((x0,z0),'I',width,depth,bevel),z0),
         (x1,height-cloud((x1,z0),'I',width,depth,bevel),z0),
         (x1,height-cloud((x1,z1),'I',width,depth,bevel),z1),
         (x0,height-cloud((x0,z1),'I',width,depth,bevel),z1)]
    m.quad(pts,(0,1,0),list(map(uv,pts)))
 else:m.quad(inner,(0,1,0),list(map(uv,inner)))
 def lerp(a,b,t):return tuple(a[k]*(1-t)+b[k]*t for k in range(3))
 cx,cz=width/2,depth/2
 for side in range(4):
  nxt=(side+1)%4
  start=shoulder[side];stop=shoulder[nxt]
  dx=stop[0]-start[0];dz=stop[2]-start[2];mag=math.hypot(dx,dz)
  outward=(dz/mag,0,-dx/mag)
  bevel_normal=(outward[0]/math.sqrt(2),1/math.sqrt(2),outward[2]/math.sqrt(2))
  for k in range(div):
   lo=k/div;hi=(k+1)/div
   it0=lerp(inner[side],inner[nxt],lo);it1=lerp(inner[side],inner[nxt],hi)
   sh0=lerp(start,stop,lo);sh1=lerp(start,stop,hi)
   b0=lerp(bottom[side],bottom[nxt],lo);b1=lerp(bottom[side],bottom[nxt],hi)
   m.quad([it0,it1,sh1,sh0],bevel_normal,list(map(uv,[it0,it1,sh1,sh0])))
   m.quad([sh0,sh1,b1,b0],outward)
   if mode=='I':
    # every lower outer edge has same vertex breakpoints as its wall
    centre=(cx,0,cz)
    m.tri((centre,b0,b1),(0,-1,0),tuple(map(uv,(centre,b0,b1))))
 if mode!='I':m.quad(bottom,(0,-1,0))
 return m

def annulus(ri,ro,sectors=1,bevel=.004,height=.06,grout=.006,div=None):
 m=Mesh();mean=(ri+ro)/2
 span=TAU/SECTORS*sectors
 start=grout/(2*mean) if sectors<=1 else 0.
 stop=span-start
 div=div or max(32,round(44*sectors))
 top_start=start+bevel/mean;top_stop=stop-bevel/mean
 def pt(r,y,ang):return (r*math.cos(ang)-ri,y,r*math.sin(ang))
 def ring(r,y,left,right):return [pt(r,y,left+(right-left)*i/div) for i in range(div+1)]
 small=ring(ri,height-bevel,start,stop);big=ring(ro,height-bevel,start,stop)
 top_i=ring(ri+bevel,height,top_start,top_stop);top_o=ring(ro-bevel,height,top_start,top_stop)
 uv=lambda q:(q[0]+ri,q[2])
 for i in range(div):
  q=[top_i[i],top_i[i+1],top_o[i+1],top_o[i]]
  m.quad(q,(0,1,0),list(map(uv,q)))
 top=top_i+list(reversed(top_o));shoulder=small+list(reversed(big));bottom=[(p[0],0,p[2]) for p in shoulder]
 for i in range(len(top)):
  j=(i+1)%len(top)
  p,q=shoulder[i],shoulder[j];dx=q[0]-p[0];dz=q[2]-p[2]
  length=math.hypot(dx,dz)
  if length<1e-8:raise ValueError('Zero length annular wall')
  outward=(-dz/length,0,dx/length)
  diagonal=(outward[0]*math.sqrt(.5),math.sqrt(.5),outward[2]*math.sqrt(.5))
  bevel_quad=[top[i],top[j],shoulder[j],shoulder[i]]
  m.quad(bevel_quad,diagonal,list(map(uv,bevel_quad)))
  m.quad([shoulder[i],shoulder[j],bottom[j],bottom[i]],outward)
 for i in range(div):
  m.quad([bottom[i],bottom[i+1],bottom[-i-2],bottom[-i-1]],(0,-1,0))
 return m

def l_showcase(corner,arm=.25,height=.135,bevel=.008):
 """Watertight single-solid L showcase, 6 outer/bevel vertices each.
 Ear-clipped top/bottom polygons avoid open T-junctions or inner bridge walls.
 """
 m=Mesh();w=arm;b=bevel
 shoulder=[(0,0),(1,0),(1,w),(w,w),(w,1),(0,1)]
 top=[(b,b),(1-b,b),(1-b,w-b),(w-b,w-b),(w-b,1-b),(b,1-b)]
 def v(p,y):return (p[0],y,p[1])
 def cross(a,b,c):return (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])
 def in_tri(p,a,b,c):
  return cross(a,b,p)>=-1e-9 and cross(b,c,p)>=-1e-9 and cross(c,a,p)>=-1e-9
 def triangulate(poly):
  idx=list(range(len(poly)));tris=[]
  while len(idx)>3:
   for i in range(len(idx)):
    aa=idx[i-1];bb=idx[i];cc=idx[(i+1)%len(idx)]
    if cross(poly[aa],poly[bb],poly[cc])<=1e-9:continue
    if any(in_tri(poly[other],poly[aa],poly[bb],poly[cc]) for other in idx if other not in (aa,bb,cc)):continue
    tris.append((aa,bb,cc));idx.pop(i);break
   else:raise ValueError('No polygon ear for L corner')
  tris.append(tuple(idx));return tris
 for a,bx,c in triangulate(top):
  pts=[v(top[i],height) for i in (a,bx,c)]
  m.tri(pts,(0,1,0),[(q[0],q[2]) for q in pts])
 for a,bx,c in triangulate(shoulder):
  pts=[v(shoulder[i],0) for i in (a,bx,c)]
  m.tri(pts,(0,-1,0),[(q[0],q[2]) for q in pts])
 for i in range(6):
  j=(i+1)%6;p,q=shoulder[i],shoulder[j]
  dx=q[0]-p[0];dz=q[1]-p[1];mag=math.hypot(dx,dz)
  nx,nz=dz/mag,-dx/mag
  A,B=v(top[i],height),v(top[j],height)
  C,D=v(q,height-bevel),v(p,height-bevel)
  m.quad([A,B,C,D],(nx/math.sqrt(2),1/math.sqrt(2),nz/math.sqrt(2)))
  m.quad([D,C,v(q,0),v(p,0)],(nx,0,nz))
 turns={'north-west':0,'north-east':1,'south-east':2,'south-west':3}[corner]
 for i in range(0,len(m.pos),3):
  x,y,z=m.pos[i:i+3]
  for _ in range(turns):x,z=1-z,x
  m.pos[i:i+3]=[x,y,z]
 for i in range(0,len(m.norm),3):
  x,y,z=m.norm[i:i+3]
  for _ in range(turns):x,z=-z,x
  m.norm[i:i+3]=[x,y,z]
 return m

def rgba_png(w,h,pix):
 def chunk(tag,data):return struct.pack('>I',len(data))+tag+data+struct.pack('>I',zlib.crc32(tag+data)&0xffffffff)
 scan=b''.join(b'\0'+pix[i*w*4:(i+1)*w*4] for i in range(h))
 return b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('>IIBBBBB',w,h,8,6,0,0,0))+chunk(b'IDAT',zlib.compress(scan,7))+chunk(b'IEND',b'')



def texture(finish):
 path=ATLAS_ROOT/f'f03-{finish}-approved-render-atlas-rgb160.zlib.b64'
 src=zlib.decompress(base64.b64decode(path.read_text().strip()))
 assert len(src)==SOURCE_SIDE*SOURCE_SIDE*3
 assert hashlib.sha256(src).hexdigest()==EXPECTED_SOURCE_SHA[finish]
 out=bytearray()
 w=SOURCE_SIDE;factor=(w-1)/(SIZE-1)
 for y in range(SIZE):
  fy=y*factor;iy=int(fy);iy1=min(w-1,iy+1);ty=fy-iy
  for x in range(SIZE):
   fx=x*factor;ix=int(fx);ix1=min(w-1,ix+1);tx=fx-ix
   for k in range(3):
    a=src[3*(iy*w+ix)+k];b=src[3*(iy*w+ix1)+k]
    c=src[3*(iy1*w+ix)+k];d=src[3*(iy1*w+ix1)+k]
    q=(a*(1-tx)+b*tx)*(1-ty)+(c*(1-tx)+d*tx)*ty
    out.append(max(0,min(255,int(q+.5))))
   out.append(255)
 return rgba_png(SIZE,SIZE,bytes(out))

def normal_map(finish):
 size=192
 pix=bytearray()
 amp=.013 if finish=='s' else .064
 for iy in range(size):
  z=iy/size
  for ix in range(size):
   x=ix/size
   dx=amp*(.35*math.sin(TAU*(21*x+3*z))+.32*math.sin(TAU*(37*x-13*z))+.19*math.cos(TAU*(59*x+17*z)))
   dz=amp*(.34*math.cos(TAU*(20*z-2*x))+.22*math.sin(TAU*(41*z+11*x))+.21*math.cos(TAU*(61*z-27*x)))
   mag=math.sqrt(dx*dx+dz*dz+1)
   pix.extend((int(127.5*((-dx/mag)+1)),int(127.5*((-dz/mag)+1)),int(127.5*(1/mag+1)),255))
 return rgba_png(size,size,bytes(pix))

def glb(m,base_png,normal_png,name,module,finish,extra=None):
 buf=bytearray();views=[];access=[]
 def add(raw,target=None):
  off=len(buf);buf.extend(raw);buf.extend(b'\0'*(-len(buf)%4))
  d={'buffer':0,'byteOffset':off,'byteLength':len(raw)}
  if target:d['target']=target
  views.append(d);return len(views)-1
 def acc(seq,fmt,typ,n,target):
  raw=struct.pack('<%s%s'%(len(seq),fmt),*seq)
  vid=add(raw,target)
  d={'bufferView':vid,'componentType':5126 if fmt=='f' else 5123,'count':len(seq)//n,'type':typ}
  if typ=='VEC3':
   d['min']=[min(seq[j::3]) for j in range(3)]
   d['max']=[max(seq[j::3]) for j in range(3)]
  access.append(d);return len(access)-1
 assert len(m.pos)//3<65535
 a=acc(m.pos,'f','VEC3',3,34962);n=acc(m.norm,'f','VEC3',3,34962)
 u=acc(m.uv,'f','VEC2',2,34962);indices=acc(m.indices,'H','SCALAR',1,34963)
 ti=add(base_png);ni=add(normal_png)
 rough=.61 if finish=='s' else .79
 mat={'name':f'F03-{finish.upper()} natural grey-green stone',
      'pbrMetallicRoughness':{'baseColorTexture':{'index':0},'baseColorFactor':[1,1,1,1],'metallicFactor':0,'roughnessFactor':rough},
      'normalTexture':{'index':1,'scale':.18 if finish=='s' else .52},'doubleSided':False}
 model={'asset':{'version':'2.0','generator':'Trialum F03 grey-green stone glTF2 from approved image-derived RGB source'},
  'scene':0,'scenes':[{'name':f'S7-F03-{finish.upper()}', 'nodes':[0]}],
  'nodes':[{'name':name,'mesh':0,'extras':{'assetId':name,'family':'F03','module':module,
   'finish':'SMOOTH_HONED' if finish=='s' else 'SUBTLE_MICRO_TEXTURE',
   'referenceImageSha256':REFERENCE_SHA[finish],
   'referenceTextureRgb160Sha256':EXPECTED_SOURCE_SHA[finish],
   'ownerRenderPass':True,'ownerGlbVisualPass':False,
   'inGame':False,'gameplayWrites':0,'slipResistanceCertified':False,
   'units':'meter','pivot':'original F01/F02-compatible local origin',**(extra or {})}}],
  'meshes':[{'name':name+'.ACTUAL_SOLID_STONE_3D','primitives':[{'attributes':{'POSITION':a,'NORMAL':n,'TEXCOORD_0':u},'indices':indices,'material':0,'mode':4}]}],
  'materials':[mat],
  'textures':[{'sampler':0,'source':0},{'sampler':0,'source':1}],
  'images':[{'mimeType':'image/png','bufferView':ti,'name':'F03 approved image-derived stone sediment atlas'},
            {'mimeType':'image/png','bufferView':ni,'name':'F03 subtle non-sharp stone micro-normal'}],
  'samplers':[{'magFilter':9729,'minFilter':9987,'wrapS':10497,'wrapT':10497}],
  'buffers':[{'byteLength':len(buf)}],'bufferViews':views,'accessors':access}
 js=json.dumps(model,separators=(',',':'),ensure_ascii=False).encode('utf-8');js+=b' '*(-len(js)%4)
 result=b'glTF'+struct.pack('<II',2,12+8+len(js)+8+len(buf))+struct.pack('<I4s',len(js),b'JSON')+js+struct.pack('<I4s',len(buf),b'BIN\0')+bytes(buf)
 assert struct.unpack_from('<II',result,4)==(2,len(result))
 return result,([min(m.pos[j::3]) for j in range(3)],[max(m.pos[j::3]) for j in range(3)])

def build():
 models=[];texhash={};normalhash={}
 for finish in ('s','t'):
  src=texture(finish);nmap=normal_map(finish)
  texhash[finish]=hashlib.sha256(src).hexdigest()
  normalhash[finish]=hashlib.sha256(nmap).hexdigest()
  (OUT/f'f03-{finish}-reference-derived-atlas.png').write_bytes(src)
  (OUT/f'f03-{finish}-subtle-normal.png').write_bytes(nmap)
  def add(name,module,mesh,extra=None):
   fname='f03-'+finish+'-stone-'+name+'.glb'
   binary,bounds=glb(mesh,src,nmap,fname[:-4],module,finish,extra)
   (OUT/fname).write_bytes(binary)
   models.append({'file':fname,'module':module,'finish':finish,'sha256':hashlib.sha256(binary).hexdigest(),
       'size':len(binary),'triangles':len(mesh.indices)//3,'vertices':len(mesh.pos)//3,
       'boundsMinM':bounds[0],'boundsMaxM':bounds[1], 'ownerGlbPass':False,'inGame':False})
  mode='I' if finish=='t' else 'A'
  add('full','A',slab(mode=mode))
  for label,z in [('first',0),('second',.5)]:
   add('half-'+label,'B',slab(1,.5,(0,z),mode=mode),{'uvPhaseZ':z,'placementOffsetZ':z})
  for idx,(x,z) in enumerate([(0,0),(.5,0),(0,.5),(.5,.5)],1):
   add('quarter-c'+str(idx),'C',slab(.5,.5,(x,z),mode=mode),{'uvPhaseXZ':[x,z],'placementOffsetXZ':[x,z]})
  for side in ('north','south','east','west'):
   p={'north':(0,-.06,1,.06),'south':(0,1,1,.06),'west':(-.06,0,.06,1),'east':(1,0,.06,1)}[side]
   add('edge-'+side,'D',slab(p[2],p[3],(p[0],p[1]),.056,.003,mode=mode),{'edge':side,'tilePlacementOffsetXZ':p[:2]})
  for corner,(x,z) in {'north-west':(-.06,-.06),'north-east':(1,-.06),'south-east':(1,1),'south-west':(-.06,1)}.items():
   add('corner-'+corner,'E',slab(.06,.06,(x,z),.056,.003,mode=mode),{'corner':corner,'tilePlacementOffsetXZ':[x,z]})
  add('radial-wedge','F',annulus(7.2,8.2),{'radiusBandM':[7.2,8.2],'sectorDegrees':7.5,'numberAroundCircle':48,'ownerReviewOnly':True})
  for key,n in [('1m',1),('half',.5),('3m-showcase',3)]:
   add('pool-trim-'+key,'G',annulus(8.2,8.39,n,.008,.135,.006 if n<=1 else 0),
       {'radiusBandM':[8.2,8.39],'sectorDegrees':7.5*n,'heightM':.135,'showcaseOnly':n==3})
  for corner in ('north-west','north-east','south-east','south-west'):
   add('l-corner-showcase-'+corner,'L',l_showcase(corner),{'corner':corner,'trueOnePieceLShape':True,'heightM':.135})
  for side in ('north','south','east','west'):
   if side in ('north','south'):
    border=slab(1,.19,(0,-.19 if side=='north' else 1),.135,.008,mode=mode)
   else:
    border=slab(.19,1,(-.19 if side=='west' else 1,0),.135,.008,mode=mode)
   add('raised-border-showcase-'+side,'R',border,{'side':side,'heightM':.135,'raisedShowcaseOnly':True})
  assert len([x for x in models if x['finish']==finish])==27
 assert len(models)==54
 manifest={'schemaVersion':1,'family':'F03','ownerRenderPass':True,'ownerGlbPass':False,'gameplayWrites':0,
           'referencePhotoSha256':REFERENCE_SHA,'derivedAtlasRawSha256':EXPECTED_SOURCE_SHA,
           'embeddedAtlasSha256':texhash,'embeddedNormalSha256':normalhash,
           'models':models}
 (OUT/'qa-manifest.json').write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
 print(json.dumps({'count':len(models),'perFinish':27,'totalBytes':sum(x['size'] for x in models),
        'atlas':texhash, 'models':[x['file'] for x in models]},ensure_ascii=False,indent=2))
 return models
if __name__=='__main__':build()