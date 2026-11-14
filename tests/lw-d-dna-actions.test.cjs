"use strict";
const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const source=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
const DNA=require("../prototypes/lw-d/dna-room.js");

test("L3.2-B sends DNA actions through the same-origin parent only, not a second game engine",()=>{
 const child=source("prototypes/lw-d/live-context.js");
 const parent=source("js/lw-d-interface.js");
 const bridge=source("js/app.js");
 assert.match(child,/type:"trialum:lw:dna",op,payload/);
 assert.match(parent,/event\.origin!==origin\|\|event\.source!==iframe\?\.contentWindow/);
 assert.match(parent,/op!=="design"&&op!=="transform"/);
 assert.match(parent,/API\(\)\?\.dnaOperation\?\.\(op,data\.payload\)/);
 assert.match(parent,/type:"trialum:lw:dna-result",op/);
 assert.match(bridge,/dnaOperation\(kind,payload\)/);
 assert.match(bridge,/E\.editFictionalGenes\(s,s\.selectedPet/);
 assert.match(bridge,/E\.longplayTransform\(s,s\.selectedPet,target\)/);
 assert.match(bridge,/notice\(result,'grow'\)/);
 assert.doesNotMatch(child,/E\.editFictionalGenes|E\.longplayTransform|localStorage\.setItem|indexedDB\.open/);
 assert.doesNotMatch(parent,/s\.pets\.push|s\.labActions--|s\.compounds-=/);
});

test("3D DNA designer validates values; engine alone owns true costs and unlocks",()=>{
 const bridge=source("js/app.js"),engine=source("js/progression.js");
 assert.match(bridge,/Number\.isInteger\(payload\.hue\)/);
 assert.match(bridge,/Number\.isInteger\(payload\.eyes\)/);
 assert.match(bridge,/\['jelly','crystal','leaf','cloud'\]\.includes\(payload\.shape\)/);
 assert.match(bridge,/E\.longplayRequirements\(s,x\.id\)/);
 assert.match(bridge,/sourceMatch:Boolean\(p\)&&p\.species===x\.source/);
 assert.match(engine,/if\(r\.level<6\|\|E\.evolutionProgress\(p\)\.level<22\)/);
 assert.match(engine,/if\(s\.labActions<1\)/);
 assert.match(engine,/if\(s\.compounds<25\|\|s\.insight<15\)/);
 assert.match(engine,/E\.evolutionGain\(s,p,55/);
 const longplay=source("js/longplay.js");
 assert.match(longplay,/function transform\(s,sourceId,target\)/);
 assert.match(longplay,/p\.lineage\.push\(target\)/);
 assert.match(longplay,/истиот миленик продолжува со својата возраст, меморија и историја/);
});

test("real 3D user controls require consent, deduplicate pending writes, preserve Classic fallback",()=>{
 const child=source("prototypes/lw-d/live-context.js");
 assert.match(child,/if\(dnaPending\|\|complexRoom!=="dna"\|\|!dna\?\.hasPet\)return/);
 assert.match(child,/if\(!root\.confirm\(T\(ask\)\)\)return/);
 assert.match(child,/dnaPending=true;dnaFeedback="";render\(\)/);
 assert.match(child,/dnaPending=false/);
 assert.match(child,/t\.id==="lwDnaHue"/);
 assert.match(child,/t\.id==="lwDnaEyes"/);
 assert.match(child,/t\.id==="lwDnaShape"/);
 assert.match(child,/event\.target\?\.id==="lwDnaTarget"/);
 assert.match(child,/dataset\.lwTab="dna"/);
 assert.match(child,/root\.parent\.postMessage\(\{type:"trialum:lw:classic",tab:b\.dataset\.lwTab\},origin\)/);
 assert.match(child,/DNA Laboratory · L3\.2-B/);
 assert.match(child,/ДНК операцијата е во тек/);
 assert.match(child,/world\?\.dna/);
});

test("selected pet and regeneration of designer draft remain authoritative after save and restore",()=>{
 const bridge=source("js/app.js"),child=source("prototypes/lw-d/live-context.js");
 assert.match(bridge,/currentPet:p\?\{id:String\(p\.id\)/);
 assert.match(child,/dnaDraftPetKey=key/);
 assert.match(child,/\[pet\.id,pet\.genomeSignature,pet\.hue,pet\.eyes,pet\.shape\]/);
 assert.match(bridge,/targets:dnaTargets/);
 assert.doesNotMatch(source("prototypes/lw-d/dna-room.js"),/localStorage|indexedDB|fetch\(|E\.editFictionalGenes/);
 const native=source("android-template/app/build.gradle.kts");
 assert.match(native,/create\("signqa"\)/);
});

test("camera avoids DNA machinery; animation reacts only to parent engine outcomes",()=>{
 const world=source("prototypes/lw-d/world.js");
 assert.match(world,/desiredDistance=st\?7\.2:12\.8/);
 assert.match(world,/selectedDnaStation\?6\.6:8\.2/);
 assert.match(world,/trialum:lw:dna-process-result/);
 assert.match(world,/TrialumDnaRoom\?\.drawRoom\(draw,cube,sphere,t,selectedDnaStation,dnaStatus,dnaVisual,dnaQuality\)/);
 const base=[],success=[],error=[];
 const draw=(dest)=>(...args)=>dest.push(args);
 const cube={},sphere={};
 DNA.drawRoom(draw(base),cube,sphere,10,"design",{designerUnlocked:true},null);
 DNA.drawRoom(draw(success),cube,sphere,10,"design",{designerUnlocked:true},
  {started:9.6,op:"design",ok:true});
 DNA.drawRoom(draw(error),cube,sphere,10,"lineage",{designerUnlocked:true},
  {started:9.6,op:"transform",ok:false});
 assert.equal(success.length,base.length+3,"success visual pulse adds exactly three render calls");
 assert.equal(error.length,base.length+3,"failed operation still shows feedback without reward");
 const elapsed=[];
 DNA.drawRoom(draw(elapsed),cube,sphere,15,"design",{designerUnlocked:true},
  {started:9.6,op:"design",ok:true});
 assert.equal(elapsed.length,base.length,"effect ends without a timer or background animation");
});
