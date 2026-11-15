# Trialum B1-R2c — Android parent focus/iframe RAF freeze: incident, fix and signed QA
**Date:** 2026-11-15 · **Current authority:** OWNER actual Galaxy A55 video → #200 DEVICE FAIL; B1-R2c **SOURCE/CI/SIGNED PASS ONLY**, new owner-device QA **PENDING**. Entire B1 **REWORK/BLOCKED**; no B2/B3/Agro Lobby, no premature main merge or public Play release.

## 1. Exact new owner evidence (signed #200)
Owner supplied image (screenshot showing High mode) and a **45.306-second video, `1558.mp4`**, in ChatGPT. **These private attachments are not hosted in the GitHub repo**. Do not claim a GitHub artifact/video link or demand another recording of the already-described issue.

Visible timeline: a real packaged GLB loads successfully with GLTFLoader and two semantic anchors; initial RAF/FPS metrics increment while orbiting; user opens Android-native graphics quality selection and changes mode, after which HUD stays responsive and the lower indicator repeatedly shows **`Renderer running: awaiting RAF samples (NOT visible-frame proof)`** for a prolonged period. User can still select High/Eco/Balanced, deliberate fallback/reload, Reset camera and Classic overlay; GLB presentation becomes effectively frozen/paused and later resumes as RAF metrics reappear. The previously seen black framebuffer is **not the dominant symptom** in this video. The source of truth is owner's device report: **#200 NOT PASS**.

## 2. Code-confirmed parent-focus bug
In `js/lw-d-b1-pilot-launcher.js`, the parent **`window.blur`** listener had posted **`{type:"trialum:b1:visibility",visible:false}`** to the separate B1 iframe whenever the *parent window lost focus*. The B1 child `ready()` required `hostVisible===true`; on receiving false, it cancelled RAF via `pause()`. Opening Android-native dropdown/select (or transferring focus to the iframe) can blur the parent **without sending a corresponding parent `window.focus` when the dropdown closes**. The parent had confused focus with real app visibility.

This is a **specific, code-confirmed erroneous visibility rule**, strongly consistent with owner #200 video. Its exclusivity as the only on-device freeze cause still needs actual Galaxy A55 re-test. The prior #193 synchronous `gl.readPixels` was correctly removed in R2b; that alone did **not** fix this separate host visibility bug.

## 3. B1-R2c narrowly scoped source changes
- Removed parent `window.blur` → iframe `visible:false` forwarding. Parent sends visibility only from actual `document.hidden`/app lifecycle and on load/focus where relevant. True app background/pagehide and host close still pause/dispose GL.
- Child `pilot-runtime.mjs` adds **`wakeFromForegroundInteraction()`**: a real pointer/quality/Reset/fallback interaction may correct a **stale false hostVisible** only while the iframe document is actually **visible**, not lost/disposed/context-lost. No background GPU rendering permitted.
- Added `RAF ticks`, slow-interval `>=120 ms` counter and visibility state diagnostic. Recorded FPS values remain **RAF timing, not proof that a physical pixel reached Android display**. No synchronous GPU readback reinstated.
- Original Three.js offline GLB, semantic anchors, adaptive quality bounds, context recovery, old Classic/NovaGL2 engine, five upstairs laboratories, plants, pets, saved worlds, FCM/social, QA certificate and identity unchanged.
- New `tests/b1-host-focus.html` is a **test-only** isolated original Classic host fixture. Existing `tests/lw-d-b1-browser-stress.mjs` now runs both standalone GLB and **real hosted iframe** with simulated native selector parent blur **without any matching focus event**. The source guard `tests/lw-d-b1-webgl-health.test.cjs` forbids reintroducing parent blur-as-hidden logic.

## 4. Exact verified GitHub Actions #208
- **[B1 SignQA GitHub Actions #208](https://github.com/extreme4music-nexus/Trialum/actions/runs/43731906569): both jobs completed SUCCESS**.
- **Exact compiled tested source SHA:** `121afb6480e229b77f60273df4e19379321163e0`.
- B1 structural **7/7 PASS**; actual pinned Three.js r187 GLTFLoader decode and semantic metadata **4/4 PASS**; WebGL safety / parent blur regression **5/5 PASS**.
- Actual headless Chromium WebGL2 **standalone PASS**: 25 quality toggles, 5 pointer/camera reset actions, 5 deliberate fallback→real GLB round-trips, RAF progressed.
- Actual **hosted parent+iframe PASS**: **8 repeated parent `blur` events WITHOUT parent `focus` recovery + changing graphics quality**, and child iframe RAF continued. This test specifically fails the old parent-blur visibility design. It is **not physical Galaxy A55 proof**.
- Original game/core tests + native Android SignQA packaging + existing pinned QA signing verification: PASS.
- **Owner-installable SIGNED ZIP artifact:** `Trialum-LW-D-B1-OWNER-SIGNED-SIGNQA-208`, artifact ID **14168741820**, GitHub digest **`sha256:e03c394c300b275c473f6ee917e93089e6cb4dfa5e692b376bbe503b0a8361be`**, expires **2026-11-29**. ZIP contains the installable `Trialum-LW-D-B1-SIGNQA-SIGNED.apk`; this must update the existing **`com.trialum.ziivaiskra.signqa`** in-place without uninstall, storage wipe or a different certificate.
- The other artifact `Trialum-LW-D-B1-SIGNQA-UNSIGNED-208` (ID **14169350367**) is intermediate; **NEVER install it**. No Play/production release.

## 5. Required on-device owner gate after signed #208
1. Update existing owner-signed QA app in place. Keep all current game data. Open **B1 GLB Pilot**, confirm **REAL packaged GLB**, not unintended fallback, and both mint semantic markers.
2. Open native graphics dropdown and cycle **Balanced → High → Eco → Balanced** repeatedly, including 20+ toggles. **After EACH** selection: drag/orbit/pinch camera, tap GLB table and door anchors, verify Selected readout responds. Real 3D motion must continue even if parent window briefly loses focus.
3. Exercise deliberate fallback/reload 5+ times and immediately drag/choose quality after each. No stale `awaiting RAF`, no black scene, stuck touch or camera that only resumes after long delay. Normal RAF counter should show ticks; slow intervals >=120ms are visible diagnostic, not automatically a pass.
4. Test Reset, Android Back/Classic, 10+ pilot entry/exit, background/foreground, screen lock/unlock, landscape UI safe-area, offline packaged assets and original five laboratories/save continuity.
5. Report **B1-R2c PHONE PASS** only after repeated stable testing; if any freeze occurs, describe exact preceding action and new RAF/visibility line. Another video is **optional**, not a prerequisite. Keep **B1 overall blocked** until premium photorealistic B1-R4/R5 and explicit OWNER acceptance.

This note supersedes prior #193/#200 claims of graphical stability but does not supersede original B0/L3.9 owner-approved work.
