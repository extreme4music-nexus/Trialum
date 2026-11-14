# LW-D — ЕТАПЕН ПЛАН / DELIVERY PLAN
**Датум:** 14.11.2026
**Име:** Триалум – Жив Свет / Trialum – Living World
**Извор:** TRIALUM_LIVING_WORLD_VISION_20261114.md

Овој план е **предлог за поделба на имплементацијата на мали проверливи целини**. Самата визија е сопственичка; технолошките избори и секое физичко прифаќање ги потврдува сопственикот. Нема гаранција за еднонеделна испорака, нема автоматски merge или Store публикација.

## Главни насоки

1. **Scene-first од прв екран:** светот е главниот интерфејс, не табела.
2. **Прво зачувај, па менувај:** IndexedDB/backup/restore и претходните идентитети остануваат валидни.
3. **Render и simulation се одвоени:** невидлива сцена нема скапа анимација, неактивна апликација нема AI.
4. **Едукативно, не манипулативно:** научен метод, кратки игриви задачи и контрола на времето и известувањата.
5. **Две вистински патеки:** AI OFF = валидна игра; AI ON = дополнителна интелигенција по доброволна согласност.
6. **Никакви непрегледани јавни/серверски промени:** без production, migration, Play upload и signing промени во prototyping.
7. **Секој PR:** едно јасно ограничено парче, CI + рачни проверки, explicit owner review.

## Етапа D0 — Концепт и почетен интерактивен прототип (СЕГА)

**Цел:** канонски запис на визијата, карта на системите и изолиран landscape/scene-first експеримент. Се создава нов простор за прототип, а не директна замена на постојното index.html.

**Испораки:**
- овој документ и визијата поврзани во Living World roadmap;
- картирана зависност: UI → scene state → simulation actions → save → optional AI intent;
- првиот прототип да може да се отвори локално, да прикаже голема сцена и да даде визуелна реакција на истражувачка контрола;
- основни tests/валидатори за изолираниот прототип без промена на save schema.

**Gate:** сопственикот прегледува визуелна насока/контроли пред да го замениме стариот UI. Нема Android orientation lock или APK во D0.

## Етапа D1 — Landscape-first UX школка

- Прв екран: свет, лабораторија или избран биом; компактна статусна лента, контекстни контроли, мени скриено зад една јасна акција.
- Зони: лабораторија, истражување, флора, биосвет, DNA, дом, игротека; визуелен премин без долг текстуален dashboard.
- Third-person камера, zoom/orbit/tap; адаптација на 4:3, 16:10, 16:9, 21:9, insets и големи екрани.
- MK/EN паритет, големи touch-targets, објаснување преку слики и звук по избор, reduced motion.
- Реален Android landscape mode дури кога сите критични екрани/backup dialogs ќе функционираат.
**Gate:** физички landscape QA на Android, без губење на податоци и без скриен дијалог.

## Етапа D2 — Видливи експерименти и учење

- Анимирана лабораторија, ракување со услови и конкретен видлив резултат; задачите следат хипотеза → тест → исход → научна поука.
- Истражувања, молекули, флора, екосистеми; точни факти јасно одвоени од фантастичен Trialum свет.
- Грешките создаваат повратна информација/алтернативни исходи, не токсично казнување.
**Gate:** корисник може да научи 1 јасна реална биолошка поука во сесија од 5–10 минути, без примарно текстуално мени.

## Етапа D3 — Траен офлајн симулациски engine

- Еден дефиниран симулациски clock; bounded catch-up по часови/денови, idempotent награди/храна/стареење.
- Локална лабораторија за дневна храна, капацитет и видови храна; ниту една базична функција не бара токени.
- Renderer-pausing, battery saver, save schema migration compatibility и backup/restore.
**Gate:** тестовите со 1 час, 1 ден, 30 дена offline не прават дупликати, негативни ресурси или battery drain од active render/AI.

## Етапа D4 — Вистински 3D свет и визуелни анимации

- Избор на најсоодветна WebGL/WebGPU/Android pipeline откако ќе ги измериме перформансите на целните уреди.
- Landscape 3D дом, флора, биосвет и игралишта; адаптивен detail, вистински тродимензионална third-person камера, светла и интеракции.
- Активен рендер само во видлив foreground; контекстно уништување/рекреација на GPU ресурси.
**Gate:** стабилно на реален Galaxy A55 со прифатливи батерија/термални параметри и fallback на послаби уреди. Не тврдиме 60 FPS без мерење.

## Етапа D5 — Генетски простор и emergent живи форми

- Procedural genotype/phenotype, deterministic seed, environment/resource constraints, предодредени рани видови и отворени доцни комбинации.
- AI за креативни предлози само со opt-in; строг валидатор на светски правила; нема реални DNA процедури.
- Мутација со ист pet ID и сочувана меморија, backup и social references.
**Gate:** уникатен валиден генотип и преглед „зошто“, без дупликати или експлоити.

