# Trialum S7 — M01–M03 METAL FLOOR KIT — GLB handoff

**18 Nov 2026 • Owner design-render PASS • 60 physical GLBs generated • Production game unchanged.**

## Scope
Three owner-approved metallic looks: **M01 creamy sage painted metal, M02 polished chrome-like steel, M03 matte dark black**. All three use 1 × 1 m units, Y-up, local lower-left base pivot, true chamfered frames, top panel X-seams, bolted metal detail, narrow cyan status material, and separately selectable real geometry.

15 core modular shapes per finish: full square, two differently oriented halves, four quarters, north/south/east/west straight rim modules, NW/NE/SW/SE corner caps.
Five OPTIONAL full-unit service modules per finish: vent grille, service hatch, conduit/channel, luminous translucent grid tile, drain grating.
**TOTAL: 3 × (15 + 5) = 60 genuine GLBs = 45 core + 15 additional service tiles.**

Service variants are design-only placeholders. Emissive cyan is a PBR visual effect; neither the actual greenhouse lighting nor ventilation, drainage, pumping or electricity/gameplay commands are implemented. Chrome reflection depends on the lighting/environment map in the 3D viewer. The 3D GLBs follow forms, proportions, color palette and material intent of approved concept boards, but concept art and physical GLB preview cannot be pixel-identical. Owner inspection of actual imported models remains pending.

## Files and source
- `tools/b1/build-s7-m01-m03-metal.py`: deterministic physical geometry and PBR source generator (Python: numpy, Pillow, trimesh).
- `assets/models/{m01,m02,m03}-metal-*.glb`: 60 real glTF2 binaries with embedded textures and many individually watertight component meshes.
- `assets/materials/{m01,m02,m03}-brushed-metal-source.png`: source metal microtexture color maps.
- `assets/materials/{m01,m02,m03}-micro-normal.png`: per-finish tiny grain normal maps.
- `assets/materials/m01-m03-metal-60-manifest.json`: 60 SHA256 digests and source texture digests, sizes, geometry counts, dimensions.
- `assets/m01-m03-catalog-additions.json`: 60 distinct Builder catalogue entries.
- `tools/b1/make-m01-m03-builder-scenes.py`: creates 5 editable Builder review scenes.
- `tests/verify-s7-m01-m03.py`: tests every binary/GLB header/SHA, watertightness, triangles, dimensions, material metadata, unchanged game authority.
- `projects/trialum-s7-metal-*.json`: 5 editable projects, all 60 and finish-specific and compare.

## QA, governance, and next phase
No source assets or binary files from F01/F02/F03/S01/S02/S03 must change. Before declaring GitHub delivery successful, verify both repositories physically have all 60 model files and their SHA256 matches and Builders count grows from **150 to 210 genuine GLBs**. Keep gameplay/Android/Classic/Play untouched. Put game assets exclusively in a new isolated S7 feature branch and a draft PR. User cannot test on device during work: owner is responsible for design image PASS, assistant responsible for technical GLB QA; new final owner device GLB PASS must be specifically requested later.

## Builder usage
Pull `Trialum-3D-Builder` main and restart local server, select **M01/M02/M03 — all 60** or one of the three **20 GLB** galleries, or the **service finish compare** scene. Real objects are separately selectable and movable.
