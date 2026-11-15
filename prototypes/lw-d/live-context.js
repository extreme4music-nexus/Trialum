/* LW-D D1 contextual HUD, connected to existing deterministic game world.
 * No second persistent state, no AI, no networking beyond trusted parent iframe.
 */
(function(root){
"use strict";
if(new URLSearchParams(root.location.search).get("live")!=="1"||root.parent===root)return;
const origin=root.location.origin;
let basicPending=false; // one original Basic engine action at a time; no double-spend on rapid taps.
let world=null,resultText="",selectedStation=null,selectedDnaStation=null,selectedFoodStation=null,selectedFoodRecipe=null,selectedFloraStation=null,selectedFloraModel=null,complexRoom=root.TrialumLabComplex?.INITIAL_VIEW||"hub";
let dnaDraft=null,dnaDraftPetKey="",dnaTarget=null,dnaPending=false,dnaFeedback="",dnaConfirm=null,dnaPetPending=false;
let selectedResearchStation=null,researchSelectedField="molecules",researchSelectedInvent="food",researchSelectedMaterial=null,
 researchPending=false,researchConfirm=null,researchFeedback="";
let foodPending=false,foodConfirm=null,foodFeedback="",foodPickerOpen=false;
let floraPending=false,floraConfirm=null,floraFeedback="";
const WORKSTATIONS=[
 {id:"synthesis",label:"⚗️ Синтеза",title:"Реактор за молекули",description:"Синтетизирај молекули преку постојната лабораториска логика.",kind:"synthesize",command:"✦ Синтеза на молекули"},
 {id:"analysis",label:"🔬 Анализа",title:"Аналитички пулт",description:"Набљудувај и добивај сознанија преку вистинската прогресија.",kind:"analyze",command:"🔬 Анализа и сознание"},
 {id:"materials",label:"🪨 Материјали",title:"Складиште со материјали",description:"Прегледувај и собирај материјали од постојните резерви.",kind:"harvest",command:"🪨 Собери материјали"},
 {id:"incubation",label:"🧫 Инкубатор",title:"Станица за раст на клетки",description:"Поттикни раст само кога е исполнета потребната етапа.",kind:"grow",command:"🧫 Размножи клетки"}
];

const EN={"⚗️ Лабораторија":"⚗️ Laboratory","🌿 Флора":"🌿 Flora","🪐 Биосвет":"🪐 Living habitat","🔬 Истражување":"🔬 Research","Вистинските лабораториски акции го ажурираат постојниот зачуван свет.":"Real laboratory actions update your existing saved world.","Одгледувај и истражувај ги растенијата во избраниот биосвет.":"Grow and study plants in your selected habitat.","Следи ги миленичињата, капацитетот и условите на живеалиштето.":"Monitor pets, capacity, and habitat conditions.","Отклучувај сознанија преку реалната прогресија на Trialum.":"Unlock knowledge through Trialum's existing progression.","Лаб. акции":"Lab actions","Клетки":"Cells","Миленичиња":"Pets","Капацитет":"Capacity","Зафатено":"Occupied","Етапа":"Stage","Биосвет: ":"Habitat: ","✦ Синтеза на молекули":"✦ Synthesize molecules","🔬 Анализа и сознание":"🔬 Analyze and learn","🪨 Собери материјали":"🪨 Collect materials","🧫 Размножи клетки":"🧫 Grow cells","🌱 Отвори флора":"🌱 Open flora","🏠 Отвори живеалишта":"🏠 Open habitats","📚 Отвори истражувања":"📚 Open research","Отвори истражувања":"Open research","РЕАЛНА СОСТОЈБА":"REAL WORLD STATE","✦ Жив Свет · 3D":"✦ Living World · 3D","← Класичен приказ":"← Classic view","Пробна landscape-верзија. Постојниот свет и бекап остануваат зачувани.":"Landscape preview. Your existing world and backups stay preserved."};
Object.assign(EN,{"Други 3D простори":"Other 3D spaces","Главно лоби за целиот Жив Свет":"Central lobby for the Living World","🗺️ Мапа и сите функции":"🗺️ World Atlas & all features","Постојните 3D сцени се пробни; домовите подоцна ќе бидат дел од посебен град.":"Existing 3D scenes are previews; homes will later belong to a separate town."});
Object.assign(EN,{"⚗️ Синтеза":"⚗️ Synthesis","🔬 Анализа":"🔬 Analysis","🪨 Материјали":"🪨 Materials","🧫 Инкубатор":"🧫 Incubator","Реактор за молекули":"Molecular reactor","Аналитички пулт":"Analysis station","Складиште со материјали":"Materials storage","Станица за раст на клетки":"Cell-growth incubator","Синтетизирај молекули преку постојната лабораториска логика.":"Synthesize molecules using the existing laboratory rules.","Набљудувај и добивај сознанија преку вистинската прогресија.":"Observe and earn insight through real progression.","Прегледувај и собирај материјали од постојните резерви.":"Inspect and gather materials from your real resource inventory.","Поттикни раст само кога е исполнета потребната етапа.":"Grow cells only after reaching the required stage.","Избери работна станица":"Choose a workstation","Допрете станица во 3D просторијата или избери ја овде.":"Tap a station in the 3D room, or choose it here.","↩ Цела лабораторија":"↩ Whole laboratory","Работни станици":"Workstations","Недостапно во сегашната етапа":"Not available at your current stage"});
Object.assign(EN,{"Синтетизирани се молекули и добиено е знаење.":"Molecules synthesized and new insight gained.","Нови истражувачки поени.":"New research insight gained.","Додадени се хемиски резерви.":"Chemical supplies replenished.","Клеточната популација расте.":"The cell population is growing.","Нема лабораториски акции денес.":"No laboratory actions remaining today.","Недостигаат суровини за синтеза.":"Not enough raw materials for synthesis.","Недоволно енергија.":"Not enough energy.","Прво создади протоклетка.":"Create a protocell first.","Потребни се 5 органски единици.":"Five organic units are required.","Непозната лабораториска акција.":"Unknown laboratory action.","Недозволена лабораториска команда.":"Laboratory command not allowed.","Молекули":"Molecules","Сознание":"Insight","Биомаса":"Biomass","Квалитет":"Quality","ДЕН":"DAY","Лаб. акции":"Lab actions"});
Object.assign(EN,{"Прикажи го холограмскиот HUD":"Show holographic HUD","Сокриј го холограмскиот HUD":"Hide holographic HUD","← Излези од 3D":"← Exit 3D view","Холограмски панел":"Holographic panel"});
Object.assign(EN,{"🏛️ Лабораториски комплекс":"🏛️ Laboratory complex","Лабораториски комплекс":"Laboratory complex","Избери простор во ходникот со допир или со копчињата.":"Tap an entrance in the hall, or choose a room below.","Пет простории, една лабораториска целина.":"Five rooms, one connected laboratory complex.","⚗️ Основна лабораторија":"⚗️ Basic laboratory","🧬 ДНК лабораторија":"🧬 DNA laboratory","🧪 Лабораторија за храна":"🧪 Food production laboratory","🌱 Лабораторија за флора":"🌱 Flora laboratory","🔬 Истражувачка лабораторија":"🔬 Research laboratory","↩ Врати се во основната лабораторија":"↩ Return to basic laboratory","Во развој · отвори постојна функција":"In development · open existing screen","3D просторијата е во развој; оригиналниот систем останува достапен.":"This 3D room is being built; the original feature remains accessible."});
Object.assign(EN,{
 "↩ Лабораториски ходник":"↩ Laboratory corridor",
 "🧬 DNA простор · L3.2-A":"🧬 DNA room · L3.2-A",
 "3D комора и станици. ДНК-промените се прават преку постојната функционалност.":"3D chamber and stations. DNA changes use the existing game feature.",
 "DNA станици":"DNA stations",
 "🔬 Геномски скенер":"🔬 Genome scanner",
 "🎨 Дизајнер на гени":"🎨 Gene designer",
 "🌱 Еволутивна линија":"🌱 Evolution lineage",
 "Преглед на постојните ресурси, без промени.":"Inspect existing resources without changes.",
 "Дизајнирај само преку постојната ДНК логика.":"Design using the existing DNA system only.",
 "Трансформирај постоечки миленик преку оригиналниот систем.":"Transform an existing pet through the original system.",
 "🧬 Отвори ДНК контроли":"🧬 Open original DNA controls",
 "🔒 За дизајнер треба лаб. ниво 6 и миленик ниво 22.":"🔒 Designer needs lab level 6 and a level 22 pet.",
 "✅ ДНК дизајнерот е достапен.":"✅ DNA designer is available.",
 "Миленик ниво":"Pet level",
 "Лабораторија ниво":"Lab level",
 "Визуелна 3D симулација — нема нови генетски акции.":"Visual 3D simulation — no new genetic actions."
});
Object.assign(EN,{
 "🧬 ДНК лабораторија · L3.2-B":"🧬 DNA Laboratory · L3.2-B",
 "Скенирај го избраниот миленик, уреди фантастични гени или провери еволутивна линија.":"Scan your pet, edit fictional genes, or review a lineage.",
 "Избери една од трите 3D станици.":"Choose one of the three 3D stations.",
 "Миленик":"Pet",
 "Нема избрано милениче":"No pet selected",
 "Генетски потпис":"Genome signature",
 "Боја":"Color",
 "Очи":"Eyes",
 "Облик":"Shape",
 "Течна":"Fluid",
 "Кристална":"Crystal",
 "Лисна":"Leaf",
 "Облачна":"Cloud",
 "🧬 Примени гени · 25 молекули + 15 сознание + 1 акција":"🧬 Apply genes · 25 molecules + 15 insight + 1 action",
 "Провери ги ресурсите и условите за дизајнот.":"Check resources and designer eligibility.",
 "Целна еволуција":"Evolution target",
 "Изворниот вид не одговара на избраниот миленик.":"Selected pet is not the required source species.",
 "Подготвена линија":"Lineage ready",
 "🔒 Недостапна линија":"🔒 Lineage locked",
 "🧬 Преобрази го избраниот миленик":"🧬 Transform selected pet",
 "Измената е трајна. Да ја потврдам?":"This change is persistent. Confirm?",
 "ДНК трансформацијата го задржува истиот миленик. Да продолжам?":"DNA evolution preserves the same pet. Continue?",
 "ДНК операцијата е во тек…":"DNA operation in progress…",
 "Нема истражени еволутивни линии.":"No researched evolutionary lineages.",
 "ДНК командата е испратена до оригиналниот систем.":"DNA request sent to original game engine.",
 "Оваа станица користи вистински податоци од постојниот свет.":"This station uses real data from the existing world."
});
Object.assign(EN,{
 "🍱 Нутритивна лабораторија · L3.3-A":"🍱 Nutrition Laboratory · L3.3-A",
 "Производство на фантастична храна — поглед во вистинскиот магацин и рецепти.":"Fictional food production — inspect your real inventory and recipes.",
 "🥣 Синтеза на храна":"🥣 Food synthesis",
 "🔬 Анализа на исхрана":"🔬 Nutrition analysis",
 "📦 Складиште на порции":"📦 Portion storage",
 "Рецепти":"Recipes",
 "Залиха":"Stock",
 "Порции":"Portions",
 "Ниво":"Tier",
 "Цена":"Cost",
 "Биомаса":"Biomass",
 "Молекули":"Molecules",
 "Акции":"Actions",
 "Недостапен рецепт":"Recipe locked",
 "Достапен рецепт":"Recipe available",
 "Може да се произведе":"Ready to craft",
 "Недостигаат ресурси или акции":"Needs resources or actions",
 "Погодно за миленикот":"Compatible with selected pet",
 "Некомпатибилно со миленикот":"Not compatible with selected pet",
 "Нема избрано милениче":"No pet selected",
 "Избери станица во просторијата.":"Choose a station in the room.",
 "Ова е преглед. Производството и хранењето остануваат во постојната игра.":"This is a preview. Crafting and feeding remain in the original game.",
 "🍽 Отвори производство и хранење":"🍽 Open food production and feeding",
 "↩ Лабораториски ходник":"↩ Laboratory corridor",
 "Миленик":"Pet"
});
Object.assign(EN,{
 "🍱 Нутритивна лабораторија · L3.3-B":"🍱 Nutrition Laboratory · L3.3-B",
 "Нутритивни рецепти и производство преку вистинскиот систем на Trialum.":"Real Trialum food recipes and production.",
 "Избери рецепт":"Choose a recipe",
 "Затвори избор":"Close recipes",
 "⚗️ Произведи порции":"⚗️ Craft portions",
 "🍽 Нахрани го миленичето":"🍽 Feed selected pet",
 "Потврди производство":"Confirm production",
 "Потврди хранење":"Confirm feeding",
 "Сигурно сакаш да ги потрошиш вистинските ресурси за овој рецепт?":"Spend your actual saved resources to craft this recipe?",
 "Сигурно сакаш да нахраниш избрано милениче со оваа храна?":"Feed the selected pet using one stored portion?",
 "Потврди":"Confirm",
 "Откажи":"Cancel",
 "Операцијата се извршува…":"Operation in progress…",
 "Нема залиха или миленикот нема акции":"No portions or pet actions available",
 "Допрете рецепт; нема системски попап.":"Tap a recipe; no system popup."
});
Object.assign(EN,{
 "🌿 Ботаничка лабораторија · L3.4-A":"🌿 Botanical Laboratory · L3.4-A",
 "Живиот растителен свет од твојот вистински биосвет.":"Living plant life from your actual saved habitat.",
 "🌰 Банка за растителни модели":"🌰 Flora model bank",
 "🔬 Растителен анализатор":"🔬 Plant analyzer",
 "🌱 Комора за раст":"🌱 Growth chamber",
 "Растителни видови":"Plant species",
 "Избран биосвет":"Selected habitat",
 "Не е изграден биосвет":"No habitat built",
 "Кислород":"Oxygen",
 "Растенија":"Plants",
 "Дневни акции":"Daily actions",
 "Ниво на лабораторија":"Laboratory tier",
 "Потребно ниво":"Required tier",
 "Придонес за кислород":"Oxygen contribution",
 "Стапка на раст":"Growth rate",
 "Отклучен растителен модел":"Blueprint unlocked",
 "Неоткриен растителен модел":"Blueprint not discovered",
 "Може да се отклучи":"Available to discover",
 "Потребни се прогресија или ресурси":"Progression or resources needed",
 "Може да се засади":"Ready to plant",
 "Нема слободен простор или материјали":"Needs space or elements",
 "Нема засадени растенија":"No planted specimens",
 "Раст":"Growth",
 "Одбери растителен модел":"Choose a plant model",
 "Ова е вистинска состојба, без посебна симулација.":"This is the real game state, without a parallel simulation.",
 "🌿 Отвори оригинална флора":"🌿 Open original flora controls",
 "Измислувањето и садењето се во оригиналната игра додека ги врзуваме 3D машините.":"Discovering and planting stay in the original game until we bind the 3D machines."
});
Object.assign(EN,{
 "🌿 Ботаничка лабораторија · L3.4-B":"🌿 Botanical Laboratory · L3.4-B",
 "🌱 Отклучи модел · 12 сознание + 7 молекули":"🌱 Discover model · 12 insight + 7 molecules",
 "🌿 Засади · C8 + N5 + P3 + O6 · 1 акција":"🌿 Plant · C8 + N5 + P3 + O6 · 1 action",
 "Потврди отклучување":"Confirm discovery",
 "Потврди садење":"Confirm planting",
 "Да потрошам 12 сознание и 7 молекули за овој растителен модел?":"Spend 12 insight and 7 molecules to discover this model?",
 "Да ги потрошам елементите и една дневна акција за садење во избраниот биосвет?":"Spend elements and one habitat action to plant in the selected habitat?",
 "Избран растителен модел":"Selected plant model",
 "Работата со флора е во тек…":"Flora operation in progress…",
 "Избраниот биосвет или ресурсите се променети.":"Selected habitat or resources changed.",
 "Производството на флора го користи оригиналниот систем на Trialum.":"Flora operations use the original Trialum engine.",
 "Потврди":"Confirm",
 "Откажи":"Cancel"
});
Object.assign(EN,{
 "🧬 ДНК-архитектура · целосен приказ":"🧬 DNA Architecture · Complete Catalog",
 "Оригиналните генетски правила, сите линии и истите миленици од зачуваниот свет.":"Original gene rules, all lineages and the same pets from your saved world.",
 "🐾 Избери миленик":"🐾 Select pet",
 "Тековен миленик":"Current pet",
 "Нема миленици за избор":"No pets available",
 "Акции":"Actions",
 "Генерации":"Generations",
 "Возраст":"Age",
 "Дена":"Days",
 "Мемории":"Memories",
 "Тренинзи":"Training sessions",
 "Вид":"Species",
 "Живеалиште":"Habitat",
 "Еволутивна историја":"Evolution history",
 "Нема зачуван геном":"No saved genome",
 "Примерокот не се менува со скенирање.":"Scanning does not change the specimen.",
 "Сите еволутивни линии":"All evolutionary lineages",
 "Избор на цел":"Choose transformation target",
 "Потребен извор":"Required source",
 "Услови исполнети":"Requirements met",
 "Недостасуваат услови":"Requirements not met",
 "Услови за отклучување":"Unlock requirements",
 "Состојба на ресурси":"Available resources",
 "Целна средина":"Target environment",
 "Квалитет на биосвет":"Habitat quality",
 "Недостига соодветен биосвет или капацитет":"Matching habitat or capacity missing",
 "Соодветен биосвет и капацитет":"Matching habitat and capacity available",
 "Недостигаат ресурси или акција":"Resources or lab action missing",
 "Ресурсите се доволни":"Resources available",
 "Цена за трансформација":"Transformation cost",
 "Оваа трансформација го задржува истиот миленик, возраста, меморијата и историјата.":"This transformation preserves the same pet, age, memory and history.",
 "Промени на гени":"Gene modifications",
 "Избери форма":"Choose body shape",
 "Врати го тековниот изглед":"Restore current appearance",
 "Преглед на боја":"Color preview",
 "Потврди го геномот":"Confirm genome edit",
 "Потврди трансформација":"Confirm transformation",
 "Да ги потрошам ресурсите за трајна измена на избраниот миленик?":"Spend resources to permanently edit the selected pet?",
 "Да го преобразам избраниот миленик и да ја задржам неговата меморија?":"Transform the selected pet while preserving its memory?",
 "Избран миленик":"Selected pet",
 "Избрана линија":"Selected lineage",
 "Откажи":"Cancel",
 "Потврди":"Confirm",
 "Течна":"Fluid",
 "Кристална":"Crystal",
 "Лисна":"Leaf",
 "Облачна":"Cloud",
 "Лабораторија":"Laboratory",
 "Еволутивна фаза":"Evolutionary stage",
 "Истражувања genomics":"Genomics research",
 "Истражувања cognition":"Cognition research",
 "Период на развој":"Development period",
 "Соодветно живеалиште":"Matching habitat",
 "ДНК центар":"DNA center",
 "Когнитивно знаење":"Cognitive knowledge",
 "Геномско знаење":"Genomic knowledge",
 "Изминати денови":"Elapsed days",
 "Ниво на изворниот миленик":"Source pet level",
 "ДНК-трансформација на зрел Флорикс; НЕ создавање од нула.":"DNA transformation of mature Florix; NOT creation from scratch.",
 "ДНК-трансформација на Синапсо ниво 35.":"DNA transformation of Synapso level 35.",
 "ДНК-трансформација на Тералин ниво 50.":"DNA transformation of Teralin level 50.",
 "ДНК-трансформација на Орбивокс ниво 75.":"DNA transformation of Orbivox level 75.",
 "Специјализирана DNA линија од Ноетриум ниво 100.":"Specialized DNA lineage from Noetrium level 100.",
 "Напредна форма со долгогодишна еволуција.":"Advanced long-term evolutionary form.",
 "Долгогодишна специјализирана генетска форма.":"Long-term specialized genetic form.",
 "Истражена уникатна фауна, без генерирање од нула.":"Discovered original fauna, never generated from scratch.",
 "Ниво":"Level"
});
Object.assign(EN,{
 "🔬 Истражувачка лабораторија · L3.5":"🔬 Research Laboratory · L3.5",
 "Сите пет врати се функционални. Оригиналниот свет ги контролира откритијата.":"All five rooms work. The original game world controls discoveries.",
 "🔭 Научни области":"🔭 Scientific fields",
 "⬆ Технолошки центар":"⬆ Technology center",
 "✨ Нови откритија":"✨ New discoveries",
 "📚 Материјали и архива":"📚 Materials and archive",
 "Нема нови откритија.":"No new discoveries yet.",
 "Знаење":"Knowledge",
 "Истражувачки кредити":"Research credits",
 "Енергија":"Energy",
 "Вкупно откритија":"Total discoveries",
 "Нова фауна":"New fauna",
 "Истражувај":"Research",
 "Истражувања":"Research",
 "Молекуларни системи":"Molecular systems",
 "Екологија":"Ecology",
 "Исхрана":"Nutrition",
 "Когниција":"Cognition",
 "Фантастична генетика":"Fictional genomics",
 "Фонд на знаење":"Accumulated knowledge",
 "Ниво на област":"Field knowledge",
 "Потребно ниво на лабораторија":"Required laboratory level",
 "Научен експеримент · 3 молекули + 5 енергија + 1 акција":"Scientific study · 3 molecules + 5 energy + 1 action",
 "Следна лабораторија":"Next laboratory",
 "Провери ги сите услови":"Review all requirements",
 "Сите услови се исполнети":"All requirements met",
 "Недостасуваат предуслови":"Requirements missing",
 "⬆ Надгради лабораторија":"⬆ Upgrade laboratory",
 "Лабораториите немаат финална победа.":"There is no final laboratory victory.",
 "Нова храна":"New food",
 "Нова флора":"New flora",
 "Нов материјал":"New material",
 "Нова фауна":"New fauna",
 "Истражи проект":"Discover project",
 "Откритие · 8 сознание + 12 молекули + 1 акција":"Discovery · 8 insight + 12 molecules + 1 action",
 "Фауна · 35 сознание + 50 молекули + 1 акција":"Fauna · 35 insight + 50 molecules + 1 action",
 "За нова фауна треба лабораторија ниво 12, зрел Ноетриум или наследник со ниво 75, и слободни ресурси.":"New fauna requires lab 12, an evolved Noetrium or successor at level 75, and enough resources.",
 "Избран миленик за фауна":"Selected pet for fauna",
 "Промени миленик во ДНК":"Change pet in DNA",
 "Материјал":"Material",
 "Пронајден":"Discovered",
 "Неоткриен":"Not discovered",
 "Потребно знаење":"Required knowledge",
 "Потребно истражување":"Required research",
 "Резерва":"Inventory",
 "⚗️ Произведи +2":"⚗️ Produce +2",
 "Цена · 12 молекули + 10 биомаса + 1 акција":"Cost · 12 molecules + 10 biomass + 1 action",
 "Истражи нов материјал во откритијата.":"Discover new materials in the discovery station.",
 "Последни откритија":"Recent discoveries",
 "Нема регистрирани изуми.":"No recorded inventions.",
 "Изминат ден":"Day",
 "Потврди истражување":"Confirm research",
 "Потврди надградба":"Confirm upgrade",
 "Потврди откритие":"Confirm discovery",
 "Потврди производство":"Confirm production",
 "Оригиналната игра ги проверува условите и ги троши ресурсите.":"The original game checks requirements and spends resources.",
 "Нема доволно ресурси или предуслови.":"Insufficient resources or requirements.",
 "Истражувачката акција е во тек…":"Research operation in progress…",
 "Потврди":"Confirm",
 "Откажи":"Cancel",
 "🏛️ Отвори класични истражувања":"🏛️ Open Classic research",
 "Ден":"Day",
 "Потребен е избран миленик за истражување фауна.":"Select a pet to discover fauna.",
 "Назад во ходникот":"Back to corridor",
 "Аерогел од светлински влакна":"Lightfiber aerogel",
 "Призмочелик":"Prismsteel",
 "Жив силикат":"Living silicate",
 "Ѕвездена легура":"Star alloy"
});
Object.assign(EN,{
 "🏛️ Главно лоби на лабораторијата":"🏛️ Main Laboratory Lobby",
 "🏛️ Главно лоби":"🏛️ Main Lobby",
 "Ова е централниот влез. Одбери една од петте 3D лаборатории.":"This is the central entrance. Choose one of five 3D laboratories.",
 "Пет лаборатории, еден заеднички центар.":"Five laboratories, one connected center.",
 "Допрете осветлена врата или избери просторија од холограмот.":"Tap an illuminated door, or choose a room on the hologram.",
 "Влези →":"Enter →",
 "↩ Главно лоби":"↩ Main Lobby",
 "Главно лоби":"Main Lobby"
});
const T=value=>world?.language&&world.language!=="mk"?(EN[value]||value):value;
const dnaLabel=value=>{
 const raw=String(value||"");
 if(raw.startsWith("Претходен вид: "))return (world?.language==="mk"?"Претходен вид: ":"Previous species: ")+raw.slice(15);
 if(raw.startsWith("Изворен вид "))return (world?.language==="mk"?"Изворен вид ":"Source species ")+raw.slice(12);
 if(raw.startsWith("Биосвет "))return (world?.language==="mk"?"Биосвет ":"Habitat ")+raw.slice(8);
 return T(raw);
};
const COMPLEX_ROOMS=[
 {id:"basic",label:"⚗️ Основна лабораторија",tab:null,ready:true},
 {id:"dna",label:"🧬 ДНК лабораторија",tab:"dna",ready:true},
 {id:"foodlab",label:"🧪 Лабораторија за храна",tab:"food",ready:true},
 {id:"floralab",label:"🌱 Лабораторија за флора",tab:"plants",ready:true},
 {id:"research",label:"🔬 Истражувачка лабораторија",tab:"research",ready:true}
];
const sections={
lab:["⚗️ Лабораторија","Вистинските лабораториски акции го ажурираат постојниот зачуван свет."],
flora:["🌿 Флора","Одгледувај и истражувај ги растенијата во избраниот биосвет."],
biosphere:["🪐 Биосвет","Следи ги миленичињата, капацитетот и условите на живеалиштето."],
research:["🔬 Истражување","Отклучувај сознанија преку реалната прогресија на Trialum."]
};
const panel=document.createElement("section");
panel.id="lw-context";
panel.setAttribute("aria-label","Контекстни контроли за активната 3D сцена");
document.querySelector(".frame")?.appendChild(panel);
const hudToggle=document.createElement("button");
hudToggle.id="lw-hud-toggle";
hudToggle.type="button";
hudToggle.setAttribute("aria-controls","lw-context");
document.querySelector(".frame")?.appendChild(hudToggle);
let hudHidden=false;
function labelForHud(){
 const en=Boolean(world?.language&&world.language!=="mk");
 hudToggle.textContent=hudHidden?"◨":"◧";
 hudToggle.title=T(hudHidden?"Прикажи го холограмскиот HUD":"Сокриј го холограмскиот HUD");
 hudToggle.setAttribute("aria-label",hudToggle.title);
 hudToggle.setAttribute("aria-expanded",String(!hudHidden));
}
function setHudHidden(hide){
 hudHidden=Boolean(hide);
 document.body.classList.toggle("lw-hud-hidden",hudHidden);
 if(hudHidden){
  if(panel.contains(document.activeElement))hudToggle.focus({preventScroll:true});
  panel.setAttribute("aria-hidden","true");
  panel.inert=true;
 }else{
  panel.removeAttribute("aria-hidden");
  panel.inert=false;
 }
 labelForHud();
}
hudToggle.addEventListener("click",()=>setHudHidden(!hudHidden));
labelForHud();
document.body.classList.add("lw-live-mode");
const css=document.createElement("style");
css.textContent="\nbody.lw-live-mode .control-panel,body.lw-live-mode .discovery{display:none!important}\n#lw-context{position:absolute;right:calc(13px + env(safe-area-inset-right));top:72px;width:min(280px,29vw);max-height:calc(100% - 86px);overflow:auto;padding:12px 13px;border-radius:18px;background:#091e2dde;backdrop-filter:blur(14px);border:1px solid #85e0c259;box-shadow:0 12px 35px #00152180}\n#lw-context h3{color:#baf9df;margin:0 0 7px;font-size:15px}\n#lw-context p{font-size:11px;line-height:1.35;color:#d5e8e1;margin:5px 0 9px}\n#lw-context .lw-stats{display:grid;grid-template-columns:1fr 1fr;gap:6px}\n#lw-context .lw-stats span{padding:6px;min-width:0;border:1px solid #5ca4913d;background:#1c43534d;border-radius:9px;font-size:10px;color:#daede7}\n#lw-context .lw-stats strong{display:block;font-size:16px;color:#fff2c4}\n#lw-context button{display:block;margin-top:5px;width:100%;padding:8px;border-radius:10px;border:1px solid #438978;background:#195254;color:#e8fff3;text-align:left;font-size:12px}\n#lw-context button:disabled{opacity:.42}\n#lw-context .lw-result{margin-top:8px;border-top:1px solid #ffffff30;padding-top:7px;font-size:11px;color:#ffe6b3}\n@media(max-height:460px){#lw-context{top:50px;max-height:calc(100% - 54px);width:210px;padding:7px}#lw-context button{padding:5px}}\n@media(max-width:720px){#lw-context{width:178px}#lw-context h3{font-size:12px}#lw-context button{font-size:10px}}\n";
css.textContent+="\n#lw-context .lw-stations{display:grid;grid-template-columns:1fr 1fr;gap:5px;margin:8px 0}\n#lw-context .lw-stations button{margin:0;padding:6px 4px;min-height:39px;text-align:center;font-size:10px}\n#lw-context .lw-stations button[aria-pressed=\"true\"]{border-color:#adf6bb;background:#296e63;box-shadow:0 0 0 1px #a1fac63b}\n#lw-context .lw-overview{margin:5px 0 8px!important}\n#lw-context .lw-station-hint{color:#c5e4de;font-size:11px;padding:5px 0}\n@media(max-height:450px){#lw-context .lw-stations button{min-height:31px;padding:4px 3px}#lw-context .lw-station-hint{font-size:10px}}\n";
css.textContent+="\n/* LW-D owner-directed holographic HUD: lightweight frosted glass, reversible.\n * Keep all world-changing actions delegated to the original Trialum engine. */\nbody.lw-live-mode #lw-context{\n background:linear-gradient(145deg,rgba(12,56,74,.48),rgba(4,26,41,.30))!important;\n -webkit-backdrop-filter:blur(13px) saturate(135%);\n backdrop-filter:blur(13px) saturate(135%);\n border:1px solid rgba(148,246,235,.57)!important;\n box-shadow:inset 0 1px 0 rgba(238,255,250,.35),inset 0 0 22px rgba(59,221,204,.07),0 14px 36px rgba(0,18,33,.32),0 0 18px rgba(52,236,213,.09)!important;\n border-radius:19px!important;color:#f0fffb;\n overflow-y:auto;overflow-x:hidden;\n transition:opacity .22s ease,transform .25s ease,visibility .25s ease;\n}\nbody.lw-live-mode #lw-context::before{\n content:\"\";position:absolute;inset:0;pointer-events:none;border-radius:inherit;\n background:linear-gradient(112deg,rgba(232,255,255,.15),transparent 22%,transparent 80%,rgba(67,235,206,.07)),\n repeating-linear-gradient(180deg,transparent 0px,transparent 15px,rgba(94,222,226,.012) 16px);\n}\nbody.lw-live-mode #lw-context h3{text-shadow:0 0 12px rgba(104,248,224,.28);letter-spacing:.02em}\nbody.lw-live-mode #lw-context .lw-stats span{\n background:rgba(19,70,88,.23)!important;\n border:1px solid rgba(142,244,225,.21)!important;\n}\nbody.lw-live-mode #lw-context button{\n color:#effff9;background:linear-gradient(120deg,rgba(38,131,137,.32),rgba(15,80,103,.22))!important;\n border:1px solid rgba(132,240,226,.41)!important;\n box-shadow:inset 0 1px 0 rgba(238,255,255,.11);\n}\nbody.lw-live-mode #lw-context button:focus-visible,\nbody.lw-live-mode #lw-hud-toggle:focus-visible{outline:2px solid #a5ffe4;outline-offset:2px}\nbody.lw-live-mode #lw-context button[aria-pressed=\"true\"]{\n background:rgba(47,170,157,.43)!important;border-color:#bcffe6!important;\n}\nbody.lw-live-mode #lw-context button:disabled{opacity:.44}\nbody.lw-live-mode #lw-hud-toggle{\n display:grid;place-items:center;position:absolute;z-index:32;\n top:max(66px,calc(40px + env(safe-area-inset-top)));\n right:calc(22px + env(safe-area-inset-right) + min(230px,26vw));\n width:44px;height:44px;min-width:44px;min-height:44px;border-radius:14px;\n color:#c8fff0;font-size:24px;font-weight:600;\n border:1px solid rgba(147,249,225,.58);\n background:linear-gradient(140deg,rgba(11,69,84,.65),rgba(8,36,60,.47));\n -webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);\n box-shadow:0 4px 22px rgba(5,26,44,.38),inset 0 1px rgba(242,255,249,.29);\n transition:right .22s ease,background .18s ease;\n cursor:pointer;touch-action:manipulation;\n}\nbody.lw-live-mode.lw-hud-hidden #lw-context{\n opacity:0!important;visibility:hidden!important;pointer-events:none!important;\n transform:translateX(20px);\n}\nbody.lw-live-mode.lw-hud-hidden #lw-hud-toggle{\n right:calc(13px + env(safe-area-inset-right));\n background:linear-gradient(140deg,rgba(12,75,83,.57),rgba(6,37,55,.45));\n}\nbody.lw-live-mode #lw-context .lw-exit-world{\n margin-top:10px;font-size:10px!important;text-align:center!important;\n border-color:rgba(189,243,230,.35)!important;background:rgba(11,46,65,.18)!important;\n}\n@media(max-height:460px){\n body.lw-live-mode #lw-hud-toggle{top:54px}\n body.lw-live-mode #lw-context{border-radius:14px}\n}\n@media(prefers-reduced-motion:reduce){\n body.lw-live-mode #lw-context,body.lw-live-mode #lw-hud-toggle{transition:none!important}\n}\n";
css.textContent+="\nbody.lw-live-mode #lw-context .lw-complex-rooms{display:grid;grid-template-columns:1fr;gap:5px;margin:8px 0 5px}\nbody.lw-live-mode #lw-context .lw-complex-rooms button{display:flex;justify-content:space-between;align-items:center;gap:5px;margin:0;padding:7px 8px;min-height:34px}\nbody.lw-live-mode #lw-context .lw-complex-rooms button small{font-size:9px;opacity:.68;max-width:110px;text-align:right}\nbody.lw-live-mode #lw-context .lw-entrance{background:rgba(42,148,128,.35)!important;border:1px solid #9deed6!important}\nbody.lw-live-mode #lw-context .lw-complex-future{font-size:10px;padding:6px 0;color:#b7f2db}\nbody.lw-live-mode #lw-context .lw-complex-back{background:rgba(40,136,125,.32)!important}\n";
css.textContent+=
 "\n#lw-context .lw-dna-controls{display:grid;gap:5px;margin:6px 0}"+
 "\n#lw-context .lw-dna-field{display:grid;gap:3px;color:#d9fff3;font-size:11px}"+
 "\n#lw-context .lw-dna-field input,#lw-context .lw-dna-field select{width:100%;min-width:0;accent-color:#76e9da;color:#eafff9;background:#143e52;border:1px solid #62a99f;border-radius:7px;padding:4px}"+
 "\n#lw-context .lw-dna-hue-value{font-size:11px;color:#a8ffeb}"+
 "\n#lw-context .lw-dna-criterion{margin:3px 0;font-size:10px}"+
 "\n#lw-context .lw-dna-feedback{padding:6px;border:1px solid #7cdbc7;border-radius:8px;background:#102e40}"+
 "\n#lw-context button.lw-dna-commit{font-weight:700;border-color:#adffce!important}";
css.textContent+=
 "\n#lw-context .lw-food-picker{margin:7px 0;position:relative}"+
 "\n#lw-context .lw-food-picker-toggle{min-height:34px!important;border-color:rgba(151,255,229,.65)!important}"+
 "\n#lw-context .lw-food-picker-list{max-height:min(184px,40vh);overflow-y:auto;overscroll-behavior:contain;display:grid;gap:4px;padding:6px;margin-top:5px;border:1px solid rgba(146,248,227,.48);border-radius:12px;background:linear-gradient(140deg,rgba(10,49,67,.78),rgba(15,70,84,.65));-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);box-shadow:inset 0 1px 0 #e4fff52b,0 9px 18px #071e2c67}"+
 "\n#lw-context .lw-food-picker-list button{margin:0!important;min-height:30px;padding:6px 7px!important;font-size:10px;text-align:left}"+
 "\n#lw-context .lw-food-confirm{margin:8px 0;padding:9px;border-radius:12px;border:1px solid rgba(170,252,222,.63);background:linear-gradient(145deg,rgba(23,92,103,.63),rgba(8,52,77,.59));-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);box-shadow:0 0 14px #2be9b320}"+
 "\n#lw-context .lw-food-confirm strong{font-size:12px;color:#d3fff0}"+
 "\n#lw-context .lw-food-confirm-actions{display:grid;grid-template-columns:1fr 1fr;gap:5px}"+
 "\n#lw-context .lw-food-confirm-actions button{min-height:30px;text-align:center!important}"+
 "\n#lw-context .lw-food-feedback{padding:6px 8px;border:1px solid #a4ebd557;border-radius:9px;background:#0a404a8c}"+
 "\n#lw-context button.lw-food-action{font-weight:700;border-color:rgba(185,253,214,.9)!important}"+
 "\n@media(max-height:460px){#lw-context .lw-food-picker-list{max-height:126px}#lw-context .lw-food-confirm{padding:6px}}"+
 "\n@media(prefers-reduced-motion:reduce){#lw-context .lw-food-picker-list,#lw-context .lw-food-confirm{animation:none!important;transition:none!important}}";
css.textContent+=
 "\n#lw-context .lw-flora-model-list{display:grid;gap:4px;margin:6px 0;max-height:148px;overflow-y:auto;overscroll-behavior:contain;border:1px solid rgba(119,239,174,.43);border-radius:11px;background:rgba(12,67,68,.31);padding:6px;-webkit-backdrop-filter:blur(9px);backdrop-filter:blur(9px)}"+
 "\n#lw-context .lw-flora-model-list button{margin:0!important;padding:6px 7px!important;font-size:10px;text-align:left}"+
 "\n#lw-context .lw-flora-model-list button[aria-pressed=true]{background:rgba(36,155,109,.48)!important;border-color:#b6fbd6!important}"+
 "\n#lw-context .lw-flora-specimen{padding:4px 0;border-bottom:1px solid rgba(136,230,181,.16)}"+
 "\n#lw-context .lw-flora-progress{height:7px;overflow:hidden;border:1px solid rgba(126,237,174,.39);border-radius:8px;background:rgba(7,41,49,.7)}"+
 "\n#lw-context .lw-flora-progress span{display:block;height:100%;background:linear-gradient(90deg,#54e2a4,#acffd4)}"+
 "\\n@media(max-height:460px){#lw-context .lw-flora-model-list{max-height:112px}}";
css.textContent+=
 "\n#lw-context .lw-flora-confirm{margin:8px 0;padding:9px;border:1px solid rgba(165,252,201,.68);border-radius:12px;background:linear-gradient(145deg,rgba(13,76,77,.75),rgba(9,47,75,.68));-webkit-backdrop-filter:blur(13px);backdrop-filter:blur(13px);box-shadow:0 0 13px #2be9b32b}"+
 "\n#lw-context .lw-flora-confirm strong{font-size:12px;color:#d5ffe5}"+
 "\n#lw-context .lw-flora-confirm p{font-size:11px}"+
 "\n#lw-context button.lw-flora-action{font-weight:700;border-color:#9cf8ba!important}"+
 "\n#lw-context .lw-flora-feedback{padding:7px;border:1px solid rgba(114,246,182,.47);border-radius:9px;background:rgba(10,60,67,.60)}";
css.textContent+=
 "\n#lw-context .lw-dna-pet-list,#lw-context .lw-dna-lineage-list{display:grid;gap:5px;max-height:min(175px,32vh);overflow:auto;overscroll-behavior:contain;padding:5px;margin:6px 0;border:1px solid rgba(123,244,221,.42);border-radius:11px;background:rgba(6,55,72,.43);-webkit-backdrop-filter:blur(9px);backdrop-filter:blur(9px)}"+
 "\n#lw-context .lw-dna-pet-list button,#lw-context .lw-dna-lineage-list button{margin:0!important;padding:5px 7px!important;font-size:10px!important;text-align:left}"+
 "\n#lw-context .lw-dna-choice-list{display:grid;grid-template-columns:repeat(auto-fit,minmax(38px,1fr));gap:5px;margin:7px 0}"+
 "\n#lw-context .lw-dna-choice-list button{margin:0!important;text-align:center;min-height:33px;padding:5px!important;font-size:10px!important}"+
 "\n#lw-context .lw-dna-target-details{border:1px solid rgba(130,251,224,.32);border-radius:10px;padding:8px;margin:7px 0;background:rgba(7,52,73,.43)}"+
 "\n#lw-context .lw-dna-target-details p{margin:4px 0!important}"+
 "\n#lw-context .lw-dna-confirm{padding:9px;margin:7px 0;border-radius:11px;border:1px solid #a3f6d3a1;background:linear-gradient(145deg,rgba(12,74,76,.78),rgba(8,42,68,.65));-webkit-backdrop-filter:blur(13px);backdrop-filter:blur(13px)}"+
 "\n#lw-context .lw-dna-confirm-actions{display:grid;grid-template-columns:1fr 1fr;gap:5px}"+
 "\n#lw-context .lw-dna-color-preview{height:19px;border-radius:9px;border:1px solid #ffffff6b;margin:5px 0}"+
 "\n@media(max-height:460px){#lw-context .lw-dna-pet-list,#lw-context .lw-dna-lineage-list{max-height:113px}}"+
 "\n@media(prefers-reduced-motion:reduce){#lw-context .lw-dna-confirm{animation:none!important;transition:none!important}}";
css.textContent+=
 "\n#lw-context .lw-research-list{display:grid;gap:5px;max-height:166px;overflow:auto;overscroll-behavior:contain;padding:6px;margin:7px 0;border:1px solid rgba(131,225,255,.40);border-radius:11px;background:rgba(5,48,76,.42);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)}"+
 "\n#lw-context .lw-research-list button{margin:0!important;padding:6px 7px!important;font-size:10px;text-align:left}"+
 "\n#lw-context .lw-research-details{padding:8px;border:1px solid rgba(110,204,255,.35);border-radius:10px;margin:7px 0;background:rgba(9,45,74,.36)}"+
 "\n#lw-context .lw-research-details p{margin:4px 0!important;font-size:10px}"+
 "\n#lw-context .lw-research-confirm{padding:9px;margin:8px 0;border:1px solid rgba(157,235,255,.73);border-radius:12px;background:linear-gradient(135deg,rgba(11,66,89,.80),rgba(18,51,87,.67));-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px)}"+
 "\n#lw-context .lw-research-confirm-actions{display:grid;grid-template-columns:1fr 1fr;gap:6px}"+
 "\n#lw-context .lw-research-confirm-actions button{text-align:center!important}"+
 "\n#lw-context .lw-research-feedback{border:1px solid #81caff85;border-radius:10px;padding:8px;background:rgba(10,58,89,.56)}"+
 "\n@media(max-height:460px){#lw-context .lw-research-list{max-height:105px}}"+
 "\n@media(prefers-reduced-motion:reduce){#lw-context .lw-research-confirm{transition:none!important;animation:none!important}}";
css.textContent+=
 "\nbody.lw-live-mode.lw-complex-hall #lw-context{border-color:rgba(144,244,243,.64)!important;box-shadow:0 8px 38px rgba(0,34,56,.27),inset 0 1px 0 rgba(243,255,253,.20)!important}"+
 "\nbody.lw-live-mode.lw-complex-hall #lw-context .lw-complex-rooms button{min-height:38px;transition:transform .2s ease,border-color .2s ease;box-shadow:inset 0 0 16px rgba(55,185,199,.10)!important}"+
 "\nbody.lw-live-mode.lw-complex-hall #lw-context .lw-complex-rooms button:active{transform:scale(.985)}"+
 "\nbody.lw-live-mode.lw-complex-hall #lw-context .lw-complex-rooms button small{color:#b8fff0;opacity:1}"+
 "\nbody.lw-live-mode #lw-context.lw-room-arrival{animation:lwArrival .38s ease-out both}"+
 "\n@keyframes lwArrival{from{opacity:.35;transform:translateX(12px)}to{opacity:1;transform:translateX(0)}}"+
 "\n@media(prefers-reduced-motion:reduce){body.lw-live-mode #lw-context.lw-room-arrival{animation:none!important}}";
document.head.appendChild(css);
function make(tag,label,cls){
const e=document.createElement(tag);
if(label!==undefined)e.textContent=label;
if(cls)e.className=cls;
return e;
}
function num(v){const n=Number(v);return Number.isFinite(n)?Math.floor(n).toLocaleString("mk-MK"):"0";}
function addStat(parent,label,value){const e=make("span",T(label)),v=make("strong",num(value));e.append(v);parent.append(e);}
function addButton(label,kind,tab,disabled){
const b=make("button",T(label));b.type="button";b.disabled=Boolean(disabled);
b.dataset.lwAction=kind||"";b.dataset.lwTab=tab||"";
panel.append(b);
}
function render(){
const scene=document.querySelector("[data-scene].active")?.dataset.scene||"lab";
const inComplex=scene==="lab"&&complexRoom==="hub";
const inDna=scene==="lab"&&complexRoom==="dna";
const inFood=scene==="lab"&&complexRoom==="foodlab";
const inFlora=scene==="lab"&&complexRoom==="floralab";
 const inResearch=scene==="lab"&&complexRoom==="research";
document.body.classList.toggle("lw-complex-hall",inComplex);
 const lobbyTitle=document.getElementById("sceneTitle");
 const lobbyDescription=document.getElementById("sceneDescription");
 if(inComplex){
  if(lobbyTitle)lobbyTitle.textContent=T("🏛️ Главно лоби");
  if(lobbyDescription)lobbyDescription.textContent=T("Пет лаборатории, еден заеднички центар.");
 }
document.body.classList.toggle("lw-dna-laboratory",inDna);
document.body.classList.toggle("lw-food-laboratory",inFood);
document.body.classList.toggle("lw-flora-laboratory",inFlora);
 document.body.classList.toggle("lw-research-laboratory",inResearch);
if(inComplex){
 panel.replaceChildren(make("h3",T("🏛️ Главно лоби на лабораторијата")),
  make("p",T("Ова е централниот влез. Одбери една од петте 3D лаборатории.")));
 const lobbyStats=make("div",undefined,"lw-stats");
 addStat(lobbyStats,"Лабораторија ниво",world?.research?.level);
 addStat(lobbyStats,"Лаб. акции",world?.labActions);
 addStat(lobbyStats,"Миленичиња",world?.pets);
 addStat(lobbyStats,"Сознание",world?.insight);
 panel.append(lobbyStats);
 const note=make("p",T("Допрете осветлена врата или избери просторија од холограмот."),"lw-complex-future");
 panel.append(note);
 const options=make("div",undefined,"lw-complex-rooms");
 for(const room of COMPLEX_ROOMS){
  const button=make("button");
  button.type="button";button.dataset.lwComplex=room.id;
  button.append(make("span",T(room.label)));
  if(room.ready)button.append(make("small",T("Влези →")));
  else button.append(make("small",T("Во развој · отвори постојна функција")));
  options.append(button);
 }
 panel.append(options);
 // L3.7: public navigation expands beyond the laboratory: the lobby
 // becomes the shared access hub, while private pet homes will later be
 // accessed through a separate future neighborhood/town map.
 panel.append(make("h3",T("Други 3D простори")));
 panel.append(make("p",T("Постојните 3D сцени се пробни; домовите подоцна ќе бидат дел од посебен град."),"lw-complex-future"));
 const portals=make("div",undefined,"lw-complex-rooms");
 for(const [scene,label] of [["biosphere","🪐 Биосвет"],["flora","🌿 Флора"],["research","🔬 Истражување"]]){
  const b=make("button",T(label));b.type="button";b.dataset.lwPortal=scene;portals.append(b);
 }
 const atlasButton=make("button",T("🗺️ Мапа и сите функции"));atlasButton.type="button";
 atlasButton.dataset.lwAtlas="open";portals.append(atlasButton);
 panel.append(portals);
 if(!world)panel.querySelectorAll("button").forEach(button=>button.disabled=true);
 if(world){
  const exit=make("button",T("← Излези од 3D"),"lw-exit-world");
  exit.dataset.lwTab="lab";exit.type="button";panel.append(exit);
 }
 labelForHud();
 return;
}

if(inResearch){
 const research=world?.research||{},fields=Array.isArray(research.fields)?research.fields:[],
  materials=Array.isArray(research.materials)?research.materials:[],
  recent=Array.isArray(research.recent)?research.recent:[];
 if(!fields.some(x=>x.id===researchSelectedField))researchSelectedField=fields[0]?.id||null;
 if(!materials.some(x=>x.id===researchSelectedMaterial))researchSelectedMaterial=materials[0]?.id||null;
 if(!["food","flora","material","fauna"].includes(researchSelectedInvent))researchSelectedInvent="food";
 panel.replaceChildren(make("h3",T("🔬 Истражувачка лабораторија · L3.5")),
  make("p",T("Сите пет врати се функционални. Оригиналниот свет ги контролира откритијата.")));
 const back=make("button",T("Назад во ходникот"),"lw-complex-back");
 back.type="button";back.dataset.lwComplex="hub";panel.append(back);
 const stats=make("div",undefined,"lw-stats");
 addStat(stats,"Лабораторија ниво",research.level);
 addStat(stats,"Знаење",research.knowledge);
 addStat(stats,"Лаб. акции",research.labActions);
 addStat(stats,"Истражувачки кредити",research.credits);
 addStat(stats,"Молекули",research.compounds);
 addStat(stats,"Сознание",research.insight);
 panel.append(stats);
 const buttons=make("div",undefined,"lw-stations");
 for(const [id,label] of [
  ["disciplines","🔭 Научни области"],["upgrade","⬆ Технолошки центар"],
  ["discoveries","✨ Нови откритија"],["archive","📚 Материјали и архива"]
 ]){
  const b=make("button",T(label));b.type="button";b.dataset.lwResearchStation=id;
  b.setAttribute("aria-pressed",String(id===selectedResearchStation));
  b.disabled=researchPending;buttons.append(b);
 }
 panel.append(buttons);
 if(!selectedResearchStation)panel.append(make("p",T("Избери работна станица")));
 if(selectedResearchStation==="disciplines"){
  panel.append(make("h3",T("🔭 Научни области")));
  const choices=make("div",undefined,"lw-research-list");
  choices.setAttribute("role","group");choices.setAttribute("aria-label",T("🔭 Научни области"));
  for(const field of fields){
   const b=make("button",field.icon+" "+T(field.name)+" · "+num(field.points));
   b.type="button";b.dataset.lwResearchField=field.id;
   b.setAttribute("aria-pressed",String(researchSelectedField===field.id));
   b.disabled=researchPending;choices.append(b);
  }
  panel.append(choices);
  const field=fields.find(x=>x.id===researchSelectedField);
  if(field){
   const details=make("div",undefined,"lw-research-details");
   details.append(make("h3",field.icon+" "+T(field.name)));
   details.append(make("p",T("Ниво на област")+": "+num(field.points)));
   details.append(make("p",T("Потребно ниво на лабораторија")+": "+num(field.levelGate)));
   details.append(make("p",T("Научен експеримент · 3 молекули + 5 енергија + 1 акција")));
   details.append(make("p",T("Енергија")+": "+num(research.energy)));
   panel.append(details);
   const b=make("button",T("Истражувај"),"lw-research-action");
   b.type="button";b.dataset.lwResearchCommit="study";
   b.disabled=!field.canStudy||researchPending;panel.append(b);
  }
 }
 if(selectedResearchStation==="upgrade"){
  panel.append(make("h3",T("⬆ Технолошки центар")));
  const next=research.next||{};
  panel.append(make("p",T("Следна лабораторија")+": "+T(next.name||"")+" · "+T("Ниво")+" "+num(next.level)));
  const checks=make("div",undefined,"lw-research-details");
  checks.append(make("h3",T("Провери ги сите услови")));
  for(const requirement of next.requirements||[])
   checks.append(make("p",(requirement.ok?"✓ ":"🔒 ")+T(requirement.label)+": "+String(requirement.value)));
  panel.append(checks);
  panel.append(make("p",T(next.canUpgrade?"Сите услови се исполнети":"Недостасуваат предуслови")));
  const b=make("button",T("⬆ Надгради лабораторија"),"lw-research-action");
  b.type="button";b.dataset.lwResearchCommit="upgrade";
  b.disabled=!next.canUpgrade||researchPending;panel.append(b);
  panel.append(make("p",T("Лабораториите немаат финална победа.")));
 }
 if(selectedResearchStation==="discoveries"){
  panel.append(make("h3",T("✨ Нови откритија")));
  const options=[["food","🥣 Нова храна"],["flora","🌿 Нова флора"],
   ["material","🪨 Нов материјал"],["fauna","🐉 Нова фауна"]];
  const list=make("div",undefined,"lw-research-list");
  list.setAttribute("role","group");list.setAttribute("aria-label",T("✨ Нови откритија"));
  for(const [id,label] of options){
   const v=research.inventions?.[id];
   const b=make("button",T(label)+(v?.can?" ✓":" 🔒"));
   b.type="button";b.dataset.lwResearchInvent=id;
   b.setAttribute("aria-pressed",String(id===researchSelectedInvent));
   b.disabled=researchPending;list.append(b);
  }
  panel.append(list);
  const v=research.inventions?.[researchSelectedInvent];
  if(v){
   const details=make("div",undefined,"lw-research-details");
   details.append(make("p",T(researchSelectedInvent==="fauna"?
    "Фауна · 35 сознание + 50 молекули + 1 акција":
    "Откритие · 8 сознание + 12 молекули + 1 акција")));
   details.append(make("p",T("Вкупно откритија")+": "+num(research.discoveredCount)+
    " · "+T("Нова фауна")+": "+num(research.faunaCount)));
   if(researchSelectedInvent==="fauna"){
    details.append(make("p",T("За нова фауна треба лабораторија ниво 12, зрел Ноетриум или наследник со ниво 75, и слободни ресурси.")));
    details.append(make("p",T("Избран миленик за фауна")+": "+
      (research.pet?research.pet.name+" · "+T("Ниво")+" "+num(research.pet.level):
       T("Потребен е избран миленик за истражување фауна."))));
    const change=make("button",T("Промени миленик во ДНК"));
    change.type="button";change.dataset.lwComplex="dna";change.disabled=researchPending;
    details.append(change);
   }
   panel.append(details);
   const b=make("button",T("Истражи проект"),"lw-research-action");
   b.type="button";b.dataset.lwResearchCommit="invent";
   b.disabled=!v.can||researchPending;panel.append(b);
  }
 }
 if(selectedResearchStation==="archive"){
  panel.append(make("h3",T("📚 Материјали и архива")));
  const list=make("div",undefined,"lw-research-list");
  list.setAttribute("role","group");list.setAttribute("aria-label",T("Материјал"));
  for(const m of materials){
   const b=make("button","🪨 "+T(m.name)+" · "+T("Резерва")+" "+num(m.quantity));
   b.type="button";b.dataset.lwResearchMaterial=m.id;
   b.setAttribute("aria-pressed",String(m.id===researchSelectedMaterial));
   b.disabled=researchPending;list.append(b);
  }
  panel.append(list);
  const m=materials.find(x=>x.id===researchSelectedMaterial);
  if(m){
   const details=make("div",undefined,"lw-research-details");
   details.append(make("h3",T(m.name)));
   details.append(make("p",T(m.quantity>0?"Пронајден":"Неоткриен")+" · "+
     T("Резерва")+": "+num(m.quantity)));
   details.append(make("p",T("Потребно ниво на лабораторија")+": "+num(m.lab)));
   details.append(make("p",T("Потребно знаење")+": "+num(m.knowledge)));
   details.append(make("p",T("Потребно истражување")+": "+T(m.field)+
     " "+num(m.fieldProgress)+"/"+num(m.points)));
   if(!m.quantity)details.append(make("p",T("Истражи нов материјал во откритијата.")));
   else details.append(make("p",T("Цена · 12 молекули + 10 биомаса + 1 акција")));
   panel.append(details);
   const b=make("button",T("⚗️ Произведи +2"),"lw-research-action");
   b.type="button";b.dataset.lwResearchCommit="craft";
   b.disabled=!m.canCraft||researchPending;panel.append(b);
  }
  panel.append(make("h3",T("Последни откритија")+" ("+num(research.discoveredCount)+")"));
  if(!recent.length)panel.append(make("p",T("Нема регистрирани изуми.")));
  for(const item of recent)
   panel.append(make("p","✨ "+T(item.name)+" · "+T(item.kind)+" · "+
     T("Изминат ден")+" "+num(item.day),"lw-dna-criterion"));
 }
 if(researchConfirm){
  const title=researchConfirm.op==="study"?"Потврди истражување":
   researchConfirm.op==="upgrade"?"Потврди надградба":
   researchConfirm.op==="invent"?"Потврди откритие":"Потврди производство";
  const box=make("div",undefined,"lw-research-confirm");
  box.setAttribute("role","group");box.setAttribute("aria-label",T(title));
  box.append(make("strong",T(title)));
  box.append(make("p",researchConfirm.label));
  box.append(make("p",T("Оригиналната игра ги проверува условите и ги троши ресурсите.")));
  const controls=make("div",undefined,"lw-research-confirm-actions");
  for(const [id,label] of [["cancel","Откажи"],["accept","Потврди"]]){
   const b=make("button",T(label));b.type="button";b.dataset.lwResearchDecision=id;
   b.disabled=researchPending;controls.append(b);
  }
  box.append(controls);panel.append(box);
 }
 if(researchPending)panel.append(make("p",T("Истражувачката акција е во тек…")));
 if(researchFeedback)panel.append(make("p",researchFeedback,"lw-research-feedback"));
 const classic=make("button",T("🏛️ Отвори класични истражувања"),"lw-entrance");
 classic.type="button";classic.dataset.lwTab="research";panel.append(classic);
 const exit=make("button",T("← Излези од 3D"),"lw-exit-world");
 exit.type="button";exit.dataset.lwTab="lab";panel.append(exit);
 labelForHud();return;
}
if(inFlora){
 const flora=world?.flora||{},plants=Array.isArray(flora.plants)?flora.plants:[];
 const specimens=Array.isArray(flora.planted)?flora.planted:[];
 if(!plants.some(x=>x.id===selectedFloraModel))selectedFloraModel=plants[0]?.id||null;
 const model=plants.find(x=>x.id===selectedFloraModel)||null;
 const place=flora.habitat;
 panel.replaceChildren(make("h3",T("🌿 Ботаничка лабораторија · L3.4-B")),
  make("p",T("Живиот растителен свет од твојот вистински биосвет.")));
 const back=make("button",T("↩ Лабораториски ходник"),"lw-complex-back");
 back.type="button";back.dataset.lwComplex="hub";panel.append(back);
 panel.append(make("p",place?T("Избран биосвет")+": "+place.name:T("Не е изграден биосвет"),"lw-station-hint"));
 const stats=make("div",undefined,"lw-stats");
 addStat(stats,"Ниво на лабораторија",flora.labLevel);
 addStat(stats,"Кислород",place?.oxygen);
 addStat(stats,"Растенија",flora.totalPlanted);
 addStat(stats,"Дневни акции",place?.dayActions);
 panel.append(stats);
 const stations=make("div",undefined,"lw-stations");
 for(const st of [
  {id:"seedbank",label:"🌰 Банка за растителни модели"},
  {id:"scanner",label:"🔬 Растителен анализатор"},
  {id:"growth",label:"🌱 Комора за раст"}
 ]){
  const b=make("button",T(st.label));b.type="button";b.dataset.lwFloraStation=st.id;
  b.setAttribute("aria-pressed",String(selectedFloraStation===st.id));stations.append(b);
 }
 panel.append(stations);
 if(!selectedFloraStation)panel.append(make("p",T("Избери станица во просторијата."),"lw-station-hint"));
 if(selectedFloraStation==="seedbank"||selectedFloraStation==="scanner"||selectedFloraStation==="growth"){
  panel.append(make("h3",T(selectedFloraStation==="seedbank"?
   "🌰 Банка за растителни модели":selectedFloraStation==="growth"?
   "🌱 Комора за раст":"🔬 Растителен анализатор")));
  const list=make("div",undefined,"lw-flora-model-list");
  list.setAttribute("role","group");list.setAttribute("aria-label",T("Растителни видови"));
  for(const species of plants){
   const b=make("button",species.icon+" "+species.name+
    (species.discovered?" ✓":" 🔒"),"lw-flora-model-option");
   b.type="button";b.dataset.lwFloraModel=species.id;
   b.setAttribute("aria-pressed",String(species.id===selectedFloraModel));
   list.append(b);
  }
  panel.append(list);
  if(model){
   panel.append(make("p",model.icon+" "+model.name+" · "+model.kind,"lw-station-hint"));
   panel.append(make("p",T("Потребно ниво")+": "+num(model.tier)+" · "+
     T("Придонес за кислород")+": "+num(model.oxygen)));
   panel.append(make("p",T("Стапка на раст")+": "+String(model.growth)));
   panel.append(make("p",T(model.discovered?"Отклучен растителен модел":
     "Неоткриен растителен модел"),"lw-station-hint"));
   panel.append(make("p",T(model.discovered?(model.canPlant?"Може да се засади":
     "Нема слободен простор или материјали"):(model.canInvent?
     "Може да се отклучи":"Потребни се прогресија или ресурси"))));
   panel.append(make("p",T("Растенија")+": "+num(model.planted)));
   if(selectedFloraStation==="seedbank"&&!model.discovered){
    const action=make("button",T("🌱 Отклучи модел · 12 сознание + 7 молекули"),"lw-flora-action");
    action.type="button";action.dataset.lwFloraCommit="invent";
    action.disabled=!model.canInvent||floraPending;panel.append(action);
   }
   if(selectedFloraStation==="growth"&&model.discovered){
    const action=make("button",T("🌿 Засади · C8 + N5 + P3 + O6 · 1 акција"),"lw-flora-action");
    action.type="button";action.dataset.lwFloraCommit="plant";
    action.disabled=!model.canPlant||!place||floraPending;panel.append(action);
   }
  }
 }
 if(selectedFloraStation==="growth"){
  if(!specimens.length)panel.append(make("p",T("Нема засадени растенија")));
  for(const plant of specimens){
   const line=make("div",undefined,"lw-flora-specimen");
   line.append(make("p",plant.icon+" "+plant.name+" · "+T("Раст")+" "+num(plant.growth)+"%"));
   const track=make("div",undefined,"lw-flora-progress");
   const fill=make("span");fill.style.width=Math.max(0,Math.min(100,Number(plant.growth)||0))+"%";
   track.append(fill);line.append(track);panel.append(line);
  }
 }
 panel.append(make("p",T("Производството на флора го користи оригиналниот систем на Trialum."),"lw-complex-future"));
 if(floraConfirm){
  const box=make("div",undefined,"lw-flora-confirm");
  box.setAttribute("role","group");
  box.setAttribute("aria-label",T(floraConfirm.op==="invent"?"Потврди отклучување":"Потврди садење"));
  box.append(make("strong",T(floraConfirm.op==="invent"?"Потврди отклучување":"Потврди садење")));
  box.append(make("p",T("Избран растителен модел")+": "+String(floraConfirm.name||"")));
  if(floraConfirm.op==="plant")box.append(make("p",T("Избран биосвет")+": "+String(world?.flora?.habitat?.name||"")));
  box.append(make("p",T(floraConfirm.op==="invent"?
   "Да потрошам 12 сознание и 7 молекули за овој растителен модел?":
   "Да ги потрошам елементите и една дневна акција за садење во избраниот биосвет?")));
  const row=make("div",undefined,"lw-food-confirm-actions");
  for(const [cmd,label] of [["cancel","Откажи"],["accept","Потврди"]]){
   const button=make("button",T(label));button.type="button";
   button.dataset.lwFloraDecision=cmd;button.disabled=floraPending;row.append(button);
  }
  box.append(row);panel.append(box);
 }
 if(floraPending)panel.append(make("p",T("Работата со флора е во тек…"),"lw-station-hint"));
 if(floraFeedback)panel.append(make("p",floraFeedback,"lw-flora-feedback"));
 const classic=make("button",T("🌿 Отвори оригинална флора"),"lw-entrance");
 classic.type="button";classic.dataset.lwTab="plants";panel.append(classic);
 const exit=make("button",T("← Излези од 3D"),"lw-exit-world");
 exit.type="button";exit.dataset.lwTab="lab";panel.append(exit);
 labelForHud();return;
}
if(inFood){
 const food=world?.food||{},recipes=Array.isArray(food.recipes)?food.recipes:[];
 if(!recipes.some(rec=>rec.id===selectedFoodRecipe))selectedFoodRecipe=recipes[0]?.id||null;
 const current=recipes.find(rec=>rec.id===selectedFoodRecipe)||null;
 panel.replaceChildren(make("h3",T("🍱 Нутритивна лабораторија · L3.3-B")),
  make("p",T("Нутритивни рецепти и производство преку вистинскиот систем на Trialum.")));
 const back=make("button",T("↩ Лабораториски ходник"),"lw-complex-back");
 back.type="button";back.dataset.lwComplex="hub";panel.append(back);
 const stats=make("div",undefined,"lw-stats");
 addStat(stats,"Лабораторија ниво",food.labLevel);
 addStat(stats,"Биомаса",world?.biomass);
 addStat(stats,"Молекули",world?.compounds);
 addStat(stats,"Порции",food.totalStock);
 panel.append(stats);
 const stations=make("div",undefined,"lw-stations");
 for(const st of [
  {id:"synthesis",label:"🥣 Синтеза на храна"},
  {id:"analysis",label:"🔬 Анализа на исхрана"},
  {id:"storage",label:"📦 Складиште на порции"}
 ]){
  const btn=make("button",T(st.label));btn.type="button";btn.dataset.lwFoodStation=st.id;
  btn.setAttribute("aria-pressed",String(selectedFoodStation===st.id));stations.append(btn);
 }
 panel.append(stations);
 if(!selectedFoodStation)panel.append(make("p",T("Избери станица во просторијата."),"lw-station-hint"));
 if(selectedFoodStation==="storage"){
  panel.append(make("h3",T("📦 Складиште на порции")));
  for(const rec of recipes)
   panel.append(make("p",rec.icon+" "+rec.name+": "+num(rec.stock),"lw-food-stock"));
 }
 if(selectedFoodStation==="synthesis"||selectedFoodStation==="analysis"){
  const heading=selectedFoodStation==="synthesis"?"🥣 Синтеза на храна":"🔬 Анализа на исхрана";
  panel.append(make("h3",T(heading)));
  // Native HTML <select> opens the giant opaque Android system popup.
  // Keep all six options inside the existing translucent hologram instead.
  const picker=make("div",undefined,"lw-food-picker");
  const toggle=make("button",current?current.icon+" "+current.name+" ▾":T("Избери рецепт")+" ▾","lw-food-picker-toggle");
  toggle.type="button";toggle.dataset.lwFoodPicker="toggle";
  toggle.setAttribute("aria-expanded",String(foodPickerOpen));
  picker.append(toggle);
  if(foodPickerOpen){
   const list=make("div",undefined,"lw-food-picker-list");
   list.setAttribute("role","group");list.setAttribute("aria-label",T("Рецепти"));
   for(const rec of recipes){
    const option=make("button",rec.icon+" "+rec.name+" · "+T("Залиха")+" "+num(rec.stock),"lw-food-recipe-option");
    option.type="button";option.dataset.lwFoodRecipe=rec.id;
    option.setAttribute("aria-pressed",String(rec.id===selectedFoodRecipe));
    list.append(option);
   }
   picker.append(list);
  }
  panel.append(picker);
  if(current){
   panel.append(make("p",current.icon+" "+current.name,"lw-station-hint"));
   panel.append(make("p",T("Ниво")+": "+num(current.tier)+" · "+
    T("Залиха")+": "+num(current.stock)+" · "+T("Порции")+": "+num(current.portions)));
   panel.append(make("p",T("Цена")+": "+num(current.biomassCost)+" "+T("Биомаса")+
     " + "+num(current.compoundsCost)+" "+T("Молекули")));
   panel.append(make("p",T(!current.unlocked?"Недостапен рецепт":current.canCraft?
    "Може да се произведе":"Недостигаат ресурси или акции"),"lw-station-hint"));
   if(selectedFoodStation==="analysis"){
    panel.append(make("p",food.selectedPet?T("Миленик")+": "+food.selectedPet.name:
      T("Нема избрано милениче"),"lw-station-hint"));
    if(food.selectedPet)panel.append(make("p",T(current.compatible?
     "Погодно за миленикот":"Некомпатибилно со миленикот")));
   }
   // The actual game engine remains sole authority. Buttons only propose actions.
   const cmd=selectedFoodStation==="synthesis"?"craft":"feed";
   const ready=cmd==="craft"?current.canCraft:current.canFeed;
   const doIt=make("button",T(cmd==="craft"?"⚗️ Произведи порции":"🍽 Нахрани го миленичето"),"lw-food-action");
   doIt.type="button";doIt.dataset.lwFoodCommit=cmd;
   doIt.disabled=!ready||foodPending;panel.append(doIt);
  }
 }
 if(foodConfirm){
  const ask=make("div",undefined,"lw-food-confirm");
  ask.setAttribute("role","group");
  ask.setAttribute("aria-label",T(foodConfirm.op==="craft"?"Потврди производство":"Потврди хранење"));
  ask.append(make("strong",T(foodConfirm.op==="craft"?"Потврди производство":"Потврди хранење")));
  ask.append(make("p",T(foodConfirm.op==="craft"?
   "Сигурно сакаш да ги потрошиш вистинските ресурси за овој рецепт?":
   "Сигурно сакаш да нахраниш избрано милениче со оваа храна?")));
  const row=make("div",undefined,"lw-food-confirm-actions");
  for(const [id,label] of [["cancel","Откажи"],["accept","Потврди"]]){
   const b=make("button",T(label));b.type="button";b.dataset.lwFoodDecision=id;
   b.disabled=foodPending;row.append(b);
  }
  ask.append(row);panel.append(ask);
 }
 if(foodPending)panel.append(make("p",T("Операцијата се извршува…"),"lw-station-hint"));
 if(foodFeedback)panel.append(make("p",foodFeedback,"lw-food-feedback"));

 const classic=make("button",T("🍽 Отвори производство и хранење"),"lw-entrance");
 classic.type="button";classic.dataset.lwTab="food";panel.append(classic);
 const exit=make("button",T("← Излези од 3D"),"lw-exit-world");
 exit.type="button";exit.dataset.lwTab="lab";panel.append(exit);
 labelForHud();
 return;
}
if(inDna){
 const dna=world?.dna||{},pet=dna.currentPet||null;
 const pets=Array.isArray(dna.pets)?dna.pets:[];
 const key=pet?[pet.id,pet.genomeSignature,pet.hue,pet.eyes,pet.shape].map(x=>String(x??"")).join("|"):"";
 if(key!==dnaDraftPetKey){
  dnaDraftPetKey=key;
  dnaDraft=pet?{hue:Math.max(0,Math.min(359,Math.round(Number(pet.hue)||0))),
    eyes:Math.max(1,Math.min(5,Math.round(Number(pet.eyes)||1))),
    shape:["jelly","crystal","leaf","cloud"].includes(pet.shape)?pet.shape:"jelly"}:null;
  dnaConfirm=null;
 }
 const available=Array.isArray(dna.targets)?dna.targets:[];
 if(!available.some(x=>x.id===dnaTarget))
  dnaTarget=available.find(x=>x.ready)?.id??available[0]?.id??null;
 panel.replaceChildren(make("h3",T("🧬 ДНК-архитектура · целосен приказ")),
  make("p",T("Оригиналните генетски правила, сите линии и истите миленици од зачуваниот свет.")));
 const back=make("button",T("↩ Лабораториски ходник"),"lw-complex-back");
 back.type="button";back.dataset.lwComplex="hub";panel.append(back);
 const stats=make("div",undefined,"lw-stats");
 addStat(stats,"Лабораторија ниво",dna.labLevel);
 addStat(stats,"Миленик ниво",dna.petLevel);
 addStat(stats,"Молекули",world?.compounds);
 addStat(stats,"Сознание",world?.insight);
 addStat(stats,"Лаб. акции",world?.labActions);
 addStat(stats,"Миленичиња",pets.length);
 panel.append(stats);
 panel.append(make("h3",T("🐾 Избери миленик")));
 const petList=make("div",undefined,"lw-dna-pet-list");
 petList.setAttribute("role","group");petList.setAttribute("aria-label",T("🐾 Избери миленик"));
 for(const item of pets){
  const isCurrent=item.id===pet?.id;
  const button=make("button",item.icon+" "+item.name+
   " · "+T("Ниво")+" "+num(item.level)+" · "+item.speciesName+
   " · "+num(item.generation)+" "+T("Генерации"));
  button.type="button";button.dataset.lwDnaPet=item.id;
  button.setAttribute("aria-pressed",String(isCurrent));
  button.disabled=dnaPending||dnaPetPending;
  petList.append(button);
 }
 if(!pets.length)petList.append(make("p",T("Нема миленици за избор")));
 panel.append(petList);
 const stations=make("div",undefined,"lw-stations");
 for(const st of [
  {id:"scan",label:"🔬 Геномски скенер"},
  {id:"design",label:"🎨 Дизајнер на гени"},
  {id:"lineage",label:"🌱 Еволутивна линија"}
 ]){
  const b=make("button",T(st.label));b.type="button";b.dataset.lwDnaStation=st.id;
  b.setAttribute("aria-pressed",String(selectedDnaStation===st.id));
  b.disabled=dnaPending||dnaPetPending;stations.append(b);
 }
 panel.append(stations);
 if(!selectedDnaStation)panel.append(make("p",T("Избери една од трите 3D станици."),"lw-station-hint"));
 if(selectedDnaStation==="scan"){
  panel.append(make("h3",T("🔬 Геномски скенер")));
  if(!pet)panel.append(make("p",T("Нема избрано милениче")));
  else{
   panel.append(make("p",pet.icon+" "+pet.name+" · "+pet.speciesName));
   panel.append(make("p",T("Ниво")+": "+num(dna.petLevel)+" · "+
    T("Возраст")+": "+num(pet.ageDays)+" "+T("Дена")+" · "+
    T("Акции")+": "+num(pet.actionsLeft)));
   panel.append(make("p",T("Живеалиште")+": "+pet.habitat+" · "+
    T("Генерации")+": "+num(pet.generation)));
   panel.append(make("p",T("Мемории")+": "+num(pet.memories)+" · "+
    T("Тренинзи")+": "+num(pet.trained)));
   panel.append(make("p",T("Боја")+": "+num(pet.hue)+"° · "+T("Очи")+": "+num(pet.eyes)+
    " · "+T("Облик")+": "+T({jelly:"Течна",crystal:"Кристална",leaf:"Лисна",cloud:"Облачна"}[pet.shape]||pet.shape)));
   panel.append(make("p",pet.genomeSignature?
     T("Генетски потпис")+": "+pet.genomeSignature:T("Нема зачуван геном")));
   if((pet.lineageNames||[]).length){
    panel.append(make("h3",T("Еволутивна историја")));
    panel.append(make("p",pet.lineageNames.join(" → "),"lw-dna-criterion"));
   }
  }
  panel.append(make("p",T("Примерокот не се менува со скенирање."),"lw-station-hint"));
 }
 if(selectedDnaStation==="design"){
  panel.append(make("h3",T("🎨 Дизајнер на гени")));
  panel.append(make("p",pet?pet.icon+" "+pet.name:T("Нема избрано милениче")));
  const form=make("div",undefined,"lw-dna-controls");
  const hue=make("input");hue.id="lwDnaHue";hue.type="range";hue.min="0";hue.max="359";
  hue.value=String(dnaDraft?.hue??0);hue.disabled=!pet||dnaPending||dnaPetPending;
  const row=make("label",T("Боја"),"lw-dna-field");row.append(hue);form.append(row);
  const preview=make("div",undefined,"lw-dna-color-preview");
  preview.style.background="hsl("+num(dnaDraft?.hue??0)+" 75% 52%)";
  preview.setAttribute("aria-label",T("Преглед на боја"));form.append(preview);
  form.append(make("strong",String(dnaDraft?.hue??0)+"°","lw-dna-hue-value"));
  form.append(make("p",T("Очи")));
  const eyes=make("div",undefined,"lw-dna-choice-list");
  for(let n=1;n<=5;n++){
   const b=make("button",String(n));b.type="button";b.dataset.lwDnaEye=String(n);
   b.setAttribute("aria-pressed",String(dnaDraft?.eyes===n));
   b.disabled=!pet||dnaPending||dnaPetPending;eyes.append(b);
  }
  form.append(eyes);
  form.append(make("p",T("Избери форма")));
  const shapes=make("div",undefined,"lw-dna-choice-list");
  for(const [id,name] of [["jelly","Течна"],["crystal","Кристална"],["leaf","Лисна"],["cloud","Облачна"]]){
   const b=make("button",T(name));b.type="button";b.dataset.lwDnaShape=id;
   b.setAttribute("aria-pressed",String(dnaDraft?.shape===id));
   b.disabled=!pet||dnaPending||dnaPetPending;shapes.append(b);
  }
  form.append(shapes);panel.append(form);
  if(!dna.designerUnlocked)panel.append(make("p",T("🔒 За дизајнер треба лаб. ниво 6 и миленик ниво 22.")));
  else if(!dna.designAllowed)panel.append(make("p",T("Провери ги ресурсите и условите за дизајнот.")));
  if(pet?.genomeSignature)panel.append(make("p",T("Генетски потпис")+": "+pet.genomeSignature));
  const reset=make("button",T("Врати го тековниот изглед"),"lw-dna-reset");
  reset.type="button";reset.dataset.lwDnaReset="true";
  reset.disabled=!pet||dnaPending||dnaPetPending;panel.append(reset);
  const commit=make("button",T("🧬 Примени гени · 25 молекули + 15 сознание + 1 акција"),"lw-dna-commit");
  commit.type="button";commit.dataset.lwDnaCommit="design";
  commit.disabled=!dna.designAllowed||!dnaDraft||dnaPending||dnaPetPending;
  panel.append(commit);
 }
 if(selectedDnaStation==="lineage"){
  panel.append(make("h3",T("Сите еволутивни линии")+" ("+num(available.length)+")"));
  panel.append(make("p",T("Оваа трансформација го задржува истиот миленик, возраста, меморијата и историјата.")));
  const list=make("div",undefined,"lw-dna-lineage-list");
  list.setAttribute("role","group");list.setAttribute("aria-label",T("Сите еволутивни линии"));
  for(const target of available){
   const chosen=target.id===dnaTarget;
   const btn=make("button",target.icon+" "+target.name+
    " · "+(target.ready?"✓ "+T("Услови исполнети"):"🔒 "+T("Недостасуваат услови"))+
    " · "+num(target.compoundsCost)+" "+T("Молекули"));
   btn.type="button";btn.dataset.lwDnaTarget=String(target.id);
   btn.setAttribute("aria-pressed",String(chosen));
   btn.disabled=dnaPending||dnaPetPending;
   list.append(btn);
  }
  if(!available.length)list.append(make("p",T("Нема истражени еволутивни линии.")));
  panel.append(list);
  const target=available.find(x=>x.id===dnaTarget)||null;
  if(target){
   const detail=make("div",undefined,"lw-dna-target-details");
   detail.append(make("h3",target.icon+" "+target.name));
   if(target.description)detail.append(make("p",T(target.description)));
   detail.append(make("p",T("Потребен извор")+": "+target.sourceName+
    " · "+(target.sourceMatch?"✓":"🔒")));
   detail.append(make("p",T("Цена за трансформација")+": "+num(target.compoundsCost)+" "+
    T("Молекули")+" + "+num(target.insightCost)+" "+T("Сознание")+
    " + "+num(target.labActionCost)+" "+T("Лаб. акции")));
   detail.append(make("p",T("Целна средина")+": "+target.requiredBiome+
    " · "+T("Квалитет на биосвет")+" ≥"+num(target.minQuality)+"%"));
   detail.append(make("p",T(target.hasCapacity?"Соодветен биосвет и капацитет":
    "Недостига соодветен биосвет или капацитет"),"lw-dna-criterion"));
   detail.append(make("p",T(target.resourcesOk?"Ресурсите се доволни":
    "Недостигаат ресурси или акција"),"lw-dna-criterion"));
   detail.append(make("h3",T("Услови за отклучување")));
   for(const item of target.items||[])
    detail.append(make("p",(item.ok?"✓ ":"🔒 ")+dnaLabel(item.label)+": "+item.value,"lw-dna-criterion"));
   panel.append(detail);
   const apply=make("button",T("🧬 Преобрази го избраниот миленик"),"lw-dna-commit");
   apply.type="button";apply.dataset.lwDnaCommit="transform";
   apply.disabled=!target.ready||!pet||dnaPending||dnaPetPending;
   panel.append(apply);
  }
 }
 if(dnaConfirm){
  const box=make("div",undefined,"lw-dna-confirm");
  box.setAttribute("role","group");
  box.setAttribute("aria-label",T(dnaConfirm.op==="design"?"Потврди го геномот":"Потврди трансформација"));
  box.append(make("strong",T(dnaConfirm.op==="design"?"Потврди го геномот":"Потврди трансформација")));
  box.append(make("p",T("Избран миленик")+": "+dnaConfirm.petName));
  if(dnaConfirm.targetName)box.append(make("p",T("Избрана линија")+": "+dnaConfirm.targetName));
  box.append(make("p",T(dnaConfirm.op==="design"?
    "Да ги потрошам ресурсите за трајна измена на избраниот миленик?":
    "Да го преобразам избраниот миленик и да ја задржам неговата меморија?")));
  const actions=make("div",undefined,"lw-dna-confirm-actions");
  for(const [decision,label] of [["cancel","Откажи"],["accept","Потврди"]]){
   const btn=make("button",T(label));btn.type="button";
   btn.dataset.lwDnaDecision=decision;btn.disabled=dnaPending||dnaPetPending;
   actions.append(btn);
  }
  box.append(actions);panel.append(box);
 }
 if(dnaPending||dnaPetPending)panel.append(make("p",T("ДНК операцијата е во тек…"),"lw-station-hint"));
 if(dnaFeedback)panel.append(make("p",dnaFeedback,"lw-dna-feedback"));
 const classic=make("button",T("🧬 Отвори ДНК контроли"),"lw-entrance");
 classic.type="button";classic.dataset.lwTab="dna";panel.append(classic);
 const exit=make("button",T("← Излези од 3D"),"lw-exit-world");
 exit.type="button";exit.dataset.lwTab="lab";panel.append(exit);
 labelForHud();return;
}
const info=sections[scene]||sections.lab;
document.body.classList.toggle("lw-station-focus",scene==="lab"&&Boolean(selectedStation));
panel.replaceChildren(make("h3",T(info[0])),make("p",T(info[1])));
if(scene==="lab"){
 const corridor=make("button",T("🏛️ Лабораториски комплекс"),"lw-entrance");
 corridor.type="button";corridor.dataset.lwComplex="hub";
 panel.append(corridor);
}
if(scene==="lab"&&selectedStation){
 const overview=make("button",T("↩ Цела лабораторија"),"lw-overview");
 overview.type="button";overview.dataset.lwStation="overview";panel.append(overview);
}
const stats=make("div",undefined,"lw-stats");
if(scene==="lab"){
addStat(stats,"Лаб. акции",world?.labActions);addStat(stats,"Молекули",world?.compounds);
addStat(stats,"Сознание",world?.insight);addStat(stats,"Клетки",world?.cells);
}else if(scene==="flora"){
addStat(stats,"Биомаса",world?.biomass);addStat(stats,"Квалитет",world?.habitat?.quality);
}else if(scene==="biosphere"){
addStat(stats,"Миленичиња",world?.pets);addStat(stats,"Капацитет",world?.habitat?.capacity);
addStat(stats,"Зафатено",world?.habitat?.occupied);
}else{
addStat(stats,"Сознание",world?.insight);addStat(stats,"Етапа",Number(world?.stage||0)+1);
}
panel.append(stats);
if(scene==="biosphere"&&world?.habitat?.name)panel.append(make("p",T("Биосвет: ")+String(world.habitat.name).slice(0,90)));
if(scene==="lab"){
 panel.append(make("h3",T("Работни станици")));
 const buttons=make("div",undefined,"lw-stations");
 for(const station of WORKSTATIONS){
  const b=make("button",T(station.label));
  b.type="button";b.dataset.lwStation=station.id;
  b.setAttribute("aria-pressed",String(selectedStation===station.id));
  buttons.append(b);
 }
 panel.append(buttons);
 if(!selectedStation){
  panel.append(make("p",T("Допрете станица во 3D просторијата или избери ја овде."),"lw-station-hint"));
 }else{
  const selected=WORKSTATIONS.find(st=>st.id===selectedStation);
  if(selected){
   panel.append(make("h3",T(selected.title)),make("p",T(selected.description)));
   const blocked=!world||Number(world.labActions)<1||(selected.kind==="grow"&&Number(world.stage)<2);
   addButton(selected.command,selected.kind,"",blocked||basicPending);
   if(basicPending)panel.append(make("p",T("Операцијата се извршува…"),"lw-station-hint"));
   if(blocked)panel.append(make("p",T("Недостапно во сегашната етапа")));
  }
 }
}else{
const link={flora:["🌱 Отвори флора","plants"],biosphere:["🏠 Отвори живеалишта","habitats"],research:["📚 Отвори истражувања","research"]}[scene]||["Отвори истражувања","research"];
addButton(link[0],"",link[1],!world);
}
if(resultText&&scene==="lab")panel.append(make("div",T(resultText),"lw-result"));
if(world){
 const exit=make("button",T("← Излези од 3D"),"lw-exit-world");
 exit.type="button";exit.dataset.lwTab="lab";
 panel.append(exit);
}
labelForHud();
document.getElementById("insight").textContent=num(world?.insight);
document.getElementById("trials").textContent=num(world?.day);
const metrics=document.querySelectorAll(".metric span");
if(metrics[1])metrics[1].textContent=T("ДЕН");
const english=Boolean(world?.language&&world.language!=="mk");
const setText=(selector,mk,en)=>{const n=document.querySelector(selector);if(n)n.textContent=english?en:mk;};
setText(".identity .eyebrow","ТРЕДИМЕНЗИОНАЛНА ЛАБОРАТОРИЈА · LW-D","INTERACTIVE 3D WORLD · LW-D");
setText(".identity h1 em","ЖИВ СВЕТ","LIVING WORLD");
setText(".metric span","СОЗНАНИЕ","INSIGHT");
setText(".status-dot span","• симулација","• simulation");
setText(".context-hint","↔ Повлечи за да ја завртиш 3D сцената · Нема background AI или рендер","↔ Drag to orbit the 3D scene · No background AI or rendering");
setText(".rotate strong","Заврти го телефонот хоризонтално","Rotate your phone to landscape");
setText(".rotate p","Trialum – Жив Свет е замислен за landscape искуство.","Trialum – Living World is built for landscape play.");
const dockLabels=[["Лаб","Lab"],["Флора","Flora"],["Свет","World"],["Знаење","Research"]];
document.querySelectorAll(".dockbtn small").forEach((e,i)=>{if(dockLabels[i])e.textContent=dockLabels[i][english?1:0];});
const sceneLabel=document.querySelector(".scene-type");
if(sceneLabel?.firstChild?.nodeType===3)sceneLabel.firstChild.nodeValue=english?"INTERACTIVE SCENE ":"ИНТЕРАКТИВНА СЦЕНА ";
const mkTitles={
lab:["Лабораторија на животот","Менувај ги условите и гледај како се менува фиктивниот примерок."],
flora:["Градина на новите форми","Погледни ги промените на флората во твојот биосвет."],
biosphere:["Биосвет што живее","Посматрај автономен мал свет на измислени суштества."],
research:["Центар за откритија","Секој експеримент носи ново знаење — и кога не успева."]
};
const enTitles={
lab:["Laboratory of Life","Run real game experiments and watch your world react."],
flora:["Garden of New Forms","Explore plants in your living habitat."],
biosphere:["Living Habitat","Observe your creatures in their world."],
research:["Discovery Center","Every experiment can teach you something."]
};
const newTitle=(english?enTitles:mkTitles)[scene];
if(newTitle){document.getElementById("sceneTitle").textContent=newTitle[0];document.getElementById("sceneDescription").textContent=newTitle[1];}
const badge=document.querySelector(".scene-type .pill");if(badge)badge.textContent="L2 · "+T("РЕАЛНА СОСТОЈБА");
}
panel.addEventListener("click",e=>{
const b=e.target.closest("button");
if(!b||b.disabled||!world)return;
if(b.dataset.lwAtlas==="open"){
 document.getElementById("lw-atlas-toggle")?.click();return;
}
if(["biosphere","flora","research"].includes(b.dataset.lwPortal)){
 document.querySelector('.dockbtn[data-scene="'+b.dataset.lwPortal+'"]')?.click();return;
}
if(b.dataset.lwComplex){
 const room=COMPLEX_ROOMS.find(r=>r.id===b.dataset.lwComplex);
 if(b.dataset.lwComplex==="hub"||room?.id==="basic"||(room?.id==="dna"&&root.TrialumLWDnaWebGLReady===true)||(room?.id==="foodlab"&&root.TrialumLWFoodWebGLReady===true)||(room?.id==="floralab"&&root.TrialumLWFloraWebGLReady===true)||(room?.id==="research"&&root.TrialumLWResearchWebGLReady===true)){
  root.dispatchEvent(new CustomEvent("trialum:lw:complex-room",{detail:{room:b.dataset.lwComplex}}));
 }else if(room?.tab){
  root.parent.postMessage({type:"trialum:lw:classic",tab:room.tab},origin);
 }
 return;
}
if(b.dataset.lwResearchStation){
 if(!researchPending&&["disciplines","upgrade","discoveries","archive"].includes(b.dataset.lwResearchStation)){
  researchConfirm=null;researchFeedback="";
  root.dispatchEvent(new CustomEvent("trialum:lw:select-research-station",
   {detail:{id:b.dataset.lwResearchStation}}));
 }
 return;
}
if(b.dataset.lwResearchField){
 const id=String(b.dataset.lwResearchField);
 if(!researchPending&&(world?.research?.fields||[]).some(f=>f.id===id)){
  researchSelectedField=id;researchConfirm=null;researchFeedback="";render();
 }
 return;
}
if(b.dataset.lwResearchInvent){
 const kind=String(b.dataset.lwResearchInvent);
 if(!researchPending&&["food","flora","material","fauna"].includes(kind)){
  researchSelectedInvent=kind;researchConfirm=null;researchFeedback="";render();
 }
 return;
}
if(b.dataset.lwResearchMaterial){
 const id=String(b.dataset.lwResearchMaterial);
 if(!researchPending&&(world?.research?.materials||[]).some(m=>m.id===id)){
  researchSelectedMaterial=id;researchConfirm=null;researchFeedback="";render();
 }
 return;
}
if(b.dataset.lwResearchCommit){
 if(researchPending||researchConfirm||complexRoom!=="research")return;
 const op=String(b.dataset.lwResearchCommit),r=world?.research;
 if(!r)return;
 let payload=null,label="";
 if(op==="study"){
  const field=(r.fields||[]).find(f=>f.id===researchSelectedField);
  if(!field?.canStudy)return;
  payload={field:field.id};label=T(field.name);
 }else if(op==="upgrade"){
  if(!r.next?.canUpgrade)return;
  payload={};label=T(r.next.name)+" · "+T("Ниво")+" "+num(r.next.level);
 }else if(op==="invent"){
  const kind=researchSelectedInvent,v=r.inventions?.[kind];
  if(!v?.can)return;
  payload={kind};
  if(kind==="fauna")payload.petId=String(r.pet?.id||"");
  label=T({food:"Нова храна",flora:"Нова флора",material:"Нов материјал",fauna:"Нова фауна"}[kind]);
 }else if(op==="craft"){
  const m=(r.materials||[]).find(x=>x.id===researchSelectedMaterial);
  if(!m?.canCraft)return;
  payload={material:m.id};label=T(m.name);
 }else return;
 researchConfirm={op,payload,label};researchFeedback="";render();return;
}
if(b.dataset.lwResearchDecision){
 if(researchPending||!researchConfirm)return;
 const decision=String(b.dataset.lwResearchDecision);
 if(decision==="cancel"){researchConfirm=null;render();return;}
 if(decision!=="accept")return;
 const pending=researchConfirm,r=world?.research;
 const p=pending.payload;
 const ready=pending.op==="study"?(r?.fields||[]).some(f=>f.id===p.field&&f.canStudy):
  pending.op==="upgrade"&&r?.next?.canUpgrade===true||
  pending.op==="invent"&&r?.inventions?.[p.kind]?.can===true&&
    (p.kind!=="fauna"||String(r.pet?.id||"")===p.petId)||
  pending.op==="craft"&&(r?.materials||[]).some(m=>m.id===p.material&&m.canCraft);
 if(!ready){
  researchConfirm=null;researchFeedback=T("Нема доволно ресурси или предуслови.");render();return;
 }
 researchConfirm=null;researchPending=true;researchFeedback="";render();
 root.parent.postMessage({type:"trialum:lw:research",op:pending.op,payload:p},origin);
 return;
}
if(b.dataset.lwFloraCommit){
 if(floraPending||floraConfirm||complexRoom!=="floralab")return;
 const op=String(b.dataset.lwFloraCommit);
 const plant=(world?.flora?.plants||[]).find(x=>x.id===selectedFloraModel);
 const habitat=world?.flora?.habitat||null;
 if(!plant||!["invent","plant"].includes(op))return;
 if(op==="invent"&&!plant.canInvent)return;
 if(op==="plant"&&(!plant.canPlant||!habitat?.id))return;
 floraConfirm={op,species:plant.id,name:plant.name,
  habitatId:op==="plant"?String(habitat.id):null};
 floraFeedback="";render();return;
}
if(b.dataset.lwFloraDecision){
 if(!floraConfirm||floraPending)return;
 const decision=String(b.dataset.lwFloraDecision);
 if(decision==="cancel"){floraConfirm=null;render();return;}
 if(decision!=="accept")return;
 const pending=floraConfirm,plant=(world?.flora?.plants||[]).find(x=>x.id===pending.species);
 const habitat=world?.flora?.habitat;
 if(!plant||(pending.op==="invent"&&!plant.canInvent)||
   (pending.op==="plant"&&(!plant.canPlant||!habitat||
      String(habitat.id)!==pending.habitatId))){
  floraConfirm=null;floraFeedback=T("Избраниот биосвет или ресурсите се променети.");render();return;
 }
 floraConfirm=null;floraPending=true;floraFeedback="";render();
 root.parent.postMessage({type:"trialum:lw:flora",op:pending.op,
  payload:{species:pending.species,habitatId:pending.habitatId}},origin);
 return;
}
if(b.dataset.lwFloraModel){
 const id=String(b.dataset.lwFloraModel);
 if(!floraPending&&(world?.flora?.plants||[]).some(x=>x.id===id)){selectedFloraModel=id;floraConfirm=null;floraFeedback="";render();}
 return;
}
if(b.dataset.lwFloraStation){
 if(["seedbank","scanner","growth"].includes(b.dataset.lwFloraStation)&&!floraPending){
  floraConfirm=null;floraFeedback="";
  root.dispatchEvent(new CustomEvent("trialum:lw:select-flora-station",{detail:{id:b.dataset.lwFloraStation}}));
 }
 return;
}
if(b.dataset.lwFoodPicker==="toggle"){
 if(!foodPending){foodPickerOpen=!foodPickerOpen;foodConfirm=null;render();}
 return;
}
if(b.dataset.lwFoodRecipe){
 const id=String(b.dataset.lwFoodRecipe);
 if(!foodPending&&(world?.food?.recipes||[]).some(rec=>rec.id===id)){
  selectedFoodRecipe=id;foodPickerOpen=false;foodConfirm=null;foodFeedback="";render();
 }
 return;
}
if(b.dataset.lwFoodCommit){
 if(foodPending||complexRoom!=="foodlab"||foodConfirm)return;
 const op=String(b.dataset.lwFoodCommit);
 const rec=(world?.food?.recipes||[]).find(x=>x.id===selectedFoodRecipe);
 if(!rec||(op!=="craft"&&op!=="feed"))return;
 if(op==="craft"&&!rec.canCraft)return;
 if(op==="feed"&&(!rec.canFeed||!world?.food?.selectedPet?.id))return;
 foodConfirm={op,recipe:rec.id,petId:op==="feed"?String(world.food.selectedPet.id):null};
 foodPickerOpen=false;render();return;
}
if(b.dataset.lwFoodDecision){
 const decision=String(b.dataset.lwFoodDecision);
 if(!foodConfirm||foodPending)return;
 if(decision==="cancel"){foodConfirm=null;render();return;}
 if(decision!=="accept")return;
 const pending=foodConfirm,rec=(world?.food?.recipes||[]).find(x=>x.id===pending.recipe);
 const pet=world?.food?.selectedPet;
 // Check the snapshot again before executing a saved-world action.
 if(!rec||(pending.op==="craft"&&!rec.canCraft)||
     (pending.op==="feed"&&(!rec.canFeed||!pet||String(pet.id)!==pending.petId))){
  foodConfirm=null;foodFeedback=T("Недостигаат ресурси или акции");render();return;
 }
 foodConfirm=null;foodPending=true;foodFeedback="";render();
 root.parent.postMessage({type:"trialum:lw:food",op:pending.op,
  payload:{recipe:pending.recipe,petId:pending.petId}},origin);
 return;
}
if(b.dataset.lwFoodStation){
 if(["synthesis","analysis","storage"].includes(b.dataset.lwFoodStation)){
  foodConfirm=null;foodPickerOpen=false;foodFeedback="";
  root.dispatchEvent(new CustomEvent("trialum:lw:select-food-station",{detail:{id:b.dataset.lwFoodStation}}));
 }
 return;
}
if(b.dataset.lwDnaPet){
 const id=String(b.dataset.lwDnaPet),dna=world?.dna;
 if(dnaPending||dnaPetPending||complexRoom!=="dna"||dnaConfirm)return;
 if(!(dna?.pets||[]).some(x=>x.id===id))return;
 if(dna.currentPet?.id===id)return;
 dnaPetPending=true;dnaFeedback="";render();
 root.parent.postMessage({type:"trialum:lw:dna-select-pet",id},origin);
 return;
}
if(b.dataset.lwDnaStation){
 if(!dnaPending&&!dnaPetPending&&["scan","design","lineage"].includes(b.dataset.lwDnaStation)){
  dnaConfirm=null;
  root.dispatchEvent(new CustomEvent("trialum:lw:select-dna-station",{detail:{id:b.dataset.lwDnaStation}}));
 }
 return;
}
if(b.dataset.lwDnaEye){
 const n=Number(b.dataset.lwDnaEye);
 if(!dnaPending&&!dnaPetPending&&dnaDraft&&Number.isInteger(n)&&n>=1&&n<=5){
  dnaDraft.eyes=n;dnaConfirm=null;render();
 }
 return;
}
if(b.dataset.lwDnaShape){
 const shape=String(b.dataset.lwDnaShape);
 if(!dnaPending&&!dnaPetPending&&dnaDraft&&["jelly","crystal","leaf","cloud"].includes(shape)){
  dnaDraft.shape=shape;dnaConfirm=null;render();
 }
 return;
}
if(b.dataset.lwDnaReset==="true"){
 const pet=world?.dna?.currentPet;
 if(pet&&!dnaPending&&!dnaPetPending){
  dnaDraft={hue:Number(pet.hue)||0,eyes:Number(pet.eyes)||1,shape:pet.shape};
  dnaConfirm=null;render();
 }
 return;
}
if(b.dataset.lwDnaTarget){
 const id=Number(b.dataset.lwDnaTarget);
 if(!dnaPending&&!dnaPetPending&&(world?.dna?.targets||[]).some(x=>x.id===id)){
  dnaTarget=id;dnaConfirm=null;dnaFeedback="";render();
 }
 return;
}
if(b.dataset.lwDnaCommit){
 const op=b.dataset.lwDnaCommit,dna=world?.dna,pet=dna?.currentPet;
 if(dnaPending||dnaPetPending||dnaConfirm||complexRoom!=="dna"||!pet)return;
 let payload=null,targetName=null;
 if(op==="design"){
  if(!dna.designAllowed||!dnaDraft)return;
  payload={petId:String(pet.id),hue:dnaDraft.hue,eyes:dnaDraft.eyes,shape:dnaDraft.shape};
 }else if(op==="transform"){
  const chosen=(dna.targets||[]).find(x=>x.id===dnaTarget);
  if(!chosen?.ready)return;
  payload={petId:String(pet.id),target:chosen.id};
  targetName=chosen.name;
 }else return;
 dnaConfirm={op,payload,petId:String(pet.id),petName:pet.name,targetName};
 dnaFeedback="";render();return;
}
if(b.dataset.lwDnaDecision){
 if(!dnaConfirm||dnaPending||dnaPetPending)return;
 const decision=String(b.dataset.lwDnaDecision);
 if(decision==="cancel"){dnaConfirm=null;render();return;}
 if(decision!=="accept")return;
 const pending=dnaConfirm,dna=world?.dna;
 if(String(dna?.currentPet?.id||"")!==pending.petId||
    (pending.op==="design"&&!dna.designAllowed)||
    (pending.op==="transform"&&!(dna.targets||[]).some(x=>x.id===pending.payload.target&&x.ready))){
  dnaConfirm=null;dnaFeedback=T("Недостигаат услови или избраниот миленик е променет.");render();return;
 }
 dnaConfirm=null;dnaPending=true;dnaFeedback="";render();
 root.parent.postMessage({type:"trialum:lw:dna",op:pending.op,payload:pending.payload},origin);
 return;
}
if(b.dataset.lwStation){
 const id=b.dataset.lwStation==="overview"?null:b.dataset.lwStation;
 if(id===null||WORKSTATIONS.some(item=>item.id===id))
  root.dispatchEvent(new CustomEvent("trialum:lw:select-station",{detail:{id}}));
 return;
}
if(b.dataset.lwAction&&["synthesize","analyze","harvest","grow"].includes(b.dataset.lwAction)){
if(basicPending)return;
basicPending=true;resultText="";render();
root.parent.postMessage({type:"trialum:lw:action",kind:b.dataset.lwAction},origin);
}else if(b.dataset.lwTab&&["lab","plants","habitats","research","dna","food"].includes(b.dataset.lwTab)){
root.parent.postMessage({type:"trialum:lw:classic",tab:b.dataset.lwTab},origin);
}
});
panel.addEventListener("input",event=>{
 const t=event.target;
 if(!dnaDraft||dnaPending||dnaPetPending)return;
 if(t.id==="lwDnaHue"){
  dnaDraft.hue=Math.max(0,Math.min(359,Math.floor(Number(t.value)||0)));
  dnaConfirm=null;
  const output=panel.querySelector(".lw-dna-hue-value");
  if(output)output.textContent=dnaDraft.hue+"°";
  const preview=panel.querySelector(".lw-dna-color-preview");
  if(preview)preview.style.background="hsl("+dnaDraft.hue+" 75% 52%)";
 }
});
for(const b of document.querySelectorAll("[data-scene]"))b.addEventListener("click",()=>{resultText="";render();});
root.addEventListener("trialum:lw:complex-room-changed",event=>{
 // A brief visible HUD arrival cue, not a timed operation or persisted state.
 panel.classList.remove("lw-room-arrival");
 void panel.offsetWidth;
 panel.classList.add("lw-room-arrival");
 complexRoom=["hub","dna","foodlab","floralab","research"].includes(event.detail?.room)?event.detail.room:"basic";
 selectedStation=null;selectedDnaStation=null;selectedFoodStation=null;selectedFloraStation=null;selectedResearchStation=null;
 foodConfirm=null;foodPickerOpen=false;floraConfirm=null;dnaConfirm=null;researchConfirm=null;
 resultText="";
 render();
});
root.addEventListener("trialum:lw:complex-door",event=>{
 const id=event.detail?.roomId,tab=event.detail?.tab;
 if(COMPLEX_ROOMS.some(room=>room.id===id&&room.tab===tab)&&tab){
  root.parent.postMessage({type:"trialum:lw:classic",tab},origin);
 }
});
root.addEventListener("trialum:lw:research-station-changed",event=>{
 selectedResearchStation=["disciplines","upgrade","discoveries","archive"].includes(event.detail?.id)?event.detail.id:null;
 researchConfirm=null;render();
});
root.addEventListener("trialum:lw:flora-station-changed",event=>{
 selectedFloraStation=["seedbank","scanner","growth"].includes(event.detail?.id)?event.detail.id:null;
 render();
});
root.addEventListener("trialum:lw:food-station-changed",event=>{
 selectedFoodStation=["synthesis","analysis","storage"].includes(event.detail?.id)?event.detail.id:null;
 render();
});
root.addEventListener("trialum:lw:dna-station-changed",event=>{
 selectedDnaStation=["scan","design","lineage"].includes(event.detail?.id)?event.detail.id:null;
 render();
});
root.addEventListener("trialum:lw:station-changed",event=>{
 selectedStation=WORKSTATIONS.some(item=>item.id===event.detail?.id)?event.detail.id:null;
 resultText="";render();
});
root.addEventListener("message",event=>{
if(event.source!==root.parent||event.origin!==origin)return;
const message=event.data;if(!message||typeof message!=="object")return;
if(message.type==="trialum:lw:state"&&message.world&&typeof message.world==="object"){world=message.world;document.documentElement.lang=world.language==="en"?"en":"mk";root.dispatchEvent(new CustomEvent("trialum:lw:real-world",{detail:{language:world.language,compounds:world.compounds,insight:world.insight,pets:world.pets,biomass:world.biomass,dna:world.dna,food:world.food,flora:world.flora,research:world.research}}));render();}
else if(message.type==="trialum:lw:research-result"){
 researchPending=false;researchConfirm=null;
 const op=String(message.op||""),ok=message.result?.ok===true;
 researchFeedback=(ok?"✅ ":"⚠ ")+String(message.result?.message||"").slice(0,240);
 if(["study","upgrade","invent","craft"].includes(op))
  root.dispatchEvent(new CustomEvent("trialum:lw:research-process-result",{
   detail:{seq:message.seq,op,ok,before:message.before,after:message.after}
  }));
 render();
}
else if(message.type==="trialum:lw:flora-result"){
 floraPending=false;floraConfirm=null;
 const op=String(message.op||""),ok=message.result?.ok===true;
 floraFeedback=(ok?"✅ ":"⚠ ")+String(message.result?.message||"").slice(0,240);
 if(["invent","plant"].includes(op))
  root.dispatchEvent(new CustomEvent("trialum:lw:flora-process-result",{
   detail:{seq:message.seq,op,ok,species:message.species,before:message.before,after:message.after}
  }));
 render();
}
else if(message.type==="trialum:lw:food-result"){
 foodPending=false;foodConfirm=null;
 const op=String(message.op||""),ok=message.result?.ok===true;
 foodFeedback=(ok?"✅ ":"⚠ ")+String(message.result?.message||"").slice(0,240);
 if(["craft","feed"].includes(op))
  root.dispatchEvent(new CustomEvent("trialum:lw:food-process-result",{
   detail:{seq:message.seq,op,ok,recipe:message.recipe,before:message.before,after:message.after}
  }));
 render();
}
else if(message.type==="trialum:lw:dna-pet-result"){
 dnaPetPending=false;dnaConfirm=null;
 const ok=message.result?.ok===true;
 dnaFeedback=(ok?"✅ ":"⚠ ")+String(message.result?.message||"").slice(0,240);
 render();
}
else if(message.type==="trialum:lw:dna-result"){
 dnaPending=false;dnaConfirm=null;
 const op=String(message.op||""),ok=message.result?.ok===true;
 dnaFeedback=(ok?"✅ ":"⚠ ")+String(message.result?.message||"").slice(0,240);
 root.dispatchEvent(new CustomEvent("trialum:lw:dna-process-result",{
  detail:{seq:message.seq,op,ok,before:message.before,after:message.after}
 }));
 render();
}
else if(message.type==="trialum:lw:result"){
 basicPending=false;
 resultText=String(message.result?.message||"").slice(0,260);
 const kind=String(message.kind||"");
 if(["synthesize","analyze","harvest","grow"].includes(kind)){
  root.dispatchEvent(new CustomEvent("trialum:lw:process-result",{
   detail:{seq:message.seq,kind,ok:message.result?.ok===true,before:message.before,after:message.after}
  }));
 }
 render();
}
});
root.parent.postMessage({type:"trialum:lw:ready"},origin);
render();
})(globalThis);
