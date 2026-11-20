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
