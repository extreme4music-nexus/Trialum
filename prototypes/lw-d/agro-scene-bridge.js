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
 const warehousePortals=Object.freeze([
  "ground.agro.warehouse.door-main",
  "ground.agro.warehouse.subroom-cold",
  "ground.agro.warehouse.subroom-pack"
 ]);
 const gardenPortals=Object.freeze(["ground.agro.greenhouse.door-main"]);
 const gardenZones=Object.freeze(["G-01","G-02","G-03","G-04","G-05"]);
 const allowedPortals=new Set([...portalIds,...warehousePortals,...gardenPortals]);
 const allowedQuality=new Set(["eco","balanced","high"]);
 const ACTIVE="trialum:lw:agro:overlay";
 let overlay=null,frame=null,closing=false,source="hub",
     parentVisible=true,language="mk",restoreTimer=null,selectedPortal=null,
     room="atrium",area="main",changingRoom=false,changeTimer=null,inventory=null,inventorySignature=null,aquaticPlants=[],aquaglowPreview=false;
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
  const value=["portal","quality","area","inventory","zone","aquatic","preview"].includes(action)?detail:null;
  if(action==="portal"&&(!allowedPortals.has(value)||
     !(room==="atrium"?portalIds:room==="warehouse"?warehousePortals:gardenPortals).includes(value)))return false;
  if(action==="quality"&&!allowedQuality.has(value))return false;
  if(action==="area"&&(room!=="warehouse"||!["main","cold","packing"].includes(value)))return false;
  if(action==="inventory"&&room!=="warehouse")return false;
  if(action==="aquatic"&&(room!=="garden"||!Array.isArray(value)||value.length>4))return false;
  if(action==="preview"&&(room!=="garden"||typeof value!=="boolean"))return false;
   if(action==="zone"&&(room!=="garden"||!gardenZones.includes(value)))return false;
  if(!["portal","quality","reset","area","inventory","zone","aquatic","preview"].includes(action))return false;
  frame.contentWindow.postMessage({type:"trialum:agro:command",action,value},origin);
  return true;
 }
 // S7 warehouse integration: ingest the OUTER original engine snapshot directly,
 // independently of the HUD. Never let the nested 3D iframe become inventory owner.
 // There must be no self-generated stock; a missing canonical projection is not zero.
 const capPortion=v=>Number.isSafeInteger(v)&&v>=0&&v<=100000000?v:0;
 function acceptCanonicalFood(food){
  if(!food||!Array.isArray(food.recipes)||food.warehouseReady===false){
   const hadStock=inventory!==null;
   inventory=null;inventorySignature=null; // clear stale cached previous-save readings
   if(room==="warehouse"&&hadStock)send("inventory",{recipes:[],source:"unavailable",ready:false});
   return false;
  }
  const ids=new Set(),rows=[];
  for(const r of food.recipes.slice(0,40)){
   if(!r||typeof r.id!=="string"||!(/^[a-z0-9][a-z0-9_-]{0,31}$/i).test(r.id)||
      ids.has(r.id))continue;
   // Only accept genuine projected location integers. Do not substitute a
   // synthetic rack count if the original parent forgot to send bins.
   if(!["stock","rack","cold","packing","hand","warehouse"].every(k=>
      Number.isSafeInteger(r[k])&&r[k]>=0&&r[k]<=100000000))continue;
   if(r.warehouse!==r.rack+r.cold+r.packing+r.hand||r.stock<r.warehouse)continue;
   ids.add(r.id);
   rows.push(Object.freeze({id:r.id,name:String(r.name||r.id).slice(0,68),
    stock:capPortion(r.stock),warehouse:capPortion(r.warehouse),
    rack:capPortion(r.rack),cold:capPortion(r.cold),
    packing:capPortion(r.packing),hand:capPortion(r.hand)}));
  }
  const signature=JSON.stringify(rows);
  // Frequent engine clock/state snapshots must NOT recreate every rack's
  // 3D meshes, PBR materials, and hologram textures for identical stocks.
  if(inventory&&signature===inventorySignature)return true;
  inventorySignature=signature;
  inventory=Object.freeze({recipes:Object.freeze(rows),source:"original-TrialumWarehouseInventory.project",ready:true});
  if(room==="warehouse")send("inventory",inventory);
  return true;
 }
 function refreshDock(){
  const inStore=room==="warehouse",inGarden=room==="garden",inSubroom=inStore&&area!=="main";
  const names=inGarden?[
   [null,"↩","Назад","Back"],
   [null,"🌿","Атриум","Atrium"],
   [gardenPortals[0],"🚪","Врата","Door"],
   [null,"💧","Центар","Core"],
   [null,"🌱","Расадник","Nursery"]
  ]:inStore?[
   [null,"↩","Назад","Back"],
   [null,"🌿","Атриум","Atrium"],
   [warehousePortals[0],"🚪","Главна","Main"],
   [warehousePortals[1],"❄","Разладна","Cold"],
   [warehousePortals[2],"📦","Пакување","Packing"]
  ]:[
   [null,"↩","Назад","Back"],
   [null,"🌿","Атриум","Atrium"],
   [portalIds[0],"📦","Магацин","Store"],
   [portalIds[1],"🌱","Градина","Garden"],
   [portalIds[2],"🧪","Фитолаб","Phyto"]
  ];
  for(let i=0;i<buttons.length;i++){
   const [id,icon,mk,en]=names[i],label=t(mk,en);
   buttons[i].querySelector(".emoji").textContent=icon;
   buttons[i].querySelector("small").textContent=label;
   buttons[i].setAttribute("aria-label",i===0?
    (inSubroom?t("Назад во главниот магацин","Back to warehouse main room"):inStore?t("Назад во Агро атриум","Back to Agro Atrium"):
             t("Назад во Жив Свет 3D","Back to Living World 3D")):
    i===1?t("Агро атриум · главно лоби","Agro Atrium · main lobby"):
    label);
   const pressed=i===1?selectedPortal===null:id===selectedPortal;
   buttons[i].classList.toggle("active",pressed);
   if(i>0)buttons[i].setAttribute("aria-pressed",String(pressed));
  }
 }
 function switchRoom(target){
  if(!overlay||closing||changingRoom||!["atrium","warehouse","garden"].includes(target)||room===target)return false;
  changingRoom=true;
  // Defer navigation briefly so the outgoing renderer can release WebGL.
  // No second renderer is ever created alongside the first child.
  try{frame?.contentWindow?.postMessage({type:"trialum:agro:dispose"},origin);}catch(_){}
  root.clearTimeout(changeTimer);
  changeTimer=root.setTimeout(()=>{
   if(!overlay||closing||!frame)return;
   room=target;area="main";selectedPortal=null;changingRoom=false;
   const child=frame;
   child.title=target==="warehouse"?
    t("Стовариште за храна","Food Warehouse"):
    target==="garden"?t("Водна градина G-01","Aquatic Garden G-01"):
    t("Агро атриум","Agro Atrium");
   child.src=(target==="warehouse"?
    "./scenes/agro-food-warehouse/warehouse.html":
    target==="garden"?"./scenes/agro-greenhouse/greenhouse.html":
    "./scenes/agro-lobby/lobby.html")+"?hosted=1&inside3d=1&language="+language;
   refreshDock();
   root.dispatchEvent(new root.CustomEvent("trialum:lw:agro:room",{detail:{room}}));
   root.dispatchEvent(new root.CustomEvent("trialum:lw:agro:status",{detail:{stage:"loading"}}));
  },110);
  return true;
 }
 function createDock(){
  const entries=[["↩","back"],["🌿","overview"],["📦",portalIds[0]],
    ["🌱",portalIds[1]],["🧪",portalIds[2]]];
  for(const [icon,key] of entries){
   const b=doc.createElement("button");
   b.className="dockbtn lw-agro-dock-btn";b.type="button";
   b.dataset.agroDock=key; // CSS scopes visibility to active Agro context
   const glyph=doc.createElement("span");glyph.className="emoji";
   glyph.textContent=icon;
   const label=doc.createElement("small");
   b.append(glyph,label);
   b.addEventListener("click",()=>{
    if(!overlay||closing||changingRoom)return;
    if(key==="back"){
     if(room==="warehouse"&&area!=="main"){send("area","main");return;}
     if(room==="warehouse"||room==="garden")switchRoom("atrium");else close();return;
    }
    if(key==="overview"){
     if(room==="warehouse"||room==="garden"){switchRoom("atrium");return;}
     selectedPortal=null;refreshDock();root.dispatchEvent(
      new root.CustomEvent("trialum:lw:agro:portal",{detail:{id:null}})
     );send("reset");return;
    }
    const index=entries.findIndex(item=>item[1]===key);
    if(room==="garden"){
     if(index===2)send("portal",gardenPortals[0]);
     else if(index===3)send("zone","G-01");
     else if(index===4)send("zone","G-02");
     return;
    }
    const id=room==="warehouse"?warehousePortals[index-2]:key;
    send("portal",id);
   });
   dock.appendChild(b);buttons.push(b);
  }
  refreshDock();
 }
 createDock();
 function returnTo3D(){
  if(!overlay)return;
  const returnSource=source;
  root.clearTimeout(changeTimer);
  overlay.remove();overlay=null;frame=null;closing=false;selectedPortal=null;
  changingRoom=false;room="atrium";area="main";
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
  source=request;selectedPortal=null;room="atrium";area="main";changingRoom=false;
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
  root.dispatchEvent(new root.CustomEvent("trialum:lw:agro:room",{detail:{room}}));
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
    acceptCanonicalFood(event.data.world?.food);
    // S7 fix: the warehouse child receives every authoritative snapshot
    // even if the holographic HUD module is not active/hasn't rendered yet.
    // Only the canonical outer parent may supply aquarium state; no 3D child writes.
    const actual=event.data.world?.flora?.aquarium;
    if(Array.isArray(actual)){
     const ids=new Set();
     aquaticPlants=actual.slice(0,4).filter(p=>{
      if(!p||p.species!=="aquaglow"||p.medium!=="aquatic"||p.bedId!=="aquarium"||
         typeof p.id!=="string"||!p.id||p.id.length>100||ids.has(p.id))return false;
      ids.add(p.id);return true;
     }).map(p=>({
      id:p.id,species:"aquaglow",bedId:"aquarium",medium:"aquatic",
      growth:Math.max(0,Math.min(100,Number(p.growth)||0)),
      health:Math.max(0,Math.min(100,Number(p.health)||0)),
      hydration:Math.max(0,Math.min(100,Number(p.hydration)||0)),
      dead:p.dead===true
     }));
    }else aquaticPlants=[];
    if(room==="garden"){send("aquatic",aquaticPlants);send("preview",aquaglowPreview);}
    refreshDock();
   }
   return;
  }
  if(!overlay||closing||!frame||event.source!==frame.contentWindow)return;
  if(event.data.type==="trialum:agro:ready"){
   signal();
   if(room==="warehouse"&&inventory)send("inventory",inventory);
   else if(room==="warehouse")send("inventory",{recipes:[],source:"unavailable",ready:false});
   if(room==="garden")send("aquatic",aquaticPlants);
  }
  if(event.data.type==="trialum:agro:warehouse:area"&&room==="warehouse"){
   const next=event.data.area;
   if(!["main","cold","packing"].includes(next))return;
   area=next;refreshDock();
   root.dispatchEvent(new root.CustomEvent("trialum:lw:agro:area",{detail:{area}}));
  }
  if(event.data.type==="trialum:agro:close")close();
  if(event.data.type==="trialum:agro:warehouse:back"&&room==="warehouse")
   switchRoom("atrium");
  if(event.data.type==="trialum:agro:greenhouse:back"&&room==="garden")
   switchRoom("atrium");
  if(event.data.type==="trialum:agro:selected"){
   const id=event.data.id;
   if(!allowedPortals.has(id)||!(room==="atrium"?portalIds:room==="warehouse"?warehousePortals:gardenPortals).includes(id))return;
   if(room==="atrium"&&id===portalIds[0]){
    switchRoom("warehouse");return;
   }
   // S7: the EXISTING middle Agro door enters a real, EMPTY GLB garden shell.
   if(room==="atrium"&&id===portalIds[1]){
    switchRoom("garden");return;
   }
   if(room==="garden"&&id===gardenPortals[0]){
    switchRoom("atrium");return;
   }
   selectedPortal=id;refreshDock();
   root.dispatchEvent(new root.CustomEvent("trialum:lw:agro:portal",{detail:{id}}));
  }
  if(event.data.type==="trialum:agro:status"){
   const stage=event.data.stage;
   if(!["ready","failed","fallback"].includes(stage))return;
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
  root.clearTimeout(restoreTimer);root.clearTimeout(changeTimer);
  try{frame?.contentWindow?.postMessage({type:"trialum:agro:dispose"},origin);}
  catch(_){}
  overlay?.remove();overlay=null;frame=null;
  doc.body.classList.remove("lw-agro-nested-open");
  report(false);
 });
 root.TrialumAgroSceneBridge=Object.freeze({
  isOpen:()=>Boolean(overlay)&&!closing,
  currentRoute:()=>overlay?source:null,
  currentRoom:()=>overlay?room:null,
  currentArea:()=>overlay?area:null,
  openWarehouseArea:value=>send("area",value),
  setInventory:acceptCanonicalFood,
  enterWarehouse:()=>switchRoom("warehouse"),
  enterGreenhouse:()=>switchRoom("garden"),
  inspectGreenhouseZone:id=>send("zone",id),
  toggleAquaglowPreview:()=>{
   aquaglowPreview=!aquaglowPreview;
   return send("preview",aquaglowPreview)?aquaglowPreview:false;
  },
  isAquaglowPreview:()=>aquaglowPreview,
  currentAquariumCount:()=>aquaticPlants.length,
  selectPortal:id=>send("portal",id),
  setQuality:q=>send("quality",q),
  resetCamera:()=>send("reset"),
  close
 });
})(globalThis);
