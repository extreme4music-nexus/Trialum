> **CRITICAL OWNER DIRECTIVE — 2026-11-15, ADR-005 OVERRIDES OLDER B1/B9 STATUS:** [ADR-005 owner GLB/high-photorealism decision](https://github.com/extreme4music-nexus/Trialum/blob/main/docs/ADR_005_OWNER_DIRECTIVE_B1_PHOTOREALISM_AND_FULL_3D_MIGRATION_20261115.md) · [REAL B1 phone defects and R1–R5 rework](https://github.com/extreme4music-nexus/Trialum/blob/main/docs/TRIALUM_B1_OWNER_REWORK_GLB_BLACK_SCREEN_AND_VISUAL_QA_20261115.md) · [complete 3D conversion roadmap](https://github.com/extreme4music-nexus/Trialum/blob/main/docs/TRIALUM_3D_COMPLETE_CONVERSION_AFTER_B1_OWNER_ROADMAP_20261115.md). **Current B1 = OWNER-DIRECTED REWORK / BLOCKED FOR PHASE ADVANCE**, not OWNER PASS and NOT abandonment of Three.js/GLB. Signed [CI #176](https://github.com/extreme4music-nexus/Trialum/actions/runs/43703898547) was green, but Galaxy A55 recording showed **unexpected fallback (missing GLB anchor pilot.table.action-1), black 3D canvas after Eco/Balanced/High changes, unreliable visual inference from high RAF FPS, Android safe-area overlap and camera wall clipping**. Work **ONLY in B1**, fix all defects then show **genuinely premium photorealistic quality and functionality** with stable mobile High, original engine and five labs unchanged; owner expressly accepts B1 before B2/B3. Then B2/B3 prerequisites → **finish entire 3-room Agro ground-floor lobby/wing (B4–B9)** → **retrofit old first-floor five-door lab lobby and labs** → **complete game-wide 3D conversion**. **This is documentation only; no defect is fixed yet.** Older "B1 CI pass", "B0 next" and "Three.js optional to abandon" notes are HISTORICAL and superseded where inconsistent.

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
