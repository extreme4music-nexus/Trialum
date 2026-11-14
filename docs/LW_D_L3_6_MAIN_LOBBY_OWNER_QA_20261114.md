# TRIALUM LW-D L3.6 — MAIN LOBBY + VISUAL / ANIMATION POLISH
**Date:** 2026-11-14. **Owner:** extreme4music-nexus.
**Branch:** `feature/lw-d-l3-6-lobby-entry-polish-20261114`, based on **OWNER-PASSED** L3.5 `feature/lw-d-l3-5-research-complete-20261114`.
**This is a private SignQA test lane only. NEVER merge to main, Codex Release/FriendsDebug, Play Console or backend without explicit owner authorization.**

## Exact owner instruction and prior acceptance
The owner tested L3.5 fifth 3D Research Laboratory and gave **“еден огромен пасс”**. Then requested:
> “Ходникот треба да биде главното лоби за лабораторијата, и кога ќе влезеш во лабораторија треба таму да те носи, а од таму да одиш низ различните лаборатории. Среди го ова воедно со следниот чекор.”

**Acceptance:** L3.5 Owner PASS. **L3.6 lobby and structural polish: OWNER PASS CONFIRMED (2026-11-15).** The owner reports physically testing the build, liking it and explicitly says the 3D complex skeleton is excellent and accepted. This is not approval of individually unreported device scenarios, full final 3D rendering or a public release. Prior stages (DNA Classic parity, food, flora, L3.5) must not be rewritten or lose original functions.

## Final intended flow
`Existing owner saved world → tap ‘✦ Жив Свет · 3D’ → MAIN LOBBY → choose one of five doors → selected 3D laboratory → ‘↩ лоби’ → MAIN LOBBY → different room`. The visible **Lab / Lobby dock** always returns to **MAIN LOBBY**, including after moving to other 3D scenes; it must NOT return to the former Basic lab directly. If the owner exits 3D and reopens, the newly created iframe again opens at the lobby, without saving a new per-room progress state. The Basic Laboratory is still available by selecting its door (no functionality lost).

## Actual fixes
1. **Single owner-level navigation contract:** `TrialumLabComplex.INITIAL_VIEW="hub"`, consumed by `world.js` and `live-context.js`. Both initially render the same lobby and use real 3D architecture; no flash of the Basic room at entry.
2. **No hidden Basic Lab shortcuts:** world Lab dock maps to `enterComplexRoom("hub")`; World Atlas opens corridor and drops its direct `lab→basic` skip; original basic controls only appear while actively inside Basic room; the older basic process callback no longer silently switches the player out of the lobby. Every specialized room still has a back-to-lobby action.
3. **Five genuinely spatial doors:** Basic (⚗️), DNA (🧬), Food (🧪), Flora (🌱), Research (🔬); tap the actual 3D door or use the matching accessible holographic list. All previous engine-connected operations stay unchanged.
4. **Lobby graphics and animation:** animated orbiting ceiling light halos, suspended 3D hologram core, five rhythmic ground guide paths, highlighted doorframes, transparent UI entry animation and clean small-phone hit areas. Works with existing WebGL2 primitives and existing requestAnimationFrame only while visible; reduced-motion CSS disables HUD entrance effects.
5. **Living-world readouts:** four small 3D indicator bands read `compounds`, `insight`, `pets` and `biomass` **from the real parent saved world**. The central lobby hologram shows original research lab tier, lab actions, pet count and insight. The effect never generates currency, pet interactions, progression, saves or background notifications; absent world state means no visual progress indicators.
6. **MK/EN localization retained:** eight additive strings to the English exact-phrase catalog and accepted forward-only translation ledger. All earlier 1,037 accepted English strings remain intact; total 1,045.
7. **Permanent regression gate:** `tests/lw-d-lobby-entry.test.cjs` checks the canonical default, dock/Atlas entry, all five doors, never auto-switch to basic after activity, verified live state visual projection, bilingual labels and existing owner-key SignQA signing. Original DNA/Food/Flora/Research/LW-C/FCM/backup tests continue to run.
8. **Security:** no Firebase app registration, new Android ID or signing key; the existing `com.trialum.ziivaiskra.signqa` with GitHub pinned owner QA certificate remains unchanged. No automatic merge or device-data reset.

