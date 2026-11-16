# TRIALUM S7 / G-01 — ANIMATED WATER + AQUAGLOW AQUATIC PLANT STAGES
**Date:** 16 Nov 2026 · **Status:** owner-review concept and generated GLB candidates; NOT installed in the game.
**Latest branch:** `feature/lw-d-agro-s7-g01-aquaglow-water-animation-20261116`, based on camera/G01 PR #86.
**Source of truth:** `js/plant-lifecycle.js`, `js/plant-lifecycle-ui.js`, `docs/LW_D_AGRO_S7_G01_WATERCORE_20261116.md`, `docs/blueprints/S7_G01_AQUATIC_VISUAL_MAP_20261116.json`.
**Build**: `python3 tools/b1/build-agro-g01-aquatic.py`, output `build/g01-aquatic-review/`. CI uploads review-only ZIP with real GLBs.

## 1. Owner correction, not an optional decoration

G-01 is first and foremost a **living aquatic garden**. The owner correctly identified a gap: the earlier realistic *still* water render and five basin/bridge/pump GLBs did not yet contain full animated water or genuine underwater plant models. The actual water must be the **central protagonist** of the big circular dome; water plants must show the **same real growth and health lifecycle** as terrestrial flora, not an endlessly decorative fixed mesh.

Our updated architecture therefore consists of **three separately verifiable layers**:
- **Physical G-01 water architecture**: main below-grade pool, 3 smaller satellite basins, guard rails, bridge, filtration and support machinery (five G01-M1..M5 candidates already generated, not installed).
- **Actual animated surface**: authored glTF2 water mesh with **2 morph-target wave patterns**, animated weights over a **6-second looping `G01_WATER_RIPPLES_LOOP_6S` clip**, applied to **4 distinct surface meshes** (main+3 satellite), material blue-cyan and transparent. Its movement is an actual glTF animation, not a screenshot/flat blue disc.
- **Living 3D aquatic plant**: authored **four growth-stage mesh GLBs** for the original fictional `aquaglow` / **Аквалум**, plus separate `weakened` and `dead` visual variants. This is currently the **only** declared aquatic flora species in the original engine, research tier 3.

**Do not claim the conceptual images are recordings of functioning in-game features.** All are visual art direction pending renderer lighting/parity work. Aquatic fauna, lily pads and realistic lotus varieties visible in some concept images are **illustrative**, not currently canonical species/objects and must not be automatically installed or minted into gameplay. Photorealistic real-time caustics, refraction, foam and subsurface particles are a **subsequent renderer/shader pass**, not finished merely because the glTF water waves are animated.

## 2. Canonical plant data and exact growth mapping

Already implemented in `js/plant-lifecycle.js`:
- There is exactly one scripted aquatic species: `E.PLANTS.push({id:"aquaglow", name:"Аквалум", medium:"aquatic", labTier:3,...})`.
- Aquatic plants occupy **one** bed ID `aquarium` with capacity **4**. There are four plants maximum, not four per basin.
- Source of garden live instances: **`s.agro.gardenPlants`**, filtered by `p.bedId==="aquarium" && p.medium==="aquatic"`. The specimen's unique `p.id` is preserved during growth, health changes and transfer to a **lagoon** habitat.
- The same original engine advances `p.growth` (0–100), `p.health` (0–100), `p.hydration` (0–100), `p.dead`, `lastWaterDay`, `lastAdditiveDay`. Newly planted specimens start `growth:3`. Original approved transplant gate is **`growth>=85 && health>=50 && !dead`**.
- Not enough water or care can make any plant weakened, critical and dead. In the current canonical engine aquatic hydration loss is 8 per game-day tick (vs terrestrial 16); DO NOT replace it with real water shader/visual-clock logic.
- Aquatic `hydro-stabilizer` is a valid original additive; the game must only use already-available original engine stock/actions to treat a specific plant.

**Render-only thresholds (new presentation mapping, NOT new engine growth rules):**

| Visual | Canonical `growth` | GLB | Interpretation |
|---|---|---|---|
| Sprout / никулец | 3–19 | `aquaglow-sprout.glb` | root/rhizome with 2 small emissive leaves |
| Young / младо | 20–49 | `aquaglow-young.glb` | 4 leaves, longer underwater stems |
| Growing / пораснато | 50–84 | `aquaglow-growing.glb` | 7 luminous leaves, original juvenile bloom |
| Mature / зрело | 85–100 | `aquaglow-mature.glb` | 10 full-size leaves, glowing crown and mature blossoms |
| Weakened override | `!dead && health<40` | `aquaglow-weakened.glb` | drooping smaller foliage; not a different species |
| Dead override | `dead===true || health===0` | `aquaglow-dead.glb` | dead/withered pose; no animation that looks alive |

