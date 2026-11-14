"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const Room=require("./research-room.js"),Hall=require("./lab-complex.js");
const read=name=>fs.readFileSync(path.join(__dirname,"../..",name),"utf8");
test("fifth door opens a real spatial Research room with four distinct touch targets",()=>{
 assert.equal(Hall.ROOMS.length,5);
 assert.ok(Hall.ROOMS.every(x=>x.ready),"all five finished 3D rooms");
 assert.equal(Hall.getRoom("research").tab,"research");
 assert.deepEqual(Room.STATIONS.map(x=>x.id),
   ["disciplines","upgrade","discoveries","archive"]);
 assert.ok(Room.STATIONS.every(Object.isFrozen));
 assert.equal(Room.station("unknown"),null);
 const projection=new Float32Array([.13,0,0,0,0,.28,0,0,0,.18,-.09,0,0,0,0,1]);
 for(const st of Room.STATIONS){
  const p=Room.project(projection,st.x,st.y,st.z,1400,900);
  assert.ok(p&&p.x>0&&p.x<1400&&p.y>0&&p.y<900,st.id);
  assert.equal(Room.pick(projection,p.x,p.y,1400,900)?.id,st.id);
 }
 assert.equal(Room.pick(null,80,100,1400,900),null);
 assert.equal(Room.pick(projection,-10,-10,1400,900),null);
});
test("research chamber is geometric, visually rich and never changes real research state",()=>{
 const stock=Object.freeze({level:12,knowledge:1234}),base=[],rich=[],ok=[],bad=[],expired=[];
 const render=out=>(...v)=>out.push(v);
 Room.drawRoom(render(base),{}, {},10,"disciplines",stock,"balanced");
 Room.drawRoom(render(rich),{}, {},10,"archive",stock,"rich");
 assert.ok(base.length>125,"3D chamber must contain floor, walls, central column and four workstations");
 assert.ok(rich.length>base.length+12,"desktop detail changes visuals only");
 assert.ok(base.some(x=>x[1]<-4)&&base.some(x=>x[1]>4),"both side walls");
 assert.ok(base.some(x=>x[2]<-1.3)&&base.some(x=>x[2]>1.6),"floor and roof");
 assert.ok(base.some(x=>x[3]<-3),"rear wall");
 Room.drawRoom(render(ok),{}, {},10,"upgrade",stock,"balanced",{started:9.6,op:"upgrade",ok:true});
 Room.drawRoom(render(bad),{}, {},10,"discoveries",stock,"balanced",{started:9.6,op:"invent",ok:false});
 Room.drawRoom(render(expired),{}, {},10,"archive",stock,"balanced",{started:0,op:"craft",ok:true});
 assert.equal(ok.length,base.length+7,"real success adds only transient rendered light");
 assert.equal(bad.length,base.length+7,"failure does not create resources");
 assert.equal(expired.length,base.length,"no lasting simulation or timer");
 assert.deepEqual(stock,{level:12,knowledge:1234});
 assert.doesNotMatch(read("prototypes/lw-d/research-room.js"),/localStorage|indexedDB|fetch\(|setInterval\(|E\.study\(/);
});
test("native offline PWA and self-contained preview include the new research room before world renderer",()=>{
 const html=read("prototypes/lw-d/world.html"),sw=read("sw.js"),
  gradle=read("android-template/app/build.gradle.kts"),
  preview=read("prototypes/lw-d/build_preview.py");
 assert.ok(html.includes('<script src="research-room.js"></script>'));
 assert.ok(html.indexOf('src="research-room.js"')<html.indexOf('src="world.js"'));
 assert.match(sw,/prototypes\/lw-d\/research-room\.js/);
 assert.match(gradle,/prototypes\/lw-d\/research-room\.js/);
 assert.match(preview,/research_room = \(base \/ "research-room\.js"\)\.read_text/);
 assert.match(preview,/src="research-room\.js"/);
 const world=read("prototypes/lw-d/world.js"),hud=read("prototypes/lw-d/live-context.js");
 assert.match(world,/complexView="research"/);
 assert.match(world,/TrialumResearchRoom\?\.drawRoom/);
 assert.match(world,/TrialumResearchRoom\?\.pick/);
 assert.match(world,/selectedResearchStation/);
 assert.match(world,/trialum:lw:research-process-result/);
 assert.match(hud,/room\?\.id==="research"&&root\.TrialumLWResearchWebGLReady===true/);
 assert.match(hud,/inResearch=scene==="lab"&&complexRoom==="research"/);
 assert.match(hud,/dataset\.lwTab="research"/);
});
