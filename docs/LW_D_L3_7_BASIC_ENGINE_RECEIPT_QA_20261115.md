# TRIALUM LW-D L3.7-B — BASIC LAB: REAL ENGINE → ONE 3D REACTION
**Prepared 2026-11-15.** Branch: `feature/lw-d-l3-7-laboratory-life-reactions-20261115` · Draft PR #71.
**Current status:** Source slice implemented; dedicated current GitHub Actions build and owner phone gate tracked separately. Do NOT claim OWNER PASS or merge into main without the owner's explicit sign-off.

## Why this slice matters
Preexisting L2 Basic Lab already renders 4 machine-specific 3D animations for synthesize/analyze/harvest/grow. L3.7 must NOT rebuild these or invent synthetic scoring. The important new feature is **engine correlation and truth**: one original operation yields one visual reaction, at its real physical station, with correct numbers, then stops.

## Implemented changes in active L3.7 branch
- Canonical, same-origin parent `js/lw-d-interface.js` assigns monotonic **presentation-only** `seq` to all five lab original-engine result types. The engine/save/FCM channels do not depend on these IDs.
- `prototypes/lw-d/live-context.js` sends `seq` to the view-only result events and sends language with real saved-world projection.
- `prototypes/lw-d/event-reactions.js` normalizes Basic metric deltas strictly from before/after; **failed actions have no credited increase**. New bounded `createTracker()` accepts only new seq, visible scene/room and time. It consumes offscreen receipts without queued replay.
- `prototypes/lw-d/lab-process.js` retains all original four machine-specific effects. It adds honest MK/EN result captions: e.g. `Синтеза · Молекули +5` / `Synthesis · Molecules +5`, or `Без добивка` on failure. Zero delta = no increase, not a phantom reward.
- `prototypes/lw-d/world.js`: a small noninteractive `lw-lab-receipt` follows the physical Basic machine projected from the actual WebGL camera; 2.6s normal / 1.1s reduced motion. Immediate cleanup on room departure, background pause, WebGL loss and scene changes. Original existing source geometry untouched.
- The Basic HUD now allows only **one pending** original engine operation at a time. Repeated quick taps cannot silently start another spend before the parent result resets pending.
- `prototypes/lw-d/spatial-audio.js` consumes monotonic engine receipts: duplicate/stale callbacks cannot play the same machine sound again.
- The existing Android APK asset list already includes the updated event-reactions/room/scripts; no external packages, new permissions or CDNs added.

## Verification tests (source-level)
- `tests/lw-d-l3-7-engine-visual.test.cjs`: exact Basic +5, MK/EN caption, failure/zero/negative handling, duplicate/out-of-order, offscreen/background drop, short lifetime, one in-flight Basic HUD action, authoritative parent receipts and no storage/network/AI.
- `tests/lw-d-audio-spatial.test.cjs`: confirms engine success SFX starts once even on duplicated receipt.
- Preserve `tests/lw-d-lobby-entry.test.cjs`, `prototypes/lw-d/lab-process.test.cjs`, all other room-parity tests, FCM, audio hotfix #123, Classic, backup and build/signing.
- Signed APK MUST be built only by trusted GitHub Actions on the existing `com.trialum.ziivaiskra.signqa` identity; never install intermediate UNSIGNED APK.

## Precise next owner phone checks (when signed build is ready)
1. Update existing SignQA **in place**; do not uninstall, clear app data or reset the game world.
2. Verify older owner-passed L3.6 main lobby and five doors unchanged.
3. Open Basic Lab, perform one actual `synthesize` operation; the original game must deduct/award correctly ONCE, show localized 3D machine response and accurate `+N` near the right machine.
4. Immediately double-tap a Basic action: while pending it must not send a second request, spend again, or create a duplicate effect. Check real resource totals and backup.
5. Perform denied/locked/insufficient-resource original operation: amber 3D reaction and **no gain**, with no fake positive metric.
6. Navigate away from Basic and back before the 3D reaction expires; nothing replays. Background/resume, close/reopen 3D and repeat to verify no ghost effects or ghost sounds.
7. With music ON, ensure the previous audio-silence hotfix is audibly working, turning camera changes machine sound. If still silent, no L3.7 audio PASS.
8. Only owner's explicit pass closes B and authorizes the next independent C slice, **DNA first**, then Food → Flora → Research → Lobby echo; no wholesale 3D model remaster.

## Invariants / scope locks
- No new XP, tokens, pet IDs, species, research tiers, inventory, background AI, server requests or saved state.
- No main merge, external Play/public APK, Firebase app changes, signing secrets or Release/FriendsDebug changes.
- Main Lobby remains universal public/non-home hub; shared pet mini-city remains future proposal only.


## VERIFIED L3.7-B AUTOMATED ACCEPTANCE EVIDENCE (2026-11-15)
- **GitHub Actions run #146 — SUCCESS**: https://github.com/extreme4music-nexus/Trialum/actions/runs/43659528920
- Exact built and tested SOURCE SHA: `0c5c31be53e226750217555a9889b4ec3bfcb7cd`.
- **Signed, installable ZIP artifact:** `Trialum-LW-D-L3-7-OWNER-SIGNED-SIGNQA-146`, artifact ID `14139204004`, SHA256 ZIP `3eadd6b8fac26c678f485f69d268c69bd0f79af2c5a1bfcc07a3cffc1a45f91d`, expiration **2026-11-29**.
- Extract `Trialum-LW-D-L3-7-SIGNQA-SIGNED.apk` from the signed ZIP; update existing `com.trialum.ziivaiskra.signqa` **in place**, never uninstall/clear app data. Do NOT install `Trialum-LW-D-L3-7-SIGNQA-UNSIGNED-146` (intermediate).
- Full original engine, legacy labs, 3D/audio/new idempotent receipt regression suite and Android SignQA passed; GitHub QA signature pinned to existing owner's certificate.
- **B VISUAL PHONE OWNER PASS: PENDING.** Earlier **AUDIO OWNER PASS: STILL PENDING**, despite corrective build #123 and later builds containing the fix. Only owner physical Samsung Galaxy A55 confirmation can close either.
- After B on-device test/owner approval, NEXT DRAFT phase slice is **C: DNA verified-event mapping and exact chosen pet**. Do not begin Food/Flora/Research/Hub in parallel or undertake deferred city/whole-model remaster.
