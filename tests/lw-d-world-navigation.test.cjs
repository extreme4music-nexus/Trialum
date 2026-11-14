const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
test("L2.3 top-left values are derived from original state, not a duplicate currency",()=>{
 const bridge=read("js/app.js"),nav=read("prototypes/lw-d/world-navigation.js");
 assert.match(bridge,/xp:s\.pets\.reduce/);
 assert.match(bridge,/credits:s\.longplay\?\.credits/);
 assert.match(nav,/world\?\.xp/);
 for(const key of ["day","credits","compounds","biomass","insight"])assert.ok(nav.includes('world?.'+key));
 assert.doesNotMatch(nav,/localStorage|indexedDB|fetch\(|setInterval\(/);
});
test("existing Trialum modules remain accessible through nested groups, not fabricated 3D routes",()=>{
 const bridge=read("js/app.js"),nav=read("prototypes/lw-d/world-navigation.js");
 for(const key of ["dna","plants","food","pets","habitats","playground","shared","friends","messages","playgames","achievements","diary","notifications","settings","research"]){
  assert.ok(bridge.includes("'"+key+"'"),"classic bridge whitelist missing "+key);
  assert.ok(nav.includes('"'+key+'","classic"'),"menu entry missing "+key);
 }
 assert.match(nav,/future/);
 assert.match(nav,/el\("details","lw-atlas-group"\)/);
 assert.match(nav,/root\.parent\.postMessage\(\{type:"trialum:lw:classic",tab:key\},origin\)/);
});
test("new HUD works in Android/PWA and D0 single-file preview retains no new external references",()=>{
 const html=read("prototypes/lw-d/world.html");
 for(const f of ["world-navigation.js","world-navigation.css"])assert.ok(html.includes(f));
 const builder=read("prototypes/lw-d/build_preview.py");
 assert.match(builder,/world-navigation\.css/);
 assert.match(builder,/world-navigation\.js/);
 for(const p of ["sw.js","android-template/app/build.gradle.kts"]){
  const f=read(p);assert.ok(f.includes("prototypes/lw-d/world-navigation.js"),p);assert.ok(f.includes("prototypes/lw-d/world-navigation.css"),p);
 }
});
test("MK and EN resource labels and route labels are present",()=>{
 const terms=JSON.parse(read("locales/en.json")).strings;
 for(const s of ["Мапа на светот","Лабораториски комплекс","Храна и залихи","ДНК лабораторија","3D складиште за храна"])assert.ok(terms[s],s);
});
