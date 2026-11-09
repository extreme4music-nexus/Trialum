import { createCipheriv, createDecipheriv, hkdfSync, randomBytes } from 'node:crypto';
// Purpose-separated AES-256-GCM. Key is private server environment, never Git/client.
const hex=process.env.TRIALUM_DATA_KEY||'';
const master=/^[a-fA-F0-9]{64}$/.test(hex)?Buffer.from(hex,'hex'):null;
const keys=new Map();
function key(purpose){
  if(!master)throw Error('encryption_not_configured');
  if(!keys.has(purpose)) keys.set(purpose,Buffer.from(hkdfSync(
    'sha256',master,Buffer.from('TRIALUM-1.5.6-E'),Buffer.from(purpose),32
  )));
  return keys.get(purpose);
}
export const encryptionReady=()=>!!master;
export function seal(value,purpose){
  if(typeof value!=='string'||value.length>4096)throw Error('invalid_plaintext');
  const iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',key(purpose),iv);
  const encrypted=Buffer.concat([cipher.update(value,'utf8'),cipher.final()]);
  return Buffer.concat([Buffer.from([1]),iv,cipher.getAuthTag(),encrypted]);
}
export function open(sealed,purpose){
  const b=Buffer.from(sealed||[]);
  if(b.length<30||b[0]!==1)throw Error('invalid_envelope');
  const decipher=createDecipheriv('aes-256-gcm',key(purpose),b.subarray(1,13));
  decipher.setAuthTag(b.subarray(13,29));
  return Buffer.concat([decipher.update(b.subarray(29)),decipher.final()]).toString('utf8');
}
