/* LW-D D1 contextual HUD, connected to existing deterministic game world.
 * No second persistent state, no AI, no networking beyond trusted parent iframe.
 */
(function(root){
"use strict";
if(new URLSearchParams(root.location.search).get("live")!=="1"||root.parent===root)return;
const origin=root.location.origin;
let world=null,resultText="";
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
document.body.classList.add("lw-live-mode");
const css=document.createElement("style");
css.textContent="\nbody.lw-live-mode .control-panel,body.lw-live-mode .discovery{display:none!important}\n#lw-context{position:absolute;right:calc(13px + env(safe-area-inset-right));top:72px;width:min(280px,29vw);max-height:calc(100% - 86px);overflow:auto;padding:12px 13px;border-radius:18px;background:#091e2dde;backdrop-filter:blur(14px);border:1px solid #85e0c259;box-shadow:0 12px 35px #00152180}\n#lw-context h3{color:#baf9df;margin:0 0 7px;font-size:15px}\n#lw-context p{font-size:11px;line-height:1.35;color:#d5e8e1;margin:5px 0 9px}\n#lw-context .lw-stats{display:grid;grid-template-columns:1fr 1fr;gap:6px}\n#lw-context .lw-stats span{padding:6px;min-width:0;border:1px solid #5ca4913d;background:#1c43534d;border-radius:9px;font-size:10px;color:#daede7}\n#lw-context .lw-stats strong{display:block;font-size:16px;color:#fff2c4}\n#lw-context button{display:block;margin-top:5px;width:100%;padding:8px;border-radius:10px;border:1px solid #438978;background:#195254;color:#e8fff3;text-align:left;font-size:12px}\n#lw-context button:disabled{opacity:.42}\n#lw-context .lw-result{margin-top:8px;border-top:1px solid #ffffff30;padding-top:7px;font-size:11px;color:#ffe6b3}\n@media(max-height:460px){#lw-context{top:50px;max-height:calc(100% - 54px);width:210px;padding:7px}#lw-context button{padding:5px}}\n@media(max-width:720px){#lw-context{width:178px}#lw-context h3{font-size:12px}#lw-context button{font-size:10px}}\n";
document.head.appendChild(css);
function make(tag,label,cls){
const e=document.createElement(tag);
if(label!==undefined)e.textContent=label;
if(cls)e.className=cls;
return e;
}
function num(v){const n=Number(v);return Number.isFinite(n)?Math.floor(n).toLocaleString("mk-MK"):"0";}
function addStat(parent,label,value){const e=make("span",label),v=make("strong",num(value));e.append(v);parent.append(e);}
function addButton(label,kind,tab,disabled){
const b=make("button",label);b.type="button";b.disabled=Boolean(disabled);
b.dataset.lwAction=kind||"";b.dataset.lwTab=tab||"";
panel.append(b);
}
function render(){
const scene=document.querySelector("[data-scene].active")?.dataset.scene||"lab";
const info=sections[scene]||sections.lab;
panel.replaceChildren(make("h3",info[0]),make("p",info[1]));
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
if(scene==="biosphere"&&world?.habitat?.name)panel.append(make("p","Биосвет: "+String(world.habitat.name).slice(0,90)));
if(scene==="lab"){
const cannot=!world||Number(world.labActions)<1;
addButton("✦ Синтеза на молекули","synthesize","",cannot);
addButton("🔬 Анализа и сознание","analyze","",cannot);
addButton("🪨 Собери материјали","harvest","",cannot);
addButton("🧫 Размножи клетки","grow","",cannot||Number(world.stage)<2);
}else{
const link={flora:["🌱 Отвори флора","plants"],biosphere:["🏠 Отвори живеалишта","habitats"],research:["📚 Отвори истражувања","research"]}[scene]||["Отвори истражувања","research"];
addButton(link[0],"",link[1],!world);
}
if(resultText&&scene==="lab")panel.append(make("div",resultText,"lw-result"));
document.getElementById("insight").textContent=num(world?.insight);
document.getElementById("trials").textContent=num(world?.day);
const metrics=document.querySelectorAll(".metric span");
if(metrics[1])metrics[1].textContent="ДЕН";
const badge=document.querySelector(".scene-type .pill");if(badge)badge.textContent="D1 · РЕАЛНА СОСТОЈБА";
}
panel.addEventListener("click",e=>{
const b=e.target.closest("button");
if(!b||b.disabled||!world)return;
if(b.dataset.lwAction&&["synthesize","analyze","harvest","grow"].includes(b.dataset.lwAction)){
root.parent.postMessage({type:"trialum:lw:action",kind:b.dataset.lwAction},origin);
}else if(b.dataset.lwTab&&["plants","habitats","research"].includes(b.dataset.lwTab)){
root.parent.postMessage({type:"trialum:lw:classic",tab:b.dataset.lwTab},origin);
}
});
for(const b of document.querySelectorAll("[data-scene]"))b.addEventListener("click",()=>{resultText="";render();});
root.addEventListener("message",event=>{
if(event.source!==root.parent||event.origin!==origin)return;
const message=event.data;if(!message||typeof message!=="object")return;
if(message.type==="trialum:lw:state"&&message.world&&typeof message.world==="object"){world=message.world;root.dispatchEvent(new CustomEvent("trialum:lw:real-world",{detail:{compounds:world.compounds,insight:world.insight,pets:world.pets,biomass:world.biomass}}));render();}
else if(message.type==="trialum:lw:result"){resultText=String(message.result?.message||"").slice(0,260);render();}
});
root.parent.postMessage({type:"trialum:lw:ready"},origin);
render();
})(globalThis);
