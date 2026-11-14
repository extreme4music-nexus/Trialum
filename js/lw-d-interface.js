/* LW-D D1 opt-in landscape scene shell; no duplicate game economy or storage. */
(function(root){
"use strict";
const API=()=>root.TrialumLWBridge;
const origin=root.location.origin;
let overlay=null,iframe=null,opened=false,ready=false;
if(!document.querySelector(".shell"))return;
const trigger=document.createElement("button");
trigger.type="button";
trigger.id="lw-d-open";
trigger.textContent=root.TrialumI18n?.t?.("✦ Жив Свет · 3D")||"✦ Жив Свет · 3D";
trigger.title=root.TrialumI18n?.t?.("Пробна landscape-верзија. Постојниот свет и бекап остануваат зачувани.")||"Пробна landscape-верзија. Постојниот свет и бекап остануваат зачувани.";
trigger.className="lw-d-launch";
document.querySelector(".mast")?.appendChild(trigger);
const style=document.createElement("style");
style.textContent="\n.lw-d-launch{padding:7px 13px;border:1px solid #4cceb0;background:linear-gradient(120deg,#246e72,#244968);color:#e9fffb;border-radius:16px;font-size:13px;font-weight:900;white-space:nowrap}\n.lw-d-overlay{position:fixed;inset:0;z-index:100000;background:#071a2b;overflow:hidden}\n.lw-d-overlay iframe{display:block;width:100%;height:100%;border:0}\n.lw-d-close{position:absolute;top:max(34px,calc(7px + env(safe-area-inset-top)));left:calc(6px + env(safe-area-inset-left));z-index:100001;min-height:34px;background:#163d50de;color:#f7fff7;border:1px solid #6fd0b8;border-radius:20px;padding:5px 12px;font-size:12px}\nbody.lw-d-live{overflow:hidden}body.lw-d-live .shell{visibility:hidden}body.lw-d-live #toast{z-index:100002;left:max(81px,calc(76px + env(safe-area-inset-left)));bottom:max(12px,env(safe-area-inset-bottom));max-width:min(330px,46vw);font-size:11px;line-height:1.35;padding:8px 12px;transform:translateY(18px)}\nbody.lw-d-live #toast.show{transform:translateY(0)}\n.lw-d-overlay.lw-native-immersive .lw-d-close{top:max(9px,env(safe-area-inset-top))}\n";
document.head.appendChild(style);
function sync(){
  trigger.textContent=root.TrialumI18n?.t?.("✦ Жив Свет · 3D")||"✦ Жив Свет · 3D";
  if(!opened||!ready||!iframe?.contentWindow)return;
  const world=API()?.snapshot?.();
  if(world)iframe.contentWindow.postMessage({type:"trialum:lw:state",world},origin);
}
function signalVisible(){
 if(!opened||!ready||!iframe?.contentWindow)return;
 iframe.contentWindow.postMessage({type:"trialum:lw:visibility",visible:!document.hidden&&document.hasFocus()},origin);
}
document.addEventListener("visibilitychange",signalVisible);
root.addEventListener("blur",signalVisible);
root.addEventListener("focus",signalVisible);
function close(){
  if(!opened)return;
  opened=false;ready=false;
  try{root.TrialumAndroid?.setLivingWorldFullscreen?.(false);}catch(_){}
  overlay?.remove();overlay=null;iframe=null;
  document.body.classList.remove("lw-d-live");
  API()?.leaveOverlay?.();
  trigger.focus({preventScroll:true});
}
function show(){
  if(opened)return;
  if(!API()?.snapshot?.()){document.querySelector("#welcome")?.removeAttribute("hidden");return;}
  API()?.classicTab?.("lab"); // stops any active legacy social scene; no save mutation
  root.TrialumWorld?.setSceneVisible?.(false);
  overlay=document.createElement("section");
  overlay.className="lw-d-overlay";overlay.id="lw-d-overlay";
  overlay.setAttribute("role","dialog");overlay.setAttribute("aria-modal","true");
  overlay.setAttribute("aria-label","Trialum Жив Свет — 3D");
  const closeBtn=document.createElement("button");
  closeBtn.className="lw-d-close";closeBtn.type="button";
  closeBtn.textContent=root.TrialumI18n?.t?.("← Класичен приказ")||"← Класичен приказ";closeBtn.addEventListener("click",close);
  iframe=document.createElement("iframe");iframe.title="Trialum Жив Свет — 3D сцени";
  iframe.src="./prototypes/lw-d/world.html?live=1";
  overlay.append(iframe,closeBtn);document.body.appendChild(overlay);
  document.body.classList.add("lw-d-live");
  opened=true;ready=false;
  if(typeof root.TrialumAndroid?.setLivingWorldFullscreen==="function"){
    overlay.classList.add("lw-native-immersive");
    try{root.TrialumAndroid.setLivingWorldFullscreen(true);}catch(_){}
  }
  closeBtn.focus({preventScroll:true});
}
trigger.addEventListener("click",show);
root.addEventListener("message",event=>{
  if(!opened||event.origin!==origin||event.source!==iframe?.contentWindow)return;
  const data=event.data;
  if(!data||typeof data!=="object")return;
  if(data.type==="trialum:lw:ready"){ready=true;sync();signalVisible();return;}
  if(data.type==="trialum:lw:action"){
    const kind=String(data.kind||"");
    if(["synthesize","analyze","harvest","grow"].includes(kind)){
      // Snapshot both sides of the *existing* engine action. Renderer never grants rewards.
      const before=API()?.snapshot?.();
      const result=API()?.laboratory?.(kind);
      const after=API()?.snapshot?.();
      const labMetrics=state=>({
        compounds:Number(state?.compounds)||0,insight:Number(state?.insight)||0,
        biomass:Number(state?.biomass)||0,cells:Number(state?.cells)||0
      });
      iframe?.contentWindow?.postMessage({
        type:"trialum:lw:result",kind,
        result:{ok:!!result?.ok,message:String(result?.message||"").slice(0,260)},
        before:labMetrics(before),after:labMetrics(after)
      },origin);
      sync();
    }
    return;
  }
  if(data.type==="trialum:lw:classic"){
    const next=String(data.tab||"");
    if(API()?.classicTab?.(next))close();
  }
});
root.addEventListener("keydown",event=>{if(event.key==="Escape"&&opened){event.preventDefault();close();}});
root.addEventListener("pagehide",close);
root.TrialumLWDisplay=Object.freeze({sync,isOpen:()=>opened});
})(globalThis);
