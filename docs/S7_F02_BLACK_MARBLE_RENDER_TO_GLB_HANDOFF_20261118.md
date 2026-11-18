# TRIALUM S7 F02 — approved BLACK MARBLE, 29 actual glTF2/GLB assets (2026-11-18)

## Owner visual gate
The owner explicitly approved the **black marble family renders** and requested all geometry and veining as true GLBs, following previously delivered cream-white F01 shapes. **The 3D models are implemented and generated; the physical GLBs still require owner's visual review in Builder before any game integration**.

### Exact 29-part inventory
- **F02-A (1)**: 1×1×.06m complete solid black marble tile.
- **F02-B (2)**: two complementary halves with continuous 1m UV phase.
- **F02-C (4)**: quarter tiles c1..c4; phase and original placement match F01.
- **F02-D (4)**: functional outer border strips north/south/east/west, same 6cm profile as F01.
- **F02-E (4)**: functional 6cm corner caps north-west/north-east/south-east/south-west, compatible with existing D trims.
- **F02-D-SHOWCASE (4)**: four *additional* visibly substantial 19cm wide /13.5cm raised **straight border pieces** from the owner image; separate from 6cm functional D edging.
- **F02-E-SHOWCASE (4)**: four *additional* large real **L-shaped 1m corner pieces** from the owner image; not mislabeled tiny 6cm E caps.
- **F02-F (1)**: one small repeatable actual-curvature black poolside 7.5°/1m radial module (r=7.2..8.2m).
- **F02-G (3)**: real curved raised border trim (1m, half, ~3m continuous standalone showpiece) on r=8.2..8.39m.
- **F02-H (1)**: honed matte 1m black marble finish, real embedded grain normal.
- **F02-I (1)**: finely textured wet-adjacent black marble finish, additional real 40×40 grid plus embedded grain normal. Visual finish, **NOT scientifically tested/certified slip resistance**.

Total: 1+2+4+4+4+4+4+1+3+1+1=**29** physical F02 assets. The Builder's previous 47 original assets remain unchanged; total **76 real GLB files**.

## Accurate mineral-vein pattern provenance
The original approved F02 **studio full tile image** has deep black mineral base, gray clouding, long diagonal broken white calcite veins and fine hairline secondary veins. To preserve visual similarity across models, the source top-face was perspective-corrected and resampled as a single 512px **embedded true color texture** from the user-approved image, rather than reusing cream F01 imagery or only assigning a black material. The *shared exact texture file* for the GitHub generator is:
- Authoritative encoded reference data `assets/materials/f02-black-marble-approved-render-atlas.b64`
- Deterministic reproducible renderer `tools/b1/build-s7-f02-black-marble.py`
- Generated physical atlas `assets/materials/f02-black-marble-exact-reference-atlas.png`
- Atlas PNG SHA256 `397184703cbb45563a953dbf178243060e499ae8815e95c3170753db1fe0599e`

Studio reflections and perspective/lighting vary from Three.js WebGL; **pixel-for-pixel identity is not guaranteed**. Compare actual GLBs in owner Builder; do not substitute generic black/dark-placeholder polygons. Same original source script and encoded atlas copied in Builder and Trialum dev feature branch; binary Git blobs of all 29 verified identical between those repos after CI.

## Folder placement
- **Builder** `extreme4music-nexus/Trialum-3D-Builder`, `main`:
  - `assets/models/f02-black-marble-*.glb` (29 real binary files)
  - `assets/catalog.json` (all 76 registered)
  - `tools/b1/build-s7-f02-black-marble.py`
  - `assets/materials/f02-black-marble-approved-render-atlas.b64`
  - `assets/materials/f02-black-marble-exact-reference-atlas.png`
  - `assets/materials/f02-glb-sha-manifest.json` (SHA256, triangles, model variants).
- **Game design-only branch** `extreme4music-nexus/Trialum`, `feature/lw-d-s7-f02-black-marble-render-kit-20261118`: identical source & 29 physically committed binaries, no gameplay installation.

## Three owner-editable Builder scenes
1. **ALL 29 models**: `projects/trialum-f02-black-marble-gallery.json` — 29 separate GLB objects, including large corner/trim showcase pieces.
2. **G01 real pool**: `projects/trialum-f02-black-marble-g01-pool-preview.json` — 7 individual F02-F curved floor tiles + 7 individual F02-G raised edges; authentic G01 basin, satellites, guardrail, crossing bridge, animated water. Preview only and walkway resurfacing requires separate physics integration gate.
3. **Finish comparison**: `projects/trialum-f02-black-marble-finishes-review.json` — polished F02-A, honed F02-H and micro-textured F02-I.

Use the top dropdown **Избери 3D просторија…** and select one of the three new **F02** entries. Editor changes save as Builder project JSON; **not** automatically installed into Trialum game.

## CI evidence and testing
- `tools/b1/build-s7-f02-black-marble.py` builds all 29 glTF2 files with embedded atlas, solid mesh geometry, material and hash manifest. Source-defining HTML/image generator work isn't required to run editor.
- `.github/workflows/f02-black-marble-assets.yml`: builds and commits real assets to Builder main.
- `.github/workflows/s7-f02-black-marble-glb.yml`: independently builds/commits the same originals only to the isolated Trialum design branch.
- `.github/workflows/bootstrap.yml`: rebuilds and verifies **all 76 models**, server delivery and previously frozen F01-A.
- The user's separate ZIP download was built as standalone locally from the same approved image-derived atlas but **may use a different generator snapshot**; its GLB byte hashes are not asserted equal to the GitHub authoritative binaries. Prefer GitHub Desktop Fetch/Pull for the canonical Builder implementation and source.

## Owner quality acceptance checklist
Inspect long discontinuous white-gray marble veins against reference, actual glossy surface, bevels, underside and sides, continuity when B/C pieces are arranged as 1m whole, functional D/E caps vs larger render showcase border/corners, seven **separate** F/G pool parts, G01 bridge clearance. Approve/fix physical model after testing; don't label owner QA PASS solely from automatic tests.

**Never alter production**: Trialum Classic, Android/Play, original live G01 room/physics, inventory, per-pet reserves, aquatic slots or user state are outside scope.
