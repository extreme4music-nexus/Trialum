import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';

const base=process.env.TRIALUM_SOCIAL_BASE||'http://127.0.0.1:8787/v1/social';
async function req(path,method='GET',body,credential,origin){
 const response=await fetch(base+'/'+path,{method,
  headers:{...(body?{'content-type':'application/json'}:{}),...(credential?{authorization:'Bearer '+credential}:{}),...(origin?{origin}:{})},
  ...(body?{body:JSON.stringify(body)}:{})});
 return {status:response.status,data:await response.json().catch(()=>null)};
}
const make=async name=>{
 const v=await req('register','POST',{nickname:name});
 assert.equal(v.status,201,'register');
 assert.equal(v.data.credential.length,43);
 assert(!Object.keys(v.data).includes('email'));
 return v.data;
};
const random=()=>randomBytes(32).toString('base64url');
const a=await make('Играч А'),b=await make('Играч Б'),c=await make('Играч В');
assert.equal((await req('me','GET',null,a.credential)).data.id,a.id);
assert.equal((await req('friends','GET')).status,401,'no anonymous friend roster');
assert.equal((await req('me','GET',null,a.credential,'https://evil.example')).status,403,'origin not reflected');
assert.equal((await req('invites','POST',{},a.credential)).status,201);
const offer=await req('invites','POST',{},a.credential);
assert.equal(offer.status,201);
assert.notEqual(offer.data.code,a.credential,'invite cannot be login credential');
assert.equal((await req('invites/preview','POST',{code:offer.data.code},b.credential)).data.inviter.id,a.id);
assert.equal((await req('invites/preview','POST',{code:offer.data.code},a.credential)).status,409,'self-accept blocked');
// Race two authenticated recipients to accept one single-use invite.
const concurrent=await Promise.all([
 req('invites/accept','POST',{code:offer.data.code},b.credential),
 req('invites/accept','POST',{code:offer.data.code},c.credential)
]);
assert.deepEqual(concurrent.map(x=>x.status).sort(),[200,404],'only one friend may redeem token');
assert.equal((await req('invites/accept','POST',{code:offer.data.code},b.credential)).status,404,'replay rejected');
const friends=await req('friends','GET',null,a.credential);
assert.equal(friends.status,200);
assert.equal(friends.data.friends.length,1);
const accepted=friends.data.friends[0];
assert([b.id,c.id].includes(accepted.id));
const other=accepted.id===b.id?b:c;
assert.equal((await req('friends','GET',null,other.credential)).data.friends[0].id,a.id);
assert.equal((await req('friends/'+other.id,'DELETE',null,a.credential)).status,200);
assert.equal((await req('friends','GET',null,a.credential)).data.friends.length,0);
const fresh=await req('invites','POST',{},other.credential);
assert.equal(fresh.status,201);
assert.equal((await req('friends/'+other.id+'/block','POST',{},a.credential)).status,200);
assert.equal((await req('invites/preview','POST',{code:fresh.data.code},a.credential)).status,403,'blocked invite rejected');
assert.equal((await req('invites/accept','POST',{code:fresh.data.code},a.credential)).status,403,'blocked accept rejected');
assert.equal((await req('invites/preview','POST',{code:random()},a.credential)).status,404);
assert.equal((await req('account','DELETE',null,a.credential)).status,200);
assert.equal((await req('me','GET',null,a.credential)).status,401,'deleted account credentials invalid');
console.log('PASS social contract: 3 identities, login, invite revoke, preview, consent, accept race/replay, list, remove, block, delete, CORS');
