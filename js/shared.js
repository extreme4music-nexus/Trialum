/* 1.5.6-D: online shared playground controls, deliberately separate from offline save. */
(function(root){
'use strict';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let rooms=[],selected='',detail=null,visits=[],error='',busy=false,credential='',server='',enabled=false;
let update=()=>{};
function configure(origin,secret){server=origin;credential=secret;enabled=!!server&&!!credential;}
async function api(path,method='GET',data){
 if(!enabled)throw Error('social_unavailable');
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),7000);
 try{
  const res=await fetch(server+'/v1/social/'+path,{method,headers:{Authorization:'Bearer '+credential,...(data?{'Content-Type':'application/json'}:{})},...(data?{body:JSON.stringify(data)}:{}),signal:controller.signal,cache:'no-store',credentials:'omit',redirect:'error',referrerPolicy:'no-referrer'});
  const result=await res.json().catch(()=>({}));
  if(!res.ok)throw Error(result.error||'server_error');
  return result;
 }finally{clearTimeout(timer);}
}
async function act(fn){
 if(busy)return false;busy=true;error='';update();
 try{await fn();return true;}catch(e){error=String(e.message||'network_error').slice(0,80);return false;}
 finally{busy=false;update();}
}
async function refresh(){return act(async()=>{const [r,v]=await Promise.all([api('rooms'),api('visits')]);rooms=r.rooms||[];visits=v.visits||[];if(selected&&rooms.some(x=>x.id===selected))detail=await api('rooms/'+selected);else{selected='';detail=null;}});}
async function create(title){return act(async()=>{const r=await api('rooms','POST',{title});selected=r.room.id;await reload();});}
async function reload(){const r=await api('rooms'),v=await api('visits');rooms=r.rooms||[];visits=v.visits||[];detail=selected?await api('rooms/'+selected):null;}
async function select(id){if(!rooms.some(x=>x.id===id))return false;selected=id;return act(reload);}
async function invite(friendId){return act(async()=>{const r=await api('rooms/'+selected+'/invites','POST',{recipientId:friendId});root.TrialumAndroid?.shareText?.('TRIALUM · Код за заедничка игротека:\n'+r.code);root.TrialumSharedInviteCode=r.code;});}
async function accept(code){return act(async()=>{await api('rooms/invites/accept','POST',{code:String(code||'').trim()});await reload();});}
async function visit(friendId,petRef,destination){return act(async()=>{await api('visits','POST',{receiverId:friendId,petRef,destination,roomId:destination==='playground'?selected:undefined});await reload();});}
async function respond(id,decision){return act(async()=>{await api('visits/'+id+'/'+decision,'POST',{});await reload();});}
async function action(toy,skill){return act(async()=>{await api('rooms/'+selected+'/actions','POST',{toy,action:skill,eventKey:root.crypto.randomUUID()});await reload();});}
async function upgrade(toy){return act(async()=>{await api('rooms/'+selected+(toy?'/toys':'/expand'),'POST',{toy,eventKey:root.crypto.randomUUID()});await reload();});}
async function leave(){return act(async()=>{await api('rooms/'+selected+'/leave','POST',{});selected='';await reload();});}
async function remove(memberId){return act(async()=>{await api('rooms/'+selected+'/members','DELETE',{memberId});await reload();});}
function render(friends=[],petId=''){
 if(!enabled)return '<div class="notice">Заедничката игротека бара доброволно активирани онлајн пријатели и безбедна HTTPS врска.</div>';
 let h='<section class="card"><h3>🌍 Заедничка игротека</h3><p class="desc">Секој простор е посебна мала група. Пријателите не се додаваат автоматски. Локалната игротека останува независна.</p>';
 if(error)h+='<p class="notice" role="alert">'+esc(error)+'</p>';
 h+='<div class="btn-line"><button data-do="sharedRefresh">Освежи</button></div><label for="sharedTitle">Нова игротека</label><input id="sharedTitle" maxlength="48" placeholder="Нашата полјана"><button data-do="sharedCreate">Создај група</button>';
 h+='<div class="btn-line">'+rooms.map(r=>'<button data-do="sharedSelect" data-id="'+esc(r.id)+'">'+esc(r.title)+' ('+esc(r.role)+')</button>').join('')+'</div>';
 if(detail){
  const d=detail;
  h+='<div class="card"><h3>🎠 '+esc(d.room.title)+'</h3><p>Простор '+esc(d.room.tier)+' · Заеднички труд '+esc(d.balance)+'</p><p>Играчки: '+d.toys.map(esc).join(', ')+'</p>';
  h+='<p class="small">Членови: '+d.members.map(m=>esc(m.nickname)+' ('+esc(m.role)+')').join(', ')+'</p>';
  if(rooms.find(x=>x.id===selected)?.role==='owner'){
   h+='<div class="btn-line">'+friends.filter(f=>!d.members.some(m=>m.installation_id===f.id)).map(f=>'<button data-do="sharedInvite" data-id="'+esc(f.id)+'">Покани '+esc(f.nickname)+'</button>').join('')+'</div>';
   h+='<div class="btn-line"><button data-do="sharedExpand">🌳 Прошири</button>'+['slide','pool','obstacle','trampoline'].filter(t=>!d.toys.includes(t)).map(t=>'<button data-do="sharedUnlock" data-toy="'+t+'">Отклучи '+t+'</button>').join('')+'</div>';
   h+=d.members.filter(m=>m.role!=='owner').map(m=>'<button data-do="sharedRemove" data-id="'+esc(m.installation_id)+'">Отстрани '+esc(m.nickname)+'</button>').join('');
  }else h+='<button data-do="sharedLeave">Напушти група</button>';
  h+='<div class="btn-line">'+d.toys.map(t=>'<button data-do="sharedPlay" data-toy="'+esc(t)+'">▶ '+esc(t)+'</button>').join('')+'</div>';
  h+='<p class="small">Серверот ги одобрува акциите и заедничкиот труд. Нема префрлање XP или кредити од локалниот свет.</p>';
  h+='<div class="small" aria-live="polite">'+d.events.slice(-8).map(e=>'<p>• '+esc(e.kind)+' · '+esc(e.created_at)+'</p>').join('')+'</div></div>';
 }
 h+='<label for="sharedInviteCode">Прими групна покана</label><input id="sharedInviteCode" maxlength="43" placeholder="Код од пријател"><button data-do="sharedAccept">Прифати групна покана</button>';
 if(petId&&friends.length)h+='<div class="card"><h3>🐾 Испрати милениче на гости</h3>'+friends.map(f=>'<div class="btn-line"><span>'+esc(f.nickname)+'</span><button data-do="sharedVisit" data-id="'+esc(f.id)+'" data-destination="habitat">Во дом</button>'+(selected?'<button data-do="sharedVisit" data-id="'+esc(f.id)+'" data-destination="playground">Во игротека</button>':'')+'</div>').join('')+'</div>';
 h+='<div class="card"><h3>📨 Посети</h3>'+visits.map(v=>'<div class="friend-item"><span>'+esc(v.destination)+' · '+esc(v.status)+'</span>'+(v.receiver_id===root.TrialumSocial?.getState()?.identity?.id&&v.status==='pending'?'<button data-do="sharedVisitAccept" data-id="'+esc(v.id)+'">Прифати</button><button data-do="sharedVisitDecline" data-id="'+esc(v.id)+'">Одбиј</button>':'')+(v.status==='accepted'?'<button data-do="sharedVisitReturn" data-id="'+esc(v.id)+'">Врати</button>':'')+'</div>').join('')+'</div>';
 return h+'</section>';
}
root.TrialumShared={configure,refresh,create,select,invite,accept,visit,respond,action,upgrade,leave,remove,render,getState:()=>({rooms,selected,detail,visits,error,busy}),onChange:fn=>{update=fn;}};
})(typeof globalThis!=='undefined'?globalThis:this);
