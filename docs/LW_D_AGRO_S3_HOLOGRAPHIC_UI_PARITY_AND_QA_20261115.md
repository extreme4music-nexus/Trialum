# Trialum LW-D Agro S3 — original holographic 3D UI, new GLB graphics

**Owner request, 2026-11-15:** "Агро Атриум 3Д ... сега GUI дизајн ленгуич не се совпаѓа со основната 3Д верзија ... холограмот, темата, левата HUD лента треба да си остане, но да смени што прикажува, назад треба да биде таму. Десното HUD холограмско мени. Податоци. Не сакам да изгледа како сосема нова игра. Графиката ја сменивме, но темата и дизајнот не сакам."

## Exactly accepted source and CI

- **Owner review Draft [PR #80](https://github.com/extreme4music-nexus/Trialum/pull/80)**, stacked onto [S2 PR #79](https://github.com/extreme4music-nexus/Trialum/pull/79), NOT merged to `main` and NOT publicly released.
- **Actual compiled source SHA** `5f2e56fddc03f9c3a68b76b69ef6b7002a02964b`.
- [GitHub Actions #230](https://github.com/extreme4music-nexus/Trialum/actions/runs/43750471221): **2/2 jobs SUCCESS**, original B1/S1 graphics, focus freeze, actual S2 navigation, **new S3 original dock/right-hologram UI parity/portal/quality regression**, Android package and permanent original SignQA certificate verified.
- **ONLY installable owner-signed artifact**: [`Trialum-LW-D-AGRO-S3-OWNER-SIGNED-SIGNQA-230`](https://github.com/extreme4music-nexus/Trialum/actions/runs/43750471221/artifacts/14176431790), GitHub artifact ID `14176431790`, ZIP digest SHA256 `3d0dc5fa1cc8c4627b409377cf7a2dec3d69b88eed7d226db7ab02b690da93fa`, expires **2026-11-29**. **Never install unsigned** intermediate artifact ID `14176795532`; this exists for the isolated same-run signing gate only.
- In-place update to `com.trialum.ziivaiskra.signqa` using the same existing QA key. **No uninstall, no clear data, no signing-key change**. Real-device OWNER approval remains **PENDING**.

## Design parity — no separate green/gold game shell

1. **Original left dock** (`.dock`, `.dockbtn`): changes the displayed menu ITEMS contextually on Agro entry to **Назад, Атриум, Магацин, Градина, Фитолаб**. Back is the FIRST existing rail button, not a floating button in the bottom right. Planned room options inspect real scene portal anchors only.
2. **Original right HUD** (`#lw-context` from `live-context.js`) stays in the SAME original frosted mint/cyan holographic UI. It changes the data only to **biomass, molecules, actual planted flora, actual food inventory**, plus three inspect-only doors, Eco/Balanced/High control and Reset camera. Original `#lw-hud-toggle` remains and works. If HUD was hidden, entering Agro shows it; exiting restores original user visibility choice.
3. **Original top resources HUD** (`.lw-quick-stats`) stays above the scene; counts continue to come from the existing game state snapshot. No second reward or inventory system.
4. **New S1 real GLB/PBR atrium** is now only the BACKGROUND RENDER SCENE in a nested same-origin iframe. In `inside3d=1` mode, the detached S1 nameplate, green/gold quality panel, portal buttons, details, debug status and Classic Exit are all HIDDEN. They remain available for standalone S1 engineering tests.
5. `ThreeSceneEngine` only renders the scene and accepts strict, origin-and-source-verified **portal/quality/reset** commands from the original right/left holographic HUD. Only the exact 3 semantic portal IDs are allowed. Child selection events update the same original HUD; no writes to the underlying game engine.
6. **Only one 3D RAF and one 3D audio stream active at a time**: original NovaGL2 stage and inherited spatial soundtrack pause for Agro and resume on return. Background visibility follows authoritative `document.hidden`/parent visibility; `window.blur` from Android quality dropdown **does not** freeze the renderer.
7. Existing Main Lobby/World Atlas routes from S2, Classic, five original laboratories, pets, plants, food, backup, Firebase/FCM, server and all social logic remain unchanged.

## Owner phone acceptance — still open

On Samsung Galaxy A55 install signed APK **over existing SignQA**. Open **Жив Свет 3D → Главно лоби → Агро комплекс** and **Мапа → Агро комплекс**. Verify the original mint/teal holographic LEFT rail, actual Back first, RIGHT existing translucent HUD with authentic world data (not fabricated), top world resources, no detached S1 floating panels, no UI overlay collision. Test 20+ quality changes and Android native select, tap 3 semantic doors (planned only), turn/zoom/reset camera, repeated entry/exit, background/resume, offline, user world and five existing labs, no RAF freezes or duplicate music. Return to the originating 3D HUD/Atlas, NOT Classic. **OWNER must explicitly approve S3 visuals and responsiveness before any next room work.**

**No public release / no merge / no automatic owner PASS from CI.** Documentation-only commits after SHA `5f2e56f` are not part of the signed APK binary.
