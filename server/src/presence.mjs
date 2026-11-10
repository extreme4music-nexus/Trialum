/* TRIALUM LW-A — one server-authoritative lease per installation/pet.
 * Claims and releases MUST run inside caller transactions. Never trust client XP.
 * No account e-mail, location, device ID, private text, or full game state.
 */
import {randomUUID} from 'node:crypto';

const TTL_MINUTES=120;
const fail=(status,message)=>{throw Object.assign(new Error(message),{status});};
const validPet=id=>typeof id==='string'&&/^[A-Za-z0-9_-]{1,64}$/.test(id);
const uuid=id=>typeof id==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
const map=r=>({
 petId:r.pet_ref,sessionId:r.session_id,kind:r.location_kind,
 roomId:r.room_id||null,visitId:r.visit_id||null,expiresAt:r.expires_at
});
async function lockOwner(db,owner){
 const r=await db.query('SELECT id FROM installations WHERE id=$1 AND revoked_at IS NULL FOR UPDATE',[owner]);
 if(!r.rowCount)fail(401,'account_revoked');
}
async function existing(db,owner,petId){
 const r=await db.query('SELECT * FROM pet_presence WHERE installation_id=$1 AND pet_ref=$2 FOR UPDATE',[owner,petId]);
 return r.rows[0]||null;
}
function validSession(sessionId){if(!uuid(sessionId))fail(400,'invalid_presence_session');}
function validPetId(petId){if(!validPet(petId))fail(400,'invalid_pet');}
async function admitShared(db,owner,roomId,pet,sessionId){
 validPetId(pet?.id);validSession(sessionId);
 await lockOwner(db,owner); // serializes same installation claims across all devices
 const member=await db.query(
  'SELECT 1 FROM playground_members WHERE playground_id=$1 AND installation_id=$2 FOR KEY SHARE',
  [roomId,owner]);
 if(!member.rowCount)fail(403,'room_access_denied');
 const reservation=await db.query(`SELECT 1 FROM visits
  WHERE sender_id=$1 AND pet_ref=$2 AND status='pending' AND expires_at>now() LIMIT 1`,[owner,pet.id]);
 if(reservation.rowCount)fail(409,'pet_visit_pending');
 const old=await existing(db,owner,pet.id);
 if(old&&new Date(old.expires_at).getTime()>Date.now()){
  if(old.location_kind!=='shared'||old.room_id!==roomId||old.session_id!==sessionId)
   fail(409,'pet_already_away');
  await db.query("UPDATE pet_presence SET updated_at=now(),expires_at=now()+interval '2 hours' WHERE installation_id=$1 AND pet_ref=$2",
   [owner,pet.id]);
  return {duplicate:true,petId:pet.id,sessionId,roomId,kind:'shared'};
 }
 if(old)await db.query('DELETE FROM pet_presence WHERE installation_id=$1 AND pet_ref=$2',[owner,pet.id]);
 await db.query(`INSERT INTO pet_presence(installation_id,pet_ref,session_id,location_kind,room_id,pet_public,expires_at)
   VALUES($1,$2,$3,'shared',$4,$5::jsonb,now()+interval '2 hours')`,
  [owner,pet.id,sessionId,roomId,JSON.stringify(pet)]);
 return {duplicate:false,petId:pet.id,sessionId,roomId,kind:'shared'};
}
async function admitVisit(db,visit){
 validPetId(visit.pet_ref);
 await lockOwner(db,visit.sender_id);
 const old=await existing(db,visit.sender_id,visit.pet_ref);
 if(old&&new Date(old.expires_at).getTime()>Date.now())
  fail(409,'pet_already_away');
 if(old)await db.query('DELETE FROM pet_presence WHERE installation_id=$1 AND pet_ref=$2',[visit.sender_id,visit.pet_ref]);
 const id=randomUUID();
 const q=await db.query(`INSERT INTO pet_presence
 (installation_id,pet_ref,session_id,location_kind,visit_id,pet_public,expires_at)
 VALUES($1,$2,$3,'visit',$4,$5::jsonb,now()+interval '2 hours') RETURNING *`,
 [visit.sender_id,visit.pet_ref,id,visit.id,JSON.stringify(visit.pet_public)]);
 return map(q.rows[0]);
}
async function release(db,owner,petId,sessionId){
 validPetId(petId);validSession(sessionId);
 await lockOwner(db,owner);
 const old=await existing(db,owner,petId);
 if(!old)return {returned:true,duplicate:true};
 if(old.session_id!==sessionId)fail(409,'stale_presence_session');
 await db.query('DELETE FROM pet_presence WHERE installation_id=$1 AND pet_ref=$2',[owner,petId]);
 return {returned:true,duplicate:false,roomId:old.room_id||null};
}
async function releaseVisit(db,visitId){
 await db.query("DELETE FROM pet_presence WHERE location_kind='visit' AND visit_id=$1",[visitId]);
}
async function list(db,owner){
 const r=await db.query("SELECT * FROM pet_presence WHERE installation_id=$1 AND expires_at>now() ORDER BY pet_ref LIMIT 1000",[owner]);
 return r.rows.map(map);
}
async function assertRoomPet(db,owner,roomId,petId,sessionId){
 validPetId(petId);validSession(sessionId);
 const r=await db.query(`SELECT 1 FROM pet_presence
 WHERE installation_id=$1 AND pet_ref=$2 AND room_id=$3
 AND session_id=$4 AND location_kind='shared' AND expires_at>now() FOR UPDATE`,
 [owner,petId,roomId,sessionId]);
 if(!r.rowCount)fail(409,'pet_not_present');
}
async function renew(db,owner,roomId,petId,sessionId){
 await lockOwner(db,owner);
 await assertRoomPet(db,owner,roomId,petId,sessionId);
 const r=await db.query(`UPDATE pet_presence SET expires_at=now()+interval '2 hours',updated_at=now()
 WHERE installation_id=$1 AND pet_ref=$2 AND session_id=$3 RETURNING expires_at`,
 [owner,petId,sessionId]);
 return {renewed:true,expiresAt:r.rows[0].expires_at};
}
async function occupants(db,roomId){
 const q=await db.query(`SELECT p.pet_public,i.nickname
 FROM pet_presence p
 JOIN installations i ON i.id=p.installation_id AND i.revoked_at IS NULL
 JOIN playground_members m ON m.installation_id=p.installation_id AND m.playground_id=p.room_id
 WHERE p.room_id=$1 AND p.location_kind='shared' AND p.expires_at>now()
 ORDER BY p.updated_at DESC LIMIT 24`,[roomId]);
 return q.rows.map(x=>({pet:x.pet_public,display:x.nickname}));
}
async function removeMember(db,roomId,memberId){
 await db.query("DELETE FROM pet_presence WHERE room_id=$1 AND installation_id=$2",[roomId,memberId]);
}
async function sweep(db){
 await db.query('DELETE FROM pet_presence WHERE expires_at<=now()');
}
export {TTL_MINUTES,validPet,uuid,admitShared,admitVisit,release,releaseVisit,list,assertRoomPet,renew,occupants,removeMember,sweep};
