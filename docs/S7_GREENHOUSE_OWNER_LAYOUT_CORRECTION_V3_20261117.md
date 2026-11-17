# TRIALUM S7 — OWNER-APPROVED LAYOUT CORRECTION V3
**17 November 2026 — replaces the earlier G02 nursery / 1+2+1 allocation.**

## Explicit owner correction
The owner clarified the greenhouse has **FOUR elongated paw fingers** and there must be **FOUR cultivation beds**, each assigned to its own finger. The earlier plan accidentally consumed the smallest left finger for storage/management and distributed the four beds into the three remaining fingers. **This is CANCELLED.**

The **nursery, seedling shelves, larger and MORE numerous mature-plant storage racks, computer desk, hologram monitor, service supplies and management controls go in the spacious service area immediately LEFT when the user walks INTO the greenhouse from the Agro Atrium entrance**. This is an alcove/service-side of the main accessible G01 perimeter, **not the leftmost finger** and **not a fifth finger**. Do not interfere with the large G01 water centerpiece, central pool, three satellites, bridge, passageways or lobby return door.

### New canonical semantic zones
- `G-00`: original Agro Atrium connecting throat / entrance.
- `G-00L` / `entry-left-service`: **NEW planned functional designation** for the spacious LEFT-of-entry side, inside the existing main shell perimeter; *not a new independent enclosed room or new building wing*. It contains nursery / supplies / mature racks / workstation / robot maintenance station.
- `G-01`: unchanged central aquatic heart, main pool + three smaller decorative basins; four canonical Aquaglow positions remain only in the primary `aquarium` bed.
- `G-02`: **smallest FAR-LEFT finger**, now **terrestrial cultivation bed `bed-1`** with five canonical slots. Do NOT add nursery racks to this finger.
- `G-03`: next left finger, **`bed-2`** (five canonical slots).
- `G-04`: central/longest finger, **`bed-3`** (five canonical slots).
- `G-05`: far-right finger, **`bed-4`** (five canonical slots).

**Physical existing glass footprint remains one central pad + four paws**; no roof surgery and no new bed counts. This is **semantic zone assignment proposed to be applied to the scene map after owner review**, not a claim that G02’s GLB soil was already placed. Actual shape or allocation within each corridor will be surveyed against current scene dimensions before final prop placement.

### Orientation — user stands at the entrance LOOKING INTO THE GREENHOUSE

```text
                         GREENHOUSE FINGERS (toward far glass wall)
      G-02 (SMALLEST)       G-03               G-04               G-05
      BED-1 / 5 slots       BED-2 / 5           BED-3 / 5          BED-4 / 5
         ╲                   ╲                 │                 ╱
          ╲                   ╲          ____  │  ____          ╱
           ╲___________________╲________/             \________╱
                                     G-01 WATER HEART
                                 MAIN + THREE SMALL POOLS
                                    (4 water slots total)
                              ╭─────────────────────────╮
  ENTRY-LEFT SERVICE AREA     │                         │
  ┌──────────────────────┐    │     paths / bridge      │
  │ SEEDLING RACKS  RS   │    │                         │
  │ MATURE RACKS    RM   │    ╰─────────────────────────╯
  │ WORKSTATION + HUD    │
  │ TOOL SPARES + ROBOT  │
  └──────────────────────┘
                 ← LEFT OF ENTRANCE (as viewed on entry)
                                       G-00  ⇧
                                    AGRO ATRIUM
```

Diagram is **functional orientation** only, not scale or geometry. Exact asset positions and access widths are subject to verified G01 floor/camera/collision and owner review. Do not assume it means a new solid wall/box around the open service zone.

## Storage hardware — newly required real 3D assets

### RS — SEEDLING ACCLIMATIZATION / RECEIVING RACKS
- Dedicated narrow-to-medium, easily accessible modular **seedling shelves** in G-00L. Support individual trays/containers and recently created seedlings waiting for their real allocated bed. Prefer multi-tier design with drip trays, ventilation, gentle task LEDs, per-tray status indicator and safe robot-hand access.
- Each tray maps to original actual `s.agro.seedlings[speciesId]` **stock counts**. No visible stocked tray unless stock exists; optional clearly marked show-only demonstration permitted solely during owner QA.
- Proposed visual models: `rack-seedling-straight.glb`, `rack-seedling-endcap.glb`, `tray-seedling-empty.glb`, `tray-seedling-occupied.glb`, `rack-seedling-status-panel.glb`. Actual assets not yet built. Seedling species/stock must not silently become extra canonical planted `plantId` until `E.plantInGarden` is successful.

