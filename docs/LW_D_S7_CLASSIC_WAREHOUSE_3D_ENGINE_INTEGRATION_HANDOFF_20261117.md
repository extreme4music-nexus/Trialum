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

## 5. FINAL VERIFIED CI AND SIGNED QA APK — 2026-11-17
**Status: SOURCE INTEGRATED / IN-GAME S7 STOCK BRIDGE CI PASS / SIGNED INTERNAL OWNER QA APK READY / OWNER GALAXY A55 PASS PENDING.**

### Final authoritative source SHA and run
- GitHub Actions [run **44062940228**](https://github.com/extreme4music-nexus/Trialum/actions/runs/44062940228) — conclusion `success`; **2/2 jobs SUCCESS**.
- Exact signed APK SOURCE SHA: `4317531330c4e0368bba9960193cdf6a7f6615d3`. Later documentation-only commits may advance PR92 head, but they are **NOT code changes in this APK**.
- Job 1: `Test LW-D and build verified UNSIGNED SignQA intermediate` **SUCCESS**; includes independent Classic warehouse tests, new original engine→3D VM live bridge tests, original food supply, 3D warehouse, preserved G01 actual WebGL rendered screenshot, full existing regression suite, Gradle build, APK content allowlist and correct unsigned intermediate identity.
- Job 2: `Automatically sign ONLY LW-D Signing QA with existing permanent QA GitHub Secrets` **SUCCESS**, Android `apksigner verify` confirmed both v2 and v3, pinned QA certificate hash equality and correct non-debuggable SignQA identity.

### Actual downloadable deliverable
- [**OWNER-SIGNED Installable APK ZIP artifact ID 14320265423**](https://github.com/extreme4music-nexus/Trialum/actions/runs/44062940228/artifacts/14320265423), file name `Trialum-LW-D-AGRO-S7-OWNER-SIGNED-SIGNQA-294`, 8,623,309 ZIP bytes.
- ZIP contains `Trialum-LW-D-AGRO-S7-SIGNQA-SIGNED.apk`, **12,404,791 bytes**, genuine APK; **SHA256** `8e77378724c479da7585a80aa64eb7a3d20f0106ddec779999f687a4f50e0d24`. ZIP also includes `BUILD-INFO.txt`, `SHA256SUMS` and `*.apk.idsig`. Cross-checked the extracted APK hash with the included `SHA256SUMS`.
- Package `com.trialum.ziivaiskra.signqa`, versionCode **34**, same owner QA key, SHA256 signer cert `681771d0416f60ee1f01272f1dcd13d8557a1337ddc0318255db0b8796f8296c`.
- **Independently opened the extracted signed APK as a ZIP and verified real packaged bytes**, NOT only source: `assets/web/js/longplay-ui.js` contains Classic warehouse page navigation, `js/expansion-ui.js` contains `warehouseMove`, `js/app.js` contains `warehouseReady`, `agro-scene-bridge.js` contains `acceptCanonicalFood`, `live-context.js` handles unavailable stock, the actual 3D bundled warehouse renderer includes `ENGINE UNAVAILABLE`, and the G01 original `g01-water-surfaces-animated.glb` plus `aquaglow-mature.glb` are present.
- Separate actual-G01 browser screenshot evidence [artifact #14318787958](https://github.com/extreme4music-nexus/Trialum/actions/runs/44062940228/artifacts/14318787958) and warehouse/atrium Chromium evidence [#14318847939](https://github.com/extreme4music-nexus/Trialum/actions/runs/44062940228/artifacts/14318847939).
- A prior first attempt [run #44061220856](https://github.com/extreme4music-nexus/Trialum/actions/runs/44061220856) failed because the synthetic browser QA host lacked new canonical readiness and warehouseTotal fields. Corrected the **test-only fixture**, not weakened the production canonical validator. Another [run #44062063844](https://github.com/extreme4music-nexus/Trialum/actions/runs/44062063844) reached the legacy food-room test, which expected an old literal object field order; preserved the original `totalStock` field order without changing data meaning. **Final run passed both previously blocking stages, build and signer.**

### Safety and QA not yet claimed
- Owner has NOT yet confirmed Galaxy A55 direct in-device install and visual/functional PASS, cooling/performance, or save reconciliation. Do not state complete OWNER PASS or Play-ready release.
- **Install over existing SignQA APK** only; back up first; NEVER uninstall/clear data. This APK is **NOT** the Classic Play beta or normal public Trialum app identity.
- Do not invent stock: if user has never crafted food, real stock and warehouse shelves/freezer should be ZERO, which is expected. To verify functioning, craft `manna` (yield 3 under recipe conditions), then confirm real positive saved data in Classic More warehouse and 3D shelf; move to cold and packing using validated actions, supply pet and feed.
- Neither `main` nor Play was modified by PR92. The new signed APK should become the **basis of continued S7 3D work only after owner's QA**, using branch `feature/lw-d-s7-classic-warehouse-live-3d-integration-20261117`. No F01-A/B/C, G01 water or greenhouse scene change was included in the PR92 diff.

## 6. Resuming greenhouse development
After this one scoped fix passes, subsequent S7/3D work should **start from the successful warehouse integration branch** (not the outdated PR89 head) so that actual Classic and 3D inventory support persist while continuing F01-D and later floor/glass/robot work. Keep PR89 visual bible and original five image import gate unchanged. Source reference docs:
`docs/S7_GREENHOUSE_OWNER_LAYOUT_CORRECTION_V3_20261117.md`, `docs/S7_F01_B_HALF_TILE_CI_HANDOFF_20261117.md`, `docs/S7_GREENHOUSE_BUILD_LEDGER_20261117.json`.
