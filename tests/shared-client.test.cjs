const test=require('node:test'),assert=require('node:assert/strict');
let calls=0;
globalThis.fetch=()=>{calls++;throw Error('unconsented outbound fetch')};
globalThis.TrialumAndroid={socialApiUrl:()=> 'https://test.ts.net',socialCredential:()=>''};
globalThis.TrialumSocial={getState:()=>({identity:null,friends:[]})};
globalThis.TrialumEngine={SPECIES:[{shape:'jelly'}]};
require('../js/shared-playground.js');
const sh=globalThis.TrialumShared;
test('no social credential -> zero multiplayer network requests',()=>{
 sh.activate();
 assert.equal(sh.getState().enabled,false);
 assert.equal(calls,0);
 assert.match(sh.render({pets:[]}),/Пријатели|приватен профил/);
 sh.deactivate();
});
test('cosmetic pet profile omits XP, currency, chats, owner secrets',()=>{
 const pet={id:'pet-1',name:'Лумира',species:0,hue:180,eyes:2,growth:55,seed:54,
   shape:'jelly',skills:{dialogue:20},xp:999999,currency:100000,credential:'secret',chats:['private']};
 const v=sh.profile(pet),text=JSON.stringify(v);
 assert.deepEqual(Object.keys(v).sort(),['eyes','growth','hue','id','name','seed','shape','species']);
 assert(!text.includes('secret')&&!text.includes('999999')&&!text.includes('private'));
 assert.equal(v.name,'Лумира');
});

test('shared scene renders two authenticated friends from same server snapshot',()=>{
 const oldArt=globalThis.TrialumCreatureArt;
 const seen=[];
 globalThis.TrialumCreatureArt={draw:(_ctx,p)=>{seen.push(p.id);}};
 require('../js/shared-scene.js');
 const noop=()=>{};
 const ctx=new Proxy({createLinearGradient:()=>({addColorStop:noop})},
  {get(target,key){return key in target?target[key]:noop;},set(target,key,value){target[key]=value;return true;}});
 const snapshot={toys:['sandbox'],events:[],visitors:[],presenceEnabled:true,
  occupants:[
   {pet:{id:'owner-pet',name:'Мое',species:0,hue:160,seed:1},display:'Owner'},
   {pet:{id:'friend-pet',name:'Пријател',species:1,hue:220,seed:2},display:'Friend'}
  ]};
 try{
  globalThis.TrialumSharedScene.draw(ctx,snapshot,5);
  assert.deepEqual(seen,['owner-pet','friend-pet']);
 }finally{globalThis.TrialumCreatureArt=oldArt;}
});

test('accepting a friend room invitation selects that exact shared room',async()=>{
 const oldFetch=globalThis.fetch,oldAndroid=globalThis.TrialumAndroid,
  oldSocial=globalThis.TrialumSocial,oldWebSocket=globalThis.WebSocket;
 const friendRoom='75d87d3a-8110-441f-942a-4ff0c6dc849a';
 const ownRoom='30a07321-6c48-4c2b-9584-c5d447a50a01';
 const invitation='26eeb675-7a25-4329-8f0c-9950e4f6f27b';
 globalThis.WebSocket=undefined;
 globalThis.TrialumAndroid={socialApiUrl:()=>'https://test.ts.net',
  socialCredential:()=> 'z'.repeat(43)};
 globalThis.TrialumSocial={getState:()=>({identity:{id:'member-1',nickname:'Member'},friends:[]})};
 let accepted=false;
 const world={pets:[],selectedPet:null};
 globalThis.fetch=async(url)=>{
  const path=new URL(url).pathname;
  let value=null;
  if(path.endsWith('/status'))value={ready:true,presenceEnabled:true};
  else if(path.endsWith('/presence'))value={presence:[]};
  else if(path.endsWith('/rooms'))value={rooms:[{id:ownRoom,title:'My space'},...(accepted?[{id:friendRoom,title:'Friend space'}]:[])]};
  else if(path.endsWith('/invitations'))value={invitations:accepted?[]:[{id:invitation}]};
  else if(path.endsWith('/visits'))value={visits:[]};
  else if(path.endsWith('/'+invitation+'/accept')){accepted=true;value={status:'accepted',roomId:friendRoom};}
  else if(path.endsWith('/snapshot'))value={room:{id:path.split('/').at(-2),title:'Space',
   tier:1,role:'member',ownerId:'owner'},members:[],toys:['sandbox'],events:[],points:0,
   occupants:[],visitors:[],presenceEnabled:true};
  assert(value, 'Unexpected API request '+path);
  return {ok:true,status:200,json:async()=>value};
 };
 try{
  sh.render(world);sh.activate();
  for(let i=0;i<30&&!sh.getState().ready;i++)await new Promise(resolve=>setTimeout(resolve,5));
  assert.equal(sh.getState().selected,ownRoom);
  const result=await sh.decision(invitation,true);
  assert.equal(result.status,'accepted');
  assert.equal(sh.getState().selected,friendRoom);
  assert.equal(sh.getState().snapshot.room.id,friendRoom);
 }finally{
  sh.deactivate();
  globalThis.fetch=oldFetch;globalThis.TrialumAndroid=oldAndroid;
  globalThis.TrialumSocial=oldSocial;globalThis.WebSocket=oldWebSocket;
 }
});
