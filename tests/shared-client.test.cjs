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
