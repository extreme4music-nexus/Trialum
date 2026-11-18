# Trialum S7 — owner render → genuine GLB fidelity contract
**Effective:** 2026-11-18. Owner cannot test on PC during work, so image reviews are the required approval gate for EACH grouped asset family.

## One group per review phase
1. Identify the exact family, model count, dimensions, materials, texture sources and reference-room placement. Include shared color/roughness/normal maps and unambiguous names.
2. Show a comprehensive **studio 3D design render** of EVERY requested form, with explicit material variants. A second close-up or bird's-eye material and shape board should clarify details (bevel, edge, underside, pivot). The render is **design only**, never called a GLB.
3. Owner gives explicit visual PASS or requests corrections. Until PASS, do not generate final physical models as though approved.
4. Build actual glTF2 **from the SAME geometry specification and texture/material source** used to plan the accepted render. Do not replace curves with flat cards, change the mineral pattern/colors, omit major forms, alter the dimensions, flatten relief, merge separately editable pieces, substitute an oversized slab for individually movable arc tiles, or silently skip corner/edge variants.
5. Render *the actual exported GLB* in a deterministic Three.js/Blender-compatible viewer at comparative camera position(s) and lighting where feasible. Provide side-by-side concept/physical-model visual comparisons, record any deviations clearly. Concept art may be image generated, so **pixel-for-pixel identity is not a valid guarantee**; geometry/proportions/textures/features should nevertheless match recognizably and faithfully.
6. Perform independent binary/geometry validations: glTF2 header, nonzero vertices/triangles, no out-of-bounds/degenerate geometry, watertightness where required, normals, UV coordinates, embedded source PBR textures, pivots, dimensions/units, individual movable pieces, material variant identity, model counts, per-file SHA256 and cross-repo byte equality.
7. Commit actual physical GLB binary files and exact generators/source textures into BOTH `Trialum` isolated development branch and `Trialum-3D-Builder` catalogue/project. Update files/manifest, verify GitHub Actions CI PASS. **Never** mark Owner DEVICE PASS from CI-only checks. No production Classic/Android/Play changes.
8. Owner approves the 3D renders; the assistant owns technical GLB verification and actual-model render comparisons while owner is away from computer. Clearly label anything not yet tested on a real device.

## Soil bridge state before first metal group
- **S01** — existing approved dug/loosened soil, historical `s03-dug-turnover-soil.glb` filename; Builder canonical asset `s01-dug-turnover`.
- **S02** — existing 5×5 holes and independent plugs, 25 VISUAL anchors per tile, never 25 new gameplay plant slots. Actual 4 beds × 5 plants and 4 aquatic positions unchanged.
- **S03** — truly untreated/compacted soil, not the same as dug S01. **Still needs its own render PASS and new GLB.** Do not claim S01/S02/S03 all physically complete merely because names are reconciled.
- Authoritative JSON: `docs/S7_SOIL_CANONICAL_STATES_20261118.json`.

## Next planned groups after soil review
Metal cover panels `M01` sage-cream, `M02` polished chrome and `M03` matte black. Render all forms together as a meaningful group, obtain owner PASS, then create matching GLBs. Subsequent groups: lighting, irrigation hardware, G-00L racks, G-00L workstation, excavators/transporters, humanoid robot, canonical plant species and growth stages. Preserve original greenhouse G01 water and all four real five-slot growing corridors.
