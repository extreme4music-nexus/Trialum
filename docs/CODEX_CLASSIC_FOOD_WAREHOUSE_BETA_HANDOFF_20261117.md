# CODEX HANDOFF — Classic Food Warehouse Play Store update (2026-11-17)

## Read this first
**Source repository:** `extreme4music-nexus/Trialum`
**Fetch branch:** `feature/classic-only-food-warehouse-play-update-20261117`
**Base:** `Trialum/main` on creation; standalone Classic-only food feature, NOT stacked on S6 or the 3D sequence.
**Destination ownership:** Codex independently maintains `extreme4music-nexus/trialum-beta` and `extreme4music-nexus/Trialum-Android-Builds`. This branch intentionally does NOT write to either repository or build/publish any APK.

## Scope and files
- `js/warehouse-inventory.js` — canonical conserved storage allocation: rack/cold/packing/hand, individual pet reserves; backward-compatible old-save reconciliation
- `js/food-supply-chain.js` — original prepared/basic feeding now consumes only the pet's manufactured portions; no double biomass spending
- `js/food-home-ui.js` — pet Home reserve view, add/return portions and prepared feeding
- `js/expansion-ui.js` — new **Classic warehouse** page with real rack/cold/packing counts, manual movements and pet delivery; existing Food Lab remains production-only
- `js/longplay-ui.js` — More → **Стовариште за храна** menu item; existing lab text retained
- `js/app.js` — original pet Home controls for supply/return/feed, and reserve readout; **no 3D bridge**
- `index.html` — load the three original-food modules after research/longplay and before the app
- `tests/classic-food-warehouse.test.cjs`, `tests/lw-d-food-supply-chain.test.cjs` — focused regressions

IMPORTANT: This work is based on the actual current Trialum main, not on the user's latest published beta snapshot. **Before pulling it into beta**, Codex MUST diff current beta/Play Store release code to check version compatibility, translations, saving, production recipes, pet presence, old saves and existing in-progress food update. Port/cherry-pick only the scoped files and necessary functions; do NOT overwrite newer beta changes. The release manager is Codex.

## Canonical data and invariant
- `s.foodFactory.stock[recipeId]` = authoritative total remaining food (manufactured minus eaten).
- `s.foodFactory.warehouseBins[recipeId]` = {rack,cold,packing,hand}.
- `s.foodFactory.petReserves[petId][recipeId]` = per-pet physical home reserve, keyed by pet ID.
- For each recipe: total = rack + cold + packing + hand + sum(pet reserves).
- Production: **original** `E.craftFood`; supplies: `TrialumWarehouseInventory.transferPet`; transfers: `TrialumWarehouseInventory.action`; feeding: original `E.feedPrepared`/ `E.petCare(...,'feed')` wrapped to consume a personal portion. No parallel food wallet, 3D state, server inventory, extra economy, or free synthetic portions.
- Zero quantity is a valid state; never fabricate or seed stock for demonstration.
- Original state save/JSON backup owns everything. Saved games without bin/reserve fields derive locations safely from existing total.

## Validation before Play release (not claimed completed here)
1. Run all existing engine, food, migration, UI and Android regression suites **and** `node --test tests/classic-food-warehouse.test.cjs tests/lw-d-food-supply-chain.test.cjs`. A green test alone is not owner acceptance.
2. Start with old released beta saved progress/JSON: load without resetting existing pets, food or habitats.
3. Craft food in Food Laboratory; check exact count in warehouse shelf; move shelf → hand → cold → hand → packing; warehouse totals remain constant.
4. Supply two different pets; pet A's consumption must never take pet B's reserved portion or double-spend biomass. Home screen needs a real stock item; reject empty/invalid food.
5. Test offline, reload, JSON export/import, corrupted/empty allocations, no negative/duplicate food, at-home vs away pet restrictions and tapping twice.
6. Check MK/EN wording in the actual beta UI. Use Play internal/closed testing and owner physical phone approval before public production rollout.
7. Keep this PR draft until QA; do NOT assume CI success, merge, signing, versionCode bump or Play upload were authorized.

## Git instructions to Codex
Fetch `Trialum` source branch without merging unrelated 3D/S6 drafts. Compare its base SHA to `main`, inspect `git diff main...feature/classic-only-food-warehouse-play-update-20261117 --` before taking code. Migrate only validated Classic changes into `trialum-beta`; let existing `Trialum-Android-Builds` workflows package it according to Codex's established signing and QA process. If conflicts occur, preserve latest beta and resolve per-function rather than replace whole files.
