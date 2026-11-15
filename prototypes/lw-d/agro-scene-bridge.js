/* Trialum LW-D S2: Agro Atrium is a NESTED scene of the existing Living World 3D.
 * Routes originate from existing 3D World Atlas / Main Lobby, NOT Classic mast.
 * No game state writes: Three.js GLB is a read-only scene island.
 */
(function(root){
 "use strict";
 const query=new URLSearchParams(root.location.search);
 if(query.get("live")!=="1"||root.parent===root)return;
 const doc=root.document,origin=root.location.origin;
 const host=doc.getElementById("frame");
 if(!host)return;
 let overlay=null,frame=null,closing=false,source="hub",parentVisible=true,language="mk",restoreTimer=null;
 const ACTIVE="trialum:lw:agro:overlay";
 const t=(mk,en)=>language==="en"?en:mk;
 function report(open){
  // Pause the ORIGINAL Living World WebGL renderer and spatial audio while
  // the nested Three.js renderer is foreground. No duplicate GPU/audio loops.
  root.dispatchEvent(new root.CustomEvent(ACTIVE,{detail:{open:Boolean(open)}}));
 }
 function signal(){
  if(!frame?.contentWindow||closing)return;
  frame.contentWindow.postMessage({
   type:"trialum:agro:visibility",
   visible:!doc.hidden&&parentVisible
  },origin);
 }
 function returnTo3D(){
  if(!overlay)return;
  const returnSource=source;
  overlay.remove();overlay=null;frame=null;closing=false;
  doc.body.classList.remove("lw-agro-nested-open");
  report(false);
  root.dispatchEvent(new root.CustomEvent("trialum:lw:agro:returned",
   {detail:{source:returnSource}}));
  if(returnSource==="hub"||returnSource==="garden")
   root.TrialumHubPages?.open("hub");
 }
 function close(){
  if(!overlay||closing)return;
  closing=true;
  try{frame?.contentWindow?.postMessage({type:"trialum:agro:dispose"},origin);}
  catch(_){}
  // Dispose the GL resources before detaching the child WebView document.
  root.clearTimeout(restoreTimer);
  restoreTimer=root.setTimeout(returnTo3D,85);
 }
 function open(request){
  if(overlay||closing||doc.hidden||!parentVisible)return false;
  if(request!=="hub"&&request!=="atlas"&&request!=="garden")return false;
  source=request;
  root.TrialumHubPages?.close(); // close the actual existing HUD, not an invented second menu
  const dialog=doc.createElement("section");
  dialog.id="lw-agro-nested-overlay";
  dialog.className="lw-agro-nested-overlay";
  dialog.setAttribute("role","dialog");
  dialog.setAttribute("aria-modal","true");
  dialog.setAttribute("aria-label",t("Агро комплекс · 3D лоби","Agro Complex · 3D Lobby"));
  const child=doc.createElement("iframe");
  child.id="lw-agro-nested-frame";
  child.title=t("Агро комплекс · Приземно лоби","Agro Complex · Ground Floor Lobby");
  child.src="./scenes/agro-lobby/lobby.html?hosted=1&inside3d=1&language="+language;
  child.setAttribute("loading","eager");
  const back=doc.createElement("button");
  back.id="lw-agro-return-to-world";back.className="lw-agro-return-to-world";
  back.type="button";back.textContent=t("← Жив Свет 3D","← Living World 3D");
  back.setAttribute("aria-label",t("Назад во Жив Свет 3D","Return to Living World 3D"));
  back.addEventListener("click",close);
  dialog.append(child,back);
  frame=child;overlay=dialog;
  doc.body.appendChild(dialog);
  doc.body.classList.add("lw-agro-nested-open");
  report(true); // stop original renderer before GLB initialization
  child.addEventListener("load",signal);
  return true;
 }
 root.addEventListener("trialum:lw:agro-lobby",e=>{
  if(e.detail?.sceneId!=="trialum.ground.agro.lobby")return;
  open(e.detail?.from);
 });
 root.addEventListener("message",e=>{
  if(e.origin!==origin||!e.data||typeof e.data!=="object")return;
  if(e.source===root.parent){
   if(e.data.type==="trialum:lw:visibility"){
    parentVisible=e.data.visible===true;
    signal();
   }
   if(e.data.type==="trialum:lw:state")
    language=e.data.world?.language==="en"?"en":"mk";
   return;
  }
  if(!overlay||closing||!frame||e.source!==frame.contentWindow)return;
  if(e.data.type==="trialum:agro:ready")signal();
  if(e.data.type==="trialum:agro:close")close();
 });
 doc.addEventListener("visibilitychange",signal);
 root.addEventListener("keydown",e=>{
  if(!overlay||closing||e.key!=="Escape")return;
  e.preventDefault();e.stopImmediatePropagation?.();close();
 });
 root.addEventListener("pagehide",()=>{
  root.clearTimeout(restoreTimer);
  try{frame?.contentWindow?.postMessage({type:"trialum:agro:dispose"},origin);}
  catch(_){}
  overlay?.remove();overlay=null;frame=null;
  doc.body.classList.remove("lw-agro-nested-open");
  report(false);
 });
 root.TrialumAgroSceneBridge=Object.freeze({
  isOpen:()=>Boolean(overlay)&&!closing,
  // Enables tests to inspect routing; real user route is only via menus.
  currentRoute:()=>overlay?source:null
 });
})(globalThis);
