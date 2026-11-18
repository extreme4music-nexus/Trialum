#!/usr/bin/env python3
"""Original Trialum F01-H honed service + F01-I fine-textured wet-adjacent
cream-white marble, 1m x 1m x .06m, 4mm real chamfer.

Only material/surface finishes differ: SAME frozen F01-A approved mineral
basecolor PNG and world 1m scale. H has soft matte micro-normal; I has finer
stone stippling plus tiny *real* height perturbations on a 40x40 top mesh.
"Anti-slip" is a VISUAL design designation, NOT physical friction certification.
Runs Python 3 standard library only. No game, state, server or user writes.
"""
from __future__ import annotations
import hashlib,json,math,runpy,struct
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
F01=runpy.run_path(str(ROOT/"tools/b1/build-s7-f01-marble.py"))
OUT=ROOT/"build/s7-floor-f01/F01-HI"
A_SHA="787965608e2e4005a0ee84c857d7f0379a8093149b39da6bacb2d012feafc147"
TEX_SHA="81c434a57b770148ced6e9c40dccabade929a844a27b143f2dc13a4da0ff8c98"
THICK=.06
BEVEL=.004
TOP_GRID=40

def height_noise(x,z,mode):
    t=math.tau
    if mode=="H":
        return (.55*math.sin(t*(16*x+3*z))*
                math.cos(t*(19*z-2*x))+
                .22*math.sin(t*(37*x+31*z))+
                .10*math.sin(t*(64*x-29*z)))
    return (.58*math.sin(t*(21*x+4*z))*
            math.sin(t*(17*z-2*x))+
            .26*math.sin(t*(43*x+51*z))+
            .15*math.cos(t*(67*x-39*z)))

def grain_png(mode):
    # Bump normal map in tangent space: neutral RGB=(128,128,255).
    size=256
    scale=.0012 if mode=="H" else .0032
    pixels=bytearray()
    for y in range(size):
        z=y/(size-1)
        for x_idx in range(size):
            x=x_idx/(size-1)
            e=.0008
            dx=(height_noise(x+e,z,mode)-height_noise(x-e,z,mode))/(2*e)
            dz=(height_noise(x,z+e,mode)-height_noise(x,z-e,mode))/(2*e)
            nx=-scale*dx
            ny=-scale*dz
            nz=1.0
            ln=math.sqrt(nx*nx+ny*ny+nz*nz)
            pixels.extend((
                max(0,min(255,round(127.5*(nx/ln+1)))),
                max(0,min(255,round(127.5*(ny/ln+1)))),
                max(0,min(255,round(127.5*(nz/ln+1)))),
                255
            ))
    return F01["png_rgba"](size,size,bytes(pixels))

def microtop(x,z):
    # Extremely shallow etched real topology; not sharp grooves.
    # Its boundary blends to exactly the original H/A tile top (0.06m).
    d=min(x-BEVEL,1-BEVEL-x,z-BEVEL,1-BEVEL-z)
    fade=min(1,max(0,d/.04))
    fade=fade*fade*(3-2*fade)
    q=(.42+.25*math.sin(math.tau*(21*x+3*z))*math.cos(math.tau*(19*z-4*x))+
       .13*math.sin(math.tau*(39*x-22*z)))
    return THICK-.0007*fade*max(0,min(1,q))

def textured_mesh():
    m=F01["Mesh"]()
    lo=BEVEL;hi=1-BEVEL
    for zi in range(TOP_GRID):
        z0=lo+(hi-lo)*zi/TOP_GRID
        z1=lo+(hi-lo)*(zi+1)/TOP_GRID
        for xi in range(TOP_GRID):
            x0=lo+(hi-lo)*xi/TOP_GRID
            x1=lo+(hi-lo)*(xi+1)/TOP_GRID
            quad=[(x0,microtop(x0,z0),z0),
                  (x1,microtop(x1,z0),z0),
                  (x1,microtop(x1,z1),z1),
                  (x0,microtop(x0,z1),z1)]
            # Smooth, gently changing normal; Mesh.quad controls triangle winding.
            xm=(x0+x1)/2;zm=(z0+z1)/2
            h=.0001
            dx=(microtop(xm+h,zm)-microtop(xm-h,zm))/(2*h)
            dz=(microtop(xm,zm+h)-microtop(xm,zm-h))/(2*h)
            nx,ny,nz=-dx,1.,-dz
            mag=math.sqrt(nx*nx+ny*ny+nz*nz)
            m.quad(quad,(nx/mag,ny/mag,nz/mag),[(x0,z0),(x1,z0),(x1,z1),(x0,z1)])
    a=[(BEVEL,THICK,BEVEL),(1-BEVEL,THICK,BEVEL),
       (1-BEVEL,THICK,1-BEVEL),(BEVEL,THICK,1-BEVEL)]
    b=[(0,THICK-BEVEL,0),(1,THICK-BEVEL,0),
       (1,THICK-BEVEL,1),(0,THICK-BEVEL,1)]
    c=[(0,0,0),(1,0,0),(1,0,1),(0,0,1)]
    for i in range(4):
        j=(i+1)%4
        tang=(b[j][0]-b[i][0],b[j][2]-b[i][2])
        outward=(tang[1],0,-tang[0])
        norm=math.hypot(outward[0],outward[2])
        outward=(outward[0]/norm,0,outward[2]/norm)
        diagonal=(outward[0]/math.sqrt(2),1/math.sqrt(2),outward[2]/math.sqrt(2))
        m.quad([a[i],a[j],b[j],b[i]],diagonal,
               [(0,1),(1,1),(1,.94),(0,.94)])
        m.quad([b[i],b[j],c[j],c[i]],outward,
               [(0,1),(1,1),(1,0),(0,0)])
    m.quad(c,(0,-1,0))
    return m

