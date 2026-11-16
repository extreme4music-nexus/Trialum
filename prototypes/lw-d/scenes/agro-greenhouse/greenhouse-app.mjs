/* Trialum S7 EMPTY Greenhouse GLB preview.
 * Render-only child of the EXISTING Agro World-3D overlay; no game writes.
 */
import {ThreeSceneEngine} from "../../three-core/scene-runtime.mjs";
const $=id=>document.getElementById(id);
const query=new URLSearchParams(location.search);
const hosted=query.get("hosted")==="1"&&parent!==window;
const inside3d=hosted&&query.get("inside3d")==="1";
const lang=query.get("language")==="en"?"en":"mk";
const t=(mk,en)=>lang==="en"?en:mk;
let engine=null,dead=false,ready=false,mode="loading";
const allowedZones=new Set(["G-01","G-02","G-03","G-04","G-05"]);
const onlyPortal="ground.agro.greenhouse.door-main";
function notify(data){if(hosted&&!dead)parent.postMessage(data,location.origin);}
function setStatus(value){
 if(dead)return;
 $("status").textContent=value;
 if(value.includes("REAL Empty Greenhouse GLB loaded")){
  mode="real-glb";ready=true;document.body.dataset.realGlb="true";
  notify({type:"trialum:agro:status",stage:"ready",mode});
 }else if(/SCENE GLB FAILED|renderer exception|context lost|unavailable/i.test(value)){
  mode="failed";ready=false;document.body.dataset.realGlb="false";
  notify({type:"trialum:agro:status",stage:"failed",mode});
 }
}
function back(){notify({type:"trialum:agro:greenhouse:back"});if(!hosted)location.href="../agro-lobby/lobby.html";}
function selectZone(id){
 if(!allowedZones.has(id)||!engine?.isRealGlb)return;
 const z=engine.data.zones.find(p=>p.id===id);
 if(!z||!z.at||z.at.some(n=>!Number.isFinite(n)))return;
 engine.wake();
 const targetX=z.at[0],targetZ=z.at[2];
 const radius=Math.hypot(targetX,targetZ)||1;
 // Travel toward each corridor from the hub, then look deeper inside.
 const distance=engine.data.camera.zoneFocusDistanceM||7.5;
 const homeX=targetX/radius,homeZ=targetZ/radius;
 const center=id==="G-01";
 engine.camera.position.set(
   center?0:targetX-homeX*distance,
   engine.data.camera.zoneFocusHeightM||3.15,
   center?11.1:targetZ-homeZ*distance
 );
 engine.controls.target.set(targetX,center?2.2:2.45,targetZ);
 engine.controls.update();engine.boundCamera();
 $("detailTitle").textContent=t(z.mk,z.label);
 $("detailText").textContent=t(
  "ПРАЗНА 3Д школка · ова е само обележан сектор. Базени, леи, расадник и машини допрва се изработуваат.",
  "EMPTY 3D shell · designated sector only. Pools, beds, nursery and machines are not yet built."
 );
 for(const b of document.querySelectorAll("[data-zone]"))
  b.setAttribute("aria-pressed",String(b.dataset.zone===id));
}
// Map direct touches on the REAL GLB floor to the matching physical corridor.
// This is camera navigation only; no change to plant/garden state.
function zoneFromFloor(point){
 const x=Number(point?.x),z=Number(point?.z);
 if(!Number.isFinite(x)||!Number.isFinite(z))return null;
 const distance=Math.hypot(x,z);
 if(distance<=17.2)return "G-01";
 const branches=[
  ["G-02",-73,38,9],["G-03",-38,55,12],
  ["G-04",-2,63,14],["G-05",37,56,12.5]
 ];
 let best=null,err=Infinity;
 for(const [id,degrees,end,width] of branches){
  const rad=degrees*Math.PI/180,u=[Math.sin(rad),-Math.cos(rad)];
  const along=x*u[0]+z*u[1];
  const lateral=Math.abs(x*u[1]-z*u[0]);
  if(along<15||along>end+1||lateral>width/2+.75)continue;
  const normalized=lateral/width;
  if(normalized<err){err=normalized;best=id;}
 }
 return best;
}
function quality(q){
 if(!["eco","balanced","high"].includes(q))return;
 $("quality").value=q;engine?.setQuality(q);
}
function reset(){
 if(!engine)return;
 engine.wake();engine.resetCamera();
 for(const b of document.querySelectorAll("[data-zone]"))b.setAttribute("aria-pressed","false");
}
function dispose(){
 if(dead)return;
 dead=true;ready=false;engine?.dispose();engine=null;
}
window.TrialumS7Debug=Object.freeze({status:()=>({mode,ready,
 emptyShell:true,gameStateWrites:false,engine:new Set(allowedZones).size,
 noPlants:true,noBasins:true,noProps:true,room:"garden"})});
