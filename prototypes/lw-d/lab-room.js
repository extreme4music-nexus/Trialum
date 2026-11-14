/* TRIALUM Living World / LW-D L1
 * Real, spatial 3D laboratory room. Only draws geometry and computes station
 * selection. ZERO persistent game state, network, timers, tokens or AI.
 * All actual progress stays in the original TrialumEngine.
 */
(function(root,factory){
  const api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  root.TrialumLabRoom=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
"use strict";
const STATIONS=Object.freeze([
 Object.freeze({id:"synthesis",action:"synthesize",x:-2.35,y:-.12,z:-1.42}),
 Object.freeze({id:"analysis",action:"analyze",x:2.35,y:-.12,z:-1.42}),
 Object.freeze({id:"materials",action:"harvest",x:-2.35,y:-.12,z:1.32}),
 Object.freeze({id:"incubation",action:"grow",x:2.35,y:-.12,z:1.32})
]);
const station=id=>STATIONS.find(s=>s.id===id)||null;
const clamp=(x,min,max)=>Math.min(max,Math.max(min,Number.isFinite(x)?x:min));
function project(matrix,x,y,z,width,height){
 if(!matrix||matrix.length!==16||width<=0||height<=0)return null;
 const w=matrix[3]*x+matrix[7]*y+matrix[11]*z+matrix[15];
 if(!Number.isFinite(w)||w<=.01)return null;
 const sx=(matrix[0]*x+matrix[4]*y+matrix[8]*z+matrix[12])/w;
 const sy=(matrix[1]*x+matrix[5]*y+matrix[9]*z+matrix[13])/w;
 if(!Number.isFinite(sx)||!Number.isFinite(sy))return null;
 return {x:(sx*.5+.5)*width,y:(1-(sy*.5+.5))*height,depth:w};
}
function pick(matrix,x,y,width,height){
 if(!Number.isFinite(x)||!Number.isFinite(y))return null;
 // Picking zones are individual, visible machine centres rather than the
 // entire canvas. HUD buttons are an equal, accessible alternative.
 const radius=clamp(Math.min(width,height)*.19,43,93);
 let winner=null,best=radius*radius;
 for(const s of STATIONS){
  const p=project(matrix,s.x,s.y,s.z,width,height);
  if(!p||p.x<0||p.x>width||p.y<0||p.y>height)continue;
  const d=(p.x-x)**2+(p.y-y)**2;
  if(d<best){best=d;winner=s;}
 }
 return winner;
}
function drawRoom(draw,cube,sphere,time,selected,stats){
 if(typeof draw!=="function"||!cube||!sphere)return;
 const C=(x,y,z,a,b,c,r,color,glow=0)=>draw(cube,x,y,z,a,b,c,r,color,glow);
 const S=(x,y,z,a,b,c,r,color,glow=0)=>draw(sphere,x,y,z,a,b,c,r,color,glow);
 const t=Number.isFinite(time)?time:0;
 const pulse=Math.sin(t*1.55);
 const softBlue=[.12,.35,.45],navy=[.095,.18,.29],teal=[.13,.64,.62],mint=[.52,.95,.72],gold=[.89,.77,.40];
 // Enclosed laboratory: large real floor, back wall, partial cutaway walls,
 // ceiling beams, windows, columns and lamps. The front/right edge is cut
 // away intentionally to keep all workstations visible from the orbit camera.
 C(0,-1.51,-.12,4.30,.17,3.22,0,[.085,.19,.26]);
 C(0,-1.315,-.12,4.06,.025,3.02,0,[.13,.27,.33]);
 for(let gx=-3.8;gx<=3.81;gx+=.95)
  C(gx,-1.275,-.12,.010,.013,2.95,0,[.18,.39,.40]);
 for(let gz=-2.9;gz<=2.92;gz+=.85)
  C(0,-1.275,gz,4.00,.013,.010,0,[.18,.39,.40]);
 C(0,.25,-3.29,4.30,1.77,.12,0,navy);
 C(-4.24,.23,-.20,.12,1.75,3.08,0,[.075,.24,.30]);
 // Cutaway: short right wall shows depth without hiding the laboratory.
 C(4.22,-.91,-.15,.11,.48,3.08,0,[.10,.28,.34]);
 for(const x of [-4.02,4.02]){
   C(x,.26,-3.12,.16,1.75,.16,0,[.18,.44,.49]);
   C(x,-.35,2.83,.15,.94,.15,0,teal);
 }
 C(0,2.06,-3.24,4.35,.14,.24,0,[.17,.39,.44]);
 C(-4.06,2.05,-.12,.16,.13,3.1,0,[.18,.42,.49]);
 for(const x of [-2.5,0,2.5]){
  C(x,1.84,-2.98,.76,.037,.20,0,[.22,.64,.64]);
  S(x,1.72,-2.85,.23,.055,.19,0,[.63,.96,.77],.5);
 }
 // Observation windows with frames and interior luminous glass.
 for(const x of [-2.42,0,2.42]){
  C(x,.57,-3.12,.91,.69,.03,0,[.19,.50,.59]);
  C(x,.57,-3.075,.79,.57,.02,0,[.06,.31,.42],.17);
  C(x,.57,-3.042,.012,.53,.02,0,[.45,.83,.76],.25);
  C(x,.57,-3.042,.76,.012,.02,0,[.45,.83,.76],.25);
 }
 // Electrical wiring and instrument rails, kept along the perimeter.
 C(0,-.75,-3.03,3.96,.075,.12,0,[.28,.52,.55]);
 for(const z of [-2.8,-1.35,.15,1.65,2.74])
  C(-4.05,-.95,z,.11,.07,.14,0,[.34,.75,.65]);
 // Workstations: a layout with a clear central aisle.
 // Selected station has its own floor lighting and active border.
 for(const st of STATIONS){
  const active=selected===st.id;
  C(st.x,-1.24,st.z,1.31,.034,.92,0,active?[.37,.84,.60]:[.19,.37,.39],active?.43:0);
  for(const sign of [-1,1])
   S(st.x+sign*1.12,-1.17,st.z,.07,.04,.07,0,active?mint:[.31,.61,.63],active?.32:0);
  C(st.x,-1.04,st.z,.99,.14,.69,0,[.15,.31,.38]);
  for(const sx of [-.78,.78]){
   for(const sz of [-.52,.52]) C(st.x+sx,-.69,st.z+sz,.085,.33,.085,0,[.15,.42,.46]);
  }
 }
 // Synthesis: twin reactor vessels, material lines and visible molecular swirl.
 const syn=station("synthesis");
 C(syn.x,-.38,syn.z,1.12,.11,.67,0,[.24,.59,.62]);
 for(const x of [-.53,.53]){
  C(syn.x+x,-.12,syn.z,.25,.41,.25,0,[.21,.55,.60]);
  S(syn.x+x,.22+Math.sin(t*1.3+x)*.05,syn.z,.23,.23,.23,0,[.17,.74,.86],.33);
  C(syn.x+x,.48,syn.z,.30,.055,.30,0,[.56,.83,.77]);
 }
 C(syn.x,.13,syn.z,.10,.26,.62,0,[.43,.79,.76]);
 for(let k=0;k<5;k++){
  const a=k*Math.PI*2/5+t*.35;
  S(syn.x+Math.cos(a)*.42,.14+Math.sin(a*1.5)*.17,syn.z+Math.sin(a)*.33,.052,.052,.052,0,gold,.3);
 }
 // Analysis station: microscope-looking instrument, robotic arm, monitor.
 const an=station("analysis");
 C(an.x,-.41,an.z,1.07,.09,.67,0,[.25,.58,.60]);
 C(an.x-.29,-.08,an.z,.11,.31,.12,0,[.44,.72,.72]);
 C(an.x-.06,.14,an.z-.15,.39,.10,.11,-.33,[.63,.83,.82]);
 C(an.x+.17,.10,an.z+.03,.12,.28,.12,0,[.20,.49,.52]);
 S(an.x+.17,-.18,an.z+.02,.32,.11,.30,0,[.42,.88,.77],.15);
 C(an.x+.57,.12,an.z-.24,.30,.35,.055,-.14,[.10,.34,.44]);
 C(an.x+.57,.12,an.z-.15,.22,.24,.015,-.14,[.17+.07*Math.sin(t),.74,.78],.26);
 for(let k=0;k<4;k++) C(an.x+.42+k*.11,-.28,an.z+.31,.028,.015,.035,0,gold);
 // Resources: three shelves with inventory canisters/crystals.
 const ma=station("materials");
 for(const y of [-.43,.18,.82]){
  C(ma.x,y,ma.z,.88,.065,.50,0,[.24,.55,.60]);
  for(let k=0;k<4;k++){
   const x=ma.x-.64+k*.42;
   C(x,y+.22,ma.z,.15,.20,.15,0,[.17+.07*(k%2),.48,.53]);
   S(x,y+.39,ma.z,.13,.12,.13,0,[.46,.83-(k%3)*.13,.65+.07*k],.12);
  }
 }
 for(const x of [-.75,.75]) C(ma.x+x,.22,ma.z,.07,.95,.07,0,[.16,.43,.48]);
 // Incubator: visible translucent-ish chambers and growth cells.
 const inc=station("incubation");
 C(inc.x,-.37,inc.z,1.14,.12,.70,0,[.20,.51,.53]);
 for(let k=0;k<3;k++){
  const x=inc.x+(k-1)*.62;
  C(x,.18,inc.z,.25,.48,.24,0,[.18,.39,.50]);
  S(x,.25+Math.sin(t*1.1+k)*.09,inc.z,.23,.24,.23,0,[.22,.69,.57],.23);
  S(x,.45+Math.sin(t*1.1+k)*.05,inc.z,.10,.10,.11,0,[.62,.94,.43],.30);
  C(x,.75,inc.z,.30,.045,.30,0,[.51,.80,.74]);
 }
 // No rewards or progress are created by drawing any of this.
 // Real-world resource values are reflected via bounded visual cues.
 const molecules=clamp(Number(stats?.compounds)||0,0,10000);
 const signal=Math.min(6,Math.floor(molecules/40));
 for(let i=0;i<signal;i++)
  S(-.66+i*.27,1.34+Math.sin(t+i)*.025,-1.0,.06,.06,.06,0,mint,.2);
 // Soft moving guide lights along the central corridor.
 for(let i=0;i<7;i++){
  const z=-2.7+i*.78;
  S(0,-1.235,z,.06,.022,.09,0,[.20+.07*(1+pulse),.70,.54],.08);
 }
}
return Object.freeze({STATIONS,station,project,pick,drawRoom});
});
