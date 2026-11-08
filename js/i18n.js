/* TRIALUM 1.5 — lightweight offline, extendable UI locale catalogs.
   Gameplay state stays language-neutral. Player names and journal history untouched. */
(function(root){
'use strict';
let lang='mk',strings={},generation=0;
const originals=new WeakMap(),attributes=new WeakMap();
const allow=['mk','en'];
function language(){return lang}
function raw(text){
 const value=String(text??''),trim=value.trim();
 if(lang==='mk'||!trim)return value;
 const translated=strings[trim];
 if(translated)return value.replace(trim,translated);
 // Common dynamic widgets contain numerals / intermediate statuses.
 const parts=trim.split(/(\s+[·|:]\s+)/);
 if(parts.length>1){
  const mapped=parts.map(part=>strings[part]||dynamic(part));
  return value.replace(trim,mapped.join(''));
 }
 return value.replace(trim,dynamic(trim));
}
const prefixPairs=[
 ['Ниво ','Level '],['Ден ','Day '],['ден ','day '],['Лабораторија ','Laboratory '],
 ['Миленик ','Pet '],['Лаб ','Lab '],['Акции ','Actions '],['Активно живеалиште: ','Active habitat: '],
 ['Миленици ','Pets '],['Живеалишта ','Habitats '],['Знаење: ','Knowledge: '],
 ['Резерва: ','Stock: '],['Порции ','Servings '],['Цена: ','Cost: '],['Фаза ','Stage '],
 ['Квалитет ','Quality '],['Научено: ','Learned: '],['Соодветно живеалиште ','Compatible habitat '],
 ['Потребни се ','Required: '],['Недостига ','Missing: '],
 ['Претходно милениче ','Previous pet '],['Создај ','Create '],
 ['Допрете ','Tap '],['Последни откритија ','Recent discoveries '],
 ['Истражувачки материјали ','Research materials '],
 ['Избрано милениче','Selected pet'],['Локално автоматско зачувување','Local autosave'],
 ['Оваа формула одговара','This formula fits'],['Специјализирана за друга група','Specialized for another group']
];
function dynamic(text){
 if(strings[text])return strings[text];
 for(const [mk,en] of prefixPairs)if(text.startsWith(mk))return en+text.slice(mk.length);
 return text;
}
function ignore(node){
 const element=node.parentElement;
 return !element||!!element.closest('script,style,textarea,pre,code,.log-entry p,.chat-message p,.user-authored,[data-no-translate]');
}
function translateDOM(rootNode){
 if(!rootNode||!root.document)return;
 const d=root.document;
 const nodes=[];
 if(rootNode.nodeType===3)nodes.push(rootNode);
 else{
  const iter=d.createTreeWalker(rootNode,NodeFilter.SHOW_TEXT);
  let text;while((text=iter.nextNode()))if(!ignore(text))nodes.push(text);
 }
 for(const node of nodes){
  const base=originals.has(node)?originals.get(node):node.nodeValue;
  if(!originals.has(node))originals.set(node,base);
  const next=lang==='mk'?base:raw(base);
  if(next!==node.nodeValue)node.nodeValue=next;
 }
 if(rootNode.nodeType!==1)return;
 const elements=[rootNode,...rootNode.querySelectorAll('[placeholder],[aria-label],[title],[alt]')];
 for(const n of elements){
  let old=attributes.get(n);if(!old){old={};attributes.set(n,old)}
  for(const key of ['placeholder','aria-label','title','alt'])if(n.hasAttribute?.(key)){
   if(!(key in old))old[key]=n.getAttribute(key);
   const next=lang==='mk'?old[key]:raw(old[key]);
   if(next!==n.getAttribute(key))n.setAttribute(key,next);
  }
 }
}
async function change(requested){
 const next=allow.includes(requested)?requested:'mk';
 lang=next;const current=++generation;
 root.document.documentElement.lang=next;
 if(next==='mk'){strings={};return next;}
 try{
  const response=await fetch('locales/'+next+'.json',{cache:'force-cache'});
  if(!response.ok)throw Error('Missing locale '+next);
  const payload=await response.json();
  if(payload?.language!==next||typeof payload.strings!=='object')throw Error('Invalid locale');
  if(current===generation)strings=payload.strings;
 }catch(e){
  console.warn('Trialum locale unavailable; base Macedonian is retained for untranslated text',e);
  if(current===generation)strings={};
 }
 return lang;
}
root.TrialumI18n={language,change,translateDOM,t:raw,languages:allow.slice()};
if(typeof module==='object'&&module.exports)module.exports={raw,dynamic};
})(typeof globalThis!=='undefined'?globalThis:this);
