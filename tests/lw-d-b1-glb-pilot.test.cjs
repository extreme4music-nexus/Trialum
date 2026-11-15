"use strict";
const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const ROOT=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(ROOT,p),"utf8");
const pilot="prototypes/lw-d/b1/";
const config=JSON.parse(read(pilot+"pilot-scene.json"));
const lock=JSON.parse(read("docs/b0/TRIALUM_B0_PROTECTED_SOURCE_LOCK_20261115.json"));
const blob=buffer=>crypto.createHash("sha1").update(Buffer.from("blob "+buffer.length+"\0")).update(buffer).digest("hex");

function parseGlb(buffer){
 assert.equal(buffer.readUInt32LE(0),0x46546c67,"real glTF2 GLB magic");
 assert.equal(buffer.readUInt32LE(4),2,"GLB v2 required");
 assert.equal(buffer.readUInt32LE(8),buffer.length,"exact GLB byte length");
 const len=buffer.readUInt32LE(12);
 assert.equal(buffer.readUInt32LE(16),0x4e4f534a,"JSON chunk");
 assert.equal(len%4,0,"JSON byte padding");
 const json=JSON.parse(buffer.subarray(20,20+len).toString("utf8"));
 const binStart=20+len;
 assert.equal(buffer.readUInt32LE(binStart+4),0x004e4942,"binary geometry is embedded");
 const binLen=buffer.readUInt32LE(binStart);
 assert.equal(binStart+8+binLen,buffer.length,"exact binary chunk");
 assert.equal(json.buffers[0].byteLength,binLen);
 return json;
}
test("B1 GLB generator truly produces external binary glTF2 scene with PBR geometry and 2 anchor nodes",async()=>{
 const {createGlb}=await import("../tools/b1/generate-glb.mjs");
 const {buffer,scene}=createGlb(config),j=parseGlb(buffer);
 assert.equal(j.asset.version,"2.0");
 assert.equal(j.asset.generator.includes("Trialum B1"),true);
 assert.ok(j.meshes.length>=4);
 assert.ok(j.materials.every(m=>m.pbrMetallicRoughness));
 assert.ok(j.accessors.some(a=>a.componentType===5126&&a.type==="VEC3"));
 assert.ok(j.nodes.some(n=>n.name==="pilot.floor"&&n.scale[0]===6&&n.scale[2]===6));
 assert.ok(j.nodes.some(n=>n.name==="pilot.door.panel"&&n.scale[1]===2.2));
 assert.ok(j.nodes.some(n=>n.name==="pilot.workbench.top"));
 for(const id of config.expectedAnchors){
  const n=j.nodes.filter(x=>x.name===id);
  assert.equal(n.length,1,"unique semantic GLB socket "+id);
  assert.deepEqual(n[0].translation,config.anchors[id].at);
  assert.equal(n[0].extras.semanticAnchor,id);
  assert.equal(n[0].extras.hasNoGameAuthority,true);
 }
 assert.equal(scene.nodes.length,j.nodes.length);
 assert.equal(config.unitsPerMeter,1);
 assert.equal(config.upAxis,"Y");
 assert.equal(config.roomMeters.width,6);
 assert.equal(config.roomMeters.depth,6);
 assert.ok(buffer.length<24000,"prototype GLB remains tiny");
});
test("invalid/duplicate/missing semantic sockets block GLB generation, never fake a valid room",async()=>{
 const {createGlb}=await import("../tools/b1/generate-glb.mjs");
 const malformed=JSON.parse(JSON.stringify(config));
 delete malformed.anchors["pilot.door.exit"];
 assert.throws(()=>createGlb(malformed),/finite position/);
 const mismatch=JSON.parse(JSON.stringify(config));
 mismatch.expectedAnchors.push("another");
 assert.throws(()=>createGlb(mismatch),/exact two/);
 const mismatchScale=JSON.parse(JSON.stringify(config));
 mismatchScale.unitsPerMeter=3;
 assert.throws(()=>createGlb(mismatchScale),/metric Y-up/);
});
test("B1 source exposes strictly separate offline Three.js GLTFLoader runner (not NovaGL2 replacement)",()=>{
 const index=read("index.html");
  assert.ok(index.includes('src="js/lw-d-interface.js"'),"Living World 3D must stay in Classic");
  assert.ok(!index.includes('src="js/lw-d-b1-pilot-launcher.js"'),"B1 debug pilot must be hidden from Classic");
  assert.ok(!index.includes('src="js/lw-d-agro-lobby-launcher.js"'),"Agro now opens from actual Living World 3D menus");
 const launcher=read("js/lw-d-b1-pilot-launcher.js");
 const page=read(pilot+"pilot.html"),runtime=read(pilot+"pilot-runtime.mjs");
 assert.match(launcher,/\.\/prototypes\/lw-d\/b1\/pilot\.html\?hosted=1/);
 assert.match(launcher,/getSceneVisible|setSceneVisible/);
 assert.match(launcher,/trialum:b1:dispose/);
 assert.match(launcher,/event\.origin!==origin/);
 assert.match(page,/src="\.\/renderer\.bundle\.js"/);
 assert.match(runtime,/from "three"/);
 assert.match(runtime,/GLTFLoader/);
 assert.match(runtime,/OrbitControls/);
 assert.match(runtime,/loadAsync\(sceneSpec\.sourceModel\)/);
 assert.match(runtime,/new THREE\.WebGLRenderer/);
 assert.match(runtime,/onTouch/);
 assert.match(runtime,/resolveGLTFAnchors/);
 assert.match(read(pilot+"anchor-resolver.mjs"),/getWorldPosition/);
 assert.doesNotMatch(runtime,/getObjectByName\(id\)/);
 assert.match(runtime,/fallbackRoom/);
 assert.match(runtime,/getContext\("webgl2"/);
 assert.match(runtime,/requestAnimationFrame/);
 assert.match(runtime,/cancelAnimationFrame/);
 assert.match(runtime,/webglcontextlost/);
 assert.match(runtime,/renderer\?\.dispose\(\)/);
 assert.match(runtime,/trialum:b1:visibility/);
 assert.match(runtime,/trialum:b1:dispose/);
 assert.match(runtime,/!document\.hidden|document\.visibilityState==="visible"/);
 assert.doesNotMatch(runtime,/TrialumEngine|TrialumLWBridge|\.credits\s*[+-]=|localStorage|indexedDB|fetch\(["']https?:/);
 assert.doesNotMatch(launcher,/TrialumEngine|TrialumLWBridge|\.credits\s*[+-]=|indexedDB|localStorage/);
});
test("B1 manifest and Android packaging use local real GLB, authored pilot html and bundle",()=>{
 const app=read("android-template/app/build.gradle.kts");
 assert.match(app,/prototypes\/lw-d\/b1\/\*\*/);
 const scene=read(pilot+"pilot-scene.json");
 assert.doesNotMatch(scene,/https?:\/\//);
 assert.equal(config.sourceModel,"./pilot-room.glb");
 assert.equal(config.b1PilotOnly,true);
 assert.equal(config.authority.startsWith("read-only"),true);
 const packageFile=JSON.parse(read("tools/b1/package.json"));
 assert.equal(packageFile.dependencies.three,"0.187.0");
 assert.equal(packageFile.dependencies.esbuild,"0.28.2");
 const packager=read("tools/b1/build-assets.mjs");
 assert.match(packager,/outfile:output/);
 assert.match(packager,/createGlb\(manifest\)/);
 assert.match(packager,/node_modules\/three\/LICENSE/);
 assert.match(packager,/legalComments:"external"/);
 assert.ok(fs.existsSync(path.join(ROOT,pilot+"pilot-room.glb")),"generate GLB before B1 build tests");
 assert.ok(fs.existsSync(path.join(ROOT,pilot+"renderer.bundle.js")),"bundle Three in build prior to native packing");
 parseGlb(fs.readFileSync(path.join(ROOT,pilot+"pilot-room.glb")));
 const bundle=read(pilot+"renderer.bundle.js");
 assert.ok(bundle.length>10000,"bundled Three.js is REAL, not fake empty placeholder");
});
test("B1 remains visually isolated and original owner-accepted plants/food/3D lab/signing preserve byte identity",()=>{
 // Explicit owner-authorized S2 menu-only integration files. Everything else
 // from the B0 owner lock must retain byte identity. Additional invariants
 // for these five paths are in lw-d-agro-world3d-integration.test.cjs.
 const approvedNewFiles=new Set(["index.html","android-template/app/build.gradle.kts","sw.js",
  ".github/workflows/lw-d-android-qa.yml","tests/lw-d-fcm-build.test.cjs",
  "tests/lw-d-lobby-entry.test.cjs","prototypes/lw-d/world.html",
  "prototypes/lw-d/world.js","prototypes/lw-d/world-navigation.js",
  "prototypes/lw-d/world-hub-pages.js","prototypes/lw-d/spatial-audio.js"]);
 const protectedPaths=Object.keys(lock.fileLocks);
 assert.equal(protectedPaths.length,51);
 for(const pathName of protectedPaths){
  if(approvedNewFiles.has(pathName))continue; // B1 intentionally adds one script and asset include, no gameplay mechanics.
  const old=lock.fileLocks[pathName];
  assert.equal(blob(fs.readFileSync(path.join(ROOT,pathName))),old.blobSha,"original owner-passed file altered: "+pathName);
 }
 const lab=require("../prototypes/lw-d/lab-complex.js");
 assert.deepEqual(lab.ROOMS.map(x=>x.id),["basic","dna","foodlab","floralab","research"]);
 const E=require("../js/engine.js");require("../js/evolution.js");require("../js/progression.js");require("../js/longplay.js");require("../js/plant-lifecycle.js");
 for(const op of ["produceSeedling","plantInGarden","transplantPlant","craftAdditive","applyAdditive"])assert.equal(typeof E[op],"function");
});
test("B1 optional PWA offline caching never blocks original Classic SW installation",()=>{
 const sw=read("sw.js");
 assert.match(sw,/B1_OPTIONAL/);
 assert.match(sw,/pilot-room\.glb/);
 assert.match(sw,/renderer\.bundle\.js/);
 assert.match(sw,/Promise\.allSettled/);
 assert.match(sw,/await c\.addAll\(FILES\)/);
 assert.match(sw,/caches\.match\(e\.request\)/);
});
test("B1 UI explicitly does NOT claim real device FPS, background engine or newer B-stage has passed",()=>{
 const page=read(pilot+"pilot.html");
 const code=read(pilot+"pilot-runtime.mjs");
 assert.match(page,/No engine mutations/);
 assert.match(page,/No user data/);
 assert.match(page,/NOT a GPU power|not GPU power/i);
 assert.match(code,/NOT visible-pixel proof or GPU\/battery power measurement/);
 assert.match(code,/hostVisible/);
 assert.match(code,/!disposed/);
 assert.match(code,/!contextLost/);
 assert.doesNotMatch(page,/https:\/\/(cdn|unpkg|jsdelivr|esm\.)/i);
});
