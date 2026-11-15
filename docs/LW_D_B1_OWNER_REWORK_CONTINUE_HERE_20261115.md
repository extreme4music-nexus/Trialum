# TRIALUM — ABSOLUTE CONTINUE-HERE AFTER A SESSION/TOKEN LIMIT (B1 OWNER REWORK)
**Written on 2026-11-15 solely as documentation; no code repaired by this documentation task.** This file lives directly in the ACTIVE B1 branch so a new Codex/ChatGPT session does not accidentally return to B0, forget why B1 failed, or start constructing later rooms prematurely.

## READ AND OBEY — owner decision, do not seek it again
The user viewed the first B1 prototype on Samsung Galaxy A55 and then explicitly said:
1. We are NOT giving up.
2. Real GLB/Three.js 3D transformation is our chosen path.
3. Fix all failures and **STAY IN B1** until **HIGH PHOTOREALISTIC QUALITY AND FUNCTIONALITY** are achieved and explicitly approved on the actual phone.
4. After that threshold, COMPLETE the **entire new Agro ground-floor lobby and all THREE rooms** (original Food Warehouse, huge Garden/Greenhouse, small PhytoLab).
5. THEN migrate/upgrade the existing **FIRST-FLOOR five-door Laboratory Lobby** and old lab rooms to the same visual/scene standard.
6. THEN continue until the entire Trialum game has a coherent real 3D world.
0. **FIRST DOCUMENT** everything in GitHub so a current session-limit interruption cannot erase it.

The user's statement is a **binding change of scope/order and quality bar**, formally recorded in NEW [main ADR-005](https://github.com/extreme4music-nexus/Trialum/blob/main/docs/ADR_005_OWNER_DIRECTIVE_B1_PHOTOREALISM_AND_FULL_3D_MIGRATION_20261115.md). [Main B1 video incident and R1–R5 repair gates](https://github.com/extreme4music-nexus/Trialum/blob/main/docs/TRIALUM_B1_OWNER_REWORK_GLB_BLACK_SCREEN_AND_VISUAL_QA_20261115.md). [Main total 3D conversion roadmap](https://github.com/extreme4music-nexus/Trialum/blob/main/docs/TRIALUM_3D_COMPLETE_CONVERSION_AFTER_B1_OWNER_ROADMAP_20261115.md).

**STATUS RIGHT NOW: B1 OWNER-DIRECTED REWORK / BLOCKED FOR NEXT PHASE.** B0 owner PASS; L3.9 plant engine owner PASS; B1 signed SOURCE CI PASS but **NOT** real-device OWNER PASS. B2/3/4 and new physical Agro rooms NOT started. Do not call a high FPS number on a black screen an achievement.

