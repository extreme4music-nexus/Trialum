/* Trialum LW-D S3: keep the *real Living World 3D* holographic HUD and dock.
 * The Agro S1 GLB is a render-only background layer beneath the SAME
 * owner-approved shell, not a full-screen separate game with its own UI.
 * No game state, credits, actions, network or storage writes here.
 */
(function(root){
 "use strict";
 const query=new URLSearchParams(root.location.search);
 if(query.get("live")!=="1"||root.parent===root)return;
 const doc=root.document,origin=root.location.origin,host=doc.getElementById("frame");
 const dock=doc.querySelector(".dock");
 if(!host||!dock)return;
 const portalIds=Object.freeze([
  "ground.agro.lobby.door-warehouse",
  "ground.agro.lobby.door-garden",
  "ground.agro.lobby.door-phytolab"
 ]);
 const allowedPortals=new Set(portalIds);
 const allowedQuality=new Set(["eco","balanced","high"]);
 const ACTIVE="trialum:lw:agro:overlay";
 let overlay=null,frame=null,closing=false,source="hub",
     parentVisible=true,language="mk",restoreTimer=null,selectedPortal=null;
 const t=(mk,en)=>language==="en"?en:mk;
 const buttons=[];
 function report(open){
  // The original NovaGL2/WebAudio stop while GLB is active; the original
  // authoritative game keeps its unmodified saved state.
  root.dispatchEvent(new root.CustomEvent(ACTIVE,{detail:{open:Boolean(open)}}));
 }
 function signal(){
  if(!frame?.contentWindow||closing)return;
  frame.contentWindow.postMessage({
   type:"trialum:agro:visibility",visible:!doc.hidden&&parentVisible
  },origin);
 }
 function send(action,detail){
  if(!overlay||!frame?.contentWindow||closing)return false;
  const value=action==="portal"?detail:action==="quality"?detail:null;
  if(action==="portal"&&!allowedPortals.has(value))return false;
  if(action==="quality"&&!allowedQuality.has(value))return false;
  if(!["portal","quality","reset"].includes(action))return false;
  frame.contentWindow.postMessage({type:"trialum:agro:command",action,value},origin);
  return true;
 }
 function refreshDock(){
  const names=[
   [null,"↩","Назад","Back"],
   [null,"🌿","Атриум","Atrium"],
   [portalIds[0],"📦","Магацин","Store"],
   [portalIds[1],"🌱","Градина","Garden"],
   [portalIds[2],"🧪","Фитолаб","Phyto"]
  ];
  for(let i=0;i<buttons.length;i++){
   const [id,icon,mk,en]=names[i];
   const label=t(mk,en);
   buttons[i].querySelector("small").textContent=label;
   buttons[i].setAttribute("aria-label",i===0?
    t("Назад во Жив Свет 3D","Back to Living World 3D"):
    i===1?t("Агро атриум · почетна сцена","Agro Atrium · overview"):
    t("Избери планирана просторија: ","Inspect planned room: ")+label);
   const pressed=i===1?selectedPortal===null:id===selectedPortal;
   buttons[i].classList.toggle("active",pressed);
   if(i>0)buttons[i].setAttribute("aria-pressed",String(pressed));
  }
 }
 function createDock(){
  const entries=[["↩","back"],["🌿","overview"],["📦",portalIds[0]],
    ["🌱",portalIds[1]],["🧪",portalIds[2]]];
  for(const [icon,key] of entries){
   const b=doc.createElement("button");
   b.className="dockbtn lw-agro-dock-btn";b.type="button";
   b.dataset.agroDock=key;b.hidden=true;
   const glyph=doc.createElement("span");glyph.className="emoji";
   glyph.textContent=icon;
   const label=doc.createElement("small");
   b.append(glyph,label);
   b.addEventListener("click",()=>{
    if(!overlay||closing)return;
    if(key==="back"){close();return;}
    if(key==="overview"){selectedPortal=null;refreshDock();root.dispatchEvent(
      new root.CustomEvent("trialum:lw:agro:portal",{detail:{id:null}})
     );send("reset");return;}
    send("portal",key);
   });
   dock.appendChild(b);buttons.push(b);
  }
  refreshDock();
 }
 createDock();
 function returnTo3D(){
  if(!overlay)return;
  const returnSource=source;
  overlay.remove();overlay=null;frame=null;closing=false;selectedPortal=null;
  doc.body.classList.remove("lw-agro-nested-open");
  report(false);
  refreshDock();
  root.dispatchEvent(new root.CustomEvent("trialum:lw:agro:returned",
   {detail:{source:returnSource}}));
  if(["hub","garden"].includes(returnSource))
   root.TrialumHubPages?.open(returnSource);
 }
 function close(){
  if(!overlay||closing)return;
  closing=true;
  try{frame?.contentWindow?.postMessage({type:"trialum:agro:dispose"},origin);}
  catch(_){}
  root.clearTimeout(restoreTimer);
  restoreTimer=root.setTimeout(returnTo3D,85);
 }
 function open(request){
  if(overlay||closing||doc.hidden||!parentVisible)return false;
  if(!["hub","atlas","garden"].includes(request))return false;
  source=request;selectedPortal=null;
  root.TrialumHubPages?.close();
  const dialog=doc.createElement("section");
  dialog.id="lw-agro-nested-overlay";
  dialog.className="lw-agro-nested-overlay";
  dialog.setAttribute("role","region");
  dialog.setAttribute("aria-label",t("Агро атриум · сцена во Жив Свет 3D","Agro Atrium · Living World 3D scene"));
  const child=doc.createElement("iframe");
  child.id="lw-agro-nested-frame";
  child.title=t("Агро атриум · 3D сценографија","Agro Atrium · 3D scene");
  child.src="./scenes/agro-lobby/lobby.html?hosted=1&inside3d=1&language="+language;
  child.setAttribute("loading","eager");
  dialog.append(child);
  frame=child;overlay=dialog;
  host.appendChild(dialog);
  doc.body.classList.add("lw-agro-nested-open");
  report(true); // only ONE WebGL RAF/audio foreground
  refreshDock(); // original left rail retained; its items change context
  child.addEventListener("load",signal);
  return true;
 }
 root.addEventListener("trialum:lw:agro-lobby",event=>{
  if(event.detail?.sceneId!=="trialum.ground.agro.lobby")return;
  open(event.detail?.from);
 });
 root.addEventListener("message",event=>{
  if(event.origin!==origin||!event.data||typeof event.data!=="object")return;
  if(event.source===root.parent){
   if(event.data.type==="trialum:lw:visibility"){
    parentVisible=event.data.visible===true;signal();
   }
   if(event.data.type==="trialum:lw:state"){
    language=event.data.world?.language==="en"?"en":"mk";
    refreshDock();
   }
   return;
  }
  if(!overlay||closing||!frame||event.source!==frame.contentWindow)return;
  if(event.data.type==="trialum:agro:ready")signal();
  if(event.data.type==="trialum:agro:close")close();
  if(event.data.type==="trialum:agro:selected"){
   const id=event.data.id;
   if(!allowedPortals.has(id))return;
   selectedPortal=id;refreshDock();
   root.dispatchEvent(new root.CustomEvent("trialum:lw:agro:portal",{detail:{id}}));
  }
  if(event.data.type==="trialum:agro:status"){
   const stage=event.data.stage;
   if(stage!=="ready"&&stage!=="failed")return;
   root.dispatchEvent(new root.CustomEvent("trialum:lw:agro:status",
    {detail:{stage}}));
  }
 });
 doc.addEventListener("visibilitychange",signal);
 root.addEventListener("keydown",event=>{
  if(!overlay||closing||event.key!=="Escape")return;
  event.preventDefault();event.stopImmediatePropagation?.();close();
 },true);
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
  currentRoute:()=>overlay?source:null,
  selectPortal:id=>send("portal",id),
  setQuality:q=>send("quality",q),
  resetCamera:()=>send("reset"),
  close
 });
})(globalThis);
