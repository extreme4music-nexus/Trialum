# TRIALUM · S7 AGRO GREENHOUSE · OWNER REQUIREMENTS V1.0
**Date:** 17 November 2026 · **Owner authority:** The owner decides visual/functional PASS, and whether a proposed mechanic is added to canonical gameplay.
**Scope — OWNER CORRECTION V3 (17 Nov):** FOUR paw fingers = **FOUR distinct cultivation beds** (`G-02→bed-1`, `G-03→bed-2`, `G-04→bed-3`, `G-05→bed-4`). The nursery, seedling shelves, **larger and more numerous mature storage shelves**, greenhouse management/PC desk, materials and repairs are relocated to spacious `G-00L`, **directly LEFT as the player enters** from Agro Atrium. `G-00L` is a SERVICE CORNER of the existing main open greenhouse, not a finger or a new enclosed room. Central `G-01` water remains dominant. **Canonical layout amendment:** [S7 V3 owner layout](S7_GREENHOUSE_OWNER_LAYOUT_CORRECTION_V3_20261117.md). This doc is a design contract, not a claim that new props already exist.

## Guiding rule: the approved pictures are the visual contract
The FIVE images approved by owner are the reference standard for overall composition, modular materials, machines, flora, irrigation, control systems and lighting. The contact sheet and original image IDs/filenames are documented in `docs/S7_GREENHOUSE_VISUAL_BIBLE_20261117.md`. Match the forms, proportions, color palette, material finishes and scene mood; new renders must be checked side-by-side against them. Concepts are not implementation proof and are NOT permission to mint new plant species or capacities.

## A. Modular ground and finishes — **nine families, tileable**
### A1. Three ground tiles
1. Highly polished cream-white marble (warm cream veining, reflective, elegant, walkable).
2. Highly polished black marble (subtle white mineral veins and controlled reflection).
3. Grey-green natural stone tile (low-to-medium sheen, readable stone grain; non-slippery near pools).

### A2. Three modular soil states
1. Fresh, dug and loosened soil: crumbled, prepared planting bed; no seedling holes yet.
2. Prepared soil **with aligned planting holes**, real holes/indentations, socket markers for actual original plant slots; no fake planted specimen.
3. Untreated soil: irregular packed dirt, stones and roots (must be explicitly prepared before planting when gameplay supports it).

All **on repeatable square/rectangular cubes or blocks**, with configurable tiling density and correct adjoining UVs/seams. Soil edges/corners should have finishing pieces. 3D soil states are visual at first; the canonical engine must later validate actual seedling/bed state before changing them.

### A3. Three metal cover panels
1. Creamy pale green/sage metallic.
2. Reflective polished chrome.
3. Matte black metal.
All modular in matching grid, with edge and corner caps, PBR metal/roughness and efficient instancing.

**Deliverables per variant:** isolated perspective + overhead render, genuine `.glb` (metric origin/pivot and PBR), material variants, tileable/instanced specification, performance QA. Explicitly reserve basin holes and walkable routes to avoid replacing the G-01 cut-out floor.

## B. Grounds machinery and transport
- **Excavators**: original greenhouse-compatible compact machines; variants for digging trench and bed preparation/soil turnover. Rig boom, stick, bucket/roller, treads/wheels and hydraulic hoses; simulation owns tasks, collision, and target route.
- **Transport T-01**: planting/removal unit with robot arm and gripper; must carry **real** seedling/plant IDs and only perform original valid planting/removal intents.
- **Transport T-02**: flat standard carrier/conveyor for seedling boxes and harvested/transport-ready plant crates; cargo is actual nursery/stock, no phantom inventory.
- **Transport T-03**: heavy transporter for machinery/spare parts; use real maintenance tickets/inventory once approved.
- **One humanoid repair/greenhouse worker robot** based at the `G-00L` entry-left service dock (not G-02). Full rig for walking, reaching, carrying, inspection, crouching, repairing and controlled collisions; prioritize G-00L racks, pumps, hoses, lighting, panels and machines. Animations follow jobs and result receipts, not the reverse.
- **Autonomy:** visual movement is continuous while scene visible; actual job progress from authoritative engine state, deterministic on resume. Avoid uncontrolled off-screen background timers and uncontrolled server process or infinite agent loops.

