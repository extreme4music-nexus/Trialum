# Trialum S7.8-B / F01-A — REAL 3D GLB BUILT, CI VERIFIED (17 Nov 2026)

**Owner approval status:**
- **PASS visual direction only:** User explicitly approved the generated five-panel concept board `a_detailed_polished_design_board_infographic_for_t.png` on 2026-11-17 ("Ииии! И тоа како. ... Продолжи"). This does NOT automatically mean a GLB geometry/material or phone installation PASS.
- **Current asset status:** `F01-A REAL GLB BUILT + 5/5 standalone QA PASS + GitHub Actions artifact ready`; no owner in-device F01 PASS. **Do not falsely mark F01-B..I as built.**

## In-repo, exact reproducible real-asset implementation
- Generator: `tools/b1/build-s7-f01-marble.py`
  - 100% Python standard library, deterministic under the pinned build; standalone build folder only, no changes to runtime game assets.
  - Real metric **1m × 1m × 0.06m** slab with **4mm geometric bevel**, Y-up, bottom-left origin/pivot, normal/top and four side faces, 20 triangles / 40 UV-indexed vertices (corner duplicates to define faces).
  - Original **384×384 RGBA marble PNG** procedurally authored with periodic veins matching at UV wraps. Embedded directly in **real glTF 2.0 GLB** with PBR, metallic 0 and roughness 0.275. The PNG is also emitted separately for visual inspection.
  - Output: `build/s7-floor-f01/F01-A/f01-marble-cream-full.glb`, `f01-marble-cream-basecolor.png`, `qa-manifest.json`.
- Validation: `tests/lw-d-s7-f01-a-review.test.py` — genuine GLB structure, version/chunks/material image/buffer, exact bounds, image+manifest hashes, 384² texture periodic seam, no game writes, exactly ONE generated GLB.
- Workflow: `.github/workflows/s7-f01-a-glb-review.yml` — isolated push/dispatch CI with only read permission. Does NOT compile or sign APK, does not merge, and never writes to game engine. Uploads binary review artifact.

## Grounded CI proof and artifact
- **GitHub Actions run:** [S7-F01-A run 44046713540](https://github.com/extreme4music-nexus/Trialum/actions/runs/44046713540)
- **Built from head source SHA:** `4bfacc0d1bba840f4d4d8d440dc050d22eafd258`.
- **Run result:** SUCCESS, 5/5 dedicated unittest PASS; all PNG seam/GLB validation checks PASS.
- **Original GLB inside ZIP:**
  [Trialum-S7-F01-A-REAL-MARBLE-GLB-REVIEW](https://github.com/extreme4music-nexus/Trialum/actions/runs/44046713540/artifacts/14312250804)
  artifact ID **14312250804**; retained for 30 days (do not mistake this temporary artifact for a permanently committed binary in repo). The reproducible **generator source IS permanently committed** in repo; rebuild if artifact expires.
- **Exact GLB:** `f01-marble-cream-full.glb`, size **63,148 bytes**; **SHA256** `787965608e2e4005a0ee84c857d7f0379a8093149b39da6bacb2d012feafc147` (matched local generator and CI).
- **Exact embedded PNG:** `f01-marble-cream-basecolor.png`, size **59,988 bytes**; SHA256 `81c434a57b770148ced6e9c40dccabade929a844a27b143f2dc13a4da0ff8c98`.

## Owner-facing review point
Owner should inspect **the actual F01-A GLB** (or real isometric preview tied to its texture), and compare with REF-02 and accepted F01 concept render. If the natural marble veins/cream color need polish, edit the deterministic generator and rerun the standalone CI; **do not install material into live scene before review**. In particular, the authored actual material has subtle natural cream veins and no fake baked lighting; it might look less shiny in a flat neutral render than concept art because specular depends on scene illumination.

## NEXT *SINGLE* step, not started
After owner reviews F01-A GLB, advance to **F01-B half tile 1.0m × 0.5m** reusing identical PBR palette and periodic texture, validate shared seams. Then F01-C quarter. Only when the physical 9-piece kit passes visual QA may a separate scene-placement ticket install tiny dry-floor test sections in G01 and G00L. Do not alter current four pools/bridge/rails/4 aquatic slots or new V3 zoning.

## Known archived-art limitation
The FIVE original owner-liked PNG concept images are recorded by exact SHA in visual bible but not yet committed as bytes into `docs/visuals/s7-greenhouse`; preserve existing OPEN gate; do not pretend otherwise. Their archive ZIP is safely available to owner separately. Do not block a standalone F01 GLB generator artifact or substitute different pictures as approved references.

## No other system impact
`main`, Google Play distribution, G01 animated water, existing `plantId`s, `bed-1..4`, source greenhouse scene, GLB model registration, token balances, G00L storage and offline clock are unchanged. This is an original **one-model review build**, not a new Android version.
