"use strict";
/* S4 tests REAL generated glTF2 GLB bytes, 7 separate asset files and explicit
 * visual-only transport; do NOT confuse 2D concept render PNG with a GLB.
 */
const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto");
const ROOT=path.resolve(__dirname,"..");
const DIR=path.join(ROOT,"prototypes/lw-d/scenes/agro-food-warehouse");
const scene=JSON.parse(fs.readFileSync(path.join(DIR,"scene.json"),"utf8"));
const recipe=JSON.parse(fs.readFileSync(path.join(DIR,"visual-recipe.json"),"utf8"));
const fallback=JSON.parse(fs.readFileSync(path.join(DIR,"fallback-manifest.json"),"utf8"));
const evidencePath=path.join(DIR,"asset-evidence.json");
function glb(name){
 const b=fs.readFileSync(path.join(DIR,name));
 assert.equal(b.readUInt32LE(0),0x46546c67,"real GLB binary magic");
 assert.equal(b.readUInt32LE(4),2,"glTF version 2");
 assert.equal(b.readUInt32LE(8),b.length,"GLB length must be exact");
 assert.equal(b.readUInt32LE(16),0x4e4f534a,"GLB JSON chunk");
 const json=JSON.parse(b.subarray(20,20+b.readUInt32LE(12)).toString("utf8"));
 assert.equal(json.asset.version,"2.0");
 assert.ok(json.meshes.length>0);
 assert.ok(json.materials.length>=12);
 assert.ok(json.images.length>=3);
 return {b,json};
}
test("S4 seven actual independently loadable original offline GLB objects",()=>{
 const expected=["warehouse-shell.glb","smart-storage-rack.glb","cold-locker.glb","cargo-crates.glb","conveyor-sorter.glb","holo-inventory-kiosk.glb","mini-transporter.glb"];
 assert.deepEqual(recipe.assetNames,expected);
 assert.ok(fs.existsSync(evidencePath),"Build tools/b1/build-food-warehouse.mjs first");
 const manifest=JSON.parse(fs.readFileSync(evidencePath,"utf8"));
 assert.equal(manifest.assetCount,7);
 for(const name of expected){
  const {b,json}=glb(name);
  const record=manifest.assets.find(x=>x.file===name);
  assert.ok(record,name);
  assert.equal(record.sizeBytes,b.length);
  assert.equal(record.sha256,crypto.createHash("sha256").update(b).digest("hex"));
  assert.ok(json.nodes.some(x=>x.mesh!==undefined),"Real geometry "+name);
  assert.ok(!json.nodes.some(x=>x.extras?.gameAuthority===true),"No game state in "+name);
  assert.ok(b.length<recipe.performance.maxGlbBytes,"Mobile budget for "+name);
 }
});
test("S4 building is INTERIOR (solid ceiling), centered main sliding doorway and 2 unbuilt side doors",()=>{
 assert.equal(scene.ceiling.glazing,false);
 assert.equal(scene.ceiling.type,"solid");
 assert.equal(recipe.architecture.solidCeiling,true);
 assert.equal(scene.portals.length,3);
 assert.equal(scene.portals[0].role,"main");
 assert.equal(scene.portals[0].animation,"slide-double");
 assert.equal(scene.portals[0].backSceneId,"trialum.ground.agro.lobby");
 assert.equal(scene.portals[0].at[0],0);
 assert.ok(scene.portals.slice(1).every(p=>p.status==="planned"&&p.action==="inspect-only"));
 const {json}=glb("warehouse-shell.glb");
 const names=new Set(json.nodes.map(n=>n.name));
 for(const key of ["shell.ceiling.solid","door.main.left","door.main.right","door.subroom.cold.left","door.subroom.packing.right"])
  assert.ok(names.has(key),"Missing modeled part "+key);
 const anchors=json.nodes.filter(n=>n.extras?.semanticAnchor);
 assert.equal(anchors.length,3);
 for(const portal of scene.portals){
  const node=anchors.find(a=>a.extras.semanticAnchor===portal.id);
  assert.ok(node,"Missing semantic portal "+portal.id);
  assert.deepEqual(node.translation,portal.at);
  assert.equal(node.extras.hasNoGameAuthority,true);
 }
});
test("S4 transport and conveyors are VISUAL; zero fake inventory side effects",()=>{
 assert.equal(scene.motion.visualOnly,true);
 assert.equal(scene.authority.inventoryWrites,false);
 assert.equal(scene.authority.gameplayWrites,false);
 assert.equal(scene.authority.saveWrites,false);
 assert.equal(scene.motion.carrierCount,3);
 assert.ok(scene.motion.carrierLengthMeters<=1.12);
 assert.ok(scene.motion.speedMetersPerSecond[1]<1);
 assert.equal(scene.objectAssets.length,6);
 const carrier=glb("mini-transporter.glb").json;
 assert.ok(carrier.nodes.some(n=>n.name==="carrier.payload"));
 const belt=glb("conveyor-sorter.glb").json;
 assert.ok(belt.nodes.some(n=>n.name==="conveyor.cargo.mover"));
});
test("fallback is explicit non-GLB and no fake 'real GLB' status",()=>{
 assert.equal(fallback.mode,"non-glb-primitives");
 assert.equal(fallback.requiresGLB,false);
 assert.equal(fallback.sceneId,scene.sceneId);
 assert.ok(fallback.drawCallTarget<=45);
 assert.equal(fallback.transporters,1);
});
