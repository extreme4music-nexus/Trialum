/** Trialum S7 G-01: ACTUAL in-scene basin GLBs, animated water and
 * canonical aquarium plants. Graphics only; real state comes from the parent.
 * This module has NO game/save/credits actions. No offline demo plants by default.
 */
import * as THREE from "three";
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";
import {projectG01Aquatic} from "./g01-aquatic-projection.mjs";

const BUILT=Object.freeze([
 "g01-main-basin.glb",
 "g01-satellite-basins.glb",
 "g01-walkway-and-railings.glb",
 "g01-crossing-bridge.glb",
 "g01-visual-service-pumps.glb",
 "g01-water-surfaces-animated.glb"
]);
const STAGES=Object.freeze(["sprout","young","growing","mature","weakened","dead"]);
const NAMES=STAGES.map(stage=>"aquaglow-"+stage+".glb");
const isValid=A=>Array.isArray(A)&&A.length<=4&&A.every(p=>p&&
 typeof p.id==="string"&&p.id.length>0&&p.id.length<=100&&
 p.species==="aquaglow"&&p.bedId==="aquarium"&&p.medium==="aquatic");
function disposeMeshes(root){
 root?.traverse(o=>{
  if(!o.isMesh)return;
  o.geometry?.dispose();
  for(const mat of (Array.isArray(o.material)?o.material:[o.material])){
   if(!mat)continue;
   for(const k of ["map","normalMap","roughnessMap","metalnessMap","emissiveMap"])mat[k]?.dispose();
   mat.dispose();
  }
 });
}
export class G01WaterGarden{
 constructor(engine){
  this.engine=engine;this.disposed=false;this.glbs=new Map();
  this.objects=null;this.plants=null;this.samples=null;this.mixer=null;
  this.aquatic=[];this.demo=false;this.waveFrames=0;this.waterMeshes=0;
 }
 setAquatic(records){
  if(!isValid(records))return false;
  this.aquatic=records.map(p=>({
   id:p.id,species:"aquaglow",bedId:"aquarium",medium:"aquatic",
   growth:Number(p.growth)||0,health:Number(p.health)||0,
   hydration:Number(p.hydration)||0,dead:p.dead===true
  }));
  this.drawPlants();return true;
 }
 setDemo(enable){
  this.demo=enable===true;this.drawPlants();
  return this.demo;
 }
 clear(){
  this.mixer?.stopAllAction();this.mixer?.uncacheRoot?.(this.objects);this.mixer=null;
  if(this.objects){this.engine.scene?.remove(this.objects);this.objects=null;}
  this.plants=null;this.samples=null;
  for(const g of this.glbs.values())disposeMeshes(g.scene);
  this.glbs.clear();this.waterMeshes=0;
 }
 async reload(){
  if(this.disposed)return;
  this.clear();
  const loader=new GLTFLoader();
  // Loader uses bundled ES module URL: local file:// or same-origin appassets.
  const names=[...BUILT,...NAMES];
  const glbs=await Promise.all(names.map(async name=>{
   const g=await loader.loadAsync(new URL("./"+name,import.meta.url).href);
   if(!g?.scene||!g.scene.children.length)throw Error("G01 GLB has no scene: "+name);
   return [name,g];
  }));
  if(this.disposed){for(const [,g] of glbs)disposeMeshes(g.scene);return;}
  this.glbs=new Map(glbs);
  this.objects=new THREE.Group();this.objects.name="G01.real-water-core";
  this.plants=new THREE.Group();this.plants.name="G01.real-canonical-aquarium-plants";
  this.samples=new THREE.Group();this.samples.name="G01.visual-preview-only";
  for(const file of BUILT){
   const gltf=this.glbs.get(file);
   const copy=gltf.scene;copy.name=file;this.objects.add(copy);
  }
  this.objects.add(this.plants,this.samples);
  this.engine.scene.add(this.objects);
  const water=this.glbs.get("g01-water-surfaces-animated.glb");
  if(!water.animations?.some(c=>c.name==="G01_WATER_RIPPLES_LOOP_6S"))
   throw Error("G01 missing ACTUAL animated water glTF clip");
  const waterClip=water.animations.find(c=>c.name==="G01_WATER_RIPPLES_LOOP_6S");
  this.waterMeshes=0;
  water.scene.traverse(o=>{if(o.isMesh&&o.morphTargetInfluences?.length===2)this.waterMeshes++;});
  if(this.waterMeshes!==4)throw Error("G01 needs four morphing water meshes, got "+this.waterMeshes);
  this.mixer=new THREE.AnimationMixer(water.scene);
  this.mixer.clipAction(waterClip).setLoop(THREE.LoopRepeat,Infinity).play();
  this.drawPlants();
 }
 drawPlants(){
  if(!this.plants||!this.samples)return;
  this.plants.clear();this.samples.clear();
  for(const p of projectG01Aquatic(this.aquatic)){
   const source=this.glbs.get("aquaglow-"+p.stage+".glb");
   if(!source)continue;
   const specimen=source.scene.clone(true);
   specimen.name="G01.CANONICAL:"+p.id;
   specimen.position.fromArray(p.xyz);
   specimen.userData={plantId:p.id,stage:p.stage,slotId:p.slotId,
    realEnginePlant:true,gameplayAuthority:false};
   this.plants.add(specimen);
  }
  if(this.demo){
   // Visible stage gallery INSIDE the water, only on explicit DEMO action.
   // We use ONLY currently unoccupied canonical sockets, never duplicate a
   // real plantId. Clear DEMO instantly when toggled off; nothing is saved.
   const slots=[[-2.7,-1.04,-2],[2.7,-1.04,-2],[-2.7,-1.04,2],[2.7,-1.04,2]];
   const occupied=new Set(this.plants.children.map(p=>p.userData.slotId));
   for(let i=0;i<4;i++){
    const slotId="aquatic-slot-"+(i+1);
    if(occupied.has(slotId))continue;
    const st=STAGES[i],source=this.glbs.get("aquaglow-"+st+".glb");
    if(!source)continue;
    const sample=source.scene.clone(true);
    sample.name="G01.DEMO.AQUAGLOW."+st;
    sample.position.fromArray(slots[i]);
    sample.userData={demo:true,stage:st,noGamePlant:true,slotId};
    this.samples.add(sample);
   }
  }
 }
 tick(deltaSeconds){
  if(!this.disposed&&this.mixer&&Number.isFinite(deltaSeconds)&&deltaSeconds>0){
   this.mixer.update(Math.min(.065,deltaSeconds));
   this.waveFrames++;
  }
 }
 dispose(){if(this.disposed)return;this.disposed=true;this.clear();}
 stats(){return Object.freeze({
  inScene:Boolean(this.objects&&this.engine?.scene?.children.includes(this.objects)),
  waterMorphMeshes:this.waterMeshes,waterAnimationRunning:!!this.mixer&&this.waveFrames>2,
  realAquaticPlants:this.plants?.children.length||0,
  previewAquaglow:this.samples?.children.length||0,
  basins:4,modules:BUILT.length+NAMES.length,gameplayWrites:0
 });}
}
