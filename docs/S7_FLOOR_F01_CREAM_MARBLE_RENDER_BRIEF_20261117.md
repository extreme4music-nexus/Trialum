# TRIALUM S7.8-B / F01 — CREAM-WHITE MARBLE · RENDER BRIEF
**Revision:** 1.0 / 17 November 2026
**Status:** RENDER SPECIFICATION — NOT YET RENDERED, NOT GLB-BUILT, NOT INSTALLED
**Owner reference:** REF-02 `trialum_s7_greenhouse_materials_board.png` and REF-01 `trialum_paw_shaped_greenhouse_overview.png`
**Canonical style authority:** [S7 Visual Bible](S7_GREENHOUSE_VISUAL_BIBLE_20261117.md)
**Canonical zoning:** [S7 Layout V3](S7_GREENHOUSE_OWNER_LAYOUT_CORRECTION_V3_20261117.md)
**Parent work package:** [S7.8-B modular floor kit](S7_GREENHOUSE_EXECUTION_ROADMAP_20261117.md)
**Asset family:** `S7-FLOOR-F01`

## 1. Only ONE material family in this milestone
Create a premium **warm ivory / cream-white polished marble** material and its genuinely modular square-floor geometry family. This is not F02 black marble, F03 grey-green stone, S01–S03 soil or M01–M03 metal. Those remain future tickets.

The cream must remain nearly white in indirect daylight, with fine *desaturated beige/cappuccino* mineral veins, restrained depth/variation, no golden-yellow tint, plastic shine, overdrawn black veins or mirror-flat glass reflections. Every render should show a recognizable **single matching material** across differently shaped modules. All F01 pieces should be instantiable on mobile, atlas/UV-compatible, consistent material IDs, without visible texture resets at edges. PBR is **dielectric** (metallic=0). Specular is from roughness and the greenhouse's actual illumination, not a painted-on fake reflection. Suggested roughness **0.20–0.32 dry**, **0.15–0.24 wet** pending visual review; physically sensible non-slippery pool-edge treatment should take priority over graphic gloss.

## 2. Proposed metric grid — SUBJECT TO OWNER VISUAL PASS
- Base `F01-A`: **1.0 m × 1.0 m × 0.06 m**, Y-up; tile top approximately at original G-01 finished-floor level, **without occluding real water openings**.
- `F01-B`: 1.0 × 0.5 × 0.06 m; `F01-C`: 0.5 × 0.5 × 0.06 m.
- `F01-D`: exposed-edge finishing trim; `F01-E`: exposed corner finishing trim, matching full tiles.
- `F01-F`: wedge/taper with precise curved geometry next to G-01 dry-ring walking perimeter, **never across an actual basin void**. Curvature must be set after surveying 4 G-01 actual GLB pool edge geometry; no guessed default radius.
- `F01-G`: narrow narrow border strip, optionally transition to the planned grey-green stone, no automatic LEDs.
- `F01-H`: lower-sheen cream-white service/workshop finish, still the *same* stone, for G-00L.
- `F01-I`: wet-adjacent mineral sheen test version, only on safe DRY paths near pools; no splash/water physics.
- Bevel edge proposal: **3–6 mm** only. Pivot/origin **bottom-left grid corner** for reliable snapping across A/B/C and wedges; record anchors and exact dimensions before GLB build. Flat collision proxy separate from finish geometry; simple physics. Do not increase canonical bed capacities.

## 3. THE FIVE REQUIRED FIRST RENDERS

### R01 — Isolated full tile / hero material
**Suggested file:** `f01-r01-hero-full-tile.png` — **16:9 landscape, ~1600×900 or better**.
One clean A tile floating slightly above a neutral grey studio pedestal, 3/4 orthographic-like view. Show finished TOP and TWO vertical EDGES, a ruler/dimension indication in a separately authored annotation (not painted into stone texture). The stone grain and natural vein flow should be legible. Neutral D65-ish key light, very soft shadows, no amber cast. Show subtle bevel but not a thick paving brick. NO machinery, plants, lake, hologram, typography or invented manufacturer marks.

### R02 — Grid/module seamlessness
**Suggested file:** `f01-r02-modular-grid-top.png` — **16:9 or square top-down**.
A modular dry-floor patch with repeated A full tiles, two B half tiles, four C quarter tiles, and perimeter D/E trim; G border at one boundary. Show exactly how UV grain flows, align square module edges and grout width. Include a close-up crop of a four-tile joint. Natural stone veins MUST vary without obvious mirror-repeat or checkerboard black seams; avoid pretending this is a single uninterrupted marble slab. Dimension/tiling test markers are in the document, not painted into the rendering.

