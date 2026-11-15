> **LATEST B1-R1 REAL-LOADER FIX — 2026-11-15:** After [owner video/ADR-005](ADR_005_OWNER_DIRECTIVE_B1_PHOTOREALISM_AND_FULL_3D_MIGRATION_20261115.md) showed unexpected fallback in the first signed B1 #176, GLB semantic-anchor R1 code has been repaired on the still-Draft [PR #76](https://github.com/extreme4music-nexus/Trialum/pull/76). [B1 GitHub Actions #181, BOTH jobs SUCCESS](https://github.com/extreme4music-nexus/Trialum/actions/runs/43721113985), compiled source `d6708bb8a74626aafe5af1da7f3533c668b12ea3`, [DIRECT owner-signed SignQA artifact #14164607495](https://github.com/extreme4music-nexus/Trialum/actions/runs/43721113985/artifacts/14164607495). **Official pinned r187 GLTFLoader.parse executed on actual built GLB 4/4 PASS**, resolving glTF userData.semanticAnchor and wall semanticPart rather than normalized names. [Exact R1 code, GLB hash, signed APK and phone test instructions](https://github.com/extreme4music-nexus/Trialum/blob/feature/lw-d-b1-threejs-glb-pilot-20261115/docs/LW_D_B1_R1_REAL_GLTFLOADER_ANCHOR_FIX_AND_QA_20261115.md). **R1 DEVICE PASS STILL PENDING; WHOLE B1 OWNER-DIRECTED REWORK/BLOCKED**. Black viewport on mode switches (R2), phone safe areas/camera (R3), HIGH photorealistic demo (R4), overall owner decision (R5) still OPEN. No B2/B3/new Agro 3D, no code main merge; original L3.9 engine and B0 owner PASSED. Older "R1 yet to be fixed" text below is historical and superseded only for R1 source/CI, not real phone.

# TRIALUM — B1 REAL-PHONE INCIDENT, OWNER REWORK, MICROPHASE PLAN & HARD PASS GATE
**Date:** 2026-11-15 · **Current status:** B1 **OWNER DIRECTED REWORK / BLOCKED FOR PHASE ADVANCE**. B0 and L3.9 original plant engine remain OWNER PASS. The B1 phone video disproves that the actual 3D view works, notwithstanding green CI. **This is an incident/repair PLAN, not a code fix.**

