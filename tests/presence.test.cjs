const test=require('node:test');
const assert=require('node:assert/strict');
const P=require('../js/presence.js');
const fixture=()=>({version:'1.5.5',lastDay:55,selectedPet:'pet-1',presenceSequence:0,
 credits:420,logs:[{text:'original'}],pets:[
  {id:'pet-1',name:'Лумира',habitatId:'hab-1',evolution:{level:25,earned:875},skills:{wave:2}},
  {id:'pet-2',name:'Синапсо',habitatId:'hab-1',evolution:{level:15,earned:90}}]});
test('LW-A migrated legacy pets default home; names, XP, credits and logs unchanged',()=>{
 const s=fixture(),before=JSON.stringify({pets:s.pets,logs:s.logs,credits:s.credits});
 P.ensure(s);assert.equal(P.get(s,'pet-1').kind,P.HOME);assert.equal(P.get(s,'pet-2').kind,P.HOME);
 assert.equal(s.pets[0].name,'Лумира');assert.deepEqual(s.pets[0].evolution,{level:25,earned:875});
 assert.equal(s.logs[0].text,'original');assert.equal(s.credits,420);
 assert.deepEqual(JSON.parse(before).pets[0].skills,s.pets[0].skills);
});
test('LW-A one pet one location; different pets independent; re-entry fails',()=>{
 const s=fixture(),a=P.enter(s,'pet-1',P.LOCAL,null,1000);
 assert.equal(a.ok,true);assert.equal(P.atHome(s,'pet-1'),false);
 assert.equal(P.enter(s,'pet-1',P.SHARED,'room-1',1001).ok,false);
 assert.equal(P.enter(s,'pet-2',P.SHARED,'room-1',1002).ok,true);
 assert.equal(P.isAt(s,'pet-2',P.SHARED,'room-1'),false,'unconfirmed remote does not count as admitted');
 assert.equal(P.isAt(s,'pet-1',P.LOCAL),true);
 assert.equal(s.pets[0].habitatId,'hab-1','home assignment preserved');
});
test('LW-A failed network admission rolls back only matching pending session',()=>{
 const s=fixture(),a=P.enter(s,'pet-1',P.SHARED,'room-1',1000);
 assert.equal(a.ok,true);assert.equal(P.returnHome(s,'pet-1',a.sessionId).ok,false);
 assert.equal(P.rollback(s,'pet-1','wrong').ok,false);
 assert.equal(P.rollback(s,'pet-1',a.sessionId).ok,true);
 assert.equal(P.atHome(s,'pet-1'),true);
 assert.equal(P.rollback(s,'pet-1',a.sessionId).ok,false);
});
test('LW-A remote confirm idempotent, stale return blocked, return idempotent',()=>{
 const s=fixture(),a=P.enter(s,'pet-1',P.SHARED,'room-1',1000);
 assert.equal(P.confirm(s,'pet-1',a.sessionId).ok,true);
 assert.equal(P.confirm(s,'pet-1',a.sessionId).duplicate,true);
 assert.equal(P.isAt(s,'pet-1',P.SHARED,'room-1'),true);
 assert.equal(P.returnHome(s,'pet-1','stale').ok,false);
 assert.equal(P.returnHome(s,'pet-1',a.sessionId).ok,true);
 assert.equal(P.returnHome(s,'pet-1',a.sessionId).duplicate,true);
 const b=P.enter(s,'pet-1',P.LOCAL,null,2000);
 assert.notEqual(a.sessionId,b.sessionId);
 assert.equal(P.returnHome(s,'pet-1',a.sessionId).ok,false,'old return cannot cancel new visit');
});
test('LW-A save/restore JSON roundtrip preserves away presence and exclusivity',()=>{
 const s=fixture();const a=P.enter(s,'pet-1',P.LOCAL,null,1200);
 const json=JSON.stringify(s),saved=JSON.parse(json);
 P.ensure(saved);assert.equal(P.get(saved,'pet-1').sessionId,a.sessionId);
 assert.equal(P.isAt(saved,'pet-1',P.LOCAL),true);
 assert.equal(P.enter(saved,'pet-1',P.VISIT,'friend-1',1300).ok,false);
 assert.equal(P.returnHome(saved,'pet-1',a.sessionId).ok,true);
 assert.equal(saved.pets[0].evolution.earned,875);
});
test('LW-A unexpected presence payload fails closed to home without changing progress',()=>{
 const s=fixture();s.pets[0].presence={kind:'network',sessionId:'evil'};
 s.pets[1].presence={kind:'shared_playground',status:'active',sessionId:'s',ref:'../../private'};
 P.ensure(s);assert.equal(P.atHome(s,'pet-1'),true);assert.equal(P.atHome(s,'pet-2'),true);
 assert.equal(P.enter(s,'pet-1',P.SHARED,'https://evil',1000).ok,false);
 assert.equal(P.enter(s,'pet-1',P.LOCAL,null,NaN).ok,false);
});
test('LW-A care eligibility is home-only and two pet locations cannot overlap',()=>{
 const s=fixture(),a=P.enter(s,'pet-1',P.VISIT,'friend-1',1000);
 assert.equal(P.availableForCare(s,'pet-1'),false);
 assert.equal(P.availableForCare(s,'pet-2'),true);
 assert.equal(P.confirm(s,'pet-1',a.sessionId).ok,true);
 assert.equal(P.availableForCare(s,'pet-1'),false);
});
