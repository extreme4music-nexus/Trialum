const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.join(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
test("D1 lives behind an opt-in button, never replaces the existing main world",()=>{
 const html=read("index.html");
 assert.ok(html.includes('src="js/app.js"'));
 assert.ok(html.includes('src="js/lw-d-interface.js"'));
 assert.ok(html.indexOf('src="js/app.js"')<html.indexOf('src="js/lw-d-interface.js"'));
 assert.ok(html.includes('id="world"'));
});
test("world bridge reads existing engine state and delegates laboratory transactions",()=>{
 const app=read("js/app.js");
 assert.match(app,/TrialumLWBridge=Object.freeze/);
 assert.match(app,/E\.basicResearch\(s,kind\)/);
 assert.match(app,/notice\(result,'tap'\)/);
 assert.match(app,/TrialumLWDisplay\?\.sync/);
 assert.doesNotMatch(app,/TrialumLWBridge[\s\S]{0,100}newGame\(/);
});
test("only whitelisted gameplay actions cross into parent",()=>{
 const src=read("js/lw-d-interface.js");
 assert.match(src,/event\.source!==iframe\?\.contentWindow/);
 assert.match(src,/event\.origin!==origin/);
 assert.match(src,/synthesize","analyze","harvest","grow/);
 assert.match(src,/TrialumWorld\?\.setSceneVisible\?\.\(false\)/);
 assert.match(src,/TrialumLWDisplay=Object\.freeze/);
 assert.doesNotMatch(src,/localStorage|indexedDB|fetch\(/);
});
test("each scene has contextual controls and the sandbox preview is independent",()=>{
 const js=read("prototypes/lw-d/live-context.js");
 for(const key of ["lab:", "flora:", "biosphere:", "research:"])assert.ok(js.includes(key));
 assert.match(js,/URLSearchParams/);
 assert.match(js,/event\.source!==root\.parent/);
 assert.match(js,/type:"trialum:lw:action"/);
 const proto=read("prototypes/lw-d/world.html");
 assert.match(proto,/live-context\.js/);
});
test("Android package includes the new scene files and immutable backup path is untouched",()=>{
 const gradle=read("android-template/app/build.gradle.kts");
 for(const name of ["world.html","world.css","world.js","sim.js","live-context.js","lab-room.js","lab-process.js"])assert.ok(gradle.includes("prototypes/lw-d/"+name));
 assert.ok(!gradle.includes("prototypes/lw-d/**"),"no prototype tests/docs in APK assets");
 const sw=read("sw.js");
 assert.match(sw,/js\/lw-d-interface\.js/);
 assert.match(sw,/prototypes\/lw-d\/live-context\.js/);
 assert.match(sw,/prototypes\/lw-d\/world\.html/);
 assert.match(sw,/prototypes\/lw-d\/lab-room\.js/);
 assert.match(sw,/prototypes\/lw-d\/lab-process\.js/);
});
test("D0 review packager excludes parent-only live-context script",()=>{
 const py=read("prototypes/lw-d/build_preview.py");
 assert.match(py,/html\.replace/);
 assert.match(py,/live-context\.js/);
});

test("LW-D QA uses registered SignQA and GitHub automated owner-key signing without Codex Release/Debug",()=>{
  const gradle=read("android-template/app/build.gradle.kts");
  assert.match(gradle,/create\("signqa"\)/);
  assert.match(gradle,/applicationIdSuffix = "\.signqa"/);
  const workflow=read(".github/workflows/lw-d-android-qa.yml");
  assert.match(workflow,/:app:assembleSignqa/);
  assert.match(workflow,/EXISTING_GITHUB_QA_KEY/);
  assert.match(workflow,/OWNER_SIGNED_INTERNAL_LW_D_QA_NOT_PUBLIC_RELEASE/);
  assert.match(workflow,/github\.actor == 'extreme4music-nexus'/);
  assert.match(workflow,/needs: build-lwd-signqa/);
  assert.match(workflow,/contents: read/);
  assert.doesNotMatch(workflow,/RELEASE_KEYSTORE_B64|:app:assembleRelease|:app:assembleSigndebug/);
  assert.match(workflow,/QA_CERT_SHA256/);
});

test("embedded 3D and fallback render immediately despite parent close-button focus, but halt on document background",()=>{
 const js=read("prototypes/lw-d/world.js");
 const parent=read("js/lw-d-interface.js");
 assert.match(js,/const canRender=\(\)=>!document\.hidden&&parentVisible&&\(embeddedLive\|\|document\.hasFocus\(\)\)/);
 assert.match(js,/if\(!canRender\(\)\)\{stop\(\);return;\}/);
 assert.match(js,/event\.source!==window\.parent/);
 assert.match(js,/pauseRenderer=stop;resumeRenderer=resume/);
 assert.match(parent,/type:"trialum:lw:visibility",visible:!document\.hidden&&document\.hasFocus\(\)/);
 assert.match(parent,/document\.addEventListener\("visibilitychange",signalVisible\)/);
});

test("L2 phone QA: exact bilingual laboratory outcomes and foreground-focused HUD",()=>{
 const en=JSON.parse(read("locales/en.json")).strings;
 for(const msg of [
  "Синтетизирани се молекули и добиено е знаење.",
  "Нови истражувачки поени.",
  "Додадени се хемиски резерви.",
  "Клеточната популација расте.",
  "Нема лабораториски акции денес."
 ])assert.ok(en[msg]&&!/[Ѐ-ӿ]/.test(en[msg]),"exact English translation missing: "+msg);
 const hud=read("prototypes/lw-d/live-context.js");
 assert.match(hud,/make\("div",T\(resultText\),"lw-result"\)/);
 const css=read("prototypes/lw-d/world.css");
 assert.match(css,/body\.lw-live-mode \.topbar\{display:none!important\}/);
 assert.match(css,/body\.lw-station-focus #lw-context \.lw-stations/);
 const shell=read("js/lw-d-interface.js");
 assert.match(shell,/body\.lw-d-live #toast\.show/);
});
