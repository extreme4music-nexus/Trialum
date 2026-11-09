import assert from 'node:assert/strict';
import {test} from 'node:test';
process.env.TRIALUM_DATA_KEY='e'.repeat(64);
const {seal,open,encryptionReady}=await import('../src/data-crypto.mjs');
test('separate AES-GCM derivations: text decrypts only for message purpose',()=>{
 assert(encryptionReady());
 const a=seal('приватна порака','message-text');
 const b=seal('приватна порака','message-text');
 assert(!a.equals(b),'randomized GCM IV');
 assert.equal(open(a,'message-text'),'приватна порака');
 assert.throws(()=>open(a,'fcm-token'));
 assert.throws(()=>open(Buffer.concat([a.subarray(0,32),Buffer.from([a[32]^1]),a.subarray(33)]),'message-text'));
});
test('FCM token can only be decrypted by the push purpose key',()=>{
 const token='e'.repeat(150);
 const enc=seal(token,'fcm-token');
 assert.equal(open(enc,'fcm-token'),token);
 assert.throws(()=>open(enc,'message-text'));
});
