# TRIALUM S7.8-B / F01-B — TWO REAL MODULAR HALF-TILE GLBs: CI VERIFIED

**Date:** 17 November 2026. **Scope:** only half-tile asset family, no installation into game.  
**Owner decision:** F01-A cream marble review was approved ("Ја видов. И супер е плочката. Продолжи сега со половична плочка."). This is owner VISUAL PASS for the prior F01-A model, not approval of the two new B shapes until inspected.

## Why the half tile has two GLB files

One repeating tile of size **1.00 × 0.50 × 0.06 m**, but TWO complementary UV phases, with identical beige mineral veins and exact PBR:
- `F01-B1` — `f01-marble-cream-half-first.glb`: top material UV across **0.0 ≤ v ≤ 0.5** of approved F01-A original material, origin bottom-left, place at `z=0` on a grid aligned to 1 m. B1's main top-face UV covers about **0.004–0.496** to allow a 4 mm bevel.
- `F01-B2` — `f01-marble-cream-half-second.glb`: top material UV across **0.5 ≤ v ≤ 1.0**, same geometry and PBR, place at `z=0.5m` relative to B1; upper bevel UV about **0.504–0.996**. Together B1+B2 form exactly the original 1 × 1 m footprint and use the original 1 m-scale natural-vein texture instead of stretching it or repeating an obviously different half pattern.
- **WARNING:** repeating B1 twice at the same UV phase, without its B2 complement, introduces an avoidable middle mineral-vein jump. Placement logic must respect the 1 m grid / UV phase. This B pair is one half-tile *type* with two pattern phases, not authorization to generate two different marble materials.

**Same ORIGINAL F01-A source:**
- `tools/b1/build-s7-f01-half.py` calls the pre-existing `tools/b1/build-s7-f01-marble.py` Mesh, 384² original PNG generator, and real glTF binary writer, leaving approved F01-A source untouched.
- Shader `F01.cream-white.PBR-dry`, metallic **0**, roughness **0.275**, **embedded PNG** SHA256 exactly `81c434a57b770148ced6e9c40dccabade929a844a27b143f2dc13a4da0ff8c98` (unchanged vs F01-A).
- Original full F01-A *byte-for-byte reproduced* GLB SHA256 `787965608e2e4005a0ee84c857d7f0379a8093149b39da6bacb2d012feafc147` (unmodified approval).
- Both B shapes have actual 3D side walls, beveled top edges, bottom face, 20 triangles, 40 separate face-normal vertices, UVs, Y-up, bottom-left pivot, embedded PBR image. They are **not PNG planes**.

## Exact GitHub CI evidence
- GitHub source SHA of successful artifact: `fd91540526b4ff63ce9153d5d2fafcb4052febd4`.
- [GitHub Actions workflow #44047985335 — SUCCESS](https://github.com/extreme4music-nexus/Trialum/actions/runs/44047985335) — **5 F01-A regression tests + 5 F01-B new tests = 10/10 PASS**.
- Verified artifact ZIP [Trialum-S7-F01-B-REAL-HALF-GLB-PAIR-REVIEW](https://github.com/extreme4music-nexus/Trialum/actions/runs/44047985335/artifacts/14311778889), ID **14311778889**, contains:
  - `f01-marble-cream-half-first.glb` **63,304 bytes**, SHA256 `d5b88ef3079066ce6bba317e6f38196d13bd316f7a24eee8404177506b7cae8e`
  - `f01-marble-cream-half-second.glb` **63,304 bytes**, SHA256 `db04892a98d14bb7ab8c92270042f3dc5f22edb782575200fed2d43acad3c5d5`
  - `f01-marble-cream-basecolor-shared.png` exact approved PNG, and `qa-manifest.json`.
- [New independent tests](../tests/lw-d-s7-f01-b-half-review.test.py) [path: `tests/lw-d-s7-f01-b-half-review.test.py`] verify both GLBs are actual glTF2, real metric bounds, node IDs `S7-FLOOR-F01-B1/B2`, identical material/image, complementary midline UV and no gameplay writes.
- Separately the downloaded GitHub artifact was verified in local 3D importer: each mesh has **40 vertices, 20 triangles and exact bounds [0,0,0]–[1,.06,.5]**. A 3D UV-projected comparison preview was created from those GLBs and exact embedded texture for owner inspection; it is not falsely described as an Android screenshot.

## Acceptance statuses
- F01-A owner model PASS: **YES** (user's explicit message).
- F01-B successful REAL GLB build and automated QA: **YES**.
- F01-B owner model visual PASS: **PENDING**.
- F01-C quarter, F01-D/E/F/G/H/I: **NOT STARTED**.
- F01-A/F01-B installed in original Android game: **NO**.
- New signed APK: **NO**.
- `main`, G01 water and 4 original terrestrial + 4 aquatic slots: **UNCHANGED**.
- Original five approved concept PNGs still require binary GitHub import according to [Visual Archive README](visuals/s7-greenhouse/README.md); no claim of completion.

## NEXT STEP after owner reviews F01-B
Only F01-C (0.5 × 0.5 × 0.06 m) quarter-tile with four complementary UV phases; original 1 m marble is preserved. Use same one-step workflow: real GLB source → texture/UV seam tests → isolated artifact → owner inspection. Do not enter engine logic or install any floor across the G01 basin cut-outs yet.
