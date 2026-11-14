"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
const E=require("../js/engine.js");
require("../js/evolution.js");require("../js/progression.js");require("../js/longplay.js");require("../js/fauna-lab.js");
function world(){
 const s=E.newGame("real",Date.now()-1000*E.DAY_MS);
 s.stage=7;s.lastDay=800;s.energy=100;s.insight=100000;
 s.compounds=100000;s.biomass=100000;s.cells=50000;s.labActions=30;
 for(const k in s.elements)s.elements[k]=100000;
 s.research.level=40;s.research.knowledge=100000;
 for(const fld of E.researchFields)s.research.fields[fld.id]=10000;
 for(const [idx,biome] of ["lagoon","crystal","garden"].entries())
  s.habitats.push({id:"research-"+idx,name:"QA "+biome,biome,capacity:150,
   minerals:{macro:75,micro:75},chem:{ph:7,temp:24,oxygen:93,toxins:1},
   cleanliness:95,flora:[],dayActions:20,bornDay:1,floraSlots:6});
 s.activeHabitat="research-2";
 const p={id:"original-research-pet",name:"Noetrium QA",species:7,habitatId:"research-2",
  hue:195,seed:4321,eyes:4,shape:"leaf",birthDay:1,ageDays:780,
  growth:85,satiety:90,joy:85,energy:85,clean:90,bond:40,actionsLeft:10,
  lineage:[3,4,5,6,7]};
 E.ensureEvolution(p);p.evolution.level=190;p.evolution.memories.push({day:55,kind:"play",summary:"kept memory"});
 s.pets.push(p);s.selectedPet=p.id;
 return s;
}
test("Research 3D is directly mapped to every Classic Research function and authoritative backend",()=>{
 const classic=read("js/longplay-ui.js"),base=read("js/expansion-ui.js"),
  app=read("js/app.js"),parent=read("js/lw-d-interface.js"),
  hud=read("prototypes/lw-d/live-context.js");
 for(const part of ['E.researchFields.map','upgradeLab','E.labRequirements','longInvent','longCraftMaterial','s.longplay.invented.slice(-12)'])
  assert.ok(classic.includes(part),"missing Classic source "+part);
 assert.match(base,/case 'study':r=E.study/);
 assert.match(base,/case 'upgradeLab':r=E.upgradeLab/);
 assert.match(classic,/case 'longInvent':result=E.longplayInvent/);
 assert.match(classic,/case 'longCraftMaterial':result=E.longplayBuildMaterial/);
 for(const engineCall of ['E.study(s,payload.field)','E.upgradeLab(s)','E.longplayInvent(s,payload.kind)','E.longplayBuildMaterial(s,payload.material)'])
  assert.ok(app.includes(engineCall),"3D must delegate to original "+engineCall);
 for(const field of ['fields','next','requirements','inventions','materials','recent','credits','faunaCount'])
  assert.ok(app.includes(field),"Research snapshot "+field);
 assert.match(app,/research:researchView/);
 assert.match(app,/researchOperation\(kind,payload\)/);
 assert.match(parent,/event\.origin!==origin\|\|event\.source!==iframe\?\.contentWindow/);
 assert.match(parent,/data\.type==="trialum:lw:research"/);
 assert.match(parent,/API\(\)\?\.researchOperation\?\.\(op,data\.payload\)/);
 assert.match(parent,/type:"trialum:lw:research-result"/);
 assert.match(parent,/sync\(\)/);
 assert.match(hud,/type:"trialum:lw:research",op:pending\.op,payload:p/);
 assert.match(hud,/message\.type==="trialum:lw:research-result"/);
 assert.doesNotMatch(parent,/s\.research\.knowledge\+\+|s\.labActions--|s\.longplay\.invented\.push/);
 assert.doesNotMatch(hud,/s\.labActions--|s\.insight-=|s\.longplay\.materials/);
});
test("all five original research fields cost exactly 3 molecules, 5 energy, 1 action and add knowledge",()=>{
 const s=world();
 for(const field of E.researchFields){
  const before={c:s.compounds,energy:s.energy,a:s.labActions,
   points:s.research.fields[field.id],knowledge:s.research.knowledge,insight:s.insight};
  const response=E.study(s,field.id);
  assert.equal(response.ok,true,response.message);
  assert.equal(s.compounds,before.c-3);
  assert.equal(s.energy,before.energy-5);
  assert.equal(s.labActions,before.a-1);
  assert.ok(s.research.fields[field.id]>before.points);
  assert.ok(s.research.knowledge>before.knowledge);
  assert.equal(s.insight,before.insight+3);
 }
});
test("real source engine refuses locked genomics and resource exhaustion without spending",()=>{
 const s=world();
 s.research.level=3;
 const before={c:s.compounds,e:s.energy,a:s.labActions};
 assert.equal(E.study(s,"genomics").ok,false);
 assert.deepEqual({c:s.compounds,e:s.energy,a:s.labActions},before);
 s.research.level=7;s.energy=0;
 assert.equal(E.study(s,"molecules").ok,false);
 assert.deepEqual({c:s.compounds,a:s.labActions},{c:before.c,a:before.a});
});
test("technology upgrades only from engine labRequirements, no synthetic level advancement",()=>{
 const s=world();s.research.level=6;
 const req=E.labRequirements(s,7);
 assert.equal(req.ok,true,JSON.stringify(req.items.filter(x=>!x.ok)));
 const old={level:s.research.level,actions:s.labActions,
  insight:s.insight,compounds:s.compounds};
 const response=E.upgradeLab(s);
 assert.equal(response.ok,true,response.message);
 assert.equal(s.research.level,old.level+1);
 assert.ok(s.labActions<=old.actions);
 assert.ok(s.insight<old.insight);
 assert.ok(s.compounds<old.compounds);
});
test("real invent food/flora/material honors discovery costs and records original archive",()=>{
 const s=world();const before={a:s.labActions,i:s.insight,c:s.compounds};
 assert.equal(E.longplayInvent(s,"food").ok,true);
 assert.equal(s.labActions,before.a-1);
 assert.equal(s.insight,before.i-8);
 assert.equal(s.compounds,before.c-12);
 assert.equal(s.longplay.invented.at(-1).kind,"food");
 assert.equal(E.longplayInvent(s,"flora").ok,true);
 assert.equal(s.longplay.invented.at(-1).kind,"flora");
 const reserve=E.longplayMaterials[0],old=Number(s.longplay.materials[reserve.id]||0);
 assert.equal(E.longplayInvent(s,"material").ok,true);
 assert.equal(s.longplay.materials[reserve.id],old+1);
 assert.ok(s.longplay.invented.length>=2);
});
test("original material production uses actual discovered inventory and pays 12 molecules 10 biomass 1 lab action",()=>{
 const s=world(),material=E.longplayMaterials[0],before0=s.compounds;
 assert.equal(E.longplayBuildMaterial(s,material.id).ok,false,"undiscovered material cannot be crafted");
 assert.equal(s.compounds,before0);
 assert.equal(E.longplayInvent(s,"material").ok,true);
 const before={c:s.compounds,b:s.biomass,a:s.labActions,count:s.longplay.materials[material.id]};
 const r=E.longplayBuildMaterial(s,material.id);
 assert.equal(r.ok,true,r.message);
 assert.equal(s.compounds,before.c-12);
 assert.equal(s.biomass,before.b-10);
 assert.equal(s.labActions,before.a-1);
 assert.equal(s.longplay.materials[material.id],before.count+2);
});
test("new fauna research requires real selected advanced pet and does not duplicate its identity",()=>{
 const s=world(),p=s.pets[0],before={id:p.id,memory:JSON.stringify(p.evolution.memories),
  c:s.compounds,i:s.insight,a:s.labActions};
 const r=E.longplayInvent(s,"fauna");
 assert.equal(r.ok,true,r.message);
 assert.equal(s.compounds,before.c-50);
 assert.equal(s.insight,before.i-35);
 assert.equal(s.labActions,before.a-1);
 assert.equal(p.id,before.id);
 assert.equal(JSON.stringify(p.evolution.memories),before.memory);
 assert.equal(s.pets.length,1);
 assert.ok(E.longplayFaunaList(s).length>=1);
});
test("hologram uses no system popup or native selector, and cancel never sends a request",()=>{
 const hud=read("prototypes/lw-d/live-context.js");
 const part=hud.split("if(inResearch){")[1]?.split("if(inFlora){")[0];
 assert.ok(part);
 assert.doesNotMatch(part,/make\("select"\)|root\.confirm\(|window\.prompt\(/);
 for(const id of ['lwResearchStation','lwResearchField','lwResearchInvent','lwResearchMaterial',
  'lwResearchCommit','lwResearchDecision'])
  assert.ok(hud.includes('dataset.'+id),"missing "+id);
 assert.match(hud,/if\(decision==="cancel"\)\{researchConfirm=null;render\(\);return;\}/);
 assert.match(hud,/researchConfirm=null;researchPending=true;researchFeedback="";render\(\)/);
 assert.match(hud,/p\.kind!=="fauna"\|\|String\(r\.pet\?\.id\|\|""\)===p\.petId/);
 assert.match(hud,/dataset\.lwTab="research"/);
 assert.doesNotMatch(read("prototypes/lw-d/research-room.js"),/localStorage|indexedDB|fetch\(|setInterval\(/);
});