Visual selector priority: **dead → weakened → growth stage**. This visual threshold table is a proposal for the next 3D read-only bridge; it does not alter `E.advance`, `E.processDays` or the save schema. Future changes for near-death 24% vs weak 40% may use material tint; do not silently introduce an unapproved fifth growth phase.

### Only four real aquatic sockets

Engine `bedId:` `aquarium` maps to the four existing G01 sockets:
1. `aquatic-slot-1`: X −2.7, Y −1.04, Z −2
2. `aquatic-slot-2`: X +2.7, Y −1.04, Z −2
3. `aquatic-slot-3`: X −2.7, Y −1.04, Z +2
4. `aquatic-slot-4`: X +2.7, Y −1.04, Z +2

One **unique** `plantId` occupies exactly one socket. If engine has zero aquatic plants, the pool is empty of plant meshes; if an aquatic plant is mature or sick, the **same ID** changes visual mesh, not its instance count. An aquatic plant transplanted to a compatible lagoon habitat must disappear from the greenhouse exactly once. No plants are spawned because a 3D model was loaded.

## 3. Water GLB animation: actual content vs future shading

Generated asset: `g01-water-surfaces-animated.glb`.
- Real glTF2 geometry: top surface triangles, meaningful normals and UV for each of the four basins.
- Two actual **POSITION morph targets** on each water-surface mesh, with an animation channel targeting `weights`; glTF named clip `G01_WATER_RIPPLES_LOOP_6S`, six-second loop, **4 channels**. The amplitude is roughly 0.05 m at active wave positions and dampens toward basin rim.
- Transparency/PBR cyan material, no external asset request, Android GLTFLoader-compatible.
- The water is placed at **Y≈−0.235 m** in the same greenhouse coordinate system; the basin bottom is around Y≈−1.04 m.
- Real in-game animation later starts via `THREE.AnimationMixer` when G01 appears, uses GLTF `animations[0]` and loops; should **pause/dispose when room not visible** and never call an engine tick. Need mobile perf validation.
- **Not implemented yet**: physically accurate Fresnel refraction, projected moving caustics, detailed depth fog, foam and splashes, interactive water quality, pump physics, real reservoir/filter token system. These are separate visual and B7 logic contracts.

## 4. Render/GLB installation order after owner visual review

**G01-W0:** review owner water-centered concept and the Aquaglow four-stage visual family. Discuss any artistic corrections (leaf/flower glow/size, underwater visibility, natural vs futuristic surface).
**G01-W1:** cut **exact physical openings** in the already-approved solid GLB floor at main R=6.7 and three small basin coordinates. Preserve lobby and four corridor openings. Install **main basin** from previous candidate and check on A55.
**G01-W2:** install the **animated GLB main water surface** at correct depth, add THREE.AnimationMixer with real per-frame visible-only updates and no state writes. Prove waves are visible and fluid on phone, no clip/ghost/stalled GPU.
**G01-W3:** install three satellite basins and animated surfaces (still **0 new plant slots**).
**G01-P1:** install sprout → young → growing → mature **only for actual `aquaglow` plant IDs in `s.agro.gardenPlants`**. The existing 4 slots remain the only water-capacity authority. Expose growth/health read-only in original HUD. Empty world must not show fake specimens.
**G01-P2:** read-only health overrides `weakened`, `dead` and mobile underwater visual inspection. No simultaneous alive/dead mesh for one ID, no regression after backup/restore or returning from lagoon.
**G01-F:** scene lighting/water caustics/reflection/underwater shader polish, then bridge, railings, pumps, visual-only animations. Then complete G01 owner PASS → G02 nursery.

**Critically:** source branch / CI can successfully produce **seven authentic GLBs** now (one animated water + four Aquaglow growth GLBs + two health variations), but they remain in `build/g01-aquatic-review` **not in Android app assets**, and their *read-only mapping logic above is future installation work*. Current signed APK #262 contains the camera refinement and empty shell, **not aquatic plant scenes**.

## 5. QA / handoff

Run `python3 tools/b1/build-agro-g01-aquatic.py` and `node --test tests/lw-d-s7-g01-aquatic-animation.test.cjs` after generating the original shell GLB. CI must confirm JSON asset manifest, proper glTF2 headers, morph targets on all four surfaces, real looping animation channels and original `aquaglow`/bed/maturity source code. No CI PASS means phone PASS.

Read the newest PR #87 / branch in GitHub, then [S7 G01 CONTINUE](LW_D_AGRO_S7_G01_CONTINUE_HERE_20261116.md) (the former version may precede these assets). Before touching installation, ask for or use latest owner visual verdict for the new aquatic render; create smaller follow-up milestones.

**Safety:** no `main` merge, Play release, new real currency costs, alternate plant engine, dynamic aquatic species, unauthorized notifications, changes to S6 warehouse or existing backups.
