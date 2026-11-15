> **CRITICAL OWNER DIRECTIVE — 2026-11-15, ADR-005 OVERRIDES OLDER B1/B9 STATUS:** [owner ADR-005](https://github.com/extreme4music-nexus/Trialum/blob/main/docs/ADR_005_OWNER_DIRECTIVE_B1_PHOTOREALISM_AND_FULL_3D_MIGRATION_20261115.md) · [B1 actual phone defects + R1–R5](https://github.com/extreme4music-nexus/Trialum/blob/main/docs/TRIALUM_B1_OWNER_REWORK_GLB_BLACK_SCREEN_AND_VISUAL_QA_20261115.md) · [complete 3D conversion roadmap](https://github.com/extreme4music-nexus/Trialum/blob/main/docs/TRIALUM_3D_COMPLETE_CONVERSION_AFTER_B1_OWNER_ROADMAP_20261115.md). **B1 = OWNER-DIRECTED REWORK/BLOCKED FOR PHASE ADVANCE** after actual Galaxy A55 video showed unexpected GLB fallback, blank WebGL during quality changes, misleading RAF FPS, HUD/system-bar overlap and camera issues. Do **NOT** abandon GLB/Three.js path, do **NOT** call B1 owner-PASS from signed CI #176. Repair B1 until working **high-photorealistic quality and functionality** on the real phone; owner approval required. THEN B2/B3 engineering prerequisites → COMPLETE Agro ground-floor 3-room building (B4–B9) → RETROFIT first-floor five-door Laboratory Lobby and labs → world-wide 3D conversion. All original engine, save, food, pets, opt-in AI/friends, old five labs, signed QA identity protected. This step is documentation only; no code fixes/builds implied.

> **MANDATORY OWNER 3D ARCHITECTURE — 15 NOVEMBER 2026** — [B0–B9 master](TRIALUM_3D_WORLD_MASTER_PLAN_B0_B9_20261115.md) · [GLB/Scene contract](TRIALUM_3D_ASSET_SCENE_CONTRACT_20261115.md) · [3D gates & OWNER PASS](TRIALUM_3D_PHASE_GATES_20261115.md) · [ADR-004 renderer pilot](ADR_004_GLTF_FIRST_THREEJS_PILOT_20261115.md). Canonical **GLB-first whitebox plan with core/scene/renderer separation**, 1 unit=1 metre, named anchors/sockets, mobile-controlled PBR and a measured **Three.js pilot before any replacement of existing NovaGL2**. After the owner's explicit full L3.9 plant-engine PASS (signed GitHub QA #171), the only next implementation is **B0 baseline freeze**, then B1 measured renderer pilot, B2 model validation, B3 world/bridge, B4 real 3-door ground-floor Agro Lobby, B5 Food Warehouse, B6 Garden shell, B7 Garden actions, B8 PhytoLab and B9 environment/quality. **NO future B-stage may be skipped without recorded owner approval; CI PASS does not imply OWNER PASS.** Preserve five upper labs, original engine, save/food/pets/friends and trusted GitHub SignQA signing. These are binding docs, not yet implemented renderer code/branch-protection.

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
