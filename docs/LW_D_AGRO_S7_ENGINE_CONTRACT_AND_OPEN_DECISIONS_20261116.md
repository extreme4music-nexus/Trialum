# TRIALUM AGRO S7 — ENGINE CONTRACT / OPEN OWNER DECISIONS
**Датум:** 16.11.2026 · **Статус:** спецификација за идни фази, не имплементација.
**Задолжително:** [Blueprint v1](LW_D_AGRO_S7_GREENHOUSE_BLUEPRINT_V1_20261116.md) · [Scene ledger](LW_D_AGRO_S7_SCENE_ASSET_LEDGER_20261116.md) · [Continue here](LW_D_AGRO_S7_CONTINUE_HERE_20261116.md).

## 1. Прочитано од постојниот изворен план (не измислувај нов engine)

Досегашниот **L3.9 оригинален plant engine** е прифатен. Изворни контракти од канонската L3.9/B0–B9 документација:
- Нов флора модел = **blueprint**, НЕ готово растение.
- `s.agro.seedlings` = вистинска залиха на садници по вид.
- `s.agro.gardenPlants` = реални растенија со поединечен ID/локација/животен циклус.
- `h.flora[]` = пресадено растение со истиот ID во живеалиште; не дуплирај меѓу градина и дом.
- Семиња/расад → одобрена градина → вистински раст/вода/нега/зрелост → одобрено пресадување. Вистинско угинување е можно; мртов примерок не оживува од reload и не дава бонуси.
- Оригинални операции наведени во master plan: `E.produceSeedling`, `E.plantInGarden`, `E.waterPlant`, `E.applyAdditive`, `E.transplantPlant`, `E.removeDeadPlant`, `E.craftAdditive`.
- Почетен капацитет: **4 земјени леи × 5 реални позиции = 20**, **водни: 4 позиции**. G-01 голем/мали базени не смеат да го зголемат ова.
- Offline progression по канонски game-day со bounded deterministic catch-up; renderer не ги пресметува деновите самостојно; preserve backup/restore, migration, existing user plants.
- Сите пишувања од GLB child поминуваат преку типизиран, исто-потекло и parent-валидирачки мост; child рендерира read-only projection, па прикажува receipt **само по прифатено engine write**.

**Не претпоставувај дека постојат следниве механики:** заразни болести меѓу соседни растенија, систем за цистерни/филтер како потрошни токенски предмети, автоматско садење и пренос на зрели растенија, нови пораки за дневен надзор, сезонски модел, robotic job scheduler. Тоа се **нови owner идеи и посебни B7+ задачи**, не веќе имплементирана L3.9 функционалност.

## 2. Раздвојување на фази

### B6 / S7 сценографија (сега)
- Шепеста просторна структура; прифатени рендери; точни физички сокети за 4+1 engine сектори и логистички/сервисни станици.
- 3D растенија со предложени stage meshes, нивно read-only мапирање кога се достапни вистински engine податоци.
- Read-only HUD и модели на машини. Движења што симулираат физички ambient automation **не тврдат дека транзакција се случила**.
- Не се воведува нацрт/модели кои отвораат нови plant slots или нова валута.
- Без game state промени во docs/visual-only фазата.

### B7 — потоа, по засебна owner контрола
- Ги врзува интеракциите кон ORIGINAL операции и вистинските `plantId`/resource IDs.
- Дизајн и воведување **автономен robot scheduler** со правила за idempotency, вистински engine actions, slot reservations, состојба по restart, no duplicate transfer и реален feedback.
- Ново управување со вода/филтер/почва/болести се имплементираат **само по спецификација и прифатен баланс**. Не дозволувај аларм да создава вредност или да троши валута без одобрување.
- Групен мониторинг + заразни ризици: јасен radius/соседство, избегнување масовно казнување при offline, deterministic RNG seed/version, граници за spread per game day, известувања и етички guardrails.
- Сонцето/ноќта на сцена = локален часовник, но plant progression = game time. Без double-tick при повторно влегување.

### B8 / B9
- PhytoLab останува сопствена 3D просторија со четирите постојни адитивни рецепти.
- B9 соединува Atrium, Food Warehouse, Greenhouse, PhytoLab и пат кон горната лабораторија.
- Потоа RETRO-LAB, па преостанатата 3D игра, по канонски план.

## 3. Предлог за новата автономна логика (НЕ е одобрен алгоритам)

### Кандидат-состојби на plant job
`QUEUED_SEEDLING → ALLOCATED_SLOT → PLANTED → GROWING → MATURE → TRANSIT_TO_NURSERY → READY_FOR_HOME → TRANSPLANTED`.
Не додавај во engine додека не се одлучи:
- кои од овие се **визуелни проекции** на сегашен `s.agro` state,
- кои бараат ново трајно поле,
- кои бараат потврден расход/слот,
- и кога е моментот на пренос со истиот ID.

### Работа на роботите
Роботите не „произведуваат“ растенија. Тие извршуваат дозволен intent, по token/ресурс/простор валидација. Анимацијата следи receipt за реален настан, не иницира независна simulation. Ако играчот го напушти greenhouse, активниот render/particle/audio stop; future time се пресметува при враќање.

