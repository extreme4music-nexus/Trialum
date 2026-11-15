/* B1 isolated GLB renderer launch; no gameplay actions/backup writes.
 * Original "✦ Жив Свет · 3D" NovaGL2 entry remains unmodified and available.
 */
(function(root){
"use strict";
if(!root.document?.querySelector(".shell"))return;
const origin=root.location.origin;
const button=root.document.createElement("button");
button.id="trialum-b1-glb-launcher";
button.type="button";
button.textContent="🧱 B1 GLB Pilot";
button.title="Experimental offline 3D room. Original world, inventory and saves remain untouched.";
button.setAttribute("aria-label","Open isolated GLB renderer pilot");
button.style.cssText="padding:7px 12px;border:1px solid #63c5b4;border-radius:14px;background:#193a46;color:#e5fff7;font-size:12px;font-weight:750;white-space:nowrap";
root.document.querySelector(".mast")?.append(button);
let overlay=null,frame=null,closeButton=null,closing=false;
function signal(){
 if(!frame?.contentWindow)return;
 frame.contentWindow.postMessage({type:"trialum:b1:visibility",visible:!root.document.hidden&&!closing},origin);
}
function cleanup(){
 overlay?.remove();overlay=null;frame=null;closeButton=null;closing=false;
 root.document.body.classList.remove("trialum-b1-pilot-open");
 root.TrialumWorld?.setSceneVisible?.(!root.document.hidden);
 root.TrialumAudio?.setAppVisible?.(!root.document.hidden);
 button.focus({preventScroll:true});
}
function close(){
 if(!overlay||closing)return;
 closing=true;
 try{frame?.contentWindow?.postMessage({type:"trialum:b1:dispose"},origin);}catch(_){}
 // Allow same-origin iframe to release GPU buffers before removing its document.
 root.setTimeout(cleanup,65);
}
function open(){
 if(overlay||root.document.querySelector("#lw-d-overlay"))return;
 root.TrialumWorld?.setSceneVisible?.(false);
 root.TrialumAudio?.setAppVisible?.(false);
 overlay=root.document.createElement("section");
 overlay.id="trialum-b1-overlay";
 overlay.setAttribute("role","dialog");
 overlay.setAttribute("aria-modal","true");
 overlay.setAttribute("aria-label","B1 GLB renderer experiment — not gameplay");
 overlay.style.cssText="position:fixed;z-index:100200;inset:0;width:100vw;height:100dvh;background:#071827;overflow:hidden";
 frame=root.document.createElement("iframe");
 frame.id="trialum-b1-frame";
 frame.title="Offline Three.js GLB pilot";
 frame.setAttribute("loading","eager");
 frame.style.cssText="position:absolute;inset:0;border:0;width:100%;height:100%";
 frame.src="./prototypes/lw-d/b1/pilot.html?hosted=1";
 closeButton=root.document.createElement("button");
 closeButton.type="button";
 closeButton.id="trialum-b1-close";
 closeButton.textContent="← Classic";
 closeButton.title="Close experimental renderer and return to original game";
 closeButton.style.cssText="position:absolute;left:max(8px,env(safe-area-inset-left));bottom:max(8px,env(safe-area-inset-bottom));z-index:100201;padding:7px 11px;background:#173946;color:#fff;border:1px solid #71cabb;border-radius:16px;min-height:35px";
 closeButton.addEventListener("click",close);
 overlay.append(frame,closeButton);
 root.document.body.append(overlay);
 root.document.body.classList.add("trialum-b1-pilot-open");
 frame.addEventListener("load",signal);
 closeButton.focus({preventScroll:true});
}
button.addEventListener("click",open);
root.addEventListener("message",event=>{
 if(!overlay||closing||!frame||event.origin!==origin||event.source!==frame.contentWindow)return;
 if(event.data?.type==="trialum:b1:close"){close();return;}
 if(event.data?.type==="trialum:b1:ready"){signal();}
});
root.document.addEventListener("visibilitychange",signal);
root.addEventListener("focus",signal);
root.addEventListener("blur",()=>{if(frame?.contentWindow)frame.contentWindow.postMessage({type:"trialum:b1:visibility",visible:false},origin);});
root.addEventListener("keydown",event=>{
 if(event.key==="Escape"&&overlay&&!closing){event.preventDefault();close();}
});
root.addEventListener("pagehide",()=>{
 if(frame?.contentWindow)frame.contentWindow.postMessage({type:"trialum:b1:dispose"},origin);
 overlay?.remove();overlay=null;frame=null;
});
})(typeof globalThis!=="undefined"?globalThis:this);
