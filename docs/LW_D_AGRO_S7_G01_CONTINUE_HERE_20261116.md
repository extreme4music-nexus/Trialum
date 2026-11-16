> **LATEST AQUATIC OWNER CORRECTION (16 NOV 2026):** По камерата, G-01 МОРА да има **анимирана 3Д вода + реални водни растенија** низ сите канонски фази. Изготвен е нов **S7 G01 Aquatic review**: [водена анимација и Аквалум фази](LW_D_AGRO_S7_G01_WATER_ANIMATION_AQUAGLOW_STAGES_20261116.md) + [машинска visual map](blueprints/S7_G01_AQUATIC_VISUAL_MAP_20261116.json). Работна гранка `feature/lw-d-agro-s7-g01-aquaglow-water-animation-20261116` врз камера PR #86; генератор `tools/b1/build-agro-g01-aquatic.py`, седум прегледни GLB: **1 анимирана вода (4 surface meshes, morph targets + 6s animation) + 4 Aquaglow growth stages + weakened + dead**. Единствен вид `aquaglow` / **Аквалум**, aquarium 4 слота, engine `s.agro.gardenPlants`. **G01 review assets НЕ се инсталирани во #262 APK.** Продолжи од G01 Aquarium PR #87; провери CI artifact и owner render verdict, НЕ имплементирај нова флора/economy.

# TRIALUM LW-D S7 G-01 — CONTINUE HERE · 16 NOV 2026

## Тековна вистинска состојба
**Сопственикот лично инсталираше, тестираше и го пофали S7 празниот шепест стакленик** (5+ и „одлично е“). Прифати го ова како owner positive visual acceptance за празната школка S7.1/S7.2, **со забелешка дека default камерата треба да биде поблиску одвнатре**.

**Нова гранка:** `feature/lw-d-agro-s7-g01-watercore-camera-20261116`, создадена врз owner-tested празната градина од `feature/lw-d-agro-s7-empty-greenhouse-shell-apk-20261116`, [PR #85](https://github.com/extreme4music-nexus/Trialum/pull/85), signed run #259.

**Готово во оваа гранка (не тврди physical PASS):**
1. Код на camera: почеток внатре `[0,3.3,12.2]` со target `[0,2.35,0]`; pinch/wheel zoom-out max 108; приближување на G-01..G-05 со HUD; тап на вистинскиот GLB floor во коридор ја фокусира таа гранка; portal Back останува безбеден.
2. Создаден оригинален фотореалистичен дневен концептен рендер за **G-01 централна водна градина**. PNG е доставен во разговорот како посебен attachment/ZIP и не е commit-уван во GitHub.
3. Пет одделни вистински GLB кандидати преку `tools/b1/build-agro-g01-watercore.py` (документирани во `docs/LW_D_AGRO_S7_G01_WATERCORE_20261116.md`), CI output **само** во `build/g01-watercore/`. Нема внесување на props во играта пред owner visual review. Разговорот исто има посебен ZIP со 5 прегледни GLB и слика. CI-авторираниот GLB може да се разликува во оптимизацијата; **GitHub CI output е канонски за идно инсталирање**.
4. Нов S7 G01 тест на камера/GLB/безбедно раздвојување. GitHub workflow генерира **посебен G01 review artifact** и потпишува само претходно одобрена SignQA QA апликација со поправен camera код, не со визуелните предмети.

**Уште НЕ ГОТОВО:** GLB G01 поставени во игра, изрежан реалниот shell floor за вкопани базени, движечки вода/пумпи, поврзана оригинална engine логика, B7 автономија/болести/вода-трошоци, G02–05 предмети. Нема B7 game state writes.

## Упатство за следното чатче — без губење работа

1. Провери приватно `extreme4music-nexus/Trialum`, оваа гранка и нејзиниот PR. Види дали Github Actions pipeline за camera+G01 има **PASS**, GitHub run и потпишан QA artifact. Ако има CI FAIL, преземи job logs и поправи го вистинскиот проблем; нема ненајавено прескокнување на тестови. Дај **точна** нова потпишана QA APK за проверка на камерата, не стар S7 #259.
2. Сопственикот го прегледува G01 визуелниот рендер. Прашањето е дали тој одговара на замисленото централизирано водно јадро, мост, патеки, сервисни машини и растителни водни места. Сè додека не даде визуелен owner PASS, петте G01 кандидати се **staged GLBs**, а не live props.
3. По одобрување, почни **само G01-M1**, вкопан голем базен. Пред монтажа, **мора да се исече соодветен отвор во сегашниот цврст floor GLB**, бидејќи без тој чекор ќе има z-fighting или водата ќе биде под подот. Постави main basin со 4 празни engine slot sockets, не 4 нови растенија; пробај на реалниот Android, owner PASS.
4. После тоа G01-M2 мали базени, M3 патеки/огради, M4 мост, M5 пумпи, G01-G анимации/осветлување — **секој** посебен render→GLB→place→QA→owner verdict.
5. Дури после готов и прифатен G01 премини на G-02 расадник. Потоа три гранки G-03..G-05; B7 вистинска plant логика оди последна по одобрени правила.
6. Во секоја нова сесија ажурирај го овој документ со новите SHA/PR/CI run, точен status и owner verdict.

## Не менувај
- S7 празната шепа и тесниот Agro Atrium mid-door portal.
- 4 engine terrestrial beds × 5 + 4 aquatic engine slots, ниту нови „слотови“ од три декоративни базени.
- Original plant engine `s.agro.seedlings`, `s.agro.gardenPlants`, `h.flora[]`; original backup.
- S6 Food Warehouse, Play / release IDs, Firebase, signed package IDs, server, број на миленичиња.
- Прифатените сценски шеми и научно-органски стил.

**Почни со документацијата, репото и реалниот CI статус, не со претпоставка.**
