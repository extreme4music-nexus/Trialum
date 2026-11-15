# TRIALUM L3.9 — CANONICAL ENGINE IMPLEMENTATION / REGRESSION & OWNER QA

**Updated:** 2026-11-15
**Authority:** Owner's sequential rule. **Scope:** Original Classic game engine ONLY. No new physical ground-floor 3D rooms yet.
**Branch:** `feature/lw-d-l3-9-ground-floor-agro-lobby-20261115` · [Draft PR #73](https://github.com/extreme4music-nexus/Trialum/pull/73), child of L3.8 Draft PR #72. No merge to main or public release.
**Status:** source implemented; automated GitHub CI and owner in-person Galaxy A55 acceptance must be independently confirmed. Existing historical L3.7 phone audio/B and L3.8 menu owner acceptance remain pending.

## What changed IN THE ORIGINAL GAME
- `js/plant-lifecycle.js`, loaded **immediately after `js/longplay.js` in real `index.html`**, upgrades the single existing `TrialumEngine` instance with `E.ensureAgro`, `E.produceSeedling`, `E.plantInGarden`, `E.waterPlant`, `E.transplantPlant`, `E.craftAdditive`, `E.applyAdditive`, `E.removeDeadPlant`, `E.findPlant`. No second engine, database, server, balance or currency.
- `js/engine.js` original `daily()` now credits only **living** plants for habitat oxygen/nutrient uptake, no free home plant on **new** builds after s.agro is active, and avoids old unconditional +4.7 growth while the new authoritative lifecycle is active.
- **Blueprint/plant rule:** `E.inventPlant` still unlocks one species model through the old Insight/Molecules checks, but no longer plants a home automatically. The old instant `E.plant` command is gated with an explicit explanation, even if invoked from an un-updated 3D Flora UI.
- **Seedlings:** each `E.produceSeedling` requires an unlocked model, 1 original laboratory action and **C8/N5/P3/O6** original shared atoms; only after all checks are true is exactly 1 unit credited to `s.agro.seedlings[id]`. No free inventory from unlock.
- **Ground-floor 3D Garden future, functional Classic NOW:** four terrestrial beds (5 slots each) and a separate aquatic aquarium (4 slots); planting into bed consumes exactly one existing seedling and one garden action. Fictional `aquaglow/Аквалум` is a distinct research-unlocked water-only species. Nothing is placed directly into `h.flora[]` from a blueprint.
- **Care/health:** each single plant ID has real growth, health, hydration, lastWaterDay, lastAdditiveDay, dead/deathDay; water consumes a canonical daily action (garden or own home), raises hydration +43, only once per day. Growth advances **only on original game day**, not WebGL frame/interval. Dehydration and nutrient deficiency lower health progressively; a plant that reaches 0 dies once, remains dead across restore, cannot yield living bonuses/water/treat/transplant. Dead plants may be removed only by a validated action (no reward).
- **Transplant:** only living garden plant growth ≥85 and health ≥50; validated real existing destination habitat + capacity/available habitat action, and aquatic flora only into lagoon. **Exact same object/plant ID moves** once from gardenPlants to original `h.flora[]`; garden stock no longer contains it.
- **Phyto Lab additive production:** four fictional recipes (macro-balance `Ca7/Mg5/K6`, micro-boost `Fe5/Zn2/Cu2`, hydro-stabilizer `Na4/O8/H6`, phyto-regenerator `C10/N6/P3`) with research tier gates and 1 real `s.labActions` per craft, shared canonical `s.elements` deductions, separate limited finished-product stock `s.agro.additives[id]`; apply exactly one paid additive to a living specific plant with a valid daily action. No invented separate Ca/Mg/etc stores or real chemical recipe.
- `js/plant-lifecycle-ui.js` = original bilingual Flora screen's working **Nursery / greenhouse / aquarium / additive maker / existing home plant care**. `js/longplay-ui.js` and `js/app.js` route all operations directly into the same canonical game state and original `notice → render → save`, never into a parallel 3D wallet or pet simulation.
- `js/app.js` blocks a second tap on the same Flora button until result/render; 3D parent read-only Flora projection does **not** advertise immediate habitat planting anymore. New alerts include specific plantId.
- `sw.js` lists both new source files for offline PWA; Android Gradle `syncWebAssets` already includes all `js/**` as the same original offline app.

## Save continuity / explicit limitations
- Existing pet IDs, biospheres, home assignments, pre-existing `h.flora[]` plant IDs/growth/species and user backups remain intact. `s.agro` is additive JSON schema v1; `E.VERSION`, APK IDs and existing Play Games and backup formats unchanged.
- Old worlds without `s.agro` get first-migration **grace**: the first offline catch-up does not retroactively kill their plants, then new day processing starts. No free new seedlings or additives.
- The original game’s catch-up remains bounded to 365 logical days; life simulation is handled with idempotent `lastProcessedDay`, not a new background interval or server. Growth/care is simulated in original game time even when 3D isn't visible; **3D animations run only if the scene is on-screen**.
- The **Food Lab**, `E.craftFood/E.feedPrepared` and original `s.foodFactory.stock` are deliberately untouched. The ground-floor food warehouse is still a future read-only 3D room. Pet houses growing edible crops and playing on-screen 3D farming animations are a later separate phase.
- Greenhouse, phyto lab and warehouse physically **NOT YET BUILT in 3D**. Original 3D Flora Lab's old immediate planting button is safely disabled; the original Classic Flora nursery is the functional interface until the owner accepts a new 3D room phase.
- Geolocation and live weather are *not* implemented in this engine-only slice; separate opt-in visual 3D work follows the canonical plan.
- Cost and timing values are game balance candidates for owner device testing, not owner-approved final tuning.

## Automated QA
`tests/lw-d-l3-9-original-plant-engine.test.cjs` proves:
1. Native Classic and offline PWA/Android source integration.
2. Real unlock does not give free seedlings/home plants.
3. Exact original atom + original lab action accounting for a seedling; no partial losses.
4. Correct media, exact bed capacity and seedling stock deductions.
5. Aquatic-only aquarium and lagoon transplant.
6. Real macro/micro additive craft/stock/apply and original shared element accounting.
7. Daily watering once, health/growth progression, deterministic neglect and irreversible death/alert.
8. Identity-conserving one-time mature transplant, not duplicate.
9. Legacy backup/save/restore and first-time long-offline migration safety.
10. Non-mutating Classic render and original-vs-3D UI wiring.
11. Repeat E.advance same date no double day growth.

## OWNER MANUAL GALAXY A55 TEST — explicit PASS pending
- **First create backup** using the existing app. **Do not uninstall SignQA or clear data.**
- Install **SIGNED** GitHub QA APK in-place over `com.trialum.ziivaiskra.signqa` only after CI SUCCESS and existing permanent QA signature verification; do not use UNSIGNED APK.
- Open original Classic **Флора**: unlock a new model, see 0 seedling until explicitly produce; original credits/resources/actions decrease exactly once. Old direct `plant` must no longer bypass.
- Make seedling → select terrestrial bed → grow/water on subsequent real game days. Aquarius uses only `Аквалум` and cannot plant it into terrestrial bed.
- From Phyto Lab spend original Fe/Zn/Cu or Ca/Mg/K to craft; inspect stock and apply to one living plant; repeated same-day treatment denied without extra spending.
- Confirm no water for long enough causes gradual wilt, alert, death at health 0 (not instant), and dead plant cannot be watered, treated, or transplanted.
- Confirm only a genuinely mature and healthy plant can move to one real existing habitat, preserving ID and exact capacity.
- Check previously saved home flora and pets, local/full-screen playground, messages/friends, audio/music, food production/feeding, English, offline and JSON backup/restore remain correct.
- **OWNER PASS required** before proceeding to 3D ground-floor new lobby and three rooms; no main merge, Play release or unverified signing.