## C. G-00L — real entry-left greenhouse management / nursery / storage
- Workstation includes **hologram monitor, computer case/tower, mouse, keyboard and desk**. Cabinet/workstation forms follow the approved machine concept art.
- The `G-00L` terminal displays ONLY greenhouse facts: water/basin filters, each bed, species, plantId/growth/health/hydration, seedling stock, soil state, pumps, valves, leak/repair incidents, transporter queue, irrigation schedules, energy demand, service status, alerts and task history. No unrelated world or social metrics.
- Touching the in-world hologram in `G-00L` opens a **central interactive holographic HUD** (reuse the approved in-game HUD patterns and back navigation). Display is a read-only projection of real state before any action.
- User may request aquarium cleaning, localized watering, additive application, drip irrigation start/stop, pump toggles, valve controls, hose repair/replacement, filter maintenance and transport/robot jobs. All actions must route through **authorized validated engine commands** with success/failure receipts, stock costs and one-time effects; never mutate save data directly from scene/HTML.
- Device visual should mirror actual engine receipts; no invented token prices, time intervals, environmental thresholds or fake defects. If mechanics do not exist yet, disable controls and label **PLANNED**, not interactive fake buttons.

### C1. Two mandatory, separate greenhouse rack families
- `RS` seedling nursery racks: smaller modular shelves/tiers, trays and drain pans for **freshly produced seedlings**, real `s.agro.seedlings` counts; should not show empty inventory as populated plants.
- `RM` mature-plant holding racks: physically **larger (wide/deep/higher clearance)** and **more units than RS**; reinforced carriers, wider aisles, per-plant ID status. Note the canonical engine currently moves eligible plants directly from `s.agro.gardenPlants` to habitat, without a mature-storage state. New receipt-based transfer/holding must be separately specified and approved before interactive rack inventory is enabled.
- Separate spare-parts/repair shelves and physical access for T01..T03 transporters + humanoid. RS and RM should be rendered **as separate asset families**, not recolored identical racks.
- Exact shelf unit count and geometry are owner-approval items after measuring the entry-left area. Provisional visual layout may show **2 RS and 4 RM**, never as a gameplay capacity or final bill of materials.
- Canonical rack-placement, orientation and state constraints: [Layout V3](S7_GREENHOUSE_OWNER_LAYOUT_CORRECTION_V3_20261117.md).

## D. Irrigation and per-bed controls
- Genuine 3D models and render boards for hoses, bend connectors, splitters, valves, clean-water pumps, reservoir, particle filters, drip lines, small drippers, sensors, couplings, replacement hose segments, repair toolkit, pressure gauges.
- **Drip-by-drip** is the required system for **each terrestrial bed**, with bed-local mini-control panel.
- Panels support flow stop, zone watering, pump on/off, valve open/close, broken/torn hose diagnosis and repair/replace, plus status LEDs for pressure/water use.
- Engine authority: simulation can act autonomously; user can manually override via approved command, subject to availability/resource conditions. Commands idempotent and safe after app interruptions. Hose/pipe failure states only after a documented and approved simulation contract.

## E. Lighting — exactly eight fixture families
**Floor (3):**
1. Continuous waterproof strip light around every basin and along planting beds.
2. Small circular recessed LED pucks intermittently embedded in floor tiles.
3. Large cubic/recessed glazed LED floor panels, tile-replacement size, highlighting important areas.
**Wall (2):**
4. Compact angled task light above `G-00L` desk, monitors and control panels.
5. Larger angled wall flood/task unit for broad wall surfaces.
**Ceiling (3):**
6. Main grand suspended fixture: **ONE large central ring + FOUR smaller rings** around it (G-01 focal chandelier).
7. Smaller hanging LED lights on **thick ropes**.
8. Compact circular ceiling LEDs distributed down the growing corridors.

Every variant requires isolated render + GLB + lens/diffuser/emissive PBR and suitable night illumination. Distinguish *mesh* emissive brightness from real mobile dynamic light count for performance.

