/* Trialum S1 architectural GLB compiler. ORIGINAL textures/geometries.
 * This BUILD-ONLY exporter reads visual-recipe.json and scene.json.
 * No game engine or procedural geometry is executed on the Android device.
 */
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import crypto from "node:crypto";
import {fileURLToPath} from "node:url";
import * as THREE from "three";

const dirname=path.dirname(fileURLToPath(import.meta.url));
const ROOT=path.resolve(dirname,"../..");
const DIR=path.join(ROOT,"prototypes/lw-d/scenes/agro-lobby");
const SCENE=JSON.parse(fs.readFileSync(path.join(DIR,"scene.json"),"utf8"));
const ART=JSON.parse(fs.readFileSync(path.join(DIR,"visual-recipe.json"),"utf8"));
const assert=(v,msg)=>{if(!v)throw Error("Agro Lobby GLB: "+msg);};
const align=n=>(n+3)&~3;
assert(SCENE.sceneId==="trialum.ground.agro.lobby" && SCENE.unitsPerMeter===1 && SCENE.upAxis==="Y","metric source scene");
assert(SCENE.portals.length===3 && SCENE.portals.every(p=>p.status==="planned"&&p.action==="inspect-only"),"3 preview-only portals");
assert(ART.schemaVersion===1&&ART.designId==="trialum.agro.atrium.sunlit.v1","visual recipe revision");

const crcTable=Array.from({length:256},(_,n)=>{let c=n;for(let i=0;i<8;i++)c=(c&1)?0xedb88320^(c>>>1):(c>>>1);return c>>>0;});
function crc32(bytes){let c=0xffffffff;for(const b of bytes)c=crcTable[(c^b)&255]^(c>>>8);return (c^0xffffffff)>>>0;}
function chunk(type,data){const name=Buffer.from(type,"ascii"),out=Buffer.alloc(data.length+12);out.writeUInt32BE(data.length,0);name.copy(out,4);data.copy(out,8);out.writeUInt32BE(crc32(out.subarray(4,8+data.length)),data.length+8);return out;}
function noise(x,y,seed=0){let n=(Math.imul(x+seed,374761393)+Math.imul(y+seed,668265263))|0;n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967295;}
function makeTexture(kind,size){
 const scan=Buffer.alloc(size*(1+size*4));
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const n=noise(x,y,kind.length);
  let r,g,b;
  if(kind==="limestone"){
   const vein=Math.sin((x+y*.47)*.092+Math.sin(y*.035)*2.5);
   const shade=203+12*vein+(n-.5)*23;
   r=shade+9;g=shade+7;b=shade-3;
  }else if(kind==="timber"){
   const grain=Math.sin(x*.31+Math.sin(y*.045)*2.4)*17+Math.sin(x*.79)*7;
   const shade=105+grain+(n-.5)*18;r=shade+27;g=shade-1;b=shade-28;
  }else{
   const chips=n>.985?65:(n>.94?27:0);
   const vein=Math.sin((x*.08+y*.11)+Math.cos(y*.07))> .976?17:0;
   const shade=185+(n-.5)*18;
   r=shade+19-chips-vein;g=shade+27-chips*.65-vein*.65;b=shade+19-chips*.75;
  }
  const o=y*(1+size*4)+1+x*4;
  for(const [offset,v] of [r,g,b,255].entries())scan[o+offset]=Math.max(0,Math.min(255,Math.round(v)));
 }
 const header=Buffer.alloc(13);header.writeUInt32BE(size,0);header.writeUInt32BE(size,4);header[8]=8;header[9]=6;
 return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk("IHDR",header),chunk("IDAT",zlib.deflateSync(scan,{level:9})),chunk("IEND",Buffer.alloc(0))]);
}

