import {WebSocketServer,WebSocket} from 'ws';
import {createHash} from 'node:crypto';
const sockets=new Set();
const allowed=()=>process.env.SOCIAL_CORS_ORIGIN||'https://appassets.androidplatform.net';
const hash=token=>createHash('sha256').update(token).digest();
const valid=x=>typeof x==='string'&&/^[A-Za-z0-9_-]{43}$/.test(x);
const uuid=x=>typeof x==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(x);
function safeSend(ws,data){if(ws.readyState===WebSocket.OPEN&&ws.bufferedAmount<65536)ws.send(JSON.stringify(data));}
async function authorized(db,actor,room){
 const q=await db.query("SELECT 1 FROM playground_members m JOIN installations i ON i.id=m.installation_id WHERE m.playground_id=$1 AND m.installation_id=$2 AND i.revoked_at IS NULL",[room,actor]);
 return !!q.rowCount;
}
export function broadcast(room,sequence){
 for(const s of sockets)if(s.room===room&&s.actor&&s.ws.readyState===WebSocket.OPEN)
  safeSend(s.ws,{type:'changed',roomId:room,sequence});
}
export function installRoomWebSockets(server,pool){
 const wss=new WebSocketServer({noServer:true,maxPayload:1024,perMessageDeflate:false,clientTracking:false});
 server.on('upgrade',(req,socket,head)=>{
  const path=(req.url||'').split('?')[0];
  if(path!=='/v1/social/live'||!pool||req.headers.origin!==allowed()){
   socket.write('HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n');socket.destroy();return;
  }
  if(sockets.size>=80){socket.write('HTTP/1.1 503 Service Unavailable\r\nConnection: close\r\n\r\n');socket.destroy();return;}
  wss.handleUpgrade(req,socket,head,ws=>wss.emit('connection',ws));
 });
 wss.on('connection',ws=>{
  const s={ws,actor:null,room:null,seen:Date.now(),alive:true,authUntil:Date.now()+5000};
  sockets.add(s);
  ws.on('pong',()=>{s.alive=true;});
  ws.on('message',async raw=>{
   if(raw.length>1024){ws.close(1009);return;}
   let m;try{m=JSON.parse(raw.toString());}catch(_){ws.close(1003);return;}
   try{
    if(!s.actor){
     if(m?.type!=='auth'||!valid(m.credential)){ws.close(1008);return;}
     const q=await pool.query('SELECT id FROM installations WHERE credential_hash=$1 AND revoked_at IS NULL',[hash(m.credential)]);
     if(!q.rowCount){ws.close(1008);return;}
     s.actor=q.rows[0].id;s.authUntil=0;safeSend(ws,{type:'authenticated'});return;
    }
    if(m?.type==='subscribe'&&uuid(m.roomId)){
     if(!await authorized(pool,s.actor,m.roomId)){ws.close(1008);return;}
     s.room=m.roomId;
     const q=await pool.query('SELECT COALESCE(MAX(id),0)::text AS sequence FROM playground_events WHERE playground_id=$1',[s.room]);
     safeSend(ws,{type:'subscribed',roomId:s.room,sequence:q.rows[0].sequence});return;
    }
    if(m?.type==='unsubscribe'){s.room=null;return;}
    ws.close(1008);
   }catch(_){ws.close(1011);}
  });
  ws.on('close',()=>sockets.delete(s));ws.on('error',()=>sockets.delete(s));
 });
 const timer=setInterval(async()=>{
  for(const s of sockets){
   if(!s.actor&&Date.now()>s.authUntil){s.ws.close(1008);continue;}
   if(!s.alive){s.ws.terminate();continue;}
   s.alive=false;
   try{
    if(s.actor){
     const q=await pool.query('SELECT 1 FROM installations WHERE id=$1 AND revoked_at IS NULL',[s.actor]);
     if(!q.rowCount||(s.room&&!await authorized(pool,s.actor,s.room))){s.ws.close(1008);continue;}
    }
    s.ws.ping();
   }catch(_){s.ws.close(1011);}
  }
 },15000);
 timer.unref();
 server.on('close',()=>{clearInterval(timer);for(const s of sockets)s.ws.terminate();wss.close();});
 return wss;
}
