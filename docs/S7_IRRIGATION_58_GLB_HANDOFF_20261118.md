# Trialum S7.8-D — 58 genuine 3D models / complete irrigation hardware library

**Owner request:** Full I01–I06 + C-IRR01 hardware group based on three owner-supplied/conversation-generated visualization boards: tank/pump/filter bank, flexible-hose/fittings/drip kit, and greenhouse with four separately controlled growing beds. Keep visual style aligned with cream-white/sage/chrome/cyan S7 greenhouse. The owner requested immediate `.glb` exports and explicitly asked for honesty about fidelity.

## Fidelity / non-deception
These are **real glTF 2.0 3D geometry files with multiple independently shaded PBR solid components** and mesh-shaped curved hoses. They are an original parametric reconstruction from 2D concept images, **not a literal pixel-exact reverse extraction** of the concept renders, not a photorealistic retopology and not a complete engineering manifold. Some machine housings and screen details are simplified. The accompanying preview `S7_IRRIGATION_8_ACTUAL_GLB_RENDER.png` is rendered from actual exported GLB files; owner 3D visual/device approval is **PENDING**. Keep concept and actual-GLB previews distinct.

## Canonical groups
- **I01 · 4:** primary reservoir, buffer reservoir, low-profile tank, four-bed source manifold.
- **I02 · 7:** industrial/compact pumps, single/double/triple filter banks, four-way distribution and mechanical pressure gauge.
- **I03 · 17:** four straight hose lengths, physical curves 15/30/45/60/90°, two soft arches, S, U, vertical riser, natural sag, offset step and loop. Sweep has genuine 3D radius and watertight caps, discrete curve points with tangents and real connector collars.
- **I04 · 12:** coupler, quick-release, threaded, angled, T, Y, four-way, manual/automated valve, check valve, end-cap and hose clamp.
- **I05 · 9:** drip tubes 0.5,1,2 m, branched tubing, inline/adjustable/stake drippers, triple/five outlet capillary manifolds. These are **drippers**, not sprinklers; visible droplets are decor only.
- **I06 · 7:** water pressure/flow/leak field sensors, replacement coil, technician toolbox, filter cartridge, service wrench.
- **C-IRR01 · 2:** four-zone and compact single-bed control housings. Buttons and status lights are **read-only visual model**, not live executable functions.

## Critical boundary: flexible hose
`GLB` model is a **static snapshot**. Curved GLB bodies genuinely bend in geometry, but user dragging ends in the Builder will NOT dynamically reform them in this release. The manifest includes `controlPoints`, `radius`, `startTangent`, `endTangent`, `corrugated` and names for every swept hose that the future spline editor can use to re-mesh the hose. The editor implementation should use Three.js `CatmullRomCurve3` / `TubeGeometry` or equivalent curve and propagate tangent-defined endpoint connectors, clamps, collision margins and arclength-based UVs. Snapping is not implemented here. Preserve original GLB for reproducibility and visual rollback.

## Game integration contract — future separate approval
Only **four terrestrial real beds G02/G03/G04/G05**; original G01 water pool remains unchanged. Each bed gets a dedicated drip system, unique real status and controller. Connect via original authoritative engine receipt/action API only; no independent plant state, invented stock, phantom simulation, direct save mutation or fake pump toggles. C-IRR01 controls remain disabled/PLANNED until their commands (pump stop, valve status, watering zone, leak repair, additive request) are validated. Never infer real quantities/flows from visual shaders. Real continuous bending, flow animation, collisions and inventory require later code and owner PASS. No Android or Play Store release in this visual asset job.

## Asset provenance and reproducibility
- Source: `tools/b1/build-s7-irrigation.py`; no network, deterministic NumPy and trimesh meshes.
- `assets/irrigation/s7-irrigation-manifest.json` records 58 hashes, shapes, spline control points and `ownerActualGlbPass=false`.
- `assets/irrigation/s7-irrigation-catalog-additions.json`: 58 entries.
- Preview scenes: `projects/trialum-s7-irrigation-*`: nine scenes including one all-58 and one with 4 read-only controllers.
- `tests/s7-irrigation-verify.py`: checks genuine GLB2, SHA-256, no missing 3D assets, watertight per piece, proper 4-bed labels and no false claims about dynamic hose support.
- Ship identical binary SHA-256 to `Trialum-3D-Builder` and the private `Trialum` development branch; no changes to its Classic/main.

**Owner actual GLB review pending.** Do not advertise exact material/geometry match to original photorealistic renders.
