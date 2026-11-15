"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const read=name=>fs.readFileSync(path.join(__dirname,"..",name),"utf8");
const Hall=require("../prototypes/lw-d/lab-complex.js");
test("owner entry rule: corridor is the single canonical default to ALL five rooms",()=>{
 assert.equal(Hall.INITIAL_VIEW,"hub");
 assert.equal(Hall.ROOMS.length,5);
 assert.ok(Hall.ROOMS.every(r=>r.ready));
 const renderer=read("prototypes/lw-d/world.js"),
   hud=read("prototypes/lw-d/live-context.js"),
   nav=read("prototypes/lw-d/world-navigation.js");
 assert.match(renderer,/let complexView=globalThis\.TrialumLabComplex\?\.INITIAL_VIEW\|\|"hub"/);
 assert.match(hud,/complexRoom=root\.TrialumLabComplex\?\.INITIAL_VIEW\|\|"hub"/);
 assert.match(renderer,/destination==="lab"\|\|s\.scene!=="lab"\|\|complexView!=="hub"/);
 assert.match(renderer,/complexView="hub";selectedDnaStation=null/);
 // Engine result may focus its own machine ONLY when the existing Basic room
 // is truly visible; nothing may auto-enter Basic from Main Lobby.
 assert.match(renderer,/!canRender\(\)\|\|s\.scene!=="lab"\|\|complexView!=="basic"/);
 assert.match(renderer,/if\(selectedStation!==process\.station\)chooseRoomStation\(process\.station\)/);
 assert.doesNotMatch(renderer,/complexView==="hub"\)enterComplexRoom\("basic"\)/);
 assert.match(nav,/if\(key==="complex"\)/);
 assert.match(nav,/room:"hub"/);
 assert.doesNotMatch(nav,/room:"basic"/);
 assert.doesNotMatch(nav,/\["⚗️","lab","scene"\]/);
 assert.ok(!hud.includes('complexRoom="basic"'),"HUD cannot start in old basic-room view");
});
test("central lobby has five accessible doors; no direct-room bypass from main navigation",()=>{
 const hud=read("prototypes/lw-d/live-context.js"),
  world=read("prototypes/lw-d/world.js"),html=read("prototypes/lw-d/world.html");
 assert.match(hud,/🏛️ Лабораториско лоби/);
 assert.match(hud,/dataset\.lwComplex=room\.id/);
 assert.match(hud,/for\(const room of COMPLEX_ROOMS\)/);
 assert.match(hud,/dataset\.lwComplex="hub"/);
 assert.match(hud,/addStat\(lobbyStats,"Лабораторија ниво",world\?\.research\?\.level\)/);
 assert.match(hud,/addStat\(lobbyStats,"Лаб\. акции",world\?\.labActions\)/);
 assert.match(hud,/addStat\(lobbyStats,"Миленичиња",world\?\.pets\)/);
 assert.match(world,/\$\("controlPanel"\)\.hidden=s\.scene!=="lab"\|\|complexView!=="basic"/);
 assert.match(html,/aria-label="Лабораториско лоби"/);
 assert.match(hud,/body\.lw-live-mode\.lw-complex-hall/);
});
test("new 3D lobby has animated wayfinding but displays only authentic saved resource signals",()=>{
 const basic=[],full=[];
 Hall.drawRoom((...args)=>basic.push(args),{}, {},12);
 Hall.drawRoom((...args)=>full.push(args),{}, {},12,{compounds:512,insight:256,pets:5,biomass:1000});
 assert.ok(basic.length>140,"main hall now a real architectural 3D scene");
 assert.ok(full.length>basic.length+10,"saved progress adds visible nonreward indicators");
 const code=read("prototypes/lw-d/lab-complex.js");
 assert.match(code,/Number\(state\?\.compounds\)\|\|0/);
 assert.match(code,/Number\(state\?\.insight\)\|\|0/);
 assert.match(code,/Number\(state\?\.pets\)\|\|0/);
 assert.match(code,/Number\(state\?\.biomass\)\|\|0/);
 assert.match(read("prototypes/lw-d/world.js"),/TrialumLabComplex\?\.drawRoom\(draw,cube,sphere,t,liveStats\)/);
 assert.doesNotMatch(code,/fetch\(|localStorage|indexedDB|setInterval|s\.insight\+=|s\.labActions--/);
});
test("all five picked doors remain selectable after the lobby visual upgrade",()=>{
 const matrix=new Float32Array([.13,0,0,0,0,.28,0,0,0,.18,-.09,0,0,0,0,1]);
 for(const room of Hall.ROOMS){
  const point=Hall.project(matrix,room.x,room.y,room.z,1400,900);
  assert.ok(point&&point.x>0&&point.x<1400);
  assert.equal(Hall.pick(matrix,point.x,point.y,1400,900)?.id,room.id);
 }
});
test("lobby is bilingual, user approvals preserved and APK never shifts official channels",()=>{
 const strings=JSON.parse(read("locales/en.json")).strings;
 for(const value of ["🏛️ Главно лоби на лабораторијата",
   "🏛️ Главно лоби","Ова е централниот влез. Одбери една од петте 3D лаборатории.",
   "Пет лаборатории, еден заеднички центар.","Влези →"])
  assert.ok(strings[value],value+" missing accepted EN synchronization");
 const workflow=read(".github/workflows/lw-d-android-qa.yml");
 assert.match(workflow,/feature\/lw-d-l3-6-lobby-entry-polish-20261114/);
 // Both protected S1 and baseline B1 may use the same approved SignQA signer.
  assert.match(workflow,/Trialum-LW-D-(?:B1|AGRO-S1|AGRO-S2)-OWNER-SIGNED-SIGNQA-/);
 assert.match(workflow,/github\.actor == 'extreme4music-nexus'/);
 assert.doesNotMatch(read("prototypes/lw-d/lab-complex.js"),/keystore|TRIALUM_DATA_KEY|\.signqa/);
});
