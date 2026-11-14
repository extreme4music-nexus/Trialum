# LW-D L3.3-A — Nutrition Laboratory Foundation
Date: 2026-11-14 | Scope: independent LW-D SignQA internal testing.

## Acceptance carried forward
Owner explicitly tested and accepted L3.2-C on a physical phone and authorized development to continue. Prior FCM and Github auto-signing setup are canonical; see `docs/LW_D_CANONICAL_OPERATING_RULES_20261114.md`. No changes to Codex-managed official Release or Friends Debug, Play Console, Debian, or persistent game data.

## Implemented foundation slice
1. **Real procedural WebGL2 3D food laboratory**, entered through door 3 (foodlab) in the existing five-door corridor. Distinct room architecture with modular floor, wall and ceiling-light components, central nutrient mixing chamber and three stations: synthesis, nutrition analysis and portion storage.
2. **Touch selection, safe zoom/orbit and return** to corridor. Same scene engine, materials and meshes as previously accepted DNA lab. No heavy alpha/glass/refraction; no new graphics runtime.
3. **Read-only authoritative food projection:** the existing `E.foodRecipes` (all six recipes), actual `s.foodFactory.stock`, `s.research.level`, `E.feedCompatible`, selected pet, available lab actions, compounds and biomass. The 3D HUD shows recipe tier, costs, stock, projected readiness/compatibility and inventory. It never creates imaginary stock or resources.
4. **MK/EN 3D HUD**, recipe selection and three station buttons. One explicit button opens the *existing* fully functional Classic `food` tab for actual production and feeding; this is intentionally the only write path in L3.3-A. No engine duplication or new save fields.
5. Web and offline packaging: `prototypes/lw-d/food-room.js` included in HTML, Android WebView, PWA precache and standalone review preview. Other scene modules intact.
6. Automated tests: geometry and station tap projection, unchanged original food model and read-only API, third real corridor door, Classic fallback, packaged assets. All existing LW-C/LW-D DNA, FCM and GitHub QA-signature regressions remain mandatory.

## Next L3.3-B (NOT included in this slice)
Use *only* existing original `E.craftFood` / `E.feedPrepared` through the authenticated parent WebView bridge. Require explicit user confirmation, do not duplicate stock/cost/feeding logic, protect selected pet identity and action count, show real success/failure animation and engine-authoritative UI refresh. No separate food economy or action worker.

## Owner test before closing L3.3-A
Download the **owner-signed** SignQA artifact from the successful current LW-D workflow (not its unsigned intermediate). Install/update `com.trialum.ziivaiskra.signqa` **in place**; no uninstall or clear data. Open Living World 3D → Laboratory complex → third door Food Lab. Confirm new room, central mixing vessel, touch selection of all three stations, scroll/view six recipe costs/stock/unlock status, Classic food fallback, safe camera and return to DNA and basic labs. Verify existing saved pets/food inventory, AI/social, FCM and backup unchanged.

## Signing and merge gate
No fourth Firebase app, local signing, new secrets or signing key. GitHub Actions compiles only `:app:assembleSignqa` with existing `TRIALUM_FIREBASE_APP_ID_SIGNQA`, signs automatically with the existing pinned `trialum-qa` QA certificate on the explicitly allowed trusted branch and uploads ready-to-install internal QA APK. PR stays draft until the owner confirms real-device behavior; no merge/public distribution without owner approval.

## CI evidence — signed Android SignQA ready

**[GitHub Actions #43636510135](https://github.com/extreme4music-nexus/Trialum/actions/runs/43636510135), run number 84 — BUILD PASS, AUTO SIGN PASS.** Source commit `9ecf7a2dd35065b019bc47c413aa64b9b1b5a08c`; subsequent documentation updates are not included in this source APK.

- All LW-D food-room/geometry/inventory/package regression tests, previous DNA and FCM/LW-C guards: **PASS**.
- Android `:app:assembleSignqa` with existing registered `TRIALUM_FIREBASE_APP_ID_SIGNQA`, compiled social URL/resources: **PASS**.
- Protected owner-push GitHub job reused existing `TRIALUM_QA_*` Secrets and pinned certificate SHA256; signature v2/v3 and artifact upload: **PASS**.
- **INSTALLABLE signed artifact:** `Trialum-LW-D-L3-3A-OWNER-SIGNED-SIGNQA-84` (artifact id `14130545175`, ~6.44 MB), available from the run Artifacts until **2026-11-28**. Inside ZIP: `Trialum-LW-D-L3.3A-SIGNQA-SIGNED.apk`, `SHA256SUMS`, `BUILD-INFO.txt`.
- The separate `Trialum-LW-D-L3-3A-SIGNQA-UNSIGNED-84` artifact must **NOT** be installed.
- Real owner phone test of the Food Room remains **PENDING**, not inferred from green CI. This is an internal SignQA app, not a public release.
