> **CRITICAL OWNER DIRECTIVE — 2026-11-15, ADR-005 OVERRIDES OLDER B1/B9 STATUS:** [ADR-005 owner GLB/high-photorealism decision](https://github.com/extreme4music-nexus/Trialum/blob/main/docs/ADR_005_OWNER_DIRECTIVE_B1_PHOTOREALISM_AND_FULL_3D_MIGRATION_20261115.md) · [REAL B1 phone defects and R1–R5 rework](https://github.com/extreme4music-nexus/Trialum/blob/main/docs/TRIALUM_B1_OWNER_REWORK_GLB_BLACK_SCREEN_AND_VISUAL_QA_20261115.md) · [complete 3D conversion roadmap](https://github.com/extreme4music-nexus/Trialum/blob/main/docs/TRIALUM_3D_COMPLETE_CONVERSION_AFTER_B1_OWNER_ROADMAP_20261115.md). **Current B1 = OWNER-DIRECTED REWORK / BLOCKED FOR PHASE ADVANCE**, not OWNER PASS and NOT abandonment of Three.js/GLB. Signed [CI #176](https://github.com/extreme4music-nexus/Trialum/actions/runs/43703898547) was green, but Galaxy A55 recording showed **unexpected fallback (missing GLB anchor pilot.table.action-1), black 3D canvas after Eco/Balanced/High changes, unreliable visual inference from high RAF FPS, Android safe-area overlap and camera wall clipping**. Work **ONLY in B1**, fix all defects then show **genuinely premium photorealistic quality and functionality** with stable mobile High, original engine and five labs unchanged; owner expressly accepts B1 before B2/B3. Then B2/B3 prerequisites → **finish entire 3-room Agro ground-floor lobby/wing (B4–B9)** → **retrofit old first-floor five-door lab lobby and labs** → **complete game-wide 3D conversion**. **This is documentation only; no defect is fixed yet.** Older "B1 CI pass", "B0 next" and "Three.js optional to abandon" notes are HISTORICAL and superseded where inconsistent.

# TRIALUM — MANDATORY 3D ASSET / SCENE / BRIDGE CONTRACT v1
**Owner-directed 2026-11-15. Status: BINDING DESIGN CONTRACT, NOT IMPLEMENTED.**
For every future Trialum 3D room, graybox, GLB, model replacement, animation, renderer or projected HUD. This is a technical specification to TEST during B1–B3, not a claim that the current NovaGL2 already supports it.

Read with [B0–B9 canonical master](TRIALUM_3D_WORLD_MASTER_PLAN_B0_B9_20261115.md), [no-bypass gates](TRIALUM_3D_PHASE_GATES_20261115.md), [renderer decision record](ADR_004_GLTF_FIRST_THREEJS_PILOT_20261115.md). See already-working original-game L3.9 source on [Draft PR #73](https://github.com/extreme4music-nexus/Trialum/pull/73).

## 1. Current code audit / migration seam
- Existing prototypes/lw-d/world.js uses direct raw WebGL2: creates cube/sphere meshes, custom GLSL tints and materials, projection matrix/camera, visible-only requestAnimationFrame, projected-point hit testing via lab-complex.js and related room modules.
- Existing prototypes/lw-d/lab-complex.js, lab-room.js, dna-room.js, food-room.js, flora-room.js, research-room.js draw shapes using manual x/y/z dimensions; those are VALID current whitebox prototypes but should NOT become the permanent approach for every newly constructed 3D room.
- Existing js/lw-d-interface.js is the trusted parent iframe/bridge; js/app.js exposes limited validated operation adapters, real save and notifications; original game modules (engine, evolution, progression, longplay, plant-lifecycle) are authoritative.
- Pilot Three.js as REPLACEABLE new rendering backend. Keep legacy prototype working (no all-at-once world.js deletion). Use only one renderer/animation loop per displayed scene, with strict visible lifecycle.
- The new GLB/scene contract must apply BEFORE new Agro Lobby geometry, including all three rooms, and BEFORE retrofitting five existing first-floor laboratories.
- Libraries and GLB assets are packaged LOCALLY for Android and offline PWA; any dependency version/license must be pinned and recorded. Do not assume remote CDN, unauthorized web fetch, per-frame GLB imports or network-only textures.

## 2. Coordinate and measurement standard
1. World geometry uses **1 unit = 1 meter**, **Y UP**, right-handed scene convention compatible with chosen renderer and glTF, fixed canonical forward vector documented in manifests.
2. Ground-floor finished floor is world Y=0. First-floor height is an explicit architect-approved constant established during B2/B4, not guessed from current arbitrary cube heights. Room-local transforms use defined origins and parent→child composed transforms; no silent scale factors.
3. Camera, sound listener, collision bodies and raycast proxies use the SAME coordinate reference. World-space plant socket positions must remain invariant when detailed model replaces graybox.
4. Model transform: scale defaults [1,1,1], local pivot documented, no negative/nonuniform scale unless explicitly approved and tested. Animations cannot silently move collision/interaction anchors when not intended.
5. CANDIDATE sizes to verify in B1/B2: prototype room approx 6×6 m; normal doorway ~2.2 m tall; 3D terrestrial bed approx 3 m long. Huge Garden must be several times the existing laboratory floor area but its 3D size does NOT raise canonical engine capacity.
6. Pet size is species-specific; future creatures may be small/nonhuman. Do not equate meters with arbitrary current pet mesh unit sizes.

## 3. Scene schema — data vs geometry
Each distinct scene has a STABLE ID and its own manifest. The manifest defines:
- sceneId, buildingId, floorId, roomId, revision, rendererAdapter, asset references and relative transforms;
- parent portal destinations and explicit back target; room bounds, walking camera clearance, collisions, portal/hit proxies, accessibility labels;
- named anchors/sockets with stable IDs and typed roles; each parent/child transform explicitly related to a room local origin;
- optional camera focus/presets with bounded orbit/collision parameters; audio emitters anchored to scene geometry, not hardwired phone gyro;
- domain data bindings via read-only selectors: original engine plant IDs, real inventory, pet assignment etc.; actions only through validated original parent;
- optimization quality tiers, static/dynamic lighting flags, LOD/culling and asset memory budgets.

**Illustrative ID namespace**, NOT a new gameplay save schema:
- scene: "trialum.ground.agro.lobby"
- room: "trialum.ground.agro.garden"
- bed: "garden.bed-1"
- socket: "garden.bed-1.slot-2"
- aquatic area: "garden.aquarium"
- production: "ground.agro.phytolab.workbench"
- food storage: "ground.agro.warehouse.shelf-01"
- door: "ground.agro.lobby.door-garden"
- animal anchor later: "homes.home-id.pet-rest-01"

The **engine bed ID is actually bed-1/bed-2/bed-3/bed-4/aquarium**; map spatial socket names to existing IDs with an explicit scene binding. Never derive gameplay ownership or identity from mesh index, material color or raycast triangle.

## 4. Asset registry and GLB file contract
All current and future models are declared in one registry instead of probing arbitrary file paths. Example SHAPE (not written app schema):

~~~json
{
  "assetId": "agro.garden.bed.standard",
  "source": "models/agro/bed_standard.glb",
  "fallback": "box:3x0.45x1",
  "unitScale": 1,
  "upAxis": "Y",
  "pivot": "bed-center-on-floor",
  "requiredAnchors": [
    "garden.bed-1.slot-1",
    "garden.bed-1.slot-2"
  ],
  "interactionProxy": "bed-1-hit",
  "modelRevision": 1,
  "license": "original-or-verified-license",
  "lod": ["low", "standard", "high"]
}
~~~

This sample is conceptual; before implementation choose stable exact JSON schema, schema version and required geometry nodes. Real bed-1 has capacity **5**, so production manifest must contain all five slots, not merely the two demonstration strings above.

**Every GLB replacement must:**
- maintain canonical origin/scale and every required anchor with documented name/transform; if any anchor moves intentionally, record a migration of scene metadata/camera/collision;
- map known material/animation semantic slots to game phases, not require renderer code rewrite; unsupported optional animation falls back to a safe static pose;
- use valid offline-resolvable external or embedded texture paths, vetted supported glTF extensions, explicit asset license/provenance (CC0, licensed author, or original) with no unreviewed ripped commercial game assets;
- pass automatic glTF structural and budget checks and an Android device smoke test;
- preserve simplified collision/hit proxy shapes independent of intricate decorative mesh;
- fail **closed** for gameplay and **gracefully** for visuals: a corrupt GLB shows an accessible placeholder + message but cannot mint stock, complete a quest or send an unauthorized action.

**Fallback is not file-system polling**. Loader consults versioned manifest once, preloads on entry, caches according to memory rules, and swaps to defined primitive if unavailable. A new GLB dropped into a folder takes effect only after an updated asset registry/versioned build (and packaging), not by magical runtime discovery on offline phones.

## 5. Renderer capability: PBR-ready, performant on Galaxy A55
Required baseline: GLB/glTF loader, normal/UV/tangent materials as provided, physically based roughness/metalness, color spaces and tone mapping, camera/lights/animation playback, raycasting on proxy objects, depth/occlusion, static bake/lightmap-compatible UV sets where used, optional environment reflections and bloom.

**Do not enable costly effects by default** merely because the engine supports them:
- One main light plus local/baked fill before testing multiple dynamic shadow casters.
- Lightmaps for STATIC architecture only; dynamic/animated plants and pets get bounded real-time lighting; test dark/indoor legibility and glass reflections.
- Transparent glass/water depth sorting, water normals and bloom can degrade performance; implement fallback settings and Eco/Balanced/High profiles.
- Culling, instancing repeated plant/shelf meshes, memory bounded asset caches, versioned compression such as KTX2/mesh compression ONLY with bundled decoders and license checks.
- Default benchmark aims for sustained ~30 fps or better at chosen resolution without leaks or alarming heat; this is an acceptance TARGET, not measured actual performance or guarantee. Compare to existing raw WebGL2 scene at equal device/visual complexity. Measure frame-time, load time, memory/context loss, battery/heat qualitative/quantitative where available, low-power device behavior.
- Renderer lifecycle must respond to Android WebView suspend/resume and document visibility. No hidden WebGL frame loop, post-process, PBR update, 3D audio, background LLM or raycast work.

## 6. Raycasting, gestures and HUD
- Use camera projection + actual raycasting toward simplified **semantic hit proxies**, not arbitrary final triangle identity. UI interactions still have accessible DOM alternatives and enlarged hit bounds for phone fingers.
- A physical sign is SMALL in 3D, perspective-correct, with consistent anchor transform; a separate contextual HUD panel may remain DOM-facing for readability, accessibility, safe areas and reduced motion.
- When changing camera/room/viewport, recompute projection and occlusion from same canonical transforms. A sign behind a wall must not be clickable through that wall. Avoid click-through through glass/other rooms.
- Parent scene owns camera/touch state; child models NEVER receive direct engine references or execute game mutations. Race/repeated touch protection via command-id/receipt, pending button state and parent-side checks.
- Stable navigation paths: Global Main Lobby ≠ first-floor five-door Lab Lobby ≠ separate ground-floor three-door Agro Lobby. Specific room/door IDs; no fake UI marking unbuilt buildings as finished. Android back returns to correct previous level.
- Model, camera, audio, HIT and UI anchor alignment must be tested when swapping GLBs, resizing or changing phone orientation.

## 7. One authoritative bridge contract
The view may receive a bounded **read-only snapshot** from the existing trusted parent and request a named action. Input MUST be validated by the parent/original engine, never by a GLB hook, embedded script from an asset or WebGL draw loop.

Expected conceptual sequence:
1. User taps/chooses specific scene anchor (e.g. bed-1 slot-2). The view resolves it to known manifest binding and sends a typed request with operation, actual scene/bed/plant ID, non-reusable local request id and relevant preconditions.
2. Trusted same-origin parent verifies sender frame, active scene, operation allowlist, valid ID and limits, current world/permissions and canonical original game operation.
3. Original TrialumEngine commits its actual mutation **once** (or returns a NO-OP failure) and schedules ordinary save.
4. Parent returns one authoritative result + latest snapshot. Visual renderer triggers one acknowledged result animation. No optimistic stock changes in view and no replay on re-entry.
5. Missing network/GPS/weather/model cannot disable the original Classic and offline canonical gameplay.

**Plant operations** use original source functions in js/plant-lifecycle.js, including E.produceSeedling, E.plantInGarden, E.waterPlant, E.applyAdditive, E.transplantPlant, E.removeDeadPlant, and canonical E.craftAdditive where appropriate. Plants are never created directly through mesh/UI code. Migration and legacy plants retain IDs/growth. Non-plant systems similarly use their own original engine operation; game 3D room may NEVER reimplement food, credits/Trions, AI, chat, etc.

**No fake success:** success animation and stock counter changes ONLY after engine receipt. Receipt is display/event correlation, not security authorization and not a replacement for actual canonical engine validation. A temporary disconnected view can show stale data with a label; it cannot invent a server-confirmed stock.

## 8. Agro scene mapping (3 rooms, immutable data meaning)
- First-floor LAB lobby still owns Basic/DNA/Food Production/Flora Research/Research doors; ground-floor Agro has THREE separately entered rooms.
- Food Warehouse: physical shelving + read-only view of **existing s.foodFactory.stock**. Laboratory production/feeding remain untouched now. Future household food gardens are DIFFERENT and intentionally deferred.
- Big Garden: nursery seedling stock, 4 terrestrial beds ×5 slots each, separate ground-level soil-bottom aquarium ×4 slots; no different 3D capacity. Tiny holographic species signs, phase-linked GLB stage/LOD assets; real health/hydration/wilting/death from original engine, real one-time transplant to already-existing home, no duplicated IDs.
- Small PhytoLab: four already-authorized fictional craftable additives paid from original shared s.elements and stored as s.agro.additives; one per-plant valid care action, no new input store; true receipt-driven output.
- Real local day/night and actual weather via opt-in explicit permission can change the VISUAL atmosphere later; geolocation alone cannot imply rain/wind. No raw GPS in world backups or social server, offline fallback always exists, no unapproved weather-driven plant damage.

## 9. Test/migration/release contract
Minimum automated cases:
- GLB schema corrupt/valid, missing anchors/duplicate ID/bad path/out-of-budget textures, scene registry fallback to primitives;
- same socket transform after placeholder→detailed model substitution; collisions/door/camera and raycast matching;
- 3D→Classic one engine transaction and one receipt; repeated tap, stale scene IDs, future/unbuilt room access, wrong room or dead plant reject with no spending;
- old backups, garden/home plant identity, food stock, social, pet AI opt-in, signed app updates, offline and no-device-location; multi-enter/exit resources disposed;
- renderer hidden → zero active requestAnimationFrame, GL buffers disposed on room close/restore, no double WebView overlay;
- Android Galaxy A55 full landscape/safe area/touch/back/performance and English checks; OWNER PASS distinctly recorded after CI.

A new GLB room, GPU renderer or physical location is **not DONE** when it looks right or passes unit tests alone. It requires exact source commit + tests + signed GitHub QA + OWNER PASS. See [gates](TRIALUM_3D_PHASE_GATES_20261115.md).

## 10. Forbidden shortcuts
- Hard-code every new room as dozens/hundreds of manual box coordinates with no GLB replacement path after B1–B3.
- Rebuild NovaGL2 into full complex engine BEFORE running measured Three.js B1 pilot; remove legacy WebGL2 scenes before verified parity.
- Invent arbitrary GLB name/scale and infer "plug-and-play" when anchors/materials/colliders do not conform.
- Route plant, food, pet, Trion, AI, social or save mutation through renderer/iframe alone.
- Skip B0 or B1 because the prototype currently looks nice, or treat B1 PASS as blanket PASS for all rooms.
- Consume real GPU/AI while hidden, require internet just to load scene, force raw precise location or assume rain from GPS.
- Sign locally, change existing app IDs/Release/FCM signer, merge Draft branches or publish Play without independent authorization.
- Declare missing functionality complete in UI/scene or owner-accepted because CI succeeded.
