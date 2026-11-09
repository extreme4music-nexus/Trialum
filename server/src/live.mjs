
import {WebSocketServer,WebSocket} from 'ws';
import {createHash} from 'node:crypto';
import {roomFor} from './shared.mjs';

// Bounded authenticated WSS: credentials must NEVER appear in URLs, logs, or
// WebSocket subprotocols. Only server-signed dirty notifications travel via WS.
// All state is fetched by authorized HTTP snapshot; WS cannot award rewards.
export function createLive(server,pool,enabled){
 const wss=new WebSocketServer({noServer:true,maxPayload:2048,perMessageDeflate:false});
 const peers=new Set();
 function send(ws,value){
  if(ws.readyState===WebSocket.OPEN && ws.bufferedAmount<16384)
    ws.send(JSON.stringify(value));
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
  const cleanup=()=>{clearTimeout(deadline);peers.delete(peer);};
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
