/* Trialum S4 room bootstrap. GLB models are real offline files built on CI,
 * loaded from local APK assets. Never import canonical game engine here.
 */
import {FoodWarehouseEngine,validateWarehouse} from "./warehouse-runtime.mjs";
import {WarehouseCanvasFallback} from "./warehouse-canvas-fallback.mjs";
const $=id=>document.getElementById(id);
const params=new URLSearchParams(location.search);
const hosted=params.get("hosted")==="1"&&parent!==window;
const insideWorld=hosted&&params.get("inside3d")==="1";
const language=params.get("language")==="en"?"en":"mk";
const tr=(mk,en)=>language==="en"?en:mk;
let engine=null,canvasFallback=null,disposed=false,stage="loading",mode="loading",lastStatus="";
const portals=[
 ["ground.agro.warehouse.door-main","Главна врата · Агро атриум","Main entrance · Agro Atrium"],
 ["ground.agro.warehouse.subroom-cold","Разладна комора · во изградба","Cold subroom · planned"],
 ["ground.agro.warehouse.subroom-pack","Пакување · во изградба","Packing subroom · planned"]
];
const ids=new Set(portals.map(p=>p[0]));
if(insideWorld){
 document.documentElement.lang=language;
 document.body.classList.add("inside-living-world-3d");
 document.title=tr("Trialum · Стовариште за храна","Trialum · Food Warehouse");
}
function toParent(data){if(hosted&&!disposed)parent.postMessage(data,location.origin);}
function report(s){
 if(disposed)return;
 if(s===lastStatus)return;lastStatus=s;
 $("status").textContent=s;
 const isReal=s.includes("REAL Food Warehouse GLB loaded");
 const fallback=s.includes("FALLBACK NON-GLB WAREHOUSE ACTIVE")||
  s.includes("NON-GLB 2D fallback");
 const failed=/SCENE GLB FAILED|renderer exception|context lost|WebGL2 unavailable/.test(s);
 if(isReal){mode="real-glb";stage="ready";document.body.dataset.realGlb="true";}
 if(fallback){mode="non-glb";stage="fallback";document.body.dataset.realGlb="false";}
 if(failed&&!fallback){stage="failed";document.body.dataset.realGlb="false";}
 if(isReal||fallback||failed)toParent({type:"trialum:agro:status",stage,mode});
}
function selected(p){
 if(disposed)return;
 const id=p?.id;
 if(!ids.has(id))return;
 const target=portals.find(x=>x[0]===id);
 $("detailTitle").textContent=tr(target[1],target[2]);
 $("detailText").textContent=id===portals[0][0]?
  tr("Главната врата се отвора со анимација. Назад во Агро атриум е во левото мени.",
     "Main door slides open. Return to Agro Atrium using the left dock."):
  tr("Оваа подпросторија е планирана и сѐ уште нема влез.",
     "This subroom is planned and not yet accessible.");
 document.querySelectorAll("[data-portal]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.portal===id)));
 toParent({type:"trialum:agro:selected",id,canEnter:id===portals[0][0],isOpen:Boolean(p.isOpen)});
}
function select(id){
 if(!ids.has(id))return;
 if(engine)engine.select(id);
 else if(canvasFallback&&id===portals[0][0]){
  canvasFallback.toggleDoor();selected({id});
 }else if(canvasFallback)selected({id});
}
function quality(q){
 if(!["eco","balanced","high"].includes(q))return;
 $("quality").value=q;
 engine?.setQuality(q); // 2D fallback stays light and keeps rendering
}
function reset(){engine?.wake();engine?.resetCamera();}
function back(){
 if(hosted)toParent({type:"trialum:agro:warehouse:back"});
 else location.href="../agro-lobby/lobby.html";
}
function dispose(){
 if(disposed)return;disposed=true;
 engine?.dispose();engine=null;canvasFallback?.dispose();canvasFallback=null;
}
window.TrialumWarehouseDebug=Object.freeze({
 status:()=>({stage,mode,diagnostics:engine?.getVisualDiagnostics()||
  {mode:"non-glb-2d",doorOpenFraction:canvasFallback?.door??0,
   transporterCount:canvasFallback?1:0,gameWrites:false}})
});
async function start(){
 try{
  const [s,v,f]=await Promise.all([
   fetch(new URL("scene.json",import.meta.url),{cache:"no-store"}),
   fetch(new URL("visual-recipe.json",import.meta.url),{cache:"no-store"}),
   fetch(new URL("fallback-manifest.json",import.meta.url),{cache:"no-store"})
  ]);
  if(!s.ok||!v.ok||!f.ok)throw Error("Offline scene/recipe/fallback manifest not packaged");
  const manifest=await s.json(),recipe=await v.json(),fallback=await f.json();
  validateWarehouse(manifest,recipe);
  if(fallback.requiresGLB!==false||fallback.mode!=="non-glb-primitives")
   throw Error("Not an authentic non-GLB fallback contract");
  if(disposed)return;
  engine=new FoodWarehouseEngine({canvas:$("scene"),manifest,recipe,
   onStatus:report,onMetrics:t=>{$("metrics").textContent=t;},onSelect:selected});
  for(const b of document.querySelectorAll("[data-portal]")){
   b.setAttribute("aria-pressed","false");
   b.addEventListener("click",()=>select(b.dataset.portal));
  }
  $("quality").value=manifest.quality.default;
  $("quality").addEventListener("change",e=>quality(e.target.value));
  $("mainDoor").addEventListener("click",()=>select(portals[0][0]));
  $("reset").addEventListener("click",reset);
  $("exit").addEventListener("click",back);
  window.addEventListener("message",event=>{
   if(!hosted||event.source!==parent||event.origin!==location.origin||!event.data)return;
   const m=event.data;
   if(m.type==="trialum:agro:dispose"){dispose();return;}
   if(m.type==="trialum:agro:visibility"){
    engine?.setHostVisible(m.visible===true);
    canvasFallback?.setVisible(m.visible===true);return;
   }
   if(m.type!=="trialum:agro:command")return;
   if(m.action==="reset")reset();
   if(m.action==="quality")quality(m.value);
   if(m.action==="portal"&&ids.has(m.value))select(m.value);
  });
  window.addEventListener("pagehide",dispose);
  document.addEventListener("visibilitychange",()=>{
   canvasFallback?.setVisible(!document.hidden);
  });
  try{
   await engine.mount();
  }catch(e){
   if(disposed)return;
   // A separate canvas is required: a WebGL canvas cannot turn into 2D.
   engine?.dispose();engine=null;
   $("scene").hidden=true;
   canvasFallback=new WarehouseCanvasFallback($("fallback"),{onStatus:report,onSelect:selected});
   report("NON-GLB 2D fallback · "+String(e?.message||e));
  }
  if(hosted&&!disposed)toParent({type:"trialum:agro:ready"});
 }catch(e){
  if(disposed)return;
  report("Warehouse unavailable: "+String(e?.message||e));
  // If even the offline manifest is absent, still show a safe 2D room.
  try{canvasFallback=new WarehouseCanvasFallback($("fallback"),{onStatus:report,onSelect:selected});}
  catch(_){report("Warehouse graphics unavailable — original game remains safe");}
 }
}
window.addEventListener("keydown",e=>{
 if(e.key==="Escape"&&!disposed){e.preventDefault();back();}
});
start();
