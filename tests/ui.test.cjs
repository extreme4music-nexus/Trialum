/* JSDOM integration test: mount actual HTML and exercise tabs/buttons.
   This catches runtime errors that syntax/unit tests miss. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {JSDOM}=require('jsdom');
const ROOT=path.join(__dirname,'..');
const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
const scripts=[
 'js/i18n.js','js/engine.js','js/evolution.js','js/progression.js','js/longplay.js','js/fauna-lab.js','js/debug-tools.js',
 'js/peer.js','js/creature-art.js','js/world.js','js/share.js','js/gif-encoder.js','js/media.js','js/expansion-ui.js','js/longplay-ui.js','js/app.js'
];
function create(){
 const dom=new JSDOM(html,{url:'https://appassets.androidplatform.net/assets/web/index.html',runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window;
 const noop=()=>{};
 const ctx=new Proxy({createLinearGradient:()=>({addColorStop:noop}),createRadialGradient:()=>({addColorStop:noop}),measureText:()=>({width:70})},{get(target,prop){return target[prop]||noop},set(target,prop,value){target[prop]=value;return true}});
 w.HTMLCanvasElement.prototype.getContext=()=>ctx;
 w.requestAnimationFrame=()=>0;
 w.fetch=async url=>({ok:true,json:async()=>JSON.parse(fs.readFileSync(path.join(ROOT,String(url)),'utf8'))});
 w.alert=noop;w.confirm=()=>true;w.prompt=()=>null;
 for(const file of scripts.slice(0,-1))w.eval(fs.readFileSync(path.join(ROOT,file),'utf8'));
 const E=w.TrialumEngine;
 const world=E.newGame('real');
 world.stage=7;world.lastDay=400;world.createdAt=Date.now()-399*E.DAY_MS;
 world.insight=100000;world.compounds=100000;world.biomass=100000;world.energy=100;world.cells=10000;
 for(const e of E.ELEMENTS)world.elements[e]=1000;
 world.research.level=40;world.research.knowledge=50000;for(const k of Object.keys(world.research.fields))world.research.fields[k]=5000;
 world.labActions=20;
 world.habitats=[{id:'hab-1',name:'Тест аквариум',biome:'lagoon',capacity:80,minerals:{macro:60,micro:55},chem:{ph:7.1,temp:24,oxygen:93,toxins:1},cleanliness:95,flora:[],dayActions:5,bornDay:1,floraSlots:6}];
 world.activeHabitat='hab-1';
 world.logs.push({kind:'milestone',day:10,text:'Создадена пробна клетка'});
 E.ensureLongplay(world);
 w.TrialumStorage={load:async()=>world,save:async()=>({ok:true,backend:'TEST'}),clear:async()=>{},parseImport:(s)=>JSON.parse(s)};
 w.TrialumAudio={sync:noop,sfx:noop,speak:noop,setVolume:noop};
 w.eval(fs.readFileSync(path.join(ROOT,'js/app.js'),'utf8'));
 return{w,world,dom,E};
}
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function run(){
 const {w,world,dom}=create(),errors=[];
 w.addEventListener('error',e=>{errors.push(e.message);e.preventDefault()});
 await delay(35);
 const d=w.document;
 assert(d.getElementById('hudXP'),'XP HUD missing');
 assert(d.getElementById('hudTokens'),'tokens HUD missing');
 assert.equal(d.querySelectorAll('.primary-game-nav>.tab').length,5,'main nav should have 5 tabs');
 const click=tab=>{let t=d.querySelector('[data-tab="'+tab+'"]');if(!t){const more=d.querySelector('.primary-game-nav [data-tab="more"]');assert(more,'missing More navigation');more.click();t=d.querySelector('[data-tab="'+tab+'"]');}assert(t,'missing menu '+tab);t.click();};
 function check(tab,need){
   click(tab);const text=d.getElementById('tabContent').textContent;
   assert(text.includes(need),'tab '+tab+' did not render: '+text.slice(0,350));
   assert(!text.includes('Проблем со мени'),'tab '+tab+' crashed');
   console.log('✓ '+tab+' renders');
 }
 check('habitats','Биохемија');
 assert(d.querySelector('[data-do="habCare"]'),'habitat care buttons missing');
 assert(d.querySelector('[data-do="startBuild"]'),'habitat construction missing');
 assert(d.querySelector('[data-do="longHabUpgrade"]'),'habitat upgrades missing');
 check('more','Повеќе можности');
 check('dna','ДНК');
 assert(d.querySelector('[data-do="transformDNA"]'),'DNA evolution missing');
 check('friends','Пријатели');
 assert(d.querySelector('[data-do="p2pOffer"]'),'friend invite missing');
 assert(d.querySelector('[data-do="p2pAnswer"]'),'friend answer missing');
 check('diary','Хронолошки дневник');
 const search=d.getElementById('diarySearch');
 search.value='постои нешто непознато';search.dispatchEvent(new w.Event('input',{bubbles:true}));
 assert.equal(d.querySelectorAll('#diaryList .log-entry:not([hidden])').length,0,'diary search failed');
 check('settings','Дебагирање');
 const toggle=d.querySelector('[data-do="debugToggle"]');assert(toggle);toggle.click();
 assert(world.settings.debugEnabled,'debug toggle did not enable testing');
 assert(d.querySelector('[data-do="debugDays"]'),'debug day buttons missing');
 const daysBefore=world.lastDay;d.querySelector('[data-do="debugDays"][data-days="1"]').click();
 assert(world.lastDay>daysBefore,'+1 day did not advance simulation');
 check('pets','Миленици');
 assert(d.getElementById('selectedPetMount'),'Pet care panel must be scoped to Pets');
 assert(d.getElementById('selectedPanel')?.closest('#tabContent'),'Pet care panel must not be duplicated in global sidebar');
 check('research','Истражувања');
 assert(w.TrialumMedia?.open,'Media picker module missing');
 assert(w.TrialumMedia.open(world),'Media chooser failed to open');
 assert(d.querySelectorAll('[data-mediaformat]').length===3,'PNG / GIF / video choices missing');
 assert(d.getElementById('mediaPreview'),'Media preview button missing');
 w.TrialumMedia.close();
 assert(w.TrialumCreatureArt?.draw,'2.5D creature renderer missing');
 assert(w.TrialumWorld?.frameAt,'Animated frame capture missing');
 assert(w.TrialumGif?.encode,'Offline GIF encoding missing');
 const bytes=w.TrialumGif.encode([new Uint8ClampedArray(16*16*4).fill(128)],16,16,8);
 assert.equal(String.fromCharCode(...bytes.slice(0,6)),'GIF89a');
 assert.equal(bytes[bytes.length-1],0x3b);
 console.log('✓ 2.5D renderer and valid GIF container smoke checks');
 check('lab','Жива лабораторија');
 check('food','Лабораторија за храна');
 check('plants','Ботаничка');
 check('notifications','Известувања');
 await w.TrialumI18n.change('en');w.TrialumI18n.translateDOM(d.body);
 assert(d.querySelector('#tabs').textContent.includes('Research'),'English navigation did not translate');
 await w.TrialumI18n.change('mk');w.TrialumI18n.translateDOM(d.body);
 assert(d.querySelector('#tabs').textContent.includes('Истражувања'),'Macedonian did not restore');
 console.log('✓ MK / EN language switching without changing world');
 if(process.env.TRIALUM_LOCALE_AUDIT){
  await w.TrialumI18n.change('en');
  for(const page of ['lab','habitats','pets','research','more','dna','food','plants','friends','achievements','diary','notifications','settings']){
   click(page);w.TrialumI18n.translateDOM(d.getElementById('tabContent'));
   const copy=d.getElementById('tabContent').cloneNode(true);
   copy.querySelectorAll('.log-entry,.chat-message,.pet-option').forEach(n=>n.remove());
   const words=(copy.textContent.match(/[А-Яа-яЀ-ӿ]{3,}/g)||[]);
   console.log('LOCALE_AUDIT',page,words.length,[...new Set(words)].slice(0,38).join(' | '));
  }
 }

 assert.equal(errors.length,0,'Browser runtime errors: '+errors.join('\n'));
 dom.window.close();
 console.log('TRIALUM v1.4.1 UI: 11 menus + debug + diary filtering PASS');
}
run().catch(e=>{console.error(e);process.exit(1)});
