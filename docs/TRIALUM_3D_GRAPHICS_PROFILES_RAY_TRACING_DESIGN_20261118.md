# Trialum 3D graphics profiles / ray tracing capability and diagnostics design
**Date:** 2026-11-18 · Design/handoff only; NOT implemented.

## Owner intention
Three meaningful in-engine graphics modes (LOW, BALANCED existing behavior, HIGH with impressive visuals), switchable during runtime, true hardware RT ONLY on an actually supported rendering backend and device; short one-time HUD notification of selected profile and real status. Advanced diagnostic overlay deep behind settings, hidden by default. Stability, thermal budget and user comfort take priority.

## Critical technical truth
Trialum is currently HTML5/Three.js in Android WebView. Detecting Android GPU RT features is not the same as granting hardware RT in JavaScript WebGL2. The official Three.js `WebGPURenderer` offers a WebGPU renderer with WebGL2 fallback; hardware Vulkan ray-tracing APIs require extensions such as `VK_KHR_acceleration_structure` and `VK_KHR_ray_query` or `VK_KHR_ray_tracing_pipeline`; they do not become available simply because the user chooses HIGH. WebGL rendering cannot automatically dispatch those Vulkan RT pipelines. A native Vulkan path (with feature gating and fallback) could later implement them after a separate feasibility / engineering evaluation; do not invent support on specific phone models.

## Staged user-visible behavior
- **LOW:** lower render resolution, limited shadows, low/medium texture LOD, fewer particles, no costly screen-space reflections or volumetrics, minimum postprocessing, emissive glTF visuals only; power-friendly adaptive frame rate.
- **BALANCED:** preserve and regression-test current renderer (reference stable default) with managed shadows, environment maps/reflection probes, selective postprocessing, sensible LOD and batching.
- **HIGH:** per-device capability and performance test; higher draw scale/texture detail, more shadow cascades (budgeted), better water/glass SSR where supported, environment IBL, physically based materials, selectively enabled bloom/HDR/SSAO and shadowed lights when sufficient; adaptive thermal throttle. Real hardware ray tracing conditional on separately shipped **genuine supported backend**, not simulated by screen-space effects.
- **HUD:** short in-world holo-toast `HIGH · RT: NOT AVAILABLE` or `HIGH · RT: ON` only if proven actual hardware RT, never claim ON for reflections alone; no obstructive dialogs; render settings restored on re-entry.
- **Diagnostics:** `Settings → Advanced → Developer → Graphics diagnostics` default OFF. FPS rolling median, frame time p95, draw calls, triangles, render scale, active mode, WebGL/WebGPU backend, RT capability actual (unknown/no/yes), quality fallback, GL error count and estimated GPU memory only if reliably available. Avoid pretending browser can read exact GPU temperature/RAM metrics; optional Android native bridge with permission and validation later.
- **Safety:** start BALANCED and allow opt-in HIGH, 5-10s performance calibration, lossless fallback to BALANCED/LOW on repeated GPU context loss, high frame times or thermal warning. No user data collection by default; instrumentation local only.

## Integration checks
Identify actual renderer bootstrap and Android WebView version first; create capability matrix per device and real APIs; choose non-RT High improvement as baseline; profile shader/texture memory; benchmark existing canonical G01 waters, soil grid, 24 light assets, robots, plants in 4 corridors. Build automated quality-switch and simulated context loss tests; obtain owner visuals and A55 on-device PASS, then graded rollout. Never alter any gameplay/economic/social simulation to enable graphics.

Documentation: https://threejs.org/manual/pages/webgpurenderer · https://docs.vulkan.org/guide/latest/extensions/ray_tracing.html · https://developer.android.com/games/develop/vulkan/overview
