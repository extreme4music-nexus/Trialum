"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const src=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
const E=require("../js/engine.js");
require("../js/evolution.js");require("../js/progression.js");
const Food=require("../prototypes/lw-d/food-room.js");
function world(){
 const s=E.newGame("demo",1700000000000);
 s.stage=7;s.insight=2000;s.compounds=3000;s.biomass=3000;s.energy=100;s.cells=3000;
 for(const e in s.elements)s.elements[e]=3000;
 s.habitats=[{id:"hab-1",name:"QA lagoon",biome:"lagoon",capacity:100,
   minerals:{macro:64,micro:58},chem:{ph:7.1,temp:24,oxygen:90,toxins:3},
   cleanliness:94,flora:[],dayActions:4,bornDay:1}];
 s.activeHabitat="hab-1";s.lastDay=40;s.demoDay=40;
 s.research.level=2;
 return s;
}

test("3D food action bridge calls the existing engine with no parallel food economy",()=>{
 const child=src("prototypes/lw-d/live-context.js"),
 parent=src("js/lw-d-interface.js"),app=src("js/app.js"),engine=src("js/progression.js");
 assert.match(child,/type:"trialum:lw:food",op:pending\.op/);
 assert.match(parent,/event\.origin!==origin\|\|event\.source!==iframe\?\.contentWindow/);
 assert.match(parent,/data\.type==="trialum:lw:food"/);
 assert.match(parent,/op!=="craft"&&op!=="feed"/);
 assert.match(parent,/API\(\)\?\.foodOperation\?\.\(op,data\.payload\)/);
 assert.match(parent,/type:"trialum:lw:food-result",seq:\+\+resultSequence,op/);
 assert.match(app,/foodOperation\(kind,payload\)/);
 assert.match(app,/E\.craftFood\(s,recipeId\)/);
 assert.match(app,/E\.feedPrepared\(s,pet\.id,recipeId\)/);
 assert.match(app,/payload\.petId!==String\(pet\.id\)/);
 assert.match(app,/notice\(result,kind==='feed'\?'feed':'tap'\)/);
 assert.match(engine,/E\.craftFood=craft;E\.feedPrepared=feed/);
 assert.doesNotMatch(parent,/s\.foodFactory\.stock|s\.biomass-=|s\.compounds-=/);
 assert.doesNotMatch(child,/E\.craftFood|E\.feedPrepared|localStorage\.setItem|indexedDB\.open/);
});

test("native Android recipe popup replaced with accessible holographic list and inline confirmation",()=>{
 const child=src("prototypes/lw-d/live-context.js");
 const foodSection=child.split("if(inFood){")[1]?.split("if(inDna){")[0];
 assert.ok(foodSection);
 assert.doesNotMatch(foodSection,/make\("select"\)/);
 assert.match(foodSection,/class|lw-food-picker/);
 assert.match(foodSection,/lw-food-picker-list/);
 assert.match(foodSection,/role","group"/);
 assert.match(foodSection,/aria-pressed/);
 assert.match(foodSection,/lw-food-confirm/);
 assert.match(child,/if\(decision==="cancel"\)\{foodConfirm=null;render\(\);return;\}/);
 assert.match(child,/if\(foodPending\|\|complexRoom!=="foodlab"\|\|foodConfirm\)return/);
 assert.match(child,/foodPending=true;foodFeedback="";render\(\)/);
 assert.match(child,/foodPending=false;foodConfirm=null/);
 assert.match(child,/foodPickerOpen=!foodPickerOpen/);
 assert.doesNotMatch(foodSection,/root\.confirm/);
 assert.match(child,/backdrop-filter:blur\(12px\)/);
 assert.match(child,/prefers-reduced-motion:reduce/);
});

test("original engine only charges food resources when player actually crafts",()=>{
 const s=world(),pre={biomass:s.biomass,compounds:s.compounds,labActions:s.labActions};
 assert.equal(s.foodFactory.stock.manna,0);
 assert.equal(E.validate(s),true);
 assert.deepEqual([s.biomass,s.compounds,s.labActions],
  [pre.biomass,pre.compounds,pre.labActions],"recipe preview does not spend resources");
 const x=E.craftFood(s,"manna");
 assert.equal(x.ok,true,x.message);
 assert.equal(s.biomass,pre.biomass-8);
 assert.equal(s.compounds,pre.compounds-3);
 assert.equal(s.labActions,pre.labActions-1);
 assert.equal(s.foodFactory.stock.manna,3);
 assert.equal(E.validate(s),true);
});

test("original feeding consumes exactly one stored portion and pet action, keeps identity",()=>{
 const s=world();
 assert.equal(E.createPet(s,0).ok,true);
 const pet=E.currentPet(s),id=pet.id;
 assert.equal(E.craftFood(s,"manna").ok,true);
 const before={biomass:s.biomass,stock:s.foodFactory.stock.manna,actions:pet.actionsLeft};
 const result=E.feedPrepared(s,pet.id,"manna");
 assert.equal(result.ok,true,result.message);
 assert.equal(pet.id,id);
 assert.equal(pet.actionsLeft,before.actions-1);
 assert.equal(s.foodFactory.stock.manna,before.stock-1);
 assert.equal(s.biomass,before.biomass,"no second raw biomass payment");
 assert.equal(E.validate(s),true);
});
test("locked recipe and incompatible pet do not spend resources or eat portions",()=>{
 const s=world(),before={biomass:s.biomass,compounds:s.compounds,labActions:s.labActions};
 assert.equal(E.craftFood(s,"astral").ok,false);
 assert.equal(E.craftFood(s,"unrecognized").ok,false);
 assert.deepEqual([s.biomass,s.compounds,s.labActions],[before.biomass,before.compounds,before.labActions]);
 assert.equal(E.createPet(s,1).ok,true);
 assert.equal(E.craftFood(s,"lumen").ok,true);
 const current=E.currentPet(s),count=s.foodFactory.stock.lumen,actions=current.actionsLeft;
 assert.equal(E.feedPrepared(s,current.id,"lumen").ok,false);
 assert.equal(s.foodFactory.stock.lumen,count);
 assert.equal(current.actionsLeft,actions);
});

test("animated machinery is driven by authoritative result for 2.2 seconds only",()=>{
 const draw=(out)=>(...args)=>out.push(args);
 const inactive=[],done=[],denied=[],expired=[],settings={totalStock:3};
 Food.drawRoom(draw(inactive),{id:"cube"},{id:"sphere"},10,"synthesis",settings,"balanced");
 Food.drawRoom(draw(done),{id:"cube"},{id:"sphere"},10,"synthesis",settings,"balanced",
   {op:"craft",ok:true,started:9.7});
 Food.drawRoom(draw(denied),{id:"cube"},{id:"sphere"},10,"analysis",settings,"balanced",
   {op:"feed",ok:false,started:9.7});
 Food.drawRoom(draw(expired),{id:"cube"},{id:"sphere"},10,"analysis",settings,"balanced",
   {op:"feed",ok:true,started:5});
 assert.equal(done.length,inactive.length+7);
 assert.equal(denied.length,inactive.length+7);
 assert.equal(expired.length,inactive.length);
 const worldSrc=src("prototypes/lw-d/world.js");
 assert.match(worldSrc,/trialum:lw:food-process-result/);
 assert.match(worldSrc,/TrialumFoodRoom\?\.drawRoom\(draw,cube,sphere,t,selectedFoodStation,foodStatus,"balanced",foodVisual\)/);
 assert.doesNotMatch(src("prototypes/lw-d/food-room.js"),/localStorage|indexedDB|fetch\(|setInterval\(/);
});
