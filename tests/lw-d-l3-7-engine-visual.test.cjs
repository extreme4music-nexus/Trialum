"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const Reaction=require("../prototypes/lw-d/event-reactions.js");
const Lab=require("../prototypes/lw-d/lab-process.js");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
const ctx=(now,overrides={})=>({visible:true,scene:"lab",room:"basic",now,reducedMotion:false,...overrides});

test("canonical Basic successful engine receipt shows ONLY real material gain",()=>{
 const before={compounds:7,insight:3,biomass:1,cells:0},after={...before,compounds:12};
 const data={seq:41,kind:"synthesize",ok:true,before,after};
 const effect=Reaction.normalizeResult("trialum:lw:process-result",data);
 assert.equal(effect.seq,41);assert.equal(effect.room,"basic");
 assert.equal(effect.operation,"synthesize");assert.equal(effect.change,5);
 assert.equal(effect.ok,true);assert.equal(Object.isFrozen(effect),true);
 assert.deepEqual(before,{compounds:7,insight:3,biomass:1,cells:0});
 const playback=Lab.begin(data.kind,data.ok,1000,before,after);
 assert.equal(playback.change,5);
 assert.equal(Lab.describe(playback,"mk").text,"Синтеза · Молекули +5");
 assert.equal(Lab.describe(playback,"en").text,"Synthesis · Molecules +5");
 assert.equal(Lab.describe(playback,"en").tone,"success");
});

test("failure/locked or unchanged status can NEVER display synthetic resources",()=>{
 const failed=Reaction.normalizeResult("trialum:lw:process-result",{
  seq:42,kind:"grow",ok:false,before:{cells:1},after:{cells:991}
 });
 assert.equal(failed.change,0,"failed engine operation has NO credited gain even if metrics are malformed");
 const event=Lab.begin("grow",false,2000,{cells:1},{cells:1});
 assert.equal(Lab.describe(event,"mk").text,"Раст на клетки · Без добивка");
 assert.equal(Lab.describe(event,"en").text,"Cell growth · No gain");
 assert.equal(Lab.describe(event).tone,"failure");
 const zero=Lab.begin("analyze",true,3000,{insight:5},{insight:5});
 assert.equal(Lab.describe(zero,"en").text,"Analysis · Confirmed · no increase");
 const spent=Lab.begin("harvest",true,4000,{biomass:9},{biomass:7});
 assert.equal(Lab.describe(spent,"en").text,"Materials · Biomass −2");
});

test("one engine receipt renders ONCE; duplicates and out-of-order responses never replay",()=>{
 const track=Reaction.createTracker();
 const a=Reaction.normalizeResult("trialum:lw:process-result",{
  seq:3,kind:"analyze",ok:true,before:{insight:1},after:{insight:2}});
 assert.equal(track.take(a,ctx(1000)),true);
 assert.equal(track.current(1500,ctx(1500)).feedback.seq,3);
 assert.equal(track.take(a,ctx(1700)),false);
 assert.equal(track.take({...a,seq:2},ctx(1800)),false);
 assert.equal(track.current(3650,ctx(3650)),null,"2.6s overlay expires automatically");
 assert.equal(track.lastReceipt(),3);
 const b={...a,seq:4};
 assert.equal(track.take(b,ctx(4000)),true);
 track.clear();
 assert.equal(track.current(4100,ctx(4100)),null,"room departure destroys active visual");
 assert.equal(track.take(b,ctx(4200)),false,"no replay after reentering the room");
});

test("offscreen/background results are consumed, never queued for another room",()=>{
 const track=Reaction.createTracker();
 const feedback={seq:12,scene:"lab",room:"basic",operation:"synthesize",ok:true};
 assert.equal(track.take(feedback,ctx(50,{visible:false})),false);
 assert.equal(track.current(55,ctx(55)),null);
 assert.equal(track.take(feedback,ctx(80)),false);
 assert.equal(track.take({...feedback,seq:13},ctx(90,{room:"dna"})),false);
 assert.equal(track.take({...feedback,seq:14},ctx(100)),true);
 assert.equal(track.current(101,ctx(101,{visible:false})),null);
 assert.equal(track.take({...feedback,seq:14},ctx(120)),false);
});

test("all five room operations get strictly increasing trusted parent receipts",()=>{
 const host=read("js/lw-d-interface.js");
 const visual=read("prototypes/lw-d/live-context.js");
 assert.match(host,/let resultSequence=0/);
 const matches=(host.match(/seq:\+\+resultSequence/g)||[]);
 assert.equal(matches.length,5);
 assert.ok((visual.match(/seq:message\.seq/g)||[]).length>=5);
 const allowed=[
  ["trialum:lw:process-result","synthesize","kind","basic"],
  ["trialum:lw:dna-process-result","transform","op","dna"],
  ["trialum:lw:food-process-result","craft","op","foodlab"],
  ["trialum:lw:flora-process-result","plant","op","floralab"],
  ["trialum:lw:research-process-result","study","op","research"]
 ];
 for(let i=0;i<allowed.length;i++){
  const [type,operation,field,room]=allowed[i];
  const event=Reaction.normalizeResult(type,{seq:i+1,[field]:operation,ok:true});
  assert.equal(event.room,room);assert.equal(event.seq,i+1);
 }
});

test("renderer Basic visuals remain accepted, synchronized and bounded",()=>{
 const renderer=read("prototypes/lw-d/world.js");
 assert.match(renderer,/TrialumLabProcess\?\.begin/);
 assert.match(renderer,/TrialumLabProcess\?\.draw/);
 assert.match(renderer,/createTracker\?\.\(\)/);
 assert.match(renderer,/acceptedBasicSeq!==seq/);
 assert.match(renderer,/displayLabReceipt\(now\)/);
 assert.match(renderer,/reactionTracker\?\.clear\(\)/);
 assert.match(renderer,/canRender\(\)/);
 assert.match(renderer,/complexView!=="basic"/);
 const css=read("prototypes/lw-d/world.css");
 assert.match(css,/\.lw-lab-receipt\[hidden\]\{display:none!important\}/);
 const process=read("prototypes/lw-d/lab-process.js");
 const reactions=read("prototypes/lw-d/event-reactions.js");
 assert.doesNotMatch(process+reactions,/fetch\(|WebSocket|localStorage|indexedDB|setInterval\(|setTimeout\(|\.save\(/);
 assert.match(read("sw.js"),/prototypes\/lw-d\/event-reactions\.js/);
 assert.match(read("android-template/app/build.gradle.kts"),/prototypes\/lw-d\/event-reactions\.js/);
});
test("Basic HUD holds one in-flight original engine action, preventing rapid double spending",()=>{
 const hud=read("prototypes/lw-d/live-context.js");
 assert.match(hud,/let basicPending=false/);
 assert.match(hud,/if\(basicPending\)return;/);
 assert.match(hud,/basicPending=true;resultText="";render\(\);/);
 assert.match(hud,/addButton\(selected.command,selected.kind,"",blocked\|\|basicPending\)/);
 assert.match(hud,/else if\(message.type==="trialum:lw:result"\)\{\s*basicPending=false/);
 assert.match(hud,/root.parent.postMessage\(\{type:"trialum:lw:action",kind:b.dataset.lwAction\},origin\)/);
});
