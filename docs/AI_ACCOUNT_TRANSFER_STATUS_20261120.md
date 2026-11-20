# TRIALUM — READ FIRST WHEN AI DEVELOPMENT IS TRANSFERRED

**Document-only handoff, 20 November 2026.** NO engine code, APK, GitHub credentials or Play Store state is changed by this file. A longer private handoff package is in the owner's possession.

## Repository separation

- `extreme4music-nexus/Trialum` = engine, current game and Living World source; use `AGENTS.md` and `docs/TRIALUM_3D_PHASE_GATES_20261115.md` as mandatory owner controls.
- `extreme4music-nexus/Trialum-3D-Builder` = visual GLB studio/scene JSON. Its `main` (observed `4523c272`, 20 Nov) has MASTER PASS2 with 703 editable instances, 363 genuine models. This is NOT yet integrated into the game.
- `extreme4music-nexus/trialum-beta` = owner-controlled beta/distribution history, with `BETA_BUILD_SOURCE_OF_TRUTH.md`; last documented v41 candidate from `i18n/v41-dynamic-screenshot-fixes-20261119` commit `d0c797f6f4ddf3c5628657ecc26ee4efffd53e70`.
- `extreme4music-nexus/Trialum-Android-Builds` = unsigned-only public build infrastructure, local owner signing; no key/credential transfer.

## Next concrete task — NO Trialum engine edits yet

The owner's latest ask is to repair **only G02's local rotated stone grid** in the Builder and provide a true visually correct path. The previous source merely changed four tile `assetId`s, and the owner explicitly reports that the tiles still look sideways and misaligned. Keep G01 water, G00L service room, G03–G05 untouched. Use local browser + Blender/Computer Use as available, prove visual placement and get OWNER PASS. The source is `Trialum-3D-Builder/projects/trialum-s7-master-garden-pass2.json`; older V1–V4 are historical, not accepted material variants.

## Original Trialum engine gate

Existing 3D renderer/GLB pilot B1 owner rework in this repository is separately documented and **not automatically cleared by Builder CI or visual garden previews**. Follow [B1 owner rework](TRIALUM_B1_OWNER_REWORK_GLB_BLACK_SCREEN_AND_VISUAL_QA_20261115.md), [full 3D conversion roadmap](TRIALUM_3D_COMPLETE_CONVERSION_AFTER_B1_OWNER_ROADMAP_20261115.md), and [GLB scene contract](TRIALUM_3D_ASSET_SCENE_CONTRACT_20261115.md). No accidental merging of experimental renderer branches into main.

After owner accepts and exports Blender/Builder JSON, negotiate a new simulation/engine architecture: canonical runtime IDs separate from GLB visuals; 1+3 water basins and 4 aquatic slots; 4 land beds x 5 canonical slots; pumps/filters/hoses and water mass conservation; real plant growth/stages/health; robot tasks; door navigation; deterministic events and animations reflecting state; safe save/restore, social privacy, performance on Galaxy A55. **Decorative seedling previews do not create additional real game plants. No drip irrigation in the beds.**

## Mandatory release/security principles

Do not modify the original Classic gameplay/online server or submit Android/Play Store builds without the owner's separate explicit approval. Preserve backups, identity, signing continuity and latest approved source branch. The user decides visual/release PASS. The project has no external advertisements, no data brokerage and no non-consensual mini-AI. CI success is technical evidence only; if a phone or browser display fails, mark BLOCKED. Never disclose API keys, keystores, tokens or users' private backups in code/docs.

