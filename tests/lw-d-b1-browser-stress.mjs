/**
 * B1-R2b independent desktop-Chromium visual-interaction stress gate.
 * NO synchronous WebGL pixels are read by the actual mobile runtime.
 * Uses only Node 22 builtins + preinstalled GitHub runner Chrome/Chromium.
 * This supplements but NEVER replaces Samsung Galaxy A55 owner approval.
 */
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import {spawn} from "node:child_process";
import {fileURLToPath} from "node:url";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const mime={".html":"text/html",".js":"text/javascript",".mjs":"text/javascript",".css":"text/css",".json":"application/json",".glb":"model/gltf-binary"};
const server=http.createServer((req,res)=>{
 const requestPath=decodeURIComponent(new URL(req.url,"http://localhost").pathname);
 const name=path.resolve(root,"."+requestPath);
 if(!name.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 fs.readFile(name,(error,buffer)=>{
  if(error){res.writeHead(404).end("Missing asset: "+requestPath);return;}
  res.writeHead(200,{"Content-Type":mime[path.extname(name)]||"application/octet-stream","Cache-Control":"no-store"});
  res.end(buffer);
 });
});
const chromeNames=[process.env.CHROME_BIN,"/usr/bin/google-chrome","/usr/bin/chromium","/opt/google/chrome/chrome"].filter(Boolean);
const executable=chromeNames.find(x=>fs.existsSync(x));
if(!executable)throw Error("Required Chrome/Chromium missing: cannot claim interactive GPU QA PASS");
const TEMP=fs.mkdtempSync(path.join(os.tmpdir(),"trialum-b1-chrome-"));
const screenshots=path.join(root,"tests","b1-gpu-qa");
fs.mkdirSync(screenshots,{recursive:true});
let chrome=null,ws=null,nextId=0;
const pending=new Map();
const deadline=(promise,ms,name)=>Promise.race([promise,new Promise((_,reject)=>setTimeout(()=>reject(new Error(name+" timed out")),ms))]);
async function send(method,params={}){
 if(!ws||ws.readyState!==WebSocket.OPEN)throw Error("Chrome CDP connection closed");
 const id=++nextId;
 return deadline(new Promise((resolve,reject)=>{
  pending.set(id,{resolve,reject});
  ws.send(JSON.stringify({id,method,params}));
 }),15000,"CDP "+method);
}
async function evalJS(expression){
 const out=await send("Runtime.evaluate",{expression,returnByValue:true,awaitPromise:true});
 if(out.exceptionDetails)throw Error("Browser JavaScript error: "+out.exceptionDetails.text);
 return out.result?.value;
}
async function until(check,ms=13000){
 const start=Date.now();let last="";
 while(Date.now()-start<ms){
  try{const value=await check();if(value)return value;last="condition not yet true";}
  catch(e){last=String(e);}
  await sleep(140);
 }
 throw Error("Browser stress timeout: "+last);
}
async function screenshot(name){
 const out=await send("Page.captureScreenshot",{format:"png",captureBeyondViewport:false});
 if(!out.data||out.data.length<800)throw Error("Empty screenshot: "+name);
 fs.writeFileSync(path.join(screenshots,name),Buffer.from(out.data,"base64"));
}
async function checkFrameAdvances(stage,ms=350){
 const a=await evalJS("document.querySelector('#metrics')?.textContent||''");
 const match=x=>Number(x.match(/RAF ticks (\d+)/)?.[1]||0);
 // Metrics update once per 30 RAF frames; don't falsely classify a slower
 // software Chromium renderer as frozen after a fixed 330ms timeout.
 const count=await until(async()=>{
  const b=await evalJS("document.querySelector('#metrics')?.textContent||''");
  if(/GPU RECOVERY|context lost|failure|not rendering/i.test(b))throw Error("Rendering fault after "+stage+": "+b);
  return match(b)>match(a)?match(b):false;
 },Math.max(ms,7000));
 return count;
}
async function main(){
 await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
 const url="http://127.0.0.1:"+server.address().port+"/prototypes/lw-d/b1/pilot.html";
 chrome=spawn(executable,["--headless=new","--no-sandbox","--disable-dev-shm-usage",
  "--enable-webgl","--enable-unsafe-swiftshader","--use-angle=swiftshader",
  "--disable-background-timer-throttling","--disable-renderer-backgrounding",
  "--disable-backgrounding-occluded-windows","--remote-debugging-port=0",
  "--user-data-dir="+TEMP,"--window-size=1100,680",url],{stdio:["ignore","ignore","pipe"]});
 let debugPort;
 chrome.stderr.on("data",chunk=>{
  const m=String(chunk).match(/DevTools listening on ws:\/\/127\.0\.0\.1:(\d+)/);
  if(m)debugPort=Number(m[1]);
 });
 await until(()=>debugPort,12000);
 const target=await until(async()=>{
  const r=await fetch("http://127.0.0.1:"+debugPort+"/json/list");
  const found=(await r.json()).find(t=>t.type==="page"&&t.url.includes("/pilot.html"));
  return found?.webSocketDebuggerUrl;
 },10000);
 ws=new WebSocket(target);
 ws.addEventListener("message",event=>{
  const msg=JSON.parse(event.data);
  if(!msg.id)return;
  const item=pending.get(msg.id);if(!item)return;
  pending.delete(msg.id);
  if(msg.error)item.reject(new Error(JSON.stringify(msg.error)));
  else item.resolve(msg.result||{});
 });
 await deadline(new Promise((resolve,reject)=>{
  ws.addEventListener("open",resolve,{once:true});
  ws.addEventListener("error",reject,{once:true});
 }),6000,"CDP websocket");
 await send("Page.enable");
 await send("Runtime.enable");
 const initial=await until(async()=>{
  const text=await evalJS("document.querySelector('#status')?.textContent||''");
  if(/Pilot cannot start|unavailable|FALLBACK geometry/.test(text))throw Error("Real GLB boot failure: "+text);
  return text.includes("REAL packaged GLB loaded");
 });
 if(!initial)throw Error("GLB never loaded");
 await until(async()=>String(await evalJS("document.querySelector('#metrics')?.textContent||''")).includes("RAF ticks"),7000);
 await screenshot("01-real-glb.png");
 await checkFrameAdvances("startup");
 const modes=["eco","balanced","high","balanced","eco"];
 for(let i=0;i<25;i++){
  const mode=modes[i%modes.length];
  await evalJS("(()=>{const s=document.querySelector('#quality');s.value='"+mode+"';s.dispatchEvent(new Event('change',{bubbles:true}));return true})()");
  await until(async()=>String(await evalJS("document.querySelector('#metrics')?.textContent||''")).includes("RAF ticks"),5500);
  if(i%5===0)await checkFrameAdvances("quality change "+i+"/"+mode,320);
 }
 await screenshot("02-quality-stress.png");
 // Simulate independent mouse/pointer taps in the canvas and UI button clicks.
 for(let i=0;i<5;i++){
  await send("Input.dispatchMouseEvent",{type:"mousePressed",x:460,y:345,button:"left",clickCount:1});
  await send("Input.dispatchMouseEvent",{type:"mouseReleased",x:460,y:345,button:"left",clickCount:1});
  await evalJS("document.querySelector('#reset-camera').click();true");
  await checkFrameAdvances("canvas tap/reset "+i,330);
 }
 await screenshot("03-tap-after-stress.png");
 for(let i=0;i<5;i++){
  await evalJS("document.querySelector('#fallback').click();true");
  await until(async()=>String(await evalJS("document.querySelector('#status')?.textContent||''")).includes("FALLBACK geometry active"),4000);
  await until(async()=>String(await evalJS("document.querySelector('#metrics')?.textContent||''")).includes("RAF ticks"),5500);
  await checkFrameAdvances("fallback "+i,270);
  await evalJS("document.querySelector('#fallback').click();true");
  await until(async()=>String(await evalJS("document.querySelector('#status')?.textContent||''")).includes("REAL packaged GLB loaded"),8000);
  await until(async()=>String(await evalJS("document.querySelector('#metrics')?.textContent||''")).includes("RAF ticks"),5500);
  await checkFrameAdvances("real GLB reload "+i,300);
 }
 await screenshot("04-after-five-fallback-reloads.png");
 const result={webgl2:await evalJS("!!document.querySelector('#stage').getContext('webgl2')"),
  status:await evalJS("document.querySelector('#status').textContent"),
  metrics:await evalJS("document.querySelector('#metrics').textContent")};
 if(!result.webgl2||!result.status.includes("REAL packaged GLB loaded"))throw Error("Final actual GLB/WebGL2 invalid");
 if(result.status.includes("GPU RECOVERY"))throw Error("Unexpected GPU recovery in browser stress");
 process.stdout.write("PASS: B1 independent Chromium WebGL2: 25 quality toggles, 5 tap/reset, 5 fallback+GLB reloads; RAF advances throughout. NOT Galaxy A55 evidence.\n"+JSON.stringify(result)+"\n");
 // The standalone scene above did NOT exercise the parent/iframe visibility
 // bridge that actually paused the A55 when a native select blurred parent.
 // This second phase runs an isolated Classic host, real iframe and real GLB.
 const hostedURL=url.replace("/prototypes/lw-d/b1/pilot.html","/tests/b1-host-focus.html");
 await send("Page.navigate",{url:hostedURL});
 await until(async()=>await evalJS("!!document.querySelector('#trialum-b1-glb-launcher')"),7000);
 await evalJS("document.querySelector('#trialum-b1-glb-launcher').click();true");
 const hostedMetrics="document.querySelector('#trialum-b1-frame')?.contentDocument?.querySelector('#metrics')?.textContent||''";
 const hostedStatus="document.querySelector('#trialum-b1-frame')?.contentDocument?.querySelector('#status')?.textContent||''";
 await until(async()=>String(await evalJS(hostedStatus)).includes("REAL packaged GLB loaded"),12000);
 await until(async()=>/RAF ticks [1-9]/.test(String(await evalJS(hostedMetrics))),12000);
 const frames=value=>Number(String(value).match(/RAF ticks (\\d+)/)?.[1]||0);
 // Reproduces native Android select causing parent-window blur, WITHOUT a
 // corresponding focus event. In #200 this sent visible:false and RAF stopped.
 for(let i=0;i<8;i++){
  const old=frames(await evalJS(hostedMetrics));
  await evalJS("(()=>{window.dispatchEvent(new Event('blur'));const select=document.querySelector('#trialum-b1-frame').contentDocument.querySelector('#quality');select.value='"+(i%2?"eco":"high")+"';select.dispatchEvent(new Event('change',{bubbles:true}));return true})()");
  const after=await until(async()=>{
   const status=String(await evalJS(hostedStatus));
   if(status.includes("GPU scene unavailable"))throw Error("Hosted GPU error: "+status);
   const metric=String(await evalJS(hostedMetrics));
   return frames(metric)>3?metric:false;
  },10000);
  if(!/RAF ticks/.test(after))throw Error("Parent blur paused GLB iframe on mode switch "+i);
  // Capture a distinct later value after restart without relying on old
  // counter because quality change intentionally resets frame samples.
  const before=frames(await evalJS(hostedMetrics));
  await until(async()=>frames(await evalJS(hostedMetrics))>before,9000);
 }
 await screenshot("05-hosted-native-focus-regression.png");
 const finalHostedStatus=await evalJS(hostedStatus);
 if(!String(finalHostedStatus).includes("REAL packaged GLB loaded"))
  throw Error("Hosted GLB failed after native-select blur stress: "+finalHostedStatus);
 process.stdout.write("PASS: B1 hosted iframe: 8 parent native-select blur events WITHOUT matching focus + quality switches; RAF remains alive. NOT Galaxy A55 proof.\\n");

}
try{await main();}
finally{
 try{ws?.close();}catch(_){}
 try{chrome?.kill("SIGTERM");}catch(_){}
 await new Promise(resolve=>server.close(resolve));
 try{fs.rmSync(TEMP,{recursive:true,force:true});}catch(_){}
}
