# ADR-005 — Owner directive: repair B1 to high photorealism, then complete the full Trialum 3D world
**Date:** 2026-11-15. **Status:** OWNER-APPROVED BINDING DIRECTION. **This commit is documentation only; no renderer repair or new APK.** This ADR supersedes conflicting interpretations of ADR-004 and the B0–B9 master, while keeping technical safety prerequisites.

**Read this first when continuing in a new chat:** [B1 incident / exact repair and acceptance plan](TRIALUM_B1_OWNER_REWORK_GLB_BLACK_SCREEN_AND_VISUAL_QA_20261115.md) · [B0–B9 master](TRIALUM_3D_WORLD_MASTER_PLAN_B0_B9_20261115.md) · [scene/GLB/bridge contract](TRIALUM_3D_ASSET_SCENE_CONTRACT_20261115.md) · [owner phase gates](TRIALUM_3D_PHASE_GATES_20261115.md) · [ADR-004](ADR_004_GLTF_FIRST_THREEJS_PILOT_20261115.md) · [handoff](LW_D_CONTINUE_HERE.md).

## 0. Explicit owner instruction — preserve in GitHub BEFORE further work
After watching a real B1 signing-QA Galaxy A55 screen recording, the owner gave SIX product directives and a higher-priority ZERO directive:
0. **DOCUMENT ALL THIS RIGHT NOW, BEFORE ANY REPAIR**, in every vital GitHub location, so a conversation/token limit does not lose it. The new chat must continue from real project state without the owner explaining everything again.
1. **WE DO NOT GIVE UP.**
2. **THIS IS OUR PATH**: genuine GLB-first, high-quality 3D world construction. A failed first Three.js pilot is a problem to solve, not a reason to abandon the architecture for permanently hand-coded boxes.
3. **FIX EVERYTHING AND STAY IN B1** until the engine delivers convincingly **HIGH PHOTOREALISTIC VISUAL QUALITY AND FUNCTIONALITY** on the actual phone, with no black screens, broken anchors or weak interaction. No B2 or new rooms on a merely green CI.
4. **AFTER THE B1 QUALITY THRESHOLD**, deliver the **ENTIRE NEW GROUND-FLOOR AGRO LOBBY AND ITS THREE COMPLETE ROOMS** (real Food Warehouse, real large Garden/Greenhouse and real small PhytoLab), not just decorative doors or placeholders.
5. **THEN RETROFIT THE EXISTING FIRST-FLOOR LABORATORY LOBBY** to the chosen new GLB 3D system, preserving existing five doors and real functioning labs.
6. **THEN CONTINUE THROUGH THE ENTIRE GAME** until all appropriate areas are transformed into the same coherent 3D experience, retaining original simulation, pet identity/memories, resources, friends, opt-in AI and world persistence.

These are owner instructions. The owner remains the sole final accept/reject authority. Documentation and signed automated tests are not owner-device PASS.

