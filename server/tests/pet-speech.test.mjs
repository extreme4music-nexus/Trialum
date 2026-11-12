import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {parsePetSpeech} from '../src/pet-speech.mjs';
const good=()=>({type:'pet_speech',roomId:randomUUID(),petId:'pet_123',sessionId:randomUUID(),turnId:randomUUID(),text:'Здраво, пријателе!'});
test('ephemeral pet speech accepts only bounded text and authenticated-lease identifiers',()=>{
 const v=good();assert.deepEqual(parsePetSpeech(v),{roomId:v.roomId,petId:v.petId,sessionId:v.sessionId,turnId:v.turnId,text:v.text});
 for(const change of [
  {roomId:'not-room'},{petId:'bad pet'},{sessionId:'expired'},{turnId:'invalid'},
  {text:''},{text:'x'.repeat(161)},{text:'Hello\nhi'},{text:'https://example.com'},
  {text:'name@example.com'},{text:'+1 (555) 555-9999'},{xp:1000},{speaker:'forged'}
 ])assert.throws(()=>parsePetSpeech({...v,...change}),/invalid_pet_speech/);
 assert.equal(parsePetSpeech({...v,text:'  Hello!  '}).text,'Hello!');
});
