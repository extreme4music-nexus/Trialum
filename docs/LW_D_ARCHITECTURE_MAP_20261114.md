> **MANDATORY OWNER 3D ARCHITECTURE — 15 NOVEMBER 2026** — [B0–B9 master](TRIALUM_3D_WORLD_MASTER_PLAN_B0_B9_20261115.md) · [GLB/Scene contract](TRIALUM_3D_ASSET_SCENE_CONTRACT_20261115.md) · [3D gates & OWNER PASS](TRIALUM_3D_PHASE_GATES_20261115.md) · [ADR-004 renderer pilot](ADR_004_GLTF_FIRST_THREEJS_PILOT_20261115.md). Canonical **GLB-first whitebox plan with core/scene/renderer separation**, 1 unit=1 metre, named anchors/sockets, mobile-controlled PBR and a measured **Three.js pilot before any replacement of existing NovaGL2**. After the owner's explicit full L3.9 plant-engine PASS (signed GitHub QA #171), the only next implementation is **B0 baseline freeze**, then B1 measured renderer pilot, B2 model validation, B3 world/bridge, B4 real 3-door ground-floor Agro Lobby, B5 Food Warehouse, B6 Garden shell, B7 Garden actions, B8 PhytoLab and B9 environment/quality. **NO future B-stage may be skipped without recorded owner approval; CI PASS does not imply OWNER PASS.** Preserve five upper labs, original engine, save/food/pets/friends and trusted GitHub SignQA signing. These are binding docs, not yet implemented renderer code/branch-protection.

# LW-D — архитектонска карта и стари системи (14.11.2026)

Ова е анализа за подготовка на реконструкцијата; НЕ е тврдење дека новата архитектура е веќе имплементирана.

| Постојна структура | Сегашна улога | LW-D цел | Статус |
| --- | --- | --- | --- |
| index.html + assets/style.css | dashboard, панели, табови | landscape scene-first shell, HUD, contextual overlays | потребен редизајн |
| js/world.js | Canvas 2D свет | замена/адаптација зад scene renderer API | останува working baseline |
| js/engine.js | deterministic chemistry, day, cells, pets | pure simulation clock; render-independent events | мора да остане компатибилен |
| js/progression.js | lab tiers, food, research | видлива интерактивна лабораторија + food production economy | не бриши прогресија |
| js/longplay.js | еволутивни епохи, генетски/развојни проширувања | emergent procedural outcomes | зачувај existing species |
| js/playground.js + js/shared-playground.js | local/shared playground events | true 3D interaction + autonomous social simulation | owner QA и LW-C draft остануваат посебни |
| js/playground-ai.js + js/playground-memory.js | opt-in local AI и тематски спомени | AI as optional engine intent; per-pet contextual memory | review privacy |
| native TrialumBackgroundSpeechService | opt-in native background model | ново барање: без AI додека апликацијата е неактивна | миграциска одлука со owner QA |
| storage.js + Android backup vault | локални светови, export/restore | schema-versioned backward compatibility | тврда граница |
| android-template/app/src/main/AndroidManifest.xml | Android lifecycle and app | landscape orientation after UX readiness | неменуван во D0 |
| GitHub Actions and existing signers | тестови / trusted-main потписи | исти сопственички сертификати | не менувај во D0 |

## Предложени технички договори

- World state: single source of truth; view не е source на game rewards.
- Simulation: independent deterministic replay functions with monotonic clock guards and caps.
- Scene renderer: activate/resize/pause/dispose/restore lifecycle, zero game economy side effects.
- AI: only valid intents within bounded schema; no direct mutating world, financial tokens or user data.
- Experiment education: separate correct real-science facts from fictional Trialum phenomena, cite/source where possible.
- Public social: separate private memory zone, age-appropriate safety and no uncontrolled child contact.
- Roadmap owner-first: PRs and QA evidence do not override owner's final say.

Нема пријавена реална Play Console верификација само затоа што Developer account е создаден.
