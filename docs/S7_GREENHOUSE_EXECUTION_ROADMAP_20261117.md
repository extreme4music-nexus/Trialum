# TRIALUM · S7 3D GREENHOUSE · EXECUTION ROADMAP / OWNER PASS GATES
**Status:** PLAN ONLY; do not run model creation, engine migration or public release as a side effect of these docs.
**Visual source:** exactly five approved concept boards listed in `S7_GREENHOUSE_VISUAL_BIBLE_20261117.md` — do not replace them without owner agreement.
**Previous implementation:** [Draft PR #88](https://github.com/extreme4music-nexus/Trialum/pull/88), [signed in-game G01 CI #288](https://github.com/extreme4music-nexus/Trialum/actions/runs/43971723284); this plan branch is stacked on its exact approved code SHA but is NOT merged into `main`.

## 0. Ground rules for EVERY future task

**Required sequence**: owner concept/reference → architecture and coordinates → isolated render(s) → owner VISUAL PASS → real GLB(s) and PBR materials → rig/morph clips if animated → in-game ONE-zone placement → read-only original-engine parity → any new validated engine commands/automation under separate owner authorization → original offline Android build/visual Chromium screenshot → owner's Galaxy A55 PASS → close task/handoff → NEXT task. Do NOT skip ahead or conflate concept with executable GLB.

**Mandatory deliverables for each asset ticket:**
- `REF-ID` reference board crop or annotated overlay; exact zone and target coordinates.
- `asset_id`, semantic part names, dimensions in meters, Y-up origin, pivots, material slot IDs, anchors, LODs, GLB size/mesh counts, PBR/UV, collision shape and interactive hotspots.
- `render-front.png`, `render-top.png`, `render-in-scene.png` with same palette and proportions as approved concept boards.
- `asset.glb` with valid glTF2 meshes; animations embedded in GLB and independently validated with exact clip names. Separate unit tests for bone/morph animation and for parcelled variants.
- Scene registry entry, deterministic load/unload, resource cleanup; canonical authoritative events and statuses.
- Screenshot from **actual Chromium/WebGL runtime** and exact SHA of signed SignQA APK; original owner device verdict and updated documentation.

### Frozen physical zone naming
`G-00` existing Agro Atrium entrance throat. `G-01` water-centered circular hub, radius ~17 m, **existing** pool mesh architecture. `G-02` smallest LEFT finger, seedling nursery+completed-plant receiving+repairs and desk. `G-03/04/05` terrestrial species-growing corridors. Existing bed placements: `bed-1` G03; `bed-2` & `bed-3` G04; `bed-4` G05. In original engine, 5 slots per terrestrial bed, ONE aquarium with 4 slots. No new slot authority from decorative props.

## 1. Ordered work packages (one closed before next)

### S7.8-A — APPROVED ART BIBLE AND MASTER CONTRACT [this PR]
- Store five approved images with manifest, SHA and explicit hierarchy; capture every owner requirement, source code parity, full roadmap, asset ID namespace.
- Gate: owner confirms art bible/plan, **no APK required**. This package never rewrites G01 or original engine.
- Images: REF-01 overall greenhouse, REF-02 surfaces/soil, REF-03 machines/transport/G02 desk, REF-04 flora families and growth, REF-05 irrigation/lighting.

### S7.8-B — MODULAR FLOOR KIT (FIRST ACTUAL ASSET PHASE)
- Design a common square tile grid proposal: 1.0 × 1.0 m for floor/metal caps; half/quarter variants plus curves/radial wedges by basins, and 1.0 × 1.0 m square modular soil block with configurable subgrid. These dimensions are **proposed for owner acceptance**, not assumed canonical meters.
- **Tiles F01/F02/F03:** cream-white marble, black marble, grey-green stone. PBR/roughness/normal maps and dry/wet variants; avoid overly mirror-like low-friction visuals near pools.
- **Soil S01/S02/S03:** newly loosened, prepared with seedling holes, rough/untreated. Fit square grid with real hole mesh and root sockets. Every unit tile can be repeated without visible obvious seams; no gameplay planting merely from tile texture.
- **Metal M01/M02/M03:** cream-sage metallic, chrome, matte black; flat, edge, corner and access hatch pieces.
- Place first on a **small designated G-01 dry perimeter test strip**, then G-02 and finally growing fingers; preserve main/3 satellite cutouts, existing portal/camera/collision and G01 water. Match REF-02. Gate: approved floor palette and real in-game screenshot + owner phone PASS.
- **No new pump logic/robot movements** in this phase.

### S7.8-C — ALL LIGHTING PHYSICAL FIXTURES (8)
- One at a time: L-F1 floor perimeter LED strips, L-F2 small circular flush light, L-F3 large glass-top square LED floor tile; L-W1 small G02 desk angled light, L-W2 broad wall floodlight; L-C1 G01 main 1+4 ring chandelier, L-C2 thick-rope hanging lamps, L-C3 compact corridor ceiling ring lights.
- Phase C1: **mesh/renders only**, visual/GLB PASS. Phase C2: controlled emissive intensity + budgeted real sources, context night/afternoon/dawn, no frame leaks. Phase C3: only then time-zone/sunset integration after clock-contract tests.
- Wall/ceiling placements must not collide with glazing, robot paths, controls or G01 water. REF-05. Gate: night and day screenshots, low-end Android FPS/heat, owner PASS.

### S7.8-D — DRIP IRRIGATION HARDWARE (per-bed)
- I01 source/water reservoir; I02 pump/filter assemblies; I03 main trunk hoses; I04 splitters/valves/couplings; I05 drip tubing and dripper emitters (true drip, NOT sprinklers); I06 pressure/flow/leak sensors and pipe repair kit.
- Install visible real hardware, then route each bed separately (G03 bed-1, G04 beds-2/3, G05 bed-4); ensure water pool/soil/robot collisions. No new actions yet.
- Per-bed compact control panel C-IRR01 with flow stop, pump stop, zone status, leak alert, hose repair/replace, additive request, power indicator. Start as **read-only and disabled** until action contracts pass.
- Engine contract separate and explicit: one deterministic water ledger (source, pressure, transfer, cost), failure/repair states, idempotent commands, stock validation, original plant hydration. When owner authorizes, implement and test automatic schedule + manual overrides per bed, not a second engine.
- Visual target REF-05. Gate: all 4 panels genuinely display different real bed states, no fake actions, owner PASS.

### S7.8-E — G-02 NURSERY, CONTROL WORKSTATION AND HOLOGRAM
- First build the small branch's modular floor, racks, nursery delivery/receiving positions, mature-plant holding, and one service station. Source: real `s.agro.seedlings` and `s.agro.gardenPlants`; never spawn duplicates.
- W01 desk, W02 hologram screen, W03 computer case, W04 keyboard, W05 mouse, W06 service display mounts; physically place in agreed G02 operator corner, keep clear path for robot & crates.
- One in-world tap uses **existing original HUD scene** to open greenhouse-specific **central holographic controller**. Show exact original numbers, plant health/stage, aquarium cleaning request, watering/ad­ditives, pumps, broken hoses, filters, maintenance tickets, transport queue, energy/time clock. Actions proposed only when engine recognizes and authorizes them.
- Audit controls: action state (disabled/ready/pending/success/fail), rollback/retry semantics, no duplicate submit after app reopen, no offline mutating hidden UI.
- Gate: operator can enter G02, access live greenhouse HUD, close/back to scene with state intact; owner PASS. REF-03.

### S7.8-F — MOVABLE MACHINES (2 excavators, 3 transporters, 1 humanoid)
- **E01** trench excavator; **E02** soil-turning/bed-preparation variant (specialized attachment or machine after review).
- **T01** planter/extractor robotic-arm carrier; **T02** plant/seedling crate flat transporter; **T03** heavy mechanical parts transporter.
- **R01** G02 humanoid gardener/maintenance robot. Each requires 3D GLB with joint pivots and meaningful animation clips. Suggested clips: `idle`, `drive`/`walk`, `turn`, `brake`, `approach`, `pickup`, `place`, `plant`, `extract`, `dig`, `inspect`, `repair`, `carry`, `shutdown`; choose applicable per asset.
- Build **rig first**, independent isolated animation PASS, then pathfinding/obstacle/collision in greenhouse shell, then sanitized job projection from original engine. Only after owner accepts exact motion, add state-machine scheduler in B7. Machines do **not** create/kill plants because an animation played.
- G02 repair robot tasks governed by one work-ticket queue; no autonomous background CPU/GPU motion when app not open. REF-03. Gate: owner visually checks mobile movement, no clipping and no fake actions.

### S7.8-G — COMPLETE ORIGINAL 3D FLORA CATALOG
- **Species IDs from actual current engine:** `lumemoss`, `glowfern`, `mineralreed` (land), `aquaglow` (water). Do not treat concept tomato/lotus/echinacea photos as automatically unlocked species.
- For each species build real 3D models: `seedling` → `young` → `growing` → `mature` → `ready-for-transplant`, plus `weakened/dead` visual states; staged clips: `idle-sway`, `machine-pass`, `water-react`, `root-settle`, `growth-crossfade`, `droop`.
- Preserve the canonical G01 `aquaglow` GLB work already done; adapt to stage `ready-for-transplant` with same plant ID, not a fifth actual growth mechanic. Flora illustrations in REF-04 include multiple **illustrative** plant families beyond canonical scope; backlog optional species as owner decision, do not implement silently.
- Each species has original ID, canonical habitat/bed, health/growth; 3D animation controlled by renderer only and canonical state. LoD/wind near machines graceful. Gate: scripted offline growth, health/death, transplant, save/restore parity for each species, zero cloned plantId.

### S7.8-H — ENGINE SYSTEMS & WHOLE-GAME OFFLINE AUTONOMY (after visual gates)
- Approved new engine actions: aquarium cleaning/filter, per-bed irrigation/drip, pump stop/restart, leak detection/hose replacement, soil preparation, additive dosing, maintenance service, verified machine transport/planting, dynamic light policy, consistent offline catch-up. Each action has source validation, cost, target, one-time receipt, pause/resume and receipt history; user manual controls and autonomous controller share the same queue.
- Central solar/light controller reads current time & time zone on activation, optional coarse geolocation consent/setting. Fallback if unavailable, avoid precise-location collection or default server tracking.
- Canonical simulation clock and offline backlog: on return after days/months, a **single** reconciliation across pets, plants, labs, food, social and greenhouse (as supported by those modules). Document existing 365-day clamp, define explicit policies beyond cap, preserve fairness and never blindly iterate millions of hours. Use deterministic checkpoints/pure reduce where possible, idempotency/lastAppliedTick and test with 1 hour, 1 day, 30 days, 365 days, 500 days, clock rollback and leap/DST, reinstall/restored save, non-network device and device timezone change. Important: do NOT claim user’s server simulates all activity when offline if this remains client-driven.
- Allow visual plant and machine position interpolation after catch-up; no off-screen WebGL GPU process.
- Gate: signed QA build, long-play engine tests, save migration/backup, owner approval before any `main` or Google Play merge.

### S7.8-I — INTEGRATION/PERFORMANCE/HANDOFF
- Compare each placed asset and in-game screenshot side-by-side to approved REF-01..05 and owner screenshots, reject mismatches by default. Test day+night, Eco/Balanced/High, A55 3D FPS/heat, z-fighting and water visibility, 20 land+4 aquatic plants, mobile RAM and startup.
- Regress previous S6 Food Warehouse/pet reserves, legacy Classic 2D, G01 animated water, parent HUD, undo/backup, friends/social, network loss recovery.
- Independent CI proof (real WebGL screenshot + 3D glTF animation clips + binary inside signed APK); **OWNER PASS trumps a pretty CI screenshot** for visual acceptance, while automatic tests still gate reproducibility and safety.
- Only after user explicitly approves a phase may it move from draft/QA to integration; no Play publication from this roadmap.

## 2. Cross-asset data contracts (stable IDs proposed)

`trialum.garden/G01.water/main`, `.../G01.water/satellite-1..3`, `.../G02.nursery`, `.../G03.bed-1`, `.../G04.bed-2`, `.../G04.bed-3`, `.../G05.bed-4`, `asset/ground/F01..03`, `asset/soil/S01..03`, `asset/metal/M01..03`, `asset/light/L-F1..3|L-W1..2|L-C1..3`, `asset/robot/R01`, `asset/transporter/T01..3`, `asset/excavator/E01..2`, `asset/control/G02-W01..06`. These IDs are **proposal namespaces** and can be locked before implementation. Original canonical `plantId`/bed ID remains authoritative regardless of mesh name.

## 3. Acceptance checklist for a changed APK

Never deliver an APK with only a bumped number. A real changed build must show: exact Git SHA → changed/reviewed GLB files and scenes → screenshot from actual in-game Chromium rendering → APK includes expected GLBs and no unrelated engine code → original signing verified → owner phone can enter correct door and visibly inspect the asset. Report `source committed / CI tested / signed APK / owner PASS` separately.

## 4. Continuation protocol

Open this roadmap, the full owner-requirements document and visual bible before writing any new asset. Always start from latest real PR head, never from a historic image ZIP. Update: `docs/S7_GREENHOUSE_BUILD_LEDGER_20261117.json` with `ticket`, `REF-xx`, `source SHA`, `render`, `GLB`, `animation`, `engine`, `CI run`, `owner verdict`; one in-progress task maximum. Clearly distinguish **PLAN**, **DRAFT**, **RENDERED**, **GLB_BUILT**, **ENGINE_WIRED**, **CI_PASS**, **OWNER_PASS**.
