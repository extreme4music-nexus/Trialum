# TRIALUM LW-D / S7 — IMMEDIATE SESSION RECOVERY HANDOFF
**2026-11-17 — OWNER REQUESTED THIS DOCUMENT BEFORE THE FOOD WAREHOUSE TASK.**
**This file is a LIVE SESSION HANDOFF, not a claim of completed warehouse integration.**

## 1. Source of truth / current location
- Repo: `extreme4music-nexus/Trialum`, private.
- 3D foundation: Draft PR #88, branch `feature/lw-d-agro-s7-g01-live-water-plants-apk-20261116`; **G01 actually contains** water basins, bridge, 4 animated water surfaces and canonical Aquaglow projections, signed owner QA [run #288](https://github.com/extreme4music-nexus/Trialum/actions/runs/43971723284), owner post-install pass not independently recorded.
- S7 art/floor development: Draft [PR #89](https://github.com/extreme4music-nexus/Trialum/pull/89), branch `feature/lw-d-s7-greenhouse-approved-art-bible-roadmap-20261117`. **Never merge to main** or Google Play without explicit owner decision.
- Owner-approved S7 V3 topology: 4 growing fingers G02/G03/G04/G05 with one original bed each, G01 water heart, G00L service immediately left of entrance with RS seedling racks + larger/more numerous RM mature racks, planned only.
- Existing S7 floor: F01-A full cream marble owner VISUAL PASS, standalone glTF2 QA SUCCESS; F01-B half pair GLBs CI 10/10 tests; F01-C quarter set four GLBs CI SUCCESS 15/15 at [run 44051295840](https://github.com/extreme4music-nexus/Trialum/actions/runs/44051295840), artifact [14312854396](https://github.com/extreme4music-nexus/Trialum/actions/runs/44051295840/artifacts/14312854396). **S7 floor in-game installation NOT started.** Keep F01 modules completely untouched by warehouse work; next F01-D finishing edge only AFTER warehouse task owner review.

## 2. New owner instruction / active task
Owner linked a Classic handoff:
`https://github.com/extreme4music-nexus/Trialum/blob/feature/classic-only-food-warehouse-play-update-20261117/docs/CODEX_CLASSIC_FOOD_WAREHOUSE_BETA_HANDOFF_20261117.md`

Owner reverses previous assignment and NOW explicitly directs this 3D session to integrate the Classic food warehouse and real engine state into **existing 3D food warehouse**, including shelves and refrigerator stock, so old visible zeros reflect actual data, with valid zero when inventory is truly empty. Must first OPEN AND READ the exact linked handoff, inspect actual committed Classic source and current 3D source, integrate cleanly, add meaningful tests, build and deliver an owner QA Android APK, document all changes. New functionality should become the baseline for subsequent LW-D/S7 development, while greenhouse F01/S7 continues unchanged after the warehouse fix. Do not conflate visual shelf props with engine state. Do not fabricate new food items, inventory quantities, or duplicate authority.

## 3. Starting safety rules
- FIRST read this handoff and the user-provided Classic food warehouse handoff from source; check the Classic branch HEAD and diff.
- Work on **a fresh purpose-specific 3D integration branch stacked from current PR #89 HEAD**. Do not force-merge Classic branch (it may contain unrelated Classic Play update work). Cherry-pick/transplant minimal validated Classic engine files or compatible logic; must preserve G01, S7 work, original game, compatible save/migration and role of lab production→warehouse shelves/fridge→pet food reserves.
- App signing: existing `.github/workflows/lw-d-android-qa.yml` owner SignQA workflow previously signed #288. A new integration branch must be explicitly allowed by workflow before CI and existing permanent secrets; do not invent APK URL/time or claim signed until workflow shows 2/2 SUCCESS and artifact ID. No Play Store release.
- Examine `js/warehouse-inventory.js`, `js/food-supply-chain.js`, `js/app.js`, `prototypes/lw-d/scenes/agro-food-warehouse/warehouse-runtime.mjs`, `warehouse-rooms.mjs`, `warehouse-interactions.mjs`, `prototypes/lw-d/live-context.js`, `prototypes/lw-d/agro-scene-bridge.js`, scene projection, `tests/lw-d-warehouse-real-data.test.cjs`, food supply tests, Classic engine source. Paths may differ; fetch source before changing.
- No secondary warehouse engine. Proper canonical stock source, shelf/fridge allocation, lab production, withdrawal, saved inventory and Classic/3D parity. Old saves safe, negative/double counts impossible, zero remains zero if actually empty; avoid fake populated shelves.
- Owner validates signed APK on Galaxy A55; automations/CI cannot substitute phone PASS. Keep Draft PR and full handoff.

## 4. Current known status BEFORE new task
- 3D G01 signed from earlier PR #88; status owner G01 phone PASS unverified.
- Warehouse earlier 3D shows zero on shelves and refrigerator **reported by user**; root cause not yet verified.
- A separate `main` documentation-only ticket exists: [food warehouse original engine / Classic TODO](https://github.com/extreme4music-nexus/Trialum/blob/main/docs/FOOD_WAREHOUSE_ENGINE_INTEGRATION_TODO_20261117.md); another session has since produced the Classic branch link above. **Verify implementation status from source; do not claim work complete merely from TODO.**
- No changes to food engine made by THIS S7 session so far. This handoff captures exact starting point.

## 5. Completion evidence required in this exact file or follow-up
Exact Classic SOURCE SHA, S7 integration branch/PR and SHA, engine canonical stock API names and save schema, 3D binding and shelf/fridge mapping, tests and PASS count, signed Android CI run and downloadable artifact, owner device verdict. If any step fails, write blocker and do not claim success. After owner PASS, use this integration as source for continuing the S7 F01-D stage.