### RM — MATURE-PLANT TRANSFER / STORAGE RACKS
- **LARGER shelves AND MORE shelving units than seedling shelves**, visibly occupying the greater portion of the service-side storage footprint, with wider/deeper levels, greater vertical clearance, larger spacing for full plant morphology, stable pot carriers, service access and reinforced rails.
- Separate clearly from RS: mature plants are **not** immature seedling boxes. Proposed models: `rack-mature-wide.glb`, `rack-mature-tall.glb`, `rack-mature-corner.glb`, `rack-mature-plant-carrier.glb`, `rack-mature-status-panel.glb`. Actual assets not yet built.
- Rack inventory, relocation and staging must reference exact real `plantId`, `species`, `growth`, `health` and destination. **Current canonical engine does NOT have an independent mature-storage inventory state**: `E.transplantPlant` moves a valid mature garden `plantId` into a habitat. Therefore the ability to *physically remove mature plants from beds into G-00L holding racks* requires a later explicitly approved engine transition/schema, backup migration and tests. Until then, display planned rack occupancy as **unimplemented** or read-only eligible/mature statuses; **never duplicate a plant at the bed and the rack simultaneously**.

### RS vs RM count/scale planning rule
Because actual left-side usable dimensions have not been verified, do not lock unit numbers. The initial spatial draft may show **e.g. 2 RS seedling racks and 4 RM mature racks**, but those numbers are **a layout suggestion ONLY**, require actual floor/corridor measurement and owner visual sign-off. The firm requirement is **RM units MORE in number and physically BIGGER than RS units**; loading capacities are not authorization to change gameplay stock or original 20+4 slots.

### Other parts in G-00L
- Desk + holographic monitor + PC tower + keyboard + mouse.
- Dedicated spare parts and repair-supply shelves/boxes (not conflated with seedling or mature racks).
- One humanoid repair robot's dock, its workstation and outgoing task queue.
- Service robot/transport trolley path connecting RS/RM → the G01 paths → all four fingers.
- Drip irrigation, lighting/monitor controls and centralized greenhouse-only holographic HUD using original engine intents.

## Reconciliation with previous documents
- Prior `docs/LW_D_AGRO_S7_GREENHOUSE_BLUEPRINT_V2_ARCHITECTURE_20261116.md` proposed **G-02 as nursery**, `G03 bed-1`, `G04 beds 2+3`, `G05 bed-4`. Those statements are **historical and superseded** by this document.
- All visual REF-01..05 images stay owner-liked. If they depict racks in a finger, reinterpret as palette/item references, **NOT authority over spatial layout**; owner’s latest verbal correction controls the map.
- `docs/S7_GREENHOUSE_MASTER_REQUIREMENTS_20261117.md`, `docs/S7_GREENHOUSE_EXECUTION_ROADMAP_20261117.md` and `docs/S7_GREENHOUSE_BUILD_LEDGER_20261117.json` must be updated to match this amendment.
- Do NOT modify live greenhouse `scene.json`, game engine, `main`, G01 water, 12 GLBs or signed APK merely to change this PLAN. Re-map only in a future GLB scene ticket after owner confirms new service-zone visual render.

## New sequencing
1. Freeze/verify this functional redistribution in plan and visual art bible.
2. Floor materials on G01 dry paths **and planned G-00L service area**, then one bed floor per finger (S7.8-B).
3. Dedicated RS/RM shelving GLB renders before other G-00L desk/robot props (new S7.8-E0).
4. G-00L desk and holo/control station (S7.8-E1).
5. Four distinct bed corridors G02, G03, G04, G05, 1 bed each, original IDs and stock.
6. Plant/transport/robot motion and **later** mature-rack transfer engine contract after owner says yes.
7. CI actual GLB screenshots and on-phone owner PASS per part. No automatic slot/stock changes.

**Owner verdict:** spatial correction explicitly confirmed by owner (17 Nov). Design detail, shelf proportions, exact object counts and live implementation still pending visual/technical gate.
