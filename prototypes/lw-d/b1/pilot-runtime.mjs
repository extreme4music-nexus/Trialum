/* Trialum B1 GLB/Three.js experimental renderer. NO simulation, writes, AI or server.
 * Only packaged assets: the browser loads one real pilot-room.glb from this APK.
 */
import * as THREE from "three";
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";
import {OrbitControls} from "three/addons/controls/OrbitControls.js";
import {resolveGLTFAnchors,collectGLTFWallBlockers} from "./anchor-resolver.mjs";

const $=id=>document.getElementById(id);
const canvas=$("stage"),status=$("status"),inspector=$("inspector"),metrics=$("metrics");
const btnQuality=$("quality"),btnFallback=$("fallback"),btnCamera=$("reset-camera");
const isHosted=new URLSearchParams(location.search).get("hosted")==="1"&&parent!==window;
let hostVisible=true,disposed=false,contextLost=false,raf=0,activated=false;
let currentMode="loading",selectedAnchor="",objectRoot=null,activeLoadSerial=0;
let roomBlockers=[],proxies=[],markers=[],frameTimes=[],lastTime=0,samples=0;
let sceneSpec=null,renderer=null,camera=null,scene=null,controls=null;
const loader=new GLTFLoader();
const SELECTION_DISTANCE_PX=12,MAX_SAMPLES=360,DEFAULT_QUALITY="balanced";
const qualityScale={eco:1,balanced:1.35,high:1.7};
const initialAmbient="#0c2131";
const log=message=>{status.textContent=message;};
const ready=()=>document.visibilityState==="visible"&&hostVisible&&!disposed&&!contextLost;
const box=(w,h,d,c)=>new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({color:c,roughness:.85,metalness:.08}));
const smallBox=(name,x,y,z,sx,sy,sz,color)=>{
 const m=box(sx,sy,sz,color);m.name=name;m.position.set(x,y,z);return m;
};
function size(){
 if(!renderer||!camera)return;
 const width=Math.max(1,canvas.clientWidth),height=Math.max(1,canvas.clientHeight);
 const quality=btnQuality?.value||DEFAULT_QUALITY;
 const ratio=Math.min(qualityScale[quality]||1,window.devicePixelRatio||1);
 const pixelCap=Math.min(ratio,1920/width);
 renderer.setPixelRatio(Math.max(.6,pixelCap));
 renderer.setSize(width,height,false);
 camera.aspect=width/height;camera.updateProjectionMatrix();
}
function frame(now){
 raf=0;
 if(!ready())return;
 const dt=lastTime?now-lastTime:0;lastTime=now;
 if(dt>0&&dt<120){
  frameTimes.push(dt);samples++;
  if(frameTimes.length>MAX_SAMPLES)frameTimes.shift();
 }
 controls?.update();
 renderer.render(scene,camera);
 if(samples%18===0&&samples>0)showMetrics();
 raf=requestAnimationFrame(frame);
}
function pause(){if(raf)cancelAnimationFrame(raf);raf=0;lastTime=0;}
function resume(){if(ready()&&!raf){lastTime=0;raf=requestAnimationFrame(frame);}}
function percentile(sorted,p){
 if(!sorted.length)return 0;
 return sorted[Math.min(sorted.length-1,Math.floor((sorted.length-1)*p))];
}
function showMetrics(){
 if(!metrics)return;
 if(!frameTimes.length){metrics.textContent="No active frame samples yet";return;}
 const sorted=[...frameTimes].sort((a,b)=>a-b);
 const avg=frameTimes.reduce((a,b)=>a+b,0)/frameTimes.length;
 const p50=percentile(sorted,.5),p95=percentile(sorted,.95),p99=percentile(sorted,.99);
 const quality=btnQuality?.value||DEFAULT_QUALITY;
 metrics.textContent="3D samples "+samples+" · avg "+avg.toFixed(1)+" ms ("+
  (1000/avg).toFixed(1)+" FPS) · p50 "+p50.toFixed(1)+
  " ms · p95 "+p95.toFixed(1)+" ms · p99 "+p99.toFixed(1)+
  " ms · DPR "+renderer?.getPixelRatio().toFixed(2)+" · "+quality+
  " · NOT a GPU power measurement";
}
function resetCamera(){
 if(!sceneSpec||!camera)return;
 const {position,target}=sceneSpec.camera;
 camera.position.fromArray(position);
 controls.target.fromArray(target);
 controls.update();
}
function clearGroup(){
 for(const obj of [...proxies,...markers]){
  obj.parent?.remove(obj);obj.geometry?.dispose();obj.material?.dispose();
 }
 proxies=[];markers=[];roomBlockers=[];
 if(!objectRoot)return;
 objectRoot.traverse(obj=>{
  if(!obj.isMesh)return;
  if(obj.geometry&&!obj.geometry.userData?.noDispose)obj.geometry.dispose();
  const materials=Array.isArray(obj.material)?obj.material:[obj.material];
  for(const mat of materials){
   if(!mat)continue;
   for(const k of ["map","normalMap","roughnessMap","metalnessMap","aoMap","emissiveMap"]){
    if(mat[k])mat[k].dispose();
   }
   mat.dispose();
  }
 });
 scene.remove(objectRoot);objectRoot=null;
}
function fallbackRoom(){
 const g=new THREE.Group();g.name="B1 safe gray fallback (visually real, NO gameplay)";
 const parts=[
  smallBox("pilot.floor",0,-.08,0,6,.16,6,0x40525a),
  smallBox("pilot.wall.back",0,1.4,-3,6,2.8,.14,0x6a858c),
  smallBox("pilot.wall.left",-3,1.4,0,.14,2.8,6,0x627883),
  smallBox("pilot.wall.right",3,1.4,0,.14,2.8,6,0x627883),
  smallBox("pilot.wall.front.left",-1.85,1.4,3,2.3,2.8,.14,0x627883),
  smallBox("pilot.wall.front.right",1.85,1.4,3,2.3,2.8,.14,0x627883),
  smallBox("pilot.door.lintel",0,2.5,3,1.42,.6,.14,0x627883),
  smallBox("pilot.door.panel",0,1.1,2.945,1.35,2.2,.07,0x309a8f),
  smallBox("pilot.workbench.top",-1.2,.86,-.55,1.5,.14,.9,0x7b553a)
 ];
 for(const dx of [-.58,.58])for(const dz of [-.3,.3]){
  parts.push(smallBox("pilot.workbench.leg",-1.2+dx,.4,-.55+dz,.12,.8,.12,0x7b553a));
 }
 parts.forEach(x=>g.add(x));return g;
}
function attachAnchors(realAnchors=null){
 for(const id of sceneSpec.expectedAnchors){
  const anchor=sceneSpec.anchors[id];
  const at=realAnchors?.get(id)?.worldPosition?.toArray()||anchor.at;
  // Anchors reference ACTUAL loaded GLB world transforms, not sanitized node names.
  // Rendered mint marker + enlarged invisible raycast proxy.
  const marker=new THREE.Mesh(new THREE.SphereGeometry(.11,12,8),
   new THREE.MeshBasicMaterial({color:0x8cffd1,transparent:true,opacity:.9}));
  marker.position.fromArray(at);marker.name="visible-marker:"+id;
  scene.add(marker);markers.push(marker);
  const size=id.includes("door")?[1.50,2.20,.38]:[1.45,.66,1.2];
  const proxy=new THREE.Mesh(new THREE.BoxGeometry(...size),
   new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));
  proxy.name="hit-proxy:"+id;proxy.position.fromArray(at);proxy.userData.anchorId=id;
  proxy.userData.semanticOnly=true;scene.add(proxy);proxies.push(proxy);
 }
}
async function loadRoom(forceFallback=false){
 if(disposed)return;
 const serial=++activeLoadSerial;
 clearGroup();
 inspector.textContent="No target selected — presentation only.";
 selectedAnchor="";
 let error="",realAnchors=null,parsedRoot=null,stage="GLB load/parse";
 if(!forceFallback){
  currentMode="loading";
  log("Loading real offline GLB through GLTFLoader…");
  try{
   const gltf=await loader.loadAsync(sceneSpec.sourceModel);
   parsedRoot=gltf.scene;
   // A fast fallback/reload or a closed iframe may finish before the loader:
   // stale asynchronous responses must never override the current scene.
   if(disposed||serial!==activeLoadSerial)return;
   stage="GLB semantic anchor validation";
   const verified=resolveGLTFAnchors(parsedRoot,sceneSpec);
   realAnchors=verified.anchors;
   if(verified.anchors.size!==sceneSpec.expectedAnchors.length)
    throw Error("GLB semantic anchor count mismatch");
   objectRoot=parsedRoot;
   parsedRoot=null;
   currentMode="glb";
  }catch(ex){
   if(disposed||serial!==activeLoadSerial)return;
   error=stage+": "+String(ex?.message||ex);
   objectRoot=fallbackRoom();
   currentMode="fallback";
  }
 }else{
  objectRoot=fallbackRoom();
  currentMode="fallback";
  error="Intentional missing-GLB fallback simulation";
 }
 if(disposed||serial!==activeLoadSerial)return;
 if(!objectRoot)return;
 scene.add(objectRoot);
 roomBlockers=collectGLTFWallBlockers(objectRoot);
 attachAnchors(realAnchors);
 log(currentMode==="glb"?
  "REAL packaged GLB loaded — GLTFLoader verified 2 semantic extras anchors":
  "FALLBACK geometry active — "+error);
 btnFallback.textContent=currentMode==="glb"?"Test missing GLB fallback":"Reload real GLB";
 resume();
}
function onTouch(event){
 if(!canvas||!scene||!camera||!proxies.length)return;
 if(event.pointerType==="touch"&&!event.isPrimary)return;
 const rect=canvas.getBoundingClientRect();
 const pos=new THREE.Vector2(2*(event.clientX-rect.left)/rect.width-1,
  -(2*(event.clientY-rect.top)/rect.height-1));
 const ray=new THREE.Raycaster();
 ray.setFromCamera(pos,camera);
 const hits=ray.intersectObjects(proxies,false);
 if(!hits.length)return;
 const hit=hits[0],blocks=ray.intersectObjects(roomBlockers,false);
 if(blocks.length&&blocks[0].distance<hit.distance-.02){
  inspector.textContent="Target is behind a wall — ignored";return;
 }
 const id=hit.object.userData.anchorId;
 if(!sceneSpec.expectedAnchors.includes(id))return;
 selectedAnchor=id;
 inspector.textContent="Selected: "+id+" · "+sceneSpec.anchors[id].label+
  " · VISUAL INSPECTION ONLY — no game resources touched";
}
let pointerStart=null;
function startTap(e){if(e.pointerType==="touch"&&!e.isPrimary)return;pointerStart={id:e.pointerId,x:e.clientX,y:e.clientY,time:performance.now()};}
function endTap(e){
 const p=pointerStart;pointerStart=null;
 if(!p||e.pointerId!==p.id)return;
 const dx=e.clientX-p.x,dy=e.clientY-p.y;
 if(Math.hypot(dx,dy)>SELECTION_DISTANCE_PX||performance.now()-p.time>460)return;
 onTouch(e);
}
function dispose(){
 if(disposed)return;
 disposed=true;pause();clearGroup();controls?.dispose();controls=null;
 renderer?.dispose();renderer?.forceContextLoss();renderer=null;
}
function initialize(){
 const gl=canvas.getContext("webgl2",{alpha:false,antialias:true,powerPreference:"low-power"});
 if(!gl){log("WebGL2 unavailable. The original Classic game is unchanged.");return;}
 renderer=new THREE.WebGLRenderer({canvas,context:gl,antialias:true,alpha:false,powerPreference:"low-power"});
 renderer.setClearColor(0x0c2131,1);
 renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;
 renderer.toneMappingExposure=1.12;
 renderer.shadowMap.enabled=false; // B1 measures actual base performance without costly shadows.
 scene=new THREE.Scene();scene.background=new THREE.Color(initialAmbient);
 camera=new THREE.PerspectiveCamera(58,1,.07,45);
 scene.add(new THREE.HemisphereLight(0xc9e7ee,0x3b4854,2.05));
 const sun=new THREE.DirectionalLight(0xffecd2,2.4);sun.position.set(1.8,4,2.4);scene.add(sun);
 controls=new OrbitControls(camera,canvas);controls.enableDamping=true;
 controls.dampingFactor=.065;
 controls.minDistance=sceneSpec.camera.minDistance||.7;
 controls.maxDistance=sceneSpec.camera.maxDistance||6;
 controls.maxPolarAngle=Math.PI*.74;
 controls.enablePan=false;
 resetCamera();size();
 canvas.addEventListener("pointerdown",startTap);
 canvas.addEventListener("pointerup",endTap);
 window.addEventListener("resize",size);
 btnQuality.addEventListener("change",()=>{size();showMetrics();});
 btnCamera.addEventListener("click",resetCamera);
 btnFallback.addEventListener("click",()=>loadRoom(currentMode==="glb"));
 document.addEventListener("visibilitychange",()=>{if(ready())resume();else pause();});
 window.addEventListener("pagehide",dispose);
 canvas.addEventListener("webglcontextlost",e=>{e.preventDefault();contextLost=true;pause();log("WebGL context lost — safely paused");});
 canvas.addEventListener("webglcontextrestored",()=>{contextLost=false;size();log("WebGL context restored — reload room if necessary");resume();});
 window.addEventListener("message",event=>{
  if(!isHosted||event.origin!==location.origin||event.source!==parent)return;
  if(event.data?.type==="trialum:b1:dispose"){dispose();return;}
  if(event.data?.type!=="trialum:b1:visibility")return;
  hostVisible=event.data.visible===true;
  if(hostVisible)resume();else pause();
 });
 activated=true;
 loadRoom();
 if(isHosted)parent.postMessage({type:"trialum:b1:ready",pilot:true},location.origin);
}
async function main(){
 try{
  const r=await fetch("./pilot-scene.json",{cache:"no-store"});
  if(!r.ok)throw Error("Scene manifest is not packaged: "+r.status);
  sceneSpec=await r.json();
  if(sceneSpec.sceneId!=="trialum.experimental.b1.graybox"||
    !Array.isArray(sceneSpec.expectedAnchors)||sceneSpec.expectedAnchors.length!==2)
   throw Error("Invalid pilot scene contract");
  if(!sceneSpec.sourceModel.startsWith("./")||sceneSpec.sourceModel.includes(".."))
   throw Error("Pilot GLB must be local");
  initialize();
 }catch(e){log("Pilot cannot start: "+String(e?.message||e));}
}
main();