def retag_and_attach_normal(raw,normal_png,mode):
    original_len,tag=struct.unpack_from("<I4s",raw,12)
    assert tag==b"JSON"
    model=json.loads(raw[20:20+original_len])
    pos=20+original_len
    n,tag=struct.unpack_from("<I4s",raw,pos)
    assert tag==b"BIN\0"
    binary=bytearray(raw[pos+8:pos+8+n])
    assert len(binary)==n
    view_idx=len(model["bufferViews"])
    offset=len(binary)
    binary.extend(normal_png)
    binary.extend(b"\0"*(-len(binary)%4))
    model["bufferViews"].append({"buffer":0,"byteOffset":offset,"byteLength":len(normal_png)})
    image_idx=len(model["images"])
    model["images"].append({"name":"F01-"+mode+" stone micro-normal from original marble finish",
                            "mimeType":"image/png","bufferView":view_idx})
    tex_idx=len(model["textures"])
    model["textures"].append({"sampler":0,"source":image_idx})
    mat=model["materials"][0]
    # Nonmetallic original mineral color, distinct top treatments.
    mat["name"]="F01."+("H.honed-service-cream-marble" if mode=="H" else "I.fine-textured-wet-adjacent-cream-marble")
    pbr=mat["pbrMetallicRoughness"]
    pbr["metallicFactor"]=0.
    pbr["roughnessFactor"]=.70 if mode=="H" else .86
    mat["normalTexture"]={"index":tex_idx,"texCoord":0,"scale":.28 if mode=="H" else .62}
    identity="S7-FLOOR-F01-"+mode
    model["asset"]["generator"]="Original Trialum F01-"+mode+" honed/wet-adjacent premium cream marble"
    model["scenes"][0]["name"]=identity
    model["nodes"][0]["name"]=identity+" individual 1m square stone slab"
    model["nodes"][0]["extras"]={
       "assetId":identity,"family":"F01","module":"F01-"+mode,
       "visualFinish":"HONED_MATTE_SERVICE" if mode=="H" else "FINE_STIPPLE_WET_ADJACENT",
       "dimensionsM":[1,.06,1],"bevelM":.004,"units":"m","axis":"Y_UP",
       "ownerApprovedReferenceBaseTexture":True,"ownerModelVisualReviewPending":True,
       "actualTestedSlipResistance":False,"renderOnlyAntiSlipDesignation":mode=="I",
       "serviceFloorUse":mode=="H","realTopSurfaceDisplacement":mode=="I",
       "noGameStateWrites":True,"inGame":False,"gameAuthority":False,
       "frozenOriginalF01ATextureSha256":TEX_SHA,
       "normalMapEmbedded":True
    }
    model["meshes"][0]["name"]=identity+" actual solid beveled marble"
    model["images"][0]["name"]="Frozen owner-approved F01-A cream mineral basecolor"
    model["buffers"][0]["byteLength"]=len(binary)
    js=json.dumps(model,separators=(",",":"),ensure_ascii=False).encode("utf8")
    js+=b" "*(-len(js)%4)
    result=(b"glTF"+struct.pack("<II",2,12+8+len(js)+8+len(binary))+
            struct.pack("<I4s",len(js),b"JSON")+js+
            struct.pack("<I4s",len(binary),b"BIN\0")+bytes(binary))
    assert struct.unpack_from("<II",result,4)==(2,len(result))
    return result

def main():
    base=F01["make_marble_png"]()
    assert hashlib.sha256(base).hexdigest()==TEX_SHA
    original=F01["build_glb"](F01["create_tile"](),base)
    assert hashlib.sha256(original).hexdigest()==A_SHA
    OUT.mkdir(parents=True,exist_ok=True)
    entries=[]
    for mode in ("H","I"):
        m=F01["create_tile"]() if mode=="H" else textured_mesh()
        assert len(m.indices)%3==0
        assert min(m.pos[1::3])==0 and abs(max(m.pos[1::3])-.06)<1e-8
        assert max(m.indices)<65535
        normal=grain_png(mode)
        result=retag_and_attach_normal(F01["build_glb"](m,base),normal,mode)
        assert len(result)<500_000
        filename="f01-"+mode.lower()+"-cream-marble-"+("matte-service" if mode=="H" else "fine-textured-wet")+".glb"
        (OUT/filename).write_bytes(result)
        (OUT/("f01-"+mode.lower()+"-micro-normal.png")).write_bytes(normal)
        entries.append({"module":"F01-"+mode,"file":filename,"bytes":len(result),
                        "sha256":hashlib.sha256(result).hexdigest(),
                        "triangles":len(m.indices)//3,"vertices":len(m.pos)//3,
                        "normalTextureSha256":hashlib.sha256(normal).hexdigest(),
                        "roughness":.70 if mode=="H" else .86,
                        "ownerModelVisualReviewPending":True,
                        "physicalSlipResistanceCertified":False,
                        "inGame":False})
    manifest={"schemaVersion":1,"family":"S7-FLOOR-F01-HI",
              "frozenOriginalATextureSha256":TEX_SHA,
              "frozenOriginalAGlbSha256":A_SHA,
              "gameplayWrites":0,"productionInstall":False,
              "assets":entries}
    (OUT/"qa-manifest.json").write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+"\n",encoding="utf8")
    print(json.dumps(manifest,indent=2,ensure_ascii=False))
if __name__=="__main__":
    main()
