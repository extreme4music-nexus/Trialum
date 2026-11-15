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
 const basicMetric=Object.freeze({synthesize:"compounds",analyze:"insight",harvest:"biomass",grow:"cells"});
 const integerReceipt=seq=>Number.isSafeInteger(seq)&&seq>0?seq:null;
 const signedDelta=(a,b)=>{
  if(typeof a!=="number"||typeof b!=="number"||!Number.isFinite(a)||!Number.isFinite(b))return 0;
  return Math.max(-100000,Math.min(100000,Math.trunc(b-a)));
 };
 // Pure presentation tracker. Only engine result receipts can enter; a saved
 // state refresh, app resume or room navigation is NEVER a new receipt.
 function createTracker(){
  let latest=0,active=null;
  function take(feedback,context){
   const seq=integerReceipt(feedback?.seq),now=context?.now;
   if(seq===null||seq<=latest||!Number.isFinite(now))return false;
   latest=seq; // Even an offscreen event is consumed, never queued for replay.
   active=null;
   if(context.visible!==true||context.scene!==feedback.scene||
      context.room!==feedback.room)return false;
   active=Object.freeze({feedback,started:now,
    duration:context.reducedMotion===true?1100:2600});
   return true;
  }
  function current(now,context){
   if(!active||!Number.isFinite(now)||context?.visible!==true||
      context.scene!==active.feedback.scene||context.room!==active.feedback.room||
      now<active.started||now-active.started>=active.duration){
    active=null;return null;
   }
   return active;
  }
  return Object.freeze({take,current,clear:()=>{active=null;},lastReceipt:()=>latest});
 }
 function normalizeResult(type,detail){
  const spec=events[type];if(!spec||!detail||typeof detail!=="object")return null;
  const operation=String(detail[spec.field]||"");
  if(!spec.ops.includes(operation)||typeof detail.ok!=="boolean")return null;
  // Never infer success from a visual/state change: the original engine decides.
  return Object.freeze({
   scene:"lab",room:spec.room,operation,ok:detail.ok===true,
   seq:integerReceipt(detail.seq),
   // Basic exact in/out metric is authoritative; failure never claims gain.
   change:spec.room==="basic"&&detail.ok===true
    ?signedDelta(detail.before?.[basicMetric[operation]],detail.after?.[basicMetric[operation]]):0,
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
 return Object.freeze({events,normalizeResult,createTracker});
});