import test from "node:test";
import assert from "node:assert/strict";
import {projectG01Aquatic,aquaglowRenderStage,G01AquaglowVisualContract} from "../prototypes/lw-d/scenes/agro-greenhouse/g01-aquatic-projection.mjs";

const a=(id,growth,health=85,dead=false)=>({
 id,species:"aquaglow",medium:"aquatic",bedId:"aquarium",
 growth,health,hydration:66,dead
});
test("canonical aquatic appearance moves through all four original growth values",()=>{
 const p=a("agro-plant-8",3);
 const stages=[[3,"sprout"],[19,"sprout"],[20,"young"],[49,"young"],
  [50,"growing"],[84,"growing"],[85,"mature"],[100,"mature"]];
 for(const [growth,stage] of stages){
  p.growth=growth;
  assert.equal(aquaglowRenderStage(p),stage);
 }
 p.health=39;assert.equal(aquaglowRenderStage(p),"weakened");
 p.health=0;assert.equal(aquaglowRenderStage(p),"dead");
 p.health=83;p.dead=true;assert.equal(aquaglowRenderStage(p),"dead");
});
test("only actual aquarium Aquaglow plant IDs get 4 stable, unique slots",()=>{
 const input=[a("plant-z",90),a("plant-a",3),a("plant-y",50),a("plant-k",20),
  a("plant-overflow",50),a("plant-z",90),
  {...a("plant-land",50),medium:"terrestrial",bedId:"bed-1"},
  {...a("plant-noncanon",50),species:"water-lotus"}];
 const before=JSON.stringify(input);
 const projection=projectG01Aquatic(input);
 assert.equal(projection.length,4);
 assert.deepEqual(projection.map(x=>x.id),["plant-a","plant-k","plant-overflow","plant-y"]);
 assert.deepEqual(projection.map(x=>x.stage),["sprout","young","growing","growing"]);
 assert.deepEqual(projection.map(x=>x.slotId),
  ["aquatic-slot-1","aquatic-slot-2","aquatic-slot-3","aquatic-slot-4"]);
 assert.equal(JSON.stringify(input),before,"projection must not mutate real original plant state");
 assert.deepEqual(projectG01Aquatic([]),[],"empty garden renders zero plant meshes");
 assert.equal(G01AquaglowVisualContract.installedInLiveScene,false);
});
test("read-only mature, dead and habitat transplant reflect original IDs and health",()=>{
 const id="agro-plant-stable";
 const state=[a(id,84,82)];
 assert.equal(projectG01Aquatic(state)[0].readyForTransplant,false);
 state[0].growth=85;
 assert.equal(projectG01Aquatic(state)[0].readyForTransplant,true);
 state[0].health=40;
 assert.equal(projectG01Aquatic(state)[0].readyForTransplant,false);
 state[0].dead=true;
 assert.equal(projectG01Aquatic(state)[0].stage,"dead");
 state.length=0;
 assert.equal(projectG01Aquatic(state).length,0,"transplanted original ID vanishes from greenhouse");
});
