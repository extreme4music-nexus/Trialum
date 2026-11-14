const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");

test("holographic HUD can hide, restore, and remains keyboard/reader accessible",()=>{
 const src=read("prototypes/lw-d/live-context.js");
 for(const marker of [
  'hudToggle.id="lw-hud-toggle"',
  'hudToggle.setAttribute("aria-controls","lw-context")',
  'hudToggle.setAttribute("aria-expanded",String(!hudCollapsed))',
  'panel.hidden=hudCollapsed',
  'panel.setAttribute("aria-hidden",String(hudCollapsed))',
  'hudToggle.addEventListener("click",()=>applyHudState(!hudCollapsed))',
  'applyHudState(hudCollapsed)'
 ])assert.ok(src.includes(marker),marker);
 const css=read("prototypes/lw-d/live-context.js");
 assert.match(css,/backdrop-filter:blur\(23px\) saturate\(1\.65\)/);
 assert.match(css,/#lw-context\[hidden\]\{display:none!important\}/);
 assert.match(css,/prefers-reduced-transparency/);
});

test("native Android hides only status icons, never system navigation gestures",()=>{
 const src=read("android-template/app/src/main/java/com/trialum/ziivaiskra/MainActivity.kt");
 assert.match(src,/@JavascriptInterface fun setLivingWorldFullscreen\(enabled: Boolean\)/);
 assert.match(src,/controller\?\.hide\(WindowInsets\.Type\.statusBars\(\)\)/);
 assert.match(src,/controller\?\.show\(WindowInsets\.Type\.statusBars\(\)\)/);
 assert.doesNotMatch(src,/controller\?\.hide\(WindowInsets\.Type\.navigationBars\(\)\)/);
 assert.doesNotMatch(src,/controller\?\.hide\(WindowInsets\.Type\.systemBars\(\)\)/);
 assert.match(src,/override fun onResume\(\)/);
});

test("native full-screen state is reversible on return to classic UI",()=>{
 const shell=read("js/lw-d-interface.js");
 assert.match(shell,/TrialumAndroid\?\.setLivingWorldFullscreen\?\.\(false\)/);
 assert.match(shell,/TrialumAndroid\.setLivingWorldFullscreen\(true\)/);
 assert.ok(shell.includes(".lw-d-overlay.lw-native-immersive .lw-d-close"));
 assert.match(shell,/root\.addEventListener\("pagehide",close\)/);
});

test("hologram changes rendering only, not storage, engine or social state",()=>{
 const hologram=read("prototypes/lw-d/live-context.js");
 const js=hologram.slice(hologram.indexOf("const hudToggle="),hologram.indexOf('document.body.classList.add("lw-live-mode")'));
 assert.doesNotMatch(js,/localStorage|indexedDB|fetch\(|setInterval|scheduleSave|engine\.js/);
 assert.match(read("sw.js"),/trialum-lw-d-l2-hologram-20261114-v4/);
});
