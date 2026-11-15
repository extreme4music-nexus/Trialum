# Trialum LW-D B1-R2b — Android freeze after touch / quality / fallback
**Date:** 2026-11-15 · **State:** B1-R2b CODE/CI/SIGNED CANDIDATE PASS, **Galaxy A55 owner QA OPEN**. Entire B1 remains REWORK/BLOCKED pending owner phone acceptance, then photorealistic R4 and complete R5. No B2, B3 or new lobby.

## Owner real-phone report on previous SIGNED B1-R2/R3 #193
- Earlier intermittent **black GLB canvas** under Eco/Balanced/High changes was **not observed in #193** (owner evidence, do not extrapolate to future stress conditions).
- **New blocker:** after an interaction (switching a quality mode, touching an object, deliberate fallback/reload) entire 3D scene may **freeze**, and subsequent touch controls become unresponsive.
- Owner explicitly said a new video is **not necessary** as it would only display a frozen frame. Treat this written owner observation as the device incident; never demand another recording to start repairs.
- **#193 = OWNER REPORTED FAIL (touch/render freeze)**; not a B1 pass. Previously R1 GLB load remained visible; black-screen reduction is partial progress only.

## Code-based root-cause investigation (not driver proof)
B1 #193 source had **4 synchronous `gl.readPixels` calls every 24 frames** in `probeFramebuffer()`, executed on the same browser main thread as RAF, touch/pointer events and the GPU driver. `gl.readPixels` can synchronize/stall GPU rendering on WebView. This is a strong engineering hypothesis, **not proof without native Chrome/GPU trace from Galaxy A55**. Additionally, only `renderer.render` had exception protection: any throw from sizing, `OrbitControls.update`, camera bounds or metrics could silently terminate RAF at `raf=0` and leave the last displayed image frozen.

## Actual narrow R2b fix
- Removed executable `gl.readPixels` and `gl.finish` from the live pilot. Never use synchronous pixel readback in an Android real-time frame loop. Kept bounded Eco/Balanced/High GPU buffer planning (1.6 MP / 1920 max), original GLB loader, 2 semantic anchors and the separate fallback.
- Full `frame()` loop now guards sizing, controls, camera bounds, rendering and metrics. On a JavaScript exception, status reports reason and bounded iframe-only recovery starts instead of silently dying. Successful frames always re-arm one RAF.
- RAF time data are **explicitly unverified on-screen timing**, *not pixel-verified FPS*. Real screenshot checks are done off-device in independent browser QA, and the owner must still confirm real Samsung display behavior.
- Fallback's promise errors now route to visible recovery rather than a silent unresolved loading screen.
- `tests/lw-d-b1-webgl-health.test.cjs` guards against reintroducing synchronous GPU readbacks or an unprotected RAF loop.
- New actual WebGL2 headless-browser stress `tests/lw-d-b1-browser-stress.mjs`: repeatedly switch quality, issue real pointer and Reset controls, toggle fallback/reload and assert raf samples continue incrementing; save screenshots for evidence in runner filesystem. This is NOT a Samsung driver replication or a guarantee that pixels reached the phone compositor.

## Exact B1-R2b signed CI evidence
- **[GitHub Actions #200 — completed SUCCESS both jobs](https://github.com/extreme4music-nexus/Trialum/actions/runs/43729710346)**.
- **Exact Android compiled graphics source:** `eb79b5c3c6252ae65aab85dd3628cca251139b5c`.
- Real Three.js 0.187.0 external GLB loaded in CI; B1 structural **7/7 PASS**, real GLTFLoader anchor **4/4 PASS**, R2b/GPU-source guard **4/4 PASS**.
- **Chromium WebGL2 interaction test PASS**: **25 quality changes, five tap + camera resets, five intentional fallback and real-GLB reload round-trips** while RAF progression continues. This test succeeded before Android compilation and sign.
- Android SignQA actual package build, original protected game regression tests and signing with old permanent owner QA certificate: SUCCESS. No Release/FriendsDebug signed output here.
- **INSTALLABLE signed artifact:** `Trialum-LW-D-B1-OWNER-SIGNED-SIGNQA-200`, artifact ID **14167793278**, ZIP SHA256 as reported by GitHub `ce8b23763e66019d933c9aff3b4091da362ec88c7208b7e821b2b78ce08a9222`, expires **2026-11-29**. In ZIP install **only `Trialum-LW-D-B1-SIGNQA-SIGNED.apk`**. Never install intermediate unsigned artifact **14168240682**.
- Original package `com.trialum.ziivaiskra.signqa`; **UPDATE IN PLACE**, no uninstall/data clearing, no different Firebase app/signing key. Documentation-only commits after source SHA **do not change** this binary.

## Mandatory Galaxy A55 owner acceptance (no video required)
1. Keep prior SignQA world/data; update APK in place. Launch B1 and confirm **REAL packaged GLB loaded**, not unintended fallback.
2. At least 25 switches Eco ↔ Balanced ↔ High in varied order, plus pinching/orbit between switches. No stopped animation, frozen image, input lag that never clears, black canvas or spontaneous `GPU RECOVERY RETRY`.
3. Tap each mint anchor repeatedly, confirm Selected text responds, and that the **3D scene still moves afterward**. Tap `Reset camera`, then drag again.
4. Click `Test missing GLB fallback` / `Reload real GLB` five times and verify touch + moving camera **after each**.
5. Background / foreground, screen lock / unlock, 10 open/close pilot sessions. No hung touch and no continuing offscreen render loop.
6. Confirm parent **← Classic** is reachable and original food, plants, pet world and five old lab scenes retain state. Never restore or wipe just to make QA pass.
7. Report simply **PASS** or which action first froze the phone, any status/error text and whether the Android back gesture still worked. An additional video is optional, **not required**.

## Non-negotiable phase gate
**B1-R2b CI PASS does not authorize B1 completion or R4 art build.** Owner must first confirm this signed build is actually responsive on the Galaxy A55. The premium High/photorealistic visual sample (B1-R4), subsequent complete B1-R5 and explicit owner PASS still stand between the team and constructing the new three-door Agro Lobby.
