/* Trialum S1 scene *bootstrap*, intentionally independent of game state.
 * Reads registry + room manifest; injects data into reusable ThreeSceneEngine.
 */
import {validateSceneRegistry} from "./scene-registry.mjs";
import {ThreeSceneEngine} from "./scene-runtime.mjs";
const $=id=>document.getElementById(id);
const status=$("status"),metrics=$("metrics"),detailTitle=$("detailTitle"),detailText=$("detailText");
const hosted=new URLSearchParams(location.search).get("hosted")==="1" && parent!==window;
let sceneEngine=null,disposed=false;
function log(text){status.textContent=text;}
function onSelect(p){
 detailTitle.textContent=p.label+" · "+p.mk;
 detailText.textContent="Designed as a real portal · this room is not constructed yet. No entry or game data changes.";
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
main();
