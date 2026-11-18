# S7 F01-G: Cream marble raised curved pool trim — REAL GLB delivery (2026-11-18)

## Owner's visual reference and requirement
Owner approved the F01-G concept rendering of **a long, slender, smoothly curved cream/ivory marble raised trim**, with fine warm beige veining, subtly chamfered/polished reflective top, and **small repeatable marble edging segments alongside F01-F tiles at the existing G01 pool**. The render is artistic reference, not an exact CAD mesh or measured photograph. Never reproduce a giant new floor tile in place of these small curbs.

## EXACT source and physical geometry
- Source generator: `tools/b1/build-s7-f01-g-pool-trim.py` — original real glTF2 binary models with embedded original F01-A warm ivory mineral marble PNG. The marble texture bytes equal SHA256 `81c434a57b770148ced6e9c40dccabade929a844a27b143f2dc13a4da0ff8c98`; frozen 1m F01-A unchanged.
- Current G01 preview original floor inner/outer radii: 7.2–9.15 m. The existing corrected F01-F owner-review modules occupy 7.2–8.2 m. F01-G adds an outer **raised curved trim at 8.2–8.39 m**, not a second huge floor plate and not inside the pool/rail.
- Width 0.19 m; height 0.135 m; 8 mm real bevel; premium PBR nonmetallic roughness 0.225, original cream-beige mineral veining; true curved triangles, UV and sidewall geometry.
- `f01-g-cream-marble-pool-trim-1m.glb`: 1 sector of 48 (7.5°), about 1.0858 m at mean radius, 6 mm grout gap between pieces.
- `f01-g-cream-marble-pool-trim-half.glb`: half sector (3.75°), about 0.5429 m.
- `f01-g-cream-marble-pool-trim-3m-showcase.glb`: uninterrupted three-sector 22.5° about 3.2574 m, solely for the **left rendering's continuous long curved piece**, not as a single replacement for individually movable poolside modules.
- Axis Y-up, all three local pivots on r=8.2 start edge. The 7-piece poolside preview repeats the 1m asset at theta indices 3..9, translates to r8.2 along G01 and rotates about Y by -theta.
- No signed APK, gameplay logic changes, added aquatic slots, invented plants or alterations to authoritative published G01. These are design-only assets.

## Physically mirrored GitHub delivery (not only generator)
File | Git blob SHA (byte-for-byte matches game feature branch and Builder main) | SHA256
---|---|---
`f01-g-cream-marble-pool-trim-1m.glb` | `4903e1def03cac016882a6908197e71697fa6388` | `1c6e46751739de51a10557eae460e97885dce01dc61471d1b6ff3c932a6fe14b`
`f01-g-cream-marble-pool-trim-half.glb` | `dfb0704cfbb8567bccf369bc8afcfa2d498215d4` | `40210ad22cef0242ed4d4a0427b800e7af6df4285ae1d624e555d2e5260fa7af`
`f01-g-cream-marble-pool-trim-3m-showcase.glb` | `5fb0b22d5694c9ea6cbd44e07170dd33fa7af34d` | `298effd5a3dd60b3425015a4aa37429c0b4d94ad0037baf29adf1ac84639b802`

Owner can directly download the three GLB files from the Builder Git repo after Fetch/Pull. The ChatGPT-exported individual GLBs are a separate local build of **the same geometry/texture** (but with alternate metadata/byte hashes); the SHA table above refers to the actual GitHub CI deliverables.

## Builder TEST before any next F01-H
- `projects/trialum-f01-g-curved-trim-showcase.json`: opens long continuous 3.26m GLB beside modular 1m and half trim in a studio layout.
- `projects/trialum-f01-g-pool-curb-g01-preview.json`: real G01 original basin, satellite basins, existing railing/walkway, bridge and animated water, seven owner-review F01-F floor tiles, plus **seven separate F01-G raised marble edging pieces**.
- Owner tests shape/curve, proportions, embedded texture/vein continuity, bevel highlights, grout gaps, selection/drag and perspective from interior. Pixel-perfect identity of studio image cannot be guaranteed without physically matching its camera/lighting.
- Validate bridge access and real path clearance BEFORE installing into live G01 game; owner approval alone does not grant physics integration.
- Owner's actual model visual PASS not yet received. DO NOT silently merge this feature branch into Classic, LW-D active deployment or Google Play.

CI: [Game three GLB QA](https://github.com/extreme4music-nexus/Trialum/actions/runs/44214935599) PASS. [Builder 45 GLBs](https://github.com/extreme4music-nexus/Trialum-3D-Builder/actions/runs/44215016691) PASS.

## Downstream plan
After owner visually accepts actual F01-G: freeze rendering and physics-independent trim asset IDs, then return to F01-H render → approval → GLB → Builder test. Do not mass-generate pending parts.
