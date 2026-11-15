/* Trialum S2: REAL existing Living World 3D -> menu -> Agro GLB -> back.
 * Not a screenshot-only proxy. The parent/child stack, JavaScript routing,
 * rendering and host visibility are all exercised in Chromium WebGL2.
 */
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import os from "node:os";
import {spawn} from "node:child_process";
import {fileURLToPath} from "node:url";
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const TMP=fs.mkdtempSync(path.join(os.tmpdir(),"trialum-agro-world3d-"));
const CHROME=[process.env.CHROME_BIN,"/usr/bin/google-chrome","/usr/bin/chromium","/opt/google/chrome/chrome"].filter(Boolean).find(fs.existsSync);
if(!CHROME)throw Error("Chromium missing — integrated 3D navigation test cannot be skipped");
const mimetype={".html":"text/html",".js":"text/javascript",".css":"text/css",".mjs":"text/javascript",".json":"application/json",".glb":"model/gltf-binary"};
const server=http.createServer((request,response)=>{
 let url;try{url=decodeURIComponent(new URL(request.url,"http://local").pathname);}
 catch(_){response.writeHead(400).end();return;}
 const file=path.resolve(ROOT,"."+url);
 if(!file.startsWith(ROOT+path.sep)){response.writeHead(403).end();return;}
 fs.readFile(file,(err,bytes)=>{
  if(err){response.writeHead(404).end(url);return;}
  response.writeHead(200,{"Content-Type":mimetype[path.extname(file)]||"application/octet-stream","Cache-Control":"no-store"});
  response.end(bytes);
 });
});
let proc,ws,port,id=0;
const pending=new Map();
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const timer=(work,ms,label)=>Promise.race([work,new Promise((_,reject)=>setTimeout(()=>reject(Error(label+" timed out")),ms))]);
async function until(check,ms=16000){
 let last="not true";const start=Date.now();
 while(Date.now()-start<ms){
  try{const value=await check();if(value)return value;last="false";}catch(e){last=String(e);}
  await sleep(160);
 }
 throw Error("Living World 3D nested menu failed: "+last);
}
async function send(method,params={}){
 if(ws?.readyState!==WebSocket.OPEN)throw Error("CDP not connected");
 const cur=++id;
 return timer(new Promise((resolve,reject)=>{
  pending.set(cur,{resolve,reject});ws.send(JSON.stringify({id:cur,method,params}));
 }),18000,method);
}
async function evalJS(expression){
 const r=await send("Runtime.evaluate",{expression,returnByValue:true,awaitPromise:true});
 if(r.exceptionDetails)throw Error("Browser JavaScript exception: "+r.exceptionDetails.text);
 return r.result?.value;
}
const inner="document.getElementById('world3d').contentDocument";
const q=selector=>inner+".querySelector("+JSON.stringify(selector)+")";
async function screenshot(name){
 const folder=path.join(ROOT,"tests/agro-lobby-visual-evidence");
 fs.mkdirSync(folder,{recursive:true});
 const shot=await send("Page.captureScreenshot",{format:"png",captureBeyondViewport:false});
 if(!shot.data)throw Error("No actual Chrome GLB image");
 fs.writeFileSync(path.join(folder,name),Buffer.from(shot.data,"base64"));
}
const nested=()=>q("#lw-agro-nested-frame")+".contentDocument";
const status=()=>nested()+".body.dataset.realGlb";
async function waitGlb(){
 await until(async()=>await evalJS("("+status()+"==='true')"),28000);
 await until(async()=>/RAF ticks [1-9]/.test(String(await evalJS(nested()+".querySelector('#metrics')?.textContent||''"))),18000);
}
async function qaReturn(expected){
 const before=String(await evalJS(nested()+".querySelector('#metrics').textContent"));
 if(!before.includes("RAF ticks"))throw Error("Nested GLB not running: "+before);
 const pause=await evalJS(inner+".body.classList.contains('lw-agro-nested-open')");
 if(pause!==true)throw Error("Original world not marked paused during GLB");
 const audio=await evalJS(inner+".defaultView.TrialumLWSpatialAudio?.status()?.visible");
 if(audio===true)throw Error("Original 3D audio remained active underneath the nested GLB");
 await evalJS(q('.dock .lw-agro-dock-btn[data-agro-dock="back"]')+".click();true");
 await until(async()=>await evalJS("!"+q("#lw-agro-nested-overlay")),8500);
 const routed=await evalJS(inner+".defaultView.TrialumAgroSceneBridge?.isOpen?.()");
 if(routed)throw Error("Nested iframe not disposed");
 const resumed=await evalJS(inner+".body.classList.contains('lw-agro-nested-open')");
 if(resumed)throw Error("Original 3D world was not restored");
 if(expected==="hub"){
  const hub=await evalJS(inner+".defaultView.TrialumHubPages.state()");
  if(hub?.view!=="hub"||hub?.isOpen!==true)throw Error("Return didn't restore 3D Main Lobby: "+JSON.stringify(hub));
 }else{
  const atlas=await evalJS("("+q("#lw-atlas")+".hidden===false)&&"+
   "("+q("details[data-group='agro']")+".open===true)");
  if(atlas!==true)throw Error("Return didn't restore 3D World Atlas Agro menu");
 }
}
async function main(){
 await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
 const url="http://127.0.0.1:"+server.address().port+"/tests/agro-world3d-host.html";
 proc=spawn(CHROME,["--headless=new","--no-sandbox","--disable-dev-shm-usage",
  "--enable-webgl","--enable-unsafe-swiftshader","--use-angle=swiftshader",
  "--disable-background-timer-throttling","--disable-renderer-backgrounding",
  "--disable-backgrounding-occluded-windows","--remote-debugging-port=0",
  "--user-data-dir="+TMP,"--window-size=1200,720",url],{stdio:["ignore","ignore","pipe"]});
 proc.stderr.on("data",chunk=>{
  const m=String(chunk).match(/DevTools listening on ws:\/\/127\.0\.0\.1:(\d+)/);
  if(m)port=Number(m[1]);
 });
 await until(()=>port,12000);
 const target=await until(async()=>{
  const result=await fetch("http://127.0.0.1:"+port+"/json/list");
  return (await result.json()).find(t=>t.type==="page"&&t.url.includes("agro-world3d-host.html"))?.webSocketDebuggerUrl;
 });
 ws=new WebSocket(target);
 ws.addEventListener("message",e=>{
  const data=JSON.parse(e.data);if(!data.id)return;
  const task=pending.get(data.id);if(!task)return;pending.delete(data.id);
  if(data.error)task.reject(Error(JSON.stringify(data.error)));
  else task.resolve(data.result||{});
 });
 await timer(new Promise((resolve,reject)=>{
  ws.addEventListener("open",resolve,{once:true});ws.addEventListener("error",reject,{once:true});
 }),7000,"CDP socket");
 await send("Page.enable");await send("Runtime.enable");
 await until(async()=>await evalJS("window.__lwReady===true && !!"+q("#lw-mainhub-toggle")),20000);
 const classic=fs.readFileSync(path.join(ROOT,"index.html"),"utf8");
 if(classic.includes('src="js/lw-d-b1-pilot-launcher.js"')||
    classic.includes('src="js/lw-d-agro-lobby-launcher.js"'))
   throw Error("Retired Classic launch buttons still included");
 // Actual 3D Main Lobby HUD.
 await evalJS(q("#lw-mainhub-toggle")+".click();true");
 await until(async()=>await evalJS("!!"+q('#lw-hub-page button[data-hub-target="agroLobby"]')),9000);
 await evalJS(q('#lw-hub-page button[data-hub-target="agroLobby"]')+".click();true");
 await until(async()=>await evalJS("!!"+q("#lw-agro-nested-frame")),8000);
 await waitGlb();
 const sceneSRC=await evalJS(q("#lw-agro-nested-frame")+".getAttribute('src')");
 if(!sceneSRC.includes("inside3d=1"))throw Error("Menu scene not hosted in actual 3D world");
 const label=await evalJS(q('.dock .lw-agro-dock-btn[data-agro-dock="back"] small')+".textContent");
 if(label!=="Назад")throw Error("Back must be in original left dock: "+label);
 const role=await evalJS(q("#lw-agro-nested-overlay")+".getAttribute('role')");
 if(role!=="region")throw Error("GLB must be a scene region, not another game dialog");
 const realHud=await evalJS("!!"+q("#lw-context")+" && !!"+q("#lw-hud-toggle"));
 if(!realHud)throw Error("Original right holographic HUD was replaced");
 await until(async()=>await evalJS(q("#lw-context h3")+".textContent.includes('Агро')"),8000);
 const childControls=await evalJS(nested()+".defaultView.getComputedStyle("+nested()+".querySelector('.controls')).display");
 if(childControls!=="none")throw Error("Separate green/gold child UI still covers the original HUD");
 const dockDisplay=await evalJS(inner+".defaultView.getComputedStyle("+q('.dock .lw-agro-dock-btn[data-agro-dock="back"]')+").display");
 if(dockDisplay==="none")throw Error("Original left Back dock is invisible");
 if(await evalJS("!!"+q("#lw-agro-return-to-world")))throw Error("Detached S2 Back button remains");
 await qaReturn("hub");
 // Same menu must be addressable from World Atlas, then return to that atlas.
 await evalJS(q("#lw-atlas-toggle")+".click();true");
 await until(async()=>await evalJS(q("#lw-atlas")+".hidden===false"));
 await evalJS(q('#lw-atlas button[data-route="agroLobby"]')+".click();true");
 await until(async()=>await evalJS("!!"+q("#lw-agro-nested-frame")),8000);
 await waitGlb();
 // Quality, controls and door selections are in the ORIGINAL right HUD.
 const selector=q("#lw-agro-quality");
 for(const mode of ["high","eco","balanced"]){
  await evalJS("(()=>{const q="+selector+";q.value='"+mode+"';q.dispatchEvent(new Event('change',{bubbles:true}));return true})()");
  await until(async()=>await evalJS(nested()+".querySelector('#quality').value")===mode,12000);
  await until(async()=>/RAF ticks [1-9]/.test(String(await evalJS(nested()+".querySelector('#metrics')?.textContent||''"))),15000);
 }
 // S4: real 3D portal enters actual 7-GLB animated warehouse, not a mock.
 const portal="ground.agro.lobby.door-warehouse";
 await evalJS(q('#lw-context button[data-lw-agro-portal="'+portal+'"]')+".click();true");
 await until(async()=>String(await evalJS(q("#lw-agro-nested-frame")+".getAttribute('src')")).includes("warehouse.html"),11000);
 try{
  await until(async()=>await evalJS(nested()+".body.dataset.realGlb==='true'"),20000);
 }catch(e){
  let debug="not accessible";
  try{debug=await evalJS("JSON.stringify({status:"+nested()+".querySelector('#status')?.textContent,details:"+
   nested()+".defaultView.TrialumWarehouseDebug?.status?.(),src:"+
   q("#lw-agro-nested-frame")+".getAttribute('src')})");}catch(err){debug=String(err);}
  throw Error("Real Food Warehouse GLB did not load: "+debug+"; "+String(e));
 }
 await until(async()=>await evalJS(q("#lw-context h3")+".textContent.includes('Стовариште')"),10000);
 const warehouseUI=await evalJS(nested()+".defaultView.getComputedStyle("+nested()+".querySelector('.tools')).display");
 if(warehouseUI!=="none")throw Error("Warehouse has a second UI over original hologram");
 const diagnostics=nested()+".defaultView.TrialumWarehouseDebug.status().diagnostics";
 const first=JSON.parse(await evalJS("JSON.stringify("+diagnostics+")"));
 if(first.mode!=="real-glb"||first.transporterCount!==3||first.gameWrites!==false)
  throw Error("Missing 7 GLB models/3 carriers: "+JSON.stringify(first));
 await screenshot("S4-01-Food-Warehouse-original-HUD-real-GLB.png");
 const t1=first.conveyorSeconds;
 await sleep(2100);
 const second=JSON.parse(await evalJS("JSON.stringify("+diagnostics+")"));
 if(second.conveyorSeconds<=t1)throw Error("Conveyor animation not progressing");
 if(!second.transporterPositions.some((p,i)=>Math.hypot(p.x-first.transporterPositions[i].x,p.z-first.transporterPositions[i].z)>.08))
  throw Error("Carriers did not move in visible 3D room");
 for(const mode of ["eco","high","balanced"]){
  await evalJS("(()=>{const q="+selector+";q.value='"+mode+"';q.dispatchEvent(new Event('change',{bubbles:true}));return true})()");
  await until(async()=>await evalJS(nested()+".querySelector('#quality').value")===mode,15000);
 }
 // S5: two built auxiliary rooms are DIRECTLY ATTACHED to same WebGL scene.
 const coldDoor="ground.agro.warehouse.subroom-cold";
 await evalJS(q('#lw-context button[data-lw-agro-portal="'+coldDoor+'"]')+".click();true");
 await until(async()=>await evalJS(diagnostics+".area")==="cold",8000);
 if(!String(await evalJS(q("#lw-agro-nested-frame")+".getAttribute('src')")).includes("warehouse.html"))
  throw Error("Cold subroom wrongly opened a second game/renderer");
 await until(async()=>await evalJS(q("#lw-context .lw-warehouse-counts")+".textContent.includes('2')"),6000);
 await screenshot("S5-01-cold-room-engine-stock.png");
 // A real HUD transfer request in this browser QA uses an explicit synthetic
 // fixture. Authoritative actual game engine and save are tested separately.
 await evalJS(q('#lw-context button[data-lw-warehouse-commit="take"]')+".click();true");
 await until(async()=>await evalJS("!!"+q('#lw-context button[data-lw-warehouse-decision="accept"]')),3000);
 await evalJS(q('#lw-context button[data-lw-warehouse-decision="accept"]')+".click();true");
 await until(async()=>await evalJS(diagnostics+".stock.find(r=>r.id==='qa-food')?.hand")===1,7000);
 await evalJS(q('#lw-context button[data-lw-warehouse-commit="put"]')+".click();true");
 await evalJS(q('#lw-context button[data-lw-warehouse-decision="accept"]')+".click();true");
 await until(async()=>await evalJS(diagnostics+".stock.find(r=>r.id==='qa-food')?.hand")===0,7000);
 await evalJS(q('#lw-context button[data-lw-warehouse-area="packing"]')+".click();true");
 await until(async()=>await evalJS(diagnostics+".area")==="packing",8000);
 await screenshot("S5-02-packing-room-engine-stock.png");
 // Hierarchical Back stays in original holographic dock: subroom -> main.
 await evalJS(q('.dock .lw-agro-dock-btn[data-agro-dock="back"]')+".click();true");
 await until(async()=>await evalJS(diagnostics+".area")==="main",8000);
 // MAIN sliding entrance animates, then 3D CAMERA exits into the real Atrium.
 const mainDoor="ground.agro.warehouse.door-main";
 await evalJS(q('#lw-context button[data-lw-agro-portal="'+mainDoor+'"]')+".click();true");
 await until(async()=>await evalJS(diagnostics+".doorOpenFraction")>.22,7000);
 await screenshot("S5-03-main-door-camera-exit.png");
 try{
  await until(async()=>String(await evalJS(q("#lw-agro-nested-frame")+".getAttribute('src')")).includes("agro-lobby/lobby.html"),18000);
 }catch(e){
  let detail="unknown";
  try{detail=await evalJS("JSON.stringify("+diagnostics+")");}catch(_){}
  throw Error("Main door did not complete camera-to-lobby transition: "+detail+"; "+e.message);
 }
 await waitGlb();
 const worldStats=await evalJS(q("#lw-context .lw-stats")+".textContent");
 if(!worldStats.includes("Биомаса")||!worldStats.includes("Молекули"))
  throw Error("Original world HUD resource readings lost");
 await qaReturn("atlas");
 console.log("PASS S5: real GLB warehouse with 2 attached cold/packing rooms, canonical-stock HUD take/put, hierarchical Back and animated main-door camera exit to Agro Atrium. OWNER phone QA pending.");
}
try{await main();}
finally{
 try{ws?.close();}catch(_){}
 try{proc?.kill("SIGTERM");}catch(_){}
 await new Promise(resolve=>server.close(resolve));
 try{fs.rmSync(TMP,{recursive:true,force:true});}catch(_){}
}
