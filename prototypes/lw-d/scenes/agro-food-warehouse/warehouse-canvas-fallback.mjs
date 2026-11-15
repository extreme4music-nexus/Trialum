/* True non-WebGL, non-GLB emergency warehouse canvas.
 * Distinct drawing surface to work after WebGL context allocation fails.
 */
import {createRandom,makeCarrier,stepCarrier,stepDoor,smoothDoor} from "./warehouse-motion.mjs";
export class WarehouseCanvasFallback{
 constructor(canvas,{onStatus=()=>{},onSelect=()=>{}}={}){
  this.canvas=canvas;this.ctx=canvas.getContext("2d");
  if(!this.ctx)throw Error("Neither WebGL nor 2D canvas available");
  this.onStatus=onStatus;this.onSelect=onSelect;
  this.raf=0;this.last=0;this.visible=true;this.disposed=false;this.door=0;this.doorTarget=false;
  this.carrier=makeCarrier(0,createRandom(41027));
  canvas.hidden=false;
  this.pointer=event=>{
   const rect=canvas.getBoundingClientRect();
   if((event.clientX-rect.left)/rect.width>.32&&
     (event.clientX-rect.left)/rect.width<.68){
    this.doorTarget=!this.doorTarget;this.onSelect({
     id:"ground.agro.warehouse.door-main",role:"main",canEnter:true,isOpen:this.doorTarget
    });
   }
  };
  canvas.addEventListener("pointerup",this.pointer);
  this.resume();
 }
 setVisible(value){this.visible=Boolean(value);if(this.visible)this.resume();else this.pause();}
 resume(){if(!this.disposed&&this.visible&&!document.hidden&&!this.raf){
  this.last=0;this.raf=requestAnimationFrame(t=>this.frame(t));}}
 pause(){if(this.raf)cancelAnimationFrame(this.raf);this.raf=0;this.last=0;}
 toggleDoor(){this.doorTarget=!this.doorTarget;}
 frame(time){
  this.raf=0;if(!this.visible||this.disposed||document.hidden)return;
  const delta=this.last?Math.min((time-this.last)/1000,.05):0;this.last=time;
  stepCarrier(this.carrier,delta);
  this.door=stepDoor(this.door,this.doorTarget,delta);
  const el=this.canvas,ctx=this.ctx;
  const dpr=Math.min(window.devicePixelRatio||1,1.3);
  const w=Math.max(1,Math.round(el.clientWidth*dpr)),h=Math.max(1,Math.round(el.clientHeight*dpr));
  if(el.width!==w||el.height!==h){el.width=w;el.height=h;}
  ctx.clearRect(0,0,w,h);
  const rect=(color,x,y,width,height)=>{ctx.fillStyle=color;ctx.fillRect(x*w,y*h,width*w,height*h);};
  const polygon=(color,points)=>{ctx.fillStyle=color;ctx.beginPath();
   points.forEach(([x,y],i)=>i?ctx.lineTo(x*w,y*h):ctx.moveTo(x*w,y*h));
   ctx.closePath();ctx.fill();};
  // Single-color low-cost architectural perspective, solid opaque ceiling.
  rect("#355e60",0,0,1,1);
  polygon("#c5dcd2",[[0,0],[1,0],[.74,.29],[.26,.29]]);
  polygon("#b4c8bb",[[0,1],[1,1],[.75,.34],[.25,.34]]);
  polygon("#8daea9",[[0,0],[.27,.29],[.27,.73],[0,1]]);
  polygon("#9ebfba",[[1,0],[.73,.29],[.73,.73],[1,1]]);
  rect("#d2d6be",.27,.29,.46,.065); // solid back lintel
  // Side alcoves and storage racks, NOT a fake standalone GLB success.
  for(const side of [0,1])for(let i=0;i<3;i++){
   const x=side?(.79+i*.061):(.12-i*.042);
   rect("#20545c",x,.42+i*.07,.082,.23-i*.024);
   rect("#e6c886",x,.43+i*.07,.082,.009);
  }
  const gap=smoothDoor(this.door)*.085;
  rect("#e1bd73",.431,.38,.138,.22);
  rect("#326a6c",.436-gap,.385,.061,.21);
  rect("#326a6c",.503+gap,.385,.061,.21);
  rect("#94ffe4",.476,.368,.048,.012);
  // Small conveyor with moving crate across its visible top surface.
  rect("#194552",.17,.74,.29,.045);rect("#d7bd7e",.17,.747,.29,.008);
  const cx=.18+((time*.000035)%.25);
  rect("#658a78",cx,.71,.04,.033);
  // Tiny autonomous carrier travelling safely within the room aisle.
  const px=.5+this.carrier.x/25,pz=.81-(this.carrier.z+8)/110;
  rect("#204852",px-.025,pz-.015,.05,.03);
  rect("#e4c783",px-.019,pz-.023,.038,.015);
  if(this.carrier.carry)rect("#8ed7ae",px-.013,pz-.037,.026,.014);
  rect("#1d5059",0,.96,1,.04);
  this.onStatus("NON-GLB 2D fallback · moving door/conveyor/carrier · game data safe");
  this.raf=requestAnimationFrame(t=>this.frame(t));
 }
 dispose(){this.disposed=true;this.pause();this.canvas.removeEventListener("pointerup",this.pointer);}
}
