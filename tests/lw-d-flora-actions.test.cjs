"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
const E=require("../js/engine.js");
require("../js/evolution.js");require("../js/progression.js");
const Flora=require("../prototypes/lw-d/flora-room.js");
function makeWorld(){
 const s=E.newGame("demo",1700000000000);
 s.stage=7;s.insight=800;s.compounds=1200;s.labActions=4;
 s.research.level=7;
 for(const k of Object.keys(s.elements))s.elements[k]=200;
 s.habitats=[{id:"flora-qa",name:"QA Garden",biome:"garden",capacity:12,
  minerals:{macro:70,micro:68},chem:{ph:7.1,temp:24,oxygen:83,toxins:1},
  cleanliness:96,flora:[],dayActions:3,bornDay:1}];
 s.activeHabitat="flora-qa";
 return s;
}
test("flora actions travel only through trusted parent and original unlock/plant functions",()=>{
 const parent=read("js/lw-d-interface.js"),app=read("js/app.js");
 const child=read("prototypes/lw-d/live-context.js");
 assert.match(parent,/event\.origin!==origin\|\|event\.source!==iframe\?\.contentWindow/);
 assert.match(parent,/data\.type==="trialum:lw:flora"/);
 assert.match(parent,/op!=="invent"&&op!=="plant"/);
 assert.match(parent,/API\(\)\?\.floraOperation\?\.\(op,data\.payload\)/);
 assert.match(parent,/type:"trialum:lw:flora-result",op,species/);
 assert.match(app,/floraOperation\(kind,payload\)/);
 assert.match(app,/E\.inventPlant\(s,species\)/);
 assert.match(app,/E\.plant\(s,species\)/);
 assert.match(app,/payload\.habitatId!==String\(h\.id\)/);
 assert.match(app,/notice\(result,'grow'\)/);
 assert.match(child,/type:"trialum:lw:flora",op:pending\.op/);
 assert.doesNotMatch(child,/E\.inventPlant\(|E\.plant\(|s\.blueprints\.push|s\.elements\.C-=/);
});
test("only in-hologram confirmation, single pending write, cancellation without command",()=>{
 const child=read("prototypes/lw-d/live-context.js");
 assert.match(child,/dataset\.lwFloraCommit="invent"/);
 assert.match(child,/dataset\.lwFloraCommit="plant"/);
 assert.match(child,/dataset\.lwFloraDecision=cmd/);
 assert.match(child,/if\(decision==="cancel"\)\{floraConfirm=null;render\(\);return;\}/);
 assert.match(child,/if\(floraPending\|\|floraConfirm\|\|complexRoom!=="floralab"\)return/);
 assert.match(child,/floraConfirm=null;floraPending=true;floraFeedback="";render\(\)/);
 assert.match(child,/floraPending=false;floraConfirm=null/);
 assert.match(child,/pending\.op==="plant"&&\(!plant\.canPlant\|\|!habitat/);
 assert.match(child,/String\(habitat\.id\)!==pending\.habitatId/);
 assert.match(child,/role","group"/);
 assert.match(child,/lw-flora-confirm/);
 const section=child.split("if(inFlora){")[1]?.split("if(inFood){")[0];
 assert.ok(section);
 assert.doesNotMatch(section,/make\("select"\)|root\.confirm\(/);
});
test("canonical inventPlant spends exactly insight and molecules, preserves pet state",()=>{
 const s=makeWorld(),before={i:s.insight,c:s.compounds,pet:s.pets.length};
 assert.equal(E.validate(s),true);
 assert.equal(s.blueprints.includes("glowfern"),false);
 const result=E.inventPlant(s,"glowfern");
 assert.equal(result.ok,true,result.message);
 assert.equal(s.insight,before.i-12);
 assert.equal(s.compounds,before.c-7);
 assert.equal(s.blueprints.includes("glowfern"),true);
 assert.equal(s.pets.length,before.pet);
 assert.equal(E.validate(s),true);
 const duplicate=E.inventPlant(s,"glowfern");
 assert.equal(duplicate.ok,false);
 assert.equal(s.insight,before.i-12);
 assert.equal(s.compounds,before.c-7);
});
test("canonical planting consumes only four elements and one habitat action",()=>{
 const s=makeWorld();
 assert.equal(E.inventPlant(s,"glowfern").ok,true);
 const h=E.currentHabitat(s);
 const elems={...s.elements},actions=h.dayActions,compounds=s.compounds;
 const r=E.plant(s,"glowfern");
 assert.equal(r.ok,true,r.message);
 assert.equal(h.flora.length,1);
 assert.equal(h.flora[0].species,"glowfern");
 assert.equal(h.flora[0].growth,3);
 assert.equal(h.dayActions,actions-1);
 for(const [atom,cost] of Object.entries({C:8,N:5,P:3,O:6}))
  assert.equal(s.elements[atom],elems[atom]-cost,atom);
 assert.equal(s.compounds,compounds);
 assert.equal(E.validate(s),true);
});
test("engine rejects no blueprint, full habitat and no daily action without unintended spending",()=>{
 const s=makeWorld(),h=E.currentHabitat(s);
 const before={...s.elements};
 assert.equal(E.plant(s,"glowfern").ok,false);
 assert.deepEqual(s.elements,before);
 assert.equal(E.inventPlant(s,"glowfern").ok,true);
 h.flora=Array.from({length:6},(_,i)=>({id:"fake-"+i,species:"lumemoss",growth:50}));
 assert.equal(E.plant(s,"glowfern").ok,false);
 assert.deepEqual(s.elements,before);
 h.flora=[];h.dayActions=0;
 assert.equal(E.plant(s,"glowfern").ok,false);
 assert.deepEqual(s.elements,before);
});
test("green/red 3D flora animation is strictly a result, expires and never modifies saved flora",()=>{
 const render=out=>(...v)=>out.push(v),base=[],ok=[],bad=[],expired=[];
 const props=Object.freeze({planted:3,oxygen:76}),cube={},sphere={};
 Flora.drawRoom(render(base),cube,sphere,10,"growth",props,"balanced");
 Flora.drawRoom(render(ok),cube,sphere,10,"seedbank",props,"balanced",
  {started:9.7,op:"invent",ok:true});
 Flora.drawRoom(render(bad),cube,sphere,10,"growth",props,"balanced",
  {started:9.7,op:"plant",ok:false});
 Flora.drawRoom(render(expired),cube,sphere,10,"growth",props,"balanced",
  {started:2,op:"plant",ok:true});
 assert.equal(ok.length,base.length+7);
 assert.equal(bad.length,base.length+7);
 assert.equal(expired.length,base.length);
 const world=read("prototypes/lw-d/world.js");
 assert.match(world,/trialum:lw:flora-process-result/);
 assert.match(world,/TrialumFloraRoom\?\.drawRoom\(draw,cube,sphere,t,selectedFloraStation,floraStatus,"balanced",floraVisual\)/);
 assert.doesNotMatch(read("prototypes/lw-d/flora-room.js"),/localStorage|indexedDB|fetch\(|setInterval\(/);
});
