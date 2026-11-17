# TRIALUM · S7 Greenhouse · Approved Concept Art Bible · 2026-11-17
**Status: OWNER-LIKED VISUAL DIRECTION.** User said **„Сликите ми се допаднаа“** and asked to preserve these five specific images **BEFORE** starting new work. Exact compositions, metallic palette, material forms, greenhouse light and placement are the design reference. Do not generate a different-looking machine/plant/desk and quietly substitute it.

## Visual order of authority

1. User's **textual** design contract in `S7_GREENHOUSE_MASTER_REQUIREMENTS_20261117.md`.
2. Five owner-liked references **REF-01 ... REF-05**, with filename hashes below. These are concept images, not real GLBs or working UI.
3. Frozen Blueprint v2 spatial topology and the current G01 real in-game shell/water work, as long as it does not contradict the newest owner's visual corrections.
4. New render from a specific phase AFTER the user approves it.

When images depict unapproved species or water effects, **do not mint them into gameplay**. For example, water lilies and tomato crops in the illustrative plant board are art direction and require engine species additions before becoming real plant IDs. When renders show sprinkler mist, owner later specifies drip-by-drip for actual cultivation beds, so drip controls take precedence.

## Five canonical reference image records

| Code | Exact original PNG filename | Original resolution | Original bytes | SHA256 (original pixels/file bytes) |
|---|---|---|---:|---|
| REF-01 | `trialum_paw_shaped_greenhouse_overview.png` | 1672×941 | 3,622,436 | `aa67b2e710b125581609646478101d91f9a6944cb016774943cf7b5a385eb10a` |
| REF-02 | `trialum_s7_greenhouse_materials_board.png` | 1448×1086 | 2,868,224 | `3df5cf2a231fe758aca8276d2e356a1a56be239a1d44eccdae7e7b9a239a7473` |
| REF-03 | `trialum_s7_agro_greenhouse_concept_board.png` | 1448×1086 | 2,737,290 | `b4fde654c40901b280bb2ccc31cbbe6990dd8ae890e709bfc7e137a2b6c4cfc4` |
| REF-04 | `trialum_s7_flora_concept_board.png` | 1448×1086 | 2,807,700 | `d03c50163fcb092dc5c5a6653f28fa813d3328c37e5ec75d16f84c2a13345471` |
| REF-05 | `trialum_s7_greenhouse_systems_concept_board.png` | 1448×1086 | 2,824,219 | `0647d6cdad81337f23bb309f20644111883f96fc73d33bf3323dc59ba9bed173` |

**Repository art directory:** `docs/visuals/s7-greenhouse/`. The image copies are review references. The exact master file hashes above **must not be altered silently**, even if a smaller JPEG preview is used for GitHub browsing. To verify high-resolution original copies, SHA256 must match. Keep original rendering compositions and approve any crop/LOD choices separately.

### REF-01 — MASTER THEATRE / spatial design
The glass pawshell greenhouse with **FOUR distinct planting fingers (G-02/G-03/G-04/G-05, one bed each)**; the smallest far-left finger is **now cultivation**, not the nursery. The **entry-left service area G-00L** — LEFT immediately upon entering the main greenhouse, outside the fingers — hosts seedling racks, larger/more numerous mature-plant racks and the holographic workstation. The spectacular G01 circular water centerpiece remains unchanged. Ref art retains its material mood even where the former zone usage differed. White/cream marble perimeter floor, controlled polished chrome/cyan lines, sunlit living gardens, broad curved glazing, water reflections and readable paths. **G01 water must remain visually dominant**, not a mere decorative puddle. Entry from existing main Agro Atrium.

### REF-02 — MATERIAL / tiled floor design
Exactly nine modular material looks in three groups: **cream-white glossy marble, black polished marble, grey-green stone**; **loose dug soil, regular transplant-hole soil, rough unprepared soil**; **sage-cream metal, mirror chrome, matte black metal**. Reflective qualities and large-scale color contrast are key. Reference blocks are concepts; their bevel, thickness, UV seams and meter dimensions need authored GLBs. Keep physically sensible traction by pools.

