const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.join(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");

test("L2.2 hologram is frosted, translucent and has low-motion accessibility",()=>{
 const hud=read("prototypes/lw-d/live-context.js");
 assert.match(hud,/backdrop-filter:blur\(13px\)/);
 assert.match(hud,/rgba\(12,56,74,\.48\)/);
 assert.match(hud,/box-shadow:inset/);
 assert.match(hud,/@media\(prefers-reduced-motion:reduce\)/);
 assert.match(hud,/aria-label/);
});
test("HUD may be hidden and recovered without trapping input or changing game state",()=>{
 const hud=read("prototypes/lw-d/live-context.js");
 assert.match(hud,/hudToggle\.id="lw-hud-toggle"/);
 assert.match(hud,/aria-controls","lw-context"/);
 assert.match(hud,/function setHudHidden\(hide\)/);
 assert.match(hud,/panel\.inert=true/);
 assert.match(hud,/panel\.inert=false/);
 assert.match(hud,/hudToggle\.addEventListener\("click",\(\)=>setHudHidden\(!hudHidden\)\)/);
 assert.match(hud,/lw-hud-hidden #lw-hud-toggle/);
 assert.match(hud,/exit\.dataset\.lwTab="lab"/);
 assert.doesNotMatch(hud,/localStorage\.setItem|scheduleSave|E\.basicResearch/);
});
test("exit route is available via HUD, native back and hidden parent emergency button",()=>{
 const hud=read("prototypes/lw-d/live-context.js");
 const shell=read("js/lw-d-interface.js");
 assert.match(hud,/lw-exit-world/);
 assert.match(hud,/exit\.dataset\.lwTab="lab"/);
 assert.match(hud,/\["lab","plants","habitats","research"\]/);
 assert.match(shell,/lw-d-ready/);
 assert.match(shell,/TrialumLWDisplay=Object\.freeze\(\{sync,isOpen:\(\)=>opened,close\}\)/);
 assert.match(shell,/setNativeImmersive\(false\)/);
 assert.match(shell,/setNativeImmersive\(true\)/);
});
test("Android immersive system-bar logic is isolated to historical .lwd1 and the owned SignQA",()=>{
 const kt=read("android-template/app/src/main/java/com/trialum/ziivaiskra/MainActivity.kt");
 assert.match(kt,/setLivingWorldImmersive\(enabled: Boolean\)/);
 assert.match(kt,/isLivingWorldQaPackage\(\)/);
 assert.match(kt,/packageName == "com\.trialum\.ziivaiskra\.signqa"/);
 assert.match(kt,/controller\?\.hide\(WindowInsets\.Type\.systemBars\(\)\)/);
 assert.match(kt,/controller\?\.show\(WindowInsets\.Type\.systemBars\(\)\)/);
 assert.match(kt,/BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE/);
 assert.match(kt,/val statusTop = if \(livingWorldImmersive\) 0/);
 assert.match(kt,/onBackPressed\(\)/);
 const build=read("android-template/app/build.gradle.kts");
 assert.match(build,/applicationIdSuffix = "\.lwd1"/);
});
