import http from 'node:http';
import {Pool} from 'pg';
import {VERSION,SKILLS,SOLO_GATE,TOYS} from './contracts.mjs';

const port=Number(process.env.PORT||8787);
const host=process.env.HOST||'0.0.0.0';
if(!Number.isInteger(port)||port<1024||port>65535)throw new Error('PORT must be 1024..65535');
if(!['0.0.0.0','127.0.0.1','::1'].includes(host))throw new Error('Invalid HOST');
if(!process.env.DATABASE_URL)throw new Error('DATABASE_URL is required (see .env.example)');
const pool=new Pool({connectionString:process.env.DATABASE_URL,max:5,connectionTimeoutMillis:2000,idleTimeoutMillis:15000,statement_timeout:2000,application_name:'trialum-social-foundation'});
const since=new Date().toISOString();
const noStore={'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff','referrer-policy':'no-referrer','x-frame-options':'DENY','content-security-policy':"default-src 'none'",'permissions-policy':'camera=(), microphone=(), geolocation=()'};
const reply=(res,status,payload)=>{res.writeHead(status,noStore);res.end(JSON.stringify(payload));};
const server=http.createServer(async(req,res)=>{
  // Only GET endpoints in the foundation. No auth, no user records, no upload/push/payments endpoints.
  const url=(req.url||'').split('?')[0];
  if(req.method!=='GET')return reply(res,405,{error:'method_not_allowed'});
  if(url==='/v1/meta')return reply(res,200,{version:VERSION,liveSocialEnabled:false,paymentsEnabled:false,adsEnabled:false,profileTrackingEnabled:false,skillIds:SKILLS,playground:{gate:SOLO_GATE,toys:TOYS}});
  if(url==='/healthz'){
    try{await pool.query('SELECT 1');return reply(res,200,{status:'ok',version:VERSION,db:'connected',started:since});}
    catch(_){return reply(res,503,{status:'unavailable',db:'not_ready'});}
  }
  return reply(res,404,{error:'not_found'});
});
server.requestTimeout=5000;
server.headersTimeout=6000;
server.keepAliveTimeout=5000;
server.maxRequestsPerSocket=100;
server.on('clientError',(_err,socket)=>{socket.end('HTTP/1.1 400 Bad Request\r\nConnection: close\r\n\r\n');});
server.listen(port,host,()=>{process.stdout.write('TRIALUM foundation listening on internal port '+port+'; social endpoints DISABLED\n');});
const shutdown=async()=>{server.close();await pool.end();};
process.once('SIGTERM',shutdown);process.once('SIGINT',shutdown);
