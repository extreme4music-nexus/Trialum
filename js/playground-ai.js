/* Optional on-device mini-GGUF playground speech. Background uses its own opt-in native service.
 * The shared server relays ephemeral short text only, never runs inference.
 * No XP, currency, new permission, hidden network prompt, or chat persistence. */
(function(root){
'use strict';
const E=()=>root.TrialumEngine, Presence=()=>root.TrialumPresence;
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let currentTab='',pending=null,latestLocal=null,latestShared=null,localSessionKey='';
const roomHistory=[],lastInitiation=Object.create(null);
const Sessions=()=>root.TrialumDialogueSessions;
// Only completed local-model outputs count as AI; scripted topic nudges are
// bounded to one in ten successful turns per enabled pet and playground.
const turnMix=Object.create(null);
function mixFor(scope,p){
 const key=scope+'|'+p.id;
 return turnMix[key]||(turnMix[key]={ai:0,scripted:0});
}
function shouldInject(scope,p){
 const mix=mixFor(scope,p);
 return (mix.ai+mix.scripted+1)%10===0;
}
function counted(scope,p,kind){mixFor(scope,p)[kind]++;}
function diagnostics(scope,p){
 const mix=p?mixFor(scope,p):{ai:0,scripted:0};
 return {llm:mix.ai,scripted:mix.scripted};
}

let saveMemory=()=>{};
let lastBackgroundImport=0;
function importBackground(s){
 const native=root.TrialumAndroid,mem=Memory();
 if(!s?.pets||!native?.backgroundAiMemories||!mem?.ingestBackground)return false;
 let changed=false;
 for(const p of s.pets){
  if(!p?.id||!gate(s,p))continue;
  try{
   const data=JSON.parse(native.backgroundAiMemories(p.id));
   if(mem.ingestBackground(p,data))changed=true;
  }catch(_){/* Invalid/nonexistent native observations cannot modify world. */}
 }
 if(changed)saveMemory();
 return changed;
}

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
// Suppress the rapid 3.5/4-second screenplay while THIS pet's opted-in
// model owns the room's dialogue. Offline, uninstalled and disabled AI keep
// the original scripted simulation. No fake AI for remote clients.
function suppressSimulation(scope,s,p,roomId=''){
 if(!active(scope)||!s)return false;
 const pet=p||E()?.currentPet?.(s);
 if(!pet||!enabled(s,pet,scope))return false;
 if(scope==='playground')return !!Presence()?.isAt?.(s,pet.id,Presence().LOCAL);
 if(scope!=='shared')return false;
 const state=root.TrialumShared?.getState?.(),loc=Presence()?.get?.(s,pet.id);
 return !!(state?.online&&state?.aiRelayEnabled&&state?.snapshot?.presenceEnabled&&
  state.selected===roomId&&loc?.kind===Presence()?.SHARED&&
  loc.status==='active'&&loc.ref===roomId&&
  state.presences?.some(x=>x.petId===pet.id&&x.sessionId===loc.sessionId&&
   x.kind==='shared'&&x.roomId===roomId));
}
function speech(scope,roomId){
 if(!active(scope))return null;
 const item=scope==='shared'?latestShared:latestLocal;
 if(!item)return null;
 if(scope==='shared'&&item.roomId!==roomId)return null;
 return {speaker:item.speaker,text:item.text,partner:item.partner||null,ai:!!item.ai};
}
function control(s,p,scope,present){
 if(!p||!present)return '';
 const ok=gate(s,p),installed=modelAvailable(),
  on=!!p[scope==='shared'?'playgroundAiShared':'playgroundAiLocal'];
 const nativeBackground=!!root.TrialumAndroid?.backgroundAiStatus?.();
 if(!ok)return '<p class="small subtle">🔒 AI во игротека: Синапсо+, лично ниво 22 и лабораторија 6. Симулираните разговори остануваат достапни.</p>';
 const permitted=scope!=='shared'||root.TrialumShared?.getState?.()?.aiRelayEnabled;
 let html='<div class="card"><h3>🧠 Изборен локален AI во игротеката</h3>'+
 '<p class="small">Мини AI по правило разговара додека екранот е видлив; со твоја дозвола може да продолжи и во заднина. Без модел, играта продолжува. Нема AI XP.</p>';
 if(scope==='shared')html+='<p class="small">Кога е вклучен, кратките реплики се испраќаат до присутните членови на оваа приватна игротека. Не се приватни или шифрирани пораки.</p>';
 if(!permitted)html+='<p class="small">Серверската поддршка за AI разговори сè уште не е активирана. Симулираниот разговор работи.</p>';
 if(!installed)html+='<p class="small">Прво преземи го бесплатниот SmolLM2-135M во панелот на миленичето.</p>';
 if(scope==='shared'){
  const state=root.TrialumShared?.getState?.();
  const translated=!!state?.speechTranslationEnabled&&
   state.speechTranslationLanguages?.includes(root.TrialumI18n?.language?.()||'mk');
  if(state?.speechTranslationEnabled&&!translated)
   html+='<p class="small">🌍 Преводите во оваа фаза се достапни само на македонски, албански и англиски.</p>';
  if(!translated)html+='<p class="small">🌍 За background AI прво е потребен приватен серверски преведувач на англиски.</p>';
  if(on&&translated){
   html+='<p class="small">📱 Изборно: продолжи го AI разговорот во заднина со видливо Android известување и копче Stop AI. Се запира при штедење батерија или мала батерија; Android може да го прекине сервисот.</p>';
   html+='<button data-do="pgAiBackgroundToggle"'+(!installed?' disabled':'')+'>'+
    (nativeBackground?'⏹ Исклучи AI во заднина':
     p.playgroundAiBackgroundShared?'▶ Повторно активирај AI во заднина':'📱 Вклучи AI во заднина')+
    '</button>';
  }
 }
 if(on){
  const mix=diagnostics(scope,p);
  const t=label=>root.TrialumI18n?.t?.(label)||label;
  html+='<p class="small subtle">'+t('🧪 QA · вистински локални LLM реплики:')+' '+mix.llm+
   t(' · контролирани симулирани:')+' '+mix.scripted+
   t(' (цел 90/10; без скриени транскрипти)')+'</p>';
 }
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
 if(!p[field]){
  if(scope==='shared'&&p.playgroundAiBackgroundShared){
   root.TrialumAndroid?.setPlaygroundBackgroundAi?.(false,'','','','');
   p.playgroundAiBackgroundShared=false;
  }
  stop();
 }
 save?.();render?.();
 return true;
}
function toggleBackground(s,notify,save,render){
 const p=E()?.currentPet?.(s),st=root.TrialumShared?.getState?.(),n=root.TrialumAndroid;
 if(!p||!gate(s,p)||!p.playgroundAiShared||!modelAvailable()||
   !st?.speechTranslationEnabled||
   !st?.speechTranslationLanguages?.includes(root.TrialumI18n?.language?.()||'mk')||
   !st?.online||!st?.selected){
  notify?.('За AI во заднина се потребни активен мини-модел, игротека и серверско преведување.');
  return true;
 }
 if(!n?.setPlaygroundBackgroundAi||!n?.backgroundAiStatus){
  notify?.('AI во заднина бара нова Android апликација.');
  return true;
 }
 if(p.playgroundAiBackgroundShared&&n.backgroundAiStatus()){
  n.setPlaygroundBackgroundAi(false,'','','','');
  p.playgroundAiBackgroundShared=false;
  save?.();render?.();return true;
 }
 const loc=Presence()?.get?.(s,p.id);
 if(loc?.kind!==Presence()?.SHARED||loc?.status!=='active'||loc.ref!==st.selected||
   !st.presences?.some(x=>x.petId===p.id&&x.sessionId===loc.sessionId)){
  notify?.('Прво испрати го миленичето во активната заедничка игротека.');return true;
 }
 if(root.confirm&&!root.confirm('Да продолжи локалниот мини AI со приватни разговори во заднина? Android прикажува известување со Stop AI. Се користи батеријата и интернетот; системот може да го прекине сервисот.'))return true;
 if(!n.setPlaygroundBackgroundAi(true,st.selected,p.id,loc.sessionId,p.name||'Pet')){
  notify?.('Провери ја Android дозволата за известувања и повторно притисни.');return true;
 }
 p.playgroundAiBackgroundShared=true;
 save?.();render?.();notify?.('AI во заднина е побаран. Провери го Android известувањето.');
 return true;
}
function forget(s,notify,save,render){
 const p=E()?.currentPet?.(s);
 if(!p||!Memory()?.read?.(p)?.length)return false;
 if(root.confirm&&!root.confirm('Да ги избришам сите тематски сеќавања на ова милениче од игротеките? Ова не ги менува XP и дневникот.'))return true;
 Memory().clear(p);
 root.TrialumAndroid?.clearBackgroundAiMemories?.(p.id);
 delete p.playgroundAiBackgroundSeen;
 delete p.playgroundAiBackgroundStreamId;
 delete p.playgroundAiBackgroundRevision;
 save?.();render?.();notify?.('Контекстуалните сеќавања се избришани.');return true;
}
function stop(){
 if(pending){root.TrialumAndroid?.cancelPlaygroundAi?.();root.TrialumLocalChat?.finish?.(pending.petId);}
 pending=null;queued=null;
 latestLocal=null;latestShared=null; // The session ledger survives temporary tab/background transitions.
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
function choose(options){return options[Math.floor(Math.random()*options.length)];}
function scriptedSeed(scope,heard,translation){
 const text=String(heard||'').toLowerCase();
 if(scope==='shared'&&translation){
  if(/garden|plant|flower|tree|nature/.test(text))
   return choose(['What else might we discover in the garden?',
    'Shall we look for another plant together?']);
  if(/slide|toy|seesaw|jump|play/.test(text))
   return choose(['Which playground toy should we explore next?',
    'Shall we try another playful challenge together?']);
  return heard?choose(['What did you mean by that?',
   'Can you tell me more about that idea?']):'What shall we explore here?';
 }
 // Existing locale catalog is authoritative where translations exist.
 const phrases=['Ајде да играме заедно!','Сакаш да истражуваме?',
  'Што има зад таа лизгалка?'];
 const phrase=heard?'Може ли да ми кажеш повеќе за тоа?':choose(phrases);
 return root.TrialumI18n?.t?.(phrase)||phrase;
}
function injectScripted(s,p,scope,input,roomId){
 const key=scope+'|'+p.id,now=Date.now();
 if(pending||!active(scope)||!enabled(s,p,scope)||
   now-(lastAttempt[key]||0)<24000)return false;
 const translated=scope==='shared'&&!!root.TrialumShared?.getState?.()?.speechTranslationEnabled;
 const text=scriptedSeed(scope,input?.text,translated);
 if(scope==='shared'){
  if(!root.TrialumShared?.sendPetSpeech?.(s,p,text,translated?'en':'mk',
    input?.turnId||''))return false;
 }else{
  latestLocal={speaker:String(p.name||'Милениче'),text,at:now,ai:false};
  Sessions()?.receive?.('playground',localSessionKey,{id:'local-'+p.id+'-'+now,
   petId:p.id,speaker:p.name,text,replyTo:input?.turnId},now);
  root.TrialumPlayground?.refreshProgress?.(s);
 }
 lastAttempt[key]=now;
 counted(scope,p,'scripted');
 return true;
}
function attempt(s,p,scope,prompt,roomId='',sessionId='',meta={}){
 const now=Date.now(),key=scope+'|'+p.id;
 if(pending||!enabled(s,p,scope)||now-(lastAttempt[key]||0)<24000||!active(scope))return false;
 if(root.TrialumLocalChat?.busy?.()||!root.TrialumAndroid?.askPlaygroundAi)return false;
 if(!root.TrialumLocalChat?.begin?.(p.id))return false;
 lastAttempt[key]=now;
 const translated=scope==='shared'&&!!root.TrialumShared?.getState?.()?.speechTranslationEnabled;
 // Never truncate serialized JSON: native ModelRuntime must parse
 // llmLanguage="en" reliably, even after many rich room turns.
 const contextData={
  llmLanguage:translated?'en':null,
  language:translated?'en':(root.TrialumI18n?.language?.()||'mk'),
  oneShortSentence:true,mode:'fictional_playground',
  species:String(E()?.SPECIES?.[p.species]?.name||'').slice(0,24),
  // Only ephemeral playground speech is included. Never private user-pet chat.
  roomTurns:Sessions()?.context?.(scope,scope==='shared'?roomId:localSessionKey,
   null,980)||[],
  memories:Memory()?.recall?.(p,'',now)?.records?.slice(-1)||[]
 };
 let context=JSON.stringify(contextData);
 while(context.length>1450&&contextData.roomTurns.length){
  contextData.roomTurns.shift();context=JSON.stringify(contextData);
 }
 if(context.length>1450){
  contextData.memories=[];context=JSON.stringify(contextData);
 }
 if(context.length>1450){
  contextData.species='';context=JSON.stringify(contextData);
 }
 if(context.length>1450)throw Error('bounded_playground_context_exceeded');
 pending={petId:p.id,petName:String(p.name||'Милениче'),scope,roomId,sessionId,at:now,
  heard:String(meta.heard||'').slice(0,130),companion:String(meta.companion||'').slice(0,32),
  replyToTurnId:String(meta.replyToTurnId||'')};
 try{
  root.TrialumAndroid.askPlaygroundAi(p.id,p.name,String(prompt).slice(0,320),context);
  return true;
 }catch(_){root.TrialumLocalChat?.finish?.(p.id);pending=null;return false;}
}
function tick(s,tab){
 if(tab!==currentTab)setTab(tab);
 if(root.document?.visibilityState!=='hidden'&&Date.now()-lastBackgroundImport>12000){
  lastBackgroundImport=Date.now();importBackground(s);
 }
 if(!active(tab)||!s)return;
 if(pending&&Date.now()-pending.at>90000){root.TrialumAndroid?.cancelPlaygroundAi?.();root.TrialumLocalChat?.finish?.(pending.petId);pending=null;}
 if(pending)return;
 if(tab==='playground'){
  const p=E()?.currentPet?.(s);
  if(!p||!Presence()?.isAt?.(s,p.id,Presence().LOCAL)||!enabled(s,p,tab))return;
  const key=tab+'|'+p.id;
  if(Date.now()-(lastAttempt[key]||0)<24000||root.TrialumLocalChat?.busy?.())return;
  // No forced simulated subtitles while the opted-in LLM owns this pet.
  // The tenth successful line is a controlled, context-friendly nudge.
  if(shouldInject(tab,p)){injectScripted(s,p,tab,null,'');return;}
  const stimulus=latestLocal?.partner&&latestLocal.speaker!==p.name?latestLocal.text:'';
  attempt(s,p,tab,stimulus?
   'A fellow creature just said: "'+stimulus.slice(0,100)+'". Reply as '+p.name+' in one playful short sentence.':
   'Say one spontaneous playful thought about exploring toys in the playground.',
   '','',{heard:stimulus,companion:stimulus?latestLocal.speaker:''});
 }else if(tab==='shared'){
  const state=root.TrialumShared?.getState?.(),p=E()?.currentPet?.(s);
  if(!state?.online||!state.aiRelayEnabled||!state.snapshot?.presenceEnabled||!p||!state.selected)return;
  if(state.speechTranslationEnabled &&
     !state.speechTranslationLanguages?.includes(root.TrialumI18n?.language?.()||'mk'))return;
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
  const key=tab+'|'+p.id,now=Date.now();
  if(now-(lastAttempt[key]||0)<24000||root.TrialumLocalChat?.busy?.())return;
  if(state.speechTranslationEnabled&&!input){
   // Avoid endless independent greetings: ask again only after a natural pause.
   const initiationKey=state.selected+'|'+p.id;
   if(now-(lastInitiation[initiationKey]||0)<90000)return;
  }
  const started=shouldInject(tab,p)?
   injectScripted(s,p,tab,input,state.selected):
   attempt(s,p,tab,input?
    'Your friend '+input.speaker.slice(0,30)+' said: "'+input.text.slice(0,130)+'". Follow the same topic in one short friendly sentence.':
    'You are meeting another friendly fictional creature in the playground. Ask one short open question in English.',
    state.selected,loc.sessionId,{heard:input?.text||'',companion:input?.speaker||'',
     replyToTurnId:input?.turnId||''});
  // Do not discard a peer question while the local model is busy/cooling down.
  if(started){
   if(input)queued=null;
   else if(state.speechTranslationEnabled)lastInitiation[state.selected+'|'+p.id]=now;
  }
 }
}
function onPeerSpeech(message){
 if(!active('shared')||!message||message.type!=='pet_speech')return false;
 const state=root.TrialumShared?.getState?.();
 if(!state?.online||!state.aiRelayEnabled||message.roomId!==state.selected)return false;
 if(!(state.snapshot?.occupants||[]).some(x=>x.pet?.id===message.petId))return false;
 // The AI is allowed to consume English ONLY when the server has proved
 // a completed translation. Never silently treat an untranslated line as EN.
 if(state.speechTranslationEnabled&&message.translated!==true)return false;
 const text=sanitize(message.text);if(!text)return false;
 const modelText=state.speechTranslationEnabled?sanitize(message.englishText):text;
 if(!modelText)return false;
 latestShared={speaker:String(message.speaker||'Милениче').slice(0,32),
  text,petId:message.petId,roomId:message.roomId,at:Date.now(),ai:false};
 const world=root.TrialumShared?.getWorld?.(),p=E()?.currentPet?.(world);
 if(state.speechTranslationEnabled){
  roomHistory.push({speaker:latestShared.speaker,text:modelText,turnId:message.turnId});
  if(roomHistory.length>6)roomHistory.shift();
 }
 if(p?.id!==message.petId){
  queued={text:modelText,petId:message.petId,roomId:message.roomId,speaker:latestShared.speaker,
   turnId:String(message.turnId||''),at:Date.now()};
  const loc=world&&Presence()?.get?.(world,p?.id);
  if(p&&enabled(world,p,'shared')&&loc?.kind===Presence()?.SHARED&&loc?.status==='active'&&
   loc.ref===state.selected&&state.presences?.some(x=>x.petId===p.id&&x.sessionId===loc.sessionId))
   storeMemory(p,{place:'shared',companion:latestShared.speaker,heard:modelText});
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
  if(st.speechTranslationEnabled){
   // Wait for the server's localized echo before displaying this English output.
   latestShared=null;
  }else latestShared={speaker:job.petName,text,roomId:job.roomId,at:Date.now(),ai:true};
  if(root.TrialumShared?.sendPetSpeech?.(s,p,text,
    st.speechTranslationEnabled?'en':'mk',job.replyToTurnId)){
   counted('shared',p,'ai');
   storeMemory(p,{place:'shared',companion:job.companion,heard:job.heard,said:text});
  }
  root.TrialumSharedScene?.refreshCaption?.(st.snapshot);
 }else{
  const p=s?.pets?.find(x=>x.id===job.petId);
  if(!p||!enabled(s,p,'playground')||!Presence()?.isAt?.(s,p.id,Presence().LOCAL))return true;
  latestLocal={speaker:job.petName,text,at:Date.now(),ai:true};
  counted('playground',p,'ai');
  storeMemory(p,{place:'local',companion:job.companion,heard:job.heard,said:text});
  root.TrialumPlayground?.refreshProgress?.(s);
 }
 return true;
}
root.document?.addEventListener?.('visibilitychange',()=>{
 if(root.document?.visibilityState==='hidden')stop();
 else {lastBackgroundImport=0;importBackground(root.TrialumShared?.getWorld?.());}
});
root.TrialumPlaygroundAI={gate,modelAvailable,enabled,suppressSimulation,diagnostics,control,toggle,toggleBackground,forget,stop,setTab,tick,speech,onPeerSpeech,onModelEvent,
 setSave(fn){saveMemory=typeof fn==='function'?fn:()=>{};}};
})(typeof globalThis!=='undefined'?globalThis:this);
