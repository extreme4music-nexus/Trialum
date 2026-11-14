/* Trialum LW-D L3.4-A: modular fictional flora research room.
 * Spatial rendering, touch selection and read-only real-world flora indicators.
 * NEVER creates plants, unlocks blueprints, edits habitats, persists data or runs
 * a separate biology/economy simulation. Existing E.inventPlant/E.plant own it.
 */
(function(root,factory){
 const api=factory();
 if(typeof module==="object"&&module.exports)module.exports=api;
 root.TrialumFloraRoom=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
"use strict";
const STATIONS=Object.freeze([
 Object.freeze({id:"seedbank",x:-2.83,y:-.14,z:-1.05,label:"Genetic seed bank"}),
 Object.freeze({id:"scanner",x:2.82,y:-.14,z:-.95,label:"Flora analyzer"}),
 Object.freeze({id:"growth",x:0,y:-.14,z:2.22,label:"Habitat greenhouse"})
]);
const station=id=>STATIONS.find(x=>x.id===id)||null;
function project(m,x,y,z,w,h){
 if(!m||m.length!==16||!Number.isFinite(w)||!Number.isFinite(h)||w<=0||h<=0)return null;
 const cw=m[3]*x+m[7]*y+m[11]*z+m[15];
 if(!Number.isFinite(cw)||cw<=.01)return null;
 const nx=(m[0]*x+m[4]*y+m[8]*z+m[12])/cw;
 const ny=(m[1]*x+m[5]*y+m[9]*z+m[13])/cw;
 if(!Number.isFinite(nx)||!Number.isFinite(ny))return null;
 return {x:(nx*.5+.5)*w,y:(1-(ny*.5+.5))*h,depth:cw};
}
function pick(m,x,y,w,h){
 if(!Number.isFinite(x)||!Number.isFinite(y))return null;
 const threshold=Math.max(34,Math.min(82,Math.min(w,h)*.16));
 let best=threshold*threshold,selected=null;
 for(const st of STATIONS){
  const p=project(m,st.x,st.y,st.z,w,h);
  if(!p||p.x<0||p.x>w||p.y<0||p.y>h)continue;
  const d=(p.x-x)*(p.x-x)+(p.y-y)*(p.y-y);
  if(d<best){best=d;selected=st;}
 }
 return selected;
}
function drawRoom(draw,cube,sphere,time,selected,state,quality="balanced"){
 if(typeof draw!=="function"||!cube||!sphere)return;
 const C=(x,y,z,w,h,l,t,material=1,glow=0,a=0)=>
  draw(cube,x,y,z,w,h,l,a,t,glow,material);
 const S=(x,y,z,w,h,l,t,material=2,glow=0)=>
  draw(sphere,x,y,z,w,h,l,0,t,glow,material);
 const clock=Number.isFinite(time)?time:0;
 const rich=quality==="rich",pulse=.5+.5*Math.sin(clock*.75);
 const wall=[.24,.45,.49],floor=[.12,.27,.31],steel=[.39,.63,.67],
  mint=[.31,.94,.69],aqua=[.27,.81,.82],glass=[.25,.61,.64],
  dark=[.07,.19,.25],white=[.87,.96,.89],leaf=[.28,.72,.43],
  gold=[.93,.78,.36];
 // Three wall cutaway mobile architecture reused from the DNA and food rooms.
 C(0,-1.52,-.12,4.89,.15,3.65,dark);
 C(0,-1.40,-.12,4.70,.027,3.55,floor,3);
 C(0,.25,-3.68,4.89,1.82,.13,wall,1);
 for(const x of [-4.78,4.78])C(x,.21,-.11,.10,1.73,3.52,wall,1);
 C(0,-1.10,3.42,4.85,.20,.08,aqua,1);
 for(const z of [-3.10,-2.05,-1.0,.05,1.10,2.15,3.10])
  C(0,-1.353,z,4.62,.008,.015,mint,4,.055);
 for(const x of [-4.15,-2.77,-1.39,0,1.39,2.77,4.15])
  C(x,-1.351,-.11,.014,.008,3.47,aqua,4,.045);
 for(const x of [-3.40,0,3.40]){
  C(x,1.90,-3.39,.85,.12,.25,steel);
  S(x,1.72,-3.21,.33,.052,.15,white,4,.34);
 }
 // Central grow chamber: original fictional seed form, gently moving leaves.
 // It represents the view only; stages, maturity and oxygen come from s.habitats.
 C(0,-1.18,-1.18,1.14,.17,1.08,steel);
 C(0,.44,-1.18,.79,1.37,.79,glass,2,.10);
 C(0,1.80,-1.18,.96,.16,.91,steel);
 for(const x of [-.78,.78])for(const z of [-1.92,-.45])
  C(x,.39,z,.046,1.26,.048,white);
 C(0,-.82,-1.18,.37,.27,.38,dark);
 C(0,-.29,-1.18,.11,.39,.10,leaf);
 S(0,.06,-1.18,.26,.27,.23,mint,4,.17+pulse*.15);
 for(let i=0;i<(rich?8:4);i++){
  const a=i*6.283/(rich?8:4)+clock*.025;
  S(Math.cos(a)*.39,.04+Math.sin(a+clock*.7)*.12,
    -1.18+Math.sin(a)*.34,.10,.18,.09,i%2?leaf:mint,4,.18);
 }
 for(const y of (rich?[-.60,.30,1.10]:[.30]))
  for(let i=0;i<8;i++){
   const a=i*Math.PI/4;
   C(Math.cos(a)*.90,y,-1.18+Math.sin(a)*.90,.14,.012,.03,
    i%2?aqua:mint,4,.21,-a);
  }
 // Selected existing habitat and flower count affect ONLY physical indicators.
 const count=Math.max(0,Math.min(6,Math.floor(Number(state?.planted)||0)));
 const oxygen=Math.max(0,Math.min(100,Number(state?.oxygen)||0));
 for(let i=0;i<count;i++)S(-.92+i*.38,-1.27,2.91,.10,.08,.10,mint,4,.20);
 for(let i=0;i<Math.floor(oxygen/20);i++)
  C(2.74+i*.28,-1.28,2.90,.10,.012,.12,aqua,4,.19);
 // Three station platforms, distinctive apparatus and touch targets.
 for(const st of STATIONS){
  const focus=selected===st.id,back=st.id==="growth";
  const color=st.id==="seedbank"?gold:st.id==="scanner"?aqua:mint;
  C(st.x,-1.18,st.z,1.08,.14,.70,focus?white:steel);
  C(st.x,-.72,st.z,.93,.35,.62,dark);
  C(st.x,-.40,st.z,.98,.05,.70,steel);
  for(const x of [-.73,.73])C(st.x+x,-.89,st.z,.09,.30,.56,wall);
  C(st.x,.06,st.z-.35,.58,.40,.035,glass,2,.07);
  C(st.x,.12,st.z-.316,.49,.32,.014,color,4,focus?.37:.13);
  if(back){
   for(const dx of [-.46,0,.46])for(const dz of [-.15,.30]){
    C(st.x+dx,-.18,st.z+dz,.15,.08,.13,dark);
    C(st.x+dx,-.01,st.z+dz,.035,.17,.035,leaf);
    S(st.x+dx,.17,st.z+dz,.12,.14,.11,mint,4,.18);
   }
  }else if(st.id==="seedbank"){
   for(const dx of [-.40,0,.40])
    S(st.x+dx,-.10,st.z+.17,.13,.18,.13,gold,4,.12);
  }else{
   S(st.x,-.10,st.z+.17,.27,.16,.23,aqua,4,.14);
   C(st.x,-.05,st.z+.17,.035,.24,.25,white,4,.17);
  }
  C(st.x,-1.312,st.z+.37,.96,.011,.020,color,4,focus?.30:.11);
 }
 // Opaque wall conduits and botanical displays avoid expensive transparency.
 for(const x of [-4.11,4.11]){
  C(x,1.30,-.34,.048,.05,3.00,steel);
  for(const z of (rich?[-2.52,-1.02,.48,1.98]:[-2.52,.48]))
   S(x,1.29,z,.09,.09,.09,mint,4,.13);
 }
}
return Object.freeze({STATIONS,station,project,pick,drawRoom});
});
