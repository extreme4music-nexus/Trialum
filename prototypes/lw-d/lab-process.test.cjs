const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const Lab=require("./lab-process.js");
const read=p=>fs.readFileSync(path.join(__dirname,"../..",p),"utf8");
test("all four existing engine actions have unique station mappings and bounded duration",()=>{
 assert.deepEqual(Object.keys(Lab.TYPES),["synthesize","analyze","harvest","grow"]);
 assert.equal(new Set(Object.values(Lab.TYPES).map(x=>x.station)).size,4);
 assert.ok(Object.values(Lab.TYPES).every(x=>x.duration>=2000&&x.duration<=4000));
});
test("result playback never calculates game progression, only reads before/after",()=>{
 const before={compounds:4,insight:10,biomass:8,cells:3},after={...before,compounds:7};
 const event=Lab.begin("synthesize",true,1000,before,after);
 assert.equal(event.change,3);assert.equal(event.station,"synthesis");assert.equal(event.success,true);
 assert.deepEqual(before,{compounds:4,insight:10,biomass:8,cells:3});
 const mid=Lab.sample(event,2550);
 assert.ok(mid.intensity>0);assert.equal(mid.active,true);
 const end=Lab.sample(event,4500);
 assert.equal(end.active,false);assert.equal(end.phase,1);
 assert.equal(Lab.begin("sendMessage",true,1000,before,after),null);
});
test("failed engine result is not drawn as success and cannot manufacture resources",()=>{
 const fail=Lab.begin("grow",false,5000,{cells:3},{cells:3});
 assert.equal(fail.success,false);assert.equal(fail.change,0);
 const commands=[];const render=Lab.draw((...a)=>commands.push(a),{cube:true},{sphere:true},fail,6300);
 assert.equal(render.success,false);assert.ok(commands.length>0);
 assert.ok(commands.every(a=>a[8][0]===1&&a[8][1]===.64));
 const r=Lab.draw((...a)=>commands.push(a),{},{},fail,10000);assert.equal(r.active,false);
});
test("live UI transmits only existing engine outcome metrics, not mutable game records",()=>{
 const bridge=read("js/lw-d-interface.js"),hud=read("prototypes/lw-d/live-context.js");
 assert.match(bridge,/const before=API\(\)\?\.snapshot/);
 assert.match(bridge,/const after=API\(\)\?\.snapshot/);
 assert.match(bridge,/type:"trialum:lw:result",kind/);
 assert.match(hud,/trialum:lw:process-result/);
 assert.match(hud,/result\?\.ok===true/);
 const renderer=read("prototypes/lw-d/world.js");
 assert.match(renderer,/TrialumLabProcess\?\.begin/);
 assert.match(renderer,/TrialumLabProcess\?\.draw/);
 assert.match(renderer,/machine\?4\.65:11/);
 assert.match(renderer,/lastPinchDistance/);
 assert.match(renderer,/uniform float material/);
});
test("L2 process files bundled offline and in Android, with no background jobs",()=>{
 const html=read("prototypes/lw-d/world.html");
 assert.match(html,/lab-process\.js/);
 assert.match(read("sw.js"),/prototypes\/lw-d\/lab-process\.js/);
 assert.match(read("android-template/app/build.gradle.kts"),/prototypes\/lw-d\/lab-process\.js/);
 assert.match(read("prototypes/lw-d/build_preview.py"),/lab-process\.js/);
 const body=read("prototypes/lw-d/lab-process.js");
 assert.doesNotMatch(body,/setInterval\(|setTimeout\(|fetch\(|localStorage|indexedDB/);
});

test("owner's L2 phone recording: live HUD finishes rendering, camera avoids wall-clipping, mobile UI is compact",()=>{
 const hud=read("prototypes/lw-d/live-context.js");
 const renderer=read("prototypes/lw-d/world.js");
 const css=read("prototypes/lw-d/world.css");
 const shell=read("js/lw-d-interface.js");
 assert.match(hud,/const newTitle=\(english\?enTitles:mkTitles\)\[scene\]/);
 assert.doesNotMatch(hud,/\[activeScene\]/);
 assert.match(hud,/badge\.textContent="L2 · "/);
 assert.match(renderer,/desiredDistance=machine\?4\.65:11/);
 assert.match(renderer,/yaw=machine\.x<0/);
 assert.match(renderer,/selectedStation\?4\.20:7/);
 assert.match(css,/\.lw-station-focus \.world-caption\{display:none\}/);
 assert.match(shell,/top:max\(34px/);
});
