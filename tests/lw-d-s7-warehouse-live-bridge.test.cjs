"use strict";
/* Runtime-oriented original engine -> 3D bridge -> nested Warehouse iframe tests.
 * Actual user stock is NEVER made up; test fixture only, in memory.
 */
const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const ROOT=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(ROOT,p),"utf8");
const E=require("../js/engine.js");
require("../js/evolution.js");
require("../js/progression.js");
require("../js/longplay.js");
const I=require("../js/warehouse-inventory.js");
require("../js/food-supply-chain.js");

function world(){
 const s=E.newGame("demo",1700000000000);
 s.stage=7;s.insight=2000;s.compounds=3000;s.biomass=3000;s.energy=100;s.cells=3000;
 for(const k of Object.keys(s.elements))s.elements[k]=3000;
 s.habitats=[{id:"hab-1",name:"Food QA",biome:"lagoon",capacity:150,
  minerals:{macro:70,micro:70},chem:{ph:7.1,temp:24,oxygen:90,toxins:3},
  cleanliness:90,flora:[],dayActions:4,bornDay:1}];
 s.activeHabitat="hab-1";s.lastDay=40;s.demoDay=40;s.research.level=3;
 return s;
}
const foodSnapshot=s=>{
 const recipes=I.project(s,E.foodRecipes,E.currentPet(s)?.id);
 return {warehouseReady:true,warehouseSource:"TrialumWarehouseInventory.project",
  totalStock:recipes.reduce((n,r)=>n+r.stock,0),
  recipes:recipes.map(r=>({id:r.id,name:r.name,stock:r.stock,
   warehouse:r.warehouse,rack:r.rack,cold:r.cold,packing:r.packing,
   hand:r.hand,petReserve:r.petReserve}))};
};
const classList={add(){},remove(){},toggle(){}};
function elm(tag, sent) {
 const c={tagName:tag,children:[],dataset:{},classList,
  addEventListener(){},setAttribute(){},append(...items){this.children.push(...items);},
  appendChild(e){this.children.push(e);return e;},remove(){},
  querySelector(sel){return this.children.find(e=>sel===".emoji"?e.className==="emoji":e.tagName==="small")||null;}};
 if(tag==="iframe")c.contentWindow={postMessage(message,origin){sent.push({message,origin});}};
 return c;
}
function nestedHarness() {
 const events=new Map(),sent=[];
 const parent={};
 const dock=elm("div",sent), host=elm("main",sent);
 const doc={hidden:false,body:{classList},createElement:t=>elm(t,sent),
  getElementById:id=>id==="frame"?host:null,
  querySelector:sel=>sel===".dock"?dock:null,
  addEventListener(){}};
 const root={
  document:doc,parent,location:{origin:"https://trialum.test",search:"?live=1"},
  CustomEvent:class{constructor(type,options){this.type=type;this.detail=options?.detail;}},
  addEventListener(type,fn){(events.get(type)||events.set(type,[]).get(type)).push(fn);},
  dispatchEvent(e){for(const fn of (events.get(e.type)||[]))fn(e);},
  setTimeout(fn){fn();return 1;},clearTimeout(){},
  TrialumHubPages:{close(){},open(){}}
 };
 const context=vm.createContext({globalThis:root,URLSearchParams,Set,Map,
  Number,String,Math,Array,Object,Boolean,CustomEvent:root.CustomEvent});
 vm.runInContext(read("prototypes/lw-d/agro-scene-bridge.js"),context,{filename:"agro-scene-bridge.js"});
 root.dispatchEvent(new root.CustomEvent("trialum:lw:agro-lobby",{detail:{
  sceneId:"trialum.ground.agro.lobby",from:"hub"
 }}));
 assert.equal(root.TrialumAgroSceneBridge.isOpen(),true);
 assert.equal(root.TrialumAgroSceneBridge.enterWarehouse(),true);
 assert.equal(root.TrialumAgroSceneBridge.currentRoom(),"warehouse");
 assert.match(host.children[0].children[0].src,/agro-food-warehouse\/warehouse\.html/);
 const pushFood=food=>{
  root.dispatchEvent({type:"message",origin:root.location.origin,source:parent,
   data:{type:"trialum:lw:state",world:{language:"mk",food}}});
  return sent.filter(x=>x.message.type==="trialum:agro:command"&&
   x.message.action==="inventory").at(-1)?.message.value;
 };
 return {root,pushFood,sent};
}

