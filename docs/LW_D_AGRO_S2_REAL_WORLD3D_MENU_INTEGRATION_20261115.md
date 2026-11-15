> **SIGNED S2 OWNER QA CANDIDATE — 2026-11-15:** [GitHub Actions #229](https://github.com/extreme4music-nexus/Trialum/actions/runs/43745226480) **both jobs SUCCESS**; exact compiled source SHA `612352f65bb66cf497d82ed5e9d7aa2b98cc6546`. The original B1 WebGL/Android focus regression, real S1 offline GLB/three inspect-only portals, **S2 actual Living World 3D Main Lobby + Atlas → nested GLB → original 3D menu** Chromium navigation test, 3D audio/RAF exclusion, existing original-game regression, Android APK packaging checks and protected original owner QA certificate signing ALL PASS in CI. **New scene bridge missing from an earlier candidate #227 APK was detected and fixed** by Gradle explicit include, with an additional source gate to prevent recurrence; CI #229 verified its presence in the APK. **Install ONLY owner-signed GitHub artifact `Trialum-LW-D-AGRO-S2-OWNER-SIGNED-SIGNQA-229`**, artifact ID **14174541700**, digest `sha256:888fe2054dae351d0b786bc7f1fb565a522ac10200995e1cd40135a76cfdfd93`, expires **2026-11-29**; [direct artifact](https://github.com/extreme4music-nexus/Trialum/actions/runs/43745226480/artifacts/14174541700). ZIP contains owner-signed SignQA APK. **DO NOT INSTALL UNSIGNED artifact `14174261373`**. Same `com.trialum.ziivaiskra.signqa`, original QA certificate / Firebase; update in-place, no uninstall/clear data. PR #79 is still DRAFT, no merge or production release; **Galaxy A55 OWNER device/menu/visual acceptance remains PENDING**, three rooms remain planned/unbuilt. No new source changes after exact compiled SHA before this documentation-only status update.

# Trialum LW-D — Agro Atrium S2: real Living World 3D menu integration

**Owner directive · 2026-11-15:** "Агро Аатрум 3Д се преместива во Жив Свет 3Д. Б1 ГЛП ПИЛОТ СЕ ТРГА ... не да го преместиш само, туку да го вдзеш убаво според самата игра внатре. Значи лобито да го врзеш според менито. ... пази да не направеш некоја глупост".

**Workstream:** stacked Draft [PR #79](https://github.com/extreme4music-nexus/Trialum/pull/79) based on [S1 PR #78](https://github.com/extreme4music-nexus/Trialum/pull/78), itself based on [stable B1 PR #76](https://github.com/extreme4music-nexus/Trialum/pull/76). Do NOT merge branches/public release until OWNER phone verifies new 3D navigation, stability, original gameplay and audio.

## Exact user-visible hierarchy
Classic retains one official 3D entry: **✦ Жив Свет · 3D**.
Inside its *existing* iframe `prototypes/lw-d/world.html?live=1`:
- **Главно лоби / Main Lobby**: existing HUD card **🌿 Агро комплекс · 3D**, pointing at real `trialum.ground.agro.lobby`.
- **Мапа на светот / World Atlas**: independent **Агро комплекс / Agro Complex** group, with live atrium scene entry and three honest pending destinations (food warehouse, garden, PhytoLab). Also available directly under main/production navigational categories.
- **Градина / Garden** existing HUD page links to the actual Agro Atrium and original authentic plants tab separately. No fake live garden gameplay.
- In Agro, `lobby.html?hosted=1&inside3d=1&language=mk|en` loads real offline external GLB/PBR via the existing S1 generic ThreeSceneEngine, 3 semantic doors stay **planned / inspect-only**.
- A single parent-owned, Android-safe **← Жив Свет 3D** button returns to the exact source **3D Main Lobby or 3D Atlas**, NOT Classic or a second top-level app.
- Main/Atlas labels and nested scene are MK/EN localized while preserving stable `sceneId` and portal IDs.

## Explicitly retired without destroying proven engineering
- Removed **`js/lw-d-b1-pilot-launcher.js`** and **`js/lw-d-agro-lobby-launcher.js`** script includes from Classic `index.html`. No separate masthead buttons **B1 GLB Pilot** or **Agro Atrium 3D**.
- Kept the B1 pilot source/asset/test files and old launcher implementation *unloaded* in Git for internal regression evidence only. Do not surface them as public game navigation or remove proven B1 stability tests.
- PWA cache version incremented so old cached Classic toolbar does not reintroduce dead pilot buttons. Optional offline cache references the NEW inner `agro-scene-bridge.js`.
- No parallel simulation, reward calculations, inventory, pet, research, FCM, social, storage or backup writes in the new scene.

## GPU, audio and lifecycle safety
- Original Living World WebGL2 stage and spatial-audio stream receive the transient `trialum:lw:agro:overlay` flag, pause while the new Three GLB scene is foreground, resume on exit only while visible. Keep the unchanged original engine state alive.
- Real hidden/page lifecycle and trusted `trialum:lw:visibility` forwarded into nested GLB; **do not use native Android select `window.blur` as invisibility**, because it froze B1 RAF in #200.
- Allow only canonical menu event `trialum:lw:agro-lobby` with exact scene ID; nested postMessage validates both **origin and iframe source**. No top-level Classic bridge action is granted to the inner GLB.
- Child `trialum:agro:dispose` issued before removing nested iframe, allowing WebGL resource disposal. Menu is restored using the real HUD and existing Atlas, not a replica or fake game menu.
- In-place SignQA update only: original `com.trialum.ziivaiskra.signqa`, existing permanent QA GitHub signer and same Firebase configuration. **Never uninstall or clear game data**.

## Mandatory proof before owner phone test
1. Existing B1 offline real GLB/semantic/R2c focus regressions must PASS.
2. S1 real atrium GLB, PBR texture, three planned portal tests and 18+ quality-change Chromium test PASS.
3. S2 source tests: Classic has NO separate pilot launchers, 3D HUD and Atlas route to same scene, original five labs intact, original WebGL2 and spatial audio paused in Agro, backward navigation restores exact 3D menu, still no gameplay writes.
4. **New real Chromium integration test** opens existing `world.html?live=1` inside a real parent document, navigates from actual 3D HUD into real nested GLB and returns, repeats from 3D Atlas, checks on-screen quality mode cycling, audio suspension, and no unbuilt room entry.
5. Android QA build must package **`prototypes/lw-d/agro-scene-bridge.js`** and original S1 offline GLB/scene assets; permanent QA signing and pinned cert checked by GitHub.
6. Real **Samsung Galaxy A55** owner checks menu access, graphics, 20+ Eco/Balanced/High switches, touches/camera, back nav to **3D** (not Classic), offline, 3D audio, original five labs, pets/food/flora/saves, no black/frozen scene or app data loss. Only OWNER can declare S2 PASS.

**Status:** source integrated on Draft PR #79. CI currently under verification; no claim of signed or device PASS until exact workflow run completed. Three Agro rooms NOT BUILT. Owner's design approval of the existing S1 atrium look remains separate.
