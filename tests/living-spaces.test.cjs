const test=require("node:test"),assert=require("node:assert/strict"),core=require("../js/living-spaces-core.js");
const owner={id:"user-1",role:"player"},stranger={id:"user-2",role:"player"};
const opts={bounds:{width:10,depth:10,height:3},allowedAssets:["bed","desk","plant"]};
function room(){return core.create("user-1","home");}
function item(id="b",pos=[0,0,0]){return {id,assetId:"bed",position:pos,size:[2,1,1],rotationY:0,editable:true,petEditable:true};}
test("create, place, move, rotate, redecorate, undo and redo",()=>{
 let s=core.edit(room(),owner,"place",item(),opts);
 assert.equal(s.items.length,1);
 s=core.edit(s,owner,"move",{id:"b",position:[4,0,4]},opts);
 s=core.edit(s,owner,"rotate",{id:"b",rotationY:1.57},opts);
 s=core.edit(s,owner,"redecorate",{id:"b",assetId:"plant",size:[1,1,1]},opts);
 assert.equal(s.items[0].assetId,"plant");
 let u=core.undo(s,owner);assert.equal(u.items[0].assetId,"bed");
 let re=core.redo(u,owner);assert.equal(re.items[0].assetId,"plant");
});
test("owner isolation, pet autonomy and no unauthorized demolition",()=>{
 let s=core.edit(room(),owner,"place",item(),opts);
 assert.throws(()=>core.edit(s,stranger,"move",{id:"b",position:[2,0,0]},opts),/Permission/);
 assert.throws(()=>core.edit(s,{id:"user-1",role:"pet"},"remove",{id:"b"},opts),/Permission/);
 assert.throws(()=>core.petSuggestion(s,{ownerId:"user-2"},"move",{id:"b",position:[2,0,0]},opts),/Permission/);
 const updated=core.petSuggestion(s,{ownerId:"user-1"},"move",{id:"b",position:[2,0,0]},opts);
 assert.equal(updated.items[0].position[0],2);
});
test("reject collisions, room escape, foreign assets and invalid vectors",()=>{
 let s=core.edit(room(),owner,"place",item(),opts);
 assert.throws(()=>core.edit(s,owner,"place",item("c",[1,0,0]),opts),/Collision/);
 assert.throws(()=>core.edit(s,owner,"move",{id:"b",position:[9,0,9]},opts),/Outside/);
 assert.throws(()=>core.edit(s,owner,"move",{id:"b",position:[NaN,0,0]},opts),/Invalid/);
 assert.throws(()=>core.edit(s,owner,"redecorate",{id:"b",assetId:"unknown"},opts),/not allowed/);
 assert.equal(s.revision,1);
});
test("editable and petEditable flags cannot be bypassed",()=>{
 let s=core.edit(room(),owner,"place",{...item(),petEditable:false},opts);
 assert.throws(()=>core.petSuggestion(s,{ownerId:"user-1"},"move",{id:"b",position:[3,0,0]},opts),/Permission/);
});
test("no remote API, game stock, accounts or runtime write dependency",()=>{const s=core.create("user-1","home");assert.equal(s.items.length,0);assert.equal(s.revision,0);});