test("Classic food lab craft flows into original rack and real 3D nested warehouse frame",()=>{
 const s=world(),h=nestedHarness();
 const initial=h.pushFood(foodSnapshot(s));
 assert.equal(initial.ready,true);
 assert.equal(initial.recipes.find(r=>r.id==="manna").rack,0,"empty save shows real zero");
 const before=JSON.stringify(s);
 assert.equal(E.craftFood(s,"manna").ok,true);
 const manufactured=h.pushFood(foodSnapshot(s));
 assert.equal(manufactured.source,"original-TrialumWarehouseInventory.project");
 assert.equal(manufactured.recipes.find(r=>r.id==="manna").rack,3);
 assert.equal(manufactured.recipes.find(r=>r.id==="manna").stock,3);
 assert.notEqual(JSON.stringify(s),before,"craft must update only original game state");
 const saved=JSON.stringify(s);
 h.pushFood(foodSnapshot(s));
 assert.equal(JSON.stringify(s),saved,"3D snapshot must never mutate game/save");
});

test("3D reacts to cold and packing moves, hand and pet personal home reserve without duplication",()=>{
 const s=world();assert.equal(E.createPet(s,0).ok,true);
 const p=s.pets[0];assert.equal(E.craftFood(s,"manna").ok,true);
 const h=nestedHarness();
 const move=(op,from,to)=>{
  assert.equal(I.action(s,E.foodRecipes,{op,recipe:"manna",from,to}).ok,true);
  return h.pushFood(foodSnapshot(s)).recipes.find(x=>x.id==="manna");
 };
 let v=move("take","rack","hand");
 assert.deepEqual([v.rack,v.hand,v.cold,v.packing],[2,1,0,0]);
 v=move("put","hand","cold");
 assert.deepEqual([v.rack,v.hand,v.cold,v.packing],[2,0,1,0]);
 v=move("take","rack","hand");
 v=move("put","hand","packing");
 assert.deepEqual([v.rack,v.hand,v.cold,v.packing],[1,0,1,1]);
 assert.equal(I.transferPet(s,E.foodRecipes,{op:"supply",recipe:"manna",
  petId:p.id,zone:"cold",amount:1},(pet,f)=>E.feedCompatible(E.SPECIES[pet.species],f,pet)).ok,true);
 v=h.pushFood(foodSnapshot(s)).recipes.find(x=>x.id==="manna");
 assert.deepEqual([v.rack,v.cold,v.packing,v.stock,v.warehouse],[1,0,1,3,2]);
 assert.equal(I.project(s,E.foodRecipes,p.id).find(x=>x.id==="manna").petReserve,1);
 const old=s.foodFactory.stock.manna;
 assert.equal(E.feedPrepared(s,p.id,"manna").ok,true);
 assert.equal(s.foodFactory.stock.manna,old-1);
 v=h.pushFood(foodSnapshot(s)).recipes.find(x=>x.id==="manna");
 assert.deepEqual([v.rack,v.cold,v.packing,v.stock,v.warehouse],[1,0,1,2,2]);
 const restored=JSON.parse(JSON.stringify(s));
 assert.equal(I.project(restored,E.foodRecipes).find(x=>x.id==="manna").warehouse,2);
});

test("Missing/invalid original inventory cannot masquerade as real empty warehouse",()=>{
 const h=nestedHarness(),s=world();E.craftFood(s,"manna");
 h.pushFood(foodSnapshot(s));
 let v=h.pushFood({warehouseReady:false,recipes:[]});
 assert.equal(v.ready,false);
 assert.equal(v.source,"unavailable");
 assert.deepEqual(Array.from(v.recipes),[]);
 v=h.pushFood({warehouseReady:true,recipes:[{id:"manna",stock:3,warehouse:3,
  rack:1000000,cold:0,packing:0,hand:0}]});
 assert.equal(v.recipes.length,0,"forged / inconsistent source row must not appear");
 // Malicious third-party iframe cannot update the canonical projection.
 const count=h.sent.length;
 h.root.dispatchEvent({type:"message",source:{},origin:"https://evil.test",
  data:{type:"trialum:lw:state",world:{food:foodSnapshot(s)}}});
 assert.equal(h.sent.length,count);
});

test("Classic UI is enabled in original game and 3D room uses same serialized recipe contract",()=>{
 const longplay=read("js/longplay-ui.js");
 const expansion=read("js/expansion-ui.js");
 const app=read("js/app.js");
 const hud=read("prototypes/lw-d/live-context.js");
 const bridge=read("prototypes/lw-d/agro-scene-bridge.js");
 const child=read("prototypes/lw-d/scenes/agro-food-warehouse/warehouse-app.mjs");
 const interaction=read("prototypes/lw-d/scenes/agro-food-warehouse/warehouse-interactions.mjs");
 assert.match(longplay,/Стовариште за храна','warehouse'/);
 assert.match(expansion,/function warehouse\(s\)/);
 assert.match(app,/warehouseReady/);
 assert.match(hud,/warehouseReady!==true/);
 assert.match(bridge,/acceptCanonicalFood\(event\.data\.world\?\.food\)/);
 assert.match(child,/m.action==="inventory"/);
 assert.match(interaction,/inventoryReady:this\.stock\.ready/);
 assert.doesNotMatch(interaction,/localStorage|indexedDB/);
});
