# START HERE — TRIALUM S7 GREENHOUSE / 17 NOV 2026
## Important: this branch is PLANNING + OWNER-APPROVED ART DIRECTION, NOT a new playable build
This branch **`feature/lw-d-s7-greenhouse-approved-art-bible-roadmap-20261117`** is based on `44bd83bd1422ea6a0c9116c249763f29a024733c`, the signed G01 in-game water PR #88. Do not repeat empty APK #262/#268. The existing real G01 signed QA #288 is historical baseline, not an output of this plan. Never claim new GLBs/machines have been modeled or installed based only on this document.

## Required reading (in this order)
1. `docs/S7_GREENHOUSE_VISUAL_BIBLE_20261117.md` — the **5 exact owner-liked reference pictures**, each ref ID and original PNG SHA256. **Use these images as primary art direction**, not unrelated stock/AI styles.
2. `docs/S7_GREENHOUSE_MASTER_REQUIREMENTS_20261117.md` — all requirements for marble/stone floor, soil states, metal covers, excavators, transporters, repair humanoid, hologram workstation, drip system/panels, floor/wall/ceiling LEDs, exact plants and simulation-driven behavior, wall clock/offline catchup.
3. `docs/S7_GREENHOUSE_EXECUTION_ROADMAP_20261117.md` — phases S7.8-A through I; **the first implementation phase after owner approval is the 9 modular ground/soil/metal finishes S7.8-B**.
4. `docs/S7_GREENHOUSE_BUILD_LEDGER_20261117.json` — machine-readable status and original five image hashes; update each ticket after changes.
5. Previous `docs/LW_D_AGRO_S7_GREENHOUSE_BLUEPRINT_V2_ARCHITECTURE_20261116.md`, `docs/LW_D_AGRO_S7_G01_LIVE_WATER_IN_GAME_HANDOFF_20261116.md` and `docs/LW_D_AGRO_S7_ENGINE_CONTRACT_AND_OPEN_DECISIONS_20261116.md` — topology and authoritative original engine constraints.

## Canonical original assets and planned families
Exactly **five approved concept images** (REF-01..REF-05) at original size and original SHA. They are static images, not GLB. Owner explicitly liked them, wants them stored and followed. If binary originals have not been committed, do **not** claim repository image upload succeeded. The corresponding exact originals were exported as a separate five-image archive and can be imported to `docs/visuals/s7-greenhouse/` without altering their bytes; before accepting binary upload compare SHA256 against `S7_GREENHOUSE_VISUAL_BIBLE_20261117.md` and `S7_GREENHOUSE_BUILD_LEDGER_20261117.json`.
- Tiles 3; soils 3; metal caps 3 (nine tileable modular assets).
- Excavators 2; transporters 3; humanoid repairer 1.
- Hologram workstation: desk + monitor + tower + mouse + keyboard.
- Irrigation: reservoir, pumps, filters, hoses, sensors, splitters, valves, **drip emitters** and one mini controller per each of **4** existing beds.
- Lighting: **3 floor, 2 wall, 3 ceiling**; chandelier one central ring + 4 smaller rings; fully controllable *only after* engine action validation.
- Plants: original code lists `lumemoss`, `glowfern`, `mineralreed`, and water `aquaglow`. Need each full stages and animated idle/machine-wind reaction. Illustrative tomato, lotus, lavender etc. need separate owner/gameplay approval before being actual new species.
- Whole-world offline catchup is **new** requirement; current `js/plant-lifecycle.js` has `MAX_CATCHUP=365` game days. Do not misrepresent it as complete. Offline simulation must be authoritative, deterministic and reconciled at next activation; no hidden/perpetual background app CPU requirement.

## On developer resumption
Read the four new docs, inspect exact PR head and uploaded binary references, verify no missing original high-res PNGs, work **only on one S7.8 ticket** with original renderer/engine unaffected, owner image/GLB screenshot QA before moving to next ticket. No merges to main, new public Play release or arbitrary new simulation rules without owner PASS.

## Explicit user evaluation
User asked “Дали ти се допадна и дали ти помага ова?” — design provides a complete top-down style architecture and exact asset/system inventory, preventing the previously repeated “same APK” problem. Visual approval is of *concept art direction* only, not readiness of technical features or app.
