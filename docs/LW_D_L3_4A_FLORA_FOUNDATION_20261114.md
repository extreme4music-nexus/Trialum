# LW-D L3.4-A — 3D Flora Laboratory Foundation
Date: November 14, 2026. Source: `feature/lw-d-l3-4a-flora-laboratory-foundation-20261114`, derived from OWNER-PASS L3.3-B. **This is the 3D/read-only foundation slice, not the final flora gameplay integration.**

## User acceptance that authorizes this work

The owner explicitly installed/tested the previous automatically signed L3.3-B APK (#86) and reported: “Прекрасно. Свиѓа ми се многу. Имаш едно Огромно PASS ... биди сигурен дека работе.” Video was unavailable; **no video is necessary for accepting his hands-on testing**. Signed APK evidence in `docs/LW_D_L3_3B_HOLOGRAPHIC_FOOD_ACTIONS_20261114.md`.

## Implemented L3.4-A

1. Fourth physical door `floralab` is open in the preexisting five-door laboratory complex. Research remains the only door still in-development.
2. `prototypes/lw-d/flora-room.js`: fully geometrical 3D greenhouse/laboratory with central slowly animated fictional seed and suspended botanical chamber, lit floor lanes, seed bank, plant analysis machine, growth-pod station and visible existing habitat flora/oxygen indicators; quality tiers `balanced` and `rich`, compatible with established WebGL2 scene meshes/materials. No network assets, rendering engine migration, real science claims or added background work.
3. `prototypes/lw-d/world.js`: separate `floralab` scene, pick targets for three machines, safe zoom/pinch/orbit, back to hall, foreground-only renderer; other DNA and Food 3D navigation preserved.
4. `js/app.js`: **read-only** projections of the genuine canonical `E.PLANTS` (base + research-added plant species), actual `s.blueprints`, selected `E.currentHabitat(s)`, its saved `flora[]` specimen identity and `growth`, existing oxygen/quality/day actions, research tier and elemental stocks. Unlock/progress preview reflects original `E.inventPlant` and `E.plant` requirements. No new mutation, save field or artificial oxygen/XP/resources.
5. `prototypes/lw-d/live-context.js`: translucent MK/EN botanical HUD, custom in-HUD species buttons (no native Android selector), actual model maturity/stock/growth indicators, three station buttons, and explicit **Open Original Flora** fallback for real planting/unlocking. All UI data from the original parent snapshot, not another model. No new write request in L3.4-A.
6. `world.html`, `sw.js`, `android-template/app/build.gradle.kts` and `build_preview.py`: offline/native/PWA/standalone preview all package the same module in correct load order.
7. `flora-room.test.cjs` verifies geometry, touch selection, immutable read-only status, authentic-source mappings, room routing and asset inclusion. Existing DNA, food, LW-C social/AI, FCM and SignQA tests remain mandatory.

## Safety and acceptance

No changes to Codex Release / FriendsDebug, Play Console, production server or database; no new Firebase app registration, keystore, secret, signing certificate or local signing. Only the existing registered `com.trialum.ziivaiskra.signqa` auto-built and auto-signed through the trusted GitHub owner-push lane with existing QA secrets. Preserve all user progress, pet history/memory, original flora, backups, and signed app identity.

Owner phone check: update existing SignQA **without uninstall or clearing any data**; go to 3D lab corridor, enter the **fourth door**, inspect growth pod, tap **seed bank**, **plant analyzer**, **greenhouse**, choose each fictional plant blueprint, compare unlocked/locked states and oxygen/growth/6-specimen capacity to old Classic flora, then return to corridor and existing DNA/food labs. Check saved pets, FCM and friends/AI. **OWNER PASS pending** until explicit tester approval.

**Next only after L3.4-A phone acceptance: L3.4-B** bind real `E.inventPlant` and `E.plant` operations through the existing origin/source-checked parent bridge, with holographic confirm/cancel and response-only animated growth. Original engine alone spends elements/insight and updates habitats. Then L3.5 Research Laboratory. Any future gameplay-logic redesign is its own deliberate migration/testing gate, not a hidden side effect of 3D work.

Canonical rules: `docs/LW_D_CANONICAL_OPERATING_RULES_20261114.md`.

## Real signed Android QA evidence

**[GitHub Actions run #43640163868](https://github.com/extreme4music-nexus/Trialum/actions/runs/43640163868), run #90: SUCCESS.** Source SHA `1f3163cfb9393e4717506a1adeef8876d0c59621` (subsequent docs only).

- LW-D scene tests, authentic flora/plant/habitat state tests, all existing DNA, food, LW-C/Friends, FCM and QA signing regressions: **PASS**.
- Android `:app:assembleSignqa`, existing registered Firebase SignQA client and HTTPS social endpoint compiled and verified: **PASS**.
- GitHub owner-only QA Secret signing, pinned SHA256 certificate, Android signature and artifact upload: **PASS**.
- **INSTALLABLE signed ZIP**: `Trialum-LW-D-L3-4A-OWNER-SIGNED-SIGNQA-90`, artifact id `14132070811`, about 6.45 MB. Inside: `Trialum-LW-D-L3.4A-SIGNQA-SIGNED.apk`, `SHA256SUMS` and `BUILD-INFO.txt`. Artifact expires **2026-11-28**.
- `Trialum-LW-D-L3-4A-SIGNQA-UNSIGNED-90` is **NOT for installation**.
- Source tests, build and signature PASS **do not imply OWNER physical-device PASS** for this version. PR remains Draft, no main/Release/Play merger.