**Latest owner authority:** [ADR-005 — continue chosen GLB path to premium 3D](ADR_005_OWNER_DIRECTIVE_B1_PHOTOREALISM_AND_FULL_3D_MIGRATION_20261115.md). Follow [GLB/scene technical contract](TRIALUM_3D_ASSET_SCENE_CONTRACT_20261115.md), [existing phase gates](TRIALUM_3D_PHASE_GATES_20261115.md), [B1 compiled source report](https://github.com/extreme4music-nexus/Trialum/blob/feature/lw-d-b1-threejs-glb-pilot-20261115/docs/LW_D_B1_GLB_THREEJS_PILOT_IMPLEMENTATION_20261115.md), [B1 device test protocol](https://github.com/extreme4music-nexus/Trialum/blob/feature/lw-d-b1-threejs-glb-pilot-20261115/docs/b0/TRIALUM_B1_THREEJS_GLB_PILOT_TEST_PROTOCOL_20261115.md).

## 1. Source/evidence that any new session MUST identify
- Private repo: extreme4music-nexus/Trialum. Active real code: [Draft B1 PR #76](https://github.com/extreme4music-nexus/Trialum/pull/76), branch feature/lw-d-b1-threejs-glb-pilot-20261115, based on Draft B0 PR #74 → Draft L3.9 PR #73. NOT merged to main. Historical B1 signed source SHA 515219caedeb33f96d60f7619851dbda93d38a89; later B1 documentation commits do not change that tested APK.
- [GitHub Actions #176](https://github.com/extreme4music-nexus/Trialum/actions/runs/43703898547) **two jobs SUCCESS**, owner-signed artifact Trialum-LW-D-B1-OWNER-SIGNED-SIGNQA-176, artifact ID **14157481756**; signed APK inside ZIP Trialum-LW-D-B1-SIGNQA-SIGNED.apk; package **com.trialum.ziivaiskra.signqa** with existing permanent GitHub QA cert; no local signing/Play release. CI was genuine but **insufficient for real GPU/UI correctness**.
- The user supplied a phone screen recording titled Screen_Recording_20261115_130451_Trialum Signing QA.mp4 during the conversation; it was reviewed as real on-device evidence. It is **NOT committed into GitHub** and must not be represented as a separately hosted issue/asset. A new session can work directly from the owner-observed failures described here without requesting another recording just to restate the bug; later actual fix needs a NEW owner phone test.
- First B1 build used REAL offline GLB source generated at build time (binary 5,292 bytes, node count 16; SHA256 2bd568a97682c009e259885436d52c1b76a1dd566c4a6025c7bbd7176163aacf) plus Three.js r187 GLTFLoader / OrbitControls compiled local 652,352-byte bundle (SHA256 e1760746e4d955b3551f5bd8af26ecfb7b84777f9866448712a36790a90cb9f5); these **only prove binary packaging, not phone geometry visibility**.
- **Owner's exact direction after observing:** do not give up; chosen GLB high-visual-quality path; repair until B1 genuinely works in high-photorealistic quality; then build whole new three-room Agro ground floor; then retro-convert old first-floor lab lobby; then finish 3D conversion of the game. First document for chat limit (ADR-005).

## 2. Direct phone observations vs possible causes — never conflate
| ID | On-device observation from user video | Actual proof | What is NOT proven yet | Severity |
| --- | --- | --- | --- | --- |
| **B1-R01** | Message exactly **FALLBACK geometry active — Missing or invalid GLB anchor: pilot.table.action-1** | Packaged GLB was attempted, failed semantic validation and switched to procedural fallback | Whether actual glTF geometry would render correctly after fixing name/extra resolution; not proven just because GLB buffer parses | **BLOCKER** |
| **B1-R02** | During Eco/Balanced/High quality switching the 3D viewport intermittently goes black while HTML HUD is visible, then imagery returns | Current WebGL/presentation/quality-switch path is not robust on user's Galaxy A55 | Exact driver, resize, frame-buffer, WebGL context or camera cause; no isolated root-cause proof yet | **BLOCKER** |
| **B1-R03** | Frame counter reports roughly 100–115 FPS even with black viewport episodes | RAF callback timing still advanced; not a reliable rendered-canvas benchmark | GPU power/usage, actual visible frame delivery, true photorealistic FPS or battery draw | **HIGH** |
| **B1-R04** | Top title and right exit overlap/crowd Android system bars; lower Classic button covers metrics | Android immersive/safe-area and overlay placements need work | Whether current CSS padding can be fixed without Android-native inset changes | **HIGH** |
| **B1-R05** | Camera zoom/orbit can show unnatural close views into walls/objects | Current camera bounds/clipping are inadequate | A full physical collision implementation, physically correct world navigation | **HIGH** |
| **B1-R06** | Some orbit/selection/Classic navigation visible and UI is responsive | Launch, partial camera/HUD events and return path exist | Fully correct object selection (GLB anchors), no input loss/through-wall selection, scene disposal, world/save parity in all conditions | Partial success only |

**Diagnostic hypothesis, NOT a proven finding:** THREE.GLTFLoader may sanitize, normalize or otherwise alter glTF node names containing dots (e.g. pilot.table.action-1); current code asks gltf.scene.getObjectByName(originalId) and checks userData.semanticAnchor exact match. The raw generated GLB source JSON contains the original ID, but the built/tested Node suite does **NOT** execute official GLTFLoader deserialization against that GLB. It is also necessary to test whether the world position matches after traversing GLB root transforms and whether extras were retained. Use semantic extras or exact validated stable name normalization rules, never guess an arbitrary mesh index.

**Black viewport hypotheses:** size() sets renderer.setPixelRatio and renderer.setSize directly in the quality change handler while frame() keeps drawing; the WebGL context might need state/lifecycle/resize handling, or the camera may see a blank region after controls/viewport changes. Use explicit logging/test probes for canvas intrinsic dimensions, renderer DOM size, GL context loss/restored events, cleared frame, camera position/direction, scene children count, active requestAnimationFrame count, GL error where available. Do NOT infer root cause from mere FPS.

**Safe-area hypothesis:** B1 separate iframe CSS uses env(safe-area-inset-*) but Android native immersive window may not propagate desired viewport insets into iframe, and the parent puts its own Classic close control over the iframe HUD. Real device overlay testing must check both native and CSS insets.

## 3. Exact source seam and preserve list (verified on GitHub B1)
- prototypes/lw-d/b1/pilot-runtime.mjs:
  - loadRoom(): loader.loadAsync(sceneSpec.sourceModel) → getObjectByName(id) → userData.semanticAnchor exact → getWorldPosition match → else fallbackRoom(). Diagnose with actual GLTFLoader-loaded glTF scene, not only Node JSON parsing.
  - size(): clamps DPR and setPixelRatio / setSize; quality change directly calls size()/showMetrics(). Investigate black canvas and log actual rendered geometry health/visibility.
  - frame(): requestAnimationFrame sample FPS and renderer.render(scene,camera) with no visual integrity verification; mark FPS as frame timing only.
  - camera: OrbitControls min/max distance + polar limits, no robust wall/object collision. Fix clipping and constraints.
  - dispose(): pause/remove meshes/materials/dispose context; validate after repeated 10+ opens/closes and visibility change.
  - markers/proxies independent of GLB; ensure real anchor world-space alignment and wall occlusion.
- tools/b1/generate-glb.mjs: source of real 16-node binary glTF2 room, floor/walls/door/table, node names, extras.semanticAnchor, right-handed meters/Y-up.
- prototypes/lw-d/b1/pilot-scene.json: 6×6m manifest with anchor IDs and local transforms, GLB filename, camera, quality.
- prototypes/lw-d/b1/pilot.css and pilot.html: HUD/Android safe-area overlaps.
- js/lw-d-b1-pilot-launcher.js: separate original-game button and parent iframe overlay/Classic exit; cannot modify Canonical state.
- android-template/app/build.gradle.kts: includes b1/** in original SignQA web assets, same old package. Avoid changing Release/FriendsDebug.
- .github/workflows/lw-d-android-qa.yml: existing owner GitHub SignQA-only branch signer, build local Three bundle and GLB; keep exact pinned key/pins/variants.
- tests/lw-d-b1-glb-pilot.test.cjs: currently source/binary/static structural coverage, needs a **real GLTFLoader decode test**, GPU/WebGL/quality/safe-area runtime coverage wherever accessible, not just file presence.
- **Protected no-change without separate approval:** js/engine.js, js/plant-lifecycle.js, js/longplay.js, js/storage.js, original pet/social/AI/backend and five 3D lab files; old NovaGL2 3D entry and its world remain available.

## 4. Do NEXT repair work in narrowly testable steps — all INSIDE B1
**B1-R1 — ROOT MODEL/ANCHOR FIX, NO ART CHANGES**
1. Reproduce signed APK's exact GLB decode using the actual Three.js r187 GLTFLoader in a controllable browser/webgl harness. Log every loaded scene node's original semantic extra and runtime name.
2. Resolve interaction anchors by stable glTF extras semanticAnchor (or enforce validated reversible naming) rather than relying exclusively on getObjectByName(original ID). Prove anchors are unique, finite transforms, actual world coordinates match the manifest and are not duplicates with visually painted markers.
3. Separate parser failure vs semantic anchor failure vs missing file and show accurate error; fallback only on genuine failure. No silent successes.
4. Assert real GLB mode is active by successful GLTFLoader decode and correct marker-to-GLB transform; screenshots/harness test real geometry, not just a JSON header. Preserve intentional fallback test.
5. CI original plant/food/lab regression + owner signed GitHub SignQA. **R1 is not a B1 final PASS**; owner must see REAL GLB before moving to next repair.

**B1-R2 — BLACK FRAME / QUALITY SWITCH / CONTEXT FIX**
1. Instrument quality changes (Eco↔Balanced↔High) and renderer framebuffer dimensions, viewport, pixelRatio, camera/scene, GL errors/context.
2. Recalculate camera aspect after size; never allow zero canvas size, invalid DPR, absurd render target allocation or stale renderer state. Use proper bounds and when necessary defer resize to safe frame, prevent old-frame race.
3. On context restoration, reinitialize necessary GL resources and rebind/reload scene, not merely set contextLost=false and resume a disposed scene.
4. Add visible-frame health check in test harness (not RAF count), test >20 mixed quality toggles, device rotation where supported, background/foreground, offline and return; no persisting black canvas. Do not paper over by hiding a black screen behind indefinite fallback.
5. Preserve old engine. Pass targeted R2 owner validation before visual polish.

**B1-R3 — MOBILE HUD/SAFE AREA & CAMERA**
1. Reconcile Android native window insets vs iframe CSS and parent Classic overlay. Make top status/exit and lower metrics/Classic non-overlapping, readable and touchable in supported orientation.
2. Camera orbit limits, near/far clipping, orbit target bounds, simple wall/camera collision and physically sensible initial camera; no through-wall or physically impossible closeups.
3. One-finger orbit, two-finger pinch, deliberate taps; maintain hit proxy reachability and reject click-through; reset camera repeatable.
4. Test multiple rotations, safe area, app Back and 10+ reentries on Galaxy A55. No user-data clearing.

**B1-R4 — REPRESENTATIVE HIGH-PHOTOREALISTIC LOOK (OWNER NEW GATE)**
1. Once R1/R2/R3 stable, replace the representative test room's gray GLB/model materials with a genuinely more lifelike **asset-based** version respecting the same real anchors, metric scale and proxy/camera alignment; no permanent authored-mesh-only renderer workaround.
2. Good PBR baseColor/roughness/metalness/normal/AO textures and appropriate texture resolution, correct sRGB vs linear map channels and tonemapping; license/provenance verified, offline packed. Optional baked lighting/static lightmaps plus small bounded dynamic lights, believable shadows/reflections and depth, ambient balance, correct glass/metal/wood/stone; no excessive bloom/glitter.
3. Visually obvious comparison gray prototype→realistic room, user can swap model without changing engine data or interaction IDs. Use Eco/Balanced/High tiers with sensible degradation but **High must actually look convincingly high**. No mandatory GPU overload, thermal runaway or black frames.
4. Measure sustained real Galaxy A55 frame pacing and heat/battery usability; frame statistics only if actual scene visible; record screenshot/video/owner qualitative judgment. If high visual finish runs poorly, optimize geometry/meshes/LOD/baking/textures/lighting, DO NOT lower owner bar and silently call PASS.
5. Owner may iterate visual direction as many times as needed. A high-quality B1 demonstration is a **representative slice**, not authorization to create new building before B2/B3.

**B1-R5 — FULL REAL-DEVICE GATE, STILL B1 UNTIL EXPLICIT PASS**
1. Run all new targeted GLB-runtime tests + original L3.9 51-protected-blob checks (with only explicitly approved visual/Android packaging deltas), five-lab/food/social/AI/backup regression, offline asset verification and signed QA.
2. Show old Classic/pet/plant/food data intact, old NovaGL2 five-lab 3D usable. Check intro/back/return, black-screen recovery and GLB fallback both deliberate and natural failure.
3. Test High sustained, Eco/Balanced multiple transitions, 10+ room entries, hidden/visible, no battery/thermal issue and no strong memory leak. Note exact phone/OS/test mode and actual measurements; no fabricated screenshots/FPS.
4. Owner explicitly gives **B1 PASS** only if high photo-like quality AND functionality are good. If owner identifies any issue, reopen that R-step and keep B1 blocked; never declare owner PASS by code/CI.

## 5. Exit gate before next physical buildings
- B1 is **BLOCKED_FOR_ADVANCE / REWORK** now, NOT abandoned. B2/B3 not started, no B4 Agro code/geometry.
- After B1 OWNER PASS, proceed sequential B2 GLB asset registry/validator → B3 reusable world/parent engine bridge (each owner approved) → B4–B9 **COMPLETE physical Agro Wing** (ground-floor lobby plus Food Warehouse plus huge real Garden plus small PhytoLab) → RETRO-LAB existing first-floor lobby and five labs → WORLD-3D complete game.
- The full Agro program must be real functioning ORIGINAL-ENGINE data: Food Warehouse authentic s.foodFactory.stock, Garden **4 land beds×5 + aquatic 4** real s.agro plants/seedlings/maturity/death/transplant, PhytoLab **four original recipes** and shared resources. No fake stock or duplicate lifecycle.
- The owner, not an AI agent, is the judge of realism, comfort, PASS and final design. Separate Source/CI PASS and OWNER ON-DEVICE PASS.
- Release rules: Draft PRs remain unmerged without owner approval; GitHub permanent SignQA-only signing, no local keystore, no forced uninstall/clear data, no extra Firebase ID/Play release.

## 6. One-message "resume" for a fresh chat
**"Read main docs/ADR_005_OWNER_DIRECTIVE_B1_PHOTOREALISM_AND_FULL_3D_MIGRATION_20261115.md and docs/TRIALUM_B1_OWNER_REWORK_GLB_BLACK_SCREEN_AND_VISUAL_QA_20261115.md; read actual B1 Draft PR #76 and branch feature/lw-d-b1-threejs-glb-pilot-20261115; existing source signed #176 PASS but OWNER PHONE B1 BLOCKED (unintended GLB fallback due pilot.table.action-1, quality switches black, safe-area overlays/camera faults). The OWNER HAS DIRECTED to stay B1 until genuine highly photorealistic GLB and functioning High-mode on Galaxy A55. FIRST fix real GLTFLoader semantic anchor lookup; then black screen/quality resizing; then UI/camera; then premium PBR and on-device measured owner QA. NO B2/B3/B4, no old engine rewrite or signing/Play/main merge. After B1 full pass + B2/B3, complete Agro lobby and all 3 rooms, retro-convert old Lab Lobby/five labs, then entire game. Do not ask for repeating vision or B0/plant approval."**

**This is DOCUMENTATION ONLY. No fixed APK, no achieved photorealism, no new room or device measurement is implied by writing it.**
