"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const src=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
const E=require("../js/engine.js");
require("../js/evolution.js");require("../js/progression.js");require("../js/longplay.js");require("../js/fauna-lab.js");

function world(){
 const s=E.newGame("real",Date.now()-800*E.DAY_MS);
 s.stage=7;s.lastDay=800;s.insight=100000;s.compounds=100000;s.biomass=100000;s.cells=10000;s.labActions=20;
 for(const k in s.elements)s.elements[k]=100000;
 for(const k of E.researchFields)s.research.fields[k.id]=10000;
 s.research.knowledge=100000;s.research.level=40;
 for(const [i,biome] of ["lagoon","crystal","garden"].entries()){
  s.habitats.push({id:"dna-"+i,name:"QA "+biome,biome,capacity:100,
   minerals:{macro:70,micro:70},chem:{ph:7.1,temp:24,oxygen:93,toxins:2},
   cleanliness:95,flora:[],dayActions:20,bornDay:1,floraSlots:6});
 }
 s.activeHabitat="dna-2";return s;
}
function selectedSource(s,target){
 const parent=E.longplayLineages[target],q={id:"source-"+target,name:"QA Source "+target,
  species:parent.source,habitatId:"dna-2",hue:120,seed:452,eyes:2,shape:"leaf",
  birthDay:1,ageDays:800,growth:90,satiety:90,joy:95,energy:85,clean:90,bond:60,actionsLeft:9};
 E.ensureEvolution(q);q.evolution.level=parent.sourceLevel;
 q.evolution.trained=14;q.evolution.memories.push({day:100,kind:"shared",summary:"Owner test memory"});
 q.lineage=[parent.source];s.pets.push(q);s.selectedPet=q.id;
 return q;
}
test("audit: 3D DNA covers EVERY original Classic DNA operation and every discovered lineage",()=>{
 const classic=src("js/expansion-ui.js"),longUI=src("js/longplay-ui.js");
 const bridge=src("js/app.js"),hud=src("prototypes/lw-d/live-context.js");
 for(const literal of ["dnaHue","dnaEyes","dnaShape","editFictionalGenes"])
  assert.ok(classic.includes(literal),"Classic editor "+literal);
 assert.match(longUI,/function dna\(s\)/);
 assert.match(longUI,/E\.longplayLineages\.filter\(x=>x\.id>=4\)/);
 assert.match(longUI,/E\.longplayFaunaList\(s\)/);
 assert.match(bridge,/\(E\.longplayLineages\|\|\[\]\)\.filter\(x=>x\.id>=4\)/);
 assert.match(bridge,/E\.longplayFaunaList\?\.\(s\)/);
 assert.doesNotMatch(bridge,/const dnaTargets=[^;]*\.slice\(0,90\)/);
 assert.match(bridge,/description:String\(x\.description/);
 assert.match(bridge,/items:\(req\?\.items\|\|\[\]\)/);
 assert.match(bridge,/compoundsCost=dynamic\?120:25\+x\.id\*12/);
 assert.match(bridge,/insightCost=dynamic\?80:12\+x\.id\*7/);
 assert.match(bridge,/E\.occupancy\(s,h\.id\)/);
 assert.match(bridge,/E\.loadOf\(p\)/);
 assert.match(bridge,/pets:dnaPets/);
 assert.match(hud,/T\("Сите еволутивни линии"\)/);
 assert.match(hud,/target\.description/);
 assert.match(hud,/target\.items\|\|\[\]/);
 assert.match(hud,/target\.sourceMatch/);
 assert.match(hud,/target\.requiredBiome/);
 assert.match(hud,/target\.resourcesOk/);
 assert.match(hud,/target\.hasCapacity/);
 assert.match(hud,/target\.insightCost/);
 assert.match(hud,/dnaDraft\.hue/);
 assert.match(hud,/dnaDraft\.eyes/);
 assert.match(hud,/dnaDraft\.shape/);
});
test("original game DNA mutation charges fixed cost once and retains pet ID plus personal memory",()=>{
 const s=world(),p=selectedSource(s,4),id=p.id,memories=p.evolution.memories.length,
  saved={compounds:s.compounds,insight:s.insight,actions:s.labActions,age:p.ageDays};
 assert.equal(E.longplayRequirements(s,4).ok,true);
 const r=E.editFictionalGenes(s,p.id,{hue:256,eyes:4,shape:"crystal"});
 assert.equal(r.ok,true,r.message);
 assert.equal(s.compounds,saved.compounds-25);
 assert.equal(s.insight,saved.insight-15);
 assert.equal(s.labActions,saved.actions-1);
 assert.equal(p.id,id);
 assert.equal(p.ageDays,saved.age);
 assert.equal(p.evolution.memories.length,memories);
 assert.equal(p.hue,256);assert.equal(p.eyes,4);assert.equal(p.shape,"crystal");
 assert.ok(p.genome.signature);
});
test("original advanced DNA transformation has per-target costs and inherits age, history and memory",()=>{
 const s=world(),p=selectedSource(s,4),id=p.id,age=p.ageDays,
  memory=JSON.stringify(p.evolution.memories),old={c:s.compounds,i:s.insight,a:s.labActions};
 const result=E.longplayTransform(s,id,4);
 assert.equal(result.ok,true,result.message);
 assert.equal(s.compounds,old.c-(25+4*12));
 assert.equal(s.insight,old.i-(12+4*7));
 assert.equal(s.labActions,old.a-1);
 assert.equal(s.pets.length,1);
 assert.equal(p.id,id);assert.equal(p.ageDays,age);
 assert.equal(JSON.stringify(p.evolution.memories),memory);
 assert.deepEqual(p.lineage,[3,4]);
});
test("late discovered fauna and all base DNA targets are represented by authoritative original catalog",()=>{
 const s=world(),p=selectedSource(s,8);
 p.evolution.level=120;
 assert.equal(E.longplayInvent(s,"fauna").ok,true);
 const dynamic=E.longplayFaunaList(s)[0];
 assert.ok(dynamic.speciesIndex>=11);
 const listed=[...E.longplayLineages.filter(x=>x.id>=4),
  ...E.longplayFaunaList(s).map(x=>({...x,id:x.speciesIndex}))];
 assert.equal(listed.length,7+E.longplayFaunaList(s).length);
 for(const x of listed){
  const req=E.longplayRequirements(s,x.id);
  assert.ok(Array.isArray(req.items)&&req.items.length>=5,x.id);
  assert.ok(E.SPECIES[x.id]?.name,x.id);
 }
 const unknown=E.longplayRequirements(s,9999);
 assert.equal(unknown.ok,false);
});
test("no phone-native select or confirm; hologram handles full pet/shape/eyes/targets and declines safe",()=>{
 const child=src("prototypes/lw-d/live-context.js"),parent=src("js/lw-d-interface.js"),app=src("js/app.js");
 const dna=child.split("if(inDna){")[1]?.split("const info=sections[scene]||sections.lab;")[0];
 assert.ok(dna);
 assert.doesNotMatch(dna,/make\("select"\)|root\.confirm\(|window\.confirm\(/);
 assert.match(dna,/dataset\.lwDnaPet=item\.id/);
 assert.match(dna,/dataset\.lwDnaEye=String\(n\)/);
 assert.match(dna,/dataset\.lwDnaShape=id/);
 assert.match(dna,/dataset\.lwDnaTarget=String\(target\.id\)/);
 assert.match(dna,/dataset\.lwDnaCommit="design"/);
 assert.match(dna,/dataset\.lwDnaCommit="transform"/);
 assert.match(dna,/lw-dna-confirm/);
 assert.match(child,/if\(decision==="cancel"\)\{dnaConfirm=null;render\(\);return;\}/);
 assert.match(child,/dnaConfirm=null;dnaPending=true;dnaFeedback="";render\(\)/);
 assert.match(child,/if\(dnaPending\|\|dnaPetPending\|\|dnaConfirm\|\|complexRoom!=="dna"\|\|!pet\)return/);
 assert.match(app,/payload\.petId!==String\(currentPet\.id\)/);
 assert.match(app,/E\.selectPet\(s,id\)/);
 assert.match(parent,/event\.origin!==origin\|\|event\.source!==iframe\?\.contentWindow/);
 assert.match(parent,/data\.type==="trialum:lw:dna-select-pet"/);
 assert.match(parent,/API\(\)\?\.dnaSelectPet\?\.\(id\)/);
 assert.match(parent,/type:"trialum:lw:dna-pet-result"/);
 assert.match(child,/message\.type==="trialum:lw:dna-pet-result"/);
 assert.match(child,/dnaDraftPetKey=key/);
});
test("DNA parity changes only presentation + existing original operations, not duplicated economy or saves",()=>{
 const room=src("prototypes/lw-d/dna-room.js"),
  visual=src("prototypes/lw-d/live-context.js"),
  parent=src("js/lw-d-interface.js");
 assert.doesNotMatch(room,/localStorage|indexedDB|fetch\(|setInterval\(|E\.editFictionalGenes|E\.longplayTransform/);
 assert.doesNotMatch(visual,/s\.pets\.push|s\.blueprints\.push|s\.compounds\s*-=/);
 assert.doesNotMatch(parent,/s\.pets\.push|s\.compounds\s*-=/);
 assert.match(visual,/dataset\.lwTab="dna"/);
 assert.match(parent,/sync\(\);/);
});
