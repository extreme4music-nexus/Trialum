/* LW-D D1 opt-in landscape scene shell; no duplicate game economy or storage. */
(function(root){
"use strict";
const API=()=>root.TrialumLWBridge;
const origin=root.location.origin;
let overlay=null,iframe=null,opened=false,ready=false;
let playFullscreen=false,playToolbar=null; // visual-only shell for original Classic local/shared playground
let pendingHudPage=null; // return to the requested global/social HUD, not old lab lobby
// Transient strictly-increasing receipt ID for actual original-engine replies.
// Not part of any game save/score and NEVER used as an authorization token.
let resultSequence=0;
if(!document.querySelector(".shell"))return;
const trigger=document.createElement("button");
trigger.type="button";
trigger.id="lw-d-open";
trigger.textContent=root.TrialumI18n?.t?.("✦ Жив Свет · 3D")||"✦ Жив Свет · 3D";
trigger.title=root.TrialumI18n?.t?.("Пробна landscape-верзија. Постојниот свет и бекап остануваат зачувани.")||"Пробна landscape-верзија. Постојниот свет и бекап остануваат зачувани.";
trigger.className="lw-d-launch";
document.querySelector(".mast")?.appendChild(trigger);
const style=document.createElement("style");
style.textContent="\n.lw-d-launch{padding:7px 13px;border:1px solid #4cceb0;background:linear-gradient(120deg,#246e72,#244968);color:#e9fffb;border-radius:16px;font-size:13px;font-weight:900;white-space:nowrap}\n.lw-d-overlay{position:fixed;inset:0;z-index:100000;background:#071a2b;overflow:hidden}\n.lw-d-overlay iframe{display:block;width:100%;height:100%;border:0}\n.lw-d-close{position:absolute;top:max(34px,calc(7px + env(safe-area-inset-top)));left:calc(6px + env(safe-area-inset-left));z-index:100001;min-height:34px;background:#163d50de;color:#f7fff7;border:1px solid #6fd0b8;border-radius:20px;padding:5px 12px;font-size:12px}\nbody.lw-d-live{overflow:hidden}body.lw-d-live .shell{visibility:hidden}body.lw-d-live #toast{z-index:100002;left:max(81px,calc(76px + env(safe-area-inset-left)));bottom:max(12px,env(safe-area-inset-bottom));max-width:min(330px,46vw);font-size:11px;line-height:1.35;padding:8px 12px;transform:translateY(18px)}\nbody.lw-d-live #toast.show{transform:translateY(0)}\n.lw-d-overlay.lw-d-ready .lw-d-close{opacity:0;visibility:hidden;pointer-events:none}\n";
style.textContent+=`
/* L3.8: existing Classic local/shared game uses the whole screen, no second game. */
body.lw-d-play-fullscreen{overflow:hidden!important}
body.lw-d-play-fullscreen .dashboard-tabs{
 position:fixed!important;z-index:100010!important;inset:0!important;
 width:100vw!important;max-width:none!important;height:100dvh!important;
 margin:0!important;padding:51px 10px 8px!important;overflow-y:auto!important;
 border-radius:0!important;background:linear-gradient(155deg,#08263a,#062638)!important;
}
body.lw-d-play-fullscreen .dashboard-tabs #tabs{display:none!important}
body.lw-d-play-fullscreen #tabContent{min-height:calc(100dvh - 66px)!important;max-width:none!important}
body.lw-d-play-fullscreen #tabContent .pg-board{max-width:none!important}
body.lw-d-play-fullscreen #tabContent #playgroundScene,
body.lw-d-play-fullscreen #tabContent #sharedScene{
 display:block;width:100%!important;max-width:none!important;max-height:min(72vh,580px);
}
.lw-d-play-toolbar{
 position:fixed;top:max(4px,env(safe-area-inset-top));left:max(8px,env(safe-area-inset-left));
 right:max(9px,env(safe-area-inset-right));z-index:100011;display:flex;align-items:center;
 justify-content:space-between;gap:7px;padding:4px 8px;
 border:1px solid rgba(151,243,219,.44);border-radius:12px;
 background:rgba(8,48,65,.96);color:#e7fff3;font-size:12px;
}
.lw-d-play-toolbar button{
 min-height:36px;min-width:45px;color:#e8fff6;border-radius:9px;border:1px solid #66c4b2;
 background:#164d5b;padding:5px 9px;cursor:pointer;touch-action:manipulation;
}
@media(max-height:430px){body.lw-d-play-fullscreen .dashboard-tabs{padding-top:46px!important}}
`;
document.head.appendChild(style);
function endPlayFullscreen(){
 if(!playFullscreen)return;
 playFullscreen=false;document.body.classList.remove("lw-d-play-fullscreen");
 playToolbar?.remove();playToolbar=null;
 setNativeImmersive(false);
}
function enterPlayFullscreen(target){
 if(target!=="playground"&&target!=="shared")return;
 endPlayFullscreen();
 playFullscreen=true;document.body.classList.add("lw-d-play-fullscreen");
 const toolbar=document.createElement("nav");toolbar.className="lw-d-play-toolbar";
 toolbar.setAttribute("aria-label","Trialum 3D — playground navigation");
 const mk=root.TrialumI18n?.language?.()!=="en";
 const title=document.createElement("strong");title.textContent=target==="shared"?
  (mk?"🌳 Заедничка игротека":"🌳 Shared Playground"):
  (mk?"🎠 Локална игротека":"🎠 Local Playground");
 const button=(label,action)=>{
  const b=document.createElement("button");b.type="button";b.textContent=label;
  b.addEventListener("click",action);return b;
 };
 toolbar.append(button(mk?"↩ Главно лоби":"↩ Main Lobby",()=>{
   endPlayFullscreen();pendingHudPage="hub";show();
  }),
  title,button(mk?"☰ Дружење":"☰ Social",()=>{
   endPlayFullscreen();pendingHudPage="social";show();
  }),
  button(mk?"✕ Повеќе":"✕ More",()=>{endPlayFullscreen();API()?.classicTab?.("more");}));
 document.body.appendChild(toolbar);playToolbar=toolbar;
 setNativeImmersive(true);
}
document.addEventListener("click",event=>{
 if(!playFullscreen)return;
 const tab=event.target?.closest?.("[data-tab]")?.dataset.tab;
 if(tab&&tab!=="playground"&&tab!=="shared")endPlayFullscreen();
});

function sync(){
  trigger.textContent=root.TrialumI18n?.t?.("✦ Жив Свет · 3D")||"✦ Жив Свет · 3D";
  if(!opened||!ready||!iframe?.contentWindow)return;
  const world=API()?.snapshot?.();
  if(world)iframe.contentWindow.postMessage({type:"trialum:lw:state",world},origin);
}
function signalVisible(){
 if(!opened||!ready||!iframe?.contentWindow)return;
 iframe.contentWindow.postMessage({type:"trialum:lw:visibility",visible:!document.hidden},origin);
}
document.addEventListener("visibilitychange",signalVisible);
root.addEventListener("blur",signalVisible);
root.addEventListener("focus",signalVisible);
function setNativeImmersive(enabled){
 // Only Android's separately installed LW-D QA package handles this command;
 // browser and the real release app remain unaffected.
 try{root.TrialumAndroid?.setLivingWorldImmersive?.(Boolean(enabled));}catch(_){}
}
function close(){
  if(!opened)return;
  setNativeImmersive(false);
  opened=false;ready=false;
  overlay?.remove();overlay=null;iframe=null;
  document.body.classList.remove("lw-d-live");
  API()?.leaveOverlay?.();
  // Hand the one active soundtrack to the 3D child; no duplicate 2D music.
  root.TrialumAudio?.setAppVisible?.(!document.hidden);
  trigger.focus({preventScroll:true});
}
function show(){
  if(opened)return;
  endPlayFullscreen();
  if(!API()?.snapshot?.()){document.querySelector("#welcome")?.removeAttribute("hidden");return;}
  API()?.classicTab?.("lab"); // stops any active legacy social scene; no save mutation
  root.TrialumWorld?.setSceneVisible?.(false);
  overlay=document.createElement("section");
  overlay.className="lw-d-overlay";overlay.id="lw-d-overlay";
  overlay.setAttribute("role","dialog");overlay.setAttribute("aria-modal","true");
  overlay.setAttribute("aria-label","Trialum Жив Свет — 3D");
  const closeBtn=document.createElement("button");
  closeBtn.className="lw-d-close";closeBtn.type="button";
  closeBtn.textContent="↩";
  closeBtn.title=root.TrialumI18n?.t?.("← Класичен приказ")||"← Класичен приказ";
  closeBtn.setAttribute("aria-label",closeBtn.title);
  closeBtn.addEventListener("click",close);
  iframe=document.createElement("iframe");iframe.title="Trialum Жив Свет — 3D сцени";
  iframe.src="./prototypes/lw-d/world.html?live=1";
  overlay.append(iframe,closeBtn);document.body.appendChild(overlay);
  document.body.classList.add("lw-d-live");
  opened=true;ready=false;
  root.TrialumAudio?.setAppVisible?.(false);
  setNativeImmersive(true);
  closeBtn.focus({preventScroll:true});
}
trigger.addEventListener("click",show);
root.addEventListener("message",event=>{
  if(!opened||event.origin!==origin||event.source!==iframe?.contentWindow)return;
  const data=event.data;
  if(!data||typeof data!=="object")return;
  if(data.type==="trialum:lw:ready"){
    ready=true;overlay?.classList.add("lw-d-ready");sync();signalVisible();
    if(pendingHudPage){
      iframe?.contentWindow?.postMessage({type:"trialum:lw:hud-nav",page:pendingHudPage},origin);
      pendingHudPage=null;
    }
    return;
  }
  if(data.type==="trialum:lw:audio-consent"){
    // Same-origin, exact iframe source and 3D ready guard are above.
    // Only an intentional user tap can enable music; no silent override.
    if(ready&&data.enableMusic===true&&API()?.enable3DMusic?.())sync();
    return;
  }
  if(data.type==="trialum:lw:open-home"){
    // Validated against the original current-world habitat IDs in the parent.
    const id=data.id;
    if(typeof id==="string"&&id.length<=100&&API()?.openExistingHome?.(id))close();
    return;
  }
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
        type:"trialum:lw:result",seq:++resultSequence,kind,
        result:{ok:!!result?.ok,message:String(result?.message||"").slice(0,260)},
        before:labMetrics(before),after:labMetrics(after)
      },origin);
      sync();
    }
    return;
  }
  if(data.type==="trialum:lw:research"){
    // Exact same-origin + live iframe guard above; all game state is parent-only.
    const op=String(data.op||"");
    if(!["study","upgrade","invent","craft"].includes(op))return;
    const before=API()?.snapshot?.();
    const result=API()?.researchOperation?.(op,data.payload);
    const after=API()?.snapshot?.();
    const metrics=state=>({
      level:state?.research?.level,knowledge:state?.research?.knowledge,
      labActions:state?.labActions,insight:state?.insight,
      compounds:state?.compounds,biomass:state?.biomass,
      energy:state?.research?.energy,credits:state?.research?.credits,
      discovered:state?.research?.discoveredCount
    });
    iframe?.contentWindow?.postMessage({
      type:"trialum:lw:research-result",seq:++resultSequence,op,
      result:{ok:result?.ok===true,message:String(result?.message||"").slice(0,260)},
      before:metrics(before),after:metrics(after)
    },origin);
    sync();
    return;
  }
  if(data.type==="trialum:lw:flora"){
    // The trusted same-origin iframe may request invent/plant only.
    // Original Trialum engine checks every rule, deducts costs and saves.
    const op=String(data.op||"");
    if(op!=="invent"&&op!=="plant")return;
    const before=API()?.snapshot?.();
    const result=API()?.floraOperation?.(op,data.payload);
    const after=API()?.snapshot?.();
    const species=typeof data.payload?.species==="string"?data.payload.species.slice(0,32):"";
    const metric=state=>({
      insight:state?.insight,compounds:state?.compounds,
      totalPlanted:state?.flora?.totalPlanted,
      dayActions:state?.flora?.habitat?.dayActions,
      habitatId:state?.flora?.habitat?.id,
      discovered:state?.flora?.plants?.find?.(model=>model.id===species)?.discovered,
      planted:state?.flora?.plants?.find?.(model=>model.id===species)?.planted
    });
    iframe?.contentWindow?.postMessage({
      type:"trialum:lw:flora-result",seq:++resultSequence,op,species,
      result:{ok:result?.ok===true,message:String(result?.message||"").slice(0,260)},
      before:metric(before),after:metric(after)
    },origin);
    sync(); // Show real updated species/oxygen/actions, not an iframe simulation.
    return;
  }
  if(data.type==="trialum:lw:food"){
    // Exact same-origin overlay request. All eligibility, spending and saving
    // live in the original game engine, NEVER inside the WebGL/HUD iframe.
    const op=String(data.op||"");
    if(op!=="craft"&&op!=="feed")return;
    const before=API()?.snapshot?.();
    const result=API()?.foodOperation?.(op,data.payload);
    const after=API()?.snapshot?.();
    const metric=state=>({
      biomass:state?.biomass,compounds:state?.compounds,
      labActions:state?.labActions,totalStock:state?.food?.totalStock,
      portions:state?.food?.recipes?.find?.(r=>r.id===data.payload?.recipe)?.stock,
      petActions:state?.food?.selectedPet?.actionsLeft
    });
    iframe?.contentWindow?.postMessage({
      type:"trialum:lw:food-result",seq:++resultSequence,op,
      recipe:typeof data.payload?.recipe==="string"?data.payload.recipe.slice(0,32):"",
      result:{ok:result?.ok===true,message:String(result?.message||"").slice(0,260)},
      before:metric(before),after:metric(after)
    },origin);
    sync(); // authoritative food stock and selected pet only, no parallel rewards.
    return;
  }
  if(data.type==="trialum:lw:warehouse"){
    const op=String(data.op||""),payload=data.payload;
    if(!["take","put"].includes(op)||!payload||typeof payload!=="object")return;
    const before=API()?.snapshot?.();
    const result=API()?.warehouseOperation?.(op,payload)||
      {ok:false,message:"Магацинот не е достапен."};
    const after=API()?.snapshot?.();
    iframe?.contentWindow?.postMessage({
      type:"trialum:lw:warehouse-result",seq:++resultSequence,op,
      recipe:typeof payload.recipe==="string"?payload.recipe.slice(0,32):"",
      result:{ok:result.ok===true,message:String(result.message||"").slice(0,260)},
      before:{totalStock:before?.food?.totalStock},
      after:{totalStock:after?.food?.totalStock}
    },origin);
    sync(); // parent engine is authoritative, never send a fake local stock count
    return;
  }
  if(data.type==="trialum:lw:dna-select-pet"){
    // Selecting existing pets is part of Classic parity, not a new DNA action.
    // The outer message listener already requires exact origin AND live iframe.
    const id=data.id;
    if(typeof id!=="string"||id.length>100)return;
    const result=API()?.dnaSelectPet?.(id);
    iframe?.contentWindow?.postMessage({
      type:"trialum:lw:dna-pet-result",
      result:{ok:result?.ok===true,message:String(result?.message||"").slice(0,260)}
    },origin);
    sync();
    return;
  }
  if(data.type==="trialum:lw:dna"){
    // The untrusted visual iframe can REQUEST an operation, never mutate a world.
    // Parent owns all eligibility checks, pet identity, costs, evolution and save.
    const op=String(data.op||"");
    if(op!=="design"&&op!=="transform")return;
    const before=API()?.snapshot?.();
    const result=API()?.dnaOperation?.(op,data.payload);
    const after=API()?.snapshot?.();
    iframe?.contentWindow?.postMessage({
      type:"trialum:lw:dna-result",seq:++resultSequence,op,
      result:{ok:result?.ok===true,message:String(result?.message||"").slice(0,260)},
      before:{compounds:before?.compounds,insight:before?.insight,labActions:before?.labActions},
      after:{compounds:after?.compounds,insight:after?.insight,labActions:after?.labActions}
    },origin);
    sync(); // show result and authoritative updated pet/lineage; no local copy.
    return;
  }
  if(data.type==="trialum:lw:classic"){
    const next=String(data.tab||"");
    if(API()?.classicTab?.(next)){
      close();
      if(next==="playground"||next==="shared")enterPlayFullscreen(next);
    }
  }
});
root.addEventListener("keydown",event=>{if(event.key==="Escape"&&opened){event.preventDefault();close();}});
root.addEventListener("pagehide",()=>{endPlayFullscreen();close();});
root.TrialumLWDisplay=Object.freeze({sync,isOpen:()=>opened,close});
})(globalThis);
