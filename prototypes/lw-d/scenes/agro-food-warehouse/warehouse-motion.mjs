/* Original Trialum Food Warehouse S4 visual transport simulation.
 * PURE deterministic scene choreography; no game economy, time rewards,
 * storage, RNG global state, network, pet or inventory side effects.
 */
export const STATIONS=Object.freeze([
 Object.freeze({x:-5.6,z: 5.3,type:"pickup"}),
 Object.freeze({x: 5.6,z: 5.3,type:"pickup"}),
 Object.freeze({x:-5.6,z:-4.7,type:"drop"}),
 Object.freeze({x: 5.6,z:-4.7,type:"drop"}),
 Object.freeze({x:-5.6,z:-8.2,type:"pickup"}),
 Object.freeze({x: 5.6,z:-8.2,type:"drop"})
]);
const MID_LANES=Object.freeze([-2.8,0,2.8]);
const TURN_SPEED=2.2;
const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
const lerpAngle=(a,b,k)=>a+Math.atan2(Math.sin(b-a),Math.cos(b-a))*clamp(k,0,1);
export function createRandom(seed=41027){
 let state=(seed>>>0)||1;
 return ()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return (state>>>0)/4294967296;};
}
export function makeCarrier(id,random=createRandom(41027+id)){
 const pickup=[0,1,4][id%3],drop=[2,3,5][id%3];
 const c={id,random,x:(id-1)*2.1,z:7.1-id*1.15,yaw:Math.PI,
  speed:.38+random()*.24,phase:"travel-pickup",carry:false,dwell:0,
  pickup,drop,waypoints:[],visits:0};
 planNext(c);
 return c;
}
const routeViaLane=(from,to,id)=>{
 const lane=MID_LANES[id%3];
 // Deterministic Manhattan-style aisles and no crossing through wall racks.
 return [{x:lane,z:from.z},{x:lane,z:to.z},{x:to.x,z:to.z}];
};
function planNext(c){
 const station=STATIONS[c.phase==="travel-drop"?c.drop:c.pickup];
 const route=routeViaLane({x:c.x,z:c.z},station,c.id);
 c.waypoints=route.filter(p=>Math.hypot(c.x-p.x,c.z-p.z)>.14);
}
function chooseNext(c){
 const r=c.random;
 if(c.phase==="loading"){
  c.carry=true;c.phase="travel-drop";c.visits++; // visual cargo appears
  const drops=STATIONS.map((p,i)=>p.type==="drop"?i:-1).filter(i=>i>=0);
  c.drop=drops[Math.floor(r()*drops.length)];planNext(c);
 }else{
  c.carry=false;c.phase="travel-pickup";c.visits++; // visual cargo disappears
  const picks=STATIONS.map((p,i)=>p.type==="pickup"?i:-1).filter(i=>i>=0);
  c.pickup=picks[Math.floor(r()*picks.length)];planNext(c);
 }
}
export function stepCarrier(c,delta){
 const dt=clamp(Number(delta)||0,0,.05);
 if(c.phase==="loading"||c.phase==="unloading"){
  c.dwell-=dt;
  if(c.dwell<=0)chooseNext(c);
  return c;
 }
 const target=c.waypoints[0];
 if(!target){
  c.phase=c.phase==="travel-drop"?"unloading":"loading";
  c.dwell=1.15+c.random()*.7;return c;
 }
 const dx=target.x-c.x,dz=target.z-c.z,dist=Math.hypot(dx,dz);
 const heading=Math.atan2(dx,dz);
 c.yaw=lerpAngle(c.yaw,heading,TURN_SPEED*dt);
 if(dist<.09){c.x=target.x;c.z=target.z;c.waypoints.shift();return c;}
 const step=Math.min(dist,c.speed*dt);
 c.x=clamp(c.x+dx/dist*step,-7,7);
 c.z=clamp(c.z+dz/dist*step,-9.3,9.3);
 return c;
}
export function stepDoor(progress,open,delta){
 return clamp(progress+(open?1:-1)*clamp(delta,0,.05)/1.35,0,1);
}
export const smoothDoor=p=>{const x=clamp(p,0,1);return x*x*(3-2*x);};
export const conveyorTravel=(seconds,speed=.25)=>((seconds*speed)%2.9+2.9)%2.9-1.45;
