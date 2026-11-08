/* TRIALUM 1.4 UI: every feature clearly explains its unlock criteria. */
(function(root){
'use strict';
const E=root.TrialumEngine,previous=root.TrialumExpansion;
const esc=x=>String(x??'').replace(/[&<>"']/g,a=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[a]));
const b=(text,act,attr='',disabled=false)=>'<button data-do="'+act+'" '+attr+(disabled?' disabled':'')+'>'+text+'</button>';
const fmt=x=>Math.floor(Number(x)||0).toLocaleString('mk-MK');
const crit=(items)=>'<div class="unlock-checks">'+items.map(k=>'<div class="goal '+(k.ok?'done':'')+'"><span>'+(k.ok?'✓':'🔒')+' '+esc(k.label)+'</span><small>'+esc(k.value)+'</small></div>').join('')+'</div>';
const lock=(conditions)=>'<div class="lock-hint">🔒 '+esc(conditions)+'</div>';
function catalog(s){
 const stage=s.stage,hab=E.currentHabitat(s);
 const animals=E.SPECIES.map((p,i)=>{
 const g=E.longplayRequirements(s,i),isAdvanced=i>=4,ready=g.ok,
 pet=s.pets.find(x=>x.species===g.source?.species&&g.source&&x.id===g.source.id);
 const stats=isAdvanced?'🧬 ДНК-трансформација':'⚗️ Создавање од основни компоненти';
 const requirements=g.items.filter(x=>!x.ok),existing=s.pets.some(x=>x.species===i);
 return '<div class="card species-card '+(ready?'':'locked-card')+'"><div class="mini-row"><h3>'+p.icon+' '+esc(p.name)+'</h3><span class="pill">'+(ready?'✓ УСЛОВИ ИСПОЛНЕТИ':'🔒 ЗАКЛУЧЕНО')+'</span></div>'+
 '<p>'+esc(p.description||g.description)+'</p><p class="price">'+stats+' · Лаб '+g.lab+'</p>'+
 '<p class="small">'+(i>=4?'Израснато претходно милениче го наследува идентитетот, меморијата и искуството.':'Нов вид во соодветно живеалиште.')+'</p>'+
 crit(g.items)+
 (isAdvanced?b('🧬 Преобрази избрано милениче','transformDNA','data-species="'+i+'"',!ready||!g.source):
 b('🐣 Создај '+esc(p.name),'createPet','data-species="'+i+'"',!ready||!hab||hab.biome!==g.items.find(x=>x.label==='Соодветно живеалиште')?.value?.split(' ')[0]))+
 '</div>';
 }).join('');
 const gate=E.longplayStageGate(s),req=E.PHASE_REQ[s.stage],need=req?
 'Наредна фаза: '+esc(E.PHASES[s.stage+1])+'. Време: '+(gate.ready?'✓ поминато':Math.ceil((gate.requiredMs-gate.elapsedMs)/60000)+' мин. преостанати')+
 ' · Сознание '+s.insight+'/'+req.insight+' · Молекули '+s.compounds+'/'+req.compounds+
 (req.cells?' · Клетки '+s.cells+'/'+req.cells:''):'Сите први еволутивни фази се отклучени.';
 return '<div class="tab-main"><h2>⚗️ Жива лабораторија</h2>'+
 '<p class="desc">Стартот до првите клетки трае минути, потоа времето и потребните услови постепено растат. Дневните лабораториски акции се обновуваат и со локално поминување на време.</p>'+
 '<div class="notice">'+need+'</div>'+
 '<div class="btn-line">'+[['synthesize','⚛️ Синтеза'],['analyze','🔬 Анализа'],['harvest','🪨 Суровини'],['grow','🧫 Размножи клетки']].map(([id,label])=>b(label,'lab','data-kind="'+id+'"',s.labActions<1||(id==='grow'&&stage<2))).join('')+
 b('✨ Следна фаза','evolve','class="primary"',s.stage>=7||!gate.ready)+'</div>'+
 '<p class="small">Лабораториски акции: '+s.labActions+'/'+E.labActionLimit(s)+' · Прва еволуција најрано во 4-та минута; први клетки по 11-та минута ако се собрани ресурсите.</p>'+
 '<h3>🐾 Каталог — 11 постепени видови</h3><p class="desc">Секој вид ги покажува сите предуслови. Од Синапсо нагоре миленичиња не се произведуваат од нула; само зрели претходни форми минуваат низ ДНК-трансформација.</p>'+
 '<div class="cards">'+animals+'</div></div>';
}
function research(s){
 const r=E.ensureResearch(s),tier=E.longplayTier(r.level+1),req=E.labRequirements(s,tier.level);
 const field=E.researchFields.map(f=>'<div class="card"><h3>'+f.icon+' '+esc(f.name)+'</h3><p>Знаење: '+fmt(r.fields[f.id])+'</p>'+b('🔬 Истражувај','study','data-field="'+f.id+'"',s.labActions<1)+'</div>').join('');
 const general=E.longplayMaterials.map(m=>{
 const yes=!!s.longplay.materials[m.id];
 return '<div class="card '+(yes?'':'locked-card')+'"><h3>🪨 '+esc(m.name)+'</h3><p>Лаб '+m.lab+' · Знаење '+m.knowledge+' · '+esc(m.field)+' '+m.fieldPoints+'</p>'+
 (yes?'<p>Резерва: '+(s.longplay.materials[m.id]||0)+'</p>'+b('⚗️ Произведи +2','longCraftMaterial','data-material="'+m.id+'"',s.labActions<1):
 lock('Откриј преку „Нови материјали“ по исполнување на предусловите.'))+'</div>';
 }).join('');
 return '<div class="tab-main"><h2>🏛️ Истражувања · Лабораторија '+r.level+'</h2>'+
 '<p class="desc">Лабораториите продолжуваат со нови нивоа и по завршувањето на основната кампања. Нема финална победа.</p>'+
 '<div class="notice">Знаење: '+fmt(r.knowledge)+' · '+s.labActions+'/'+E.labActionLimit(s)+' акции · '+s.longplay.credits+' бесплатни истражувачки кредити.</div>'+
 '<h3>Научни области</h3><div class="cards">'+field+'</div>'+
 '<h3>⬆ Нареден технолошки центар</h3><div class="notice">'+esc(tier.name)+' · Ниво '+tier.level+'</div>'+crit(req.items)+b('⬆ Надгради лабораторија','upgradeLab','class="primary"',!req.ok||s.labActions<1)+
 '<h3>✨ Откривај нов жив и нежив свет</h3><p class="desc">Секоја успешна експедиција отвора нова виртуелна формула, ново растение или материјал за биосветови.</p>'+
 '<div class="btn-line">'+b('🥣 Нова храна','longInvent','data-kind="food"',r.level<2)+b('🌿 Нова флора','longInvent','data-kind="flora"',r.level<2)+b('🪨 Нов материјал','longInvent','data-kind="material"',r.level<2)+'</div>'+
 '<h3>Истражувачки материјали</h3><div class="cards">'+general+'</div>'+
 '<h3>Последни откритија ('+s.longplay.invented.length+')</h3>'+
 (s.longplay.invented.length?s.longplay.invented.slice(-12).reverse().map(x=>'<div class="friend-item">✨ '+esc(x.name)+' · '+esc(x.kind)+' · ден '+fmt(x.day)+'</div>').join(''):'<p>Нема регистрирани изуми. Истражувај за да создадеш прва формула.</p>')+'</div>';
}
function habitat(s){
 const prior=previous.render('habitats',s),h=E.currentHabitat(s);
 const upgrades=E.longplayTech.map(t=>{
 const material=E.longplayMaterials.find(m=>m.id===t.material),available=s.research.level>=t.lab&&(s.longplay.materials[t.material]||0)>0;
 return '<div class="card '+(available?'':'locked-card')+'"><h3>'+esc(t.title)+'</h3><p>Потребно: лабораторија '+t.lab+' и '+esc(material.name)+'.</p>'+
 '<p>Резерва: '+(s.longplay.materials[t.material]||0)+' · Цена: 10 сознание и 1 акција.</p>'+
 b('🏗️ Надгради','longHabUpgrade','data-upgrade="'+t.id+'"',!available||!h||h.dayActions<1)+'</div>';
 }).join('');
 return prior.replace('</div></div></div>', '</div></div></div>')+
 '<div class="tab-main"><h3>🧱 Истражувачки проширувања</h3><p>Капацитет на сегашниот биосвет: '+(h?h.capacity:'—')+' · Места за флора: '+(h?h.floraSlots:'—')+'. Не се купуваат преку пари — се градат од откриени материјали.</p><div class="cards">'+upgrades+'</div></div>';
}
function food(s){
 const r=E.ensureResearch(s),p=E.currentPet(s),sp=p&&E.SPECIES[p.species];
 return '<div class="tab-main"><h2>🍱 Лабораторија за храна</h2><p class="desc">Формулите и специјализираните хранливи состојки се отклучуваат преку истражување. Фабриката не троши акции на другите миленици.</p><div class="notice">Избран миленик: '+(p?esc(p.name)+' · '+p.actionsLeft+'/'+E.petActionLimit(s):'нема')+'</div><div class="cards">'+E.foodRecipes.map(f=>{
 const unlocked=r.level>=f.tier,stock=s.foodFactory.stock[f.id]||0,good=p&&E.feedCompatible(sp,f,p);
 return '<div class="card '+(unlocked?'':'locked-card')+'"><h3>'+f.icon+' '+esc(f.name)+'</h3>'+
 '<p>'+esc(f.desc)+'</p><p class="price">🔒 Лаб '+f.tier+(f.id.startsWith('research-')?' · прво пронајди преку истражувања':'')+' · '+f.cost.biomass+' биомаса + '+f.cost.compounds+' молекули</p>'+
 '<p>Порции: '+stock+' · '+(good?'✓ Соодветна за избраниот вид':'Специјализирана за друга група')+'</p>'+
 b('⚗️ Произведи','craftFood','data-recipe="'+f.id+'"',!unlocked||s.labActions<1)+
 b('🍽️ Нахрани','feedFood','data-recipe="'+f.id+'"',!good||stock<1||p.actionsLeft<1)+'</div>';
 }).join('')+'</div></div>';
}
function dna(s){
 const p=E.currentPet(s),base=previous.render('dna',s);
 const lineage=E.longplayLineages.filter(x=>x.id>=4).map(x=>{
 const g=E.longplayRequirements(s,x.id),ready=g.ok&&p?.species===x.source;
 return '<div class="card '+(ready?'':'locked-card')+'"><h3>🧬 '+esc(E.SPECIES[x.id].name)+'</h3><p>'+esc(x.description)+'</p>'+crit(g.items)+
 b('🧬 Преобрази го избраниот миленик','transformDNA','data-species="'+x.id+'"',!ready)+'</div>';
 }).join('');
 return base+'<div class="tab-main"><h3>🧬 Вистински еволутивни линии (само виртуелни)</h3><p class="desc">Овие суштества не се создаваат од нула. Трансформирај го зрелиот претходен вид, со задржување на меморијата, возраста, тренинзите и историјата.</p><div class="cards">'+lineage+'</div></div>';
}
function pets(s){
 const p=E.currentPet(s),skill=[
 ['wave','👋 Мавтање',3,1],['spin','🌀 Вртење',8,3],['leap','🐾 Скокање',15,4],
 ['symbols','🔤 Знаци',22,6],['logic','🧩 Логика',35,8],['dialogue','💬 Дијалог',50,10]];
 const lv=p?E.evolutionProgress(p).level:0,r=s.research.level;
 const training=skill.map(([id,label,level,lab])=>'<div class="card '+(p&&lv>=level&&r>=lab?'':'locked-card')+'"><h3>'+label+'</h3><p>🔒 Миленик ниво '+level+' и лабораторија '+lab+' · научено '+(p?.skills?.[id]||0)+'</p>'+b('🎓 Тренирај','longTrain','data-skill="'+id+'"',!p||lv<level||r<lab||p.actionsLeft<1)+'</div>').join('');
 const list=s.pets.map(q=>'<button data-do="selectPet" data-id="'+esc(q.id)+'" class="pet-option '+(s.selectedPet===q.id?'active':'')+'"><span class="emoji">'+E.SPECIES[q.species].icon+'</span><span><b>'+esc(q.name)+'</b><small>'+
 esc(E.SPECIES[q.species].name)+' · ниво '+E.evolutionProgress(q).level+' · '+q.actionsLeft+'/'+E.petActionLimit(s)+' акции · '+(q.lineage?.length||1)+' генерации</small></span></button>').join('');
 return '<div class="tab-main"><h2>🐾 Миленици · независна еволуција</h2><p class="desc">Секое милениче има свои акции, меморија, нивоа, трансформации и тренинзи.</p><div class="pet-list">'+(list||'<p>Прво одгледај ќелија и изгради живеалиште.</p>')+'</div><h3>🎓 Обука за избраниот миленик</h3><p class="desc">Вештините се отклучуваат постепено — поради сè потешките епохи, високите тренинзи бараат месеци развој.</p><div class="cards">'+training+'</div>'+
 (p?'<div class="notice">Реален локален LLM: '+(E.longplayLLM.isAvailable()?'✓ подготвен':'🔒 Не е инсталиран')+'. Симулациските разговори работат офлајн; вистински модел ќе се додаде посебно, по тест на Android уред.</div>':'')+
 '<h3>🚚 Преселба меѓу биосветови</h3><div class="btn-line">'+s.habitats.map(h=>b('↔ '+esc(h.name),'transfer','data-id="'+esc(h.id)+'"',!p||p.habitatId===h.id)).join('')+'</div>'+
 b('✏️ Преименувај','renamePet','',!p)+'</div>';
}
function settings(s){
 return '<div class="tab-main"><h2>⚙️ Светот и поставки</h2><p class="desc">Само тука се резервните копии, увозот, звукот и бришењето на светот.</p>'+
 '<div class="settingrow"><label for="volume">Јачина на звук</label><input id="volume" type="range" min="0" max="100" value="'+Math.round(s.settings.volume*100)+'"></div>'+
 '<div class="btn-line">'+b('💾 JSON резервна копија','export','class="primary"')+b('📂 Увези JSON','import')+b('🔔 Известувања','notification')+'</div>'+
 '<p class="small">Android ја користи системската апликација „Датотеки“ за увоз/зачувување. Не се потребни дозволи за целата меморија.</p>'+
 '<div class="notice">Статус: <span id="saveStatus">Локално автоматско зачувување</span></div>'+
 '<h3>💠 Бесплатни истражувачки кредити</h3><p>Стекнати со играње: '+fmt(s.longplay.earned)+' · Расположиви: '+fmt(s.longplay.credits)+'.</p>'+
 '<div class="btn-line">'+b('⚡ Освежи лабораторија · 12','longBoost','data-boost="lab"')+b('🐾 Освежи миленик · 8','longBoost','data-boost="pet"')+b('🏝 Освежи живеалиште · 8','longBoost','data-boost="habitat"')+'</div>'+
 '<p class="small">Плаќањата и платените токени се исклучени. Нема купување, нема реклама и нема серверска проверка на трансакции.</p>'+
 '<h3>⚠️ Управување со светот</h3>'+b('↻ Нов свет — бриши напредок','newGame','class="danger"')+'</div>';
}
function notifications(s){
 const al=E.alerts(s);
 return '<div class="tab-main"><h2>🔔 Известувања</h2><p>Android известувањата работат со системска дозвола, звучен канал и badge број што зависи од поддршката на launcher-от.</p>'+
 b('🔔 Побарај Android дозвола','notification','class="primary"')+
 '<h3>Моментални сигнали ('+al.length+')</h3>'+
 (al.length?al.map(x=>'<div class="alert">⚠ '+esc(x.text)+'</div>').join(''):'<div class="allgood">✓ Нема критични потреби.</div>')+
 '<p class="small">Android периодично ги проверува информациите преку WorkManager. Доцнења се можни поради батеријата.</p></div>';
}
const views={lab:catalog,research,habitats:habitat,food,dna,pets,settings,notifications};
const actions=new Set(['longInvent','longCraftMaterial','longHabUpgrade','longTrain','transformDNA','longBoost']);
root.TrialumExpansion={
 render(page,s){if(!s)return '';E.ensureLongplay(s);if(views[page])return views[page](s);return previous.render(page,s);},
 can(action){return actions.has(action)||previous.can(action);},
 handle(action,b,s,ctx){
 if(!actions.has(action))return previous.handle(action,b,s,ctx);
 let result=null;
 switch(action){
 case 'longInvent':result=E.longplayInvent(s,b.dataset.kind);break;
 case 'longCraftMaterial':result=E.longplayBuildMaterial(s,b.dataset.material);break;
 case 'longHabUpgrade':result=E.longplayUpgradeHabitat(s,b.dataset.upgrade);break;
 case 'longTrain':result=E.longplayTrain(s,s.selectedPet,b.dataset.skill);break;
 case 'transformDNA':result=E.longplayTransform(s,s.selectedPet,Number(b.dataset.species));break;
 case 'longBoost':result=E.longplayBoost(s,b.dataset.boost,s.selectedPet);break;
 }
 ctx.notice(result,'grow');
 }
};
})(typeof globalThis!=='undefined'?globalThis:this);
