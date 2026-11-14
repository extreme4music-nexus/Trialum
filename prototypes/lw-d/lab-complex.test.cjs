const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const Hall=require("./lab-complex.js");
const read=p=>fs.readFileSync(path.join(__dirname,"../..",p),"utf8");
test("five separate laboratory entrances have exact owner-approved boundaries",()=>{
 assert.deepEqual(Hall.ROOMS.map(r=>r.id),["basic","dna","foodlab","floralab","research"]);
 assert.equal(Hall.ROOMS.filter(r=>r.ready).length,2,"only basic and DNA rooms are live in L3.2-A");
 assert.equal(Hall.getRoom("basic").tab,null);
 assert.equal(Hall.getRoom("dna").ready,true);
 assert.ok(Hall.ROOMS.slice(2).every(r=>!r.ready),"other three 3D rooms still under development");
 assert.deepEqual(Hall.ROOMS.slice(1).map(r=>r.tab),["dna","food","plants","research"]);
 assert.equal(Hall.getRoom("warehouse"),null,"food warehouse is NOT a laboratory");
 assert.ok(Hall.ROOMS.every(Object.isFrozen),"door definitions are read-only");
 assert.equal(new Set(Hall.ROOMS.map(r=>r.x)).size,5);
});
test("3D hallway includes five room doors, floor, walls, guide rails and visual depth",()=>{
 const draw=[];Hall.drawRoom((...args)=>draw.push(args),{mesh:"cube"},{mesh:"sphere"},1.25);
 assert.ok(draw.length>90,"hallway is real 3D geometry, not a background");
 assert.ok(draw.some(a=>a[1]<-5),"left architectural wall/column");
 assert.ok(draw.some(a=>a[1]>5),"right architectural wall/column");
 assert.ok(draw.some(a=>a[3]<-3),"five doorframes on the back wall");
 assert.ok(draw.some(a=>a[2]>1),"ceiling beams and lighting");
 assert.ok(draw.some(a=>a[2]<-1),"floor and guide tiles");
});
test("screen-to-world projection selects the correct door and rejects empty screen",()=>{
 const matrix=new Float32Array([.13,0,0,0,0,.28,0,0,0,.18,-.09,0,0,0,0,1]);
 for(const room of Hall.ROOMS){
  const p=Hall.project(matrix,room.x,room.y,room.z,1400,900);
  assert.ok(p&&p.x>0&&p.x<1400&&p.y>0&&p.y<900,room.id);
  const hit=Hall.pick(matrix,p.x,p.y,1400,900);
  assert.equal(hit?.id,room.id);
 }
 assert.equal(Hall.pick(matrix,1300,800,1400,900),null);
 assert.equal(Hall.pick(null,100,100,1400,900),null);
});
test("laboratory corridor is a visual navigation module only",()=>{
 const source=read("prototypes/lw-d/lab-complex.js");
 assert.doesNotMatch(source,/fetch\(|localStorage|indexedDB|setInterval|scheduleSave|TRIALUM_DATA_KEY/);
 const renderer=read("prototypes/lw-d/world.js");
 assert.match(renderer,/TrialumLabComplex\?\.drawRoom/);
 assert.match(renderer,/TrialumLabComplex\?\.pick/);
 assert.match(renderer,/trialum:lw:complex-room-changed/);
 assert.match(renderer,/complexView==="hub"/);
 const hud=read("prototypes/lw-d/live-context.js");
 assert.match(hud,/COMPLEX_ROOMS/);
 assert.match(hud,/trialum:lw:complex-room/);
 assert.match(hud,/root\.parent\.postMessage\(\{type:"trialum:lw:classic",tab:room\.tab\},origin\)/);
 const nav=read("prototypes/lw-d/world-navigation.js");
 assert.match(nav,/\["🏛️","complex","scene"\]/);
 assert.match(nav,/room:"hub"/);
});
test("L3.0 module is available to PWA, Android and self-contained HTML preview",()=>{
 assert.match(read("prototypes/lw-d/world.html"),/<script src="lab-complex\.js"><\/script>/);
 assert.match(read("prototypes/lw-d/build_preview.py"),/lab-complex\.js/);
 assert.match(read("sw.js"),/prototypes\/lw-d\/lab-complex\.js/);
 assert.match(read("android-template/app/build.gradle.kts"),/prototypes\/lw-d\/lab-complex\.js/);
});
