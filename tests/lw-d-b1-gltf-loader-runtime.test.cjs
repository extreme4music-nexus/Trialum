"use strict";
/**
 * B1-R1 regression that the previous B1 #176 CI was missing:
 * instantiate ACTUAL pinned Three.js r187 GLTFLoader on the REAL build-generated
 * binary .glb, then resolve semantic anchors from deserialized Object3D.extras.
 *
 * Unlike raw glTF JSON-source checks, this catches GLTFLoader name sanitization
 * and transform bugs that sent the Galaxy A55 into unintended fallback.
 */
const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {pathToFileURL}=require("node:url");
const ROOT=path.resolve(__dirname,"..");
const ROOT_B1=path.join(ROOT,"prototypes/lw-d/b1");
const schema=JSON.parse(fs.readFileSync(path.join(ROOT_B1,"pilot-scene.json"),"utf8"));
const loaderPath=path.join(ROOT,"tools/b1/node_modules/three/examples/jsm/loaders/GLTFLoader.js");
const resolverPath=path.join(ROOT_B1,"anchor-resolver.mjs");
async function loadRealGLB(){
 assert.ok(fs.existsSync(loaderPath),"run pinned npm install in tools/b1 before real loader tests");
 assert.ok(fs.existsSync(path.join(ROOT_B1,"pilot-room.glb")),"run B1 generate-glb before testing");
 const [{GLTFLoader},resolver]=await Promise.all([
  import(pathToFileURL(loaderPath).href),
  import(pathToFileURL(resolverPath).href)
 ]);
 const bytes=fs.readFileSync(path.join(ROOT_B1,"pilot-room.glb"));
 const arrayBuffer=bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength);
 const gltf=await new Promise((resolve,reject)=>new GLTFLoader().parse(arrayBuffer,"",resolve,reject));
 assert.ok(gltf.scene?.isObject3D,"real GLTFLoader must return real Three Object3D scene");
 return {...resolver,gltf};
}
test("B1-R1: official r187 GLTFLoader successfully decodes the actual packaged binary and resolves both semantic extras anchors",async()=>{
 const {gltf,resolveGLTFAnchors,collectGLTFWallBlockers}=await loadRealGLB();
 const outcome=resolveGLTFAnchors(gltf.scene,schema);
 assert.equal(outcome.anchors.size,2);
 assert.ok(outcome.meshCount>=8,"not a fake or blank GLB");
 for(const id of schema.expectedAnchors){
  const entry=outcome.anchors.get(id);
  assert.ok(entry?.node?.isObject3D,id+" is an actual loaded Three node");
  assert.equal(entry.node.userData.semanticAnchor,id);
  assert.equal(entry.node.userData.hasNoGameAuthority,true);
  assert.deepEqual(entry.worldPosition.toArray(),schema.anchors[id].at);
 }
 const walls=collectGLTFWallBlockers(gltf.scene);
 assert.ok(walls.length>=4,"real GLTFLoader preserved stable wall metadata for hit occlusion");
 for(const wall of walls)assert.ok(wall.userData.semanticPart.startsWith("pilot.wall"));
});
test("B1-R1: semantic identity survives arbitrary sanitized/renamed Object3D.name fields",async()=>{
 const {gltf,resolveGLTFAnchors}=await loadRealGLB();
 let i=0;gltf.scene.traverse(node=>{
  if(node.userData?.semanticAnchor)node.name="__THREE_SANITIZED_"+i+++"__";
 });
 assert.equal(i,2);
 const verified=resolveGLTFAnchors(gltf.scene,schema);
 assert.equal(verified.anchors.size,2,"must NOT depend on getObjectByName(id)");
 for(const id of schema.expectedAnchors)assert.ok(verified.anchors.has(id));
});
test("B1-R1: real loaded malformed semantics / duplicates / transforms correctly trigger fallback validation errors",async()=>{
 const {gltf,resolveGLTFAnchors}=await loadRealGLB();
 let res=resolveGLTFAnchors(gltf.scene,schema);
 const table=res.anchors.get("pilot.table.action-1").node;
 table.position.x+=.25;
 assert.throws(()=>resolveGLTFAnchors(gltf.scene,schema),/position differs/);
 table.position.x-=.25;
 res=resolveGLTFAnchors(gltf.scene,schema);
 assert.equal(res.anchors.size,2);
 const cloned=table.clone(false);table.parent.add(cloned);
 assert.throws(()=>resolveGLTFAnchors(gltf.scene,schema),/Duplicate GLB semantic anchor/);
 table.parent.remove(cloned);
 table.userData.semanticAnchor="unknown.user.action";
 assert.throws(()=>resolveGLTFAnchors(gltf.scene,schema),/Unexpected GLB semantic anchor/);
 table.userData.semanticAnchor="pilot.table.action-1";
 table.userData.hasNoGameAuthority=false;
 assert.throws(()=>resolveGLTFAnchors(gltf.scene,schema),/must not have game authority/);
 table.userData.hasNoGameAuthority=true;
 table.parent.remove(table);
 assert.throws(()=>resolveGLTFAnchors(gltf.scene,schema),/Missing GLB semantic anchor/);
});
test("B1-R1: exact bridge still read-only, no direct mutable original-world writes",()=>{
 const runtime=fs.readFileSync(path.join(ROOT_B1,"pilot-runtime.mjs"),"utf8");
 const resolver=fs.readFileSync(resolverPath,"utf8");
 assert.match(runtime,/resolveGLTFAnchors\(parsedRoot,sceneSpec\)/);
 assert.match(runtime,/collectGLTFWallBlockers\(objectRoot\)/);
 assert.match(runtime,/realAnchors\?\.get\(id\)\?\.worldPosition\?\.toArray\(\)/);
 assert.match(runtime,/serial!==activeLoadSerial/);
 assert.doesNotMatch(runtime,/getObjectByName\(id\)/);
 assert.match(resolver,/userData\?\.semanticAnchor/);
 assert.match(resolver,/getWorldPosition\(position\)/);
 for(const text of [runtime,resolver]){
  assert.doesNotMatch(text,/TrialumEngine|localStorage|indexedDB|\.credits\s*[+-]=|fetch\(["']https?:/);
 }
});
