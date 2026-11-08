/* TRIALUM 1.5 — lightweight offline, extendable UI locale catalogs.
   Gameplay state stays language-neutral. Player names and journal history untouched. */
(function(root){
'use strict';
let lang='mk',strings={},words={},generation=0;
const originals=new WeakMap(),attributes=new WeakMap();
const allow=['mk','en'];
function language(){return lang}
function raw(text){
 const value=String(text??''),trim=value.trim();
 if(lang==='mk'||!trim)return value;
 const exact=strings[trim];
 if(exact)return value.replace(trim,exact);
 // Emoji/icon prefixes used by Canvas/HTML headlines are kept untouched.
 const first=trim.search(/[А-Яа-яЀ-ӿ]/);
 if(first<0)return value;
 const prefix=trim.slice(0,first),body=trim.slice(first);
 const translated=strings[body]||dynamic(body);
 return value.replace(trim,prefix+translated);
}
function translateWords(text){
 return text.replace(/[А-Яа-яЀ-ӿ]+(?:-[А-Яа-яЀ-ӿ]+)*/g,word=>{
  const direct=words[word];
  if(direct)return direct;
  const lower=word.toLocaleLowerCase('mk-MK'),trans=words[lower];
  if(!trans)return word; // user names and unknown game terminology are preserved
  return word[0]===word[0].toLocaleUpperCase('mk-MK')?trans[0].toLocaleUpperCase('en')+trans.slice(1):trans;
 });
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
 // Preserve separators and numbers, translating their fragments independently.
 const parts=String(text).split(/(\s*[·|:;—]\s*)/);
 return parts.map(part=>{
  if(strings[part.trim()])return part.replace(part.trim(),strings[part.trim()]);
  for(const [mk,en]of prefixPairs)if(part.startsWith(mk))return en+translateWords(part.slice(mk.length));
  return translateWords(part);
 }).join('');
}
function ignore(node){
 const element=node.parentElement;
 return !element||!!element.closest('script,style,textarea,pre,code,.log-entry p,.chat-message p,.user-authored,.pet-head h3,.pet-option b,[data-no-translate]');
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
 if(next==='mk'){strings={};words={};return next;}
 try{
  const response=await fetch('locales/'+next+'.json',{cache:'force-cache'});
  if(!response.ok)throw Error('Missing locale '+next);
  const payload=await response.json();
  if(payload?.language!==next||typeof payload.strings!=='object')throw Error('Invalid locale');
  if(current===generation){strings=payload.strings;words=payload.words||{};}
 }catch(e){
  console.warn('Trialum locale unavailable; base Macedonian is retained for untranslated text',e);
  if(current===generation){strings={};words={};}
 }
 return lang;
}
root.TrialumI18n={language,change,translateDOM,t:raw,languages:allow.slice()};
if(typeof module==='object'&&module.exports)module.exports={raw,dynamic};
})(typeof globalThis!=='undefined'?globalThis:this);
