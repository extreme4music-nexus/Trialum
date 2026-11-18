# Trialum F03 · ДВЕ КАМЕНИ ПОВРШИНИ · 54 REAL GLB — handoff 18.11.2026

## OWNER STATUS
**OWNER APPROVED ALL FOUR F03 3D RENDER REVIEW BOARDS** (smooth F03-S foundation/specialities and subtly textured F03-T foundation/specialities). On 18 Nov the owner explicitly requested genuine GLB delivery. **54 REAL GLB 2.0 meshes GENERATED, QA PASSED, PHYSICALLY COMMITTED IN BOTH REPOSITORIES.** Owner's final *physical-model visual review in Builder remains PENDING*. Do not invent owner model PASS from CI. No F03 installed in the playable game.

## Exact scope
- Smooth grey-green natural stone **F03-S — 27 independently selectable GLB shapes**. Soft natural honed stone roughness .61, gentle mineral color variation, fine 3D bevel.
- Subtly irregular grey-green natural stone **F03-T — 27 independently selectable GLB shapes**. Same stone family, lightly textured original reference, fine PBR normal grain, .79 roughness and exceptionally shallow geometric grain on planar forms (~0.16 mm max). No coarse rock, gravel, deep grooves or pits.
- Shape codes **A=1 full, B=2 halves, C=4 quarters, D=4 straight small edges, E=4 small corner caps, F=1 real 7.5° G01 pool tile, G=3 curved raised pool trims (1m/half/3m showroom), L=4 large L-corners, R=4 raised straight showroom trims** = 27 per finish, total 54.
- Original metric tile **1 × 1 × .06 m** with 4 mm bevel. F/G follow **actual G01** pool bands r7.2–8.2 and r8.2–8.39, one individually movable curved segment at a time; the 3m showroom curve is not 3 individual tiles.
- **No certified physical slip resistance** implied. Model is for digital visual representation only.
- Shared source references supplied by owner:
  - Smooth original SHA256: `b50a1542ed4ef986424a025bf4237955b1b5d78ead42084ca8a0c3c06209fa17`
  - Subtly textured original SHA256: `7d069b68df567197ba7f9e950982a4a39a811ee822f264a77d0e7a73e3eaa1b6`
  - Normalized perspective-corrected RGB source SHA256: S `261258381683fef534eb8d97955691b6aae9f1ded9749f20727a4d7e61bef3a9`, T `8f6149eba5289b68d844fd49aedbc45888de49db905ec797870bb1f0e0f0ec8c`
  - Embedded GLB color atlas SHA256: S `34dbd7b3148b1ee50283a897cff08475a96f8a26f0d2ece4e604f594afff842c`, T `0f8ccd760eb88529f214c8209b3d12ff3aeeb1f4daa80da1fffadebb95ac91c4`
  - Embedded micro-normal atlas SHA256: S `23e5b11d15d96a23a33728b3eb190f9ff070db9076c52ddedf6289053c1eb557`, T `919e5e6e845d06c22359a81a373d9c3b4ec646e402d9ffba610265dcd8f1ef05`

## What is physically in GitHub (not just a catalog placeholder)
- **Game source development repository**: `extreme4music-nexus/Trialum`, branch `feature/lw-d-s7-f03-gray-green-stone-render-review-20261118`, `assets/models/f03-[st]-stone-*.glb` plus `assets/materials/f03-*`.
- **Standalone visual Builder**: `extreme4music-nexus/Trialum-3D-Builder`, branch `main`, SAME 54 exact binary files in `assets/models/`.
- Both repos hold `tools/b1/build-s7-f03-stone.py` plus *two exact 160×160 original-image-derived RGB zlib/base64 source atlases* under `assets/materials/f03-[st]-approved-render-atlas-rgb160.zlib.b64`. The generator is offline/pure-Python and repeatable.
- Full individual GLB per-file SHA256, size, mesh vertex/triangle count, physical bounds and embedded atlas hashes: **`assets/materials/f03-glb-sha-manifest.json`**. **All 54 Git blobs compared byte-for-byte across repos: IDENTICAL.**
- Total 54 F03 binary bytes: 21,778,516 across both families (not a data plan estimate). Builder complete library: **130 real GLBs** = existing 76 + newly delivered 54.
- Independent local geometry QA performed on all 54 with trimesh: **54/54 watertight, coherent triangle winding, Euler characteristic 2** after safe merge of shared surface vertices for inspection. CI checks glTF2 header/chunks, embedded texture and SHA integrity, 27 S/27 T distribution, owner-safety flags.
- [GitHub Actions Builder F03 binary delivery — SUCCESS](https://github.com/extreme4music-nexus/Trialum-3D-Builder/actions/runs/44268368584)
- [GitHub Actions Trialum F03 source branch — SUCCESS](https://github.com/extreme4music-nexus/Trialum/actions/runs/44268420558)
- [GitHub Actions Builder full 130-model integration — SUCCESS](https://github.com/extreme4music-nexus/Trialum-3D-Builder/actions/runs/44268950591)

## Six editable Builder scenes — via "Избери 3D просторија…"
1. `projects/trialum-f03-all-54-stone-gallery.json` — all 54 models.
2. `projects/trialum-f03-s-stone-gallery.json` — all 27 smooth stone shapes.
3. `projects/trialum-f03-t-stone-gallery.json` — all 27 subtly textured shapes.
4. `projects/trialum-f03-smooth-vs-textured-compare.json` — directly compare five matched S/T shape pairs.
5. `projects/trialum-f03-s-g01-pool-preview.json` — 7 independent smooth pool tiles + 7 curved trims beside original REAL G01 water/rail/bridge.
6. `projects/trialum-f03-t-g01-pool-preview.json` — 7 independent textured pool tiles + 7 curved trims beside original REAL G01 water/rail/bridge.

Every scene has `gameplayWrites=0`, `officialScene=false`, `ownerGlbModelPass=false`. Camera presets set the original scene and G01 quadrant accurately. No game state modification.

## Owner review + resume after session limits
1. GitHub Desktop `Trialum-3D-Builder` **main → Fetch/Pull**; close old Builder localhost terminal and start `START-BUILDER-WINDOWS.bat`; open `http://127.0.0.1:8765/` and hard refresh Edge.
2. Dropdown → **F03 · сите 54**, **F03-S · 27 мазни**, **F03-T · 27 суптилно рапави**, **F03 · споредба**, or **F03-S/T покрај G01**. Inspect correct hue, top/side consistency, shape intersections, UV seams, soft grazing highlights, selection/drag, rendering and local save. In especially T finish, texture must be only slightly uneven, not physically jagged.
3. Report model-specific corrections (finish + form ID); do not mass-replace existing F01/F02 library.
4. Only after owner approves actual GLBs, record `OWNER_GLB_MODEL_PASS` in manifest/docs. **Do not auto-merge source dev PR into game production, Android, Play, trialum databases or inventories**. Separate explicit authorization required for engine integration.
5. Any ZIP delivered in conversation is a backup; both GitHub repos already have actual binary models and source assets.
6. If GitHub lock errors recur, use `CONNECT-GITHUB-WINDOWS.bat` from cloned repo, don't delete `.git` or run concurrent Desktop and Builder Git operations.

## Provenance / known difference from rendering
The photo-based studio concept renders are artistic views. The GLBs use **perspective-corrected source-derived 160×160 RGB atlases** upsampled into embedded 384×384 PNG for reproducible offline rendering (rather than falsely claiming pixel-for-pixel identity to artistic light/shadows). In-device visual validation is still required.
