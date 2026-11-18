# Trialum S7.8-C — 8 lighting families · 24 genuine 3D GLB models
**Date:** 2026-11-18. **Scope: visual design assets ONLY.** No live scene lighting, ray tracing, game engine, Android, Classic, Play Store or new inventory actions.

## Owner visual direction and permitted work
Owner wants the complete S7 greenhouse lighting GROUP, not isolated trial lamp after trial lamp. The three earlier 3D design imagery sheets in the conversation and greenhouse REF-05 establish cream/sage/chrome frames, subtle cyan indicator lines, white practical lighting, one large + four small chandelier rings, waterproof floor edges, recess-mounted pucks, glazed floor panels, wall task/flood lights, thick rope pendants and small corridor ceiling lamps. Owner explicitly authorized building the full lighting GLB group. This is **not owner visual verification of the actual exported GLBs**; physical GLB review remains pending.

## Asset groups (24 real independent files)

| Family | Count | Models and intended use |
|---|---:|---|
| L-F1 | 4 | Straight 1m waterproof perimeter LED strip, half-length, 90° corner, actual-radius 1m local curved G01 poolside trim. |
| L-F2 | 3 | Small 150mm recessed floor puck, 230mm medium puck, warm 150mm alternative. |
| L-F3 | 3 | 1m square translucent covered LED floor tile, 0.5m variant, service-border variant. |
| L-W1 | 2 | G-00L workbench angled wall/task lamp, short/long neck. |
| L-W2 | 2 | Wide/compact wall flood/worklight. |
| L-C1 | 4 | Hero G01 chandelier assembled with EXACT 1 large + 4 smaller rings; standalone main ring, satellite ring and ceiling canopy. |
| L-C2 | 3 | Thick-rope hanging LED pendants in single, double and triple arrangements. |
| L-C3 | 3 | Compact corridor ceiling LED rings, small / medium / paired. |

**Twenty-four physical GLB binaries** built by source `tools/b1/build-s7-lights.py`, each with closed 3D solid submeshes, actual glTF2 geometry and glTF PBR metallic/roughness material including separate `emissiveFactor` LED sections and glass-looking diffusers (glass is PBR opaque tinted; transparency can be tuned after real-owner visual review). Real-source mesh colors and material names are inside the file; source + SHA256 verified in `assets/lighting/s7-lights-manifest.json`. None is only a JPG, billboard, primitive default cube or fictional catalogue record. Spatial units are meter/Y-up; floor models have bottom y≈0, wall/ceiling models have meaningful wall/ceiling attachment points. All lamps independently selectable in Builder.

Five editable Builder scenes:
- `trialum-s7-lights-all-24-glbs.json`
- `trialum-s7-lights-floor-f1-f3.json`
- `trialum-s7-lights-wall-w1-w2.json`
- `trialum-s7-lights-ceiling-c1-c3.json`
- `trialum-s7-lights-g01-five-rings.json`

**Critical caveat:** glTF material emission colors are **not actual dynamic light objects** that illuminate 3D spaces; shadow-casting dynamic lights, bloom, physically accurate specular reflections, time of day and day-night adaptive emission require a separate engine implementation and owner approval. Do not claim gameplay, phone FPS, or on-device quality PASS. WebGL2 by itself does not grant real hardware Vulkan ray tracing. Source and limits: official Three.js WebGPURenderer documentation and Vulkan ray tracing extensions. Plan separately in `docs/TRIALUM_3D_GRAPHICS_PROFILES_RAY_TRACING_DESIGN_20261118.md`.

## Renderer / integration handoff
- Preserve existing G01 genuine main + 3 satellite basins; **one main chandelier with four smaller rings is a suspended decorative unit**, not new aquatic plant slots.
- `L-F1` local curved strip is a short repeatable real-radius 1m segment. Align with actual G01 near r≈8.27m and never turn it into a giant outer wedge; mind water/railing and bridges.
- Keep clearances around G00L robot/desk/racks, all four fingers G02–G05, robot pathways, glazing and hose controls.
- All emitted colors use PBR; for mobile implement emissive-only default, not per-piece PointLight. In HIGH mode enable a **budgeted small** number of non-shadow point/spot lights plus baked/probe or clustered lighting and post-processing where supported. Dynamic high-end effects require perf telemetry.
- `LOW / BALANCED / HIGH` are a future independent renderer task, not in the GLBs. Do not fake ray-tracing status. Cap memory/temperature and fall back cleanly. Debug FPS overlay defaults disabled under Settings → Advanced → Developer.
- Do not mutate canonical engine/gameplay state in Builder; no Classic/main/Play updates. Source isolated development branch; owner concept direction approved, owner actual-GLB rendered review pending.

## Gates
1. GLB2 parser & actual geometry and PBR emissive QA: `python tests/s7-lights-verify.py`.
2. All 24 physically committed in Builder AND isolated game development branch; compare binary Git blob SHAs per filename across repos.
3. Builder catalogue entries exactly match physical file count; run browser-viewport and CI.
4. Compare actual-GLB renders to approved concept boards; fix geometry/material mismatches before calling owner physical visual PASS.
5. Only another specifically approved job integrates scene + validated simulation actions, dynamic light budget, save/restore, and signed Android testing.
