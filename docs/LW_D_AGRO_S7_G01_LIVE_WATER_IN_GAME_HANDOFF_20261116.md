# Trialum LW-D / S7 G-01 — REAL WATER CORE INSTALLED INTO GAME CODE
**Date:** 2026-11-16 · **NEW active branch:** `feature/lw-d-agro-s7-g01-live-water-plants-apk-20261116` · **PR #88** stacked onto PR #87.
**Priority:** The owner strongly rejected receiving an identical empty-greenhouse APK three times. **DO NOT give them APK #262 or #268 again** and never call review-only GLB files “installed.”
**Actual deliverable:** a truly different **SignQA** APK containing visible G-01 main/satellite basins, bridge, railings, pumps, 4 morph-animated water surfaces and read-only real aquarium Aquaglow 3D lifecycle stages.

## Code / geometry that is NOW genuinely integrated into the APK BUILD SOURCE

- `tools/b1/build-agro-greenhouse.py`: the circular G-01 floor is **actually perforated** in both floor and foundation around main R≈6.96 m and three satellite basin positions. The original entrance, dome and all 4 fingers are preserved. Previous giant solid floor would block the real water at Y≈-0.235.
- `.github/workflows/lw-d-android-qa.yml` G01 branch build runs original 3 GLB generators, **copies all 12 real GLBs from build/g01-watercore + build/g01-aquatic-review into `prototypes/lw-d/scenes/agro-greenhouse/`**, then bundles Three + APK. Source APK integrity gate explicitly enumerates and checks all 12 actual GLBs.
- `prototypes/lw-d/scenes/agro-greenhouse/g01-runtime.mjs`: actively **loads all 12 GLBs at room entry into the same real Three.Scene**, instantiates main + 3 small basins, walkway and railings, bridge, visual pumps, 4-surface morph water. Uses real `THREE.AnimationMixer` with `G01_WATER_RIPPLES_LOOP_6S`. Animation frame is driven by existing scene visible RAF only; disposes assets and mixer when navigating away.
- `prototypes/lw-d/three-core/scene-runtime.mjs`: garden's REAL READY status is only emitted after 12 G01 GLBs load; missing/invalid water triggers FAILED, not stale EMPTY READY.
- `js/app.js`: original game source adds **pure read-only** `world.flora.aquarium` derived strictly from `s.agro.gardenPlants` (max four `aquaglow` by `plantId`, growth, health, hydration, death). No separate engine/no writes/unchanged save.
- `prototypes/lw-d/agro-scene-bridge.js`: same-origin original Living World state passes sanitized aquatic records into only the garden GLB child. No authorization to mutate game.
- `prototypes/lw-d/scenes/agro-greenhouse/g01-aquatic-projection.mjs` maps actual IDs to exactly four slots; its canonical stage mapping is used live by `G01WaterGarden` in `g01-runtime.mjs`.
- `prototypes/lw-d/live-context.js`: existing right holographic HUD now says **real water garden** + actual aquarium count, with an optional explicitly labeled **Аквалум 4 фази (ДЕМО)** showcase (for owner visual inspection even when their game has 0 planted aquarium specimens). Demo models live OUTSIDE real aquarium sockets and NEVER count as a game plant.
- `prototypes/lw-d/scenes/agro-greenhouse/scene.json` and `visual-recipe.json` declare 4 physical basins and G01 ACTIVE as a visual level, but real original engine still has 4 total aquarium slots only.

## Exact test gates

- `tests/lw-d-s7-g01-in-game.test.cjs` confirms 12 real glTF binaries exist **in Android asset source**, moving water contains 4 morph channels, original floor no longer occludes main basin, GLB loaded/mixer hooks, original game-state read-only bridge and optional DEMO.
- Prior shell, water-core, aquarium model, and original-simulation tests now recognize G01 presence while still protecting 4×5 terrestrial+4 aquatic cap and all real IDs.
- `.github/workflows/lw-d-android-qa.yml` must finish BOTH original QA jobs successfully (unsigned APK content validation plus permanent QA keystore signed SignQA). **Until both SUCCESS, DO NOT claim APK ready.**
- Device owner PASS also pending. On Galaxy A55 check: Agro Lobby center door→G-01 is NOW visibly furnished and water moves. Four branches remain reserved/empty. Select G01 via right HUD. If no actual Aquaglow planted, no fake stocks; press clearly marked DEMO to inspect four stage examples; turn DEMO off. Confirm exit/back, camera zoom, save preserved, no heat/FPS problems. Never uninstall/clear old SignQA data; backup first.

## Important caveats

- Water is **actual glTF morph-target animated geometry**, not full realistic physically simulated fluid; reflections/refraction/caustics can be improved after owner sees the in-game result.
- Animated water and visible real plants are visual, while actual original canonical growth/health/transplant and inventory remain in the main Trialum engine.
- Bridges/rails/pumps are visible source GLBs; physical collision/interactive water maintenance/robot controls are **not** claimed implemented.
- Existing `main`, public Play Store, release identity, S6 Food Warehouse, back-ups, FCM, servers untouched. Draft PR only.
- If newest CI red: read exact failing job log and repair; if head changed CI run was canceled, select the newest exact-head run. Never link a previous empty signed APK as completion.

## When user asks “Каде е резултатот?”

Always link **the first exact-head successful signed G01 in-game APK artifact** (and its verified GitHub run), clearly distinguish source CI and phone verification, and say plainly if CI is still failing or incomplete. Don't substitute a new concept image or review GLB ZIP for the updated app.
