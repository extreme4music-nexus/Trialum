# 3D SESSION HANDOFF — Classic-only Food Warehouse contract, NO 3D code changes (2026-11-17)

Owner split: **this GPT session only implements the original Classic warehouse**. All actual 3D-to-engine integration belongs exclusively to the *other* GPT/3D session. Do not infer that the 3D room is already connected.

## Source refs
- Standalone Classic source: `extreme4music-nexus/Trialum`, branch `feature/classic-only-food-warehouse-play-update-20261117`.
- Legacy stacked S5/S6 drafts #82/#83 contain earlier experimental warehouse bridge implementations; use them for comparison, not as authority to merge over the independently moving 3D/greenhouse branch.
- Codex handles `trialum-beta` and `Trialum-Android-Builds` separately. This handoff does not authorize changes to those repositories.

## Immutable original engine food contract
- `s.foodFactory.stock[id]`: actual conserved total, including both warehouse and pet portions.
- `s.foodFactory.warehouseBins[id] = {rack,cold,packing,hand}`: location of stock inside original world; NOT an independently spendable wallet.
- `s.foodFactory.petReserves[petId][id]`: portion owned by one original pet.
- Invariant per recipe: `stock[id] = rack+cold+packing+hand+sum(petReserves[*][id])`.
- `TrialumWarehouseInventory.project(s,E.foodRecipes,selectedPetId)` returns real per-formula `stock,warehouse,rack,cold,packing,hand,petReserve`.
- `TrialumWarehouseInventory.action(s,E.foodRecipes,{op:'take'|'put',recipe,from,to})` moves one portion from rack/cold/packing to hand or back.
- `TrialumWarehouseInventory.transferPet(s,E.foodRecipes,{op:'supply'|'return',recipe,petId,zone,amount},compatible)` conserves inventory and checks pet and habitat. Existing Classic UI uses amount=1.
- All state changes MUST execute in trusted parent/original engine and trigger its existing save/render/backup path. Renderer only displays a read-only projection. Never do an independent 3D write or invent an initial stock.
- Food lab only produces using `E.craftFood`; feeding consumes real per-pet reserves; do not introduce duplicate inventory, automatic free refills or direct lab-to-pet feeding.

## Work reserved solely for the other 3D session
1. Identify its current ACTIVE S7/GLB branch and precise shared source SHA; inspect existing scene/HUD/iframe bridge and its own accepted source lineage.
2. Bring only the **Classic contract** (not UI DOM, not Codex beta/build workflows) into that lineage, reconciling S6 bridge names and current adapter.
3. Use original parent read-only snapshots to animate rack/cold/packing and the 3D shelf/fridge labels. Send explicitly validated take/put/supply/return requests through the single original bridge; save only after success.
4. Compare identical saved game in Classic vs 3D: craft +N → rack +N; transfers are conserved; individual pet reserve -/+; consuming food reduces canonical total exactly once; empty remains zero.
5. Preserve ALL latest GLB/greenhouse visual work and prior owner-accepted behavior. Do not touch Classic food recipes/costs or alter physical stock amounts just to make a 3D counter nonzero.
6. Test cache/reopen, backup/restore, offline, reentry, double-tap, disconnected pet, incompatible recipe, and on-device signed QA. OWNER phone PASS before merge.

**Explicitly NOT done by this Classic session:** 3D renderer, GLB meshes, 3D hologram displays, scene synchronization, bridge connection, Android build, Play upload.