## Source and exact GitHub provenance
- Repo **extreme4music-nexus/Trialum**.
- Active **feature/lw-d-b1-threejs-glb-pilot-20261115**, [Draft PR #76](https://github.com/extreme4music-nexus/Trialum/pull/76) (base [B0 Draft #74](https://github.com/extreme4music-nexus/Trialum/pull/74) → L3.9 Draft #73). GitHub main only contains normative docs, not merged B1 code.
- First B1 signed source **515219caedeb33f96d60f7619851dbda93d38a89**, [GitHub Actions #176 2/2 SUCCESS](https://github.com/extreme4music-nexus/Trialum/actions/runs/43703898547), old permanent GitHub SignQA package **com.trialum.ziivaiskra.signqa**, signed artifact **Trialum-LW-D-B1-OWNER-SIGNED-SIGNQA-176** (artifact ID 14157481756), old source app accepted for original Trialum engine.
- B1 has local Three.js 0.187.0, actual build-generated 5,292-byte glTF2 pilot-room.glb, 652,352-byte Three bundle, two stable designed anchor IDs (pilot.table.action-1, pilot.door.exit), separate launcher and no separate game engine.
- Tests had only validated raw GLB binary, node JSON and packaging; **they did not prove actual GLTFLoader-deserialized semantic anchor names nor visible WebGL canvas on a physical phone**.
- Pre-existing English sync issue #75 separate; no root-cause confusion.

## Verified owner video findings (do not claim resolved)
**R01 real GLB unintentionally FAILED:** on-phone line exactly “FALLBACK geometry active — Missing or invalid GLB anchor: pilot.table.action-1”. App shows fallback meshes; cannot claim successful real GLB display.
**R02 black canvas:** changing Eco/Balanced/High sporadically blanks actual 3D render while HUD stays visible. Recovering later is NOT stable.
**R03 FPS not trustworthy:** RAF reported around 100–115 FPS while black canvas; actual visible geometry, frame pacing and power draw need validation.
**R04 mobile interface overlays:** top/exit overlap Android status area, Classic button bottom occludes FPS/metrics. Android safe-area and nested iframe/overlay layout need repair.
**R05 camera:** OrbitControls allows unnatural near-wall/through-wall/clipping views.
Partial good: pilot launches, camera/markers can respond and Classic return is possible. Not enough for B1 PASS.

**Root cause hypotheses NOT verified:** GLTFLoader sanitizes glTF node names containing '.', and current code does getObjectByName(original ID), plus extras.semanticAnchor compare; switching quality DPR+setSize without renderer lifecycle synchronization may cause black frames. Device log/test harness required, do not claim fixed by hypothesis.

## Precise next repair steps — ONLY B1, ONE AT A TIME
**B1-R1 (FIRST):** inspect generated glTF and actual r187 GLTFLoader nodes, examine userData.semanticAnchor and normalized names; resolve by stable semantic extras with uniqueness/transform checks. Make REAL GLB load status visible, keep deliberate fallback test, add real-loader test and phone proof. No new room/building/engine edits.
**B1-R2:** reproduce and eliminate black canvas under repeated 20+ mixed Eco/Balanced/High toggles, orientation, pause/resume/context loss/scene reload. Log canvas intrinsic vs CSS size, DPR, camera matrix, WebGL errors, drawability; verify *visible pixels*, not only RAF FPS.
**B1-R3:** fix Android native/iframe safe areas, top controls and Classic overlay vs metrics; touch/pinch/Back; bounded camera collision and no wall penetration; 10+ room enter/exit.
**B1-R4:** real **premium/photorealistic GLB/PBR** visual sample with licensed/provenance-backed textures, believable realistic lighting, shadows/reflections/depth in stable Android High; Eco/Balanced must gracefully scale. Full 3D scene remains isolated and read-only.
**B1-R5:** full original L3.9 flora/food/backup/social/pets/AI/five-lab 3D parity and signed CI, offline, context/resume, zero black frames and sustained A55 quality/performance; **owner actual on-phone judge says B1 PASS**. Until then rework.

After R5 owner-approved, B2 asset/validator, B3 reusable scene/engine bridge; then GROUND FLOOR complete THREE actual rooms + lobby (B4–B9), then RETRO-LAB first-floor lobby and five labs, then WORLD-3D until full game. No automatic public Play release and no premature merge.

## Source code locations needing first inspection on next session
- prototypes/lw-d/b1/pilot-runtime.mjs: loadRoom actual GLTFLoader/getObjectByName/semantic extras and fallback, canvas size/quality, renderer lifecycle, OrbitControls, metric frame() / showMetrics().
- tools/b1/generate-glb.mjs: GLB named nodes and extras; tools/b1/build-assets.mjs for locally pinned Three.js, license/GLB hash.
- prototypes/lw-d/b1/pilot-scene.json: metric dimensions/anchors/camera.
- prototypes/lw-d/b1/pilot.css and pilot.html: system inset and metrics layering.
- js/lw-d-b1-pilot-launcher.js: external Classic close button + iframe, visibility and disposal.
- tests/lw-d-b1-glb-pilot.test.cjs: static tests insufficient for actual loader/visual correctness. Add required runtime/device evidence, do NOT merely delete assertions.
- .github/workflows/lw-d-android-qa.yml: only owner GitHub permanent QA signer, existing package; no local signing/new Firebase.
- Protected original: js/engine.js, js/progression.js, js/longplay.js, js/plant-lifecycle.js, js/storage.js, original food, old world.js and five labs.

## Exact resume checklist for ChatGPT/Codex
1. Fetch this file, main ADR-005, main B1 incident, original master/contract/gates and current PR #76 **before** editing code.
2. Verify latest B1 branch SHA and current test status; previous source signed #176 is historical, current docs-only commits don't automatically have identical signed APK.
3. Identify the FIRST incomplete B1.R step and work ONLY that; do not rewrite whole app.
4. Add actual Three GLTFLoader runtime tests and robust device-checkable telemetry/visual proof, not just raw GLB binary parse.
5. Build signed only through existing owner GitHub SignQA and link exact downloadable **SIGNED** GitHub artifact, not UNSIGNED or unverified sandbox. No uninstall/clear data.
6. Ask for owner phone validation after actual fixed build; record defects and owner PASS exactly; remain B1 until photorealistic High and functionality approved.
7. Do not create Agro rooms, B2/B3, retro-labs or full city now. They are subsequent mandatory programs, not contemporaneous tasks.
8. Every significant decision in GitHub docs and PR, no premature green labels or false claims.

**NEXT ACTUAL USER-AUTHORIZED WORK FOR THIS TURN = DOCUMENTATION ONLY. DO NOT FIX CODE BEFORE A SEPARATE CONTINUE INSTRUCTION.**
