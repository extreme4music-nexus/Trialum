
(function(root){
'use strict';
let active=null,frame=null;
const TAU=Math.PI*2;
function draw(ctx,s,t){
 ctx.clearRect(0,0,1000,520);
 const sky=ctx.createLinearGradient(0,0,0,520);
 sky.addColorStop(0,'#102d53');sky.addColorStop(.59,'#298f9c');sky.addColorStop(1,'#448b65');
 ctx.fillStyle=sky;ctx.fillRect(0,0,1000,520);
 ctx.fillStyle='#297b5b';ctx.fillRect(0,377,1000,143);
 for(let n=0;n<28;n++){
  ctx.fillStyle=n%2?'#b7f6c9':'#ffe0a4';ctx.beginPath();
  ctx.arc(n*40+20,469+(n%3)*12,2.5+n%3,0,TAU);ctx.fill();
 }
 const items={sandbox:'🏖️',seesaw:'⚖️',slide:'🛝',pool:'🏊',obstacle:'🧩',trampoline:'✨'};
 ctx.font='48px system-ui';ctx.textAlign='center';
 s.toys.forEach((id,i)=>ctx.fillText(items[id]||'🎠',110+(i%6)*155,422+Math.sin(t*.8+i)*5));
 // Latest confirmed server events plus accepted consent-based guests.
 const cast=new Map();
 const ownWorld=root.TrialumShared?.getWorld?.(),presence=root.TrialumPresence;
 const ownIds=new Set(ownWorld?.pets?.map(p=>String(p.id))||[]);
 for(const e of s.events||[]){
  if(e.kind==='played'&&e.payload?.pet){
   const p=e.payload.pet;
   if(ownIds.has(String(p.id))||Date.now()-Date.parse(e.at)>8000)continue;
   cast.set(e.actor+':'+p.id,{...p,display:e.actor,
     latest:Date.parse(e.at),toy:e.payload.toyId});
  }
 }
 for(const v of s.visitors||[]){
  if(v.pet){
   cast.set('visit:'+v.id,{...v.pet,display:v.pet.name,
     latest:Date.now(),toy:'seesaw'});
  }
 }
 if(ownWorld&&presence&&s.room?.id){
  for(const p of ownWorld.pets||[]){
   if(!presence.isAt(ownWorld,p.id,presence.SHARED,s.room.id))continue;
   // Only a public visual profile is used in the shared canvas.
   cast.set('self:'+p.id,{id:p.id,name:p.name,display:p.name,species:p.species,
    hue:p.hue,eyes:p.eyes,seed:p.seed,growth:p.growth,shape:p.shape,
    latest:Date.now(),toy:'seesaw'});
  }
 }
 const pets=[...cast.values()].slice(-6);
 for(let i=0;i<pets.length;i++){
  const p=pets[i],x=1000*(i+1)/(pets.length+1),y=283+Math.sin(t*1.5+i)*5;
  const motion=(Date.now()-p.latest)<5000;
  const action=motion?{skill:p.toy==='slide'?'leap':p.toy==='trampoline'?'spin':p.toy==='seesaw'?'wave':'symbols',
    start:t-1,duration:3.2}:null;
  if(root.TrialumCreatureArt?.draw){
   // Level is visual style only. Server does not trust or transfer real XP.
   root.TrialumCreatureArt.draw(ctx,p,{x,y,size:.38},t,false,{level:28},action);
  }else{
   ctx.fillStyle='hsl('+p.hue+',71%,63%)';ctx.beginPath();
   ctx.arc(x,y,47,0,TAU);ctx.fill();
   ctx.fillStyle='white';ctx.fillRect(x-24,y-13,12,12);ctx.fillRect(x+12,y-13,12,12);
  }
  ctx.fillStyle='#edfff5';ctx.textAlign='center';ctx.font='bold 14px system-ui';
  ctx.fillText(String(p.display||p.name).slice(0,32),x,356);
 }
 ctx.fillStyle='rgba(11,36,56,.7)';ctx.fillRect(10,12,198,32);
 ctx.fillStyle='#e9fff5';ctx.font='bold 14px system-ui';ctx.textAlign='left';
 ctx.fillText('🔐 Потврдени групни настани',18,33);
}
function mount(){
 const node=root.document?.getElementById('sharedScene');
 if(!node)return;
 if(active===node&&frame!==null)return;
 stop();active=node;
 const loop=now=>{
  if(!root.document?.contains(active)){stop();return;}
  const snap=root.TrialumShared?.getState?.()?.snapshot;
  const ctx=active?.getContext?.('2d');if(snap&&ctx)draw(ctx,snap,now/1000);
  if(root.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches){frame=null;return;}
  frame=root.requestAnimationFrame(loop);
 };
 frame=root.requestAnimationFrame(loop);
}
function stop(){
 if(frame!==null)root.cancelAnimationFrame?.(frame);
 frame=null;active=null;
}
root.TrialumSharedScene={mount,stop,draw};
})(typeof globalThis!=='undefined'?globalThis:this);
