"use strict";
const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {pathToFileURL}=require("node:url");
const BASE=path.resolve(__dirname,"..");
const root=path.join(BASE,"prototypes/lw-d/b1");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

test("B1-R2: quality buffer never exceeds Android-safe memory/side limits",async()=>{
 const {planDrawingBuffer,B1_MAX_PIXELS,B1_MAX_SIDE}=await import(pathToFileURL(path.join(root,"gpu-health.mjs")).href);
 for(const [w,h,dpr] of [[980,420,3],[1080,2340,4],[2340,1080,3],[320,180,2],[1920,1080,1],[1400,3100,3]]){
  let previous=0;
  for(const quality of ["eco","balanced","high"]){
   const p=planDrawingBuffer(w,h,dpr,quality,4096);
   assert.ok(p&&p.drawWidth>=2&&p.drawHeight>=2);
   assert.ok(p.pixels<=B1_MAX_PIXELS);
   assert.ok(Math.max(p.drawWidth,p.drawHeight)<=B1_MAX_SIDE);
   assert.ok(p.pixels>=previous,"quality change cannot decrease render pixels for same viewport");
   previous=p.pixels;
  }
 }
 assert.equal(planDrawingBuffer(0,500,3,"high"),null);
 assert.equal(planDrawingBuffer(NaN,500,3,"high"),null);
});

test("B1-R2: render probe separates confirmed visible, black, and unreadable buffers",async()=>{
 const {classifyPixelProbe}=await import(pathToFileURL(path.join(root,"gpu-health.mjs")).href);
 assert.equal(classifyPixelProbe([[0,0,0],[0,0,0],[0,0,0]]),"black");
 assert.equal(classifyPixelProbe([[0,0,0],[12,33,49],[0,0,0]]),"visible");
 assert.equal(classifyPixelProbe([[0,0,0],null,[0,0,0]]),"unavailable");
});

test("B1-R2b: render loop never blocks Android UI with synchronous GPU readback, and reloads GLB after context restoration",()=>{
 const src=read("pilot-runtime.mjs");
 assert.match(src,/planDrawingBuffer\(/);
 assert.doesNotMatch(src,/gl\.readPixels\s*\(/);
 assert.doesNotMatch(src,/gl\.finish\s*\(/);
 assert.doesNotMatch(src,/probeFramebuffer\s*\(/);
 assert.match(src,/RAF-active \/ VISUAL NOT VERIFIED/);
 assert.match(src,/webglcontextrestored/);
 assert.match(src,/loadRoom\(\)/);
 assert.match(src,/renderHealth/);
 assert.match(src,/samples\+\+/);
 assert.ok(src.indexOf("renderer.render(scene,camera)")<src.indexOf("samples++"),
   "RAF sampling must only start after render() returned");
 assert.match(src,/catch\(ex\)\{\s*frameFaults\+\+/);
 assert.match(src,/if\(ready\(\)\)raf=requestAnimationFrame\(frame\)/);
 assert.match(src,/gpuRecovery/);
 assert.match(src,/resetFrameSamples\(/);
 assert.match(src,/boundCameraInsideRoom\(/);
 assert.match(src,/MathUtils\.clamp/);
});

test("B1-R2c: Android parent blur must NOT send a false hosted-visibility pause",()=>{
 const launcher=fs.readFileSync(path.join(BASE,"js/lw-d-b1-pilot-launcher.js"),"utf8");
 const runtime=read("pilot-runtime.mjs");
 assert.doesNotMatch(launcher,/addEventListener\\(["']blur["']/,
   "Native Android quality selects blur their parent without hiding the app");
 assert.match(launcher,/document\\.hidden/);
 assert.match(runtime,/wakeFromForegroundInteraction\\(/);
 assert.match(runtime,/foregroundResumes\\+\\+/);
 assert.match(runtime,/slowRafTicks\\+\\+/);
 assert.match(runtime,/RAF ticks/);
 assert.match(runtime,/hostVisible=true/);
});

test("B1-R3: isolated Android host footer/control placement and safe camera guard",()=>{
 const css=read("pilot.css");
 const launcher=fs.readFileSync(path.join(BASE,"js/lw-d-b1-pilot-launcher.js"),"utf8");
 const runtime=read("pilot-runtime.mjs");
 assert.match(css,/safe-area-inset-top/);
 assert.match(css,/calc\(100vw - 145px\)/);
 assert.match(launcher,/right:max\(10px,env\(safe-area-inset-right\)\)/);
 assert.match(runtime,/camera\.position\.x=THREE\.MathUtils\.clamp/);
 assert.match(runtime,/camera\.position\.z=THREE\.MathUtils\.clamp/);
 assert.match(runtime,/camera\.position\.y=THREE\.MathUtils\.clamp/);
 assert.match(runtime,/recoverQuality/);
 assert.match(runtime,/prior black\/lost frame/);
});
