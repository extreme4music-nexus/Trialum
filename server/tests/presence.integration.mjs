// TRIALUM LW-A: real PostgreSQL + authenticated HTTP concurrency/integration.
// Run ONLY against disposable CI DB with TRIALUM_PRESENCE_ENABLED=true.
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {execFileSync} from 'node:child_process';
// This test CREATES and DELETES accounts/rooms. Never run against a live server.
if(process.env.TRIALUM_E2E_ISOLATED!=='1')throw Error('LW-A integration tests require an explicitly isolated disposable CI database.');

const base=process.env.TRIALUM_SHARED_BASE||'http://127.0.0.1:8787';
const http=async(path,method='GET',body,credential)=>{
 const r=await fetch(base+path,{method,
  headers:{...(body?{'content-type':'application/json'}:{}),
   ...(credential?{authorization:'Bearer '+credential}:{})},
  ...(body?{body:JSON.stringify(body)}:{})});
 return {status:r.status,data:await r.json().catch(()=>({}))};
};
const social=(path,method='GET',body,c)=>http('/v1/social/'+path,method,body,c);
const api=(path,method='GET',body,c)=>http('/v1/shared/'+path,method,body,c);
const pet=id=>({id,name:'Лумира',species:0,hue:190,eyes:2,shape:'jelly',growth:55,seed:180});
const user=async name=>{
 const r=await social('register','POST',{nickname:name});
 assert.equal(r.status,201,JSON.stringify(r));return r.data;
};
const friend=async(a,b)=>{
 const inv=await social('invites','POST',{},a.credential);
 assert.equal(inv.status,201);
 assert.equal((await social('invites/accept','POST',{code:inv.data.code},b.credential)).status,200);
};
const room=async owner=>{
 const r=await api('rooms','POST',{title:'LW-A приватен тест'},owner.credential);
 assert.equal(r.status,201,JSON.stringify(r));return r.data.room.id;
};
const join=async(owner,member,id)=>{
 const r=await api('rooms/'+id+'/invite','POST',{inviteeId:member.id},owner.credential);
 assert.equal(r.status,201,JSON.stringify(r));
 const a=await api('invitations/'+r.data.invitation.id+'/accept','POST',{},member.credential);
 assert.equal(a.status,200,JSON.stringify(a));
};
assert.equal((await api('presence')).status,401,'anonymous access rejected');
const status=await api('status','GET',null,'not-a-real-token');
assert.equal(status.status,401);
const owner=await user('LW-A сопственик'),guest=await user('LW-A гостин');
await friend(owner,guest);
const first=await room(owner),second=await room(owner);
await join(owner,guest,first);await join(owner,guest,second);
const check=await api('status','GET',null,guest.credential);
assert.equal(check.status,200);assert.equal(check.data.presenceEnabled,true);

// Two different friends in ONE authorized room must both see TWO live pets.
const ownerPet={...pet('owner-live-pet'),name:'Сопственик-Миленик'};
const guestPet={...pet('guest-live-pet'),name:'Гостин-Миленик'};
const ownerSession=randomUUID(),guestSession=randomUUID();
assert.equal((await api('presence/enter','POST',
 {roomId:first,sessionId:ownerSession,pet:ownerPet},owner.credential)).status,200);
assert.equal((await api('presence/enter','POST',
 {roomId:first,sessionId:guestSession,pet:guestPet},guest.credential)).status,200);
for(const actor of [owner,guest]){
 const response=await api('rooms/'+first+'/snapshot','GET',null,actor.credential);
 assert.equal(response.status,200,JSON.stringify(response));
 const occupants=response.data.occupants;
 assert.equal(occupants.length,2,'both authorized players must see both live pets');
 assert.deepEqual(new Set(occupants.map(x=>x.pet.id)),
  new Set(['owner-live-pet','guest-live-pet']));
 assert(occupants.some(x=>x.pet.name===ownerPet.name));
 assert(occupants.some(x=>x.pet.name===guestPet.name));
}
const otherRoom=await api('rooms/'+second+'/snapshot','GET',null,guest.credential);
assert.equal(otherRoom.status,200);
assert.equal(otherRoom.data.occupants.length,0,'different rooms cannot mix occupants');
assert.equal((await api('presence/return','POST',
 {petId:ownerPet.id,sessionId:ownerSession},owner.credential)).status,200);
assert.equal((await api('presence/return','POST',
 {petId:guestPet.id,sessionId:guestSession},guest.credential)).status,200);
assert.equal((await api('rooms/'+first+'/snapshot','GET',null,owner.credential)).data.occupants.length,0);