**Immediate entrypoint for successor:** [Builder new-account technical handoff](https://github.com/extreme4music-nexus/Trialum-3D-Builder/blob/main/docs/HANDOFF_TO_NEXT_CHATGPT_ACCOUNT_20261120.md). Owner has a complete private handoff package to upload alongside this document.


## Full Trialum 3D successor brief — 20 November 2026
**This is a TRIALUM-ONLY handoff.** The owner has a larger private ZIP with (a) complete Trialum game/Living World history, (b) a detailed >30 KB 3D implementation/design handoff, (c) the **byte-exact** 703-instance MASTER PASS2 scene JSON and (d) the byte-exact 363-GLB catalog snapshot plus older WebGL QA visuals and the new Codex kickoff message. The actual 363 GLB files must be cloned from Builder and the owner may share their latest edited JSON later. Do not treat a prior ChatGPT account's plugin/GitHub/Windows permissions as available to the successor.

### Last verifiable 3D Builder / game separation
- Builder: [Trialum-3D-Builder](https://github.com/extreme4music-nexus/Trialum-3D-Builder); [full successor technical handoff](https://github.com/extreme4music-nexus/Trialum-3D-Builder/blob/main/docs/HANDOFF_TO_NEXT_CHATGPT_ACCOUNT_20261120.md).
- Owner-review scene: `projects/trialum-s7-master-garden-pass2.json` exact Git blob `5d68670f7c073d1842b3f89c49b0394c20ffec91`; `assets/catalog.json` exact Git blob `8e9eac716453e70b474de87380efb2788a9dec26`. **703 visual instances, 363 real GLBs.**
- G01 central: original physical 1+3 water basins, 4 Aquaglow real-game slots, morph water preview; G00L: service racks, R01 robot, animated 2.3m glass door and back-positioned desk; G02/G03/G04/G05: 4 land beds × 5 canonical slots. Extra seedling GLB previews are decorative, not canonical organisms. Irrigation uses hoses, pumps, valves and filters; owner explicitly prohibits dripline in land beds.
- **OWNER REJECTED G02 VISUAL LAYOUT.** Latest Builder `main` code-only G02 edit (before documentation commit) changed `master-finger-1-path-[1..4]` to `f03-s-stone-full` but **did not** implement local rotated `GridHelper`/snap. Do not claim acceptance or try to fix using more assetId swaps. Builder `src/main.js` world-space gizmo and `snap` (roughly lines 65–80, 140–159, 527–550) are the root concern.
- **Immediate permitted scope: G02 local-grid correction only.** G01, G00L, G03–G05, game engine, home server, Play distribution all unchanged. Use real browser and Blender where connected, compare before/after visual QA top-down/eye-level, small G02-only diff, explicit owner PASS.
- Separate Android visual preview is NOT an integrated game APK. The hand-packaged JAR-only APK failed owner install; rebuilt independent preview [CI #44693799413](https://github.com/extreme4music-nexus/Trialum-3D-Builder/actions/runs/44693799413) v2-signed but **no reported owner installation/visual acceptance**. Builder [CI #44694204672](https://github.com/extreme4music-nexus/Trialum-3D-Builder/actions/runs/44694204672) code PASS, not owner PASS.

### Full 3D engine migration is a FUTURE, separately authorized phase
After owner-approved final JSON, agree on rendering/game-state bridge with stable room/slot/plant/pump/robot IDs; resource-conserving water-flow graph, real biological growth/stages and health, working food lab→warehouse→pet reserves and nursery stocks, robot actions and door collision/pathfinding, state-driven GLB animation clips, localized UI, offline-first save/restore, existing friends/AI-consent features, Android perf and visual quality thresholds. No branch merge into the current engine until the original B1 renderer rework phase gates are resolved or the owner explicitly revises them. See this repo's `AGENTS.md`, `docs/TRIALUM_3D_PHASE_GATES_20261115.md`, `docs/TRIALUM_B1_OWNER_REWORK_GLB_BLACK_SCREEN_AND_VISUAL_QA_20261115.md`, and `docs/TRIALUM_3D_COMPLETE_CONVERSION_AFTER_B1_OWNER_ROADMAP_20261115.md`.

### Recommended working arrangement
The successor should run **local Codex with authorized GitHub Desktop clone + actual Edge/Chrome Builder + installed Blender Python `bpy`**, optionally Computer Use only if actually available, and insist on visible side-by-side scene evidence rather than blind transforms. Every change: branch/commit SHA, unchanged non-G02 checksum, test report, real screenshot, then owner visual approval. Keep the user's saves, signers, deployed release and local assets intact. No added fees, external ads or data brokerage.