### Набљудување
Сопственикот предлага барем еден дневен check и спорадични проблеми. За да не стане играта наметлива: предлог е редовен **доброволен статус-преглед** со приоритетизирани настани, без бескрајни notifications, без казни само за неотворена апликација и со јасна можност за исклучување на push. Фактичкиот баланс е owner одлука, а не готова имплементација.

## 4. Предложена engine-врска / ownership

| Објект | Единствен извор на вистина | 3D прикажува | Идно дозволено дејство |
|---|---|---|---|
| Seedling rack | `s.agro.seedlings` | вистински количини по вид | allocate/produce по owner/engine проверки |
| Garden slot | `s.agro.gardenPlants` со `plantId` | species, stage, health, medium, location | original plant/water/treat/transplant |
| Aquatic slot | ист plant record со aquatic medium | water stage, plant health и quality (кога постои) | water quality/filter support после посебен gate |
| Mature holding rack | истиот поединечен plant ID, не копија | готово за дом, destination/status | validated move only once |
| Soil sensor | engine plant/bed conditions | warning/quality | original additive + future soil controls |
| Reservoir | нов proposed ресурс, не постои од B6 | симулиран декоративен HUD во B6 со јасен „planned“ статус | future refill + token ledger |
| Filter | нов proposed ресурс | read-only planned | future maintenance transaction |
| Infection group | нов proposed model | само визуелен concept, не fake alert | future controlled spread model |
| FX/conveyor | receipt / visible status | original animation | **нема самостојно game write** |

## 5. Open decisions — не измислувај одговори

| ID | Одлука | Status |
|---|---|---|
| OD-01 | Точно колкави се четирите прсти, под кои агли и колку метри е централниот дел? | OPEN → Blueprint v2 |
| OD-02 | Во која гранка оди четвртата engine леа? Предлог 1+2+1, не автоматска одлука. | OPEN → Blueprint v2 |
| OD-03 | Кои мали базени се декоративни/технички, каде се вистинските четири aquatic slots? | OPEN → Blueprint v2 |
| OD-04 | Дали секоја гранка е групирана по вид, фаза или услови/медиум? | OPEN → Owner + engine map |
| OD-05 | Дали зрелото растение автоматски се преместува без човечки потврди? Што ако нема простор? | OPEN → B7 |
| OD-06 | Како постои физичко зрелo складирање без двојна локација/дуплација на ID? | OPEN → B7 |
| OD-07 | Кои заразни фактори, ризици, соседства и минимално време за интервенција се фер? | OPEN → B7 |
| OD-08 | Колкав е трошокот во веќе заработливи токени за цистерна и филтер? | OPEN → Owner balance |
| OD-09 | Кои ресурси и прагови за почва/вода/минерали се важечки? | OPEN → B7 |
| OD-10 | Колку често се пуштаат известувања, со каков cooldown и opt-in? | OPEN → owner notification gate |
| OD-11 | Поточна сценска палета и кои оригинални растителни модели се приоритет? | OPEN → Visual owner review |
| OD-12 | Сезоните и временските услови: одложено, нема тековна имплементација. | DEFERRED |
| OD-13 | Параметри за роботски транспорт, анимации, перформанси и Android thermals. | OPEN → after GLB prototype |
| OD-14 | Содржина на секој детаљ на сцената според render-ledger. | OPEN → owner review |

## 6. Тестови што мора да се напишат кога ќе стигнеме до код

1. 4×5 + 4 slot cap, вклучително и декоративни extra базени.
2. Seedling stock никогаш не оди негативно и не се создава од render.
3. Еден `plantId` на една локација: garden **или** mature transport/holding **или** `h.flora`, не две одеднаш.
4. 10 брзи tap команди, app reload, disconnected UI, повторен receipt → нема дупло расходување.
5. Стар JSON backup/restore → истите IDs, растенија и health, без ненајавени заболувања.
6. Offline catch-up многу game-days → bounded, deterministic; без phantom death од migration.
7. Коректни land/water медиуми, без species mismatch.
8. No action-only animation on failure, no fake growth at idle.
9. Battery/thermal/FPS на Galaxy A55; Eco/Balanced/High и без WebGL blank canvas.
10. Реален локален ден/ноќ, но без промена на health при менување системски часовник.
11. MK/EN HUD + нотификации и safe-area, orientation/back/accessible targets.
12. Token accounting nonnegative, едно одобрување → еден расход и одржување; без вистински плаќања.
13. Quarantine/illness spread само ако owner ја одобри механиката; без активирање во B6.
14. Inactive view нема GPU loop; AI/FCM/социјален сервер недопрени.
15. Секој тест е автоматски доказ, но **OWNER PASS на реален Android** е посебен gate.

## 7. Release / security boundaries

- Ниту една docs-only промена не значи Release Candidate, beta/Play upload или public release.
- Нема нови Firebase App IDs, signing keys, CI secrets, servers, user tracking или нови permissions.
- Изворниот S6 backup и SignQA остануваат зачувани. Нема присилна деинсталација/бришење податоци.
- Одлуки за болести, непредвидени настани, трошоци и автономија не се маскираат како постоечки engine.
- Следната сесија продолжува од [CONTINUE_HERE](LW_D_AGRO_S7_CONTINUE_HERE_20261116.md) и прво работи на **Blueprint v2**, без самоволни B7 промени.
