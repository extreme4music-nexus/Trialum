import test from "node:test";
import assert from "node:assert/strict";
import {createRandom,makeCarrier,stepCarrier,stepDoor,smoothDoor,conveyorTravel} from "../prototypes/lw-d/scenes/agro-food-warehouse/warehouse-motion.mjs";
test("visual logistics is deterministic for same seed, actually loads/drops and never leaves bounds",()=>{
 const a=[0,1,2].map(i=>makeCarrier(i,createRandom(41027+i*71+1)));
 const b=[0,1,2].map(i=>makeCarrier(i,createRandom(41027+i*71+1)));
 const sawLoad=[false,false,false],sawDrop=[false,false,false];
 const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
 for(let n=0;n<34000;n++){
  for(let i=0;i<a.length;i++){
   stepCarrier(a[i],.05);stepCarrier(b[i],.05);
   if(a[i].carry)sawLoad[i]=true;
   if(sawLoad[i]&&!a[i].carry)sawDrop[i]=true;
   min[i]=Math.min(min[i],a[i].z);max[i]=Math.max(max[i],a[i].z);
   assert.ok(Math.abs(a[i].x)<=7&&Math.abs(a[i].z)<=9.3);
   assert.ok(a[i].speed>=.38&&a[i].speed<=.62);
  }
 }
 for(let i=0;i<a.length;i++){
  assert.ok(sawLoad[i],"carrier "+i+" must actually load cargo");
  assert.ok(sawDrop[i],"carrier "+i+" must actually drop cargo");
  assert.ok(a[i].visits>=6,"carrier "+i+" must repeat multiple cycles");
  assert.ok(max[i]-min[i]>5,"carrier "+i+" must travel, not spin in place");
  assert.deepEqual(
   [a[i].x,a[i].z,a[i].yaw,a[i].phase,a[i].visits,a[i].carry],
   [b[i].x,b[i].z,b[i].yaw,b[i].phase,b[i].visits,b[i].carry],
   "same seed must replay exact same visual motion"
  );
 }
});
test("main entrance slides smoothly and conveyors move at low speed without game timers",()=>{
 let p=0;
 for(let i=0;i<60;i++)p=stepDoor(p,true,.05);
 assert.equal(p,1);assert.equal(smoothDoor(p),1);
 for(let i=0;i<60;i++)p=stepDoor(p,false,.05);
 assert.equal(p,0);assert.equal(smoothDoor(p),0);
 assert.equal(conveyorTravel(0),-1.45);
 assert.ok(conveyorTravel(1)>conveyorTravel(0));
 for(let i=0;i<100;i++)assert.ok(Math.abs(conveyorTravel(i))<=1.45);
});
