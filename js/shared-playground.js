
(function(root){
'use strict';
const escape=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const toy={sandbox:['🏖️','Песочник',0],seesaw:['⚖️','Клацкалка',0],slide:['🛝','Лизгалка',8],pool:['🏊','Базенче',10],obstacle:['🧩','Патека',12],trampoline:['✨','Трамболина',14]};
const st={active:false,ready:false,enabled:false,online:false,rooms:[],invitations:[],visits:[],selected:'',snapshot:null,error:'',busy:false};
let base='',token='',ws=null,timer=null,scheduled=null,inflight=false,changed=()=>{},wsReady=false,subscribed='';
const say=()=>changed();
const self=()=>root.TrialumSocial?.getState?.()?.identity||null;
const friends=()=>root.TrialumSocial?.getState?.()?.friends||[];
const current=s=>root.TrialumEngine?.currentPet(s)||s?.pets?.[0]||null;
const uuid=()=>{
 if(root.crypto?.randomUUID)return root.crypto.randomUUID();
 const bytes=new Uint8Array(16);root.crypto?.getRandomValues?.(bytes);
 if(!bytes.some(Boolean))throw Error('secure_random_unavailable');
 bytes[6]=(bytes[6]&15)|64;bytes[8]=(bytes[8]&63)|128;
 const hex=Array.from(bytes,n=>n.toString(16).padStart(2,'0')).join('');
 return hex.slice(0,8)+'-'+hex.slice(8,12)+'-'+hex.slice(12,16)+'-'+hex.slice(16,20)+'-'+hex.slice(20);
};
function profile(p){
 const sp=root.TrialumEngine?.SPECIES?.[Number(p?.species)||0]||{};
 return{id:String(p?.id||'pet-visitor').replace(/[^A-Za-z0-9_-]/g,'').slice(0,64),
 name:String(p?.name||'Миленик').trim().slice(0,32),species:Math.max(0,Math.min(15,Math.trunc(Number(p?.species)||0))),
 hue:Math.max(0,Math.min(359,Math.round(Number(p?.hue)||175))),
 eyes:Math.max(1,Math.min(5,Math.round(Number(p?.eyes)||2))),
 shape:['jelly','cloud','leaf','crystal','blob','round','star'].includes(p?.shape)?p.shape:(sp.shape||'jelly'),
 growth:Math.max(1,Math.min(100,Math.round(Number(p?.growth)||25))),
 seed:Math.max(0,Math.min(4294967295,Math.round(Number(p?.seed)||1)))};
}
function config(){
 const n=root.TrialumAndroid,url=String(n?.socialApiUrl?.()||'').trim().replace(/\/$/,'');
 const pass=String(n?.socialCredential?.()||'');
 st.enabled=/^https:\/\/[a-z0-9.-]+(?::443)?$/i.test(url)&&/^[A-Za-z0-9_-]{43}$/.test(pass);
 base=st.enabled?url:'';token=st.enabled?pass:'';
 return st.enabled;
}
const errors={
 shared_disabled:'Заедничката игротека сè уште не е овозможена на серверот.',pending_visit_limit:'Пријателот веќе има три покани за посета. Почекај одговор.',local_locked:'Прво отклучи ја локалната игротека.',
 friendship_required:'Потребно е активно пријателство.',room_access_denied:'Немаш пристап до овој простор.',
 owner_required:'Само сопственикот одобрува надградби.',room_limit:'Можеш да создадеш две заеднички игротеки.',
 room_full:'Групата има најмногу шест членови.',already_member:'Овој пријател веќе е член.',
 not_enough_shared_points:'Нема доволно заеднички поени.',expand_first:'Прво проширете го просторот.',
 toy_locked:'Оваа играчка сè уште е заклучена.',play_cooldown:'Почекај осум секунди пред нова игра.',
 daily_play_limit:'Денес се искористени шесте заеднички игри.',invitation_expired:'Поканата е истечена.',
 visit_expired:'Посетата истекла.',pet_required:'Прво избери милениче.'
};
function problem(e){st.error=errors[e?.message]||'Проблем со врската или дозволата. Пробај повторно.';say();}
async function req(path,method='GET',body=null){
 if(!base||!token)throw Error('shared_disabled');
 const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),8000);
 try{
  const r=await fetch(base+'/v1/shared/'+path,{method,
   headers:{Authorization:'Bearer '+token,...(body?{'Content-Type':'application/json'}:{})},
   ...(body?{body:JSON.stringify(body)}:{}),signal:controller.signal,
   cache:'no-store',credentials:'omit',redirect:'error',referrerPolicy:'no-referrer'});
  const data=await r.json().catch(()=>({}));
  if(!r.ok)throw Error(data.error||'server_error');
  return data;
 }finally{clearTimeout(timeout);}
}
function homeGuest(){
 const me=self()?.id;
 const visiting=st.visits.find(v=>v.receiver_id===me&&v.destination==='habitat'&&
  v.status==='accepted'&&Date.parse(v.expires_at)>Date.now());
 root.TrialumWorld?.setGuest?.(visiting?{...visiting.pet_public,level:1}:null);
}
async function refresh(){
 if(!st.active||!config()||inflight)return;
 inflight=true;
 try{
  const [status,rooms,invitations,visits]=await Promise.all([req('status'),req('rooms'),req('invitations'),req('visits')]);
  if(!status.ready)throw Error('shared_disabled');
  st.ready=true;st.online=true;st.error='';
  st.rooms=rooms.rooms||[];st.invitations=invitations.invitations||[];st.visits=visits.visits||[];
  if(!st.rooms.some(r=>r.id===st.selected))st.selected=st.rooms[0]?.id||'';
  if(st.selected){
   try{st.snapshot=await req('rooms/'+st.selected+'/snapshot');}
   catch(_){st.snapshot=null;st.selected='';}
  }else st.snapshot=null;
  homeGuest();
  subscribe();
 }catch(e){st.online=false;problem(e);}finally{inflight=false;say();}
}
function subscribe(){
 if(!ws||!wsReady||ws.readyState!==1||st.selected===subscribed)return;
 if(subscribed)ws.send(JSON.stringify({type:'unsubscribe',roomId:subscribed}));
 if(st.selected)ws.send(JSON.stringify({type:'subscribe',roomId:st.selected}));
 subscribed=st.selected;
}
function connect(){
 if(!st.active||!st.enabled||!root.WebSocket||ws)return;
 const socket=new root.WebSocket(base.replace(/^https:/,'wss:')+'/v1/social/live');
 ws=socket;
 socket.addEventListener('open',()=>{if(ws===socket)socket.send(JSON.stringify({type:'auth',credential:token}));});
 socket.addEventListener('message',e=>{
  if(ws!==socket)return;
  let m;try{m=JSON.parse(e.data);}catch(_){return;}
  if(m.type==='ready'){wsReady=true;subscribe();}
  if(m.type==='sync'&&st.active){
   if(scheduled)clearTimeout(scheduled);
   scheduled=setTimeout(()=>{scheduled=null;refresh().catch(()=>{});},180);
  }
 });
 socket.addEventListener('close',()=>{if(ws===socket){ws=null;wsReady=false;subscribed='';if(st.active)setTimeout(()=>{if(st.active)connect();},4000);}});
 socket.addEventListener('error',()=>{});
}
function activate(){
 if(st.active)return;
 st.active=true;
 if(!config()){st.error='Поврзи приватен профил преку HTTPS во Пријатели.';say();return;}
 refresh().catch(()=>{});
 connect();
 timer=setInterval(()=>{if(st.active&&root.document?.visibilityState!=='hidden')refresh().catch(()=>{});},8000);
}
function deactivate(){
 st.active=false;
 if(timer)clearInterval(timer);timer=null;
 if(scheduled)clearTimeout(scheduled);scheduled=null;
 if(ws){const old=ws;ws=null;old.close();}wsReady=false;subscribed='';
 root.TrialumSharedScene?.stop?.();
}
function select(id){if(!st.rooms.some(r=>r.id===id))return false;st.selected=id;st.snapshot=null;say();refresh().catch(()=>{});return true;}
async function run(fn){
 if(st.busy)return null;
 st.busy=true;st.error='';say();
 try{const value=await fn();await refresh();return value;}
 catch(e){problem(e);return null;}
 finally{st.busy=false;say();}
}
function create(title,world){
 if(!root.TrialumPlayground?.eligible(world)?.ok){problem(Error('local_locked'));return Promise.resolve(null);}
 return run(async()=>{const x=await req('rooms','POST',{title});st.selected=x.room.id;return x;});
}
const invite=friendId=>run(()=>req('rooms/'+st.selected+'/invite','POST',{inviteeId:friendId}));
const decision=(id,accept)=>run(()=>req('invitations/'+id+'/'+(accept?'accept':'decline'),'POST',{}));
const remove=id=>run(()=>req('rooms/'+st.selected+'/members/'+id,'DELETE'));
const drop=()=>run(async()=>{const v=await req('rooms/'+st.selected,'DELETE');st.selected='';return v;});
const upgrade=(kind,toyId)=>run(()=>req('rooms/'+st.selected+'/upgrade','POST',{eventKey:uuid(),kind,toyId}));
const play=(toyId,world)=>run(()=>{
 const p=current(world);if(!p)throw Error('pet_required');
 return req('rooms/'+st.selected+'/activity','POST',{eventKey:uuid(),toyId,pet:profile(p)});
});
const sendVisit=(receiverId,destination,world)=>run(()=>{
 const p=current(world);if(!p)throw Error('pet_required');
 return req('visits','POST',{eventKey:uuid(),receiverId,destination,
  ...(destination==='playground'?{roomId:st.selected}:{}),pet:profile(p)});
});
const changeVisit=(id,kind)=>run(()=>req('visits/'+id+'/'+kind,'POST',{}));
function visitsView(world){
 const me=self()?.id,pet=current(world),fr=friends();
 let out='<div class="card"><h3>🐾 Посети на миленици</h3><p class="small subtle">Посетата е само со дозвола. Не создава XP и не ги префрла зачуваните миленици.</p>';
 if(fr.length&&pet){
  out+='<div class="btn-line"><select id="sharedFriendToVisit" aria-label="Пријател">'+fr.map(f=>'<option value="'+escape(f.id)+'">'+escape(f.nickname)+'</option>').join('')+'</select>'+
   '<select id="sharedDestination" aria-label="Дестинација"><option value="habitat">🏠 Дом</option>'+
   (st.snapshot?'<option value="playground">🌳 Заедничка игротека</option>':'')+
   '</select><button data-do="shVisit">Испрати покана за посета</button></div>';
 }
 for(const v of st.visits.slice(0,20)){
  if(v.sender_id!==me&&v.receiver_id!==me)continue;
  const receive=v.receiver_id===me;
  out+='<div class="friend-item social-friend"><span>🐾 '+escape(v.pet_public?.name||'Миленик')+
   ' · '+(v.destination==='habitat'?'🏠':'🌳')+' · '+escape(v.status)+
   (receive?' · од '+escape(v.sender_name||'пријател'):'')+'</span><div class="btn-line">'+
   (receive&&v.status==='pending'?'<button data-do="shVisitDecision" data-id="'+escape(v.id)+'" data-kind="accept">✓ Прифати</button><button data-do="shVisitDecision" data-id="'+escape(v.id)+'" data-kind="decline">Одбиј</button>':'')+
   (['pending','accepted'].includes(v.status)?'<button data-do="shVisitDecision" data-id="'+escape(v.id)+'" data-kind="return">↩ Врати</button>':'')+
   '</div></div>';
 }
 return out+'</div>';
}
function render(world){
 const me=self(),own=root.TrialumPlayground?.eligible(world)?.ok,snap=st.snapshot,room=snap?.room;
 let out='<div class="tab-main shared-hub"><div class="shared-heading"><div><p class="microcap">1.5.6-D · ПРИВАТЕН СЕРВЕР</p><h2>🌳 Заедничка игротека</h2><p class="desc">Покани за членство, посети со согласност и вистинска синхронизација. Без реклами и продажба на податоци.</p></div><span class="tag">🔐 Доброволно</span></div>';
 if(st.error)out+='<div class="notice social-warning" role="status">'+escape(st.error)+'</div>';
 if(!me||!st.enabled)return out+'<div class="card">🔒 Прво поврзи приватен профил за пријатели. Локалната игротека работи без интернет.<p><button data-tab="friends">🤝 Пријатели</button></p></div></div>';
 if(!st.ready)return out+'<div class="card">Серверот не е достапен или 1.5.6-D не е овозможена.</div><button data-do="shRefresh">Провери пак</button></div>';
 out+='<div class="btn-line"><button data-do="shRefresh">🔄 Освежи</button><span class="small subtle">WebSocket + проверена серверска состојба</span></div>';
 if(st.invitations.length){
  out+='<h3>📩 Покани</h3><div class="cards">'+st.invitations.map(i=>
   '<div class="card"><h3>🌿 '+escape(i.title)+'</h3><p>Од '+escape(i.inviter_name)+' · 24 часа</p><div class="btn-line"><button data-do="shDecision" data-id="'+escape(i.id)+'" data-accept="yes">✓ Прифати</button><button data-do="shDecision" data-id="'+escape(i.id)+'" data-accept="no">Одбиј</button></div></div>').join('')+'</div>';
 }
 if(own){
  out+='<div class="card"><h3>✨ Нова заедничка полјана</h3><div class="btn-line"><input id="sharedTitle" maxlength="48" placeholder="Име на приватниот простор" aria-label="Име на игротеката"><button data-do="shCreate">Создај</button></div></div>';
 }else out+='<p class="notice">🔒 За да бидеш сопственик треба ниво 15 и лабораторија 4. Можеш да влезеш како поканет гостин и со пониско ниво.</p>';
 if(!st.rooms.length)return out+'<p>Нема заеднички простор. Испрати или прифати покана.</p>'+visitsView(world)+'</div>';
 out+='<div class="shared-tabs">'+st.rooms.map(r=>'<button data-do="shSelect" data-id="'+escape(r.id)+'"'+(r.id===st.selected?' class="primary"':'')+'>🌿 '+escape(r.title)+'</button>').join('')+'</div>';
 if(room){
  out+='<div class="card shared-stage"><div class="shared-heading"><div><h3>'+escape(room.title)+'</h3><p>Простор '+room.tier+'/5 · '+snap.members.length+'/6 членови</p></div><strong>💠 '+snap.points+' поени</strong></div>'+
   '<canvas id="sharedScene" width="1000" height="520" role="img" aria-label="Синхронизиран заеднички простор со миленици и играчки"></canvas></div>';
  out+='<div class="card"><h3>🎠 Групни активности</h3><p>Секое потврдено играње носи 1 групен поен, максимум 6 дневно. Гледањето не носи награди.</p><div class="btn-line">'+snap.toys.map(t=>
   '<button data-do="shPlay" data-toy="'+escape(t)+'">'+(toy[t]?.[0]||'🎠')+' '+escape(toy[t]?.[1]||t)+'</button>').join('')+'</div></div>';
  if(room.role==='owner'){
   const available=friends().filter(f=>!snap.members.some(m=>m.id===f.id));
   out+='<div class="card"><h3>👑 Управување</h3><div class="btn-line"><select id="sharedInviteFriend" aria-label="Покани пријател">'+available.map(f=>'<option value="'+escape(f.id)+'">'+escape(f.nickname)+'</option>').join('')+'</select><button data-do="shInvite"'+(!available.length?' disabled':'')+'>📩 Покани</button></div>'+
   '<div class="btn-line"><button data-do="shUpgrade" data-kind="expand"'+(room.tier>=5||snap.points<10+5*(room.tier-1)?' disabled':'')+'>🌳 Прошири · '+(10+5*(room.tier-1))+'</button>'+
   Object.entries(toy).filter(([id,v])=>v[2]&&!snap.toys.includes(id)).map(([id,v])=>
    '<button data-do="shUpgrade" data-kind="toy" data-toy="'+id+'"'+(snap.points<v[2]||snap.toys.length>=Math.min(6,2+room.tier)?' disabled':'')+'>'+v[0]+' '+v[1]+' · '+v[2]+'</button>').join('')+
   '</div><p class="small subtle">Само сопственикот ги одобрува трошоците; сите членови придонесуваат.</p><button data-do="shDelete">Избриши простор</button></div>';
  }
  out+='<div class="card"><h3>👥 Членови</h3>'+snap.members.map(m=>'<div class="friend-item social-friend"><b>'+escape(m.nickname)+(m.role==='owner'?' 👑':'')+'</b>'+
   (((room.role==='owner'&&m.id!==room.ownerId)||(m.id===me.id&&room.role!=='owner'))?'<button data-do="shRemove" data-id="'+escape(m.id)+'">'+(m.id===me.id?'Напушти':'Отстрани')+'</button>':'')+'</div>').join('')+'</div>';
  out+='<div class="card"><h3>✨ Настани</h3>'+snap.events.slice(-8).reverse().map(e=>
   '<div class="shared-event"><b>'+escape(e.actor)+'</b> · '+escape(e.kind==='played'?'игра со '+(toy[e.payload.toyId]?.[1]||'справа'):e.kind==='upgraded'?'надградба':e.kind==='joined'?'се придружи':'настан')+'</div>').join('')+'</div>';
 }
 return out+visitsView(world)+'</div>';
}
root.TrialumShared={activate,deactivate,refresh,select,create,invite,decision,remove,drop,upgrade,play,sendVisit,changeVisit,
 render,profile,onChange(fn){changed=fn;},getState(){return {...st,rooms:st.rooms.slice(),visits:st.visits.slice()}}};
})(typeof globalThis!=='undefined'?globalThis:this);
