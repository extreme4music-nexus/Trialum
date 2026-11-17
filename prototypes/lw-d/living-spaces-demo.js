/* Trialum Living Spaces local UX prototype. No writes into TrialumEngine. */
(function(){"use strict";
const core=globalThis.TrialumLivingSpaces,owner="owner-local",actor={id:owner,role:"player"};
const opts={bounds:{width:12,depth:12,height:4},allowedAssets:["bed","desk","chair","plant","shelf","rug"]};
const C=document.getElementById("room"),cx=C.getContext("2d"),$=id=>document.getElementById(id);
const storageKey="trialum-living-spaces:preview:local-owner";
const catalog={bed:{emoji:"🛏️",label:"Кревет",size:[2,1,1]},desk:{emoji:"🪑",label:"Маса",size:[2,1,1]},chair:{emoji:"💺",label:"Стол",size:[1,1,1]},plant:{emoji:"🪴",label:"Растение",size:[1,1,1]},shelf:{emoji:"📚",label:"Полица",size:[2,1,1]},rug:{emoji:"🟩",label:"Килим",size:[2,.1,2]}};
let state=core.create(owner,"private-home-preview"),selected=null,mode="select";
try{const candidate=JSON.parse(localStorage.getItem(storageKey));core.validate(candidate);if(candidate.ownerId===owner&&candidate.roomId==="private-home-preview")state=candidate;}catch(_){}
function say(s){$("notice").textContent=s;}
function save(){try{localStorage.setItem(storageKey,JSON.stringify(state))}catch(_){say("Не може локално да се зачува. Извези JSON.")}}
function xy(x,z){return [100+(x-z)*23,95+(x+z)*15]}
function polygon(coords,fill,stroke){cx.beginPath();coords.forEach(([x,y],i)=>i?cx.lineTo(x,y):cx.moveTo(x,y));cx.closePath();cx.fillStyle=fill;cx.fill();cx.strokeStyle=stroke;cx.lineWidth=1;cx.stroke()}
function draw(){
 cx.clearRect(0,0,C.width,C.height);
 cx.fillStyle="#122d33";cx.fillRect(0,0,C.width,C.height);
 cx.save();cx.translate(255,27);
 for(let z=0;z<12;z++)for(let x=0;x<12;x++){
  const a=xy(x,z),b=xy(x+1,z),c=xy(x+1,z+1),d=xy(x,z+1);
  polygon([a,b,c,d],(x+z)%2?"#294b48":"#315a53","#527a68");
 }
 for(const it of [...state.items].sort((a,b)=>(a.position[0]+a.position[2])-(b.position[0]+b.position[2]))){
  const [x,,z]=it.position,[w,,d]=it.size;const a=xy(x,z),b=xy(x+w,z),c=xy(x+w,z+d),q=xy(x,z+d);
  polygon([a,b,c,q],it.id===selected?"#c9ba64":"#629d80",it.id===selected?"#fff4a5":"#b5e1bc");
  const center=xy(x+w/2,z+d/2);cx.fillStyle="#fff";cx.font="26px system-ui";cx.textAlign="center";
  cx.fillText(catalog[it.assetId]?.emoji||"⬡",center[0],center[1]+3);
  cx.font="12px system-ui";cx.fillStyle="#edf7e8";cx.fillText(catalog[it.assetId]?.label||it.assetId,center[0],center[1]+18);
 }
 cx.restore();
 $("activeItem").textContent=selected?"Избрано: "+(state.items.find(i=>i.id===selected)?.label||selected):"Нема избран предмет";
 $("undo").disabled=!state.history?.length;$("redo").disabled=!state.undone?.length;
}
function apply(action,payload,act=actor){
 try{state=core.edit(state,act,action,payload,opts);save();draw();say("Зачувана измена "+action+". Ревизија "+state.revision);return true;}
 catch(e){say("Неуспешно: "+e.message);return false}
}
let counter=0;function addAt(x,z){
 const assetId=$("furniture").value,spec=catalog[assetId],id="f-"+Date.now().toString(36)+"-"+(++counter);
 return apply("place",{id,assetId,label:spec.label,position:[x,0,z],rotationY:0,size:spec.size,editable:true,petEditable:assetId!=="rug",petOwnerId:assetId!=="rug"?"pet-preview":""});
}
function clicked(event){
 const rect=C.getBoundingClientRect(),px=(event.clientX-rect.left)*C.width/rect.width-255-100,
 py=(event.clientY-rect.top)*C.height/rect.height-27-95;
 const x=Math.floor((px/23+py/15)/2),z=Math.floor((py/15-px/23)/2);
 if(x<0||z<0||x>=12||z>=12)return;
 const hit=[...state.items].reverse().find(i=>x>=i.position[0]&&x<i.position[0]+i.size[0]&&z>=i.position[2]&&z<i.position[2]+i.size[2]);
 if(mode==="move"&&selected){const item=state.items.find(i=>i.id===selected);if(item&&apply("move",{id:selected,position:[x,0,z]}))mode="select";}
 else if(mode==="add"){addAt(x,z);mode="select";}
 else selected=hit?.id||null;
 draw();
}
C.addEventListener("pointerup",clicked);
$("add").onclick=()=>{mode="add";say("Допрете слободно место на подот.");};
$("move").onclick=()=>{if(!selected)return say("Прво избери предмет.");mode="move";say("Допрете ја новата позиција.");};
$("rotate").onclick=()=>{const item=state.items.find(i=>i.id===selected);if(!item)return say("Прво избери предмет.");apply("rotate",{id:item.id,rotationY:(item.rotationY+Math.PI/2)%(2*Math.PI)});};
$("redecorate").onclick=()=>{const item=state.items.find(i=>i.id===selected);if(!item)return say("Прво избери предмет.");const assetId=$("furniture").value;apply("redecorate",{id:item.id,assetId,size:catalog[assetId].size});};
$("remove").onclick=()=>{if(!selected)return say("Прво избери предмет.");if(apply("remove",{id:selected}))selected=null;draw();};
$("pet").onclick=()=>{
 const item=state.items.find(i=>i.id===selected);
 if(!item)return say("Прво избери предмет што миленичето може да го премести.");
 const p={id:item.id,position:[Math.min(11,item.position[0]+1),0,item.position[2]]};
 try{state=core.petSuggestion(state,{ownerId:owner,id:"pet-preview"},"move",p,opts);save();draw();say("🐾 Симулирана AI-одлука: поместив нешто во сопствениот дом.");}
 catch(e){say("AI предлогот е одбиен: "+e.message);}
};
$("undo").onclick=()=>{try{state=core.undo(state,actor);save();draw();say("Вратена измена.");}catch(e){say(e.message)}};
$("redo").onclick=()=>{try{state=core.redo(state,actor);save();draw();say("Повторена измена.");}catch(e){say(e.message)}};
$("reset").onclick=()=>{if(confirm("Да се избрише само локалната TEST сцена?")){state=core.create(owner,"private-home-preview");selected=null;save();draw();say("Тест-сцената е ресетирана.")}};
$("export").onclick=()=>{const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"});const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="trialum-living-spaces-test.json";a.click();setTimeout(()=>URL.revokeObjectURL(url),2000)};
if(!state.items.length){addAt(2,2);$("furniture").value="desk";addAt(6,4);$("furniture").value="plant";addAt(9,7);$("furniture").value="bed";}
draw();
})();
