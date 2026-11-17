# Trialum S7.8-B / F01-C — genuine quarter-marble GLB, four complementary assets

**Date:** 2026-11-17. **Branch:** `feature/lw-d-s7-greenhouse-approved-art-bible-roadmap-20261117` (draft PR #89 stacked on G01). **Scope:** ONLY F01-C modular marble quarter tiles. No game-engine writes, no changes to Android assets or G01.

## Owner decisions and independent issue
- F01-A full cream-white marble owner's visual PASS confirmed in conversation; original F01-A source/model/hash are frozen.
- F01-B half-metre tiles were generated and CI passed in prior step. User requested proceeding to the next step, but no explicit F01-B device-level PASS exists.
- Independently, the owner reported **empty shelves and refrigerator in the FOOD WAREHOUSE** and requested that another GPT session handle that issue; **THIS SESSION MUST NOT FIX IT**. An OPEN issue description was **committed directly to `main`**: [`docs/FOOD_WAREHOUSE_ENGINE_INTEGRATION_TODO_20261117.md`](https://github.com/extreme4music-nexus/Trialum/blob/main/docs/FOOD_WAREHOUSE_ENGINE_INTEGRATION_TODO_20261117.md), main commit `9fab71a93a96df9fd04c14a25c04122c3b67b8ea`. The root cause is user-reported, not independently proven; owner delegated investigation/fix to another session. Do not touch food stocks/UI/engine while working on the floor.

## Four true GLBs

Unlike an image plane, each binary is actual **glTF 2.0** with *3D closed, extruded, bevelled geometry*: `0.50m wide × 0.50m deep × 0.06m thick`, **40 positions, 20 triangles**, original PBR material (metallic=0, roughness=0.275), **384×384 embedded original marble PNG**. Original mesh writer from `tools/b1/build-s7-f01-marble.py`, no new texture.

| GLB | Local relative placement within 1m reference square (X,Z) | SHA256 |
|---|---|---|
| `f01-marble-cream-quarter-c1.glb` | `(0.0,0.0)` | `eb4e466efc43519ec897333b65f7cc8ab058e1b183351168949d84158455d2e8` |
| `f01-marble-cream-quarter-c2.glb` | `(0.5,0.0)` | `004612505dad2752d017782bb900646e5f66440d1bbfe24d19f0a955eb8c6f9d` |
| `f01-marble-cream-quarter-c3.glb` | `(0.0,0.5)` | `fe07468dacc5ad5068f75a9823b39db253811e18e39bb1513bd8dd733964bf80` |
| `f01-marble-cream-quarter-c4.glb` | `(0.5,0.5)` | `fdc08f841d9dc5969000d7b9592f38190b4c08a5e919860c1f5c796530f1208a` |

Each GLB ~**63,456 bytes**. **C1..C4 have FOUR complementary marble UV phases**, not four separate colors. Together the four 0.5m squares reconstruct the approved F01-A 1m marble pattern seamlessly except the physically intended fine bevel/grout line. Do not copy C1 at every placement with unchanged UV, since that will reset vein patterns.

## Strong reproducibility/unchanged original assets
- `tools/b1/build-s7-f01-quarter.py` regenerates original full F01-A and F01-B pair **in memory**, rejects if source hashes differ, then generates 4 new C GLBs. This is 100% deterministic standard-library code.
- Original A GLB unchanged SHA256 `787965608e2e4005a0ee84c857d7f0379a8093149b39da6bacb2d012feafc147`.
- Original B hashes unchanged: B1 `d5b88ef3079066ce6bba317e6f38196d13bd316f7a24eee8404177506b7cae8e`; B2 `db04892a98d14bb7ab8c92270042f3dc5f22edb782575200fed2d43acad3c5d5`.
- Original shared marble texture SHA256 `81c434a57b770148ced6e9c40dccabade929a844a27b143f2dc13a4da0ff8c98`.
- The standalone `tests/lw-d-s7-f01-c-quarter-review.test.py` checks all 4 real GLBs, exact metric bounds, embedded PNG, material, 1m global UV offsets, four covering positions, and no APK/gameplay writes.

## Verified GitHub Actions and artifact
- **[CI run 44051295840](https://github.com/extreme4music-nexus/Trialum/actions/runs/44051295840)**: `SUCCESS` from SHA `0c9730605e81f0b95dffd00f2441269f58406e57`.
- **15/15 PASS**: five F01-A regression tests, five F01-B tests, five F01-C new tests.
- **[F01-C real GLB ZIP artifact #14312854396](https://github.com/extreme4music-nexus/Trialum/actions/runs/44051295840/artifacts/14312854396)**: includes C1/C2/C3/C4, one shared unchanged embedded-texture PNG and `qa-manifest.json`.
- A local review picture (`Trialum_S7_F01_C_Four_Quarter_GLB_Models_Preview.png`) was created by reading the actual CI ZIP and original image, not by inventing GLB content. **Preview file is a conversation artifact**, not claimed to be committed to GitHub.
- The original 5 approved concept art PNGs still have an OPEN binary import gate in `docs/visuals/s7-greenhouse/README.md`; do not falsely claim they have been permanently committed.

## Status / NEXT
- `F01-C` = **real GLBs built and CI PASS; owner's visual verdict pending**.
- `F01-A` owner visual PASS. `F01-B` CI PASS; no explicit additional owner on-device validation claimed.
- `F01-D` edge finishing profile, `F01-E` corner profile, `F01-F` curved radial wedge, `F01-G` border, `F01-H` service finish, `F01-I` wet finish **not built**.
- Original G01 water/pools/glass shell, four G02..G05 terrestrial beds, G00L owner layout, existing game state, food stocks and `main` gameplay untouched.
- **NEXT only after owner's model preview review:** `F01-D` exposed edge trim in the SAME original material, model + tests + isolated artifact. Never start machines, warehouse fix or scene installation just because this CI passed.

**Owner veto/acceptance:** automated CI proves geometry/material correctness; only the owner can declare F01-C visually acceptable on their screen.
