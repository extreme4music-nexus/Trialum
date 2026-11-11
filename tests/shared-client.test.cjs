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

test('LW-A all confirmed shared pets renew independently, while visits do not',async()=>{
 const oldFetch=globalThis.fetch,oldAndroid=globalThis.TrialumAndroid,
  oldSocial=globalThis.TrialumSocial,oldWebSocket=globalThis.WebSocket,
  oldPresence=globalThis.TrialumPresence;
 const Presence=require('../js/presence.js');
 const room='1e63f61a-0641-43b5-884b-01f30d68cb3b';
 const sessions=[
  '6baf8d17-ed0c-4073-86dc-480f5dfb1541',
  '6576887e-e3f4-4f4f-a85e-4ad08960afad',
  '1d85d86b-c414-4f0d-a6a0-d630bb308b18'
 ];
 const expiresAt=new Date(Date.now()+5000).toISOString();
 const rows=[
  {petId:'pet-1',sessionId:sessions[0],kind:'shared',roomId:room,expiresAt},
  {petId:'pet-2',sessionId:sessions[1],kind:'shared',roomId:room,expiresAt},
  {petId:'pet-3',sessionId:sessions[2],kind:'visit',
   visitId:'83d7e64b-24c0-4ea8-b668-8050fe7c8b2d',expiresAt}
 ];
 const world={pets:rows.map((p,i)=>({id:p.petId,
  presence:{version:1,kind:i===2?Presence.VISIT:Presence.SHARED,
   status:'active',sessionId:p.sessionId,ref:i===2?p.visitId:room,startedAt:1000}}))};
 const renewed=[];
 globalThis.TrialumPresence=Presence;
 globalThis.WebSocket=undefined;
 globalThis.TrialumAndroid={socialApiUrl:()=>'https://test.ts.net',
  socialCredential:()=> 'z'.repeat(43)};
 globalThis.TrialumSocial={getState:()=>({identity:{id:'tester',nickname:'Owner'},friends:[]})};
 globalThis.fetch=async(url,options={})=>{
  const path=new URL(url).pathname;let value;
  if(path.endsWith('/status'))value={ready:true,presenceEnabled:true};
  else if(path.endsWith('/presence'))value={presence:rows};
  else if(path.endsWith('/rooms'))value={rooms:[{id:room,title:'Friend space'}]};
  else if(path.endsWith('/invitations'))value={invitations:[]};
  else if(path.endsWith('/visits'))value={visits:[]};
  else if(path.endsWith('/snapshot'))value={room:{id:room,title:'Friend space',
    tier:1,role:'member',ownerId:'owner'},members:[],toys:['sandbox'],events:[],points:0,
    occupants:[],visitors:[],presenceEnabled:true};
  else if(path.endsWith('/presence/renew')){
   const body=JSON.parse(options.body);renewed.push(body);
   value={renewed:true,expiresAt:new Date(Date.now()+2*60*60*1000).toISOString()};
  }
  assert(value,'unexpected request '+path);
  return {ok:true,status:200,json:async()=>value};
 };
 try{
  sh.render(world);sh.activate();
  for(let i=0;i<60&&renewed.length<2;i++)await new Promise(resolve=>setTimeout(resolve,5));
  assert.deepEqual(renewed.map(x=>x.petId).sort(),['pet-1','pet-2']);
  assert(renewed.every(x=>x.roomId===room));
  assert.equal(renewed.some(x=>x.petId==='pet-3'),false);
  assert.equal(world.pets[2].presence.kind,Presence.VISIT,'visit remains server-managed');
 }finally{
  sh.deactivate();globalThis.fetch=oldFetch;globalThis.TrialumAndroid=oldAndroid;
  globalThis.TrialumSocial=oldSocial;globalThis.WebSocket=oldWebSocket;
  globalThis.TrialumPresence=oldPresence;
 }
});
