# TRIALUM — B0 ORIGINAL ENGINE / 3D SOURCE INVENTORY AND ROLLBACK
**Date:** 2026-11-15 · **Stage:** B0 baseline freeze / documentation and automated source guard. **Status:** B0 TEST SOURCE CHECKS PASS; final OWNER B0 review/acceptance still PENDING.

**Normative:** [B0–B9 canonical master in main](https://github.com/extreme4music-nexus/Trialum/blob/main/docs/TRIALUM_3D_WORLD_MASTER_PLAN_B0_B9_20261115.md) · [GLB/scene contract](https://github.com/extreme4music-nexus/Trialum/blob/main/docs/TRIALUM_3D_ASSET_SCENE_CONTRACT_20261115.md) · [OWNER gates](https://github.com/extreme4music-nexus/Trialum/blob/main/docs/TRIALUM_3D_PHASE_GATES_20261115.md) · [ADR-004](https://github.com/extreme4music-nexus/Trialum/blob/main/docs/ADR_004_GLTF_FIRST_THREEJS_PILOT_20261115.md).

## 1. Exact source, signed APK and owner state
| Authority / baseline | Verified source |
|---|---|
| Original L3.9 **plant engine OWNER FULL PASS** | Owner explicitly tested the installed signed Android QA and said the logic and engine match requirements on **2026-11-15** |
| Signed original game source / build | SHA **7466c38c0f863cf4299fbdf6263f823c60b2608d** · [GitHub Actions #171 SUCCESS, both jobs](https://github.com/extreme4music-nexus/Trialum/actions/runs/43670180653) |
| OWNER-SIGNED artifact | **Trialum-LW-D-L3-9-OWNER-SIGNED-SIGNQA-171**, artifact ID 14143822519, expiry 2026-11-29, *not* the UNSIGNED intermediate |
| Package / identity | **com.trialum.ziivaiskra.signqa** with existing permanent QA signer; separate from Release and Friends Debug |
| Signed source → latest L3.9 parent | SHA **e3f5a9ffe24c452a9bad489785fe112db1265094**; Git tree comparison found **17 changed paths, ALL documentation / README / AGENTS / PR template; ZERO source/Android/3D gameplay changes** after the signed source |
| B0 fork | **feature/lw-d-b0-glb-baseline-freeze-20261115**, based on L3.9 parent SHA e3f5a9ffe24c452a9bad489785fe112db1265094; NEVER from stale main |
| Parent PRs | [L3.9 Draft PR #73](https://github.com/extreme4music-nexus/Trialum/pull/73) → [L3.8 Draft PR #72](https://github.com/extreme4music-nexus/Trialum/pull/72) → L3.7; not merged to main |
| New B0 code scope | A JSON Git-blob hash lock, Node original-scene/core verification tests, and a B0-only GitHub Actions workflow; NO original runtime, Android, 3D renderer or resource/saving edits |

The machine-readable [51-file Git Blob freeze](TRIALUM_B0_PROTECTED_SOURCE_LOCK_20261115.json) includes core engine, save, AI/social, all five 3D laboratories, bridge, app/Android package/signing and existing critical tests. [Automated source guard](../../tests/lw-d-b0-source-lock.test.cjs) recomputes the original Git SHA1 for every locked file and FAILS if its bytes drift; this is specific to **B0 baseline**, not a permanent ban on legitimate, owner-approved B1/B2 changes.

### Rollback and backup
- No destructive app actions during B0. The currently installed owner-passed L3.9 SignQA remains the rollback baseline. Do NOT uninstall/clear its Android storage or install any UNSIGNED APK.
- Original game saves/backups are NOT uploaded, downloaded, read or changed by B0. If the owner makes a separate manual JSON backup, preserve it outside Android app storage before any later experimental signed APK. Never claim a backup was taken on the owner's phone merely because source tests pass.
- If future B1 scene causes display failure, switch back to original WebGL2/NovaGL2 renderer without changing the canonical saved world; fallback MUST remain available. Any later rollback binary must have valid existing QA signature and be compatible with Android app versionCode rules. **Do not blindly install an older APK over a higher versionCode.** Rollback may require a fresh correctly signed, version-incremented QA build from pinned baseline after owner approval.
- Signed artifact #171 has an expiry date; code and build evidence persist but artifact downloads may not. No new signed APK is created in B0.
- Never touch the permanent QA secret, Android Release or Friends Debug, Firebase app IDs or social production server as a part of 3D renderer preparation.

## 2. Source inventory: protected single source of gameplay truth
| Core file(s) | Baseline role / invariant |
|---|---|
| js/engine.js | Base day clock, habitats, chemistry, pets and environment; canonical progression, no frame-driven plant rewards |
| js/evolution.js, js/progression.js | Existing evolutionary rules, research, lab actions and original food progress |
| js/longplay.js | Later-stage discovered flora, materials, food production, foodFactory stock, habitat capacity extensions |
| js/plant-lifecycle.js | Owner-accepted seedling inventory, 4 land beds×5, 1 aquarium×4, genuine water/health/wilt/death, mature ID-preserving transplant and source-paid phyto additives |
| js/plant-lifecycle-ui.js, js/longplay-ui.js | Functional original MK/EN Classic Flora and other original tabs; fallback for unbuilt 3D areas |
| js/app.js | Trusted original world actions, typed parent-facing bridge, save, notifications, validation, no duplicate resource ledger |
| js/storage.js, sw.js, index.html | Original local saves/restore, offline cache, ordered script loading; protect world JSON |
| js/social.js, js/messages.js, js/playground-ai.js, js/playground-memory.js, js/playground-dialogue-session.js, js/shared-playground.js, js/advanced-intelligence.js | Existing friends/messages and optional AI opt-in; 3D renderer is not a parallel friend/LLM server |
| js/lw-d-interface.js | Same-origin iframe shell and the parent-only original engine action bridge. Frame does not own actual save state |

**Important technical detail:** The new 3D view must request authoritative actions through the trusted parent; no resource math (oxygen, food, credits, plant IDs) may be performed by scene render code. The current original 3D Flora Lab's historic immediate-home-plant UI is intentionally disabled because the L3.9 engine enforces nursery→garden→maturity→transplant.

## 3. Exact legacy visual/system inventory (NOT to be deleted)
| File(s) | What physically exists / limitations |
|---|---|
| prototypes/lw-d/world.html and world.js | Existing **genuine custom WebGL2** 3D with 2D fallback, own cube/sphere mesh generators, custom shaders and orbit camera; NO external GLB loader/PBR material/UV pipeline. Rendering already pauses based on scene/iframe visibility; B1 must re-verify on Android. |
| prototypes/lw-d/lab-complex.js | FIRST-FLOOR five-door Lab Lobby; physical lab IDs exactly **basic, dna, foodlab, floralab, research**, projected-point doorway selection |
| prototypes/lw-d/lab-room.js, lab-detail.js | Basic laboratory stations, visual process, origin/scale and detail selection |
| prototypes/lw-d/dna-room.js | DNA laboratory controller and its original-game constraints |
| prototypes/lw-d/food-room.js | Food-production laboratory; actual recipe/resource/stock originates in parent engine |
| prototypes/lw-d/flora-room.js | FIRST-FLOOR Flora research laboratory; distinct from NEW GROUND-FLOOR greenhouse garden |
| prototypes/lw-d/research-room.js | Research and study lab; no parallel research ledger |
| prototypes/lw-d/live-context.js | Visual status and room-specific HUD projection bridge (large file, preserve tests) |
| prototypes/lw-d/world-navigation.js | Main/global lobby HUD and navigation paths; not proof physical city exists |
| prototypes/lw-d/world-hub-pages.js | Connected menus, derived pet/home data; physical world/homes still later |
| prototypes/lw-d/spatial-audio.js and event-reactions.js | Foreground audio/reaction systems, not a background AI or another engine |
| prototypes/lw-d/world.css and world-navigation.css | Existing 3D frame, HUD and navigation styles; preserve touch/safe area behavior |

**Three lobbies (do not conflate):** Global MAIN Lobby currently HUD navigation; physically modeled LABORATORY Lobby on FIRST FLOOR = 5 doors; new AGRO Lobby on GROUND FLOOR = THREE future doors (Food Warehouse, large Garden, small PhytoLab). No 3D lower-floor Agro geometry has yet been made.

## 4. Android packaging and release separation
- android-template/app/build.gradle.kts: compile/target SDK **36** at baseline, Android versionCode **34** and versionName **1.6-LW-dev.11** (base variant); multiple existing build variants, owner SignQA suffix **.signqa**. These are code metadata, not instructions to increment APK code within B0.
- Existing Gradle syncWebAssets includes local web scripts/styles/prototypes for Android WebView and does not require network to load the original core. GLB/Three.js packaging to be proven in B1; do not claim it already exists.
- Android app id/signature and Firebase/signing workflow are already established. This B0 gate does **not** create a build or touch secrets.
- sw.js currently uses a cache name containing **L3.8** while listing L3.9 plant scripts; future service-worker cache version transition requires careful PWA verification. Do **not** mutate baseline cache in B0.
- Detailed 3D models, meshes, lightmap/texture budgets and GLB system are FUTURE under B1/B2, not present in current compiled #171.

## 5. Existing automated regression suite, pass evidence and exclusions
- [L3.9 signed CI #171](https://github.com/extreme4music-nexus/Trialum/actions/runs/43670180653): ORIGINAL QA and signing completed SUCCESS on the exact owner-passed source.
- [B0 isolated source + regression CI](https://github.com/extreme4music-nexus/Trialum/actions/workflows/lw-d-b0-baseline.yml): runs exact hash locks, original plant engine/legacy restore, original food and pet progress, five lab room/camera/HUD/navigation, old social/AI opt-in and fixed Android package identity; this is Node-level CI only, not new phone test or APK.
- Expected tests: tests/lw-d-b0-source-lock.test.cjs, tests/lw-d-l3-9-original-plant-engine.test.cjs, tests/lw-d-flora-actions.test.cjs, tests/lw-d-food-actions.test.cjs, tests/lw-d-legacy-recovery.test.cjs, tests/lw-recovery-regression.test.cjs, tests/lw-d-live-shell.test.cjs, tests/lw-d-l3-8-connected-menu.test.cjs, tests/lw-d-fcm-build.test.cjs, main scene tests under prototypes/lw-d and existing tests for AI/dialogue and Play Games.
- **Known external CI gap:** [English text synchronization latest observed failure](https://github.com/extreme4music-nexus/Trialum/actions/runs/43674634377) on the inherited L3.9 branch, *before B0*. Guard reports new MK UI text in original L3.9 Flora code but no \`locales/en.json\` change compared with baseline. Some English text is translated inline in plant-lifecycle-ui.js; whether all keys in central en catalog need harmonization is a distinct audit. This failure must NOT be concealed by a B0 green check or mislabeled as product-engine regression. **Pre-existing overall repository CI is NOT entirely green.** Resolve as a separate, narrowly scoped localization fix with dedicated tests/owner review before claiming an all-workflows-green future release.
- Not verified by B0 automation: actual current device backup bytes, real-world phone battery heat/memory measurements, Three.js performance, GLB model replacement, new Agro rooms, Play store readiness, server live status and user-specific FPS. Never invent them.

## 6. B0 acceptance scope and next gate
B0 proves a precise **frozen source baseline and executable guard**, not any new 3D game feature. The owner may explicitly accept B0 after review of the lock/inventory/CI and the known English-sync debt. **B1** then creates only a measured isolated offline Three.js GLB test room while legacy renderer remains intact; no B4 Agro geometry before B0–B3 owner PASS.

Do not mark B0 OWNER PASS in documents or PR because the owner has only accepted L3.9-A, not this new baseline phase.
