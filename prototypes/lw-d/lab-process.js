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
 const pos={
  synthesis:[-2.35,-1.42],analysis:[2.35,-1.42],
  materials:[-2.35,1.32],incubation:[2.35,1.32]
 };
 const [x,z]=pos[p.station];
 const power=p.intensity;
 // The owner asked to see what happens INSIDE the actual machines.
 // All animated geometry is visually constrained to the appropriate chamber.
 // This is a short post-action replay of a REAL engine result, not physics
 // that produces additional nutrients, cells, XP or research progress.
 const tint=p.success?[.45,.96,.69]:[1,.64,.23];
 const glow=p.success?.16+.52*power:.12+.45*power;
 const C=(xx,yy,zz,sx,sy,sz,material=4)=>
  draw(cube,xx,yy,zz,sx,sy,sz,0,tint,glow,material);
 const S=(xx,yy,zz,sx,sy,sz,material=4)=>
  draw(sphere,xx,yy,zz,sx,sy,sz,0,tint,glow,material);
 if(!p.success){
  // In-game failure: localized amber indication at the machine's face, no
  // synthetic success output or full-room particle spray.
  const indicatorZ=p.station==="analysis"?z+.46:p.station==="materials"?z+.66:z+.36;
  for(let k=0;k<3;k++){
   const angle=k*Math.PI*2/3+now*.003;
   S(x+Math.cos(angle)*.17,.22+Math.sin(angle)*.14,indicatorZ,.06,.055,.030);
  }
  C(x,.08,indicatorZ,.18,.024,.025);
  return p;
 }
 if(p.kind==="synthesize"){
  // Actual reactor chamber face, bounded within its glass-like capsule.
  S(x,.20,z+.345,.25,.22,.024);
  for(let k=0;k<11;k++){
   const angle=k*2.40+now*.0022;
   const r=.09+.09*Math.sin(p.phase*Math.PI+k*.6);
   const yy=.20+Math.cos(angle*1.5)*.15;
   S(x+Math.sin(angle)*r,yy,z+.383,.032+.02*power,.032+.02*power,.014);
  }
  // An intake/outtake that visibly starts and stops WITH the action.
  for(let k=0;k<4;k++){
   const amount=(p.phase*.8+k/4)%1;
   S(x-.39+amount*.78,.50,z+.17,.037,.033,.034);
  }
 }else if(p.kind==="analyze"){
  // Scanning the physical sample tray, like a lit instrument gantry.
  const seek=Math.sin(p.phase*Math.PI*4)*.34;
  C(x+seek,-.105,z+.45,.035,.17,.018);
  S(x+seek,-.195,z+.47,.080,.028,.020);
  for(let k=0;k<6;k++){
   const h=.025+.05*Math.abs(Math.sin(p.phase*11+k*.65));
   C(x-.43+k*.15,.02+h,z+.49,.026,h,.014);
  }
 }else if(p.kind==="harvest"){
  // The materials conveyor and sorting tray, NOT arbitrary floating drops.
  for(let k=0;k<9;k++){
   const amount=(p.phase*.9+k/9)%1;
   S(x-.65+amount*1.30,-.08,z+.59,.048,.048,.032);
  }
  C(x+.54,.60,z+.405,.23,.085,.012);
 }else if(p.kind==="grow"){
  // Three capsules pulse with visible paired cell clusters.
  // "Cell division" here is an explanatory visual metaphor only.
  for(let k=0;k<3;k++){
   const cx=x+(k-1)*.62;
   const sep=.02+.06*p.phase;
   S(cx-sep,.23,z+.285,.082,.076,.019);
   S(cx+sep,.23,z+.285,.082,.076,.019);
   S(cx,.39+.04*Math.sin(now*.004+k),z+.289,.055,.051,.018);
  }
 }
 return p;
}
return Object.freeze({TYPES,begin,sample,draw});
});
