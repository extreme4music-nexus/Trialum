"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const Food=require("./food-room.js"),Hall=require("./lab-complex.js");
const read=p=>fs.readFileSync(path.join(__dirname,"../..",p),"utf8");

test("L3.3-A has three spatial food processing/analysis/storage stations",()=>{
 assert.deepEqual(Food.STATIONS.map(x=>x.id),["synthesis","analysis","storage"]);
 assert.ok(Food.STATIONS.every(Object.isFrozen));
 assert.equal(Food.station("fake"),null);
 const calls=[];
 Food.drawRoom((...a)=>calls.push(a),{}, {},1.6,"storage",{totalStock:6},"balanced");
 assert.ok(calls.length>70,"3D room, worktables and central vessel are actually rendered");
 assert.ok(calls.some(a=>a[1]<-4),"left wall");
 assert.ok(calls.some(a=>a[1]>4),"right wall");
 assert.ok(calls.some(a=>a[3]<-3),"back wall");
 assert.ok(calls.some(a=>a[2]<-1.3),"floor");
 assert.ok(calls.some(a=>a[2]>1.5),"ceiling light rail");
});
test("Food stations project and tap-pick in portrait or landscape without side effects",()=>{
 const m=new Float32Array([.13,0,0,0,0,.28,0,0,0,.18,-.09,0,0,0,0,1]);
 for(const st of Food.STATIONS){
  const p=Food.project(m,st.x,st.y,st.z,1400,900);
  assert.ok(p&&p.x>0&&p.x<1400&&p.y>0&&p.y<900,st.id);
  assert.equal(Food.pick(m,p.x,p.y,1400,900)?.id,st.id);
 }
 assert.equal(Food.pick(null,100,300,1400,900),null);
 assert.equal(Food.pick(m,-120,-50,1400,900),null);
});
test("Nutrition scene reads original game stock/recipes without altering resources or save schema",()=>{
 const src=read("prototypes/lw-d/food-room.js"),bridge=read("js/app.js");
 const engine=read("js/progression.js");
 assert.doesNotMatch(src,/localStorage|indexedDB|fetch\(|setInterval\(|foodFactory\.stock\[.*\]=|E\.craftFood\(/);
 assert.match(bridge,/const foodRecipes=\(E\.foodRecipes\|\|\[\]\)\.map/);
 assert.match(bridge,/s\.foodFactory\?\.stock\?\.\[recipe\.id\]/);
 assert.match(bridge,/E\.feedCompatible\(species,recipe,p\)/);
 assert.match(bridge,/food:\{labLevel:foodTier,totalStock:/);
 assert.match(engine,/E\.foodRecipes=FOOD/);
 assert.match(engine,/E\.craftFood=craft;E\.feedPrepared=feed/);
});
test("Room 3 is a real, accessible WebGL food lab with safe Classic fallback",()=>{
 assert.equal(Hall.ROOMS.length,5);
 assert.equal(Hall.getRoom("foodlab")?.ready,true);
 assert.deepEqual(Hall.ROOMS.filter(x=>x.ready).map(x=>x.id),["basic","dna","foodlab","floralab","research"]);
 const world=read("prototypes/lw-d/world.js"),hud=read("prototypes/lw-d/live-context.js");
 assert.match(world,/complexView="foodlab"/);
 assert.match(world,/TrialumFoodRoom\?\.drawRoom/);
 assert.match(world,/TrialumFoodRoom\?\.pick/);
 assert.match(world,/trialum:lw:select-food-station/);
 assert.match(hud,/inFood=scene==="lab"&&complexRoom==="foodlab"/);
 assert.match(hud,/root\.TrialumLWFoodWebGLReady===true/);
 assert.match(hud,/root\.parent\.postMessage\(\{type:"trialum:lw:classic",tab:b\.dataset\.lwTab\},origin\)/);
 assert.match(hud,/classic\.dataset\.lwTab="food"/);
 assert.match(hud,/world\?\.food\?\.recipes/);
 assert.match(hud,/Недостапен рецепт/);
});
test("Android, PWA and standalone previews include food-room module in source order",()=>{
 const html=read("prototypes/lw-d/world.html");
 assert.match(html,/<script src="food-room\.js"><\/script>/);
 assert.ok(html.indexOf('src="food-room.js"')<html.indexOf('src="world.js"'));
 assert.match(read("android-template/app/build.gradle.kts"),/prototypes\/lw-d\/food-room\.js/);
 assert.match(read("sw.js"),/prototypes\/lw-d\/food-room\.js/);
 const preview=read("prototypes/lw-d/build_preview.py");
 assert.match(preview,/food_room = \(base \/ "food-room\.js"\)\.read_text/);
 assert.match(preview,/src="food-room\.js"/);
});
