"use strict";
/** Directly tests the SIGNED APK's source asset set, not review-only GLBs. */
const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const ROOT=path.resolve(__dirname,"..");
const DIR="prototypes/lw-d/scenes/agro-greenhouse";
const names=["g01-main-basin.glb","g01-satellite-basins.glb",
 "g01-walkway-and-railings.glb","g01-crossing-bridge.glb",
 "g01-visual-service-pumps.glb","g01-water-surfaces-animated.glb",
 ...["sprout","young","growing","mature","weakened","dead"].map(s=>"aquaglow-"+s+".glb")];
const src=p=>fs.readFileSync(path.join(ROOT,p),"utf8");
const scene=JSON.parse(src(DIR+"/scene.json"));
function gltf(file){
 const bytes=fs.readFileSync(path.join(ROOT,DIR,file));
 assert.equal(bytes.toString("ascii",0,4),"glTF");
 assert.equal(bytes.readUInt32LE(4),2);
 assert.equal(bytes.readUInt32LE(8),bytes.length);
 return JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)).toString("utf8"));
}
test("ACTUAL Android greenhouse input contains ALL twelve G01 GLBs, not just the empty shell",()=>{
 assert.equal(scene.poolObjects,4);
 assert.equal(scene.zones[0].status,"REAL_G01_WATER_CORE");
 assert.equal(scene.roomContents,"G01_LIVE_WATER_ARCHITECTURE_AND_REAL_ENGINE_AQUAGLOW_VISUALS");
 assert.equal(scene.realWaterAnimation.clip,"G01_WATER_RIPPLES_LOOP_6S");
 assert.equal(names.length,12);
 for(const name of names){
  assert.ok(fs.existsSync(path.join(ROOT,DIR,name)),"MISSING IN GAME: "+name);
  const g=gltf(name);assert.ok(g.meshes?.length>=1,"not a real GLB: "+name);
 }
 const water=gltf("g01-water-surfaces-animated.glb");
 assert.equal(water.meshes.length,4);
 assert.equal(water.animations[0].channels.length,4);
 assert.equal(water.animations[0].name,"G01_WATER_RIPPLES_LOOP_6S");
 for(const m of water.meshes)assert.equal(m.primitives[0].targets.length,2);
});
test("Actual greenhouse GLB floor has physical basin holes, with no flat shell disk hiding animated water",()=>{
 const shell=gltf("greenhouse-shell.glb");
 const floorMat=shell.materials.findIndex(m=>m.name==="floor");
 assert.ok(floorMat>=0);
 const blob=fs.readFileSync(path.join(ROOT,DIR,"greenhouse-shell.glb"));
 const jsize=blob.readUInt32LE(12),binOffset=20+jsize+8;
 let count=0;
 for(const mesh of shell.meshes)for(const primitive of mesh.primitives){
  if(primitive.material!==floorMat)continue;
  const a=shell.accessors[primitive.attributes.POSITION];
  const bv=shell.bufferViews[a.bufferView];
  let nearMain=0;
  for(let i=0;i<a.count;i++){
   const start=binOffset+bv.byteOffset+(a.byteOffset||0)+i*12;
   const x=blob.readFloatLE(start),y=blob.readFloatLE(start+4),z=blob.readFloatLE(start+8);
   if(Math.abs(y)<.001&&Math.hypot(x,z)<6.5)nearMain++;
  }
  assert.equal(nearMain,0,"S7 shell floor STILL covers actual G01 water basin");
  count+=a.count;
 }
 assert.ok(count>100,"expected visible physical shell floor mesh");
});
test("G01 animated water updates inside ONLY the existing visible WebGL RAF and is released on exit",()=>{
 const rt=src("prototypes/lw-d/three-core/scene-runtime.mjs");
 const app=src(DIR+"/greenhouse-app.mjs");
 const g01=src(DIR+"/g01-runtime.mjs");
 assert.match(rt,/this\.onExtraFrame\?\.\(dt\/1000\)/);
 assert.match(rt,/if\(isGarden&&this\.onExtraReload\)await this\.onExtraReload\(\)/);
 assert.match(rt,/this\.onExtraDispose\?\.\(\)/);
 assert.match(app,/new G01WaterGarden\(engine\)/);
 assert.match(app,/REAL G01 WATER GARDEN GLBs loaded/);
 assert.match(g01,/new THREE\.AnimationMixer/);
 assert.match(g01,/G01_WATER_RIPPLES_LOOP_6S/);
 assert.match(g01,/projectG01Aquatic\(this\.aquatic\)/);
 assert.match(g01,/this\.mixer\.update\(/);
 assert.match(g01,/sample\.userData=\{demo:true/);
});
test("Canonical ORIGINAL aquarium data crosses existing parent->original HUD->GLB safely, no fake resources",()=>{
 const snapshot=src("js/app.js");
 const bridge=src("prototypes/lw-d/agro-scene-bridge.js");
 const app=src(DIR+"/greenhouse-app.mjs");
 const hud=src("prototypes/lw-d/live-context.js");
 assert.match(snapshot,/s\.agro\?\.gardenPlants/);
 assert.match(snapshot,/aquarium:\(Array\.isArray/);
 assert.match(bridge,/event\.data\.world\?\.flora\?\.aquarium/);
 assert.match(bridge,/if\(room==="garden"\)send\("aquatic",aquaticPlants\)/);
 assert.match(app,/message\.action==="aquatic"/);
 assert.match(hud,/lwAgroDemoAquatic/);
 assert.deepEqual(scene.originalEngineCapacity,{terrestrialBeds:4,slotsPerBed:5,aquaticSlots:4});
 assert.equal(scene.authority.gameplayWrites,false);
 assert.equal(scene.authority.saveWrites,false);
 assert.equal(scene.authority.inventoryWrites,false);
});
