'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const E={
 currentPet:s=>s.pets.find(p=>p.id===s.selectedPet)||null,
 evolutionProgress:p=>({level:p.level}),
 ensureLongplay:s=>s.longplay||(s.longplay={credits:0,ledger:[]}),
 evolutionGain:(s,p,n)=>{p.earned=(p.earned||0)+n;},
 log:(s,txt,kind)=>s.logs.push({txt,kind})
};
globalThis.TrialumEngine=E;
const P=require('../js/presence.js');
globalThis.TrialumPresence=P;
const PG=require('../js/playground.js');
const START=1800000000000;
function pet(id='pet-1'){return{id,name:'Лумира',level:35,energy:100,
 skills:{wave:2,spin:1,leap:1,symbols:0,logic:0,dialogue:0},earned:0};}
function world(){const p=pet();return {lastDay:90,research:{level:9},selectedPet:p.id,pets:[p],
 logs:[],longplay:{credits:500,ledger:[]}};}
const session=(s,p=s.pets[0])=>PG.ensure(s).autonomy[p.id];
const award=s=>s.pets.reduce((sum,p)=>sum+(p.earned||0),0);
function make(s=world(),now=START){
 assert.equal(PG.send(s,now).ok,true);
 const a=session(s);assert(a,'autonomous record missing after explicit admission');
 assert(a.durationMs>=30*60000&&a.durationMs<=110*60000,'session must not exceed emergency LW-A expiry');
 assert(a.endAt<now+P.LOCAL_SESSION_MS,'session should settle before fixed local expiry');
 return s;
}
function complete(s,now=START){
 const a=session(s);assert(a);
 return PG.reconcile(s,now+a.durationMs+100);
}
test('LW-C one deterministic, bounded, non-duplicating offline session',()=>{
 const s=make(),a=session(s);
 const none=PG.reconcile(s,START+Math.floor(a.durationMs/6));
 assert.equal(none.changed,false,'animation/spectating must not grant XP before first checkpoint');
 const out=complete(s);
 assert.equal(out.changed,true);assert.equal(out.summaries.length,1);
 assert.equal(a.events.length,4);
 assert(a.events.every((e,i)=>e.ordinal===i+1),'events must have stable ordinal');
 assert(a.events.every(e=>a.toys.includes(e.toyId)),'never use locked toy');
 assert(a.events.every(e=>['rest','hesitate','observe','practice'].includes(e.kind)));
 assert(a.events.every(e=>e.xp===0||e.xp===4));
 assert(award(s)<=16,'per-session autonomous XP cap');
 const total=a.events.reduce((n,e)=>n+e.xp,0);
 assert.equal(out.summaries[0].xpEarned,total,'return summary must match immutable ledger');
 assert.equal(out.summaries[0].energySpent,a.events.reduce((n,e)=>n+e.energySpent,0));
 assert.equal(P.atHome(s,'pet-1'),true);
 assert.equal(PG.reconcile(s,START+a.durationMs+P.LOCAL_SESSION_MS).changed,false);
 assert.equal(award(s),total,'repeated reconciliation must never double-award XP');
 assert.equal(PG.ensure(s).autonomyHistory.length,1,'one completion summary only');
});
test('LW-C same seed and fixture yields byte-identical events across restarts',()=>{
 const s=make(),t=make(),a=session(s),half=START+Math.floor(a.durationMs*.6);
 const r=PG.reconcile(s,half);
 assert.equal(r.changed,true);
 const restored=JSON.parse(JSON.stringify(s));
 PG.reconcile(s,START+a.durationMs+1);
 PG.reconcile(restored,START+a.durationMs+1);
 PG.reconcile(t,START+a.durationMs+1);
 assert.deepEqual(session(s).events,session(restored).events);
 assert.deepEqual(session(s).events,session(t).events);
 assert.equal(award(s),award(restored));
 assert.deepEqual(PG.ensure(s).lastAutonomySummary,PG.ensure(restored).lastAutonomySummary);
});
test('LW-C backward device time, repeated checkpoint and snapshot remain reward safe',()=>{
 const s=make(),a=session(s),late=START+Math.floor(a.durationMs*.7);
 PG.reconcile(s,late);
 const rewards=award(s),events=a.events.length;
 const r=PG.reconcile(s,late-900000);
 assert.equal(r.changed,false);assert.equal(r.summaries.length,0);
 assert.equal(award(s),rewards);assert.equal(a.events.length,events);
 PG.reconcile(s,late);assert.equal(award(s),rewards);
 const restored=JSON.parse(JSON.stringify(s));
 PG.reconcile(restored,late);
 assert.equal(award(restored),rewards);
});
test('LW-C early return finalizes only elapsed checkpoints, once, with reason',()=>{
 const s=make(),a=session(s),half=START+Math.floor(a.durationMs/2);
 const ret=PG.returnPet(s,half);
 assert(ret.ok);assert.equal(ret.summary.reason,'returned');
 assert.equal(ret.summary.elapsedMs,Math.floor(a.durationMs/2));
 assert(a.events.length<=2,'early return must never grant end-of-session checkpoints');
 assert.equal(ret.summary.xpEarned,award(s));
 assert.equal(P.atHome(s,'pet-1'),true);
 assert.equal(PG.returnPet(s,half+1000).ok,false,'no second return reward');
 assert.equal(PG.reconcile(s,START+P.LOCAL_SESSION_MS).changed,false);
});
test('LW-C manual and autonomous play share one daily four-action cap',()=>{
 const s=make(),a=session(s);
 for(let i=0;i<4;i++)assert.equal(PG.start(s,'seesaw').ok,true);
 assert.equal(award(s),16);
 PG.reconcile(s,START+a.durationMs+100);
 assert.equal(award(s),16,'no automatic stacking beyond manual daily limit');
 assert.equal(PG.ensure(s).practice['pet-1'].count,4);
 assert(session(s).events.every(e=>e.xp===0),'automatic play respects daily consumed cap');
});
test('LW-C no retroactive rewards for old LW-A sessions without autonomous record',()=>{
 const s=world();const before=JSON.stringify(s.pets[0]);
 P.enter(s,'pet-1',P.LOCAL,null,START);
 const result=PG.reconcile(s,START+P.LOCAL_SESSION_MS+1);
 assert.equal(result.changed,false);
 assert.equal(award(s),0);
 assert.equal(P.expireLocal(s,START+P.LOCAL_SESSION_MS+1).changed,true);
 assert.equal(award(s),0);
 assert.equal(s.pets[0].name,JSON.parse(before).name);
});
test('LW-C two different pets keep independent session ledger and presence',()=>{
 const s=world();s.pets.push(pet('pet-2'));make(s);
 s.selectedPet='pet-2';assert(PG.send(s,START+1234).ok);
 assert.notEqual(session(s,s.pets[0]).sessionId,session(s,s.pets[1]).sessionId);
 const out=PG.reconcile(s,START+P.LOCAL_SESSION_MS+1);
 assert.equal(out.summaries.length,2);assert.equal(P.atHome(s,'pet-1'),true);
 assert.equal(P.atHome(s,'pet-2'),true);
 for(const p of s.pets){
  const a=session(s,p);
  assert(a.events.length===4);assert(p.earned<=16);
 }
 assert.equal(PG.ensure(s).autonomyHistory.length,2);
});
test('LW-C 1/10/100 complete sessions: bounded history and no duplicate XP',()=>{
 for(const count of [1,10,100]){
  const s=world();
  let now=START;
  for(let i=0;i<count;i++){
   s.lastDay++;
   s.pets[0].energy=100; // Simulates normal rest between different game days.
   make(s,now);
   const a=session(s);
   const finished=PG.reconcile(s,now+a.durationMs+1);
   assert.equal(finished.summaries.length,1,'session '+i+' finished');
   const score=award(s);
   assert.equal(PG.reconcile(s,now+a.durationMs+1).changed,false);
   assert.equal(award(s),score,'session '+i+' idempotent');
   now+=24*60*60*1000;
  }
  assert(award(s)<=count*16);
  assert.equal(PG.ensure(s).autonomyHistory.length,Math.min(count,20));
  assert.equal(P.atHome(s,'pet-1'),true);
 }
});
test('LW-C no toy/skill bypass: frozen unlocked equipment, unknown skill does not appear',()=>{
 const s=world();s.pets[0].skills={wave:1,spin:0,leap:0,symbols:0,logic:0,dialogue:0};
 make(s);
 const a=session(s);assert.deepEqual(a.toys,['sandbox','seesaw']);
 // Player unlocks a new toy after admission; it is not retroactively in this session.
 s.pets[0].level=100;s.research.level=20;
 PG.ensure(s).unlocked.push('trampoline','pool','slide','obstacle');
 complete(s);
 assert(a.events.every(e=>['sandbox','seesaw'].includes(e.toyId)));
 assert.equal(s.pets[0].skills.symbols,0,'no spontaneous locked skill teaching');
 assert.equal(s.pets[0].skills.dialogue,0);
});
test('LW-C render/replay never advances time or adds XP',()=>{
 const s=make(),before=award(s),a=session(s);
 PG.replay(s,'seesaw');
 const html=PG.render(s);
 assert(html.includes('Самостојна игра'));
 assert.equal(award(s),before);
 assert.equal(a.events.length,0);
});

