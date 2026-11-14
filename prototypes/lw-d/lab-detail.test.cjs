const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const Model=require("./lab-detail.js");
const Lab=require("./lab-process.js");
const read=p=>fs.readFileSync(path.join(__dirname,"../..",p),"utf8");

test("four machines have distinct physical models, curved vessels and metallic details",()=>{
 assert.deepEqual(Object.keys(Model.POS),["synthesis","analysis","materials","incubation"]);
 const calls=[];
 Model.drawMachines((...args)=>calls.push(args),{shape:"cube"},{shape:"sphere"},12.5,"synthesis",{insight:2517});
 assert.ok(calls.length>140,"single-colored objects are not sufficient");
 for(const [name,[x,z]] of Object.entries(Model.POS))
   assert.ok(calls.some(a=>Math.abs(a[1]-x)<.23&&Math.abs(a[3]-z)<.35),name);
 assert.ok(calls.some(a=>a[0].shape==="sphere"),"rounded tanks");
 assert.ok(calls.some(a=>a[0].shape==="cube"),"mechanical parts");
 assert.ok(calls.some(a=>a[10]===1),"brushed metal surfaces");
 assert.ok(calls.some(a=>a[10]===2),"glass-like polymer surfaces");
 assert.ok(calls.some(a=>a[10]===4),"emissive indicators");
});
test("machine renderer never writes resources or requests a network connection",()=>{
 const world=Object.freeze({compounds:27,insight:1000,petIds:Object.freeze(["a","b"])});
 const calls=[];
 Model.drawMachines((...args)=>calls.push(args),{shape:"cube"},{shape:"sphere"},2,"analysis",world);
 assert.deepEqual(world,{compounds:27,insight:1000,petIds:["a","b"]});
 const code=read("prototypes/lw-d/lab-detail.js");
 assert.doesNotMatch(code,/fetch\(|XMLHttpRequest|localStorage|indexedDB|setInterval|setTimeout|scheduleSave|newGame\(/);
 assert.ok(calls.every(args=>args.length===11),"draw command shape");
});
test("four successful engine outcomes animate within corresponding physical machine",()=>{
 const kinds={synthesize:["compounds","synthesis"],analyze:["insight","analysis"],
  harvest:["biomass","materials"],grow:["cells","incubation"]};
 for(const [kind,[field,station]] of Object.entries(kinds)){
  const p=Model.POS[station];
  const event=Lab.begin(kind,true,1000,{[field]:2},{[field]:5});
  const calls=[];
  const state=Lab.draw((...args)=>calls.push(args),{shape:"cube"},{shape:"sphere"},event,2000);
  assert.ok(state.active&&state.success,kind);
  assert.ok(calls.length>=5,kind);
  assert.ok(calls.every(a=>Math.abs(a[1]-p[0])<1.1&&Math.abs(a[3]-p[1])<1.0),kind+" spray outside machine");
  assert.equal(event.change,3);
 }
});
test("failed engine action displays localized warning and cannot mint resources",()=>{
 for(const kind of Object.keys(Lab.TYPES)){
  const field=Lab.TYPES[kind].field;
  const event=Lab.begin(kind,false,1000,{[field]:9},{[field]:9});
  const calls=[];
  Lab.draw((...args)=>calls.push(args),{shape:"cube"},{shape:"sphere"},event,2100);
  assert.equal(event.success,false);
  assert.equal(event.change,0);
  assert.ok(calls.length>=3,kind);
  assert.ok(calls.every(a=>a[8][0]===1&&a[8][1]===.64),kind);
 }
});
test("station camera approaches from front / central aisle even for front row",()=>{
 const world=read("prototypes/lw-d/world.js");
 assert.match(world,/yaw=machine\.x<0\?\.54:-\.54/);
 assert.match(world,/const target=machine\?\(machine\.x<0\?\.54:-\.54\):0/);
 assert.match(world,/TrialumLabDetail\?\.drawMachines/);
 assert.match(world,/TrialumLabProcess\?\.draw/);
 assert.match(world,/machine\?4\.65:11/);
});
test("detailed models included in Android, PWA cache and standalone preview",()=>{
 assert.match(read("prototypes/lw-d/world.html"),/<script src="lab-detail\.js"><\/script>/);
 for(const p of ["prototypes/lw-d/build_preview.py","sw.js","android-template/app/build.gradle.kts"])
   assert.ok(read(p).includes("lab-detail.js"),p);
});
