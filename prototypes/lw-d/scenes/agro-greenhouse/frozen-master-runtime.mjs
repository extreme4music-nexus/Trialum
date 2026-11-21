/** Exact MASTER scene import; design-only, no engine/save/resource authority. */
import * as THREE from "three";
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";
const SOURCE="5d68670f7c073d1842b3f89c49b0394c20ffec91";
const rootURL=new URL("../../../../",import.meta.url);
const prefix="prototypes/lw-d/scenes/agro-greenhouse/frozen-master/models/";
const vector=v=>Array.isArray(v)&&v.length===3&&v.every(Number.isFinite);
const allowed=p=>typeof p==="string"&&(/^assets\/models\/[a-z0-9_.-]+\.glb$/i.test(p)||(p.startsWith(prefix)&&/^[a-z0-9_.-]+\.glb$/i.test(p.slice(prefix.length))));
async function json(path){const r=await fetch(new URL(path,import.meta.url),{cache:"no-store"});if(!r.ok)throw Error("Missing MASTER "+path);return r.json();}
function align(obj,r){
 // Same Builder floor pivots and prop grounding, BEFORE parent transforms.
 if(r.layer==="floor"){
  const b=new THREE.Box3().setFromObject(obj);
  if(Number.isFinite(b.min.x)&&Number.isFinite(b.max.x)&&Number.isFinite(b.min.z)&&Number.isFinite(b.max.z)){const m=b.getCenter(new THREE.Vector3());obj.position.x-=m.x;obj.position.z-=m.z;}
 }
 if(r.layer==="props"||(r.layer==="decor"&&/^s7-lf[1-3]-/.test(r.assetId))){
  const b=new THREE.Box3().setFromObject(obj);if(Number.isFinite(b.min.y)&&Number.isFinite(b.max.y)&&Math.abs(b.min.y)>=1e-5)obj.position.y-=b.min.y;
 }
}
function styleWater(root){
 root.traverse(child=>{if(!child.isMesh)return;const m=child.material.clone();m.transparent=true;m.depthWrite=false;m.side=THREE.DoubleSide;m.opacity=.88;m.metalness=.06;m.roughness=.19;m.color.setRGB(.12,.68,.81);if(m.emissive){m.emissive.setRGB(.015,.085,.105);m.emissiveIntensity=1.2;}m.needsUpdate=true;child.material=m;child.renderOrder=2;});
}
function release(roots){
 const geo=new Set(),mat=new Set(),tex=new Set();
 for(const r of roots)r?.traverse(o=>{if(!o.isMesh)return;if(o.geometry)geo.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material])if(m){mat.add(m);for(const v of Object.values(m))if(v?.isTexture)tex.add(v);}});
 for(const v of tex)v.dispose();for(const v of mat)v.dispose();for(const v of geo)v.dispose();
}
export class FrozenMasterGarden{
 constructor(engine){this.engine=engine;this.serial=0;this.disposed=false;this.group=null;this.models=[];this.mixers=[];this.count=0;this.waterMeshes=0;this.frames=0;this.ready=false;}
 clear(){this.serial++;this.ready=false;for(const m of this.mixers){m.stopAllAction();m.uncacheRoot(m.getRoot());}if(this.group)this.engine.scene?.remove(this.group);release([this.group,...this.models.map(g=>g.scene)]);this.group=null;this.models=[];this.mixers=[];this.count=0;this.waterMeshes=0;this.frames=0;}
 async reload(){
  if(this.disposed)return;this.clear();const serial=this.serial;
  const [layout,manifest]=await Promise.all([json("./frozen-master/scene.json"),json("./frozen-master/catalog.json")]);
  if(serial!==this.serial||this.disposed)return;
  if(manifest.sceneBlob!==SOURCE||manifest.mode!=="FROZEN_VISUAL_QA_ONLY"||manifest.assets?.length!==85||layout.schemaVersion!==1||layout.instances?.length!==703||layout.meta?.gameplayWrites!==0||layout.meta?.capacity?.beds!==4||layout.meta?.capacity?.slotsPerBed!==5||layout.meta?.capacity?.aquaticSlots!==4)throw Error("MASTER provenance or capacity invalid");
  const ids=new Set(),assets=new Map();
  for(const a of manifest.assets){if(!a?.id||assets.has(a.id)||!(/^[0-9a-f]{40}$/.test(a.blobSha))||(a.id==="greenhouse-shell"?a.runtimePath!=="prototypes/lw-d/scenes/agro-greenhouse/greenhouse-shell.glb":!allowed(a.runtimePath)))throw Error("MASTER asset mapping invalid");assets.set(a.id,a);}
  for(const r of layout.instances){if(!r?.id||ids.has(r.id)||!assets.has(r.assetId)||!vector(r.position)||!vector(r.scale)||!Number.isFinite(r.rotationY)||typeof r.visible!=="boolean")throw Error("MASTER instance invalid");ids.add(r.id);}
  const shells=layout.instances.filter(r=>r.assetId==="greenhouse-shell");
  if(shells.length!==1||!shells[0].visible||shells[0].position.some(x=>x!==0)||shells[0].rotationY!==0||shells[0].scale.some(x=>x!==1)||!this.engine.root)throw Error("MASTER shell/portal mismatch");
  const loader=new GLTFLoader(),loaded=new Map(),pending=[...assets.values()].filter(a=>a.id!=="greenhouse-shell");
  const staging=new THREE.Group();staging.name="S7.MASTER.PASS2.FROZEN";const mixers=[];let waterMeshes=0,count=1;
  try{
   for(let i=0;i<pending.length;i+=6){
    const results=await Promise.allSettled(pending.slice(i,i+6).map(async a=>{const g=await loader.loadAsync(new URL(a.runtimePath,rootURL).href);if(!g?.scene?.children.length)throw Error("Empty GLB "+a.id);loaded.set(a.id,g);}));
    if(serial!==this.serial||this.disposed){release([...loaded.values()].map(g=>g.scene));return;}
    const failed=results.find(x=>x.status==="rejected");if(failed)throw failed.reason;
   }
   for(const r of layout.instances){
    if(r.assetId==="greenhouse-shell")continue;
    const g=loaded.get(r.assetId),obj=g.scene.clone(true),group=new THREE.Group();
    group.name=r.id;group.position.fromArray(r.position);group.rotation.y=r.rotationY;group.scale.fromArray(r.scale);group.visible=r.visible;
    group.userData={instanceId:r.id,assetId:r.assetId,designBinding:r.binding||"",previewOnly:true,gameplayAuthority:false};
    if(r.assetId==="g01-water-surfaces-animated"){styleWater(obj);obj.traverse(o=>{if(o.isMesh&&o.morphTargetInfluences?.length===2)waterMeshes++;});}
    align(obj,r);group.add(obj);staging.add(group);count++;
    const clips=g.animations||[];
    if(r.visible&&clips.length){const clip=r.assetId==="g01-water-surfaces-animated"?clips.find(c=>c.name==="G01_WATER_RIPPLES_LOOP_6S"):clips.find(c=>c.name==="idle-sway")||clips.find(c=>c.name==="idle")||clips[0];if(!clip)throw Error("Missing water clip");const mixer=new THREE.AnimationMixer(obj);mixer.clipAction(clip).reset().play();mixers.push(mixer);}
   }
   if(count!==703||waterMeshes!==4||loaded.size!==84)throw Error("Incomplete MASTER");
   if(serial!==this.serial||this.disposed){for(const m of mixers)m.stopAllAction();release([staging,...[...loaded.values()].map(g=>g.scene)]);return;}
   this.engine.scene.add(staging);this.group=staging;this.models=[...loaded.values()];this.mixers=mixers;this.count=count;this.waterMeshes=waterMeshes;this.ready=true;
  }catch(e){for(const m of mixers)m.stopAllAction();release([staging,...[...loaded.values()].map(g=>g.scene)]);throw e;}
 }
 tick(dt){if(!this.ready||!Number.isFinite(dt)||dt<=0)return;for(const m of this.mixers)m.update(Math.min(.065,dt));this.frames++;}
 dispose(){if(this.disposed)return;this.disposed=true;this.clear();}
 stats(){return {ready:this.ready,instances:this.count,modelCount:this.ready?this.models.length+1:0,waterMorphMeshes:this.waterMeshes,animationFrames:this.frames,animations:this.mixers.length,gameplayWrites:0,mode:"FROZEN_VISUAL_QA_ONLY",sourceBlob:SOURCE};}
}
