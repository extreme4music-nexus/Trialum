# LW-D: Living World — isolated first landscape laboratory

**D0 visual direction: OWNER APPROVED; L1 laboratory-room integration: EXPERIMENTAL, not an accepted Android release.**

View locally: from project root run python3 -m http.server 8765 --bind 127.0.0.1,
then open http://127.0.0.1:8765/prototypes/lw-d/world.html

This prototype will show a native WebGL2 3D world in landscape, a compact navigation rail, parameter-driven fictional experiments with a visible outcome and short real-science explanations. All models are fictional, not real experimental procedures.

No saved world imports, no Android manifest changes, no game economy changes, no networking, no AI inference, no user tracking. It MUST NOT be merged as a replacement for index.html before the owner approves the interaction model and real-device testing.

Run test: node --test prototypes/lw-d/sim.test.cjs

See docs/TRIALUM_LIVING_WORLD_VISION_20261114.md and docs/LW_D_DELIVERY_PLAN_20261114.md.

## L1: owner-directed actual laboratory ROOM

The isolated development branch now adds original 3D room geometry, four spatial workstations, touch selection, camera focus and contextual per-station HUD. Source-of-truth laboratory operations still go through the existing engine. L1 is **experimental**, not owner accepted or all laboratories completed. Lab roadmap: docs/LW_D_LABORATORY_SPATIAL_PLAN_20261114.md. The D0 standalone preview remains isolated and its experiment sliders remain illustrative; the live game HUD uses real lab actions.
