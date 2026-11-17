/* Trialum Living Spaces v0.1 — pure, deterministic, offline-safe scene edit kernel.
 * Shared verbatim between Trialum and Trialum-3D-Builder. No AI/network/gameplay writes.
 */
(function(root,factory){const api=factory();if(typeof module==="object"&&module.exports)module.exports=api;root.TrialumLivingSpaces=api;})(typeof globalThis!=="undefined"?globalThis:this,function(){
"use strict";
const ACTIONS=["place","move","rotate","redecorate","remove","restore"];
const MAX_ITEMS=500, MAX_HISTORY=50;
const finite=(v)=>typeof v==="number"&&Number.isFinite(v);
const clean=(s,max=80)=>typeof s==="string"?s.trim().slice(0,max):"";
const copy=v=>JSON.parse(JSON.stringify(v));
function create(ownerId="local-player",roomId="home-main"){
 if(!clean(ownerId)||!clean(roomId))throw Error("Owner and room required");
 return {schemaVersion:1,ownerId:clean(ownerId),roomId:clean(roomId),revision:0,items:[],history:[],undone:[],createdAt:0};
}
function validate(state){if(!state||state.schemaVersion!==1||!Array.isArray(state.items)||state.items.length>MAX_ITEMS||!clean(state.ownerId)||!clean(state.roomId))throw Error("Invalid room");
 const seen=new Set();for(const item of state.items){
  if(!item||!clean(item.id)||seen.has(item.id)||!clean(item.assetId)||!Array.isArray(item.position)||item.position.length!==3||!item.position.every(finite)||!finite(item.rotationY)||!Array.isArray(item.size)||item.size.length!==3||!item.size.every(x=>finite(x)&&x>0&&x<=20))throw Error("Invalid item");
  seen.add(item.id);
 }return true;
}
function permissions(actor,state,item,action){
 if(!actor||!clean(actor.id)||!ACTIONS.includes(action))return false;
 if(actor.role==="builder")return true; // only an explicitly trusted native/editor context supplies this role
 if(actor.id!==state.ownerId)return false;
 if(actor.role==="player")return item?.editable!==false;
 if(actor.role==="pet")return item?.petEditable===true&&item?.petOwnerId===actor.petId&&!!clean(actor.petId)&&item?.editable!==false&&action!=="remove"&&action!=="place"&&action!=="restore";
 return false;
}
function intersects(a,b){return a.position[0]<b.position[0]+b.size[0]-1e-6&&a.position[0]+a.size[0]>b.position[0]+1e-6&&a.position[2]<b.position[2]+b.size[2]-1e-6&&a.position[2]+a.size[2]>b.position[2]+1e-6;}
function edit(state,actor,action,payload,options={}){
 validate(state);if(!ACTIONS.includes(action))throw Error("Unsupported action");
 const next=copy(state), p=payload||{}, ix=next.items.findIndex(i=>i.id===p.id),old=next.items[ix];
 if(!permissions(actor,state,old||p,action))throw Error("Permission denied");
 if(action==="place"){
  if(ix>=0||next.items.length>=MAX_ITEMS)throw Error("Duplicate or full room");
  const item={id:clean(p.id),assetId:clean(p.assetId),position:p.position,rotationY:p.rotationY??0,size:p.size||[1,1,1],editable:p.editable!==false,petEditable:p.petEditable===true,petOwnerId:clean(p.petOwnerId),label:clean(p.label),surface:clean(p.surface)||"floor"};
  if(!item.id||!item.assetId)throw Error("Invalid model");
  next.items.push(item);
 }else{
  if(!old)throw Error("Item missing");
  if(action==="remove")next.items.splice(ix,1);
  else if(action==="move")old.position=p.position;
  else if(action==="rotate")old.rotationY=p.rotationY;
  else if(action==="redecorate"){if(!clean(p.assetId))throw Error("Invalid asset");old.assetId=clean(p.assetId);if(p.size)old.size=p.size;}
  else if(action==="restore")throw Error("Restore through undo only");
 }
 validate(next);
 const bounds=options.bounds||{width:12,depth:12,height:4};
 for(const item of next.items){
  const [x,y,z]=item.position,[w,h,d]=item.size;
  if(x<0||z<0||y<0||x+w>bounds.width||z+d>bounds.depth||y+h>bounds.height)throw Error("Outside owned room bounds");
  if(options.allowedAssets&&!options.allowedAssets.includes(item.assetId))throw Error("Asset not allowed");
 }
 const touched=next.items.find(i=>i.id===p.id);
 if(touched&&options.checkCollisions!==false&&next.items.some(i=>i.id!==touched.id&&i.surface===touched.surface&&intersects(i,touched)))throw Error("Collision");
 // Do not allow editing a furniture object to mutate food stock, pet state or scripts.
 const before={items:copy(state.items),revision:state.revision};
 next.history=(Array.isArray(state.history)?state.history:[]).slice(-MAX_HISTORY+1);next.history.push(before);
 next.undone=[];next.revision=(state.revision||0)+1;
 return next;
}
function undo(state,actor){
 validate(state);if(!actor||!(actor.role==="builder"||(actor.role==="player"&&actor.id===state.ownerId)))throw Error("Permission denied");
 if(!state.history?.length)return state;
 const next=copy(state),prev=next.history.pop();
 next.undone=(next.undone||[]);next.undone.push({items:copy(next.items),revision:next.revision});
 next.items=prev.items;next.revision++;validate(next);return next;
}
function redo(state,actor){
 validate(state);if(!actor||!(actor.role==="builder"||(actor.role==="player"&&actor.id===state.ownerId)))throw Error("Permission denied");
 if(!state.undone?.length)return state;
 const next=copy(state),future=next.undone.pop();
 next.history.push({items:copy(next.items),revision:next.revision});
 next.items=future.items;next.revision++;validate(next);return next;
}
function petSuggestion(state,pet,action,payload,options){
 // Pet is only a proposal source. Same permission, bounds and collision gate as human edits.
 return edit(state,{id:pet?.ownerId,petId:pet?.id,role:"pet"},action,payload,options);
}
return Object.freeze({create,validate,edit,undo,redo,petSuggestion,permissions,ACTIONS:Object.freeze(ACTIONS.slice()),MAX_ITEMS});
});
