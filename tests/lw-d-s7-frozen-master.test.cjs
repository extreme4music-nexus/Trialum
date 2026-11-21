const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto");
const ROOT=path.resolve(__dirname,".."),DIR="prototypes/lw-d/scenes/agro-greenhouse/frozen-master";
const read=p=>fs.readFileSync(path.join(ROOT,p));
const blob=b=>crypto.createHash("sha1").update("blob "+b.length+"\0").update(b).digest("hex");
test("Exact 703-instance MASTER and all 85 genuine offline GLBs",()=>{
 const source=read(DIR+"/scene.json"),m=JSON.parse(read(DIR+"/catalog.json")),s=JSON.parse(source);
 assert.equal(blob(source),"5d68670f7c073d1842b3f89c49b0394c20ffec91");
 assert.equal(m.sceneBlob,blob(source));assert.equal(s.instances.length,703);assert.equal(m.assets.length,85);
 assert.equal(new Set(s.instances.map(r=>r.id)).size,703);
 assert.deepEqual(new Set(s.instances.map(r=>r.assetId)),new Set(m.assets.map(a=>a.id)));
 assert.deepEqual(s.meta.capacity,{beds:4,slotsPerBed:5,aquaticSlots:4});assert.equal(s.meta.gameplayWrites,0);
 for(const a of m.assets){const b=read(a.runtimePath);assert.equal(blob(b),a.blobSha,a.id+" binary mismatch");assert.equal(b.length,a.bytes);assert.equal(b.toString("ascii",0,4),"glTF");assert.equal(b.readUInt32LE(4),2);assert.equal(b.readUInt32LE(8),b.length);}
 assert.match(read("prototypes/lw-d/agro-scene-bridge.js").toString(),/frozenMaster=1/);
});
