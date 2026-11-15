/* LW-D L3.7: original procedural room motifs and orientation-aware audio.
 * Native Web Audio API; zero network/asset dependencies; no saved-state writes.
 * Sound/music permissions are inherited from the original player's settings.
 */
(function(root,factory){
 "use strict";
 const api=factory(root);
 if(typeof module==="object"&&module.exports)module.exports=api;
 root.TrialumLWSpatialAudio=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(root){
 "use strict";
 const profiles=Object.freeze({
  hub:Object.freeze({base:174.61,step:850,pattern:[0,7,12,19,14,7,4,12],wave:"triangle",label:"Main Lobby"}),
  basic:Object.freeze({base:130.81,step:680,pattern:[0,12,3,7,10,7,3,12],wave:"sine",label:"Molecular Lab"}),
  dna:Object.freeze({base:146.83,step:980,pattern:[0,1,7,8,12,8,7,3],wave:"sine",label:"DNA"}),
  foodlab:Object.freeze({base:164.81,step:590,pattern:[0,4,7,11,12,7,4,2],wave:"triangle",label:"Food"}),
  floralab:Object.freeze({base:196.00,step:1150,pattern:[0,5,9,12,7,5,2,9],wave:"sine",label:"Flora"}),
  research:Object.freeze({base:155.56,step:730,pattern:[0,2,7,11,14,9,7,2],wave:"sine",label:"Research"}),
  biosphere:Object.freeze({base:185.00,step:1200,pattern:[0,7,9,12,16,12,9,7],wave:"sine",label:"Biosphere"}),
  garden:Object.freeze({base:196.00,step:1120,pattern:[0,5,9,12,9,7,5,2],wave:"sine",label:"Garden"}),
  discovery:Object.freeze({base:155.56,step:850,pattern:[0,3,7,14,11,7,3,0],wave:"sine",label:"Discovery"})
 });
 const normalize=(vector,otherwise)=>Array.isArray(vector)&&vector.length===3&&
   vector.every(Number.isFinite)&&Math.hypot(...vector)>0
    ?vector.map(x=>x/Math.hypot(...vector)):otherwise;
 const clamp=(n,a,b)=>Math.min(b,Math.max(a,Number.isFinite(Number(n))?Number(n):a));
 const profileFor=(scene,room)=>{
  if(scene==="lab")return profiles[room]||profiles.hub;
  return profiles[scene==="flora"?"garden":scene==="research"?"discovery":scene]||profiles.hub;
 };
 // Prototype sonic vocabulary. A reactor, seed chamber and DNA engine
 // must not all sound like the same generic success button.
 const cues=Object.freeze({
  synthesize:[523,.36,"sine",1.60],analyze:[785,.28,"sine",.88],
  harvest:[196,.29,"triangle",.62],grow:[392,.48,"sine",1.70],
  design:[494,.40,"triangle",1.25],transform:[330,.66,"sine",2.0],
  craft:[293,.38,"triangle",1.45],feed:[440,.33,"sine",1.20],
  invent:[587,.52,"sine",1.46],plant:[349,.53,"sine",1.85],
  study:[659,.40,"sine",1.30],upgrade:[392,.61,"triangle",1.78]
 });
 const cueFor=(room,operation,ok)=>{
  const [base,length,wave,glide]=cues[operation]||[392,.30,"sine",1.1];
  return Object.freeze({base:ok?base:Math.max(125,base*.65),
   length:ok?length:Math.min(.45,length),wave:ok?wave:"triangle",
   glide:ok?glide:.67});
 };
 const sourcePosition=(room,station)=> {
  const lookup={
   basic:"TrialumLabRoom",dna:"TrialumDnaRoom",foodlab:"TrialumFoodRoom",
   floralab:"TrialumFloraRoom",research:"TrialumResearchRoom"
  };
  const st=root[lookup[room]]?.station?.(station)||null;
  return st&&[st.x,st.y??0,st.z].every(Number.isFinite)
   ?[st.x,st.y??0,st.z]:[0,0,room==="hub"?3.2:-2];
 };
 let ctx=null,musicBus=null,effectBus=null,timer=null,stepIndex=0,scene="lab",room="hub",station=null;
 let permitted={sound:false,music:false,volume:.55},muted=false,visible=true,unlocked=false,ready=false;
 let listenerPosition=[0,0,17],listenerForward=[0,0,-1],listenerUp=[0,1,0];
 const Ctx=()=>root.AudioContext||root.webkitAudioContext;
 const active=()=>visible&&!muted&&unlocked&&ctx?.state==="running";
 const allowMusic=()=>active()&&permitted.sound&&permitted.music;
 const allowEffects=()=>active()&&permitted.sound;
 function setParam(param,value){if(!param)return;param.setTargetAtTime(value,ctx.currentTime,.035);}
 function applyListener(){
  if(!ctx)return;
  const l=ctx.listener;
  const modern=l.positionX&&l.forwardX&&l.upX;
  if(modern){
   for(const [names,vec] of [
    [["positionX","positionY","positionZ"],listenerPosition],
    [["forwardX","forwardY","forwardZ"],listenerForward],
    [["upX","upY","upZ"],listenerUp]
   ])for(let i=0;i<3;i++)setParam(l[names[i]],vec[i]);
  }else{
   l.setPosition?.(...listenerPosition);
   l.setOrientation?.(...listenerForward,...listenerUp);
  }
 }
 function updateCamera(detail){
  const pos=detail?.position,front=detail?.forward,up=detail?.up;
  if(!Array.isArray(pos)||pos.length!==3||!pos.every(Number.isFinite))return;
  listenerPosition=pos.map(v=>clamp(v,-100,100));
  listenerForward=normalize(front,[0,0,-1]);
  listenerUp=normalize(up,[0,1,0]);
  applyListener();
 }
 function ensureContext(){
  if(!Ctx()||ctx)return Boolean(ctx);
  try{
   ctx=new (Ctx())();
   musicBus=ctx.createGain();effectBus=ctx.createGain();
   musicBus.connect(ctx.destination);effectBus.connect(ctx.destination);
   applyListener();applyMix();return true;
  }catch(_){ctx=null;return false;}
 }
 function applyMix(){
  if(!ctx)return;
  setParam(musicBus.gain,allowMusic()?clamp(permitted.volume,0,1)*.24:0);
  setParam(effectBus.gain,allowEffects()?clamp(permitted.volume,0,1)*.32:0);
 }
 function soundTone(freq,length,amplitude,wave,offset=0,position=null,glide=1){
  if(!ctx)return;
  const when=ctx.currentTime+Math.max(0,offset),duration=clamp(length,.07,1.8);
  const osc=ctx.createOscillator(),env=ctx.createGain(),filter=ctx.createBiquadFilter();
  osc.type=wave;osc.frequency.setValueAtTime(clamp(freq,40,1800),when);
  if(glide!==1)osc.frequency.exponentialRampToValueAtTime(clamp(freq*glide,40,2500),when+duration*.9);
  filter.type="lowpass";filter.frequency.setValueAtTime(1450,when);
  env.gain.setValueAtTime(.00001,when);
  env.gain.exponentialRampToValueAtTime(clamp(amplitude,.0001,.25),when+.025);
  env.gain.exponentialRampToValueAtTime(.00001,when+duration);
  osc.connect(filter);filter.connect(env);
  let panner=null;
  if(position){
   const p=ctx.createPanner();panner=p;
   p.panningModel="HRTF";p.distanceModel="inverse";
   p.refDistance=5;p.maxDistance=35;p.rolloffFactor=.75;
   if(p.positionX){
    [p.positionX,p.positionY,p.positionZ].forEach((axis,i)=>axis.setValueAtTime(position[i],when));
   }else p.setPosition(...position);
   env.connect(p);p.connect(effectBus);
  }else env.connect(musicBus);
  osc.start(when);osc.stop(when+duration+.035);
  osc.onended=()=>{try{osc.disconnect();env.disconnect();filter.disconnect();panner?.disconnect();}catch(_){}};
 }
 function musicStep(){
  if(!allowMusic())return;
  const p=profileFor(scene,room),k=stepIndex++;
  const interval=p.pattern[k%p.pattern.length],freq=p.base*Math.pow(2,interval/12);
  soundTone(freq,Math.min(1.4,p.step/1000*.93),.24,p.wave);
  if(k%4===0)soundTone(p.base/2,1.35,.11,"sine",.02);
  if(k%8===4)soundTone(freq*1.5,.48,.05,"sine",.11);
 }
 function stopTimer(){if(timer!==null){clearInterval(timer);timer=null;}}
 function restartMusic(){
  stopTimer();stepIndex=0;applyMix();
  if(!allowMusic())return;
  musicStep();
  timer=setInterval(musicStep,profileFor(scene,room).step);
 }
 function sceneChanged(nextScene,nextRoom){
  const s=String(nextScene||"lab"),r=String(nextRoom||"hub");
  if(!["lab","flora","biosphere","research"].includes(s))return;
  const changed=scene!==s||room!==r;
  scene=s;room=["hub","basic","dna","foodlab","floralab","research"].includes(r)?r:"hub";
  station=null;
  if(changed)restartMusic();
 }
 function settings(input){
  const next={sound:input?.sound===true,music:input?.music===true,volume:clamp(input?.volume,0,1)};
  const changed=next.sound!==permitted.sound||next.music!==permitted.music;
  permitted=next;
  // Frequent authoritative world snapshots MUST NOT restart the room theme.
  if(changed)restartMusic();else applyMix();
  drawButton();
 }
 function visibility(next){
  visible=Boolean(next);
  if(!visible){stopTimer();applyMix();ctx?.suspend?.().catch(()=>{});}
  else if(ctx&&unlocked){ctx.resume?.().then(()=>{applyMix();restartMusic();}).catch(()=>{});}
 }
 function playResult(detail){
  if(!allowEffects()||!detail||detail.scene!==scene)return;
  if(scene==="lab"&&detail.room!==room)return;
  const position=sourcePosition(room,station);
  const success=detail.ok===true,cue=cueFor(room,detail.operation,success);
  // Event-specific audible outcome, only AFTER original engine authorization.
  soundTone(cue.base,cue.length,.18,cue.wave,0,position,cue.glide);
  if(success)soundTone(cue.base*1.5,.19,.10,"sine",.14,position,1.12);
 }
 function statusMessage(){
  if(!Ctx())return "Web Audio unavailable";
  if(!permitted.sound)return "Sound disabled; tap to turn on 3D music";
  if(!permitted.music)return "Music disabled; tap to turn on 3D music";
  if(muted)return "Tap to unmute 3D sound";
  return unlocked?"3D audio enabled":"Tap or interact with the 3D scene to start audio";
 }
 function drawButton(){
  const btn=root.document?.getElementById?.("lw-spatial-toggle");
  if(!btn)return;
  const en=root.document?.documentElement?.lang==="en";
  let label=permitted.sound&&permitted.music?
    (muted?"🔇 3D":unlocked?"♫ 3D":"🔊 3D"):
    "♫ 3D";
  let detail=!permitted.sound||!permitted.music?
    (en?"Tap to enable music":"Допрете за музика"):
    muted?(en?"Muted":"Исклучено"):
    unlocked?(en?"Audio on":"Звук вклучен"):
    (en?"Tap in 3D to play":"Допрете во 3D");
  btn.textContent=label;
  btn.title=statusMessage();
  btn.setAttribute("aria-label",(en?"3D audio: ":"3D звук: ")+detail);
  btn.setAttribute("aria-pressed",String(!muted&&unlocked&&permitted.sound));
  const info=root.document?.getElementById?.("lw-spatial-info");
  if(info)info.textContent=detail;
 }
 function requestMusicByGesture(){
  // The gesture is explicit consent. Saved audio settings are mutated only
  // in the validated parent app, never in this visual WebGL iframe.
  if(root.parent===root||!root.parent?.postMessage)return false;
  root.parent.postMessage({type:"trialum:lw:audio-consent",enableMusic:true},root.location.origin);
  return true;
 }
 async function unlockFromGesture(explicitToggle=true){
  if(!visible||!Ctx()){drawButton();return false;}
  const consent=explicitToggle&&(!permitted.sound||!permitted.music);
  if(consent)requestMusicByGesture();
  // Touch-to-start is required on some Android WebViews. Do this while
  // still processing the gesture, before waiting for parent messages.
  if(!ensureContext()){drawButton();return false;}
  if(explicitToggle&&!consent&&unlocked&&ctx.state==="running"){
   muted=!muted;
   applyMix();restartMusic();drawButton();
   return !muted;
  }
  if(!explicitToggle&&unlocked&&ctx.state==="running")return true;
  // If Android suspended the context, an ordinary interaction resumes it
  // rather than silently toggling a previously unlocked sound OFF.
  let resumed;
  try{resumed=ctx.resume?.();}catch(_){drawButton();return false;}
  try{
   if(resumed&&typeof resumed.then==="function")await resumed;
   if(ctx.state!=="running"){drawButton();return false;}
   unlocked=true;muted=false;
   applyMix();restartMusic();drawButton();return true;
  }catch(_){drawButton();return false;}
 }
 function bindInteraction(){
  const btn=root.document.getElementById("lw-spatial-toggle");
  btn?.addEventListener("click",()=>{void unlockFromGesture(true);});
  // No special extra button press: the FIRST ordinary 3D tap/drag unlocks
  // existing authorized sound effects and any previously enabled music.
  // An explicit click on the visible toggle can also enable stored music.
  root.document.addEventListener("pointerdown",event=>{
   if(event.target?.closest?.("#lw-spatial-toggle"))return;
   if(permitted.sound&&visible&&(!unlocked||ctx?.state!=="running"))
     void unlockFromGesture(false);
  },{capture:true,passive:true});
  drawButton();
 }
 if(root.document?.addEventListener){
  if(root.document.readyState==="loading")
   root.document.addEventListener("DOMContentLoaded",bindInteraction,{once:true});
  else bindInteraction();
  root.document.addEventListener("visibilitychange",()=>visibility(!root.document.hidden));
  root.addEventListener?.("pagehide",()=>visibility(false));
  root.addEventListener?.("trialum:lw:complex-room-changed",e=>sceneChanged("lab",e.detail?.room));
  root.addEventListener?.("trialum:lw:audio-scene",e=>sceneChanged(e.detail?.scene,e.detail?.room));
  root.addEventListener?.("trialum:lw:camera",e=>updateCamera(e.detail));
  const selection=[
   ["trialum:lw:station-changed","basic"],
   ["trialum:lw:dna-station-changed","dna"],
   ["trialum:lw:food-station-changed","foodlab"],
   ["trialum:lw:flora-station-changed","floralab"],
   ["trialum:lw:research-station-changed","research"]
  ];
  for(const [event,expected]of selection)root.addEventListener(event,e=>{
   if(scene==="lab"&&room===expected)station=e.detail?.id||null;
  });
  root.addEventListener?.("trialum:lw:engine-feedback",e=>playResult(e.detail));
  root.addEventListener?.("message",e=>{
   if(e.source!==root.parent||e.origin!==root.location?.origin)return;
   if(e.data?.type==="trialum:lw:visibility")visibility(e.data.visible);
   if(e.data?.type==="trialum:lw:state")settings(e.data.world?.audio);
  });
 }
 return Object.freeze({profiles,profileFor,sourcePosition,cueFor,normalize,updateCamera,sceneChanged,settings,visibility,playResult,statusMessage,unlockFromGesture,
  status:()=>({scene,room,visible,unlocked,music:permitted.music,sound:permitted.sound,muted})});
});