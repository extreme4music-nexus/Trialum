/* S4: Food Warehouse — composited modular GLB scene with real-time visual
 * choreography. Inherits the independently audited ThreeSceneEngine GPU,
 * quality/draw-buffer, pause/resume/context-loss and pointer/camera handling.
 * This module has NO imports from or writes to the canonical game engine.
 */
import * as THREE from "three";
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";
import {ThreeSceneEngine} from "../../three-core/scene-runtime.mjs";
import {createRandom,makeCarrier,stepCarrier,stepDoor,smoothDoor,conveyorTravel} from "./warehouse-motion.mjs";
import {WarehouseInteractions} from "./warehouse-interactions.mjs";

const safePath=/^[a-z][a-z0-9-]*\.glb$/;
export const FILES=Object.freeze([
 "warehouse-shell.glb","smart-storage-rack.glb","cold-locker.glb",
 "cargo-crates.glb","conveyor-sorter.glb","holo-inventory-kiosk.glb",
 "mini-transporter.glb"
]);
const mapFile=Object.freeze({
 "food.warehouse.shell.v1":"warehouse-shell.glb",
 "food.smart-rack.v1":"smart-storage-rack.glb",
 "food.cold-locker.v1":"cold-locker.glb",
 "food.crates-canisters.v1":"cargo-crates.glb",
 "food.conveyor.v1":"conveyor-sorter.glb",
 "food.inventory-kiosk.v1":"holo-inventory-kiosk.glb",
 "food.mini-transporter.v1":"mini-transporter.glb"
});
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function validateWarehouse(manifest,recipe){
 if(manifest?.sceneId!=="trialum.ground.agro.warehouse"||
  manifest.rendererAdapter!=="three-glb-v1"||manifest.unitsPerMeter!==1||
  manifest.upAxis!=="Y"||manifest.authority?.readOnly!==true||
  manifest.authority?.gameplayWrites!==false||manifest.authority?.inventoryWrites!==false||
  manifest.authority?.saveWrites!==false)throw Error("Invalid warehouse authority contract");
 if(manifest.ceiling?.glazing!==false||manifest.ceiling?.type!=="solid"||
  recipe.architecture?.solidCeiling!==true)throw Error("Warehouse cannot have a greenhouse roof");
 if(manifest.portals?.length!==3||manifest.portals[0]?.role!=="main"||
   manifest.portals[0]?.animation!=="slide-double"||
   manifest.portals[0]?.backSceneId!=="trialum.ground.agro.lobby"||
   !manifest.portals.slice(1).every(p=>p.status==="built"&&p.action==="enter"))
   throw Error("Invalid center main door / pending side door layout");
 if(manifest.objectAssets?.length!==6||Object.keys(mapFile).some(k=>
   k!=="food.warehouse.shell.v1"&&!manifest.objectAssets.some(x=>x.id===k)))
   throw Error("Warehouse is missing one or more approved asset families");
 if(!Array.isArray(recipe.assetNames)||recipe.assetNames.length!==7||
    recipe.assetNames.some((n,i)=>n!==FILES[i]||!safePath.test(n)))
   throw Error("Untrusted external or missing offline asset path");
 return true;
}
const nodes=(root,prefix)=>{
 const selected=[];root.traverse(n=>{
  // GLTFLoader is permitted to sanitize dot-separated node names.
  // The original GLB exporter pins exact semanticPart in node extras.
  const identity=n.userData?.semanticPart||n.name||"";
  if(identity.startsWith(prefix))selected.push(n);
 });return selected;
};
export class FoodWarehouseEngine extends ThreeSceneEngine{
 constructor(opts){
  super({...opts,asset:{uri:"./scenes/agro-food-warehouse/warehouse-shell.glb"}});
  this.recipe=opts.recipe;validateWarehouse(opts.manifest,opts.recipe);
  this.interaction=new WarehouseInteractions(this,{onArea:opts.onArea,onNavigate:opts.onNavigate});
  this.motionClock=null;this.conveyorTime=0;this.animationSeconds=0;
  this.doorProgress=0;this.manualDoor=false;this.fallbackMode=false;
  this.carriers=[];this.belts=[];this.motionObjects=[];this.mainLeaves=[];
  this.gate={entry:null,subrooms:[]};
  this.random=createRandom(opts.manifest.motion.seed);
 }
 async reload(){
  if(this.disposed)return;
  const serial=++this.loadSerial;this.loading=true;this.pause();
  this.disposeRoot();this.proxies=[];this.isRealGlb=false;this.fallbackMode=false;
  this.motionClock=null;this.animationSeconds=0;this.conveyorTime=0;
  this.carriers=[];this.belts=[];this.motionObjects=[];this.mainLeaves=[];
  this.frames={tick:0,samples:[],slow:0,last:0};
  this.onStatus("Loading seven original offline Food Warehouse GLB models…");
  try{
   const loader=new GLTFLoader(),source=new Map();
   for(const filename of FILES){
    if(this.disposed||serial!==this.loadSerial)return;
    const assetURL=new URL("./"+filename,import.meta.url);
    const gltf=await loader.loadAsync(assetURL.href);
    if(this.disposed||serial!==this.loadSerial)return;
    source.set(filename,gltf.scene);
   }
   const shell=source.get(FILES[0]);
   if(!nodes(shell,"shell.ceiling.solid").length)throw Error("Solid warehouse ceiling absent");
   this.mainLeaves=[
    ...nodes(shell,"door.main.left").filter(n=>(n.userData?.semanticPart||n.name)==="door.main.left"),
    ...nodes(shell,"door.main.right").filter(n=>(n.userData?.semanticPart||n.name)==="door.main.right")
   ];
   if(this.mainLeaves.length!==2)throw Error("Main sliding door GLB nodes missing");
   const found=new Map();
   shell.updateMatrixWorld(true);
   shell.traverse(n=>{
    const id=n.userData?.semanticAnchor;
    if(!id)return;
    const p=this.data.portals.find(x=>x.id===id);
    if(!p||found.has(id)||n.userData.hasNoGameAuthority!==true)
     throw Error("Invalid/duplicate warehouse door anchor "+id);
    const at=new THREE.Vector3();n.getWorldPosition(at);
    if(at.distanceTo(new THREE.Vector3(...p.at))>.025)
     throw Error("Warehouse door anchor out of alignment "+id);
    found.set(id,at);
   });
   if(found.size!==3)throw Error("Three semantic warehouse doors required");
   const group=new THREE.Group();group.name="trialum.agro.food.warehouse.real-glb";
   group.add(shell);
   let meshCount=0;
   for(const entry of this.data.objectAssets){
    const filename=mapFile[entry.id],template=source.get(filename);
    if(!template)throw Error("Missing GLB asset "+entry.id);
    const count=entry.repeat||1;
    for(let j=0;j<count;j++){
     const instance=template.clone(true);
     instance.name=entry.id+".instance."+j;
     const [x,y,z]=entry.at;
     const position=this.place(entry.id,x,y,z,j);
     instance.position.set(...position);
     instance.rotation.y=entry.rotationY||0;
     group.add(instance);
     if(entry.id==="food.mini-transporter.v1"){
      const cargo=nodes(instance,"carrier.payload");
      const c=makeCarrier(j,createRandom(this.data.motion.seed+j*71+1));
      this.carriers.push({carrier:c,instance,cargo});
      this.motionObjects.push(instance);
     }
     if(entry.id==="food.conveyor.v1"){
      this.belts.push({instance,
       stripes:nodes(instance,"conveyor.belt.stripe."),
       cargo:nodes(instance,"conveyor.cargo."),
       origins:new Map()});
     }
    }
   }
   group.traverse(n=>{if(n.isMesh)meshCount++;});
   if(meshCount<120)throw Error("Incomplete seven-model Food Warehouse scene");
   this.scene.add(group);this.root=group;
   this.interaction.attach(group,source,shell);
   this.isRealGlb=true;this.fallbackMode=false;
   this.attachHitProxies(found);
   this.onStatus("REAL Food Warehouse GLB loaded · "+meshCount+
    " meshes · 7 separate models · 3 animated mini transporters · conveyors running");
  }catch(e){
   if(this.disposed||serial!==this.loadSerial)return;
   this.disposeRoot();this.proxies=[];this.isRealGlb=false;
   this.fallbackMode=true;this.drawLightweightRoom();
   this.onStatus("FALLBACK NON-GLB WAREHOUSE ACTIVE · "+String(e?.message||e));
  }finally{
   if(!this.disposed&&serial===this.loadSerial){
    this.loading=false;this.pendingResize=true;this.resume();
   }
  }
 }
 place(id,x,y,z,j){
  if(j===0)return [x,y,z];
  switch(id){
   case "food.smart-rack.v1":return [x,y,z+4.55];
   case "food.cold-locker.v1":return [x,y,z+4.75];
   case "food.crates-canisters.v1":return [x,y,z-3.15];
   case "food.conveyor.v1":return [-x,y,z];
   case "food.mini-transporter.v1":return [0,y,0]; // motion owns actual coords
   default:return [x,y,z+2.7*j];
  }
 }
 drawLightweightRoom(){
  // TRUE non-GLB geometry. Does not masquerade as the 7 genuine GLBs.
  // Low draw-call budget; no textures or external network assets.
  const g=new THREE.Group();g.name="trialum.warehouse.non-glb-lowend";
  const mats={
   stone:new THREE.MeshLambertMaterial({color:0xb3d3c7}),
   wall:new THREE.MeshLambertMaterial({color:0xa9ccc4}),
   metal:new THREE.MeshLambertMaterial({color:0x2d6468}),
   glow:new THREE.MeshBasicMaterial({color:0xa7e9c7}),
   gold:new THREE.MeshLambertMaterial({color:0xe8c681}),
   crate:new THREE.MeshLambertMaterial({color:0x47766d})
  };
  const put=(name,m,p,s)=>{
   const v=new THREE.Mesh(new THREE.BoxGeometry(...s),mats[m]);
   v.name=name;v.position.set(...p);g.add(v);return v;
  };
  put("floor","stone",[0,-.1,0],[18,.2,22]);
  put("solid-roof","wall",[0,6.4,0],[18,.3,22]);
  for(const x of [-9,9])put("wall."+x,"wall",[x,3.15,0],[.35,6.3,22]);
  put("rear-wall","wall",[0,5,-10.9],[18,2.5,.3]);
  for(const x of [-5.8,5.8]){
   put("subroom."+x,"metal",[x,1.5,-10.7],[2.1,3,.2]);
   put("subroom.trim."+x,"gold",[x,3.15,-10.6],[2.3,.1,.22]);
  }
  const left=put("door.main.left","metal",[-.9,1.85,-10.68],[1.75,3.65,.15]);
  const right=put("door.main.right","metal",[.9,1.85,-10.68],[1.75,3.65,.15]);
  this.mainLeaves=[left,right];
  for(const x of [-7.1,7.1])for(const z of [-5.8,1.1,5.7]){
   put("rack."+x+"."+z,"metal",[x,1.35,z],[1.3,2.7,2.05]);
   put("rack.lamp."+x+"."+z,"glow",[x,2.8,z],[1.3,.08,1.9]);
  }
  for(const x of [-4.4,4.4]){
   const obj=put("conveyor."+x,"metal",[x,.65,2.1],[2.9,1.0,1.15]);
   const cargo=put("fallback.moving.cargo."+x,"crate",[x,1.26,2.1],[.44,.4,.4]);
   this.belts.push({instance:obj,stripes:[],cargo:[cargo],origins:new Map()});
  }
  for(const id of [0]){
   const obj=put("fallback.carrier","gold",[0,.33,5],[1.02,.55,.65]);
   const cargo=put("fallback.carrier.cargo","crate",[0,.75,5],[.53,.38,.43]);
   const carrier=makeCarrier(id,createRandom(this.data.motion.seed));
   this.carriers.push({carrier,instance:obj,cargo:[cargo]});
  }
  this.scene.add(g);this.root=g;
  this.interaction.attach(g,new Map(),g);
  const anchors=new Map(this.data.portals.map(p=>[p.id,new THREE.Vector3(...p.at)]));
  this.attachHitProxies(anchors);
 }
 frame(now){
  if(this.ready()){
   const raw=this.motionClock===null?0:Math.max(0,(now-this.motionClock)/1000);
   const delta=Math.min(.05,raw);
   this.motionClock=now;
   this.updateMotion(delta,Math.min(.2,raw));
  }else this.motionClock=null;
  super.frame(now);
 }
 updateMotion(delta,visualTime=delta){
  if(!Number.isFinite(delta)||delta<=0)return;
  this.animationSeconds+=delta;this.conveyorTime+=delta;
  const p=this.data.portals[0];
  const proximity=this.camera?.position.distanceTo(new THREE.Vector3(...p.at))<3.4;
  const wantOpen=this.manualDoor||proximity;
  this.doorProgress=stepDoor(this.doorProgress,wantOpen,visualTime);
  const slide=smoothDoor(this.doorProgress)*1.61;
  for(const leaf of this.mainLeaves){
   const base=leaf.userData.baseX??(leaf.userData.baseX=leaf.position.x);
   leaf.position.x=base+((leaf.userData?.semanticPart||leaf.name)==="door.main.left"?-slide:slide);
  }
  for(const item of this.carriers){
   const c=stepCarrier(item.carrier,delta);
   item.instance.position.x=c.x;item.instance.position.z=c.z;
   item.instance.rotation.y=c.yaw;
   // The cargo is a visual simulation, NOT a decrement of food resources.
   for(const piece of item.cargo){
    const isPayload=piece.name.includes("payload")||piece.name.includes("carrier.cargo");
    if(isPayload)piece.visible=c.carry;
   }
   item.instance.position.y=Math.sin(this.animationSeconds*2.2+c.id)*.012;
  }
  for(const [i,belt] of this.belts.entries()){
   for(const stripe of belt.stripes){
    if(!belt.origins.has(stripe))belt.origins.set(stripe,stripe.position.x);
    const x=belt.origins.get(stripe),progress=this.conveyorTime*.25;
    stripe.position.x=((x+1.5+progress)%3)-1.5;
   }
   for(const cargo of belt.cargo){
    if(!belt.origins.has(cargo))belt.origins.set(cargo,cargo.position.x);
    const origin=belt.origins.get(cargo);
    if(belt.stripes.length) cargo.position.x=conveyorTravel(this.conveyorTime+i*.97)+origin-.42;
    else cargo.position.x=belt.instance.position.x+
      conveyorTravel(this.conveyorTime+i*.97);
   }
  }
  this.interaction.step(visualTime);
 }
 setInventory(food){this.interaction.setInventory(food);}
 enterArea(name){return this.interaction.changeArea(name);}
 select(id){
  const p=this.data.portals.find(x=>x.id===id);
  if(!p)return;
  if(p.role==="main"){
   this.interaction.exitToAtrium();
   this.onSelect({...p,canEnter:true,isOpen:true});return;
  }
  if(p.status==="built"&&p.action==="enter"){
   this.interaction.changeArea(p.targetArea);
   this.onSelect({...p,canEnter:true});return;
  }
  this.onSelect({...p,canEnter:false});
 }
 pick(x,y){
  if((!this.isRealGlb&&!this.fallbackMode)||!this.proxies.length)return;
  const bounds=this.canvas.getBoundingClientRect();
  if(bounds.width<1||bounds.height<1)return;
  const mouse=new THREE.Vector2((x-bounds.left)/bounds.width*2-1,
   -((y-bounds.top)/bounds.height*2-1));
  const ray=new THREE.Raycaster();ray.setFromCamera(mouse,this.camera);
  const hits=ray.intersectObjects(this.proxies,false);
  if(hits.length)this.select(hits[0].object.userData.portalId);
 }
 getVisualDiagnostics(){
  return {mode:this.isRealGlb?"real-glb":"non-glb",
   doorOpenFraction:this.doorProgress,transporterCount:this.carriers.length,
   transporterPositions:this.carriers.map(x=>({
    x:x.carrier.x,z:x.carrier.z,carry:x.carrier.carry,phase:x.carrier.phase,
    visits:x.carrier.visits})),conveyorSeconds:this.conveyorTime,
   gameWrites:false,...this.interaction.getDiagnostics()};
 }
 dispose(){
  this.carriers=[];this.belts=[];this.motionObjects=[];this.mainLeaves=[];
  this.motionClock=null;this.interaction.dispose();super.dispose();
 }
}
