# TRIALUM LW-D S7 — CLASSIC FOOD WAREHOUSE ↔ ORIGINAL ENGINE ↔ REAL 3D
**17 November 2026.** Owner-directed implementation. **Source PR:** [Draft #92](https://github.com/extreme4music-nexus/Trialum/pull/92), stacked on S7 art/floor Draft #89.

## 0. Owner order of operations and immutable scope
1. Session handoff was committed FIRST: `docs/LW_D_S7_GARDEN_AND_FOOD_WAREHOUSE_SESSION_HANDOFF_20261117.md` in PR89.
2. Read supplied [Codex Classic warehouse branch handoff](https://github.com/extreme4music-nexus/Trialum/blob/feature/classic-only-food-warehouse-play-update-20261117/docs/CODEX_CLASSIC_FOOD_WAREHOUSE_BETA_HANDOFF_20261117.md) and [3D adapter contract](https://github.com/extreme4music-nexus/Trialum/blob/feature/classic-only-food-warehouse-play-update-20261117/docs/CLASSIC_WAREHOUSE_3D_ADAPTER_HANDOFF_20261117.md) **directly**, before touching code. Classic HEAD inspected as `f1df1eeb542e8f5187187c692a7df79d7dd4ab99`.
3. Scope is ONLY to make food stock work in the canonical original engine/Classic and existing 3D warehouse, with saved rack/cold/packing/hand and home reserves. Keep the accepted G01 aquatic room, four fingers G02..G05, S7 F01-A/B/C assets, original LW-D UI, all other labs & games untouched. No changes to Codex beta/Play projects.
4. New PR is **DRAFT**; no main merge, no Play upload, no owner phone PASS claimed unless user tests it personally.

## 1. Root source comparison
This is **not** a missing new arithmetic/economy system: canonical `js/warehouse-inventory.js` was already **byte-identical** across Classic and our S7 stack (blob `7e9e4aa8f98c60b32ee06d62bdbbc0f6067bea30`). Likewise `js/food-supply-chain.js` (`be4050684824947144a33246f9818e4f3057cf0c`). Both `index.html` pages load inventory + supply chain + home UI after original engine / longplay. We did NOT replace these with parallel logic or forcibly set stock nonzero. `E.craftFood` is the original production authority, not the scene's animation.

**What needed integration:** The new Classic warehouse page and More nav existed only on the Classic standalone branch; S7 had previous S5/S6 bridge projection but no direct HUD-independent authoritative update guarantee, and no explicit distinction between absent canonical projection and genuine zero. The reported zeros do NOT by themselves prove stocks should be nonzero: an original save with 0 manufactured portions must still display a real 0.

## 2. Actual code changes in PR #92
- `js/expansion-ui.js`: copied ONLY standalone Classic warehouse page and exact actions from owner-provided Classic branch. No wholesale replacement of `js/app.js` newer LW-D/3D features. Adds `warehouseMove`/ `warehousePet` to Classic action handler. Parent `ctx.notice` triggers established save/render/sync path.
- `js/longplay-ui.js`: selectively adds `More → Стовариште за храна`, without modifying other menus.
- `js/app.js`: preserves all original S7 snapshot and game actions; validates `TrialumWarehouseInventory.project(s,E.foodRecipes,selectedPet)` to mark `food.warehouseReady`, checks total and bin conservation; if module missing, marks unavailable instead of fake zero. Authoritative parent `warehouseOperation` already performed commands using inventory ledger + `notice` save.
- `prototypes/lw-d/agro-scene-bridge.js`: accept the **trusted outer original** `trialum:lw:state` directly, filter malformed/forged recipe and location counts, propagate to nested 3D room regardless of HUD render order; clear stale previous-world state on absent original inventory. This is a read-only visual projection; not a new store.
- `prototypes/lw-d/scenes/agro-food-warehouse/warehouse-interactions.mjs`: 3D world displays genuine per-zone `ORIGINAL STOCK` count/physical box quantity when ready; `ENGINE UNAVAILABLE` with **—** when canonical state is absent, never fake 0. Original refrigerated / packing annex geometry and conveyor remain intact.
- `prototypes/lw-d/live-context.js`: shows meaningful warning when engine source is absent; explains a truly empty warehouse requires crafting in original food laboratory. Existing 3D buttons request parent operations via `trialum:lw:warehouse`, same-origin authenticated `js/lw-d-interface.js`.
- `sw.js`: new cache key to ensure updated Classic/3D code loads on upgrade without clearing player data.
- `.github/workflows/lw-d-android-qa.yml`: narrow new branch allowlist in existing owner-only SignQA signing workflow, new original engine/Classical bridge tests and APK embedded-Classic-UI asset checks.
- Regression tests: the exact imported standalone Classic `tests/classic-food-warehouse.test.cjs`, plus `tests/lw-d-s7-warehouse-live-bridge.test.cjs` original live craft → 3D rack 3 → take → refrigerator / packing → pet home reserve → pet feed and saved state. Includes both real zero and no-engine/untrusted-source behavior.

## 3. Canonical state and invariants
Original `s.foodFactory.stock[recipeId]` = total uneaten food. Original `s.foodFactory.warehouseBins[recipeId]` = location `rack,cold,packing,hand`; original `s.foodFactory.petReserves[petId][recipeId]` = each pet's exclusive home portion. Per recipe:
```
stock === rack + cold + packing + hand + SUM(petReserves[*][recipeId])
```
New original craft adds `E.foodRecipes[].yield` actual units; `project` rebalances into rack in-memory or when transfer occurs. Warehouse take/put and pet supply/return conserve total. Pet feed consumes exactly one original portion. Old-save missing warehouse bin fields recovers from original stock; no free synthetic portions and no new food wallet. 3D rooms have **NO localStorage, IndexedDB, server inventory, direct engine access or extra food balance**.

## 4. Exact QA procedure for owner
1. Existing SignQA app only; **backup first**, update the QA APK over the same `com.trialum.ziivaiskra.signqa` package. Do not uninstall/clear saves.
2. Start with truly empty save: Classic More → Стовариште за храна and 3D shelf/fridge read 0 legitimately.
3. Food Lab → choose unlocked food → `E.craftFood` real recipe, e.g. starter `manna`, yield **3**; Classic warehouse must show exactly three on shelf. Enter 3D Food Warehouse from Agro Atrium; full shelf physical representation and hologram count 3, cold 0.
4. Use Classic or 3D actions to `take rack→hand`, then `put hand→cold`. Show rack 2, cold 1. Repeat to packing: rack 1, packing 1. Confirm on exiting/re-entering and app restart. The lab's stock remains 3.
5. Supply a pet with valid compatible formula and active home. Its personal reserve increases by 1, zone decrements, total unchanged; then original Home feed consumes 1 (total decreases exactly once) and pet A does not spend pet B food. Check device save/restore.
6. Test 3D refrigerator and packing annexes with real GLB assets, scene navigation and original G01 water / G00L/4 fingers unaffected. If owner sees a real 0 after never producing food, that is correct, not a warehouse display defect.
7. Report owner PASS or exact screenshot/steps to reproduce. Do not merge or publish from this branch until explicit approval.

## 5. CI and APK record
- Expected owner-only GitHub Actions workflow: `.github/workflows/lw-d-android-qa.yml` (two separate jobs: build unsigned, sign existing permanent QA identity).
- Started after modifying CI on this separate branch. **Update with actual run ID, exact SHA, test proof, signed artifact and owner verdict only AFTER the workflow confirms them.**
- A successful Classic-only test does **not** prove the nested WebGL renderer; Chromium 3D G01 and Warehouse stress/evidence tests still run as part of existing workflow. The new dynamic bridge test explicitly verifies real data makes it through to the nested room; owner mobile screenshot remains final visual gate.

## 6. Resuming greenhouse development
After this one scoped fix passes, subsequent S7/3D work should **start from the successful warehouse integration branch** (not the outdated PR89 head) so that actual Classic and 3D inventory support persist while continuing F01-D and later floor/glass/robot work. Keep PR89 visual bible and original five image import gate unchanged. Source reference docs:
`docs/S7_GREENHOUSE_OWNER_LAYOUT_CORRECTION_V3_20261117.md`, `docs/S7_F01_B_HALF_TILE_CI_HANDOFF_20261117.md`, `docs/S7_GREENHOUSE_BUILD_LEDGER_20261117.json`.
