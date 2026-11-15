# TRIALUM — COMPLETE 3D CONVERSION DELIVERY PROGRAM (OWNER DIRECTIVE 2026-11-15)
**STATUS: BINDING FUTURE PRODUCT ROADMAP, NOT PERMISSION TO SKIP B1 OR START OTHER PHASES.**

**AUTHORITATIVE ORDER:** [ADR-005 owner decision](ADR_005_OWNER_DIRECTIVE_B1_PHOTOREALISM_AND_FULL_3D_MIGRATION_20261115.md) → [B1 owner video/incident and fix gate](TRIALUM_B1_OWNER_REWORK_GLB_BLACK_SCREEN_AND_VISUAL_QA_20261115.md) → [existing technical contract](TRIALUM_3D_ASSET_SCENE_CONTRACT_20261115.md) → [OWNER mandatory phase gates](TRIALUM_3D_PHASE_GATES_20261115.md).

**Global statement:** do not abandon the real GLB-based high-quality 3D future of Trialum. Preserve the already-successful original Trialum engine. Incrementally REPLACE the visuals and navigation with a coherent asset/scene/renderer layer while never duplicating resources, pet consciousness, progression, seeds, food, saves, friends or AI consent.

## PHASE PROGRAM 0 — First complete and repair B1; nothing later may start while blocked
**Status now:** B1 owner REWORK, signed #176 CI SUCCESS but user recording shows unintended fallback, black viewport on GPU quality changes, bad phone-safe HUD and close-wall camera. Owner has not granted B1 PASS.

B1 working sequence (small commits and separate technical acceptance evidence, not next official B-stages):
- **B1.R1 genuine glTF decode**: reproduce exact Android failure in actual GLTFLoader; preserve semantic IDs via glTF extras regardless of normalized names; strict node/transform uniqueness, raycast marker correctness; differentiate real GLB from fallback.
- **B1.R2 real GPU/canvas stability**: eliminate blank black canvas when Eco/Balanced/High changes or context/viewport changes; fix resize and recovery; measure true visible render, not only RAF callbacks.
- **B1.R3 native mobile UX and collisions**: unoccluded Android status/nav-safe layouts; no Classic button over metrics, correct touch/back, camera limits, no wall penetration or invalid zoom; at least ten enter/exit cycles and offline.
- **B1.R4 high-photorealistic representative scene**: convincingly realistic offline GLB materials/normal/roughness details, correct PBR, believable lighting and shadow/reflection depth, actual High quality sustainable on Galaxy A55 and Graceful Eco/Balanced; license and asset provenance. This is a **QUALITY THRESHOLD**, not full game art in B1.
- **B1.R5 device acceptance**: signed existing SignQA, no data wipe, actual user screenshot/screen video, one-to-one controls, robust fallback, sustained High/performance, Classic+legacy labs+plants/food unchanged. **Only owner can say B1 PASS.**

If any substep fails: return to that substep. No B2, new Agro geometry or old lab rewrite until full user B1 PASS.

## PHASE PROGRAM 1 — Reusable infrastructure, AFTER B1 owner approval
**B2: GLB asset registry & validation.** No manual one-off rooms.
- Define versioned manifest schema and canonical semantic IDs/units/origins with Y UP, one unit one meter and floor transforms.
- Stable **anchors/sockets**, raycast proxies independent of visual mesh; translations and animation binding by semantic role; no raw mesh-name dependency.
- Import/export/graybox tools and licensed texture/model pipeline, offline packing, checksums, bounded LOD/triangle/texture/material budgets, missing model fallback.
- Automated real GLTFLoader validation (in addition to raw glTF JSON inspection), snapshot scenes and model-swap test without changing game engine/action IDs.
- Android packaging, build reproducibility, asset copyright/provenance and license records. Owner approved B2 demo and signature.

**B3: reusable scene graph, building/floor/door links and ORIGINAL-engine bridge.**
- Declarative city/building/floor/room graph and portal IDs; camera/nav/occlusion, physics proxies, animations, scaled nonhuman life models.
- Scene lifecycle: load→activate→pause→unload→dispose; keep only visible GPU animation, no hidden LLM or audio.
- HUD interaction: real hit proxy→read-only contextual snapshot→validated parent original-engine request→one committed receipt→one visual reaction; idempotence and rejections.
- Offline WebView/Android Back/resume/orientation; restore old Classic when room not built; original five first-floor labs remain.
- Mobile performance tiers and regression; B3 owner PASS before building actual Agro rooms.

## PHASE PROGRAM 2 — COMPLETE NEW GROUND-FLOOR AGRO WING (B4–B9), NOT AN EMPTY LOBBY
**Owner goal: a COMPLETE interconnected realistic building with a real lobby and exactly 3 fully usable rooms, integrated with the existing original game.** Subphases still sequential and owner accepted, no parallel hacks; these compose one owner-visible full-world milestone.

