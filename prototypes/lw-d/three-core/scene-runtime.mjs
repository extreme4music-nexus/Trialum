/** Reusable Trialum GLB scene engine v1. Import this from ANY future scene.
 * Intentionally NO lobby geometry, no store, no game or engine mutations.
 * Room/layout/portals/appearance live solely in manifests and offline GLB.
 */
import * as THREE from "three";
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";
import {OrbitControls} from "three/addons/controls/OrbitControls.js";
import {planDrawingBuffer} from "../b1/gpu-health.mjs";
import {selectPlannedPortal} from "./scene-registry.mjs";

const memory=()=>({tick:0,samples:[],slow:0,last:0});
export class ThreeSceneEngine{
 constructor({canvas,manifest,asset,onStatus=()=>{},onMetrics=()=>{},onSelect=()=>{}}){
  if(!canvas||!manifest||!asset)throw Error("Incomplete scene engine configuration");
  this.canvas=canvas;this.data=manifest;this.asset=asset;
  this.onStatus=onStatus;this.onMetrics=onMetrics;this.onSelect=onSelect;
  this.disposed=false;this.hidden=false;this.hostVisible=true;this.contextLost=false;
  this.loading=false;this.raf=0;this.pendingResize=true;this.size=null;
  this.quality=manifest.quality?.default||"balanced";
  this.frames=memory();this.loadSerial=0;this.proxies=[];this.root=null;
  this.isRealGlb=false;this.currentSelected=null;this.listeners=[];
  this.onLost=e=>{e.preventDefault();this.contextLost=true;this.pause();
    this.onStatus("WebGL context lost — graphics paused; not a PASS");};
  this.onRestored=()=>{if(this.disposed)return;this.contextLost=false;
    this.size=null;this.pendingResize=true;this.renderer?.resetState();
    this.reload().catch(e=>this.onStatus("GPU restore reload failed: "+e.message));};
 }
 listen(target,type,fn,opts){
  target.addEventListener(type,fn,opts);
  this.listeners.push([target,type,fn,opts]);
 }
 async mount(){
  const canvas=this.canvas;
  const gl=canvas.getContext("webgl2",{alpha:false,antialias:true,powerPreference:"low-power"});
  if(!gl)throw Error("WebGL2 unavailable; original Classic world is safe");
  try{this.maxSide=Math.min(gl.getParameter(gl.MAX_RENDERBUFFER_SIZE)||1920,
    gl.getParameter(gl.MAX_TEXTURE_SIZE)||1920);}catch(_){this.maxSide=1920;}
  this.renderer=new THREE.WebGLRenderer({canvas,context:gl,antialias:true,alpha:false,powerPreference:"low-power"});
  this.renderer.setClearColor(this.data.lighting.background,1);
  this.renderer.outputColorSpace=THREE.SRGBColorSpace;
  this.renderer.toneMapping=THREE.ACESFilmicToneMapping;
  this.renderer.toneMappingExposure=1.05;
  this.renderer.shadowMap.enabled=false; // scene uses emissive/PBR, no heavy blanket shadow map
  this.scene=new THREE.Scene();
  this.scene.background=new THREE.Color(this.data.lighting.background);
  this.scene.fog=new THREE.Fog(this.data.lighting.background,this.data.lighting.fogNear,this.data.lighting.fogFar);
  const light=this.data.lighting;
  this.scene.add(new THREE.HemisphereLight(light.ambient,0x476b65,light.hemisphereIntensity));
  const sun=new THREE.DirectionalLight(light.sun,light.sunIntensity);
  sun.position.fromArray(light.sunPosition);this.scene.add(sun);
  for(const [i,color] of light.accentColors.entries()){
   const p=new THREE.PointLight(color,.35,6,2);
   p.position.set((i-1)*4.15,3.4,-7.7);this.scene.add(p);
  }
  this.camera=new THREE.PerspectiveCamera(this.data.camera.fov,1,.15,Math.max(75,this.data.worldMeters.depth*1.8));
  this.controls=new OrbitControls(this.camera,canvas);
  this.controls.enablePan=false;this.controls.enableDamping=true;this.controls.dampingFactor=.065;
  this.controls.minDistance=this.data.camera.minDistance;
  this.controls.maxDistance=this.data.camera.maxDistance;
  this.controls.minPolarAngle=this.data.camera.minPolarAngle;
  this.controls.maxPolarAngle=this.data.camera.maxPolarAngle;
  this.resetCamera();
  this.listen(canvas,"webglcontextlost",this.onLost);
  this.listen(canvas,"webglcontextrestored",this.onRestored);
  this.listen(canvas,"pointerdown",e=>{this.wake();
   if(e.pointerType==="touch"&&!e.isPrimary)return;
   this.pointer={id:e.pointerId,x:e.clientX,y:e.clientY,time:performance.now()};});
  this.listen(canvas,"pointerup",e=>{
   const p=this.pointer;this.pointer=null;
   if(!p||p.id!==e.pointerId||performance.now()-p.time>550)return;
   if(Math.hypot(e.clientX-p.x,e.clientY-p.y)>13)return;
   this.pick(e.clientX,e.clientY);
  });
  this.listen(document,"visibilitychange",()=>this.setDocumentVisible(!document.hidden));
  this.listen(window,"resize",()=>{this.pendingResize=true;this.resume();});
  this.sizeCanvas();
  await this.reload();
 }
 resetCamera(){
  if(!this.camera||!this.controls)return;
  this.camera.position.fromArray(this.data.camera.position);
  this.controls.target.fromArray(this.data.camera.target);
  this.controls.update();this.boundCamera();
 }
 boundCamera(){
  if(!this.camera)return;
  const m=this.data.worldMeters,margin=.45;
  this.camera.position.x=THREE.MathUtils.clamp(this.camera.position.x,-m.width/2+margin,m.width/2-margin);
  this.camera.position.z=THREE.MathUtils.clamp(this.camera.position.z,-m.depth/2+margin,m.depth/2-margin);
  this.camera.position.y=THREE.MathUtils.clamp(this.camera.position.y,.48,m.height-.28);
  this.camera.updateMatrixWorld();
 }
 sizeCanvas(){
  if(!this.renderer||!this.camera)return false;
  const next=planDrawingBuffer(this.canvas.clientWidth,this.canvas.clientHeight,
    window.devicePixelRatio||1,this.quality,this.maxSide);
  if(!next)return false;
  if(!this.size||this.size.drawWidth!==next.drawWidth||this.size.drawHeight!==next.drawHeight)
   this.renderer.setSize(next.drawWidth,next.drawHeight,false);
  this.camera.aspect=next.cssWidth/next.cssHeight;this.camera.updateProjectionMatrix();
  this.size=next;this.pendingResize=false;return true;
 }
 setQuality(value){
  if(!["eco","balanced","high"].includes(value))return;
  this.quality=value;this.pendingResize=true;this.frames=memory();
  // Old metrics must NEVER appear under a new GPU quality selection.
  this.onMetrics("RAF ticks 0 · quality "+value+" resizing · NOT visual proof");
  this.wake();this.onStatus("Graphics: "+value+" · model unchanged");
 }
 setDocumentVisible(visible){
  this.hidden=!visible;if(this.hidden)this.pause();else this.resume();
 }
 setHostVisible(visible){
  this.hostVisible=!!visible;if(!this.hostVisible)this.pause();else this.resume();
 }
 wake(){
  if(!this.disposed&&!this.contextLost&&!document.hidden){
   this.hostVisible=true;this.resume();
  }
 }
 ready(){
  return !this.disposed&&!this.hidden&&this.hostVisible&&!this.contextLost&&
    !this.loading&&!!this.renderer&&!!this.scene&&!!this.camera;
 }
 pause(){if(this.raf)cancelAnimationFrame(this.raf);this.raf=0;this.frames.last=0;}
 resume(){
  if(this.ready()&&!this.raf){
   this.frames.last=0;this.raf=requestAnimationFrame(t=>this.frame(t));
  }
 }
 frame(now){
  this.raf=0;if(!this.ready())return;
  try{
   if(this.pendingResize&&!this.sizeCanvas()){
    this.onMetrics("Viewport unavailable — no FPS asserted");
   }else{
    const dt=this.frames.last?now-this.frames.last:0;this.frames.last=now;
    this.controls.update();this.boundCamera();
    this.renderer.render(this.scene,this.camera);
    this.frames.tick++;
    if(dt>0&&dt<120){
     this.frames.samples.push(dt);
     if(this.frames.samples.length>240)this.frames.samples.shift();
    }else if(dt>=120)this.frames.slow++;
    if(this.frames.tick%12===0){
     const samples=this.frames.samples;
     const avg=samples.length?samples.reduce((a,b)=>a+b,0)/samples.length:0;
     this.onMetrics("RAF ticks "+this.frames.tick+" · slow "+this.frames.slow+
      " · "+(avg?(1000/avg).toFixed(1):"—")+" RAF FPS · "+this.quality+
      " · "+(this.size?.drawWidth||0)+"×"+(this.size?.drawHeight||0)+
      " · visual proof is phone-only");
    }
   }
  }catch(ex){
   this.pause();this.onStatus("3D renderer exception: "+String(ex?.message||ex)+
    " · return to Classic; not a device PASS");return;
  }
  if(this.ready())this.raf=requestAnimationFrame(t=>this.frame(t));
 }
 disposeRoot(){
  for(const mesh of this.proxies){this.scene?.remove(mesh);mesh.geometry.dispose();mesh.material.dispose();}
  this.proxies=[];
  if(!this.root)return;
  this.root.traverse(node=>{
   if(!node.isMesh)return;
   node.geometry?.dispose();
   const mats=Array.isArray(node.material)?node.material:[node.material];
   for(const mat of mats){if(!mat)continue;
    for(const k of ["map","normalMap","metalnessMap","roughnessMap","aoMap","emissiveMap"])mat[k]?.dispose();
    mat.dispose();
   }
  });
  this.scene?.remove(this.root);this.root=null;
 }
 async reload(){
  if(this.disposed)return;
  const serial=++this.loadSerial;
  this.loading=true;this.pause();this.disposeRoot();this.isRealGlb=false;
  this.frames=memory();this.onStatus("Loading original offline Agro Lobby GLB…");
  const isGarden=this.data.sceneId==="trialum.ground.agro.garden";
  // A greenhouse bundle lives next to its own build-only GLB.
  // Strict S7 allowlist; historical lobby URI semantics stay unchanged.
  const assetURL=isGarden&&this.data.assetLocalPath==="./greenhouse-shell.glb"?
    new URL("./greenhouse-shell.glb",import.meta.url).href:
    new URL("../"+this.asset.uri.slice(2),import.meta.url).href;
  let root=null;
  try{
   const loader=new GLTFLoader();
   const loaded=await loader.loadAsync(assetURL);
   if(serial!==this.loadSerial||this.disposed)return;
   root=loaded.scene;root.updateMatrixWorld(true);
   const found=new Map();
   root.traverse(node=>{
    const id=node.userData?.semanticAnchor;
    if(id===undefined)return;
    if(!this.data.portals.some(p=>p.id===id)||found.has(id)||
       node.userData?.hasNoGameAuthority!==true)throw Error("Unexpected/duplicate GLB anchor "+id);
    const position=new THREE.Vector3();node.getWorldPosition(position);
    const contract=this.data.portals.find(p=>p.id===id).at;
    if(position.distanceTo(new THREE.Vector3(...contract))>.02)
      throw Error("Bad world-space GLB anchor transform "+id);
    found.set(id,position);
   });
   if(found.size!==this.data.portals.length)throw Error("GLB missing required portals");
   let meshCount=0;root.traverse(o=>{if(o.isMesh)meshCount++;});
   if(meshCount<(isGarden?4:50))throw Error("Architecture is missing GLB geometry");
   this.scene.add(root);this.root=root;this.isRealGlb=true;
   this.attachHitProxies(found);
   this.onStatus(isGarden?
     ("REAL Empty Greenhouse GLB loaded · "+meshCount+" meshes · 1 return portal · ZERO GAME WRITES"):
     ("REAL Agro Lobby GLB loaded · "+meshCount+
      " meshes · 3 semantic portals (rooms planned, not playable)"));
  }catch(e){
   if(serial!==this.loadSerial||this.disposed)return;
   this.onStatus("SCENE GLB FAILED: "+String(e?.message||e)+" · safe preview fallback, no game actions");
   // Minimal visual fallback is explicitly NOT a successful lobby.
   root=new THREE.Mesh(new THREE.BoxGeometry(12,.2,15),
    new THREE.MeshStandardMaterial({color:0x59746c,roughness:1}));
   root.position.y=-.15;this.scene.add(root);this.root=root;
   this.isRealGlb=false;
  }finally{
   if(serial===this.loadSerial&&!this.disposed){
    this.loading=false;this.pendingResize=true;this.resume();
   }
  }
 }
 attachHitProxies(found){
  for(const p of this.data.portals){
   const obj=new THREE.Mesh(new THREE.BoxGeometry(2.65,3.18,.55),
    new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));
   obj.position.copy(found.get(p.id));
   obj.userData.portalId=p.id;obj.name="hit-proxy:"+p.id;
   this.proxies.push(obj);this.scene.add(obj);
  }
 }
 pick(clientX,clientY){
  if(!this.isRealGlb||!this.proxies.length)return;
  const r=this.canvas.getBoundingClientRect();
  if(r.width<1||r.height<1)return;
  const mouse=new THREE.Vector2((clientX-r.left)/r.width*2-1,-((clientY-r.top)/r.height*2-1));
  const ray=new THREE.Raycaster();ray.setFromCamera(mouse,this.camera);
  const hits=ray.intersectObjects(this.proxies,false);
  if(!hits.length)return;
  this.select(hits[0].object.userData.portalId);
 }
 select(id){
  const selection=selectPlannedPortal(this.data,id);
  if(!selection)return;
  this.currentSelected=selection;this.onSelect(selection);
 }
 dispose(){
  if(this.disposed)return;
  this.disposed=true;this.loadSerial++;this.pause();
  for(const [target,type,fn,opts] of this.listeners)target.removeEventListener(type,fn,opts);
  this.listeners=[];this.disposeRoot();this.controls?.dispose();
  if(this.renderer){this.renderer.dispose();this.renderer.forceContextLoss();}
  this.renderer=null;this.scene=null;this.camera=null;this.controls=null;
 }
}
