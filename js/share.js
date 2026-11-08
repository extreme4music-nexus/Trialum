/* TRIALUM 1.3: local screenshots and voluntary sharing; no automatic upload. */
(function(root){
'use strict';
const clip=(v,n)=>String(v??'').slice(0,n);
function compose(s,opts={}){
 const cv=document.createElement('canvas');cv.width=1100;cv.height=786;
 const c=cv.getContext('2d',{alpha:false}),g=c.createLinearGradient(0,0,1100,786);
 g.addColorStop(0,'#092b3f');g.addColorStop(.6,'#0b3d49');g.addColorStop(1,'#191c4d');c.fillStyle=g;c.fillRect(0,0,1100,786);
 c.fillStyle='#cffdf4';c.font='bold 34px sans-serif';c.textAlign='left';c.fillText('✺ ТРИАЛУМ · ЖИВА ИСКРА',44,49);
 c.fillStyle='#a7e7de';c.font='21px sans-serif';c.textAlign='right';c.fillText('ДЕН '+s.lastDay+' · ЛАБ '+(s.research?.level||1),1056,49);
 const src=document.getElementById('world');if(src)try{c.drawImage(src,0,0,src.width,src.height,0,75,1100,625)}catch(_){}
 c.fillStyle='rgba(5,20,36,.91)';c.fillRect(0,615,1100,171);
 c.strokeStyle='#47b8ba';c.lineWidth=2;c.strokeRect(10,625,1080,150);
 c.textAlign='left';c.fillStyle='#e4fff4';c.font='bold 29px sans-serif';
 const p=s.pets.find(x=>x.id===s.selectedPet),ep=p&&root.TrialumEngine?.evolutionProgress(p);
 c.fillText(opts.achievement?'🏆 '+clip(opts.achievement.title,40):p?'🐾 '+clip(p.name,40):'⚗️ Мојот фантастичен биосвет',44,676);
 c.font='21px sans-serif';c.fillStyle='#9bdce9';
 c.fillText(opts.achievement?clip(opts.achievement.description,85):p?'Ниво '+ep.level+' · '+clip(ep.epoch,32)+' · '+(ep.trained||0)+' учења':'Свет создаден од фантастични хемиски правила',44,713);
 c.fillStyle='#c7c3ff';c.font='19px sans-serif';c.fillText('Миленици '+s.pets.length+' · Живеалишта '+s.habitats.length+' · Без реклами',44,753);
 c.textAlign='right';c.fillText('TRIALUM 1.3',1052,751);return cv;
}
function dataUrl(s,o){return compose(s,o).toDataURL('image/png');}
function download(url,name){const a=document.createElement('a');a.download=name;a.href=url;document.body.append(a);a.click();a.remove();}
async function share(s,opts={}){
 const img=dataUrl(s,opts),title=opts.achievement?'ТРИАЛУМ · '+opts.achievement.title:'Мојот ТРИАЛУМ биосвет',
 name='TRIALUM_'+(opts.achievement?'achievement':'world')+'_day_'+s.lastDay+'.png';
 if(root.TrialumAndroid?.shareImage){root.TrialumAndroid.shareImage(img,title);return{ok:true,message:'Отворен е Android избор за споделување.'};}
 if(navigator.share&&navigator.canShare){
  try{
   const blob=await (await fetch(img)).blob(),file=new File([blob],name,{type:'image/png'});
   if(navigator.canShare({files:[file]})){await navigator.share({title,files:[file],text:opts.achievement?.description||'Мојот ТРИАЛУМ биосвет'});return{ok:true,message:'Сликата е споделена.'};}
  }catch(e){if(e?.name==='AbortError')return{ok:false,message:'Споделувањето е откажано.'};}
 }
 download(img,name);return{ok:true,message:'PNG сликата е подготвена.'};
}
async function save(s,opts={}){
 const img=dataUrl(s,opts),name='TRIALUM_den_'+s.lastDay+(opts.achievement?'_achievement':'')+'.png';
 if(root.TrialumAndroid?.saveImage){root.TrialumAndroid.saveImage(img,name);return{ok:true,message:'Сликата е зачувана локално на Android.'};}
 download(img,name);return{ok:true,message:'Сликата е преземена како PNG.'};
}
async function shareAchievement(s,a){if(!a?.id)return{ok:false,message:'Избери постигнување.'};return share(s,{achievement:a});}
root.TrialumShare={compose,dataUrl,share,save,shareAchievement};
})(typeof globalThis!=='undefined'?globalThis:this);
