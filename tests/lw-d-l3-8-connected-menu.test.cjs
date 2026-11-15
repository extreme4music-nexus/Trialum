"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
const Hub=require("../prototypes/lw-d/world-hub-pages.js");

test("Main Lobby is separate from approved five-door Laboratory Lobby",()=>{
 const hall=require("../prototypes/lw-d/lab-complex.js");
 assert.equal(hall.INITIAL_VIEW,"hub");
 assert.deepEqual(hall.ROOMS.map(r=>r.id),["basic","dna","foodlab","floralab","research"]);
 assert.equal(Hub.resolveRoom("lab"),"hub");
 assert.equal(Hub.resolveRoom("knowledge"),"research");
 assert.equal(Hub.resolveRoom("flora"),"floralab");
 assert.equal(Hub.resolveRoom("foodlab"),"foodlab");
 assert.equal(Hub.resolveRoom("dna"),"dna");
 assert.equal(Hub.resolveRoom("world"),null,"unbuilt city MUST NOT masquerade as a built 3D room");
 const nav=read("prototypes/lw-d/world-navigation.js"),hud=read("prototypes/lw-d/live-context.js");
 assert.match(nav,/mainhub/);
 assert.match(nav,/lw-mainhub-toggle/);
 assert.match(hud,/🏛️ Лабораториско лоби/);
 assert.match(hud,/dataset\.lwGlobalLobby="open"/);
 assert.match(hud,/trialum:lw:hud-route/);
 assert.doesNotMatch(hud,/const portals=make/,"Lab Lobby is not a second universal hub anymore");
});

test("all owner-requested wings, separate social submenu, marketplace and all More functions are connected",()=>{
 const root=Hub.main.map(x=>x[1]);
 for(const route of ["world","lab","knowledge","flora","garden","nursery","pets","homes",
  "foodlab","social","market","more"])assert.ok(root.includes(route),route);
 assert.deepEqual(Hub.social.map(x=>x[1]),["playground","shared","messagesHud","friendsHud"]);
 assert.deepEqual(Hub.market.map(x=>x[1]),["toys","boutique","furniture"]);
 for(const route of ["dna","flora","foodlab","playground","shared","friendsHud","messagesHud",
  "playgamesHud","achievementsHud","diaryHud","notificationsHud","settingsHud","moreClassicHud"])
  assert.ok(Hub.more.some(x=>x[1]===route),"More submenu missing "+route);
 for(const page of ["world","garden","nursery","boutique","furniture"])
  assert.ok(Hub.pages.has(page),"unbuilt location must have usable labeled HUD placeholder: "+page);
});

