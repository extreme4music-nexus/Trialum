'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const ROOM='b6c2fb13-9940-4741-812a-d08c5ec82ac1';
const SESSION='d59a352e-87b2-4cf8-99d7-f7ae924273db';
const pet={id:'pet_1',name:'Синапсо',species:4,playgroundAiLocal:true,playgroundAiShared:true};
const world={selectedPet:pet.id,pets:[pet],research:{level:6}};
const sent=[],generated=[],cancelled=[];
let saves=0;
let modelStatus='installed',sharedEnabled=true;
const state={active:true,online:true,aiRelayEnabled:true,selected:ROOM,
 snapshot:{presenceEnabled:true,room:{id:ROOM},
 occupants:[{pet:{id:pet.id,name:pet.name}},{pet:{id:'other',name:'Другар'}}]},
 presences:[{petId:pet.id,sessionId:SESSION,kind:'shared',roomId:ROOM}]};
globalThis.document={visibilityState:'visible',hidden:false,addEventListener(){}};
globalThis.TrialumEngine={SPECIES:Array.from({length:16},(_,i)=>({name:'Species '+i})),
 currentPet:s=>s.pets.find(p=>p.id===s.selectedPet),
 evolutionProgress:()=>({level:22})};
globalThis.TrialumPresence={LOCAL:'local_playground',SHARED:'shared_playground',
 isAt:()=>true,get:()=>({kind:'shared_playground',status:'active',ref:ROOM,sessionId:SESSION})};
globalThis.TrialumAndroid={modelStatus:()=>modelStatus,
 askPlaygroundAi:(id,name,text,context)=>generated.push({id,name,text,context}),
 cancelPlaygroundAi:()=>cancelled.push('cancel')};
let locked=false;
globalThis.TrialumLocalChat={busy:()=>locked,begin:()=>{if(locked)return false;locked=true;return true;},
 finish:()=>{locked=false;}};
globalThis.TrialumPlayground={localDialogue:()=>({speaker:'Другар',text:'Што ќе играме?'})};
globalThis.TrialumShared={getWorld:()=>world,getState:()=>({...state,aiRelayEnabled:sharedEnabled}),
 sendPetSpeech:(s,p,text)=>{sent.push({s,p,text});return true;}};
globalThis.TrialumSharedScene={dialogue:()=>({ids:[pet.id,'other'],turn:0,text:'Сакаш да играме?'}),
 refreshCaption:()=>{}};
globalThis.TrialumPlaygroundMemory=require('../js/playground-memory.js');
require('../js/playground-ai.js');
const AI=globalThis.TrialumPlaygroundAI;
AI.setSave(()=>saves++);
test('mini AI has the same earned evolution gate and stays opt-in',()=>{
 assert.equal(AI.gate(world,pet),true);
 world.research.level=5;assert.equal(AI.gate(world,pet),false);
 world.research.level=6;
 modelStatus='not-installed';assert.equal(AI.modelAvailable(),false);
 modelStatus='installed';
});
test('local mini replaces only visible speech, never XP, and stops on tab change',()=>{
 AI.setTab('playground');const before=JSON.stringify({research:world.research,petXP:pet.xp,petActions:pet.actionsLeft});
 AI.tick(world,'playground');
 assert.equal(generated.length,1);
 assert.match(generated[0].text,/Што ќе играме/);
 assert.equal(AI.onModelEvent({kind:'playgroundReply',petId:pet.id,text:'Ајде на лизгалка! Потоа ќе истражуваме.'}),true);
 assert.equal(AI.speech('playground').text,'Ајде на лизгалка!','only first short sentence is spoken');
 assert.equal(JSON.stringify({research:world.research,petXP:pet.xp,petActions:pet.actionsLeft}),before,
  'AI does not mutate XP, actions or gameplay state');
 assert(pet.playgroundAiMemories?.length>0,'the pet preserves only a thematic note');
 assert(saves>0,'the compact memory is sent to ordinary game-state saving');
 assert(!JSON.stringify(pet.playgroundAiMemories).includes('Потоа ќе истражуваме'),
  'no verbatim transcript leaks into JSON backup');
 AI.setTab('pets');
 assert.equal(AI.speech('playground'),null);
 document.visibilityState='hidden';document.hidden=true;
 AI.tick(world,'playground');
 assert.equal(generated.length,1,'no background generation');
 document.visibilityState='visible';document.hidden=false;
});
test('shared mini generation is routed only to current verified room, non-AI fallback remains',()=>{
 AI.setTab('shared');AI.tick(world,'shared');
 assert.equal(generated.length,2);
 assert.equal(AI.onModelEvent({kind:'playgroundReply',petId:pet.id,text:'Здраво, пријателче!'}),true);
 assert.equal(sent.length,1);assert.equal(sent[0].text,'Здраво, пријателче!');
 assert.equal(AI.speech('shared',ROOM).text,'Здраво, пријателче!');
 assert.equal(AI.speech('shared','wrong-room'),null);
 const before=generated.length;AI.stop();
 pet.playgroundAiShared=false;
 AI.tick(world,'shared');
 assert.equal(generated.length,before,'users without AI keep simulated speech');
 assert(sent.length>=2,'a simulated pet can still supply a bounded room line');
 AI.stop();pet.playgroundAiShared=true;
 sharedEnabled=false;AI.tick(world,'shared');
 assert.equal(generated.length,before,'no AI when server has not opted into the relay');
 sharedEnabled=true;
});
test('real room messages are only shown in currently visible authorized room',()=>{
 AI.setTab('shared');
 const yes=AI.onPeerSpeech({type:'pet_speech',roomId:ROOM,petId:'other',speaker:'Другар',text:'Еј, здраво!'});
 assert.equal(yes,true);assert.equal(AI.speech('shared',ROOM).text,'Еј, здраво!');
 assert.equal(AI.onPeerSpeech({type:'pet_speech',roomId:'forged',petId:'other',text:'No'}),false);
 AI.setTab('lab');
 assert.equal(AI.onPeerSpeech({type:'pet_speech',roomId:ROOM,petId:'other',text:'No'}),false);
});
