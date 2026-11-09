
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {WebSocket} from 'ws';

const root=process.env.TRIALUM_SHARED_BASE||'http://127.0.0.1:8787';
async function http(path,method='GET',body,credential){
 const r=await fetch(root+path,{method,headers:{...(body?{'content-type':'application/json'}:{}),
  ...(credential?{authorization:'Bearer '+credential}:{})},
  ...(body?{body:JSON.stringify(body)}:{})});
 return {status:r.status,data:await r.json().catch(()=>({}))};
}
const social=(path,method='GET',body,c)=>http('/v1/social/'+path,method,body,c);
const api=(path,method='GET',body,c)=>http('/v1/shared/'+path,method,body,c);
const uuid=()=>randomUUID();
const pet=id=>({id,name:'Миленко',species:0,hue:190,eyes:2,shape:'jelly',growth:60,seed:452});
async function user(name){
 const r=await social('register','POST',{nickname:name});
 assert.equal(r.status,201,JSON.stringify({name,status:r.status,data:r.data}));return r.data;
}
async function befriend(a,b){
 const inv=await social('invites','POST',{},a.credential);
 assert.equal(inv.status,201);
 const accept=await social('invites/accept','POST',{code:inv.data.code},b.credential);
 assert.equal(accept.status,200);
}
async function join(owner,member,room){
 const inv=await api('rooms/'+room+'/invite','POST',{inviteeId:member.id},owner.credential);
 assert.equal(inv.status,201,JSON.stringify(inv));
 const listed=await api('invitations','GET',null,member.credential);
 assert(listed.data.invitations.some(x=>x.id===inv.data.invitation.id));
 const accepted=await api('invitations/'+inv.data.invitation.id+'/accept','POST',{},member.credential);
 assert.equal(accepted.status,200,JSON.stringify(accepted));
 assert.equal((await api('invitations/'+inv.data.invitation.id+'/accept','POST',{},member.credential)).status,409,'invite replay denied');
}
assert.equal((await api('rooms')).status,401,'anonymous denied');
assert.equal((await api('status')).status,401,'status is not public');
const owner=await user('Сопственик'),b=await user('Гостин'),c=await user('Член 2'),d=await user('Член 3'),stranger=await user('Непознат');
for(const friend of [b,c,d])await befriend(owner,friend);
const create=await api('rooms','POST',{title:'Нашата полјана'},owner.credential);
assert.equal(create.status,201,JSON.stringify(create));
const room=create.data.room.id;
assert.equal((await api('rooms/'+room+'/snapshot','GET',null,stranger.credential)).status,403,'nonmember cannot see room');
assert.equal((await api('rooms/'+room+'/invite','POST',{inviteeId:stranger.id},owner.credential)).status,403,'owner cannot invite stranger');
await join(owner,b,room);
await join(owner,c,room);
await join(owner,d,room);
assert.equal((await api('rooms/'+room+'/snapshot','GET',null,b.credential)).data.members.length,4);
assert.equal((await api('rooms/'+room+'/upgrade','POST',{eventKey:uuid(),kind:'expand'},b.credential)).status,403,'only owner spends group points');
assert.equal((await api('rooms/'+room+'/activity','POST',{eventKey:uuid(),toyId:'trampoline',pet:pet('p0')},b.credential)).status,403,'locked toy denied');
assert.equal((await api('rooms/'+room+'/activity','POST',{eventKey:uuid(),toyId:'sandbox',pet:{...pet('p0'),xp:999999}},b.credential)).status,400,'forged XP denied');
const key=uuid();
const same=await Promise.all([
 api('rooms/'+room+'/activity','POST',{eventKey:key,toyId:'sandbox',pet:pet('p0'),amount:100000},b.credential),
 api('rooms/'+room+'/activity','POST',{eventKey:key,toyId:'sandbox',pet:pet('p0'),amount:100000},b.credential)
]);
assert.deepEqual(same.map(x=>x.status).sort(),[200,200],'two simultaneous retries must not double-credit');
assert.equal(same.filter(x=>x.data.duplicate).length,1);
const activity=same.find(x=>!x.data.duplicate);
assert.equal(activity.status,200,JSON.stringify(activity));
assert.equal(activity.data.earned,1,'server always awards exactly 1');
assert.equal((await api('rooms/'+room+'/activity','POST',{eventKey:key,toyId:'sandbox',pet:pet('p0')},b.credential)).data.duplicate,true);
assert.equal((await api('rooms/'+room+'/activity','POST',{eventKey:key,toyId:'sandbox',pet:pet('p0')},c.credential)).status,409);
assert.equal((await api('rooms/'+room+'/snapshot','GET',null,b.credential)).data.points,1);
const received=[];
const ws=new WebSocket(root.replace('http://','ws://')+'/v1/social/live');
ws.on('message',data=>{try{received.push(JSON.parse(String(data)));}catch(_){}});
await new Promise((resolve,reject)=>{ws.once('open',resolve);ws.once('error',reject);});
ws.send(JSON.stringify({type:'auth',credential:b.credential}));
for(let i=0;i<20&&!received.some(m=>m.type==='ready');i++)await new Promise(r=>setTimeout(r,75));
assert(received.some(m=>m.type==='ready'),'WebSocket auth should complete');
ws.send(JSON.stringify({type:'subscribe',roomId:room}));
for(let i=0;i<20&&!received.some(m=>m.type==='subscribed');i++)await new Promise(r=>setTimeout(r,75));
assert(received.some(m=>m.type==='subscribed'),'room consent required to subscribe');
const wsevent=uuid();
assert.equal((await api('rooms/'+room+'/activity','POST',{eventKey:wsevent,toyId:'seesaw',pet:pet('p2')},d.credential)).status,200);
for(let i=0;i<30&&!received.some(m=>m.type==='sync');i++)await new Promise(r=>setTimeout(r,80));
assert(received.some(m=>m.type==='sync'&&m.roomId===room),'live room event fanout to subscribed member');
assert(!received.some(m=>JSON.stringify(m).includes(b.credential)),'secret never sent back');
ws.close();
// 8 earned group points: 4 members x 2 play sessions (cooldown 8 seconds).
for(const actor of [owner,c])assert.equal((await api('rooms/'+room+'/activity','POST',{eventKey:uuid(),toyId:'seesaw',pet:pet('p3')},actor.credential)).status,200);
assert.equal((await api('rooms/'+room+'/snapshot','GET',null,owner.credential)).data.points,4);
await new Promise(r=>setTimeout(r,8200));
for(const actor of [owner,b,c,d])assert.equal((await api('rooms/'+room+'/activity','POST',{eventKey:uuid(),toyId:'sandbox',pet:pet('p4')},actor.credential)).status,200);
assert.equal((await api('rooms/'+room+'/snapshot','GET',null,owner.credential)).data.points,8);
const upgradeKey=uuid();
const up=await api('rooms/'+room+'/upgrade','POST',{eventKey:upgradeKey,kind:'toy',toyId:'slide'},owner.credential);
assert.equal(up.status,200,JSON.stringify(up));
assert.equal(up.data.cost,8);
assert.equal((await api('rooms/'+room+'/upgrade','POST',{eventKey:upgradeKey,kind:'toy',toyId:'slide'},owner.credential)).data.duplicate,true);
const snap=(await api('rooms/'+room+'/snapshot','GET',null,owner.credential)).data;
assert(snap.toys.includes('slide'));assert.equal(snap.points,0,'spend was atomic');
assert.equal((await api('rooms/'+room+'/upgrade','POST',{eventKey:uuid(),kind:'expand'},owner.credential)).status,409,'insufficient balance');
// Consent visit to habitat without playground level requirement.
const visitKey=uuid();
const sent=await api('visits','POST',{eventKey:visitKey,receiverId:owner.id,destination:'habitat',pet:pet('p5')},b.credential);
assert.equal(sent.status,201,JSON.stringify(sent));
const visitId=sent.data.visitId;
assert.equal((await api('visits/'+visitId+'/accept','POST',{},stranger.credential)).status,403);
assert.equal((await api('visits/'+visitId+'/accept','POST',{},b.credential)).status,403);
assert.equal((await api('visits/'+visitId+'/accept','POST',{},owner.credential)).status,200);
assert.equal((await api('visits/'+visitId+'/return','POST',{},b.credential)).status,200);
assert.equal((await api('visits/'+visitId+'/accept','POST',{},owner.credential)).status,409,'visit cannot be replayed');
const shared=await api('visits','POST',{eventKey:uuid(),receiverId:owner.id,destination:'playground',roomId:room,pet:pet('p6')},c.credential);
assert.equal(shared.status,201);
assert.equal((await api('visits/'+shared.data.visitId+'/accept','POST',{},owner.credential)).status,200);
assert.equal((await api('rooms/'+room+'/snapshot','GET',null,c.credential)).data.visitors.length,1);
// Revoking friendship must revoke membership; before and after, no secret leak.
assert.equal((await social('friends/'+c.id+'/block','POST',{},owner.credential)).status,200);
assert.equal((await api('rooms/'+room+'/snapshot','GET',null,c.credential)).status,403);
const afterBlock=(await api('rooms/'+room+'/snapshot','GET',null,owner.credential)).data;
assert(!afterBlock.members.some(m=>m.id===c.id),'blocked member removed, not merely hidden');
assert(!afterBlock.visitors.some(v=>v.senderId===c.id),'accepted visit must disappear after block');
assert.equal((await api('rooms/'+room+'/invite','POST',{inviteeId:c.id},owner.credential)).status,403);
const late=await user('Нов пријател');
await befriend(owner,late);
const lateInvite=await api('rooms/'+room+'/invite','POST',{inviteeId:late.id},owner.credential);
assert.equal(lateInvite.status,201);
const racing=await Promise.all([
 api('invitations/'+lateInvite.data.invitation.id+'/accept','POST',{},late.credential),
 social('friends/'+late.id+'/block','POST',{},owner.credential)
]);
assert.equal(racing[1].status,200,'blocking must complete during invitation race');
assert([200,403,409].includes(racing[0].status),'accept either precedes block or is rejected');
assert.equal((await api('rooms/'+room+'/snapshot','GET',null,late.credential)).status,403,'no resurrected membership after race');
const kick=await api('rooms/'+room+'/members/'+d.id,'DELETE',null,owner.credential);
assert.equal(kick.status,200);
assert.equal((await api('rooms/'+room+'/snapshot','GET',null,d.credential)).status,403);
assert.equal((await api('rooms/'+room+'/members/'+owner.id,'DELETE',null,owner.credential)).status,409,'owner cannot leave');
assert.equal((await api('rooms/'+room,'DELETE',null,b.credential)).status,403);
assert.equal((await api('rooms/'+room,'DELETE',null,owner.credential)).status,200);
assert.equal((await api('rooms/'+room+'/snapshot','GET',null,b.credential)).status,403);
assert.equal((await social('account','DELETE',null,owner.credential)).status,200);
assert.equal((await social('me','GET',null,owner.credential)).status,401);
console.log('PASS 1.5.6-D: private server auth, 4 player group consent, ACL, idempotent points, WS fanout, paid-claim rejection, room upgrade, visits, block, delete');
