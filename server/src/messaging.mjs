import {randomUUID} from 'node:crypto';
import {authenticate,blocked,ordered,uuidValid,limit,json,jsonBody} from './social.mjs';
import {seal,open} from './data-crypto.mjs';

// Only preapproved short phrases while safety review for free text is pending.
export const PRESETS=Object.freeze({
  hello:'👋 Здраво, пријателе!',visit:'🐾 Може ли да те посетам?',
  play:'🎠 Ајде да играме!',thanks:'💚 Ти благодарам!',
  great:'✨ Браво за играта!',later:'🌙 Ќе играме подоцна!',
  welcome:'🏡 Добредојде!',bye:'👋 Се гледаме!'
});
const STATUS=Object.freeze({
  friend_joined:'Пријателството е потврдено',room_invitation:'Покана за заедничка игротека',
  room_joined:'Пријател влезе во игротеката',visit_pending:'Покана за посета',
  visit_arrived:'Милениче пристигна на посета',visit_ended:'Посетата заврши',
  shared_upgrade:'Игротеката е надградена',room_closed:'Заедничката игротека е затворена'
});
const err=(status,message)=>{throw Object.assign(new Error(message),{status});};
const permitted=async(db,a,b)=>{
  const [x,y]=ordered(a,b);
  const q=await db.query(
    'SELECT 1 FROM friendships f WHERE f.player_a=$1 AND f.player_b=$2 AND f.blocked_at IS NULL AND NOT EXISTS(SELECT 1 FROM friend_blocks b WHERE (b.blocker_id=$1 AND b.blocked_id=$2) OR (b.blocker_id=$2 AND b.blocked_id=$1))',
    [x,y]);
  return !!q.rowCount;
};
async function transaction(pool,fn){
  const c=await pool.connect();
  try{await c.query('BEGIN');const v=await fn(c);await c.query('COMMIT');return v;}
  catch(e){await c.query('ROLLBACK').catch(()=>{});throw e;}finally{c.release();}
}
function cors(req,res){
  const allowed=process.env.SOCIAL_CORS_ORIGIN||'https://appassets.androidplatform.net';
  const origin=req.headers.origin;
  if(origin&&origin!==allowed){json(res,403,{error:'origin_not_allowed'});return false;}
  if(origin===allowed){
    res.setHeader('access-control-allow-origin',allowed);res.setHeader('vary','Origin');
    res.setHeader('access-control-allow-methods','GET,POST,DELETE,OPTIONS');
    res.setHeader('access-control-allow-headers','authorization,content-type');
    res.setHeader('access-control-max-age','600');
  }
  return true;
}
function plaintext(body){
  if(typeof body!=='string')err(400,'invalid_text');
  const value=body.trim(),chars=Array.from(value);
  if(chars.length<1||chars.length>120||/[<>\u0000-\u001f\u007f]/u.test(value))err(400,'invalid_text');
  if(/https?:\/\/|www\.|[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}|\+?\d[\d\s().-]{7,}\d/iu.test(value))
    err(400,'contact_details_disallowed');
  return value;
}
function display(row){
  const kind=row.kind||'preset';
  let text=kind==='preset'?(PRESETS[row.preset_id]||''):'';
  if(kind==='text' && row.text_ciphertext){
    try{text=open(row.text_ciphertext,'message-text');}catch(_){text='[Пораката е недостапна]';}
  }
  return{id:row.id,kind,text,from:row.sender_id,to:row.receiver_id,
    senderName:row.sender_name,receiverName:row.receiver_name,
    sentAt:row.sent_at,readAt:row.read_at,expiresAt:row.expires_at,
    mine:row.mine===true,presetId:row.preset_id||null};
}
export function createMessaging(pool,enabled,push,signal=()=>{}){
  const pushAvailable=!!push?.enabled;
  const freeText=enabled&&process.env.TRIALUM_FREE_TEXT_ENABLED==='true';
  function deliver(to,ref,from=null){
    if(pushAvailable)push.notify(to,ref,from).catch(()=>{});
  }
  async function onGameEvent(e){
    if(!enabled||!e||typeof e!=='object')return;
    let kind,targets=[],actor=e.actorId||null,room=e.roomId||null;
    const ref=uuidValid(e.referenceId)?e.referenceId:null;
    if(e.type==='friend_joined'){kind='friend_joined';targets=[e.targetId];}
    else if(e.type==='invitation'){kind='room_invitation';targets=[e.targetId];}
    else if(e.type==='room_joined'){kind='room_joined';targets=[e.targetId];}
    else if(e.type==='visit_request'){kind='visit_pending';targets=[e.targetId];}
    else if(e.type==='visit_changed'){
      kind=e.action==='accept'?'visit_arrived':'visit_ended';targets=[e.targetId];
    }
    else if(e.type==='shared_upgrade'&&uuidValid(room)){
      kind='shared_upgrade';
      const q=await pool.query('SELECT installation_id FROM playground_members WHERE playground_id=$1',[room]);
      targets=q.rows.map(x=>x.installation_id).filter(id=>id!==actor);
    }else return;
    if(!STATUS[kind])return;
    for(const to of targets){
      if(!uuidValid(to)||!uuidValid(actor)||to===actor)continue;
      if(!(await permitted(pool,to,actor)))continue;
      const q=await pool.query(
        'INSERT INTO event_cards(receiver_id,actor_id,kind,reference_id,room_id) VALUES($1,$2,$3,$4,$5) RETURNING id',
        [to,actor,kind,ref,room]);
      deliver(to,q.rows[0].id,actor);
    }
  }
  async function request(req,res){
    const path=(req.url||'').split('?')[0];
    if(!path.startsWith('/v1/messages/'))return false;
    try{
      if(!cors(req,res))return true;
      if(!enabled||!pool){json(res,503,{error:'messages_disabled'});return true;}
      if(req.method==='OPTIONS'){res.writeHead(204);res.end();return true;}
      if(!['GET','POST','DELETE'].includes(req.method)){json(res,405,{error:'method_not_allowed'});return true;}
      const me=await authenticate(req,pool);
      limit('messages-readwrite:'+me.id,180);
      if(path==='/v1/messages/status'&&req.method==='GET'){
        json(res,200,{ready:true,freeTextEnabled:freeText,pushAvailable,presets:PRESETS,retentionDays:7});
        return true;
      }
      if(path==='/v1/messages/inbox'&&req.method==='GET'){
        const [messages,events,mutes,pushRow]=await Promise.all([
          pool.query(
            'SELECT m.*,s.nickname AS sender_name,r.nickname AS receiver_name,(m.sender_id=$1) AS mine FROM message_cards m JOIN installations s ON s.id=m.sender_id JOIN installations r ON r.id=m.receiver_id WHERE (m.receiver_id=$1 AND m.receiver_deleted_at IS NULL OR m.sender_id=$1 AND m.sender_deleted_at IS NULL) AND m.expires_at>now() ORDER BY m.sent_at DESC LIMIT 80',[me.id]),
          pool.query(
            'SELECT e.id,e.kind,e.actor_id,e.reference_id,e.room_id,e.created_at,e.read_at,p.nickname AS actor_name FROM event_cards e LEFT JOIN installations p ON p.id=e.actor_id WHERE e.receiver_id=$1 AND e.expires_at>now() ORDER BY e.created_at DESC LIMIT 70',[me.id]),
          pool.query('SELECT other_id FROM friend_mutes WHERE owner_id=$1',[me.id]),
          pool.query('SELECT 1 FROM push_registrations WHERE installation_id=$1',[me.id])
        ]);
        const list=[];
        for(const row of messages.rows){
          if(await permitted(pool,row.sender_id,row.receiver_id))list.push(display(row));
        }
        const updates=[];
        for(const e of events.rows){
          if(e.actor_id && !await permitted(pool,me.id,e.actor_id))continue;
          updates.push({id:e.id,kind:e.kind,label:STATUS[e.kind]||'Известување',
            actorId:e.actor_id,actorName:e.actor_name||'Играч',
            roomId:e.room_id,referenceId:e.reference_id,createdAt:e.created_at,readAt:e.read_at});
        }
        json(res,200,{messages:list,events:updates,mutes:mutes.rows.map(x=>x.other_id),pushRegistered:!!pushRow.rowCount});
        return true;
      }
      if(path==='/v1/messages/send'&&req.method==='POST'){
        limit('messages-send:'+me.id,18);
        const data=await jsonBody(req);
        if(!uuidValid(data.receiverId)||data.receiverId===me.id||!uuidValid(data.eventKey))err(400,'invalid_recipient');
        if(!['preset','text'].includes(data.kind))err(400,'invalid_kind');
        let preset=null,textCipher=null;
        if(data.kind==='preset'){
          if(typeof data.presetId!=='string'||!Object.hasOwn(PRESETS,data.presetId))err(400,'invalid_preset');
          preset=data.presetId;
        }else{
          if(!freeText)err(403,'free_text_disabled');
          textCipher=seal(plaintext(data.text),'message-text');
        }
        const value=await transaction(pool,async c=>{
          const [a,b]=ordered(me.id,data.receiverId);
          await c.query('SELECT pg_advisory_xact_lock(hashtextextended($1 || $2,0))',[a,b]);
          const prior=await c.query('SELECT id,sender_id,receiver_id FROM message_cards WHERE request_key=$1',[data.eventKey]);
          if(prior.rowCount){
            if(prior.rows[0].sender_id!==me.id||prior.rows[0].receiver_id!==data.receiverId)err(409,'event_conflict');
            return {id:prior.rows[0].id,duplicate:true};
          }
          if(!await permitted(c,me.id,data.receiverId))err(403,'friendship_required');
          const counts=await c.query(
            "SELECT count(*) FILTER(WHERE sent_at>now()-interval '15 minutes')::int AS recent,count(*) FILTER(WHERE sent_at>now()-interval '1 hour')::int AS hourly FROM message_cards WHERE sender_id=$1 AND receiver_id=$2",[me.id,data.receiverId]);
          if(counts.rows[0].recent>=6||counts.rows[0].hourly>=16)err(429,'friend_message_limit');
          const pending=await c.query(
            'SELECT count(*)::int n FROM message_cards WHERE receiver_id=$1 AND read_at IS NULL AND expires_at>now()',[data.receiverId]);
          if(pending.rows[0].n>=40)err(429,'recipient_inbox_full');
          const q=await c.query(
            'INSERT INTO message_cards(sender_id,receiver_id,kind,preset_id,text_ciphertext,request_key) VALUES($1,$2,$3,$4,$5,$6) RETURNING id',
            [me.id,data.receiverId,data.kind,preset,textCipher,data.eventKey]);
          return {id:q.rows[0].id,duplicate:false};
        });
        if(!value.duplicate){
          signal({type:'message_card',targetId:data.receiverId,actorId:me.id});
          deliver(data.receiverId,value.id,me.id);
        }
        json(res,201,value);return true;
      }
      const card=/^\/v1\/messages\/cards\/([0-9a-f-]{36})(?:\/(read|report))?$/i.exec(path);
      if(card&&uuidValid(card[1])){
        const id=card[1],action=card[2]||'';
        if(action==='read'&&req.method==='POST'){
          const q=await pool.query('UPDATE message_cards SET read_at=coalesce(read_at,now()) WHERE id=$1 AND receiver_id=$2 AND receiver_deleted_at IS NULL AND expires_at>now() RETURNING id',[id,me.id]);
          if(!q.rowCount)err(404,'message_not_found');
          json(res,200,{read:true});return true;
        }
        if(action==='report'&&req.method==='POST'){
          limit('report:'+me.id,8);
          const {reason}=await jsonBody(req);
          if(!['spam','bullying','unsafe','other'].includes(reason))err(400,'invalid_reason');
          const q=await pool.query('SELECT sender_id FROM message_cards WHERE id=$1 AND receiver_id=$2 AND receiver_deleted_at IS NULL',[id,me.id]);
          if(!q.rowCount)err(404,'message_not_found');
          await pool.query(
            'INSERT INTO message_reports(message_id,reporter_id,reported_sender_id,reason) VALUES($1,$2,$3,$4) ON CONFLICT(message_id,reporter_id) DO NOTHING',
            [id,me.id,q.rows[0].sender_id,reason]);
          json(res,200,{reported:true});return true;
        }
        if(!action&&req.method==='DELETE'){
          const q=await pool.query(
            'UPDATE message_cards SET sender_deleted_at=CASE WHEN sender_id=$2 THEN now() ELSE sender_deleted_at END,receiver_deleted_at=CASE WHEN receiver_id=$2 THEN now() ELSE receiver_deleted_at END WHERE id=$1 AND (sender_id=$2 OR receiver_id=$2) RETURNING id',
            [id,me.id]);
          if(!q.rowCount)err(404,'message_not_found');
          await pool.query('DELETE FROM message_cards WHERE id=$1 AND sender_deleted_at IS NOT NULL AND receiver_deleted_at IS NOT NULL',[id]);
          json(res,200,{deleted:true});return true;
        }
      }
      const event=/^\/v1\/messages\/events\/([0-9a-f-]{36})(?:\/read)?$/i.exec(path);
      if(event&&uuidValid(event[1])){
        if(req.method==='POST'&&path.endsWith('/read')){
          const q=await pool.query('UPDATE event_cards SET read_at=coalesce(read_at,now()) WHERE id=$1 AND receiver_id=$2 RETURNING id',[event[1],me.id]);
          if(!q.rowCount)err(404,'event_not_found');
          json(res,200,{read:true});return true;
        }
        if(req.method==='DELETE'){
          await pool.query('DELETE FROM event_cards WHERE id=$1 AND receiver_id=$2',[event[1],me.id]);
          json(res,200,{deleted:true});return true;
        }
      }
      const mute=/^\/v1\/messages\/mutes\/([0-9a-f-]{36})$/i.exec(path);
      if(mute&&uuidValid(mute[1])&&['POST','DELETE'].includes(req.method)){
        if(mute[1]===me.id)err(400,'invalid_friend');
        if(req.method==='POST'){
          if(!await permitted(pool,me.id,mute[1]))err(403,'friendship_required');
          await pool.query('INSERT INTO friend_mutes(owner_id,other_id) VALUES($1,$2) ON CONFLICT DO NOTHING',[me.id,mute[1]]);
        }else await pool.query('DELETE FROM friend_mutes WHERE owner_id=$1 AND other_id=$2',[me.id,mute[1]]);
        json(res,200,{muted:req.method==='POST'});return true;
      }
      if(path==='/v1/messages/push'&&req.method==='GET'){
        const q=await pool.query('SELECT 1 FROM push_registrations WHERE installation_id=$1',[me.id]);
        json(res,200,{registered:!!q.rowCount,available:pushAvailable});return true;
      }
      if(path==='/v1/messages/push'&&req.method==='DELETE'){
        await pool.query('DELETE FROM push_registrations WHERE installation_id=$1',[me.id]);
        json(res,200,{disabled:true});return true;
      }
      if(path==='/v1/messages/push'&&req.method==='POST'){
        if(!pushAvailable)err(503,'push_not_configured');
        limit('push-register:'+me.id,12);
        const {token,consent}=await jsonBody(req,8192);
        if(consent!==true||typeof token!=='string'||token.length<64||token.length>4096||
          !/^[A-Za-z0-9:_-]+$/.test(token))err(400,'invalid_push_token');
        const encoded=seal(token,'fcm-token');
        await pool.query(
          'INSERT INTO push_registrations(installation_id,token_ciphertext,consented_at) VALUES($1,$2,now()) ON CONFLICT(installation_id) DO UPDATE SET token_ciphertext=excluded.token_ciphertext,consented_at=excluded.consented_at,rotated_at=now()',
          [me.id,encoded]);
        json(res,200,{registered:true});return true;
      }
      json(res,404,{error:'not_found'});return true;
    }catch(e){
      if(res.headersSent)return true;
      const code=Number.isInteger(e.status)?e.status:500;
      json(res,code,{error:code===500?'internal_error':e.message});
      return true;
    }
  }
  return {request,onGameEvent,enabled,pushAvailable};
}
