/* B1: generate a REAL standards-compliant external binary .glb whitebox.
 * Source is declarative JSON; no Blender, internet, GPU or runtime app code.
 * The generated binary is assembled for offline Android/PWA distribution.
 */
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

const HERE=path.dirname(fileURLToPath(import.meta.url));
const ROOT=path.resolve(HERE,"../..");
const MANIFEST=path.join(ROOT,"prototypes/lw-d/b1/pilot-scene.json");
const OUTPUT=path.join(ROOT,"prototypes/lw-d/b1/pilot-room.glb");
const align4=n=>(n+3)&~3;
const ASSERT=(ok,msg)=>{if(!ok)throw Error("B1 GLB: "+msg);};
const faces=[
 {n:[0,0,1],v:[[-.5,-.5,.5],[.5,-.5,.5],[.5,.5,.5],[-.5,.5,.5]]},
 {n:[0,0,-1],v:[[.5,-.5,-.5],[-.5,-.5,-.5],[-.5,.5,-.5],[.5,.5,-.5]]},
 {n:[1,0,0],v:[[.5,-.5,.5],[.5,-.5,-.5],[.5,.5,-.5],[.5,.5,.5]]},
 {n:[-1,0,0],v:[[-.5,-.5,-.5],[-.5,-.5,.5],[-.5,.5,.5],[-.5,.5,-.5]]},
 {n:[0,1,0],v:[[-.5,.5,.5],[.5,.5,.5],[.5,.5,-.5],[-.5,.5,-.5]]},
 {n:[0,-1,0],v:[[-.5,-.5,-.5],[.5,-.5,-.5],[.5,-.5,.5],[-.5,-.5,.5]]}
];
export function createGlb(input){
 ASSERT(input?.schemaVersion===1,"expected scene schema v1");
 ASSERT(input.sceneId==="trialum.experimental.b1.graybox","pilot scene ID must match");
 ASSERT(input.unitsPerMeter===1&&input.upAxis==="Y","metric Y-up contract");
 ASSERT(input.roomMeters.width===6&&input.roomMeters.depth===6,"B1 is a 6x6m room");
 const required=["pilot.table.action-1","pilot.door.exit"];
 ASSERT(required.every(id=>input.expectedAnchors.includes(id))&&input.expectedAnchors.length===2,
  "exact two semantic anchors required");
 for(const id of required){
  const a=input.anchors[id];ASSERT(a&&Array.isArray(a.at)&&a.at.length===3&&a.at.every(Number.isFinite),id+" needs finite position");
 }
 const p=[],norm=[],uv=[],idx=[];
 for(const f of faces){
  const i=p.length/3;
  for(let k=0;k<4;k++){p.push(...f.v[k]);norm.push(...f.n);uv.push(...[[0,0],[1,0],[1,1],[0,1]][k]);}
  idx.push(i,i+1,i+2,i,i+2,i+3);
 }
 const buffers=[Buffer.from(new Float32Array(p).buffer),
  Buffer.from(new Float32Array(norm).buffer),
  Buffer.from(new Float32Array(uv).buffer),
  Buffer.from(new Uint16Array(idx).buffer)];
 let offset=0;const bufferViews=buffers.map((b,i)=>{const v={buffer:0,byteOffset:offset,byteLength:b.length,target:i===3?34963:34962};offset=align4(offset+b.length);return v;});
 const raw=Buffer.alloc(offset);buffers.forEach((b,i)=>b.copy(raw,bufferViews[i].byteOffset));
 const g={
  asset:{version:"2.0",generator:"Trialum B1 documented deterministic GLB whitebox generator 2026"},
  scenes:[{name:"pilot-space",nodes:[0]}],scene:0,
  nodes:[{name:"trialum.experimental.b1.graybox",children:[],extras:{sceneId:input.sceneId,unitScale:1,upAxis:"Y"}}],
  meshes:[],materials:[],
  buffers:[{byteLength:raw.length}],bufferViews,
  accessors:[
   {bufferView:0,componentType:5126,count:24,type:"VEC3",min:[-.5,-.5,-.5],max:[.5,.5,.5]},
   {bufferView:1,componentType:5126,count:24,type:"VEC3"},
   {bufferView:2,componentType:5126,count:24,type:"VEC2"},
   {bufferView:3,componentType:5123,count:36,type:"SCALAR"}
  ]
 };
 const material=[
  ["Slate floor",[.28,.38,.43,1],.92,.02],
  ["Concrete walls",[.55,.65,.70,1],.95,.0],
  ["Pilot door",[.19,.64,.63,1],.42,.25],
  ["Workbench",[.43,.31,.22,1],.7,.03]
 ];
 for(let k=0;k<material.length;k++){
  const [name,base,roughness,metallic]=material[k];
  g.materials.push({name,pbrMetallicRoughness:{baseColorFactor:base,metallicFactor:metallic,roughnessFactor:roughness},doubleSided:false});
  g.meshes.push({name:name+" base box",primitives:[{attributes:{POSITION:0,NORMAL:1,TEXCOORD_0:2},indices:3,material:k,mode:4}]});
 }
 function cube(name,material,position,scale){
  ASSERT(position.length===3&&scale.every(n=>Number.isFinite(n)&&n>0),"invalid cube dimensions: "+name);
  const index=g.nodes.length;
  g.nodes.push({name,mesh:material,translation:position,scale,extras:{scenePart:"graybox",replaceable:true}});
  g.nodes[0].children.push(index);
 }
 cube("pilot.floor",0,[0,-.08,0],[6,.16,6]);
 cube("pilot.wall.back",1,[0,1.4,-3],[6,2.8,.14]);
 cube("pilot.wall.left",1,[-3,1.4,0],[.14,2.8,6]);
 cube("pilot.wall.right",1,[3,1.4,0],[.14,2.8,6]);
 cube("pilot.wall.front.left",1,[-1.85,1.4,3],[2.3,2.8,.14]);
 cube("pilot.wall.front.right",1,[1.85,1.4,3],[2.3,2.8,.14]);
 cube("pilot.door.lintel",1,[0,2.50,3],[1.42,.6,.14]);
 cube("pilot.door.panel",2,[0,1.10,2.945],[1.35,2.2,.07]);
 cube("pilot.workbench.top",3,[-1.2,.86,-.55],[1.5,.14,.9]);
 for(const dx of [-.58,.58])for(const dz of [-.3,.3])
  cube("pilot.workbench.leg."+dx+"."+dz,3,[-1.2+dx,.4,-.55+dz],[.12,.8,.12]);
 for(const id of required){
  const index=g.nodes.length;
  g.nodes.push({name:id,translation:input.anchors[id].at,
   extras:{semanticAnchor:id,kind:"inspect-only",stableId:true,hasNoGameAuthority:true}});
  g.nodes[0].children.push(index);
 }
 // GLB v2.0: 12-byte header + JSON chunk + BIN chunk, both four-byte aligned.
 const json=Buffer.from(JSON.stringify(g),"utf8");
 const paddedJson=Buffer.alloc(align4(json.length),0x20);json.copy(paddedJson);
 const total=12+8+paddedJson.length+8+raw.length;
 const result=Buffer.alloc(total);
 result.writeUInt32LE(0x46546c67,0);result.writeUInt32LE(2,4);result.writeUInt32LE(total,8);
 result.writeUInt32LE(paddedJson.length,12);result.writeUInt32LE(0x4e4f534a,16);
 paddedJson.copy(result,20);
 const start=20+paddedJson.length;
 result.writeUInt32LE(raw.length,start);result.writeUInt32LE(0x004e4942,start+4);
 raw.copy(result,start+8);
 return {buffer:result,scene:g};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const s=JSON.parse(fs.readFileSync(MANIFEST,"utf8"));
 const {buffer,scene}=createGlb(s);
 fs.mkdirSync(path.dirname(OUTPUT),{recursive:true});
 fs.writeFileSync(OUTPUT,buffer);
 console.log("Generated real offline GLB",OUTPUT,buffer.length,"bytes; nodes",scene.nodes.length);
}