**B4: GROUND-FLOOR Agro Lobby.**
- A coherent complete premium-visual main entrance hall; 3 correct physical doors/portals: Food Warehouse, Huge Garden, Small PhytoLab.
- Consistent metric coordinates, correct door scale, physically navigable/accessible paths and return/back behaviors; continuity to FIRST FLOOR five-lab lobby without overwriting it.
- No missing room presented as finished; visible progression states accurately labeled. High-quality GLB shell using same contract and usable Eco/Balanced/High.
- Owner device acceptance: routes, door selection, spatial design, lighting, no black frames, stable memory.

**B5: Food Warehouse — ACTUAL original stock.**
- Premium GLB warehouse shelves/containers/storage zones, PBR lighting/materials, accessible real stock HUD.
- Inventory displays only existing original s.foodFactory.stock and original food recipe/production semantics. No warehouse-local stash/reward/inventory, no double-produced food.
- Physical flow Warehouse ↔ Agro Lobby ↔ existing Food Production Lab; correct original Classic save parity after operations and offline/restore.
- Owner complete visual and stock accuracy PASS.

**B6: HUGE Greenhouse / Garden spatial volume.**
- Several-times-larger realistic garden vs old lab rooms: plausible glass, natural ground, tracks, small nursery shelves, sunlight/foliage/water, visibility/performance.
- **Exactly four original terrestrial beds ×5 slots each**, **one distinct in-ground aquatic pool with 4 slots**; do not change engine capacity with geometry.
- Every bed/slot/seedling and animal/home transition has stable GLB semantic anchor and believable growth-stage mesh/LOD; descriptive perspective HUD cannot create plants.
- Own QA: physical layout, camera and hit proxies, mobile performance High, navigability, no black viewport.

**B7: REAL gardening and plant lifecycle** (not new rules).
- Read original s.agro seedling/plant IDs, seed cost, stages, hydration/health, growth/wilting/real death, additives; all updates through canonical original engine.
- Seedling production→plant in correct land/aquatic slot→water/treat→grow with real original day clock→mature→transplant exact same ID to existing pet habitat; dead plants remain truly dead until explicitly removed by valid action.
- One tap gives at most one canonical transaction; no fake result if operation fails. Classic/Garden/home shows same plant ID, costs and persistence even after close/offline restore.
- Owner watches and accepts entire lifecycle. This may involve controlled simulated test days in QA harness, never silent time acceleration in real user game.

**B8: Small PhytoLab — fully functional 3D.**
- Complete little high-quality room with real craft bench, ingredient displays, supplies and output, no fake resource ledger.
- Exactly **four existing in-game fictional additive recipes**, shared s.elements costs, original s.agro.additives output, authentic E.craftAdditive/E.applyAdditive validated in parent.
- Real plants react only to original engine receipt. No secondary account/food/credits/biology economy.
- Owner craft, spend, care, reload and escape-path PASS.

**B9: Whole Agro Wing integration, photorealism, atmosphere, sustained performance.**
- All three rooms + lobby consistent physical materials, realistic lighting, day/night and optional purely visual weather with verified weather data/permission, offline default; no GPS leaks; no unapproved plant-weather penalties.
- Continuous journey across doors (lobby→Warehouse→lobby→Garden→PhytoLab→upstairs→Classic) without lost GL resources or camera collisions.
- High-quality on A55 without unacceptable overheating/memory/blank screens, while Eco/Balanced support less powerful phones. Benchmarks for real loaded GLBs, not placeholder-only FPS.
- Original game, food/plant/restore/FCM/AI/social regression plus at least 10 multi-room transitions; owner delivers **complete Agro Wing PASS**. Never label “Agro DONE” on only B4 or a screenshot.

## PHASE PROGRAM 3 — RETRO-LAB: CONVERT THE EXISTING FIRST-FLOOR LAB BUILDING
**Dependency:** Whole Agro Wing owner PASS, not just B1 or B4. The current five-lab first-floor system stays operational until each migrated portion passes.