const program=[];
const box=(id,mat,p,s,rot=[0,0,0])=>program.push({id,mat,kind:"box",p,s,rot});
const cyl=(id,mat,p,s)=>program.push({id,mat,kind:"cylinder",p,s});
const sph=(id,mat,p,s)=>program.push({id,mat,kind:"sphere",p,s});
const cone=(id,mat,p,s)=>program.push({id,mat,kind:"cone",p,s});
const ring=(id,mat,p,s,rot=[0,0,0])=>program.push({id,mat,kind:"torus",p,s,rot});
const a=ART.architecture,W=a.width/2,D=a.depth/2,H=a.height;
// Deep, luxurious architectural base and tile-rich floor. Everything here is
// declarative recipe -> offline GLB; scene engine has zero hardcoded geometry.
box("foundation.mass","foundation",[0,-.27,0],[14.7,.54,18.6]);
box("foundation.terrazzo","terrazzo",[0,-.017,0],[13.7,.04,17.7]);
box("floor.center-runner","limestone",[0,.019,-.8],[8.1,.012,13.0]);
for(let i=0;i<17;i++){
 const z=7.55-i*.95;
 box("floor.brass-joint."+i,"brass",[0,.033,z],[12.85,.008,.022]);
}
for(const x of [-5.9,-4.2,-2.1,0,2.1,4.2,5.9]){
 box("floor.inlay."+x,"brass",[x,.044,-.85],[.025,.01,15.9]);
}
for(const radius of [2.2,2.8,3.4]){
 ring("floor.medallion."+radius,"brass",[0,.054,1.15],[radius,radius,.8],[-Math.PI/2,0,0]);
}
sph("floor.central-gem","mintGlow",[0,.12,1.15],[.42,.09,.42]);
box("rear.header.stone","limestone",[0,4.92,-8.9],[14,2.6,.28]);
box("rear.base","darkstone",[0,.23,-8.85],[14,.45,.32]);
for(const [i,x] of a.portalCentersX.entries()){
 const mats=["warehousePortal","gardenPortal","phytoPortal"],m=mats[i];
 const stem="portal."+["warehouse","garden","phytolab"][i];
 box(stem+".recess",m,[x,1.7,-8.74],[2.4,3.25,.2]);
 box(stem+".panel",m,[x,1.58,-8.60],[2.21,2.9,.085]);
 for(const side of [-1,1]){
  box(stem+".edge."+side,"brass",[x+side*1.29,1.66,-8.52],[.11,3.32,.16]);
  box(stem+".stripe."+side,"goldGlow",[x+side*1.14,1.6,-8.49],[.025,2.98,.025]);
 }
 box(stem+".lintel","brass",[x,3.27,-8.53],[2.62,.13,.17]);
 ring(stem+".arch","brass",[x,3.27,-8.52],[1.26,.48,.95]);
 sph(stem+".keystone","goldGlow",[x,3.74,-8.52],[.23,.19,.12]);
 box(stem+".plaque","limestone",[x,4.10,-8.53],[2.55,.39,.08]);
 for(const sx of [-.5,.5])sph(stem+".light."+sx,"goldGlow",[x+sx,3.99,-8.47],[.06,.05,.045]);
}
for(const x of [-6.7,-5.45,-2.9,-1.25,1.25,2.9,5.45,6.7]){
 box("rear.wall-pier."+x,"limestone",[x,1.95,-8.84],[.33,3.75,.34]);
}
for(const z of [-8.4,8.4]){
 box("tracery.ground."+z,"brass",[0,.44,z],[13.8,.036,.042]);
}
for(const side of [-1,1]){
 const x=side*6.85;
 box("side.parapet."+side,"limestone",[x,.45,0],[.27,.9,18]);
 box("side.roofline."+side,"limestone",[x,5.68,0],[.27,1,18]);
 box("side.glazing."+side,"glass",[x,3.07,0],[.11,4.38,17.5]);
 for(const z of a.columnZ){
  cyl("colonnade."+side+"."+z,"limestone",[side*6.19,2.63,z],[.55,5.22,.55]);
  cyl("column.base."+side+"."+z,"brass",[side*6.19,.28,z],[.78,.26,.78]);
  cyl("column.crown."+side+"."+z,"brass",[side*6.19,5.07,z],[.69,.22,.69]);
  box("side.mullion."+side+"."+z,"brass",[x,3.06,z],[.09,4.55,.092]);
 }
 for(const z of [-7.4,-5.4,-3.4,-1.4,.6,2.6,4.6,6.6])
  box("side.window.lintel."+side+"."+z,"brass",[x,3.7,z],[.13,.05,1.9]);
}
box("entry.west-pier","limestone",[-5.45,2.55,8.85],[3.1,5.1,.24]);
box("entry.east-pier","limestone",[5.45,2.55,8.85],[3.1,5.1,.24]);
box("entry.front-glass","glass",[0,2.75,8.86],[7.8,5.25,.09]);
box("entry.crest","brass",[0,5.5,8.9],[13.7,.18,.2]);
for(const x of [-3.0,0,3.0])box("entry.glass-frame."+x,"brass",[x,2.7,8.92],[.08,5.15,.13]);
// Sunlight floods the atrium through a segmented roof with brass fins.
box("skylight.prism","glass",[0,5.72,0],[12.9,.15,17.8]);
for(const x of a.roofRibsX){
 box("roof.arch-rib."+x,"brass",[x,5.67,0],[.095,.15,18.1]);
}
for(let z=-8;z<=8;z+=2){
 box("roof.crossbar."+z,"brass",[0,5.65,z],[13.6,.10,.09]);
}
// Warm elevated mezzanine — first-floor continuity is VISUAL ONLY.
box("mezzanine.gallery","timber",[0,4.53,-6.55],[13.3,.28,2.15]);
box("mezzanine.gold-edge","brass",[0,4.50,-5.47],[13.3,.1,.12]);
for(let x=-6.2;x<=6.2;x+=1.55){
 box("mezzanine.rail-post."+x,"brass",[x,5.05,-5.46],[.055,1.0,.055]);
}
box("mezzanine.rail-top","brass",[0,5.53,-5.46],[13.0,.06,.065]);
// An elegant contemporary sculptural botanical canopy, not gameplay.
const [cx,cy,cz]=a.centerpiece;
cyl("botanical.trunk","timber",[cx,1.47,cz],[.42,2.8,.42]);
cyl("botanical.collared-base","brass",[cx,.20,cz],[.95,.28,.95]);
for(let tier=0;tier<4;tier++){
 const y=2.1+tier*.46,r=1.5-tier*.19;
 for(let k=0;k<9;k++){
  const ang=k*Math.PI*2/9+tier*.31;
  const rad=r*(.74+(.18*(k%3)));
  sph("botanical.leaf."+tier+"."+k,k%4===0?"leafLight":"leaf",
    [cx+Math.cos(ang)*rad,y+Math.sin(ang*2)*.16,cz+Math.sin(ang)*rad],
    [.72,.4,.46]);
 }
}
for(let k=0;k<10;k++){
 const t=k*Math.PI*2/10;
 sph("botanical.lantern-seed."+k,"mintGlow",[cx+Math.cos(t)*1.18,2.5+(k%3)*.35,cz+Math.sin(t)*1.18],[.11,.11,.11]);
}
for(const [k,p] of a.planterPositions.entries()){
 box("planter.box."+k,"darkstone",[p[0],.31,p[2]],[1.35,.62,1.14]);
 box("planter.brass-lip."+k,"brass",[p[0],.65,p[2]],[1.48,.065,1.27]);
 for(let i=0;i<5;i++){
  const ang=i*2.399+k*.71;
  const ox=Math.cos(ang)*.38,oz=Math.sin(ang)*.32;
  cyl("plant.stem."+k+"."+i,"sage",[p[0]+ox,.9,p[2]+oz],[.07,.52,.07]);
  sph("plant.leaf."+k+"."+i,i%2?"leaf":"leafLight",[p[0]+ox*1.3,1.16+(i%3)*.16,p[2]+oz*1.3],[.37,.53,.23]);
 }
}
for(const [i,[x,y,z]] of a.hangingLanterns.entries()){
 cyl("lantern.cable."+i,"brass",[x,5.0,z],[.055,1.15,.055]);
 ring("lantern.gold-ring."+i,"goldGlow",[x,4.30,z],[.51,.51,.7],[-Math.PI/2,0,0]);
 sph("lantern.bulb."+i,"mintGlow",[x,4.30,z],[.25,.25,.25]);
}
for(const [k,x] of a.aisleInlaysX.entries()){
 box("route.inlay."+k,"goldGlow",[x,.072,-3.6],[.055,.012,9.9]);
}
assert(program.length<=ART.performance.maxUniqueMeshes,"scene geometry budget");
const nodes=[{name:SCENE.sceneId,children:[],extras:{sceneId:SCENE.sceneId,unitScale:1,upAxis:"Y",gameAuthority:false}}];
const meshItems=new Map(),meshes=[],materials=[],matLookup=new Map(),bufferParts=[],bufferViews=[],accessors=[];
let bytes=0;const pad=n=>(n+3)&~3;
function writeView(buffer,target){
 const view={buffer:0,byteOffset:bytes,byteLength:buffer.length};
 if(target)view.target=target;
 bufferViews.push(view);bufferParts.push({offset:bytes,buffer});bytes=pad(bytes+buffer.length);return bufferViews.length-1;
}
function accessor(data,type,componentType,target){
 const v=writeView(Buffer.from(data.buffer,data.byteOffset,data.byteLength),target);
 const count=data.length/(type==="VEC3"?3:type==="VEC2"?2:1);
 const acc={bufferView:v,componentType,count,type};
 if(type==="VEC3"&&componentType===5126){
  const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
  for(let i=0;i<data.length;i+=3)for(let k=0;k<3;k++){min[k]=Math.min(min[k],data[i+k]);max[k]=Math.max(max[k],data[i+k]);}
  acc.min=min;acc.max=max;
 }
 accessors.push(acc);return accessors.length-1;
}
const allTextures=[];
const pngImages=[],textures=[],samplers=[{magFilter:9729,minFilter:9987,wrapS:10497,wrapT:10497}];
for(const [kind,details] of Object.entries(ART.textures)){
 const raw=makeTexture(details.kind,details.size);
 const imageIndex=pngImages.length;
 pngImages.push({name:"Trialum original "+kind,bufferView:writeView(raw),mimeType:"image/png"});
 textures.push({source:imageIndex,sampler:0});allTextures.push(kind);
}
for(const [name,m] of Object.entries(ART.palette)){
 const material={name,
   pbrMetallicRoughness:{baseColorFactor:[...m.color,m.alpha||1],metallicFactor:m.metallic||0,roughnessFactor:m.roughness||.7},
   doubleSided:!!m.doubleSided};
 if(m.texture)material.pbrMetallicRoughness.baseColorTexture={index:allTextures.indexOf(m.texture)};
 if(m.alpha)material.alphaMode="BLEND";
 if(m.emissive){material.emissiveFactor=m.emissive;
  if(m.emissiveStrength&&m.emissiveStrength!==1)material.extensions={KHR_materials_emissive_strength:{emissiveStrength:m.emissiveStrength}};
 }
 matLookup.set(name,materials.length);materials.push(material);
}
function geometry(kind){
 if(kind==="box")return new THREE.BoxGeometry(1,1,1);
 if(kind==="cylinder")return new THREE.CylinderGeometry(.5,.5,1,18);
 if(kind==="sphere")return new THREE.SphereGeometry(.5,16,12);
 if(kind==="cone")return new THREE.ConeGeometry(.5,1,18);
 if(kind==="torus")return new THREE.TorusGeometry(1,.046,8,56);
 throw Error("Unknown model primitive "+kind);
}
for(const item of program){
 assert(matLookup.has(item.mat),"missing material "+item.mat);
 assert(item.p.every(Number.isFinite)&&item.s.every(n=>Number.isFinite(n)&&n>0),"bad transform "+item.id);
 const key=item.kind+":"+item.mat;
 if(!meshItems.has(key)){
  const g0=geometry(item.kind),g=g0.getIndex()?g0.toNonIndexed():g0;
  const pos=g.getAttribute("position"),norm=g.getAttribute("normal"),uv=g.getAttribute("uv");
  const positions=new Float32Array(pos.array),normals=new Float32Array(norm.array),uvs=new Float32Array(uv.array);
  const indices=new Uint16Array(positions.length/3);for(let i=0;i<indices.length;i++)indices[i]=i;
  const pAcc=accessor(positions,"VEC3",5126,34962),nAcc=accessor(normals,"VEC3",5126,34962),uAcc=accessor(uvs,"VEC2",5126,34962),iAcc=accessor(indices,"SCALAR",5123,34963);
  meshItems.set(key,meshes.length);meshes.push({name:key,primitives:[{attributes:{POSITION:pAcc,NORMAL:nAcc,TEXCOORD_0:uAcc},indices:iAcc,material:matLookup.get(item.mat),mode:4}]});
  g0.dispose();if(g!==g0)g.dispose();
 }
 const euler=new THREE.Euler(...item.rot,"XYZ");
 const quaternion=new THREE.Quaternion().setFromEuler(euler);
 const node={name:item.id,mesh:meshItems.get(key),translation:item.p,scale:item.s,rotation:quaternion.toArray(),
  extras:{semanticPart:item.id,authoredGeometry:true,gameAuthority:false}};
 nodes[0].children.push(nodes.length);nodes.push(node);
}
for(const p of SCENE.portals){
 nodes[0].children.push(nodes.length);
 nodes.push({name:p.id,translation:p.at,extras:{semanticAnchor:p.id,kind:"portal",hasNoGameAuthority:true,
    status:"planned",sceneId:SCENE.sceneId,futureSceneId:p.futureSceneId}});
}
const json={
 asset:{version:"2.0",generator:"Trialum original Agro Lobby build-only PBR authoring pipeline S1"},
 extensionsUsed:["KHR_materials_emissive_strength"],
 scenes:[{name:SCENE.sceneId,nodes:[0]}],scene:0,nodes,meshes,materials,
 textures,samplers,images:pngImages,
 buffers:[{byteLength:bytes}],bufferViews,accessors
};
const raw=Buffer.alloc(bytes);for(const b of bufferParts)b.buffer.copy(raw,b.offset);
const jsonBytes=Buffer.from(JSON.stringify(json));
const jsonChunk=Buffer.alloc(align(jsonBytes.length),0x20);jsonBytes.copy(jsonChunk);
const glb=Buffer.alloc(12+8+jsonChunk.length+8+raw.length);
glb.writeUInt32LE(0x46546c67,0);glb.writeUInt32LE(2,4);glb.writeUInt32LE(glb.length,8);
glb.writeUInt32LE(jsonChunk.length,12);glb.writeUInt32LE(0x4e4f534a,16);jsonChunk.copy(glb,20);
const binStart=20+jsonChunk.length;
glb.writeUInt32LE(raw.length,binStart);glb.writeUInt32LE(0x004e4942,binStart+4);raw.copy(glb,binStart+8);
assert(glb.length<ART.performance.maxGlbBytes,"over bundled GLB byte limit");
const output=path.join(DIR,"atrium.glb");fs.writeFileSync(output,glb);
const evidence={sceneId:SCENE.sceneId,assetId:SCENE.modelAssetId,source:"Trialum original visual-recipe.json + THREE geometry",
 sourceOnlyAtBuildTime:true,buildGeneratedBinary:true,gltfVersion:"2.0",glbBytes:glb.length,
 sha256:crypto.createHash("sha256").update(glb).digest("hex"),nodeCount:nodes.length,meshCount:meshes.length,
 textureCount:textures.length,materials:materials.length,expectedAnchors:SCENE.portals.map(x=>x.id),
 sourceSceneRevision:SCENE.revision,sceneMode:"S1 visual owner preview only; three future doors NOT playable",
 noGameAuthority:true,offline:true};
fs.writeFileSync(path.join(DIR,"asset-evidence.json"),JSON.stringify(evidence,null,2)+"\n");
console.log("Agro Lobby original build-only GLB ready",JSON.stringify(evidence));
