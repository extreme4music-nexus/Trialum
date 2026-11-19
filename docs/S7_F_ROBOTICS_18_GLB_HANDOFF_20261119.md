# Trialum S7.8-F — real modular greenhouse machinery, transport and humanoid robotics

**Owner approval:** proceed quickly with the full group in parallel with a 3D concept render and genuine GLB files. Concept visual direction cream / sage / chrome / cyan as REF-03 and new 2026-11-19 board. **Actual optimized-model render is notably simpler than the AI concept.** No claim of owner physical GLB PASS until the owner opens in Builder. These are a base-graphics layer; premium HIGH replacements will be modeled later.

## Real artifact inventory: 18 GLB models

- **E01** tracked excavation vehicle with attached hydraulic boom, stick and bucket; detachable bucket and track module. Animation: `dig`, `inspect`, `idle`.
- **E02** tracked bed soil-preparation/tiller unit with rotating front drum; detached drum and spare tine. Animation: `till`, `idle`.
- **T01** autonomous planter/extractor cart with segmented manipulator and gripper, detached gripper, and empty seedling carrier. Animation: `plant`, `pickup`, `drive` (arm motion; vehicle locomotion is not integrated).
- **T02** flat plant/seedling crate carrier, detachable empty box and flatbed. Animation: `drive`, `brake` (wheel rotations only; no displacement/pathfinding).
- **T03** heavy maintenance carrier, detachable utility crate and hitch. Animation: `drive`, `brake` (wheel rotations only).
- **R01** rigged-by-parented-joints humanoid maintenance/gardener, detachable hand tool and dedicated charging dock. Animation: `idle`, `walk`, `inspect`, `repair`, `carry`, `shutdown`. **Rigid node hierarchy with animation channels, not a skinned bone skeleton.** More natural walk/IK will need engine and owner review.

All separate GLB2 files use Y-up, meter units, PBR metallic/roughness materials, genuine closed solid triangulated meshes. `assets/s7-f/s7-f-manifest.json` records SHA256 checks, counts, bounds, clips. Eight Builder scenes `projects/trialum-s7-f-{all,heroes,machines,transports,robot,tools,g00l-preview,rig-demo}.json` are for visual QA only. The Builder viewer should select GLB `animations` in its existing GLTF playback controls where supported.

### HARD invariants

- All machines start empty. Demo vehicles do **not** create seedlings, consume stock, excavate soil, damage plants, move mature plants or submit real jobs merely from their animation.
- G-00L is the service-side area directly LEFT on entry, not one of the four real growing fingers.
- G02/G03/G04/G05 remain four genuine plant beds × five plants; G01 remains the aquatic hub with four canonical aquatic slots. No new plants or capacities.
- Distinct transport/robot work requires canonical engine job commands, state-machine receipts, obstacle-free navigation, collision-safe bounds and one-time updates to save state. Implement as a **separate engine authorization** after visual QA and signed Android testing.
- HIGH graphical replacements must keep **the same assetId/file path, physical units/anchors, bound envelope, pivots/joint node names, animation clip names and attachment connectors**, so replacement is direct without redesigning placements.
- No change to Classic, engine, APK, Google Play, `main` of game or live user data from this ticket.

### Gate states

- 3D AI concept: rendered 2026-11-19; optimized actual GLB: produced and locally tested.
- Runtime gameplay behavior: **NOT IMPLEMENTED**.
- True pathfinding/rig animation feel on phone: **NOT OWNER TESTED**.
- Before claiming on-device PASS: owner must Pull Builder main, open `🤖 S7-F 18`, inspect assets and play embedded clips. Then, if desired, implement collision/pathfinding and target gameplay via controlled separate branch.