- **RL0 inventory & bridge map:** map all five working first-floor lab rooms and HUD actions, door IDs, original-science transaction routes, camera/gesture semantics, Android audio and existing owner approvals. Freeze old source and same-life simulation.
- **RL1 lab lobby first:** replace old hand-authored WebGL2 first-floor lobby with high-quality GLB main lab corridor, correct five doors (Basic, DNA, Food, Flora, Research), actual stairs/connector to the completed Agro ground-floor lobby and global Main Lobby. Preserve camera/back and existing actions.
- **RL2 Basic Lab:** premium lab models, real experiments/chemistry, read-only displays and trusted original original-game action results.
- **RL3 DNA Lab:** full parity with Classic DNA features; species, prereqs, unlocks, pet identity, no loss of earlier previously fixed 3D parity.
- **RL4 Food Production Lab:** genuine recipes, original foodFactory stock, correct connection to downstairs Food Warehouse, no parallel stock.
- **RL5 Flora Lab:** original research/invention only, separate from downstairs Garden/PhytoLab; correct original seedling→garden lifecycle gating.
- **RL6 Research Lab:** research and science projections backed by original engine; no fake level/rewards.
- **RL7 Cross-lab 3D QA:** unified realistic aesthetics and scale, 5 doors+3 Agro doors, no FPS/thermal regression, full use of original game and no lost data, user OWNER PASS each module and integrated whole old laboratory building. Keep old working renderer fallback until complete lab parity and owner green light.

## PHASE PROGRAM 4 — FULL-WORLD 3D CONVERSION (multi-year vision, microphased)
These are ordered *programs*, not permission to implement concurrently with B1.
- **W0 universal scene streaming**: world map, scale, outdoor routes, chunked loading by distance, resource-bound lifetime, state-bound interactions, accessibility/Android 3D UI.
- **W1 global Main Lobby**: from old HUD-only hub to actual coherent 3D world gateway connecting laboratories, habitats, city, services and social world. Accurate routing to finished rooms only.
- **W2 outdoor environment / city**: roads, parks, weather/day-night opt-in with true data and offline fallback, landmarks, physical placement without unsafe GPS/tracking assumptions.
- **W3 habitats/homes**: individual player homes and pet rest/play areas, capacity rules, species-appropriate room/animal scale, memory/backup continuity.
- **W4 nursery/incubator**: original cellular→multicellular→pet lifecycle and unlocks; no new instant-game exceptions or time/XP shortcuts.
- **W5 living GLB creatures**: rigs, skeletal animation, stage-dependent visible form, species-specific proportions, real player-trained skills and animations; preserve emergent personality and memory; hidden scene must not run LLM or audio.
- **W6 game systems represented in the world**: DNA, nutrition, progression, toys and habitats, original items and authentic earned currencies; no simulated separate inventory. Private **home edible gardens only after separately approved original engine functionality**.
- **W7 shared 3D social world**: friends/home visits/shared playground/messaging with original opt-in and safe network semantics, no duplicate pet transfers/sessions, offline handling, original client-local pet life rules.
- **W8 world consistency, accessibility, sustainability**: same art/material/camera language across all locations, measurable Galaxy A55 performance & older Android profiles, localized texts, privacy/security, lawful asset provenance, backup and restoration.
- **W9 long-term persistence and generational world**: continuity of pets, identity, culture, relationships, histories and memory; careful user-approved AI models local/on-device when visible; no predatory ads/data brokerage or artificial compulsion.

**W programs may require many owner-approved microphases each**, and future features not yet defined remain PLANNED rather than invented as fully designed. No premature Play release or store promise.

## EXACT NO-SKIP QUALITY GATES AT EVERY SUBPHASE
- Protect original game: single canonical TrialumEngine + read-only world snapshot + validated one-time operations; saves, foods, pets/skills, optional AI, friends, social and FCM remain identical when new 3D not entered.
- True offline GLB, semantic anchors independent of mesh names, metric-scale 3D, real model-loader decode tests and asset provenance; fallback visually safe but never counted as successful GLB quality.
- Visual quality meets OWNER expectation on actual phone. Source CI/real-device review both required. Gold/photorealistic display ≠ heavy mandatory shaders: optimize until high quality and frame stability coexist.
- Keep each microphase in its own limited branch/PR, exact SHA, tests/SignQA, phone evidence and explicit owner approval, no merge before authorization. No local signing, no new Firebase identity/server, no game data wipe.
- Record complete/partial/failing statuses without masking faults. If a model blocks, remain at that step. **Do not give up, do not rush, do not bypass.**

## Exact next task and handoff
**Stop here for now. OWNER STEP 0 IS DOCUMENTATION ONLY.** Active work awaiting instruction: [B1 video incident, first repair B1-R1](TRIALUM_B1_OWNER_REWORK_GLB_BLACK_SCREEN_AND_VISUAL_QA_20261115.md) on [B1 Draft PR #76](https://github.com/extreme4music-nexus/Trialum/pull/76), not B2 or Agro geometry. CI signed #176 is historical, *owner B1 BLOCKED*; L3.9/B0 owner PASSED. Read [ADR-005](ADR_005_OWNER_DIRECTIVE_B1_PHOTOREALISM_AND_FULL_3D_MIGRATION_20261115.md) and actual current source before any modification.
