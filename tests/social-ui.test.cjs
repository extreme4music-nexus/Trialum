const test=require('node:test'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {parseCode}=require('../js/social.js');
const code=crypto.randomBytes(32).toString('base64url');
test('paste exact invite token',()=>assert.equal(parseCode(code),code));
test('paste scheme link with or without trailing slash',()=>{
 assert.equal(parseCode('trialum://invite/'+code),code);
 assert.equal(parseCode('trialum://invite/'+code+'/'),code);
});
test('paste complete Macedonian message',()=>{
 const text='🐾 ТРИАЛУМ — покана\nОтвори во играта: trialum://invite/'+code+'\nАко линкот не се отвори, внеси го кодот:\n'+code;
 assert.equal(parseCode(text),code);
});
test('reject other origins and malformed links',()=>{
 assert.equal(parseCode('https://evil.example/?invite='+code),'');
 assert.equal(parseCode('trialum://evil/'+code),'');
 assert.equal(parseCode('trialum://invite/'+code+'oversized'),'');
 assert.equal(parseCode('x'.repeat(1025)),'');
});
