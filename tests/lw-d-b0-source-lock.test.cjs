"use strict";
/**
 * B0 architectural source freeze. This test intentionally checks SOURCE BYTES
 * without rewriting the original game or accepting new visual features.
 * Git object hashing: sha1("blob <byte_length>\0" + original bytes).
 *
 * The lock belongs to B0 only. B1/B2 require a new owner-reviewed lock
 * amendment rather than quietly changing this manifest or backdooring old code.
 */
const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const root=path.resolve(__dirname,"..");
const lock=JSON.parse(fs.readFileSync(path.join(root,"docs/b0/TRIALUM_B0_PROTECTED_SOURCE_LOCK_20261115.json"),"utf8"));
const file=p=>fs.readFileSync(path.join(root,p),"utf8");
const gitBlob=bytes=>crypto.createHash("sha1").update(Buffer.from("blob "+bytes.length+"\0")).update(bytes).digest("hex");
test("B0 pinned parent source, accepted signed engine and owner QA boundary",()=>{
 assert.equal(lock.schemaVersion,1);
 assert.equal(lock.phase,"B0");
 assert.equal(lock.status,"BASELINE_FROZEN_SOURCE_SNAPSHOT_NOT_OWNER_PASS");
 assert.equal(lock.sourceCommit,"e3f5a9ffe24c452a9bad489785fe112db1265094");
 assert.equal(lock.signedEngineCommit,"7466c38c0f863cf4299fbdf6263f823c60b2608d");
 assert.equal(lock.applicationId,"com.trialum.ziivaiskra.signqa");
 assert.match(lock.ownerStatus,/OWNER PASS/);
 assert.ok(lock.noNewRoomAssets&&lock.noGameRuntimeEditsInB0);
});
test("B0 51 protected core / save / live scene / signing / regression source blobs are unchanged",async t=>{
 const entries=Object.entries(lock.fileLocks);
 assert.equal(entries.length,51,"B0 must cover all 51 original source/test assets, not just 3D UI");
 const categories=new Set(entries.map(([,v])=>v.category));
 for(const cat of ["original_engine_and_save","friends_and_ai","legacy_scene_and_bridge","android_and_signing","regression_tests"])assert.ok(categories.has(cat),cat);
 for(const [p,meta]of entries){
  await t.test(p,()=>{
   assert.ok(!p.includes("..")&&!path.isAbsolute(p),"manifest path must be a safe relative file");
   const bytes=fs.readFileSync(path.join(root,p));
   assert.equal(bytes.byteLength,meta.bytes,"size drift: "+p);
   assert.equal(gitBlob(bytes),meta.blobSha,"B0 freezes existing source exactly; do NOT silently alter "+p);
  });
 }
});
test("B0 still uses original parent engine and exact original flora Classic UI",()=>{
 const html=file("index.html");
 const order=["js/engine.js","js/evolution.js","js/progression.js","js/longplay.js","js/plant-lifecycle.js","js/plant-lifecycle-ui.js"];
 let prev=-1;
 for(const js of order){const ix=html.indexOf('src="'+js+'"');assert.ok(ix>prev,"original game modules load in canonical order: "+js);prev=ix;}
 const original=file("js/plant-lifecycle.js");
 for(const name of ["produceSeedling","plantInGarden","waterPlant","transplantPlant","applyAdditive","craftAdditive","removeDeadPlant"])assert.ok(original.includes(name),name);
 const classic=file("js/longplay-ui.js");assert.match(classic,/TrialumPlantUI/);
 const parent=file("js/app.js");for(const op of ["agroSeed","agroPlant","agroWater","agroTransplant","agroCraft","agroTreat"])assert.ok(parent.includes("case '"+op+"'"));
});
test("B0 locks the real five-door first floor and does not misreport future three-door Agro Lobby",()=>{
 const hall=require("../prototypes/lw-d/lab-complex.js");
 assert.equal(hall.INITIAL_VIEW,"hub");
 assert.deepEqual(hall.ROOMS.map(x=>x.id),["basic","dna","foodlab","floralab","research"]);
 const proto=file("prototypes/lw-d/world.js");
 assert.match(proto,/getContext\("webgl2"/);
 assert.match(proto,/canRender\(\)/);
 const bridge=file("js/lw-d-interface.js");
 assert.match(bridge,/TrialumLWBridge/);
 assert.match(bridge,/event\.origin!==origin/);
 assert.equal(lock.namedSceneRoles.agroLobby.startsWith("not physically built"),true);
 assert.match(lock.namedSceneRoles.globalMainLobby,/HUD\/navigation shell/);
});
test("B0 keeps signed Android app identity, offline original and no 4th Firebase app",()=>{
 const gradle=file("android-template/app/build.gradle.kts");
 assert.match(gradle,/applicationId = "com\.trialum\.ziivaiskra"/);
 assert.match(gradle,/applicationIdSuffix = "\.signqa"/);
 assert.match(gradle,/trialumFirebaseAppIdSignqa/);
 const sw=file("sw.js");
 for(const src of ["js/plant-lifecycle.js","js/plant-lifecycle-ui.js","prototypes/lw-d/lab-complex.js","prototypes/lw-d/world.js"])
  assert.ok(sw.includes(src),"offline cache omission: "+src);
 assert.ok(file("android-template/app/build.gradle.kts").includes('include("index.html"'));
});
test("B0 points any subsequent stage to the owner-approved main GLB contracts and preserves known upstream English-sync debt",()=>{
 const guide=file("AGENTS.md");
 for(const name of ["TRIALUM_3D_WORLD_MASTER_PLAN_B0_B9_20261115.md","TRIALUM_3D_ASSET_SCENE_CONTRACT_20261115.md","TRIALUM_3D_PHASE_GATES_20261115.md","ADR_004_GLTF_FIRST_THREEJS_PILOT_20261115.md"])assert.ok(guide.includes(name),name);
 const known=lock.knownOutstandingCI.find(x=>x.workflow.includes("English"));
 assert.equal(known.status.startsWith("FAIL"),true);
 assert.ok(known.lastSeenRun.includes("/actions/runs/"));
 assert.notEqual(lock.status,"OWNER_PASS");
});
