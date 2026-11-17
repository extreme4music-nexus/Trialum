# TRIALUM — FOOD WAREHOUSE ENGINE INTEGRATION TODO (OWNER-REPORTED)
**Date:** 2026-11-17 · **Status:** OPEN / NOT IMPLEMENTED BY THIS NOTE
**Owner assignment:** Another GPT/Codex session is responsible for investigating, implementing and testing ONLY this issue. The S7 greenhouse/F01 agent must not modify food stocks, food gameplay logic or warehouse operations.

## User-reported problem
The owner reports that the food warehouse scene shows **zero inventory both on the shelves and inside the refrigerator**. The suspected reason is a **missing or incomplete authoritative food-warehouse representation/connection inside the original game engine**, including the Classic/basic game interface. This is a USER REPORT AND REQUEST TO INVESTIGATE, not a separately verified code-root-cause diagnosis.

**Expected end state:** The original Trialum game engine contains the canonical warehouse stock state and operations (as permitted by existing design and actual code), and both the Classic/basic game screens and the LW-D 3D warehouse render the same genuine source-of-truth stocks. The food production laboratory should produce inventory, the warehouse should store actual inventory, and animal/pet food reserves should draw from real warehouse stock. All quantities must correspond to canonical data, with no invented items, duplicated stock or disconnected zero-valued read-only HUD.

## Scoped implementation brief for the separately assigned session
1. Inspect the actual latest integration branches, food lab, original engine, existing warehouse scene/bridge, persistence, food-home/pet-reserves flows and prior S6 documentation before changing any files. The current `main` may not yet contain the full S6/LW-D draft stack; **do not assume a missing warehouse in `main` is necessarily the source of the observed zero display**.
2. Determine why both shelf and fridge show zero: missing persisted engine inventory, absent state migration, incorrect snapshot projection / namespace, failed receipt/transaction, layout-mapping failure, and/or actual empty legitimate inventory. Establish the root cause with real state evidence; do NOT assume it is only a UI bug.
3. Introduce or repair **one canonical source of truth** for warehouse stock (shelf vs refrigerator/cold-storage separation, item type, real quantities and food lab → storage → individual pet stock transfer operations). Reuse original identifiers and gameplay contracts; do not create a parallel 3D-only engine.
4. Integrate the actual warehouse data and controls into the **basic/Classic game**, not only the new 3D space. Both views must read the same saved user state and enforce the same limits. No unbacked "virtual" stock and no client-side game writes from scene projections.
5. Maintain compatibility with previous saves/backups/restores, day progression, offline catch-up, S6 pet-food reserves, pet consumption, labs, multi-locale UI and valid zero stock. Prevent lost inventory, negative quantities, double transfer and duplicate write on refresh/retry.
6. Add tests for production, shelf stocking, refrigerated stocking, withdrawal, pet reserve refill, real zero conditions, app reopen, migration, restore and network interruption; test the signed original Android app on the owner's device before claiming OWNER PASS.
7. Work in its own scoped draft PR, document exact source SHA / test/CI proof / owner confirmation, and **never merge to main or publish to Play without the owner's explicit permission**.

## Ownership and coordination
- Food warehouse game-engine issue belongs **exclusively to separate GPT session**, by owner's direct instruction.
- The current S7 greenhouse F01 development session continues independently with marble floor F01-C and later modules, **no food system edits**.
- This MAIN-branch note is intentionally documentation-only and makes **no claim** that the defect has been repaired.
- When the other session fixes it, replace status with its exact PR, tests, data migration approach and owner-verified outcome. No speculative completed checkboxes.

**Reported by owner:** "Стовариштето за храна во енџинот не сме го направиле. Затоа и во стовариштето пишува нула и на рафтови и во ладилникот. ... ќе кажам на GPT во друга сесија да го поправи само исклучиво тоа." 