### REF-03 — MACHINES, LOGISTICS, WORKER, G-00L ENTRY-LEFT HOLOGRAM DESK
Compact white/cream greenhouse excavators with turquoise indicator lighting (digging and soil preparation); three motorized transporters: robotic gripper planter/extractor, flat crate transporter, heavy parts carrier.
**Owner's newest storage requirement:** depict two visibly distinct shelf families in the **G-00L LEFT-OF-ENTRANCE service area**: (RS) smaller racks for freshly created seedlings, and (RM) **physically larger and more numerous racks for mature plant holding**. Include their loading trays/pot carriers and safe humanoid pathways. Do not place the desk/racks in any finger; no fifth finger. Friendly-but-professional white/grey **humanoid repair worker**, narrow enough for G02 and able to crouch/repair. Sleek central G02 desk with cyan-green hologram, physically distinct PC tower, keyboard and mouse; display only real garden information. Mechanical assets must be riggable for autonomous simulation-driven movement.

### REF-04 — FLORA STAGES
Multi-stage array from small shoots through healthy mature plants; plenty of leaf and flower detail, plants rooted in place; water family views with roots/submerged stems/floating leaf look. Reference botanical archetypes include tomatoes, herbs, flowers, lilies and reeds — **illustrations only**; the current actual Trialum species IDs are `lumemoss`, `glowfern`, `mineralreed`, `aquaglow`. No visual copies of actual outside branded botanic assets needed. On machine proximity, gentle leaf/stem movement rather than unrealistic full-plant teleporting.

### REF-05 — IRRIGATION + ALL EIGHT LIGHT FAMILIES
Aquatic/bed water pumping, filtering, hose/drip irrigation controllers with compact illuminated UI. Three floor light looks: perimeter LED ribbon, circular flush puck, glazed square tile. Two angled wall lights: small desk/task, large wall. Three ceiling looks: one giant ring with **four smaller rings**, thick-rope hanging LED lamps, corridor compact circular LEDs. Material color is cream-chrome-green/cyan, warm-white for practical illumination, cyan accents for status. The pictured sprayer mist is not a replacement for owner's requested drip-by-drip system.

## Canonical V3 owner spatial override — 17 November 2026
**Owner's latest explicit instruction takes precedence over all static reference layouts**: G-02 (smallest left finger) = bed-1; G-03 = bed-2; G-04 = bed-3; G-05 = bed-4. Service / nursery / mature racks / holographic management = **G-00L immediately LEFT of greenhouse entrance**, not any finger. The mature rack family is **BIGGER and MORE numerous** than seedling rack family. No extra plant slot is generated by storage furniture. Read [Owner Layout V3](S7_GREENHOUSE_OWNER_LAYOUT_CORRECTION_V3_20261117.md) before placing any GLB.

## Art verification test for each future render
A review pass must answer all: (a) Which exact REF-xx image influenced it? (b) Are the main massing, metal color and texture visually compatible? (c) Is the image consistent with original G-01 circular water heart and G02/G03/04/05 placement? (d) Are displayed plants actually canonical or clearly labeled decorative concept? (e) Does the GLB asset preserve the silhouette and proportions of the selected render? (f) Is there one signed in-game screenshot proving those assets appear, not just an isolated GLB viewer?

## Constraints to avoid false expectations
These five pictures are **static generated concept art**, not automatically segmented PBR textures, authored GLB geometry, skeletal rigs, working industrial autonomy or engine code. Each item requires separate engineering and owner sign-off. Do not claim long-term simulation/time-zone handling or new garden resource cost simulation already exists merely from a diagram.

## Repository embedding
After binary artwork is committed, keep these references stable and embed here:
- REF-01: `./visuals/s7-greenhouse/REF-01-overview.jpg`
- REF-02: `./visuals/s7-greenhouse/REF-02-modular-surfaces.jpg`
- REF-03: `./visuals/s7-greenhouse/REF-03-machines-and-hologram.jpg`
- REF-04: `./visuals/s7-greenhouse/REF-04-flora-stages.jpg`
- REF-05: `./visuals/s7-greenhouse/REF-05-irrigation-and-lighting.jpg`

If a GitHub JPEG copy is reduced quality, label it **PREVIEW** and keep the verified PNG original SHA recorded separately. No third-party replacements.
