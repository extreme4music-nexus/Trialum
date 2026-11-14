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
 assert.match(gradle,/prototypes\/lw-d\/\*\*/);
 const sw=read("sw.js");
 assert.match(sw,/js\/lw-d-interface\.js/);
 assert.match(sw,/prototypes\/lw-d\/live-context\.js/);
 assert.match(sw,/prototypes\/lw-d\/world\.html/);
});
test("D0 review packager excludes parent-only live-context script",()=>{
 const py=read("prototypes/lw-d/build_preview.py");
 assert.match(py,/html\.replace/);
 assert.match(py,/live-context\.js/);
});