test("Trions are only a display name for authentic existing earned credits, no wallet or checkout",()=>{
 const game=read("js/app.js"),hub=read("prototypes/lw-d/world-hub-pages.js");
 const playground=read("js/playground.js");
 assert.match(game,/credits:s\.longplay\?\.credits\|\|0/);
 assert.match(game,/toyCatalog:\(PG\?\.TOYS\|\|\[\]\)/);
 assert.match(hub,/Триони/);
 assert.match(hub,/no real money or new wallet/);
 assert.match(playground,/l\.credits-=n/);
 assert.doesNotMatch(hub,/fetch\(|WebSocket|localStorage|indexedDB|\.credits\s*[+-]=|creditBalance\(/);
});

test("existing pets and households are projected from authoritative engine; direct home validates ID",()=>{
 const game=read("js/app.js"),bridge=read("js/lw-d-interface.js");
 assert.match(game,/petProfiles:s\.pets\.slice\(0,300\)\.map/);
 assert.match(game,/homes:s\.habitats\.slice\(0,150\)\.map/);
 assert.match(game,/E\.evolutionProgress\(q\)/);
 assert.match(game,/appearanceSource:"TrialumCreatureArt"/);
 assert.match(game,/openExistingHome\(id\)/);
 assert.match(game,/s\?\.habitats\?\.some\(h=>h\.id===id\)/);
 assert.match(game,/selectHabitat\(id\)/);
 assert.match(bridge,/trialum:lw:open-home/);
 assert.match(bridge,/API\(\)\?\.openExistingHome\?\.\(id\)/);
 const html=read("prototypes/lw-d/world.html");
 assert.match(html,/js\/creature-art\.js/);
 assert.match(html,/world-hub-pages\.js/);
});

test("new HUD is read-only, offline, bilingual, independently closable and never invents gameplay",()=>{
 const src=read("prototypes/lw-d/world-hub-pages.js");
 assert.match(src,/dictionary=\{/);
 assert.match(src,/mk:\{/);assert.match(src,/en:\{/);
 assert.match(src,/role","dialog"/);
 assert.match(src,/aria-label/);
 assert.match(src,/closest\?\.\("button\[data-hub-target\]"\)/);
 assert.doesNotMatch(src,/innerHTML|localStorage|indexedDB|fetch\(|setInterval\(|new Audio\(/);
 for(const p of ["android-template/app/build.gradle.kts","sw.js"])
  assert.ok(read(p).includes("prototypes/lw-d/world-hub-pages.js"),"offline bundle "+p);
 assert.ok(read("prototypes/lw-d/build_preview.py").includes("world-hub-pages.js"));
});

test("real HUD navigation never spends tokens, creates pets or leaks social; full-screen play uses originals",()=>{
 const bridge=read("js/lw-d-interface.js");
 assert.match(bridge,/enterPlayFullscreen\(target\)/);
 assert.match(bridge,/next==="playground"\|\|next==="shared"/);
 assert.match(bridge,/API\(\)\?\.classicTab\?\.\(next\)/);
 assert.match(bridge,/body\.lw-d-play-fullscreen/);
 assert.match(bridge,/lw-d-play-toolbar/);
 assert.match(bridge,/endPlayFullscreen\(\)/);
 assert.match(bridge,/event\.origin!==origin\|\|event\.source!==iframe\?\.contentWindow/);
 assert.doesNotMatch(read("prototypes/lw-d/world-hub-pages.js"),/navigator\.geolocation|createAccount|createPet|makePurchase|payWith/);
});

test("interactive HUD: every live home and Classic route calls existing parent only",()=>{
 let calls=[],events={},draws=0,frame;
 function node(tag){
  const n={tag,children:[],dataset:{},style:{},attrs:{},hidden:false,
   append(...items){this.children.push(...items);return this;},
   replaceChildren(...items){this.children=items;},
   setAttribute(k,v){this.attrs[k]=v;},
   addEventListener(name,cb){this["on"+name]=cb;},
   getContext(){return {createLinearGradient(){return {addColorStop(){}}},fillRect(){},set fillStyle(x){} };},
   contains(t){return this===t||this.children.some(c=>c.contains?.(t));},
   closest(){return null}
  };return n;
 }
 frame=node("div");
 const parent={postMessage(data,origin){calls.push({data,origin});}};
 const root={
  document:{createElement:node,getElementById(id){return id==="frame"?frame:null;}},
  location:{search:"?live=1",origin:"https://appassets.androidplatform.net"},
  parent,CustomEvent:class{constructor(type,opts){this.type=type;this.detail=opts?.detail;}},
  TrialumCreatureArt:{draw(){draws++;}},
  addEventListener(k,fn){events[k]=fn;},
  dispatchEvent(e){(events[e.type]||(()=>{}))(e);}
 };
 vm.runInNewContext(read("prototypes/lw-d/world-hub-pages.js"),{globalThis:root,URLSearchParams});
 const api=root.TrialumHubPages;
 events.message({origin:root.location.origin,source:parent,data:{type:"trialum:lw:state",world:{
  language:"mk",petProfiles:[{id:"p1",name:"Миа",speciesName:"Синапсо",icon:"🐾",
   homeId:"h1",home:"Биосвет А",ageDays:17,level:11,generation:2,trained:3,eyes:2,hue:180}],
  homes:[{id:"h1",name:"Биосвет А",biome:"garden",quality:72,occupied:1,capacity:4,
    pets:[{id:"p1",name:"Миа"}]}],
  toyCatalog:[{id:"slide",name:"Лизгалка",cost:16,unlocked:false}]
 }}});
 assert.equal(api.open("hub"),true);
 assert.equal(api.state().isOpen,true);
 api.route("pets","page");assert.equal(api.state().view,"pets");
 assert.ok(draws>0,"the original real-creature portrait renderer must be used");
 api.route("p1","petDetail");assert.equal(api.state().selectedPet,"p1");
 api.route("homes","page");assert.equal(api.state().view,"homes");
 api.route("h1","home");
 assert.deepEqual(calls.map(x=>x.data.type),["trialum:lw:open-home"]);
 assert.equal(calls[0].data.id,"h1");
 api.route("fake-house","home");assert.equal(calls.length,1,"unknown home cannot navigate");
 api.route("playground","classic");
 assert.equal(calls[1].data.type,"trialum:lw:classic");
 assert.equal(calls[1].data.tab,"playground");
 assert.equal(api.state().isOpen,false);
 api.open("hub");
 api.route("knowledge","room");
 assert.equal(api.state().isOpen,false,"room routes must close HUD");
 assert.equal(api.resolveRoom("knowledge"),"research");
});