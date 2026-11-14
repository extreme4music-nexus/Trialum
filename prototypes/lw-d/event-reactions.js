/* LW-D L3.7: authoritative engine RESULT -> ephemeral presentation signal.
 * It never requests operations, writes saves, grants rewards or polls timers.
 */
(function(root,factory){
 const api=factory(root);
 if(typeof module==="object"&&module.exports)module.exports=api;
 root.TrialumLWEventReactions=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(root){
 "use strict";
 const events=Object.freeze({
  "trialum:lw:process-result":Object.freeze({room:"basic",ops:["synthesize","analyze","harvest","grow"],field:"kind"}),
  "trialum:lw:dna-process-result":Object.freeze({room:"dna",ops:["design","transform"],field:"op"}),
  "trialum:lw:food-process-result":Object.freeze({room:"foodlab",ops:["craft","feed"],field:"op"}),
  "trialum:lw:flora-process-result":Object.freeze({room:"floralab",ops:["invent","plant"],field:"op"}),
  "trialum:lw:research-process-result":Object.freeze({room:"research",ops:["study","upgrade","invent","craft"],field:"op"})
 });
 function normalizeResult(type,detail){
  const spec=events[type];if(!spec||!detail||typeof detail!=="object")return null;
  const operation=String(detail[spec.field]||"");
  if(!spec.ops.includes(operation)||typeof detail.ok!=="boolean")return null;
  // Never infer success from a visual/state change: the original engine decides.
  return Object.freeze({
   scene:"lab",room:spec.room,operation,ok:detail.ok===true,
   // Selected entity is for visual feedback only, not an instruction.
   species:typeof detail.species==="string"?detail.species.slice(0,32):"",
   recipe:typeof detail.recipe==="string"?detail.recipe.slice(0,32):""
  });
 }
 if(root.addEventListener&&root.dispatchEvent&&typeof root.CustomEvent==="function"){
  for(const type of Object.keys(events))root.addEventListener(type,e=>{
   const feedback=normalizeResult(type,e.detail);
   if(feedback)root.dispatchEvent(new root.CustomEvent("trialum:lw:engine-feedback",{detail:feedback}));
  });
 }
 return Object.freeze({events,normalizeResult});
});