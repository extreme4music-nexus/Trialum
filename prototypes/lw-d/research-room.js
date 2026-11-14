/* TRIALUM LW-D L3.5 — fifth, complete fictional Research Laboratory.
 * Visual-only geometry, input targeting and parent-result pulse. NEVER grants
 * insight, technology levels, materials, fauna, credits, XP or save changes.
 * Original E.study/E.upgradeLab/E.longplayInvent/E.longplayBuildMaterial owns all.
 */
(function(root,factory){
 const api=factory();
 if(typeof module==="object"&&module.exports)module.exports=api;
 root.TrialumResearchRoom=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
"use strict";
const STATIONS=Object.freeze([
 Object.freeze({id:"disciplines",x:-2.85,y:-.13,z:-.98,label:"Field observatory"}),
 Object.freeze({id:"upgrade",x:2.82,y:-.13,z:-.95,label:"Technology elevator"}),
 Object.freeze({id:"discoveries",x:0,y:-.13,z:2.24,label:"Discovery synthesizer"}),
 Object.freeze({id:"archive",x:0,y:-.13,z:-1.08,label:"Research archive"})
]);
const station=id=>STATIONS.find(s=>s.id===id)||null;
function project(m,x,y,z,w,h){
 if(!m||m.length!==16||!Number.isFinite(w)||!Number.isFinite(h)||w<=0||h<=0)return null;
 const cw=m[3]*x+m[7]*y+m[11]*z+m[15];
 if(!Number.isFinite(cw)||cw<=.01)return null;
 const nx=(m[0]*x+m[4]*y+m[8]*z+m[12])/cw,
  ny=(m[1]*x+m[5]*y+m[9]*z+m[13])/cw;
 if(!Number.isFinite(nx)||!Number.isFinite(ny))return null;
 return {x:(nx*.5+.5)*w,y:(1-(ny*.5+.5))*h,depth:cw};
}
function pick(m,x,y,w,h){
 if(!Number.isFinite(x)||!Number.isFinite(y))return null;
 let best=Math.pow(Math.max(33,Math.min(72,Math.min(w,h)*.14)),2),chosen=null;
 for(const st of STATIONS){
  const p=project(m,st.x,st.y,st.z,w,h);
  if(!p||p.x<0||p.x>w||p.y<0||p.y>h)continue;
  const d=(p.x-x)**2+(p.y-y)**2;
  if(d<best){best=d;chosen=st;}
 }
 return chosen;
}
function drawRoom(draw,cube,sphere,time,selected,state,quality="balanced",effect=null){
 if(typeof draw!=="function"||!cube||!sphere)return;
 const C=(x,y,z,w,h,l,t,material=1,glow=0,angle=0)=>
  draw(cube,x,y,z,w,h,l,angle,t,glow,material);
 const S=(x,y,z,w,h,l,t,material=2,glow=0)=>
  draw(sphere,x,y,z,w,h,l,0,t,glow,material);
 const t=Number.isFinite(time)?time:0,rich=quality==="rich",
  metal=[.36,.60,.70],glass=[.22,.43,.65],dark=[.065,.16,.26],
  floor=[.15,.28,.41],cyan=[.32,.80,.99],violet=[.63,.48,.96],
  mint=[.36,.94,.79],gold=[.98,.75,.40],white=[.86,.96,1.0],
  pulse=.5+.5*Math.sin(t*.95);
 // Real 3D room with visible three-wall open-front architecture.
 C(0,-1.53,-.14,4.90,.15,3.66,dark);
 C(0,-1.40,-.14,4.76,.03,3.57,floor,3);
 C(0,.25,-3.70,4.90,1.83,.15,metal,1);
 for(const x of [-4.80,4.80])C(x,.22,-.14,.10,1.73,3.54,metal,1);
 C(0,-1.08,3.48,4.88,.19,.09,glass,1);
 for(const z of [-3.18,-2.08,-.98,.12,1.22,2.32,3.22])
  C(0,-1.356,z,4.68,.009,.015,cyan,4,.065);
 for(const x of [-4.18,-2.79,-1.40,0,1.40,2.79,4.18])
  C(x,-1.356,-.14,.015,.009,3.49,violet,4,.075);
 for(const x of [-3.56,0,3.56]){
  C(x,1.90,-3.42,.88,.12,.26,metal,1);
  S(x,1.70,-3.30,.30,.054,.15,white,4,.30);
 }
 // Central fictional knowledge column: floating data rings and a core.
 C(0,-1.19,-1.20,.97,.21,.90,metal);
 C(0,.42,-1.20,.72,1.33,.72,glass,2,.11);
 C(0,1.76,-1.20,.95,.17,.94,metal);
 S(0,.32+Math.sin(t*.55)*.09,-1.20,.39,.47,.38,violet,4,.17+pulse*.13);
 for(let i=0;i<(rich?14:8);i++){
  const a=i*Math.PI*2/(rich?14:8)+t*.13;
  S(Math.cos(a)*.64,.25+Math.sin(a*2+t*.62)*.57,-1.20+Math.sin(a)*.58,
    .09,.12,.08,i%2?cyan:mint,4,.21);
 }
 for(const y of (rich?[-.49,.24,.91]:[.24]))
  for(let n=0;n<10;n++){
   const a=n*Math.PI/5+t*.035;
   C(Math.cos(a)*.87,y,-1.20+Math.sin(a)*.87,.15,.018,.032,
     n%2?violet:cyan,4,.13,-a);
  }
 // Four machines: five research disciplines, lab-tier upgrade, discovery dome,
 // and authentic inventory/archive. Their actions originate in original engine.
 for(const st of STATIONS){
  const active=selected===st.id;
  const color=st.id==="disciplines"?cyan:st.id==="upgrade"?gold:
    st.id==="discoveries"?mint:violet;
  const central=st.id==="archive";
  const y=central?-.28:-.40;
  if(!central){
   C(st.x,-1.18,st.z,1.10,.13,.73,active?white:metal);
   C(st.x,-.77,st.z,.91,.31,.66,dark);
   C(st.x,y,st.z,.97,.05,.69,metal);
   C(st.x,.08,st.z-.35,.57,.41,.04,glass,2,.11);
   C(st.x,.11,st.z-.312,.48,.32,.014,color,4,active?.42:.13);
  }
  if(st.id==="disciplines"){
   for(let n=0;n<5;n++)
    S(st.x-.49+n*.25,-.12+(n%2)*.15,st.z+.20,.10,.13,.10,
      n%2?mint:cyan,4,.20);
  }else if(st.id==="upgrade"){
   for(let n=0;n<5;n++)C(st.x,-.35+n*.20,st.z+.25,.23,.06,.20,
      n<Math.min(5,Math.max(1,Number(state?.level)||1)%6)?gold:glass,4,.17);
  }else if(st.id==="discoveries"){
   for(let n=0;n<5;n++){
    const a=n*Math.PI*2/5+t*.09;
    S(st.x+Math.cos(a)*.43,-.13+Math.sin(a)*.11,
      st.z+Math.sin(a)*.32,.13,.13,.13,mint,4,.20);
   }
  }else{
   // suspended archive datapads around the column without occluding lab.
   for(const x of [-.76,.76])for(let n=0;n<3;n++){
    C(st.x+x,.30+n*.35,st.z,.06,.12,.35,violet,4,.19);
   }
  }
  C(st.x,-1.31,st.z+.35,central?.62:.97,.012,.024,color,4,active?.36:.11);
 }
 // Saved research knowledge and inventory are meters only, never rewards.
 const k=Math.max(0,Number(state?.knowledge)||0),level=Math.max(1,Number(state?.level)||1);
 for(let n=0;n<Math.min(8,Math.floor(Math.log10(k+1)*2));n++)
  S(-1.50+n*.30,-1.30,3.06,.09,.065,.09,cyan,4,.16);
 for(let n=0;n<Math.min(7,Math.floor(level/3));n++)
  C(2.15+n*.34,-1.32,3.02,.13,.013,.13,gold,4,.18);
 // Only a confirmed original engine response lights a station briefly.
 const elapsed=effect&&Number.isFinite(effect.started)?t-effect.started:Infinity;
 const flash=elapsed>=0&&elapsed<2.3?1-elapsed/2.3:0;
 if(flash>0){
  const color=effect.ok?mint:[.98,.26,.34];
  const mapped={study:STATIONS[0],upgrade:STATIONS[1],invent:STATIONS[2],craft:STATIONS[3]};
  const st=mapped[effect.op]||STATIONS[3];
  for(let n=0;n<6;n++){
   const a=n*Math.PI/3+t*4,rad=.19+(1-flash)*.47;
   S(st.x+Math.cos(a)*rad,.22+Math.sin(a*2)*.19,
     st.z+Math.sin(a)*rad,.09+flash*.04,.11+flash*.04,.09+flash*.04,
     color,4,flash*.57);
  }
  S(0,.37,-1.20,.37+flash*.13,.10,.37+flash*.13,color,4,flash*.30);
 }
 // Overhead rails and subtle research-circuit devices.
 for(const x of [-4.10,4.10]){
  C(x,1.32,-.35,.046,.05,3.03,metal);
  for(const z of (rich?[-2.55,-1.0,.52,1.95]:[-2.55,.52]))
   S(x,1.31,z,.09,.09,.09,cyan,4,.18);
 }
}
return Object.freeze({STATIONS,station,project,pick,drawRoom});
});
