import test from 'node:test';
import assert from 'node:assert/strict';
import {SKILLS,TOYS,soloUnlocked,toyAvailable,validNickname,validShortMessage} from '../src/contracts.mjs';
test('six unique skills',()=>{assert.equal(SKILLS.length,6);assert.equal(new Set(SKILLS).size,6)});
test('solo playground requires both pet and research levels',()=>{
  assert.equal(soloUnlocked(14,4),false);
  assert.equal(soloUnlocked(15,3),false);
  assert.equal(soloUnlocked(15,4),true);
  assert.equal(soloUnlocked(NaN,4),false);
});
test('initial toys always available once unlocked',()=>{
  assert.deepEqual(TOYS.filter(t=>t.initial).map(t=>t.id),['sandbox','seesaw']);
  assert.equal(toyAvailable('sandbox',15,4),true);
  assert.equal(toyAvailable('sandbox',14,4),false);
});
test('later toys need level and explicit unlock',()=>{
  assert.equal(toyAvailable('slide',19,4,['slide']),false);
  assert.equal(toyAvailable('slide',20,4,[]),false);
  assert.equal(toyAvailable('slide',20,4,['slide']),true);
  assert.equal(toyAvailable('missing',250,20,['missing']),false);
});
test('shared visitor access is temporary, not solo unlock',()=>{
  assert.equal(toyAvailable('seesaw',1,0,[],true),true);
  assert.equal(toyAvailable('seesaw',1,0,[],false),false);
});
test('nickname/message limits and input validation',()=>{
  assert.equal(validNickname('Играч'),true);
  assert.equal(validNickname(''),false);
  assert.equal(validNickname('X'.repeat(33)),false);
  assert.equal(validShortMessage('Може ли да дојдам?'),true);
  assert.equal(validShortMessage(''),false);
  assert.equal(validShortMessage('a'.repeat(121)),false);
  assert.equal(validShortMessage('x\nheader'),false);
});
