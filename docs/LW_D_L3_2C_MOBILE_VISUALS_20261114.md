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

## Verified first signed Android QA build

**[GitHub Actions run #43623466566](https://github.com/extreme4music-nexus/Trialum/actions/runs/43623466566) — SUCCESS.** Source SHA `12d741b822bc14ca810cf831704ad9031b069bdb` (later documentation commit does not modify Android code).

- LW-D DNA geometry and responsive-tier tests; LW-C AI/social; FCM and signing regressions; JavaScript syntax: **PASS**.
- Existing `:app:assembleSignqa` package/Firebase HTTPS configuration and full Android build: **PASS**.
- GitHub owner-only automatic QA-keystore signing, pinned SHA256 certificate, APK integrity and upload: **PASS**.
- **Installable signed ZIP artifact**: `Trialum-LW-D-L3-2C-OWNER-SIGNED-SIGNQA-80` (artifact ID `14124744720`, approximately 6.44 MB). It contains `Trialum-LW-D-L3.2C-SIGNQA-SIGNED.apk`, SHA256 checksum and BUILD-INFO. [Run Artifacts](https://github.com/extreme4music-nexus/Trialum/actions/runs/43623466566), expires **2026-11-28**.
- The separate `Trialum-LW-D-L3-2C-SIGNQA-UNSIGNED-80` artifact is **NOT installable**; do not distribute it to testers.
- **OWNER DEVICE QA PENDING**: no physical-device FPS measurement or acceptance yet. The new code's performance benefit has been established by draw-submission/pixel-cap regression tests, not a claimed measured frame rate.

After owner tests: record pass/fail before declaring L3.2-C closed. Keep Release/Debug, beta/Play, existing world data and server untouched.

## OWNER ACCEPTANCE — 2026-11-14

**OWNER PASS.** Following installation of the latest owner-signed LW-D L3.2-C build (#80), the owner explicitly confirmed: “Имаш потврда од мене. Тестира ја најновата инстанца и супер е. Не можам да снимам видео моментално, али терај. Прифатено е од мене. Оди натаму другар.” This authorizes continuation to **L3.3**. A separate recording or exact FPS measurement was not provided; do not invent it. This is not approval to release on Play or merge into Codex-managed release branches.
