# Trialum LW-D S4 — Food Warehouse · owner-approved room and props
**Parent:** existing S3 owner-approved original mint/cyan holographic UI. **Branch:** `feature/lw-d-agro-s4-food-warehouse-room-20261115`.
## Owner approvals and spatial rules (November 15, 2026)
Owner explicitly approved futuristic teal/mint/cream/gold 3D concept renders for Food Warehouse room and **six asset families**, then approved the final populated room concept. These are 2D RENDERS / visual references; they **are not pre-existing 3D mesh files**. We must author actual offline glTF2/GLB geometry matching them; do not rename PNG files as .glb or claim photogrammetry.
- All Agro spaces are inside the building, **SOLID roof with no skylight**. ONLY future Garden will be an **attached greenhouse with glass roof**. The existing atrium should be corrected to the same solid roof in this staged work.
- **Large central doorway = MAIN WAREHOUSE ENTRANCE** leading back to Agro Atrium. Its segmented door panels slide open/close smoothly on approach/tap with safe collision bounds; never alter game progress.
- Other two smaller doorways are future **subrooms**. Do not invent their inventories or simulate completed rooms. Visual detail and labels may be shown; navigation to unfinished subrooms disabled.
- Original premium room design: symmetrical indoor ceiling light bands, wall alcoves, modular nutrient-storage racks, refrigerated capsule lockers, sealed crates/canisters, automated conveyor sorter, holographic stock kiosk, small autonomous carrier robots. Not overcrowded; keep circulation aisle clear.
- **Transporters SMALL** relative to doors: several visible units wander naturally on collision-safe marked lanes, pause at pickup/drop zones, visibly load/unload cargo and take varied deterministic seeded routes. Avoid random teleportation and infinite turn-in-place loops. Movement is **visual/non-authoritative**; real stock totals only from existing world/food game engine.
- Conveyor/escalator belts visibly animate with cargo moving at plausible slow speed; never consume actual game inventory via presentation animation.
- Asset-first workflow: `scene.json`, separately authored and named `.glb` **for shell and each approved object family**, plus `fallback-manifest.json` / real **non-GLB Canvas/Three primitive fallback** with reduced draw calls if GLB unavailable. Fallback must be explicit and tested, not a successful fake “real GLB” state. Do not replace S3 renderer indiscriminately.
- The original Living World top resources HUD, LEFT Back/dock and RIGHT mint holographic context remain ABOVE 3D scene, with room-specific content and actions. Do not create new theme or green/gold independently floating overlays. Same authorized SignQA package and signing key, in-place update; no new Release build.
## Acceptance checkpoints
1. Build/source assets exist in repo and produce valid binary GLB files; exact metadata and CI SHA verified.
2. Browser WebGL2 proof of actual shell + six distinct objects; compare to owner concept renders; proper solid ceiling, center entrance and two subrooms.
3. Actual simulated 3D door animation, several bounded miniature cargo carriers, load/drop phases, moving conveyor; no game-world stock mutation, frame-stall, overlap, crashes.
4. Triggered non-GLB fallback on missing/corrupt GLB (including low-end devices); restored to GLB when supported. No black screen.
5. Real 3D menu route: Agro Atrium > Food Warehouse > Back to Atrium > 3D World; no Classic UI detour or fake first-floor labs.
6. Old B1/S1/S2/S3 original game/FCM/signing/backup tests all PASS; same QA signature, no merge. **OWNER Galaxy A55 quality/interaction PASS separately required.**
