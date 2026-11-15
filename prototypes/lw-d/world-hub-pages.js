/* LW-D L3.8 Connected Hubs: visual-only navigation and authentic natal cards.
 * No new game state, shops, social network, homes, currency or 3D geometry.
 * Every live write goes through existing same-origin parent Classic engine.
 */
(function(root,factory){
 "use strict";
 const api=factory(root);
 if(typeof module==="object"&&module.exports)module.exports=api;
 root.TrialumHubPages=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(root){
 "use strict";
 const main=[
  ["🌍","world","page"],["🏛️","lab","room"],["🔬","knowledge","room"],
  ["🌿","flora","room"],["🌿","agroLobby","scene"],["🌱","garden","page"],["🧫","nursery","page"],
  ["🐾","pets","page"],["🏡","homes","page"],["🍱","foodlab","room"],
  ["🤝","social","page"],["◈","market","page"],["☰","more","page"]
 ];
 const social=[
  ["🎠","playground","classic"],["🌳","shared","classic"],
  ["💌","messagesHud","page"],["🤝","friendsHud","page"]
 ];
 const market=[
  ["🧸","toys","page"],["👗","boutique","page"],["🛋️","furniture","page"]
 ];
 const more=[
  ["🧬","dna","room"],["🌿","flora","room"],["🍱","foodlab","room"],
  ["🤝","friendsHud","page"],["💌","messagesHud","page"],
  ["🎠","playground","classic"],["🌳","shared","classic"],
  ["🎮","playgamesHud","page"],["🏆","achievementsHud","page"],
  ["📖","diaryHud","page"],["🔔","notificationsHud","page"],
  ["⚙️","settingsHud","page"],["☰","moreClassicHud","page"]
 ];
 const dictionary={
  mk:{
   hub:"Главно лоби",hubHelp:"Централна раскрсница на Живиот свет. Агро атриумот е достапен како вистинско 3D лоби; собите зад трите врати се во изградба. Постојните функции остануваат поврзани.",
   world:"Свет · мини-град",lab:"Лабораториско лоби",dna:"ДНК лабораторија",knowledge:"Знаење · истражување",
   flora:"Флора · лабораторија",agroLobby:"Агро комплекс · 3D",agroEntry:"Влези во новиот Агро атриум",garden:"Градина",nursery:"Живеалиште · инкубатор",
   pets:"Миленичиња",homes:"Домови",foodlab:"Производство на храна",social:"Дружење",
   market:"Продавници",more:"Повеќе",playground:"Локална игротека",shared:"Заедничка игротека",
   messagesHud:"Пораки",friendsHud:"Пријатели",toys:"Продавница за играчки",
   boutique:"Бутик за облека и обвивки",furniture:"Мебел и ентериер",
   playgamesHud:"Google Play Games",achievementsHud:"Постигнувања и галерија",
   diaryHud:"Дневник",notificationsHud:"Известувања",settingsHud:"Поставки",
   moreClassicHud:"Сите постојни функции",close:"Затвори",back:"Назад",
   ready:"Постојна функција",future:"Во развој",preview:"HUD преглед",
   openExisting:"Отвори постојна функција",openHome:"Отвори го постојното живеалиште",
   age:"Возраст",days:"дена",level:"Ниво",species:"Вид",generation:"Генерација",
   lineage:"Еволутивна линија",mood:"Расположение",home:"Дом",skills:"Научени вештини",
   money:"Триони",moneyHelp:"◈ TRI · истите заработени кредити; нема вистински пари ниту нов паричник.",
   noPets:"Во твојот свет сè уште нема миленичиња.",
   noHomes:"Сè уште немаш изградено живеалиште.",
   previous:"Претходни",next:"Следни",natal:"Натална карта",
   oneOf:"од",existingHome:"Постојно живеалиште — 2D приказ",
   houseFuture:"Посебната 3D куќа и надградбите допрва ќе се изградат.",
   worldFuture:"Град со куќи, згради, паркови, улици и заеднички отворени игротеки. Реалниот град и мапата се идни 3D фази, а не лажни сегашни градби.",
   nurseryFuture:"Прво живеалиште на младите миленичиња во крилото до лабораторијата. Возраста и нивото за преселба ќе зависат од видот. Засега не преместуваме ниту едно милениче.",
   gardenFuture:"Физичка градина за садење, одгледување и природен раст, одвоена од лабораторијата за флора. Сè уште нема 3D градинарство.",
   fashionFuture:"Облека, обвивки, изглед и прилагодување на миленичињата — иден систем, без продажби или измислен инвентар.",
   furnitureFuture:"Мебел, ентериери и надградби на вистинските домови — идна фаза со истите заработени Триони.",
   socialHelp:"Овде се четирите оригинални социјални функции. Приватните пораки и пријателства остануваат во постојниот сигурен систем.",
   messageHelp:"Пораките се приватни и се отвораат во постојното функционално мени. HUD интерфејсот е поврзан, но нов 3D разговор не е изграден.",
   friendHelp:"Поканите, пријателите, блокирањето и дозволите остануваат во постојниот систем.",
   toysHelp:"Овие играчки и трошоци доаѓаат од вистинската локална игротека. Купувањето е единствено таму, според оригиналните услови.",
   owned:"Отклучено",cost:"Цена",free:"Бесплатно",locked:"Заклучено",
   later:"Оваа просторија е планирана. Додека не ја изградиме, поврзаните постојни функции остануваат достапни преку менијата.",
   mainLink:"Главно лоби",classicHint:"Постојниот екран и неговите податоци се зачувани, без нов паралелен систем."
  },
  en:{
   hub:"Main Lobby",hubHelp:"The Living World central interchange. The Agro Atrium is now a real 3D lobby; its three rooms are still planned. All existing functions remain connected.",
   world:"World · mini-city",lab:"Laboratory Lobby",dna:"DNA Laboratory",knowledge:"Knowledge · research",
   flora:"Flora Laboratory",agroLobby:"Agro Complex · 3D",agroEntry:"Enter the new Agro Atrium",garden:"Garden",nursery:"Habitat · incubator",
   pets:"Pets",homes:"Homes",foodlab:"Food Production",social:"Social",
   market:"Shops",more:"More",playground:"Local Playground",shared:"Shared Playground",
   messagesHud:"Messages",friendsHud:"Friends",toys:"Toy Shop",
   boutique:"Clothing & Wrap Boutique",furniture:"Furniture & Interiors",
   playgamesHud:"Google Play Games",achievementsHud:"Achievements & Gallery",
   diaryHud:"Diary",notificationsHud:"Notifications",settingsHud:"Settings",
   moreClassicHud:"All existing features",close:"Close",back:"Back",
   ready:"Existing feature",future:"In development",preview:"HUD overview",
   openExisting:"Open existing feature",openHome:"Open existing habitat",
   age:"Age",days:"days",level:"Level",species:"Species",generation:"Generation",
   lineage:"Evolution lineage",mood:"Mood",home:"Home",skills:"Learned skills",
   money:"Trions",moneyHelp:"◈ TRI · your existing earned credits; no real money or new wallet.",
   noPets:"No pets live in your world yet.",noHomes:"You have no built habitats yet.",
   previous:"Previous",next:"Next",natal:"Natal card",oneOf:"of",
   existingHome:"Existing habitat — 2D view",
   houseFuture:"An individual 3D house and home upgrades are not built yet.",
   worldFuture:"A connected city with houses, buildings, parks, streets and shared outdoor playgrounds. The real town and its map are future 3D milestones, not existing buildings.",
   nurseryFuture:"An early-life home in the laboratory building. Graduation will depend on species, age and level. No current pets are relocated.",
   gardenFuture:"A physical garden for sowing, cultivating and growing plants, distinct from the Flora Lab. 3D gardening is not built yet.",
   fashionFuture:"Clothes, wraps and pet customization will come later. No purchases or invented inventory now.",
   furnitureFuture:"Furniture, interiors and home upgrades will use the existing earned Trions in a future milestone.",
   socialHelp:"These are the four original social features. Private messages and friendships stay in the existing secure system.",
   messageHelp:"Messages remain private in the existing functional screen. The HUD entry is linked, but a new 3D chat interface does not yet exist.",
   friendHelp:"Invitations, friends, blocking and permissions remain in the existing system.",
   toysHelp:"Toy names and prices are from the original local playground. Purchases remain there with original eligibility rules.",
   owned:"Unlocked",cost:"Cost",free:"Free",locked:"Locked",
   later:"This location is planned. The existing original functions remain accessible from the linked menus.",
   mainLink:"Main Lobby",classicHint:"Original screen and data remain available, with no parallel game system."
  }
 };
 const pages=new Set(["hub","world","garden","nursery","pets","petCard","homes","social","market","toys","boutique","furniture","messagesHud","friendsHud","more","playgamesHud","achievementsHud","diaryHud","notificationsHud","settingsHud","moreClassicHud"]);
 const active=Boolean(root.document&&root.location&&root.parent!==root&&
   new URLSearchParams(root.location.search).get("live")==="1");
 const el=(tag,cls,textValue)=>{
  const n=root.document.createElement(tag);
  if(cls)n.className=cls;
  if(textValue!==undefined)n.textContent=String(textValue);
  return n;
 };
 let world=null,view="hub",isOpen=false,petIndex=0,selectedPet=null,history=[];
 const lang=()=>world?.language==="en"?"en":"mk";
 const tr=k=>dictionary[lang()][k]||k;
 const panel=active?el("section","lw-hub-page"):null;
 const prefix=(list,key)=>list.some(item=>item[1]===key);
 const playable=k=>["lab","knowledge","flora","foodlab"].includes(k);
 function resolveRoom(key){
  return {lab:"hub",knowledge:"research",flora:"floralab",foodlab:"foodlab",dna:"dna"}[key]||null;
 }
 function button(emoji,key,kind,label,description){
  const b=el("button","lw-hub-card");b.type="button";
  b.dataset.hubKind=kind;b.dataset.hubTarget=key;
  const title=el("span","lw-hub-card-title");
  title.append(el("span","lw-hub-ico",emoji),el("strong",null,label||tr(key)));
  const hint=el("small",null,description||
    (kind==="room"?tr("ready"):kind==="scene"?tr("agroEntry"):kind==="classic"?tr("ready"):tr(pages.has(key)&&!["world","nursery","garden","boutique","furniture"].includes(key)?"preview":"future")));
  b.append(title,hint);return b;
 }
 function cards(list){
  const grid=el("div","lw-hub-grid");
  for(const [emoji,key,kind]of list)grid.append(button(emoji,key,kind));
  return grid;
 }
 function paragraph(text){return el("p","lw-hub-explainer",text);}
 function action(label,key,kind="classic"){
  return button("↗",key,kind,label,kind==="classic"?tr("openExisting"):tr("future"));
 }
 function openHome(id){
  if(typeof id!=="string"||!world?.homes?.some(h=>h.id===id))return;
  root.parent.postMessage({type:"trialum:lw:open-home",id},root.location.origin);
 }
 function paintPortrait(canvas,pet){
  const art=root.TrialumCreatureArt;
  if(!art?.draw||!canvas?.getContext)return;
  try{
   const ctx=canvas.getContext("2d");
   if(!ctx)return;
   const bg=ctx.createLinearGradient(0,0,160,160);
   bg.addColorStop(0,"#154a60");bg.addColorStop(1,"#10243d");
   ctx.fillStyle=bg;ctx.fillRect(0,0,160,160);
   art.draw(ctx,{...pet,evolution:{level:pet.level}}, {x:81,y:78,size:.38},0,false,{level:pet.level});
  }catch(_){/* Image is optional; fallback icon and card text are always present. */}
 }
 function petCard(pet,summary=false){
  const card=el("article","lw-hub-pet-card");
  const portrait=el("canvas","lw-hub-pet-art");portrait.width=160;portrait.height=160;
  portrait.setAttribute("role","img");
  portrait.setAttribute("aria-label",(lang()==="en"?"Portrait: ":"Портрет: ")+pet.name);
  paintPortrait(portrait,pet);
  const info=el("div","lw-hub-pet-info");
  info.append(el("h3",null,(pet.icon||"🐾")+" "+pet.name),
   paragraph(tr("species")+": "+pet.speciesName+" · "+tr("level")+" "+pet.level),
   paragraph(tr("age")+": "+pet.ageDays+" "+tr("days")+" · "+tr("generation")+" "+pet.generation),
   paragraph(tr("home")+": "+(pet.home||"—")));
  if(!summary){
   if(pet.mood)info.append(paragraph(tr("mood")+": "+pet.mood));
   info.append(paragraph(tr("skills")+": "+pet.trained));
   if(Array.isArray(pet.lineageNames)&&pet.lineageNames.length)
    info.append(paragraph(tr("lineage")+": "+pet.lineageNames.join(" › ")));
   if(pet.homeId)info.append(action(tr("openHome"),pet.homeId,"home"));
  }else{
   const see=button("📜","petCard","petDetail",tr("natal"),tr("preview"));
   see.dataset.petId=pet.id;info.append(see);
  }
  card.append(portrait,info);return card;
 }
 function renderPets(body){
  const list=Array.isArray(world?.petProfiles)?world.petProfiles:[];
  if(view==="petCard"){
   const pet=list.find(p=>p.id===selectedPet);
   if(!pet){body.append(paragraph(tr("noPets")));return;}
   body.append(petCard(pet));
   return;
  }
  if(!list.length){body.append(paragraph(tr("noPets")));return;}
  petIndex=Math.min(Math.max(0,petIndex),Math.floor((list.length-1)/12));
  const start=petIndex*12;const area=el("div","lw-hub-pet-list");
  for(const pet of list.slice(start,start+12))area.append(petCard(pet,true));
  body.append(area);
  if(list.length>12){
   const pag=el("div","lw-hub-page-arrows");
   if(petIndex>0)pag.append(action(tr("previous"),"prev","pagination"));
   pag.append(el("span",null,(start+1)+"–"+Math.min(list.length,start+12)+" "+tr("oneOf")+" "+list.length));
   if(start+12<list.length)pag.append(action(tr("next"),"next","pagination"));
   body.append(pag);
  }
 }
 function renderHomes(body){
  const homes=Array.isArray(world?.homes)?world.homes:[];
  if(!homes.length){body.append(paragraph(tr("noHomes")));return;}
  for(const home of homes){
   const card=el("article","lw-hub-home-card");
   card.append(el("h3",null,"🏡 "+home.name),
     paragraph((home.biome||"")+" · "+home.occupied+"/"+home.capacity+
       " · "+(lang()==="en"?"Quality ":"Квалитет ")+home.quality+"%"),
     paragraph((home.pets||[]).length?
       home.pets.map(p=>"🐾 "+p.name).join(" · "):tr("noPets")),
     paragraph(tr("houseFuture")),
     action(tr("openHome"),home.id,"home"));
   body.append(card);
  }
 }
 function renderToyCatalog(body){
  body.append(paragraph(tr("toysHelp")),paragraph(tr("moneyHelp")));
  for(const toy of (world?.toyCatalog||[])){
   const title=(toy.icon||"🧸")+" "+toy.name;
   const label=toy.unlocked?tr("owned"):toy.cost===0?tr("free"):tr("cost")+": ◈ "+toy.cost;
   const card=el("article","lw-hub-home-card");
   card.append(el("h3",null,title),paragraph(label));
   if(!toy.unlocked)card.append(paragraph(tr("locked")));
   body.append(card);
  }
  body.append(action(tr("openExisting")+": "+tr("playground"),"playground"));
 }
 function build(){
  if(!panel)return;
  const header=el("div","lw-hub-head");
  const title=el("div");
  title.append(el("small","lw-hub-breadcrumb",tr("mainLink")+" / "+tr(view==="petCard"?"pets":view)));
  title.append(el("h2",null,"✺ "+(view==="petCard"?tr("natal"):tr(view))));
  header.append(title);
  const controls=el("div","lw-hub-head-actions");
  if(view!=="hub")controls.append(action(tr("back"),"back","back"));
  const close=el("button","lw-hub-close",tr("close"));close.type="button";
  close.dataset.hubTarget="close";close.dataset.hubKind="close";controls.append(close);
  header.append(controls);
  const body=el("div","lw-hub-body");
  if(view==="hub"){body.append(paragraph(tr("hubHelp")),cards(main));}
  else if(view==="pets"||view==="petCard")renderPets(body);
  else if(view==="homes")renderHomes(body);
  else if(view==="social"){body.append(paragraph(tr("socialHelp")),cards(social));}
  else if(view==="market"){body.append(paragraph(tr("moneyHelp")),cards(market));}
  else if(view==="toys")renderToyCatalog(body);
  else if(view==="more"){body.append(paragraph(tr("classicHint")),cards(more));}
  else if(view==="messagesHud"){body.append(paragraph(tr("messageHelp")),action(tr("openExisting")+": "+tr("messagesHud"),"messages"));}
  else if(view==="friendsHud"){body.append(paragraph(tr("friendHelp")),action(tr("openExisting")+": "+tr("friendsHud"),"friends"));}
  else if(view==="world"){body.append(paragraph(tr("worldFuture")),cards([["🏡","homes","page"],["🎠","playground","classic"],["🌳","shared","classic"]]));}
  else if(view==="nursery"){body.append(paragraph(tr("nurseryFuture")),action(tr("existingHome"),"habitats"));}
  else if(view==="garden"){body.append(paragraph(tr("gardenFuture")),action(tr("agroEntry"),"agroLobby","scene"),action(tr("openExisting")+": "+tr("flora"),"plants"));}
  else if(view==="boutique"){body.append(paragraph(tr("fashionFuture")));}
  else if(view==="furniture"){body.append(paragraph(tr("furnitureFuture")),cards([["🏡","homes","page"]]));}
  else if(view.endsWith("Hud")){
   const classic={playgamesHud:"playgames",achievementsHud:"achievements",
    diaryHud:"diary",notificationsHud:"notifications",settingsHud:"settings",moreClassicHud:"more"}[view];
   body.append(paragraph(tr("classicHint")),action(tr("openExisting")+": "+tr(view),classic));
  }else body.append(paragraph(tr("later")));
  panel.replaceChildren(header,body);
 }
 function close(){
  if(!panel)return;
  isOpen=false;panel.hidden=true;history=[];selectedPet=null;
 }
 function open(page="hub"){
  if(!panel||!pages.has(page))return false;
  if(!isOpen){history=[];selectedPet=null;}
  else if(view!==page)history.push(view);
  view=page;isOpen=true;panel.hidden=false;build();
  return true;
 }
 function goBack(){
  if(!isOpen)return;
  if(!history.length){if(view==="hub")close();else{view="hub";build();}return;}
  view=history.pop();build();
 }
 function route(key,kind){
  if(kind==="back"){goBack();return;}
  if(kind==="close"){close();return;}
  if(kind==="pagination"){
   petIndex+=key==="next"?1:-1;build();return;
  }
  if(kind==="petDetail"){
   selectedPet=key;open("petCard");return;
  }
  if(kind==="page"){if(key==="pets")petIndex=0;open(key);return;}
  if(kind==="scene"){
   // Explicit whitelist: open the registered read-only GLB scene in this 3D
   // world, never run a Classic game action or change permanent world state.
   if(key!=="agroLobby")return;
   close();
   root.dispatchEvent(new root.CustomEvent("trialum:lw:agro-lobby",
    {detail:{sceneId:"trialum.ground.agro.lobby",from:"hub"}}));
   return;
  }
  if(kind==="room"){
   const room=resolveRoom(key);if(!room)return;
   close();
   root.dispatchEvent(new root.CustomEvent("trialum:lw:complex-room",{detail:{room}}));
   return;
  }
  if(kind==="home"){openHome(key);return;}
  if(kind==="classic"){
   const allowed=["habitats","pets","plants","research","food","playground","shared",
    "friends","messages","playgames","achievements","diary","notifications","settings","more"];
   if(!allowed.includes(key))return;
   close();
   root.parent.postMessage({type:"trialum:lw:classic",tab:key},root.location.origin);
  }
 }
 if(active){
  panel.id="lw-hub-page";panel.hidden=true;panel.setAttribute("role","dialog");
  panel.setAttribute("aria-modal","false");
  panel.setAttribute("aria-label",dictionary.mk.hub);
  root.document.getElementById("frame")?.append(panel);
  panel.addEventListener("click",event=>{
   const b=event.target?.closest?.("button[data-hub-target]");if(!b)return;
   const kind=b.dataset.hubKind,key=kind==="petDetail"?b.dataset.petId:b.dataset.hubTarget;
   route(key,kind);
  });
  root.addEventListener("trialum:lw:hud-route",e=>{
   if(e.detail?.page)open(e.detail.page);
  });
  root.addEventListener("trialum:lw:complex-room-changed",()=>{if(isOpen)close();});
  root.addEventListener("keydown",e=>{
   if(!isOpen||e.key!=="Escape")return;
   e.preventDefault();goBack();
  });
  root.addEventListener("message",e=>{
   if(e.origin!==root.location.origin||e.source!==root.parent)return;
   if(e.data?.type==="trialum:lw:hud-nav"){
    if(["hub","social"].includes(e.data.page))open(e.data.page);
    return;
   }
   if(e.data?.type==="trialum:lw:visibility"&&e.data.visible===false){close();return;}
   if(e.data?.type!=="trialum:lw:state"||!e.data.world)return;
   world=e.data.world;
   panel.setAttribute("aria-label",tr("hub"));
   if(isOpen)build();
  });
 }
 return Object.freeze({main,social,market,more,dictionary,pages,resolveRoom,open,close,route,
  state:()=>({view,isOpen,petIndex,selectedPet})});
});