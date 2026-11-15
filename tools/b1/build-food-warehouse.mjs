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
const DIR=path.join(ROOT,"prototypes/lw-d/scenes/agro-food-warehouse");
const SCENE=JSON.parse(fs.readFileSync(path.join(DIR,"scene.json"),"utf8"));
const ART=JSON.parse(fs.readFileSync(path.join(DIR,"visual-recipe.json"),"utf8"));
const assert=(v,msg)=>{if(!v)throw Error("Food Warehouse S4 GLB: "+msg);};
const align=n=>(n+3)&~3;
assert(SCENE.sceneId==="trialum.ground.agro.warehouse" && SCENE.unitsPerMeter===1 && SCENE.upAxis==="Y","metric S4 scene");
assert(SCENE.portals.length===3 && SCENE.portals[0].role==="main" && SCENE.portals.slice(1).every(p=>p.status==="built"&&p.action==="enter"),"main animated door + 2 honest unbuilt subrooms");
assert(ART.schemaVersion===1&&ART.designId==="trialum.agro.food-warehouse.owner-approved.20261115","approved S4 visual recipe");

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


function makeAuthor(){
 const program=[];
 const put=(kind,id,mat,p,s,rot=[0,0,0])=>program.push({kind,id,mat,p,s,rot});
 const box=(id,mat,p,s,rot)=>put("box",id,mat,p,s,rot);
 const cyl=(id,mat,p,s)=>put("cylinder",id,mat,p,s);
 const sph=(id,mat,p,s)=>put("sphere",id,mat,p,s);
 const cone=(id,mat,p,s)=>put("cone",id,mat,p,s);
 const ring=(id,mat,p,s,rot)=>put("torus",id,mat,p,s,rot);
 return {program,box,cyl,sph,cone,ring};
}
const models=[];
function asset(name,fn,anchors=[]){
 const v=makeAuthor();fn(v);models.push({filename:name,program:v.program,anchors});
}
function shell({box,cyl,ring,sph}){
 const a=ART.architecture;
 // Fully internal roof: future Garden is the ONLY glazed roof in Agro.
 box("shell.foundation","foundation",[0,-.28,0],[18.5,.55,22.5]);
 box("shell.floor.terrazzo","terrazzo",[0,-.016,0],[17.8,.035,21.8]);
 box("shell.ceiling.solid","wall",[0,6.33,0],[18,.34,22]);
 box("shell.ceiling.center","cream",[0,6.08,0],[13.7,.06,17.7]);
 for(const side of [-1,1]){
  box("shell.wall.side."+side,"wall",[side*8.91,3.16,0],[.28,6.32,22]);
  box("shell.wall.rail."+side,"brass",[side*8.72,5.96,0],[.08,.06,21]);
  for(const z of a.columnsZ){
   cyl("shell.column."+side+"."+z,"cream",[side*8.15,2.91,z],[.54,5.82,.54]);
   cyl("shell.column.base."+side+"."+z,"brass",[side*8.15,.17,z],[.76,.34,.76]);
   cyl("shell.column.cap."+side+"."+z,"brass",[side*8.15,5.88,z],[.71,.22,.71]);
  }
  for(let i=0;i<5;i++){
   const z=-7.7+i*3.7;
   box("shell.wall.recess."+side+"."+i,"steel",[side*8.62,2.35,z],[.13,3.75,2.75]);
   box("shell.wall.goldtop."+side+"."+i,"goldGlow",[side*8.51,4.35,z],[.055,.07,2.85]);
  }
 }
 box("shell.rear.bulkhead","wall",[0,4.95,-10.91],[18,2.67,.35]);
 box("shell.rear.base","foundation",[0,.24,-10.91],[18,.47,.4]);
 box("shell.front.wall","wall",[0,3.3,10.92],[18,6.6,.3]);
 box("shell.front.entry.inset","steel",[0,1.8,10.72],[3.9,3.5,.11]);
 // IMPORTANT: middle is the only MAIN DOOR. Open/close via named sliding leaves.
 const doors=[{x:0,width:3.65,h:3.75,name:"main",mat:"steel"},
  {x:-5.8,width:2.2,h:3.28,name:"cold",mat:"cold"},
  {x:5.8,width:2.2,h:3.28,name:"packing",mat:"steel"}];
 for(const d of doors){
  box("door."+d.name+".frame.left","brass",[d.x-d.width/2-.11,d.h/2,-10.7],[.15,d.h+.24,.29]);
  box("door."+d.name+".frame.right","brass",[d.x+d.width/2+.11,d.h/2,-10.7],[.15,d.h+.24,.29]);
  box("door."+d.name+".frame.lintel","goldGlow",[d.x,d.h+.09,-10.7],[d.width+.38,.12,.25]);
  for(const side of [-1,1]){
   const leafName=d.name==="main"?"door.main."+(side<0?"left":"right"):
    "door.subroom."+d.name+"."+(side<0?"left":"right");
   box(leafName,d.mat,[d.x+side*d.width/4,d.h/2,-10.58],[d.width/2-.04,d.h-.12,.16]);
   box(leafName+".seam","brass",[d.x+side*d.width/4,d.h*.56,-10.485],[d.width/2-.17,.035,.018]);
  }
  if(d.name!=="main")box("door.subroom."+d.name+".status","mintGlow",[d.x,d.h+.31,-10.6],[.42,.08,.07]);
 }
 // symmetric ceiling loops & solid panels; no skylight/glass ceiling ever
 for(let k=0;k<3;k++){
  const z=-7+k*6.7;
  for(const x of [-5.8,5.8]){
   box("ceiling.loop.long."+k+"."+x,"goldGlow",[x,6.00,z],[.075,.025,4.75]);
  }
  for(const zEnd of [z-2.36,z+2.36])
   box("ceiling.loop.cross."+k+"."+zEnd,"goldGlow",[0,6.0,zEnd],[11.7,.025,.065]);
  for(const x of [-7.5,-4.6,-1.5,1.5,4.6,7.5]){
   sph("ceiling.puck."+k+"."+x,"goldGlow",[x,6.05,z],[.095,.035,.095]);
  }
 }
 // floor guidance lanes and loading bays leave a >4m clear middle route
 for(const x of [-6.65,-3.15,3.15,6.65]){
  box("floor.guidance."+x,"goldGlow",[x,.043,0],[.044,.009,20]);
 }
 for(let i=0;i<10;i++){
  const z=-9.4+i*2.1;
  box("floor.join."+i,"brass",[0,.034,z],[17,.006,.021]);
 }
 for(const [i,x] of [-5.8,0,5.8].entries()){
  ring("floor.waypoint."+i,"goldGlow",[x,.063,4.5],[.72,.72,.7],[-Math.PI/2,0,0]);
 }
 ring("floor.center.turn","brass",[0,.066,1.4],[2.7,2.7,.7],[-Math.PI/2,0,0]);
 ring("floor.center.turn.detail","goldGlow",[0,.071,1.4],[2.25,2.25,.6],[-Math.PI/2,0,0]);
 // recess structural trims and scalable ceiling service channels
 for(const z of [-8,-4,0,4,8]){
  box("roof.service."+z,"brass",[0,6.05,z],[17.4,.04,.095]);
 }
 box("dock.warehouse.beacon","mintGlow",[0,4.67,-10.56],[1.3,.1,.07]);
}
function rack({box,sph}){
 box("rack.backbone","steel",[0,1.40,-.31],[2.45,2.8,.2]);
 for(const x of [-1.15,1.15]){
  box("rack.post."+x,"cream",[x,1.47,0],[.14,2.93,.77]);
  box("rack.post.glow."+x,"goldGlow",[x,1.47,.39],[.027,2.8,.02]);
 }
 for(let i=0;i<4;i++){
  const y=.24+i*.76;
  box("rack.shelf."+i,"brass",[0,y,0],[2.5,.095,.82]);
  for(let c=0;c<4;c++){
   const x=-.8+c*.53;
   box("rack.container."+i+"."+c,"crate",[x,y+.23,.04],[.37,.35,.43]);
   box("rack.container.lid."+i+"."+c,"cream",[x,y+.43,.04],[.4,.055,.46]);
   sph("rack.container.light."+i+"."+c,"mintGlow",[x,y+.29,.275],[.045,.05,.035]);
  }
 }
 box("rack.header","steel",[0,3.09,0],[2.66,.28,.93]);
 box("rack.status","goldGlow",[0,3.19,.47],[.82,.055,.025]);
}
function cold({box,cyl}){
 box("cold.module","steel",[0,1.65,0],[2.2,3.25,.92]);
 box("cold.upper.rim","brass",[0,3.25,.12],[2.34,.12,1.02]);
 for(const col of [-1,0,1]){
  for(const row of [0,1,2]){
   const y=.66+row*.89,x=col*.64;
   box("cold.cell."+row+"."+col,"cold",[x,y,.47],[.53,.69,.11]);
   box("cold.window."+row+"."+col,"glass",[x,y,.56],[.44,.51,.04]);
   box("cold.cell.beacon."+row+"."+col,"mintGlow",[x,y-.26,.595],[.28,.038,.02]);
  }
 }
 for(const x of [-.96,.96])
  box("cold.side.light."+x,"goldGlow",[x,1.74,.59],[.035,2.86,.027]);
 box("cold.base","foundation",[0,.22,0],[2.36,.38,1.1]);
}
function crates({box,cyl,sph}){
 const shapes=[[-.62,0,-.32],[.67,0,-.18],[-.56,0,.56],[.52,0,.58]];
 for(const [i,p] of shapes.entries()){
  if(i%2===0){
   box("cargo.crate."+i,"crate",[p[0],.42,p[2]],[.83,.8,.66]);
   box("cargo.crate.lid."+i,"cream",[p[0],.84,p[2]],[.89,.08,.7]);
  }else{
   cyl("cargo.canister."+i,"steel",[p[0],.46,p[2]],[.52,.8,.52]);
   cyl("cargo.canister.top."+i,"brass",[p[0],.9,p[2]],[.57,.09,.57]);
  }
  sph("cargo.beacon."+i,"mintGlow",[p[0],.63,p[2]+.35],[.055,.055,.035]);
 }
}
function conveyor({box,cyl,sph}){
 box("conveyor.base","cream",[0,.65,0],[3.3,.55,1.18]);
 box("conveyor.belt","conveyor",[0,.98,0],[3.1,.10,.98]);
 for(let i=0;i<8;i++)box("conveyor.belt.stripe."+i,"brass",[-1.35+i*.38,1.045,0],[.036,.014,.96]);
 for(const side of [-1,1]){
  box("conveyor.guard."+side,"steel",[0,1.17,side*.56],[3.3,.25,.1]);
  box("conveyor.light."+side,"goldGlow",[0,1.30,side*.57],[3.0,.028,.025]);
 }
 for(const x of [-1.32,1.32])for(const z of [-.47,.47])
  cyl("conveyor.pillar."+x+"."+z,"steel",[x,.30,z],[.13,.6,.13]);
 box("conveyor.scanner.left","cream",[-.2,1.70,-.54],[.1,1.1,.16]);
 box("conveyor.scanner.right","cream",[-.2,1.70,.54],[.1,1.1,.16]);
 box("conveyor.scanner.top","goldGlow",[-.2,2.25,0],[.14,.12,1.24]);
 box("conveyor.cargo.mover","crate",[.42,1.20,0],[.48,.37,.44]);
 box("conveyor.cargo.glow","mintGlow",[.42,1.4,0],[.28,.038,.26]);
}
function kiosk({box,cyl,sph}){
 box("kiosk.foot","foundation",[0,.14,0],[.92,.28,1.06]);
 cyl("kiosk.stem","cream",[0,.85,0],[.4,1.5,.42]);
 box("kiosk.display","screen",[0,1.78,.07],[1.42,.86,.12],[-.16,0,0]);
 box("kiosk.display.glow","cyan",[0,1.78,.145],[1.2,.64,.018],[-.16,0,0]);
 box("kiosk.display.frame","brass",[0,2.22,.13],[1.46,.07,.14]);
 box("kiosk.console","steel",[0,1.14,.37],[.86,.18,.72],[-.28,0,0]);
 sph("kiosk.scanner","mintGlow",[0,1.28,.69],[.13,.06,.11]);
}
function transporter({box,cyl,sph}){
 // Small: <=1.12m long, approx knee height on S4 scale.
 box("carrier.chassis","cream",[0,.28,0],[.96,.38,.66]);
 box("carrier.deck","steel",[0,.54,0],[1.04,.13,.71]);
 for(const x of [-.38,.38])for(const z of [-.3,.3]){
  cyl("carrier.wheel."+x+"."+z,"rubber",[x,.14,z],[.23,.15,.23]);
  cyl("carrier.wheel.trim."+x+"."+z,"brass",[x,.13,z],[.17,.16,.17]);
 }
 box("carrier.bumper.front","steel",[0,.30,-.39],[.8,.19,.13]);
 box("carrier.bumper.rear","steel",[0,.3,.39],[.8,.19,.13]);
 box("carrier.eye","mintGlow",[0,.39,-.46],[.41,.11,.06]);
 cyl("carrier.mast","steel",[0,.81,.17],[.10,.55,.10]);
 sph("carrier.sensor","mintGlow",[0,1.1,.17],[.12,.12,.12]);
 box("carrier.payload","crate",[0,.80,-.08],[.59,.38,.48]);
 box("carrier.payload.lid","brass",[0,1.01,-.08],[.60,.046,.5]);
}
asset("warehouse-shell.glb",shell,SCENE.portals);
asset("smart-storage-rack.glb",rack);
asset("cold-locker.glb",cold);
asset("cargo-crates.glb",crates);
asset("conveyor-sorter.glb",conveyor);
asset("holo-inventory-kiosk.glb",kiosk);
asset("mini-transporter.glb",transporter);

