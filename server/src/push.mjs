import {GoogleAuth} from 'google-auth-library';
import {open} from './data-crypto.mjs';

// Generic data-only FCM payload; no message text, pet stats or private details.
// Disabled unless operator opted in, configured project and mounted credentials.
export function createPush(pool,enabled){
  const project=process.env.TRIALUM_FCM_PROJECT_ID||'';
  const path=process.env.GOOGLE_APPLICATION_CREDENTIALS||'';
  if(!enabled)return {enabled:false,notify:async()=>false};
  if(!/^[a-zA-Z0-9_-]{5,100}$/.test(project)||!path.startsWith('/run/secrets/'))
    throw Error('FCM requires project ID and mounted /run/secrets service credentials');
  const auth=new GoogleAuth({keyFilename:path,scopes:['https://www.googleapis.com/auth/firebase.messaging']});
  async function notify(recipientId,referenceId,actorId=null){
    if(!/^[a-f0-9-]{36}$/i.test(recipientId)||!/^[a-f0-9-]{36}$/i.test(referenceId))return false;
    const q=await pool.query(
      'SELECT p.token_ciphertext FROM push_registrations p WHERE p.installation_id=$1 AND ($2::uuid IS NULL OR NOT EXISTS (SELECT 1 FROM friend_mutes m WHERE m.owner_id=$1 AND m.other_id=$2))',
      [recipientId,actorId]);
    if(!q.rowCount)return false;
    let token;
    try{token=open(q.rows[0].token_ciphertext,'fcm-token');}catch(_){return false;}
    const client=await auth.getClient(),access=await client.getAccessToken();
    if(!access?.token)return false;
    const r=await fetch('https://fcm.googleapis.com/v1/projects/'+project+'/messages:send',{
      method:'POST',headers:{'content-type':'application/json',authorization:'Bearer '+access.token},
      body:JSON.stringify({message:{token,data:{kind:'trialum_event',reference:referenceId},
        android:{priority:'NORMAL',ttl:'3600s'}}}),
      signal:AbortSignal.timeout(5000)
    });
    if(!r.ok){
      if(r.status===404||r.status===400){
        const error=await r.text().catch(()=> '');
        if(error.includes('UNREGISTERED'))
          await pool.query('DELETE FROM push_registrations WHERE installation_id=$1',[recipientId]);
      }
      return false;
    }
    return true;
  }
  return {enabled:true,notify};
}
