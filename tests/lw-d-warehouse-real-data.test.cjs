"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,"..");
const Inventory=require("../js/warehouse-inventory.js");
const recipes=[{id:"starter",name:"Starter",cost:{biomass:8},yield:2},{id:"blue",name:"Blue",cost:{biomass:9},yield:1}];
const world=()=>({version:1,foodFactory:{stock:{starter:7,blue:2}}});
const sum=v=>v.rack+v.cold+v.packing+v.hand;
test("Every warehouse shelf/room/hand is a physically allocated portion of original engine stock",()=>{
 const s=world();
 let view=Inventory.project(s,recipes);
 assert.equal(sum(view[0]),7);
 assert.equal(view[0].rack,7);
 assert.equal(Inventory.action(s,recipes,{op:"take",recipe:"starter",from:"rack",to:"hand"}).ok,true);
 assert.equal(Inventory.action(s,recipes,{op:"put",recipe:"starter",from:"hand",to:"cold"}).ok,true);
 assert.equal(Inventory.action(s,recipes,{op:"take",recipe:"starter",from:"rack",to:"hand"}).ok,true);
 assert.equal(Inventory.action(s,recipes,{op:"put",recipe:"starter",from:"hand",to:"packing"}).ok,true);
 view=Inventory.project(s,recipes);
 assert.deepEqual([view[0].rack,view[0].cold,view[0].packing,view[0].hand],[5,1,1,0]);
 assert.equal(sum(view[0]),7);
 assert.equal(s.foodFactory.stock.starter,7,"Transfers must not create or remove a portion");
 const saved=JSON.parse(JSON.stringify(s));
 assert.deepEqual(Inventory.project(saved,recipes),view,"Locations survive the same original JSON backup/restore");
});
test("External Classic feeding/crafting reconciles location labels without false inventory",()=>{
 const s=world();
 Inventory.action(s,recipes,{op:"take",recipe:"starter",from:"rack",to:"hand"});
 Inventory.action(s,recipes,{op:"put",recipe:"starter",from:"hand",to:"cold"});
 s.foodFactory.stock.starter=1; // Original real pet feeding consumed 6, nothing in WebGL can refund it.
 const view=Inventory.project(s,recipes)[0];
 assert.equal(sum(view),1);
 assert.ok(view.cold<=1);
 s.foodFactory.stock.starter=4; // Original real crafting added three portions.
 assert.equal(sum(Inventory.project(s,recipes)[0]),4);
 assert.equal(Inventory.project(s,recipes)[0].rack>=3,true);
});
test("No negative quantities, cross-recipe forgery, replay on empty hand, or destructive failures",()=>{
 const s=world(),before=JSON.stringify(s);
 const invalid=[
  {op:"take",recipe:"fake",from:"rack",to:"hand"},
  {op:"take",recipe:"starter",from:"hand",to:"rack"},
  {op:"put",recipe:"starter",from:"rack",to:"hand"},
  {op:"put",recipe:"starter",from:"hand",to:"fake"},
  {op:"craft",recipe:"starter",from:"rack",to:"hand"},
  {op:"put",recipe:"starter",from:"hand",to:"cold"}
 ];
 for(const arg of invalid)assert.equal(Inventory.action(s,recipes,arg).ok,false);
 assert.equal(JSON.stringify(s),before,"Rejected actions must leave original save untouched");
 for(let i=0;i<7;i++)assert.equal(Inventory.action(s,recipes,{
  op:"take",recipe:"starter",from:"rack",to:"hand"}).ok,true);
 assert.equal(Inventory.action(s,recipes,{op:"take",recipe:"starter",from:"rack",to:"hand"}).ok,false);
 assert.equal(sum(Inventory.project(s,recipes)[0]),7);
});
test("Exactly one canonical game engine/save bridge, real room geometry + HUD, no separate data or servers",()=>{
 const app=fs.readFileSync(path.join(root,"js/app.js"),"utf8");
 const wire=fs.readFileSync(path.join(root,"js/lw-d-interface.js"),"utf8");
 const hud=fs.readFileSync(path.join(root,"prototypes/lw-d/live-context.js"),"utf8");
 const bridge=fs.readFileSync(path.join(root,"prototypes/lw-d/agro-scene-bridge.js"),"utf8");
 const renderer=fs.readFileSync(path.join(root,"prototypes/lw-d/scenes/agro-food-warehouse/warehouse-runtime.mjs"),"utf8");
 const interactions=fs.readFileSync(path.join(root,"prototypes/lw-d/scenes/agro-food-warehouse/warehouse-interactions.mjs"),"utf8");
 const rooms=fs.readFileSync(path.join(root,"prototypes/lw-d/scenes/agro-food-warehouse/warehouse-rooms.mjs"),"utf8");
 assert.match(app,/warehouseOperation\(kind,payload\)/);
 assert.match(app,/TrialumWarehouseInventory\?\.project/);
 assert.match(app,/notice\(result,"tap"\)/);
 assert.match(app,/E\.craftFood\(s,recipeId\)/);
 assert.match(app,/E\.feedPrepared\(s,pet\.id,recipeId\)/);
 assert.match(wire,/trialum:lw:warehouse-result/);
 assert.match(wire,/API\(\)\?\.warehouseOperation/);
 assert.match(hud,/function renderWarehouseInventory\(\)/);
 assert.match(hud,/dataSet|dataset\.lwWarehouseDecision/);
 assert.match(hud,/trialum:lw:warehouse/);
 assert.match(bridge,/currentArea:/);
 assert.match(renderer,/WarehouseInteractions/);
 assert.match(interactions,/exitToAtrium/);
 assert.match(interactions,/canonical\.|ORIGINAL STOCK/);
 assert.match(rooms,/roof\.solid/);
 assert.doesNotMatch(interactions,/localStorage|indexedDB|\.stock\s*[+\-]=/);
});
