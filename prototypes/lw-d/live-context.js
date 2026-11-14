/* LW-D D1 contextual HUD, connected to existing deterministic game world.
 * No second persistent state, no AI, no networking beyond trusted parent iframe.
 */
(function(root){
"use strict";
if(new URLSearchParams(root.location.search).get("live")!=="1"||root.parent===root)return;
const origin=root.location.origin;
let world=null,resultText="",selectedStation=null,selectedDnaStation=null,complexRoom="basic";
let dnaDraft=null,dnaDraftPetKey="",dnaTarget=null,dnaPending=false,dnaFeedback="";
const WORKSTATIONS=[
 {id:"synthesis",label:"⚗️ Синтеза",title:"Реактор за молекули",description:"Синтетизирај молекули преку постојната лабораториска логика.",kind:"synthesize",command:"✦ Синтеза на молекули"},
 {id:"analysis",label:"🔬 Анализа",title:"Аналитички пулт",description:"Набљудувај и добивај сознанија преку вистинската прогресија.",kind:"analyze",command:"🔬 Анализа и сознание"},
 {id:"materials",label:"🪨 Материјали",title:"Складиште со материјали",description:"Прегледувај и собирај материјали од постојните резерви.",kind:"harvest",command:"🪨 Собери материјали"},
 {id:"incubation",label:"🧫 Инкубатор",title:"Станица за раст на клетки",description:"Поттикни раст само кога е исполнета потребната етапа.",kind:"grow",command:"🧫 Размножи клетки"}
];

const EN={"⚗️ Лабораторија":"⚗️ Laboratory","🌿 Флора":"🌿 Flora","🪐 Биосвет":"🪐 Living habitat","🔬 Истражување":"🔬 Research","Вистинските лабораториски акции го ажурираат постојниот зачуван свет.":"Real laboratory actions update your existing saved world.","Одгледувај и истражувај ги растенијата во избраниот биосвет.":"Grow and study plants in your selected habitat.","Следи ги миленичињата, капацитетот и условите на живеалиштето.":"Monitor pets, capacity, and habitat conditions.","Отклучувај сознанија преку реалната прогресија на Trialum.":"Unlock knowledge through Trialum's existing progression.","Лаб. акции":"Lab actions","Клетки":"Cells","Миленичиња":"Pets","Капацитет":"Capacity","Зафатено":"Occupied","Етапа":"Stage","Биосвет: ":"Habitat: ","✦ Синтеза на молекули":"✦ Synthesize molecules","🔬 Анализа и сознание":"🔬 Analyze and learn","🪨 Собери материјали":"🪨 Collect materials","🧫 Размножи клетки":"🧫 Grow cells","🌱 Отвори флора":"🌱 Open flora","🏠 Отвори живеалишта":"🏠 Open habitats","📚 Отвори истражувања":"📚 Open research","Отвори истражувања":"Open research","РЕАЛНА СОСТОЈБА":"REAL WORLD STATE","✦ Жив Свет · 3D":"✦ Living World · 3D","← Класичен приказ":"← Classic view","Пробна landscape-верзија. Постојниот свет и бекап остануваат зачувани.":"Landscape preview. Your existing world and backups stay preserved."};
Object.assign(EN,{"⚗️ Синтеза":"⚗️ Synthesis","🔬 Анализа":"🔬 Analysis","🪨 Материјали":"🪨 Materials","🧫 Инкубатор":"🧫 Incubator","Реактор за молекули":"Molecular reactor","Аналитички пулт":"Analysis station","Складиште со материјали":"Materials storage","Станица за раст на клетки":"Cell-growth incubator","Синтетизирај молекули преку постојната лабораториска логика.":"Synthesize molecules using the existing laboratory rules.","Набљудувај и добивај сознанија преку вистинската прогресија.":"Observe and earn insight through real progression.","Прегледувај и собирај материјали од постојните резерви.":"Inspect and gather materials from your real resource inventory.","Поттикни раст само кога е исполнета потребната етапа.":"Grow cells only after reaching the required stage.","Избери работна станица":"Choose a workstation","Допрете станица во 3D просторијата или избери ја овде.":"Tap a station in the 3D room, or choose it here.","↩ Цела лабораторија":"↩ Whole laboratory","Работни станици":"Workstations","Недостапно во сегашната етапа":"Not available at your current stage"});
Object.assign(EN,{"Синтетизирани се молекули и добиено е знаење.":"Molecules synthesized and new insight gained.","Нови истражувачки поени.":"New research insight gained.","Додадени се хемиски резерви.":"Chemical supplies replenished.","Клеточната популација расте.":"The cell population is growing.","Нема лабораториски акции денес.":"No laboratory actions remaining today.","Недостигаат суровини за синтеза.":"Not enough raw materials for synthesis.","Недоволно енергија.":"Not enough energy.","Прво создади протоклетка.":"Create a protocell first.","Потребни се 5 органски единици.":"Five organic units are required.","Непозната лабораториска акција.":"Unknown laboratory action.","Недозволена лабораториска команда.":"Laboratory command not allowed.","Молекули":"Molecules","Сознание":"Insight","Биомаса":"Biomass","Квалитет":"Quality","ДЕН":"DAY","Лаб. акции":"Lab actions"});
Object.assign(EN,{"Прикажи го холограмскиот HUD":"Show holographic HUD","Сокриј го холограмскиот HUD":"Hide holographic HUD","← Излези од 3D":"← Exit 3D view","Холограмски панел":"Holographic panel"});
Object.assign(EN,{"🏛️ Лабораториски комплекс":"🏛️ Laboratory complex","Лабораториски комплекс":"Laboratory complex","Избери простор во ходникот со допир или со копчињата.":"Tap an entrance in the hall, or choose a room below.","Пет простории, една лабораториска целина.":"Five rooms, one connected laboratory complex.","⚗️ Основна лабораторија":"⚗️ Basic laboratory","🧬 ДНК лабораторија":"🧬 DNA laboratory","🧪 Лабораторија за храна":"🧪 Food production laboratory","🌱 Лабораторија за флора":"🌱 Flora laboratory","🔬 Истражувачка лабораторија":"🔬 Research laboratory","↩ Врати се во основната лабораторија":"↩ Return to basic laboratory","Во развој · отвори постојна функција":"In development · open existing screen","3D просторијата е во развој; оригиналниот систем останува достапен.":"This 3D room is being built; the original feature remains accessible."});
Object.assign(EN,{
 "↩ Лабораториски ходник":"↩ Laboratory corridor",
 "🧬 DNA простор · L3.2-A":"🧬 DNA room · L3.2-A",
 "3D комора и станици. ДНК-промените се прават преку постојната функционалност.":"3D chamber and stations. DNA changes use the existing game feature.",
 "DNA станици":"DNA stations",
 "🔬 Геномски скенер":"🔬 Genome scanner",
 "🎨 Дизајнер на гени":"🎨 Gene designer",
 "🌱 Еволутивна линија":"🌱 Evolution lineage",
 "Преглед на постојните ресурси, без промени.":"Inspect existing resources without changes.",
 "Дизајнирај само преку постојната ДНК логика.":"Design using the existing DNA system only.",
 "Трансформирај постоечки миленик преку оригиналниот систем.":"Transform an existing pet through the original system.",
 "🧬 Отвори ДНК контроли":"🧬 Open original DNA controls",
 "🔒 За дизајнер треба лаб. ниво 6 и миленик ниво 22.":"🔒 Designer needs lab level 6 and a level 22 pet.",
 "✅ ДНК дизајнерот е достапен.":"✅ DNA designer is available.",
 "Миленик ниво":"Pet level",
 "Лабораторија ниво":"Lab level",
 "Визуелна 3D симулација — нема нови генетски акции.":"Visual 3D simulation — no new genetic actions."
});
Object.assign(EN,{
 "🧬 ДНК лабораторија · L3.2-B":"🧬 DNA Laboratory · L3.2-B",
 "Скенирај го избраниот миленик, уреди фантастични гени или провери еволутивна линија.":"Scan your pet, edit fictional genes, or review a lineage.",
 "Избери една од трите 3D станици.":"Choose one of the three 3D stations.",
 "Миленик":"Pet",
 "Нема избрано милениче":"No pet selected",
 "Генетски потпис":"Genome signature",
 "Боја":"Color",
 "Очи":"Eyes",
 "Облик":"Shape",
 "Течна":"Fluid",
 "Кристална":"Crystal",
 "Лисна":"Leaf",
 "Облачна":"Cloud",
 "🧬 Примени гени · 25 молекули + 15 сознание + 1 акција":"🧬 Apply genes · 25 molecules + 15 insight + 1 action",
 "Провери ги ресурсите и условите за дизајнот.":"Check resources and designer eligibility.",
 "Целна еволуција":"Evolution target",
 "Изворниот вид не одговара на избраниот миленик.":"Selected pet is not the required source species.",
 "Подготвена линија":"Lineage ready",
 "🔒 Недостапна линија":"🔒 Lineage locked",
 "🧬 Преобрази го избраниот миленик":"🧬 Transform selected pet",
 "Измената е трајна. Да ја потврдам?":"This change is persistent. Confirm?",
 "ДНК трансформацијата го задржува истиот миленик. Да продолжам?":"DNA evolution preserves the same pet. Continue?",
 "ДНК операцијата е во тек…":"DNA operation in progress…",
 "Нема истражени еволутивни линии.":"No researched evolutionary lineages.",
 "ДНК командата е испратена до оригиналниот систем.":"DNA request sent to original game engine.",
 "Оваа станица користи вистински податоци од постојниот свет.":"This station uses real data from the existing world."
});
const T=value=>world?.language&&world.language!=="mk"?(EN[value]||value):value;
const COMPLEX_ROOMS=[
 {id:"basic",label:"⚗️ Основна лабораторија",tab:null,ready:true},
 {id:"dna",label:"🧬 ДНК лабораторија",tab:"dna",ready:true},
 {id:"foodlab",label:"🧪 Лабораторија за храна",tab:"food",ready:false},
 {id:"floralab",label:"🌱 Лабораторија за флора",tab:"plants",ready:false},
 {id:"research",label:"🔬 Истражувачка лабораторија",tab:"research",ready:false}
];
const sections={
lab:["⚗️ Лабораторија","Вистинските лабораториски акции го ажурираат постојниот зачуван свет."],
flora:["🌿 Флора","Одгледувај и истражувај ги растенијата во избраниот биосвет."],
biosphere:["🪐 Биосвет","Следи ги миленичињата, капацитетот и условите на живеалиштето."],
research:["🔬 Истражување","Отклучувај сознанија преку реалната прогресија на Trialum."]
};
const panel=document.createElement("section");
panel.id="lw-context";
panel.setAttribute("aria-label","Контекстни контроли за активната 3D сцена");
document.querySelector(".frame")?.appendChild(panel);
const hudToggle=document.createElement("button");
hudToggle.id="lw-hud-toggle";
hudToggle.type="button";
hudToggle.setAttribute("aria-controls","lw-context");
document.querySelector(".frame")?.appendChild(hudToggle);
let hudHidden=false;
function labelForHud(){
 const en=Boolean(world?.language&&world.language!=="mk");
 hudToggle.textContent=hudHidden?"◨":"◧";
 hudToggle.title=T(hudHidden?"Прикажи го холограмскиот HUD":"Сокриј го холограмскиот HUD");
 hudToggle.setAttribute("aria-label",hudToggle.title);
 hudToggle.setAttribute("aria-expanded",String(!hudHidden));
}
function setHudHidden(hide){
 hudHidden=Boolean(hide);
 document.body.classList.toggle("lw-hud-hidden",hudHidden);
 if(hudHidden){
  if(panel.contains(document.activeElement))hudToggle.focus({preventScroll:true});
  panel.setAttribute("aria-hidden","true");
  panel.inert=true;
 }else{
  panel.removeAttribute("aria-hidden");
  panel.inert=false;
 }
 labelForHud();
}
hudToggle.addEventListener("click",()=>setHudHidden(!hudHidden));
labelForHud();
document.body.classList.add("lw-live-mode");
const css=document.createElement("style");
css.textContent="\nbody.lw-live-mode .control-panel,body.lw-live-mode .discovery{display:none!important}\n#lw-context{position:absolute;right:calc(13px + env(safe-area-inset-right));top:72px;width:min(280px,29vw);max-height:calc(100% - 86px);overflow:auto;padding:12px 13px;border-radius:18px;background:#091e2dde;backdrop-filter:blur(14px);border:1px solid #85e0c259;box-shadow:0 12px 35px #00152180}\n#lw-context h3{color:#baf9df;margin:0 0 7px;font-size:15px}\n#lw-context p{font-size:11px;line-height:1.35;color:#d5e8e1;margin:5px 0 9px}\n#lw-context .lw-stats{display:grid;grid-template-columns:1fr 1fr;gap:6px}\n#lw-context .lw-stats span{padding:6px;min-width:0;border:1px solid #5ca4913d;background:#1c43534d;border-radius:9px;font-size:10px;color:#daede7}\n#lw-context .lw-stats strong{display:block;font-size:16px;color:#fff2c4}\n#lw-context button{display:block;margin-top:5px;width:100%;padding:8px;border-radius:10px;border:1px solid #438978;background:#195254;color:#e8fff3;text-align:left;font-size:12px}\n#lw-context button:disabled{opacity:.42}\n#lw-context .lw-result{margin-top:8px;border-top:1px solid #ffffff30;padding-top:7px;font-size:11px;color:#ffe6b3}\n@media(max-height:460px){#lw-context{top:50px;max-height:calc(100% - 54px);width:210px;padding:7px}#lw-context button{padding:5px}}\n@media(max-width:720px){#lw-context{width:178px}#lw-context h3{font-size:12px}#lw-context button{font-size:10px}}\n";
css.textContent+="\n#lw-context .lw-stations{display:grid;grid-template-columns:1fr 1fr;gap:5px;margin:8px 0}\n#lw-context .lw-stations button{margin:0;padding:6px 4px;min-height:39px;text-align:center;font-size:10px}\n#lw-context .lw-stations button[aria-pressed=\"true\"]{border-color:#adf6bb;background:#296e63;box-shadow:0 0 0 1px #a1fac63b}\n#lw-context .lw-overview{margin:5px 0 8px!important}\n#lw-context .lw-station-hint{color:#c5e4de;font-size:11px;padding:5px 0}\n@media(max-height:450px){#lw-context .lw-stations button{min-height:31px;padding:4px 3px}#lw-context .lw-station-hint{font-size:10px}}\n";
css.textContent+="\n/* LW-D owner-directed holographic HUD: lightweight frosted glass, reversible.\n * Keep all world-changing actions delegated to the original Trialum engine. */\nbody.lw-live-mode #lw-context{\n background:linear-gradient(145deg,rgba(12,56,74,.48),rgba(4,26,41,.30))!important;\n -webkit-backdrop-filter:blur(13px) saturate(135%);\n backdrop-filter:blur(13px) saturate(135%);\n border:1px solid rgba(148,246,235,.57)!important;\n box-shadow:inset 0 1px 0 rgba(238,255,250,.35),inset 0 0 22px rgba(59,221,204,.07),0 14px 36px rgba(0,18,33,.32),0 0 18px rgba(52,236,213,.09)!important;\n border-radius:19px!important;color:#f0fffb;\n overflow-y:auto;overflow-x:hidden;\n transition:opacity .22s ease,transform .25s ease,visibility .25s ease;\n}\nbody.lw-live-mode #lw-context::before{\n content:\"\";position:absolute;inset:0;pointer-events:none;border-radius:inherit;\n background:linear-gradient(112deg,rgba(232,255,255,.15),transparent 22%,transparent 80%,rgba(67,235,206,.07)),\n repeating-linear-gradient(180deg,transparent 0px,transparent 15px,rgba(94,222,226,.012) 16px);\n}\nbody.lw-live-mode #lw-context h3{text-shadow:0 0 12px rgba(104,248,224,.28);letter-spacing:.02em}\nbody.lw-live-mode #lw-context .lw-stats span{\n background:rgba(19,70,88,.23)!important;\n border:1px solid rgba(142,244,225,.21)!important;\n}\nbody.lw-live-mode #lw-context button{\n color:#effff9;background:linear-gradient(120deg,rgba(38,131,137,.32),rgba(15,80,103,.22))!important;\n border:1px solid rgba(132,240,226,.41)!important;\n box-shadow:inset 0 1px 0 rgba(238,255,255,.11);\n}\nbody.lw-live-mode #lw-context button:focus-visible,\nbody.lw-live-mode #lw-hud-toggle:focus-visible{outline:2px solid #a5ffe4;outline-offset:2px}\nbody.lw-live-mode #lw-context button[aria-pressed=\"true\"]{\n background:rgba(47,170,157,.43)!important;border-color:#bcffe6!important;\n}\nbody.lw-live-mode #lw-context button:disabled{opacity:.44}\nbody.lw-live-mode #lw-hud-toggle{\n display:grid;place-items:center;position:absolute;z-index:32;\n top:max(66px,calc(40px + env(safe-area-inset-top)));\n right:calc(22px + env(safe-area-inset-right) + min(230px,26vw));\n width:44px;height:44px;min-width:44px;min-height:44px;border-radius:14px;\n color:#c8fff0;font-size:24px;font-weight:600;\n border:1px solid rgba(147,249,225,.58);\n background:linear-gradient(140deg,rgba(11,69,84,.65),rgba(8,36,60,.47));\n -webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);\n box-shadow:0 4px 22px rgba(5,26,44,.38),inset 0 1px rgba(242,255,249,.29);\n transition:right .22s ease,background .18s ease;\n cursor:pointer;touch-action:manipulation;\n}\nbody.lw-live-mode.lw-hud-hidden #lw-context{\n opacity:0!important;visibility:hidden!important;pointer-events:none!important;\n transform:translateX(20px);\n}\nbody.lw-live-mode.lw-hud-hidden #lw-hud-toggle{\n right:calc(13px + env(safe-area-inset-right));\n background:linear-gradient(140deg,rgba(12,75,83,.57),rgba(6,37,55,.45));\n}\nbody.lw-live-mode #lw-context .lw-exit-world{\n margin-top:10px;font-size:10px!important;text-align:center!important;\n border-color:rgba(189,243,230,.35)!important;background:rgba(11,46,65,.18)!important;\n}\n@media(max-height:460px){\n body.lw-live-mode #lw-hud-toggle{top:54px}\n body.lw-live-mode #lw-context{border-radius:14px}\n}\n@media(prefers-reduced-motion:reduce){\n body.lw-live-mode #lw-context,body.lw-live-mode #lw-hud-toggle{transition:none!important}\n}\n";
css.textContent+="\nbody.lw-live-mode #lw-context .lw-complex-rooms{display:grid;grid-template-columns:1fr;gap:5px;margin:8px 0 5px}\nbody.lw-live-mode #lw-context .lw-complex-rooms button{display:flex;justify-content:space-between;align-items:center;gap:5px;margin:0;padding:7px 8px;min-height:34px}\nbody.lw-live-mode #lw-context .lw-complex-rooms button small{font-size:9px;opacity:.68;max-width:110px;text-align:right}\nbody.lw-live-mode #lw-context .lw-entrance{background:rgba(42,148,128,.35)!important;border:1px solid #9deed6!important}\nbody.lw-live-mode #lw-context .lw-complex-future{font-size:10px;padding:6px 0;color:#b7f2db}\nbody.lw-live-mode #lw-context .lw-complex-back{background:rgba(40,136,125,.32)!important}\n";
css.textContent+=
 "\\n#lw-context .lw-dna-controls{display:grid;gap:5px;margin:6px 0}"+
 "\\n#lw-context .lw-dna-field{display:grid;gap:3px;color:#d9fff3;font-size:11px}"+
 "\\n#lw-context .lw-dna-field input,#lw-context .lw-dna-field select{width:100%;min-width:0;accent-color:#76e9da;color:#eafff9;background:#143e52;border:1px solid #62a99f;border-radius:7px;padding:4px}"+
 "\\n#lw-context .lw-dna-hue-value{font-size:11px;color:#a8ffeb}"+
 "\\n#lw-context .lw-dna-criterion{margin:3px 0;font-size:10px}"+
 "\\n#lw-context .lw-dna-feedback{padding:6px;border:1px solid #7cdbc7;border-radius:8px;background:#102e40}"+
 "\\n#lw-context button.lw-dna-commit{font-weight:700;border-color:#adffce!important}";
document.head.appendChild(css);
function make(tag,label,cls){
const e=document.createElement(tag);
if(label!==undefined)e.textContent=label;
if(cls)e.className=cls;
return e;
}
function num(v){const n=Number(v);return Number.isFinite(n)?Math.floor(n).toLocaleString("mk-MK"):"0";}
function addStat(parent,label,value){const e=make("span",T(label)),v=make("strong",num(value));e.append(v);parent.append(e);}
function addButton(label,kind,tab,disabled){
const b=make("button",T(label));b.type="button";b.disabled=Boolean(disabled);
b.dataset.lwAction=kind||"";b.dataset.lwTab=tab||"";
panel.append(b);
}
function render(){
const scene=document.querySelector("[data-scene].active")?.dataset.scene||"lab";
const inComplex=scene==="lab"&&complexRoom==="hub";
const inDna=scene==="lab"&&complexRoom==="dna";
document.body.classList.toggle("lw-complex-hall",inComplex);
document.body.classList.toggle("lw-dna-laboratory",inDna);
if(inComplex){
 panel.replaceChildren(make("h3",T("🏛️ Лабораториски комплекс")),make("p",T("Пет простории, една лабораториска целина.")));
 const go=make("button",T("↩ Врати се во основната лабораторија"),"lw-complex-back");
 go.dataset.lwComplex="basic";go.type="button";panel.append(go);
 const note=make("p",T("Избери простор во ходникот со допир или со копчињата."),"lw-complex-future");
 panel.append(note);
 const options=make("div",undefined,"lw-complex-rooms");
 for(const room of COMPLEX_ROOMS){
  const button=make("button");
  button.type="button";button.dataset.lwComplex=room.id;
  button.append(make("span",T(room.label)));
  if(!room.ready)button.append(make("small",T("Во развој · отвори постојна функција")));
  options.append(button);
 }
 panel.append(options);
 if(!world)panel.querySelectorAll("button").forEach(button=>button.disabled=true);
 if(world){
  const exit=make("button",T("← Излези од 3D"),"lw-exit-world");
  exit.dataset.lwTab="lab";exit.type="button";panel.append(exit);
 }
 labelForHud();
 return;
}

if(inDna){
 const dna=world?.dna||{},pet=dna.currentPet||null;
 const key=pet?String(pet.id||"")+"|"+String(pet.genomeSignature||""):"";
 if(key!==dnaDraftPetKey){
  dnaDraftPetKey=key;
  dnaDraft=pet?{hue:Math.max(0,Math.min(359,Math.round(Number(pet.hue)||0))),
    eyes:Math.max(1,Math.min(5,Math.round(Number(pet.eyes)||1))),
    shape:["jelly","crystal","leaf","cloud"].includes(pet.shape)?pet.shape:"jelly"}:null;
 }
 const available=Array.isArray(dna.targets)?dna.targets:[];
 if(!available.some(x=>x.id===dnaTarget))dnaTarget=available.find(x=>x.ready)?.id??available[0]?.id??null;
 panel.replaceChildren(make("h3",T("🧬 ДНК лабораторија · L3.2-B")),
  make("p",T("Скенирај го избраниот миленик, уреди фантастични гени или провери еволутивна линија.")));
 const back=make("button",T("↩ Лабораториски ходник"),"lw-complex-back");
 back.type="button";back.dataset.lwComplex="hub";panel.append(back);
 const stats=make("div",undefined,"lw-stats");
 addStat(stats,"Лабораторија ниво",dna.labLevel);
 addStat(stats,"Миленик ниво",dna.petLevel);
 panel.append(stats);
 const buttons=make("div",undefined,"lw-stations");
 for(const st of [
  {id:"scan",label:"🔬 Геномски скенер"},
  {id:"design",label:"🎨 Дизајнер на гени"},
  {id:"lineage",label:"🌱 Еволутивна линија"}
 ]){
  const button=make("button",T(st.label));button.type="button";button.dataset.lwDnaStation=st.id;
  button.setAttribute("aria-pressed",String(selectedDnaStation===st.id));buttons.append(button);
 }
 panel.append(buttons);
 if(!selectedDnaStation)panel.append(make("p",T("Избери една од трите 3D станици."),"lw-station-hint"));
 if(selectedDnaStation==="scan"){
  panel.append(make("h3",T("🔬 Геномски скенер")));
  panel.append(make("p",pet?T("Миленик")+": "+pet.name:T("Нема избрано милениче"),"lw-station-hint"));
  if(pet){
   panel.append(make("p",T("Боја")+": "+Math.round(Number(pet.hue)||0)+"° · "+T("Очи")+": "+pet.eyes+" · "+T("Облик")+": "+pet.shape));
   if(pet.genomeSignature)panel.append(make("p",T("Генетски потпис")+": "+pet.genomeSignature));
  }
  panel.append(make("p",T("Оваа станица користи вистински податоци од постојниот свет.")));
 }
 if(selectedDnaStation==="design"){
  panel.append(make("h3",T("🎨 Дизајнер на гени")));
  panel.append(make("p",pet?pet.name:T("Нема избрано милениче"),"lw-station-hint"));
  const form=make("div",undefined,"lw-dna-controls");
  const row=(label,control)=>{const wrap=make("label",T(label),"lw-dna-field");wrap.append(control);form.append(wrap);};
  const hue=make("input");hue.id="lwDnaHue";hue.type="range";hue.min="0";hue.max="359";
  hue.value=String(dnaDraft?.hue??0);hue.disabled=!pet||dnaPending;row("Боја",hue);
  const hueNum=make("strong",String(dnaDraft?.hue??0)+"°","lw-dna-hue-value");form.append(hueNum);
  const eyes=make("select");eyes.id="lwDnaEyes";eyes.disabled=!pet||dnaPending;
  for(let i=1;i<=5;i++){const opt=make("option",String(i));opt.value=String(i);eyes.append(opt);}
  eyes.value=String(dnaDraft?.eyes??1);row("Очи",eyes);
  const shape=make("select");shape.id="lwDnaShape";shape.disabled=!pet||dnaPending;
  for(const pair of [["jelly","Течна"],["crystal","Кристална"],["leaf","Лисна"],["cloud","Облачна"]]){
   const opt=make("option",T(pair[1]));opt.value=pair[0];shape.append(opt);
  }
  shape.value=dnaDraft?.shape||"jelly";row("Облик",shape);
  panel.append(form);
  if(!dna.designerUnlocked)panel.append(make("p",T("🔒 За дизајнер треба лаб. ниво 6 и миленик ниво 22."),"lw-station-hint"));
  else if(!dna.designAllowed)panel.append(make("p",T("Провери ги ресурсите и условите за дизајнот."),"lw-station-hint"));
  const commit=make("button",T("🧬 Примени гени · 25 молекули + 15 сознание + 1 акција"),"lw-dna-commit");
  commit.type="button";commit.dataset.lwDnaCommit="design";commit.disabled=!dna.designAllowed||!dnaDraft||dnaPending;
  panel.append(commit);
 }
 if(selectedDnaStation==="lineage"){
  panel.append(make("h3",T("🌱 Еволутивна линија")));
  const select=make("select");select.id="lwDnaTarget";select.disabled=!available.length||dnaPending;
  for(const target of available){
   const opt=make("option",target.name||String(target.id));opt.value=String(target.id);select.append(opt);
  }
  if(dnaTarget!==null)select.value=String(dnaTarget);
  const lab=make("label",T("Целна еволуција"),"lw-dna-field");lab.append(select);panel.append(lab);
  const target=available.find(x=>x.id===dnaTarget)||null;
  if(!target)panel.append(make("p",T("Нема истражени еволутивни линии.")));
  else{
   panel.append(make("p",T(target.ready?"Подготвена линија":"🔒 Недостапна линија"),"lw-station-hint"));
   if(!target.sourceMatch)panel.append(make("p",T("Изворниот вид не одговара на избраниот миленик.")));
   for(const item of target.items||[])
    panel.append(make("p",(item.ok?"✓ ":"🔒 ")+item.label+": "+item.value,"lw-dna-criterion"));
   const apply=make("button",T("🧬 Преобрази го избраниот миленик"),"lw-dna-commit");
   apply.type="button";apply.dataset.lwDnaCommit="transform";
   apply.disabled=!target.ready||!pet||dnaPending;
   panel.append(apply);
  }
 }
 if(dnaPending)panel.append(make("p",T("ДНК операцијата е во тек…"),"lw-station-hint"));
 if(dnaFeedback)panel.append(make("p",dnaFeedback,"lw-dna-feedback"));
 const classic=make("button",T("🧬 Отвори ДНК контроли"),"lw-entrance");
 classic.type="button";classic.dataset.lwTab="dna";panel.append(classic);
 const exit=make("button",T("← Излези од 3D"),"lw-exit-world");
 exit.type="button";exit.dataset.lwTab="lab";panel.append(exit);
 labelForHud();
 return;
}
const info=sections[scene]||sections.lab;
document.body.classList.toggle("lw-station-focus",scene==="lab"&&Boolean(selectedStation));
panel.replaceChildren(make("h3",T(info[0])),make("p",T(info[1])));
if(scene==="lab"){
 const corridor=make("button",T("🏛️ Лабораториски комплекс"),"lw-entrance");
 corridor.type="button";corridor.dataset.lwComplex="hub";
 panel.append(corridor);
}
if(scene==="lab"&&selectedStation){
 const overview=make("button",T("↩ Цела лабораторија"),"lw-overview");
 overview.type="button";overview.dataset.lwStation="overview";panel.append(overview);
}
const stats=make("div",undefined,"lw-stats");
if(scene==="lab"){
addStat(stats,"Лаб. акции",world?.labActions);addStat(stats,"Молекули",world?.compounds);
addStat(stats,"Сознание",world?.insight);addStat(stats,"Клетки",world?.cells);
}else if(scene==="flora"){
addStat(stats,"Биомаса",world?.biomass);addStat(stats,"Квалитет",world?.habitat?.quality);
}else if(scene==="biosphere"){
addStat(stats,"Миленичиња",world?.pets);addStat(stats,"Капацитет",world?.habitat?.capacity);
addStat(stats,"Зафатено",world?.habitat?.occupied);
}else{
addStat(stats,"Сознание",world?.insight);addStat(stats,"Етапа",Number(world?.stage||0)+1);
}
panel.append(stats);
if(scene==="biosphere"&&world?.habitat?.name)panel.append(make("p",T("Биосвет: ")+String(world.habitat.name).slice(0,90)));
if(scene==="lab"){
 panel.append(make("h3",T("Работни станици")));
 const buttons=make("div",undefined,"lw-stations");
 for(const station of WORKSTATIONS){
  const b=make("button",T(station.label));
  b.type="button";b.dataset.lwStation=station.id;
  b.setAttribute("aria-pressed",String(selectedStation===station.id));
  buttons.append(b);
 }
 panel.append(buttons);
 if(!selectedStation){
  panel.append(make("p",T("Допрете станица во 3D просторијата или избери ја овде."),"lw-station-hint"));
 }else{
  const selected=WORKSTATIONS.find(st=>st.id===selectedStation);
  if(selected){
   panel.append(make("h3",T(selected.title)),make("p",T(selected.description)));
   const blocked=!world||Number(world.labActions)<1||(selected.kind==="grow"&&Number(world.stage)<2);
   addButton(selected.command,selected.kind,"",blocked);
   if(blocked)panel.append(make("p",T("Недостапно во сегашната етапа")));
  }
 }
}else{
const link={flora:["🌱 Отвори флора","plants"],biosphere:["🏠 Отвори живеалишта","habitats"],research:["📚 Отвори истражувања","research"]}[scene]||["Отвори истражувања","research"];
addButton(link[0],"",link[1],!world);
}
if(resultText&&scene==="lab")panel.append(make("div",T(resultText),"lw-result"));
if(world){
 const exit=make("button",T("← Излези од 3D"),"lw-exit-world");
 exit.type="button";exit.dataset.lwTab="lab";
 panel.append(exit);
}
labelForHud();
document.getElementById("insight").textContent=num(world?.insight);
document.getElementById("trials").textContent=num(world?.day);
const metrics=document.querySelectorAll(".metric span");
if(metrics[1])metrics[1].textContent=T("ДЕН");
const english=Boolean(world?.language&&world.language!=="mk");
const setText=(selector,mk,en)=>{const n=document.querySelector(selector);if(n)n.textContent=english?en:mk;};
setText(".identity .eyebrow","ТРЕДИМЕНЗИОНАЛНА ЛАБОРАТОРИЈА · LW-D","INTERACTIVE 3D WORLD · LW-D");
setText(".identity h1 em","ЖИВ СВЕТ","LIVING WORLD");
setText(".metric span","СОЗНАНИЕ","INSIGHT");
setText(".status-dot span","• симулација","• simulation");
setText(".context-hint","↔ Повлечи за да ја завртиш 3D сцената · Нема background AI или рендер","↔ Drag to orbit the 3D scene · No background AI or rendering");
setText(".rotate strong","Заврти го телефонот хоризонтално","Rotate your phone to landscape");
setText(".rotate p","Trialum – Жив Свет е замислен за landscape искуство.","Trialum – Living World is built for landscape play.");
const dockLabels=[["Лаб","Lab"],["Флора","Flora"],["Свет","World"],["Знаење","Research"]];
document.querySelectorAll(".dockbtn small").forEach((e,i)=>{if(dockLabels[i])e.textContent=dockLabels[i][english?1:0];});
const sceneLabel=document.querySelector(".scene-type");
if(sceneLabel?.firstChild?.nodeType===3)sceneLabel.firstChild.nodeValue=english?"INTERACTIVE SCENE ":"ИНТЕРАКТИВНА СЦЕНА ";
const mkTitles={
lab:["Лабораторија на животот","Менувај ги условите и гледај како се менува фиктивниот примерок."],
flora:["Градина на новите форми","Погледни ги промените на флората во твојот биосвет."],
biosphere:["Биосвет што живее","Посматрај автономен мал свет на измислени суштества."],
research:["Центар за откритија","Секој експеримент носи ново знаење — и кога не успева."]
};
const enTitles={
lab:["Laboratory of Life","Run real game experiments and watch your world react."],
flora:["Garden of New Forms","Explore plants in your living habitat."],
biosphere:["Living Habitat","Observe your creatures in their world."],
research:["Discovery Center","Every experiment can teach you something."]
};
const newTitle=(english?enTitles:mkTitles)[scene];
if(newTitle){document.getElementById("sceneTitle").textContent=newTitle[0];document.getElementById("sceneDescription").textContent=newTitle[1];}
const badge=document.querySelector(".scene-type .pill");if(badge)badge.textContent="L2 · "+T("РЕАЛНА СОСТОЈБА");
}
panel.addEventListener("click",e=>{
const b=e.target.closest("button");
if(!b||b.disabled||!world)return;
if(b.dataset.lwComplex){
 const room=COMPLEX_ROOMS.find(r=>r.id===b.dataset.lwComplex);
 if(b.dataset.lwComplex==="hub"||room?.id==="basic"||(room?.id==="dna"&&root.TrialumLWDnaWebGLReady===true)){
  root.dispatchEvent(new CustomEvent("trialum:lw:complex-room",{detail:{room:b.dataset.lwComplex}}));
 }else if(room?.tab){
  root.parent.postMessage({type:"trialum:lw:classic",tab:room.tab},origin);
 }
 return;
}
if(b.dataset.lwDnaStation){
 if(["scan","design","lineage"].includes(b.dataset.lwDnaStation))
  root.dispatchEvent(new CustomEvent("trialum:lw:select-dna-station",{detail:{id:b.dataset.lwDnaStation}}));
 return;
}
if(b.dataset.lwStation){
 const id=b.dataset.lwStation==="overview"?null:b.dataset.lwStation;
 if(id===null||WORKSTATIONS.some(item=>item.id===id))
  root.dispatchEvent(new CustomEvent("trialum:lw:select-station",{detail:{id}}));
 return;
}
if(b.dataset.lwAction&&["synthesize","analyze","harvest","grow"].includes(b.dataset.lwAction)){
root.parent.postMessage({type:"trialum:lw:action",kind:b.dataset.lwAction},origin);
}else if(b.dataset.lwTab&&["lab","plants","habitats","research","dna"].includes(b.dataset.lwTab)){
root.parent.postMessage({type:"trialum:lw:classic",tab:b.dataset.lwTab},origin);
}
});
for(const b of document.querySelectorAll("[data-scene]"))b.addEventListener("click",()=>{resultText="";render();});
root.addEventListener("trialum:lw:complex-room-changed",event=>{
 complexRoom=["hub","dna"].includes(event.detail?.room)?event.detail.room:"basic";
 selectedStation=null;selectedDnaStation=null;
 resultText="";
 render();
});
root.addEventListener("trialum:lw:complex-door",event=>{
 const id=event.detail?.roomId,tab=event.detail?.tab;
 if(COMPLEX_ROOMS.some(room=>room.id===id&&room.tab===tab)&&tab){
  root.parent.postMessage({type:"trialum:lw:classic",tab},origin);
 }
});
root.addEventListener("trialum:lw:dna-station-changed",event=>{
 selectedDnaStation=["scan","design","lineage"].includes(event.detail?.id)?event.detail.id:null;
 render();
});
root.addEventListener("trialum:lw:station-changed",event=>{
 selectedStation=WORKSTATIONS.some(item=>item.id===event.detail?.id)?event.detail.id:null;
 resultText="";render();
});
root.addEventListener("message",event=>{
if(event.source!==root.parent||event.origin!==origin)return;
const message=event.data;if(!message||typeof message!=="object")return;
if(message.type==="trialum:lw:state"&&message.world&&typeof message.world==="object"){world=message.world;root.dispatchEvent(new CustomEvent("trialum:lw:real-world",{detail:{compounds:world.compounds,insight:world.insight,pets:world.pets,biomass:world.biomass,dna:world.dna}}));render();}
else if(message.type==="trialum:lw:result"){
 resultText=String(message.result?.message||"").slice(0,260);
 const kind=String(message.kind||"");
 if(["synthesize","analyze","harvest","grow"].includes(kind)){
  root.dispatchEvent(new CustomEvent("trialum:lw:process-result",{
   detail:{kind,ok:message.result?.ok===true,before:message.before,after:message.after}
  }));
 }
 render();
}
});
root.parent.postMessage({type:"trialum:lw:ready"},origin);
render();
})(globalThis);
