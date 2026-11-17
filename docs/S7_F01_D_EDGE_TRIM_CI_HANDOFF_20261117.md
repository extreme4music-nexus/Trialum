# TRIALUM S7.8-B / F01-D — REAL EXPOSED CREAM MARBLE EDGE GLB · FOUR DIRECTIONS
**Date:** 2026-11-17
**Status:** `REAL_FOUR_GLBS_BUILT_CI_21_OF_21_PASS_OWNER_VISUAL_PENDING`
**Isolation:** stand-alone **real GLB assets only**; not rendered into the live greenhouse, not in any signed/new APK, not merged to `main`, not published to Play. No Classic Beta or future Codex security changes touched.

## Immutable ancestry / what the next chat must preserve
- Parent Draft [PR #92](https://github.com/extreme4music-nexus/Trialum/pull/92) is the **current 3D foundation** with Classic↔3D food-warehouse engine integration. Its owner-signed, CI-passed but **on-device not yet approved** SignQA APK proof is [run 44062940228](https://github.com/extreme4music-nexus/Trialum/actions/runs/44062940228).
- S7 visual bible and original module floor history are in its ancestor Draft [PR #89](https://github.com/extreme4music-nexus/Trialum/pull/89).
- THIS build is a purpose-specific child branch of PR #92: `feature/lw-d-s7-f01-d-cream-marble-edge-trim-20261117`; base when created: `e035ddf5aa1cf28421b109ca03e9f56d019b91fc`.
- DO NOT cherry-pick the unrelated Classic beta; Codex is making separate security, messaging, friends, AI memory, account deletion and social changes. Wait for its **explicit completed handoff** before a later controlled engine merge. Never graft guessed Codex code.
- **Owner approvals:** approved F01 cream marble concept and F01-A actual model; F01-B and F01-C generated + CI passed, not separately owner-approved; F01-D awaits owner review. No false visual or on-device PASS.

## Exactly what F01-D is
Four genuine and independently loadable `glTF 2.0` meshes, not conceptual PNG planes:
```
f01-marble-cream-edge-north.glb
f01-marble-cream-edge-south.glb
f01-marble-cream-edge-west.glb
f01-marble-cream-edge-east.glb
```
Each is a one-metre-long **exposed straight marble edge/nosing** that physically EXTENDS OUTWARD **0.060 m** beyond the original `F01-A` 1m x 1m tile. It is NOT a duplicate overlaid 1m tile. Metric slab thickness/height is **0.056 m** to align with F01-A's original edge below its 4mm chamfer, with an exterior 4mm bevel down to 0.052m. Geometry has **34 vertices / 14 triangles**, true cap wall faces, clean correct-winding normals, no degenerate triangles or overlapping area with the A tile.

**Local pivot / bounds:** grid anchor is the original F01-A tile bottom-left `(0,0,0)`, axis Y-up, 1 unit per metre, top face UV equals original world x,z measured in metres. North extends `z=-0.06..0`; south `z=1..1.06`; west `x=-0.06..0`; east `x=1..1.06`. Outward edge length = 1m. Materials have identical original F01-A shader `F01.cream-white.PBR-dry`, metallic 0, roughness .275, embedded exact same original seamless 384x384 marble PNG.

**Critical F01-E pending contract:** The four D directions **MUST NOT all be installed together at the same corner**; their outer 60mm extension overlaps in corner squares if two perpendicular trims are installed. D applies to STRAIGHT EXPOSED SPANS only. **F01-E** will resolve perpendicular intersections with an explicitly authored mitred/corner termination; never solve it by layering two overlapping D assets or inventing a corner overlap in-game. No pool/radial G01 placement yet (that belongs to future F01-F after surveying actual basin shape).

## Source, exact CI and hashes
- Builder: `tools/b1/build-s7-f01-edge.py` calls the unchanged `tools/b1/build-s7-f01-marble.py` standard-library writer.
- Tests: `tests/lw-d-s7-f01-d-edge-review.test.py`, six new substantial checks on original 3D geometry, per-triangle normals/indices/winding, precise bounds, zero overlap, genuine PBR image, seamless global top-face UV, manifest and no writes.
- Existing F01-A (5), F01-B (5), F01-C (5) regressions also re-run without changes.
- **[GitHub Actions run 44123783191](https://github.com/extreme4music-nexus/Trialum/actions/runs/44123783191)**, SHA `87af6cd226ec222cae6351e00e74eb5499d225ea`, result **SUCCESS**, **21/21 Python unittest PASS**.
- **[Real F01-D four GLB artifact #14347021157](https://github.com/extreme4music-nexus/Trialum/actions/runs/44123783191/artifacts/14347021157)**. ZIP contains four GLBs, one shared cream texture and `qa-manifest.json` with full SHA256 and original F01-A frozen SHA. This is a review-only Actions ZIP with 30 day retention; the builder is committed and fully reproducible.
- Verified extracted real GLB hashes and dimensions:
  - `north` size 63,360 B SHA256 `8c4bf1ea7be0f67f83b3ded5e9ab998152445f0b086c1e9c54a96a5571c47e64`.
  - `south` size 63,360 B SHA256 `65fde6167a7aac38095d47f5e199ab29d338ce64ccb7ac9ead0d12e86e4704ef`.
  - `west` size 63,356 B SHA256 `774564be16fb59b177a4ac66dd221bfaec40c5be301753a23127740cfc093a74`.
  - `east` size 63,356 B SHA256 `be475ce00838b7d2d8db712537efa1b75e6e80654e79ffbb887e1e3b3cca7237`.
- Original and unchanged F01-A full GLB SHA256 `787965608e2e4005a0ee84c857d7f0379a8093149b39da6bacb2d012feafc147`; shared PNG SHA256 `81c434a57b770148ced6e9c40dccabade929a844a27b143f2dc13a4da0ff8c98`.
- The separate owner-facing preview was generated from the **true four GLB top-face POSITION+UV records** and the exact shared original embedded texture, not a claim of in-game 3D or Android screenshot.

## Next one-at-a-time task
1. Owner visually inspects the above F01-D GLBs/preview; record PASS or revise exterior chamfer/shininess.
2. **Only then:** F01-E **corner join / geometric end-cap** that avoids 60mm D-trim intersections, retaining identical F01-A PBR and 1-m grid seam pattern. GLB builder → tests → isolated artifact → owner review.
3. After whole modular F01 family and separate owner approval, survey original G01 water basin dry perimeter, then small in-game test zone and signed QA APK. Never silently fill pool holes, hide water, alter 4 existing aquarium slots or 4 growing fingers.
4. Any later app-level integration must start from this branch/PR stack (or explicitly port its commits), preserving PR92 canonical warehouse and waiting for Codex's future secure Classic handoff. No source overwrites.
