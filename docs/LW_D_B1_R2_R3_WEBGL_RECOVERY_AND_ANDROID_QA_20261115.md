# Trialum LW-D B1-R2/R3: WebGL stability, visible-frame QA, camera/HUD mobile rework
**Date:** 2026-11-15 · **Status:** source implemented on Draft PR #76; **Android OWNER QA not yet passed**. B1 and R4 photorealistic-quality gate remain OPEN. B2/B3/new Agro rooms forbidden until explicit OWNER B1 PASS.

## Source and new owner evidence
Owner tested **signed B1-R1 #181** on Samsung Galaxy A55 with a ~45 second screen recording. Real packaged GLB and 2 semantic anchors appeared, deliberate fallback/reload worked. Switching to High turned the GLB canvas black; returning to Balanced did NOT restore it immediately, and an observed WebGL context loss later preceded recovery. Previous frame statistics remained on screen during black imagery. Classic button and metrics overlapped, and camera could approach/penetrate walls. This is real video evidence, **not proof of exact driver root cause**.

Active source: `feature/lw-d-b1-threejs-glb-pilot-20261115` on [Draft PR #76](https://github.com/extreme4music-nexus/Trialum/pull/76). Prior R1 owner-signed [#181](https://github.com/extreme4music-nexus/Trialum/actions/runs/43721113985) is HISTORICAL and has the black-frame bug.

## B1-R2 changes
- `prototypes/lw-d/b1/gpu-health.mjs`: pure deterministic Eco/Balanced/High drawing-buffer plan with 1.6 million pixels maximum, 1920px maximum dimension, and detected device WebGL limits. High is adaptive; effective DPR is now reported honestly.
- `pilot-runtime.mjs`: **single** physical GPU buffer allocation per actual canvas-size transition. Three.js renderer pixel ratio stays 1; CSS canvas stays full viewport, camera aspect uses CSS dimensions. This avoids the old double allocation from `setPixelRatio` plus `setSize` on every quality change.
- After `renderer.render`, sample 4 physically rendered WebGL RGBA pixels every 24 frames. Dark clear color is deliberately nonblack. Do **not** print an FPS number before confirmed nonblack framebuffer data. Readback errors show unavailable, never fabricated success. Two consecutive black readbacks trigger a visible fault/recovery, not a misleading FPS figure.
- On WebGL context loss pause RAF and metrics. Three.js handles internal context reset; on restored event, `renderer.resetState`, recompute dimensions, dispose old scene resources and explicitly **reload real packaged GLB/semantic anchors** before resuming. Failed/no restore or black framebuffer gets a visible error and one bounded iframe-only restart. Recovered URL **preserves selected Eco/Balanced/High**, plus a prominent prior-failure banner, so High bugs cannot silently vanish on reset to Balanced; after the one restart, a persistent fault requires the user to click `Retry GPU renderer` manually. This only reloads the isolated B1 iframe; it cannot overwrite saves.
- RAF metrics reset per quality/mode change; loading, hidden and context-lost scenes do not claim graphics performance.
- `tests/lw-d-b1-webgl-health.test.cjs`: buffer budget, quality monotonicity, pixel classifications, DOM/renderer lifecycle guards, camera/Android layout and incident carryover. Required by `.github/workflows/lw-d-android-qa.yml`.

## B1-R3 limited mobile fixes (device acceptance still required)
- `pilot.css` adds a fallback Android status-bar inset and reserves space at the bottom-right of the performance footer.
- `lw-d-b1-pilot-launcher.js` places parent `← Classic` bottom-right in reserved space, respecting safe-area insets.
- `pilot-runtime.mjs` clamps the camera inside the 6×6×2.8 m GLB room, with 24cm wall margin and safer near clip. This is NOT full physics, and it must be tested for table collisions and pinch/orbit behavior on-device.

## Crucial limitations and gate honesty
A Node source test and an Android APK compilation **cannot reproduce a real Galaxy A55 GPU/WebView driver**. The framebuffer probe demonstrates rendered-color sanity in the runtime, not that each frame has reached the physical display compositor, nor guaranteed photorealism. Do not claim black-frame bug fixed or R2/R3 owner PASS until the owner films and confirms it. High photorealistic PBR/material art (**B1-R4**) and comprehensive original-world and owner validation (**R5**) are intentionally still open.

## Mandatory signed APK owner protocol (do not reset original worlds)
1. Install latest actual **owner-signed** `Trialum-LW-D-B1-SIGNQA-SIGNED.apk` as an **update** to the same `com.trialum.ziivaiskra.signqa`. Never uninstall, clear data, use UNSIGNED artifact, or switch signing certificate. Preserve existing worlds and backups.
2. Open pilot and require `REAL packaged GLB loaded`, not unintended fallback. Observe sample metrics first show `Waiting for framebuffer pixel proof` and only afterward real FPS.
3. Cycle **Eco→Balanced→High→Balanced→Eco** at least six times (**30 transitions**) while moving camera. Hold **each quality mode for ≥60s** and inspect status/frame timings. Any black/lost frame or `GPU RECOVERY RETRY` is a **device QA failure** even if it later recovers. Record reported effective DPR/draw dimensions.
4. Toggle deliberately to `Test missing GLB fallback` and `Reload real GLB` at least 5 times. Both must remain visibly rendered; after reload verify 2 actual semantic anchors by tapping mint markers.
5. Orbit to all four walls, zoom toward door and workbench, pinch, Reset camera and test target selection. No wall penetration, unresponsive touch or severe camera jump. Verify header/exit, controls, Classic button and metrics do not overlap Android status/navigation bars. Test Android Back where supported.
6. Test app background/foreground, screen lock/unlock, supported orientation changes and 10+ open/close pilot cycles. Verify no indefinite black/white canvas, stale FPS or GPU loops after returning to Classic.
7. Test with network unavailable after assets are installed. Restore Classic and check existing flora/food/pets/backups, and each of the five upstairs laboratories for unintended changes.
8. Report video/screenshots, quality modes, sample counts/p50/p95/p99, thermal behavior and exact warnings. **Only owner gives verdict R2/R3 PASS or further rework.**

## Source protection
No edits to gameplay/AI/FCM/server/DB/plant food/inventory/save or old NovaGL2 labs; no B2/B3, no new physical lobby/room, no main merge, no public APK/Play release. Keep original owner-only GitHub QA signing lane and source/CI evidence separate from real-phone OWNER PASS.
