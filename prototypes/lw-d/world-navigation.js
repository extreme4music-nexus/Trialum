/* LW-D L2.3 world overview. All state comes from the existing game.
 * Classic links retain access while dedicated 3D rooms are developed.
 */
(function(root){
"use strict";
if(new URLSearchParams(root.location.search).get("live")!=="1"||root.parent===root)return;
const origin=root.location.origin,frame=document.getElementById("frame"),dock=document.querySelector(".dock");
if(!frame||!dock)return;
let world=null,opened=false;
const terms={
 mk:{day:"Ден",xp:"XP",credits:"Кредити",compounds:"Молекули",biomass:"Биомаса",insight:"Сознание",menu:"Мени",title:"Мапа на светот",
 info:"Сите функции од стариот Trialum остануваат достапни додека се градат 3D просториите.",classic:"Постојно мени",future:"3D просторија во развој",
 labs:"Лабораториски комплекс",complex:"3D ходник на лабораториите",living:"Биосвет и домови",supplies:"Производство и храна",social:"Дружење",extras:"Повеќе",
 lab:"Основна 3D лабораторија",research:"Истражување",dna:"ДНК лабораторија",plants:"Флора лабораторија",labfuture:"Дополнителни лабораториски соби",
 biosphere:"3D биосвет (пробен)",habitats:"Живеалишта",pets:"Миленичиња и домови",food:"Храна и залихи",warehouse:"3D складиште за храна",
 playground:"Локална игротека",shared:"Заедничка игротека",friends:"Пријатели",messages:"Пораки",
 playgames:"Google Play Games",achievements:"Галерија",diary:"Дневник",notifications:"Известувања",settings:"Поставки",more:"Сите функции"},
 en:{day:"Day",xp:"XP",credits:"Credits",compounds:"Molecules",biomass:"Biomass",insight:"Insight",menu:"Menu",title:"World Atlas",
 info:"All original Trialum features remain available while 3D rooms are built.",classic:"Existing screen",future:"3D room under development",
 labs:"Laboratory complex",complex:"3D Laboratory Hall",living:"World and homes",supplies:"Production and food",social:"Social spaces",extras:"More",
 lab:"Basic 3D laboratory",research:"Research",dna:"DNA laboratory",plants:"Flora laboratory",labfuture:"Future laboratory rooms",
 biosphere:"3D biosphere (preview)",habitats:"Habitats",pets:"Pets and homes",food:"Food and supplies",warehouse:"3D food warehouse",
 playground:"Local playground",shared:"Shared playground",friends:"Friends",messages:"Messages",
 playgames:"Google Play Games",achievements:"Gallery",diary:"Diary",notifications:"Notifications",settings:"Settings",more:"All features"}};
const groups=[
 {name:"labs",entries:[["🏛️","complex","scene"],["⚗️","lab","scene"],["🔬","research","classic"],["🧬","dna","classic"],["🌱","plants","classic"],["🏗️","labfuture","future"]]},
 {name:"living",entries:[["🪐","biosphere","scene"],["🏡","habitats","classic"],["🐾","pets","classic"]]},
 {name:"supplies",entries:[["🍱","food","classic"],["📦","warehouse","future"]]},
 {name:"social",entries:[["🎠","playground","classic"],["🌳","shared","classic"],["🤝","friends","classic"],["💌","messages","classic"]]},
 {name:"extras",entries:[["🎮","playgames","classic"],["🏆","achievements","classic"],["📖","diary","classic"],["🔔","notifications","classic"],["⚙️","settings","classic"],["☰","more","classic"]]}
];
const locale=()=>world?.language&&world.language!=="mk"?"en":"mk";
const t=key=>terms[locale()][key]||key;
const el=(tag,cls)=>{const e=document.createElement(tag);if(cls)e.className=cls;return e;};
const txt=(tag,val,cls)=>{const e=el(tag,cls);e.textContent=val;return e;};
const nf=v=>Number.isFinite(Number(v))?Math.max(0,Math.floor(Number(v))).toLocaleString(locale()==="mk"?"mk-MK":"en-US"):"0";
const stats=el("section","lw-quick-stats");stats.id="lw-quick-stats";stats.setAttribute("role","status");stats.setAttribute("aria-live","off");frame.append(stats);
const toggle=el("button","dockbtn lw-atlas-toggle");toggle.id="lw-atlas-toggle";toggle.type="button";toggle.setAttribute("aria-controls","lw-atlas");
toggle.append(txt("span","☰","emoji"),txt("small","Мени"));dock.append(toggle);
const atlas=el("section","lw-atlas");atlas.id="lw-atlas";atlas.hidden=true;atlas.setAttribute("role","region");frame.append(atlas);
function drawStats(){
 stats.setAttribute("aria-label",locale()==="mk"?"Основни податоци":"World resources");
 stats.replaceChildren();
 const values=[["day","📅",world?.day],["xp","⭐",world?.xp],["credits","💠",world?.credits],
 ["compounds","⚗️",world?.compounds],["biomass","🌿",world?.biomass],["insight","🧠",world?.insight]];
 for(const [key,emoji,value] of values){
  const chip=el("div","lw-stat");
  chip.append(txt("span",emoji+" "+t(key),"lw-stat-label"),txt("strong",nf(value),"lw-stat-value"));
  stats.append(chip);
 }
}
function drawAtlas(){
 const expanded=[...atlas.querySelectorAll("details[open]")].map(d=>d.dataset.group);
 atlas.replaceChildren(txt("h2",t("title")),txt("p",t("info"),"lw-atlas-note"));
 atlas.setAttribute("aria-label",t("title"));
 for(const group of groups){
  const details=el("details","lw-atlas-group");details.dataset.group=group.name;
  details.open=expanded.includes(group.name)||(!expanded.length&&group.name==="labs");
  details.append(txt("summary",t(group.name)));
  const list=el("div","lw-atlas-items");
  for(const [emoji,key,kind] of group.entries){
   if(kind==="future"){
    const line=txt("div",emoji+" "+t(key),"lw-atlas-future");
    line.append(txt("small",t("future")));list.append(line);continue;
   }
   const btn=el("button","lw-atlas-entry");btn.type="button";
   btn.dataset.route=key;btn.dataset.kind=kind;
   btn.append(txt("span",emoji+" "+t(key)),txt("small",kind==="scene"?"3D":t("classic")));
   list.append(btn);
  }
  details.append(list);atlas.append(details);
 }
}
function setAtlas(value){
 opened=Boolean(value);atlas.hidden=!opened;
 toggle.classList.toggle("active",opened);
 toggle.setAttribute("aria-expanded",String(opened));
 toggle.setAttribute("aria-label",(opened?"✕ ":"☰ ")+t("menu"));
 toggle.querySelector("small").textContent=t("menu");
}
toggle.addEventListener("click",()=>setAtlas(!opened));
// World Atlas is a temporary navigation popover, not a persistent sidebar.
// A pointer beginning ANYWHERE outside both the atlas and its opener dismisses
// it immediately, including the 3D canvas, HUD, dock or blank screen. Pressing
// inside submenus keeps them usable until a route is chosen.
function dismissAtlasOnOutsidePointer(event){
 if(!opened)return;
 const target=event.target;
 if(!target||atlas.contains(target)||toggle.contains(target))return;
 setAtlas(false);
}
document.addEventListener("pointerdown",dismissAtlasOnOutsidePointer,true);
root.addEventListener("keydown",event=>{
 if(event.key!=="Escape"||!opened)return;
 event.preventDefault();
 setAtlas(false);
 toggle.focus({preventScroll:true});
});

atlas.addEventListener("click",event=>{
 const button=event.target.closest("button[data-route]");
 if(!button)return;
 const kind=button.dataset.kind,key=button.dataset.route;
 const found=groups.some(g=>g.entries.some(x=>x[1]===key&&x[2]===kind));
 if(!found)return;
 if(kind==="scene"){
  if(key==="complex"){
   root.dispatchEvent(new CustomEvent("trialum:lw:complex-room",{detail:{room:"hub"}}));
  }else if(key==="lab"){
   root.dispatchEvent(new CustomEvent("trialum:lw:complex-room",{detail:{room:"basic"}}));
  }else{
   document.querySelector('.dockbtn[data-scene="'+key+'"]')?.click();
  }
  setAtlas(false);
 }else if(kind==="classic"){
  root.parent.postMessage({type:"trialum:lw:classic",tab:key},origin);
  setAtlas(false);
 }
});
root.addEventListener("message",event=>{
 if(event.source!==root.parent||event.origin!==origin||!event.data||typeof event.data!=="object")return;
 if(event.data.type!=="trialum:lw:state"||!event.data.world||typeof event.data.world!=="object")return;
 const oldLanguage=locale();world=event.data.world;
 drawStats();
 if(opened||oldLanguage!==locale())drawAtlas();
 setAtlas(opened);
});
drawStats();drawAtlas();setAtlas(false);
})(globalThis);
