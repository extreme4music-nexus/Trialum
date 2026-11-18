# Trialum S7 — Soil 5×5 planting grid: completed static GLB / future engine handoff
**2026-11-18 • Design assets only • Owner physical model acceptance still pending**

## What is actually delivered
Five real, independently selectable glTF2 binaries:
- `assets/models/s02-planting-bed-5x5-empty.glb` — original 1 × 1 × .12 m soil slab with **25 genuinely depressed physical holes**, subtle physical 5 × 5 guide lines and 25 numbered embedded node anchors `R01C01` to `R05C05`.
- `assets/models/s02-single-hole-soil-plug.glb` — individual soil closure cap with its own geometry and actual owner-reference-derived soil texture, attach **only to occupied socket**.
- `assets/models/s02-slot-target-ring.glb` — translucent-ish design target used while selecting one of 25 cells, **not persistent plant state**.
- `assets/models/s03-dug-turnover-soil.glb` — dug and rough loosened soil without planting cavities or planted vegetation, from owner-approved second concept.
- `assets/models/s02-demo-seedling-preview.glb` — mini demo seedling, **NOT an actual botanical species or plantId**. Any authoritative plant must use the real owned plant GLB bound to canonical plantId.

**Four Builder projects:** `trialum-s02-25-empty-holes.json`, `trialum-s02-mixed-planting-demo.json`, `trialum-s03-dug-soil.json`, `trialum-s02-s03-soil-comparison.json`. All in `projects/`, selectable from the Builder room menu.

## New Builder interaction
Button **🌱 Матрица 5×5** opens a 5×5 interactive grid on a selected S02 block.
- Button at row `r`, column `c` addresses `R{r:02d}C{c:02d}`.
- Clicking an OPEN cell adds the *separate soil plug* at that precisely computed location. Clicking a filled cell removes the *preview* plug (and any explicitly demo-only sprout attached in that position).
- For visual preview, the button caps plugs at **five on the selected soil tile**; the **game's true limit is five per bed across all tiles**, enforced only by the engine. These are not authoritative game commands.
- The scene is locally saved and can be pushed as a normal design project JSON. Only existing soil plug geometry changes; no game database, inventory, plant ID or food stock can be mutated from this UI.

## Coordinate contract (precise)
Each base tile is **1 × 1 m in X/Z, Y-up, with pivot at its lower-left bottom corner** and actual soil surface at `localY=.12m`.

For 0-based `r,c ∈ 0..4`:
```js
slotId = 'R' + String(r + 1).padStart(2,'0') +
         'C' + String(c + 1).padStart(2,'0')
localX = 0.1 + c * 0.2
localZ = 0.1 + r * 0.2
localY = 0.12
// Parent transform (must account for tile rotation/scale) yields world position.
```
Every soil cell has a crater ~6.7cm radius and ~4.5cm depth. `assets/soil-slot-matrix.json` lists all 25 precise sockets. The soil plug pivot is its own collar's surface plane; attach at `localY=.12m` relative to its parent tile.

## AUTHORITATIVE gameplay guardrail
Canonical greenhouse has **4 terrestrial beds** `bed-1`, `bed-2`, `bed-3`, `bed-4`, each with **5 real plant slots**. Original 4 aquatic plant slots remain unchanged. **A visual S02 tile's 25 possible mesh positions are NOT 25 new plant slots.**

Future engine adapter must receive authoritative events:
```
{ bedId, canonicalPlantSlotId, plantId, soilTileId, visualSlotId, status }
```
No one should invent `canonicalPlantSlotId` or `plantId` from the graphic matrix. Choose an unused visual cell only **after** the original engine successfully commits a valid planting event in an existing bed slot. Save an explicit mapping of its canonical slot / plantId to `soilTileId + RxxCxx` in user game state, not in the GLB or authoring catalogue. At each render:
1. Read canonical plant slots for the bed; never trust Builder demo occupancy.
2. Place one soil plug for **each canonical planted slot with an assigned visual hole**, then render corresponding existing real plant GLB there (avoid copied decor/persistent fake plants).
3. Keep ALL other holes OPEN. Unplanted/newly ploughed tiles show the separate dug soil model, not fake filled cavities.
4. When a canonical harvest/removal/transfer record confirms a change, reconcile the visuals exactly once using the source of truth. Respect existing game save/restore and server sync rules.
5. One canonical game slot may map to exactly one visual site, and no two plant IDs may claim the same visual site. Lock concurrent planting with existing engine commit control.
6. If mapping is missing after restore, preserve the plant's original canonical identity and pause only its graphic attachment; do not mint a new plantId.

Do not merge these GLBs into main Classic, 3D gameplay, Android APK, or Google Play automatically; this handoff is specifically for the other **3D engine integration** chat after owner validation.

## Nomenclature requiring owner decision
Older S7 master brief names **S01** freshly dug soil, **S02** prepared holes, **S03** untreated compacted soil. The approved second render in the current conversation was described as ploughed/dug `S03`. The delivered filename preserves that *owner-conversation visual label*: `s03-dug-turnover-soil.glb`. **Before gameplay integration reconcile the naming**, likely map the approved dug tile to canonical S01, and reserve canonical S03 for any separately approved untreated soil look. DO NOT silently change engine enums.

## Provenance and QA
- Source ZIP and extracted generator: `assets/source/s7-soil-approved-visual-source.tar.zlib.b64`, `tools/b1/build-s7-soil-approved.py`.
- Cropped photo-derived texture asset: `assets/source/soil_approved_s01_s02_atlas.jpg`; generated PBR color/normal PNGs are embedded in GLBs.
- SHA file: `assets/soil-model-manifest.json`; originals reference render filenames recorded there.
- Tests: `tests/soil-glb.test.py`, Builder `tests/models.test.py` and `tests/editor-files.test.mjs`. Ensures GLB2 mesh, watertight solids, 25 real 3D depressions, independent plugs, 5 original plant slots per bed, no game-state writes.
- F01/F02/F03/other 130 earlier GLBs preserved; Builder total **135**.

**Owner visual PASS for actual GLB files and a decision on S01/S03 canonical naming are still outstanding.**
