import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
const origin='http://127.0.0.1:8787',base=origin+'/v1';
async function request(path,method='GET',body=null,key=''){
  const res=await fetch(base+path,{method,headers:{...(body?{'content-type':'application/json'}:{}),...(key?{authorization:'Bearer '+key}:{})},...(body?{body:JSON.stringify(body)}:{})});
  return {status:res.status,data:await res.json().catch(()=>({}))};
}
async function waitForEvent(credential,kind){
 for(let attempt=0;attempt<30;attempt++){
  const inbox=await request('/messages/inbox','GET',null,credential);
  const event=inbox.data.events?.find(e=>e.kind===kind);
  if(event)return {inbox,event};
  await new Promise(resolve=>setTimeout(resolve,100));
 }
 assert.fail('Event '+kind+' did not appear in inbox after authorized room action');
}
async function player(name){
 const r=await request('/social/register','POST',{nickname:name});
 assert.equal(r.status,201,JSON.stringify(r));return r.data;
}
async function befriend(a,b){
 const inv=await request('/social/invites','POST',{},a.credential);
 assert.equal(inv.status,201);
 const accept=await request('/social/invites/accept','POST',{code:inv.data.code},b.credential);
 assert.equal(accept.status,200,JSON.stringify(accept));
}
const a=await player('Порака Алфа'),b=await player('Порака Бета'),e=await player('Порака Не-пријател');
await befriend(a,b);
const owner=a.credential,friend=b.credential,stranger=e.credential;
const authMissing=await request('/messages/inbox');
assert.equal(authMissing.status,401,'no anonymous inbox');
const badOrigin=await fetch(base+'/messages/inbox',{headers:{origin:'https://attacker.invalid',authorization:'Bearer '+friend}});
assert.equal(badOrigin.status,403,'no cross-origin data leaks');
const status=await request('/messages/status','GET',null,owner);
assert.equal(status.status,200);assert.equal(status.data.freeTextEnabled,false);
assert.equal(status.data.pushAvailable,false);
assert(status.data.presets.hello,'preset registry required');
const noFriend=await request('/messages/send','POST',{receiverId:e.id,eventKey:randomUUID(),kind:'preset',presetId:'hello'},owner);
assert.equal(noFriend.status,403,'no sending to strangers');
const freeText=await request('/messages/send','POST',{receiverId:b.id,eventKey:randomUUID(),kind:'text',text:'secret'},owner);
assert.equal(freeText.status,403,'unreviewed free text must be off');
const pushUnavailable=await request('/messages/push','POST',{consent:true,token:'a'.repeat(150)},owner);
assert.equal(pushUnavailable.status,503,'no FCM registration without owner configuration');
let eventKey=randomUUID();
const first=await request('/messages/send','POST',{receiverId:b.id,eventKey,kind:'preset',presetId:'hello'},owner);
assert.equal(first.status,201,JSON.stringify(first));assert.equal(first.data.duplicate,false);
const retry=await request('/messages/send','POST',{receiverId:b.id,eventKey,kind:'preset',presetId:'hello'},owner);
assert.equal(retry.status,201);assert.equal(retry.data.duplicate,true);
assert.equal(retry.data.id,first.data.id);
const keyConflict=await request('/messages/send','POST',
  {receiverId:b.id,eventKey,kind:'preset',presetId:'bye'},owner);
assert.equal(keyConflict.status,409,'same operation UUID must not hide changed message content');

const concurrently=await Promise.all([
  request('/messages/send','POST',{receiverId:b.id,eventKey:randomUUID(),kind:'preset',presetId:'great'},owner),
  request('/messages/send','POST',{receiverId:b.id,eventKey:randomUUID(),kind:'preset',presetId:'thanks'},owner)
]);
assert(concurrently.every(x=>x.status===201),'parallel valid sends authorized');
const bInbox=await request('/messages/inbox','GET',null,friend);
assert.equal(bInbox.status,200);
assert.equal(bInbox.data.messages.filter(x=>x.from===a.id).length,3,'no duplicate messages');
assert(bInbox.data.messages.some(x=>x.text.includes('Здраво')));
assert(!JSON.stringify(bInbox.data).includes(a.credential),'credentials absent from response');
const eInbox=await request('/messages/inbox','GET',null,stranger);
assert.equal(eInbox.status,200);assert.equal(eInbox.data.messages.length,0,'no stranger inbox visibility');
assert.equal((await request('/messages/cards/'+first.data.id+'/read','POST',{},owner)).status,404,'sender cannot mark receiver read');
assert.equal((await request('/messages/cards/'+first.data.id+'/read','POST',{},friend)).status,200);
assert.equal((await request('/messages/cards/'+first.data.id+'/report','POST',{reason:'spam'},friend)).status,200);
assert.equal((await request('/messages/cards/'+first.data.id+'/report','POST',{reason:'spam'},friend)).status,200,'same report idempotent');
assert.equal((await request('/messages/cards/'+first.data.id+'/report','POST',{reason:'spam'},stranger)).status,404);
assert.equal((await request('/messages/mutes/'+a.id,'POST',{},friend)).status,200);
assert((await request('/messages/inbox','GET',null,friend)).data.mutes.includes(a.id));
assert.equal((await request('/messages/mutes/'+a.id,'DELETE',null,friend)).status,200);
assert.equal((await request('/messages/cards/'+first.data.id,'DELETE',null,owner)).status,200);
assert.equal((await request('/messages/cards/'+first.data.id,'DELETE',null,friend)).status,200);
assert(!(await request('/messages/inbox','GET',null,friend)).data.messages.some(x=>x.id===first.data.id));
const room=await request('/shared/rooms','POST',{title:'Пораки игротека'},owner);
assert.equal(room.status,201,JSON.stringify(room));
const invite=await request('/shared/rooms/'+room.data.room.id+'/invite','POST',{inviteeId:b.id},owner);
assert.equal(invite.status,201);
const {event:notice}=await waitForEvent(friend,'room_invitation');
assert.equal((await request('/messages/events/'+notice.id+'/read','POST',{},friend)).status,200);
assert.equal((await request('/messages/events/'+notice.id,'DELETE',null,stranger)).status,200,'unrelated delete gives no information');
assert((await request('/messages/inbox','GET',null,friend)).data.events.some(x=>x.id===notice.id),'stranger did not delete');
assert.equal((await request('/messages/events/'+notice.id,'DELETE',null,friend)).status,200);
const inviteAccepted=await request('/shared/invitations/'+invite.data.invitation.id+'/accept','POST',{},friend);
assert.equal(inviteAccepted.status,200);
await waitForEvent(owner,'room_joined');
const blo=await request('/social/friends/'+b.id+'/block','POST',{},owner);
assert.equal(blo.status,200);
assert.equal((await request('/messages/send','POST',{receiverId:a.id,eventKey:randomUUID(),kind:'preset',presetId:'hello'},friend)).status,403);
assert.equal((await request('/messages/inbox','GET',null,friend)).data.messages.length,0,'block erases cards between friends');
assert.equal((await request('/messages/inbox','GET',null,owner)).data.events.filter(x=>x.actorId===b.id).length,0,'block erases event cards');
console.log('PASS encrypted private messages: no anonymous/cross-origin access, presets-only, replay, sender/receiver consent, reports, mutes, event inbox, deletion and block; push disabled');
