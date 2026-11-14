/* Trialum LW-D L3.0: five physical laboratory entrances and central hall.
 * Spatial geometry + hit testing ONLY; never creates/modifies game progress.
 * L3.0 is a visual circulation hub. Unbuilt rooms open their original feature.
 */
(function(root,factory){
 const api=factory();
 if(typeof module==="object"&&module.exports)module.exports=api;
 root.TrialumLabComplex=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
"use strict";
const ROOMS=Object.freeze([
 Object.freeze({id:"basic",tab:null,x:-4.35,y:-.12,z:-3.58,color:Object.freeze([.28,.90,.73]),ready:true}),
 Object.freeze({id:"dna",tab:"dna",x:-2.15,y:-.12,z:-3.58,color:Object.freeze([.82,.51,.94]),ready:false}),
 Object.freeze({id:"foodlab",tab:"food",x:0,y:-.12,z:-3.58,color:Object.freeze([.96,.73,.37]),ready:false}),
 Object.freeze({id:"floralab",tab:"plants",x:2.15,y:-.12,z:-3.58,color:Object.freeze([.46,.91,.54]),ready:false}),
 Object.freeze({id:"research",tab:"research",x:4.35,y:-.12,z:-3.58,color:Object.freeze([.43,.75,.98]),ready:false})
]);
const getRoom=id=>ROOMS.find(r=>r.id===id)||null;
function project(matrix,x,y,z,width,height){
 if(!matrix||matrix.length!==16||width<=0||height<=0)return null;
 const clipW=matrix[3]*x+matrix[7]*y+matrix[11]*z+matrix[15];
 if(!Number.isFinite(clipW)||clipW<=.01)return null;
 const nx=(matrix[0]*x+matrix[4]*y+matrix[8]*z+matrix[12])/clipW;
 const ny=(matrix[1]*x+matrix[5]*y+matrix[9]*z+matrix[13])/clipW;
 if(!Number.isFinite(nx)||!Number.isFinite(ny))return null;
 return {x:(nx*.5+.5)*width,y:(1-(ny*.5+.5))*height,depth:clipW};
}
function pick(matrix,x,y,width,height){
 if(!Number.isFinite(x)||!Number.isFinite(y))return null;
 let candidate=null,best=Math.pow(Math.max(30,Math.min(70,Math.min(width,height)*.13)),2);
 for(const room of ROOMS){
  const p=project(matrix,room.x,room.y,room.z,width,height);
  if(!p||p.x<0||p.y<0||p.x>width||p.y>height)continue;
  const d=(p.x-x)**2+(p.y-y)**2;
  if(d<best){best=d;candidate=room;}
 }
 return candidate;
}
function drawRoom(draw,cube,sphere,time){
 if(typeof draw!=="function"||!cube||!sphere)return;
 const C=(x,y,z,sx,sy,sz,color,glow=0,material=0)=>draw(cube,x,y,z,sx,sy,sz,0,color,glow,material);
 const S=(x,y,z,sx,sy,sz,color,glow=0,material=0)=>draw(sphere,x,y,z,sx,sy,sz,0,color,glow,material);
 const t=Number.isFinite(time)?time:0,pulse=.5+.5*Math.sin(t*1.35);
 const wall=[.16,.28,.39],floor=[.24,.36,.41],metal=[.41,.64,.68];
 // An actual open floorplan with geometric depth: three side walls and a
 // deliberate front cutaway so the camera sees all five entrance stations.
 C(0,-1.52,.25,6.25,.16,4.72,[.09,.18,.27]);
 C(0,-1.33,.25,6.04,.036,4.53,floor,0,3);
 C(0,.24,-4.26,6.25,1.79,.19,wall,0,3);
 for(const x of [-6.14,6.14])C(x,.25,-.08,.12,1.76,4.10,wall,0,3);
 // Cutaway near edge, to indicate a believable corridor without occluding doors.
 C(0,-1.10,4.68,6.25,.23,.10,[.17,.35,.43],0,1);
 for(const z of [-3.65,-2.4,-1.1,.25,1.6,3.0,4.1]){
  C(0,-1.25,z,5.89,.015,.015,[.28,.50,.54],0,1);
 }
 for(let x=-5.7;x<=5.8;x+=.82)C(x,-1.25,.25,.015,.01,4.37,[.28,.50,.54],0,1);
 for(const x of [-5.85,-3.25,0,3.25,5.85]){
  C(x,1.74,-3.93,.17,.13,.20,metal,0,1);
  S(x,1.53,-3.62,.16,.065,.15,[.84,.98,.89],.48,4);
 }
 // Floor central path, lit guide lines, plus a display/wayfinding island.
 C(0,-1.27,1.45,.70,.011,2.05,[.09,.42,.44],.04,4);
 for(let i=0;i<8;i++){
  C(0,-1.235,-2.50+i*.86,.16,.012,.13,[.46,.94,.79],.1+pulse*.18,4);
 }
 C(0,-.65,3.26,1.21,.57,.18,[.12,.43,.55],.06,1);
 C(0,-.08,3.26,1.04,.035,.15,[.48,.85,.81],.25,4);
 S(0,.40,3.24,.27,.27,.27,[.32,.94,.85],.19+pulse*.17,4);
 // Five distinct full-height doors, clearly separated by real wall piers.
 for(let i=0;i<ROOMS.length;i++){
  const room=ROOMS[i],x=room.x,z=room.z;
  const active=room.ready;
  // Upper light rail: futuristic glass/steel arch and threshold.
  C(x,-.18,z-.12,.88,1.34,.115,[.08,.17,.28],0,1);
  for(const edge of [-.87,.87])C(x+edge,-.12,z,.065,1.44,.14,metal,0,1);
  C(x,1.31,z,.94,.105,.19,room.color,.16,1);
  C(x,-1.16,z+.38,.86,.045,.45,room.color,.11,4);
  if(active){
   // The already-implemented room is shown as an open doorway/corridor.
   C(x,-.08,z-.23,.74,1.07,.02,[.10,.47,.50],.06,2);
   C(x,-.88,z-.19,.69,.06,.025,[.33,.89,.76],.20,4);
  }else{
   // Future rooms are deliberately visibly locked, not fictitious functional rooms.
   C(x-.34,-.12,z-.015,.38,1.10,.035,[.18,.30,.41],0,1);
   C(x+.34,-.12,z-.015,.38,1.10,.035,[.17,.28,.39],0,1);
   C(x,-.17,z+.038,.19,.25,.035,room.color,.10+pulse*.07,2);
  }
  // Very distinct hanging halo and animated status LEDs.
  for(const direction of [-1,1]){
   S(x+direction*.66,1.06,z+.18,.075,.075,.075,active?[.53,.98,.74]:room.color,.12+Math.sin(t*.7+i)*.08,4);
  }
  C(x,.99,z+.23,.72,.14,.015,[.15,.31,.43],.04,2);
  // A readable architectural number of the door is represented by i+1 tiny
  // glowing blocks. Actual room NAME is always provided by accessible HUD.
  for(let k=0;k<=i;k++)C(x-.35+k*.15,1.0,z+.252,.044,.04,.012,room.color,.15,4);
 }
 // Corridor interior columns and ceiling wiring provide a room's scale.
 for(const x of [-6.0,6.0]){
  C(x,.10,3.70,.18,1.28,.19,metal,0,1);
  S(x,1.47,3.70,.13,.12,.13,[.59,.92,.78],.28,4);
 }
}
return Object.freeze({ROOMS,getRoom,project,pick,drawRoom});
});
