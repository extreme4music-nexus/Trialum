# LW-D L3.3-B — Holographic Food UI + Actual Food Gameplay (2026-11-14)

Status: implementation committed, owner on-phone acceptance pending. Source branch: `feature/lw-d-l3-3b-holographic-food-actions-20261114`, based strictly on previous L3.3-A food-room branch. No changes in Codex Release/FriendsDebug, beta repo, Play Console, production database, Firebase/App ID, keystore, server or saved-game schema.

## Source evidence: owner's phone video

`Screen_Recording_20261114_212251_Trialum Signing QA.mp4` (38.31 sec, landscape 2340x1080). It shows the third 3D food room working and the recipe `<select>` opening a large **opaque grey Android/WebView-native list over the room**. The visual issue is **not** missing recipes, FCM, shader or engine; it is native HTML popup ownership. Requirement: all interactive food selections and confirmations should stay inside the translucent holographic HUD. The user explicitly reported the food lab is otherwise excellent and asked for this fix plus animations and gameplay binding.

## Changes

1. **Popup eliminated at source:** `prototypes/lw-d/live-context.js` uses a clickable in-panel recipe picker (six existing recipes, icon, stock, active state) rather than `make("select")`. The options live in a scrollable frosted glass panel, with accessible `aria-pressed`, reduced-motion handling and CSS sized for phone landscape. No Android system dropdown over the scene.
2. **Holographic consent:** clicking Craft or Feed displays an in-HUD, translucent confirmation with Cancel/Confirm. Cancel does **nothing** to the game world. Disabled unless the last authoritative snapshot says the actual recipe is eligible. A client-side `foodPending` latch prevents repeated taps and clears after the parent game result.
3. **Authoritative game engine operations:** parent game `js/app.js` adds narrow `TrialumLWBridge.foodOperation(kind,payload)`. Only `craft` / `feed`; strict original recipe IDs; feed must match currently selected saved pet ID. The actual work delegates to unmodified `E.craftFood` and `E.feedPrepared`. Existing engine alone checks lab tier, resources, stocks, per-pet actions, pet compatibility and evolution bonus; `notice(result,...)` invokes original render/save path. 3D does not track a second economy or pet identity.
4. **Origin-bound iframe link:** `js/lw-d-interface.js` accepts the `trialum:lw:food` event **only from the active trusted same-origin 3D iframe**; returns `trialum:lw:food-result` with success/failure and before/after food/resource metrics. The updated snapshot goes back immediately. The HUD shows a short success/fail message.
5. **Actual-result animations:** `prototypes/lw-d/food-room.js` gets a 2.2-second energy-particle orbit and illuminated nutrient vessel. Green/mint on actual engine success, red on failure, associated with craft/feed station only after parent result. Effects are transient render-only data; they never produce rewards, duplicate inventory or run after user closes/pauses the world.
6. **Regression gates:** `tests/lw-d-food-actions.test.cjs` checks same-origin action whitelist, picker/no-native-select, inline cancel, pending deduplication, original engine craft cost and inventory change, feed cost/selected-pet identity, incompatible recipe refusal, effect timing; original `tests/progression.test.cjs` and all LW-C/FCM/DNA tests stay in SignQA CI.

## Phone acceptance

Install only the owner-signed `com.trialum.ziivaiskra.signqa` as an in-place update. No uninstall/reset. Open 3D > corridor > third door (Food Lab). Pick synthesis machine; tap recipe, confirm **frosted holographic list instead of grey Android dropdown**; choose a recipe. Select Craft, hit Cancel and verify no stock/resources deducted. Confirm Craft only on expendable test resources; verify real `biomass`/`compounds`/`labActions` deduction and new portions; see a 2.2s green machine animation. Select nutrition-analysis machine, pick a compatible stored recipe and Feed; verify current pet loses exactly one action and one stock portion, receives the existing original-game benefits and keeps its ID and memory. Check insufficient resources, no selected pet, incompatible recipe and failure visual. Verify camera, corridor, DNA, backup, LW-C dialogues, friends and FCM still work. Do not mark OWNER PASS from CI alone.

## Build rules

Keep the exact existing GitHub owner-only auto-signing workflow with `TRIALUM_FIREBASE_APP_ID_SIGNQA`, existing QA Secrets and pinned QA certificate. **No local signing or new Firebase App ID**. Signed artifact only from owner-push CI. PR stays Draft until user acceptance. Next stage L3.3-C is optional scene/game-feedback refinement; L3.4 Flora Lab only after owner accepts this slice.

## Confirmed first GitHub auto-signed Android QA evidence

**[Actions run #43637880435](https://github.com/extreme4music-nexus/Trialum/actions/runs/43637880435), run number 86: BUILD PASS + AUTO SIGN PASS.** Android/tested source SHA `0f60bf32c3734a55d409a3b3e80e9c3209733ad3`; documentation edits after this do not change the shipped JS/native source.

- Source test pipeline: holographic recipe picker/no native food select, original food engine craft/feed costs, fake/canceled operations, stale selected pet guard, green/red 2.2s visual pulse, existing DNA/LW-C/social/FCM regressions and JS syntax all PASS.
- Android `:app:assembleSignqa`, existing package `com.trialum.ziivaiskra.signqa`, registered Firebase App ID/HTTPS resources and assets PASS.
- Protected GitHub signing with existing permanent QA Secrets, existing `trialum-qa` alias, v2/v3 and pinned certificate SHA256 PASS.
- **INSTALLABLE signed ZIP**: `Trialum-LW-D-L3-3B-OWNER-SIGNED-SIGNQA-86` (artifact id `14130687625`, ~6.44 MB). Contains `Trialum-LW-D-L3.3B-SIGNQA-SIGNED.apk`, checksums and build-info; expires **2026-11-28**. The separate `Trialum-LW-D-L3-3B-SIGNQA-UNSIGNED-86` is not for installation.
- **Owner physical device acceptance PENDING**; green CI proves source and packaged build, not touch responsiveness/visual quality or live FCM reception on this particular APK.

Keep PR in Draft and do not merge into main or Codex beta. This slice requires an owner phone check, not a newly recorded video if the owner has already inspected UI in person.

## Owner phone acceptance — 2026-11-14

**OWNER PASS (explicit, strong):** Following install and hands-on testing of the signed L3.3-B SignQA app (#86), the owner wrote: “Другар. Прекрасно. Свиѓа ми се многу. Имаш едно Огромно PASS од мене. Ајде одеме напред. Не сум у можност да снимам видео сега, али биди согурен дека работе и многу ми се свиѓа.” This accepts L3.3-B and authorizes beginning L3.4-A. Video unavailable is not a blocker; no new video or screenshot is falsely claimed. Acceptance does not authorize public beta/Play release or merging into Codex Release/FriendsDebug; retain those boundaries and all existing Firebase/SignQA secrets.