### R03 — Curved G-01 basin walkway (water remains center)
**Suggested file:** `f01-r03-g01-curved-edge-in-situ.png` — **16:9 eye-level 3/4 environmental view**.
The REAL trialum greenhouse G-01 central glass dome and large animated turquoise basin dominate; F01-A plus F01-F radial wedge pieces follow a DRY perimeter path, but **do not block water**, bridge, rails or the three smaller basins. Use REF-01 to preserve dome proportions and ambient daylight. Existing actual water GLBs are not to be altered by stone concept imagery. The camera should show enough stone close up to judge reflections and amount of beige veining. No new species, machines, extra basins or fake aquarium plant capacity.

### R04 — G-00L left-of-entry service transition
**Suggested file:** `f01-r04-g00l-service-floor.png` — **16:9 interior architectural view looking LEFT immediately after greenhouse entrance**.
Show a sample cream F01-H lower-reflective service-floor area within the existing central pad, an unobstructed circulation aisle, spatial reservations for future RS seedling racks and larger/more numerous RM mature racks, and a proposed desk silhouette. These furnishings should be **ghosted outline references** or clearly absent until their separate assets are approved: DO NOT depict them as installed in current APK. The actual four growing glass fingers are elsewhere. No fifth wing, no conversion of smallest left finger into storage.

### R05 — Dry vs wet-adjacent finish comparator
**Suggested file:** `f01-r05-dry-service-wet-lighting-comparison.png` — **16:9 side-by-side 3D render**.
Three versions of SAME F01 stone under IDENTICAL camera/exposure: A standard polished, H workshop lower-sheen, I subtly damp/pool-edge variant. Neutral daylight; OPTIONAL second nighttime row solely to check subtle cyan/white reflections and preserve true color. User should identify each by lighting and surface response without a wildly different dye or texture pattern. No mirror-water gloss or slippery-looking sheen.

## 4. Real GLB production acceptance AFTER owner render approval
Nine expected F01 GLBs: `f01-marble-cream-{full,half,quarter,edge,corner,radial-wedge,border,service,wet}.glb`.

A GLB must contain **genuine real geometry**, not a screenshot plane or procedural fake solid texture; per-file PBR material with stable name, consistent Y-up metric scale, zero unnecessary animation, UVs/tile seams, bounds and predictable pivot. Geometry should pass original Android GLTFLoader + WebGL, no missing external texture sources, no ambient network fetching. Aim for minimal meshes and shared material objects/instanced repeated tiles. Use a basecolor/normal/roughness workflow only if renderer performance justifies it; don't overfit to one specific exposure.

**Do NOT** install all nine as a finished greenhouse floor at this stage. First render → owner visual PASS → nine GLBs → isolated F01 kit review → one or two very small sample placements in (i) a dry G-01 walkway and (ii) entry-left G-00L. Real Chromium screenshots, signed QA APK, then owner on-device PASS. Change `main` and Play ONLY on explicit later owner approval.

## 5. Technical QA and collision/occlusion checklist
- Exact 1 m tile alignment (proposal), face winding, normals, no zero-area triangles, physically consistent thickness.
- No z-fighting with original G-01 floor, G-01 cutouts or the below-grade four basins.
- No occlusion of turquoise basin/water animation or return portal/camera controls.
- No tile crosses G-01 water pool boundaries or planned original bed sockets.
- Normal map/roughness and grout continuity across a tile grid; LOD/performance on Samsung Galaxy A55.
- F01 floor change never creates new `bed-*`, `aquarium` slots, resource charges, game/simulation writes or async work.
- Side-by-side owner review of render vs **actual REF-02**, with REF-01 composition for environmental views.
- Renders must show material distinction from later F02/F03; no generic photorealistic stock tile substitute.
- Document exact Git SHA, image file hashes, generated GLB asset hashes, real-screen image evidence and signed QA artifact.

## 6. Gate / handoff states
Current: **BRIEF_COMMITTED**. No claim of `RENDERED`, `GLB_BUILT`, `IN_GAME`, `CI_PASS` or `OWNER_PASS`.
Next requested user-facing deliverable: **R01 hero render** (then R02 grid, R03 G01, R04 G00L, R05 finishes). Each visual must be anchored to REF-02 original. Before GLB authoring, owner visually approves this material character and palette.

**Source of truth:** `docs/S7_FLOOR_F01_CREAM_MARBLE_RENDER_BRIEF_20261117.md`. Never substitute another old empty-G01 APK for proof of F01; a new APK must demonstrably contain F01 GLB(s) and a true in-game screenshot.
