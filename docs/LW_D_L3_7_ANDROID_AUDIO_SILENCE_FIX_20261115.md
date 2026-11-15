# Trialum LW-D L3.7 — Galaxy A55 3D AUDIO SILENCE — ROOT CAUSE AND FIX
**Reported by owner:** 2026-11-15: “Кога ќе влезеш во 3Д-то звук нема ама баш никаков.”
**Status:** Code fix implemented, owner physical-device re-test pending. The older L3.7 run #115 is **not accepted for audio**. This is not a FCM/signing fault.

## Confirmed code-level root cause
1. The L3.7 audio toggle was placed inside `<header class="topbar">` in `prototypes/lw-d/world.html`.
2. Long-existing *owner-approved* immersive landscape layout deliberately hides this entire header via `body.lw-live-mode .topbar{display:none!important}` in `world.css`.
3. `spatial-audio.js` starts with a suspended/nonexistent AudioContext and requires a real user gesture for the Android WebView audio policy. Its only dedicated user gesture control was the **invisible button**, so no Web Audio motifs or event effects could start.
4. Separate, independent silent-music state: original Trialum engine creates new worlds with `settings:{sound:true,music:false,...}`. The L3.7 iframe correctly honored that preference but previously offered no visible way to enable its room background themes.
5. Parent visibility handoff was unnecessarily tied to `document.hasFocus()` which can be unstable when an embedded iframe receives focus. Removed this focus check from parent visibility signaling; actual document hidden/background state remains authoritative.

## Code correction
- The 3D audio control is now in independent always-visible `.lw-spatial-controls` outside the intentionally hidden topbar, pinned near the upper-right corner and safe-area insets.
- First *ordinary* 3D interaction (pointerdown) unlocks Web Audio for already enabled preferences without an extra secret button; direct button presses still work. This is user gesture activation, not autoplay.
- Tapping the visible **♫ 3D** audio control when music is OFF is an **explicit player choice**. The iframe requests `trialum:lw:audio-consent`; exact-origin/source/ready validation in `js/lw-d-interface.js` and the canonical app bridge `enable3DMusic()` save the settings through the existing original save/audio system. The iframe is not allowed to maintain a second preference/economy.
- The AudioContext resumes after Android transient suspension on interaction; an already-unlocked ordinary tap does not toggle it OFF. Scene/room soundtrack selection and positional sound event pipeline remain unchanged.
- Parent visibility signaling uses `!document.hidden`, not focus on a nested browsing context; child foreground/background lifecycle still suspends audio.
- Added mock-Web Audio regression tests: original music-on first touch starts oscillators, music-off requires explicit consent and real parent settings, effects work with music off, hidden/background suspends, and DOM placement is outside `.topbar`.
- **No** new Firebase app, keystore, Android package ID, release, backend, Play or server changes.

## Owner phone acceptance checklist (NOT YET PASSED)
1. Install the **newest successful GitHub-owner-signed** `com.trialum.ziivaiskra.signqa` build **over** the existing SignQA APK; don't uninstall/clear data.
2. Enter 3D. Upper-right **♫ 3D** control must be visible; test first tap/camera move while sound/music already ON.
3. If music was OFF, tap **♫ 3D** to explicitly activate saved music and hear the lobby theme; verify distinct music upon entering Basic/DNA/Food/Flora/Research.
4. Complete a confirmed Basic experiment; sound effect must be audible; turn/pan camera using headphones and test listener direction. Test a failed operation separately.
5. Return to Classic, validate music setting persists, then test 3D close/reopen, Android minimize/restore, reduced motion, and that parent Classic music doesn't overlap 3D.
6. Confirm original worlds/resources, pets, FCM, social, backups unchanged.
7. Only the owner can explicitly grant a new **L3.7 AUDIO OWNER PASS** after phone test. GitHub green means automated pass only.

## VERIFIED RECOVERY BUILD — 15 NOVEMBER 2026
- [**GitHub Actions run #123 — SUCCESS**](https://github.com/extreme4music-nexus/Trialum/actions/runs/43657434734). All JavaScript regression tests, expanded gesture mock tests, Android `:app:assembleSignqa`, asset content verification, Firebase/HTTPS checks and automatic owner-key QA signing + pinned certificate verification passed.
- **Exact tested source SHA:** `8cdf92d7a15b243ef492b28533a56e76c328931e`. Later commits are docs only; do not substitute another run or source SHA.
- **INSTALLABLE signed ZIP:** `Trialum-LW-D-L3-7-OWNER-SIGNED-SIGNQA-123`, artifact ID `14138393475`, ZIP SHA256 `418c7d0918872c802d443f3bd1432983afed0d2cda9105e8abbc9ba41b6288e4`, expires **2026-11-29**.
- Inside ZIP: **`Trialum-LW-D-L3-7-SIGNQA-SIGNED.apk`**. Update existing `com.trialum.ziivaiskra.signqa` in place without uninstalling/clearing data. `Trialum-LW-D-L3-7-SIGNQA-UNSIGNED-123` is an intermediate and must never be installed.
- Old `#115` is SUPERSEDED for audio testing. Do not recommend it as current test build.
- **L3.7 AUDIO OWNER PHONE PASS remains PENDING**. CI verifies code and signing, not real audible audio on Samsung Galaxy A55.