## 1. Specific owner-approved change to architecture/gates
- Keep Three.js + external real GLB as the **active preferred path to REPAIR**, not an abandoned experiment. Keep existing custom WebGL2/NovaGL2 as the **working fallback/rollback**, not the default future architecture. If a fundamental renderer impossibility is demonstrated, only the owner can decide whether to retain the GLB-first design using an alternative renderer; an agent cannot silently abandon this direction.
- The old ADR-004 described measured Three.js GO/REWORK/NO-GO. Its immediate outcome is now **OWNER-DIRECTED REWORK**. A faulty first pilot is NOT a final NO-GO for the long-term 3D plan.
- **B1 owner PASS criteria are upgraded**: a representative isolated 6×6m scene must visually reach the owner's chosen **high-fidelity/photorealistic quality**, not only load gray geometry. Production-grade representative PBR materials, lighting, convincing depth, functional camera and semantic hit targets, mobile compatibility and stable Eco/Balanced/High transitions are required. Graybox can be used *during* B1 repairs but cannot be final evidence of this new visual bar.
- The old master placed most quality polishing at B9. **A representative premium-quality slice is now moved forward into B1** as a technical and artistic proof, while B9 remains the final environment-wide atmosphere, optimization, weather and consistency phase.
- **B2 scene/asset registry and GLB validation and B3 reusable world/navigation/parent bridge still follow B1 OWNER PASS**. These are engineering prerequisites, NOT authorization to skip B1 or build unstructured large rooms.
- After B1/B2/B3, treat B4–B9 as one **full Agro Wing delivery program**, divided into small sequential owner-accepted steps: B4 three-door GROUND-FLOOR Agro Lobby and continuity to FIRST-FLOOR Lab Lobby; B5 authentic Food Warehouse stock; B6 large Greenhouse 4×5 land beds + aquarium×4; B7 original engine seedling/care/growth/real death/transplant; B8 four original additive recipes in small PhytoLab; B9 full high-quality visual finish/performance and final acceptance of the whole three-room building. **Full ground floor is DONE only when lobby + all three real rooms and their canonical engine interactions pass.**
- **AFTER** the complete Agro Wing passes, start **RETRO-LAB**: migrate the existing first-floor five-door lab lobby and each of its existing Basic/DNA/FoodLab/FloraLab/Research rooms to the same GLB contract sequentially; do not disable old tested rooms until replacement parity and owner approval.
- **AFTER** RETRO-LAB, begin **WORLD-3D**: main hub, city/exterior, paths, habitats/homes, incubators/nursery, creatures/rigging/skills, parks and shared worlds, gradual continuous migration without reimplementing the life engine. Future edible home garden production is separately owner-gated; no extra food economics by scene code.
- No dates/forced release milestones; quality and safe incremental original-world preservation outrank speed.

## 2. What the owner video showed — evidence, not automated guesses
**Previously signed B1 #176 was not a successful phone B1 acceptance.** It was signed and built successfully ([GitHub Actions #176](https://github.com/extreme4music-nexus/Trialum/actions/runs/43703898547), source SHA 515219caedeb33f96d60f7619851dbda93d38a89, owner-SignQA artifact 14157481756, current com.trialum.ziivaiskra.signqa), but the real recording showed:
- Message: **FALLBACK geometry active — Missing or invalid GLB anchor: pilot.table.action-1**. Real GLB path was NOT proven end-to-end on Android; the fallback covered the error.
- **Black/blank 3D canvas during quality-mode changes** (Eco/Balanced/High) with UI remaining visible, then drawing resumed. A reported ~100–115 RAF FPS did not guarantee correct presented 3D frames.
- **Mobile safe-area/HUD overlap**: header with Android system bar and upper-right exit controls; bottom Classic overlay occluded metric texts. Camera sometimes moved unreasonably close to walls/objects.
- Camera orbit, some proxy touches and return to Classic appeared functional, but do not interpret them as full 3D correctness, phone data-integrity tests or owner PASS.
- **Potential** cause of anchor failure: glTFLoader/Three.js may sanitize a glTF node name with dots or scene graph IDs; raw source GLB JSON-node checks by Node cannot substitute actual GLTFLoader-deserialized named-anchor resolution. This is a hypothesis to prove or refute, NOT a confirmed root cause.
- **Potential** black-frame causes: resizing/setPixelRatio, WebGL context and scene lifecycle, camera positioning, framebuffer/clear and presentation during active controls. Device evidence and additional tests are required, NOT blame phone hardware.

Exact diagnosis, ordered microtasks and test cases: [B1 rework incident](TRIALUM_B1_OWNER_REWORK_GLB_BLACK_SCREEN_AND_VISUAL_QA_20261115.md).

**Current status after owner's instruction:** L3.9-A owner PASS; B0 owner PASS; **B1 = BLOCKED FOR NEXT PHASE / REWORK REQUIRED** (not abandoned); B2/B3/B4 NOT STARTED. Signed CI #176 remains historical CI PASS, never retroactive OWNER PASS. [Unrelated English sync issue #75](https://github.com/extreme4music-nexus/Trialum/issues/75) stays open separately.

