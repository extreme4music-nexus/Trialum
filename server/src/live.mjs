
import {WebSocketServer,WebSocket} from 'ws';
import {createHash} from 'node:crypto';
import {roomFor} from './shared.mjs';
import {parsePetSpeech} from './pet-speech.mjs';

// Bounded authenticated WSS: credentials must NEVER appear in URLs, logs, or
// WebSocket subprotocols. Authenticated dirty notifications and opt-in ephemeral
// pet speech travel via WS. No messages are stored; WS never awards rewards.
export function createLive(server,pool,enabled){
 const wss=new WebSocketServer({noServer:true,maxPayload:2048,perMessageDeflate:false});
 const peers=new Set();
 const speechEnabled=process.env.PLAYGROUND_AI_ENABLED==='true'&&process.env.PRESENCE_ENABLED==='true';
 const actorLastSpeech=new Map(); // ephemeral per-installation/room cooldown; never saved
 function send(ws,value){
  if(ws.readyState===WebSocket.OPEN && ws.bufferedAmount<16384)
    ws.send(JSON.stringify(value));
 }
 // Room-scoped, ephemeral connection availability. No activity/online database,
 // IPs, timestamps, or global friend tracking. Presence lease remains live.
 async function reportUnavailable(peer){
  if(!peer.userId)return;
  for(const roomId of peer.roomIds){
   // The same installation can have another active authorized room connection.
   if([...peers].some(p=>p.userId===peer.userId&&p.roomIds.has(roomId)&&
      p.ws.readyState===WebSocket.OPEN))continue;
   const q=await pool.query(`SELECT i.nickname FROM pet_presence p
     JOIN installations i ON i.id=p.installation_id AND i.revoked_at IS NULL
     JOIN playground_members m ON m.installation_id=p.installation_id
       AND m.playground_id=p.room_id
     WHERE p.installation_id=$1 AND p.room_id=$2
       AND p.location_kind='shared' AND p.expires_at>now() LIMIT 1`,
    [peer.userId,roomId]);
   if(!q.rowCount)continue;
   const display=String(q.rows[0].nickname||'Играч').slice(0,48);
   for(const target of peers){
    if(!target.userId||target.userId===peer.userId||!target.roomIds.has(roomId))continue;
    try{await roomFor(pool,roomId,target.userId);}catch(_){
     target.roomIds.delete(roomId);continue;
    }
    send(target.ws,{type:'room_peer_unavailable',roomId,display});
   }
  }
 }
 server.on('upgrade',(req,socket,head)=>{
  const path=(req.url||'').split('?')[0];
  if(path!=='/v1/social/live'||!enabled||!pool){socket.destroy();return;}
  const origin=req.headers.origin,allowed=process.env.SOCIAL_CORS_ORIGIN||'https://appassets.androidplatform.net';
  if((origin&&origin!==allowed)||peers.size>=150){socket.destroy();return;}
  wss.handleUpgrade(req,socket,head,ws=>wss.emit('connection',ws,req));
 });
 wss.on('connection',(ws,req)=>{
  const peer={ws,userId:null,roomIds:new Set(),alive:true,count:0,windowStart:Date.now()};
  peers.add(peer);
  const deadline=setTimeout(()=>{if(!peer.userId)ws.close(1008,'auth_required');},5000);
  const cleanup=()=>{
   clearTimeout(deadline);
   if(peers.delete(peer))void reportUnavailable(peer).catch(()=>{});
  };
  ws.on('close',cleanup);ws.on('error',cleanup);ws.on('pong',()=>{peer.alive=true;});
  ws.on('message',async bytes=>{
   try{
    if(Date.now()-peer.windowStart>60000){peer.windowStart=Date.now();peer.count=0;}
    if(++peer.count>60){ws.close(1008,'rate_limit');return;}
    const message=JSON.parse(bytes.toString('utf8'));
    if(!message||typeof message!=='object'||Array.isArray(message))throw Error('invalid_message');
    if(!peer.userId){
     if(message.type!=='auth'||typeof message.credential!=='string'||!/^[A-Za-z0-9_-]{43}$/.test(message.credential))throw Error('auth_required');
     const hash=createHash('sha256').update(message.credential).digest();
     const user=await pool.query('SELECT id FROM installations WHERE credential_hash=$1 AND revoked_at IS NULL',[hash]);
     if(!user.rowCount)throw Error('auth_required');
     if([...peers].filter(p=>p.userId===user.rows[0].id).length>=3)throw Error('too_many_connections');
     peer.userId=user.rows[0].id;
     send(ws,{type:'ready'});return;
    }
    if(message.type==='subscribe'){
     if(typeof message.roomId!=='string'||!/[0-9a-f-]{36}/i.test(message.roomId))throw Error('invalid_room');
     await roomFor(pool,message.roomId,peer.userId);
     if(peer.roomIds.size>=8&&!peer.roomIds.has(message.roomId))throw Error('room_limit');
     peer.roomIds.add(message.roomId);
     send(ws,{type:'subscribed',roomId:message.roomId});return;
    }
    if(message.type==='pet_speech'){
     if(!speechEnabled)throw Error('speech_disabled');
     const speech=parsePetSpeech(message);
     if(!peer.roomIds.has(speech.roomId))throw Error('not_subscribed');
     // A room subscription alone is NOT proof of actual pet presence.
     await roomFor(pool,speech.roomId,peer.userId);
     const actor=await pool.query(`SELECT pet_public->>'name' AS name FROM pet_presence
       WHERE installation_id=$1 AND room_id=$2 AND pet_ref=$3 AND session_id=$4
       AND location_kind='shared' AND expires_at>now() LIMIT 1`,
       [peer.userId,speech.roomId,speech.petId,speech.sessionId]);
     if(!actor.rowCount)throw Error('pet_not_present');
     const now=Date.now(),key=peer.userId+'|'+speech.roomId;
     if(now-(actorLastSpeech.get(key)||0)<10000)throw Error('speech_cooldown');
     if(peer.recentTurns?.has(speech.turnId))throw Error('speech_replay');
     peer.recentTurns=peer.recentTurns||new Set();
     peer.recentTurns.add(speech.turnId);
     if(peer.recentTurns.size>24)peer.recentTurns.delete(peer.recentTurns.values().next().value);
     actorLastSpeech.set(key,now);
     if(actorLastSpeech.size>1500)actorLastSpeech.clear();
     // Only authenticated, subscribed, CURRENTLY present room members receive
     // this one transient frame. Never store text, send via push or change XP.
     const live=await pool.query(`SELECT DISTINCT p.installation_id FROM pet_presence p
       WHERE p.room_id=$1 AND p.location_kind='shared' AND p.expires_at>now()
       AND NOT EXISTS (SELECT 1 FROM friend_blocks b WHERE
        (b.blocker_id=$2 AND b.blocked_id=p.installation_id) OR
        (b.blocker_id=p.installation_id AND b.blocked_id=$2))`,[speech.roomId,peer.userId]);
     const present=new Set(live.rows.map(row=>row.installation_id));
     const event={type:'pet_speech',roomId:speech.roomId,petId:speech.petId,
       speaker:String(actor.rows[0].name||'Милениче').slice(0,32),
       text:speech.text,turnId:speech.turnId,at:now};
     for(const target of peers){
      if(!target.userId||!target.roomIds.has(speech.roomId)||!present.has(target.userId))continue;
      try{await roomFor(pool,speech.roomId,target.userId);}
      catch(_){target.roomIds.delete(speech.roomId);continue;}
      send(target.ws,event);
     }
     return;
    }
    if(message.type==='unsubscribe'){peer.roomIds.delete(message.roomId);return;}
    if(message.type==='ping'){send(ws,{type:'pong'});return;}
    throw Error('unsupported_message');
   }catch(e){send(ws,{type:'error',error:['auth_required','room_access_denied','friendship_required','room_limit'].includes(e.message)?e.message:'invalid_action'});}
  });
 });
 const heartbeat=setInterval(()=>{
  for(const p of peers){
   if(!p.alive){p.ws.terminate();continue;}
   p.alive=false;p.ws.ping();
  }
 },30000).unref();
 async function publish(event){
  const targets=[...peers];
  for(const p of targets){
   if(!p.userId)continue;
   let allow=false;
   if(event.targetId&&p.userId===event.targetId)allow=true;
   if(event.actorId&&p.userId===event.actorId)allow=true;
   if(event.roomId&&p.roomIds.has(event.roomId)){
    try{await roomFor(pool,event.roomId,p.userId);allow=true;}
    catch(_){p.roomIds.delete(event.roomId);}
   }
   if(allow)send(p.ws,{type:'sync',roomId:event.roomId||null,category:event.type,at:new Date().toISOString()});
  }
 }
 return {publish,close:async()=>{clearInterval(heartbeat);for(const p of peers)p.ws.close(1001,'shutdown');await new Promise(resolve=>wss.close(resolve));}};
}