### E1. Real-time ambient/day-night demand
- Lighting should match user's **local clock, minute, day/night and time zone**, and the geographical solar phase when trustworthy/consented location exists; exact geolocation is NOT mandatory merely to do clock sync.
- On every application activation: obtain current wall-clock and OS time zone; validate against persisted last-safe time; compute solar phase **only if coarse location was explicitly shared and policy permits**; otherwise deterministic local sunrise/sunset defaults or manual preference.
- Lighting simulations may compute a projected present-state from time instantly without running perpetual process off-screen. **Simulation/game-world elapsed days are distinct from wall clock**. Must avoid time zone changes, device-clock tampering, DST jumps, re-install and repeated catch-up.
- If days/months pass offline, subsequent game activation must **reconcile elapsed canonical game time** exactly once and bring every applicable system to the current state. This must work for the **entire Trialum simulation**, not just greenhouse lighting. Record bounded catch-up strategy, checkpoints and reproducible test matrix before changing existing engine.
- Existing code: `js/plant-lifecycle.js` currently sets `MAX_CATCHUP=365` game days. The owner's unlimited-days/months persistence request is a **new design requirement**; a finished production-safe model must reconcile beyond caps using exact/capped/summary rules that preserve plant IDs and do not inflict arbitrary retroactive death.

## F. All terrestrial AND aquatic plants / stages
- 3D reference models for **every ACTUAL original-game plant species**, with all approved stages: seed/seedling, young, growing, mature, transplant-ready. Later repair/weak/dead variants as required by the canonical health system. Never silently introduce unfamiliar human-food crop species from concept images.
- Verified original species from `js/engine.js`: `lumemoss` (Лумемов), `glowfern` (Сјајна спира), `mineralreed` (Кристалостебло). From `js/plant-lifecycle.js`: aquatic `aquaglow` (Аквалум). **New species additions require owner approval and engine model definition first.**
- Visual development **in the same bed**, not moving plants between FOUR finger corridors for each growth phase. Any mature-plant movement to **G-00L** storage needs a newly approved original-engine transaction (current engine has no separate mature-storage queue); never clone an existing plantId.
- Every specimen retains unique original `plantId`, species, habitat/bed, health, hydration and growth. Never have two living 3D plants representing one record.
- Rig wind/draft sway, leaf/stem flex, breathing/subtle living motion; respond to nearby machine **proximity and wind/air displacement**, not collisions that instantly change biological growth. Prefer GPU/CPU-budgeted bone or morph-target animation with per-instance seeds.
- Real plant animations are event-driven where relevant: droop under water stress, machine approaches (recoil), planting/extraction when engine receipts validate; offline growth is reconciled by engine state when reopened.
- Canonical initial capacities remain **4 beds × 5 terrestrial = 20 plants** and **one aquarium × 4 aquatic = 4**. Decorative 3 additional G-01 pools do NOT add slots; any new capacity demands separate explicit approval.

## G. Scene/production invariants
1. Keep approved four-finger paw geometry and attached ground-floor lobby; same normal door/back route.
2. G-01 water is central focal point. **G-02, G-03, G-04 and G-05 are ALL FOUR growth fingers**, each with one original 5-slot terrestrial bed. **G-00L** is the side space LEFT immediately upon entry (within existing main shell), holding seedling storage racks, MORE and LARGER mature-holding racks, the office/hologram workstation, maintenance shelves and humanoid robot dock. This update expressly supersedes the historical 1+2+1 arrangement.
3. **One visual module at a time:** approved reference → detailed render (owner PASS) → correct GLB with real meshes/rig/animation → offline bundle → scene placement → original engine read-only parity → validated game intents → Android CI → owner device PASS.
4. All props authored original for Trialum; no external paid IP/ads/data selling; GLTF2 metric Y-up, offline Android WebView compatible and performant; preserve backups and original data.
5. Default camera starts near interior center; user can zoom out and choose corridor to zoom. Maintain current holographic UI and standalone QA mode without duplicate HUD.
6. Never declare concept render a finished GLB. Never declare present-day graphics a finished engine action. **No repeating identical empty-shell APK**; new signed QA must actually contain the approved new elements.

## H. Source and interpretation notes
This document captures the owner's stated goal. The five approved concept images also depict highly specific plants like tomatoes, water lilies and grasses, a waterfall and an outdoor environment; these are **art-direction examples**, NOT yet canonical supported Trialum species or new game mechanics. Textual owner requirements and current authoritative code take precedence where a concept image differs.