function encodeModel({modelId,filename,program,anchors}){
const nodes=[{name:modelId,children:[],extras:{sceneId:SCENE.sceneId,assetId:modelId,unitScale:1,upAxis:"Y",gameAuthority:false}}];
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
 const euler=new THREE.Euler(...(item.rot||[0,0,0]),"XYZ");
 const quaternion=new THREE.Quaternion().setFromEuler(euler);
 const node={name:item.id,mesh:meshItems.get(key),translation:item.p,scale:item.s,rotation:quaternion.toArray(),
  extras:{semanticPart:item.id,authoredGeometry:true,gameAuthority:false}};
 nodes[0].children.push(nodes.length);nodes.push(node);
}
for(const p of anchors){
 nodes[0].children.push(nodes.length);
 nodes.push({name:p.id,translation:p.at,extras:{semanticAnchor:p.id,kind:"portal",hasNoGameAuthority:true,
    status:p.status,sceneId:SCENE.sceneId,futureSceneId:p.backSceneId||null}});
}
const json={
 asset:{version:"2.0",generator:"Trialum original indoor Food Warehouse modular PBR authoring pipeline S4"},
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

assert(glb.length<ART.performance.maxGlbBytes,"GLB exceeds budget: "+filename);
return glb;
}

const manifest=[];
for(const {filename,program,anchors} of models){
 const modelId="trialum.food."+filename.replace(".glb","");
 const output=path.join(DIR,filename);
 const glb=encodeModel({modelId,filename,program,anchors});
 fs.writeFileSync(output,glb);
 manifest.push({file:filename,sizeBytes:glb.length,sha256:crypto.createHash("sha256").update(glb).digest("hex"),
  objectNodes:program.length,anchors:anchors.map(p=>p.id),unitScale:1,upAxis:"Y",glb:true});
}
const evidence={sceneId:SCENE.sceneId,source:"visual-recipe.json + original Trialum procedural authored PBR meshes",
 visualsReferenceIs2DOnly:true,convertRenderImageToGLB:false,assetCount:manifest.length,assets:manifest,
 floorSolidRoof:ART.architecture.solidCeiling===true,fallback:"non-GLB primitives (explicit manifest)",
 gameAuthority:false,ownerConceptPreviewOnly:true};
fs.writeFileSync(path.join(DIR,"asset-evidence.json"),JSON.stringify(evidence,null,2)+"\n");
console.log("PASS S4: Food Warehouse seven REAL offline PBR glTF2 GLB assets",JSON.stringify(evidence));
