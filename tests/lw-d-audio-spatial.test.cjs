"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const Sound=require("../prototypes/lw-d/spatial-audio.js");
const Reactions=require("../prototypes/lw-d/event-reactions.js");
const read=name=>fs.readFileSync(path.join(__dirname,"..",name),"utf8");

test("each of the five labs plus main lobby has an original distinct looping musical signature",()=>{
 const rooms=["hub","basic","dna","foodlab","floralab","research"];
 assert.equal(new Set(rooms.map(room=>JSON.stringify(Sound.profileFor("lab",room).pattern))).size,rooms.length);
 for(const room of rooms){
  const p=Sound.profileFor("lab",room);
  assert.equal(p.pattern.length,8);
  assert.ok(p.base>100&&p.step>=500);
 }
});
test("3D orientation is derived from the REAL camera vectors, not device sensors",()=>{
 assert.deepEqual(Sound.normalize([0,0,-9],[1,0,0]),[0,0,-1]);
 assert.deepEqual(Sound.normalize([0,0,0],[0,1,0]),[0,1,0]);
 assert.deepEqual(Sound.sourcePosition("hub",null),[0,0,3.2]);
 const world=read("prototypes/lw-d/world.js");
 assert.match(world,/trialum:lw:camera/);
 assert.match(world,/forward:cameraTarget\.map\(\(v,i\)=>v-eye\[i\]\)/);
});
test("audio stays off until gesture and preserves original player's sound/music settings",()=>{
 Sound.settings({sound:false,music:false,volume:.5});
 assert.equal(Sound.status().sound,false);
 assert.equal(Sound.status().music,false);
 assert.equal(Sound.status().unlocked,false);
 assert.match(read("js/app.js"),/audio:\{sound:s\.settings\?\.sound===true/);
 assert.match(read("js/lw-d-interface.js"),/TrialumAudio\?\.setAppVisible\?\.\(false\)/);
});
test("five real engine operation streams normalize to read-only success/failure effects",()=>{
 const pairs=[
  ["trialum:lw:process-result","kind","synthesize","basic"],
  ["trialum:lw:dna-process-result","op","design","dna"],
  ["trialum:lw:food-process-result","op","craft","foodlab"],
  ["trialum:lw:flora-process-result","op","plant","floralab"],
  ["trialum:lw:research-process-result","op","study","research"]
 ];
 for(const [event,key,value,room] of pairs){
  const success=Reactions.normalizeResult(event,{[key]:value,ok:true,recipe:"abc"});
  assert.equal(success.room,room);assert.equal(success.ok,true);
  assert.equal(success.recipe,"abc");
  assert.equal(Reactions.normalizeResult(event,{[key]:value,ok:false}).ok,false);
  assert.equal(Reactions.normalizeResult(event,{[key]:"evil",ok:true}),null);
  assert.equal(Reactions.normalizeResult(event,{[key]:value,ok:"yes"}),null);
 }
 assert.equal(Reactions.normalizeResult("untrusted:event",{ok:true}),null);
});
test("main lobby is universal navigation and homes are excluded from this new hub",()=>{
 const hud=read("prototypes/lw-d/live-context.js");
 const renderer=read("prototypes/lw-d/world.js");
 assert.match(hud,/dataset\.lwPortal=scene/);
 assert.match(hud,/dataset\.lwAtlas="open"/);
 assert.match(renderer,/destination==="lab"\|\|s\.scene!=="lab"\|\|complexView!=="hub"/);
 assert.match(hud,/домовите подоцна ќе бидат дел од посебен град/);
 const html=read("prototypes/lw-d/world.html");
 assert.match(html,/id="lw-spatial-toggle"/);
 assert.match(html,/script src="spatial-audio\.js"/);
 assert.match(html,/script src="event-reactions\.js"/);
});
test("no remote audio loads, no new engine economy or background render loops in adapter",()=>{
 const sound=read("prototypes/lw-d/spatial-audio.js");
 const bridge=read("prototypes/lw-d/event-reactions.js");
 assert.doesNotMatch(sound+bridge,/fetch\(|XMLHttpRequest|localStorage|indexedDB|WebSocket/);
 assert.doesNotMatch(sound+bridge,/labActions--|insight\+\+|credits\+\+|\.save\(/);
 assert.match(sound,/createPanner\(\)/);
 assert.match(sound,/HRTF/);
 assert.match(sound,/visibility\(false\)/);
});