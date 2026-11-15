# TRIALUM — MANDATORY REPO INSTRUCTIONS FOR AI / CODEX / CONTRIBUTORS
**Owner directives; current as of 2026-11-15.** Do not bypass these by proceeding from an older chat summary. This file is a durable document, NOT a claim that GitHub branch protection or CI automatically enforces every rule.

## BEFORE working on ANY new 3D feature / code / model
1. READ [canonical 3D B0–B9 plan](docs/TRIALUM_3D_WORLD_MASTER_PLAN_B0_B9_20261115.md).
2. READ [GLB, world-scene, metric units, anchors and original-engine bridge contract](docs/TRIALUM_3D_ASSET_SCENE_CONTRACT_20261115.md).
3. READ [mandatory sequential phase gates & OWNER acceptance](docs/TRIALUM_3D_PHASE_GATES_20261115.md).
4. READ [ADR-004: GLB-first + measured Three.js pilot, NovaGL2 retained](docs/ADR_004_GLTF_FIRST_THREEJS_PILOT_20261115.md).
5. READ [current LW-D handoff](docs/LW_D_CONTINUE_HERE.md) and the owner signing/FCM rules in the relevant active development branch. Check actual branch/PR state first, not historical excerpts.

## Non-negotiable status at the time this file was written
- The owner **explicitly confirmed full L3.9-A original-game PLANT ENGINE PASS on device on 2026-11-15**, following [GitHub CI #171 SUCCESS](https://github.com/extreme4music-nexus/Trialum/actions/runs/43670180653), tested source SHA 7466c38c0f863cf4299fbdf6263f823c60b2608d.
- That L3.9 source is on development Draft PR #73 based on L3.8 Draft PR #72, NOT in main yet. Do not overwrite main engine or pretend docs-only changes bring source into main.
- **B0 baseline freeze is NEXT. B1 Three.js+GLB pilot comes only after B0. B2 model contract/tools, B3 reusable world/navigation, B4 three-door ground-floor Agro Lobby, B5 warehouse, B6 huge greenhouse, B7 real actions, B8 phytolab, B9 environmental/performance finish.** Do not start new 3D Agro geometry before B0–B3 pass.
- Five existing first-floor labs remain functional. Existing NovaGL2 custom WebGL2 must remain as the fallback until the owner approves a replacement.
- Separate trusted parent original TrialumEngine owns all game state, pet IDs, flora, health, seedling cost, additives, stock, original food and persistence. GLB models and 3D renderer are VISUAL; never spawn plant/food/currency/rewards by mesh logic.
- Reusable offline GLB assets, named sockets/anchors, hit/collision proxies, PBR-ready but mobile-efficient lighting, 1 meter per unit, correct scene/renderer separation are REQUIRED for every newly constructed room. No all-box hardcoded permanent room under the old renderer.
- Don't conflate Main Lobby, first-floor five-door Laboratory Lobby, and new GROUND-FLOOR three-door Agro Lobby. New Garden = 4 current terrestrial beds×5 and aquatic pool×4; 3D appearance never changes engine capacity.
- Do not create a new parallel engine, save world, food stock or second inventory. Current Food Lab remains unchanged; future private pet home food gardens come AFTER the 3D city/houses and need a separate phase.

## No-bypass phase gates
For every 3D change, declare B-stage, branch/PR, acceptance criteria, model/anchor validation, original-engine regressions, locally bundled assets, source SHA and OWNER acceptance. **Automated CI PASS is NOT PHONE OWNER PASS**. No merge or transition to next B-stage without explicit owner acceptance of the named stage, except non-mutating analysis.
The owner alone may approve a deviation; write the exact exception, mitigation, tests and rollback in a versioned ADR before implementing a bypass. Do not silently remove or override this file or normative contracts.
No local APK signing, no new Firebase/app IDs/keystores, no destructive reinstalls, no Release/FriendsDebug/Play publication/server migration as part of new LW-D 3D phase. Reuse the already-existing GitHub owner SignQA signer and package com.trialum.ziivaiskra.signqa.
Remember: specifications and checklists are human/agent governance, not technical branch protection; implement automated validators in B0/B2 when authorized, and report truthfully what is mechanically enforced.

## Required one-line new-session start
"Read AGENTS.md + canonical B0–B9 master, asset/scene contract, gates and ADR-004. L3.9 plant engine OWNER PASS is accepted, B0 is next. Identify exact current source branch and protect original Trialum engine and signed SignQA. Do not build Agro 3D before B0–B3."
