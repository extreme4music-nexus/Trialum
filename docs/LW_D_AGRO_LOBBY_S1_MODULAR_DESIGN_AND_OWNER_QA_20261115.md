> **LATEST SOURCE/CI/SIGNQA — 2026-11-15:** [GitHub Actions #217 SUCCESS 2/2](https://github.com/extreme4music-nexus/Trialum/actions/runs/43736612644); **exact compiled source SHA `f7be2d75d0e15643d41a17b92b3ffa9d5bc3a052`**. Real offline GLB and Chromium S1 18 quality-switches/3 portal selections/screenshots PASS; all inherited B1/Classic/five-lab/FCM regression, Android SignQA package, original existing protected owner QA certificate verification PASS. Original GLB 638880 B (305 nodes, 17 PBR materials, 3 embedded generated textures) SHA256 `2483619df93afa7391e21ee833090b64f3c6b534df1f249afdb007e29446fcb9`. **OWNER-SIGNED** artifact `Trialum-LW-D-AGRO-S1-OWNER-SIGNED-SIGNQA-217`, GitHub artifact ID `14170534624`, expires **2026-11-29**. In ZIP install only `Trialum-LW-D-AGRO-S1-SIGNQA-SIGNED.apk` (10,781,102 B; SHA256 `306ab6c9976a2ae21a41ba9d082ca4f166b4a42bc25f8f27480c2bb777b1829e`). Existing `com.trialum.ziivaiskra.signqa` QA signer unchanged. **NEVER INSTALL unsigned artifact `14170727346`; DO NOT uninstall/clear data.** Chromium screenshots: `Trialum-Agro-S1-Visual-Evidence-217` artifact ID `14171200304`. New scene source is from S1 Draft PR #78; **S1 artistic + Samsung Galaxy A55 real-device OWNER QA still PENDING**, 3 rooms NOT BUILT, no merge/public release. The phone test must validate aesthetic quality, stable High/Eco/Balanced, camera, portal inspect-only and Classic state. Any subsequent commits to this doc are docs-only and not part of APK binary.

# TRIALUM — AGRO LOBBY S1: VERDANT SOLARIUM — MODULAR SCENE-FIRST BUILD
**Date:** 2026-11-15 · **Scope:** NEW GROUND-FLOOR AGRO LOBBY **ONLY**. Three future rooms **NOT built / NOT playable**. Draft [PR #78](https://github.com/extreme4music-nexus/Trialum/pull/78), stacked on stable B1 Draft [PR #76](https://github.com/extreme4music-nexus/Trialum/pull/76).

## Owner's most recent explicit decision (binding)
Owner installed owner-signed B1-R2c **GitHub Actions #208** on actual Samsung Galaxy A55 and stated **"Готово. Операција успешна. Се си работе како што треба. Сега одеме на главното 3Д. Да го градеме лобито и трите соби. Само не брзај се наеднаш да изградеш. Шочни со лобито. Сакам да биде ибаво и eye candy ... Сако одделно од 3д енџи от треба да имаме сценарио. За да коже се да биде модуларно."**
- Treat this as real-device **approval of the B1-R2c responsiveness/stability** and authorization to **START the lobby**, no more B1 focus freezes. No extra video required or repeated owner confirmation of stable graphics.
- Original ADR-005 required a photorealistic visual slice in B1. This new owner request **advances to building a high-quality lobby scene** after engineering stabilized, but does not prove/waive the future **visual finish**: owner artistic evaluation remains explicitly pending.
- Build **one step only**. Do not generate the three full rooms in parallel, or mark official B4–B9 program complete. Any structural B2/B3 infrastructure required for lobby must be minimal, reusable, recorded and owner-validated before broad rollout.

## Architectural intent
- Ground floor **Agro Lobby**, **NOT** global world hub and **NOT** first-floor laboratory lobby.
- New world-space GLB 14m × 18m footprint, ceiling 6.2m, floor Y=0, right-handed/Y-up, 1 unit = 1 meter. Theme: **Verdant Solarium** — light-filled modern botanical atrium, premium terrazzo and limestone, warm timber, fine brushed brass/copper, actual glass skylight, structural ribs and colonnades, decorative planters, living-canopy sculptural centerpiece, soft mint/gold emissive accents and three destination-specific portal finishes.
- Exactly three physical door anchors: `ground.agro.lobby.door-warehouse`, `ground.agro.lobby.door-garden`, `ground.agro.lobby.door-phytolab`. **All doors are PLAN/INSPECT-ONLY**, not actual entrance routes. Taps show a clear "not constructed yet" message. No fake stock, garden, craft, XP or navigation receipts.
- Preserve continuity intent to existing **five first-floor original lab rooms**, but do not claim completed new stair navigation. Classic exit returns to original game with all its working labs.
- Eco/Balanced/High renderer resolution stays 1.6MP / 1920px cap, no synchronous `gl.readPixels`, no parent blur pause, only actual document hidden; stable RAF and touch/pinch. No per-frame procedural lobby geometry.

## Modular contract (scene authored separately from engine)
```
prototypes/lw-d/
  scene-registry.json                   -> registry / asset identity
  three-core/
    scene-registry.mjs                 -> pure schema validation, no DOM/game logic
    scene-runtime.mjs                  -> renderer backend, scene agnostic
    scene-app.mjs                      -> input data wiring/UI actions, never game state
    scene.bundle.js                    -> CI build-generated/offline (not source-committed)
  scenes/agro-lobby/
    scene.json                         -> scene topology/camera/3 portals/authority
    visual-recipe.json                 -> ONLY the visual design palette/architecture
    atrium.glb                         -> CI build-generated real external glTF2/PBR
    lobby.html / lobby.css             -> responsive display
tools/b1/build-agro-lobby.mjs          -> BUILD-ONLY original mesh/texture author
tools/b1/build-agro-bundle.mjs         -> esbuild scene engine + GLB compilation
js/lw-d-agro-lobby-launcher.js        -> isolated Classic host launcher/rollback
```
Only build-time creates architecture from `visual-recipe.json` using deterministic Three geometries and **original generated embedded PNG textures**. Runtime NEVER constructs the atrium from ad-hoc boxes: it only `GLTFLoader` loads the real offline `.glb`, validates unique semantic extras anchors against `scene.json`, places simple click proxies, renders PBR and reads camera/quality settings from manifest. Real-world gameplay actions remain on trusted original Trialum engine, not in GLB or new renderer.

**Original asset provenance:** All forms, textures and designs are newly generated for Trialum (no external ripped textures, paid asset dependency, CDN or remote inference). Three.js and esbuild versions remain pinned, license included from B1 vendor file. Asset-budget controls and future model swaps must keep identical semantic IDs.

## S1 mandatory source/CI gates
1. Build external glTF2 `atrium.glb` and offline `scene.bundle.js`, verify bytes/hash/mesh count, 3 UNIQUE exact world-transform semantic anchors and read-only authority, PBR materials, glass, embedded textures, premium original elements.
2. Real Chromium/WebGL2: loads actual GLB, screenshots on Eco/Balanced/High, 18+ mixed quality changes, 3 planned semantic portal inspect-only taps and Reset camera, RAF remains live. Browser QA is NOT Galaxy A55 proof.
3. Android SignQA build includes full scene manifest, texture-containing GLB, standalone engine, launcher, original B1 + all existing laboratory/food/plant regressions and compatible Firebase setup.
4. GitHub **existing permanent owner SignQA certificate** only; same `com.trialum.ziivaiskra.signqa`, update over existing application WITHOUT uninstall or storage wipe; no local/new signer, no Release/FriendsDebug/public distribution.
5. Draft PR remains unmerged; exact source SHA, run, signed artifact, captures and owner verdict recorded.

## S1 Galaxy A55 owner acceptance (separate from construction of the rooms)
- Open original game, select **🌿 Agro Atrium 3D**, verify scene appearance is attractive, genuinely spatial, physically scaled, not ugly graybox; inspect colors, glazing, texture detail, skylight, tree centerpiece, clear perspective.
- Select all three real portal panels/3D doors. Every door must report **PLANNED**; none may fake a functioning warehouse/garden/phytolab or alter game state.
- Orbit, pinch zoom, camera Reset, 20 quality toggles, switch in/out at least 10 times, hide/resume, offline launch. No blank canvas, RAF freeze, stuck touch, overlay collision, overheating or anomalous resource drain.
- Return to Classic and verify original five first-floor laboratories and original plant/food/pets/backups still behave normally.
- Owner reports visual/functional shortcomings and explicit **S1 PASS** only when satisfied. **No next room until this lobby itself is owner-approved.** After S1, next microstep is refinements, wayfinding, accessibility and exact first-floor route plan, followed by first independent actual new room in separately approved phase. Not three rooms at once.

## Honest status
No generated scene screenshot or CI result is a substitute for owner's Galaxy A55 visual taste, functional approval, or claims of true photorealism. The output is an owner-preview candidate, not an accepted full three-room game. The work is architecturally structured so S2 can swap `atrium.glb` and `visual-recipe.json` without rewriting the scene engine.
