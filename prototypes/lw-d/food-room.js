/* Trialum LW-D L3.3-A: NUTRITION LABORATORY foundation.
 * Spatial visuals and read-only food inventory. No recipe production in this
 * module: the original E.craftFood / E.feedPrepared remain authoritative.
 */
(function(root,factory){
  const api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  root.TrialumFoodRoom=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
"use strict";
const STATIONS=Object.freeze([
 Object.freeze({id:"synthesis",x:-2.75,y:-.13,z:-.88,label:"Nutrient synthesizer"}),
 Object.freeze({id:"analysis",x:2.72,y:-.13,z:-.87,label:"Nutrition analyzer"}),
 Object.freeze({id:"storage",x:0,y:-.13,z:2.18,label:"Portion storage"})
]);
const station=id=>STATIONS.find(x=>x.id===id)||null;
function project(m,x,y,z,w,h){
 if(!m||m.length!==16||w<=0||h<=0)return null;
 const cw=m[3]*x+m[7]*y+m[11]*z+m[15];
 if(!Number.isFinite(cw)||cw<=.01)return null;
 const nx=(m[0]*x+m[4]*y+m[8]*z+m[12])/cw;
 const ny=(m[1]*x+m[5]*y+m[9]*z+m[13])/cw;
 if(!Number.isFinite(nx)||!Number.isFinite(ny))return null;
 return {x:(nx*.5+.5)*w,y:(1-(ny*.5+.5))*h,depth:cw};
}
function pick(m,x,y,w,h){
 if(!Number.isFinite(x)||!Number.isFinite(y))return null;
 const r=Math.max(34,Math.min(86,Math.min(w,h)*.16));
 let found=null,best=r*r;
 for(const st of STATIONS){
  const p=project(m,st.x,st.y,st.z,w,h);
  if(!p||p.x<0||p.x>w||p.y<0||p.y>h)continue;
  const ds=(p.x-x)**2+(p.y-y)**2;
  if(ds<best){best=ds;found=st;}
 }
 return found;
}
function drawRoom(draw,cube,sphere,time,selected,state,quality="balanced"){
 if(typeof draw!=="function"||!cube||!sphere)return;
 const C=(x,y,z,w,h,l,t,material=1,glow=0,angle=0)=>
  draw(cube,x,y,z,w,h,l,angle,t,glow,material);
 const S=(x,y,z,w,h,l,t,material=2,glow=0)=>
  draw(sphere,x,y,z,w,h,l,0,t,glow,material);
 const t=Number.isFinite(time)?time:0,rich=quality==="rich";
 const steel=[.35,.56,.67],ceramic=[.59,.81,.82],dark=[.075,.18,.25],
       floor=[.21,.32,.38],amber=[.95,.70,.31],mint=[.30,.91,.70],
       cyan=[.31,.75,.94],blue=[.22,.42,.60],white=[.86,.98,.95];
 // Open-front 3D room: modular tiles, cutaway walls, roof and ceiling lights.
 C(0,-1.52,-.16,4.89,.14,3.67,dark);
 C(0,-1.38,-.16,4.74,.025,3.57,floor,3);
 C(0,.29,-3.69,4.89,1.80,.13,steel,1);
 for(const x of [-4.78,4.78])C(x,.24,-.14,.10,1.72,3.53,steel,1);
 C(0,-1.10,3.46,4.89,.20,.10,cyan,1);
 for(const z of [-3.25,-2.10,-.95,.20,1.35,2.5,3.25])
  C(0,-1.346,z,4.69,.009,.012,ceramic,4,.07);
 for(const x of [-4.30,-2.87,-1.44,0,1.44,2.87,4.30])
  C(x,-1.343,-.14,.012,.009,3.53,ceramic,4,.04);
 for(const x of [-3.52,0,3.52]){
  C(x,1.90,-3.33,.80,.10,.27,steel);
  S(x,1.73,-3.21,.33,.05,.15,white,4,.37);
 }
 // Central raised nutrient mixing vat with moving fictional bioreactor sample.
 C(0,-1.09,-1.17,1.08,.16,1.00,steel);
 C(0,.55,-1.17,.85,1.45,.75,blue,2,.09);
 C(0,1.72,-1.17,1.03,.17,.97,steel);
 for(const x of [-.88,.88])for(const z of [-1.88,-.46])
  C(x,.36,z,.045,1.32,.045,ceramic);
 for(let k=0;k<(rich?12:6);k++){
  const a=k*Math.PI*2/(rich?12:6)+t*.05;
  S(Math.cos(a)*.58,.18+Math.sin(a+t)*.08,-1.17+Math.sin(a)*.49,
    .115,.13,.115,k%2?amber:mint,4,.23);
 }
 // Fictional floating energy pellets are visual only: never modify inventory.
 for(let k=0;k<(rich?8:4);k++){
  const a=k*6.283/(rich?8:4)+t*.12;
  S(Math.sin(a)*.48,-.45+(k%3)*.30,-1.17+Math.cos(a)*.43,
    .08,.07,.09,mint,4,.22);
 }
 // Three genuinely spatial stations: mixing, scanner and food inventory.
 for(const st of STATIONS){
  const active=selected===st.id;
  const accent=st.id==="synthesis"?amber:st.id==="analysis"?cyan:mint;
  const tray=st.id==="storage";
  C(st.x,-1.15,st.z,1.08,.13,.71,active?white:steel,1);
  C(st.x,-.70,st.z,.94,.36,.66,dark);
  C(st.x,-.39,st.z,.98,.045,.70,ceramic,1);
  for(const x of [-.77,.77])C(st.x+x,-.90,st.z,.10,.32,.55,steel);
  C(st.x,.02,st.z-.32,.57,.43,.035,blue,2,.08);
  C(st.x,.06,st.z-.284,.48,.31,.012,accent,4,active?.38:.12);
  if(tray){
   for(const x of [-.42,0,.42])for(const z of [-.18,.30])
    C(st.x+x,-.23,st.z+z,.14,.16,.14,mint,2,.11);
  }else if(st.id==="synthesis"){
   for(const x of [-.41,.41])
    S(st.x+x,-.11,st.z+.24,.15,.20,.16,amber,4,.15);
  }else{
   S(st.x,-.15,st.z+.13,.29,.14,.25,cyan,4,.14);
  }
  C(st.x,-1.305,st.z+.36,1.01,.008,.024,accent,4,active?.35:.13);
 }
 // Suspended conduits run along walls rather than blocking the camera.
 for(const x of [-4.19,4.19]){
  C(x,1.35,-.35,.045,.05,3.02,steel,1);
  for(const z of (rich?[-2.53,-1.03,.47,1.97]:[-2.53,.47]))
   S(x,1.35,z,.09,.09,.09,amber,4,.18);
 }
 // Stock status is visual only: no inventory changes or new recipe authority.
 const total=Math.max(0,Math.floor(Number(state?.totalStock)||0));
 for(let k=0;k<Math.min(6,total);k++){
  C(-.90+k*.36,-1.30,2.81,.13,.014,.15,mint,4,.19);
 }
}
return Object.freeze({STATIONS,station,project,pick,drawRoom});
});
