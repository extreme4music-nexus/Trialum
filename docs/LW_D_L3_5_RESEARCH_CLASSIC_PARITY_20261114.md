# LW-D L3.5 — Fifth (Final) 3D Research Laboratory
**Date:** 2026-11-14 | **Owner:** extreme4music-nexus | **Source branch:** `feature/lw-d-l3-5-research-complete-20261114`
**Base:** OWNER-ACCEPTED DNA Classic parity `fix/lw-d-dna-classic-parity-20261114` (Draft PR #68). All five doors have real 3D rooms. **This document records implementation and QA, NOT a public release authorization.**

## Explicit owner acceptance of immediately prior phase
Owner tested DNA Classic parity and said: **“Супер. Сега е како што треба. Ајде да одиме на последната пета врата. И не заборавај со евиденцијата на документацијата.”** This is an explicit **OWNER PASS for DNA parity** and permission to develop the fifth door. Save this acceptance in previous audit and main recovery pointer as well. It does **not** automatically approve this new Research APK before personal phone testing.

## Research source-of-truth audit BEFORE design
Compared the **actual current Classic Research tab** in `js/longplay-ui.js:research(s)` (which supersedes `js/expansion-ui.js:research(s)`) and the game engines `js/progression.js`, `js/longplay.js`, `js/fauna-lab.js`. Unlike the earlier DNA gap, the fifth door must ship with **all current Classic Research functions in the FIRST 3D release**.

| Current Classic Research capability | L3.5 3D machine | Original authoritative operation / source |
| --- | --- | --- |
| Research level, total knowledge, available lab actions, free research credits | Whole-room hologram/real-world meters | `E.ensureResearch(s)`, `E.labActionLimit(s)`, `s.longplay.credits` |
| Five fields: Molecular Systems, Ecology, Nutrition, Cognition, Fictional Genetics, with individual current knowledge and locked tier details | **Field observatory** | `E.researchFields`, `s.research.fields`, `E.study(s,field)` — original 3 molecules, 5 energy, 1 lab action, Cognition lab 3, Genomics lab 4 |
| Next laboratory tier, name, exact full multi-criterion eligibility checklist, genuinely conditional upgrade | **Technology center** | `E.longplayTier(level+1)`, `E.labRequirements(s,next.level)`, `E.upgradeLab(s)` |
| New fictional Food / Flora / Material / Fauna discoveries, exact gating and costs | **Discovery synthesizer** | `E.longplayInvent(s,kind)`. Base types require lab ≥2, 8 insight, 12 molecules, 1 action; Fauna lab ≥12, selected evolved species ≥7 and level ≥75, 35 insight, 50 molecules, 1 action, original max 75 fauna |
| Every original research material, its discovery gate, stock, +2 production and constraints | **Material archive** | `E.longplayMaterials`, original `s.longplay.materials`, `E.longplayBuildMaterial(s,id)` (12 molecules, 10 biomass, 1 action) |
| Latest 12 fictional discoveries with title, type and day | **Material archive** | `s.longplay.invented.slice(-12).reverse()` |
| Ongoing labs after campaign, no fictional background lab economy | Whole-room progression | Original `E.longplayTier`; no hardcoded final winning tier |

All project-specific descriptions and thresholds above come from the exact app's actual source. The 3D camera does not change time progression, memory, storage, user identities or world economics.

## Implementation
1. `prototypes/lw-d/research-room.js` creates full open-front mobile-friendly spatial institute: metal/glass walls, floor tile pattern, self-lit floating knowledge core, five-research-orb display, technology ascension matrix, discovery ring, physical materials/archive readout. **Four selectable 3D workstations**, responsive touch/pinch/orbit, no background AI, 2.3-second success/failure visuals *only on original engine response*.
2. Fifth `research` corridor door set `ready:true` in `lab-complex.js` and HUD. `world.js` activates the new 3D room, handles four station camera centers, touch-picks and animation only while visible.
3. `TrialumLWBridge.snapshot()` projects **read-only** real field knowledge, laboratory requirements, precise inventory/discovery gates, real selected pet for fauna, all original materials, credits and recent 12 archival records. `researchOperation(op,payload)` delegates exclusively to `E.study`, `E.upgradeLab`, `E.longplayInvent`, `E.longplayBuildMaterial`, and the original `notice(...)` save/sfx path.
4. `js/lw-d-interface.js` validates trusted exact iframe source and origin before handling the tightly whitelisted `trialum:lw:research` request. It returns the engine's authoritative response and synchronizes actual saved world state. Reject unknown fields, nonexistent material, invalid discovery type, stale selected-pet identity for fauna, or actions during restore. No second engine or duplicate rewards.
5. `live-context.js` renders MK/EN translucent **holographic** panels for all five fields, next tier requirements, all four discovery kinds, material production and last 12 invents. Every mutating action requires explicit in-panel Confirm/Cancel, rechecking current eligibility, with a one-in-flight request guard. No native Android system selectors or gray popups.
6. Android SignQA, service worker offline cache and self-contained reviewer HTML all include `research-room.js` in correct script order. No external 3D/download/remote content.
7. New `research-room.test.cjs` + `tests/lw-d-research-parity.test.cjs` cover geometry, responsive station hit testing, all original research paths and precise real engine resource charges, late fauna identity and memory, no native popups, offline package inclusion and unchanged older DNA/Food/Flora/FCM/LW-C/social/backup regression gates.
8. **English** `locales/en.json` extended additively with 65 Research terms/engine errors; accepted exact-key ledger extended from **972 to 1037** keys without deleting previous translations.

## Strict project governance / device contract
- No main game code merge, no beta/Play Console/Release/FriendsDebug changes, no Debian/social backend or Firebase console changes, no new Firebase App ID and no local signing. The existing `com.trialum.ziivaiskra.signqa` remains the ONLY installable build in this lane.
- GitHub Actions uses the same already-configured SignQA Firebase variables and existing permanent owner QA Signing Secrets; validates pinned SHA256 certificate and APK signature.
- Owner must install only the **OWNER-SIGNED-SIGNQA** ZIP artifact as an **in-place update** (never uninstall/reset); its corresponding `UNSIGNED` intermediate is not for installation.
- No new save schema, mirrored research economy, fake scientific discoveries, XP inflation, background simulation or bypassed original achievement/progression system.
- Keep a Draft PR for this branch. **OWNER physical-device QA of L3.5 remains pending** until explicit owner PASS, regardless of CI status.

## Owner acceptance sequence
Enter 3D laboratory corridor → **fifth and final door**. Inspect four workstations, real MK/EN hologram, zoom/touch, confirmed vs canceled research, 5 fields and tier-locked Cognition/Genomics, all upgrade prerequisites, all four discoveries and special fauna's selected pet, original material quantities/production, real resource changes and last 12 archive entries. Navigate to DNA/Food/Flora and verify all previously accepted functions, FCM/social and backup still work.

## Current CI / artifact
To be populated with verified GitHub Actions run ID, exact source commit, signed artifact name, checksum certificate and expiration **only after the workflow reports success**. Do not fabricate success or auto-approve owner device QA.
