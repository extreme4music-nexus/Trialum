/* LW-D internal, server-side English pivot. No external provider fallback.
 * The endpoint is selected by the server operator; never by clients. */
export const SPEECH_LANGUAGES=Object.freeze([
 'mk','sq','en','es','fr','de','it','pt','tr','ar','zh','ja','ko','ru','hi','id','pl'
]);
const supported=new Set(SPEECH_LANGUAGES);
export function speechLanguage(value){
 const language=String(value||'').trim().toLowerCase().split('-')[0];
 if(!supported.has(language))throw Error('unsupported_speech_language');
 return language;
}
export function safeSentence(value){
 if(typeof value!=='string')throw Error('invalid_speech_translation');
 const s=value.trim();
 if(!s||s.length>160||/[\u0000-\u001f\u007f]/.test(s)||
  /(?:https?:\/\/|www\.|\S+@\S+|\b\+?\d[\d ().-]{7,}\d\b)/i.test(s))
  throw Error('invalid_speech_translation');
 return s;
}
/** Strict script boundary: this is an ASCII English candidate check, not
 * a semantic language classifier. Never label Cyrillic or non-Latin as EN. */
export function canonicalEnglish(value){
 const text=safeSentence(value);
 if(!/^[\\x20-\\x7e]+$/.test(text)||!/[A-Za-z]/.test(text))
  throw Error('non_english_speech');
 return text;
}

export function privateTranslatorUrl(value){
 if(!value)throw Error('translator_unavailable');
 let url;
 try{url=new URL(value);}catch(_){throw Error('translator_unavailable');}
 if(url.protocol!=='http:'||!['trialum-translator','127.0.0.1','localhost'].includes(url.hostname)||
   url.pathname!=='/translate'||url.search||url.hash||url.username||url.password)
   throw Error('translator_unavailable');
 return url.href;
}
export async function translateSentence(text,source,target,{
 endpoint=process.env.TRIALUM_TRANSLATOR_URL,
 fetcher=globalThis.fetch,timeoutMs=2500
}={}){
 const from=speechLanguage(source),to=speechLanguage(target),phrase=source==='en'?canonicalEnglish(text):safeSentence(text);
 if(from===to)return phrase;
 const url=privateTranslatorUrl(endpoint);
 const controller=new AbortController();
 const limit=setTimeout(()=>controller.abort(),Math.min(5000,Math.max(100,timeoutMs)));
 try{
  const response=await fetcher(url,{
   method:'POST',headers:{'content-type':'application/json','accept':'application/json'},
   body:JSON.stringify({q:phrase,source:from,target:to,format:'text'}),
   signal:controller.signal
  });
  if(!response.ok)throw Error('translator_unavailable');
  const payload=await response.json();
  return to==='en'?canonicalEnglish(payload?.translatedText):safeSentence(payload?.translatedText);
 }catch(_){throw Error('translator_unavailable');}
 finally{clearTimeout(limit);}
}
export async function bridgeSpeech(text,source,target,options={}){
 const from=speechLanguage(source),to=speechLanguage(target);
 const englishText=canonicalEnglish(await translateSentence(text,from,'en',options));
 const displayText=await translateSentence(englishText,'en',to,options);
 return {englishText,text:displayText,language:to};
}

/** Readiness is genuine: a configured URL alone is not a working translator.
 * Small 8s per-process cache bounds repeated status/auth probes. Never send
 * speech to an unhealthy translator, never advertise a fake language bridge. */
let readiness={endpoint:'',at:0,ready:false};
export async function translatorReady({
 endpoint=process.env.TRIALUM_TRANSLATOR_URL,
 fetcher=globalThis.fetch,
 timeoutMs=1500
}={}){
 let url;
 try{url=privateTranslatorUrl(endpoint);}catch(_){return false;}
 const cached=fetcher===globalThis.fetch&&readiness.endpoint===url&&
   Date.now()-readiness.at<8000;
 if(cached)return readiness.ready;
 const ctrl=new AbortController();
 const timer=setTimeout(()=>ctrl.abort(),Math.min(4000,Math.max(100,timeoutMs)));
 let ok=false;
 try{
  const health=new URL(url);health.pathname='/healthz';
  const response=await fetcher(health.href,{method:'GET',
   headers:{accept:'application/json'},signal:ctrl.signal,redirect:'error'});
  if(response.ok){
   const v=await response.json();
   ok=v?.ready===true&&Array.isArray(v.languages)&&
      ['en','mk','sq'].every(lang=>v.languages.includes(lang));
  }
 }catch(_){ok=false;}
 finally{clearTimeout(timer);}
 if(fetcher===globalThis.fetch)readiness={endpoint:url,at:Date.now(),ready:ok};
 return ok;
}
