"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const ROOT=path.resolve(__dirname,".."),OUT=path.join(ROOT,"build/g01-aquatic-review");
const read=(p)=>fs.readFileSync(path.join(ROOT,p),"utf8");
const manifest=JSON.parse(fs.readFileSync(path.join(OUT,"G01-AQUATIC-ANIMATION-MANIFEST.json"),"utf8"));
function gltf(file){
 const b=fs.readFileSync(path.join(OUT,file));
 assert.equal(b.toString("ascii",0,4),"glTF",file+" must be a real GLB");
 assert.equal(b.readUInt32LE(4),2);
 assert.equal(b.readUInt32LE(8),b.byteLength);
 const jsonLength=b.readUInt32LE(12);
 assert.equal(b.readUInt32LE(16),0x4e4f534a);
 return JSON.parse(b.subarray(20,20+jsonLength).toString("utf8"));
}
test("Real water GLB has 4 independent animated surfaces, morph geometry and looping clip",()=>{
 const x=gltf("g01-water-surfaces-animated.glb");
 assert.equal(x.nodes.length,4);
 assert.equal(x.meshes.length,4);
 assert.equal(x.animations.length,1);
 const clip=x.animations[0];
 assert.equal(clip.name,"G01_WATER_RIPPLES_LOOP_6S");
 assert.equal(clip.channels.length,4);
 assert.ok(clip.channels.every(z=>z.target.path==="weights"));
 assert.ok(x.meshes.every(z=>z.primitives.length===1&&z.primitives[0].targets.length===2));
 assert.ok(x.meshes.every(z=>z.primitives[0].attributes.TEXCOORD_0!==undefined));
 assert.equal(x.materials[0].alphaMode,"BLEND");
 assert.ok(x.nodes.every(z=>z.extras.water&&z.extras.extraAquaticSlots===0));
 assert.equal(manifest.waterAnimationClip,clip.name);
 assert.equal(manifest.animationDurationSeconds,6);
 assert.equal(manifest.realAquaticSlots,4);
});
test("All 4 original Aquaglow 3D life stages and damaged/dead models are genuine, not fake species",()=>{
 assert.equal(manifest.canonicalSpecies.id,"aquaglow");
 assert.equal(manifest.canonicalSpecies.bedId,"aquarium");
 assert.equal(manifest.additionalPlantSlots,0);
 assert.deepEqual(manifest.stageRanges.map(x=>x.id),["sprout","young","growing","mature"]);
 assert.equal(manifest.stageRanges.at(-1).min,85);
 assert.equal(manifest.assets.length,7);
 for(const key of ["sprout","young","growing","mature","weakened","dead"]){
  const x=gltf("aquaglow-"+key+".glb");
  assert.ok(x.meshes.length>1,key);
  const anchor=x.nodes.find(y=>y.name==="aquaglow.root-anchor");
  assert.ok(anchor,key+" root anchor");
  assert.equal(anchor.extras.speciesId,"aquaglow");
  assert.equal(anchor.extras.canonicalBedId,"aquarium");
  assert.equal(anchor.extras.gameStateWrites,false);
 }
 assert.match(read("js/plant-lifecycle.js"),/id:"aquaglow"/);
 assert.match(read("js/plant-lifecycle.js"),/id:"aquarium",medium:"aquatic",capacity:4/);
 assert.match(read("js/plant-lifecycle.js"),/p\.growth<85\|\|p\.health<50/);
 assert.match(read("js/plant-lifecycle.js"),/p\.medium==="aquatic"/);
});
test("Water is only animated surface: the static basin-builder must NOT create a second z-fighting disc",()=>{
 const generator=read("tools/b1/build-agro-g01-watercore.py");
 assert.doesNotMatch(generator,/disk\(m,name\+"\.water"/);
 assert.match(generator,/animated surface glTF/);
});
test("New wave and plant geometry REMAIN design-only; accepted live empty shell + existing 4 slots unchanged",()=>{
 const live=JSON.parse(read("prototypes/lw-d/scenes/agro-greenhouse/scene.json"));
 assert.equal(live.previewOnly,true);
 assert.equal(live.roomContents,"EMPTY_ARCHITECTURAL_SHELL");
 assert.equal(live.plantObjects,0);
 assert.equal(live.poolObjects,0);
 assert.equal(live.props,0);
 assert.deepEqual(live.originalEngineCapacity,{terrestrialBeds:4,slotsPerBed:5,aquaticSlots:4});
 assert.equal(manifest.ownerVisualPass,false);
 assert.equal(manifest.installedInAPK,false);
 assert.equal(manifest.assets.every(x=>!x.installedInGame),true);
 assert.doesNotMatch(read("android-template/app/build.gradle.kts"),/build\/g01-aquatic-review/);
});