## Original staged acceptance checklist — phase skeleton OWNER PASSED (individual subchecks not separately attested)
Install ONLY the verified **OWNER-SIGNED-SIGNQA** APK from the corresponding L3.6 successful GitHub Actions run as an **in-place update** without uninstalling or deleting data.
1. Open original saved world, press 3D → should open **MAIN LOBBY directly** (five doors, guide lights, title and actual resource indicators).
2. Tap Basic door → check real basic lab functionality, then back to lobby. Repeat for DNA, Food, Flora, Research; no hidden extra screens or auto-forced Basic room.
3. From any laboratory, press Lab/Lobby dock → always return to the same central hall. Open/close 3D and enter again → lobby again, never Basic room.
4. Confirm camera pan/pinch, hologram list and back navigation on Samsung Galaxy A55 landscape. Verify smooth animation, no overlap/gray native popups, supports reduced motion and remains responsive.
5. Confirm all original research/DNA/food/flora transactions remain unchanged, FCM/social work, backup and original pets/progress preserved.
6. **OWNER PASS received on 2026-11-15** for the tested L3.6 skeleton and entry design. Unreported individual checklist results remain unasserted; CI still does not substitute for owner acceptance.

## Automated QA and source traceability
**VERIFIED signed owner QA: [GitHub Actions #43649928916](https://github.com/extreme4music-nexus/Trialum/actions/runs/43649928916), run #109 SUCCESS.**
- Exact tested source SHA: `ee9c49628fabb6c772d98f04f60c2f2675b2d554`. Branch modifications after this SHA are **documentation-only**, no APK source changes.
- **All automated gates PASS:** five-door lobby-first routing, no Atlas/automatic Basic shortcut, real resource-reactive hallway geometry, original DNA/Food/Flora/Research functionality, FCM/social/AI/backup regressions, Android `:app:assembleSignqa` with pre-existing Firebase/HTTPS social settings and permanent **owner QA keystore**; pinned certificate and APK v2/v3 signing verification. English exact-key forward-only acceptance retains 1,045 keys.
- **INSTALLABLE signed ZIP:** `Trialum-LW-D-L3-6-OWNER-SIGNED-SIGNQA-109` (**GitHub artifact ID `14136065564`**, ~6.47 MB, expires **2026-11-28**). Extract `Trialum-LW-D-L3-6-SIGNQA-SIGNED.apk` and install as an **update** to `com.trialum.ziivaiskra.signqa`. ZIP contains SHA256SUMS / BUILD-INFO.
- `Trialum-LW-D-L3-6-SIGNQA-UNSIGNED-109` is an intermediate, **never install**.
- **Owner physically tested and explicitly PASSED L3.6 skeleton on 2026-11-15.** No source merge into main, no beta or Google Play action without separate approval. Next proposal: a small L3.7 event-reactive visual integration phase, preserving current geometry and original game engine; full model/graphics replacement is intentionally deferred until the entire 3D migration is complete.


## Continuation if a ChatGPT/Codex session limit occurs
Start from `main/docs/LW_D_CONTINUE_HERE.md`, then check out **`feature/lw-d-l3-6-lobby-entry-polish-20261114`** and read this doc and latest Draft PR. Check latest workflows. L3.6 owner has PASSED the structural phase. Move to a narrowly scoped L3.7 gameplay-event-to-visual-feedback phase only on a separate successor branch, retain all previously owner-accepted work and the original game engine. GitHub Actions signing runs only through preconfigured QA variables and Secrets; NEVER ask owner for new FCM configuration, Fourth app ID, local signing or key passwords. Keep official Release/FriendsDebug/Play/Debian backend untouched.
