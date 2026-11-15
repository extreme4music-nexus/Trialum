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
