/* TRIALUM / LW-D L3.1
 * Procedural near-field scientific INSTRUMENT MODELS for the original 3D lab.
 * Geometry and animation only; authoritative game simulation stays in
 * TrialumEngine and the existing post-action visual result pipeline.
 * Material numbers: 0 matte, 1 brushed metal, 2 glass-like solid, 3 ceramic,
 * 4 emissive. "Glass" is stylized opaque polymer, not physical transparency.
 */
(function(root,factory){
 const api=factory();
 if(typeof module==="object"&&module.exports)module.exports=api;
 root.TrialumLabDetail=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
"use strict";
const POS=Object.freeze({
 synthesis:Object.freeze([-2.35,-1.42]),
 analysis:Object.freeze([2.35,-1.42]),
 materials:Object.freeze([-2.35,1.32]),
 incubation:Object.freeze([2.35,1.32])
});
const PALETTE=Object.freeze({
 steel:Object.freeze([.53,.66,.71]),shadow:Object.freeze([.12,.25,.36]),
 glass:Object.freeze([.18,.68,.77]),screen:Object.freeze([.13,.76,.81]),
 copper:Object.freeze([.93,.69,.31]),mint:Object.freeze([.54,.95,.71]),
 violet:Object.freeze([.76,.53,.95]),amber:Object.freeze([.98,.71,.32]),
 coral:Object.freeze([.96,.55,.39]),blue:Object.freeze([.33,.70,.97])
});
const bounded=(v,lo,hi)=>Math.max(lo,Math.min(hi,Number.isFinite(Number(v))?Number(v):lo));
function drawMachines(draw,cube,sphere,time,selected,stats){
 if(typeof draw!=="function"||!cube||!sphere)return;
 const t=Number.isFinite(time)?time:0;
 const C=(x,y,z,sx,sy,sz,color,material=1,glow=0,angle=0)=>
   draw(cube,x,y,z,sx,sy,sz,angle,color,glow,material);
 const S=(x,y,z,sx,sy,sz,color,material=2,glow=0)=>
   draw(sphere,x,y,z,sx,sy,sz,0,color,glow,material);
 const shine=id=>selected===id ? 0.45 : 0.16;
 // Mechanical services across the rear wall: piping, valve housings and
 // clearly separated electrical ducts, not decorative floating cubes.
 for(const y of [1.11,.86]){
  C(0,y,-2.86,3.90,.038,.048,y>1?PALETTE.steel:PALETTE.copper);
  for(const x of [-3.7,-2.2,-.1,2.2,3.7]){
   S(x,y,-2.78,.085,.08,.07,PALETTE.shadow,1);
   S(x,y,-2.70,.045,.045,.04,y>1?PALETTE.mint:PALETTE.amber,4,.15);
  }
 }
 // Four floor-level focused spot indicators. All are READ ONLY.
 for(const [id,[x,z]] of Object.entries(POS)){
  const on=selected===id;
  C(x,-1.22,z+.85,.88,.020,.060,on?PALETTE.mint:PALETTE.steel,4,on?.20:.03);
  for(const side of [-1,1]){
   S(x+side*.82,-1.18,z+.82,.055,.045,.055,on?PALETTE.mint:PALETTE.glass,4,on?.35:.12);
  }
 }
 // REACTOR — multi-chamber apparatus with an enclosed central reaction core,
 // interlocked steel frame, curved transparent-looking vessel, working pipe
 // manifold, copper induction coil and slowly turning stirrer.
 {
  const [x,z]=POS.synthesis;
  C(x,-.30,z,.76,.16,.48,PALETTE.shadow);
  C(x,.07,z,.47,.61,.35,PALETTE.glass,2,.08);
  S(x,.19,z,.44,.49,.35,PALETTE.glass,2,.12+Math.sin(t*1.1)*.045);
  S(x,.22,z+.27,.28,.24,.04,[.12,.83,.86],4,shine("synthesis")*.42);
  for(const yy of [-.22,.48]){
   C(x,yy,z,.54,.052,.39,PALETTE.steel,1);
   for(const side of [-1,1])
    S(x+side*.50,yy,z,.068,.065,.075,PALETTE.copper,1);
  }
  for(const side of [-1,1]){
   const rx=x+side*.80;
   C(rx,-.08,z,.14,.45,.19,PALETTE.steel,1);
   S(rx,.42,z,.23,.23,.22,PALETTE.shadow,1);
   S(rx,.42,z+.13,.17,.16,.085,PALETTE.glass,2,.22);
   C(x+side*.49,.13,z,.34,.05,.082,PALETTE.copper,1);
   for(let i=0;i<7;i++){
    const a=i*Math.PI*2/7;
    S(rx+Math.cos(a)*.24,.09+Math.sin(a)*.26,z+.10,.033,.04,.034,PALETTE.copper,1);
   }
  }
  // The rotating spindle is inside the glass-like chamber.
  C(x,.19,z+.05,.05,.30,.05,PALETTE.steel,1);
  for(let q=0;q<3;q++){
   const theta=t*.6+q*Math.PI*2/3;
   S(x+Math.cos(theta)*.21,.18+q*.072,z+Math.sin(theta)*.16,.067,.045,.053,PALETTE.mint,4,.13);
  }
  // Injector valves, two distinct sample cups and brass gauges.
  for(const side of [-1,1]){
   S(x+side*.35,.64,z,.12,.06,.12,PALETTE.copper,1);
   C(x+side*.35,.69,z,.035,.075,.06,PALETTE.steel,1);
   S(x+side*.36,-.36,z+.40,.17,.075,.16,PALETTE.shadow,1);
   S(x+side*.36,-.29,z+.40,.09,.10,.09,PALETTE.violet,2,.12);
  }
 }
 // ANALYSIS — microscope, translating scanner, sample stage, articulated
 // lens, two readouts with living waveform instead of a static panel.
 {
  const [x,z]=POS.analysis;
  C(x,-.40,z,1.08,.09,.67,PALETTE.steel,1);
  C(x,-.27,z-.24,.77,.045,.18,PALETTE.shadow,1);
  for(const side of [-1,1]){
   C(x+side*.76,.12,z-.27,.075,.56,.07,PALETTE.steel,1);
   S(x+side*.76,.69,z-.27,.10,.08,.10,PALETTE.copper,1);
  }
  const scanX=x+Math.sin(t*.72)*.30;
  C(scanX,.47,z-.24,.36,.06,.13,PALETTE.steel,1);
  S(scanX,.30,z-.22,.17,.16,.17,PALETTE.shadow,1);
  S(scanX,.14,z-.21,.12,.07,.12,PALETTE.blue,2,.16);
  C(scanX,-.05,z-.21,.022,.14,.022,PALETTE.mint,4,.30+Math.sin(t)*.14);
  S(x,-.25,z+.02,.40,.06,.30,PALETTE.steel,1);
  S(x,-.17,z+.02,.27,.048,.23,PALETTE.violet,2,.10);
  for(const side of [-1,1]){
   C(x+side*.54,-.04,z+.36,.18,.32,.03,PALETTE.shadow,1);
   C(x+side*.54,-.05,z+.395,.14,.23,.01,side<0?PALETTE.blue:PALETTE.violet,4,.12);
  }
  const signal=bounded(stats?.insight,0,100000)/100000;
  for(let i=0;i<9;i++){
   const wave=.038+.095*Math.abs(Math.sin(t*.95+i*.62+signal));
   C(x-.52+i*.13,-.28+wave,z+.45,.025,wave,.023,PALETTE.mint,4,.12);
  }
  // Mechanical rotary controls on the front edge.
  for(const xx of [-.50,.42]){
   S(x+xx,-.28,z+.55,.105,.11,.09,PALETTE.shadow,1);
   S(x+xx,-.28,z+.64,.048,.055,.028,PALETTE.copper,1);
  }
 }
 // MATERIALS — distinct stocked shelves, a weigh scale, sample canisters
 // and belt conveyor. These are aesthetic and never mint inventory.
 {
  const [x,z]=POS.materials;
  C(x,-.29,z,.94,.15,.49,PALETTE.shadow,1);
  C(x,-.16,z+.04,.79,.035,.39,PALETTE.steel,1);
  for(let i=0;i<5;i++){
   const px=x-.55+i*.27;
   C(px,-.10,z+.20,.115,.11,.16,PALETTE.shadow,1);
   S(px,-.02,z+.20,.085,.073,.09,[.35+i*.10,.84-i*.07,.67+i*.03],2,.10);
  }
  for(const level of [0,.47]){
   C(x,level,z-.31,.91,.045,.12,PALETTE.steel,1);
   for(let k=0;k<5;k++){
    const xx=x-.62+k*.31;
    C(xx,level+.12,z-.31,.115,.12,.115,PALETTE.glass,2,.04);
    S(xx,level+.245,z-.31,.095,.075,.095,k%2?PALETTE.amber:PALETTE.blue,4,.08);
   }
  }
  for(const side of [-1,1])
   C(x+side*.82,.25,z-.32,.065,.67,.065,PALETTE.steel,1);
  // Moving conveyor with a real, visible weighed sample.
  for(let i=0;i<8;i++){
   const p=(i/8+t*.08)%1;
   S(x-.76+p*1.5,-.14,z+.52,.075,.075,.075,i%3===0?PALETTE.violet:PALETTE.amber,2,.02);
  }
  C(x+.51,.25,z+.30,.13,.34,.08,PALETTE.steel,1);
  C(x+.50,.61,z+.34,.30,.16,.04,PALETTE.shadow,1);
  C(x+.50,.61,z+.39,.23,.10,.015,PALETTE.mint,4,.18);
 }
 // INCUBATION — three translucent-looking vertical biocapsules with
 // visible luminous culture clusters, status rings, breathing pumps and
 // low-power growth chamber detailing. NOT a biological simulation.
 {
  const [x,z]=POS.incubation;
  C(x,-.33,z,1.10,.17,.60,PALETTE.steel,1);
  for(let k=0;k<3;k++){
   const px=x+(k-1)*.62;
   C(px,.12,z,.24,.52,.24,PALETTE.glass,2,.08);
   S(px,.20,z+.18,.18,.32,.065,PALETTE.glass,2,.14);
   for(const yy of [-.39,.62]){
    S(px,yy,z,.31,.053,.30,PALETTE.steel,1);
    for(const edge of [-1,1]){
      S(px+edge*.29,yy,z,.042,.046,.065,PALETTE.copper,1);
    }
   }
   C(px,.75,z,.035,.16,.04,PALETTE.steel,1);
   S(px,.86,z,.10,.055,.10,PALETTE.mint,4,.25);
   for(let c=0;c<3;c++){
    const phase=t*.39+c*2.05+k;
    S(px+Math.cos(phase)*.085,.13+c*.14+Math.sin(phase)*.03,z+.15,
      .078,.075,.075,PALETTE.mint,4,.12);
   }
   // Fluid filter, curved-looking tubing and individual pressure dial.
   S(px,.57,z-.25,.15,.05,.09,PALETTE.copper,1);
   S(px,.57,z-.30,.07,.047,.027,PALETTE.shadow,1);
  }
 }
}
return Object.freeze({POS,drawMachines,PALETTE});
});
