# TRIALUM LW-D L3.7 — LIVING LABORATORY REACTIONS (SCOPED PROPOSAL)
**Created:** 2026-11-15. **Development branch:** `feature/lw-d-l3-7-laboratory-life-reactions-20261115`.
**Direct predecessor:** L3.6 `feature/lw-d-l3-6-lobby-entry-polish-20261114` / Draft PR #70.
**Owner acceptance:** On 2026-11-15 owner explicitly reported the L3.6 signed phone build already tested, liked, and gave **PASS for the five-door complex skeleton**. That approval does not prove every checklist subtest or authorize a whole-game 3D asset redesign.

## Owner intent / phase boundary
The five-room 3D complex and central-lobby structure are now acceptable as a **working 3D skeleton**. The owner wants a measured next improvement in graphics, animations and **deep connection to existing Trialum life**, BUT explicitly reserves comprehensive new 3D renders/models and fine-grained visual redesign for later, **after the entire game's 3D transformation**. Do not spend this phase remeshing/rebuilding every lab. Preserve shape, flows and existing user-accepted features.

**This phase is intentionally small and additive.** No automatic merge into main, no Codex Release/FriendsDebug/Play changes and no production server/DB/router changes. Owner's real phone QA remains necessary before declaring L3.7 PASS.

## Owner extension — 15 November 2026 (effective NOW)
- **Universal Main Lobby:** not just the lab corridor. Every non-home 3D module enters/returns through Main Lobby. Lab's five doors remain. Existing beta biosphere/flora/research previews and World Atlas are accessible as transitional portals; never claim unfinished 3D scenes are complete.
- **Distinct recognizable room background music** and actual engine-result-specific sound effects. Selected machines act as genuine 3D sources; left/right/distance must follow the real WebGL camera heading, not smartphone compass. Audio settings/mute and consent always win.
- **Audio R&D:** Web Audio API native implementation first; Howler.js and Tone.js MIT optional follow-ons, Kenney CC0 sci-fi sample candidates. Never silently pull music from a CDN or import a file without its license metadata. See [source-verified audio plan](LW_D_L3_7_AUDIO_PLAN_AND_LICENSES_20261115.md).
- **Later, separate proposal:** shared pet town/neighborhood with houses, apartment buildings, park, outdoor playgrounds and map for consenting multi-player pet life. DO NOT build now; see [future city proposal on main](https://github.com/extreme4music-nexus/Trialum/blob/main/docs/TRIALUM_SHARED_MINI_CITY_PROPOSAL_20261115.md).
- Full 3D replacement of ALL models and final music production remain deferred until whole game has 3D skeleton, per owner.

## Next coding step (first implementation slice)
Map the canonical original game engine events and state that each existing 3D room already calls, then implement a **read-only event-to-animation presentation adapter**. Prefer existing engine transaction outputs and canonical state snapshots; avoid an always-running poller or a second game state. The adapter may animate a confirmed event while the respective scene is visible, then stop/cleanup; it must not itself create or award anything.

1. **Main Lobby:** central core and five door indicators subtly reflect **actual** saved science tier, resources and recent *confirmed* room events. No arbitrary fake activity, tokens or pet state.
2. **Basic Lab:** after original chemical/molecular experiment has completed, show a short reaction in the correct machine, with actual success/failure/result feedback; no implied resource gain on failed transaction.
3. **DNA:** visualize the selected REAL pet/lineage or an abstract verified genetic change only after the original trusted parent confirms transformation; no duplicate pet creation or implied new species on a rejected action.
4. **Food:** tanks/conveyor/projection change only for a confirmed batch/recipe or verified stock difference. Respect actual capacity, feeding and consumption.
5. **Flora:** scanner/seed/growth station gives brief success/failure feedback corresponding to the original inventory/growth/oxygen state; no fake instant growth on an unconfirmed command.
6. **Research:** light up only unlocked/confirmed equipment discoveries, tiers, material fabrication, and history changes; no invented upgrades or spend.

## Fidelity/UX constraints
- One authoritative engine/save path; animations are visual reflections of the result **not** mutations, timers giving XP, or a new inventory.
- Every operation is correlated to its actual selected entity/recipe/species/field and one accepted transaction; avoid duplicate visual playback when returning to a room, after resume or after an offline catch-up.
- Correct statuses for loading, pending, success, failure, insufficient resources and lock gates; simple, short, skippable, not loud/flashy/compulsive.
- MK/EN parity, holographic controls, landscape camera/touch on Galaxy A55, graceful no-WebGL/AI-OFF/offline fallback, reduced-motion setting.
- Visible-scene-only render: stop requestAnimationFrame/visual effects when hidden, paused, context lost, or another room is active. No new background AI/LLM, polling or server dependency.
- Use existing scene primitives and material styles; postpone total remodel/new models/new renders until **after whole-game 3D conversion** and future owner direction.
- Retain L3.6 central lobby default and all five original Classic operations, with preservation of progress/pets/pet IDs, local backup, LW-C AI/social, and owner-PASSED FCM.
- Preserve exactly three Android/Firebase app identities. L3.7 builds only as pre-existing `com.trialum.ziivaiskra.signqa` with GitHub Actions automatic owner-key signing. For the new branch, explicitly review the trusted sign workflow branch allowlist before signing; never turn on secret access for untrusted PRs.

## Sequential execution and gates
**A. Audit (first)** — inventory each original engine transaction and callback/confirmation, state source, existing 3D renderer/hologram consumer, and safety invariant. Document parity gaps before modifying a room.

**B. First vertical slice** — build the event-adapter + one complete actual-action-to-3D-confirmed-reaction example in Basic Lab (including failed/locked path, visible/hidden cleanup and repeat idempotence). Run tests before propagating across remaining rooms.

**C. Propagate** — DNA → Food → Flora → Research → subtle Lobby echo; keep all five rooms functional and no duplication of engine logic.

**D. QA** — deterministic tests for real engine calls, success/failure/no-double-spend, restoration/room switches/offline, pointer controls, MK/EN, Android build, L3.6 layout regressions, FCM/LW-C/social/backup regression suites, trusted owner-signed APK verification; document exact successful run/SHA/artifact, then seek explicit owner L3.7 device PASS.

**E. Handoff** — when the complex is accepted at this level, return to the owner-approved whole-3D transformation sequence: **3D biospheres next, then creatures and their homes**. Do not take on a wholesale laboratory remaster instead of advancing the wider 3D skeleton.

**Status:** PHASE PLAN WRITTEN; source coding, CI and L3.7 on-phone acceptance NOT YET DONE. No claim of completed L3.7 just because its branch or plan exists.
