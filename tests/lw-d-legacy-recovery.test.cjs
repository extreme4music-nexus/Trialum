"use strict";
const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");

test("LW-C contextual conversation engine is PRESENT and loaded before optional AI",()=>{
 const html=read("index.html"),session=read("js/playground-dialogue-session.js");
 assert.ok(html.indexOf('src="js/playground-dialogue-session.js"')>0);
 assert.ok(html.indexOf('src="js/playground-dialogue-session.js"')<
   html.indexOf('src="js/playground-ai.js"'),"dialogue ledger must load before AI");
 assert.match(session,/MAX_TURNS=36/);
 assert.match(session,/90\*60\*1000/);
 assert.match(session,/replyTo/);
 assert.match(read("js/playground-ai.js"),/TrialumDialogueSessions/);
});
test("real social feature set and pet simulation are preserved in the 3D edition",()=>{
 const files=["js/social.js","js/presence.js","js/shared-playground.js","js/messages.js",
  "js/peer.js","js/playground.js","js/playground-memory.js","js/advanced-intelligence.js",
  "js/engine.js","js/storage.js","js/play-games.js"];
 files.forEach(f=>assert.ok(read(f).length>600,"Missing essential pre-3D feature: "+f));
 const bridge=read("js/app.js");
 for(const route of ["friends","messages","pets","habitats","playground","shared","food","playgames","dna"]){
  assert.ok(bridge.includes("'"+route+"'"),"bridge cannot open "+route);
 }
 assert.match(read("prototypes/lw-d/world-navigation.js"),/\["🤝","friends","classic"\]/);
 assert.match(read("prototypes/lw-d/world-navigation.js"),/\["🌳","shared","classic"\]/);
 assert.match(read("js/lw-d-interface.js"),/API\(\)\?\.classicTab\?\.\(next\)/);
});
test("mutating original pet data or game engine has not been introduced by the import",()=>{
 const source=read("js/playground-dialogue-session.js");
 assert.doesNotMatch(source,/localStorage\.setItem|indexedDB\.open|fetch\(|setInterval\(/);
 const ai=read("js/playground-ai.js");
 assert.match(ai,/TrialumPlaygroundAI/);
 assert.match(ai,/suppressSimulation/);
 assert.match(read("js/play-games.js"),/state\.cloudConsent&&Date\.now\(\)-checkedAt>5000/);
});
test("all social scripts, renderer assets and language data are included in offline Android",()=>{
 const sw=read("sw.js");
 for(const file of ["js/playground-dialogue-session.js","js/playground-ai.js",
  "js/shared-playground.js","js/messages.js","js/play-games.js",
  "prototypes/lw-d/lab-detail.js","prototypes/lw-d/lab-complex.js"])
  assert.ok(sw.includes("'"+file+"'"),"PWA cache missing "+file);
 const workflow=read(".github/workflows/lw-d-android-qa.yml");
 assert.match(workflow,/vars\.TRIALUM_SOCIAL_API_URL/,"LWD social QA must use existing HTTPS hostname variable");
 assert.match(workflow,/-PtrialumSocialApiUrl=\$social_url/);
 assert.match(workflow,/https:\/\//);
  const gradle=read("android-template/app/build.gradle.kts");
 assert.match(gradle,/applicationIdSuffix = "\.lwd1"/);
 assert.match(gradle,/versionCode = 34/);
 assert.match(gradle,/include\("index\.html",[^\n]*"js\/\*\*"/);
 const en=JSON.parse(read("locales/en.json")).strings;
 assert.equal(en["Може ли да ми кажеш повеќе за тоа?"],"Could you tell me more about that?");
 assert.ok(en["Лабораториски комплекс"]);
});
test("L3.1 lab and Android immersive mode survive the classic-LW-C consolidation",()=>{
 const h=read("prototypes/lw-d/world.html");
 const world=read("prototypes/lw-d/world.js");
 assert.match(world,/TrialumLabComplex\?\.drawRoom/);
 assert.match(world,/TrialumLabDetail\?\.drawMachines/);
 assert.match(h,/lab-complex\.js/);
 assert.match(h,/lab-detail\.js/);
 const native=read("android-template/app/src/main/java/com/trialum/ziivaiskra/MainActivity.kt");
 assert.match(native,/setLivingWorldImmersive/);
 assert.match(native,/packageName != "com\.trialum\.ziivaiskra\.lwd1"/);
});
