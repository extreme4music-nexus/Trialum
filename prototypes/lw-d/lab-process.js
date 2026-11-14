/* TRIALUM LW-D L2 — grounded, bounded VISUAL replay for an already executed
 * laboratory action. Not a second simulation, not actual lab science,
 * not additional XP/resources, and never a background timer.
 */
(function(root,factory){
 const api=factory();
 if(typeof module==="object"&&module.exports)module.exports=api;
 root.TrialumLabProcess=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
"use strict";
const TYPES=Object.freeze({
 synthesize:Object.freeze({station:"synthesis",label:"Синтеза",field:"compounds",duration:3100}),
 analyze:Object.freeze({station:"analysis",label:"Анализа",field:"insight",duration:2700}),
 harvest:Object.freeze({station:"materials",label:"Материјали",field:"biomass",duration:2400}),
 grow:Object.freeze({station:"incubation",label:"Раст на клетки",field:"cells",duration:3500})
});
const bounded=(n,lo,hi)=>Math.max(lo,Math.min(hi,Number.isFinite(Number(n))?Number(n):lo));
function begin(kind,success,now,before,after){
 const type=TYPES[kind];if(!type||!Number.isFinite(now))return null;
 const base=bounded(before?.[type.field],0,100000000),end=bounded(after?.[type.field],0,100000000);
 return Object.freeze({
  kind,station:type.station,success:Boolean(success),
  start:now,duration:type.duration,
  change:Math.max(-100000,Math.min(100000,end-base))
 });
}
function sample(event,now){
 if(!event||!TYPES[event.kind]||!Number.isFinite(now))return null;
 const phase=bounded((now-event.start)/event.duration,0,1);
 // Bounded deterministic ease curves; not clocked jobs or resource gains.
 const ramp=Math.sin(Math.PI*phase)**2;
 return Object.freeze({
  station:event.station,kind:event.kind,success:event.success,
  phase,active:phase<1,intensity:event.success?ramp:ramp*.45,
  change:event.change
 });
}
function draw(draw,cube,sphere,event,now){
 const p=sample(event,now);
 if(!p||!p.active||typeof draw!=="function")return p;
 const positions={
  synthesis:[-2.35,.25,-1.42],analysis:[2.35,.22,-1.42],
  materials:[-2.35,.35,1.32],incubation:[2.35,.22,1.32]
 };
 const [x,y,z]=positions[p.station];
 const pulse=p.intensity;
 const tint=p.success?[.45,.96,.69]:[1,.64,.23];
 // Flow visibly starts near the machine, rises and settles at the end.
 const count=p.success?12:6;
 for(let k=0;k<count;k++){
  const a=k*2.39996+(now-event.start)*.00115;
  const fraction=((p.phase*.8+k/count)%1);
  const r=.18+fraction*.66;
  const h=y-.30+fraction*1.15;
  const size=.035+pulse*.025;
  draw(sphere,x+Math.cos(a)*r,h,z+Math.sin(a)*r,size,size,size,0,tint,pulse*.45,4);
 }
 draw(sphere,x,y+.22+pulse*.25,z,.09+pulse*.08,.10+pulse*.08,.09+pulse*.08,0,tint,pulse*.64,4);
 return p;
}
return Object.freeze({TYPES,begin,sample,draw});
});
