# TRIALUM — B1 THREE.JS / GLB PILOT TEST PROTOCOL (PREPARED IN B0; NOT IMPLEMENTED)
**Owner mandate:** 2026-11-15 · **Current gate:** B0, owner approval PENDING. This is a TEST PROTOCOL ONLY: zero B1 renderer/model source committed by this plan, no FPS measurements have been made.

**Binding references:** [main B0–B9 master](https://github.com/extreme4music-nexus/Trialum/blob/main/docs/TRIALUM_3D_WORLD_MASTER_PLAN_B0_B9_20261115.md), [GLB & scene contract](https://github.com/extreme4music-nexus/Trialum/blob/main/docs/TRIALUM_3D_ASSET_SCENE_CONTRACT_20261115.md), [ADR-004](https://github.com/extreme4music-nexus/Trialum/blob/main/docs/ADR_004_GLTF_FIRST_THREEJS_PILOT_20261115.md), [owner gates](https://github.com/extreme4music-nexus/Trialum/blob/main/docs/TRIALUM_3D_PHASE_GATES_20261115.md), [B0 locked original-source snapshot](TRIALUM_B0_PROTECTED_SOURCE_LOCK_20261115.json).

## 1. Exact research question
Can a **bundled, offline Three.js + GLTFLoader WebGL2** renderer load an external GLB architectural graybox with semantic anchors and mobile interactions on the owner's **Samsung Galaxy A55**, without measurable stability/battery/UX regression compared with the old custom raw-WebGL2/NovaGL2 viewer?

B1 is **not** approval of Three.js as permanent renderer. The owner chooses GO / REWORK / NO-GO only after real phone evidence. The older renderer and original game remain available regardless of result.

## 2. Proposed single-room graybox (nothing else in B1)
A standalone ~6×6 m room with:
- 1 floor, 4 walls and 1 ~2.2 m door, all generated **in an offline GLB** (not hundreds of JS box draw calls);
- 1 simple table and 2 named child anchor/socket nodes, test identifiers \`pilot.table.action-1\`, \`pilot.door.exit\`;
- declarative scene definition, measurable origin, Y-up and scale=1 m/unit, stable room/camera focus;
- static GLB materials compatible with basic physically based shading, one primary light and one optional room ambient/lightmap path;
- one simplified collision/hit proxy for table and one for door, consistent across GLB swaps;
- one safe HUD or accessibility panel showing the selected anchor and real scene ID; no independent plant/food/pet inventory mutation;
- local-only GLB file + pinned Three.js/GLTFLoader license/commit/version in the existing APK web assets. **No third-party CDN, runtime model fetch, LLM or external telemetry**;
- a built-in intentionally missing/corrupt-asset case that renders a simple safe placeholder without faking a gameplay transaction;
- comparison toggle for TEST ONLY, with only one WebGL scene/RAF active at a time. Don't attempt to render both backends in parallel.

## 3. Repeatable device measurement procedure
**Owner phone:** Galaxy A55, record Android/One UI version as displayed; original signed SignQA package remains in place and its world is NOT cleared.

**Comparable conditions:** same scene/window size, landscape orientation, phone brightness, approximate device temperature, power-saving mode, charger state, network state, screen scaling and number of background apps. Take repeated tests, not one lucky frame. If user tests while plugged in vs unplugged, keep them separate.

**Collect device-visible metrics only, with user consent:**
- startup to first fully visible room (ms) and first successful touch (ms);
- requestAnimationFrame delta sampled locally, median/P95/P99 frame time, approximate average FPS over actual active samples; distinguish CPU JS time from total GPU workload;
- touch/picking response and mistaken/missed target count on 10 taps per anchor, back/gesture/two-finger camera behavior, accessible HUD and safe areas;
- canvas render size / pixel density and active quality tier; memory estimate only if supported by actual Android diagnostics, NOT invented heap number;
- repeated 10 or more enter/exit sequences for leaks; lost/recovered WebGL context via test hook if supported; whether a duplicate canvas/RAF persists;
- hidden/foreground behavior, Android back/home/reopen, lock/unlock where available; no invisible RAF, PBR work, spatial audio or AI;
- qualitative battery consumption and device warmth through consistent observation, actual temperature/energy values ONLY when instrumented (never infer from appearance);
- Classic gameplay still fully works in offline/airplane mode with the current original save, including plants and food; pilot does not generate or save any new model-generated plant.

**Initial non-final comparison target:** approximately 30 stable FPS on A55, no serious touch lag, no persistent heat, no memory leak, no hidden GPU loop; owner may adjust acceptable frame-time/visual profile after baseline real measurements. This is NOT a claimed observed result.

## 4. Test matrix (B1 scoped, future automated cases)
| Test ID | Action | Required outcome |
| --- | --- | --- |
| B1-G01 | Load bundled GLB while fully offline | Real room geometry appears; no CDN and no fake ready status |
| B1-G02 | Replace gray GLB with valid different-detailed mesh honoring anchors | Same camera/door/table semantic positions without changing game engine code |
| B1-G03 | Remove/rename GLB asset from test packaging | Safe fallback geometry & readable error; no app crash or fake receipt |
| B1-G04 | Malformed GLB / missing mandatory anchor | Model rejected as nonconforming; fallback and log with no state mutation |
| B1-G05 | Test both anchors with touch | Exact named target selected, no out-of-room click-through; accessible HUD |
| B1-G06 | Open Classic Flora/food tabs | Original source reads exact same state and stock as before |
| B1-G07 | Close view / Home / background / return | Hidden scene stops RAF/graphics/audio; later return restores or safe fallback |
| B1-G08 | Resize/rotate within supported orientations; safe area & Android Back | Camera/HUD doesn't overlap and app navigation works |
| B1-G09 | Re-enter room ≥10 times | No accumulating scene objects, unmanaged WebGL resources or duplicated controls |
| B1-G10 | Device with reduced-motion/Eco option | Expensive effects off and interactions still functional |
| B1-G11 | Compare against old WebGL2 custom baseline | Real measured median/P95 frame, visual usability, load and battery notes documented |
| B1-G12 | Attempt to send fake plant/resource action through GLB/iframe | Parent denies unknown action; no wallet/plant/reward mutation |
| B1-G13 | SignQA in-place update over same existing package (ONLY if new B1 APK accepted for testing) | Existing world/pets/backup remain; existing permanent QA key matches |

## 5. Go/no-go and fallback decisions
- **GO** only after actual CI, signed existing SignQA APK, original-engine regressions and explicit OWNER PASS on tested phone. Then B2 asset registry/export validator, not Agro Lobby immediately.
- **REWORK** if PBR/GLB works but battery, draw loop, picking, model size, lighting or context handling needs isolation.
- **NO-GO** if measured new renderer cannot meet reasonable mobile stability or lacks critical functionality after repairs. Retain original custom WebGL2 and consider scoped NovaGL2 improvements without pretending Three.js was accepted.
- **DATA SAFETY always wins:** a failed pilot MUST NOT modify original save, app ID, signer, Firebase data, friends or plant economy. Do not force user data wipe or app reinstall.
- Do not copy unknown models from commercial games; all temporary assets must have verified provenance/license (AI-generated originals or properly licensed CC0 candidates).

## 6. Owner acceptance record (to fill AFTER actual B1 pilot, leave blank now)
- B0 predecessor owner PASS evidence:
- New B1 source branch / commit / PR:
- GitHub Actions ID / build/signer evidence:
- Real Galaxy A55 Android version, mode and app install:
- Old renderer measurements (samples, method):
- New Three.js renderer measurements (samples, method):
- Correct GLB anchors and fallback test:
- Offline / back / hidden scene / memory outcomes:
- Original plants/food/social/save regressions:
- Known issues and rollback:
- Owner verdict: **PENDING**; cannot be set by CI.

No benchmark numbers, new GLB renders, Android package or OWNER PASS have been created in B0 by this preparatory protocol.
