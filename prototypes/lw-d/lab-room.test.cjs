const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const R=require("./lab-room.js");
const root=path.join(__dirname,"../..");
const file=p=>fs.readFileSync(path.join(root,p),"utf8");

test("four distinct original room stations have valid existing engine commands",()=>{
 assert.deepEqual(R.STATIONS.map(s=>s.id),["synthesis","analysis","materials","incubation"]);
 assert.deepEqual(R.STATIONS.map(s=>s.action),["synthesize","analyze","harvest","grow"]);
 assert.equal(new Set(R.STATIONS.map(s=>s.x+","+s.z)).size,4);
 assert.equal(R.station("bad"),null);
 assert.ok(R.STATIONS.every(s=>Object.isFrozen(s)));
});
test("room renders several machines, architectural walls, shelves, lights and floor",()=>{
 const commands=[];
 const draw=(...args)=>commands.push(args);
 R.drawRoom(draw,{mesh:"cube"},{mesh:"sphere"},1.2,"analysis",{compounds:95});
 assert.ok(commands.length>110,"room must contain many spatial parts, not one central rendered object");
 assert.ok(commands.some(a=>a[1]<-3),"room must include a wall");
 assert.ok(commands.some(a=>a[2]>1.7),"room must include real lights/ceiling");
 assert.ok(commands.some(a=>a[1]<-2.0&&a[3]<-1),"room must contain a left workstation");
 assert.ok(commands.some(a=>a[1]>2.0&&a[3]>0),"room must contain a right workstation");
});
test("picking in projected 3D space selects each of four actual stations",()=>{
 const matrix=new Float32Array([.22,0,0,0,0,.27,0,0,0,.36,-.1,0,0,0,0,1]);
 for(const s of R.STATIONS){
  const q=R.project(matrix,s.x,s.y,s.z,1200,700);
  assert.ok(q&&q.x>=0&&q.x<=1200&&q.y>=0&&q.y<=700);
  assert.equal(R.pick(matrix,q.x,q.y,1200,700)?.id,s.id);
 }
 assert.equal(R.pick(matrix,1190,695,1200,700),null);
 assert.equal(R.project(null,0,0,0,1200,700),null);
});
test("station selector does not mutate world data or use the network",()=>{
 const source=file("prototypes/lw-d/lab-room.js");
 assert.doesNotMatch(source,/fetch\(|localStorage|indexedDB|setInterval|XMLHttpRequest/);
 const world=file("prototypes/lw-d/world.js");
 assert.match(world,/TrialumLabRoom\?\.drawRoom/);
 assert.match(world,/TrialumLabRoom\?\.pick/);
 assert.match(world,/trialum:lw:station-changed/);
 const hud=file("prototypes/lw-d/live-context.js");
 assert.match(hud,/lw-stations/);
 assert.match(hud,/trialum:lw:select-station/);
 assert.match(hud,/addButton\(selected\.command,selected\.kind/);
 assert.doesNotMatch(hud,/newGame\(|scheduleSave\(/);
});
test("3D room is bundled in PWA, Android APK and offline standalone preview",()=>{
 assert.match(file("prototypes/lw-d/world.html"),/<script src="lab-room\.js"><\/script>/);
 assert.match(file("android-template/app/build.gradle.kts"),/prototypes\/lw-d\/lab-room\.js/);
 assert.match(file("sw.js"),/prototypes\/lw-d\/lab-room\.js/);
 assert.match(file("prototypes/lw-d/build_preview.py"),/lab-room\.js/);
});
test("owner's master direction covers the whole game and lab-first staging",()=>{
 const master=file("docs/TRIALUM_LIVING_WORLD_MASTER_3D_20261114.md");
 for(const term of ["Laboratories","Biospheres","Pets","Flora","Food","Playgrounds","entire existing Trialum"]) assert.ok(master.includes(term),term);
 assert.ok(file("docs/LW_D_LABORATORY_SPATIAL_PLAN_20261114.md").includes("L4"));
});
