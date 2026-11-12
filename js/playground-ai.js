/* Optional on-device mini-GGUF playground speech. Never generates in background.
 * The shared server relays ephemeral short text only, never runs inference.
 * No XP, currency, new permission, hidden network prompt, or chat persistence. */
(function(root){
'use strict';
const E=()=>root.TrialumEngine, Presence=()=>root.TrialumPresence;
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let currentTab='',pending=null,latestLocal=null,latestShared=null,queued=null;
let saveMemory=()=>{};
const Memory=()=>root.TrialumPlaygroundMemory;
function storeMemory(p,data){if(Memory()?.remember?.(p,data))saveMemory();}
const lastAttempt=Object.create(null),lastSimulation=Object.create(null);
function gate(s,p){
 const species=Number(p?.species),evolved=Number.isInteger(species)&&species>=4&&!!E()?.SPECIES?.[species];
 return !!(evolved&&E()?.evolutionProgress?.(p)?.level>=22&&(s?.research?.level||0)>=6);
}
function modelAvailable(){
 try{return root.TrialumAndroid?.modelStatus?.()==='installed';}catch(_){return false;}
}
function active(scope){
 return currentTab===scope&&root.document?.visibilityState!=='hidden'&&!root.document?.hidden;
}
function enabled(s,p,scope){
 return gate(s,p)&&!!p?.[scope==='shared'?'playgroundAiShared':'playgroundAiLocal']&&modelAvailable();
}
function speech(scope,roomId){
 if(!active(scope))return null;
 const item=scope==='shared'?latestShared:latestLocal;
 if(!item||Date.now()-item.at>14000)return null;
 if(scope==='shared'&&item.roomId!==roomId)return null;
 return {speaker:item.speaker,text:item.text,partner:item.partner||null,ai:!!item.ai};
}
function control(s,p,scope,present){
 if(!p||!present)return '';
 const ok=gate(s,p),installed=modelAvailable(),
  on=!!p[scope==='shared'?'playgroundAiShared':'playgroundAiLocal'];
 if(!ok)return '<p class="small subtle">🔒 AI во игротека: Синапсо+, лично ниво 22 и лабораторија 6. Симулираните разговори остануваат достапни.</p>';
 const permitted=scope!=='shared'||root.TrialumShared?.getState?.()?.aiRelayEnabled;
 let html='<div class="card"><h3>🧠 Изборен локален AI во игротеката</h3>'+
 '<p class="small">Мини-моделот разговара само додека овој екран е видлив. Без модел, игротеката продолжува нормално. Нема AI XP.</p>';
 if(scope==='shared')html+='<p class="small">Кога е вклучен, кратките реплики се испраќаат до присутните членови на оваа приватна игротека. Не се приватни или шифрирани пораки.</p>';
 if(!permitted)html+='<p class="small">Серверската поддршка за AI разговори сè уште не е активирана. Симулираниот разговор работи.</p>';
 if(!installed)html+='<p class="small">Прво преземи го бесплатниот SmolLM2-135M во панелот на миленичето.</p>';
 html+='<button data-do="pgAiToggle" data-scope="'+scope+'"'+(!permitted||(!installed&&!on)?' disabled':'')+'>'+
 (on?'🔕 Исклучи AI за ова милениче':'🧠 Вклучи мини AI за ова милениче')+'</button>'+
 (Memory()?.read?.(p)?.length?'<p class="small">🧠 '+esc(Memory()?.overview?.(p)||'')+'</p><button data-do="pgAiForget">🗑 Избриши контекстуални сеќавања</button>':'')+'</div>';
 return html;
}
function toggle(s,scope,notify,save,render){
 if(scope!=='shared'&&scope!=='playground')return false;
 const p=E()?.currentPet?.(s);
 if(!p||!gate(s,p)){notify?.('Прво отклучи го мини AI за ова милениче.');return true;}
 const field=scope==='shared'?'playgroundAiShared':'playgroundAiLocal';
 if(!p[field]){
  if(!modelAvailable()){notify?.('Прво преземи го мини моделот од панелот на миленичето.');return true;}
  if(scope==='shared'){
   if(!root.TrialumShared?.getState?.()?.aiRelayEnabled){notify?.('AI преносот не е вклучен на серверот.');return true;}
   if(root.confirm&&!root.confirm('Дозволуваш кратки AI реплики на ова милениче да се пренесуваат до присутните членови на приватната игротека? Ова не е приватен шифриран разговор.'))return true;
  }
 }
 p[field]=!p[field];
 if(!p[field])stop();
 save?.();render?.();
 return true;
}
function forget(s,notify,save,render){
 const p=E()?.currentPet?.(s);
 if(!p||!Memory()?.read?.(p)?.length)return false;
 if(root.confirm&&!root.confirm('Да ги избришам сите тематски сеќавања на ова милениче од игротеките? Ова не ги менува XP и дневникот.'))return true;
 Memory().clear(p);save?.();render?.();notify?.('Контекстуалните сеќавања се избришани.');return true;
}
function stop(){
 if(pending){root.TrialumAndroid?.cancelPlaygroundAi?.();root.TrialumLocalChat?.finish?.(pending.petId);}
 pending=null;queued=null;
 latestLocal=null;latestShared=null;
}
function setTab(tab){
 if(tab!==currentTab){stop();currentTab=tab;}
}
function sanitize(text){
 const raw=String(text||'').replace(/<[^>]*>/g,'').split(/[\r\n]/)[0].trim();
 if(!raw||/https?:\/\/|www\.|\S+@\S+|\+?\d[\d ().-]{7,}\d|[\u0000-\u001f\u007f]/i.test(raw))return '';
 // The tiny model may ignore a length instruction. Enforce one short line at
 // the client boundary before display, relay or thematic summarization.
 const punctuation=/[.!?…。！？]/u.exec(raw);
 const sentence=(punctuation?raw.slice(0,punctuation.index+1):raw).slice(0,112);
 return sentence.split(/\s+/u).slice(0,17).join(' ').trim();
}
function attempt(s,p,scope,prompt,roomId='',sessionId='',meta={}){
 const now=Date.now(),key=scope+'|'+p.id;
 if(pending||!enabled(s,p,scope)||now-(lastAttempt[key]||0)<24000||!active(scope))return;
 if(root.TrialumLocalChat?.busy?.()||!root.TrialumAndroid?.askPlaygroundAi)return;
 if(!root.TrialumLocalChat?.begin?.(p.id))return;
 lastAttempt[key]=now;
 const context=JSON.stringify({language:root.TrialumI18n?.language?.()||'mk',
  species:E()?.SPECIES?.[p.species]?.name||'',mode:'fictional_playground',
  memories:Memory()?.recall?.(p,'',now)?.records?.slice(-2)||[],
  oneShortSentence:true}).slice(0,650);
 pending={petId:p.id,petName:String(p.name||'Милениче'),scope,roomId,sessionId,at:now,
  heard:String(meta.heard||'').slice(0,130),companion:String(meta.companion||'').slice(0,32)};
 try{root.TrialumAndroid.askPlaygroundAi(p.id,p.name,String(prompt).slice(0,320),context);}
 catch(_){root.TrialumLocalChat?.finish?.(p.id);pending=null;}
}
function tick(s,tab){
 if(tab!==currentTab)setTab(tab);
 if(!active(tab)||!s)return;
 if(pending&&Date.now()-pending.at>90000){root.TrialumAndroid?.cancelPlaygroundAi?.();root.TrialumLocalChat?.finish?.(pending.petId);pending=null;}
 if(pending)return;
 if(tab==='playground'){
  const p=E()?.currentPet?.(s);
  if(!p||!Presence()?.isAt?.(s,p.id,Presence().LOCAL)||!enabled(s,p,tab))return;
  const d=root.TrialumPlayground?.localDialogue?.(s,p);
  const stimulus=d?.speaker!==p.name?d?.text:'';
  attempt(s,p,tab,stimulus?
   'A fellow creature just said: "'+stimulus.slice(0,100)+'". Reply as '+p.name+' in one playful short sentence.':
   'Say one spontaneous playful thought about exploring toys in the playground.',
   '','',{heard:stimulus,companion:stimulus?d.speaker:''});
 }else if(tab==='shared'){
  const state=root.TrialumShared?.getState?.(),p=E()?.currentPet?.(s);
  if(!state?.online||!state.aiRelayEnabled||!state.snapshot?.presenceEnabled||!p||!state.selected)return;
  const loc=Presence()?.get?.(s,p.id);
  const lease=state.presences?.find(x=>x.petId===p.id&&x.sessionId===loc?.sessionId&&x.kind==='shared'&&x.roomId===state.selected);
  const guests=state.snapshot.occupants||[];
  if(!lease||loc?.status!=='active'||guests.length<2)return;
  if(!enabled(s,p,tab)){
   // Non-AI pets retain their existing rule-driven speech. Occasionally relay
   // their OWN line so an AI pet on another phone has a real incoming message.
   const sample=root.TrialumSharedScene?.dialogue?.(state.snapshot);
   const key=state.selected+'|'+p.id;
   if(sample?.ids?.[sample.turn%2]===p.id&&Date.now()-(lastSimulation[key]||0)>22000){
    if(root.TrialumShared?.sendPetSpeech?.(s,p,sample.text)){lastSimulation[key]=Date.now();}
   }
   return;
  }
  const input=queued?.roomId===state.selected&&queued?.petId!==p.id&&Date.now()-queued.at<30000?queued:null;
  queued=null;
  attempt(s,p,tab,input?
   'Your friend '+input.speaker.slice(0,30)+' said: "'+input.text.slice(0,130)+'". Reply naturally in one short safe sentence.':
   'You are meeting another friendly fictional creature in the playground. Say one new short friendly sentence.',
   state.selected,loc.sessionId,{heard:input?.text||'',companion:input?.speaker||''});
 }
}
function onPeerSpeech(message){
 if(!active('shared')||!message||message.type!=='pet_speech')return false;
 const state=root.TrialumShared?.getState?.();
 if(!state?.online||!state.aiRelayEnabled||message.roomId!==state.selected)return false;
 if(!(state.snapshot?.occupants||[]).some(x=>x.pet?.id===message.petId))return false;
 const text=sanitize(message.text);if(!text)return false;
 latestShared={speaker:String(message.speaker||'Милениче').slice(0,32),
  text,petId:message.petId,roomId:message.roomId,at:Date.now(),ai:false};
 const world=root.TrialumShared?.getWorld?.(),p=E()?.currentPet?.(world);
 if(p?.id!==message.petId){
  queued={text,petId:message.petId,roomId:message.roomId,speaker:latestShared.speaker,at:Date.now()};
  const loc=world&&Presence()?.get?.(world,p?.id);
  if(p&&enabled(world,p,'shared')&&loc?.kind===Presence()?.SHARED&&loc?.status==='active'&&
   loc.ref===state.selected&&state.presences?.some(x=>x.petId===p.id&&x.sessionId===loc.sessionId))
   storeMemory(p,{place:'shared',companion:latestShared.speaker,heard:text});
 }
 root.TrialumSharedScene?.refreshCaption?.(state.snapshot);
 return true;
}
function onModelEvent(event){
 if(!pending||event?.petId!==pending.petId)return false;
 const kind=String(event.kind||'');
 if(!['playgroundReply','error','status'].includes(kind))return false;
 if(kind==='status'){
  if(event.text==='Model is already generating.'){root.TrialumLocalChat?.finish?.(pending.petId);pending=null;}
  return true;
 }
 const job=pending;pending=null;root.TrialumLocalChat?.finish?.(job.petId);
 if(kind==='error'||!active(job.scope))return true;
 const text=sanitize(event.text),s=root.TrialumShared?.getWorld?.();
 if(!text)return true;
 if(job.scope==='shared'){
  const st=root.TrialumShared?.getState?.(),p=s?.pets?.find(x=>x.id===job.petId);
  const loc=p&&Presence()?.get?.(s,p.id);
  if(!p||!enabled(s,p,'shared')||!st?.online||!st.aiRelayEnabled||job.roomId!==st.selected||
   !st.presences.some(x=>x.petId===p.id&&x.sessionId===job.sessionId&&x.roomId===job.roomId)||
   loc?.sessionId!==job.sessionId)return true;
  latestShared={speaker:job.petName,text,roomId:job.roomId,at:Date.now(),ai:true};
  storeMemory(p,{place:'shared',companion:job.companion,heard:job.heard,said:text});
  root.TrialumShared?.sendPetSpeech?.(s,p,text);
  root.TrialumSharedScene?.refreshCaption?.(st.snapshot);
 }else{
  const p=s?.pets?.find(x=>x.id===job.petId);
  if(!p||!enabled(s,p,'playground')||!Presence()?.isAt?.(s,p.id,Presence().LOCAL))return true;
  latestLocal={speaker:job.petName,text,at:Date.now(),ai:true};
  storeMemory(p,{place:'local',companion:job.companion,heard:job.heard,said:text});
  root.TrialumPlayground?.refreshProgress?.(s);
 }
 return true;
}
root.document?.addEventListener?.('visibilitychange',()=>{if(root.document?.visibilityState==='hidden')stop();});
root.TrialumPlaygroundAI={gate,modelAvailable,enabled,control,toggle,forget,stop,setTab,tick,speech,onPeerSpeech,onModelEvent,
 setSave(fn){saveMemory=typeof fn==='function'?fn:()=>{};}};
})(typeof globalThis!=='undefined'?globalThis:this);
