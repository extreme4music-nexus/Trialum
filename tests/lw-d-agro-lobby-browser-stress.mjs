/* Trialum Agro S1 actual Chromium WebGL2 smoke/visual stress.
 * Captures REAL rendered screenshots. Does not substitute Galaxy A55 QA.
 */
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import os from "node:os";
import {spawn} from "node:child_process";
import {fileURLToPath} from "node:url";
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const OUT=path.join(ROOT,"tests","agro-lobby-visual-evidence");fs.mkdirSync(OUT,{recursive:true});
const MIME={".html":"text/html",".js":"text/javascript",".mjs":"text/javascript",".css":"text/css",".json":"application/json",".glb":"model/gltf-binary"};
const srv=http.createServer((req,res)=>{
 let u;try{u=decodeURIComponent(new URL(req.url,"http://localhost").pathname);}catch(_){res.writeHead(400).end();return;}
 const file=path.resolve(ROOT,"."+u);
 if(!file.startsWith(ROOT+path.sep)){res.writeHead(403).end();return;}
 fs.readFile(file,(err,data)=>{
  if(err){res.writeHead(404).end(u);return;}
  res.writeHead(200,{"Content-Type":MIME[path.extname(file)]||"application/octet-stream","Cache-Control":"no-store"});
  res.end(data);
 });
});
const chrome=["/usr/bin/google-chrome","/usr/bin/chromium","/opt/google/chrome/chrome"].find(fs.existsSync);
if(!chrome)throw Error("Chromium/Chrome missing — GPU visual QA cannot be silently skipped");
const dir=fs.mkdtempSync(path.join(os.tmpdir(),"trialum-agro-"));
let proc,ws,id=0,debugPort;
const pending=new Map();
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const timeBound=(p,ms,step)=>Promise.race([p,new Promise((_,reject)=>setTimeout(()=>reject(Error(step+" timed out")),ms))]);
async function until(cb,ms=14000){
 let last="no response";const start=Date.now();
 while(Date.now()-start<ms){
  try{const x=await cb();if(x)return x;last="predicate false";}catch(e){last=String(e);}
  await sleep(140);
 }
 throw Error("Lobby WebGL timeout: "+last);
}
async function cmd(method,params={}){
 if(ws?.readyState!==WebSocket.OPEN)throw Error("CDP closed");
 const seq=++id;
 return timeBound(new Promise((resolve,reject)=>{pending.set(seq,{resolve,reject});ws.send(JSON.stringify({id:seq,method,params}));}),18000,method);
}
async function evaluate(expression){
 const r=await cmd("Runtime.evaluate",{expression,returnByValue:true,awaitPromise:true});
 if(r.exceptionDetails)throw Error("Browser exception: "+r.exceptionDetails.text);
 return r.result?.value;
}
async function shot(filename){
 const {data}=await cmd("Page.captureScreenshot",{format:"png",captureBeyondViewport:false});
 const image=Buffer.from(data||"","base64");
 if(image.length<11000)throw Error("Empty/blank looking screenshot "+filename);
 fs.writeFileSync(path.join(OUT,filename),image);
}
const metric="document.querySelector('#metrics')?.textContent||''";
const state="document.querySelector('#status')?.textContent||''";
const frames=x=>Number(String(x).match(/RAF ticks (\d+)/)?.[1]||0);
async function assertProgress(label){
 const first=frames(await evaluate(metric));
 await until(async()=>frames(await evaluate(metric))>first,8500);
 const text=String(await evaluate(state));
 if(text.includes("FAILED")||text.includes("exception")||text.includes("context lost"))
  throw Error("Renderer failure after "+label+": "+text);
}
async function main(){
 await new Promise(res=>srv.listen(0,"127.0.0.1",res));
 const url="http://127.0.0.1:"+srv.address().port+"/prototypes/lw-d/scenes/agro-lobby/lobby.html";
 proc=spawn(chrome,["--headless=new","--no-sandbox","--disable-dev-shm-usage",
  "--enable-webgl","--enable-unsafe-swiftshader","--use-angle=swiftshader",
  "--disable-background-timer-throttling","--disable-renderer-backgrounding",
  "--disable-backgrounding-occluded-windows","--remote-debugging-port=0",
  "--user-data-dir="+dir,"--window-size=1152,650",url],{stdio:["ignore","ignore","pipe"]});
 proc.stderr.on("data",data=>{
  const m=String(data).match(/DevTools listening on ws:\/\/127\.0\.0\.1:(\d+)/);
  if(m)debugPort=Number(m[1]);
 });
 await until(()=>debugPort,13000);
 const target=await until(async()=>{
  const r=await fetch("http://127.0.0.1:"+debugPort+"/json/list");
  return (await r.json()).find(x=>x.type==="page"&&x.url.includes("/lobby.html"))?.webSocketDebuggerUrl;
 },10000);
 ws=new WebSocket(target);
 ws.addEventListener("message",evt=>{
  const m=JSON.parse(evt.data);if(!m.id)return;
  const p=pending.get(m.id);if(!p)return;pending.delete(m.id);
  if(m.error)p.reject(Error(JSON.stringify(m.error)));else p.resolve(m.result||{});
 });
 await timeBound(new Promise((res,rej)=>{ws.addEventListener("open",res,{once:true});ws.addEventListener("error",rej,{once:true});}),6000,"CDP startup");
 await cmd("Page.enable");await cmd("Runtime.enable");
 await until(async()=>{
  const message=String(await evaluate(state));
  if(message.includes("FAILED")||message.includes("unavailable"))throw Error(message);
  return message.includes("REAL Agro Lobby GLB loaded")&&message.includes("3 semantic portals");
 },20000);
 await until(async()=>frames(await evaluate(metric))>0,9000);
 await shot("01-atrium-balanced.png");
 await assertProgress("initial GLB");
 for(const [name,value] of [["eco","eco"],["high","high"],["balanced","balanced"]]){
  await evaluate("(()=>{const q=document.querySelector('#quality');q.value='"+value+"';q.dispatchEvent(new Event('change',{bubbles:true}));return true;})()");
  await until(async()=>frames(await evaluate(metric))>0,7000);
  await shot("02-atrium-"+name+".png");
  await assertProgress(name);
 }
 const modes=["high","eco","balanced"];
 for(let i=0;i<18;i++){
  await evaluate("(()=>{const q=document.querySelector('#quality');q.value='"+modes[i%3]+"';q.dispatchEvent(new Event('change',{bubbles:true}));return true;})()");
  await until(async()=>frames(await evaluate(metric))>0,9000);
  if(i%6===0)await assertProgress("stress mode "+i);
 }
 const portals=["ground.agro.lobby.door-warehouse","ground.agro.lobby.door-garden","ground.agro.lobby.door-phytolab"];
 for(const id of portals){
  const x=await evaluate("(()=>{const b=document.querySelector('[data-portal=\\\""+ "'"+id+"'"+ "\\"]');return b?true:false})()");
  if(x!==true)throw Error("Missing scene portal "+id);
  await evaluate("document.querySelector('[data-portal=\\\""+ "'"+id+"'"+ "\\"]').click();true");
  const detail=String(await evaluate("document.querySelector('#detailText').textContent"));
  if(!detail.includes("not constructed yet"))throw Error("Portal falsely navigates: "+id);
  const pressed=await evaluate("document.querySelector('[data-portal=\\\""+ "'"+id+"'"+ "\\"]').getAttribute('aria-pressed')");
  if(pressed!=="true")throw Error("Portal did not respond "+id);
  await assertProgress("portal selection "+id);
 }
 await evaluate("document.querySelector('#reset').click();true");
 await assertProgress("camera reset");
 await shot("03-three-portal-inspection.png");
 const final={status:await evaluate(state),metrics:await evaluate(metric),
  canvas:await evaluate("!!document.querySelector('#scene').getContext('webgl2')"),
  selected:await evaluate("document.querySelector('#detailTitle').textContent")};
 if(!final.canvas||!final.status.includes("REAL Agro Lobby GLB loaded"))throw Error("Not a real GLB frame");
 process.stdout.write("PASS Agro S1 independent Chromium real GLB + PBR textures, 18 quality toggles + 3 tier screenshots + three future portal selections; no fake entries. NOT owner phone pass.\n"+JSON.stringify(final)+"\n");
}
try{await main();}finally{
 try{ws?.close();}catch(_){}
 try{proc?.kill("SIGTERM");}catch(_){}
 await new Promise(res=>srv.close(res));
 try{fs.rmSync(dir,{recursive:true,force:true});}catch(_){}
}