const firstId=randomUUID(),secondId=randomUUID(),figure=pet('presence-pet-1');
const concurrent=await Promise.all([
 api('presence/enter','POST',{roomId:first,sessionId:firstId,pet:figure},guest.credential),
 api('presence/enter','POST',{roomId:second,sessionId:secondId,pet:figure},guest.credential)
]);
assert.deepEqual(concurrent.map(v=>v.status).sort(),[200,409],
 'simultaneous room claims for same installation and pet must serialize');
const winning=concurrent.find(v=>v.status===200),losing=concurrent.find(v=>v.status===409);
assert.equal(losing.data.error,'pet_already_away');
const currentRoom=winning.data.roomId,currentId=winning.data.sessionId;
assert.equal((await api('presence','GET',null,guest.credential)).data.presence.length,1);
const replay=await api('presence/enter','POST',{roomId:currentRoom,sessionId:currentId,pet:figure},guest.credential);
assert.equal(replay.status,200);assert.equal(replay.data.duplicate,true);
assert.equal((await api('presence/return','POST',{petId:figure.id,sessionId:randomUUID()},guest.credential)).status,409,
 'stale return must never release active pet');
assert.equal((await api('rooms/'+currentRoom+'/activity','POST',
 {eventKey:randomUUID(),toyId:'sandbox',pet:figure},guest.credential)).status,409,
 'old APK cannot bypass server presence');
assert.equal((await api('rooms/'+currentRoom+'/activity','POST',
 {eventKey:randomUUID(),toyId:'sandbox',pet:figure,sessionId:randomUUID()},guest.credential)).status,409,
 'forged session blocked');
const key=randomUUID();
const twice=await Promise.all([
 api('rooms/'+currentRoom+'/activity','POST',{eventKey:key,toyId:'sandbox',pet:figure,sessionId:currentId},guest.credential),
 api('rooms/'+currentRoom+'/activity','POST',{eventKey:key,toyId:'sandbox',pet:figure,sessionId:currentId},guest.credential)
]);
assert.deepEqual(twice.map(v=>v.status).sort(),[200,200]);
assert.equal(twice.filter(v=>v.data.duplicate).length,1);
let snap=(await api('rooms/'+currentRoom+'/snapshot','GET',null,guest.credential)).data;
assert.equal(snap.points,1,'no double credit');
assert.equal(snap.presenceEnabled,true);
assert(snap.occupants.some(x=>x.pet.id===figure.id),'only live admitted occupants visible');
assert.equal((await api('presence/renew','POST',{roomId:currentRoom,petId:figure.id,sessionId:randomUUID()},guest.credential)).status,409);
assert.equal((await api('presence/renew','POST',{roomId:currentRoom,petId:figure.id,sessionId:currentId},guest.credential)).status,200);
assert.equal((await api('presence/return','POST',{petId:figure.id,sessionId:currentId},guest.credential)).status,200);
assert.equal((await api('presence/return','POST',{petId:figure.id,sessionId:currentId},guest.credential)).data.duplicate,true);
assert.equal((await api('presence','GET',null,guest.credential)).data.presence.length,0);
snap=(await api('rooms/'+currentRoom+'/snapshot','GET',null,guest.credential)).data;
assert(!snap.occupants.some(x=>x.pet.id===figure.id),'no ghost pet after return');
assert.equal((await api('rooms/'+currentRoom+'/activity','POST',
 {eventKey:randomUUID(),toyId:'sandbox',pet:figure,sessionId:currentId},guest.credential)).status,409,
 'return immediately revokes group credit');

// Pending outbound visit is a reservation, not a second physical pet.
const reservedPet=pet('reserved-pet');
const reserved=await api('visits','POST',{eventKey:randomUUID(),
 receiverId:owner.id,destination:'habitat',pet:reservedPet},guest.credential);
assert.equal(reserved.status,201,JSON.stringify(reserved));
assert.equal((await api('visits','POST',{eventKey:randomUUID(),
 receiverId:owner.id,destination:'habitat',pet:reservedPet},guest.credential)).status,409,
 'one pending visit per pet');
assert.equal((await api('presence/enter','POST',{roomId:first,sessionId:randomUUID(),
 pet:reservedPet},guest.credential)).status,409,'pending visit blocks shared entry');
assert.equal((await api('visits/'+reserved.data.visitId+'/decline','POST',{},owner.credential)).status,200);
const nowFree=await api('presence/enter','POST',
 {roomId:first,sessionId:randomUUID(),pet:reservedPet},guest.credential);
