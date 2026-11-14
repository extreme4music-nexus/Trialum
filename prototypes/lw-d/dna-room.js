/* TRIALUM LW-D L3.2-A — 3D DNA LAB FOUNDATION
 * READ-ONLY spatial room, not a biological procedure or new DNA gameplay.
 * All authoritatively changing DNA actions remain in the existing Classic DNA tab.
 * Shares existing WebGL2 meshes/materials. No network, storage, AI or timers.
 */
(function(root,factory){
 const api=factory();
 if(typeof module==="object"&&module.exports)module.exports=api;
 root.TrialumDnaRoom=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
"use strict";
const STATIONS=Object.freeze([
 Object.freeze({id:"scan",x:-2.70,y:-.14,z:-.58,label:"Genome scan"}),
 Object.freeze({id:"design",x:2.70,y:-.14,z:-.58,label:"Fictional gene designer"}),
 Object.freeze({id:"lineage",x:0,y:-.14,z:2.16,label:"Evolution lineage"})
]);
const station=id=>STATIONS.find(s=>s.id===id)||null;
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
 const radius=Math.max(34,Math.min(88,Math.min(w,h)*.16));
 let closest=null,distance=radius*radius;
 for(const s of STATIONS){
  const p=project(m,s.x,s.y,s.z,w,h);
  if(!p||p.x<0||p.x>w||p.y<0||p.y>h)continue;
  const d=(p.x-x)**2+(p.y-y)**2;
  if(d<distance){distance=d;closest=s;}
 }
 return closest;
}
function drawRoom(draw,cube,sphere,time,selected,state){
 if(typeof draw!=="function"||!cube||!sphere)return;
 const C=(x,y,z,sx,sy,sz,c,material=1,glow=0,angle=0)=>
  draw(cube,x,y,z,sx,sy,sz,angle,c,glow,material);
 const S=(x,y,z,sx,sy,sz,c,material=2,glow=0)=>
  draw(sphere,x,y,z,sx,sy,sz,0,c,glow,material);
 const t=Number.isFinite(time)?time:0;
 const light=[.50,.94,.99],aqua=[.24,.72,.79],violet=[.69,.44,.94],steel=[.41,.64,.71],floor=[.19,.35,.42],deep=[.065,.16,.25],gold=[.98,.77,.40];
 const ready=state?.designerUnlocked===true;
 // ROOM. Real 3D cutaway architecture, repeated modular panels, roof ribs.
 C(0,-1.52,-.05,4.82,.13,3.65,deep);
 C(0,-1.38,-.05,4.72,.025,3.55,floor,3);
 C(0,.35,-3.68,4.82,1.78,.11,steel,3);
 C(-4.72,.24,-.12,.10,1.72,3.42,steel,3);
 C(4.72,.24,-.12,.10,1.72,3.42,steel,3);
 C(0,-1.06,3.44,4.82,.22,.12,aqua);
 for(const x of [-4.2,-2.8,-1.4,0,1.4,2.8,4.2]){
  C(x,-1.335,-.08,.012,.009,3.48,aqua,4,.08);
  C(x,1.92,-3.38,.035,.13,.33,steel);
 }
 for(const z of [-3.30,-2.20,-1.10,0,1.10,2.20,3.30]){
  C(0,-1.335,z,4.65,.009,.012,aqua,4,.08);
 }
 for(const x of [-3.65,0,3.65]){
  C(x,1.93,-3.44,1.04,.07,.21,steel);
  S(x,1.75,-3.22,.39,.06,.16,light,4,.44);
 }
 for(const x of [-3.10,0,3.10]){
  C(x,.47,-3.53,1.02,.72,.025,[.12,.39,.53],2,.14);
  C(x,.47,-3.49,.055,.66,.027,light,4,.10);
  C(x,.47,-3.49,.96,.035,.027,light,4,.12);
 }
 // MAIN CHAMBER: prominent sealed fictional DNA helix, not an editing operation.
 const z=-1.32;
 C(0,-.94,z,1.05,.26,1.02,steel,1);
 C(0,1.73,z,1.02,.20,1.01,steel,1);
 for(const y of [-.70,1.52]){
  for(let k=0;k<10;k++){
   const a=k*Math.PI*2/10;
   S(Math.cos(a)*.90,y,z+Math.sin(a)*.90,.105,.052,.105,light,4,.30);
  }
 }
 for(const x of [-.92,.92]){
  for(const zz of [z-.83,z+.83])C(x,.40,zz,.045,1.27,.045,steel);
 }
 // Low-poly paired strands and rungs: spin subtly at foreground-frame time.
 for(let k=0;k<17;k++){
  const y=-.53+k*.121,a=k*.57+t*.13;
  const x1=Math.cos(a)*.47,x2=-x1,z1=z+Math.sin(a)*.41,z2=z-Math.sin(a)*.41;
  S(x1,y,z1,.10,.10,.10,aqua,4,.30);
  S(x2,y,z2,.10,.10,.10,violet,4,.30);
  C(0,y,(z1+z2)/2,Math.abs(x1)+.06,.018,.018,light,4,.10);
 }
 S(0,1.94,z,.65,.045,.61,light,4,.20);
 // Distinct bench stations. Entry and interaction are available even when
 // designer or progression actions are locked in the ORIGINAL DNA controller.
 for(const st of STATIONS){
  const active=selected===st.id;
  const accent=st.id==="design"?(ready?aqua:gold):st.id==="lineage"?violet:light;
  C(st.x,-1.27,st.z,1.00,.025,.76,active?light:accent,4,active?.30:.08);
  C(st.x,-.81,st.z,.77,.32,.58,deep);
  C(st.x,-.46,st.z,.83,.045,.64,steel,1);
  for(const sx of [-.60,.60])for(const zz of [-.43,.43])
   C(st.x+sx,-.91,st.z+zz,.055,.33,.055,steel);
  C(st.x,-.08,st.z-.34,.54,.34,.045,[.11,.40,.53],2,.12);
  C(st.x,-.06,st.z-.283,.43,.23,.012,accent,4,active?.40:.12);
  S(st.x,.13,st.z-.13,.17,.17,.17,accent,4,.15+.06*Math.sin(t));
  for(const dx of [-.42,.42])S(st.x+dx,-.41,st.z+.27,.08,.11,.08,light,2,.10);
 }
 // Peripheral machine conduits: visible connections between work zones.
 for(const x of [-4.25,4.25]){
  C(x,1.46,-.15,.055,.055,3.10,steel);
  for(const zz of [-2.65,-1.10,.45,2.10])
   S(x,1.46,zz,.11,.11,.11,aqua,4,.16);
 }
 // Visual readiness, never a game unlock or state mutation.
 S(2.70,.47,-.58,.17,.17,.17,ready?aqua:gold,4,ready?.42:.12);
}
return Object.freeze({STATIONS,station,project,pick,drawRoom});
});