## 3. Upgraded non-negotiable B1 exit checklist
B1 is not accepted until the owner sees **all**:
1. **Actual GLB** loaded in Android with accurate stable semantic anchors and transforms; no unintended fallback. Deliberate missing-GLB test still accurately displays fallback without any engine mutation.
2. **Believable premium-quality material/lighting look**: at least one representative room shows convincing PBR textures/material detail, believable light/shadow/reflection/depth without black or visual glitches. High setting really looks high and remains usable; Eco/Balanced gracefully reduce cost without disappearing geometry.
3. **Three modes remain stable** across repeated Eco↔Balanced↔High, resize/orientation, background/foreground, screen lock/context loss, 10+ enter/exits, and offline play. No persistent black canvas, broken depth, lost resource, hidden render loop or duplicated renderer.
4. **Camera and interaction correct**: no illegal through-wall clipping, overly close views, incorrect geometry, raycast click-through or lost proxies; touch, pinch and both anchor selections work consistently.
5. **Mobile UI safe areas**: top/Exit/bottom Classic/HUD/metrics all visible, touchable, readable in A55 landscape and tested Android Back. User never needs to rotate device awkwardly or guess where controls are.
6. **Real-world performance**: record representative actual FPS median/p95/p99, quality setting, device heat/battery behavior and interaction responsiveness over sustained tests; no fake benchmark from an empty or black canvas. Old budget ~30fps on A55 is a lower engineering floor, not automatic photo-quality PASS. Final threshold chosen by owner based on tested visual result and smoothness.
7. **Gameplay continuity**: original Classic plants/food/pets/backups and five existing upstairs laboratories operate, original engine remains the sole source of truth, same existing GitHub QA signing, no reinstall/data wipe or unintended application ID/FCM/server modifications.
8. **Credible evidence and owner final wording**: source/PR/CI run and signed APK, real video/screenshots or detailed phone walkthrough, reported issues closed, owner explicitly says B1 PASS. No agent can infer it from a green job.

**If ANY item fails: remain in B1 and repair with another small tested patch.** Do not automatically jump to B2 or declare “good enough”.

## 4. Exact branching, release and safety limits
- Source branch: [B1 Draft PR #76](https://github.com/extreme4music-nexus/Trialum/pull/76), fork of [B0 Draft PR #74](https://github.com/extreme4music-nexus/Trialum/pull/74), fork of [L3.9 Draft PR #73](https://github.com/extreme4music-nexus/Trialum/pull/73). Still Draft; no automatic merge to main.
- Protected code: original js/engine.js/progression/longplay/plant-lifecycle/storage/parent bridge and all five first-floor lab source modules; save/AI/social core never copied into GLB.
- GLB-first contracts remain: 1 unit = 1 meter, Y-up, stable external model registry and named semantic anchors, mesh-independent proxy picking, offline assets, reuse of original state, adaptive PBR.
- Signing remains the original permanent GitHub owner-QA certificate / com.trialum.ziivaiskra.signqa only; no local signing, no fourth Firebase ID, no Publish/Play or Release/FriendsDebug contamination.
- Do not rebuild entire world while B1 is blocked. Do not edit runtime in a documentation-only handoff task.
- **A file is a governing direction, not mechanical protection.** Future CI validators, PR review gates and owner PASS must enforce it in actual workflow.

## 5. Resume after session limit
Read this ADR, [B1 incident/rework](TRIALUM_B1_OWNER_REWORK_GLB_BLACK_SCREEN_AND_VISUAL_QA_20261115.md), [B1 exact build report on active branch](https://github.com/extreme4music-nexus/Trialum/blob/feature/lw-d-b1-threejs-glb-pilot-20261115/docs/LW_D_B1_GLB_THREEJS_PILOT_IMPLEMENTATION_20261115.md), current branch and PR #76; verify source/CI before edits. The NEXT ACTUAL CODE WORK, ONLY WHEN OWNER REQUESTS IT, is **B1 repair step 1: GLTFLoader real GLB anchor resolution**, followed by black-frame/quality-switch rendering repair, mobile HUD/camera fixes, high-fidelity visual slice and A55 signed user QA. Do not ask the owner to repeat the vision or reopen previously accepted L3.9/B0.

**This ADR is documentation ONLY. It does not mean GLB renders correctly, the black screen is fixed, photo-quality is achieved, or owner B1 PASS exists.**
