"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const DNA=require("./dna-room.js");
const read=p=>fs.readFileSync(path.join(__dirname,"../..",p),"utf8");

test("L3.2-A DNA room is an actual spatial 3D chamber with distinct interactive stations",()=>{
 assert.deepEqual(DNA.STATIONS.map(x=>x.id),["scan","design","lineage"]);
 assert.ok(DNA.STATIONS.every(Object.isFrozen));
 assert.equal(DNA.station("designer"),null);
 const calls=[];
 const locked=Object.freeze({labLevel:0,petLevel:0,hasPet:false,designerUnlocked:false});
 DNA.drawRoom((...args)=>calls.push(args),{mesh:"cube"},{mesh:"sphere"},1.4,"scan",locked);
 assert.ok(calls.length>125,"Real architecture, central helix and benches must render");
 assert.ok(calls.some(a=>a[2]>1.5),"roof and light rails");
 assert.ok(calls.some(a=>a[2]<-1.3),"floor");
 assert.ok(calls.some(a=>a[3]<-3),"rear wall");
 assert.ok(calls.some(a=>a[1]<-4),"left wall");
 assert.ok(calls.some(a=>a[1]>4),"right wall");
 assert.deepEqual(locked,{labLevel:0,petLevel:0,hasPet:false,designerUnlocked:false});
 const active=[];
 DNA.drawRoom((...args)=>active.push(args),{mesh:"cube"},{mesh:"sphere"},2,"design",{designerUnlocked:true});
 assert.equal(active.length,calls.length,"unlocked visualization never changes scene shape or simulates mutation");
});
test("DNA station camera projection and picking reject off-target touches",()=>{
 const m=new Float32Array([.13,0,0,0,0,.28,0,0,0,.18,-.09,0,0,0,0,1]);
 for(const st of DNA.STATIONS){
  const p=DNA.project(m,st.x,st.y,st.z,1400,900);
  assert.ok(p&&p.x>0&&p.x<1400&&p.y>0&&p.y<900,st.id);
  assert.equal(DNA.pick(m,p.x,p.y,1400,900)?.id,st.id);
 }
 assert.equal(DNA.pick(null,12,33,1400,900),null);
 assert.equal(DNA.pick(m,-20,-20,1400,900),null);
});
test("DNA room stays read-only; existing DNA mutations and source IDs remain authoritative",()=>{
 const model=read("prototypes/lw-d/dna-room.js");
 assert.doesNotMatch(model,/localStorage|indexedDB|fetch\(|setInterval\(|newGame\(|scheduleSave|TRIALUM_DATA_KEY|longplayTransform\(/);
 const bridge=read("js/app.js");
 assert.match(bridge,/dnaLabLevel=Math\.max\(0,Number\(s\.research\?\.level\)\|\|0\)/);
 assert.match(bridge,/E\.evolutionProgress\(p\)\?\.level/);
 assert.match(bridge,/designerUnlocked:dnaLabLevel>=6&&dnaPetLevel>=22/);
 assert.match(bridge,/classicTab\(next\)/);
 const classic=read("js/expansion-ui.js");
 assert.match(classic,/editFictionalGenes\(s,s\.selectedPet/);
 const longplay=read("js/longplay-ui.js");
 assert.match(longplay,/longplayTransform\(s,s\.selectedPet/);
});
test("DNA room opens through real hall, has bilingual HUD, Classic DNA fallback and no lost 3D",()=>{
 const hall=read("prototypes/lw-d/lab-complex.js");
 const render=read("prototypes/lw-d/world.js");
 const hud=read("prototypes/lw-d/live-context.js");
 assert.match(hall,/id:"dna",tab:"dna".*ready:true/);
 assert.match(render,/complexView="dna";selectedFoodStation=null;chooseRoomStation\(null\);chooseDnaStation\(null\)/);
 assert.match(render,/TrialumDnaRoom\?\.drawRoom/);
 assert.match(render,/TrialumDnaRoom\?\.pick/);
 assert.match(render,/trialum:lw:select-dna-station/);
 assert.match(hud,/inDna=scene==="lab"&&complexRoom==="dna"/);
 assert.match(hud,/root\.TrialumLWDnaWebGLReady===true/);
 assert.match(hud,/root\.parent\.postMessage\(\{type:"trialum:lw:classic",tab:b\.dataset\.lwTab\},origin\)/);
 assert.match(hud,/dataset\.lwTab="dna"/);
 assert.match(hud,/DNA designer is available/);
 assert.match(hud,/designerUnlocked/);
 assert.match(hud,/↩ Лабораториски ходник/);
});
test("Android/PWA/single-file offline preview include the same DNA room module",()=>{
 const moduleName="dna-room.js";
 const html=read("prototypes/lw-d/world.html");
 const gradle=read("android-template/app/build.gradle.kts");
 const sw=read("sw.js");
 const preview=read("prototypes/lw-d/build_preview.py");
 assert.match(html,/<script src="dna-room\.js"><\/script>/);
 assert.ok(html.indexOf('src="dna-room.js"')<html.indexOf('src="world.js"'));
 assert.ok(gradle.includes("prototypes/lw-d/"+moduleName));
 assert.ok(sw.includes("prototypes/lw-d/"+moduleName));
 assert.ok(preview.includes('dna_room = (base / "dna-room.js").read_text'));
 assert.ok(preview.includes('src="dna-room.js"'));
});


test("L3.2-C mobile quality tier is deterministic and has no device tracking",()=>{
 assert.equal(DNA.qualityForViewport(1280,720,1,false,false),"rich");
 assert.equal(DNA.qualityForViewport(900,420,3,false,false),"balanced");
 assert.equal(DNA.qualityForViewport(1280,720,1,true,false),"balanced");
 assert.equal(DNA.qualityForViewport(1280,720,1,false,true),"balanced");
 assert.equal(DNA.qualityForViewport(0,0,3,false,false),"balanced");
 assert.equal(DNA.qualityForViewport(1280,720,Infinity,false,false),"rich");
});
test("L3.2-C mobile scene cuts draw calls while preserving central helix and three DNA stations",()=>{
 const drawStats=tier=>{
  const meshes=[];
  DNA.drawRoom((...args)=>meshes.push(args),{id:"cube"},{id:"sphere"},1.4,
   "design",{designerUnlocked:true},null,tier);
  return meshes;
 };
 const rich=drawStats("rich"),balanced=drawStats("balanced");
 assert.ok(rich.length>balanced.length+25,
   "balanced profile must cut at least 25 scene draw submissions");
 assert.ok(balanced.length>110,"mobile tier must retain real room architecture");
 const highStatus=rich[rich.length-1],lowStatus=balanced[balanced.length-1];
 assert.deepEqual(highStatus,lowStatus,"locked/unlocked status marker must match in both tiers");
 for(const tier of ["rich","balanced"]){
  const base=[],success=[];
  DNA.drawRoom((...args)=>base.push(args),{}, {},4,"scan",{designerUnlocked:false},null,tier);
  DNA.drawRoom((...args)=>success.push(args),{}, {},4,"scan",{designerUnlocked:false},
   {started:3.5,op:"transform",ok:true},tier);
  assert.equal(success.length,base.length+3,"real result feedback identical at both tiers");
 }
});
test("L3.2-C mobile visual budgeting changes renderer only, not any pet/economy data",()=>{
 const world=read("prototypes/lw-d/world.js");
 assert.match(world,/const ratio=Math.min\(dnaActive\?1\.5:2,Math.max\(1,dpr\)\)/);
 assert.match(world,/dnaQuality=globalThis\.TrialumDnaRoom\?\.qualityForViewport/);
 assert.match(world,/if\(dnaSlowFrames>=8\)dnaAdaptiveLow=true/);
 assert.match(world,/dnaQuality\);/);
 assert.match(world,/canRender\(\)/);
 assert.doesNotMatch(read("prototypes/lw-d/dna-room.js"),/localStorage|indexedDB|fetch\(|setInterval\(|E\.editFictionalGenes/);
});
