# TRIALUM B0 — NEXT AUTHORIZED WORK ORDER (SOURCE BASELINE FREEZE, NOT YET IMPLEMENTED)
**Owner direction:** 2026-11-15 · **Status:** READY TO START B0 ONLY / no B0 PASS yet, no 3D renderer modification.
**Mandatory canonical docs in main:**
- https://github.com/extreme4music-nexus/Trialum/blob/main/docs/TRIALUM_3D_WORLD_MASTER_PLAN_B0_B9_20261115.md
- https://github.com/extreme4music-nexus/Trialum/blob/main/docs/TRIALUM_3D_ASSET_SCENE_CONTRACT_20261115.md
- https://github.com/extreme4music-nexus/Trialum/blob/main/docs/TRIALUM_3D_PHASE_GATES_20261115.md
- https://github.com/extreme4music-nexus/Trialum/blob/main/docs/ADR_004_GLTF_FIRST_THREEJS_PILOT_20261115.md
- This branch also includes root AGENTS.md, README mandatory links, L3.9 engine/protected food and 3D owner vision docs.

## Verified starting facts — no re-testing accepted mechanics just to reopen them
1. User explicitly reported installing latest SignQA L3.9 game, liked the result and gave **FULL OWNER PASS for the original plant engine/logic**.
2. GitHub Actions [#171 SUCCESS](https://github.com/extreme4music-nexus/Trialum/actions/runs/43670180653), compiled source SHA **7466c38c0f863cf4299fbdf6263f823c60b2608d**, owner signed artifact **Trialum-LW-D-L3-9-OWNER-SIGNED-SIGNQA-171**, package **com.trialum.ziivaiskra.signqa**. This is an actual core engine acceptance, not an acceptance of a future GLB renderer.
3. Active source stays in **Draft PR #73**, based on **Draft PR #72**. Main received only canonical architecture documentation; **do not falsely treat main as merged with L3.9 game code**.
4. Existing custom WebGL2/NovaGL2 world.js, five FIRST-FLOOR lab rooms, original plant and food engine, original save, pets, friends, FCM and AI are protected regression baselines. Global main HUD, five-door upstairs laboratory lobby and future three-door GROUND-FLOOR Agro lobby must remain distinct.
5. No B0/B1/B2/B3 device/GLB acceptance has yet been performed. The next Android SignQA for new scene/renderer still requires separate trusted GitHub signer and owner test. No local signing, no Release/FriendsDebug/Play change.

## Deliverables of B0 (check only after real work)
- [ ] B0.1 Identify the actual head commit, active Draft PR graph and safe branch starting point from L3.9 (not a fresh start from stale main).
- [ ] B0.2 Create a NEW isolated B0 branch and Draft PR, preserve old working source; do not merge anything without owner acceptance.
- [ ] B0.3 Capture full source-inventory table: js/engine.js/progression/longplay/plant-lifecycle, app.js original action bridge, js/lw-d-interface.js same-origin gate, prototypes/lw-d/world.js custom renderer, lab-complex.js, every five individual lab room module, world-navigation.js/hub-pages, Android asset sync and offline SW.
- [ ] B0.4 List exact no-regression test command/file and run status for: garden seedlings and real death, Food Lab stock, plant ID transfers, existing five rooms, camera/picking, signed Android app, physical back/resume, social/FCM, backup/restore and English.
- [ ] B0.5 Freeze a source SHA/evidence manifest and mark which rooms/routes are real 3D vs HUD links/future shells. Preserve existing package/signer/backup rollback instructions; no destructive local restore.
- [ ] B0.6 Record current renderer behavior/device limitations: WebGL2 draw loop/visibility gate, manual 3D shapes/camera/picking, no true GLB loader/PBR texture pipeline; no invented FPS/battery measurements.
- [ ] B0.7 Create explicit B1 pilot acceptance test plan comparing legacy renderer to bundled offline Three.js GLB scene on the owner’s Galaxy A55; prototype room ~6×6m, measured touch, memory/context, FPS, thermal/battery, hidden lifecycle, portrait/landscape/safe-area, full offline. GPU results cannot be guessed from code.
- [ ] B0.8 Establish B1 draft asset manifest + schema/anchor names and fallback strategy to be validated in B2, avoiding premature big-world geometry.
- [ ] B0.9 Owner reviews exact B0 baseline/evidence and gives B0 PASS. Only then begin B1.
- [ ] B0.10 Add automated structural/contract lint proposals to future B1/B2 (GLB anchors/scale/asset registry); **do not claim mechanical enforcement until CI actually runs them**.

## B0 NO-GO conditions
- Rewriting original L3.9 engine/gameplay, food or pets to simplify scene tests.
- Building new 3D Agro Lobby, Warehouse, huge Greenhouse or PhytoLab in B0.
- Swapping world.js entirely to Three.js before B1 measured trial and owner verdict.
- Replacing original SignQA package/keystore, creating new Firebase app, changing production server or publishing Play/Release.
- Claiming owner acceptance of B0 based on already accepted L3.9 plant engine.

## Handoff after B0
When owner explicitly passes B0, the ONLY next item is **B1 small offline Three.js GLB room**, with original WebGL2/NovaGL2 preserved as a fallback. If B1 measured trial fails, return with a comparison and alternatives rather than bulldozing into B2–B9.

**This document is solely a work order. It contains no implementation, geometry, model, new app build, nor B0 PASS.**
