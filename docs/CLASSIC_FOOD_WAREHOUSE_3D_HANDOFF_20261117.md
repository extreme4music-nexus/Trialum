# Classic food warehouse — handoff to 3D session (17 Nov 2026)

## Owner's strict separation
This branch implements **only the original/Classic game** menu and exercises the existing S6 canonical logistics. It does **NOT** connect or modify any 3D warehouse scene, GLB model, iframe, renderer, live-context or HUD. The 3D session owns that later integration.

## Source
- Based on existing S6 draft branch `feature/lw-d-agro-s6-food-supply-chain-pet-reserves-20261116` and PR #83; DO NOT merge a stacked feature blindly into main.
- Existing S6 authoritative total: `s.foodFactory.stock[recipeId]`.
- Locations: `s.foodFactory.warehouseBins[recipeId]` with rack/cold/packing/hand; `s.foodFactory.petReserves[petId][recipeId]`.
- Invariant: stock = rack + cold + packing + hand + sum(pet reserves). All operations use `TrialumWarehouseInventory`, which reconciles older saves.
- Original `E.craftFood` creates stock; `E.feedPrepared` and `E.petCare(...,'feed')` consume personal reserves via the S6 wrapper.
- Classic menu: More → **Стовариште за храна**. Read-only projection: `TrialumWarehouseInventory.project(s,E.foodRecipes)`; transport by `action({op:'take'|'put',recipe,from,to})`, delivery/return by `transferPet({op:'supply'|'return',recipe,petId,zone,amount:1},compatible)`.
- UI handles through `TrialumExpansion.handle`, then existing `ctx.notice` for canonical autosave and refreshed UI.

## 3D team's follow-up (NOT performed here)
1. Work in the dedicated 3D session; locate its active head/source SHA and integrate the *accepted* original S6 + this Classic-only branch with Git ancestry inspection. Avoid overwriting later greenhouse work.
2. Read inventory from the original parent world via the existing trusted bridge's canonical `food` snapshot / `warehouseOperation` interface. Never compute a separate warehouse stock in GLB or browser UI; zero is valid when actual.
3. Ensure the 3D racks/cold/packing and pet delivery show exactly the same counts as Classic after craft, take/put, supply/return, feed, save/reopen and backup restore. Honor per-pet IDs and compatible recipes. No fake stock, no duplicate receipts.
4. If there are mismatched snapshot names between S6 and current 3D code, fix **only the 3D adapter** in that other session. Do not change Classic API semantics or original stock totals to fit a visual display.
5. Validate on signed owner QA APK and physical Galaxy A55. GitHub CI alone does not confer OWNER PASS.
6. Keep Draft PR, no main merge, release, signing changes or Play publication without owner's permission.

## Manual checks before owner acceptance
Craft two recipes in Food Laboratory; open More → Warehouse; check shelf counts; take one to hand then put into cold; supply one to a compatible pet; check home reserve; feed exactly once; check total falls by one; return portion; restart/backup restore; old save without bins; zero-stock UI. Tests are supporting evidence, not a substitute for owner testing.

## Scope boundaries
No changes to 3D scenes, renderer, food-lab recipes/costs, social, server, pushes, Google Play or achievements. Other scenes are someone else's task.
