/* Trialum S1 scene *bootstrap*, intentionally independent of game state.
 * Reads registry + room manifest; injects data into reusable ThreeSceneEngine.
 */
import {validateSceneRegistry} from "./scene-registry.mjs";
import {ThreeSceneEngine} from "./scene-runtime.mjs";
const $=id=>document.getElementById(id);
const status=$("status"),metrics=$("metrics"),detailTitle=$("detailTitle"),detailText=$("detailText");
const params=new URLSearchParams(location.search);
const hosted=params.get("hosted")==="1"&&parent!==window;
const insideLivingWorld=hosted&&params.get("inside3d")==="1";
const language=params.get("language")==="en"?"en":"mk";
const tr=(mk,en)=>language==="en"?en:mk;
if(insideLivingWorld){
 document.documentElement.lang=language;
 document.body.classList.add("inside-living-world-3d");
 document.title=tr("Trialum · Агро атриум · Жив Свет 3D","Trialum · Agro Atrium · Living World 3D");
 $("exit").textContent=tr("← Жив Свет 3D","← Living World 3D");
 $("exit").setAttribute("aria-label",tr("Назад во Жив Свет 3D","Back to Living World 3D"));
 document.querySelector(".eyebrow").textContent=tr("ТРИАЛУМ / ЖИВ СВЕТ 3D / ПРИЗЕМЈЕ","TRIALUM / LIVING WORLD 3D / GROUND FLOOR");
 document.querySelector(".sub").textContent=tr("Агро атриум · приземно 3D лоби","Agro Atrium · Ground-floor 3D lobby");
 $("detailTitle").textContent=tr("Разгледај го атриумот","Explore the Agro Atrium");
 $("detailText").textContent=tr("Повлечи за вртење, приближи со два прста и допри врата. Трите простории се планирани.",
   "Orbit, pinch to zoom and tap a door. All three rooms are planned.");
 document.querySelector(".controls label").textContent=tr("ГРАФИКА","GRAPHICS");
 $("reset").textContent=tr("⟲ Камера","⟲ Camera");
}
let sceneEngine=null,disposed=false;
function log(text){
 status.textContent=text;
 // The status label changes to "Graphics: ..." on quality selection.
 // Keep actual GLB validity in a distinct persistent, testable DOM signal.
 if(text.includes("REAL Agro Lobby GLB loaded"))document.body.dataset.realGlb="true";
 if(/SCENE GLB FAILED|renderer exception|WebGL context lost|unavailable/i.test(text))
  document.body.dataset.realGlb="false";
}
function onSelect(p){
 detailTitle.textContent=language==="en"?p.label:p.mk;
 detailText.textContent=tr(
  "Вратата е поставена во 3D, но собата допрва ќе се гради. Нема влез, инвентар или промена на играта.",
  "The 3D door is in place, but this room is not built yet. No entry or game-data changes."
 );
 for(const btn of document.querySelectorAll("[data-portal]"))
  btn.setAttribute("aria-pressed",String(btn.dataset.portal===p.id));
}
function backToClassic(){
 if(hosted)parent.postMessage({type:"trialum:agro:close"},location.origin);
 else location.href=new URL("../../../../index.html",location.href).href;
}
function dispose(){
 if(disposed)return;disposed=true;sceneEngine?.dispose();sceneEngine=null;
}
async function main(){
 try{
  const root=new URL("../",import.meta.url);
  const [regResponse,sceneResponse]=await Promise.all([
   fetch(new URL("scene-registry.json",root),{cache:"no-store"}),
   fetch(new URL("scenes/agro-lobby/scene.json",root),{cache:"no-store"})
  ]);
  if(!regResponse.ok||!sceneResponse.ok)throw Error("Registry or scene manifest not packaged offline");
  const registry=await regResponse.json(),scene=await sceneResponse.json();
  const {asset}=validateSceneRegistry(registry,scene);
  if(disposed)return;
  if(insideLivingWorld){
   for(const portal of scene.portals){
    const button=document.querySelector('[data-portal="'+portal.id+'"]');
    if(!button)continue;
    const name=button.querySelector(".room-name");
    if(name)name.textContent=language==="en"?portal.label:portal.mk;
    const planned=button.querySelector("small");
    if(planned)planned.textContent=tr("Во изградба · без влез","Planned · not accessible");
   }
  }
  sceneEngine=new ThreeSceneEngine({canvas:$("scene"),manifest:scene,asset,
   onStatus:log,onMetrics:t=>{metrics.textContent=t;},onSelect});
  $("quality").value=scene.quality.default;
  $("quality").addEventListener("change",e=>sceneEngine?.setQuality(e.target.value));
  $("reset").addEventListener("click",()=>{sceneEngine?.wake();sceneEngine?.resetCamera();});
  $("exit").addEventListener("click",backToClassic);
  for(const btn of document.querySelectorAll("[data-portal]")){
   btn.setAttribute("aria-pressed","false");
   btn.addEventListener("click",()=>sceneEngine?.select(btn.dataset.portal));
  }
  window.addEventListener("message",e=>{
   if(!hosted||e.source!==parent||e.origin!==location.origin)return;
   if(e.data?.type==="trialum:agro:dispose"){dispose();return;}
   if(e.data?.type==="trialum:agro:visibility")
    sceneEngine?.setHostVisible(e.data.visible===true);
  });
  window.addEventListener("pagehide",dispose);
  await sceneEngine.mount();
  if(hosted&&!disposed)parent.postMessage({type:"trialum:agro:ready"},location.origin);
 }catch(e){
  log("Agro lobby preview unavailable: "+String(e?.message||e)+
   " · original Classic game unchanged");
 }
}
window.addEventListener("keydown",event=>{
 if(event.key!=="Escape"||disposed)return;
 event.preventDefault();
 backToClassic();
});
main();
