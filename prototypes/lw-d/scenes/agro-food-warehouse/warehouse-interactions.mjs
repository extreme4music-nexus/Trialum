/* Trialum S5: interactive annex/camera and engine-backed stock visuals.
 * The original game owns food counts and all persistence, NEVER this module.
 */
import * as THREE from "three";
import {buildWarehouseAnnexes} from "./warehouse-rooms.mjs";
import {stepDoor,smoothDoor} from "./warehouse-motion.mjs";
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const targets=Object.freeze({
 main:{camera:[0,2.6,8.3],look:[0,2,-5]},
 cold:{camera:[-5.8,2.3,-12.8],look:[-5.8,1.8,-16.35]},
 packing:{camera:[5.8,2.3,-12.8],look:[5.8,1.8,-16.35]},
 atrium:{camera:[0,2.1,-12.8],look:[0,2,-16.5]}
});
function withName(root,exact){
 const matches=[];root.traverse(n=>{
  if((n.userData?.semanticPart||n.name)===exact)matches.push(n);
 });return matches;
}
export class WarehouseInteractions{
 constructor(engine,{onArea=()=>{},onNavigate=()=>{}}={}){
  this.engine=engine;this.onArea=onArea;this.onNavigate=onNavigate;
  this.area="main";this.move=null;this.exiting=false;this.finished=false;
  this.roof=null;this.stock={recipes:[]};this.markers=null;
  this.sideProgress={cold:0,packing:0};this.sideLeaves={cold:[],packing:[]};
 }
 attach(group,models,shell){
  const annexes=buildWarehouseAnnexes(THREE,this.engine.data,models);
  group.add(annexes.root);this.roof=annexes.root;
  for(const area of ["cold","packing"]){
   this.sideLeaves[area]=[
    ...withName(shell,"door.subroom."+area+".left"),
    ...withName(shell,"door.subroom."+area+".right")
   ];
  }
  this.drawStock();
 }
 setInventory(food){
  if(!food||!Array.isArray(food.recipes))return;
  this.stock={recipes:food.recipes.slice(0,40).map(r=>({
   id:String(r.id||"").slice(0,32),name:String(r.name||"").slice(0,68),
   stock:clamp(Math.floor(Number(r.stock)||0),0,100000000),
   rack:clamp(Math.floor(Number(r.rack)||0),0,100000000),
   cold:clamp(Math.floor(Number(r.cold)||0),0,100000000),
   packing:clamp(Math.floor(Number(r.packing)||0),0,100000000),
   hand:clamp(Math.floor(Number(r.hand)||0),0,100000000)
  }))};
  this.drawStock();
 }
 drawStock(){
  const parent=this.engine.root;if(!parent)return;
  if(this.markers){
   parent.remove(this.markers);
   this.markers.traverse(n=>{
    if(n.isMesh){n.geometry.dispose();n.material?.map?.dispose();n.material?.dispose();}
   });
  }
  const group=new THREE.Group();group.name="warehouse.authoritative-stock-projection";
  const places=[
   {id:"rack",x:-6.3,y:1.0,z:3.7},
   {id:"cold",x:-5.8,y:.85,z:-15.35},
   {id:"packing",x:5.8,y:.85,z:-15.35}
  ];
  const colors=[0x85b8a7,0xa9c5c0,0xd1bd8e,0x78b5c8];
  places.forEach(place=>{
   const total=this.stock.recipes.reduce((n,r)=>n+r[place.id],0);
   let count=0;
   this.stock.recipes.forEach((r,j)=>{
    for(let k=0;k<Math.min(4,r[place.id])&&count<18;k++){
     const mesh=new THREE.Mesh(new THREE.BoxGeometry(.35,.30,.39),
      new THREE.MeshStandardMaterial({color:colors[j%colors.length],roughness:.5}));
     mesh.name="canonical."+place.id+"."+r.id+"."+k;
     mesh.position.set(place.x+(count%5-2)*.47,place.y+Math.floor(count/5)*.34,
      place.z+Math.floor(count/10)*.44);
     group.add(mesh);count++;
    }
   });
   // Actual saved-stock number on holographic shelf label, not a fabricated crate.
   if(typeof document!=="undefined"){
    const canvas=document.createElement("canvas");canvas.width=512;canvas.height=192;
    const ctx=canvas.getContext("2d");
    if(ctx){
     ctx.fillStyle="#124351";ctx.fillRect(0,0,512,192);
     ctx.strokeStyle="#79e4d3";ctx.lineWidth=4;ctx.strokeRect(3,3,506,186);
     ctx.fillStyle="#effff1";ctx.font="bold 27px sans-serif";
     ctx.fillText(place.id.toUpperCase()+" · ORIGINAL STOCK",18,50);
     ctx.font="bold 58px sans-serif";ctx.fillText(String(total),20,130);
     ctx.font="20px sans-serif";
     ctx.fillText(this.stock.recipes.filter(r=>r[place.id]>0).length+" recipes",155,130);
     const tex=new THREE.CanvasTexture(canvas);
     const face=new THREE.Mesh(new THREE.PlaneGeometry(1.85,.7),
      new THREE.MeshBasicMaterial({map:tex,transparent:true,side:THREE.DoubleSide}));
     face.name="stock-screen."+place.id;
     face.position.set(place.x,2.12,place.z-.85);group.add(face);
    }
   }
  });
  parent.add(group);this.markers=group;
 }
 changeArea(area){
  if(!["main","cold","packing"].includes(area)||this.exiting)return false;
  if(this.area===area&&!this.move)return true;
  const e=this.engine;if(!e.camera||!e.controls)return false;
  const to=targets[area];
  this.move={area,elapsed:0,duration:1.4,
   start:e.camera.position.clone(),lookStart:e.controls.target.clone(),
   end:new THREE.Vector3(...to.camera),lookEnd:new THREE.Vector3(...to.look)};
  e.controls.enabled=false;return true;
 }
 exitToAtrium(){
  if(this.exiting||this.finished)return;
  if(this.area!=="main"){this.changeArea("main");return;}
  this.exiting=true;this.engine.manualDoor=true; // slides before camera advances
 }
 step(dt){
  if(!Number.isFinite(dt)||dt<=0)return;
  const e=this.engine;
  for(const area of ["cold","packing"]){
   const opening=this.area===area||this.move?.area===area;
   this.sideProgress[area]=stepDoor(this.sideProgress[area],opening,dt);
   const shift=.94*smoothDoor(this.sideProgress[area]);
   for(const leaf of this.sideLeaves[area]){
    const key=leaf.userData?.semanticPart||leaf.name;
    const x=leaf.userData.originalX??(leaf.userData.originalX=leaf.position.x);
    leaf.position.x=x+(key.endsWith(".left")?-shift:shift);
   }
  }
  if(this.exiting&&!this.move&&e.doorProgress>=.98&&e.camera&&e.controls){
   const to=targets.atrium;e.controls.enabled=false;
   this.move={area:"atrium",elapsed:0,duration:1.4,
    start:e.camera.position.clone(),lookStart:e.controls.target.clone(),
    end:new THREE.Vector3(...to.camera),lookEnd:new THREE.Vector3(...to.look)};
  }
  const m=this.move;if(!m)return;
  m.elapsed+=dt;const p=clamp(m.elapsed/m.duration,0,1),smooth=p*p*(3-2*p);
  e.camera.position.copy(m.start).lerp(m.end,smooth);
  e.controls.target.copy(m.lookStart).lerp(m.lookEnd,smooth);
  if(p<1)return;
  this.move=null;e.controls.enabled=true;
  if(m.area==="atrium"){
   this.finished=true;this.onNavigate({to:"atrium",from:"warehouse.main-door"});
  }else{
   this.area=m.area;this.onArea({area:this.area});
  }
 }
 dispose(){this.move=null;this.roof=null;this.markers=null;this.sideLeaves={cold:[],packing:[]};}
 getDiagnostics(){return {area:this.area,exiting:this.exiting,
  moving:Boolean(this.move),stock:this.stock.recipes.map(r=>({
   id:r.id,stock:r.stock,rack:r.rack,cold:r.cold,packing:r.packing,hand:r.hand
  }))};}
}
