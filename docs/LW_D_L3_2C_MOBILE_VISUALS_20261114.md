# LW-D L3.2-C — DNA Room Visual Foundation & Mobile Performance | 2026-11-14

**Owner-approved continuation:** L3.2-B was reported working and correct by the owner on 2026-11-14 ("Готово. Супер, исправно"). This is a new incremental visual/performance slice, NOT a gameplay redesign. The actual 3D DNA controls and original DNA engine from L3.2-B remain unchanged.

**Source:** `feature/lw-d-l3-2c-mobile-visuals-20261114`, branched from `feature/lw-d-l3-2b-functional-dna-20261114`. PR is draft until user phone acceptance; never merge to main/beta/Play or change Codex Release / FriendsDebug.

## Implemented work
- `prototypes/lw-d/dna-room.js`: add reusable low-cost luminous chamber ring geometry, wall-console depth and restrained cyan/violet floor paths with ordinary opaque WebGL cube geometry. No alpha glass, bloom/refraction, photo textures, remote assets or new 3D engine.
- Same source module exports `qualityForViewport(width,height,dpr,reducedMotion,slowFrames)`: a **pure deterministic** choice of `rich` vs `balanced`; no device fingerprinting or analytics. High-DPR mobile phones, reduced-motion users and slower frames use fewer decorative draw submissions.
- Rich mode adds layered suspended light halos, full circular chamber trims and decorative station details. Balanced retains the main DNA helix, all three functional stations, room walls, floor, safe focus camera, lock/unlock indicator and real success/failure pulse while reducing selected decorative details and sphere draw calls. The result pulse stays tied to the existing parent engine response; no fake reward.
- `prototypes/lw-d/world.js`: **only when DNA 3D is active**, cap frame-buffer pixel ratio to `min(devicePixelRatio,1.5)` rather than 2, minimizing fragment shader cost on Galaxy A55-class high-DPR devices. All other LW-D scenes continue to use their prior 2x cap.
- DNA detail selector is recalculated from logical viewport and DPR on resize; if at least 8 frame samples exceed 55 ms, scene downgrades to `balanced` for the current visit, without oscillating. It resets upon exit/re-entry. No timers, server calls, save mutations or extra background rendering. `canRender()` visibility gate is preserved.
- Existing MK/EN HUD, functional DNA operations, FCM, friends/AI dialogues, user backups and progress remain untouched. No shader source changes shared with other scenes.

## Automated tests and gates
- `prototypes/lw-d/dna-room.test.cjs`: rich/balanced choice and invalid inputs; the mobile tier must reduce draw submissions substantially without deleting chamber/stations; signed game engine result pulse must still be +3 calls in both modes. Check core world never writes a second save state.
- `tests/lw-d-dna-actions.test.cjs`: interaction, confirmations and exact original source-of-truth DNA engine still intact with explicit quality argument.
- Retain entire LW-C, LW-D, FCM, Android Firebase client resource and existing GitHub QA-signature checks in `.github/workflows/lw-d-android-qa.yml`.
- **Build/signing contract:** only `com.trialum.ziivaiskra.signqa`, registered `TRIALUM_FIREBASE_APP_ID_SIGNQA`, pre-existing GitHub `TRIALUM_QA_* ` Secrets, pinned SHA-256 QA certificate; build and sign fully automated on owner-pushed trusted branch. **Never ask for local signing or a new Firebase App ID.**

## Physical Samsung test
1. Update existing SignQA APK in place (no uninstall, no data wipe).
2. 3D Living World → Laboratory Corridor → DNA Lab. Observe central ring lighting and floor markings; verify three machine selections and real DNA controls.
3. Rotate/zoom: camera remains outside benches, Android stays responsive in landscape. Look for frame stutter or overheating; numerical FPS is not claimed without measurement.
4. Confirm original gene editing, lineage, cancel, locked constraints, FCM notification, backups and classic fallback still work.
5. Owner reports PASS or exact defect. No public release/merges without user direction.

**Next:** after L3.2-C phone PASS, begin L3.3 Food Laboratory foundation, reusing tested modular room/rendering/camera/interaction standards. Later owner-directed gameplay logic redesign must be a separate deliberate phase with migration and data invariants.

See `docs/LW_D_CANONICAL_OPERATING_RULES_20261114.md` for permanent repo-wide LW-D rules.
