/** TRIALUM S7 G01 TRUE Android-source visual check (independent Chromium).
 * FAILS unless new FOUR basin architecture + FOUR actually animating water surfaces
 * are mounted INSIDE the existing GLB scene; records a REAL screenshot.
 * Does not replace Samsung Galaxy A55 OWNER QA.
 */
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import {spawn} from "node:child_process";
import {fileURLToPath} from "node:url";
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const suffix={".js":"text/javascript",".mjs":"text/javascript",".html":"text/html",
 ".css":"text/css",".json":"application/json",".glb":"model/gltf-binary"};
const server=http.createServer((req,res)=>{
 const pathname=decodeURIComponent(new URL(req.url,"http://localhost").pathname);
 const file=path.resolve(ROOT,"."+pathname);
 if(!file.startsWith(ROOT+path.sep)){res.writeHead(403).end();return;}
 fs.readFile(file,(error,b)=>{
  if(error){res.writeHead(404).end("Missing G01 asset: "+pathname);return;}
  res.writeHead(200,{"Content-Type":suffix[path.extname(file)]||"application/octet-stream",
   "Cache-Control":"no-store"});res.end(b);
 });
});
const executable=[process.env.CHROME_BIN,"/usr/bin/google-chrome","/usr/bin/chromium","/opt/google/chrome/chrome"].filter(Boolean).find(fs.existsSync);
if(!executable)throw Error("No Chromium executable: G01 actual visual QA is required, not optional");
const TEMP=fs.mkdtempSync(path.join(os.tmpdir(),"trialum-g01-browser-"));
const OUT=path.join(ROOT,"tests","g01-live-gpu-qa");
fs.mkdirSync(OUT,{recursive:true});
let chrome,ws,id=0;const pending=new Map();
async function until(fn,ms=30000){
 const start=Date.now(),errors=[];
 while(Date.now()-start<ms){
  try{const v=await fn();if(v)return v;}catch(e){if(errors.length<4)errors.push(String(e))}
  await sleep(170);
 }
 throw Error("G01 LIVE browser timeout: "+errors.join(" / "));
}
async function send(method,params={}){
 if(!ws||ws.readyState!==1)throw Error("G01 CDP unavailable");
 const n=++id;
 return await Promise.race([
  new Promise((resolve,reject)=>{pending.set(n,{resolve,reject});ws.send(JSON.stringify({id:n,method,params}))}),
  new Promise((_,reject)=>setTimeout(()=>reject(Error(method+" timeout")),15000))
 ]);
}
async function evaluate(expression){
 const o=await send("Runtime.evaluate",{expression,returnByValue:true,awaitPromise:true});
 if(o.exceptionDetails)throw Error("G01 JavaScript failed: "+JSON.stringify(o.exceptionDetails));
 return o.result?.value;
}
async function main(){
 await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
 const url="http://127.0.0.1:"+server.address().port+
  "/prototypes/lw-d/scenes/agro-greenhouse/greenhouse.html";
 chrome=spawn(executable,["--headless=new","--no-sandbox","--disable-dev-shm-usage",
  "--enable-webgl","--enable-unsafe-swiftshader","--use-angle=swiftshader",
  "--disable-background-timer-throttling","--disable-renderer-backgrounding",
  "--remote-debugging-port=0","--user-data-dir="+TEMP,
  "--window-size=1280,780",url],{stdio:["ignore","ignore","pipe"]});
 let port,stderr="";
 chrome.stderr.on("data",chunk=>{stderr=(stderr+String(chunk)).slice(-12000);
  const m=stderr.match(/DevTools listening on ws:\/\/127\.0\.0\.1:(\d+)/);
  if(m)port=Number(m[1]);
 });
 await until(()=>{
  if(port)return port;
  try{const raw=fs.readFileSync(path.join(TEMP,"DevToolsActivePort"),"utf8");
   port=Number(raw.split("\n")[0]);return port||false;}catch(_){return false}
 },20000);
 const wsURL=await until(async()=>{
  const r=await fetch("http://127.0.0.1:"+port+"/json/list");
  return (await r.json()).find(x=>x.type==="page"&&x.url.includes("/greenhouse.html"))?.webSocketDebuggerUrl;
 },10000);
 ws=new WebSocket(wsURL);
 ws.addEventListener("message",event=>{
  const msg=JSON.parse(event.data),item=pending.get(msg.id);
  if(!item)return;pending.delete(msg.id);
  if(msg.error)item.reject(Error(JSON.stringify(msg.error)));else item.resolve(msg.result||{});
 });
 await new Promise((resolve,reject)=>{ws.addEventListener("open",resolve,{once:true});
  ws.addEventListener("error",reject,{once:true});});
 await send("Page.enable");await send("Runtime.enable");
 const boot=await until(async()=>{
  const status=await evaluate("document.querySelector('#status')?.textContent||''");
  if(/FAILED|unavailable|renderer exception/i.test(status))throw Error("Actual G01 failed: "+status);
  const water=await evaluate("window.TrialumS7Debug?.status?.().water");
  if(status.includes("REAL G01 WATER GARDEN GLBs loaded")&&water?.inScene&&water.waterMorphMeshes===4)
   return {status,water};
 },45000);
 await until(async()=>{
  const w=await evaluate("window.TrialumS7Debug?.status?.().water");
  return w?.waterAnimationRunning&&w?.basins===4&&w?.modules===12;
 },15000);
 const after=await evaluate("window.TrialumS7Debug.status()");
 if(!after.ready||after.water.gameplayWrites!==0||after.water.realAquaticPlants!==0)
  throw Error("G01 live source visualization does not match an EMPTY canonical aquarium: "+JSON.stringify(after));
 const screenshot=await send("Page.captureScreenshot",{format:"png",captureBeyondViewport:false});
 if(!screenshot.data||screenshot.data.length<4000)throw Error("G01 screenshot empty");
 const png=Buffer.from(screenshot.data,"base64");
 fs.writeFileSync(path.join(OUT,"G01-REAL-IN-GAME-WATER.png"),png);
 const proof={artifact:"S7 G01 LIVE, not the old empty shell",
  glbStatus:boot.status,waterMeshes:after.water.waterMorphMeshes,
  waveFrames:after.water.waveFrames,basins:after.water.basins,
  modules:after.water.modules,actualAquaticPlants:after.water.realAquaticPlants,
  screenshotBytes:png.length,gameplayWrites:after.water.gameplayWrites,
  proof:"Real Chromium/WebGL scene, NOT Galaxy A55 OWNER PASS"};
 fs.writeFileSync(path.join(OUT,"G01-REAL-IN-GAME-WATER-QA.json"),JSON.stringify(proof,null,2)+"\n");
 console.log("PASS G01 live WebGL: "+JSON.stringify(proof));
}
try{await main();}finally{
 try{ws?.close();}catch(_){}
 try{chrome?.kill("SIGTERM");}catch(_){}
 await new Promise(resolve=>server.close(resolve));
 fs.rmSync(TEMP,{recursive:true,force:true});
}
