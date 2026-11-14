"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const Flora=require("./flora-room.js"),Hall=require("./lab-complex.js");
const read=p=>fs.readFileSync(path.join(__dirname,"../..",p),"utf8");

test("L3.4-A flora room is real procedural 3D with seed bank, scanner and growth chamber",()=>{
 assert.deepEqual(Flora.STATIONS.map(s=>s.id),["seedbank","scanner","growth"]);
 assert.ok(Flora.STATIONS.every(Object.isFrozen));
 assert.equal(Flora.station("bogus"),null);
 const calls=[];
 const stock=Object.freeze({planted:4,oxygen:74});
 Flora.drawRoom((...v)=>calls.push(v),{}, {},1.6,"growth",stock,"balanced");
 assert.ok(calls.length>95,"actual walls, growing pod, 3 apparatus and mobile details must render");
 assert.ok(calls.some(x=>x[1]<-4),"left wall");
 assert.ok(calls.some(x=>x[1]>4),"right wall");
 assert.ok(calls.some(x=>x[3]<-3),"rear architecture");
 assert.ok(calls.some(x=>x[2]>1.5),"ceiling illumination");
 assert.ok(calls.some(x=>x[2]<-1.3),"tiled floor");
 assert.deepEqual(stock,{planted:4,oxygen:74},"draw must not modify actual stock projection");
 const rich=[];
 Flora.drawRoom((...v)=>rich.push(v),{}, {},2.1,"scanner",stock,"rich");
 assert.ok(rich.length>calls.length+10,"rich desktop tier adds extra purely visual luminous geometry");
});
test("Botanical station screen projection rejects empty gestures and keeps exact station identities",()=>{
 const m=new Float32Array([.13,0,0,0,0,.28,0,0,0,.18,-.09,0,0,0,0,1]);
 for(const st of Flora.STATIONS){
  const p=Flora.project(m,st.x,st.y,st.z,1400,900);
  assert.ok(p&&p.x>0&&p.x<1400&&p.y>0&&p.y<900,st.id);
  assert.equal(Flora.pick(m,p.x,p.y,1400,900)?.id,st.id);
 }
 assert.equal(Flora.pick(null,100,100,1400,900),null);
 assert.equal(Flora.pick(m,-55,-80,1400,900),null);
});
test("Botanical room gets only actual species, planted growth and original unlocks from saved world",()=>{
 const scene=read("prototypes/lw-d/flora-room.js"),app=read("js/app.js");
 const engine=read("js/engine.js"),progression=read("js/progression.js");
 assert.doesNotMatch(scene,/localStorage|indexedDB|fetch\(|setInterval\(|E\.plant\(|E\.inventPlant\(/);
 assert.match(app,/const actualPlants=Array\.isArray\(h\?\.flora\)\?h\.flora:\[\]/);
 assert.match(app,/const floraModels=\(E\.PLANTS\|\|\[\]\)\.map/);
 assert.match(app,/s\.blueprints\?\.includes\(model\.id\)/);
 assert.match(app,/plantedFlora=actualPlants\.slice\(0,6\)\.map/);
 assert.match(app,/E\.envScore\(h\)/);
 assert.match(app,/flora:\{habitat:h\?/);
 assert.match(engine,/function inventPlant\(s,species\)/);
 assert.match(engine,/function plant\(s,species\)/);
 assert.match(progression,/E\.PLANTS\.push\(\.\.\.NEW_PLANTS\)/);
 assert.match(progression,/E\.inventPlant=\(s,id\)=>/);
});
test("Four genuine 3D entrances, one gated, and the original Classic plants fallback",()=>{
 assert.equal(Hall.ROOMS.length,5);
 assert.deepEqual(Hall.ROOMS.filter(x=>x.ready).map(x=>x.id),["basic","dna","foodlab","floralab","research"]);
 assert.equal(Hall.getRoom("research").ready,true);
 const w=read("prototypes/lw-d/world.js"),hud=read("prototypes/lw-d/live-context.js");
 assert.match(w,/complexView="floralab"/);
 assert.match(w,/TrialumFloraRoom\?\.drawRoom/);
 assert.match(w,/TrialumFloraRoom\?\.pick/);
 assert.match(w,/trialum:lw:select-flora-station/);
 assert.match(hud,/inFlora=scene==="lab"&&complexRoom==="floralab"/);
 assert.match(hud,/root\.TrialumLWFloraWebGLReady===true/);
 assert.match(hud,/classic\.dataset\.lwTab="plants"/);
 assert.match(hud,/selectedFloraModel/);
 assert.match(hud,/lw-flora-progress/);
 assert.match(hud,/world\?\.flora\?\.plants/);
 assert.match(hud,/Измислувањето и садењето се во оригиналната игра/);
});
test("Android SignQA, service worker and self-contained WebGL preview include flora scene before world.js",()=>{
 const html=read("prototypes/lw-d/world.html");
 assert.match(html,/<script src="flora-room\.js"><\/script>/);
 assert.ok(html.indexOf('src="flora-room.js"')<html.indexOf('src="world.js"'));
 assert.match(read("android-template/app/build.gradle.kts"),/prototypes\/lw-d\/flora-room\.js/);
 assert.match(read("sw.js"),/prototypes\/lw-d\/flora-room\.js/);
 const preview=read("prototypes/lw-d/build_preview.py");
 assert.match(preview,/flora_room = \(base \/ "flora-room\.js"\)\.read_text/);
 assert.match(preview,/src="flora-room\.js"/);
});
