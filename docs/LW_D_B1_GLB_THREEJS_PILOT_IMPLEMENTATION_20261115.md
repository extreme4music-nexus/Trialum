> **TOP PRIORITY — OWNER B1 REWORK; NOT A PASS (15 NOV 2026):** The user reviewed the signed B1 Galaxy A55 video and explicitly ordered NO ABANDONMENT of GLB/Three.js; remain at **B1** until **high-photorealistic visual quality and fully working real-GLB renderer** earn real OWNER PASS. First B1 signed [CI #176](https://github.com/extreme4music-nexus/Trialum/actions/runs/43703898547) was SOURCE PASS only; phone showed **FALLBACK geometry active — Missing or invalid GLB anchor: pilot.table.action-1**, intermittent **black canvas switching Eco/Balanced/High**, FPS continuing on blank image, overlapped Android upper bars/lower Classic metrics and camera wall/clipping problems. **B1 = REWORK/BLOCKED FOR ADVANCE; no B2/B3/B4.** User's future order: repair B1 photorealistic High → B2/B3 prerequisites → **COMPLETE new 3-door Agro ground-floor lobby plus ALL three working rooms (Warehouse, big Garden, small PhytoLab)** → RETROFIT old first-floor five-door Lab Lobby and labs → complete Trialum 3D transformation. Documented at [ADR-005](https://github.com/extreme4music-nexus/Trialum/blob/main/docs/ADR_005_OWNER_DIRECTIVE_B1_PHOTOREALISM_AND_FULL_3D_MIGRATION_20261115.md) · [B1 R1–R5 repair/evidence](https://github.com/extreme4music-nexus/Trialum/blob/main/docs/TRIALUM_B1_OWNER_REWORK_GLB_BLACK_SCREEN_AND_VISUAL_QA_20261115.md) · [full 3D roadmap](https://github.com/extreme4music-nexus/Trialum/blob/main/docs/TRIALUM_3D_COMPLETE_CONVERSION_AFTER_B1_OWNER_ROADMAP_20261115.md) · [ACTIVE B1 continue here](https://github.com/extreme4music-nexus/Trialum/blob/feature/lw-d-b1-threejs-glb-pilot-20261115/docs/LW_D_B1_OWNER_REWORK_CONTINUE_HERE_20261115.md). Earlier green labels and instruction "B1 next GO/NO-GO" are HISTORICAL. **Documentation task ONLY, no B1 fix code or new APK yet.** Preserve original engine, saved worlds, five old working labs and trusted SignQA. Read new ADR before any code change.

# TRIALUM LW-D B1 — REAL GLB + THREE.JS ISOLATED MOBILE PILOT
## Implementation, reproducibility, signed Android evidence and OWNER TEST GATE
**Date:** 2026-11-15. **Status:** B1 IMPLEMENTED + SOURCE/CI SIGNED PASS, **OWNER B1 ON-PHONE PASS PENDING**. No B2/B3/B4 started. B0 separately OWNER PASS by explicit approval after reviewing docs.

Read mandatory:
- [Canonical B0–B9 master](https://github.com/extreme4music-nexus/Trialum/blob/main/docs/TRIALUM_3D_WORLD_MASTER_PLAN_B0_B9_20261115.md)
- [Technical GLB / Scene / GPU / Bridge contract](https://github.com/extreme4music-nexus/Trialum/blob/main/docs/TRIALUM_3D_ASSET_SCENE_CONTRACT_20261115.md)
- [Owner phase gates](https://github.com/extreme4music-nexus/Trialum/blob/main/docs/TRIALUM_3D_PHASE_GATES_20261115.md)
- [ADR-004 conditional renderer pilot](https://github.com/extreme4music-nexus/Trialum/blob/main/docs/ADR_004_GLTF_FIRST_THREEJS_PILOT_20261115.md)
- [B1 pre-approved on-phone measurement matrix](b0/TRIALUM_B1_THREEJS_GLB_PILOT_TEST_PROTOCOL_20261115.md)

## 1. Exact implementation on isolated B1 source
- Branch: **feature/lw-d-b1-threejs-glb-pilot-20261115**, forked from the owner-accepted B0 source branch, not stale main; B0 OWNER PASS explicitly recorded in that branch.
- **Original gameplay modules untouched:** \`js/engine.js\`, \`js/longplay.js\`, \`js/progression.js\`, \`js/plant-lifecycle.js\`, \`js/storage.js\`, original food, pet/social AI and all five first-floor lab source modules unchanged. B1 added a single opt-in launcher, one isolated iframe renderer and opted-in optional SW cache, with no original-game action bridge or resource ledger modifications.
- \`js/lw-d-b1-pilot-launcher.js\`: independent **"🧱 B1 GLB Pilot"** button in original Classic header. Uses same-origin iframe, pauses old Classic visual renderer/audio while in pilot, closes/disposing the new one and restores old Classic on return; no original state mutation.
- \`prototypes/lw-d/b1/pilot.html\` + \`pilot.css\`: standalone orientation/safe-area-aware technical scene HUD. This is NOT a physical new Agro Room nor part of the existing five-lab building.
- \`prototypes/lw-d/b1/pilot-scene.json\`: **6×6 m** and 2.8 m height, Y-up, unit=m, semantic anchors **pilot.table.action-1** and **pilot.door.exit** with stable world transforms, camera and original no-gameplay authority.
- \`tools/b1/generate-glb.mjs\`: deterministic **real binary glTF 2.0 GLB** generation from declarative scene. Actual external \`pilot-room.glb\` has separately named floor, room walls with doorway, real door, workbench, PBR material definitions, and 2 named empty semantic nodes. **The GLB binary is generated at BUILD TIME (not committed as binary Git source)** and lives as its own file inside the offline APK. Renderer consumes it by URL using official GLTFLoader, not with hundreds of manually coded geometry definitions.
- \`tools/b1/package.json\` pins **three 0.187.0 / MIT** and **esbuild 0.28.2 / MIT**, build-time dependencies. \`tools/b1/build-assets.mjs\` generates external GLB, uses esbuild to embed Three.js + GLTFLoader + OrbitControls in one **local bundled JS**, includes Three MIT license and writes SHA256 provenance. **Mobile never downloads Three.js from a CDN.**
- \`prototypes/lw-d/b1/pilot-runtime.mjs\`: actual WebGL2 \`THREE.WebGLRenderer\`, \`GLTFLoader.loadAsync\` for external GLB, OrbitControls camera, raycasting of simplified semantic hit proxies, rejecting wall-occluded hits, visible anchor markers, PBR-compatible lighting and optional quality pixel ratio **Eco/Balanced/High**. Missing/malformed GLB produces an accessible fallback architectural model and a truthful status (not fake GLB success).
- Runtime measures sampled RAF intervals (mean FPS, p50/p95/p99 frame ms, scale), **not** GPU wattage/battery power. Hidden or closed scene stops RAF and releases controls/geometry/materials/renderer. On context loss pause safely. B1 no live engine/food/plant writes, no AI/background graphics, network uploads or permission requests.
- The original \`index.html\` only adds the opt-in launcher script; \`android-template/app/build.gradle.kts\` adds copy of \`prototypes/lw-d/b1/**\` within existing **com.trialum.ziivaiskra.signqa** package. \`sw.js\` only **optionally** caches pilot files after mandatory original Classic cache succeeds (missing generated GLB cannot break Classic PWA/offline caching).
- \`.github/workflows/lw-d-android-qa.yml\`: only trusted B1 branch owner push may sign using the PRE-EXISTING GitHub QA key, never Release/FriendsDebug, no new Firebase app, no new signing secret and no Play publishing. It compiles generated assets, asserts exact APK entries and verifies the SHA-pinned existing owner QA certificate.
- New tests \`tests/lw-d-b1-glb-pilot.test.cjs\` validate actual binary GLB v2 magic + chunks, deterministic named sockets, PBR materials, missing socket refusal, authored scene/engine isolation, bundled local assets/offline fallback and original 51-file core regression. Original L3.9, five 3D laboratories, food, backup, parent bridge, AI/social and FCM/source regression tests remain in LW-D SignQA CI.

## 2. Exact successful CI evidence — do NOT confuse with phone test
**GitHub Actions: [B1 run #176 — SUCCESS, BOTH JOBS](https://github.com/extreme4music-nexus/Trialum/actions/runs/43703898547)**.
- **Compiled source commit** (exact B1 APK): \`515219caedeb33f96d60f7619851dbda93d38a89\`; later documentation-only commits are not part of binary.
- Full Node regression, native :app:assembleSignqa, actual APK asset file entries, original Firebase identity, non-debuggable build, existing owner QA certificate verification: **PASS**.
- **Offline GLB actually built:** \`pilot-room.glb\` **5,292 bytes**, SHA256 \`2bd568a97682c009e259885436d52c1b76a1dd566c4a6025c7bbd7176163aacf\`. Contains 16 GLB nodes and 2 stable named semantic anchors.
- **Bundled renderer actually built:** \`renderer.bundle.js\` **652,352 bytes**, SHA256 \`e1760746e4d955b3551f5bd8af26ecfb7b84777f9866448712a36790a90cb9f5\`.
- **Signed internal test ZIP**: \`Trialum-LW-D-B1-OWNER-SIGNED-SIGNQA-176\`, GitHub artifact ID **14157481756**, ZIP SHA256 **9aa5bd5878d6c59249a16d18face97deab3fe7d7fa73e1a0382841afcfb42057**, expiry 2026-11-29. **Inside ZIP install ONLY \`Trialum-LW-D-B1-SIGNQA-SIGNED.apk\`.**
- There is also an independent intermediate \`Trialum-LW-D-B1-SIGNQA-UNSIGNED-176\` (artifact ID 14157940886), **NOT installable and NOT OWNER-QA approved**. Do not present it as a test app.
- Uses SAME existing package \`com.trialum.ziivaiskra.signqa\`, same QA certificate, versionCode 34. **Update in place. NEVER uninstall existing SignQA or clear local worlds.** If Android rejects due to versionCode/signature, STOP and report exact OS error; never wipe to work around.
- Both accepted original L3.9 OWNER PASS and B0 OWNER PASS are preserved. **B1 real device, FPS, PBR material appearance, anchors, fallback, API lifetime and battery impact have NOT been checked by the owner yet.** No "30fps achieved" claim permitted.
- Outstanding **inherited L3.9 English synchronization issue [#75](https://github.com/extreme4music-nexus/Trialum/issues/75)** remains separately unresolved, and the green targeted B1 build does NOT mean every repository workflow is green. B1 tester UI is English technical prototype.

## 3. OWNER Galaxy A55 test — do it slowly, report PASS or issues
Before B1 installation, safely export/backup original SignQA world via existing game if desired; the developer cannot take a backup from your actual phone. No reinstall/data deletion.
1. Download **SIGNED** artifact #176 from linked [B1 Actions page](https://github.com/extreme4music-nexus/Trialum/actions/runs/43703898547). Open ZIP, install signed APK as update to existing SignQA.
2. Open original game: confirm original save, pets and nursery are still present. At the top you should see the **"🧱 B1 GLB Pilot"** button alongside normal "Жив Свет · 3D"; original 3D must still function.
3. Tap B1 button. Room status should say **"REAL packaged GLB loaded; 2 named anchors verified"**. If it says FALLBACK or loading failed, DO NOT PASS: report the text/screenshot.
4. See actual floor/walls/door/workbench, correct ~6×6 room; orbit with one finger, pinch two fingers to zoom, Reset camera. Tap mint table and door markers — the exact stable IDs must appear in "Selected" readout; tapping through walls must not select hidden objects.
5. Choose **Test missing GLB fallback**; the room must visibly remain usable with status **FALLBACK geometry active**, *without modifying gameplay*. Press Reload real GLB and verify original returns.
6. Cycle Eco / Balanced / High and record on-screen avg FPS, p50/p95/p99 (e.g. after 60–120 seconds per mode; note initial warm-up and orientation). Compare approximate responsiveness with original NovaGL2 five-lab view; don't infer battery heat or GPU efficiency purely from FPS.
7. Open/close pilot ≥10 times and check battery warmth, loading time, graphics glitches, screen/Android Back, background/foreground/lock/unlock. The pilot must not silently continue rendering in the background.
8. Test airplane/offline mode after installing (packaged binary/JS must still load); no internet should be needed for the pilot nor original Classic.
9. Return to original **Classic Flora, Food Lab, saved habitats, and original five-laboratory 3D**. Ensure no seedlings, food, pets or settings were unexpectedly changed by merely opening/touching the pilot; user can report exact discrepancies without forcing backup restore.
10. Give the exact owner verdict **B1 PASS / ISSUES / REJECTED**. If uncertain or below expected performance, no rush: B1 stays DEVICE_TESTING, no B2 stage starts. If Three.js is not superior, retain NovaGL2 and decide GO/REWORK/NO-GO based on actual measurements.

### Device result (leave pending until owner tests)
- Actual phone/OS: **PENDING owner report** (intended Galaxy A55).
- GLB vs fallback: **PENDING**.
- Touch/anchors: **PENDING**.
- Eco/Balanced/High FPS and time samples: **PENDING**.
- Old game/backup persistence: **PENDING**.
- Thermal/battery/background and offline test: **PENDING**.
- Owner decision (Three.js GO/REWORK/NO-GO): **PENDING**.
- B1 status: **CI_PASS only, not OWNER_PASS**.

## 4. What is deferred and forbidden by this B1
No physical new ground-floor Agro Lobby, Warehouse, Greenhouse or PhytoLab 3D scene; no GLB model pack catalog or mass renderer conversion; no replacement/deletion of the existing NovaGL2 custom renderer, no new animation engine, no new food economy, no server/AI/FCM architecture changes, no game save reset, no real-world GPS/weather collection or public Play release.

**The next B2 (GLB registry and validation standard) may start ONLY after the owner independently approves B1.** B1's deterministic generator is a narrow prototype and must be generalized in B2 with fuller asset schema/integrity/third-party licenses if chosen.
