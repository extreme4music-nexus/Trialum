"use strict";
/* S7.1-2: real empty GLB shell, exactly original Atrium route and no gameplay. */
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const ROOT=path.resolve(__dirname,"..");
const src=p=>fs.readFileSync(path.join(ROOT,p),"utf8");
const dir="prototypes/lw-d/scenes/agro-greenhouse";
const scene=JSON.parse(src(dir+"/scene.json")),registry=JSON.parse(src("prototypes/lw-d/scene-registry.json"));
const blueprint=JSON.parse(src("docs/blueprints/LW_D_AGRO_S7_GREENHOUSE_BLUEPRINT_V2_SPATIAL_LAYOUT_20261116.json"));
const lobby=JSON.parse(src("prototypes/lw-d/scenes/agro-lobby/scene.json"));
function decode(name){
 const f=path.join(ROOT,dir,name),b=fs.readFileSync(f);
 assert.equal(b.toString("ascii",0,4),"glTF");assert.equal(b.readUInt32LE(4),2);
 assert.equal(b.readUInt32LE(8),b.length);assert.equal(b.readUInt32LE(16),0x4e4f534a);
 return {b,gltf:JSON.parse(b.subarray(20,20+b.readUInt32LE(12)).toString("utf8"))};
}
test("S7 shell matches canonical 4-finger blueprint, Atrium ID and engine capacity",()=>{
 assert.equal(scene.sceneId,"trialum.ground.agro.garden");
 assert.equal(scene.entryFrom,lobby.sceneId);
 assert.equal(lobby.portals[1].id,"ground.agro.lobby.door-garden");
 assert.deepEqual(scene.continuity.lobbyDoorLocalXYZ,lobby.portals[1].at);
 assert.equal(lobby.portals[1].futureSceneId,scene.sceneId);
 assert.deepEqual(scene.portals[0].at,[0,1.55,24]);
 assert.equal(scene.portals[0].id,"ground.agro.greenhouse.door-main");
 assert.equal(scene.authority.readOnly,true);
 for(const v of ["saveWrites","gameplayWrites","inventoryWrites"])assert.equal(scene.authority[v],false);
 assert.equal(scene.previewOnly,true);
 assert.equal(scene.poolObjects,0);assert.equal(scene.plantObjects,0);assert.equal(scene.props,0);
 assert.equal(scene.originalEngineCapacity.terrestrialBeds,4);
 assert.equal(scene.originalEngineCapacity.slotsPerBed,5);
 assert.equal(scene.originalEngineCapacity.aquaticSlots,4);
 assert.equal(blueprint.architecture.branches.length,4);
 assert.equal(blueprint.futureFitReservations.terrestrial.beds.length,4);
 assert.equal(blueprint.futureFitReservations.centralWater.aquaticSlots.length,4);
 assert.equal(registry.entries.find(x=>x.sceneId===scene.sceneId)?.status,"owner-preview-empty-shell");
 assert.equal(registry.assetRegistry.find(x=>x.assetId===scene.modelAssetId)?.offline,true);
});
test("Three GLB files are real meshes, modular and wholly without props",()=>{
 for(const name of ["greenhouse-shell.glb","greenhouse-floor-shell.glb","greenhouse-glass-roof-shell.glb"]){
  const {b,gltf}=decode(name);
  assert.ok(gltf.meshes.length>=2,name+" mesh count");
  assert.ok(gltf.accessors.some(x=>x.type==="VEC3"),name+" positions");
  assert.ok(gltf.materials.some(x=>x.pbrMetallicRoughness),name+" PBR");
  assert.ok(b.length>5000&&b.length<2_000_000,name+" size");
  assert.ok(!/plant|basin|rack|robot|conveyor/i.test(gltf.nodes.map(n=>n.name).join("\n")),name+" polluted with props");
 }
 const {gltf}=decode("greenhouse-shell.glb");
 const main=gltf.nodes.filter(n=>n.extras?.semanticAnchor);
 assert.equal(main.length,1);
 assert.equal(main[0].extras.semanticAnchor,scene.portals[0].id);
 assert.equal(main[0].extras.hasNoGameAuthority,true);
 assert.deepEqual(main[0].translation,scene.portals[0].at);
 assert.equal(gltf.nodes.filter(n=>n.extras?.zoneAnchor).length,5);
 assert.ok(gltf.materials.some(m=>m.alphaMode==="BLEND"),"Real glass material");
 const bounds=gltf.accessors.filter(a=>a.type==="VEC3"&&a.min&&a.max);
 assert.ok(Math.min(...bounds.map(a=>a.min[2]))<-60,"Central longest finger absent");
 assert.ok(Math.max(...bounds.map(a=>a.max[2]))>24,"Atrium connector missing");
 const evidence=JSON.parse(src(dir+"/asset-evidence.json"));
 assert.equal(evidence.gameStateWrites,false);
 assert.equal(evidence.plantSlotsCreated,0);
 assert.equal(evidence.noProps,true);
 for(const name of Object.keys(evidence.assetFiles))
  assert.equal(evidence.assetFiles[name].bytes,fs.statSync(path.join(ROOT,dir,name)).size);
});
test("One parent HUD and isolated garden preview; no fake engine, no remote content",()=>{
 const app=src(dir+"/greenhouse-app.mjs"),bridge=src("prototypes/lw-d/agro-scene-bridge.js");
 const hud=src("prototypes/lw-d/live-context.js"),runtime=src("prototypes/lw-d/three-core/scene-runtime.mjs");
 const gradle=src("android-template/app/build.gradle.kts");
 const bundle=path.join(ROOT,dir,"greenhouse.bundle.js");
 assert.ok(fs.existsSync(bundle)&&fs.statSync(bundle).size>50_000,"Offline Three.js bundle not built");
 assert.match(bridge,/switchRoom\("garden"\)/);assert.match(bridge,/trialum:agro:greenhouse:back/);
 assert.match(bridge,/ground\.agro\.greenhouse\.door-main/);
 assert.match(hud,/agroRoom==="garden"/);
 assert.match(hud,/dataset\.lwAgroZone/);
 assert.match(runtime,/REAL Empty Greenhouse GLB loaded/);
 assert.match(gradle,/prototypes\/lw-d\/scenes\/agro-greenhouse\/\*\*/);
 assert.match(src(dir+"/greenhouse.css"),/inside-living-world-3d[\s\S]*display:none!important/);
 for(const file of [app,bridge]){
  assert.doesNotMatch(file,/localStorage|indexedDB|TrialumEngine|\.credits\s*[+-]=|s\.agro|fetch\(\s*["']https?:/);
 }
});
