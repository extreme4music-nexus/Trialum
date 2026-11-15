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

test("B1-R2: runtime measures frames only after rendering, probes actual GPU pixels, reloads GLB after context restoration",()=>{
 const src=read("pilot-runtime.mjs");
 assert.match(src,/planDrawingBuffer\(/);
 assert.match(src,/gl\.readPixels\(/);
 assert.match(src,/classifyPixelProbe\(/);
 assert.match(src,/webglcontextrestored/);
 assert.match(src,/loadRoom\(\)/);
 assert.match(src,/renderHealth/);
 assert.match(src,/samples\+\+/);
 assert.ok(src.indexOf("renderer.render(scene,camera)")<src.indexOf("samples++"),
   "sample count must only advance AFTER a real draw call");
 assert.match(src,/gpuRecovery/);
 assert.match(src,/resetFrameSamples\(/);
 assert.match(src,/boundCameraInsideRoom\(/);
 assert.match(src,/MathUtils\.clamp/);
});
