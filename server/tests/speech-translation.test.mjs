import test from 'node:test';
import assert from 'node:assert/strict';
import {speechLanguage,safeSentence,privateTranslatorUrl,translateSentence,bridgeSpeech} from '../src/speech-translation.mjs';
const url='http://trialum-translator:5000/translate';
const calls=[];
const dictionary={
 'mk-en':'Здраво, другарче!|Hello, friend!',
 'en-mk':'Hello, friend!|Здраво, другарче!',
 'en-sq':'Hello, friend!|Përshëndetje, mik!'
};
const fetcher=async (_endpoint,options)=>{
 const body=JSON.parse(options.body);
 calls.push(body);
 const match=dictionary[body.source+'-'+body.target];
 if(!match)return {ok:false};
 const [input,translatedText]=match.split('|');
 if(body.q!==input)return {ok:false};
 return {ok:true,json:async()=>({translatedText})};
};
test('supported game languages only, private translator URLs only',()=>{
 assert.equal(speechLanguage('MK-mk'),'mk');
 for(const x of ['','zz','pt2','auto'])assert.throws(()=>speechLanguage(x));
 for(const x of ['http://evil.com/translate','https://trialum-translator/translate',
  'http://trialum-translator:5000/admin','http://user:pass@trialum-translator:5000/translate'])
  assert.throws(()=>privateTranslatorUrl(x));
 assert.equal(privateTranslatorUrl(url),url);
});
test('translated strings retain short privacy boundaries',()=>{
 for(const x of ['', 'x'.repeat(161), 'abc\nhi','name@example.com','https://example.com'])
   assert.throws(()=>safeSentence(x));
});
test('Macedonian source becomes English canonical, then Albanian display',async()=>{
 calls.length=0;
 const v=await bridgeSpeech('Здраво, другарче!','mk','sq',{endpoint:url,fetcher});
 assert.deepEqual(v,{englishText:'Hello, friend!',text:'Përshëndetje, mik!',language:'sq'});
 assert.deepEqual(calls.map(c=>[c.source,c.target]),[['mk','en'],['en','sq']]);
});
test('English LLM output becomes Macedonian display without changing LLM input',async()=>{
 calls.length=0;
 const v=await bridgeSpeech('Hello, friend!','en','mk',{endpoint:url,fetcher});
 assert.equal(v.englishText,'Hello, friend!');
 assert.equal(v.text,'Здраво, другарче!');
 assert.deepEqual(calls.map(c=>[c.source,c.target]),[['en','mk']]);
});
test('missing translator and failed translations fail closed, never forge English',async()=>{
 await assert.rejects(()=>bridgeSpeech('Здраво, другарче!','mk','en',{endpoint:''}),/translator_unavailable/);
 await assert.rejects(()=>translateSentence('Hello, friend!','en','sq',{endpoint:url,fetcher:async()=>({ok:false})}),/translator_unavailable/);
 await assert.rejects(()=>translateSentence('Hello, friend!','en','sq',{endpoint:url,fetcher:async()=>({ok:true,json:async()=>({translatedText:'http://bad'})})}),/translator_unavailable/);
});
