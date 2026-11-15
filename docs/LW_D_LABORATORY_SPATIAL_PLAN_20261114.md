> **MANDATORY B0–B9 GLB-FIRST OWNER ARCHITECTURE — 2026-11-15.** [canonical B0–B9](https://github.com/extreme4music-nexus/Trialum/blob/main/docs/TRIALUM_3D_WORLD_MASTER_PLAN_B0_B9_20261115.md) · [asset/scene/GLB contract](https://github.com/extreme4music-nexus/Trialum/blob/main/docs/TRIALUM_3D_ASSET_SCENE_CONTRACT_20261115.md) · [non-bypassable owner/phase gates](https://github.com/extreme4music-nexus/Trialum/blob/main/docs/TRIALUM_3D_PHASE_GATES_20261115.md) · [ADR-004 renderer trial](https://github.com/extreme4music-nexus/Trialum/blob/main/docs/ADR_004_GLTF_FIRST_THREEJS_PILOT_20261115.md). Original L3.9 **plant engine has explicit OWNER FULL PASS on 2026-11-15** after installing signed QA build; [GitHub #171](https://github.com/extreme4music-nexus/Trialum/actions/runs/43670180653) source SHA 7466c38c0f863cf4299fbdf6263f823c60b2608d. This does **NOT** approve future GLB/3D construction. **B0 is NEXT**, B1 Three.js GLB isolated pilot, B2 assets, B3 world/bridge, then B4 Agro Lobby/B5 Warehouse/B6 Garden/B7 live interactions/B8 PhytoLab/B9 polish. No bypass without an explicit, versioned owner-approved exception. Three.js is the pilot candidate, not already a full replacement; preserve NovaGL2, five first-floor labs, core/save/food, and owner-only GitHub SignQA. **Main-branch master documents are binding on this still-Draft development branch.**

> **SPATIAL OVERRIDE:** physical first-floor five-door LABORATORY Lobby stays intact. GLOBAL Main Lobby (HUD routes) is distinct from FUTURE ground-floor three-door Agro Lobby; do not rebuild five existing rooms as hardcoded final geometry. GLB spatial architecture and owner-gated B0–B3 precede any new physical Agro room. Past old phase names remain historical; do not delete them.

# LW-D — LABORATORY SPATIAL ROADMAP / ЛАБОРАТОРИИ

**Owner direction:** full rooms, visible machinery, several independent work zones, interactive controls. One floating laboratory object is NOT completion.

## L1 — First actual 3D laboratory interior (this branch)
- Original room architecture: floor tiles, multiple walls, columns, light fixtures, windows, work benches, ingredient storage racks and science equipment.
- Four meaningful distinct stations: synthesis, analysis, materials collection and cell incubation.
- Real WebGL2 geometry and animations; station selection by tapping 3D station and equivalent accessible HUD controls.
- Third-person/orbit camera with station focus and return-to-overview; preserve drag-to-orbit behavior.
- Station-specific HUD and actions routed into original E.basicResearch, original notice/save. No extra pet/resource/economy store.
- D0 standalone preview remains a safe **fictional demo**; in D1 live game, the authoritative state is the existing engine.
- Performance: only render in foreground visible view; no WebGL/AI in background.

## L2 — Meaningful processes/experiments
Animate actual resource inputs, operation, result and failed experiments. Make hypothesis/observation/explanation available as optional learning; don't fabricate real-world biology.

## L3 — Complete laboratory complex and progression
Add specialized interactive rooms for enhanced chemistry, growth, DNA and other existing lab tiers. Every tier and prerequisite remains tied to existing state and resources. Late emergent-creature work is a separate substantial game-mechanics gate.

## L4 — End-to-end laboratory gate
Real-device touch/graphics and battery checks, multiple landscape aspects and safe insets, GPU context restoration, offline world, AI OFF, MK/EN texts, full engine/social/save regressions and old backup roundtrip. **Owner must explicitly approve.**

Only **after all laboratory gates** do we shift main development emphasis to Biospheres, then Pets+Homes, Research-within-Labs, Flora, Food Warehouse, Playgrounds and remaining modules.

See TRIALUM_LIVING_WORLD_MASTER_3D_20261114.md and LW_D_DELIVERY_PLAN_20261114.md.

## L2 — Close-up, textures and engine-result visual process, 14 Nov 2026

Owner explicitly accepted the current L1 **as a provisional starting point** and specified: zoom to immediate working distance, see an apparent physical process live at human-readable scale, and do NOT leave the scene as monochrome primitive meshes.

Work in the separate L2 branch adds:
- smooth station-to-machine camera transition (~3.65 world units) plus drag/orbit, wheel/touch pinch magnification;
- WebGL2 material profiles (ceramic tile, brushed metal, coloured transparent-looking solid polymer, luminous samples) and instrument geometry detailing;
- animations derived from real `E.basicResearch` return values and before/after resource snapshots. Successful/failing operations have different bounded visual feedback; no extra XP, token, cells or molecules awarded by rendering;
- process feedback stops with the foreground renderer. No background AI or simulated GPU work;
- approximate 3D architectural scale for legible spatial relationships. This is NOT physical atom-by-atom laboratory science, nor does a 3-second visual replay mean the fictional operation took three seconds in the game engine.

**L2 is a process-visualization scaffold, not full lab completion.** Future true timed processes require an owner-approved change to the underlying deterministic simulation, with same source of truth, offline continuation and backup compatibility. Android GPU, camera clipping, touch and battery QA remain mandatory.
