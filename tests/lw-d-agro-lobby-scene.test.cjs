"use strict";
/* S1 source gate: the lobby is REAL EXTERNAL GLB, modular, preview-only.
 * B1 verified phone stability is preserved; no room's economy is simulated.
 */
const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {pathToFileURL}=require("node:url");
const ROOT=path.resolve(__dirname,"..");
const AGRO=path.join(ROOT,"prototypes/lw-d/scenes/agro-lobby");
const load=(name)=>JSON.parse(fs.readFileSync(path.join(AGRO,name),"utf8"));
const scene=load("scene.json"),visual=load("visual-recipe.json");
const registry=JSON.parse(fs.readFileSync(path.join(ROOT,"prototypes/lw-d/scene-registry.json"),"utf8"));
const read=p=>fs.readFileSync(path.join(ROOT,p),"utf8");

test("S1 scene/asset manifest remains separate from Three engine with exactly three planned doors",async()=>{
 const {validateSceneRegistry,selectPlannedPortal}=await import(pathToFileURL(path.join(ROOT,"prototypes/lw-d/three-core/scene-registry.mjs")).href);
 const binding=validateSceneRegistry(registry,scene);
 assert.equal(binding.scene.sceneId,"trialum.ground.agro.lobby");
 assert.equal(binding.asset.uri,"./scenes/agro-lobby/atrium.glb");
 assert.equal(scene.portals.length,3);
 for(const p of scene.portals){
  assert.equal(p.action,"inspect-only");assert.equal(p.status,"planned");
  const selected=selectPlannedPortal(scene,p.id);
  assert.equal(selected.canEnter,false);
  assert.equal(selected.futureSceneId,p.futureSceneId);
 }
 assert.equal(scene.continuity.previewRouteAvailable,false);
 assert.equal(scene.continuity.firstFloorExistingLabLobby,"existing-LW-D-five-lab-classic");
 const altered=structuredClone(scene);altered.portals[0].status="live";
 assert.throws(()=>validateSceneRegistry(registry,altered),/planned\/inspect-only/);
 altered.portals[0].status="planned";altered.authority.gameplayWrites=true;
 assert.throws(()=>validateSceneRegistry(registry,altered),/may not mutate/);
});

test("S1 architectural original GLB contains 3 semantically named NO-AUTHORITY portals and premium PBR nodes",()=>{
 const file=path.join(AGRO,"atrium.glb");
 assert.ok(fs.existsSync(file),"Run build-agro-bundle.mjs before this test");
 const b=fs.readFileSync(file);
 assert.equal(b.readUInt32LE(0),0x46546c67);
 assert.equal(b.readUInt32LE(4),2);
 assert.equal(b.readUInt32LE(8),b.length);
 assert.equal(b.readUInt32LE(16),0x4e4f534a);
 const gltf=JSON.parse(b.subarray(20,20+b.readUInt32LE(12)).toString("utf8"));
 const anchors=gltf.nodes.filter(n=>n.extras?.semanticAnchor);
 assert.equal(anchors.length,3);
 assert.equal(new Set(anchors.map(x=>x.extras.semanticAnchor)).size,3);
 for(const portal of scene.portals){
  const node=anchors.find(x=>x.extras.semanticAnchor===portal.id);
  assert.ok(node,"Missing real GLB anchor "+portal.id);
  assert.equal(node.extras.hasNoGameAuthority,true);
  assert.deepEqual(node.translation,portal.at);
 }
 const meshes=gltf.nodes.filter(n=>Number.isInteger(n.mesh));
 assert.ok(meshes.length>80,"A three-door eye-candy atrium cannot be a lone gray box");
 assert.ok(gltf.meshes.length>=12,"Model must have independent PBR material/shape slots");
 assert.ok(gltf.materials.length>=12);
 assert.ok(gltf.images?.length>=3,"Original embedded textures required");
 assert.ok(gltf.materials.some(m=>m.pbrMetallicRoughness.metallicFactor>=.75),"Brass/metal PBR absent");
 assert.ok(gltf.materials.some(m=>m.emissiveFactor),"Emissive trims absent");
 assert.ok(gltf.materials.some(m=>m.alphaMode==="BLEND"),"Glazing absent");
 assert.ok(b.length<visual.performance.maxGlbBytes);
 assert.ok(meshes.every(n=>n.extras?.gameAuthority===false),"No mesh can own game logic");
});

test("S1 exact external asset and renderer bundle are packaged without remote network or separate game state",()=>{
 const engine=read("prototypes/lw-d/three-core/scene-runtime.mjs");
 const app=read("prototypes/lw-d/three-core/scene-app.mjs");
 const html=read("prototypes/lw-d/scenes/agro-lobby/lobby.html");
 const index=read("index.html");
 const launcher=read("js/lw-d-agro-lobby-launcher.js");
 const gradle=read("android-template/app/build.gradle.kts");
 const forbidden=/TrialumEngine|localStorage|indexedDB|\bfetch\s*\(\s*["']https?:|s\.agro|s\.foodFactory|craftAdditive|\.credits\s*\+=/;
 for(const file of [engine,app,launcher])assert.doesNotMatch(file,forbidden);
 assert.match(engine,/GLTFLoader/);
 assert.match(engine,/semanticAnchor/);
 assert.match(engine,/hasNoGameAuthority/);
 assert.match(engine,/class ThreeSceneEngine/);
 assert.match(engine,/setHostVisible/);
 assert.match(engine,/document\.hidden/);
 assert.match(engine,/this\.pause\(\)/);
 assert.doesNotMatch(engine,/gl\.readPixels\(/);
 assert.doesNotMatch(launcher,/addEventListener\(["']blur/);
 assert.match(html,/scene\.bundle\.js/);
 assert.match(index,/js\/lw-d-agro-lobby-launcher\.js/);
 assert.match(gradle,/prototypes\/lw-d\/three-core\/\*\*/);
 assert.match(gradle,/prototypes\/lw-d\/scenes\/agro-lobby\/\*\*/);
 assert.ok(fs.existsSync(path.join(ROOT,"prototypes/lw-d/three-core/scene.bundle.js")));
 assert.equal(scene.authority.saveWrites,false);
 assert.equal(scene.authority.inventoryWrites,false);
});

test("S1 visual recipe remains original, metric, rich and strictly bounded",()=>{
 assert.equal(visual.schemaVersion,1);
 assert.equal(visual.authoredBy,"Trialum-original-procedural-build-asset");
 assert.equal(visual.architecture.portalCentersX.length,3);
 assert.ok(visual.architecture.height>5);
 assert.ok(visual.architecture.planterPositions.length>=6);
 assert.ok(visual.architecture.columnZ.length>=4);
 assert.ok(visual.architecture.roofRibsX.length>=7);
 assert.ok(Object.keys(visual.palette).length>=12);
 assert.ok(Object.keys(visual.textures).length>=3);
 assert.ok(visual.performance.maxGlbBytes<=3500000);
 assert.equal(visual.performance.noRuntimeGeometryGeneration,true);
});
