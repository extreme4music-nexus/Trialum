> **TOP PRIORITY — OWNER B1 REWORK; NOT A PASS (15 NOV 2026):** The user reviewed the signed B1 Galaxy A55 video and explicitly ordered NO ABANDONMENT of GLB/Three.js; remain at **B1** until **high-photorealistic visual quality and fully working real-GLB renderer** earn real OWNER PASS. First B1 signed [CI #176](https://github.com/extreme4music-nexus/Trialum/actions/runs/43703898547) was SOURCE PASS only; phone showed **FALLBACK geometry active — Missing or invalid GLB anchor: pilot.table.action-1**, intermittent **black canvas switching Eco/Balanced/High**, FPS continuing on blank image, overlapped Android upper bars/lower Classic metrics and camera wall/clipping problems. **B1 = REWORK/BLOCKED FOR ADVANCE; no B2/B3/B4.** User's future order: repair B1 photorealistic High → B2/B3 prerequisites → **COMPLETE new 3-door Agro ground-floor lobby plus ALL three working rooms (Warehouse, big Garden, small PhytoLab)** → RETROFIT old first-floor five-door Lab Lobby and labs → complete Trialum 3D transformation. Documented at [ADR-005](https://github.com/extreme4music-nexus/Trialum/blob/main/docs/ADR_005_OWNER_DIRECTIVE_B1_PHOTOREALISM_AND_FULL_3D_MIGRATION_20261115.md) · [B1 R1–R5 repair/evidence](https://github.com/extreme4music-nexus/Trialum/blob/main/docs/TRIALUM_B1_OWNER_REWORK_GLB_BLACK_SCREEN_AND_VISUAL_QA_20261115.md) · [full 3D roadmap](https://github.com/extreme4music-nexus/Trialum/blob/main/docs/TRIALUM_3D_COMPLETE_CONVERSION_AFTER_B1_OWNER_ROADMAP_20261115.md) · [ACTIVE B1 continue here](https://github.com/extreme4music-nexus/Trialum/blob/feature/lw-d-b1-threejs-glb-pilot-20261115/docs/LW_D_B1_OWNER_REWORK_CONTINUE_HERE_20261115.md). Earlier green labels and instruction "B1 next GO/NO-GO" are HISTORICAL. **Documentation task ONLY, no B1 fix code or new APK yet.** Preserve original engine, saved worlds, five old working labs and trusted SignQA. Read new ADR before any code change.

## Scope and evidence
- [ ] State exact milestone/task ID and distinguish code/CI pass from owner-device/independent approval
- [ ] Preserve worlds, backups, offline gameplay, consent and ad-free policy
- [ ] Attach relevant regression tests, expected result and exact workflow URL

## Text / translations (mandatory for every text-bearing PR)
- [ ] Every added/modified user-visible text string (menus, errors, dialogs, notifications, AI, accessibility, tutorials, native Android) was audited against **English** in this same PR; `locales/en.json` and tests were updated wherever needed
- [ ] If no text was changed, state **"no user-visible text change"** explicitly in the PR description
- [ ] Names, written pet histories and private user content were never auto-translated
- [ ] Other 15 locale catalogs are intentionally deferred to owner-approved milestone transitions **after Living World**, except blocking safety corrections

See `docs/ENGLISH_TEXT_SYNC_POLICY.md`.

## MANDATORY NEW 3D WORK — owner B0–B9 architecture (conditional)
**If PR touches 3D rooms, models, GLB/glTF, renderer, camera, picking, scene graph, spatial HUD, location/weather visuals, or new model asset loading, complete this entire section.**
Normative documents in main: [B0–B9 plan](https://github.com/extreme4music-nexus/Trialum/blob/main/docs/TRIALUM_3D_WORLD_MASTER_PLAN_B0_B9_20261115.md) · [asset/scene contract](https://github.com/extreme4music-nexus/Trialum/blob/main/docs/TRIALUM_3D_ASSET_SCENE_CONTRACT_20261115.md) · [owner phase gates](https://github.com/extreme4music-nexus/Trialum/blob/main/docs/TRIALUM_3D_PHASE_GATES_20261115.md) · [ADR-004 renderer pilot](https://github.com/extreme4music-nexus/Trialum/blob/main/docs/ADR_004_GLTF_FIRST_THREEJS_PILOT_20261115.md).
- [ ] Named **ONE** active B-phase, previous-stage OWNER PASS, exact branch/base/source SHA; no parallel or skipped phase.
- [ ] If B0/B1: preserved last owner-passed L3.9 core; B1 is a separate Three.js/WebGL2 GLB PILOT, **NOT** a full renderer replacement, and old NovaGL2 still works.
- [ ] GLB is externally loadable and offline-packaged; stable 1 unit=1 meter, Y up, transforms, named anchors/sockets, proxy raycasts/collisions, renderer fallback and asset/texture licenses documented.
- [ ] No duplicate engine/save/inventory/plants/food/rewards; 3D operations are validated by original parent TrialumEngine and visual receipts appear **only after success**.
- [ ] Existing five FIRST-FLOOR labs and future three GROUND-FLOOR Agro rooms are correctly distinguished; Garden 4×5 terrestrial plus aquarium ×4 canonical capacity respected.
- [ ] Mobile performance, touch/back, pause/resume, memory/disposal, adaptive quality and offline / no-GPS behavior tested or clearly marked still untested.
- [ ] Automated regression/tests, GitHub Actions, exact trusted permanent SignQA identity/artifact and existing save/backups verified; no local signing/Play merge/Release/FriendsDebug changes.
- [ ] Separate CI PASS from actual **OWNER ON-DEVICE PASS** and provide exact owner approval; if pending, leave Draft/NOT ACCEPTED.
- [ ] If any constraint is intentionally changed, cite a **versioned owner-approved waiver/ADR** with risk, impact and rollback. "AI chose a shortcut" is not a waiver.
**A checked list is a review aid, not configured branch-protection/CI enforcement. Do not call a phase complete without owner approval.**
