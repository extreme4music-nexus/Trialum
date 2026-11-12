'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const Memory=require('../js/playground-memory.js');
function noon(y,m,d){return new Date(y,m-1,d,12,0,0,0).getTime();}
test('stores thematic per-pet summaries, not raw shared speech, links or credentials',()=>{
 const p={id:'my-pet'};
 const when=noon(2026,11,11);
 assert(Memory.remember(p,{place:'shared',companion:'Лумира',
  heard:'Ќе се менуваме на клацкалката?',said:'Да! Ајде и на лизгалка.',now:when}));
 assert.equal(p.playgroundAiMemories.length,1);
 assert.deepEqual(p.playgroundAiMemories[0].topics,['slide','seesaw']);
 assert.equal(p.playgroundAiMemories[0].day,'2026-11-11');
 assert.equal(p.playgroundAiMemories[0].companions[0],'Лумира');
 const json=JSON.stringify(p);
 assert(!json.includes('Ќе се менуваме'));
 assert(!json.includes('Да!'));
 assert(!json.includes('https://'));
 assert(Memory.remember(p,{place:'shared',companion:'Другар',
  heard:'Ги откривме цвеќињата!',said:'Да, и ги гледавме ѕвездите.',now:when+3000}));
 assert.equal(p.playgroundAiMemories.length,1,'same day+room is a merged summary');
 assert.equal(p.playgroundAiMemories[0].moments,2);
 assert(p.playgroundAiMemories[0].topics.includes('nature'));
 assert(p.playgroundAiMemories[0].topics.includes('stars'));
});
test('answers yesterday by calendar date, through save/restore, never invents missing days',()=>{
 const p={},when=noon(2026,11,11);
 Memory.remember(p,{place:'shared',companion:'Лумира',heard:'Што има на лизгалката?',said:'Ајде да играме!',now:when});
 const back=JSON.parse(JSON.stringify(p));
 const later=noon(2026,11,12);
 const memory=Memory.recall(back,'Што разговаравте вчера со другарчињата?',later);
 assert.equal(memory.requested,'yesterday');assert.equal(memory.found,true);
 assert.equal(memory.records[0].day,'2026-11-11');
 assert(memory.records[0].themes.includes('slide'));
 assert.deepEqual(memory.records[0].with,['Лумира']);
 assert.equal(Memory.recall(back,'What did you talk about yesterday?',noon(2026,11,15)).found,false);
 const ctx=Memory.context(back,'што разговаравте вчера?',later);
 assert(ctx.length<=340);
 assert(ctx.includes('slide'));
 assert(!ctx.includes('Што има на лизгалката?'));
});
test('records are bounded and untrusted backups sanitized',()=>{
 const p={playgroundAiMemories:[
  {day:'2026-11-11',place:'shared',topics:['slide','bad_token'],companions:['John <script>','https://bad.example'],moments:9000},
  {day:'2030-01-01',place:'shared',topics:['water'],companions:[],moments:3},
  {day:'not-a-date',place:'local',topics:['stars'],companions:[],moments:2}
 ]};
 const x=Memory.read(p,noon(2026,11,12));
 assert.equal(x.length,1);assert.deepEqual(x[0].topics,['slide']);
 assert.deepEqual(x[0].companions,['John script']);
 assert.equal(x[0].moments,99);
 assert.deepEqual(Memory.read({playgroundAiMemories:{not:'an array'}},noon(2026,11,12)),[]);
 Memory.clear(p);assert.equal(p.playgroundAiMemories.length,0);
});