## Етапа D6 — Социјален свет, подарување и позајмување

- Owner-authoritative pet transfer records; подарување со експлицитна двострана согласност и audit trace; рокови за loan со автоматско истекување.
- Без продажба на миленичиња, без враќање зависно од позајмувач; offline lease/reconciliation ограничувања јасно дефинирани.
- Јавен marketplace НЕ е автоматски вклучен; прво детска безбедност, moderation, consent и anti-abuse.
**Gate:** два уреда, истекување на заем, затворена апликација, offline/reconnect и без загубено/дуплирано милениче.

## Етапа D7 — Интегриран AI, приватна меморија и избор

- AI OFF секогаш функционално; AI ON само отклучен/инсталиран/одобрен модел и ограничена контекстна интелигенција.
- При интеракција: AI намери → валидатор → симулација → сцена. При background: AI инстанца исклучена.
- Семантички дневни спомени со стабилни идентитети; приватни разговори не излегуваат од телефонот.
- Преглед на постојниот native background-LLM експеримент и негово деактивирање пред конечен нов runtime, без забрана на лесна rule-simulation.
**Gate:** без мрежно протекување на приватен контекст, CPU/battery ограничувања, AI on/off тестови и смислена контекстна комуникација.

## Етапа D8 — Одговорно дистрибуирање и Google Play

- Google Developer account е веќе создаден. Проверка на неговата актуелна верификација/тест-услови, не нова регистрација.
- Play Games optional account linking без лозинки, offline-first, storage/export и без наметнување cloud.
- Google Play Families, Data Safety, AI/social moderation и приватност (вклучително малолетни), QA на повеќе уреди, accessibility и crash/thermal проверки.
- Без надворешни реклами, без реални токенски плаќања, без manipulative notifications.
**Gate:** owner-approved signed candidate, тестери и Store-review документација; никаква автоматска production публикација.

## Што НЕ правиме во D0

- Не менуваме Android signer/cert ID, package IDs, server/Postgres, OAuth, Google Play, push keys.
- Не бришеме стар UI, save/export систем или претходни LW-C branches; LW-C draft PR #47 и неговиот owner QA се следат одделно.
- Не правиме „сè завршено“ само по зелено GitHub Actions.

## Измерливи приемни критериуми

| Група | Доказ |
| --- | --- |
| Интерфејс | 4:3 / 16:9 / 21:9, safe insets, touch controls, нема важен текст скриен |
| Рендер | foreground visible only, screenshot/record draw stop on background |
| Симулација | offline replay 1h/1d/30d; без дупликат XP/food/pets |
| Лабораторија | визуелен исход + кратко научно објаснување, различни исходи на различни параметри |
| AI | opt-out без губење функционалност, zero inference во background |
| Приватност | не напушта телефонот приватен user–pet разговор |
| Етика | без streak/reward pressure; сè OFF известувања |
| Податоци | стар JSON backup се враќа и останува валиден |

## Design research белешки

- Android game guidance: landscape across different aspect ratios, cutouts and changes; нема претпоставка дека еден фиксен мобилен екран е доволен.
- Google Play Families: content, Data Safety, privacy and social interactions by target audience; ова е задолжителна review тема, не сертификат на усогласеност.
- Образовен UX: интерактивни биомови и виртуелни лаборатории како тип на искуство, без туѓи асети или идентични екрани.
- Извори:
  - https://developer.android.com/games/guidelines
  - https://developer.android.com/develop/adaptive-apps/guides/app-orientation-aspect-ratio-resizability
  - https://support.google.com/googleplay/android-developer/answer/9893335
  - https://www.labster.com/simulations/biomes
  - https://ssec.si.edu/habitats


## Current progress — D1 experimental live shell (14 Nov 2026)

The owner accepted the D0 UX direction and specifically requested distinct visual scenes and contextual laboratory HUDs. D1 is now implemented on a **separate experimental branch** and is NOT merged into main. It:
- adds an opt-in 3D landscape overlay without removing the old dashboard;
- reads a bounded snapshot from the original \`app.js\` and shows actual day/resources, habitat capacity and pet counts;
- routes only whitelisted real laboratory actions to \`E.basicResearch\` plus the existing save/render/notice path, avoiding a second progression/economy;
- keeps existing backup/restore, package IDs, Android owner signers and private server untouched;
- offers scene-local contextual actions for laboratory/flora/biosphere/research, with live molecule and pet-count display;
- bundles these scene assets in the Android WebView APK build pattern and PWA offline assets;
- adds CI syntax and regression checks.

**Known limitations:** the 3D meshes are stylized placeholders, not yet true individual pet models or biological lab instruments. No Android landscape lock yet. A green Node CI check does not verify Android GPU, low-end device performance, touch accessibility, context loss, live action flow or background power use. Do not call this owner accepted D1.

The default game stays unchanged; D1 is entered by the explicit "✦ Жив Свет · 3D" button on the feature branch.
