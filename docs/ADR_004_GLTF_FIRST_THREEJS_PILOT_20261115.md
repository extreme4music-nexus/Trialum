> **OWNER ACCEPTANCE STATUS — 15 NOV 2026 (LATEST):** B0 source-freeze **OWNER PASS** was explicitly granted after owner reviewed B0 docs. B1 has now been IMPLEMENTED in [Draft PR #76](https://github.com/extreme4music-nexus/Trialum/pull/76), based on B0 Draft PR #74, not main. Isolated **real offline Three.js 0.187.0 GLB** 6×6m pilot with two named sockets, raycasting, GLB failure fallback, PBR, Eco/Balanced/High and frame-time metrics; **original L3.9 engine/food/saves and the five first-floor NovaGL2 laboratories unchanged**. [B1 GitHub Actions #176 BOTH JOBS SUCCESS + existing owner SignQA verified](https://github.com/extreme4music-nexus/Trialum/actions/runs/43703898547), exact compiled SHA `515219caedeb33f96d60f7619851dbda93d38a89`; artifact `Trialum-LW-D-B1-OWNER-SIGNED-SIGNQA-176` ID 14157481756, expires 2026-11-29. [B1 exact implementation and owner's Galaxy A55 test checklist](https://github.com/extreme4music-nexus/Trialum/blob/feature/lw-d-b1-threejs-glb-pilot-20261115/docs/LW_D_B1_GLB_THREEJS_PILOT_IMPLEMENTATION_20261115.md). **B1 IS CI/SIGNED PASS ONLY, PHONE OWNER PASS PENDING; B2/B3/B4 FORBIDDEN UNTIL EXPLICIT B1 OWNER GO.** No physical Agro Lobby/warehouse/garden/PhytoLab yet. The earlier "B0 next" status in this same document is historical; this heading supersedes it. Unrelated [English text sync issue #75](https://github.com/extreme4music-nexus/Trialum/issues/75) remains open and must not be mistaken for B1 rendered-device PASS. Do not merge Draft PRs or publish.

# ADR-004 — GLB-FIRST WHITEBOX 3D / MEASURED THREE.JS PILOT
**Date:** 2026-11-15 · **Owner-directed:** Yes, user explicitly asked to preserve/mandate this new staged plan. **Decision status:** ACCEPTED ARCHITECTURAL DIRECTION; renderer implementation choice CONDITIONALLY PENDING B1 measurements and OWNER PASS. Documentation only in this change.

**Normative references:** [B0–B9 master](TRIALUM_3D_WORLD_MASTER_PLAN_B0_B9_20261115.md) · [scene/GLB contract](TRIALUM_3D_ASSET_SCENE_CONTRACT_20261115.md) · [phase gates](TRIALUM_3D_PHASE_GATES_20261115.md). Existing original 3D [L3.9 source Draft PR #73](https://github.com/extreme4music-nexus/Trialum/pull/73) is distinct from documentation in main.

## Context
Trialum already has a genuine working original game engine, independent progression, a personally accepted L3.9 plant lifecycle and tested signed Android APK. Its early 3D prototype uses direct WebGL2 mesh rendering and hard-coded room coordinates, anchored projected point-picking and manually specified shaders in prototypes/lw-d/world.js and room files. That is a successful functional graybox; however, continuing that approach to model every home, object and sprawling garden would cause substantial duplicate visual engineering once detailed GLB assets and physically-based materials are introduced.

The owner's game-developer friend recommended professional whiteboxing/grayboxing with glTF/GLB files, replaceable meshes, named socket/anchor points, PBR-ready lighting and a meter-scale coordinate system from day one. The owner endorsed a deliberate, microphased, high-quality approach with no rush and now mandated recording it in all vital docs.

## Decision
1. **3-layer separation:** ORIGINAL CORE ENGINE authority, NEW declarative WORLD/SCENE architecture, replaceable RENDERER. Existing original game code is retained, not reimplemented in WebGL.
2. **GLB from the very first NEW physical 3D area**, or a declared primitive fallback backed by the SAME asset/scene contract. Gray GLBs are valid; no big effort on detailed cuboid art that will be discarded.
3. **External assets and immutable named sockets:** scene manifests, 1 unit = 1 m, Y up, stable identity and anchors, interaction raycast/collision proxies, camera/lighting dimensions. No direct gameplay dependence on vertex position or mesh index. GLB replacement is "no gameplay changes" ONLY when it preserves contract.
4. **PBR and modern effects are CAPABILITIES**, not all-always-on requirements: lightmaps, textures, normals, reasonable reflections and optional bloom, adaptive Eco/Balanced/High, current Galaxy A55 targeted.
5. **Renderer candidate:** package and benchmark a small isolated Three.js + GLTFLoader/WebGL2 scene for B1 rather than rebuild an entire GLB/PBR/raycast backend in NovaGL2. **Do not immediately rip out NovaGL2**: keep it as rollback; if B1 fails, the owner chooses rework or a targeted NovaGL2 upgrade.
6. **Order:** B0 baseline freeze → B1 pilot measured on Android → B2 asset registry/export/validation → B3 scene/navigation/bridge abstraction → B4 three-door ground-floor Agro Lobby → B5 Food Warehouse → B6 huge Greenhouse shell → B7 original-engine interactions → B8 small PhytoLab → B9 lighting/weather/performance/consolidation; each stage requires tests and its own owner acceptance.
7. **No green-field restart:** preserve five existing upper-floor labs, original food, plant model/seedling/growth/death/transfer, original FCM/friends/AI opt-in and backup/restore. Renderer cannot own stock/rewards or claim owner testing.
8. **No public product change:** docs and experimental branch work are not Main merge, app-ID change, Firebase migration, signing policy change, server rollout or Play release authorization.

## Explicit rejected alternatives
- **A. Keep creating every new room as polished hand-authored cubes/spheres then replace everything later:** rejected for avoidable duplicate 3D art/renderer/touch work. Existing hardcoded labs are NOT thrown away without acceptance; they stay functional until migrated.
- **B. Delete existing world.js and rewrite everything to Three.js now:** rejected for unmeasured compatibility and regressions.
- **C. Forcefully extend homemade NovaGL2 to full PBR/GLB before testing a mature library:** rejected as default path, but stays as fallback if B1 comparative evidence warrants.
- **D. Assume GLB swapping works magically without common transforms/sockets:** rejected; requires validated model contract.
- **E. GPU-heavy full bloom/reflections/shadows on every mobile frame:** rejected unless performance proven and owner specifically accepts.
- **F. Move gameplay logic or user save state into scene graph:** prohibited permanently, not merely postponed.

## Consequences
**Benefits:** easier asset replacement and incremental visual realism, less room duplication, consistent camera/sockets/collision, preservation of original biology, data continuity and long-term virtual-world scalability.

**Costs:** small up-front B0–B3 architectural/validator work, extra bundled 3D library and GLB assets, memory/thermal profiling, deliberate migration testing for existing labs. These are intended and less costly than rebuilding hundreds of manually coded shapes.

**Risks and mitigations:** Android WebView GPU/context loss → B1 device test and lifecycle handling; loader/texture bloat → pinned versions, offline packaging and asset budgets; GLB anchor drift → validator and swap tests; gesture regression → pick proxies and accessibility controls; false approval → separate CI and OWNER PASS records; backup corruption → original-engine invariant tests.

## Exact current status (as of the owner's 2026-11-15 statement)
- **L3.9-A original plant engine**: signed CI #171 SUCCESS and explicit owner full PASS from installed app.
- **B0…B9**: all **PLANNED** (no new GLB renderer migration coded/validated by this ADR). B0 is the next implementation phase.
- **Three.js vs NovaGL2 final rendering decision**: **NOT LOCKED** until B1 evidence and owner accepts it. Three.js is the preferred pilot.
- Main contains documentation; LW-D L3.9 code still in its own Draft PR. Do not falsely assert full PR merge or final-game 3D readiness.

## No-bypass rule
Future B-stage PRs MUST link this ADR plus master/contract/gates; a request to skip these is BLOCKED without an owner-issued versioned amendment referencing affected stage and measurable mitigation. A document is an instruction and review gate, NOT a claim that GitHub branch protection or automated validation is already configured.

## Revisit triggers
- B1 measured Three.js pilot substantially underperforms legacy NovaGL2 in realistic identical Android device conditions.
- Requested future 3D features are unsupported in chosen backend or cause unacceptable memory/thermal/accessibility cost.
- Owner explicitly changes the architecture strategy; record as ADR-004 revision or new ADR, not silent rewriting.
