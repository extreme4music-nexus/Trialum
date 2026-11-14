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

test("atlas automatically closes on every pointerdown outside, but not during submenu navigation",()=>{
 const vm=require("node:vm");
 const allListeners={};
 function node(tag){
  const listeners={};
  const n={
   tag,id:"",dataset:{},hidden:false,open:false,children:[],_attrs:{},
   classList:{toggle(){}},
   append(...items){this.children.push(...items);},
   appendChild(item){this.children.push(item);return item;},
   replaceChildren(...items){this.children=items;},
   setAttribute(k,v){this._attrs[k]=v;},
   getAttribute(k){return this._attrs[k];},
   addEventListener(type,listener){(listeners[type]??=[]).push(listener);},
   emit(type,event){for(const fn of listeners[type]||[])fn(event);},
   querySelector(selector){
    if(selector==="small"){
     const descend=n=>n.children.find(c=>c.tag==="small")||n.children.map(c=>c.querySelector?.("small")).find(Boolean);
     return descend(this)||null;
    }
    return null;
   },
   querySelectorAll(selector){
    const found=[];
    function visit(n){for(const c of n.children){
      if(selector==="details[open]"&&c.tag==="details"&&c.open)found.push(c);
      visit(c);
    }}
    visit(this);return found;
   },
   contains(item){return this===item||this.children.some(x=>x.contains?.(item));},
   focus(){this.wasFocused=true;}
  };
  return n;
 }
 const frame=node("div"),dock=node("nav");
 const document={
  createElement:node,
  getElementById:id=>id==="frame"?frame:null,
  querySelector:selector=>selector===".dock"?dock:null,
  head:node("head"),
  addEventListener(type,listener,capture){(allListeners[type]??=[]).push({listener,capture});}
 };
 const win={
  location:{search:"?live=1",origin:"https://appassets.androidplatform.net"},
  parent:{postMessage(){}},
  document,
  addEventListener(type,listener){(allListeners["window:"+type]??=[]).push({listener});}
 };
 vm.runInNewContext(read("prototypes/lw-d/world-navigation.js"),{
  globalThis:win,document,URLSearchParams,Number
 });
 const toggle=dock.children.find(x=>x.id==="lw-atlas-toggle");
 const atlas=frame.children.find(x=>x.id==="lw-atlas");
 assert.ok(toggle&&atlas);
 assert.equal(atlas.hidden,true);
 assert.equal(allListeners.pointerdown[0].capture,true,"dismiss before 3D canvas reacts");
 toggle.emit("click",{target:toggle});
 assert.equal(atlas.hidden,false);
 const item=atlas.children.find(x=>x.tag==="details");
 assert.ok(item);
 allListeners.pointerdown[0].listener({target:item});
 assert.equal(atlas.hidden,false,"submenu taps stay inside");
 allListeners.pointerdown[0].listener({target:toggle});
 assert.equal(atlas.hidden,false,"toggle opener remains clickable");
 allListeners.pointerdown[0].listener({target:frame});
 assert.equal(atlas.hidden,true,"tap on 3D canvas/frame dismisses immediately");
 toggle.emit("click",{target:toggle});
 assert.equal(atlas.hidden,false);
 const extraButton=node("button");dock.append(extraButton);
 allListeners.pointerdown[0].listener({target:extraButton});
 assert.equal(atlas.hidden,true,"tap on other dock controls dismisses");
 toggle.emit("click",{target:toggle});
 let prevented=false;
 allListeners["window:keydown"][0].listener({key:"Escape",preventDefault(){prevented=true;}});
 assert.equal(atlas.hidden,true);assert.equal(prevented,true);
 assert.equal(toggle.wasFocused,true);
});