test('LW-C fail-closed restored tampering never awards a corrupted toy/event',()=>{
 const s=make(),a=session(s);
 a.toys=['__proto__'];
 assert.equal(PG.reconcile(s,START+a.durationMs+1).changed,false);
 assert.equal(award(s),0);
 assert.equal(P.expireLocal(s,START+P.LOCAL_SESSION_MS).changed,true);
 const other=make(),second=session(other);
 second.events.push({ordinal:42,at:START,toyId:'seesaw',xp:999});
 assert.equal(PG.reconcile(other,START+second.durationMs+1).changed,false);
 assert.equal(award(other),0);
});
test('LW-C UI report is a view of ledger only and cannot replay rewards',()=>{
 const s=make(),a=session(s),mid=START+Math.floor(a.durationMs*.6);
 PG.reconcile(s,mid);
 const xp=award(s),count=a.events.length;
 const live=PG.render(s);
 assert(live.includes('Самостојна игра'));
 assert(live.includes('Последно:')||!a.events.length);
 assert.equal(award(s),xp);assert.equal(a.events.length,count);
 const done=PG.returnPet(s,mid);
 assert(done.ok);
 const report=PG.render(s);
 assert(report.includes('Последно враќање'));
 assert(report.includes('Играчки:'));
 assert(report.includes('Вештини:')||!done.summary.skillChanges.length);
 assert.equal(award(s),xp,'opening return report must not change XP');
});
