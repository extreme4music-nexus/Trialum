const test=require('node:test'),assert=require('node:assert/strict');
const vm=require('node:vm'),fs=require('node:fs'),crypto=require('node:crypto');
const source=fs.readFileSync(require('node:path').join(__dirname,'../js/messages.js'),'utf8');
function client(credential='',calls=[]){
 const token=credential,friend='123e4567-e89b-42d3-a456-426614174000',me='223e4567-e89b-42d3-a456-426614174000';
 const w={
  crypto:crypto.webcrypto,
  setInterval(){return 1},clearInterval(){},setTimeout(fn){return 1},clearTimeout(){},
  TrialumAndroid:{
   socialApiUrl:()=> 'https://friends.example',
   socialCredential:()=>token,
   pushStatus:()=> 'unavailable',
   pushEnable(){throw Error('FCM must not auto-initialize')},
   pushDisable(){throw Error('FCM must not auto-initialize')}
  },
  TrialumSocial:{getState:()=>({identity:token?{id:me}:null,friends:[{id:friend,nickname:'Ана'}]})},
  document:{hidden:false},
  fetch:async(url,options)=>{
   calls.push({url,options});
   const status=url.endsWith('/status'),send=url.endsWith('/send');
   return {ok:true,status:200,json:async()=>send?{id:friend,duplicate:false}:status?
    {ready:true,freeTextEnabled:false,pushAvailable:false,presets:{hello:'👋 Здраво!'}}:
    {messages:[],events:[],mutes:[],pushRegistered:false}};
  }
 };
 w.globalThis=w;vm.createContext(w);vm.runInContext(source,w,{filename:'messages.js'});
 return {w,api:w.TrialumMessages,calls,friend};
}
test('no account means no network on activation and no FCM registration',()=>{
 const c=client();c.api.activate();assert.equal(c.calls.length,0);
 assert.match(c.api.render(),/Прво отвори Пријатели/);
 c.api.deactivate();
});
test('configured opt-in requests only authenticated inbox, never token in URL',async()=>{
 const c=client('X'.repeat(43));c.api.activate();
 await new Promise(resolve=>setTimeout(resolve,20));
 assert.equal(c.calls.length,2);
 assert(c.calls.every(v=>v.options.headers.Authorization==='Bearer '+'X'.repeat(43)));
 assert(c.calls.every(v=>!v.url.includes('X'.repeat(43))));
 assert.match(c.api.render(),/Готовите фрази/);
 assert.match(c.api.render(),/FCM не е конфигуриран/);
 c.api.deactivate();
});
test('reflected server nicknames and preset text are escaped in UI',async()=>{
 const c=client('Y'.repeat(43));
 c.w.TrialumSocial.getState=()=>({identity:{id:'me'},friends:[{id:c.friend,nickname:'<img src=x onerror=alert(1)>'}]});
 c.api.activate();
 await new Promise(resolve=>setTimeout(resolve,20));
 const html=c.api.render();
 assert(!html.includes('<img src=x'),'nickname must never inject HTML');
 assert(html.includes('&lt;img'));
 c.api.deactivate();
});
test('preset send includes only whitelisted phrase key, idempotency UUID, and no push registration',async()=>{
 const c=client('Z'.repeat(43));c.api.activate();await new Promise(resolve=>setTimeout(resolve,20));
 const result=await c.api.send(c.friend,'hello');
 assert.equal(result.duplicate,false);
 const send=c.calls.find(v=>v.url.endsWith('/send'));
 assert(send,'expected send route');
 const body=JSON.parse(send.options.body);
 assert.equal(body.kind,'preset');assert.equal(body.presetId,'hello');
 assert.match(body.eventKey,/^[0-9a-f-]{36}$/);
 assert(!JSON.stringify(c.calls).includes('/push'),'no FCM without consent');
 c.api.deactivate();
});
