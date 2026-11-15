"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const Sound=require("../prototypes/lw-d/spatial-audio.js");
const Reactions=require("../prototypes/lw-d/event-reactions.js");
const read=name=>fs.readFileSync(path.join(__dirname,"..",name),"utf8");
const vm=require("node:vm");
function audioHarness(){
 const documentEvents=new Map(),events=new Map(),buttonEvents=new Map(),messages=[];
 const param=()=>({setTargetAtTime(){},setValueAtTime(){},exponentialRampToValueAtTime(){}});
 const button={textContent:"",title:"",attributes:{},setAttribute(k,v){this.attributes[k]=v;},
  addEventListener(k,fn){buttonEvents.set(k,fn);}};
 const info={textContent:""};
 const doc={
  readyState:"complete",hidden:false,documentElement:{lang:"mk"},
  getElementById(k){return k==="lw-spatial-toggle"?button:k==="lw-spatial-info"?info:null;},
  addEventListener(k,fn){documentEvents.set(k,fn);}
 };
 const contexts=[];
 class FakeAudioContext{
  constructor(){this.state="suspended";this.destination={};this.started=0;this.suspended=0;
   this.currentTime=0;this.listener=Object.fromEntries(
    ["positionX","positionY","positionZ","forwardX","forwardY","forwardZ","upX","upY","upZ"].map(k=>[k,param()]));
   contexts.push(this);
  }
  createGain(){return {gain:param(),connect(){},disconnect(){}};}
  createBiquadFilter(){return {frequency:param(),connect(){},disconnect(){}};}
  createPanner(){return {positionX:param(),positionY:param(),positionZ:param(),connect(){},
    disconnect(){},setPosition(){},refDistance:0};}
  createOscillator(){const c=this;return {frequency:param(),connect(){},disconnect(){},
    start(){c.started++;},stop(){},onended:null};}
  resume(){this.state="running";return Promise.resolve();}
  suspend(){this.state="suspended";this.suspended++;return Promise.resolve();}
 }
 const root={
  document:doc,AudioContext:FakeAudioContext,location:{origin:"https://appassets.androidplatform.net"},
  parent:{postMessage(data,origin){messages.push({data,origin});}},
  addEventListener(k,fn){events.set(k,fn);},
  setInterval(){return 1;},clearInterval(){},console
 };
 const src=read("prototypes/lw-d/spatial-audio.js");
 vm.runInNewContext(src,root);
 return {api:root.TrialumLWSpatialAudio,doc,button,info,messages,contexts,
  pointer(target={closest(){return null;}}){documentEvents.get("pointerdown")?.({target});},
  click(){buttonEvents.get("click")?.();},
  emit(k,data){events.get(k)?.(data);}
 };
}

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
test("confirmed lab operations have distinct positional success/failure signatures",()=>{
 const kinds=["synthesize","analyze","harvest","grow","design","transform","craft","feed","invent","plant","study","upgrade"];
 assert.ok(new Set(kinds.map(kind=>Sound.cueFor("basic",kind,true).base)).size>=8);
 for(const operation of kinds){
  const okay=Sound.cueFor("basic",operation,true);
  const failed=Sound.cueFor("basic",operation,false);
  assert.ok(okay.base>failed.base);
  assert.notEqual(okay.glide,failed.glide); // harvest correctly descends on success
 }
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
test("on Galaxy-style immersive 3D first normal tap unlocks Web Audio, not an invisible topbar button",async()=>{
 const h=audioHarness();
 h.api.settings({sound:true,music:true,volume:.55});
 assert.equal(h.contexts.length,0,"never start audio without a gesture");
 h.pointer();await new Promise(resolve=>setImmediate(resolve));
 assert.equal(h.contexts.length,1);
 assert.equal(h.contexts[0].state,"running");
 assert.equal(h.api.status().unlocked,true);
 assert.ok(h.contexts[0].started>0,"the initial room composition actually schedules audible oscillators");
 assert.equal(h.messages.length,0,"player's existing music choice is preserved without a consent change");
 const html=read("prototypes/lw-d/world.html");
 assert.ok(html.indexOf('id="lw-spatial-toggle"')<html.indexOf('<header class="topbar"'),
   "3D sound toggle must be OUTSIDE the purposely hidden live-mode topbar");
 const css=read("prototypes/lw-d/world.css");
 assert.match(css,/body\.lw-live-mode \.topbar\{display:none!important\}/);
 assert.match(css,/\.lw-spatial-controls\{/);
});

test("default music-off saves are never silently overridden; explicit tap requests parent permission",async()=>{
 const h=audioHarness();
 h.api.settings({sound:true,music:false,volume:.55});
 h.pointer();await new Promise(resolve=>setImmediate(resolve));
 assert.equal(h.api.status().unlocked,true);
 assert.equal(h.contexts[0].started,0,"quiet when original user disabled music");
 h.click();await new Promise(resolve=>setImmediate(resolve));
 assert.equal(h.messages.length,1);
 assert.equal(h.messages[0].data.type,"trialum:lw:audio-consent");
 assert.equal(h.messages[0].data.enableMusic,true);
 assert.equal(h.api.status().music,false,"iframe may NOT write its own music preference");
 h.api.settings({sound:true,music:true,volume:.55});
 assert.ok(h.contexts[0].started>0,"music begins after parent confirms saved preference");
 const host=read("js/lw-d-interface.js"),game=read("js/app.js");
 assert.match(host,/trialum:lw:audio-consent/);
 assert.match(host,/API\(\)\?\.enable3DMusic\?\.\(\)/);
 assert.match(game,/enable3DMusic\(\)/);
 assert.match(game,/s\.settings\.music=true/);
 assert.match(game,/scheduleSave\(\)/);
});

test("SFX work even with music disabled, and background visibility suspends the sound engine",async()=>{
 const h=audioHarness();
 h.api.settings({sound:true,music:false,volume:.55});
 h.pointer();await new Promise(resolve=>setImmediate(resolve));
 const before=h.contexts[0].started;
 h.api.sceneChanged("lab","basic");
 h.api.playResult({scene:"lab",room:"basic",operation:"analyze",ok:true});
 assert.ok(h.contexts[0].started>=before+2,"2D engine-approved event plays 3D spatial sound even without music");
 h.api.visibility(false);await Promise.resolve();
 assert.equal(h.contexts[0].state,"suspended");
 assert.equal(h.api.status().visible,false);
 assert.equal(h.api.status().sound,true,"pause must preserve saved settings");
 h.api.playResult({scene:"lab",room:"basic",operation:"analyze",ok:true});
 assert.equal(h.contexts[0].started,before+2,"background has zero new audio events");
 const host=read("js/lw-d-interface.js");
 assert.match(host,/visible:!document\.hidden/);
 assert.doesNotMatch(host,/visible:!document\.hidden&&document\.hasFocus\(\)/,
   "iframe focus must not be treated as a WebView background transition");
});

test("a confirmed original-engine operation emits sound exactly once by result receipt",async()=>{
 const h=audioHarness();
 h.api.settings({sound:true,music:false,volume:.55});
 h.pointer();await new Promise(resolve=>setImmediate(resolve));
 h.api.sceneChanged("lab","basic");
 const start=h.contexts[0].started;
 const receipt={seq:71,scene:"lab",room:"basic",operation:"synthesize",ok:true};
 h.api.playResult(receipt);
 assert.equal(h.contexts[0].started,start+2);
 h.api.playResult(receipt);
 assert.equal(h.contexts[0].started,start+2,"same trusted receipt is silent on replay");
 h.api.playResult({...receipt,seq:70});
 assert.equal(h.contexts[0].started,start+2,"out-of-order result is silent");
 h.api.playResult({...receipt,seq:72});
 assert.equal(h.contexts[0].started,start+4,"next independent approved action is audible");
});