async function start(){
 try{
  const [a,b]=await Promise.all([
   fetch("./scene.json",{cache:"no-store"}),
   fetch("./visual-recipe.json",{cache:"no-store"})
  ]);
  if(!a.ok||!b.ok)throw Error("Missing offline garden manifest");
  const scene=await a.json(),recipe=await b.json();
  if(scene.sceneId!=="trialum.ground.agro.garden"||scene.modelAssetId!=="agro.greenhouse.empty-shell.v1"||
     scene.portals.length!==1||scene.portals[0].id!==onlyPortal||
     scene.assetLocalPath!=="./greenhouse-shell.glb"||scene.authority?.gameplayWrites!==false||
     scene.authority?.inventoryWrites!==false||scene.authority?.saveWrites!==false||
     !scene.authority?.readOnly||!scene.previewOnly||!recipe.allZonesEmpty)
   throw Error("Untrusted or mutated S7 garden scene");
  if(dead)return;
  for(const zone of scene.zones){
   if(!allowedZones.has(zone.id)||zone.status!=="EMPTY_SHELL")throw Error("Untrusted garden zone");
   const button=document.querySelector('[data-zone="'+zone.id+'"]');
   if(button)button.textContent=t(zone.mk,zone.label);
  }
  engine=new ThreeSceneEngine({canvas:$("scene"),manifest:scene,
   asset:{uri:"./scenes/agro-greenhouse/greenhouse-shell.glb"},
   onStatus:setStatus,onMetrics:s=>{$("metrics").textContent=s;},
   onSelect:p=>{if(p?.id===onlyPortal)back();},
   onScenePick:point=>{
    const id=zoneFromFloor(point);
    if(id)selectZone(id);
   }});
  for(const b of document.querySelectorAll("[data-zone]"))
   b.addEventListener("click",()=>selectZone(b.dataset.zone));
  $("quality").value=scene.quality.default;
  $("quality").addEventListener("change",e=>quality(e.target.value));
  $("reset").addEventListener("click",reset);
  $("exit").addEventListener("click",back);
  $("mainDoor").addEventListener("click",back);
  window.addEventListener("message",event=>{
   if(!hosted||event.source!==parent||event.origin!==location.origin||!event.data)return;
   const message=event.data;
   if(message.type==="trialum:agro:dispose"){dispose();return;}
   if(message.type==="trialum:agro:visibility"){engine?.setHostVisible(message.visible===true);return;}
   if(message.type!=="trialum:agro:command")return;
   if(message.action==="quality")quality(message.value);
   else if(message.action==="reset")reset();
   else if(message.action==="zone")selectZone(message.value);
   else if(message.action==="portal"&&message.value===onlyPortal)back();
  });
  window.addEventListener("pagehide",dispose);
  await engine.mount();
  notify({type:"trialum:agro:ready"});
 }catch(e){setStatus("S7 greenhouse unavailable: "+String(e?.message||e));}
}
window.addEventListener("keydown",e=>{
 if(e.key==="Escape"&&!dead){e.preventDefault();back();}
});
if(inside3d){
 document.title=t("Trialum · Празна стаклена градина","Trialum · Empty greenhouse");
 document.documentElement.lang=lang;
 document.body.classList.add("inside-living-world-3d");
}
start();
