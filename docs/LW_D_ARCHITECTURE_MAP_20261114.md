> **MANDATORY B0–B9 GLB-FIRST OWNER ARCHITECTURE — 2026-11-15.** [canonical B0–B9](https://github.com/extreme4music-nexus/Trialum/blob/main/docs/TRIALUM_3D_WORLD_MASTER_PLAN_B0_B9_20261115.md) · [asset/scene/GLB contract](https://github.com/extreme4music-nexus/Trialum/blob/main/docs/TRIALUM_3D_ASSET_SCENE_CONTRACT_20261115.md) · [non-bypassable owner/phase gates](https://github.com/extreme4music-nexus/Trialum/blob/main/docs/TRIALUM_3D_PHASE_GATES_20261115.md) · [ADR-004 renderer trial](https://github.com/extreme4music-nexus/Trialum/blob/main/docs/ADR_004_GLTF_FIRST_THREEJS_PILOT_20261115.md). Original L3.9 **plant engine has explicit OWNER FULL PASS on 2026-11-15** after installing signed QA build; [GitHub #171](https://github.com/extreme4music-nexus/Trialum/actions/runs/43670180653) source SHA 7466c38c0f863cf4299fbdf6263f823c60b2608d. This does **NOT** approve future GLB/3D construction. **B0 is NEXT**, B1 Three.js GLB isolated pilot, B2 assets, B3 world/bridge, then B4 Agro Lobby/B5 Warehouse/B6 Garden/B7 live interactions/B8 PhytoLab/B9 polish. No bypass without an explicit, versioned owner-approved exception. Three.js is the pilot candidate, not already a full replacement; preserve NovaGL2, five first-floor labs, core/save/food, and owner-only GitHub SignQA. **Main-branch master documents are binding on this still-Draft development branch.**

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
