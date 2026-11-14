/* TRIALUM Living World D0 - experimental fictional science model, no real protocols.
 * Pure model: no network, storage, timers, artificial intelligence or background tasks. */
(function(root,factory){const api=factory();if(typeof module==="object"&&module.exports)module.exports=api;root.TrialumLivingWorldDemo=api;})(typeof globalThis!=="undefined"?globalThis:this,function(){
"use strict";
const clamp=(x,lo,hi)=>Math.max(lo,Math.min(hi,Number.isFinite(Number(x))?Number(x):lo));
const notes=Object.freeze({
balance:"Во вистинските екосистеми условите и ресурсите влијаат врз растот. Нашето суштество е измислено.",
crystal:"Научниот метод ги проверува хипотезите со повторливи набљудувања; неочекувани резултати се вредни.",
dormant:"И неуспешниот експеримент е важен податок. Организмите имаат граници на толеранција."
});
function initial(){return {scene:"lab",temperature:54,water:64,light:66,trials:0,insight:0,lastOutcome:"ready",discovered:[],log:[]};}
function setParam(s,name,value){if(!["temperature","water","light"].includes(name))return s;return Object.assign({},s,{[name]:clamp(value,0,100)});}
function setScene(s,name){return ["lab","flora","biosphere","research"].includes(name)?Object.assign({},s,{scene:name}):s;}
function runExperiment(s){
const t=clamp(s.temperature,0,100),w=clamp(s.water,0,100),l=clamp(s.light,0,100);
const distance=Math.abs(t-54)*.7+Math.abs(w-64)*.7+Math.abs(l-66)*.6;
const type=t>73&&w<34&&l>50?"crystal":distance<32?"balance":"dormant";
const titles={balance:"Примерокот оживеа!",crystal:"Неочекувана кристална форма!",dormant:"Примерокот мирува — научи зошто"};
const item={trial:s.trials+1,type,title:titles[type],science:notes[type],parameters:{temperature:t,water:w,light:l},id:["T",s.trials+1,t,w,l].join("-")};
return Object.assign({},s,{trials:s.trials+1,insight:s.insight+1,lastOutcome:type,discovered:s.discovered.includes(type)?s.discovered.slice():s.discovered.concat(type),log:[item].concat(s.log).slice(0,12)});
}
return Object.freeze({initial,setParam,setScene,runExperiment,notes});
});