assert.equal(nowFree.status,200,'declined reservation releases pet');
assert.equal((await api('visits','POST',{eventKey:randomUUID(),
 receiverId:owner.id,destination:'habitat',pet:reservedPet},guest.credential)).status,409,
 'away pet cannot issue new visit invitation');
assert.equal((await api('presence/return','POST',
 {petId:reservedPet.id,sessionId:nowFree.data.sessionId},guest.credential)).status,200);

const visit=await api('visits','POST',{eventKey:randomUUID(),receiverId:owner.id,destination:'habitat',pet:pet('visit-pet')},guest.credential);
assert.equal(visit.status,201,JSON.stringify(visit));
const vid=visit.data.visitId;
assert.equal((await api('visits/'+vid+'/accept','POST',{},owner.credential)).status,200);
let active=(await api('presence','GET',null,guest.credential)).data.presence;
assert.equal(active.length,1);
assert.equal(active[0].kind,'visit');assert.equal(active[0].visitId,vid);
assert.equal((await api('presence/enter','POST',
 {roomId:first,sessionId:randomUUID(),pet:pet('visit-pet')},guest.credential)).status,409,
 'a visiting pet cannot be admitted to the shared playground');
assert.equal((await api('visits/'+vid+'/return','POST',{},owner.credential)).status,200);
assert.equal((await api('presence','GET',null,guest.credential)).data.presence.length,0);
assert.equal((await api('visits/'+vid+'/accept','POST',{},owner.credential)).status,409);

// Lease expiry must remove old occupants and allow a new unique session.
const ttlId=randomUUID(),ttlPet=pet('ttl-pet');
assert.equal((await api('presence/enter','POST',
 {roomId:first,sessionId:ttlId,pet:ttlPet},guest.credential)).status,200);
// Isolated CI database ONLY. No production DB address is accepted by this test.
execFileSync('docker',['compose','-f','server/compose.yaml','exec','-T','trialum-db',
 'psql','-X','-v','ON_ERROR_STOP=1','-U','trialum','-d','trialum_social',
 '-c',`UPDATE pet_presence SET expires_at=now()-interval '1 second'
  WHERE installation_id='${guest.id}' AND pet_ref='ttl-pet'`],
 {stdio:'pipe'});
assert(!(await api('presence','GET',null,guest.credential)).data.presence.some(x=>x.petId==='ttl-pet'));
assert(!(await api('rooms/'+first+'/snapshot','GET',null,guest.credential)).data.occupants.some(x=>x.pet.id==='ttl-pet'));
assert.equal((await api('presence/renew','POST',
 {roomId:first,petId:'ttl-pet',sessionId:ttlId},guest.credential)).status,409,
 'expired lease cannot renew or resurrect');
assert.equal((await api('rooms/'+first+'/activity','POST',
 {eventKey:randomUUID(),toyId:'sandbox',pet:ttlPet,sessionId:ttlId},guest.credential)).status,409,
 'expired lease cannot earn another reward');
const replaced=await api('presence/enter','POST',
 {roomId:first,sessionId:randomUUID(),pet:ttlPet},guest.credential);
assert.equal(replaced.status,200,'expired lease replaced without data loss');
assert.equal((await api('presence/return','POST',{petId:'ttl-pet',sessionId:ttlId},guest.credential)).status,409,
 'stale finish must not erase the new lease');
assert.equal((await api('presence','GET',null,guest.credential)).data.presence[0].sessionId,replaced.data.sessionId);
assert.equal((await api('presence/return','POST',{petId:'ttl-pet',sessionId:replaced.data.sessionId},guest.credential)).status,200);
assert.equal((await api('presence/return','POST',{petId:'ttl-pet',sessionId:replaced.data.sessionId},guest.credential)).data.duplicate,true);

const activeSession=randomUUID();
assert.equal((await api('presence/enter','POST',
 {roomId:first,sessionId:activeSession,pet:pet('block-pet')},guest.credential)).status,200);
assert.equal((await social('friends/'+guest.id+'/block','POST',{},owner.credential)).status,200);
assert.equal((await api('presence','GET',null,guest.credential)).data.presence.length,0,
 'blocked membership revokes leased presence');
assert.equal((await api('presence/enter','POST',
 {roomId:first,sessionId:randomUUID(),pet:pet('block-pet')},guest.credential)).status,403);
assert.equal((await api('rooms/'+first+'/snapshot','GET',null,guest.credential)).status,403);
assert.equal((await social('account','DELETE',null,guest.credential)).status,200);
console.log('PASS LW-A: unique atomic pet lease, conflict/replay/return, server-authoritative rewards, visits, block and account delete.');
