import {broadcast} from './live.mjs';
import {randomUUID,randomBytes,createHash} from 'node:crypto';
const uuid=x=>typeof x==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(x);
const token=x=>typeof x==='string'&&/^[A-Za-z0-9_-]{43}$/.test(x);
const sha=x=>createHash('sha256').update(x).digest();
const error=(name,status=400)=>{throw Object.assign(new Error(name),{status});};
const toys=['sandbox','seesaw','slide','pool','obstacle','trampoline'];
const costs={slide:12,pool:20,obstacle:30,trampoline:45};
const actions=['wave','spin','leap','symbols','logic','dialogue'];
async function tx(pool,fn){
 const c=await pool.connect();try{await c.query('BEGIN');const result=await fn(c);await c.query('COMMIT');return result;}
 catch(e){await c.query('ROLLBACK').catch(()=>{});throw e;}finally{c.release();}
}
async function member(db,id,actor){
 const q=await db.query('SELECT role FROM playground_members WHERE playground_id=$1 AND installation_id=$2',[id,actor]);
 return q.rows[0]?.role||null;
}
async function requireMember(db,id,actor){const role=await member(db,id,actor);if(!role)error('room_forbidden',403);return role;}
async function friends(db,a,b){
 const q=await db.query('SELECT 1 FROM friendships f WHERE f.player_a=LEAST($1::uuid,$2::uuid) AND f.player_b=GREATEST($1::uuid,$2::uuid) AND f.blocked_at IS NULL AND NOT EXISTS(SELECT 1 FROM friend_blocks b WHERE (b.blocker_id=$1 AND b.blocked_id=$2) OR (b.blocker_id=$2 AND b.blocked_id=$1))',[a,b]);
 return !!q.rowCount;
}
async function event(db,id,actor,key,kind,payload={}){
 const q=await db.query('INSERT INTO playground_events(playground_id,actor_id,event_key,kind,payload) VALUES($1,$2,$3,$4,$5) ON CONFLICT(playground_id,event_key) DO NOTHING RETURNING id,created_at',[id,actor,key,kind,JSON.stringify(payload)]);
 return q.rows[0];
}
export async function sharedRequest(req,pool,me,read,send,limit){
 const path=(req.url||'').split('?')[0],method=req.method;
 if(!path.startsWith('/v1/social/rooms')&&!path.startsWith('/v1/social/visits'))return false;
 try{
  limit('shared:'+me.id,120);
  if(path==='/v1/social/rooms'&&method==='GET'){
   const q=await pool.query('SELECT p.id,p.title,p.tier,m.role,w.earned_balance FROM playground_members m JOIN playgrounds p ON p.id=m.playground_id LEFT JOIN playground_wallets w ON w.playground_id=p.id WHERE m.installation_id=$1 AND p.retired_at IS NULL ORDER BY m.joined_at DESC LIMIT 20',[me.id]);
   send(200,{rooms:q.rows});return true;
  }
  if(path==='/v1/social/rooms'&&method==='POST'){
   limit('create-room:'+me.id,5);
   const b=await read(req),title=String(b.title||'').trim();
   if(!title||[...title].length>48||/[\u0000-\u001f\u007f]/.test(title))error('invalid_title');
   const result=await tx(pool,async db=>{
    const count=await db.query("SELECT COUNT(*)::int AS n FROM playground_members WHERE installation_id=$1 AND role='owner'",[me.id]);
    if(count.rows[0].n>=3)error('room_limit',429);
    const r=await db.query('INSERT INTO playgrounds(title,tier) VALUES($1,1) RETURNING id,title,tier',[title]),id=r.rows[0].id;
    await db.query("INSERT INTO playground_members(playground_id,installation_id,role) VALUES($1,$2,'owner')",[id,me.id]);
    await db.query("INSERT INTO playground_toys(playground_id,toy_id) VALUES($1,'sandbox'),($1,'seesaw')",[id]);
    await db.query('INSERT INTO playground_wallets(playground_id) VALUES($1)',[id]);
    return r.rows[0];
   });send(201,{room:result});return true;
  }
  if(path==='/v1/social/rooms/invites/accept'&&method==='POST'){
   const b=await read(req);if(!token(b.code))error('invalid_invite');
   const result=await tx(pool,async db=>{
    const q=await db.query('SELECT * FROM playground_invites WHERE token_hash=$1 AND recipient_id=$2 AND accepted_at IS NULL AND expires_at>now() FOR UPDATE',[sha(b.code),me.id]);
    if(!q.rowCount)error('invite_invalid_or_expired',404);
    const v=q.rows[0];
    const r=await db.query('SELECT id FROM playgrounds WHERE id=$1 AND retired_at IS NULL FOR UPDATE',[v.playground_id]);
    if(!r.rowCount)error('room_not_found',404);
    if(!await friends(db,v.inviter_id,me.id)||await member(db,v.playground_id,v.inviter_id)!=='owner')error('invite_revoked',403);
    const n=await db.query('SELECT COUNT(*)::int AS n FROM playground_members WHERE playground_id=$1',[v.playground_id]);
    if(n.rows[0].n>=8)error('room_full',409);
    await db.query("INSERT INTO playground_members(playground_id,installation_id,role) VALUES($1,$2,'member') ON CONFLICT DO NOTHING",[v.playground_id,me.id]);
    await db.query('UPDATE playground_invites SET accepted_at=now() WHERE token_hash=$1',[sha(b.code)]);
    await event(db,v.playground_id,me.id,randomUUID(),'member_join');
    return {roomId:v.playground_id,accepted:true};
   });send(200,result);return true;
  }
  if(path==='/v1/social/visits'&&method==='GET'){
   const q=await pool.query("SELECT id,sender_id,receiver_id,pet_ref,destination,playground_id,CASE WHEN expires_at<now() AND status IN ('pending','accepted') THEN 'expired' ELSE status END AS status,expires_at FROM visits WHERE sender_id=$1 OR receiver_id=$1 ORDER BY created_at DESC LIMIT 30",[me.id]);
   send(200,{visits:q.rows});return true;
  }
  if(path==='/v1/social/visits'&&method==='POST'){
   limit('visit:'+me.id,20);
   const b=await read(req);
   if(!uuid(b.receiverId)||b.receiverId===me.id||!['habitat','playground'].includes(b.destination)||typeof b.petRef!=='string'||!/^[A-Za-z0-9_-]{1,64}$/.test(b.petRef))error('invalid_visit');
   if(!await friends(pool,me.id,b.receiverId))error('friendship_required',403);
   const room=b.destination==='playground'?b.roomId:null;
   if(b.destination==='playground'&&!uuid(room))error('invalid_room');
   if(room&&(!await member(pool,room,me.id)||!await member(pool,room,b.receiverId)))error('room_forbidden',403);
   const q=await pool.query("INSERT INTO visits(sender_id,receiver_id,pet_ref,destination,playground_id,status,expires_at) VALUES($1,$2,$3,$4,$5,'pending',now()+interval '10 minutes') RETURNING id,status,expires_at",[me.id,b.receiverId,b.petRef,b.destination,room]);
   send(201,{visit:q.rows[0]});return true;
  }
  const visit=/^\/v1\/social\/visits\/([0-9a-f-]+)\/(accept|decline|return)$/i.exec(path);
  if(visit&&method==='POST'){
   if(!uuid(visit[1]))error('invalid_visit');
   const result=await tx(pool,async db=>{
    const q=await db.query('SELECT * FROM visits WHERE id=$1 FOR UPDATE',[visit[1]]);
    if(!q.rowCount)error('visit_not_found',404);
    const v=q.rows[0],op=visit[2];
    if(op==='return'){
     if(![v.sender_id,v.receiver_id].includes(me.id))error('visit_forbidden',403);
     if(!['pending','accepted'].includes(v.status))return {status:v.status};
     await db.query("UPDATE visits SET status='returned' WHERE id=$1",[v.id]);return {status:'returned'};
    }
    if(v.receiver_id!==me.id)error('visit_forbidden',403);
    if(v.status!=='pending'||new Date(v.expires_at)<=new Date())error('visit_expired',409);
    if(!await friends(db,v.sender_id,v.receiver_id))error('friendship_required',403);
    if(v.playground_id&&(!await member(db,v.playground_id,v.sender_id)||!await member(db,v.playground_id,v.receiver_id)))error('room_forbidden',403);
    const status=op==='accept'?'accepted':'declined';
    await db.query('UPDATE visits SET status=$2 WHERE id=$1',[v.id,status]);
    if(v.playground_id)await event(db,v.playground_id,me.id,randomUUID(),status==='accepted'?'visit_start':'visit_end',{visitId:v.id});
    return {status};
   });send(200,result);return true;
  }
  const room=/^\/v1\/social\/rooms\/([0-9a-f-]+)(?:\/(invites|members|events|actions|toys|expand|leave))?$/i.exec(path);
  if(!room)return false;
  const id=room[1],op=room[2]||'detail';if(!uuid(id))error('invalid_room');
  if(op==='detail'&&method==='GET'){
   await requireMember(pool,id,me.id);
   const [r,m,t,w,e]=await Promise.all([
    pool.query('SELECT id,title,tier FROM playgrounds WHERE id=$1 AND retired_at IS NULL',[id]),
    pool.query('SELECT m.installation_id,p.nickname,m.role FROM playground_members m JOIN installations p ON p.id=m.installation_id WHERE m.playground_id=$1 ORDER BY m.joined_at',[id]),
    pool.query('SELECT toy_id FROM playground_toys WHERE playground_id=$1',[id]),
    pool.query('SELECT earned_balance FROM playground_wallets WHERE playground_id=$1',[id]),
    pool.query('SELECT id,actor_id,kind,payload,created_at FROM playground_events WHERE playground_id=$1 ORDER BY id DESC LIMIT 40',[id])]);
   if(!r.rowCount)error('room_not_found',404);
   send(200,{room:r.rows[0],members:m.rows,toys:t.rows.map(x=>x.toy_id),balance:w.rows[0]?.earned_balance||0,events:e.rows.reverse()});return true;
  }
  if(op==='events'&&method==='GET'){
   await requireMember(pool,id,me.id);
   const cursor=Number(new URL(req.url,'http://localhost').searchParams.get('after')||0);
   if(!Number.isSafeInteger(cursor)||cursor<0)error('invalid_cursor');
   const q=await pool.query('SELECT id,actor_id,kind,payload,created_at FROM playground_events WHERE playground_id=$1 AND id>$2 ORDER BY id LIMIT 60',[id,cursor]);
   send(200,{events:q.rows,nextSequence:q.rows.at(-1)?.id||cursor});return true;
  }
  if(op==='invites'&&method==='POST'){
   limit('room-invite:'+me.id,15);
   const b=await read(req);if(!uuid(b.recipientId)||b.recipientId===me.id)error('invalid_recipient');
   const result=await tx(pool,async db=>{
    const room=await db.query('SELECT id FROM playgrounds WHERE id=$1 AND retired_at IS NULL FOR UPDATE',[id]);
    if(!room.rowCount)error('room_not_found',404);
    if(await requireMember(db,id,me.id)!=='owner')error('owner_required',403);
    if(!await friends(db,me.id,b.recipientId))error('friendship_required',403);
    const n=await db.query('SELECT COUNT(*)::int AS n FROM playground_members WHERE playground_id=$1',[id]);
    if(n.rows[0].n>=8)error('room_full',409);
    const code=randomBytes(32).toString('base64url');
    await db.query("INSERT INTO playground_invites(token_hash,playground_id,inviter_id,recipient_id,expires_at) VALUES($1,$2,$3,$4,now()+interval '15 minutes')",[sha(code),id,me.id,b.recipientId]);
    return {code,expiresInSeconds:900};
   });send(201,result);return true;
  }
  if(op==='leave'&&method==='POST'){
   const result=await tx(pool,async db=>{
    await db.query('SELECT id FROM playgrounds WHERE id=$1 FOR UPDATE',[id]);
    if(await requireMember(db,id,me.id)==='owner')error('owner_cannot_leave_without_transfer',409);
    await requireMember(db,id,me.id);
    await db.query('DELETE FROM playground_members WHERE playground_id=$1 AND installation_id=$2',[id,me.id]);
    await db.query("UPDATE visits SET status='returned' WHERE playground_id=$1 AND (sender_id=$2 OR receiver_id=$2) AND status IN ('pending','accepted')",[id,me.id]);
    await event(db,id,me.id,randomUUID(),'member_leave');
    return {left:true};
   });send(200,result);return true;
  }
  if(op==='members'&&method==='DELETE'){
   const b=await read(req);if(!uuid(b.memberId)||b.memberId===me.id)error('invalid_member');
   const result=await tx(pool,async db=>{
    await db.query('SELECT id FROM playgrounds WHERE id=$1 FOR UPDATE',[id]);
    if(await requireMember(db,id,me.id)!=='owner')error('owner_required',403);
    await db.query("DELETE FROM playground_members WHERE playground_id=$1 AND installation_id=$2 AND role='member'",[id,b.memberId]);
    await db.query("UPDATE visits SET status='returned' WHERE playground_id=$1 AND (sender_id=$2 OR receiver_id=$2) AND status IN ('pending','accepted')",[id,b.memberId]);
    await event(db,id,me.id,randomUUID(),'member_leave');
    return {removed:true};
   });send(200,result);return true;
  }
  if(op==='actions'&&method==='POST'){
   limit('room-action:'+me.id,60);
   const b=await read(req);
   if(!uuid(b.eventKey)||!toys.includes(b.toy)||!actions.includes(b.action))error('invalid_action');
   const result=await tx(pool,async db=>{
    const room=await db.query('SELECT id FROM playgrounds WHERE id=$1 AND retired_at IS NULL FOR UPDATE',[id]);
    if(!room.rowCount)error('room_not_found',404);
    await requireMember(db,id,me.id);
    const old=await db.query('SELECT id FROM playground_events WHERE playground_id=$1 AND event_key=$2',[id,b.eventKey]);
    if(old.rowCount)return {duplicate:true,sequence:old.rows[0].id};
    const available=await db.query('SELECT 1 FROM playground_toys WHERE playground_id=$1 AND toy_id=$2',[id,b.toy]);
    if(!available.rowCount)error('toy_locked',403);
    const last=await db.query("SELECT created_at FROM playground_events WHERE playground_id=$1 AND actor_id=$2 AND kind='action' ORDER BY id DESC LIMIT 1",[id,me.id]);
    if(last.rowCount&&Date.now()-new Date(last.rows[0].created_at).getTime()<8000)error('action_cooldown',429);
    const n=await db.query("INSERT INTO playground_contribution_limits(playground_id,installation_id,day,amount) VALUES($1,$2,CURRENT_DATE,1) ON CONFLICT(playground_id,installation_id,day) DO UPDATE SET amount=playground_contribution_limits.amount+1 WHERE playground_contribution_limits.amount<30 RETURNING amount",[id,me.id]);
    if(!n.rowCount)error('daily_limit',429);
    const e=await event(db,id,me.id,b.eventKey,'action',{toy:b.toy,action:b.action,durationMs:2400});
    await db.query('UPDATE playground_wallets SET earned_balance=earned_balance+1 WHERE playground_id=$1',[id]);
    return {sequence:e.id,earnedEffort:1};
   });if(result.sequence)broadcast(id,result.sequence);send(200,result);return true;
  }
  if((op==='toys'||op==='expand')&&method==='POST'){
   const b=await read(req);if(!uuid(b.eventKey)||(op==='toys'&&!Object.hasOwn(costs,b.toy)))error('invalid_upgrade');
   const result=await tx(pool,async db=>{
    const r=await db.query('SELECT tier FROM playgrounds WHERE id=$1 AND retired_at IS NULL FOR UPDATE',[id]);
    if(!r.rowCount)error('room_not_found',404);
    if(await requireMember(db,id,me.id)!=='owner')error('owner_required',403);
    const old=await db.query('SELECT id FROM playground_events WHERE playground_id=$1 AND event_key=$2',[id,b.eventKey]);
    if(old.rowCount)return {duplicate:true,sequence:old.rows[0].id};
    const tier=r.rows[0].tier;
    if(op==='expand'&&tier>=5)error('max_tier',409);
    if(op==='toys'){
     const exists=await db.query('SELECT 1 FROM playground_toys WHERE playground_id=$1 AND toy_id=$2',[id,b.toy]);
     if(exists.rowCount)error('already_unlocked',409);
     const n=await db.query('SELECT COUNT(*)::int AS n FROM playground_toys WHERE playground_id=$1',[id]);
     if(n.rows[0].n>=2+tier)error('no_space',409);
    }
    const price=op==='expand'?10+tier*12:costs[b.toy];
    const w=await db.query('UPDATE playground_wallets SET earned_balance=earned_balance-$2 WHERE playground_id=$1 AND earned_balance>=$2 RETURNING earned_balance',[id,price]);
    if(!w.rowCount)error('insufficient_shared_effort',409);
    if(op==='expand')await db.query('UPDATE playgrounds SET tier=tier+1 WHERE id=$1',[id]);
    else await db.query('INSERT INTO playground_toys(playground_id,toy_id) VALUES($1,$2)',[id,b.toy]);
    const e=await event(db,id,me.id,b.eventKey,op==='expand'?'space_expand':'toy_unlock',{toy:op==='toys'?b.toy:null,cost:price});
    return {sequence:e.id,balance:w.rows[0].earned_balance};
   });if(result.sequence)broadcast(id,result.sequence);send(200,result);return true;
  }
  error('not_found',404);
 }catch(e){send(e.status||500,{error:e.status?e.message:'internal_error'});return true;}
}
