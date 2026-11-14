# LW-D L3.2-A — 3D DNA ROOM FOUNDATION (working slice, 14 Nov 2026)

**Scope**: one contained DNA laboratory foundation slice, NOT finished full DNA gameplay. Development branch `feature/lw-d-l3-2a-dna-foundation-20261114`, based on owner-FCM-PASS `fix/lw-d-fcm-lwd1-20261114`. No main, Codex Release, FriendsDebug, Play Console, servers, DB or stored saves edited. Read [LW_D_CANONICAL_OPERATING_RULES_20261114.md](LW_D_CANONICAL_OPERATING_RULES_20261114.md).

## Owner's long-term visual reference

Owner supplied a futuristic large blue-white laboratory with prominent central suspended DNA chamber, layered depth, multiple work benches and bright lighting. **This is an aspiration, not a request to match that image today.** Architecture/geometry/material reuse/lighting/camera/navigation come first; no photorealism promise. Keep original designs, mobile performance and visible progress for owner testing.

## This actual implementation

1. `prototypes/lw-d/dna-room.js` — wholly new procedural WebGL2 room with real floor, cutaway walls, lighting, central animated fictional DNA double helix and three machine stations: genome scanner, fictional gene design, evolution lineage. Only one shared drawing API, cube/sphere meshes and existing materials, no new heavy engine, remote assets, storage or background AI.
2. `lab-complex.js` — original five-door corridor is preserved. DNA becomes its SECOND real 3D entrance; food, flora and research stay visibly in development with their existing classic fallbacks.
3. `world.js` — enter/exit DNA space, select stations via 3D picks or HUD, safe camera focus/orbit/pinch, foreground-only rendering and clear back-to-corridor. Original basic laboratory and resource actions unchanged. WebGL2 failure falls back to original Classic DNA navigation.
4. `js/app.js` — read-only projection of `s.research.level` and `E.evolutionProgress(selectedPet).level`. Designer unlock mirrors existing Classic DNA condition: laboratory level >= 6 and selected pet evolution level >= 22. **No new genemod mutation route, action cost, XP, pet IDs, world copy or save field.** The actual DNA editor remains in `expansion-ui.js`/`E.editFictionalGenes`; transformations remain in `longplay-ui.js`/`E.longplayTransform`.
5. `live-context.js` — bilingual status and station selection with distinct feedback for locked/unlocked designer; explicit **Open original DNA controls** button remains usable. No new DNA action is falsely marked ready.
6. `world.html`, `sw.js`, `android-template/app/build.gradle.kts`, `build_preview.py` — package the exact same DNA scene for Android offline, PWA and standalone visual preview.
7. `dna-room.test.cjs`, old corridor tests and existing full LW-C/FCM regression tests guard geometry, camera projection, source-of-truth and packaging.

## What is NOT delivered yet

- No in-room direct DNA mutation; opening the existing Classic DNA controls is intentional. L3.2-B later binds selected existing approved commands and their success/failure animations to actual stations without duplicating mechanics.
- No physically accurate, luminous real glass, real genomics science or photorealistic materials. The DNA helix is fictional game visualization.
- No new pets, tokens, resources or simulated generations.
- No independent authorization for beta/Play Console/public release.

## Release/acceptance

The isolated LW-D `.github/workflows/lw-d-android-qa.yml` is extended to include this exact phase branch in the trusted owner-push SignQA allowlist. Builds **ONLY** `:app:assembleSignqa`, embeds the **already registered** `TRIALUM_FIREBASE_APP_ID_SIGNQA` and HTTPS Friends endpoint, reuses existing `TRIALUM_QA_KEYSTORE_B64`, store/key password Secrets, `trialum-qa` and pinned `TRIALUM_QA_CERT_SHA256`. It auto-signs the internal QA APK on GitHub; owner does NOT sign locally. Every pull request run stays unsigned/no secrets. The Codex Release/FriendsDebug workflows remain untouched.

Before OWNER PASS: CI must prove source tests, Android build, package/Firebase resources, signed certificate and artifact. Owner then checks 3D DNA door/room, camera, 3 stations, locked status and direct Classic DNA button, return to corridor, basic lab and social/AI preservation, FCM maintained, old backup unchanged.

**Next only after owner tests L3.2-A:** L3.2-B existing-DNA-controller actions (not separate engine), then L3.2-C mobile visuals/performance. L3.3 Food-production 3D room after the DNA slice gate. FCM already owner-accepted 2026-11-14; never reopen Firebase setup without evidence of regression.
