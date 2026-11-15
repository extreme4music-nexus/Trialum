/* Agro Lobby S1: isolated GLB scene preview inside existing Classic shell.
 * Only the real canonical Trialum game owns saves, AI, pets, food and plants.
 * Separate launch route; no new rooms or gameplay actions are created here.
 */
(function(root){
 "use strict";
 if(!root.document?.querySelector(".shell"))return;
 const origin=root.location.origin;
 const btn=root.document.createElement("button");
 btn.id="trialum-agro-lobby-s1-launcher";btn.type="button";
 btn.textContent="🌿 Agro Atrium 3D";btn.title="Explore new offline visual lobby; planned rooms are not playable yet";
 btn.setAttribute("aria-label","Preview modular Agro atrium GLB scene");
 btn.style.cssText="padding:7px 12px;border:1px solid #d5bb74;border-radius:14px;background:#24483e;color:#faf2d9;font-size:12px;font-weight:800;white-space:nowrap";
 root.document.querySelector(".mast")?.append(btn);
 let overlay=null,frame=null,closeBtn=null,closing=false;
 function signal(){
  if(!frame?.contentWindow)return;
  frame.contentWindow.postMessage({type:"trialum:agro:visibility",visible:!root.document.hidden&&!closing},origin);
 }
 function restoreClassic(){
  overlay?.remove();overlay=null;frame=null;closeBtn=null;closing=false;
  root.document.body.classList.remove("trialum-agro-atrium-preview-open");
  root.TrialumWorld?.setSceneVisible?.(!root.document.hidden);
  root.TrialumAudio?.setAppVisible?.(!root.document.hidden);
  try{btn.focus({preventScroll:true});}catch(_){}
 }
 function close(){
  if(!overlay||closing)return;closing=true;
  try{frame?.contentWindow?.postMessage({type:"trialum:agro:dispose"},origin);}catch(_){}
  root.setTimeout(restoreClassic,70);
 }
 function open(){
  if(overlay||root.document.querySelector("#trialum-b1-overlay")||
     root.document.querySelector("#lw-d-overlay"))return;
  root.TrialumWorld?.setSceneVisible?.(false);
  root.TrialumAudio?.setAppVisible?.(false);
  overlay=root.document.createElement("section");
  overlay.id="trialum-agro-atrium-overlay";overlay.setAttribute("role","dialog");
  overlay.setAttribute("aria-modal","true");
  overlay.setAttribute("aria-label","Ground floor Agro atrium visual preview");
  overlay.style.cssText="position:fixed;z-index:100202;inset:0;width:100vw;height:100dvh;background:#142e2b;overflow:hidden";
  frame=root.document.createElement("iframe");
  frame.id="trialum-agro-atrium-frame";frame.title="Modular Offline Agro Atrium GLB";
  frame.style.cssText="position:absolute;inset:0;width:100%;height:100%;border:0";
  frame.src="./prototypes/lw-d/scenes/agro-lobby/lobby.html?hosted=1";
  closeBtn=root.document.createElement("button");closeBtn.id="trialum-agro-atrium-close";
  closeBtn.textContent="← Classic";closeBtn.type="button";
  closeBtn.title="Close visual preview; return to original saved world";
  closeBtn.style.cssText="position:absolute;right:max(10px,env(safe-area-inset-right));bottom:max(27px,calc(10px + env(safe-area-inset-bottom)));z-index:100203;padding:8px 12px;background:#214b3d;color:#fff6df;border:1px solid #e4c480;border-radius:15px;font-size:12px;font-weight:750";
  closeBtn.addEventListener("click",close);
  overlay.append(frame,closeBtn);
  root.document.body.append(overlay);
  root.document.body.classList.add("trialum-agro-atrium-preview-open");
  frame.addEventListener("load",signal);
 }
 btn.addEventListener("click",open);
 root.addEventListener("message",event=>{
  if(!overlay||closing||!frame||event.origin!==origin||
     event.source!==frame.contentWindow)return;
  if(event.data?.type==="trialum:agro:close")close();
  if(event.data?.type==="trialum:agro:ready")signal();
 });
 root.document.addEventListener("visibilitychange",signal);
 // Do NOT turn window.blur into a false invisibility: native quality select
 // blurs the parent without backgrounding and freezes the iframe's RAF.
 root.addEventListener("focus",signal);
 root.addEventListener("keydown",e=>{
  if((e.key==="Escape"||e.key==="Backspace")&&overlay&&!closing){
   e.preventDefault();close();
  }
 });
 root.addEventListener("pagehide",()=>{
  try{frame?.contentWindow?.postMessage({type:"trialum:agro:dispose"},origin);}catch(_){}
  overlay?.remove();overlay=null;frame=null;
 });
})(typeof globalThis!=="undefined"?globalThis:this);
