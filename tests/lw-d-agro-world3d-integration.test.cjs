"use strict";
const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const ROOT=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(ROOT,p),"utf8");
const hub=require("../prototypes/lw-d/world-hub-pages.js");
const hall=require("../prototypes/lw-d/lab-complex.js");

test("Agro Atrium opens exclusively INSIDE Living World 3D and B1 Pilot has no user-facing Classic launcher",()=>{
 const classic=read("index.html");
 const worldHTML=read("prototypes/lw-d/world.html");
 const nested=read("prototypes/lw-d/agro-scene-bridge.js");
 const gradle=read("android-template/app/build.gradle.kts");
 assert.ok(gradle.includes('"prototypes/lw-d/agro-scene-bridge.js"'),"actual Android APK must bundle nested Agro menu bridge");
 assert.match(classic,/src="js\/lw-d-interface\.js"/);
 assert.doesNotMatch(classic,/src="js\/lw-d-b1-pilot-launcher\.js"/);
 assert.doesNotMatch(classic,/src="js\/lw-d-agro-lobby-launcher\.js"/);
 assert.match(worldHTML,/src="agro-scene-bridge\.js"/);
 assert.match(nested,/live"\)!=="1"/);
 assert.match(nested,/sceneId!=="trialum\.ground\.agro\.lobby"/);
 assert.match(nested,/\.\/scenes\/agro-lobby\/lobby\.html\?hosted=1&inside3d=1/);
 assert.match(nested,/trialum:agro:close/);
 assert.match(nested,/trialum:agro:dispose/);
 assert.doesNotMatch(nested,/location\.href\s*=|\.credits\s*[+-]=|localStorage|indexedDB|TrialumEngine|gameState/);
 assert.equal(hall.ROOMS.length,5,"the original five actual first-floor labs remain preserved");
});

test("both actual 3D menus use the exact same scene route, planned rooms cannot be entered",()=>{
 const menu=read("prototypes/lw-d/world-navigation.js");
 const hud=read("prototypes/lw-d/world-hub-pages.js");
 assert.ok(hub.main.some(x=>x[1]==="agroLobby"&&x[2]==="scene"));
 assert.ok(hub.pages.has("garden"),"original Garden placeholder still exists");
 assert.equal(hub.resolveRoom("flora"),"floralab","Agro must not replace original Flora Lab");
 assert.equal(hub.resolveRoom("lab"),"hub","Agro must not replace the five-door lab");
 for(const s of [menu,hud]){
  assert.match(s,/trialum:lw:agro-lobby/);
  assert.match(s,/trialum\.ground\.agro\.lobby/);
  assert.match(s,/agroLobby/);
  assert.doesNotMatch(s,/TrialumEngine|localStorage|indexedDB|\.credits\s*[+-]=/);
 }
 assert.match(menu,/name:"agro"/);
 assert.match(menu,/\["📦","warehouse","future"\]/);
 assert.match(menu,/\["🧪","phytolab","future"\]/);
 assert.match(menu,/dataset\.route=key/);
 assert.match(hud,/kind==="scene"/);
 assert.match(hud,/key!=="agroLobby"/);
});

test("nested scene suspends original GPU and spatial audio, restores authoritative Living World only",()=>{
 const world=read("prototypes/lw-d/world.js");
 const audio=read("prototypes/lw-d/spatial-audio.js");
 const bridge=read("prototypes/lw-d/agro-scene-bridge.js");
 assert.match(world,/agroSceneOpen/);
 assert.match(world,/!agroSceneOpen/);
 assert.match(world,/if\(agroSceneOpen\)pauseRenderer\(\);else resumeRenderer\(\)/);
 assert.match(audio,/agroOverlayOpen/);
 assert.match(audio,/visible=appVisible&&!agroOverlayOpen/);
 assert.match(bridge,/report\(true\)/);
 assert.match(bridge,/report\(false\)/);
 assert.match(bridge,/root\.TrialumHubPages\?\.open\(returnSource\)/);
 assert.match(bridge,/trialum:lw:agro:returned/);
 assert.match(menuOrEmpty(),/trialum:lw:agro:returned/);
 assert.doesNotMatch(bridge,/addEventListener\("blur"|setInterval\(/);
});
function menuOrEmpty(){return read("prototypes/lw-d/world-navigation.js");}

test("the three portals retain original semantic identity and are only inspect-only",()=>{
 const s=JSON.parse(read("prototypes/lw-d/scenes/agro-lobby/scene.json"));
 assert.equal(s.sceneId,"trialum.ground.agro.lobby");
 assert.equal(s.portals.length,3);
 for(const p of s.portals){
  assert.equal(p.status,"planned");
  assert.equal(p.action,"inspect-only");
 }
 const app=read("prototypes/lw-d/three-core/scene-app.mjs");
 const html=read("prototypes/lw-d/scenes/agro-lobby/lobby.html");
 assert.match(app,/insideLivingWorld/);
 assert.match(app,/language==="en"/);
 assert.match(app,/trialum:agro:close/);
 assert.match(app,/this room is not built yet/);
 assert.match(html,/room-name/);
 assert.equal(s.authority.gameplayWrites,false);
 assert.equal(s.authority.saveWrites,false);
});


test("S3 retains the ONE existing mint holographic 3D shell; only GLB canvas is nested",()=>{
 const bridge=read("prototypes/lw-d/agro-scene-bridge.js");
 const navCss=read("prototypes/lw-d/world-navigation.css");
 const childCss=read("prototypes/lw-d/scenes/agro-lobby/lobby.css");
 const context=read("prototypes/lw-d/live-context.js");
 const glbApp=read("prototypes/lw-d/three-core/scene-app.mjs");
 assert.match(bridge,/host\.appendChild\(dialog\)/,"real 3D world owns the scene, not body");
 assert.match(bridge,/dock\.appendChild\(b\)/,"use existing left 3D dock");
 assert.match(bridge,/dataSet|dataset\.agroDock/);
 assert.doesNotMatch(bridge,/lw-agro-return-to-world/,"no detached bottom-right Back button");
 assert.match(navCss,/body\.lw-agro-nested-open \.dock\{z-index:66\}/);
 assert.match(navCss,/body\.lw-agro-nested-open #lw-context\{z-index:67\}/);
 assert.match(navCss,/body\.lw-agro-nested-open #lw-hud-toggle\{z-index:68\}/);
 assert.doesNotMatch(navCss,/\.lw-agro-return-to-world/);
 assert.match(childCss,/inside-living-world-3d \.controls/);
 assert.match(childCss,/inside-living-world-3d \.destinations/);
 assert.match(childCss,/display:none!important/);
 assert.match(context,/panel\.id="lw-context"/);
 assert.match(context,/function renderAgro\(\)/);
 assert.match(context,/if\(agroActive\)\{renderAgro\(\);return;\}/);
 for(const field of ["world?.biomass","world?.compounds","world?.flora?.totalPlanted","world?.food?.totalStock"])
  assert.ok(context.includes(field),"original authoritative HUD field missing: "+field);
 assert.match(context,/root\.TrialumAgroSceneBridge\?\.setQuality/);
 assert.match(context,/root\.TrialumAgroSceneBridge\?\.selectPortal/);
 assert.match(glbApp,/trialum:agro:command/);
 assert.match(glbApp,/trialum:agro:selected/);
 assert.match(glbApp,/e\.source!==parent\|\|e\.origin!==location\.origin/);
 assert.doesNotMatch(bridge,/localStorage|indexedDB|TrialumEngine|credits\s*[+-]=/);
});
