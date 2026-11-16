"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,".."),load=p=>fs.readFileSync(path.join(root,p),"utf8");
const dir=path.join(root,"build/g01-watercore");
test("S7 owner camera feedback: enter INSIDE greenhouse, allow zoom-out, focus direct corridor taps",()=>{
 const a=JSON.parse(load("prototypes/lw-d/scenes/agro-greenhouse/scene.json"));
 assert.equal(a.sceneId,"trialum.ground.agro.garden");
 assert.deepEqual(a.camera.position,[0,3.3,12.2]);
 assert.deepEqual(a.camera.target,[0,2.35,0]);
 assert.ok(a.camera.maxDistance>=90);
 assert.equal(a.camera.focusOnFloorTap,true);
 assert.equal(a.camera.zoneFocusDistanceM,7.5);
 const app=load("prototypes/lw-d/scenes/agro-greenhouse/greenhouse-app.mjs");
 const rt=load("prototypes/lw-d/three-core/scene-runtime.mjs");
 assert.match(rt,/onScenePick/);
 assert.match(rt,/floorHits/);
 assert.match(app,/function zoneFromFloor/);
 assert.match(app,/zoneFocusDistanceM/);
 assert.match(app,/onScenePick:point/);
 assert.doesNotMatch(app,/world\.agro\s*=|localStorage|indexedDB|TrialumEngine/);
});
test("G-01 authored candidate GLBs are REAL, separate and uninstalled pending owner visual verdict",()=>{
 const data=JSON.parse(fs.readFileSync(path.join(dir,"G01-REVIEW-MANIFEST.json"),"utf8"));
 assert.equal(data.ownerVisualPass,false);
 assert.equal(data.gameplayImplementation,false);
 assert.equal(data.actualAquaticSlots,4);
 assert.equal(data.satelliteBasinsAdditionalSlots,0);
 assert.equal(data.assets.length,5);
 assert.equal(data.mainBasinBelowGrade,true);
 for(const item of data.assets){
  const b=fs.readFileSync(path.join(dir,item.file));
  assert.equal(b.toString("ascii",0,4),"glTF",item.file);
  assert.equal(b.readUInt32LE(4),2,item.file);
  assert.equal(b.readUInt32LE(8),b.length,item.file);
  const gltf=JSON.parse(b.subarray(20,20+b.readUInt32LE(12)).toString("utf8"));
  assert.ok(gltf.meshes.length>=1,item.file);
  assert.ok(gltf.materials.length>=7,item.file);
  assert.equal(item.designOnly,true);
  assert.equal(item.installInGame,false);
  assert.equal(item.plantSlotsCreated,0);
 }
 const gltfMain=JSON.parse((()=>{
  const b=fs.readFileSync(path.join(dir,"g01-main-basin.glb"));return b.subarray(20,20+b.readUInt32LE(12)).toString("utf8");
 })());
 const slotNodes=gltfMain.nodes.filter(x=>/^aquatic-slot-[1-4]$/.test(x.name));
 assert.equal(slotNodes.length,4);
 assert.ok(slotNodes.every(x=>x.extras?.stagedOnly===true&&x.extras?.noPlantSpawn===true));
 const android=load("android-template/app/build.gradle.kts");
 assert.doesNotMatch(android,/build\/g01-watercore/);
 const scene=JSON.parse(load("prototypes/lw-d/scenes/agro-greenhouse/scene.json"));
 assert.equal(scene.roomContents,"G01_LIVE_WATER_ARCHITECTURE_AND_REAL_ENGINE_AQUAGLOW_VISUALS");
 assert.equal(scene.poolObjects,4);assert.equal(scene.originalEngineCapacity.aquaticSlots,4);assert.equal(scene.authority.gameplayWrites,false);
});
